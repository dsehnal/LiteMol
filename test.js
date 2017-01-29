/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    LiteMol.Promise = __LiteMolPromise;
})(LiteMol || (LiteMol = {}));
(function (LiteMol) {
    var Core;
    (function (Core) {
        "use strict";
        Core.Rx = __LiteMolRx;
        Core.Promise = LiteMol.Promise;
        var Formats;
        (function (Formats) {
            Formats.CIF = CIFTools;
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        Core.VERSION = { number: "3.0.1", date: "Jan 26 2017" };
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        "use strict";
        function computation(c) {
            return new Computation(c);
        }
        Core.computation = computation;
        var Computation = (function () {
            function Computation(computation) {
                this.computation = computation;
            }
            Computation.prototype.run = function (ctx) {
                return this.runWithContext(ctx).result;
            };
            Computation.prototype.runWithContext = function (ctx) {
                var _this = this;
                var context = ctx ? ctx : new ContextImpl();
                return {
                    progress: context.progressStream,
                    result: new Core.Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var result, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, 3, 4]);
                                    context.started();
                                    return [4 /*yield*/, this.computation(context)];
                                case 1:
                                    result = _a.sent();
                                    resolve(result);
                                    return [3 /*break*/, 4];
                                case 2:
                                    e_1 = _a.sent();
                                    reject(e_1);
                                    return [3 /*break*/, 4];
                                case 3:
                                    context.finished();
                                    return [7 /*endfinally*/];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })
                };
            };
            return Computation;
        }());
        Core.Computation = Computation;
        (function (Computation) {
            function resolve(a) {
                return computation(function () { return Core.Promise.resolve(a); });
            }
            Computation.resolve = resolve;
            function reject(reason) {
                return computation(function () { return Core.Promise.reject(reason); });
            }
            Computation.reject = reject;
            function createContext() {
                return new ContextImpl();
            }
            Computation.createContext = createContext;
            Computation.Aborted = 'Aborted';
            Computation.UpdateProgressDelta = 100;
        })(Computation = Core.Computation || (Core.Computation = {}));
        var ContextImpl = (function () {
            function ContextImpl() {
                var _this = this;
                this._abortRequested = false;
                this._abortRequester = function () { _this._abortRequested = true; };
                this.progressTick = new Core.Rx.Subject();
                this._progress = { message: 'Working...', current: 0, max: 0, isIndeterminate: true, requestAbort: void 0 };
                this.progressStream = new Core.Rx.BehaviorSubject(this._progress);
                this.startEndCounter = 0;
                this.progressTick.throttle(1000 / 15).subscribe(function (p) {
                    _this.progressStream.onNext({
                        message: p.message,
                        isIndeterminate: p.isIndeterminate,
                        current: p.current,
                        max: p.max,
                        requestAbort: p.requestAbort
                    });
                });
            }
            Object.defineProperty(ContextImpl.prototype, "isAbortRequested", {
                get: function () {
                    return this._abortRequested;
                },
                enumerable: true,
                configurable: true
            });
            ContextImpl.prototype.checkAborted = function () {
                if (this._abortRequested)
                    throw Computation.Aborted;
            };
            ContextImpl.prototype.requestAbort = function () {
                try {
                    if (this._abortRequester) {
                        this._abortRequester.call(null);
                    }
                }
                catch (e) { }
            };
            Object.defineProperty(ContextImpl.prototype, "progress", {
                get: function () { return this.progressTick; },
                enumerable: true,
                configurable: true
            });
            ContextImpl.prototype.updateProgress = function (msg, abort, current, max) {
                if (current === void 0) { current = NaN; }
                if (max === void 0) { max = NaN; }
                this.checkAborted();
                this._progress.message = msg;
                if (typeof abort === 'boolean') {
                    this._progress.requestAbort = abort ? this._abortRequester : void 0;
                }
                else {
                    if (abort)
                        this._abortRequester = abort;
                    this._progress.requestAbort = abort ? this._abortRequester : void 0;
                }
                if (isNaN(current)) {
                    this._progress.isIndeterminate = true;
                }
                else {
                    this._progress.isIndeterminate = false;
                    this._progress.current = current;
                    this._progress.max = max;
                }
                this.progressTick.onNext(this._progress);
                return new Core.Promise(function (res) { return setTimeout(res, 0); });
            };
            ContextImpl.prototype.started = function () {
                this.startEndCounter++;
            };
            ContextImpl.prototype.finished = function () {
                this.startEndCounter--;
                if (this.startEndCounter <= 0) {
                    this.progressTick.onCompleted();
                    this.progressStream.onCompleted();
                }
                if (this.startEndCounter < 0) {
                    throw 'Bug in code somewhere, Computation.resolve/reject called too many times.';
                }
            };
            return ContextImpl;
        }());
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            function createMapObject() {
                var map = Object.create(null);
                // to cause deoptimization as we don't want to create hidden classes
                map["__"] = void 0;
                delete map["__"];
                return map;
            }
            var FastMap;
            (function (FastMap) {
                function forEach(data, f, ctx) {
                    var hasOwn = Object.prototype.hasOwnProperty;
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var key = _a[_i];
                        if (!hasOwn.call(data, key))
                            continue;
                        var v = data[key];
                        if (v === void 0)
                            continue;
                        f(v, key, ctx);
                    }
                }
                var fastMap = {
                    set: function (key, v) {
                        if (this.data[key] === void 0 && v !== void 0) {
                            this.size++;
                        }
                        this.data[key] = v;
                    },
                    get: function (key) {
                        return this.data[key];
                    },
                    delete: function (key) {
                        if (this.data[key] === void 0)
                            return false;
                        delete this.data[key];
                        this.size--;
                        return true;
                    },
                    has: function (key) {
                        return this.data[key] !== void 0;
                    },
                    clear: function () {
                        this.data = createMapObject();
                        this.size = 0;
                    },
                    forEach: function (f, ctx) {
                        forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
                    }
                };
                /**
                 * Creates an empty map.
                 */
                function create() {
                    var ret = Object.create(fastMap);
                    ret.data = createMapObject();
                    ret.size = 0;
                    return ret;
                }
                FastMap.create = create;
                /**
                 * Create a map from an array of the form [[key, value], ...]
                 */
                function ofArray(data) {
                    var ret = create();
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var xs = data_1[_i];
                        ret.set(xs[0], xs[1]);
                    }
                    return ret;
                }
                FastMap.ofArray = ofArray;
                /**
                 * Create a map from an object of the form { key: value, ... }
                 */
                function ofObject(data) {
                    var ret = create();
                    var hasOwn = Object.prototype.hasOwnProperty;
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var key = _a[_i];
                        if (!hasOwn.call(data, key))
                            continue;
                        var v = data[key];
                        ret.set(key, v);
                    }
                    return ret;
                }
                FastMap.ofObject = ofObject;
            })(FastMap = Utils.FastMap || (Utils.FastMap = {}));
            var FastSet;
            (function (FastSet) {
                function forEach(data, f, ctx) {
                    var hasOwn = Object.prototype.hasOwnProperty;
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var p = _a[_i];
                        if (!hasOwn.call(data, p) || data[p] !== null)
                            continue;
                        f(p, ctx);
                    }
                }
                /**
                 * Uses null for present values.
                 */
                var fastSet = {
                    add: function (key) {
                        if (this.data[key] === null)
                            return false;
                        this.data[key] = null;
                        this.size++;
                        return true;
                    },
                    delete: function (key) {
                        if (this.data[key] !== null)
                            return false;
                        delete this.data[key];
                        this.size--;
                        return true;
                    },
                    has: function (key) {
                        return this.data[key] === null;
                    },
                    clear: function () {
                        this.data = createMapObject();
                        this.size = 0;
                    },
                    forEach: function (f, ctx) {
                        forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
                    }
                };
                /**
                 * Create an empty set.
                 */
                function create() {
                    var ret = Object.create(fastSet);
                    ret.data = createMapObject();
                    ret.size = 0;
                    return ret;
                }
                FastSet.create = create;
                /**
                 * Create a set of an "array like" sequence.
                 */
                function ofArray(xs) {
                    var ret = create();
                    for (var i = 0, l = xs.length; i < l; i++) {
                        ret.add(xs[i]);
                    }
                    return ret;
                }
                FastSet.ofArray = ofArray;
            })(FastSet = Utils.FastSet || (Utils.FastSet = {}));
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            Utils.FastNumberParsers = Core.Formats.CIF.Utils.FastNumberParsers;
            function extend(object, source, guard) {
                var v;
                var s = source;
                var o = object;
                var g = guard;
                for (var _i = 0, _a = Object.keys(source); _i < _a.length; _i++) {
                    var k = _a[_i];
                    v = s[k];
                    if (v !== void 0)
                        o[k] = v;
                    else if (guard)
                        o[k] = g[k];
                }
                if (guard) {
                    for (var _b = 0, _c = Object.keys(guard); _b < _c.length; _b++) {
                        var k = _c[_b];
                        v = o[k];
                        if (v === void 0)
                            o[k] = g[k];
                    }
                }
                return object;
            }
            Utils.extend = extend;
            ;
            function debounce(func, wait) {
                var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled = 0, maxWait = 0, trailing = true, leading = false;
                wait = Math.max(0, wait) || 0;
                var delayed = function () {
                    var remaining = wait - (performance.now() - stamp);
                    if (remaining <= 0) {
                        if (maxTimeoutId) {
                            clearTimeout(maxTimeoutId);
                        }
                        var isCalled = trailingCall;
                        maxTimeoutId = timeoutId = trailingCall = void 0;
                        if (isCalled) {
                            lastCalled = performance.now();
                            result = func.apply(thisArg, args);
                            if (!timeoutId && !maxTimeoutId) {
                                args = thisArg = null;
                            }
                        }
                    }
                    else {
                        timeoutId = setTimeout(delayed, remaining);
                    }
                };
                var maxDelayed = function () {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    maxTimeoutId = timeoutId = trailingCall = void 0;
                    if (trailing || (maxWait !== wait)) {
                        lastCalled = performance.now();
                        result = func.apply(thisArg, args);
                        if (!timeoutId && !maxTimeoutId) {
                            args = thisArg = null;
                        }
                    }
                };
                return function () {
                    args = arguments;
                    stamp = performance.now();
                    thisArg = this;
                    trailingCall = trailing && (timeoutId || !leading);
                    var isCalled = false;
                    var leadingCall = false;
                    if (maxWait === 0) {
                        leadingCall = leading && !timeoutId;
                    }
                    else {
                        if (!maxTimeoutId && !leading) {
                            lastCalled = stamp;
                        }
                        var remaining = maxWait - (stamp - lastCalled), isCalled_1 = remaining <= 0;
                        if (isCalled_1) {
                            if (maxTimeoutId) {
                                maxTimeoutId = clearTimeout(maxTimeoutId);
                            }
                            lastCalled = stamp;
                            result = func.apply(thisArg, args);
                        }
                        else if (!maxTimeoutId) {
                            maxTimeoutId = setTimeout(maxDelayed, remaining);
                        }
                    }
                    if (isCalled && timeoutId) {
                        timeoutId = clearTimeout(timeoutId);
                    }
                    else if (!timeoutId && wait !== maxWait) {
                        timeoutId = setTimeout(delayed, wait);
                    }
                    if (leadingCall) {
                        isCalled = true;
                        result = func.apply(thisArg, args);
                    }
                    if (isCalled && !timeoutId && !maxTimeoutId) {
                        args = thisArg = null;
                    }
                    return result;
                };
            }
            Utils.debounce = debounce;
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            var DataTable;
            (function (DataTable) {
                function typedColumn(t) {
                    return function (size) { return new t(size); };
                }
                DataTable.typedColumn = typedColumn;
                function customColumn() {
                    return function (size) { return new Array(size); };
                }
                DataTable.customColumn = customColumn;
                DataTable.stringColumn = function (size) { return new Array(size); };
                DataTable.stringNullColumn = function (size) { return new Array(size); };
                function builder(count) {
                    return new BuilderImpl(count);
                }
                DataTable.builder = builder;
                function ofDefinition(definition, count) {
                    var builder = DataTable.builder(count);
                    for (var _i = 0, _a = Object.keys(definition); _i < _a.length; _i++) {
                        var k = _a[_i];
                        if (!Object.prototype.hasOwnProperty.call(definition, k))
                            continue;
                        var col = definition[k];
                        if (col) {
                            builder.addColumn(k, col);
                        }
                    }
                    return builder.seal();
                }
                DataTable.ofDefinition = ofDefinition;
                function rowReader(table, indexer) {
                    var row = Object.create(null);
                    for (var _i = 0, _a = table.columns; _i < _a.length; _i++) {
                        var _c = _a[_i];
                        (function (c, row, idx, data) {
                            Object.defineProperty(row, c.name, { enumerable: true, configurable: false, get: function () { return data[idx.index]; } });
                        })(_c, row, indexer, table[_c.name]);
                    }
                    return row;
                }
                var TableImpl = (function () {
                    function TableImpl(count, srcColumns, srcData) {
                        this.__rowIndexer = { index: 0 };
                        this.count = count;
                        this.indices = new Int32Array(count);
                        this.columns = [];
                        for (var i = 0; i < count; i++) {
                            this.indices[i] = i;
                        }
                        for (var _i = 0, srcColumns_1 = srcColumns; _i < srcColumns_1.length; _i++) {
                            var col = srcColumns_1[_i];
                            var data = srcData[col.name];
                            if (Utils.ChunkedArray.is(data)) {
                                data = Utils.ChunkedArray.compact(data);
                            }
                            Object.defineProperty(this, col.name, { enumerable: true, configurable: false, writable: false, value: data });
                            this.columns[this.columns.length] = col;
                        }
                        this.__row = rowReader(this, this.__rowIndexer);
                    }
                    TableImpl.prototype.getBuilder = function (count) {
                        var b = new BuilderImpl(count);
                        for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                            var c = _a[_i];
                            b.addColumn(c.name, c.creator);
                        }
                        return b;
                    };
                    TableImpl.prototype.getRawData = function () {
                        var _this = this;
                        return this.columns.map(function (c) { return _this[c.name]; });
                    };
                    TableImpl.prototype.getRow = function (i) {
                        this.__rowIndexer.index = i;
                        return this.__row;
                    };
                    return TableImpl;
                }());
                var BuilderImpl = (function () {
                    function BuilderImpl(count) {
                        this.columns = [];
                        this.count = count;
                    }
                    BuilderImpl.prototype.addColumn = function (name, creator) {
                        var c = creator(this.count);
                        Object.defineProperty(this, name, { enumerable: true, configurable: false, writable: false, value: c });
                        this.columns[this.columns.length] = { name: name, creator: creator };
                        return c;
                    };
                    BuilderImpl.prototype.getRawData = function () {
                        var _this = this;
                        return this.columns.map(function (c) { return _this[c.name]; });
                    };
                    /**
                     * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine
                     * use internal class instead of dictionary representation.
                     */
                    BuilderImpl.prototype.seal = function () {
                        return new TableImpl(this.count, this.columns, this);
                    };
                    return BuilderImpl;
                }());
            })(DataTable = Utils.DataTable || (Utils.DataTable = {}));
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            function integerSetToSortedTypedArray(set) {
                var array = new Int32Array(set.size);
                set.forEach(function (v, ctx) { ctx.array[ctx.index++] = v; }, { array: array, index: 0 });
                Array.prototype.sort.call(array, function (x, y) { return x - y; });
                return array;
            }
            Utils.integerSetToSortedTypedArray = integerSetToSortedTypedArray;
            /**
             * A a JS native array with the given size.
             */
            function makeNativeIntArray(size) {
                var arr = [];
                for (var i = 0; i < size; i++)
                    arr[i] = 0;
                return arr;
            }
            Utils.makeNativeIntArray = makeNativeIntArray;
            /**
             * A a JS native array with the given size.
             */
            function makeNativeFloatArray(size) {
                var arr = [];
                if (!size)
                    return arr;
                arr[0] = 0.1;
                for (var i = 0; i < size; i++)
                    arr[i] = 0;
                return arr;
            }
            Utils.makeNativeFloatArray = makeNativeFloatArray;
            var ChunkedArray;
            (function (ChunkedArray) {
                function is(x) {
                    return x.creator && x.chunkSize;
                }
                ChunkedArray.is = is;
                function add4(array, x, y, z, w) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    array.current[array.currentIndex++] = y;
                    array.current[array.currentIndex++] = z;
                    array.current[array.currentIndex++] = w;
                    return array.elementCount++;
                }
                ChunkedArray.add4 = add4;
                function add3(array, x, y, z) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    array.current[array.currentIndex++] = y;
                    array.current[array.currentIndex++] = z;
                    return array.elementCount++;
                }
                ChunkedArray.add3 = add3;
                function add2(array, x, y) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    array.current[array.currentIndex++] = y;
                    return array.elementCount++;
                }
                ChunkedArray.add2 = add2;
                function add(array, x) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    return array.elementCount++;
                }
                ChunkedArray.add = add;
                function compact(array) {
                    var ret = array.creator(array.elementSize * array.elementCount), offset = (array.parts.length - 1) * array.chunkSize, offsetInner = 0, part;
                    if (array.parts.length > 1) {
                        if (array.parts[0].buffer) {
                            for (var i = 0; i < array.parts.length - 1; i++) {
                                ret.set(array.parts[i], array.chunkSize * i);
                            }
                        }
                        else {
                            for (var i = 0; i < array.parts.length - 1; i++) {
                                offsetInner = array.chunkSize * i;
                                part = array.parts[i];
                                for (var j = 0; j < array.chunkSize; j++) {
                                    ret[offsetInner + j] = part[j];
                                }
                            }
                        }
                    }
                    if (array.current.buffer && array.currentIndex >= array.chunkSize) {
                        ret.set(array.current, array.chunkSize * (array.parts.length - 1));
                    }
                    else {
                        for (var i = 0; i < array.currentIndex; i++) {
                            ret[offset + i] = array.current[i];
                        }
                    }
                    return ret;
                }
                ChunkedArray.compact = compact;
                function forVertex3D(chunkVertexCount) {
                    if (chunkVertexCount === void 0) { chunkVertexCount = 262144; }
                    return create(function (size) { return new Float32Array(size); }, chunkVertexCount, 3);
                }
                ChunkedArray.forVertex3D = forVertex3D;
                function forIndexBuffer(chunkIndexCount) {
                    if (chunkIndexCount === void 0) { chunkIndexCount = 262144; }
                    return create(function (size) { return new Uint32Array(size); }, chunkIndexCount, 3);
                }
                ChunkedArray.forIndexBuffer = forIndexBuffer;
                function forTokenIndices(chunkTokenCount) {
                    if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                    return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 2);
                }
                ChunkedArray.forTokenIndices = forTokenIndices;
                function forIndices(chunkTokenCount) {
                    if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                    return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 1);
                }
                ChunkedArray.forIndices = forIndices;
                function forInt32(chunkSize) {
                    if (chunkSize === void 0) { chunkSize = 131072; }
                    return create(function (size) { return new Int32Array(size); }, chunkSize, 1);
                }
                ChunkedArray.forInt32 = forInt32;
                function forFloat32(chunkSize) {
                    if (chunkSize === void 0) { chunkSize = 131072; }
                    return create(function (size) { return new Float32Array(size); }, chunkSize, 1);
                }
                ChunkedArray.forFloat32 = forFloat32;
                function forArray(chunkSize) {
                    if (chunkSize === void 0) { chunkSize = 131072; }
                    return create(function (size) { return []; }, chunkSize, 1);
                }
                ChunkedArray.forArray = forArray;
                function create(creator, chunkElementCount, elementSize) {
                    chunkElementCount = chunkElementCount | 0;
                    if (chunkElementCount <= 0)
                        chunkElementCount = 1;
                    var chunkSize = chunkElementCount * elementSize;
                    var current = creator(chunkSize);
                    return {
                        elementSize: elementSize,
                        chunkSize: chunkSize,
                        creator: creator,
                        current: current,
                        parts: [current],
                        currentIndex: 0,
                        elementCount: 0
                    };
                }
                ChunkedArray.create = create;
            })(ChunkedArray = Utils.ChunkedArray || (Utils.ChunkedArray = {}));
            var ArrayBuilder;
            (function (ArrayBuilder) {
                function add3(array, x, y, z) {
                    var a = array.array;
                    a[array.currentIndex++] = x;
                    a[array.currentIndex++] = y;
                    a[array.currentIndex++] = z;
                    array.elementCount++;
                }
                ArrayBuilder.add3 = add3;
                function add2(array, x, y) {
                    var a = array.array;
                    a[array.currentIndex++] = x;
                    a[array.currentIndex++] = y;
                    array.elementCount++;
                }
                ArrayBuilder.add2 = add2;
                function add(array, x) {
                    array.array[array.currentIndex++] = x;
                    array.elementCount++;
                }
                ArrayBuilder.add = add;
                function forVertex3D(count) {
                    return create(function (size) { return new Float32Array(size); }, count, 3);
                }
                ArrayBuilder.forVertex3D = forVertex3D;
                function forIndexBuffer(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 3);
                }
                ArrayBuilder.forIndexBuffer = forIndexBuffer;
                function forTokenIndices(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 2);
                }
                ArrayBuilder.forTokenIndices = forTokenIndices;
                function forIndices(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 1);
                }
                ArrayBuilder.forIndices = forIndices;
                function forInt32(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 1);
                }
                ArrayBuilder.forInt32 = forInt32;
                function forFloat32(count) {
                    return create(function (size) { return new Float32Array(size); }, count, 1);
                }
                ArrayBuilder.forFloat32 = forFloat32;
                function forArray(count) {
                    return create(function (size) { return []; }, count, 1);
                }
                ArrayBuilder.forArray = forArray;
                function create(creator, chunkElementCount, elementSize) {
                    chunkElementCount = chunkElementCount | 0;
                    return {
                        array: creator(chunkElementCount * elementSize),
                        currentIndex: 0,
                        elementCount: 0
                    };
                }
                ArrayBuilder.create = create;
            })(ArrayBuilder = Utils.ArrayBuilder || (Utils.ArrayBuilder = {}));
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            var PerformanceHelper;
            (function (PerformanceHelper) {
                PerformanceHelper.perfGetTime = (function () {
                    if (typeof window !== 'undefined' && window.performance) {
                        return function () { return window.performance.now(); };
                    }
                    else if (typeof process !== 'undefined' && process.hrtime !== 'undefined') {
                        return function () {
                            var t = process.hrtime();
                            return t[0] * 1000 + t[1] / 1000000;
                        };
                    }
                    else {
                        return function () { return +new Date(); };
                    }
                })();
            })(PerformanceHelper || (PerformanceHelper = {}));
            var PerformanceMonitor = (function () {
                function PerformanceMonitor() {
                    this.starts = Utils.FastMap.create();
                    this.ends = Utils.FastMap.create();
                }
                PerformanceMonitor.currentTime = function () {
                    return PerformanceHelper.perfGetTime();
                };
                PerformanceMonitor.prototype.start = function (name) {
                    this.starts.set(name, PerformanceHelper.perfGetTime());
                };
                PerformanceMonitor.prototype.end = function (name) {
                    this.ends.set(name, PerformanceHelper.perfGetTime());
                };
                PerformanceMonitor.format = function (t) {
                    if (isNaN(t))
                        return 'n/a';
                    var h = Math.floor(t / (60 * 60 * 1000)), m = Math.floor(t / (60 * 1000) % 60), s = Math.floor(t / 1000 % 60), ms = Math.floor(t % 1000).toString();
                    while (ms.length < 3)
                        ms = "0" + ms;
                    if (h > 0)
                        return h + "h" + m + "m" + s + "." + ms + "s";
                    if (m > 0)
                        return m + "m" + s + "." + ms + "s";
                    if (s > 0)
                        return s + "." + ms + "s";
                    return t.toFixed(0) + "ms";
                };
                PerformanceMonitor.prototype.formatTime = function (name) {
                    return PerformanceMonitor.format(this.time(name));
                };
                PerformanceMonitor.prototype.formatTimeSum = function () {
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    return PerformanceMonitor.format(this.timeSum.apply(this, names));
                };
                // return the time in milliseconds and removes them from the cache.
                PerformanceMonitor.prototype.time = function (name) {
                    var start = this.starts.get(name), end = this.ends.get(name);
                    this.starts.delete(name);
                    this.ends.delete(name);
                    return end - start;
                };
                PerformanceMonitor.prototype.timeSum = function () {
                    var _this = this;
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    var t = 0;
                    for (var _a = 0, _b = names.map(function (n) { return _this.ends.get(n) - _this.starts.get(n); }); _a < _b.length; _a++) {
                        var m = _b[_a];
                        t += m;
                    }
                    return t;
                };
                return PerformanceMonitor;
            }());
            Utils.PerformanceMonitor = PerformanceMonitor;
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            "use strict";
            var FormatInfo;
            (function (FormatInfo) {
                function is(o) {
                    return o.name && o.parse;
                }
                FormatInfo.is = is;
                function fromShortcut(all, name) {
                    name = name.toLowerCase().trim();
                    for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
                        var f = all_1[_i];
                        for (var _a = 0, _b = f.shortcuts; _a < _b.length; _a++) {
                            var s = _b[_a];
                            if (s.toLowerCase() === name)
                                return f;
                        }
                    }
                    return void 0;
                }
                FormatInfo.fromShortcut = fromShortcut;
                function formatRegExp(info) {
                    return new RegExp(info.extensions.map(function (e) { return "(\\" + e + ")"; }).join('|') + '(\\.gz){0,1}$', 'i');
                }
                FormatInfo.formatRegExp = formatRegExp;
                function formatFileFilters(all) {
                    return all.map(function (info) { return info.extensions.map(function (e) { return e + "," + e + ".gz"; }).join(','); }).join(',');
                }
                FormatInfo.formatFileFilters = formatFileFilters;
                function getFormat(filename, all) {
                    for (var _i = 0, all_2 = all; _i < all_2.length; _i++) {
                        var f = all_2[_i];
                        if (formatRegExp(f).test(filename))
                            return f;
                    }
                    return void 0;
                }
                FormatInfo.getFormat = getFormat;
            })(FormatInfo = Formats.FormatInfo || (Formats.FormatInfo = {}));
            var ParserResult;
            (function (ParserResult) {
                function error(message, line) {
                    if (line === void 0) { line = -1; }
                    return new ParserError(message, line);
                }
                ParserResult.error = error;
                function success(result, warnings) {
                    if (warnings === void 0) { warnings = []; }
                    return new ParserSuccess(result, warnings);
                }
                ParserResult.success = success;
            })(ParserResult = Formats.ParserResult || (Formats.ParserResult = {}));
            var ParserError = (function () {
                function ParserError(message, line) {
                    this.message = message;
                    this.line = line;
                    this.isError = true;
                }
                ParserError.prototype.toString = function () {
                    if (this.line >= 0) {
                        return "[Line " + this.line + "] " + this.message;
                    }
                    return this.message;
                };
                return ParserError;
            }());
            Formats.ParserError = ParserError;
            var ParserSuccess = (function () {
                function ParserSuccess(result, warnings) {
                    this.result = result;
                    this.warnings = warnings;
                    this.isError = false;
                }
                return ParserSuccess;
            }());
            Formats.ParserSuccess = ParserSuccess;
            var TokenIndexBuilder;
            (function (TokenIndexBuilder) {
                function resize(builder) {
                    // scale the size using golden ratio, because why not.
                    var newBuffer = new Int32Array((1.61 * builder.tokens.length) | 0);
                    newBuffer.set(builder.tokens);
                    builder.tokens = newBuffer;
                    builder.tokensLenMinus2 = (newBuffer.length - 2) | 0;
                }
                function addToken(builder, start, end) {
                    if (builder.count >= builder.tokensLenMinus2) {
                        resize(builder);
                    }
                    builder.tokens[builder.count++] = start;
                    builder.tokens[builder.count++] = end;
                }
                TokenIndexBuilder.addToken = addToken;
                function create(size) {
                    return {
                        tokensLenMinus2: (size - 2) | 0,
                        count: 0,
                        tokens: new Int32Array(size)
                    };
                }
                TokenIndexBuilder.create = create;
            })(TokenIndexBuilder = Formats.TokenIndexBuilder || (Formats.TokenIndexBuilder = {}));
            var ShortStringPool;
            (function (ShortStringPool) {
                function create() { return Object.create(null); }
                ShortStringPool.create = create;
                function get(pool, str) {
                    if (str.length > 6)
                        return str;
                    var value = pool[str];
                    if (value !== void 0)
                        return value;
                    pool[str] = str;
                    return str;
                }
                ShortStringPool.get = get;
            })(ShortStringPool = Formats.ShortStringPool || (Formats.ShortStringPool = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var mmCIF;
                (function (mmCIF) {
                    "use strict";
                    var Defaults;
                    (function (Defaults) {
                        Defaults.ElementSymbol = 'X';
                        Defaults.ResidueName = 'UNK';
                        Defaults.AsymId = '';
                        Defaults.EntityId = '1';
                        Defaults.ModelId = '1';
                    })(Defaults || (Defaults = {}));
                    function getTransform(category, matrixField, translationField, row) {
                        var ret = Core.Geometry.LinearAlgebra.Matrix4.identity(), i, j, c;
                        for (i = 1; i <= 3; i++) {
                            for (j = 1; j <= 3; j++) {
                                c = matrixField + "[" + i + "][" + j + "]";
                                Core.Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, j - 1, category.getColumn(matrixField + "[" + i + "][" + j + "]").getFloat(row));
                            }
                            Core.Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, 3, category.getColumn(translationField + "[" + i + "]").getFloat(row));
                        }
                        return ret;
                    }
                    function getModelEndRow(startRow, rowCount, modelNum) {
                        var i = 0;
                        if (!modelNum || !modelNum.isDefined)
                            return rowCount;
                        for (i = startRow + 1; i < rowCount; i++) {
                            if (!modelNum.areValuesEqual(i - 1, i))
                                break;
                        }
                        return i;
                    }
                    var AtomSiteColumns = [
                        'id',
                        'Cartn_x',
                        'Cartn_y',
                        'Cartn_z',
                        'label_atom_id',
                        'type_symbol',
                        'occupancy',
                        'B_iso_or_equiv',
                        'auth_atom_id',
                        'label_alt_id',
                        'label_comp_id',
                        'label_seq_id',
                        'label_asym_id',
                        'auth_comp_id',
                        'auth_seq_id',
                        'auth_asym_id',
                        'group_PDB',
                        'label_entity_id',
                        'pdbx_PDB_ins_code',
                        'pdbx_PDB_model_num'
                    ];
                    function getAtomSiteColumns(category) {
                        var ret = Core.Utils.FastMap.create();
                        for (var _i = 0, AtomSiteColumns_1 = AtomSiteColumns; _i < AtomSiteColumns_1.length; _i++) {
                            var c = AtomSiteColumns_1[_i];
                            ret.set(c, category.getColumn(c));
                        }
                        return ret;
                    }
                    function buildModelAtomTable(startRow, rowCount, columns) {
                        var endRow = getModelEndRow(startRow, rowCount, columns.get('pdbx_PDB_model_num'));
                        var atoms = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Atoms, endRow - startRow), positions = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Positions, endRow - startRow), pX = positions.x, pXCol = columns.get('Cartn_x'), pY = positions.y, pYCol = columns.get('Cartn_y'), pZ = positions.z, pZCol = columns.get('Cartn_z'), id = atoms.id, idCol = columns.get('id'), altLoc = atoms.altLoc, altLocCol = columns.get('label_alt_id'), rowIndex = atoms.rowIndex, residueIndex = atoms.residueIndex, chainIndex = atoms.chainIndex, entityIndex = atoms.entityIndex, name = atoms.name, nameCol = columns.get('label_atom_id'), elementSymbol = atoms.elementSymbol, elementSymbolCol = columns.get('type_symbol'), occupancy = atoms.occupancy, occupancyCol = columns.get('occupancy'), tempFactor = atoms.tempFactor, tempFactorCol = columns.get('B_iso_or_equiv'), authName = atoms.authName, authNameCol = columns.get('auth_atom_id');
                        var asymIdCol = columns.get('label_asym_id'), entityIdCol = columns.get('label_entity_id'), insCodeCol = columns.get('pdbx_PDB_ins_code'), authResSeqNumberCol = columns.get('auth_seq_id'), modelNumCol = columns.get('pdbx_PDB_model_num'), numChains = 0, numResidues = 0, numEntities = 0;
                        var prev = startRow;
                        for (var row = startRow; row < endRow; row++) {
                            var index = row - startRow;
                            id[index] = idCol.getInteger(row);
                            pX[index] = pXCol.getFloat(row);
                            pY[index] = pYCol.getFloat(row);
                            pZ[index] = pZCol.getFloat(row);
                            elementSymbol[index] = elementSymbolCol.getString(row) || Defaults.ElementSymbol;
                            name[index] = nameCol.getString(row) || elementSymbol[index];
                            authName[index] = authNameCol.getString(row) || name[index];
                            altLoc[index] = altLocCol.getString(row);
                            occupancy[index] = occupancyCol.getFloat(row);
                            tempFactor[index] = tempFactorCol.getFloat(row);
                            var newChain = false;
                            var newResidue = !authResSeqNumberCol.areValuesEqual(prev, row) || !insCodeCol.areValuesEqual(prev, row);
                            if (!asymIdCol.areValuesEqual(prev, row)) {
                                newChain = true;
                                newResidue = true;
                            }
                            if (!entityIdCol.areValuesEqual(prev, row)) {
                                numEntities++;
                                newChain = true;
                                newResidue = true;
                            }
                            if (newResidue)
                                numResidues++;
                            if (newChain)
                                numChains++;
                            rowIndex[index] = row;
                            residueIndex[index] = numResidues;
                            chainIndex[index] = numChains;
                            entityIndex[index] = numEntities;
                            prev = row;
                        }
                        var modelId = !modelNumCol.isDefined ? Defaults.ModelId : modelNumCol.getString(startRow) || Defaults.ModelId;
                        return { atoms: atoms, positions: positions, modelId: modelId, endRow: endRow };
                    }
                    function buildStructure(columns, atoms) {
                        var count = atoms.count, residueIndexCol = atoms.residueIndex, chainIndexCol = atoms.chainIndex, entityIndexCol = atoms.entityIndex;
                        var residues = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Residues, atoms.residueIndex[atoms.count - 1] + 1), chains = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Chains, atoms.chainIndex[atoms.count - 1] + 1), entities = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Entities, atoms.entityIndex[atoms.count - 1] + 1);
                        var residueName = residues.name, residueSeqNumber = residues.seqNumber, residueAsymId = residues.asymId, residueAuthName = residues.authName, residueAuthSeqNumber = residues.authSeqNumber, residueAuthAsymId = residues.authAsymId, residueInsertionCode = residues.insCode, residueEntityId = residues.entityId, residueIsHet = residues.isHet, residueAtomStartIndex = residues.atomStartIndex, residueAtomEndIndex = residues.atomEndIndex, residueChainIndex = residues.chainIndex, residueEntityIndex = residues.entityIndex;
                        var chainAsymId = chains.asymId, chainEntityId = chains.entityId, chainAuthAsymId = chains.authAsymId, chainAtomStartIndex = chains.atomStartIndex, chainAtomEndIndex = chains.atomEndIndex, chainResidueStartIndex = chains.residueStartIndex, chainResidueEndIndex = chains.residueEndIndex, chainEntityIndex = chains.entityIndex;
                        var entityId = entities.entityId, entityType = entities.type, entityAtomStartIndex = entities.atomStartIndex, entityAtomEndIndex = entities.atomEndIndex, entityResidueStartIndex = entities.residueStartIndex, entityResidueEndIndex = entities.residueEndIndex, entityChainStartIndex = entities.chainStartIndex, entityChainEndIndex = entities.chainEndIndex;
                        var resNameCol = columns.get('label_comp_id'), resSeqNumberCol = columns.get('label_seq_id'), asymIdCol = columns.get('label_asym_id'), authResNameCol = columns.get('auth_comp_id'), authResSeqNumberCol = columns.get('auth_seq_id'), authAsymIdCol = columns.get('auth_asym_id'), isHetCol = columns.get('group_PDB'), entityCol = columns.get('label_entity_id'), insCodeCol = columns.get('pdbx_PDB_ins_code');
                        var residueStart = 0, chainStart = 0, entityStart = 0, entityChainStart = 0, entityResidueStart = 0, chainResidueStart = 0, currentResidue = 0, currentChain = 0, currentEntity = 0;
                        var i = 0;
                        for (i = 0; i < count; i++) {
                            if (residueIndexCol[i] !== residueIndexCol[residueStart]) {
                                residueName[currentResidue] = resNameCol.getString(residueStart) || Defaults.ResidueName;
                                residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
                                residueAsymId[currentResidue] = asymIdCol.getString(residueStart) || Defaults.AsymId;
                                residueAuthName[currentResidue] = authResNameCol.getString(residueStart) || residueName[currentResidue];
                                residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
                                residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart) || residueAsymId[currentResidue];
                                residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
                                residueEntityId[currentResidue] = entityCol.getString(residueStart) || Defaults.EntityId;
                                residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;
                                residueAtomStartIndex[currentResidue] = residueStart;
                                residueAtomEndIndex[currentResidue] = i;
                                residueChainIndex[currentResidue] = currentChain;
                                residueEntityIndex[currentResidue] = currentEntity;
                                currentResidue++;
                                residueStart = i;
                            }
                            if (chainIndexCol[i] !== chainIndexCol[chainStart]) {
                                chainAsymId[currentChain] = asymIdCol.getString(chainStart) || Defaults.AsymId;
                                chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart) || chainAsymId[currentChain];
                                chainEntityId[currentChain] = entityCol.getString(chainStart) || Defaults.EntityId;
                                chainResidueStartIndex[currentChain] = chainResidueStart;
                                chainResidueEndIndex[currentChain] = currentResidue;
                                chainAtomStartIndex[currentChain] = chainStart;
                                chainAtomEndIndex[currentChain] = i;
                                chainEntityIndex[currentChain] = currentEntity;
                                currentChain++;
                                chainStart = i;
                                chainResidueStart = currentResidue;
                            }
                            if (entityIndexCol[i] !== entityIndexCol[entityStart]) {
                                entityId[currentEntity] = entityCol.getString(entityStart) || Defaults.EntityId;
                                entityType[currentEntity] = 'unknown';
                                entityAtomStartIndex[currentEntity] = entityStart;
                                entityAtomEndIndex[currentEntity] = i;
                                entityResidueStartIndex[currentEntity] = entityResidueStart;
                                entityResidueEndIndex[currentEntity] = currentResidue;
                                entityChainStartIndex[currentEntity] = entityChainStart;
                                entityChainEndIndex[currentEntity] = currentChain;
                                currentEntity++;
                                entityStart = i;
                                entityChainStart = currentChain;
                                entityResidueStart = currentResidue;
                            }
                        }
                        // entity
                        entityId[currentEntity] = entityCol.getString(entityStart) || Defaults.EntityId;
                        entityType[currentEntity] = 'unknown';
                        entityAtomStartIndex[currentEntity] = entityStart;
                        entityAtomEndIndex[currentEntity] = i;
                        entityResidueStartIndex[currentEntity] = entityResidueStart;
                        entityResidueEndIndex[currentEntity] = currentResidue + 1;
                        entityChainStartIndex[currentEntity] = entityChainStart;
                        entityChainEndIndex[currentEntity] = currentChain + 1;
                        // chain
                        chainAsymId[currentChain] = asymIdCol.getString(chainStart) || Defaults.AsymId;
                        chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart) || chainAsymId[currentChain];
                        chainEntityId[currentChain] = entityCol.getString(chainStart) || Defaults.EntityId;
                        chainResidueStartIndex[currentChain] = chainResidueStart;
                        chainResidueEndIndex[currentChain] = currentResidue + 1;
                        chainAtomStartIndex[currentChain] = chainStart;
                        chainAtomEndIndex[currentChain] = i;
                        chainEntityIndex[currentChain] = currentEntity;
                        // residue
                        residueName[currentResidue] = resNameCol.getString(residueStart) || Defaults.ResidueName;
                        residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
                        residueAsymId[currentResidue] = asymIdCol.getString(residueStart) || Defaults.AsymId;
                        residueAuthName[currentResidue] = authResNameCol.getString(residueStart) || residueName[currentResidue];
                        residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
                        residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart) || residueAsymId[currentResidue];
                        residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
                        residueAtomStartIndex[currentResidue] = residueStart;
                        residueAtomEndIndex[currentResidue] = i;
                        residueChainIndex[currentResidue] = currentChain;
                        residueEntityIndex[currentResidue] = currentEntity;
                        residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;
                        return { residues: residues, chains: chains, entities: entities };
                    }
                    function assignEntityTypes(category, entities) {
                        var i;
                        if (!category) {
                            return;
                        }
                        var data = {}, typeCol = category.getColumn('type'), idCol = category.getColumn('id');
                        for (i = 0; i < category.rowCount; i++) {
                            var t = (typeCol.getString(i) || '').toLowerCase();
                            var eId = idCol.getString(i) || Defaults.EntityId;
                            switch (t) {
                                case 'polymer':
                                case 'non-polymer':
                                case 'water':
                                    data[eId] = t;
                                    break;
                                default:
                                    data[eId] = 'unknown';
                                    break;
                            }
                        }
                        for (i = 0; i < entities.count; i++) {
                            var et = data[entities.entityId[i]];
                            if (et !== void 0) {
                                entities.type[i] = et;
                            }
                        }
                    }
                    function residueIdfromColumns(row, asymId, seqNum, insCode) {
                        return new Core.Structure.PolyResidueIdentifier(asymId.getString(row) || Defaults.AsymId, seqNum.getInteger(row), insCode.getString(row));
                    }
                    var aminoAcidNames = { 'ALA': true, 'ARG': true, 'ASP': true, 'CYS': true, 'GLN': true, 'GLU': true, 'GLY': true, 'HIS': true, 'ILE': true, 'LEU': true, 'LYS': true, 'MET': true, 'PHE': true, 'PRO': true, 'SER': true, 'THR': true, 'TRP': true, 'TYR': true, 'VAL': true, 'ASN': true, 'PYL': true, 'SEC': true };
                    function isResidueAminoSeq(atoms, residues, entities, index) {
                        if (entities.type[residues.entityIndex[index]] !== 'polymer')
                            return false;
                        //if (mmCif.aminoAcidNames[residues.name[index]]) return true;
                        var ca = false, o = false, names = atoms.name, assigned = 0;
                        for (var i = residues.atomStartIndex[index], max = residues.atomEndIndex[index]; i < max; i++) {
                            var n = names[i];
                            if (!ca && n === 'CA') {
                                ca = true;
                                assigned++;
                            }
                            else if (!o && n === 'O') {
                                o = true;
                                assigned++;
                            }
                            if (assigned === 2)
                                break;
                        }
                        return (ca && o) || (ca && !residues.isHet[index]);
                    }
                    function isResidueNucleotide(atoms, residues, entities, index) {
                        if (aminoAcidNames[residues.name[index]] || entities.type[residues.entityIndex[index]] !== 'polymer')
                            return false;
                        var o5 = false, c3 = false, n3 = false, p = false, names = atoms.name, assigned = 0;
                        var start = residues.atomStartIndex[index], end = residues.atomEndIndex[index];
                        // test for single atom instances
                        if (end - start === 1 && !residues.isHet[start] && names[start] === 'P') {
                            return true;
                        }
                        for (var i = start; i < end; i++) {
                            var n = names[i];
                            if (!o5 && n === "O5'") {
                                o5 = true;
                                assigned++;
                            }
                            else if (!c3 && n === "C3'") {
                                c3 = true;
                                assigned++;
                            }
                            else if (!n3 && n === 'N3') {
                                n3 = true;
                                assigned++;
                            }
                            else if (!p && n === 'P') {
                                p = true;
                                assigned++;
                            }
                            if (assigned === 4)
                                break;
                        }
                        return o5 && c3 && n3 && p;
                    }
                    function analyzeSecondaryStructure(atoms, residues, entities, start, end, elements) {
                        var asymId = residues.asymId, entityIndex = residues.entityIndex, currentType = 0 /* None */, currentElementStartIndex = start, currentResidueIndex = start, residueCount = end;
                        while (currentElementStartIndex < residueCount) {
                            if (isResidueNucleotide(atoms, residues, entities, currentElementStartIndex)) {
                                currentResidueIndex = currentElementStartIndex + 1;
                                while (currentResidueIndex < residueCount
                                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                                    && isResidueNucleotide(atoms, residues, entities, currentResidueIndex)) {
                                    currentResidueIndex++;
                                }
                                currentType = 5 /* Strand */;
                            }
                            else if (isResidueAminoSeq(atoms, residues, entities, currentElementStartIndex)) {
                                currentResidueIndex = currentElementStartIndex + 1;
                                while (currentResidueIndex < residueCount
                                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                                    && isResidueAminoSeq(atoms, residues, entities, currentResidueIndex)) {
                                    currentResidueIndex++;
                                }
                                currentType = 4 /* AminoSeq */;
                            }
                            else {
                                currentResidueIndex = currentElementStartIndex + 1;
                                while (currentResidueIndex < residueCount
                                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                                    && !isResidueNucleotide(atoms, residues, entities, currentResidueIndex)
                                    && !isResidueAminoSeq(atoms, residues, entities, currentResidueIndex)) {
                                    currentResidueIndex++;
                                }
                                currentType = 0 /* None */;
                            }
                            var e = new Core.Structure.SecondaryStructureElement(currentType, new Core.Structure.PolyResidueIdentifier(residues.asymId[currentElementStartIndex], residues.seqNumber[currentElementStartIndex], residues.insCode[currentElementStartIndex]), new Core.Structure.PolyResidueIdentifier(residues.asymId[currentResidueIndex - 1], residues.seqNumber[currentResidueIndex - 1], residues.insCode[currentResidueIndex - 1]));
                            e.startResidueIndex = currentElementStartIndex;
                            e.endResidueIndex = currentResidueIndex;
                            elements[elements.length] = e;
                            currentElementStartIndex = currentResidueIndex;
                        }
                    }
                    function splitNonconsecutiveSecondaryStructure(residues, elements) {
                        var ret = [];
                        var authSeqNumber = residues.authSeqNumber;
                        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                            var s = elements_1[_i];
                            var partStart = s.startResidueIndex;
                            var end = s.endResidueIndex - 1;
                            for (var i = s.startResidueIndex; i < end; i++) {
                                if (authSeqNumber[i + 1] - authSeqNumber[i] === 1)
                                    continue;
                                var e = new Core.Structure.SecondaryStructureElement(s.type, s.startResidueId, s.endResidueId, s.info);
                                e.startResidueIndex = partStart;
                                e.endResidueIndex = i + 1;
                                ret[ret.length] = e;
                                partStart = i + 1;
                            }
                            if (partStart === s.startResidueIndex) {
                                ret[ret.length] = s;
                            }
                            else {
                                var e = new Core.Structure.SecondaryStructureElement(s.type, s.startResidueId, s.endResidueId, s.info);
                                e.startResidueIndex = partStart;
                                e.endResidueIndex = s.endResidueIndex;
                                ret[ret.length] = e;
                            }
                        }
                        return ret;
                    }
                    function updateSSIndicesAndFilterEmpty(elements, structure) {
                        var residues = structure.residues, count = residues.count, asymId = residues.asymId, seqNumber = residues.seqNumber, insCode = residues.insCode, currentElement = void 0, key = '', starts = Core.Utils.FastMap.create(), ends = Core.Utils.FastMap.create();
                        for (var _i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                            var e = elements_2[_i];
                            key = e.startResidueId.asymId + ' ' + e.startResidueId.seqNumber;
                            if (e.startResidueId.insCode)
                                key += ' ' + e.startResidueId.insCode;
                            starts.set(key, e);
                            key = e.endResidueId.asymId + ' ' + e.endResidueId.seqNumber;
                            if (e.endResidueId.insCode)
                                key += ' ' + e.endResidueId.insCode;
                            ends.set(key, e);
                        }
                        for (var i = 0; i < count; i++) {
                            key = asymId[i] + ' ' + seqNumber[i];
                            if (insCode[i])
                                key += ' ' + insCode[i];
                            currentElement = starts.get(key);
                            if (currentElement) {
                                currentElement.startResidueIndex = i;
                                currentElement.endResidueIndex = i + 1;
                            }
                            currentElement = ends.get(key);
                            if (currentElement) {
                                if (currentElement.startResidueIndex < 0)
                                    currentElement.startResidueIndex = i;
                                currentElement.endResidueIndex = i + 1;
                            }
                        }
                        if (currentElement) {
                            currentElement.endResidueIndex = count;
                        }
                        var nonEmpty = [];
                        for (var _a = 0, elements_3 = elements; _a < elements_3.length; _a++) {
                            var e = elements_3[_a];
                            if (e.startResidueIndex < 0 || e.endResidueIndex < 0)
                                continue;
                            if (e.type === 3 /* Sheet */ && e.length < 3)
                                continue;
                            if (e.endResidueIndex >= 0 && e.startResidueIndex >= 0)
                                nonEmpty[nonEmpty.length] = e;
                        }
                        nonEmpty.sort(function (a, b) { return a.startResidueIndex - b.startResidueIndex; });
                        // fix one-off "overlaps" for helices
                        for (var i = 0; i < nonEmpty.length - 1; i++) {
                            if (nonEmpty[i + 1].startResidueIndex - nonEmpty[i].endResidueIndex === -1) {
                                nonEmpty[i + 1].startResidueIndex++;
                            }
                        }
                        if (!nonEmpty.length)
                            return nonEmpty;
                        var ret = [nonEmpty[0]];
                        // handle overlapping structures.
                        for (var i = 1; i < nonEmpty.length; i++) {
                            var a = ret[ret.length - 1], b = nonEmpty[i];
                            if (b.startResidueIndex < a.endResidueIndex) {
                                handleSecondaryStructureCollision(a, b);
                            }
                            else {
                                ret[ret.length] = b;
                            }
                        }
                        return ret;
                    }
                    function handleSecondaryStructureCollision(a, b) {
                        if (b.endResidueIndex > a.endResidueIndex) {
                            a.endResidueIndex = b.endResidueIndex;
                        }
                    }
                    function getSecondaryStructureInfo(data, atoms, structure) {
                        var input = [], elements = [];
                        var _struct_conf = data.getCategory('_struct_conf'), _struct_sheet_range = data.getCategory('_struct_sheet_range'), i;
                        if (_struct_conf) {
                            var type_id_col = _struct_conf.getColumn('conf_type_id');
                            if (type_id_col) {
                                var beg_label_asym_id = _struct_conf.getColumn('beg_label_asym_id');
                                var beg_label_seq_id = _struct_conf.getColumn('beg_label_seq_id');
                                var pdbx_beg_PDB_ins_code = _struct_conf.getColumn('pdbx_beg_PDB_ins_code');
                                var end_label_asym_id = _struct_conf.getColumn('end_label_asym_id');
                                var end_label_seq_id = _struct_conf.getColumn('end_label_seq_id');
                                var pdbx_end_PDB_ins_code = _struct_conf.getColumn('pdbx_end_PDB_ins_code');
                                var pdbx_PDB_helix_class = _struct_conf.getColumn('pdbx_PDB_helix_class');
                                for (i = 0; i < _struct_conf.rowCount; i++) {
                                    var type = void 0;
                                    switch ((type_id_col.getString(i) || '').toUpperCase()) {
                                        case 'HELX_P':
                                            type = 1 /* Helix */;
                                            break;
                                        case 'TURN_P':
                                            type = 2 /* Turn */;
                                            break;
                                    }
                                    if (!type)
                                        continue;
                                    input[input.length] = new Core.Structure.SecondaryStructureElement(type, residueIdfromColumns(i, beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code), residueIdfromColumns(i, end_label_asym_id, end_label_seq_id, pdbx_end_PDB_ins_code), {
                                        helixClass: pdbx_PDB_helix_class.getString(i)
                                    });
                                }
                            }
                        }
                        if (_struct_sheet_range) {
                            var beg_label_asym_id = _struct_sheet_range.getColumn('beg_label_asym_id');
                            var beg_label_seq_id = _struct_sheet_range.getColumn('beg_label_seq_id');
                            var pdbx_beg_PDB_ins_code = _struct_sheet_range.getColumn('pdbx_beg_PDB_ins_code');
                            var end_label_asym_id = _struct_sheet_range.getColumn('end_label_asym_id');
                            var end_label_seq_id = _struct_sheet_range.getColumn('end_label_seq_id');
                            var pdbx_end_PDB_ins_code = _struct_sheet_range.getColumn('pdbx_end_PDB_ins_code');
                            var symmetry = _struct_sheet_range.getColumn('symmetry');
                            var sheet_id = _struct_sheet_range.getColumn('sheet_id');
                            for (i = 0; i < _struct_sheet_range.rowCount; i++) {
                                input[input.length] = new Core.Structure.SecondaryStructureElement(3 /* Sheet */, residueIdfromColumns(i, beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code), residueIdfromColumns(i, end_label_asym_id, end_label_seq_id, pdbx_end_PDB_ins_code), {
                                    symmetry: symmetry.getString(i),
                                    sheetId: sheet_id.getString(i),
                                    id: sheet_id.getString(i)
                                });
                            }
                        }
                        var secondary = input.length > 0 ? updateSSIndicesAndFilterEmpty(input, structure) : [];
                        var residues = structure.residues, residueCount = residues.count;
                        if (secondary.length === 0) {
                            analyzeSecondaryStructure(atoms, residues, structure.entities, 0, residueCount, elements);
                            return splitNonconsecutiveSecondaryStructure(residues, elements);
                        }
                        var _max = secondary.length - 1;
                        if (secondary[0].startResidueIndex > 0) {
                            analyzeSecondaryStructure(atoms, residues, structure.entities, 0, secondary[0].startResidueIndex, elements);
                        }
                        for (i = 0; i < _max; i++) {
                            elements[elements.length] = secondary[i];
                            if (secondary[i + 1].startResidueIndex - secondary[i].endResidueIndex > 0) {
                                analyzeSecondaryStructure(atoms, residues, structure.entities, secondary[i].endResidueIndex, secondary[i + 1].startResidueIndex, elements);
                            }
                        }
                        elements[elements.length] = secondary[_max];
                        if (secondary[_max].endResidueIndex < residueCount) {
                            analyzeSecondaryStructure(atoms, residues, structure.entities, secondary[_max].endResidueIndex, residueCount, elements);
                        }
                        return splitNonconsecutiveSecondaryStructure(residues, elements);
                    }
                    function assignSecondaryStructureIndex(residues, ss) {
                        var ssIndex = residues.secondaryStructureIndex;
                        var index = 0;
                        for (var _i = 0, ss_1 = ss; _i < ss_1.length; _i++) {
                            var s = ss_1[_i];
                            for (var i = s.startResidueIndex; i < s.endResidueIndex; i++) {
                                ssIndex[i] = index;
                            }
                            index++;
                        }
                        return ssIndex;
                    }
                    function parseOperatorList(value) {
                        // '(X0)(1-5)' becomes [['X0']['1', '2', '3', '4', '5']]
                        // kudos to Glen van Ginkel.
                        var oeRegex = /\(?([^\(\)]+)\)?]*/g, g, groups = [], ret = [];
                        while (g = oeRegex.exec(value))
                            groups[groups.length] = g[1];
                        groups.forEach(function (g) {
                            var group = [];
                            g.split(',').forEach(function (e) {
                                var dashIndex = e.indexOf('-');
                                if (dashIndex > 0) {
                                    var from = parseInt(e.substring(0, dashIndex)), to = parseInt(e.substr(dashIndex + 1));
                                    for (var i = from; i <= to; i++)
                                        group[group.length] = i.toString();
                                }
                                else {
                                    group[group.length] = e.trim();
                                }
                            });
                            ret[ret.length] = group;
                        });
                        return ret;
                    }
                    function getAssemblyInfo(data) {
                        var _info = data.getCategory('_pdbx_struct_assembly'), _gen = data.getCategory('_pdbx_struct_assembly_gen'), _opers = data.getCategory('_pdbx_struct_oper_list');
                        if (!_info || !_gen || !_opers) {
                            return void 0;
                        }
                        var i, opers = {}, gens = [], genMap = Core.Utils.FastMap.create();
                        var assembly_id = _gen.getColumn('assembly_id');
                        var oper_expression = _gen.getColumn('oper_expression');
                        var asym_id_list = _gen.getColumn('asym_id_list');
                        for (i = 0; i < _gen.rowCount; i++) {
                            var id = assembly_id.getString(i);
                            if (!id) {
                                return void 0;
                            }
                            var entry = genMap.get(id);
                            if (!entry) {
                                entry = new Core.Structure.AssemblyGen(id);
                                genMap.set(id, entry);
                                gens.push(entry);
                            }
                            entry.gens.push(new Core.Structure.AssemblyGenEntry(parseOperatorList(oper_expression.getString(i)), asym_id_list.getString(i).split(',')));
                        }
                        var _pdbx_struct_oper_list_id = _opers.getColumn('id');
                        var _pdbx_struct_oper_list_name = _opers.getColumn('name');
                        for (i = 0; i < _opers.rowCount; i++) {
                            var oper = getTransform(_opers, 'matrix', 'vector', i);
                            if (!oper) {
                                return void 0;
                            }
                            var op = new Core.Structure.AssemblyOperator(_pdbx_struct_oper_list_id.getString(i), _pdbx_struct_oper_list_name.getString(i), oper);
                            opers[op.id] = op;
                        }
                        return new Core.Structure.AssemblyInfo(opers, gens);
                    }
                    function getSymmetryInfo(data) {
                        var _cell = data.getCategory('_cell'), _symmetry = data.getCategory('_symmetry'), _atom_sites = data.getCategory('_atom_sites');
                        var spacegroupName = '', cellSize = [1.0, 1.0, 1.0], cellAngles = [90.0, 90.0, 90.0], toFracTransform = Core.Geometry.LinearAlgebra.Matrix4.identity(), isNonStandardCrytalFrame = false;
                        if (!_cell || !_symmetry) {
                            return void 0;
                        }
                        spacegroupName = _symmetry.getColumn('space_group_name_H-M').getString(0);
                        cellSize = [_cell.getColumn('length_a').getFloat(0), _cell.getColumn('length_b').getFloat(0), _cell.getColumn('length_c').getFloat(0)];
                        cellAngles = [_cell.getColumn('angle_alpha').getFloat(0), _cell.getColumn('angle_beta').getFloat(0), _cell.getColumn('angle_gamma').getFloat(0)];
                        if (!spacegroupName || cellSize.every(function (s) { return isNaN(s) || s === 0.0; }) || cellSize.every(function (s) { return isNaN(s) || s === 0.0; })) {
                            return void 0;
                        }
                        var sq = function (x) { return x * x; };
                        var toRadians = function (degs) { return degs * Math.PI / 180.0; };
                        var la = cellSize[0], lb = cellSize[1], lc = cellSize[2], aa = toRadians(cellAngles[0]), ab = toRadians(cellAngles[1]), ac = toRadians(cellAngles[2]), v = la * lb * lc * Math.sqrt(1.0 - sq(Math.cos(aa)) - sq(Math.cos(ab)) - sq(Math.cos(ac)) + 2.0 * Math.cos(aa) * Math.cos(ab) * Math.cos(ac));
                        var fromFrac = Core.Geometry.LinearAlgebra.Matrix4.ofRows([
                            [la, lb * Math.cos(ac), lc * Math.cos(ab), 0.0],
                            [0.0, lb * Math.sin(ac), lc * (Math.cos(aa) - Math.cos(ab) * Math.cos(ac)) / Math.sin(ac), 0.0],
                            [0.0, 0.0, v / (la * lb * Math.sin(ac)), 0.0],
                            [0.0, 0.0, 0.0, 1.0]
                        ]);
                        var toFracComputed = Core.Geometry.LinearAlgebra.Matrix4.identity();
                        Core.Geometry.LinearAlgebra.Matrix4.invert(toFracComputed, fromFrac);
                        if (_atom_sites) {
                            var transform = getTransform(_atom_sites, 'fract_transf_matrix', 'fract_transf_vector', 0);
                            if (transform) {
                                toFracTransform = transform;
                                if (!Core.Geometry.LinearAlgebra.Matrix4.areEqual(toFracComputed, transform, 0.0001)) {
                                    isNonStandardCrytalFrame = true;
                                }
                            }
                        }
                        else {
                            toFracTransform = toFracComputed;
                        }
                        return new Core.Structure.SymmetryInfo(spacegroupName, cellSize, cellAngles, toFracTransform, isNonStandardCrytalFrame);
                    }
                    function getComponentBonds(category) {
                        if (!category || !category.rowCount)
                            return void 0;
                        var info = new Core.Structure.ComponentBondInfo();
                        var idCol = category.getColumn('comp_id'), nameACol = category.getColumn('atom_id_1'), nameBCol = category.getColumn('atom_id_2'), orderCol = category.getColumn('value_order'), count = category.rowCount;
                        var entry = info.newEntry(idCol.getString(0));
                        for (var i = 0; i < count; i++) {
                            var id = idCol.getString(i), nameA = nameACol.getString(i), nameB = nameBCol.getString(i), order = orderCol.getString(i);
                            if (entry.id !== id) {
                                entry = info.newEntry(id);
                            }
                            var t = void 0;
                            switch (order.toLowerCase()) {
                                case 'sing':
                                    t = 1 /* Single */;
                                    break;
                                case 'doub':
                                case 'delo':
                                    t = 2 /* Double */;
                                    break;
                                case 'trip':
                                    t = 3 /* Triple */;
                                    break;
                                case 'quad':
                                    t = 4 /* Aromatic */;
                                    break;
                                default:
                                    t = 0 /* Unknown */;
                                    break;
                            }
                            entry.add(nameA, nameB, t);
                        }
                        return info;
                    }
                    function getModel(startRow, data, atomSiteColumns) {
                        var _a = buildModelAtomTable(startRow, data.getCategory('_atom_site').rowCount, atomSiteColumns), atoms = _a.atoms, positions = _a.positions, modelId = _a.modelId, endRow = _a.endRow, structure = buildStructure(atomSiteColumns, atoms), entry = data.getCategory('_entry'), id;
                        if (entry && entry.getColumn('id').isDefined)
                            id = entry.getColumn('id').getString(0);
                        else
                            id = data.header;
                        assignEntityTypes(data.getCategory('_entity'), structure.entities);
                        var ss = getSecondaryStructureInfo(data, atoms, structure);
                        assignSecondaryStructureIndex(structure.residues, ss);
                        return {
                            model: Core.Structure.Molecule.Model.create({
                                id: id,
                                modelId: modelId,
                                data: {
                                    atoms: atoms,
                                    residues: structure.residues,
                                    chains: structure.chains,
                                    entities: structure.entities,
                                    bonds: {
                                        component: getComponentBonds(data.getCategory('_chem_comp_bond'))
                                    },
                                    secondaryStructure: ss,
                                    symmetryInfo: getSymmetryInfo(data),
                                    assemblyInfo: getAssemblyInfo(data),
                                },
                                positions: positions,
                                source: Core.Structure.Molecule.Model.Source.File
                            }),
                            endRow: endRow
                        };
                    }
                    function ofDataBlock(data) {
                        var models = [], atomSite = data.getCategory('_atom_site'), startRow = 0;
                        if (!atomSite) {
                            throw "'_atom_site' category is missing in the input.";
                        }
                        var entry = data.getCategory('_entry'), atomColumns = getAtomSiteColumns(atomSite), id;
                        if (entry && entry.getColumn('id').isDefined)
                            id = entry.getColumn('id').getString(0);
                        else
                            id = data.header;
                        while (startRow < atomSite.rowCount) {
                            var _a = getModel(startRow, data, atomColumns), model = _a.model, endRow = _a.endRow;
                            models.push(model);
                            startRow = endRow;
                        }
                        var experimentMethod = void 0;
                        var _exptl = data.getCategory('_exptl');
                        if (_exptl) {
                            experimentMethod = _exptl.getColumn('method').getString(0) || void 0;
                        }
                        return Core.Structure.Molecule.create(id, models, { experimentMethod: experimentMethod });
                    }
                    mmCIF.ofDataBlock = ofDataBlock;
                })(mmCIF = Molecule.mmCIF || (Molecule.mmCIF = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var PDB;
                (function (PDB) {
                    "use strict";
                    var MoleculeData = (function () {
                        function MoleculeData(header, crystInfo, models, data) {
                            this.header = header;
                            this.crystInfo = crystInfo;
                            this.models = models;
                            this.data = data;
                        }
                        MoleculeData.prototype.makeEntities = function () {
                            var data = [
                                "data_ent",
                                "loop_",
                                "_entity.id",
                                "_entity.type",
                                "_entity.src_method",
                                "_entity.pdbx_description",
                                "_entity.formula_weight",
                                "_entity.pdbx_number_of_molecules",
                                "_entity.details",
                                "_entity.pdbx_mutation",
                                "_entity.pdbx_fragment",
                                "_entity.pdbx_ec",
                                "1 polymer man polymer 0.0 0 ? ? ? ?",
                                "2 non-polymer syn non-polymer 0.0 0 ? ? ? ?",
                                "3 water nat water 0.0 0 ? ? ? ?"
                            ].join('\n');
                            var file = Formats.CIF.Text.parse(data);
                            if (file.isError) {
                                throw file.toString();
                            }
                            return file.result.dataBlocks[0].getCategory('_entity');
                        };
                        MoleculeData.prototype.toCifFile = function () {
                            var helpers = {
                                dot: PDB.Parser.getDotRange(this.data.length),
                                question: PDB.Parser.getQuestionmarkRange(this.data.length),
                                numberTokens: PDB.Parser.getNumberRanges(this.data.length),
                                data: this.data
                            };
                            var file = new Formats.CIF.Text.File(this.data);
                            var block = new Formats.CIF.Text.DataBlock(this.data, this.header.id);
                            file.dataBlocks.push(block);
                            block.addCategory(this.makeEntities());
                            if (this.crystInfo) {
                                var _a = this.crystInfo.toCifCategory(this.header.id), cell = _a.cell, symm = _a.symm;
                                block.addCategory(cell);
                                block.addCategory(symm);
                            }
                            block.addCategory(this.models.toCifCategory(block, helpers));
                            return file;
                        };
                        return MoleculeData;
                    }());
                    PDB.MoleculeData = MoleculeData;
                    var Header = (function () {
                        function Header(id) {
                            this.id = id;
                        }
                        return Header;
                    }());
                    PDB.Header = Header;
                    var CrystStructureInfo = (function () {
                        function CrystStructureInfo(record) {
                            this.record = record;
                        }
                        CrystStructureInfo.prototype.toCifCategory = function (id) {
                            //COLUMNS       DATA TYPE      CONTENTS
                            //--------------------------------------------------------------------------------
                            //    1 - 6       Record name    "CRYST1"
                            //7 - 15       Real(9.3)      a (Angstroms)
                            //16 - 24       Real(9.3)      b (Angstroms)
                            //25 - 33       Real(9.3)      c (Angstroms)
                            //34 - 40       Real(7.2)      alpha (degrees)
                            //41 - 47       Real(7.2)      beta (degrees)
                            //48 - 54       Real(7.2)      gamma (degrees)
                            //56 - 66       LString        Space group       
                            //67 - 70       Integer        Z value           
                            var data = [
                                "_cell.entry_id           '" + id + "'",
                                "_cell.length_a           " + this.record.substr(6, 9).trim(),
                                "_cell.length_b           " + this.record.substr(15, 9).trim(),
                                "_cell.length_c           " + this.record.substr(24, 9).trim(),
                                "_cell.angle_alpha        " + this.record.substr(33, 7).trim(),
                                "_cell.angle_beta         " + this.record.substr(40, 7).trim(),
                                "_cell.angle_gamma        " + this.record.substr(48, 7).trim(),
                                "_cell.Z_PDB              " + this.record.substr(66, 4).trim(),
                                "_cell.pdbx_unique_axis   ?",
                                "_symmetry.entry_id                         '" + id + "'",
                                "_symmetry.space_group_name_H-M             '" + this.record.substr(55, 11).trim() + "'",
                                "_symmetry.pdbx_full_space_group_name_H-M   ?",
                                "_symmetry.cell_setting                     ?",
                                "_symmetry.Int_Tables_number                ?",
                                "_symmetry.space_group_name_Hall            ?"
                            ].join('\n');
                            var cif = Formats.CIF.Text.parse(data);
                            if (cif.isError) {
                                throw new Error(cif.toString());
                            }
                            return {
                                cell: cif.result.dataBlocks[0].getCategory('_cell'),
                                symm: cif.result.dataBlocks[0].getCategory('_symmetry')
                            };
                        };
                        return CrystStructureInfo;
                    }());
                    PDB.CrystStructureInfo = CrystStructureInfo;
                    var SecondaryStructure = (function () {
                        function SecondaryStructure(helixTokens, sheetTokens) {
                            this.helixTokens = helixTokens;
                            this.sheetTokens = sheetTokens;
                        }
                        SecondaryStructure.prototype.toCifCategory = function (data) {
                            return void 0;
                        };
                        return SecondaryStructure;
                    }());
                    PDB.SecondaryStructure = SecondaryStructure;
                    var ModelData = (function () {
                        function ModelData(idToken, atomTokens, atomCount) {
                            this.idToken = idToken;
                            this.atomTokens = atomTokens;
                            this.atomCount = atomCount;
                        }
                        ModelData.prototype.writeToken = function (index, cifTokens) {
                            Core.Utils.ArrayBuilder.add2(cifTokens, this.atomTokens[2 * index], this.atomTokens[2 * index + 1]);
                        };
                        ModelData.prototype.writeTokenCond = function (index, cifTokens, dot) {
                            var s = this.atomTokens[2 * index];
                            var e = this.atomTokens[2 * index + 1];
                            if (s === e)
                                Core.Utils.ArrayBuilder.add2(cifTokens, dot.start, dot.end);
                            else
                                Core.Utils.ArrayBuilder.add2(cifTokens, s, e);
                        };
                        ModelData.prototype.writeRange = function (range, cifTokens) {
                            Core.Utils.ArrayBuilder.add2(cifTokens, range.start, range.end);
                        };
                        ModelData.prototype.tokenEquals = function (start, end, value, data) {
                            var len = value.length;
                            if (len !== end - start)
                                return false;
                            for (var i = value.length - 1; i >= 0; i--) {
                                if (data.charCodeAt(i + start) !== value.charCodeAt(i)) {
                                    return false;
                                }
                            }
                            return true;
                        };
                        ModelData.prototype.getEntityType = function (row, data) {
                            var o = row * 14;
                            if (this.tokenEquals(this.atomTokens[2 * o], this.atomTokens[2 * o + 1], "HETATM", data)) {
                                var s = this.atomTokens[2 * (o + 4)], e = this.atomTokens[2 * (o + 4) + 1];
                                if (this.tokenEquals(s, e, "HOH", data) || this.tokenEquals(s, e, "WTR", data) || this.tokenEquals(s, e, "SOL", data)) {
                                    return 3; // water
                                }
                                return 2; // non-polymer
                            }
                            else {
                                return 1; // polymer
                            }
                        };
                        ModelData.prototype.writeCifTokens = function (modelToken, cifTokens, helpers) {
                            var columnIndices = {
                                //COLUMNS        DATA TYPE       CONTENTS                            
                                //--------------------------------------------------------------------------------
                                // 1 -  6        Record name     "ATOM  "                                          
                                RECORD: 0,
                                // 7 - 11        Integer         Atom serial number.                   
                                SERIAL: 1,
                                //13 - 16        Atom            Atom name.          
                                ATOM_NAME: 2,
                                //17             Character       Alternate location indicator. 
                                ALT_LOC: 3,
                                //18 - 20        Residue name    Residue name.       
                                RES_NAME: 4,
                                //22             Character       Chain identifier.         
                                CHAIN_ID: 5,
                                //23 - 26        Integer         Residue sequence number.              
                                RES_SEQN: 6,
                                //27             AChar           Code for insertion of residues.       
                                INS_CODE: 7,
                                //31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.   
                                X: 8,
                                //39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.                            
                                Y: 9,
                                //47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.        
                                Z: 10,
                                //55 - 60        Real(6.2)       Occupancy.       
                                OCCUPANCY: 11,
                                //61 - 66        Real(6.2)       Temperature factor (Default = 0.0).                   
                                TEMP_FACTOR: 12,
                                //73 - 76        LString(4)      Segment identifier, left-justified.   
                                // ignored
                                //77 - 78        LString(2)      Element symbol, right-justified.   
                                ELEMENT: 13
                            };
                            var columnCount = 14;
                            for (var i = 0; i < this.atomCount; i++) {
                                var o = i * columnCount;
                                //_atom_site.group_PDB
                                this.writeToken(o + columnIndices.RECORD, cifTokens);
                                //_atom_site.id
                                this.writeToken(o + columnIndices.SERIAL, cifTokens);
                                //_atom_site.type_symbol
                                this.writeToken(o + columnIndices.ELEMENT, cifTokens);
                                //_atom_site.label_atom_id
                                this.writeToken(o + columnIndices.ATOM_NAME, cifTokens);
                                //_atom_site.label_alt_id
                                this.writeTokenCond(o + columnIndices.ALT_LOC, cifTokens, helpers.dot);
                                //_atom_site.label_comp_id
                                this.writeToken(o + columnIndices.RES_NAME, cifTokens);
                                //_atom_site.label_asym_id
                                this.writeToken(o + columnIndices.CHAIN_ID, cifTokens);
                                //_atom_site.label_entity_id
                                this.writeRange(helpers.numberTokens.get(this.getEntityType(i, helpers.data)), cifTokens);
                                //_atom_site.label_seq_id
                                this.writeToken(o + columnIndices.RES_SEQN, cifTokens);
                                //_atom_site.pdbx_PDB_ins_code
                                this.writeTokenCond(o + columnIndices.INS_CODE, cifTokens, helpers.dot);
                                //_atom_site.Cartn_x
                                this.writeToken(o + columnIndices.X, cifTokens);
                                //_atom_site.Cartn_y
                                this.writeToken(o + columnIndices.Y, cifTokens);
                                //_atom_site.Cartn_z
                                this.writeToken(o + columnIndices.Z, cifTokens);
                                //_atom_site.occupancy
                                this.writeToken(o + columnIndices.OCCUPANCY, cifTokens);
                                //_atom_site.B_iso_or_equiv
                                this.writeToken(o + columnIndices.TEMP_FACTOR, cifTokens);
                                //_atom_site.Cartn_x_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.Cartn_y_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.Cartn_z_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.occupancy_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.B_iso_or_equiv_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.pdbx_formal_charge
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.auth_seq_id
                                this.writeToken(o + columnIndices.RES_SEQN, cifTokens);
                                //_atom_site.auth_comp_id
                                this.writeToken(o + columnIndices.RES_NAME, cifTokens);
                                //_atom_site.auth_asym_id
                                this.writeToken(o + columnIndices.CHAIN_ID, cifTokens);
                                //_atom_site.auth_atom_id
                                this.writeToken(o + columnIndices.ATOM_NAME, cifTokens);
                                //_atom_site.pdbx_PDB_model_num 
                                this.writeRange(modelToken, cifTokens);
                            }
                        };
                        return ModelData;
                    }());
                    ModelData.COLUMNS = [
                        "_atom_site.group_PDB",
                        "_atom_site.id",
                        "_atom_site.type_symbol",
                        "_atom_site.label_atom_id",
                        "_atom_site.label_alt_id",
                        "_atom_site.label_comp_id",
                        "_atom_site.label_asym_id",
                        "_atom_site.label_entity_id",
                        "_atom_site.label_seq_id",
                        "_atom_site.pdbx_PDB_ins_code",
                        "_atom_site.Cartn_x",
                        "_atom_site.Cartn_y",
                        "_atom_site.Cartn_z",
                        "_atom_site.occupancy",
                        "_atom_site.B_iso_or_equiv",
                        "_atom_site.Cartn_x_esd",
                        "_atom_site.Cartn_y_esd",
                        "_atom_site.Cartn_z_esd",
                        "_atom_site.occupancy_esd",
                        "_atom_site.B_iso_or_equiv_esd",
                        "_atom_site.pdbx_formal_charge",
                        "_atom_site.auth_seq_id",
                        "_atom_site.auth_comp_id",
                        "_atom_site.auth_asym_id",
                        "_atom_site.auth_atom_id",
                        "_atom_site.pdbx_PDB_model_num"
                    ];
                    PDB.ModelData = ModelData;
                    var ModelsData = (function () {
                        function ModelsData(models) {
                            this.models = models;
                        }
                        ModelsData.prototype.toCifCategory = function (block, helpers) {
                            var atomCount = 0;
                            for (var _i = 0, _a = this.models; _i < _a.length; _i++) {
                                var m = _a[_i];
                                atomCount += m.atomCount;
                            }
                            var colCount = 26;
                            var tokens = Core.Utils.ArrayBuilder.forTokenIndices(atomCount * colCount);
                            for (var _b = 0, _c = this.models; _b < _c.length; _b++) {
                                var m = _c[_b];
                                m.writeCifTokens(m.idToken, tokens, helpers);
                            }
                            return new Formats.CIF.Text.Category(block.data, "_atom_site", 0, 0, ModelData.COLUMNS, tokens.array, atomCount * colCount);
                        };
                        return ModelsData;
                    }());
                    PDB.ModelsData = ModelsData;
                })(PDB = Molecule.PDB || (Molecule.PDB = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var PDB;
                (function (PDB) {
                    "use strict";
                    var Tokenizer = (function () {
                        function Tokenizer(data) {
                            this.data = data;
                            this.trimmedToken = { start: 0, end: 0 };
                            this.line = 0;
                            this.position = 0;
                            this.length = data.length;
                        }
                        Tokenizer.prototype.moveToNextLine = function () {
                            while (this.position < this.length && this.data.charCodeAt(this.position) !== 10) {
                                this.position++;
                            }
                            this.position++;
                            this.line++;
                            return this.position;
                        };
                        Tokenizer.prototype.moveToEndOfLine = function () {
                            while (this.position < this.length) {
                                var c = this.data.charCodeAt(this.position);
                                if (c === 10 || c === 13) {
                                    return this.position;
                                }
                                this.position++;
                            }
                            return this.position;
                        };
                        Tokenizer.prototype.startsWith = function (start, value) {
                            for (var i = value.length - 1; i >= 0; i--) {
                                if (this.data.charCodeAt(i + start) !== value.charCodeAt(i)) {
                                    return false;
                                }
                            }
                            return true;
                        };
                        Tokenizer.prototype.trim = function (start, end) {
                            while (start < end && this.data.charCodeAt(start) === 32)
                                start++;
                            while (end > start && this.data.charCodeAt(end - 1) === 32)
                                end--;
                            this.trimmedToken.start = start;
                            this.trimmedToken.end = end;
                        };
                        Tokenizer.prototype.tokenizeAtomRecord = function (tokens) {
                            var startPos = this.position;
                            var start = this.position;
                            var end = this.moveToEndOfLine();
                            var length = end - start;
                            // invalid atom record
                            if (length < 66)
                                return false;
                            //COLUMNS        DATA TYPE       CONTENTS                            
                            //--------------------------------------------------------------------------------
                            // 1 -  6        Record name     "ATOM  "                                            
                            this.trim(start, start + 6);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            // 7 - 11        Integer         Atom serial number.                   
                            start = startPos + 6;
                            this.trim(start, start + 5);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //13 - 16        Atom            Atom name.          
                            start = startPos + 12;
                            this.trim(start, start + 4);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //17             Character       Alternate location indicator. 
                            if (this.data.charCodeAt(startPos + 16) === 32) {
                                Formats.TokenIndexBuilder.addToken(tokens, 0, 0);
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, startPos + 16, startPos + 17);
                            }
                            //18 - 20        Residue name    Residue name.       
                            start = startPos + 17;
                            this.trim(start, start + 3);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //22             Character       Chain identifier.         
                            Formats.TokenIndexBuilder.addToken(tokens, startPos + 21, startPos + 22);
                            //23 - 26        Integer         Residue sequence number.              
                            start = startPos + 22;
                            this.trim(start, start + 4);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //27             AChar           Code for insertion of residues.      
                            if (this.data.charCodeAt(startPos + 26) === 32) {
                                Formats.TokenIndexBuilder.addToken(tokens, 0, 0);
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, startPos + 26, startPos + 27);
                            }
                            //31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.   
                            start = startPos + 30;
                            this.trim(start, start + 8);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.                            
                            start = startPos + 38;
                            this.trim(start, start + 8);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.        
                            start = startPos + 46;
                            this.trim(start, start + 8);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //55 - 60        Real(6.2)       Occupancy.       
                            start = startPos + 54;
                            this.trim(start, start + 6);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //61 - 66        Real(6.2)       Temperature factor (Default = 0.0).                   
                            start = startPos + 60;
                            this.trim(start, start + 6);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //73 - 76        LString(4)      Segment identifier, left-justified.   
                            // ignored
                            //77 - 78        LString(2)      Element symbol, right-justified.   
                            if (length >= 78) {
                                start = startPos + 76;
                                this.trim(start, start + 2);
                                if (this.trimmedToken.start < this.trimmedToken.end) {
                                    Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                                }
                                else {
                                    Formats.TokenIndexBuilder.addToken(tokens, startPos + 12, startPos + 13);
                                }
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, startPos + 12, startPos + 13);
                            }
                            //79 - 80        LString(2)      Charge on the atom.      
                            // ignored
                            return true;
                        };
                        return Tokenizer;
                    }());
                    var Parser = (function () {
                        function Parser() {
                        }
                        Parser.tokenizeAtom = function (tokens, tokenizer) {
                            if (tokenizer.tokenizeAtomRecord(tokens)) {
                                return void 0;
                            }
                            return new Formats.ParserError("Invalid ATOM/HETATM record.", tokenizer.line);
                        };
                        Parser.tokenize = function (id, data) {
                            var tokenizer = new Tokenizer(data);
                            var length = data.length;
                            var modelAtomTokens = Formats.TokenIndexBuilder.create(4096); //2 * 14 * this.data.length / 78);
                            var atomCount = 0;
                            var models = [];
                            var cryst = void 0;
                            var modelIdToken = { start: 0, end: 0 };
                            while (tokenizer.position < length) {
                                var cont = true;
                                switch (data.charCodeAt(tokenizer.position)) {
                                    case 65:
                                        if (tokenizer.startsWith(tokenizer.position, "ATOM")) {
                                            if (!modelAtomTokens) {
                                                modelAtomTokens = Formats.TokenIndexBuilder.create(4096);
                                            }
                                            var err = Parser.tokenizeAtom(modelAtomTokens, tokenizer);
                                            atomCount++;
                                            if (err)
                                                return err;
                                        }
                                        break;
                                    case 67:
                                        if (tokenizer.startsWith(tokenizer.position, "CRYST1")) {
                                            var start = tokenizer.position;
                                            var end = tokenizer.moveToEndOfLine();
                                            cryst = new PDB.CrystStructureInfo(data.substring(start, end));
                                        }
                                        break;
                                    case 69:
                                        if (tokenizer.startsWith(tokenizer.position, "ENDMDL") && atomCount > 0) {
                                            if (models.length === 0) {
                                                modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                            }
                                            if (modelAtomTokens) {
                                                models.push(new PDB.ModelData(modelIdToken, modelAtomTokens.tokens, atomCount));
                                            }
                                            atomCount = 0;
                                            modelAtomTokens = null;
                                        }
                                        else if (tokenizer.startsWith(tokenizer.position, "END")) {
                                            var start = tokenizer.position;
                                            var end = tokenizer.moveToEndOfLine();
                                            tokenizer.trim(start, end);
                                            if (tokenizer.trimmedToken.end - tokenizer.trimmedToken.start === 3) {
                                                cont = false;
                                            }
                                        }
                                        break;
                                    case 72:
                                        if (tokenizer.startsWith(tokenizer.position, "HETATM")) {
                                            if (!modelAtomTokens) {
                                                modelAtomTokens = Formats.TokenIndexBuilder.create(4096);
                                            }
                                            var err = Parser.tokenizeAtom(modelAtomTokens, tokenizer);
                                            atomCount++;
                                            if (err)
                                                return err;
                                        }
                                        break;
                                    case 77:
                                        if (tokenizer.startsWith(tokenizer.position, "MODEL")) {
                                            if (atomCount > 0) {
                                                if (models.length === 0) {
                                                    modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                                }
                                                if (modelAtomTokens) {
                                                    models.push(new PDB.ModelData(modelIdToken, modelAtomTokens.tokens, atomCount));
                                                }
                                            }
                                            var start = tokenizer.position + 6;
                                            var end = tokenizer.moveToEndOfLine();
                                            tokenizer.trim(start, end);
                                            modelIdToken = { start: tokenizer.trimmedToken.start, end: tokenizer.trimmedToken.end };
                                            if (atomCount > 0 || !modelAtomTokens) {
                                                modelAtomTokens = Formats.TokenIndexBuilder.create(4096);
                                            }
                                            atomCount = 0;
                                        }
                                        break;
                                }
                                tokenizer.moveToNextLine();
                                if (!cont)
                                    break;
                            }
                            var fakeCifData = data + ".?0123";
                            if (atomCount > 0) {
                                if (models.length === 0) {
                                    modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                }
                                if (modelAtomTokens) {
                                    models.push(new PDB.ModelData(modelIdToken, modelAtomTokens.tokens, atomCount));
                                }
                            }
                            return new PDB.MoleculeData(new PDB.Header(id), cryst, new PDB.ModelsData(models), fakeCifData);
                        };
                        Parser.getDotRange = function (length) {
                            return { start: length - 6, end: length - 5 };
                        };
                        Parser.getNumberRanges = function (length) {
                            var ret = Core.Utils.FastMap.create();
                            for (var i = 0; i < 4; i++) {
                                ret.set(i, { start: length - 4 + i, end: length - 3 + i });
                            }
                            return ret;
                        };
                        Parser.getQuestionmarkRange = function (length) {
                            return { start: length - 5, end: length - 4 };
                        };
                        Parser.parse = function (id, data) {
                            var ret = Parser.tokenize(id, data);
                            if (ret instanceof Formats.ParserError) {
                                return Formats.ParserResult.error(ret.message, ret.line);
                            }
                            else {
                                return Formats.ParserResult.success(ret.toCifFile());
                            }
                        };
                        return Parser;
                    }());
                    PDB.Parser = Parser;
                    function toCifFile(id, data) {
                        return Parser.parse(id, data);
                    }
                    PDB.toCifFile = toCifFile;
                })(PDB = Molecule.PDB || (Molecule.PDB = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var SDF;
                (function (SDF) {
                    function initState(data, customId) {
                        var lines = data.split(/\r?\n/g);
                        var id = lines[0].trim();
                        if (!id.length)
                            id = 'SDF';
                        //let molHeaderInfo = lines[1];
                        //let molHeaderComment = lines[2];
                        var cTabInfo = lines[3];
                        var atomCount = +cTabInfo.substr(0, 3);
                        var bondCount = +cTabInfo.substr(3, 3);
                        return {
                            id: customId ? customId : id,
                            atomCount: atomCount,
                            bondCount: bondCount,
                            atoms: Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Atoms, atomCount),
                            positions: Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Positions, atomCount),
                            bonds: Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Bonds, bondCount),
                            lines: lines,
                            currentLine: 4,
                            error: void 0,
                            stringPool: Formats.ShortStringPool.create()
                        };
                    }
                    function readAtom(i, state) {
                        var line = state.lines[state.currentLine];
                        var atoms = state.atoms, positions = state.positions;
                        var es = Formats.ShortStringPool.get(state.stringPool, line.substr(31, 3).trim());
                        atoms.id[i] = i;
                        atoms.elementSymbol[i] = es;
                        atoms.name[i] = es;
                        atoms.authName[i] = es;
                        atoms.occupancy[i] = 1.0;
                        atoms.rowIndex[i] = state.currentLine;
                        positions.x[i] = Core.Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 0, 10);
                        positions.y[i] = Core.Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 10, 20);
                        positions.z[i] = Core.Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 20, 30);
                    }
                    function readAtoms(state) {
                        for (var i = 0; i < state.atomCount; i++) {
                            readAtom(i, state);
                            state.currentLine++;
                        }
                    }
                    function readBond(i, state) {
                        var line = state.lines[state.currentLine];
                        var bonds = state.bonds;
                        bonds.atomAIndex[i] = Core.Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 0, 3) - 1;
                        bonds.atomBIndex[i] = Core.Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 3, 6) - 1;
                        switch (Core.Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 6, 9)) {
                            case 1:
                                bonds.type[i] = 1 /* Single */;
                                break;
                            case 2:
                                bonds.type[i] = 2 /* Double */;
                                break;
                            case 3:
                                bonds.type[i] = 3 /* Triple */;
                                break;
                            case 4:
                                bonds.type[i] = 4 /* Aromatic */;
                                break;
                            default:
                                bonds.type[i] = 0 /* Unknown */;
                                break;
                        }
                    }
                    function readBonds(state) {
                        for (var i = 0; i < state.bondCount; i++) {
                            readBond(i, state);
                            state.currentLine++;
                        }
                    }
                    function buildModel(state) {
                        var residues = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Residues, 1), chains = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Chains, 1), entities = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Entities, 1);
                        residues.isHet[0] = 1;
                        residues.insCode[0] = null;
                        residues.name[0]
                            = residues.authName[0]
                                = 'UNK';
                        residues.atomEndIndex[0]
                            = chains.atomEndIndex[0]
                                = entities.atomEndIndex[0]
                                    = state.atomCount;
                        residues.asymId[0]
                            = residues.authAsymId[0]
                                = chains.asymId[0]
                                    = chains.authAsymId[0]
                                        = 'X';
                        residues.entityId[0]
                            = chains.entityId[0]
                                = entities.entityId[0]
                                    = '1';
                        chains.residueEndIndex[0]
                            = entities.residueEndIndex[0]
                                = 0;
                        entities.chainEndIndex[0] = 1;
                        entities.type[0] = 'non-polymer';
                        var ssR = new Core.Structure.PolyResidueIdentifier('X', 0, null);
                        var ss = [new Core.Structure.SecondaryStructureElement(0 /* None */, ssR, ssR)];
                        ss[0].startResidueIndex = 0;
                        ss[0].endResidueIndex = 1;
                        return Core.Structure.Molecule.Model.create({
                            id: state.id,
                            modelId: '1',
                            data: {
                                atoms: state.atoms,
                                residues: residues,
                                chains: chains,
                                entities: entities,
                                bonds: {
                                    covalent: state.bonds,
                                },
                                secondaryStructure: ss,
                                symmetryInfo: void 0,
                                assemblyInfo: void 0,
                            },
                            positions: state.positions,
                            source: Core.Structure.Molecule.Model.Source.File
                        });
                    }
                    function parse(data, id) {
                        try {
                            var state = initState(data, id);
                            readAtoms(state);
                            readBonds(state);
                            var model = buildModel(state);
                            if (state.error) {
                                return Formats.ParserResult.error(state.error, state.currentLine + 1);
                            }
                            var molecule = Core.Structure.Molecule.create(id ? id : state.id, [model]);
                            return Formats.ParserResult.success(molecule);
                        }
                        catch (e) {
                            return Formats.ParserResult.error("" + e);
                        }
                    }
                    SDF.parse = parse;
                })(SDF = Molecule.SDF || (Molecule.SDF = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                function parseCIF(type, parse) {
                    var _this = this;
                    return function (data, params) { return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var file, result, mol;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                case 1:
                                    _a.sent();
                                    file = parse(data, params);
                                    if (file.isError) {
                                        throw file.toString();
                                    }
                                    result = file.result;
                                    if (!result.dataBlocks.length) {
                                        throw "The " + type + " data does not contain a data block.";
                                    }
                                    return [4 /*yield*/, ctx.updateProgress('Creating representation...')];
                                case 2:
                                    _a.sent();
                                    mol = Molecule.mmCIF.ofDataBlock(result.dataBlocks[0]);
                                    return [2 /*return*/, Formats.ParserResult.success(mol, result.dataBlocks.length > 1 ? ["The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block."] : void 0)];
                            }
                        });
                    }); }); };
                }
                var SupportedFormats;
                (function (SupportedFormats) {
                    var _this = this;
                    SupportedFormats.mmCIF = {
                        name: 'mmCIF',
                        shortcuts: ['mmcif', 'cif'],
                        extensions: ['.cif'],
                        parse: parseCIF('CIF', Formats.CIF.Text.parse)
                    };
                    SupportedFormats.mmBCIF = {
                        name: 'mmCIF (Binary)',
                        shortcuts: ['mmbcif', 'bcif', 'binarycif'],
                        extensions: ['.bcif'],
                        isBinary: true,
                        parse: parseCIF('BinaryCIF', Formats.CIF.Binary.parse)
                    };
                    SupportedFormats.PDB = {
                        name: 'PDB',
                        shortcuts: ['pdb', 'ent'],
                        extensions: ['.pdb', '.ent'],
                        parse: parseCIF('PDB', function (d, p) { return Molecule.PDB.toCifFile((p && p.id) || 'PDB', d); })
                    };
                    SupportedFormats.SDF = {
                        name: 'SDF',
                        shortcuts: ['sdf', 'mol'],
                        extensions: ['.sdf', '.mol'],
                        parse: function (data, options) {
                            return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                                var mol;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                        case 1:
                                            _a.sent();
                                            mol = Molecule.SDF.parse(data, (options && options.id) || undefined);
                                            if (mol.isError)
                                                throw mol.toString();
                                            return [2 /*return*/, Formats.ParserResult.success(mol.result)];
                                    }
                                });
                            }); });
                        }
                    };
                    SupportedFormats.All = [SupportedFormats.mmCIF, SupportedFormats.mmBCIF, SupportedFormats.PDB, SupportedFormats.SDF];
                })(SupportedFormats = Molecule.SupportedFormats || (Molecule.SupportedFormats = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                "use strict";
                function fill(data, value) {
                    var len = data.length;
                    for (var i = 0; i < len; i++) {
                        data[i] = value;
                    }
                }
                var Field3DZYX = (function () {
                    function Field3DZYX(data, dimensions) {
                        this.data = data;
                        this.dimensions = dimensions;
                        this.len = this.dimensions[0] * this.dimensions[1] * this.dimensions[2];
                        this.nX = this.dimensions[0];
                        this.nY = this.dimensions[1];
                    }
                    Object.defineProperty(Field3DZYX.prototype, "length", {
                        get: function () {
                            return this.len;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Field3DZYX.prototype.getAt = function (idx) {
                        return this.data[idx];
                    };
                    Field3DZYX.prototype.setAt = function (idx, v) {
                        this.data[idx] = v;
                    };
                    Field3DZYX.prototype.get = function (i, j, k) {
                        return this.data[(this.nX * (k * this.nY + j) + i) | 0];
                    };
                    Field3DZYX.prototype.set = function (i, j, k, v) {
                        this.data[(this.nX * (k * this.nY + j) + i) | 0] = v;
                    };
                    Field3DZYX.prototype.fill = function (v) {
                        fill(this.data, v);
                    };
                    return Field3DZYX;
                }());
                Density.Field3DZYX = Field3DZYX;
                var Data;
                (function (Data) {
                    function create(cellSize, cellAngles, origin, hasSkewMatrix, skewMatrix, data, dataDimensions, basis, valuesInfo, attributes) {
                        return {
                            cellSize: cellSize,
                            cellAngles: cellAngles,
                            origin: origin,
                            hasSkewMatrix: hasSkewMatrix,
                            skewMatrix: skewMatrix,
                            data: data,
                            basis: basis,
                            dataDimensions: dataDimensions,
                            valuesInfo: valuesInfo,
                            attributes: attributes ? attributes : {},
                            isNormalized: false
                        };
                    }
                    Data.create = create;
                    function normalize(densityData) {
                        if (densityData.isNormalized)
                            return;
                        var data = densityData.data, _a = densityData.valuesInfo, mean = _a.mean, sigma = _a.sigma;
                        var min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
                        for (var i = 0, _l = data.length; i < _l; i++) {
                            var v = (data.getAt(i) - mean) / sigma;
                            data.setAt(i, v);
                            if (v < min)
                                min = v;
                            if (v > max)
                                max = v;
                        }
                        densityData.valuesInfo.min = min;
                        densityData.valuesInfo.max = max;
                        densityData.isNormalized = true;
                    }
                    Data.normalize = normalize;
                    function denormalize(densityData) {
                        if (!densityData.isNormalized)
                            return;
                        var data = densityData.data, _a = densityData.valuesInfo, mean = _a.mean, sigma = _a.sigma;
                        var min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
                        for (var i = 0, _l = data.length; i < _l; i++) {
                            var v = sigma * data.getAt(i) + mean;
                            data.setAt(i, v);
                            if (v < min)
                                min = v;
                            if (v > max)
                                max = v;
                        }
                        densityData.valuesInfo.min = min;
                        densityData.valuesInfo.max = max;
                        densityData.isNormalized = false;
                    }
                    Data.denormalize = denormalize;
                })(Data = Density.Data || (Density.Data = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                var CCP4;
                (function (CCP4) {
                    function parse(buffer) {
                        return Parser.parse(buffer);
                    }
                    CCP4.parse = parse;
                    /**
                     * Parses CCP4 files.
                     */
                    var Parser;
                    (function (Parser) {
                        function getArray(r, offset, count) {
                            var ret = [];
                            for (var i = 0; i < count; i++) {
                                ret[i] = r(offset + i);
                            }
                            return ret;
                        }
                        /**
                         * Parse CCP4 file according to spec at http://www.ccp4.ac.uk/html/maplib.html
                         * Inspired by PyMOL implementation of the parser.
                         */
                        function parse(buffer) {
                            var headerSize = 1024, endian = false, headerView = new DataView(buffer, 0, headerSize), warnings = [];
                            var mode = headerView.getInt32(3 * 4, false);
                            if (mode !== 2) {
                                endian = true;
                                mode = headerView.getInt32(3 * 4, true);
                                if (mode !== 2) {
                                    return Formats.ParserResult.error("Only CCP4 modes 0 and 2 are supported.");
                                }
                            }
                            var readInt = function (o) { return headerView.getInt32(o * 4, endian); }, readFloat = function (o) { return headerView.getFloat32(o * 4, endian); };
                            var header = {
                                extent: getArray(readInt, 0, 3),
                                mode: mode,
                                nxyzStart: getArray(readInt, 4, 3),
                                grid: getArray(readInt, 7, 3),
                                cellDimensions: getArray(readFloat, 10, 3),
                                cellAngles: getArray(readFloat, 13, 3),
                                crs2xyz: getArray(readInt, 16, 3),
                                min: readFloat(19),
                                max: readFloat(20),
                                mean: readFloat(21),
                                spacegroupNumber: readInt(22),
                                symBytes: readInt(23),
                                skewFlag: readInt(24),
                                skewMatrix: getArray(readFloat, 25, 9),
                                skewTranslation: getArray(readFloat, 34, 3),
                                origin2k: getArray(readFloat, 49, 3)
                            };
                            var dataOffset = buffer.byteLength - 4 * header.extent[0] * header.extent[1] * header.extent[2];
                            if (dataOffset !== headerSize + header.symBytes) {
                                if (dataOffset === headerSize) {
                                    warnings.push("File contains bogus symmetry record.");
                                }
                                else if (dataOffset < headerSize) {
                                    return Formats.ParserResult.error("File appears truncated and doesn't match header.");
                                }
                                else if ((dataOffset > headerSize) && (dataOffset < (1024 * 1024))) {
                                    // Fix for loading SPIDER files which are larger than usual
                                    // In this specific case, we must absolutely trust the symBytes record
                                    dataOffset = headerSize + header.symBytes;
                                    warnings.push("File is larger than expected and doesn't match header. Continuing file load, good luck!");
                                }
                                else {
                                    return Formats.ParserResult.error("File is MUCH larger than expected and doesn't match header.");
                                }
                            }
                            //let mapp = readInt(52);
                            //let mapStr = String.fromCharCode((mapp & 0xFF)) + String.fromCharCode(((mapp >> 8) & 0xFF)) + String.fromCharCode(((mapp >> 16) & 0xFF)) + String.fromCharCode(((mapp >> 24) & 0xFF));
                            // pretend we've checked the MAP string at offset 52
                            // pretend we've read the symmetry data
                            if (header.grid[0] === 0 && header.extent[0] > 0) {
                                header.grid[0] = header.extent[0] - 1;
                                warnings.push("Fixed X interval count.");
                            }
                            if (header.grid[1] === 0 && header.extent[1] > 0) {
                                header.grid[1] = header.extent[1] - 1;
                                warnings.push("Fixed Y interval count.");
                            }
                            if (header.grid[2] === 0 && header.extent[2] > 0) {
                                header.grid[2] = header.extent[2] - 1;
                                warnings.push("Fixed Z interval count.");
                            }
                            if (header.crs2xyz[0] === 0 && header.crs2xyz[1] === 0 && header.crs2xyz[2] === 0) {
                                warnings.push("All crs2xyz records are zero. Setting crs2xyz to 1, 2, 3.");
                                header.crs2xyz = [1, 2, 3];
                            }
                            if (header.cellDimensions[0] === 0.0 &&
                                header.cellDimensions[1] === 0.0 &&
                                header.cellDimensions[2] === 0.0) {
                                warnings.push("Cell dimensions are all zero. Setting to 1.0, 1.0, 1.0. Map file will not align with other structures.");
                                header.cellDimensions[0] = 1.0;
                                header.cellDimensions[1] = 1.0;
                                header.cellDimensions[2] = 1.0;
                            }
                            var alpha = (Math.PI / 180.0) * header.cellAngles[0], beta = (Math.PI / 180.0) * header.cellAngles[1], gamma = (Math.PI / 180.0) * header.cellAngles[2];
                            var xScale = header.cellDimensions[0] / header.grid[0], yScale = header.cellDimensions[1] / header.grid[1], zScale = header.cellDimensions[2] / header.grid[2];
                            var z1 = Math.cos(beta), z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma), z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);
                            var xAxis = [xScale, 0.0, 0.0], yAxis = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0], zAxis = [z1 * zScale, z2 * zScale, z3 * zScale];
                            var indices = [0, 0, 0];
                            indices[header.crs2xyz[0] - 1] = 0;
                            indices[header.crs2xyz[1] - 1] = 1;
                            indices[header.crs2xyz[2] - 1] = 2;
                            var origin;
                            if (header.origin2k[0] === 0.0 && header.origin2k[1] === 0.0 && header.origin2k[2] === 0.0) {
                                origin = [
                                    xAxis[0] * header.nxyzStart[indices[0]] + yAxis[0] * header.nxyzStart[indices[1]] + zAxis[0] * header.nxyzStart[indices[2]],
                                    yAxis[1] * header.nxyzStart[indices[1]] + zAxis[1] * header.nxyzStart[indices[2]],
                                    zAxis[2] * header.nxyzStart[indices[2]]
                                ];
                            }
                            else {
                                // Use ORIGIN records rather than old n[xyz]start records
                                //   http://www2.mrc-lmb.cam.ac.uk/image2000.html
                                // XXX the ORIGIN field is only used by the EM community, and
                                //     has undefined meaning for non-orthogonal maps and/or
                                //     non-cubic voxels, etc.
                                origin = [header.origin2k[indices[0]], header.origin2k[indices[1]], header.origin2k[indices[2]]];
                            }
                            var extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];
                            var skewMatrix = new Float32Array(16), i, j;
                            for (i = 0; i < 3; i++) {
                                for (j = 0; j < 3; j++) {
                                    skewMatrix[4 * j + i] = header.skewMatrix[3 * i + j];
                                }
                                skewMatrix[12 + i] = header.skewTranslation[i];
                            }
                            var nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;
                            var rawData = endian === nativeEndian
                                ? readRawData1(new Float32Array(buffer, headerSize + header.symBytes, extent[0] * extent[1] * extent[2]), endian, extent, header.extent, indices, header.mean)
                                : readRawData(new DataView(buffer, headerSize + header.symBytes), endian, extent, header.extent, indices, header.mean);
                            var field = new Density.Field3DZYX(rawData.data, extent);
                            var data = Density.Data.create(header.cellDimensions, header.cellAngles, origin, header.skewFlag !== 0, skewMatrix, field, extent, { x: xAxis, y: yAxis, z: zAxis }, 
                            //[header.nxyzStart[indices[0]], header.nxyzStart[indices[1]], header.nxyzStart[indices[2]]],
                            { min: header.min, max: header.max, mean: header.mean, sigma: rawData.sigma }, { spacegroupIndex: header.spacegroupNumber - 1 });
                            return Formats.ParserResult.success(data, warnings);
                        }
                        Parser.parse = parse;
                        function readRawData1(view, endian, extent, headerExtent, indices, mean) {
                            var data = new Float32Array(extent[0] * extent[1] * extent[2]), coord = [0, 0, 0], mX, mY, mZ, cX, cY, cZ, xSize, xySize, offset = 0, v = 0.1, sigma = 0.0, t = 0.1, iX = indices[0], iY = indices[1], iZ = indices[2];
                            //mX = extent[indices[0]];
                            //mY = extent[indices[1]];  
                            //mZ = extent[indices[2]];
                            mX = headerExtent[0];
                            mY = headerExtent[1];
                            mZ = headerExtent[2];
                            xSize = extent[0];
                            xySize = extent[0] * extent[1];
                            for (cZ = 0; cZ < mZ; cZ++) {
                                coord[2] = cZ;
                                for (cY = 0; cY < mY; cY++) {
                                    coord[1] = cY;
                                    for (cX = 0; cX < mX; cX++) {
                                        coord[0] = cX;
                                        v = view[offset];
                                        t = v - mean;
                                        sigma += t * t,
                                            data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                                        offset += 1;
                                    }
                                }
                            }
                            sigma /= mX * mY * mZ;
                            sigma = Math.sqrt(sigma);
                            return {
                                data: data,
                                sigma: sigma
                            };
                        }
                        function readRawData(view, endian, extent, headerExtent, indices, mean) {
                            var data = new Float32Array(extent[0] * extent[1] * extent[2]), coord = [0, 0, 0], mX, mY, mZ, cX, cY, cZ, xSize, xySize, offset = 0, v = 0.1, sigma = 0.0, t = 0.1, iX = indices[0], iY = indices[1], iZ = indices[2];
                            mX = headerExtent[0];
                            mY = headerExtent[1];
                            mZ = headerExtent[2];
                            xSize = extent[0];
                            xySize = extent[0] * extent[1];
                            for (cZ = 0; cZ < mZ; cZ++) {
                                coord[2] = cZ;
                                for (cY = 0; cY < mY; cY++) {
                                    coord[1] = cY;
                                    for (cX = 0; cX < mX; cX++) {
                                        coord[0] = cX;
                                        v = view.getFloat32(offset, endian);
                                        t = v - mean;
                                        sigma += t * t,
                                            data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                                        offset += 4;
                                    }
                                }
                            }
                            sigma /= mX * mY * mZ;
                            sigma = Math.sqrt(sigma);
                            return {
                                data: data,
                                sigma: sigma
                            };
                        }
                    })(Parser || (Parser = {}));
                })(CCP4 = Density.CCP4 || (Density.CCP4 = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                var CIF;
                (function (CIF) {
                    function parse(block) {
                        return Parser.parse(block);
                    }
                    CIF.parse = parse;
                    var Parser;
                    (function (Parser) {
                        function parse(block) {
                            var info = block.getCategory('_density_info');
                            if (!info)
                                return Formats.ParserResult.error('_density_info category is missing.');
                            if (!block.getCategory('_density_data'))
                                return Formats.ParserResult.error('_density_data category is missing.');
                            function getArray(name) {
                                var ret = [];
                                for (var i = 0; i < 3; i++) {
                                    ret[i] = info.getColumn(name + "[" + i + "]").getFloat(0);
                                }
                                return ret;
                            }
                            function getNum(name) { return info.getColumn(name).getFloat(0); }
                            var header = {
                                name: info.getColumn('name').getString(0),
                                grid: getArray('grid'),
                                axisOrder: getArray('axis_order'),
                                extent: getArray('extent'),
                                origin: getArray('origin'),
                                cellSize: getArray('cell_size'),
                                cellAngles: getArray('cell_angles'),
                                mean: getNum('mean'),
                                sigma: getNum('sigma'),
                                spacegroupNumber: getNum('spacegroup_number') | 0,
                            };
                            var alpha = (Math.PI / 180.0) * header.cellAngles[0], beta = (Math.PI / 180.0) * header.cellAngles[1], gamma = (Math.PI / 180.0) * header.cellAngles[2];
                            var xScale = header.cellSize[0] / header.grid[0], yScale = header.cellSize[1] / header.grid[1], zScale = header.cellSize[2] / header.grid[2];
                            var z1 = Math.cos(beta), z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma), z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);
                            var xAxis = [xScale, 0.0, 0.0], yAxis = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0], zAxis = [z1 * zScale, z2 * zScale, z3 * zScale];
                            var indices = [0, 0, 0];
                            indices[header.axisOrder[0]] = 0;
                            indices[header.axisOrder[1]] = 1;
                            indices[header.axisOrder[2]] = 2;
                            var d = [header.origin[indices[0]], header.origin[indices[1]], header.origin[indices[2]]];
                            var origin = [
                                xAxis[0] * d[0] + yAxis[0] * d[1] + zAxis[0] * d[2],
                                yAxis[1] * d[1] + zAxis[1] * d[2],
                                zAxis[2] * d[2]
                            ];
                            var extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];
                            var rawData = readRawData1(block.getCategory('_density_data').getColumn('values'), extent, header.extent, indices, header.mean);
                            var field = new Density.Field3DZYX(rawData.data, extent);
                            var data = Density.Data.create(header.cellSize, header.cellAngles, origin, false, void 0, field, extent, { x: xAxis, y: yAxis, z: zAxis }, 
                            //[header.axisOrder[indices[0]], header.axisOrder[indices[1]], header.axisOrder[indices[2]]],
                            { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma }, { spacegroupIndex: header.spacegroupNumber - 1, name: header.name });
                            return Formats.ParserResult.success(data);
                        }
                        Parser.parse = parse;
                        function readRawData1(col, extent, headerExtent, indices, mean) {
                            var data = new Float32Array(extent[0] * extent[1] * extent[2]), coord = [0, 0, 0], mX, mY, mZ, cX, cY, cZ, xSize, xySize, offset = 0, v = 0.1, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, iX = indices[0], iY = indices[1], iZ = indices[2];
                            mX = headerExtent[0];
                            mY = headerExtent[1];
                            mZ = headerExtent[2];
                            xSize = extent[0];
                            xySize = extent[0] * extent[1];
                            for (cZ = 0; cZ < mZ; cZ++) {
                                coord[2] = cZ;
                                for (cY = 0; cY < mY; cY++) {
                                    coord[1] = cY;
                                    for (cX = 0; cX < mX; cX++) {
                                        coord[0] = cX;
                                        v = col.getFloat(offset);
                                        if (v < min)
                                            min = v;
                                        else if (v > max)
                                            max = v;
                                        data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                                        offset += 1;
                                    }
                                }
                            }
                            return { data: data, min: min, max: max };
                        }
                    })(Parser || (Parser = {}));
                })(CIF = Density.CIF || (Density.CIF = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                var DSN6;
                (function (DSN6) {
                    function parse(buffer) {
                        return Parser.parse(buffer);
                    }
                    DSN6.parse = parse;
                    function remove(arrOriginal, elementToRemove) {
                        return arrOriginal.filter(function (el) { return el !== elementToRemove; });
                    }
                    /**
                     * Parses DSN6 files.
                     */
                    var Parser;
                    (function (Parser) {
                        /**
                         * Parse DNS6 file.
                         */
                        function parse(buffer) {
                            var headerSize = 512, endian = false, 
                            //headerView = new DataView(buffer, 0, headerSize),
                            headerView = new Uint8Array(buffer, 0, headerSize), 
                            //sheaderView = String.fromCharCode.apply(null, new Uint8Array(headerView)),
                            sheaderView = String.fromCharCode.apply(null, headerView), n1 = sheaderView.search('origin'), n2 = sheaderView.search('extent'), n3 = sheaderView.search('grid'), n4 = sheaderView.search('cell'), n5 = sheaderView.search('prod'), n6 = sheaderView.search('plus'), n7 = sheaderView.search('sigma'), sn1 = sheaderView.substring(n1 + 'origin'.length, n2).replace(' ', '').split(' '), sn1xx = remove(sn1, ''), sn2 = sheaderView.substring(n2 + 'extent'.length, n3).split(' '), sn2xx = remove(sn2, ''), sn3 = sheaderView.substring(n3 + 'grid'.length, n4).split(' '), sn3xx = remove(sn3, ''), sn4 = sheaderView.substring(n4 + 'cell'.length, n5).split(' '), sn4xx = remove(sn4, ''), sn5 = sheaderView.substring(n5 + 'prod'.length, n6).split(' '), sn5xx = remove(sn5, ''), sn6 = sheaderView.substring(n6 + 'plus'.length, n7).split(' '), sn6xx = remove(sn6, ''), warnings = [];
                            var mode = 0;
                            var header = {
                                extent: sn2xx.map(function (v) { return parseInt(v); }),
                                mode: mode,
                                nxyzStart: [0, 0, 0],
                                grid: sn3xx.map(function (v) { return parseInt(v); }),
                                cellDimensions: sn4xx.slice(0, 3).map(function (v) { return parseFloat(v); }),
                                cellAngles: sn4xx.slice(3, 6).map(function (v) { return parseFloat(v); }),
                                crs2xyz: [1, 2, 3],
                                min: 0.0,
                                max: 0.0,
                                mean: 0.0,
                                symBytes: 0,
                                skewFlag: 0,
                                skewMatrix: 0,
                                skewTranslation: 0,
                                origin2k: sn1xx.map(function (v) { return parseFloat(v); }),
                                prod: sn5xx.map(function (v) { return parseFloat(v); })[0],
                                plus: sn6xx.map(function (v) { return parseFloat(v); })[0]
                            };
                            var dataOffset = 512;
                            if (dataOffset !== headerSize + header.symBytes) {
                                if (dataOffset === headerSize) {
                                    warnings.push("File contains bogus symmetry record.");
                                }
                                else if (dataOffset < headerSize) {
                                    return Formats.ParserResult.error("File appears truncated and doesn't match header.");
                                }
                                else if ((dataOffset > headerSize) && (dataOffset < (1024 * 1024))) {
                                    // Fix for loading SPIDER files which are larger than usual
                                    // In this specific case, we must absolutely trust the symBytes record
                                    dataOffset = headerSize + header.symBytes;
                                    warnings.push("File is larger than expected and doesn't match header. Continuing file load, good luck!");
                                }
                                else {
                                    return Formats.ParserResult.error("File is MUCH larger than expected and doesn't match header.");
                                }
                            }
                            // pretend we've checked the MAP string at offset 52
                            // pretend we've read the symmetry data
                            if (header.grid[0] === 0 && header.extent[0] > 0) {
                                header.grid[0] = header.extent[0] - 1;
                                warnings.push("Fixed X interval count.");
                            }
                            if (header.grid[1] === 0 && header.extent[1] > 0) {
                                header.grid[1] = header.extent[1] - 1;
                                warnings.push("Fixed Y interval count.");
                            }
                            if (header.grid[2] === 0 && header.extent[2] > 0) {
                                header.grid[2] = header.extent[2] - 1;
                                warnings.push("Fixed Z interval count.");
                            }
                            if (header.crs2xyz[0] === 0 && header.crs2xyz[1] === 0 && header.crs2xyz[2] === 0) {
                                warnings.push("All crs2xyz records are zero. Setting crs2xyz to 1, 2, 3.");
                                header.crs2xyz = [1, 2, 3];
                            }
                            if (header.cellDimensions[0] === 0.0 &&
                                header.cellDimensions[1] === 0.0 &&
                                header.cellDimensions[2] === 0.0) {
                                warnings.push("Cell dimensions are all zero. Setting to 1.0, 1.0, 1.0. Map file will not align with other structures.");
                                header.cellDimensions[0] = 1.0;
                                header.cellDimensions[1] = 1.0;
                                header.cellDimensions[2] = 1.0;
                            }
                            var alpha = (Math.PI / 180.0) * header.cellAngles[0], beta = (Math.PI / 180.0) * header.cellAngles[1], gamma = (Math.PI / 180.0) * header.cellAngles[2];
                            var xScale = header.cellDimensions[0] / header.grid[0], yScale = header.cellDimensions[1] / header.grid[1], zScale = header.cellDimensions[2] / header.grid[2];
                            var z1 = Math.cos(beta), z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma), z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);
                            var xAxis = [xScale, 0.0, 0.0], yAxis = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0], zAxis = [z1 * zScale, z2 * zScale, z3 * zScale];
                            var indices = [0, 0, 0];
                            indices[header.crs2xyz[0] - 1] = 0;
                            indices[header.crs2xyz[1] - 1] = 1;
                            indices[header.crs2xyz[2] - 1] = 2;
                            var origin;
                            if (header.origin2k[0] === 0.0 && header.origin2k[1] === 0.0 && header.origin2k[2] === 0.0) {
                                origin = [
                                    xAxis[0] * header.nxyzStart[indices[0]] + yAxis[0] * header.nxyzStart[indices[1]] + zAxis[0] * header.nxyzStart[indices[2]],
                                    yAxis[1] * header.nxyzStart[indices[1]] + zAxis[1] * header.nxyzStart[indices[2]],
                                    zAxis[2] * header.nxyzStart[indices[2]]
                                ];
                            }
                            else {
                                // Use ORIGIN records rather than old n[xyz]start records
                                //   http://www2.mrc-lmb.cam.ac.uk/image2000.html
                                // XXX the ORIGIN field is only used by the EM community, and
                                //     has undefined meaning for non-orthogonal maps and/or
                                //     non-cubic voxels, etc.
                                origin = [header.origin2k[indices[0]], header.origin2k[indices[1]], header.origin2k[indices[2]]];
                            }
                            var extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];
                            var skewMatrix = new Float32Array(16), i, j;
                            for (i = 0; i < 3; i++) {
                                for (j = 0; j < 3; j++) {
                                    skewMatrix[4 * j + i] = 0.0; //header.skewMatrix[3 * i + j];
                                }
                                skewMatrix[12 + i] = 0.0; //header.skewTranslation[i];
                            }
                            var nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;
                            endian = nativeEndian;
                            var rawData = readRawData(new Uint8Array(buffer, headerSize + header.symBytes), endian, extent, header.extent, indices, header.mean, header.prod, header.plus);
                            var field = new Density.Field3DZYX(rawData.data, extent);
                            var data = Density.Data.create(header.cellDimensions, header.cellAngles, origin, header.skewFlag !== 0, skewMatrix, field, extent, { x: xAxis, y: yAxis, z: zAxis }, 
                            //[header.nxyzStart[indices[0]], header.nxyzStart[indices[1]], header.nxyzStart[indices[2]]],
                            { min: rawData.minj, max: rawData.maxj, mean: rawData.meanj, sigma: rawData.sigma }, { prod: header.prod, plus: header.plus }); //! added attributes property to store additional information
                            return Formats.ParserResult.success(data, warnings);
                        }
                        Parser.parse = parse;
                        //////////////////////////////////////////////////////////////////////////////////////////
                        function readRawData(bytes, endian, extent, headerExtent, indices, mean, prod, plus) {
                            //! DataView is generally a LOT slower than Uint8Array. For performance reasons I think it would be better to use that.
                            //! Endian has no effect on individual bytes anyway to my knowledge.
                            var mX, mY, mZ, cX, cY, cZ, xSize, xySize, offset = 0, v = 0.1, sigma = 0.0, t = 0.1, mi, mj, mk, x, y, z, minj = 0, maxj = 0, meanj = 0, block_size = 8, block_sizez = 8, block_sizey = 8, block_sizex = 8, bsize3 = block_size * block_size * block_size;
                            //! I think this will need some fixing, because the values are non-integer
                            //! A small perf trick: use 'value | 0' to tell the runtime the value is an integer.
                            mX = headerExtent[0] / 8;
                            mY = headerExtent[1] / 8;
                            mZ = headerExtent[2] / 8;
                            //In case of extra cubes
                            /*
                            if (headerExtent[0]%8>0) mX++;
                            if (headerExtent[1]%8>0) mY++;
                            if (headerExtent[2]%8>0) mZ++;
                            xxtra=(headerExtent[0]%8);
                            yxtra=(headerExtent[1]%8);
                            zxtra=(headerExtent[2]%8);
                            */
                            var data = new Float32Array(8 * mX * 8 * mY * 8 * mZ);
                            xSize = 8 * mX;
                            xySize = 8 * 8 * mX * mY; //extent[0] * extent[1];
                            minj = 0.0;
                            maxj = 0.0;
                            meanj = 0.0;
                            //////////////////////////////////////////////////////////////
                            for (mi = 0; mi < (bsize3 * mX * mY * mZ); mi++) {
                                v = (bytes[mi] - plus) / prod;
                                meanj += v;
                                if (v < minj)
                                    minj = v;
                                if (v > maxj)
                                    maxj = v;
                            }
                            //meanj/=(mX*mY*mZ*bsize3);
                            meanj /= (bsize3 * mX * mY * mZ);
                            for (cZ = 0; cZ < mZ; cZ++) {
                                for (cY = 0; cY < mY; cY++) {
                                    for (cX = 0; cX < mX; cX++) {
                                        //! cX is suppoed to change the fastest because of the memory layout of the 1D array 
                                        //if(xxtra>0 && mZ-cZ<=1.0) block_sizez=zxtra;
                                        //if(xxtra>0 && mY-cY<=1.0) block_sizey=yxtra;
                                        //if(xxtra>0 && mX-cX<=1.0) block_sizex=xxtra;
                                        //! changed the ordering mi == X coord, was Z; mk == Z coord, was X
                                        for (mk = 0; mk < block_sizez; mk++) {
                                            for (mj = 0; mj < block_sizey; mj++) {
                                                for (mi = 0; mi < block_sizex; mi++) {
                                                    v = (bytes[offset + mi + 8 * mj + 8 * 8 * mk] - plus) / prod;
                                                    //offset+=1;
                                                    x = (block_sizex * cX + mi);
                                                    y = (block_sizey * cY + mj);
                                                    z = (block_sizez * cZ + mk);
                                                    //! swapped x and z here.
                                                    data[x + xSize * y + xySize * z] = v;
                                                    t = v - meanj;
                                                    sigma += t * t;
                                                }
                                            }
                                        }
                                        offset += bsize3;
                                    }
                                }
                            }
                            sigma /= (bsize3 * mX * mY * mZ);
                            sigma = Math.sqrt(sigma);
                            //  console.log(sigma);
                            //  console.log(minj);
                            //  console.log(maxj);
                            //  console.log(meanj);
                            return {
                                data: data,
                                sigma: sigma,
                                minj: minj,
                                maxj: maxj,
                                meanj: meanj
                            };
                        }
                    })(Parser || (Parser = {}));
                })(DSN6 = Density.DSN6 || (Density.DSN6 = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                function parse(data, name, parser) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress("Parsing " + name + "...")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, parser(data)];
                            }
                        });
                    }); });
                }
                var SupportedFormats;
                (function (SupportedFormats) {
                    SupportedFormats.CCP4 = { name: 'CCP4', shortcuts: ['ccp4', 'map'], extensions: ['.ccp4', '.map'], isBinary: true, parse: function (data) { return parse(data, 'CCP4', function (d) { return Density.CCP4.parse(d); }); } };
                    SupportedFormats.DSN6 = { name: 'DSN6', shortcuts: ['dsn6'], extensions: ['.dsn6'], isBinary: true, parse: function (data) { return parse(data, 'DSN6', function (d) { return Density.DSN6.parse(d); }); } };
                    SupportedFormats.All = [SupportedFormats.CCP4, SupportedFormats.DSN6];
                })(SupportedFormats = Density.SupportedFormats || (Density.SupportedFormats = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var LinearAlgebra;
            (function (LinearAlgebra) {
                /*
                 * This code has been modified from https://github.com/toji/gl-matrix/,
                 * copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
                 *
                 * Permission is hereby granted, free of charge, to any person obtaining a copy
                 * of this software and associated documentation files (the "Software"), to deal
                 * in the Software without restriction, including without limitation the rights
                 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                 * copies of the Software, and to permit persons to whom the Software is
                 * furnished to do so, subject to the following conditions:
                 */
                var makeArray = (typeof Float64Array !== 'undefined')
                    ? function (size) { return (new Float64Array(size)); }
                    : function (size) { return []; };
                /**
                 * Stores a 4x4 matrix in a column major (j * 4 + i indexing) format.
                 */
                var Matrix4;
                (function (Matrix4) {
                    function empty() {
                        return makeArray(16);
                    }
                    Matrix4.empty = empty;
                    function identity() {
                        var out = makeArray(16);
                        out[0] = 1;
                        out[1] = 0;
                        out[2] = 0;
                        out[3] = 0;
                        out[4] = 0;
                        out[5] = 1;
                        out[6] = 0;
                        out[7] = 0;
                        out[8] = 0;
                        out[9] = 0;
                        out[10] = 1;
                        out[11] = 0;
                        out[12] = 0;
                        out[13] = 0;
                        out[14] = 0;
                        out[15] = 1;
                        return out;
                    }
                    Matrix4.identity = identity;
                    function ofRows(rows) {
                        var out = makeArray(16), i, j, r;
                        for (i = 0; i < 4; i++) {
                            r = rows[i];
                            for (j = 0; j < 4; j++) {
                                out[4 * j + i] = r[j];
                            }
                        }
                        return out;
                    }
                    Matrix4.ofRows = ofRows;
                    function areEqual(a, b, eps) {
                        for (var i = 0; i < 16; i++) {
                            if (Math.abs(a[i] - b[i]) > eps) {
                                return false;
                            }
                        }
                        return true;
                    }
                    Matrix4.areEqual = areEqual;
                    function setValue(a, i, j, value) {
                        a[4 * j + i] = value;
                    }
                    Matrix4.setValue = setValue;
                    function copy(out, a) {
                        out[0] = a[0];
                        out[1] = a[1];
                        out[2] = a[2];
                        out[3] = a[3];
                        out[4] = a[4];
                        out[5] = a[5];
                        out[6] = a[6];
                        out[7] = a[7];
                        out[8] = a[8];
                        out[9] = a[9];
                        out[10] = a[10];
                        out[11] = a[11];
                        out[12] = a[12];
                        out[13] = a[13];
                        out[14] = a[14];
                        out[15] = a[15];
                        return out;
                    }
                    Matrix4.copy = copy;
                    function clone(a) {
                        return Matrix4.copy(Matrix4.empty(), a);
                    }
                    Matrix4.clone = clone;
                    function invert(out, a) {
                        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, 
                        // Calculate the determinant
                        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
                        if (!det) {
                            return null;
                        }
                        det = 1.0 / det;
                        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
                        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
                        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
                        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
                        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
                        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
                        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
                        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
                        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
                        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
                        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
                        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
                        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
                        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
                        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
                        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
                        return out;
                    }
                    Matrix4.invert = invert;
                    function mul(out, a, b) {
                        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
                        // Cache only the current line of the second matrix
                        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
                        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        b0 = b[4];
                        b1 = b[5];
                        b2 = b[6];
                        b3 = b[7];
                        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        b0 = b[8];
                        b1 = b[9];
                        b2 = b[10];
                        b3 = b[11];
                        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        b0 = b[12];
                        b1 = b[13];
                        b2 = b[14];
                        b3 = b[15];
                        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        return out;
                    }
                    Matrix4.mul = mul;
                    function translate(out, a, v) {
                        var x = v[0], y = v[1], z = v[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
                        if (a === out) {
                            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
                            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
                            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
                            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
                        }
                        else {
                            a00 = a[0];
                            a01 = a[1];
                            a02 = a[2];
                            a03 = a[3];
                            a10 = a[4];
                            a11 = a[5];
                            a12 = a[6];
                            a13 = a[7];
                            a20 = a[8];
                            a21 = a[9];
                            a22 = a[10];
                            a23 = a[11];
                            out[0] = a00;
                            out[1] = a01;
                            out[2] = a02;
                            out[3] = a03;
                            out[4] = a10;
                            out[5] = a11;
                            out[6] = a12;
                            out[7] = a13;
                            out[8] = a20;
                            out[9] = a21;
                            out[10] = a22;
                            out[11] = a23;
                            out[12] = a00 * x + a10 * y + a20 * z + a[12];
                            out[13] = a01 * x + a11 * y + a21 * z + a[13];
                            out[14] = a02 * x + a12 * y + a22 * z + a[14];
                            out[15] = a03 * x + a13 * y + a23 * z + a[15];
                        }
                        return out;
                    }
                    Matrix4.translate = translate;
                    function fromTranslation(out, v) {
                        out[0] = 1;
                        out[1] = 0;
                        out[2] = 0;
                        out[3] = 0;
                        out[4] = 0;
                        out[5] = 1;
                        out[6] = 0;
                        out[7] = 0;
                        out[8] = 0;
                        out[9] = 0;
                        out[10] = 1;
                        out[11] = 0;
                        out[12] = v[0];
                        out[13] = v[1];
                        out[14] = v[2];
                        out[15] = 1;
                        return out;
                    }
                    Matrix4.fromTranslation = fromTranslation;
                    function transformVector3(out, a, m) {
                        var x = a.x, y = a.y, z = a.z;
                        out.x = m[0] * x + m[4] * y + m[8] * z + m[12];
                        out.y = m[1] * x + m[5] * y + m[9] * z + m[13];
                        out.z = m[2] * x + m[6] * y + m[10] * z + m[14];
                        //out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
                        return out;
                    }
                    Matrix4.transformVector3 = transformVector3;
                    function makeTable(m) {
                        var ret = '';
                        for (var i = 0; i < 4; i++) {
                            for (var j = 0; j < 4; j++) {
                                ret += m[4 * j + i].toString();
                                if (j < 3)
                                    ret += ' ';
                            }
                            if (i < 3)
                                ret += '\n';
                        }
                        return ret;
                    }
                    Matrix4.makeTable = makeTable;
                    function determinant(a) {
                        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
                        // Calculate the determinant
                        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
                    }
                    Matrix4.determinant = determinant;
                })(Matrix4 = LinearAlgebra.Matrix4 || (LinearAlgebra.Matrix4 = {}));
                var Vector4;
                (function (Vector4) {
                    function create() {
                        var out = makeArray(4);
                        out[0] = 0;
                        out[1] = 0;
                        out[2] = 0;
                        out[3] = 0;
                        return out;
                    }
                    Vector4.create = create;
                    function clone(a) {
                        var out = makeArray(4);
                        out[0] = a[0];
                        out[1] = a[1];
                        out[2] = a[2];
                        out[3] = a[3];
                        return out;
                    }
                    Vector4.clone = clone;
                    function fromValues(x, y, z, w) {
                        var out = makeArray(4);
                        out[0] = x;
                        out[1] = y;
                        out[2] = z;
                        out[3] = w;
                        return out;
                    }
                    Vector4.fromValues = fromValues;
                    function set(out, x, y, z, w) {
                        out[0] = x;
                        out[1] = y;
                        out[2] = z;
                        out[3] = w;
                        return out;
                    }
                    Vector4.set = set;
                    function distance(a, b) {
                        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
                        return Math.sqrt(x * x + y * y + z * z + w * w);
                    }
                    Vector4.distance = distance;
                    function squaredDistance(a, b) {
                        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
                        return x * x + y * y + z * z + w * w;
                    }
                    Vector4.squaredDistance = squaredDistance;
                    function norm(a) {
                        var x = a[0], y = a[1], z = a[2], w = a[3];
                        return Math.sqrt(x * x + y * y + z * z + w * w);
                    }
                    Vector4.norm = norm;
                    function squaredNorm(a) {
                        var x = a[0], y = a[1], z = a[2], w = a[3];
                        return x * x + y * y + z * z + w * w;
                    }
                    Vector4.squaredNorm = squaredNorm;
                    function transform(out, a, m) {
                        var x = a[0], y = a[1], z = a[2], w = a[3];
                        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
                        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
                        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
                        out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
                        return out;
                    }
                    Vector4.transform = transform;
                })(Vector4 = LinearAlgebra.Vector4 || (LinearAlgebra.Vector4 = {}));
            })(LinearAlgebra = Geometry.LinearAlgebra || (Geometry.LinearAlgebra = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            /**
             * A buffer that only remembers the values.
             */
            var SubdivisionTree3DResultIndexBuffer;
            (function (SubdivisionTree3DResultIndexBuffer) {
                function ensureCapacity(buffer) {
                    var newCapacity = buffer.capacity * 2 + 1, newIdx = new Int32Array(newCapacity), i;
                    if (buffer.count < 32) {
                        for (i = 0; i < buffer.count; i++) {
                            newIdx[i] = buffer.indices[i];
                        }
                    }
                    else {
                        newIdx.set(buffer.indices);
                    }
                    buffer.indices = newIdx;
                    buffer.capacity = newCapacity;
                }
                function add(distSq, index) {
                    if (this.count + 1 >= this.capacity) {
                        ensureCapacity(this);
                    }
                    this.indices[this.count++] = index;
                }
                function reset() {
                    this.count = 0;
                }
                function create(initialCapacity) {
                    if (initialCapacity < 1)
                        initialCapacity = 1;
                    return {
                        indices: new Int32Array(initialCapacity),
                        count: 0,
                        capacity: initialCapacity,
                        hasPriorities: false,
                        priorities: void 0,
                        add: add,
                        reset: reset
                    };
                }
                SubdivisionTree3DResultIndexBuffer.create = create;
            })(SubdivisionTree3DResultIndexBuffer = Geometry.SubdivisionTree3DResultIndexBuffer || (Geometry.SubdivisionTree3DResultIndexBuffer = {}));
            /**
             * A buffer that remembers values and priorities.
             */
            var SubdivisionTree3DResultPriorityBuffer;
            (function (SubdivisionTree3DResultPriorityBuffer) {
                function ensureCapacity(buffer) {
                    var newCapacity = buffer.capacity * 2 + 1, newIdx = new Int32Array(newCapacity), newPrio = new Float32Array(newCapacity), i;
                    if (buffer.count < 32) {
                        for (i = 0; i < buffer.count; i++) {
                            newIdx[i] = buffer.indices[i];
                            newPrio[i] = buffer.priorities[i];
                        }
                    }
                    else {
                        newIdx.set(buffer.indices);
                        newPrio.set(buffer.priorities);
                    }
                    buffer.indices = newIdx;
                    buffer.priorities = newPrio;
                    buffer.capacity = newCapacity;
                }
                function add(distSq, index) {
                    if (this.count + 1 >= this.capacity)
                        ensureCapacity(this);
                    this.priorities[this.count] = distSq;
                    this.indices[this.count++] = index;
                }
                function reset() {
                    this.count = 0;
                }
                function create(initialCapacity) {
                    if (initialCapacity < 1)
                        initialCapacity = 1;
                    return {
                        indices: new Int32Array(initialCapacity),
                        count: 0,
                        capacity: initialCapacity,
                        hasPriorities: true,
                        priorities: new Float32Array(initialCapacity),
                        add: add,
                        reset: reset
                    };
                }
                SubdivisionTree3DResultPriorityBuffer.create = create;
            })(SubdivisionTree3DResultPriorityBuffer = Geometry.SubdivisionTree3DResultPriorityBuffer || (Geometry.SubdivisionTree3DResultPriorityBuffer = {}));
            var SubdivisionTree3DQueryContext;
            (function (SubdivisionTree3DQueryContext) {
                /**
                 * Query the tree and store the result to this.buffer. Overwrites the old result.
                 */
                function nearest(x, y, z, radius) {
                    this.pivot[0] = x;
                    this.pivot[1] = y;
                    this.pivot[2] = z;
                    this.radius = radius;
                    this.radiusSq = radius * radius;
                    this.buffer.reset();
                    SubdivisionTree3DNode.nearest(this.tree.root, this, 0);
                }
                function create(tree, buffer) {
                    return {
                        tree: tree,
                        indices: tree.indices,
                        positions: tree.positions,
                        buffer: buffer,
                        pivot: [0.1, 0.1, 0.1],
                        radius: 1.1,
                        radiusSq: 1.1 * 1.1,
                        nearest: nearest
                    };
                }
                SubdivisionTree3DQueryContext.create = create;
            })(SubdivisionTree3DQueryContext = Geometry.SubdivisionTree3DQueryContext || (Geometry.SubdivisionTree3DQueryContext = {}));
            var SubdivisionTree3D;
            (function (SubdivisionTree3D) {
                /**
                 * Create a context used for querying the data.
                 */
                function createContextRadius(tree, radiusEstimate, includePriorities) {
                    if (includePriorities === void 0) { includePriorities = false; }
                    return SubdivisionTree3DQueryContext.create(tree, includePriorities
                        ? SubdivisionTree3DResultPriorityBuffer.create(Math.max((radiusEstimate * radiusEstimate) | 0, 8))
                        : SubdivisionTree3DResultIndexBuffer.create(Math.max((radiusEstimate * radiusEstimate) | 0, 8)));
                }
                SubdivisionTree3D.createContextRadius = createContextRadius;
                /**
                 * Takes data and a function that calls SubdivisionTree3DPositionBuilder.add(x, y, z) on each data element.
                 */
                function create(data, f, leafSize) {
                    if (leafSize === void 0) { leafSize = 32; }
                    var _a = SubdivisionTree3DBuilder.build(data, f, leafSize), root = _a.root, indices = _a.indices, positions = _a.positions;
                    return { data: data, root: root, indices: indices, positions: positions };
                }
                SubdivisionTree3D.create = create;
            })(SubdivisionTree3D = Geometry.SubdivisionTree3D || (Geometry.SubdivisionTree3D = {}));
            var PositionBuilder;
            (function (PositionBuilder) {
                function add(builder, x, y, z) {
                    builder.data[builder._count++] = x;
                    builder.data[builder._count++] = y;
                    builder.data[builder._count++] = z;
                    builder.boundsMin[0] = Math.min(x, builder.boundsMin[0]);
                    builder.boundsMin[1] = Math.min(y, builder.boundsMin[1]);
                    builder.boundsMin[2] = Math.min(z, builder.boundsMin[2]);
                    builder.boundsMax[0] = Math.max(x, builder.boundsMax[0]);
                    builder.boundsMax[1] = Math.max(y, builder.boundsMax[1]);
                    builder.boundsMax[2] = Math.max(z, builder.boundsMax[2]);
                }
                PositionBuilder.add = add;
                function create(size) {
                    var data = new Float32Array((size * 3) | 0);
                    var bounds = Box3D.createInfinite();
                    var boundsMin = bounds.min;
                    var boundsMax = bounds.max;
                    return { _count: 0, data: data, bounds: bounds, boundsMin: boundsMin, boundsMax: boundsMax };
                }
                PositionBuilder.create = create;
            })(PositionBuilder || (PositionBuilder = {}));
            var SubdivisionTree3DNode;
            (function (SubdivisionTree3DNode) {
                function nearestLeaf(node, ctx) {
                    var pivot = ctx.pivot, indices = ctx.indices, positions = ctx.positions, rSq = ctx.radiusSq, dx, dy, dz, o, m, i;
                    for (i = node.startIndex; i < node.endIndex; i++) {
                        o = 3 * indices[i];
                        dx = pivot[0] - positions[o];
                        dy = pivot[1] - positions[o + 1];
                        dz = pivot[2] - positions[o + 2];
                        m = dx * dx + dy * dy + dz * dz;
                        if (m <= rSq)
                            ctx.buffer.add(m, indices[i]);
                    }
                }
                function nearestNode(node, ctx, dim) {
                    var pivot = ctx.pivot[dim], left = pivot < node.splitValue;
                    if (left ? pivot + ctx.radius > node.splitValue : pivot - ctx.radius < node.splitValue) {
                        nearest(node.left, ctx, (dim + 1) % 3);
                        nearest(node.right, ctx, (dim + 1) % 3);
                    }
                    else if (left) {
                        nearest(node.left, ctx, (dim + 1) % 3);
                    }
                    else {
                        nearest(node.right, ctx, (dim + 1) % 3);
                    }
                }
                function nearest(node, ctx, dim) {
                    // check for empty.
                    if (node.startIndex === node.endIndex)
                        return;
                    // is leaf?
                    if (isNaN(node.splitValue))
                        nearestLeaf(node, ctx);
                    else
                        nearestNode(node, ctx, dim);
                }
                SubdivisionTree3DNode.nearest = nearest;
                function create(splitValue, startIndex, endIndex, left, right) {
                    return { splitValue: splitValue, startIndex: startIndex, endIndex: endIndex, left: left, right: right };
                }
                SubdivisionTree3DNode.create = create;
            })(SubdivisionTree3DNode = Geometry.SubdivisionTree3DNode || (Geometry.SubdivisionTree3DNode = {}));
            var Box3D;
            (function (Box3D) {
                function createInfinite() {
                    return {
                        min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
                        max: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]
                    };
                }
                Box3D.createInfinite = createInfinite;
            })(Box3D = Geometry.Box3D || (Geometry.Box3D = {}));
            /**
             * A helper to build the tree.
             */
            var SubdivisionTree3DBuilder;
            (function (SubdivisionTree3DBuilder) {
                function split(state, startIndex, endIndex, coord) {
                    var delta = endIndex - startIndex + 1;
                    if (delta <= 0) {
                        return state.emptyNode;
                    }
                    else if (delta <= state.leafSize) {
                        return SubdivisionTree3DNode.create(NaN, startIndex, endIndex + 1, state.emptyNode, state.emptyNode);
                    }
                    var min = state.bounds.min[coord], max = state.bounds.max[coord], median = 0.5 * (min + max), midIndex = 0, l = startIndex, r = endIndex, t, left, right;
                    while (l < r) {
                        t = state.indices[r];
                        state.indices[r] = state.indices[l];
                        state.indices[l] = t;
                        while (l <= endIndex && state.positions[3 * state.indices[l] + coord] <= median)
                            l++;
                        while (r >= startIndex && state.positions[3 * state.indices[r] + coord] > median)
                            r--;
                    }
                    midIndex = l - 1;
                    state.bounds.max[coord] = median;
                    left = split(state, startIndex, midIndex, (coord + 1) % 3);
                    state.bounds.max[coord] = max;
                    state.bounds.min[coord] = median;
                    right = split(state, midIndex + 1, endIndex, (coord + 1) % 3);
                    state.bounds.min[coord] = min;
                    return SubdivisionTree3DNode.create(median, startIndex, endIndex + 1, left, right);
                }
                function createAdder(builder) {
                    var add = PositionBuilder.add;
                    return function (x, y, z) {
                        add(builder, x, y, z);
                    };
                }
                function build(data, f, leafSize) {
                    var positions = PositionBuilder.create(data.length), indices = new Int32Array(data.length);
                    var add = createAdder(positions);
                    for (var i = 0; i < data.length; i++) {
                        indices[i] = i;
                        f(data[i], add);
                    }
                    // help gc
                    add = void 0;
                    var state = {
                        bounds: positions.bounds,
                        positions: positions.data,
                        leafSize: leafSize,
                        indices: indices,
                        emptyNode: SubdivisionTree3DNode.create(NaN, -1, -1, void 0, void 0),
                    };
                    var root = split(state, 0, indices.length - 1, 0);
                    state = void 0;
                    return { root: root, indices: indices, positions: positions.data };
                }
                SubdivisionTree3DBuilder.build = build;
            })(SubdivisionTree3DBuilder || (SubdivisionTree3DBuilder = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            "use strict";
            var Surface;
            (function (Surface) {
                function computeNormalsImmediate(surface) {
                    if (surface.normals)
                        return;
                    var normals = new Float32Array(surface.vertices.length), v = surface.vertices, triangles = surface.triangleIndices, f, i;
                    for (i = 0; i < triangles.length; i += 3) {
                        var a = 3 * triangles[i], b = 3 * triangles[i + 1], c = 3 * triangles[i + 2];
                        var nx = v[a + 2] * (v[b + 1] - v[c + 1]) + v[b + 2] * v[c + 1] - v[b + 1] * v[c + 2] + v[a + 1] * (-v[b + 2] + v[c + 2]), ny = -(v[b + 2] * v[c]) + v[a + 2] * (-v[b] + v[c]) + v[a] * (v[b + 2] - v[c + 2]) + v[b] * v[c + 2], nz = v[a + 1] * (v[b] - v[c]) + v[b + 1] * v[c] - v[b] * v[c + 1] + v[a] * (-v[b + 1] + v[b + 1]);
                        normals[a] += nx;
                        normals[a + 1] += ny;
                        normals[a + 2] += nz;
                        normals[b] += nx;
                        normals[b + 1] += ny;
                        normals[b + 2] += nz;
                        normals[c] += nx;
                        normals[c + 1] += ny;
                        normals[c + 2] += nz;
                    }
                    for (i = 0; i < normals.length; i += 3) {
                        var nx = normals[i];
                        var ny = normals[i + 1];
                        var nz = normals[i + 2];
                        f = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
                        normals[i] *= f;
                        normals[i + 1] *= f;
                        normals[i + 2] *= f;
                    }
                    surface.normals = normals;
                }
                Surface.computeNormalsImmediate = computeNormalsImmediate;
                function computeNormals(surface) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (surface.normals) {
                                        return [2 /*return*/, surface];
                                    }
                                    ;
                                    return [4 /*yield*/, ctx.updateProgress('Computing normals...')];
                                case 1:
                                    _a.sent();
                                    computeNormalsImmediate(surface);
                                    return [2 /*return*/, surface];
                            }
                        });
                    }); });
                }
                Surface.computeNormals = computeNormals;
                function addVertex(src, i, dst, j) {
                    dst[3 * j] += src[3 * i];
                    dst[3 * j + 1] += src[3 * i + 1];
                    dst[3 * j + 2] += src[3 * i + 2];
                }
                function laplacianSmoothIter(surface, counts, vs) {
                    var triCount = surface.triangleIndices.length, src = surface.vertices;
                    var triangleIndices = surface.triangleIndices;
                    for (var i = 0; i < triCount; i += 3) {
                        var a = triangleIndices[i], b = triangleIndices[i + 1], c = triangleIndices[i + 2];
                        addVertex(src, b, vs, a);
                        addVertex(src, c, vs, a);
                        addVertex(src, a, vs, b);
                        addVertex(src, c, vs, b);
                        addVertex(src, a, vs, c);
                        addVertex(src, b, vs, c);
                    }
                    for (var i = 0, _b = surface.vertexCount; i < _b; i++) {
                        var n = counts[i] + 2;
                        vs[3 * i] = (vs[3 * i] + 2 * src[3 * i]) / n;
                        vs[3 * i + 1] = (vs[3 * i + 1] + 2 * src[3 * i + 1]) / n;
                        vs[3 * i + 2] = (vs[3 * i + 2] + 2 * src[3 * i + 2]) / n;
                    }
                }
                /*
                 * Smooths the vertices by averaging the neighborhood.
                 *
                 * Resets normals. Might replace vertex array.
                 */
                function laplacianSmooth(surface, iterCount) {
                    var _this = this;
                    if (iterCount === void 0) { iterCount = 1; }
                    if (iterCount < 1)
                        iterCount = 0;
                    if (iterCount === 0)
                        return Core.Computation.resolve(surface);
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var counts, triCount, tris, i, vs, started, i, j, _b, t, time;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Smoothing surface...', true)];
                                case 1:
                                    _a.sent();
                                    counts = new Int32Array(surface.vertexCount), triCount = surface.triangleIndices.length;
                                    tris = surface.triangleIndices;
                                    for (i = 0; i < triCount; i++) {
                                        counts[tris[i]] += 2;
                                    }
                                    vs = new Float32Array(surface.vertices.length);
                                    started = Core.Utils.PerformanceMonitor.currentTime();
                                    return [4 /*yield*/, ctx.updateProgress('Smoothing surface...', true)];
                                case 2:
                                    _a.sent();
                                    i = 0;
                                    _a.label = 3;
                                case 3:
                                    if (!(i < iterCount)) return [3 /*break*/, 6];
                                    if (i > 0) {
                                        for (j = 0, _b = vs.length; j < _b; j++)
                                            vs[j] = 0;
                                    }
                                    surface.normals = void 0;
                                    laplacianSmoothIter(surface, counts, vs);
                                    t = surface.vertices;
                                    surface.vertices = vs;
                                    vs = t;
                                    time = Core.Utils.PerformanceMonitor.currentTime();
                                    if (!(time - started > Core.Computation.UpdateProgressDelta)) return [3 /*break*/, 5];
                                    started = time;
                                    return [4 /*yield*/, ctx.updateProgress('Smoothing surface...', true, i + 1, iterCount)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5:
                                    i++;
                                    return [3 /*break*/, 3];
                                case 6: return [2 /*return*/, surface];
                            }
                        });
                    }); });
                }
                Surface.laplacianSmooth = laplacianSmooth;
                function computeBoundingSphere(surface) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var vertices, x, y, z, i, _c, r, i, _c, dx, dy, dz;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (surface.boundingSphere) {
                                        return [2 /*return*/, surface];
                                    }
                                    return [4 /*yield*/, ctx.updateProgress('Computing bounding sphere...')];
                                case 1:
                                    _a.sent();
                                    vertices = surface.vertices;
                                    x = 0, y = 0, z = 0;
                                    for (i = 0, _c = surface.vertices.length; i < _c; i += 3) {
                                        x += vertices[i];
                                        y += vertices[i + 1];
                                        z += vertices[i + 2];
                                    }
                                    x /= surface.vertexCount;
                                    y /= surface.vertexCount;
                                    z /= surface.vertexCount;
                                    r = 0;
                                    for (i = 0, _c = vertices.length; i < _c; i += 3) {
                                        dx = x - vertices[i];
                                        dy = y - vertices[i + 1];
                                        dz = z - vertices[i + 2];
                                        r = Math.max(r, dx * dx + dy * dy + dz * dz);
                                    }
                                    surface.boundingSphere = {
                                        center: { x: x, y: y, z: z },
                                        radius: Math.sqrt(r)
                                    };
                                    return [2 /*return*/, surface];
                            }
                        });
                    }); });
                }
                Surface.computeBoundingSphere = computeBoundingSphere;
                function transformImmediate(surface, t) {
                    var p = { x: 0.1, y: 0.1, z: 0.1 };
                    var m = Geometry.LinearAlgebra.Matrix4.transformVector3;
                    var vertices = surface.vertices;
                    for (var i = 0, _c = surface.vertices.length; i < _c; i += 3) {
                        p.x = vertices[i];
                        p.y = vertices[i + 1];
                        p.z = vertices[i + 2];
                        m(p, p, t);
                        vertices[i] = p.x;
                        vertices[i + 1] = p.y;
                        vertices[i + 2] = p.z;
                    }
                    surface.normals = void 0;
                    surface.boundingSphere = void 0;
                }
                Surface.transformImmediate = transformImmediate;
                function transform(surface, t) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            ctx.updateProgress('Updating surface...');
                            transformImmediate(surface, t);
                            return [2 /*return*/, surface];
                        });
                    }); });
                }
                Surface.transform = transform;
            })(Surface = Geometry.Surface || (Geometry.Surface = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var MarchingCubes;
            (function (MarchingCubes) {
                "use strict";
                function compute(parameters) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var comp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    comp = new MarchingCubesComputation(parameters, ctx);
                                    return [4 /*yield*/, comp.run()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); });
                }
                MarchingCubes.compute = compute;
                var MarchingCubesComputation = (function () {
                    function MarchingCubesComputation(parameters, ctx) {
                        this.ctx = ctx;
                        this.minX = 0;
                        this.minY = 0;
                        this.minZ = 0;
                        this.maxX = 0;
                        this.maxY = 0;
                        this.maxZ = 0;
                        var params = Core.Utils.extend({}, parameters);
                        if (!params.bottomLeft)
                            params.bottomLeft = [0, 0, 0];
                        if (!params.topRight)
                            params.topRight = params.scalarField.dimensions;
                        this.state = new MarchingCubesState(params),
                            this.minX = params.bottomLeft[0];
                        this.minY = params.bottomLeft[1];
                        this.minZ = params.bottomLeft[2];
                        this.maxX = params.topRight[0] - 1;
                        this.maxY = params.topRight[1] - 1;
                        this.maxZ = params.topRight[2] - 1;
                        this.size = (this.maxX - this.minX) * (this.maxY - this.minY) * (this.maxZ - this.minZ);
                        this.sliceSize = (this.maxX - this.minX) * (this.maxY - this.minY);
                    }
                    MarchingCubesComputation.prototype.doSlices = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var done, started, k, t;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        done = 0;
                                        started = Core.Utils.PerformanceMonitor.currentTime();
                                        k = this.minZ;
                                        _a.label = 1;
                                    case 1:
                                        if (!(k < this.maxZ)) return [3 /*break*/, 4];
                                        this.slice(k);
                                        done += this.sliceSize;
                                        t = Core.Utils.PerformanceMonitor.currentTime();
                                        if (!(t - started > Core.Computation.UpdateProgressDelta)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this.ctx.updateProgress('Computing surface...', true, done, this.size)];
                                    case 2:
                                        _a.sent();
                                        started = t;
                                        _a.label = 3;
                                    case 3:
                                        k++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        });
                    };
                    MarchingCubesComputation.prototype.slice = function (k) {
                        for (var j = this.minY; j < this.maxY; j++) {
                            for (var i = this.minX; i < this.maxX; i++) {
                                this.state.processCell(i, j, k);
                            }
                        }
                    };
                    MarchingCubesComputation.prototype.finish = function () {
                        var vertices = Core.Utils.ChunkedArray.compact(this.state.vertexBuffer);
                        var triangles = Core.Utils.ChunkedArray.compact(this.state.triangleBuffer);
                        this.state.vertexBuffer = void 0;
                        this.state.verticesOnEdges = void 0;
                        var ret = {
                            vertexCount: (vertices.length / 3) | 0,
                            triangleCount: (triangles.length / 3) | 0,
                            vertices: vertices,
                            triangleIndices: triangles,
                            annotation: this.state.annotate ? Core.Utils.ChunkedArray.compact(this.state.annotationBuffer) : void 0
                        };
                        return ret;
                    };
                    MarchingCubesComputation.prototype.run = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.ctx.updateProgress('Computing surface...', true, 0, this.size)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, this.doSlices()];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.ctx.updateProgress('Finalizing...')];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, this.finish()];
                                }
                            });
                        });
                    };
                    return MarchingCubesComputation;
                }());
                var MarchingCubesState = (function () {
                    function MarchingCubesState(params) {
                        this.vertList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        this.i = 0;
                        this.j = 0;
                        this.k = 0;
                        this.nX = params.scalarField.dimensions[0];
                        this.nY = params.scalarField.dimensions[1];
                        this.nZ = params.scalarField.dimensions[2];
                        this.isoLevel = params.isoLevel;
                        this.scalarField = params.scalarField;
                        this.annotationField = params.annotationField;
                        var dX = params.topRight[0] - params.bottomLeft[0], dY = params.topRight[1] - params.bottomLeft[1], dZ = params.topRight[2] - params.bottomLeft[2], vertexBufferSize = Math.min(262144, Math.max(dX * dY * dZ / 16, 1024) | 0), triangleBufferSize = Math.min(1 << 16, vertexBufferSize * 4);
                        this.vertexBuffer = Core.Utils.ChunkedArray.forVertex3D(vertexBufferSize);
                        this.triangleBuffer = Core.Utils.ChunkedArray.create(function (size) { return new Uint32Array(size); }, triangleBufferSize, 3);
                        this.annotate = !!params.annotationField;
                        if (this.annotate)
                            this.annotationBuffer = Core.Utils.ChunkedArray.forInt32(vertexBufferSize);
                        this.verticesOnEdges = new Int32Array(3 * this.nX * this.nY * this.nZ);
                    }
                    MarchingCubesState.prototype.get3dOffsetFromEdgeInfo = function (index) {
                        return (this.nX * ((this.k + index.k) * this.nY + this.j + index.j) + this.i + index.i) | 0;
                    };
                    MarchingCubesState.prototype.interpolate = function (edgeNum) {
                        var info = MarchingCubes.EdgeIdInfo[edgeNum], edgeId = 3 * this.get3dOffsetFromEdgeInfo(info) + info.e;
                        var ret = this.verticesOnEdges[edgeId];
                        if (ret > 0)
                            return (ret - 1) | 0;
                        var edge = MarchingCubes.CubeEdges[edgeNum];
                        var a = edge.a, b = edge.b, li = a.i + this.i, lj = a.j + this.j, lk = a.k + this.k, hi = b.i + this.i, hj = b.j + this.j, hk = b.k + this.k, v0 = this.scalarField.get(li, lj, lk), v1 = this.scalarField.get(hi, hj, hk), t = (this.isoLevel - v0) / (v0 - v1);
                        var id = Core.Utils.ChunkedArray.add3(this.vertexBuffer, li + t * (li - hi), lj + t * (lj - hj), lk + t * (lk - hk)) | 0;
                        this.verticesOnEdges[edgeId] = id + 1;
                        if (this.annotate) {
                            Core.Utils.ChunkedArray.add(this.annotationBuffer, this.annotationField.get(this.i, this.j, this.k));
                        }
                        return id;
                    };
                    MarchingCubesState.prototype.processCell = function (i, j, k) {
                        var tableIndex = 0;
                        if (this.scalarField.get(i, j, k) < this.isoLevel)
                            tableIndex |= 1;
                        if (this.scalarField.get(i + 1, j, k) < this.isoLevel)
                            tableIndex |= 2;
                        if (this.scalarField.get(i + 1, j + 1, k) < this.isoLevel)
                            tableIndex |= 4;
                        if (this.scalarField.get(i, j + 1, k) < this.isoLevel)
                            tableIndex |= 8;
                        if (this.scalarField.get(i, j, k + 1) < this.isoLevel)
                            tableIndex |= 16;
                        if (this.scalarField.get(i + 1, j, k + 1) < this.isoLevel)
                            tableIndex |= 32;
                        if (this.scalarField.get(i + 1, j + 1, k + 1) < this.isoLevel)
                            tableIndex |= 64;
                        if (this.scalarField.get(i, j + 1, k + 1) < this.isoLevel)
                            tableIndex |= 128;
                        if (tableIndex === 0 || tableIndex === 255)
                            return;
                        this.i = i;
                        this.j = j;
                        this.k = k;
                        var edgeInfo = MarchingCubes.EdgeTable[tableIndex];
                        if ((edgeInfo & 1) > 0)
                            this.vertList[0] = this.interpolate(0); // 0 1
                        if ((edgeInfo & 2) > 0)
                            this.vertList[1] = this.interpolate(1); // 1 2
                        if ((edgeInfo & 4) > 0)
                            this.vertList[2] = this.interpolate(2); // 2 3
                        if ((edgeInfo & 8) > 0)
                            this.vertList[3] = this.interpolate(3); // 0 3
                        if ((edgeInfo & 16) > 0)
                            this.vertList[4] = this.interpolate(4); // 4 5
                        if ((edgeInfo & 32) > 0)
                            this.vertList[5] = this.interpolate(5); // 5 6
                        if ((edgeInfo & 64) > 0)
                            this.vertList[6] = this.interpolate(6); // 6 7
                        if ((edgeInfo & 128) > 0)
                            this.vertList[7] = this.interpolate(7); // 4 7
                        if ((edgeInfo & 256) > 0)
                            this.vertList[8] = this.interpolate(8); // 0 4
                        if ((edgeInfo & 512) > 0)
                            this.vertList[9] = this.interpolate(9); // 1 5
                        if ((edgeInfo & 1024) > 0)
                            this.vertList[10] = this.interpolate(10); // 2 6
                        if ((edgeInfo & 2048) > 0)
                            this.vertList[11] = this.interpolate(11); // 3 7
                        var triInfo = MarchingCubes.TriTable[tableIndex];
                        for (var t = 0; t < triInfo.length; t += 3) {
                            Core.Utils.ChunkedArray.add3(this.triangleBuffer, this.vertList[triInfo[t]], this.vertList[triInfo[t + 1]], this.vertList[triInfo[t + 2]]);
                        }
                    };
                    return MarchingCubesState;
                }());
            })(MarchingCubes = Geometry.MarchingCubes || (Geometry.MarchingCubes = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var MarchingCubes;
            (function (MarchingCubes) {
                var Index = (function () {
                    function Index(i, j, k) {
                        this.i = i | 0;
                        this.j = j | 0;
                        this.k = k | 0;
                    }
                    return Index;
                }());
                MarchingCubes.Index = Index;
                var IndexPair = (function () {
                    function IndexPair(a, b) {
                        this.a = a;
                        this.b = b;
                    }
                    return IndexPair;
                }());
                MarchingCubes.IndexPair = IndexPair;
                MarchingCubes.EdgesXY = [
                    [],
                    [0, 3],
                    [0, 1],
                    [1, 3],
                    [1, 2],
                    [0, 1, 1, 2, 2, 3, 0, 3],
                    [0, 2],
                    [2, 3],
                    [2, 3],
                    [0, 2],
                    [0, 1, 1, 2, 2, 3, 0, 3],
                    [1, 2],
                    [1, 3],
                    [0, 1],
                    [0, 3],
                    []
                ];
                MarchingCubes.EdgesXZ = [
                    [],
                    [0, 8],
                    [0, 9],
                    [9, 8],
                    [9, 4],
                    [0, 9, 9, 4, 4, 8, 0, 8],
                    [0, 4],
                    [4, 8],
                    [4, 8],
                    [0, 4],
                    [0, 9, 9, 4, 4, 8, 0, 8],
                    [9, 4],
                    [9, 8],
                    [0, 9],
                    [0, 8],
                    []
                ];
                MarchingCubes.EdgesYZ = [
                    [],
                    [3, 8],
                    [3, 11],
                    [11, 8],
                    [11, 7],
                    [3, 11, 11, 7, 7, 8, 3, 8],
                    [3, 7],
                    [7, 8],
                    [7, 8],
                    [3, 7],
                    [3, 11, 11, 7, 7, 8, 3, 8],
                    [11, 7],
                    [11, 8],
                    [3, 11],
                    [3, 8],
                    []
                ];
                MarchingCubes.CubeVertices = [
                    new Index(0, 0, 0),
                    new Index(1, 0, 0),
                    new Index(1, 1, 0),
                    new Index(0, 1, 0),
                    new Index(0, 0, 1),
                    new Index(1, 0, 1),
                    new Index(1, 1, 1),
                    new Index(0, 1, 1),
                ];
                MarchingCubes.CubeEdges = [
                    new IndexPair(MarchingCubes.CubeVertices[0], MarchingCubes.CubeVertices[1]),
                    new IndexPair(MarchingCubes.CubeVertices[1], MarchingCubes.CubeVertices[2]),
                    new IndexPair(MarchingCubes.CubeVertices[2], MarchingCubes.CubeVertices[3]),
                    new IndexPair(MarchingCubes.CubeVertices[3], MarchingCubes.CubeVertices[0]),
                    new IndexPair(MarchingCubes.CubeVertices[4], MarchingCubes.CubeVertices[5]),
                    new IndexPair(MarchingCubes.CubeVertices[5], MarchingCubes.CubeVertices[6]),
                    new IndexPair(MarchingCubes.CubeVertices[6], MarchingCubes.CubeVertices[7]),
                    new IndexPair(MarchingCubes.CubeVertices[7], MarchingCubes.CubeVertices[4]),
                    new IndexPair(MarchingCubes.CubeVertices[0], MarchingCubes.CubeVertices[4]),
                    new IndexPair(MarchingCubes.CubeVertices[1], MarchingCubes.CubeVertices[5]),
                    new IndexPair(MarchingCubes.CubeVertices[2], MarchingCubes.CubeVertices[6]),
                    new IndexPair(MarchingCubes.CubeVertices[3], MarchingCubes.CubeVertices[7]),
                ];
                MarchingCubes.EdgeIdInfo = [
                    { i: 0, j: 0, k: 0, e: 0 },
                    { i: 1, j: 0, k: 0, e: 1 },
                    { i: 0, j: 1, k: 0, e: 0 },
                    { i: 0, j: 0, k: 0, e: 1 },
                    { i: 0, j: 0, k: 1, e: 0 },
                    { i: 1, j: 0, k: 1, e: 1 },
                    { i: 0, j: 1, k: 1, e: 0 },
                    { i: 0, j: 0, k: 1, e: 1 },
                    { i: 0, j: 0, k: 0, e: 2 },
                    { i: 1, j: 0, k: 0, e: 2 },
                    { i: 1, j: 1, k: 0, e: 2 },
                    { i: 0, j: 1, k: 0, e: 2 }
                ];
                // export var EdgeIdInfo = [
                //     { i: 0, j: 0, k: 0, e: 0 },
                //     { i: 1, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 1, k: 0, e: 0 },
                //     { i: 0, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 0, k: 0, e: 0 },
                //     { i: 1, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 1, k: 0, e: 0 },
                //     { i: 0, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 0, k: 0, e: 0 },
                //     { i: 1, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 1, k: 0, e: 0 },
                //     { i: 0, j: 0, k: 0, e: 1 },
                // ];
                // Tables EdgeTable and TriTable taken from http://paulbourke.net/geometry/polygonise/
                MarchingCubes.EdgeTable = [
                    0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
                    0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
                    0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
                    0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
                    0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
                    0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
                    0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
                    0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
                    0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
                    0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
                    0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
                    0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
                    0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
                    0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
                    0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
                    0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
                    0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
                    0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
                    0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
                    0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
                    0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
                    0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
                    0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
                    0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
                    0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
                    0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
                    0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
                    0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
                    0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
                    0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
                    0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
                    0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
                ];
                MarchingCubes.TriTable = [
                    [],
                    [0, 8, 3],
                    [0, 1, 9],
                    [1, 8, 3, 9, 8, 1],
                    [1, 2, 10],
                    [0, 8, 3, 1, 2, 10],
                    [9, 2, 10, 0, 2, 9],
                    [2, 8, 3, 2, 10, 8, 10, 9, 8],
                    [3, 11, 2],
                    [0, 11, 2, 8, 11, 0],
                    [1, 9, 0, 2, 3, 11],
                    [1, 11, 2, 1, 9, 11, 9, 8, 11],
                    [3, 10, 1, 11, 10, 3],
                    [0, 10, 1, 0, 8, 10, 8, 11, 10],
                    [3, 9, 0, 3, 11, 9, 11, 10, 9],
                    [9, 8, 10, 10, 8, 11],
                    [4, 7, 8],
                    [4, 3, 0, 7, 3, 4],
                    [0, 1, 9, 8, 4, 7],
                    [4, 1, 9, 4, 7, 1, 7, 3, 1],
                    [1, 2, 10, 8, 4, 7],
                    [3, 4, 7, 3, 0, 4, 1, 2, 10],
                    [9, 2, 10, 9, 0, 2, 8, 4, 7],
                    [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
                    [8, 4, 7, 3, 11, 2],
                    [11, 4, 7, 11, 2, 4, 2, 0, 4],
                    [9, 0, 1, 8, 4, 7, 2, 3, 11],
                    [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
                    [3, 10, 1, 3, 11, 10, 7, 8, 4],
                    [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
                    [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
                    [4, 7, 11, 4, 11, 9, 9, 11, 10],
                    [9, 5, 4],
                    [9, 5, 4, 0, 8, 3],
                    [0, 5, 4, 1, 5, 0],
                    [8, 5, 4, 8, 3, 5, 3, 1, 5],
                    [1, 2, 10, 9, 5, 4],
                    [3, 0, 8, 1, 2, 10, 4, 9, 5],
                    [5, 2, 10, 5, 4, 2, 4, 0, 2],
                    [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
                    [9, 5, 4, 2, 3, 11],
                    [0, 11, 2, 0, 8, 11, 4, 9, 5],
                    [0, 5, 4, 0, 1, 5, 2, 3, 11],
                    [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
                    [10, 3, 11, 10, 1, 3, 9, 5, 4],
                    [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
                    [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
                    [5, 4, 8, 5, 8, 10, 10, 8, 11],
                    [9, 7, 8, 5, 7, 9],
                    [9, 3, 0, 9, 5, 3, 5, 7, 3],
                    [0, 7, 8, 0, 1, 7, 1, 5, 7],
                    [1, 5, 3, 3, 5, 7],
                    [9, 7, 8, 9, 5, 7, 10, 1, 2],
                    [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
                    [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
                    [2, 10, 5, 2, 5, 3, 3, 5, 7],
                    [7, 9, 5, 7, 8, 9, 3, 11, 2],
                    [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
                    [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
                    [11, 2, 1, 11, 1, 7, 7, 1, 5],
                    [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
                    [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
                    [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
                    [11, 10, 5, 7, 11, 5],
                    [10, 6, 5],
                    [0, 8, 3, 5, 10, 6],
                    [9, 0, 1, 5, 10, 6],
                    [1, 8, 3, 1, 9, 8, 5, 10, 6],
                    [1, 6, 5, 2, 6, 1],
                    [1, 6, 5, 1, 2, 6, 3, 0, 8],
                    [9, 6, 5, 9, 0, 6, 0, 2, 6],
                    [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
                    [2, 3, 11, 10, 6, 5],
                    [11, 0, 8, 11, 2, 0, 10, 6, 5],
                    [0, 1, 9, 2, 3, 11, 5, 10, 6],
                    [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
                    [6, 3, 11, 6, 5, 3, 5, 1, 3],
                    [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
                    [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
                    [6, 5, 9, 6, 9, 11, 11, 9, 8],
                    [5, 10, 6, 4, 7, 8],
                    [4, 3, 0, 4, 7, 3, 6, 5, 10],
                    [1, 9, 0, 5, 10, 6, 8, 4, 7],
                    [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
                    [6, 1, 2, 6, 5, 1, 4, 7, 8],
                    [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
                    [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
                    [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
                    [3, 11, 2, 7, 8, 4, 10, 6, 5],
                    [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
                    [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
                    [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
                    [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6],
                    [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11],
                    [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7],
                    [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9],
                    [10, 4, 9, 6, 4, 10],
                    [4, 10, 6, 4, 9, 10, 0, 8, 3],
                    [10, 0, 1, 10, 6, 0, 6, 4, 0],
                    [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
                    [1, 4, 9, 1, 2, 4, 2, 6, 4],
                    [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
                    [0, 2, 4, 4, 2, 6],
                    [8, 3, 2, 8, 2, 4, 4, 2, 6],
                    [10, 4, 9, 10, 6, 4, 11, 2, 3],
                    [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
                    [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
                    [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
                    [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
                    [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
                    [3, 11, 6, 3, 6, 0, 0, 6, 4],
                    [6, 4, 8, 11, 6, 8],
                    [7, 10, 6, 7, 8, 10, 8, 9, 10],
                    [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
                    [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
                    [10, 6, 7, 10, 7, 1, 1, 7, 3],
                    [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
                    [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
                    [7, 8, 0, 7, 0, 6, 6, 0, 2],
                    [7, 3, 2, 6, 7, 2],
                    [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
                    [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
                    [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
                    [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
                    [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
                    [0, 9, 1, 11, 6, 7],
                    [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
                    [7, 11, 6],
                    [7, 6, 11],
                    [3, 0, 8, 11, 7, 6],
                    [0, 1, 9, 11, 7, 6],
                    [8, 1, 9, 8, 3, 1, 11, 7, 6],
                    [10, 1, 2, 6, 11, 7],
                    [1, 2, 10, 3, 0, 8, 6, 11, 7],
                    [2, 9, 0, 2, 10, 9, 6, 11, 7],
                    [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
                    [7, 2, 3, 6, 2, 7],
                    [7, 0, 8, 7, 6, 0, 6, 2, 0],
                    [2, 7, 6, 2, 3, 7, 0, 1, 9],
                    [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
                    [10, 7, 6, 10, 1, 7, 1, 3, 7],
                    [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
                    [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
                    [7, 6, 10, 7, 10, 8, 8, 10, 9],
                    [6, 8, 4, 11, 8, 6],
                    [3, 6, 11, 3, 0, 6, 0, 4, 6],
                    [8, 6, 11, 8, 4, 6, 9, 0, 1],
                    [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
                    [6, 8, 4, 6, 11, 8, 2, 10, 1],
                    [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
                    [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
                    [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
                    [8, 2, 3, 8, 4, 2, 4, 6, 2],
                    [0, 4, 2, 4, 6, 2],
                    [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
                    [1, 9, 4, 1, 4, 2, 2, 4, 6],
                    [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
                    [10, 1, 0, 10, 0, 6, 6, 0, 4],
                    [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
                    [10, 9, 4, 6, 10, 4],
                    [4, 9, 5, 7, 6, 11],
                    [0, 8, 3, 4, 9, 5, 11, 7, 6],
                    [5, 0, 1, 5, 4, 0, 7, 6, 11],
                    [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
                    [9, 5, 4, 10, 1, 2, 7, 6, 11],
                    [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
                    [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
                    [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
                    [7, 2, 3, 7, 6, 2, 5, 4, 9],
                    [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
                    [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
                    [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
                    [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
                    [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
                    [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
                    [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
                    [6, 9, 5, 6, 11, 9, 11, 8, 9],
                    [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
                    [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
                    [6, 11, 3, 6, 3, 5, 5, 3, 1],
                    [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
                    [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
                    [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
                    [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
                    [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
                    [9, 5, 6, 9, 6, 0, 0, 6, 2],
                    [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
                    [1, 5, 6, 2, 1, 6],
                    [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
                    [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
                    [0, 3, 8, 5, 6, 10],
                    [10, 5, 6],
                    [11, 5, 10, 7, 5, 11],
                    [11, 5, 10, 11, 7, 5, 8, 3, 0],
                    [5, 11, 7, 5, 10, 11, 1, 9, 0],
                    [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
                    [11, 1, 2, 11, 7, 1, 7, 5, 1],
                    [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
                    [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
                    [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
                    [2, 5, 10, 2, 3, 5, 3, 7, 5],
                    [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
                    [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
                    [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
                    [1, 3, 5, 3, 7, 5],
                    [0, 8, 7, 0, 7, 1, 1, 7, 5],
                    [9, 0, 3, 9, 3, 5, 5, 3, 7],
                    [9, 8, 7, 5, 9, 7],
                    [5, 8, 4, 5, 10, 8, 10, 11, 8],
                    [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
                    [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
                    [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
                    [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
                    [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
                    [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
                    [9, 4, 5, 2, 11, 3],
                    [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
                    [5, 10, 2, 5, 2, 4, 4, 2, 0],
                    [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
                    [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
                    [8, 4, 5, 8, 5, 3, 3, 5, 1],
                    [0, 4, 5, 1, 0, 5],
                    [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
                    [9, 4, 5],
                    [4, 11, 7, 4, 9, 11, 9, 10, 11],
                    [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
                    [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
                    [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
                    [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
                    [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
                    [11, 7, 4, 11, 4, 2, 2, 4, 0],
                    [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
                    [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
                    [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
                    [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
                    [1, 10, 2, 8, 7, 4],
                    [4, 9, 1, 4, 1, 7, 7, 1, 3],
                    [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
                    [4, 0, 3, 7, 4, 3],
                    [4, 8, 7],
                    [9, 10, 8, 10, 11, 8],
                    [3, 0, 9, 3, 9, 11, 11, 9, 10],
                    [0, 1, 10, 0, 10, 8, 8, 10, 11],
                    [3, 1, 10, 11, 3, 10],
                    [1, 2, 11, 1, 11, 9, 9, 11, 8],
                    [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
                    [0, 2, 11, 8, 0, 11],
                    [3, 2, 11],
                    [2, 3, 8, 2, 8, 10, 10, 8, 9],
                    [9, 10, 2, 0, 9, 2],
                    [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
                    [1, 10, 2],
                    [1, 3, 8, 9, 1, 8],
                    [0, 9, 1],
                    [0, 3, 8],
                    []
                ];
            })(MarchingCubes = Geometry.MarchingCubes || (Geometry.MarchingCubes = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var MolecularSurface;
            (function (MolecularSurface) {
                "use strict";
                var MolecularIsoSurfaceParametersWrapper = (function () {
                    function MolecularIsoSurfaceParametersWrapper(params) {
                        Core.Utils.extend(this, params, {
                            exactBoundary: false,
                            boundaryDelta: { dx: 1.5, dy: 1.5, dz: 1.5 },
                            probeRadius: 1.4,
                            atomRadii: function () { return 1.0; },
                            density: 1.1,
                            interactive: false,
                            smoothingIterations: 1
                        });
                        if (this.exactBoundary)
                            this.boundaryDelta = { dx: 0, dy: 0, dz: 0 };
                        if (this.density < 0.3)
                            this.density = 0.3;
                        //if (this.probeRadius < 0) this.probeRadius = 0;
                    }
                    return MolecularIsoSurfaceParametersWrapper;
                }());
                var MolecularIsoFieldComputation = (function () {
                    function MolecularIsoFieldComputation(inputParameters, ctx) {
                        this.inputParameters = inputParameters;
                        this.ctx = ctx;
                        this.minX = Number.MAX_VALUE;
                        this.minY = Number.MAX_VALUE;
                        this.minZ = Number.MAX_VALUE;
                        this.maxX = -Number.MAX_VALUE;
                        this.maxY = -Number.MAX_VALUE;
                        this.maxZ = -Number.MAX_VALUE;
                        this.nX = 0;
                        this.nY = 0;
                        this.nZ = 0;
                        this.dX = 0.1;
                        this.dY = 0.1;
                        this.dZ = 0.1;
                        this.field = new Float32Array(0);
                        this.distanceField = new Float32Array(0);
                        this.proximityMap = new Int32Array(0);
                        this.minIndex = { i: 0, j: 0, k: 0 };
                        this.maxIndex = { i: 0, j: 0, k: 0 };
                        this.parameters = new MolecularIsoSurfaceParametersWrapper(inputParameters.parameters);
                        var positions = inputParameters.positions;
                        this.x = positions.x;
                        this.y = positions.y;
                        this.z = positions.z;
                        this.atomIndices = inputParameters.atomIndices;
                    }
                    MolecularIsoFieldComputation.prototype.findBounds = function () {
                        for (var _i = 0, _a = this.atomIndices; _i < _a.length; _i++) {
                            var aI = _a[_i];
                            var r = this.parameters.exactBoundary ? 0 : this.parameters.atomRadius(aI) + this.parameters.probeRadius, xx = this.x[aI], yy = this.y[aI], zz = this.z[aI];
                            if (r < 0)
                                continue;
                            this.minX = Math.min(this.minX, xx - r);
                            this.minY = Math.min(this.minY, yy - r);
                            this.minZ = Math.min(this.minZ, zz - r);
                            this.maxX = Math.max(this.maxX, xx + r);
                            this.maxY = Math.max(this.maxY, yy + r);
                            this.maxZ = Math.max(this.maxZ, zz + r);
                        }
                        if (this.minX === Number.MAX_VALUE) {
                            this.minX = this.minY = this.minZ = -1;
                            this.maxX = this.maxY = this.maxZ = 1;
                        }
                        this.minX -= this.parameters.boundaryDelta.dx;
                        this.minY -= this.parameters.boundaryDelta.dy;
                        this.minZ -= this.parameters.boundaryDelta.dz;
                        this.maxX += this.parameters.boundaryDelta.dx;
                        this.maxY += this.parameters.boundaryDelta.dy;
                        this.maxZ += this.parameters.boundaryDelta.dz;
                        this.nX = Math.floor((this.maxX - this.minX) * this.parameters.density);
                        this.nY = Math.floor((this.maxY - this.minY) * this.parameters.density);
                        this.nZ = Math.floor((this.maxZ - this.minZ) * this.parameters.density);
                        this.nX = Math.min(this.nX, 333);
                        this.nY = Math.min(this.nY, 333);
                        this.nZ = Math.min(this.nZ, 333);
                        this.dX = (this.maxX - this.minX) / (this.nX - 1);
                        this.dY = (this.maxY - this.minY) / (this.nY - 1);
                        this.dZ = (this.maxZ - this.minZ) / (this.nZ - 1);
                    };
                    MolecularIsoFieldComputation.prototype.initData = function () {
                        var len = this.nX * this.nY * this.nZ;
                        this.field = new Float32Array(len);
                        this.distanceField = new Float32Array(len);
                        this.proximityMap = new Int32Array(len);
                        var mv = Number.POSITIVE_INFINITY;
                        for (var j = 0, _b = this.proximityMap.length; j < _b; j++) {
                            this.distanceField[j] = mv;
                            this.proximityMap[j] = -1;
                        }
                    };
                    MolecularIsoFieldComputation.prototype.updateMinIndex = function (x, y, z) {
                        this.minIndex.i = Math.max((Math.floor((x - this.minX) / this.dX)) | 0, 0);
                        this.minIndex.j = Math.max((Math.floor((y - this.minY) / this.dY)) | 0, 0);
                        this.minIndex.k = Math.max((Math.floor((z - this.minZ) / this.dZ)) | 0, 0);
                    };
                    MolecularIsoFieldComputation.prototype.updateMaxIndex = function (x, y, z) {
                        this.maxIndex.i = Math.min((Math.ceil((x - this.minX) / this.dX)) | 0, this.nX);
                        this.maxIndex.j = Math.min((Math.ceil((y - this.minY) / this.dY)) | 0, this.nY);
                        this.maxIndex.k = Math.min((Math.ceil((z - this.minZ) / this.dZ)) | 0, this.nZ);
                    };
                    MolecularIsoFieldComputation.prototype.addBall = function (aI, strength) {
                        var strSq = strength * strength;
                        var cx = this.x[aI], cy = this.y[aI], cz = this.z[aI];
                        this.updateMinIndex(cx - strength, cy - strength, cz - strength);
                        this.updateMaxIndex(cx + strength, cy + strength, cz + strength);
                        var mini = this.minIndex.i, minj = this.minIndex.j, mink = this.minIndex.k;
                        var maxi = this.maxIndex.i, maxj = this.maxIndex.j, maxk = this.maxIndex.k;
                        cx = this.minX - cx;
                        cy = this.minY - cy;
                        cz = this.minZ - cz;
                        for (var k = mink; k < maxk; k++) {
                            var tZ = cz + k * this.dZ, zz = tZ * tZ, oZ = k * this.nY;
                            for (var j = minj; j < maxj; j++) {
                                var tY = cy + j * this.dY, yy = zz + tY * tY, oY = this.nX * (oZ + j);
                                for (var i = mini; i < maxi; i++) {
                                    var tX = cx + i * this.dX, xx = yy + tX * tX, offset = oY + i;
                                    var v = strSq / (0.000001 + xx) - 1;
                                    //let offset = nX * (k * nY + j) + i;
                                    if (xx < this.distanceField[offset]) {
                                        this.proximityMap[offset] = aI;
                                        this.distanceField[offset] = xx;
                                    }
                                    //if (xx >= maxRsq) continue;
                                    //let v = strength / Math.sqrt(0.000001 + zz) - 1;
                                    //v = Math.Exp(-((Dist/AtomRadius)*(Dist/AtomRadius)));
                                    if (v > 0) {
                                        this.field[offset] += v;
                                    }
                                }
                            }
                        }
                    };
                    MolecularIsoFieldComputation.prototype.processChunks = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var chunkSize, started, currentAtom, _b, aI, r, t;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        chunkSize = 10000;
                                        started = Core.Utils.PerformanceMonitor.currentTime();
                                        return [4 /*yield*/, this.ctx.updateProgress('Creating field...', true)];
                                    case 1:
                                        _a.sent();
                                        currentAtom = 0, _b = this.atomIndices.length;
                                        _a.label = 2;
                                    case 2:
                                        if (!(currentAtom < _b)) return [3 /*break*/, 5];
                                        aI = this.atomIndices[currentAtom];
                                        r = this.parameters.atomRadius(aI) + this.parameters.probeRadius;
                                        if (r >= 0) {
                                            this.addBall(aI, r);
                                        }
                                        if (!((currentAtom + 1) % chunkSize === 0)) return [3 /*break*/, 4];
                                        t = Core.Utils.PerformanceMonitor.currentTime();
                                        if (!(t - started > Core.Computation.UpdateProgressDelta)) return [3 /*break*/, 4];
                                        started = t;
                                        return [4 /*yield*/, this.ctx.updateProgress('Creating field...', true, currentAtom, _b)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        currentAtom++;
                                        return [3 /*break*/, 2];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        });
                    };
                    MolecularIsoFieldComputation.prototype.finish = function () {
                        var t = Geometry.LinearAlgebra.Matrix4.empty();
                        Geometry.LinearAlgebra.Matrix4.fromTranslation(t, [this.minX, this.minY, this.minZ]);
                        t[0] = this.dX;
                        t[5] = this.dY;
                        t[10] = this.dZ;
                        var ret = {
                            data: {
                                scalarField: new Core.Formats.Density.Field3DZYX(this.field, [this.nX, this.nY, this.nZ]),
                                annotationField: this.parameters.interactive ? new Core.Formats.Density.Field3DZYX(this.proximityMap, [this.nX, this.nY, this.nZ]) : void 0,
                                isoLevel: 0.05
                            },
                            bottomLeft: { x: this.minX, y: this.minY, z: this.minZ },
                            topRight: { x: this.maxX, y: this.maxY, z: this.maxZ },
                            transform: t,
                            inputParameters: this.inputParameters,
                            parameters: this.parameters
                        };
                        // help the gc
                        this.distanceField = null;
                        this.proximityMap = null;
                        return ret;
                    };
                    MolecularIsoFieldComputation.prototype.run = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.ctx.updateProgress('Initializing...')];
                                    case 1:
                                        _a.sent();
                                        this.findBounds();
                                        this.initData();
                                        return [4 /*yield*/, this.processChunks()];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.ctx.updateProgress('Finalizing...', void 0, this.atomIndices.length, this.atomIndices.length)];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, this.finish()];
                                }
                            });
                        });
                    };
                    return MolecularIsoFieldComputation;
                }());
                function createMolecularIsoFieldAsync(parameters) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var field;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    field = new MolecularIsoFieldComputation(parameters, ctx);
                                    return [4 /*yield*/, field.run()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); });
                }
                MolecularSurface.createMolecularIsoFieldAsync = createMolecularIsoFieldAsync;
                function computeMolecularSurfaceAsync(parameters) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var field, surface, smoothing;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, createMolecularIsoFieldAsync(parameters).run(ctx)];
                                case 1:
                                    field = _a.sent();
                                    return [4 /*yield*/, Geometry.MarchingCubes.compute(field.data).run(ctx)];
                                case 2:
                                    surface = _a.sent();
                                    return [4 /*yield*/, Geometry.Surface.transform(surface, field.transform).run(ctx)];
                                case 3:
                                    surface = _a.sent();
                                    smoothing = (parameters.parameters && parameters.parameters.smoothingIterations) || 1;
                                    return [4 /*yield*/, Geometry.Surface.laplacianSmooth(surface, smoothing).run(ctx)];
                                case 4:
                                    surface = _a.sent();
                                    return [2 /*return*/, { surface: surface, usedParameters: field.parameters }];
                            }
                        });
                    }); });
                }
                MolecularSurface.computeMolecularSurfaceAsync = computeMolecularSurfaceAsync;
            })(MolecularSurface = Geometry.MolecularSurface || (Geometry.MolecularSurface = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            "use strict";
            var DataTable = Core.Utils.DataTable;
            var ComponentBondInfoEntry = (function () {
                function ComponentBondInfoEntry(id) {
                    this.id = id;
                    this.map = Core.Utils.FastMap.create();
                }
                ComponentBondInfoEntry.prototype.add = function (a, b, order, swap) {
                    if (swap === void 0) { swap = true; }
                    var e = this.map.get(a);
                    if (e !== void 0) {
                        var f = e.get(b);
                        if (f === void 0) {
                            e.set(b, order);
                        }
                    }
                    else {
                        var map = Core.Utils.FastMap.create();
                        map.set(b, order);
                        this.map.set(a, map);
                    }
                    if (swap)
                        this.add(b, a, order, false);
                };
                return ComponentBondInfoEntry;
            }());
            Structure.ComponentBondInfoEntry = ComponentBondInfoEntry;
            var ComponentBondInfo = (function () {
                function ComponentBondInfo() {
                    this.entries = Core.Utils.FastMap.create();
                }
                ComponentBondInfo.prototype.newEntry = function (id) {
                    var e = new ComponentBondInfoEntry(id);
                    this.entries.set(id, e);
                    return e;
                };
                return ComponentBondInfo;
            }());
            Structure.ComponentBondInfo = ComponentBondInfo;
            /**
             * Identifier for a reside that is a part of the polymer.
             */
            var PolyResidueIdentifier = (function () {
                function PolyResidueIdentifier(asymId, seqNumber, insCode) {
                    this.asymId = asymId;
                    this.seqNumber = seqNumber;
                    this.insCode = insCode;
                }
                PolyResidueIdentifier.areEqual = function (a, index, bAsymId, bSeqNumber, bInsCode) {
                    return a.asymId === bAsymId[index]
                        && a.seqNumber === bSeqNumber[index]
                        && a.insCode === bInsCode[index];
                };
                PolyResidueIdentifier.compare = function (a, b) {
                    if (a.asymId === b.asymId) {
                        if (a.seqNumber === b.seqNumber) {
                            if (a.insCode === b.insCode)
                                return 0;
                            if (a.insCode === void 0)
                                return -1;
                            if (b.insCode === void 0)
                                return 1;
                            return a.insCode < b.insCode ? -1 : 1;
                        }
                        return a.seqNumber < b.seqNumber ? -1 : 1;
                    }
                    return a.asymId < b.asymId ? -1 : 1;
                };
                PolyResidueIdentifier.compareResidue = function (a, index, bAsymId, bSeqNumber, bInsCode) {
                    if (a.asymId === bAsymId[index]) {
                        if (a.seqNumber === bSeqNumber[index]) {
                            if (a.insCode === bInsCode[index])
                                return 0;
                            if (a.insCode === void 0)
                                return -1;
                            if (bInsCode[index] === void 0)
                                return 1;
                            return a.insCode < bInsCode[index] ? -1 : 1;
                        }
                        return a.seqNumber < bSeqNumber[index] ? -1 : 1;
                    }
                    return a.asymId < bAsymId[index] ? -1 : 1;
                };
                return PolyResidueIdentifier;
            }());
            Structure.PolyResidueIdentifier = PolyResidueIdentifier;
            var SecondaryStructureElement = (function () {
                function SecondaryStructureElement(type, startResidueId, endResidueId, info) {
                    if (info === void 0) { info = {}; }
                    this.type = type;
                    this.startResidueId = startResidueId;
                    this.endResidueId = endResidueId;
                    this.info = info;
                    this.startResidueIndex = -1;
                    this.endResidueIndex = -1;
                }
                Object.defineProperty(SecondaryStructureElement.prototype, "length", {
                    get: function () {
                        return this.endResidueIndex - this.startResidueIndex;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SecondaryStructureElement;
            }());
            Structure.SecondaryStructureElement = SecondaryStructureElement;
            var SymmetryInfo = (function () {
                function SymmetryInfo(spacegroupName, cellSize, cellAngles, toFracTransform, isNonStandardCrytalFrame) {
                    this.spacegroupName = spacegroupName;
                    this.cellSize = cellSize;
                    this.cellAngles = cellAngles;
                    this.toFracTransform = toFracTransform;
                    this.isNonStandardCrytalFrame = isNonStandardCrytalFrame;
                }
                return SymmetryInfo;
            }());
            Structure.SymmetryInfo = SymmetryInfo;
            /**
             * Wraps an assembly operator.
             */
            var AssemblyOperator = (function () {
                function AssemblyOperator(id, name, operator) {
                    this.id = id;
                    this.name = name;
                    this.operator = operator;
                }
                return AssemblyOperator;
            }());
            Structure.AssemblyOperator = AssemblyOperator;
            /**
             * Wraps a single assembly gen entry.
             */
            var AssemblyGenEntry = (function () {
                function AssemblyGenEntry(operators, asymIds) {
                    this.operators = operators;
                    this.asymIds = asymIds;
                }
                return AssemblyGenEntry;
            }());
            Structure.AssemblyGenEntry = AssemblyGenEntry;
            /**
             * Wraps an assembly generation template.
             */
            var AssemblyGen = (function () {
                function AssemblyGen(name) {
                    this.name = name;
                    this.gens = [];
                }
                return AssemblyGen;
            }());
            Structure.AssemblyGen = AssemblyGen;
            /**
             * Information about the assemblies.
             */
            var AssemblyInfo = (function () {
                function AssemblyInfo(operators, assemblies) {
                    this.operators = operators;
                    this.assemblies = assemblies;
                }
                return AssemblyInfo;
            }());
            Structure.AssemblyInfo = AssemblyInfo;
            /**
             * Default Builders
             */
            var Tables;
            (function (Tables) {
                var int32 = DataTable.typedColumn(Int32Array);
                var float32 = DataTable.typedColumn(Float32Array);
                var str = DataTable.stringColumn;
                var nullStr = DataTable.stringNullColumn;
                Tables.Positions = {
                    x: float32,
                    y: float32,
                    z: float32
                };
                Tables.Atoms = {
                    id: int32,
                    altLoc: str,
                    residueIndex: int32,
                    chainIndex: int32,
                    entityIndex: int32,
                    name: str,
                    elementSymbol: str,
                    occupancy: float32,
                    tempFactor: float32,
                    authName: str,
                    rowIndex: int32
                };
                Tables.Residues = {
                    name: str,
                    seqNumber: int32,
                    asymId: str,
                    authName: str,
                    authSeqNumber: int32,
                    authAsymId: str,
                    insCode: nullStr,
                    entityId: str,
                    isHet: DataTable.typedColumn(Int8Array),
                    atomStartIndex: int32,
                    atomEndIndex: int32,
                    chainIndex: int32,
                    entityIndex: int32,
                    secondaryStructureIndex: int32
                };
                Tables.Chains = {
                    asymId: str,
                    entityId: str,
                    authAsymId: str,
                    atomStartIndex: int32,
                    atomEndIndex: int32,
                    residueStartIndex: int32,
                    residueEndIndex: int32,
                    entityIndex: int32,
                    sourceChainIndex: void 0,
                    operatorIndex: void 0
                };
                Tables.Entities = {
                    entityId: str,
                    type: DataTable.customColumn(),
                    atomStartIndex: int32,
                    atomEndIndex: int32,
                    residueStartIndex: int32,
                    residueEndIndex: int32,
                    chainStartIndex: int32,
                    chainEndIndex: int32
                };
                Tables.Bonds = {
                    atomAIndex: int32,
                    atomBIndex: int32,
                    type: DataTable.typedColumn(Int8Array)
                };
            })(Tables = Structure.Tables || (Structure.Tables = {}));
            var Operator = (function () {
                function Operator(matrix, id, isIdentity) {
                    this.matrix = matrix;
                    this.id = id;
                    this.isIdentity = isIdentity;
                }
                Operator.prototype.apply = function (v) {
                    Core.Geometry.LinearAlgebra.Matrix4.transformVector3(v, v, this.matrix);
                };
                Operator.applyToModelUnsafe = function (matrix, m) {
                    var v = { x: 0.1, y: 0.1, z: 0.1 };
                    var _a = m.positions, x = _a.x, y = _a.y, z = _a.z;
                    for (var i = 0, _b = m.positions.count; i < _b; i++) {
                        v.x = x[i];
                        v.y = y[i];
                        v.z = z[i];
                        Core.Geometry.LinearAlgebra.Matrix4.transformVector3(v, v, matrix);
                        x[i] = v.x;
                        y[i] = v.y;
                        z[i] = v.z;
                    }
                };
                return Operator;
            }());
            Structure.Operator = Operator;
            var Molecule;
            (function (Molecule) {
                function create(id, models, properties) {
                    if (properties === void 0) { properties = {}; }
                    return { id: id, models: models, properties: properties };
                }
                Molecule.create = create;
                var Model;
                (function (Model) {
                    function create(model) {
                        var ret = Core.Utils.extend({}, model);
                        var queryContext = void 0;
                        Object.defineProperty(ret, 'queryContext', { enumerable: true, configurable: false, get: function () {
                                if (queryContext)
                                    return queryContext;
                                queryContext = Structure.Query.Context.ofStructure(ret);
                                return queryContext;
                            } });
                        return ret;
                    }
                    Model.create = create;
                    var Source;
                    (function (Source) {
                        Source[Source["File"] = 0] = "File";
                        Source[Source["Computed"] = 1] = "Computed";
                    })(Source = Model.Source || (Model.Source = {}));
                    function withTransformedXYZ(model, ctx, transform) {
                        var _a = model.positions, x = _a.x, y = _a.y, z = _a.z;
                        var tAtoms = model.positions.getBuilder(model.positions.count).seal();
                        var tX = tAtoms.x, tY = tAtoms.y, tZ = tAtoms.z;
                        var t = { x: 0.0, y: 0.0, z: 0.0 };
                        for (var i = 0, _l = model.positions.count; i < _l; i++) {
                            transform(ctx, x[i], y[i], z[i], t);
                            tX[i] = t.x;
                            tY[i] = t.y;
                            tZ[i] = t.z;
                        }
                        return create({
                            id: model.id,
                            modelId: model.modelId,
                            data: model.data,
                            positions: tAtoms,
                            parent: model.parent,
                            source: model.source,
                            operators: model.operators
                        });
                    }
                    Model.withTransformedXYZ = withTransformedXYZ;
                })(Model = Molecule.Model || (Molecule.Model = {}));
            })(Molecule = Structure.Molecule || (Structure.Molecule = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            "use strict";
            var Mat4 = Core.Geometry.LinearAlgebra.Matrix4;
            var Vec4 = Core.Geometry.LinearAlgebra.Vector4;
            var Spacegroup = (function () {
                function Spacegroup(info) {
                    this.info = info;
                    this.temp = Mat4.empty();
                    this.tempV = new Float64Array(4);
                    if (SpacegroupTables.Spacegroup[info.spacegroupName] === void 0) {
                        throw "'" + info.spacegroupName + "' is not a spacegroup recognized by the library.";
                    }
                    this.space = this.getSpace();
                    this.operators = this.getOperators();
                }
                Object.defineProperty(Spacegroup.prototype, "operatorCount", {
                    get: function () {
                        return this.operators.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                Spacegroup.prototype.getOperatorMatrix = function (index, i, j, k, target) {
                    this.tempV[0] = i;
                    this.tempV[1] = j;
                    this.tempV[2] = k;
                    Mat4.fromTranslation(this.temp, this.tempV);
                    Mat4.mul(target, Mat4.mul(target, Mat4.mul(target, this.space.fromFrac, this.temp), this.operators[index]), this.space.toFrac);
                    return target;
                    //this.temp.setPosition(this.tempV.set(i, j, k));
                    //return target.copy(this.space.fromFrac).multiply(this.temp).multiply(this.operators[index]).multiply(this.space.toFrac);
                };
                Spacegroup.prototype.getSpace = function () {
                    var toFrac = this.info.toFracTransform, fromFrac = Mat4.empty();
                    Mat4.invert(fromFrac, toFrac);
                    return {
                        toFrac: toFrac,
                        fromFrac: fromFrac,
                        baseX: Vec4.transform(Vec4.create(), Vec4.fromValues(1, 0, 0, 1), toFrac),
                        baseY: Vec4.transform(Vec4.create(), Vec4.fromValues(0, 1, 0, 1), toFrac),
                        baseZ: Vec4.transform(Vec4.create(), Vec4.fromValues(0, 0, 1, 1), toFrac)
                    };
                };
                Spacegroup.getOperator = function (ids) {
                    var r1 = SpacegroupTables.Transform[ids[0]], r2 = SpacegroupTables.Transform[ids[1]], r3 = SpacegroupTables.Transform[ids[2]];
                    return Mat4.ofRows([r1, r2, r3, [0, 0, 0, 1]]);
                };
                Spacegroup.prototype.getOperators = function () {
                    var group = SpacegroupTables.Group[SpacegroupTables.Spacegroup[this.info.spacegroupName]];
                    return group.map(function (i) { return Spacegroup.getOperator(SpacegroupTables.Operator[i]); });
                };
                return Spacegroup;
            }());
            Structure.Spacegroup = Spacegroup;
            var SpacegroupTables;
            (function (SpacegroupTables) {
                SpacegroupTables.Transform = [
                    [1.0, 0.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0, 0.0],
                    [0.0, 0.0, 1.0, 0.0],
                    [-1.0, 0.0, 0.0, 0.0],
                    [0.0, -1.0, 0.0, 0.0],
                    [0.0, 0.0, -1.0, 0.0],
                    [0.0, 1.0, 0.0, 0.5],
                    [1.0, 0.0, 0.0, 0.5],
                    [-1.0, 0.0, 0.0, 0.5],
                    [0.0, 0.0, 1.0, 0.5],
                    [0.0, -1.0, 0.0, 0.5],
                    [0.0, 0.0, -1.0, 0.5],
                    [1.0, 0.0, 0.0, 0.25],
                    [0.0, -1.0, 0.0, 0.25],
                    [0.0, 0.0, 1.0, 0.25],
                    [-1.0, 0.0, 0.0, 0.25],
                    [0.0, 1.0, 0.0, 0.25],
                    [0.0, -1.0, 0.0, 0.75],
                    [0.0, 0.0, 1.0, 0.75],
                    [0.0, 1.0, 0.0, 0.75],
                    [1.0, 0.0, 0.0, 0.75],
                    [-1.0, 0.0, 0.0, 0.75],
                    [0.0, 0.0, -1.0, 0.25],
                    [0.0, 0.0, -1.0, 0.75],
                    [1.0, -1.0, 0.0, 0.0],
                    [-1.0, 1.0, 0.0, 0.0],
                    [0.0, 0.0, 1.0, 0.333333333333333],
                    [0.0, 0.0, 1.0, 0.666666666666667],
                    [1.0, 0.0, 0.0, 0.666666666666667],
                    [0.0, 1.0, 0.0, 0.333333333333333],
                    [0.0, -1.0, 0.0, 0.666666666666667],
                    [1.0, -1.0, 0.0, 0.333333333333333],
                    [-1.0, 1.0, 0.0, 0.666666666666667],
                    [-1.0, 0.0, 0.0, 0.333333333333333],
                    [1.0, 0.0, 0.0, 0.333333333333333],
                    [0.0, 1.0, 0.0, 0.666666666666667],
                    [0.0, -1.0, 0.0, 0.333333333333333],
                    [1.0, -1.0, 0.0, 0.666666666666667],
                    [-1.0, 1.0, 0.0, 0.333333333333333],
                    [-1.0, 0.0, 0.0, 0.666666666666667],
                    [0.0, 0.0, -1.0, 0.333333333333333],
                    [0.0, 0.0, -1.0, 0.666666666666667],
                    [0.0, 0.0, 1.0, 0.833333333333333],
                    [0.0, 0.0, 1.0, 0.166666666666667],
                    [0.0, 0.0, -1.0, 0.833333333333333],
                    [0.0, 0.0, -1.0, 0.166666666666667],
                ];
                SpacegroupTables.Operator = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [3, 1, 5],
                    [3, 6, 5],
                    [7, 6, 2],
                    [8, 6, 5],
                    [0, 4, 2],
                    [0, 4, 9],
                    [7, 10, 2],
                    [7, 10, 9],
                    [0, 10, 2],
                    [8, 10, 5],
                    [3, 1, 11],
                    [3, 6, 11],
                    [0, 10, 9],
                    [8, 6, 11],
                    [3, 4, 2],
                    [0, 4, 5],
                    [3, 4, 9],
                    [7, 10, 5],
                    [8, 4, 9],
                    [8, 10, 9],
                    [8, 10, 2],
                    [0, 6, 9],
                    [3, 10, 9],
                    [0, 10, 11],
                    [7, 1, 9],
                    [8, 1, 11],
                    [7, 4, 11],
                    [7, 6, 9],
                    [7, 10, 11],
                    [3, 10, 2],
                    [8, 1, 5],
                    [0, 4, 11],
                    [3, 1, 2],
                    [3, 1, 9],
                    [7, 4, 2],
                    [8, 1, 2],
                    [8, 1, 9],
                    [3, 6, 9],
                    [7, 4, 9],
                    [8, 6, 2],
                    [8, 6, 9],
                    [3, 6, 2],
                    [12, 13, 14],
                    [15, 16, 14],
                    [12, 17, 18],
                    [15, 19, 18],
                    [20, 13, 18],
                    [21, 16, 18],
                    [20, 17, 14],
                    [21, 19, 14],
                    [0, 1, 5],
                    [8, 10, 11],
                    [7, 6, 11],
                    [7, 6, 5],
                    [8, 4, 2],
                    [7, 4, 5],
                    [7, 1, 5],
                    [7, 1, 11],
                    [0, 10, 5],
                    [0, 1, 11],
                    [0, 6, 11],
                    [0, 6, 5],
                    [3, 10, 11],
                    [8, 4, 11],
                    [15, 13, 22],
                    [12, 16, 22],
                    [15, 17, 23],
                    [12, 19, 23],
                    [21, 13, 23],
                    [20, 16, 23],
                    [21, 17, 22],
                    [20, 19, 22],
                    [4, 0, 2],
                    [1, 3, 2],
                    [4, 0, 14],
                    [1, 3, 18],
                    [4, 0, 9],
                    [1, 3, 9],
                    [4, 0, 18],
                    [1, 3, 14],
                    [10, 7, 9],
                    [6, 8, 9],
                    [4, 7, 14],
                    [6, 3, 18],
                    [10, 0, 18],
                    [1, 8, 14],
                    [1, 3, 5],
                    [4, 0, 5],
                    [6, 8, 11],
                    [10, 7, 11],
                    [1, 3, 11],
                    [4, 0, 11],
                    [10, 7, 2],
                    [6, 8, 2],
                    [3, 10, 22],
                    [7, 1, 23],
                    [8, 4, 23],
                    [0, 6, 22],
                    [1, 0, 5],
                    [4, 3, 5],
                    [1, 0, 23],
                    [4, 3, 22],
                    [10, 7, 14],
                    [6, 8, 18],
                    [8, 6, 22],
                    [7, 10, 23],
                    [4, 3, 11],
                    [1, 0, 11],
                    [1, 0, 22],
                    [4, 3, 23],
                    [10, 7, 18],
                    [6, 8, 14],
                    [8, 6, 23],
                    [7, 10, 22],
                    [6, 7, 11],
                    [10, 8, 11],
                    [8, 1, 23],
                    [0, 10, 22],
                    [3, 6, 22],
                    [7, 4, 23],
                    [4, 3, 2],
                    [1, 0, 2],
                    [10, 8, 2],
                    [6, 7, 2],
                    [4, 3, 9],
                    [1, 0, 9],
                    [10, 8, 9],
                    [6, 7, 9],
                    [4, 8, 14],
                    [6, 0, 18],
                    [10, 3, 18],
                    [1, 7, 14],
                    [4, 8, 18],
                    [6, 0, 14],
                    [10, 3, 14],
                    [1, 7, 18],
                    [6, 7, 5],
                    [10, 8, 5],
                    [6, 8, 5],
                    [10, 7, 5],
                    [8, 1, 22],
                    [0, 10, 23],
                    [3, 6, 23],
                    [7, 4, 22],
                    [4, 24, 2],
                    [25, 3, 2],
                    [4, 24, 26],
                    [25, 3, 27],
                    [4, 24, 27],
                    [25, 3, 26],
                    [28, 29, 26],
                    [30, 31, 26],
                    [32, 33, 26],
                    [34, 35, 27],
                    [36, 37, 27],
                    [38, 39, 27],
                    [2, 0, 1],
                    [1, 2, 0],
                    [1, 25, 5],
                    [24, 0, 5],
                    [39, 36, 40],
                    [35, 38, 40],
                    [37, 34, 40],
                    [33, 30, 41],
                    [29, 32, 41],
                    [31, 28, 41],
                    [5, 3, 4],
                    [4, 5, 3],
                    [25, 1, 5],
                    [0, 24, 5],
                    [24, 4, 5],
                    [3, 25, 5],
                    [4, 3, 41],
                    [25, 1, 40],
                    [24, 4, 41],
                    [3, 25, 40],
                    [4, 3, 40],
                    [25, 1, 41],
                    [24, 4, 40],
                    [3, 25, 41],
                    [35, 34, 40],
                    [37, 36, 40],
                    [39, 38, 40],
                    [29, 28, 41],
                    [31, 30, 41],
                    [33, 32, 41],
                    [3, 5, 4],
                    [5, 4, 3],
                    [25, 1, 2],
                    [0, 24, 2],
                    [24, 4, 2],
                    [3, 25, 2],
                    [25, 1, 9],
                    [0, 24, 9],
                    [24, 4, 9],
                    [3, 25, 9],
                    [30, 33, 26],
                    [32, 29, 26],
                    [28, 31, 26],
                    [36, 39, 27],
                    [38, 35, 27],
                    [34, 37, 27],
                    [0, 2, 1],
                    [2, 1, 0],
                    [30, 33, 42],
                    [32, 29, 42],
                    [28, 31, 42],
                    [36, 39, 43],
                    [38, 35, 43],
                    [34, 37, 43],
                    [7, 9, 6],
                    [9, 6, 7],
                    [25, 1, 11],
                    [0, 24, 11],
                    [24, 4, 11],
                    [3, 25, 11],
                    [35, 34, 44],
                    [37, 36, 44],
                    [39, 38, 44],
                    [29, 28, 45],
                    [31, 30, 45],
                    [33, 32, 45],
                    [8, 11, 10],
                    [11, 10, 8],
                    [1, 25, 2],
                    [24, 0, 2],
                    [1, 25, 42],
                    [24, 0, 43],
                    [1, 25, 43],
                    [24, 0, 42],
                    [1, 25, 27],
                    [24, 0, 26],
                    [1, 25, 26],
                    [24, 0, 27],
                    [1, 25, 9],
                    [24, 0, 9],
                    [4, 24, 5],
                    [25, 3, 5],
                    [4, 24, 11],
                    [25, 3, 11],
                    [1, 0, 40],
                    [4, 3, 44],
                    [0, 24, 45],
                    [1, 0, 41],
                    [4, 3, 45],
                    [0, 24, 44],
                    [0, 24, 40],
                    [0, 24, 41],
                    [2, 3, 4],
                    [5, 3, 1],
                    [5, 0, 4],
                    [4, 2, 3],
                    [1, 5, 3],
                    [4, 5, 0],
                    [2, 7, 6],
                    [2, 8, 10],
                    [5, 8, 6],
                    [5, 7, 10],
                    [1, 9, 7],
                    [4, 9, 8],
                    [1, 11, 8],
                    [4, 11, 7],
                    [9, 0, 6],
                    [9, 3, 10],
                    [11, 3, 6],
                    [11, 0, 10],
                    [6, 2, 7],
                    [10, 2, 8],
                    [6, 5, 8],
                    [10, 5, 7],
                    [9, 7, 1],
                    [9, 8, 4],
                    [11, 8, 1],
                    [11, 7, 4],
                    [6, 9, 0],
                    [10, 9, 3],
                    [6, 11, 3],
                    [10, 11, 0],
                    [9, 7, 6],
                    [9, 8, 10],
                    [11, 8, 6],
                    [11, 7, 10],
                    [6, 9, 7],
                    [10, 9, 8],
                    [6, 11, 8],
                    [10, 11, 7],
                    [2, 3, 10],
                    [5, 8, 1],
                    [11, 0, 4],
                    [10, 2, 3],
                    [1, 5, 8],
                    [4, 11, 0],
                    [5, 0, 1],
                    [2, 0, 4],
                    [2, 3, 1],
                    [1, 5, 0],
                    [4, 2, 0],
                    [1, 2, 3],
                    [11, 8, 10],
                    [11, 7, 6],
                    [9, 7, 10],
                    [9, 8, 6],
                    [10, 11, 8],
                    [6, 11, 7],
                    [10, 9, 7],
                    [6, 9, 8],
                    [5, 8, 10],
                    [5, 7, 6],
                    [2, 7, 10],
                    [2, 8, 6],
                    [4, 11, 8],
                    [1, 11, 7],
                    [4, 9, 7],
                    [1, 9, 8],
                    [11, 3, 10],
                    [11, 0, 6],
                    [9, 0, 10],
                    [9, 3, 6],
                    [10, 5, 8],
                    [6, 5, 7],
                    [10, 2, 7],
                    [6, 2, 8],
                    [11, 8, 4],
                    [11, 7, 1],
                    [9, 7, 4],
                    [9, 8, 1],
                    [10, 11, 3],
                    [6, 11, 0],
                    [10, 9, 0],
                    [6, 9, 3],
                    [22, 15, 13],
                    [22, 12, 16],
                    [14, 12, 13],
                    [14, 15, 16],
                    [13, 22, 15],
                    [16, 22, 12],
                    [13, 14, 12],
                    [16, 14, 15],
                    [22, 21, 17],
                    [22, 20, 19],
                    [14, 20, 17],
                    [14, 21, 19],
                    [13, 23, 21],
                    [16, 23, 20],
                    [13, 18, 20],
                    [16, 18, 21],
                    [23, 15, 17],
                    [23, 12, 19],
                    [18, 12, 17],
                    [18, 15, 19],
                    [17, 22, 21],
                    [19, 22, 20],
                    [17, 14, 20],
                    [19, 14, 21],
                    [23, 21, 13],
                    [23, 20, 16],
                    [18, 20, 13],
                    [18, 21, 16],
                    [17, 23, 15],
                    [19, 23, 12],
                    [17, 18, 12],
                    [19, 18, 15],
                    [5, 0, 6],
                    [2, 7, 4],
                    [9, 3, 1],
                    [6, 5, 0],
                    [4, 2, 7],
                    [1, 9, 3],
                    [0, 2, 4],
                    [3, 2, 1],
                    [0, 5, 1],
                    [2, 1, 3],
                    [2, 4, 0],
                    [5, 1, 0],
                    [7, 9, 10],
                    [8, 9, 6],
                    [7, 11, 6],
                    [9, 6, 8],
                    [9, 10, 7],
                    [11, 6, 7],
                    [1, 7, 11],
                    [4, 8, 11],
                    [1, 8, 9],
                    [4, 7, 9],
                    [0, 9, 10],
                    [3, 9, 6],
                    [3, 11, 10],
                    [0, 11, 6],
                    [2, 6, 8],
                    [2, 10, 7],
                    [5, 6, 7],
                    [5, 10, 8],
                    [6, 0, 11],
                    [10, 3, 11],
                    [6, 3, 9],
                    [10, 0, 9],
                    [7, 2, 10],
                    [8, 2, 6],
                    [8, 5, 10],
                    [7, 5, 6],
                    [9, 1, 8],
                    [9, 4, 7],
                    [11, 1, 7],
                    [11, 4, 8],
                    [7, 9, 4],
                    [8, 9, 1],
                    [8, 11, 4],
                    [7, 11, 1],
                    [9, 6, 3],
                    [9, 10, 0],
                    [11, 6, 0],
                    [11, 10, 3],
                    [19, 12, 23],
                    [13, 15, 22],
                    [16, 21, 18],
                    [17, 20, 14],
                    [20, 14, 17],
                    [21, 18, 16],
                    [15, 22, 13],
                    [12, 23, 19],
                    [18, 16, 21],
                    [14, 17, 20],
                    [23, 19, 12],
                    [22, 13, 15],
                    [19, 20, 22],
                    [13, 21, 23],
                    [16, 15, 14],
                    [17, 12, 18],
                    [20, 18, 13],
                    [21, 14, 19],
                    [15, 23, 17],
                    [12, 22, 16],
                    [18, 19, 15],
                    [14, 13, 12],
                    [23, 16, 20],
                    [22, 17, 21],
                    [16, 12, 22],
                    [17, 15, 23],
                    [19, 21, 14],
                    [13, 20, 18],
                    [12, 14, 13],
                    [15, 18, 19],
                    [21, 22, 17],
                    [20, 23, 16],
                    [14, 16, 15],
                    [18, 17, 12],
                    [22, 19, 20],
                    [23, 13, 21],
                    [16, 20, 23],
                    [17, 21, 22],
                    [19, 15, 18],
                    [13, 12, 14],
                    [12, 18, 17],
                    [15, 14, 16],
                    [21, 23, 13],
                    [20, 22, 19],
                    [14, 19, 21],
                    [18, 13, 20],
                    [22, 16, 12],
                    [23, 17, 15],
                    [19, 12, 22],
                    [17, 21, 23],
                    [16, 15, 18],
                    [13, 20, 14],
                    [20, 14, 13],
                    [15, 18, 16],
                    [21, 23, 17],
                    [12, 22, 19],
                    [18, 16, 15],
                    [14, 13, 20],
                    [22, 19, 12],
                    [23, 17, 21],
                    [3, 2, 4],
                    [3, 5, 1],
                    [0, 5, 4],
                    [2, 4, 3],
                    [5, 1, 3],
                    [5, 4, 0],
                    [1, 7, 9],
                    [4, 8, 9],
                    [1, 8, 11],
                    [4, 7, 11],
                    [0, 9, 6],
                    [3, 9, 10],
                    [3, 11, 6],
                    [0, 11, 10],
                    [2, 6, 7],
                    [2, 10, 8],
                    [5, 6, 8],
                    [5, 10, 7],
                    [6, 0, 9],
                    [10, 3, 9],
                    [6, 3, 11],
                    [10, 0, 11],
                    [7, 2, 6],
                    [8, 2, 10],
                    [8, 5, 6],
                    [7, 5, 10],
                    [9, 1, 7],
                    [9, 4, 8],
                    [11, 1, 8],
                    [11, 4, 7],
                    [7, 9, 1],
                    [8, 9, 4],
                    [8, 11, 1],
                    [7, 11, 4],
                    [9, 6, 0],
                    [9, 10, 3],
                    [11, 6, 3],
                    [11, 10, 0],
                    [8, 9, 10],
                    [8, 11, 6],
                    [7, 11, 10],
                    [9, 10, 8],
                    [11, 6, 8],
                    [11, 10, 7],
                    [6, 0, 2],
                    [10, 3, 2],
                    [6, 3, 5],
                    [10, 0, 5],
                    [7, 2, 1],
                    [8, 2, 4],
                    [8, 5, 1],
                    [7, 5, 4],
                    [9, 1, 0],
                    [9, 4, 3],
                    [11, 1, 3],
                    [11, 4, 0],
                    [1, 7, 2],
                    [4, 8, 2],
                    [1, 8, 5],
                    [4, 7, 5],
                    [0, 9, 1],
                    [3, 9, 4],
                    [3, 11, 1],
                    [0, 11, 4],
                    [2, 6, 0],
                    [2, 10, 3],
                    [5, 6, 3],
                    [5, 10, 0],
                    [0, 2, 6],
                    [3, 2, 10],
                    [3, 5, 6],
                    [0, 5, 10],
                    [2, 1, 7],
                    [2, 4, 8],
                    [5, 1, 8],
                    [5, 4, 7],
                    [16, 12, 14],
                    [13, 21, 18],
                    [19, 15, 23],
                    [17, 20, 22],
                    [12, 14, 16],
                    [21, 18, 13],
                    [15, 23, 19],
                    [20, 22, 17],
                    [14, 16, 12],
                    [18, 13, 21],
                    [23, 19, 15],
                    [22, 17, 20],
                    [19, 20, 18],
                    [17, 15, 14],
                    [16, 21, 22],
                    [13, 12, 23],
                    [20, 18, 19],
                    [15, 14, 17],
                    [21, 22, 16],
                    [12, 23, 13],
                    [18, 19, 20],
                    [14, 17, 15],
                    [22, 16, 21],
                    [23, 13, 12],
                    [6, 0, 5],
                    [10, 3, 5],
                    [6, 3, 2],
                    [10, 0, 2],
                    [7, 2, 4],
                    [8, 2, 1],
                    [8, 5, 4],
                    [7, 5, 1],
                    [9, 1, 3],
                    [9, 4, 0],
                    [11, 1, 0],
                    [11, 4, 3],
                    [1, 7, 5],
                    [4, 8, 5],
                    [1, 8, 2],
                    [4, 7, 2],
                    [0, 9, 4],
                    [3, 9, 1],
                    [3, 11, 4],
                    [0, 11, 1],
                    [2, 6, 3],
                    [2, 10, 0],
                    [5, 6, 0],
                    [5, 10, 3],
                    [0, 2, 10],
                    [3, 2, 6],
                    [3, 5, 10],
                    [0, 5, 6],
                    [2, 1, 8],
                    [2, 4, 7],
                    [5, 1, 7],
                    [5, 4, 8],
                    [21, 17, 23],
                    [20, 16, 22],
                    [12, 13, 18],
                    [15, 19, 14],
                    [23, 21, 17],
                    [22, 20, 16],
                    [18, 12, 13],
                    [14, 15, 19],
                    [17, 23, 21],
                    [16, 22, 20],
                    [13, 18, 12],
                    [19, 14, 15],
                    [21, 13, 22],
                    [20, 19, 23],
                    [12, 17, 14],
                    [15, 16, 18],
                    [23, 15, 13],
                    [22, 12, 19],
                    [18, 20, 17],
                    [14, 21, 16],
                    [17, 22, 15],
                    [16, 23, 12],
                    [13, 14, 20],
                    [19, 18, 21],
                    [15, 17, 22],
                    [12, 16, 23],
                    [20, 13, 14],
                    [21, 19, 18],
                    [22, 21, 13],
                    [23, 20, 19],
                    [14, 12, 17],
                    [18, 15, 16],
                    [13, 23, 15],
                    [19, 22, 12],
                    [17, 18, 20],
                    [16, 14, 21],
                    [15, 13, 23],
                    [12, 19, 22],
                    [20, 17, 18],
                    [21, 16, 14],
                    [22, 15, 17],
                    [23, 12, 16],
                    [14, 20, 13],
                    [18, 21, 19],
                    [13, 22, 21],
                    [19, 23, 20],
                    [17, 14, 12],
                    [16, 18, 15],
                    [6, 5, 3],
                    [4, 9, 3],
                    [9, 3, 4],
                    [5, 7, 4],
                    [4, 5, 7],
                    [5, 3, 6],
                ];
                SpacegroupTables.Group = [
                    [0],
                    [0, 1],
                    [0, 2],
                    [0, 3],
                    [0, 2, 4, 5],
                    [0, 6],
                    [0, 7],
                    [0, 6, 4, 8],
                    [0, 7, 4, 9],
                    [0, 6, 2, 1],
                    [0, 3, 1, 10],
                    [0, 6, 2, 1, 4, 8, 5, 11],
                    [0, 12, 1, 7],
                    [0, 1, 13, 14],
                    [0, 12, 1, 7, 4, 15, 11, 9],
                    [0, 16, 2, 17],
                    [0, 18, 12, 17],
                    [0, 16, 5, 19],
                    [0, 20, 13, 19],
                    [0, 18, 12, 17, 4, 21, 15, 19],
                    [0, 16, 2, 17, 4, 22, 5, 19],
                    [0, 16, 2, 17, 23, 24, 13, 25, 26, 20, 27, 28, 4, 22, 5, 19],
                    [0, 16, 17, 2, 29, 21, 30, 15],
                    [0, 20, 13, 19, 29, 31, 32, 33],
                    [0, 16, 6, 34],
                    [0, 18, 7, 34],
                    [0, 16, 7, 35],
                    [0, 16, 36, 37],
                    [0, 18, 36, 38],
                    [0, 16, 14, 39],
                    [0, 20, 40, 34],
                    [0, 16, 8, 41],
                    [0, 18, 8, 42],
                    [0, 16, 9, 42],
                    [0, 16, 6, 34, 4, 22, 8, 41],
                    [0, 18, 7, 34, 4, 21, 9, 41],
                    [0, 16, 7, 35, 4, 22, 9, 42],
                    [0, 16, 6, 34, 23, 24, 14, 39],
                    [0, 16, 10, 43, 23, 24, 7, 35],
                    [0, 16, 36, 37, 23, 24, 9, 42],
                    [0, 16, 8, 41, 23, 24, 40, 38],
                    [0, 16, 6, 34, 23, 24, 14, 39, 26, 20, 40, 38, 4, 22, 8, 41],
                    [0, 16, 44, 45, 23, 24, 46, 47, 26, 20, 48, 49, 4, 22, 50, 51],
                    [0, 16, 6, 34, 29, 21, 9, 42],
                    [0, 16, 8, 41, 29, 21, 7, 35],
                    [0, 16, 36, 37, 29, 21, 14, 39],
                    [0, 16, 2, 17, 1, 52, 6, 34],
                    [0, 16, 2, 17, 53, 54, 9, 42],
                    [0, 16, 12, 33, 1, 52, 7, 35],
                    [0, 16, 2, 17, 11, 55, 8, 41],
                    [0, 56, 2, 57, 1, 58, 6, 37],
                    [0, 56, 15, 25, 1, 58, 9, 39],
                    [0, 20, 27, 17, 1, 59, 40, 34],
                    [0, 56, 12, 28, 1, 58, 7, 38],
                    [0, 16, 5, 19, 1, 52, 8, 41],
                    [0, 22, 13, 28, 1, 55, 14, 38],
                    [0, 18, 13, 60, 1, 61, 14, 43],
                    [0, 16, 15, 30, 1, 52, 9, 42],
                    [0, 16, 5, 19, 11, 55, 6, 34],
                    [0, 21, 12, 19, 1, 54, 7, 41],
                    [0, 20, 13, 19, 1, 59, 14, 41],
                    [0, 20, 3, 30, 1, 59, 10, 42],
                    [0, 18, 12, 17, 1, 61, 7, 34, 4, 21, 15, 19, 11, 54, 9, 41],
                    [0, 24, 13, 17, 1, 62, 14, 34, 4, 20, 27, 19, 11, 59, 40, 41],
                    [0, 16, 2, 17, 1, 52, 6, 34, 4, 22, 5, 19, 11, 55, 8, 41],
                    [0, 16, 12, 33, 1, 52, 7, 35, 4, 22, 15, 30, 11, 55, 9, 42],
                    [0, 31, 3, 17, 1, 63, 10, 34, 4, 56, 32, 19, 11, 58, 36, 41],
                    [0, 22, 2, 19, 64, 59, 14, 38, 4, 16, 5, 17, 65, 62, 40, 39],
                    [0, 16, 2, 17, 1, 52, 6, 34, 23, 24, 13, 25, 64, 62, 14, 39, 26, 20, 27, 28, 65, 59, 40, 38, 4, 22, 5, 19, 11, 55, 8, 41],
                    [0, 16, 2, 17, 66, 67, 44, 45, 23, 24, 13, 25, 68, 69, 46, 47, 26, 20, 27, 28, 70, 71, 48, 49, 4, 22, 5, 19, 72, 73, 50, 51],
                    [0, 16, 2, 17, 1, 52, 6, 34, 29, 21, 15, 30, 53, 54, 9, 42],
                    [0, 16, 5, 19, 1, 52, 8, 41, 29, 21, 12, 33, 53, 54, 7, 35],
                    [0, 20, 13, 19, 1, 59, 14, 41, 29, 31, 32, 33, 53, 63, 36, 35],
                    [0, 31, 3, 17, 1, 63, 10, 34, 29, 20, 27, 30, 53, 59, 40, 42],
                    [0, 16, 74, 75],
                    [0, 18, 76, 77],
                    [0, 16, 78, 79],
                    [0, 18, 80, 81],
                    [0, 16, 74, 75, 29, 21, 82, 83],
                    [0, 21, 84, 85, 29, 16, 86, 87],
                    [0, 16, 88, 89],
                    [0, 16, 88, 89, 29, 21, 90, 91],
                    [0, 16, 74, 75, 1, 52, 88, 89],
                    [0, 16, 78, 79, 1, 52, 92, 93],
                    [0, 16, 94, 95, 11, 55, 88, 89],
                    [0, 16, 82, 83, 53, 54, 88, 89],
                    [0, 16, 74, 75, 1, 52, 88, 89, 29, 21, 82, 83, 53, 54, 90, 91],
                    [0, 21, 84, 85, 96, 97, 88, 91, 29, 16, 86, 87, 98, 99, 90, 89],
                    [0, 16, 74, 75, 2, 17, 100, 101],
                    [0, 16, 94, 95, 5, 19, 100, 101],
                    [0, 18, 76, 77, 2, 33, 102, 103],
                    [0, 18, 104, 105, 106, 107, 100, 108],
                    [0, 16, 78, 79, 2, 17, 109, 108],
                    [0, 16, 82, 83, 15, 30, 100, 101],
                    [0, 18, 80, 81, 2, 33, 110, 111],
                    [0, 18, 112, 113, 114, 115, 100, 108],
                    [0, 16, 74, 75, 2, 17, 100, 101, 29, 21, 82, 83, 15, 30, 116, 117],
                    [0, 21, 84, 85, 118, 119, 116, 101, 29, 16, 86, 87, 120, 121, 100, 117],
                    [0, 16, 74, 75, 6, 34, 122, 123],
                    [0, 16, 74, 75, 8, 41, 124, 125],
                    [0, 16, 78, 79, 7, 35, 122, 123],
                    [0, 16, 82, 83, 9, 42, 122, 123],
                    [0, 16, 74, 75, 7, 35, 126, 127],
                    [0, 16, 74, 75, 9, 42, 128, 129],
                    [0, 16, 78, 79, 6, 34, 126, 127],
                    [0, 16, 78, 79, 8, 41, 128, 129],
                    [0, 16, 74, 75, 6, 34, 122, 123, 29, 21, 82, 83, 9, 42, 128, 129],
                    [0, 16, 74, 75, 7, 35, 126, 127, 29, 21, 82, 83, 8, 41, 124, 125],
                    [0, 21, 84, 85, 6, 42, 130, 131, 29, 16, 86, 87, 9, 34, 132, 133],
                    [0, 21, 84, 85, 7, 41, 134, 135, 29, 16, 86, 87, 8, 35, 136, 137],
                    [0, 16, 89, 88, 2, 17, 122, 123],
                    [0, 16, 89, 88, 12, 33, 126, 127],
                    [0, 16, 89, 88, 5, 19, 124, 125],
                    [0, 16, 89, 88, 15, 30, 128, 129],
                    [0, 16, 88, 89, 6, 34, 100, 101],
                    [0, 16, 89, 88, 7, 35, 109, 108],
                    [0, 16, 89, 88, 8, 41, 138, 139],
                    [0, 16, 89, 88, 9, 42, 116, 117],
                    [0, 16, 89, 88, 6, 34, 100, 101, 29, 21, 91, 90, 9, 42, 116, 117],
                    [0, 16, 89, 88, 7, 35, 109, 108, 29, 21, 91, 90, 8, 41, 138, 139],
                    [0, 16, 89, 88, 2, 17, 122, 123, 29, 21, 91, 90, 15, 30, 128, 129],
                    [0, 16, 89, 88, 118, 121, 132, 131, 29, 21, 91, 90, 120, 119, 130, 133],
                    [0, 16, 74, 75, 2, 17, 100, 101, 1, 52, 88, 89, 6, 34, 122, 123],
                    [0, 16, 74, 75, 12, 33, 109, 108, 1, 52, 88, 89, 7, 35, 126, 127],
                    [0, 16, 74, 75, 2, 17, 100, 101, 11, 55, 140, 141, 8, 41, 124, 125],
                    [0, 16, 74, 75, 2, 17, 100, 101, 53, 54, 90, 91, 9, 42, 128, 129],
                    [0, 16, 74, 75, 5, 19, 138, 139, 1, 52, 88, 89, 8, 41, 124, 125],
                    [0, 16, 74, 75, 15, 30, 116, 117, 1, 52, 88, 89, 9, 42, 128, 129],
                    [0, 16, 94, 95, 5, 19, 100, 101, 11, 55, 88, 89, 6, 34, 124, 125],
                    [0, 16, 94, 95, 15, 30, 109, 108, 11, 55, 88, 89, 7, 35, 128, 129],
                    [0, 16, 78, 79, 2, 17, 109, 108, 1, 52, 92, 93, 6, 34, 126, 127],
                    [0, 16, 78, 79, 12, 33, 100, 101, 1, 52, 92, 93, 7, 35, 122, 123],
                    [0, 16, 82, 83, 12, 33, 138, 139, 53, 54, 88, 89, 8, 41, 126, 127],
                    [0, 16, 82, 83, 2, 17, 116, 117, 53, 54, 88, 89, 9, 42, 122, 123],
                    [0, 16, 78, 79, 5, 19, 116, 117, 1, 52, 92, 93, 8, 41, 128, 129],
                    [0, 16, 82, 83, 15, 30, 100, 101, 1, 52, 90, 91, 9, 42, 122, 123],
                    [0, 16, 82, 83, 15, 30, 100, 101, 53, 54, 88, 89, 6, 34, 128, 129],
                    [0, 16, 82, 83, 5, 19, 109, 108, 53, 54, 88, 89, 7, 35, 124, 125],
                    [0, 16, 74, 75, 2, 17, 100, 101, 1, 52, 88, 89, 6, 34, 122, 123, 29, 21, 82, 83, 15, 30, 116, 117, 53, 54, 90, 91, 9, 42, 128, 129],
                    [0, 16, 74, 75, 12, 33, 109, 108, 1, 52, 88, 89, 7, 35, 126, 127, 29, 21, 82, 83, 5, 19, 138, 139, 53, 54, 90, 91, 8, 41, 124, 125],
                    [0, 21, 84, 85, 118, 119, 116, 101, 96, 97, 88, 91, 9, 34, 132, 133, 29, 16, 86, 87, 120, 121, 100, 117, 98, 99, 90, 89, 6, 42, 130, 131],
                    [0, 21, 84, 85, 142, 143, 138, 108, 96, 97, 88, 91, 8, 35, 136, 137, 29, 16, 86, 87, 144, 145, 109, 139, 98, 99, 90, 89, 7, 41, 134, 135],
                    [0, 146, 147],
                    [0, 148, 149],
                    [0, 150, 151],
                    [0, 146, 147, 152, 153, 154, 155, 156, 157],
                    [0, 158, 159],
                    [0, 146, 147, 1, 160, 161],
                    [0, 146, 147, 1, 160, 161, 152, 153, 154, 162, 163, 164, 155, 156, 157, 165, 166, 167],
                    [0, 158, 159, 1, 168, 169],
                    [0, 146, 147, 101, 170, 171],
                    [0, 146, 147, 100, 172, 173],
                    [0, 148, 149, 174, 175, 171],
                    [0, 148, 149, 100, 176, 177],
                    [0, 150, 151, 178, 179, 171],
                    [0, 150, 151, 100, 180, 181],
                    [0, 146, 147, 100, 172, 173, 152, 153, 154, 182, 183, 184, 155, 156, 157, 185, 186, 187],
                    [0, 158, 159, 101, 188, 189],
                    [0, 146, 147, 122, 190, 191],
                    [0, 146, 147, 123, 192, 193],
                    [0, 146, 147, 126, 194, 195],
                    [0, 146, 147, 127, 196, 197],
                    [0, 146, 147, 122, 190, 191, 152, 153, 154, 198, 199, 200, 155, 156, 157, 201, 202, 203],
                    [0, 158, 159, 123, 204, 205],
                    [0, 146, 147, 126, 194, 195, 152, 153, 154, 206, 207, 208, 155, 156, 157, 209, 210, 211],
                    [0, 158, 159, 129, 212, 213],
                    [0, 146, 147, 101, 170, 171, 1, 160, 161, 123, 192, 193],
                    [0, 146, 147, 108, 214, 215, 1, 160, 161, 127, 196, 197],
                    [0, 146, 147, 100, 172, 173, 1, 160, 161, 122, 190, 191],
                    [0, 146, 147, 109, 216, 217, 1, 160, 161, 126, 194, 195],
                    [0, 146, 147, 100, 172, 173, 1, 160, 161, 122, 190, 191, 152, 153, 154, 182, 183, 184, 162, 163, 164, 198, 199, 200, 155, 156, 157, 185, 186, 187, 165, 166, 167, 201, 202, 203],
                    [0, 158, 159, 101, 188, 189, 1, 168, 169, 123, 204, 205],
                    [0, 146, 147, 109, 216, 217, 1, 160, 161, 126, 194, 195, 152, 153, 154, 218, 219, 220, 162, 163, 164, 206, 207, 208, 155, 156, 157, 221, 222, 223, 165, 166, 167, 209, 210, 211],
                    [0, 158, 159, 117, 224, 225, 1, 168, 169, 129, 212, 213],
                    [0, 146, 147, 16, 226, 227],
                    [0, 148, 149, 18, 228, 229],
                    [0, 150, 151, 18, 230, 231],
                    [0, 150, 151, 16, 232, 233],
                    [0, 148, 149, 16, 234, 235],
                    [0, 146, 147, 18, 236, 237],
                    [0, 146, 147, 52, 238, 239],
                    [0, 146, 147, 16, 226, 227, 1, 160, 161, 52, 238, 239],
                    [0, 146, 147, 18, 236, 237, 1, 160, 161, 61, 240, 241],
                    [0, 146, 147, 16, 226, 227, 100, 172, 173, 101, 170, 171],
                    [0, 148, 149, 18, 228, 229, 242, 172, 181, 243, 214, 244],
                    [0, 150, 151, 18, 230, 231, 245, 172, 177, 246, 214, 247],
                    [0, 150, 151, 16, 232, 233, 245, 172, 177, 174, 170, 248],
                    [0, 148, 149, 16, 234, 235, 242, 172, 181, 178, 170, 249],
                    [0, 146, 147, 18, 236, 237, 100, 172, 173, 108, 214, 215],
                    [0, 146, 147, 16, 226, 227, 122, 190, 191, 123, 192, 193],
                    [0, 146, 147, 16, 226, 227, 126, 194, 195, 127, 196, 197],
                    [0, 146, 147, 18, 236, 237, 126, 194, 195, 123, 192, 193],
                    [0, 146, 147, 18, 236, 237, 122, 190, 191, 127, 196, 197],
                    [0, 146, 147, 52, 238, 239, 122, 190, 191, 101, 170, 171],
                    [0, 146, 147, 61, 240, 241, 126, 194, 195, 101, 170, 171],
                    [0, 146, 147, 52, 238, 239, 100, 172, 173, 123, 192, 193],
                    [0, 146, 147, 61, 240, 241, 100, 172, 173, 127, 196, 197],
                    [0, 146, 147, 16, 226, 227, 100, 172, 173, 101, 170, 171, 1, 160, 161, 52, 239, 238, 122, 190, 191, 123, 192, 193],
                    [0, 146, 147, 16, 226, 227, 109, 216, 217, 108, 214, 215, 1, 160, 161, 52, 239, 238, 126, 194, 195, 127, 196, 197],
                    [0, 146, 147, 18, 236, 237, 109, 216, 217, 101, 170, 171, 1, 160, 161, 61, 241, 240, 126, 194, 195, 123, 192, 193],
                    [0, 146, 147, 18, 236, 237, 100, 172, 173, 108, 214, 215, 1, 160, 161, 61, 241, 240, 122, 190, 191, 127, 196, 197],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 64, 62, 14, 39, 308, 309, 310, 311, 312, 313, 314, 315, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 65, 59, 40, 38, 316, 317, 318, 319, 320, 321, 322, 323, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 11, 55, 8, 41, 324, 325, 326, 327, 328, 329, 330, 331],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 66, 67, 44, 45, 332, 333, 334, 335, 336, 337, 338, 339, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 68, 69, 46, 47, 340, 341, 342, 343, 344, 345, 346, 347, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 70, 71, 48, 49, 348, 349, 350, 351, 352, 353, 354, 355, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 72, 73, 50, 51, 356, 357, 358, 359, 360, 361, 362, 363],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 1, 59, 14, 41, 168, 325, 318, 311, 169, 313, 330, 323],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 1, 59, 14, 41, 168, 325, 318, 311, 169, 313, 330, 323, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 53, 63, 36, 35, 300, 364, 365, 366, 304, 367, 368, 369],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 138, 139, 95, 94, 406, 407, 408, 409, 410, 411, 412, 413],
                    [0, 24, 5, 28, 158, 265, 258, 275, 159, 277, 270, 263, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 23, 16, 27, 19, 256, 273, 251, 267, 260, 269, 278, 255, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 26, 22, 13, 17, 264, 250, 274, 259, 268, 261, 254, 279, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 4, 20, 2, 25, 272, 257, 266, 252, 276, 253, 262, 271, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 450, 415, 440, 429, 454, 431, 420, 445, 458, 447, 436, 425],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 450, 415, 440, 429, 454, 431, 420, 445, 458, 447, 436, 425],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 123, 122, 88, 89, 204, 474, 475, 476, 205, 477, 478, 479],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 123, 122, 88, 89, 204, 474, 475, 476, 205, 477, 478, 479, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 125, 124, 140, 141, 504, 505, 506, 507, 508, 509, 510, 511],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 123, 122, 88, 89, 204, 474, 475, 476, 205, 477, 478, 479, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 129, 128, 90, 91, 212, 512, 513, 514, 213, 515, 516, 517],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 129, 128, 90, 91, 212, 512, 513, 514, 213, 515, 516, 517],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 129, 128, 90, 91, 212, 512, 513, 514, 213, 515, 516, 517, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 127, 126, 92, 93, 542, 543, 544, 545, 546, 547, 548, 549],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 64, 62, 14, 39, 308, 309, 310, 311, 312, 313, 314, 315, 481, 480, 483, 482, 486, 487, 484, 485, 491, 490, 489, 488, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 65, 59, 40, 38, 316, 317, 318, 319, 320, 321, 322, 323, 493, 492, 495, 494, 498, 499, 496, 497, 503, 502, 501, 500, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 138, 139, 95, 94, 406, 407, 408, 409, 410, 411, 412, 413, 11, 55, 8, 41, 324, 325, 326, 327, 328, 329, 330, 331, 124, 125, 141, 140, 506, 507, 504, 505, 511, 510, 509, 508],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 64, 62, 14, 39, 308, 309, 310, 311, 312, 313, 314, 315, 519, 518, 521, 520, 524, 525, 522, 523, 529, 528, 527, 526, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 65, 59, 40, 38, 316, 317, 318, 319, 320, 321, 322, 323, 531, 530, 533, 532, 536, 537, 534, 535, 541, 540, 539, 538, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 109, 108, 79, 78, 598, 599, 600, 601, 602, 603, 604, 605, 11, 55, 8, 41, 324, 325, 326, 327, 328, 329, 330, 331, 126, 127, 93, 92, 544, 545, 542, 543, 549, 548, 547, 546],
                    [0, 24, 5, 28, 158, 265, 258, 275, 159, 277, 270, 263, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 66, 69, 50, 49, 332, 349, 342, 359, 336, 361, 354, 347, 493, 123, 483, 140, 498, 507, 204, 485, 503, 490, 509, 205, 23, 16, 27, 19, 256, 273, 251, 267, 260, 269, 278, 255, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 68, 67, 48, 51, 340, 357, 334, 351, 344, 353, 362, 339, 124, 480, 89, 494, 506, 499, 484, 474, 511, 478, 501, 488, 26, 22, 13, 17, 264, 250, 274, 259, 268, 261, 254, 279, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 70, 73, 46, 45, 348, 333, 358, 343, 352, 345, 338, 363, 122, 492, 141, 482, 475, 487, 496, 505, 479, 510, 489, 500, 4, 20, 2, 25, 272, 257, 266, 252, 276, 253, 262, 271, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 72, 71, 44, 47, 356, 341, 350, 335, 360, 337, 346, 355, 481, 125, 495, 88, 486, 476, 504, 497, 491, 502, 477, 508],
                    [0, 24, 5, 28, 158, 265, 258, 275, 159, 277, 270, 263, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 531, 129, 521, 92, 536, 545, 212, 523, 541, 528, 547, 213, 23, 16, 27, 19, 256, 273, 251, 267, 260, 269, 278, 255, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 126, 518, 91, 532, 544, 537, 522, 512, 549, 516, 539, 526, 26, 22, 13, 17, 264, 250, 274, 259, 268, 261, 254, 279, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 128, 530, 93, 520, 513, 525, 534, 543, 517, 548, 527, 538, 4, 20, 2, 25, 272, 257, 266, 252, 276, 253, 262, 271, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 519, 127, 533, 90, 524, 514, 542, 535, 529, 540, 515, 546],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 1, 59, 14, 41, 168, 325, 318, 311, 169, 313, 330, 323, 551, 550, 553, 552, 556, 557, 554, 555, 561, 560, 559, 558, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 450, 415, 440, 429, 454, 431, 420, 445, 458, 447, 436, 425, 53, 63, 36, 35, 300, 364, 365, 366, 304, 367, 368, 369, 563, 562, 565, 564, 568, 569, 566, 567, 573, 572, 571, 570],
                    [0, 16],
                    [0, 18],
                    [0, 16, 26, 20],
                    [0, 2, 23, 13],
                    [0, 3, 4, 32],
                    [0, 2, 29, 15],
                    [0, 3, 29, 27],
                    [0, 52],
                    [0, 63],
                    [0, 52, 26, 59],
                    [0, 63, 26, 54],
                    [0, 52, 16, 1],
                    [0, 18, 1, 61],
                    [0, 52, 16, 1, 26, 59, 20, 65],
                    [0, 31, 1, 63],
                    [0, 1, 24, 62],
                    [0, 31, 1, 63, 26, 21, 65, 54],
                    [0, 2, 57, 56],
                    [0, 60, 3, 16],
                    [0, 22, 57, 3],
                    [0, 2, 28, 20],
                    [0, 17, 13, 24],
                    [0, 20, 19, 13, 4, 24, 17, 27],
                    [0, 22, 57, 3, 4, 16, 60, 32],
                    [0, 22, 57, 3, 23, 20, 30, 12, 26, 24, 33, 15, 4, 16, 60, 32],
                    [0, 22, 57, 3, 29, 18, 27, 25],
                    [0, 22, 3, 57, 1, 55, 10, 37],
                    [0, 22, 385, 396, 3, 57, 109, 117],
                    [0, 22, 57, 3, 159, 279, 654, 655, 158, 274, 656, 657, 29, 18, 25, 27, 284, 658, 262, 269, 280, 659, 257, 267],
                ];
                SpacegroupTables.Spacegroup = {
                    "P 1": 0,
                    "P -1": 1,
                    "P 1 2 1": 2,
                    "P 1 21 1": 3,
                    "C 1 2 1": 4,
                    "P 1 m 1": 5,
                    "P 1 c 1": 6,
                    "C 1 m 1": 7,
                    "C 1 c 1": 8,
                    "P 1 2/m 1": 9,
                    "P 1 21/m 1": 10,
                    "C 1 2/m 1": 11,
                    "P 1 2/c 1": 12,
                    "P 1 21/c 1": 13,
                    "C 1 2/c 1": 14,
                    "P 2 2 2": 15,
                    "P 2 2 21": 16,
                    "P 21 21 2": 17,
                    "P 21 21 21": 18,
                    "C 2 2 21": 19,
                    "C 2 2 2": 20,
                    "F 2 2 2": 21,
                    "I 2 2 2": 22,
                    "I 21 21 21": 23,
                    "P m m 2": 24,
                    "P m c 21": 25,
                    "P c c 2": 26,
                    "P m a 2": 27,
                    "P c a 21": 28,
                    "P n c 2": 29,
                    "P m n 21": 30,
                    "P b a 2": 31,
                    "P n a 21": 32,
                    "P n n 2": 33,
                    "C m m 2": 34,
                    "C m c 21": 35,
                    "C c c 2": 36,
                    "A m m 2": 37,
                    "A b m 2": 38,
                    "A m a 2": 39,
                    "A b a 2": 40,
                    "F m m 2": 41,
                    "F d d 2": 42,
                    "I m m 2": 43,
                    "I b a 2": 44,
                    "I m a 2": 45,
                    "P 2/m 2/m 2/m": 46,
                    "P m m m": 46,
                    "P 2/n 2/n 2/n": 47,
                    "P n n n": 47,
                    "P 2/c 2/c 2/m": 48,
                    "P c c m": 48,
                    "P 2/b 2/a 2/n": 49,
                    "P b a n": 49,
                    "P 21/m 2/m 2/a": 50,
                    "P m m a": 50,
                    "P 2/n 21/n 2/a": 51,
                    "P n n a": 51,
                    "P 2/m 2/n 21/a": 52,
                    "P m n a": 52,
                    "P 21/c 2/c 2/a": 53,
                    "P c c a": 53,
                    "P 21/b 21/a 2/m": 54,
                    "P b a m": 54,
                    "P 21/c 21/c 2/n": 55,
                    "P c c n": 55,
                    "P 2/b 21/c 21/m": 56,
                    "P b c m": 56,
                    "P 21/n 21/n 2/m": 57,
                    "P n n m": 57,
                    "P 21/m 21/m 2/n": 58,
                    "P m m n": 58,
                    "P 21/b 2/c 21/n": 59,
                    "P b c n": 59,
                    "P 21/b 21/c 21/a": 60,
                    "P b c a": 60,
                    "P 21/n 21/m 21/a": 61,
                    "P n m a": 61,
                    "C 2/m 2/c 21/m": 62,
                    "C m c m": 62,
                    "C 2/m 2/c 21/a": 63,
                    "C m c a": 63,
                    "C 2/m 2/m 2/m": 64,
                    "C m m m": 64,
                    "C 2/c 2/c 2/m": 65,
                    "C c c m": 65,
                    "C 2/m 2/m 2/a": 66,
                    "C m m a": 66,
                    "C 2/c 2/c 2/a": 67,
                    "C c c a": 67,
                    "F 2/m 2/m 2/m": 68,
                    "F m m m": 68,
                    "F 2/d 2/d 2/d": 69,
                    "F d d d": 69,
                    "I 2/m 2/m 2/m": 70,
                    "I m m m": 70,
                    "I 2/b 2/a 2/m": 71,
                    "I b a m": 71,
                    "I 21/b 21/c 21/a": 72,
                    "I b c a": 72,
                    "I 21/m 21/m 21/a": 73,
                    "I m m a": 73,
                    "P 4": 74,
                    "P 41": 75,
                    "P 42": 76,
                    "P 43": 77,
                    "I 4": 78,
                    "I 41": 79,
                    "P -4": 80,
                    "I -4": 81,
                    "P 4/m": 82,
                    "P 42/m": 83,
                    "P 4/n": 84,
                    "P 42/n": 85,
                    "I 4/m": 86,
                    "I 41/a": 87,
                    "P 4 2 2": 88,
                    "P 4 21 2": 89,
                    "P 41 2 2": 90,
                    "P 41 21 2": 91,
                    "P 42 2 2": 92,
                    "P 42 21 2": 93,
                    "P 43 2 2": 94,
                    "P 43 21 2": 95,
                    "I 4 2 2": 96,
                    "I 41 2 2": 97,
                    "P 4 m m": 98,
                    "P 4 b m": 99,
                    "P 42 c m": 100,
                    "P 42 n m": 101,
                    "P 4 c c": 102,
                    "P 4 n c": 103,
                    "P 42 m c": 104,
                    "P 42 b c": 105,
                    "I 4 m m": 106,
                    "I 4 c m": 107,
                    "I 41 m d": 108,
                    "I 41 c d": 109,
                    "P -4 2 m": 110,
                    "P -4 2 c": 111,
                    "P -4 21 m": 112,
                    "P -4 21 c": 113,
                    "P -4 m 2": 114,
                    "P -4 c 2": 115,
                    "P -4 b 2": 116,
                    "P -4 n 2": 117,
                    "I -4 m 2": 118,
                    "I -4 c 2": 119,
                    "I -4 2 m": 120,
                    "I -4 2 d": 121,
                    "P 4/m 2/m 2/m": 122,
                    "P4/m m m": 122,
                    "P 4/m 2/c 2/c": 123,
                    "P4/m c c": 123,
                    "P 4/n 2/b 2/m": 124,
                    "P4/n b m": 124,
                    "P 4/n 2/n 2/c": 125,
                    "P4/n n c": 125,
                    "P 4/m 21/b 2/m": 126,
                    "P4/m b m": 126,
                    "P 4/m 21/n 2/c": 127,
                    "P4/m n c": 127,
                    "P 4/n 21/m 2/m": 128,
                    "P4/n m m": 128,
                    "P 4/n 2/c 2/c": 129,
                    "P4/n c c": 129,
                    "P 42/m 2/m 2/c": 130,
                    "P42/m m c": 130,
                    "P 42/m 2/c 2/m": 131,
                    "P42/m c m": 131,
                    "P 42/n 2/b 2/c": 132,
                    "P42/n b c": 132,
                    "P 42/n 2/n 2/m": 133,
                    "P42/n n m": 133,
                    "P 42/m 21/b 2/c": 134,
                    "P42/m b c": 134,
                    "P 42/m 21/n 2/m": 135,
                    "P42/m n m": 135,
                    "P 42/n 21/m 2/c": 136,
                    "P42/n m c": 136,
                    "P 42/n 21/c 2/m": 137,
                    "P42/n c m": 137,
                    "I 4/m 2/m 2/m": 138,
                    "I4/m m m": 138,
                    "I 4/m 2/c 2/m": 139,
                    "I4/m c m": 139,
                    "I 41/a 2/m 2/d": 140,
                    "I41/a m d": 140,
                    "I 41/a 2/c 2/d": 141,
                    "I41/a c d": 141,
                    "P 3": 142,
                    "P 31": 143,
                    "P 32": 144,
                    "H 3": 145,
                    "R 3": 146,
                    "P -3": 147,
                    "H -3": 148,
                    "R -3": 149,
                    "P 3 1 2": 150,
                    "P 3 2 1": 151,
                    "P 31 1 2": 152,
                    "P 31 2 1": 153,
                    "P 32 1 2": 154,
                    "P 32 2 1": 155,
                    "H 3 2": 156,
                    "R 3 2": 157,
                    "P 3 m 1": 158,
                    "P 3 1 m": 159,
                    "P 3 c 1": 160,
                    "P 3 1 c": 161,
                    "H 3 m": 162,
                    "R 3 m": 163,
                    "H 3 c": 164,
                    "R 3 c": 165,
                    "P -3 1 2/m": 166,
                    "P -3 1 m": 166,
                    "P -3 1 2/c": 167,
                    "P -3 1 c": 167,
                    "P -3 2/m 1": 168,
                    "P -3 m 1": 168,
                    "P -3 2/c 1": 169,
                    "P -3 c 1": 169,
                    "H -3 2/m": 170,
                    "H -3 m": 170,
                    "R -3 2/m": 171,
                    "R -3 m": 171,
                    "H -3 2/c": 172,
                    "H -3 c": 172,
                    "R -3 2/c": 173,
                    "R -3 c": 173,
                    "P 6": 174,
                    "P 61": 175,
                    "P 65": 176,
                    "P 62": 177,
                    "P 64": 178,
                    "P 63": 179,
                    "P -6": 180,
                    "P 6/m": 181,
                    "P 63/m": 182,
                    "P 6 2 2": 183,
                    "P 61 2 2": 184,
                    "P 65 2 2": 185,
                    "P 62 2 2": 186,
                    "P 64 2 2": 187,
                    "P 63 2 2": 188,
                    "P 6 m m": 189,
                    "P 6 c c": 190,
                    "P 63 c m": 191,
                    "P 63 m c": 192,
                    "P -6 m 2": 193,
                    "P -6 c 2": 194,
                    "P -6 2 m": 195,
                    "P -6 2 c": 196,
                    "P 6/m 2/m 2/m": 197,
                    "P 6/m m m": 197,
                    "P 6/m 2/c 2/c": 198,
                    "P 6/m c c": 198,
                    "P 63/m 2/c 2/m": 199,
                    "P 63/m c m": 199,
                    "P 63/m 2/m 2/c": 200,
                    "P 63/m m c": 200,
                    "P 2 3": 201,
                    "F 2 3": 202,
                    "I 2 3": 203,
                    "P 21 3": 204,
                    "I 21 3": 205,
                    "P 2/m -3": 206,
                    "P m -3": 206,
                    "P 2/n -3": 207,
                    "P n -3": 207,
                    "F 2/m -3": 208,
                    "F m -3": 208,
                    "F 2/d -3": 209,
                    "F d -3": 209,
                    "I 2/m -3": 210,
                    "I m -3": 210,
                    "P 21/a -3": 211,
                    "P a -3": 211,
                    "I 21/a -3": 212,
                    "I a -3": 212,
                    "P 4 3 2": 213,
                    "P 42 3 2": 214,
                    "F 4 3 2": 215,
                    "F 41 3 2": 216,
                    "I 4 3 2": 217,
                    "P 43 3 2": 218,
                    "P 41 3 2": 219,
                    "I 41 3 2": 220,
                    "P -4 3 m": 221,
                    "F -4 3 m": 222,
                    "I -4 3 m": 223,
                    "P -4 3 n": 224,
                    "F -4 3 c": 225,
                    "I -4 3 d": 226,
                    "P 4/m -3 2/m": 227,
                    "P m -3 m": 227,
                    "P 4/n -3 2/n": 228,
                    "P n -3 n": 228,
                    "P 42/m -3 2/n": 229,
                    "P m -3 n": 229,
                    "P 42/n -3 2/m": 230,
                    "P n -3 m": 230,
                    "F 4/m -3 2/m": 231,
                    "F m -3 m": 231,
                    "F 4/m -3 2/c": 232,
                    "F m -3 c": 232,
                    "F 41/d -3 2/m": 233,
                    "F d -3 m": 233,
                    "F 41/d -3 2/c": 234,
                    "F d -3 c": 234,
                    "I 4/m -3 2/m": 235,
                    "I m -3 m": 235,
                    "I 41/a -3 2/d": 236,
                    "I a -3 d": 236,
                    "P 1 1 2": 237,
                    "P 1 1 21": 238,
                    "B 1 1 2": 239,
                    "B 2": 239,
                    "A 1 2 1": 240,
                    "C 1 21 1": 241,
                    "I 1 2 1": 242,
                    "I 2": 242,
                    "I 1 21 1": 243,
                    "P 1 1 m": 244,
                    "P 1 1 b": 245,
                    "B 1 1 m": 246,
                    "B 1 1 b": 247,
                    "P 1 1 2/m": 248,
                    "P 1 1 21/m": 249,
                    "B 1 1 2/m": 250,
                    "P 1 1 2/b": 251,
                    "P 1 1 21/b": 252,
                    "B 1 1 2/b": 253,
                    "P 21 2 2": 254,
                    "P 2 21 2": 255,
                    "P 21 21 2 (a)": 256,
                    "P 21 2 21": 257,
                    "P 2 21 21": 258,
                    "C 2 2 21a)": 259,
                    "C 2 2 2a": 260,
                    "F 2 2 2a": 261,
                    "I 2 2 2a": 262,
                    "P 21/m 21/m 2/n a": 263,
                    "P 42 21 2a": 264,
                    "I 2 3a": 265,
                };
            })(SpacegroupTables = Structure.SpacegroupTables || (Structure.SpacegroupTables = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            'use strict';
            var DataTable = Core.Utils.DataTable;
            var SymmetryHelpers;
            (function (SymmetryHelpers) {
                var Mat4 = Core.Geometry.LinearAlgebra.Matrix4;
                function getBoudingSphere(arrays, indices) {
                    var x = arrays.x, y = arrays.y, z = arrays.z;
                    var center = { x: 0, y: 0, z: 0 };
                    for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                        var aI = indices_1[_i];
                        center.x += x[aI];
                        center.y += y[aI];
                        center.z += z[aI];
                    }
                    var count = indices.length > 0 ? indices.length : 1;
                    center.x /= count;
                    center.y /= count;
                    center.z /= count;
                    var r = 0;
                    for (var _a = 0, indices_2 = indices; _a < indices_2.length; _a++) {
                        var aI = indices_2[_a];
                        r = Math.max(indexedVectorDistSq(aI, center, arrays), r);
                    }
                    return { center: center, radius: Math.sqrt(r) };
                }
                function newVec() { return { x: 0, y: 0, z: 0 }; }
                ;
                function getSphereDist(c, r, q) {
                    var dx = c.x - q.center.x, dy = c.y - q.center.y, dz = c.z - q.center.z;
                    return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r + q.radius);
                }
                function isWithinRadius(bounds, i, data, t, r, v) {
                    v.x = data.x[i];
                    v.y = data.y[i];
                    v.z = data.z[i];
                    Mat4.transformVector3(v, v, t);
                    return getSphereDist(v, data.r[i], bounds) <= r;
                }
                function indexedDistSq(aI, cI, arrays) {
                    var dx = arrays.x[aI] - arrays.cX[cI], dy = arrays.y[aI] - arrays.cY[cI], dz = arrays.z[aI] - arrays.cZ[cI];
                    return dx * dx + dy * dy + dz * dz;
                }
                function indexedVectorDistSq(aI, v, arrays) {
                    var dx = arrays.x[aI] - v.x, dy = arrays.y[aI] - v.y, dz = arrays.z[aI] - v.z;
                    return dx * dx + dy * dy + dz * dz;
                }
                function createSymmetryContext(model, boundingInfo, spacegroup, radius) {
                    return {
                        model: model,
                        boundingInfo: boundingInfo,
                        spacegroup: spacegroup,
                        radius: radius,
                        transform: Mat4.empty(),
                        transformed: { x: 0, y: 0, z: 0 },
                        i: 0, j: 0, k: 0, op: 0
                    };
                }
                function symmetryContextMap(ctx, p) {
                    return Mat4.transformVector3(ctx.transformed, p, ctx.transform);
                }
                function symmetryContextGetTransform(ctx) {
                    return createSymmetryTransform(ctx.i, ctx.j, ctx.k, ctx.op, Mat4.clone(ctx.transform));
                }
                function createSymmetryTransform(i, j, k, opIndex, transform) {
                    return {
                        isIdentity: !i && !j && !k && !opIndex,
                        id: opIndex + 1 + "_" + (5 + i) + (5 + j) + (5 + k),
                        transform: transform
                    };
                }
                function createAssemblyTransform(i, transform) {
                    var isIdentity = true;
                    for (var i_1 = 0; i_1 < 4; i_1++) {
                        for (var j = 0; j < 4; j++) {
                            var v = transform[4 * j + i_1];
                            if (i_1 === j) {
                                if (Math.abs(v - 1) > 0.0000001) {
                                    isIdentity = false;
                                    break;
                                }
                            }
                            else if (Math.abs(v) > 0.0000001) {
                                isIdentity = false;
                                break;
                            }
                        }
                        if (!isIdentity)
                            break;
                    }
                    return {
                        isIdentity: isIdentity,
                        id: i.toString(),
                        transform: transform
                    };
                }
                function getBoundingInfo(model, pivotIndices) {
                    var atoms = model.data.atoms, residues = model.data.residues, chains = model.data.chains, entities = model.data.entities, _a = model.positions, x = _a.x, y = _a.y, z = _a.z;
                    var entityTable = DataTable.builder(entities.count), eX = entityTable.addColumn('x', function (s) { return new Float64Array(s); }), eY = entityTable.addColumn('y', function (s) { return new Float64Array(s); }), eZ = entityTable.addColumn('z', function (s) { return new Float64Array(s); }), eR = entityTable.addColumn('r', function (s) { return new Float64Array(s); }), chainTable = DataTable.builder(chains.count), cX = chainTable.addColumn('x', function (s) { return new Float64Array(s); }), cY = chainTable.addColumn('y', function (s) { return new Float64Array(s); }), cZ = chainTable.addColumn('z', function (s) { return new Float64Array(s); }), cR = chainTable.addColumn('r', function (s) { return new Float64Array(s); }), residueTable = DataTable.builder(residues.count), rX = residueTable.addColumn('x', function (s) { return new Float64Array(s); }), rY = residueTable.addColumn('y', function (s) { return new Float64Array(s); }), rZ = residueTable.addColumn('z', function (s) { return new Float64Array(s); }), rR = residueTable.addColumn('r', function (s) { return new Float64Array(s); });
                    var allCenter = newVec(), allRadius = 0, pivotCenter = newVec(), pivotRadius = 0, n = 0, eCenter = newVec(), eRadius = 0, cCenter = newVec(), cRadius = 0, rCenter = newVec(), rRadius = 0;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        eCenter.x = 0;
                        eCenter.y = 0;
                        eCenter.z = 0;
                        for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                            cCenter.x = 0;
                            cCenter.y = 0;
                            cCenter.z = 0;
                            for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                rCenter.x = 0;
                                rCenter.y = 0;
                                rCenter.z = 0;
                                for (var aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                                    rCenter.x += x[aI];
                                    rCenter.y += y[aI];
                                    rCenter.z += z[aI];
                                }
                                allCenter.x += rCenter.x;
                                allCenter.y += rCenter.y;
                                allCenter.z += rCenter.z;
                                n = residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                                cCenter.x += rCenter.x;
                                cCenter.y += rCenter.y;
                                cCenter.z += rCenter.z;
                                rX[rI] = rCenter.x / n;
                                rY[rI] = rCenter.y / n;
                                rZ[rI] = rCenter.z / n;
                            }
                            eCenter.x += cCenter.x;
                            eCenter.y += cCenter.y;
                            eCenter.z += cCenter.z;
                            n = chains.atomEndIndex[cI] - chains.atomStartIndex[cI];
                            cX[cI] = cCenter.x / n;
                            cY[cI] = cCenter.y / n;
                            cZ[cI] = cCenter.z / n;
                        }
                        n = entities.atomEndIndex[eI] - entities.atomStartIndex[eI];
                        eX[eI] = eCenter.x / n;
                        eY[eI] = eCenter.y / n;
                        eZ[eI] = eCenter.z / n;
                    }
                    allCenter.x /= atoms.count;
                    allCenter.y /= atoms.count;
                    allCenter.z /= atoms.count;
                    for (var _i = 0, pivotIndices_1 = pivotIndices; _i < pivotIndices_1.length; _i++) {
                        var aI = pivotIndices_1[_i];
                        pivotCenter.x += x[aI];
                        pivotCenter.y += y[aI];
                        pivotCenter.z += z[aI];
                    }
                    var pivotCount = pivotIndices.length > 0 ? pivotIndices.length : 1;
                    pivotCenter.x /= pivotCount;
                    pivotCenter.y /= pivotCount;
                    pivotCenter.z /= pivotCount;
                    var eDA = { x: x, y: y, z: z, cX: eX, cY: eY, cZ: eZ }, cDA = { x: x, y: y, z: z, cX: cX, cY: cY, cZ: cZ }, rDA = { x: x, y: y, z: z, cX: rX, cY: rY, cZ: rZ };
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        eRadius = 0;
                        for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                            cRadius = 0;
                            for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                rRadius = 0;
                                for (var aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                                    rRadius = Math.max(rRadius, indexedDistSq(aI, rI, rDA));
                                    cRadius = Math.max(cRadius, indexedDistSq(aI, cI, cDA));
                                    eRadius = Math.max(eRadius, indexedDistSq(aI, eI, eDA));
                                    allRadius = Math.max(allRadius, indexedVectorDistSq(aI, allCenter, rDA));
                                }
                                rRadius = Math.sqrt(rRadius);
                                rR[rI] = rRadius;
                            }
                            cRadius = Math.sqrt(cRadius);
                            cR[cI] = cRadius;
                        }
                        eRadius = Math.sqrt(eRadius);
                        eR[eI] = eRadius;
                    }
                    allRadius = Math.sqrt(allRadius);
                    for (var _b = 0, pivotIndices_2 = pivotIndices; _b < pivotIndices_2.length; _b++) {
                        var aI = pivotIndices_2[_b];
                        pivotRadius = Math.max(pivotRadius, indexedVectorDistSq(aI, pivotCenter, rDA));
                    }
                    pivotRadius = Math.sqrt(pivotRadius);
                    return {
                        entities: entityTable.seal(),
                        chains: chainTable.seal(),
                        residues: residueTable.seal(),
                        allAtoms: { center: allCenter, radius: allRadius },
                        target: { center: pivotCenter, radius: pivotRadius }
                    };
                }
                function findSuitableTransforms(ctx) {
                    var bounds = ctx.boundingInfo, sg = ctx.spacegroup;
                    var ret = [];
                    ctx.transform = Mat4.identity();
                    ret[0] = symmetryContextGetTransform(ctx);
                    for (var i = -3; i <= 3; i++) {
                        for (var j = -3; j <= 3; j++) {
                            for (var k = -3; k <= 3; k++) {
                                for (var l = (i === 0 && j === 0 && k === 0 ? 1 : 0), lm = sg.operatorCount; l < lm; l++) {
                                    //for (let l = 0, lm = sg.operatorCount; l < lm; l++) {                            
                                    sg.getOperatorMatrix(l, i, j, k, ctx.transform);
                                    ctx.i = i;
                                    ctx.k = k;
                                    ctx.j = j;
                                    ctx.op = l;
                                    var t = symmetryContextMap(ctx, bounds.allAtoms.center), d = getSphereDist(t, bounds.allAtoms.radius, bounds.target);
                                    if (d < ctx.radius) {
                                        ret[ret.length] = symmetryContextGetTransform(ctx);
                                    }
                                }
                            }
                        }
                    }
                    return ret;
                }
                function getSymmetryResidues(ctx, transforms) {
                    var bounds = ctx.boundingInfo, radius = ctx.radius, targetBounds = bounds.target;
                    var model = ctx.model, residues = model.data.residues, chains = model.data.chains, entities = model.data.entities;
                    var residueIndices = Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, residues.count, 1), operatorIndices = Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, residues.count, 1);
                    var v = { x: 0, y: 0, z: 0 }, opIndex = 0;
                    var atomCount = 0, chainCount = 0, entityCount = 0;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        //if (!isWithinRadius(hetBounds, eI, bounds.entities, t.transform, radius, v)) continue;
                        opIndex = 0;
                        var chainAdded = false;
                        for (var _i = 0, transforms_1 = transforms; _i < transforms_1.length; _i++) {
                            var t = transforms_1[_i];
                            for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                                if (!isWithinRadius(targetBounds, cI, bounds.chains, t.transform, radius, v))
                                    continue;
                                var residueAdded = false;
                                for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                    if (!isWithinRadius(targetBounds, rI, bounds.residues, t.transform, radius, v))
                                        continue;
                                    Core.Utils.ChunkedArray.add(residueIndices, rI);
                                    Core.Utils.ChunkedArray.add(operatorIndices, opIndex);
                                    atomCount += residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                                    residueAdded = true;
                                }
                                if (residueAdded) {
                                    chainCount += 1;
                                    chainAdded = true;
                                }
                            }
                            opIndex++;
                        }
                        if (chainAdded) {
                            entityCount++;
                        }
                    }
                    return {
                        residues: Core.Utils.ChunkedArray.compact(residueIndices),
                        operators: Core.Utils.ChunkedArray.compact(operatorIndices),
                        atomCount: atomCount,
                        chainCount: chainCount,
                        entityCount: entityCount
                    };
                }
                function cloneRow(src, sI, target, tI, c) {
                    for (var i = 0; i < c; i++) {
                        target[i][tI] = src[i][sI];
                    }
                }
                function assemble(model, assemblyParts, transforms) {
                    var residues = model.data.residues, residueChainIndex = residues.chainIndex, residueEntityIndex = residues.entityIndex, residueAtomStartIndex = residues.atomStartIndex, residueAtomEndIndex = residues.atomEndIndex, atoms = model.data.atoms, _a = model.positions, x = _a.x, y = _a.y, z = _a.z;
                    var atomTable = DataTable.builder(assemblyParts.atomCount), atomId, atomResidue, atomChain, atomEntity, cols = [];
                    var positionTable = DataTable.ofDefinition(Structure.Tables.Positions, assemblyParts.atomCount), atomX = positionTable.x, atomY = positionTable.y, atomZ = positionTable.z;
                    var entityTableBuilder = model.data.entities.getBuilder(assemblyParts.entityCount), entityTable = entityTableBuilder, srcEntityData = model.data.entities.getRawData(), entityData = entityTable.getRawData(), entityChainStart = entityTable.chainStartIndex, entityChainEnd = entityTable.chainEndIndex, entityResidueStart = entityTable.residueStartIndex, entityResidueEnd = entityTable.residueEndIndex, entityAtomStart = entityTable.atomStartIndex, entityAtomEnd = entityTable.atomEndIndex, entityOffset = 0;
                    var chainTableBuilder = model.data.chains.getBuilder(assemblyParts.chainCount), chainTable = chainTableBuilder, srcChainData = model.data.chains.getRawData(), chainData = chainTable.getRawData(), chainResidueStart = chainTable.residueStartIndex, chainResidueEnd = chainTable.residueEndIndex, chainAtomStart = chainTable.atomStartIndex, chainAtomEnd = chainTable.atomEndIndex, chainId = chainTable.asymId, chainAuthId = chainTable.authAsymId, chainEntity = chainTable.entityIndex, chainSourceChainIndex = chainTableBuilder.addColumn('sourceChainIndex', function (s) { return new Int32Array(s); }), chainOperatorIndex = chainTableBuilder.addColumn('operatorIndex', function (s) { return new Int32Array(s); }), chainOffset = 0;
                    var residueTableBuilder = model.data.residues.getBuilder(assemblyParts.residues.length), residueTable = residueTableBuilder, srcResidueData = model.data.residues.getRawData(), residueData = residueTable.getRawData(), residueAtomStart = residueTable.atomStartIndex, residueAtomEnd = residueTable.atomEndIndex, residueAsymId = residueTable.asymId, residueAuthAsymId = residueTable.authAsymId, residueChain = residueTable.chainIndex, residueEntity = residueTable.entityIndex;
                    for (var _i = 0, _b = model.data.atoms.columns; _i < _b.length; _i++) {
                        var col = _b[_i];
                        var c = atomTable.addColumn(col.name, col.creator);
                        if (col.name === 'residueIndex')
                            atomResidue = c;
                        else if (col.name === 'chainIndex')
                            atomChain = c;
                        else if (col.name === 'entityIndex')
                            atomEntity = c;
                        else if (col.name === 'id')
                            atomId = c;
                        else {
                            cols[cols.length] = {
                                src: atoms[col.name],
                                target: c
                            };
                        }
                    }
                    var assemblyResidueParts = assemblyParts.residues, assemblyOpParts = assemblyParts.operators, temp = { x: 0, y: 0, z: 0 }, atomOffset = 0;
                    var rI = assemblyResidueParts[0], currentChain = residueChainIndex[rI], currentEntity = residueEntityIndex[rI], currentOp = assemblyOpParts[0], currentAsymId, currentAuthAsymId;
                    // setup entity table
                    cloneRow(srcEntityData, residueEntityIndex[rI], entityData, 0, srcEntityData.length);
                    entityChainStart[0] = 0;
                    entityResidueStart[0] = 0;
                    entityAtomStart[0] = 0;
                    //setup chain table
                    cloneRow(srcChainData, residueChainIndex[rI], chainData, 0, srcChainData.length);
                    chainEntity[0] = 0;
                    chainResidueStart[0] = 0;
                    chainAtomStart[0] = 0;
                    currentAsymId = model.data.chains.asymId[residueChainIndex[rI]];
                    currentAuthAsymId = model.data.chains.authAsymId[residueChainIndex[rI]];
                    var transform = transforms[assemblyOpParts[0]];
                    if (transform && !transform.isIdentity) {
                        chainId[chainOffset] = model.data.chains.asymId[residueChainIndex[rI]] + '-' + transform.id;
                        chainAuthId[chainOffset] = model.data.chains.authAsymId[residueChainIndex[rI]] + '-' + transform.id;
                        chainSourceChainIndex[chainOffset] = residueChainIndex[rI];
                        chainOperatorIndex[chainOffset] = currentOp;
                        currentAsymId = chainId[chainOffset];
                        currentAuthAsymId = chainAuthId[chainOffset];
                    }
                    for (var residueOffset = 0, _mi = assemblyResidueParts.length; residueOffset < _mi; residueOffset++) {
                        rI = assemblyResidueParts[residueOffset];
                        var opI = assemblyOpParts[residueOffset];
                        transform = transforms[opI];
                        cloneRow(srcResidueData, rI, residueData, residueOffset, residueData.length);
                        var cE = residueEntityIndex[rI], cC = residueChainIndex[rI];
                        var chainChanged = false;
                        if (cE !== currentEntity) {
                            // update chain
                            chainResidueEnd[chainOffset] = residueOffset;
                            chainAtomEnd[chainOffset] = atomOffset;
                            chainOffset += 1;
                            // update entity
                            entityChainEnd[entityOffset] = chainOffset;
                            entityResidueEnd[entityOffset] = residueOffset;
                            entityAtomEnd[entityOffset] = atomOffset;
                            // new entity
                            entityOffset += 1;
                            cloneRow(srcEntityData, cE, entityData, entityOffset, srcEntityData.length);
                            entityChainStart[entityOffset] = chainOffset;
                            entityResidueStart[entityOffset] = residueOffset;
                            entityAtomStart[entityOffset] = atomOffset;
                            chainChanged = true;
                        }
                        else if (cC !== currentChain) {
                            // update chain
                            chainResidueEnd[chainOffset] = residueOffset;
                            chainAtomEnd[chainOffset] = atomOffset;
                            chainOffset += 1;
                            chainChanged = true;
                        }
                        else if (opI !== currentOp) {
                            // update chain
                            chainResidueEnd[chainOffset] = residueOffset;
                            chainAtomEnd[chainOffset] = atomOffset;
                            chainOffset += 1;
                            chainChanged = true;
                        }
                        if (chainChanged) {
                            // new chain
                            cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                            chainEntity[chainOffset] = entityOffset;
                            chainResidueStart[chainOffset] = residueOffset;
                            chainAtomStart[chainOffset] = atomOffset;
                            // update the chain identifier if needed
                            if (!transform.isIdentity) {
                                chainId[chainOffset] = model.data.chains.asymId[cC] + '-' + transform.id;
                                chainAuthId[chainOffset] = model.data.chains.authAsymId[cC] + '-' + transform.id;
                            }
                            chainSourceChainIndex[chainOffset] = cC;
                            chainOperatorIndex[chainOffset] = opI;
                            currentAsymId = chainId[chainOffset];
                            currentAuthAsymId = chainAuthId[chainOffset];
                        }
                        currentChain = cC;
                        currentEntity = cE;
                        currentOp = opI;
                        residueChain[residueOffset] = chainOffset;
                        residueEntity[residueOffset] = entityOffset;
                        residueAtomStart[residueOffset] = atomOffset;
                        residueAsymId[residueOffset] = currentAsymId;
                        residueAuthAsymId[residueOffset] = currentAuthAsymId;
                        for (var aI = residueAtomStartIndex[rI], _mAI = residueAtomEndIndex[rI]; aI < _mAI; aI++) {
                            temp.x = x[aI];
                            temp.y = y[aI];
                            temp.z = z[aI];
                            Mat4.transformVector3(temp, temp, transform.transform);
                            atomX[atomOffset] = temp.x;
                            atomY[atomOffset] = temp.y;
                            atomZ[atomOffset] = temp.z;
                            atomId[atomOffset] = atomOffset + 1;
                            atomResidue[atomOffset] = residueOffset;
                            atomChain[atomOffset] = chainOffset;
                            atomEntity[atomOffset] = entityOffset;
                            for (var _c = 0, cols_1 = cols; _c < cols_1.length; _c++) {
                                var c = cols_1[_c];
                                c.target[atomOffset] = c.src[aI];
                            }
                            atomOffset++;
                        }
                        residueAtomEnd[residueOffset] = atomOffset;
                    }
                    // finalize entity
                    entityChainEnd[entityOffset] = chainOffset + 1;
                    entityResidueEnd[entityOffset] = assemblyResidueParts.length;
                    entityAtomEnd[entityOffset] = atomOffset;
                    // finalize chain
                    chainResidueEnd[chainOffset] = assemblyResidueParts.length;
                    chainAtomEnd[chainOffset] = atomOffset;
                    var finalAtoms = atomTable.seal(), finalResidues = residueTableBuilder.seal(), finalChains = chainTableBuilder.seal(), finalEntities = entityTableBuilder.seal();
                    var ss = buildSS(model, assemblyParts, finalResidues);
                    return Structure.Molecule.Model.create({
                        id: model.id,
                        modelId: model.modelId,
                        data: {
                            atoms: finalAtoms,
                            residues: finalResidues,
                            chains: finalChains,
                            entities: finalEntities,
                            bonds: {
                                component: model.data.bonds.component
                            },
                            secondaryStructure: ss,
                        },
                        positions: positionTable,
                        parent: model,
                        source: Structure.Molecule.Model.Source.Computed,
                        operators: transforms.map(function (t) { return new Structure.Operator(t.transform, t.id, t.isIdentity); })
                    });
                }
                function buildSS(parent, assemblyParts, newResidues) {
                    var index = parent.data.residues.secondaryStructureIndex;
                    var ss = parent.data.secondaryStructure;
                    var asymId = newResidues.asymId, seqNumber = newResidues.seqNumber, insCode = newResidues.insCode, secondaryStructureIndex = newResidues.secondaryStructureIndex;
                    var residues = assemblyParts.residues, operators = assemblyParts.operators;
                    var count = residues.length;
                    var ret = [];
                    var start = 0;
                    while (start < count) {
                        var end = start;
                        var ssI = index[residues[start]], op = operators[start];
                        while (end < count && operators[end] == op && index[residues[end]] == ssI)
                            end++;
                        var s = ss[ssI];
                        var e = new Structure.SecondaryStructureElement(s.type, new Structure.PolyResidueIdentifier(asymId[start], seqNumber[start], insCode[start]), new Structure.PolyResidueIdentifier(asymId[end - 1], seqNumber[end - 1], insCode[end - 1]), s.info);
                        e.startResidueIndex = start;
                        e.endResidueIndex = end;
                        var updatedSSI = ret.length;
                        for (var i = start; i < end; i++) {
                            secondaryStructureIndex[i] = updatedSSI;
                        }
                        ret[updatedSSI] = e;
                        start = end;
                    }
                    return ret;
                }
                function buildPivotGroupSymmetry(model, radius, pivotsQuery) {
                    var info = model.data.symmetryInfo;
                    if (!info
                        || info.spacegroupName === 'P 1'
                        || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                        return model;
                    }
                    var pivotIndices;
                    if (!pivotsQuery)
                        pivotIndices = model.data.atoms.indices;
                    else
                        pivotIndices = Structure.Query.apply(pivotsQuery, model).unionAtomIndices();
                    var bounds = getBoundingInfo(model, pivotIndices), spacegroup = new Structure.Spacegroup(info), ctx = createSymmetryContext(model, bounds, spacegroup, radius);
                    var transforms = findSuitableTransforms(ctx), residues = getSymmetryResidues(ctx, transforms);
                    return assemble(model, residues, transforms);
                }
                SymmetryHelpers.buildPivotGroupSymmetry = buildPivotGroupSymmetry;
                function findMates(model, radius) {
                    var bounds = getBoudingSphere(model.positions, model.positions.indices);
                    var spacegroup = new Structure.Spacegroup(model.data.symmetryInfo);
                    var t = Mat4.empty();
                    var v = { x: 0, y: 0, z: 0 };
                    var transforms = [];
                    for (var i = -3; i <= 3; i++) {
                        for (var j = -3; j <= 3; j++) {
                            for (var k = -3; k <= 3; k++) {
                                for (var op = 0; op < spacegroup.operatorCount; op++) {
                                    spacegroup.getOperatorMatrix(op, i, j, k, t);
                                    Mat4.transformVector3(v, bounds.center, t);
                                    if (getSphereDist(v, bounds.radius, bounds) > radius)
                                        continue;
                                    var copy = Mat4.empty();
                                    Mat4.copy(copy, t);
                                    transforms.push(createSymmetryTransform(i, j, k, op, copy));
                                }
                            }
                        }
                    }
                    return transforms;
                }
                function findMateParts(model, transforms) {
                    var _a = model.data, atoms = _a.atoms, chains = _a.chains, entities = _a.entities, residues = _a.residues;
                    var residueIndices = Core.Utils.ArrayBuilder.create(function (s) { return new Int32Array(s); }, residues.count * transforms.length, 1), operatorIndices = Core.Utils.ArrayBuilder.create(function (s) { return new Int32Array(s); }, residues.count * transforms.length, 1);
                    var atomCount = transforms.length * atoms.count;
                    var chainCount = transforms.length * chains.count;
                    var entityCount = entities.count;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        for (var opIndex = 0; opIndex < transforms.length; opIndex++) {
                            for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                                for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                    Core.Utils.ArrayBuilder.add(residueIndices, rI);
                                    Core.Utils.ArrayBuilder.add(operatorIndices, opIndex);
                                }
                            }
                        }
                    }
                    return {
                        residues: residueIndices.array,
                        operators: operatorIndices.array,
                        atomCount: atomCount,
                        chainCount: chainCount,
                        entityCount: entityCount
                    };
                }
                function buildMates(model, radius) {
                    var info = model.data.symmetryInfo;
                    if (!info
                        || info.spacegroupName === 'P 1'
                        || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                        return model;
                    }
                    var transforms = findMates(model, radius);
                    var parts = findMateParts(model, transforms);
                    return assemble(model, parts, transforms);
                }
                SymmetryHelpers.buildMates = buildMates;
                function createOperators(operators, list, i, current) {
                    if (i < 0) {
                        list[list.length] = current.slice(0);
                        return;
                    }
                    var ops = operators[i], len = ops.length;
                    for (var j = 0; j < len; j++) {
                        current[i] = ops[j];
                        createOperators(operators, list, i - 1, current);
                    }
                }
                function getAssemblyTransforms(model, operators) {
                    var info = model.data.assemblyInfo;
                    var transforms = [];
                    var index = 0;
                    for (var _i = 0, operators_1 = operators; _i < operators_1.length; _i++) {
                        var op = operators_1[_i];
                        var m = Mat4.identity();
                        for (var i = 0; i < op.length; i++) {
                            Mat4.mul(m, m, info.operators[op[i]].operator);
                        }
                        index++;
                        transforms[transforms.length] = createAssemblyTransform(index, m);
                    }
                    return transforms;
                }
                function getAssemblyParts(model, residueMask, currentTransforms, state) {
                    var _a = model.data, chains = _a.chains, entities = _a.entities, residues = _a.residues;
                    var residueIndices = state.residueIndices, operatorIndices = state.operatorIndices;
                    var atomCount = 0, chainCount = 0, entityCount = 0;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        var opIndex = state.transformsOffset; //0;
                        var chainAdded = false;
                        for (var _i = 0, currentTransforms_1 = currentTransforms; _i < currentTransforms_1.length; _i++) {
                            var _ = currentTransforms_1[_i];
                            for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                                var residueAdded = false;
                                for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                    if (!residueMask[rI])
                                        continue;
                                    Core.Utils.ChunkedArray.add(residueIndices, rI);
                                    Core.Utils.ChunkedArray.add(operatorIndices, opIndex);
                                    atomCount += residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                                    residueAdded = true;
                                }
                                if (residueAdded) {
                                    chainCount += 1;
                                    chainAdded = true;
                                }
                            }
                            opIndex++;
                        }
                        if (chainAdded) {
                            entityCount++;
                        }
                    }
                    state.atomCount += atomCount;
                    state.chainCount += chainCount;
                    state.entityCount += entityCount;
                    // return {
                    //     residues: residueIndices.compact(),
                    //     operators: operatorIndices.compact(),
                    //     atomCount,
                    //     chainCount,
                    //     entityCount
                    // };
                }
                function buildAssemblyEntry(model, entry, state) {
                    var ops = [], currentOp = [];
                    for (var i_2 = 0; i_2 < entry.operators.length; i_2++)
                        currentOp[i_2] = '';
                    createOperators(entry.operators, ops, entry.operators.length - 1, currentOp);
                    var transforms = getAssemblyTransforms(model, ops);
                    state.transformsOffset += state.transforms.length;
                    (_a = state.transforms).push.apply(_a, transforms);
                    var asymIds = Core.Utils.FastSet.create();
                    entry.asymIds.forEach(function (id) { return asymIds.add(id); });
                    var residueAsymIds = model.data.residues.asymId;
                    var residueCount = model.data.residues.count;
                    var mask = state.mask;
                    for (var i = 0; i < residueCount; i++) {
                        mask[i] = asymIds.has(residueAsymIds[i]);
                    }
                    getAssemblyParts(model, mask, transforms, state);
                    var _a;
                }
                SymmetryHelpers.buildAssemblyEntry = buildAssemblyEntry;
                function buildAssembly(model, assembly) {
                    var state = {
                        atomCount: 0,
                        chainCount: 0,
                        entityCount: 0,
                        transforms: [],
                        transformsOffset: 0,
                        mask: new Int8Array(model.data.residues.count),
                        residueIndices: Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, model.data.residues.count, 1),
                        operatorIndices: Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, model.data.residues.count, 1)
                    };
                    for (var _i = 0, _a = assembly.gens; _i < _a.length; _i++) {
                        var a = _a[_i];
                        buildAssemblyEntry(model, a, state);
                    }
                    var parts = {
                        residues: Core.Utils.ChunkedArray.compact(state.residueIndices),
                        operators: Core.Utils.ChunkedArray.compact(state.operatorIndices),
                        atomCount: state.atomCount,
                        chainCount: state.chainCount,
                        entityCount: state.entityCount
                    };
                    return assemble(model, parts, state.transforms);
                }
                SymmetryHelpers.buildAssembly = buildAssembly;
            })(SymmetryHelpers || (SymmetryHelpers = {}));
            function buildPivotGroupSymmetry(model, radius, pivotsQuery) {
                return SymmetryHelpers.buildPivotGroupSymmetry(model, radius, pivotsQuery);
            }
            Structure.buildPivotGroupSymmetry = buildPivotGroupSymmetry;
            function buildSymmetryMates(model, radius) {
                return SymmetryHelpers.buildMates(model, radius);
            }
            Structure.buildSymmetryMates = buildSymmetryMates;
            function buildAssembly(model, assembly) {
                return SymmetryHelpers.buildAssembly(model, assembly);
            }
            Structure.buildAssembly = buildAssembly;
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            var Query;
            (function (Query) {
                function apply(q, m) {
                    return Query.Builder.toQuery(q)(m.queryContext);
                }
                Query.apply = apply;
                /**
                 * The context of a query.
                 *
                 * Stores:
                 * - the mask of "active" atoms.
                 * - kd-tree for fast geometry queries.
                 * - the molecule itself.
                 *
                 */
                var Context = (function () {
                    function Context(structure, mask) {
                        this.structure = structure;
                        this.mask = mask;
                    }
                    Object.defineProperty(Context.prototype, "atomCount", {
                        /**
                         * Number of atoms in the current context.
                         */
                        get: function () {
                            return this.mask.size;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Context.prototype, "isComplete", {
                        /**
                         * Determine if the context contains all atoms of the input model.
                         */
                        get: function () {
                            return this.mask.size === this.structure.data.atoms.count;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Context.prototype, "tree", {
                        /**
                         * Get a kd-tree for the atoms in the current context.
                         */
                        get: function () {
                            if (!this.lazyTree)
                                this.makeTree();
                            return this.lazyTree;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    /**
                     * Checks if an atom is included in the current context.
                     */
                    Context.prototype.hasAtom = function (index) {
                        return !!this.mask.has(index);
                    };
                    /**
                     * Checks if an atom from the range is included in the current context.
                     */
                    Context.prototype.hasRange = function (start, end) {
                        for (var i = start; i < end; i++) {
                            if (this.mask.has(i))
                                return true;
                        }
                        return false;
                    };
                    /**
                     * Create a new context based on the provide structure.
                     */
                    Context.ofStructure = function (structure) {
                        return new Context(structure, Context.Mask.ofStructure(structure));
                    };
                    /**
                     * Create a new context from a sequence of fragments.
                     */
                    Context.ofFragments = function (seq) {
                        return new Context(seq.context.structure, Context.Mask.ofFragments(seq));
                    };
                    /**
                     * Create a new context from a sequence of fragments.
                     */
                    Context.ofAtomIndices = function (structure, atomIndices) {
                        return new Context(structure, Context.Mask.ofIndices(structure, atomIndices));
                    };
                    Context.prototype.makeTree = function () {
                        var data = new Int32Array(this.mask.size), dataCount = 0, _a = this.structure.positions, x = _a.x, y = _a.y, z = _a.z;
                        for (var i = 0, _b = this.structure.positions.count; i < _b; i++) {
                            if (this.mask.has(i))
                                data[dataCount++] = i;
                        }
                        this.lazyTree = Core.Geometry.SubdivisionTree3D.create(data, function (i, add) { return add(x[i], y[i], z[i]); });
                    };
                    return Context;
                }());
                Query.Context = Context;
                (function (Context) {
                    var Mask;
                    (function (Mask) {
                        var BitMask = (function () {
                            function BitMask(mask, size) {
                                this.mask = mask;
                                this.size = size;
                            }
                            BitMask.prototype.has = function (i) { return this.mask[i]; };
                            return BitMask;
                        }());
                        var AllMask = (function () {
                            function AllMask(size) {
                                this.size = size;
                            }
                            AllMask.prototype.has = function (i) { return true; };
                            return AllMask;
                        }());
                        function ofStructure(structure) {
                            return new AllMask(structure.data.atoms.count);
                        }
                        Mask.ofStructure = ofStructure;
                        function ofIndices(structure, atomIndices) {
                            var f = atomIndices.length / structure.data.atoms.count;
                            if (f < 0.25) {
                                var set = Core.Utils.FastSet.create();
                                for (var _i = 0, atomIndices_1 = atomIndices; _i < atomIndices_1.length; _i++) {
                                    var i = atomIndices_1[_i];
                                    set.add(i);
                                }
                                return set;
                            }
                            var mask = new Int8Array(structure.data.atoms.count);
                            for (var _a = 0, atomIndices_2 = atomIndices; _a < atomIndices_2.length; _a++) {
                                var i = atomIndices_2[_a];
                                mask[i] = 1;
                            }
                            return new BitMask(mask, atomIndices.length);
                        }
                        Mask.ofIndices = ofIndices;
                        function ofFragments(seq) {
                            var sizeEstimate = 0;
                            for (var _i = 0, _a = seq.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                sizeEstimate += f.atomCount;
                            }
                            var count = seq.context.structure.data.atoms.count;
                            if (sizeEstimate / count < 0.25) {
                                // create set;
                                var mask = Core.Utils.FastSet.create();
                                for (var _c = 0, _d = seq.fragments; _c < _d.length; _c++) {
                                    var f = _d[_c];
                                    for (var _e = 0, _f = f.atomIndices; _e < _f.length; _e++) {
                                        var i = _f[_e];
                                        mask.add(i);
                                    }
                                }
                                return mask;
                            }
                            else {
                                var mask = new Int8Array(count);
                                for (var _g = 0, _h = seq.fragments; _g < _h.length; _g++) {
                                    var f = _h[_g];
                                    for (var _j = 0, _k = f.atomIndices; _j < _k.length; _j++) {
                                        var i = _k[_j];
                                        mask[i] = 1;
                                    }
                                }
                                var size = 0;
                                for (var i = 0; i < count; i++) {
                                    if (mask[i] !== 0)
                                        size++;
                                }
                                return new BitMask(mask, size);
                            }
                        }
                        Mask.ofFragments = ofFragments;
                    })(Mask = Context.Mask || (Context.Mask = {}));
                })(Context = Query.Context || (Query.Context = {}));
                /**
                 * The basic element of the query language.
                 * Everything is represented as a fragment.
                 */
                var Fragment = (function () {
                    /**
                     * Create a fragment from an integer set.
                     */
                    function Fragment(context, tag, atomIndices) {
                        this._hashCode = 0;
                        this._hashComputed = false;
                        this.context = context;
                        this.tag = tag;
                        this.atomIndices = atomIndices;
                    }
                    Object.defineProperty(Fragment.prototype, "hashCode", {
                        /**
                         * The hash code of the fragment.
                         */
                        get: function () {
                            if (this._hashComputed)
                                return this._hashCode;
                            var code = 23;
                            for (var _i = 0, _a = this.atomIndices; _i < _a.length; _i++) {
                                var i = _a[_i];
                                code = (31 * code + i) | 0;
                            }
                            this._hashCode = code;
                            this._hashComputed = true;
                            return code;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "id", {
                        /**
                         * Id composed of <moleculeid>_<tag>.
                         */
                        get: function () {
                            return this.context.structure.id + "_" + this.tag;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "atomCount", {
                        /**
                         * Number of atoms.
                         */
                        get: function () {
                            return this.atomIndices.length;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "isHet", {
                        /**
                         * Determines if a fragment is HET based on the tag.
                         */
                        get: function () {
                            var residue = this.context.structure.data.atoms.residueIndex[this.tag];
                            return this.context.structure.data.residues.isHet[residue];
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "fingerprint", {
                        /**
                         * A sorted list of residue identifiers.
                         */
                        get: function () {
                            if (this._fingerprint)
                                return this._fingerprint;
                            var indexList = this.residueIndices, residues = this.context.structure.data.residues, cName = residues.name, cAsym = residues.asymId, cSeq = residues.seqNumber, insCode = residues.insCode, names = [];
                            for (var _i = 0, indexList_1 = indexList; _i < indexList_1.length; _i++) {
                                var i = indexList_1[_i];
                                var name_1 = cName[i] + " " + cAsym[i] + " " + cSeq[i];
                                if (insCode[i])
                                    name_1 += " i:" + insCode[i];
                                names[names.length] = name_1;
                            }
                            return names.join("-");
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "authFingerprint", {
                        /**
                         * A sorted list of residue identifiers.
                         */
                        get: function () {
                            if (this._authFingerprint)
                                return this._authFingerprint;
                            var indexList = this.residueIndices, residues = this.context.structure.data.residues, cName = residues.authName, cAsym = residues.authAsymId, cSeq = residues.authSeqNumber, insCode = residues.insCode, names = [];
                            for (var _i = 0, indexList_2 = indexList; _i < indexList_2.length; _i++) {
                                var i = indexList_2[_i];
                                var name_2 = cName[i] + " " + cAsym[i] + " " + cSeq[i];
                                if (insCode[i])
                                    name_2 += " i:" + insCode[i];
                                names[names.length] = name_2;
                            }
                            return names.join("-");
                        },
                        enumerable: true,
                        configurable: true
                    });
                    /**
                     * Executes a query on the current fragment.
                     */
                    Fragment.prototype.find = function (what) {
                        var ctx = Context.ofFragments(new FragmentSeq(this.context, [this]));
                        return Query.Builder.toQuery(what)(ctx);
                    };
                    Fragment.prototype.computeIndices = function () {
                        if (this._residueIndices)
                            return;
                        var residueIndices = Core.Utils.FastSet.create(), chainIndices = Core.Utils.FastSet.create(), entityIndices = Core.Utils.FastSet.create(), rIndices = this.context.structure.data.atoms.residueIndex, cIndices = this.context.structure.data.residues.chainIndex, eIndices = this.context.structure.data.chains.entityIndex;
                        for (var _i = 0, _a = this.atomIndices; _i < _a.length; _i++) {
                            var i = _a[_i];
                            residueIndices.add(rIndices[i]);
                        }
                        this._residueIndices = Core.Utils.integerSetToSortedTypedArray(residueIndices);
                        for (var _c = 0, _d = this._residueIndices; _c < _d.length; _c++) {
                            var i = _d[_c];
                            chainIndices.add(cIndices[i]);
                        }
                        this._chainIndices = Core.Utils.integerSetToSortedTypedArray(chainIndices);
                        for (var _e = 0, _f = this._chainIndices; _e < _f.length; _e++) {
                            var i = _f[_e];
                            entityIndices.add(eIndices[i]);
                        }
                        this._entityIndices = Core.Utils.integerSetToSortedTypedArray(entityIndices);
                    };
                    Object.defineProperty(Fragment.prototype, "residueIndices", {
                        /**
                         * A sorted list of residue indices.
                         */
                        get: function () {
                            this.computeIndices();
                            return this._residueIndices;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "chainIndices", {
                        /**
                         * A sorted list of chain indices.
                         */
                        get: function () {
                            this.computeIndices();
                            return this._chainIndices;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "entityIndices", {
                        /**
                         * A sorted list of entity indices.
                         */
                        get: function () {
                            this.computeIndices();
                            return this._entityIndices;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Fragment.areEqual = function (a, b) {
                        if (a.atomCount !== b.atomCount)
                            return false;
                        var xs = a.atomIndices, ys = b.atomIndices;
                        for (var i = 0; i < xs.length; i++) {
                            if (xs[i] !== ys[i])
                                return false;
                        }
                        return a.tag === b.tag;
                    };
                    /**
                     * Create a fragment from an integer set.
                     * Assumes the set is in the given context's mask.
                     */
                    Fragment.ofSet = function (context, atomIndices) {
                        var array = new Int32Array(atomIndices.size);
                        atomIndices.forEach(function (i, ctx) { ctx.array[ctx.index++] = i; }, { array: array, index: 0 });
                        Array.prototype.sort.call(array, function (a, b) { return a - b; });
                        return new Fragment(context, array[0], array);
                    };
                    /**
                     * Create a fragment from an integer array.
                     * Assumes the set is in the given context's mask.
                     * Assumes the array is sorted.
                     */
                    Fragment.ofArray = function (context, tag, atomIndices) {
                        return new Fragment(context, tag, atomIndices);
                    };
                    /**
                     * Create a fragment from a single index.
                     * Assumes the index is in the given context's mask.
                     */
                    Fragment.ofIndex = function (context, index) {
                        var indices = new Int32Array(1);
                        indices[0] = index;
                        return new Fragment(context, index, indices);
                    };
                    /**
                     * Create a fragment from a <start,end) range.
                     * Assumes the fragment is non-empty in the given context's mask.
                     */
                    Fragment.ofIndexRange = function (context, start, endExclusive) {
                        var count = 0;
                        for (var i = start; i < endExclusive; i++) {
                            if (context.hasAtom(i))
                                count++;
                        }
                        var atoms = new Int32Array(count), offset = 0;
                        for (var i = start; i < endExclusive; i++) {
                            if (context.hasAtom(i))
                                atoms[offset++] = i;
                        }
                        return new Fragment(context, start, atoms);
                    };
                    return Fragment;
                }());
                Query.Fragment = Fragment;
                /**
                 * A sequence of fragments the queries operate on.
                 */
                var FragmentSeq = (function () {
                    function FragmentSeq(context, fragments) {
                        this.context = context;
                        this.fragments = fragments;
                    }
                    FragmentSeq.empty = function (ctx) {
                        return new FragmentSeq(ctx, []);
                    };
                    Object.defineProperty(FragmentSeq.prototype, "length", {
                        get: function () {
                            return this.fragments.length;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    /**
                     * Merges atom indices from all fragments.
                     */
                    FragmentSeq.prototype.unionAtomIndices = function () {
                        if (!this.length)
                            return [];
                        if (this.length === 1)
                            return this.fragments[0].atomIndices;
                        var map = new Int8Array(this.context.structure.data.atoms.count), atomCount = 0;
                        for (var _i = 0, _a = this.fragments; _i < _a.length; _i++) {
                            var f = _a[_i];
                            for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                                var i = _d[_c];
                                map[i] = 1;
                            }
                        }
                        for (var _e = 0, map_1 = map; _e < map_1.length; _e++) {
                            var i = map_1[_e];
                            atomCount += i;
                        }
                        var ret = new Int32Array(atomCount), offset = 0;
                        for (var i = 0, _l = map.length; i < _l; i++) {
                            if (map[i])
                                ret[offset++] = i;
                        }
                        return ret;
                    };
                    /**
                     * Merges atom indices from all fragments into a single fragment.
                     */
                    FragmentSeq.prototype.unionFragment = function () {
                        if (!this.length)
                            return new Fragment(this.context, 0, new Int32Array(0));
                        if (this.length === 1)
                            return this.fragments[0];
                        var union = this.unionAtomIndices();
                        return new Fragment(this.context, union[0], union);
                    };
                    return FragmentSeq;
                }());
                Query.FragmentSeq = FragmentSeq;
                /**
                 * A builder that includes all fragments.
                 */
                var FragmentSeqBuilder = (function () {
                    function FragmentSeqBuilder(ctx) {
                        this.ctx = ctx;
                        this.fragments = [];
                    }
                    FragmentSeqBuilder.prototype.add = function (f) {
                        this.fragments[this.fragments.length] = f;
                    };
                    FragmentSeqBuilder.prototype.getSeq = function () {
                        return new FragmentSeq(this.ctx, this.fragments);
                    };
                    return FragmentSeqBuilder;
                }());
                Query.FragmentSeqBuilder = FragmentSeqBuilder;
                /**
                 * A builder that includes only unique fragments.
                 */
                var HashFragmentSeqBuilder = (function () {
                    function HashFragmentSeqBuilder(ctx) {
                        this.ctx = ctx;
                        this.fragments = [];
                        this.byHash = Core.Utils.FastMap.create();
                    }
                    HashFragmentSeqBuilder.prototype.add = function (f) {
                        var hash = f.hashCode;
                        if (this.byHash.has(hash)) {
                            var fs = this.byHash.get(hash);
                            for (var _i = 0, fs_1 = fs; _i < fs_1.length; _i++) {
                                var q = fs_1[_i];
                                if (Fragment.areEqual(f, q))
                                    return this;
                            }
                            this.fragments[this.fragments.length] = f;
                            fs[fs.length] = f;
                        }
                        else {
                            this.fragments[this.fragments.length] = f;
                            this.byHash.set(hash, [f]);
                        }
                        return this;
                    };
                    HashFragmentSeqBuilder.prototype.getSeq = function () {
                        return new FragmentSeq(this.ctx, this.fragments);
                    };
                    return HashFragmentSeqBuilder;
                }());
                Query.HashFragmentSeqBuilder = HashFragmentSeqBuilder;
            })(Query = Structure.Query || (Structure.Query = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            var Query;
            (function (Query) {
                var Builder;
                (function (Builder) {
                    Builder.BuilderPrototype = {};
                    function registerModifier(name, f) {
                        Builder.BuilderPrototype[name] = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return f.call.apply(f, [void 0, this].concat(args));
                        };
                    }
                    Builder.registerModifier = registerModifier;
                    function build(compile) {
                        return Object.create(Builder.BuilderPrototype, { compile: { writable: false, configurable: false, value: compile } });
                    }
                    Builder.build = build;
                    function isBuilder(e) {
                        return !!e.compile;
                    }
                    function parse(query) {
                        if (typeof window === 'undefined')
                            throw 'parse can only be called from a browser.';
                        (function () { }(), eval)("with (LiteMol.Core.Structure.Query) { window.__LiteMol_query = " + query + "; }");
                        var q = window.__LiteMol_query;
                        window.__LiteMol_query = void 0;
                        return q.compile();
                    }
                    Builder.parse = parse;
                    function toQuery(q) {
                        var ret;
                        if (isBuilder(q))
                            ret = q.compile();
                        else if (typeof q === 'string' || q instanceof String)
                            ret = parse(q);
                        else
                            ret = q;
                        return ret;
                    }
                    Builder.toQuery = toQuery;
                })(Builder = Query.Builder || (Query.Builder = {}));
                function atomsByElement() {
                    var elements = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        elements[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtoms(elements, function (m) { return m.data.atoms.elementSymbol; }); });
                }
                Query.atomsByElement = atomsByElement;
                function atomsByName() {
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtoms(names, function (m) { return m.data.atoms.name; }); });
                }
                Query.atomsByName = atomsByName;
                function atomsById() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtoms(ids, function (m) { return m.data.atoms.id; }); });
                }
                Query.atomsById = atomsById;
                function residues() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(false, ids, function (m) { return m.data.residues; }); });
                }
                Query.residues = residues;
                function chains() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(false, ids, function (m) { return m.data.chains; }); });
                }
                Query.chains = chains;
                function entities() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(false, ids, function (m) { return m.data.entities; }); });
                }
                Query.entities = entities;
                function notEntities() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(true, ids, function (m) { return m.data.entities; }); });
                }
                Query.notEntities = notEntities;
                function everything() { return Builder.build(function () { return Compiler.compileEverything(); }); }
                Query.everything = everything;
                function entitiesFromIndices(indices) { return Builder.build(function () { return Compiler.compileFromIndices(false, indices, function (m) { return m.data.entities; }); }); }
                Query.entitiesFromIndices = entitiesFromIndices;
                function chainsFromIndices(indices) { return Builder.build(function () { return Compiler.compileFromIndices(false, indices, function (m) { return m.data.chains; }); }); }
                Query.chainsFromIndices = chainsFromIndices;
                function residuesFromIndices(indices) { return Builder.build(function () { return Compiler.compileFromIndices(false, indices, function (m) { return m.data.residues; }); }); }
                Query.residuesFromIndices = residuesFromIndices;
                function atomsFromIndices(indices) { return Builder.build(function () { return Compiler.compileAtomIndices(indices); }); }
                Query.atomsFromIndices = atomsFromIndices;
                function sequence(entityId, asymId, startId, endId) { return Builder.build(function () { return Compiler.compileSequence(entityId, asymId, startId, endId); }); }
                Query.sequence = sequence;
                function hetGroups() { return Builder.build(function () { return Compiler.compileHetGroups(); }); }
                Query.hetGroups = hetGroups;
                function nonHetPolymer() { return Builder.build(function () { return Compiler.compileNonHetPolymer(); }); }
                Query.nonHetPolymer = nonHetPolymer;
                function polymerTrace() {
                    var atomNames = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        atomNames[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compilePolymerNames(atomNames, false); });
                }
                Query.polymerTrace = polymerTrace;
                function cartoons() { return or(Builder.build(function () { return Compiler.compilePolymerNames(["CA", "O", "O5'", "C3'", "N3"], false); }), hetGroups(), entities({ type: 'water' })); }
                Query.cartoons = cartoons;
                function backbone() { return Builder.build(function () { return Compiler.compilePolymerNames(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"], false); }); }
                Query.backbone = backbone;
                function sidechain() { return Builder.build(function () { return Compiler.compilePolymerNames(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"], true); }); }
                Query.sidechain = sidechain;
                function atomsInBox(min, max) { return Builder.build(function () { return Compiler.compileAtomsInBox(min, max); }); }
                Query.atomsInBox = atomsInBox;
                function or() {
                    var elements = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        elements[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileOr(elements); });
                }
                Query.or = or;
                Builder.registerModifier('complement', complement);
                function complement(q) { return Builder.build(function () { return Compiler.compileComplement(q); }); }
                Query.complement = complement;
                Builder.registerModifier('ambientResidues', ambientResidues);
                function ambientResidues(q, radius) { return Builder.build(function () { return Compiler.compileAmbientResidues(q, radius); }); }
                Query.ambientResidues = ambientResidues;
                Builder.registerModifier('wholeResidues', wholeResidues);
                function wholeResidues(q) { return Builder.build(function () { return Compiler.compileWholeResidues(q); }); }
                Query.wholeResidues = wholeResidues;
                Builder.registerModifier('union', union);
                function union(q) { return Builder.build(function () { return Compiler.compileUnion(q); }); }
                Query.union = union;
                Builder.registerModifier('inside', inside);
                function inside(q, where) { return Builder.build(function () { return Compiler.compileInside(q, where); }); }
                Query.inside = inside;
                Builder.registerModifier('intersectWith', intersectWith);
                function intersectWith(what, where) { return Builder.build(function () { return Compiler.compileIntersectWith(what, where); }); }
                Query.intersectWith = intersectWith;
                Builder.registerModifier('flatten', flatten);
                function flatten(what, selector) { return Builder.build(function () { return Compiler.compileFlatten(what, selector); }); }
                Query.flatten = flatten;
                /**
                 * Shortcuts
                 */
                function residuesByName() {
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    return residues.apply(void 0, names.map(function (n) { return ({ name: n }); }));
                }
                Query.residuesByName = residuesByName;
                function residuesById() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return residues.apply(void 0, ids.map(function (id) { return ({ authSeqNumber: id }); }));
                }
                Query.residuesById = residuesById;
                function chainsById() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return chains.apply(void 0, ids.map(function (id) { return ({ authAsymId: id }); }));
                }
                Query.chainsById = chainsById;
                /**
                 * Query compilation wrapper.
                 */
                var Compiler;
                (function (Compiler) {
                    var OptimizedId = (function () {
                        function OptimizedId(id, arrays) {
                            this.columns = [];
                            for (var _i = 0, _a = Object.keys(id); _i < _a.length; _i++) {
                                var key = _a[_i];
                                if (id[key] !== void 0 && !!arrays[key]) {
                                    this.columns.push({ value: id[key], array: arrays[key] });
                                }
                            }
                        }
                        OptimizedId.prototype.isSatisfied = function (i) {
                            for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                                var c = _a[_i];
                                if (c.value !== c.array[i])
                                    return false;
                            }
                            return true;
                        };
                        return OptimizedId;
                    }());
                    function compileEverything() {
                        return function (ctx) {
                            if (ctx.isComplete) {
                                var atoms = ctx.structure.data.atoms.indices;
                                return new Query.FragmentSeq(ctx, [new Query.Fragment(ctx, atoms[0], atoms)]);
                            }
                            var indices = new Int32Array(ctx.atomCount);
                            var offset = 0;
                            for (var _i = 0, _a = ctx.structure.data.atoms.indices; _i < _a.length; _i++) {
                                var i = _a[_i];
                                if (ctx.hasAtom(i))
                                    indices[offset++] = i;
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, indices[0], indices)]);
                        };
                    }
                    Compiler.compileEverything = compileEverything;
                    function compileAtoms(elements, sel) {
                        return function (ctx) {
                            var set = Core.Utils.FastSet.ofArray(elements), data = sel(ctx.structure), fragments = new Query.FragmentSeqBuilder(ctx);
                            for (var i = 0, _b = data.length; i < _b; i++) {
                                if (ctx.hasAtom(i) && set.has(data[i]))
                                    fragments.add(Query.Fragment.ofIndex(ctx, i));
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileAtoms = compileAtoms;
                    function compileAtomIndices(indices) {
                        return function (ctx) {
                            var count = 0;
                            for (var _i = 0, indices_3 = indices; _i < indices_3.length; _i++) {
                                var aI = indices_3[_i];
                                if (ctx.hasAtom(aI))
                                    count++;
                            }
                            if (!count)
                                return Query.FragmentSeq.empty(ctx);
                            var offset = 0;
                            var f = new Int32Array(count);
                            for (var _a = 0, indices_4 = indices; _a < indices_4.length; _a++) {
                                var aI = indices_4[_a];
                                if (ctx.hasAtom(aI))
                                    f[offset++] = aI;
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, f[0], f)]);
                        };
                    }
                    Compiler.compileAtomIndices = compileAtomIndices;
                    function compileFromIndices(complement, indices, tableProvider) {
                        return function (ctx) {
                            var table = tableProvider(ctx.structure), atomStartIndex = table.atomStartIndex, atomEndIndex = table.atomEndIndex, fragments = new Query.FragmentSeqBuilder(ctx);
                            if (complement) {
                                var exclude = Core.Utils.FastSet.ofArray(indices);
                                var count = table.count;
                                for (var i = 0; i < count; i++) {
                                    if (exclude.has(i))
                                        continue;
                                    if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i]))
                                        continue;
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                                }
                            }
                            else {
                                for (var _i = 0, indices_5 = indices; _i < indices_5.length; _i++) {
                                    var i = indices_5[_i];
                                    if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i]))
                                        continue;
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileFromIndices = compileFromIndices;
                    function compileAtomRanges(complement, ids, tableProvider) {
                        return function (ctx) {
                            var table = tableProvider(ctx.structure), atomIndexStart = table.atomStartIndex, atomIndexEnd = table.atomEndIndex, fragments = new Query.FragmentSeqBuilder(ctx), count = table.count, include = false;
                            var optimized = ids.map(function (id) { return new OptimizedId(id, table); });
                            var isEmptyIds = optimized.length === 0;
                            for (var i = 0; i < count; i++) {
                                if (!ctx.hasRange(atomIndexStart[i], atomIndexEnd[i]))
                                    continue;
                                include = isEmptyIds;
                                for (var _i = 0, optimized_1 = optimized; _i < optimized_1.length; _i++) {
                                    var id = optimized_1[_i];
                                    if (id.isSatisfied(i)) {
                                        include = true;
                                        break;
                                    }
                                }
                                if (complement)
                                    include = !include;
                                if (include) {
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomIndexStart[i], atomIndexEnd[i]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileAtomRanges = compileAtomRanges;
                    function compileSequence(seqEntityId, seqAsymId, start, end) {
                        return function (ctx) {
                            var _a = ctx.structure.data, residues = _a.residues, chains = _a.chains, seqNumber = residues.seqNumber, atomStartIndex = residues.atomStartIndex, atomEndIndex = residues.atomEndIndex, entityId = chains.entityId, count = chains.count, residueStartIndex = chains.residueStartIndex, residueEndIndex = chains.residueEndIndex, fragments = new Query.FragmentSeqBuilder(ctx);
                            var parent = ctx.structure.parent, sourceChainIndex = chains.sourceChainIndex, isComputed = parent && sourceChainIndex;
                            var targetAsymId = typeof seqAsymId === 'string' ? { asymId: seqAsymId } : seqAsymId;
                            var optTargetAsymId = new OptimizedId(targetAsymId, isComputed ? parent.data.chains : chains);
                            //optAsymId.isSatisfied();
                            for (var cI = 0; cI < count; cI++) {
                                if (entityId[cI] !== seqEntityId
                                    || !optTargetAsymId.isSatisfied(isComputed ? sourceChainIndex[cI] : cI)) {
                                    continue;
                                }
                                var i = residueStartIndex[cI], last = residueEndIndex[cI], startIndex = -1, endIndex = -1;
                                for (; i < last; i++) {
                                    if (seqNumber[i] >= start.seqNumber) {
                                        startIndex = i;
                                        break;
                                    }
                                }
                                if (i === last)
                                    continue;
                                for (i = startIndex; i < last; i++) {
                                    if (seqNumber[i] >= end.seqNumber) {
                                        break;
                                    }
                                }
                                endIndex = i;
                                if (ctx.hasRange(atomStartIndex[startIndex], atomEndIndex[endIndex])) {
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[startIndex], atomEndIndex[endIndex]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileSequence = compileSequence;
                    function compileHetGroups() {
                        return function (ctx) {
                            var _a = ctx.structure.data.residues, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, isHet = _a.isHet, entityIndex = _a.entityIndex, count = _a.count, entityType = ctx.structure.data.entities.type, water = 'water', fragments = new Query.FragmentSeqBuilder(ctx);
                            for (var i = 0; i < count; i++) {
                                if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i]))
                                    continue;
                                if (entityType[entityIndex[i]] === water)
                                    continue;
                                if (isHet[i]) {
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileHetGroups = compileHetGroups;
                    function compileNonHetPolymer() {
                        return function (ctx) {
                            var _a = ctx.structure.data.residues, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, _c = ctx.structure.data.entities, entityType = _c.type, entityCount = _c.count, eRS = _c.residueStartIndex, eRE = _c.residueEndIndex, polymer = 'polymer', size = 0;
                            for (var eI = 0; eI < entityCount; eI++) {
                                if (entityType[eI] !== polymer)
                                    continue;
                                for (var rI = eRS[eI], _bR = eRE[eI]; rI < _bR; rI++) {
                                    for (var aI = atomStartIndex[rI], _bA = atomEndIndex[rI]; aI < _bA; aI++) {
                                        if (ctx.hasAtom(aI))
                                            size++;
                                    }
                                }
                            }
                            if (!size)
                                return Query.FragmentSeq.empty(ctx);
                            var f = new Int32Array(size), offset = 0;
                            for (var eI = 0; eI < entityCount; eI++) {
                                if (entityType[eI] !== polymer)
                                    continue;
                                for (var rI = eRS[eI], _bR = eRE[eI]; rI < _bR; rI++) {
                                    for (var aI = atomStartIndex[rI], _bA = atomEndIndex[rI]; aI < _bA; aI++) {
                                        if (ctx.hasAtom(aI))
                                            f[offset++] = aI;
                                    }
                                }
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, f[0], f)]);
                        };
                    }
                    Compiler.compileNonHetPolymer = compileNonHetPolymer;
                    function compileAtomsInBox(min, max) {
                        return function (ctx) {
                            var positions = ctx.structure.positions, xs = positions.x, ys = positions.y, zs = positions.z, count = positions.count, fragment = [];
                            for (var i = 0; i < count; i++) {
                                if (!ctx.hasAtom(i))
                                    continue;
                                var x = xs[i], y = ys[i], z = zs[i];
                                if (x >= min.x && x <= max.x
                                    && y >= min.y && y <= max.y
                                    && z >= min.z && z <= max.z) {
                                    fragment[fragment.length] = i;
                                }
                            }
                            if (!fragment.length)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [new Query.Fragment(ctx, fragment[0], fragment)]);
                        };
                    }
                    Compiler.compileAtomsInBox = compileAtomsInBox;
                    function compileInside(what, where) {
                        var _what = Builder.toQuery(what);
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            return new Query.FragmentSeq(ctx, _what(Query.Context.ofFragments(_where(ctx))).fragments);
                        };
                    }
                    Compiler.compileInside = compileInside;
                    function narrowFragment(ctx, f, m) {
                        var count = 0;
                        for (var _i = 0, _a = f.atomIndices; _i < _a.length; _i++) {
                            var i = _a[_i];
                            if (m.has(i))
                                count++;
                        }
                        if (!count)
                            return void 0;
                        var ret = new Int32Array(count);
                        var offset = 0;
                        for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                            var i = _d[_c];
                            if (m.has(i))
                                ret[offset++] = i;
                        }
                        return Query.Fragment.ofArray(ctx, ret[0], ret);
                    }
                    function compileIntersectWith(what, where) {
                        var _what = Builder.toQuery(what);
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            var fs = _what(ctx);
                            var map = Query.Context.Mask.ofFragments(_where(ctx));
                            var ret = new Query.FragmentSeqBuilder(ctx);
                            for (var _i = 0, _a = fs.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var n = narrowFragment(ctx, f, map);
                                if (n)
                                    ret.add(n);
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileIntersectWith = compileIntersectWith;
                    function compileFilter(what, filter) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var src = _what(ctx).fragments, result = new Query.FragmentSeqBuilder(ctx), f;
                            for (var i = 0; i < src.length; i++) {
                                f = src[i];
                                if (filter(f))
                                    result.add(f);
                            }
                            return result.getSeq();
                        };
                    }
                    Compiler.compileFilter = compileFilter;
                    function compileComplement(what) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var mask = Query.Context.Mask.ofFragments(_what(ctx)), count = 0, offset = 0;
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i) && !mask.has(i))
                                    count++;
                            }
                            if (!count)
                                return Query.FragmentSeq.empty(ctx);
                            var atoms = new Int32Array(count);
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i) && !mask.has(i))
                                    atoms[offset++] = i;
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, atoms[0], atoms)]);
                        };
                    }
                    Compiler.compileComplement = compileComplement;
                    function compileOr(queries) {
                        var _qs = queries.map(function (q) { return Builder.toQuery(q); });
                        return function (ctx) {
                            var fragments = new Query.HashFragmentSeqBuilder(ctx);
                            for (var _i = 0, _qs_1 = _qs; _i < _qs_1.length; _i++) {
                                var q = _qs_1[_i];
                                var r = q(ctx);
                                for (var _a = 0, _c = r.fragments; _a < _c.length; _a++) {
                                    var f = _c[_a];
                                    fragments.add(f);
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileOr = compileOr;
                    function compileUnion(what) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var src = _what(ctx).fragments, indices = Core.Utils.FastSet.create(), j = 0, atoms;
                            for (var i = 0; i < src.length; i++) {
                                atoms = src[i].atomIndices;
                                for (j = 0; j < atoms.length; j++)
                                    indices.add(atoms[j]);
                            }
                            if (indices.size === 0)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofSet(ctx, indices)]);
                        };
                    }
                    Compiler.compileUnion = compileUnion;
                    function compilePolymerNames(names, complement) {
                        return function (ctx) {
                            var structure = ctx.structure, entities = structure.data.entities, atomNames = structure.data.atoms.name, indices = [], indexCount = 0;
                            var allowedNames = Core.Utils.FastSet.ofArray(names);
                            if (complement) {
                                for (var ei = 0; ei < structure.data.entities.count; ei++) {
                                    if (entities.type[ei] !== 'polymer')
                                        continue;
                                    var start = entities.atomStartIndex[ei], end = entities.atomEndIndex[ei];
                                    for (var i = start; i < end; i++) {
                                        if (ctx.hasAtom(i) && !allowedNames.has(atomNames[i]))
                                            indices[indexCount++] = i;
                                    }
                                }
                            }
                            else {
                                for (var ei = 0; ei < entities.count; ei++) {
                                    if (entities.type[ei] !== 'polymer')
                                        continue;
                                    var start = entities.atomStartIndex[ei], end = entities.atomEndIndex[ei];
                                    for (var i = start; i < end; i++) {
                                        if (ctx.hasAtom(i) && allowedNames.has(atomNames[i]))
                                            indices[indexCount++] = i;
                                    }
                                }
                            }
                            if (!indices.length)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, indices[0], new Int32Array(indices))]);
                        };
                    }
                    Compiler.compilePolymerNames = compilePolymerNames;
                    function compileAmbientResidues(where, radius) {
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            var src = _where(ctx), tree = ctx.tree, radiusCtx = Core.Geometry.SubdivisionTree3D.createContextRadius(tree, radius, false), buffer = radiusCtx.buffer, ret = new Query.HashFragmentSeqBuilder(ctx), _a = ctx.structure.positions, x = _a.x, y = _a.y, z = _a.z, residueIndex = ctx.structure.data.atoms.residueIndex, atomStart = ctx.structure.data.residues.atomStartIndex, atomEnd = ctx.structure.data.residues.atomEndIndex, treeData = tree.data;
                            for (var _i = 0, _c = src.fragments; _i < _c.length; _i++) {
                                var f = _c[_i];
                                var residues_1 = Core.Utils.FastSet.create();
                                for (var _d = 0, _e = f.atomIndices; _d < _e.length; _d++) {
                                    var i = _e[_d];
                                    residues_1.add(residueIndex[i]);
                                    radiusCtx.nearest(x[i], y[i], z[i], radius);
                                    for (var j = 0, _l = buffer.count; j < _l; j++) {
                                        residues_1.add(residueIndex[treeData[buffer.indices[j]]]);
                                    }
                                }
                                var atomCount = { count: 0, start: atomStart, end: atomEnd };
                                residues_1.forEach(function (r, ctx) { ctx.count += ctx.end[r] - ctx.start[r]; }, atomCount);
                                var indices = new Int32Array(atomCount.count), atomIndices = { indices: indices, offset: 0, start: atomStart, end: atomEnd };
                                residues_1.forEach(function (r, ctx) {
                                    for (var i = ctx.start[r], _l = ctx.end[r]; i < _l; i++) {
                                        ctx.indices[ctx.offset++] = i;
                                    }
                                }, atomIndices);
                                Array.prototype.sort.call(indices, function (a, b) { return a - b; });
                                ret.add(Query.Fragment.ofArray(ctx, indices[0], indices));
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileAmbientResidues = compileAmbientResidues;
                    function compileWholeResidues(where) {
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            var src = _where(ctx), ret = new Query.HashFragmentSeqBuilder(ctx), residueIndex = ctx.structure.data.atoms.residueIndex, atomStart = ctx.structure.data.residues.atomStartIndex, atomEnd = ctx.structure.data.residues.atomEndIndex;
                            for (var _i = 0, _a = src.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var residues_2 = Core.Utils.FastSet.create();
                                for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                                    var i = _d[_c];
                                    residues_2.add(residueIndex[i]);
                                }
                                var atomCount = { count: 0, start: atomStart, end: atomEnd };
                                residues_2.forEach(function (r, ctx) { ctx.count += ctx.end[r] - ctx.start[r]; }, atomCount);
                                var indices = new Int32Array(atomCount.count), atomIndices = { indices: indices, offset: 0, start: atomStart, end: atomEnd };
                                residues_2.forEach(function (r, ctx) {
                                    for (var i = ctx.start[r], _l = ctx.end[r]; i < _l; i++) {
                                        ctx.indices[ctx.offset++] = i;
                                    }
                                }, atomIndices);
                                Array.prototype.sort.call(indices, function (a, b) { return a - b; });
                                ret.add(Query.Fragment.ofArray(ctx, indices[0], indices));
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileWholeResidues = compileWholeResidues;
                    function compileFlatten(what, selector) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var fs = _what(ctx);
                            var ret = new Query.HashFragmentSeqBuilder(ctx);
                            for (var _i = 0, _a = fs.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var xs = selector(f);
                                for (var _c = 0, _d = xs.fragments; _c < _d.length; _c++) {
                                    var x = _d[_c];
                                    ret.add(x);
                                }
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileFlatten = compileFlatten;
                })(Compiler = Query.Compiler || (Query.Compiler = {}));
            })(Query = Structure.Query || (Structure.Query = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            var Query;
            (function (Query) {
                var Algebraic;
                (function (Algebraic) {
                    /**
                     * Predicates
                     */
                    function unaryP(f) { return function (a) { return function (ctx, i) { return f(a(ctx, i)); }; }; }
                    function binaryP(f) { return function (a, b) { return function (ctx, i) { return f(a(ctx, i), b(ctx, i)); }; }; }
                    Algebraic.not = unaryP(function (a) { return !a; });
                    Algebraic.and = binaryP(function (a, b) { return a && b; });
                    Algebraic.or = binaryP(function (a, b) { return a || b; });
                    var backboneAtoms = Core.Utils.FastSet.ofArray(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"]);
                    Algebraic.backbone = function (ctx, i) { return Algebraic.entityType(ctx, i) === 'polymer' && backboneAtoms.has(Algebraic.atomName(ctx, i)); };
                    Algebraic.sidechain = function (ctx, i) { return Algebraic.entityType(ctx, i) === 'polymer' && !backboneAtoms.has(Algebraic.atomName(ctx, i)); };
                    /**
                     * Relations
                     */
                    function binaryR(f) { return function (a, b) { return function (ctx, i) { return f(a(ctx, i), b(ctx, i)); }; }; }
                    Algebraic.equal = binaryR(function (a, b) { return a === b; });
                    Algebraic.notEqual = binaryR(function (a, b) { return a !== b; });
                    Algebraic.greater = binaryR(function (a, b) { return a > b; });
                    Algebraic.lesser = binaryR(function (a, b) { return a < b; });
                    Algebraic.greaterEqual = binaryR(function (a, b) { return a >= b; });
                    Algebraic.lesserEqual = binaryR(function (a, b) { return a <= b; });
                    function inRange(s, a, b) { return function (ctx, i) { var v = s(ctx, i); return v >= a && v <= b; }; }
                    Algebraic.inRange = inRange;
                    /**
                     * Selectors
                     */
                    function value(v) { return function () { return v; }; }
                    Algebraic.value = value;
                    function atomProp(index, table, value) { return function (ctx, i) { var s = ctx.structure; return value(table(s))[index(s.data.atoms)[i]]; }; }
                    Algebraic.residueSeqNumber = atomProp(function (m) { return m.residueIndex; }, function (m) { return m.data.residues; }, function (t) { return t.seqNumber; });
                    Algebraic.residueName = atomProp(function (m) { return m.residueIndex; }, function (m) { return m.data.residues; }, function (t) { return t.name; });
                    Algebraic.elementSymbol = atomProp(function (m) { return m.indices; }, function (m) { return m.data.atoms; }, function (t) { return t.elementSymbol; });
                    Algebraic.atomName = atomProp(function (m) { return m.indices; }, function (m) { return m.data.atoms; }, function (t) { return t.name; });
                    Algebraic.entityType = atomProp(function (m) { return m.entityIndex; }, function (m) { return m.data.entities; }, function (t) { return t.type; });
                    /**
                     * Query
                     */
                    function query(p) {
                        return Query.Builder.build(function () { return function (ctx) {
                            var result = [];
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i) && p(ctx, i))
                                    result[result.length] = i;
                            }
                            if (!result.length)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, result[0], new Int32Array(result))]);
                        }; });
                    }
                    Algebraic.query = query;
                })(Algebraic = Query.Algebraic || (Query.Algebraic = {}));
            })(Query = Structure.Query || (Structure.Query = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
