import {
   assertPropertyPathOptionsObject,
   consumePropertyPathTraversalResult,
   consumePropertyPathTraversalVisit,
   createPropertyPathTraversalBudget,
   isNormalizedPropertyPathEqual,
   isNormalizedPropertyPathPrefix,
   normalizePropertyPathTraversalBounds } from './internal';

import type {
   JSONPropertyPath,
   NonNullObject,
   PathKeyIteratorOptions,
   PropertyPath }                         from './types';

import type {
   NormalizedPropertyPathTraversalBounds,
   PropertyPathTraversalBudget,
   PropertyPathTraversableValue }         from './internal';

/**
 * Asserts that a value is a non-null object, including arrays.
 *
 * Unlike {@link isNonNullObject}, this function preserves the **existing** static type of the variable while removing
 * nullish, primitive, function, and class-constructor union members.
 *
 * This assertion accepts arrays, ordinary objects, class instances, boxed primitives, and specialized built-in
 * objects such as `Date`, `Map`, and `Set`.
 *
 * Use this function when:
 * ```
 *   - You expect a non-null object at runtime, including an array, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * function process(value: string[] | (() => void) | undefined): void
 * {
 *    assertNonNullObject(value);
 *
 *    value.push('entry');
 *    // `value` is narrowed to `string[]`.
 * }
 *
 * @category Object Validation
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 *
 * @throws {TypeError} if the value is null, primitive, or callable.
 */
export function assertNonNullObject<T>(value: T, errorMsg: string = 'Expected a non-null object.'):
 asserts value is NonNullObject<T>
{
   if (!isNonNullObject(value)) { throw new TypeError(errorMsg); }
}

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
 * @category Object Validation
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 */
export function assertObject<T>(value: T, errorMsg: string = 'Expected an object.'): asserts value is T & object
{
   if (!isObject(value)) { throw new TypeError(errorMsg); }
}

/**
 * Asserts that a value is a non-null object or function.
 *
 * Unlike {@link isObjectOrFunction}, this function does **not** narrow the value to a generic object type. Instead, it
 * preserves the **existing** static type of the variable while removing primitive and nullish union members.
 *
 * This assertion accepts all JavaScript reference values, including arrays, functions, class constructors, ordinary
 * objects, and specialized built-in objects.
 *
 * Use this function when:
 * ```
 *   - You expect a value to be an object or function at runtime, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * function execute(value: Date | (() => void) | undefined): void
 * {
 *    assertIsObjectOrFunction(value);
 *
 *    // `value` is now `Date | (() => void)`.
 * }
 *
 * @category Object Validation
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 *
 * @throws {TypeError} if the value is null or a primitive value.
 */
export function assertObjectOrFunction<T>(value: T, errorMsg: string = 'Expected an object or function.'):
 asserts value is T & object
{
   if (!isObjectOrFunction(value)) { throw new TypeError(errorMsg); }
}

/**
 * Asserts that a value is an ordinary object.
 *
 * Unlike {@link isOrdinaryObject}, this function preserves the **existing** static type of the variable rather than
 * narrowing it to a generic indexable structure. It accepts plain objects, custom-prototype objects, and ordinary
 * class instances, while rejecting arrays, functions, primitives, and specialized built-in objects.
 *
 * Use this function when:
 * ```
 *   - You expect a value to be an ordinary object at runtime, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * class Options {
 *   flag?: boolean;
 *   value?: number;
 * }
 *
 * function run(opts: Options) {
 *   assertOrdinaryObject(opts, `'opts' is not an ordinary object.`);
 *   opts.value; // `opts` remains typed as `Options`.
 * }
 *
 * @category Object Validation
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 *
 * @throws {TypeError} if the value is not an ordinary object.
 */
