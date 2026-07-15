import { normalizeSafeAccessor } from './functions';
import { SafeAccessorMap }       from './SafeAccessorMap';

import type { SafeAccessor }     from './functions';

/**
 * Associates structural {@link SafeAccessor} paths with values beneath weakly held root objects.
 *
 * Each root is stored as a key in an internal `WeakMap`, and each root value is a trie-based
 * {@link SafeAccessorMap}. This provides structural path lookup while allowing the root and its complete path map to
 * become eligible for garbage collection when the root is no longer referenced elsewhere.
 *
 * @example
 * ```ts
 * const maps = new WeakSafeAccessorMap<object, DataModel>();
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
 * - Accessor paths use all structural and symbol semantics provided by {@link SafeAccessorMap}.
 * - Different roots may store identical paths without conflict.
 * - `undefined` is a valid stored value; use {@link has} to distinguish it from an absent path.
 * - Deleting the final path for a root also removes that root from the internal `WeakMap` immediately.
 *
 * ## Complexity
 *
 * Root lookup is expected `O(1)`. Path operations retain the `O(path length)` behavior of {@link SafeAccessorMap}.
 * Trie-aware matching retains shared-prefix pruning and visits only candidate branches reachable from stored paths.
 * Matching entry and value iterators may optionally include the property value resolved from the candidate object.
 * Prefix-bounded matching and candidate-independent subtree iteration retain the corresponding behavior of
 * {@link SafeAccessorMap}.
 *
 * @typeParam R - Weak root object type.
 * @typeParam V - Stored value type.
 */
export class WeakSafeAccessorMap<R extends object, V>
{
   /**
    * Shared empty trie used by matching and subtree methods when a weak root has no associated map.
    *
    * Delegating to an empty {@link SafeAccessorMap} preserves normal matching-option validation without allocating a
    * temporary iterator implementation or duplicating matching semantics in {@link WeakSafeAccessorMap}.
    */
   static readonly #emptySafeAccessorMap: SafeAccessorMap<never> = new SafeAccessorMap();

   /** Weak root-to-trie associations. Reassigned by {@link clear}. */
   #roots: WeakMap<R, SafeAccessorMap<V>> = new WeakMap();

