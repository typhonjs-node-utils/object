/**
 * A focused collection of JavaScript and TypeScript utilities for validating, inspecting, traversing, comparing, and modifying objects.
 *
 * The package combines conventional object helpers with strongly typed property-path operations. Property paths may be expressed as dotted strings for ordinary object properties or as exact `PropertyKey` arrays when symbols, numeric array indexes, or property names containing periods must be preserved.
 *
 * The package also re-exports the cloning API from `klona/full`.
 *
 * ## Highlights
 *
 * - Runtime assertions and TypeScript type guards for objects, records, plain objects, and iterables.
 * - Typed property-path access with inferred return values.
 * - Exact string, number, and symbol path segments through `SafeAccessor`.
 * - Numeric-only array indexing with ECMAScript array-index validation.
 * - Symbol-aware property existence checks and traversal.
 * - Protected object mutation that blocks prototype-pollution paths and ECMAScript well-known symbols.
 * - Iterative deep freeze, seal, and merge operations.
 * - Source-driven shallow structural comparison across nested property paths.
 * - Utilities for getters, setters, prototypes, keys, sizes, and non-empty iterables.
 *
 * ## Importing
 *
 * When using the package directly, the utilities are available from:
 *
 * ```ts
 * import {
 *    hasProperty,
 *    isPlainObject,
 * } from '@typhonjs-utils/object';
 * ```
 *
 *
 * Within TRL, the utilities are available from:
 *
 * ```ts
 * import {
 *    hasProperty,
 *    isPlainObject,
 * } from '#runtime/util/object';
 * ```
 *
 * The package re-exports `klona/full`, so its cloning function is available from the same module:
 *
 * ```ts
 * import { klona } from '#runtime/util/object';
 * ```
 *
 * ## Property paths
 *
 * Several functions accept a `SafeAccessor`:
 *
 * ```ts
 * type SafeAccessor = string | readonly PropertyKey[];
 * ```
 *
 * ### Dotted string accessors
 *
 * Dotted strings are convenient for ordinary nested object properties:
 *
 * ```ts
 * const data = {
 *    user: {
 *       profile: {
 *          name: 'Ada'
 *       }
 *    }
 * };
 *
 * safeAccess(data, 'user.profile.name');
 * // 'Ada'
 * ```
 *
 * A dotted string is split at every period. It therefore cannot represent a literal property name containing `.` and cannot index arrays.
 *
 * ```ts
 * safeAccess({ 'user.name': 'Ada' }, 'user.name');
 * // Attempts to resolve data.user.name, not data['user.name'].
 *
 * safeAccess({ items: ['a'] }, 'items.0');
 * // Returns the default value because array indexes require numeric keys.
 * ```
 *
 * ### Exact property-key accessors
 *
 * Array accessors preserve every key exactly and support strings, numbers, and symbols:
 *
 * ```ts
 * const metadata = Symbol('metadata');
 *
 * const data = {
 *    'user.name': 'Ada',
 *    items: ['a', 'b'],
 *    [metadata]: {
 *       active: true
 *    }
 * };
 *
 * safeAccess(data, ['user.name']);
 * // 'Ada'
 *
 * safeAccess(data, ['items', 1]);
 * // 'b'
 *
 * safeAccess(data, [metadata, 'active']);
 * // true
 * ```
 *
 * Array indexes must be numbers in the range `0` through `0xFFFF_FFFE`. String indexes, negative numbers, fractional numbers, and values outside the ECMAScript array-index range are rejected.
 *
 * Inline accessor arrays retain tuple inference through a TypeScript `const` type parameter:
 *
 * ```ts
 * const result = safeAccess(data, ['items', 0]);
 * // Inferred from the exact path.
 * ```
 *
 * ## Property-path behavior
 *
 * A few distinctions are intentional:
 *
 * - `safeAccess` returns its default value when the resolved value is `undefined` or `null`.
 * - `hasProperty` checks whether the complete path exists, so present `undefined` and `null` values return `true`.
 * - Property lookup includes inherited properties.
 * - Functions may be traversed as intermediate values by the internal property resolver.
 * - Empty string and empty array accessors are considered invalid paths.
 *
 * ```ts
 * const data = {
 *    undefinedValue: undefined,
 *    nullValue: null
 * };
 *
 * safeAccess(data, 'undefinedValue', 'fallback');
 * // 'fallback'
 *
 * hasProperty(data, 'undefinedValue');
 * // true
 *
 * hasProperty(data, 'nullValue');
 * // true
 *
 * hasProperty(data, 'missing');
 * // false
 * ```
 *
 * ## API overview
 *
 * ### Assertions
 *
 * | Function | Description |
 * | --- | --- |
 * | `assertObject` | Asserts that a value is a non-null, non-array object while preserving its existing static type. |
 * | `assertPlainObject` | Asserts that a value has either `Object.prototype` or `null` as its prototype while preserving its existing static type. |
 * | `assertRecord` | Asserts that a value is a non-null, non-array object and narrows it to a string-keyed record without discarding its known shape. |
 *
 * ### Type guards
 *
 * | Function | Description |
 * | --- | --- |
 * | `isObject` | Returns whether a value is a non-null, non-array object, preserving a known object type when possible. |
 * | `isPlainObject` | Returns whether a value is a plain object created with `Object.prototype` or a `null` prototype. |
 * | `isRecord` | Returns whether a value is a non-null, non-array object and narrows it to `Record<string, unknown>`. |
 * | `isIterable` | Returns whether a non-null object provides `Symbol.iterator`; primitive strings are intentionally excluded. |
 * | `isAsyncIterable` | Returns whether a non-null object provides `Symbol.asyncIterator`. |
 *
 * ### Property descriptors and prototypes
 *
 * | Function | Description |
 * | --- | --- |
 * | `hasAccessor` | Checks the object and its prototype chain for a property descriptor containing both a getter and setter. |
 * | `hasGetter` | Checks the object and its prototype chain for a getter descriptor. |
 * | `hasSetter` | Checks the object and its prototype chain for a setter descriptor. |
 * | `hasPrototype` | Determines whether a constructor is, or inherits from, another constructor. |
 * | `hasProperty` | Returns whether a complete `SafeAccessor` path exists, aborting as soon as resolution fails. |
 *
 * ### Property-path utilities
 *
 * | Function | Description |
 * | --- | --- |
 * | `safeAccess` | Resolves a dotted string or exact property-key path and returns a typed value or supplied default. |
 * | `safeSet` | Sets or updates a value at a property path with optional missing-object creation and mutation hardening. |
 * | `safeKeyIterator` | Iteratively yields enumerable leaf paths as readonly `PropertyKey` arrays. |
 * | `safeEqual` | Verifies that every traversed leaf in a source object resolves to the same value in a target object. |
 *
 * ### Object graph utilities
 *
 * | Function | Description |
 * | --- | --- |
 * | `deepMerge` | Recursively merges one or more plain source objects into a plain target object in place. |
 * | `deepFreeze` | Iteratively freezes an object graph, including values stored in arrays. |
 * | `deepSeal` | Iteratively seals an object graph, including values stored in arrays. |
 * | `klona` | Deep-clones values through the API re-exported from `klona/full`. |
 *
 * ### Iterable utilities
 *
 * | Function | Description |
 * | --- | --- |
 * | `ensureNonEmptyIterable` | Returns `undefined` for a missing, invalid, or empty iterable; otherwise returns an iterable containing the peeked first value and remaining values. |
 * | `ensureNonEmptyAsyncIterable` | Performs the equivalent operation for async iterables and may lift a synchronous iterable into an async iterable. |
 *
 * ### General helpers
 *
 * | Function | Description |
 * | --- | --- |
 * | `objectKeys` | Returns typed enumerable own string keys for an object, or an empty array for an invalid runtime input. |
 * | `objectSize` | Returns the size of maps, sets, boxed strings, arrays, and enumerable string-keyed objects according to their supported representation. |
 *
 * ## Safe access
 *
 * `safeAccess` provides compile-time inference for known string paths and readonly tuple paths:
 *
 * ```ts
 * const state = {
 *    settings: {
 *       enabled: true
 *    },
 *    entries: [
 *       { id: 1 },
 *       { id: 2 }
 *    ]
 * };
 *
 * const enabled = safeAccess(state, 'settings.enabled');
 * // boolean
 *
 * const id = safeAccess(state, ['entries', 1, 'id']);
 * // number
 *
 * const missing = safeAccess(state, 'settings.label', 'Unnamed');
 * // string
 * ```
 *
 * The supplied default is returned when:
 *
 * - `data` is not a valid object.
 * - The accessor is invalid or empty.
 * - An intermediate property is missing.
 * - An intermediate value cannot be traversed.
 * - An array segment is not a valid numeric array index.
 * - The final value is `undefined` or `null`.
 *
 * Use `hasProperty` when the distinction between a missing property and a present `undefined` or `null` property matters.
 *
 * ## Property existence
 *
 * `hasProperty` resolves a path with early termination:
 *
 * ```ts
 * const data = {
 *    user: {
 *       name: undefined
 *    },
 *    entries: ['first']
 * };
 *
 * hasProperty(data, 'user.name');
 * // true
 *
 * hasProperty(data, 'user.email');
 * // false
 *
 * hasProperty(data, ['entries', 0]);
 * // true
 *
 * hasProperty(data, ['entries', '0']);
 * // false
 * ```
 *
 * Inherited properties are considered available because path resolution uses JavaScript property lookup semantics.
 *
 * ## Safe mutation
 *
 * `safeSet` supports direct assignment and basic arithmetic operations:
 *
 * ```ts
 * const data = {
 *    count: 2,
 *    settings: {
 *       enabled: false
 *    }
 * };
 *
 * safeSet(data, 'settings.enabled', true);
 * safeSet(data, 'count', 3, { operation: 'add' });
 *
 * data.count;
 * // 5
 * ```
 *
 * ### Operations
 *
 * | Operation | Effect |
 * | --- | --- |
 * | `set` | Assigns the supplied value. |
 * | `set-undefined` | Assigns only when the current value is `undefined`. |
 * | `add` | Applies `+=`. |
 * | `sub` | Applies `-=`. |
 * | `mult` | Applies `*=`. |
 * | `div` | Applies `/=`. |
 *
 * The default operation is `set`.
 *
 * ### Creating missing objects
 *
 * By default, every intermediate path segment must already resolve to an object:
 *
 * ```ts
 * const data = {};
 *
 * safeSet(data, 'settings.enabled', true);
 * // false
 * ```
 *
 * Set `createMissing` to create missing intermediate object entries:
 *
 * ```ts
 * safeSet(data, 'settings.enabled', true, {
 *    createMissing: true
 * });
 * // true
 * ```
 *
 * Missing entries are created as ordinary objects. The function does not infer that a missing segment should be an array.
 *
 * ### Mutation safety
 *
 * `safeSet` rejects the following string path segments:
 *
 * - `__proto__`
 * - `prototype`
 * - `constructor`
 *
 * It also rejects ECMAScript well-known symbols, including protocol hooks such as:
 *
 * - `Symbol.iterator`
 * - `Symbol.toPrimitive`
 * - `Symbol.toStringTag`
 *
 * This prevents prototype-pollution paths and modification of built-in language protocols through the generic mutation API. User-created symbols and symbols produced by `Symbol.for` remain valid.
 *
 * Validation occurs during traversal. When `createMissing` is enabled, earlier missing segments may already have been created before a later blocked or invalid segment causes the operation to return `false`.
 *
 * ## Property-path iteration
 *
 * `safeKeyIterator` performs an iterative depth-first traversal and yields readonly arrays suitable for `safeAccess`, `hasProperty`, and `safeSet`:
 *
 * ```ts
 * const marker = Symbol('marker');
 *
 * const data = {
 *    user: {
 *       name: 'Ada'
 *    },
 *    entries: ['a', 'b'],
 *    [marker]: true
 * };
 *
 * [...safeKeyIterator(data)];
 * // Example:
 * // [
 * //    [marker],
 * //    ['entries', 0],
 * //    ['entries', 1],
 * //    ['user', 'name']
 * // ]
 * ```
 *
 * The exact order follows the iterator's depth-first traversal rules. Array indexes are emitted immediately when an array property is encountered, preserving the established array ordering.
 *
 * Behavioral details:
 *
 * - Enumerable own string and symbol properties are included by default.
 * - Set `hasOwnOnly: false` to include enumerable inherited properties.
 * - Set `arrayIndex: false` to omit numeric array indexes.
 * - Enumerable symbol properties attached to arrays remain included when `arrayIndex` is false.
 * - Functions are excluded as leaf values.
 * - Objects are traversed recursively.
 * - Array elements are yielded as indexed leaf paths rather than recursively traversed.
 * - `Map` and `Set` entries are not traversed.
 * - Literal string keys containing periods remain unambiguous because paths are arrays.
 *
 * ## Source-driven equality
 *
 * `safeEqual` is a source-driven structural comparison rather than a symmetric general-purpose deep-equality function:
 *
 * ```ts
 * safeEqual(
 *    { settings: { enabled: true } },
 *    { settings: { enabled: true }, extra: 42 }
 * );
 * // true
 * ```
 *
 * Every leaf path produced from `source` must exist in `target` and resolve to the same value. Extra target properties are ignored.
 *
 * Values are compared with strict equality:
 *
 * - Primitive leaves compare by value and type.
 * - Object and function leaves compare by reference.
 * - `NaN` does not equal `NaN`.
 * - `0` and `-0` compare as equal.
 * - Present `undefined` and `null` properties remain distinct from missing properties.
 *
 * Arrays are compared by their numeric element paths. Object values stored in arrays are therefore compared by reference rather than recursively by their internal properties.
 *
 * ```ts
 * const shared = { id: 1 };
 *
 * safeEqual({ entries: [shared] }, { entries: [shared] });
 * // true
 *
 * safeEqual({ entries: [{ id: 1 }] }, { entries: [{ id: 1 }] });
 * // false
 * ```
 *
 * Options:
 *
 * ```ts
 * safeEqual(source, target, {
 *    arrayIndex: false,
 *    hasOwnOnly: false
 * });
 * ```
 *
 * - `arrayIndex: false` ignores numeric array elements.
 * - `hasOwnOnly: false` includes enumerable inherited properties.
 *
 * ## Deep merge
 *
 * `deepMerge` mutates and returns the target:
 *
 * ```ts
 * const target = {
 *    settings: {
 *       enabled: false,
 *       mode: 'basic'
 *    }
 * };
 *
 * deepMerge(target, {
 *    settings: {
 *       enabled: true
 *    }
 * });
 *
 * // {
 * //    settings: {
 * //       enabled: true,
 * //       mode: 'basic'
 * //    }
 * // }
 * ```
 *
 * Only plain object inputs are accepted. Nested values are recursively merged when both the source and target values are object literals. Other values, including arrays, replace the target value.
 *
 * Later source objects take precedence over earlier sources:
 *
 * ```ts
 * deepMerge({}, defaults, userOptions, runtimeOverrides);
 * ```
 *
 * ## Deep freeze and seal
 *
 * `deepFreeze` and `deepSeal` use iterative traversal, avoiding recursive call-stack growth for deeply nested object graphs.
 *
 * ```ts
 * const frozen = deepFreeze({
 *    settings: {
 *       enabled: true
 *    }
 * });
 *
 * Object.isFrozen(frozen);
 * Object.isFrozen(frozen.settings);
 * // true
 * ```
 *
 * Both functions accept an optional `skipKeys` set:
 *
 * ```ts
 * deepFreeze(data, {
 *    skipKeys: new Set(['cache'])
 * });
 * ```
 *
 * `skipKeys` applies to traversed object string keys. The containing object is still frozen or sealed; the referenced child is simply omitted from further traversal through that key.
 *
 * ## Non-empty iterables
 *
 * `ensureNonEmptyIterable` safely peeks at an iterable:
 *
 * ```ts
 * const values = ensureNonEmptyIterable([1, 2, 3]);
 *
 * if (values)
 * {
 *    for (const value of values)
 *    {
 *       // 1, 2, 3
 *    }
 * }
 * ```
 *
 * It returns `undefined` when the input is missing, non-iterable, or empty. For one-shot iterators, the returned iterable preserves the already-consumed first item before continuing with the original iterator.
 *
 * `ensureNonEmptyAsyncIterable` provides the same behavior for async iteration:
 *
 * ```ts
 * const values = await ensureNonEmptyAsyncIterable(source);
 *
 * if (values)
 * {
 *    for await (const value of values)
 *    {
 *       // ...
 *    }
 * }
 * ```
 *
 * Synchronous iterables may also be lifted into an async iterable.
 *
 * ## Object checks
 *
 * The object predicates intentionally provide different narrowing behavior:
 *
 * ```ts
 * interface Options
 * {
 *    enabled?: boolean;
 * }
 *
 * declare const input: Options | undefined;
 *
 * if (input && isObject(input))
 * {
 *    input.enabled;
 *    // Existing Options shape is retained.
 * }
 * ```
 *
 * Use:
 *
 * - `isObject` when a known object type should be preserved.
 * - `isRecord` when generic string-keyed access is required.
 * - `isPlainObject` when class instances, arrays, and custom prototypes must be excluded.
 * - The corresponding assertion functions when invalid input should throw instead of returning `false`.
 *
 * ## Getter, setter, and prototype checks
 *
 * Descriptor utilities inspect both the instance and its prototype chain:
 *
 * ```ts
 * class Example
 * {
 *    #value = 0;
 *
 *    get value(): number
 *    {
 *       return this.#value;
 *    }
 *
 *    set value(value: number)
 *    {
 *       this.#value = value;
 *    }
 * }
 *
 * const example = new Example();
 *
 * hasAccessor(example, 'value');
 * // true
 *
 * hasGetter(example, 'value');
 * // true
 *
 * hasSetter(example, 'value');
 * // true
 * ```
 *
 * `hasPrototype` operates on constructors:
 *
 * ```ts
 * class Base {}
 * class Derived extends Base {}
 *
 * hasPrototype(Derived, Base);
 * // true
 * ```
 *
 * ## TypeScript notes
 *
 * - Exact tuple accessors provide the strongest `safeAccess` inference.
 * - Runtime-sized `PropertyKey[]` accessors resolve to `unknown` at the type level because their path cannot be determined statically.
 * - Dotted string inference is supported for object properties but intentionally rejects traversal into arrays.
 *
 * ## Scope and limitations
 *
 * These utilities focus on ordinary JavaScript objects and arrays:
 *
 * - `Map` and `Set` entries are not traversed by `safeKeyIterator` or compared by `safeEqual`.
 * - Property access may invoke getters and proxy traps.
 * - `safeEqual` is asymmetric and source-driven.
 * - Array element objects are compared by reference.
 * - `safeSet` creates missing intermediate segments as objects, not arrays.
 * - Dotted string paths cannot represent literal periods, symbols, or array indexes.
 * - The package does not attempt to serialize symbols into string paths.
 *
 * Use exact property-key arrays whenever correctness across the complete JavaScript property-key space is required.
 *
 * @packageDocumentation
 */

