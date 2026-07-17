# Changelog
## 0.7.0 release (major)

### Added

* Added configurable resource limits for `PropertyPathMap` and `WeakPropertyPathMap`, including maximum stored path
depth, entry count, trie node count, traversal result count, and traversal visit count.
* Added `maxDepth`, `maxResults`, and `maxVisits` bounds to property-path traversal iterators.
* Added `nodeCount` inspection for tracking allocated `PropertyPathMap` trie nodes.
* Added `isOrdinaryObject` and `assertOrdinaryObject` for identifying tag-based ordinary objects, including plain
objects, custom-prototype objects, and ordinary class instances while excluding arrays and specialized built-ins.
* Added `isObjectOrFunction` and `assertIsObjectOrFunction` for validating any non-null JavaScript reference value,
including arrays, functions, and class constructors.
* Expanded record-oriented type guards and assertions to support `Record<PropertyKey, unknown>`, including symbol-keyed
access.

### Changed

* Consolidated property-path validation, normalization, structural comparison, traversal bounds, traversal budgets,
limit validation, and object/function traversability into shared canonical utilities.
* Updated internal consumers to use publicly exported predicates and property-path utilities when their semantics are
identical, reducing duplicate implementations.
* Refactored `PropertyPathMap` insertion to preflight path, entry, and node limits before mutating trie state.
* Updated `WeakPropertyPathMap` to apply the configured resource limits independently to each weak root and to create
per-root tries only after successful validation.
* Standardized strict non-negative safe-integer validation for depth, result, visit, entry, and node limits.
* Preserved canonical frozen property paths for stored entries and deterministic traversal order.
* Clarified the distinction between broad objects, object-or-function reference values, ordinary objects, plain objects,
and indexable records.
* Documented the observable effects of getters, Proxies, revoked Proxies, and `Symbol.toStringTag` during object
classification and property traversal.

### Fixed

* Prevented failed `PropertyPathMap` insertions from leaving partially allocated trie branches or modified collection
state.
* Ensured trie node accounting remains accurate after insertion, deletion, descendant removal, and branch cleanup.
* Ensured deleting the final path beneath a `WeakPropertyPathMap` root removes the now-empty root association.
* Ensured traversal options are validated consistently even when a collection or weak root contains no matching entries.
* Prevented traversal result limits from affecting equality correctness; equality traversal remains bounded by visit
limits without silently accepting truncated comparisons.
* Ensured terminal getters are not read unless their property value is requested and are read at most once when needed.

### Security

* Added bounded traversal and storage controls to reduce denial-of-service risk from excessively deep paths, broad
tries, or unbounded result generation.
* Preserved prototype-pollution key rejection and well-known symbol mutation guards across normalized structural paths.
* Added atomic mutation preflight so validation and resource-limit failures cannot leave partially modified collection
state.
* Hardened constructor and iterator option validation against fractional, negative, non-finite, and unsafe integer
values.

## 0.6.0 release (major)

This release expands and hardens the object utility package, with a focus on property-path access, traversal, deep
merging, symbols, and circular-reference safety.

### Property-path support

Property-path APIs now accept dotted strings or exact `PropertyKey` arrays:

```ts
type PropertyPath = string | readonly PropertyKey[];
```

Exact arrays support:

* String, number, and symbol keys.
* Numeric array indexes.
* Property names containing literal periods.
* Mixed object and array paths.

Array traversal requires numeric indexes validated against the ECMAScript array-index range.

### New `hasProperty`

Added `hasProperty` to determine whether a complete accessor path exists.

Unlike `safeAccess`, properties containing `undefined` or `null` are considered present:

```ts
hasProperty({ value: undefined }, 'value'); // true
hasProperty({ value: null }, 'value');      // true
hasProperty({}, 'value');                   // false
```

Inherited properties follow normal JavaScript lookup semantics.

### Improved `safeAccess`

`safeAccess` now supports exact property-key arrays and stronger tuple-based TypeScript inference.

Additional changes:

* Rejects invalid and empty accessors.
* Rejects primitive intermediate values.
* Enforces numeric array indexes.
* Reads each property once, avoiding duplicate getter or proxy-trap invocation.
* Returns the supplied default for unresolved, `undefined`, or `null` values.

The internal `DeepAccess` types were updated to match runtime behavior.

### Improved `safeSet`

`safeSet` now supports string, number, and symbol path segments.

Mutation paths reject:

* `__proto__`
* `prototype`
* `constructor`
* ECMAScript well-known symbols such as `Symbol.iterator`, `Symbol.toPrimitive`, and `Symbol.toStringTag`

User-created symbols and `Symbol.for` symbols remain supported.

Existing operations remain available:

* `set`
* `set-undefined`
* `add`
* `sub`
* `mult`
* `div`

### Symbol-aware traversal

`pathKeyIterator` now yields readonly `PropertyKey` arrays instead of dotted strings.

Traversal supports:

* Enumerable string and symbol properties.
* Numeric array indexes.
* Symbol properties attached to arrays.
* Optional inherited enumerable properties.

Array index ordering remains compatible with the previous implementation.

### Circular-reference detection

Circular object paths are now detected by:

* `deepMerge`
* `pathKeyIterator`
* `safeEqual`

Detection is path-local, allowing shared references while rejecting true ancestor cycles.

```ts
const shared = { value: 1 };

const data = {
   first: shared,
   second: shared
};
```

Shared references remain valid; direct or indirect cycles throw a descriptive `TypeError`.

### Improved `safeEqual`

`safeEqual` now distinguishes missing properties from properties explicitly containing `undefined` or `null`.

It remains source-driven:

* All source leaves must exist in the target.
* Extra target properties are ignored.
* Primitive values use strict equality.
* Object values stored in arrays compare by reference.
* `Map` and `Set` entries are not traversed.

### Corrected `deepMerge`

The iterative multi-source merge implementation was corrected so each source completes before the next source is processed.

Additional improvements:

* Correct nested merging across multiple sources.
* Support for top-level class instances.
* Recursive merging restricted to plain objects.
* Enumerable symbol-key support.
* Preservation of normal and null-prototype objects.
* Circular source detection.
* Blocked prototype keys skipped at every depth.
* Nested plain objects sanitized instead of assigned wholesale.
* Later-source precedence preserved.

Blocked properties are skipped rather than failing the entire merge.

### Improved deep freeze and seal

`deepFreeze` and `deepSeal` now traverse enumerable symbol-keyed children in addition to string keys and array entries.

Both remain iterative and continue to support `skipKeys`.

### Validation improvements

Internal validation now distinguishes between:

* Plain objects.
* Merge-compatible objects.
* Traversable values.

Plain-object detection now uses prototype inspection rather than `constructor`, improving support for null-prototype objects and class instances.

## 0.5.0 release (major)
- Improved `isObject` / `isPlainObject` type guard / types passthrough.
- Added: 
  - `assertObject`  
  - `assertPlainObject`  
  - `assertRecord`  
  - `ensureNonEmptyAsyncIterable` 
  - `ensureNonEmptyIterable` 
  - `isRecord` 

## 0.4.0 release (minor)
- Fix regression in  `isPlainObject`.

## 0.3.0 release (minor)
- Added `main` field to package.json (required by `esm-d-ts` for test cases using this package without `node resolve`).

## 0.2.0 release (major)
- Removed several superfluous functions including validation functions.
- Strengthened all functions for Typescript type guards and automatic inference. 
- 100% test coverage.

## 0.1.0 release
- Initial release
