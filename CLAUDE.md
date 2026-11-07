# CLAUDE.md — Role UI Diff

## What this is
MV3 Chrome extension that snapshots a page per role and diffs two roles into a
BFLA/multi-tenant test plan. Read-only. Authorized use only.

## Layout
- `manifest.json` — MV3; storage/sidePanel/scripting/tabs/downloads.
- `scope.js` — scope helpers (shared).
- `normalise.js` — PURE path normalisation. Tested.
- `diff.js` — PURE snapshot diff + keyword sort. Tested.
- `score.js` — PURE keyword scorer (shared with Hidden UI Revealer). Tested.
- `markdown.js` — PURE Markdown checklist. Tested.
- `snapshot.js` — ISOLATED content script; collects actions/links/forms,
  normalises paths. Read-only; never clicks/submits.
- `background.js` — registers snapshot script for scope hosts; stores
  snapshots per host in chrome.storage.local; import/merge.
- `panel.html` / `panel.js` — side panel (snapshot, role labels, diff,
  export/import, copy MD).
- `testpages/` — role-aware test app.

## Rules
- Keep the four pure modules pure and Node-tested.
- snapshot.js must stay read-only.

## Test
`npm test`; manual: serve `testpages/`, scope `localhost`, snapshot both roles.
