# Challenge 1 — Answers

> Runnable code lives next to this file:
> [`q1-pattern.js`](q1-pattern.js) · [`q2-reverse.js`](q2-reverse.js) ·
> [`q3-duplicates.js`](q3-duplicates.js) · [`q5-layout.html`](q5-layout.html)
>
> Run the JS answers with Node, e.g. `node q1-pattern.js`.
> Open `q5-layout.html` in any browser to see all the layouts live.

---

## Question 1 — Print the number pattern

```
1
21
321
4321
...
n (n-1) ... 3 2 1
```

**Rule:** row `i` prints the numbers `i, i-1, … , 2, 1` (count **down** from `i`).
The final row for input `n` therefore has `n` digits — that is what the
"`nnnnn (n times)`" hint means: the last line is `n` characters long.

Four implementations are provided in [`q1-pattern.js`](q1-pattern.js), all
producing identical output:

1. **Nested `for` loops** — outer loop per row, inner loop counts down.
2. **Functional** — `Array.from` builds each row, `join('\n')` stitches them.
3. **Recursion** — a row is `start + buildRow(start-1)`; rows recurse 1→n.
4. **String slice trick** — build the full last row `"n…321"` once, then every
   earlier row is just its last `i` characters.

Verified output for `n = 5`:

```
1
21
321
4321
54321
```

> If the intended pattern was actually "the digit `n` repeated" (i.e. `2`→`22`,
> `3`→`333`), say the word — but the concrete sample rows `21`, `321`, `4321`
> are countdowns, so that is what is implemented.

---

## Question 2 — Reverse a string

`"Bhaskara"` → `"araksahB"`

Five implementations in [`q2-reverse.js`](q2-reverse.js):

1. **`split('').reverse().join('')`** — the idiomatic one-liner.
2. **`for` loop** — walk from the last index to the first, append each char.
3. **`reduce`** — prepend each character to an accumulator.
4. **Recursion** — `lastChar + reverse(rest)`.
5. **Spread `[...str].reverse().join('')`** — like #1 but iterates by Unicode
   code point, so it also handles emoji / surrogate pairs correctly.

All five print `"araksahB"`.

---

## Question 3 — Remove duplicates (keep first occurrence, preserve order)

Input `[1,2,3,6,4,3,7,4,2,6,8,2,5,9,0,1]`
→ Output `[1,2,3,6,4,7,8,5,9,0]`

Four implementations in [`q3-duplicates.js`](q3-duplicates.js):

1. **`[...new Set(arr)]`** — cleanest; a `Set` stores only unique values and
   preserves insertion order.
2. **`filter` + `indexOf`** — keep an item only at the index where it first
   appears.
3. **`reduce` + `includes`** — push a value into the result only if unseen.
4. **Loop + `Set` lookup** — O(n) time (the `indexOf`/`includes` versions are
   O(n²)); best choice for large arrays.

All four print `[1,2,3,6,4,7,8,5,9,0]`.

---

## Question 4 — CSS selectors

HTML under test (line numbers as given):

```html
1   <div id="container">
2       <div class="box"></div>
3
4       <div class="box2"></div>
5       <div>
6           <div class="box"></div>
7       </div>
8   </div>
9
10  <div class="box"></div>
```

Quick reference of every element that has a class:

| Line | Element                  | Is a `<div>`? | Has `class`? | class value |
|-----:|--------------------------|:-------------:|:------------:|-------------|
| 1    | `#container`             | yes           | no (`id`)    | —           |
| 2    | `.box`                   | yes           | yes          | `box`       |
| 4    | `.box2`                  | yes           | yes          | `box2`      |
| 5    | bare `<div>`             | yes           | no           | —           |
| 6    | `.box` (nested)          | yes           | yes          | `box`       |
| 10   | `.box` (top level)       | yes           | yes          | `box`       |

### `.box`  →  **lines 2, 6, 10**

- **Why these:** a class selector matches every element whose class list
  contains the token `box`. Lines 2, 6 and 10 each have `class="box"`.
- **Why not the others:** Line 1 has an `id`, not a class. **Line 4 is
  `class="box2"`** — class matching is on whole space-separated tokens, and
  the single token `box2` is **not** `box`, so it does not match. Line 5 is a
  `<div>` with no class. The remaining lines are blank/closing tags.

### `div .box`  →  **lines 2, 6**

- **Why these:** the **space** is a *descendant combinator*, so this reads
  "an element with class `box` that is nested **inside** a `<div>`." Line 2's
  box is inside `#container` (a div); line 6's box is inside the `<div>` on
  line 5 (and `#container`). Both qualify.
- **Why not the others:** **Line 10's box is at the top level** — its only
  ancestors are `<html>`/`<body>`, with **no `<div>` ancestor**, so the
  descendant rule excludes it. Line 4 is not a `box`. This is the key
  difference from plain `.box`: nesting inside a `<div>` is now required.

### `div.box`  →  **lines 2, 6, 10**

- **Why these:** with **no space**, `div.box` is a *compound* selector — a
  **single** element that is **both** a `<div>` **and** carries class `box`.
  Lines 2, 6 and 10 are each a `<div class="box">`.
- **Why not the others:** Line 4 is a `<div>` but its class is `box2`, not
  `box`. Line 1 is a `<div>` but has no `box` class.
- **Note:** here the result is the same as `.box` (2, 6, 10) only because every
  `box` element happens to be a `<div>`. If the markup contained, say,
  `<span class="box">`, plain `.box` would still match it but `div.box` would
  **not**.

