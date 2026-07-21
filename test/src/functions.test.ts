import { expectTypeOf } from 'vitest';

import * as ObjectUtil  from '../../src/functions';

import { klona }        from '../../src';

import type {
   JSONPropertyPath,
   PropertyPath }       from '../../src';

/**
 * For visual no-op type erasure tests.
 */
interface NoOpObj { a?: number }

const s_OBJECT_MIXED =
{
   a: 1,
   b: 2,
   c: 3,
   array: ['a', 'b', 'c'],
   level1:
   {
      d: 4,
      e: 5,
      f: 6,
      array1: ['d', 'e', 'f'],
      level2:
      {
         g: 7,
         h: 8,
         i: 9,
         array2: ['g', 'h', 'i']
      }
   }
};

const s_OBJECT_MIXED_ORIG = klona(s_OBJECT_MIXED);

// Last entry of array2 differs from s_OBJECT_MIXED
const s_OBJECT_MIXED_ONE_MOD = { a: 1, b: 2, c: 3, array: ['a', 'b', 'c'], level1: { d: 4, e: 5, f: 6, array1: ['d', 'e', 'f'], level2: { g: 7, h: 8, i: 9, array2: ['g', 'h', 'z'] } } };

const s_OBJECT_NUM =
{
   a: 10,
   b: 10,
   c: 10,
   array: [10, 10, 10],
   level1:
   {
      d: 10,
      e: 10,
      f: 10,
      array1: [10, 10, 10],
      level2:
      {
         g: 10,
         h: 10,
         i: 10,
         array2: [10, 10, 10]
      }
   }
};

const s_SYMBOL_LEVEL1 = Symbol.for('level1');
const s_SYMBOL_LEVEL2 = Symbol.for('level2');

const s_OBJECT_SYM = {
   [s_SYMBOL_LEVEL1]: {
      [s_SYMBOL_LEVEL2]: true
   }
}

const s_VERIFY_DEPTH_TRAVERSE = `[1,2,3,"a","b","c",4,5,6,"d","e","f",7,8,9,"g","h","i"]`;

const s_VERIFY_PATH_LIST = `[["a"],["b"],["c"],["array",0],["array",1],["array",2],["level1","d"],["level1","e"],["level1","f"],["level1","array1",0],["level1","array1",1],["level1","array1",2],["level1","level2","g"],["level1","level2","h"],["level1","level2","i"],["level1","level2","array2",0],["level1","level2","array2",1],["level1","level2","array2",2]]`;
const s_VERIFY_PATH_LIST_NO_ARRAY = `[["a"],["b"],["c"],["level1","d"],["level1","e"],["level1","f"],["level1","level2","g"],["level1","level2","h"],["level1","level2","i"]]`;

const s_VERIFY_SAFESET_SET = `{"a":"aa","b":"aa","c":"aa","array":["aa","aa","aa"],"level1":{"d":"aa","e":"aa","f":"aa","array1":["aa","aa","aa"],"level2":{"g":"aa","h":"aa","i":"aa","array2":["aa","aa","aa"]}}}`;
const s_VERIFY_SAFESET_ADD = `{"a":20,"b":20,"c":20,"array":[20,20,20],"level1":{"d":20,"e":20,"f":20,"array1":[20,20,20],"level2":{"g":20,"h":20,"i":20,"array2":[20,20,20]}}}`;
const s_VERIFY_SAFESET_DIV = `{"a":1,"b":1,"c":1,"array":[1,1,1],"level1":{"d":1,"e":1,"f":1,"array1":[1,1,1],"level2":{"g":1,"h":1,"i":1,"array2":[1,1,1]}}}`;
const s_VERIFY_SAFESET_MULT = `{"a":100,"b":100,"c":100,"array":[100,100,100],"level1":{"d":100,"e":100,"f":100,"array1":[100,100,100],"level2":{"g":100,"h":100,"i":100,"array2":[100,100,100]}}}`;
const s_VERIFY_SAFESET_SUB = `{"a":0,"b":0,"c":0,"array":[0,0,0],"level1":{"d":0,"e":0,"f":0,"array1":[0,0,0],"level2":{"g":0,"h":0,"i":0,"array2":[0,0,0]}}}`;

const s_VERIFY_SAFESET_SET_NO_ARRAY = `{"a":"aa","b":"aa","c":"aa","array":[10,10,10],"level1":{"d":"aa","e":"aa","f":"aa","array1":[10,10,10],"level2":{"g":"aa","h":"aa","i":"aa","array2":[10,10,10]}}}`;
const s_VERIFY_SAFESET_ADD_NO_ARRAY = `{"a":20,"b":20,"c":20,"array":[10,10,10],"level1":{"d":20,"e":20,"f":20,"array1":[10,10,10],"level2":{"g":20,"h":20,"i":20,"array2":[10,10,10]}}}`;
const s_VERIFY_SAFESET_DIV_NO_ARRAY = `{"a":1,"b":1,"c":1,"array":[10,10,10],"level1":{"d":1,"e":1,"f":1,"array1":[10,10,10],"level2":{"g":1,"h":1,"i":1,"array2":[10,10,10]}}}`;
const s_VERIFY_SAFESET_MULT_NO_ARRAY = `{"a":100,"b":100,"c":100,"array":[10,10,10],"level1":{"d":100,"e":100,"f":100,"array1":[10,10,10],"level2":{"g":100,"h":100,"i":100,"array2":[10,10,10]}}}`;
const s_VERIFY_SAFESET_SUB_NO_ARRAY = `{"a":0,"b":0,"c":0,"array":[10,10,10],"level1":{"d":0,"e":0,"f":0,"array1":[10,10,10],"level2":{"g":0,"h":0,"i":0,"array2":[10,10,10]}}}`;

