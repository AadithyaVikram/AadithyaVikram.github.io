'use strict';
const heroArt = document.querySelector('.hero-art');
const motionButton = document.querySelector('.motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
heroArt.classList.add('motion-ready');
let pausedByUser = false;
function updateMotion() {
 const paused = pausedByUser || reducedMotion.matches || document.hidden;
 heroArt.classList.toggle('is-paused', paused);
 motionButton.setAttribute('aria-pressed', String(pausedByUser));
 motionButton.setAttribute('aria-label', pausedByUser ? 'Resume illustration animation' : 'Pause illustration animation');
 motionButton.textContent = pausedByUser ? 'Resume animation' : 'Pause animation';
}
motionButton.addEventListener('click', () => { pausedByUser = !pausedByUser; updateMotion(); });
reducedMotion.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', updateMotion);
heroArt.addEventListener('pointermove', event => {
 if (event.pointerType !== 'mouse' || reducedMotion.matches || pausedByUser) return;
 const bounds = heroArt.getBoundingClientRect();
 heroArt.style.setProperty('--pointer-x', `${(event.clientX - bounds.left - bounds.width / 2) * .025}px`);
 heroArt.style.setProperty('--pointer-y', `${(event.clientY - bounds.top - bounds.height / 2) * .025}px`);
});
heroArt.addEventListener('pointerleave', () => {
 heroArt.style.setProperty('--pointer-x', '0px');
 heroArt.style.setProperty('--pointer-y', '0px');
});
updateMotion();
const themeButton = document.querySelector('.theme-toggle');
const preference = matchMedia('(prefers-color-scheme: dark)');
function updateThemeLabel() {
 const dark = document.documentElement.dataset.theme === 'dark';
 themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
 document.querySelector('meta[name="theme-color"]').content = dark ? '#141c18' : '#f8f9f5';
}
updateThemeLabel();
themeButton.addEventListener('click', () => {
 const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
 document.documentElement.dataset.theme = next;
 try { localStorage.setItem('av-theme', next); } catch (_) {}
 updateThemeLabel();
});
preference.addEventListener('change', event => {
 try { if (localStorage.getItem('av-theme')) return; } catch (_) {}
 document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
 updateThemeLabel();
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
 document.querySelectorAll('.filter').forEach(item => {
  item.classList.toggle('active', item === button);
  item.setAttribute('aria-pressed', String(item === button));
 });
 let count = 0;
 document.querySelectorAll('.project').forEach(project => {
  project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
  if (!project.hidden) count++;
 });
 document.querySelector('.filter-status').textContent = `${count} project${count === 1 ? '' : 's'} shown`;
}));
document.querySelector('.copy-email').addEventListener('click', async () => {
 const status = document.getElementById('copy-status');
 try { await navigator.clipboard.writeText(document.querySelector('.email-link').getAttribute('href').slice('mailto:'.length)); status.textContent = 'Email copied!'; }
 catch (_) { status.textContent = 'Select the email above to copy it.'; }
});
document.getElementById('year').textContent = new Date().getFullYear();
const search = document.getElementById('certificate-search');
const list = document.getElementById('certificate-list');
const more = document.getElementById('show-certificates');
let certificates = [];
let expanded = false;
function renderCertificates() {
 const query = search.value.trim().toLowerCase();
 const matches = certificates.filter(item => item.title.toLowerCase().includes(query));
 const visible = query || expanded ? matches : matches.slice(0, 5);
 list.replaceChildren();
 visible.forEach(item => {
  const link = document.createElement('a');
  link.className = 'certificate-item'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  const title = document.createElement('span'); title.textContent = item.title.replace(/\s*-\s*/g, ' · ');
  const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
  link.append(title, arrow); list.append(link);
 });
 document.getElementById('certificate-count').textContent = matches.length ? `Showing ${visible.length} of ${matches.length} certifications` : 'No certifications found. Try a different search.';
 more.hidden = Boolean(query) || matches.length <= 5;
 more.textContent = expanded ? 'Show fewer certifications ↑' : `Show all ${certificates.length} certifications ↓`;
}
fetch('assets/certificates.json').then(response => {
 if (!response.ok) throw new Error('Certificate collection unavailable');
 return response.json();
}).then(data => { certificates = data; renderCertificates(); }).catch(() => {
 document.getElementById('certificate-count').textContent = 'Use the certificate collection link to browse my certifications.';
 search.disabled = true;
});
search.addEventListener('input', renderCertificates);
more.addEventListener('click', () => { expanded = !expanded; renderCertificates(); });
// Same-origin JSON works both at a user Pages root and a project subdirectory.
// Keep the HTML highlights as a fallback if loading fails or JavaScript is disabled.
function linkedinUrl(value) {
 try {
  const url = new URL(value);
  return url.protocol === 'https:' && (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')) ? url.href : null;
 } catch (_) { return null; }
}
function createUpdateCard(item, isPost = false) {
 const url = linkedinUrl(item.url);
 if (!url || typeof item.title !== 'string' || typeof item.summary !== 'string') return null;
 const article = document.createElement('article'); article.className = 'update-card';
 const label = document.createElement('p'); label.className = 'eyebrow';
 const date = new Date(item.publishedAt);
 label.textContent = isPost && !Number.isNaN(date.getTime())
  ? date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })
  : item.category || 'LinkedIn';
 const title = document.createElement('h3'); title.textContent = item.title;
 const summary = document.createElement('p'); summary.textContent = item.summary;
 const link = document.createElement('a'); link.className = 'text-link'; link.href = url;
 link.target = '_blank'; link.rel = 'noopener noreferrer';
 link.textContent = isPost ? 'Read post on LinkedIn ↗' : 'View LinkedIn activity ↗';
 article.append(label, title, summary, link);
 return article;
}
fetch('assets/linkedin-updates.json').then(response => {
 if (!response.ok) throw new Error('Highlights unavailable');
 return response.json();
}).then(data => {
 const highlights = (Array.isArray(data.highlights) ? data.highlights : []).map(item => createUpdateCard(item)).filter(Boolean);
 if (highlights.length) document.getElementById('linkedin-highlights').replaceChildren(...highlights);
 const posts = (Array.isArray(data.posts) ? data.posts : []).slice(0, 6).map(item => createUpdateCard(item, true)).filter(Boolean);
 if (posts.length) {
  document.getElementById('linkedin-post-list').replaceChildren(...posts);
  document.getElementById('linkedin-posts').hidden = false;
 }
 const reviewed = new Date(`${data.reviewedAt}T00:00:00+05:30`);
 const synced = new Date(data.syncedAt);
 const format = date => date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
 if (!Number.isNaN(reviewed.getTime())) {
  document.getElementById('updates-status').textContent = `Selected LinkedIn highlights · reviewed ${format(reviewed)}`
   + (data.syncedAt && !Number.isNaN(synced.getTime()) ? ` · posts synced ${format(synced)}` : '');
 }
}).catch(() => { /* Verified static highlights remain visible. */ });
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  document.querySelectorAll('nav a').forEach(link => {
   if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
   else link.removeAttribute('aria-current');
  });
 }), { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
 document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
