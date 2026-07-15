/**
 * Provides JavaScript and TypeScript utilities for validating, inspecting, traversing, comparing, and modifying
 * objects.
 *
 * The package includes runtime assertions and type guards, strongly typed property-path access using dotted strings
 * or exact {@link PropertyKey} arrays, hardened mutation and deep-merge operations, symbol-aware traversal, iterative
 * freeze / seal helpers, prototype and descriptor inspection, and iterable utilities.
 *
 * The cloning API from `klona/full` is re-exported.
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
   if (!isPlainObjectValue(value)) { throw new TypeError(errorMsg); }
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

   const stack: object[] = [data];

   while (stack.length > 0)
   {
      const obj: any = stack.pop()!;

      if (typeof obj !== 'object' || obj === null || Object.isFrozen(obj)) { continue; }

      // Collect own enumerable string and symbol children before freezing; reading after Object.freeze would still
      // be legal, but batching first keeps graph discovery separate from mutation and handles self references safely.
      const children: unknown[] = [];

      for (const key of getEnumerablePropertyKeys(obj, true))
      {
         if (typeof key === 'string' && skipKeys?.has(key)) { continue; }
         children.push(obj[key]);
      }

      Object.freeze(obj);

      for (const child of children)
      {
         if (typeof child === 'object' && child !== null) { stack.push(child); }
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
   if (!isMergeObjectValue(target))
   {
      throw new TypeError(`deepMerge error: 'target' is not an object.`);
   }

   if (sourceObj.length === 0)
   {
      throw new TypeError(`deepMerge error: 'sourceObj' is not an object.`);
   }

   for (let i: number = 0; i < sourceObj.length; i++)
   {
      if (!isMergeObjectValue(sourceObj[i]))
      {
         throw new TypeError(`deepMerge error: 'sourceObj[${i}]' is not an object.`);
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

            if (isPlainObjectValue(sourceValue))
            {
               // Preserve an existing plain branch; otherwise create only the two supported plain-object prototype
               // categories. Custom source prototypes are never propagated into recursively merged branches.
               const mergedTarget: Record<PropertyKey, unknown> = isPlainObjectValue(targetValue) ?
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

               if (isPlainObjectValue(sourceValue))
               {
                  // Copy an existing plain target branch before merging so multi-source operation does not mutate
                  // that preexisting nested object by reference. Missing / non-plain branches are recreated safely.
                  const mergedTarget: Record<PropertyKey, unknown> = isPlainObjectValue(targetValue) ?
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
         if (typeof key === 'string' && skipKeys?.has(key)) { continue; }
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
   const iDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(object, accessor);
   if (iDescriptor !== void 0 && iDescriptor.get !== void 0 && iDescriptor.set !== void 0) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let o: any = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o))
   {
      const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(o, accessor);
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
   const iDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(object, accessor);
   if (iDescriptor !== void 0 && iDescriptor.get !== void 0) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let o: any = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o))
   {
      const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(o, accessor);
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

   if ((typeof accessor === 'string' && accessor.length === 0) ||
    (Array.isArray(accessor) && accessor.length === 0))
   {
      return false;
   }

   const keys: readonly PropertyKey[] = typeof accessor === 'string' ? accessor.split('.') : accessor;

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
   const iDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(object, accessor);
   if (iDescriptor !== void 0 && iDescriptor.set !== void 0) { return true; }

   // Walk parent prototype chain. Check for descriptor at each prototype level.
   for (let o: any = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o))
   {
      const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(o, accessor);
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
   return isPlainObjectValue(value);
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
 * Determines whether a value is a valid safe accessor.
 *
 * A valid accessor is either:
 *
 * - A non-empty dotted string.
 * - A non-empty readonly array containing only string, number, or symbol property keys.
 *
 * This function validates the accessor representation only. Numeric array-index constraints are evaluated during
 * traversal because whether a numeric key is required depends on the value reached at runtime.
 *
 * @param value - Value to validate.
 *
 * @returns Whether the value is a valid {@link SafeAccessor}.
 */
