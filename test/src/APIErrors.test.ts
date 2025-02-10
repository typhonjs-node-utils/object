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

      it('error - no source object', () =>
      {
         assert.throws(() => ObjectUtil.deepMerge({}), TypeError,
          `deepMerge error: 'sourceObj' is not an object.`);
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

   describe('safeKeyIterator:', () =>
   {
      it('error - data not object', () =>
      {
         // @ts-expect-error
         expect(() => [...ObjectUtil.safeKeyIterator(false)]).throws(TypeError,
          `safeKeyIterator error: 'data' is not an object.`);
      });

      it('error - options.batchSize is not a positive integer (null)', () =>
      {
         expect(() => [...ObjectUtil.safeKeyIterator({}, { batchSize: null })]).throws(TypeError,
          `safeKeyIterator error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.batchSize is not a positive integer (-1)', () =>
      {
         expect(() => [...ObjectUtil.safeKeyIterator({}, { batchSize: -1 })]).throws(TypeError,
          `safeKeyIterator error: 'options.batchSize' is not a positive integer.`);
      });

      it('error - options.inherited is not a boolean', () =>
      {
         expect(() => [...ObjectUtil.safeKeyIterator({}, { inherited: null })]).throws(TypeError,
          `safeKeyIterator error: 'options.inherited' is not a boolean.`);
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
