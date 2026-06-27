/**
 * Challenge 1 — Question 2
 * -------------------------------------------------------------
 * Reverse the characters in a string.
 *   input:  "Bhaskara"
 *   output: "araksahB"
 *
 * Five different implementations, all returning the same result.
 * -------------------------------------------------------------
 */

'use strict';

// Way 1 — built-in chain: split into chars, reverse array, join back
function reverseSplit(str) {
  return str.split('').reverse().join('');
}

// Way 2 — plain for-loop walking from the end to the start
function reverseLoop(str) {
  let out = '';
  for (let i = str.length - 1; i >= 0; i--) {
    out += str[i];
  }
  return out;
}

// Way 3 — Array.prototype.reduce, prepending each character
function reverseReduce(str) {
  return [...str].reduce((acc, ch) => ch + acc, '');
}

// Way 4 — recursion: last char + reverse(rest)
function reverseRecursive(str) {
  if (str.length <= 1) return str;
  return str[str.length - 1] + reverseRecursive(str.slice(0, -1));
}

// Way 5 — spread + reverse (handles surrogate pairs / emoji better
// than split('') because the spread operator iterates by code point)
function reverseSpread(str) {
  return [...str].reverse().join('');
}

// ---------------------------------------------------------------
// Demo
// ---------------------------------------------------------------
const input = 'Bhaskara';
const expected = 'araksahB';

console.log(`input:    "${input}"`);
console.log(`split:    "${reverseSplit(input)}"`);
console.log(`loop:     "${reverseLoop(input)}"`);
console.log(`reduce:   "${reverseReduce(input)}"`);
console.log(`recursive:"${reverseRecursive(input)}"`);
console.log(`spread:   "${reverseSpread(input)}"`);
console.log(`expected: "${expected}"  -> match: ${reverseSplit(input) === expected}`);

module.exports = {
  reverseSplit,
  reverseLoop,
  reverseReduce,
  reverseRecursive,
  reverseSpread,
};
