import { isObjectOrFunction }                from '../functions';

import { assertPropertyPathOptionsObject }   from '../internal';

import { PropertyPathMap }                   from './PropertyPathMap';

import type { PropertyPath }                 from '../types';

/**
 * Associates structural {@link PropertyPath} paths with values beneath weakly held root objects.
 *
 * Each root is stored as a key in an internal `WeakMap`, and each root value is a trie-based
 * {@link PropertyPathMap}. This provides structural path lookup while allowing the root and its complete path map to
 * become eligible for garbage collection when the root is no longer referenced elsewhere.
 *
 * @example
 * ```ts
 * const maps = new WeakPropertyPathMap<object, DataModel>();
 * const document = {};
 *
 * maps.set(document, ['system', 'attributes', 'hp'], hpModel);
 * maps.set(document, ['system', 'attributes', 'ac'], acModel);
 *
 * maps.get(document, ['system', 'attributes', 'hp']);
 * // hpModel
 * ```
 *
 * ## Weak collection constraints
 *
 * Like `WeakMap`, this collection cannot expose global `size`, `entries`, `keys`, `values`, or iteration because weak
 * roots are intentionally not enumerable. Every query requires a known root object. {@link clear} is supported by
 * replacing the internal `WeakMap` in constant time.
 *
 * ## Root and path semantics
 *
 * - Root keys must be non-null objects or functions.
 * - Accessor paths use all structural and symbol semantics provided by {@link PropertyPathMap}.
 * - Different roots may store identical paths without conflict.
 * - `undefined` is a valid stored value; use {@link has} to distinguish it from an absent path.
 * - Deleting the final path for a root also removes that root from the internal `WeakMap` immediately.
 *
 * ## Defensive limits
 *
 * The constructor accepts the same storage and traversal limits as {@link PropertyPathMap}. Limits apply independently
 * to each root trie, and a failed first insertion is validated before the root is retained. Aggregate limits across all
 * roots are intentionally unavailable because tracking weak roots globally would require strong retention and violate
 * weak-collection semantics.
 *
 * Matching and subtree iterators support `maxDepth`, `maxResults`, and `maxVisits` through the delegated
 * {@link PropertyPathMap} options. Candidate getters and proxy traps may execute when matching requires property reads;
 * their exceptions are intentionally propagated.
 *
 * ## Complexity
 *
 * Root lookup is expected `O(1)`. Path operations retain the `O(path length)` behavior of {@link PropertyPathMap}.
 * Trie-aware matching retains shared-prefix pruning and visits only candidate branches reachable from stored paths.
 * Matching entry and value iterators may optionally include the property value resolved from the candidate object.
 * Prefix-bounded matching and candidate-independent subtree iteration retain the corresponding behavior of
 * {@link PropertyPathMap}.
 *
 * @category Property Path Collections
 *
 * @typeParam R - Weak root object type.
 * @typeParam V - Stored value type.
 */
export class WeakPropertyPathMap<R extends object, V>
{
   /** Weak root-to-trie associations. Reassigned by {@link clear}. */
   #roots: WeakMap<R, PropertyPathMap<V>> = new WeakMap();

   /** Defensive limits applied independently to every per-root trie. */
   readonly #options: Readonly<PropertyPathMap.Options.Constructor>;

   /** Empty configured trie used to preserve validation semantics for missing roots. */
   readonly #emptyPropertyPathMap: PropertyPathMap<never>;

   /**
    * Creates a weak property-path map with limits applied independently to every live root trie.
    *
    * Because weak roots are not enumerable, aggregate limits across all live roots cannot be tracked without retaining
    * those roots strongly. Constructor limits therefore apply per root while preserving normal weak-key collection
    * semantics.
    *
    * @param options - Per-root storage and traversal limits accepted by {@link PropertyPathMap}.
    *
    * @throws {TypeError} If `options` is invalid or a limit is not a non-negative safe integer.
    */
   constructor(options: PropertyPathMap.Options.Constructor = {})
   {
      assertPropertyPathOptionsObject(options, 'WeakPropertyPathMap');

      this.#options = Object.freeze({ ...options });
      this.#emptyPropertyPathMap = new PropertyPathMap<never>(null, this.#options);
   }

   /**
    * Provides the standard object tag used by `Object.prototype.toString`.
    */
   get [Symbol.toStringTag](): string
   {
      return 'WeakPropertyPathMap';
   }

   /**
    * Removes every root association in constant time.
    *
    * The prior `WeakMap` and all path tries reachable only through it become eligible for garbage collection. Any
    * iterator already returned by a matching or subtree method retains its direct reference to the corresponding path
    * trie and may continue independently.
    */
   clear(): void
   {
      this.#roots = new WeakMap();
   }

