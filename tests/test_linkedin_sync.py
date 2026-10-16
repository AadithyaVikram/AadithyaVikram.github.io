import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('sync', Path(__file__).resolve().parents[1] / 'scripts/sync_linkedin.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)
AUTHOR = 'urn:li:person:owner'


def post(number=1, **overrides):
    return dict({'id': f'urn:li:share:{number}', 'author': AUTHOR,
                 'lifecycleState': 'PUBLISHED', 'visibility': 'PUBLIC',
                 'commentary': 'A public career update', 'publishedAt': 1750000000000 + number}, **overrides)


class LinkedInTests(unittest.TestCase):
    def test_excludes_other_authors_private_drafts_and_reshares(self):
        values = [post(), post(2, author='urn:li:person:other'),
                  post(3, visibility='CONNECTIONS'), post(4, lifecycleState='DRAFT'),
                  post(5, reshareContext={'parent': 'urn:li:share:10'})]
        self.assertEqual([p['id'] for p in sync.normalize_posts(values, AUTHOR)], ['urn:li:share:1'])

    def test_rejects_unexpected_ids_dates_and_empty_content(self):
        self.assertEqual(sync.normalize_posts([post(id='https://example.org'),
                         post(publishedAt='yesterday'), post(commentary=' '),
                         post(publishedAt=1e100)], AUTHOR), [])

    def test_deduplicates_sorts_and_limits(self):
        values = [post(i) for i in range(10)] + [post(9)]
        actual = sync.normalize_posts(values, AUTHOR)
        self.assertEqual(len(actual), 6)
        self.assertEqual(actual[0]['id'], 'urn:li:share:9')
        self.assertEqual(len({p['id'] for p in actual}), 6)

    def test_bounds_content_and_builds_linkedin_permalink(self):
        actual = sync.normalize_posts([post(commentary='x' * 1000)], AUTHOR)[0]
        self.assertLessEqual(len(actual['summary']), 501)
        self.assertEqual(actual['url'], 'https://www.linkedin.com/feed/update/urn:li:share:1/')

    def test_failed_fetch_preserves_existing_data(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'updates.json'
            target.write_text('{"highlights": ["keep"]}')
            before = target.read_bytes()
            with patch.object(sync, 'DATA_PATH', target), patch.dict(os.environ, {
                'LINKEDIN_ACCESS_TOKEN': 'test-token', 'LINKEDIN_AUTHOR_URN': AUTHOR,
                'LINKEDIN_API_VERSION': '202609'
            }), patch.object(sync, 'urlopen', side_effect=OSError('unavailable')):
                with self.assertRaises(OSError): sync.sync()
            self.assertEqual(target.read_bytes(), before)

    def test_sync_preserves_curated_highlights_and_is_idempotent(self):
        from io import BytesIO
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'updates.json'
            target.write_text(json.dumps({'highlights': [{'title': 'Keep me'}], 'posts': []}))
            response = json.dumps({'elements': [post()]}).encode()
            with patch.object(sync, 'DATA_PATH', target), patch.dict(os.environ, {
                'LINKEDIN_ACCESS_TOKEN': 'test-token', 'LINKEDIN_AUTHOR_URN': AUTHOR,
                'LINKEDIN_API_VERSION': '202609'
            }), patch.object(sync, 'urlopen', side_effect=lambda *a, **kw: BytesIO(response)):
                sync.sync()
                before = target.read_bytes()
                sync.sync()
                self.assertEqual(target.read_bytes(), before)
                self.assertEqual(json.loads(before)['highlights'], [{'title': 'Keep me'}])


if __name__ == '__main__':
    unittest.main()