export * from 'klona/full';

/**
 * Asserts that a value is an object, not null, and not an array.
 *
 * Unlike {@link isObject}, this function does **not** narrow the value to a generic indexable structure. Instead, it
 * preserves the **existing** static type of the variable. This makes it ideal for validating option objects or
 * interface-based inputs where all properties may be optional.
 *
 * Use this function when:
 * ```
 *   - You expect a value to be an object at runtime, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * interface Options { flag?: boolean; value?: number; }
 *
 * function run(opts: Options = {}) {
 *   assertObject(opts, `'opts' is not an object.`);  // `opts` remains `Options`, not widened or reduced.
 *   opts.value;                                      // Fully typed access remains available.
 * }
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 */
export function assertObject<T>(value: T, errorMsg: string = 'Expected an object.'): asserts value is T & object
{
   if (value === null || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError(errorMsg); }
}

/**
 * Asserts that a value is a plain object, not null, and not an array.
 *
 * Unlike {@link isPlainObject}, this function does **not** narrow the value to a generic indexable structure. Instead,
 * it preserves the **existing** static type of the variable. This makes it ideal for validating option objects or
 * interface-based inputs where all properties may be optional.
 *
 * Use this function when:
 * ```
 *   - You expect a value to be a plain object at runtime, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * interface Options { flag?: boolean; value?: number; }
 *
 * function run(opts: Options = {}) {
 *   assertPlainObject(opts, `'opts' is not a plain object.`); // `opts` remains `Options`, not widened or reduced.
 *   opts.value;                                               // Fully typed access remains available.
 * }
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 */
export function assertPlainObject<T>(value: T, errorMsg: string = 'Expected a plain object.'):
 asserts value is T & object
{
   if (Object.prototype.toString.call(value) !== '[object Object]') { throw new TypeError(errorMsg); }

   const prototype: any = Object.getPrototypeOf(value);
   if (prototype !== null && prototype !== Object.prototype) { throw new TypeError(errorMsg); }
}

