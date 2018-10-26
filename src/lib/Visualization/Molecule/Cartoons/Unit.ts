/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    import SSTypes = Core.Structure.SecondaryStructureType
    import ArrayBuilder = Core.Utils.ArrayBuilder

    export class CartoonAsymUnit {
        private controlPointsBuilder: ArrayBuilder<number>;
        private torsionVectorsBuilder: ArrayBuilder<number>;
        private normalVectorsBuilder: ArrayBuilder<number>;

        private tempA = new THREE.Vector3();
        private tempB = new THREE.Vector3();
        private tempC = new THREE.Vector3();

        controlPoints: number[] = <any>new Float32Array(0);
        torsionVectors: number[] = <any>new Float32Array(0);
        normalVectors: number[] = <any>new Float32Array(0);

        residueCount = 0;
        structureStarts = Core.Utils.FastSet.create();
        structureEnds = Core.Utils.FastSet.create();

        residueType: Core.Structure.SecondaryStructureType[] = [];
        residueIndex: Int32Array = new Int32Array(0);

        backboneOnly = false;

        startResidueIndex = -1;        
        endResidueIndex = -1;

        constructor(
            private model: Core.Structure.Molecule.Model,
            private elements: Core.Structure.SecondaryStructureElement[],
            public linearSegmentCount: number) {

            for (let e of this.elements) {
                this.residueCount += e.endResidueIndex - e.startResidueIndex;
            }

            this.startResidueIndex = this.elements[0].startResidueIndex;
            this.endResidueIndex = this.elements[this.elements.length - 1].endResidueIndex - 1;

            let builder = new ContolPointsBuilder(this.residueCount);

            this.controlPointsBuilder = ArrayBuilder.forVertex3D(this.residueCount * this.linearSegmentCount + 1);
            this.torsionVectorsBuilder = ArrayBuilder.forVertex3D(this.residueCount * this.linearSegmentCount + 1);
            this.normalVectorsBuilder = ArrayBuilder.forVertex3D(this.residueCount * this.linearSegmentCount + 1);

            this.createControlPoints(builder);
        }

        private createControlPoints(builder: ContolPointsBuilder) {
            this.initPositions(builder);
            this.initControlsPoints(builder);
            this.computeSplines(builder);

            this.controlPoints = this.controlPointsBuilder.array;
            this.torsionVectors = this.torsionVectorsBuilder.array;
            this.normalVectors = this.normalVectorsBuilder.array;

            this.controlPointsBuilder = <any>null;
            this.torsionVectorsBuilder = <any>null;
            this.normalVectorsBuilder = <any>null;
        }

        private initPositions(builder: ContolPointsBuilder) {
            let residues = this.model.data.residues,
                atoms = this.model.data.atoms,
                positions = this.model.positions,
                arrays = { atomStartIndex: residues.atomStartIndex, atomEndIndex: residues.atomEndIndex, name: atoms.name, x: positions.x, y: positions.y, z: positions.z },
                residueType: Core.Structure.SecondaryStructureType[] = [],
                offset = 0,
                i = 0;

            let bbOnlyCount = 0, residueCount = 0;
            for (let e of this.elements) {
                this.structureStarts.add(e.startResidueIndex);
                this.structureEnds.add(e.endResidueIndex - 1);
                for (i = e.startResidueIndex; i < e.endResidueIndex; i++) {
                    residueCount++;
                    const bbOnly = builder.addResidue(i, arrays, e.type);
                    if (bbOnly && (e.type === SSTypes.Helix || e.type === SSTypes.Sheet || e.type === SSTypes.Strand)) {
                        bbOnlyCount++;
                    }
                    residueType[residueType.length] = e.type;
                }
            }

            this.backboneOnly = bbOnlyCount > (residueCount / 4 - 1);

            this.residueIndex = new Int32Array(this.residueCount);

            for (let e of this.elements) {
                for (i = e.startResidueIndex; i < e.endResidueIndex; i++) {
                    this.residueIndex[offset++] = i;
                }
            }

            this.residueType = residueType;

            builder.finishResidues();


            let len = this.residueCount;

            builder.residueType[0] = builder.residueType[2];
            builder.residueType[1] = builder.residueType[3];
            builder.residueType[builder.residueType.length - 2] = builder.residueType[builder.residueType.length - 4];
            builder.residueType[builder.residueType.length - 1] = builder.residueType[builder.residueType.length - 3];

            if (len > 2) {

                let a = 2, b = 3, c = 4;

                if (builder.residueType[0] !== Core.Structure.SecondaryStructureType.Strand) {
                    this.reflectPositions(builder.uPositions, 0, 1, a, b, b, c, 0.4, 0.6);
                    this.reflectPositions(builder.vPositions, 0, 1, a, b, b, c, 0.4, 0.6);
                } else {
                    this.reflectPositions(builder.uPositions, 1, 0, a, b, b, c, 0.5, 0.5);
                    this.reflectPositions(builder.vPositions, 1, 0, a, b, b, c, 0.5, 0.5);
                }

                a = len + 1; b = len; c = len - 1;
                if (builder.residueType[len - 1] !== Core.Structure.SecondaryStructureType.Strand) {
                    this.reflectPositions(builder.uPositions, len + 2, len + 3, a, b, b, c, 0.4, 0.6);
                    this.reflectPositions(builder.vPositions, len + 2, len + 3, a, b, b, c, 0.4, 0.6);
                } else {
                    this.reflectPositions(builder.uPositions, len + 2, len + 3, a, b, b, c, 0.5, 0.5);
                    this.reflectPositions(builder.vPositions, len + 2, len + 3, a, b, b, c, 0.5, 0.5);
                }
            } else if (len === 2) {
                for (i = 0; i < 2; i++) {
                    builder.uPositions[3 * i] = builder.uPositions[6];
                    builder.uPositions[3 * i + 1] = builder.uPositions[7];
                    builder.uPositions[3 * i + 2] = builder.uPositions[8];

                    builder.vPositions[3 * i] = builder.vPositions[6];
                    builder.vPositions[3 * i + 1] = builder.vPositions[7];
                    builder.vPositions[3 * i + 2] = builder.vPositions[8];

                    builder.uPositions[(len + 2) * 3 + 3 * i] = builder.uPositions[(len + 1) * 3];
                    builder.uPositions[(len + 2) * 3 + 3 * i + 1] = builder.uPositions[(len + 1) * 3 + 1];
                    builder.uPositions[(len + 2) * 3 + 3 * i + 2] = builder.uPositions[(len + 1) * 3 + 2];

                    builder.vPositions[(len + 2) * 3 + 3 * i] = builder.vPositions[(len + 1) * 3];
                    builder.vPositions[(len + 2) * 3 + 3 * i + 1] = builder.vPositions[(len + 1) * 3 + 1];
                    builder.vPositions[(len + 2) * 3 + 3 * i + 2] = builder.vPositions[(len + 1) * 3 + 2];
                }
            } else {
                let d = [builder.uPositions[6] - builder.vPositions[6],
                builder.uPositions[7] - builder.vPositions[7],
                builder.uPositions[8] - builder.vPositions[8]];

                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 3; j++) {
                        builder.uPositions[3 * i + j] = builder.uPositions[6 + j] - 0.5 * (i + 1) * d[j];
                        builder.uPositions[9 + 3 * i + j] = builder.uPositions[6 + j] + 0.5 * (i + 1) * d[j];

                        builder.vPositions[3 * i + j] = builder.vPositions[6 + j] + 0.5 * (i + 1) * d[j];
                        builder.vPositions[9 + 3 * i + j] = builder.vPositions[6 + j] - 0.5 * (i + 1) * d[j];
                    }
                }

                //state.uPositions[0] = state.uPositions[6] - dx;
                //state.uPositions[9] = state.uPositions[6] - dx;                
                //console.log(state.uPositions, state.vPositions);
            }
        }

        private initControlsPoints(builder: ContolPointsBuilder) {
            let previousD = new THREE.Vector3(),
                len = builder.uvLength - 1,
                a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3(),
                ca1 = new THREE.Vector3(), o1 = new THREE.Vector3(), ca2 = new THREE.Vector3(), p = new THREE.Vector3(),
                helixType = Core.Structure.SecondaryStructureType.Helix;

            for (let i = 0; i < len; i++) {

                ca1.set(builder.uPositions[3 * i], builder.uPositions[3 * i + 1], builder.uPositions[3 * i + 2]);
                o1.set(builder.vPositions[3 * i], builder.vPositions[3 * i + 1], builder.vPositions[3 * i + 2]);
                i++;
                ca2.set(builder.uPositions[3 * i], builder.uPositions[3 * i + 1], builder.uPositions[3 * i + 2]);
                i--;

                p.set((ca1.x + ca2.x) / 2, (ca1.y + ca2.y) / 2, (ca1.z + ca2.z) / 2);

                a.subVectors(ca2, ca1);
                b.subVectors(o1, ca1);

                c.crossVectors(a, b);
                d.crossVectors(c, a);
                c.normalize();
                d.normalize();

                if (builder.residueType[i] === helixType && builder.residueType[i + 1] === helixType) {
                    p.set(p.x + 1.5 * c.x, p.y + 1.5 * c.y, p.z + 1.5 * c.z);
                }

                if (i > 0 && d.angleTo(previousD) > Math.PI / 2) {
                    d.negate();
                }

                previousD.copy(d);

                a.addVectors(p, d);
                builder.addControlPoint(p, a);
            }

            builder.finishContols();
        }

        private computeSplines(builder: ContolPointsBuilder) {
            let previousControlPoint = new THREE.Vector3(),
                controlPoint = new THREE.Vector3(),
                torsionPoint = new THREE.Vector3(),
                len = builder.residueCount,
                pPositions = builder.pPositions,
                dPositions = builder.dPositions,
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

            ArrayBuilder.add3(this.controlPointsBuilder, controlPoint.x, controlPoint.y, controlPoint.z);

            let torsionVector = this.tempA.subVectors(torsionPoint, controlPoint);
            torsionVector.normalize();
            ArrayBuilder.add3(this.torsionVectorsBuilder, torsionVector.x, torsionVector.y, torsionVector.z);

            let controlVector = this.tempB.subVectors(controlPoint, previousControlPoint);
            let normalVector = this.tempC.crossVectors(torsionVector, controlVector);
            normalVector.normalize();
            ArrayBuilder.add3(this.normalVectorsBuilder, normalVector.x, normalVector.y, normalVector.z);
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
    } 

    export namespace CartoonAsymUnit {        
        export function reflect(target: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, amount: number) {
            target.set(p1.x - amount * (p2.x - p1.x), p1.y - amount * (p2.y - p1.y), p1.z - amount * (p2.z - p1.z));
        }

        export function spline(target: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number) {
            let a = Math.pow(1 - t, 2) / 2;
            let c = Math.pow(t, 2) / 2;
            let b = 1 - a - c;

            let x = a * p1.x + b * p2.x + c * p3.x;
            let y = a * p1.y + b * p2.y + c * p3.y;
            let z = a * p1.z + b * p2.z + c * p3.z;

            target.set(x, y, z);
        }

        export function maskSplit(
            element: Core.Structure.SecondaryStructureElement,
            mask: boolean[],
            target: Core.Structure.SecondaryStructureElement[]) {
            let current = new Core.Structure.SecondaryStructureElement(element.type, element.startResidueId, element.endResidueId),
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

        export function isCartoonLike(atomIndices: number[], start: number, end: number, name: string[], a: string, b: string, isAmk: boolean) {
            let aU = false, aV = false, hasP = false;
            for (let i = start; i < end; i++) {
                let n = name[atomIndices[i]];
                if (!aU && n === a) {
                    aU = true;
                } else if (!aV && n === b) { 
                    aV = true; 
                }                
                if (aU && aV) return true;
                if (n === 'P') {
                    hasP = true;
                }
            }
            if (isAmk) return aU;
            return hasP;
        }

        export function createMask(model: Core.Structure.Molecule.Model, atomIndices: number[]): boolean[] {
            let ret = new Uint8Array(model.data.residues.count);
            let { residueIndex, name } = model.data.atoms;
            let ssIndex = model.data.residues.secondaryStructureIndex;
            let ss = model.data.secondaryStructure;

            for (let i = 0, _b = atomIndices.length - 1; i < _b; i++) {
                let aI = atomIndices[i];
                let rStart = i;
                let residue = residueIndex[aI];
                i++;
                while (residue === residueIndex[atomIndices[i]]) i++;
                let s = ss[ssIndex[residue]].type;
                if (s === SSTypes.None) continue;
                if (s === SSTypes.Strand) {
                    ret[residue] = +CartoonAsymUnit.isCartoonLike(atomIndices, rStart, i, name, "O5'", "C3'", false);
                } else {
                    ret[residue] = +CartoonAsymUnit.isCartoonLike(atomIndices, rStart, i, name, "CA", "O", true);
                }
                i--;
            }

            return <any>ret;
        }

        function isUnknownSecondaryStructure(model: Core.Structure.Molecule.Model) {
            let hasSeq = false;
            for (let e of model.data.secondaryStructure) {
                if (e.type === Core.Structure.SecondaryStructureType.Helix
                    || e.type === Core.Structure.SecondaryStructureType.Sheet
                    || e.type === Core.Structure.SecondaryStructureType.Turn) {
                    return false;
                }
                if (e.type === Core.Structure.SecondaryStructureType.AminoSeq) {
                    hasSeq = true;
                }
            }
            return hasSeq;
        }

        function approximateSecondaryStructure(model: Core.Structure.Molecule.Model, parent: Core.Structure.SecondaryStructureElement) {
            if (parent.type !== Core.Structure.SecondaryStructureType.AminoSeq) return [parent];

            let elements: Core.Structure.SecondaryStructureElement[] = [];

            let { name } = model.data.atoms;
            let { atomStartIndex, atomEndIndex } = model.data.residues;

            let trace = new Int32Array(parent.endResidueIndex - parent.startResidueIndex), offset = 0;
            let isOk = true;
            for (let i = parent.startResidueIndex, _b = parent.endResidueIndex; i < _b; i++) {
                let foundCA = false, foundO = false;
                for (let j = atomStartIndex[i], _c = atomEndIndex[i]; j < _c; j++) {
                    if (name[j] === 'CA') {
                        if (!foundCA) trace[offset++] = j;
                        foundCA = true;
                    } else if (name[j] === 'O') {
                        foundO = true;
                    }
                    
                    if (foundO && foundCA) break;
                }
                if (!foundCA || !foundO) {
                    isOk = false;
                    break;
                }
            }
            if (!isOk) return [parent];

            zhangSkolnickSStrace(model, trace, parent, elements);
            return elements;
        }

        const ZhangHelixDistance = [5.45, 5.18, 6.37];
        const ZhangHelixDelta = 2.1;
        const ZhangSheetDistance = [6.1, 10.4, 13.0];
        const ZhangSheetDelta = 1.42;
        const ZhangP1 = new THREE.Vector3(0, 0, 0);
        const ZhangP2 = new THREE.Vector3(0, 0, 0);

        function zhangSkolnickSStrace(
            model: Core.Structure.Molecule.Model, 
            trace: Int32Array, 
            parent: Core.Structure.SecondaryStructureElement,
            elements: Core.Structure.SecondaryStructureElement[]) {

            let mask = new Int32Array(trace.length);
            let hasSS = false;
            let { residueIndex } = model.data.atoms;

            for (let i = 0, _l = trace.length; i < _l; i++) {
                if (zhangSkolnickSSresidue(model, trace, i, ZhangHelixDistance, ZhangHelixDelta)) {
                    mask[i] = Core.Structure.SecondaryStructureType.Helix;
                    hasSS = true;
                } else if (zhangSkolnickSSresidue(model, trace, i, ZhangSheetDistance, ZhangSheetDelta)) {
                    mask[i] = Core.Structure.SecondaryStructureType.Sheet;
                    hasSS = true;
                } else {
                    mask[i] = parent.type;
                }
            }

            if (!hasSS) {
                elements.push(parent);
                return;
            }

            // filter 1-length elements
            for (let i = 0, _l = mask.length; i < _l; i++) { 
                let m = mask[i];
                if (m === parent.type) continue; 

                let j = i + 1;
                while (j < _l && m === mask[j]) {
                    j++;
                }

                if (j - i > 1) {
                    i = j - 1;
                    continue;
                }
                for (let k = i; k < j; k++) mask[k] = parent.type;
                i = j - 1; 
            }

            for (let i = 0, _l = mask.length; i < _l; i++) {
                let m = mask[i];

                let j = i + 1;
                while (j < _l && m === mask[j]) {
                    j++;
                }

                let e = new Core.Structure.SecondaryStructureElement(
                    <Core.Structure.SecondaryStructureType>m, 
                    new Core.Structure.PolyResidueIdentifier('', i, null),
                    new Core.Structure.PolyResidueIdentifier('', j, null));                    
                e.startResidueIndex = residueIndex[trace[i]];
                e.endResidueIndex = residueIndex[trace[j - 1]] + 1;
                elements.push(e);

                i = j - 1;
            }
        }

        function zhangSkolnickSSresidue(model: Core.Structure.Molecule.Model, trace: Int32Array, i: number, distances: number[], delta: number) {
            let len = trace.length;
            let { x, y, z } = model.positions;
            let u = ZhangP1, v = ZhangP2;
            for (let j = Math.max(0, i - 2); j <= i; j++) {
                for (let k = 2; k < 5; k++) {
                    if (j + k >= len) {
                        continue;
                    }
                    let a = trace[j], b = trace[j + k];
                    u.set(x[a], y[a], z[a]);
                    v.set(x[b], y[b], z[b]);
                    if (Math.abs(u.distanceTo(v) - distances[k - 2]) > delta) {
                        return false;
                    }
                }
            }
            return true;
        }

        function throwIfEmpty(ss: any[]) {
            if (ss.length === 0) {
                throw `Cartoons cannot be constructred from this model/selection.`;
            }
        }

        export function buildUnits(
            model: Core.Structure.Molecule.Model,
            atomIndices: number[],
            linearSegmentCount: number): CartoonAsymUnit[] {

            let mask = createMask(model, atomIndices);
            let ss: Core.Structure.SecondaryStructureElement[] = [];

            
            let isUnknownSS = isUnknownSecondaryStructure(model);
            
            for (let e of model.data.secondaryStructure) {
                if (isUnknownSS) {
                    let approx = approximateSecondaryStructure(model, e);
                    for (let f of approx) {
                        CartoonAsymUnit.maskSplit(f, mask, ss);    
                    }
                } else {
                    CartoonAsymUnit.maskSplit(e, mask, ss);
                }
            }
            
            throwIfEmpty(ss);

            let previous: Core.Structure.SecondaryStructureElement | null = ss[0],
                asymId = model.data.residues.asymId,
                authSeqNumber = model.data.residues.authSeqNumber,
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
    }

    class ContolPointsBuilder {
        private typeBuilder = ArrayBuilder.forArray<Core.Structure.SecondaryStructureType>(10000);
        private uPositionsBuilder: ArrayBuilder<number>;
        private vPositionsBuilder: ArrayBuilder<number>;
        private pPositionsBuilder: ArrayBuilder<number>;
        private dPositionsBuilder: ArrayBuilder<number>;

        residueType: Core.Structure.SecondaryStructureType[] = [];
        uPositions: number[] = <any>new Float32Array(0);
        vPositions: number[] = <any>new Float32Array(0);
        pPositions: number[] = <any>new Float32Array(0);
        dPositions: number[] = <any>new Float32Array(0);
        uvLength = 0;
        residueCount = 0;

        constructor(residueCount: number) {
            this.typeBuilder = ArrayBuilder.forArray<Core.Structure.SecondaryStructureType>(residueCount + 4);
            this.uPositionsBuilder = ArrayBuilder.forVertex3D(residueCount + 4);
            this.vPositionsBuilder = ArrayBuilder.forVertex3D(residueCount + 4);
            this.pPositionsBuilder = ArrayBuilder.forVertex3D(residueCount + 4);
            this.dPositionsBuilder = ArrayBuilder.forVertex3D(residueCount + 4);


            ArrayBuilder.add(this.typeBuilder, Core.Structure.SecondaryStructureType.None); ArrayBuilder.add(this.typeBuilder, Core.Structure.SecondaryStructureType.None);
            ArrayBuilder.add3(this.uPositionsBuilder, 0, 0, 0); ArrayBuilder.add3(this.uPositionsBuilder, 0, 0, 0);
            ArrayBuilder.add3(this.vPositionsBuilder, 0, 0, 0); ArrayBuilder.add3(this.vPositionsBuilder, 0, 0, 0);
        }

        addResidue(rIndex: number, arrays: { atomStartIndex: number[]; atomEndIndex: number[]; name: string[]; x: number[]; y: number[]; z: number[] }, sType: Core.Structure.SecondaryStructureType) {
            let start = arrays.atomStartIndex[rIndex], end = arrays.atomEndIndex[rIndex],
                aU = false, aV = false;

            let name = arrays.name;

            if (sType !== Core.Structure.SecondaryStructureType.Strand) {
                for (let i = start; i < end; i++) {
                    if (!aU && name[i] === "CA") {
                        ArrayBuilder.add3(this.uPositionsBuilder, arrays.x[i], arrays.y[i], arrays.z[i]);
                        aU = true;
                    } else if (!aV && name[i] === "O") {
                        ArrayBuilder.add3(this.vPositionsBuilder, arrays.x[i], arrays.y[i], arrays.z[i]);
                        aV = true;
                    }

                    if (aU && aV) break;
                }
            } else {
                if (end - start === 1) {
                    // has to be P atom
                    ArrayBuilder.add3(this.uPositionsBuilder, arrays.x[start], arrays.y[start], arrays.z[start]);
                    aU = true;
                } else {
                    let pIndex = -1;
                    for (let i = start; i < end; i++) {
                        if (!aU && name[i] === "O5'") {
                            ArrayBuilder.add3(this.uPositionsBuilder, arrays.x[i], arrays.y[i], arrays.z[i]);
                            aU = true;
                        } else if (!aV && name[i] === "C3'") {
                            ArrayBuilder.add3(this.vPositionsBuilder, arrays.x[i], arrays.y[i], arrays.z[i]);
                            aV = true;
                        }

                        if (name[i] === "P") {
                            pIndex = i;
                        }

                        if (aU && aV) break;
                    }

                    if (!aU && !aV && pIndex >= 0) {
                        ArrayBuilder.add3(this.uPositionsBuilder, arrays.x[pIndex], arrays.y[pIndex], arrays.z[pIndex]);
                        aU = true;
                    }
                }
            }

            let backboneOnly = false;
            if (!aV) {
                let arr = this.uPositionsBuilder.array, len = arr.length;
                ArrayBuilder.add3(this.vPositionsBuilder, arr[len - 3], arr[len - 2], arr[len - 1]);
                backboneOnly = true;
            } else if (!aU) {
                let arr = this.vPositionsBuilder.array, len = arr.length;
                ArrayBuilder.add3(this.uPositionsBuilder, arr[len - 3], arr[len - 2], arr[len - 1]);
                backboneOnly = true;
            }

            ArrayBuilder.add(this.typeBuilder, sType);
            return backboneOnly;
        }

        finishResidues() {
            ArrayBuilder.add(this.typeBuilder, Core.Structure.SecondaryStructureType.None); ArrayBuilder.add(this.typeBuilder, Core.Structure.SecondaryStructureType.None);
            ArrayBuilder.add3(this.uPositionsBuilder, 0, 0, 0); ArrayBuilder.add3(this.uPositionsBuilder, 0, 0, 0);
            ArrayBuilder.add3(this.vPositionsBuilder, 0, 0, 0); ArrayBuilder.add3(this.vPositionsBuilder, 0, 0, 0);

            this.residueType = this.typeBuilder.array;
            this.uPositions = this.uPositionsBuilder.array;
            this.vPositions = this.vPositionsBuilder.array;

            this.typeBuilder = <any>null;
            this.uPositionsBuilder = <any>null;
            this.vPositionsBuilder = <any>null;

            this.uvLength = this.residueType.length;
            this.residueCount = this.uvLength - 4;
        }

        addControlPoint(p: THREE.Vector3, d: THREE.Vector3) {
            ArrayBuilder.add3(this.pPositionsBuilder, p.x, p.y, p.z);
            ArrayBuilder.add3(this.dPositionsBuilder, d.x, d.y, d.z);
        }

        finishContols() {
            this.pPositions = this.pPositionsBuilder.array;
            this.dPositions = this.dPositionsBuilder.array;

            this.pPositionsBuilder = <any>null;
            this.dPositionsBuilder = <any>null;
        }
    }
}