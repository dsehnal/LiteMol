/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {
    "use strict";

    import DataTable = Utils.DataTable
    
    export interface Position {
        x: number,
        y: number,
        z: number
    }

    export interface Atom {
        id: number,
        name: string,
        authName: string,
        elementSymbol: string,
        altLoc: string | null,
        occupancy: number,
        tempFactor: number,
        residueIndex: number,
        chainIndex: number,
        entityIndex: number,
        rowIndex: number
    }

    export interface Residue {
        name: string,
        seqNumber: number,
        asymId: string,
        authName: string,
        authSeqNumber: number,
        authAsymId: string,
        insCode: string | null,
        entityId: string,

        isHet: number,

        atomStartIndex: number,
        atomEndIndex: number,

        chainIndex: number,
        entityIndex: number,

        secondaryStructureIndex: number
    }

    export interface Chain {
        asymId: string,
        authAsymId: string,
        entityId: string,

        atomStartIndex: number,
        atomEndIndex: number,
        residueStartIndex: number,
        residueEndIndex: number,

        entityIndex: number,

        // used by computed molecules (symmetry, assembly)
        sourceChainIndex: number,
        operatorIndex: number
    }

    export interface Entity {
        entityId: string,

        atomStartIndex: number,
        atomEndIndex: number,
        residueStartIndex: number,
        residueEndIndex: number,
        chainStartIndex: number,
        chainEndIndex: number,
        type: Entity.Type
    }

    export namespace Entity {
        export type Type = 'polymer' | 'non-polymer' | 'water' | 'unknown'
    }

    export interface Bond {
        atomAIndex: number,
        atomBIndex: number,
        type: BondType
    }

    
    export interface ModifiedResidue {
        asymId: string,
        seqNumber: number,
        insCode: string | null,
        parent: string,
        details: string | null
    }

    export class ComponentBondInfoEntry {
        map: Utils.FastMap<string, Utils.FastMap<string, BondType>> = Utils.FastMap.create<string, Utils.FastMap<string, BondType>>();

        add(a: string, b: string, order: BondType, swap = true) {
            let e = this.map.get(a);
            if (e !== void 0) {
                let f = e.get(b);
                if (f === void 0) {
                    e.set(b, order);
                }
            } else {
                let map = Utils.FastMap.create<string, BondType>();
                map.set(b, order);
                this.map.set(a, map);
            }

            if (swap) this.add(b, a, order, false);
        }

        constructor(public id: string) {
        }
    }

    export class ComponentBondInfo {
        entries: Utils.FastMap<string, ComponentBondInfoEntry> = Utils.FastMap.create<string, ComponentBondInfoEntry>();

        newEntry(id: string) {
            let e = new ComponentBondInfoEntry(id);
            this.entries.set(id, e);
            return e;
        }
    }

    /**
     * Identifier for a reside that is a part of the polymer.
     */
    export class PolyResidueIdentifier {
        constructor(public asymId: string, public seqNumber: number, public insCode: string | null) { }


        static areEqual(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]) {
            return a.asymId === bAsymId[index]
                && a.seqNumber === bSeqNumber[index]
                && a.insCode === bInsCode[index];
        }

        static compare(a: PolyResidueIdentifier, b: PolyResidueIdentifier) {
            if (a.asymId === b.asymId) {
                if (a.seqNumber === b.seqNumber) {
                    if (a.insCode === b.insCode) return 0;
                    if (a.insCode === void 0) return -1;
                    if (b.insCode === void 0) return 1;
                    return a.insCode! < b.insCode! ? -1 : 1;
                }
                return a.seqNumber < b.seqNumber ? -1 : 1;
            }
            return a.asymId < b.asymId ? -1 : 1;
        }

        static compareResidue(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]) {
            if (a.asymId === bAsymId[index]) {
                if (a.seqNumber === bSeqNumber[index]) {
                    if (a.insCode === bInsCode[index]) return 0;
                    if (a.insCode === void 0) return -1;
                    if (bInsCode[index] === void 0) return 1;
                    return a.insCode! < bInsCode[index] ? -1 : 1;
                }
                return a.seqNumber < bSeqNumber[index] ? -1 : 1;
            }
            return a.asymId < bAsymId[index] ? -1 : 1;
        }
    }

    export const enum SecondaryStructureType { None = 0, Helix = 1, Turn = 2, Sheet = 3, AminoSeq = 4, Strand = 5 }

    export class SecondaryStructureElement {

        startResidueIndex: number = -1;
        endResidueIndex: number = -1;

        get length() {
            return this.endResidueIndex - this.startResidueIndex;
        }

        constructor(
            public type: SecondaryStructureType,
            public startResidueId: PolyResidueIdentifier,
            public endResidueId: PolyResidueIdentifier,
            public info: any = {}) {
        }
    }

    export class SymmetryInfo {
        constructor(
            public spacegroupName: string,
            public cellSize: number[],
            public cellAngles: number[],
            public toFracTransform: number[],
            public isNonStandardCrytalFrame: boolean) {
        }
    }

    /**
     * Wraps _struct_conn mmCIF category.
     */
    export class StructConn {
        private _residuePairIndex: Utils.FastMap<string, StructConn.Entry[]> | undefined = void 0;
        private _atomIndex: Utils.FastMap<number, StructConn.Entry[]> | undefined = void 0; 
        
        private static _resKey(rA: number, rB: number) {
            if (rA < rB) return `${rA}-${rB}`;
            return `${rB}-${rA}`;
        }
        
        private getResiduePairIndex() {
            if (this._residuePairIndex) return this._residuePairIndex;
            this._residuePairIndex = Utils.FastMap.create();
            for (const e of this.entries) {
                const ps = e.partners;
                const l = ps.length;
                for (let i = 0; i < l - 1; i++) {
                    for (let j = i + i; j < l; j++) {
                        const key = StructConn._resKey(ps[i].residueIndex, ps[j].residueIndex);
                        if (this._residuePairIndex.has(key)) {
                            this._residuePairIndex.get(key)!.push(e);
                        } else {
                            this._residuePairIndex.set(key, [e]);
                        }
                    }
                }
            }
            return this._residuePairIndex;
        }

        private getAtomIndex() {
            if (this._atomIndex) return this._atomIndex;
            this._atomIndex = Utils.FastMap.create();
            for (const e of this.entries) {
                for (const p of e.partners) {
                    const key = p.atomIndex;
                    if (this._atomIndex.has(key)) {
                        this._atomIndex.get(key)!.push(e);
                    } else {
                        this._atomIndex.set(key, [e]);
                    }                    
                }
            }
            return this._atomIndex;
        }

        private static _emptyEntry = [];
        
        getResidueEntries(residueAIndex: number, residueBIndex: number): ReadonlyArray<StructConn.Entry> {
            return this.getResiduePairIndex().get(StructConn._resKey(residueAIndex, residueBIndex)) || StructConn._emptyEntry;
        }

        getAtomEntries(atomIndex: number): ReadonlyArray<StructConn.Entry> {
            return this.getAtomIndex().get(atomIndex) || StructConn._emptyEntry;
        }

        constructor(public entries: StructConn.Entry[]) {
        }
    }

    export namespace StructConn {
        export interface Entry {  
            distance: number,
            bondType: BondType,
            partners: { residueIndex: number, atomIndex: number, symmetry: string }[]
        }
    }

    /**
     * Wraps an assembly operator.
     */
    export class AssemblyOperator { constructor(public id: string, public name: string, public operator: number[]) { } }

    /**
     * Wraps a single assembly gen entry.
     */
    export class AssemblyGenEntry {
        constructor(public operators: string[][], public asymIds: string[]) { }
    }

    /**
     * Wraps an assembly generation template.
     */
    export class AssemblyGen {
        gens: AssemblyGenEntry[] = [];
        constructor(public name: string) { }
    }

    /**
     * Information about the assemblies.
     */
    export class AssemblyInfo {
        constructor(public operators: { [id: string]: AssemblyOperator }, public assemblies: AssemblyGen[]) {
        }
    }

    export type PositionTable = DataTable<Position>
    export type AtomTable = DataTable<Atom>
    export type ResidueTable = DataTable<Residue>
    export type ChainTable = DataTable<Chain>
    export type EntityTable = DataTable<Entity>
    export type BondTable = DataTable<Bond>
    export type ModifiedResidueTable = DataTable<ModifiedResidue>

    /**
     * Default Builders
     */
    export namespace Tables {
        const int32 = DataTable.typedColumn(Int32Array);
        const float32 = DataTable.typedColumn(Float32Array);
        const str = DataTable.stringColumn;
        const nullStr = DataTable.stringNullColumn;

        export const Positions: DataTable.Definition<Position> = {
            x: float32,
            y: float32,
            z: float32
        };
        
        export const Atoms: DataTable.Definition<Atom> = {            
            id: int32,
            altLoc: str,
            residueIndex: int32,
            chainIndex: int32,
            entityIndex: int32,
            name: str,
            elementSymbol: str,
            occupancy: float32,
            tempFactor: float32,
            authName: str,
            rowIndex: int32
        };

        export const Residues: DataTable.Definition<Residue> = {                
            name: str,
            seqNumber: int32,
            asymId: str,
            authName: str,
            authSeqNumber: int32,
            authAsymId: str,
            insCode: nullStr,
            entityId: str,
            isHet: DataTable.typedColumn(Int8Array),
            atomStartIndex: int32,
            atomEndIndex: int32,
            chainIndex: int32,
            entityIndex: int32,
            secondaryStructureIndex: int32
        };

        export const Chains: DataTable.Definition<Chain> = {  
            asymId: str,
            entityId: str,
            authAsymId: str,
            atomStartIndex: int32,
            atomEndIndex: int32,
            residueStartIndex: int32,
            residueEndIndex: int32,
            entityIndex: int32,

            sourceChainIndex: void 0,
            operatorIndex: void 0
        };

        export const Entities: DataTable.Definition<Entity> = {  
            entityId: str,
            type: DataTable.customColumn<Entity.Type>(),
            atomStartIndex: int32,
            atomEndIndex: int32,
            residueStartIndex: int32,
            residueEndIndex: int32,
            chainStartIndex: int32,
            chainEndIndex: int32
        };

        export const Bonds: DataTable.Definition<Bond> = { 
            atomAIndex: int32,
            atomBIndex: int32,
            type: DataTable.typedColumn(Int8Array)
        };

        export const ModifiedResidues: DataTable.Definition<ModifiedResidue> = { 
            asymId: str,
            seqNumber: int32,
            insCode: nullStr,
            parent: str,
            details: nullStr
        };
    }

    export class Operator {
        apply(v: Geometry.LinearAlgebra.Vector3) {
            Geometry.LinearAlgebra.Vector3.transformMat4(v, v, this.matrix)
        }

        static applyToModelUnsafe(matrix: number[], m: Molecule.Model) {
            let v = Geometry.LinearAlgebra.Vector3.zero();
            let {x, y, z} = m.positions;
            for (let i = 0, _b = m.positions.count; i < _b; i++) {
                v[0] = x[i]; v[1] = y[i]; v[2] = z[i];
                Geometry.LinearAlgebra.Vector3.transformMat4(v, v, matrix);
                x[i] = v[0]; y[i] = v[1]; z[i] = v[2];
            }
        }

        constructor(public matrix: number[], public id: string, public isIdentity: boolean) {

        }
    }

    export interface Molecule {
        readonly properties: Molecule.Properties,
        readonly id: string,
        readonly models: Molecule.Model[]
    }

    export namespace Molecule {
        export function create(id: string, models: Model[], properties: Properties = {}): Molecule {
            return { id, models, properties };
        }
        
        export interface Properties {
            experimentMethods?: string[]
        }

        export interface Bonds {
            readonly structConn?: StructConn,
            readonly input?: BondTable,
            readonly component?: ComponentBondInfo
        }
        
        export interface Model extends Model.Base {
            readonly queryContext: Query.Context
        }

        export namespace Model {
            export function create(model: Base): Model {
                let ret = Utils.extend({}, model);
                let queryContext: Query.Context | undefined = void 0
                Object.defineProperty(ret, 'queryContext', { enumerable: true, configurable: false, get: function() { 
                    if (queryContext) return queryContext;
                    queryContext = Query.Context.ofStructure(ret as Model);
                    return queryContext;
                }});
                return ret as Model;
            }

            export enum Source {
                File,
                Computed
            }

            export interface Base {
                readonly id: string,
                readonly modelId: string,

                readonly positions: PositionTable,
                readonly data: Data,
                
                readonly source: Source,
                readonly parent?: Model,
                readonly operators?: Operator[],
            }

            export interface Data {
                readonly atoms: AtomTable,
                readonly residues: ResidueTable,
                readonly chains: ChainTable,
                readonly entities: EntityTable,
                readonly bonds: Bonds,
                readonly secondaryStructure: SecondaryStructureElement[],
                readonly modifiedResidues?: ModifiedResidueTable,
                readonly symmetryInfo?: SymmetryInfo,
                readonly assemblyInfo?: AssemblyInfo
            }

            export function withTransformedXYZ<T>(
                model: Model, ctx: T, 
                transform: (ctx: T, x: number, y: number, z: number, out: Geometry.LinearAlgebra.Vector3) => void) {

                const {x,y,z} = model.positions;
                const tAtoms = model.positions.getBuilder(model.positions.count).seal();
                const {x:tX, y:tY, z:tZ} = tAtoms;
                const t = Geometry.LinearAlgebra.Vector3.zero();

                for (let i = 0, _l = model.positions.count; i < _l; i++) {
                    transform(ctx, x[i], y[i], z[i], t);
                    tX[i] = t[0];
                    tY[i] = t[1];
                    tZ[i] = t[2];
                }

                return create({
                    id: model.id,
                    modelId: model.modelId,
                    data: model.data, 
                    positions: tAtoms,
                    parent: model.parent,
                    source: model.source,
                    operators: model.operators
                });
            }
        }
    }
}