/**
 * Asserts that a value is a non-null, non-array object that can be treated as a string-keyed record.
 *
 * Unlike {@link isRecord}, this function does **not** narrow the value to a generic indexable structure. Instead,
 * it preserves the **existing** static type of the variable. This makes it ideal for validating option objects or
 * interface-based inputs where all properties may be optional.
 *
 * Use this function when:
 * ```
 *   - You need to reject `null`, primitives, or arrays at runtime.
 *   - You want to safely treat the value as a record, **without losing its compile-time shape**.
 * ```
 *
 * @example
 * interface Options { flag?: boolean; value?: number; }
 *
 * function run(opts: Options = {}) {
 *   assertPlainObject(opts, `'opts' is not a record object.`);   // `opts` remains `Options`, not widened or reduced.
 *   opts.value;                                                  // Fully typed access remains available.
 * }
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 */
export function assertRecord<T>(value: T, errorMsg: string = 'Expected a record object.'):
 asserts value is T & Record<string, unknown>
{
   if (typeof value !== 'object' || value === null || Array.isArray(value)) { throw new TypeError(errorMsg); }
}

/**
 * Freezes all entries traversed that are objects including entries in arrays.
 *
 * @param data - An object or array.
 *
 * @param [options] - Options
 *
 * @param [options.skipKeys] - A Set of strings indicating keys of objects to not freeze.
 *
 * @returns The frozen object.
 *
 * @typeParam T - Type of data.
 */
