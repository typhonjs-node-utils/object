import * as ObjectUtil from '../../src/functions.js';

describe('API Errors:', () =>
{
   it('getAccessorList:', () =>
   {
      /** @ts-ignore */
      expect(() => ObjectUtil.getAccessorList(false)).throws(TypeError,
       `getAccessorList error: 'data' is not an 'object'.`);
   });

   it('safeBatchSet:', () =>
   {
      /** @ts-ignore */
      expect(() => ObjectUtil.safeBatchSet(false, ['foo'], 'bar')).throws(TypeError,
       `safeBatchSet error: 'data' is not an 'object'.`);

      /** @ts-ignore */
      expect(() => ObjectUtil.safeBatchSet({}, false, 'bar')).throws(TypeError,
       `safeBatchSet error: 'accessors' is not an 'array'.`);
   });

   it('safeSet:', () =>
   {
      /** @ts-ignore */
      expect(() => ObjectUtil.safeSet(false, 'foo', 'bar')).throws(TypeError,
       `safeSet error: 'data' is not an 'object'.`);

      /** @ts-ignore */
      expect(() => ObjectUtil.safeSet({}, false, 'bar')).throws(TypeError,
       `safeSet error: 'accessor' is not a 'string'.`);
   });

   it('safeSetAll:', () =>
   {
      /** @ts-ignore */
      expect(() => ObjectUtil.safeSetAll(false, {})).throws(TypeError,
       `safeSetAll error: 'data' is not an 'object'.`);

      /** @ts-ignore */
      expect(() => ObjectUtil.safeSetAll({}, false)).throws(TypeError,
       `safeSetAll error: 'accessorValues' is not an 'object'.`);
   });

   it('validate:', () =>
   {
      /** @ts-ignore */
      expect(() => ObjectUtil.validate(false, {})).throws(TypeError,
       `validate error: 'data' is not an 'object'.`);

      /** @ts-ignore */
      expect(() => ObjectUtil.validate({}, false)).throws(TypeError,
       `validate error: 'validationData' is not an 'object'.`);
   });
});