export function isSafeAccessor(value: unknown): value is SafeAccessor
{
   if (typeof value === 'string') { return value.length > 0; }

   if (!Array.isArray(value) || value.length === 0) { return false; }

   for (let i: number = 0, l: number = value.length; i < l; i++)
   {
      const keyType: string = typeof value[i];

      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol') { return false; }
   }

   return true;
}

/**
 * Converts a safe accessor to its canonical readonly property-key array representation.
 *
 * Dotted strings are split on `.` while property-key arrays are returned unchanged. Exact array accessors should be
 * used for symbols, numeric array indexes, empty-string keys, and property names containing literal periods.
 *
 * @param accessor - Accessor to normalize.
 *
 * @returns The accessor as a readonly property-key array.
 *
 * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
 */
export function normalizeSafeAccessor(accessor: SafeAccessor): readonly PropertyKey[]
{
   if (!isSafeAccessor(accessor))
   {
      throw new TypeError(`normalizeSafeAccessor error: 'accessor' is not a valid safe accessor.`);
   }

   return typeof accessor === 'string' ? accessor.split('.') : accessor;
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
   if ((typeof accessor === 'string' && accessor.length === 0) ||
    (Array.isArray(accessor) && accessor.length === 0))
   {
      return defaultValue as any;
   }

   const keys: readonly PropertyKey[] = typeof accessor === 'string' ? accessor.split('.') : accessor;
   let result: any = data;

   for (let i: number = 0; i < keys.length; i++)
   {
      if (!isTraversableValue(result)) { return defaultValue as any; }

      const key: PropertyKey = keys[i];
      const keyType: string = typeof key;

      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol') { return defaultValue as any; }

      if (Array.isArray(result) && keyType !== 'symbol' && !isArrayIndex(key))
      {
         return defaultValue as any;
      }

      // Cache each read so getters and proxy traps are invoked only once per path segment.
      const next: any = (result as any)[key];
      if (next === void 0 || next === null) { return defaultValue as any; }

      result = next;
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

   // Ancestors are tracked per active path, not globally. Shared objects may therefore appear at multiple valid
   // accessors while a true reference back to an ancestor still throws.
   const rootAncestors: ReadonlySet<object> = new Set([data]);
   const stack: PropertyTraversalEntry[] = [{ obj: data, path: [], ancestors: rootAncestors }];

   while (stack.length > 0)
   {
      const { obj, path, ancestors } = stack.pop()!;

      if (Array.isArray(obj))
      {
         yield* iterateArrayAccessors(obj, path, arrayIndex, hasOwnOnly, stack, ancestors);
         continue;
      }

      for (const key of getEnumerablePropertyKeys(obj, hasOwnOnly))
      {
         const fullPath: readonly PropertyKey[] = path.concat(key);
         const value: any = (obj as any)[key];

         if (Array.isArray(value))
         {
            // Array index paths are emitted inline to preserve established ordering instead of deferring the array to
            // the primary LIFO object stack.
            yield* iterateArrayAccessors(value, fullPath, arrayIndex, hasOwnOnly, stack,
             extendPropertyAncestors(ancestors, value));
         }
         else if (typeof value === 'object' && value !== null)
         {
            stack.push({ obj: value, path: fullPath, ancestors: extendPropertyAncestors(ancestors, value) });
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

   if ((typeof accessor === 'string' && accessor.length === 0) || (Array.isArray(accessor) && accessor.length === 0))
   {
      return false;
   }

   const access: readonly PropertyKey[] = typeof accessor === 'string' ? accessor.split('.') : accessor;
   let result = false;
   let target: any = data;

   for (let i: number = 0; i < access.length; i++)
   {
      const key: PropertyKey = access[i];
      const keyType: string = typeof key;

      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol')
      {
         throw new TypeError(`safeSet error: 'accessor' contains an entry that is not a property key.`);
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

         if (!isTraversableValue(next)) { return false; }
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

/**
 * Sentinel returned when an accessor path cannot be resolved.
 *
 * Used by:
 * - {@link resolvePropertyPath}, {@link hasProperty}, and {@link safeEqual}.
 */
const unresolvedProperty: unique symbol = Symbol();

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
         if (!isPlainObjectValue(child)) { continue; }

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
 * - {@link safeKeyIterator} when descending through ordinary object and array properties.
 * - {@link iterateArrayAccessors} when descending through symbol properties attached to arrays.
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
      throw new TypeError(`safeKeyIterator error: Circular object path detected.`);
   }

   const result: Set<object> = new Set(ancestors);
   result.add(child);
   return result;
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
 * - {@link safeKeyIterator} and {@link iterateArrayAccessors} for path enumeration.
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
 * Returns whether a value is a valid ECMAScript array index.
 *
 * The maximum array index is `2^32 - 2`; `2^32 - 1` is reserved and does not update an array's `length`.
 *
 * Called by:
 * - {@link safeAccess} and {@link safeSet} for runtime array-path validation.
 * - {@link resolvePropertyPath}, and therefore {@link hasProperty} / {@link safeEqual}.
 *
 * @param value - Candidate numeric property key.
 *
 * @returns Whether `value` is an integer in the ECMAScript array-index range.
 */
function isArrayIndex(value: unknown): value is number
{
   return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xFFFFFFFE;
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
 * Returns whether a value can participate as an intermediate JavaScript property-path target.
 *
 * Functions are included because they are objects for property-access purposes even though `typeof` reports
 * `"function"`. Primitive boxing is intentionally not performed, keeping all path utilities consistent.
 *
 * Called by:
 * - {@link safeAccess} and {@link safeSet} during path traversal.
 * - {@link resolvePropertyPath}, and therefore {@link hasProperty} / {@link safeEqual}.
 *
 * @param value - Candidate intermediate path value.
 *
 * @returns Whether properties may be traversed directly on `value`.
 */
function isTraversableValue(value: unknown): value is object | ((...args: any[]) => any)
{
   return value !== null && (typeof value === 'object' || typeof value === 'function');
}

/**
 * Returns whether a value is accepted as a top-level {@link deepMerge} target or source.
 *
 * This deliberately accepts class instances whose intrinsic tag is `[object Object]`, preserving legacy behavior for
 * top-level inputs. Recursive merging remains restricted by {@link isPlainObjectValue}; nested class instances are
 * assigned as values rather than traversed.
 *
 * Called by:
 * - {@link deepMerge} for top-level target and source validation.
 *
 * @param value - Candidate merge input.
 *
 * @returns Whether the value is an accepted non-array object record.
 */
function isMergeObjectValue(value: unknown): value is Record<PropertyKey, unknown>
{
   return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Returns whether a value is a plain object with either `Object.prototype` or `null` as its prototype.
 *
 * Direct prototype inspection avoids `Symbol.toStringTag` spoofing and excludes arrays, functions, and class
 * instances from recursive plain-object operations.
 *
 * Called by:
 * - {@link assertPlainObject} and {@link isPlainObject}.
 * - {@link deepMerge} to decide which nested values are recursively merged.
 * - {@link assertNoCircularPlainObject} to limit cycle detection to recursively mergeable values.
 *
 * @param value - Candidate plain object.
 *
 * @returns Whether `value` is a plain object.
 */
function isPlainObjectValue(value: unknown): value is Record<PropertyKey, unknown>
{
   if (value === null || typeof value !== 'object') { return false; }
   const prototype: object | null = Object.getPrototypeOf(value);
   return prototype === null || prototype === Object.prototype;
}

/**
 * Yields accessor paths for array indexes and enumerable symbol properties attached to arrays.
 *
 * Numeric indexes are yielded immediately to preserve the established iterator ordering and are intentionally treated
 * as leaves, even when an indexed value is an object. Symbol properties receive normal recursive traversal. A private
 * array stack avoids recursive generator calls for nested arrays reached through symbols.
 *
 * Called by:
 * - {@link safeKeyIterator} for root arrays and arrays encountered as object-property values.
 *
 * @param array - Array to enumerate.
 * @param path - Accessor path leading to `array`.
 * @param arrayIndex - Whether numeric array indexes should be yielded.
 * @param hasOwnOnly - Whether inherited enumerable symbol properties should be excluded.
 * @param objectStack - Primary object traversal stack owned by {@link safeKeyIterator}.
 * @param ancestors - Active path ancestors used for circular-reference detection.
 *
 * @returns An iterator of readonly property-key accessor paths.
 */
function* iterateArrayAccessors(array: any[], path: readonly PropertyKey[], arrayIndex: boolean,
 hasOwnOnly: boolean, objectStack: PropertyTraversalEntry[], ancestors: ReadonlySet<object>):
  IterableIterator<readonly PropertyKey[]>
{
   // A dedicated iterative stack avoids recursive generator delegation for symbol-linked nested arrays.
   const stack: ArrayTraversalEntry[] = [{ array, path, ancestors, symbolIndex: 0, indexesYielded: false }];

   while (stack.length > 0)
   {
      const frame: ArrayTraversalEntry = stack[stack.length - 1];

      if (!frame.indexesYielded)
      {
         frame.indexesYielded = true;

         if (arrayIndex)
         {
            // Array elements are leaf comparisons by design; object-valued entries are not recursively expanded.
            for (let i: number = 0; i < frame.array.length; i++)
            {
               yield frame.path.concat(i);
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
      else if (typeof value !== 'function')
      {
         yield fullPath;
      }
   }
}

/**
 * Resolves an exact property-key path while preserving missing-property information.
 *
 * Unlike {@link safeAccess}, this helper returns present `undefined` and `null` values unchanged. The private
 * {@link unresolvedProperty} sentinel is returned only when the path itself cannot be resolved.
 *
 * Called by:
 * - {@link hasProperty} to distinguish missing paths from present nullish values.
 * - {@link safeEqual} to compare source and target paths without collapsing missing and nullish values.
 *
 * @param data - Root object to traverse.
 * @param accessor - Exact property-key path.
 *
 * @returns The resolved value or {@link unresolvedProperty}.
 */
function resolvePropertyPath(data: object, accessor: readonly PropertyKey[]): unknown
{
   let result: any = data;

   for (let i: number = 0; i < accessor.length; i++)
   {
      if (!isTraversableValue(result)) { return unresolvedProperty; }

      const key: PropertyKey = accessor[i];
      const keyType: string = typeof key;

      /* v8 ignore start */
      if (keyType !== 'string' && keyType !== 'number' && keyType !== 'symbol') { return unresolvedProperty; }
      if (Array.isArray(result) && keyType !== 'symbol' && !isArrayIndex(key)) { return unresolvedProperty; }
      /* v8 ignore stop */

      if (!(key in (result as any))) { return unresolvedProperty; }
      result = (result as any)[key];
   }

   return result;
}

// Internal Types ----------------------------------------------------------------------------------------------------

/**
 * Stack frame for ordinary-object traversal in {@link safeKeyIterator}.
 */
interface PropertyTraversalEntry
{
   obj: object;
   path: readonly PropertyKey[];
   ancestors: ReadonlySet<object>;
}

/**
 * Stack frame for array traversal in {@link iterateArrayAccessors}.
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
  ? P extends ''
   ? undefined
   : DeepAccessString<T, P>
  : P extends readonly PropertyKey[]
   ? DeepAccessArray<T, P>
   : undefined;

/**
 * Infers a dotted string accessor in object T. Primitive and array traversal is rejected, matching runtime behavior.
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
 * Infers a readonly tuple accessor in object T. Array traversal accepts only numeric or symbol keys, matching runtime
 * behavior. Primitive traversal is rejected. A non-tuple accessor array returns `unknown`.
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