export function deepFreeze<T extends object | []>(data: T, { skipKeys }: { skipKeys?: Set<string> } = {}): T
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`deepFreeze error: 'data' is not an object or array.`);
   }

   if (skipKeys !== void 0 && Object.prototype.toString.call(skipKeys) !== '[object Set]')
   {
      throw new TypeError(`deepFreeze error: 'options.skipKeys' is not a Set.`);
   }

   const stack: any[] = [data];

   while (stack.length > 0)
   {
      const obj: any = stack.pop();

      if (typeof obj !== 'object' || obj === null || Object.isFrozen(obj)) { continue; }

      // Collect nested properties before freezing.
      const children: any[] = [];

      if (Array.isArray(obj))
      {
         for (let cntr: number = 0; cntr < obj.length; cntr++) { children.push(obj[cntr]); }
      }
      else
      {
         for (const key in obj)
         {
            if (Object.hasOwn(obj, key) && !skipKeys?.has?.(key)) { children.push(obj[key]); }
         }
      }

      // Freeze after collecting children to avoid modifying a frozen object.
      Object.freeze(obj);

      // Push collected children onto the stack for further processing.
      stack.push(...children);
   }

   return data;
}

/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a shallow copy is produced. If the target and source property are object literals they are merged.
 *
 * Note: The output type is inferred, but you may provide explicit generic types as well.
 *
 * @param target - Target object.
 *
 * @param sourceObj - One or more source objects.
 *
 * @returns Target object.
 */
export function deepMerge<T extends object, U extends object>(target: T, sourceObj: U):
 DeepMerge<T, [U]>;

export function deepMerge<T extends object, U extends object, V extends object>(target: T, sourceObj1: U,
 sourceObj2: V): DeepMerge<T, [U, V]>;

export function deepMerge<T extends object, U extends object[]>(target: T, ...sourceObj: U):
 DeepMerge<T, U>

export function deepMerge(target: object, ...sourceObj: object[]): object
{
   if (Object.prototype.toString.call(target) !== '[object Object]')
   {
      throw new TypeError(`deepMerge error: 'target' is not an object.`);
   }

   if (sourceObj.length === 0)
   {
      throw new TypeError(`deepMerge error: 'sourceObj' is not an object.`);
   }

   for (let cntr: number = 0; cntr < sourceObj.length; cntr++)
   {
      if (Object.prototype.toString.call(sourceObj[cntr]) !== '[object Object]')
      {
         throw new TypeError(`deepMerge error: 'sourceObj[${cntr}]' is not an object.`);
      }
   }

   // When merging a single source object there is an implementation that is twice as fast as multiple source objects.
   if (sourceObj.length === 1)
   {
      const stack: { target: any, source: any }[] = [];

      for (const obj of sourceObj) { stack.push({ target, source: obj }); }

      while (stack.length > 0)
      {
         const { target, source } = stack.pop()!; // LIFO but maintains correct merge order.

         for (const prop in source)
         {
            if (Object.hasOwn(source, prop))
            {
               const sourceValue: any = source[prop];
               const targetValue: any = target[prop];

               // If both values are plain objects, enqueue for further merging.
               if (Object.hasOwn(target, prop) && targetValue?.constructor === Object &&
                sourceValue?.constructor === Object)
               {
                  stack.push({ target: targetValue, source: sourceValue });
               }
               else
               {
                  target[prop] = sourceValue;
               }
            }
         }
      }
   }
   else // Stack implementation for multiple source objects.
   {
      const stack: { target: any, sources: any[] }[] = [{ target, sources: sourceObj }];

      while (stack.length > 0)
      {
         const { target, sources } = stack.pop()!;

         for (const source of sources)
         {
            for (const prop in source)
            {
               if (Object.hasOwn(source, prop))
               {
                  const sourceValue: any = source[prop];
                  const targetValue: any = target[prop];

                  // If both values are plain objects, push for further merging with a new object.
                  if (Object.hasOwn(target, prop) && targetValue?.constructor === Object &&
                   sourceValue?.constructor === Object)
                  {
                     target[prop] = Object.assign({}, targetValue); // Copy existing target data.
                     stack.push({ target: target[prop], sources: [sourceValue] });
                  }
                  else
                  {
                     target[prop] = sourceValue;
                  }
               }
            }
         }
      }
   }

   return target;
}

/**
 * Seals all entries traversed that are objects including entries in arrays.
 *
 * @param data - An object or array.
 *
 * @param [options] - Options
 *
 * @param [options.skipKeys] - A Set of strings indicating keys of objects to not seal.
 *
 * @returns The sealed object.
 *
 * @typeParam T - Type of data.
 */
export function deepSeal<T extends object | []>(data: T, { skipKeys }: { skipKeys?: Set<string> } = {}): T
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`deepSeal error: 'data' is not an object or array.`);
   }

   if (skipKeys !== void 0 && Object.prototype.toString.call(skipKeys) !== '[object Set]')
   {
      throw new TypeError(`deepSeal error: 'options.skipKeys' is not a Set.`);
   }

   const stack: any[] = [data];

   while (stack.length > 0)
   {
      const obj: any = stack.pop();

      if (typeof obj !== 'object' || obj === null || Object.isSealed(obj)) { continue; }

      // Collect nested properties before freezing.
      const children: any[] = [];

      if (Array.isArray(obj))
      {
         for (let cntr: number = 0; cntr < obj.length; cntr++) { children.push(obj[cntr]); }
      }
      else
      {
         for (const key in obj)
         {
            if (Object.hasOwn(obj, key) && !skipKeys?.has?.(key)) { children.push(obj[key]); }
         }
      }

      // Freeze after collecting children to avoid modifying a frozen object.
      Object.seal(obj);

      // Push collected children onto the stack for further processing.
      stack.push(...children);
   }

   return data;
}

/**
 * Ensures that a value is a *non-empty async iterable*.
 * ```
 * - If the value is not async iterable, `undefined` is returned.
 * - If the async iterable yields no items, `undefined` is returned.
 * - If it yields at least one item, a fresh async iterable is returned which yields the first peeked item followed by
 * the rest, preserving behavior for one-shot async generators.
 * ```
 *
 * Supports both AsyncIterable<T> and (optionally) synchronous Iterable<T>.
 *
 * @param value - The value to test as an async iterable.
 *
 * @returns A non-empty async iterable, or `undefined`.
 */
