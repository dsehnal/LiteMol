var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
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
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Comparison;
    (function (Comparison) {
        var Base;
        (function (Base) {
            var Evd;
            (function (Evd) {
                "use strict";
                var ColumnMajorMatrix;
                (function (ColumnMajorMatrix) {
                    function get(m, i, j) { return m.data[m.rows * j + i]; }
                    ColumnMajorMatrix.get = get;
                    function set(m, i, j, value) { m.data[m.rows * j + i] = value; }
                    ColumnMajorMatrix.set = set;
                    function add(m, i, j, value) { m.data[m.rows * j + i] += value; }
                    ColumnMajorMatrix.add = add;
                    function reset(m) {
                        for (var i = 0, _l = m.data.length; i < _l; i++)
                            m.data[i] = 0.0;
                    }
                    ColumnMajorMatrix.reset = reset;
                    function create(columns, rows) {
                        return {
                            data: new Float64Array(columns * rows),
                            columns: columns,
                            rows: rows
                        };
                    }
                    ColumnMajorMatrix.create = create;
                })(ColumnMajorMatrix = Evd.ColumnMajorMatrix || (Evd.ColumnMajorMatrix = {}));
                var EvdCache;
                (function (EvdCache) {
                    function create(size) {
                        return {
                            size: size,
                            matrix: ColumnMajorMatrix.create(size, size),
                            eigenValues: new Float64Array(size),
                            D: new Float64Array(size),
                            E: new Float64Array(size)
                        };
                    }
                    EvdCache.create = create;
                })(EvdCache = Evd.EvdCache || (Evd.EvdCache = {}));
                // The EVD code has been adapted from Math.NET, MIT license, Copyright (c) 2002-2015 Math.NET
                // 
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
                // INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                // PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
                // FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
                // ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                /**
                 * Computes EVD and stores the result in the cache.
                 */
                function compute(cache) {
                    symmetricEigenDecomp(cache.size, cache.matrix.data, cache.eigenValues, cache.D, cache.E);
                }
                Evd.compute = compute;
                function symmetricEigenDecomp(order, matrixEv, vectorEv, d, e) {
                    //let d = new double[order];
                    //let e = new double[order];
                    for (var i = 0; i < order; i++) {
                        e[i] = 0.0;
                    }
                    var om1 = order - 1;
                    for (var i = 0; i < order; i++) {
                        d[i] = matrixEv[i * order + om1];
                    }
                    symmetricTridiagonalize(matrixEv, d, e, order);
                    symmetricDiagonalize(matrixEv, d, e, order);
                    for (var i = 0; i < order; i++) {
                        vectorEv[i] = d[i];
                    }
                }
                function symmetricTridiagonalize(a, d, e, order) {
                    // Householder reduction to tridiagonal form.
                    for (var i = order - 1; i > 0; i--) {
                        // Scale to avoid under/overflow.
                        var scale = 0.0;
                        var h = 0.0;
                        for (var k = 0; k < i; k++) {
                            scale = scale + Math.abs(d[k]);
                        }
                        if (scale == 0.0) {
                            e[i] = d[i - 1];
                            for (var j = 0; j < i; j++) {
                                d[j] = a[(j * order) + i - 1];
                                a[(j * order) + i] = 0.0;
                                a[(i * order) + j] = 0.0;
                            }
                        }
                        else {
                            // Generate Householder vector.
                            for (var k = 0; k < i; k++) {
                                d[k] /= scale;
                                h += d[k] * d[k];
                            }
                            var f = d[i - 1];
                            var g = Math.sqrt(h);
                            if (f > 0) {
                                g = -g;
                            }
                            e[i] = scale * g;
                            h = h - (f * g);
                            d[i - 1] = f - g;
                            for (var j = 0; j < i; j++) {
                                e[j] = 0.0;
                            }
                            // Apply similarity transformation to remaining columns.
                            for (var j = 0; j < i; j++) {
                                f = d[j];
                                a[(i * order) + j] = f;
                                g = e[j] + (a[(j * order) + j] * f);
                                for (var k = j + 1; k <= i - 1; k++) {
                                    g += a[(j * order) + k] * d[k];
                                    e[k] += a[(j * order) + k] * f;
                                }
                                e[j] = g;
                            }
                            f = 0.0;
                            for (var j = 0; j < i; j++) {
                                e[j] /= h;
                                f += e[j] * d[j];
                            }
                            var hh = f / (h + h);
                            for (var j = 0; j < i; j++) {
                                e[j] -= hh * d[j];
                            }
                            for (var j = 0; j < i; j++) {
                                f = d[j];
                                g = e[j];
                                for (var k = j; k <= i - 1; k++) {
                                    a[(j * order) + k] -= (f * e[k]) + (g * d[k]);
                                }
                                d[j] = a[(j * order) + i - 1];
                                a[(j * order) + i] = 0.0;
                            }
                        }
                        d[i] = h;
                    }
                    // Accumulate transformations.
                    for (var i = 0; i < order - 1; i++) {
                        a[(i * order) + order - 1] = a[(i * order) + i];
                        a[(i * order) + i] = 1.0;
                        var h = d[i + 1];
                        if (h != 0.0) {
                            for (var k = 0; k <= i; k++) {
                                d[k] = a[((i + 1) * order) + k] / h;
                            }
                            for (var j = 0; j <= i; j++) {
                                var g = 0.0;
                                for (var k = 0; k <= i; k++) {
                                    g += a[((i + 1) * order) + k] * a[(j * order) + k];
                                }
                                for (var k = 0; k <= i; k++) {
                                    a[(j * order) + k] -= g * d[k];
                                }
                            }
                        }
                        for (var k = 0; k <= i; k++) {
                            a[((i + 1) * order) + k] = 0.0;
                        }
                    }
                    for (var j = 0; j < order; j++) {
                        d[j] = a[(j * order) + order - 1];
                        a[(j * order) + order - 1] = 0.0;
                    }
                    a[(order * order) - 1] = 1.0;
                    e[0] = 0.0;
                }
                function symmetricDiagonalize(a, d, e, order) {
                    var maxiter = 1000;
                    for (var i = 1; i < order; i++) {
                        e[i - 1] = e[i];
                    }
                    e[order - 1] = 0.0;
                    var f = 0.0;
                    var tst1 = 0.0;
                    var eps = Math.pow(2, -53); // DoubleWidth = 53
                    for (var l = 0; l < order; l++) {
                        // Find small subdiagonal element
                        tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
                        var m = l;
                        while (m < order) {
                            if (Math.abs(e[m]) <= eps * tst1) {
                                break;
                            }
                            m++;
                        }
                        // If m == l, d[l] is an eigenvalue,
                        // otherwise, iterate.
                        if (m > l) {
                            var iter = 0;
                            do {
                                iter = iter + 1; // (Could check iteration count here.)
                                // Compute implicit shift
                                var g = d[l];
                                var p = (d[l + 1] - g) / (2.0 * e[l]);
                                var r = hypotenuse(p, 1.0);
                                if (p < 0) {
                                    r = -r;
                                }
                                d[l] = e[l] / (p + r);
                                d[l + 1] = e[l] * (p + r);
                                var dl1 = d[l + 1];
                                var h = g - d[l];
                                for (var i = l + 2; i < order; i++) {
                                    d[i] -= h;
                                }
                                f = f + h;
                                // Implicit QL transformation.
                                p = d[m];
                                var c = 1.0;
                                var c2 = c;
                                var c3 = c;
                                var el1 = e[l + 1];
                                var s = 0.0;
                                var s2 = 0.0;
                                for (var i = m - 1; i >= l; i--) {
                                    c3 = c2;
                                    c2 = c;
                                    s2 = s;
                                    g = c * e[i];
                                    h = c * p;
                                    r = hypotenuse(p, e[i]);
                                    e[i + 1] = s * r;
                                    s = e[i] / r;
                                    c = p / r;
                                    p = (c * d[i]) - (s * g);
                                    d[i + 1] = h + (s * ((c * g) + (s * d[i])));
                                    // Accumulate transformation.
                                    for (var k = 0; k < order; k++) {
                                        h = a[((i + 1) * order) + k];
                                        a[((i + 1) * order) + k] = (s * a[(i * order) + k]) + (c * h);
                                        a[(i * order) + k] = (c * a[(i * order) + k]) - (s * h);
                                    }
                                }
                                p = (-s) * s2 * c3 * el1 * e[l] / dl1;
                                e[l] = s * p;
                                d[l] = c * p;
                                // Check for convergence. If too many iterations have been performed, 
                                // throw exception that Convergence Failed
                                if (iter >= maxiter) {
                                    throw "SVD: Not converging.";
                                }
                            } while (Math.abs(e[l]) > eps * tst1);
                        }
                        d[l] = d[l] + f;
                        e[l] = 0.0;
                    }
                    // Sort eigenvalues and corresponding vectors.
                    for (var i = 0; i < order - 1; i++) {
                        var k = i;
                        var p = d[i];
                        for (var j = i + 1; j < order; j++) {
                            if (d[j] < p) {
                                k = j;
                                p = d[j];
                            }
                        }
                        if (k != i) {
                            d[k] = d[i];
                            d[i] = p;
                            for (var j = 0; j < order; j++) {
                                p = a[(i * order) + j];
                                a[(i * order) + j] = a[(k * order) + j];
                                a[(k * order) + j] = p;
                            }
                        }
                    }
                }
                function hypotenuse(a, b) {
                    if (Math.abs(a) > Math.abs(b)) {
                        var r = b / a;
                        return Math.abs(a) * Math.sqrt(1 + (r * r));
                    }
                    if (b != 0.0) {
                        var r = a / b;
                        return Math.abs(b) * Math.sqrt(1 + (r * r));
                    }
                    return 0.0;
                }
            })(Evd = Base.Evd || (Base.Evd = {}));
        })(Base = Comparison.Base || (Comparison.Base = {}));
    })(Comparison = LiteMol.Comparison || (LiteMol.Comparison = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Comparison;
    (function (Comparison) {
        var Base;
        (function (Base) {
            "use strict";
            var PositionTable;
            (function (PositionTable) {
                function transformToCentroidCoordinates(table) {
                    var centroid = PositionTable.getCentroid(table);
                    var atomsX = table.x;
                    var atomsY = table.y;
                    var atomsZ = table.z;
                    for (var i = 0; i < table.count; i++) {
                        atomsX[i] -= centroid.x;
                        atomsY[i] -= centroid.y;
                        atomsZ[i] -= centroid.z;
                    }
                }
                PositionTable.transformToCentroidCoordinates = transformToCentroidCoordinates;
                function getCentroid(positions) {
                    var xs = positions.x, ys = positions.y, zs = positions.z;
                    var center = { x: 0, y: 0, z: 0 };
                    for (var i = 0, _l = positions.count; i < _l; i++) {
                        center.x += xs[i];
                        center.y += ys[i];
                        center.z += zs[i];
                    }
                    center.x /= positions.count;
                    center.y /= positions.count;
                    center.z /= positions.count;
                    return center;
                }
                PositionTable.getCentroid = getCentroid;
            })(PositionTable = Base.PositionTable || (Base.PositionTable = {}));
        })(Base = Comparison.Base || (Comparison.Base = {}));
    })(Comparison = LiteMol.Comparison || (LiteMol.Comparison = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Comparison;
    (function (Comparison) {
        var Base;
        (function (Base) {
            "use strict";
            var LA = LiteMol.Core.Geometry.LinearAlgebra;
            var RmsdTransformState = (function () {
                function RmsdTransformState(data, into) {
                    this.evdCache = Base.Evd.EvdCache.create(4);
                    this.translateB = LA.Matrix4.identity();
                    this.rotateB = LA.Matrix4.identity();
                    this.tempMatrix = LA.Matrix4.identity();
                    this.a = data.a;
                    this.b = data.b;
                    if (data.centerA)
                        this.centerA = data.centerA;
                    else
                        this.centerA = Base.PositionTable.getCentroid(data.a);
                    if (data.centerB)
                        this.centerB = data.centerB;
                    else
                        this.centerB = Base.PositionTable.getCentroid(data.b);
                    this.result = into;
                }
                return RmsdTransformState;
            }());
            Base.RmsdTransformState = RmsdTransformState;
            function findMinimalRmsdTransform(data, into) {
                if (typeof into === "undefined")
                    into = { bTransform: LA.Matrix4.empty(), rmsd: 0.0 };
                findMinimalRmsdTransformImpl(new RmsdTransformState(data, into));
                return into;
            }
            Base.findMinimalRmsdTransform = findMinimalRmsdTransform;
            function computeN(state) {
                var N = state.evdCache.matrix;
                Base.Evd.ColumnMajorMatrix.reset(N);
                var xsA = state.a.x, ysA = state.a.y, zsA = state.a.z;
                var xsB = state.b.x, ysB = state.b.y, zsB = state.b.z;
                var cA = state.centerA;
                var cB = state.centerB;
                var sizeSq = 0.0;
                for (var i = 0, _l = state.a.count; i < _l; i++) {
                    var aX = xsA[i] - cA.x, aY = ysA[i] - cA.y, aZ = zsA[i] - cA.z;
                    var bX = xsB[i] - cB.x, bY = ysB[i] - cB.y, bZ = zsB[i] - cB.z;
                    sizeSq += aX * aX + aY * aY + aZ * aZ + bX * bX + bY * bY + bZ * bZ;
                    Base.Evd.ColumnMajorMatrix.add(N, 0, 0, aX * bX + aY * bY + aZ * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 0, 1, -(aZ * bY) + aY * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 0, 2, aZ * bX - aX * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 0, 3, -(aY * bX) + aX * bY);
                    Base.Evd.ColumnMajorMatrix.add(N, 1, 0, -(aZ * bY) + aY * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 1, 1, aX * bX - aY * bY - aZ * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 1, 2, aY * bX + aX * bY);
                    Base.Evd.ColumnMajorMatrix.add(N, 1, 3, aZ * bX + aX * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 2, 0, aZ * bX - aX * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 2, 1, aY * bX + aX * bY);
                    Base.Evd.ColumnMajorMatrix.add(N, 2, 2, -(aX * bX) + aY * bY - aZ * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 2, 3, aZ * bY + aY * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 3, 0, -(aY * bX) + aX * bY);
                    Base.Evd.ColumnMajorMatrix.add(N, 3, 1, aZ * bX + aX * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 3, 2, aZ * bY + aY * bZ);
                    Base.Evd.ColumnMajorMatrix.add(N, 3, 3, -(aX * bX) - aY * bY + aZ * bZ);
                }
                return sizeSq;
            }
            function makeTransformMatrix(state) {
                var ev = state.evdCache.matrix;
                var qX = Base.Evd.ColumnMajorMatrix.get(ev, 1, 3);
                var qY = Base.Evd.ColumnMajorMatrix.get(ev, 2, 3);
                var qZ = Base.Evd.ColumnMajorMatrix.get(ev, 3, 3);
                var qW = Base.Evd.ColumnMajorMatrix.get(ev, 0, 3);
                var n1 = 2 * qY * qY;
                var n2 = 2 * qZ * qZ;
                var n3 = 2 * qX * qX;
                var n4 = 2 * qX * qY;
                var n5 = 2 * qW * qZ;
                var n6 = 2 * qX * qZ;
                var n7 = 2 * qW * qY;
                var n8 = 2 * qY * qZ;
                var n9 = 2 * qW * qX;
                var m = state.translateB;
                // translation to center
                LA.Matrix4.setValue(m, 0, 3, -state.centerB.x);
                LA.Matrix4.setValue(m, 1, 3, -state.centerB.y);
                LA.Matrix4.setValue(m, 2, 3, -state.centerB.z);
                m = state.rotateB;
                // rotation
                LA.Matrix4.setValue(m, 0, 0, 1 - n1 - n2);
                LA.Matrix4.setValue(m, 0, 1, n4 + n5);
                LA.Matrix4.setValue(m, 0, 2, n6 - n7);
                LA.Matrix4.setValue(m, 1, 0, n4 - n5);
                LA.Matrix4.setValue(m, 1, 1, 1 - n3 - n2);
                LA.Matrix4.setValue(m, 1, 2, n8 + n9);
                LA.Matrix4.setValue(m, 2, 0, n6 + n7);
                LA.Matrix4.setValue(m, 2, 1, n8 - n9);
                LA.Matrix4.setValue(m, 2, 2, 1 - n3 - n1);
                LA.Matrix4.setValue(m, 3, 3, 1);
                LA.Matrix4.mul(state.tempMatrix, state.rotateB, state.translateB);
                m = state.translateB;
                // translation to center
                LA.Matrix4.setValue(m, 0, 3, state.centerA.x);
                LA.Matrix4.setValue(m, 1, 3, state.centerA.y);
                LA.Matrix4.setValue(m, 2, 3, state.centerA.z);
                LA.Matrix4.mul(state.result.bTransform, state.translateB, state.tempMatrix);
            }
            function findMinimalRmsdTransformImpl(state) {
                var sizeSq = computeN(state);
                Base.Evd.compute(state.evdCache);
                var rmsd = sizeSq - 2.0 * state.evdCache.eigenValues[3];
                rmsd = rmsd < 0.0 ? 0.0 : Math.sqrt(rmsd / state.a.count);
                makeTransformMatrix(state);
                state.result.rmsd = rmsd;
            }
        })(Base = Comparison.Base || (Comparison.Base = {}));
    })(Comparison = LiteMol.Comparison || (LiteMol.Comparison = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Comparison;
    (function (Comparison) {
        var Structure;
        (function (Structure_1) {
            var Structure = LiteMol.Core.Structure;
            ;
            function makePositionTable(model, indices) {
                var table = new Structure.DataTableBuilder(indices.length);
                var x = table.addColumn('x', function (s) { return new Float64Array(s); });
                var y = table.addColumn('y', function (s) { return new Float64Array(s); });
                var z = table.addColumn('z', function (s) { return new Float64Array(s); });
                var xs = model.atoms.x, ys = model.atoms.y, zs = model.atoms.z;
                var i = 0;
                for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                    var aI = indices_1[_i];
                    x[i] = xs[aI];
                    y[i] = ys[aI];
                    z[i] = zs[aI];
                    i++;
                }
                return table.seal();
            }
            function superimposeByIndices(data) {
                var transforms = [];
                var averageRmsd = 0;
                for (var i = 1; i < data.length; i++) {
                    var t = Comparison.Base.findMinimalRmsdTransform({
                        a: makePositionTable(data[0].model, data[0].atomIndices),
                        b: makePositionTable(data[i].model, data[i].atomIndices)
                    });
                    transforms.push(t);
                    averageRmsd += t.rmsd;
                }
                averageRmsd /= Math.max(transforms.length, 1);
                return { transforms: transforms, averageRmsd: averageRmsd };
            }
            Structure_1.superimposeByIndices = superimposeByIndices;
        })(Structure = Comparison.Structure || (Comparison.Structure = {}));
    })(Comparison = LiteMol.Comparison || (LiteMol.Comparison = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Transforms;
        (function (Transforms) {
            /**
             * We don't want the default behaviour of the plugin for our example.
             */
            var Views = LiteMol.Plugin.Views;
            var Bootstrap = LiteMol.Bootstrap;
            var Transformer = Bootstrap.Entity.Transformer;
            var LayoutRegion = Bootstrap.Components.LayoutRegion;
            Transforms.PluginSpec = {
                settings: {
                    'molecule.model.defaultQuery': "residuesByName('GLY', 'ALA')",
                    'molecule.model.defaultAssemblyName': '1'
                },
                transforms: [
                    // Molecule(model) transforms
                    { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                    { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual }
                ],
                behaviours: [
                    // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                    Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                    Bootstrap.Behaviour.FocusCameraOnSelect,
                    // this colors the visual when a selection is created on it.
                    Bootstrap.Behaviour.ApplySelectionToVisual,
                    // this colors the visual when it's selected by mouse or touch
                    Bootstrap.Behaviour.ApplyInteractivitySelection,
                    // this shows what atom/residue is the pointer currently over
                    Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                    // when the same element is clicked twice in a row, the selection is emptied
                    Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                    // distance to the last "clicked" element
                    Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                    // this tracks what is downloaded and some basic actions. Does not send any private data etc. Source in Bootstrap/Behaviour/Analytics 
                    Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
                ],
                components: [
                    LiteMol.Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                    LiteMol.Plugin.Components.Entity.Current('LiteMol', LiteMol.Plugin.VERSION.number)(LayoutRegion.Right, true),
                    LiteMol.Plugin.Components.Transform.View(LayoutRegion.Right),
                    LiteMol.Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                    LiteMol.Plugin.Components.Context.Overlay(LayoutRegion.Root),
                    LiteMol.Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                    LiteMol.Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
                ],
                viewport: {
                    view: Views.Visualization.Viewport,
                    controlsView: Views.Visualization.ViewportControls
                },
                layoutView: Views.Layout,
                tree: {
                    region: LayoutRegion.Left,
                    view: Views.Entity.Tree
                }
            };
        })(Transforms = Example.Transforms || (Example.Transforms = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Transforms;
        (function (Transforms) {
            var Transformer = LiteMol.Bootstrap.Entity.Transformer;
            function fetch(plugin, ids, createVisuals) {
                var _this = this;
                if (createVisuals === void 0) { createVisuals = false; }
                return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var ts, rs, notOK, _i, notOK_1, r;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ts = ids
                                    .filter(function (id) { return id.length === 4; })
                                    .map(function (id) { return id.toLowerCase(); })
                                    .map(function (id) {
                                    var t = plugin.createTransform();
                                    // download cartoon representation data from the CoordinateServer and parse the result
                                    var model = t.add(plugin.root, Transformer.Data.Download, { url: "https://webchemdev.ncbr.muni.cz/CoordinateServer/" + id + "/cartoon?encoding=bcif", type: 'Binary', id: id })
                                        .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
                                        .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { ref: id /* makes it easier to reference later */ });
                                    if (createVisuals) {
                                        model.then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true }, {});
                                    }
                                    return { id: id, t: t };
                                })
                                    .map(function (_a) {
                                    var id = _a.id, t = _a.t;
                                    return new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                        var e_1;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    _a.trys.push([0, 2, , 3]);
                                                    return [4 /*yield*/, plugin.applyTransform(t)];
                                                case 1:
                                                    _a.sent();
                                                    res({ id: id, ok: true });
                                                    return [3 /*break*/, 3];
                                                case 2:
                                                    e_1 = _a.sent();
                                                    res({ id: id, ok: false });
                                                    return [3 /*break*/, 3];
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                });
                                return [4 /*yield*/, Promise.all(ts)];
                            case 1:
                                rs = _a.sent();
                                notOK = rs.filter(function (r) { return !r.ok; });
                                if (notOK.length) {
                                    // in a real application, instead of just
                                    // reporting an error, you would want to 
                                    // retry the download.
                                    for (_i = 0, notOK_1 = notOK; _i < notOK_1.length; _i++) {
                                        r = notOK_1[_i];
                                        console.error(r.id + ' not downloaded.');
                                    }
                                }
                                if (createVisuals) {
                                    // Reset the camera so that all the models are visible.
                                    plugin.command(LiteMol.Bootstrap.Command.Visual.ResetScene);
                                }
                                res();
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            Transforms.fetch = fetch;
            var Q = LiteMol.Core.Structure.Query;
            function getSuperpositionData(plugin) {
                // selects all the Models that were downloaded
                var models = plugin.context.select(LiteMol.Bootstrap.Tree.Selection.subtree(plugin.root).ofType(LiteMol.Bootstrap.Entity.Molecule.Model));
                // Find CA atoms inside polymer entities
                var query = Q.atomsByName('CA').inside(Q.entities({ type: 'polymer' })).union();
                var xs = models
                    .map(function (m) { return ({ id: m.ref, model: m.props.model, fragments: m.props.model.query(query) }); })
                    .filter(function (x) { return !!x.fragments.length; })
                    .map(function (x) { return ({ id: x.id, model: x.model, atomIndices: x.fragments.fragments[0].atomIndices }); });
                if (!xs.length) {
                    throw new Error("No valid molecules.");
                }
                // Find the maximum number of common CA atoms
                var maxCommonLength = xs.reduce(function (m, x) { return Math.min(m, x.atomIndices.length); }, xs[0].atomIndices.length);
                if (!maxCommonLength) {
                    throw new Error("One or more molecules has 0 CA atoms.");
                }
                // Take the common CA atoms 
                for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
                    var x = xs_1[_i];
                    x.atomIndices = Array.prototype.slice.call(x.atomIndices, 0, maxCommonLength);
                }
                return xs;
            }
            Transforms.getSuperpositionData = getSuperpositionData;
            function applyTransforms(plugin, data, superposition) {
                // create the model for the first molecule.
                var first = plugin.createTransform();
                first.add(plugin.context.select(data[0].id)[0], Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true }, {});
                plugin.applyTransform(first);
                for (var i = 1; i < data.length; i++) {
                    var t = plugin.createTransform();
                    // apply the coorresponding 4x4 transform and create a visual.
                    // the transform matrix is stored as a 1d array using culumn major order.
                    t.add(plugin.context.select(data[i].id)[0], LiteMol.Bootstrap.Entity.Transformer.Molecule.ModelTransform3D, { transform: superposition.transforms[i - 1].bTransform }, {})
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true }, {});
                    plugin.applyTransform(t);
                }
                // Reset the camera so that all the models are visible. 
                plugin.command(LiteMol.Bootstrap.Command.Visual.ResetScene);
            }
            Transforms.applyTransforms = applyTransforms;
        })(Transforms = Example.Transforms || (Example.Transforms = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Transforms;
        (function (Transforms) {
            var pluginSuperposed = LiteMol.Plugin.create({
                target: '#superposed',
                viewportBackground: '#fff',
                layoutState: {
                    hideControls: true,
                    isExpanded: false
                },
                customSpecification: Transforms.PluginSpec
            });
            var pluginOriginal = LiteMol.Plugin.create({
                target: '#original',
                viewportBackground: '#fff',
                layoutState: {
                    hideControls: true,
                    isExpanded: false
                },
                customSpecification: Transforms.PluginSpec
            });
            // So that we can use await..
            function schedule(ctx, f) {
                return new Promise(function (res) { return ctx.schedule(function () {
                    try {
                        res(f());
                    }
                    finally {
                        res(undefined);
                    }
                }); });
            }
            function process() {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    var ids, task;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ids = document.getElementById('pdbIDs').value.split(',').map(function (id) { return id.trim(); });
                                pluginSuperposed.clear();
                                pluginOriginal.clear();
                                // this makes an extra call to the server to display the original structures
                                // because I was lazy to redo this app to reuse the same data in two 
                                // different plugin instances.
                                //
                                // Do not do this in production :)
                                return [4 /*yield*/, Transforms.fetch(pluginOriginal, ids, true)];
                            case 1:
                                // this makes an extra call to the server to display the original structures
                                // because I was lazy to redo this app to reuse the same data in two 
                                // different plugin instances.
                                //
                                // Do not do this in production :)
                                _a.sent();
                                task = LiteMol.Bootstrap.Task.create('Transforms', 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                                    var data, transforms;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                ctx.update('Downloading data...');
                                                return [4 /*yield*/, Transforms.fetch(pluginSuperposed, ids)];
                                            case 1:
                                                _a.sent();
                                                ctx.update('Creating superposition data...');
                                                return [4 /*yield*/, schedule(ctx, function () { return Transforms.getSuperpositionData(pluginSuperposed); })];
                                            case 2:
                                                data = _a.sent();
                                                ctx.update('Finding transforms...');
                                                transforms = LiteMol.Comparison.Structure.superimposeByIndices(data);
                                                ctx.update('Finishing...');
                                                return [4 /*yield*/, schedule(ctx, function () { return Transforms.applyTransforms(pluginSuperposed, data, transforms); })];
                                            case 3:
                                                _a.sent();
                                                ctx.resolve({});
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                task.run(pluginSuperposed.context);
                                return [2 /*return*/];
                        }
                    });
                });
            }
            document.getElementById('process').onclick = process;
        })(Transforms = Example.Transforms || (Example.Transforms = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
