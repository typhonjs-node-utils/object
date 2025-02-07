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

   it('getAccessorAsyncIter:', async () =>
   {
      await expect((async () =>
      {
         // @ts-expect-error
         for await (const _ of ObjectUtil.getAccessorAsyncIter(false)) { }
      })()).rejects.toThrow(`getAccessorAsyncIter error: 'data' is not an object.`);

      await expect((async () =>
      {
         for await (const _ of ObjectUtil.getAccessorAsyncIter({}, { batchSize: null })) { }
      })()).rejects.toThrow(`getAccessorAsyncIter error: 'options.batchSize' is not a positive integer.`);

      await expect((async () =>
      {
         for await (const _ of ObjectUtil.getAccessorAsyncIter({}, { batchSize: -1 })) { }
      })()).rejects.toThrow(`getAccessorAsyncIter error: 'options.batchSize' is not a positive integer.`);

      await expect((async () =>
      {
         for await (const _ of ObjectUtil.getAccessorAsyncIter({}, { inherited: null })) { }
      })()).rejects.toThrow(`getAccessorAsyncIter error: 'options.inherited' is not a boolean.`);
   });

   it('getAccessorIter:', () =>
   {
      // @ts-expect-error
      expect(() => [...ObjectUtil.getAccessorIter(false)]).throws(TypeError,
       `getAccessorIter error: 'data' is not an object.`);

      expect(() => [...ObjectUtil.getAccessorIter({}, { batchSize: null })]).throws(TypeError,
       `getAccessorIter error: 'options.batchSize' is not a positive integer.`);

      expect(() => [...ObjectUtil.getAccessorIter({}, { batchSize: -1 })]).throws(TypeError,
       `getAccessorIter error: 'options.batchSize' is not a positive integer.`);

      expect(() => [...ObjectUtil.getAccessorIter({}, { inherited: null })]).throws(TypeError,
       `getAccessorIter error: 'options.inherited' is not a boolean.`);
   });

   it('getAccessorList:', () =>
   {
      // @ts-expect-error
      expect(() => ObjectUtil.getAccessorList(false)).throws(TypeError,
       `getAccessorList error: 'data' is not an object.`);

      expect(() => ObjectUtil.getAccessorList({}, { batchSize: null })).throws(TypeError,
       `getAccessorList error: 'options.batchSize' is not a positive integer.`);

      expect(() => ObjectUtil.getAccessorList({}, { batchSize: -1 })).throws(TypeError,
       `getAccessorList error: 'options.batchSize' is not a positive integer.`);

      expect(() => ObjectUtil.getAccessorList({}, { inherited: null })).throws(TypeError,
       `getAccessorList error: 'options.inherited' is not a boolean.`);

      expect(() => ObjectUtil.getAccessorList({}, { maxDepth: null })).throws(TypeError,
       `getAccessorList error: 'options.maxDepth' is not a positive integer or Infinity.`);
   });

   it('safeBatchSet:', () =>
   {
      // @ts-expect-error
      expect(() => ObjectUtil.safeBatchSet(false, ['foo'], 'bar')).throws(TypeError,
       `safeBatchSet error: 'data' is not an 'object'.`);

      // @ts-expect-error
      expect(() => ObjectUtil.safeBatchSet({}, false, 'bar')).throws(TypeError,
       `safeBatchSet error: 'accessors' is not an 'array'.`);
   });

   it('safeSet:', () =>
   {
      // @ts-expect-error
      expect(() => ObjectUtil.safeSet(false, 'foo', 'bar')).throws(TypeError,
       `safeSet error: 'data' is not an 'object'.`);

      // @ts-expect-error
      expect(() => ObjectUtil.safeSet({}, false, 'bar')).throws(TypeError,
       `safeSet error: 'accessor' is not a 'string'.`);
   });

   it('safeSetAll:', () =>
   {
      // @ts-expect-error
      expect(() => ObjectUtil.safeSetAll(false, {})).throws(TypeError,
       `safeSetAll error: 'data' is not an 'object'.`);

      // @ts-expect-error
      expect(() => ObjectUtil.safeSetAll({}, false)).throws(TypeError,
       `safeSetAll error: 'accessorValues' is not an 'object'.`);
   });
});
