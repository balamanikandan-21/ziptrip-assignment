/**
 * Challenge 1 — Question 3
 * -------------------------------------------------------------
 * Remove duplicates from an array, keeping the FIRST occurrence
 * of each value (original order preserved).
 *
 *   input:  [1, 2, 3, 6, 4, 3, 7, 4, 2, 6, 8, 2, 5, 9, 0, 1]
 *   output: [1, 2, 3, 6, 4, 7, 8, 5, 9, 0]
 *
 * Four different implementations, all returning the same result.
 * -------------------------------------------------------------
 */

'use strict';

// Way 1 — Set (cleanest). A Set keeps insertion order and only
// stores unique values, so spreading it back to an array is enough.
function uniqueSet(arr) {
  return [...new Set(arr)];
}

// Way 2 — filter + indexOf: keep an item only at the index where it
// first appears (indexOf returns the first matching index).
function uniqueFilter(arr) {
  return arr.filter((value, index) => arr.indexOf(value) === index);
}

// Way 3 — reduce + includes: build the result, push only if unseen.
function uniqueReduce(arr) {
  return arr.reduce((acc, value) => {
    if (!acc.includes(value)) acc.push(value);
    return acc;
  }, []);
}

// Way 4 — explicit loop with a lookup object/Set for O(n) time.
// (filter/indexOf and reduce/includes are O(n^2); this scales better.)
function uniqueLoop(arr) {
  const seen = new Set();
  const out = [];
  for (const value of arr) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

// ---------------------------------------------------------------
// Demo
// ---------------------------------------------------------------
const input = [1, 2, 3, 6, 4, 3, 7, 4, 2, 6, 8, 2, 5, 9, 0, 1];
const expected = [1, 2, 3, 6, 4, 7, 8, 5, 9, 0];

const results = {
  set: uniqueSet(input),
  filter: uniqueFilter(input),
  reduce: uniqueReduce(input),
  loop: uniqueLoop(input),
};

console.log('input:   ', JSON.stringify(input));
for (const [name, value] of Object.entries(results)) {
  console.log(`${name.padEnd(8)}`, JSON.stringify(value));
}
const allMatch = Object.values(results).every(
  (r) => JSON.stringify(r) === JSON.stringify(expected)
);
console.log('expected:', JSON.stringify(expected), '-> all match:', allMatch);

module.exports = { uniqueSet, uniqueFilter, uniqueReduce, uniqueLoop };
