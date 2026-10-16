'use strict';
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
