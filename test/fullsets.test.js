import test from 'node:test';
import assert from 'node:assert/strict';
import { RESOURCES, resourceFiles, findItem } from '../api/_catalogue.js';

const sets = RESOURCES.filter(r => r.fullSet);
const pack = id => RESOURCES.find(r => r.id === id);

test('there are seven Full Sets and each is sellable', () => {
  assert.equal(sets.length, 7);
  for (const s of sets) assert.equal(findItem(s.id).kind, 'resource', s.id);
});

test('a Full Set never costs less than the packs inside it added together', () => {
  for (const s of sets) {
    const parts = s.items.reduce((sum, id) => sum + pack(id).price, 0);
    assert.ok(s.price > parts, `${s.id}: ${s.price} must be above ${parts}`);
    assert.ok(s.regularPrice > s.price, s.id + ' regular price is above the launch price');
  }
});

test('every Full Set file path is one the download endpoint accepts, one per part', () => {
  for (const s of sets) {
    const files = resourceFiles(s);
    assert.equal(files.length, s.fileTitles.length, s.id);
    assert.equal(files[0].title, 'Start Here', s.id);
    assert.equal(new Set(files.map(f => f.path)).size, files.length, s.id + ' paths are unique');
  }
});

import { findUpload, findPack } from '../api/admin-upload.js';

test('a Full Set reuses its packs own files and adds only its other parts', () => {
  for (const s of sets) {
    const files = resourceFiles(s).map(f => f.path);
    s.items.forEach((packId, i) => assert.equal(files[i + 1], 'products/' + packId + '.pdf', s.id));
    assert.equal(files[0], 'products/' + s.id + '-00.pdf');
  }
});

test('the upload endpoint accepts every file the catalogue delivers, and nothing else', () => {
  const paths = new Set(RESOURCES.flatMap(r => resourceFiles(r).map(f => f.path)));
  for (const p of paths) assert.ok(findUpload(p.slice('products/'.length, -4)), p);
  assert.equal(paths.size, 10 + 32, 'ten packs plus the Full Set parts that are not packs');
  for (const bad of ['bundle-set-psle-maths-09', 'bundle-set-nope-00', '../x', 'bundle-psle', '']) assert.equal(findUpload(bad), null, bad);
  assert.ok(findPack('res-psle-maths'));
});
