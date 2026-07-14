![@typhonjs-utils/object](https://i.imgur.com/FD0c0ib.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-utils/object.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-utils/object)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-utils/object/blob/main/LICENSE)
[![Build Status](https://github.com/typhonjs-node-utils/object/workflows/CI/CD/badge.svg)](#)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-node-utils/object.svg)](https://codecov.io/github/typhonjs-node-utils/object)
[![API Docs](https://img.shields.io/badge/API%20Documentation-476ff0)](https://typhonjs-node-utils.github.io/object/)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://typhonjs.io/discord/)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

A focused collection of JavaScript and TypeScript utilities for validating, inspecting, traversing, comparing, and modifying objects.

The package combines conventional object helpers with strongly typed property-path operations. Property paths may be expressed as dotted strings for ordinary object properties or as exact `PropertyKey` arrays when symbols, numeric array indexes, or property names containing periods must be preserved.

The package also re-exports the cloning API from `klona/full`.

## Highlights

- Runtime assertions and TypeScript type guards for objects, records, plain objects, and iterables.
- Typed property-path access with inferred return values.
- Exact string, number, and symbol path segments through `SafeAccessor`.
- Numeric-only array indexing with ECMAScript array-index validation.
- Symbol-aware property existence checks and traversal.
- Protected object mutation that blocks prototype-pollution paths and ECMAScript well-known symbols.
- Iterative deep freeze, seal, and merge operations.
- Source-driven shallow structural comparison across nested property paths.
- Utilities for getters, setters, prototypes, keys, sizes, and non-empty iterables.

## Importing

When using the package directly, the utilities are available from:

```ts
import {
   hasProperty,
   isPlainObject,
} from '@typhonjs-utils/object';
```


Within TRL, the utilities are available from:

```ts
import {
   hasProperty,
   isPlainObject,
} from '#runtime/util/object';
```

The package re-exports `klona/full`, so its cloning function is available from the same module:

```ts
import { klona } from '#runtime/util/object';
```

## Property paths

Several functions accept a `SafeAccessor`:

```ts
type SafeAccessor = string | readonly PropertyKey[];
```

### Dotted string accessors

Dotted strings are convenient for ordinary nested object properties:

```ts
const data = {
   user: {
      profile: {
         name: 'Ada'
      }
   }
};

safeAccess(data, 'user.profile.name');
// 'Ada'
```

A dotted string is split at every period. It therefore cannot represent a literal property name containing `.` and cannot index arrays.

```ts
safeAccess({ 'user.name': 'Ada' }, 'user.name');
// Attempts to resolve data.user.name, not data['user.name'].

safeAccess({ items: ['a'] }, 'items.0');
// Returns the default value because array indexes require numeric keys.
```

### Exact property-key accessors

Array accessors preserve every key exactly and support strings, numbers, and symbols:

```ts
const metadata = Symbol('metadata');

const data = {
   'user.name': 'Ada',
   items: ['a', 'b'],
   [metadata]: {
      active: true
   }
};

safeAccess(data, ['user.name']);
// 'Ada'

safeAccess(data, ['items', 1]);
// 'b'

safeAccess(data, [metadata, 'active']);
// true
```

Array indexes must be numbers in the range `0` through `0xFFFF_FFFE`. String indexes, negative numbers, fractional numbers, and values outside the ECMAScript array-index range are rejected.

Inline accessor arrays retain tuple inference through a TypeScript `const` type parameter:

```ts
const result = safeAccess(data, ['items', 0]);
// Inferred from the exact path.
```

## Property-path behavior

A few distinctions are intentional:

- `safeAccess` returns its default value when the resolved value is `undefined` or `null`.
- `hasProperty` checks whether the complete path exists, so present `undefined` and `null` values return `true`.
- Property lookup includes inherited properties.
- Functions may be traversed as intermediate values by the internal property resolver.
- Empty string and empty array accessors are considered invalid paths.

```ts
const data = {
   undefinedValue: undefined,
   nullValue: null
};

safeAccess(data, 'undefinedValue', 'fallback');
// 'fallback'

hasProperty(data, 'undefinedValue');
// true

hasProperty(data, 'nullValue');
// true

hasProperty(data, 'missing');
// false
```

## API overview

### Assertions

| Function | Description |
| --- | --- |
| `assertObject` | Asserts that a value is a non-null, non-array object while preserving its existing static type. |
| `assertPlainObject` | Asserts that a value has either `Object.prototype` or `null` as its prototype while preserving its existing static type. |
| `assertRecord` | Asserts that a value is a non-null, non-array object and narrows it to a string-keyed record without discarding its known shape. |

### Type guards

| Function | Description |
| --- | --- |
| `isObject` | Returns whether a value is a non-null, non-array object, preserving a known object type when possible. |
| `isPlainObject` | Returns whether a value is a plain object created with `Object.prototype` or a `null` prototype. |
| `isRecord` | Returns whether a value is a non-null, non-array object and narrows it to `Record<string, unknown>`. |
| `isIterable` | Returns whether a non-null object provides `Symbol.iterator`; primitive strings are intentionally excluded. |
| `isAsyncIterable` | Returns whether a non-null object provides `Symbol.asyncIterator`. |

### Property descriptors and prototypes

| Function | Description |
| --- | --- |
| `hasAccessor` | Checks the object and its prototype chain for a property descriptor containing both a getter and setter. |
| `hasGetter` | Checks the object and its prototype chain for a getter descriptor. |
| `hasSetter` | Checks the object and its prototype chain for a setter descriptor. |
| `hasPrototype` | Determines whether a constructor is, or inherits from, another constructor. |
| `hasProperty` | Returns whether a complete `SafeAccessor` path exists, aborting as soon as resolution fails. |

### Property-path utilities

| Function | Description |
| --- | --- |
| `safeAccess` | Resolves a dotted string or exact property-key path and returns a typed value or supplied default. |
| `safeSet` | Sets or updates a value at a property path with optional missing-object creation and mutation hardening. |
| `safeKeyIterator` | Iteratively yields enumerable leaf paths as readonly `PropertyKey` arrays. |
| `safeEqual` | Verifies that every traversed leaf in a source object resolves to the same value in a target object. |

### Object graph utilities

| Function | Description |
| --- | --- |
| `deepMerge` | Recursively merges one or more plain source objects into a plain target object in place. |
| `deepFreeze` | Iteratively freezes an object graph, including values stored in arrays. |
| `deepSeal` | Iteratively seals an object graph, including values stored in arrays. |
| `klona` | Deep-clones values through the API re-exported from `klona/full`. |

### Iterable utilities

| Function | Description |
| --- | --- |
| `ensureNonEmptyIterable` | Returns `undefined` for a missing, invalid, or empty iterable; otherwise returns an iterable containing the peeked first value and remaining values. |
| `ensureNonEmptyAsyncIterable` | Performs the equivalent operation for async iterables and may lift a synchronous iterable into an async iterable. |

### General helpers

| Function | Description |
| --- | --- |
| `objectKeys` | Returns typed enumerable own string keys for an object, or an empty array for an invalid runtime input. |
| `objectSize` | Returns the size of maps, sets, boxed strings, arrays, and enumerable string-keyed objects according to their supported representation. |

## Safe access

`safeAccess` provides compile-time inference for known string paths and readonly tuple paths:

```ts
const state = {
   settings: {
      enabled: true
   },
   entries: [
      { id: 1 },
      { id: 2 }
   ]
};

const enabled = safeAccess(state, 'settings.enabled');
// boolean

const id = safeAccess(state, ['entries', 1, 'id']);
// number

const missing = safeAccess(state, 'settings.label', 'Unnamed');
// string
```

The supplied default is returned when:

- `data` is not a valid object.
- The accessor is invalid or empty.
- An intermediate property is missing.
- An intermediate value cannot be traversed.
- An array segment is not a valid numeric array index.
- The final value is `undefined` or `null`.

Use `hasProperty` when the distinction between a missing property and a present `undefined` or `null` property matters.

## Property existence

`hasProperty` resolves a path with early termination:

```ts
const data = {
   user: {
      name: undefined
   },
   entries: ['first']
};

hasProperty(data, 'user.name');
// true

hasProperty(data, 'user.email');
// false

hasProperty(data, ['entries', 0]);
// true

hasProperty(data, ['entries', '0']);
// false
```

Inherited properties are considered available because path resolution uses JavaScript property lookup semantics.

## Safe mutation

`safeSet` supports direct assignment and basic arithmetic operations:

```ts
const data = {
   count: 2,
   settings: {
      enabled: false
   }
};

safeSet(data, 'settings.enabled', true);
safeSet(data, 'count', 3, { operation: 'add' });

data.count;
// 5
```

### Operations

| Operation | Effect |
| --- | --- |
| `set` | Assigns the supplied value. |
| `set-undefined` | Assigns only when the current value is `undefined`. |
| `add` | Applies `+=`. |
| `sub` | Applies `-=`. |
| `mult` | Applies `*=`. |
| `div` | Applies `/=`. |

The default operation is `set`.

### Creating missing objects

By default, every intermediate path segment must already resolve to an object:

```ts
const data = {};

safeSet(data, 'settings.enabled', true);
// false
```

Set `createMissing` to create missing intermediate object entries:

```ts
safeSet(data, 'settings.enabled', true, {
   createMissing: true
});
// true
```

Missing entries are created as ordinary objects. The function does not infer that a missing segment should be an array.

### Mutation safety

`safeSet` rejects the following string path segments:

- `__proto__`
- `prototype`
- `constructor`

It also rejects ECMAScript well-known symbols, including protocol hooks such as:

- `Symbol.iterator`
- `Symbol.toPrimitive`
- `Symbol.toStringTag`

This prevents prototype-pollution paths and modification of built-in language protocols through the generic mutation API. User-created symbols and symbols produced by `Symbol.for` remain valid.

Validation occurs during traversal. When `createMissing` is enabled, earlier missing segments may already have been created before a later blocked or invalid segment causes the operation to return `false`.

## Property-path iteration

`safeKeyIterator` performs an iterative depth-first traversal and yields readonly arrays suitable for `safeAccess`, `hasProperty`, and `safeSet`:

```ts
const marker = Symbol('marker');

const data = {
   user: {
      name: 'Ada'
   },
   entries: ['a', 'b'],
   [marker]: true
};

[...safeKeyIterator(data)];
// Example:
// [
//    [marker],
//    ['entries', 0],
//    ['entries', 1],
//    ['user', 'name']
// ]
```

The exact order follows the iterator's depth-first traversal rules. Array indexes are emitted immediately when an array property is encountered, preserving the established array ordering.

Behavioral details:

- Enumerable own string and symbol properties are included by default.
- Set `hasOwnOnly: false` to include enumerable inherited properties.
- Set `arrayIndex: false` to omit numeric array indexes.
- Enumerable symbol properties attached to arrays remain included when `arrayIndex` is false.
- Functions are excluded as leaf values.
- Objects are traversed recursively.
- Array elements are yielded as indexed leaf paths rather than recursively traversed.
- `Map` and `Set` entries are not traversed.
- Literal string keys containing periods remain unambiguous because paths are arrays.

## Source-driven equality

`safeEqual` is a source-driven structural comparison rather than a symmetric general-purpose deep-equality function:

```ts
safeEqual(
   { settings: { enabled: true } },
   { settings: { enabled: true }, extra: 42 }
);
// true
```

Every leaf path produced from `source` must exist in `target` and resolve to the same value. Extra target properties are ignored.

Values are compared with strict equality:

- Primitive leaves compare by value and type.
- Object and function leaves compare by reference.
- `NaN` does not equal `NaN`.
- `0` and `-0` compare as equal.
- Present `undefined` and `null` properties remain distinct from missing properties.

Arrays are compared by their numeric element paths. Object values stored in arrays are therefore compared by reference rather than recursively by their internal properties.

```ts
const shared = { id: 1 };

safeEqual({ entries: [shared] }, { entries: [shared] });
// true

safeEqual({ entries: [{ id: 1 }] }, { entries: [{ id: 1 }] });
// false
```

Options:

```ts
safeEqual(source, target, {
   arrayIndex: false,
   hasOwnOnly: false
});
```

- `arrayIndex: false` ignores numeric array elements.
- `hasOwnOnly: false` includes enumerable inherited properties.

## Deep merge

`deepMerge` mutates and returns the target:

```ts
const target = {
   settings: {
      enabled: false,
      mode: 'basic'
   }
};

deepMerge(target, {
   settings: {
      enabled: true
   }
});

// {
//    settings: {
//       enabled: true,
//       mode: 'basic'
//    }
// }
```

Only plain object inputs are accepted. Nested values are recursively merged when both the source and target values are object literals. Other values, including arrays, replace the target value.

Later source objects take precedence over earlier sources:

```ts
deepMerge({}, defaults, userOptions, runtimeOverrides);
```

## Deep freeze and seal

`deepFreeze` and `deepSeal` use iterative traversal, avoiding recursive call-stack growth for deeply nested object graphs.

```ts
const frozen = deepFreeze({
   settings: {
      enabled: true
   }
});

Object.isFrozen(frozen);
Object.isFrozen(frozen.settings);
// true
```

Both functions accept an optional `skipKeys` set:

```ts
deepFreeze(data, {
   skipKeys: new Set(['cache'])
});
```

`skipKeys` applies to traversed object string keys. The containing object is still frozen or sealed; the referenced child is simply omitted from further traversal through that key.

## Non-empty iterables

`ensureNonEmptyIterable` safely peeks at an iterable:

```ts
const values = ensureNonEmptyIterable([1, 2, 3]);

if (values)
{
   for (const value of values)
   {
      // 1, 2, 3
   }
}
```

It returns `undefined` when the input is missing, non-iterable, or empty. For one-shot iterators, the returned iterable preserves the already-consumed first item before continuing with the original iterator.

`ensureNonEmptyAsyncIterable` provides the same behavior for async iteration:

```ts
const values = await ensureNonEmptyAsyncIterable(source);

if (values)
{
   for await (const value of values)
   {
      // ...
   }
}
```

Synchronous iterables may also be lifted into an async iterable.

## Object checks

The object predicates intentionally provide different narrowing behavior:

```ts
interface Options
{
   enabled?: boolean;
}

declare const input: Options | undefined;

if (input && isObject(input))
{
   input.enabled;
   // Existing Options shape is retained.
}
```

Use:

- `isObject` when a known object type should be preserved.
- `isRecord` when generic string-keyed access is required.
- `isPlainObject` when class instances, arrays, and custom prototypes must be excluded.
- The corresponding assertion functions when invalid input should throw instead of returning `false`.

## Getter, setter, and prototype checks

Descriptor utilities inspect both the instance and its prototype chain:

```ts
class Example
{
   #value = 0;

   get value(): number
   {
      return this.#value;
   }

   set value(value: number)
   {
      this.#value = value;
   }
}

const example = new Example();

hasAccessor(example, 'value');
// true

hasGetter(example, 'value');
// true

hasSetter(example, 'value');
// true
```

`hasPrototype` operates on constructors:

```ts
class Base {}
class Derived extends Base {}

hasPrototype(Derived, Base);
// true
```

## TypeScript notes

- Exact tuple accessors provide the strongest `safeAccess` inference.
- Runtime-sized `PropertyKey[]` accessors resolve to `unknown` at the type level because their path cannot be determined statically.
- Dotted string inference is supported for object properties but intentionally rejects traversal into arrays.

## Scope and limitations

These utilities focus on ordinary JavaScript objects and arrays:

- `Map` and `Set` entries are not traversed by `safeKeyIterator` or compared by `safeEqual`.
- Property access may invoke getters and proxy traps.
- `safeEqual` is asymmetric and source-driven.
- Array element objects are compared by reference.
- `safeSet` creates missing intermediate segments as objects, not arrays.
- Dotted string paths cannot represent literal periods, symbols, or array indexes.
- The package does not attempt to serialize symbols into string paths.

Use exact property-key arrays whenever correctness across the complete JavaScript property-key space is required.
