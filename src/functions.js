/**
 * Provides common object manipulation utilities including depth traversal, obtaining accessors, safely setting values /
 * equality tests, and validation.
 */

const s_TAG_OBJECT = '[object Object]';
const s_TAG_MAP = '[object Map]';
const s_TAG_SET = '[object Set]';
const s_TAG_STRING = '[object String]';

/**
 * @typedef {object} ValidationEntry - Provides data for a validation check.
 *
 * @property {string}               [type] - Optionally tests with a typeof check.
 *
 * @property {Array<*>|Function|Set<*>}  [expected] - Optional array, function, or set of expected values to test
 * against.
 *
 * @property {string}               [message] - Optional message to include.
 *
 * @property {boolean}              [required=true] - When false if the accessor is missing validation is skipped.
 *
 * @property {boolean}              [error=true] - When true and error is thrown otherwise a boolean is returned.
 */

/**
 * Freezes all entries traversed that are objects including entries in arrays.
 *
 * @param {object|Array}   data - An object or array.
 *
 * @param {string[]}       skipFreezeKeys - An array of strings indicating keys of objects to not freeze.
 *
 * @returns {object|Array} The frozen object.
 */
export function deepFreeze(data, skipFreezeKeys = [])
{
   /* istanbul ignore if */
   if (typeof data !== 'object') { throw new TypeError(`'data' is not an 'object'.`); }

   /* istanbul ignore if */
   if (!Array.isArray(skipFreezeKeys)) { throw new TypeError(`'skipFreezeKeys' is not an 'array'.`); }

   return _deepFreeze(data, skipFreezeKeys);
}

/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a copy is produced. If the target and source property are object literals they are merged.
 * Deleting keys is supported by specifying a property starting with `-=`.
 *
 * @param {object}      target - Target object.
 *
 * @param {...object}   sourceObj - One or more source objects.
 *
 * @returns {object}    Target object.
 */
export function deepMerge(target = {}, ...sourceObj)
{
   if (Object.prototype.toString.call(target) !== s_TAG_OBJECT)
   {
      throw new TypeError(`deepMerge error: 'target' is not an 'object'.`);
   }

   for (let cntr = 0; cntr < sourceObj.length; cntr++)
   {
      if (Object.prototype.toString.call(sourceObj[cntr]) !== s_TAG_OBJECT)
      {
         throw new TypeError(`deepMerge error: 'sourceObj[${cntr}]' is not an 'object'.`);
      }
   }

   return _deepMerge(target, ...sourceObj);
}

/**
 * Performs a naive depth traversal of an object / array. The data structure _must not_ have circular references.
 * The result of the callback function is used to modify in place the given data.
 *
 * @param {object|Array}   data - An object or array.
 *
 * @param {Function}       func - A callback function to process leaf values in children arrays or object members.
 *
 * @param {boolean}        modify - If true then the result of the callback function is used to modify in place
 *                                  the given data.
 *
 * @returns {*} The data object.
 */
export function depthTraverse(data, func, modify = false)
{
   /* istanbul ignore if */
   if (typeof data !== 'object') { throw new TypeError(`'data' is not an 'object'.`); }

   /* istanbul ignore if */
   if (typeof func !== 'function') { throw new TypeError(`'func' is not a 'function'.`); }

   return _depthTraverse(data, func, modify);
}

/**
 * Returns a list of accessor keys by traversing the given object.
 *
 * @param {object}   data - An object to traverse for accessor keys.
 *
 * @returns {string[]} Accessor list.
 */
export function getAccessorList(data)
{
   if (typeof data !== 'object') { throw new TypeError(`getAccessorList error: 'data' is not an 'object'.`); }

   return _getAccessorList(data);
}

/**
 * Tests for whether an object is iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether object is iterable.
 */
export function isIterable(value)
{
   if (value === null || value === void 0 || typeof value !== 'object') { return false; }

   return typeof value[Symbol.iterator] === 'function';
}

/**
 * Tests for whether an object is async iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether value is async iterable.
 */
export function isIterableAsync(value)
{
   if (value === null || value === void 0 || typeof value !== 'object') { return false; }

   return typeof value[Symbol.asyncIterator] === 'function';
}

