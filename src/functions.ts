/**
 * Provides common object manipulation utilities including depth traversal, obtaining accessors, safely setting values /
 * equality tests.
 *
 * @packageDocumentation
 */

export * from 'klona/full';

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

   return _deepFreeze(data, skipKeys) as T;
}

/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a copy is produced. If the target and source property are object literals they are merged.
 * Deleting keys is supported by specifying a property starting with `-=`.
 *
 * @param target - Target object.
 *
 * @param sourceObj - One or more source objects.
 *
 * @returns Target object.
 */
export function deepMerge(target: object = {}, ...sourceObj: object[]): object
{
   if (Object.prototype.toString.call(target) !== '[object Object]')
   {
      throw new TypeError(`deepMerge error: 'target' is not an object.`);
   }

   for (let cntr: number = 0; cntr < sourceObj.length; cntr++)
   {
      if (Object.prototype.toString.call(sourceObj[cntr]) !== '[object Object]')
      {
         throw new TypeError(`deepMerge error: 'sourceObj[${cntr}]' is not an object.`);
      }
   }

   return _deepMerge(target, ...sourceObj);
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

   return _deepSeal(data, skipKeys) as T;
}

/**
 * Returns an async iterator of accessor keys by traversing the given object.
 *
 * Note: {@link getAccessorIter} is ~3 times faster. However, an async iterator can better fit certain algorithms
 * especially for very large object traversal.
 *
 * Note: The default `batchSize` is a fair tradeoff for memory and performance for small to somewhat large objects.
 * However, as object size increases from very large to massive then raise the `batchSize`. The larger the value more
 * memory is used.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @param [options] - Options.
 *
 * @param [options.batchSize] - To accommodate small to large objects processing is batched; default: `100000`.
 *
 * @param [options.inherited] - Set to `true` to include inherited properties; default: `false`.
 *
 * @returns Accessor async iterator.
 */
export async function* getAccessorAsyncIter(data: object, { batchSize = 100000, inherited = false }:
 { batchSize?: number, inherited?: boolean } = {}): AsyncIterableIterator<string>
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`getAccessorAsyncIter error: 'data' is not an object.`);
   }

   if (!Number.isInteger(batchSize) || batchSize <= 0)
   {
      throw new TypeError(`getAccessorAsyncIter error: 'options.batchSize' is not a positive integer.`);
   }

   if (typeof inherited !== 'boolean')
   {
      throw new TypeError(`getAccessorAsyncIter error: 'options.inherited' is not a boolean.`);
   }

   const thunks: (() => Promise<AsyncGenerator<string, void, unknown>>)[] = [];
   let processedCount: number = 0;

   async function* process(obj: object, prefix: string): AsyncGenerator<string, void, unknown>
   {
      for (const key in obj)
      {
         if (!inherited && !Object.prototype.hasOwnProperty.call(obj, key)) { continue; }

         const fullKey: string = prefix ? `${prefix}.${key}` : key;
         const value: any = obj[key];

         if (Array.isArray(value))
         {
            // Yield array elements immediately.
            for (let cntr: number = 0; cntr < value.length; cntr++) { yield `${fullKey}.${cntr}`; }
         }
         else if (typeof value === 'object' && value !== null)
         {
            // Defer objects to maintain DFS order.
            thunks.push((): Promise<AsyncGenerator<string, void, unknown>> => Promise.resolve(process(value, fullKey)));
         }
         else if (typeof value !== 'function')
         {
            yield fullKey; // Yield primitive values immediately.
         }

         processedCount++;
         if (processedCount >= batchSize)
         {
            processedCount = 0;

            yield* object_trampoline_async_generator(thunks); // Process a batch before continuing
         }
      }
   }

   yield* object_trampoline_async_generator(thunks, process(data, ''));
}

/**
 * Returns an iterator of accessor keys by traversing the given object.
 *
 * Note: {@link getAccessorList} is ~1.6 - 1.8 times faster for small objects. However, an iterator can better fit
 * certain algorithms.
 *
 * Note: The default `batchSize` is a fair tradeoff for memory and performance for small to somewhat large objects.
 * However, as object size increases from very large to massive then raise the `batchSize`. The larger the value more
 * memory is used. Do consider switching to {@link getAccessorIter} or {@link getAccessorAsyncIter}.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @param [options] - Options.
 *
 * @param [options.batchSize] - To accommodate small to large objects processing is batched; default: `100000`.
 *
 * @param [options.inherited] - Set to `true` to include inherited properties; default: `false`.
 *
 * @returns Accessor iterator.
 */
