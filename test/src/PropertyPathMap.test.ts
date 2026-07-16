import { PropertyPathMap } from '../../src';

function collect<T>(iterator: IterableIterator<T>): T[]
{
   return [...iterator];
}

describe('PropertyPathMap', () =>
{
   it('constructs an empty map', () =>
   {
      const map = new PropertyPathMap<number>();

      assert.equal(map.size, 0);
      assert.equal(Object.prototype.toString.call(map), '[object PropertyPathMap]');
      assert.deepEqual([...map], []);
   });

   it('accepts null constructor entries', () =>
   {
      const map = new PropertyPathMap<number>(null);
      assert.equal(map.size, 0);
   });

   it('initializes entries and overwrites duplicate structural paths', () =>
   {
      const map = new PropertyPathMap<number>([
         ['a.b', 1],
         [['a', 'b'], 2],
         [['a', 'c'], 3]
      ]);

      assert.equal(map.size, 2);
      assert.deepEqual([...map.entries()], [
         [['a', 'b'], 2],
         [['a', 'c'], 3]
      ]);
   });

   it('stores and retrieves structural paths independently of array identity', () =>
   {
      const map = new PropertyPathMap<number>();

      map.set(['actors', 0, 'id'], 42);

      assert.equal(map.get(['actors', 0, 'id']), 42);
      assert.equal(map.has(['actors', 0, 'id']), true);
      assert.equal(map.has(['actors', 0]), false);
      assert.equal(map.get(['actors', 1, 'id']), void 0);
   });

   it('distinguishes numeric, string, and symbol path segments', () =>
   {
      const symbolA = Symbol('value');
      const symbolB = Symbol('value');
      const map = new PropertyPathMap<string>();

      map.set([0], 'number');
      map.set(['0'], 'string');
      map.set([symbolA], 'symbol');

      assert.equal(map.get([0]), 'number');
      assert.equal(map.get(['0']), 'string');
      assert.equal(map.get([symbolA]), 'symbol');
      assert.equal(map.get([symbolB]), void 0);
   });

   it('supports undefined as a stored value', () =>
   {
      const map = new PropertyPathMap<undefined>();

      map.set('value', void 0);

      assert.equal(map.get('value'), void 0);
      assert.equal(map.has('value'), true);
      assert.equal(map.has('missing'), false);
   });

   it('copies and freezes canonical paths', () =>
   {
      const accessor: PropertyKey[] = ['a', 'b'];
      const map = new PropertyPathMap<number>();

      map.set(accessor, 1);
      accessor[1] = 'changed';

      const [path] = [...map.keys()];

      assert.deepEqual(path, ['a', 'b']);
      assert.equal(Object.isFrozen(path), true);
      assert.throws(() => (path as PropertyKey[]).push('c'), TypeError);
   });

   it('preserves insertion order on overwrite', () =>
   {
      const map = new PropertyPathMap<number>();

      map.set('first', 1).set('second', 2).set('first', 3);

      assert.equal(map.size, 2);
      assert.deepEqual([...map.values()], [3, 2]);
      assert.deepEqual([...map.keys()], [['first'], ['second']]);
   });

   it('implements entries, keys, values, default iteration, and forEach', () =>
   {
      const map = new PropertyPathMap<number>();
      const thisArg = { total: 0 };
      const calls: Array<[number, readonly PropertyKey[], PropertyPathMap<number>]> = [];

      map.set('first', 1).set(['second'], 2);
      map.forEach(function(this: { total: number }, value, key, owner)
      {
         this.total += value;
         calls.push([value, key, owner]);
      }, thisArg);

      assert.deepEqual([...map.entries()], [[['first'], 1], [['second'], 2]]);
      assert.deepEqual([...map], [[['first'], 1], [['second'], 2]]);
      assert.deepEqual([...map.keys()], [['first'], ['second']]);
      assert.deepEqual([...map.values()], [1, 2]);
      assert.equal(thisArg.total, 3);
      assert.equal(calls[0][2], map);
   });

   it('clears all entries', () =>
   {
      const map = new PropertyPathMap<number>([['a', 1], ['b', 2]]);

      map.clear();

      assert.equal(map.size, 0);
      assert.deepEqual([...map], []);
      assert.equal(map.has('a'), false);

      map.set('c', 3);
      assert.deepEqual([...map.values()], [3]);
   });

   it('returns false when deleting a missing edge', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('a.b', 1);

      assert.equal(map.delete('x.y'), false);
   });

   it('returns false when deleting a prefix without an entry', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('a.b', 1);

      assert.equal(map.delete('a'), false);
      assert.equal(map.has('a.b'), true);
   });

   it('deletes a value-bearing prefix while retaining descendants', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('a', 1).set('a.b', 2);

      assert.equal(map.delete('a'), true);
      assert.equal(map.has('a'), false);
      assert.equal(map.get('a.b'), 2);
   });

   it('deletes a leaf while retaining sibling branches', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('a.b', 1).set('a.c', 2);

      assert.equal(map.delete('a.b'), true);
      assert.equal(map.has('a.b'), false);
      assert.equal(map.get('a.c'), 2);
   });

   it('prunes empty child maps and recreates the path', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set(['root', 'branch', 'leaf'], 1);

      assert.equal(map.delete(['root', 'branch', 'leaf']), true);
      assert.equal(map.size, 0);

      map.set(['root', 'branch', 'next'], 2);
      assert.equal(map.get(['root', 'branch', 'next']), 2);
   });

   it('unlinks the only insertion-order entry', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('only', 1);

      assert.equal(map.delete('only'), true);
      assert.deepEqual([...map], []);
   });

   it('unlinks the first insertion-order entry', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('first', 1).set('second', 2).set('third', 3);

      assert.equal(map.delete('first'), true);
      assert.deepEqual([...map.values()], [2, 3]);
   });

   it('unlinks a middle insertion-order entry', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('first', 1).set('second', 2).set('third', 3);

      assert.equal(map.delete('second'), true);
      assert.deepEqual([...map.values()], [1, 3]);
   });

   it('unlinks the last insertion-order entry and appends after the new tail', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('first', 1).set('second', 2).set('third', 3);

      assert.equal(map.delete('third'), true);
      map.set('fourth', 4);

      assert.deepEqual([...map.values()], [1, 2, 4]);
   });

   it('moves a deleted and reinserted path to the end', () =>
   {
      const map = new PropertyPathMap<number>();
      map.set('first', 1).set('second', 2);

      map.delete('first');
      map.set('first', 3);

      assert.deepEqual([...map.values()], [2, 3]);
   });

   it('rejects invalid accessors through all exact-path operations', () =>
   {
      const invalid = [] as unknown as readonly PropertyKey[];
      const map = new PropertyPathMap<number>();

      assert.throws(() => map.set(invalid, 1), TypeError);
      assert.throws(() => map.get(invalid), TypeError);
      assert.throws(() => map.has(invalid), TypeError);
      assert.throws(() => map.delete(invalid), TypeError);
   });

   describe('matching iterators', () =>
   {
      it('returns empty results for non-traversable data and an empty map', () =>
      {
         const map = new PropertyPathMap<number>();

         assert.deepEqual(collect(map.matchingEntries({})), []);
         assert.deepEqual(collect(map.matchingEntries(null)), []);
         assert.deepEqual(collect(map.matchingKeys(42)), []);
         assert.deepEqual(collect(map.matchingValues('text')), []);
      });

      it('matches stored paths and prunes missing prefixes', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.system.hp', 'hp');
         map.set('actor.system.ac', 'ac');
         map.set('token.x', 'x');

         const data = { actor: { system: { hp: 10 } } };

         assert.deepEqual(collect(map.matchingEntries(data)), [
            [['actor', 'system', 'hp'], 'hp']
         ]);
      });

      it('uses depth-first trie order instead of global insertion order', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('b.value', 'b');
         map.set('a.first', 'a1');
         map.set('a.second', 'a2');

         const data = { a: { first: 1, second: 2 }, b: { value: 3 } };

         assert.deepEqual(collect(map.matchingValues(data)), ['b', 'a1', 'a2']);
      });

      it('includes inherited properties by default and can require own properties', () =>
      {
         const prototype = { inherited: { value: 1 } };
         const data = Object.create(prototype);
         const map = new PropertyPathMap<string>();
         map.set('inherited.value', 'match');

         assert.deepEqual(collect(map.matchingValues(data)), ['match']);
         assert.deepEqual(collect(map.matchingValues(data, { hasOwnOnly: true })), []);
      });

      it('supports function candidate roots', () =>
      {
         const data = function candidate() {};
         (data as unknown as Record<string, unknown>).metadata = { id: 1 };

         const map = new PropertyPathMap<string>();
         map.set('metadata.id', 'id');

         assert.deepEqual(collect(map.matchingKeys(data)), [['metadata', 'id']]);
      });

      it('matches numeric array indexes and symbols but rejects string array indexes', () =>
      {
         const symbol = Symbol('metadata');
         const data: any[] = ['zero'];
         (data as any)[symbol] = { value: 2 };

         const map = new PropertyPathMap<string>();
         map.set([0], 'number-index');
         map.set(['0'], 'string-index');
         map.set([symbol, 'value'], 'symbol-value');

         assert.deepEqual(collect(map.matchingValues(data)), ['number-index', 'symbol-value']);
      });

      it('matches terminal undefined and null values', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('undefinedValue', 'undefined');
         map.set('nullValue', 'null');
         map.set('undefinedValue.child', 'child');

         const data = { undefinedValue: void 0, nullValue: null };

         assert.deepEqual(collect(map.matchingValues(data)), ['undefined', 'null']);
      });

      it('handles circular candidate objects because trie depth is finite', () =>
      {
         const data: Record<string, any> = { value: 1 };
         data.self = data;

         const map = new PropertyPathMap<string>();
         map.set('self.self.value', 'value');

         assert.deepEqual(collect(map.matchingKeys(data)), [['self', 'self', 'value']]);
      });

      it('does not read a terminal-only getter by default', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'value', {
            enumerable: true,
            get()
            {
               reads++;
               return 42;
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('value', 'mapped');

         assert.deepEqual(collect(map.matchingEntries(data)), [[['value'], 'mapped']]);
         assert.equal(reads, 0);
      });

      it('includes terminal property values when requested', () =>
      {
         const symbol = Symbol('value');
         const data = {
            number: 42,
            undefinedValue: void 0,
            nullValue: null,
            [symbol]: 'symbol'
         };

         const map = new PropertyPathMap<string>();
         map.set('number', 'number-map');
         map.set('undefinedValue', 'undefined-map');
         map.set('nullValue', 'null-map');
         map.set([symbol], 'symbol-map');

         const entries: IterableIterator<[readonly PropertyKey[], string, unknown]> =
          map.matchingEntries(data, { includePropertyValue: true });
         const values: IterableIterator<[string, unknown]> =
          map.matchingValues(data, { includePropertyValue: true });

         assert.deepEqual(collect(entries), [
            [['number'], 'number-map', 42],
            [['undefinedValue'], 'undefined-map', void 0],
            [['nullValue'], 'null-map', null],
            [[symbol], 'symbol-map', 'symbol']
         ]);

         assert.deepEqual(collect(values), [
            ['number-map', 42],
            ['undefined-map', void 0],
            ['null-map', null],
            ['symbol-map', 'symbol']
         ]);
      });

      it('reads a terminal getter once when property values are requested', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'value', {
            get()
            {
               reads++;
               return 42;
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('value', 'mapped');

         assert.deepEqual(collect(map.matchingValues(data, { includePropertyValue: true })), [['mapped', 42]]);
         assert.equal(reads, 1);
      });

      it('reads a terminal prefix once for both its property value and descendants', () =>
      {
         let reads = 0;
         const nested = { child: 2 };
         const data = Object.defineProperty({}, 'prefix', {
            get()
            {
               reads++;
               return nested;
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('prefix', 'prefix-map');
         map.set('prefix.child', 'child-map');

         assert.deepEqual(collect(map.matchingEntries(data, { includePropertyValue: true })), [
            [['prefix'], 'prefix-map', nested],
            [['prefix', 'child'], 'child-map', 2]
         ]);
         assert.equal(reads, 1);
      });

      it('reads a non-terminal prefix once even when property values are not requested', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'prefix', {
            get()
            {
               reads++;
               return { child: 2 };
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('prefix.child', 'child-map');

         assert.deepEqual(collect(map.matchingValues(data)), ['child-map']);
         assert.equal(reads, 1);
      });

      it('supports an explicit false property-value option and a runtime boolean option', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('value', 'mapped');
         const data = { value: 5 };

         assert.deepEqual(collect(map.matchingEntries(data, { includePropertyValue: false })), [[['value'], 'mapped']]);

         // @ts-expect-error
         assert.deepEqual(collect(map.matchingValues(data, { includePropertyValue: void 0 })), ['mapped']);

         const includePropertyValue: boolean = true;
         const iterator: IterableIterator<
          [readonly PropertyKey[], string] | [readonly PropertyKey[], string, unknown]
         > = map.matchingEntries(data, { includePropertyValue });

         assert.deepEqual(collect(iterator), [[['value'], 'mapped', 5]]);
      });

      it('validates matching option types during iteration', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('value', 'mapped');

         // @ts-expect-error
         assert.throws(() => collect(map.matchingEntries({ value: 1 }, { hasOwnOnly: 'yes' })),
          TypeError, `PropertyPathMap matching error: 'options.hasOwnOnly' is not a boolean.`);

         // @ts-expect-error
         assert.throws(() => collect(map.matchingValues({ value: 1 }, { includePropertyValue: 'yes' })),
          TypeError, `PropertyPathMap matching error: 'options.includePropertyValue' is not a boolean.`);
      });

      it('restricts matching to a stored path prefix and includes the prefix entry', () =>
      {
         let unrelatedReads = 0;
         const data = {
            actor: {
               system: {
                  hp: 10,
                  ac: 15
               }
            },
            get token()
            {
               unrelatedReads++;
               return { x: 1 };
            }
         };

         const map = new PropertyPathMap<string>();
         map.set('actor.system', 'system');
         map.set('actor.system.hp', 'hp');
         map.set('actor.system.ac', 'ac');
         map.set('token.x', 'x');

         assert.deepEqual(collect(map.matchingEntries(data, {
            pathPrefix: 'actor.system',
            includePropertyValue: true
         })), [
            [['actor', 'system'], 'system', data.actor.system],
            [['actor', 'system', 'hp'], 'hp', 10],
            [['actor', 'system', 'ac'], 'ac', 15]
         ]);
         assert.equal(unrelatedReads, 0);
      });

      it('starts matching at a prefix that does not itself store a value', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.system.hp', 'hp');
         map.set('actor.system.ac', 'ac');

         assert.deepEqual(collect(map.matchingKeys({
            actor: { system: { hp: 10, ac: 15 } }
         }, {
            pathPrefix: 'actor.system'
         })), [
            ['actor', 'system', 'hp'],
            ['actor', 'system', 'ac']
         ]);
      });

      it('does not touch candidate data when the stored path prefix is missing', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'missing', {
            get()
            {
               reads++;
               return {};
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('present.value', 'value');

         assert.deepEqual(collect(map.matchingValues(data, { pathPrefix: 'missing.branch' })), []);
         assert.equal(reads, 0);
      });

      it('rejects missing, non-traversable, and invalid-array candidate prefixes', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.system.hp', 'hp');
         map.set([0, 'value'], 'numeric');
         map.set(['0', 'value'], 'string');

         assert.deepEqual(collect(map.matchingValues({}, { pathPrefix: 'actor.system' })), []);
         assert.deepEqual(collect(map.matchingValues({ actor: null }, { pathPrefix: 'actor.system' })), []);
         assert.deepEqual(collect(map.matchingValues([{ value: 1 }], {
            pathPrefix: ['0', 'value']
         })), []);
         assert.deepEqual(collect(map.matchingValues([{ value: 1 }], {
            pathPrefix: [0, 'value']
         })), ['numeric']);
      });

      it('applies own-property matching while resolving a path prefix', () =>
      {
         const prototype = { actor: { hp: 10 } };
         const data = Object.create(prototype);
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');

         assert.deepEqual(collect(map.matchingValues(data, { pathPrefix: 'actor' })), ['hp']);
         assert.deepEqual(collect(map.matchingValues(data, {
            pathPrefix: 'actor',
            hasOwnOnly: true
         })), []);
      });

      it('matches a terminal-only prefix without reading it unless requested', () =>
      {
         let reads = 0;
         const data = Object.defineProperty({}, 'value', {
            get()
            {
               reads++;
               return 42;
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('value', 'mapped');

         assert.deepEqual(collect(map.matchingEntries(data, { pathPrefix: 'value' })), [
            [['value'], 'mapped']
         ]);
         assert.equal(reads, 0);

         assert.deepEqual(collect(map.matchingValues(data, {
            pathPrefix: 'value',
            includePropertyValue: true
         })), [['mapped', 42]]);
         assert.equal(reads, 1);
      });

      it('yields a non-traversable prefix entry and rejects its descendants', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('value', 'value');
         map.set('value.child', 'child');

         assert.deepEqual(collect(map.matchingEntries({ value: null }, {
            pathPrefix: 'value',
            includePropertyValue: true
         })), [
            [['value'], 'value', null]
         ]);
      });

      it('includes stop entries and prunes only their descendants', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.system.hp', 'hp');
         map.set('actor.system.hp.value', 'hp-value');
         map.set('actor.system.ac', 'ac');
         map.set('actor.name', 'name');

         const data = {
            actor: {
               system: {
                  hp: { value: 10 },
                  ac: 15
               },
               name: 'Actor'
            }
         };

         assert.deepEqual(collect(map.matchingValues(data, {
            pathPrefix: 'actor',
            stopAt: 'actor.system.hp'
         })), ['hp', 'ac', 'name']);
      });

      it('prunes descendants when stopAt resolves to a non-terminal trie node', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.system.hp.value', 'hp-value');
         map.set('actor.system.ac', 'ac');

         const data = {
            actor: {
               system: {
                  hp: { value: 10 },
                  ac: 15
               }
            }
         };

         assert.deepEqual(collect(map.matchingValues(data, {
            pathPrefix: 'actor.system',
            stopAt: 'actor.system.hp'
         })), ['ac']);
      });

      it('stops at the selected prefix while preserving optional property values', () =>
      {
         let reads = 0;
         const nested = { child: 1 };
         const data = Object.defineProperty({}, 'prefix', {
            get()
            {
               reads++;
               return nested;
            }
         });

         const map = new PropertyPathMap<string>();
         map.set('prefix', 'prefix');
         map.set('prefix.child', 'child');

         assert.deepEqual(collect(map.matchingEntries(data, {
            pathPrefix: 'prefix',
            stopAt: 'prefix'
         })), [[['prefix'], 'prefix']]);
         assert.equal(reads, 0);

         assert.deepEqual(collect(map.matchingEntries(data, {
            pathPrefix: 'prefix',
            stopAt: 'prefix',
            includePropertyValue: true
         })), [[['prefix'], 'prefix', nested]]);
         assert.equal(reads, 1);
      });

      it('ignores a valid stop path that is not stored', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');

         assert.deepEqual(collect(map.matchingValues({ actor: { hp: 10 } }, {
            pathPrefix: 'actor',
            stopAt: 'actor.missing'
         })), ['hp']);
      });

      it('supports symbol and SameValueZero numeric prefix bounds', () =>
      {
         const symbol = Symbol('branch');
         const data = {
            [symbol]: {
               NaN: {
                  value: 10
               }
            }
         };
         const map = new PropertyPathMap<string>();
         map.set([symbol, NaN], 'nan');
         map.set([symbol, NaN, 'value'], 'value');

         assert.deepEqual(collect(map.matchingValues(data, {
            pathPrefix: [symbol, NaN],
            stopAt: [symbol, NaN, 'value']
         })), ['nan', 'value']);
      });

      it('validates matching path bounds during iteration', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');
         const invalid = [] as unknown as readonly PropertyKey[];

         assert.throws(() => collect(map.matchingValues({}, { pathPrefix: invalid })), TypeError);
         assert.throws(() => collect(map.matchingValues({}, { stopAt: invalid })), TypeError);

         assert.throws(() => collect(map.matchingValues({}, {
            pathPrefix: 'actor.hp',
            stopAt: 'actor'
         })), RangeError,
          `PropertyPathMap traversal error: 'options.stopAt' is outside 'options.pathPrefix'.`);

         assert.throws(() => collect(map.matchingValues({}, {
            pathPrefix: 'actor',
            stopAt: 'token'
         })), RangeError);
      });
   });

   describe('subtree iterators', () =>
   {
      it('iterates the complete trie in depth-first order', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('b.value', 'b');
         map.set('a', 'a');
         map.set('a.first', 'a1');
         map.set('a.second', 'a2');

         assert.deepEqual(collect(map.subtreeEntries()), [
            [['b', 'value'], 'b'],
            [['a'], 'a'],
            [['a', 'first'], 'a1'],
            [['a', 'second'], 'a2']
         ]);
         assert.deepEqual(collect(map.subtreeKeys()), [
            ['b', 'value'],
            ['a'],
            ['a', 'first'],
            ['a', 'second']
         ]);
         assert.deepEqual(collect(map.subtreeValues()), ['b', 'a', 'a1', 'a2']);
      });

      it('starts at a value-bearing path prefix and retains absolute paths', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor', 'actor');
         map.set('actor.hp', 'hp');
         map.set('actor.ac', 'ac');
         map.set('token.x', 'x');

         assert.deepEqual(collect(map.subtreeEntries({ pathPrefix: 'actor' })), [
            [['actor'], 'actor'],
            [['actor', 'hp'], 'hp'],
            [['actor', 'ac'], 'ac']
         ]);
      });

      it('starts at a prefix without its own entry', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.system.hp', 'hp');
         map.set('actor.system.ac', 'ac');

         assert.deepEqual(collect(map.subtreeValues({ pathPrefix: 'actor.system' })), ['hp', 'ac']);
      });

      it('returns empty results for a missing prefix and an empty map', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');

         assert.deepEqual(collect(map.subtreeEntries({ pathPrefix: 'missing' })), []);

         map.clear();

         assert.deepEqual(collect(map.subtreeKeys()), []);
      });

      it('includes a stop entry and prunes its descendants while retaining siblings', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');
         map.set('actor.hp.value', 'hp-value');
         map.set('actor.ac', 'ac');

         assert.deepEqual(collect(map.subtreeValues({
            pathPrefix: 'actor',
            stopAt: 'actor.hp'
         })), ['hp', 'ac']);
      });

      it('prunes a non-terminal stop node', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp.value', 'hp-value');
         map.set('actor.ac', 'ac');

         assert.deepEqual(collect(map.subtreeEntries({
            pathPrefix: 'actor',
            stopAt: 'actor.hp'
         })), [
            [['actor', 'ac'], 'ac']
         ]);
      });

      it('can stop at the selected prefix', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor', 'actor');
         map.set('actor.hp', 'hp');

         assert.deepEqual(collect(map.subtreeValues({
            pathPrefix: 'actor',
            stopAt: 'actor'
         })), ['actor']);
      });

      it('ignores a valid missing stop path', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');

         assert.deepEqual(collect(map.subtreeValues({
            pathPrefix: 'actor',
            stopAt: 'actor.missing'
         })), ['hp']);
      });

      it('supports symbol and SameValueZero numeric bounds', () =>
      {
         const symbol = Symbol('branch');
         const map = new PropertyPathMap<string>();
         map.set([symbol, NaN], 'nan');
         map.set([symbol, NaN, 'child'], 'child');

         assert.deepEqual(collect(map.subtreeEntries({
            pathPrefix: [symbol, NaN],
            stopAt: [symbol, NaN, 'child']
         })), [
            [[symbol, NaN], 'nan'],
            [[symbol, NaN, 'child'], 'child']
         ]);
      });

      it('validates subtree bounds during iteration', () =>
      {
         const map = new PropertyPathMap<string>();
         map.set('actor.hp', 'hp');
         const invalid = [] as unknown as readonly PropertyKey[];

         assert.throws(() => collect(map.subtreeEntries({ pathPrefix: invalid })), TypeError);
         assert.throws(() => collect(map.subtreeKeys({ stopAt: invalid })), TypeError);

         assert.throws(() => collect(map.subtreeValues({
            pathPrefix: 'actor.hp',
            stopAt: 'actor'
         })), RangeError);

         assert.throws(() => collect(map.subtreeValues({
            pathPrefix: 'actor',
            stopAt: 'token'
         })), RangeError);
      });
   });
});
