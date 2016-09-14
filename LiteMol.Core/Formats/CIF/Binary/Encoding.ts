/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Binary {
    "use strict";
    
    export const VERSION = '0.1.0';

    export type Encoding = Encoding.ByteArray | Encoding.FixedPoint | Encoding.RunLength | Encoding.Delta | Encoding.IntegerPacking | Encoding.StringArray

    export interface EncodedFile {
        version: string,
        encoder: string,
        dataBlocks: EncodedDataBlock[]
    }

    export interface EncodedDataBlock {
        header: string,    
        categories: EncodedCategory[],  
    }

    export interface EncodedCategory {
        name: string,
        rowCount: number,
        columns: EncodedColumn[],
    }

    export interface EncodedColumn {
        name: string,
        data: EncodedData,

        /**
         * The mask represents the presence or absent of particular "CIF value".
         * If the mask is not set, every value is present.
         * 
         * 0 = Value is present
         * 1 = . = value not specified
         * 2 = ? = value unknown
         */
        mask?: EncodedData
    }

    export interface EncodedData {
        encoding: Encoding[],        
        data: Uint8Array
    }

    export namespace Encoding {
        export const enum DataType {
            Int8,
            Int16,
            Int32,
            Uint8,
            Float32,
            Float64            
        }

        export const enum IntDataType {            
            Int8,
            Int16,
            Int32,
            Uint8
        }

        export function getIntDataType(data: (Int8Array | Int16Array | Int32Array | number[])): IntDataType {
            let srcType: Encoding.IntDataType;
            if (data instanceof Int8Array) srcType = Encoding.IntDataType.Int8;
            else if (data instanceof Int16Array) srcType = Encoding.IntDataType.Int16;
            else if (data instanceof Int32Array) srcType = Encoding.IntDataType.Int32;
            else if (data instanceof Uint8Array) srcType = Encoding.IntDataType.Uint8;
            else throw new Error('Unsupported integer data type.');  
            return srcType;
        }
        
        // type[] -> Uint8[]
        export interface ByteArray {
            kind: 'ByteArray',
            type: DataType
        }
        
        // Float32[] -> Int32[]
        export interface FixedPoint {
            kind: 'FixedPoint',
            factor: number
        } 

        // Int32[] -> Int32[]
        export interface RunLength {
            kind: 'RunLength',
            srcType: IntDataType,
            srcSize: number
        }

        // T[] -> T[]
        export interface Delta {
            kind: 'Delta',
            srcType: IntDataType
        } 

        // number[] -> (Int8 | Int16)[]
        export interface IntegerPacking {
            kind: 'IntegerPacking',
            byteCount: number,
            srcSize: number
        } 

        // string[] -> Uint8[]
        // stores 0 amd indices of ends of strings:
        // data = '123456'
        // offsets = [0,2,5,6]
        // encodes ['12','345','6']
        export interface StringArray {
            kind: 'StringArray',
            dataEncoding: Encoding[],
            stringData: string,            
            offsetEncoding: Encoding[], 
            offsets: Uint8Array 
        } 

    }
}