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
      // If the next level of object access is undefined or null then return the default value.
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
 * @param [options.inherited] - Set to `true` to include inherited properties; default: `false`.
 *
 * @returns True if equal.
 */
export function safeEqual(source: object, target: object, options?: { inherited?: boolean }): boolean
{
   if (typeof source !== 'object' || source === null || typeof target !== 'object' || target === null) { return false; }

   for (const accessor of safeKeyIterator(source, options))
   {
      const sourceObjectValue: unknown = safeAccess(source, accessor);
      const targetObjectValue: unknown = safeAccess(target, accessor);

      if (sourceObjectValue !== targetObjectValue) { return false; }
   }

   return true;
}

/**
 * Returns an iterator of keys useful with {@link safeAccess} and {@link safeSet} by traversing the given object.
 *
 * Note: The default `batchSize` is a fair tradeoff for memory and performance for small to somewhat large objects.
 * However, as object size increases from very large to massive then raise the `batchSize`. The larger the value more
 * memory is used.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @param [options] - Options.
 *
 * @param [options.inherited] - Set to `true` to include inherited properties; default: `false`.
 *
 * @returns Accessor iterator.
 */
export function* safeKeyIterator(data: object, { inherited = false }: { inherited?: boolean } = {}):
 IterableIterator<string>
{
   if (typeof data !== 'object' || data === null)
   {
      throw new TypeError(`safeKeyIterator error: 'data' is not an object.`);
   }

   if (typeof inherited !== 'boolean')
   {
      throw new TypeError(`safeKeyIterator error: 'options.inherited' is not a boolean.`);
   }

   const stack: { obj: object; prefix: string }[] = [{ obj: data, prefix: '' }];

   while (stack.length > 0)
   {
      const { obj, prefix } = stack.pop()!;

      for (const key in obj)
      {
         if (!inherited && !Object.hasOwn(obj, key)) { continue; }

         const fullKey: string = prefix ? `${prefix}.${key}` : key;
         const value: any = obj[key];

         if (Array.isArray(value))
         {
            for (let cntr: number = 0; cntr < value.length; cntr++) { yield `${fullKey}.${cntr}`; }
         }
         else if (typeof value === 'object' && value !== null)
         {
            stack.push({ obj: value, prefix: fullKey }); // Push to stack for DFS traversal.
         }
         else if (typeof value !== 'function')
         {
            yield fullKey;
         }
      }
   }
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
export function safeSet(data: object, accessor: string, value: any, operation: 'add' | 'div' | 'mult' | 'set' |
 'set-undefined' | 'sub' = 'set', createMissing: boolean = true): boolean
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

// Utility types -----------------------------------------------------------------------------------------------------

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

