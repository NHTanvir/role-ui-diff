import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalisePath, placeholderFor } from '../normalise.js';

test('numeric ids collapse to {id}', () => {
  assert.equal(normalisePath('/workspaces/123/settings'), '/workspaces/{id}/settings');
});
test('uuids and long hex get distinct placeholders', () => {
  assert.equal(normalisePath('/u/550e8400-e29b-41d4-a716-446655440000'), '/u/{uuid}');
  assert.equal(placeholderFor('a1b2c3d4e5f6a7b8'), '{hex}');
});
test('slug-with-digits collapses, plain words kept', () => {
  assert.equal(normalisePath('/org/acme/users'), '/org/acme/users');
  assert.equal(normalisePath('/p/ab12cd34ef'), '/p/{slug}');
});
test('trailing slash trimmed, full urls accepted', () => {
  assert.equal(normalisePath('https://x.com/a/9/'), '/a/{id}');
});
test('id kinds do not merge with each other', () => {
  assert.notEqual(placeholderFor('550e8400-e29b-41d4-a716-446655440000'), placeholderFor('123'));
});
