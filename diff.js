import { score } from './score.js';

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

export function diffSnapshots(a, b) {
  const actions = splitSets(a.actions || [], b.actions || [], actionKey);
  actions.onlyInA = sortActions(actions.onlyInA);
  actions.onlyInB = sortActions(actions.onlyInB);
  return {
    path: a.path,
    roleA: a.role, roleB: b.role,
    actions,
    links: splitSets((a.links || []).map((l) => ({ v: l })), (b.links || []).map((l) => ({ v: l })), (x) => x.v),
    fields: splitSets(
      (a.forms || []).flatMap((f) => f.fields.map((n) => ({ form: f.action, name: n }))),
      (b.forms || []).flatMap((f) => f.fields.map((n) => ({ form: f.action, name: n }))),
      (x) => x.form + '::' + x.name
    ),
  };
}