### `[class]`  →  **lines 2, 4, 6, 10**

- **Why these:** an attribute-presence selector matches any element that simply
  **has** a `class` attribute, whatever its value. Lines 2 (`box`),
  **4 (`box2`)**, 6 (`box`) and 10 (`box`) all have a `class` attribute — so
  line 4 **is** included here even though it was excluded by `.box`.
- **Why not the others:** Line 1 has an `id` attribute but **no `class`**.
  Line 5 is a `<div>` with no attributes at all. Both are excluded.

### `#container .box`  →  **lines 2, 6**

- **Why these:** `#container` matches the element with `id="container"` (line 1),
  and the **space** is a *descendant combinator*, so this means "any `.box`
  **inside** `#container`, at any depth." Line 2 is a direct child of
  `#container`; line 6 is a deeper descendant (inside the `<div>` on line 5,
  which is itself inside `#container`). Both qualify.
- **Why not the others:** **Line 10's box is outside `#container`** (it is a
  sibling that comes after the closing `</div>` on line 8), so it has no
  `#container` ancestor and is excluded. Line 4 is `box2`, not `box`. (Note this
  gives the same result as `div .box` here — 2, 6 — because `#container` is the
  outermost div.)

### `#container > .box`  →  **line 2**

- **Why this one:** the **`>`** is the *child combinator* — it matches only
  `.box` elements that are **direct children** of `#container`. Line 2 is a
  direct child of `#container`, so it matches.
- **Why not the others:** **Line 6 is excluded** because it is a *grandchild*
  of `#container` (its direct parent is the `<div>` on line 5, not
  `#container`) — `>` does not reach descendants beyond one level. Line 10 is
  outside `#container` entirely. Line 4 is `box2`, not `box`. This is the
  strictest of the three "box inside container" selectors.

### Summary table

| Selector           | Selected lines | Note |
|--------------------|----------------|------|
| `.box`             | 2, 6, 10       | class token must equal `box` (so `box2` is out) |
| `div .box`         | 2, 6           | `.box` must be **nested inside** a div (line 10 isn't) |
| `div.box`          | 2, 6, 10       | element is **both** a div **and** `.box` |
| `[class]`          | 2, 4, 6, 10    | any element that **has** a class attribute |
| `#container .box`  | 2, 6           | any `.box` **descendant** of `#container` (line 10 is outside it) |
| `#container > .box`| 2              | only `.box` **direct children** of `#container` (line 6 is a grandchild) |

---

## Question 5 — Three-box layout

Required: 3 boxes in a row inside `#container`; **left** fixed 100px and
left-aligned, **right** fixed 100px and right-aligned, **middle** expands to
fill the remaining space when the container is resized, and **nothing
overlaps**.

```html
<div id="container">
  <div class="left fixed box"></div>
  <div class="middle expanding box"></div>
  <div class="right fixed box"></div>
</div>
```

Six different techniques are implemented and rendered side-by-side in
[`q5-layout.html`](q5-layout.html) (each container is drag-resizable so you can
watch the middle box flex). The CSS for each:

### Way 1 — Flexbox *(recommended)*

```css
#container { display: flex; }
.left, .right { flex: 0 0 100px; }   /* grow 0, shrink 0, basis 100px */
.middle       { flex: 1 1 auto; }    /* take all remaining space      */
```

`flex: 0 0 100px` locks the sides at exactly 100px; `flex: 1` on the middle
makes it absorb whatever width is left. Source order already puts left first
and right last, so alignment is automatic.

### Way 2 — CSS Grid

```css
#container { display: grid; grid-template-columns: 100px 1fr 100px; }
```

Three explicit tracks: a fixed 100px column, a flexible `1fr` column that eats
the leftover space, and another fixed 100px column. The most declarative option.

### Way 3 — Floats + margins *(classic, pre-flexbox)*

```css
.left  { float: left;  width: 100px; }
.right { float: right; width: 100px; }
.middle { margin: 0 100px; }              /* reserve room for both sides */
#container::after { content: ""; display: block; clear: both; } /* clearfix */
```

Float the two fixed boxes to the edges, then give the middle box left/right
margins of 100px so its content never slides under them. (For floats, the
middle box should come **after** the two floated boxes in the HTML.)

### Way 4 — Absolute positioning

```css
#container { position: relative; }
.left  { position: absolute; left: 0;  top: 0; width: 100px; }
.right { position: absolute; right: 0; top: 0; width: 100px; }
.middle { margin: 0 100px; }              /* sits between the pinned sides */
```

Pin the sides to the container's left/right edges; the in-flow middle box is
kept clear of them with 100px margins.

### Way 5 — `display: table`

```css
#container { display: table; width: 100%; }
.box { display: table-cell; }
.left, .right { width: 100px; }           /* middle has no width -> fills rest */
```

Table layout fixes the two 100px cells and automatically gives the remaining
width to the unsized middle cell.

### Way 6 — `inline-block` + `calc()`

```css
.box { display: inline-block; vertical-align: top; }
.left, .right { width: 100px; }
.middle { width: calc(100% - 200px); }    /* total minus the two fixed sides */
#container { font-size: 0; }               /* removes inline-block whitespace gaps */
```

Explicitly compute the middle width as the container width minus the two fixed
sides. Works, but `calc()`/whitespace make it the most finicky of the six.

**Recommendation:** Flexbox (Way 1) or Grid (Way 2) for any modern project —
they are the most readable, need no clearfix or whitespace hacks, and resize
cleanly. Floats/absolute/table are shown for completeness and legacy support.
