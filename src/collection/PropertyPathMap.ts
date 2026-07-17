import {
   isArrayIndex,
   isObjectOrFunction }             from '../functions';

import {
   assertPropertyPathOptionsObject,
   consumePropertyPathTraversalResult,
   consumePropertyPathTraversalVisit,
   createPropertyPathTraversalBudget,
   DEFAULT_PROPERTY_PATH_DEPTH_LIMIT,
   DEFAULT_PROPERTY_PATH_ENTRY_LIMIT,
   DEFAULT_PROPERTY_PATH_NODE_LIMIT,
   DEFAULT_PROPERTY_PATH_RESULT_LIMIT,
   DEFAULT_PROPERTY_PATH_VISIT_LIMIT,
   normalizePropertyPathLimit,
   normalizePropertyPathTraversalBounds,
   normalizePropertyPathValue }     from '../internal';

import type {
   NormalizedPropertyPathTraversalBounds,
   PropertyPathTraversalBudget,
   PropertyPathTraversableValue }   from '../internal';

import type {
   PropertyPath,
   PropertyPathTraversalLimits }    from '../types';

/**
 * Stores values by structural {@link PropertyPath} paths using a property-key trie.
 *
 * `PropertyPathMap` combines exact structural path storage with trie-aware object matching and bounded subtree
 * traversal. In addition to normal map-style lookup, stored paths can be evaluated collectively against a candidate
 * object, allowing the map to operate as a reusable index of properties, bindings, field definitions, validators, or
 * other metadata associated with an object structure.
 *
 * Unlike `Map<readonly PropertyKey[], V>`, lookup does not depend on accessor-array identity. Equivalent paths resolve
 * to the same entry even when a new accessor array is supplied:
 *
 * @example
 * ```ts
 * const map = new PropertyPathMap<number>();
 *
 * map.set(['actors', 0, 'id'], 42);
 * map.get(['actors', 0, 'id']); // 42
 * ```
 *
 * Dotted strings and equivalent string-key arrays share the same trie path:
 *
 * @example
 * ```ts
 * map.set('settings.theme', 'dark');
 * map.get(['settings', 'theme']); // 'dark'
 * ```
 *
 * Exact array accessors remain necessary for symbols, numeric keys, empty-string keys, and string keys containing
 * literal periods.
 *
 * ## Iterator families
 *
 * The collection provides three complementary iterator families:
 *
 * - `entries`, `keys`, and `values` iterate all stored entries in normal map insertion order.
 * - `matchingEntries`, `matchingKeys`, and `matchingValues` evaluate stored paths against a candidate object.
 * - `subtreeEntries`, `subtreeKeys`, and `subtreeValues` traverse a selected trie branch without inspecting an object.
 *
 * Every iterator supports bounded operation through depth, result, and visit limits. Matching and subtree iterators
 * additionally support absolute `pathPrefix` and `stopAt` bounds.
 *
 * ## Candidate-object matching
 *
 * The matching iterators treat the stored trie as a reusable structural query over a candidate object:
 *
 * @example
 * ```ts
 * const fields = new PropertyPathMap<string>();
 *
 * fields.set('system.attributes.hp.value', 'hit-points');
 * fields.set('system.attributes.hp.max', 'maximum-hit-points');
 * fields.set('system.attributes.ac.value', 'armor-class');
 *
 * const actor = {
 *    system: {
 *       attributes: {
 *          hp: {
 *             value: 12
 *          }
 *       }
 *    }
 * };
 *
 * [...fields.matchingEntries(actor)];
 * // [
 * //    [['system', 'attributes', 'hp', 'value'], 'hit-points']
 * // ]
 * ```
 *
 * Matching traverses the property-key trie and candidate object together. Shared path prefixes are inspected only
 * once for each matching operation. When a candidate prefix is missing or cannot be traversed, the complete stored
 * subtree beneath that prefix is rejected without resolving each descendant path independently. This makes matching
 * particularly useful when the map contains many paths with common prefixes.
 *
 * `matchingKeys` yields only the available stored paths, while `matchingValues` yields only their mapped values.
 * `matchingEntries` yields both:
 *
 * ```ts
 * for (const path of fields.matchingKeys(actor))
 * {
 *    // path: readonly PropertyKey[]
 * }
 *
 * for (const field of fields.matchingValues(actor))
 * {
 *    // field: string
 * }
 *
 * for (const [path, field] of fields.matchingEntries(actor))
 * {
 *    // path: readonly PropertyKey[]
 *    // field: string
 * }
 * ```
 *
 * By default, matching determines terminal property availability without reading the terminal value. This avoids
 * invoking a terminal getter or proxy `get` trap merely to establish that a path exists.
 *
 * Set `includePropertyValue` to include the resolved candidate value in the iterator result:
 *
 * @example
 * ```ts
 * for (const [path, field, propertyValue] of fields.matchingEntries(actor, {
 *    includePropertyValue: true
 * }))
 * {
 *    // path: readonly PropertyKey[]
 *    // field: string
 *    // propertyValue: unknown
 * }
 *
 * for (const [field, propertyValue] of fields.matchingValues(actor, {
 *    includePropertyValue: true
 * }))
 * {
 *    // field: string
 *    // propertyValue: unknown
 * }
 * ```
 *
 * The overloads for `matchingEntries` and `matchingValues` reflect a literal `includePropertyValue: true` option in
 * the returned iterator type.
 *
 * Matching follows normal JavaScript property lookup by default. Set `hasOwnOnly` to require every matched segment to
 * be an own property of the candidate value reached at that depth.
 *
 * ## Prefix and stop bounds
 *
 * `pathPrefix` begins matching or subtree traversal directly at one absolute stored trie path. Unrelated branches are
 * never visited:
 *
 * @example
 * ```ts
 * fields.matchingEntries(actor, {
 *    pathPrefix: 'system.attributes.hp'
 * });
 * ```
 *
 * Returned paths remain absolute. The prefix itself is included when it stores a mapped value and satisfies the
 * iterator operation.
 *
 * `stopAt` includes a selected path when it stores a value, but prunes every stored descendant beneath it:
 *
 * @example
 * ```ts
 * fields.matchingEntries(actor, {
 *    pathPrefix: 'system.attributes',
 *    stopAt: 'system.attributes.hp'
 * });
 * ```
 *
 * When both options are supplied, `stopAt` must equal or descend from `pathPrefix`.
 *
 * `maxDepth` is measured relative to `pathPrefix`, or relative to the trie root when no prefix is supplied.
 *
 * ## Candidate-independent subtree traversal
 *
 * Subtree iterators traverse stored entries without accessing a candidate object:
 *
 * @example
 * ```ts
 * for (const [path, field] of fields.subtreeEntries({
 *    pathPrefix: 'system.attributes.hp'
 * }))
 * {
 *    // Every yielded entry belongs to the stored HP subtree.
 * }
 * ```
 *
 * These iterators are useful for inspecting, processing, or removing logical groups of stored paths without scanning
 * unrelated branches. They share the same `pathPrefix`, `stopAt`, `maxDepth`, `maxResults`, and `maxVisits` controls
 * as matching traversal.
 *
 * Matching and subtree iterators use deterministic depth-first trie order rather than global insertion order.
 *
 * ## Key semantics
 *
 * Each path segment is stored in a native `Map<PropertyKey, ...>`:
 *
 * - Strings compare by value.
 * - Numbers compare with `Map` / SameValueZero semantics.
 * - Symbols compare by identity.
 * - Numeric and string segments remain distinct (`0` is not `'0'`).
 *
 * Stored canonical paths are copied and frozen once when first inserted. Overwriting an existing entry retains its
 * original insertion position and canonical path. Deleting and reinserting a path moves it to the end, matching normal
 * `Map` insertion-order behavior.
 *
 * ## Defensive limits
 *
 * Every instance applies configurable limits to stored path depth, terminal entries, allocated trie nodes, yielded
 * traversal results, and traversal visits. Storage limits are preflighted before mutation, so failed insertion cannot
 * leave a partial trie branch. Per-call `maxDepth`, `maxResults`, and `maxVisits` options may reduce, but never exceed,
 * the constructor traversal caps.
 *
 * Reaching `maxResults` ends an iterator normally after the configured number of results. Exceeding `maxVisits` throws
 * before another candidate property or trie node is processed during the iterative walk. Path normalization and fixed-
 * depth trie scope lookup are bounded separately by `maxPathDepth`. These limits do not measure the retained size of
 * mapped values or individual property keys.
 *
 * Candidate-object matching may invoke getters and proxy traps when descendant traversal or an explicitly requested
 * terminal property value requires a read. Exceptions from those operations are intentionally propagated.
 *
 * ## Complexity
 *
 * `get`, `has`, and `set` are `O(path length)`. `delete` is also `O(path length)` and prunes unused trie nodes.
 * Normal map iteration is `O(entry count)` and follows insertion order through a linked list of terminal entries.
 *
 * Trie-aware matching visits only reachable stored prefixes. An unavailable candidate prefix rejects every stored
 * descendant beneath it with one candidate-property check. Matching entry and value iterators may optionally include
 * the resolved candidate property value without performing a second path lookup.
 *
 * `pathPrefix` begins traversal directly at a selected stored trie node, while `stopAt` prunes one descendant branch
 * by node identity. Candidate-independent subtree iterators visit only terminal entries beneath the selected node.
 *
 * Mutation of the map while an iterator is active is intentionally unspecified.
 *
 * @category Property Path Collections
 *
 * @typeParam V - Stored value type.
 */
