# Role UI Diff — Plan

## Goal
Record what each role can **see and do** on a page — actions, links, routes, form fields — then compare two roles (e.g. admin vs member, paid vs free, tenant A vs tenant B) and list everything the higher role has that the lower one doesn't. That list is your BFLA / multi-tenant test plan: try each item with the lower role's account.

**Roadmap fit:** spine #3 BFLA, #4 multi-tenant isolation, #13 RBAC vs ABAC confusion.

**Why Burp can't:** Burp compares requests, not what each role's screen offers. Actions a role never clicks never show up in Burp at all.

## Features
### v1 (MVP)
- **Snapshot** the current page under a role label you pick ("admin", "free"…): visible + hidden actions (reuses Hidden UI Revealer's detector), link targets (normalised paths), form actions and field names, page headings.
- Keys snapshots by **normalised path** (`/workspaces/123/settings` → `/workspaces/:id/settings`) so the same page under different accounts lines up.
- **Diff view:** pick role A and role B → per page: actions/fields/links only in A, only in B, in both. Sorted by keyword interest (admin, delete, export, invite, role, billing…).
- **Export / import JSON:** your new Chrome policy blocks extra profiles, so you'll record one role in Chrome and the other in Burp's browser (or log out/in). Export from one, import in the other, then diff.
- **Copy test list as Markdown** for `notes/<program>/`.

### Later
- Auto-snapshot every page you visit while a role label is active.
- Mark items as tested / vulnerable / safe.
- Diff of API responses (fields) when Twin-style captures exist.

## Design
| File | Role |
|---|---|
| `manifest.json` | MV3. `storage`, `sidePanel`, `scripting`, `tabs`, `downloads` (export); host permissions per scope host. |
| `snapshot.js` | Content script: collects actions/links/forms on demand, normalises paths (ids, UUIDs, hashes → `:id`). |
| `diff.js` | Pure diff logic (shared, unit-testable in Node). |
| `background.js` | Scope, storage of snapshots in `chrome.storage.local` per target host, import/export. |
| `panel.html/.js` | Side panel: role label, Snapshot button, diff view, export/import. |

**Data:** `{ host, path, role, takenAt, actions[{label, href, kind, hidden}], forms[{action, method, fields[]}] }`.

## Safety and scope
- Read-only: it records the page; it never clicks or submits.
- Snapshots stay local (export only when you choose). They can contain names/emails from your own test accounts — don't share exports.
- In-scope hosts only.

## Testing
- Test app pages rendered differently for "admin" and "member" (query flag on a local test server).
- Node unit tests for path normalisation and diff; CDP + **error watcher** for the extension, 0 errors.
- Check: correct only-in-A list, path normalisation lines pages up, export → import round-trip.

## Issues → commits
1. Scaffold: manifest, worker, scope, storage
2. Page snapshot (actions, links, forms) + path normalisation
3. Diff engine with Node tests
4. Side panel: snapshot, role labels, diff view
5. Export / import JSON and copy as Markdown
6. Test pages + README/FEATURES/CLAUDE.md