   /**
    * Provides the standard object tag used by `Object.prototype.toString`.
    */
   get [Symbol.toStringTag](): string
   {
      return 'WeakSafeAccessorMap';
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   delete(root: R, accessor: SafeAccessor): boolean
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      if (map === void 0)
      {
         // Preserve SafeAccessorMap validation semantics even when no per-root trie exists.
         normalizeSafeAccessor(accessor);
         return false;
      }

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
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   get(root: R, accessor: SafeAccessor): V | undefined
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      if (map === void 0)
      {
         // Validate absent-root queries consistently with a populated SafeAccessorMap.
         normalizeSafeAccessor(accessor);
         return void 0;
      }

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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   has(root: R, accessor: SafeAccessor): boolean
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      if (map === void 0)
      {
         normalizeSafeAccessor(accessor);
         return false;
      }

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
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);
      return this.#roots.has(root);
   }

   /**
    * Returns a trie-aware iterator of matching entries for one root.
    *
    * Matching behavior, prefix pruning, `pathPrefix` / `stopAt` bounds, array-index rules, inherited-property
    * handling, optional candidate property values, and iteration order are delegated directly to
    * {@link SafeAccessorMap.matchingEntries}. A missing root behaves as an empty path trie while still validating
    * matching options during iterator consumption.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param data - Candidate object or function to match against stored paths.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of canonical matching paths, mapped values, and optionally resolved candidate property values.
    *
    * @throws {TypeError} If `root` is invalid, a boolean option has an invalid type, or an accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   matchingEntries(root: R, data: unknown,
    options: SafeAccessorMap.Options.Match & { includePropertyValue: true }):
     IterableIterator<[readonly PropertyKey[], V, unknown]>;

   matchingEntries(root: R, data: unknown,
    options?: SafeAccessorMap.Options.Match & { includePropertyValue?: false }):
     IterableIterator<[readonly PropertyKey[], V]>;

   matchingEntries(root: R, data: unknown, options?: SafeAccessorMap.Options.Match):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>;

   matchingEntries(root: R, data: unknown, options: SafeAccessorMap.Options.Match = {}):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ?
       WeakSafeAccessorMap.#emptySafeAccessorMap.matchingEntries(data, options) :
       map.matchingEntries(data, options);
   }

   /**
    * Returns a trie-aware iterator of canonical matching paths for one root.
    *
    * This delegates to {@link SafeAccessorMap.matchingKeys}; see {@link matchingEntries} for complete matching,
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
    * @throws {TypeError} If `root` is invalid, a boolean option has an invalid type, or an accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   matchingKeys(root: R, data: unknown, options?: SafeAccessorMap.Options.MatchKeys):
    IterableIterator<readonly PropertyKey[]>
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? WeakSafeAccessorMap.#emptySafeAccessorMap.matchingKeys(data, options) :
       map.matchingKeys(data, options);
   }

   /**
    * Returns a trie-aware iterator of mapped values whose paths match a candidate value for one root.
    *
    * By default, mapped values are yielded directly. Set `includePropertyValue` to `true` to receive
    * `[mappedValue, propertyValue]` tuples. Prefix and stop bounds are delegated to
    * {@link SafeAccessorMap.matchingValues}. A missing root produces an empty iterator while retaining normal option
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
    * @throws {TypeError} If `root` is invalid, a boolean option has an invalid type, or an accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   matchingValues(root: R, data: unknown,
    options: SafeAccessorMap.Options.Match & { includePropertyValue: true }): IterableIterator<[V, unknown]>;

   matchingValues(root: R, data: unknown,
    options?: SafeAccessorMap.Options.Match & { includePropertyValue?: false }): IterableIterator<V>;

   matchingValues(root: R, data: unknown, options?: SafeAccessorMap.Options.Match):
    IterableIterator<V | [V, unknown]>;

   matchingValues(root: R, data: unknown, options: SafeAccessorMap.Options.Match = {}):
    IterableIterator<V | [V, unknown]>
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? WeakSafeAccessorMap.#emptySafeAccessorMap.matchingValues(data, options) :
       map.matchingValues(data, options);
   }

   /**
    * Returns a bounded subtree entry iterator for one weak root.
    *
    * Candidate-independent subtree behavior, absolute `pathPrefix` selection, descendant pruning through `stopAt`,
    * and deterministic trie order are delegated to {@link SafeAccessorMap.subtreeEntries}. A missing root behaves as
    * an empty trie while still validating supplied accessors and prefix containment during iterator consumption.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored paths and mapped values.
    *
    * @throws {TypeError} If `root` or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   subtreeEntries(root: R, options: SafeAccessorMap.Options.Subtree = {}):
    IterableIterator<[readonly PropertyKey[], V]>
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? WeakSafeAccessorMap.#emptySafeAccessorMap.subtreeEntries(options) :
       map.subtreeEntries(options);
   }

   /**
    * Returns a bounded subtree key iterator for one weak root.
    *
    * This delegates to {@link SafeAccessorMap.subtreeKeys}. A missing root produces an empty iterator while retaining
    * normal option validation.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored accessor paths.
    *
    * @throws {TypeError} If `root` or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   subtreeKeys(root: R, options: SafeAccessorMap.Options.Subtree = {}):
    IterableIterator<readonly PropertyKey[]>
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? WeakSafeAccessorMap.#emptySafeAccessorMap.subtreeKeys(options) :
       map.subtreeKeys(options);
   }

   /**
    * Returns a bounded subtree value iterator for one weak root.
    *
    * This delegates to {@link SafeAccessorMap.subtreeValues}. A missing root produces an empty iterator while retaining
    * normal option validation.
    *
    * @param root - Weak root object or function identifying the stored path trie.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of mapped values.
    *
    * @throws {TypeError} If `root` or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   subtreeValues(root: R, options: SafeAccessorMap.Options.Subtree = {}): IterableIterator<V>
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      const map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      return map === void 0 ? WeakSafeAccessorMap.#emptySafeAccessorMap.subtreeValues(options) :
       map.subtreeValues(options);
   }

   /**
    * Stores a value at an exact structural path beneath a weak root.
    *
    * The per-root trie is created lazily on the first successful insertion. Invalid accessors therefore cannot leave
    * an empty root association behind. Existing roots reuse their current trie and retain all normal
    * {@link SafeAccessorMap.set} overwrite and insertion-order semantics.
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   set(root: R, accessor: SafeAccessor, value: V): this
   {
      WeakSafeAccessorMap.#assertWeakSafeAccessorMapRoot(root);

      let map: SafeAccessorMap<V> | undefined = this.#roots.get(root);

      if (map === void 0)
      {
         // Normalize before retaining the root so failed validation cannot create an empty association.
         const path: readonly PropertyKey[] = normalizeSafeAccessor(accessor);

         map = new SafeAccessorMap<V>();
         map.set(path, value);
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
   static #assertWeakSafeAccessorMapRoot(value: unknown): asserts value is object
   {
      if (value === null)
      {
         throw new TypeError(`WeakSafeAccessorMap error: 'root' is not an object or function.`);
      }

      const valueType: string = typeof value;

      if (valueType !== 'object' && valueType !== 'function')
      {
         throw new TypeError(`WeakSafeAccessorMap error: 'root' is not an object or function.`);
      }
   }
}