class PropertyPathMap<V> implements Iterable<[readonly PropertyKey[], V]>
{
   /** Root trie node. Empty accessors are invalid, so the root never stores an entry. */
   #root: PropertyPathMapNode<V> = {};

   /** First terminal entry in insertion order. */
   #firstEntry: PropertyPathMapEntry<V> | undefined;

   /** Last terminal entry in insertion order. */
   #lastEntry: PropertyPathMapEntry<V> | undefined;

   /** Number of exact paths currently storing values. */
   #size = 0;

   /** Number of allocated non-root trie nodes. */
   #nodeCount = 0;

   /** Maximum accepted path depth. */
   readonly #maxPathDepth: number;

   /** Maximum number of stored terminal entries. */
   readonly #maxEntries: number;

   /** Maximum number of allocated non-root trie nodes. */
   readonly #maxNodes: number;

   /** Maximum results permitted by one traversal. */
   readonly #maxTraversalResults: number;

   /** Maximum visits permitted by one traversal. */
   readonly #maxTraversalVisits: number;

   /**
    * Creates a new path map and optionally initializes it from accessor / value pairs.
    *
    * Later duplicate paths overwrite earlier values without changing the original insertion position. Resource limits
    * are validated before initial entries are inserted and apply to every subsequent operation.
    *
    * @param entries - Optional initial accessor / value entries.
    *
    * @param options - Defensive storage and traversal limits.
    *
    * @param options.maxEntries - Maximum number of exact stored paths; default: `16384`.
    * @param options.maxNodes - Maximum number of allocated non-root trie nodes; default: `65536`.
    * @param options.maxPathDepth - Maximum number of property-key segments in any stored path; default: `64`.
    * @param options.maxTraversalResults - Maximum results produced by one iterator unless reduced per call; default:
    *        `16384`.
    * @param options.maxTraversalVisits - Maximum properties or trie nodes inspected by one iterator unless reduced per
    *        call; default: `65536`.
    *
    * @throws {TypeError} If a constructor option is not a non-negative safe integer.
    * @throws {RangeError} If an initial entry exceeds a configured storage limit.
    */
   constructor(entries?: Iterable<readonly [PropertyPath, V]> | null,
    options: PropertyPathMap.Options.Constructor = {})
   {
      const limits: PropertyPathMapLimits = normalizePropertyPathMapLimits(options);

      this.#maxPathDepth = limits.maxPathDepth;
      this.#maxEntries = limits.maxEntries;
      this.#maxNodes = limits.maxNodes;
      this.#maxTraversalResults = limits.maxTraversalResults;
      this.#maxTraversalVisits = limits.maxTraversalVisits;

      if (entries === void 0 || entries === null) { return; }

      for (const [accessor, value] of entries) { this.set(accessor, value); }
   }

   /**
    * Number of exact accessor paths currently stored.
    */
   get size(): number
   {
      return this.#size;
   }

   /**
    * Number of allocated non-root trie nodes.
    *
    * This value is maintained incrementally and may be used to monitor current trie resource consumption.
    */
   get nodeCount(): number
   {
      return this.#nodeCount;
   }

   /**
    * Provides the standard object tag used by `Object.prototype.toString`.
    */
   get [Symbol.toStringTag](): string
   {
      return 'PropertyPathMap';
   }

