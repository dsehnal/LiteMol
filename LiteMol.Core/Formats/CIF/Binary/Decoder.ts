/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Binary {
    "use strict";
    
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */

    export function decode(data: EncodedData): any {
        let current = data.data;
        for (let i = data.encoding.length - 1; i >= 0; i--) {
            current = Decoder.decodeStep(current, data.encoding[i]);
        }
        return current;
    }

    namespace Decoder {

        export function decodeStep(data: any, encoding: Encoding): any {
            switch (encoding.kind) {
                case 'ByteArray': {
                    switch ((encoding as Encoding.ByteArray).type) {
                        case Encoding.DataType.Uint8: return data;
                        case Encoding.DataType.Int8: return int8(data);
                        case Encoding.DataType.Int16: return int16(data);
                        case Encoding.DataType.Int32: return int32(data);
                        case Encoding.DataType.Float32: return float32(data);
                        case Encoding.DataType.Float64: return float64(data);
                    }
                }
                case 'FixedPoint': return fixedPoint(data, encoding as Encoding.FixedPoint);
                case 'RunLength': return runLength(data, encoding as Encoding.RunLength);
                case 'Delta': return delta(data, encoding as Encoding.Delta);
                case 'IntegerPacking': return integerPacking(data, encoding as Encoding.IntegerPacking);
                case 'StringArray': return stringArray(data, encoding as Encoding.StringArray);
            }
        }

        type TypedArray = { buffer: ArrayBuffer, byteOffset: number, byteLength: number }
        function dataView(array: TypedArray) {
            return new DataView(array.buffer, array.byteOffset > 0 ? array.byteOffset : void 0, array.byteLength);
        }

        function int8(data: Uint8Array) {

            return new Int8Array(data.buffer, data.byteOffset > 0 ? data.byteOffset : void 0);
        }

        function int16(data: Uint8Array) {
            let n = (data.length / 2) | 0;
            let output = new Int16Array(n);
            for (let i = 0, i2 = 0; i < n; i++, i2 += 2) {
                output[i] = data[i2] << 8 ^ data[i2 + 1] << 0;
            }
            return output;
        }

        function int32(data: Uint8Array) {
            let n = (data.length / 4) | 0;
            let output = new Int32Array(n);
            for (let i = 0, i4 = 0; i < n; i++, i4 += 4) {
                output[i] = data[i4] << 24 ^ data[i4 + 1] << 16 ^ data[i4 + 2] << 8 ^ data[i4 + 3] << 0;
            }
            return output;
        }

        function float32(data: Uint8Array) {
            let n = (data.length / 4) | 0;
            let output = new Float32Array(n);
            let src = dataView(data);
            for (let i = 0, i4 = 0; i < n; i++, i4 += 4) {
                output[i] = src.getFloat32(i4);
            }
            return output;
        }

        function float64(data: Uint8Array) {
            let n = (data.length / 8) | 0;
            let output = new Float64Array(n);
            let src = dataView(data);
            for (let i = 0, i8 = 0; i < n; i++, i8 += 8) {
                output[i] = src.getFloat64(i8);
            }
            return output;
        }

        function fixedPoint(data: Int32Array, encoding: Encoding.FixedPoint) {
            let n = data.length;
            let output = new Float32Array(n);
            let f = 1 / encoding.factor;
            for (let i = 0; i < n; i++) {
                output[i] = f * data[i];
            }
            return output;
        }

        function getIntArray(type: Encoding.IntDataType, size: number) {
            switch (type) {
                case Encoding.IntDataType.Int8: return new Int8Array(size);
                case Encoding.IntDataType.Int16: return new Int16Array(size);
                case Encoding.IntDataType.Int32: return new Int32Array(size);
                case Encoding.IntDataType.Uint8: return new Uint8Array(size);
                default: throw new Error('Unsupported integer data type.');
            }
        }

        function runLength(data: Int32Array, encoding: Encoding.RunLength) {
            let output = getIntArray(encoding.srcType, encoding.srcSize);
            let dataOffset = 0;
            for (let i = 0, il = data.length; i < il; i += 2) {
                let value = data[i];  // value to be repeated
                let length = data[i + 1];  // number of repeats
                for (let j = 0; j < length; ++j) {
                    output[dataOffset++] = value;
                }
            }
            return output;
        }

        function delta(data: (Int8Array | Int16Array | Int32Array), encoding: Encoding.Delta) {
            let n = data.length;
            let output = getIntArray(encoding.srcType, n);
            if (!n) return output;
            output[0] = data[0];
            for (let i = 1; i < n; ++i) {
                output[i] = data[i] + output[i - 1];
            }
            return output;
        }

        function integerPacking(data: (Int8Array | Int16Array), encoding: Encoding.IntegerPacking) {
            let upperLimit = data instanceof Int8Array ? 0x7F : 0x7FFF;
            let lowerLimit = -upperLimit - 1;
            let n = data.length;
            let output = new Int32Array(encoding.srcSize);
            let i = 0;
            let j = 0;
            while (i < n) {
                let value = 0, t = data[i];
                while (t === upperLimit || t === lowerLimit) {
                    value += t;
                    i++;
                    t = data[i];
                }
                value += t;
                output[j] = value;
                i++;
                j++;
            }
            return output;
        }

        function stringArray(data: Uint8Array, encoding: Encoding.StringArray) {
            let str = encoding.stringData;
            let offsets = decode({ encoding: encoding.offsetEncoding, data: encoding.offsets });
            let indices = decode({ encoding: encoding.dataEncoding, data });
            let cache = new Map<number, string>();
            let result:string[] = [];
            for (let i of indices) {
                if (i < 0) {
                    result[result.length] = null;    
                    continue;
                }
                let v = cache.get(i);
                if (v === void 0) {
                    v = str.substring(offsets[i], offsets[i + 1]);
                    cache.set(i, v);
                }
                result[result.length] = v;
            }

            return result;
        }
    }
}