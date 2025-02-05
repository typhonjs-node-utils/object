import * as OU from './functions.js';

/**
 * Wires up object util functions on the plugin eventbus. The following event bindings are available:
 *
 * `typhonjs:utils:object:deep:freeze`: Invokes `deepFreeze`.
 * `typhonjs:utils:object:deep:merge`: Invokes `deepMerge`.
 * `typhonjs:utils:object:depth:traverse`: Invokes `depthTraverse`.
 * `typhonjs:utils:object:get:accessor:list`: Invokes `getAccessorList`.
 * `typhonjs:utils:object:has:accessor`: Invokes `hasAccessor`.
 * `typhonjs:utils:object:has:getter`: Invokes `hasGetter`.
 * `typhonjs:utils:object:has:prototype`: Invokes `hasPrototype`.
 * `typhonjs:utils:object:has:setter`: Invokes `hasSetter`.
 * `typhonjs:utils:object:is:iterable`: Invokes `isIterable`.
 * `typhonjs:utils:object:is:iterable:async`: Invokes `isIterableAsync`.
 * `typhonjs:utils:object:is:object`: Invokes `isObject`.
 * `typhonjs:utils:object:keys`: Invokes `objectKeys`.
 * `typhonjs:utils:object:size`: Invokes `objectSize`.
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
 *
 * @ignore
 */
export function onPluginLoad(ev)
{
   const eventbus = ev.eventbus;

   const options = ev.pluginOptions;

   let guard = true;

   // Apply any plugin options.
   if (typeof options === 'object')
   {
      if (typeof options.guard === 'boolean') { guard = options.guard; }
   }

   eventbus.on('typhonjs:utils:object:deep:freeze', OU.deepFreeze, void 0, { guard });
   eventbus.on('typhonjs:utils:object:deep:merge', OU.deepMerge, void 0, { guard });
   eventbus.on('typhonjs:utils:object:depth:traverse', OU.depthTraverse, void 0, { guard });
   eventbus.on('typhonjs:utils:object:get:accessor:list', OU.getAccessorList, void 0, { guard });
   eventbus.on('typhonjs:utils:object:has:accessor', OU.hasAccessor, void 0, { guard });
   eventbus.on('typhonjs:utils:object:has:getter', OU.hasGetter, void 0, { guard });
   eventbus.on('typhonjs:utils:object:has:prototype', OU.hasPrototype, void 0, { guard });
   eventbus.on('typhonjs:utils:object:has:setter', OU.hasSetter, void 0, { guard });
   eventbus.on('typhonjs:utils:object:is:iterable', OU.isIterable, void 0, { guard });
   eventbus.on('typhonjs:utils:object:is:iterable:async', OU.isAsyncIterable, void 0, { guard });
   eventbus.on('typhonjs:utils:object:is:object', OU.isObject, void 0, { guard });
   eventbus.on('typhonjs:utils:object:is:object:plain', OU.isPlainObject, void 0, { guard });
   eventbus.on('typhonjs:utils:object:keys', OU.objectKeys, void 0, { guard });
   eventbus.on('typhonjs:utils:object:size', OU.objectSize, void 0, { guard });
   eventbus.on('typhonjs:utils:object:safe:access', OU.safeAccess, void 0, { guard });
   eventbus.on('typhonjs:utils:object:safe:batch:set', OU.safeBatchSet, void 0, { guard });
   eventbus.on('typhonjs:utils:object:safe:equal', OU.safeEqual, void 0, { guard });
   eventbus.on('typhonjs:utils:object:safe:set', OU.safeSet, void 0, { guard });
   eventbus.on('typhonjs:utils:object:safe:set:all', OU.safeSetAll, void 0, { guard });
}
