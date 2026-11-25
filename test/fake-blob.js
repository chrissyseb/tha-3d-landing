// In-memory stand-in for @vercel/blob, so the tests need no network and no token.
// State lives on globalThis so the test file and the code under test share it.
const state = (globalThis.__fakeBlob ??= { store: new Map(), failWith: null });

// failWith fails every call; failOn(path, op) fails only the 'put' or 'get' calls it returns true for.
const check = (path, op) => { if (state.failWith) throw state.failWith; if (state.failOn && state.failOn(String(path || ''), op)) throw new Error('blob store down'); };

export async function put(path, body) {
  check(path, 'put');
  state.store.set(path, String(body));
  return { pathname: path, url: 'blob://' + path };
}

export async function get(path) {
  check(path, 'get');
  if (!state.store.has(path)) return null;
  return { stream: new Response(state.store.get(path)).body };
}

export async function list({ prefix = '' } = {}) {
  check();
  const blobs = [...state.store.keys()].filter(p => p.startsWith(prefix)).map(p => ({ pathname: p, url: 'blob://' + p }));
  return { blobs, hasMore: false };
}

export async function del(url) {
  check();
  state.store.delete(String(url).replace('blob://', ''));
}
