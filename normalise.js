// Pure path normalisation so the same page under different accounts lines up.
// Emits TYPED placeholders ({uuid}/{hex}/{id}/{slug}) in a fixed precedence so
// different id kinds don't falsely merge (per the research notes).
// /workspaces/123/settings -> /workspaces/{id}/settings
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX = /^[0-9a-f]{16,}$/i;      // long hex / hash
const NUM = /^\d+$/;
const SLUG = /^(?=.*\d)[A-Za-z0-9_-]{8,}$/; // slug-like ids containing digits

export function placeholderFor(seg) {
  if (UUID.test(seg)) return '{uuid}';
  if (HEX.test(seg)) return '{hex}';
  if (NUM.test(seg)) return '{id}';
  if (SLUG.test(seg)) return '{slug}';
  return null;
}

export function normalisePath(path) {
  let p = path;
  try { p = new URL(path, 'http://x').pathname; } catch {}
  const parts = p.split('/').map((seg) => (seg ? (placeholderFor(seg) || seg) : seg));
  let out = parts.join('/');
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out || '/';
}
