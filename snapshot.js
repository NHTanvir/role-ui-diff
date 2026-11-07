// ISOLATED world. Collects what the current role can see/do on the page:
// actions (visible + hidden), links, form actions + field names, headings.
// Read-only — never clicks or submits.
import { normalisePath } from './normalise.js';

function visible(el) {
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.hasAttribute('hidden') &&
         el.getAttribute('aria-hidden') !== 'true' && r.width > 0 && r.height > 0;
}

function label(el) {
  return (el.getAttribute('aria-label') || el.textContent || el.value ||
          el.getAttribute('title') || el.name || el.id || el.tagName).trim().slice(0, 80);
}

function actionKind(el) {
  if (el.tagName === 'A') return 'link';
  if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return 'button';
  if (el.getAttribute('role') === 'menuitem') return 'menuitem';
  return 'control';
}

export function collect() {
  const actions = [];
  const seen = new Set();
  document.querySelectorAll('button, a[href], [role=button], [role=menuitem], [onclick]').forEach((el) => {
    const l = label(el);
    const kind = actionKind(el);
    const href = el.getAttribute('href') || null;
    const key = kind + '|' + l + '|' + (href || '');
    if (seen.has(key) || !l) return;
    seen.add(key);
    actions.push({ label: l, kind, href: href ? normalisePath(href) : null, hidden: !visible(el) });
  });

  const links = [...new Set(
    [...document.querySelectorAll('a[href]')]
      .map((a) => { try { return normalisePath(new URL(a.href, location.href).pathname); } catch { return null; } })
      .filter(Boolean)
  )];

  const forms = [...document.querySelectorAll('form')].map((f) => ({
    action: f.getAttribute('action') ? normalisePath(f.getAttribute('action')) : normalisePath(location.pathname),
    method: (f.getAttribute('method') || 'get').toLowerCase(),
    fields: [...f.querySelectorAll('[name]')].map((i) => i.getAttribute('name')).filter(Boolean),
  }));

  const headings = [...document.querySelectorAll('h1, h2')].map((h) => h.textContent.trim().slice(0, 80)).filter(Boolean);

  return {
    host: location.host,
    path: normalisePath(location.pathname),
    takenAt: new Date().toISOString(),
    actions, links, forms, headings,
  };
}

chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg && msg.type === 'rud-collect') { sendResponse({ snapshot: collect() }); return true; }
});