   /**
    * Removes every stored entry and releases the complete trie.
    *
    * This operation is `O(1)` with respect to explicit traversal; the prior structure becomes available for garbage
    * collection once no active iterator or external references remain.
    */
   clear(): void
   {
      this.#root = {};
      this.#firstEntry = void 0;
      this.#lastEntry = void 0;
      this.#size = 0;
      this.#nodeCount = 0;
   }

   /**
    * Deletes the value stored at an exact accessor path.
    *
    * Descendant entries do not count as a match. Deleting `['settings']` does not remove
    * `['settings', 'theme']`, and deleting a parentless path does not affect siblings.
    *
    * After removal, unused nodes are pruned from the terminal node toward the root. Pruning stops at the first node
    * that still stores a value or has another child.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @returns `true` when an entry existed and was removed; otherwise `false`.
    *
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path exceeds the configured `maxPathDepth`.
    */
   delete(accessor: PropertyPath): boolean
   {
      const path: readonly PropertyKey[] = this.#normalizeStoredPath(accessor);
      const frames: PropertyPathMapDeleteFrame<V>[] = [];
      let node: PropertyPathMapNode<V> = this.#root;

      // Record every parent / child edge so empty nodes can be removed after deleting the terminal entry.
      for (const key of path)
      {
         const child: PropertyPathMapNode<V> | undefined = node.children?.get(key);

         if (child === void 0) { return false; }

         frames.push({ parent: node, key, child });
         node = child;
      }

      const entry: PropertyPathMapEntry<V> | undefined = node.entry;

      // The path may exist only as a prefix for longer stored paths.
      if (entry === void 0) { return false; }

      this.#unlinkEntry(entry);
      delete node.entry;
      this.#size--;

      // Remove unused nodes from the leaf upward while preserving value-bearing prefixes and sibling branches.
      for (let index: number = frames.length - 1; index >= 0; index--)
      {
         const { parent, key, child } = frames[index];

         if (child.entry !== void 0 || (child.children?.size ?? 0) > 0) { break; }

         parent.children?.delete(key);
         this.#nodeCount--;

         // Avoid retaining empty child maps on otherwise reusable prefix nodes.
         if (parent.children?.size === 0) { delete parent.children; }
      }

      return true;
   }

