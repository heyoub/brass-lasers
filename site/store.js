// A tiny store: one state object, shallow patches, subscribers, and selectors that
// only fire when their slice changes. Everything that moves on the page reads from here,
// so effects compose instead of fighting over scroll listeners.
export function createStore(initial) {
  let state = { ...initial };
  const subs = new Set();
  const store = {
    get: () => state,
    set(patch) {
      const prev = state;
      state = { ...state, ...patch };
      subs.forEach((fn) => fn(state, prev));
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    // fire fn(next, prev) only when selector(state) changes
    select(selector, fn) {
      let last = selector(state);
      return store.subscribe((s) => {
        const next = selector(s);
        if (next !== last) {
          const prev = last;
          last = next;
          fn(next, prev);
        }
      });
    },
  };
  return store;
}
