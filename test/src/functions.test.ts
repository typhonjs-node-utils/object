import * as ObjectUtil from '../../src/functions';

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
const s_VERIFY_ACCESSOR_LIST_NO_ARRAY = `["a","b","c","level1.d","level1.e","level1.f","level1.level2.g","level1.level2.h","level1.level2.i"]`;

const s_VERIFY_SAFESET_SET = `{"a":"aa","b":"aa","c":"aa","array":["aa","aa","aa"],"level1":{"d":"aa","e":"aa","f":"aa","array1":["aa","aa","aa"],"level2":{"g":"aa","h":"aa","i":"aa","array2":["aa","aa","aa"]}}}`;
const s_VERIFY_SAFESET_ADD = `{"a":20,"b":20,"c":20,"array":[20,20,20],"level1":{"d":20,"e":20,"f":20,"array1":[20,20,20],"level2":{"g":20,"h":20,"i":20,"array2":[20,20,20]}}}`;
const s_VERIFY_SAFESET_DIV = `{"a":1,"b":1,"c":1,"array":[1,1,1],"level1":{"d":1,"e":1,"f":1,"array1":[1,1,1],"level2":{"g":1,"h":1,"i":1,"array2":[1,1,1]}}}`;
const s_VERIFY_SAFESET_MULT = `{"a":100,"b":100,"c":100,"array":[100,100,100],"level1":{"d":100,"e":100,"f":100,"array1":[100,100,100],"level2":{"g":100,"h":100,"i":100,"array2":[100,100,100]}}}`;
const s_VERIFY_SAFESET_SUB = `{"a":0,"b":0,"c":0,"array":[0,0,0],"level1":{"d":0,"e":0,"f":0,"array1":[0,0,0],"level2":{"g":0,"h":0,"i":0,"array2":[0,0,0]}}}`;

