/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.BinaryCIF {
    "use strict";
    
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */

    export class Encoder {

        private latestData: any;
        private encoding: Encoding[] = [];

        by(f: (data: any) => Encoder.Result) {
            let r = f(this.latestData);
            this.latestData = r.data;
            this.encoding.push(r.encoding);
            return this;
        }

        encode(): EncodedData {
            return {
                encoding: this.encoding,
                data: this.latestData
            }
        }

        constructor(data: any) {
            this.latestData = data;
        }

        static of(data: any) {
            return new Encoder(data);
        }
    }

    export namespace Encoder {

        type TypedArray = { buffer: ArrayBuffer, byteOffset: number, byteLength: number }

        export interface Result {
            encoding: Encoding,
            data: any
        }

        export type Provider = (data: any) => Result

        function dataView(array: TypedArray) {
            return new DataView(array.buffer, array.byteOffset, array.byteLength);
        }

        export function value(value: any): Result {
            return {
                encoding: { kind: 'Value', value },
                data: void 0
            };
        }

        export function int16(data: Int16Array): Result {            
            let result = new Uint8Array(data.length * 2);
            let view = dataView(result);
            for (let i = 0, n = data.length; i < n; i++) {
                view.setInt16(2 * i, data[i]);
            }
            return {
                encoding: { kind: 'ByteArray', type: Encoding.DataType.Int16 },
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
                encoding: { kind: 'ByteArray', type: Encoding.DataType.Int32 },
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
                encoding: { kind: 'ByteArray', type: Encoding.DataType.Float32 },
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
                encoding: { kind: 'ByteArray', type: Encoding.DataType.Float64 },
                data: result
            };
        }

        function _fixedPoint(data: Float32Array, factor: number): Result {            
            let result = new Int32Array(data.length);
            for (let i = 0, n = data.length; i < n; i++) {
                result[i] = Math.round(data[i] * factor);
            }
            return {
                encoding: { kind: 'FixedPoint', factor },
                data: result
            };
        }
        export function fixedPoint(factor: number): Provider { return data => _fixedPoint(data, factor); }

        export function runLength(data: (Int8Array | Int16Array | Int32Array | number[])): Result {
            let srcType = Encoding.getIntDataType(data);
            if (srcType === void 0) {
                data = new Int32Array(data);
                srcType = Encoding.IntDataType.Int32;
            }

            if (!data.length) {
                return {
                    encoding: { kind: 'RunLength', srcType, srcSize: 0 },
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
                encoding: { kind: 'RunLength', srcType, srcSize: data.length },
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
                    encoding: { kind: 'Delta', srcType },
                    data: new (data as any).constructor(0)
                };
            }

            let output = new (data as any).constructor(data.length);
            output[0] = data[0];
            for(let i = 1, n = data.length; i < n; i++ ){
                output[i] = data[i] - data[i - 1];
            }
            return {
                encoding: { kind: 'Delta', srcType },
                data: output
            };
        }

        function _integerPacking(data: Int32Array, byteCount: number): Result {
            let upperLimit = byteCount === 1 ? 0x7F : 0x7FFF;
            let lowerLimit = -upperLimit - 1;
            let n = data.length;
            let size = 0;
            for (let i = 0; i < n; i++) {
                let value = data[i];
                if (value === 0) {
                    ++size;
                } else if (value === upperLimit || value === lowerLimit) {
                    size += 2;
                } else if (value > 0) {
                    size += Math.ceil(value / upperLimit);
                } else {
                    size += Math.ceil(value / lowerLimit);
                }
            }
            let output = byteCount === 1 ? new Int8Array(size) : new Int16Array(size);
            let j = 0;
            for (let i = 0; i < n; i++) {
                let value = data[i];
                if (value >= 0) {
                    while (value >= upperLimit) {
                        output[j] = upperLimit;
                        ++j;
                        value -= upperLimit;
                    }
                } else {
                    while (value <= lowerLimit) {
                        output[j] = lowerLimit;
                        ++j;
                        value -= lowerLimit;
                    }
                }
                output[j] = value;
                ++j;
            }
            return {
                encoding: { kind: 'IntegerPacking', byteCount, srcSize: n },
                data: output
            };
        }
        export function integerPacking(byteCount: number): Provider { return data => _integerPacking(data, byteCount); }

        export function stringArray(data: string[]): Result {

            let map = new Map<string, number>();
            let strings: string[] = [];
            let accLength = 0;
            let offsets = new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), 1024, 1);
            let output = new Int32Array(data.length);

            offsets.add(0);
            let i = 0;
            for (let s of data) {
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

            let encOffsets = Encoder.of(offsets.compact()).by(delta).by(integerPacking(2)).by(int16).encode();
            
            let encOutput1 = Encoder.of(output).by(delta).by(runLength).by(integerPacking(1)).encode();
            let encOutput2 = Encoder.of(output).by(delta).by(runLength).by(integerPacking(2)).encode();
            let encOutput = encOutput1;
            if (encOutput2.data.length < encOutput.data.length) encOutput = encOutput2;

            return {
                encoding: { kind: 'StringArray', dataEncoding: encOutput.encoding, stringData: strings.join(''), offsetEncoding: encOffsets.encoding, offsets: encOffsets.data },
                data: encOutput.data
            };
        }
    }
}