   /**
    * Returns an insertion-order iterator of `[path, value]` pairs.
    *
    * Paths are canonical frozen arrays owned by this map. `maxDepth` is measured from the trie root, `maxResults`
    * truncates the iterator normally, and `maxVisits` throws when exceeded. Yielded entries retain insertion order.
    *
    * @param options - Optional insertion-order traversal limits.
    *
    * @returns Entry iterator.
    *
    * @throws {TypeError} If a numeric traversal option is invalid.
    * @throws {RangeError} If `options.maxVisits` is exceeded.
    */
   *entries(options: PropertyPathMap.Options.Iteration = {}): IterableIterator<[readonly PropertyKey[], V]>
   {
      for (const entry of this.#insertionEntryIterator(options)) { yield [entry.path, entry.value]; }
   }

   /**
    * Invokes a callback once for every entry in insertion order.
    *
    * The callback arguments follow `Map.prototype.forEach`: value, key, then map. The key is the canonical readonly
    * property-key array associated with the stored entry. Unlike the explicit iterator methods, `forEach` always
    * visits the complete map, which is already bounded by the configured `maxEntries` storage limit.
    *
    * @param callback - Function invoked for each entry.
    *
    * @param thisArg - Optional callback `this` value.
    */
   forEach(callback: (value: V, key: readonly PropertyKey[], map: PropertyPathMap<V>) => void,
    thisArg?: unknown): void
   {
      for (let entry: PropertyPathMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
      {
         callback.call(thisArg, entry.value, entry.path, this);
      }
   }

   /**
    * Retrieves the value stored at an exact structural path.
    *
    * `undefined` may mean either that the path is absent or that `undefined` is the stored value. Use {@link has} when
    * that distinction matters.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @returns Stored value or `undefined` when the exact path is absent.
    *
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path exceeds the configured `maxPathDepth`.
    */
   get(accessor: PropertyPath): V | undefined
   {
      return this.#findNode(this.#normalizeStoredPath(accessor))?.entry?.value;
   }

   /**
    * Determines whether a value is stored at an exact structural path.
    *
    * Descendant paths do not cause a prefix to be reported as present.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @returns Whether the exact path stores a value.
    *
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path exceeds the configured `maxPathDepth`.
    */
   has(accessor: PropertyPath): boolean
   {
      return this.#findNode(this.#normalizeStoredPath(accessor))?.entry !== void 0;
   }

   /**
    * Returns the default insertion-order iterator of `[path, value]` pairs.
    *
    * Constructor-level traversal result and visit caps apply. Use {@link entries} when per-call limits are required.
    */
   [Symbol.iterator](): IterableIterator<[readonly PropertyKey[], V]>
   {
      return this.entries();
   }

   /**
    * Returns an insertion-order iterator of canonical property-key paths.
    *
    * `maxDepth` is measured from the trie root, `maxResults` truncates normally, and `maxVisits` throws when exceeded.
    *
    * @param options - Optional insertion-order traversal limits.
    *
    * @returns Key iterator.
    *
    * @throws {TypeError} If a numeric traversal option is invalid.
    * @throws {RangeError} If `options.maxVisits` is exceeded.
    */
   *keys(options: PropertyPathMap.Options.Iteration = {}): IterableIterator<readonly PropertyKey[]>
   {
      for (const entry of this.#insertionEntryIterator(options)) { yield entry.path; }
   }

   /**
    * Yields stored entries whose complete paths are available in a candidate value.
    *
    * Matching traverses the property-key trie directly instead of resolving every stored path independently. Once a
    * candidate prefix is missing or cannot be traversed, every stored descendant below that prefix is rejected without
    * additional property access. Shared prefixes are therefore checked and read at most once per matching operation.
    *
    * Set `pathPrefix` to begin matching at one absolute stored path and ignore every unrelated trie branch. The prefix
    * itself is yielded when it stores an entry and exists in the candidate object. Set `stopAt` to match one absolute
    * path normally while pruning every stored descendant beneath it. Returned paths always remain absolute.
    *
    * A terminal property is considered available when it exists, even when its value is `undefined` or `null`. By
    * default, terminal-only properties are not read, avoiding unnecessary getter and proxy `get` trap invocation. Set
    * `includePropertyValue` to `true` to append the resolved candidate property value to each yielded tuple.
    *
    * Array matching follows the same rules as the package property-path utilities: numeric indexes must be numbers in
    * the ECMAScript array-index range, while symbol properties remain valid. String array indexes such as `'0'` are
    * rejected. Ordinary objects retain normal JavaScript key coercion semantics.
    *
    * Circular candidate values are safe because traversal is bounded by the finite depth of the stored trie; no cycle
    * tracking is required.
    *
    * Matching uses depth-first trie order, with sibling branches following the order in which their first trie nodes
    * were created. This order is deterministic for an unchanged map but is not the map's global insertion order.
    * `maxDepth` is relative to `pathPrefix`, or to the trie root when no prefix is supplied. `maxResults` truncates
    * normally, while `maxVisits` throws before another candidate property or trie node is processed.
    *
    * @param data - Candidate object or function to inspect. Non-traversable values produce an empty iterator.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of canonical stored paths and their associated mapped values, optionally followed by the
    *          resolved candidate property value.
    *
    * @throws {TypeError} If a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If a path bound exceeds configured limits, `options.stopAt` is outside
    *          `options.pathPrefix`, or `options.maxVisits` is exceeded.
    */
   matchingEntries(data: unknown, options: PropertyPathMap.Options.Match & { includePropertyValue: true }):
    IterableIterator<[readonly PropertyKey[], V, unknown]>;

   matchingEntries(data: unknown, options?: PropertyPathMap.Options.Match & { includePropertyValue?: false }):
    IterableIterator<[readonly PropertyKey[], V]>;

   matchingEntries(data: unknown, options?: PropertyPathMap.Options.Match):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>;

   *matchingEntries(data: unknown, options: PropertyPathMap.Options.Match = {}):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>
   {
      assertPropertyPathOptionsObject(options, 'PropertyPathMap matching');

      const includePropertyValue: boolean = options.includePropertyValue ?? false;

      for (const match of this.#matchingEntryIterator(data, options))
      {
         yield includePropertyValue ?
          [match.entry.path, match.entry.value, match.propertyValue] :
          [match.entry.path, match.entry.value];
      }
   }

   /**
    * Yields canonical stored paths whose complete accessors are available in a candidate value.
    *
    * This is a path-only projection of {@link matchingEntries} and uses the same trie-aware pruning, prefix / stop
    * bounds, property semantics, and depth-first trie order. Candidate terminal values are never requested solely for
    * this iterator; properties are read only when descendant traversal requires them.
    *
    * @param data - Candidate object or function to inspect.
    *
    * @param options - Path-only matching options.
    *
    * @returns Iterator of matching canonical property-key paths.
    *
    * @throws {TypeError} If a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   *matchingKeys(data: unknown, options?: PropertyPathMap.Options.MatchKeys):
    IterableIterator<readonly PropertyKey[]>
   {
      for (const match of this.#matchingEntryIterator(data, options)) { yield match.entry.path; }
   }

   /**
    * Yields mapped values whose stored accessor paths are available in a candidate value.
    *
    * By default, this returns only each value stored in the map. Set `includePropertyValue` to `true` to return
    * `[mappedValue, propertyValue]` tuples, where `propertyValue` is resolved from the candidate data object at the
    * matching accessor path. Prefix and stop bounds follow the semantics documented by {@link matchingEntries}.
    *
    * @param data - Candidate object or function to inspect.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of mapped values or mapped-value / candidate-property-value tuples.
    *
    * @throws {TypeError} If a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   matchingValues(data: unknown, options: PropertyPathMap.Options.Match & { includePropertyValue: true }):
    IterableIterator<[V, unknown]>;

   matchingValues(data: unknown, options?: PropertyPathMap.Options.Match & { includePropertyValue?: false }):
    IterableIterator<V>;

   matchingValues(data: unknown, options?: PropertyPathMap.Options.Match):
    IterableIterator<V | [V, unknown]>;

   *matchingValues(data: unknown, options: PropertyPathMap.Options.Match = {}):
    IterableIterator<V | [V, unknown]>
   {
      assertPropertyPathOptionsObject(options, 'PropertyPathMap matching');

      const includePropertyValue: boolean = options.includePropertyValue ?? false;

      for (const match of this.#matchingEntryIterator(data, options))
      {
         yield includePropertyValue ? [match.entry.value, match.propertyValue] : match.entry.value;
      }
   }

   /**
    * Yields stored entries from one trie subtree without inspecting a candidate data object.
    *
    * `pathPrefix` selects the absolute trie node where traversal begins. The prefix entry is included when the exact
    * path stores a value, even when it has no descendants. A missing stored prefix produces an empty iterator.
    * `stopAt` includes its own entry when present and prunes all descendants beneath that node.
    *
    * Subtree traversal uses deterministic depth-first trie order rather than global insertion order. Returned
    * canonical paths remain absolute and are reused from their stored entries. `maxDepth` is relative to `pathPrefix`,
    * or to the trie root when no prefix is supplied. `maxResults` truncates normally, while `maxVisits` throws.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored paths and mapped values.
    *
    * @throws {TypeError} If a numeric limit or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   *subtreeEntries(options: PropertyPathMap.Options.Subtree = {}):
    IterableIterator<[readonly PropertyKey[], V]>
   {
      for (const entry of this.#subtreeEntryIterator(options)) { yield [entry.path, entry.value]; }
   }

   /**
    * Yields canonical stored paths from one trie subtree.
    *
    * This is a path-only projection of {@link subtreeEntries}. It performs no candidate object access and allocates no
    * temporary entry tuples.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored property-key paths.
    *
    * @throws {TypeError} If a numeric limit or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   *subtreeKeys(options: PropertyPathMap.Options.Subtree = {}): IterableIterator<readonly PropertyKey[]>
   {
      for (const entry of this.#subtreeEntryIterator(options)) { yield entry.path; }
   }

   /**
    * Yields mapped values from one trie subtree.
    *
    * This is a value-only projection of {@link subtreeEntries}. It performs no candidate object access and allocates no
    * temporary entry tuples.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of mapped values.
    *
    * @throws {TypeError} If a numeric limit or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   *subtreeValues(options: PropertyPathMap.Options.Subtree = {}): IterableIterator<V>
   {
      for (const entry of this.#subtreeEntryIterator(options)) { yield entry.value; }
   }

   /**
    * Stores a value at an exact structural path.
    *
    * Existing trie nodes are inspected first so path depth, entry count, and node count limits can be validated before
    * any mutation occurs. Overwriting an existing path updates only its value, preserving size and insertion order.
    * A new entry copies and freezes its normalized path once for stable iteration.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @param value - Value to store. `undefined` is valid.
    *
    * @returns This map.
    *
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    * @throws {RangeError} If the path depth, entry count, or trie node count limit would be exceeded.
    */
   set(accessor: PropertyPath, value: V): this
   {
      const path: readonly PropertyKey[] = this.#normalizeStoredPath(accessor);
      let node: PropertyPathMapNode<V> = this.#root;
      let missingIndex = -1;

      // Preflight the existing prefix without allocating nodes so every configured resource limit can fail atomically.
      for (let index: number = 0; index < path.length; index++)
      {
         const child: PropertyPathMapNode<V> | undefined = node.children?.get(path[index]);

         if (child === void 0)
         {
            missingIndex = index;
            break;
         }

         node = child;
      }

      if (missingIndex === -1 && node.entry !== void 0)
      {
         // Match native Map overwrite behavior: update the value without changing insertion order or size.
         node.entry.value = value;
         return this;
      }

      const missingNodes: number = missingIndex === -1 ? 0 : path.length - missingIndex;

      if (this.#size >= this.#maxEntries)
      {
         throw new RangeError(`PropertyPathMap error: Insertion exceeds configured 'maxEntries' of ` +
          `${this.#maxEntries}.`);
      }

      if (missingNodes > this.#maxNodes - this.#nodeCount)
      {
         throw new RangeError(`PropertyPathMap error: Insertion exceeds configured 'maxNodes' of ` +
          `${this.#maxNodes}.`);
      }

      // Allocate only the preflighted missing suffix; existing prefixes remain shared by related paths.
      if (missingIndex !== -1)
      {
         for (let index: number = missingIndex; index < path.length; index++)
         {
            const children: Map<PropertyKey, PropertyPathMapNode<V>> = node.children ??= new Map();
            const child: PropertyPathMapNode<V> = {};

            children.set(path[index], child);
            node = child;
         }

         this.#nodeCount += missingNodes;
      }

      const canonicalPath: readonly PropertyKey[] = Object.freeze(Array.from(path));
      const entry: PropertyPathMapEntry<V> = { path: canonicalPath, value };

      node.entry = entry;
      this.#appendEntry(entry);
      this.#size++;

      return this;
   }

   /**
    * Returns an insertion-order iterator of stored values.
    *
    * `maxDepth` is measured from the trie root, `maxResults` truncates normally, and `maxVisits` throws when exceeded.
    *
    * @param options - Optional insertion-order traversal limits.
    *
    * @returns Value iterator.
    *
    * @throws {TypeError} If a numeric traversal option is invalid.
    * @throws {RangeError} If `options.maxVisits` is exceeded.
    */
   *values(options: PropertyPathMap.Options.Iteration = {}): IterableIterator<V>
   {
      for (const entry of this.#insertionEntryIterator(options)) { yield entry.value; }
   }

   // Internal Utility Functions -------------------------------------------------------------------------------------

   /**
    * Returns insertion-order entries constrained by optional defensive traversal limits.
    */
   *#insertionEntryIterator(options: PropertyPathMap.Options.Iteration = {}):
    IterableIterator<PropertyPathMapEntry<V>>
   {
      assertPropertyPathOptionsObject(options, 'PropertyPathMap iteration');

      const bounds: NormalizedPropertyPathTraversalBounds = normalizePropertyPathTraversalBounds({
         maxDepth: options.maxDepth,
         maxResults: options.maxResults,
         maxVisits: options.maxVisits
      }, {
         errorPrefix: 'PropertyPathMap iteration',
         prefixOption: 'pathPrefix',
         stopOption: 'stopAt',
         defaultMaxResults: this.#maxTraversalResults,
         defaultMaxVisits: this.#maxTraversalVisits,
         maxResultsLimit: this.#maxTraversalResults,
         maxVisitsLimit: this.#maxTraversalVisits
      });
      const budget: PropertyPathTraversalBudget = createPropertyPathTraversalBudget(bounds,
       'PropertyPathMap iteration');
      const maxPathLength: number = Math.min(bounds.maxPathLength, this.#maxPathDepth);

      if (budget.maxResults === 0) { return; }

      for (let entry: PropertyPathMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
      {
         if (budget.results >= budget.maxResults) { return; }

         consumePropertyPathTraversalVisit(budget);

         if (entry.path.length > maxPathLength) { continue; }
         consumePropertyPathTraversalResult(budget);

         yield entry;
      }
   }

   /**
    * Normalizes a stored path and enforces the configured path-depth limit before trie access.
    */
   #normalizeStoredPath(accessor: PropertyPath): readonly PropertyKey[]
   {
      const path: readonly PropertyKey[] = normalizePropertyPathValue(accessor,
       `normalizePropertyPath error: 'path' is not a valid property path.`);

      if (path.length > this.#maxPathDepth)
      {
         throw new RangeError(`PropertyPathMap error: Path depth ${path.length} exceeds configured ` +
          `'maxPathDepth' of ${this.#maxPathDepth}.`);
      }

      return path;
   }

   /**
    * Adds a newly created terminal entry to the insertion-order list.
    *
    * Called by {@link set} only when a path did not previously store a value.
    */
   #appendEntry(entry: PropertyPathMapEntry<V>): void
   {
      if (this.#lastEntry === void 0)
      {
         this.#firstEntry = entry;
         this.#lastEntry = entry;
         return;
      }

      entry.previous = this.#lastEntry;
      this.#lastEntry.next = entry;
      this.#lastEntry = entry;
   }

   /**
    * Locates the trie node reached by a normalized path without creating nodes.
    *
    * Called by {@link get} and {@link has}. Keeping lookup separate from insertion avoids allocating child maps or
    * nodes during read-only operations.
    *
    * @param path - Valid normalized property-key path.
    *
    * @returns Reached node or `undefined` when any segment is absent.
    */
   #findNode(path: readonly PropertyKey[]): PropertyPathMapNode<V> | undefined
   {
      let node: PropertyPathMapNode<V> = this.#root;

      for (const key of path)
      {
         const child: PropertyPathMapNode<V> | undefined = node.children?.get(key);

         if (child === void 0) { return void 0; }

         node = child;
      }

      return node;
   }

   /**
    * Yields terminal entries whose stored paths exist in a candidate value.
    *
    * Matching traversal shares normalized prefix, stop, depth, result, and visit bounds with subtree and object-path
    * traversal. Candidate properties are read only when a descendant must be traversed or a terminal property value
    * is explicitly requested. Getter and proxy exceptions are intentionally propagated.
    *
    * @param data - Candidate object or function to inspect.
    * @param options - Matching options.
    *
    * @returns Iterator of matching terminal entries and optionally resolved candidate property values.
    *
    * @throws {TypeError} If a boolean, numeric limit, or path option is invalid.
    * @throws {RangeError} If path bounds exceed configured limits or `options.maxVisits` is exceeded.
    */
   *#matchingEntryIterator(data: unknown, options: PropertyPathMap.Options.MatchKeys |
    PropertyPathMap.Options.Match = {}): IterableIterator<PropertyPathMapMatch<V>>
   {
      assertPropertyPathOptionsObject(options, 'PropertyPathMap matching');

      const hasOwnOnly: boolean = options.hasOwnOnly ?? false;
      const includePropertyValue: boolean = 'includePropertyValue' in options ?
       options.includePropertyValue ?? false : false;

      if (typeof hasOwnOnly !== 'boolean')
      {
         throw new TypeError(`PropertyPathMap matching error: 'options.hasOwnOnly' is not a boolean.`);
      }

      if (typeof includePropertyValue !== 'boolean')
      {
         throw new TypeError(`PropertyPathMap matching error: 'options.includePropertyValue' is not a boolean.`);
      }

      const { bounds, startNode, stopNode } = this.#resolveTraversalScope(options);
      const budget: PropertyPathTraversalBudget = createPropertyPathTraversalBudget(bounds,
       'PropertyPathMap traversal');

      // Resolve trie bounds before touching candidate data so a missing stored prefix rejects the operation cheaply.
      if (budget.maxResults === 0 || startNode === void 0 || !isObjectOrFunction(data)) { return; }

      const startPathLength: number = bounds.prefixPath?.length ?? 0;
      let stack: PropertyPathMapMatchFrame<V>[];

      if (bounds.prefixPath !== void 0)
      {
         let candidate: PropertyPathTraversableValue = data;
         let propertyValue: unknown;

         // Resolve the selected absolute prefix against the candidate once before entering general subtree traversal.
         for (let index: number = 0; index < bounds.prefixPath.length; index++)
         {
            consumePropertyPathTraversalVisit(budget);

            const key: PropertyKey = bounds.prefixPath[index];

            // Arrays reject string indexes and non-index string properties consistently at every prefix depth.
            if (Array.isArray(candidate) && typeof key !== 'symbol' && !isArrayIndex(key)) { return; }

            const exists: boolean = hasOwnOnly ? Object.hasOwn(candidate, key) : key in candidate;

            if (!exists) { return; }

            const isFinal: boolean = index === bounds.prefixPath.length - 1;
            const canDescend: boolean = isFinal && startPathLength < bounds.maxPathLength &&
             startNode !== stopNode && startNode.children !== void 0;
            const requiresRead: boolean = !isFinal ||
             (isFinal && ((startNode.entry !== void 0 && includePropertyValue) || canDescend));

            propertyValue = void 0;

            if (requiresRead)
            {
               propertyValue = (candidate as unknown as Record<PropertyKey, unknown>)[key];
            }

            if (!isFinal)
            {
               if (!isObjectOrFunction(propertyValue)) { return; }
               candidate = propertyValue;
            }
         }

         if (startNode.entry !== void 0)
         {
            consumePropertyPathTraversalResult(budget);
            yield { entry: startNode.entry, propertyValue };
         }

         if (budget.results >= budget.maxResults || startPathLength >= bounds.maxPathLength ||
          startNode === stopNode || startNode.children === void 0 || !isObjectOrFunction(propertyValue))
         {
            return;
         }

         stack = [{ value: propertyValue, iterator: startNode.children.entries(), pathLength: startPathLength }];
      }
      else
      {
         const rootChildren: Map<PropertyKey, PropertyPathMapNode<V>> | undefined = startNode.children;

         if (rootChildren === void 0 || bounds.maxPathLength === 0) { return; }

         stack = [{ value: data, iterator: rootChildren.entries(), pathLength: 0 }];
      }

      while (stack.length > 0)
      {
         if (budget.results >= budget.maxResults) { return; }

         const frame: PropertyPathMapMatchFrame<V> = stack[stack.length - 1];
         const result: IteratorResult<[PropertyKey, PropertyPathMapNode<V>]> = frame.iterator.next();

         if (result.done)
         {
            stack.pop();
            continue;
         }

         consumePropertyPathTraversalVisit(budget);

         const [key, child] = result.value;
         const childPathLength: number = frame.pathLength + 1;

         // Arrays deliberately reject string indexes and non-index string properties to match PropertyPath traversal.
         if (Array.isArray(frame.value) && typeof key !== 'symbol' && !isArrayIndex(key)) { continue; }

         const exists: boolean = hasOwnOnly ? Object.hasOwn(frame.value, key) : key in frame.value;

         // A missing prefix rejects this node and every stored path below it.
         if (!exists) { continue; }

         const isStopNode: boolean = child === stopNode;
         const canDescend: boolean = child.children !== void 0 && !isStopNode &&
          childPathLength < bounds.maxPathLength;
         let propertyValue: unknown;

         // Terminal-only properties are not read unless explicitly requested.
         if ((child.entry !== void 0 && includePropertyValue) || canDescend)
         {
            propertyValue = (frame.value as unknown as Record<PropertyKey, unknown>)[key];
         }

         if (child.entry !== void 0)
         {
            consumePropertyPathTraversalResult(budget);
            yield { entry: child.entry, propertyValue };
         }

         if (budget.results >= budget.maxResults || !canDescend || !isObjectOrFunction(propertyValue)) { continue; }

         stack.push({ value: propertyValue, iterator: child.children!.entries(), pathLength: childPathLength });
      }
   }

   /**
    * Normalizes and resolves common absolute path and resource bounds used by every trie traversal.
    *
    * Accessor and numeric validation occur before trie or candidate access. Per-call result and visit limits may reduce,
    * but never exceed, the constructor-level traversal caps.
    */
   #resolveTraversalScope(options: PropertyPathMap.Options.Common = {}): PropertyPathMapTraversalScope<V>
   {
      assertPropertyPathOptionsObject(options, 'PropertyPathMap traversal');

      const { pathPrefix, stopAt, maxDepth, maxResults, maxVisits } = options;
      const normalized: NormalizedPropertyPathTraversalBounds = normalizePropertyPathTraversalBounds({
         prefixPath: pathPrefix,
         stopPath: stopAt,
         maxDepth,
         maxResults,
         maxVisits
      }, {
         errorPrefix: 'PropertyPathMap traversal',
         prefixOption: 'pathPrefix',
         stopOption: 'stopAt',
         defaultMaxResults: this.#maxTraversalResults,
         defaultMaxVisits: this.#maxTraversalVisits,
         maxResultsLimit: this.#maxTraversalResults,
         maxVisitsLimit: this.#maxTraversalVisits,
         stopOutsideMessage: `PropertyPathMap traversal error: 'options.stopAt' is outside ` +
          `'options.pathPrefix'.`
      });

      if (normalized.prefixPath !== void 0 && normalized.prefixPath.length > this.#maxPathDepth)
      {
         throw new RangeError(`PropertyPathMap traversal error: 'options.pathPrefix' exceeds configured ` +
          `'maxPathDepth' of ${this.#maxPathDepth}.`);
      }

      if (normalized.stopPath !== void 0 && normalized.stopPath.length > this.#maxPathDepth)
      {
         throw new RangeError(`PropertyPathMap traversal error: 'options.stopAt' exceeds configured ` +
          `'maxPathDepth' of ${this.#maxPathDepth}.`);
      }

      const bounds: NormalizedPropertyPathTraversalBounds = {
         ...normalized,
         maxPathLength: Math.min(normalized.maxPathLength, this.#maxPathDepth)
      };

      return {
         bounds,
         startNode: bounds.prefixPath === void 0 ? this.#root : this.#findNode(bounds.prefixPath),
         stopNode: bounds.stopPath === void 0 ? void 0 : this.#findNode(bounds.stopPath)
      };
   }

   /**
    * Yields terminal entries from one bounded trie subtree without inspecting candidate data.
    */
   *#subtreeEntryIterator(options: PropertyPathMap.Options.Subtree = {}):
    IterableIterator<PropertyPathMapEntry<V>>
   {
      const { bounds, startNode, stopNode } = this.#resolveTraversalScope(options);
      const budget: PropertyPathTraversalBudget = createPropertyPathTraversalBudget(bounds,
       'PropertyPathMap traversal');

      if (budget.maxResults === 0 || startNode === void 0) { return; }

      const startPathLength: number = bounds.prefixPath?.length ?? 0;

      if (startNode.entry !== void 0)
      {
         consumePropertyPathTraversalResult(budget);
         yield startNode.entry;
      }

      if (budget.results >= budget.maxResults || startPathLength >= bounds.maxPathLength ||
       startNode === stopNode || startNode.children === void 0)
      {
         return;
      }

      const stack: PropertyPathMapSubtreeFrame<V>[] = [{
         iterator: startNode.children.entries(),
         pathLength: startPathLength
      }];

      while (stack.length > 0)
      {
         if (budget.results >= budget.maxResults) { return; }

         const frame: PropertyPathMapSubtreeFrame<V> = stack[stack.length - 1];
         const result: IteratorResult<[PropertyKey, PropertyPathMapNode<V>]> = frame.iterator.next();

         if (result.done)
         {
            stack.pop();
            continue;
         }

         consumePropertyPathTraversalVisit(budget);

         const child: PropertyPathMapNode<V> = result.value[1];
         const childPathLength: number = frame.pathLength + 1;

         if (child.entry !== void 0)
         {
            consumePropertyPathTraversalResult(budget);
            yield child.entry;
         }

         if (budget.results >= budget.maxResults || childPathLength >= bounds.maxPathLength ||
          child === stopNode || child.children === void 0)
         {
            continue;
         }

         stack.push({ iterator: child.children.entries(), pathLength: childPathLength });
      }
   }

   /**
    * Removes a terminal entry from the insertion-order list.
    *
    * Called by {@link delete}. Neighbor links and list endpoints are updated in constant time.
    */
   #unlinkEntry(entry: PropertyPathMapEntry<V>): void
   {
      if (entry.previous !== void 0) { entry.previous.next = entry.next; }
      else { this.#firstEntry = entry.next; }

      if (entry.next !== void 0) { entry.next.previous = entry.previous; }
      else { this.#lastEntry = entry.previous; }
   }
}

/**
 * Defines configuration options for {@link PropertyPathMap}.
 *
 * @category Property Path Collections
 */
declare namespace PropertyPathMap
{
   /**
    * Defines configuration options for {@link PropertyPathMap}.
    */
   export namespace Options
   {
      /**
       * Constructor-level defensive limits applied to storage and every iterator.
       */
      export interface Constructor
      {
         /**
          * Maximum number of exact stored paths. Overwriting an existing path does not consume another entry.
          *
          * @default 16384
          */
         maxEntries?: number;

         /**
          * Maximum number of allocated non-root trie nodes. Shared path prefixes consume one node per unique segment.
          *
          * @default 65536
          */
         maxNodes?: number;

         /**
          * Maximum number of property-key segments in a stored or queried path.
          *
          * @default 64
          */
         maxPathDepth?: number;

         /**
          * Maximum results produced by one iterator unless reduced per call. Reaching the limit truncates normally.
          *
          * @default 16384
          */
         maxTraversalResults?: number;

         /**
          * Maximum properties or trie nodes processed during iterator traversal unless reduced per call. Exceeding the limit
          * throws a `RangeError`.
          *
          * @default 65536
          */
         maxTraversalVisits?: number;
      }

      /**
       * Limits for insertion-order entries, keys, and values iterators.
       */
      export interface Iteration extends PropertyPathTraversalLimits
      {
      }

      /**
       * Common absolute trie bounds and defensive limits shared by matching and subtree iterators.
       */
      export interface Common extends PropertyPathTraversalLimits
      {
         /** Absolute stored path selecting the trie subtree where traversal begins. */
         pathPrefix?: PropertyPath;

         /** Absolute stored path whose entry is included while every descendant beneath it is pruned. */
         stopAt?: PropertyPath;
      }

      /**
       * Options shared by every candidate-object matching iterator.
       */
      export interface MatchCommon extends Common
      {
         /**
          * When `true`, every path segment must be an own property of the candidate value reached at that depth.
          *
          * @default false
          */
         hasOwnOnly?: boolean;
      }

      /** Options for matching path iteration. */
      export interface MatchKeys extends MatchCommon
      {
      }

      /** Options for matching entry and mapped-value iteration. */
      export interface Match extends MatchCommon
      {
         /** Whether matching entries / values also include the property value resolved from candidate data. */
         includePropertyValue?: boolean;
      }

      /** Options for candidate-independent subtree iteration. */
      export interface Subtree extends Common
      {
      }
   }
}

export { PropertyPathMap };

/**
 * Fully normalized constructor limits retained by one map instance.
 */
interface PropertyPathMapLimits
{
   maxEntries: number;
   maxNodes: number;
   maxPathDepth: number;
   maxTraversalResults: number;
   maxTraversalVisits: number;
}

/**
 * Validates and applies defaults to constructor-level resource limits.
 */
function normalizePropertyPathMapLimits(options: PropertyPathMap.Options.Constructor): PropertyPathMapLimits
{
   assertPropertyPathOptionsObject(options, 'PropertyPathMap');

   return {
      maxEntries: normalizePropertyPathLimit(options.maxEntries, DEFAULT_PROPERTY_PATH_ENTRY_LIMIT,
       `PropertyPathMap error: 'options.maxEntries' is not a non-negative safe integer.`),
      maxNodes: normalizePropertyPathLimit(options.maxNodes, DEFAULT_PROPERTY_PATH_NODE_LIMIT,
       `PropertyPathMap error: 'options.maxNodes' is not a non-negative safe integer.`),
      maxPathDepth: normalizePropertyPathLimit(options.maxPathDepth, DEFAULT_PROPERTY_PATH_DEPTH_LIMIT,
       `PropertyPathMap error: 'options.maxPathDepth' is not a non-negative safe integer.`),
      maxTraversalResults: normalizePropertyPathLimit(options.maxTraversalResults,
       DEFAULT_PROPERTY_PATH_RESULT_LIMIT,
       `PropertyPathMap error: 'options.maxTraversalResults' is not a non-negative safe integer.`),
      maxTraversalVisits: normalizePropertyPathLimit(options.maxTraversalVisits,
       DEFAULT_PROPERTY_PATH_VISIT_LIMIT,
       `PropertyPathMap error: 'options.maxTraversalVisits' is not a non-negative safe integer.`)
   };
}

// Internal Types ----------------------------------------------------------------------------------------------------

/**
 * A parent / child relationship recorded while locating a trie node for deletion.
 *
 * The path is retained only for the duration of {@link PropertyPathMap.delete} so unused trie nodes can be pruned
 * from the terminal node back toward the root.
 */
interface PropertyPathMapDeleteFrame<V>
{
   /** Parent node containing the child mapping. */
   parent: PropertyPathMapNode<V>;

   /** Property key mapping the parent to the child. */
   key: PropertyKey;

   /** Child node reached through {@link PropertyPathMapDeleteFrame.key}. */
   child: PropertyPathMapNode<V>;
}

/**
 * A terminal value stored at a trie node.
 *
 * The canonical path is copied and frozen when first inserted. This prevents later mutation of a caller-provided
 * accessor array from changing the path exposed by {@link PropertyPathMap.keys} or {@link PropertyPathMap.entries}.
 * The previous / next links maintain insertion-order iteration without traversing the complete trie.
 */
interface PropertyPathMapEntry<V>
{
   /** Canonical property-key path associated with this entry. */
   readonly path: readonly PropertyKey[];

   /** Value stored for the path. `undefined` remains a valid stored value. */
   value: V;

   /** Previous terminal entry in insertion order. */
   previous?: PropertyPathMapEntry<V>;

   /** Next terminal entry in insertion order. */
   next?: PropertyPathMapEntry<V>;
}

/**
 * Active depth-first trie frame used by {@link PropertyPathMap.matchingEntries}.
 *
 * The native child-map iterator preserves each trie node's child insertion order without allocating arrays of child
 * entries. The candidate value is the object or function corresponding to the same trie prefix.
 */
interface PropertyPathMapMatchFrame<V>
{
   /** Candidate value reached at this trie prefix. */
   value: PropertyPathTraversableValue;

   /** Iterator over the trie node's children. */
   iterator: IterableIterator<[PropertyKey, PropertyPathMapNode<V>]>;

   /** Absolute property-path length represented by this frame. */
   pathLength: number;
}

/**
 * Internal match result shared by matching projections.
 *
 * `propertyValue` is the value resolved from the candidate object when requested by the caller or required for
 * descendant traversal. It remains `undefined` when a terminal-only property was intentionally not read.
 */
interface PropertyPathMapMatch<V>
{
   /** Stored terminal entry reached by the trie walk. */
   entry: PropertyPathMapEntry<V>;

   /** Candidate property value resolved at the matching terminal path. */
   propertyValue: unknown;
}

/**
 * A node in the property-key trie.
 *
 * Each child map represents one path segment. A node may simultaneously contain a value and child nodes, allowing
 * both `['settings']` and `['settings', 'theme']` to be stored without conflict.
 */
interface PropertyPathMapNode<V>
{
   /** Child trie nodes keyed with native `Map` / SameValueZero semantics. */
   children?: Map<PropertyKey, PropertyPathMapNode<V>>;

   /** Terminal entry when a value is stored at this exact path. */
   entry?: PropertyPathMapEntry<V>;
}

/**
 * Active depth-first frame used by candidate-independent subtree traversal.
 */
interface PropertyPathMapSubtreeFrame<V>
{
   /** Iterator over one trie node's children. */
   iterator: IterableIterator<[PropertyKey, PropertyPathMapNode<V>]>;

   /** Absolute property-path length represented by this frame. */
   pathLength: number;
}

/**
 * Resolved common traversal bounds shared by matching and subtree iterators.
 */
interface PropertyPathMapTraversalScope<V>
{
   /** Shared normalized path and resource bounds. */
   bounds: NormalizedPropertyPathTraversalBounds;

   /** Trie node where traversal begins; missing stored prefixes resolve to `undefined`. */
   startNode?: PropertyPathMapNode<V>;

   /** Trie node whose descendants must be pruned, when the stop path exists. */
   stopNode?: PropertyPathMapNode<V>;
}

