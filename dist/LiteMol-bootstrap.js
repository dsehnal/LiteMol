
; var __LiteMol_Bootstrap = function (__LiteMol_Core, __LiteMol_Visualization) {
  'use strict';
var LiteMol = { Core: __LiteMol_Core,Visualization: __LiteMol_Visualization };
/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */


/* 

BSD License

For Immutable JS software

Copyright (c) 2014-2015, Facebook, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

 * Neither the name Facebook nor the names of its contributors may be used to
   endorse or promote products derived from this software without specific
   prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var __LiteMolImmutable;
(function (global, factory) {
    __LiteMolImmutable = factory();
}({}, function () {
    'use strict'; var SLICE$0 = Array.prototype.slice;

    function createClass(ctor, superClass) {
        if (superClass) {
            ctor.prototype = Object.create(superClass.prototype);
        }
        ctor.prototype.constructor = ctor;
    }

    function Iterable(value) {
        return isIterable(value) ? value : Seq(value);
    }


    createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
        return isKeyed(value) ? value : KeyedSeq(value);
    }


    createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
        return isIndexed(value) ? value : IndexedSeq(value);
    }


    createClass(SetIterable, Iterable);
    function SetIterable(value) {
        return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }



    function isIterable(maybeIterable) {
        return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
    }

    function isKeyed(maybeKeyed) {
        return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
    }

    function isIndexed(maybeIndexed) {
        return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
    }

    function isAssociative(maybeAssociative) {
        return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
    }

    function isOrdered(maybeOrdered) {
        return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
    }

    Iterable.isIterable = isIterable;
    Iterable.isKeyed = isKeyed;
    Iterable.isIndexed = isIndexed;
    Iterable.isAssociative = isAssociative;
    Iterable.isOrdered = isOrdered;

    Iterable.Keyed = KeyedIterable;
    Iterable.Indexed = IndexedIterable;
    Iterable.Set = SetIterable;


    var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
    var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
    var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
    var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

    // Used for setting prototype methods that IE8 chokes on.
    var DELETE = 'delete';

    // Constants describing the size of trie nodes.
    var SHIFT = 5; // Resulted in best performance after ______?
    var SIZE = 1 << SHIFT;
    var MASK = SIZE - 1;

    // A consistent shared value representing "not set" which equals nothing other
    // than itself, and nothing that could be provided externally.
    var NOT_SET = {};

    // Boolean references, Rough equivalent of `bool &`.
    var CHANGE_LENGTH = { value: false };
    var DID_ALTER = { value: false };

    function MakeRef(ref) {
        ref.value = false;
        return ref;
    }

    function SetRef(ref) {
        ref && (ref.value = true);
    }

    // A function which returns a value representing an "owner" for transient writes
    // to tries. The return value will only ever equal itself, and will not equal
    // the return of any subsequent call of this function.
    function OwnerID() { }

    // http://jsperf.com/copy-array-inline
    function arrCopy(arr, offset) {
        offset = offset || 0;
        var len = Math.max(0, arr.length - offset);
        var newArr = new Array(len);
        for (var ii = 0; ii < len; ii++) {
            newArr[ii] = arr[ii + offset];
        }
        return newArr;
    }

    function ensureSize(iter) {
        if (iter.size === undefined) {
            iter.size = iter.__iterate(returnTrue);
        }
        return iter.size;
    }

    function wrapIndex(iter, index) {
        // This implements "is array index" which the ECMAString spec defines as:
        //
        //     A String property name P is an array index if and only if
        //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
        //     to 2^32−1.
        //
        // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
        if (typeof index !== 'number') {
            var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
            if ('' + uint32Index !== index || uint32Index === 4294967295) {
                return NaN;
            }
            index = uint32Index;
        }
        return index < 0 ? ensureSize(iter) + index : index;
    }

    function returnTrue() {
        return true;
    }

    function wholeSlice(begin, end, size) {
        return (begin === 0 || (size !== undefined && begin <= -size)) &&
          (end === undefined || (size !== undefined && end >= size));
    }

    function resolveBegin(begin, size) {
        return resolveIndex(begin, size, 0);
    }

    function resolveEnd(end, size) {
        return resolveIndex(end, size, size);
    }

    function resolveIndex(index, size, defaultIndex) {
        return index === undefined ?
            defaultIndex :
          index < 0 ?
            Math.max(0, size + index) :
            size === undefined ?
            index :
              Math.min(size, index);
    }

    /* global Symbol */

    var ITERATE_KEYS = 0;
    var ITERATE_VALUES = 1;
    var ITERATE_ENTRIES = 2;

    var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator';

    var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


    function Iterator(next) {
        this.next = next;
    }

    Iterator.prototype.toString = function () {
        return '[Iterator]';
    };


    Iterator.KEYS = ITERATE_KEYS;
    Iterator.VALUES = ITERATE_VALUES;
    Iterator.ENTRIES = ITERATE_ENTRIES;

    Iterator.prototype.inspect =
    Iterator.prototype.toSource = function () { return this.toString(); }
    Iterator.prototype[ITERATOR_SYMBOL] = function () {
        return this;
    };


    function iteratorValue(type, k, v, iteratorResult) {
        var value = type === 0 ? k : type === 1 ? v : [k, v];
        iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
            value: value, done: false
        });
        return iteratorResult;
    }

    function iteratorDone() {
        return { value: undefined, done: true };
    }

    function hasIterator(maybeIterable) {
        return !!getIteratorFn(maybeIterable);
    }

    function isIterator(maybeIterator) {
        return maybeIterator && typeof maybeIterator.next === 'function';
    }

    function getIterator(iterable) {
        var iteratorFn = getIteratorFn(iterable);
        return iteratorFn && iteratorFn.call(iterable);
    }

    function getIteratorFn(iterable) {
        var iteratorFn = iterable && (
          (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
          iterable[FAUX_ITERATOR_SYMBOL]
        );
        if (typeof iteratorFn === 'function') {
            return iteratorFn;
        }
    }

    function isArrayLike(value) {
        return value && typeof value.length === 'number';
    }

    createClass(Seq, Iterable);
    function Seq(value) {
        return value === null || value === undefined ? emptySequence() :
          isIterable(value) ? value.toSeq() : seqFromValue(value);
    }

    Seq.of = function (/*...values*/) {
        return Seq(arguments);
    };

    Seq.prototype.toSeq = function () {
        return this;
    };

    Seq.prototype.toString = function () {
        return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function () {
        if (!this._cache && this.__iterateUncached) {
            this._cache = this.entrySeq().toArray();
            this.size = this._cache.length;
        }
        return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function (fn, reverse) {
        return seqIterate(this, fn, reverse, true);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function (type, reverse) {
        return seqIterator(this, type, reverse, true);
    };



    createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
        return value === null || value === undefined ?
          emptySequence().toKeyedSeq() :
          isIterable(value) ?
            (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
            keyedSeqFromValue(value);
    }

    KeyedSeq.prototype.toKeyedSeq = function () {
        return this;
    };



    createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
        return value === null || value === undefined ? emptySequence() :
          !isIterable(value) ? indexedSeqFromValue(value) :
          isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }

    IndexedSeq.of = function (/*...values*/) {
        return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function () {
        return this;
    };

    IndexedSeq.prototype.toString = function () {
        return this.__toString('Seq [', ']');
    };

    IndexedSeq.prototype.__iterate = function (fn, reverse) {
        return seqIterate(this, fn, reverse, false);
    };

    IndexedSeq.prototype.__iterator = function (type, reverse) {
        return seqIterator(this, type, reverse, false);
    };



    createClass(SetSeq, Seq);
    function SetSeq(value) {
        return (
          value === null || value === undefined ? emptySequence() :
          !isIterable(value) ? indexedSeqFromValue(value) :
          isKeyed(value) ? value.entrySeq() : value
        ).toSetSeq();
    }

    SetSeq.of = function (/*...values*/) {
        return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function () {
        return this;
    };



    Seq.isSeq = isSeq;
    Seq.Keyed = KeyedSeq;
    Seq.Set = SetSeq;
    Seq.Indexed = IndexedSeq;

    var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

    Seq.prototype[IS_SEQ_SENTINEL] = true;



    createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
        this._array = array;
        this.size = array.length;
    }

    ArraySeq.prototype.get = function (index, notSetValue) {
        return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function (fn, reverse) {
        var array = this._array;
        var maxIndex = array.length - 1;
        for (var ii = 0; ii <= maxIndex; ii++) {
            if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
                return ii + 1;
            }
        }
        return ii;
    };

    ArraySeq.prototype.__iterator = function (type, reverse) {
        var array = this._array;
        var maxIndex = array.length - 1;
        var ii = 0;
        return new Iterator(function () {
            return ii > maxIndex ?
             iteratorDone() :
             iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])
        }
        );
    };



    createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
        var keys = Object.keys(object);
        this._object = object;
        this._keys = keys;
        this.size = keys.length;
    }

    ObjectSeq.prototype.get = function (key, notSetValue) {
        if (notSetValue !== undefined && !this.has(key)) {
            return notSetValue;
        }
        return this._object[key];
    };

    ObjectSeq.prototype.has = function (key) {
        return this._object.hasOwnProperty(key);
    };

    ObjectSeq.prototype.__iterate = function (fn, reverse) {
        var object = this._object;
        var keys = this._keys;
        var maxIndex = keys.length - 1;
        for (var ii = 0; ii <= maxIndex; ii++) {
            var key = keys[reverse ? maxIndex - ii : ii];
            if (fn(object[key], key, this) === false) {
                return ii + 1;
            }
        }
        return ii;
    };

    ObjectSeq.prototype.__iterator = function (type, reverse) {
        var object = this._object;
        var keys = this._keys;
        var maxIndex = keys.length - 1;
        var ii = 0;
        return new Iterator(function () {
            var key = keys[reverse ? maxIndex - ii : ii];
            return ii++ > maxIndex ?
              iteratorDone() :
              iteratorValue(type, key, object[key]);
        });
    };

    ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


    createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
        this._iterable = iterable;
        this.size = iterable.length || iterable.size;
    }

    IterableSeq.prototype.__iterateUncached = function (fn, reverse) {
        if (reverse) {
            return this.cacheResult().__iterate(fn, reverse);
        }
        var iterable = this._iterable;
        var iterator = getIterator(iterable);
        var iterations = 0;
        if (isIterator(iterator)) {
            var step;
            while (!(step = iterator.next()).done) {
                if (fn(step.value, iterations++, this) === false) {
                    break;
                }
            }
        }
        return iterations;
    };

    IterableSeq.prototype.__iteratorUncached = function (type, reverse) {
        if (reverse) {
            return this.cacheResult().__iterator(type, reverse);
        }
        var iterable = this._iterable;
        var iterator = getIterator(iterable);
        if (!isIterator(iterator)) {
            return new Iterator(iteratorDone);
        }
        var iterations = 0;
        return new Iterator(function () {
            var step = iterator.next();
            return step.done ? step : iteratorValue(type, iterations++, step.value);
        });
    };



    createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
        this._iterator = iterator;
        this._iteratorCache = [];
    }

    IteratorSeq.prototype.__iterateUncached = function (fn, reverse) {
        if (reverse) {
            return this.cacheResult().__iterate(fn, reverse);
        }
        var iterator = this._iterator;
        var cache = this._iteratorCache;
        var iterations = 0;
        while (iterations < cache.length) {
            if (fn(cache[iterations], iterations++, this) === false) {
                return iterations;
            }
        }
        var step;
        while (!(step = iterator.next()).done) {
            var val = step.value;
            cache[iterations] = val;
            if (fn(val, iterations++, this) === false) {
                break;
            }
        }
        return iterations;
    };

    IteratorSeq.prototype.__iteratorUncached = function (type, reverse) {
        if (reverse) {
            return this.cacheResult().__iterator(type, reverse);
        }
        var iterator = this._iterator;
        var cache = this._iteratorCache;
        var iterations = 0;
        return new Iterator(function () {
            if (iterations >= cache.length) {
                var step = iterator.next();
                if (step.done) {
                    return step;
                }
                cache[iterations] = step.value;
            }
            return iteratorValue(type, iterations, cache[iterations++]);
        });
    };




    // # pragma Helper functions

    function isSeq(maybeSeq) {
        return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
    }

    var EMPTY_SEQ;

    function emptySequence() {
        return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
    }

    function keyedSeqFromValue(value) {
        var seq =
          Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
          isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
          hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
          typeof value === 'object' ? new ObjectSeq(value) :
          undefined;
        if (!seq) {
            throw new TypeError(
              'Expected Array or iterable object of [k, v] entries, ' +
              'or keyed object: ' + value
            );
        }
        return seq;
    }

    function indexedSeqFromValue(value) {
        var seq = maybeIndexedSeqFromValue(value);
        if (!seq) {
            throw new TypeError(
              'Expected Array or iterable object of values: ' + value
            );
        }
        return seq;
    }

    function seqFromValue(value) {
        var seq = maybeIndexedSeqFromValue(value) ||
          (typeof value === 'object' && new ObjectSeq(value));
        if (!seq) {
            throw new TypeError(
              'Expected Array or iterable object of values, or keyed object: ' + value
            );
        }
        return seq;
    }

    function maybeIndexedSeqFromValue(value) {
        return (
          isArrayLike(value) ? new ArraySeq(value) :
          isIterator(value) ? new IteratorSeq(value) :
          hasIterator(value) ? new IterableSeq(value) :
          undefined
        );
    }

    function seqIterate(seq, fn, reverse, useKeys) {
        var cache = seq._cache;
        if (cache) {
            var maxIndex = cache.length - 1;
            for (var ii = 0; ii <= maxIndex; ii++) {
                var entry = cache[reverse ? maxIndex - ii : ii];
                if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
                    return ii + 1;
                }
            }
            return ii;
        }
        return seq.__iterateUncached(fn, reverse);
    }

    function seqIterator(seq, type, reverse, useKeys) {
        var cache = seq._cache;
        if (cache) {
            var maxIndex = cache.length - 1;
            var ii = 0;
            return new Iterator(function () {
                var entry = cache[reverse ? maxIndex - ii : ii];
                return ii++ > maxIndex ?
                  iteratorDone() :
                  iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
            });
        }
        return seq.__iteratorUncached(type, reverse);
    }

    function fromJS(json, converter) {
        return converter ?
          fromJSWith(converter, json, '', { '': json }) :
          fromJSDefault(json);
    }

    function fromJSWith(converter, json, key, parentJSON) {
        if (Array.isArray(json)) {
            return converter.call(parentJSON, key, IndexedSeq(json).map(function (v, k) { return fromJSWith(converter, v, k, json) }));
        }
        if (isPlainObj(json)) {
            return converter.call(parentJSON, key, KeyedSeq(json).map(function (v, k) { return fromJSWith(converter, v, k, json) }));
        }
        return json;
    }

    function fromJSDefault(json) {
        if (Array.isArray(json)) {
            return IndexedSeq(json).map(fromJSDefault).toList();
        }
        if (isPlainObj(json)) {
            return KeyedSeq(json).map(fromJSDefault).toMap();
        }
        return json;
    }

    function isPlainObj(value) {
        return value && (value.constructor === Object || value.constructor === undefined);
    }

    /**
     * An extension of the "same-value" algorithm as [described for use by ES6 Map
     * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
     *
     * NaN is considered the same as NaN, however -0 and 0 are considered the same
     * value, which is different from the algorithm described by
     * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
     *
     * This is extended further to allow Objects to describe the values they
     * represent, by way of `valueOf` or `equals` (and `hashCode`).
     *
     * Note: because of this extension, the key equality of Immutable.Map and the
     * value equality of Immutable.Set will differ from ES6 Map and Set.
     *
     * ### Defining custom values
     *
     * The easiest way to describe the value an object represents is by implementing
     * `valueOf`. For example, `Date` represents a value by returning a unix
     * timestamp for `valueOf`:
     *
     *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
     *     var date2 = new Date(1234567890000);
     *     date1.valueOf(); // 1234567890000
     *     assert( date1 !== date2 );
     *     assert( Immutable.is( date1, date2 ) );
     *
     * Note: overriding `valueOf` may have other implications if you use this object
     * where JavaScript expects a primitive, such as implicit string coercion.
     *
     * For more complex types, especially collections, implementing `valueOf` may
     * not be performant. An alternative is to implement `equals` and `hashCode`.
     *
     * `equals` takes another object, presumably of similar type, and returns true
     * if the it is equal. Equality is symmetrical, so the same result should be
     * returned if this and the argument are flipped.
     *
     *     assert( a.equals(b) === b.equals(a) );
     *
     * `hashCode` returns a 32bit integer number representing the object which will
     * be used to determine how to store the value object in a Map or Set. You must
     * provide both or neither methods, one must not exist without the other.
     *
     * Also, an important relationship between these methods must be upheld: if two
     * values are equal, they *must* return the same hashCode. If the values are not
     * equal, they might have the same hashCode; this is called a hash collision,
     * and while undesirable for performance reasons, it is acceptable.
     *
     *     if (a.equals(b)) {
     *       assert( a.hashCode() === b.hashCode() );
     *     }
     *
     * All Immutable collections implement `equals` and `hashCode`.
     *
     */
    function is(valueA, valueB) {
        if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
            return true;
        }
        if (!valueA || !valueB) {
            return false;
        }
        if (typeof valueA.valueOf === 'function' &&
            typeof valueB.valueOf === 'function') {
            valueA = valueA.valueOf();
            valueB = valueB.valueOf();
            if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
                return true;
            }
            if (!valueA || !valueB) {
                return false;
            }
        }
        if (typeof valueA.equals === 'function' &&
            typeof valueB.equals === 'function' &&
            valueA.equals(valueB)) {
            return true;
        }
        return false;
    }

    function deepEqual(a, b) {
        if (a === b) {
            return true;
        }

        if (
          !isIterable(b) ||
          a.size !== undefined && b.size !== undefined && a.size !== b.size ||
          a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
          isKeyed(a) !== isKeyed(b) ||
          isIndexed(a) !== isIndexed(b) ||
          isOrdered(a) !== isOrdered(b)
        ) {
            return false;
        }

        if (a.size === 0 && b.size === 0) {
            return true;
        }

        var notAssociative = !isAssociative(a);

        if (isOrdered(a)) {
            var entries = a.entries();
            return b.every(function (v, k) {
                var entry = entries.next().value;
                return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
            }) && entries.next().done;
        }

        var flipped = false;

        if (a.size === undefined) {
            if (b.size === undefined) {
                if (typeof a.cacheResult === 'function') {
                    a.cacheResult();
                }
            } else {
                flipped = true;
                var _ = a;
                a = b;
                b = _;
            }
        }

        var allEqual = true;
        var bSize = b.__iterate(function (v, k) {
            if (notAssociative ? !a.has(v) :
                flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
                allEqual = false;
                return false;
            }
        });

        return allEqual && a.size === bSize;
    }

    createClass(Repeat, IndexedSeq);

    function Repeat(value, times) {
        if (!(this instanceof Repeat)) {
            return new Repeat(value, times);
        }
        this._value = value;
        this.size = times === undefined ? Infinity : Math.max(0, times);
        if (this.size === 0) {
            if (EMPTY_REPEAT) {
                return EMPTY_REPEAT;
            }
            EMPTY_REPEAT = this;
        }
    }

    Repeat.prototype.toString = function () {
        if (this.size === 0) {
            return 'Repeat []';
        }
        return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function (index, notSetValue) {
        return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.includes = function (searchValue) {
        return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function (begin, end) {
        var size = this.size;
        return wholeSlice(begin, end, size) ? this :
          new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };

    Repeat.prototype.reverse = function () {
        return this;
    };

    Repeat.prototype.indexOf = function (searchValue) {
        if (is(this._value, searchValue)) {
            return 0;
        }
        return -1;
    };

    Repeat.prototype.lastIndexOf = function (searchValue) {
        if (is(this._value, searchValue)) {
            return this.size;
        }
        return -1;
    };

    Repeat.prototype.__iterate = function (fn, reverse) {
        for (var ii = 0; ii < this.size; ii++) {
            if (fn(this._value, ii, this) === false) {
                return ii + 1;
            }
        }
        return ii;
    };

    Repeat.prototype.__iterator = function (type, reverse) {
        var this$0 = this;
        var ii = 0;
        return new Iterator(function ()
        { return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone() }
        );
    };

    Repeat.prototype.equals = function (other) {
        return other instanceof Repeat ?
          is(this._value, other._value) :
          deepEqual(other);
    };


    var EMPTY_REPEAT;

    function invariant(condition, error) {
        if (!condition) throw new Error(error);
    }

    createClass(Range, IndexedSeq);

    function Range(start, end, step) {
        if (!(this instanceof Range)) {
            return new Range(start, end, step);
        }
        invariant(step !== 0, 'Cannot step a Range by 0');
        start = start || 0;
        if (end === undefined) {
            end = Infinity;
        }
        step = step === undefined ? 1 : Math.abs(step);
        if (end < start) {
            step = -step;
        }
        this._start = start;
        this._end = end;
        this._step = step;
        this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
        if (this.size === 0) {
            if (EMPTY_RANGE) {
                return EMPTY_RANGE;
            }
            EMPTY_RANGE = this;
        }
    }

    Range.prototype.toString = function () {
        if (this.size === 0) {
            return 'Range []';
        }
        return 'Range [ ' +
          this._start + '...' + this._end +
          (this._step !== 1 ? ' by ' + this._step : '') +
        ' ]';
    };

    Range.prototype.get = function (index, notSetValue) {
        return this.has(index) ?
          this._start + wrapIndex(this, index) * this._step :
          notSetValue;
    };

    Range.prototype.includes = function (searchValue) {
        var possibleIndex = (searchValue - this._start) / this._step;
        return possibleIndex >= 0 &&
          possibleIndex < this.size &&
          possibleIndex === Math.floor(possibleIndex);
    };

    Range.prototype.slice = function (begin, end) {
        if (wholeSlice(begin, end, this.size)) {
            return this;
        }
        begin = resolveBegin(begin, this.size);
        end = resolveEnd(end, this.size);
        if (end <= begin) {
            return new Range(0, 0);
        }
        return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };

    Range.prototype.indexOf = function (searchValue) {
        var offsetValue = searchValue - this._start;
        if (offsetValue % this._step === 0) {
            var index = offsetValue / this._step;
            if (index >= 0 && index < this.size) {
                return index
            }
        }
        return -1;
    };

    Range.prototype.lastIndexOf = function (searchValue) {
        return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function (fn, reverse) {
        var maxIndex = this.size - 1;
        var step = this._step;
        var value = reverse ? this._start + maxIndex * step : this._start;
        for (var ii = 0; ii <= maxIndex; ii++) {
            if (fn(value, ii, this) === false) {
                return ii + 1;
            }
            value += reverse ? -step : step;
        }
        return ii;
    };

    Range.prototype.__iterator = function (type, reverse) {
        var maxIndex = this.size - 1;
        var step = this._step;
        var value = reverse ? this._start + maxIndex * step : this._start;
        var ii = 0;
        return new Iterator(function () {
            var v = value;
            value += reverse ? -step : step;
            return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
        });
    };

    Range.prototype.equals = function (other) {
        return other instanceof Range ?
          this._start === other._start &&
          this._end === other._end &&
          this._step === other._step :
          deepEqual(this, other);
    };


    var EMPTY_RANGE;

    createClass(Collection, Iterable);
    function Collection() {
        throw TypeError('Abstract');
    }


    createClass(KeyedCollection, Collection); function KeyedCollection() { }

    createClass(IndexedCollection, Collection); function IndexedCollection() { }

    createClass(SetCollection, Collection); function SetCollection() { }


    Collection.Keyed = KeyedCollection;
    Collection.Indexed = IndexedCollection;
    Collection.Set = SetCollection;

    var imul =
      typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
      Math.imul :
      function imul(a, b) {
          a = a | 0; // int
          b = b | 0; // int
          var c = a & 0xffff;
          var d = b & 0xffff;
          // Shift by 0 fixes the sign on the high part.
          return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
      };

    // v8 has an optimization for storing 31-bit signed numbers.
    // Values which have either 00 or 11 as the high order bits qualify.
    // This function drops the highest order bit in a signed number, maintaining
    // the sign bit.
    function smi(i32) {
        return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
    }

    function hash(o) {
        if (o === false || o === null || o === undefined) {
            return 0;
        }
        if (typeof o.valueOf === 'function') {
            o = o.valueOf();
            if (o === false || o === null || o === undefined) {
                return 0;
            }
        }
        if (o === true) {
            return 1;
        }
        var type = typeof o;
        if (type === 'number') {
            var h = o | 0;
            if (h !== o) {
                h ^= o * 0xFFFFFFFF;
            }
            while (o > 0xFFFFFFFF) {
                o /= 0xFFFFFFFF;
                h ^= o;
            }
            return smi(h);
        }
        if (type === 'string') {
            return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
        }
        if (typeof o.hashCode === 'function') {
            return o.hashCode();
        }
        if (type === 'object') {
            return hashJSObj(o);
        }
        if (typeof o.toString === 'function') {
            return hashString(o.toString());
        }
        throw new Error('Value type ' + type + ' cannot be hashed.');
    }

    function cachedHashString(string) {
        var hash = stringHashCache[string];
        if (hash === undefined) {
            hash = hashString(string);
            if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
                STRING_HASH_CACHE_SIZE = 0;
                stringHashCache = {};
            }
            STRING_HASH_CACHE_SIZE++;
            stringHashCache[string] = hash;
        }
        return hash;
    }

    // http://jsperf.com/hashing-strings
    function hashString(string) {
        // This is the hash from JVM
        // The hash code for a string is computed as
        // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
        // where s[i] is the ith character of the string and n is the length of
        // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
        // (exclusive) by dropping high bits.
        var hash = 0;
        for (var ii = 0; ii < string.length; ii++) {
            hash = 31 * hash + string.charCodeAt(ii) | 0;
        }
        return smi(hash);
    }

    function hashJSObj(obj) {
        var hash;
        if (usingWeakMap) {
            hash = weakMap.get(obj);
            if (hash !== undefined) {
                return hash;
            }
        }

        hash = obj[UID_HASH_KEY];
        if (hash !== undefined) {
            return hash;
        }

        if (!canDefineProperty) {
            hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
            if (hash !== undefined) {
                return hash;
            }

            hash = getIENodeHash(obj);
            if (hash !== undefined) {
                return hash;
            }
        }

        hash = ++objHashUID;
        if (objHashUID & 0x40000000) {
            objHashUID = 0;
        }

        if (usingWeakMap) {
            weakMap.set(obj, hash);
        } else if (isExtensible !== undefined && isExtensible(obj) === false) {
            throw new Error('Non-extensible objects are not allowed as keys.');
        } else if (canDefineProperty) {
            Object.defineProperty(obj, UID_HASH_KEY, {
                'enumerable': false,
                'configurable': false,
                'writable': false,
                'value': hash
            });
        } else if (obj.propertyIsEnumerable !== undefined &&
                   obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
            // Since we can't define a non-enumerable property on the object
            // we'll hijack one of the less-used non-enumerable properties to
            // save our hash on it. Since this is a function it will not show up in
            // `JSON.stringify` which is what we want.
            obj.propertyIsEnumerable = function () {
                return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
            };
            obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
        } else if (obj.nodeType !== undefined) {
            // At this point we couldn't get the IE `uniqueID` to use as a hash
            // and we couldn't use a non-enumerable property to exploit the
            // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
            // itself.
            obj[UID_HASH_KEY] = hash;
        } else {
            throw new Error('Unable to set a non-enumerable property on object.');
        }

        return hash;
    }

    // Get references to ES5 object methods.
    var isExtensible = Object.isExtensible;

    // True if Object.defineProperty works as expected. IE8 fails this test.
    var canDefineProperty = (function () {
        try {
            Object.defineProperty({}, '@', {});
            return true;
        } catch (e) {
            return false;
        }
    }());

    // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
    // and avoid memory leaks from the IE cloneNode bug.
    function getIENodeHash(node) {
        if (node && node.nodeType > 0) {
            switch (node.nodeType) {
                case 1: // Element
                    return node.uniqueID;
                case 9: // Document
                    return node.documentElement && node.documentElement.uniqueID;
            }
        }
    }

    // If possible, use a WeakMap.
    var usingWeakMap = typeof WeakMap === 'function';
    var weakMap;
    if (usingWeakMap) {
        weakMap = new WeakMap();
    }

    var objHashUID = 0;

    var UID_HASH_KEY = '__immutablehash__';
    if (typeof Symbol === 'function') {
        UID_HASH_KEY = Symbol(UID_HASH_KEY);
    }

    var STRING_HASH_CACHE_MIN_STRLEN = 16;
    var STRING_HASH_CACHE_MAX_SIZE = 255;
    var STRING_HASH_CACHE_SIZE = 0;
    var stringHashCache = {};

    function assertNotInfinite(size) {
        invariant(
          size !== Infinity,
          'Cannot perform this action with an infinite size.'
        );
    }

    createClass(Map, KeyedCollection);

    // @pragma Construction

    function Map(value) {
        return value === null || value === undefined ? emptyMap() :
          isMap(value) && !isOrdered(value) ? value :
          emptyMap().withMutations(function (map) {
              var iter = KeyedIterable(value);
              assertNotInfinite(iter.size);
              iter.forEach(function (v, k) { return map.set(k, v) });
          });
    }

    Map.of = function () {
        var keyValues = SLICE$0.call(arguments, 0);
        return emptyMap().withMutations(function (map) {
            for (var i = 0; i < keyValues.length; i += 2) {
                if (i + 1 >= keyValues.length) {
                    throw new Error('Missing value for key: ' + keyValues[i]);
                }
                map.set(keyValues[i], keyValues[i + 1]);
            }
        });
    };

    Map.prototype.toString = function () {
        return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function (k, notSetValue) {
        return this._root ?
          this._root.get(0, undefined, k, notSetValue) :
          notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function (k, v) {
        return updateMap(this, k, v);
    };

    Map.prototype.setIn = function (keyPath, v) {
        return this.updateIn(keyPath, NOT_SET, function () { return v });
    };

    Map.prototype.remove = function (k) {
        return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteIn = function (keyPath) {
        return this.updateIn(keyPath, function () { return NOT_SET });
    };

    Map.prototype.update = function (k, notSetValue, updater) {
        return arguments.length === 1 ?
          k(this) :
          this.updateIn([k], notSetValue, updater);
    };

    Map.prototype.updateIn = function (keyPath, notSetValue, updater) {
        if (!updater) {
            updater = notSetValue;
            notSetValue = undefined;
        }
        var updatedValue = updateInDeepMap(
          this,
          forceIterator(keyPath),
          notSetValue,
          updater
        );
        return updatedValue === NOT_SET ? undefined : updatedValue;
    };

    Map.prototype.clear = function () {
        if (this.size === 0) {
            return this;
        }
        if (this.__ownerID) {
            this.size = 0;
            this._root = null;
            this.__hash = undefined;
            this.__altered = true;
            return this;
        }
        return emptyMap();
    };

    // @pragma Composition

    Map.prototype.merge = function (/*...iters*/) {
        return mergeIntoMapWith(this, undefined, arguments);
    };

    Map.prototype.mergeWith = function (merger) {
        var iters = SLICE$0.call(arguments, 1);
        return mergeIntoMapWith(this, merger, iters);
    };

    Map.prototype.mergeIn = function (keyPath) {
        var iters = SLICE$0.call(arguments, 1);
        return this.updateIn(
          keyPath,
          emptyMap(),
          function (m) {
              return typeof m.merge === 'function' ?
                m.merge.apply(m, iters) :
                iters[iters.length - 1]
          }
        );
    };

    Map.prototype.mergeDeep = function (/*...iters*/) {
        return mergeIntoMapWith(this, deepMerger, arguments);
    };

    Map.prototype.mergeDeepWith = function (merger) {
        var iters = SLICE$0.call(arguments, 1);
        return mergeIntoMapWith(this, deepMergerWith(merger), iters);
    };

    Map.prototype.mergeDeepIn = function (keyPath) {
        var iters = SLICE$0.call(arguments, 1);
        return this.updateIn(
          keyPath,
          emptyMap(),
          function (m) {
              return typeof m.mergeDeep === 'function' ?
                m.mergeDeep.apply(m, iters) :
                iters[iters.length - 1]
          }
        );
    };

    Map.prototype.sort = function (comparator) {
        // Late binding
        return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function (mapper, comparator) {
        // Late binding
        return OrderedMap(sortFactory(this, comparator, mapper));
    };

    // @pragma Mutability

    Map.prototype.withMutations = function (fn) {
        var mutable = this.asMutable();
        fn(mutable);
        return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };

    Map.prototype.asMutable = function () {
        return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };

    Map.prototype.asImmutable = function () {
        return this.__ensureOwner();
    };

    Map.prototype.wasAltered = function () {
        return this.__altered;
    };

    Map.prototype.__iterator = function (type, reverse) {
        return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        var iterations = 0;
        this._root && this._root.iterate(function (entry) {
            iterations++;
            return fn(entry[1], entry[0], this$0);
        }, reverse);
        return iterations;
    };

    Map.prototype.__ensureOwner = function (ownerID) {
        if (ownerID === this.__ownerID) {
            return this;
        }
        if (!ownerID) {
            this.__ownerID = ownerID;
            this.__altered = false;
            return this;
        }
        return makeMap(this.size, this._root, ownerID, this.__hash);
    };


    function isMap(maybeMap) {
        return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
    }

    Map.isMap = isMap;

    var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

    var MapPrototype = Map.prototype;
    MapPrototype[IS_MAP_SENTINEL] = true;
    MapPrototype[DELETE] = MapPrototype.remove;
    MapPrototype.removeIn = MapPrototype.deleteIn;


    // #pragma Trie Nodes



    function ArrayMapNode(ownerID, entries) {
        this.ownerID = ownerID;
        this.entries = entries;
    }

    ArrayMapNode.prototype.get = function (shift, keyHash, key, notSetValue) {
        var entries = this.entries;
        for (var ii = 0, len = entries.length; ii < len; ii++) {
            if (is(key, entries[ii][0])) {
                return entries[ii][1];
            }
        }
        return notSetValue;
    };

    ArrayMapNode.prototype.update = function (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
        var removed = value === NOT_SET;

        var entries = this.entries;
        var idx = 0;
        for (var len = entries.length; idx < len; idx++) {
            if (is(key, entries[idx][0])) {
                break;
            }
        }
        var exists = idx < len;

        if (exists ? entries[idx][1] === value : removed) {
            return this;
        }

        SetRef(didAlter);
        (removed || !exists) && SetRef(didChangeSize);

        if (removed && entries.length === 1) {
            return; // undefined
        }

        if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
            return createNodes(ownerID, entries, key, value);
        }

        var isEditable = ownerID && ownerID === this.ownerID;
        var newEntries = isEditable ? entries : arrCopy(entries);

        if (exists) {
            if (removed) {
                idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
            } else {
                newEntries[idx] = [key, value];
            }
        } else {
            newEntries.push([key, value]);
        }

        if (isEditable) {
            this.entries = newEntries;
            return this;
        }

        return new ArrayMapNode(ownerID, newEntries);
    };




    function BitmapIndexedNode(ownerID, bitmap, nodes) {
        this.ownerID = ownerID;
        this.bitmap = bitmap;
        this.nodes = nodes;
    }

    BitmapIndexedNode.prototype.get = function (shift, keyHash, key, notSetValue) {
        if (keyHash === undefined) {
            keyHash = hash(key);
        }
        var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
        var bitmap = this.bitmap;
        return (bitmap & bit) === 0 ? notSetValue :
          this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };

    BitmapIndexedNode.prototype.update = function (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
        if (keyHash === undefined) {
            keyHash = hash(key);
        }
        var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
        var bit = 1 << keyHashFrag;
        var bitmap = this.bitmap;
        var exists = (bitmap & bit) !== 0;

        if (!exists && value === NOT_SET) {
            return this;
        }

        var idx = popCount(bitmap & (bit - 1));
        var nodes = this.nodes;
        var node = exists ? nodes[idx] : undefined;
        var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

        if (newNode === node) {
            return this;
        }

        if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
            return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
        }

        if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
            return nodes[idx ^ 1];
        }

        if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
            return newNode;
        }

        var isEditable = ownerID && ownerID === this.ownerID;
        var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
        var newNodes = exists ? newNode ?
          setIn(nodes, idx, newNode, isEditable) :
          spliceOut(nodes, idx, isEditable) :
          spliceIn(nodes, idx, newNode, isEditable);

        if (isEditable) {
            this.bitmap = newBitmap;
            this.nodes = newNodes;
            return this;
        }

        return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };




    function HashArrayMapNode(ownerID, count, nodes) {
        this.ownerID = ownerID;
        this.count = count;
        this.nodes = nodes;
    }

    HashArrayMapNode.prototype.get = function (shift, keyHash, key, notSetValue) {
        if (keyHash === undefined) {
            keyHash = hash(key);
        }
        var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
        var node = this.nodes[idx];
        return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };

    HashArrayMapNode.prototype.update = function (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
        if (keyHash === undefined) {
            keyHash = hash(key);
        }
        var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
        var removed = value === NOT_SET;
        var nodes = this.nodes;
        var node = nodes[idx];

        if (removed && !node) {
            return this;
        }

        var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
        if (newNode === node) {
            return this;
        }

        var newCount = this.count;
        if (!node) {
            newCount++;
        } else if (!newNode) {
            newCount--;
            if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
                return packNodes(ownerID, nodes, newCount, idx);
            }
        }

        var isEditable = ownerID && ownerID === this.ownerID;
        var newNodes = setIn(nodes, idx, newNode, isEditable);

        if (isEditable) {
            this.count = newCount;
            this.nodes = newNodes;
            return this;
        }

        return new HashArrayMapNode(ownerID, newCount, newNodes);
    };




    function HashCollisionNode(ownerID, keyHash, entries) {
        this.ownerID = ownerID;
        this.keyHash = keyHash;
        this.entries = entries;
    }

    HashCollisionNode.prototype.get = function (shift, keyHash, key, notSetValue) {
        var entries = this.entries;
        for (var ii = 0, len = entries.length; ii < len; ii++) {
            if (is(key, entries[ii][0])) {
                return entries[ii][1];
            }
        }
        return notSetValue;
    };

    HashCollisionNode.prototype.update = function (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
        if (keyHash === undefined) {
            keyHash = hash(key);
        }

        var removed = value === NOT_SET;

        if (keyHash !== this.keyHash) {
            if (removed) {
                return this;
            }
            SetRef(didAlter);
            SetRef(didChangeSize);
            return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
        }

        var entries = this.entries;
        var idx = 0;
        for (var len = entries.length; idx < len; idx++) {
            if (is(key, entries[idx][0])) {
                break;
            }
        }
        var exists = idx < len;

        if (exists ? entries[idx][1] === value : removed) {
            return this;
        }

        SetRef(didAlter);
        (removed || !exists) && SetRef(didChangeSize);

        if (removed && len === 2) {
            return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
        }

        var isEditable = ownerID && ownerID === this.ownerID;
        var newEntries = isEditable ? entries : arrCopy(entries);

        if (exists) {
            if (removed) {
                idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
            } else {
                newEntries[idx] = [key, value];
            }
        } else {
            newEntries.push([key, value]);
        }

        if (isEditable) {
            this.entries = newEntries;
            return this;
        }

        return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };




    function ValueNode(ownerID, keyHash, entry) {
        this.ownerID = ownerID;
        this.keyHash = keyHash;
        this.entry = entry;
    }

    ValueNode.prototype.get = function (shift, keyHash, key, notSetValue) {
        return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };

    ValueNode.prototype.update = function (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
        var removed = value === NOT_SET;
        var keyMatch = is(key, this.entry[0]);
        if (keyMatch ? value === this.entry[1] : removed) {
            return this;
        }

        SetRef(didAlter);

        if (removed) {
            SetRef(didChangeSize);
            return; // undefined
        }

        if (keyMatch) {
            if (ownerID && ownerID === this.ownerID) {
                this.entry[1] = value;
                return this;
            }
            return new ValueNode(ownerID, this.keyHash, [key, value]);
        }

        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };



    // #pragma Iterators

    ArrayMapNode.prototype.iterate =
    HashCollisionNode.prototype.iterate = function (fn, reverse) {
        var entries = this.entries;
        for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
            if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
                return false;
            }
        }
    }

    BitmapIndexedNode.prototype.iterate =
    HashArrayMapNode.prototype.iterate = function (fn, reverse) {
        var nodes = this.nodes;
        for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
            var node = nodes[reverse ? maxIndex - ii : ii];
            if (node && node.iterate(fn, reverse) === false) {
                return false;
            }
        }
    }

    ValueNode.prototype.iterate = function (fn, reverse) {
        return fn(this.entry);
    }

    createClass(MapIterator, Iterator);

    function MapIterator(map, type, reverse) {
        this._type = type;
        this._reverse = reverse;
        this._stack = map._root && mapIteratorFrame(map._root);
    }

    MapIterator.prototype.next = function () {
        var type = this._type;
        var stack = this._stack;
        while (stack) {
            var node = stack.node;
            var index = stack.index++;
            var maxIndex;
            if (node.entry) {
                if (index === 0) {
                    return mapIteratorValue(type, node.entry);
                }
            } else if (node.entries) {
                maxIndex = node.entries.length - 1;
                if (index <= maxIndex) {
                    return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
                }
            } else {
                maxIndex = node.nodes.length - 1;
                if (index <= maxIndex) {
                    var subNode = node.nodes[this._reverse ? maxIndex - index : index];
                    if (subNode) {
                        if (subNode.entry) {
                            return mapIteratorValue(type, subNode.entry);
                        }
                        stack = this._stack = mapIteratorFrame(subNode, stack);
                    }
                    continue;
                }
            }
            stack = this._stack = this._stack.__prev;
        }
        return iteratorDone();
    };


    function mapIteratorValue(type, entry) {
        return iteratorValue(type, entry[0], entry[1]);
    }

    function mapIteratorFrame(node, prev) {
        return {
            node: node,
            index: 0,
            __prev: prev
        };
    }

    function makeMap(size, root, ownerID, hash) {
        var map = Object.create(MapPrototype);
        map.size = size;
        map._root = root;
        map.__ownerID = ownerID;
        map.__hash = hash;
        map.__altered = false;
        return map;
    }

    var EMPTY_MAP;
    function emptyMap() {
        return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
    }

    function updateMap(map, k, v) {
        var newRoot;
        var newSize;
        if (!map._root) {
            if (v === NOT_SET) {
                return map;
            }
            newSize = 1;
            newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
        } else {
            var didChangeSize = MakeRef(CHANGE_LENGTH);
            var didAlter = MakeRef(DID_ALTER);
            newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
            if (!didAlter.value) {
                return map;
            }
            newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
        }
        if (map.__ownerID) {
            map.size = newSize;
            map._root = newRoot;
            map.__hash = undefined;
            map.__altered = true;
            return map;
        }
        return newRoot ? makeMap(newSize, newRoot) : emptyMap();
    }

    function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
        if (!node) {
            if (value === NOT_SET) {
                return node;
            }
            SetRef(didAlter);
            SetRef(didChangeSize);
            return new ValueNode(ownerID, keyHash, [key, value]);
        }
        return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
    }

    function isLeafNode(node) {
        return node.constructor === ValueNode || node.constructor === HashCollisionNode;
    }

    function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
        if (node.keyHash === keyHash) {
            return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
        }

        var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
        var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

        var newNode;
        var nodes = idx1 === idx2 ?
          [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
          ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

        return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
    }

    function createNodes(ownerID, entries, key, value) {
        if (!ownerID) {
            ownerID = new OwnerID();
        }
        var node = new ValueNode(ownerID, hash(key), [key, value]);
        for (var ii = 0; ii < entries.length; ii++) {
            var entry = entries[ii];
            node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
        }
        return node;
    }

    function packNodes(ownerID, nodes, count, excluding) {
        var bitmap = 0;
        var packedII = 0;
        var packedNodes = new Array(count);
        for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
            var node = nodes[ii];
            if (node !== undefined && ii !== excluding) {
                bitmap |= bit;
                packedNodes[packedII++] = node;
            }
        }
        return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
    }

    function expandNodes(ownerID, nodes, bitmap, including, node) {
        var count = 0;
        var expandedNodes = new Array(SIZE);
        for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
            expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
        }
        expandedNodes[including] = node;
        return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
    }

    function mergeIntoMapWith(map, merger, iterables) {
        var iters = [];
        for (var ii = 0; ii < iterables.length; ii++) {
            var value = iterables[ii];
            var iter = KeyedIterable(value);
            if (!isIterable(value)) {
                iter = iter.map(function (v) { return fromJS(v) });
            }
            iters.push(iter);
        }
        return mergeIntoCollectionWith(map, merger, iters);
    }

    function deepMerger(existing, value, key) {
        return existing && existing.mergeDeep && isIterable(value) ?
          existing.mergeDeep(value) :
          is(existing, value) ? existing : value;
    }

    function deepMergerWith(merger) {
        return function (existing, value, key) {
            if (existing && existing.mergeDeepWith && isIterable(value)) {
                return existing.mergeDeepWith(merger, value);
            }
            var nextValue = merger(existing, value, key);
            return is(existing, nextValue) ? existing : nextValue;
        };
    }

    function mergeIntoCollectionWith(collection, merger, iters) {
        iters = iters.filter(function (x) { return x.size !== 0 });
        if (iters.length === 0) {
            return collection;
        }
        if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
            return collection.constructor(iters[0]);
        }
        return collection.withMutations(function (collection) {
            var mergeIntoMap = merger ?
              function (value, key) {
                  collection.update(key, NOT_SET, function (existing)
                  { return existing === NOT_SET ? value : merger(existing, value, key) }
                  );
              } :
              function (value, key) {
                  collection.set(key, value);
              }
            for (var ii = 0; ii < iters.length; ii++) {
                iters[ii].forEach(mergeIntoMap);
            }
        });
    }

    function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
        var isNotSet = existing === NOT_SET;
        var step = keyPathIter.next();
        if (step.done) {
            var existingValue = isNotSet ? notSetValue : existing;
            var newValue = updater(existingValue);
            return newValue === existingValue ? existing : newValue;
        }
        invariant(
          isNotSet || (existing && existing.set),
          'invalid keyPath'
        );
        var key = step.value;
        var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
        var nextUpdated = updateInDeepMap(
          nextExisting,
          keyPathIter,
          notSetValue,
          updater
        );
        return nextUpdated === nextExisting ? existing :
          nextUpdated === NOT_SET ? existing.remove(key) :
          (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
    }

    function popCount(x) {
        x = x - ((x >> 1) & 0x55555555);
        x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
        x = (x + (x >> 4)) & 0x0f0f0f0f;
        x = x + (x >> 8);
        x = x + (x >> 16);
        return x & 0x7f;
    }

    function setIn(array, idx, val, canEdit) {
        var newArray = canEdit ? array : arrCopy(array);
        newArray[idx] = val;
        return newArray;
    }

    function spliceIn(array, idx, val, canEdit) {
        var newLen = array.length + 1;
        if (canEdit && idx + 1 === newLen) {
            array[idx] = val;
            return array;
        }
        var newArray = new Array(newLen);
        var after = 0;
        for (var ii = 0; ii < newLen; ii++) {
            if (ii === idx) {
                newArray[ii] = val;
                after = -1;
            } else {
                newArray[ii] = array[ii + after];
            }
        }
        return newArray;
    }

    function spliceOut(array, idx, canEdit) {
        var newLen = array.length - 1;
        if (canEdit && idx === newLen) {
            array.pop();
            return array;
        }
        var newArray = new Array(newLen);
        var after = 0;
        for (var ii = 0; ii < newLen; ii++) {
            if (ii === idx) {
                after = 1;
            }
            newArray[ii] = array[ii + after];
        }
        return newArray;
    }

    var MAX_ARRAY_MAP_SIZE = SIZE / 4;
    var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
    var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

    createClass(List, IndexedCollection);

    // @pragma Construction

    function List(value) {
        var empty = emptyList();
        if (value === null || value === undefined) {
            return empty;
        }
        if (isList(value)) {
            return value;
        }
        var iter = IndexedIterable(value);
        var size = iter.size;
        if (size === 0) {
            return empty;
        }
        assertNotInfinite(size);
        if (size > 0 && size < SIZE) {
            return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
        }
        return empty.withMutations(function (list) {
            list.setSize(size);
            iter.forEach(function (v, i) { return list.set(i, v) });
        });
    }

    List.of = function (/*...values*/) {
        return this(arguments);
    };

    List.prototype.toString = function () {
        return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        if (index >= 0 && index < this.size) {
            index += this._origin;
            var node = listNodeFor(this, index);
            return node && node.array[index & MASK];
        }
        return notSetValue;
    };

    // @pragma Modification

    List.prototype.set = function (index, value) {
        return updateList(this, index, value);
    };

    List.prototype.remove = function (index) {
        return !this.has(index) ? this :
          index === 0 ? this.shift() :
          index === this.size - 1 ? this.pop() :
          this.splice(index, 1);
    };

    List.prototype.insert = function (index, value) {
        return this.splice(index, 0, value);
    };

    List.prototype.clear = function () {
        if (this.size === 0) {
            return this;
        }
        if (this.__ownerID) {
            this.size = this._origin = this._capacity = 0;
            this._level = SHIFT;
            this._root = this._tail = null;
            this.__hash = undefined;
            this.__altered = true;
            return this;
        }
        return emptyList();
    };

    List.prototype.push = function (/*...values*/) {
        var values = arguments;
        var oldSize = this.size;
        return this.withMutations(function (list) {
            setListBounds(list, 0, oldSize + values.length);
            for (var ii = 0; ii < values.length; ii++) {
                list.set(oldSize + ii, values[ii]);
            }
        });
    };

    List.prototype.pop = function () {
        return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function (/*...values*/) {
        var values = arguments;
        return this.withMutations(function (list) {
            setListBounds(list, -values.length);
            for (var ii = 0; ii < values.length; ii++) {
                list.set(ii, values[ii]);
            }
        });
    };

    List.prototype.shift = function () {
        return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.merge = function (/*...iters*/) {
        return mergeIntoListWith(this, undefined, arguments);
    };

    List.prototype.mergeWith = function (merger) {
        var iters = SLICE$0.call(arguments, 1);
        return mergeIntoListWith(this, merger, iters);
    };

    List.prototype.mergeDeep = function (/*...iters*/) {
        return mergeIntoListWith(this, deepMerger, arguments);
    };

    List.prototype.mergeDeepWith = function (merger) {
        var iters = SLICE$0.call(arguments, 1);
        return mergeIntoListWith(this, deepMergerWith(merger), iters);
    };

    List.prototype.setSize = function (size) {
        return setListBounds(this, 0, size);
    };

    // @pragma Iteration

    List.prototype.slice = function (begin, end) {
        var size = this.size;
        if (wholeSlice(begin, end, size)) {
            return this;
        }
        return setListBounds(
          this,
          resolveBegin(begin, size),
          resolveEnd(end, size)
        );
    };

    List.prototype.__iterator = function (type, reverse) {
        var index = 0;
        var values = iterateList(this, reverse);
        return new Iterator(function () {
            var value = values();
            return value === DONE ?
              iteratorDone() :
              iteratorValue(type, index++, value);
        });
    };

    List.prototype.__iterate = function (fn, reverse) {
        var index = 0;
        var values = iterateList(this, reverse);
        var value;
        while ((value = values()) !== DONE) {
            if (fn(value, index++, this) === false) {
                break;
            }
        }
        return index;
    };

    List.prototype.__ensureOwner = function (ownerID) {
        if (ownerID === this.__ownerID) {
            return this;
        }
        if (!ownerID) {
            this.__ownerID = ownerID;
            return this;
        }
        return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };


    function isList(maybeList) {
        return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
    }

    List.isList = isList;

    var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

    var ListPrototype = List.prototype;
    ListPrototype[IS_LIST_SENTINEL] = true;
    ListPrototype[DELETE] = ListPrototype.remove;
    ListPrototype.setIn = MapPrototype.setIn;
    ListPrototype.deleteIn =
    ListPrototype.removeIn = MapPrototype.removeIn;
    ListPrototype.update = MapPrototype.update;
    ListPrototype.updateIn = MapPrototype.updateIn;
    ListPrototype.mergeIn = MapPrototype.mergeIn;
    ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
    ListPrototype.withMutations = MapPrototype.withMutations;
    ListPrototype.asMutable = MapPrototype.asMutable;
    ListPrototype.asImmutable = MapPrototype.asImmutable;
    ListPrototype.wasAltered = MapPrototype.wasAltered;



    function VNode(array, ownerID) {
        this.array = array;
        this.ownerID = ownerID;
    }

    // TODO: seems like these methods are very similar

    VNode.prototype.removeBefore = function (ownerID, level, index) {
        if (index === level ? 1 << level : 0 || this.array.length === 0) {
            return this;
        }
        var originIndex = (index >>> level) & MASK;
        if (originIndex >= this.array.length) {
            return new VNode([], ownerID);
        }
        var removingFirst = originIndex === 0;
        var newChild;
        if (level > 0) {
            var oldChild = this.array[originIndex];
            newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
            if (newChild === oldChild && removingFirst) {
                return this;
            }
        }
        if (removingFirst && !newChild) {
            return this;
        }
        var editable = editableVNode(this, ownerID);
        if (!removingFirst) {
            for (var ii = 0; ii < originIndex; ii++) {
                editable.array[ii] = undefined;
            }
        }
        if (newChild) {
            editable.array[originIndex] = newChild;
        }
        return editable;
    };

    VNode.prototype.removeAfter = function (ownerID, level, index) {
        if (index === (level ? 1 << level : 0) || this.array.length === 0) {
            return this;
        }
        var sizeIndex = ((index - 1) >>> level) & MASK;
        if (sizeIndex >= this.array.length) {
            return this;
        }

        var newChild;
        if (level > 0) {
            var oldChild = this.array[sizeIndex];
            newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
            if (newChild === oldChild && sizeIndex === this.array.length - 1) {
                return this;
            }
        }

        var editable = editableVNode(this, ownerID);
        editable.array.splice(sizeIndex + 1);
        if (newChild) {
            editable.array[sizeIndex] = newChild;
        }
        return editable;
    };



    var DONE = {};

    function iterateList(list, reverse) {
        var left = list._origin;
        var right = list._capacity;
        var tailPos = getTailOffset(right);
        var tail = list._tail;

        return iterateNodeOrLeaf(list._root, list._level, 0);

        function iterateNodeOrLeaf(node, level, offset) {
            return level === 0 ?
              iterateLeaf(node, offset) :
              iterateNode(node, level, offset);
        }

        function iterateLeaf(node, offset) {
            var array = offset === tailPos ? tail && tail.array : node && node.array;
            var from = offset > left ? 0 : left - offset;
            var to = right - offset;
            if (to > SIZE) {
                to = SIZE;
            }
            return function () {
                if (from === to) {
                    return DONE;
                }
                var idx = reverse ? --to : from++;
                return array && array[idx];
            };
        }

        function iterateNode(node, level, offset) {
            var values;
            var array = node && node.array;
            var from = offset > left ? 0 : (left - offset) >> level;
            var to = ((right - offset) >> level) + 1;
            if (to > SIZE) {
                to = SIZE;
            }
            return function () {
                do {
                    if (values) {
                        var value = values();
                        if (value !== DONE) {
                            return value;
                        }
                        values = null;
                    }
                    if (from === to) {
                        return DONE;
                    }
                    var idx = reverse ? --to : from++;
                    values = iterateNodeOrLeaf(
                      array && array[idx], level - SHIFT, offset + (idx << level)
                    );
                } while (true);
            };
        }
    }

    function makeList(origin, capacity, level, root, tail, ownerID, hash) {
        var list = Object.create(ListPrototype);
        list.size = capacity - origin;
        list._origin = origin;
        list._capacity = capacity;
        list._level = level;
        list._root = root;
        list._tail = tail;
        list.__ownerID = ownerID;
        list.__hash = hash;
        list.__altered = false;
        return list;
    }

    var EMPTY_LIST;
    function emptyList() {
        return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
    }

    function updateList(list, index, value) {
        index = wrapIndex(list, index);

        if (index !== index) {
            return list;
        }

        if (index >= list.size || index < 0) {
            return list.withMutations(function (list) {
                index < 0 ?
                  setListBounds(list, index).set(0, value) :
                  setListBounds(list, 0, index + 1).set(index, value)
            });
        }

        index += list._origin;

        var newTail = list._tail;
        var newRoot = list._root;
        var didAlter = MakeRef(DID_ALTER);
        if (index >= getTailOffset(list._capacity)) {
            newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
        } else {
            newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
        }

        if (!didAlter.value) {
            return list;
        }

        if (list.__ownerID) {
            list._root = newRoot;
            list._tail = newTail;
            list.__hash = undefined;
            list.__altered = true;
            return list;
        }
        return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
    }

    function updateVNode(node, ownerID, level, index, value, didAlter) {
        var idx = (index >>> level) & MASK;
        var nodeHas = node && idx < node.array.length;
        if (!nodeHas && value === undefined) {
            return node;
        }

        var newNode;

        if (level > 0) {
            var lowerNode = node && node.array[idx];
            var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
            if (newLowerNode === lowerNode) {
                return node;
            }
            newNode = editableVNode(node, ownerID);
            newNode.array[idx] = newLowerNode;
            return newNode;
        }

        if (nodeHas && node.array[idx] === value) {
            return node;
        }

        SetRef(didAlter);

        newNode = editableVNode(node, ownerID);
        if (value === undefined && idx === newNode.array.length - 1) {
            newNode.array.pop();
        } else {
            newNode.array[idx] = value;
        }
        return newNode;
    }

    function editableVNode(node, ownerID) {
        if (ownerID && node && ownerID === node.ownerID) {
            return node;
        }
        return new VNode(node ? node.array.slice() : [], ownerID);
    }

    function listNodeFor(list, rawIndex) {
        if (rawIndex >= getTailOffset(list._capacity)) {
            return list._tail;
        }
        if (rawIndex < 1 << (list._level + SHIFT)) {
            var node = list._root;
            var level = list._level;
            while (node && level > 0) {
                node = node.array[(rawIndex >>> level) & MASK];
                level -= SHIFT;
            }
            return node;
        }
    }

    function setListBounds(list, begin, end) {
        // Sanitize begin & end using this shorthand for ToInt32(argument)
        // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
        if (begin !== undefined) {
            begin = begin | 0;
        }
        if (end !== undefined) {
            end = end | 0;
        }
        var owner = list.__ownerID || new OwnerID();
        var oldOrigin = list._origin;
        var oldCapacity = list._capacity;
        var newOrigin = oldOrigin + begin;
        var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
        if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
            return list;
        }

        // If it's going to end after it starts, it's empty.
        if (newOrigin >= newCapacity) {
            return list.clear();
        }

        var newLevel = list._level;
        var newRoot = list._root;

        // New origin might need creating a higher root.
        var offsetShift = 0;
        while (newOrigin + offsetShift < 0) {
            newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
            newLevel += SHIFT;
            offsetShift += 1 << newLevel;
        }
        if (offsetShift) {
            newOrigin += offsetShift;
            oldOrigin += offsetShift;
            newCapacity += offsetShift;
            oldCapacity += offsetShift;
        }

        var oldTailOffset = getTailOffset(oldCapacity);
        var newTailOffset = getTailOffset(newCapacity);

        // New size might need creating a higher root.
        while (newTailOffset >= 1 << (newLevel + SHIFT)) {
            newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
            newLevel += SHIFT;
        }

        // Locate or create the new tail.
        var oldTail = list._tail;
        var newTail = newTailOffset < oldTailOffset ?
          listNodeFor(list, newCapacity - 1) :
          newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

        // Merge Tail into tree.
        if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
            newRoot = editableVNode(newRoot, owner);
            var node = newRoot;
            for (var level = newLevel; level > SHIFT; level -= SHIFT) {
                var idx = (oldTailOffset >>> level) & MASK;
                node = node.array[idx] = editableVNode(node.array[idx], owner);
            }
            node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
        }

        // If the size has been reduced, there's a chance the tail needs to be trimmed.
        if (newCapacity < oldCapacity) {
            newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
        }

        // If the new origin is within the tail, then we do not need a root.
        if (newOrigin >= newTailOffset) {
            newOrigin -= newTailOffset;
            newCapacity -= newTailOffset;
            newLevel = SHIFT;
            newRoot = null;
            newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

            // Otherwise, if the root has been trimmed, garbage collect.
        } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
            offsetShift = 0;

            // Identify the new top root node of the subtree of the old root.
            while (newRoot) {
                var beginIndex = (newOrigin >>> newLevel) & MASK;
                if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
                    break;
                }
                if (beginIndex) {
                    offsetShift += (1 << newLevel) * beginIndex;
                }
                newLevel -= SHIFT;
                newRoot = newRoot.array[beginIndex];
            }

            // Trim the new sides of the new root.
            if (newRoot && newOrigin > oldOrigin) {
                newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
            }
            if (newRoot && newTailOffset < oldTailOffset) {
                newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
            }
            if (offsetShift) {
                newOrigin -= offsetShift;
                newCapacity -= offsetShift;
            }
        }

        if (list.__ownerID) {
            list.size = newCapacity - newOrigin;
            list._origin = newOrigin;
            list._capacity = newCapacity;
            list._level = newLevel;
            list._root = newRoot;
            list._tail = newTail;
            list.__hash = undefined;
            list.__altered = true;
            return list;
        }
        return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
    }

    function mergeIntoListWith(list, merger, iterables) {
        var iters = [];
        var maxSize = 0;
        for (var ii = 0; ii < iterables.length; ii++) {
            var value = iterables[ii];
            var iter = IndexedIterable(value);
            if (iter.size > maxSize) {
                maxSize = iter.size;
            }
            if (!isIterable(value)) {
                iter = iter.map(function (v) { return fromJS(v) });
            }
            iters.push(iter);
        }
        if (maxSize > list.size) {
            list = list.setSize(maxSize);
        }
        return mergeIntoCollectionWith(list, merger, iters);
    }

    function getTailOffset(size) {
        return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
    }

    createClass(OrderedMap, Map);

    // @pragma Construction

    function OrderedMap(value) {
        return value === null || value === undefined ? emptyOrderedMap() :
          isOrderedMap(value) ? value :
          emptyOrderedMap().withMutations(function (map) {
              var iter = KeyedIterable(value);
              assertNotInfinite(iter.size);
              iter.forEach(function (v, k) { return map.set(k, v) });
          });
    }

    OrderedMap.of = function (/*...values*/) {
        return this(arguments);
    };

    OrderedMap.prototype.toString = function () {
        return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function (k, notSetValue) {
        var index = this._map.get(k);
        return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function () {
        if (this.size === 0) {
            return this;
        }
        if (this.__ownerID) {
            this.size = 0;
            this._map.clear();
            this._list.clear();
            return this;
        }
        return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function (k, v) {
        return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function (k) {
        return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function () {
        return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        return this._list.__iterate(
          function (entry) { return entry && fn(entry[1], entry[0], this$0) },
          reverse
        );
    };

    OrderedMap.prototype.__iterator = function (type, reverse) {
        return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function (ownerID) {
        if (ownerID === this.__ownerID) {
            return this;
        }
        var newMap = this._map.__ensureOwner(ownerID);
        var newList = this._list.__ensureOwner(ownerID);
        if (!ownerID) {
            this.__ownerID = ownerID;
            this._map = newMap;
            this._list = newList;
            return this;
        }
        return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };


    function isOrderedMap(maybeOrderedMap) {
        return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
    }

    OrderedMap.isOrderedMap = isOrderedMap;

    OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
    OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



    function makeOrderedMap(map, list, ownerID, hash) {
        var omap = Object.create(OrderedMap.prototype);
        omap.size = map ? map.size : 0;
        omap._map = map;
        omap._list = list;
        omap.__ownerID = ownerID;
        omap.__hash = hash;
        return omap;
    }

    var EMPTY_ORDERED_MAP;
    function emptyOrderedMap() {
        return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
    }

    function updateOrderedMap(omap, k, v) {
        var map = omap._map;
        var list = omap._list;
        var i = map.get(k);
        var has = i !== undefined;
        var newMap;
        var newList;
        if (v === NOT_SET) { // removed
            if (!has) {
                return omap;
            }
            if (list.size >= SIZE && list.size >= map.size * 2) {
                newList = list.filter(function (entry, idx) { return entry !== undefined && i !== idx });
                newMap = newList.toKeyedSeq().map(function (entry) { return entry[0] }).flip().toMap();
                if (omap.__ownerID) {
                    newMap.__ownerID = newList.__ownerID = omap.__ownerID;
                }
            } else {
                newMap = map.remove(k);
                newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
            }
        } else {
            if (has) {
                if (v === list.get(i)[1]) {
                    return omap;
                }
                newMap = map;
                newList = list.set(i, [k, v]);
            } else {
                newMap = map.set(k, list.size);
                newList = list.set(list.size, [k, v]);
            }
        }
        if (omap.__ownerID) {
            omap.size = newMap.size;
            omap._map = newMap;
            omap._list = newList;
            omap.__hash = undefined;
            return omap;
        }
        return makeOrderedMap(newMap, newList);
    }

    createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
        this._iter = indexed;
        this._useKeys = useKeys;
        this.size = indexed.size;
    }

    ToKeyedSequence.prototype.get = function (key, notSetValue) {
        return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function (key) {
        return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function () {
        return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function () {
        var this$0 = this;
        var reversedSequence = reverseFactory(this, true);
        if (!this._useKeys) {
            reversedSequence.valueSeq = function () { return this$0._iter.toSeq().reverse() };
        }
        return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function (mapper, context) {
        var this$0 = this;
        var mappedSequence = mapFactory(this, mapper, context);
        if (!this._useKeys) {
            mappedSequence.valueSeq = function () { return this$0._iter.toSeq().map(mapper, context) };
        }
        return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        var ii;
        return this._iter.__iterate(
          this._useKeys ?
            function (v, k) { return fn(v, k, this$0) } :
            ((ii = reverse ? resolveSize(this) : 0),
              function (v) { return fn(v, reverse ? --ii : ii++, this$0) }),
          reverse
        );
    };

    ToKeyedSequence.prototype.__iterator = function (type, reverse) {
        if (this._useKeys) {
            return this._iter.__iterator(type, reverse);
        }
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
        var ii = reverse ? resolveSize(this) : 0;
        return new Iterator(function () {
            var step = iterator.next();
            return step.done ? step :
              iteratorValue(type, reverse ? --ii : ii++, step.value, step);
        });
    };

    ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


    createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
        this._iter = iter;
        this.size = iter.size;
    }

    ToIndexedSequence.prototype.includes = function (value) {
        return this._iter.includes(value);
    };

    ToIndexedSequence.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        var iterations = 0;
        return this._iter.__iterate(function (v) { return fn(v, iterations++, this$0) }, reverse);
    };

    ToIndexedSequence.prototype.__iterator = function (type, reverse) {
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
        var iterations = 0;
        return new Iterator(function () {
            var step = iterator.next();
            return step.done ? step :
              iteratorValue(type, iterations++, step.value, step)
        });
    };



    createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
        this._iter = iter;
        this.size = iter.size;
    }

    ToSetSequence.prototype.has = function (key) {
        return this._iter.includes(key);
    };

    ToSetSequence.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        return this._iter.__iterate(function (v) { return fn(v, v, this$0) }, reverse);
    };

    ToSetSequence.prototype.__iterator = function (type, reverse) {
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
        return new Iterator(function () {
            var step = iterator.next();
            return step.done ? step :
              iteratorValue(type, step.value, step.value, step);
        });
    };



    createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
        this._iter = entries;
        this.size = entries.size;
    }

    FromEntriesSequence.prototype.entrySeq = function () {
        return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        return this._iter.__iterate(function (entry) {
            // Check if entry exists first so array access doesn't throw for holes
            // in the parent iteration.
            if (entry) {
                validateEntry(entry);
                var indexedIterable = isIterable(entry);
                return fn(
                  indexedIterable ? entry.get(1) : entry[1],
                  indexedIterable ? entry.get(0) : entry[0],
                  this$0
                );
            }
        }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function (type, reverse) {
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
        return new Iterator(function () {
            while (true) {
                var step = iterator.next();
                if (step.done) {
                    return step;
                }
                var entry = step.value;
                // Check if entry exists first so array access doesn't throw for holes
                // in the parent iteration.
                if (entry) {
                    validateEntry(entry);
                    var indexedIterable = isIterable(entry);
                    return iteratorValue(
                      type,
                      indexedIterable ? entry.get(0) : entry[0],
                      indexedIterable ? entry.get(1) : entry[1],
                      step
                    );
                }
            }
        });
    };


    ToIndexedSequence.prototype.cacheResult =
    ToKeyedSequence.prototype.cacheResult =
    ToSetSequence.prototype.cacheResult =
    FromEntriesSequence.prototype.cacheResult =
      cacheResultThrough;


    function flipFactory(iterable) {
        var flipSequence = makeSequence(iterable);
        flipSequence._iter = iterable;
        flipSequence.size = iterable.size;
        flipSequence.flip = function () { return iterable };
        flipSequence.reverse = function () {
            var reversedSequence = iterable.reverse.apply(this); // super.reverse()
            reversedSequence.flip = function () { return iterable.reverse() };
            return reversedSequence;
        };
        flipSequence.has = function (key) { return iterable.includes(key) };
        flipSequence.includes = function (key) { return iterable.has(key) };
        flipSequence.cacheResult = cacheResultThrough;
        flipSequence.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            return iterable.__iterate(function (v, k) { return fn(k, v, this$0) !== false }, reverse);
        }
        flipSequence.__iteratorUncached = function (type, reverse) {
            if (type === ITERATE_ENTRIES) {
                var iterator = iterable.__iterator(type, reverse);
                return new Iterator(function () {
                    var step = iterator.next();
                    if (!step.done) {
                        var k = step.value[0];
                        step.value[0] = step.value[1];
                        step.value[1] = k;
                    }
                    return step;
                });
            }
            return iterable.__iterator(
              type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
              reverse
            );
        }
        return flipSequence;
    }


    function mapFactory(iterable, mapper, context) {
        var mappedSequence = makeSequence(iterable);
        mappedSequence.size = iterable.size;
        mappedSequence.has = function (key) { return iterable.has(key) };
        mappedSequence.get = function (key, notSetValue) {
            var v = iterable.get(key, NOT_SET);
            return v === NOT_SET ?
                notSetValue :
              mapper.call(context, v, key, iterable);
        };
        mappedSequence.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            return iterable.__iterate(
              function (v, k, c) { return fn(mapper.call(context, v, k, c), k, this$0) !== false },
              reverse
            );
        }
        mappedSequence.__iteratorUncached = function (type, reverse) {
            var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
            return new Iterator(function () {
                var step = iterator.next();
                if (step.done) {
                    return step;
                }
                var entry = step.value;
                var key = entry[0];
                return iteratorValue(
                  type,
                  key,
                  mapper.call(context, entry[1], key, iterable),
                  step
                );
            });
        }
        return mappedSequence;
    }


    function reverseFactory(iterable, useKeys) {
        var reversedSequence = makeSequence(iterable);
        reversedSequence._iter = iterable;
        reversedSequence.size = iterable.size;
        reversedSequence.reverse = function () { return iterable };
        if (iterable.flip) {
            reversedSequence.flip = function () {
                var flipSequence = flipFactory(iterable);
                flipSequence.reverse = function () { return iterable.flip() };
                return flipSequence;
            };
        }
        reversedSequence.get = function (key, notSetValue)
        { return iterable.get(useKeys ? key : -1 - key, notSetValue) };
        reversedSequence.has = function (key)
        { return iterable.has(useKeys ? key : -1 - key) };
        reversedSequence.includes = function (value) { return iterable.includes(value) };
        reversedSequence.cacheResult = cacheResultThrough;
        reversedSequence.__iterate = function (fn, reverse) {
            var this$0 = this;
            return iterable.__iterate(function (v, k) { return fn(v, k, this$0) }, !reverse);
        };
        reversedSequence.__iterator =
          function (type, reverse) { return iterable.__iterator(type, !reverse) };
        return reversedSequence;
    }


    function filterFactory(iterable, predicate, context, useKeys) {
        var filterSequence = makeSequence(iterable);
        if (useKeys) {
            filterSequence.has = function (key) {
                var v = iterable.get(key, NOT_SET);
                return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
            };
            filterSequence.get = function (key, notSetValue) {
                var v = iterable.get(key, NOT_SET);
                return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
                    v : notSetValue;
            };
        }
        filterSequence.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            var iterations = 0;
            iterable.__iterate(function (v, k, c) {
                if (predicate.call(context, v, k, c)) {
                    iterations++;
                    return fn(v, useKeys ? k : iterations - 1, this$0);
                }
            }, reverse);
            return iterations;
        };
        filterSequence.__iteratorUncached = function (type, reverse) {
            var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
            var iterations = 0;
            return new Iterator(function () {
                while (true) {
                    var step = iterator.next();
                    if (step.done) {
                        return step;
                    }
                    var entry = step.value;
                    var key = entry[0];
                    var value = entry[1];
                    if (predicate.call(context, value, key, iterable)) {
                        return iteratorValue(type, useKeys ? key : iterations++, value, step);
                    }
                }
            });
        }
        return filterSequence;
    }


    function countByFactory(iterable, grouper, context) {
        var groups = Map().asMutable();
        iterable.__iterate(function (v, k) {
            groups.update(
              grouper.call(context, v, k, iterable),
              0,
              function (a) { return a + 1 }
            );
        });
        return groups.asImmutable();
    }


    function groupByFactory(iterable, grouper, context) {
        var isKeyedIter = isKeyed(iterable);
        var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
        iterable.__iterate(function (v, k) {
            groups.update(
              grouper.call(context, v, k, iterable),
              function (a) { return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a) }
            );
        });
        var coerce = iterableClass(iterable);
        return groups.map(function (arr) { return reify(iterable, coerce(arr)) });
    }


    function sliceFactory(iterable, begin, end, useKeys) {
        var originalSize = iterable.size;

        // Sanitize begin & end using this shorthand for ToInt32(argument)
        // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
        if (begin !== undefined) {
            begin = begin | 0;
        }
        if (end !== undefined) {
            end = end | 0;
        }

        if (wholeSlice(begin, end, originalSize)) {
            return iterable;
        }

        var resolvedBegin = resolveBegin(begin, originalSize);
        var resolvedEnd = resolveEnd(end, originalSize);

        // begin or end will be NaN if they were provided as negative numbers and
        // this iterable's size is unknown. In that case, cache first so there is
        // a known size and these do not resolve to NaN.
        if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
            return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
        }

        // Note: resolvedEnd is undefined when the original sequence's length is
        // unknown and this slice did not supply an end and should contain all
        // elements after resolvedBegin.
        // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
        var resolvedSize = resolvedEnd - resolvedBegin;
        var sliceSize;
        if (resolvedSize === resolvedSize) {
            sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
        }

        var sliceSeq = makeSequence(iterable);

        // If iterable.size is undefined, the size of the realized sliceSeq is
        // unknown at this point unless the number of items to slice is 0
        sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

        if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
            sliceSeq.get = function (index, notSetValue) {
                index = wrapIndex(this, index);
                return index >= 0 && index < sliceSize ?
                  iterable.get(index + resolvedBegin, notSetValue) :
                  notSetValue;
            }
        }

        sliceSeq.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            if (sliceSize === 0) {
                return 0;
            }
            if (reverse) {
                return this.cacheResult().__iterate(fn, reverse);
            }
            var skipped = 0;
            var isSkipping = true;
            var iterations = 0;
            iterable.__iterate(function (v, k) {
                if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
                    iterations++;
                    return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
                           iterations !== sliceSize;
                }
            });
            return iterations;
        };

        sliceSeq.__iteratorUncached = function (type, reverse) {
            if (sliceSize !== 0 && reverse) {
                return this.cacheResult().__iterator(type, reverse);
            }
            // Don't bother instantiating parent iterator if taking 0.
            var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
            var skipped = 0;
            var iterations = 0;
            return new Iterator(function () {
                while (skipped++ < resolvedBegin) {
                    iterator.next();
                }
                if (++iterations > sliceSize) {
                    return iteratorDone();
                }
                var step = iterator.next();
                if (useKeys || type === ITERATE_VALUES) {
                    return step;
                } else if (type === ITERATE_KEYS) {
                    return iteratorValue(type, iterations - 1, undefined, step);
                } else {
                    return iteratorValue(type, iterations - 1, step.value[1], step);
                }
            });
        }

        return sliceSeq;
    }


    function takeWhileFactory(iterable, predicate, context) {
        var takeSequence = makeSequence(iterable);
        takeSequence.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            if (reverse) {
                return this.cacheResult().__iterate(fn, reverse);
            }
            var iterations = 0;
            iterable.__iterate(function (v, k, c)
            { return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0) }
            );
            return iterations;
        };
        takeSequence.__iteratorUncached = function (type, reverse) {
            var this$0 = this;
            if (reverse) {
                return this.cacheResult().__iterator(type, reverse);
            }
            var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
            var iterating = true;
            return new Iterator(function () {
                if (!iterating) {
                    return iteratorDone();
                }
                var step = iterator.next();
                if (step.done) {
                    return step;
                }
                var entry = step.value;
                var k = entry[0];
                var v = entry[1];
                if (!predicate.call(context, v, k, this$0)) {
                    iterating = false;
                    return iteratorDone();
                }
                return type === ITERATE_ENTRIES ? step :
                  iteratorValue(type, k, v, step);
            });
        };
        return takeSequence;
    }


    function skipWhileFactory(iterable, predicate, context, useKeys) {
        var skipSequence = makeSequence(iterable);
        skipSequence.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            if (reverse) {
                return this.cacheResult().__iterate(fn, reverse);
            }
            var isSkipping = true;
            var iterations = 0;
            iterable.__iterate(function (v, k, c) {
                if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
                    iterations++;
                    return fn(v, useKeys ? k : iterations - 1, this$0);
                }
            });
            return iterations;
        };
        skipSequence.__iteratorUncached = function (type, reverse) {
            var this$0 = this;
            if (reverse) {
                return this.cacheResult().__iterator(type, reverse);
            }
            var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
            var skipping = true;
            var iterations = 0;
            return new Iterator(function () {
                var step, k, v;
                do {
                    step = iterator.next();
                    if (step.done) {
                        if (useKeys || type === ITERATE_VALUES) {
                            return step;
                        } else if (type === ITERATE_KEYS) {
                            return iteratorValue(type, iterations++, undefined, step);
                        } else {
                            return iteratorValue(type, iterations++, step.value[1], step);
                        }
                    }
                    var entry = step.value;
                    k = entry[0];
                    v = entry[1];
                    skipping && (skipping = predicate.call(context, v, k, this$0));
                } while (skipping);
                return type === ITERATE_ENTRIES ? step :
                  iteratorValue(type, k, v, step);
            });
        };
        return skipSequence;
    }


    function concatFactory(iterable, values) {
        var isKeyedIterable = isKeyed(iterable);
        var iters = [iterable].concat(values).map(function (v) {
            if (!isIterable(v)) {
                v = isKeyedIterable ?
                  keyedSeqFromValue(v) :
                  indexedSeqFromValue(Array.isArray(v) ? v : [v]);
            } else if (isKeyedIterable) {
                v = KeyedIterable(v);
            }
            return v;
        }).filter(function (v) { return v.size !== 0 });

        if (iters.length === 0) {
            return iterable;
        }

        if (iters.length === 1) {
            var singleton = iters[0];
            if (singleton === iterable ||
                isKeyedIterable && isKeyed(singleton) ||
                isIndexed(iterable) && isIndexed(singleton)) {
                return singleton;
            }
        }

        var concatSeq = new ArraySeq(iters);
        if (isKeyedIterable) {
            concatSeq = concatSeq.toKeyedSeq();
        } else if (!isIndexed(iterable)) {
            concatSeq = concatSeq.toSetSeq();
        }
        concatSeq = concatSeq.flatten(true);
        concatSeq.size = iters.reduce(
          function (sum, seq) {
              if (sum !== undefined) {
                  var size = seq.size;
                  if (size !== undefined) {
                      return sum + size;
                  }
              }
          },
          0
        );
        return concatSeq;
    }


    function flattenFactory(iterable, depth, useKeys) {
        var flatSequence = makeSequence(iterable);
        flatSequence.__iterateUncached = function (fn, reverse) {
            var iterations = 0;
            var stopped = false;
            function flatDeep(iter, currentDepth) {
                var this$0 = this;
                iter.__iterate(function (v, k) {
                    if ((!depth || currentDepth < depth) && isIterable(v)) {
                        flatDeep(v, currentDepth + 1);
                    } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
                        stopped = true;
                    }
                    return !stopped;
                }, reverse);
            }
            flatDeep(iterable, 0);
            return iterations;
        }
        flatSequence.__iteratorUncached = function (type, reverse) {
            var iterator = iterable.__iterator(type, reverse);
            var stack = [];
            var iterations = 0;
            return new Iterator(function () {
                while (iterator) {
                    var step = iterator.next();
                    if (step.done !== false) {
                        iterator = stack.pop();
                        continue;
                    }
                    var v = step.value;
                    if (type === ITERATE_ENTRIES) {
                        v = v[1];
                    }
                    if ((!depth || stack.length < depth) && isIterable(v)) {
                        stack.push(iterator);
                        iterator = v.__iterator(type, reverse);
                    } else {
                        return useKeys ? step : iteratorValue(type, iterations++, v, step);
                    }
                }
                return iteratorDone();
            });
        }
        return flatSequence;
    }


    function flatMapFactory(iterable, mapper, context) {
        var coerce = iterableClass(iterable);
        return iterable.toSeq().map(
          function (v, k) { return coerce(mapper.call(context, v, k, iterable)) }
        ).flatten(true);
    }


    function interposeFactory(iterable, separator) {
        var interposedSequence = makeSequence(iterable);
        interposedSequence.size = iterable.size && iterable.size * 2 - 1;
        interposedSequence.__iterateUncached = function (fn, reverse) {
            var this$0 = this;
            var iterations = 0;
            iterable.__iterate(function (v, k) {
                return (!iterations || fn(separator, iterations++, this$0) !== false) &&
                fn(v, iterations++, this$0) !== false
            },
              reverse
            );
            return iterations;
        };
        interposedSequence.__iteratorUncached = function (type, reverse) {
            var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
            var iterations = 0;
            var step;
            return new Iterator(function () {
                if (!step || iterations % 2) {
                    step = iterator.next();
                    if (step.done) {
                        return step;
                    }
                }
                return iterations % 2 ?
                  iteratorValue(type, iterations++, separator) :
                  iteratorValue(type, iterations++, step.value, step);
            });
        };
        return interposedSequence;
    }


    function sortFactory(iterable, comparator, mapper) {
        if (!comparator) {
            comparator = defaultComparator;
        }
        var isKeyedIterable = isKeyed(iterable);
        var index = 0;
        var entries = iterable.toSeq().map(
          function (v, k) { return [k, v, index++, mapper ? mapper(v, k, iterable) : v] }
        ).toArray();
        entries.sort(function (a, b) { return comparator(a[3], b[3]) || a[2] - b[2] }).forEach(
          isKeyedIterable ?
          function (v, i) { entries[i].length = 2; } :
          function (v, i) { entries[i] = v[1]; }
        );
        return isKeyedIterable ? KeyedSeq(entries) :
          isIndexed(iterable) ? IndexedSeq(entries) :
          SetSeq(entries);
    }


    function maxFactory(iterable, comparator, mapper) {
        if (!comparator) {
            comparator = defaultComparator;
        }
        if (mapper) {
            var entry = iterable.toSeq()
              .map(function (v, k) { return [v, mapper(v, k, iterable)] })
              .reduce(function (a, b) { return maxCompare(comparator, a[1], b[1]) ? b : a });
            return entry && entry[0];
        } else {
            return iterable.reduce(function (a, b) { return maxCompare(comparator, a, b) ? b : a });
        }
    }

    function maxCompare(comparator, a, b) {
        var comp = comparator(b, a);
        // b is considered the new max if the comparator declares them equal, but
        // they are not equal and b is in fact a nullish value.
        return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
    }


    function zipWithFactory(keyIter, zipper, iters) {
        var zipSequence = makeSequence(keyIter);
        zipSequence.size = new ArraySeq(iters).map(function (i) { return i.size }).min();
        // Note: this a generic base implementation of __iterate in terms of
        // __iterator which may be more generically useful in the future.
        zipSequence.__iterate = function (fn, reverse) {
            /* generic:
            var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
            var step;
            var iterations = 0;
            while (!(step = iterator.next()).done) {
              iterations++;
              if (fn(step.value[1], step.value[0], this) === false) {
                break;
              }
            }
            return iterations;
            */
            // indexed:
            var iterator = this.__iterator(ITERATE_VALUES, reverse);
            var step;
            var iterations = 0;
            while (!(step = iterator.next()).done) {
                if (fn(step.value, iterations++, this) === false) {
                    break;
                }
            }
            return iterations;
        };
        zipSequence.__iteratorUncached = function (type, reverse) {
            var iterators = iters.map(function (i)
            { return (i = Iterable(i), getIterator(reverse ? i.reverse() : i)) }
            );
            var iterations = 0;
            var isDone = false;
            return new Iterator(function () {
                var steps;
                if (!isDone) {
                    steps = iterators.map(function (i) { return i.next() });
                    isDone = steps.some(function (s) { return s.done });
                }
                if (isDone) {
                    return iteratorDone();
                }
                return iteratorValue(
                  type,
                  iterations++,
                  zipper.apply(null, steps.map(function (s) { return s.value }))
                );
            });
        };
        return zipSequence
    }


    // #pragma Helper Functions

    function reify(iter, seq) {
        return isSeq(iter) ? seq : iter.constructor(seq);
    }

    function validateEntry(entry) {
        if (entry !== Object(entry)) {
            throw new TypeError('Expected [K, V] tuple: ' + entry);
        }
    }

    function resolveSize(iter) {
        assertNotInfinite(iter.size);
        return ensureSize(iter);
    }

    function iterableClass(iterable) {
        return isKeyed(iterable) ? KeyedIterable :
          isIndexed(iterable) ? IndexedIterable :
          SetIterable;
    }

    function makeSequence(iterable) {
        return Object.create(
          (
            isKeyed(iterable) ? KeyedSeq :
            isIndexed(iterable) ? IndexedSeq :
            SetSeq
          ).prototype
        );
    }

    function cacheResultThrough() {
        if (this._iter.cacheResult) {
            this._iter.cacheResult();
            this.size = this._iter.size;
            return this;
        } else {
            return Seq.prototype.cacheResult.call(this);
        }
    }

    function defaultComparator(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    }

    function forceIterator(keyPath) {
        var iter = getIterator(keyPath);
        if (!iter) {
            // Array might not be iterable in this environment, so we need a fallback
            // to our wrapped type.
            if (!isArrayLike(keyPath)) {
                throw new TypeError('Expected iterable or array-like: ' + keyPath);
            }
            iter = getIterator(Iterable(keyPath));
        }
        return iter;
    }

    createClass(Record, KeyedCollection);

    function Record(defaultValues, name) {
        var hasInitialized;

        var RecordType = function Record(values) {
            if (values instanceof RecordType) {
                return values;
            }
            if (!(this instanceof RecordType)) {
                return new RecordType(values);
            }
            if (!hasInitialized) {
                hasInitialized = true;
                var keys = Object.keys(defaultValues);
                setProps(RecordTypePrototype, keys);
                RecordTypePrototype.size = keys.length;
                RecordTypePrototype._name = name;
                RecordTypePrototype._keys = keys;
                RecordTypePrototype._defaultValues = defaultValues;
            }
            this._map = Map(values);
        };

        var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
        RecordTypePrototype.constructor = RecordType;

        return RecordType;
    }

    Record.prototype.toString = function () {
        return this.__toString(recordName(this) + ' {', '}');
    };

    // @pragma Access

    Record.prototype.has = function (k) {
        return this._defaultValues.hasOwnProperty(k);
    };

    Record.prototype.get = function (k, notSetValue) {
        if (!this.has(k)) {
            return notSetValue;
        }
        var defaultVal = this._defaultValues[k];
        return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };

    // @pragma Modification

    Record.prototype.clear = function () {
        if (this.__ownerID) {
            this._map && this._map.clear();
            return this;
        }
        var RecordType = this.constructor;
        return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
    };

    Record.prototype.set = function (k, v) {
        if (!this.has(k)) {
            throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
        }
        if (this._map && !this._map.has(k)) {
            var defaultVal = this._defaultValues[k];
            if (v === defaultVal) {
                return this;
            }
        }
        var newMap = this._map && this._map.set(k, v);
        if (this.__ownerID || newMap === this._map) {
            return this;
        }
        return makeRecord(this, newMap);
    };

    Record.prototype.remove = function (k) {
        if (!this.has(k)) {
            return this;
        }
        var newMap = this._map && this._map.remove(k);
        if (this.__ownerID || newMap === this._map) {
            return this;
        }
        return makeRecord(this, newMap);
    };

    Record.prototype.wasAltered = function () {
        return this._map.wasAltered();
    };

    Record.prototype.__iterator = function (type, reverse) {
        var this$0 = this;
        return KeyedIterable(this._defaultValues).map(function (_, k) { return this$0.get(k) }).__iterator(type, reverse);
    };

    Record.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        return KeyedIterable(this._defaultValues).map(function (_, k) { return this$0.get(k) }).__iterate(fn, reverse);
    };

    Record.prototype.__ensureOwner = function (ownerID) {
        if (ownerID === this.__ownerID) {
            return this;
        }
        var newMap = this._map && this._map.__ensureOwner(ownerID);
        if (!ownerID) {
            this.__ownerID = ownerID;
            this._map = newMap;
            return this;
        }
        return makeRecord(this, newMap, ownerID);
    };


    var RecordPrototype = Record.prototype;
    RecordPrototype[DELETE] = RecordPrototype.remove;
    RecordPrototype.deleteIn =
    RecordPrototype.removeIn = MapPrototype.removeIn;
    RecordPrototype.merge = MapPrototype.merge;
    RecordPrototype.mergeWith = MapPrototype.mergeWith;
    RecordPrototype.mergeIn = MapPrototype.mergeIn;
    RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
    RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
    RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
    RecordPrototype.setIn = MapPrototype.setIn;
    RecordPrototype.update = MapPrototype.update;
    RecordPrototype.updateIn = MapPrototype.updateIn;
    RecordPrototype.withMutations = MapPrototype.withMutations;
    RecordPrototype.asMutable = MapPrototype.asMutable;
    RecordPrototype.asImmutable = MapPrototype.asImmutable;


    function makeRecord(likeRecord, map, ownerID) {
        var record = Object.create(Object.getPrototypeOf(likeRecord));
        record._map = map;
        record.__ownerID = ownerID;
        return record;
    }

    function recordName(record) {
        return record._name || record.constructor.name || 'Record';
    }

    function setProps(prototype, names) {
        try {
            names.forEach(setProp.bind(undefined, prototype));
        } catch (error) {
            // Object.defineProperty failed. Probably IE8.
        }
    }

    function setProp(prototype, name) {
        Object.defineProperty(prototype, name, {
            get: function () {
                return this.get(name);
            },
            set: function (value) {
                invariant(this.__ownerID, 'Cannot set on an immutable record.');
                this.set(name, value);
            }
        });
    }

    createClass(Set, SetCollection);

    // @pragma Construction

    function Set(value) {
        return value === null || value === undefined ? emptySet() :
          isSet(value) && !isOrdered(value) ? value :
          emptySet().withMutations(function (set) {
              var iter = SetIterable(value);
              assertNotInfinite(iter.size);
              iter.forEach(function (v) { return set.add(v) });
          });
    }

    Set.of = function (/*...values*/) {
        return this(arguments);
    };

    Set.fromKeys = function (value) {
        return this(KeyedIterable(value).keySeq());
    };

    Set.prototype.toString = function () {
        return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function (value) {
        return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function (value) {
        return updateSet(this, this._map.set(value, true));
    };

    Set.prototype.remove = function (value) {
        return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function () {
        return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.union = function () {
        var iters = SLICE$0.call(arguments, 0);
        iters = iters.filter(function (x) { return x.size !== 0 });
        if (iters.length === 0) {
            return this;
        }
        if (this.size === 0 && !this.__ownerID && iters.length === 1) {
            return this.constructor(iters[0]);
        }
        return this.withMutations(function (set) {
            for (var ii = 0; ii < iters.length; ii++) {
                SetIterable(iters[ii]).forEach(function (value) { return set.add(value) });
            }
        });
    };

    Set.prototype.intersect = function () {
        var iters = SLICE$0.call(arguments, 0);
        if (iters.length === 0) {
            return this;
        }
        iters = iters.map(function (iter) { return SetIterable(iter) });
        var originalSet = this;
        return this.withMutations(function (set) {
            originalSet.forEach(function (value) {
                if (!iters.every(function (iter) { return iter.includes(value) })) {
                    set.remove(value);
                }
            });
        });
    };

    Set.prototype.subtract = function () {
        var iters = SLICE$0.call(arguments, 0);
        if (iters.length === 0) {
            return this;
        }
        iters = iters.map(function (iter) { return SetIterable(iter) });
        var originalSet = this;
        return this.withMutations(function (set) {
            originalSet.forEach(function (value) {
                if (iters.some(function (iter) { return iter.includes(value) })) {
                    set.remove(value);
                }
            });
        });
    };

    Set.prototype.merge = function () {
        return this.union.apply(this, arguments);
    };

    Set.prototype.mergeWith = function (merger) {
        var iters = SLICE$0.call(arguments, 1);
        return this.union.apply(this, iters);
    };

    Set.prototype.sort = function (comparator) {
        // Late binding
        return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function (mapper, comparator) {
        // Late binding
        return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function () {
        return this._map.wasAltered();
    };

    Set.prototype.__iterate = function (fn, reverse) {
        var this$0 = this;
        return this._map.__iterate(function (_, k) { return fn(k, k, this$0) }, reverse);
    };

    Set.prototype.__iterator = function (type, reverse) {
        return this._map.map(function (_, k) { return k }).__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function (ownerID) {
        if (ownerID === this.__ownerID) {
            return this;
        }
        var newMap = this._map.__ensureOwner(ownerID);
        if (!ownerID) {
            this.__ownerID = ownerID;
            this._map = newMap;
            return this;
        }
        return this.__make(newMap, ownerID);
    };


    function isSet(maybeSet) {
        return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
    }

    Set.isSet = isSet;

    var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

    var SetPrototype = Set.prototype;
    SetPrototype[IS_SET_SENTINEL] = true;
    SetPrototype[DELETE] = SetPrototype.remove;
    SetPrototype.mergeDeep = SetPrototype.merge;
    SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
    SetPrototype.withMutations = MapPrototype.withMutations;
    SetPrototype.asMutable = MapPrototype.asMutable;
    SetPrototype.asImmutable = MapPrototype.asImmutable;

    SetPrototype.__empty = emptySet;
    SetPrototype.__make = makeSet;

    function updateSet(set, newMap) {
        if (set.__ownerID) {
            set.size = newMap.size;
            set._map = newMap;
            return set;
        }
        return newMap === set._map ? set :
          newMap.size === 0 ? set.__empty() :
          set.__make(newMap);
    }

    function makeSet(map, ownerID) {
        var set = Object.create(SetPrototype);
        set.size = map ? map.size : 0;
        set._map = map;
        set.__ownerID = ownerID;
        return set;
    }

    var EMPTY_SET;
    function emptySet() {
        return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
    }

    createClass(OrderedSet, Set);

    // @pragma Construction

    function OrderedSet(value) {
        return value === null || value === undefined ? emptyOrderedSet() :
          isOrderedSet(value) ? value :
          emptyOrderedSet().withMutations(function (set) {
              var iter = SetIterable(value);
              assertNotInfinite(iter.size);
              iter.forEach(function (v) { return set.add(v) });
          });
    }

    OrderedSet.of = function (/*...values*/) {
        return this(arguments);
    };

    OrderedSet.fromKeys = function (value) {
        return this(KeyedIterable(value).keySeq());
    };

    OrderedSet.prototype.toString = function () {
        return this.__toString('OrderedSet {', '}');
    };


    function isOrderedSet(maybeOrderedSet) {
        return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
    }

    OrderedSet.isOrderedSet = isOrderedSet;

    var OrderedSetPrototype = OrderedSet.prototype;
    OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

    OrderedSetPrototype.__empty = emptyOrderedSet;
    OrderedSetPrototype.__make = makeOrderedSet;

    function makeOrderedSet(map, ownerID) {
        var set = Object.create(OrderedSetPrototype);
        set.size = map ? map.size : 0;
        set._map = map;
        set.__ownerID = ownerID;
        return set;
    }

    var EMPTY_ORDERED_SET;
    function emptyOrderedSet() {
        return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
    }

    createClass(Stack, IndexedCollection);

    // @pragma Construction

    function Stack(value) {
        return value === null || value === undefined ? emptyStack() :
          isStack(value) ? value :
          emptyStack().unshiftAll(value);
    }

    Stack.of = function (/*...values*/) {
        return this(arguments);
    };

    Stack.prototype.toString = function () {
        return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function (index, notSetValue) {
        var head = this._head;
        index = wrapIndex(this, index);
        while (head && index--) {
            head = head.next;
        }
        return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function () {
        return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function (/*...values*/) {
        if (arguments.length === 0) {
            return this;
        }
        var newSize = this.size + arguments.length;
        var head = this._head;
        for (var ii = arguments.length - 1; ii >= 0; ii--) {
            head = {
                value: arguments[ii],
                next: head
            };
        }
        if (this.__ownerID) {
            this.size = newSize;
            this._head = head;
            this.__hash = undefined;
            this.__altered = true;
            return this;
        }
        return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function (iter) {
        iter = IndexedIterable(iter);
        if (iter.size === 0) {
            return this;
        }
        assertNotInfinite(iter.size);
        var newSize = this.size;
        var head = this._head;
        iter.reverse().forEach(function (value) {
            newSize++;
            head = {
                value: value,
                next: head
            };
        });
        if (this.__ownerID) {
            this.size = newSize;
            this._head = head;
            this.__hash = undefined;
            this.__altered = true;
            return this;
        }
        return makeStack(newSize, head);
    };

    Stack.prototype.pop = function () {
        return this.slice(1);
    };

    Stack.prototype.unshift = function (/*...values*/) {
        return this.push.apply(this, arguments);
    };

    Stack.prototype.unshiftAll = function (iter) {
        return this.pushAll(iter);
    };

    Stack.prototype.shift = function () {
        return this.pop.apply(this, arguments);
    };

    Stack.prototype.clear = function () {
        if (this.size === 0) {
            return this;
        }
        if (this.__ownerID) {
            this.size = 0;
            this._head = undefined;
            this.__hash = undefined;
            this.__altered = true;
            return this;
        }
        return emptyStack();
    };

    Stack.prototype.slice = function (begin, end) {
        if (wholeSlice(begin, end, this.size)) {
            return this;
        }
        var resolvedBegin = resolveBegin(begin, this.size);
        var resolvedEnd = resolveEnd(end, this.size);
        if (resolvedEnd !== this.size) {
            // super.slice(begin, end);
            return IndexedCollection.prototype.slice.call(this, begin, end);
        }
        var newSize = this.size - resolvedBegin;
        var head = this._head;
        while (resolvedBegin--) {
            head = head.next;
        }
        if (this.__ownerID) {
            this.size = newSize;
            this._head = head;
            this.__hash = undefined;
            this.__altered = true;
            return this;
        }
        return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function (ownerID) {
        if (ownerID === this.__ownerID) {
            return this;
        }
        if (!ownerID) {
            this.__ownerID = ownerID;
            this.__altered = false;
            return this;
        }
        return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function (fn, reverse) {
        if (reverse) {
            return this.reverse().__iterate(fn);
        }
        var iterations = 0;
        var node = this._head;
        while (node) {
            if (fn(node.value, iterations++, this) === false) {
                break;
            }
            node = node.next;
        }
        return iterations;
    };

    Stack.prototype.__iterator = function (type, reverse) {
        if (reverse) {
            return this.reverse().__iterator(type);
        }
        var iterations = 0;
        var node = this._head;
        return new Iterator(function () {
            if (node) {
                var value = node.value;
                node = node.next;
                return iteratorValue(type, iterations++, value);
            }
            return iteratorDone();
        });
    };


    function isStack(maybeStack) {
        return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
    }

    Stack.isStack = isStack;

    var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

    var StackPrototype = Stack.prototype;
    StackPrototype[IS_STACK_SENTINEL] = true;
    StackPrototype.withMutations = MapPrototype.withMutations;
    StackPrototype.asMutable = MapPrototype.asMutable;
    StackPrototype.asImmutable = MapPrototype.asImmutable;
    StackPrototype.wasAltered = MapPrototype.wasAltered;


    function makeStack(size, head, ownerID, hash) {
        var map = Object.create(StackPrototype);
        map.size = size;
        map._head = head;
        map.__ownerID = ownerID;
        map.__hash = hash;
        map.__altered = false;
        return map;
    }

    var EMPTY_STACK;
    function emptyStack() {
        return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
    }

    /**
     * Contributes additional methods to a constructor
     */
    function mixin(ctor, methods) {
        var keyCopier = function (key) { ctor.prototype[key] = methods[key]; };
        Object.keys(methods).forEach(keyCopier);
        Object.getOwnPropertySymbols &&
          Object.getOwnPropertySymbols(methods).forEach(keyCopier);
        return ctor;
    }

    Iterable.Iterator = Iterator;

    mixin(Iterable, {

        // ### Conversion to other types

        toArray: function () {
            assertNotInfinite(this.size);
            var array = new Array(this.size || 0);
            this.valueSeq().__iterate(function (v, i) { array[i] = v; });
            return array;
        },

        toIndexedSeq: function () {
            return new ToIndexedSequence(this);
        },

        toJS: function () {
            return this.toSeq().map(
              function (value) { return value && typeof value.toJS === 'function' ? value.toJS() : value }
            ).__toJS();
        },

        toJSON: function () {
            return this.toSeq().map(
              function (value) { return value && typeof value.toJSON === 'function' ? value.toJSON() : value }
            ).__toJS();
        },

        toKeyedSeq: function () {
            return new ToKeyedSequence(this, true);
        },

        toMap: function () {
            // Use Late Binding here to solve the circular dependency.
            return Map(this.toKeyedSeq());
        },

        toObject: function () {
            assertNotInfinite(this.size);
            var object = {};
            this.__iterate(function (v, k) { object[k] = v; });
            return object;
        },

        toOrderedMap: function () {
            // Use Late Binding here to solve the circular dependency.
            return OrderedMap(this.toKeyedSeq());
        },

        toOrderedSet: function () {
            // Use Late Binding here to solve the circular dependency.
            return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
        },

        toSet: function () {
            // Use Late Binding here to solve the circular dependency.
            return Set(isKeyed(this) ? this.valueSeq() : this);
        },

        toSetSeq: function () {
            return new ToSetSequence(this);
        },

        toSeq: function () {
            return isIndexed(this) ? this.toIndexedSeq() :
              isKeyed(this) ? this.toKeyedSeq() :
              this.toSetSeq();
        },

        toStack: function () {
            // Use Late Binding here to solve the circular dependency.
            return Stack(isKeyed(this) ? this.valueSeq() : this);
        },

        toList: function () {
            // Use Late Binding here to solve the circular dependency.
            return List(isKeyed(this) ? this.valueSeq() : this);
        },


        // ### Common JavaScript methods and properties

        toString: function () {
            return '[Iterable]';
        },

        __toString: function (head, tail) {
            if (this.size === 0) {
                return head + tail;
            }
            return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
        },


        // ### ES6 Collection methods (ES6 Array and Map)

        concat: function () {
            var values = SLICE$0.call(arguments, 0);
            return reify(this, concatFactory(this, values));
        },

        includes: function (searchValue) {
            return this.some(function (value) { return is(value, searchValue) });
        },

        entries: function () {
            return this.__iterator(ITERATE_ENTRIES);
        },

        every: function (predicate, context) {
            assertNotInfinite(this.size);
            var returnValue = true;
            this.__iterate(function (v, k, c) {
                if (!predicate.call(context, v, k, c)) {
                    returnValue = false;
                    return false;
                }
            });
            return returnValue;
        },

        filter: function (predicate, context) {
            return reify(this, filterFactory(this, predicate, context, true));
        },

        find: function (predicate, context, notSetValue) {
            var entry = this.findEntry(predicate, context);
            return entry ? entry[1] : notSetValue;
        },

        findEntry: function (predicate, context) {
            var found;
            this.__iterate(function (v, k, c) {
                if (predicate.call(context, v, k, c)) {
                    found = [k, v];
                    return false;
                }
            });
            return found;
        },

        findLastEntry: function (predicate, context) {
            return this.toSeq().reverse().findEntry(predicate, context);
        },

        forEach: function (sideEffect, context) {
            assertNotInfinite(this.size);
            return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
        },

        join: function (separator) {
            assertNotInfinite(this.size);
            separator = separator !== undefined ? '' + separator : ',';
            var joined = '';
            var isFirst = true;
            this.__iterate(function (v) {
                isFirst ? (isFirst = false) : (joined += separator);
                joined += v !== null && v !== undefined ? v.toString() : '';
            });
            return joined;
        },

        keys: function () {
            return this.__iterator(ITERATE_KEYS);
        },

        map: function (mapper, context) {
            return reify(this, mapFactory(this, mapper, context));
        },

        reduce: function (reducer, initialReduction, context) {
            assertNotInfinite(this.size);
            var reduction;
            var useFirst;
            if (arguments.length < 2) {
                useFirst = true;
            } else {
                reduction = initialReduction;
            }
            this.__iterate(function (v, k, c) {
                if (useFirst) {
                    useFirst = false;
                    reduction = v;
                } else {
                    reduction = reducer.call(context, reduction, v, k, c);
                }
            });
            return reduction;
        },

        reduceRight: function (reducer, initialReduction, context) {
            var reversed = this.toKeyedSeq().reverse();
            return reversed.reduce.apply(reversed, arguments);
        },

        reverse: function () {
            return reify(this, reverseFactory(this, true));
        },

        slice: function (begin, end) {
            return reify(this, sliceFactory(this, begin, end, true));
        },

        some: function (predicate, context) {
            return !this.every(not(predicate), context);
        },

        sort: function (comparator) {
            return reify(this, sortFactory(this, comparator));
        },

        values: function () {
            return this.__iterator(ITERATE_VALUES);
        },


        // ### More sequential methods

        butLast: function () {
            return this.slice(0, -1);
        },

        isEmpty: function () {
            return this.size !== undefined ? this.size === 0 : !this.some(function () { return true });
        },

        count: function (predicate, context) {
            return ensureSize(
              predicate ? this.toSeq().filter(predicate, context) : this
            );
        },

        countBy: function (grouper, context) {
            return countByFactory(this, grouper, context);
        },

        equals: function (other) {
            return deepEqual(this, other);
        },

        entrySeq: function () {
            var iterable = this;
            if (iterable._cache) {
                // We cache as an entries array, so we can just return the cache!
                return new ArraySeq(iterable._cache);
            }
            var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
            entriesSequence.fromEntrySeq = function () { return iterable.toSeq() };
            return entriesSequence;
        },

        filterNot: function (predicate, context) {
            return this.filter(not(predicate), context);
        },

        findLast: function (predicate, context, notSetValue) {
            return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
        },

        first: function () {
            return this.find(returnTrue);
        },

        flatMap: function (mapper, context) {
            return reify(this, flatMapFactory(this, mapper, context));
        },

        flatten: function (depth) {
            return reify(this, flattenFactory(this, depth, true));
        },

        fromEntrySeq: function () {
            return new FromEntriesSequence(this);
        },

        get: function (searchKey, notSetValue) {
            return this.find(function (_, key) { return is(key, searchKey) }, undefined, notSetValue);
        },

        getIn: function (searchKeyPath, notSetValue) {
            var nested = this;
            // Note: in an ES6 environment, we would prefer:
            // for (var key of searchKeyPath) {
            var iter = forceIterator(searchKeyPath);
            var step;
            while (!(step = iter.next()).done) {
                var key = step.value;
                nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
                if (nested === NOT_SET) {
                    return notSetValue;
                }
            }
            return nested;
        },

        groupBy: function (grouper, context) {
            return groupByFactory(this, grouper, context);
        },

        has: function (searchKey) {
            return this.get(searchKey, NOT_SET) !== NOT_SET;
        },

        hasIn: function (searchKeyPath) {
            return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
        },

        isSubset: function (iter) {
            iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
            return this.every(function (value) { return iter.includes(value) });
        },

        isSuperset: function (iter) {
            iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
            return iter.isSubset(this);
        },

        keySeq: function () {
            return this.toSeq().map(keyMapper).toIndexedSeq();
        },

        last: function () {
            return this.toSeq().reverse().first();
        },

        max: function (comparator) {
            return maxFactory(this, comparator);
        },

        maxBy: function (mapper, comparator) {
            return maxFactory(this, comparator, mapper);
        },

        min: function (comparator) {
            return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
        },

        minBy: function (mapper, comparator) {
            return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
        },

        rest: function () {
            return this.slice(1);
        },

        skip: function (amount) {
            return this.slice(Math.max(0, amount));
        },

        skipLast: function (amount) {
            return reify(this, this.toSeq().reverse().skip(amount).reverse());
        },

        skipWhile: function (predicate, context) {
            return reify(this, skipWhileFactory(this, predicate, context, true));
        },

        skipUntil: function (predicate, context) {
            return this.skipWhile(not(predicate), context);
        },

        sortBy: function (mapper, comparator) {
            return reify(this, sortFactory(this, comparator, mapper));
        },

        take: function (amount) {
            return this.slice(0, Math.max(0, amount));
        },

        takeLast: function (amount) {
            return reify(this, this.toSeq().reverse().take(amount).reverse());
        },

        takeWhile: function (predicate, context) {
            return reify(this, takeWhileFactory(this, predicate, context));
        },

        takeUntil: function (predicate, context) {
            return this.takeWhile(not(predicate), context);
        },

        valueSeq: function () {
            return this.toIndexedSeq();
        },


        // ### Hashable Object

        hashCode: function () {
            return this.__hash || (this.__hash = hashIterable(this));
        }


        // ### Internal

        // abstract __iterate(fn, reverse)

        // abstract __iterator(type, reverse)
    });

    // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
    // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
    // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
    // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

    var IterablePrototype = Iterable.prototype;
    IterablePrototype[IS_ITERABLE_SENTINEL] = true;
    IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
    IterablePrototype.__toJS = IterablePrototype.toArray;
    IterablePrototype.__toStringMapper = quoteString;
    IterablePrototype.inspect =
    IterablePrototype.toSource = function () { return this.toString(); };
    IterablePrototype.chain = IterablePrototype.flatMap;
    IterablePrototype.contains = IterablePrototype.includes;

    // Temporary warning about using length
    (function () {
        try {
            Object.defineProperty(IterablePrototype, 'length', {
                get: function () {
                    if (!Iterable.noLengthWarning) {
                        var stack;
                        try {
                            throw new Error();
                        } catch (error) {
                            stack = error.stack;
                        }
                        if (stack.indexOf('_wrapObject') === -1) {
                            console && console.warn && console.warn(
                              'iterable.length has been deprecated, ' +
                              'use iterable.size or iterable.count(). ' +
                              'This warning will become a silent error in a future version. ' +
                              stack
                            );
                            return this.size;
                        }
                    }
                }
            });
        } catch (e) { }
    })();



    mixin(KeyedIterable, {

        // ### More sequential methods

        flip: function () {
            return reify(this, flipFactory(this));
        },

        findKey: function (predicate, context) {
            var entry = this.findEntry(predicate, context);
            return entry && entry[0];
        },

        findLastKey: function (predicate, context) {
            return this.toSeq().reverse().findKey(predicate, context);
        },

        keyOf: function (searchValue) {
            return this.findKey(function (value) { return is(value, searchValue) });
        },

        lastKeyOf: function (searchValue) {
            return this.findLastKey(function (value) { return is(value, searchValue) });
        },

        mapEntries: function (mapper, context) {
            var this$0 = this;
            var iterations = 0;
            return reify(this,
              this.toSeq().map(
                function (v, k) { return mapper.call(context, [k, v], iterations++, this$0) }
              ).fromEntrySeq()
            );
        },

        mapKeys: function (mapper, context) {
            var this$0 = this;
            return reify(this,
              this.toSeq().flip().map(
                function (k, v) { return mapper.call(context, k, v, this$0) }
              ).flip()
            );
        }

    });

    var KeyedIterablePrototype = KeyedIterable.prototype;
    KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
    KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
    KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
    KeyedIterablePrototype.__toStringMapper = function (v, k) { return JSON.stringify(k) + ': ' + quoteString(v) };



    mixin(IndexedIterable, {

        // ### Conversion to other types

        toKeyedSeq: function () {
            return new ToKeyedSequence(this, false);
        },


        // ### ES6 Collection methods (ES6 Array and Map)

        filter: function (predicate, context) {
            return reify(this, filterFactory(this, predicate, context, false));
        },

        findIndex: function (predicate, context) {
            var entry = this.findEntry(predicate, context);
            return entry ? entry[0] : -1;
        },

        indexOf: function (searchValue) {
            var key = this.toKeyedSeq().keyOf(searchValue);
            return key === undefined ? -1 : key;
        },

        lastIndexOf: function (searchValue) {
            var key = this.toKeyedSeq().reverse().keyOf(searchValue);
            return key === undefined ? -1 : key;
        },

        reverse: function () {
            return reify(this, reverseFactory(this, false));
        },

        slice: function (begin, end) {
            return reify(this, sliceFactory(this, begin, end, false));
        },

        splice: function (index, removeNum /*, ...values*/) {
            var numArgs = arguments.length;
            removeNum = Math.max(removeNum | 0, 0);
            if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
                return this;
            }
            // If index is negative, it should resolve relative to the size of the
            // collection. However size may be expensive to compute if not cached, so
            // only call count() if the number is in fact negative.
            index = resolveBegin(index, index < 0 ? this.count() : this.size);
            var spliced = this.slice(0, index);
            return reify(
              this,
              numArgs === 1 ?
                spliced :
                spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
            );
        },


        // ### More collection methods

        findLastIndex: function (predicate, context) {
            var key = this.toKeyedSeq().findLastKey(predicate, context);
            return key === undefined ? -1 : key;
        },

        first: function () {
            return this.get(0);
        },

        flatten: function (depth) {
            return reify(this, flattenFactory(this, depth, false));
        },

        get: function (index, notSetValue) {
            index = wrapIndex(this, index);
            return (index < 0 || (this.size === Infinity ||
                (this.size !== undefined && index > this.size))) ?
                notSetValue :
              this.find(function (_, key) { return key === index }, undefined, notSetValue);
        },

        has: function (index) {
            index = wrapIndex(this, index);
            return index >= 0 && (this.size !== undefined ?
              this.size === Infinity || index < this.size :
              this.indexOf(index) !== -1
            );
        },

        interpose: function (separator) {
            return reify(this, interposeFactory(this, separator));
        },

        interleave: function (/*...iterables*/) {
            var iterables = [this].concat(arrCopy(arguments));
            var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
            var interleaved = zipped.flatten(true);
            if (zipped.size) {
                interleaved.size = zipped.size * iterables.length;
            }
            return reify(this, interleaved);
        },

        last: function () {
            return this.get(-1);
        },

        skipWhile: function (predicate, context) {
            return reify(this, skipWhileFactory(this, predicate, context, false));
        },

        zip: function (/*, ...iterables */) {
            var iterables = [this].concat(arrCopy(arguments));
            return reify(this, zipWithFactory(this, defaultZipper, iterables));
        },

        zipWith: function (zipper/*, ...iterables */) {
            var iterables = arrCopy(arguments);
            iterables[0] = this;
            return reify(this, zipWithFactory(this, zipper, iterables));
        }

    });

    IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
    IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



    mixin(SetIterable, {

        // ### ES6 Collection methods (ES6 Array and Map)

        get: function (value, notSetValue) {
            return this.has(value) ? value : notSetValue;
        },

        includes: function (value) {
            return this.has(value);
        },


        // ### More sequential methods

        keySeq: function () {
            return this.valueSeq();
        }

    });

    SetIterable.prototype.has = IterablePrototype.includes;
    SetIterable.prototype.contains = SetIterable.prototype.includes;


    // Mixin subclasses

    mixin(KeyedSeq, KeyedIterable.prototype);
    mixin(IndexedSeq, IndexedIterable.prototype);
    mixin(SetSeq, SetIterable.prototype);

    mixin(KeyedCollection, KeyedIterable.prototype);
    mixin(IndexedCollection, IndexedIterable.prototype);
    mixin(SetCollection, SetIterable.prototype);


    // #pragma Helper functions

    function keyMapper(v, k) {
        return k;
    }

    function entryMapper(v, k) {
        return [k, v];
    }

    function not(predicate) {
        return function () {
            return !predicate.apply(this, arguments);
        }
    }

    function neg(predicate) {
        return function () {
            return -predicate.apply(this, arguments);
        }
    }

    function quoteString(value) {
        return typeof value === 'string' ? JSON.stringify(value) : value;
    }

    function defaultZipper() {
        return arrCopy(arguments);
    }

    function defaultNegComparator(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
    }

    function hashIterable(iterable) {
        if (iterable.size === Infinity) {
            return 0;
        }
        var ordered = isOrdered(iterable);
        var keyed = isKeyed(iterable);
        var h = ordered ? 1 : 0;
        var size = iterable.__iterate(
          keyed ?
            ordered ?
              function (v, k) { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
              function (v, k) { h = h + hashMerge(hash(v), hash(k)) | 0; } :
            ordered ?
              function (v) { h = 31 * h + hash(v) | 0; } :
              function (v) { h = h + hash(v) | 0; }
        );
        return murmurHashOfSize(size, h);
    }

    function murmurHashOfSize(size, h) {
        h = imul(h, 0xCC9E2D51);
        h = imul(h << 15 | h >>> -15, 0x1B873593);
        h = imul(h << 13 | h >>> -13, 5);
        h = (h + 0xE6546B64 | 0) ^ size;
        h = imul(h ^ h >>> 16, 0x85EBCA6B);
        h = imul(h ^ h >>> 13, 0xC2B2AE35);
        h = smi(h ^ h >>> 16);
        return h;
    }

    function hashMerge(a, b) {
        return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
    }

    var Immutable = {

        Iterable: Iterable,

        Seq: Seq,
        Collection: Collection,
        Map: Map,
        OrderedMap: OrderedMap,
        List: List,
        Stack: Stack,
        Set: Set,
        OrderedSet: OrderedSet,

        Record: Record,
        Range: Range,
        Repeat: Repeat,

        is: is,
        fromJS: fromJS

    };

    return Immutable;

}));
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */

var __LiteMolZlib = {};
(function () {
    'use strict'; function q(b) { throw b; } var t = void 0, u = !0, aa = this; function A(b, a) { var c = b.split("."), d = aa; !(c[0] in d) && d.execScript && d.execScript("var " + c[0]); for (var e; c.length && (e = c.shift()) ;) !c.length && a !== t ? d[e] = a : d = d[e] ? d[e] : d[e] = {} }; var B = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView; function F(b, a) { this.index = "number" === typeof a ? a : 0; this.m = 0; this.buffer = b instanceof (B ? Uint8Array : Array) ? b : new (B ? Uint8Array : Array)(32768); 2 * this.buffer.length <= this.index && q(Error("invalid index")); this.buffer.length <= this.index && this.f() } F.prototype.f = function () { var b = this.buffer, a, c = b.length, d = new (B ? Uint8Array : Array)(c << 1); if (B) d.set(b); else for (a = 0; a < c; ++a) d[a] = b[a]; return this.buffer = d };
    F.prototype.d = function (b, a, c) { var d = this.buffer, e = this.index, f = this.m, g = d[e], k; c && 1 < a && (b = 8 < a ? (H[b & 255] << 24 | H[b >>> 8 & 255] << 16 | H[b >>> 16 & 255] << 8 | H[b >>> 24 & 255]) >> 32 - a : H[b] >> 8 - a); if (8 > a + f) g = g << a | b, f += a; else for (k = 0; k < a; ++k) g = g << 1 | b >> a - k - 1 & 1, 8 === ++f && (f = 0, d[e++] = H[g], g = 0, e === d.length && (d = this.f())); d[e] = g; this.buffer = d; this.m = f; this.index = e }; F.prototype.finish = function () { var b = this.buffer, a = this.index, c; 0 < this.m && (b[a] <<= 8 - this.m, b[a] = H[b[a]], a++); B ? c = b.subarray(0, a) : (b.length = a, c = b); return c };
    var ba = new (B ? Uint8Array : Array)(256), ca; for (ca = 0; 256 > ca; ++ca) { for (var K = ca, da = K, ea = 7, K = K >>> 1; K; K >>>= 1) da <<= 1, da |= K & 1, --ea; ba[ca] = (da << ea & 255) >>> 0 } var H = ba; function ja(b, a, c) { var d, e = "number" === typeof a ? a : a = 0, f = "number" === typeof c ? c : b.length; d = -1; for (e = f & 7; e--; ++a) d = d >>> 8 ^ O[(d ^ b[a]) & 255]; for (e = f >> 3; e--; a += 8) d = d >>> 8 ^ O[(d ^ b[a]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 1]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 2]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 3]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 4]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 5]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 6]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 7]) & 255]; return (d ^ 4294967295) >>> 0 }
    var ka = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759,
    2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977,
    2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755,
    2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956,
    3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270,
    936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117], O = B ? new Uint32Array(ka) : ka; function P() { } P.prototype.getName = function () { return this.name }; P.prototype.getData = function () { return this.data }; P.prototype.Y = function () { return this.Z }; A("Zlib.GunzipMember", P); A("Zlib.GunzipMember.prototype.getName", P.prototype.getName); A("Zlib.GunzipMember.prototype.getData", P.prototype.getData); A("Zlib.GunzipMember.prototype.getMtime", P.prototype.Y); function la(b) { this.buffer = new (B ? Uint16Array : Array)(2 * b); this.length = 0 } la.prototype.getParent = function (b) { return 2 * ((b - 2) / 4 | 0) }; la.prototype.push = function (b, a) { var c, d, e = this.buffer, f; c = this.length; e[this.length++] = a; for (e[this.length++] = b; 0 < c;) if (d = this.getParent(c), e[c] > e[d]) f = e[c], e[c] = e[d], e[d] = f, f = e[c + 1], e[c + 1] = e[d + 1], e[d + 1] = f, c = d; else break; return this.length };
    la.prototype.pop = function () { var b, a, c = this.buffer, d, e, f; a = c[0]; b = c[1]; this.length -= 2; c[0] = c[this.length]; c[1] = c[this.length + 1]; for (f = 0; ;) { e = 2 * f + 2; if (e >= this.length) break; e + 2 < this.length && c[e + 2] > c[e] && (e += 2); if (c[e] > c[f]) d = c[f], c[f] = c[e], c[e] = d, d = c[f + 1], c[f + 1] = c[e + 1], c[e + 1] = d; else break; f = e } return { index: b, value: a, length: this.length } }; function ma(b) { var a = b.length, c = 0, d = Number.POSITIVE_INFINITY, e, f, g, k, h, l, s, p, m, n; for (p = 0; p < a; ++p) b[p] > c && (c = b[p]), b[p] < d && (d = b[p]); e = 1 << c; f = new (B ? Uint32Array : Array)(e); g = 1; k = 0; for (h = 2; g <= c;) { for (p = 0; p < a; ++p) if (b[p] === g) { l = 0; s = k; for (m = 0; m < g; ++m) l = l << 1 | s & 1, s >>= 1; n = g << 16 | p; for (m = l; m < e; m += h) f[m] = n; ++k } ++g; k <<= 1; h <<= 1 } return [f, c, d] }; function na(b, a) { this.k = qa; this.I = 0; this.input = B && b instanceof Array ? new Uint8Array(b) : b; this.b = 0; a && (a.lazy && (this.I = a.lazy), "number" === typeof a.compressionType && (this.k = a.compressionType), a.outputBuffer && (this.a = B && a.outputBuffer instanceof Array ? new Uint8Array(a.outputBuffer) : a.outputBuffer), "number" === typeof a.outputIndex && (this.b = a.outputIndex)); this.a || (this.a = new (B ? Uint8Array : Array)(32768)) } var qa = 2, ra = { NONE: 0, v: 1, o: qa, ba: 3 }, sa = [], S;
    for (S = 0; 288 > S; S++) switch (u) { case 143 >= S: sa.push([S + 48, 8]); break; case 255 >= S: sa.push([S - 144 + 400, 9]); break; case 279 >= S: sa.push([S - 256 + 0, 7]); break; case 287 >= S: sa.push([S - 280 + 192, 8]); break; default: q("invalid literal: " + S) }
    na.prototype.g = function () {
        var b, a, c, d, e = this.input; switch (this.k) {
            case 0: c = 0; for (d = e.length; c < d;) {
                a = B ? e.subarray(c, c + 65535) : e.slice(c, c + 65535); c += a.length; var f = a, g = c === d, k = t, h = t, l = t, s = t, p = t, m = this.a, n = this.b; if (B) { for (m = new Uint8Array(this.a.buffer) ; m.length <= n + f.length + 5;) m = new Uint8Array(m.length << 1); m.set(this.a) } k = g ? 1 : 0; m[n++] = k | 0; h = f.length; l = ~h + 65536 & 65535; m[n++] = h & 255; m[n++] = h >>> 8 & 255; m[n++] = l & 255; m[n++] = l >>> 8 & 255; if (B) m.set(f, n), n += f.length, m = m.subarray(0, n); else {
                    s = 0; for (p = f.length; s < p; ++s) m[n++] =
                    f[s]; m.length = n
                } this.b = n; this.a = m
            } break; case 1: var r = new F(B ? new Uint8Array(this.a.buffer) : this.a, this.b); r.d(1, 1, u); r.d(1, 2, u); var v = ta(this, e), x, Q, y; x = 0; for (Q = v.length; x < Q; x++) if (y = v[x], F.prototype.d.apply(r, sa[y]), 256 < y) r.d(v[++x], v[++x], u), r.d(v[++x], 5), r.d(v[++x], v[++x], u); else if (256 === y) break; this.a = r.finish(); this.b = this.a.length; break; case qa: var E = new F(B ? new Uint8Array(this.a.buffer) : this.a, this.b), Ka, R, X, Y, Z, pb = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], fa, La, ga, Ma, oa, wa = Array(19),
            Na, $, pa, C, Oa; Ka = qa; E.d(1, 1, u); E.d(Ka, 2, u); R = ta(this, e); fa = ua(this.W, 15); La = va(fa); ga = ua(this.V, 7); Ma = va(ga); for (X = 286; 257 < X && 0 === fa[X - 1]; X--); for (Y = 30; 1 < Y && 0 === ga[Y - 1]; Y--); var Pa = X, Qa = Y, J = new (B ? Uint32Array : Array)(Pa + Qa), w, L, z, ha, I = new (B ? Uint32Array : Array)(316), G, D, M = new (B ? Uint8Array : Array)(19); for (w = L = 0; w < Pa; w++) J[L++] = fa[w]; for (w = 0; w < Qa; w++) J[L++] = ga[w]; if (!B) { w = 0; for (ha = M.length; w < ha; ++w) M[w] = 0 } w = G = 0; for (ha = J.length; w < ha; w += L) {
                for (L = 1; w + L < ha && J[w + L] === J[w]; ++L); z = L; if (0 === J[w]) if (3 > z) for (; 0 <
                z--;) I[G++] = 0, M[0]++; else for (; 0 < z;) D = 138 > z ? z : 138, D > z - 3 && D < z && (D = z - 3), 10 >= D ? (I[G++] = 17, I[G++] = D - 3, M[17]++) : (I[G++] = 18, I[G++] = D - 11, M[18]++), z -= D; else if (I[G++] = J[w], M[J[w]]++, z--, 3 > z) for (; 0 < z--;) I[G++] = J[w], M[J[w]]++; else for (; 0 < z;) D = 6 > z ? z : 6, D > z - 3 && D < z && (D = z - 3), I[G++] = 16, I[G++] = D - 3, M[16]++, z -= D
            } b = B ? I.subarray(0, G) : I.slice(0, G); oa = ua(M, 7); for (C = 0; 19 > C; C++) wa[C] = oa[pb[C]]; for (Z = 19; 4 < Z && 0 === wa[Z - 1]; Z--); Na = va(oa); E.d(X - 257, 5, u); E.d(Y - 1, 5, u); E.d(Z - 4, 4, u); for (C = 0; C < Z; C++) E.d(wa[C], 3, u); C = 0; for (Oa = b.length; C <
            Oa; C++) if ($ = b[C], E.d(Na[$], oa[$], u), 16 <= $) { C++; switch ($) { case 16: pa = 2; break; case 17: pa = 3; break; case 18: pa = 7; break; default: q("invalid code: " + $) } E.d(b[C], pa, u) } var Ra = [La, fa], Sa = [Ma, ga], N, Ta, ia, za, Ua, Va, Wa, Xa; Ua = Ra[0]; Va = Ra[1]; Wa = Sa[0]; Xa = Sa[1]; N = 0; for (Ta = R.length; N < Ta; ++N) if (ia = R[N], E.d(Ua[ia], Va[ia], u), 256 < ia) E.d(R[++N], R[++N], u), za = R[++N], E.d(Wa[za], Xa[za], u), E.d(R[++N], R[++N], u); else if (256 === ia) break; this.a = E.finish(); this.b = this.a.length; break; default: q("invalid compression type")
        } return this.a
    };
    function xa(b, a) { this.length = b; this.Q = a }
    var ya = function () {
        function b(a) {
            switch (u) {
                case 3 === a: return [257, a - 3, 0]; case 4 === a: return [258, a - 4, 0]; case 5 === a: return [259, a - 5, 0]; case 6 === a: return [260, a - 6, 0]; case 7 === a: return [261, a - 7, 0]; case 8 === a: return [262, a - 8, 0]; case 9 === a: return [263, a - 9, 0]; case 10 === a: return [264, a - 10, 0]; case 12 >= a: return [265, a - 11, 1]; case 14 >= a: return [266, a - 13, 1]; case 16 >= a: return [267, a - 15, 1]; case 18 >= a: return [268, a - 17, 1]; case 22 >= a: return [269, a - 19, 2]; case 26 >= a: return [270, a - 23, 2]; case 30 >= a: return [271, a - 27, 2]; case 34 >= a: return [272,
                a - 31, 2]; case 42 >= a: return [273, a - 35, 3]; case 50 >= a: return [274, a - 43, 3]; case 58 >= a: return [275, a - 51, 3]; case 66 >= a: return [276, a - 59, 3]; case 82 >= a: return [277, a - 67, 4]; case 98 >= a: return [278, a - 83, 4]; case 114 >= a: return [279, a - 99, 4]; case 130 >= a: return [280, a - 115, 4]; case 162 >= a: return [281, a - 131, 5]; case 194 >= a: return [282, a - 163, 5]; case 226 >= a: return [283, a - 195, 5]; case 257 >= a: return [284, a - 227, 5]; case 258 === a: return [285, a - 258, 0]; default: q("invalid length: " + a)
            }
        } var a = [], c, d; for (c = 3; 258 >= c; c++) d = b(c), a[c] = d[2] << 24 | d[1] <<
        16 | d[0]; return a
    }(), Aa = B ? new Uint32Array(ya) : ya;
    function ta(b, a) {
        function c(a, c) {
            var b = a.Q, d = [], e = 0, f; f = Aa[a.length]; d[e++] = f & 65535; d[e++] = f >> 16 & 255; d[e++] = f >> 24; var g; switch (u) {
                case 1 === b: g = [0, b - 1, 0]; break; case 2 === b: g = [1, b - 2, 0]; break; case 3 === b: g = [2, b - 3, 0]; break; case 4 === b: g = [3, b - 4, 0]; break; case 6 >= b: g = [4, b - 5, 1]; break; case 8 >= b: g = [5, b - 7, 1]; break; case 12 >= b: g = [6, b - 9, 2]; break; case 16 >= b: g = [7, b - 13, 2]; break; case 24 >= b: g = [8, b - 17, 3]; break; case 32 >= b: g = [9, b - 25, 3]; break; case 48 >= b: g = [10, b - 33, 4]; break; case 64 >= b: g = [11, b - 49, 4]; break; case 96 >= b: g = [12, b -
                65, 5]; break; case 128 >= b: g = [13, b - 97, 5]; break; case 192 >= b: g = [14, b - 129, 6]; break; case 256 >= b: g = [15, b - 193, 6]; break; case 384 >= b: g = [16, b - 257, 7]; break; case 512 >= b: g = [17, b - 385, 7]; break; case 768 >= b: g = [18, b - 513, 8]; break; case 1024 >= b: g = [19, b - 769, 8]; break; case 1536 >= b: g = [20, b - 1025, 9]; break; case 2048 >= b: g = [21, b - 1537, 9]; break; case 3072 >= b: g = [22, b - 2049, 10]; break; case 4096 >= b: g = [23, b - 3073, 10]; break; case 6144 >= b: g = [24, b - 4097, 11]; break; case 8192 >= b: g = [25, b - 6145, 11]; break; case 12288 >= b: g = [26, b - 8193, 12]; break; case 16384 >=
                    b: g = [27, b - 12289, 12]; break; case 24576 >= b: g = [28, b - 16385, 13]; break; case 32768 >= b: g = [29, b - 24577, 13]; break; default: q("invalid distance")
            } f = g; d[e++] = f[0]; d[e++] = f[1]; d[e++] = f[2]; var h, k; h = 0; for (k = d.length; h < k; ++h) m[n++] = d[h]; v[d[0]]++; x[d[3]]++; r = a.length + c - 1; p = null
        } var d, e, f, g, k, h = {}, l, s, p, m = B ? new Uint16Array(2 * a.length) : [], n = 0, r = 0, v = new (B ? Uint32Array : Array)(286), x = new (B ? Uint32Array : Array)(30), Q = b.I, y; if (!B) { for (f = 0; 285 >= f;) v[f++] = 0; for (f = 0; 29 >= f;) x[f++] = 0 } v[256] = 1; d = 0; for (e = a.length; d < e; ++d) {
            f = k = 0;
            for (g = 3; f < g && d + f !== e; ++f) k = k << 8 | a[d + f]; h[k] === t && (h[k] = []); l = h[k]; if (!(0 < r--)) { for (; 0 < l.length && 32768 < d - l[0];) l.shift(); if (d + 3 >= e) { p && c(p, -1); f = 0; for (g = e - d; f < g; ++f) y = a[d + f], m[n++] = y, ++v[y]; break } 0 < l.length ? (s = Ba(a, d, l), p ? p.length < s.length ? (y = a[d - 1], m[n++] = y, ++v[y], c(s, 0)) : c(p, -1) : s.length < Q ? p = s : c(s, 0)) : p ? c(p, -1) : (y = a[d], m[n++] = y, ++v[y]) } l.push(d)
        } m[n++] = 256; v[256]++; b.W = v; b.V = x; return B ? m.subarray(0, n) : m
    }
    function Ba(b, a, c) { var d, e, f = 0, g, k, h, l, s = b.length; k = 0; l = c.length; a: for (; k < l; k++) { d = c[l - k - 1]; g = 3; if (3 < f) { for (h = f; 3 < h; h--) if (b[d + h - 1] !== b[a + h - 1]) continue a; g = f } for (; 258 > g && a + g < s && b[d + g] === b[a + g];)++g; g > f && (e = d, f = g); if (258 === g) break } return new xa(f, a - e) }
    function ua(b, a) { var c = b.length, d = new la(572), e = new (B ? Uint8Array : Array)(c), f, g, k, h, l; if (!B) for (h = 0; h < c; h++) e[h] = 0; for (h = 0; h < c; ++h) 0 < b[h] && d.push(h, b[h]); f = Array(d.length / 2); g = new (B ? Uint32Array : Array)(d.length / 2); if (1 === f.length) return e[d.pop().index] = 1, e; h = 0; for (l = d.length / 2; h < l; ++h) f[h] = d.pop(), g[h] = f[h].value; k = Ca(g, g.length, a); h = 0; for (l = f.length; h < l; ++h) e[f[h].index] = k[h]; return e }
    function Ca(b, a, c) {
        function d(b) { var c = h[b][l[b]]; c === a ? (d(b + 1), d(b + 1)) : --g[c]; ++l[b] } var e = new (B ? Uint16Array : Array)(c), f = new (B ? Uint8Array : Array)(c), g = new (B ? Uint8Array : Array)(a), k = Array(c), h = Array(c), l = Array(c), s = (1 << c) - a, p = 1 << c - 1, m, n, r, v, x; e[c - 1] = a; for (n = 0; n < c; ++n) s < p ? f[n] = 0 : (f[n] = 1, s -= p), s <<= 1, e[c - 2 - n] = (e[c - 1 - n] / 2 | 0) + a; e[0] = f[0]; k[0] = Array(e[0]); h[0] = Array(e[0]); for (n = 1; n < c; ++n) e[n] > 2 * e[n - 1] + f[n] && (e[n] = 2 * e[n - 1] + f[n]), k[n] = Array(e[n]), h[n] = Array(e[n]); for (m = 0; m < a; ++m) g[m] = c; for (r = 0; r < e[c - 1]; ++r) k[c -
        1][r] = b[r], h[c - 1][r] = r; for (m = 0; m < c; ++m) l[m] = 0; 1 === f[c - 1] && (--g[0], ++l[c - 1]); for (n = c - 2; 0 <= n; --n) { v = m = 0; x = l[n + 1]; for (r = 0; r < e[n]; r++) v = k[n + 1][x] + k[n + 1][x + 1], v > b[m] ? (k[n][r] = v, h[n][r] = a, x += 2) : (k[n][r] = b[m], h[n][r] = m, ++m); l[n] = 0; 1 === f[n] && d(n) } return g
    }
    function va(b) { var a = new (B ? Uint16Array : Array)(b.length), c = [], d = [], e = 0, f, g, k, h; f = 0; for (g = b.length; f < g; f++) c[b[f]] = (c[b[f]] | 0) + 1; f = 1; for (g = 16; f <= g; f++) d[f] = e, e += c[f] | 0, e <<= 1; f = 0; for (g = b.length; f < g; f++) { e = d[b[f]]; d[b[f]] += 1; k = a[f] = 0; for (h = b[f]; k < h; k++) a[f] = a[f] << 1 | e & 1, e >>>= 1 } return a }; function Da(b, a) { this.input = b; this.b = this.c = 0; this.i = {}; a && (a.flags && (this.i = a.flags), "string" === typeof a.filename && (this.filename = a.filename), "string" === typeof a.comment && (this.A = a.comment), a.deflateOptions && (this.l = a.deflateOptions)); this.l || (this.l = {}) }
    Da.prototype.g = function () {
        var b, a, c, d, e, f, g, k, h = new (B ? Uint8Array : Array)(32768), l = 0, s = this.input, p = this.c, m = this.filename, n = this.A; h[l++] = 31; h[l++] = 139; h[l++] = 8; b = 0; this.i.fname && (b |= Ea); this.i.fcomment && (b |= Fa); this.i.fhcrc && (b |= Ga); h[l++] = b; a = (Date.now ? Date.now() : +new Date) / 1E3 | 0; h[l++] = a & 255; h[l++] = a >>> 8 & 255; h[l++] = a >>> 16 & 255; h[l++] = a >>> 24 & 255; h[l++] = 0; h[l++] = Ha; if (this.i.fname !== t) { g = 0; for (k = m.length; g < k; ++g) f = m.charCodeAt(g), 255 < f && (h[l++] = f >>> 8 & 255), h[l++] = f & 255; h[l++] = 0 } if (this.i.comment) {
            g =
            0; for (k = n.length; g < k; ++g) f = n.charCodeAt(g), 255 < f && (h[l++] = f >>> 8 & 255), h[l++] = f & 255; h[l++] = 0
        } this.i.fhcrc && (c = ja(h, 0, l) & 65535, h[l++] = c & 255, h[l++] = c >>> 8 & 255); this.l.outputBuffer = h; this.l.outputIndex = l; e = new na(s, this.l); h = e.g(); l = e.b; B && (l + 8 > h.buffer.byteLength ? (this.a = new Uint8Array(l + 8), this.a.set(new Uint8Array(h.buffer)), h = this.a) : h = new Uint8Array(h.buffer)); d = ja(s, t, t); h[l++] = d & 255; h[l++] = d >>> 8 & 255; h[l++] = d >>> 16 & 255; h[l++] = d >>> 24 & 255; k = s.length; h[l++] = k & 255; h[l++] = k >>> 8 & 255; h[l++] = k >>> 16 & 255; h[l++] =
        k >>> 24 & 255; this.c = p; B && l < h.length && (this.a = h = h.subarray(0, l)); return h
    }; var Ha = 255, Ga = 2, Ea = 8, Fa = 16; A("Zlib.Gzip", Da); A("Zlib.Gzip.prototype.compress", Da.prototype.g); function T(b, a) { this.p = []; this.q = 32768; this.e = this.j = this.c = this.u = 0; this.input = B ? new Uint8Array(b) : b; this.w = !1; this.r = Ia; this.M = !1; if (a || !(a = {})) a.index && (this.c = a.index), a.bufferSize && (this.q = a.bufferSize), a.bufferType && (this.r = a.bufferType), a.resize && (this.M = a.resize); switch (this.r) { case Ja: this.b = 32768; this.a = new (B ? Uint8Array : Array)(32768 + this.q + 258); break; case Ia: this.b = 0; this.a = new (B ? Uint8Array : Array)(this.q); this.f = this.U; this.B = this.R; this.s = this.T; break; default: q(Error("invalid inflate mode")) } }
    var Ja = 0, Ia = 1, Ya = { O: Ja, N: Ia };
    T.prototype.h = function () {
        for (; !this.w;) {
            var b = U(this, 3); b & 1 && (this.w = u); b >>>= 1; switch (b) {
                case 0: var a = this.input, c = this.c, d = this.a, e = this.b, f = a.length, g = t, k = t, h = d.length, l = t; this.e = this.j = 0; c + 1 >= f && q(Error("invalid uncompressed block header: LEN")); g = a[c++] | a[c++] << 8; c + 1 >= f && q(Error("invalid uncompressed block header: NLEN")); k = a[c++] | a[c++] << 8; g === ~k && q(Error("invalid uncompressed block header: length verify")); c + g > a.length && q(Error("input buffer is broken")); switch (this.r) {
                    case Ja: for (; e + g > d.length;) {
                        l =
                        h - e; g -= l; if (B) d.set(a.subarray(c, c + l), e), e += l, c += l; else for (; l--;) d[e++] = a[c++]; this.b = e; d = this.f(); e = this.b
                    } break; case Ia: for (; e + g > d.length;) d = this.f({ F: 2 }); break; default: q(Error("invalid inflate mode"))
                } if (B) d.set(a.subarray(c, c + g), e), e += g, c += g; else for (; g--;) d[e++] = a[c++]; this.c = c; this.b = e; this.a = d; break; case 1: this.s(Za, $a); break; case 2: ab(this); break; default: q(Error("unknown BTYPE: " + b))
            }
        } return this.B()
    };
    var bb = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cb = B ? new Uint16Array(bb) : bb, db = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258], eb = B ? new Uint16Array(db) : db, fb = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0], gb = B ? new Uint8Array(fb) : fb, hb = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], ib = B ? new Uint16Array(hb) : hb, jb = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
    10, 11, 11, 12, 12, 13, 13], kb = B ? new Uint8Array(jb) : jb, lb = new (B ? Uint8Array : Array)(288), V, mb; V = 0; for (mb = lb.length; V < mb; ++V) lb[V] = 143 >= V ? 8 : 255 >= V ? 9 : 279 >= V ? 7 : 8; var Za = ma(lb), nb = new (B ? Uint8Array : Array)(30), ob, qb; ob = 0; for (qb = nb.length; ob < qb; ++ob) nb[ob] = 5; var $a = ma(nb); function U(b, a) { for (var c = b.j, d = b.e, e = b.input, f = b.c, g = e.length, k; d < a;) f >= g && q(Error("input buffer is broken")), c |= e[f++] << d, d += 8; k = c & (1 << a) - 1; b.j = c >>> a; b.e = d - a; b.c = f; return k }
    function rb(b, a) { for (var c = b.j, d = b.e, e = b.input, f = b.c, g = e.length, k = a[0], h = a[1], l, s; d < h && !(f >= g) ;) c |= e[f++] << d, d += 8; l = k[c & (1 << h) - 1]; s = l >>> 16; b.j = c >> s; b.e = d - s; b.c = f; return l & 65535 }
    function ab(b) {
        function a(a, b, c) { var d, e = this.J, f, g; for (g = 0; g < a;) switch (d = rb(this, b), d) { case 16: for (f = 3 + U(this, 2) ; f--;) c[g++] = e; break; case 17: for (f = 3 + U(this, 3) ; f--;) c[g++] = 0; e = 0; break; case 18: for (f = 11 + U(this, 7) ; f--;) c[g++] = 0; e = 0; break; default: e = c[g++] = d } this.J = e; return c } var c = U(b, 5) + 257, d = U(b, 5) + 1, e = U(b, 4) + 4, f = new (B ? Uint8Array : Array)(cb.length), g, k, h, l; for (l = 0; l < e; ++l) f[cb[l]] = U(b, 3); if (!B) { l = e; for (e = f.length; l < e; ++l) f[cb[l]] = 0 } g = ma(f); k = new (B ? Uint8Array : Array)(c); h = new (B ? Uint8Array : Array)(d);
        b.J = 0; b.s(ma(a.call(b, c, g, k)), ma(a.call(b, d, g, h)))
    } T.prototype.s = function (b, a) { var c = this.a, d = this.b; this.C = b; for (var e = c.length - 258, f, g, k, h; 256 !== (f = rb(this, b)) ;) if (256 > f) d >= e && (this.b = d, c = this.f(), d = this.b), c[d++] = f; else { g = f - 257; h = eb[g]; 0 < gb[g] && (h += U(this, gb[g])); f = rb(this, a); k = ib[f]; 0 < kb[f] && (k += U(this, kb[f])); d >= e && (this.b = d, c = this.f(), d = this.b); for (; h--;) c[d] = c[d++ - k] } for (; 8 <= this.e;) this.e -= 8, this.c--; this.b = d };
    T.prototype.T = function (b, a) { var c = this.a, d = this.b; this.C = b; for (var e = c.length, f, g, k, h; 256 !== (f = rb(this, b)) ;) if (256 > f) d >= e && (c = this.f(), e = c.length), c[d++] = f; else { g = f - 257; h = eb[g]; 0 < gb[g] && (h += U(this, gb[g])); f = rb(this, a); k = ib[f]; 0 < kb[f] && (k += U(this, kb[f])); d + h > e && (c = this.f(), e = c.length); for (; h--;) c[d] = c[d++ - k] } for (; 8 <= this.e;) this.e -= 8, this.c--; this.b = d };
    T.prototype.f = function () { var b = new (B ? Uint8Array : Array)(this.b - 32768), a = this.b - 32768, c, d, e = this.a; if (B) b.set(e.subarray(32768, b.length)); else { c = 0; for (d = b.length; c < d; ++c) b[c] = e[c + 32768] } this.p.push(b); this.u += b.length; if (B) e.set(e.subarray(a, a + 32768)); else for (c = 0; 32768 > c; ++c) e[c] = e[a + c]; this.b = 32768; return e };
    T.prototype.U = function (b) { var a, c = this.input.length / this.c + 1 | 0, d, e, f, g = this.input, k = this.a; b && ("number" === typeof b.F && (c = b.F), "number" === typeof b.P && (c += b.P)); 2 > c ? (d = (g.length - this.c) / this.C[2], f = 258 * (d / 2) | 0, e = f < k.length ? k.length + f : k.length << 1) : e = k.length * c; B ? (a = new Uint8Array(e), a.set(k)) : a = k; return this.a = a };
    T.prototype.B = function () { var b = 0, a = this.a, c = this.p, d, e = new (B ? Uint8Array : Array)(this.u + (this.b - 32768)), f, g, k, h; if (0 === c.length) return B ? this.a.subarray(32768, this.b) : this.a.slice(32768, this.b); f = 0; for (g = c.length; f < g; ++f) { d = c[f]; k = 0; for (h = d.length; k < h; ++k) e[b++] = d[k] } f = 32768; for (g = this.b; f < g; ++f) e[b++] = a[f]; this.p = []; return this.buffer = e };
    T.prototype.R = function () { var b, a = this.b; B ? this.M ? (b = new Uint8Array(a), b.set(this.a.subarray(0, a))) : b = this.a.subarray(0, a) : (this.a.length > a && (this.a.length = a), b = this.a); return this.buffer = b }; function sb(b) { this.input = b; this.c = 0; this.t = []; this.D = !1 } sb.prototype.X = function () { this.D || this.h(); return this.t.slice() };
    sb.prototype.h = function () {
        for (var b = this.input.length; this.c < b;) {
            var a = new P, c = t, d = t, e = t, f = t, g = t, k = t, h = t, l = t, s = t, p = this.input, m = this.c; a.G = p[m++]; a.H = p[m++]; (31 !== a.G || 139 !== a.H) && q(Error("invalid file signature:" + a.G + "," + a.H)); a.z = p[m++]; switch (a.z) { case 8: break; default: q(Error("unknown compression method: " + a.z)) } a.n = p[m++]; l = p[m++] | p[m++] << 8 | p[m++] << 16 | p[m++] << 24; a.Z = new Date(1E3 * l); a.fa = p[m++]; a.ea = p[m++]; 0 < (a.n & 4) && (a.aa = p[m++] | p[m++] << 8, m += a.aa); if (0 < (a.n & Ea)) {
                h = []; for (k = 0; 0 < (g = p[m++]) ;) h[k++] =
                String.fromCharCode(g); a.name = h.join("")
            } if (0 < (a.n & Fa)) { h = []; for (k = 0; 0 < (g = p[m++]) ;) h[k++] = String.fromCharCode(g); a.A = h.join("") } 0 < (a.n & Ga) && (a.S = ja(p, 0, m) & 65535, a.S !== (p[m++] | p[m++] << 8) && q(Error("invalid header crc16"))); c = p[p.length - 4] | p[p.length - 3] << 8 | p[p.length - 2] << 16 | p[p.length - 1] << 24; p.length - m - 4 - 4 < 512 * c && (f = c); d = new T(p, { index: m, bufferSize: f }); a.data = e = d.h(); m = d.c; a.ca = s = (p[m++] | p[m++] << 8 | p[m++] << 16 | p[m++] << 24) >>> 0; ja(e, t, t) !== s && q(Error("invalid CRC-32 checksum: 0x" + ja(e, t, t).toString(16) +
            " / 0x" + s.toString(16))); a.da = c = (p[m++] | p[m++] << 8 | p[m++] << 16 | p[m++] << 24) >>> 0; (e.length & 4294967295) !== c && q(Error("invalid input size: " + (e.length & 4294967295) + " / " + c)); this.t.push(a); this.c = m
        } this.D = u; var n = this.t, r, v, x = 0, Q = 0, y; r = 0; for (v = n.length; r < v; ++r) Q += n[r].data.length; if (B) { y = new Uint8Array(Q); for (r = 0; r < v; ++r) y.set(n[r].data, x), x += n[r].data.length } else { y = []; for (r = 0; r < v; ++r) y[r] = n[r].data; y = Array.prototype.concat.apply([], y) } return y
    }; A("Zlib.Gunzip", sb); A("Zlib.Gunzip.prototype.decompress", sb.prototype.h); A("Zlib.Gunzip.prototype.getMembers", sb.prototype.X); function tb(b) { if ("string" === typeof b) { var a = b.split(""), c, d; c = 0; for (d = a.length; c < d; c++) a[c] = (a[c].charCodeAt(0) & 255) >>> 0; b = a } for (var e = 1, f = 0, g = b.length, k, h = 0; 0 < g;) { k = 1024 < g ? 1024 : g; g -= k; do e += b[h++], f += e; while (--k); e %= 65521; f %= 65521 } return (f << 16 | e) >>> 0 }; function ub(b, a) { var c, d; this.input = b; this.c = 0; if (a || !(a = {})) a.index && (this.c = a.index), a.verify && (this.$ = a.verify); c = b[this.c++]; d = b[this.c++]; switch (c & 15) { case vb: this.method = vb; break; default: q(Error("unsupported compression method")) } 0 !== ((c << 8) + d) % 31 && q(Error("invalid fcheck flag:" + ((c << 8) + d) % 31)); d & 32 && q(Error("fdict flag is not supported")); this.L = new T(b, { index: this.c, bufferSize: a.bufferSize, bufferType: a.bufferType, resize: a.resize }) }
    ub.prototype.h = function () { var b = this.input, a, c; a = this.L.h(); this.c = this.L.c; this.$ && (c = (b[this.c++] << 24 | b[this.c++] << 16 | b[this.c++] << 8 | b[this.c++]) >>> 0, c !== tb(a) && q(Error("invalid adler-32 checksum"))); return a }; var vb = 8; function wb(b, a) { this.input = b; this.a = new (B ? Uint8Array : Array)(32768); this.k = W.o; var c = {}, d; if ((a || !(a = {})) && "number" === typeof a.compressionType) this.k = a.compressionType; for (d in a) c[d] = a[d]; c.outputBuffer = this.a; this.K = new na(this.input, c) } var W = ra;
    wb.prototype.g = function () {
        var b, a, c, d, e, f, g, k = 0; g = this.a; b = vb; switch (b) { case vb: a = Math.LOG2E * Math.log(32768) - 8; break; default: q(Error("invalid compression method")) } c = a << 4 | b; g[k++] = c; switch (b) { case vb: switch (this.k) { case W.NONE: e = 0; break; case W.v: e = 1; break; case W.o: e = 2; break; default: q(Error("unsupported compression type")) } break; default: q(Error("invalid compression method")) } d = e << 6 | 0; g[k++] = d | 31 - (256 * c + d) % 31; f = tb(this.input); this.K.b = k; g = this.K.g(); k = g.length; B && (g = new Uint8Array(g.buffer), g.length <=
        k + 4 && (this.a = new Uint8Array(g.length + 4), this.a.set(g), g = this.a), g = g.subarray(0, k + 4)); g[k++] = f >> 24 & 255; g[k++] = f >> 16 & 255; g[k++] = f >> 8 & 255; g[k++] = f & 255; return g
    }; function xb(b, a) { var c, d, e, f; if (Object.keys) c = Object.keys(a); else for (d in c = [], e = 0, a) c[e++] = d; e = 0; for (f = c.length; e < f; ++e) d = c[e], A(b + "." + d, a[d]) }; A("Zlib.Inflate", ub); A("Zlib.Inflate.prototype.decompress", ub.prototype.h); xb("Zlib.Inflate.BufferType", { ADAPTIVE: Ya.N, BLOCK: Ya.O }); A("Zlib.Deflate", wb); A("Zlib.Deflate.compress", function (b, a) { return (new wb(b, a)).g() }); A("Zlib.Deflate.prototype.compress", wb.prototype.g); xb("Zlib.Deflate.CompressionType", { NONE: W.NONE, FIXED: W.v, DYNAMIC: W.o });
}).call(__LiteMolZlib); 
var LiteMolZlib = __LiteMolZlib.Zlib;


var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        Bootstrap.VERSION = { number: "1.1.0", date: "Aug 30 2016" };
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        Bootstrap.Immutable = __LiteMolImmutable;
        Bootstrap.Rx = LiteMol.Core.Rx;
        Bootstrap.Promise = LiteMol.Core.Promise;
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            "use strict";
            function readStringFromFile(file) {
                return readFromFileInternal(file, false);
            }
            Utils.readStringFromFile = readStringFromFile;
            function readArrayBufferFromFile(file) {
                return readFromFileInternal(file, true);
            }
            Utils.readArrayBufferFromFile = readArrayBufferFromFile;
            function readFromFile(file, type) {
                return readFromFileInternal(file, type === 'Binary');
            }
            Utils.readFromFile = readFromFile;
            function ajaxGetString(url) {
                return ajaxGetInternal(url, false);
            }
            Utils.ajaxGetString = ajaxGetString;
            function ajaxGetArrayBuffer(url) {
                return ajaxGetInternal(url, true);
            }
            Utils.ajaxGetArrayBuffer = ajaxGetArrayBuffer;
            function ajaxGet(url, type) {
                return ajaxGetInternal(url, type === 'Binary');
            }
            Utils.ajaxGet = ajaxGet;
            var __chars = function () {
                var data = [];
                for (var i = 0; i < 256; i++)
                    data[i] = String.fromCharCode(i);
                return data;
            }();
            function decompress(buffer) {
                var gzip = new LiteMolZlib.Gunzip(new Uint8Array(buffer));
                return gzip.decompress();
            }
            function toString(data) {
                var chars = __chars;
                var str = [], chunk = [], chunkSize = 512;
                for (var o = 0, _l = data.length; o < _l; o += chunkSize) {
                    var k = 0;
                    for (var i = o, _i = Math.min(o + chunkSize, _l); i < _i; i++) {
                        chunk[k++] = chars[data[i]];
                    }
                    if (k < chunkSize) {
                        str[str.length] = chunk.splice(0, k).join('');
                    }
                    else {
                        str[str.length] = chunk.join('');
                    }
                }
                return str.join('');
            }
            function processFile(ctx, asArrayBuffer, compressed, e) {
                try {
                    var data_1 = e.target.result;
                    if (compressed) {
                        ctx.update('Decompressing...');
                        ctx.schedule(function () {
                            var decompressed = decompress(data_1);
                            if (asArrayBuffer) {
                                ctx.resolve(decompressed.buffer);
                            }
                            else {
                                ctx.resolve(toString(decompressed));
                            }
                        }, 1000 / 30);
                    }
                    else {
                        ctx.resolve(data_1);
                    }
                }
                catch (e) {
                    ctx.reject(e);
                }
            }
            function handleProgress(ctx, action, data, asArrayBuffer, onLoad) {
                ctx.update(action);
                data.onerror = function (e) {
                    var error = e.target.error;
                    return ctx.reject(error ? error : 'Failed.');
                };
                data.onabort = function () { return ctx.abort(); };
                var abort = function () { return data.abort(); };
                data.onprogress = function (e) {
                    if (e.lengthComputable) {
                        ctx.update(action, abort, e.loaded, e.total);
                    }
                    else {
                        ctx.update(action + " " + (e.loaded / 1024 / 1024).toFixed(2) + " MB", abort);
                    }
                };
                data.onload = onLoad;
            }
            function readFromFileInternal(file, asArrayBuffer) {
                return Bootstrap.Task.fromComputation('Open File', 'Background', LiteMol.Core.Computation.create(function (ctx) {
                    var reader = new FileReader();
                    var isCompressed = /\.gz$/i.test(file.name);
                    handleProgress(ctx, 'Reading...', reader, asArrayBuffer, function (e) { return processFile(ctx, asArrayBuffer, isCompressed, e); });
                    if (isCompressed || asArrayBuffer)
                        reader.readAsArrayBuffer(file);
                    else
                        reader.readAsBinaryString(file);
                }));
            }
            var RequestPool = (function () {
                function RequestPool() {
                }
                RequestPool.get = function () {
                    if (this.pool.length)
                        return this.pool.pop();
                    return new XMLHttpRequest();
                };
                RequestPool.emptyFunc = function () { };
                RequestPool.deposit = function (req) {
                    if (this.pool.length < this.poolSize) {
                        req.onabort = RequestPool.emptyFunc;
                        req.onerror = RequestPool.emptyFunc;
                        req.onload = RequestPool.emptyFunc;
                        req.onprogress = RequestPool.emptyFunc;
                        this.pool.push();
                    }
                };
                RequestPool.pool = [];
                RequestPool.poolSize = 15;
                return RequestPool;
            }());
            function processAjax(ctx, asArrayBuffer, e) {
                var req = e.target;
                if (req.status >= 200 && req.status < 400) {
                    if (asArrayBuffer)
                        ctx.resolve(e.target.response);
                    else
                        ctx.resolve(e.target.responseText);
                }
                else {
                    ctx.reject(req.statusText);
                }
                RequestPool.deposit(e.target);
            }
            function ajaxGetInternal(url, asArrayBuffer) {
                return Bootstrap.Task.fromComputation('Download', 'Background', LiteMol.Core.Computation.create(function (ctx) {
                    var xhttp = RequestPool.get();
                    ctx.update('Waiting for server...', function () { return xhttp.abort(); });
                    handleProgress(ctx, 'Downloading...', xhttp, asArrayBuffer, function (e) { return processAjax(ctx, asArrayBuffer, e); });
                    xhttp.open('get', url, true);
                    xhttp.responseType = asArrayBuffer ? "arraybuffer" : "text";
                    xhttp.send();
                }));
            }
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            var Query;
            (function (Query) {
                "use strict";
                var residueIdRegex = /^\s*([1-9][0-9]*)\s+([_.;:""&<>()/\{}'`~!@#$%A-Za-z0-9*|+-]+)(?:\s+i[:]([.]|[a-zA-Z0-9]))?(?:\s+e[:]([.]|[a-zA-Z0-9]+))?/;
                function normalizeId(id) {
                    if (!id || id === '.' || id === '?')
                        return null;
                    return id;
                }
                function getAuthResidueIdParams(id) {
                    var match = id.match(residueIdRegex);
                    if (!match)
                        return void 0;
                    var authSeqNumber = +match[1] | 0;
                    var authAsymId = normalizeId(match[2]);
                    var insCode = normalizeId(match[3]);
                    var entityId = normalizeId(match[4]);
                    return { entityId: entityId, authSeqNumber: authSeqNumber, authAsymId: authAsymId, insCode: insCode };
                }
                function parseAuthResidueId(ids, separator) {
                    if (separator === void 0) { separator = ','; }
                    var parts = ids.split(separator).map(function (p) { return getAuthResidueIdParams(p); }).filter(function (p) { return !!p; });
                    return LiteMol.Core.Structure.Query.Builder.toQuery((_a = LiteMol.Core.Structure.Query).residues.apply(_a, parts));
                    var _a;
                }
                Query.parseAuthResidueId = parseAuthResidueId;
            })(Query = Utils.Query || (Utils.Query = {}));
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            var Query;
            (function (Query) {
                "use strict";
                var ValueOrError = (function () {
                    function ValueOrError(isError, value, error) {
                        this.isError = isError;
                        this.value = value;
                        this.error = error;
                    }
                    ValueOrError.prototype.bind = function (f) {
                        if (this.isError)
                            return this;
                        return f(this.value);
                    };
                    return ValueOrError;
                }());
                Query.ValueOrError = ValueOrError;
                var ValueOrError;
                (function (ValueOrError) {
                    function error(err) {
                        return new ValueOrError(true, void 0, err);
                    }
                    ValueOrError.error = error;
                    function value(v) {
                        return new ValueOrError(true, v);
                    }
                    ValueOrError.value = value;
                })(ValueOrError = Query.ValueOrError || (Query.ValueOrError = {}));
            })(Query = Utils.Query || (Utils.Query = {}));
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            "use strict";
            var LinkedList = (function () {
                function LinkedList() {
                    this.first = null;
                    this.last = null;
                }
                LinkedList.prototype.addFirst = function (item) {
                    item.inList = true;
                    if (this.first)
                        this.first.previous = item;
                    item.next = this.first;
                    this.first = item;
                };
                LinkedList.prototype.addLast = function (item) {
                    if (this.last != null) {
                        this.last.next = item;
                    }
                    item.previous = this.last;
                    this.last = item;
                    if (this.first == null) {
                        this.first = item;
                    }
                    item.inList = true;
                };
                LinkedList.prototype.remove = function (item) {
                    if (!item.inList)
                        return;
                    item.inList = false;
                    if (item.previous !== null) {
                        item.previous.next = item.next;
                    }
                    else if (item.previous === null) {
                        this.first = item.next;
                    }
                    if (item.next !== null) {
                        item.next.previous = item.previous;
                    }
                    else if (item.next === null) {
                        this.last = item.previous;
                    }
                    item.next = null;
                    item.previous = null;
                };
                return LinkedList;
            }());
            Utils.LinkedList = LinkedList;
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            "use strict";
            function padTime(n) { return (n < 10 ? '0' : '') + n; }
            function formatTime(d) {
                var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                return h + ":" + padTime(m) + ":" + padTime(s);
            }
            Utils.formatTime = formatTime;
            function round(n, d) {
                var f = Math.pow(10, d);
                return Math.round(f * n) / f;
            }
            Utils.round = round;
            function formatProgress(p) {
                if (p.isIndeterminate)
                    return p.message;
                var x = (100 * p.current / p.max).toFixed(2);
                return p.message + " " + x + "%";
            }
            Utils.formatProgress = formatProgress;
            function generateUUID() {
                var d = new Date().getTime();
                if (window.performance && typeof window.performance.now === "function") {
                    d += performance.now();
                    ; //use high-precision timer if available
                }
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
                return uuid;
            }
            Utils.generateUUID = generateUUID;
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            "use strict";
            var VDWRadii = undefined;
            function vdwRadiusFromElementSymbol(model) {
                if (!VDWRadii)
                    VDWRadii = createVdwRadii();
                return function (names, radii) {
                    return function (i) {
                        var r = radii.get(names[i]);
                        if (r !== void 0)
                            return r;
                        return 1.0;
                    };
                }(model.atoms.elementSymbol, VDWRadii);
            }
            Utils.vdwRadiusFromElementSymbol = vdwRadiusFromElementSymbol;
            function createVdwRadii() {
                var vdwRadii = {
                    "H": 1.1,
                    "He": 1.4,
                    "Li": 1.81,
                    "Be": 1.53,
                    "B": 1.92,
                    "C": 1.7,
                    "N": 1.55,
                    "O": 1.52,
                    "F": 1.47,
                    "Ne": 1.54,
                    "Na": 2.27,
                    "Mg": 1.73,
                    "Al": 1.84,
                    "Si": 2.1,
                    "P": 1.8,
                    "S": 1.8,
                    "Cl": 1.75,
                    "Ar": 1.88,
                    "K": 2.75,
                    "Ca": 2.31,
                    "Sc": 2.16,
                    "Ti": 1.87,
                    "V": 1.79,
                    "Cr": 1.89,
                    "Mn": 1.97,
                    "Fe": 1.94,
                    "Co": 1.92,
                    "Ni": 1.84,
                    "Cu": 1.86,
                    "Zn": 2.1,
                    "Ga": 1.87,
                    "Ge": 2.11,
                    "As": 1.85,
                    "Se": 1.9,
                    "Br": 1.83,
                    "Kr": 2.02,
                    "Rb": 3.03,
                    "Sr": 2.49,
                    "Y": 2.19,
                    "Zr": 1.86,
                    "Nb": 2.07,
                    "Mo": 2.09,
                    "Tc": 2.09,
                    "Ru": 2.07,
                    "Rh": 1.95,
                    "Pd": 2.02,
                    "Ag": 2.03,
                    "Cd": 2.3,
                    "In": 1.93,
                    "Sn": 2.17,
                    "Sb": 2.06,
                    "Te": 2.06,
                    "I": 1.98,
                    "Xe": 2.16,
                    "Cs": 3.43,
                    "Ba": 2.68,
                    "La": 2.4,
                    "Ce": 2.35,
                    "Pr": 2.39,
                    "Nd": 2.29,
                    "Pm": 2.36,
                    "Sm": 2.29,
                    "Eu": 2.33,
                    "Gd": 2.37,
                    "Tb": 2.21,
                    "Dy": 2.29,
                    "Ho": 2.16,
                    "Er": 2.35,
                    "Tm": 2.27,
                    "Yb": 2.42,
                    "Lu": 2.21,
                    "Hf": 2.12,
                    "Ta": 2.17,
                    "W": 2.1,
                    "Re": 2.17,
                    "Os": 2.16,
                    "Ir": 2.02,
                    "Pt": 2.09,
                    "Au": 2.17,
                    "Hg": 2.09,
                    "Tl": 1.96,
                    "Pb": 2.02,
                    "Bi": 2.07,
                    "Po": 1.97,
                    "At": 2.02,
                    "Rn": 2.2,
                    "Fr": 3.48,
                    "Ra": 2.83,
                    "Ac": 2.6,
                    "Th": 2.37,
                    "Pa": 2.43,
                    "U": 2.4,
                    "Np": 2.21,
                    "Pu": 2.43,
                    "Am": 2.44,
                    "Cm": 2.45,
                    "Bk": 2.44,
                    "Cf": 2.45,
                    "Es": 2.45,
                    "Fm": 2.45,
                    "Md": 2.46,
                    "No": 2.46,
                    "Lr": 2.46,
                };
                var ret = new Map();
                for (var e in vdwRadii) {
                    ret.set(e, vdwRadii[e]);
                    ret.set(e.toUpperCase(), vdwRadii[e]);
                    ret.set(e.toLowerCase(), vdwRadii[e]);
                }
                return ret;
            }
            ;
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            "use strict";
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            function shallowClone(o) {
                return LiteMol.Core.Utils.extend({}, o);
            }
            Utils.shallowClone = shallowClone;
            // // uses keys' keys to obtain values from source and return a new object
            // export function pickValues<S, T>(keys: S, source: T): S {
            //     let ret = <any>{};
            //     for (let k of Object.keys(keys)) {
            //         if (hasOwnProperty.call(keys, k)) ret[k] = (source as any)[k];
            //     }
            //     return ret;
            // };
            function shallowEqual(a, b) {
                if (!a) {
                    if (!b)
                        return true;
                    return false;
                }
                if (!b)
                    return false;
                var keys = Object.keys(a);
                if (Object.keys(b).length !== keys.length)
                    return false;
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var k = keys_1[_i];
                    if (!hasOwnProperty.call(a, k) || a[k] !== b[k])
                        return false;
                }
                return true;
            }
            Utils.shallowEqual = shallowEqual;
            function deepEqual(a, b) {
                if (!a) {
                    if (!b)
                        return true;
                    return false;
                }
                if (!b)
                    return false;
                var keys = Object.keys(a);
                if (Object.keys(b).length !== keys.length)
                    return false;
                for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                    var k = keys_2[_i];
                    if (!hasOwnProperty.call(a, k))
                        return false;
                    var u = a[k];
                    var v = b[k];
                    if (typeof u === 'object' && typeof v === 'object') {
                        if (!deepEqual(u, v))
                            return false;
                    }
                    else if (u !== v)
                        return false;
                }
                return true;
            }
            Utils.deepEqual = deepEqual;
            function _assign(target) {
                for (var s = 1; s < arguments.length; s++) {
                    var from = arguments[s];
                    for (var _i = 0, _a = Object.keys(from); _i < _a.length; _i++) {
                        var key = _a[_i];
                        if (hasOwnProperty.call(from, key)) {
                            target[key] = from[key];
                        }
                    }
                }
                return target;
            }
            Utils.assign = Object.assign || _assign;
            function _shallowMerge1(source, update) {
                var changed = false;
                for (var _i = 0, _a = Object.keys(update); _i < _a.length; _i++) {
                    var k = _a[_i];
                    if (!hasOwnProperty.call(update, k))
                        continue;
                    if (update[k] !== source[k]) {
                        changed = true;
                        break;
                    }
                }
                if (!changed)
                    return source;
                return Utils.assign(shallowClone(source), update);
            }
            function _shallowMerge(source) {
                var ret = source;
                for (var s = 1; s < arguments.length; s++) {
                    if (!arguments[s])
                        continue;
                    ret = _shallowMerge1(source, arguments[s]);
                    if (ret !== source) {
                        for (var i = s + 1; i < arguments.length; i++) {
                            ret = Utils.assign(ret, arguments[i]);
                        }
                        break;
                    }
                }
                return ret;
            }
            Utils.merge = _shallowMerge;
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Utils;
        (function (Utils) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                function findModel(entity) {
                    return Bootstrap.Tree.Node.findClosestNodeOfType(entity, [Bootstrap.Entity.Molecule.Model]);
                }
                Molecule.findModel = findModel;
                function findMolecule(entity) {
                    return Bootstrap.Tree.Node.findClosestNodeOfType(entity, [Bootstrap.Entity.Molecule.Molecule]);
                }
                Molecule.findMolecule = findMolecule;
                function findQueryContext(entity) {
                    var source = Bootstrap.Tree.Node.findClosestNodeOfType(entity, [Bootstrap.Entity.Molecule.Model, Bootstrap.Entity.Molecule.Selection]);
                    if (Bootstrap.Entity.isMoleculeModel(source)) {
                        return source.props.model.queryContext;
                    }
                    else {
                        var cache = source.tree.context.entityCache;
                        var ctx = cache.get(source, Bootstrap.Entity.Cache.Keys.QueryContext);
                        if (ctx)
                            return ctx;
                        ctx = LiteMol.Core.Structure.Query.Context.ofAtomIndices(findModel(source).props.model, source.props.indices);
                        return cache.set(source, Bootstrap.Entity.Cache.Keys.QueryContext, ctx);
                    }
                }
                Molecule.findQueryContext = findQueryContext;
                function getDistance(mA, startAtomIndexA, endAtomIndexA, mB, startAtomIndexB, endAtomIndexB) {
                    var _a = mA.atoms, x = _a.x, y = _a.y, z = _a.z;
                    var bX = mB.atoms.x, bY = mB.atoms.y, bZ = mB.atoms.z;
                    var d = Number.POSITIVE_INFINITY;
                    for (var i = startAtomIndexA; i < endAtomIndexA; i++) {
                        for (var j = startAtomIndexB; j < endAtomIndexB; j++) {
                            var dx = x[i] - bX[j], dy = y[i] - bY[j], dz = z[i] - bZ[j];
                            d = Math.min(d, dx * dx + dy * dy + dz * dz);
                        }
                    }
                    return Math.sqrt(d);
                }
                Molecule.getDistance = getDistance;
                function getDistanceSet(mA, setA, mB, setB) {
                    var _a = mA.atoms, x = _a.x, y = _a.y, z = _a.z;
                    var bX = mB.atoms.x, bY = mB.atoms.y, bZ = mB.atoms.z;
                    var d = Number.POSITIVE_INFINITY;
                    for (var _i = 0, setA_1 = setA; _i < setA_1.length; _i++) {
                        var i = setA_1[_i];
                        for (var _c = 0, setB_1 = setB; _c < setB_1.length; _c++) {
                            var j = setB_1[_c];
                            var dx = x[i] - bX[j], dy = y[i] - bY[j], dz = z[i] - bZ[j];
                            d = Math.min(d, dx * dx + dy * dy + dz * dz);
                        }
                    }
                    return Math.sqrt(d);
                }
                Molecule.getDistanceSet = getDistanceSet;
                function getModelAndIndicesFromQuery(m, query) {
                    var model = findModel(m);
                    if (!model) {
                        console.warn('Could not find a model for query selection.');
                    }
                    var queryContext = findQueryContext(m);
                    try {
                        var q = LiteMol.Core.Structure.Query.Builder.toQuery(query);
                        return { model: model, indices: q(queryContext).unionAtomIndices(), queryContext: queryContext };
                    }
                    catch (e) {
                        console.error('Query Execution', e);
                        return {};
                    }
                }
                Molecule.getModelAndIndicesFromQuery = getModelAndIndicesFromQuery;
                function getResidueIndices(m, atom) {
                    var rI = m.atoms.residueIndex;
                    var idx = [];
                    for (var i = m.residues.atomStartIndex[rI[atom]], _b = m.residues.atomEndIndex[rI[atom]]; i < _b; i++) {
                        idx.push(i);
                    }
                    return idx;
                }
                Molecule.getResidueIndices = getResidueIndices;
                function getBox(molecule, atomIndices, delta) {
                    var atoms = molecule.atoms, atomCount = atoms.count, cCount = 0, x = atoms.x, y = atoms.y, z = atoms.z, min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
                    for (var _i = 0, atomIndices_1 = atomIndices; _i < atomIndices_1.length; _i++) {
                        var i = atomIndices_1[_i];
                        min[0] = Math.min(x[i], min[0]);
                        min[1] = Math.min(y[i], min[1]);
                        min[2] = Math.min(z[i], min[2]);
                        max[0] = Math.max(x[i], max[0]);
                        max[1] = Math.max(y[i], max[1]);
                        max[2] = Math.max(z[i], max[2]);
                    }
                    min[0] = min[0] - delta;
                    min[1] = min[1] - delta;
                    min[2] = min[2] - delta;
                    max[0] = max[0] + delta;
                    max[1] = max[1] + delta;
                    max[2] = max[2] + delta;
                    return {
                        bottomLeft: min,
                        topRight: max
                    };
                }
                Molecule.getBox = getBox;
                var CentroidHelper = (function () {
                    function CentroidHelper(model) {
                        this.model = model;
                        this.center = { x: 0, y: 0, z: 0 };
                        this.radiusSquared = 0;
                        this.count = 0;
                        this.x = model.atoms.x;
                        this.y = model.atoms.y;
                        this.z = model.atoms.z;
                    }
                    CentroidHelper.prototype.addAtom = function (i) {
                        this.count++;
                        this.center.x += this.x[i];
                        this.center.y += this.y[i];
                        this.center.z += this.z[i];
                    };
                    CentroidHelper.prototype.finishedAdding = function () {
                        this.center.x /= this.count;
                        this.center.y /= this.count;
                        this.center.z /= this.count;
                    };
                    CentroidHelper.prototype.radiusVisit = function (i) {
                        var dx = this.center.x - this.x[i], dy = this.center.y - this.y[i], dz = this.center.z - this.z[i];
                        this.radiusSquared = Math.max(this.radiusSquared, dx * dx + dy * dy + dz * dz);
                    };
                    return CentroidHelper;
                }());
                Molecule.CentroidHelper = CentroidHelper;
                function getCentroidAndRadius(m, indices, into) {
                    into.x = 0;
                    into.y = 0;
                    into.z = 0;
                    var _a = m.atoms, x = _a.x, y = _a.y, z = _a.z;
                    for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                        var i = indices_1[_i];
                        into.x += x[i];
                        into.y += y[i];
                        into.z += z[i];
                    }
                    var c = indices.length;
                    into.x /= c;
                    into.y /= c;
                    into.z /= c;
                    var radius = 0;
                    for (var _c = 0, indices_2 = indices; _c < indices_2.length; _c++) {
                        var i = indices_2[_c];
                        var dx = into.x - x[i], dy = into.y - y[i], dz = into.z - z[i];
                        radius = Math.max(radius, dx * dx + dy * dy + dz * dz);
                    }
                    return Math.sqrt(radius);
                }
                Molecule.getCentroidAndRadius = getCentroidAndRadius;
            })(Molecule = Utils.Molecule || (Utils.Molecule = {}));
        })(Utils = Bootstrap.Utils || (Bootstrap.Utils = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Service;
        (function (Service) {
            "use strict";
            var Dispatcher = (function () {
                function Dispatcher() {
                    this.LOG_DISPATCH_STREAM = false;
                    this.lanes = [];
                    for (var i = 0; i <= Dispatcher.Lane.Task; i++) {
                        this.lanes.push(new Bootstrap.Rx.Subject());
                    }
                }
                Dispatcher.prototype.dispatch = function (event) {
                    if (this.LOG_DISPATCH_STREAM)
                        console.log(event.type.name, Dispatcher.Lane[event.type.lane], event.data);
                    this.lanes[event.type.lane].onNext(event);
                };
                Dispatcher.prototype.schedule = function (action, onError, timeout) {
                    if (timeout === void 0) { timeout = 1000 / 31; }
                    return setTimeout(function () {
                        if (onError) {
                            try {
                                action.call(null);
                            }
                            catch (e) {
                                onError.call(null, '' + e);
                            }
                        }
                        else {
                            action.call(null);
                        }
                    }, timeout);
                };
                Dispatcher.prototype.getStream = function (type) {
                    return this.lanes[type.lane].filter(function (e) { return e.type === type; });
                };
                Dispatcher.prototype.finished = function () {
                    this.lanes.forEach(function (l) { return l.onCompleted(); });
                };
                return Dispatcher;
            }());
            Service.Dispatcher = Dispatcher;
            var Dispatcher;
            (function (Dispatcher) {
                (function (Lane) {
                    Lane[Lane["Slow"] = 0] = "Slow";
                    Lane[Lane["Fast"] = 1] = "Fast";
                    Lane[Lane["Log"] = 2] = "Log";
                    Lane[Lane["Busy"] = 3] = "Busy";
                    Lane[Lane["Transformer"] = 4] = "Transformer";
                    Lane[Lane["Task"] = 5] = "Task";
                })(Dispatcher.Lane || (Dispatcher.Lane = {}));
                var Lane = Dispatcher.Lane;
            })(Dispatcher = Service.Dispatcher || (Service.Dispatcher = {}));
        })(Service = Bootstrap.Service || (Bootstrap.Service = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Service;
        (function (Service) {
            "use strict";
            var Logger = (function () {
                function Logger(context) {
                    this.context = context;
                }
                Logger.prototype.log = function (e) {
                    Bootstrap.Event.Log.dispatch(this.context, e);
                };
                Logger.prototype.message = function (m) {
                    this.log({ type: Logger.EntryType.Message, timestamp: new Date(), message: m });
                };
                Logger.prototype.error = function (m) {
                    this.log({ type: Logger.EntryType.Error, timestamp: new Date(), message: m });
                };
                Logger.prototype.warning = function (m) {
                    this.log({ type: Logger.EntryType.Warning, timestamp: new Date(), message: m });
                };
                Logger.prototype.info = function (m) {
                    this.log({ type: Logger.EntryType.Info, timestamp: new Date(), message: m });
                };
                return Logger;
            }());
            Service.Logger = Logger;
            var Logger;
            (function (Logger) {
                (function (EntryType) {
                    EntryType[EntryType["Message"] = 0] = "Message";
                    EntryType[EntryType["Error"] = 1] = "Error";
                    EntryType[EntryType["Warning"] = 2] = "Warning";
                    EntryType[EntryType["Info"] = 3] = "Info";
                })(Logger.EntryType || (Logger.EntryType = {}));
                var EntryType = Logger.EntryType;
            })(Logger = Service.Logger || (Service.Logger = {}));
        })(Service = Bootstrap.Service || (Bootstrap.Service = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        Bootstrap.serialTaskId = 0;
        var Task = (function () {
            function Task(name, type, task) {
                this.name = name;
                this.type = type;
                this.task = task;
                this._id = Bootstrap.serialTaskId++;
                this.reportTime = false;
            }
            Object.defineProperty(Task.prototype, "id", {
                get: function () { return this._id; },
                enumerable: true,
                configurable: true
            });
            Task.prototype.bind = function (name, type, next) {
                var _this = this;
                return Task.create(name, type, function (ctx) {
                    _this.run(ctx.context).then(function (a) {
                        next(a).run(ctx.context).then(ctx.resolve).catch(ctx.reject);
                    }).catch(ctx.reject);
                });
            };
            Task.prototype.map = function (name, type, f) {
                var _this = this;
                return Task.create(name, type, function (ctx) {
                    _this.run(ctx.context).then(function (r) { return ctx.resolve(f(r)); }).catch(ctx.reject);
                });
            };
            Task.prototype.run = function (context) {
                var _this = this;
                var ctx;
                var ret = new LiteMol.Core.Promise(function (resolve, reject) {
                    Bootstrap.Event.Task.Started.dispatch(context, _this);
                    context.performance.start('task' + _this.id);
                    ctx = new Task.Context(context, _this, resolve, reject);
                    try {
                        _this.task(new Task.Context(context, _this, resolve, reject));
                    }
                    catch (e) {
                        ctx.reject(e);
                    }
                });
                return new Task.Running(ret, ctx);
            };
            Task.prototype.setReportTime = function (report) {
                this.reportTime = report;
                return this;
            };
            return Task;
        }());
        Bootstrap.Task = Task;
        var Task;
        (function (Task) {
            var Running = (function () {
                function Running(promise, ctx) {
                    this.promise = promise;
                    this.ctx = ctx;
                }
                Running.prototype.then = function (action) {
                    return this.promise.then(action);
                };
                Running.prototype.catch = function (action) {
                    return this.promise.catch(action);
                };
                Running.prototype.discard = function () {
                    this.ctx.discard();
                };
                return Running;
            }());
            Task.Running = Running;
            //export type RunningTask<T> = Core.Promise<T>;
            function create(name, type, task) {
                return new Task(name, type, task);
            }
            Task.create = create;
            function resolve(name, type, value) {
                return create(name, type, function (ctx) {
                    ctx.resolve(value);
                });
            }
            Task.resolve = resolve;
            function reject(name, type, reason) {
                return create(name, 'Normal', function (ctx) {
                    ctx.reject(reason);
                });
            }
            Task.reject = reject;
            function fromComputation(name, type, computation) {
                return create(name, type, function (ctx) {
                    var comp = computation.run();
                    comp.progress.subscribe(function (p) { return ctx.update(Bootstrap.Utils.formatProgress(p), p.requestAbort); });
                    comp.result.then(function (r) { return ctx.resolve(r); }).catch(function (e) { return ctx.reject(e); });
                });
            }
            Task.fromComputation = fromComputation;
            function sequencePromises(promises, ignoreErrors) {
                if (ignoreErrors === void 0) { ignoreErrors = false; }
                return new Bootstrap.Promise(function (resolve, reject) {
                    var ret = [];
                    var next = function (i) {
                        if (i >= promises.length) {
                            resolve(ret);
                            return;
                        }
                        promises[i]().then(function (r) { ret.push(r); next(i + 1); }).catch(function (e) {
                            if (ignoreErrors) {
                                next(i + 1);
                            }
                            else {
                                reject(e);
                            }
                        });
                    };
                    next(0);
                });
            }
            Task.sequencePromises = sequencePromises;
            function sequence(context, name, type, tasks, ignoreErrors) {
                if (ignoreErrors === void 0) { ignoreErrors = false; }
                return create(name, type, function (ctx) {
                    var ret = [];
                    var next = function (i) {
                        if (i >= tasks.length) {
                            ctx.resolve(ret);
                            return;
                        }
                        tasks[i]().run(context).then(function (r) { ret.push(r); next(i + 1); }).catch(function (e) {
                            if (ignoreErrors) {
                                next(i + 1);
                            }
                            else {
                                ctx.reject(e);
                            }
                        });
                    };
                    next(0);
                });
            }
            Task.sequence = sequence;
            function guardedPromise(context, promise) {
                return new Bootstrap.Promise(function (resolve, reject) {
                    try {
                        promise(resolve, reject);
                    }
                    catch (e) {
                        context.logger.error("Error (Generic): " + e);
                    }
                });
            }
            Task.guardedPromise = guardedPromise;
            function split(context, tasks) {
                return guardedPromise(context, function (resolve, reject) {
                    var next = function (i) {
                        if (i >= tasks.length) {
                            resolve(void 0);
                            return;
                        }
                        var t = tasks[i];
                        t.stateUpdate();
                        context.dispatcher.schedule(function () {
                            t.action();
                            next(i + 1);
                        }, reject);
                    };
                    next(0);
                });
            }
            Task.split = split;
            var Context = (function () {
                function Context(context, task, _resolve, _reject) {
                    this.context = context;
                    this.task = task;
                    this._resolve = _resolve;
                    this._reject = _reject;
                    this.schedulingTime = 0;
                    this.scheduleId = 0;
                    this.abort = void 0;
                    this.discarded = false;
                    this.resolve = this.resolve_task.bind(this);
                    this.reject = this.reject_task.bind(this);
                }
                Context.prototype.discard = function () {
                    try {
                        if (this.abort) {
                            this.abort();
                        }
                    }
                    catch (e) {
                    }
                    this.discarded = true;
                };
                Context.prototype.update = function (message, abort) {
                    Bootstrap.Event.Task.StateUpdated.dispatch(this.context, {
                        taskId: this.task.id,
                        type: this.task.type,
                        name: this.task.name,
                        message: message,
                        abort: abort
                    });
                    this.abort = abort;
                };
                Context.prototype.schedule = function (action, timeout) {
                    var _this = this;
                    var sId = this.scheduleId++;
                    var pId = 'task' + this.task.id + '-' + sId;
                    this.context.performance.start(pId);
                    this.context.dispatcher.schedule(function () {
                        _this.context.performance.end(pId);
                        _this.schedulingTime += _this.context.performance.time(pId);
                        action();
                    }, function (e) {
                        _this.context.performance.end(pId);
                        _this.reject(e);
                    }, timeout);
                };
                Context.prototype.resolve_task = function (result) {
                    this.abort = void 0;
                    if (this.discarded) {
                        this.reject('Discarded.');
                        return;
                    }
                    try {
                        this.context.performance.end('task' + this.task.id);
                        if (this.task.reportTime) {
                            var time = this.context.performance.time('task' + this.task.id) - this.schedulingTime;
                            if (this.task.type !== 'Silent')
                                this.context.logger.info(this.task.name + " finished in " + LiteMol.Core.Utils.PerformanceMonitor.format(time) + ".");
                        }
                    }
                    finally {
                        this._resolve(result);
                        Bootstrap.Event.Task.Completed.dispatch(this.context, this.task.id);
                    }
                };
                Context.prototype.reject_task = function (err) {
                    this.abort = void 0;
                    this.context.performance.end('task' + this.task.id);
                    this.context.performance.formatTime('task' + this.task.id);
                    try {
                        if (!this.discarded) {
                            if (this.task.type === 'Silent') {
                                if (err.warn)
                                    this.context.logger.warning("Warning (" + this.task.name + "): " + err.message);
                                else
                                    console.error("Error (" + this.task.name + "): " + err, err);
                            }
                            else if (this.task.type !== 'Child') {
                                if (err.warn) {
                                    this.context.logger.warning("Warning (" + this.task.name + "): " + err.message);
                                }
                                else {
                                    var e = '' + err;
                                    if (e.indexOf('Aborted') >= 0)
                                        this.context.logger.info(this.task.name + ": Aborted.");
                                    else
                                        this.context.logger.error("Error (" + this.task.name + "): " + err);
                                }
                            }
                            else {
                                var e = '' + err;
                                if (!err.warn && e.indexOf('Aborted') < 0)
                                    console.log(err);
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                    finally {
                        this._reject(err);
                        Bootstrap.Event.Task.Completed.dispatch(this.context, this.task.id);
                    }
                };
                return Context;
            }());
            Task.Context = Context;
        })(Task = Bootstrap.Task || (Bootstrap.Task = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        var Event;
        (function (Event) {
            var EventPrototype = {
                dispatch: function (context, data) { context.dispatcher.dispatch({ type: this, data: data }); },
                getStream: function (context) { return context.dispatcher.getStream(this); }
            };
            function create(name, lane) {
                return Object.create(EventPrototype, {
                    name: { writable: false, configurable: false, value: name },
                    lane: { writable: false, configurable: false, value: lane }
                });
            }
            Event.create = create;
        })(Event = Bootstrap.Event || (Bootstrap.Event = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Event;
        (function (Event) {
            "use strict";
            var Lane = Bootstrap.Service.Dispatcher.Lane;
            Event.Log = Event.create('bs.Log', Lane.Log);
            var Common;
            (function (Common) {
                Common.LayoutChanged = Event.create('bs.Common.LayoutChanged', Lane.Slow);
            })(Common = Event.Common || (Event.Common = {}));
            var Task;
            (function (Task) {
                Task.Started = Event.create('bs.Tasks.Started', Lane.Task);
                Task.Completed = Event.create('bs.Tasks.Completed', Lane.Task);
                Task.StateUpdated = Event.create('bs.Tasks.StateUpdated', Lane.Busy);
            })(Task = Event.Task || (Event.Task = {}));
            var Tree;
            (function (Tree) {
                Tree.NodeUpdated = Event.create('bs.Tree.NodeUpdated', Lane.Slow);
                Tree.NodeAdded = Event.create('bs.Tree.NodeAdded', Lane.Slow);
                Tree.NodeRemoved = Event.create('bs.Tree.NodeRemoved', Lane.Slow);
                Tree.TransformStarted = Event.create('bs.Tree.TransformStarted', Lane.Slow);
                Tree.TransformFinished = Event.create('bs.Tree.TransformFinished', Lane.Slow);
                Tree.TransformerApply = Event.create('bs.Tree.TransformerApplied', Lane.Transformer);
            })(Tree = Event.Tree || (Event.Tree = {}));
            var Entity;
            (function (Entity_1) {
                Entity_1.CurrentChanged = Event.create('bs.Entity.CurrentChanged', Lane.Slow);
            })(Entity = Event.Entity || (Event.Entity = {}));
            var Interactivity;
            (function (Interactivity) {
                Interactivity.Highlight = Event.create('bs.Visuals.HoverElement', Lane.Fast);
            })(Interactivity = Event.Interactivity || (Event.Interactivity = {}));
            var Visual;
            (function (Visual) {
                Visual.VisualHoverElement = Event.create('bs.Visual.HoverElement', Lane.Fast);
                Visual.VisualSelectElement = Event.create('bs.Visual.SelectElement', Lane.Fast);
                Visual.CameraChanged = Event.create('bs.Visual.CameraChanged', Lane.Fast);
            })(Visual = Event.Visual || (Event.Visual = {}));
            var Molecule;
            (function (Molecule) {
                Molecule.ModelHighlight = Event.create('bs.Molecule.ModelHighlight', Lane.Fast);
                Molecule.ModelSelect = Event.create('bs.Molecule.ModelSelect', Lane.Fast);
            })(Molecule = Event.Molecule || (Event.Molecule = {}));
        })(Event = Bootstrap.Event || (Bootstrap.Event = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Command;
        (function (Command) {
            "use strict";
            var Lane = Bootstrap.Service.Dispatcher.Lane;
            var create = Bootstrap.Event.create;
            var Tree;
            (function (Tree) {
                Tree.RemoveNode = create('bs.cmd.Tree.RemoveNode', Lane.Slow);
                Tree.ApplyTransform = create('bs.cmd.Tree.ApplyTransform', Lane.Slow);
            })(Tree = Command.Tree || (Command.Tree = {}));
            var Entity;
            (function (Entity) {
                Entity.SetCurrent = create('bs.cmd.Entity.SetCurrentNode', Lane.Slow);
                Entity.ToggleExpanded = create('bs.cmd.Entity.ToggleExpanded', Lane.Slow);
                Entity.SetVisibility = create('bs.cmd.Entity.SetVisibility', Lane.Slow);
                Entity.Focus = create('bs.cmd.Entity.Focus', Lane.Slow);
                Entity.Highlight = create('bs.cmd.Entity.Highlight', Lane.Slow);
            })(Entity = Command.Entity || (Command.Entity = {}));
            var Layout;
            (function (Layout) {
                Layout.SetState = LiteMol.Bootstrap.Event.create('lm.cmd.Layout.SetState', Lane.Slow);
                Layout.SetViewportOptions = create('bs.cmd.Layout.SetViewportOptions', Lane.Slow);
            })(Layout = Command.Layout || (Command.Layout = {}));
            var Molecule;
            (function (Molecule) {
                Molecule.FocusQuery = create('bs.cmd.Molecule.FocusQuery', Lane.Slow);
                Molecule.Highlight = create('bs.cmd.Molecule.Highlight', Lane.Slow);
                Molecule.CreateSelectInteraction = create('bs.cmd.Molecule.CreateSelectInteraction', Lane.Slow);
            })(Molecule = Command.Molecule || (Command.Molecule = {}));
            var Visual;
            (function (Visual) {
                Visual.ResetScene = create('bs.cmd.Visual.ResetScene', Lane.Slow);
                Visual.ResetTheme = create('bs.cmd.Visual.ResetTheme', Lane.Slow);
                Visual.UpdateBasicTheme = create('bs.cmd.Visual.UpdateBasicTheme', Lane.Slow);
            })(Visual = Command.Visual || (Command.Visual = {}));
        })(Command = Bootstrap.Command || (Bootstrap.Command = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        var Tree;
        (function (Tree) {
            function create(context, root) {
                var tree = {
                    version: 0,
                    refs: new Map(),
                    nodes: new Set(),
                    root: root,
                    context: context
                };
                root.parent = root;
                root.tree = tree;
                return tree;
            }
            Tree.create = create;
            function _addRef(entity) {
                var refs = entity.tree.refs.get(entity.ref);
                if (!refs) {
                    entity.tree.refs.set(entity.ref, [entity]);
                }
                else {
                    refs.push(entity);
                }
            }
            function addRef(entity) {
                Tree.Node.forEach(entity, function (e) { return _addRef(e); });
            }
            function _removeRef(tree, entity) {
                var refs = tree.refs.get(entity.ref);
                if (!refs)
                    return;
                var i = refs.indexOf(entity);
                if (i < 0)
                    return;
                refs[i] = refs[refs.length - 1];
                refs.pop();
                if (!refs.length)
                    tree.refs.delete(entity.ref);
            }
            function removeRef(tree, entity) {
                Tree.Node.forEach(entity, function (e) { return _removeRef(tree, e); });
            }
            function add(node) {
                if (!node.parent)
                    throw 'Cannot add a node without a parent.';
                var tree = node.parent.tree;
                Tree.Node.forEach(node, function (e) { return e.tree = tree; });
                Tree.Node.addChild(node.parent, node);
                addRef(node);
                Bootstrap.Entity.nodeUpdated(node.parent);
                notifyAdded(node);
            }
            Tree.add = add;
            function notifyAdded(node) {
                var ctx = node.tree.context;
                Tree.Node.forEachPreorder(node, function (n) {
                    Bootstrap.Event.Tree.NodeAdded.dispatch(ctx, n);
                });
            }
            function update(tree, old, e) {
                Tree.Node.replaceChild(old.parent, old, e);
                notifyRemoved(tree.context, old);
                Tree.Node.forEach(e, function (n) { return n.tree = tree; });
                addRef(e);
                for (var _i = 0, _a = e.children; _i < _a.length; _i++) {
                    var c = _a[_i];
                    notifyAdded(c);
                }
                Bootstrap.Entity.nodeUpdated(e.parent);
                Bootstrap.Event.Tree.NodeAdded.dispatch(tree.context, e);
                if (tree.context.currentEntity === old) {
                    Bootstrap.Entity.setCurrent(e);
                }
            }
            Tree.update = update;
            function updatePath(node) {
                if (!node)
                    return;
                var top;
                while (node !== node.parent) {
                    top = node;
                    Tree.Node.update(node);
                    node = node.parent;
                }
                if (top)
                    Bootstrap.Event.Tree.NodeUpdated.dispatch(node.tree.context, top);
            }
            Tree.updatePath = updatePath;
            function clearRoot(tree) {
                var children = tree.root.children;
                tree.root.children = [];
                Tree.Node.update(tree.root);
                Bootstrap.Entity.nodeUpdated(tree.root);
                tree.refs.clear();
                for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                    var c = children_1[_i];
                    notifyRemoved(tree.context, c);
                }
                Bootstrap.Command.Entity.SetCurrent.dispatch(tree.context, tree.root);
            }
            function notifyRemoved(ctx, node) {
                Tree.Node.forEach(node, function (n) {
                    _removeRef(ctx.tree, n);
                    Bootstrap.Event.Tree.NodeRemoved.dispatch(ctx, n);
                    n.tree = void 0;
                });
            }
            function remove(node) {
                if (!node || !node.tree)
                    return;
                if (node.parent === node) {
                    clearRoot(node.tree);
                    return;
                }
                var isHidden = Tree.Node.isHidden(node);
                var index = node.index;
                var parent = node.parent;
                var ctx = node.tree.context;
                Tree.Node.removeChild(parent, node);
                Bootstrap.Entity.nodeUpdated(parent);
                notifyRemoved(ctx, node);
                if (!isHidden) {
                    if (parent.children[index] && !Tree.Node.isHidden(parent.children[index])) {
                        Bootstrap.Command.Entity.SetCurrent.dispatch(ctx, parent.children[index]);
                    }
                    else {
                        Bootstrap.Command.Entity.SetCurrent.dispatch(ctx, parent);
                    }
                }
                if (node.transform.props.isBinding && !parent.children.length) {
                    remove(node.parent);
                }
            }
            Tree.remove = remove;
        })(Tree = Bootstrap.Tree || (Bootstrap.Tree = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Tree;
        (function (Tree) {
            "use strict";
            ;
            var Node;
            (function (Node) {
                Node.Null = {};
                function is(e, t) {
                    return e && e.type === t;
                }
                Node.is = is;
                function hasAncestor(e, a) {
                    while (true) {
                        if (e === a)
                            return true;
                        e = e.parent;
                        if (!e || e === e.parent)
                            return false;
                    }
                }
                Node.hasAncestor = hasAncestor;
                function findAncestor(e, t) {
                    if (!e)
                        return void 0;
                    var n = e.parent;
                    while (true) {
                        if (is(n, t))
                            return n;
                        n = n.parent;
                        if (n.parent === n)
                            return void 0;
                    }
                }
                Node.findAncestor = findAncestor;
                // search towards the root
                function findClosestNodeOfType(e, t) {
                    if (!e)
                        return void 0;
                    var n = e;
                    while (true) {
                        if (t.indexOf(n.type) >= 0)
                            return n;
                        n = n.parent;
                        if (n.parent === n) {
                            return t.indexOf(n.type) >= 0 ? n : void 0;
                        }
                    }
                }
                Node.findClosestNodeOfType = findClosestNodeOfType;
                var serialId = 0;
                function createId() {
                    return serialId++;
                }
                Node.createId = createId;
                function update(e) {
                    e.version++;
                    return e;
                }
                Node.update = update;
                function withProps(n, props) {
                    var newProps = Bootstrap.Utils.merge(n.props, props);
                    if (newProps === n.props)
                        return n;
                    return update(n);
                }
                Node.withProps = withProps;
                function withState(n, state) {
                    var ns = Bootstrap.Utils.merge(n.state, state);
                    if (ns === n.state)
                        return n;
                    n.state = ns;
                    return update(n);
                }
                Node.withState = withState;
                function addChild(n, c) {
                    c.index = n.children.length;
                    n.children.push(c);
                    return update(n);
                }
                Node.addChild = addChild;
                function removeChild(n, child) {
                    var children = n.children;
                    for (var i = child.index, _b = children.length - 1; i < _b; i++) {
                        var c = children[i + 1];
                        c.index--;
                        children[i] = c;
                    }
                    children.pop();
                    return update(n);
                }
                Node.removeChild = removeChild;
                function replaceChild(n, oldChild, newChild) {
                    if (!newChild)
                        return removeChild(n, oldChild);
                    newChild.index = oldChild.index;
                    n.children[newChild.index] = newChild;
                    return update(n);
                }
                Node.replaceChild = replaceChild;
                function forEach(n, f) {
                    for (var _i = 0, _a = n.children; _i < _a.length; _i++) {
                        var c = _a[_i];
                        forEach(c, f);
                    }
                    f(n);
                }
                Node.forEach = forEach;
                function forEachPreorder(n, f) {
                    f(n);
                    for (var _i = 0, _a = n.children; _i < _a.length; _i++) {
                        var c = _a[_i];
                        forEach(c, f);
                    }
                }
                Node.forEachPreorder = forEachPreorder;
                function collect(n) {
                    var nodes = [];
                    forEach(n, function (c) { return nodes.push(c); });
                    return nodes;
                }
                Node.collect = collect;
                function isHidden(e) {
                    if (e.isHidden)
                        return true;
                    var n = e.parent;
                    if (!n)
                        return e.isHidden;
                    while (n.parent !== n) {
                        if (n.isHidden) {
                            return true;
                        }
                        n = n.parent;
                        if (!n)
                            return false;
                    }
                    return false;
                }
                Node.isHidden = isHidden;
            })(Node = Tree.Node || (Tree.Node = {}));
        })(Tree = Bootstrap.Tree || (Bootstrap.Tree = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Tree;
        (function (Tree) {
            "use strict";
            var Selection;
            (function (Selection) {
                function select(s, tree) {
                    return compile(s)(tree);
                }
                Selection.select = select;
                function compile(s) {
                    var selector = s ? s : Selection.root();
                    var query;
                    if (isBuilder(selector))
                        query = selector.compile();
                    else if (isEntity(selector))
                        query = Selection.byValue(selector).compile();
                    else if (isQuery(selector))
                        query = selector;
                    else
                        query = Selection.byRef(selector).compile();
                    return query;
                }
                Selection.compile = compile;
                function isEntity(arg) {
                    return arg.ref !== void 0;
                }
                function isBuilder(arg) {
                    return arg.compile !== void 0;
                }
                function isQuery(arg) {
                    return typeof arg === 'function';
                }
                var Helpers;
                (function (Helpers) {
                    Helpers.BuilderPrototype = {};
                    function registerModifier(name, f) {
                        Helpers.BuilderPrototype[name] = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            return f.call.apply(f, [void 0, this].concat(args));
                        };
                    }
                    Helpers.registerModifier = registerModifier;
                })(Helpers = Selection.Helpers || (Selection.Helpers = {}));
                function build(compile) {
                    return Object.create(Helpers.BuilderPrototype, { compile: { writable: false, configurable: false, value: compile } });
                }
                function emptyIfUndefined(e) { return e ? e : []; }
                function root() { return build(function () { return function (tree) { return [tree.root]; }; }); }
                Selection.root = root;
                function byRef(ref) { return build(function () { return function (tree) { return emptyIfUndefined(tree.refs.get(ref)); }; }); }
                Selection.byRef = byRef;
                function byValue(e) { return build(function () { return function (tree) { return [e]; }; }); }
                Selection.byValue = byValue;
                Helpers.registerModifier('flatMap', flatMap);
                function flatMap(b, f) {
                    var q = compile(b);
                    return build(function () { return function (tree) {
                        var ret = [];
                        for (var _i = 0, _a = q(tree); _i < _a.length; _i++) {
                            var n = _a[_i];
                            for (var _b = 0, _c = f(n); _b < _c.length; _b++) {
                                var m = _c[_b];
                                ret.push(m);
                            }
                        }
                        return ret;
                    }; });
                }
                Selection.flatMap = flatMap;
                Helpers.registerModifier('mapEntity', mapEntity);
                function mapEntity(b, f) {
                    var q = compile(b);
                    return build(function () { return function (tree) {
                        var ret = [];
                        for (var _i = 0, _a = q(tree); _i < _a.length; _i++) {
                            var n = _a[_i];
                            var x = f(n);
                            if (x)
                                ret.push(x);
                        }
                        return ret;
                    }; });
                }
                Selection.mapEntity = mapEntity;
                Helpers.registerModifier('unique', unique);
                function unique(b) {
                    var q = compile(b);
                    return build(function () { return function (tree) {
                        var set = new Set();
                        var ret = [];
                        for (var _i = 0, _a = q(tree); _i < _a.length; _i++) {
                            var n = _a[_i];
                            if (!set.has(n.id)) {
                                set.add(n.id);
                                ret.push(n);
                            }
                        }
                        return ret;
                    }; });
                }
                Selection.unique = unique;
                Helpers.registerModifier('first', first);
                function first(b) { var q = compile(b); return build(function () { return function (tree) { return [q(tree)[0]]; }; }); }
                Selection.first = first;
                Helpers.registerModifier('filter', filter);
                function filter(b, p) { return flatMap(b, function (n) { return p(n) ? [n] : []; }); }
                Selection.filter = filter;
                Helpers.registerModifier('subtree', subtree);
                function subtree(b) { return flatMap(b, function (n) { return Tree.Node.collect(n); }); }
                Selection.subtree = subtree;
                Helpers.registerModifier('children', children);
                function children(b) { return flatMap(b, function (n) { return n.children; }); }
                Selection.children = children;
                Helpers.registerModifier('ofType', ofType);
                function ofType(b, t) { return filter(b, function (n) { return n.type === t; }); }
                Selection.ofType = ofType;
                Helpers.registerModifier('ancestorOfType', ancestorOfType);
                function ancestorOfType(b, t) { return unique(mapEntity(b, function (n) { return Tree.Node.findAncestor(n, t); })); }
                Selection.ancestorOfType = ancestorOfType;
                Helpers.registerModifier('parent', parent);
                function parent(b) { return unique(mapEntity(b, function (n) { return n.parent; })); }
                Selection.parent = parent;
            })(Selection = Tree.Selection || (Tree.Selection = {}));
        })(Tree = Bootstrap.Tree || (Bootstrap.Tree = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Tree;
        (function (Tree) {
            "use strict";
            var Transformer;
            (function (Transformer) {
                var TransformerImpl = (function () {
                    function TransformerImpl(info, transform, updater) {
                        this.info = info;
                        this.transform = transform;
                        this.updater = updater;
                    }
                    TransformerImpl.prototype.getTarget = function (node) {
                        var info = this.info;
                        return (!info.from.length ? node : Tree.Node.findClosestNodeOfType(node, info.from));
                    };
                    TransformerImpl.prototype.checkTypes = function (a, t) {
                        if (t.transformer !== this) {
                            return "The transform is calling an invalid transformer (got " + t.transformer.info.name + ", expected " + this.info.name + ")";
                        }
                        var info = this.info;
                        if (info.from.length && info.from.indexOf(a.type) < 0) {
                            return "Transform (" + info.name + "): type error, expected '" + info.from.map(function (t) { return t.info.name; }).join('/') + "', got '" + a.type.info.name + "'.";
                        }
                        return void 0;
                    };
                    TransformerImpl.prototype.validateParams = function (t) {
                        var info = this.info;
                        if (info.validateParams) {
                            var issues = info.validateParams(t.params);
                            if (issues && issues.length > 0) {
                                return "Invalid params: " + issues.join(', ') + ".";
                            }
                        }
                        return void 0;
                    };
                    TransformerImpl.prototype.validate = function (a, t) {
                        var info = this.info;
                        if (!a)
                            return Bootstrap.Task.reject(info.name, 'Normal', 'Could not find a suitable node to apply the transformer to.');
                        var typeCheck = this.checkTypes(a, t);
                        if (typeCheck)
                            return Bootstrap.Task.reject(info.name, 'Normal', typeCheck);
                        var paramValidation = this.validateParams(t);
                        if (paramValidation)
                            return Bootstrap.Task.reject(info.name, 'Normal', paramValidation);
                    };
                    TransformerImpl.prototype.apply = function (context, node, t) {
                        if (this.info.isComposed)
                            return this.transform(context, node, t);
                        var a = this.getTarget(node);
                        var validationFailed = this.validate(a, t);
                        if (validationFailed)
                            return validationFailed;
                        Bootstrap.Event.Tree.TransformerApply.dispatch(context, { a: a, t: t });
                        return this.transform(context, a, t);
                    };
                    TransformerImpl.prototype.update = function (context, b, t) {
                        var node = b.parent;
                        if (this.info.isComposed && !this.updater)
                            return this.transform(context, node, t);
                        if (this.updater) {
                            var paramValidation = this.validateParams(t);
                            if (paramValidation)
                                return Bootstrap.Task.reject(this.info.name, 'Normal', paramValidation);
                            var updated = this.updater(context, b, t);
                            if (updated)
                                return updated;
                        }
                        Bootstrap.Event.Tree.TransformerApply.dispatch(context, { a: b.parent, t: t });
                        return this.transform(context, node, t);
                    };
                    TransformerImpl.prototype.create = function (params, props) {
                        return Tree.Transform.create(params, props ? props : {}, this);
                    };
                    return TransformerImpl;
                }());
                function create(info, transform, updater) {
                    return new TransformerImpl(info, transform, updater);
                }
                Transformer.create = create;
                function internal(id, from, to, transform) {
                    return create({
                        id: id,
                        name: id,
                        description: '',
                        from: from,
                        to: to,
                        validateParams: function () { return void 0; },
                        defaultParams: function () { return ({}); }
                    }, transform);
                }
                Transformer.internal = internal;
                function action(info, builder, doneMessage) {
                    return create(info, function (context, a, t) {
                        return Bootstrap.Task.create(info.name, 'Background', function (ctx) {
                            var src = builder(context, a, t);
                            Tree.Transform.apply(context, src)
                                .run(context)
                                .then(function (r) {
                                if (doneMessage) {
                                    context.logger.message(doneMessage);
                                }
                                ctx.resolve(Tree.Node.Null);
                            })
                                .catch(ctx.reject);
                        });
                    });
                }
                Transformer.action = action;
            })(Transformer = Tree.Transformer || (Tree.Transformer = {}));
        })(Tree = Bootstrap.Tree || (Bootstrap.Tree = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Tree;
        (function (Tree) {
            "use strict";
            var Transform;
            (function (Transform) {
                var TransformImpl = (function () {
                    function TransformImpl(params, props, transformer) {
                        this.params = params;
                        this.props = props;
                        this.transformer = transformer;
                        this.isUpdate = false;
                    }
                    TransformImpl.prototype.resolveAdd = function (ctx, a, b) {
                        if (b === Tree.Node.Null) {
                            ctx.resolve(b);
                            return;
                        }
                        b.ref = this.props.ref;
                        if (this.props.isHidden)
                            b.isHidden = true;
                        if (!b.tree) {
                            b.parent = a;
                            Tree.add(b);
                        }
                        ctx.resolve(b);
                    };
                    TransformImpl.prototype.resolveUpdate = function (ctx, b, newB) {
                        if (newB === Tree.Node.Null) {
                            ctx.resolve(newB);
                            return;
                        }
                        var a = b.parent;
                        newB.ref = this.props.ref;
                        newB.parent = a;
                        newB.tag = b.tag;
                        newB.state = b.state;
                        if (this.props.isHidden)
                            newB.isHidden = true;
                        Tree.update(ctx.context.tree, b, newB);
                        ctx.resolve(newB);
                    };
                    TransformImpl.prototype.apply = function (context, a) {
                        var _this = this;
                        return Bootstrap.Task.create(this.transformer.info.name, 'Child', function (ctx) {
                            Bootstrap.Event.Tree.TransformStarted.dispatch(context, _this);
                            _this.transformer.apply(context, a, _this).run(ctx.context).then(function (b) {
                                _this.resolveAdd(ctx, a, b);
                                Bootstrap.Event.Tree.TransformFinished.dispatch(context, { transform: _this });
                            }).catch(function (e) {
                                ctx.reject(e);
                                Bootstrap.Event.Tree.TransformFinished.dispatch(context, { transform: _this, error: e });
                            });
                        });
                    };
                    TransformImpl.prototype.update = function (context, b) {
                        var _this = this;
                        return Bootstrap.Task.create(this.transformer.info.name, 'Child', function (ctx) {
                            _this.isUpdate = true;
                            _this.props.ref = b.transform.props.ref;
                            Bootstrap.Event.Tree.TransformStarted.dispatch(context, _this);
                            if (b.transform.props.isBinding)
                                _this.props.isBinding = true;
                            _this.transformer.update(context, b, _this).run(context)
                                .then(function (newB) {
                                _this.resolveUpdate(ctx, b, newB);
                                Bootstrap.Event.Tree.TransformFinished.dispatch(context, { transform: _this });
                            }).catch(function (e) {
                                ctx.reject(e);
                                Bootstrap.Event.Tree.TransformFinished.dispatch(context, { transform: _this, error: e });
                            });
                        });
                    };
                    return TransformImpl;
                }());
                function create(params, props, transformer) {
                    var p = Bootstrap.Utils.shallowClone(props);
                    if (!p.ref)
                        p.ref = Bootstrap.Utils.generateUUID();
                    return new TransformImpl(params, p, transformer);
                }
                Transform.create = create;
                function updateInstance(ctx, instance) {
                    var xs = ctx.select(instance.selector);
                    var tasks = xs.map(function (x) { return function () { return instance.transform.update(ctx, x); }; });
                    return Bootstrap.Task.sequence(ctx, 'Update transform', 'Child', tasks, true);
                }
                Transform.updateInstance = updateInstance;
                function applyInstance(ctx, instance) {
                    var xs = ctx.select(instance.selector);
                    var tasks = xs.map(function (x) { return function () { return instance.transform.apply(ctx, x); }; });
                    return Bootstrap.Task.sequence(ctx, 'Apply transform', 'Child', tasks, true);
                }
                Transform.applyInstance = applyInstance;
                function isInstance(arg) {
                    return !!arg.selector;
                }
                function isBuilder(arg) {
                    return !!arg.compile;
                }
                function apply(ctx, source) {
                    var instances;
                    try {
                        if (isInstance(source))
                            instances = [source];
                        else if (isBuilder(source))
                            instances = source.compile();
                        else
                            instances = source;
                    }
                    catch (e) {
                        return Bootstrap.Task.reject('Apply transforms', 'Child', e);
                    }
                    var tasks = instances.map(function (i) { return function () { return applyInstance(ctx, i); }; });
                    return Bootstrap.Task.sequence(ctx, 'Apply transforms', 'Child', tasks, true);
                }
                Transform.apply = apply;
                function update(ctx, source) {
                    var instances;
                    try {
                        if (isInstance(source))
                            instances = [source];
                        else if (isBuilder(source))
                            instances = source.compile();
                        else
                            instances = source;
                    }
                    catch (e) {
                        return Bootstrap.Task.reject('Apply transforms', 'Child', e);
                    }
                    var tasks = instances.map(function (i) { return function () { return updateInstance(ctx, i); }; });
                    return Bootstrap.Task.sequence(ctx, 'Apply transforms', 'Child', tasks, true);
                }
                Transform.update = update;
            })(Transform = Tree.Transform || (Tree.Transform = {}));
        })(Tree = Bootstrap.Tree || (Bootstrap.Tree = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Tree;
        (function (Tree) {
            var Transform;
            (function (Transform) {
                "use strict";
                function build() {
                    return new Builder.Impl(void 0, []);
                }
                Transform.build = build;
                var Builder;
                (function (Builder) {
                    var Impl = (function () {
                        function Impl(last, transforms) {
                            this.last = last;
                            this.transforms = transforms;
                        }
                        Impl.prototype.add = function (s, t, params, props) {
                            var i = { selector: s, transform: t.create(params, props) };
                            this.transforms.push(i);
                            this.last = i;
                            return new Impl(i, this.transforms);
                        };
                        Impl.prototype.then = function (t, params, props) {
                            if (!this.last)
                                throw "Cannot 'then' on an empty builder";
                            var transform = t.create(params, props);
                            var i = { selector: this.last.transform.props.ref, transform: transform };
                            this.transforms.push(i);
                            return new Impl(i, this.transforms);
                        };
                        Impl.prototype.compile = function () {
                            return this.transforms;
                        };
                        return Impl;
                    }());
                    Builder.Impl = Impl;
                })(Builder = Transform.Builder || (Transform.Builder = {}));
            })(Transform = Tree.Transform || (Tree.Transform = {}));
        })(Tree = Bootstrap.Tree || (Bootstrap.Tree = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Interactivity;
        (function (Interactivity) {
            "use strict";
            function interactivityInfoEqual(a, b) {
                if (!a && !b)
                    return true;
                if (!a || !b)
                    return false;
                if (a.visual !== b.visual || a.entity !== b.entity)
                    return false;
                if (!a.elements && !b.elements)
                    return true;
                if (!a.elements || !b.elements || a.elements.length !== b.elements.length)
                    return false;
                var x = a.elements, y = b.elements;
                for (var i = 0, _l = x.length; i < _l; i++) {
                    if (x[i] !== y[i])
                        return false;
                }
                return true;
            }
            Interactivity.interactivityInfoEqual = interactivityInfoEqual;
        })(Interactivity = Bootstrap.Interactivity || (Bootstrap.Interactivity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Interactivity;
        (function (Interactivity) {
            "use strict";
            var HighlightManager = (function () {
                function HighlightManager(context) {
                    var _this = this;
                    this.context = context;
                    this.providers = [];
                    this.empty = [];
                    Bootstrap.Event.Visual.VisualHoverElement.getStream(context).subscribe(function (ev) { return Bootstrap.Event.Interactivity.Highlight.dispatch(context, _this.getInfo(ev.data)); });
                }
                HighlightManager.prototype.addProvider = function (provider) {
                    this.providers.push(provider);
                };
                HighlightManager.prototype.removeProvider = function (provider) {
                    this.providers = this.providers.filter(function (p) { return p !== provider; });
                    Bootstrap.Event.Interactivity.Highlight.dispatch(this.context, []);
                };
                HighlightManager.prototype.getInfo = function (i) {
                    if (!i)
                        return this.empty;
                    var info = [];
                    for (var _i = 0, _a = this.providers; _i < _a.length; _i++) {
                        var p = _a[_i];
                        var e = p.call(null, i);
                        if (e)
                            info.push(e);
                    }
                    return info;
                };
                return HighlightManager;
            }());
            Interactivity.HighlightManager = HighlightManager;
        })(Interactivity = Bootstrap.Interactivity || (Bootstrap.Interactivity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Interactivity;
        (function (Interactivity) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                function transformMoleculeAtomIndices(model, context, indices) {
                    var m = context.structure;
                    var _a = m.atoms, residueIndex = _a.residueIndex, chainIndex = _a.chainIndex, entityIndex = _a.entityIndex, name = _a.name, authName = _a.authName, id = _a.id, occupancy = _a.occupancy, tempFactor = _a.tempFactor, elementSymbol = _a.elementSymbol, x = _a.x, y = _a.y, z = _a.z, altLoc = _a.altLoc;
                    var _b = m.residues, resName = _b.name, resAuthName = _b.authName, seqNumber = _b.seqNumber, authSeqNumber = _b.authSeqNumber, insCode = _b.insCode, isHet = _b.isHet;
                    var _c = m.chains, asymId = _c.asymId, authAsymId = _c.authAsymId;
                    var entityId = m.entities.entityId;
                    var aI = -1, eI = -1, cI = -1, rI = -1;
                    var e, c, r, a;
                    var eP = function () { return e = { index: eI, entityId: entityId[eI] }; };
                    var cP = function () { return c = { index: cI, asymId: asymId[cI], authAsymId: authAsymId[cI], entity: e }; };
                    var rP = function () { return r = { index: rI, name: resName[rI], authName: resAuthName[rI], seqNumber: seqNumber[rI], authSeqNumber: authSeqNumber[rI], insCode: insCode[rI], isHet: isHet[rI], chain: c }; };
                    var aP = function () { return a = { index: aI, id: id[aI], name: name[aI], authName: authName[aI], elementSymbol: elementSymbol[aI], occupancy: occupancy[aI], tempFactor: tempFactor[aI], x: x[aI], y: y[aI], z: z[aI], altLoc: altLoc[aI], residue: r }; };
                    var entities = [];
                    var chains = [];
                    var residues = [];
                    var atoms = [];
                    for (var i = 0; i < indices.length; i++) {
                        aI = indices[i];
                        if (!context.hasAtom(aI))
                            continue;
                        if (eI !== entityIndex[aI]) {
                            eI = entityIndex[aI];
                            entities.push(eP());
                        }
                        if (cI !== chainIndex[aI]) {
                            cI = chainIndex[aI];
                            chains.push(cP());
                        }
                        if (rI !== residueIndex[aI]) {
                            rI = residueIndex[aI];
                            residues.push(rP());
                        }
                        atoms.push(aP());
                    }
                    return {
                        modelRef: model.ref,
                        moleculeId: m.id,
                        modelId: m.modelId,
                        atoms: atoms,
                        residues: residues,
                        chains: chains,
                        entities: entities
                    };
                }
                Molecule.transformMoleculeAtomIndices = transformMoleculeAtomIndices;
                function transformInteraction(info) {
                    if (!info.entity || !(Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Model) || Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Selection)))
                        return void 0;
                    var context = Bootstrap.Utils.Molecule.findQueryContext(info.entity);
                    var model = Bootstrap.Utils.Molecule.findModel(info.entity);
                    if (!context || !model)
                        return void 0;
                    return transformMoleculeAtomIndices(model, context, info.elements);
                }
                Molecule.transformInteraction = transformInteraction;
                function formatAtomExtra(a) {
                    var extras = [];
                    if (a.occupancy !== 1) {
                        extras.push("occupancy " + Bootstrap.Utils.round(a.occupancy, 2));
                    }
                    if (a.altLoc) {
                        extras.push("alt. loc " + a.altLoc);
                    }
                    if (!extras.length)
                        return '';
                    return " <small>[" + extras.join(', ') + "]</small>";
                }
                function formatAtom(a) {
                    return "<span><b>" + a.name + " " + a.elementSymbol + " " + a.id + "</b>" + formatAtomExtra(a) + " at (" + Bootstrap.Utils.round(a.x, 1) + ", " + Bootstrap.Utils.round(a.y, 1) + ", " + Bootstrap.Utils.round(a.z, 1) + ")</span>";
                }
                function formatAtomShort(a) {
                    return "<span>" + a.name + " " + a.elementSymbol + " " + a.id + formatAtomExtra(a) + "</span>";
                }
                function formatResidue(r) {
                    return "<span>" + r.authName + " " + r.chain.asymId + " " + r.authSeqNumber + (r.insCode !== null ? ' i: ' + r.insCode : '') + "</span>";
                }
                function formatInfo(info) {
                    if (!info || !info.atoms.length)
                        return "";
                    if (info.atoms.length === 1) {
                        return "<span>" + formatAtom(info.atoms[0]) + " on <b><small>" + formatResidue(info.residues[0]) + "</small></b></span>";
                    }
                    else if (info.residues.length === 1) {
                        return "<span><b>" + formatResidue(info.residues[0]) + "</b></span>";
                    }
                    else {
                        return "<span><small>" + info.atoms.length + " atoms on</small> <b>" + info.residues.length + " residues</b></span>";
                    }
                }
                Molecule.formatInfo = formatInfo;
                function formatInfoShort(info) {
                    if (!info || !info.atoms.length)
                        return "";
                    if (info.atoms.length === 1) {
                        return "<span><b>" + formatAtomShort(info.atoms[0]) + "<b></span>";
                    }
                    else if (info.residues.length === 1) {
                        return "<span><b>" + formatResidue(info.residues[0]) + "</b></span>";
                    }
                    else {
                        return "<span><b>" + info.residues.length + " residues</b></span>";
                    }
                }
                Molecule.formatInfoShort = formatInfoShort;
                function isMoleculeModelInteractivity(info) {
                    if (!info.entity || !(Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Model) || Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Selection)))
                        return false;
                    return true;
                }
                Molecule.isMoleculeModelInteractivity = isMoleculeModelInteractivity;
            })(Molecule = Interactivity.Molecule || (Interactivity.Molecule = {}));
        })(Interactivity = Bootstrap.Interactivity || (Bootstrap.Interactivity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            "use strict";
            var DisplayList = (function () {
                function DisplayList(context, scene) {
                    var _this = this;
                    this.context = context;
                    this.scene = scene;
                    this.entries = new Map();
                    this.originalThemes = new Map();
                    Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(function (e) {
                        if (!Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.VisualClass))
                            return;
                        _this.add(e.data);
                    });
                    Bootstrap.Event.Tree.NodeRemoved.getStream(context).subscribe(function (e) {
                        if (!Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.VisualClass))
                            return;
                        _this.remove(e.data);
                    });
                    Bootstrap.Event.Tree.NodeUpdated.getStream(context).subscribe(function (e) {
                        if (!Bootstrap.Entity.isVisual(e.data))
                            return;
                        var m = _this.entries.get(e.data.id);
                        if (!m)
                            return;
                        var vis = m.state.visibility !== 2 /* None */;
                        if (m.props.model.getVisibility() !== vis) {
                            m.props.model.updateVisibility(vis);
                        }
                    });
                    Bootstrap.Command.Visual.UpdateBasicTheme.getStream(context).subscribe(function (e) {
                        if (!_this.entries.get(e.data.visual.id) || !Bootstrap.Entity.isVisual(e.data.visual))
                            return;
                        var v = e.data.visual;
                        if (!_this.originalThemes.get(v.id)) {
                            _this.originalThemes.set(v.id, v.props.model.theme);
                        }
                        v.props.model.applyTheme(e.data.theme);
                    });
                    Bootstrap.Command.Molecule.Highlight.getStream(context).subscribe(function (e) { return _this.highlightMoleculeModel(e.data); });
                    Bootstrap.Command.Visual.ResetTheme.getStream(context).subscribe(function (e) { return _this.resetThemesAndHighlight(e.data && e.data.selection); });
                }
                DisplayList.prototype.add = function (v) {
                    if (this.entries.has(v.id) || !v.props.model)
                        return false;
                    this.entries.set(v.id, v);
                    this.scene.scene.models.add(v.props.model, this.entries.size === 1);
                    var vis = v.state.visibility !== 2 /* None */;
                    if (v.props.model.getVisibility() !== vis) {
                        v.props.model.updateVisibility(vis);
                    }
                    v.props.model.tag = v;
                    return true;
                };
                DisplayList.prototype.remove = function (v) {
                    if (!this.entries.has(v.id))
                        return false;
                    this.entries.delete(v.id);
                    this.originalThemes.delete(v.id);
                    this.scene.scene.models.removeAndDispose(v.props.model);
                    v.props.model.tag = void 0;
                    v.props.model = void 0;
                    return true;
                };
                DisplayList.prototype.get = function (id) {
                    return this.entries.get(id);
                };
                DisplayList.prototype.resetThemesAndHighlight = function (sel) {
                    var _this = this;
                    if (!sel) {
                        this.originalThemes.forEach(function (t, id) {
                            _this.entries.get(id).props.model.applyTheme(t);
                        });
                        this.originalThemes.clear();
                        this.entries.forEach(function (v) { return v.props.model.highlight(false); });
                        this.scene.scene.forceRender();
                        return;
                    }
                    var es = this.context.select(sel);
                    for (var _i = 0, es_1 = es; _i < es_1.length; _i++) {
                        var e = es_1[_i];
                        if (!Bootstrap.Entity.isVisual(e) || !this.originalThemes.has(e.id))
                            continue;
                        var v = e;
                        var t = this.originalThemes.get(v.id);
                        v.props.model.applyTheme(t);
                        v.props.model.highlight(false);
                        this.originalThemes.delete(v.id);
                    }
                    this.scene.scene.forceRender();
                };
                DisplayList.prototype.highlightMoleculeModel = function (what) {
                    var _this = this;
                    var model = Bootstrap.Utils.Molecule.findModel(what.model);
                    if (!model) {
                        console.warn('Highlight: Trying to highlight a non-molecule model entity, ignoring...');
                        return;
                    }
                    var targets = [];
                    this.context.select(Bootstrap.Tree.Selection.byValue(what.model).subtree()).forEach(function (n) {
                        if (Bootstrap.Entity.isVisual(n) && _this.entries.get(n.id))
                            targets.push(n);
                    });
                    if (!targets.length)
                        return;
                    var q = Bootstrap.Utils.Molecule.getModelAndIndicesFromQuery(model, what.query);
                    if (!q.model || !q.indices.length)
                        return;
                    var action = what.isOn ? 3 /* Highlight */ : 4 /* RemoveHighlight */;
                    for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                        var t = targets_1[_i];
                        t.props.model.applySelection(q.indices, action);
                    }
                };
                return DisplayList;
            }());
            Visualization.DisplayList = DisplayList;
            var SceneWrapper = (function () {
                function SceneWrapper(element, context, options) {
                    var _this = this;
                    this.context = context;
                    this._destroyed = false;
                    this.cameraChanged = new Bootstrap.Rx.Subject();
                    this.cameraObserver = function (c) { return _this.cameraChanged.onNext(c); };
                    this.models = new DisplayList(context, this);
                    this.scene = new LiteMol.Visualization.Scene(element, options);
                    this.scene.camera.observe(this.cameraObserver);
                    this.scene.events.addEventListener('hover', function (e) { return _this.handleEvent(e, Bootstrap.Event.Visual.VisualHoverElement); });
                    this.scene.events.addEventListener('select', function (e) { return _this.handleEvent(e, Bootstrap.Event.Visual.VisualSelectElement); });
                    this.cameraChanged.throttle(1000 / 30).subscribe(function (c) {
                        Bootstrap.Event.Visual.CameraChanged.dispatch(_this.context, c);
                    });
                    Bootstrap.Command.Entity.Focus.getStream(context)
                        .subscribe(function (e) {
                        if (e.data.length === 1) {
                            var t = e.data[0];
                            if (Bootstrap.Entity.isMoleculeSelection(t)) {
                                _this.focusMoleculeModelSelection(t);
                            }
                            else if (Bootstrap.Entity.isClass(t, Bootstrap.Entity.VisualClass)) {
                                _this.scene.camera.focusOnModel(t.props.model);
                            }
                        }
                        else {
                            (_a = _this.scene.camera).focusOnModel.apply(_a, e.data.filter(function (e) { return Bootstrap.Entity.isClass(e, Bootstrap.Entity.VisualClass); }).map(function (e) { return e.props.model; }));
                        }
                        var _a;
                    });
                    Bootstrap.Command.Entity.Highlight.getStream(context)
                        .subscribe(function (e) {
                        for (var _i = 0, _a = e.data.entities; _i < _a.length; _i++) {
                            var v = _a[_i];
                            if (!Bootstrap.Entity.isClass(v, Bootstrap.Entity.VisualClass) || !v.props.model)
                                continue;
                            v.props.model.highlight(e.data.isOn);
                        }
                    });
                    Bootstrap.Command.Visual.ResetScene.getStream(context).subscribe(function (e) { return _this.resetScene(); });
                    Bootstrap.Command.Molecule.FocusQuery.getStream(context).subscribe(function (e) { return _this.focusMoleculeModelOnQuery(e.data); });
                }
                SceneWrapper.prototype.resetScene = function () {
                    if (this._destroyed)
                        return;
                    Bootstrap.Event.Visual.VisualSelectElement.dispatch(this.context, {});
                    this.models.resetThemesAndHighlight();
                    this.scene.camera.reset();
                };
                Object.defineProperty(SceneWrapper.prototype, "camera", {
                    get: function () {
                        return this.scene.camera;
                    },
                    enumerable: true,
                    configurable: true
                });
                SceneWrapper.prototype.destroy = function () {
                    if (this._destroyed)
                        return;
                    this.scene.camera.stopObserving(this.cameraObserver);
                    this.scene.destroy();
                    this.scene = void 0;
                    this._destroyed = true;
                };
                SceneWrapper.prototype.handleEvent = function (e, event) {
                    var data = e.data;
                    if (data && data.model) {
                        event.dispatch(this.context, { entity: data.model.entity, visual: data.model.tag, elements: data.elements });
                    }
                    else {
                        event.dispatch(this.context, {});
                    }
                };
                SceneWrapper.prototype.focusMoleculeModelSelection = function (sel) {
                    if (!Bootstrap.Tree.Node.is(sel, Bootstrap.Entity.Molecule.Selection)) {
                        console.warn('Focus: Trying to focus on non-molecule selection, ignoring...');
                        return;
                    }
                    var model = Bootstrap.Utils.Molecule.findModel(sel);
                    if (!model) {
                        console.warn('Focus: Molecule model for selection not found, ignoring...');
                        return;
                    }
                    var center = { x: 0.1, y: 0.1, z: 0.1 };
                    var r = Bootstrap.Utils.Molecule.getCentroidAndRadius(model.props.model, sel.props.indices, center);
                    this.scene.camera.focusOnPoint(center, r);
                };
                SceneWrapper.prototype.focusMoleculeModelOnQuery = function (what) {
                    var q = Bootstrap.Utils.Molecule.getModelAndIndicesFromQuery(what.model, what.query);
                    if (!q.model || !q.indices.length)
                        return;
                    var center = { x: 0.1, y: 0.1, z: 0.1 };
                    var r = Bootstrap.Utils.Molecule.getCentroidAndRadius(q.model.props.model, q.indices, center);
                    this.scene.camera.focusOnPoint(center, r);
                };
                return SceneWrapper;
            }());
            Visualization.SceneWrapper = SceneWrapper;
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            "use strict";
            var visualSerialId = 0;
            var Theme;
            (function (Theme) {
                function mergeProps(theme, props) {
                    var colors = theme.colors || Bootstrap.Immutable.Map();
                    if (props.colors) {
                        for (var _i = 0, _a = Object.keys(props.colors); _i < _a.length; _i++) {
                            var c = _a[_i];
                            colors.set(c, props.colors[c]);
                        }
                    }
                    var ret = Bootstrap.Utils.shallowClone(theme);
                    ret.colors = colors;
                    if (props.transparency)
                        ret.transparency = props.transparency;
                    if (props.interactive !== void 0)
                        ret.interactive = props.interactive;
                    return ret;
                }
                Theme.mergeProps = mergeProps;
                function getProps(theme) {
                    var colors = new Map();
                    if (theme.colors)
                        theme.colors.forEach(function (c, n) { return colors.set(n, c); });
                    return {
                        colors: colors,
                        transparency: theme.transparency,
                        interactive: theme.interactive
                    };
                }
                Theme.getProps = getProps;
            })(Theme = Visualization.Theme || (Visualization.Theme = {}));
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                var Vis = LiteMol.Visualization;
                Molecule.UniformBaseColors = Bootstrap.Immutable.Map({
                    'Uniform': Vis.Theme.Default.UniformColor,
                    'Highlight': Vis.Theme.Default.HighlightColor,
                    'Selection': Vis.Theme.Default.SelectionColor,
                });
                Molecule.ModelVisualBaseColors = Bootstrap.Immutable.Map({
                    'Bond': Vis.Molecule.Colors.DefaultBondColor,
                    'Highlight': Vis.Theme.Default.HighlightColor,
                    'Selection': Vis.Theme.Default.SelectionColor,
                });
                function mappingClosure(index, property) {
                    return function (i) { return property[index[i]]; };
                }
                function createPaletteThemeProvider(provider, pallete) {
                    return function (e, props) {
                        var model = Bootstrap.Utils.Molecule.findModel(e).props.model;
                        var map = provider(model);
                        var mapping = Vis.Theme.createPalleteMapping(mappingClosure(map.index, map.property), pallete);
                        return Vis.Theme.createMapping(mapping, props);
                    };
                }
                Molecule.createPaletteThemeProvider = createPaletteThemeProvider;
                function uniformThemeProvider(e, props) {
                    if (props.colors) {
                        props.colors.set('Bond', props.colors.get('Uniform'));
                    }
                    return Vis.Theme.createUniform(props);
                }
                Molecule.uniformThemeProvider = uniformThemeProvider;
                function createColorMapThemeProvider(provider, colorMap, fallbackColor) {
                    return function (e, props) {
                        var model = Bootstrap.Utils.Molecule.findModel(e).props.model;
                        var map = provider(model);
                        var mapping = Vis.Theme.createColorMapMapping(mappingClosure(map.index, map.property), colorMap, fallbackColor);
                        return Vis.Theme.createMapping(mapping, props);
                    };
                }
                Molecule.createColorMapThemeProvider = createColorMapThemeProvider;
                var Default;
                (function (Default) {
                    Default.Themes = [
                        {
                            name: 'Chain ID',
                            description: 'Color the surface by Chain ID.',
                            colors: Molecule.ModelVisualBaseColors,
                            provider: createPaletteThemeProvider(function (m) { return ({ index: m.atoms.residueIndex, property: m.residues.asymId }); }, Vis.Molecule.Colors.DefaultPallete)
                        }, {
                            name: 'Entity ID',
                            description: 'Color the surface by Entity ID.',
                            colors: Molecule.ModelVisualBaseColors,
                            provider: createPaletteThemeProvider(function (m) { return ({ index: m.atoms.residueIndex, property: m.residues.entityId }); }, Vis.Molecule.Colors.DefaultPallete)
                        }, {
                            name: 'Entity Type',
                            description: 'Color the surface by Entity Type.',
                            colors: Molecule.ModelVisualBaseColors,
                            provider: createPaletteThemeProvider(function (m) { return ({ index: m.atoms.entityIndex, property: m.entities.entityType }); }, Vis.Molecule.Colors.DefaultPallete)
                        }, {
                            name: 'Residue Name',
                            description: 'Color the surface by residue name.',
                            colors: Molecule.ModelVisualBaseColors,
                            provider: createPaletteThemeProvider(function (m) { return ({ index: m.atoms.residueIndex, property: m.residues.name }); }, Vis.Molecule.Colors.DefaultPallete)
                        }, {
                            name: 'Element Symbol',
                            description: 'Color the surface by atom elemnt symbol.',
                            colors: Molecule.ModelVisualBaseColors,
                            provider: createColorMapThemeProvider(function (m) { return ({ index: m.atoms.indices, property: m.atoms.elementSymbol }); }, Vis.Molecule.Colors.DefaultElementColorMap, Vis.Molecule.Colors.DefaultElementColor)
                        }, {
                            name: 'Uniform Color',
                            description: 'Same color everywhere.',
                            colors: Molecule.UniformBaseColors,
                            provider: uniformThemeProvider
                        }
                    ];
                    Default.CartoonThemeTemplate = Default.Themes[0];
                    Default.ElementSymbolThemeTemplate = Default.Themes[4];
                    Default.SurfaceThemeTemplate = Default.Themes[5];
                    Default.UniformThemeTemplate = Default.Themes[5];
                })(Default = Molecule.Default || (Molecule.Default = {}));
            })(Molecule = Visualization.Molecule || (Visualization.Molecule = {}));
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                var Vis = LiteMol.Visualization;
                var MolVis = LiteMol.Visualization.Molecule;
                function getTessalation(type, count) {
                    if (type === 'Automatic') {
                        if (count < 75000)
                            return 3;
                        if (count < 250000)
                            return 2;
                        if (count < 600000)
                            return 1;
                        return 0;
                    }
                    var d = Molecule.DetailTypes.indexOf(type) - 1;
                    return Math.max(d, 0);
                }
                function createCartoonParams(tessalation, isAlphaTrace) {
                    return {
                        tessalation: tessalation,
                        drawingType: isAlphaTrace
                            ? MolVis.Cartoons.CartoonsModelType.AlphaTrace
                            : MolVis.Cartoons.CartoonsModelType.Default
                    };
                }
                function makeRadiusFunc(model, parameters) {
                    if (!parameters.useVDW) {
                        return function (r) {
                            return function () { return r; };
                        }(parameters.atomRadius);
                    }
                    var vdw = Bootstrap.Utils.vdwRadiusFromElementSymbol(model);
                    return function (s, vdw) {
                        return function (i) {
                            return s * vdw(i);
                        };
                    }(parameters.vdwScaling, vdw);
                }
                function createBallsAndSticksParams(tessalation, model, parameters) {
                    return {
                        tessalation: tessalation,
                        bondRadius: parameters.bondRadius,
                        hideBonds: false,
                        atomRadius: makeRadiusFunc(model, parameters)
                    };
                }
                function createVDWBallsParams(tessalation, model) {
                    return {
                        tessalation: tessalation,
                        bondRadius: 0,
                        hideBonds: true,
                        atomRadius: Bootstrap.Utils.vdwRadiusFromElementSymbol(model)
                    };
                }
                function createModel(source, style, theme) {
                    var model = Bootstrap.Utils.Molecule.findModel(source).props.model;
                    var atomIndices = Bootstrap.Entity.isMoleculeModel(source) ? source.props.model.atoms.indices : source.props.indices;
                    if (!atomIndices.length)
                        return void 0;
                    var tessalation = getTessalation(style.params.detail, atomIndices.length);
                    switch (style.type) {
                        case 'Cartoons':
                            return MolVis.Cartoons.Model.create(source, { model: model, atomIndices: atomIndices, theme: theme, queryContext: Bootstrap.Utils.Molecule.findQueryContext(source), params: createCartoonParams(tessalation, false) });
                        case 'Calpha':
                            return MolVis.Cartoons.Model.create(source, { model: model, atomIndices: atomIndices, theme: theme, queryContext: Bootstrap.Utils.Molecule.findQueryContext(source), params: createCartoonParams(tessalation, true) });
                        case 'BallsAndSticks':
                            return Vis.Molecule.BallsAndSticks.Model.create(source, { model: model, atomIndices: atomIndices, theme: theme, params: createBallsAndSticksParams(tessalation, model, style.params) });
                        case 'VDWBalls':
                            return Vis.Molecule.BallsAndSticks.Model.create(source, { model: model, atomIndices: atomIndices, theme: theme, params: createVDWBallsParams(tessalation, model) });
                        default:
                            return void 0;
                    }
                }
                function createStandardVisual(source, transform, style) {
                    return Bootstrap.Task.create("Visual (" + source.props.label + ")", style.computeOnBackground ? 'Silent' : 'Normal', function (ctx) {
                        var label = Molecule.TypeDescriptions[style.type].label;
                        ctx.update("Creating " + label + "...");
                        ctx.schedule(function () {
                            var theme = style.theme.template.provider(Bootstrap.Utils.Molecule.findModel(source), Visualization.Theme.getProps(style.theme));
                            var mc = createModel(source, style, theme);
                            if (!mc) {
                                ctx.reject('Invalid input parameters.');
                                return;
                            }
                            var comp = mc.run();
                            comp.progress.subscribe(function (p) { return ctx.update(label + ': ' + Bootstrap.Utils.formatProgress(p), p.requestAbort); });
                            comp.result.then(function (model) {
                                var visual = Bootstrap.Entity.Molecule.Visual.create(transform, { label: label, model: model, style: style, isSelectable: !style.isNotSelectable });
                                ctx.resolve(visual);
                            }).catch(ctx.reject);
                        }, 0);
                    });
                }
                function createSurface(source, transform, style) {
                    return Bootstrap.Task.create("Molecular Surface (" + source.props.label + ")", style.computeOnBackground ? 'Silent' : 'Normal', function (ctx) {
                        var model = Bootstrap.Utils.Molecule.findModel(source).props.model;
                        var atomIndices = Bootstrap.Entity.isMoleculeModel(source) ? source.props.model.atoms.indices : source.props.indices;
                        var params = style.params;
                        var label = Molecule.TypeDescriptions[style.type].label;
                        var data = LiteMol.Core.Geometry.MolecularSurface.computeMolecularSurfaceAsync({
                            positions: model.atoms,
                            atomIndices: atomIndices,
                            parameters: {
                                atomRadius: Bootstrap.Utils.vdwRadiusFromElementSymbol(model),
                                density: params.density,
                                probeRadius: params.probeRadius,
                                smoothingIterations: 2 * params.smoothing,
                                interactive: true
                            }
                        }).run();
                        data.progress.subscribe(function (p) { return ctx.update(label + ': ' + Bootstrap.Utils.formatProgress(p), p.requestAbort); });
                        data.result.then(function (data) {
                            var theme = style.theme.template.provider(Bootstrap.Utils.Molecule.findModel(source), Visualization.Theme.getProps(style.theme));
                            ctx.update('Creating visual...');
                            ctx.schedule(function () {
                                var surface = LiteMol.Visualization.Surface.Model.create(source, { surface: data.surface, theme: theme, parameters: { isWireframe: style.params.isWireframe } }).run();
                                surface.progress.subscribe(function (p) { return ctx.update(label + ': ' + Bootstrap.Utils.formatProgress(p), p.requestAbort); });
                                surface.result.then(function (model) {
                                    var label = "Surface, " + Bootstrap.Utils.round(params.probeRadius, 2) + " \u212B probe";
                                    var visual = Bootstrap.Entity.Molecule.Visual.create(transform, { label: label, model: model, style: style, isSelectable: !style.isNotSelectable });
                                    ctx.resolve(visual);
                                }).catch(ctx.reject);
                            }, 0);
                        }).catch(ctx.reject);
                    });
                }
                function create(source, transform, style) {
                    if (style.type === 'Surface')
                        return createSurface(source, transform, style);
                    return createStandardVisual(source, transform, style);
                }
                Molecule.create = create;
            })(Molecule = Visualization.Molecule || (Visualization.Molecule = {}));
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                Molecule.TypeDescriptions = {
                    'Cartoons': { label: 'Cartoon', shortLabel: 'Cartoon' },
                    'Calpha': { label: 'C-\u03B1 Trace', shortLabel: 'C-\u03B1' },
                    'BallsAndSticks': { label: 'Balls and Sticks', shortLabel: "B'n'S" },
                    'VDWBalls': { label: 'VDW Balls', shortLabel: 'VDW' },
                    'Surface': { label: 'Surface', shortLabel: 'Surface' }
                };
                Molecule.Types = ['Cartoons', 'Calpha', 'BallsAndSticks', 'VDWBalls', 'Surface'];
                Molecule.DetailTypes = ['Automatic', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
                var Default;
                (function (Default) {
                    Default.DetailParams = { detail: 'Automatic' };
                    Default.BallsAndSticksParams = {
                        useVDW: true,
                        vdwScaling: 0.22,
                        atomRadius: 0.35,
                        bondRadius: 0.09,
                        detail: 'Automatic'
                    };
                    Default.SurfaceParams = {
                        probeRadius: 1.4,
                        density: 1.1,
                        smoothing: 6,
                        isWireframe: false
                    };
                    Default.Transparency = { alpha: 1.0, writeDepth: false };
                    Default.ForType = (function () {
                        var types = {
                            'Cartoons': { type: 'Cartoons', params: { detail: 'Automatic' }, theme: { template: Default.CartoonThemeTemplate, colors: Default.CartoonThemeTemplate.colors, transparency: Default.Transparency, interactive: true } },
                            'Calpha': { type: 'Calpha', params: { detail: 'Automatic' }, theme: { template: Default.CartoonThemeTemplate, colors: Default.CartoonThemeTemplate.colors, transparency: Default.Transparency, interactive: true } },
                            'BallsAndSticks': { type: 'BallsAndSticks', params: Default.BallsAndSticksParams, theme: { template: Default.ElementSymbolThemeTemplate, colors: Default.ElementSymbolThemeTemplate.colors, transparency: Default.Transparency, interactive: true } },
                            'VDWBalls': { type: 'VDWBalls', params: { detail: 'Automatic' }, theme: { template: Default.ElementSymbolThemeTemplate, colors: Default.ElementSymbolThemeTemplate.colors, transparency: Default.Transparency, interactive: true } },
                            'Surface': { type: 'Surface', params: Default.SurfaceParams, theme: { template: Default.SurfaceThemeTemplate, colors: Default.SurfaceThemeTemplate.colors, transparency: { alpha: 0.33, writeDepth: false }, interactive: true } }
                        };
                        var map = new Map();
                        for (var _i = 0, _a = Object.keys(types); _i < _a.length; _i++) {
                            var k = _a[_i];
                            map.set(k, types[k]);
                        }
                        return map;
                    })();
                })(Default = Molecule.Default || (Molecule.Default = {}));
            })(Molecule = Visualization.Molecule || (Visualization.Molecule = {}));
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            var Density;
            (function (Density) {
                "use strict";
                var Geom = LiteMol.Core.Geometry;
                function getOffsets(data, min, max, toFrac) {
                    var dx = max[0] - min[0], dy = max[1] - min[1], dz = max[2] - min[2];
                    var corners = [
                        min,
                        [min[0] + dx, min[1], min[2]],
                        [min[0], min[1] + dy, min[2]],
                        [min[0], min[1], min[2] + dz],
                        [min[0] + dx, min[1] + dy, min[2]],
                        [min[0] + dx, min[1], min[2] + dz],
                        [min[0], min[1] + dy, min[2] + dz],
                        [min[0] + dx, min[1] + dy, min[2] + dz]
                    ];
                    var bottomLeft = data.dataDimensions.slice(0), topRight = [0, 0, 0];
                    for (var _i = 0, corners_1 = corners; _i < corners_1.length; _i++) {
                        var v = corners_1[_i];
                        var f = new LiteMol.Visualization.THREE.Vector3().fromArray(v).applyMatrix4(toFrac), af = [f.x, f.y, f.z];
                        for (var i = 0; i < 3; i++) {
                            bottomLeft[i] = Math.max(0, Math.min(bottomLeft[i], Math.floor(af[i]) | 0));
                            topRight[i] = Math.min(data.dataDimensions[i], Math.max(topRight[i], Math.ceil(af[i]) | 0));
                        }
                    }
                    return {
                        bottomLeft: bottomLeft,
                        topRight: topRight
                    };
                }
                function create(parent, transform, style) {
                    return Bootstrap.Task.create("Density Surface (" + parent.props.label + ")", style.computeOnBackground ? 'Silent' : 'Normal', function (ctx) {
                        var params = style.params;
                        var source = Bootstrap.Tree.Node.findClosestNodeOfType(parent, [Bootstrap.Entity.Density.Data]);
                        if (!source) {
                            ctx.reject('Cannot create density visual on ' + parent.props.label);
                            return;
                        }
                        var data = source.props.data;
                        var basis = data.basis;
                        var fromFrac = new LiteMol.Visualization.THREE.Matrix4().set(basis.x[0], basis.y[0], basis.z[0], 0.0, 0.0, basis.y[1], basis.z[1], 0.0, 0.0, 0.0, basis.z[2], 0.0, 0.0, 0.0, 0.0, 1.0);
                        fromFrac.setPosition(new LiteMol.Visualization.THREE.Vector3(data.origin[0], data.origin[1], data.origin[2]));
                        var toFrac = new LiteMol.Visualization.THREE.Matrix4().getInverse(fromFrac);
                        var min, max;
                        if (params.bottomLeft && params.topRight) {
                            var offsets = getOffsets(data, params.bottomLeft, params.topRight, toFrac);
                            min = offsets.bottomLeft;
                            max = offsets.topRight;
                        }
                        else {
                            min = [0, 0, 0];
                            max = data.dataDimensions;
                        }
                        if (!(min[0] - max[0]) || !(min[1] - max[1]) || !(min[2] - max[2])) {
                            ctx.reject({ warn: true, message: 'Empty box.' });
                            return;
                        }
                        var isoValue = data.valuesInfo.mean + data.valuesInfo.sigma * style.params.isoSigma;
                        var surface = Geom.MarchingCubes.compute({
                            isoLevel: isoValue,
                            scalarField: data.data,
                            bottomLeft: min,
                            topRight: max
                        }).bind(function (s) { return Geom.Surface.transform(s, fromFrac.elements)
                            .bind(function (s) { return Geom.Surface.laplacianSmooth(s, params.smoothing); }); }).run();
                        surface.progress.subscribe(function (p) { return ctx.update("Density Surface (" + source.props.label + "): " + Bootstrap.Utils.formatProgress(p), p.requestAbort); });
                        surface.result.then(function (s) {
                            var theme = style.theme.template.provider(source, Visualization.Theme.getProps(style.theme));
                            ctx.update('Creating visual...');
                            ctx.schedule(function () {
                                var surface = LiteMol.Visualization.Surface.Model.create(source, { surface: s, theme: theme, parameters: { isWireframe: style.params.isWireframe } }).run();
                                surface.progress.subscribe(function (p) { return ctx.update("Density Surface (" + source.props.label + "): " + Bootstrap.Utils.formatProgress(p), p.requestAbort); });
                                surface.result.then(function (model) {
                                    var label = "Surface, " + Bootstrap.Utils.round(params.isoSigma, 2) + " \u03C3";
                                    var visual = Bootstrap.Entity.Density.Visual.create(transform, { label: label, model: model, style: style, isSelectable: !style.isNotSelectable });
                                    ctx.resolve(visual);
                                }).catch(ctx.reject);
                            }, 0);
                        }).catch(ctx.reject);
                    });
                }
                Density.create = create;
            })(Density = Visualization.Density || (Visualization.Density = {}));
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Visualization;
        (function (Visualization) {
            var Density;
            (function (Density) {
                "use strict";
                var Style;
                (function (Style) {
                    function create(params) {
                        var colors = Default.Theme.colors.set('Uniform', params.color);
                        return {
                            type: {},
                            params: { isoSigma: params.isoSigma, smoothing: 1, isWireframe: !!params.isWireframe },
                            theme: { template: Default.Theme, colors: colors, transparency: params.transparency ? params.transparency : Default.Transparency, interactive: false }
                        };
                    }
                    Style.create = create;
                })(Style = Density.Style || (Density.Style = {}));
                var Default;
                (function (Default) {
                    Default.Params = {
                        isoSigma: 0,
                        smoothing: 1,
                        isWireframe: false
                    };
                    var Vis = LiteMol.Visualization;
                    var uniformBaseColor = Bootstrap.Immutable.Map({
                        'Uniform': Vis.Theme.Default.UniformColor,
                        'Highlight': Vis.Theme.Default.HighlightColor,
                        'Selection': Vis.Theme.Default.SelectionColor,
                    });
                    function uniformThemeProvider(e, props) {
                        return Vis.Theme.createUniform(props);
                    }
                    Default.Themes = [{
                            name: 'Uniform Color',
                            description: 'Same color everywhere.',
                            colors: uniformBaseColor,
                            provider: uniformThemeProvider
                        }
                    ];
                    Default.Transparency = { alpha: 1.0, writeDepth: false };
                    Default.Theme = Default.Themes[0];
                    Default.Style = { type: {}, params: Default.Params, theme: { template: Default.Theme, colors: Default.Theme.colors, transparency: Default.Transparency, interactive: false } };
                })(Default = Density.Default || (Density.Default = {}));
            })(Density = Visualization.Density || (Visualization.Density = {}));
        })(Visualization = Bootstrap.Visualization || (Bootstrap.Visualization = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        var Entity;
        (function (Entity) {
            function isClass(e, cls) {
                return e.type.info.typeClass === cls;
            }
            Entity.isClass = isClass;
            function isTypeClass(e, cls) {
                return e.info.typeClass === cls;
            }
            Entity.isTypeClass = isTypeClass;
            Entity.RootClass = 'Root';
            Entity.GroupClass = 'Group';
            Entity.DataClass = 'Data';
            Entity.ObjectClass = 'Object';
            Entity.VisualClass = 'Visual';
            Entity.SelectionClass = 'Selection';
            Entity.ActionClass = 'Action';
            Entity.BehaviourClass = 'Behaviour';
            var TypeImpl = (function () {
                function TypeImpl(id, info, traits) {
                    this.id = id;
                    this.info = info;
                    this.traits = traits;
                }
                TypeImpl.prototype.create = function (transform, props) {
                    var ret = {
                        id: Bootstrap.Tree.Node.createId(),
                        version: 0,
                        index: 0,
                        ref: 'undefined',
                        tag: void 0,
                        tree: void 0,
                        props: props,
                        state: { isCollapsed: false, visibility: 0 /* Full */ },
                        isHidden: false,
                        transform: transform,
                        parent: void 0,
                        children: [],
                        type: this
                    };
                    return Bootstrap.Tree.Node.update(ret);
                };
                return TypeImpl;
            }());
            function create(info, traits) {
                return new TypeImpl(Bootstrap.Utils.generateUUID(), info, traits ? traits : {});
            }
            Entity.create = create;
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            "use strict";
            function nodeUpdated(e) {
                if (!e.tree)
                    return;
                Bootstrap.Event.Tree.NodeUpdated.dispatch(e.tree.context, e);
                if (e.tree.context.currentEntity === e) {
                    Bootstrap.Event.Entity.CurrentChanged.dispatch(e.tree.context, e);
                }
            }
            Entity.nodeUpdated = nodeUpdated;
            function toggleExpanded(e) {
                var s = { isCollapsed: !e.state.isCollapsed };
                Bootstrap.Tree.Node.withState(e, s);
                nodeUpdated(e);
            }
            Entity.toggleExpanded = toggleExpanded;
            function setCurrent(e) {
                var old = e.tree.context.currentEntity;
                if (old === e || (e && e.isHidden))
                    return;
                var n = e.parent;
                while (n.parent !== n) {
                    if (n.isHidden) {
                        return;
                    }
                    n = n.parent;
                }
                e.tree.context.currentEntity = e;
                if (old) {
                    Bootstrap.Tree.Node.update(old);
                    nodeUpdated(old);
                }
                if (e) {
                    Bootstrap.Tree.Node.update(e);
                    nodeUpdated(e);
                }
                Bootstrap.Event.Entity.CurrentChanged.dispatch(e.tree.context, e);
                if (old)
                    Bootstrap.Tree.updatePath(old);
                Bootstrap.Tree.updatePath(e.parent);
            }
            Entity.setCurrent = setCurrent;
            // export function forceUpdate(e: Entity.Any) {
            //     if (!e.tree) return;
            //     Event.Tree.NodeUpdated.dispatch(e.tree.context, e);
            //     if (e.tree.context.currentEntity === e) {
            //         Event.Entity.CurrentChanged.dispatch(e.tree.context, e);
            //     }
            // } 
            function updateVisibilityState(entity) {
                if (!entity)
                    return;
                var fullCount = 0;
                var noneCount = 0;
                for (var _i = 0, _a = entity.children; _i < _a.length; _i++) {
                    var n = _a[_i];
                    var s = n.state.visibility;
                    if (s === 0 /* Full */)
                        fullCount++;
                    else if (s === 2 /* None */)
                        noneCount++;
                }
                var visibility;
                if (fullCount === entity.children.length)
                    visibility = 0 /* Full */;
                else if (noneCount === entity.children.length)
                    visibility = 2 /* None */;
                else
                    visibility = 1 /* Partial */;
                if (visibility !== entity.state.visibility) {
                    var s = { visibility: visibility };
                    Bootstrap.Tree.Node.withState(entity, s);
                    nodeUpdated(entity);
                }
                if (entity.parent !== entity)
                    updateVisibilityState(entity.parent);
            }
            Entity.updateVisibilityState = updateVisibilityState;
            function setVisibility(entity, visible) {
                if (!entity)
                    return;
                var newState = visible ? 0 /* Full */ : 2 /* None */;
                Bootstrap.Tree.Node.forEach(entity, function (n) {
                    var v = n.state.visibility;
                    if (v !== newState) {
                        var s = { visibility: newState };
                        Bootstrap.Tree.Node.withState(n, s);
                        nodeUpdated(n);
                    }
                });
                updateVisibilityState(entity.parent);
            }
            Entity.setVisibility = setVisibility;
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            "use strict";
            function isMolecule(e) {
                return e && e.type === Molecule.Molecule;
            }
            Entity.isMolecule = isMolecule;
            function isMoleculeModel(e) {
                return e && e.type === Molecule.Model;
            }
            Entity.isMoleculeModel = isMoleculeModel;
            function isMoleculeSelection(e) {
                return e && e.type === Molecule.Selection;
            }
            Entity.isMoleculeSelection = isMoleculeSelection;
            function isVisual(e) {
                return e && e.type.info.typeClass === Entity.VisualClass;
            }
            Entity.isVisual = isVisual;
            /* Base */
            Entity.RootTransform = Bootstrap.Tree.Transform.create({}, {}, void 0);
            Entity.Root = Entity.create({ name: 'Root', typeClass: 'Root', shortName: 'R', description: 'Where everything begins.' });
            Entity.Group = Entity.create({ name: 'Group', typeClass: 'Group', shortName: 'G', description: 'A group on entities.' });
            Entity.Action = Entity.create({ name: 'Action', typeClass: 'Action', shortName: 'A', description: 'Represents an action performed on the entity tree.' });
            /* Data */
            var Data;
            (function (Data) {
                Data.Types = ['String', 'Binary'];
                Data.String = Entity.create({ name: 'String Data', typeClass: 'Data', shortName: 'S_D', description: 'A string.' });
                Data.Binary = Entity.create({ name: 'Binary Data', typeClass: 'Data', shortName: 'B_D', description: 'A binary blob.' });
                Data.CifDictionary = Entity.create({ name: 'Cif Dictionary', typeClass: 'Data', shortName: 'CD', description: 'Represents parsed CIF data.' });
                Data.Json = Entity.create({ name: 'JSON Data', typeClass: 'Data', shortName: 'JS_D', description: 'Represents JSON data.' });
            })(Data = Entity.Data || (Entity.Data = {}));
            /* Molecule */
            var Molecule;
            (function (Molecule_1) {
                Molecule_1.Molecule = Entity.create({ name: 'Molecule', typeClass: 'Object', shortName: 'M', description: 'A molecule that might contain one or more models.' });
                Molecule_1.Model = Entity.create({ name: 'Molecule Model', typeClass: 'Object', shortName: 'M_M', description: 'A model of a molecule.' });
                Molecule_1.Selection = Entity.create({ name: 'Molecule Model Selection', typeClass: 'Selection', shortName: 'S_M', description: 'A selection of atoms.' }, { isFocusable: true });
                Molecule_1.Visual = Entity.create({ name: 'Molecule Visual', typeClass: 'Visual', shortName: 'V_M', description: 'A visual of a molecule.' }, { isFocusable: true });
                var CoordinateStreaming;
                (function (CoordinateStreaming) {
                    CoordinateStreaming.Behaviour = Entity.create({ name: 'Coordinate Streaming', typeClass: 'Behaviour', shortName: 'CS', description: 'Behaviour that downloads surrounding residues when an atom or residue is selected.' });
                })(CoordinateStreaming = Molecule_1.CoordinateStreaming || (Molecule_1.CoordinateStreaming = {}));
            })(Molecule = Entity.Molecule || (Entity.Molecule = {}));
            /* Density */
            var Density;
            (function (Density) {
                Density.Data = Entity.create({ name: 'Density Data', typeClass: 'Object', shortName: 'DD', description: 'Density data.' });
                Density.Visual = Entity.create({ name: 'Density Visual', typeClass: 'Visual', shortName: 'V_DD', description: 'A visual of density data.' }, { isFocusable: true });
                Density.InteractiveSurface = Entity.create({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_IS', description: 'Behaviour that creates an interactive surface when an atom or residue is selected.' });
            })(Density = Entity.Density || (Entity.Density = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            "use strict";
            var Cache = (function () {
                function Cache(context) {
                    var _this = this;
                    this.data = new Map();
                    Bootstrap.Event.Tree.NodeRemoved.getStream(context).subscribe(function (e) { return _this.data.delete(e.data.id); });
                }
                Cache.prototype.get = function (e, prop) {
                    var c = this.data.get(e.id);
                    if (c)
                        return c[prop];
                    return void 0;
                };
                Cache.prototype.set = function (e, prop, value) {
                    var c = this.data.get(e.id);
                    if (c) {
                        c[prop] = value;
                    }
                    else {
                        this.data.set(e.id, (_a = {}, _a[prop] = value, _a));
                    }
                    return value;
                    var _a;
                };
                return Cache;
            }());
            Entity.Cache = Cache;
            var Cache;
            (function (Cache) {
                var Keys;
                (function (Keys) {
                    Keys.QueryContext = 'queryContext';
                })(Keys = Cache.Keys || (Cache.Keys = {}));
            })(Cache = Entity.Cache || (Entity.Cache = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            var Transformer;
            (function (Transformer_1) {
                var Basic;
                (function (Basic) {
                    "use strict";
                    var Transformer = Bootstrap.Tree.Transformer;
                    Basic.Root = Transformer.create({
                        id: 'root',
                        name: 'Root',
                        description: 'A transformer that always returns itself.',
                        from: [Entity.Root],
                        to: [Entity.Root],
                        validateParams: function () { return void 0; },
                        defaultParams: function () { return ({}); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.resolve('Root', 'Silent', a);
                    });
                    Basic.CreateGroup = Transformer.create({
                        id: 'create-group',
                        name: 'Create Group',
                        description: 'A transformer that always returns itself.',
                        from: [],
                        to: [Entity.Group],
                        validateParams: function () { return void 0; },
                        defaultParams: function () { return ({}); }
                    }, function (ctx, a, t) {
                        var group = Entity.Group.create(t, { label: t.params.label ? t.params.label : 'Group', description: t.params.description });
                        if (t.params.isCollapsed) {
                            var s = { isCollapsed: true };
                            group = Bootstrap.Tree.Node.withState(group, s);
                        }
                        return Bootstrap.Task.resolve('Group', 'Silent', group);
                    });
                    function group(info, transformers) {
                        return Transformer.create(info, function (context, source, parent) {
                            return Bootstrap.Task.create(info.name, 'Background', function (ctx) {
                                var group = Basic.CreateGroup.create({ label: info.name }).apply(context, source);
                                group.run(context).then(function (g) {
                                    var promises = transformers.map(function (t) { return function () { return Bootstrap.Task.guardedPromise(context, function (resolve, reject) {
                                        var params = t.params(parent.params, source);
                                        if (!params) {
                                            resolve(void 0);
                                            return;
                                        }
                                        var transform = t.transformer.create(params, { isBinding: true });
                                        transform.apply(context, g).run(context).then(function (b) {
                                            resolve(b);
                                        }).catch(reject);
                                    }); }; });
                                    Bootstrap.Task.sequencePromises(promises, true).then(function () {
                                        ctx.resolve(g);
                                    }).catch(ctx.reject);
                                });
                            });
                        });
                    }
                    Basic.group = group;
                })(Basic = Transformer_1.Basic || (Transformer_1.Basic = {}));
            })(Transformer = Entity.Transformer || (Entity.Transformer = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            var Transformer;
            (function (Transformer) {
                var Molecule;
                (function (Molecule) {
                    "use strict";
                    function downloadMoleculeSource(params) {
                        return Bootstrap.Tree.Transformer.action({
                            id: 'molecule-download-molecule-' + params.sourceId,
                            name: 'Molecule from ' + params.name,
                            description: params.description,
                            from: [Entity.Root],
                            to: [Entity.Action],
                            defaultParams: function (ctx) { return ({ id: params.defaultId, format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF }); },
                            validateParams: function (p) { return (!p.id || !p.id.trim().length) ? [("Enter " + (params.isFullUrl ? 'Url' : 'Id'))] : void 0; }
                        }, function (context, a, t) { return Bootstrap.Tree.Transform.build()
                            .add(a, Transformer.Data.Download, { url: params.urlTemplate(t.params.id.trim()), type: 'String', id: t.params.id, description: params.name })
                            .then(Molecule.CreateFromString, { format: params.specificFormat ? params.specificFormat : t.params.format }, { isBinding: true })
                            .then(Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false }); });
                    }
                    Molecule.downloadMoleculeSource = downloadMoleculeSource;
                    Molecule.OpenMoleculeFromFile = Bootstrap.Tree.Transformer.action({
                        id: 'molecule-open-from-file',
                        name: 'Molecule from File',
                        description: 'Open a molecule from a file (mmCIF, PDB, SDF/MOL).',
                        from: [Entity.Root],
                        to: [Entity.Action],
                        defaultParams: function (ctx) { return ({ format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF }); },
                        validateParams: function (p) { return !p.file ? ['Select a file'] : !LiteMol.Core.Formats.FormatInfo.getFormat(p.file.name, LiteMol.Core.Formats.Molecule.SupportedFormats.All) ? ['Select a supported (.cif,.pdb,.ent) file.'] : void 0; }
                    }, function (context, a, t) { return Bootstrap.Tree.Transform.build()
                        .add(a, Transformer.Data.OpenFile, { file: t.params.file, type: 'String' })
                        .then(Molecule.CreateFromString, { format: LiteMol.Core.Formats.FormatInfo.getFormat(t.params.file.name, LiteMol.Core.Formats.Molecule.SupportedFormats.All) }, { isBinding: true })
                        .then(Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false }); });
                    Molecule.CreateFromString = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-from-string',
                        name: 'Molecule',
                        description: 'Create a molecule from string data.',
                        from: [Entity.Data.String],
                        to: [Entity.Molecule.Molecule],
                        defaultParams: function (ctx) { return ({ format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF }); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.fromComputation("Create Molecule (" + a.props.label + ")", 'Normal', LiteMol.Core.Formats.Molecule.parse(t.params.format, a.props.data, t.params.customId))
                            .setReportTime(true)
                            .bind("Create Molecule (" + a.props.label + ")", 'Silent', function (r) {
                            if (r.error)
                                return Bootstrap.Task.reject("Create Molecule (" + a.props.label + ")", 'Background', r.error.toString());
                            if (r.warnings && r.warnings.length > 0) {
                                for (var _i = 0, _a = r.warnings; _i < _a.length; _i++) {
                                    var w = _a[_i];
                                    ctx.logger.warning(w);
                                }
                            }
                            var e = Entity.Molecule.Molecule.create(t, { label: r.result.id, molecule: r.result });
                            return Bootstrap.Task.resolve("Create Molecule (" + a.props.label + ")", 'Background', e);
                        });
                    });
                    Molecule.CreateFromMmCif = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-from-mmcif',
                        name: 'Molecule',
                        description: 'Create a molecule from a mmCIF data block.',
                        from: [Entity.Data.CifDictionary],
                        to: [Entity.Molecule.Molecule],
                        defaultParams: function (ctx) { return ({ blockIndex: 0 }); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Create Molecule (" + a.props.label + ")", 'Normal', function (ctx) {
                            ctx.update('Creating...');
                            var index = t.params.blockIndex | 0;
                            var b = a.props.dictionary.dataBlocks[index];
                            if (!b) {
                                ctx.reject("The source contains only " + a.props.dictionary.dataBlocks.length + " data block(s), tried to access the " + (index + 1) + "-th.");
                                return;
                            }
                            ctx.schedule(function () {
                                var molecule = LiteMol.Core.Formats.Molecule.mmCIF.ofDataBlock(b);
                                ctx.resolve(Entity.Molecule.Molecule.create(t, { label: molecule.id, molecule: molecule }));
                            });
                        }).setReportTime(true);
                    });
                    Molecule.CreateModel = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-model',
                        name: 'Model',
                        description: 'Create a model of a molecule.',
                        from: [Entity.Molecule.Molecule],
                        to: [Entity.Molecule.Model],
                        isUpdatable: true,
                        defaultParams: function (ctx) { return ({ modelIndex: 0 }); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Create Model (" + a.props.label + ")", 'Background', function (ctx) {
                            var params = t.params;
                            var index = params.modelIndex | 0;
                            var model = a.props.molecule.models[index];
                            if (!model) {
                                ctx.reject("The molecule contains only " + a.props.molecule.models.length + " model(s), tried to access the " + (index + 1) + "-th.");
                                return;
                            }
                            ctx.resolve(Entity.Molecule.Model.create(t, {
                                label: 'Model ' + model.modelId,
                                description: model.atoms.count + " atom" + (model.atoms.count !== 1 ? 's' : ''),
                                model: model
                            }));
                        });
                    });
                    Molecule.CreateSelection = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-selection',
                        name: 'Selection',
                        description: 'Create an atom selection.',
                        from: [Entity.Molecule.Model, Entity.Molecule.Visual],
                        to: [Entity.Molecule.Selection],
                        isUpdatable: true,
                        defaultParams: function (ctx) { return ({ queryString: ctx.settings.get('molecule.model.defaultQuery') || '' }); },
                        validateParams: function (p) {
                            if (!(p.queryString || '').trim().length)
                                return ['Enter query'];
                            try {
                                var q = LiteMol.Core.Structure.Query.Builder.toQuery(p.queryString);
                                return void 0;
                            }
                            catch (e) {
                                return ['' + e];
                            }
                        },
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Create Selection (" + a.props.label + ")", 'Background', function (ctx) {
                            var params = t.params;
                            var query = LiteMol.Core.Structure.Query.Builder.toQuery(params.queryString);
                            var queryCtx = t.params.inFullContext ? Bootstrap.Utils.Molecule.findModel(a).props.model.queryContext : Bootstrap.Utils.Molecule.findQueryContext(a);
                            var indices = query(queryCtx).unionAtomIndices();
                            if (!indices.length) {
                                ctx.reject({ warn: true, message: "Empty selection" + (t.params.name ? ' (' + t.params.name + ')' : '') + "." });
                                return;
                            }
                            ctx.resolve(Entity.Molecule.Selection.create(t, { label: params.name ? params.name : 'Selection', description: indices.length + " atom" + (indices.length !== 1 ? 's' : ''), indices: indices }));
                        }).setReportTime(!t.params.silent);
                    });
                    Molecule.CreateSelectionFromQuery = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-selection',
                        name: 'Selection',
                        description: 'Create an atom selection.',
                        from: [Entity.Molecule.Model, Entity.Molecule.Visual],
                        to: [Entity.Molecule.Selection],
                        defaultParams: function (ctx) { return ({}); },
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Create Selection (" + a.props.label + ")", 'Background', function (ctx) {
                            var params = t.params;
                            var query = LiteMol.Core.Structure.Query.Builder.toQuery(params.query);
                            var queryCtx = t.params.inFullContext ? Bootstrap.Utils.Molecule.findModel(a).props.model.queryContext : Bootstrap.Utils.Molecule.findQueryContext(a);
                            var indices = query(queryCtx).unionAtomIndices();
                            if (!indices.length) {
                                ctx.reject({ warn: true, message: "Empty selection" + (t.params.name ? ' (' + t.params.name + ')' : '') + "." });
                                return;
                            }
                            ctx.resolve(Entity.Molecule.Selection.create(t, { label: params.name ? params.name : 'Selection', description: indices.length + " atom" + (indices.length !== 1 ? 's' : ''), indices: indices }));
                        }).setReportTime(!t.params.silent);
                    });
                    Molecule.CreateAssembly = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-assemly',
                        name: 'Assembly',
                        description: 'Create an assembly of a molecule.',
                        from: [Entity.Molecule.Model],
                        to: [Entity.Molecule.Model],
                        defaultParams: function (ctx, e) {
                            var m = Bootstrap.Utils.Molecule.findModel(e);
                            var ret = ({ name: ctx.settings.get('molecule.model.defaultAssemblyName') || '1' });
                            var asm = m.props.model.assemblyInfo;
                            if (!asm || !asm.assemblies.length)
                                return ret;
                            if (asm.assemblies.filter(function (a) { return a.name === ret.name; }))
                                return ret;
                            ret.name = asm.assemblies[0].name;
                            return ret;
                        },
                        isUpdatable: true,
                        isApplicable: function (m) { return !!(m && m.props.model.assemblyInfo && m.props.model.assemblyInfo.assemblies.length); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Create Model (" + a.props.label + ")", 'Background', function (ctx) {
                            var i = a.props.model.assemblyInfo;
                            if (!i || !i.assemblies.length) {
                                ctx.reject('Assembly info not available.');
                                return;
                            }
                            var gen = i.assemblies.filter(function (a) { return a.name === t.params.name; })[0];
                            if (!gen) {
                                ctx.reject("No assembly called '" + t.params.name + "' found.");
                                return;
                            }
                            ctx.update('Creating...');
                            ctx.schedule(function () {
                                var asm = LiteMol.Core.Structure.buildAssembly(a.props.model, gen);
                                ctx.resolve(Entity.Molecule.Model.create(t, {
                                    label: 'Assembly ' + gen.name,
                                    description: asm.atoms.count + " atom" + (asm.atoms.count !== 1 ? 's' : ''),
                                    model: asm
                                }));
                            });
                        });
                    });
                    Molecule.CreateSymmetryMates = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-symmetry-mates',
                        name: 'Crystal Symmetry',
                        description: 'Find crystal symmetry mates or interaction partners.',
                        from: [Entity.Molecule.Model],
                        to: [Entity.Molecule.Model],
                        defaultParams: function (ctx) { return ({ type: 'Interaction', radius: 5.0 }); },
                        isUpdatable: true,
                        isApplicable: function (m) { return !!(m && m.props.model.symmetryInfo); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Create Model (" + a.props.label + ")", 'Background', function (ctx) {
                            var i = a.props.model.symmetryInfo;
                            if (!i) {
                                ctx.reject('Spacegroup info info not available.');
                                return;
                            }
                            var radius = Math.max(t.params.radius, 0);
                            ctx.update('Creating...');
                            ctx.schedule(function () {
                                var symm = t.params.type === 'Mates' ? LiteMol.Core.Structure.buildSymmetryMates(a.props.model, radius) : LiteMol.Core.Structure.buildPivotGroupSymmetry(a.props.model, radius);
                                ctx.resolve(Entity.Molecule.Model.create(t, {
                                    label: 'Symmetry',
                                    model: symm,
                                    description: symm.atoms.count + " atom" + (symm.atoms.count !== 1 ? 's' : '') + ", " + t.params.type + " " + Bootstrap.Utils.round(radius, 1) + " \u212B"
                                }));
                            });
                        });
                    });
                    Molecule.CreateVisual = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-visual',
                        name: 'Visual',
                        description: 'Create a visual of a molecule or a selection.',
                        from: [Entity.Molecule.Model, Entity.Molecule.Selection],
                        to: [Entity.Molecule.Visual],
                        isUpdatable: true,
                        defaultParams: function (ctx) { return ({ style: Bootstrap.Visualization.Molecule.Default.ForType.get('Cartoons') }); },
                        validateParams: function (p) { return !p.style ? ['Specify Style'] : void 0; },
                        customController: function (ctx, t, e) { return new Bootstrap.Components.Transform.MoleculeVisual(ctx, t, e); }
                    }, function (ctx, a, t) {
                        var params = t.params;
                        return Bootstrap.Visualization.Molecule.create(a, t, params.style).setReportTime(!t.params.style.computeOnBackground);
                    }, function (ctx, b, t) {
                        var oldParams = b.transform.params;
                        if (oldParams.style.type !== t.params.style.type || !Bootstrap.Utils.deepEqual(oldParams.style.params, t.params.style.params))
                            return void 0;
                        var model = b.props.model;
                        if (!model)
                            return void 0;
                        var a = Bootstrap.Utils.Molecule.findModel(b.parent);
                        if (!a)
                            return void 0;
                        var ti = t.params.style.theme;
                        var theme = ti.template.provider(a, Bootstrap.Visualization.Theme.getProps(ti));
                        model.applyTheme(theme);
                        b.props.style.theme = ti;
                        //Entity.forceUpdate(b);
                        Entity.nodeUpdated(b);
                        return Bootstrap.Task.resolve(t.transformer.info.name, 'Background', Bootstrap.Tree.Node.Null);
                    });
                    Molecule.CreateMacromoleculeVisual = Bootstrap.Tree.Transformer.create({
                        id: 'molecule-create-macromolecule-visual',
                        name: 'Macromolecule Visual',
                        description: 'Create a visual of a molecule that is split into polymer, HET, and water parts.',
                        from: [Entity.Molecule.Model],
                        to: [Entity.Action],
                        validateParams: function (p) { return !p.polymer && !p.het && !p.water ? ['Select at least one component'] : void 0; },
                        defaultParams: function (ctx) { return ({ polymer: true, het: true, water: true }); },
                    }, function (context, a, t) {
                        return Bootstrap.Task.create('Macromolecule', 'Normal', function (ctx) {
                            var g = Bootstrap.Tree.Transform.build().add(a, Transformer.Basic.CreateGroup, { label: 'Group', description: 'Macromolecule' }, { ref: t.params.groupRef });
                            if (t.params.polymer) {
                                var polymer = g.then(Molecule.CreateSelectionFromQuery, { query: LiteMol.Core.Structure.Query.nonHetPolymer(), name: 'Polymer', silent: true }, { isBinding: true });
                                polymer.then(Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('Cartoons') }, { ref: t.params.polymerRef });
                            }
                            if (t.params.het) {
                                var het = g.then(Molecule.CreateSelectionFromQuery, { query: LiteMol.Core.Structure.Query.hetGroups(), name: 'HET', silent: true }, { isBinding: true });
                                het.then(Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, { ref: t.params.hetRef });
                            }
                            if (t.params.water) {
                                var style = {
                                    type: 'BallsAndSticks',
                                    params: { useVDW: false, atomRadius: 0.23, bondRadius: 0.09, detail: 'Automatic' },
                                    theme: { template: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 0.25 } }
                                };
                                var water = g.then(Molecule.CreateSelectionFromQuery, { query: LiteMol.Core.Structure.Query.entities({ type: 'water' }), name: 'Water', silent: true }, { isBinding: true });
                                water.then(Molecule.CreateVisual, { style: style }, { ref: t.params.waterRef });
                            }
                            Bootstrap.Tree.Transform.apply(context, g).run(context)
                                .then(function (r) { return ctx.resolve(Bootstrap.Tree.Node.Null); })
                                .catch(ctx.reject);
                        });
                    });
                })(Molecule = Transformer.Molecule || (Transformer.Molecule = {}));
            })(Transformer = Entity.Transformer || (Entity.Transformer = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            var Transformer;
            (function (Transformer) {
                var Data;
                (function (Data) {
                    "use strict";
                    Data.Download = Bootstrap.Tree.Transformer.create({
                        id: 'data-download',
                        name: 'Download Data',
                        description: 'Downloads a string or binary data from the given URL (if the host server supports cross domain requests).',
                        from: [Entity.Root],
                        to: [Entity.Data.String, Entity.Data.Binary],
                        validateParams: function (p) { return !p.url || !p.url.trim().length ? ['Enter Url'] : !p.type ? ['Specify type'] : void 0; },
                        defaultParams: function () { return ({ id: '', description: '', type: 'String', url: '' }); }
                    }, function (ctx, a, t) {
                        var params = t.params;
                        return Bootstrap.Utils.ajaxGet(params.url, params.type).setReportTime(true)
                            .map('ToEntity', 'Child', function (data) {
                            if (params.type === 'String')
                                return Entity.Data.String.create(t, { label: params.id ? params.id : params.url, description: params.description, data: data });
                            else
                                return Entity.Data.Binary.create(t, { label: params.id ? params.id : params.url, description: params.description, data: data });
                        });
                    });
                    Data.OpenFile = Bootstrap.Tree.Transformer.create({
                        id: 'data-open-file',
                        name: 'Open Data File',
                        description: 'Read a string or binary data from the selected file.',
                        from: [Entity.Root],
                        to: [Entity.Data.String, Entity.Data.Binary],
                        validateParams: function (p) { return !p.file ? ['Select a file'] : void 0; },
                        defaultParams: function () { return ({ type: 'String', file: void 0 }); }
                    }, function (ctx, a, t) {
                        var params = t.params;
                        return Bootstrap.Utils.readFromFile(params.file, params.type).setReportTime(true)
                            .map('ToEntity', 'Child', function (data) {
                            if (params.type === 'String')
                                return Entity.Data.String.create(t, { label: params.id ? params.id : params.file.name, description: params.description, data: data });
                            else
                                return Entity.Data.Binary.create(t, { label: params.id ? params.id : params.file.name, description: params.description, data: data });
                        });
                    });
                    Data.ParseCif = Bootstrap.Tree.Transformer.create({
                        id: 'data-parse-cif',
                        name: 'CIF Dictionary',
                        description: 'Parse CIF dictionary from a string.',
                        from: [Entity.Data.String],
                        to: [Entity.Data.CifDictionary],
                        defaultParams: function () { return ({}); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("CIF Parse (" + a.props.label + ")", 'Normal', function (ctx) {
                            ctx.update('Parsing...');
                            ctx.schedule(function () {
                                var d = LiteMol.Core.Formats.CIF.parse(a.props.data);
                                if (d.error) {
                                    ctx.reject(d.error.toString());
                                    return;
                                }
                                ctx.resolve(Entity.Data.CifDictionary.create(t, { label: t.params.id ? t.params.id : 'CIF Dictionary', description: t.params.description, dictionary: d.result }));
                            });
                        }).setReportTime(true);
                    });
                    Data.ParseJson = Bootstrap.Tree.Transformer.create({
                        id: 'data-parse-json',
                        name: 'JSON',
                        description: 'Parse a string to JSON object.',
                        from: [Entity.Data.String],
                        to: [Entity.Data.Json],
                        defaultParams: function () { return ({}); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("JSON Parse (" + a.props.label + ")", 'Normal', function (ctx) {
                            ctx.update('Parsing...');
                            ctx.schedule(function () {
                                var data = JSON.parse(a.props.data);
                                ctx.resolve(Entity.Data.Json.create(t, { label: t.params.id ? t.params.id : 'JSON Data', description: t.params.description, data: data }));
                            });
                        }).setReportTime(true);
                    });
                })(Data = Transformer.Data || (Transformer.Data = {}));
            })(Transformer = Entity.Transformer || (Entity.Transformer = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            var Transformer;
            (function (Transformer) {
                var Density;
                (function (Density) {
                    "use strict";
                    Density.ParseBinary = Bootstrap.Tree.Transformer.create({
                        id: 'density-parse-binary',
                        name: 'Density Data',
                        description: 'Parse density from binary data.',
                        from: [Entity.Data.Binary],
                        to: [Entity.Density.Data],
                        isUpdatable: true,
                        defaultParams: function () { return ({ format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, normalize: false }); }
                    }, function (ctx, a, t) {
                        return Bootstrap.Task.create("Parse Density (" + a.props.label + ")", 'Normal', function (ctx) {
                            ctx.update('Parsing...');
                            ctx.schedule(function () {
                                var format = t.params.format || LiteMol.Core.Formats.Density.SupportedFormats.CCP4;
                                var data = LiteMol.Core.Formats.Density.parse(format, a.props.data);
                                if (data.error) {
                                    ctx.reject(data.error.toString());
                                    return;
                                }
                                if (t.params.normalize) {
                                    data.result.normalize();
                                }
                                ctx.resolve(Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data: data.result, description: t.params.normalize ? 'Normalized' : '' }));
                            });
                        }).setReportTime(true);
                    }, function (ctx, b, t) {
                        if (b.props.data.isNormalized === t.params.normalize)
                            return Bootstrap.Task.resolve('Density', 'Background', Bootstrap.Tree.Node.Null);
                        return Bootstrap.Task.create('Update Density', 'Normal', function (ctx) {
                            ctx.update('Updating...');
                            ctx.schedule(function () {
                                var data = b.props.data;
                                if (data.isNormalized)
                                    data.denormalize();
                                else
                                    data.normalize();
                                ctx.resolve(Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data: data, description: t.params.normalize ? 'Normalized' : '' }));
                            });
                        });
                    });
                    Density.CreateVisual = Bootstrap.Tree.Transformer.create({
                        id: 'density-create-visual',
                        name: 'Surface',
                        description: 'Create a surface from the density data.',
                        from: [Entity.Density.Data],
                        to: [Entity.Density.Visual],
                        isUpdatable: true,
                        defaultParams: function () { return ({ style: Bootstrap.Visualization.Density.Default.Style }); },
                        validateParams: function (p) { return !p.style ? ['Specify Style'] : void 0; },
                        customController: function (ctx, t, e) { return new Bootstrap.Components.Transform.DensityVisual(ctx, t, e); },
                    }, function (ctx, a, t) {
                        var params = t.params;
                        return Bootstrap.Visualization.Density.create(a, t, params.style).setReportTime(!t.params.style.computeOnBackground);
                    }, function (ctx, b, t) {
                        var oldParams = b.transform.params;
                        if (oldParams.style.type !== t.params.style.type || !Bootstrap.Utils.deepEqual(oldParams.style.params, t.params.style.params))
                            return void 0;
                        var parent = Bootstrap.Tree.Node.findClosestNodeOfType(b, [Entity.Density.Data]);
                        if (!parent)
                            return void 0;
                        var model = b.props.model;
                        if (!model)
                            return void 0;
                        var ti = t.params.style.theme;
                        var theme = ti.template.provider(parent, Bootstrap.Visualization.Theme.getProps(ti));
                        model.applyTheme(theme);
                        b.props.style.theme = ti;
                        //Entity.forceUpdate(b);
                        Entity.nodeUpdated(b);
                        return Bootstrap.Task.resolve(t.transformer.info.name, 'Background', Bootstrap.Tree.Node.Null);
                    });
                    Density.CreateVisualBehaviour = Bootstrap.Tree.Transformer.create({
                        id: 'density-create-visual-behaviour',
                        name: 'Interactive Surface',
                        description: 'Create a surface from the density data when a residue or atom is selected.',
                        from: [Entity.Density.Data],
                        to: [Entity.Density.InteractiveSurface],
                        isUpdatable: true,
                        defaultParams: function (ctx) { return ({ style: Bootstrap.Visualization.Density.Default.Style, radius: ctx.settings.get('density.defaultVisualBehaviourRadius') || 0, isoSigmaMin: -5, isoSigmaMax: 5 }); },
                        customController: function (ctx, t, e) { return new Bootstrap.Components.Transform.DensityVisual(ctx, t, e); },
                    }, function (ctx, a, t) {
                        var params = t.params;
                        var b = new Bootstrap.Behaviour.Density.ShowElectronDensityAroundSelection(ctx, {
                            style: params.style,
                            radius: params.radius
                        });
                        return Bootstrap.Task.resolve('Behaviour', 'Background', Entity.Density.InteractiveSurface.create(t, { label: (t.params.id ? t.params.id : 'Interactive') + ", " + Bootstrap.Utils.round(t.params.style.params.isoSigma, 2) + " \u03C3", behaviour: b }));
                    });
                })(Density = Transformer.Density || (Transformer.Density = {}));
            })(Transformer = Entity.Transformer || (Entity.Transformer = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Entity;
        (function (Entity) {
            var Transformer;
            (function (Transformer) {
                var Molecule;
                (function (Molecule) {
                    var CoordinateStreaming;
                    (function (CoordinateStreaming) {
                        "use strict";
                        CoordinateStreaming.CreateBehaviour = Bootstrap.Tree.Transformer.create({
                            id: 'streaming-create-behaviour',
                            name: 'Coordinate Streaming',
                            description: 'Enable coordinate data streaming for this molecule.',
                            from: [Entity.Molecule.Model],
                            to: [Entity.Molecule.CoordinateStreaming.Behaviour],
                            defaultParams: function (ctx) { return ({ server: ctx.settings.get('molecule.coordinateStreaming.defaultServer') || '', radius: ctx.settings.get('molecule.coordinateStreaming.defaultRadius') || 0 }); },
                        }, function (ctx, a, t) {
                            return Bootstrap.Task.resolve('Behaviour', 'Background', Entity.Molecule.CoordinateStreaming.Behaviour.create(t, { label: "Coordinate Streaming", behaviour: new Bootstrap.Behaviour.Molecule.CoordinateStreaming(ctx, t.params.server, t.params.radius) }));
                        });
                        CoordinateStreaming.CreateModel = Bootstrap.Tree.Transformer.create({
                            id: 'streaming-create-model',
                            name: 'Streaming Model',
                            description: '',
                            from: [Entity.Molecule.CoordinateStreaming.Behaviour],
                            to: [Entity.Molecule.Model],
                            defaultParams: function () { return ({}); }
                        }, function (ctx, a, t) {
                            return Bootstrap.Task.create('Load', 'Silent', function (ctx) {
                                var cif = LiteMol.Core.Formats.CIF.parse(t.params.data).result;
                                var model = LiteMol.Core.Formats.Molecule.mmCIF.ofDataBlock(cif.dataBlocks[0]).models[0];
                                if (t.params.transform)
                                    LiteMol.Core.Structure.Operator.applyToModelUnsafe(t.params.transform, model);
                                ctx.resolve(Entity.Molecule.Model.create(t, { label: 'part', model: model }));
                            });
                        });
                        CoordinateStreaming.InitStreaming = Bootstrap.Tree.Transformer.create({
                            id: 'streaming-init',
                            name: 'Coordinate Streaming',
                            description: 'Download a smaller version of the molecule required to display cartoon representation and stream the rest of the coordinates as required.',
                            from: [Entity.Root],
                            to: [Entity.Action],
                            validateParams: function (p) { return !(p.id || '').trim().length ? ['Enter id'] : !(p.server || '').trim().length ? ['Specify server'] : void 0; },
                            defaultParams: function (ctx) { return ({ id: ctx.settings.get('molecule.coordinateStreaming.defaultId') || '', server: ctx.settings.get('molecule.coordinateStreaming.defaultServer') || '', radius: ctx.settings.get('molecule.coordinateStreaming.defaultRadius') || 0 }); },
                        }, function (context, a, t) {
                            return Bootstrap.Task.create('Macromolecule', 'Normal', function (ctx) {
                                var action = Bootstrap.Tree.Transform.build()
                                    .add(a, Transformer.Data.Download, { url: Bootstrap.Behaviour.Molecule.CoordinateStreaming.getBaseUrl(t.params.id, t.params.server), type: 'String', id: t.params.id })
                                    .then(Transformer.Data.ParseCif, { id: t.params.id }, { isBinding: true })
                                    .then(Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
                                    .then(Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false })
                                    .then(CoordinateStreaming.CreateBehaviour, { server: t.params.server, radius: t.params.radius });
                                Bootstrap.Tree.Transform.apply(context, action).run(context)
                                    .then(function (r) { return ctx.resolve(Bootstrap.Tree.Node.Null); })
                                    .catch(ctx.reject);
                            });
                        });
                    })(CoordinateStreaming = Molecule.CoordinateStreaming || (Molecule.CoordinateStreaming = {}));
                })(Molecule = Transformer.Molecule || (Transformer.Molecule = {}));
            })(Transformer = Entity.Transformer || (Entity.Transformer = {}));
        })(Entity = Bootstrap.Entity || (Bootstrap.Entity = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Behaviour;
        (function (Behaviour) {
            "use strict";
            var Streams = (function () {
                function Streams(context) {
                    this.context = context;
                    this.subjects = {
                        select: new Bootstrap.Rx.BehaviorSubject({}),
                        click: new Bootstrap.Rx.BehaviorSubject({}),
                        currentEntity: new Bootstrap.Rx.BehaviorSubject(void 0)
                    };
                    this.select = this.subjects.select.distinctUntilChanged(function (i) { return i; }, Bootstrap.Interactivity.interactivityInfoEqual);
                    this.click = this.subjects.click.distinctUntilChanged(function (i) { return i; }, Bootstrap.Interactivity.interactivityInfoEqual);
                    this.currentEntity = this.subjects.currentEntity;
                    this.init();
                }
                Streams.prototype.init = function () {
                    var _this = this;
                    var emptyClick = {};
                    var latestClick = emptyClick;
                    Bootstrap.Event.Tree.NodeRemoved.getStream(this.context).subscribe(function (e) {
                        if ((latestClick !== emptyClick) && (latestClick.entity === e.data || latestClick.visual === e.data)) {
                            latestClick = emptyClick;
                            Bootstrap.Event.Visual.VisualSelectElement.dispatch(_this.context, {});
                        }
                    });
                    Bootstrap.Event.Visual.VisualSelectElement.getStream(this.context).subscribe(function (e) {
                        latestClick = e.data.entity ? e.data : emptyClick;
                        _this.subjects.click.onNext(e.data);
                        if (e.data.visual && !e.data.visual.props.isSelectable)
                            return;
                        _this.subjects.select.onNext(e.data);
                    });
                    Bootstrap.Event.Entity.CurrentChanged.getStream(this.context).subscribe(function (e) { return _this.subjects.currentEntity.onNext(e.data); });
                };
                return Streams;
            }());
            Behaviour.Streams = Streams;
        })(Behaviour = Bootstrap.Behaviour || (Bootstrap.Behaviour = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Behaviour;
        (function (Behaviour) {
            "use strict";
            //////////////////////////////////////////////////
            function SetEntityToCurrentWhenAdded(context) {
                Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(function (ev) {
                    var e = ev.data;
                    if (e && (e.transform.isUpdate || e.type.traits.isSilent))
                        return;
                    Bootstrap.Command.Entity.SetCurrent.dispatch(context, e);
                });
            }
            Behaviour.SetEntityToCurrentWhenAdded = SetEntityToCurrentWhenAdded;
            function CreateVisualWhenModelIsAdded(context) {
                Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(function (e) {
                    if (!Bootstrap.Tree.Node.is(e.data, Bootstrap.Entity.Molecule.Model) || e.data.isHidden) {
                        return;
                    }
                    Bootstrap.Command.Tree.ApplyTransform.dispatch(context, { node: e.data, transform: Bootstrap.Entity.Transformer.Molecule.CreateMacromoleculeVisual.create(Bootstrap.Entity.Transformer.Molecule.CreateMacromoleculeVisual.info.defaultParams(context)) });
                });
            }
            Behaviour.CreateVisualWhenModelIsAdded = CreateVisualWhenModelIsAdded;
            function ApplySelectionToVisual(context) {
                Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(function (ev) {
                    var e = ev.data;
                    if (Bootstrap.Entity.isMoleculeSelection(e) && Bootstrap.Entity.isVisual(e.parent)) {
                        var s = e;
                        var v = e.parent;
                        v.props.model.applySelection(s.props.indices, 1 /* Select */);
                    }
                });
                Bootstrap.Event.Tree.NodeRemoved.getStream(context).subscribe(function (ev) {
                    var e = ev.data;
                    if (Bootstrap.Entity.isMoleculeSelection(e) && Bootstrap.Entity.isVisual(e.parent)) {
                        var s = e;
                        var v = e.parent;
                        v.props.model.applySelection(s.props.indices, 2 /* RemoveSelect */);
                    }
                });
            }
            Behaviour.ApplySelectionToVisual = ApplySelectionToVisual;
            function ApplyInteractivitySelection(context) {
                var latestIndices = undefined;
                var latestModel = undefined;
                context.behaviours.click.subscribe(function (info) {
                    if (latestModel) {
                        latestModel.applySelection(latestIndices, 2 /* RemoveSelect */);
                        latestModel = undefined;
                        latestIndices = undefined;
                    }
                    if (!info.entity || !info.visual)
                        return;
                    latestModel = info.visual.props.model;
                    latestIndices = info.elements;
                    latestModel.applySelection(latestIndices, 1 /* Select */);
                });
            }
            Behaviour.ApplyInteractivitySelection = ApplyInteractivitySelection;
            function UnselectElementOnRepeatedClick(context) {
                var latest = null;
                Bootstrap.Event.Visual.VisualSelectElement.getStream(context).subscribe(function (e) {
                    if (e.data.visual && !e.data.visual.props.isSelectable)
                        return;
                    if (latest && latest.entity && Bootstrap.Interactivity.interactivityInfoEqual(e.data, latest)) {
                        latest = null;
                        Bootstrap.Event.Visual.VisualSelectElement.dispatch(context, {});
                    }
                    else {
                        latest = e.data;
                    }
                });
            }
            Behaviour.UnselectElementOnRepeatedClick = UnselectElementOnRepeatedClick;
            var center = { x: 0, y: 0, z: 0 };
            function update(context, info) {
                if (!info.entity || !(Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Model) || Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Selection)))
                    return;
                var model = Bootstrap.Tree.Node.findClosestNodeOfType(info.entity, [Bootstrap.Entity.Molecule.Model]).props.model;
                if (!model)
                    return;
                var elems = info.elements;
                if (info.elements.length === 1) {
                    elems = Bootstrap.Utils.Molecule.getResidueIndices(model, info.elements[0]);
                }
                var radius = Bootstrap.Utils.Molecule.getCentroidAndRadius(model, elems, center);
                if (info.elements.length === 1) {
                    var a = info.elements[0];
                    center.x = model.atoms.x[a];
                    center.y = model.atoms.y[a];
                    center.z = model.atoms.z[a];
                }
                context.scene.camera.focusOnPoint(center, Math.max(radius, 7));
            }
            function FocusCameraOnSelect(context) {
                context.behaviours.click.subscribe(function (e) { return update(context, e); });
            }
            Behaviour.FocusCameraOnSelect = FocusCameraOnSelect;
        })(Behaviour = Bootstrap.Behaviour || (Bootstrap.Behaviour = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Behaviour;
        (function (Behaviour) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                var Query = LiteMol.Core.Structure.Query;
                var Transforms = Bootstrap.Entity.Transformer;
                function ShowInteractionOnSelect(radius) {
                    return function (context) {
                        var lastRef = void 0;
                        var ligandStyle = {
                            type: 'BallsAndSticks',
                            computeOnBackground: true,
                            params: { useVDW: true, vdwScaling: 0.25, bondRadius: 0.13, detail: 'Automatic' },
                            theme: { template: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors.set('Bond', { r: 1, g: 0, b: 0 }), transparency: { alpha: 0.4 } },
                            isNotSelectable: true
                        };
                        var ambStyle = {
                            type: 'BallsAndSticks',
                            computeOnBackground: true,
                            params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                            theme: { template: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate.colors.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 0.75 } },
                            isNotSelectable: true
                        };
                        context.behaviours.select.subscribe(function (info) {
                            if (lastRef) {
                                Bootstrap.Command.Tree.RemoveNode.dispatch(context, lastRef);
                                lastRef = void 0;
                            }
                            if (!info.entity || !info.visual)
                                return;
                            var ligandQ = Query.atomsFromIndices(info.elements).wholeResidues();
                            var ambQ = Query.atomsFromIndices(info.elements).wholeResidues().ambientResidues(radius);
                            var ref = Bootstrap.Utils.generateUUID();
                            var action = Bootstrap.Tree.Transform.build().add(info.visual, Transforms.Basic.CreateGroup, { label: 'Interaction' }, { ref: ref, isHidden: true });
                            lastRef = ref;
                            action.then(Transforms.Molecule.CreateSelectionFromQuery, { query: ambQ, name: 'Ambience', silent: true, inFullContext: true }, { isBinding: true })
                                .then(Transforms.Molecule.CreateVisual, { style: ambStyle });
                            action.then(Transforms.Molecule.CreateSelectionFromQuery, { query: ligandQ, name: 'Ligand', silent: true, inFullContext: true }, { isBinding: true })
                                .then(Transforms.Molecule.CreateVisual, { style: ligandStyle });
                            Bootstrap.Tree.Transform.apply(context, action).run(context);
                        });
                    };
                }
                Molecule.ShowInteractionOnSelect = ShowInteractionOnSelect;
                function HighlightElementInfo(context) {
                    context.highlight.addProvider(function (info) {
                        if (!info.entity || !(Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Model) || Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Selection)))
                            return undefined;
                        var data = Bootstrap.Interactivity.Molecule.transformInteraction(info);
                        return Bootstrap.Interactivity.Molecule.formatInfo(data);
                    });
                }
                Molecule.HighlightElementInfo = HighlightElementInfo;
                function DistanceToLastClickedElement(context) {
                    var lastInfo = undefined;
                    var lastSel = undefined;
                    var lastModel = undefined;
                    context.behaviours.click.subscribe(function (info) {
                        if (!info.entity || !(Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Model) || Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Selection)) || !info.elements || !info.elements.length) {
                            lastInfo = undefined;
                            lastModel = undefined;
                            lastSel = undefined;
                        }
                        else {
                            lastInfo = info;
                            var m = Bootstrap.Utils.Molecule.findModel(info.entity);
                            if (!m) {
                                lastInfo = undefined;
                                lastModel = undefined;
                                lastSel = undefined;
                            }
                            else {
                                lastModel = m.props.model;
                                lastSel = Bootstrap.Interactivity.Molecule.formatInfoShort(Bootstrap.Interactivity.Molecule.transformInteraction(info));
                            }
                        }
                    });
                    context.highlight.addProvider(function (info) {
                        if (!info.entity || !(Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Model) || Bootstrap.Tree.Node.is(info.entity, Bootstrap.Entity.Molecule.Selection)) || !info.elements || !info.elements.length)
                            return undefined;
                        if (!lastInfo)
                            return undefined;
                        var m = Bootstrap.Utils.Molecule.findModel(info.entity);
                        if (!m)
                            return undefined;
                        var dist = Bootstrap.Utils.Molecule.getDistanceSet(lastModel, lastInfo.elements, m.props.model, info.elements);
                        if (dist < 0.0001)
                            return undefined;
                        return "<span><b>" + Bootstrap.Utils.round(dist, 2) + " \u212B</b> from <b>" + lastSel + "</b></span>";
                    });
                }
                Molecule.DistanceToLastClickedElement = DistanceToLastClickedElement;
            })(Molecule = Behaviour.Molecule || (Behaviour.Molecule = {}));
        })(Behaviour = Bootstrap.Behaviour || (Bootstrap.Behaviour = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Behaviour;
        (function (Behaviour) {
            var Density;
            (function (Density) {
                "use strict";
                var ShowElectronDensityAroundSelection = (function () {
                    function ShowElectronDensityAroundSelection(context, params) {
                        this.context = context;
                        this.params = params;
                        this.obs = [];
                        this.ref = Bootstrap.Utils.generateUUID();
                        this.isBusy = false;
                        this.latestInfo = void 0;
                    }
                    ShowElectronDensityAroundSelection.prototype.remove = function () {
                        var v = this.getVisual();
                        if (v) {
                            Bootstrap.Tree.remove(v);
                        }
                    };
                    ShowElectronDensityAroundSelection.prototype.getVisual = function () {
                        return this.context.select(this.ref)[0];
                    };
                    ShowElectronDensityAroundSelection.prototype.update = function (info) {
                        if (!Bootstrap.Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                            this.remove();
                            return;
                        }
                        var model = Bootstrap.Utils.Molecule.findModel(info.entity);
                        var center = { x: 0, y: 0, z: 0 };
                        var elems = info.elements;
                        var m = model.props.model;
                        if (info.elements.length === 1) {
                            elems = Bootstrap.Utils.Molecule.getResidueIndices(m, info.elements[0]);
                        }
                        var box = Bootstrap.Utils.Molecule.getBox(m, elems, this.params.radius);
                        var style = Bootstrap.Utils.shallowClone(this.params.style);
                        style.params = Bootstrap.Utils.shallowClone(style.params);
                        style.params.bottomLeft = box.bottomLeft;
                        style.params.topRight = box.topRight;
                        style.computeOnBackground = true;
                        var task;
                        var visual = this.getVisual();
                        if (!visual) {
                            var t = Bootstrap.Entity.Transformer.Density.CreateVisual.create({ style: style }, { ref: this.ref, isHidden: true });
                            t.isUpdate = true;
                            task = t.apply(this.context, this.behaviour);
                        }
                        else
                            task = Bootstrap.Entity.Transformer.Density.CreateVisual.create({ style: style }, { ref: this.ref, isHidden: true }).update(this.context, visual);
                        //this.isBusy = true;
                        task.run(this.context);
                    };
                    ShowElectronDensityAroundSelection.prototype.dispose = function () {
                        this.remove();
                        for (var _i = 0, _a = this.obs; _i < _a.length; _i++) {
                            var o = _a[_i];
                            o.dispose();
                        }
                        this.obs = [];
                    };
                    ShowElectronDensityAroundSelection.prototype.register = function (behaviour) {
                        var _this = this;
                        this.behaviour = behaviour;
                        this.obs.push(this.context.behaviours.select.subscribe(function (e) {
                            _this.update(e);
                        }));
                    };
                    return ShowElectronDensityAroundSelection;
                }());
                Density.ShowElectronDensityAroundSelection = ShowElectronDensityAroundSelection;
            })(Density = Behaviour.Density || (Behaviour.Density = {}));
        })(Behaviour = Bootstrap.Behaviour || (Bootstrap.Behaviour = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Behaviour;
        (function (Behaviour) {
            var Molecule;
            (function (Molecule) {
                "use strict";
                var Transforms = Bootstrap.Entity.Transformer;
                var CoordinateStreaming = (function () {
                    function CoordinateStreaming(context, server, radius) {
                        if (radius === void 0) { radius = 5; }
                        this.context = context;
                        this.radius = radius;
                        this.obs = [];
                        this.target = void 0;
                        this.behaviour = void 0;
                        this.currentRequest = void 0;
                        this.ref = Bootstrap.Utils.generateUUID();
                        this.download = void 0;
                        this.cache = new CoordinateStreaming.Cache(100);
                        this.style = {
                            type: 'BallsAndSticks',
                            computeOnBackground: true,
                            params: { useVDW: true, vdwScaling: 0.17, bondRadius: 0.07, detail: 'Automatic' },
                            theme: { template: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 1.0 } },
                            isNotSelectable: true
                        };
                        this.server = CoordinateStreaming.normalizeServerName(server);
                    }
                    CoordinateStreaming.prototype.remove = function () {
                        if (this.download) {
                            this.download.discard();
                            this.download = void 0;
                        }
                        Bootstrap.Command.Tree.RemoveNode.dispatch(this.context, this.ref);
                    };
                    CoordinateStreaming.prototype.isApplicable = function (info) {
                        if (!Bootstrap.Interactivity.Molecule.isMoleculeModelInteractivity(info))
                            return;
                        var e = info.entity;
                        while (e.parent !== e) {
                            if (e === this.target)
                                return true;
                            e = e.parent;
                        }
                        return false;
                    };
                    CoordinateStreaming.prototype.update = function (info) {
                        var _this = this;
                        this.remove();
                        if (!this.isApplicable(info)) {
                            return;
                        }
                        var model = Bootstrap.Utils.Molecule.findModel(info.entity).props.model;
                        var i = model.atoms.residueIndex[info.elements[0]];
                        var rs = model.residues;
                        var authAsymId = rs.authAsymId[i];
                        var transform = void 0;
                        if (model.source === LiteMol.Core.Structure.MoleculeModelSource.Computed) {
                            var p = model.parent;
                            var cI = rs.chainIndex[i];
                            var chain = model.chains.sourceChainIndex[cI];
                            authAsymId = p.chains.authAsymId[chain];
                            transform = model.operators[model.chains.operatorIndex[cI]].matrix;
                        }
                        var url = (this.server + "/")
                            + (model.id.toLocaleLowerCase() + "/ambientResidues?")
                            + ("modelId=" + encodeURIComponent(model.modelId) + "&")
                            + ("entityId=" + encodeURIComponent(rs.entityId[i]) + "&")
                            + ("authAsymId=" + encodeURIComponent(authAsymId) + "&")
                            + ("authSeqNumber=" + encodeURIComponent('' + rs.authSeqNumber[i]) + "&")
                            + ("insCode=" + encodeURIComponent(rs.insCode[i] !== null ? rs.insCode[i] : '') + "&")
                            + ("radius=" + encodeURIComponent('' + this.radius) + "&")
                            + "atomSitesOnly=1";
                        this.download = Bootstrap.Utils.ajaxGetString(url).run(this.context);
                        var cached = this.cache.get(url);
                        if (cached) {
                            this.create(cached, transform);
                        }
                        else {
                            this.context.performance.start(this.ref);
                            this.download.then(function (data) {
                                _this.cache.add(url, data);
                                _this.context.performance.end(_this.ref);
                                _this.context.logger.info("Streaming done in " + _this.context.performance.formatTime(_this.ref));
                                _this.create(data, transform);
                            }).catch(function () { _this.context.performance.end(_this.ref); });
                        }
                    };
                    CoordinateStreaming.prototype.create = function (data, transform) {
                        var action = Bootstrap.Tree.Transform.build().add(this.behaviour, Bootstrap.Entity.Transformer.Molecule.CoordinateStreaming.CreateModel, { data: data, transform: transform }, { ref: this.ref, isHidden: true })
                            .then(Transforms.Molecule.CreateVisual, { style: this.style });
                        Bootstrap.Tree.Transform.apply(this.context, action).run(this.context);
                    };
                    CoordinateStreaming.prototype.dispose = function () {
                        this.remove();
                        for (var _i = 0, _a = this.obs; _i < _a.length; _i++) {
                            var o = _a[_i];
                            o.dispose();
                        }
                        this.obs = [];
                    };
                    CoordinateStreaming.prototype.register = function (behaviour) {
                        var _this = this;
                        this.behaviour = behaviour;
                        this.target = behaviour.parent;
                        this.obs.push(this.context.behaviours.select.subscribe(function (e) { return _this.update(e); }));
                    };
                    return CoordinateStreaming;
                }());
                Molecule.CoordinateStreaming = CoordinateStreaming;
                var CoordinateStreaming;
                (function (CoordinateStreaming) {
                    function normalizeServerName(s) {
                        if (s[s.length - 1] !== '/')
                            return s;
                        if (s.length > 0)
                            return s.substr(0, s.length - 1);
                        return s;
                    }
                    CoordinateStreaming.normalizeServerName = normalizeServerName;
                    function getBaseUrl(id, server) {
                        return normalizeServerName(server) + "/" + id.trim().toLocaleLowerCase() + "/cartoon";
                    }
                    CoordinateStreaming.getBaseUrl = getBaseUrl;
                    var CacheEntry = (function () {
                        function CacheEntry(key, data) {
                            this.key = key;
                            this.data = data;
                            this.previous = void 0;
                            this.next = void 0;
                        }
                        return CacheEntry;
                    }());
                    CoordinateStreaming.CacheEntry = CacheEntry;
                    var Cache = (function () {
                        function Cache(size) {
                            this.size = size;
                            this.count = 0;
                            this.entries = new Bootstrap.Utils.LinkedList();
                            if (size < 1)
                                size = 1;
                        }
                        Cache.prototype.get = function (key) {
                            for (var e = this.entries.first; e; e = e.next) {
                                if (e.key === key)
                                    return e.data;
                            }
                            return void 0;
                        };
                        Cache.prototype.add = function (key, data) {
                            if (this.count > this.size) {
                                this.entries.remove(this.entries.first);
                            }
                            var e = new CacheEntry(key, data);
                            this.entries.addLast(e);
                            return data;
                        };
                        return Cache;
                    }());
                    CoordinateStreaming.Cache = Cache;
                })(CoordinateStreaming = Molecule.CoordinateStreaming || (Molecule.CoordinateStreaming = {}));
            })(Molecule = Behaviour.Molecule || (Behaviour.Molecule = {}));
        })(Behaviour = Bootstrap.Behaviour || (Bootstrap.Behaviour = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Behaviour;
        (function (Behaviour) {
            "use strict";
            function trackTransform(ctx, name, transformer, a, transform, selector, gaId) {
                if (transform.transformer !== transformer)
                    return;
                try {
                    var ga = window[gaId];
                    var p = selector(transform.params, a);
                    if (ga && typeof p !== 'undefined') {
                        ga('send', 'event', name, p, ctx.id);
                    }
                }
                catch (e) {
                }
            }
            function selectDownload(p) { return p.url; }
            function selectQuery(p) { return p.queryString; }
            function selectAssembly(p, a) {
                if (Bootstrap.Tree.Node.isHidden(a))
                    return void 0;
                var m = Bootstrap.Utils.Molecule.findModel(a);
                if (!m)
                    return void 0;
                return m.props.model.id + ' $(name)$ ' + p.name;
            }
            function selectCrystalSymmetry(p, a) {
                if (Bootstrap.Tree.Node.isHidden(a))
                    return void 0;
                var m = Bootstrap.Utils.Molecule.findModel(a);
                if (!m)
                    return void 0;
                return m.props.model.id + ' $(type)$ ' + p.type + ' $(radius)$ ' + p.radius;
            }
            function selectStreaming(p, a) {
                var m = Bootstrap.Utils.Molecule.findModel(a);
                if (!m)
                    return void 0;
                return m.props.model.id + ' $(server)$ ' + p.server;
            }
            function selectVisual(p, a) {
                if (Bootstrap.Tree.Node.isHidden(a))
                    return void 0;
                return p.style.type;
            }
            function selectDensity(p) { return '$(format)$ ' + p.format; }
            function selectSelection(p, a) {
                return p.queryString;
            }
            function GoogleAnalytics(id, key) {
                if (key === void 0) { key = 'default'; }
                return function (context) {
                    var gaId = "ga-" + context.id + "-" + key;
                    try {
                        (function (i, s, o, g, r, a, m) {
                            i['GoogleAnalyticsObject'] = r;
                            i[r] = i[r] || function () {
                                (i[r].q = i[r].q || []).push(arguments);
                            }, i[r].l = 1 * (+new Date());
                            a = s.createElement(o),
                                m = s.getElementsByTagName(o)[0];
                            a.async = 1;
                            a.src = g;
                            m.parentNode.insertBefore(a, m);
                        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', gaId);
                        window[gaId]('create', id, 'auto');
                        setTimeout(function () {
                            try {
                                var ga = window[gaId];
                                if (ga)
                                    ga('send', 'event', 'Loaded', 'contextId', context.id);
                            }
                            catch (e) { }
                        }, 1000);
                    }
                    catch (e) {
                    }
                    Bootstrap.Event.Tree.TransformerApply.getStream(context).subscribe(function (e) {
                        trackTransform(context, 'Download', Bootstrap.Entity.Transformer.Data.Download, e.data.a, e.data.t, selectDownload, gaId);
                        trackTransform(context, 'Create Model Selecion', Bootstrap.Entity.Transformer.Molecule.CreateSelection, e.data.a, e.data.t, selectQuery, gaId);
                        trackTransform(context, 'Create Assembly', Bootstrap.Entity.Transformer.Molecule.CreateAssembly, e.data.a, e.data.t, selectAssembly, gaId);
                        trackTransform(context, 'Create Symmetry', Bootstrap.Entity.Transformer.Molecule.CreateSymmetryMates, e.data.a, e.data.t, selectCrystalSymmetry, gaId);
                        trackTransform(context, 'Create Visual', Bootstrap.Entity.Transformer.Molecule.CreateVisual, e.data.a, e.data.t, selectVisual, gaId);
                        trackTransform(context, 'Coordinate Streaming', Bootstrap.Entity.Transformer.Molecule.CoordinateStreaming.CreateBehaviour, e.data.a, e.data.t, selectStreaming, gaId);
                        trackTransform(context, 'Parse Density', Bootstrap.Entity.Transformer.Density.ParseBinary, e.data.a, e.data.t, selectDensity, gaId);
                        trackTransform(context, 'Create Model Selection', Bootstrap.Entity.Transformer.Molecule.CreateSelection, e.data.a, e.data.t, selectSelection, gaId);
                    });
                };
            }
            Behaviour.GoogleAnalytics = GoogleAnalytics;
        })(Behaviour = Bootstrap.Behaviour || (Bootstrap.Behaviour = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            "use strict";
            var Component = (function () {
                function Component(context, initialState) {
                    this.context = context;
                    this._state = new Bootstrap.Rx.Subject();
                    this._latestState = void 0;
                    this._latestState = initialState;
                }
                Object.defineProperty(Component.prototype, "dispatcher", {
                    get: function () {
                        return this.context.dispatcher;
                    },
                    enumerable: true,
                    configurable: true
                });
                Component.prototype.setState = function () {
                    var states = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        states[_i - 0] = arguments[_i];
                    }
                    var s = Bootstrap.Utils.merge.apply(Bootstrap.Utils, [this._latestState].concat(states));
                    if (s !== this._latestState) {
                        this._latestState = s;
                        this._state.onNext(s);
                    }
                };
                Object.defineProperty(Component.prototype, "state", {
                    get: function () {
                        return this._state;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Component.prototype, "latestState", {
                    get: function () {
                        return this._latestState;
                    },
                    enumerable: true,
                    configurable: true
                });
                return Component;
            }());
            Components.Component = Component;
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            "use strict";
            (function (LayoutRegion) {
                LayoutRegion[LayoutRegion["Main"] = 0] = "Main";
                LayoutRegion[LayoutRegion["Top"] = 1] = "Top";
                LayoutRegion[LayoutRegion["Right"] = 2] = "Right";
                LayoutRegion[LayoutRegion["Bottom"] = 3] = "Bottom";
                LayoutRegion[LayoutRegion["Left"] = 4] = "Left";
                LayoutRegion[LayoutRegion["Root"] = 5] = "Root";
            })(Components.LayoutRegion || (Components.LayoutRegion = {}));
            var LayoutRegion = Components.LayoutRegion;
            var LayoutTarget = (function () {
                function LayoutTarget(cssClass) {
                    this.cssClass = cssClass;
                    this.components = [];
                }
                return LayoutTarget;
            }());
            Components.LayoutTarget = LayoutTarget;
            function makeEmptyTargets() {
                var ret = [];
                for (var i = 0; i <= LayoutRegion.Root; i++) {
                    ret.push(new LayoutTarget(LayoutRegion[i].toLowerCase()));
                }
                return ret;
            }
            Components.makeEmptyTargets = makeEmptyTargets;
            var Layout = (function (_super) {
                __extends(Layout, _super);
                function Layout(context, targets, root) {
                    var _this = this;
                    _super.call(this, context, {
                        isExpanded: false,
                        hiddenComponentKeys: Bootstrap.Immutable.Set()
                    });
                    this.targets = targets;
                    this.root = root;
                    this.rootState = void 0;
                    Bootstrap.Command.Layout.SetState.getStream(this.context).subscribe(function (e) { return _this.update(e.data); });
                    // <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
                    this.expandedViewport = document.createElement('meta');
                    this.expandedViewport.name = 'viewport';
                    this.expandedViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
                }
                Layout.prototype.update = function (state) {
                    var _this = this;
                    var prevExpanded = !!this.latestState.isExpanded;
                    this.setState(state);
                    if (typeof state.isExpanded === "boolean" && state.isExpanded !== prevExpanded)
                        this.handleExpand();
                    this.dispatcher.schedule(function () { return Bootstrap.Event.Common.LayoutChanged.dispatch(_this.context, {}); });
                };
                Layout.prototype.getScrollElement = function () {
                    if (document.scrollingElement)
                        return document.scrollingElement;
                    if (document.documentElement)
                        return document.documentElement;
                    return document.body;
                };
                Layout.prototype.handleExpand = function () {
                    try {
                        var body = document.getElementsByTagName('body')[0];
                        var head = document.getElementsByTagName('head')[0];
                        if (!body || !head)
                            return;
                        if (this.latestState.isExpanded) {
                            var children = head.children;
                            var hasExp = false;
                            var viewports = [];
                            for (var i = 0; i < children.length; i++) {
                                if (children[i] === this.expandedViewport) {
                                    hasExp = true;
                                }
                                else if ((children[i].name || '').toLowerCase() === 'viewport') {
                                    viewports.push(children[i]);
                                }
                            }
                            for (var _i = 0, viewports_1 = viewports; _i < viewports_1.length; _i++) {
                                var v = viewports_1[_i];
                                head.removeChild(v);
                            }
                            if (!hasExp)
                                head.appendChild(this.expandedViewport);
                            var s = body.style;
                            var doc = this.getScrollElement();
                            var scrollLeft = doc.scrollLeft;
                            var scrollTop = doc.scrollTop;
                            this.rootState = {
                                top: s.top, bottom: s.bottom, right: s.right, left: s.left, scrollTop: scrollTop, scrollLeft: scrollLeft, position: s.position, overflow: s.overflow, viewports: viewports, zindex: this.root.style.zIndex,
                                width: s.width, height: s.height,
                                maxWidth: s.maxWidth, maxHeight: s.maxHeight,
                                margin: s.margin, marginLeft: s.marginLeft, marginRight: s.marginRight, marginTop: s.marginTop, marginBottom: s.marginBottom
                            };
                            s.overflow = 'hidden';
                            s.position = 'fixed';
                            s.top = "0";
                            s.bottom = "0";
                            s.right = "0";
                            s.left = "0";
                            s.width = "100%";
                            s.height = "100%";
                            s.maxWidth = "100%";
                            s.maxHeight = "100%";
                            s.margin = "0";
                            s.marginLeft = "0";
                            s.marginRight = "0";
                            s.marginTop = "0";
                            s.marginBottom = "0";
                            this.root.style.zIndex = "100000";
                        }
                        else {
                            //root.style.overflow = rootOverflow;
                            var children = head.children;
                            for (var i = 0; i < children.length; i++) {
                                if (children[i] === this.expandedViewport) {
                                    head.removeChild(this.expandedViewport);
                                    break;
                                }
                            }
                            if (this.rootState) {
                                var s = body.style, t = this.rootState;
                                for (var _a = 0, _b = t.viewports; _a < _b.length; _a++) {
                                    var v = _b[_a];
                                    head.appendChild(v);
                                }
                                s.top = t.top;
                                s.bottom = t.bottom;
                                s.left = t.left;
                                s.right = t.right;
                                s.width = t.width;
                                s.height = t.height;
                                s.maxWidth = t.maxWidth;
                                s.maxHeight = t.maxHeight;
                                s.margin = t.margin;
                                s.marginLeft = t.marginLeft;
                                s.marginRight = t.marginRight;
                                s.marginTop = t.marginTop;
                                s.marginBottom = t.marginBottom;
                                s.position = t.position;
                                s.overflow = t.overflow;
                                var doc = this.getScrollElement();
                                doc.scrollTop = t.scrollTop;
                                doc.scrollLeft = t.scrollLeft;
                                this.rootState = void 0;
                                this.root.style.zIndex = t.zindex;
                            }
                        }
                    }
                    catch (e) {
                        this.context.logger.error('Layout change error, you might have to reload the page.');
                        console.log('Layout change error, you might have to reload the page.', e);
                    }
                };
                return Layout;
            }(Components.Component));
            Components.Layout = Layout;
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Transform;
            (function (Transform) {
                "use strict";
                var Controller = (function (_super) {
                    __extends(Controller, _super);
                    function Controller(context, transformer, entity) {
                        var _this = this;
                        _super.call(this, context, { params: transformer.info.defaultParams(context, entity), isDirty: false, isExpanded: true });
                        this.transformer = transformer;
                        this.entity = entity;
                        this.updateTimeout = new Bootstrap.Rx.Subject();
                        this.timeout = Bootstrap.Rx.Observable.timer(50);
                        this.never = Bootstrap.Rx.Observable.never();
                        this.anchorParams = this.latestState.params;
                        this.updateParams(this.anchorParams);
                        this.updateTimeout.flatMapLatest(function (t) { return t; }).forEach(function () { return _this.apply(); });
                    }
                    Controller.prototype._update = function () {
                        if (this.isUpdate && !this.latestState.isBusy) {
                            if (this.updateTimeout) {
                                this.updateTimeout.onNext(this.timeout);
                                this.setState({ parametersAutoUpdating: true });
                            }
                        }
                    };
                    Controller.prototype._reset = function () {
                        this.setState({ parametersAutoUpdating: false });
                        if (this.updateTimeout)
                            this.updateTimeout.onNext(this.never);
                    };
                    Controller.prototype._updateParams = function (params) {
                        var updated = Bootstrap.Utils.merge(this.latestState.params, params);
                        if (this.transformer.info.validateParams) {
                            var isInvalid = this.transformer.info.validateParams(updated);
                            if (isInvalid && isInvalid.length > 0) {
                                this.setState({ params: updated, issues: isInvalid, canApply: false });
                                return;
                            }
                        }
                        var isDirty = !Bootstrap.Utils.deepEqual(this.anchorParams, updated);
                        this.setState({ params: updated, isDirty: isDirty, issues: void 0, canApply: true });
                    };
                    Controller.prototype.updateParams = function (params) {
                        this._reset();
                        this._updateParams(params);
                    };
                    Controller.prototype.autoUpdateParams = function (params) {
                        this._update();
                        this._updateParams(params);
                    };
                    Object.defineProperty(Controller.prototype, "isUpdate", {
                        get: function () {
                            return this.transformer === this.entity.transform.transformer;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Controller.prototype.apply = function () {
                        var _this = this;
                        this._reset();
                        if (this.latestState.isBusy)
                            return;
                        var transform = this.transformer.create(this.latestState.params);
                        this.anchorParams = this.latestState.params;
                        this.setState({ isDirty: false, isBusy: true });
                        try {
                            var task = this.isUpdate ? transform.update(this.context, this.entity) : transform.apply(this.context, this.entity);
                            task.run(this.context).then(function () { return _this.setState({ isBusy: false }); }).catch(function () { return _this.setState({ isBusy: false }); });
                        }
                        catch (e) {
                            this.setState({ isBusy: false });
                        }
                    };
                    Controller.prototype.setParams = function (params) {
                        this._reset();
                        this.anchorParams = params;
                        this.updateParams(params);
                    };
                    Controller.prototype.setExpanded = function (isExpanded) {
                        this.setState({ isExpanded: isExpanded });
                    };
                    return Controller;
                }(Components.Component));
                Transform.Controller = Controller;
            })(Transform = Components.Transform || (Components.Transform = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Transform;
            (function (Transform) {
                "use strict";
                var View = (function (_super) {
                    __extends(View, _super);
                    function View(context) {
                        var _this = this;
                        _super.call(this, context, { update: void 0, transforms: [] });
                        this.update();
                        Bootstrap.Event.Entity.CurrentChanged.getStream(context).subscribe(function () { return _this.update(); });
                    }
                    // private setParams(c: Controller<any>) {
                    //     let prms = c.transformer.info.defaultParams(this.context, this.context.currentEntity);
                    //     c.setParams(prms);
                    // }
                    // private updateParams(t: Transformer) {
                    //     let c = this.context.transforms.getController(t);
                    //     if (!c) return false;
                    //     if (t.info.updateParams) {
                    //         let p = t.info.updateParams(this.context.currentEntity.transform.params, this.context.currentEntity);
                    //         if (p) c.setParams(p);
                    //         else c.setParams(this.context.currentEntity.transform.params); 
                    //     }
                    //     else c.setParams(this.context.currentEntity.transform.params);
                    //     return true;
                    // }
                    View.prototype.update = function () {
                        if (!this.context.currentEntity) {
                            this.setState({ transforms: [] });
                            return;
                        }
                        var e = this.context.currentEntity;
                        var manager = this.context.transforms;
                        var update = void 0;
                        if (e.transform.transformer && e.transform.transformer.info.isUpdatable /*&& !e.transform.props.isBinding*/) {
                            update = manager.getController(e.transform.transformer, e);
                        }
                        var transforms = [];
                        for (var _i = 0, _a = this.context.transforms.getBySourceType(e.type); _i < _a.length; _i++) {
                            var t = _a[_i];
                            if (t.info.isApplicable && !t.info.isApplicable(e)) {
                                continue;
                            }
                            var c = manager.getController(t, e);
                            transforms.push(c);
                        }
                        this.setState({ update: update, transforms: transforms });
                    };
                    return View;
                }(Components.Component));
                Transform.View = View;
            })(Transform = Components.Transform || (Components.Transform = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Transform;
            (function (Transform) {
                "use strict";
                var MoleculeVisual = (function (_super) {
                    __extends(MoleculeVisual, _super);
                    function MoleculeVisual() {
                        _super.apply(this, arguments);
                    }
                    MoleculeVisual.prototype.updateTemplate = function (key, all) {
                        var s = all.get(key);
                        var latestTheme = this.latestState && this.latestState.params.style.theme;
                        var params = s.params;
                        var theme = latestTheme || this.getThemeInstance(s.theme.template);
                        var style = { type: s.type, params: params, theme: theme };
                        this.autoUpdateParams({ style: style });
                    };
                    MoleculeVisual.prototype.updateStyleParams = function (params) {
                        var s = Bootstrap.Utils.shallowClone(this.latestState.params.style);
                        s.params = Bootstrap.Utils.merge(s.params, params);
                        this.autoUpdateParams({ style: s });
                    };
                    MoleculeVisual.prototype.updateStyleTheme = function (theme) {
                        var s = Bootstrap.Utils.shallowClone(this.latestState.params.style);
                        s.theme = Bootstrap.Utils.merge(s.theme, theme);
                        this.autoUpdateParams({ style: s });
                    };
                    MoleculeVisual.prototype.updateThemeColor = function (name, value) {
                        var oldTheme = this.latestState.params.style.theme;
                        if (!oldTheme)
                            return;
                        var colors = oldTheme.colors;
                        if (!colors)
                            colors = Bootstrap.Immutable.Map();
                        colors = colors.set(name, value);
                        this.updateStyleTheme({ colors: colors });
                    };
                    MoleculeVisual.prototype.updateThemeTransparency = function (transparency) {
                        var oldTheme = this.latestState.params.style.theme;
                        if (!oldTheme)
                            return;
                        this.updateStyleTheme({ transparency: transparency });
                    };
                    MoleculeVisual.prototype.getThemeInstance = function (template) {
                        var oldTheme = this.latestState.params.style.theme;
                        var defaultTransparency = Bootstrap.Visualization.Molecule.Default.ForType.get(this.latestState.params.style.type).theme.transparency;
                        if (!oldTheme)
                            return { template: template, colors: template.colors, transparency: defaultTransparency };
                        var colors = template.colors;
                        if (oldTheme.colors && colors) {
                            colors = colors.withMutations(function (map) {
                                oldTheme.colors.forEach(function (c, n) {
                                    if (map.has(n))
                                        map.set(n, c);
                                });
                            });
                        }
                        var transparency = oldTheme.transparency ? oldTheme.transparency : defaultTransparency;
                        return { template: template, colors: colors, transparency: transparency };
                    };
                    MoleculeVisual.prototype.updateThemeDefinition = function (definition) {
                        this.updateStyleTheme(this.getThemeInstance(definition));
                    };
                    return MoleculeVisual;
                }(Transform.Controller));
                Transform.MoleculeVisual = MoleculeVisual;
                var DensityVisual = (function (_super) {
                    __extends(DensityVisual, _super);
                    function DensityVisual() {
                        _super.apply(this, arguments);
                    }
                    DensityVisual.prototype.updateStyleParams = function (params) {
                        var s = Bootstrap.Utils.shallowClone(this.latestState.params.style);
                        s.params = Bootstrap.Utils.merge(s.params, params);
                        this.autoUpdateParams({ style: s });
                    };
                    DensityVisual.prototype.updateStyleTheme = function (theme) {
                        var s = Bootstrap.Utils.shallowClone(this.latestState.params.style);
                        s.theme = Bootstrap.Utils.merge(s.theme, theme);
                        this.autoUpdateParams({ style: s });
                    };
                    DensityVisual.prototype.updateThemeColor = function (name, value) {
                        var oldTheme = this.latestState.params.style.theme;
                        if (!oldTheme)
                            return;
                        var colors = oldTheme.colors;
                        if (!colors)
                            colors = Bootstrap.Immutable.Map();
                        colors = colors.set(name, value);
                        this.updateStyleTheme({ colors: colors });
                    };
                    DensityVisual.prototype.updateThemeTransparency = function (transparency) {
                        var oldTheme = this.latestState.params.style.theme;
                        if (!oldTheme)
                            return;
                        this.updateStyleTheme({ transparency: transparency });
                    };
                    DensityVisual.prototype.getThemeInstance = function (template) {
                        var oldTheme = this.latestState.params.style.theme;
                        var defaultTransparency = Bootstrap.Visualization.Density.Default.Transparency;
                        if (!oldTheme)
                            return { template: template, colors: template.colors, transparency: defaultTransparency };
                        var colors = template.colors;
                        if (oldTheme.colors && colors) {
                            colors = colors.withMutations(function (map) {
                                oldTheme.colors.forEach(function (c, n) {
                                    if (map.has(n))
                                        map.set(n, c);
                                });
                            });
                        }
                        var transparency = oldTheme.transparency ? oldTheme.transparency : defaultTransparency;
                        return { template: template, colors: colors, transparency: transparency };
                    };
                    DensityVisual.prototype.updateRadius = function (radius) {
                        this.autoUpdateParams({ radius: radius });
                    };
                    DensityVisual.prototype.updateThemeDefinition = function (definition) {
                        this.updateStyleTheme(this.getThemeInstance(definition));
                    };
                    return DensityVisual;
                }(Transform.Controller));
                Transform.DensityVisual = DensityVisual;
            })(Transform = Components.Transform || (Components.Transform = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Transform;
            (function (Transform) {
                "use strict";
                var Updater = (function (_super) {
                    __extends(Updater, _super);
                    function Updater(ctx, selector, header) {
                        var _this = this;
                        _super.call(this, ctx, {});
                        this.selector = selector;
                        this.header = header;
                        Bootstrap.Event.Tree.NodeAdded.getStream(ctx).subscribe(function () { return _this.added(); });
                        Bootstrap.Event.Tree.NodeRemoved.getStream(ctx).subscribe(function (e) { return _this.removed(e.data); });
                    }
                    Updater.prototype.removed = function (e) {
                        if (!this.latestState.controller)
                            return;
                        var l = this.latestState.controller.entity;
                        if (l === e) {
                            this.setState({});
                        }
                    };
                    Updater.prototype.added = function () {
                        var sel = this.context.select(this.selector);
                        var e = sel[0];
                        if (!e || !e.transform)
                            return;
                        var c = this.context.transforms.getController(e.transform.transformer, e);
                        if (!c)
                            return;
                        this.setState({ controller: c });
                    };
                    return Updater;
                }(Components.Component));
                Transform.Updater = Updater;
            })(Transform = Components.Transform || (Components.Transform = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Transform;
            (function (Transform) {
                "use strict";
                var Action = (function (_super) {
                    __extends(Action, _super);
                    function Action(ctx, selector, transformer, header) {
                        var _this = this;
                        _super.call(this, ctx, {});
                        this.selector = selector;
                        this.transformer = transformer;
                        this.header = header;
                        Bootstrap.Event.Tree.NodeAdded.getStream(ctx).subscribe(function () { return _this.added(); });
                        Bootstrap.Event.Tree.NodeRemoved.getStream(ctx).subscribe(function (e) { return _this.removed(e.data); });
                    }
                    Action.prototype.removed = function (e) {
                        if (!this.latestState.controller)
                            return;
                        var l = this.latestState.controller.entity;
                        if (l === e) {
                            this.setState({});
                        }
                    };
                    Action.prototype.added = function () {
                        var sel = this.context.select(this.selector);
                        var e = sel[0];
                        if (!e)
                            return;
                        var c = this.context.transforms.getController(this.transformer, e);
                        if (!c)
                            return;
                        this.setState({ controller: c });
                    };
                    return Action;
                }(Components.Component));
                Transform.Action = Action;
            })(Transform = Components.Transform || (Components.Transform = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Context;
            (function (Context) {
                "use strict";
                var Log = (function (_super) {
                    __extends(Log, _super);
                    function Log(context) {
                        var _this = this;
                        _super.call(this, context, { entries: Bootstrap.Immutable.List() });
                        Bootstrap.Event.Log.getStream(this.context)
                            .subscribe(function (e) { return _this.setState({ entries: _this.latestState.entries.push(e.data) }); });
                    }
                    return Log;
                }(Components.Component));
                Context.Log = Log;
            })(Context = Components.Context || (Components.Context = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Context;
            (function (Context) {
                "use strict";
                var TaskWatcher = (function (_super) {
                    __extends(TaskWatcher, _super);
                    function TaskWatcher(context, type) {
                        var _this = this;
                        _super.call(this, context, {
                            tasks: Bootstrap.Immutable.Map()
                        });
                        this.type = type;
                        Bootstrap.Event.Task.StateUpdated.getStream(this.context)
                            .subscribe(function (e) { return _this.updated(e.data); });
                        Bootstrap.Event.Task.Started.getStream(this.context)
                            .filter(function (e) { return e.data.type === type; })
                            .subscribe(function (e) { return _this.started(e.data); });
                        Bootstrap.Event.Task.Completed.getStream(this.context)
                            .subscribe(function (e) { return _this.completed(e.data); });
                    }
                    TaskWatcher.prototype.updated = function (state) {
                        var isWatched = state.type === this.type;
                        var tasks = this.latestState.tasks;
                        if (!isWatched) {
                            if (tasks.has(state.taskId)) {
                                tasks = tasks.delete(state.taskId);
                                this.setState({ tasks: tasks });
                            }
                            return;
                        }
                        tasks = tasks.set(state.taskId, {
                            name: state.name,
                            message: state.message,
                            abort: state.abort
                        });
                        this.setState({ tasks: tasks });
                    };
                    TaskWatcher.prototype.started = function (task) {
                        this.setState({
                            tasks: this.latestState.tasks.set(task.id, { name: task.name, message: 'Running...' })
                        });
                    };
                    TaskWatcher.prototype.completed = function (taskId) {
                        if (!this.latestState.tasks.has(taskId))
                            return;
                        this.setState({
                            tasks: this.latestState.tasks.delete(taskId)
                        });
                    };
                    return TaskWatcher;
                }(Components.Component));
                Context.TaskWatcher = TaskWatcher;
            })(Context = Components.Context || (Components.Context = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Visualization;
            (function (Visualization) {
                "use strict";
                var HighlightInfo = (function (_super) {
                    __extends(HighlightInfo, _super);
                    function HighlightInfo(context) {
                        var _this = this;
                        _super.call(this, context, { info: [] });
                        Bootstrap.Event.Interactivity.Highlight.getStream(this.context).subscribe(function (e) { return _this.setState({ info: e.data }); });
                    }
                    return HighlightInfo;
                }(Components.Component));
                Visualization.HighlightInfo = HighlightInfo;
            })(Visualization = Components.Visualization || (Components.Visualization = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Components;
        (function (Components) {
            var Visualization;
            (function (Visualization) {
                "use strict";
                var Vis = LiteMol.Visualization;
                var Viewport = (function (_super) {
                    __extends(Viewport, _super);
                    function Viewport(context) {
                        var _this = this;
                        _super.call(this, context, Bootstrap.Utils.shallowClone(Vis.DefaultSceneOptions));
                        Bootstrap.Event.Common.LayoutChanged.getStream(this.context).subscribe(function (e) {
                            if (_this._scene)
                                _this._scene.scene.resized();
                        });
                        Bootstrap.Command.Layout.SetViewportOptions.getStream(this.context).subscribe(function (e) { return _this.setState(e.data); });
                        this.state.throttle(1000 / 30).subscribe(function (s) {
                            _this.scene.scene.updateOptions(s);
                        });
                    }
                    Object.defineProperty(Viewport.prototype, "scene", {
                        get: function () {
                            return this._scene;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Viewport.prototype.init = function (element) {
                        if (!LiteMol.Visualization.checkWebGL())
                            return false;
                        try {
                            this._scene = new Bootstrap.Visualization.SceneWrapper(element, this.context, this.latestState);
                            this.context.scene = this._scene;
                            return true;
                        }
                        catch (e) {
                            return false;
                        }
                    };
                    Viewport.prototype.destroy = function () {
                        if (this._scene) {
                            this._scene.destroy();
                            this._scene = null;
                        }
                    };
                    return Viewport;
                }(Components.Component));
                Visualization.Viewport = Viewport;
            })(Visualization = Components.Visualization || (Components.Visualization = {}));
        })(Components = Bootstrap.Components || (Bootstrap.Components = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        var Settings = (function () {
            function Settings() {
                this.settings = new Map();
            }
            Settings.prototype.set = function (key, value) {
                this.settings.set(key, value);
            };
            Settings.prototype.get = function (key) {
                return this.settings.get(key);
            };
            return Settings;
        }());
        Bootstrap.Settings = Settings;
        var Context = (function () {
            function Context(plugin) {
                this.plugin = plugin;
                this.id = Bootstrap.Utils.generateUUID();
                this.dispatcher = new Bootstrap.Service.Dispatcher();
                this.logger = new Bootstrap.Service.Logger(this);
                this.performance = new LiteMol.Core.Utils.PerformanceMonitor();
                this.scene = void 0; // injected by the Viewpoer component.        
                this.tree = Bootstrap.Tree.create(this, Bootstrap.Entity.Root.create(Bootstrap.Entity.RootTransform, { label: 'Root Entity' }));
                this.currentEntity = void 0;
                this.transforms = new Bootstrap.TransformManager(this);
                this.entityCache = new Bootstrap.Entity.Cache(this);
                this.viewport = new Bootstrap.Components.Visualization.Viewport(this);
                this.highlight = new Bootstrap.Interactivity.HighlightManager(this);
                this.behaviours = new Bootstrap.Behaviour.Streams(this);
                this.settings = new Settings();
                Bootstrap.initEventsAndCommands(this);
            }
            Context.prototype.createLayout = function (targets, target) {
                this.layout = new Bootstrap.Components.Layout(this, targets, target);
            };
            Context.prototype.select = function (selector) {
                return Bootstrap.Tree.Selection.select(selector, this.tree);
            };
            return Context;
        }());
        Bootstrap.Context = Context;
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        var Plugin;
        (function (Plugin) {
            "use strict";
        })(Plugin = Bootstrap.Plugin || (Bootstrap.Plugin = {}));
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        function createMoleculeModelSelectInteraction(context, what) {
            if (!Bootstrap.Entity.isVisual(what.visual)) {
                console.warn('Select: Trying to create a selection event on a non-molecule model visual entity, ignoring...');
                return;
            }
            var q = Bootstrap.Utils.Molecule.getModelAndIndicesFromQuery(what.visual, what.query);
            if (!q.model || !q.indices.length)
                return;
            var entity = Bootstrap.Tree.Node.findClosestNodeOfType(what.visual, [Bootstrap.Entity.Molecule.Model, Bootstrap.Entity.Molecule.Selection]);
            Bootstrap.Event.Visual.VisualSelectElement.dispatch(context, { entity: entity, visual: what.visual, elements: q.indices });
        }
        function initEventsAndCommands(context) {
            Bootstrap.Command.Entity.SetCurrent.getStream(context).subscribe(function (e) { return Bootstrap.Entity.setCurrent(e.data); });
            Bootstrap.Command.Entity.SetVisibility.getStream(context).subscribe(function (e) { return Bootstrap.Entity.setVisibility(e.data.entity, e.data.visible); });
            Bootstrap.Command.Entity.ToggleExpanded.getStream(context).subscribe(function (e) { return Bootstrap.Entity.toggleExpanded(e.data); });
            Bootstrap.Command.Tree.RemoveNode.getStream(context).subscribe(function (e) { return context.select(e.data).forEach(function (n) { return Bootstrap.Tree.remove(n); }); });
            Bootstrap.Command.Tree.ApplyTransform.getStream(context).subscribe(function (e) { (e.data.isUpdate ? e.data.transform.update(context, e.data.node) : e.data.transform.apply(context, e.data.node)).run(context); });
            Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(function (e) {
                var vis = e.data.parent.state.visibility;
                var visible = vis !== 2 /* None */;
                Bootstrap.Entity.setVisibility(e.data, visible);
                if (Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.BehaviourClass)) {
                    var b = e.data;
                    b.props.behaviour.register(b);
                }
            });
            Bootstrap.Event.Tree.NodeRemoved.getStream(context).subscribe(function (e) {
                Bootstrap.Entity.updateVisibilityState(e.data.parent);
                if (Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.BehaviourClass)) {
                    var b = e.data;
                    b.props.behaviour.dispose();
                }
            });
            Bootstrap.Event.Visual.VisualHoverElement.getStream(context)
                .distinctUntilChanged(function (e) { return e.data; }, Bootstrap.Interactivity.interactivityInfoEqual)
                .map(function (e) { return Bootstrap.Interactivity.Molecule.transformInteraction(e.data); })
                .distinctUntilChanged(function (e) { return e; }, function (x, y) { return x === y; })
                .subscribe(function (info) { return Bootstrap.Event.Molecule.ModelHighlight.dispatch(context, info); });
            Bootstrap.Event.Visual.VisualSelectElement.getStream(context)
                .distinctUntilChanged(function (e) { return e.data; }, Bootstrap.Interactivity.interactivityInfoEqual)
                .map(function (e) { return Bootstrap.Interactivity.Molecule.transformInteraction(e.data); })
                .distinctUntilChanged(function (e) { return e; }, function (x, y) { return x === y; })
                .subscribe(function (info) { return Bootstrap.Event.Molecule.ModelSelect.dispatch(context, info); });
            Bootstrap.Command.Molecule.CreateSelectInteraction.getStream(context).subscribe(function (e) { return createMoleculeModelSelectInteraction(context, e.data); });
        }
        Bootstrap.initEventsAndCommands = initEventsAndCommands;
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Bootstrap;
    (function (Bootstrap) {
        "use strict";
        var TransformManager = (function () {
            function TransformManager(context) {
                var _this = this;
                this.context = context;
                this.controllerCache = new Map();
                this.byId = new Map();
                this.bySourceType = new Map();
                this.byTargetType = new Map();
                Bootstrap.Event.Tree.NodeRemoved.getStream(context).subscribe(function (e) {
                    _this.controllerCache.delete(e.data.id);
                });
            }
            TransformManager.prototype.addType = function (e, t, to) {
                var xs = to.get(e.id);
                if (!xs)
                    to.set(e.id, [t]);
                else
                    xs.push(t);
            };
            TransformManager.prototype.getController = function (t, e) {
                if (!this.byId.get(t.info.id)) {
                    console.warn("Trying to get contoller for unregistered transform (" + t.info.id + ")");
                    return undefined;
                }
                var cs = this.controllerCache.get(e.id);
                if (!cs) {
                    cs = new Map();
                    this.controllerCache.set(e.id, cs);
                }
                var c = cs.get(t.info.id);
                if (c)
                    return c;
                var p = t.info.customController;
                if (p)
                    c = p(this.context, t, e);
                else
                    c = new Bootstrap.Components.Transform.Controller(this.context, t, e);
                var info = this.context.plugin && this.context.plugin.getTransformerInfo(t);
                if (info && info.initiallyCollapsed) {
                    c.setExpanded(false);
                }
                if (e.transform.transformer === t) {
                    c.setParams(e.transform.params);
                }
                cs.set(t.info.id, c);
                return c;
            };
            TransformManager.prototype.getBySourceType = function (t) {
                return this.bySourceType.get(t.id) || [];
            };
            TransformManager.prototype.getByTargetType = function (t) {
                return this.byTargetType.get(t.id) || [];
            };
            TransformManager.prototype.add = function (t) {
                if (this.byId.has(t.info.id)) {
                    throw "Transformer with id '" + t.info.id + "' is has already been added. Pick another id.";
                }
                this.byId.set(t.info.id, t);
                for (var _i = 0, _a = t.info.from; _i < _a.length; _i++) {
                    var x = _a[_i];
                    this.addType(x, t, this.bySourceType);
                }
                for (var _b = 0, _c = t.info.to; _b < _c.length; _b++) {
                    var x = _c[_b];
                    this.addType(x, t, this.byTargetType);
                }
            };
            return TransformManager;
        }());
        Bootstrap.TransformManager = TransformManager;
    })(Bootstrap = LiteMol.Bootstrap || (LiteMol.Bootstrap = {}));
})(LiteMol || (LiteMol = {}));
  return LiteMol.Bootstrap;
}
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = __LiteMol_Bootstrap(require(LiteMol-core), require(LiteMol-visualization));
} else if (typeof define === 'function' && define.amd) {
  define(['require'], function(require) { return __LiteMol_Bootstrap(require(LiteMol-core), require(LiteMol-visualization)); })
} else {
  var __target = !!window ? window : this;
  if (!__target.LiteMol || !__target.LiteMol.Core || !__target.LiteMol.Visualization ) {
    console.error("LiteMol-core/visualization must be included before LiteMol-function toLowerCase() { [native code] }.");
    throw 'LiteMol loader error.';
  }
  if (!__target.LiteMol) __target.LiteMol = {};
  __target.LiteMol.Bootstrap = __LiteMol_Bootstrap(__target.LiteMol.Core, __target.LiteMol.Visualization);
}