export async function ensureNonEmptyAsyncIterable<T>(value: AsyncIterable<T> | Iterable<T> | null | undefined):
 Promise<AsyncIterable<T> | undefined>
{
   // First detect async-iterable-like values.
   const asyncIteratorFn = value?.[Symbol.asyncIterator];
   const syncIteratorFn  = value?.[Symbol.iterator];

   if (asyncIteratorFn)
   {
      const iter = asyncIteratorFn.call(value);
      const first = await iter.next();

      if (first.done) { return void 0; }

      return (async function* (): AsyncGenerator<T, void, unknown>
      {
         // Yield peeked first value.
         yield first.value;

         // Manually consume the underlying async iterator.
         for (let r = await iter.next(); !r.done; r = await iter.next()) { yield r.value; }
      })();
   }
   else if (syncIteratorFn)
   {
      // Allow synchronous iterables to be lifted into async context.
      const iter = syncIteratorFn.call(value);
      const first = iter.next();

      if (first.done) { return void 0; }

      return (async function* (): AsyncGenerator<T, void, unknown>
      {
         yield first.value;

         for (let r = iter.next(); !r.done; r = iter.next()) { yield r.value; }
      })();
   }

   return void 0;
}

/**
 * Ensures that a given value is a *non-empty iterable*.
 * ```
 * - If the value is not iterable → returns `undefined`.
 * - If the value is an iterable but contains no entries → returns `undefined`.
 * - If the value is a non-empty iterable → returns a fresh iterable (generator) that yields the first peeked value
 * followed by the remaining values. This guarantees restartable iteration even when the original iterable is a
 * one-shot generator.
 * ```
 *
 * This function is ideal when you need a safe, non-empty iterable for iteration but cannot consume or trust the
 * original iterable’s internal iterator state.
 *
 * @param value - The value to inspect.
 *
 * @returns A restartable iterable containing all values, or `undefined` if the input was not iterable or contained no
 *          items.
 *
 * @example
 * const iter = ensureNonEmptyIterable(['a', 'b']);
 * // `iter` is an iterable yielding 'a', 'b'.
 *
 * const empty = ensureNonEmptyIterable([]);
 * // `undefined`
 *
 * const gen = ensureNonEmptyIterable((function*(){ yield 1; yield 2; })());
 * // Safe: returns an iterable yielding 1, 2 without consuming the generator.
 */
export function ensureNonEmptyIterable<T>(value: Iterable<T> | null | undefined): Iterable<T> | undefined
{
   if (!isIterable(value)) { return void 0; }

   // Peek at the first value without committing to iteration on restartable iterables.
   const iter = value[Symbol.iterator]();

   const first = iter.next();

   // Empty iterable.
   if (first.done) { return void 0; }

   // Non-empty: return a generator that includes the first peeked value.
   return (function* ()
   {
      // Include first consumed value.
      yield first.value;

      // Yield remaining values from original iterator.
      for (let r = iter.next(); !r.done; r = iter.next()) { yield r.value; }
   })();
}

/**
 * Determine if the given object has a getter & setter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the given object has the getter and setter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor key.
 */
export function hasAccessor<T extends object, K extends keyof T>(object: T, accessor: K):
 object is T & { [P in K]: T[P] }
{
   if (typeof object !== 'object' || object === null || object === void 0) { return false; }

   // Check for instance accessor.
   const iDescriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(object, accessor);
   if (iDescriptor !== void 0 && iDescriptor.get !== void 0 && iDescriptor.set !== void 0) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let o: any = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o))
   {
      const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(o, accessor);
      if (descriptor !== void 0 && descriptor.get !== void 0 && descriptor.set !== void 0) { return true; }
   }

   return false;
}

/**
 * Determine if the given object has a getter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the given object has the getter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor key.
 */
export function hasGetter<T extends object, K extends keyof T>(object: T, accessor: K): object is T & { [P in K]: T[P] }
{
   if (typeof object !== 'object' || object === null || object === void 0) { return false; }

   // Check for instance accessor.
   const iDescriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(object, accessor);
   if (iDescriptor !== void 0 && iDescriptor.get !== void 0) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let o: any = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o))
   {
      const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(o, accessor);
      if (descriptor !== void 0 && descriptor.get !== void 0) { return true; }
   }

   return false;
}

/**
 * Determines whether an accessor path exists on an object.
 *
 * Traversal aborts immediately when a property is missing, an intermediate value cannot be traversed, or an invalid
 * array index is encountered. Properties whose values are `undefined` or `null` are considered present.
 *
 * Array indexes may only be accessed by number through the array accessor form.
 *
 * @param data - An object to inspect.
 *
 * @param accessor - A dotted string accessor or an array of exact string, number, or symbol property keys.
 *
 * @returns Whether the complete accessor path exists.
 */
export function hasProperty(data: object, accessor: SafeAccessor): boolean
{
   if (typeof data !== 'object' || data === null) { return false; }
   if (typeof accessor !== 'string' && !Array.isArray(accessor)) { return false; }

   const keys: readonly PropertyKey[] = typeof accessor === 'string' ? accessor.split('.') : accessor;

   if (keys.length === 0) { return false; }

   return resolvePropertyPath(data, keys) !== unresolvedProperty;
}

/**
 * Returns whether the target is or has the given prototype walking up the prototype chain.
 *
 * @param target - Any target class / constructor function to test.
 *
 * @param Prototype - Class / constructor function to find.
 *
 * @returns Target matches prototype.
 *
 * @typeParam T - Prototype class / constructor.
 */
export function hasPrototype<T extends new (...args: any[]) => any>(target: new (...args: any[]) => any, Prototype: T):
 target is T
{
   if (typeof target !== 'function') { return false; }

   if (target === Prototype) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let proto: any = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto))
   {
      if (proto === Prototype) { return true; }
   }

   return false;
}

/**
 * Determine if the given object has a setter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the given object has the setter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor key.
 */
export function hasSetter<T extends object, K extends keyof T>(object: T, accessor: K): object is T & { [P in K]: T[P] }
{
   if (typeof object !== 'object' || object === null || object === void 0) { return false; }

   // Check for instance accessor.
   const iDescriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(object, accessor);
   if (iDescriptor !== void 0 && iDescriptor.set !== void 0) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let o: any = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o))
   {
      const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(o, accessor);
      if (descriptor !== void 0 && descriptor.set !== void 0) { return true; }
   }

   return false;
}

/**
 * Tests for whether an _object_ is async iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether value is async iterable.
 */
export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T>
{
   return value !== null && typeof value === 'object' && typeof (value as any)[Symbol.asyncIterator] === 'function';
}

/**
 * Tests for whether an _object_ is iterable.
 *
 * Note: Excludes `strings` in iterable test even though they are technically iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether object is iterable.
 */
export function isIterable<T>(value: unknown): value is Iterable<T>
{
   return value !== null && typeof value === 'object' && typeof (value as any)[Symbol.iterator] === 'function';
}