describe('ObjectUtil:', () =>
{
   describe('assertNonNullObject:', () =>
   {
      it('accepts ordinary objects and arrays', () =>
      {
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject({}));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject(Object.create(null)));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject([]));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject([1, 2, 3]));
      });

      it('accepts class instances and specialized built-ins', () =>
      {
         class Test {}

         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject(new Test()));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject(new Date()));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject(new Map()));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject(new Set()));
         assert.doesNotThrow(() => ObjectUtil.assertNonNullObject(/test/));
      });

      it('throws for null and undefined', () =>
      {
         assert.throws(
          () => ObjectUtil.assertNonNullObject(null),
          TypeError,
          'Expected a non-null object.'
         );

         assert.throws(
          () => ObjectUtil.assertNonNullObject(void 0),
          TypeError,
          'Expected a non-null object.'
         );
      });

      it('throws for primitive values', () =>
      {
         assert.throws(() => ObjectUtil.assertNonNullObject(false), TypeError);
         assert.throws(() => ObjectUtil.assertNonNullObject(42), TypeError);
         assert.throws(() => ObjectUtil.assertNonNullObject(1n), TypeError);
         assert.throws(() => ObjectUtil.assertNonNullObject('test'), TypeError);
         assert.throws(() => ObjectUtil.assertNonNullObject(Symbol('test')), TypeError);
      });

      it('throws for functions and class constructors', () =>
      {
         class Test {}

         assert.throws(() => ObjectUtil.assertNonNullObject(() => void 0), TypeError);
         assert.throws(() => ObjectUtil.assertNonNullObject(function test() {}), TypeError);
         assert.throws(() => ObjectUtil.assertNonNullObject(Test), TypeError);
      });

      it('uses a custom error message', () =>
      {
         assert.throws(() => ObjectUtil.assertNonNullObject(null, `'value' is not a non-null object.`), TypeError,
          `'value' is not a non-null object.`);
      });

      it('narrows unknown values to object', () =>
      {
         const value: unknown = [];

         ObjectUtil.assertNonNullObject(value);

         expectTypeOf(value).toEqualTypeOf<object>();
      });

      it('preserves existing object types', () =>
      {
         interface Options
         {
            enabled?: boolean;
         }

         const value: Options = { enabled: true };

         ObjectUtil.assertNonNullObject(value);

         expectTypeOf(value).toEqualTypeOf<Options>();
         assert.isTrue(value.enabled);
      });

      it('preserves array types', () =>
      {
         const value: number[] = [1, 2, 3];

         ObjectUtil.assertNonNullObject(value);

         expectTypeOf(value).toEqualTypeOf<number[]>();
         value.push(4);
      });

      it('removes primitive, nullish, and function union members', () =>
      {
         const value = [] as number[] | (() => void) | string | null | undefined;

         ObjectUtil.assertNonNullObject(value);

         expectTypeOf(value).toEqualTypeOf<number[]>();
      });

      it('removes class-constructor union members', () =>
      {
         class Test
         {
            value = 42;
         }

         const value = new Test() as Test | typeof Test | null;

         ObjectUtil.assertNonNullObject(value);

         expectTypeOf(value).toEqualTypeOf<Test>();
      });
   });

   it('assertObject', () =>
   {
      assert.throws(() => ObjectUtil.assertObject(false), 'Expected an object.');
      assert.throws(() => ObjectUtil.assertObject(null), 'Expected an object.');
      assert.throws(() => ObjectUtil.assertObject(void 0), 'Expected an object.');
      assert.throws(() => ObjectUtil.assertObject([]), 'Expected an object.');

      assert.throws(() => ObjectUtil.assertObject(void 0, 'Custom error message'), 'Custom error message');

      class Test { a: number = 123; }

      // No-op visual type erasure check.
      const val: Test = new Test();
      ObjectUtil.assertObject(val);
      expectTypeOf(val).toEqualTypeOf<Test>();
   });

   describe('assertObjectOrFunction:', () =>
   {
      it('accepts ordinary objects', () =>
      {
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction({}));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(Object.create(null)));
      });

      it('accepts arrays', () =>
      {
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction([]));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction([1, 2, 3]));
      });

      it('accepts functions and class constructors', () =>
      {
         class Test {}

         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(() => void 0));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(function test() {}));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(Test));
      });

      it('accepts specialized built-in objects', () =>
      {
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(new Date()));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(new Map()));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(new Set()));
         assert.doesNotThrow(() => ObjectUtil.assertObjectOrFunction(/test/));
      });

      it('throws for null and undefined', () =>
      {
         assert.throws(
          () => ObjectUtil.assertObjectOrFunction(null),
          TypeError,
          'Expected an object or function.'
         );

         assert.throws(
          () => ObjectUtil.assertObjectOrFunction(void 0),
          TypeError,
          'Expected an object or function.'
         );
      });

      it('throws for primitive values', () =>
      {
         assert.throws(() => ObjectUtil.assertObjectOrFunction(false), TypeError);
         assert.throws(() => ObjectUtil.assertObjectOrFunction(42), TypeError);
         assert.throws(() => ObjectUtil.assertObjectOrFunction(1n), TypeError);
         assert.throws(() => ObjectUtil.assertObjectOrFunction('test'), TypeError);
         assert.throws(() => ObjectUtil.assertObjectOrFunction(Symbol('test')), TypeError);
      });

      it('uses a custom error message', () =>
      {
         assert.throws(
          () => ObjectUtil.assertObjectOrFunction(null, `'value' is not an object or function.`),
          TypeError,
          `'value' is not an object or function.`
         );
      });

      it('preserves an existing object type', () =>
      {
         interface Options
         {
            enabled?: boolean;
         }

         const value: Options = { enabled: true };

         ObjectUtil.assertObjectOrFunction(value);

         expectTypeOf(value).toEqualTypeOf<Options>();
         assert.isTrue(value.enabled);
      });

      it('preserves an existing function type', () =>
      {
         const value = (input: number): string => `${input}`;

         ObjectUtil.assertObjectOrFunction(value);

         expectTypeOf(value).toEqualTypeOf<(input: number) => string>();
         assert.equal(value(42), '42');
      });

      it('removes primitive and nullish union members', () =>
      {
         let value = new Date() as Date | (() => void) | string | null | undefined;

         ObjectUtil.assertObjectOrFunction(value);

         expectTypeOf(value).toEqualTypeOf<Date | (() => void)>();
      });

      it('narrows unknown values to object', () =>
      {
         const value: unknown = {};

         ObjectUtil.assertObjectOrFunction(value);

         expectTypeOf(value).toEqualTypeOf<object>();
      });
   });

   it('assertOrdinaryObject', () =>
   {
      assert.throws(() => ObjectUtil.assertOrdinaryObject(false), 'Expected an ordinary object.');
      assert.throws(() => ObjectUtil.assertOrdinaryObject(null), 'Expected an ordinary object.');
      assert.throws(() => ObjectUtil.assertOrdinaryObject(void 0), 'Expected an ordinary object.');
      assert.throws(() => ObjectUtil.assertOrdinaryObject([]), 'Expected an ordinary object.');
      assert.throws(() => ObjectUtil.assertOrdinaryObject(new Map()), 'Expected an ordinary object.');

      assert.throws(() => ObjectUtil.assertOrdinaryObject(void 0, 'Custom error message'), 'Custom error message');

      // No-op visual type erasure check.
      class Foo {}
      const foo = new Foo();
      ObjectUtil.assertOrdinaryObject(foo);
      expectTypeOf(foo).toEqualTypeOf<Foo>();

      const val: NoOpObj = { a: 123 };
      ObjectUtil.assertOrdinaryObject(val);
      expectTypeOf(val).toEqualTypeOf<NoOpObj>();
   });

   it('assertPlainObject', () =>
   {
      assert.throws(() => ObjectUtil.assertPlainObject(false), 'Expected a plain object.');
      assert.throws(() => ObjectUtil.assertPlainObject(null), 'Expected a plain object.');
      assert.throws(() => ObjectUtil.assertPlainObject(void 0), 'Expected a plain object.');
      assert.throws(() => ObjectUtil.assertPlainObject([]), 'Expected a plain object.');
      assert.throws(() => ObjectUtil.assertPlainObject(new Map()), 'Expected a plain object.');

      assert.throws(() => ObjectUtil.assertPlainObject(void 0, 'Custom error message'), 'Custom error message');

      class Foo {}
      assert.throws(() => ObjectUtil.assertPlainObject(new Foo()), 'Expected a plain object.');

      // No-op visual type erasure check.
      const val: NoOpObj = { a: 123 };
      ObjectUtil.assertPlainObject(val);
      expectTypeOf(val).toEqualTypeOf<NoOpObj>();
   });

   it('assertRecord', () =>
   {
      assert.throws(() => ObjectUtil.assertRecord(false), 'Expected a record object.');
      assert.throws(() => ObjectUtil.assertRecord(null), 'Expected a record object.');
      assert.throws(() => ObjectUtil.assertRecord(void 0), 'Expected a record object.');
      assert.throws(() => ObjectUtil.assertRecord([]), 'Expected a record object.');

      assert.throws(() => ObjectUtil.assertRecord(void 0, 'Custom error message'), 'Custom error message');

      // No-op visual type erasure check.
      const val: NoOpObj = { a: 123 };
      ObjectUtil.assertRecord(val);
      expectTypeOf(val).toEqualTypeOf<NoOpObj & Record<PropertyKey, unknown>>();
   });


   describe('concatPropertyPath:', () =>
   {
      it('concatenates dotted and exact paths into a new property-key array', () =>
      {
         const symbol = Symbol('value');
         const exact: PropertyKey[] = ['attributes', 0, symbol];
         const result = ObjectUtil.concatPropertyPath('actor.system', exact, ['value']);

         assert.deepEqual(result, ['actor', 'system', 'attributes', 0, symbol, 'value']);
         assert.notEqual(result, exact);

         (result as PropertyKey[])[0] = 'changed';
         assert.deepEqual(exact, ['attributes', 0, symbol]);
      });

      it('returns a copy for one exact path', () =>
      {
         const path = ['actor', 'name'] as const;
         const result = ObjectUtil.concatPropertyPath(path);

         assert.deepEqual(result, path);
         assert.notEqual(result, path);
      });

      describe('Errors', () =>
      {
         it('throws - when no path is supplied', () =>
         {
            assert.throws(() => (ObjectUtil.concatPropertyPath as (...paths: any[]) => readonly PropertyKey[])(),
             TypeError, `concatPropertyPath error: At least one property path is required.`);
         });

         it('throws - when any path is invalid', () =>
         {
            assert.throws(() => ObjectUtil.concatPropertyPath('actor', []), TypeError,
             `normalizePropertyPath error: 'path' is not a valid property path.`);
         });
      });
   });

   describe('deleteProperty:', () =>
   {
      it('deletes own nested and symbol properties', () =>
      {
         const symbol = Symbol('value');
         const data = { nested: { value: 42, [symbol]: true } };

         assert.isTrue(ObjectUtil.deleteProperty(data, 'nested.value'));
         assert.isFalse(ObjectUtil.hasProperty(data, 'nested.value'));

         assert.isTrue(ObjectUtil.deleteProperty(data, ['nested', symbol]));
         assert.isFalse(ObjectUtil.hasProperty(data, ['nested', symbol]));
      });

      it('requires own properties by default and can explicitly delete an inherited owner property', () =>
      {
         const prototype = { inherited: 42 };
         const data = Object.create(prototype);

         assert.isFalse(ObjectUtil.deleteProperty(data, 'inherited'));
         assert.equal(prototype.inherited, 42);

         assert.isTrue(ObjectUtil.deleteProperty(data, 'inherited', { hasOwnOnly: false }));
         assert.equal(Object.hasOwn(prototype, 'inherited'), false);
      });

      it('returns false for missing, invalid, non-configurable, and invalid-array paths', () =>
      {
         const data: Record<string, any> = { values: ['a'] };
         Object.defineProperty(data, 'fixed', { configurable: false, value: 1 });

         assert.isFalse(ObjectUtil.deleteProperty(data, 'missing'));
         assert.isFalse(ObjectUtil.deleteProperty(data, ''));
         assert.isFalse(ObjectUtil.deleteProperty(null, 'value'));
         assert.isFalse(ObjectUtil.deleteProperty(data, ['values', '0']));
         assert.isFalse(ObjectUtil.deleteProperty(data, 'fixed'));
         assert.equal(data.fixed, 1);
      });

      it('rejects prototype-pollution keys and well-known symbols', () =>
      {
         const data: Record<PropertyKey, unknown> = {
            safe: {
               constructor: 1
            },
            [Symbol.toStringTag]: 'Custom'
         };

         assert.isFalse(ObjectUtil.deleteProperty(data, ['safe', 'constructor']));
         assert.isFalse(ObjectUtil.deleteProperty(data, [Symbol.toStringTag]));

         // @ts-expect-error
         assert.equal((data.safe as Record<string, unknown>).constructor, 1);
         assert.equal(data[Symbol.toStringTag], 'Custom');
      });

      it('validates options.hasOwnOnly', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deleteProperty({}, 'value', { hasOwnOnly: 'yes' }), TypeError,
          `deleteProperty error: 'options.hasOwnOnly' is not a boolean.`);
      });
   });

   describe('deepFreeze:', () =>
   {
      it('freezes nested objects, arrays, and symbol-keyed values', () =>
      {
         const symbol = Symbol('child');

         const data = {
            object: {
               nested: {}
            },
            array: [
               {
                  nested: {}
               }
            ],
            [symbol]: {
               nested: {}
            }
         };

         const result = ObjectUtil.deepFreeze(data);

         assert.strictEqual(result, data);

         assert.isTrue(Object.isFrozen(data));
         assert.isTrue(Object.isFrozen(data.object));
         assert.isTrue(Object.isFrozen(data.object.nested));
         assert.isTrue(Object.isFrozen(data.array));
         assert.isTrue(Object.isFrozen(data.array[0]));
         assert.isTrue(Object.isFrozen(data.array[0].nested));
         assert.isTrue(Object.isFrozen(data[symbol]));
         assert.isTrue(Object.isFrozen(data[symbol].nested));
      });

      it('preserves the input type', () =>
      {
         interface Data
         {
            child: {
               value: number;
            };
         }

         const data: Data = {
            child: {
               value: 42
            }
         };

         const result = ObjectUtil.deepFreeze(data);

         expectTypeOf(result).toEqualTypeOf<Data>();
      });

      it('skips matching string keys globally', () =>
      {
         const data = {
            skip: {
               nested: {}
            },
            branch: {
               skip: {
                  nested: {}
               },
               keep: {
                  nested: {}
               }
            }
         };

         const skipKeys: ReadonlySet<PropertyKey> = new Set(['skip']);

         ObjectUtil.deepFreeze(data, { skipKeys });

         assert.isTrue(Object.isFrozen(data));
         assert.isTrue(Object.isFrozen(data.branch));
         assert.isTrue(Object.isFrozen(data.branch.keep));
         assert.isTrue(Object.isFrozen(data.branch.keep.nested));

         assert.isFalse(Object.isFrozen(data.skip));
         assert.isFalse(Object.isFrozen(data.skip.nested));
         assert.isFalse(Object.isFrozen(data.branch.skip));
         assert.isFalse(Object.isFrozen(data.branch.skip.nested));
      });

      it('skips symbol keys', () =>
      {
         const skip = Symbol('skip');
         const keep = Symbol('keep');

         const data = {
            [skip]: {
               nested: {}
            },
            [keep]: {
               nested: {}
            }
         };

         ObjectUtil.deepFreeze(data, {
            skipKeys: new Set<PropertyKey>([skip])
         });

         assert.isTrue(Object.isFrozen(data));

         assert.isFalse(Object.isFrozen(data[skip]));
         assert.isFalse(Object.isFrozen(data[skip].nested));

         assert.isTrue(Object.isFrozen(data[keep]));
         assert.isTrue(Object.isFrozen(data[keep].nested));
      });

      it('normalizes numeric skip keys for arrays', () =>
      {
         const data = [
            {
               nested: {}
            },
            {
               nested: {}
            }
         ];

         ObjectUtil.deepFreeze(data, {
            skipKeys: new Set<PropertyKey>([0])
         });

         assert.isTrue(Object.isFrozen(data));

         assert.isFalse(Object.isFrozen(data[0]));
         assert.isFalse(Object.isFrozen(data[0].nested));

         assert.isTrue(Object.isFrozen(data[1]));
         assert.isTrue(Object.isFrozen(data[1].nested));
      });

      it('normalizes numeric skip keys for ordinary object properties', () =>
      {
         const data = {
            0: {
               nested: {}
            },
            1: {
               nested: {}
            }
         };

         ObjectUtil.deepFreeze(data, {
            skipKeys: new Set<PropertyKey>([0])
         });

         assert.isTrue(Object.isFrozen(data));

         assert.isFalse(Object.isFrozen(data[0]));
         assert.isTrue(Object.isFrozen(data[1]));
      });

      it('treats numeric and equivalent string skip keys identically', () =>
      {
         const numericChild = {};
         const stringChild = {};

         const numericData = [numericChild];
         const stringData = [stringChild];

         ObjectUtil.deepFreeze(numericData, {
            skipKeys: new Set<PropertyKey>([0])
         });

         ObjectUtil.deepFreeze(stringData, {
            skipKeys: new Set<PropertyKey>(['0'])
         });

         assert.isFalse(Object.isFrozen(numericChild));
         assert.isFalse(Object.isFrozen(stringChild));
      });

      it('does not read a skipped getter', () =>
      {
         let getterCalls = 0;
         const child = {};

         const data = Object.defineProperty({}, 'skip', {
            enumerable: true,
            get()
            {
               getterCalls++;
               return child;
            }
         });

         ObjectUtil.deepFreeze(data, {
            skipKeys: new Set<PropertyKey>(['skip'])
         });

         assert.equal(getterCalls, 0);
         assert.isTrue(Object.isFrozen(data));
         assert.isFalse(Object.isFrozen(child));
      });

      it('reads a non-skipped getter once', () =>
      {
         let getterCalls = 0;
         const child = {};

         const data = Object.defineProperty({}, 'child', {
            enumerable: true,
            get()
            {
               getterCalls++;
               return child;
            }
         });

         ObjectUtil.deepFreeze(data);

         assert.equal(getterCalls, 1);
         assert.isTrue(Object.isFrozen(data));
         assert.isTrue(Object.isFrozen(child));
      });

      it('does not traverse non-enumerable properties', () =>
      {
         const hidden = {};

         const data = Object.defineProperty({}, 'hidden', {
            enumerable: false,
            value: hidden
         });

         ObjectUtil.deepFreeze(data);

         assert.isTrue(Object.isFrozen(data));
         assert.isFalse(Object.isFrozen(hidden));
      });

      it('handles circular object graphs', () =>
      {
         interface Circular
         {
            child: object;
            self?: Circular;
         }

         const data: Circular = {
            child: {}
         };

         data.self = data;

         ObjectUtil.deepFreeze(data);

         assert.isTrue(Object.isFrozen(data));
         assert.isTrue(Object.isFrozen(data.child));
      });

      it('allows a skipped value to be frozen through another non-skipped alias', () =>
      {
         const shared = {
            nested: {}
         };

         const data = {
            skip: shared,
            keep: shared
         };

         ObjectUtil.deepFreeze(data, {
            skipKeys: new Set<PropertyKey>(['skip'])
         });

         assert.isTrue(Object.isFrozen(shared));
         assert.isTrue(Object.isFrozen(shared.nested));
      });

      it('is safe to apply repeatedly', () =>
      {
         const data = {
            child: {}
         };

         ObjectUtil.deepFreeze(data);

         assert.doesNotThrow(() => ObjectUtil.deepFreeze(data));
         assert.isTrue(Object.isFrozen(data));
         assert.isTrue(Object.isFrozen(data.child));
      });

      describe('Errors', () =>
      {
         it('throws when data is not a non-null object', () =>
         {
            assert.throws(() => ObjectUtil.deepFreeze(null), TypeError,
             `deepFreeze error: 'data' is not an object or array.`);

            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepFreeze('bad'), TypeError,
             `deepFreeze error: 'data' is not an object or array.`);

            assert.throws(() => ObjectUtil.deepFreeze(() => void 0), TypeError,
             `deepFreeze error: 'data' is not an object or array.`);
         });

         it('throws when options.skipKeys is not a Set', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepFreeze({}, { skipKeys: ['skip'] }), TypeError,
             `deepFreeze error: 'options.skipKeys' is not a Set.`);
         });
      });
   });

   describe('deepMerge', () =>
   {
      it('basic object:', () =>
      {
         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 } };

         const targetMod = ObjectUtil.deepMerge(target, { a: 1, b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('basic objects:', () =>
      {
         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 } };

         const targetMod = ObjectUtil.deepMerge(target, { a: 1 }, { b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('basic objects (copy):', () =>
      {
         const initial = { a: true, b: { b1: true } };
         const target = initial;
         const result = { a: 1, b: { b1: 2 } };

         const targetMod = ObjectUtil.deepMerge({}, target, { a: 1 }, { b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.notEqual(target, targetMod);

         assert.deepEqual(target, initial);
         assert.deepEqual(targetMod, result);
      });

      it('basic object (explicit type):', () =>
      {
         type Target = { a: boolean, b: { b1: boolean } };
         type Result = { a: number, b: { b1: number } };

         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 } };

         const targetMod: Result = ObjectUtil.deepMerge<Target, Result>(target, { a: 1, b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('basic objects (explicit types):', () =>
      {
         type Target = { a: boolean, b: { b1: boolean } };
         type Source1 = { a: number };
         type Source2 = { b: { b1: number } };
         type Result = { a: number, b: { b1: number } };

         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 } };

         const targetMod: Result = ObjectUtil.deepMerge<Target, Source1, Source2>(target, { a: 1 }, { b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('basic objects (explicit types - array):', () =>
      {
         type Target = { a: boolean, b: { b1: boolean } };
         type Source1 = { a: number };
         type Source2 = { b: { b1: number } };
         type Result = { a: number, b: { b1: number } };

         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 } };

         const targetMod: Result = ObjectUtil.deepMerge<Target, [Source1, Source2]>(target, { a: 1 }, { b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('add property:', () =>
      {
         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 }, c: false };

         const targetMod = ObjectUtil.deepMerge(target, { a: 1 }, { b: { b1: 2 } }, { c: false });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('overwrite property:', () =>
      {
         const target = { a: true, b: { b1: true }, c: { c1: true } };
         const result = { a: 1, b: { b1: 2 }, c: { c1: [1, 2] } };

         const targetMod = ObjectUtil.deepMerge(target, { a: 1 }, { b: { b1: 2 } }, { c: { c1: [1, 2] } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         // @ts-expect-error
         assert.deepEqual(target, result);
      });

      it('merge objects (primitive):', () =>
      {
         const target = { a: { a1: true }, b: { b1: true }, c: { c1: true } };
         const result = { a: 1, b: { b1: true, b2: 2 }, c: { c1: true, c2: 2 } };

         const targetMod = ObjectUtil.deepMerge(target, { a: 1 }, { b: { b2: 2 } }, { c: { c2: 1 } }, { c: { c2: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('merge objects (extended primitive override):', () =>
      {
         const target = { a: { a1: true }, b: { b1: true }, c: { c1: true } };
         const result = { a: 1, b: { b1: true, b2: 2 }, c: { c1: true, c2: 2 } };

         const targetMod = ObjectUtil.deepMerge(target, { a: { a2: true } }, { a: 1 }, { b: { b2: 2 } },
          { c: { c2: 1 } }, { c: { c2: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('instantiated class:', () =>
      {
         const target = { a: true, b: { b1: true } };
         const result = { a: 1, b: { b1: 2 } };

         class Test { a: number; constructor() { this.a = 1; } }

         const targetMod = ObjectUtil.deepMerge(target, new Test(), { b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('instantiated classes:', () =>
      {
         class Target { a: boolean; b: { b1: boolean }; constructor() { this.a = true; this.b = { b1: true }; } }

         class Test { a: number; constructor() { this.a = 1; } }

         const target = new Target();
         const result = { a: 1, b: { b1: 2 } };

         const targetMod = ObjectUtil.deepMerge(target, new Test(), { b: { b1: 2 } });

         // @ts-expect-error - Type differences
         assert.equal(target, targetMod);

         assert.deepEqual(targetMod, result);
      });

      it('skips an own enumerable __proto__ property', () =>
      {
         const source = JSON.parse('{"__proto__":{"polluted":true},"safe":1}');

         const target: Record<string, any> = {};

         const result = ObjectUtil.deepMerge(target, source);

         assert.equal(result, target);
         assert.deepEqual(target, { safe: 1 });
         assert.equal(Object.getPrototypeOf(target), Object.prototype);
         assert.equal(({} as any).polluted, void 0);
      });

      it('skips an own enumerable prototype property', () =>
      {
         const source = {
            prototype: {
               polluted: true
            },
            safe: 1
         };

         const target: Record<string, any> = {};

         ObjectUtil.deepMerge(target, source);

         assert.deepEqual(target, { safe: 1 });
         assert.equal(Object.hasOwn(target, 'prototype'), false);
      });

      it('skips an own enumerable constructor property', () =>
      {
         const source = {
            constructor: {
               polluted: true
            },
            safe: 1
         };

         const target: Record<string, any> = {};

         ObjectUtil.deepMerge(target, source);

         assert.deepEqual(target, { safe: 1 });
         assert.equal(Object.hasOwn(target, 'constructor'), false);
      });

      it('skips an own enumerable constructor property (nested)', () =>
      {
         const source = {
            level1: {
               constructor: {
                  polluted: true
               },
               safe: 1
            }
         };

         const target: Record<string, any> = {};

         ObjectUtil.deepMerge(target, source);

         assert.deepEqual(target, { level1: { safe: 1 } });
         assert.equal(Object.hasOwn(target.level1, 'constructor'), false);
      });

      it('skips deeply nested blocked prototype keys', () =>
      {
         const source = {
            level1: {
               level2: {
                  prototype: true,
                  safe: 2
               }
            }
         };

         const target: Record<string, any> = {};

         ObjectUtil.deepMerge(target, source);

         assert.deepEqual(target, {
            level1: {
               level2: {
                  safe: 2
               }
            }
         });
      });

      it('skips an own enumerable constructor property in the multi-source branch', () =>
      {
         const target: Record<string, any> = {};

         const source1 = {
            level1: {
               first: 1
            }
         };

         const source2 = {
            level1: {
               constructor: {
                  polluted: true
               },
               second: 2
            }
         };

         const result = ObjectUtil.deepMerge(target, source1, source2);

         assert.equal(result, target);

         assert.deepEqual(target, {
            level1: {
               first: 1,
               second: 2
            }
         });

         assert.equal(Object.hasOwn(target.level1, 'constructor'), false);
      });

      it('preserves a null prototype for a missing nested plain object', () =>
      {
         const level1 = Object.create(null) as Record<string, any>;
         level1.value = 1;

         const source = {
            level1
         };

         const target: Record<string, any> = {};

         ObjectUtil.deepMerge(target, source);

         assert.equal(Object.getPrototypeOf(target.level1), null);
         assert.equal(target.level1.value, 1);
      });

      it('preserves a null prototype for a missing nested object in the multi-source branch', () =>
      {
         const level1 = Object.create(null) as Record<string, any>;
         level1.value = 1;

         const target: Record<string, any> = {};

         ObjectUtil.deepMerge(
          target,
          { first: true },
          { level1 }
         );

         assert.equal(Object.getPrototypeOf(target.level1), null);
         assert.equal(target.level1.value, 1);
      });

      it('clones a null-prototype target value in the multi-source branch', () =>
      {
         const level1 = Object.create(null) as Record<string, any>;
         level1.first = 1;

         const target: Record<string, any> = { level1 };

         ObjectUtil.deepMerge(target, { level1: { second: 2 } }, { level1: { third: 3 } });

         assert.equal(Object.getPrototypeOf(target.level1), null);

         assert.equal(target.level1.first, 1);
         assert.equal(target.level1.second, 2);
         assert.equal(target.level1.third, 3);
      });

      it('allows shared references that do not form a circular path', () =>
      {
         const shared = { value: 42 };
         const source = { first: shared, second: shared };

         assert.deepEqual(ObjectUtil.deepMerge({}, source), { first: { value: 42 }, second: { value: 42 } });
      });

      it('filters blocked keys while cloning an existing target branch in the multi-source path', () =>
      {
         const level1 = JSON.parse('{"constructor":{"polluted":true},"safe":1}');
         const target: Record<string, any> = { level1 };

         ObjectUtil.deepMerge(target, { level1: { next: 2 } }, { marker: true });

         assert.deepEqual(target, {
            level1: {
               safe: 1,
               next: 2
            },
            marker: true
         });
         assert.equal(Object.hasOwn(target.level1, 'constructor'), false);
      });

      describe('Errors', () =>
      {
         it('throws - target not object', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepMerge('bad', {}), TypeError,
             `deepMerge error: 'target' is not an ordinary object.`);
         });

         it('throws - no source object', () =>
         {
            assert.throws(() => ObjectUtil.deepMerge({}), TypeError,
             `deepMerge error: 'sourceObj' is not an ordinary object.`);
         });

         it('throws - source not object (string)', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepMerge({}, 'bad'), TypeError,
             `deepMerge error: 'sourceObj[0]' is not an ordinary object.`);
         });

         it('throws - source not object (array)', () =>
         {
            assert.throws(() => ObjectUtil.deepMerge({}, [1, 2]), TypeError,
             `deepMerge error: 'sourceObj[0]' is not an ordinary object.`);
         });

         it('throws - for a circular source object', () =>
         {
            const source: Record<string, any> = { value: 42 };

            source.self = source;

            assert.throws(() => ObjectUtil.deepMerge({}, source), TypeError,
             `deepMerge error: Circular source object detected.`);
         });
      });
   });

   describe('deepSeal:', () =>
   {
      it('seals nested objects, arrays, and symbol-keyed values', () =>
      {
         const symbol = Symbol('child');

         const data = {
            object: {
               nested: {}
            },
            array: [
               {
                  nested: {}
               }
            ],
            [symbol]: {
               nested: {}
            }
         };

         const result = ObjectUtil.deepSeal(data);

         assert.strictEqual(result, data);

         assert.isTrue(Object.isSealed(data));
         assert.isTrue(Object.isSealed(data.object));
         assert.isTrue(Object.isSealed(data.object.nested));
         assert.isTrue(Object.isSealed(data.array));
         assert.isTrue(Object.isSealed(data.array[0]));
         assert.isTrue(Object.isSealed(data.array[0].nested));
         assert.isTrue(Object.isSealed(data[symbol]));
         assert.isTrue(Object.isSealed(data[symbol].nested));

         // Sealing does not freeze existing writable values.
         assert.isFalse(Object.isFrozen(data));
         assert.isFalse(Object.isFrozen(data.object));
      });

      it('preserves the input type', () =>
      {
         interface Data
         {
            child: {
               value: number;
            };
         }

         const data: Data = {
            child: {
               value: 42
            }
         };

         const result = ObjectUtil.deepSeal(data);

         expectTypeOf(result).toEqualTypeOf<Data>();
      });

      it('skips matching string keys globally', () =>
      {
         const data = {
            skip: {
               nested: {}
            },
            branch: {
               skip: {
                  nested: {}
               },
               keep: {
                  nested: {}
               }
            }
         };

         const skipKeys: ReadonlySet<PropertyKey> = new Set(['skip']);

         ObjectUtil.deepSeal(data, { skipKeys });

         assert.isTrue(Object.isSealed(data));
         assert.isTrue(Object.isSealed(data.branch));
         assert.isTrue(Object.isSealed(data.branch.keep));
         assert.isTrue(Object.isSealed(data.branch.keep.nested));

         assert.isFalse(Object.isSealed(data.skip));
         assert.isFalse(Object.isSealed(data.skip.nested));
         assert.isFalse(Object.isSealed(data.branch.skip));
         assert.isFalse(Object.isSealed(data.branch.skip.nested));
      });

      it('skips symbol keys', () =>
      {
         const skip = Symbol('skip');
         const keep = Symbol('keep');

         const data = {
            [skip]: {
               nested: {}
            },
            [keep]: {
               nested: {}
            }
         };

         ObjectUtil.deepSeal(data, {
            skipKeys: new Set<PropertyKey>([skip])
         });

         assert.isTrue(Object.isSealed(data));

         assert.isFalse(Object.isSealed(data[skip]));
         assert.isFalse(Object.isSealed(data[skip].nested));

         assert.isTrue(Object.isSealed(data[keep]));
         assert.isTrue(Object.isSealed(data[keep].nested));
      });

      it('normalizes numeric skip keys for arrays', () =>
      {
         const data = [
            {
               nested: {}
            },
            {
               nested: {}
            }
         ];

         ObjectUtil.deepSeal(data, {
            skipKeys: new Set<PropertyKey>([0])
         });

         assert.isTrue(Object.isSealed(data));

         assert.isFalse(Object.isSealed(data[0]));
         assert.isFalse(Object.isSealed(data[0].nested));

         assert.isTrue(Object.isSealed(data[1]));
         assert.isTrue(Object.isSealed(data[1].nested));
      });

      it('normalizes numeric skip keys for ordinary object properties', () =>
      {
         const data = {
            0: {
               nested: {}
            },
            1: {
               nested: {}
            }
         };

         ObjectUtil.deepSeal(data, {
            skipKeys: new Set<PropertyKey>([0])
         });

         assert.isTrue(Object.isSealed(data));

         assert.isFalse(Object.isSealed(data[0]));
         assert.isTrue(Object.isSealed(data[1]));
      });

      it('treats numeric and equivalent string skip keys identically', () =>
      {
         const numericChild = {};
         const stringChild = {};

         const numericData = [numericChild];
         const stringData = [stringChild];

         ObjectUtil.deepSeal(numericData, {
            skipKeys: new Set<PropertyKey>([0])
         });

         ObjectUtil.deepSeal(stringData, {
            skipKeys: new Set<PropertyKey>(['0'])
         });

         assert.isFalse(Object.isSealed(numericChild));
         assert.isFalse(Object.isSealed(stringChild));
      });

      it('does not read a skipped getter', () =>
      {
         let getterCalls = 0;
         const child = {};

         const data = Object.defineProperty({}, 'skip', {
            enumerable: true,
            get()
            {
               getterCalls++;
               return child;
            }
         });

         ObjectUtil.deepSeal(data, {
            skipKeys: new Set<PropertyKey>(['skip'])
         });

         assert.equal(getterCalls, 0);
         assert.isTrue(Object.isSealed(data));
         assert.isFalse(Object.isSealed(child));
      });

      it('reads a non-skipped getter once', () =>
      {
         let getterCalls = 0;
         const child = {};

         const data = Object.defineProperty({}, 'child', {
            enumerable: true,
            get()
            {
               getterCalls++;
               return child;
            }
         });

         ObjectUtil.deepSeal(data);

         assert.equal(getterCalls, 1);
         assert.isTrue(Object.isSealed(data));
         assert.isTrue(Object.isSealed(child));
      });

      it('does not traverse non-enumerable properties', () =>
      {
         const hidden = {};

         const data = Object.defineProperty({}, 'hidden', {
            enumerable: false,
            value: hidden
         });

         ObjectUtil.deepSeal(data);

         assert.isTrue(Object.isSealed(data));
         assert.isFalse(Object.isSealed(hidden));
      });

      it('handles circular object graphs', () =>
      {
         interface Circular
         {
            child: object;
            self?: Circular;
         }

         const data: Circular = {
            child: {}
         };

         data.self = data;

         ObjectUtil.deepSeal(data);

         assert.isTrue(Object.isSealed(data));
         assert.isTrue(Object.isSealed(data.child));
      });

      it('allows a skipped value to be sealed through another non-skipped alias', () =>
      {
         const shared = {
            nested: {}
         };

         const data = {
            skip: shared,
            keep: shared
         };

         ObjectUtil.deepSeal(data, {
            skipKeys: new Set<PropertyKey>(['skip'])
         });

         assert.isTrue(Object.isSealed(shared));
         assert.isTrue(Object.isSealed(shared.nested));
      });

      it('is safe to apply repeatedly', () =>
      {
         const data = {
            child: {}
         };

         ObjectUtil.deepSeal(data);

         assert.doesNotThrow(() => ObjectUtil.deepSeal(data));
         assert.isTrue(Object.isSealed(data));
         assert.isTrue(Object.isSealed(data.child));
      });

      describe('Errors', () =>
      {
         it('throws when data is not a non-null object', () =>
         {
            assert.throws(() => ObjectUtil.deepSeal(null), TypeError,
             `deepSeal error: 'data' is not an object or array.`);

            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepSeal('bad'), TypeError,
             `deepSeal error: 'data' is not an object or array.`);

            assert.throws(() => ObjectUtil.deepSeal(() => void 0), TypeError,
             `deepSeal error: 'data' is not an object or array.`);
         });

         it('throws when options.skipKeys is not a Set', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepSeal({}, { skipKeys: ['skip'] }), TypeError,
             `deepSeal error: 'options.skipKeys' is not a Set.`);
         });
      });
   });

   it('ensureNonEmptyAsyncIterable:', async () =>
   {
      // @ts-expect-error
      assert.isUndefined(await ObjectUtil.ensureNonEmptyAsyncIterable(false));

      assert.isUndefined(await ObjectUtil.ensureNonEmptyAsyncIterable((async function *generator() {})()));
      assert.isUndefined(await ObjectUtil.ensureNonEmptyAsyncIterable(null));
      assert.isUndefined(await ObjectUtil.ensureNonEmptyAsyncIterable(void 0));
      assert.isUndefined(await ObjectUtil.ensureNonEmptyAsyncIterable([]));
      assert.isUndefined(await ObjectUtil.ensureNonEmptyAsyncIterable((function *generator() {})()));

      const asyncIter1 = await ObjectUtil.ensureNonEmptyAsyncIterable(
       (async function *generator() { yield 1; yield 2; })());

      const asyncIter2 = await ObjectUtil.ensureNonEmptyAsyncIterable((function *generator() { yield 1; yield 2; })());

      const asyncIter3 = await ObjectUtil.ensureNonEmptyAsyncIterable([1, 2]);

      const result1 = [];
      const result2 = [];
      const result3 = [];

      for await (const v of asyncIter1) { result1.push(v); }
      for await (const v of asyncIter2) { result2.push(v); }
      for await (const v of asyncIter3) { result3.push(v); }

      assert.deepEqual(result1, [1, 2]);
      assert.deepEqual(result2, [1, 2]);
      assert.deepEqual(result3, [1, 2]);
   });

   it('ensureNonEmptyIterable:', () =>
   {
      // @ts-expect-error
      assert.isUndefined(ObjectUtil.ensureNonEmptyIterable(false));

      // @ts-expect-error
      assert.isUndefined(ObjectUtil.ensureNonEmptyIterable((async function *generator() {})()));

      assert.isUndefined(ObjectUtil.ensureNonEmptyIterable(null));
      assert.isUndefined(ObjectUtil.ensureNonEmptyIterable(void 0));
      assert.isUndefined(ObjectUtil.ensureNonEmptyIterable([]));
      assert.isUndefined(ObjectUtil.ensureNonEmptyIterable((function *generator() {})()));

      assert.deepEqual([...ObjectUtil.ensureNonEmptyIterable((function *generator() { yield 1; yield 2; })())], [1, 2]);
      assert.deepEqual([...ObjectUtil.ensureNonEmptyIterable([1, 2])], [1, 2]);
   });

   describe('getProperty:', () =>
   {
      it('resolves dotted, numeric, and symbol paths while preserving nullish values', () =>
      {
         const symbol = Symbol('value');
         const data = {
            nested: { value: 42, undefinedValue: void 0, nullValue: null },
            values: ['a'],
            [symbol]: true
         };

         assert.equal(ObjectUtil.getProperty(data, 'nested.value'), 42);
         assert.isUndefined(ObjectUtil.getProperty(data, 'nested.undefinedValue'));
         assert.isNull(ObjectUtil.getProperty(data, 'nested.nullValue'));
         assert.equal(ObjectUtil.getProperty(data, ['values', 0]), 'a');
         assert.isTrue(ObjectUtil.getProperty(data, [symbol]));
      });

      it('includes inherited properties by default and can require own properties', () =>
      {
         const prototype = { inherited: { value: 42 } };
         const data = Object.create(prototype);

         assert.equal(ObjectUtil.getProperty(data, 'inherited.value'), 42);
         assert.isUndefined(ObjectUtil.getProperty(data, 'inherited.value', { hasOwnOnly: true }));
      });

      it('returns undefined for invalid, missing, non-traversable, and invalid-array paths', () =>
      {
         assert.isUndefined(ObjectUtil.getProperty(null, 'value'));
         assert.isUndefined(ObjectUtil.getProperty({}, ''));
         assert.isUndefined(ObjectUtil.getProperty({}, 'missing'));
         assert.isUndefined(ObjectUtil.getProperty({ nested: null }, 'nested.value'));
         assert.isUndefined(ObjectUtil.getProperty({ values: ['a'] }, ['values', '0']));
      });

      it('reads each traversed getter once', () =>
      {
         let prefixReads = 0;
         let valueReads = 0;
         const nested = Object.defineProperty({}, 'value', {
            get()
            {
               valueReads++;
               return 42;
            }
         });
         const data = Object.defineProperty({}, 'nested', {
            get()
            {
               prefixReads++;
               return nested;
            }
         });

         assert.equal(ObjectUtil.getProperty(data, 'nested.value'), 42);
         assert.equal(prefixReads, 1);
         assert.equal(valueReads, 1);
      });

      it('validates options.hasOwnOnly', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.getProperty({}, 'value', { hasOwnOnly: 'yes' }), TypeError,
          `getProperty error: 'options.hasOwnOnly' is not a boolean.`);
      });
   });

   describe('getPropertyDescriptor:', () =>
   {
      it('returns own and inherited terminal descriptors without invoking a terminal getter', () =>
      {
         let reads = 0;
         const prototype = Object.defineProperty({}, 'inherited', {
            configurable: true,
            enumerable: true,
            get()
            {
               reads++;
               return 42;
            }
         });
         const data = Object.create(prototype);
         Object.defineProperty(data, 'own', { configurable: true, enumerable: false, value: 1 });

         const ownDescriptor = ObjectUtil.getPropertyDescriptor(data, 'own');
         const inheritedDescriptor = ObjectUtil.getPropertyDescriptor(data, 'inherited');

         assert.equal(ownDescriptor?.value, 1);
         assert.equal(ownDescriptor?.enumerable, false);
         assert.isFunction(inheritedDescriptor?.get);
         assert.equal(reads, 0);
         assert.isUndefined(ObjectUtil.getPropertyDescriptor(data, 'inherited', { hasOwnOnly: true }));
      });

      it('resolves nested and symbol descriptors and rejects invalid paths', () =>
      {
         const symbol = Symbol('value');
         const nested = { [symbol]: 42 };
         const data = { nested, values: ['a'] };

         assert.equal(ObjectUtil.getPropertyDescriptor(data, ['nested', symbol])?.value, 42);
         assert.equal(ObjectUtil.getPropertyDescriptor(data, ['values', 0])?.value, 'a');
         assert.isUndefined(ObjectUtil.getPropertyDescriptor(data, ['values', '0']));
         assert.isUndefined(ObjectUtil.getPropertyDescriptor({ nested: 1 }, 'nested.value'));
         assert.isUndefined(ObjectUtil.getPropertyDescriptor({}, ''));
         assert.isUndefined(ObjectUtil.getPropertyDescriptor(null, 'value'));
      });

      it('validates options.hasOwnOnly', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.getPropertyDescriptor({}, 'value', { hasOwnOnly: 'yes' }), TypeError,
          `getPropertyDescriptor error: 'options.hasOwnOnly' is not a boolean.`);
      });
   });

   describe('getPropertyOwner:', () =>
   {
      it('returns the nearest terminal property owner', () =>
      {
         const ancestor = { inherited: 42 };
         const prototype = Object.create(ancestor);
         const data = Object.create(prototype);
         data.own = { value: true };

         assert.equal(ObjectUtil.getPropertyOwner(data, 'own'), data);
         assert.equal(ObjectUtil.getPropertyOwner(data, 'own.value'), data.own);
         assert.equal(ObjectUtil.getPropertyOwner(data, 'inherited'), ancestor);
         assert.isUndefined(ObjectUtil.getPropertyOwner(data, 'inherited', { hasOwnOnly: true }));
      });

      it('returns undefined for invalid, missing, non-traversable, and invalid-array paths', () =>
      {
         assert.isUndefined(ObjectUtil.getPropertyOwner(null, 'value'));
         assert.isUndefined(ObjectUtil.getPropertyOwner({}, ''));
         assert.isUndefined(ObjectUtil.getPropertyOwner({}, 'missing'));
         assert.isUndefined(ObjectUtil.getPropertyOwner({ nested: 1 }, 'nested.value'));
         assert.isUndefined(ObjectUtil.getPropertyOwner({ values: ['a'] }, ['values', '0']));
      });

      it('validates options.hasOwnOnly', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.getPropertyOwner({}, 'value', { hasOwnOnly: 'yes' }), TypeError,
          `getPropertyOwner error: 'options.hasOwnOnly' is not a boolean.`);
      });
   });

   describe('hasAccessor:', () =>
   {
      it('top level', () =>
      {
         const data = {
            get test() { return 0; },
            get bad() { return 1; },

            set test(val) { } // eslint-disable-line no-unused-vars
         }

         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasAccessor({}, 'nope'));
         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasAccessor(() => void 0, 'nope'));
         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasAccessor(data, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(null, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(void 0, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(data, 'bad'));

         assert.isTrue(ObjectUtil.hasAccessor(data, 'test'));
      });

      it('inherited', () =>
      {
         class Base {
            get test() { return 0; }
            get bad() { return 1; }
            set test(val) { }
         }

         class Top extends Base {}

         const instance = new Top();

         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasAccessor(instance, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(instance, 'bad'));

         assert.isTrue(ObjectUtil.hasAccessor(instance, 'test'));
      });
   });

   describe('hasGetter:', () =>
   {
      it('top level', () =>
      {
         const data = {
            get test() { return 0; },
            bad() { return 1; }
         }

         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasGetter({}, 'nope'));
         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasGetter(() => void 0, 'nope'));
         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasGetter(data, 'nope'));
         assert.isFalse(ObjectUtil.hasGetter(null, 'nope'));
         assert.isFalse(ObjectUtil.hasGetter(void 0, 'nope'));
         assert.isFalse(ObjectUtil.hasGetter(data, 'bad'));

         assert.isTrue(ObjectUtil.hasGetter(data, 'test'));
      });

      it('inherited', () =>
      {
         class Base {
            get test() { return 0; }
         }

         class Top extends Base {}

         const instance = new Top();

         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasGetter(instance, 'nope'));

         assert.isTrue(ObjectUtil.hasGetter(instance, 'test'));
      });
   });

   describe('hasProperty:', () =>
   {
      it('invalid data neither object or null', () =>
      {
         // @ts-expect-error
         assert.equal(ObjectUtil.hasProperty('bogus', 'bogus'), false);

         assert.equal(ObjectUtil.hasProperty(void 0, 'bogus'), false);
         assert.equal(ObjectUtil.hasProperty(null, 'bogus'), false);
      });

      it('returns true for an existing dotted property path', () =>
      {
         assert.equal(ObjectUtil.hasProperty({ nested: { value: 42 } }, 'nested.value'), true);
      });

      it('returns false for a missing dotted property path', () =>
      {
         assert.equal(ObjectUtil.hasProperty({ nested: {} }, 'nested.value'), false);
      });

      it('considers properties with undefined or null values present', () =>
      {
         assert.equal(ObjectUtil.hasProperty({ value: void 0 }, 'value'), true);
         assert.equal(ObjectUtil.hasProperty({ value: null }, 'value'), true);
      });

      it('returns false when an intermediate value cannot be traversed', () =>
      {
         assert.equal(ObjectUtil.hasProperty({ nested: null }, 'nested.value'), false);
         assert.equal(ObjectUtil.hasProperty({ nested: 42 }, 'nested.value'), false);
      });

      it('supports symbol property keys', () =>
      {
         const key = Symbol('value');
         const data = { [key]: 42 };

         assert.equal(ObjectUtil.hasProperty(data, [key]), true);
         assert.equal(ObjectUtil.hasProperty({}, [key]), false);
      });

      it('supports numeric array indexes through array paths', () =>
      {
         const data = { values: ['a', 'b'] };

         assert.equal(ObjectUtil.hasProperty(data, ['values', 0]), true);
         assert.equal(ObjectUtil.hasProperty(data, ['values', 1]), true);
         assert.equal(ObjectUtil.hasProperty(data, ['values', 2]), false);
      });

      it('rejects string array indexes', () =>
      {
         const data = { values: ['a'] };

         assert.equal(ObjectUtil.hasProperty(data, ['values', '0']), false);
         assert.equal(ObjectUtil.hasProperty(data, 'values.0'), false);
      });

      it('distinguishes sparse array holes from explicit undefined entries', () =>
      {
         const sparse = new Array(1);
         const explicit = [void 0];

         assert.equal(ObjectUtil.hasProperty(sparse, [0]), false);
         assert.equal(ObjectUtil.hasProperty(explicit, [0]), true);
      });

      it('supports symbol properties attached to arrays', () =>
      {
         const key = Symbol('metadata');
         const data: any[] = ['a'];

         data[key] = 42;

         assert.equal(ObjectUtil.hasProperty(data, [key]), true);
      });

      it('includes inherited properties', () =>
      {
         const data = Object.create({ inherited: 42 });

         assert.equal(ObjectUtil.hasProperty(data, 'inherited'), true);
      });

      it('returns false for invalid or empty paths', () =>
      {
         assert.equal(ObjectUtil.hasProperty({}, ''), false);
         assert.equal(ObjectUtil.hasProperty({}, []), false);
         assert.equal(ObjectUtil.hasProperty({}, null as unknown as any), false);
      });

      it('rejects invalid array indexes', () =>
      {
         const data = ['a'];

         assert.equal(ObjectUtil.hasProperty(data, [-1]), false);
         assert.equal(ObjectUtil.hasProperty(data, [1.5]), false);
         assert.equal(ObjectUtil.hasProperty(data, [0xFFFF_FFFF]), false);
      });

      it('can require every path segment to be an own property', () =>
      {
         const nestedPrototype = { value: 42 };
         const nested = Object.create(nestedPrototype);
         const rootPrototype = { nested };
         const data = Object.create(rootPrototype);

         assert.isTrue(ObjectUtil.hasProperty(data, 'nested.value'));
         assert.isFalse(ObjectUtil.hasProperty(data, 'nested.value', { hasOwnOnly: true }));

         const ownData = { nested: { value: 42 } };
         assert.isTrue(ObjectUtil.hasProperty(ownData, 'nested.value', { hasOwnOnly: true }));
      });

      it('does not invoke a terminal getter when testing existence', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'value', {
            get()
            {
               reads++;
               return 42;
            }
         });

         assert.isTrue(ObjectUtil.hasProperty(data, 'value'));
         assert.equal(reads, 0);
      });

      it('validates options.hasOwnOnly', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.hasProperty({}, 'value', { hasOwnOnly: 'yes' }), TypeError,
          `hasProperty error: 'options.hasOwnOnly' is not a boolean.`);
      });
   });


   it('hasPrototype:', () =>
   {
      class Base { static test: string = 'test'; }

      class Child extends Base{}

      // @ts-expect-error
      assert.isFalse(ObjectUtil.hasPrototype({}, Base));
      // @ts-expect-error
      assert.isFalse(ObjectUtil.hasPrototype(() => void 0, Base));
      assert.isFalse(ObjectUtil.hasPrototype(null, Base));
      assert.isFalse(ObjectUtil.hasPrototype(void 0, Base));

      assert.isTrue(ObjectUtil.hasPrototype(Base, Base));
      assert.isTrue(ObjectUtil.hasPrototype(Child, Base));
   });

   describe('hasSetter:', () =>
   {
      it('top level', () =>
      {
         const data = {
            get test() { return 0; },
            get bad() { return 1; },

            set test(val) { } // eslint-disable-line no-unused-vars
         }

         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasSetter({}, 'nope'));
         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasSetter(() => void 0, 'nope'));
         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasSetter(data, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(null, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(void 0, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(data, 'bad'));

         assert.isTrue(ObjectUtil.hasSetter(data, 'test'));
      });

      it('inherited', () =>
      {
         class Base {
            get test() { return 0; }
            get bad() { return 1; }
            set test(val) { }
         }

         class Top extends Base {}

         const instance = new Top();

         // @ts-expect-error
         assert.isFalse(ObjectUtil.hasSetter(instance, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(instance, 'bad'));

         assert.isTrue(ObjectUtil.hasSetter(instance, 'test'));
      });
   });

   it('isIterable:', () =>
   {
      assert.isFalse(ObjectUtil.isIterable(false));
      assert.isFalse(ObjectUtil.isIterable(null));
      assert.isFalse(ObjectUtil.isIterable({}));
      assert.isFalse(ObjectUtil.isIterable((async function *generator() {})()));
      assert.isFalse(ObjectUtil.isIterable('123')); // While a string is iterable it is not an iterable list / object.
      assert.isFalse(ObjectUtil.isIterable(function *generator() {})); // The generator function itself is not iterable.

      assert.isTrue(ObjectUtil.isIterable(new Set('a')));
      assert.isTrue(ObjectUtil.isIterable((function *generator() {})()));
   });

   it('isAsyncIterable:', () =>
   {
      assert.isFalse(ObjectUtil.isAsyncIterable(false));
      assert.isFalse(ObjectUtil.isAsyncIterable(null));
      assert.isFalse(ObjectUtil.isAsyncIterable({}));
      assert.isFalse(ObjectUtil.isAsyncIterable(''));
      assert.isFalse(ObjectUtil.isAsyncIterable(new Set('a')));
      assert.isFalse(ObjectUtil.isAsyncIterable((function *generator() {})()));
      assert.isFalse(ObjectUtil.isAsyncIterable(function *generator() {}));

      // The generator function itself is not iterable.
      assert.isFalse(ObjectUtil.isAsyncIterable(async function *generator() {}));

      assert.isTrue(ObjectUtil.isAsyncIterable((async function *generator() {})()));
   });

   describe('isJSONPropertyPath:', () =>
   {
      it('accepts non-empty dotted string paths', () =>
      {
         assert.isTrue(ObjectUtil.isJSONPropertyPath('actor'));
         assert.isTrue(ObjectUtil.isJSONPropertyPath('actor.system.hp'));
         assert.isTrue(ObjectUtil.isJSONPropertyPath('level1..value'));
      });

      it('rejects an empty string path', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath(''));
      });

      it('accepts non-empty string-key arrays', () =>
      {
         assert.isTrue(ObjectUtil.isJSONPropertyPath(['actor']));
         assert.isTrue(ObjectUtil.isJSONPropertyPath(['actor', 'system', 'hp']));
      });

      it('accepts empty-string and literal-period array segments', () =>
      {
         assert.isTrue(ObjectUtil.isJSONPropertyPath(['']));
         assert.isTrue(ObjectUtil.isJSONPropertyPath(['actor', '', 'value']));
         assert.isTrue(ObjectUtil.isJSONPropertyPath(['literal.period']));
      });

      it('accepts numeric segments', () =>
      {
         assert.isTrue(ObjectUtil.isJSONPropertyPath([0]));
         assert.isTrue(ObjectUtil.isJSONPropertyPath(['actors', 0, 'name']));
         assert.isTrue(ObjectUtil.isJSONPropertyPath([-1]));
         assert.isTrue(ObjectUtil.isJSONPropertyPath([1.5]));
         assert.isTrue(ObjectUtil.isJSONPropertyPath([Number.MAX_VALUE]));
      });

      it('accepts negative zero', () =>
      {
         assert.isTrue(ObjectUtil.isJSONPropertyPath([-0]));
      });

      it('accepts readonly property-key arrays', () =>
      {
         const path = ['actors', 0, 'name'] as const;

         assert.isTrue(ObjectUtil.isJSONPropertyPath(path));
      });

      it('round-trips accepted string paths through JSON', () =>
      {
         const path: JSONPropertyPath = 'actor.system.hp';

         const restored: unknown = JSON.parse(JSON.stringify(path));

         assert.isTrue(ObjectUtil.isJSONPropertyPath(restored));
         assert.strictEqual(restored, path);
      });

      it('round-trips accepted array paths through JSON', () =>
      {
         const path: JSONPropertyPath = ['actors', 0, 'name'];

         const restored: unknown = JSON.parse(JSON.stringify(path));

         assert.isTrue(ObjectUtil.isJSONPropertyPath(restored));
         assert.deepEqual(restored, path);
      });

      it('rejects an empty array', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath([]));
      });

      it('rejects symbol segments', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath([Symbol('metadata')]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(['actor', Symbol.for('metadata')]));
      });

      it('rejects non-finite numeric segments', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath([NaN]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([Infinity]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([-Infinity]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(['actor', NaN]));
      });

      it('rejects sparse arrays', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath(new Array(1)));

         const path = ['actor', 'system', 'value'];

         delete path[1];

         assert.isFalse(ObjectUtil.isJSONPropertyPath(path));
      });

      it('rejects sparse arrays even when later entries are valid', () =>
      {
         const path: unknown[] = [];

         path.length = 3;
         path[0] = 'actor';
         path[2] = 'value';

         assert.isFalse(ObjectUtil.isJSONPropertyPath(path));
      });

      it('rejects nested arrays', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath([['actor']]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(['actor', ['system']]));
      });

      it('rejects nullish and primitive non-path values', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath(null));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(void 0));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(true));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(false));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(0));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(42));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(1n));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(Symbol('path')));
      });

      it('rejects objects and functions', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath({}));
         assert.isFalse(ObjectUtil.isJSONPropertyPath({ path: 'actor.system' }));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(new Set(['actor'])));
         assert.isFalse(ObjectUtil.isJSONPropertyPath(() => void 0));
      });

      it('rejects unsupported array entry values', () =>
      {
         assert.isFalse(ObjectUtil.isJSONPropertyPath([null]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([void 0]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([true]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([1n]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([{}]));
         assert.isFalse(ObjectUtil.isJSONPropertyPath([() => void 0]));
      });

      it('narrows unknown values to JSONPropertyPath', () =>
      {
         const value: unknown = ['actors', 0, 'name'];

         if (!ObjectUtil.isJSONPropertyPath(value)) { assert.fail('Expected a JSON property path.'); }

         expectTypeOf(value).toEqualTypeOf<JSONPropertyPath>();
      });

      it('preserves a known JSONPropertyPath type', () =>
      {
         const value: JSONPropertyPath = ['actors', 0, 'name'];

         if (!ObjectUtil.isJSONPropertyPath(value)) { assert.fail('Expected a JSON property path.'); }

         expectTypeOf(value).toExtend<JSONPropertyPath>();
      });
   });

   it('isObject', () =>
   {
      assert.isFalse(ObjectUtil.isObject(false));
      assert.isFalse(ObjectUtil.isObject(null));
      assert.isFalse(ObjectUtil.isObject(void 0));

      assert.isTrue(ObjectUtil.isObject({}));

      // No-op visual type erasure check.
      const val: NoOpObj = { a: 123 };
      if (ObjectUtil.isObject(val)) { expectTypeOf(val).toEqualTypeOf<NoOpObj>(); }
   });

   describe('isObjectOrFunction:', () =>
   {
      it('accepts ordinary objects', () =>
      {
         assert.isTrue(ObjectUtil.isObjectOrFunction({}));
         assert.isTrue(ObjectUtil.isObjectOrFunction({ value: 42 }));
         assert.isTrue(ObjectUtil.isObjectOrFunction(Object.create(null)));
      });

      it('accepts arrays', () =>
      {
         assert.isTrue(ObjectUtil.isObjectOrFunction([]));
         assert.isTrue(ObjectUtil.isObjectOrFunction([1, 2, 3]));
      });

      it('accepts functions', () =>
      {
         assert.isTrue(ObjectUtil.isObjectOrFunction(() => void 0));
         assert.isTrue(ObjectUtil.isObjectOrFunction(function test() {}));
         assert.isTrue(ObjectUtil.isObjectOrFunction(async () => void 0));
         assert.isTrue(ObjectUtil.isObjectOrFunction(function* test() {}));
      });

      it('accepts class constructors and instances', () =>
      {
         class Test {}

         assert.isTrue(ObjectUtil.isObjectOrFunction(Test));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Test()));
      });

      it('accepts specialized built-in objects', () =>
      {
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Date()));
         assert.isTrue(ObjectUtil.isObjectOrFunction(/test/));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Map()));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Set()));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new WeakMap()));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new WeakSet()));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Error('test')));
         assert.isTrue(ObjectUtil.isObjectOrFunction(Promise.resolve()));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new ArrayBuffer(8)));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new DataView(new ArrayBuffer(8))));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Uint8Array()));
      });

      it('accepts boxed primitive objects', () =>
      {
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Boolean(false)));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new Number(42)));
         assert.isTrue(ObjectUtil.isObjectOrFunction(new String('test')));
         assert.isTrue(ObjectUtil.isObjectOrFunction(Object(1n)));
         assert.isTrue(ObjectUtil.isObjectOrFunction(Object(Symbol('test'))));
      });

      it('rejects null and undefined', () =>
      {
         assert.isFalse(ObjectUtil.isObjectOrFunction(null));
         assert.isFalse(ObjectUtil.isObjectOrFunction(void 0));
      });

      it('rejects primitive values', () =>
      {
         assert.isFalse(ObjectUtil.isObjectOrFunction(false));
         assert.isFalse(ObjectUtil.isObjectOrFunction(true));
         assert.isFalse(ObjectUtil.isObjectOrFunction(0));
         assert.isFalse(ObjectUtil.isObjectOrFunction(42));
         assert.isFalse(ObjectUtil.isObjectOrFunction(1n));
         assert.isFalse(ObjectUtil.isObjectOrFunction('test'));
         assert.isFalse(ObjectUtil.isObjectOrFunction(Symbol('test')));
      });

      it('differs from isObject by accepting arrays and functions', () =>
      {
         const array: unknown[] = [];
         const callback = (): void => void 0;

         assert.isFalse(ObjectUtil.isObject(array));
         assert.isTrue(ObjectUtil.isObjectOrFunction(array));

         assert.isFalse(ObjectUtil.isObject(callback));
         assert.isTrue(ObjectUtil.isObjectOrFunction(callback));
      });

      it('narrows unknown values to object', () =>
      {
         const value: unknown = {};

         if (ObjectUtil.isObjectOrFunction(value))
         {
            expectTypeOf(value).toEqualTypeOf<object>();
         }
      });

      it('preserves known object types', () =>
      {
         interface Options
         {
            enabled?: boolean;
         }

         const value: Options = { enabled: true };

         if (ObjectUtil.isObjectOrFunction(value))
         {
            expectTypeOf(value).toEqualTypeOf<Options>();
            assert.isTrue(value.enabled);
         }
      });

      it('preserves known function types', () =>
      {
         const value = (input: number): string => `${input}`;

         if (ObjectUtil.isObjectOrFunction(value))
         {
            expectTypeOf(value).toEqualTypeOf<(input: number) => string>();
            assert.equal(value(42), '42');
         }
      });

      it('narrows mixed unions to their object-compatible members', () =>
      {
         const value = {} as Date | (() => void) | string | null;

         if (ObjectUtil.isObjectOrFunction(value))
         {
            expectTypeOf(value).toEqualTypeOf<Date | (() => void)>();
         }
      });
   });

   describe('isOrdinaryObject:', () =>
   {
      it('accepts plain objects', () =>
      {
         assert.isTrue(ObjectUtil.isOrdinaryObject({}));
         assert.isTrue(ObjectUtil.isOrdinaryObject({ value: 42 }));
         assert.isTrue(ObjectUtil.isOrdinaryObject(new Object())); // eslint-disable-line no-new-object
      });

      it('accepts null-prototype objects', () =>
      {
         const value = Object.create(null) as Record<PropertyKey, unknown>;

         value.test = true;

         assert.isTrue(ObjectUtil.isOrdinaryObject(value));
      });

      it('accepts objects with custom prototypes', () =>
      {
         const prototype = { inherited: true };
         const value = Object.create(prototype) as Record<PropertyKey, unknown>;

         value.own = true;

         assert.isTrue(ObjectUtil.isOrdinaryObject(value));

         // The custom prototype distinguishes this value from a plain object.
         assert.isFalse(ObjectUtil.isPlainObject(value));
      });

      it('accepts ordinary class instances', () =>
      {
         class Test
         {
            value = 42;
         }

         const value = new Test();

         assert.isTrue(ObjectUtil.isOrdinaryObject(value));

         // Class instances are ordinary objects, but are not plain objects.
         assert.isFalse(ObjectUtil.isPlainObject(value));
      });

      it('rejects primitive values', () =>
      {
         assert.isFalse(ObjectUtil.isOrdinaryObject(null));
         assert.isFalse(ObjectUtil.isOrdinaryObject(void 0));
         assert.isFalse(ObjectUtil.isOrdinaryObject(false));
         assert.isFalse(ObjectUtil.isOrdinaryObject(0));
         assert.isFalse(ObjectUtil.isOrdinaryObject(1n));
         assert.isFalse(ObjectUtil.isOrdinaryObject('test'));
         assert.isFalse(ObjectUtil.isOrdinaryObject(Symbol('test')));
      });

      it('rejects functions and class constructors', () =>
      {
         class Test {}

         assert.isFalse(ObjectUtil.isOrdinaryObject(() => void 0));
         assert.isFalse(ObjectUtil.isOrdinaryObject(function test() {}));
         assert.isFalse(ObjectUtil.isOrdinaryObject(Test));
      });

      it('rejects arrays', () =>
      {
         assert.isFalse(ObjectUtil.isOrdinaryObject([]));
         assert.isFalse(ObjectUtil.isOrdinaryObject([1, 2, 3]));
      });

      it('rejects boxed primitive objects', () =>
      {
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Boolean(false)));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Number(42)));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new String('test')));
         assert.isFalse(ObjectUtil.isOrdinaryObject(Object(1n)));
         assert.isFalse(ObjectUtil.isOrdinaryObject(Object(Symbol('test'))));
      });

      it('rejects specialized collection objects', () =>
      {
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Map()));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Set()));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new WeakMap()));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new WeakSet()));
      });

      it('rejects specialized built-in objects', () =>
      {
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Date()));
         assert.isFalse(ObjectUtil.isOrdinaryObject(/test/));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Error('test')));
         assert.isFalse(ObjectUtil.isOrdinaryObject(Promise.resolve()));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new ArrayBuffer(8)));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new DataView(new ArrayBuffer(8))));
         assert.isFalse(ObjectUtil.isOrdinaryObject(new Uint8Array()));
      });

      it('distinguishes ordinary objects from the broader isObject category', () =>
      {
         const ordinary = {};
         const specialized = new Map();

         assert.isTrue(ObjectUtil.isObject(ordinary));
         assert.isTrue(ObjectUtil.isOrdinaryObject(ordinary));

         assert.isTrue(ObjectUtil.isObject(specialized));
         assert.isFalse(ObjectUtil.isOrdinaryObject(specialized));
      });

      it('honors a custom Symbol.toStringTag', () =>
      {
         const value = { [Symbol.toStringTag]: 'Configuration' };

         assert.equal(Object.prototype.toString.call(value), '[object Configuration]');
         assert.isFalse(ObjectUtil.isOrdinaryObject(value));
      });

      it('can classify a specialized object tagged as Object', () =>
      {
         const value = new Date();

         Object.defineProperty(value, Symbol.toStringTag, { configurable: true, value: 'Object' });

         assert.equal(Object.prototype.toString.call(value), '[object Object]');
         assert.isTrue(ObjectUtil.isOrdinaryObject(value));
      });

      it('invokes a Symbol.toStringTag getter', () =>
      {
         let accessed = false;

         const value = Object.defineProperty({}, Symbol.toStringTag, {
            configurable: true,
            get()
            {
               accessed = true;
               return 'Object';
            }
         });

         assert.isTrue(ObjectUtil.isOrdinaryObject(value));
         assert.isTrue(accessed);
      });

      it('propagates Symbol.toStringTag access errors', () =>
      {
         const value = Object.defineProperty({}, Symbol.toStringTag, {
            configurable: true,
            get() { throw new Error('Unable to read Symbol.toStringTag.'); }
         });

         assert.throws(() => ObjectUtil.isOrdinaryObject(value), Error, 'Unable to read Symbol.toStringTag.');
      });

      it('propagates errors from revoked proxies', () =>
      {
         const revocable = Proxy.revocable({}, {});

         revocable.revoke();

         assert.throws(() => ObjectUtil.isOrdinaryObject(revocable.proxy), TypeError);
      });

      it('preserves a known object type', () =>
      {
         const value: NoOpObj = { a: 123 };

         if (ObjectUtil.isOrdinaryObject(value))
         {
            expectTypeOf(value).toEqualTypeOf<NoOpObj>();
         }
      });

      it('narrows unknown values to a PropertyKey record', () =>
      {
         const value: unknown = { a: 123 };

         if (ObjectUtil.isOrdinaryObject(value))
         {
            expectTypeOf(value).toEqualTypeOf<Record<PropertyKey, unknown>>();

            assert.equal(value.a, 123);
         }
      });
   });

   it('isPlainObject', () =>
   {
      class Test {}

      assert.isFalse(ObjectUtil.isPlainObject(false));
      assert.isFalse(ObjectUtil.isPlainObject(null));
      assert.isFalse(ObjectUtil.isPlainObject(void 0));
      assert.isFalse(ObjectUtil.isPlainObject(new String('test')));
      assert.isFalse(ObjectUtil.isPlainObject(new Test()));

      assert.isTrue(ObjectUtil.isPlainObject({}));
      assert.isTrue(ObjectUtil.isPlainObject(Object.create(null)));
      assert.isTrue(ObjectUtil.isPlainObject(new Object())); // eslint-disable-line no-new-object

      // No-op visual type erasure check.
      const val: NoOpObj = { a: 123 };
      if (ObjectUtil.isPlainObject(val)) { expectTypeOf(val).toEqualTypeOf<NoOpObj>(); }
   });

   it('isPropertyKey', () =>
   {
      assert.isTrue(ObjectUtil.isPropertyKey('value'));
      assert.isTrue(ObjectUtil.isPropertyKey(0));
      assert.isTrue(ObjectUtil.isPropertyKey(NaN));
      assert.isTrue(ObjectUtil.isPropertyKey(Symbol('value')));

      assert.isFalse(ObjectUtil.isPropertyKey(null));
      assert.isFalse(ObjectUtil.isPropertyKey(void 0));
      assert.isFalse(ObjectUtil.isPropertyKey(true));
      assert.isFalse(ObjectUtil.isPropertyKey({}));
   });

   it('isRecord', () =>
   {
      class Test {}

      assert.isFalse(ObjectUtil.isRecord(false));
      assert.isFalse(ObjectUtil.isRecord(null));
      assert.isFalse(ObjectUtil.isRecord(void 0));
      assert.isFalse(ObjectUtil.isRecord('test'));

      assert.isTrue(ObjectUtil.isRecord(new Test()));
      assert.isTrue(ObjectUtil.isRecord({}));
      assert.isTrue(ObjectUtil.isRecord(Object.create(null)));
      assert.isTrue(ObjectUtil.isRecord(new Object())); // eslint-disable-line no-new-object

      // No-op visual type check.
      const val: NoOpObj = { a: 123 };
      if (ObjectUtil.isRecord(val)) { expectTypeOf(val).toEqualTypeOf<Record<string, unknown>>(); }
   });

   describe('isPropertyPath:', () =>
   {
      it('returns true for a non-empty dotted string path', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPath('level1.value'));
      });

      it('returns false for an empty string path', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPath(''));
      });

      it('returns true for a non-empty property-key array', () =>
      {
         const symbol = Symbol('value');

         assert.isTrue(ObjectUtil.isPropertyPath(['level1', 0, symbol]));
      });

      it('returns true for an exact empty-string property key', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPath(['']));
      });

      it('returns false for an empty path array', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPath([]));
      });

      it('returns false when an path array contains an invalid key', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPath(['level1', true]));

         assert.isFalse(ObjectUtil.isPropertyPath(['level1', null]));

         assert.isFalse(ObjectUtil.isPropertyPath(['level1', {}]));
      });

      it('returns false for non-path values', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPath(null));
         assert.isFalse(ObjectUtil.isPropertyPath(void 0));
         assert.isFalse(ObjectUtil.isPropertyPath(42));
         assert.isFalse(ObjectUtil.isPropertyPath({}));
      });

      it('rejects sparse arrays', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPath(new Array(1)));

         const path = ['actor', 'system', 'value'];

         delete path[1];

         assert.isFalse(ObjectUtil.isPropertyPath(path));
      });

      it('rejects sparse arrays even when later entries are valid', () =>
      {
         const path: unknown[] = [];

         path.length = 3;
         path[0] = 'actor';
         path[2] = 'value';

         assert.isFalse(ObjectUtil.isPropertyPath(path));
      });

      it('narrows unknown values to PropertyPath', () =>
      {
         const value: unknown = ['actors', 0, 'name'];

         if (!ObjectUtil.isPropertyPath(value)) { assert.fail('Expected a property path.'); }

         expectTypeOf(value).toEqualTypeOf<PropertyPath>();
      });

      it('preserves a known PropertyPath type', () =>
      {
         const value: PropertyPath = ['actors', 0, 'name'];

         if (!ObjectUtil.isPropertyPath(value)) { assert.fail('Expected a property path.'); }

         expectTypeOf(value).toExtend<PropertyPath>();
      });
   });

   describe('isPropertyPathEqual:', () =>
   {
      it('compares identical dotted paths as equal', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual('actor.system.name', 'actor.system.name'));
      });

      it('compares equivalent dotted and exact array paths as equal', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          'actor.system.name',
          ['actor', 'system', 'name']
         ));

         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          ['actor', 'system', 'name'],
          'actor.system.name'
         ));
      });

      it('compares equivalent independently allocated array paths as equal', () =>
      {
         const pathA = ['actor', 'system', 'name'] as const;
         const pathB = ['actor', 'system', 'name'] as const;

         assert.notStrictEqual(pathA, pathB);
         assert.isTrue(ObjectUtil.isPropertyPathEqual(pathA, pathB));
      });

      it('compares the same array instance as equal', () =>
      {
         const path = ['actor', 'system', 'name'] as const;

         assert.isTrue(ObjectUtil.isPropertyPathEqual(path, path));
      });

      it('returns false for paths with different segment values', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          'actor.system.name',
          'actor.system.id'
         ));

         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          ['actor', 'system', 'name'],
          ['actor', 'system', 'id']
         ));
      });

      it('returns false for paths with different segment order', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          ['actor', 'system', 'name'],
          ['system', 'actor', 'name']
         ));
      });

      it('returns false for paths with different lengths', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          ['actor', 'system'],
          ['actor', 'system', 'name']
         ));

         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          'actor.system.name',
          'actor.system'
         ));
      });

      it('distinguishes numeric and string segments', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          ['items', 0, 'name'],
          ['items', '0', 'name']
         ));
      });

      it('compares zero and negative zero as equal', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          ['items', 0],
          ['items', -0]
         ));
      });

      it('compares NaN segments as equal', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          ['items', NaN],
          ['items', NaN]
         ));
      });

      it('compares other numeric segments by value', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          ['items', 1.5],
          ['items', 1.5]
         ));

         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          ['items', 1.5],
          ['items', 2.5]
         ));
      });

      it('compares symbol segments by identity', () =>
      {
         const symbol = Symbol('metadata');

         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          [symbol, 'enabled'],
          [symbol, 'enabled']
         ));

         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          [Symbol('metadata'), 'enabled'],
          [Symbol('metadata'), 'enabled']
         ));
      });

      it('compares global symbols by identity', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          [Symbol.for('metadata'), 'enabled'],
          [Symbol.for('metadata'), 'enabled']
         ));
      });

      it('preserves literal-period array segment semantics', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          ['actor.system.name'],
          ['actor.system.name']
         ));

         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          ['actor.system.name'],
          'actor.system.name'
         ));
      });

      it('compares dotted empty segments with equivalent exact array segments', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual(
          'actor..name',
          ['actor', '', 'name']
         ));
      });

      it('distinguishes a single empty-string key from dotted empty segments', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathEqual([''], ['']));

         // An empty dotted string is not a valid PropertyPath.
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          [''],
          '' as any
         ));
      });

      it('accepts readonly and frozen exact paths', () =>
      {
         const pathA = Object.freeze(['actor', 'system', 'name'] as const);
         const pathB = ['actor', 'system', 'name'] as const;

         assert.isTrue(ObjectUtil.isPropertyPathEqual(pathA, pathB));
      });

      it('returns false when the first path is undefined', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          undefined,
          'actor.system.name'
         ));
      });

      it('returns false when the second path is undefined', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(
          'actor.system.name',
          undefined
         ));
      });

      it('returns false when both paths are undefined', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathEqual(undefined, undefined));
      });

      it('defensively returns false for invalid JavaScript inputs', () =>
      {
         const invalidValues = [
            null,
            '',
            [],
            42,
            true,
            {},
            ['actor', null],
            ['actor', {}]
         ];

         for (const invalid of invalidValues)
         {
            assert.isFalse(ObjectUtil.isPropertyPathEqual(
             invalid as any,
             'actor.system.name'
            ));

            assert.isFalse(ObjectUtil.isPropertyPathEqual(
             'actor.system.name',
             invalid as any
            ));
         }
      });

      it('does not throw for invalid JavaScript inputs', () =>
      {
         assert.doesNotThrow(() =>
         {
            ObjectUtil.isPropertyPathEqual(null as any, {} as any);
         });
      });

      it('returns a boolean', () =>
      {
         const result = ObjectUtil.isPropertyPathEqual(
          'actor.system.name',
          ['actor', 'system', 'name']
         );

         expectTypeOf(result).toEqualTypeOf<boolean>();
      });

      it('accepts PropertyPath or undefined variables', () =>
      {
         const pathA: PropertyPath | undefined = 'actor.system.name';
         const pathB: PropertyPath | undefined = ['actor', 'system', 'name'];

         expectTypeOf(
          ObjectUtil.isPropertyPathEqual(pathA, pathB)
         ).toEqualTypeOf<boolean>();

         assert.isTrue(ObjectUtil.isPropertyPathEqual(pathA, pathB));
      });
   });

   describe('isPropertyPathPrefix:', () =>
   {
      it('matches equal and descendant structural paths', () =>
      {
         assert.isTrue(ObjectUtil.isPropertyPathPrefix('actor.system', ['actor', 'system']));
         assert.isTrue(ObjectUtil.isPropertyPathPrefix('actor', 'actor.system.hp'));
         assert.isTrue(ObjectUtil.isPropertyPathPrefix(['actor', 'system'], ['actor', 'system', 'hp']));
      });

      it('uses SameValueZero and symbol identity semantics', () =>
      {
         const symbol = Symbol('branch');
         const otherSymbol = Symbol('branch');

         assert.isTrue(ObjectUtil.isPropertyPathPrefix([symbol, NaN], [symbol, NaN, 'value']));
         assert.isTrue(ObjectUtil.isPropertyPathPrefix([0], [-0, 'value']));
         assert.isFalse(ObjectUtil.isPropertyPathPrefix([symbol], [otherSymbol, 'value']));
         assert.isFalse(ObjectUtil.isPropertyPathPrefix([0], ['0', 'value']));
      });

      it('rejects longer, mismatched, and invalid prefixes', () =>
      {
         assert.isFalse(ObjectUtil.isPropertyPathPrefix('actor.system.hp', 'actor.system'));
         assert.isFalse(ObjectUtil.isPropertyPathPrefix('actor.token', 'actor.system.hp'));
         assert.isFalse(ObjectUtil.isPropertyPathPrefix([] as unknown as any, 'actor'));
         assert.isFalse(ObjectUtil.isPropertyPathPrefix('actor', [] as unknown as any));
      });
   });

   describe('joinPropertyPath:', () =>
   {
      it('returns existing dotted strings and losslessly joins exact string paths', () =>
      {
         assert.equal(ObjectUtil.joinPropertyPath('actor.system.hp'), 'actor.system.hp');
         assert.equal(ObjectUtil.joinPropertyPath(['actor', 'system', 'hp']), 'actor.system.hp');
         assert.equal(ObjectUtil.joinPropertyPath(['actor', '', 'hp']), 'actor..hp');
         assert.equal(ObjectUtil.joinPropertyPath(['', 'actor']), '.actor');
         assert.equal(ObjectUtil.joinPropertyPath(['actor', '']), 'actor.');
      });

      describe('Errors', () =>
      {
         it('throws - for invalid paths', () =>
         {
            assert.throws(() => ObjectUtil.joinPropertyPath([]), TypeError,
             `normalizePropertyPath error: 'path' is not a valid property path.`);
         });

         it('throws - for exact paths that cannot be represented losslessly', () =>
         {
            assert.throws(() => ObjectUtil.joinPropertyPath([0]), TypeError,
             `joinPropertyPath error: 'path' cannot be represented as a dotted string property path.`);
            assert.throws(() => ObjectUtil.joinPropertyPath([Symbol('value')]), TypeError);
            assert.throws(() => ObjectUtil.joinPropertyPath(['literal.period']), TypeError);
            assert.throws(() => ObjectUtil.joinPropertyPath(['']), TypeError);
         });
      });
   });

   describe('normalizePropertyPath:', () =>
   {
      it('splits a dotted string path into property keys', () =>
      {
         assert.deepEqual(ObjectUtil.normalizePropertyPath('level1.level2.value'), ['level1', 'level2', 'value']);
      });

      it('preserves empty path segments in dotted strings', () =>
      {
         assert.deepEqual(ObjectUtil.normalizePropertyPath('level1..value'), ['level1', '', 'value']);
      });

      it('returns a property-key array unchanged', () =>
      {
         const symbol = Symbol('value');
         const path = ['level1', 0, symbol] as const;

         const result = ObjectUtil.normalizePropertyPath(path);

         assert.equal(result, path);
      });

      it('supports an exact empty-string property key', () =>
      {
         const path = [''] as const;

         const result = ObjectUtil.normalizePropertyPath(path);

         assert.equal(result, path);
         assert.deepEqual(result, ['']);
      });

      describe('Errors', () =>
      {
         it('throws - for an empty string path', () =>
         {
            assert.throws(() => ObjectUtil.normalizePropertyPath(''), TypeError,
             `normalizePropertyPath error: 'path' is not a valid property path.`);
         });

         it('throws - for an empty path array', () =>
         {
            assert.throws(() => ObjectUtil.normalizePropertyPath([]), TypeError,
             `normalizePropertyPath error: 'path' is not a valid property path.`);
         });

         it('throws - when a path array contains an invalid key', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.normalizePropertyPath(['level1', true]), TypeError,
             `normalizePropertyPath error: 'path' is not a valid property path.`);
         });
      });
   });

   it('objectKeys', () =>
   {
      // @ts-expect-error
      assert.deepEqual(ObjectUtil.objectKeys(false), []);
      assert.deepEqual(ObjectUtil.objectKeys(null), []);
      assert.deepEqual(ObjectUtil.objectKeys(void 0), []);
      assert.deepEqual(ObjectUtil.objectKeys({}), []);
      assert.deepEqual(ObjectUtil.objectKeys({ value: true }), ['value']);

      // No-op visual type erasure check.
      expectTypeOf(ObjectUtil.objectKeys({ a: 123 })).toEqualTypeOf<'a'[]>();
   });

   it('objectSize', () =>
   {
      assert.strictEqual(ObjectUtil.objectSize(null), 0);
      assert.strictEqual(ObjectUtil.objectSize(void 0), 0);
      assert.strictEqual(ObjectUtil.objectSize(false), 0);
      assert.strictEqual(ObjectUtil.objectSize('thing'), 0);
      assert.strictEqual(ObjectUtil.objectSize({}), 0);
      assert.strictEqual(ObjectUtil.objectSize({ one: true, two: true }), 2);
      assert.strictEqual(ObjectUtil.objectSize([1, 2]), 2);
      assert.strictEqual(ObjectUtil.objectSize(new Set([1, 2, 3])), 3);
      assert.strictEqual(ObjectUtil.objectSize(new Map([[1, true]])), 1);
      assert.strictEqual(ObjectUtil.objectSize(new String('test')), 4);
   });

   describe('safeAccess:', () =>
   {
      it('all mixed paths (as path arrays)', () =>
      {
         const output = [];
         const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_MIXED, { arrayIndex: true })];

         for (const path of paths) { output.push(ObjectUtil.safeAccess(s_OBJECT_MIXED, path)); }

         assert.deepEqual(output, JSON.parse(s_VERIFY_DEPTH_TRAVERSE));
         assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
      });

      it('symbols', () =>
      {
         const result = ObjectUtil.safeAccess(s_OBJECT_SYM, [s_SYMBOL_LEVEL1, s_SYMBOL_LEVEL2]);
         assert.isTrue(result);
         expectTypeOf(ObjectUtil.safeAccess(s_OBJECT_SYM, [s_SYMBOL_LEVEL1, s_SYMBOL_LEVEL2])).toEqualTypeOf<boolean>();
      });

      it('base array', () =>
      {
         const array = [true, false, true];

         assert.isTrue(ObjectUtil.safeAccess(array, [0]));
         assert.isFalse(ObjectUtil.safeAccess(array, [1]));
         assert.isTrue(ObjectUtil.safeAccess(array, [2]));

         expectTypeOf(ObjectUtil.safeAccess(array, [0])).toEqualTypeOf<boolean>();
      });

      it('returns the default for primitive intermediate values', () =>
      {
         assert.equal(ObjectUtil.safeAccess({ value: 42 }, 'value.test', null), null);
         assert.equal(ObjectUtil.safeAccess({ value: true }, 'value.test', null), null);
         assert.equal(ObjectUtil.safeAccess({ value: 'text' }, 'value.test', null), null);

         expectTypeOf(ObjectUtil.safeAccess({ value: 42 }, 'value.test', false)).toEqualTypeOf<boolean>();
      });

      it('default value conditions', () =>
      {
         assert.equal(ObjectUtil.safeAccess(null, '', 'defaultValue'), 'defaultValue');
         assert.equal(ObjectUtil.safeAccess({}, null, 'defaultValue'), 'defaultValue');
         assert.equal(ObjectUtil.safeAccess({ a: null }, 'a', 'defaultValue'), 'defaultValue');
         assert.equal(ObjectUtil.safeAccess({ a: null }, [], 'defaultValue'), 'defaultValue');
         assert.equal(ObjectUtil.safeAccess({ a: [true] }, 'a.1', 'defaultValue'), 'defaultValue');
         // @ts-expect-error
         assert.equal(ObjectUtil.safeAccess({ a: null }, [false], 'defaultValue'), 'defaultValue');

         expectTypeOf(ObjectUtil.safeAccess(null, '', 'defaultValue')).toEqualTypeOf<string>();
      });
   });

   describe('safeEqual:', () =>
   {
      it('bad data', () =>
      {
         assert.isFalse(ObjectUtil.safeEqual(null, null));
      });

      it('equality tests', () =>
      {
         assert.isTrue(ObjectUtil.safeEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG));

         assert.isFalse(ObjectUtil.safeEqual(s_OBJECT_MIXED, { a: 2 }));
         assert.isFalse(ObjectUtil.safeEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ONE_MOD, { arrayIndex: true }));
      });

      it('distinguishes missing, undefined, null, arrays, and symbols', () =>
      {
         const symbol = Symbol('value');

         assert.equal(ObjectUtil.safeEqual({ value: void 0 }, {}), false);
         assert.equal(ObjectUtil.safeEqual({ value: void 0 }, { value: void 0 }), true);

         assert.equal(ObjectUtil.safeEqual({ value: null }, {}), false);
         assert.equal(ObjectUtil.safeEqual({ value: null }, { value: null }), true);

         assert.equal(ObjectUtil.safeEqual({ values: [void 0] }, { values: new Array(1) }, { arrayIndex: true }),
          false);

         assert.equal(ObjectUtil.safeEqual({ values: ['a'] }, { values: ['a'] }, { arrayIndex: true }), true);
         assert.equal(ObjectUtil.safeEqual({ values: ['a'] }, { values: [] }, { arrayIndex: true }), false);

         assert.equal(ObjectUtil.safeEqual({ [symbol]: 42 }, { [symbol]: 42 }), true);
         assert.equal(ObjectUtil.safeEqual({ [symbol]: 42 }, {}), false);
      });

      it('resolves inherited properties when enabled', () =>
      {
         const source = Object.create({ value: 42 });
         const target = Object.create({ value: 42 });

         assert.equal(ObjectUtil.safeEqual(source, target), true);
         assert.equal(ObjectUtil.safeEqual(source, target, { hasOwnOnly: false }), true);

         Object.setPrototypeOf(target, { value: 100 });

         assert.equal(ObjectUtil.safeEqual(source, target, { hasOwnOnly: false }), false);
      });

      it('rejects invalid intermediate paths', () =>
      {
         const source = { nested: { value: 42 } };

         assert.equal(ObjectUtil.safeEqual(source, { nested: null }), false);
         assert.equal(ObjectUtil.safeEqual(source, { nested: void 0 }), false);
         assert.equal(ObjectUtil.safeEqual(source, { nested: 42 }), false);
         assert.equal(ObjectUtil.safeEqual(source, { nested: {} }), false);
      });

      it('allows shared references that do not form a circular path', () =>
      {
         const shared = { value: 42 };
         const source = { first: shared, second: shared };

         assert.equal(ObjectUtil.safeEqual(source, { first: { value: 42 }, second: { value: 42 } }), true);
      });

      it('enforces a source traversal visit budget without result truncation', () =>
      {
         assert.throws(() => ObjectUtil.safeEqual({ first: 1, second: 2 }, { first: 1, second: 2 }, {
            maxVisits: 1
         }), RangeError, `pathKeyIterator error: Traversal exceeded 'options.maxVisits'.`);
      });

      describe('Errors', () =>
      {
         it('throws - when the source contains a circular path', () =>
         {
            const source: Record<string, any> = { value: 42 };

            source.self = source;

            assert.throws(() => ObjectUtil.safeEqual(source, { value: 42 }), TypeError, ``);
         });
      });
   });

   describe('pathKeyIterator:', () =>
   {
      it('all paths', () =>
      {
         const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_MIXED, { arrayIndex: true })];
         assert.deepEqual(paths, JSON.parse(s_VERIFY_PATH_LIST));
      });

      it('options.arrayIndex (false)', () =>
      {
         const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_MIXED, { arrayIndex: false })];
         assert.deepEqual(paths, JSON.parse(s_VERIFY_PATH_LIST_NO_ARRAY));
      });

      it('options.hasOwnOnly', () =>
      {
         class Test {}
         Object.defineProperty(Test.prototype, 'a', {
            value: 1,
            enumerable: true
         });

         assert.deepEqual([...ObjectUtil.pathKeyIterator(new Test(), { hasOwnOnly: true })], []);
         assert.deepEqual([...ObjectUtil.pathKeyIterator(new Test(), { hasOwnOnly: false })], [['a']]);
      });

      it('yields numeric indexes for a root array', () =>
      {
         const data = ['a', 'b', 'c'];
         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { arrayIndex: true })], [[0], [1], [2]]);
      });

      it('does not yield root array indexes when arrayIndex is false', () =>
      {
         const data = ['a', 'b', 'c'];

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { arrayIndex: false })], []);
      });

      it('yields an enumerable symbol property containing a primitive', () =>
      {
         const key = Symbol('value');
         const data: any[] = [];

         data[key] = 42;

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], [[key]]);
      });

      it('yields numeric indexes for an enumerable symbol property containing an array', () =>
      {
         const key = Symbol('items');
         const data: any[] = [];

         data[key] = ['a', 'b'];

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { arrayIndex: true })], [[key, 0], [key, 1]]);
      });

      it('does not yield a symbol array property when arrayIndex is false', () =>
      {
         const key = Symbol('items');
         const data: any[] = [];

         data[key] = ['a', 'b'];

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { arrayIndex: false })], []);
      });

      it('traverses an object stored under an enumerable symbol property', () =>
      {
         const key = Symbol('object');
         const data: any[] = [];

         data[key] = { first: 1, second: 2 };

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], [[key, 'first'], [key, 'second']]);
      });

      it('does not yield a function stored under an enumerable symbol property', () =>
      {
         const key = Symbol('callback');
         const data: any[] = [];

         data[key] = (): void => {};

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], []);
      });

      it('ignores enumerable string properties attached to arrays', () =>
      {
         const data: any[] = ['a'];

         // @ts-expect-error
         data.extra = 42;

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { arrayIndex: true })], [[0]]);
      });

      it('ignores non-enumerable symbol properties', () =>
      {
         const key = Symbol('hidden');
         const data: any[] = [];

         Object.defineProperty(data, key, { enumerable: false, value: 42 });

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], []);
      });

      it('includes inherited enumerable symbol properties when hasOwnOnly is false', () =>
      {
         const key = Symbol('inherited');

         const prototype: any[] = [];
         prototype[key] = 42;

         const data: any[] = [];
         Object.setPrototypeOf(data, prototype);

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { hasOwnOnly: false })], [[key]]);
      });

      it('excludes inherited enumerable symbol properties when hasOwnOnly is true', () =>
      {
         const key = Symbol('inherited');

         const prototype: any[] = [];
         prototype[key] = 42;

         const data: any[] = [];
         Object.setPrototypeOf(data, prototype);

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { hasOwnOnly: true })], []);
      });

      it('handles all supported root-array entries in order', () =>
      {
         const primitiveKey = Symbol('primitive');
         const arrayKey = Symbol('array');
         const objectKey = Symbol('object');
         const functionKey = Symbol('function');

         const data: any[] = ['root-0', 'root-1'];

         // @ts-expect-error
         data.extra = 'ignored';
         data[primitiveKey] = 42;
         data[arrayKey] = ['nested-0', 'nested-1'];
         data[objectKey] = { value: true };
         data[functionKey] = (): void => {};

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data, { arrayIndex: true })], [
            [0],
            [1],
            [primitiveKey],
            [arrayKey, 0],
            [arrayKey, 1],
            [objectKey, 'value']
         ]);
      });

      it('does not yield function-valued ordinary object properties', () =>
      {
         const data = {
            value: 42,
            callback(): void {}
         };

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data)], [['value']]);
      });

      it('allows shared references that do not form a circular path', () =>
      {
         const shared = { value: 42 };
         const source = { first: shared, second: shared };

         assert.doesNotThrow(() => [...ObjectUtil.pathKeyIterator(source)]);
      });

      it('applies prefix, stop, and maximum-depth bounds with absolute paths', () =>
      {
         const data = {
            actor: {
               system: {
                  hp: { value: 10 },
                  ac: 15
               },
               name: 'Actor'
            },
            token: { x: 1 }
         };

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            prefixPath: 'actor',
            stopPath: 'actor.system.hp',
            maxDepth: 2
         })], [
            ['actor', 'name'],
            ['actor', 'system', 'hp'],
            ['actor', 'system', 'ac']
         ]);

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            prefixPath: 'actor.system',
            maxDepth: 0
         })], [['actor', 'system']]);
      });

      it('stops before processing queued object branches after reaching the result limit', () =>
      {
         const data = {
            first: { value: 1 },
            second: { value: 2 }
         };

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, { maxResults: 1 })], [
            ['second', 'value']
         ]);
      });

      it('does not yield function values reached at a maximum-depth boundary', () =>
      {
         const data = {
            callback(): void {}
         };

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, { maxDepth: 1 })], []);
      });

      it('applies result and prefix bounds to numeric root-array indexes', () =>
      {
         const data = ['first', 'second'];

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            arrayIndex: true,
            maxResults: 1
         })], [[0]]);

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            arrayIndex: true,
            prefixPath: [0]
         })], [[0]]);
      });

      it('applies prefix, stop, depth, and result bounds to array symbol properties', () =>
      {
         const unrelated = Symbol('unrelated');
         const branch = Symbol('branch');
         const child = Symbol('child');
         const callback = Symbol('callback');
         const limited = Symbol('limited');
         const data: any[] = [];

         data[unrelated] = 1;
         data[branch] = [];
         data[branch][child] = 2;
         data[callback] = (): void => {};
         data[limited] = 3;

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            prefixPath: [branch, child],
            stopPath: [branch, child]
         })], [[branch, child]]);

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            maxDepth: 1
         })], [[unrelated], [branch], [limited]]);

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, {
            prefixPath: [limited],
            maxResults: 1
         })], [[limited]]);
      });

      it('stops array-symbol traversal at the result limit before another frame iteration', () =>
      {
         const key = Symbol('value');
         const data: any[] = [];
         data[key] = 1;

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, { maxResults: 1 })], [[key]]);
      });

      it('limits yielded results without inspecting later properties', () =>
      {
         let reads = 0;
         const data = {
            first: 1,
            second: 2,
            get third()
            {
               reads++;
               return 3;
            }
         };

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, { maxResults: 2 })], [['first'], ['second']]);
         assert.equal(reads, 0);
      });

      it('enforces a shared visit budget before reading another property', () =>
      {
         let reads = 0;
         const data = {
            first: 1,
            get second()
            {
               reads++;
               return 2;
            }
         };

         assert.throws(() => [...ObjectUtil.pathKeyIterator(data, { maxVisits: 1 })], RangeError,
          `pathKeyIterator error: Traversal exceeded 'options.maxVisits'.`);
         assert.equal(reads, 0);
      });

      it('bounds sparse array traversal by visits', () =>
      {
         const data = new Array(1_000_000);

         assert.throws(() => [...ObjectUtil.pathKeyIterator(data, {
            arrayIndex: true,
            maxVisits: 3
         })], RangeError, `pathKeyIterator error: Traversal exceeded 'options.maxVisits'.`);
      });

      it('returns immediately when maxResults is zero', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'value', {
            enumerable: true,
            get()
            {
               reads++;
               return 1;
            }
         });

         assert.deepEqual([...ObjectUtil.pathKeyIterator(data, { maxResults: 0 })], []);
         assert.equal(reads, 0);
      });

      describe('Errors', () =>
      {
         it('throws - data not object', () =>
         {
            // @ts-expect-error
            expect(() => [...ObjectUtil.pathKeyIterator(false)]).throws(TypeError,
             `pathKeyIterator error: 'data' is not an object.`);
         });

         it('throws - options is not an object', () =>
         {
            expect(() => [...ObjectUtil.pathKeyIterator({}, null)]).throws(TypeError,
             `pathKeyIterator error: 'options' is not an object.`);
            // @ts-expect-error
            expect(() => [...ObjectUtil.pathKeyIterator({}, [])]).throws(TypeError,
             `pathKeyIterator error: 'options' is not an object.`);
         });

         it('throws - options.arrayIndex is not a boolean', () =>
         {
            expect(() => [...ObjectUtil.pathKeyIterator({}, { arrayIndex: null })]).throws(TypeError,
             `pathKeyIterator error: 'options.arrayIndex' is not a boolean.`);
         });

         it('throws - options.hasOwnOnly is not a boolean', () =>
         {
            expect(() => [...ObjectUtil.pathKeyIterator({}, { hasOwnOnly: null })]).throws(TypeError,
             `pathKeyIterator error: 'options.hasOwnOnly' is not a boolean.`);
         });

         it('throws - invalid traversal limits and path bounds', () =>
         {
            assert.throws(() => [...ObjectUtil.pathKeyIterator({}, { maxDepth: -1 })], TypeError,
             `pathKeyIterator error: 'options.maxDepth' is not a non-negative safe integer.`);
            assert.throws(() => [...ObjectUtil.pathKeyIterator({}, { maxResults: 1.5 })], TypeError,
             `pathKeyIterator error: 'options.maxResults' is not a non-negative safe integer.`);
            // @ts-expect-error
            assert.throws(() => [...ObjectUtil.pathKeyIterator({}, { maxVisits: 'bad' })], TypeError,
             `pathKeyIterator error: 'options.maxVisits' is not a non-negative safe integer.`);
            assert.throws(() => [...ObjectUtil.pathKeyIterator({}, { prefixPath: [] })], TypeError);
            assert.throws(() => [...ObjectUtil.pathKeyIterator({}, { stopPath: [] })], TypeError);
            assert.throws(() => [...ObjectUtil.pathKeyIterator({}, {
               prefixPath: 'actor.system',
               stopPath: 'actor'
            })], RangeError);
         });

         it('throws - circular source object', () =>
         {
            const source: Record<string, any> = { value: 42 };

            source.self = source;

            assert.throws(() => [...ObjectUtil.pathKeyIterator(source)], TypeError,
             `pathKeyIterator error: Circular object path detected.`);
         });
      });
   });

   describe('propertyPathIterator:', () =>
   {
      it('yields a dotted string as one property path', () =>
      {
         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator('actor.system.name')],
          ['actor.system.name']
         );
      });

      it('yields an exact property-key array as one property path', () =>
      {
         const symbol = Symbol('metadata');
         const path = ['actor', 0, symbol] as const;

         const result = [...ObjectUtil.propertyPathIterator(path)];

         assert.lengthOf(result, 1);
         assert.strictEqual(result[0], path);
      });

      it('gives a valid property path precedence over iterable interpretation', () =>
      {
         const path = ['actor.name', 'actor.id'];

         const result = [...ObjectUtil.propertyPathIterator(path)];

         assert.lengthOf(result, 1);
         assert.strictEqual(result[0], path);
      });

      it('interprets an all-string array as one exact path', () =>
      {
         const paths = ['actor.name', 'actor.id'];

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths)],
          [
             ['actor.name', 'actor.id']
          ]
         );
      });

      it('yields multiple dotted-string paths from a Set', () =>
      {
         const paths = new Set<PropertyPath>([
            'actor.name',
            'actor.id'
         ]);

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths)],
          [
             'actor.name',
             'actor.id'
          ]
         );
      });

      it('yields multiple exact paths from an outer array', () =>
      {
         const paths: PropertyPath[] = [
            ['actor', 'name'],
            ['actor', 'id'],
            ['items', 0, 'name']
         ];

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths)],
          paths
         );
      });

      it('yields mixed dotted and exact paths', () =>
      {
         const symbol = Symbol('metadata');

         const paths: PropertyPath[] = [
            'actor.name',
            ['items', 0, 'name'],
            [symbol, 'enabled']
         ];

         const result = [...ObjectUtil.propertyPathIterator(paths)];

         assert.deepEqual(result, paths);
         assert.strictEqual(result[1], paths[1]);
         assert.strictEqual(result[2], paths[2]);
      });

      it('supports generator input', () =>
      {
         function* paths(): IterableIterator<PropertyPath>
         {
            yield 'actor.name';
            yield ['actor', 'id'];
         }

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths())],
          [
             'actor.name',
             ['actor', 'id']
          ]
         );
      });

      it('supports one-shot iterable input', () =>
      {
         const source = (function*(): IterableIterator<PropertyPath>
         {
            yield 'actor.name';
            yield 'actor.id';
         })();

         const iterator = ObjectUtil.propertyPathIterator(source);

         assert.deepEqual([...iterator], [
            'actor.name',
            'actor.id'
         ]);

         assert.deepEqual([...iterator], []);
      });

      it('preserves source iteration order', () =>
      {
         const paths = new Set<PropertyPath>([
            'z.value',
            'a.value',
            'm.value'
         ]);

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths)],
          [
             'z.value',
             'a.value',
             'm.value'
          ]
         );
      });

      it('returns an empty iterator for an empty iterable', () =>
      {
         const paths = new Set<PropertyPath>();

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths)],
          []
         );
      });

      it('interprets an empty array as an empty iterable', () =>
      {
         const paths: PropertyPath[] = [];

         assert.deepEqual(
          [...ObjectUtil.propertyPathIterator(paths)],
          []
         );
      });

      it('yields paths unchanged without normalization or copying', () =>
      {
         const first = ['actor', 'name'] as const;
         const second = ['actor', 'id'] as const;

         const paths: PropertyPath[] = [first, second];
         const result = [...ObjectUtil.propertyPathIterator(paths)];

         assert.strictEqual(result[0], first);
         assert.strictEqual(result[1], second);
      });

      it('validates iterable entries lazily', () =>
      {
         let steps = 0;

         function* paths(): IterableIterator<any>
         {
            steps++;
            yield 'actor.name';

            steps++;
            yield 42;
         }

         const iterator = ObjectUtil.propertyPathIterator(paths());

         assert.equal(steps, 0);

         assert.deepEqual(iterator.next(), {
            value: 'actor.name',
            done: false
         });

         assert.equal(steps, 1);

         assert.throws(() => iterator.next(), TypeError,
          `propertyPathIterator error: iterable entry at index 1 is not a property path.`);

         assert.equal(steps, 2);
      });

      it('reports the index of an invalid iterable entry', () =>
      {
         const paths = [
            'actor.name',
            ['actor', 'id'],
            null
         ];

         assert.throws(() => [...ObjectUtil.propertyPathIterator(paths as any)], TypeError,
          `propertyPathIterator error: iterable entry at index 2 is not a property path.`);
      });

      it('rejects an iterable containing an empty string path', () =>
      {
         const paths = new Set<any>([
            'actor.name',
            ''
         ]);

         assert.throws(() => [...ObjectUtil.propertyPathIterator(paths)], TypeError,
          `propertyPathIterator error: iterable entry at index 1 is not a property path.`);
      });

      it('rejects an iterable containing an empty array path', () =>
      {
         const paths = new Set<any>([
            'actor.name',
            []
         ]);

         assert.throws(() => [...ObjectUtil.propertyPathIterator(paths)], TypeError,
          `propertyPathIterator error: iterable entry at index 1 is not a property path.`);
      });

      it('rejects an iterable containing invalid path segments', () =>
      {
         const paths = new Set<any>([
            ['actor', 'name'],
            ['actor', null]
         ]);

         assert.throws(() => [...ObjectUtil.propertyPathIterator(paths)], TypeError,
          `propertyPathIterator error: iterable entry at index 1 is not a property path.`);
      });

      it('rejects a non-iterable invalid value during iteration', () =>
      {
         const iterator = ObjectUtil.propertyPathIterator(null);

         assert.throws(() => iterator.next(), TypeError,
          `propertyPathIterator error: 'paths' is not a property path or iterable of property paths.`);
      });

      it('rejects an empty string during iteration', () =>
      {
         // `isIterable` intentionally excludes primitive strings, and the empty string is not a valid PropertyPath.
         const iterator = ObjectUtil.propertyPathIterator('');

         assert.throws(() => iterator.next(), TypeError,
          `propertyPathIterator error: 'paths' is not a property path or iterable of property paths.`);
      });

      it('rejects primitive non-path values', () =>
      {
         for (const value of [void 0, true, 42, Symbol('path')])
         {
            const iterator = ObjectUtil.propertyPathIterator(value as any);

            assert.throws(() => iterator.next(), TypeError,
             `propertyPathIterator error: 'paths' is not a property path or iterable of property paths.`);
         }
      });

      it('returns an IterableIterator of PropertyPath', () =>
      {
         const iterator = ObjectUtil.propertyPathIterator(new Set<PropertyPath>(['actor.name']));

         expectTypeOf(iterator).toEqualTypeOf<IterableIterator<PropertyPath>>();
      });

      it('narrows yielded values to PropertyPath', () =>
      {
         const source: Iterable<PropertyPath> = new Set(['actor.name', ['actor', 'id']]);

         for (const path of ObjectUtil.propertyPathIterator(source))
         {
            expectTypeOf(path).toEqualTypeOf<PropertyPath>();
         }
      });
   });

   describe('safeSet:', () =>
   {
      const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_NUM, { arrayIndex: true })];

      const pathsAsStrings = [...ObjectUtil.pathKeyIterator(s_OBJECT_NUM, { arrayIndex: false })].map(
       (path) => path.join('.'));

      let objectNumCopy = klona(s_OBJECT_NUM);

      beforeEach(() => { objectNumCopy = klona(s_OBJECT_NUM); });

      it('add (path array)', () =>
      {
         for (const path of paths)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'add' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_ADD));
      });

      it('add (path string)', () =>
      {
         for (const path of pathsAsStrings)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'add' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_ADD_NO_ARRAY));
      });

      it('div (path array)', () =>
      {
         for (const path of paths)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'div' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_DIV));
      });

      it('div (path string)', () =>
      {
         for (const path of pathsAsStrings)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'div' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_DIV_NO_ARRAY));
      });

      it('mult (path array)', () =>
      {
         for (const path of paths)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'mult' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_MULT));
      });

      it('mult (path string)', () =>
      {
         for (const path of pathsAsStrings)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'mult' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_MULT_NO_ARRAY));
      });

      it('sub (path array)', () =>
      {
         for (const path of paths)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'sub' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SUB));
      });

      it('sub (path string)', () =>
      {
         for (const path of pathsAsStrings)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 10, { operation: 'sub' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SUB_NO_ARRAY));
      });

      it('set (path array)', () =>
      {
         for (const path of paths)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 'aa');
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SET));
      });

      it('set (path string)', () =>
      {
         for (const path of pathsAsStrings)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, path, 'aa');
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SET_NO_ARRAY));
      });

      it('set-undefined', () =>
      {
         // Add new undefined property.
         (objectNumCopy as any).d = void 0;

         const result = ObjectUtil.safeSet(objectNumCopy, 'd', true, { operation: 'set-undefined' });

         assert.isTrue(result);
         assert.isTrue((objectNumCopy as any).d);
      });

      it('set-undefined preserves an existing defined property', () =>
      {
         objectNumCopy.a = 10;

         const result = ObjectUtil.safeSet(objectNumCopy, 'a', 20, { operation: 'set-undefined' });

         assert.isTrue(result);
         assert.equal(objectNumCopy.a, 10);
      });

      it('no array path / string', () =>
      {
         const result = ObjectUtil.safeSet(objectNumCopy, 'level1.level2.array2.bogus', 'bogus');

         assert.isFalse(result);
         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });

      it('no array path / negative number', () =>
      {
         const result = ObjectUtil.safeSet(objectNumCopy, 'level1.level2.array2.-1', 'bogus');

         assert.isFalse(result);
         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });

      it('no path keys', () =>
      {
         const result = ObjectUtil.safeSet(objectNumCopy, [], 'bogus');

         assert.isFalse(result);
         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });

      it('does not create missing property (top level)', () =>
      {
         assert.isUndefined((objectNumCopy as any)._new);

         const result = ObjectUtil.safeSet(objectNumCopy, '_new', true);

         assert.isFalse(result);
         assert.isUndefined((objectNumCopy as any)._new);
      });

      it('does not create missing property (2nd level)', () =>
      {
         assert.isUndefined((objectNumCopy as any)._new);

         const result = ObjectUtil.safeSet(objectNumCopy, '_new._new', true);

         assert.isFalse(result);
         assert.isUndefined((objectNumCopy as any)._new);
      });

      it('does create missing property (top level)', () =>
      {
         assert.isUndefined((objectNumCopy as any)._new);

         const result = ObjectUtil.safeSet(objectNumCopy, '_new', true, { createMissing: true });

         assert.isTrue(result);
         assert.isTrue((objectNumCopy as any)._new);
      });

      it('does create missing property (2nd level)', () =>
      {
         assert.isUndefined((objectNumCopy as any)._new);

         const result = ObjectUtil.safeSet(objectNumCopy, '_new._new', true, { createMissing: true });

         assert.isTrue(result);
         assert.isObject((objectNumCopy as any)._new);
         assert.isTrue((objectNumCopy as any)._new._new);
      });

      it('rejects prototype-pollution / well known symbols', () =>
      {
         let result = ObjectUtil.safeSet(objectNumCopy, 'level1.__proto__', 'bogus');
         assert.isFalse(result);

         result = ObjectUtil.safeSet(objectNumCopy, 'level1.prototype', 'bogus');
         assert.isFalse(result);

         result = ObjectUtil.safeSet(objectNumCopy, 'level1.constructor', 'bogus');
         assert.isFalse(result);

         result = ObjectUtil.safeSet(objectNumCopy, ['level1', Symbol.toStringTag], 'bogus');
         assert.isFalse(result);

         assert.isTrue(Object.prototype.toString.call(objectNumCopy) === `[object Object]`);

         result = ObjectUtil.safeSet(objectNumCopy, [Symbol.toStringTag], 'bogus');
         assert.isFalse(result);

         assert.isTrue(Object.prototype.toString.call(objectNumCopy) === `[object Object]`);

         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });

      it('returns false when an intermediate value is not traversable', () =>
      {
         const target = {
            level1: 42
         };

         assert.equal(
          ObjectUtil.safeSet(target, 'level1.value', 100),
          false
         );

         assert.deepEqual(target, {
            level1: 42
         });
      });

      it('returns false for a primitive intermediate value with an array path', () =>
      {
         const target = {
            level1: 42
         };

         assert.isFalse(ObjectUtil.safeSet(target, ['level1', 'value'], 100));
      });

      describe('Errors', () =>
      {
         it('throws - data not object', () =>
         {
            // @ts-expect-error
            expect(() => ObjectUtil.safeSet(false, 'foo', 'bar')).throws(TypeError,
             `safeSet error: 'data' is not an object.`);
         });

         it('throws - path is not a string or symbol', () =>
         {
            // @ts-expect-error
            expect(() => ObjectUtil.safeSet({}, false, 'bar')).throws(TypeError,
             `safeSet error: 'path' is not a string or an array of property keys.`);
         });

         it('throws - path is not a string or symbol', () =>
         {
            // @ts-expect-error
            expect(() => ObjectUtil.safeSet({ a: { b: true } }, ['a', false], 'bar')).throws(TypeError,
             `safeSet error: 'path' contains an entry that is not a property key.`);
         });

         it('throws - options.createMissing is not a boolean', () =>
         {
            // @ts-expect-error
            expect(() => ObjectUtil.safeSet({}, 'foo', 'bar', { createMissing: 'bad' })).throws(TypeError,
             `safeSet error: 'options.createMissing' is not a boolean.`);
         });

         it('throws - options.operation is not a string', () =>
         {
            // @ts-expect-error
            expect(() => ObjectUtil.safeSet({}, 'foo', 'bar', { operation: false })).throws(TypeError,
             `safeSet error: 'options.operation' is not a string.`);
         });

         it('throws - Unknown options.operation', () =>
         {
            // @ts-expect-error
            expect(() => ObjectUtil.safeSet({}, 'foo', 'bar', { operation: 'bad' })).throws(Error,
             `safeSet error: Unknown 'options.operation'.`);
         });
      });
   });
});