export function assertOrdinaryObject<T>(value: T, errorMsg: string = 'Expected an ordinary object.'):
 asserts value is T & object
{
   if (!isOrdinaryObject(value)) { throw new TypeError(errorMsg); }
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
 * @category Object Validation
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 */
export function assertPlainObject<T>(value: T, errorMsg: string = 'Expected a plain object.'):
 asserts value is T & object
{
   if (!isPlainObject(value)) { throw new TypeError(errorMsg); }
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
 * @category Object Validation
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 */
export function assertRecord<T>(value: T, errorMsg: string = 'Expected a record object.'):
 asserts value is T & Record<PropertyKey, unknown>
{
   if (!isRecord(value)) { throw new TypeError(errorMsg); }
}

/**
 * Concatenates one or more property paths into a newly allocated exact property-key path.
 *
 * Every path is normalized before concatenation. Dotted strings therefore contribute one segment per delimiter,
 * while array property-keys preserve numbers, symbols, empty-string keys, and literal periods exactly. The returned
 * array is independent of every input array and may be retained or modified by the caller without affecting those
 * inputs.
 *
 * @example
 * ```ts
 * concatPropertyPath('actor.system', ['attributes', 'hp'], 'value');
 * // ['actor', 'system', 'attributes', 'hp', 'value']
 * ```
 * @category Property Keys and Paths
 *
 * @param path - First path to concatenate.
 *
 * @param paths - Additional property paths appended in order.
 *
 * @returns A newly allocated exact property-key path.
 *
 * @throws {TypeError} If any argument is not a valid {@link PropertyPath} or no path is supplied at runtime.
 */
export function concatPropertyPath(path: PropertyPath, ...paths: PropertyPath[]): readonly PropertyKey[]
{
   if (arguments.length === 0)
   {
      throw new TypeError(`concatPropertyPath error: At least one property path is required.`);
   }

   const result: PropertyKey[] = Array.from(normalizePropertyPath(path));

   for (const entry of paths) { result.push(...normalizePropertyPath(entry)); }

   return result;
}

/**
 * Freezes all traversed object and array values.
 *
 * @category Deep Object Operations
 *
 * @param data - An object or array.
 *
 * @param [options] - Options.
 *
 * @param [options.skipKeys] - A readonly set of property keys whose values are excluded from traversal. Numeric keys are
 *        normalized to their JavaScript string-key representation. A matching key is skipped regardless of where it
 *        appears in the object graph.
 *
 * @returns The frozen object.
 *
 * @typeParam T - Type of data.
 */
export function deepFreeze<T extends object>(data: T, { skipKeys }: { skipKeys?: ReadonlySet<PropertyKey> } = {}): T
{
   assertNonNullObject(data, `deepFreeze error: 'data' is not an object or array.`);

   if (skipKeys !== void 0 && Object.prototype.toString.call(skipKeys) !== '[object Set]')
   {
      throw new TypeError(`deepFreeze error: 'options.skipKeys' is not a Set.`);
   }

   // JavaScript coerces numeric property keys to strings. Normalize once so numeric
   // skip entries match the keys produced by Object.keys / Reflect.ownKeys.
   let normalizedSkipKeys: ReadonlySet<string | symbol> | undefined;

   if (skipKeys !== void 0)
   {
      const normalized: Set<string | symbol> = new Set();

      for (const key of skipKeys) { normalized.add(typeof key === 'number' ? String(key) : key); }

      normalizedSkipKeys = normalized;
   }

   const stack: object[] = [data];

   while (stack.length > 0)
   {
      const obj: any = stack.pop()!;

      if (typeof obj !== 'object' || obj === null || Object.isFrozen(obj)) { continue; }

      // Collect own enumerable string and symbol children before freezing. A skipped key prevents the corresponding
      // property value from being read through this traversal edge.
      const children: unknown[] = [];

      for (const key of getEnumerablePropertyKeys(obj, true))
      {
         if (normalizedSkipKeys?.has(key as string | symbol)) { continue; }

         children.push(obj[key]);
      }

      Object.freeze(obj);

      for (const child of children)
      {
         if (isNonNullObject(child)) { stack.push(child); }
      }
   }

   return data;
}

/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a shallow copy is produced. If the target and source property are object literals they are merged.
 *
 * Note: The output type is inferred, but you may provide explicit generic types as well.
 *
 * @category Deep Object Operations
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
 DeepMerge<T, U>;

export function deepMerge(target: object, ...sourceObj: object[]): object
{
   if (!isOrdinaryObject(target))
   {
      throw new TypeError(`deepMerge error: 'target' is not an ordinary object.`);
   }

   if (sourceObj.length === 0)
   {
      throw new TypeError(`deepMerge error: 'sourceObj' is not an ordinary object.`);
   }

   for (let i: number = 0; i < sourceObj.length; i++)
   {
      if (!isOrdinaryObject(sourceObj[i]))
      {
         throw new TypeError(`deepMerge error: 'sourceObj[${i}]' is not an ordinary object.`);
      }

      // Preflight every source before mutating the target so a circular source cannot leave a partial merge behind.
      assertNoCircularPlainObject(sourceObj[i]);
   }

   if (sourceObj.length === 1)
   {
      // Fast path: an existing plain target branch can be reused directly because no later source can replace it.
      const stack: { target: any; source: any }[] = [{ target, source: sourceObj[0] }];

      while (stack.length > 0)
      {
         const entry = stack.pop()!;

         for (const key of getEnumerablePropertyKeys(entry.source, true))
         {
            // Filtering occurs at every depth. Plain source objects must therefore be traversed rather than assigned
            // wholesale, otherwise a blocked nested key could bypass this guard.
            if (isBlockedPrototypeKey(key)) { continue; }

            const sourceValue: any = entry.source[key];
            const targetValue: any = entry.target[key];

            if (isPlainObject(sourceValue))
            {
               // Preserve an existing plain branch; otherwise create only the two supported plain-object prototype
               // categories. Custom source prototypes are never propagated into recursively merged branches.
               const mergedTarget: Record<PropertyKey, unknown> = isPlainObject(targetValue) ?
                targetValue : Object.create(Object.getPrototypeOf(sourceValue) === null ? null : Object.prototype);

               entry.target[key] = mergedTarget;
               stack.push({ target: mergedTarget, source: sourceValue });
            }
            else
            {
               entry.target[key] = sourceValue;
            }
         }
      }
   }
   else
   {
      // Complete each source before processing the next so queued nested work cannot target a branch replaced by a
      // later source. This preserves source precedence without recursive calls.
      for (const source of sourceObj)
      {
         const stack: { target: any; source: any }[] = [{ target, source }];

         while (stack.length > 0)
         {
            const entry = stack.pop()!;

            for (const key of getEnumerablePropertyKeys(entry.source, true))
            {
               // Apply the same security filter at every nested level in the multi-source path.
               if (isBlockedPrototypeKey(key)) { continue; }

               const sourceValue: any = entry.source[key];
               const targetValue: any = entry.target[key];

               if (isPlainObject(sourceValue))
               {
                  // Copy an existing plain target branch before merging so multi-source operation does not mutate
                  // that preexisting nested object by reference. Missing / non-plain branches are recreated safely.
                  const mergedTarget: Record<PropertyKey, unknown> = isPlainObject(targetValue) ?
                   clonePlainEnumerable(targetValue) :
                    Object.create(Object.getPrototypeOf(sourceValue) === null ? null : Object.prototype);

                  entry.target[key] = mergedTarget;
                  stack.push({ target: mergedTarget, source: sourceValue });
               }
               else
               {
                  entry.target[key] = sourceValue;
               }
            }
         }
      }
   }

   return target;
}

/**
 * Seals all traversed object and array values.
 *
 * @category Deep Object Operations
 *
 * @param data - An object or array.
 *
 * @param [options] - Options.
 *
 * @param [options.skipKeys] - A readonly set of property keys whose values are excluded from traversal. Numeric keys
 *        are normalized to their JavaScript string-key representation. A matching key is skipped regardless of where it
 *        appears in the object graph.
 *
 * @returns The sealed object.
 *
 * @typeParam T - Type of data.
 */
export function deepSeal<T extends object | []>(data: T, { skipKeys }: { skipKeys?: ReadonlySet<PropertyKey> } = {}): T
{
   assertNonNullObject(data, `deepSeal error: 'data' is not an object or array.`);

   if (skipKeys !== void 0 && Object.prototype.toString.call(skipKeys) !== '[object Set]')
   {
      throw new TypeError(`deepSeal error: 'options.skipKeys' is not a Set.`);
   }

   // JavaScript coerces numeric property keys to strings. Normalize once so numeric
   // skip entries match the keys produced by Object.keys / Reflect.ownKeys.
   let normalizedSkipKeys: ReadonlySet<string | symbol> | undefined;

   if (skipKeys !== void 0)
   {
      const normalized: Set<string | symbol> = new Set();

      for (const key of skipKeys) { normalized.add(typeof key === 'number' ? String(key) : key); }

      normalizedSkipKeys = normalized;
   }

   const stack: object[] = [data];

   while (stack.length > 0)
   {
      const obj: any = stack.pop()!;

      if (typeof obj !== 'object' || obj === null || Object.isSealed(obj)) { continue; }

      // Discover own enumerable string and symbol children before sealing. Already sealed objects serve as the
      // visited boundary, so cycles terminate without a separate allocation-heavy visited set.
      const children: unknown[] = [];

      for (const key of getEnumerablePropertyKeys(obj, true))
      {
         // Enumerable object keys returned by the helper are strings or symbols.
         if (normalizedSkipKeys?.has(key as string | symbol)) { continue; }

         children.push(obj[key]);
      }

      Object.seal(obj);

      for (const child of children)
      {
         if (typeof child === 'object' && child !== null) { stack.push(child); }
      }
   }

   return data;
}

/**
 * Deletes the property resolved by a property path.
 *
 * By default, every path segment must be an own property. Set `hasOwnOnly` to `false` to permit inherited traversal;
 * when the final property is inherited, the property is deleted from the prototype object that owns it. This explicit
 * opt-in prevents accidental prototype mutation during ordinary use.
 *
 * Prototype-pollution keys (`__proto__`, `prototype`, and `constructor`) and ECMAScript well-known symbols are rejected
 * at every path segment, matching the mutation hardening applied by {@link safeSet}. Non-configurable properties are
 * not deleted.
 *
 * @category Property Mutation
 *
 * @param data - Object containing the property path.
 *
 * @param path - Dotted or exact property-key path.
 *
 * @param options - Deletion options.
 *
 * @param options.hasOwnOnly - Whether every path segment must be an own property; default: `true`.
 *
 * @returns Whether an existing configurable property was deleted.
 *
 * @throws {TypeError} If `options.hasOwnOnly` is not a boolean.
 */
export function deleteProperty(data: object, path: PropertyPath, { hasOwnOnly = true }: { hasOwnOnly?: boolean } = {}):
 boolean
{
   if (typeof data !== 'object' || data === null || !isPropertyPath(path)) { return false; }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`deleteProperty error: 'options.hasOwnOnly' is not a boolean.`);
   }

   const normPath: readonly PropertyKey[] = normalizePropertyPath(path);

   for (const key of normPath)
   {
      if ((typeof key === 'string' && isBlockedPrototypeKey(key)) ||
       (typeof key === 'symbol' && wellKnownSymbols.has(key)))
      {
         return false;
      }
   }

   const resolution: PropertyPathResolution | undefined = resolvePropertyPath(data, normPath, {
      hasOwnOnly,
      readValue: false
   });

   if (resolution === void 0 || resolution.descriptor.configurable === false) { return false; }

   return Reflect.deleteProperty(resolution.owner, resolution.key);
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
 * @category Iterable Utilities
 *
 * @param value - The value to test as an async iterable.
 *
 * @returns A non-empty async iterable, or `undefined`.
 */
export async function ensureNonEmptyAsyncIterable<T>(value: AsyncIterable<T> | Iterable<T> | null | undefined):
 Promise<AsyncIterable<T> | undefined>
{
   const candidate = value as {
      [Symbol.asyncIterator]?: () => AsyncIterator<T>;
      [Symbol.iterator]?: () => Iterator<T>;
   } | null | undefined;

   const asyncIteratorFn = candidate?.[Symbol.asyncIterator];
   const syncIteratorFn = candidate?.[Symbol.iterator];

   if (typeof asyncIteratorFn === 'function')
   {
      const iter: AsyncIterator<T> = asyncIteratorFn.call(value);
      const first: IteratorResult<T> = await iter.next();

      if (first.done) { return void 0; }

      return (async function* (): AsyncGenerator<T, void, unknown>
      {
         yield first.value;
         for (let result: IteratorResult<T> = await iter.next(); !result.done; result = await iter.next())
         {
            yield result.value;
         }
      })();
   }

   if (typeof syncIteratorFn === 'function')
   {
      const iter: Iterator<T> = syncIteratorFn.call(value);
      const first: IteratorResult<T> = iter.next();

      if (first.done) { return void 0; }

      return (async function* (): AsyncGenerator<T, void, unknown>
      {
         yield first.value;
         for (let result: IteratorResult<T> = iter.next(); !result.done; result = iter.next())
         {
            yield result.value;
         }
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
 * @example
 * const iter = ensureNonEmptyIterable(['a', 'b']);
 * // `iter` is an iterable yielding 'a', 'b'.
 *
 * const empty = ensureNonEmptyIterable([]);
 * // `undefined`
 *
 * const gen = ensureNonEmptyIterable((function*(){ yield 1; yield 2; })());
 * // Safe: returns an iterable yielding 1, 2 without consuming the generator.
 *
 * @category Iterable Utilities
 *
 * @param value - The value to inspect.
 *
 * @returns A restartable iterable containing all values, or `undefined` if the input was not iterable or contained no
 *          items.
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
 * Returns the value resolved by a property path while preserving present `undefined` and `null` values.
 *
 * Unlike {@link safeAccess}, this function returns a present nullish property unchanged. A missing or invalid path
 * returns `undefined`; use {@link hasProperty} when that result must be distinguished from a present `undefined`
 * property. Array indexes require numeric keys through an exact array property-key path.
 *
 * @category Property Access and Inspection
 *
 * @param data - Object to inspect.
 *
 * @param path - Dotted or exact property-key path.
 *
 * @param options - Property lookup options.
 *
 * @param options.hasOwnOnly - Whether every path segment must be an own property; default: `false`.
 *
 * @returns The resolved property value, or `undefined` when the path cannot be resolved.
 *
 * @throws {TypeError} If `options.hasOwnOnly` is not a boolean.
 *
 * @typeParam T - Root object type.
 * @typeParam P - Property path type.
 */
export function getProperty<T extends object, const P extends PropertyPath>(data: T, path: P,
 { hasOwnOnly = false }: { hasOwnOnly?: boolean } = {}): DeepAccess<T, P> | undefined
{
   if (typeof data !== 'object' || data === null || !isPropertyPath(path)) { return void 0; }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`getProperty error: 'options.hasOwnOnly' is not a boolean.`);
   }

   return resolvePropertyPath(data, normalizePropertyPath(path), { hasOwnOnly })?.value as
    DeepAccess<T, P> | undefined;
}

/**
 * Returns the own property descriptor that defines the final segment of a property path.
 *
 * Intermediate values are read as necessary to continue traversal, but the final property value is not read. Getter
 * accessors at the terminal segment are therefore not invoked. When inherited lookup is enabled, the descriptor is
 * returned from the prototype object that owns the final property.
 *
 * @category Property Access and Inspection
 *
 * @param data - Object to inspect.
 *
 * @param path - Dotted or exact property-key path.
 *
 * @param options - Property lookup options.
 *
 * @param options.hasOwnOnly - Whether every path segment must be an own property; default: `false`.
 *
 * @returns The terminal property descriptor, or `undefined` when the path cannot be resolved.
 *
 * @throws {TypeError} If `options.hasOwnOnly` is not a boolean.
 */
export function getPropertyDescriptor(data: object, path: PropertyPath,
 { hasOwnOnly = false }: { hasOwnOnly?: boolean } = {}): PropertyDescriptor | undefined
{
   if (typeof data !== 'object' || data === null || !isPropertyPath(path)) { return void 0; }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`getPropertyDescriptor error: 'options.hasOwnOnly' is not a boolean.`);
   }

   return resolvePropertyPath(data, normalizePropertyPath(path), { hasOwnOnly, readValue: false })?.descriptor;
}

/**
 * Returns the object that owns the final property resolved by a property path.
 *
 * The owner may be the object reached directly by the parent path or one of its prototypes. Intermediate values are
 * read to continue traversal, but the final property value is not read. Set `hasOwnOnly` to `true` to require every
 * segment, including the terminal property, to be owned directly by the value reached at that depth.
 *
 * @category Property Access and Inspection
 *
 * @param data - Object to inspect.
 *
 * @param path - Dotted or exact property-key path.
 *
 * @param options - Property lookup options.
 *
 * @param options.hasOwnOnly - Whether every path segment must be an own property; default: `false`.
 *
 * @returns The terminal property owner, or `undefined` when the path cannot be resolved.
 *
 * @throws {TypeError} If `options.hasOwnOnly` is not a boolean.
 */
export function getPropertyOwner(data: object, path: PropertyPath,
 { hasOwnOnly = false }: { hasOwnOnly?: boolean } = {}): object | undefined
{
   if (typeof data !== 'object' || data === null || !isPropertyPath(path)) { return void 0; }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`getPropertyOwner error: 'options.hasOwnOnly' is not a boolean.`);
   }

   return resolvePropertyPath(data, normalizePropertyPath(path), { hasOwnOnly, readValue: false })?.owner;
}