export function* getAccessorIter(data: object, { batchSize = 100000, inherited = false }:
 { batchSize?: number, inherited?: boolean } = {}): IterableIterator<string>
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`getAccessorIter error: 'data' is not an object.`);
   }

   if (!Number.isInteger(batchSize) || batchSize <= 0)
   {
      throw new TypeError(`getAccessorIter error: 'options.batchSize' is not a positive integer.`);
   }

   if (typeof inherited !== 'boolean')
   {
      throw new TypeError(`getAccessorIter error: 'options.inherited' is not a boolean.`);
   }

   const thunks: (() => Generator<string, void, unknown>)[] = [];
   let processedCount: number = 0;

   function* process(obj: object, prefix: string): Generator<string, void, unknown>
   {
      for (const key in obj)
      {
         if (!inherited && !Object.prototype.hasOwnProperty.call(obj, key)) { continue; }

         const fullKey: string = prefix ? `${prefix}.${key}` : key;
         const value: any = obj[key];

         if (Array.isArray(value))
         {
            // Yield array elements immediately.
            for (let cntr: number = 0; cntr < value.length; cntr++) { yield `${fullKey}.${cntr}`; }
         }
         else if (typeof value === 'object' && value !== null)
         {
            // Defer objects to maintain DFS order.
            thunks.push((): Generator<string, void, unknown> => process(value, fullKey));
         }
         else if (typeof value !== 'function')
         {
            yield fullKey; // Yield primitive values immediately.
         }

         processedCount++;
         if (processedCount >= batchSize)
         {
            processedCount = 0;
            yield* object_trampoline_generator(thunks); // Process a batch before continuing
         }
      }
   }

   yield* object_trampoline_generator(thunks, process(data, ''));
}

/**
 * Returns a list of accessor keys by traversing the given object.
 *
 * Note: This function is ~1.6 - 2.5 times faster than {@link getAccessorIter}. However, an iterator can better
 * fit certain algorithms.
 *
 * Note: The default `batchSize` is a fair tradeoff for memory and performance for small to somewhat large objects.
 * However, as object size increases from very large to massive then raise the `batchSize`. The larger the value more
 * memory is used. Do consider switching to {@link getAccessorIter} or {@link getAccessorAsyncIter}.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @param [options] - Options.
 *
 * @param [options.batchSize] - To accommodate small to large objects processing is batched; default: `100000`.
 *
 * @param [options.inherited] - Set to `true` to include inherited properties; default: `false`.
 *
 * @returns Accessor list.
 */
export function getAccessorList(data: object, { batchSize = 100000, inherited = false, maxDepth = Infinity }:
 { batchSize?: number, inherited?: boolean, maxDepth?: number } = {}): string[]
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`getAccessorList error: 'data' is not an object.`);
   }

   if (!(Number.isInteger(batchSize) && batchSize > 0))
   {
      throw new TypeError(`getAccessorList error: 'options.batchSize' is not a positive integer.`);
   }

   if (!(Number.isInteger(maxDepth) && maxDepth > 0) && maxDepth !== Infinity)
   {
      throw new TypeError(`getAccessorList error: 'options.maxDepth' is not a positive integer or Infinity.`);
   }

   if (typeof inherited !== 'boolean')
   {
      throw new TypeError(`getAccessorList error: 'options.inherited' is not a boolean.`);
   }

   const accessors: string[] = [];
   const thunks: (() => void)[] = [];
   let processedCount: number = 0;

   function process(obj: object, prefix: string, depth: number): void
   {
      depth++;

      if (depth > maxDepth) { return; }

      for (const key in obj)
      {
         if (!inherited && !Object.prototype.hasOwnProperty.call(obj, key)) { continue; }

         const fullKey: string = prefix ? `${prefix}.${key}` : key;
         const value: any = obj[key];

         if (Array.isArray(value))
         {
            // Process array elements immediately to preserve order.
            for (let i: number = 0; i < value.length; i++) { accessors.push(`${fullKey}.${i}`); }
         }
         else if (typeof value === 'object' && value !== null)
         {
            // Push object traversal as a deferred function.
            thunks.push((): void => process(value, fullKey, depth));
         }
         else if (typeof value !== 'function')
         {
            // Process primitive values immediately.
            accessors.push(fullKey);
         }

         // Handle batch processing to avoid blocking large operations
         processedCount++;
         if (processedCount >= batchSize)
         {
            processedCount = 0;
            processDeferred(); // Process some deferred items before continuing
         }
      }
   }

   function processDeferred(): void
   {
      const length: number = Math.min(batchSize, thunks.length);

      // Execute a deferred function (LIFO order).
      for (let cntr: number = 0; cntr < length; cntr++) { thunks.pop()!(); }
   }

   process(data, '', 0);
   object_trampoline(thunks)

   return accessors;
}

