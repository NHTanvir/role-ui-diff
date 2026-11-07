import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalisePath } from '../normalise.js';

test('numeric ids collapse to :id', () => {
  assert.equal(normalisePath('/workspaces/123/settings'), '/workspaces/:id/settings');
});
test('uuids collapse', () => {
  assert.equal(normalisePath('/u/550e8400-e29b-41d4-a716-446655440000'), '/u/:id');
});
test('slug-with-digits collapses, plain words kept', () => {
  assert.equal(normalisePath('/org/acme/users'), '/org/acme/users');
  assert.equal(normalisePath('/p/ab12cd34ef'), '/p/:id');
});
test('trailing slash trimmed, full urls accepted', () => {
  assert.equal(normalisePath('https://x.com/a/9/'), '/a/:id');
});
