import * as ObjectUtil from '../../src/functions';

describe('API Errors:', () =>
{
   describe('deepFreeze:', () =>
   {
      it('error - data not object', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deepFreeze('bad'), TypeError,
          `deepFreeze error: 'data' is not an object or array.`);
      });

      it('error - options.skipKeys is not a Set', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deepFreeze({}, { skipKeys: 'bad' }), TypeError,
          `deepFreeze error: 'options.skipKeys' is not a Set.`);
      });
   });

   describe('deepMerge:', () =>
   {
      it('error - target not object', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deepMerge('bad', {}), TypeError,
          `deepMerge error: 'target' is not an object.`);
      });

      it('error - source not object (string)', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deepMerge({}, 'bad'), TypeError,
          `deepMerge error: 'sourceObj[0]' is not an object.`);
      });

      it('error - source not object (array)', () =>
      {
         assert.throws(() => ObjectUtil.deepMerge({}, [1, 2]), TypeError,
          `deepMerge error: 'sourceObj[0]' is not an object.`);
      });
   });

   describe('deepSeal:', () =>
   {
      it('error - data not object', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deepSeal('bad'), TypeError,
          `deepSeal error: 'data' is not an object or array.`);
      });

      it('error - options.skipKeys is not a Set', () =>
      {
         // @ts-expect-error
         assert.throws(() => ObjectUtil.deepSeal({}, { skipKeys: 'bad' }), TypeError,
          `deepSeal error: 'options.skipKeys' is not a Set.`);
      });
   });

   describe('getAccessorAsyncIter:', async () =>
   {
      it('error - data not object', async () =>
      {
         await expect((async () =>
         {
            // @ts-expect-error
            for await (const _ of ObjectUtil.getAccessorAsyncIter(false)) { }
         })()).rejects.toThrow(`getAccessorAsyncIter error: 'data' is not an object.`);
      });

      it('error - options.batchSize is not a positive integer (null)', async () =>
      {
         await expect((async () =>
         {
            for await (const _ of ObjectUtil.getAccessorAsyncIter({}, { batchSize: null })) { }
         })()).rejects.toThrow(`getAccessorAsyncIter error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.batchSize is not a positive integer (-1)', async () =>
      {
         await expect((async () =>
         {
            for await (const _ of ObjectUtil.getAccessorAsyncIter({}, { batchSize: -1 })) { }
         })()).rejects.toThrow(`getAccessorAsyncIter error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.inherited is not a boolean', async () =>
      {
         await expect((async () =>
         {
            for await (const _ of ObjectUtil.getAccessorAsyncIter({}, { inherited: null })) { }
         })()).rejects.toThrow(`getAccessorAsyncIter error: 'options.inherited' is not a boolean.`);
      });
   });

   describe('getAccessorIter:', () =>
   {
      it('error - data not object', () =>
      {
         // @ts-expect-error
         expect(() => [...ObjectUtil.getAccessorIter(false)]).throws(TypeError,
          `getAccessorIter error: 'data' is not an object.`);
      });

      it('error - options.batchSize is not a positive integer (null)', () =>
      {
         expect(() => [...ObjectUtil.getAccessorIter({}, { batchSize: null })]).throws(TypeError,
          `getAccessorIter error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.batchSize is not a positive integer (-1)', () =>
      {
         expect(() => [...ObjectUtil.getAccessorIter({}, { batchSize: -1 })]).throws(TypeError,
          `getAccessorIter error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.inherited is not a boolean', () =>
      {
         expect(() => [...ObjectUtil.getAccessorIter({}, { inherited: null })]).throws(TypeError,
          `getAccessorIter error: 'options.inherited' is not a boolean.`);
      });
   });

   describe('getAccessorList:', () =>
   {
      it('error - data not object', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.getAccessorList(false)).throws(TypeError,
          `getAccessorList error: 'data' is not an object.`);
      });

      it('error - options.batchSize is not a positive integer (null)', () =>
      {
         expect(() => ObjectUtil.getAccessorList({}, { batchSize: null })).throws(TypeError,
          `getAccessorList error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.batchSize is not a positive integer (-1)', () =>
      {
         expect(() => ObjectUtil.getAccessorList({}, { batchSize: -1 })).throws(TypeError,
          `getAccessorList error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.inherited is not a boolean', () =>
      {
         expect(() => ObjectUtil.getAccessorList({}, { inherited: null })).throws(TypeError,
          `getAccessorList error: 'options.inherited' is not a boolean.`);
      });

      it('error - options.maxDepth is not a positive integer or Infinity', () =>
      {
         expect(() => ObjectUtil.getAccessorList({}, { maxDepth: null })).throws(TypeError,
          `getAccessorList error: 'options.maxDepth' is not a positive integer or Infinity.`);
      });
   });

   describe('safeSet:', () =>
   {
      it('error - data not object', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet(false, 'foo', 'bar')).throws(TypeError,
          `safeSet error: 'data' is not an object.`);
      });

      it('error - accessor is not a string', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet({}, false, 'bar')).throws(TypeError,
          `safeSet error: 'accessor' is not a string.`);
      });
   });
});
