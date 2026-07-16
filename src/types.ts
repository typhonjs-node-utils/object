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