/**
 * Determine if the given object has a getter & setter accessor.
 *
 * @category Accessors and Prototypes
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

   const descriptor: PropertyDescriptor | undefined = getPropertyDescriptor(object, [accessor as PropertyKey]);
   return descriptor?.get !== void 0 && descriptor.set !== void 0;
}

/**
 * Determine if the given object has a getter accessor.
 *
 * @category Accessors and Prototypes
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

   return getPropertyDescriptor(object, [accessor as PropertyKey])?.get !== void 0;
}

/**
 * Determines whether an property path exists on an object.
 *
 * Traversal aborts immediately when a property is missing, an intermediate value cannot be traversed, or an invalid
 * array index is encountered. Properties whose values are `undefined` or `null` are considered present. The terminal
 * property value is not read, so a getter at the final segment is not invoked merely to test existence.
 *
 * Array indexes may only be accessed by number through the array property-key form.
 *
 * @category Property Access and Inspection
 *
 * @param data - An object to inspect.
 *
 * @param path - A dotted string path or an array of exact string, number, or symbol property keys.
 *
 * @param options - Property lookup options.
 *
 * @param options.hasOwnOnly - Whether every path segment must be an own property; default: `false`.
 *
 * @returns Whether the complete property path exists.
 *
 * @throws {TypeError} If `options.hasOwnOnly` is not a boolean.
 */
export function hasProperty(data: object, path: PropertyPath, { hasOwnOnly = false }: { hasOwnOnly?: boolean } = {}):
 boolean
{
   if (typeof data !== 'object' || data === null || !isPropertyPath(path)) { return false; }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`hasProperty error: 'options.hasOwnOnly' is not a boolean.`);
   }

   return resolvePropertyPath(data, normalizePropertyPath(path), { hasOwnOnly, readValue: false }) !== void 0;
}

/**
 * Returns whether the target is or has the given prototype walking up the prototype chain.
 *
 * @category Accessors and Prototypes
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
 * @category Accessors and Prototypes
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

   return getPropertyDescriptor(object, [accessor as PropertyKey])?.set !== void 0;
}

/**
 * Returns whether a value is a valid ECMAScript array index.
 *
 * The maximum array index is `2^32 - 2`; `2^32 - 1` is reserved and does not update an array's `length`.
 *
 * @category Property Keys and Paths
 *
 * @param value - Candidate numeric property key.
 *
 * @returns Whether `value` is an integer in the ECMAScript array-index range.
 */
export function isArrayIndex(value: unknown): value is number
{
   return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xFFFFFFFE;
}

/**
 * Tests for whether an _object_ is async iterable.
 *
 * @category Iterable Utilities
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
 * @category Iterable Utilities
 *
 * @param value - Any value.
 *
 * @returns Whether object is iterable.
 */
export function isIterable<T>(value: unknown): value is Iterable<T>
{
   return value !== null && typeof value === 'object' && typeof (value as any)[Symbol.iterator] === 'function';
}

/**
 * Determines whether a value is a {@link JSONPropertyPath}.
 *
 * A JSON property path is either:
 *
 * - A non-empty dotted string.
 * - A non-empty, dense array containing only strings and finite numbers.
 *
 * Symbol segments are rejected because symbols cannot be represented by JSON. Non-finite numbers are also rejected
 * because `JSON.stringify` converts `NaN`, `Infinity`, and `-Infinity` to `null`. Sparse arrays are rejected because
 * missing elements are likewise serialized as `null`.
 *
 * Numeric values do not need to be integers or valid array indexes. This function validates lossless JSON
 * representation only; array-index constraints remain dependent on the value traversed by a path-aware operation.
 *
 * `-0` is accepted because JSON normalizes it to `0`, which is equivalent under the package's property-key comparison
 * semantics.
 *
 * @example
 * ```ts
 * isJSONPropertyPath('actor.system.hp');       // true
 * isJSONPropertyPath(['actors', 0, 'name']);   // true
 * isJSONPropertyPath(['literal.period']);      // true
 *
 * isJSONPropertyPath([Symbol('metadata')]);    // false
 * isJSONPropertyPath(['actors', NaN]);         // false
 * isJSONPropertyPath(new Array(1));            // false
 * ```
 *
 * @category Property Keys and Paths
 *
 * @param value - Value to evaluate.
 *
 * @returns Whether the value is a non-empty property path that can be represented losslessly through ordinary JSON
 *          serialization.
 */
export function isJSONPropertyPath(value: unknown): value is JSONPropertyPath
{
   if (typeof value === 'string') { return value.length > 0; }

   if (!Array.isArray(value) || value.length === 0)
   {
      return false;
   }

   for (let index = 0; index < value.length; index++)
   {
      const key: unknown = value[index];

      if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isFinite(key))) { return false; }
   }

   return true;}

