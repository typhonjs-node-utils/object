import {
   isArrayIndex,
   normalizeSafeAccessor }    from './functions';

import type { SafeAccessor }  from './functions';

/**
 * Stores values by structural {@link SafeAccessor} paths using a property-key trie.
 *
 * Unlike `Map<readonly PropertyKey[], V>`, lookup does not depend on accessor-array identity. Equivalent paths resolve
 * to the same entry even when a new accessor array is supplied:
 *
 * @example
 * ```ts
 * const map = new SafeAccessorMap<number>();
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
 * the candidate object without performing a second path lookup.
 *
 * Stored canonical paths are copied and frozen once when first inserted. Overwriting an existing entry retains its
 * original insertion position and canonical path. Deleting and reinserting a path moves it to the end, matching normal
 * `Map` insertion-order behavior.
 *
 * Mutation of the map while an iterator is active is intentionally unspecified.
 *
 * @typeParam V - Stored value type.
 */
class SafeAccessorMap<V> implements Iterable<[readonly PropertyKey[], V]>
{
   /** Root trie node. Empty accessors are invalid, so the root never stores an entry. */
   #root: SafeAccessorMapNode<V> = {};

   /** First terminal entry in insertion order. */
   #firstEntry: SafeAccessorMapEntry<V> | undefined;

   /** Last terminal entry in insertion order. */
   #lastEntry: SafeAccessorMapEntry<V> | undefined;

   /** Number of exact paths currently storing values. */
   #size = 0;

