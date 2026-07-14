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

      it('error - throws for a circular source object', () =>
      {
         const source: Record<string, any> = { value: 42 };

         source.self = source;

         assert.throws(() => ObjectUtil.deepMerge({}, source), TypeError,
          `deepMerge error: Circular source object detected.`);
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

   describe('safeEqual:', () =>
   {
      it('safeEqual throws when the source contains a circular path', () =>
      {
         const source: Record<string, any> = {
            value: 42
         };

         source.self = source;

         assert.throws(() => ObjectUtil.safeEqual(source, { value: 42 }), TypeError,
          ``);
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

      it('error - options.arrayIndex is not a boolean', () =>
      {
         expect(() => [...ObjectUtil.safeKeyIterator({}, { arrayIndex: null })]).throws(TypeError,
          `safeKeyIterator error: 'options.arrayIndex' is not a boolean.`);
      });

      it('error - options.hasOwnOnly is not a boolean', () =>
      {
         expect(() => [...ObjectUtil.safeKeyIterator({}, { hasOwnOnly: null })]).throws(TypeError,
          `safeKeyIterator error: 'options.hasOwnOnly' is not a boolean.`);
      });

      it('error - throws for a circular source object', () =>
      {
         const source: Record<string, any> = { value: 42 };

         source.self = source;

         assert.throws(() => [...ObjectUtil.safeKeyIterator(source)], TypeError,
          `safeKeyIterator error: Circular object path detected.`);
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

      it('error - accessor is not a string or symbol', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet({}, false, 'bar')).throws(TypeError,
          `safeSet error: 'accessor' is not a string or an array of property keys.`);
      });

      it('error - accessor is not a string or symbol', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet({ a: { b: true } }, ['a', false], 'bar')).throws(TypeError,
          `safeSet error: 'accessor' contains an entry that is not a property key.`);
      });

      it('error - options.createMissing is not a boolean', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet({}, 'foo', 'bar', { createMissing: 'bad' })).throws(TypeError,
          `safeSet error: 'options.createMissing' is not a boolean.`);
      });

      it('error - options.operation is not a string', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet({}, 'foo', 'bar', { operation: false })).throws(TypeError,
          `safeSet error: 'options.operation' is not a string.`);
      });

      it('error - Unknown options.operation', () =>
      {
         // @ts-expect-error
         expect(() => ObjectUtil.safeSet({}, 'foo', 'bar', { operation: 'bad' })).throws(Error,
          `safeSet error: Unknown 'options.operation'.`);
      });
   });
});
