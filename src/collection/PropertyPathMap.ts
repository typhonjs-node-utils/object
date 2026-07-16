import {
   isArrayIndex,
   isPropertyPathPrefix,
   normalizePropertyPath }    from '../functions';

import type { PropertyPath }  from '../types';

/**
 * Stores values by structural {@link PropertyPath} paths using a property-key trie.
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
 * ## Key semantics
 *
 * Each path segment is stored in a native `Map<PropertyKey, ...>`:
 *
 * - Strings compare by value.
 * - Numbers compare with `Map` / SameValueZero semantics.
 * - Symbols compare by identity.
 * - Numeric and string segments remain distinct (`0` is not `'0'`).
 *
 * ## Complexity
 *
 * `get`, `has`, and `set` are `O(path length)`. `delete` is also `O(path length)` and prunes unused trie nodes.
 * Normal map iteration is `O(entry count)` and follows insertion order through a linked list of terminal entries.
 * Trie-aware matching visits only reachable stored prefixes, so unavailable prefixes reject all descendants with one
 * candidate-property check. Matching entry and value iterators may optionally include the property value resolved from
 * the candidate object without performing a second path lookup. `pathPrefix` can begin traversal directly at a stored
 * subtree, while `stopAt` prunes one descendant branch by trie-node identity.
 *
 * Candidate-independent subtree iterators reuse the same absolute bounds and visit only terminal entries beneath the
 * selected trie node. Matching and subtree iterators use deterministic depth-first trie order rather than global
 * insertion order.
 *
 * Stored canonical paths are copied and frozen once when first inserted. Overwriting an existing entry retains its
 * original insertion position and canonical path. Deleting and reinserting a path moves it to the end, matching normal
 * `Map` insertion-order behavior.
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

   /**
    * Creates a new path map and optionally initializes it from accessor / value pairs.
    *
    * Later duplicate paths overwrite earlier values without changing the original insertion position.
    *
    * @param entries - Optional initial accessor / value entries.
    */
   constructor(entries?: Iterable<readonly [PropertyPath, V]> | null)
   {
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
    */
   delete(accessor: PropertyPath): boolean
   {
      const path: readonly PropertyKey[] = normalizePropertyPath(accessor);
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

         // Avoid retaining empty child maps on otherwise reusable prefix nodes.
         if (parent.children?.size === 0) { delete parent.children; }
      }

      return true;
   }

   /**
    * Returns an insertion-order iterator of `[path, value]` pairs.
    *
    * Paths are canonical frozen arrays owned by this map. Each yielded tuple is newly allocated, but the path itself
    * is reused across iterations.
    *
    * @returns Entry iterator.
    */
   *entries(): IterableIterator<[readonly PropertyKey[], V]>
   {
      for (let entry: PropertyPathMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
      {
         yield [entry.path, entry.value];
      }
   }

   /**
    * Invokes a callback once for every entry in insertion order.
    *
    * The callback arguments follow `Map.prototype.forEach`: value, key, then map. The key is the canonical readonly
    * property-key array associated with the stored entry.
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
    */
   get(accessor: PropertyPath): V | undefined
   {
      return this.#findNode(normalizePropertyPath(accessor))?.entry?.value;
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
    */
   has(accessor: PropertyPath): boolean
   {
      return this.#findNode(normalizePropertyPath(accessor))?.entry !== void 0;
   }

   /**
    * Returns the default insertion-order iterator of `[path, value]` pairs.
    */
   [Symbol.iterator](): IterableIterator<[readonly PropertyKey[], V]>
   {
      return this.entries();
   }

   /**
    * Returns an insertion-order iterator of canonical property-key paths.
    *
    * @returns Key iterator.
    */
   *keys(): IterableIterator<readonly PropertyKey[]>
   {
      for (let entry: PropertyPathMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
      {
         yield entry.path;
      }
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
    *
    * @param data - Candidate object or function to inspect. Non-traversable values produce an empty iterator.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of canonical stored paths and their associated mapped values, optionally followed by the
    *          resolved candidate property value.
    *
    * @throws {TypeError} If a boolean option has an invalid type or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
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
    * @throws {TypeError} If a boolean option has an invalid type or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
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
    * @throws {TypeError} If a boolean option has an invalid type or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
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
    * canonical paths remain absolute and are reused from their stored entries.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of canonical stored paths and mapped values.
    *
    * @throws {TypeError} If either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
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
    * @throws {TypeError} If either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
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
    * @throws {TypeError} If either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   *subtreeValues(options: PropertyPathMap.Options.Subtree = {}): IterableIterator<V>
   {
      for (const entry of this.#subtreeEntryIterator(options)) { yield entry.value; }
   }

   /**
    * Stores a value at an exact structural path.
    *
    * Missing trie nodes are allocated lazily. Overwriting an existing path updates only its value, preserving size and
    * insertion order. A new entry copies and freezes its normalized path once for stable iteration.
    *
    * @param accessor - Dotted or exact property-key accessor.
    *
    * @param value - Value to store. `undefined` is valid.
    *
    * @returns This map.
    *
    * @throws {TypeError} If `accessor` is not a valid {@link PropertyPath}.
    */
   set(accessor: PropertyPath, value: V): this
   {
      const path: readonly PropertyKey[] = normalizePropertyPath(accessor);
      let node: PropertyPathMapNode<V> = this.#root;

      // Allocate only the missing suffix; existing prefixes are shared by every related path.
      for (const key of path)
      {
         const children: Map<PropertyKey, PropertyPathMapNode<V>> = node.children ??= new Map();
         let child: PropertyPathMapNode<V> | undefined = children.get(key);

         if (child === void 0)
         {
            child = {};
            children.set(key, child);
         }

         node = child;
      }

      if (node.entry !== void 0)
      {
         // Match native Map overwrite behavior: update the value without changing insertion order or size.
         node.entry.value = value;
         return this;
      }

      // Array accessors are returned unchanged by normalizeSafeAccessor, so copy before retaining the path.
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
    * @returns Value iterator.
    */
   *values(): IterableIterator<V>
   {
      for (let entry: PropertyPathMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
      {
         yield entry.value;
      }
   }

   // Internal Utility Functions -------------------------------------------------------------------------------------

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
    * Returns whether a candidate value can provide another property-path segment.
    *
    * Called by matching traversal for the root candidate and for each value reached below a stored trie prefix.
    * Functions are accepted because JavaScript functions may own or inherit properties.
    *
    * @param value - Candidate value.
    *
    * @returns Whether `value` is a non-null object or function.
    */
   static #isPropertyPathMapTraversableValue(value: unknown): value is PropertyPathMapTraversableValue
   {
      return value !== null && (typeof value === 'object' || typeof value === 'function');
   }

   /**
    * Yields terminal entries whose stored paths exist in a candidate value.
    *
    * Called by {@link matchingEntries}, {@link matchingKeys}, and {@link matchingValues}. Keeping the trie walk at the
    * match-record level lets all projections share one traversal while reading each candidate property at most once.
    *
    * When `pathPrefix` is present, the corresponding trie node is located before candidate data is touched. The same
    * absolute prefix is then resolved against the candidate exactly once. Its terminal entry is yielded when present,
    * and its child iterator becomes the first traversal frame. Without a prefix, traversal starts at the trie root.
    *
    * `stopAt` is resolved to trie-node identity once. Reaching that node still yields its terminal entry, but its child
    * iterator is never pushed, pruning the complete descendant branch without repeated path comparisons.
    *
    * Terminal-only candidate properties are read only when `includePropertyValue` is enabled. A node with descendants
    * must be read so its value can be tested for continued traversal. When a node is both terminal and a prefix, that
    * single read supplies both the yielded property value and descendant traversal.
    *
    * @param data - Candidate object or function to inspect.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of matching terminal entries and their optionally resolved candidate property values.
    *
    * @throws {TypeError} If a boolean option has an invalid type or either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   *#matchingEntryIterator(data: unknown, options: PropertyPathMap.Options.MatchKeys |
    PropertyPathMap.Options.Match = {}): IterableIterator<PropertyPathMapMatch<V>>
   {
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

      const { pathPrefix, startNode, stopNode } = this.#resolveTraversalScope(options);

      // Resolve trie bounds before touching candidate data so a missing stored prefix rejects the operation cheaply.
      if (startNode === void 0 || !PropertyPathMap.#isPropertyPathMapTraversableValue(data)) { return; }

      let stack: PropertyPathMapMatchFrame<V>[];

      if (pathPrefix !== void 0)
      {
         let candidate: PropertyPathMapTraversableValue = data;
         let propertyValue: unknown;

         // Resolve the selected absolute prefix against the candidate once before entering general subtree traversal.
         for (let index: number = 0; index < pathPrefix.length; index++)
         {
            const key: PropertyKey = pathPrefix[index];

            // Arrays reject string indexes and non-index string properties consistently at every prefix depth.
            if (Array.isArray(candidate) && typeof key !== 'symbol' && !isArrayIndex(key)) { return; }

            const exists: boolean = hasOwnOnly ? Object.hasOwn(candidate, key) : key in candidate;

            if (!exists) { return; }

            const isFinal: boolean = index === pathPrefix.length - 1;
            const requiresRead: boolean = !isFinal || includePropertyValue ||
             (startNode !== stopNode && startNode.children !== void 0);

            propertyValue = void 0;

            if (requiresRead)
            {
               propertyValue = (candidate as unknown as Record<PropertyKey, unknown>)[key];
            }

            if (!isFinal)
            {
               if (!PropertyPathMap.#isPropertyPathMapTraversableValue(propertyValue)) { return; }
               candidate = propertyValue;
            }
         }

         if (startNode.entry !== void 0) { yield { entry: startNode.entry, propertyValue }; }

         if (startNode === stopNode || startNode.children === void 0 ||
          !PropertyPathMap.#isPropertyPathMapTraversableValue(propertyValue))
         {
            return;
         }

         stack = [{ value: propertyValue, iterator: startNode.children.entries() }];
      }
      else
      {
         const rootChildren: Map<PropertyKey, PropertyPathMapNode<V>> | undefined = startNode.children;

         if (rootChildren === void 0) { return; }

         stack = [{ value: data, iterator: rootChildren.entries() }];
      }

      while (stack.length > 0)
      {
         const frame: PropertyPathMapMatchFrame<V> = stack[stack.length - 1];
         const result: IteratorResult<[PropertyKey, PropertyPathMapNode<V>]> = frame.iterator.next();

         if (result.done)
         {
            stack.pop();
            continue;
         }

         const [key, child] = result.value;

         // Arrays deliberately reject string indexes and non-index string properties to match PropertyPath traversal.
         if (Array.isArray(frame.value) && typeof key !== 'symbol' && !isArrayIndex(key)) { continue; }

         const exists: boolean = hasOwnOnly ? Object.hasOwn(frame.value, key) : key in frame.value;

         // A missing prefix rejects this node and every stored path below it.
         if (!exists) { continue; }

         const hasChildren: boolean = child.children !== void 0;
         const isStopNode: boolean = child === stopNode;
         let propertyValue: unknown;

         // A stopped node does not need a value read for descendants, but includePropertyValue still requests it.
         if (includePropertyValue || (hasChildren && !isStopNode))
         {
            propertyValue = (frame.value as unknown as Record<PropertyKey, unknown>)[key];
         }

         if (child.entry !== void 0) { yield { entry: child.entry, propertyValue }; }

         if (isStopNode || !hasChildren ||
          !PropertyPathMap.#isPropertyPathMapTraversableValue(propertyValue))
         {
            continue;
         }

         stack.push({ value: propertyValue, iterator: child.children!.entries() });
      }
   }

   /**
    * Normalizes and resolves the common absolute path bounds used by matching and subtree traversal.
    *
    * Accessor validation occurs before trie lookup so an invalid bound always throws, including on an empty map.
    * `stopAt` must equal or descend from `pathPrefix`; this prevents silently accepting a stop boundary that cannot be
    * reached by the selected subtree. Missing valid trie paths are represented by an undefined node and produce an
    * empty iterator without allocating traversal frames.
    *
    * @param options - Common traversal options.
    *
    * @returns Normalized prefix plus resolved start and stop trie nodes.
    *
    * @throws {TypeError} If either accessor option is invalid.
    * @throws {RangeError} If `stopAt` is outside `pathPrefix`.
    */
   #resolveTraversalScope({ pathPrefix, stopAt }: PropertyPathMap.Options.Common = {}):
    PropertyPathMapTraversalScope<V>
   {
      const prefixPath: readonly PropertyKey[] | undefined = pathPrefix === void 0 ?
       void 0 : normalizePropertyPath(pathPrefix);
      const stopPath: readonly PropertyKey[] | undefined = stopAt === void 0 ?
       void 0 : normalizePropertyPath(stopAt);

      if (prefixPath !== void 0 && stopPath !== void 0 && !isPropertyPathPrefix(prefixPath, stopPath))
      {
         throw new RangeError(`PropertyPathMap traversal error: 'options.stopAt' is outside 'options.pathPrefix'.`);
      }

      return {
         pathPrefix: prefixPath,
         startNode: prefixPath === void 0 ? this.#root : this.#findNode(prefixPath),
         stopNode: stopPath === void 0 ? void 0 : this.#findNode(stopPath)
      };
   }

   /**
    * Yields terminal entries from one bounded trie subtree without inspecting candidate data.
    *
    * The selected start node is yielded first when it stores an entry, followed by a depth-first walk of its children.
    * Native child-map iterators preserve trie sibling creation order without allocating child arrays. `stopAt` is
    * compared by resolved node identity and prunes descendants while retaining the stopped node's own entry.
    *
    * Called by {@link subtreeEntries}, {@link subtreeKeys}, and {@link subtreeValues}.
    *
    * @param options - Subtree bounds.
    *
    * @returns Iterator of terminal entries in deterministic trie order.
    *
    * @throws {TypeError} If either accessor option is invalid.
    * @throws {RangeError} If `options.stopAt` is outside `options.pathPrefix`.
    */
   *#subtreeEntryIterator(options: PropertyPathMap.Options.Subtree = {}):
    IterableIterator<PropertyPathMapEntry<V>>
   {
      const { startNode, stopNode } = this.#resolveTraversalScope(options);

      if (startNode === void 0) { return; }

      if (startNode.entry !== void 0) { yield startNode.entry; }

      if (startNode === stopNode || startNode.children === void 0) { return; }

      const stack: PropertyPathMapSubtreeFrame<V>[] = [{ iterator: startNode.children.entries() }];

      while (stack.length > 0)
      {
         const frame: PropertyPathMapSubtreeFrame<V> = stack[stack.length - 1];
         const result: IteratorResult<[PropertyKey, PropertyPathMapNode<V>]> = frame.iterator.next();

         if (result.done)
         {
            stack.pop();
            continue;
         }

         const child: PropertyPathMapNode<V> = result.value[1];

         if (child.entry !== void 0) { yield child.entry; }

         if (child === stopNode || child.children === void 0) { continue; }

         stack.push({ iterator: child.children.entries() });
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
       * Common absolute trie bounds shared by matching and subtree iterators.
       */
      export interface Common
      {
         pathPrefix?: PropertyPath;
         stopAt?: PropertyPath;
      }

      /**
       * Options shared by every candidate-object matching iterator.
       */
      export interface MatchCommon extends Common
      {
         /**
          * When `true`, every path segment must be an own property of the
          * candidate value reached at that depth.
          *
          * @default false
          */
         hasOwnOnly?: boolean;
      }

      /**
       * Options for matching path iteration.
       */
      export interface MatchKeys extends MatchCommon
      {
      }

      /**
       * Options for matching entry and mapped-value iteration.
       */
      export interface Match extends MatchCommon
      {
         includePropertyValue?: boolean;
      }

      /**
       * Options for candidate-independent subtree iteration.
       */
      export interface Subtree extends Common
      {
      }
   }
}

export { PropertyPathMap };

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
   value: PropertyPathMapTraversableValue;

   /** Iterator over the trie node's children. */
   iterator: IterableIterator<[PropertyKey, PropertyPathMapNode<V>]>;
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
}

/**
 * Resolved common traversal bounds shared by matching and subtree iterators.
 */
interface PropertyPathMapTraversalScope<V>
{
   /** Normalized absolute prefix, or `undefined` when traversal begins at the trie root. */
   pathPrefix?: readonly PropertyKey[];

   /** Trie node where traversal begins; missing stored prefixes resolve to `undefined`. */
   startNode?: PropertyPathMapNode<V>;

   /** Trie node whose descendants must be pruned, when the stop path exists. */
   stopNode?: PropertyPathMapNode<V>;
}

/**
 * Object or function value that can supply another property-path segment.
 */
type PropertyPathMapTraversableValue = object | ((...args: any[]) => any);