/**
 * Determines whether a value is a non-null object, including arrays.
 *
 * This predicate accepts arrays, ordinary objects, class instances, boxed primitives, and specialized built-in
 * objects such as `Date`, `Map`, and `Set`. It rejects `null`, primitive values, functions, and class constructors.
 *
 * Unlike {@link isObject}, this function accepts arrays. Unlike {@link isObjectOrFunction}, it rejects functions and
 * class constructors.
 *
 * Known object types retain their existing static type. Mixed unions are narrowed to their non-null, non-callable
 * object members.
 *
 * @example
 * const value: string[] | (() => void) | undefined = [];
 *
 * if (isNonNullObject(value))
 * {
 *    value.push('entry');
 *    // `value` is narrowed to `string[]`.
 * }
 *
 * @category Object Validation
 *
 * @param value - The value to evaluate.
 *
 * @returns Whether the value has a runtime type of `object` and is not `null`.
 */
export function isNonNullObject<T>(value: T): value is NonNullObject<T>
{
   return typeof value === 'object' && value !== null;
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
 * @category Object Validation
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

export function isObjectOrFunction<T extends object>(value: T): value is T;

/**
 * Determines whether a value is a non-null object or function.
 *
 * This predicate accepts all JavaScript reference values, including arrays, functions, class constructors, ordinary
 * objects, and specialized built-in objects such as `Date`, `Map`, and `Set`. It rejects `null` and all primitive
 * values.
 *
 * Unlike {@link isObject}, this function accepts arrays and functions.
 *
 * Known object and function types retain their existing static type. Values typed as `unknown` are narrowed to
 * `object`.
 *
 * @example
 * function execute(value: object | (() => void) | undefined): void
 * {
 *    if (!isObjectOrFunction(value)) { return; }
 *
 *    // `value` retains its object-compatible union members.
 * }
 *
 * @category Object Validation
 *
 * @param value - The value to evaluate.
 *
 * @returns Whether the value is a non-null object or function.
 */
export function isObjectOrFunction(value: unknown): value is object;
export function isObjectOrFunction(value: unknown): value is object
{
   return value !== null && (typeof value === 'object' || typeof value === 'function');
}

export function isOrdinaryObject<T extends object>(value: T): value is T;

/**
 * Runtime check for whether a value is an ordinary object:
 *
 * An ordinary object in this context is a non-null, non-callable object for which
 * `Object.prototype.toString.call(value)` returns `'[object Object]'`.
 *
 * This includes:
 *
 * - Object literals created with `{}`.
 * - Objects created with `new Object()`.
 * - Objects with a `null` prototype.
 * - Objects with a custom prototype.
 * - Instances of ordinary user-defined classes.
 *
 * This excludes:
 *
 * - Arrays.
 * - Functions and class constructors.
 * - Primitive and boxed primitive values.
 * - Specialized built-in objects such as `Date`, `RegExp`, `Map`, `Set`, `Promise`, `Error`, `ArrayBuffer`,
 *   `DataView`, and typed arrays.
 *
 * This predicate occupies the middle ground between the other object predicates:
 *
 * - {@link isObject} accepts the broader category of non-null, non-array objects, including specialized built-ins.
 * - {@link isRecord} accepts the same broad record-like category, but narrows the result for dictionary-style keyed
 *   access.
 * - `isOrdinaryObject` additionally requires the runtime string tag `'[object Object]'`. It accepts class instances
 *   and objects with custom prototypes, but rejects specialized built-ins.
 * - {@link isPlainObject} requires the prototype to be exactly `Object.prototype` or `null`. It therefore rejects
 *   class instances and objects with other custom prototypes.
 *
 * Unlike {@link isPlainObject}, this function does not inspect or restrict the object's prototype.
 *
 * @remarks
 * This is a tag-based classification and is not an implementation of the ECMAScript specification's internal
 * distinction between ordinary and exotic objects.
 *
 * The result of `Object.prototype.toString.call` can be influenced by `Symbol.toStringTag`. Consequently, an object
 * may opt out of this classification by supplying another tag, and a specialized object may present itself with the
 * tag `'Object'`.
 *
 * @example
 * ```ts
 * isOrdinaryObject({ value: 1 });             // true
 * isOrdinaryObject(Object.create(null));      // true
 *
 * class Configuration {}
 * isOrdinaryObject(new Configuration());      // true
 *
 * isOrdinaryObject(new Map());                // false
 * isOrdinaryObject(new Date());               // false
 * isOrdinaryObject([]);                       // false
 * ```
 *
 * @example
 * The distinction from {@link isPlainObject} concerns the prototype:
 *
 * ```ts
 * class Configuration {}
 *
 * const value = new Configuration();
 *
 * isOrdinaryObject(value); // true
 * isPlainObject(value);    // false
 * ```
 *
 * @example
 * `Symbol.toStringTag` can alter the result:
 *
 * ```ts
 * const value = {
 *    [Symbol.toStringTag]: 'Configuration'
 * };
 *
 * isOrdinaryObject(value); // false: '[object Configuration]'
 * ```
 *
 * @category Object Validation
 *
 * @param value - Any value to evaluate.
 *
 * @returns Whether `value` is a non-null object with the runtime string tag `'[object Object]'`.
 */
export function isOrdinaryObject(value: unknown): value is Record<PropertyKey, unknown>;
export function isOrdinaryObject(value: unknown): value is Record<PropertyKey, unknown>
{
   return value !== null &&
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]';
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
 * - If the input is `unknown` or untyped the result narrows to `Record<PropertyKey, unknown>` allowing safe keyed
 * access.
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
 * @category Object Validation
 *
 * @param value - Any value to evaluate.
 *
 * @returns True if the value is a plain object with no special prototype.
 */
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown>;
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown>
{
   if (value === null || typeof value !== 'object') { return false; }
   const prototype: object | null = Object.getPrototypeOf(value);
   return prototype === null || prototype === Object.prototype;
}

/**
 * Determines whether a value is a JavaScript property key.
 *
 * Property keys are strings, numbers, or symbols. Numbers are accepted because exact property-key arrays preserve
 * numeric array indexes and ordinary JavaScript property access coerces numeric object keys as usual.
 *
 * @category Property Keys and Paths
 *
 * @param value - Candidate property key.
 *
 * @returns Whether `value` is a string, number, or symbol.
 */
export function isPropertyKey(value: unknown): value is PropertyKey
{
   const valueType: string = typeof value;
   return valueType === 'string' || valueType === 'number' || valueType === 'symbol';
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
 * @category Object Validation
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
 * Determines whether a value is a valid property path.
 *
 * A valid path is either:
 *
 * - A non-empty dotted string.
 * - A non-empty readonly array containing only string, number, or symbol property keys.
 *
 * This function validates the property path representation only. Numeric array-index constraints are evaluated during
 * traversal because whether a numeric key is required depends on the value reached at runtime.
 *
 * @category Property Keys and Paths
 *
 * @param value - Value to validate.
 *
 * @returns Whether the value is a valid {@link PropertyPath}.
 */
export function isPropertyPath(value: unknown): value is PropertyPath
{
   if (typeof value === 'string') { return value.length > 0; }

   if (!Array.isArray(value) || value.length === 0) { return false; }

   for (let index: number = 0; index < value.length; index++)
   {
      if (!isPropertyKey(value[index])) { return false; }
   }

   return true;
}

/**
 * Determines whether two property paths are structurally equivalent.
 *
 * Both paths are normalized before comparison, so an ordinary dotted path and its equivalent string-key array compare
 * as equal:
 *
 * @example
 * ```ts
 * isPropertyPathEqual('actor.system.name', ['actor', 'system', 'name']);
 * // true
 * ```
 *
 * Segment comparison follows native `Map` / SameValueZero semantics:
 *
 * - Strings compare by value.
 * - Numbers compare with SameValueZero semantics, so `0` equals `-0` and `NaN` equals `NaN`.
 * - Symbols compare by identity.
 * - Numeric and string segments remain distinct.
 *
 * Invalid property paths return `false` rather than throwing, matching predicate conventions.
 *
 * @see [SameValueZero - TC39](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero)
 *
 * @category Property Keys and Paths
 *
 * @param pathA - First property path.
 * @param pathB - Second property path.
 *
 * @returns Whether both paths contain the same property-key segments in the same order.
 */
export function isPropertyPathEqual(pathA: PropertyPath | undefined, pathB: PropertyPath | undefined): boolean
{
   if (!isPropertyPath(pathA) || !isPropertyPath(pathB)) { return false; }

   const keysA = normalizePropertyPath(pathA);
   const keysB = normalizePropertyPath(pathB);

   if (keysA.length !== keysB.length) { return false; }

   for (let index = 0; index < keysA.length; index++)
   {
      const keyA = keysA[index];
      const keyB = keysB[index];

      if (keyA !== keyB && !(typeof keyA === 'number' && typeof keyB === 'number' &&
       Number.isNaN(keyA) && Number.isNaN(keyB)))
      {
         return false;
      }
   }

   return true;
}

/**
 * Determines whether one property path is an exact structural prefix of another.
 *
 * Both property paths are compared after normalization. Segment comparison follows native `Map` / SameValueZero
 * semantics: strings compare by value, symbols by identity, `0` equals `-0`, and numeric `NaN` segments compare as
 * equal. Numeric and string segments remain distinct.
 *
 * Invalid path values return `false` rather than throwing, matching predicate conventions.
 *
 * @category Property Keys and Paths
 *
 * @param prefix - Candidate prefix path.
 *
 * @param path - Complete path that must equal or descend from `prefix`.
 *
 * @returns Whether `prefix` is an exact structural prefix of `path`.
 */
export function isPropertyPathPrefix(prefix: PropertyPath, path: PropertyPath): boolean
{
   if (!isPropertyPath(prefix) || !isPropertyPath(path)) { return false; }

   return isNormalizedPropertyPathPrefix(normalizePropertyPath(prefix), normalizePropertyPath(path));
}

/**
 * Converts a property path to an equivalent dotted string path when that conversion is lossless.
 *
 * Exact property-key arrays containing numbers, symbols, or string segments with literal periods cannot be represented
 * by dotted-string syntax without changing their property-path semantics and are rejected. Empty segments are retained,
 * so `['level1', '', 'value']` becomes `'level1..value'`. The exact single empty-string key `['']` is rejected because
 * an empty dotted string is not a valid {@link PropertyPath}.
 *
 * @category Property Keys and Paths
 *
 * @param path - Property path to convert.
 *
 * @returns An equivalent dotted string property path.
 *
 * @throws {TypeError} If `path` is invalid or cannot be represented losslessly as a dotted string property path.
 */
export function joinPropertyPath(path: PropertyPath): string
{
   const normPath: readonly PropertyKey[] = normalizePropertyPath(path);

   for (const key of normPath)
   {
      if (typeof key !== 'string' || key.includes('.'))
      {
         throw new TypeError(`joinPropertyPath error: 'path' cannot be represented as a dotted string property path.`);
      }
   }

   const result: string = normPath.join('.');

   if (result.length === 0)
   {
      throw new TypeError(`joinPropertyPath error: 'path' cannot be represented as a dotted string property path.`);
   }

   return result;
}

/**
 * Converts a property path to its canonical readonly property-key array representation.
 *
 * Dotted strings are split on `.` while property-key arrays are returned unchanged. Exact array property-keys should be
 * used for symbols, numeric array indexes, empty-string keys, and property names containing literal periods.
 *
 * @category Property Keys and Paths
 *
 * @param path - Property path to normalize.
 *
 * @param [errorMessage] - Optional custom error message.
 *
 * @returns The path as a readonly property-key array.
 *
 * @throws {TypeError} If `path` is not a valid {@link PropertyPath}.
 */
export function normalizePropertyPath(path: PropertyPath,
 errorMessage: string = `normalizePropertyPath error: 'path' is not a valid property path.`): readonly PropertyKey[]
{
   if (!isPropertyPath(path)) { throw new TypeError(errorMessage); }

   return typeof path === 'string' ? path.split('.') : path;
}

/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @category General Object Utilities
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
 * @category General Object Utilities
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
 * Returns an iterator of property-key path arrays useful with {@link safeAccess} and {@link safeSet} by traversing
 * the given object. Enumerable string and symbol keys are included, and numeric array indexes may be enabled.
 *
 * Traversal may be bounded by absolute property paths relative to `data`. `prefixPath` selects one branch and keeps
 * all yielded paths absolute. `stopPath` yields the selected path itself and prunes every descendant beneath it.
 * `maxDepth` limits traversal relative to `prefixPath`, or relative to the root when no prefix is supplied. Properties
 * reached at the maximum depth are yielded as terminal paths and are not traversed further.
 *
 * `maxResults` limits the number of yielded paths. `maxVisits` limits the number of enumerable properties and array
 * indexes inspected; exceeding this budget throws before another property value is read. These limits reduce exposure
 * to unexpectedly broad objects, sparse arrays with extreme lengths, getters, and proxy traps. Exceptions raised by
 * getters or proxy operations are intentionally propagated.
 *
 * When both path bounds are supplied, `stopPath` must equal or descend from `prefixPath`. If `maxDepth` is also
 * supplied, traversal stops at whichever boundary is reached first.
 *
 * Note: Keys are only generated for ordinary objects and arrays; {@link Map} and {@link Set} are not indexed. Array
 * elements are treated as terminal paths even when their values are objects.
 *
 * @category Object Traversal and Comparison
 *
 * @param data - An object to traverse for property path keys.
 *
 * @param [options] - Traversal options.
 *
 * @param [options.arrayIndex] - Set to `true` to include numeric array indexes. Enumerable symbol properties on arrays
 *        remain included; default: `false`.
 *
 * @param [options.hasOwnOnly] - Set to `false` to include enumerable prototype properties; default: `true`.
 *
 * @param [options.maxDepth] - Maximum number of property-key segments traversed beneath `prefixPath`, or beneath the
 *        root when no prefix is supplied. A value of `0` yields only the prefix itself when selected; default:
 *        unlimited.
 *
 * @param [options.maxResults] - Maximum number of paths yielded; default: `16384`.
 *
 * @param [options.maxVisits] - Maximum number of enumerable properties or array indexes inspected; default: `65536`.
 *
 * @param [options.prefixPath] - Absolute property path selecting the branch where traversal begins. Returned paths
 *        remain absolute. A missing or non-enumerable prefix produces an empty iterator.
 *
 * @param [options.stopPath] - Absolute property path to yield as a terminal path while pruning all descendants beneath
 *        it. When `prefixPath` is supplied, this path must equal or descend from it.
 *
 * @returns An iterator of absolute readonly property-key paths.
 *
 * @throws {TypeError} If `data`, a boolean option, a numeric limit, or a property-path option is invalid.
 * @throws {RangeError} If `options.stopPath` is outside `options.prefixPath` or `options.maxVisits` is exceeded.
 */
export function* pathKeyIterator(data: object, options: PathKeyIteratorOptions = {}):
 IterableIterator<readonly PropertyKey[]>
{
   if (!isNonNullObject(data)) { throw new TypeError(`pathKeyIterator error: 'data' is not an object.`); }

   assertPropertyPathOptionsObject(options, 'pathKeyIterator');

   const { arrayIndex = false, hasOwnOnly = true, maxDepth, maxResults, maxVisits, prefixPath, stopPath } = options;

   if (typeof arrayIndex !== 'boolean')
   {
      throw new TypeError(`pathKeyIterator error: 'options.arrayIndex' is not a boolean.`);
   }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`pathKeyIterator error: 'options.hasOwnOnly' is not a boolean.`);
   }

   const bounds: NormalizedPropertyPathTraversalBounds = normalizePropertyPathTraversalBounds({
      prefixPath,
      stopPath,
      maxDepth,
      maxResults,
      maxVisits
   }, {
      errorPrefix: 'pathKeyIterator',
      prefixOption: 'prefixPath',
      stopOption: 'stopPath'
   });
   const budget: PropertyPathTraversalBudget = createPropertyPathTraversalBudget(bounds, 'pathKeyIterator');

   if (budget.maxResults === 0 || (bounds.prefixPath === void 0 && bounds.maxPathLength === 0)) { return; }

   // Ancestors are tracked per active path, not globally. Shared objects may therefore appear at multiple valid
   // paths while a true reference back to an ancestor still throws.
   const rootAncestors: ReadonlySet<object> = new Set([data]);
   const stack: PropertyTraversalEntry[] = [{ obj: data, path: [], ancestors: rootAncestors }];

   while (stack.length > 0)
   {
      if (budget.results >= budget.maxResults) { return; }

      const { obj, path, ancestors } = stack.pop()!;

      if (Array.isArray(obj))
      {
         yield* iterateArrayPaths(obj, path, arrayIndex, hasOwnOnly, stack, ancestors, bounds, budget);
         continue;
      }

      for (const key of getEnumerablePropertyKeys(obj, hasOwnOnly))
      {
         if (budget.results >= budget.maxResults) { return; }

         consumePropertyPathTraversalVisit(budget);

         const fullPath: readonly PropertyKey[] = path.concat(key);
         const isWithinPrefix: boolean = bounds.prefixPath === void 0 ||
          isNormalizedPropertyPathPrefix(bounds.prefixPath, fullPath);
         const leadsToPrefix: boolean = !isWithinPrefix && bounds.prefixPath !== void 0 &&
          isNormalizedPropertyPathPrefix(fullPath, bounds.prefixPath);

         if (!isWithinPrefix && !leadsToPrefix) { continue; }

         const value: any = (obj as any)[key];

         // stopPath and maxDepth both convert the current property to a terminal path. This check occurs before cycle
         // tracking or child scheduling so bounded traversal never inspects descendants beyond the active boundary.
         if ((bounds.stopPath !== void 0 && isNormalizedPropertyPathEqual(fullPath, bounds.stopPath)) ||
          fullPath.length === bounds.maxPathLength)
         {
            if (typeof value !== 'function')
            {
               consumePropertyPathTraversalResult(budget);
               yield fullPath;
            }
            continue;
         }

         if (Array.isArray(value))
         {
            // Array index paths are emitted inline to preserve established ordering instead of deferring the array to
            // the primary LIFO object stack.
            yield* iterateArrayPaths(value, fullPath, arrayIndex, hasOwnOnly, stack,
             extendPropertyAncestors(ancestors, value), bounds, budget);
         }
         else if (typeof value === 'object' && value !== null)
         {
            stack.push({ obj: value, path: fullPath, ancestors: extendPropertyAncestors(ancestors, value) });
         }
         else if (isWithinPrefix && typeof value !== 'function')
         {
            consumePropertyPathTraversalResult(budget);
            yield fullPath;
         }
      }
   }
}

