import { bench }        from 'vitest';

import * as ObjectUtil  from '../../../src/functions';

// Test Options ------------------------------------------------------------------------------------------------------

// Test Categories
const deepFreeze = false;
const deepMerge = false;
const deepSeal = false;
const safeKeyIterator = false;

// Load large objects ------------------------------------------------------------------------------------------------

// Use depth (1st value) to change test object size. 10-11 is very large!

const testObject = generateTestObject(8, 5);
const testObjectSource = generateTestObject(8, 5);

console.log(`FINISH - Generating Object Data`)

// Tests -------------------------------------------------------------------------------------------------------------

describe.skipIf(!safeKeyIterator)('safeKeyIterator', () =>
{
   let lengthIter = 0;

   bench('safeKeyIterator', () =>
   {
      lengthIter = 0;
      for (const entry of ObjectUtil.safeKeyIterator(testObject)) { lengthIter++; }
   },
   {
      iterations: 0,
      teardown: () =>
      {
         console.log(`safeKeyIterator length: ${lengthIter}`);
      }
   });
});

describe.skipIf(!deepFreeze)('deepFreeze', () =>
{
   bench('large object', () =>
   {
      ObjectUtil.deepFreeze(testObject);
   },
   {
      iterations: 10
   });
});

describe.skipIf(!deepMerge)('deepMerge', () =>
{
   bench('large object', () =>
   {
       ObjectUtil.deepMerge(testObject, testObjectSource);
   },
   {
      iterations: 1
   });
});

describe.skipIf(!deepSeal)('deepSeal', () =>
{
   bench('large object', () =>
   {
      ObjectUtil.deepSeal(testObject);
   },
   {
      iterations: 10
   });
});

// Utility -----------------------------------------------------------------------------------------------------------

/**
 * Generates a deeply nested test object for benchmarking.
 *
 * @param depth - Number of nested levels (how deep the object structure should be).
 *
 * @param width - Number of keys at each level.
 *
 * @returns A nested object with the specified depth and width.
 *
 * @example
 * ```js
 * // For depth=2, width=2:
 * {
 *   level2_0: {
 *     level1_0: { key0: 0, key1: 1 },
 *     level1_1: { key0: 0, key1: 1 }
 *   },
 *   level2_1: {
 *     level1_0: { key0: 0, key1: 1 },
 *     level1_1: { key0: 0, key1: 1 }
 *   }
 * }
 * ```
 */
function generateTestObject(depth: number, width: number): object
{
   const root: any = {};
   const stack: { obj: any, level: number }[] = [{ obj: root, level: 0 }];

   while (stack.length > 0)
   {
      const { obj, level } = stack.pop()!;

      if (level === depth)
      {
         // Add leaf properties
         for (let i = 0; i < width; i++) { obj[`key${i}`] = i; }
         continue;
      }

      // Add nested objects
      for (let i = 0; i < width; i++)
      {
         const newObj = {};
         obj[`level${level}_${i}`] = newObj;
         stack.push({ obj: newObj, level: level + 1 });
      }
   }

   return root;
}
