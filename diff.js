import { score } from './score.js';

// Privilege-bearing field names are mass-assignment / BOPLA candidates.
const PRIV_FIELD_RE = /\b(role|roles|is_?admin|is_?owner|owner_?id|tenant_?id|org_?id|account_?id|permission|permissions|plan|tier|scope|scopes)\b/i;
export function isPrivilegedField(name) { return PRIV_FIELD_RE.test(name || ''); }

// Pure diff of two role snapshots for the same normalised path.
// Returns, per category, items only in A, only in B, and in both.
function actionKey(a) { return `${a.kind}|${a.label}|${a.href || ''}`; }

function splitSets(aItems, bItems, keyFn) {
  const aKeys = new Map(aItems.map((x) => [keyFn(x), x]));
  const bKeys = new Map(bItems.map((x) => [keyFn(x), x]));
  const onlyInA = [], onlyInB = [], inBoth = [];
  for (const [k, v] of aKeys) (bKeys.has(k) ? inBoth : onlyInA).push(v);
  for (const [k, v] of bKeys) if (!aKeys.has(k)) onlyInB.push(v);
  return { onlyInA, onlyInB, inBoth };
}

function sortActions(list) {
  return list.map((a) => ({ ...a, score: score(`${a.label} ${a.href || ''}`) }))
             .sort((x, y) => y.score - x.score);
}

function markPrivileged(set) {
  for (const key of ['onlyInA', 'onlyInB', 'inBoth']) {
    set[key] = set[key].map((x) => ({ ...x, privileged: isPrivilegedField(x.name) }));
  }
  // privileged fields first
  set.onlyInA.sort((x, y) => (y.privileged === true) - (x.privileged === true));
  return set;
}

export function diffSnapshots(a, b) {
  const actions = splitSets(a.actions || [], b.actions || [], actionKey);
  actions.onlyInA = sortActions(actions.onlyInA);
  actions.onlyInB = sortActions(actions.onlyInB);
  actions.candidateClass = 'BFLA';   // an affordance one role has and another lacks
  const links = splitSets((a.links || []).map((l) => ({ v: l })), (b.links || []).map((l) => ({ v: l })), (x) => x.v);
  links.candidateClass = 'BOLA/direct-URL';
  const fields = markPrivileged(splitSets(
    (a.forms || []).flatMap((f) => f.fields.map((n) => ({ form: f.action, name: n }))),
    (b.forms || []).flatMap((f) => f.fields.map((n) => ({ form: f.action, name: n }))),
    (x) => x.form + '::' + x.name
  ));
  fields.candidateClass = 'BOPLA/mass-assignment';
  return { path: a.path, roleA: a.role, roleB: b.role, actions, links, fields };
}