/**
 * Returns a validating iterator for either one {@link PropertyPath} or an iterable of property paths.
 *
 * A value satisfying {@link isPropertyPath} is always interpreted as one path before iterable detection occurs. This
 * precedence is necessary because dotted strings and exact property-key arrays are themselves iterable.
 *
 * Consequently, an array containing only property keys represents one exact path:
 *
 * @example
 * ```ts
 * [...propertyPathIterator(['actor', 'name'])];
 * // [
 * //    ['actor', 'name']
 * // ]
 * ```
 *
 * To supply multiple dotted-string paths, use an iterable that is not itself a valid property path, such as a `Set`:
 *
 * @example
 * ```ts
 * [...propertyPathIterator(new Set([
 *    'actor.name',
 *    'actor.id'
 * ]))];
 * // ['actor.name', 'actor.id']
 * ```
 *
 * An outer array of exact array paths is also unambiguous because its entries are arrays rather than property keys:
 *
 * @example
 * ```ts
 * [...propertyPathIterator([
 *    ['actor', 'name'],
 *    ['actor', 'id']
 * ])];
 * // [
 * //    ['actor', 'name'],
 * //    ['actor', 'id']
 * // ]
 * ```
 *
 * Iterable entries are validated lazily as iteration advances. An invalid entry throws when that entry is reached;
 * valid preceding entries may already have been yielded. An empty iterable produces an empty iterator.
 *
 * Paths are yielded unchanged. Exact array paths are not normalized, copied, or frozen.
 *
 * @category Property Keys and Paths
 *
 * @param paths - A single property path or an iterable containing property paths.
 *
 * @returns A validating iterator that yields each property path in source order.
 *
 * @throws {TypeError} During iteration if `paths` is neither a property path nor an iterable.
 * @throws {TypeError} During iteration if an iterable entry is not a valid property path.
 */
