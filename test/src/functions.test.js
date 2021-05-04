import { assert } from 'chai';

import * as ObjectUtil from '../../src/functions.js';

const s_OBJECT_DEEP =
{
   skipFreeze: { s1: ['a'] },
   a: { a1: [{ e1: 1 }] },
   b: { b1: 2 },
   c: [{ c1: 3 }],
   array: [[{ ae1: 'a' }], [{ ae2: 'b' }], [{ ae3: 'c' }]],
   level1:
   {
      skipFreeze: { s2: ['b'] },
      d: { d1: [{ e1: 4 }] },
      e: { e1: 5 },
      f: [{ f1: 6 }],
      array1: [[{ ae1: 'd' }], [{ ae2: 'e' }], [{ ae3: 'f' }]],
      level2:
      {
         skipFreeze: { s3: ['c'] },
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

const s_OBJECT_MIXED_ORIG = JSON.parse(JSON.stringify(s_OBJECT_MIXED));

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

const s_VERIFY_DEPTH_TRAVERSE = `[1,2,3,"a","b","c",4,5,6,"d","e","f",7,8,9,"g","h","i"]`;

const s_VERIFY_ACCESSOR_LIST = `["a","b","c","array.0","array.1","array.2","level1.d","level1.e","level1.f","level1.array1.0","level1.array1.1","level1.array1.2","level1.level2.g","level1.level2.h","level1.level2.i","level1.level2.array2.0","level1.level2.array2.1","level1.level2.array2.2"]`;

const s_VERIFY_SAFESET_SET = `{"a":"aa","b":"aa","c":"aa","array":["aa","aa","aa"],"level1":{"d":"aa","e":"aa","f":"aa","array1":["aa","aa","aa"],"level2":{"g":"aa","h":"aa","i":"aa","array2":["aa","aa","aa"]}}}`;
const s_VERIFY_SAFESET_ADD = `{"a":20,"b":20,"c":20,"array":[20,20,20],"level1":{"d":20,"e":20,"f":20,"array1":[20,20,20],"level2":{"g":20,"h":20,"i":20,"array2":[20,20,20]}}}`;
const s_VERIFY_SAFESET_DIV = `{"a":1,"b":1,"c":1,"array":[1,1,1],"level1":{"d":1,"e":1,"f":1,"array1":[1,1,1],"level2":{"g":1,"h":1,"i":1,"array2":[1,1,1]}}}`;
const s_VERIFY_SAFESET_MULT = `{"a":100,"b":100,"c":100,"array":[100,100,100],"level1":{"d":100,"e":100,"f":100,"array1":[100,100,100],"level2":{"g":100,"h":100,"i":100,"array2":[100,100,100]}}}`;
const s_VERIFY_SAFESET_SUB = `{"a":0,"b":0,"c":0,"array":[0,0,0],"level1":{"d":0,"e":0,"f":0,"array1":[0,0,0],"level2":{"g":0,"h":0,"i":0,"array2":[0,0,0]}}}`;

describe('ObjectUtil:', () =>
{
   it('deepFreeze:', () =>
   {
      ObjectUtil.deepFreeze(s_OBJECT_DEEP, ['skipFreeze']);

      // Verify not frozen
      assert.isFalse(Object.isFrozen(s_OBJECT_DEEP.skipFreeze));
      assert.isFalse(Object.isFrozen(s_OBJECT_DEEP.skipFreeze.s1));
      assert.isFalse(Object.isFrozen(s_OBJECT_DEEP.level1.skipFreeze));
      assert.isFalse(Object.isFrozen(s_OBJECT_DEEP.level1.skipFreeze.s2));
      assert.isFalse(Object.isFrozen(s_OBJECT_DEEP.level1.level2.skipFreeze));
      assert.isFalse(Object.isFrozen(s_OBJECT_DEEP.level1.level2.skipFreeze.s3));

      // Verify frozen
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP));

      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.a));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.a.a1));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.a.a1[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.b));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.c));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.c[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array[0][0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array[1]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array[1][0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array[2]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.array[2][0]));

      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.d));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.d.d1));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.d.d1[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.e));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.f));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.f[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1[0][0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1[1]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1[1][0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1[2]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.array1[2][0]));

      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.g));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.g.g1));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.g.g1[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.h));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.i));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.i[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2[0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2[0][0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2[1]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2[1][0]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2[2]));
      assert.isTrue(Object.isFrozen(s_OBJECT_DEEP.level1.level2.array2[2][0]));

      // Make sure pushing to arrays fails.
      assert.throws(() => { s_OBJECT_DEEP.a.a1.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.c.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.array.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.array[0].push(1); });
      assert.throws(() => { s_OBJECT_DEEP.array[1].push(1); });
      assert.throws(() => { s_OBJECT_DEEP.array[2].push(1); });

      assert.throws(() => { s_OBJECT_DEEP.level1.d.d1.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.f.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.array1.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.array1[0].push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.array1[1].push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.array1[2].push(1); });

      assert.throws(() => { s_OBJECT_DEEP.level1.level2.g.g1.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.level2.i.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.level2.array2.push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.level2.array2[0].push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.level2.array2[1].push(1); });
      assert.throws(() => { s_OBJECT_DEEP.level1.level2.array2[2].push(1); });
   });

   it('depthTraverse:', () =>
   {
      const output = [];

      ObjectUtil.depthTraverse(s_OBJECT_MIXED, (data) => output.push(data));

      assert.deepEqual(output, JSON.parse(s_VERIFY_DEPTH_TRAVERSE));
      assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
   });

   it('getAccessorList:', () =>
   {
      const accessors = ObjectUtil.getAccessorList(s_OBJECT_MIXED);

      assert.deepEqual(accessors, JSON.parse(s_VERIFY_ACCESSOR_LIST));
      assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
   });

   it('isIterable:', () =>
   {
      assert.isFalse(ObjectUtil.isIterable(false));
      assert.isFalse(ObjectUtil.isIterable(null));
      assert.isFalse(ObjectUtil.isIterable({}));
      assert.isFalse(ObjectUtil.isIterable(''));
      assert.isFalse(ObjectUtil.isIterable((async function *generator() {})()));

      assert.isTrue(ObjectUtil.isIterable(new Set('a')));
      assert.isTrue(ObjectUtil.isIterable((function *generator() {})()));
   });

   it('isIterableAsync:', () =>
   {
      assert.isFalse(ObjectUtil.isIterableAsync(false));
      assert.isFalse(ObjectUtil.isIterableAsync(null));
      assert.isFalse(ObjectUtil.isIterableAsync({}));
      assert.isFalse(ObjectUtil.isIterableAsync(''));
      assert.isFalse(ObjectUtil.isIterableAsync(new Set('a')));
      assert.isFalse(ObjectUtil.isIterableAsync((function *generator() {})()));

      assert.isTrue(ObjectUtil.isIterableAsync((async function *generator() {})()));
   });

   it('isObject', () =>
   {
      assert.isFalse(ObjectUtil.isObject(false));
      assert.isFalse(ObjectUtil.isObject(null));
      assert.isFalse(ObjectUtil.isObject(void 0));

      assert.isTrue(ObjectUtil.isObject({}));
   });

   it('objectKeys', () =>
   {
      assert.deepEqual(ObjectUtil.objectKeys(false), []);
      assert.deepEqual(ObjectUtil.objectKeys(null), []);
      assert.deepEqual(ObjectUtil.objectKeys(void 0), []);
      assert.deepEqual(ObjectUtil.objectKeys({}), []);
      assert.deepEqual(ObjectUtil.objectKeys({ value: true }), ['value']);
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

   it('safeAccess:', () =>
   {
      const output = [];
      const accessors = ObjectUtil.getAccessorList(s_OBJECT_MIXED);

      for (const accessor of accessors)
      { output.push(ObjectUtil.safeAccess(s_OBJECT_MIXED, accessor)); }

      assert.deepEqual(output, JSON.parse(s_VERIFY_DEPTH_TRAVERSE));
      assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
   });

   it('safeEqual:', () =>
   {
      assert.isTrue(ObjectUtil.safeEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG));

      assert.isFalse(ObjectUtil.safeEqual(s_OBJECT_MIXED, { a: 2 }));

      assert.isFalse(ObjectUtil.safeEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ONE_MOD));

      assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
   });

   describe('safeAccess:', () =>
   {
      const accessors = ObjectUtil.getAccessorList(s_OBJECT_NUM);

      let objectNumCopy;

      beforeEach(() => { objectNumCopy = JSON.parse(JSON.stringify(s_OBJECT_NUM)); });

      it('set', () =>
      {
         for (const accessor of accessors)
         { ObjectUtil.safeSet(objectNumCopy, accessor, 'aa'); }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SET));
      });

      it('add', () =>
      {
         for (const accessor of accessors)
         { ObjectUtil.safeSet(objectNumCopy, accessor, 10, 'add'); }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_ADD));
      });

      it('div', () =>
      {
         for (const accessor of accessors)
         { ObjectUtil.safeSet(objectNumCopy, accessor, 10, 'div'); }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_DIV));
      });

      it('mult', () =>
      {
         for (const accessor of accessors)
         { ObjectUtil.safeSet(objectNumCopy, accessor, 10, 'mult'); }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_MULT));
      });

      it('sub', () =>
      {
         for (const accessor of accessors)
         { ObjectUtil.safeSet(objectNumCopy, accessor, 10, 'sub'); }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SUB));
      });

      it('no array accessor / string', () =>
      {
         ObjectUtil.safeSet(objectNumCopy, 'level1.level2.array2.bogus', 'bogus');

         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });

      it('no array accessor / negative number', () =>
      {
         ObjectUtil.safeSet(objectNumCopy, 'level1.level2.array2.-1', 'bogus');

         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });
   });

   describe('validate:', () =>
   {
      describe('invalid throws:', () =>
      {
         it('array (1 / throws)', () =>
         {
            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'array' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'array' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'array' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'array' } }));
         });

         it('entry (1 / throws)', () =>
         {
            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'entry', type: 'string' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', type: 'string' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: new Set(['a']) } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: ['a'] } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: (v) => v === 2 } }));
         });

         it('entry|array (1 / throws)', () =>
         {
            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'entry|array', type: 'string' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', type: 'string' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', expected: new Set(['a']) } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', expected: ['a'] } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', expected: (v) => v === 2 } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: true, test: 'entry|array', type: 'number' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', type: 'number' } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', expected: new Set([10]) } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', expected: [10] } }));

            assert.throws(() => ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', expected: (v) => (typeof v === 'number') } }));
         });
      });

      describe('invalid return:', () =>
      {
         it('entry (1 / false)', () =>
         {
            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'entry', type: 'string', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', type: 'string', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: new Set(['a']), error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: ['a'], error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: (v) => v === 2, error: false } }));
         });

         it('entry|array (1 / false)', () =>
         {
            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'entry|array', type: 'string', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', type: 'string', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', expected: new Set(['a']), error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', expected: ['a'], error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry|array', expected: (v) => v === 2, error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: true, test: 'entry|array', type: 'number', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', type: 'number', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', expected: new Set([10]), error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', expected: [10], error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry|array', expected: (v) => (typeof v === 'number'),
              error: false } }));
         });
      });

      describe('valid:', () =>
      {
         it('array is entry (1 / false)', () =>
         {
            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'array', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'array', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'array', error: false } }));

            assert.isFalse(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'array', error: false } }));
         });

         it('entry is array (1 / true)', () =>
         {
            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: true, test: 'entry', error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry', error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry', error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { array: { required: false, test: 'entry', error: false } }));
         });

         it('entry (1 / true)', () =>
         {
            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: true, test: 'entry', type: 'number', error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', type: 'number', error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: new Set([1, 2]), error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: [1, 2], error: false } }));

            assert.isTrue(ObjectUtil.validate(s_OBJECT_MIXED,
             { a: { required: false, test: 'entry', expected: (v) => v === 1, error: false } }));
         });
      });
   });
});
