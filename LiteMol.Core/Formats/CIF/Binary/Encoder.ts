/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Binary {
    "use strict";
    
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */

    export class Encoder {
        and(f: Encoder.Provider) {
            return new Encoder(this.providers.concat([f]));
        }

        encode(data: any): EncodedData {
            let encoding: Encoding[] = [];
            for (let p of this.providers) {
                let t = p(data);

                if (!t.encodings.length) {
                    throw new Error('Encodings must be non-empty.');
                }

                data = t.data;
                for (let e of t.encodings) {
                    encoding.push(e);
                }
            }
            if (!(data instanceof Uint8Array)) {
                throw new Error('The encoding must result in a Uint8Array. Fix your encoding chain.');
            }
            return {
                encoding,
                data
            }
        }

        constructor(private providers: Encoder.Provider[]) {
            
        }
    }

    export namespace Encoder {

        type TypedArray = { buffer: ArrayBuffer, byteOffset: number, byteLength: number }

        export interface Result {
            encodings: Encoding[],
            data: any
        }

        export type Provider = (data: any) => Result

        export function by(f: Provider) {
            return new Encoder([f]);
        }

        function dataView(array: TypedArray) {
            return new DataView(array.buffer, array.byteOffset, array.byteLength);
        }

        export function uint8(data: Int16Array): Result {
            return {
                encodings: [{ kind: 'ByteArray', type: Encoding.DataType.Uint8 }],
                data: data
            };
        }

        export function int8(data: Int8Array): Result {
            return {
                encodings: [{ kind: 'ByteArray', type: Encoding.DataType.Int8 }],
                data: new Uint8Array(data.buffer, data.byteOffset)
            };
        }

        export function int16(data: Int16Array): Result {            
            let result = new Uint8Array(data.length * 2);
            let view = dataView(result);
            for (let i = 0, n = data.length; i < n; i++) {
                view.setInt16(2 * i, data[i]);
            }
            return {
                encodings: [{ kind: 'ByteArray', type: Encoding.DataType.Int16 }],
                data: result
            };
        }

        export function int32(data: Int32Array): Result {            
            let result = new Uint8Array(data.length * 4);
            let view = dataView(result);
            for (let i = 0, n = data.length; i < n; i++) {
                view.setInt32(4 * i, data[i]);
            }
            return {
                encodings: [{ kind: 'ByteArray', type: Encoding.DataType.Int32 }],
                data: result
            };
        }

        export function float32(data: Float32Array): Result {            
            let result = new Uint8Array(data.length * 4);
            let view = dataView(result);
            for (let i = 0, n = data.length; i < n; i++) {
                view.setFloat32(4 * i, data[i]);
            }
            return {
                encodings: [{ kind: 'ByteArray', type: Encoding.DataType.Float32 }],
                data: result
            };
        }

        export function float64(data: Float64Array): Result {            
            let result = new Uint8Array(data.length * 8);
            let view = dataView(result);
            for (let i = 0, n = data.length; i < n; i++) {
                view.setFloat64(8 * i, data[i]);
            }
            return {
                encodings: [{ kind: 'ByteArray', type: Encoding.DataType.Float64 }],
                data: result
            };
        }

        function _fixedPoint(data: Float32Array, factor: number): Result {            
            let result = new Int32Array(data.length);
            for (let i = 0, n = data.length; i < n; i++) {
                result[i] = Math.round(data[i] * factor);
            }
            return {
                encodings: [{ kind: 'FixedPoint', factor }],
                data: result
            };
        }
        export function fixedPoint(factor: number): Provider { return data => _fixedPoint(data, factor); }

        export function runLength(data: (Uint8Array | Int8Array | Int16Array | Int32Array | number[])): Result {
            let srcType = Encoding.getIntDataType(data);
            if (srcType === void 0) {
                data = new Int32Array(data);
                srcType = Encoding.IntDataType.Int32;
            }

            if (!data.length) {
                return {
                    encodings: [{ kind: 'RunLength', srcType, srcSize: 0 }],
                    data: new Int32Array(0)
                };
            }

            // calculate output size
            let fullLength = 2;
            for (let i = 1, il = data.length; i < il; i++) {
                if (data[i - 1] !== data[i]) {
                    fullLength += 2;
                }
            }
            let output = new Int32Array(fullLength);
            let offset = 0;
            let runLength = 1;
            for (let i = 1, il = data.length; i < il; i++) {
                if (data[i - 1] !== data[i]) {
                    output[offset] = data[i - 1];
                    output[offset + 1] = runLength;
                    runLength = 1;
                    offset += 2;
                } else {
                    ++runLength;
                }
            }
            output[offset] = data[data.length - 1];
            output[offset + 1] = runLength;
            return {
                encodings: [{ kind: 'RunLength', srcType, srcSize: data.length }],
                data: output
            };
        }

        export function delta(data: (Int8Array | Int16Array | Int32Array | number[])): Result {
            let srcType = Encoding.getIntDataType(data);
            if (srcType === void 0) {
                data = new Int32Array(data);
                srcType = Encoding.IntDataType.Int32;
            }
            if (!data.length) {
                return {
                    encodings: [{ kind: 'Delta', srcType }],
                    data: new (data as any).constructor(0)
                };
            }

            let output = new (data as any).constructor(data.length);
            output[0] = data[0];
            for(let i = 1, n = data.length; i < n; i++ ){
                output[i] = data[i] - data[i - 1];
            }
            return {
                encodings: [{ kind: 'Delta', srcType }],
                data: output
            };
        }

        function packingSize(data: Int32Array, upperLimit: number) {
            let lowerLimit = -upperLimit - 1;
            let size = 0;
            for (let i = 0, n = data.length; i < n; i++) {
                let value = data[i];
                if (value === 0) {
                    size += 1;
                } else if (value === upperLimit || value === lowerLimit) {
                    size += 2;
                } else if (value > 0) {
                    size += Math.ceil(value / upperLimit);
                } else {
                    size += Math.ceil(value / lowerLimit);
                }
            }
            return size;
        }

        function determinePacking(data: Int32Array): { size: number, bytesPerElement: number } {
            let size8 = packingSize(data, 0x7f);
            let size16 = packingSize(data, 0x7fff);

            if (data.length * 4 < size16 * 2) {
                // 4 byte packing is the most effective
                return {
                    size: data.length,
                    bytesPerElement: 4
                };
            } else if (size16 * 2 < size8) {
                // 2 byte packing is the most effective
                return {
                    size: size16,
                    bytesPerElement: 2
                }
            } else {
                // 1 byte packing is the most effective
                return {
                    size: size8,
                    bytesPerElement: 1
                }
            };
        }

        /**
         * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
         */
        export function integerPacking(data: Int32Array): Result {
            let packing = determinePacking(data);

            if (packing.bytesPerElement === 4) {                
                // no packing done, Int32 encoding will be used
                return int32(data);
            }

            let upperLimit = packing.bytesPerElement === 1 ? 0x7F : 0x7FFF;
            let lowerLimit = -upperLimit - 1;
            let n = data.length;
            let packed = packing.bytesPerElement === 1 ? new Int8Array(packing.size) : new Int16Array(packing.size);
            let j = 0;
            for (let i = 0; i < n; i++) {
                let value = data[i];
                if (value >= 0) {
                    while (value >= upperLimit) {
                        packed[j] = upperLimit;
                        ++j;
                        value -= upperLimit;
                    }
                } else {
                    while (value <= lowerLimit) {
                        packed[j] = lowerLimit;
                        ++j;
                        value -= lowerLimit;
                    }
                }
                packed[j] = value;
                ++j;
            }

            let result = packing.bytesPerElement === 1 ? int8(packed) : int16(packed);
            return {
                encodings: [{ kind: 'IntegerPacking', byteCount: packing.bytesPerElement, srcSize: n }, result.encodings[0]],
                data: result.data
            };
        }

        export function stringArray(data: string[]): Result {
            let map = new Map<string, number>();
            let strings: string[] = [];
            let accLength = 0;
            let offsets = new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), 1024, 1);
            let output = new Int32Array(data.length);
            
            offsets.add(0);
            let i = 0;
            for (let s of data) {
                // handle null strings.
                if (s === null || s === void 0) {
                    output[i++] = -1;
                    continue;
                }

                let index = map.get(s);
                if (index === void 0) {
                    // increment the length
                    accLength += s.length; 

                    // store the string and index                   
                    index = strings.length;
                    strings[index] = s;
                    map.set(s, index);

                    // write the offset
                    offsets.add(accLength);
                } 
                output[i++] = index;
            }

            let encOffsets = Encoder.by(delta).and(integerPacking).encode(offsets.compact());
            let encOutput = Encoder.by(delta).and(runLength).and(integerPacking).encode(output);
            
            return {
                encodings: [{ kind: 'StringArray', dataEncoding: encOutput.encoding, stringData: strings.join(''), offsetEncoding: encOffsets.encoding, offsets: encOffsets.data }],
                data: encOutput.data
            };
        }
    }
}