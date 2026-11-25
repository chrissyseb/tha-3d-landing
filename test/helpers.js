// Shared test setup. The seam is the @vercel/blob package boundary: every `import ... from '@vercel/blob'`
// in api/ is pointed at test/fake-blob.js, and global fetch is replaced so any network call fails the test.
import { registerHooks } from 'node:module';

const fakeUrl = new URL('./fake-blob.js', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@vercel/blob') return { url: fakeUrl, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

globalThis.fetch = async url => { throw new Error('network call in a test: ' + url); };

export const blob = (globalThis.__fakeBlob ??= { store: new Map(), failWith: null });
export function resetBlob() { blob.store.clear(); blob.failWith = null; blob.failOn = null; }

// Minimal Vercel-style response object.
export function fakeRes() {
  return {
    statusCode: 0, body: undefined, headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

export async function call(handler, req) {
  const res = fakeRes();
  await handler({ method: 'POST', headers: {}, query: {}, ...req }, res);
  return res;
}

// A valid enquiry; `n` keeps each one distinct so the duplicate check never hides the limiter.
export const enquiry = n => ({ name: 'Parent ' + n, email: `parent${n}@example.com`, consent: true, message: 'Enquiry ' + n });