describe('ObjectUtil:', () =>
{
   it('deepFreeze w/ skipKeys:', () =>
   {
      const testObj = ObjectUtil.klona(s_OBJECT_DEEP);

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

   it('deepFreeze without skipKeys:', () => {
      const testObj = ObjectUtil.klona(s_OBJECT_DEEP);

      ObjectUtil.deepFreeze(testObj);

      // Verify frozen
      assert.isTrue(Object.isFrozen(testObj.skipKey));
      assert.isTrue(Object.isFrozen(testObj.skipKey.s1));
      assert.isTrue(Object.isFrozen(testObj.level1.skipKey));
      assert.isTrue(Object.isFrozen(testObj.level1.skipKey.s2));
      assert.isTrue(Object.isFrozen(testObj.level1.level2.skipKey));
      assert.isTrue(Object.isFrozen(testObj.level1.level2.skipKey.s3));
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
   });

   it('deepSeal w/ skipKeys:', () =>
   {
      const testObj = ObjectUtil.klona(s_OBJECT_DEEP);

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

   it('deepSeal without skipKeys:', () => {
      const testObj = ObjectUtil.klona(s_OBJECT_DEEP);

      ObjectUtil.deepSeal(testObj);

      // Verify frozen
      assert.isTrue(Object.isSealed(testObj.skipKey));
      assert.isTrue(Object.isSealed(testObj.skipKey.s1));
      assert.isTrue(Object.isSealed(testObj.level1.skipKey));
      assert.isTrue(Object.isSealed(testObj.level1.skipKey.s2));
      assert.isTrue(Object.isSealed(testObj.level1.level2.skipKey));
      assert.isTrue(Object.isSealed(testObj.level1.level2.skipKey.s3));
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

   describe('hasAccessor:', () =>
   {
      it('top level', () =>
      {
         const data = {
            get test() { return 0; },
            get bad() { return 1; },

            set test(val) { } // eslint-disable-line no-unused-vars
         }

         assert.isFalse(ObjectUtil.hasAccessor({}, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(null, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(void 0, 'nope'));
         assert.isFalse(ObjectUtil.hasAccessor(() => void 0, 'nope'));
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

         assert.isFalse(ObjectUtil.hasGetter({}, 'nope'));
         assert.isFalse(ObjectUtil.hasGetter(null, 'nope'));
         assert.isFalse(ObjectUtil.hasGetter(void 0, 'nope'));
         assert.isFalse(ObjectUtil.hasGetter(() => void 0, 'nope'));
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

         assert.isFalse(ObjectUtil.hasGetter(instance, 'nope'));

         assert.isTrue(ObjectUtil.hasGetter(instance, 'test'));
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

         assert.isFalse(ObjectUtil.hasSetter({}, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(null, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(void 0, 'nope'));
         assert.isFalse(ObjectUtil.hasSetter(() => void 0, 'nope'));
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

      assert.isTrue(ObjectUtil.isIterable('123'));
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

      assert.isTrue(ObjectUtil.isAsyncIterable((async function *generator() {})()));
   });

   it('isObject', () =>
   {
      assert.isFalse(ObjectUtil.isObject(false));
      assert.isFalse(ObjectUtil.isObject(null));
      assert.isFalse(ObjectUtil.isObject(void 0));

      assert.isTrue(ObjectUtil.isObject({}));
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
   });

   it('isPlainObjectEmpty', () =>
   {
      class Test {}

      assert.isFalse(ObjectUtil.isPlainObjectEmpty(false));
      assert.isFalse(ObjectUtil.isPlainObjectEmpty(null));
      assert.isFalse(ObjectUtil.isPlainObjectEmpty(void 0));
      assert.isFalse(ObjectUtil.isPlainObjectEmpty(new String('test')));
      assert.isFalse(ObjectUtil.isPlainObjectEmpty(new Test()));
      assert.isFalse(ObjectUtil.isPlainObjectEmpty({ foo: 'bar ' }));

      assert.isTrue(ObjectUtil.isPlainObjectEmpty({}));
      assert.isTrue(ObjectUtil.isPlainObjectEmpty(Object.create(null)));
      assert.isTrue(ObjectUtil.isPlainObjectEmpty(new Object())); // eslint-disable-line no-new-object
   });

   it('objectKeys', () =>
   {
      // @ts-expect-error
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

   describe('safeAccess:', () =>
   {
      it('all mixed accessors', () =>
      {
         const output = [];
         const accessors = [...ObjectUtil.safeKeyIterator(s_OBJECT_MIXED)];

         for (const accessor of accessors) { output.push(ObjectUtil.safeAccess(s_OBJECT_MIXED, accessor)); }

         assert.deepEqual(output, JSON.parse(s_VERIFY_DEPTH_TRAVERSE));
         assert.deepEqual(s_OBJECT_MIXED, s_OBJECT_MIXED_ORIG);
      });

      it('default value conditions', () =>
      {
         assert.equal(ObjectUtil.safeAccess(null, '', 'defaultValue'), 'defaultValue');
         assert.equal(ObjectUtil.safeAccess({}, null, 'defaultValue'), 'defaultValue');
         assert.equal(ObjectUtil.safeAccess({ a: null }, 'a', 'defaultValue'), 'defaultValue');
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
   });

   describe('safeKeyIterator:', () =>
   {
      it('all accessors', () =>
      {
         const accessors = [...ObjectUtil.safeKeyIterator(s_OBJECT_MIXED)];
         assert.deepEqual(accessors, JSON.parse(s_VERIFY_ACCESSOR_LIST));
      });

      it('options.arrayIndex (false)', () =>
      {
         const accessors = [...ObjectUtil.safeKeyIterator(s_OBJECT_MIXED, { arrayIndex: false })];
         assert.deepEqual(accessors, JSON.parse(s_VERIFY_ACCESSOR_LIST_NO_ARRAY));
      });

      it('options.hasOwnOnly', () =>
      {
         class Test {}
         Object.defineProperty(Test.prototype, 'a', {
            value: 1,
            enumerable: true
         });

         assert.deepEqual([...ObjectUtil.safeKeyIterator(new Test(), { hasOwnOnly: true })], []);
         assert.deepEqual([...ObjectUtil.safeKeyIterator(new Test(), { hasOwnOnly: false })], ['a']);
      });
   });

   describe('safeSet:', () =>
   {
      const accessors = [...ObjectUtil.safeKeyIterator(s_OBJECT_NUM)];

      let objectNumCopy = ObjectUtil.klona(s_OBJECT_NUM);

      beforeEach(() => { objectNumCopy = ObjectUtil.klona(s_OBJECT_NUM); });

      it('add', () =>
      {
         for (const accessor of accessors)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, accessor, 10, { operation: 'add' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_ADD));
      });

      it('div', () =>
      {
         for (const accessor of accessors)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, accessor, 10, { operation: 'div' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_DIV));
      });

      it('mult', () =>
      {
         for (const accessor of accessors)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, accessor, 10, { operation: 'mult' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_MULT));
      });

      it('sub', () =>
      {
         for (const accessor of accessors)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, accessor, 10, { operation: 'sub' });
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SUB));
      });

      it('set', () =>
      {
         for (const accessor of accessors)
         {
            const result = ObjectUtil.safeSet(objectNumCopy, accessor, 'aa');
            assert.isTrue(result);
         }

         assert.deepEqual(objectNumCopy, JSON.parse(s_VERIFY_SAFESET_SET));
      });

      it('set-undefined', () =>
      {
         // Add new undefined property.
         (objectNumCopy as any).d = void 0;

         const result = ObjectUtil.safeSet(objectNumCopy, 'd', true, { operation: 'set-undefined' });

         assert.isTrue(result);
         assert.isTrue((objectNumCopy as any).d);
      });

      it('no array accessor / string', () =>
      {
         const result = ObjectUtil.safeSet(objectNumCopy, 'level1.level2.array2.bogus', 'bogus');

         assert.isFalse(result);
         assert.deepEqual(objectNumCopy, s_OBJECT_NUM);
      });

      it('no array accessor / negative number', () =>
      {
         const result = ObjectUtil.safeSet(objectNumCopy, 'level1.level2.array2.-1', 'bogus');

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
   });
});
