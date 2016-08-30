/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density {
    "use strict";
 
    export interface IField3D {
        dimensions: number[];   
        length: number;
        getAt(idx: number): number;     
        setAt(idx: number, v: number): void;
        get(i: number, j: number, k: number): number;
        set(i: number, j: number, k: number, v: number): void;
        fill(v: number): void;
    }
    
    export class Field3DZYX implements IField3D {
        
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
            for (let i = 0; i < this.len; i++) {
                this.data[i] = v;
            }   
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
    export class Data {
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
        data: IField3D;

        /**
         * X, Y, Z dimensions of the data matrix.
         */
        dataDimensions: number[];

        /**
         * The basis of the space.
         */
        basis: { x: number[]; y: number[]; z: number[] };

        /**
         * Start offsets.
         */
        startOffset: number[];

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
        isNormalized = false;

        /**
         * If not already normalized, normalize the data.
         */
        normalize() {
            if (this.isNormalized) return;
            
            let data = this.data, { mean, sigma } = this.valuesInfo;
            let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
            for (let i = 0, _l = data.length; i < _l; i++) {
                let v = (data.getAt(i) - mean) / sigma;
                data.setAt(i, v);
                if (v < min) min = v;
                if (v > max) max = v;
            }

            this.valuesInfo.min = min;
            this.valuesInfo.max = max;
            this.isNormalized = true;
        }
        
        /**
         * If normalized, de-normalize the data.
         */
        denormalize() {
            if (!this.isNormalized) return;
            
            let data = this.data, { mean, sigma } = this.valuesInfo;
            let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
            for (let i = 0, _l = data.length; i < _l; i++) {
                let v = sigma * data.getAt(i) + mean;
                data.setAt(i, v);
                if (v < min) min = v;
                if (v > max) max = v;
            }

            this.valuesInfo.min = min;
            this.valuesInfo.max = max;
            this.isNormalized = false;
        }
        
        
        constructor(
            cellSize: number[], cellAngles: number[], origin: number[], hasSkewMatrix: boolean, skewMatrix: number[],
            data: IField3D, dataDimensions: number[], basis: { x: number[]; y: number[]; z: number[] }, startOffset: number[],
            valuesInfo: { min: number; max: number; mean: number; sigma: number }, attributes?: { [key: string]: any }) {

            this.cellSize = cellSize;
            this.cellAngles = cellAngles;
            this.origin = origin;
            this.hasSkewMatrix = hasSkewMatrix;
            this.skewMatrix = skewMatrix;
            this.data = data;
            this.basis = basis;
            this.startOffset = startOffset;
            this.dataDimensions = dataDimensions;
            this.valuesInfo = valuesInfo;
            this.attributes = attributes ? attributes : { };
        }
    }
    
}