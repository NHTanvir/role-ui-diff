let host = '';
let snaps = [];
const out = document.getElementById('out');
const roleA = document.getElementById('roleA');
const roleB = document.getElementById('roleB');
function esc(s){return String(s).replace(/[&<>]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

async function activeTab(){ const [t]=await chrome.tabs.query({active:true,currentWindow:true}); return t; }

function roles(){ return [...new Set(snaps.map((s)=>s.role))]; }
function fillRoleSelects(){
  const r = roles();
  for (const sel of [roleA, roleB]) sel.innerHTML = r.map((x)=>`<option>${esc(x)}</option>`).join('');
  if (r.length>1) roleB.selectedIndex = 1;
}

async function loadSnaps(){
  const t = await activeTab();
  try { host = new URL(t.url).host; } catch { host=''; }
  const resp = await chrome.runtime.sendMessage({ type:'rud-list', host });
  snaps = (resp && resp.snaps) || [];
  fillRoleSelects();
  out.innerHTML = `<section>${snaps.length} snapshot(s) stored for <code>${esc(host)}</code>.</section>`;
}

document.getElementById('snap').addEventListener('click', async () => {
  const role = document.getElementById('role').value.trim() || 'unlabeled';
  const t = await activeTab();
  const resp = await chrome.tabs.sendMessage(t.id, { type:'rud-collect' }).catch(()=>null);
  if (!resp) { out.innerHTML = '<section>Could not snapshot (is the host in scope and the tab reloaded?).</section>'; return; }
  const saved = await chrome.runtime.sendMessage({ type:'rud-save', snapshot: resp.snapshot, role });
  snaps = saved.snaps; fillRoleSelects();
  out.innerHTML = `<section>Saved snapshot of <code>${esc(resp.snapshot.path)}</code> as role <b>${esc(role)}</b>.</section>`;
});

function group(title, cls, items, fmt){
  if (!items.length) return '';
  return `<h3 class="${cls}">${title} (${items.length})</h3>` + items.map((i)=>`<div class="item ${cls}">${fmt(i)}</div>`).join('');
}

async function doDiff(){
  const { diffSnapshots } = await import('./diff.js');
  const a = snaps.find((s)=>s.role===roleA.value);
  const b = snaps.find((s)=>s.role===roleB.value && s.path===(a&&a.path));
  if (!a || !b) { out.innerHTML = '<section>Need snapshots of both roles on the same normalised path.</section>'; return; }
  const d = diffSnapshots(a, b);
  window.__lastDiff = d;
  out.innerHTML = `<section><b>${esc(d.roleA)}</b> vs <b>${esc(d.roleB)}</b> on <code>${esc(d.path)}</code></section>
  <section>
    ${group(`Actions only in ${esc(d.roleA)}`, 'only-a', d.actions.onlyInA, (x)=>`${esc(x.label)} <span class="score">${x.score}</span> ${x.href?('<code>'+esc(x.href)+'</code>'):''}`)}
    ${group(`Actions only in ${esc(d.roleB)}`, 'only-b', d.actions.onlyInB, (x)=>`${esc(x.label)} <span class="score">${x.score}</span>`)}
    ${group(`Links only in ${esc(d.roleA)}`, 'only-a', d.links.onlyInA, (x)=>`<code>${esc(x.v)}</code>`)}
    ${group(`Fields only in ${esc(d.roleA)}`, 'only-a', d.fields.onlyInA, (x)=>`<code>${esc(x.form)}</code> · ${esc(x.name)}`)}
  </section>`;
}
document.getElementById('diff').addEventListener('click', doDiff);

// --- Export / import JSON (record one role in each browser, then diff) ---
document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ host, snaps }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `role-ui-diff-${host || 'snaps'}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const fileEl = document.getElementById('file');
document.getElementById('import').addEventListener('click', () => fileEl.click());
fileEl.addEventListener('change', async () => {
  const f = fileEl.files[0]; if (!f) return;
  let data; try { data = JSON.parse(await f.text()); } catch { out.innerHTML = '<section>Invalid JSON.</section>'; return; }
  const resp = await chrome.runtime.sendMessage({ type: 'rud-import', host, snaps: data.snaps || [] });
  snaps = resp.snaps; fillRoleSelects();
  out.innerHTML = `<section>Imported — ${snaps.length} snapshot(s) now stored.</section>`;
  fileEl.value = '';
});

chrome.tabs.onActivated.addListener(loadSnaps);
loadSnaps();
