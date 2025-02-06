/**
 * Provides common object manipulation utilities including depth traversal, obtaining accessors, safely setting values /
 * equality tests.
 *
 * @packageDocumentation
 */

const s_TAG_OBJECT = '[object Object]';
const s_TAG_MAP = '[object Map]';
const s_TAG_SET = '[object Set]';
const s_TAG_STRING = '[object String]';

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
   /* c8 ignore next 1 */
   if (!isObject(data) && !Array.isArray(data)) { throw new TypeError(`'data' is not an 'object' or 'array'.`); }

   /* c8 ignore next 4 */
   if (skipKeys !== void 0 && !(skipKeys instanceof Set))
   {
      throw new TypeError(`'skipKeys' is not a 'Set'.`);
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
   if (Object.prototype.toString.call(target) !== s_TAG_OBJECT)
   {
      throw new TypeError(`deepMerge error: 'target' is not an 'object'.`);
   }

   for (let cntr: number = 0; cntr < sourceObj.length; cntr++)
   {
      if (Object.prototype.toString.call(sourceObj[cntr]) !== s_TAG_OBJECT)
      {
         throw new TypeError(`deepMerge error: 'sourceObj[${cntr}]' is not an 'object'.`);
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
   /* c8 ignore next 1 */
   if (!isObject(data) && !Array.isArray(data)) { throw new TypeError(`'data' is not an 'object' or 'array'.`); }

   /* c8 ignore next 4 */
   if (skipKeys !== void 0 && !(skipKeys instanceof Set))
   {
      throw new TypeError(`'skipKeys' is not a 'Set'.`);
   }

   return _deepSeal(data, skipKeys) as T;
}

/**
 * Performs a naive depth traversal of an object / array. The data structure _must not_ have circular references.
 * If the `modify` option is true the result of the callback function is used to modify in place the given data.
 *
 * @param data - An object or array.
 *
 * @param func - A callback function to process leaf values in children arrays or object members.
 *
 * @param [options] - Options.
 *
 * @param [options.modify] - If true then the result of the callback function is used to modify in place the given data.
 *
 * @returns The data object.
 *
 * @typeParam T - Type of data.
 * @typeParam R - Alternate return type; defaults to `T`.
 */
export function depthTraverse<T extends object | [], R = T>(data: T, func: (arg0: any) => any,
 { modify = false }: { modify?: boolean } = {}): R
{
   /* c8 ignore next 1 */
   if (typeof data !== 'object') { throw new TypeError(`'data' is not an 'object'.`); }

   /* c8 ignore next 1 */
   if (typeof func !== 'function') { throw new TypeError(`'func' is not a 'function'.`); }

   return _depthTraverse(data, func, modify) as R;
}

/**
 * Returns a list of accessor keys by traversing the given object.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @returns Accessor list.
 */
export function getAccessorList(data: object): string[]
{
   if (typeof data !== 'object') { throw new TypeError(`getAccessorList error: 'data' is not an 'object'.`); }

   return _getAccessorList(data);
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
   return Object.prototype.toString.call(value) === s_TAG_OBJECT;
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
   return isObject(object) ? Object.keys(object) : [];
}

/**
 * Safely returns an objects size. Note for String objects unicode is not taken into consideration.
 *
 * @param object - Any value, but size returned for object / Map / Set / arrays / strings.
 *
 * @returns Size of object.
 */
export function objectSize(object: any): number
{
   if (object === void 0 || object === null || typeof object !== 'object') { return 0; }

   const tag = Object.prototype.toString.call(object);

   if (tag === s_TAG_MAP || tag === s_TAG_SET) { return object.size; }

   if (tag === s_TAG_STRING) { return object.length; }

   return Object.keys(object).length;
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
 * Provides a way to safely batch set an objects data / entries given an array of accessor strings which describe the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk. If value is an object the accessor will be used to access a target value from `value` which is
 * subsequently set to `data` by the given operation. If `value` is not an object it will be used as the target
 * value to set across all accessors.
 *
 * @param data - An object to access entry data.
 *
 * @param accessors - A list of accessor strings describing the entries to access.
 *
 * @param value - A new value to set if an entry for accessor is found.
 *
 * @param [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set', 'set-undefined', 'sub'.
 *
 * @param [defaultAccessValue=0] - A new value to set if an entry for accessor is found.
 *
 * @param [createMissing=true] - If true missing accessor entries will be created as objects automatically.
 */
export function safeBatchSet(data: object, accessors: string[], value: any, operation: SafeSetOperation = 'set',
 defaultAccessValue: any = 0, createMissing: boolean = true): void
{
   if (typeof data !== 'object') { throw new TypeError(`safeBatchSet error: 'data' is not an 'object'.`); }
   if (!Array.isArray(accessors)) { throw new TypeError(`safeBatchSet error: 'accessors' is not an 'array'.`); }

   if (typeof value === 'object')
   {
      accessors.forEach((accessor) =>
      {
         const targetValue = safeAccess(value, accessor, defaultAccessValue);
         safeSet(data, accessor, targetValue, operation, createMissing);
      });
   }
   else
   {
      accessors.forEach((accessor) =>
      {
         safeSet(data, accessor, value, operation, createMissing);
      });
   }
}

/**
 * Compares a source object and values of entries against a target object. If the entries in the source object match
 * the target object then `true` is returned otherwise `false`. If either object is undefined or null then false
 * is returned.
 *
 * @param source - Source object.
 *
 * @param target - Target object.
 *
 * @returns True if equal.
 */
export function safeEqual(source: object, target: object): boolean
{
   if (!isObject(source) || !isObject(target)) { return false; }

   const sourceAccessors: string[] = getAccessorList(source);

   for (let cntr: number = 0; cntr < sourceAccessors.length; cntr++)
   {
      const accessor: string = sourceAccessors[cntr];

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
   if (typeof data !== 'object') { throw new TypeError(`safeSet error: 'data' is not an 'object'.`); }
   if (typeof accessor !== 'string') { throw new TypeError(`safeSet error: 'accessor' is not a 'string'.`); }

   const access = accessor.split('.');

   // Walk through the given object by the accessor indexes.
   for (let cntr = 0; cntr < access.length; cntr++)
   {
      // If data is an array perform validation that the accessor is a positive integer otherwise quit.
      if (Array.isArray(data))
      {
         const number = (+access[cntr]);

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
 * Performs bulk setting of values to the given data object.
 *
 * @param data - The data object to set data.
 *
 * @param accessorValues - Object of accessor keys to values to set.
 *
 * @param [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set', 'sub'; default (`set`).
 *
 * @param [createMissing=true] - If true missing accessor entries will be created as objects automatically.
 */
export function safeSetAll(data: object, accessorValues: Record<string, any>, operation: SafeSetOperation = 'set',
 createMissing: boolean = true): void
{
   if (typeof data !== 'object') { throw new TypeError(`safeSetAll error: 'data' is not an 'object'.`); }
   if (typeof accessorValues !== 'object')
   {
      throw new TypeError(`safeSetAll error: 'accessorValues' is not an 'object'.`);
   }

   for (const accessor of Object.keys(accessorValues))
   {
      if (!Object.prototype.hasOwnProperty.call(accessorValues, accessor)) { continue; }

      safeSet(data, accessor, accessorValues[accessor], operation, createMissing);
   }
}

// Module private ----------------------------------------------------------------------------------------------------

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
      for (let cntr = 0; cntr < data.length; cntr++) { _deepFreeze(data[cntr], skipKeys); }
   }
   else if (isObject(data))
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
   for (let cntr = 0; cntr < sourceObj.length; cntr++)
   {
      const obj = sourceObj[cntr];

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
      for (let cntr = 0; cntr < data.length; cntr++) { _deepSeal(data[cntr], skipKeys); }
   }
   else if (isObject(data))
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
 * Private implementation of depth traversal.
 *
 * @param data - An object, array, or any leaf value
 *
 * @param func - A callback function to process leaf values in children arrays or object members.
 *
 * @param modify - If true then the result of the callback function is used to modify in place the given data.
 *
 * @returns The data object.
 *
 * @internal
 * @private
 */
function _depthTraverse(data: any, func: Function, modify: boolean = false): Record<string, unknown> | []
{
   if (modify)
   {
      if (Array.isArray(data))
      {
         for (let cntr = 0; cntr < data.length; cntr++)
         {
            data[cntr] = _depthTraverse(data[cntr], func, modify);
         }
      }
      else if (isObject(data))
      {
         for (const key in data)
         {
            if (Object.prototype.hasOwnProperty.call(data, key))
            {
               data[key] = _depthTraverse(data[key], func, modify);
            }
         }
      }
      else
      {
         data = func(data);
      }
   }
   else
   {
      if (Array.isArray(data))
      {
         for (let cntr = 0; cntr < data.length; cntr++) { _depthTraverse(data[cntr], func, modify); }
      }
      else if (typeof data === 'object')
      {
         for (const key in data)
         {
            if (Object.prototype.hasOwnProperty.call(data, key)) { _depthTraverse(data[key], func, modify); }
         }
      }
      else
      {
         func(data);
      }
   }

   return data;
}

/**
 * Private implementation of `getAccessorList`.
 *
 * @param data - An object to traverse.
 *
 * @returns Accessor list.
 *
 * @internal
 * @private
 */
function _getAccessorList(data: object): string[]
{
   const accessors = [];

   for (const key in data)
   {
      if (Object.prototype.hasOwnProperty.call(data, key))
      {
         if (typeof data[key] === 'object')
         {
            const childKeys = _getAccessorList(data[key]);

            childKeys.forEach((childKey) =>
            {
               accessors.push(Array.isArray(childKey) ? `${key}.${childKey.join('.')}` : `${key}.${childKey}`);
            });
         }
         else
         {
            accessors.push(key);
         }
      }
   }

   return accessors;
}

/**
 * Defines the operation to perform for `safeSet`.
 */
export type SafeSetOperation = 'add' | 'div' | 'mult' | 'set' | 'set-undefined' | 'sub';