export function isObject<T extends object>(value: T): value is T;

/**
 * Runtime check for whether a value is an object:
 * ```
 * - typeof === 'object'
 * - not null
 * - not an array
 * ```
 *
 * This function performs **type narrowing**. If the check succeeds, TypeScript refines the type of `value` to `T`,
 * allowing known object types (interfaces, classes, mapped structures) to retain their original shape.
 *
 * Type Behavior:
 * - When called with a value that already has a specific object type (interface or shaped object), that type is
 *   preserved after narrowing. Property access remains fully typed.
 *
 * - When called with `unknown`, `any`, or an untyped object literal, `T` becomes `object`, ensuring only that a
 *   non-null object exists. No indexing or deep property inference is provided in this case.
 *
 * In other words:
 * ```
 * - Known object type   → remains that type (preferred behavior)
 * - Unknown / untyped   → narrows only to `object`
 * ```
 *
 * Use this when you want runtime object validation **and** want to preserve typing when a value is already known to be
 * a specific object type. If you instead need to **retain** the declared type regardless of narrowing, use
 * {@link assertObject}. If you need indexable key / value access use a dedicated record check such as
 * {@link isRecord} or {@link isPlainObject}.
 *
 * @param value - Any value to check.
 *
 * @returns True if the value is a non-null object and not an array.
 */
export function isObject(value: unknown): value is object;
export function isObject(value: unknown): value is object
{
   return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isPlainObject<T extends object>(value: T): value is T;

/**
 * Determines whether a value is a **plain** object.
 *
 * A plain object is one whose prototype is either:
 *   - `Object.prototype` (created via `{}` or `new Object()`)
 *   - `null` (created via `Object.create(null)`)
 *
 * This excludes arrays, functions, class instances, DOM objects, and any object with a custom prototype. In other
 * words, this function detects JSON-like dictionary objects rather than structural or callable object types.
 *
 * Type Behavior:
 * - If the input already has a known object type `T`, that type is preserved after narrowing.
 * - If the input is `unknown` or untyped the result narrows to `Record<string, unknown>` allowing safe keyed access.
 *
 * Useful when validating configuration objects, cloning or merging data, performing deep equality, or working with
 * structured JSON where non-plain / prototype values would be considered invalid.
 *
 * @example
 * const a = { x: 1 };
 * isPlainObject(a);   // true
 *
 * class Foo {}
 * isPlainObject(new Foo()); // false
 *
 * @example
 * let data: unknown = getValue();
 * if (isPlainObject(data)) {
 *   data.foo;         // ok — key is `unknown`, but structure is guaranteed.
 * }
 *
 * @param value - Any value to evaluate.
 *
 * @returns True if the value is a plain object with no special prototype.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown>;
export function isPlainObject(value: unknown): value is Record<string, unknown>
{
   if (Object.prototype.toString.call(value) !== '[object Object]') { return false; }

   const prototype: any = Object.getPrototypeOf(value);
   return prototype === null || prototype === Object.prototype;
}

/**
 * Checks whether a value is a generic key / value object / `Record<string, unknown>`.
 *
 * A record in this context means:
 *   - `typeof value === 'object'`
 *   - value is not `null`
 *   - value is not an array
 *
 * Unlike {@link isObject}, this function does **not** attempt to preserve the original object type. All successful
 * results narrow to `Record<string, unknown>` making the returned value safe for key-indexed access but without any
 * knowledge of property names or expected value types.
 *
 * This is useful when processing untyped JSON-like data structures, dynamic configuration blocks, response bodies,
 * or any case where a dictionary-style object is expected rather than a typed interface value.
 *
 * Contrast With:
 * - {@link isObject} → preserves known object types where possible; use when typing should remain intact.
 * - {@link isPlainObject} → narrows to plain JSON objects only (no prototypes, no class instances).
 * - `isRecord()` → always narrows to a dictionary-style record for keyed lookup.
 *
 * @param value - Any value to test.
 *
 * @returns True if the value is an object that is neither null nor an array.
 */
export function isRecord(value: unknown): value is Record<string, unknown>
{
   return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param object - An object.
 *
 * @returns Object keys or empty array.
 */
export function objectKeys<T extends object>(object: T): (keyof T)[]
{
   return typeof object === 'object' && object !== null ? Object.keys(object) as (keyof T)[] : [];
}

/**
 * Safely returns an objects size. Note for String objects Unicode is not taken into consideration.
 *
 * @param object - Any value, but size returned for object / Map / Set / arrays / strings.
 *
 * @returns Size of object.
 */
export function objectSize(object: any): number
{
   if (object === void 0 || object === null || typeof object !== 'object') { return 0; }

   const tag: string = Object.prototype.toString.call(object);

   if (tag === '[object Map]' || tag === '[object Set]') { return object.size; }

   if (tag === '[object String]') { return object.length; }

   return Object.keys(object).length;
}

/**
 * Provides a way to safely access an object's data / entries using either a dotted accessor string or an array of
 * exact property keys.
 *
 * Array indexes may only be accessed by number through the array accessor form.
 *
 * @param data - An object to access entry data.
 *
 * @param accessor - A dotted string accessor or an array of exact string, number, or symbol property keys.
 *
 * @param [defaultValue] - (Optional) A default value to return if an entry for accessor is not found.
 *
 * @returns The value referenced by the accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam P - Accessor type.
 * @typeParam R - Return value / Inferred deep access type or any provided default value type.
 */
export function safeAccess<T extends object, const P extends SafeAccessor, R = DeepAccess<T, P>>(data: T,
 accessor: P, defaultValue?: DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>):
  DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>
{
   if (typeof data !== 'object' || data === null) { return defaultValue as any; }
   if (typeof accessor !== 'string' && !Array.isArray(accessor)) { return defaultValue as any; }

   const keys: readonly PropertyKey[] = typeof accessor === 'string' ? accessor.split('.') : accessor;

   if (keys.length === 0) { return defaultValue as any; }

   let result: any = data;

   // Walk through the given object by the accessor indexes.
   for (let cntr: number = 0; cntr < keys.length; cntr++)
   {
      const key: PropertyKey = keys[cntr];
      const keyType: string = typeof key;

      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol') { return defaultValue as any; }

      // Array indexes must use a valid numeric array index in an array accessor. Symbol properties remain valid.
      if (Array.isArray(result) && keyType !== 'symbol' && !isArrayIndex(key))
      {
         return defaultValue as any;
      }

      // If the next level of object access is undefined or null then return the default value.
      if (result[key] === void 0 || result[key] === null) { return defaultValue as any; }

      result = result[key];
   }

   return result as any;
}

/**
 * Compares a source object and values of entries against a target object. If the entries in the source object match
 * the target object then `true` is returned otherwise `false`. If either object is undefined or null then false
 * is returned.
 *
 * Note: The source and target should be ordinary objects or arrays; {@link Map} and {@link Set} entries are not
 * compared. Present properties whose values are `undefined` or `null` remain distinct from missing properties.
 *
 * @param source - Source object.
 *
 * @param target - Target object.
 *
 * @param [options] - Options.
 *
 * @param [options.arrayIndex] - Set to `false` to exclude equality testing for numeric array indexes; default: `true`.
 *
 * @param [options.hasOwnOnly] - Set to `false` to include enumerable prototype properties; default: `true`.
 *
 * @returns True if equal.
 */
export function safeEqual<T extends object>(source: T, target: object,
 options?: { arrayIndex?: boolean, hasOwnOnly?: boolean }): target is T
{
   if (typeof source !== 'object' || source === null || typeof target !== 'object' || target === null) { return false; }

   for (const accessor of safeKeyIterator(source, options))
   {
      const sourceObjectValue: unknown = resolvePropertyPath(source, accessor);
      const targetObjectValue: unknown = resolvePropertyPath(target, accessor);

      if (sourceObjectValue !== targetObjectValue) { return false; }
   }

   return true;
}

/**
 * Returns an iterator of property-key accessor arrays useful with {@link safeAccess} and {@link safeSet} by traversing
 * the given object. Enumerable string and symbol keys are included, and array indexes are emitted as numbers.
 *
 * Note: Keys are only generated for ordinary objects and arrays; {@link Map} and {@link Set} are not indexed.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @param [options] - Options.
 *
 * @param [options.arrayIndex] - Set to `false` to exclude numeric array indexes. Enumerable symbol properties
 *        on arrays remain included; default: `true`.
 *
 * @param [options.hasOwnOnly] - Set to `false` to include enumerable prototype properties; default: `true`.
 *
 * @returns Safe key iterator.
 */
export function* safeKeyIterator(data: object, { arrayIndex = true, hasOwnOnly = true }:
 { arrayIndex?: boolean, hasOwnOnly?: boolean } = {}): IterableIterator<readonly PropertyKey[]>
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`safeKeyIterator error: 'data' is not an object.`);
   }

   if (typeof arrayIndex !== 'boolean')
   {
      throw new TypeError(`safeKeyIterator error: 'options.arrayIndex' is not a boolean.`);
   }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`safeKeyIterator error: 'options.hasOwnOnly' is not a boolean.`);
   }

   const stack: { obj: object; path: readonly PropertyKey[] }[] = [{ obj: data, path: [] }];

   while (stack.length > 0)
   {
      const { obj, path } = stack.pop()!;

      if (Array.isArray(obj))
      {
         yield* iterateArrayAccessors(obj, path, arrayIndex, hasOwnOnly, stack);
         continue;
      }

      for (const key of getEnumerablePropertyKeys(obj, hasOwnOnly))
      {
         const fullPath: readonly PropertyKey[] = path.concat(key);
         const value: any = (obj as any)[key];

         // Preserve the previous ordering by yielding array indexes immediately when the array property is encountered.
         if (Array.isArray(value))
         {
            yield* iterateArrayAccessors(value, fullPath, arrayIndex, hasOwnOnly, stack);
         }
         else if (typeof value === 'object' && value !== null)
         {
            stack.push({ obj: value, path: fullPath });
         }
         else if (typeof value !== 'function')
         {
            yield fullPath;
         }
      }
   }
}