   /**
    * Deletes one exact accessor path beneath a root.
    *
    * If the removed path was the final entry beneath the root, the now-empty per-root trie is removed from the
    * internal `WeakMap`. Missing roots and missing exact paths return `false`.
    *
    * @param root - Weak root object or function.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @returns `true` when an exact path existed and was removed; otherwise `false`.
    *
    * @throws {TypeError} If `root` is not a non-null object or function.
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path exceeds the configured per-root `maxPathDepth`.
    */
   delete(root: R, accessor: PropertyPath): boolean
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      if (map === void 0) { return this.#emptyPropertyPathMap.delete(accessor); }

      if (!map.delete(accessor)) { return false; }

      // Avoid retaining an empty trie while the root remains alive elsewhere.
      if (map.size === 0) { this.#roots.delete(root); }

      return true;
   }

   /**
    * Removes every path association beneath one known root.
    *
    * @param root - Weak root object or function.
    *
    * @returns `true` when the root had an associated path trie; otherwise `false`.
    *
    * @throws {TypeError} If `root` is not a non-null object or function.
    */
   deleteRoot(root: R): boolean
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);
      return this.#roots.delete(root);
   }

   /**
    * Retrieves the value stored at an exact structural path beneath a root.
    *
    * `undefined` may mean either that the root / path is absent or that `undefined` is the stored value. Use
    * {@link has} when that distinction matters.
    *
    * @param root - Weak root object or function.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @returns Stored value or `undefined` when the root or exact path is absent.
    *
    * @throws {TypeError} If `root` is not a non-null object or function.
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path exceeds the configured per-root `maxPathDepth`.
    */
   get(root: R, accessor: PropertyPath): V | undefined
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      if (map === void 0) { return this.#emptyPropertyPathMap.get(accessor); }

      return map.get(accessor);
   }

   /**
    * Determines whether an exact path stores a value beneath a root.
    *
    * @param root - Weak root object or function.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @returns Whether the root exists and the exact path stores a value.
    *
    * @throws {TypeError} If `root` is not a non-null object or function.
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path exceeds the configured per-root `maxPathDepth`.
    */
   has(root: R, accessor: PropertyPath): boolean
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      if (map === void 0) { return this.#emptyPropertyPathMap.has(accessor); }

      return map.has(accessor);
   }

   /**
    * Determines whether a root currently has at least one associated path.
    *
    * Roots whose final path is deleted are removed eagerly, so a `true` result always indicates a non-empty
    * per-root trie.
    *
    * @param root - Weak root object or function.
    *
    * @returns Whether the root currently owns a path trie.
    *
    * @throws {TypeError} If `root` is not a non-null object or function.
    */
   hasRoot(root: R): boolean
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);
      return this.#roots.has(root);
   }

   /**
    * Returns a trie-aware iterator of matching entries for one root.
    *
    * Matching behavior, prefix pruning, `pathPrefix` / `stopAt` bounds, `maxDepth`, result / visit budgets,
    * array-index rules, inherited-property handling, optional candidate property values, and iteration order are
    * delegated directly to {@link PropertyPathMap.matchingEntries}. A missing root behaves as an empty configured trie
    * while still validating matching options during iterator consumption.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param data - Candidate object or function to match against stored paths.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of canonical matching paths, mapped values, and optionally resolved candidate property values.
    *
    * @throws {TypeError} If `root`, a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   matchingEntries(root: R, data: unknown,
    options: PropertyPathMap.Options.Match & { includePropertyValue: true }):
     IterableIterator<[readonly PropertyKey[], V, unknown]>;

   matchingEntries(root: R, data: unknown,
    options?: PropertyPathMap.Options.Match & { includePropertyValue?: false }):
     IterableIterator<[readonly PropertyKey[], V]>;

   matchingEntries(root: R, data: unknown, options?: PropertyPathMap.Options.Match):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>;

   matchingEntries(root: R, data: unknown, options: PropertyPathMap.Options.Match = {}):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ?
       this.#emptyPropertyPathMap.matchingEntries(data, options) :
       map.matchingEntries(data, options);
   }

   /**
    * Returns a trie-aware iterator of canonical matching paths for one root.
    *
    * This delegates to {@link PropertyPathMap.matchingKeys}; see {@link matchingEntries} for complete matching,
    * path-bound, and stop-bound semantics. A missing root produces an empty iterator while retaining option validation.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param data - Candidate object or function to match against stored paths.
    *
    * @param options - Path-only matching options.
    *
    * @returns Iterator of canonical matching accessor paths.
    *
    * @throws {TypeError} If `root`, a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   matchingKeys(root: R, data: unknown, options?: PropertyPathMap.Options.MatchKeys):
    IterableIterator<readonly PropertyKey[]>
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? this.#emptyPropertyPathMap.matchingKeys(data, options) :
       map.matchingKeys(data, options);
   }

   /**
    * Returns a trie-aware iterator of mapped values whose paths match a candidate value for one root.
    *
    * By default, mapped values are yielded directly. Set `includePropertyValue` to `true` to receive
    * `[mappedValue, propertyValue]` tuples. Prefix and stop bounds are delegated to
    * {@link PropertyPathMap.matchingValues}. A missing root produces an empty iterator while retaining normal option
    * validation.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param data - Candidate object or function to match against stored paths.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of mapped values or mapped-value / candidate-property-value tuples.
    *
    * @throws {TypeError} If `root`, a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   matchingValues(root: R, data: unknown,
    options: PropertyPathMap.Options.Match & { includePropertyValue: true }): IterableIterator<[V, unknown]>;

   matchingValues(root: R, data: unknown,
    options?: PropertyPathMap.Options.Match & { includePropertyValue?: false }): IterableIterator<V>;

   matchingValues(root: R, data: unknown, options?: PropertyPathMap.Options.Match):
    IterableIterator<V | [V, unknown]>;

   matchingValues(root: R, data: unknown, options: PropertyPathMap.Options.Match = {}):
    IterableIterator<V | [V, unknown]>
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? this.#emptyPropertyPathMap.matchingValues(data, options) :
       map.matchingValues(data, options);
   }

   /**
    * Returns a bounded subtree entry iterator for one weak root.
    *
    * Candidate-independent subtree behavior, absolute `pathPrefix` selection, descendant pruning through `stopAt`,
    * relative `maxDepth`, result / visit budgets, and deterministic trie order are delegated to
    * {@link PropertyPathMap.subtreeEntries}. A missing root behaves as an empty configured trie while still validating
    * all options during iterator consumption.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored paths and mapped values.
    *
    * @throws {TypeError} If `root`, a numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   subtreeEntries(root: R, options: PropertyPathMap.Options.Subtree = {}):
    IterableIterator<[readonly PropertyKey[], V]>
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? this.#emptyPropertyPathMap.subtreeEntries(options) :
       map.subtreeEntries(options);
   }

   /**
    * Returns a bounded subtree key iterator for one weak root.
    *
    * This delegates to {@link PropertyPathMap.subtreeKeys}. A missing root produces an empty iterator while retaining
    * normal option validation.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored accessor paths.
    *
    * @throws {TypeError} If `root`, a numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   subtreeKeys(root: R, options: PropertyPathMap.Options.Subtree = {}):
    IterableIterator<readonly PropertyKey[]>
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? this.#emptyPropertyPathMap.subtreeKeys(options) :
       map.subtreeKeys(options);
   }

   /**
    * Returns a bounded subtree value iterator for one weak root.
    *
    * This delegates to {@link PropertyPathMap.subtreeValues}. A missing root produces an empty iterator while retaining
    * normal option validation.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of mapped values.
    *
    * @throws {TypeError} If `root`, a numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   subtreeValues(root: R, options: PropertyPathMap.Options.Subtree = {}): IterableIterator<V>
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      const map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? this.#emptyPropertyPathMap.subtreeValues(options) :
       map.subtreeValues(options);
   }

   /**
    * Stores a value at an exact structural path beneath a weak root.
    *
    * The per-root trie is created lazily on the first successful insertion. Invalid accessors therefore cannot leave
    * an empty root association behind. Existing roots reuse their current trie and retain all normal
    * {@link PropertyPathMap.set} overwrite and insertion-order semantics.
    *
    * @param root - Weak root object or function.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @param value - Value to store. `undefined` is valid.
    *
    * @returns This weak map.
    *
    * @throws {TypeError} If `root` is not a non-null object or function.
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the per-root path depth, entry count, or trie node count limit would be exceeded.
    */
   set(root: R, accessor: PropertyPath, value: V): this
   {
      WeakPropertyPathMap.#assertWeakPropertyPathMapRoot(root);

      let map: PropertyPathMap<V> | undefined = this.#roots.get(root);

      if (map === void 0)
      {
         // Configure and populate the trie before retaining the root so failed validation or resource limits cannot
         // leave an empty weak-root association behind.
         map = new PropertyPathMap<V>(null, this.#options);
         map.set(accessor, value);
         this.#roots.set(root, map);
      }
      else
      {
         map.set(accessor, value);
      }

      return this;
   }

   // Internal Utility Functions -------------------------------------------------------------------------------------

   /**
    * Validates a weak root key.
    *
    * Called by every public operation that accepts a root. Functions are accepted because they are valid `WeakMap` keys
    * and may represent constructors, callable models, or other property-bearing runtime objects.
    *
    * @param value - Candidate root key.
    *
    * @throws {TypeError} If `value` is null or is neither an object nor a function.
    */
   static #assertWeakPropertyPathMapRoot(value: unknown): asserts value is object
   {
      if (!isObjectOrFunction(value))
      {
         throw new TypeError(`WeakPropertyPathMap error: 'root' is not an object or function.`);
      }
   }
}