/**
 * Provides a method to determine if the passed in Svelte component has a getter & setter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the component has the getter and setter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor type.
 */
export function hasAccessor<T extends object, K extends string>(object: T, accessor: K):
 object is T & Record<K, unknown>
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
 * Provides a method to determine if the passed in Svelte component has a getter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the component has the getter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor type.
 */
export function hasGetter<T extends object, K extends string>(object: T, accessor: K): object is T & Record<K, unknown>
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
 * Returns whether the target is or has the given prototype walking up the prototype chain.
 *
 * @param target - Any target class / constructor function to test.
 *
 * @param Prototype - Prototype function / class constructor to find.
 *
 * @returns Target matches prototype.
 *
 * @typeParam T - Prototype instance type.
 */
export function hasPrototype<T>(target: unknown, Prototype: new (...args: any[]) => T):
 target is new (...args: any[]) => T
{
   /* c8 ignore next */
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
 * Provides a method to determine if the passed in Svelte component has a setter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the component has the setter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor type.
 */
export function hasSetter<T extends object, K extends string>(object: T, accessor: K): object is T & Record<K, unknown>
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
 * Tests for whether an object is async iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether value is async iterable.
 */
export function isAsyncIterable(value: unknown): value is AsyncIterable<any>
{
   if (typeof value !== 'object' || value === null || value === void 0) { return false; }

   return Symbol.asyncIterator in value;
}

/**
 * Tests for whether an object is iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether object is iterable.
 */
export function isIterable(value: unknown): value is Iterable<any>
{
   if (value === null || value === void 0 || typeof value !== 'object') { return false; }

   return Symbol.iterator in value;
}

/**
 * Tests for whether object is not null, typeof object, and not an array.
 *
 * @param value - Any value.
 *
 * @returns Is it an object.
 */
export function isObject(value: unknown): value is Record<string, unknown>
{
   return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Tests for whether the given value is a plain object.
 *
 * An object is plain if it is created by either: `{}`, `new Object()` or `Object.create(null)`.
 *
 * @param value - Any value
 *
 * @returns Is it a plain object.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown>
{
   return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param object - An object.
 *
 * @returns Object keys or empty array.
 */
export function objectKeys(object: object): string[]
{
   return typeof object === 'object' && object !== null ? Object.keys(object) : [];
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

   const tag: any = Object.prototype.toString.call(object);

   if (tag === '[object Map]' || tag === '[object Set]') { return object.size; }

   if (tag === '[object String]') { return object.length; }

   return Object.keys(object).length;
}

/**
 * Provides a way to safely access an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param data - An object to access entry data.
 *
 * @param accessor - A string describing the entries to access with keys separated by `.`.
 *
 * @param [defaultValue] - (Optional) A default value to return if an entry for accessor is not found.
 *
 * @returns The value referenced by the accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam P - Accessor type.
 * @typeParam R - Return value / Inferred deep access type or any provided default value type.
 */
export function safeAccess<T extends object, P extends string, R = DeepAccess<T, P>>(data: T, accessor: P,
 defaultValue?: DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>):
  DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>
{
   if (typeof data !== 'object' || data === null) { return defaultValue as any; }
   if (typeof accessor !== 'string') { return defaultValue as any; }

   const keys: string[] = accessor.split('.');
   let result: any = data;

   // Walk through the given object by the accessor indexes.
   for (let cntr: number = 0; cntr < keys.length; cntr++)
   {
      // If the next level of object access is undefined or null then return the empty string.
      if (result[keys[cntr]] === void 0 || result[keys[cntr]] === null) { return defaultValue as any; }

      result = result[keys[cntr]];
   }

   return result as any;
}

/**
 * Compares a source object and values of entries against a target object. If the entries in the source object match
 * the target object then `true` is returned otherwise `false`. If either object is undefined or null then false
 * is returned.
 *
 * Note: The source and target should be JSON objects.
 *
 * @param source - Source object.
 *
 * @param target - Target object.
 *
 * @param [options] - Options.
 *
 * @param [options.batchSize] - To accommodate small to large objects processing is batched; default: `100000`.
 *
 * @returns True if equal.
 */
export function safeEqual(source: object, target: object, options?: { batchSize?: number }): boolean
{
   if (typeof source !== 'object' || source === null || typeof target !== 'object' || target === null) { return false; }

   for (const accessor of getAccessorIter(source, options))
   {
      const sourceObjectValue: unknown = safeAccess(source, accessor);
      const targetObjectValue: unknown = safeAccess(target, accessor);

      if (sourceObjectValue !== targetObjectValue) { return false; }
   }

   return true;
}

/**
 * Provides a way to safely set an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param data - An object to access entry data.
 *
 * @param accessor - A string describing the entries to access.
 *
 * @param value - A new value to set if an entry for accessor is found.
 *
 * @param [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set', 'set-undefined', 'sub'.
 *
 * @param [createMissing=true] - If true missing accessor entries will be created as objects automatically.
 *
 * @returns True if successful.
 */
export function safeSet(data: object, accessor: string, value: any, operation: SafeSetOperation = 'set',
 createMissing: boolean = true): boolean
{
   if (typeof data !== 'object' || data === null) { throw new TypeError(`safeSet error: 'data' is not an object.`); }
   if (typeof accessor !== 'string') { throw new TypeError(`safeSet error: 'accessor' is not a string.`); }

   const access: string[] = accessor.split('.');

   // Walk through the given object by the accessor indexes.
   for (let cntr: number = 0; cntr < access.length; cntr++)
   {
      // If data is an array perform validation that the accessor is a positive integer otherwise quit.
      if (Array.isArray(data))
      {
         const number: number = (+access[cntr]);

         if (!Number.isInteger(number) || number < 0) { return false; }
      }

      if (cntr === access.length - 1)
      {
         switch (operation)
         {
            case 'add':
               data[access[cntr]] += value;
               break;

            case 'div':
               data[access[cntr]] /= value;
               break;

            case 'mult':
               data[access[cntr]] *= value;
               break;

            case 'set':
               data[access[cntr]] = value;
               break;

            case 'set-undefined':
               if (data[access[cntr]] === void 0) { data[access[cntr]] = value; }
               break;

            case 'sub':
               data[access[cntr]] -= value;
               break;
         }
      }
      else
      {
         // If createMissing is true and the next level of object access is undefined then create a new object entry.
         if (createMissing && data[access[cntr]] === void 0) { data[access[cntr]] = {}; }

         // Abort if the next level is null or not an object and containing a value.
         if (data[access[cntr]] === null || typeof data[access[cntr]] !== 'object') { return false; }

         data = data[access[cntr]];
      }
   }

   return true;
}

/**
 * Defines the operation to perform for `safeSet`.
 */
export type SafeSetOperation = 'add' | 'div' | 'mult' | 'set' | 'set-undefined' | 'sub';

// Module private ----------------------------------------------------------------------------------------------------

/**
 * Internal utility for shared trampoline function.
 * Process last added function (LIFO order)
 *
 * @param thunks - Thunks to process.
 */
function object_trampoline(thunks: (() => void)[]): void
{
   // Execute deferred functions (LIFO order).
  while (thunks.length > 0) { thunks.pop()!(); }
}

/**
 * Internal utility for shared trampoline function (generator).
 * Process last added function (LIFO order)
 *
 * @param thunks - Thunks to process.
 *
 * @param [initial] - Initial generator.
 */
function* object_trampoline_generator(thunks: (() => Generator<string, void, unknown>)[],
 initial?: Generator<string, void, unknown>): IterableIterator<string>
{
   // Process any initial generator first.
   if (initial) { yield* initial; }

   // Execute deferred functions (LIFO order).
   while (thunks.length > 0) { yield* thunks.pop()!(); }
}

/**
 * Internal utility for shared trampoline function (async generator).
 * Process last added function (LIFO order)
 *
 * @param thunks - Thunks to process.
 *
 * @param [initial] - Initial generator.
 */
async function* object_trampoline_async_generator(thunks: (() => Promise<AsyncGenerator<string, void, unknown>>)[],
 initial?: AsyncGenerator<string, void, unknown>): AsyncIterableIterator<string>
{
   // Process any initial generator first.
   if (initial) { yield* initial; }

   // Execute deferred async functions (LIFO order).
   while (thunks.length > 0) { yield* await thunks.pop()!(); }
}

/**
 * Private implementation of depth traversal.
 *
 * @param data - An object or array or any leaf.
 *
 * @param [skipKeys] - A Set of strings indicating keys of objects to not freeze.
 *
 * @returns The frozen object.
 *
 * @internal
 * @private
 */
function _deepFreeze(data: any, skipKeys?: Set<string>): object | []
{
   if (Array.isArray(data))
   {
      for (let cntr: number = 0; cntr < data.length; cntr++) { _deepFreeze(data[cntr], skipKeys); }
   }
   else if (typeof data === 'object' && data !== null)
   {
      for (const key in data)
      {
         if (Object.prototype.hasOwnProperty.call(data, key) && !skipKeys?.has?.(key))
         {
            _deepFreeze(data[key], skipKeys);
         }
      }
   }

   return Object.freeze(data);
}

/**
 * Internal implementation for `deepMerge`.
 *
 * @param target - Target object.
 *
 * @param sourceObj - One or more source objects.
 *
 * @returns Target object.
 *
 * @internal
 * @private
 */
function _deepMerge(target: object = {}, ...sourceObj: object[]): object
{
   // Iterate and merge all source objects into target.
   for (let cntr: number = 0; cntr < sourceObj.length; cntr++)
   {
      const obj: object = sourceObj[cntr];

      for (const prop in obj)
      {
         if (Object.prototype.hasOwnProperty.call(obj, prop))
         {
            // Handle the special property starting with '-=' to delete keys.
            if (prop.startsWith('-='))
            {
               delete target[prop.slice(2)];
               continue;
            }

            // If target already has prop and both target[prop] and obj[prop] are object literals then merge them
            // otherwise assign obj[prop] to target[prop].
            target[prop] = Object.prototype.hasOwnProperty.call(target, prop) && target[prop]?.constructor === Object &&
            obj[prop]?.constructor === Object ? _deepMerge({}, target[prop], obj[prop]) : obj[prop];
         }
      }
   }

   return target;
}

/**
 * Private implementation of depth traversal.
 *
 * @param data - An object or array or any leaf.
 *
 * @param [skipKeys] - A Set of strings indicating keys of objects to not freeze.
 *
 * @returns The frozen object.
 *
 * @internal
 * @private
 */
function _deepSeal(data: any, skipKeys?: Set<string>): object | []
{
   if (Array.isArray(data))
   {
      for (let cntr: number = 0; cntr < data.length; cntr++) { _deepSeal(data[cntr], skipKeys); }
   }
   else if (typeof data === 'object' && data !== null)
   {
      for (const key in data)
      {
         if (Object.prototype.hasOwnProperty.call(data, key) && !skipKeys?.has?.(key))
         {
            _deepSeal(data[key], skipKeys);
         }
      }
   }

   return Object.seal(data);
}

/**
 * Utility type for `safeAccess`. Infers compound accessor strings in object T.
 */
type DeepAccess<T, P extends string> =
 P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
   ? DeepAccess<T[K], Rest>
   : undefined
  : P extends keyof T
   ? T[P]
   : undefined;