export function* propertyPathIterator(paths: PropertyPath | Iterable<PropertyPath>): IterableIterator<PropertyPath>
{
   if (isPropertyPath(paths))
   {
      yield paths;
      return;
   }

   if (!isIterable<PropertyPath>(paths))
   {
      throw new TypeError(`propertyPathIterator error: 'paths' is not a property path or iterable of property paths.`);
   }

   let index = 0;

   for (const path of paths)
   {
      if (!isPropertyPath(path))
      {
         throw new TypeError(`propertyPathIterator error: iterable entry at index ${index} is not a property path.`);
      }

      yield path;
      index++;
   }
}

/**
 * Provides a way to safely access an object's data / entries using either a dotted property path string or an array of
 * exact property keys.
 *
 * Array indexes may only be accessed by number through the array property-key form.
 *
 * @category Property Access and Inspection
 *
 * @param data - An object to access entry data.
 *
 * @param path - A dotted string property path or an array of exact string, number, or symbol property keys.
 *
 * @param [defaultValue] - (Optional) A default value to return if an entry for property path is not found.
 *
 * @returns The value referenced by the path.
 *
 * @typeParam T - Type of data.
 * @typeParam P - Property path type.
 * @typeParam R - Return value / Inferred deep access type or any provided default value type.
 */
export function safeAccess<T extends object, const P extends PropertyPath, R = DeepAccess<T, P>>(data: T,
 path: P, defaultValue?: DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>):
  DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>
{
   const result: unknown = getProperty(data, path);

   // Preserve legacy safeAccess behavior: present nullish values collapse to the supplied default.
   return result === void 0 || result === null ? defaultValue as any : result as any;
}

/**
 * Compares a source object and values of entries against a target object. If the entries in the source object match
 * the target object then `true` is returned otherwise `false`. If either object is undefined or null then false
 * is returned.
 *
 * Note: The source and target should be ordinary objects or arrays; {@link Map} and {@link Set} entries are not
 * compared. Present properties whose values are `undefined` or `null` remain distinct from missing properties.
 * Comparison disables the normal {@link pathKeyIterator} result cap so a successful result is never based on a
 * silently truncated path set. The visit budget remains enforced to bound unexpectedly broad source objects.
 *
 * @category Object Traversal and Comparison
 *
 * @param source - Source object.
 *
 * @param target - Target object.
 *
 * @param [options] - Options.
 *
 * @param [options.arrayIndex] - Set to `true` to include equality testing for numeric array indexes; default: `false`.
 *
 * @param [options.hasOwnOnly] - Set to `false` to include enumerable prototype properties; default: `true`.
 *
 * @param [options.maxVisits] - Maximum number of enumerable source properties or array indexes inspected;
 *        default: `65536`.
 *
 * @returns True if equal.
 *
 * @throws {TypeError} If an option is invalid.
 * @throws {RangeError} If `options.maxVisits` is exceeded.
 */
export function safeEqual<T extends object>(source: T, target: object,
 options?: { arrayIndex?: boolean, hasOwnOnly?: boolean, maxVisits?: number }): target is T
{
   if (typeof source !== 'object' || source === null || typeof target !== 'object' || target === null) { return false; }

   for (const path of pathKeyIterator(source, { ...options, maxResults: Number.MAX_SAFE_INTEGER }))
   {
      const sourceResolution: PropertyPathResolution | undefined = resolvePropertyPath(source, path);
      const targetResolution: PropertyPathResolution | undefined = resolvePropertyPath(target, path);

      if (sourceResolution === void 0 || targetResolution === void 0 ||
       sourceResolution.value !== targetResolution.value)
      {
         return false;
      }
   }

   return true;
}

/**
 * Provides a way to safely set an object's data / entries using either a dotted path string or an array of exact
 * property keys. Array indexes may only be accessed by number through the array property-key form.
 *
 * @category Property Mutation
 *
 * @param data - An object to access entry data.
 *
 * @param path - A dotted string path or an array of exact string, number, or symbol property keys.
 *
 * The string keys `__proto__`, `prototype`, and `constructor` are rejected to prevent prototype-pollution access
 * paths. ECMAScript well-known symbols, such as `Symbol.toStringTag`, `Symbol.iterator`, and `Symbol.toPrimitive`,
 * are also rejected because they modify built-in language protocols and object behavior. User-created symbols and
 * symbols from {@link Symbol.for} remain valid.
 *
 * @param value - A new value to set if an entry for path is found.
 *
 * @param [options] - Options.
 *
 * @param [options.operation] - Operation to perform including: `add`, `div`, `mult`, `set`, `set-undefined`, `sub`;
 *        default: `set`.
 *
 * @param [options.createMissing] - If `true` missing path entries will be created as objects automatically;
 *        default: `false`.
 *
 * @returns True if successful.
 */
