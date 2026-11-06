// Pure path normalisation so the same page under different accounts lines up.
// /workspaces/123/settings -> /workspaces/:id/settings
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX = /^[0-9a-f]{12,}$/i;
const NUM = /^\d+$/;
const MIXED = /^(?=.*\d)[A-Za-z0-9_-]{8,}$/; // slug-like ids with digits

export function normalisePath(path) {
  let p = path;
  try { p = new URL(path, 'http://x').pathname; } catch {}
  const parts = p.split('/').map((seg) => {
    if (!seg) return seg;
    if (NUM.test(seg) || UUID.test(seg) || HEX.test(seg) || MIXED.test(seg)) return ':id';
    return seg;
  });
  let out = parts.join('/');
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out || '/';
}
