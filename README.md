![@typhonjs-utils/object](https://i.imgur.com/FD0c0ib.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-utils/object.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-utils/object)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-utils/object/blob/main/LICENSE)
[![Build Status](https://github.com/typhonjs-node-utils/object/workflows/CI/CD/badge.svg)](#)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-node-utils/object.svg)](https://codecov.io/github/typhonjs-node-utils/object)
[![API Docs](https://img.shields.io/badge/API%20Documentation-476ff0)](https://typhonjs-node-utils.github.io/object/)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://typhonjs.io/discord/)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

A focused JavaScript and TypeScript library for working safely and precisely with object structures.

`@typhonjs-utils/object` combines conventional object utilities with a structural property-path system that understands the complete JavaScript `PropertyKey` space: strings, numeric array indexes, and symbols. It provides typed access and inspection, hardened mutation, bounded traversal, structural comparison, deep object operations, iterable helpers, and trie-backed property-path collections.

The API is designed around predictable runtime semantics and strong TypeScript inference. Known object shapes are preserved by guards and assertions, literal property paths infer exact result types, deep merges infer the accumulated output shape, and collection overloads refine iterator results from literal options.

## Highlights

- Strongly inferred dotted and exact tuple property paths.
- Exact string, number, and symbol path segments without delimiter ambiguity.
- Object guards and assertions that preserve existing interface, class, and union types.
- Getter-safe property existence, descriptor, and owner inspection.
- Prototype-pollution-resistant assignment and deletion.
- Iterative, bounded object traversal with depth, result, and visit controls.
- Trie-backed structural path maps with subtree and candidate-object matching.
- Weak-root structural path associations without retaining root objects.
- Deep merge, freeze, seal, and cloning operations.
- Synchronous and asynchronous iterable validation and non-empty replay.

## Installation and importing

```shell
npm install @typhonjs-utils/object
```

Direct package import:

```ts
import {
   PropertyPathMap,
   safeAccess,
   safeSet
} from '@typhonjs-utils/object';
```

## TypeScript inference

Type inference is a primary design constraint rather than an afterthought.

### Exact property-path results

Dotted paths infer nested object properties:

```ts
const state = {
   settings: {
      enabled: true,
      label: 'Primary'
   }
};

const enabled = safeAccess(state, 'settings.enabled');
// boolean
```

Readonly tuple paths preserve exact numeric and symbol segments through a `const` type parameter:

```ts
const metadata = Symbol('metadata');

const state = {
   entries: [
      { id: 1 },
      { id: 2 }
   ],
   [metadata]: {
      active: true
   }
};

const id = safeAccess(state, ['entries', 1, 'id']);
// number

const active = safeAccess(state, [metadata, 'active']);
// boolean
```

A supplied default participates in the result type only when the property path may resolve to `undefined`:

```ts
declare const options: {
   label?: string;
};

const label = safeAccess(options, 'label', 'Untitled');
// string
```

### Shape-preserving guards and assertions

Known object types remain known:

```ts
interface Options
{
   enabled?: boolean;
   timeout?: number;
}

declare const value: Options | undefined;

if (isObject(value))
{
   value.timeout;
   // value: Options
}
```

Assertions remove invalid union members without widening the surviving type:

```ts
assertPlainObject(value);
// value: Options
```

Use `isRecord` when generic string-key indexing is desired, or `assertRecord` when the existing shape should be preserved while adding `PropertyKey` indexing.

### Inferred deep merge results

`deepMerge` accumulates source shapes in order and reflects later-key precedence:

```ts
const result = deepMerge(
   { enabled: false },
   { theme: 'dark' as const },
   { enabled: true, retries: 3 }
);

// {
//    theme: 'dark';
//    enabled: boolean;
//    retries: number;
// }
```

## Structural property paths

Path-aware APIs accept:

```ts
type PropertyPath = string | readonly PropertyKey[];
```

Dotted strings are concise for ordinary nested string keys:

```ts
safeAccess(data, 'user.profile.name');
```

Exact arrays preserve keys that dotted syntax cannot represent:

```ts
safeAccess(data, ['user.name']);        // Literal period.
safeAccess(data, ['entries', 0]);       // Numeric array index.
safeAccess(data, [metadata, 'active']); // Symbol key.
safeAccess(data, ['', 'value']);        // Empty-string key.
```

Numeric array indexes must be numbers in the ECMAScript array-index range. String indexes such as `'0'` are intentionally rejected when traversing arrays.

Property paths can also be validated, normalized, concatenated, compared by structural prefix, and converted back to dotted form when the conversion is lossless.

## Property access, inspection, and mutation

The access API separates value lookup from structural inspection:

```ts
const value = getProperty(data, path);
// Preserves present undefined and null.

const valueOrDefault = safeAccess(data, path, fallback);
// Uses fallback for missing or nullish values.

const exists = hasProperty(data, path);
// Does not read the terminal property value.

const descriptor = getPropertyDescriptor(data, path);
// Does not invoke a terminal getter.

const owner = getPropertyOwner(data, path);
// Returns the object or prototype defining the terminal property.
```

`safeSet` and `deleteProperty` reject prototype-pollution segments and ECMAScript well-known symbols. `safeSet` supports direct assignment, conditional assignment, arithmetic updates, and optional creation of missing object segments. `deleteProperty` supports explicit inherited-property handling and only removes configurable properties.

Property access may invoke getters or proxy traps when intermediate values must be read. Exceptions from user-defined accessors and proxies are intentionally propagated.

## Traversal and comparison

`pathKeyIterator` performs iterative, symbol-aware traversal and yields exact readonly property-key arrays:

```ts
for (const path of pathKeyIterator(data, {
   arrayIndex: true,
   maxDepth: 8,
   maxResults: 1_000,
   maxVisits: 10_000
}))
{
   // path: readonly PropertyKey[]
}
```

Traversal can be constrained to a `prefixPath`, pruned at a `stopPath`, restricted to own properties, and bounded by depth, result, and visit budgets.

`safeEqual` is a source-driven structural comparison. Every enumerable source path must exist in the target and resolve to the same value; additional target properties are ignored. It is intentionally not a symmetric general-purpose deep-equality algorithm.

## Property-path collections

### `PropertyPathMap<V>`

`PropertyPathMap` is a map keyed by structural property paths rather than accessor-array identity:

```ts
const fields = new PropertyPathMap<string>();

fields.set('actor.system.hp', 'hp');
fields.set(['actor', 'items', 0, 'name'], 'first-item');
fields.set([metadata, 'enabled'], 'metadata-enabled');

fields.get(['actor', 'system', 'hp']);
// 'hp'
```

Equivalent dotted and string-array paths resolve to the same entry. Numeric and string segments remain distinct, and symbols compare by identity.

The collection provides:

- `Map`-style `set`, `get`, `has`, `delete`, `clear`, iteration, and `forEach`.
- Canonical frozen path arrays and insertion-order base iteration.
- `matchingEntries`, `matchingKeys`, and `matchingValues` for testing stored paths against a candidate object with shared-prefix pruning.
- `subtreeEntries`, `subtreeKeys`, and `subtreeValues` for candidate-independent trie traversal.
- Absolute `pathPrefix` and `stopAt` bounds.
- Optional inclusion of the candidate property value in matching results.
- Configurable path-depth, entry, trie-node, result, and visit limits.
- Atomic insertion preflight so failed limit checks do not leave partial trie state.
- Incremental `nodeCount` inspection.

Exact lookup is proportional to path length. Trie-aware matching avoids independently resolving every stored path and rejects unavailable branches at their shared prefix.

### `WeakPropertyPathMap<R, V>`

`WeakPropertyPathMap` associates a `PropertyPathMap` with each weakly held root object or function:

```ts
const bindings = new WeakPropertyPathMap<object, string>();
const document = {};

bindings.set(document, 'system.hp.value', 'hp-binding');
bindings.get(document, ['system', 'hp', 'value']);
// 'hp-binding'
```

Each root receives an independent trie and independent resource limits. Roots are not globally enumerable, matching normal `WeakMap` semantics. Deleting the final path beneath a root removes its per-root trie immediately, while an otherwise unreachable root and all associated paths remain eligible for garbage collection.

The weak collection exposes exact path operations, root membership and deletion, candidate matching, subtree iteration, and constant-time `clear`.

## API by functional group

### Object validation

| Function | Purpose |
| --- | --- |
| `isNonNullObject` | Tests for a non-null object, including arrays, while preserving known object types where possible. |
| `assertNonNullObject` | Asserts a non-null object, including arrays, while preserving the value's existing static type. |
| `isObject` | Tests for a non-null, non-array object while preserving known object types. |
| `assertObject` | Asserts the same runtime category while preserving the existing static type. |
| `isObjectOrFunction` | Tests for any non-null object or function, including arrays and constructors. |
| `assertObjectOrFunction` | Asserts an object-or-function reference while filtering primitive union members. |
| `isOrdinaryObject` | Tests for the library's tag-based ordinary-object category, including class instances but excluding specialized built-ins. |
| `assertOrdinaryObject` | Asserts an ordinary object while preserving the existing static type. |
| `isPlainObject` | Tests for an object whose prototype is `Object.prototype` or `null`. |
| `assertPlainObject` | Asserts a plain object while preserving the existing static type. |
| `isRecord` | Narrows a non-null, non-array object to `Record<string, unknown>`. |
| `assertRecord` | Preserves the existing type and adds `Record<PropertyKey, unknown>` indexing. |

### Collections and public types

| Export | Purpose |
| --- | --- |
| `PropertyPathMap<V>` | Trie-backed structural property-path map with matching, subtree traversal, and defensive limits. |
| `WeakPropertyPathMap<R, V>` | Weak-root association of independently limited structural property-path maps. |
| `PropertyPath` | Dotted string or exact readonly `PropertyKey` array. |
| `PropertyPathTraversalLimits` | Shared `maxDepth`, `maxResults`, and `maxVisits` controls. |
| `PathKeyIteratorOptions` | Object traversal options including ownership and absolute path bounds. |
| `NonNullObject<T>` | Extracts the non-null, non-callable object members of a type, including arrays and specialized built-in objects. |

### Property keys and paths

| Function | Purpose |
| --- | --- |
| `isPropertyKey` | Tests for a string, number, or symbol property key. |
| `isArrayIndex` | Tests for a numeric ECMAScript array index. |
| `isPropertyPath` | Validates a non-empty dotted string or exact property-key array. |
| `normalizePropertyPath` | Converts a path to its canonical readonly property-key array form. |
| `concatPropertyPath` | Normalizes and concatenates one or more paths. |
| `joinPropertyPath` | Converts an exact path to dotted form when lossless. |
| `isPropertyPathPrefix` | Tests whether one normalized path equals or structurally prefixes another. |

### Property access and inspection

| Function | Purpose |
| --- | --- |
| `safeAccess` | Resolves a strongly inferred path and applies an optional nullish fallback. |
| `getProperty` | Resolves a strongly inferred path while preserving present `undefined` and `null`. |
| `hasProperty` | Tests complete path existence without reading the terminal value. |
| `getPropertyDescriptor` | Returns the terminal property descriptor without invoking a terminal getter. |
| `getPropertyOwner` | Returns the object or prototype that owns the terminal property. |

### Property mutation

| Function | Purpose |
| --- | --- |
| `safeSet` | Performs hardened path assignment, conditional assignment, or arithmetic update. |
| `deleteProperty` | Deletes a configurable path with hardened keys and explicit prototype handling. |

### Object traversal and comparison

| Function | Purpose |
| --- | --- |
| `pathKeyIterator` | Yields bounded, exact enumerable property paths with symbol and optional array-index support. |
| `safeEqual` | Performs source-driven structural path and value comparison. |

### Deep object operations

| Function | Purpose |
| --- | --- |
| `deepMerge` | Merges source objects into a target with inferred accumulated output typing. |
| `deepFreeze` | Iteratively freezes a traversed object graph. |
| `deepSeal` | Iteratively seals a traversed object graph. |
| `klona` | Deep-clones a value through the re-exported `klona/full` implementation. |

### Accessors and prototypes

| Function | Purpose |
| --- | --- |
| `hasAccessor` | Tests for both getter and setter descriptors through the prototype chain. |
| `hasGetter` | Tests for a getter descriptor through the prototype chain. |
| `hasSetter` | Tests for a setter descriptor through the prototype chain. |
| `hasPrototype` | Tests whether a constructor matches or inherits from another constructor. |

### Iterable utilities

| Function | Purpose |
| --- | --- |
| `isIterable` | Tests for synchronous iteration while intentionally excluding primitive strings. |
| `isAsyncIterable` | Tests for asynchronous iteration. |
| `ensureNonEmptyIterable` | Peeks and returns a replaying iterable only when at least one value exists. |
| `ensureNonEmptyAsyncIterable` | Provides the equivalent behavior for async or synchronous iterable input. |

### General object utilities

| Function | Purpose |
| --- | --- |
| `objectKeys` | Returns typed enumerable own string keys with safe fallback behavior. |
| `objectSize` | Determines the supported size of objects, arrays, maps, sets, and strings. |

## Scope and semantics

- Dotted strings cannot represent literal periods, symbols, numeric array indexes, or a single empty-string key; use exact arrays for those cases.
- `Map` and `Set` entries are not traversed by `pathKeyIterator` or compared structurally by `safeEqual`.
- Array elements are terminal traversal paths even when they contain objects.
- `safeEqual` is asymmetric and source-driven.
- `safeSet` creates missing intermediate segments as objects, not arrays.
- Property access and matching may invoke getters and proxy traps when intermediate or requested terminal values must be read.
- Traversal and collection limits are configurable so trusted workloads can raise them explicitly.

For exhaustive signatures, option semantics, complexity notes, and edge cases, please see the [API documentation](https://typhonjs-node-utils.github.io/object/).
