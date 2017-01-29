/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density {
    "use strict";
 
    export interface Field3D {
        dimensions: number[];   
        length: number;
        getAt(idx: number): number;     
        setAt(idx: number, v: number): void;
        get(i: number, j: number, k: number): number;
        set(i: number, j: number, k: number, v: number): void;
        fill(v: number): void;
    }
    
    function fill(data: number[], value: number) {
        let len = data.length;
        for (let i = 0; i < len; i++) {
            data[i] = value;
        } 
    }

    export class Field3DZYX implements Field3D {        
        private nX: number;
        private nY: number;
        private len: number;
        
        get length() {
            return this.len;
        }
        
        getAt(idx: number) {
            return this.data[idx];
        }
        
        setAt(idx: number, v: number) {
            this.data[idx] = v;
        }
        
        get(i: number, j: number, k: number) {
            return this.data[(this.nX * (k * this.nY + j) + i) | 0];
        }
        
        set(i: number, j: number, k: number, v: number) {
            this.data[(this.nX * (k * this.nY + j) + i) | 0] = v;
        }
        
        fill(v: number) {
            fill(this.data, v);
        }
        
        constructor(public data: number[], public dimensions: number[]) {
            this.len = this.dimensions[0] * this.dimensions[1] * this.dimensions[2];
            this.nX = this.dimensions[0];
            this.nY = this.dimensions[1];
        }        
    }

    /**
     * Represents electron density data.
     */
    export interface Data {
        /**
         * Crystal cell size.
         */
        cellSize: number[];

        /**
         * Crystal cell angles.
         */
        cellAngles: number[];

        /**
         * Origin of the cell
         */
        origin: number[];

        /**
         * 3D volumetric data.
         */
        data: Field3D;

        /**
         * X, Y, Z dimensions of the data matrix.
         */
        dataDimensions: number[];

        /**
         * The basis of the space.
         */
        basis: { x: number[]; y: number[]; z: number[] };

        /**
         * Was the skew matrix present in the input?
         */
        hasSkewMatrix: boolean;

        /**
         * Column major ordered skew matrix.
         */
        skewMatrix: number[];

        /**
         * Information about the min/max/mean/sigma values.
         */
        valuesInfo: { min: number; max: number; mean: number; sigma: number };
        
        /** 
         * Additional attributes.
         */
        attributes: { [key: string]: any }
        
        /**
         * Are the data normalized?
         */
        isNormalized: boolean;            
    }

    export namespace Data {
        
        export function create(
            cellSize: number[], cellAngles: number[], origin: number[], hasSkewMatrix: boolean, skewMatrix: number[],
            data: Field3D, dataDimensions: number[], basis: { x: number[]; y: number[]; z: number[] },
            valuesInfo: { min: number; max: number; mean: number; sigma: number }, attributes?: { [key: string]: any }): Data {

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
                attributes: attributes ? attributes : { },
                isNormalized: false
            };
        }


        export function normalize(densityData: Data) {
            if (densityData.isNormalized) return;
            
            let data = densityData.data, { mean, sigma } = densityData.valuesInfo;
            let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
            for (let i = 0, _l = data.length; i < _l; i++) {
                let v = (data.getAt(i) - mean) / sigma;
                data.setAt(i, v);
                if (v < min) min = v;
                if (v > max) max = v;
            }

            densityData.valuesInfo.min = min;
            densityData.valuesInfo.max = max;
            densityData.isNormalized = true;
        }

        export function denormalize(densityData: Data) {
            if (!densityData.isNormalized) return;
            
            let data = densityData.data, { mean, sigma } = densityData.valuesInfo;
            let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
            for (let i = 0, _l = data.length; i < _l; i++) {
                let v = sigma * data.getAt(i) + mean;
                data.setAt(i, v);
                if (v < min) min = v;
                if (v > max) max = v;
            }

            densityData.valuesInfo.min = min;
            densityData.valuesInfo.max = max;
            densityData.isNormalized = false;
        }
    }
    
}