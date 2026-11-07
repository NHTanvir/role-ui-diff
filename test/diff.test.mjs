import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffSnapshots } from '../diff.js';

const admin = { path: '/x', role: 'admin',
  actions: [{ kind: 'button', label: 'Delete', href: null }, { kind: 'button', label: 'View', href: null }],
  links: ['/admin', '/home'], forms: [{ action: '/x', fields: ['role', 'name'] }] };
const member = { path: '/x', role: 'member',
  actions: [{ kind: 'button', label: 'View', href: null }],
  links: ['/home'], forms: [{ action: '/x', fields: ['name'] }] };

test('actions only in admin surface', () => {
  const d = diffSnapshots(admin, member);
  assert.deepEqual(d.actions.onlyInA.map((a) => a.label), ['Delete']);
  assert.equal(d.actions.inBoth.length, 1);
});
test('links and fields diffed', () => {
  const d = diffSnapshots(admin, member);
  assert.deepEqual(d.links.onlyInA.map((x) => x.v), ['/admin']);
  assert.deepEqual(d.fields.onlyInA.map((x) => x.name), ['role']);
});

import { diffToMarkdown } from '../markdown.js';
test('markdown renders a checklist of only-in-A items', () => {
  const d = diffSnapshots(admin, member);
  const md = diffToMarkdown(d);
  assert.ok(md.includes('- [ ] Delete'));
  assert.ok(md.includes('/admin'));
  assert.ok(md.includes('role'));
});
