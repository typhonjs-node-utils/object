// External Types ----------------------------------------------------------------------------------------------------

/**
 * Represents a structural path to a property within an object.
 *
 * A property path may be expressed as either a dotted string or a readonly array of exact {@link PropertyKey}
 * segments. Dotted strings provide concise access to ordinary string-keyed properties, while array paths preserve
 * strings, numbers, and symbols without coercion or delimiter ambiguity.
 *
 * Exact array paths are required for numeric array indexes, symbol keys, empty-string keys, and property names
 * containing literal periods. Runtime APIs validate that paths are non-empty and may apply additional traversal or
 * mutation constraints.
 *
 * @category Property Keys and Paths
 */
export type PropertyPath = string | readonly PropertyKey[];

/**
 * Defines common defensive limits for property-path traversal.
 *
 * All limits must be non-negative safe integers. `maxDepth` establishes a structural boundary, `maxResults` ends an
 * iterator normally after the requested number of results, and `maxVisits` throws a `RangeError` before another
 * property or trie node is processed. Trie-backed collections may impose lower constructor-level caps.
 *
 * @category Object Traversal and Comparison
 */
export interface PropertyPathTraversalLimits
{
   /**
    * Maximum number of property-key segments traversed beneath a selected prefix, or beneath the root when no prefix
    * is supplied. A value of `0` selects only the prefix itself when the iterator supports a prefix.
    */
   maxDepth?: number;

   /**
    * Maximum number of paths or entries yielded by one traversal. Reaching this limit truncates normally.
    */
   maxResults?: number;

   /**
    * Maximum number of object properties or trie nodes processed during iterative traversal. Exceeding this limit
    * throws.
    */
   maxVisits?: number;
}

/**
 * Defines bounded traversal options for {@link pathKeyIterator}.
 *
 * Returned paths remain absolute when a prefix is selected. `stopPath` must equal or descend from `prefixPath` when
 * both are supplied.
 *
 * @category Object Traversal and Comparison
 */
export interface PathKeyIteratorOptions extends PropertyPathTraversalLimits
{
   /** Whether numeric array indexes are included. @default false */
   arrayIndex?: boolean;

   /** Whether traversal is restricted to enumerable own properties. @default true */
   hasOwnOnly?: boolean;

   /** Absolute enumerable property path selecting the object branch where traversal begins. */
   prefixPath?: PropertyPath;

   /** Absolute property path yielded as terminal while pruning all descendants beneath it. */
   stopPath?: PropertyPath;
}
