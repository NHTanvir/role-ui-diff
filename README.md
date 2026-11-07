# Role UI Diff

A Chrome (MV3) extension that records what each **role** can see and do on a
page — actions, links, routes, form fields — then diffs two roles and lists
everything the higher role has that the lower one doesn't. That list is your
BFLA / multi-tenant test plan: try each item with the lower role's account.

> **Authorized testing only.** Read-only: it records the page, never clicks or
> submits. Snapshots can hold names/emails from your own test accounts — they
> stay local; don't share exports. Empty scope = inert.

## Why not Burp
A proxy compares requests, not what each role's screen offers. Actions a role
never clicks never show up in a proxy at all.

## Workflow
Your single-profile setup blocks extra Chrome profiles, so record one role in
Chrome and the other in a second browser (or log out/in): **Snapshot** each
with a role label, **Export** from one, **Import** in the other, then **Diff**.

## Install (unpacked)
1. `chrome://extensions` → Developer mode → Load unpacked → this folder.
2. Options → add authorized host(s). Reload the tab, open the side panel.

## Try it
```
cd testpages && python3 -m http.server 8000
```
Snapshot `http://localhost:8000/app.html?role=admin` as "admin" and
`?role=member` as "member" (scope `localhost`), then Diff.

## Tests
```
npm test
```
See [FEATURES.md](FEATURES.md) and [PLAN.md](PLAN.md).
