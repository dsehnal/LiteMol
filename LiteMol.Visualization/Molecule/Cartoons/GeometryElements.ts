/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {

    import SSTypes = Core.Structure.SecondaryStructureType;
    
    export class CartoonAsymUnitState {
        
        private typeBuilder = Core.Utils.ArrayBuilder.forArray<Core.Structure.SecondaryStructureType>(10000);
        private uPositionsBuilder: Core.Utils.ArrayBuilder<number>;
        private vPositionsBuilder: Core.Utils.ArrayBuilder<number>;
        private pPositionsBuilder: Core.Utils.ArrayBuilder<number>;
        private dPositionsBuilder: Core.Utils.ArrayBuilder<number>;

        residueType: Core.Structure.SecondaryStructureType[] = [];
        uPositions: number[] = <any>new Float32Array(0);
        vPositions: number[] = <any>new Float32Array(0);
        pPositions: number[] = <any>new Float32Array(0);
        dPositions: number[] = <any>new Float32Array(0);
        uvLength = 0;
        residueCount = 0;
        
        constructor(residueCount: number) {

            this.typeBuilder = Core.Utils.ArrayBuilder.forArray<Core.Structure.SecondaryStructureType>(residueCount + 4);
            this.uPositionsBuilder = Core.Utils.ArrayBuilder.forVertex3D(residueCount + 4);
            this.vPositionsBuilder = Core.Utils.ArrayBuilder.forVertex3D(residueCount + 4);
            this.pPositionsBuilder = Core.Utils.ArrayBuilder.forVertex3D(residueCount + 4);
            this.dPositionsBuilder = Core.Utils.ArrayBuilder.forVertex3D(residueCount + 4);


            this.typeBuilder.add(Core.Structure.SecondaryStructureType.None); this.typeBuilder.add(Core.Structure.SecondaryStructureType.None);
            this.uPositionsBuilder.add3(0, 0, 0); this.uPositionsBuilder.add3(0, 0, 0);
            this.vPositionsBuilder.add3(0, 0, 0); this.vPositionsBuilder.add3(0, 0, 0);
        }
        
        addResidue(rIndex: number, arrays: { atomStartIndex: number[]; atomEndIndex: number[]; name: string[]; x: number[]; y: number[]; z: number[] }, sType: Core.Structure.SecondaryStructureType) {
            let start = arrays.atomStartIndex[rIndex], end = arrays.atomEndIndex[rIndex],
                aU = false, aV = false;
                
            let name = arrays.name;    
            
            if (sType !== Core.Structure.SecondaryStructureType.Strand) {
                for (let i = start; i < end; i++) {
                    if (!aU && name[i] === "CA") {
                        this.uPositionsBuilder.add3(arrays.x[i], arrays.y[i], arrays.z[i]);
                        aU = true;
                    } else if (!aV && name[i] === "O") {
                        this.vPositionsBuilder.add3(arrays.x[i], arrays.y[i], arrays.z[i]);
                        aV = true;
                    }

                    if (aU && aV) break;
                }
            } else {
                for (let i = start; i < end; i++) {
                    if (!aU && name[i] === "O5'") {
                        this.uPositionsBuilder.add3(arrays.x[i], arrays.y[i], arrays.z[i]);
                        aU = true;
                    } else if (!aV && name[i] === "C3'") {
                        this.vPositionsBuilder.add3(arrays.x[i], arrays.y[i], arrays.z[i]);
                        aV = true;
                    }

                    if (aU && aV) break;
                }
            }

            if (!aV) {
                let arr = this.pPositionsBuilder.array, len = arr.length;
                this.vPositionsBuilder.add3(arr[len - 3], arr[len - 2], arr[len - 1]);
            }

            this.typeBuilder.add(sType);            
        }

        finishResidues() {
            this.typeBuilder.add(Core.Structure.SecondaryStructureType.None); this.typeBuilder.add(Core.Structure.SecondaryStructureType.None);
            this.uPositionsBuilder.add3(0, 0, 0); this.uPositionsBuilder.add3(0, 0, 0);
            this.vPositionsBuilder.add3(0, 0, 0); this.vPositionsBuilder.add3(0, 0, 0);

            this.residueType = this.typeBuilder.array;
            this.uPositions = this.uPositionsBuilder.array;
            this.vPositions = this.vPositionsBuilder.array;

            this.typeBuilder = null;
            this.uPositionsBuilder = null;
            this.vPositionsBuilder = null;

            this.uvLength = this.residueType.length;
            this.residueCount = this.uvLength - 4;
        }
        
        addControlPoint(p: THREE.Vector3, d: THREE.Vector3) {
            this.pPositionsBuilder.add3(p.x, p.y, p.z);
            this.dPositionsBuilder.add3(d.x, d.y, d.z);
        }

        finishContols() {

            this.pPositions = this.pPositionsBuilder.array;
            this.dPositions = this.dPositionsBuilder.array;
            
            this.pPositionsBuilder = null;
            this.dPositionsBuilder = null; 

        }
    }

    export class CartoonAsymUnit {


        private static maskSplit(
            element: Core.Structure.SecondaryStructureElement, 
            mask: boolean[], 
            target: Core.Structure.SecondaryStructureElement[]) {
            let current = element,
                start = element.startResidueIndex,
                end = element.endResidueIndex;

            for (let i = start; i < end; i++) {

                if (!mask[i]) continue;

                if (current.startResidueIndex !== i) {
                    current = new Core.Structure.SecondaryStructureElement(element.type, element.startResidueId, element.endResidueId);
                    current.startResidueIndex = i;
                }
                
                while (i < end && mask[i]) { i++; }
                
                current.endResidueIndex = i;
                target[target.length] = current;                 
            }
        }
        
        static hasNames(atomIndices: number[], start: number, end: number, name: string[], a: string, b: string, isAmk: boolean) {
            let aU = false, aV = false;            
            for (let i = start; i < end; i++) {
                if (!aU && name[atomIndices[i]] === a) {  aU = true;
                } else if (!aV && name[atomIndices[i]] === b) { aV = true; }
                if (aU && aV) return true;
            }            
            return isAmk && aU;
        }
                
        static createMask(
            model: Core.Structure.MoleculeModel,
            atomIndices: number[]): boolean[] {
                
            let ret = new Uint8Array(model.residues.count);
            let { residueIndex, name } = model.atoms;
            let ssIndex = model.residues.secondaryStructureIndex;
            let ss = model.secondaryStructure;
                       
            for (let i = 0, _b = atomIndices.length - 1; i < _b; i++) {                
                let aI = atomIndices[i];                
                let rStart = i;
                let residue = residueIndex[aI];
                i++;
                while (residue === residueIndex[atomIndices[i]]) i++;                
                let s = ss[ssIndex[residue]].type;                
                if (s === SSTypes.None) continue;
                if (s === SSTypes.Strand) {
                    ret[residue] = +CartoonAsymUnit.hasNames(atomIndices, rStart, i, name, "O5'", "C3'", false);
                } else {
                    ret[residue] = +CartoonAsymUnit.hasNames(atomIndices, rStart, i, name, "CA", "O", true);
                }            
                i--;    
            }
            
            
            return <any>ret;   
        }
        
        private static throwIfEmpty(ss: any[]) {
            if (ss.length === 0) {
                throw `Cartoons cannot be constructred from this model/selection.`;
            }
        }
        
        static buildUnits(
            model: Core.Structure.MoleculeModel,
            atomIndices: number[],
            linearSegmentCount: number): CartoonAsymUnit[]{

            let mask = CartoonAsymUnit.createMask(model, atomIndices);
            let ss: Core.Structure.SecondaryStructureElement[] = [];

            for (let e of model.secondaryStructure) {
                CartoonAsymUnit.maskSplit(e, mask, ss);
            }
                        
            CartoonAsymUnit.throwIfEmpty(ss);
            
            let previous = ss[0],
                asymId = model.residues.asymId,
                authSeqNumber = model.residues.authSeqNumber,
                currentElements: Core.Structure.SecondaryStructureElement[] = [],
                units: CartoonAsymUnit[] = [],
                none = Core.Structure.SecondaryStructureType.None;
            
            if (previous.type === none) {
                previous = null;
            }

            for (let e of ss) {

                if (e.type === none) {
                    if (currentElements.length > 0) {
                        units.push(new CartoonAsymUnit(model, currentElements, linearSegmentCount));
                    }

                    previous = null;
                    currentElements = [];
                } else {                    
                    if (previous === null) previous = e;
                                        
                    if (asymId[previous.endResidueIndex - 1] !== asymId[e.startResidueIndex]
                        || (previous !== e && authSeqNumber[e.startResidueIndex] - authSeqNumber[previous.endResidueIndex - 1] > 1)
                        || (previous.startResidueIndex !== e.startResidueIndex && (e.startResidueIndex - previous.endResidueIndex > 0))) {
                        
                        if (currentElements.length > 0) {
                            units.push(new CartoonAsymUnit(model, currentElements, linearSegmentCount));
                        } else if (previous !== null) {
                            units.push(new CartoonAsymUnit(model, [previous], linearSegmentCount));
                        }

                        previous = null;
                        currentElements = [e];
                    } else {
                        currentElements[currentElements.length] = e;
                    }
                }
                previous = e;

            }

            if (currentElements.length > 0) {
                units.push(new CartoonAsymUnit(model, currentElements, linearSegmentCount));
            }
                        
            return units; // [units[units.length - 1]];
        }
        
        private controlPointsBuilder: Core.Utils.ArrayBuilder<number>;
        private torsionVectorsBuilder: Core.Utils.ArrayBuilder<number>;
        private normalVectorsBuilder: Core.Utils.ArrayBuilder<number>;

        private tempA = new THREE.Vector3();
        private tempB = new THREE.Vector3();
        private tempC = new THREE.Vector3();


        controlPoints:number[] = <any>new Float32Array(0);
        torsionVectors: number[] = <any>new Float32Array(0);
        normalVectors: number[] = <any>new Float32Array(0);

        residueCount = 0;
        structureStarts = new Set<number>();
        structureEnds = new Set<number>();

        residueType: Core.Structure.SecondaryStructureType[] = [];
        residueIndex: Int32Array = new Int32Array(0);
        
        constructor(
            private model: Core.Structure.MoleculeModel,
            private elements: Core.Structure.SecondaryStructureElement[],
            public linearSegmentCount: number) {


            for (let e of this.elements) {
                this.residueCount += e.endResidueIndex - e.startResidueIndex;
            }


            let state = new CartoonAsymUnitState(this.residueCount);

            this.controlPointsBuilder = Core.Utils.ArrayBuilder.forVertex3D(this.residueCount * this.linearSegmentCount + 1);
            this.torsionVectorsBuilder = Core.Utils.ArrayBuilder.forVertex3D(this.residueCount * this.linearSegmentCount + 1);
            this.normalVectorsBuilder = Core.Utils.ArrayBuilder.forVertex3D(this.residueCount * this.linearSegmentCount + 1);

            this.createControlPoints(state);
        }

        private createControlPoints(state: CartoonAsymUnitState) {
            
            this.initPositions(state);
            this.initControlsPoints(state);
            this.computeSplines(state);

            this.controlPoints = this.controlPointsBuilder.array;
            this.torsionVectors = this.torsionVectorsBuilder.array;
            this.normalVectors = this.normalVectorsBuilder.array;

            this.controlPointsBuilder = null;
            this.torsionVectorsBuilder = null;
            this.normalVectorsBuilder = null;
        }

        private initPositions(state: CartoonAsymUnitState) {
            let residues = this.model.residues,
                atoms = this.model.atoms,
                arrays = { atomStartIndex: residues.atomStartIndex, atomEndIndex: residues.atomEndIndex, name: atoms.name, x: atoms.x, y: atoms.y, z: atoms.z },
                residueType: Core.Structure.SecondaryStructureType[] = [],
                offset = 0,
                i = 0;
                            
            for (let e of this.elements) {
                this.structureStarts.add(e.startResidueIndex);
                this.structureEnds.add(e.endResidueIndex - 1);
                for (i = e.startResidueIndex; i < e.endResidueIndex; i++) {
                    state.addResidue(i, arrays, e.type);
                    residueType[residueType.length] = e.type;
                }
            }

            this.residueIndex = new Int32Array(this.residueCount);

            for (let e of this.elements) {
                for (i = e.startResidueIndex; i < e.endResidueIndex; i++) {
                    this.residueIndex[offset++] = i;
                }
            }
            
            this.residueType = residueType;
            
            state.finishResidues();


            let len = this.residueCount;
            
            state.residueType[0] = state.residueType[2];
            state.residueType[1] = state.residueType[3];
            state.residueType[state.residueType.length - 2] = state.residueType[state.residueType.length - 4];
            state.residueType[state.residueType.length - 1] = state.residueType[state.residueType.length - 3];
            
            if (len > 2) {

                let a = 2, b = 3, c = 4;

                if (state.residueType[0] !== Core.Structure.SecondaryStructureType.Strand) {
                    this.reflectPositions(state.uPositions, 0, 1, a, b, b, c, 0.4, 0.6);
                    this.reflectPositions(state.vPositions, 0, 1, a, b, b, c, 0.4, 0.6);
                } else {
                    this.reflectPositions(state.uPositions, 1, 0, a, b, b, c, 0.5, 0.5);
                    this.reflectPositions(state.vPositions, 1, 0, a, b, b, c, 0.5, 0.5);
                }

                a = len + 1; b = len; c = len - 1;
                if (state.residueType[len - 1] !== Core.Structure.SecondaryStructureType.Strand) {
                    this.reflectPositions(state.uPositions, len + 2, len + 3, a, b, b, c, 0.4, 0.6);
                    this.reflectPositions(state.vPositions, len + 2, len + 3, a, b, b, c, 0.4, 0.6);
                } else {
                    this.reflectPositions(state.uPositions, len + 2, len + 3, a, b, b, c, 0.5, 0.5);
                    this.reflectPositions(state.vPositions, len + 2, len + 3, a, b, b, c, 0.5, 0.5);
                }
            } else if (len === 2) {
                for (i = 0; i < 2; i++) {
                    state.uPositions[3 * i] = state.uPositions[6];
                    state.uPositions[3 * i + 1] = state.uPositions[7];
                    state.uPositions[3 * i + 2] = state.uPositions[8];

                    state.vPositions[3 * i] = state.vPositions[6];
                    state.vPositions[3 * i + 1] = state.vPositions[7];
                    state.vPositions[3 * i + 2] = state.vPositions[8];

                    state.uPositions[(len + 2) * 3 + 3 * i] = state.uPositions[(len + 1) * 3];
                    state.uPositions[(len + 2) * 3 + 3 * i + 1] = state.uPositions[(len + 1) * 3 + 1];
                    state.uPositions[(len + 2) * 3 + 3 * i + 2] = state.uPositions[(len + 1) * 3 + 2];

                    state.vPositions[(len + 2) * 3 + 3 * i] = state.vPositions[(len + 1) * 3];
                    state.vPositions[(len + 2) * 3 + 3 * i + 1] = state.vPositions[(len + 1) * 3 + 1];
                    state.vPositions[(len + 2) * 3 + 3 * i + 2] = state.vPositions[(len + 1) * 3 + 2];
                }
            } else {
                let d = [state.uPositions[6] - state.vPositions[6],
                         state.uPositions[7] - state.vPositions[7],
                         state.uPositions[8] - state.vPositions[8]];
                
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 3; j++) {
                        state.uPositions[3 * i + j] = state.uPositions[6 + j] - 0.5 * (i + 1) * d[j];
                        state.uPositions[9 + 3 * i + j] = state.uPositions[6 + j] + 0.5 * (i + 1) * d[j];
                        
                        state.vPositions[3 * i + j] = state.vPositions[6 + j] + 0.5 * (i + 1) * d[j];
                        state.vPositions[9 + 3 * i + j] = state.vPositions[6 + j] - 0.5 * (i + 1) * d[j];      
                    }
                }
                    
                //state.uPositions[0] = state.uPositions[6] - dx;
                //state.uPositions[9] = state.uPositions[6] - dx;                
                //console.log(state.uPositions, state.vPositions);
            }
        }

        private initControlsPoints(state: CartoonAsymUnitState) {
            let previousD = new THREE.Vector3(),
                len = state.uvLength - 1,
                a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3(),
                ca1 = new THREE.Vector3(), o1 = new THREE.Vector3(), ca2 = new THREE.Vector3(), p = new THREE.Vector3(),
                helixType = Core.Structure.SecondaryStructureType.Helix;

            for (let i = 0; i < len; i++) {

                ca1.set(state.uPositions[3 * i], state.uPositions[3 * i + 1], state.uPositions[3 * i + 2]);
                o1.set(state.vPositions[3 * i], state.vPositions[3 * i + 1], state.vPositions[3 * i + 2]);
                i++;
                ca2.set(state.uPositions[3 * i], state.uPositions[3 * i + 1], state.uPositions[3 * i + 2]);
                i--;
                
                p.set((ca1.x + ca2.x) / 2, (ca1.y + ca2.y) / 2, (ca1.z + ca2.z) / 2);

                a.subVectors(ca2, ca1);
                b.subVectors(o1, ca1);

                c.crossVectors(a, b);
                d.crossVectors(c, a);
                c.normalize();
                d.normalize();

                if (state.residueType[i] === helixType && state.residueType[i + 1] === helixType) {
                    p.set(p.x + 1.5 * c.x, p.y + 1.5 * c.y, p.z + 1.5 * c.z);
                }

                if (i > 0 && d.angleTo(previousD) > Math.PI / 2) {
                    d.negate();
                }

                previousD.copy(d);

                a.addVectors(p, d);
                state.addControlPoint(p, a);
            }
            
            state.finishContols();
        }

        private computeSplines(state: CartoonAsymUnitState) {
            let previousControlPoint = new THREE.Vector3(),
                controlPoint = new THREE.Vector3(),
                torsionPoint = new THREE.Vector3(),
                len = state.residueCount,
                pPositions = state.pPositions,
                dPositions = state.dPositions,
                p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3(), p4 = new THREE.Vector3(),
                d1 = new THREE.Vector3(), d2 = new THREE.Vector3(), d3 = new THREE.Vector3(), d4 = new THREE.Vector3(),
                previousTorsionPoint = new THREE.Vector3(), extrapolatedControlPoint = new THREE.Vector3();

            for (let i = 0; i < len; i++) {

                p1.set(pPositions[3 * i], pPositions[3 * i + 1], pPositions[3 * i + 2]);                
                i++; p2.set(pPositions[3 * i], pPositions[3 * i + 1], pPositions[3 * i + 2]);
                i++; p3.set(pPositions[3 * i], pPositions[3 * i + 1], pPositions[3 * i + 2]);
                i++; p4.set(pPositions[3 * i], pPositions[3 * i + 1], pPositions[3 * i + 2]);
                i = i - 3;


                d1.set(dPositions[3 * i], dPositions[3 * i + 1], dPositions[3 * i + 2]);
                i++; d2.set(dPositions[3 * i], dPositions[3 * i + 1], dPositions[3 * i + 2]);
                i++; d3.set(dPositions[3 * i], dPositions[3 * i + 1], dPositions[3 * i + 2]);
                i++; d4.set(dPositions[3 * i], dPositions[3 * i + 1], dPositions[3 * i + 2]);
                i = i - 3;
                
                for (let j = 1; j <= this.linearSegmentCount; j++) {

                    let t = j * 1.0 / this.linearSegmentCount;

                    if (t < 0.5) {
                        CartoonAsymUnit.spline(controlPoint, p1, p2, p3, t + 0.5);
                        CartoonAsymUnit.spline(torsionPoint, d1, d2, d3, t + 0.5);
                    } else {
                        CartoonAsymUnit.spline(controlPoint, p2, p3, p4, t - 0.5);
                        CartoonAsymUnit.spline(torsionPoint, d2, d3, d4, t - 0.5);
                    }

                    if (i === 0 && j === 1) {
                        CartoonAsymUnit.spline(previousControlPoint, p1, p2, p3, 0.5);
                        CartoonAsymUnit.spline(previousTorsionPoint, d1, d2, d3, 0.5);
                        CartoonAsymUnit.reflect(extrapolatedControlPoint, previousControlPoint, controlPoint, 1);
                        this.addSplineNode(extrapolatedControlPoint, previousControlPoint, previousTorsionPoint);
                    }

                    this.addSplineNode(previousControlPoint, controlPoint, torsionPoint);
                    previousControlPoint.copy(controlPoint);
                }
            }
        }

        private addSplineNode(previousControlPoint: THREE.Vector3, controlPoint: THREE.Vector3, torsionPoint: THREE.Vector3): void {

            this.controlPointsBuilder.add3(controlPoint.x, controlPoint.y, controlPoint.z);

            let torsionVector = this.tempA.subVectors(torsionPoint, controlPoint);
            torsionVector.normalize();
            this.torsionVectorsBuilder.add3(torsionVector.x, torsionVector.y, torsionVector.z);

            let controlVector = this.tempB.subVectors(controlPoint, previousControlPoint);
            let normalVector = this.tempC.crossVectors(torsionVector, controlVector);
            normalVector.normalize();
            this.normalVectorsBuilder.add3(normalVector.x, normalVector.y, normalVector.z);
        }
        
        private reflectPositions(xs: number[], u: number, v: number, a: number, b: number, c: number, d: number, r1: number, r2: number) {

            this.tempA.set(xs[3 * a], xs[3 * a + 1], xs[3 * a + 2]);
            this.tempB.set(xs[3 * b], xs[3 * b + 1], xs[3 * b + 2]);
            CartoonAsymUnit.reflect(this.tempC, this.tempA, this.tempB, r1);
            xs[3 * u] = this.tempC.x; xs[3 * u + 1] = this.tempC.y; xs[3 * u + 2] = this.tempC.z;

            this.tempA.set(xs[3 * c], xs[3 * c + 1], xs[3 * c + 2]);
            this.tempB.set(xs[3 * d], xs[3 * d + 1], xs[3 * d + 2]);
            CartoonAsymUnit.reflect(this.tempC, this.tempA, this.tempB, r2);
            xs[3 * v] = this.tempC.x; xs[3 * v + 1] = this.tempC.y; xs[3 * v + 2] = this.tempC.z;
        }

        private static reflect(target: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, amount: number) {
            target.set(p1.x - amount * (p2.x - p1.x), p1.y - amount * (p2.y - p1.y), p1.z - amount * (p2.z - p1.z));
        }

        private static spline(target: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number) {
            let a = Math.pow(1 - t, 2) / 2;
            let c = Math.pow(t, 2) / 2;
            let b = 1 - a - c;

            let x = a * p1.x + b * p2.x + c * p3.x;
            let y = a * p1.y + b * p2.y + c * p3.y;
            let z = a * p1.z + b * p2.z + c * p3.z;

            target.set(x, y, z);
        }
    }

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

    export class CartoonsGeometryState {
        residueIndex = 0;

        verticesDone = 0;
        trianglesDone = 0;

        vertexBuffer = Core.Utils.ChunkedArrayBuilder.forVertex3D();
        normalBuffer = Core.Utils.ChunkedArrayBuilder.forVertex3D();
        indexBuffer = Core.Utils.ChunkedArrayBuilder.forIndexBuffer();
        
        translationMatrix: THREE.Matrix4 = new THREE.Matrix4();
        scaleMatrix: THREE.Matrix4 = new THREE.Matrix4();
        rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();
        invMatrix: THREE.Matrix4 = new THREE.Matrix4();

        vertexMap: Selection.VertexMapBuilder;

        addVertex(v: THREE.Vector3, n: THREE.Vector3) {
            this.vertexBuffer.add3(v.x, v.y, v.z);
            this.normalBuffer.add3(n.x, n.y, n.z);
            this.verticesDone++;
        }

        addTriangle(i: number, j: number, k: number) {

            this.indexBuffer.add3(i, j, k);
            this.trianglesDone++;
        }

        addTriangles(i: number, j: number, k: number, u: number, v: number, w: number) {
            this.indexBuffer.add3(i, j, k);
            this.indexBuffer.add3(u, v, w);
            this.trianglesDone += 2;
        }

        constructor(public params: CartoonsGeometryParams, residueCount: number) {
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

        let atoms = ctx.model.atoms, residues = ctx.model.residues;
        ctx.strandArrays = {
            startIndex: residues.atomStartIndex,
            endIndex: residues.atomEndIndex,
            x: atoms.x, y: atoms.y, z: atoms.z,
            name: atoms.name
        };
    }

    export function buildUnit(unit: CartoonAsymUnit, ctx: Context) {
        
        let state = ctx.state, params = ctx.params, atoms = ctx.model.atoms, residues = ctx.model.residues;
        let builder = ctx.builder;
        for (let index = 0, _max = unit.residueCount; index < _max; index++) {
            state.vertexMap.startElement(unit.residueIndex[index]);
            let numVertices = state.verticesDone;
            state.residueIndex = index;                                
            let start = unit.structureStarts.has(unit.residueIndex[index]);
            let end = unit.structureEnds.has(unit.residueIndex[index]);
            if (ctx.isTrace) {
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
    
    export function buildUnitsChunk(start: number, ctx: Context, done: () => void) {
        let chunkSize = 10000; // residues
       
         
        if (start >= ctx.units.length) {
            done();
            return;
        }
        
        if (ctx.computation.abortRequested) {
            ctx.computation.abort();
            return;
        }
        
        let residuesDone = 0;
        let index = start;
        
        while (residuesDone < chunkSize && index < ctx.units.length) {
            buildUnit(ctx.units[index], ctx);
            residuesDone += ctx.units[index].residueCount;
            index++;    
        }
        
        ctx.computation.update('Building units...', ctx.computation.abortRequest, start, ctx.units.length)      
        ctx.computation.schedule(() => buildUnitsChunk(index, ctx, done));
    }
    
    export function createGeometry(ctx: Context) {
        let state = ctx.state;
        
        let vertexBuffer = new Float32Array(state.vertexBuffer.compact()),
            normalBuffer = new Float32Array(state.normalBuffer.compact()),
            colorBuffer = new Float32Array(state.verticesDone * 3),
            pickColorBuffer = new Float32Array(state.verticesDone * 4),
            indexBuffer = new Uint32Array(state.indexBuffer.compact()),
            stateBuffer = new Float32Array(state.verticesDone);
        
        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3));
        geometry.addAttribute('index', new THREE.BufferAttribute(indexBuffer, 1));
        geometry.addAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

        ctx.geom.vertexStateBuffer = new THREE.BufferAttribute(stateBuffer, 1);
        geometry.addAttribute('vState', ctx.geom.vertexStateBuffer);
        ctx.geom.geometry = geometry;

        let map = ctx.geom.vertexMap,
            color = { r: 0.45, g: 0.45, b: 0.45 },
            vertexRanges = map.vertexRanges;

        for (let elementIndex of map.elementIndices) {

            let elementOffset = map.elementMap.get(elementIndex);

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
        pickGeometry.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3));
        pickGeometry.addAttribute('index', new THREE.BufferAttribute(indexBuffer, 1));
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
                i = 0, j = 0, t = 0,
                radialVector = this.tempVectors[0], normalVector = this.tempVectors[1],
                tempPos = this.tempVectors[2], a = this.tempVectors[3], b = this.tempVectors[4], u = this.tempVectors[5], v = this.tempVectors[6],
                addedTriangleCount = 0,

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
                addedTriangleCount = 0,

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
                temp = this.tempVectors[5], tempNormal = this.tempVectors[6], tA = this.tempVectors[7], tB = this.tempVectors[8],
                torsionVector = this.tempVectors[9],
                addedTriangleCount = 0,

                elementOffsetStart = state.residueIndex * element.linearSegmentCount,
                elementOffsetEnd = elementOffsetStart + element.linearSegmentCount,
                elementPoints = element.controlPoints,
                elementPointsCount = element.linearSegmentCount + 1,
                torsionVectors = element.torsionVectors,
                normalVectors = element.normalVectors,
                radialSegmentCount = state.params.radialSegmentCount,

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
                addedTriangleCount = 0,

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

            let start = arrays.startIndex[index], end = arrays.endIndex[index],
                name = arrays.name;

            for (let i = start; i < end; i++) {
                if (arrays.name[i] === "N3") {
                    target.set(arrays.x[i], arrays.y[i], arrays.z[i]);
                    break;
                } 
            }

            return target;
        }

        addStrandLine(
            element: CartoonAsymUnit, state: CartoonsGeometryState,
            template: { vertex: number[]; normal: number[]; index: number[]; geometry: THREE.BufferGeometry },
            arrays: { startIndex: number[]; endIndex: number[]; x: number[]; y: number[]; z: number[]; name: string[] },
            residueIndex: number) {

            let p = this.tempVectors[0], n = this.tempVectors[1], i: number,
                vb = template.vertex,
                nb = template.normal,
                ib = template.index,
                vertexStart = state.verticesDone,
                vertexCount = vb.length,
                triangleCount = ib.length,
                elementOffset = state.residueIndex * element.linearSegmentCount + ((0.5 * element.linearSegmentCount + 1) | 0),
                elementPoint = this.setVector(element.controlPoints, elementOffset, this.tempVectors[2]),
                nDir = this.findN3(residueIndex, arrays, this.tempVectors[3]).sub(elementPoint),
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