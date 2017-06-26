/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.BallsAndSticks {
    "use strict";

    const enum Constants {
        MetalDashSize = 0.15
    }

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

            const metalDashFactor = 1 / (2 * Constants.MetalDashSize);

            let covalentStickCount = 0, metallicStickCount = 0;
            let { type, count, atomAIndex, atomBIndex } = bonds;
            let { x, y, z } = model.positions;
            for (let i = 0; i < count; i++) {
                const t = type[i];
                if (t === 0) covalentStickCount += 1;
                else if (t >= 1 && t <= 4) covalentStickCount += t;
                else if (t === 5) {
                    const a = atomAIndex[i], b = atomBIndex[i];
                    const dx = x[a] - x[b], dy = y[a] - y[b], dz = z[a] - z[b];
                    const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    metallicStickCount += Math.ceil(metalDashFactor * len);
                }
            }

            return {
                bonds,
                covalentStickCount,
                metallicStickCount
            }
        }
    }

    import BT = Core.Structure.BondType
    import Geom = Core.Geometry
    import Vec3 = Geom.LinearAlgebra.Vector3
    import Mat4 = Geom.LinearAlgebra.Matrix4
    import GB = Utils.GeometryBuilder

    class BondModelState {
        rotationAxis = Vec3.zero();
        bondUpVector = Vec3.fromValues(1, 0, 0);
        dashUpVector = Vec3.fromValues(1, 0, 0);
        dir = Vec3.zero();

        scale = Vec3.zero();
        translation = Vec3.zero();
        rotation = Mat4.zero();
        
        radius = 0.15;
        offset =  Vec3.zero();
        a = Vec3.zero();
        b = Vec3.zero();

        constructor(
            public bondTemplate: Geom.Surface,
            public cubeTemplate: Geom.Surface,
            public builder: GB) {
        }

    }

    namespace Templates {
        const bondCache: {[t: number]: Core.Geometry.Surface} = {};
        export function getBond(tessalation: number) {
            if (bondCache[tessalation]) return bondCache[tessalation];
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

            const geom = new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)) as any, 2, 1.0, detail);
            const ret = GeometryHelper.toSurface(geom);
            bondCache[tessalation] = ret;
            return ret;
        }

        const atomCache: {[t: number]: Core.Geometry.Surface} = {};
        export function getAtom(tessalation: number) {
            if (atomCache[tessalation]) return atomCache[tessalation];
            let base: any, radius = 1;
            switch (tessalation) {
                case 0: base = new THREE.OctahedronGeometry(radius, 0); break;
                case 1: base = new THREE.OctahedronGeometry(radius, 1); break;
                case 2: base = new THREE.IcosahedronGeometry(radius, 0); break;
                case 3: base = new THREE.IcosahedronGeometry(radius, 1); break;
                case 4: base = new THREE.IcosahedronGeometry(radius, 2); break;
                case 5: base = new THREE.OctahedronGeometry(radius, 3); break;
                default: base = new THREE.IcosahedronGeometry(radius, 3); break;
            }
            const ret = GeometryHelper.toSurface(base);
            atomCache[tessalation] = ret;
            return ret;
        }

        let dash: Core.Geometry.Surface | undefined = void 0;
        export function getDash() {
            if (dash) return dash;
            dash = GeometryHelper.toSurface(new THREE.BoxGeometry(1, 1, 1));
            for (let i = 0; i < dash.vertices.length; i += 3) {
                dash.vertices[i] += 0.5;
            }
            return dash;
        }
    }

    class BuildState {
        tessalation = this.params.tessalation;
        atomRadius = this.params.atomRadius;
        bondRadius = this.params.bondRadius;
        hideBonds = this.params.hideBonds;

        bondTemplate = Templates.getBond(this.tessalation!);
        atomTemplate = Templates.getAtom(this.tessalation!);
        dashTemplate = Templates.getDash();

        atomVertexCount = this.atomTemplate.vertexCount * this.atomIndices.length;
        atomTriangleCount = this.atomTemplate.triangleCount * this.atomIndices.length;
        atomBuilder = Utils.GeometryBuilder.create(this.atomVertexCount, this.atomTriangleCount);
        atomColors = new Float32Array(this.atomVertexCount * 3);
        atomPickColors = new Float32Array(this.atomVertexCount * 4);

        atoms = this.model.data.atoms;
        positions = this.model.positions;
        cX = this.positions.x; cY = this.positions.y; cZ = this.positions.z;
        atomSymbols = this.atoms.elementSymbol;
        residueIndex = this.atoms.residueIndex;

        scale = Vec3.zero();
        translation = Vec3.zero();
        
        pickColor = { r: 0.1, g: 0.1, b: 0.1 };
        pickOffset = 0;

        atomMapBuilder = new Selection.VertexMapBuilder(this.atomIndices.length);
        
        bs: BondsBuildState = <any>void 0;

        constructor(public model: Core.Structure.Molecule.Model, public atomIndices: number[], public params: Parameters) {

        }
    }

    class BondsBuildState {
        model = this.state.model;
        atomIndices = this.state.atomIndices;
        info = BallsAndSticksHelper.analyze(this.state.model, this.state.atomIndices, this.state.params);

        bondVertexCount = this.state.bondTemplate.vertexCount * this.info.covalentStickCount + this.state.dashTemplate.vertexCount * this.info.metallicStickCount;
        bondTriangleCount = this.state.bondTemplate.triangleCount * this.info.covalentStickCount + this.state.dashTemplate.triangleCount * this.info.metallicStickCount;
        bondBuilder = GB.create(this.bondVertexCount, this.bondTriangleCount);
        bondColors = new Float32Array(this.bondVertexCount * 3);
        
        bondRadius = this.state.params.bondRadius;
        bondState = new BondModelState(this.state.bondTemplate, this.state.dashTemplate, this.bondBuilder);
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

            Vec3.set(state.scale, r, r, r);
            Vec3.set(state.translation, state.cX[a], state.cY[a], state.cZ[a]);

            const startVertexOffset = state.atomBuilder.vertexOffset;
            GB.add(state.atomBuilder, state.atomTemplate, state.scale, state.translation, void 0);

            Selection.Picking.assignPickColor(a, state.pickColor);

            for (let i = 0, _b = state.atomTemplate.vertexCount; i < _b; i++) {
                state.atomPickColors[state.pickOffset++] = state.pickColor.r;
                state.atomPickColors[state.pickOffset++] = state.pickColor.g;
                state.atomPickColors[state.pickOffset++] = state.pickColor.b;
                state.pickOffset++; // 4th component
            }

            state.atomMapBuilder.addVertexRange(startVertexOffset, state.atomBuilder.vertexOffset);
            state.atomMapBuilder.endElement();
        }
        
        private static addBond(b: number, state: BuildState, bs: BondsBuildState) {
            let aI = bs.info.bonds.atomAIndex[b], bI = bs.info.bonds.atomBIndex[b], type = bs.info.bonds.type[b];
            Vec3.set(bs.bondState.a, state.cX[aI], state.cY[aI], state.cZ[aI]);
            Vec3.set(bs.bondState.b, state.cX[bI], state.cY[bI], state.cZ[bI]);

            const r = +bs.bondRadius!, 
                o = 2 * r / 3,
                h = r / 2;

            const bondState = bs.bondState;
            switch (type) {
                case BT.Unknown:
                case BT.Single:
                    bondState.radius = r!;
                    bondState.offset[1] = 0.0;
                    bondState.offset[2] = 0.0;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Double:
                    bondState.radius = h;
                    bondState.offset[1] = o;
                    bondState.offset[2] = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset[1] = -o;
                    bondState.offset[2] = -o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Triple:
                    bondState.radius = h;
                    bondState.offset[1] = 0.0;
                    bondState.offset[2] = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset[1] = -Math.cos(Math.PI / 3) * o;
                    bondState.offset[2] = -Math.sin(Math.PI / 3) * o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset[1] = -bondState.offset[0];
                    //bondState.offset[1] = -0.05;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Aromatic:
                    bondState.radius = h / 2;
                    bondState.offset[1] = o;
                    bondState.offset[2] = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset[1] = -o;
                    bondState.offset[2] = -o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset[1] = -o;
                    bondState.offset[2] = o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    bondState.offset[1] = o;
                    bondState.offset[2] = -o;
                    BallsAndSticksGeometryBuilder.addBondPart(bondState);
                    break;
                case BT.Metallic:
                    bondState.radius = h;
                    BallsAndSticksGeometryBuilder.addMetalBond(bondState);
                    break;
            }
        }


        private static addBondPart(state: BondModelState) {
            const dir = Vec3.sub(state.dir, state.b, state.a);
            const length = Vec3.length(state.dir);
            const axis = Vec3.cross(state.rotationAxis, state.bondUpVector, dir);
            const angle = Vec3.angle(state.bondUpVector, state.dir);
            

            Vec3.set(state.scale, length, state.radius, state.radius);
            Mat4.fromRotation(state.rotation, angle, axis);
            
            state.offset[0] = 0;
            Vec3.transformMat4(state.offset, state.offset, state.rotation);
            Vec3.add(state.offset, state.offset, state.a);

            GB.add(state.builder, state.bondTemplate, state.scale, state.offset, state.rotation);
        }

        private static addMetalBond(state: BondModelState) {
            const dir = Vec3.sub(state.dir, state.b, state.a);
            const length = Vec3.length(state.dir);
            const axis = Vec3.cross(state.rotationAxis, state.dashUpVector, dir);
            const angle = Vec3.angle(state.dashUpVector, state.dir);

            const scale = Vec3.set(state.scale, Constants.MetalDashSize, state.radius, state.radius);
            const rotation = Mat4.fromRotation(state.rotation, angle, axis)!;
            
            const offset = state.offset;
            Vec3.copy(offset, state.a);
            Vec3.normalize(dir, dir);
            Vec3.scale(dir, dir, 2 * Constants.MetalDashSize);
            for (let t = 0; t < length; t += 2 * Constants.MetalDashSize) {
                if (t + Constants.MetalDashSize > length) scale[0] = length - t;
                GB.add(state.builder, state.cubeTemplate, scale, offset, rotation);
                Vec3.add(offset, offset, dir);
            }         
        }

        private static getEmptyBondsGeometry() {
            let bondsGeometry = new THREE.BufferGeometry();
            bondsGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            bondsGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(0), 3));
            bondsGeometry.addAttribute('index', new THREE.BufferAttribute(new Uint32Array(0), 1));
            bondsGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
            return { bondsGeometry };
        }

        private static getBondsGeometry(state: BondsBuildState) {
            let bondsGeometry = new THREE.BufferGeometry();
            bondsGeometry.addAttribute('position', new THREE.BufferAttribute(state.bondBuilder.vertices, 3));
            bondsGeometry.addAttribute('normal', new THREE.BufferAttribute(state.bondBuilder.normals, 3));
            bondsGeometry.addAttribute('index', new THREE.BufferAttribute(state.bondBuilder.indices, 1));
            bondsGeometry.addAttribute('color', new THREE.BufferAttribute(state.bondColors, 3));
            return { bondsGeometry };
        }

        private static getAtomsGeometry(state: BuildState) {
            let atomsGeometry = new THREE.BufferGeometry();
            atomsGeometry.addAttribute('position', new THREE.BufferAttribute(state.atomBuilder.vertices, 3));
            atomsGeometry.addAttribute('normal', new THREE.BufferAttribute(state.atomBuilder.normals, 3));
            atomsGeometry.addAttribute('index', new THREE.BufferAttribute(state.atomBuilder.indices, 1));
            atomsGeometry.addAttribute('color', new THREE.BufferAttribute(state.atomColors, 3));

            let stateBuffer = new Float32Array(state.atomVertexCount);
            let vertexStateBuffer = new THREE.BufferAttribute(stateBuffer, 1);
            atomsGeometry.addAttribute('vState', vertexStateBuffer);

            let atomsPickGeometry = new THREE.BufferGeometry();
            atomsPickGeometry.addAttribute('position', new THREE.BufferAttribute(state.atomBuilder.vertices, 3));
            atomsPickGeometry.addAttribute('index', new THREE.BufferAttribute(state.atomBuilder.indices, 1));
            atomsPickGeometry.addAttribute('pColor', new THREE.BufferAttribute(state.atomPickColors, 4));

            return {
                vertexStateBuffer,
                atomsGeometry,
                atomsPickGeometry,
                atomVertexMap: state.atomMapBuilder.getMap()
            };
        }

        private static async addAtoms(state: BuildState, ctx: Core.Computation.Context) {
            const chunkSize = 2500;
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
            const chunkSize = 2500;
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
            await BallsAndSticksGeometryBuilder.addBondsChunks(state, bs, ctx);
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