   /**
    * Creates a new path map and optionally initializes it from accessor / value pairs.
    *
    * Later duplicate paths overwrite earlier values without changing the original insertion position.
    *
    * @param entries - Optional initial accessor / value entries.
    */
   constructor(entries?: Iterable<readonly [SafeAccessor, V]> | null)
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
      return 'SafeAccessorMap';
   }

   /**
    * Removes every stored entry and releases the complete trie.
    *
    * This operation is `O(1)` with respect to explicit traversal; the prior structure becomes available for garbage
    * collection once no active iterator or external value references remain.
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   delete(accessor: SafeAccessor): boolean
   {
      const path: readonly PropertyKey[] = normalizeSafeAccessor(accessor);
      const frames: SafeAccessorMapDeleteFrame<V>[] = [];
      let node: SafeAccessorMapNode<V> = this.#root;

      // Record every parent / child edge so empty nodes can be removed after deleting the terminal entry.
      for (const key of path)
      {
         const child: SafeAccessorMapNode<V> | undefined = node.children?.get(key);

         if (child === void 0) { return false; }

         frames.push({ parent: node, key, child });
         node = child;
      }

      const entry: SafeAccessorMapEntry<V> | undefined = node.entry;

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
      for (let entry: SafeAccessorMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
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
   forEach(callback: (value: V, key: readonly PropertyKey[], map: SafeAccessorMap<V>) => void,
    thisArg?: unknown): void
   {
      for (let entry: SafeAccessorMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   get(accessor: SafeAccessor): V | undefined
   {
      return this.#findNode(normalizeSafeAccessor(accessor))?.entry?.value;
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   has(accessor: SafeAccessor): boolean
   {
      return this.#findNode(normalizeSafeAccessor(accessor))?.entry !== void 0;
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
      for (let entry: SafeAccessorMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
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
    * @throws {TypeError} If `options.hasOwnOnly` or `options.includePropertyValue` is not a boolean.
    */
   matchingEntries(data: unknown, options: SafeAccessorMap.Options.Match & { includePropertyValue: true }):
    IterableIterator<[readonly PropertyKey[], V, unknown]>;

   matchingEntries(data: unknown, options?: SafeAccessorMap.Options.Match & { includePropertyValue?: false }):
    IterableIterator<[readonly PropertyKey[], V]>;

   matchingEntries(data: unknown, options?: SafeAccessorMap.Options.Match):
    IterableIterator<[readonly PropertyKey[], V] | [readonly PropertyKey[], V, unknown]>;

   *matchingEntries(data: unknown, options: SafeAccessorMap.Options.Match = {}):
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
    * This is a path-only projection of {@link matchingEntries} and uses the same trie-aware pruning, property
    * semantics, and depth-first trie order. Candidate terminal values are never requested solely for this iterator;
    * properties are read only when descendant traversal requires them.
    *
    * @param data - Candidate object or function to inspect.
    *
    * @param options - Matching options affecting property ownership.
    *
    * @returns Iterator of matching canonical property-key paths.
    *
    * @throws {TypeError} If `options.hasOwnOnly` is not a boolean.
    */
   *matchingKeys(data: unknown, options?: Pick<SafeAccessorMap.Options.Match, 'hasOwnOnly'>):
    IterableIterator<readonly PropertyKey[]>
   {
      for (const match of this.#matchingEntryIterator(data, options)) { yield match.entry.path; }
   }

   /**
    * Yields mapped values whose stored accessor paths are available in a candidate value.
    *
    * By default, this returns only each value stored in the map. Set `includePropertyValue` to `true` to return
    * `[mappedValue, propertyValue]` tuples, where `propertyValue` is resolved from the candidate data object at the
    * matching accessor path.
    *
    * @param data - Candidate object or function to inspect.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of mapped values or mapped-value / candidate-property-value tuples.
    *
    * @throws {TypeError} If `options.hasOwnOnly` or `options.includePropertyValue` is not a boolean.
    */
   matchingValues(data: unknown, options: SafeAccessorMap.Options.Match & { includePropertyValue: true }):
    IterableIterator<[V, unknown]>;

   matchingValues(data: unknown, options?: SafeAccessorMap.Options.Match & { includePropertyValue?: false }):
    IterableIterator<V>;

   matchingValues(data: unknown, options?: SafeAccessorMap.Options.Match):
    IterableIterator<V | [V, unknown]>;

   *matchingValues(data: unknown, options: SafeAccessorMap.Options.Match = {}):
    IterableIterator<V | [V, unknown]>
   {
      const includePropertyValue: boolean = options.includePropertyValue ?? false;

      for (const match of this.#matchingEntryIterator(data, options))
      {
         yield includePropertyValue ? [match.entry.value, match.propertyValue] : match.entry.value;
      }
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
    * @throws {TypeError} If `accessor` is not a valid {@link SafeAccessor}.
    */
   set(accessor: SafeAccessor, value: V): this
   {
      const path: readonly PropertyKey[] = normalizeSafeAccessor(accessor);
      let node: SafeAccessorMapNode<V> = this.#root;

      // Allocate only the missing suffix; existing prefixes are shared by every related path.
      for (const key of path)
      {
         const children: Map<PropertyKey, SafeAccessorMapNode<V>> = node.children ??= new Map();
         let child: SafeAccessorMapNode<V> | undefined = children.get(key);

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
      const entry: SafeAccessorMapEntry<V> = { path: canonicalPath, value };

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
      for (let entry: SafeAccessorMapEntry<V> | undefined = this.#firstEntry; entry !== void 0; entry = entry.next)
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
   #appendEntry(entry: SafeAccessorMapEntry<V>): void
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
   #findNode(path: readonly PropertyKey[]): SafeAccessorMapNode<V> | undefined
   {
      let node: SafeAccessorMapNode<V> = this.#root;

      for (const key of path)
      {
         const child: SafeAccessorMapNode<V> | undefined = node.children?.get(key);

         if (child === void 0) { return void 0; }

         node = child;
      }

      return node;
   }

   /**
    * Returns whether a candidate value can provide another property-path segment.
    *
    * Called by {@link SafeAccessorMap.matchingEntries} for the root candidate and for each value reached below a stored
    * trie prefix. Functions are accepted because JavaScript functions may own or inherit properties.
    *
    * @param value - Candidate value.
    *
    * @returns Whether `value` is a non-null object or function.
    */
   static #isSafeAccessorMapTraversableValue(value: unknown): value is SafeAccessorMapTraversableValue
   {
      return value !== null && (typeof value === 'object' || typeof value === 'function');
   }

   /**
    * Yields terminal entries whose stored paths exist in a candidate value.
    *
    * Called by {@link matchingEntries}, {@link matchingKeys}, and {@link matchingValues}. Keeping the trie walk at the
    * match-record level lets all projections share one traversal while reading each candidate property at most once.
    *
    * The walk is iterative and depth-first. Each active frame pairs a trie-child iterator with the candidate value
    * reached at the same prefix. Missing or non-traversable candidate prefixes are discarded before descendant trie
    * nodes are considered.
    *
    * Terminal-only candidate properties are read only when `includePropertyValue` is enabled. A node with descendants
    * must always be read so its value can be tested for continued traversal. When a node is both terminal and a prefix,
    * that single read supplies both the yielded property value and descendant traversal.
    *
    * @param data - Candidate object or function to inspect.
    *
    * @param options - Matching options.
    *
    * @returns Iterator of matching terminal entries and their optionally resolved candidate property values.
    *
    * @throws {TypeError} If `options.hasOwnOnly` or `options.includePropertyValue` is not a boolean.
    */
   *#matchingEntryIterator(data: unknown, { hasOwnOnly = false, includePropertyValue = false }:
    SafeAccessorMap.Options.Match = {}): IterableIterator<SafeAccessorMapMatch<V>>
   {
      if (typeof hasOwnOnly !== 'boolean')
      {
         throw new TypeError(`SafeAccessorMap matching error: 'options.hasOwnOnly' is not a boolean.`);
      }

      if (typeof includePropertyValue !== 'boolean')
      {
         throw new TypeError(`SafeAccessorMap matching error: 'options.includePropertyValue' is not a boolean.`);
      }

      if (!SafeAccessorMap.#isSafeAccessorMapTraversableValue(data)) { return; }

      const rootChildren: Map<PropertyKey, SafeAccessorMapNode<V>> | undefined = this.#root.children;

      if (rootChildren === void 0) { return; }

      const stack: SafeAccessorMapMatchFrame<V>[] = [{ value: data, iterator: rootChildren.entries() }];

      while (stack.length > 0)
      {
         const frame: SafeAccessorMapMatchFrame<V> = stack[stack.length - 1];
         const result: IteratorResult<[PropertyKey, SafeAccessorMapNode<V>]> = frame.iterator.next();

         if (result.done)
         {
            stack.pop();
            continue;
         }

         const [key, child] = result.value;

         // Arrays deliberately reject string indexes and non-index string properties to match SafeAccessor traversal.
         if (Array.isArray(frame.value) && typeof key !== 'symbol' && !isArrayIndex(key))
         {
            continue;
         }

         const exists: boolean = hasOwnOnly ? Object.hasOwn(frame.value, key) : key in frame.value;

         // A missing prefix rejects this node and every stored path below it.
         if (!exists) { continue; }

         const hasChildren: boolean = child.children !== void 0;
         let propertyValue: unknown;

         // Read once when the caller requests the terminal value or descendant traversal requires the next object.
         if (includePropertyValue || hasChildren)
         {
            propertyValue = (frame.value as unknown as Record<PropertyKey, unknown>)[key];
         }

         if (child.entry !== void 0) { yield { entry: child.entry, propertyValue }; }

         if (!hasChildren || !SafeAccessorMap.#isSafeAccessorMapTraversableValue(propertyValue)) { continue; }

         stack.push({ value: propertyValue, iterator: child.children!.entries() });
      }
   }

   /**
    * Removes a terminal entry from the insertion-order list.
    *
    * Called by {@link delete}. Neighbor links and list endpoints are updated in constant time.
    */
   #unlinkEntry(entry: SafeAccessorMapEntry<V>): void
   {
      if (entry.previous !== void 0) { entry.previous.next = entry.next; }
      else { this.#firstEntry = entry.next; }

      if (entry.next !== void 0) { entry.next.previous = entry.previous; }
      else { this.#lastEntry = entry.previous; }
   }
}

declare namespace SafeAccessorMap
{
   export namespace Options
   {
      /**
       * Options controlling trie-aware matching of stored paths against a candidate value.
       */
      export interface Match
      {
         /**
          * When `true`, every path segment must be an own property of the value reached at that depth. When `false`,
          * inherited properties follow normal JavaScript lookup semantics.
          *
          * @default false
          */
         hasOwnOnly?: boolean;

         /**
          * When `true`, {@link SafeAccessorMap.matchingEntries} appends the resolved candidate property value to each
          * entry tuple and {@link SafeAccessorMap.matchingValues} returns `[mappedValue, propertyValue]` tuples.
          *
          * Enabling this option requires terminal-only candidate properties to be read and may therefore invoke getters
          * or proxy `get` traps that are otherwise avoided. {@link SafeAccessorMap.matchingKeys} does not accept this
          * option because it remains a path-only projection.
          *
          * @default false
          */
         includePropertyValue?: boolean;
      }
   }
}

export { SafeAccessorMap };

// Internal Types ----------------------------------------------------------------------------------------------------

/**
 * A parent / child relationship recorded while locating a trie node for deletion.
 *
 * The path is retained only for the duration of {@link SafeAccessorMap.delete} so unused trie nodes can be pruned
 * from the terminal node back toward the root.
 */
interface SafeAccessorMapDeleteFrame<V>
{
   /** Parent node containing the child mapping. */
   parent: SafeAccessorMapNode<V>;

   /** Property key mapping the parent to the child. */
   key: PropertyKey;

   /** Child node reached through {@link SafeAccessorMapDeleteFrame.key}. */
   child: SafeAccessorMapNode<V>;
}

/**
 * A terminal value stored at a trie node.
 *
 * The canonical path is copied and frozen when first inserted. This prevents later mutation of a caller-provided
 * accessor array from changing the path exposed by {@link SafeAccessorMap.keys} or {@link SafeAccessorMap.entries}.
 * The previous / next links maintain insertion-order iteration without traversing the complete trie.
 */
interface SafeAccessorMapEntry<V>
{
   /** Canonical property-key path associated with this entry. */
   readonly path: readonly PropertyKey[];

   /** Value stored for the path. `undefined` remains a valid stored value. */
   value: V;

   /** Previous terminal entry in insertion order. */
   previous?: SafeAccessorMapEntry<V>;

   /** Next terminal entry in insertion order. */
   next?: SafeAccessorMapEntry<V>;
}

/**
 * Active depth-first trie frame used by {@link SafeAccessorMap.matchingEntries}.
 *
 * The native child-map iterator preserves each trie node's child insertion order without allocating arrays of child
 * entries. The candidate value is the object or function corresponding to the same trie prefix.
 */
interface SafeAccessorMapMatchFrame<V>
{
   /** Candidate value reached at this trie prefix. */
   value: SafeAccessorMapTraversableValue;

   /** Iterator over the trie node's children. */
   iterator: IterableIterator<[PropertyKey, SafeAccessorMapNode<V>]>;
}

/**
 * Internal match result shared by matching projections.
 *
 * `propertyValue` is the value resolved from the candidate object when requested by the caller or required for
 * descendant traversal. It remains `undefined` when a terminal-only property was intentionally not read.
 */
interface SafeAccessorMapMatch<V>
{
   /** Stored terminal entry reached by the trie walk. */
   entry: SafeAccessorMapEntry<V>;

   /** Candidate property value resolved at the matching terminal path. */
   propertyValue: unknown;
}

/**
 * A node in the property-key trie.
 *
 * Each child map represents one path segment. A node may simultaneously contain a value and child nodes, allowing
 * both `['settings']` and `['settings', 'theme']` to be stored without conflict.
 */
interface SafeAccessorMapNode<V>
{
   /** Child trie nodes keyed with native `Map` / SameValueZero semantics. */
   children?: Map<PropertyKey, SafeAccessorMapNode<V>>;

   /** Terminal entry when a value is stored at this exact path. */
   entry?: SafeAccessorMapEntry<V>;
}

/**
 * Object or function value that can supply another property-path segment.
 */
type SafeAccessorMapTraversableValue = object | ((...args: any[]) => any);