/**
 * Provides a way to safely set an object's data / entries using either a dotted accessor string or an array of exact
 * property keys. Array indexes may only be accessed by number through the array accessor form.
 *
 * @param data - An object to access entry data.
 *
 * @param accessor - A dotted string accessor or an array of exact string, number, or symbol property keys.
 *
 * The string keys `__proto__`, `prototype`, and `constructor` are rejected to prevent prototype-pollution access
 * paths. ECMAScript well-known symbols, such as `Symbol.toStringTag`, `Symbol.iterator`, and `Symbol.toPrimitive`,
 * are also rejected because they modify built-in language protocols and object behavior. User-created symbols and
 * symbols from {@link Symbol.for} remain valid.
 *
 * @param value - A new value to set if an entry for accessor is found.
 *
 * @param [options] - Options.
 *
 * @param [options.operation] - Operation to perform including: `add`, `div`, `mult`, `set`, `set-undefined`, `sub`;
 *        default: `set`.
 *
 * @param [options.createMissing] - If `true` missing accessor entries will be created as objects automatically;
 *        default: `false`.
 *
 * @returns True if successful.
 */
export function safeSet(data: object, accessor: SafeAccessor, value: any,
 { operation = 'set', createMissing = false }:
  { operation?: 'add' | 'div' | 'mult' | 'set' | 'set-undefined' | 'sub', createMissing?: boolean } = {}): boolean
{
   if (typeof data !== 'object' || data === null) { throw new TypeError(`safeSet error: 'data' is not an object.`); }
   if (typeof accessor !== 'string' && !Array.isArray(accessor))
   {
      throw new TypeError(`safeSet error: 'accessor' is not a string or an array of property keys.`);
   }
   if (typeof operation !== 'string') { throw new TypeError(`safeSet error: 'options.operation' is not a string.`); }
   if (operation !== 'add' && operation !== 'div' && operation !== 'mult' && operation !== 'set' &&
    operation !== 'set-undefined' && operation !== 'sub')
   {
      throw new Error(`safeSet error: Unknown 'options.operation'.`);
   }
   if (typeof createMissing !== 'boolean')
   {
      throw new TypeError(`safeSet error: 'options.createMissing' is not a boolean.`);
   }

   const access: readonly PropertyKey[] = typeof accessor === 'string' ? accessor.split('.') : accessor;

   if (access.length === 0) { return false; }

   let result = false;
   let target: any = data;

   // Walk through the given object by the accessor indexes.
   for (let cntr: number = 0; cntr < access.length; cntr++)
   {
      const key: PropertyKey = access[cntr];
      const keyType: string = typeof key;

      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol')
      {
         throw new TypeError(`safeSet error: 'accessor' contains an entry that is not a property key.`);
      }

      // Prevent prototype-pollution access paths and modification of built-in language protocols.
      if ((keyType === 'string' && (key === '__proto__' || key === 'prototype' || key === 'constructor')) ||
       (keyType === 'symbol' && wellKnownSymbols.has(key as symbol)))
      {
         return false;
      }

      // Array indexes must use a valid numeric array index in an array accessor. Symbol properties remain valid.
      if (Array.isArray(target) && keyType !== 'symbol' && !isArrayIndex(key))
      {
         return false;
      }

      // Verify first level missing property.
      if (cntr === 0 && access.length === 1 && !createMissing && !(key in target)) { return false; }

      if (cntr === access.length - 1)
      {
         switch (operation)
         {
            case 'add':
               target[key] += value;
               result = true;
               break;

            case 'div':
               target[key] /= value;
               result = true;
               break;

            case 'mult':
               target[key] *= value;
               result = true;
               break;

            case 'set':
               target[key] = value;
               result = true;
               break;

            case 'set-undefined':
               if (target[key] === void 0) { target[key] = value; }
               result = true;
               break;

            case 'sub':
               target[key] -= value;
               result = true;
               break;
         }
      }
      else
      {
         // If createMissing is true and the next level of object access is undefined then create a new object entry.
         if (createMissing && target[key] === void 0) { target[key] = {}; }

         // Abort if the next level is null or not an object and containing a value.
         if (target[key] === null || typeof target[key] !== 'object') { return false; }

         target = target[key];
      }
   }

   return result;
}

// Utility Data ------------------------------------------------------------------------------------------------------

