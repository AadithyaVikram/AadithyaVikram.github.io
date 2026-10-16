"""Fetch public posts for one authorized LinkedIn member; never scrape visitor-side.

Requires an approved r_member_social token. No credentials are saved or printed.
"""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DATA_PATH = Path(__file__).resolve().parents[1] / 'assets' / 'linkedin-updates.json'


def normalize_posts(elements, author):
    posts = []
    for item in elements:
        # Exclude other authors, reshares, unpublished and non-public posts.
        if (item.get('author') != author or item.get('lifecycleState') != 'PUBLISHED'
                or item.get('visibility') != 'PUBLIC' or item.get('reshareContext')):
            continue
        urn = item.get('id', '')
        if not re.fullmatch(r'urn:li:(share|ugcPost):\d+', urn):
            continue
        text = item.get('commentary', '')
        if not isinstance(text, str) or not text.strip():
            continue
        text = ' '.join(text.split())
        timestamp = item.get('publishedAt', item.get('createdAt'))
        if not isinstance(timestamp, (int, float)) or isinstance(timestamp, bool):
            continue
        try:
            published = datetime.fromtimestamp(timestamp / 1000, timezone.utc).isoformat()
        except (ValueError, OverflowError, OSError):
            continue
        posts.append({
            'id': urn,
            'title': text[:90] + ('…' if len(text) > 90 else ''),
            'summary': text[:500] + ('…' if len(text) > 500 else ''),
            'publishedAt': published,
            'url': 'https://www.linkedin.com/feed/update/' + urn + '/',
        })
    return sorted({p['id']: p for p in posts}.values(),
                  key=lambda p: p['publishedAt'], reverse=True)[:6]


def sync():
    token = os.environ.get('LINKEDIN_ACCESS_TOKEN', '')
    author = os.environ.get('LINKEDIN_AUTHOR_URN', '')
    version = os.environ.get('LINKEDIN_API_VERSION', '')
    if not token or not re.fullmatch(r'urn:li:person:[A-Za-z0-9_-]+', author):
        raise ValueError('Configure LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN repository secrets.')
    if not re.fullmatch(r'20\d{2}(0[1-9]|1[0-2])', version):
        raise ValueError('Set LINKEDIN_API_VERSION to a supported YYYYMM version.')
    query = urlencode({'q': 'author', 'author': author, 'count': 20, 'sortBy': 'LAST_MODIFIED'})
    request = Request('https://api.linkedin.com/rest/posts?' + query, headers={
        'Authorization': 'Bearer ' + token,
        'Linkedin-Version': version,
        'X-Restli-Protocol-Version': '2.0.0',
    })
    with urlopen(request, timeout=45) as response:
        payload = json.load(response)
    if not isinstance(payload.get('elements'), list):
        raise ValueError('Unexpected API response; existing portfolio data was preserved.')
    posts = normalize_posts(payload['elements'], author)
    if not posts:
        raise ValueError('No eligible public authored posts returned; existing data was preserved.')
    data = json.loads(DATA_PATH.read_text(encoding='utf-8'))
    if data.get('posts') == posts:
        print('No changes to public LinkedIn posts.')
        return
    data['posts'] = posts
    data['syncedAt'] = datetime.now(timezone.utc).isoformat()
    temporary = DATA_PATH.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    temporary.replace(DATA_PATH)
    print('Updated public posts. Existing curated highlights were preserved.')


if __name__ == '__main__':
    try:
        sync()
    except Exception as error:
        # Do not log provider response bodies or credentials.
        raise SystemExit('LinkedIn sync failed (' + type(error).__name__
                         + '). Existing data was preserved; check credentials, API version, and access.')
