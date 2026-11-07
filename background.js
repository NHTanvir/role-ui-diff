import { getScope } from './scope.js';

async function syncRegistrations() {
  const hosts = await getScope();
  const existing = await chrome.scripting.getRegisteredContentScripts().catch(() => []);
  if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: existing.map((s) => s.id) }).catch(() => {});
  if (!hosts.length) return;
  const matches = hosts.map((h) => `*://${h}/*`).concat(hosts.map((h) => `*://*.${h}/*`));
  await chrome.scripting.registerContentScripts([
    { id: 'rud-snapshot', js: ['snapshot.js'], matches, runAt: 'document_idle', allFrames: false, world: 'ISOLATED' },
  ]).catch((e) => console.warn('[rud] register failed', e));
}
chrome.runtime.onInstalled.addListener(syncRegistrations);
chrome.runtime.onStartup.addListener(syncRegistrations);
chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.scopeHosts) syncRegistrations(); });
chrome.action.onClicked.addListener((tab) => { if (tab.windowId != null) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {}); });

// Snapshots: chrome.storage.local under snap_<host>, an array of records,
// each tagged with a role label. Keyed for diffing by path+role.
const K = (host) => `snap_${host}`;

async function listSnaps(host) {
  const { [K(host)]: arr = [] } = await chrome.storage.local.get(K(host));
  return arr;
}
async function saveSnap(snapshot, role) {
  const host = snapshot.host;
  const arr = await listSnaps(host);
  const rec = { ...snapshot, role };
  const i = arr.findIndex((s) => s.path === rec.path && s.role === role);
  if (i >= 0) arr[i] = rec; else arr.push(rec);
  await chrome.storage.local.set({ [K(host)]: arr });
  return arr;
}

chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg && msg.type === 'rud-save') { saveSnap(msg.snapshot, msg.role).then((arr) => sendResponse({ snaps: arr })); return true; }
  if (msg && msg.type === 'rud-list') { listSnaps(msg.host).then((arr) => sendResponse({ snaps: arr })); return true; }
  if (msg && msg.type === 'rud-import') {
    const host = msg.host;
    listSnaps(host).then((arr) => {
      const merged = [...arr];
      for (const rec of msg.snaps || []) {
        const i = merged.findIndex((s) => s.path === rec.path && s.role === rec.role);
        if (i >= 0) merged[i] = rec; else merged.push(rec);
      }
      chrome.storage.local.set({ [K(host)]: merged }).then(() => sendResponse({ snaps: merged }));
    });
    return true;
  }
  if (msg && msg.type === 'rud-clear') { chrome.storage.local.remove(K(msg.host)).then(() => sendResponse({ ok: true })); return true; }
});
