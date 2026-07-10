// compareStore.js — tiny localStorage-backed store for the hospital compare bar.
// Shared by CompareToggle + CompareBar. Max 3. Emits a window event on change.

const KEY = 'khp:compare';
const EVENT = 'khp-compare-change';
const MAX = 3;

function read() {
  if (typeof window === 'undefined') return [];
  try { const v = JSON.parse(window.localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.slice(0, MAX) : []; }
  catch { return []; }
}

function write(list) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVENT));
}

function toggle(item) {
  const list = read();
  const i = list.findIndex((x) => x.id === item.id);
  if (i >= 0) { list.splice(i, 1); write(list); return true; }
  if (list.length >= MAX) return false; // full — not added
  list.push({ id: item.id, name: item.name, slug: item.slug });
  write(list);
  return true;
}

function remove(id) { write(read().filter((x) => x.id !== id)); }
function clear() { write([]); }
function has(id) { return read().some((x) => x.id === id); }

export { read, toggle, remove, clear, has, EVENT, MAX };