export function safeSet(data: object, path: PropertyPath, value: any, { operation = 'set', createMissing = false }:
 { operation?: 'add' | 'div' | 'mult' | 'set' | 'set-undefined' | 'sub', createMissing?: boolean } = {}): boolean
{
   if (typeof data !== 'object' || data === null) { throw new TypeError(`safeSet error: 'data' is not an object.`); }
   if (typeof path !== 'string' && !Array.isArray(path))
   {
      throw new TypeError(`safeSet error: 'path' is not a string or an array of property keys.`);
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

   if ((typeof path === 'string' && path.length === 0) || (Array.isArray(path) && path.length === 0))
   {
      return false;
   }

   const access: readonly PropertyKey[] = typeof path === 'string' ? path.split('.') : path;
   let result = false;
   let target: any = data;

   for (let i: number = 0; i < access.length; i++)
   {
      const key: PropertyKey = access[i];
      const keyType: string = typeof key;

      if (!isPropertyKey(key))
      {
         throw new TypeError(`safeSet error: 'path' contains an entry that is not a property key.`);
      }

      // Block prototype-pollution strings and built-in protocol symbols before reading or creating any path segment.
      if ((keyType === 'string' && isBlockedPrototypeKey(key)) ||
       (keyType === 'symbol' && wellKnownSymbols.has(key as symbol)))
      {
         return false;
      }

      if (Array.isArray(target) && keyType !== 'symbol' && !isArrayIndex(key)) { return false; }

      if (i === 0 && access.length === 1 && !createMissing && !(key in (target as any))) { return false; }

      if (i === access.length - 1)
      {
         switch (operation)
         {
            case 'add': (target as any)[key] += value; result = true; break;
            case 'div': (target as any)[key] /= value; result = true; break;
            case 'mult': (target as any)[key] *= value; result = true; break;
            case 'set': (target as any)[key] = value; result = true; break;
            case 'set-undefined':
               if ((target as any)[key] === void 0) { (target as any)[key] = value; }
               result = true;
               break;
            case 'sub': (target as any)[key] -= value; result = true; break;
         }
      }
      else
      {
         let next: any = (target as any)[key];

         if (createMissing && next === void 0)
         {
            // Missing segments are intentionally created as ordinary objects; array intent cannot be inferred safely
            // from an arbitrary following property key.
            next = {};
            (target as any)[key] = next;
         }

         if (!isObjectOrFunction(next)) { return false; }
         target = next;
      }
   }

   return result;
}

// Utility Data ------------------------------------------------------------------------------------------------------

/**
 * ECMAScript well-known symbols that activate or modify built-in language protocols.
 *
 * Discovered once at module initialization so {@link safeSet} membership checks remain constant-time.
 *
 * Used by:
 * - {@link safeSet}.
 */
const wellKnownSymbols: ReadonlySet<symbol> = new Set(Object.getOwnPropertyNames(Symbol)
 .map((key: string): unknown => (Symbol as unknown as Record<string, unknown>)[key])
  .filter((value: unknown): value is symbol => typeof value === 'symbol'));

// Utility Function --------------------------------------------------------------------------------------------------

/**
 * Verifies that all recursively mergeable plain-object paths in a source object are acyclic.
 *
 * A path-local ancestor set is used instead of a global visited set. This permits the same object to be referenced
 * from multiple independent branches while still rejecting a reference back to an ancestor on the active path.
 * Blocked prototype keys are skipped because {@link deepMerge} will not traverse or assign them.
 *
 * Called by:
 * - {@link deepMerge} before any source mutation begins.
 *
 * @param source - A validated top-level merge source.
 *
 * @throws {TypeError} When a circular plain-object path is detected.
 */
function assertNoCircularPlainObject(source: object): void
{
   const stack: { value: object; ancestors: ReadonlySet<object> }[] = [{
      value: source,
      ancestors: new Set([source])
   }];

   while (stack.length > 0)
   {
      const { value, ancestors } = stack.pop()!;

      for (const key of getEnumerablePropertyKeys(value, true))
      {
         if (isBlockedPrototypeKey(key)) { continue; }

         const child: unknown = (value as any)[key];
         if (!isPlainObject(child)) { continue; }

         if (ancestors.has(child))
         {
            throw new TypeError(`deepMerge error: Circular source object detected.`);
         }

         const childAncestors: Set<object> = new Set(ancestors);
         childAncestors.add(child);
         stack.push({ value: child, ancestors: childAncestors });
      }
   }
}

/**
 * Creates a shallow copy of a plain object using only safe enumerable own string and symbol properties.
 *
 * The source prototype category is retained (`null` or `Object.prototype`), but custom prototypes are never copied.
 * Blocked prototype keys are filtered during copying so an existing target branch cannot reintroduce unsafe keys.
 *
 * Called by:
 * - {@link deepMerge} in the multi-source branch before applying a later source to an existing plain-object branch.
 *
 * @param source - A validated plain object to copy.
 *
 * @returns A safe shallow copy preserving the source plain-object prototype category.
 */
function clonePlainEnumerable(source: Record<PropertyKey, unknown>): Record<PropertyKey, unknown>
{
   const clone: Record<PropertyKey, unknown> = Object.create(Object.getPrototypeOf(source) === null ? null :
    Object.prototype);

   for (const key of getEnumerablePropertyKeys(source, true))
   {
      if (!isBlockedPrototypeKey(key)) { clone[key] = source[key]; }
   }

   return clone;
}

/**
 * Extends the active traversal ancestry for one child object and rejects a cycle back to an existing ancestor.
 *
 * A new set is allocated for each descending object path. This is intentionally more expensive than a global
 * `WeakSet`, but it correctly permits shared references that occur on separate non-circular paths.
 *
 * Called by:
 * - {@link pathKeyIterator} when descending through ordinary object and array properties.
 * - {@link iterateArrayPaths} when descending through symbol properties attached to arrays.
 *
 * @param ancestors - Objects already present on the active traversal path.
 * @param child - The object about to be traversed.
 *
 * @returns A new ancestor set containing `child`.
 *
 * @throws {TypeError} When `child` already occurs on the active path.
 */
function extendPropertyAncestors(ancestors: ReadonlySet<object>, child: object): ReadonlySet<object>
{
   if (ancestors.has(child))
   {
      throw new TypeError(`pathKeyIterator error: Circular object path detected.`);
   }

   const result: Set<object> = new Set(ancestors);
   result.add(child);
   return result;
}

/**
 * Locates the nearest own property descriptor and its owner in a prototype chain.
 *
 * Called by {@link resolvePropertyPath} when inherited-property lookup is enabled. Returning both values from one
 * prototype walk avoids a second descriptor lookup and keeps proxy descriptor traps to one call per inspected owner.
 *
 * @param value - Candidate object or function.
 * @param key - Property key to locate.
 *
 * @returns The nearest property descriptor / owner pair, or `undefined` when the property does not exist.
 */
function findPropertyDescriptorOwner(value: PropertyPathTraversableValue, key: PropertyKey):
 PropertyDescriptorOwner | undefined
{
   for (let current: PropertyPathTraversableValue | null = value; current !== null;
    current = Object.getPrototypeOf(current) as PropertyPathTraversableValue | null)
   {
      const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(current, key);

      if (descriptor !== void 0) { return { descriptor, owner: current }; }
   }

   return void 0;
}

/**
 * Returns enumerable string and symbol property keys with JavaScript-compatible prototype shadowing.
 *
 * When inherited keys are requested, the nearest occurrence of each key wins even when that nearest property is
 * non-enumerable. Recording a key before testing enumerability prevents an enumerable ancestor property from leaking
 * through a non-enumerable shadowing property.
 *
 * Called by:
 * - {@link deepFreeze} and {@link deepSeal} for symbol-aware object-graph traversal.
 * - {@link deepMerge} for safe own-property merging.
 * - {@link pathKeyIterator} and {@link iterateArrayPaths} for path enumeration.
 * - {@link assertNoCircularPlainObject} for merge-cycle validation.
 * - {@link clonePlainEnumerable} for safe target-branch copying.
 *
 * @param object - Object whose enumerable property keys are requested.
 * @param hasOwnOnly - Whether to exclude properties inherited through the prototype chain.
 *
 * @returns Enumerable string and symbol keys in traversal order.
 */
function getEnumerablePropertyKeys(object: object, hasOwnOnly: boolean): PropertyKey[]
{
   if (hasOwnOnly)
   {
      // Hot path: avoid a prototype walk and Reflect.ownKeys when callers only need own enumerable properties.
      const keys: PropertyKey[] = Object.keys(object);

      for (const symbol of Object.getOwnPropertySymbols(object))
      {
         if (Object.prototype.propertyIsEnumerable.call(object, symbol)) { keys.push(symbol); }
      }

      return keys;
   }

   // The inherited path is intentionally more expensive to reproduce JavaScript shadowing across string and symbol
   // keys, including non-enumerable properties that suppress an enumerable ancestor property.
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

/**
 * Returns whether a property key is blocked from generic merge or mutation operations.
 *
 * Only string keys are blocked. Symbols are handled separately by {@link safeSet}, which rejects ECMAScript
 * well-known symbols but permits user-created symbols.
 *
 * Called by:
 * - {@link deepMerge} while enumerating every merge level.
 * - {@link safeSet} while validating mutation paths.
 * - {@link assertNoCircularPlainObject} while validating merge sources.
 * - {@link clonePlainEnumerable} while copying existing target branches.
 *
 * @param key - Property key to inspect.
 *
 * @returns Whether the key is `__proto__`, `prototype`, or `constructor`.
 */
function isBlockedPrototypeKey(key: PropertyKey): boolean
{
   return typeof key === 'string' && (key === '__proto__' || key === 'prototype' || key === 'constructor');
}

/**
 * Yields property-key paths for array indexes and enumerable symbol properties attached to arrays.
 *
 * Numeric indexes are yielded immediately to preserve the established iterator ordering and are intentionally treated
 * as leaves, even when an indexed value is an object. Symbol properties receive normal recursive traversal. A private
 * array stack avoids recursive generator calls for nested arrays reached through symbols. Shared traversal bounds and
 * budgets preserve the same defensive semantics as {@link pathKeyIterator}.
 *
 * Called by:
 * - {@link pathKeyIterator} for root arrays and arrays encountered as object-property values.
 *
 * @param array - Array to enumerate.
 * @param path - Accessor path leading to `array`.
 * @param arrayIndex - Whether numeric array indexes should be yielded.
 * @param hasOwnOnly - Whether inherited enumerable symbol properties should be excluded.
 * @param objectStack - Primary object traversal stack owned by {@link pathKeyIterator}.
 * @param ancestors - Active path ancestors used for circular-reference detection.
 * @param bounds - Shared normalized traversal bounds.
 * @param budget - Shared traversal result and visit accounting.
 *
 * @returns An iterator of readonly property-key paths.
 */
function* iterateArrayPaths(array: any[], path: readonly PropertyKey[], arrayIndex: boolean,
 hasOwnOnly: boolean, objectStack: PropertyTraversalEntry[], ancestors: ReadonlySet<object>,
 bounds: NormalizedPropertyPathTraversalBounds, budget: PropertyPathTraversalBudget):
  IterableIterator<readonly PropertyKey[]>
{
   // A dedicated iterative stack avoids recursive generator delegation for symbol-linked nested arrays.
   const stack: ArrayTraversalEntry[] = [{ array, path, ancestors, symbolIndex: 0, indexesYielded: false }];

   while (stack.length > 0)
   {
      if (budget.results >= budget.maxResults) { return; }

      const frame: ArrayTraversalEntry = stack[stack.length - 1];

      if (!frame.indexesYielded)
      {
         frame.indexesYielded = true;

         if (arrayIndex)
         {
            // Array elements are leaf comparisons by design; object-valued entries are not recursively expanded.
            for (let index: number = 0; index < frame.array.length; index++)
            {
               if (budget.results >= budget.maxResults) { return; }

               consumePropertyPathTraversalVisit(budget);

               const fullPath: readonly PropertyKey[] = frame.path.concat(index);

               // Numeric array indexes are terminal by design, so a prefix below an indexed value cannot be traversed.
               if (fullPath.length <= bounds.maxPathLength && (bounds.prefixPath === void 0 ||
                isNormalizedPropertyPathPrefix(bounds.prefixPath, fullPath)))
               {
                  consumePropertyPathTraversalResult(budget);
                  yield fullPath;
               }
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

      consumePropertyPathTraversalVisit(budget);

      const key: symbol = frame.symbols[frame.symbolIndex++];
      const fullPath: readonly PropertyKey[] = frame.path.concat(key);
      const isWithinPrefix: boolean = bounds.prefixPath === void 0 ||
       isNormalizedPropertyPathPrefix(bounds.prefixPath, fullPath);
      const leadsToPrefix: boolean = !isWithinPrefix && bounds.prefixPath !== void 0 &&
       isNormalizedPropertyPathPrefix(fullPath, bounds.prefixPath);

      if (!isWithinPrefix && !leadsToPrefix) { continue; }

      // Array frames are scheduled only below the active depth boundary, so every direct symbol child is guaranteed
      // to be at or within the absolute maximum path length.
      const value: any = (frame.array as any)[key];

      if ((bounds.stopPath !== void 0 && isNormalizedPropertyPathEqual(fullPath, bounds.stopPath)) ||
       fullPath.length === bounds.maxPathLength)
      {
         if (typeof value !== 'function')
         {
            consumePropertyPathTraversalResult(budget);
            yield fullPath;
         }
         continue;
      }

      if (Array.isArray(value))
      {
         stack.push({
            array: value,
            path: fullPath,
            ancestors: extendPropertyAncestors(frame.ancestors, value),
            symbolIndex: 0,
            indexesYielded: false
         });
      }
      else if (typeof value === 'object' && value !== null)
      {
         objectStack.push({
            obj: value,
            path: fullPath,
            ancestors: extendPropertyAncestors(frame.ancestors, value)
         });
      }
      else if (isWithinPrefix && typeof value !== 'function')
      {
         consumePropertyPathTraversalResult(budget);
         yield fullPath;
      }
   }
}

/**
 * Resolves an exact property-key path and returns terminal ownership metadata.
 *
 * The resolver centralizes array-index rules, own-only behavior, inherited property ownership, descriptor lookup, and
 * single-read traversal for all path-based property utilities. Intermediate properties are read exactly once.
 * The terminal property is read only when `readValue` is enabled, allowing existence, descriptor, owner, and deletion
 * operations to avoid invoking a final getter.
 *
 * @param data - Root object to traverse.
 * @param path - Valid normalized property-key path.
 * @param options - Resolution options.
 * @param options.hasOwnOnly - Whether each segment must be an own property.
 * @param options.readValue - Whether to read and return the terminal property value.
 *
 * @returns Complete terminal resolution metadata, or `undefined` when the path cannot be resolved.
 */
function resolvePropertyPath(data: object, path: readonly PropertyKey[],
 { hasOwnOnly = false, readValue = true }: { hasOwnOnly?: boolean, readValue?: boolean } = {}):
  PropertyPathResolution | undefined
{
   let candidate: PropertyPathTraversableValue = data;

   for (let index: number = 0; index < path.length; index++)
   {
      const key: PropertyKey = path[index];

      /* v8 ignore start -- callers normalize / validate PropertyPath before resolution. */
      if (!isPropertyKey(key)) { return void 0; }
      /* v8 ignore stop */

      if (Array.isArray(candidate) && typeof key !== 'symbol' && !isArrayIndex(key)) { return void 0; }

      let descriptorOwner: PropertyDescriptorOwner | undefined;

      if (hasOwnOnly)
      {
         const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(candidate, key);

         if (descriptor !== void 0) { descriptorOwner = { descriptor, owner: candidate }; }
      }
      else
      {
         descriptorOwner = findPropertyDescriptorOwner(candidate, key);
      }

      if (descriptorOwner === void 0) { return void 0; }

      const { descriptor, owner } = descriptorOwner;
      const isFinal: boolean = index === path.length - 1;

      if (isFinal)
      {
         return {
            descriptor,
            key,
            owner,
            value: readValue ? (candidate as Record<PropertyKey, unknown>)[key] : void 0
         };
      }

      const next: unknown = (candidate as Record<PropertyKey, unknown>)[key];

      if (!isObjectOrFunction(next)) { return void 0; }

      candidate = next;

      /* v8 ignore start - PropertyPath paths are always non-empty */
   }

   return void 0;
}
/* v8 ignore stop */

// Internal Types ----------------------------------------------------------------------------------------------------

/**
 * Stack frame for array traversal in {@link iterateArrayPaths}.
 */
interface ArrayTraversalEntry
{
   array: any[];
   path: readonly PropertyKey[];
   ancestors: ReadonlySet<object>;
   symbols?: symbol[];
   symbolIndex: number;
   indexesYielded: boolean;
}

/**
 * Own property descriptor paired with the object or function that defines it.
 */
interface PropertyDescriptorOwner
{
   descriptor: PropertyDescriptor;
   owner: PropertyPathTraversableValue;
}

/**
 * Complete terminal metadata returned by {@link resolvePropertyPath}.
 */
interface PropertyPathResolution
{
   /** Own descriptor defining the terminal property. */
   descriptor: PropertyDescriptor;

   /** Final path key. */
   key: PropertyKey;

   /** Object or function that owns the terminal property. */
   owner: PropertyPathTraversableValue;

   /** Terminal property value when requested; otherwise `undefined`. */
   value: unknown;
}

/**
 * Stack frame for ordinary-object traversal in {@link pathKeyIterator}.
 */
interface PropertyTraversalEntry
{
   obj: object;
   path: readonly PropertyKey[];
   ancestors: ReadonlySet<object>;
}

// Internal Utility Types --------------------------------------------------------------------------------------------

/**
 * Utility type for `safeAccess`. Infers compound string property paths and readonly tuple paths in object T.
 */
type DeepAccess<T, P extends PropertyPath> =
 P extends string
  ? P extends ''
   ? undefined
   : DeepAccessString<T, P>
  : P extends readonly PropertyKey[]
   ? DeepAccessArray<T, P>
   : undefined;

/**
 * Infers a dotted string path in object T. Primitive and array traversal is rejected, matching runtime behavior.
 */
type DeepAccessString<T, P extends string> =
 T extends object
  ? T extends readonly unknown[]
   ? undefined
   : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
     ? DeepAccessString<T[K], Rest>
     : undefined
    : P extends keyof T
     ? T[P]
     : undefined
  : undefined;

/**
 * Infers a readonly tuple path in object T. Array traversal accepts only numeric or symbol keys, matching runtime
 * behavior. Primitive traversal is rejected. A non-tuple path array returns `unknown`.
 */
type DeepAccessArray<T, P extends readonly PropertyKey[]> =
 number extends P['length']
  ? unknown
  : P extends readonly [infer K extends PropertyKey, ...infer Rest extends readonly PropertyKey[]]
   ? T extends object
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