/**
 * ECMAScript well-known symbols that activate or modify built-in language protocols.
 */
const wellKnownSymbols: ReadonlySet<symbol> = new Set(Object.getOwnPropertyNames(Symbol)
 .map((key: string): unknown => (Symbol as unknown as Record<string, unknown>)[key])
  .filter((value: unknown): value is symbol => typeof value === 'symbol'));

/**
 * Sentinel returned when an accessor path cannot be resolved.
 */
const unresolvedProperty: unique symbol = Symbol();

// Utility Function --------------------------------------------------------------------------------------------------

/**
 * Returns whether a value is a valid ECMAScript array index.
 */
function isArrayIndex(value: unknown): value is number
{
   return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xFFFFFFFE;
}

/**
 * Resolves an exact property-key accessor while preserving the distinction between a missing property and a property
 * whose value is `undefined` or `null`.
 */
function resolvePropertyPath(data: object, accessor: readonly PropertyKey[]): unknown
{
   let result: any = data;

   for (let cntr: number = 0; cntr < accessor.length; cntr++)
   {
      if ((typeof result !== 'object' && typeof result !== 'function') || result === null)
      {
         return unresolvedProperty;
      }

      const key: PropertyKey = accessor[cntr];
      const keyType: string = typeof key;

      /* v8 ignore start */ // The following is sanity checks that should not normally be reached.
      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol')
      {
         return unresolvedProperty;
      }

      if (Array.isArray(result) && keyType !== 'symbol' && !isArrayIndex(key))
      {
         return unresolvedProperty;
      }
      /* v8 ignore stop */

      if (!(key in result)) { return unresolvedProperty; }

      result = result[key];
   }

   return result;
}

/**
 * Yields numeric indexes and enumerable symbol-property accessors for an array. Nested arrays reached through symbol
 * properties are processed immediately while object values are added to the primary depth-first traversal stack.
 */
function* iterateArrayAccessors(array: any[], path: readonly PropertyKey[], arrayIndex: boolean,
 hasOwnOnly: boolean, objectStack: { obj: object; path: readonly PropertyKey[] }[]):
  IterableIterator<readonly PropertyKey[]>
{
   const stack: {
      array: any[];
      path: readonly PropertyKey[];
      symbols?: symbol[];
      symbolIndex: number;
      indexesYielded: boolean;
   }[] = [{ array, path, symbolIndex: 0, indexesYielded: false }];

   while (stack.length > 0)
   {
      const frame = stack[stack.length - 1];

      if (!frame.indexesYielded)
      {
         frame.indexesYielded = true;

         if (arrayIndex)
         {
            for (let cntr: number = 0; cntr < frame.array.length; cntr++)
            {
               yield frame.path.concat(cntr);
            }
         }
      }

      if (frame.symbols === void 0)
      {
         frame.symbols = getEnumerablePropertyKeys(frame.array, hasOwnOnly)
          .filter((key: PropertyKey): key is symbol => typeof key === 'symbol');
      }

      if (frame.symbolIndex >= frame.symbols.length)
      {
         stack.pop();
         continue;
      }

      const key: symbol = frame.symbols[frame.symbolIndex++];
      const fullPath: readonly PropertyKey[] = frame.path.concat(key);
      const value: any = (frame.array as any)[key];

      if (Array.isArray(value))
      {
         stack.push({ array: value, path: fullPath, symbolIndex: 0, indexesYielded: false });
      }
      else if (typeof value === 'object' && value !== null)
      {
         objectStack.push({ obj: value, path: fullPath });
      }
      else if (typeof value !== 'function')
      {
         yield fullPath;
      }
   }
}

/**
 * Returns enumerable string and symbol property keys. When inherited keys are included, nearest properties shadow
 * matching keys further up the prototype chain, including when the nearest property is non-enumerable.
 */
function getEnumerablePropertyKeys(object: object, hasOwnOnly: boolean): PropertyKey[]
{
   if (hasOwnOnly)
   {
      const keys: PropertyKey[] = Object.keys(object);

      for (const symbol of Object.getOwnPropertySymbols(object))
      {
         if (Object.prototype.propertyIsEnumerable.call(object, symbol)) { keys.push(symbol); }
      }

      return keys;
   }

   const keys: PropertyKey[] = [];
   const seen: Set<PropertyKey> = new Set();

   for (let current: object | null = object; current !== null; current = Object.getPrototypeOf(current))
   {
      for (const key of Reflect.ownKeys(current))
      {
         if (seen.has(key)) { continue; }

         seen.add(key);

         if (Object.prototype.propertyIsEnumerable.call(current, key)) { keys.push(key); }
      }
   }

   return keys;
}

// External Types ----------------------------------------------------------------------------------------------------

/**
 * Accessor accepted by {@link hasProperty}, {@link safeAccess}, and {@link safeSet}. String accessors use `.`
 * delimiters while array accessors preserve each {@link PropertyKey} as an exact property key. Array indexes require
 * numeric keys.
 */
export type SafeAccessor = string | readonly PropertyKey[];

// Internal Utility Types --------------------------------------------------------------------------------------------

/**
 * Utility type for `safeAccess`. Infers compound string accessors and readonly tuple accessors in object T.
 */
type DeepAccess<T, P extends SafeAccessor> =
 P extends string
  ? DeepAccessString<T, P>
  : P extends readonly PropertyKey[]
   ? DeepAccessArray<T, P>
   : undefined;

/**
 * Infers a dotted string accessor in object T.
 */
type DeepAccessString<T, P extends string> =
 T extends readonly unknown[]
  ? undefined
  : P extends `${infer K}.${infer Rest}`
   ? K extends keyof T
    ? DeepAccessString<T[K], Rest>
    : undefined
   : P extends keyof T
    ? T[P]
    : undefined;

/**
 * Infers a readonly tuple accessor in object T. Array traversal accepts only numeric or symbol keys, matching runtime
 * behavior. A non-tuple accessor array returns `unknown` because its runtime path cannot be determined statically.
 */
type DeepAccessArray<T, P extends readonly PropertyKey[]> =
 number extends P['length']
  ? unknown
  : P extends readonly [infer K extends PropertyKey, ...infer Rest extends readonly PropertyKey[]]
   ? T extends readonly unknown[]
    ? K extends number | symbol
     ? K extends keyof T
      ? Rest extends readonly []
       ? T[K]
       : DeepAccessArray<T[K], Rest>
      : undefined
     : undefined
    : K extends keyof T
     ? Rest extends readonly []
      ? T[K]
      : DeepAccessArray<T[K], Rest>
     : undefined
   : undefined;

/**
 * Recursively merges multiple object types ensuring correct property resolution.
 *
 * This utility takes a target object `T` and applies a sequence of merges from `U` progressively combining their
 * properties while respecting key precedence. Later objects overwrite earlier ones, similar to `Object.assign`.
 *
 * @typeParam T - The base object type.
 * @typeParam U - A tuple of objects to be deeply merged with `T`.
 */
type DeepMerge<T extends object, U extends object[]> =
 U extends [infer First, ...infer Rest]
  ? DeepMerge<{ [K in keyof (Omit<T, keyof First> & First)]: (Omit<T, keyof First> & First)[K] },
   Rest extends object[] ? Rest : []>
  : T;

