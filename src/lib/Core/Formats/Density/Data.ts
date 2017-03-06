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
        spacegroup: {
            number: number,
            size: number[],
            angles: number[],
            basis: { x: number[]; y: number[]; z: number[] };
        },
      
        box: {
            /** Origin of the data block in fractional coords. */
            origin: number[],

            /** Dimensions oft he data block in fractional coords. */
            dimensions: number[],

            /** X, Y, Z dimensions of the data matrix. */
            sampleCount: number[]
        },

        /**
         * 3D volumetric data.
         */
        data: Field3D;

        /**
         * Information about the min/max/mean/sigma values.
         */
        valuesInfo: { min: number; max: number; mean: number; sigma: number };
        
        /** 
         * Additional attributes.
         */
        attributes: { [key: string]: any }          
    }
}