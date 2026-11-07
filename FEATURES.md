# Features

## Snapshot
- Visible + hidden actions, link targets, form actions/methods/field names, headings.
- Keyed by **normalised path** (`/workspaces/123/settings` → `/workspaces/:id/settings`)
  so the same page under different accounts lines up.
- Labelled with a role you pick ("admin", "free", "tenant A"…).

## Diff
- A-vs-B: actions / links / fields only in A, only in B, in both.
- Only-in-role actions sorted by keyword interest (admin/delete/export/role/billing…).
- Each category is **class-tagged** — actions → BFLA, links → BOLA/direct-URL,
  form fields → BOPLA/mass-assignment — and privilege-bearing fields (`role`,
  `is_admin`, `owner_id`, `tenant_id`, `plan`…) are flagged and sorted first.
- Paths normalise to typed placeholders (`{uuid}`/`{hex}`/`{id}`/`{slug}`).

## Export / import
- Export snapshots to JSON, import (merge by path+role) in another browser.
- Copy the diff as a Markdown checklist for `notes/<program>/`.

## Safety
- Read-only; never clicks or submits.
- Snapshots stay local (`chrome.storage.local`); export only when you choose.
- Scope-gated.
