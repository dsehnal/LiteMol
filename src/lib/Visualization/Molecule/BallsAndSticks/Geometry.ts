/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.BallsAndSticks {
    "use strict";

    const enum Constants {
        MetalDashSize = 0.15
    }
    
    import BT = Core.Structure.BondType
    import Geom = Core.Geometry
    import Vec3 = Geom.LinearAlgebra.Vector3
    import Mat4 = Geom.LinearAlgebra.Matrix4
    import GB = Geometry.Builder

    function isHydrogen(n: string) {
        return n === 'H' || n === 'D' || n === 'T';
    }

    function getAtomCount(model: Core.Structure.Molecule.Model, atomIndices: number[], params: Parameters) {
        const { elementSymbol:es } = model.data.atoms;
        const { hideHydrogens } = params;
        
        let atomCount = 0;

        if (hideHydrogens) {
            for (const aI of atomIndices) {
                if (!isHydrogen(es[aI])) {
                    atomCount++;
                }
            }
        } else {
            atomCount = atomIndices.length;
        }

        return atomCount;
    }

    function getBondsInfo(model: Core.Structure.Molecule.Model, atomIndices: number[], params: Parameters) {            
        const bonds = Core.Structure.computeBonds(model, atomIndices, {
            maxHbondLength:params.customMaxBondLengths && params.customMaxBondLengths.has('H') ? params.customMaxBondLengths.get('H')! : 1.15
        });

        const metalDashFactor = 1 / (2 * Constants.MetalDashSize);
        const { elementSymbol:es } = model.data.atoms;
        const { hideHydrogens } = params;

        let covalentStickCount = 0, dashPartCount = 0;
        let { type, count, atomAIndex, atomBIndex } = bonds;
        let { x, y, z } = model.positions;
        for (let i = 0; i < count; i++) {
            const t = type[i];
            const a = atomAIndex[i], b = atomBIndex[i];

            if (hideHydrogens && (isHydrogen(es[a]) || isHydrogen(es[b]))) {
                continue;
            }

            if (t === BT.Unknown || t === BT.DisulfideBridge) covalentStickCount += 1;
            else if (t >= BT.Single && t <= BT.Aromatic) covalentStickCount += t;
            else if (t === BT.Metallic || t === BT.Ion || t === BT.Hydrogen) {
                const dx = x[a] - x[b], dy = y[a] - y[b], dz = z[a] - z[b];
                const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                dashPartCount += Math.ceil(metalDashFactor * len);
            }
        }

        return {
            bonds,
            covalentStickCount,
            dashPartCount
        }
    }

    class BondModelState {
        rotationAxis = Vec3.zero();
        bondUpVector = Vec3.fromValues(1, 0, 0);
        dir = Vec3.zero();

        scale = Vec3.zero();
        translation = Vec3.zero();
        rotation = Mat4.zero();
        
        offset =  Vec3.zero();
        a = Vec3.zero();
        b = Vec3.zero();

        constructor(
            public bondTemplate: Geometry.RawGeometry,
            public builder: GB) {
        }

    }

    namespace Templates {
        const bondCache: {[t: number]: Geometry.RawGeometry} = {};
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
            const ret = GeometryHelper.toRawGeometry(geom);
            bondCache[tessalation] = ret;
            return ret;
        }

        const atomCache: {[t: number]:  Geometry.RawGeometry} = {};
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
            const ret = GeometryHelper.toRawGeometry(base);
            atomCache[tessalation] = ret;
            return ret;
        }
    }

    class BuildState {
        tessalation = this.params.tessalation;
        atomRadius = this.params.atomRadius;
        bondRadius = this.params.bondRadius;
        hideBonds = this.params.hideBonds;

        bondTemplate = Templates.getBond(this.tessalation!);
        atomTemplate = Templates.getAtom(this.tessalation!);
        dashTemplate = GB.getDashTemplate();

        atomCount = getAtomCount(this.model, this.atomIndices, this.params);
        atomVertexCount = this.atomTemplate.vertexCount * this.atomCount;
        atomBuilder = GB.createStatic(this.atomVertexCount, this.atomTemplate.indexCount * this.atomCount);
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
        info = getBondsInfo(this.state.model, this.state.atomIndices, this.state.params);

        bondVertexCount = this.state.bondTemplate.vertexCount * this.info.covalentStickCount + this.state.dashTemplate.vertexCount * this.info.dashPartCount;
        bondBuilder = GB.createStatic(this.bondVertexCount, this.state.bondTemplate.indexCount * this.info.covalentStickCount + this.state.dashTemplate.indexCount * this.info.dashPartCount);
        bondColors = new Float32Array(this.bondVertexCount * 3);
        
        bondRadius = this.state.params.bondRadius;
        bondState = new BondModelState(this.state.bondTemplate, this.bondBuilder);
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

            const startVertexOffset = state.atomBuilder.vertices.elementCount; //!!!.vertexOffset;
            GB.addRawTransformed(state.atomBuilder, state.atomTemplate, state.scale, state.translation, void 0);

            Selection.Picking.assignPickColor(a, state.pickColor);

            for (let i = 0, _b = state.atomTemplate.vertexCount; i < _b; i++) {
                state.atomPickColors[state.pickOffset++] = state.pickColor.r;
                state.atomPickColors[state.pickOffset++] = state.pickColor.g;
                state.atomPickColors[state.pickOffset++] = state.pickColor.b;
                state.pickOffset++; // 4th component
            }

            state.atomMapBuilder.addVertexRange(startVertexOffset, state.atomBuilder.vertices.elementCount /*!!!.vertexOffset*/);
            state.atomMapBuilder.endElement();
        }
        
        private static addBond(b: number, state: BuildState, bs: BondsBuildState) {
            let aI = bs.info.bonds.atomAIndex[b], bI = bs.info.bonds.atomBIndex[b], type = bs.info.bonds.type[b];

            if (state.params.hideHydrogens) {
                const { elementSymbol: es } = state.model.data.atoms;
                if (isHydrogen(es[aI]) || isHydrogen(es[bI])) {
                    return;
                }
            }

            Vec3.set(bs.bondState.a, state.cX[aI], state.cY[aI], state.cZ[aI]);
            Vec3.set(bs.bondState.b, state.cX[bI], state.cY[bI], state.cZ[bI]);

            const r = +bs.bondRadius!, 
                o = 2 * r / 3,
                h = r / 2;

            const bondState = bs.bondState;
            switch (type) {
                case BT.Unknown:
                case BT.Single:
                case BT.DisulfideBridge:
                    BallsAndSticksGeometryBuilder.addBondPart(r, 0, 0, bondState);
                    break;
                case BT.Double:
                    BallsAndSticksGeometryBuilder.addBondPart(h, o, o, bondState);
                    BallsAndSticksGeometryBuilder.addBondPart(h, -o, -o, bondState);
                    break;
                case BT.Triple:
                    BallsAndSticksGeometryBuilder.addBondPart(h, 0, o, bondState);
                    const c = Math.cos(Math.PI / 3) * o, s = Math.sin(Math.PI / 3) * o
                    BallsAndSticksGeometryBuilder.addBondPart(h, -c,  -s,  bondState);
                    BallsAndSticksGeometryBuilder.addBondPart(h, -c, s, bondState);
                    break;
                case BT.Aromatic:
                    BallsAndSticksGeometryBuilder.addBondPart(h / 2, o, o, bondState);
                    BallsAndSticksGeometryBuilder.addBondPart(h / 2, -o, -o, bondState);
                    BallsAndSticksGeometryBuilder.addBondPart(h / 2, -o, o, bondState);
                    BallsAndSticksGeometryBuilder.addBondPart(h / 2, o, -o, bondState);
                    break;
                case BT.Metallic:
                case BT.Ion:
                case BT.Hydrogen:
                    BallsAndSticksGeometryBuilder.addDashedBond(h, bondState);
                    break;
            }
        }

        private static addBondPart(r: number, oX: number, oY: number, state: BondModelState) {
            const dir = Vec3.sub(state.dir, state.b, state.a);
            const length = Vec3.magnitude(state.dir);
            
            Vec3.set(state.scale, length, r, r);
            Vec3.makeRotation(state.rotation, state.bondUpVector, dir);
            
            state.offset[0] = 0;
            state.offset[1] = oX;
            state.offset[2] = oY;
            Vec3.transformMat4(state.offset, state.offset, state.rotation);
            Vec3.add(state.offset, state.offset, state.a);

            GB.addRawTransformed(state.builder, state.bondTemplate, state.scale, state.offset, state.rotation);
        }

        private static addDashedBond(r: number, state: BondModelState) {
            GB.addDashedLine(state.builder, state.a, state.b, Constants.MetalDashSize, Constants.MetalDashSize, r);    
        }

        private static getEmptyBondsGeometry() {
            let bondsGeometry = new THREE.BufferGeometry();
            bondsGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            bondsGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(0), 3));
            bondsGeometry.addAttribute('index', new THREE.BufferAttribute(new Uint32Array(0), 1));
            bondsGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
            return bondsGeometry;
        }

        private static getBondsGeometry(state: BondsBuildState) {
            const geom = GB.toBufferGeometry(state.bondBuilder);
            Geometry.addAttribute(geom, 'color', state.bondColors, 3);
            return geom;
        }

        private static getAtomsGeometry(state: BuildState) {
            const atomsGeometry = GB.toBufferGeometry(state.atomBuilder);
            Geometry.addAttribute(atomsGeometry, 'color', state.atomColors, 3);

            const stateBuffer = new Float32Array(state.atomVertexCount);
            const vertexStateBuffer = new THREE.BufferAttribute(stateBuffer, 1);
            atomsGeometry.addAttribute('vState', vertexStateBuffer);

            const atomsPickGeometry = new THREE.BufferGeometry();
            atomsPickGeometry.addAttribute('position', atomsGeometry.getAttribute('position'));
            atomsPickGeometry.addAttribute('index', atomsGeometry.getAttribute('index'));
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

            const { elementSymbol } = state.model.data.atoms;
            const { hideHydrogens } = state.params;

            for (let start = 0, _l = state.atomIndices.length; start < _l; start += chunkSize) {
                for (let i = start, _b = Math.min(start + chunkSize, state.atomIndices.length); i < _b; i++) {
                    const aI = state.atomIndices[i];
                    if (hideHydrogens && isHydrogen(elementSymbol[aI])) {
                        continue;
                    }
                    BallsAndSticksGeometryBuilder.addAtom(aI, state);
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
                ret.bondsGeometry = BallsAndSticksGeometryBuilder.getBondsGeometry(state.bs);
            } else {
                ret.bondsGeometry = BallsAndSticksGeometryBuilder.getEmptyBondsGeometry();
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
        atomIndices: number[], ctx: Core.Computation.Context): Promise<BallsAndSticksGeometry> {
        return BallsAndSticksGeometryBuilder.build(model, parameters, atomIndices, ctx);
    }

    export class BallsAndSticksGeometry extends GeometryBase {
        atomsGeometry: THREE.BufferGeometry = <any>void 0;
        bondsGeometry: THREE.BufferGeometry = <any>void 0;
        pickGeometry: THREE.BufferGeometry = <any>void 0;
        atomVertexMap: Selection.VertexMap = <any>void 0;
        vertexStateBuffer: THREE.BufferAttribute = <any>void 0;

        dispose() {
            this.atomsGeometry.dispose();
            this.bondsGeometry.dispose();
            this.pickGeometry.dispose();
        }
    }
}