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
 * Returns the value resolved by a property path while preserving present `undefined` and `null` values.
 *
 * Unlike {@link safeAccess}, this function returns a present nullish property unchanged. A missing or invalid path
 * returns `undefined`; use {@link hasProperty} when that result must be distinguished from a present `undefined`
 * property. Array indexes require numeric keys through an exact array property-key path.
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

   return getPropertyDescriptor(object, [accessor as PropertyKey])?.set !== void 0;
}

/**
 * Returns whether a value is a valid ECMAScript array index.
 *
 * The maximum array index is `2^32 - 2`; `2^32 - 1` is reserved and does not update an array's `length`.
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
 * Determines whether a value is a JavaScript property key.
 *
 * Property keys are strings, numbers, or symbols. Numbers are accepted because exact property-key arrays preserve
 * numeric array indexes and ordinary JavaScript property access coerces numeric object keys as usual.
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
 * @param value - Value to validate.
 *
 * @returns Whether the value is a valid {@link PropertyPath}.
 */
export function isPropertyPath(value: unknown): value is PropertyPath
{
   if (typeof value === 'string') { return value.length > 0; }

   if (!Array.isArray(value) || value.length === 0) { return false; }

   for (let i: number = 0, l: number = value.length; i < l; i++)
   {
      if (!isPropertyKey(value[i])) { return false; }
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
 * @param prefix - Candidate prefix path.
 *
 * @param path - Complete path that must equal or descend from `prefix`.
 *
 * @returns Whether `prefix` is an exact structural prefix of `path`.
 */
export function isPropertyPathPrefix(prefix: PropertyPath, path: PropertyPath): boolean
{
   if (!isPropertyPath(prefix) || !isPropertyPath(path)) { return false; }

   const prefixPath: readonly PropertyKey[] = normalizePropertyPath(prefix);
   const normPath: readonly PropertyKey[] = normalizePropertyPath(path);

   if (prefixPath.length > normPath.length) { return false; }

   for (let index: number = 0; index < prefixPath.length; index++)
   {
      const prefixKey: PropertyKey = prefixPath[index];
      const normPathKey: PropertyKey = normPath[index];

      if (prefixKey !== normPathKey && !(typeof prefixKey === 'number' && typeof normPathKey === 'number' &&
       Number.isNaN(prefixKey) && Number.isNaN(normPathKey)))
      {
         return false;
      }
   }

   return true;
}

/**
 * Converts a property path to an equivalent dotted string path when that conversion is lossless.
 *
 * Exact property-key arrays containing numbers, symbols, or string segments with literal periods cannot be represented
 * by dotted-string syntax without changing their property-path semantics and are rejected. Empty segments are retained,
 * so `['level1', '', 'value']` becomes `'level1..value'`. The exact single empty-string key `['']` is rejected because
 * an empty dotted string is not a valid {@link PropertyPath}.
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
 * @param path - Property path to normalize.
 *
 * @returns The path as a readonly property-key array.
 *
 * @throws {TypeError} If `path` is not a valid {@link PropertyPath}.
 */
export function normalizePropertyPath(path: PropertyPath): readonly PropertyKey[]
{
   if (!isPropertyPath(path))
   {
      throw new TypeError(`normalizePropertyPath error: 'path' is not a valid property path.`);
   }

   return typeof path === 'string' ? path.split('.') : path;
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
 * Returns an iterator of property-key path arrays useful with {@link safeAccess} and {@link safeSet} by traversing
 * the given object. Enumerable string and symbol keys are included, and array indexes are emitted as numbers.
 *
 * Note: Keys are only generated for ordinary objects and arrays; {@link Map} and {@link Set} are not indexed.
 *
 * @param data - An object to traverse for property path keys.
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
export function* pathKeyIterator(data: object, { arrayIndex = true, hasOwnOnly = true }:
 { arrayIndex?: boolean, hasOwnOnly?: boolean } = {}): IterableIterator<readonly PropertyKey[]>
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`pathKeyIterator error: 'data' is not an object.`);
   }

   if (typeof arrayIndex !== 'boolean')
   {
      throw new TypeError(`pathKeyIterator error: 'options.arrayIndex' is not a boolean.`);
   }

   if (typeof hasOwnOnly !== 'boolean')
   {
      throw new TypeError(`pathKeyIterator error: 'options.hasOwnOnly' is not a boolean.`);
   }

   // Ancestors are tracked per active path, not globally. Shared objects may therefore appear at multiple valid
   // paths while a true reference back to an ancestor still throws.
   const rootAncestors: ReadonlySet<object> = new Set([data]);
   const stack: PropertyTraversalEntry[] = [{ obj: data, path: [], ancestors: rootAncestors }];

   while (stack.length > 0)
   {
      const { obj, path, ancestors } = stack.pop()!;

      if (Array.isArray(obj))
      {
         yield* iterateArrayPaths(obj, path, arrayIndex, hasOwnOnly, stack, ancestors);
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
            yield* iterateArrayPaths(value, fullPath, arrayIndex, hasOwnOnly, stack,
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
 * Provides a way to safely access an object's data / entries using either a dotted property path string or an array of
 * exact property keys.
 *
 * Array indexes may only be accessed by number through the array property-key form.
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

   for (const path of pathKeyIterator(source, options))
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
 * Yields property-key paths for array indexes and enumerable symbol properties attached to arrays.
 *
 * Numeric indexes are yielded immediately to preserve the established iterator ordering and are intentionally treated
 * as leaves, even when an indexed value is an object. Symbol properties receive normal recursive traversal. A private
 * array stack avoids recursive generator calls for nested arrays reached through symbols.
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
 *
 * @returns An iterator of readonly property-key paths.
 */
function* iterateArrayPaths(array: any[], path: readonly PropertyKey[], arrayIndex: boolean,
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

      if (!isTraversableValue(next)) { return void 0; }

      candidate = next;

      /* v8 ignore start - PropertyPath paths are always non-empty */
   }

   return void 0;
}
/* v8 ignore stop */

// External Types ----------------------------------------------------------------------------------------------------

/**
 * Defines a property path accepted by {@link hasProperty}, {@link safeAccess}, and {@link safeSet}. String paths use
 * `.` delimiters while array paths preserve each {@link PropertyKey} as an exact property key. Array indexes require
 * numeric keys.
 */
export type PropertyPath = string | readonly PropertyKey[];

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
 * Object or function that can provide a direct JavaScript property-path segment.
 */
type PropertyPathTraversableValue = object | ((...args: any[]) => any);

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

