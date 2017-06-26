/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.BallsAndSticks {
    "use strict";

    namespace BallsAndSticksHelper {
        export function analyze(model: Core.Structure.Molecule.Model, atomIndices: number[], params: Parameters) {            
            const bonds = Core.Structure.computeBonds(model, atomIndices, {
                maxHbondLength:params.customMaxBondLengths && params.customMaxBondLengths.has('H') ? params.customMaxBondLengths.get('H')! : 1.15
            });

            const { residueIndex } = model.data.atoms;
            let lastResidue = -1;
            let residueCount = 0;
            for (const aI of atomIndices) {
                const raI = residueIndex[aI];
                if (raI !== lastResidue) residueCount++;                
                lastResidue = raI;
            }

            let stickCount = 0;
            let { type, count } = bonds;
            for (let i = 0; i < count; i++) {
                const t = type[i];
                if (t === 0 || t === 5) stickCount += 1;
                else if (t >= 1 && t <= 4) stickCount += t;
            }

            return {
                bonds,
                stickCount
            }
        }
    }

    import BT = Core.Structure.BondType

    class BondModelState {
        atomsVector = new THREE.Vector3();
        center = new THREE.Vector3();
        rotationAxis = new THREE.Vector3();
        upVector = new THREE.Vector3(0, 1, 0);

        scaleMatrix = new THREE.Matrix4();
        rotationMatrix = new THREE.Matrix4();
        translationMatrix = new THREE.Matrix4();
        offsetMatrix = new THREE.Matrix4();
        finalMatrix = new THREE.Matrix4();

        sticksDone = 0;
        radius = 0.15;
        offset = new THREE.Vector3();
        a = new THREE.Vector3();
        b = new THREE.Vector3();

        constructor(
            public template: THREE.BufferGeometry,
            public templateVB: Float32Array,
            public templateNB: Float32Array,
            public templateIB: Uint32Array,
            public templateVertexCount: number,

            public vertices: Float32Array,
            public normals: Float32Array,
            public indices: Uint32Array) {
        }

    }

    class BuildState {
        static getBondTemplate(radius: number, tessalation: number) {
            let detail: number;

            switch (tessalation) {
                case 0: detail = 2; break;
                case 1: detail = 4; break;
                case 2: detail = 6; break;
                case 3: detail = 8; break;
                case 4: detail = 10; break;
                case 5: detail = 12; break;
                default: detail = 14; break;
            }

            let template = GeometryHelper.getIndexedBufferGeometry(
                new THREE.LatheGeometry([new THREE.Vector3(0, radius, -1 / 2), new THREE.Vector3(0, radius, 1 / 2)], detail, Math.PI));
            template.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
            return template;
        }

        static getAtomTemplate(radius: number, tessalation: number) {
            let base: any;
            switch (tessalation) {
                case 0: base = new THREE.OctahedronGeometry(radius, 0); break;
                case 1: base = new THREE.OctahedronGeometry(radius, 1); break;
                case 2: base = new THREE.IcosahedronGeometry(radius, 0); break;
                case 3: base = new THREE.IcosahedronGeometry(radius, 1); break;
                case 4: base = new THREE.IcosahedronGeometry(radius, 2); break;
                case 5: base = new THREE.OctahedronGeometry(radius, 3); break;
                default: base = new THREE.IcosahedronGeometry(radius, 3); break;
            }
            return GeometryHelper.getIndexedBufferGeometry(base);
        }

        tessalation = this.params.tessalation;
        atomRadius = this.params.atomRadius;
        bondRadius = this.params.bondRadius;
        hideBonds = this.params.hideBonds;

        bondTemplate = BuildState.getBondTemplate(1.0, this.tessalation!);
        atomTemplate = BuildState.getAtomTemplate(1.0, this.tessalation!);
        cubeTemplate = GeometryHelper.getIndexedBufferGeometry(new THREE.BoxGeometry(1, 1, 1));

        bondTemplateVertexBuffer = (<any>this.bondTemplate.attributes).position.array;
        bondTemplateVertexBufferLength = this.bondTemplateVertexBuffer.length;
        bondTemplateVertexCount = (this.bondTemplateVertexBufferLength / 3) | 0;
        bondTemplateIndexBuffer = (<any>this.bondTemplate.attributes).index.array;
        bondTemplateIndexBufferLength = this.bondTemplateIndexBuffer.length;
        bondTemplateNormalBuffer = (<any>this.bondTemplate.attributes).normal.array;

        cubeTemplateVertexBuffer = (<any>this.cubeTemplate.attributes).position.array;
        cubeTemplateVertexBufferLength = this.cubeTemplateVertexBuffer.length;
        cubeTemplateVertexCount = (this.cubeTemplateVertexBufferLength / 3) | 0;
        cubeTemplateIndexBuffer = (<any>this.cubeTemplate.attributes).index.array;
        cubeTemplateIndexBufferLength = this.cubeTemplateIndexBuffer.length;
        cubeTemplateNormalBuffer = (<any>this.cubeTemplate.attributes).normal.array;

        atomTemplateVertexBuffer = (<any>this.atomTemplate.attributes).position.array;
        atomTemplateVertexBufferLength = this.atomTemplateVertexBuffer.length;
        atomTemplateVertexCount = (this.atomTemplateVertexBufferLength / 3) | 0;
        atomTemplateIndexBuffer = (<any>this.atomTemplate.attributes).index.array;
        atomTemplateIndexBufferLength = this.atomTemplateIndexBuffer.length;
        atomTemplateNormalBuffer = (<any>this.atomTemplate.attributes).normal.array;

        atomBufferSize = this.atomTemplateVertexBufferLength * this.atomIndices.length;
        atomVertices = new Float32Array(this.atomBufferSize);
        atomNormals = new Float32Array(this.atomBufferSize);
        atomTriangleIndices = new Uint32Array(this.atomTemplateIndexBufferLength * this.atomIndices.length);
        atomColors = new Float32Array(this.atomBufferSize);
        atomPickColors = new Float32Array(this.atomTemplateVertexCount * 4 * this.atomIndices.length);

        atoms = this.model.data.atoms;
        positions = this.model.positions;
        cX = this.positions.x; cY = this.positions.y; cZ = this.positions.z;
        atomSymbols = this.atoms.elementSymbol;
        residueIndex = this.atoms.residueIndex;
        atomsDone = 0;
        offset = 0;
        bondsDone = 0;

        atomsVector = new THREE.Vector3();
        center = new THREE.Vector3();
        rotationAxis = new THREE.Vector3();
        up = new THREE.Vector3(0, 1, 0);
        rotationAngle: number;

        scaleMatrix = new THREE.Matrix4();
        rotationMatrix = new THREE.Matrix4();
        translationMatrix = new THREE.Matrix4();
        atom1Vec = new THREE.Vector3();
        atom2Vec = new THREE.Vector3();
        finalMatrix: THREE.Matrix4;

        pickColor = { r: 0.1, g: 0.1, b: 0.1 };

        atomMapBuilder = new Selection.VertexMapBuilder(this.atomIndices.length);
        tempVector = new THREE.Vector3(0, 0, 0);

        bs: BondsBuildState = <any>void 0;

        constructor(public model: Core.Structure.Molecule.Model, public atomIndices: number[], public params: Parameters) {

        }
    }

    class BondsBuildState {
        model = this.state.model;
        atomIndices = this.state.atomIndices;
        info = BallsAndSticksHelper.analyze(this.state.model, this.state.atomIndices, this.state.params);

        //bondMapBuilder = new Selection.VertexMapBuilder(this.info.residueCount);

        bondBufferSize = this.state.bondTemplateVertexBufferLength * this.info.stickCount;
        bondVertices = new Float32Array(this.bondBufferSize);
        bondNormals = new Float32Array(this.bondBufferSize);
        bondColors = new Float32Array(this.bondBufferSize);
        bondIndices = new Uint32Array(this.state.bondTemplateIndexBufferLength * this.info.stickCount);

        bondRadius = this.state.params.bondRadius;

        //residueIndex = this.model.data.atoms.residueIndex;
        //currentResidueIndex = this.residueIndex[this.info.bonds.atomAIndex[0]];
        //bondMapVertexOffsetStart = 0;
        //bondMapVertexOffsetEnd = 0;
        covalentBondState = new BondModelState(
            this.state.bondTemplate, this.state.bondTemplateVertexBuffer, this.state.bondTemplateNormalBuffer, this.state.bondTemplateIndexBuffer, this.state.bondTemplateVertexCount,
            this.bondVertices, this.bondNormals, this.bondIndices);

        bondCount = this.info.bonds.count;

        constructor(public state: BuildState) {

        }
    }

    class BallsAndSticksGeometryBuilder {
        atomsGeometry: THREE.BufferGeometry;
        bondsGeometry: THREE.BufferGeometry;

        pickGeometry: THREE.BufferGeometry;

        atomVertexMap: Selection.VertexMap;
        bondVertexMap: Selection.VertexMap;

        vertexStateBuffer: THREE.BufferAttribute;


        dispose() {
            this.atomsGeometry.dispose();
            this.bondsGeometry.dispose();
            this.pickGeometry.dispose();
        }

        private static addAtom(a: number, state: BuildState) {
            state.atomMapBuilder.startElement(a);

            let r = state.atomRadius!(a);

            state.scaleMatrix.makeScale(r, r, r);
            state.tempVector.set(state.cX[a], state.cY[a], state.cZ[a]);

            state.translationMatrix.makeTranslation(state.tempVector.x, state.tempVector.y, state.tempVector.z).multiply(state.scaleMatrix);
            state.atomTemplate.applyMatrix(state.translationMatrix);

            for (let i = 0; i < state.atomTemplateVertexBufferLength; i++) {
                state.offset = state.atomsDone * state.atomTemplateVertexBufferLength + i;
                state.atomVertices[state.offset] = state.atomTemplateVertexBuffer[i];
                state.atomNormals[state.offset] = state.atomTemplateNormalBuffer[i];
            }

            for (let i = 0; i < state.atomTemplateIndexBufferLength; i++) {
                state.offset = state.atomTemplateIndexBufferLength * state.atomsDone + i;
                state.atomTriangleIndices[state.offset] = state.atomTemplateIndexBuffer[i] + (state.atomTemplateVertexCount) * state.atomsDone;
            }

            Selection.Picking.assignPickColor(a, state.pickColor);

            for (let i = 0; i < state.atomTemplateVertexCount; i++) {
                state.offset = state.atomsDone * state.atomTemplateVertexCount * 4 + 4 * i;
                state.atomPickColors[state.offset] = state.pickColor.r;
                state.atomPickColors[state.offset + 1] = state.pickColor.g;
                state.atomPickColors[state.offset + 2] = state.pickColor.b;
            }

            state.scaleMatrix.getInverse(state.translationMatrix);
            state.atomTemplate.applyMatrix(state.scaleMatrix);

            state.atomMapBuilder.addVertexRange(state.atomsDone * state.atomTemplateVertexCount, (state.atomsDone + 1) * state.atomTemplateVertexCount);
            state.atomMapBuilder.endElement();

            state.atomsDone++;
        }
        
        private static addBond(b: number, state: BuildState, bs: BondsBuildState) {
            let aI = bs.info.bonds.atomAIndex[b], bI = bs.info.bonds.atomBIndex[b], type = bs.info.bonds.type[b];

            // if (bs.currentResidueIndex !== bs.residueIndex[aI]) {
            //     bs.bondMapBuilder.addVertexRange(bs.bondMapVertexOffsetStart, bs.bondMapVertexOffsetEnd);
            //     bs.bondMapVertexOffsetStart = bs.bondMapVertexOffsetEnd;
            //     bs.bondMapBuilder.endElement();

            //     bs.currentResidueIndex = bs.residueIndex[aI];
            //     bs.bondMapBuilder.startElement(bs.currentResidueIndex);
            // }

            state.tempVector.set(state.cX[aI], state.cY[aI], state.cZ[aI]);
            bs.covalentBondState.a.set(state.tempVector.x, state.tempVector.y, state.tempVector.z);

            state.tempVector.set(state.cX[bI], state.cY[bI], state.cZ[bI]);
            bs.covalentBondState.b.set(state.tempVector.x, state.tempVector.y, state.tempVector.z);

            let r = +bs.bondRadius!, 
                o = 2 * r / 3,
                h = r / 2;

            let bondState = bs.covalentBondState;
            let order = 0;
            switch (type) {
                case BT.Unknown:
                case BT.Single:
                    order = 1;
                    bondState.radius = r!;
                    bondState.offset.x = 0.0;
                    bondState.offset.y = 0.0;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Double:
                    order = 2;
                    bondState.radius = h;
                    bondState.offset.x = o;
                    bondState.offset.y = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset.x = -o;
                    bondState.offset.y = -o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Triple:
                    order = 3;
                    bondState.radius = h;
                    bondState.offset.x = 0.0;
                    bondState.offset.y = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset.x = -Math.cos(Math.PI / 3) * o;
                    bondState.offset.y = -Math.sin(Math.PI / 3) * o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset.x = -bondState.offset.x;
                    //bondState.offset.y = -0.05;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Aromatic:
                    order = 4;
                    bondState.radius = h / 2;
                    bondState.offset.x = o;
                    bondState.offset.y = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset.x = -o;
                    bondState.offset.y = -o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset.x = -o;
                    bondState.offset.y = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset.x = o;
                    bondState.offset.y = -o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Metallic:
                    order = 1;
                    bondState.radius = r!;
                    bondState.offset.x = 0.0;
                    bondState.offset.y = 0.0;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
            }

            //bs.bondMapVertexOffsetEnd += order * bs.state.bondTemplateVertexBufferLength;
        }


        private static addBondPart(state: BondModelState) {
            state.atomsVector.subVectors(state.a, state.b);

            let length = state.atomsVector.length();

            state.center.addVectors(state.a, state.b).divideScalar(2);
            state.rotationAxis.crossVectors(state.atomsVector, state.upVector).normalize();
            let rotationAngle = state.atomsVector.angleTo(state.upVector);

            state.scaleMatrix.makeScale(state.radius, length, state.radius);
            state.offsetMatrix.makeTranslation(state.offset.x, state.offset.y, state.offset.z);
            state.rotationMatrix.makeRotationAxis(state.rotationAxis, -rotationAngle);
            state.translationMatrix.makeTranslation(state.center.x, state.center.y, state.center.z);

            state.finalMatrix = state.translationMatrix.multiply(state.rotationMatrix).multiply(state.offsetMatrix).multiply(state.scaleMatrix);

            state.template.applyMatrix(state.finalMatrix);

            state.vertices.set(state.templateVB, state.templateVB.length * state.sticksDone);
            state.normals.set(state.templateNB, state.templateVB.length * state.sticksDone);

            let tIB = state.templateIB,
                ib = state.indices,
                offsetIB = state.templateIB.length * state.sticksDone,
                offsetVB = state.templateVertexCount * state.sticksDone;
            for (let i = 0; i < tIB.length; i++) {
                ib[offsetIB++] = tIB[i] + offsetVB;
            }

            state.rotationMatrix.getInverse(state.finalMatrix);
            state.template.applyMatrix(state.rotationMatrix);

            state.sticksDone++;
        }

        // private static addMetallicBondPart(state: BondModelState) {
        //     state.atomsVector.subVectors(state.a, state.b);

        //     let length = state.atomsVector.length();

        //     state.center.addVectors(state.a, state.b).divideScalar(2);
        //     state.rotationAxis.crossVectors(state.atomsVector, state.upVector).normalize();
        //     let rotationAngle = state.atomsVector.angleTo(state.upVector);

        //     state.scaleMatrix.makeScale(state.radius, length, state.radius);
        //     state.offsetMatrix.makeTranslation(state.offset.x, state.offset.y, state.offset.z);
        //     state.rotationMatrix.makeRotationAxis(state.rotationAxis, -rotationAngle);
        //     state.translationMatrix.makeTranslation(state.center.x, state.center.y, state.center.z);

        //     state.finalMatrix = state.translationMatrix.multiply(state.rotationMatrix).multiply(state.offsetMatrix).multiply(state.scaleMatrix);

        //     state.template.applyMatrix(state.finalMatrix);

        //     state.vertices.set(state.templateVB, state.templateVB.length * state.sticksDone);
        //     state.normals.set(state.templateNB, state.templateVB.length * state.sticksDone);

        //     let tIB = state.templateIB,
        //         ib = state.indices,
        //         offsetIB = state.templateIB.length * state.sticksDone,
        //         offsetVB = state.templateVertexCount * state.sticksDone;
        //     for (let i = 0; i < tIB.length; i++) {
        //         ib[offsetIB++] = tIB[i] + offsetVB;
        //     }

        //     state.rotationMatrix.getInverse(state.finalMatrix);
        //     state.template.applyMatrix(state.rotationMatrix);

        //     state.sticksDone++;
        // }

        private static getEmptyBondsGeometry() {
            let bondsGeometry = new THREE.BufferGeometry();
            bondsGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            bondsGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(0), 3));
            bondsGeometry.addAttribute('index', new THREE.BufferAttribute(new Uint32Array(0), 1));
            bondsGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
            //let bondMapBuilder = new Selection.VertexMapBuilder(1);
            return { bondsGeometry/*, bondVertexMap: bondMapBuilder.getMap()*/ };
        }

        private static getBondsGeometry(state: BondsBuildState) {
            let bondsGeometry = new THREE.BufferGeometry();
            bondsGeometry.addAttribute('position', new THREE.BufferAttribute(state.bondVertices, 3));
            bondsGeometry.addAttribute('normal', new THREE.BufferAttribute(state.bondNormals, 3));
            bondsGeometry.addAttribute('index', new THREE.BufferAttribute(state.bondIndices, 1));
            bondsGeometry.addAttribute('color', new THREE.BufferAttribute(state.bondColors, 3));
            return { bondsGeometry /*, bondVertexMap: state.bondMapBuilder.getMap()*/ };
        }

        private static getAtomsGeometry(state: BuildState) {
            let atomsGeometry = new THREE.BufferGeometry();
            atomsGeometry.addAttribute('position', new THREE.BufferAttribute(state.atomVertices, 3));
            atomsGeometry.addAttribute('normal', new THREE.BufferAttribute(state.atomNormals, 3));
            atomsGeometry.addAttribute('index', new THREE.BufferAttribute(state.atomTriangleIndices, 1));
            atomsGeometry.addAttribute('color', new THREE.BufferAttribute(state.atomColors, 3));

            let stateBuffer = new Float32Array(state.atomVertices.length);
            let vertexStateBuffer = new THREE.BufferAttribute(stateBuffer, 1);
            atomsGeometry.addAttribute('vState', vertexStateBuffer);

            let atomsPickGeometry = new THREE.BufferGeometry();
            atomsPickGeometry.addAttribute('position', new THREE.BufferAttribute(state.atomVertices, 3));
            atomsPickGeometry.addAttribute('index', new THREE.BufferAttribute(state.atomTriangleIndices, 1));
            atomsPickGeometry.addAttribute('pColor', new THREE.BufferAttribute(state.atomPickColors, 4));

            return {
                vertexStateBuffer,
                atomsGeometry,
                atomsPickGeometry,
                atomVertexMap: state.atomMapBuilder.getMap()
            };
        }

        private static async addAtoms(state: BuildState, ctx: Core.Computation.Context) {
            const chunkSize = 1250;
            let started = Core.Utils.PerformanceMonitor.currentTime();

            for (let start = 0, _l = state.atomIndices.length; start < _l; start += chunkSize) {
                for (let i = start, _b = Math.min(start + chunkSize, state.atomIndices.length); i < _b; i++) {
                    BallsAndSticksGeometryBuilder.addAtom(state.atomIndices[i], state);
                }
                let t = Core.Utils.PerformanceMonitor.currentTime();
                if (t - started > Core.Computation.UpdateProgressDelta) {
                    started = t;
                    await ctx.updateProgress('Adding atoms...', true, start, _l);
                }
            }
        }

        private static async addBondsChunks(state: BuildState, bs: BondsBuildState, ctx: Core.Computation.Context) {
            const chunkSize = 1250;
            let started = Core.Utils.PerformanceMonitor.currentTime();
            for (let start = 0; start < bs.bondCount; start += chunkSize) {
                for (let i = start, _b = Math.min(start + chunkSize, bs.bondCount); i < _b; i++) {
                    BallsAndSticksGeometryBuilder.addBond(i, state, bs);
                }
                let t = Core.Utils.PerformanceMonitor.currentTime();
                if (t - started > Core.Computation.UpdateProgressDelta) {
                    started = t;
                    await ctx.updateProgress('Adding bonds...', true, start, bs.bondCount);
                }
            }
        }

        private static async addBonds(state: BuildState, ctx: Core.Computation.Context) {
            if (state.params.hideBonds) {
                return;
            }

            await ctx.updateProgress('Computing bonds...', true);

            let bs = new BondsBuildState(state);
            state.bs = bs;
            //bs.currentResidueIndex = bs.residueIndex[bs.info.bonds.atomAIndex[0]];
            //bs.bondMapBuilder.startElement(bs.currentResidueIndex);
            await BallsAndSticksGeometryBuilder.addBondsChunks(state, bs, ctx);
            //bs.bondMapBuilder.addVertexRange(bs.bondMapVertexOffsetStart, bs.bondMapVertexOffsetEnd);
            //bs.bondMapBuilder.endElement();
        }

        static async build(model: Core.Structure.Molecule.Model,
            parameters: Parameters,
            atomIndices: number[],
            ctx: Core.Computation.Context) {

            await ctx.updateProgress('Creating atoms...');
            let state = new BuildState(model, atomIndices, <Parameters>Core.Utils.extend({}, parameters, DefaultBallsAndSticksModelParameters))

            await BallsAndSticksGeometryBuilder.addAtoms(state, ctx);
            await BallsAndSticksGeometryBuilder.addBonds(state, ctx);

            await ctx.updateProgress('Finalizing...');

            let ret = new BallsAndSticksGeometry();
            if (state.bs) {
                let geometry = BallsAndSticksGeometryBuilder.getBondsGeometry(state.bs);
                ret.bondsGeometry = geometry.bondsGeometry;
                //ret.bondVertexMap = geometry.bondVertexMap;
            } else {
                let geometry = BallsAndSticksGeometryBuilder.getEmptyBondsGeometry();
                ret.bondsGeometry = geometry.bondsGeometry;
                //ret.bondVertexMap = geometry.bondVertexMap;
            }

            let atomGeometry = BallsAndSticksGeometryBuilder.getAtomsGeometry(state);

            ret.vertexStateBuffer = atomGeometry.vertexStateBuffer;
            ret.atomsGeometry = atomGeometry.atomsGeometry;
            ret.pickGeometry = atomGeometry.atomsPickGeometry;
            ret.atomVertexMap = atomGeometry.atomVertexMap;

            return ret;
        }
    }

    export function buildGeometry(model: Core.Structure.Molecule.Model, parameters: Parameters,
        atomIndices: number[], ctx: Core.Computation.Context): LiteMol.Promise<BallsAndSticksGeometry> {
        return BallsAndSticksGeometryBuilder.build(model, parameters, atomIndices, ctx);
    }

    export class BallsAndSticksGeometry extends GeometryBase {

        atomsGeometry: THREE.BufferGeometry = <any>void 0;
        bondsGeometry: THREE.BufferGeometry = <any>void 0;
        pickGeometry: THREE.BufferGeometry = <any>void 0;
        atomVertexMap: Selection.VertexMap = <any>void 0;
        //bondVertexMap: Selection.VertexMap = <any>void 0;
        vertexStateBuffer: THREE.BufferAttribute = <any>void 0;

        dispose() {
            this.atomsGeometry.dispose();
            this.bondsGeometry.dispose();
            this.pickGeometry.dispose();
        }
    }
}