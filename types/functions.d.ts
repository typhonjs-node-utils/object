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
declare function deepFreeze(data: object | any[], skipFreezeKeys?: string[]): object | any[];
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
declare function deepMerge(target?: object, ...sourceObj: object[]): object;
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
declare function depthTraverse(data: object | any[], func: Function, modify?: boolean): any;
/**
 * Returns a list of accessor keys by traversing the given object.
 *
 * @param {object}   data - An object to traverse for accessor keys.
 *
 * @returns {string[]} Accessor list.
 */
declare function getAccessorList(data: object): string[];
/**
 * Tests for whether an object is iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether object is iterable.
 */
declare function isIterable(value: any): boolean;
/**
 * Tests for whether an object is async iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether value is async iterable.
 */
declare function isIterableAsync(value: any): boolean;
/**
 * Tests for whether object is not null and a typeof object.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Is it an object.
 */
declare function isObject(value: any): boolean;
/**
 * Tests for whether the given value is a plain object.
 *
 * An object is plain if it is created by either: {}, new Object() or Object.create(null).
 *
 * @param {*} value - Any value
 *
 * @returns {boolean} Is it a plain object.
 */
declare function isPlainObject(value: any): boolean;
/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param {object} object - An object.
 *
 * @returns {string[]} Object keys
 */
declare function objectKeys(object: object): string[];
/**
 * Safely returns an objects size. Note for String objects unicode is not taken into consideration.
 *
 * @param {object} object - An object.
 *
 * @returns {number} Size of object.
 */
declare function objectSize(object: object): number;
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
declare function safeAccess(data: object, accessor: string, defaultValue?: any): object;
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
declare function safeBatchSet(data: object, accessors: Array<string>, value: object | any, operation?: string, defaultAccessValue?: object | any, createMissing?: boolean): void;
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
declare function safeEqual(source: object, target: object): boolean;
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
declare function safeSet(data: object, accessor: string, value: any, operation?: string, createMissing?: boolean): boolean;
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
declare function safeSetAll(data: object, accessorValues: any, operation?: string, createMissing?: boolean): void;
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
declare function validate(data: object, validationData?: {}, dataName?: string): boolean;
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
declare function validateArray(data: object, accessor: string, { type, expected, message, required, error }?: {
    type?: string;
    expected?: Function | Set<any>;
    message?: string;
    required?: boolean;
    error?: boolean;
}, dataName?: string): boolean;
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
declare function validateEntry(data: object, accessor: string, { type, expected, message, required, error }?: {
    type?: string;
    expected?: Function | Set<any>;
    message?: string;
    required?: boolean;
    error?: boolean;
}, dataName?: string): boolean;
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
declare function validateEntryOrArray(data: object, accessor: string, entry?: ValidationEntry, dataName?: string): boolean;
/**
 * - Provides data for a validation check.
 */
type ValidationEntry = {
    /**
     * - Optionally tests with a typeof check.
     */
    type?: string;
    /**
     * - Optional array, function, or set of expected values to test
     * against.
     */
    expected?: Array<any> | Function | Set<any>;
    /**
     * - Optional message to include.
     */
    message?: string;
    /**
     * - When false if the accessor is missing validation is skipped.
     */
    required?: boolean;
    /**
     * - When true and error is thrown otherwise a boolean is returned.
     */
    error?: boolean;
};

export { ValidationEntry, deepFreeze, deepMerge, depthTraverse, getAccessorList, isIterable, isIterableAsync, isObject, isPlainObject, objectKeys, objectSize, safeAccess, safeBatchSet, safeEqual, safeSet, safeSetAll, validate, validateArray, validateEntry, validateEntryOrArray };
