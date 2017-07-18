/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    export class CartoonsGeometryParams {
        radialSegmentCount = 10;

        turnWidth = 0.1;

        strandWidth = 0.15;
        strandLineWidth = 0.1;

        helixWidth = 1.1;
        helixHeight = 0.1;

        sheetWidth = 1.1;
        sheetHeight = 0.1;

        arrowWidth = 1.7;
        tessalation = 2;

        static Default = new CartoonsGeometryParams();
    }

    import GB = Visualization.Geometry.Builder

    export class CartoonsGeometryState {
        residueIndex = 0;

        get verticesDone() {
            return this.vs.elementCount;
        }

        get trianglesDone() {
            return this.is.elementCount;
        }

        builder = GB.createDynamic(this.residueCount * 8, this.residueCount * 16);
        private vs = this.builder.vertices;
        private is = this.builder.indices;

        gapsBuilder = GB.createDynamic(256, 512);

        translationMatrix: THREE.Matrix4 = new THREE.Matrix4();
        scaleMatrix: THREE.Matrix4 = new THREE.Matrix4();
        rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();
        invMatrix: THREE.Matrix4 = new THREE.Matrix4();

        vertexMap: Selection.VertexMapBuilder;

        addVertex(v: THREE.Vector3, n: THREE.Vector3) {
            GB.addVertex3d(this.builder, v.x, v.y, v.z);
            GB.addNormal3d(this.builder, n.x, n.y, n.z);
        }

        addTriangle(i: number, j: number, k: number) {
            GB.addIndex3d(this.builder, i, j, k);
        }

        addTriangles(i: number, j: number, k: number, u: number, v: number, w: number) {
            GB.addIndex3d(this.builder, i, j, k);
            GB.addIndex3d(this.builder, u, v, w);
        }

        constructor(public params: CartoonsGeometryParams, private residueCount: number) {
            this.vertexMap = new Selection.VertexMapBuilder(residueCount);
        }
    }

    function makeStrandLineTemplate(ctx: Context) {
        let radius = ctx.params.strandLineWidth, tessalation = ctx.params.tessalation;
        let capPoints = 0, radiusPoints = 0, geom: THREE.Geometry;

        switch (tessalation) {
            case 0: radiusPoints = 2; capPoints = 1; break;
            case 1: radiusPoints = 3; capPoints = 2; break;
            case 2: radiusPoints = 4; capPoints = 2; break;
            case 3: radiusPoints = 8; capPoints = 4; break;
            case 4: radiusPoints = 10; capPoints = 6; break;
            case 5: radiusPoints = 14; capPoints = 6; break;
            default: radiusPoints = 16; capPoints = 8; break;
        }

        let arc: any = [],
            delta = (Math.PI / 2) / capPoints;
        for (let i = 0; i <= capPoints; i++) {
            arc[i] = new THREE.Vector3(0, radius * Math.cos(i * delta), 0.1 * Math.sin(i * delta));
            arc[i].z += 0.9;
        }
        geom = new THREE.LatheGeometry([new THREE.Vector3(0, radius, 0)].concat(arc), radiusPoints, Math.PI);
        let templ = GeometryHelper.getIndexedBufferGeometry(geom);
        ctx.strandTemplate = {
            vertex: (<any>templ.attributes).position.array,
            normal: (<any>templ.attributes).normal.array,
            index: (<any>templ.attributes).index.array,
            geometry: templ
        };

        let atoms = ctx.model.data.atoms, residues = ctx.model.data.residues;
        let positions = ctx.model.positions;
        ctx.strandArrays = {
            startIndex: residues.atomStartIndex,
            endIndex: residues.atomEndIndex,
            x: positions.x, y: positions.y, z: positions.z,
            name: atoms.name
        };
    }

    export function buildUnit(unit: CartoonAsymUnit, ctx: Context) {
        let state = ctx.state, params = ctx.params;
        let builder = ctx.builder;
        for (let index = 0, _max = unit.residueCount; index < _max; index++) {
            state.vertexMap.startElement(unit.residueIndex[index]);
            let numVertices = state.verticesDone;
            state.residueIndex = index;
            let start = unit.structureStarts.has(unit.residueIndex[index]);
            let end = unit.structureEnds.has(unit.residueIndex[index]);
            if (ctx.isTrace || unit.backboneOnly) {
                switch (unit.residueType[index]) {
                    case Core.Structure.SecondaryStructureType.Strand:
                        builder.addTube(unit, state, params.strandWidth, params.strandWidth);
                        if (start || end) {
                            builder.addTubeCap(unit, state, params.strandWidth, params.strandWidth, start, end);
                        }

                        if (!ctx.strandTemplate) {
                            makeStrandLineTemplate(ctx);
                        }
                        builder.addStrandLine(unit, state, ctx.strandTemplate, ctx.strandArrays, unit.residueIndex[index]);
                        break;
                    default:
                        builder.addTube(unit, state, params.turnWidth, params.turnWidth);
                        if (start || end) {
                            builder.addTubeCap(unit, state, params.turnWidth, params.turnWidth, start, end);
                        }
                        break;
                }
            } else {
                switch (unit.residueType[index]) {
                    case Core.Structure.SecondaryStructureType.Helix:
                        builder.addTube(unit, state, params.helixWidth, params.helixHeight);
                        if (start) {
                            builder.addTubeCap(unit, state, params.helixWidth, params.helixHeight, true, false);
                        } else if (end) {
                            builder.addTubeCap(unit, state, params.helixWidth, params.helixHeight, false, true);
                        }
                        break;
                    case Core.Structure.SecondaryStructureType.Sheet:

                        builder.addSheet(unit, state, start, end);
                        if (start || end) {
                            builder.addSheetCap(unit, state, start, end);
                        }
                        break;
                    case Core.Structure.SecondaryStructureType.Strand:
                        builder.addTube(unit, state, params.strandWidth, params.strandWidth);
                        if (start || end) {
                            builder.addTubeCap(unit, state, params.strandWidth, params.strandWidth, start, end);
                        }

                        if (!ctx.strandTemplate) {
                            makeStrandLineTemplate(ctx);
                        }
                        builder.addStrandLine(unit, state, ctx.strandTemplate, ctx.strandArrays, unit.residueIndex[index]);
                        break;
                    default:
                        builder.addTube(unit, state, params.turnWidth, params.turnWidth);
                        if (start || end) {
                            builder.addTubeCap(unit, state, params.turnWidth, params.turnWidth, start, end);
                        }
                        break;
                }
            }

            state.vertexMap.addVertexRange(numVertices, state.verticesDone);
            state.vertexMap.endElement();
        }
    }

    function isGap(ctx: Context, a: CartoonAsymUnit, b: CartoonAsymUnit) {        
        const { chainIndex } = ctx.model.data.residues;
        return chainIndex[a.endResidueIndex] === chainIndex[b.endResidueIndex];
    }

    import Vec3 = Core.Geometry.LinearAlgebra.Vector3
    function renderGap(ctx: Context, unitA: CartoonAsymUnit, unitB: CartoonAsymUnit) {
        const aL = unitA.controlPoints.length;
        const cpA = unitA.controlPoints, cpB = unitB.controlPoints;
        const a = Vec3.fromValues(cpA[aL - 3], cpA[aL - 2], cpA[aL - 1]), b = Vec3.fromValues(cpB[0], cpB[1], cpB[2]);
        const r = ctx.state.params.turnWidth / 2;
        GB.addDashedLine(ctx.state.gapsBuilder, a, b, 0.5, 0.5, r);
    }

    export async function buildUnitsAsync(ctx: Context): Promise<void> {
        const chunkSize = 10000; // residues
        let started = Core.Utils.PerformanceMonitor.currentTime();
        let unitIndex = 0;
        while (unitIndex < ctx.units.length) {
            let residuesDone = 0;

            while (residuesDone < chunkSize && unitIndex < ctx.units.length) {
                buildUnit(ctx.units[unitIndex], ctx);
                residuesDone += ctx.units[unitIndex].residueCount;
                unitIndex++;
            }

            let t = Core.Utils.PerformanceMonitor.currentTime();
            if (t - started > Core.Computation.UpdateProgressDelta) {
                started = t;
                await ctx.computation.updateProgress('Building units...', true, unitIndex, ctx.units.length);
            }
        }

        for (let i = 0; i < ctx.units.length - 1; i++) {
            if (isGap(ctx, ctx.units[i], ctx.units[i + 1])) {
                renderGap(ctx, ctx.units[i], ctx.units[i + 1]);
            }
        }
    }

    export function createGeometry(ctx: Context) {
        let state = ctx.state;

        let colorBuffer = new Float32Array(state.verticesDone * 3),
            pickColorBuffer = new Float32Array(state.verticesDone * 4),
            stateBuffer = new Float32Array(state.verticesDone);

        let geometry = GB.toBufferGeometry(state.builder);        
        geometry.addAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

        ctx.geom.vertexStateBuffer = new THREE.BufferAttribute(stateBuffer, 1);
        geometry.addAttribute('vState', ctx.geom.vertexStateBuffer);
        ctx.geom.geometry = geometry;

        if (state.gapsBuilder.vertices.elementCount) {
            ctx.geom.gapsGeometry = GB.toBufferGeometry(state.gapsBuilder);
        }

        let map = ctx.geom.vertexMap,
            color = { r: 0.45, g: 0.45, b: 0.45 },
            vertexRanges = map.vertexRanges;

        for (let elementIndex of map.elementIndices) {

            let elementOffset = map.elementMap.get(elementIndex)!;

            let rangeStart = map.elementRanges[2 * elementOffset],
                rangeEnd = map.elementRanges[2 * elementOffset + 1];

            if (rangeStart === rangeEnd) continue;

            Selection.Picking.assignPickColor(elementIndex, color);

            for (let i = rangeStart; i < rangeEnd; i += 2) {

                let vStart = vertexRanges[i], vEnd = vertexRanges[i + 1];

                for (let j = vStart; j < vEnd; j++) {
                    pickColorBuffer[j * 4] = color.r;
                    pickColorBuffer[j * 4 + 1] = color.g;
                    pickColorBuffer[j * 4 + 2] = color.b;
                }
            }
        }

        let pickGeometry = new THREE.BufferGeometry();
        pickGeometry.addAttribute('position', geometry.getAttribute('position'));
        pickGeometry.addAttribute('index', geometry.getAttribute('index'));
        pickGeometry.addAttribute('pColor', new THREE.BufferAttribute(pickColorBuffer, 4));
        ctx.geom.pickGeometry = pickGeometry;
    }

    export class Builder {

        constructor() {
        }

        private tempVectors = [
            new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(),
            new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(),
            new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

        private setVector(data: number[], i: number, v: THREE.Vector3) {
            v.set(data[3 * i], data[3 * i + 1], data[3 * i + 2]);
            return v;
        }

        addTube(element: CartoonAsymUnit, state: CartoonsGeometryState, width: number, height: number) {
            let verticesDone = state.verticesDone,
                i = 0, j = 0,
                radialVector = this.tempVectors[0], normalVector = this.tempVectors[1],
                tempPos = this.tempVectors[2], a = this.tempVectors[3], b = this.tempVectors[4], u = this.tempVectors[5], v = this.tempVectors[6],
                
                elementOffsetStart = state.residueIndex * element.linearSegmentCount,
                elementOffsetEnd = elementOffsetStart + element.linearSegmentCount,
                elementPoints = element.controlPoints,
                elementPointsCount = element.linearSegmentCount + 1,
                torsionVectors = element.torsionVectors,
                normalVectors = element.normalVectors,
                radialSegmentCount = state.params.radialSegmentCount;

            for (i = elementOffsetStart; i <= elementOffsetEnd; i++) {
                this.setVector(torsionVectors, i, u);
                this.setVector(normalVectors, i, v);

                for (j = 0; j < radialSegmentCount; j++) {

                    let t = 2 * Math.PI * j / radialSegmentCount;

                    a.copy(u);
                    b.copy(v);
                    radialVector.addVectors(a.multiplyScalar(width * Math.cos(t)), b.multiplyScalar(height * Math.sin(t)));

                    a.copy(u);
                    b.copy(v);
                    normalVector.addVectors(a.multiplyScalar(height * Math.cos(t)), b.multiplyScalar(width * Math.sin(t)));
                    normalVector.normalize();

                    this.setVector(elementPoints, i, tempPos);
                    tempPos.add(radialVector);


                    state.addVertex(tempPos, normalVector);
                }
            }

            for (i = 0; i < elementPointsCount - 1; i++) {
                for (j = 0; j < radialSegmentCount; j++) {
                    state.addTriangles(
                        (verticesDone + i * radialSegmentCount + j),
                        (verticesDone + (i + 1) * radialSegmentCount + (j + 1) % radialSegmentCount),
                        (verticesDone + i * radialSegmentCount + (j + 1) % radialSegmentCount),

                        (verticesDone + i * radialSegmentCount + j),
                        (verticesDone + (i + 1) * radialSegmentCount + j),
                        (verticesDone + (i + 1) * radialSegmentCount + (j + 1) % radialSegmentCount));
                }
            }
        }

        addTubeCap(element: CartoonAsymUnit, state: CartoonsGeometryState, width: number, height: number, isStart: boolean, isEnd: boolean) {
            let verticesDone = state.verticesDone,

                t: number,
                radialVector = this.tempVectors[0], normalVector = this.tempVectors[1],
                a = this.tempVectors[2], b = this.tempVectors[3], u = this.tempVectors[4], v = this.tempVectors[5], tA = this.tempVectors[6], tB = this.tempVectors[7],
                
                elementOffsetStart = state.residueIndex * element.linearSegmentCount,
                elementPoints = element.controlPoints,
                elementPointsCount = element.linearSegmentCount + 1,
                torsionVectors = element.torsionVectors,
                normalVectors = element.normalVectors,
                radialSegmentCount = state.params.radialSegmentCount;

            this.setVector(torsionVectors, elementOffsetStart, tA);
            this.setVector(normalVectors, elementOffsetStart, tB);
            normalVector.crossVectors(tA, tB);

            if (isEnd) {
                normalVector.negate();
            }

            let offset = elementOffsetStart + (isStart ? 0 : (elementPointsCount - 1));


            this.setVector(elementPoints, offset, radialVector);
            state.addVertex(radialVector, normalVector);

            this.setVector(torsionVectors, offset, u);
            this.setVector(normalVectors, offset, v);
            for (let i = 0; i < radialSegmentCount; i++) {
                t = 2 * Math.PI * i / radialSegmentCount;

                a.copy(u);
                b.copy(v);
                radialVector.addVectors(a.multiplyScalar(Math.cos(t) * width), b.multiplyScalar(Math.sin(t) * height));

                this.setVector(elementPoints, offset, tA);
                radialVector.add(tA);

                state.addVertex(radialVector, normalVector);

                if (isStart) {
                    state.addTriangle(verticesDone, (verticesDone + i + 1), (verticesDone + (i + 1) % radialSegmentCount + 1));
                } else {
                    state.addTriangle((verticesDone), (verticesDone + (i + 1) % radialSegmentCount + 1), (verticesDone + i + 1));
                }
            }
        }

        addSheet(element: CartoonAsymUnit, state: CartoonsGeometryState, isStart: boolean, isEnd: boolean) {
            let verticesDone = state.verticesDone,
                params = state.params,

                i = 0, j = 0,
                horizontalVector = this.tempVectors[0], verticalVector = this.tempVectors[1], positionVector = this.tempVectors[2],
                normalOffset = this.tempVectors[3], normalVector = this.tempVectors[4],
                temp = this.tempVectors[5], tA = this.tempVectors[7], tB = this.tempVectors[8],
                torsionVector = this.tempVectors[9],
                
                elementOffsetStart = state.residueIndex * element.linearSegmentCount,
                elementOffsetEnd = elementOffsetStart + element.linearSegmentCount,
                elementPoints = element.controlPoints,
                torsionVectors = element.torsionVectors,
                normalVectors = element.normalVectors,
                
                offsetLength = 0, actualWidth = 0;

            normalOffset.set(0, 0, 0);

            if (isEnd) {
                this.setVector(elementPoints, elementOffsetEnd, tA);
                this.setVector(elementPoints, elementOffsetStart, tB);
                offsetLength = params.arrowWidth / temp.subVectors(tA, tB).length();
            }

            for (i = elementOffsetStart; i <= elementOffsetEnd; i++) {
                actualWidth = !isEnd ? params.sheetWidth : params.arrowWidth * (1 - (i - elementOffsetStart) / element.linearSegmentCount);

                this.setVector(torsionVectors, i, horizontalVector);
                horizontalVector.multiplyScalar(actualWidth);

                this.setVector(normalVectors, i, verticalVector);
                verticalVector.multiplyScalar(params.sheetHeight);

                if (isEnd) {
                    this.setVector(normalVectors, i, tA);
                    this.setVector(torsionVectors, i, tB);

                    normalOffset.crossVectors(tA, tB).multiplyScalar(offsetLength);
                }

                this.setVector(elementPoints, i, positionVector);
                this.setVector(normalVectors, i, normalVector);
                this.setVector(torsionVectors, i, torsionVector);

                tA.copy(positionVector).add(horizontalVector).add(verticalVector);
                tB.copy(normalVector);
                state.addVertex(tA, tB);

                tA.copy(positionVector).sub(horizontalVector).add(verticalVector);
                state.addVertex(tA, tB);

                tA.copy(positionVector).sub(horizontalVector).add(verticalVector);
                tB.copy(torsionVector).negate().add(normalOffset);
                state.addVertex(tA, tB);

                tA.copy(positionVector).sub(horizontalVector).sub(verticalVector);
                state.addVertex(tA, tB);

                tA.copy(positionVector).sub(horizontalVector).sub(verticalVector);
                tB.copy(normalVector).negate();
                state.addVertex(tA, tB);

                tA.copy(positionVector).add(horizontalVector).sub(verticalVector);
                state.addVertex(tA, tB);

                tA.copy(positionVector).add(horizontalVector).sub(verticalVector);
                tB.copy(torsionVector).add(normalOffset);
                state.addVertex(tA, tB);

                tA.copy(positionVector).add(horizontalVector).add(verticalVector);
                state.addVertex(tA, tB);
            }

            for (i = 0; i < element.linearSegmentCount; i++) {
                for (j = 0; j < 4; j++) {
                    state.addTriangles(
                        verticesDone + i * 8 + 2 * j, verticesDone + (i + 1) * 8 + 2 * j + 1, verticesDone + i * 8 + 2 * j + 1,
                        verticesDone + i * 8 + 2 * j, verticesDone + (i + 1) * 8 + 2 * j, verticesDone + (i + 1) * 8 + 2 * j + 1);
                }
            }
        }

        addSheetCap(element: CartoonAsymUnit, state: CartoonsGeometryState, isStart: boolean, isEnd: boolean) {
            let params = state.params,
                
                elementOffsetStart = state.residueIndex * element.linearSegmentCount,
                elementPoint = this.setVector(element.controlPoints, elementOffsetStart, this.tempVectors[0]);

            let horizontalVector = this.setVector(element.torsionVectors, elementOffsetStart, this.tempVectors[1]).multiplyScalar(params.sheetWidth);
            let verticalVector = this.setVector(element.normalVectors, elementOffsetStart, this.tempVectors[2]).multiplyScalar(params.sheetHeight);

            let p1 = this.tempVectors[3].addVectors(elementPoint, horizontalVector).add(verticalVector),
                p2 = this.tempVectors[4].subVectors(elementPoint, horizontalVector).add(verticalVector),
                p3 = this.tempVectors[5].subVectors(elementPoint, horizontalVector).sub(verticalVector),
                p4 = this.tempVectors[6].addVectors(elementPoint, horizontalVector).sub(verticalVector);

            if (isStart) {
                this.addSheepCapSection(state, p1, p2, p3, p4);
            }
            else {
                let arrowHorizontalVector = this.setVector(element.torsionVectors, elementOffsetStart, this.tempVectors[7]).multiplyScalar(params.arrowWidth);

                let p5 = this.tempVectors[8].addVectors(elementPoint, arrowHorizontalVector).add(verticalVector),
                    p6 = this.tempVectors[9].subVectors(elementPoint, arrowHorizontalVector).add(verticalVector),
                    p7 = this.tempVectors[10].subVectors(elementPoint, arrowHorizontalVector).sub(verticalVector),
                    p8 = this.tempVectors[11].addVectors(elementPoint, arrowHorizontalVector).sub(verticalVector);

                this.addSheepCapSection(state, p5, p1, p4, p8);
                this.addSheepCapSection(state, p2, p6, p7, p3);
            }
        }

        addSheepCapSection(state: CartoonsGeometryState, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3) {
            let addedVerticesCount = state.verticesDone,
                normal = this.tempVectors[12].crossVectors(this.tempVectors[13].subVectors(p2, p1), this.tempVectors[14].subVectors(p4, p1)).normalize();

            state.addVertex(p1, normal); state.addVertex(p2, normal); state.addVertex(p3, normal); state.addVertex(p4, normal);

            state.addTriangles(
                addedVerticesCount, addedVerticesCount + 1, addedVerticesCount + 2,
                addedVerticesCount + 2, addedVerticesCount + 3, addedVerticesCount);
        }

        private findN3(index: number, arrays: { startIndex: number[]; endIndex: number[]; x: number[]; y: number[]; z: number[]; name: string[] }, target: THREE.Vector3) {

            let start = arrays.startIndex[index], end = arrays.endIndex[index];
            let found = false;

            for (let i = start; i < end; i++) {
                if (arrays.name[i] === "N3") {
                    target.set(arrays.x[i], arrays.y[i], arrays.z[i]);
                    found = true;
                    break;
                }
            }

            return found;
        }

        addStrandLine(
            element: CartoonAsymUnit, state: CartoonsGeometryState,
            template: { vertex: number[]; normal: number[]; index: number[]; geometry: THREE.BufferGeometry },
            arrays: { startIndex: number[]; endIndex: number[]; x: number[]; y: number[]; z: number[]; name: string[] },
            residueIndex: number) {

            if (!this.findN3(residueIndex, arrays, this.tempVectors[3])) return;

            let p = this.tempVectors[0], n = this.tempVectors[1], i: number,
                vb = template.vertex,
                nb = template.normal,
                ib = template.index,
                vertexStart = state.verticesDone,
                vertexCount = vb.length,
                triangleCount = ib.length,
                elementOffset = state.residueIndex * element.linearSegmentCount + ((0.5 * element.linearSegmentCount + 1) | 0),
                elementPoint = this.setVector(element.controlPoints, elementOffset, this.tempVectors[2]),
                nDir = this.tempVectors[3].sub(elementPoint),
                length = nDir.length();

            nDir.normalize();

            state.translationMatrix.makeTranslation(elementPoint.x, elementPoint.y, elementPoint.z);
            state.scaleMatrix.makeScale(1, 1, length);
            state.rotationMatrix.makeRotationAxis(new THREE.Vector3(-nDir.y, nDir.x, 0), Math.acos(nDir.z));
            state.translationMatrix.multiply(state.rotationMatrix).multiply(state.scaleMatrix);
            template.geometry.applyMatrix(state.translationMatrix);
            for (i = 0; i < vertexCount; i += 3) {
                p.set(vb[i], vb[i + 1], vb[i + 2]);
                n.set(nb[i], nb[i + 1], nb[i + 2]);
                state.addVertex(p, n);
            }
            for (i = 0; i < triangleCount; i += 3) {
                state.addTriangle(vertexStart + ib[i], vertexStart + ib[i + 1], vertexStart + ib[i + 2]);
            }
            state.invMatrix.getInverse(state.translationMatrix);
            template.geometry.applyMatrix(state.invMatrix);
        }

    }

}