import { WeakSafeAccessorMap } from '../../src';

function collect<T>(iterator: IterableIterator<T>): T[]
{
   return [...iterator];
}

describe('WeakSafeAccessorMap', () =>
{
   it('provides the expected object tag', () =>
   {
      const map = new WeakSafeAccessorMap<object, number>();
      assert.equal(Object.prototype.toString.call(map), '[object WeakSafeAccessorMap]');
   });

   it('stores identical paths independently beneath different roots', () =>
   {
      const rootA = {};
      const rootB = {};
      const map = new WeakSafeAccessorMap<object, number>();

      map.set(rootA, 'value', 1).set(rootB, 'value', 2);

      assert.equal(map.get(rootA, 'value'), 1);
      assert.equal(map.get(rootB, 'value'), 2);
      assert.equal(map.has(rootA, 'value'), true);
      assert.equal(map.hasRoot(rootA), true);
      assert.equal(map.hasRoot(rootB), true);
   });

   it('supports function roots', () =>
   {
      function root() {}
      const map = new WeakSafeAccessorMap<typeof root, string>();

      map.set(root, 'value', 'stored');

      assert.equal(map.get(root, 'value'), 'stored');
   });

   it('supports undefined as a stored value', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, undefined>();

      map.set(root, 'value', undefined);

      assert.equal(map.get(root, 'value'), undefined);
      assert.equal(map.has(root, 'value'), true);
   });

   it('updates an existing per-root trie', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, number>();

      map.set(root, 'first', 1);
      map.set(root, 'second', 2);
      map.set(root, 'first', 3);

      assert.equal(map.get(root, 'first'), 3);
      assert.equal(map.get(root, 'second'), 2);
   });

   it('validates absent-root accessors for get, has, and delete', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, number>();
      const invalid = [] as unknown as readonly PropertyKey[];

      assert.equal(map.get(root, 'value'), undefined);
      assert.equal(map.has(root, 'value'), false);
      assert.equal(map.delete(root, 'value'), false);

      assert.throws(() => map.get(root, invalid), TypeError);
      assert.throws(() => map.has(root, invalid), TypeError);
      assert.throws(() => map.delete(root, invalid), TypeError);
   });

   it('returns false when deleting a missing path from an existing root', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, number>();
      map.set(root, 'value', 1);

      assert.equal(map.delete(root, 'missing'), false);
      assert.equal(map.hasRoot(root), true);
   });

   it('retains a root when deleting one of multiple paths', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, number>();
      map.set(root, 'first', 1).set(root, 'second', 2);

      assert.equal(map.delete(root, 'first'), true);
      assert.equal(map.hasRoot(root), true);
      assert.equal(map.get(root, 'second'), 2);
   });

   it('removes a root after deleting its final path', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, number>();
      map.set(root, 'value', 1);

      assert.equal(map.delete(root, 'value'), true);
      assert.equal(map.hasRoot(root), false);
   });

   it('deletes complete roots', () =>
   {
      const root = {};
      const missing = {};
      const map = new WeakSafeAccessorMap<object, number>();
      map.set(root, 'value', 1);

      assert.equal(map.deleteRoot(root), true);
      assert.equal(map.deleteRoot(root), false);
      assert.equal(map.deleteRoot(missing), false);
   });

   it('clears all root associations', () =>
   {
      const rootA = {};
      const rootB = {};
      const map = new WeakSafeAccessorMap<object, number>();
      map.set(rootA, 'value', 1).set(rootB, 'value', 2);

      map.clear();

      assert.equal(map.hasRoot(rootA), false);
      assert.equal(map.hasRoot(rootB), false);

      map.set(rootA, 'next', 3);
      assert.equal(map.get(rootA, 'next'), 3);
   });

   it('does not retain a root when its first accessor is invalid', () =>
   {
      const root = {};
      const map = new WeakSafeAccessorMap<object, number>();
      const invalid = [] as unknown as readonly PropertyKey[];

      assert.throws(() => map.set(root, invalid, 1), TypeError);
      assert.equal(map.hasRoot(root), false);
   });

   it('rejects null and primitive roots', () =>
   {
      const map = new WeakSafeAccessorMap<object, number>();

      assert.throws(() => map.hasRoot(null as unknown as object), TypeError,
       `WeakSafeAccessorMap error: 'root' is not an object or function.`);

      assert.throws(() => map.get(42 as unknown as object, 'value'), TypeError,
       `WeakSafeAccessorMap error: 'root' is not an object or function.`);
   });

   describe('matching iterators', () =>
   {
      it('delegates matching entries, keys, and values for an existing root', () =>
      {
         const root = {};
         const map = new WeakSafeAccessorMap<object, string>();
         map.set(root, 'actor.hp', 'hp').set(root, 'actor.ac', 'ac');

         const data = { actor: { hp: 10 } };

         assert.deepEqual(collect(map.matchingEntries(root, data)), [[['actor', 'hp'], 'hp']]);
         assert.deepEqual(collect(map.matchingKeys(root, data)), [['actor', 'hp']]);
         assert.deepEqual(collect(map.matchingValues(root, data)), ['hp']);
      });

      it('includes candidate property values for matching entries and values', () =>
      {
         const root = {};
         const map = new WeakSafeAccessorMap<object, string>();
         map.set(root, 'actor.hp', 'hp').set(root, 'actor.name', 'name');

         const data = { actor: { hp: 10, name: undefined } };

         const entries: IterableIterator<[readonly PropertyKey[], string, unknown]> =
          map.matchingEntries(root, data, { includePropertyValue: true });
         const values: IterableIterator<[string, unknown]> =
          map.matchingValues(root, data, { includePropertyValue: true });

         assert.deepEqual(collect(entries), [
            [['actor', 'hp'], 'hp', 10],
            [['actor', 'name'], 'name', undefined]
         ]);

         assert.deepEqual(collect(values), [
            ['hp', 10],
            ['name', undefined]
         ]);
      });

      it('preserves the existing tuple shapes when property values are omitted or false', () =>
      {
         const root = {};
         const map = new WeakSafeAccessorMap<object, string>();
         map.set(root, 'value', 'mapped');

         assert.deepEqual(collect(map.matchingEntries(root, { value: 1 })), [[['value'], 'mapped']]);
         assert.deepEqual(
          collect(map.matchingValues(root, { value: 1 }, { includePropertyValue: false })),
          ['mapped']
         );
      });

      it('supports runtime boolean property-value options', () =>
      {
         const root = {};
         const map = new WeakSafeAccessorMap<object, string>();
         map.set(root, 'value', 'mapped');
         const includePropertyValue: boolean = true;

         const iterator: IterableIterator<string | [string, unknown]> =
          map.matchingValues(root, { value: 1 }, { includePropertyValue });

         assert.deepEqual(collect(iterator), [['mapped', 1]]);
      });

      it('uses an empty delegated trie for missing roots', () =>
      {
         const root = {};
         const map = new WeakSafeAccessorMap<object, string>();

         assert.deepEqual(collect(map.matchingEntries(root, { value: 1 })), []);
         assert.deepEqual(collect(map.matchingEntries(root, { value: 1 }, { includePropertyValue: true })), []);
         assert.deepEqual(collect(map.matchingKeys(root, { value: 1 })), []);
         assert.deepEqual(collect(map.matchingValues(root, { value: 1 })), []);
         assert.deepEqual(collect(map.matchingValues(root, { value: 1 }, { includePropertyValue: true })), []);
      });

      it('validates options for missing roots during iterator consumption', () =>
      {
         const root = {};
         const map = new WeakSafeAccessorMap<object, string>();

         assert.throws(
          () => collect(map.matchingEntries(root, {}, { hasOwnOnly: 'yes' as unknown as boolean })),
          TypeError
         );

         assert.throws(
          () => collect(map.matchingValues(root, {},
           { includePropertyValue: 'yes' as unknown as boolean })),
          TypeError
         );
      });

      it('passes hasOwnOnly through to the per-root trie', () =>
      {
         const root = {};
         const prototype = { inherited: 1 };
         const data = Object.create(prototype);
         const map = new WeakSafeAccessorMap<object, string>();
         map.set(root, 'inherited', 'mapped');

         assert.deepEqual(collect(map.matchingValues(root, data)), ['mapped']);
         assert.deepEqual(collect(map.matchingValues(root, data, { hasOwnOnly: true })), []);
      });

      it('validates roots before returning matching iterators', () =>
      {
         const map = new WeakSafeAccessorMap<object, string>();

         assert.throws(() => map.matchingEntries(null as unknown as object, {}), TypeError);
         assert.throws(() => map.matchingKeys(1 as unknown as object, {}), TypeError);
         assert.throws(() => map.matchingValues('root' as unknown as object, {}), TypeError);
      });
   });
});
