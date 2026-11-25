import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetBlob, call } from './helpers.js';

const { default: adminHandler } = await import('../api/admin.js');
const { createUploadHandler } = await import('../api/admin-upload.js');

const KEY = 'unit-test-admin-key';

// Each endpoint is driven through its handler. 401 means "not authorised"; anything else means the key was accepted.
// admin.js: an authorised GET for an unknown kind answers 400. admin-upload.js: an authorised GET answers 405.
const endpoints = {
  'admin.js': {
    passCode: 400,
    run: (envKey, given) => {
      if (envKey === undefined) delete process.env.ADMIN_KEY; else process.env.ADMIN_KEY = envKey;
      return call(adminHandler, { method: 'GET', query: { kind: 'no-such-kind' }, headers: given === undefined ? {} : { 'x-admin-key': given } });
    },
  },
  'admin-upload.js': {
    passCode: 405,
    run: (envKey, given) => call(createUploadHandler({ env: envKey === undefined ? {} : { ADMIN_KEY: envKey } }),
      { method: 'GET', headers: given === undefined ? {} : { 'x-admin-key': given } }),
  },
};

beforeEach(resetBlob);
afterEach(() => { delete process.env.ADMIN_KEY; });

for (const [name, { run, passCode }] of Object.entries(endpoints)) {
  test(`${name}: the right key is accepted`, async () => {
    assert.equal((await run(KEY, KEY)).statusCode, passCode);
  });

  test(`${name}: a wrong key is refused`, async () => {
    assert.equal((await run(KEY, 'unit-test-admin-kez')).statusCode, 401);
  });

  test(`${name}: an empty or missing key is refused`, async () => {
    assert.equal((await run(KEY, '')).statusCode, 401);
    assert.equal((await run(KEY, undefined)).statusCode, 401);
  });

  test(`${name}: with no ADMIN_KEY set, nothing is accepted, not even an empty key`, async () => {
    assert.equal((await run(undefined, '')).statusCode, 401);
    assert.equal((await run(undefined, KEY)).statusCode, 401);
    assert.equal((await run('', '')).statusCode, 401);
  });

  test(`${name}: a same-length key with non-ASCII characters is refused without throwing`, async () => {
    // Same number of characters as KEY, more bytes: the old byte compare threw here.
    const odd = 'unit-tést-admin-kéy';
    assert.equal(odd.length, KEY.length);
    assert.equal((await run(KEY, odd)).statusCode, 401);
  });

  test(`${name}: a non-ASCII admin key still works when it matches`, async () => {
    assert.equal((await run('clé-secrète-9', 'clé-secrète-9')).statusCode, passCode);
  });
}
