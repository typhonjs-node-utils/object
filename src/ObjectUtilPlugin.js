import * as OU from './objectUtil.js';

/**
 * Wires up ObjectUtil on the plugin eventbus. The following event bindings are available:
 *
 * `typhonjs:utils:object:deep:freeze`: Invokes `deepFreeze`.
 * `typhonjs:utils:object:depth:traverse`: Invokes `depthTraverse`.
 * `typhonjs:utils:object:get:accessor:list`: Invokes `getAccessorList`.
 * `typhonjs:utils:object:safe:access`: Invokes `safeAccess`.
 * `typhonjs:utils:object:safe:batch:set`: Invokes `safeBatchSet`.
 * `typhonjs:utils:object:safe:equal`: Invokes `safeEqual`.
 * `typhonjs:utils:object:safe:set`: Invokes `safeSet`.
 * `typhonjs:utils:object:safe:set:all`: Invokes `safeSetAll`.
 * `typhonjs:utils:object:validate`: Invokes `validate`.
 * `typhonjs:utils:object:validate:array`: Invokes `validateArray`.
 * `typhonjs:utils:object:validate:entry`: Invokes `validateEntry`.
 * `typhonjs:utils:object:validate:entry|array`: Invokes `validateEntryOrArray`.
 *
 * @param {object} ev - PluginEvent - The plugin event.
 * @ignore
 */
export default class ObjectUtilPlugin
{
   static onPluginLoad(ev)
   {
      const eventbus = ev.eventbus;

      eventbus.on('typhonjs:utils:object:deep:freeze', OU.deepFreeze);
      eventbus.on('typhonjs:utils:object:depth:traverse', OU.depthTraverse);
      eventbus.on('typhonjs:utils:object:get:accessor:list', OU.getAccessorList);
      eventbus.on('typhonjs:utils:object:safe:access', OU.safeAccess);
      eventbus.on('typhonjs:utils:object:safe:batch:set', OU.safeBatchSet);
      eventbus.on('typhonjs:utils:object:safe:equal', OU.safeEqual);
      eventbus.on('typhonjs:utils:object:safe:set', OU.safeSet);
      eventbus.on('typhonjs:utils:object:safe:set:all', OU.safeSetAll);
      eventbus.on('typhonjs:utils:object:validate', OU.validate);
      eventbus.on('typhonjs:utils:object:validate:array', OU.validateArray);
      eventbus.on('typhonjs:utils:object:validate:entry', OU.validateEntry);
      eventbus.on('typhonjs:utils:object:validate:entry|array', OU.validateEntryOrArray);
   }
}
