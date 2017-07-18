/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Surface {
    "use strict";

    import Data = Core.Geometry.Surface
    import ChunkedArray = Core.Utils.ChunkedArray

    interface Context {
        data: Data,
        computation: Core.Computation.Context,
        geom: Geometry,

        vertexCount: number,
        triCount: number,

        pickColorBuffer?: Float32Array;
        pickTris?: ChunkedArray<number>;
        pickPlatesVertices?: ChunkedArray<number>;
        pickPlatesTris?: ChunkedArray<number>;
        pickPlatesColors?: ChunkedArray<number>;
        platesVertexCount?: number;
    }

    function sortAnnotation(ctx: Context) {
        let indices = new Int32Array(ctx.data.annotation!.length);
        let annotation = ctx.data.annotation!;
        for (let i = 0, _b = indices.length; i < _b; i++) indices[i] = i;
        Array.prototype.sort.call(indices, function (a: number, b: number) {
            let ret = annotation[a] - annotation[b];
            if (!ret) return a - b;
            return ret;
        });
        return indices;
    }

    function splice(start: number, end: number, indices: Int32Array, map: Selection.VertexMapBuilder) {
        let currentStart = start;
        let currentEnd = start + 1;

        while (currentStart < end) {
            while (currentEnd < end && indices[currentEnd] - indices[currentEnd - 1] < 1.1) currentEnd++;
            map.addVertexRange(indices[currentStart], indices[currentEnd - 1] + 1);
            currentStart = currentEnd;
            currentEnd = currentEnd + 1;
        }
    }

    function createVertexMap(ctx: Context) {
        let indices = sortAnnotation(ctx);
        let annotation = ctx.data.annotation!;
        let count = 1;
        for (let i = 0, _b = indices.length - 1; i < _b; i++) {
            if (annotation[indices[i]] !== annotation[indices[i + 1]]) count++;
        }
        let map = new Selection.VertexMapBuilder(count);

        let xs = new Int32Array(indices.length);
        for (let i = 0, _b = indices.length; i < _b; i++) {
            xs[i] = annotation[indices[i]];
        }
        let currentAnnotation = annotation[indices[0]];
        map.startElement(currentAnnotation);
        for (let i = 0, _b = indices.length; i < _b; i++) {
            let an = annotation[indices[i]];
            if (an !== currentAnnotation) {
                map.endElement();
                map.startElement(an);
                currentAnnotation = an;
            }

            let start = i;
            i++;
            while (an === annotation[indices[i]]) i++;
            let end = i;
            i--;
            splice(start, end, indices, map);
        }
        map.endElement();
        return map.getMap();
    }

    function createFullMap(ctx: Context) {
        let map = new Selection.VertexMapBuilder(1);
        map.startElement(0);
        map.addVertexRange(0, ctx.vertexCount);
        map.endElement();
        return map.getMap();
    }

    async function computeVertexMap(ctx: Context) {
        await ctx.computation.updateProgress('Computing selection map...');
        if (ctx.data.annotation) {
            ctx.geom.elementToVertexMap = createVertexMap(ctx);
        } else {
            ctx.geom.elementToVertexMap = createFullMap(ctx);
        }
    }

    const chunkSize = 100000;
    async function computePickPlatesChunk(start: number, ctx: Context) {
        let tri = ctx.data.triangleIndices;
        let ids = ctx.data.annotation!;

        let pickPlatesVertices = ctx.pickPlatesVertices!;
        let pickPlatesTris = ctx.pickPlatesTris!;
        let pickPlatesColors = ctx.pickPlatesColors!;
        let vs = ctx.data.vertices;
        let color = { r: 0.45, g: 0.45, b: 0.45 };
        let pickTris = ctx.pickTris!;
        
        let platesVertexCount = 0;
        for (let i = start, _b = Math.min(start + chunkSize, ctx.triCount); i < _b; i++) {
            let a = tri[3 * i], b = tri[3 * i + 1], c = tri[3 * i + 2];
            let aI = ids[a], bI = ids[b], cI = ids[c];

            if (aI === bI && bI === cI) {
                ChunkedArray.add3(pickTris, a, b, c);
                continue;
            }

            let s = -1;
            if (aI === bI || aI === cI) s = aI;
            else if (bI === cI) s = bI;

            ChunkedArray.add3(pickPlatesVertices, vs[3 * a], vs[3 * a + 1], vs[3 * a + 2]);
            ChunkedArray.add3(pickPlatesVertices, vs[3 * b], vs[3 * b + 1], vs[3 * b + 2]);
            ChunkedArray.add3(pickPlatesVertices, vs[3 * c], vs[3 * c + 1], vs[3 * c + 2]);

            ChunkedArray.add3(pickPlatesTris, platesVertexCount++, platesVertexCount++, platesVertexCount++);

            if (s < 0) {
                color.r = 0; color.g = 0; color.b = 0;
            } else {
                Selection.Picking.assignPickColor(s, color);
            }

            ChunkedArray.add4(pickPlatesColors, color.r, color.g, color.b, 0.0);
            ChunkedArray.add4(pickPlatesColors, color.r, color.g, color.b, 0.0);
            ChunkedArray.add4(pickPlatesColors, color.r, color.g, color.b, 0.0);
        }
        ctx.platesVertexCount = ctx.platesVertexCount! + platesVertexCount;
    }

    async function computePickPlatesChunks(ctx: Context) {
        let started = Core.Utils.PerformanceMonitor.currentTime();

        for (let start = 0; start < ctx.triCount; start += chunkSize) {
            let time = Core.Utils.PerformanceMonitor.currentTime();
            if (time - started > Core.Computation.UpdateProgressDelta) {
                started = time;
                await ctx.computation.updateProgress('Creating selection geometry...', true, start, ctx.triCount);
            }

            computePickPlatesChunk(start, ctx);            
        }
    }

    function assignPickColors(ctx: Context) {
        let color = { r: 0.45, g: 0.45, b: 0.45 },
            ids = ctx.data.annotation!;

        ctx.pickTris = ChunkedArray.forIndexBuffer(ctx.triCount);
        let pickColorBuffer = ctx.pickColorBuffer!;

        for (let i = 0, _b = ctx.vertexCount; i < _b; i++) {
            let id = ids[i];
            if (id >= 0) {
                Selection.Picking.assignPickColor(id + 1, color);
                pickColorBuffer[i * 4] = color.r;
                pickColorBuffer[i * 4 + 1] = color.g;
                pickColorBuffer[i * 4 + 2] = color.b;
            }
        }
    }

    function createFullPickGeometry(attr: BasicAttributes, ctx: Context) {
        let pickGeometry = new THREE.BufferGeometry();
        pickGeometry.addAttribute('position', attr.position);
        pickGeometry.addAttribute('index', attr.index);
        pickGeometry.addAttribute('pColor', new THREE.BufferAttribute(ctx.pickColorBuffer, 4));
        ctx.geom.pickGeometry = pickGeometry;

        pickGeometry = new THREE.BufferGeometry();
        pickGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
        pickGeometry.addAttribute('index', new THREE.BufferAttribute(new Uint32Array(0), 1));
        pickGeometry.addAttribute('pColor', new THREE.BufferAttribute(new Float32Array(0), 4));
        ctx.geom.pickPlatesGeometry = pickGeometry;
    }

    function createPickGeometry(attr: BasicAttributes, ctx: Context) {
        let pickGeometry = new THREE.BufferGeometry();
        pickGeometry.addAttribute('position', attr.position);
        pickGeometry.addAttribute('index', attr.index);
        pickGeometry.addAttribute('pColor', new THREE.BufferAttribute(ctx.pickColorBuffer, 4));
        ctx.geom.pickGeometry = pickGeometry;

        pickGeometry = new THREE.BufferGeometry();
        pickGeometry.addAttribute('position', new THREE.BufferAttribute(ChunkedArray.compact(ctx.pickPlatesVertices!), 3));
        pickGeometry.addAttribute('index', new THREE.BufferAttribute(ChunkedArray.compact(ctx.pickPlatesTris!), 1));
        pickGeometry.addAttribute('pColor', new THREE.BufferAttribute(ChunkedArray.compact(ctx.pickPlatesColors!), 4));
        ctx.geom.pickPlatesGeometry = pickGeometry;
    }

    function addWireframeEdge(edges: ChunkedArray<number>, included: Core.Utils.FastSet<number>, a: number, b: number) {
        if (a > b) { 
            // swap
            let t = a; a = b; b = t;
        }
        if (included.add((a + b) * (a + b + 1) / 2 + b /* cantor pairing function */)) {
            ChunkedArray.add2(edges, a, b);
        }
    }

    function buildWireframeIndices(ctx: Context) {
        let tris = ctx.data.triangleIndices;
        let edges = ChunkedArray.create<number>(size => new Uint32Array(size), (1.5 * ctx.triCount) | 0, 2);
        let includedEdges = Core.Utils.FastSet.create<number>();

        for (let i = 0, _b = tris.length; i < _b; i += 3) {
            let a = tris[i], b = tris[i + 1], c = tris[i + 2];
            addWireframeEdge(edges, includedEdges, a, b);
            addWireframeEdge(edges, includedEdges, a, c);
            addWireframeEdge(edges, includedEdges, b, c);
        }
        return new THREE.BufferAttribute(ChunkedArray.compact(edges), 1);
    }

    type BasicAttributes = { position: THREE.BufferAttribute, index: THREE.BufferAttribute }
    function makeBasicAttributes(ctx: Context): BasicAttributes {
        return {
            position: new THREE.BufferAttribute(ctx.data.vertices, 3),
            index: new THREE.BufferAttribute(ctx.data.triangleIndices, 1)
        };
    }

    function createGeometry(attr: BasicAttributes, isWireframe: boolean, ctx: Context) {
        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', attr.position);
        geometry.addAttribute('normal', new THREE.BufferAttribute(ctx.data.normals, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(ctx.data.vertices.length), 3));

        if (isWireframe) {
            geometry.addAttribute('index', buildWireframeIndices(ctx));
        } else {
            geometry.addAttribute('index', attr.index);
        }

        ctx.geom.geometry = geometry;
        ctx.geom.vertexStateBuffer = new THREE.BufferAttribute(new Float32Array(ctx.data.vertices.length), 1);
        geometry.addAttribute('vState', ctx.geom.vertexStateBuffer);
    }

    async function computePickGeometry(attr: BasicAttributes, ctx: Context) {
        await ctx.computation.updateProgress('Creating selection geometry...');

        ctx.pickColorBuffer = new Float32Array(ctx.vertexCount * 4);
        if (!ctx.data.annotation) {
            createFullPickGeometry(attr, ctx);
            return;
        } else {
            assignPickColors(ctx);
            ctx.pickPlatesVertices = ChunkedArray.forVertex3D(Math.max(ctx.vertexCount / 10, 10));
            ctx.pickPlatesTris = ChunkedArray.forIndexBuffer(Math.max(ctx.triCount / 10, 10));
            ctx.pickPlatesColors = ChunkedArray.create<number>(s => new Float32Array(s), Math.max(ctx.vertexCount / 10, 10), 4);
            ctx.platesVertexCount = 0;

            await computePickPlatesChunks(ctx)
            createPickGeometry(attr, ctx);
        }
    }

    export async function buildGeometry(data: Data, computation: Core.Computation.Context, isWireframe: boolean): Promise<Geometry> {
        let ctx: Context = {
            data,
            computation,
            geom: new Geometry(),
            vertexCount: (data.vertices.length / 3) | 0,
            triCount: (data.triangleIndices.length / 3) | 0
        };

        await computation.updateProgress('Creating geometry...');
        await Core.Geometry.Surface.computeNormals(data).run(computation);
        await Core.Geometry.Surface.computeBoundingSphere(data).run(computation);

        const attr = makeBasicAttributes(ctx);

        await computeVertexMap(ctx);
        await computePickGeometry(attr, ctx);

        createGeometry(attr, isWireframe, ctx);
        ctx.geom.vertexToElementMap = ctx.data.annotation!;
        return ctx.geom;
    }

    export class Geometry extends GeometryBase {

        geometry: THREE.BufferGeometry = <any>void 0;
        vertexToElementMap: number[] = <any>void 0;
        elementToVertexMap: Selection.VertexMap = <any>void 0;

        pickGeometry: THREE.BufferGeometry = <any>void 0;
        pickPlatesGeometry: THREE.BufferGeometry = <any>void 0;

        vertexStateBuffer: THREE.BufferAttribute = <any>void 0;

        dispose() {
            this.geometry.dispose();
            if (this.pickGeometry) {
                this.pickGeometry.dispose();
                this.pickPlatesGeometry.dispose();
            }
        }

        constructor() {
            super();
        }
    }
}