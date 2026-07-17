import {
   assertObject,
   isPropertyPath,
   normalizePropertyPath }    from '../functions';

import type { PropertyPath }  from '../types';

/**
 * Object or function that can provide a direct JavaScript property-path segment.
 */
export type PropertyPathTraversableValue = object | ((...args: any[]) => any);

/** Default maximum number of property-key segments accepted by trie-backed collections. */
export const DEFAULT_PROPERTY_PATH_DEPTH_LIMIT = 64;

/** Default maximum number of entries retained by one {@link PropertyPathMap}. */
export const DEFAULT_PROPERTY_PATH_ENTRY_LIMIT = 16_384;

/** Default maximum number of non-root trie nodes retained by one {@link PropertyPathMap}. */
export const DEFAULT_PROPERTY_PATH_NODE_LIMIT = 65_536;

/** Default maximum number of results produced by one bounded traversal. */
export const DEFAULT_PROPERTY_PATH_RESULT_LIMIT = 16_384;

/** Default maximum number of properties or trie nodes inspected by one bounded traversal. */
export const DEFAULT_PROPERTY_PATH_VISIT_LIMIT = 65_536;

/**
 * Raw common traversal bounds accepted by the shared normalization helper.
 */
export interface PropertyPathTraversalBoundInput
{
   prefixPath?: PropertyPath;
   stopPath?: PropertyPath;
   maxDepth?: number;
   maxResults?: number;
   maxVisits?: number;
}

/**
 * Context-specific option names and limits used while normalizing traversal bounds.
 */
export interface PropertyPathTraversalBoundConfig
{
   errorPrefix: string;
   prefixOption: string;
   stopOption: string;
   defaultMaxResults?: number;
   defaultMaxVisits?: number;
   maxResultsLimit?: number;
   maxVisitsLimit?: number;
   stopOutsideMessage?: string;
}

/**
 * Canonical traversal bounds shared by object and trie traversal implementations.
 */
export interface NormalizedPropertyPathTraversalBounds
{
   prefixPath?: readonly PropertyKey[];
   stopPath?: readonly PropertyKey[];
   maxPathLength: number;
   maxResults: number;
   maxVisits: number;
}

/**
 * Mutable accounting state shared by traversal implementations.
 */
export interface PropertyPathTraversalBudget
{
   readonly errorPrefix: string;
   readonly maxResults: number;
   readonly maxVisits: number;
   results: number;
   visits: number;
}

/**
 * Validates a runtime options object before property access or destructuring.
 */
export function assertPropertyPathOptionsObject(value: unknown, errorPrefix: string): asserts value is object
{
   return assertObject(value, `${errorPrefix} error: 'options' is not an object.`);
}

/**
 * Consumes one result slot.
 *
 * Callers validate result capacity before consuming a slot.
 */
export function consumePropertyPathTraversalResult(budget: PropertyPathTraversalBudget): void
{
   budget.results++;
}

/**
 * Consumes one traversal visit and throws before the configured budget can be exceeded.
 */
export function consumePropertyPathTraversalVisit(budget: PropertyPathTraversalBudget): void
{
   if (budget.visits >= budget.maxVisits)
   {
      throw new RangeError(`${budget.errorPrefix} error: Traversal exceeded 'options.maxVisits'.`);
   }

   budget.visits++;
}

/**
 * Creates traversal accounting state from normalized bounds.
 */
export function createPropertyPathTraversalBudget(bounds: NormalizedPropertyPathTraversalBounds,
 errorPrefix: string): PropertyPathTraversalBudget
{
   return {
      errorPrefix,
      maxResults: bounds.maxResults,
      maxVisits: bounds.maxVisits,
      results: 0,
      visits: 0
   };
}

/**
 * Determines whether two normalized property-key paths are structurally equal with SameValueZero segment semantics.
 */
export function isNormalizedPropertyPathEqual(pathA: readonly PropertyKey[],
 pathB: readonly PropertyKey[]): boolean
{
   return pathA.length === pathB.length && isNormalizedPropertyPathPrefix(pathA, pathB);
}

/**
 * Determines whether one normalized property-key path is an exact structural prefix of another.
 */
