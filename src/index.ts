/**
 * Provides JavaScript and TypeScript utilities for validating, inspecting, traversing, comparing, cloning, and
 * modifying object structures. The API is designed for general-purpose object handling while preserving strong
 * TypeScript inference and predictable runtime behavior.
 *
 * The package includes runtime assertions and type guards for objects, plain objects, records, property keys,
 * array indexes, and iterable protocols. The property-path / {@link PropertyPath} API supports both dotted strings
 * and exact {@link PropertyKey} arrays, allowing strongly typed access to string, numeric, symbol, empty-string, and
 * literal-period keys. Utilities are provided for path validation, normalization, concatenation, comparison,
 * traversal, property lookup, descriptor and owner inspection, hardened assignment, and deletion.
 *
 * Additional capabilities include deep cloning, merging, freezing, and sealing; prototype and accessor inspection;
 * symbol-aware object traversal and structural comparison; and utilities for safely handling synchronous and
 * asynchronous iterables. Trie-backed {@link PropertyPathMap} and {@link WeakPropertyPathMap} collections provide
 * structural path storage, candidate-object matching, bounded subtree queries, and weakly held root associations.
 *
 * @packageDocumentation
 *
 * @categoryDescription Property Keys and Paths
 * > [!NOTE]
 * > Defines, validates, compares, and transforms property keys and structural property-path representations without
 * > accessing an object.
 * >
 * > **_`PropertyPath`_** — Defines a dotted string path or exact readonly `PropertyKey` array accepted by path-aware
 * > APIs.
 * >
 * > **_`isPropertyKey`_** — Determines whether a value is a string, number, or symbol property key.
 * >
 * > **_`isArrayIndex`_** — Determines whether a number is a valid ECMAScript array index.
 * >
 * > **_`isPropertyPath`_** — Validates a dotted string or exact property-key array as a property path.
 * >
 * > **_`isPropertyPathPrefix`_** — Determines whether one normalized property path is a structural prefix of another.
 * >
 * > **_`normalizePropertyPath`_** — Converts a property path to its canonical property-key array representation.
 * >
 * > **_`concatPropertyPath`_** — Concatenates multiple property paths into a newly allocated exact property-key path.
 * >
 * > **_`joinPropertyPath`_** — Converts an exact property-key path to dotted-string form when the conversion is
 * > lossless.
 *
 * @categoryDescription Property Access and Inspection
 * > [!NOTE]
 * > Resolves structural property paths and inspects property existence, ownership, values, and descriptors.
 * >
 * > **_`getProperty`_** — Resolves a property value while preserving present `undefined` and `null` values.
 * >
 * > **_`hasProperty`_** — Determines whether a complete property path exists without reading the terminal property
 * > value.
 * >
 * > **_`safeAccess`_** — Resolves a property path with optional default-value semantics for missing or nullish values.
 * >
 * > **_`getPropertyDescriptor`_** — Returns the descriptor defining the terminal property without invoking its getter.
 * >
 * > **_`getPropertyOwner`_** — Returns the object or prototype that owns the terminal property.
 *
 * @categoryDescription Property Mutation
 * > [!NOTE]
 * > Performs hardened object mutation through structural property paths.
 * >
 * > **_`safeSet`_** — Sets or updates a property-path value with optional missing-path creation and supported arithmetic
 * > operations.
 * >
 * > **_`deleteProperty`_** — Deletes a configurable terminal property with explicit inherited-property handling and
 * > prototype-pollution protection.
 *
 * @categoryDescription Object Traversal and Comparison
 * > [!NOTE]
 * > Traverses object structures as exact property-key paths and compares corresponding values between objects.
 * >
 * > **_`pathKeyIterator`_** — Traverses an object and yields exact property-key paths, including symbols and numeric
 * > array indexes.
 * >
 * > **_`safeEqual`_** — Determines whether enumerable source paths and values are present and equal in a target object.
 *
 * @categoryDescription Property Path Collections
 * > [!NOTE]
 * > Provides trie-backed collections keyed by structural property paths rather than array identity.
 * >
 * > **_`PropertyPathMap`_** — Map-like collection with structural path lookup, insertion-order iteration, subtree
 * > traversal, and candidate-object matching.
 * >
 * > **_`WeakPropertyPathMap`_** — Associates per-root property-path maps with weakly held object roots.
 *
 * @categoryDescription Object Validation
 * > [!NOTE]
 * > Validates runtime object shapes through assertions and type guards while preserving or refining TypeScript types.
 * >
 * > **_`assertObject`_** — Asserts a non-null, non-array object while preserving the value's existing static type.
 * >
 * > **_`assertPlainObject`_** — Asserts an object whose prototype is `Object.prototype` or `null`.
 * >
 * > **_`assertRecord`_** — Asserts a non-null, non-array object that can be treated as a string-keyed record.
 * >
 * > **_`isObject`_** — Tests for a non-null, non-array object while preserving known object types where possible.
 * >
 * > **_`isPlainObject`_** — Tests for a plain dictionary-style object with no custom prototype.
 * >
 * > **_`isRecord`_** — Tests for a non-null, non-array object and narrows it to `Record<string, unknown>`.
 *
 * @categoryDescription Accessors and Prototypes
 * > [!NOTE]
 * > Inspects getter and setter descriptors and evaluates constructor prototype relationships.
 * >
 * > **_`hasAccessor`_** — Determines whether a property descriptor provides both a getter and setter.
 * >
 * > **_`hasGetter`_** — Determines whether a property descriptor provides a getter.
 * >
 * > **_`hasSetter`_** — Determines whether a property descriptor provides a setter.
 * >
 * > **_`hasPrototype`_** — Determines whether a constructor matches or inherits from another constructor's prototype.
 *
 * @categoryDescription Deep Object Operations
 * > [!NOTE]
 * > Clones, combines, freezes, or seals complete object structures.
 * >
 * > **_`klona`_** — Creates a deep clone using the re-exported `klona/full` implementation.
 * >
 * > **_`deepMerge`_** — Recursively merges one or more source objects into a target with inferred result typing.
 * >
 * > **_`deepFreeze`_** — Recursively freezes traversed objects and arrays.
 * >
 * > **_`deepSeal`_** — Recursively seals traversed objects and arrays.
 *
 * @categoryDescription Iterable Utilities
 * > [!NOTE]
 * > Detects iterable protocols and safely prepares non-empty synchronous or asynchronous iterables.
 * >
 * > **_`isIterable`_** — Determines whether a value implements the synchronous iterable protocol while excluding
 * > strings.
 * >
 * > **_`isAsyncIterable`_** — Determines whether a value implements the asynchronous iterable protocol.
 * >
 * > **_`ensureNonEmptyIterable`_** — Peeks at a synchronous iterable and returns a replaying iterable when at least one
 * > value is available.
 * >
 * > **_`ensureNonEmptyAsyncIterable`_** — Produces a non-empty asynchronous iterable from asynchronous or synchronous
 * > iterable input.
 *
 * @categoryDescription General Object Utilities
 * > [!NOTE]
 * > Provides small object-oriented convenience operations that do not belong to the more specialized API categories.
 * >
 * > **_`objectKeys`_** — Returns typed object keys with safe fallback behavior.
 * >
 * > **_`objectSize`_** — Determines the size of objects, arrays, maps, sets, and strings.
 */

export * from './collection';
export * from './functions';

export * from './types';

export * from 'klona/full';
