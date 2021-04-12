import * as OU from './objectUtil.js';

/**
 * Wires up ObjectUtil on the plugin eventbus. The following event bindings are available:
 *
 * `typhonjs:object:util:deep:freeze`: Invokes `deepFreeze`.
 * `typhonjs:object:util:depth:traverse`: Invokes `depthTraverse`.
 * `typhonjs:object:util:get:accessor:list`: Invokes `getAccessorList`.
 * `typhonjs:object:util:safe:access`: Invokes `safeAccess`.
 * `typhonjs:object:util:safe:batch:set`: Invokes `safeBatchSet`.
 * `typhonjs:object:util:safe:equal`: Invokes `safeEqual`.
 * `typhonjs:object:util:safe:set`: Invokes `safeSet`.
 * `typhonjs:object:util:safe:set:all`: Invokes `safeSetAll`.
 * `typhonjs:object:util:validate`: Invokes `validate`.
 * `typhonjs:object:util:validate:array`: Invokes `validateArray`.
 * `typhonjs:object:util:validate:entry`: Invokes `validateEntry`.
 * `typhonjs:object:util:validate:entry|array`: Invokes `validateEntryOrArray`.
 *
 * @param {object} ev - PluginEvent - The plugin event.
 * @ignore
 */
export default class ObjectUtilPlugin
{
   static onPluginLoad(ev)
   {
      const eventbus = ev.eventbus;

      eventbus.on('typhonjs:object:util:deep:freeze', OU.deepFreeze);
      eventbus.on('typhonjs:object:util:depth:traverse', OU.depthTraverse);
      eventbus.on('typhonjs:object:util:get:accessor:list', OU.getAccessorList);
      eventbus.on('typhonjs:object:util:safe:access', OU.safeAccess);
      eventbus.on('typhonjs:object:util:safe:batch:set', OU.safeBatchSet);
      eventbus.on('typhonjs:object:util:safe:equal', OU.safeEqual);
      eventbus.on('typhonjs:object:util:safe:set', OU.safeSet);
      eventbus.on('typhonjs:object:util:safe:set:all', OU.safeSetAll);
      eventbus.on('typhonjs:object:util:validate', OU.validate);
      eventbus.on('typhonjs:object:util:validate:array', OU.validateArray);
      eventbus.on('typhonjs:object:util:validate:entry', OU.validateEntry);
      eventbus.on('typhonjs:object:util:validate:entry|array', OU.validateEntryOrArray);
   }
}
