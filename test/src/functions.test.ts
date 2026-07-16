import { expectTypeOf } from 'vitest';

import * as ObjectUtil  from '../../src/functions';

import { klona }        from '../../src';

/**
 * For visual no-op type erasure tests.
 */
interface NoOpObj { a?: number }

const s_OBJECT_DEEP =
{
   skipKey: { s1: ['a'] },
   a: { a1: [{ e1: 1 }] },
   b: { b1: 2 },
   c: [{ c1: 3 }],
   array: [[{ ae1: 'a' }], [{ ae2: 'b' }], [{ ae3: 'c' }]],
   level1:
   {
      skipKey: { s2: ['b'] },
      d: { d1: [{ e1: 4 }] },
      e: { e1: 5 },
      f: [{ f1: 6 }],
      array1: [[{ ae1: 'd' }], [{ ae2: 'e' }], [{ ae3: 'f' }]],
      level2:
      {
         skipKey: { s3: ['c'] },
         g: { g1: [{ e1: 7 }] },
         h: { h1: 8 },
         i: [{ i1: 9 }],
         array2: [[{ ae1: 'g' }], [{ ae2: 'h' }], [{ ae3: 'i' }]]
      }
   }
};

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
      expectTypeOf(val).toEqualTypeOf<NoOpObj & Record<string, unknown>>();
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
      it('with skipKeys:', () =>
      {
         const testObj = klona(s_OBJECT_DEEP);

         ObjectUtil.deepFreeze(testObj, { skipKeys: new Set(['skipKey']) });

         // Verify not frozen
         assert.isFalse(Object.isFrozen(testObj.skipKey));
         assert.isFalse(Object.isFrozen(testObj.skipKey.s1));
         assert.isFalse(Object.isFrozen(testObj.level1.skipKey));
         assert.isFalse(Object.isFrozen(testObj.level1.skipKey.s2));
         assert.isFalse(Object.isFrozen(testObj.level1.level2.skipKey));
         assert.isFalse(Object.isFrozen(testObj.level1.level2.skipKey.s3));

         // Verify frozen
         assert.isTrue(Object.isFrozen(testObj));

         assert.isTrue(Object.isFrozen(testObj.a));
         assert.isTrue(Object.isFrozen(testObj.a.a1));
         assert.isTrue(Object.isFrozen(testObj.a.a1[0]));
         assert.isTrue(Object.isFrozen(testObj.b));
         assert.isTrue(Object.isFrozen(testObj.c));
         assert.isTrue(Object.isFrozen(testObj.c[0]));
         assert.isTrue(Object.isFrozen(testObj.array));
         assert.isTrue(Object.isFrozen(testObj.array[0]));
         assert.isTrue(Object.isFrozen(testObj.array[0][0]));
         assert.isTrue(Object.isFrozen(testObj.array[1]));
         assert.isTrue(Object.isFrozen(testObj.array[1][0]));
         assert.isTrue(Object.isFrozen(testObj.array[2]));
         assert.isTrue(Object.isFrozen(testObj.array[2][0]));

         assert.isTrue(Object.isFrozen(testObj.level1));
         assert.isTrue(Object.isFrozen(testObj.level1.d));
         assert.isTrue(Object.isFrozen(testObj.level1.d.d1));
         assert.isTrue(Object.isFrozen(testObj.level1.d.d1[0]));
         assert.isTrue(Object.isFrozen(testObj.level1.e));
         assert.isTrue(Object.isFrozen(testObj.level1.f));
         assert.isTrue(Object.isFrozen(testObj.level1.f[0]));
         assert.isTrue(Object.isFrozen(testObj.level1.array1));
         assert.isTrue(Object.isFrozen(testObj.level1.array1[0]));
         assert.isTrue(Object.isFrozen(testObj.level1.array1[0][0]));
         assert.isTrue(Object.isFrozen(testObj.level1.array1[1]));
         assert.isTrue(Object.isFrozen(testObj.level1.array1[1][0]));
         assert.isTrue(Object.isFrozen(testObj.level1.array1[2]));
         assert.isTrue(Object.isFrozen(testObj.level1.array1[2][0]));

         assert.isTrue(Object.isFrozen(testObj.level1.level2));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.g));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.g.g1));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.g.g1[0]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.h));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.i));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.i[0]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2[0]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2[0][0]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2[1]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2[1][0]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2[2]));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.array2[2][0]));

         // Make sure pushing to arrays fails.
                                                                                 // @ts-expect-error
         assert.throws(() => { testObj.a.a1.push(1); });                         // @ts-expect-error
         assert.throws(() => { testObj.c.push(1); });                            // @ts-expect-error
         assert.throws(() => { testObj.array.push(1); });                        // @ts-expect-error
         assert.throws(() => { testObj.array[0].push(1); });                     // @ts-expect-error
         assert.throws(() => { testObj.array[1].push(1); });                     // @ts-expect-error
         assert.throws(() => { testObj.array[2].push(1); });
                                                                                 // @ts-expect-error
         assert.throws(() => { testObj.level1.d.d1.push(1); });                  // @ts-expect-error
         assert.throws(() => { testObj.level1.f.push(1); });                     // @ts-expect-error
         assert.throws(() => { testObj.level1.array1.push(1); });                // @ts-expect-error
         assert.throws(() => { testObj.level1.array1[0].push(1); });             // @ts-expect-error
         assert.throws(() => { testObj.level1.array1[1].push(1); });             // @ts-expect-error
         assert.throws(() => { testObj.level1.array1[2].push(1); });             // @ts-expect-error

         assert.throws(() => { testObj.level1.level2.g.g1.push(1); });           // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.i.push(1); });              // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2.push(1); });         // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2[0].push(1); });      // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2[1].push(1); });      // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2[2].push(1); });
      });

      it('without skipKeys:', () => {
         const testObj = klona(s_OBJECT_DEEP);

         ObjectUtil.deepFreeze(testObj);

         // Verify frozen
         assert.isTrue(Object.isFrozen(testObj.skipKey));
         assert.isTrue(Object.isFrozen(testObj.skipKey.s1));
         assert.isTrue(Object.isFrozen(testObj.level1.skipKey));
         assert.isTrue(Object.isFrozen(testObj.level1.skipKey.s2));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.skipKey));
         assert.isTrue(Object.isFrozen(testObj.level1.level2.skipKey.s3));
      });

      it('skips already frozen keys:', () => {
         const result = ObjectUtil.deepFreeze({ a: Object.freeze({ b: true }) });

         // Verify frozen
         assert.isTrue(Object.isFrozen(result));
         assert.isTrue(Object.isFrozen(result.a));
      });

      describe('Errors', () =>
      {
         it('throws - data not object', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepFreeze('bad'), TypeError,
             `deepFreeze error: 'data' is not an object or array.`);
         });

         it('throws - options.skipKeys is not a Set', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepFreeze({}, { skipKeys: 'bad' }), TypeError,
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
             `deepMerge error: 'target' is not an object.`);
         });

         it('throws - no source object', () =>
         {
            assert.throws(() => ObjectUtil.deepMerge({}), TypeError,
             `deepMerge error: 'sourceObj' is not an object.`);
         });

         it('throws - source not object (string)', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepMerge({}, 'bad'), TypeError,
             `deepMerge error: 'sourceObj[0]' is not an object.`);
         });

         it('throws - source not object (array)', () =>
         {
            assert.throws(() => ObjectUtil.deepMerge({}, [1, 2]), TypeError,
             `deepMerge error: 'sourceObj[0]' is not an object.`);
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
      it('with skipKeys:', () =>
      {
         const testObj = klona(s_OBJECT_DEEP);

         ObjectUtil.deepSeal(testObj, { skipKeys: new Set(['skipKey']) });

         // Verify not sealed
         assert.isFalse(Object.isSealed(testObj.skipKey));
         assert.isFalse(Object.isSealed(testObj.skipKey.s1));
         assert.isFalse(Object.isSealed(testObj.level1.skipKey));
         assert.isFalse(Object.isSealed(testObj.level1.skipKey.s2));
         assert.isFalse(Object.isSealed(testObj.level1.level2.skipKey));
         assert.isFalse(Object.isSealed(testObj.level1.level2.skipKey.s3));

         // Verify sealed
         assert.isTrue(Object.isSealed(testObj));

         assert.isTrue(Object.isSealed(testObj.a));
         assert.isTrue(Object.isSealed(testObj.a.a1));
         assert.isTrue(Object.isSealed(testObj.a.a1[0]));
         assert.isTrue(Object.isSealed(testObj.b));
         assert.isTrue(Object.isSealed(testObj.c));
         assert.isTrue(Object.isSealed(testObj.c[0]));
         assert.isTrue(Object.isSealed(testObj.array));
         assert.isTrue(Object.isSealed(testObj.array[0]));
         assert.isTrue(Object.isSealed(testObj.array[0][0]));
         assert.isTrue(Object.isSealed(testObj.array[1]));
         assert.isTrue(Object.isSealed(testObj.array[1][0]));
         assert.isTrue(Object.isSealed(testObj.array[2]));
         assert.isTrue(Object.isSealed(testObj.array[2][0]));

         assert.isTrue(Object.isSealed(testObj.level1));
         assert.isTrue(Object.isSealed(testObj.level1.d));
         assert.isTrue(Object.isSealed(testObj.level1.d.d1));
         assert.isTrue(Object.isSealed(testObj.level1.d.d1[0]));
         assert.isTrue(Object.isSealed(testObj.level1.e));
         assert.isTrue(Object.isSealed(testObj.level1.f));
         assert.isTrue(Object.isSealed(testObj.level1.f[0]));
         assert.isTrue(Object.isSealed(testObj.level1.array1));
         assert.isTrue(Object.isSealed(testObj.level1.array1[0]));
         assert.isTrue(Object.isSealed(testObj.level1.array1[0][0]));
         assert.isTrue(Object.isSealed(testObj.level1.array1[1]));
         assert.isTrue(Object.isSealed(testObj.level1.array1[1][0]));
         assert.isTrue(Object.isSealed(testObj.level1.array1[2]));
         assert.isTrue(Object.isSealed(testObj.level1.array1[2][0]));

         assert.isTrue(Object.isSealed(testObj.level1.level2));
         assert.isTrue(Object.isSealed(testObj.level1.level2.g));
         assert.isTrue(Object.isSealed(testObj.level1.level2.g.g1));
         assert.isTrue(Object.isSealed(testObj.level1.level2.g.g1[0]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.h));
         assert.isTrue(Object.isSealed(testObj.level1.level2.i));
         assert.isTrue(Object.isSealed(testObj.level1.level2.i[0]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2[0]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2[0][0]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2[1]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2[1][0]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2[2]));
         assert.isTrue(Object.isSealed(testObj.level1.level2.array2[2][0]));

         // Make sure pushing to arrays fails.
                                                                                 // @ts-expect-error
         assert.throws(() => { testObj.a.a1.push(1); });                         // @ts-expect-error
         assert.throws(() => { testObj.c.push(1); });                            // @ts-expect-error
         assert.throws(() => { testObj.array.push(1); });                        // @ts-expect-error
         assert.throws(() => { testObj.array[0].push(1); });                     // @ts-expect-error
         assert.throws(() => { testObj.array[1].push(1); });                     // @ts-expect-error
         assert.throws(() => { testObj.array[2].push(1); });
                                                                                 // @ts-expect-error
         assert.throws(() => { testObj.level1.d.d1.push(1); });                  // @ts-expect-error
         assert.throws(() => { testObj.level1.f.push(1); });                     // @ts-expect-error
         assert.throws(() => { testObj.level1.array1.push(1); });                // @ts-expect-error
         assert.throws(() => { testObj.level1.array1[0].push(1); });             // @ts-expect-error
         assert.throws(() => { testObj.level1.array1[1].push(1); });             // @ts-expect-error
         assert.throws(() => { testObj.level1.array1[2].push(1); });             // @ts-expect-error

         assert.throws(() => { testObj.level1.level2.g.g1.push(1); });           // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.i.push(1); });              // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2.push(1); });         // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2[0].push(1); });      // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2[1].push(1); });      // @ts-expect-error
         assert.throws(() => { testObj.level1.level2.array2[2].push(1); });
      });

      it('without skipKeys:', () => {
         const testObj = klona(s_OBJECT_DEEP);

         ObjectUtil.deepSeal(testObj);

         // Verify frozen
         assert.isTrue(Object.isSealed(testObj.skipKey));
         assert.isTrue(Object.isSealed(testObj.skipKey.s1));
         assert.isTrue(Object.isSealed(testObj.level1.skipKey));
         assert.isTrue(Object.isSealed(testObj.level1.skipKey.s2));
         assert.isTrue(Object.isSealed(testObj.level1.level2.skipKey));
         assert.isTrue(Object.isSealed(testObj.level1.level2.skipKey.s3));
      });

      it('skips already sealed keys:', () => {
         const result = ObjectUtil.deepSeal({ a: Object.seal({ b: true }) });

         // Verify frozen
         assert.isTrue(Object.isSealed(result));
         assert.isTrue(Object.isSealed(result.a));
      });

      describe('Errors', () =>
      {
         it('throws - data not object', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepSeal('bad'), TypeError,
             `deepSeal error: 'data' is not an object or array.`);
         });

         it('throws - options.skipKeys is not a Set', () =>
         {
            // @ts-expect-error
            assert.throws(() => ObjectUtil.deepSeal({}, { skipKeys: 'bad' }), TypeError,
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
         const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_MIXED)];

         for (const path of paths) { output.push(ObjectUtil.safeAccess(s_OBJECT_MIXED, path)); }

         assert.deepEqual(output, JSON.parse(s_VERIFY_DEPTH_TRAVERSE));
         assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
      });

      it('symbols', () =>
      {
         const result = ObjectUtil.safeAccess(s_OBJECT_SYM, [s_SYMBOL_LEVEL1, s_SYMBOL_LEVEL2]);
         assert.isTrue(result);
      });

      it('base array', () =>
      {
         const array = [true, false, true];

         assert.isTrue(ObjectUtil.safeAccess(array, [0]));
         assert.isFalse(ObjectUtil.safeAccess(array, [1]));
         assert.isTrue(ObjectUtil.safeAccess(array, [2]));
      });

      it('returns the default for primitive intermediate values', () =>
      {
         assert.equal(ObjectUtil.safeAccess({ value: 42 }, 'value.test', null), null);
         assert.equal(ObjectUtil.safeAccess({ value: true }, 'value.test', null), null);
         assert.equal(ObjectUtil.safeAccess({ value: 'text' }, 'value.test', null), null);
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
         assert.isFalse(ObjectUtil.safeEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ONE_MOD));
      });

      it('distinguishes missing, undefined, null, arrays, and symbols', () =>
      {
         const symbol = Symbol('value');

         assert.equal(ObjectUtil.safeEqual({ value: void 0 }, {}), false);
         assert.equal(ObjectUtil.safeEqual({ value: void 0 }, { value: void 0 }), true);

         assert.equal(ObjectUtil.safeEqual({ value: null }, {}), false);
         assert.equal(ObjectUtil.safeEqual({ value: null }, { value: null }), true);

         assert.equal(ObjectUtil.safeEqual({ values: [void 0] }, { values: new Array(1) }), false);
         assert.equal(ObjectUtil.safeEqual({ values: ['a'] }, { values: ['a'] }), true);
         assert.equal(ObjectUtil.safeEqual({ values: ['a'] }, { values: [] }), false);

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
         const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_MIXED)];
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
         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], [[0], [1], [2]]);
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

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], [[key, 0], [key, 1]]);
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

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], [[0]]);
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

         assert.deepStrictEqual([...ObjectUtil.pathKeyIterator(data)], [
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

      describe('Errors', () =>
      {
         it('throws - data not object', () =>
         {
            // @ts-expect-error
            expect(() => [...ObjectUtil.pathKeyIterator(false)]).throws(TypeError,
             `pathKeyIterator error: 'data' is not an object.`);
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

         it('throws - circular source object', () =>
         {
            const source: Record<string, any> = { value: 42 };

            source.self = source;

            assert.throws(() => [...ObjectUtil.pathKeyIterator(source)], TypeError,
             `pathKeyIterator error: Circular object path detected.`);
         });
      });
   });

   describe('safeSet:', () =>
   {
      const paths = [...ObjectUtil.pathKeyIterator(s_OBJECT_NUM)];

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
