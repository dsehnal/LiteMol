/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry {

    /**
     * Basic shape of the result buffer for range queries.
     */
    export interface ISubdivisionTree3DResultBuffer {
        count: number;
        indices: number[];

        hasPriorities: boolean;
        priorities: number[];

        add(distSq: number, index: number): void;
        reset(): void;
    }

    /**
     * A buffer that only remembers the values.
     */
    export class SubdivisionTree3DResultIndexBuffer implements ISubdivisionTree3DResultBuffer {
        private capacity: number;

        count: number;
        indices: number[];

        hasPriorities: boolean;
        priorities: number[];

        private ensureCapacity() {
            var newCapacity = this.capacity * 2 + 1,
                newIdx = new Int32Array(newCapacity),
                i: number;

            if (this.count < 32) {
                for (i = 0; i < this.count; i++) {
                    newIdx[i] = this.indices[i];
                }
            } else {
                newIdx.set(<any>this.indices);
            }

            this.indices = <any>newIdx;
            this.capacity = newCapacity;
        }

        add(distSq: number, index: number) {
            if (this.count + 1 >= this.capacity) this.ensureCapacity();
            this.indices[this.count++] = index;
        }

        reset() {
            this.count = 0;
        }

        constructor(initialCapacity: number) {
            if (initialCapacity < 1) initialCapacity = 1;
            this.indices = <any>new Int32Array(initialCapacity);
            this.count = 0;
            this.capacity = initialCapacity;
            this.hasPriorities = false;
            this.priorities = void 0;
        }
    }

    /**
     * A buffer that remembers values and priorities.
     */
    export class SubdivisionTree3DResultPriorityBuffer implements ISubdivisionTree3DResultBuffer {
        private capacity: number;

        count: number;
        indices: number[];

        hasPriorities: boolean;
        priorities: number[];

        private ensureCapacity() {
            var newCapacity = this.capacity * 2 + 1,
                newIdx = new Int32Array(newCapacity),
                newPrio = new Float32Array(newCapacity),
                i: number;

            if (this.count < 32) {
                for (i = 0; i < this.count; i++) {
                    newIdx[i] = this.indices[i];
                    newPrio[i] = this.priorities[i];
                }
            } else {
                newIdx.set(<any>this.indices);
                newPrio.set(<any>this.priorities);
            }

            this.indices = <any>newIdx;
            this.priorities = <any>newPrio;
            this.capacity = newCapacity;
        }

        add(distSq: number, index: number) {
            if (this.count + 1 >= this.capacity) this.ensureCapacity();
            this.priorities[this.count] = distSq;
            this.indices[this.count++] = index;
        }

        reset() {
            this.count = 0;
        }

        constructor(initialCapacity: number) {
            if (initialCapacity < 1) initialCapacity = 1;
            this.indices = <any>new Int32Array(initialCapacity);
            this.count = 0;
            this.capacity = initialCapacity;
            this.hasPriorities = true;
            this.priorities = <any>new Float32Array(initialCapacity);
        }
    }

    /**
     * Query context. Handles the actual querying.
     */
    export class SubdivisionTree3DQueryContext<T> {
        private tree: SubdivisionTree3D<T>;

        pivot: number[];
        radius: number;
        radiusSq: number;
        indices: number[];
        positions: number[];
        
        buffer: ISubdivisionTree3DResultBuffer;  
        
        /**
         * Query the tree and store the result to this.buffer. Overwrites the old result.
         */
        nearest(x: number, y: number, z: number, radius: number) {
            this.pivot[0] = x;
            this.pivot[1] = y;
            this.pivot[2] = z;
            this.radius = radius;
            this.radiusSq = radius * radius;
            this.buffer.reset();

            this.tree.root.nearest(this, 0);
        }

        /**
         * Query the tree and use the position of the i-th element as pivot.
         * Store the result to this.buffer. Overwrites the old result.
         */
        nearestIndex(index: number, radius: number) {
            this.pivot[0] = this.positions[3 * index];
            this.pivot[1] = this.positions[3 * index + 1];
            this.pivot[2] = this.positions[3 * index + 2];
            this.radius = radius;
            this.radiusSq = radius * radius;
            this.buffer.reset();

            this.tree.root.nearest(this, 0);
        }

        constructor(tree: SubdivisionTree3D<T>, buffer: ISubdivisionTree3DResultBuffer) {
            this.tree = tree;
            this.indices = tree.indices;
            this.positions = tree.positions;
            this.buffer = buffer;

            this.pivot = [0.1, 0.1, 0.1];
            this.radius = 1.1;
            this.radiusSq = 1.1 * 1.1;
        }
    }

    /**
     * A kd-like tree to query 3D data.
     */
    export class SubdivisionTree3D<T> {
        data: T[];
        indices: number[];
        positions: number[];
        root: SubdivisionTree3DNode;

        /**
         * Create a context used for querying the data.
         */
        createContextRadius(radiusEstimate: number, includePriorities = false): SubdivisionTree3DQueryContext<T> {
            return new SubdivisionTree3DQueryContext<T>(this, 
                includePriorities 
                    ? new SubdivisionTree3DResultPriorityBuffer(Math.max((radiusEstimate * radiusEstimate) | 0, 8))
                    : new SubdivisionTree3DResultIndexBuffer(Math.max((radiusEstimate * radiusEstimate) | 0, 8)));
        }
        
        /**
         * Takes data and a function that calls SubdivisionTree3DPositionBuilder.add(x, y, z) on each data element.
         */
        constructor(data: T[], f: (e: T, b: SubdivisionTree3DPositionBuilder) => void, leafSize: number = 32) {
            var builder = new SubdivisionTree3DBuilder(data, f, leafSize);
            this.data = data;
            this.root = builder.build();
            this.indices = builder.indices;
            this.positions = builder.positions;
        }
    }


    /**
     * A builder for position array.
     */
    export class SubdivisionTree3DPositionBuilder {
        private count = 0;
        private boundsMin: number[];
        private boundsMax: number[];
        bounds: Box3D;
        data: number[];

        add(x: number, y: number, z: number) {            
            this.data[this.count++] = x;
            this.data[this.count++] = y;
            this.data[this.count++] = z;
            this.boundsMin[0] = Math.min(x, this.boundsMin[0]);
            this.boundsMin[1] = Math.min(y, this.boundsMin[1]);
            this.boundsMin[2] = Math.min(z, this.boundsMin[2]);
            this.boundsMax[0] = Math.max(x, this.boundsMax[0]);
            this.boundsMax[1] = Math.max(y, this.boundsMax[1]);
            this.boundsMax[2] = Math.max(z, this.boundsMax[2]);

        }

        constructor(count: number) {
            this.data = <any>new Float32Array((count * 3) | 0);
            this.bounds = new Box3D();
            this.boundsMin = this.bounds.min;
            this.boundsMax = this.bounds.max;
        }
    }

    /**
     * A tree node. 
     */
    export class SubdivisionTree3DNode {
        splitValue: number; // NaN for leaf nodes
        startIndex: number;
        endIndex: number;
        left: SubdivisionTree3DNode;
        right: SubdivisionTree3DNode;

        private nearestLeaf<T>(ctx: SubdivisionTree3DQueryContext<T>) {
            var pivot = ctx.pivot,
                indices = ctx.indices,
                positions = ctx.positions,
                rSq = ctx.radiusSq,
                dx: number, dy: number, dz: number, o: number, m: number,
                i: number;

            for (i = this.startIndex; i < this.endIndex; i++) {
                o = 3 * indices[i];
                dx = pivot[0] - positions[o]; dy = pivot[1] - positions[o + 1]; dz = pivot[2] - positions[o + 2];
                m = dx * dx + dy * dy + dz * dz;
                if (m <= rSq) ctx.buffer.add(m, indices[i])
            }
        }

        private nearestNode<T>(ctx: SubdivisionTree3DQueryContext<T>, dim: number) {
            var pivot = ctx.pivot[dim], left = pivot < this.splitValue;
            if (left ? pivot + ctx.radius > this.splitValue : pivot - ctx.radius < this.splitValue) {
                this.left.nearest(ctx,(dim + 1) % 3);
                this.right.nearest(ctx,(dim + 1) % 3);
            } else if (left) {
                this.left.nearest(ctx,(dim + 1) % 3);
            } else {
                this.right.nearest(ctx,(dim + 1) % 3);
            }
        }

        nearest<T>(ctx: SubdivisionTree3DQueryContext<T>, dim: number) {
            // check for empty.
            if (this.startIndex === this.endIndex) return;
            // is leaf?
            if (isNaN(this.splitValue)) this.nearestLeaf(ctx);
            else this.nearestNode(ctx, dim);
        }

        constructor(splitValue: number, startIndex: number, endIndex: number, left: SubdivisionTree3DNode, right: SubdivisionTree3DNode) {
            this.splitValue = splitValue;
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.left = left;
            this.right = right;
        }
    }

    /**
     * A helper to store boundary box.
     */
    export class Box3D {
        min: number[];
        max: number[];
        
        constructor() {
            this.min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
            this.max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
        }
    }
    
    /**
     * A helper class to build the tree.
     */
    class SubdivisionTree3DBuilder<T> {

        private leafSize: number;
        positions: number[];
        indices: number[];
        private emptyNode: SubdivisionTree3DNode;
        private bounds: Box3D;
        
        private split(startIndex: number, endIndex: number, coord: number): SubdivisionTree3DNode {

            var delta = endIndex - startIndex + 1;
            if (delta <= 0) {
                return this.emptyNode;
            } else if (delta <= this.leafSize) {
                return new SubdivisionTree3DNode(NaN, startIndex, endIndex + 1, this.emptyNode, this.emptyNode);
            }

            var min = this.bounds.min[coord], max = this.bounds.max[coord],
                median = 0.5 * (min + max),
                midIndex = 0,
                l = startIndex, r = endIndex, t: number,
                left: any, right: any;
                
            while (l < r) {
                t = this.indices[r];
                this.indices[r] = this.indices[l];
                this.indices[l] = t;
                while (l <= endIndex && this.positions[3 * this.indices[l] + coord] <= median) l++;
                while (r >= startIndex && this.positions[3 * this.indices[r] + coord] > median) r--;
            }
            midIndex = l - 1;
            
            this.bounds.max[coord] = median;
            left = this.split(startIndex, midIndex, (coord + 1) % 3);
            this.bounds.max[coord] = max;
            this.bounds.min[coord] = median;
            right = this.split(midIndex + 1, endIndex, (coord + 1) % 3);
            this.bounds.min[coord] = min;
            return new SubdivisionTree3DNode(median, startIndex, endIndex + 1, left, right);
        }

        constructor(data: T[], f: (e: T, b: SubdivisionTree3DPositionBuilder) => void, leafSize: number) {
            var positions = new SubdivisionTree3DPositionBuilder(data.length),
                indices = new Int32Array(data.length),
                i: number;
            for (i = 0; i < data.length; i++) {
                indices[i] = i;
                f(data[i], positions);
            }
            
            this.leafSize = leafSize;
            this.positions = positions.data;
            this.indices = <any>indices;
            this.emptyNode = new SubdivisionTree3DNode(NaN, -1, -1, null, null);
            this.bounds = positions.bounds;
        }

        build() {
            return this.split(0, this.indices.length - 1, 0);
        }
    }
} 