export function isNormalizedPropertyPathPrefix(prefix: readonly PropertyKey[],
 path: readonly PropertyKey[]): boolean
{
   if (prefix.length > path.length) { return false; }

   for (let index: number = 0; index < prefix.length; index++)
   {
      const prefixKey: PropertyKey = prefix[index];
      const pathKey: PropertyKey = path[index];

      if (prefixKey !== pathKey && !(typeof prefixKey === 'number' && typeof pathKey === 'number' &&
       Number.isNaN(prefixKey) && Number.isNaN(pathKey)))
      {
         return false;
      }
   }

   return true;
}

/**
 * Normalizes an optional non-negative safe-integer resource limit.
 *
 * @param value - Candidate limit.
 * @param defaultValue - Value returned when `value` is `undefined`.
 * @param errorMessage - Message used by the thrown {@link TypeError}.
 *
 * @returns The validated limit or `defaultValue`.
 *
 * @throws {TypeError} If a supplied value is not a non-negative safe integer.
 */
export function normalizePropertyPathLimit(value: unknown, defaultValue: number, errorMessage: string): number
{
   if (value === void 0) { return defaultValue; }

   if (!Number.isSafeInteger(value) || (value as number) < 0)
   {
      throw new TypeError(errorMessage);
   }

   return value as number;
}

/**
 * Normalizes and validates common path, depth, result, and visit traversal bounds.
 */
export function normalizePropertyPathTraversalBounds(input: PropertyPathTraversalBoundInput,
 config: PropertyPathTraversalBoundConfig): NormalizedPropertyPathTraversalBounds
{
   assertPropertyPathOptionsObject(input, config.errorPrefix);

   const { prefixPath, stopPath, maxDepth, maxResults, maxVisits } = input;
   const prefixOption: string = `options.${config.prefixOption}`;
   const stopOption: string = `options.${config.stopOption}`;

   if (prefixPath !== void 0 && !isPropertyPath(prefixPath))
   {
      throw new TypeError(`${config.errorPrefix} error: '${prefixOption}' is not a valid property path.`);
   }

   if (stopPath !== void 0 && !isPropertyPath(stopPath))
   {
      throw new TypeError(`${config.errorPrefix} error: '${stopOption}' is not a valid property path.`);
   }

   const normMaxDepth: number = normalizePropertyPathLimit(maxDepth, Number.POSITIVE_INFINITY,
    `${config.errorPrefix} error: 'options.maxDepth' is not a non-negative safe integer.`);
   const normMaxResults: number = normalizePropertyPathLimit(maxResults,
    config.defaultMaxResults ?? DEFAULT_PROPERTY_PATH_RESULT_LIMIT,
    `${config.errorPrefix} error: 'options.maxResults' is not a non-negative safe integer.`);
   const normMaxVisits: number = normalizePropertyPathLimit(maxVisits,
    config.defaultMaxVisits ?? DEFAULT_PROPERTY_PATH_VISIT_LIMIT,
    `${config.errorPrefix} error: 'options.maxVisits' is not a non-negative safe integer.`);

   const normPrefixPath: readonly PropertyKey[] | undefined = prefixPath === void 0 ? void 0 :
    normalizePropertyPath(prefixPath, `${config.errorPrefix} error: '${prefixOption}' is not a valid property path.`);
   const normStopPath: readonly PropertyKey[] | undefined = stopPath === void 0 ? void 0 :
    normalizePropertyPath(stopPath, `${config.errorPrefix} error: '${stopOption}' is not a valid property path.`);

   if (normPrefixPath !== void 0 && normStopPath !== void 0 &&
    !isNormalizedPropertyPathPrefix(normPrefixPath, normStopPath))
   {
      throw new RangeError(config.stopOutsideMessage ?? `${config.errorPrefix} error: '${stopOption}' must equal or ` +
       `descend from '${prefixOption}'.`);
   }

   const basePathLength: number = normPrefixPath?.length ?? 0;
   const maxPathLength: number = normMaxDepth === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY :
    Math.min(Number.MAX_SAFE_INTEGER, basePathLength + normMaxDepth);

   return {
      prefixPath: normPrefixPath,
      stopPath: normStopPath,
      maxPathLength,
      maxResults: Math.min(normMaxResults, config.maxResultsLimit ?? Number.MAX_SAFE_INTEGER),
      maxVisits: Math.min(normMaxVisits, config.maxVisitsLimit ?? Number.MAX_SAFE_INTEGER)
   };
}
