/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry.Query3D {
    /**
     * A kd-like tree to query 3D data.
     */
    interface SubdivisionTree3D {
        indices: Int32Array;
        positions: number[];
        root: SubdivisionTree3DNode;
    }

    /**
     * A tree node. 
     */
    interface SubdivisionTree3DNode {
        splitValue: number, // NaN for leaf nodes
        startIndex: number,
        endIndex: number,
        left: SubdivisionTree3DNode,
        right: SubdivisionTree3DNode
    }

    namespace SubdivisionTree3DNode {        
        function nearestLeaf(node: SubdivisionTree3DNode, ctx: QueryContext<SubdivisionTree3D>) {
            let pivot = ctx.pivot,
                { indices, positions } = ctx.structure,
                rSq = ctx.radiusSq,
                dx: number, dy: number, dz: number, o: number, m: number,
                i: number;

            for (i = node.startIndex; i < node.endIndex; i++) {
                o = 3 * indices[i];
                dx = pivot[0] - positions[o]; dy = pivot[1] - positions[o + 1]; dz = pivot[2] - positions[o + 2];
                m = dx * dx + dy * dy + dz * dz;
                if (m <= rSq) QueryContext.add(ctx, m, indices[i])
            }
        }

        function nearestNode(node: SubdivisionTree3DNode, ctx: QueryContext<SubdivisionTree3D>, dim: number) {
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

        export function nearest(node: SubdivisionTree3DNode, ctx: QueryContext<SubdivisionTree3D>, dim: number) {
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

        export function build<T>({ elements, positions, bounds, indices }: InputData<T>, leafSize: number): SubdivisionTree3D {
            const state: State = {
                bounds,
                positions,
                leafSize,
                indices,
                emptyNode: SubdivisionTree3DNode.create(NaN, -1, -1, <any>void 0, <any>void 0),
            }

            let root = split(state, 0, indices.length - 1, 0);
            return { root, indices: indices, positions }            
        }
    }

    export function createSubdivisionTree<T>(data: InputData<T>, leafSize = 32): LookupStructure<T> {
        const tree = SubdivisionTree3DBuilder.build(data, leafSize);
        return function () {
            const ctx = QueryContext.create(tree, data.elements);
            return function(x: number, y: number, z: number, radius: number) { 
                QueryContext.update(ctx, x, y, z, radius);
                SubdivisionTree3DNode.nearest(tree.root, ctx, 0); 
                return ctx.buffer; 
            }
        };
    }
} 