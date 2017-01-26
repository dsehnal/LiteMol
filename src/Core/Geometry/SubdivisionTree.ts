/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry {

    /**
     * Basic shape of the result buffer for range queries.
     */
    export interface SubdivisionTree3DResultBuffer {
        count: number;
        indices: number[];

        hasPriorities: boolean;
        priorities: number[] | undefined;

        add(distSq: number, index: number): void;
        reset(): void;
    }

    interface SubdivisionTree3DResultBufferImpl extends SubdivisionTree3DResultBuffer {
        capacity: number;
    }

    /**
     * A buffer that only remembers the values.
     */
    export namespace SubdivisionTree3DResultIndexBuffer {
        function ensureCapacity(buffer: SubdivisionTree3DResultBufferImpl) {
            let newCapacity = buffer.capacity * 2 + 1,
                newIdx = new Int32Array(newCapacity),
                i: number;

            if (buffer.count < 32) {
                for (i = 0; i < buffer.count; i++) {
                    newIdx[i] = buffer.indices[i];
                }
            } else {
                newIdx.set(<any>buffer.indices);
            }

            buffer.indices = <any>newIdx;
            buffer.capacity = newCapacity;
        }

        function add(this: SubdivisionTree3DResultBufferImpl, distSq: number, index: number) {
            if (this.count + 1 >= this.capacity) {
                ensureCapacity(this);
            } 
            this.indices[this.count++] = index;
        }

        function reset(this: SubdivisionTree3DResultBufferImpl) {
            this.count = 0;
        }

        export function create(initialCapacity: number): SubdivisionTree3DResultBuffer {
            if (initialCapacity < 1) initialCapacity = 1;

            return <SubdivisionTree3DResultBufferImpl>{
                indices: <any>new Int32Array(initialCapacity),
                count: 0,
                capacity: initialCapacity,
                hasPriorities: false,
                priorities: void 0,
                add,
                reset
            }
        }
    }

    /**
     * A buffer that remembers values and priorities.
     */
    export namespace SubdivisionTree3DResultPriorityBuffer {
        function ensureCapacity(buffer: SubdivisionTree3DResultBufferImpl) {
            let newCapacity = buffer.capacity * 2 + 1,
                newIdx = new Int32Array(newCapacity),
                newPrio = new Float32Array(newCapacity),
                i: number;

            if (buffer.count < 32) {
                for (i = 0; i < buffer.count; i++) {
                    newIdx[i] = buffer.indices[i];
                    newPrio[i] = buffer.priorities![i];
                }
            } else {
                newIdx.set(<any>buffer.indices);
                newPrio.set(<any>buffer.priorities);
            }

            buffer.indices = <any>newIdx;
            buffer.priorities = <any>newPrio;
            buffer.capacity = newCapacity;
        }

        function add(this: SubdivisionTree3DResultBufferImpl, distSq: number, index: number) {
            if (this.count + 1 >= this.capacity) ensureCapacity(this);
            this.priorities![this.count] = distSq;
            this.indices[this.count++] = index;
        }

        function reset(this: SubdivisionTree3DResultBufferImpl) {
            this.count = 0;
        }

        export function create(initialCapacity: number): SubdivisionTree3DResultBuffer {
            if (initialCapacity < 1) initialCapacity = 1;

            return <SubdivisionTree3DResultBufferImpl>{
                indices: <any>new Int32Array(initialCapacity),
                count: 0,
                capacity: initialCapacity,
                hasPriorities: true,
                priorities: <any>new Float32Array(initialCapacity),
                add,
                reset
            }
        }
    }

    /**
     * Query context. Handles the actual querying.
     */
    export interface SubdivisionTree3DQueryContext<T> {
        tree: SubdivisionTree3D<T>;

        pivot: number[];
        radius: number;
        radiusSq: number;
        indices: number[];
        positions: number[];
        
        buffer: SubdivisionTree3DResultBuffer;

        nearest(x: number, y: number, z: number, radius: number): void;
    }  

    export namespace SubdivisionTree3DQueryContext {
        /**
         * Query the tree and store the result to this.buffer. Overwrites the old result.
         */
        function nearest(this: SubdivisionTree3DQueryContext<any>, x: number, y: number, z: number, radius: number) {
            this.pivot[0] = x;
            this.pivot[1] = y;
            this.pivot[2] = z;
            this.radius = radius;
            this.radiusSq = radius * radius;
            this.buffer.reset();

            SubdivisionTree3DNode.nearest(this.tree.root, this, 0);
        }

        export function create<T>(tree: SubdivisionTree3D<T>, buffer: SubdivisionTree3DResultBuffer): SubdivisionTree3DQueryContext<T> {
            return {
                tree,
                indices: tree.indices,
                positions: tree.positions,
                buffer: buffer,
                pivot: [0.1, 0.1, 0.1],
                radius: 1.1,
                radiusSq: 1.1 * 1.1,
                nearest
            }
        }
    }

    /**
     * A kd-like tree to query 3D data.
     */
    export interface SubdivisionTree3D<T> {
        data: T[];
        indices: number[];
        positions: number[];
        root: SubdivisionTree3DNode;
    }

    export namespace SubdivisionTree3D {
        /**
         * Create a context used for querying the data.
         */
        export function createContextRadius<T>(tree: SubdivisionTree3D<T>, radiusEstimate: number, includePriorities = false): SubdivisionTree3DQueryContext<T> {
            return SubdivisionTree3DQueryContext.create(tree, 
                includePriorities 
                    ? SubdivisionTree3DResultPriorityBuffer.create(Math.max((radiusEstimate * radiusEstimate) | 0, 8))
                    : SubdivisionTree3DResultIndexBuffer.create(Math.max((radiusEstimate * radiusEstimate) | 0, 8)));
        }
        
        /**
         * Takes data and a function that calls SubdivisionTree3DPositionBuilder.add(x, y, z) on each data element.
         */
        export function create<T>(data: T[], f: (e: T, add: (x: number, y: number, z: number) => void) => void, leafSize: number = 32): SubdivisionTree3D<T> {
            let { root, indices, positions } = SubdivisionTree3DBuilder.build(data, f, leafSize);
            return { data, root, indices: <number[]><any>indices, positions }
        }
    }

    interface PositionBuilder {
        _count: number;
        boundsMin: number[];
        boundsMax: number[];
        bounds: Box3D;
        data: number[];
    }

    namespace PositionBuilder {
        export function add(builder: PositionBuilder, x: number, y: number, z: number) {            
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

        export function create(size: number): PositionBuilder {
            let data = <any>new Float32Array((size * 3) | 0);
            let bounds = Box3D.createInfinite();
            let boundsMin = bounds.min;
            let boundsMax = bounds.max;
            return { _count: 0, data, bounds, boundsMin, boundsMax };
        }
    }

    /**
     * A tree node. 
     */
    export interface SubdivisionTree3DNode {
        splitValue: number, // NaN for leaf nodes
        startIndex: number,
        endIndex: number,
        left: SubdivisionTree3DNode,
        right: SubdivisionTree3DNode
    }

    export namespace SubdivisionTree3DNode {        
        function nearestLeaf<T>(node: SubdivisionTree3DNode, ctx: SubdivisionTree3DQueryContext<T>) {
            let pivot = ctx.pivot,
                indices = ctx.indices,
                positions = ctx.positions,
                rSq = ctx.radiusSq,
                dx: number, dy: number, dz: number, o: number, m: number,
                i: number;

            for (i = node.startIndex; i < node.endIndex; i++) {
                o = 3 * indices[i];
                dx = pivot[0] - positions[o]; dy = pivot[1] - positions[o + 1]; dz = pivot[2] - positions[o + 2];
                m = dx * dx + dy * dy + dz * dz;
                if (m <= rSq) ctx.buffer.add(m, indices[i])
            }
        }

        function nearestNode<T>(node: SubdivisionTree3DNode, ctx: SubdivisionTree3DQueryContext<T>, dim: number) {
            let pivot = ctx.pivot[dim], left = pivot < node.splitValue;
            if (left ? pivot + ctx.radius > node.splitValue : pivot - ctx.radius < node.splitValue) {
                nearest(node.left, ctx, (dim + 1) % 3);
                nearest(node.right, ctx, (dim + 1) % 3);
            } else if (left) {
                nearest(node.left, ctx, (dim + 1) % 3);
            } else {
                nearest(node.right, ctx, (dim + 1) % 3);
            }
        }

        export function nearest<T>(node: SubdivisionTree3DNode, ctx: SubdivisionTree3DQueryContext<T>, dim: number) {
            // check for empty.
            if (node.startIndex === node.endIndex) return;
            // is leaf?
            if (isNaN(node.splitValue)) nearestLeaf(node, ctx);
            else nearestNode(node, ctx, dim);
        }

        export function create(splitValue: number, startIndex: number, endIndex: number, left: SubdivisionTree3DNode, right: SubdivisionTree3DNode): SubdivisionTree3DNode {
            return { splitValue, startIndex, endIndex, left, right }
        }
    }

    /**
     * A helper to store boundary box.
     */
    export interface Box3D {
        min: number[];
        max: number[];
    }

    export namespace Box3D {   
        export function createInfinite(): Box3D {
            return {
                min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
                max: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]
            }
        }
    }
    
    /**
     * A helper to build the tree.
     */
    namespace SubdivisionTree3DBuilder {
        interface State {
            leafSize: number,
            positions: number[],
            indices: Int32Array,
            emptyNode: SubdivisionTree3DNode,
            bounds: Box3D
        }
        
        function split(state: State, startIndex: number, endIndex: number, coord: number): SubdivisionTree3DNode {
            let delta = endIndex - startIndex + 1;
            if (delta <= 0) {
                return state.emptyNode;
            } else if (delta <= state.leafSize) {
                return SubdivisionTree3DNode.create(NaN, startIndex, endIndex + 1, state.emptyNode, state.emptyNode);
            }

            let min = state.bounds.min[coord], max = state.bounds.max[coord],
                median = 0.5 * (min + max),
                midIndex = 0,
                l = startIndex, r = endIndex, t: number,
                left: any, right: any;
                
            while (l < r) {
                t = state.indices[r];
                state.indices[r] = state.indices[l];
                state.indices[l] = t;
                while (l <= endIndex && state.positions[3 * state.indices[l] + coord] <= median) l++;
                while (r >= startIndex && state.positions[3 * state.indices[r] + coord] > median) r--;
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

        function createAdder(builder: PositionBuilder) {
            let add = PositionBuilder.add;
            return function(x: number, y: number, z: number) {
                add(builder, x, y, z);
            };
        }

        export function build<T>(data: T[], f: (e: T, add: (x: number, y: number, z: number) => void) => void, leafSize: number) {
            let positions = PositionBuilder.create(data.length),
                indices = new Int32Array(data.length);

            let add = createAdder(positions);
            for (let i = 0; i < data.length; i++) {
                indices[i] = i;
                f(data[i], add);
            }
            // help gc
            add = <any>void 0;

            let state: State = {
                bounds: positions.bounds,
                positions: positions.data,
                leafSize,
                indices,
                emptyNode: SubdivisionTree3DNode.create(NaN, -1, -1, <any>void 0, <any>void 0),
            }

            let root = split(state, 0, indices.length - 1, 0);
            state = <any>void 0;

            return { root, indices, positions: positions.data }            
        }
    }
} 