/**
 * Tests for whether object is not null and a typeof object.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Is it an object.
 */
export function isObject(value)
{
   return value !== null && typeof value === 'object';
}

/**
 * Tests for whether the given value is a plain object.
 *
 * An object is plain if it is created by either: {}, new Object() or Object.create(null).
 *
 * @param {*} value - Any value
 *
 * @returns {boolean} Is it a plain object.
 */
export function isPlainObject(value)
{
   if (Object.prototype.toString.call(value) !== s_TAG_OBJECT) { return false; }

   const prototype = Object.getPrototypeOf(value);
   return prototype === null || prototype === Object.prototype;
}

/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param {object} object - An object.
 *
 * @returns {string[]} Object keys
 */
export function objectKeys(object)
{
   return object !== null && typeof object === 'object' ? Object.keys(object) : [];
}

/**
 * Safely returns an objects size. Note for String objects unicode is not taken into consideration.
 *
 * @param {object} object - An object.
 *
 * @returns {number} Size of object.
 */
export function objectSize(object)
{
   if (object === void 0 || object === null || typeof object !== 'object') { return 0; }

   const tag = Object.prototype.toString.call(object);

   if (tag === s_TAG_MAP || tag === s_TAG_SET) { return object.size; }

   if (tag === s_TAG_STRING) { return object.length; }

   return Object.keys(object).length;
}

/**
 * Provides a way to safely access an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string}   accessor - A string describing the entries to access.
 *
 * @param {*}        defaultValue - (Optional) A default value to return if an entry for accessor is not found.
 *
 * @returns {object} The data object.
 */
export function safeAccess(data, accessor, defaultValue = void 0)
{
   if (typeof data !== 'object') { return defaultValue; }
   if (typeof accessor !== 'string') { return defaultValue; }

   const access = accessor.split('.');

   // Walk through the given object by the accessor indexes.
   for (let cntr = 0; cntr < access.length; cntr++)
   {
      // If the next level of object access is undefined or null then return the empty string.
      if (typeof data[access[cntr]] === 'undefined' || data[access[cntr]] === null) { return defaultValue; }

      data = data[access[cntr]];
   }

   return data;
}

/**
 * Provides a way to safely batch set an objects data / entries given an array of accessor strings which describe the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk. If value is an object the accessor will be used to access a target value from `value` which is
 * subsequently set to `data` by the given operation. If `value` is not an object it will be used as the target
 * value to set across all accessors.
 *
 * @param {object}         data - An object to access entry data.
 *
 * @param {Array<string>}  accessors - A string describing the entries to access.
 *
 * @param {object|*}       value - A new value to set if an entry for accessor is found.
 *
 * @param {string}         [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set',
 *                                             'set-undefined', 'sub'.
 *
 * @param {object|*}       [defaultAccessValue=0] - A new value to set if an entry for accessor is found.
 *
 *
 * @param {boolean}  [createMissing=true] - If true missing accessor entries will be created as objects
 *                                          automatically.
 */
