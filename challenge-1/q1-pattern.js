/**
 * Challenge 1 — Question 1
 * -------------------------------------------------------------
 * Write a function that takes `n` as input and prints the pattern:
 *
 *   1
 *   21
 *   321
 *   4321
 *   ...
 *   n (n-1) ... 3 2 1     <- the n-th row has n digits
 *
 * Reading the concrete rows (1, 21, 321, 4321) the rule is:
 *   row i  =  i, i-1, i-2, ... , 2, 1   (count DOWN from i to 1)
 * so the last row for input n is "n(n-1)...321" and is n characters
 * long  (that is what the assignment's "nnnnn (n times)" hints at:
 * the final row contains n digits).
 *
 * Below are four different implementations that all produce the
 * exact same output, followed by a small demo runner.
 * -------------------------------------------------------------
 */

'use strict';

// ---------------------------------------------------------------
// Way 1 — classic nested for-loops (build a string per row)
// ---------------------------------------------------------------
function patternLoops(n) {
  let out = '';
  for (let row = 1; row <= n; row++) {
    let line = '';
    for (let num = row; num >= 1; num--) {
      line += num;
    }
    out += line + '\n';
  }
  return out.trimEnd();
}

// ---------------------------------------------------------------
// Way 2 — functional: Array.from to build each row, then join
// ---------------------------------------------------------------
function patternFunctional(n) {
  return Array.from({ length: n }, (_, i) => {
    const row = i + 1; // 1..n
    // [row, row-1, ..., 1]
    return Array.from({ length: row }, (_, j) => row - j).join('');
  }).join('\n');
}

// ---------------------------------------------------------------
// Way 3 — recursion (print row by row)
// ---------------------------------------------------------------
function patternRecursive(n) {
  const buildRow = (start) =>
    start === 0 ? '' : String(start) + buildRow(start - 1);

  const buildRows = (row) =>
    row > n ? [] : [buildRow(row), ...buildRows(row + 1)];

  return buildRows(1).join('\n');
}

// ---------------------------------------------------------------
// Way 4 — string trick: take "n...321", then slice growing chunks.
// The full last row is the reversed sequence n,n-1,...,1; every
// earlier row is a trailing slice of it.
//   full = "4321"  ->  rows: "1", "21", "321", "4321"
// ---------------------------------------------------------------
function patternSlice(n) {
  const full = Array.from({ length: n }, (_, i) => n - i).join(''); // "n..1"
  const rows = [];
  for (let row = 1; row <= n; row++) {
    rows.push(full.slice(n - row)); // last `row` characters
  }
  return rows.join('\n');
}

// ---------------------------------------------------------------
// Demo — run all four and confirm they agree
// ---------------------------------------------------------------
function demo(n) {
  console.log(`\n=== Pattern for n = ${n} ===`);
  console.log(patternLoops(n));

  const all = [
    patternLoops(n),
    patternFunctional(n),
    patternRecursive(n),
    patternSlice(n),
  ];
  const allEqual = all.every((s) => s === all[0]);
  console.log(`\n(all 4 implementations agree: ${allEqual})`);
}

// Run when executed directly:  node q1-pattern.js
demo(5);

module.exports = {
  patternLoops,
  patternFunctional,
  patternRecursive,
  patternSlice,
};