export function safeBatchSet(data, accessors, value, operation = 'set', defaultAccessValue = 0, createMissing = true)
{
   if (typeof data !== 'object') { throw new TypeError(`safeBatchSet Error: 'data' is not an 'object'.`); }
   if (!Array.isArray(accessors)) { throw new TypeError(`safeBatchSet Error: 'accessors' is not an 'array'.`); }

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
 * @param {object}   source - Source object.
 *
 * @param {object}   target - Target object.
 *
 * @returns {boolean} True if equal.
 */
export function safeEqual(source, target)
{
   if (typeof source === 'undefined' || source === null || typeof target === 'undefined' || target === null)
   {
      return false;
   }

   const sourceAccessors = getAccessorList(source);

   for (let cntr = 0; cntr < sourceAccessors.length; cntr++)
   {
      const accessor = sourceAccessors[cntr];

      const sourceObjectValue = safeAccess(source, accessor);
      const targetObjectValue = safeAccess(target, accessor);

      if (sourceObjectValue !== targetObjectValue) { return false; }
   }

   return true;
}

/**
 * Provides a way to safely set an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string}   accessor - A string describing the entries to access.
 *
 * @param {*}        value - A new value to set if an entry for accessor is found.
 *
 * @param {string}   [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set',
 *                                       'set-undefined', 'sub'.
 *
 * @param {boolean}  [createMissing=true] - If true missing accessor entries will be created as objects
 *                                          automatically.
 *
 * @returns {boolean} True if successful.
 */
export function safeSet(data, accessor, value, operation = 'set', createMissing = true)
{
   if (typeof data !== 'object') { throw new TypeError(`safeSet Error: 'data' is not an 'object'.`); }
   if (typeof accessor !== 'string') { throw new TypeError(`safeSet Error: 'accessor' is not a 'string'.`); }

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
               if (typeof data[access[cntr]] === 'undefined') { data[access[cntr]] = value; }
               break;

            case 'sub':
               data[access[cntr]] -= value;
               break;
         }
      }
      else
      {
         // If createMissing is true and the next level of object access is undefined then create a new object entry.
         if (createMissing && typeof data[access[cntr]] === 'undefined') { data[access[cntr]] = {}; }

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
 * @param {object}            data - The data object to set data.
 *
 * @param {object<string, *>} accessorValues - Object of accessor keys to values to set.
 *
 * @param {string}            [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set', 'sub';
 *                                                default (`set`).
 *
 * @param {boolean}           [createMissing=true] - If true missing accessor entries will be created as objects
 *                                                   automatically.
 */
export function safeSetAll(data, accessorValues, operation = 'set', createMissing = true)
{
   if (typeof data !== 'object') { throw new TypeError(`'data' is not an 'object'.`); }
   if (typeof accessorValues !== 'object') { throw new TypeError(`'accessorValues' is not an 'object'.`); }

   for (const accessor of Object.keys(accessorValues))
   {
      if (!accessorValues.hasOwnProperty(accessor)) { continue; } // eslint-disable-line no-prototype-builtins

      safeSet(data, accessor, accessorValues[accessor], operation, createMissing);
   }
}

/**
 * Performs bulk validation of data given an object, `validationData`, which describes all entries to test.
 *
 * @param {object}                           data - The data object to test.
 *
 * @param {object<string, ValidationEntry>}  validationData - Key is the accessor / value is a validation entry.
 *
 * @param {string}                           [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
export function validate(data, validationData = {}, dataName = 'data')
{
   if (typeof data !== 'object') { throw new TypeError(`'${dataName}' is not an 'object'.`); }
   if (typeof validationData !== 'object') { throw new TypeError(`'validationData' is not an 'object'.`); }

   let result;

   for (const key of Object.keys(validationData))
   {
      if (!validationData.hasOwnProperty(key)) { continue; } // eslint-disable-line no-prototype-builtins

      const entry = validationData[key];

      switch (entry.test)
      {
         case 'array':
            result = validateArray(data, key, entry, dataName);
            break;

         case 'entry':
            result = validateEntry(data, key, entry, dataName);
            break;

         case 'entry|array':
            result = validateEntryOrArray(data, key, entry, dataName);
            break;
      }
   }

   return result;
}

/**
 * Validates all array entries against potential type and expected tests.
 *
 * @param {object}            data - The data object to test.
 *
 * @param {string}            accessor - A string describing the entries to access.
 *
 * @param {object}            opts - Options object.
 *
 * @param {string}            [opts.type] - Tests with a typeof check.
 *
 * @param {Function|Set<*>}   [opts.expected] - Optional function or set of expected values to test against.
 *
 * @param {string}            [opts.message] - Optional message to include.
 *
 * @param {boolean}           [opts.required] - When false if the accessor is missing validation is skipped.
 *
 * @param {boolean}           [opts.error=true] - When true and error is thrown otherwise a boolean is returned.
 *
 * @param {string}            [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
export function validateArray(data, accessor, { type = void 0, expected = void 0, message = void 0, required = true,
 error = true } = {}, dataName = 'data')
{
   const dataArray = safeAccess(data, accessor);

   // A non-required entry is missing so return without validation.
   if (!required && typeof dataArray === 'undefined') { return true; }

   if (!Array.isArray(dataArray))
   {
      if (error)
      {
         throw _validateError(TypeError, `'${dataName}.${accessor}' is not an 'array'.`);
      }
      else
      {
         return false;
      }
   }

   if (typeof type === 'string')
   {
      for (let cntr = 0; cntr < dataArray.length; cntr++)
      {
         if (!(typeof dataArray[cntr] === type))
         {
            if (error)
            {
               const dataEntryString = typeof dataArray[cntr] === 'object' ? JSON.stringify(dataArray[cntr]) :
                dataArray[cntr];

               throw _validateError(TypeError,
                `'${dataName}.${accessor}[${cntr}]': '${dataEntryString}' is not a '${type}'.`);
            }
            else
            {
               return false;
            }
         }
      }
   }

   // If expected is a function then test all array entries against the test function. If expected is a Set then
   // test all array entries for inclusion in the set. Otherwise if expected is a string then test that all array
   // entries as a `typeof` test against expected.
   if (Array.isArray(expected))
   {
      for (let cntr = 0; cntr < dataArray.length; cntr++)
      {
         if (!expected.includes(dataArray[cntr]))
         {
            if (error)
            {
               const dataEntryString = typeof dataArray[cntr] === 'object' ? JSON.stringify(dataArray[cntr]) :
                dataArray[cntr];

               throw _validateError(Error, `'${dataName}.${accessor}[${cntr}]': '${
                dataEntryString}' is not an expected value: ${JSON.stringify(expected)}.`);
            }
            else
            {
               return false;
            }
         }
      }
   }
   else if (expected instanceof Set)
   {
      for (let cntr = 0; cntr < dataArray.length; cntr++)
      {
         if (!expected.has(dataArray[cntr]))
         {
            if (error)
            {
               const dataEntryString = typeof dataArray[cntr] === 'object' ? JSON.stringify(dataArray[cntr]) :
                dataArray[cntr];

               throw _validateError(Error, `'${dataName}.${accessor}[${cntr}]': '${
                dataEntryString}' is not an expected value: ${JSON.stringify(expected)}.`);
            }
            else
            {
               return false;
            }
         }
      }
   }
   else if (typeof expected === 'function')
   {
      for (let cntr = 0; cntr < dataArray.length; cntr++)
      {
         try
         {
            const result = expected(dataArray[cntr]);

            if (typeof result === 'undefined' || !result) { throw new Error(message); }
         }
         catch (err)
         {
            if (error)
            {
               const dataEntryString = typeof dataArray[cntr] === 'object' ? JSON.stringify(dataArray[cntr]) :
                dataArray[cntr];

               throw _validateError(Error, `'${dataName}.${accessor}[${cntr}]': '${
                dataEntryString}' failed validation: ${err.message}.`);
            }
            else
            {
               return false;
            }
         }
      }
   }

   return true;
}

/**
 * Validates data entry with a typeof check and potentially tests against the values in any given expected set.
 *
 * @param {object}            data - The object data to validate.
 *
 * @param {string}            accessor - A string describing the entries to access.
 *
 * @param {object}            opts - Options object
 *
 * @param {string}            [opts.type] - Tests with a typeof check.
 *
 * @param {Function|Set<*>}   [opts.expected] - Optional function or set of expected values to test against.
 *
 * @param {string}            [opts.message] - Optional message to include.
 *
 * @param {boolean}           [opts.required=true] - When false if the accessor is missing validation is skipped.
 *
 * @param {boolean}           [opts.error=true] - When true and error is thrown otherwise a boolean is returned.
 *
 * @param {string}            [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
export function validateEntry(data, accessor, { type = void 0, expected = void 0, message = void 0, required = true,
 error = true } = {}, dataName = 'data')
{
   const dataEntry = safeAccess(data, accessor);

   // A non-required entry is missing so return without validation.
   if (!required && typeof dataEntry === 'undefined') { return true; }

   if (type && typeof dataEntry !== type)
   {
      if (error)
      {
         throw _validateError(TypeError, `'${dataName}.${accessor}' is not a '${type}'.`);
      }
      else
      {
         return false;
      }
   }

   if ((expected instanceof Set && !expected.has(dataEntry)) ||
    (Array.isArray(expected) && !expected.includes(dataEntry)))
   {
      if (error)
      {
         const dataEntryString = typeof dataEntry === 'object' ? JSON.stringify(dataEntry) : dataEntry;

         throw _validateError(Error, `'${dataName}.${accessor}': '${dataEntryString}' is not an expected value: ${
          JSON.stringify(expected)}.`);
      }
      else
      {
         return false;
      }
   }
   else if (typeof expected === 'function')
   {
      try
      {
         const result = expected(dataEntry);

         if (typeof result === 'undefined' || !result) { throw new Error(message); }
      }
      catch (err)
      {
         if (error)
         {
            const dataEntryString = typeof dataEntry === 'object' ? JSON.stringify(dataEntry) : dataEntry;

            throw _validateError(Error, `'${dataName}.${accessor}': '${dataEntryString}' failed to validate: ${
             err.message}.`);
         }
         else
         {
            return false;
         }
      }
   }

   return true;
}

/**
 * Dispatches validation of data entry to string or array validation depending on data entry type.
 *
 * @param {object}            data - The data object to test.
 *
 * @param {string}            accessor - A string describing the entries to access.
 *
 * @param {ValidationEntry}   [entry] - A validation entry.
 *
 * @param {string}            [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
export function validateEntryOrArray(data, accessor, entry, dataName = 'data')
{
   const dataEntry = safeAccess(data, accessor);

   let result;

   if (Array.isArray(dataEntry))
   {
      result = validateArray(data, accessor, entry, dataName);
   }
   else
   {
      result = validateEntry(data, accessor, entry, dataName);
   }

   return result;
}

// Module private ---------------------------------------------------------------------------------------------------

/**
 * Private implementation of depth traversal.
 *
 * @param {object|Array}   data - An object or array.
 *
 * @param {string[]}       skipFreezeKeys - An array of strings indicating keys of objects to not freeze.
 *
 * @returns {*} The frozen object.
 * @ignore
 * @private
 */
function _deepFreeze(data, skipFreezeKeys)
{
   if (Array.isArray(data))
   {
      for (let cntr = 0; cntr < data.length; cntr++) { _deepFreeze(data[cntr], skipFreezeKeys); }
   }
   else if (typeof data === 'object')
   {
      for (const key in data)
      {
         // eslint-disable-next-line no-prototype-builtins
         if (data.hasOwnProperty(key) && !skipFreezeKeys.includes(key)) { _deepFreeze(data[key], skipFreezeKeys); }
      }
   }

   return Object.freeze(data);
}

/**
 * Internal implementation for `deepMerge`.
 *
 * @param {object}      target - Target object.
 *
 * @param {...object}   sourceObj - One or more source objects.
 *
 * @returns {object}    Target object.
 */
function _deepMerge(target = {}, ...sourceObj)
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
 * @param {object|Array}   data - An object or array.
 *
 * @param {Function}       func - A callback function to process leaf values in children arrays or object members.
 *
 * @param {boolean}        modify - If true then the result of the callback function is used to modify in place
 *                                  the given data.
 *
 * @returns {*} The data object.
 * @ignore
 * @private
 */
function _depthTraverse(data, func, modify)
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
      else if (typeof data === 'object')
      {
         for (const key in data)
         {
            // eslint-disable-next-line no-prototype-builtins
            if (data.hasOwnProperty(key)) { data[key] = _depthTraverse(data[key], func, modify); }
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
            // eslint-disable-next-line no-prototype-builtins
            if (data.hasOwnProperty(key)) { _depthTraverse(data[key], func, modify); }
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
 * @param {object}   data - An object to traverse.
 *
 * @returns {string[]} Accessor list.
 * @ignore
 * @private
 */
function _getAccessorList(data)
{
   const accessors = [];

   for (const key in data)
   {
      if (data.hasOwnProperty(key)) // eslint-disable-line no-prototype-builtins
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
 * Creates a new error of type `clazz` adding the field `_objectValidateError` set to true.
 *
 * @param {Error}    clazz - Error class to instantiate.
 *
 * @param {string}   message - An error message.
 *
 * @returns {*} Error of the clazz.
 * @ignore
 * @private
 */
function _validateError(clazz, message = void 0)
{
   const error = new clazz(message);
   error._objectValidateError = true;
   return error;
}
