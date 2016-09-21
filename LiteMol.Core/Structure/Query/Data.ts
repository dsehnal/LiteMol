/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {

    
    /**
     * The query is a mapping from a context to a sequence of fragments.
     */
    export type Query = (ctx: Query.Context) => Query.FragmentSeq;    
    
    export namespace Query {
        
        export type Source = Query | string | Builder
          
        /**
         * The context of a query. 
         * 
         * Stores:
         * - the mask of "active" atoms.
         * - kd-tree for fast geometry queries. 
         * - the molecule itself.
         * 
         */
        export class Context {

            private mask: Context.Mask;
            private lazyTree: Geometry.SubdivisionTree3D<number>;

            /**
             * Number of atoms in the current context.
             */
            get atomCount() {
                return this.mask.size;
            }

            /**
             * Determine if the context contains all atoms of the input model.
             */
            get isComplete() {
                return this.mask.size === this.structure.atoms.count;
            }

            /**
             * The structure this context is based on.
             */
            structure: MoleculeModel;

            /**
             * Get a kd-tree for the atoms in the current context.
             */
            get tree() {
                if (!this.lazyTree) this.makeTree();
                return this.lazyTree;
            }
            
            /**
             * Checks if an atom is included in the current context.
             */
            hasAtom(index: number) {
                return !!this.mask.has(index);
            }

            /**
             * Checks if an atom from the range is included in the current context.
             */
            hasRange(start: number, end: number) {
                for (let i = start; i < end; i++) {
                    if (this.mask.has(i)) return true;
                }
                return false;
            }

            /**
             * Create a new context based on the provide structure.
             */
            static ofStructure(structure: MoleculeModel) {
                return new Context(structure, Context.Mask.ofStructure(structure));
            }

            /**
             * Create a new context from a sequence of fragments.
             */
            static ofFragments(seq: FragmentSeq) {
                return new Context(seq.context.structure, Context.Mask.ofFragments(seq));
            }
            
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofAtomIndices(structure: MoleculeModel, atomIndices: number[]) {                
                return new Context(structure, Context.Mask.ofIndices(structure, atomIndices));
            }

            constructor(structure: MoleculeModel, mask: Context.Mask) {
                this.structure = structure;
                this.mask = mask;
            }

            private makeTree() {
                let data = new Int32Array(this.mask.size),
                    dataCount = 0,
                    {x, y, z} = this.structure.atoms;

                for (let i = 0, _b = this.structure.atoms.count; i < _b; i++) {
                    if (this.mask.has(i)) data[dataCount++] = i;
                }
                this.lazyTree = Geometry.SubdivisionTree3D.create<number>(<any>data, (i, add) => add(x[i], y[i], z[i]));
            }
        }
        
        export namespace Context {
            
            /**
             * Represents the atoms in the context.
             */
            export interface Mask {
                size: number;
                has(i: number): boolean;
            }
            
            export module Mask {            
                class BitMask implements Mask {                
                    has(i: number) { return <any>this.mask[i] }                
                    constructor(private mask: Int8Array, public size: number) {}
                }
                
                class AllMask implements Mask {
                    has(i: number) { return true; }
                    constructor(public size: number) { }
                }
                
                export function ofStructure(structure: MoleculeModel): Mask {
                    return new AllMask(structure.atoms.count);
                }
                        
                export function ofIndices(structure: MoleculeModel, atomIndices: number[]): Mask {
                    let f = atomIndices.length / structure.atoms.count;
                    if (f < 0.25) {
                        let set = new Set<number>();
                        for (let i of atomIndices) set.add(i);
                        return set;
                    }
                    
                    let mask = new Int8Array(structure.atoms.count);                
                    for (let i of atomIndices) {
                        mask[i] = 1;
                    }
                    return new BitMask(mask, atomIndices.length);
                }
                
                export function ofFragments(seq: FragmentSeq): Mask {
                    let sizeEstimate = 0;
                    
                    for (let f of seq.fragments) {
                        sizeEstimate += f.atomCount;
                    }
                    
                    let count = seq.context.structure.atoms.count;
                    
                    if (sizeEstimate / count < 0.25) {
                        // create set;
                        let mask = new Set<number>();
                        for (let f of seq.fragments) {
                            for (let i of f.atomIndices) {
                                mask.add(i);
                            }
                        }
                        return mask;
                    } else {                    
                        let mask = new Int8Array(count);
                                                
                        for (let f of seq.fragments) {
                            for (let i of f.atomIndices) {
                                mask[i] = 1;
                            }
                        }

                        let size = 0;
                        for (let i = 0; i < count; i++) {
                            if (mask[i] !== 0) size++;
                        }
                        return new BitMask(mask, size);
                    }
                }
            }
        }


        /**
         * The basic element of the query language. 
         * Everything is represented as a fragment.
         */
        export class Fragment {

            /**
             * The index of the first atom of the generator.
             */
            tag: number;

            /**
             * Indices of atoms.
             */
            atomIndices: number[];

            /**
             * The context the fragment belongs to.
             */
            context: Context;

            private _hashCode = 0;
            private _hashComputed = false;
            /**
             * The hash code of the fragment.
             */
            get hashCode() {

                if (this._hashComputed) return this._hashCode;

                let code = 23;
                for (let i of this.atomIndices) {
                    code = (31 * code + i) | 0;
                }

                this._hashCode = code;
                this._hashComputed = true;
                
                return code;
            }

            /**
             * Id composed of <moleculeid>_<tag>.
             */
            get id() {
                return this.context.structure.id + "_" + this.tag;
            }

            /**
             * Number of atoms.
             */
            get atomCount() {
                return this.atomIndices.length;
            }

            /**
             * Determines if a fragment is HET based on the tag.
             */
            get isHet() {
                let residue = (<any>this.context.structure.atoms).residueIndex[this.tag];
                return (<any>this.context.structure.residues).isHet[residue];
            }


            private _fingerprint: string;
            /**
             * A sorted list of residue identifiers.
             */
            get fingerprint() {
                if (this._fingerprint) return this._fingerprint;

                let indexList: number[] = this.residueIndices,
                    struct = this.context.structure,
                    residues = this.context.structure.residues,
                    cName = residues.name, cAsym = residues.asymId, cSeq = residues.seqNumber, insCode = residues.insCode,
                    names:string[] = [];
                
                for (let i of indexList) {
                    let name = cName[i] + " " + cAsym[i] + " " + cSeq[i];
                    if (insCode[i]) name += " i:" + insCode[i];
                    names[names.length] = name;
                }

                return names.join("-");
            }

            private _authFingerprint: string;
            /**
             * A sorted list of residue identifiers.
             */
            get authFingerprint() {
                if (this._authFingerprint) return this._authFingerprint;

                let indexList: number[] = this.residueIndices,
                    struct = this.context.structure,
                    residues = this.context.structure.residues,
                    cName = residues.authName, cAsym = residues.authAsymId, cSeq = residues.authSeqNumber, insCode = residues.insCode,
                    names: string[] = [];

                for (let i of indexList) {
                    let name = cName[i] + " " + cAsym[i] + " " + cSeq[i];
                    if (insCode[i]) name += " i:" + insCode[i];
                    names[names.length] = name;
                }

                return names.join("-");
            }

            /**
             * Executes a query on the current fragment.
             */
            find(what: Source): FragmentSeq {
                let ctx = Context.ofFragments(new FragmentSeq(this.context, [this]));
                return Builder.toQuery(what)(ctx);
            }

            private _residueIndices: number[];
            private _chainIndices: number[];
            private _entityIndices: number[];

            private computeIndices() {
                if (this._residueIndices) return;

                let residueIndices = new Set<number>(),
                    chainIndices = new Set<number>(),
                    entityIndices = new Set<number>(),
                    rIndices = this.context.structure.atoms.residueIndex,
                    cIndices = this.context.structure.residues.chainIndex,
                    eIndices = this.context.structure.chains.entityIndex;

                for (let i of this.atomIndices) { residueIndices.add(rIndices[i]); }
                this._residueIndices = Utils.integerSetToSortedTypedArray(residueIndices);
                
                for (let i of this._residueIndices) { chainIndices.add(cIndices[i]); }
                this._chainIndices = Utils.integerSetToSortedTypedArray(chainIndices);
                
                for (let i of this._chainIndices) { entityIndices.add(eIndices[i]); }
                this._entityIndices = Utils.integerSetToSortedTypedArray(entityIndices);            
            }

            /**
             * A sorted list of residue indices.
             */
            get residueIndices() {
                this.computeIndices();
                return this._residueIndices;            
            }

            /**
             * A sorted list of chain indices.
             */
            get chainIndices() {
                this.computeIndices();
                return this._chainIndices;
            }

            /**
             * A sorted list of entity indices.
             */
            get entityIndices() {
                this.computeIndices();
                return this._entityIndices;
            }

            static areEqual(a: Fragment, b: Fragment) {

                if (a.atomCount !== b.atomCount) return false;

                let xs = a.atomIndices, ys = b.atomIndices;

                for (let i = 0; i < xs.length; i++) {
                    if (xs[i] !== ys[i]) return false;
                }

                return a.tag === b.tag;
            }

            /**
             * Create a fragment from an integer set.
             * Assumes the set is in the given context's mask.
             */
            static ofSet(context: Context, atomIndices: Set<number>) {
                let array = new Int32Array(atomIndices.size),
                    index = 0;

                atomIndices.forEach(function (i) { this.array[this.index++] = i }, { array: array, index: 0 });
                Array.prototype.sort.call(array, function (a: number, b: number) { return a - b; });

                return new Fragment(context, array[0], <any>array);
            }

            /**
             * Create a fragment from an integer array.
             * Assumes the set is in the given context's mask.
             * Assumes the array is sorted.
             */
            static ofArray(context: Context, tag: number, atomIndices: Int32Array) {
                return new Fragment(context, tag, <any>atomIndices);
            }

            /**
             * Create a fragment from a single index.
             * Assumes the index is in the given context's mask.
             */
            static ofIndex(context: Context, index: number) {
                let indices = new Int32Array(1);
                indices[0] = index;
                return new Fragment(context, index, <any>indices);
            }

            /**
             * Create a fragment from a <start,end) range.
             * Assumes the fragment is non-empty in the given context's mask.
             */
            static ofIndexRange(context: Context, start: number, endExclusive: number) {
                let count = 0;
                for (let i = start; i < endExclusive; i++) {
                    if (context.hasAtom(i)) count++;
                }
                
                let atoms = new Int32Array(count), offset = 0;
                for (let i = start; i < endExclusive; i++) {
                    if (context.hasAtom(i)) atoms[offset++] = i;
                }
                return new Fragment(context, start, <any>atoms);
            }

            /**
             * Create a fragment from an integer set.
             */
            constructor(context: Context, tag: number, atomIndices: number[]) {
                this.context = context;
                this.tag = tag;
                this.atomIndices = atomIndices;
            }
        }

        /**
         * A sequence of fragments the queries operate on.
         */
        export class FragmentSeq {
                    
            static empty(ctx: Context) {
                return new FragmentSeq(ctx, []);
            }

            get length() {
                return this.fragments.length;
            }

            /**
             * Merges atom indices from all fragments.
             */
            unionAtomIndices(): number[] {

                if (!this.length) return [];
                if (this.length === 1) return this.fragments[0].atomIndices;

                let map = <number[]><any>new Int8Array(this.context.structure.atoms.count),
                    atomCount = 0;

                for (let f of this.fragments) {
                    for (let i of f.atomIndices) {
                        map[i] = 1;
                    }
                }

                for (let i of map) {
                    atomCount += i;
                }

                let ret = new Int32Array(atomCount),
                    offset = 0;
                for (let i = 0, _l = map.length; i < _l; i++) {
                    if (map[i]) ret[offset++] = i;
                }

                return <number[]><any>ret;
            }

            /**
             * Merges atom indices from all fragments into a single fragment.
             */
            unionFragment(): Fragment {

                if (!this.length) return new Fragment(this.context, 0, <any>new Int32Array(0));
                if (this.length === 1) return this.fragments[0];

                let union = this.unionAtomIndices();
                return new Fragment(this.context, union[0], union);
            }

            constructor(
                public context: Context,
                public fragments: Fragment[]) {
            }
        }

        /**
         * A builder that includes all fragments.
         */
        export class FragmentSeqBuilder {

            private fragments: Fragment[] = [];

            add(f: Fragment) {
                this.fragments[this.fragments.length] = f;
            }

            getSeq() {
                return new FragmentSeq(this.ctx, this.fragments);
            }

            constructor(private ctx: Context) {
            }

        }

        /**
         * A builder that includes only unique fragments.
         */
        export class HashFragmentSeqBuilder {

            private fragments: Fragment[] = [];
            private byHash = new Map<number, Fragment[]>();
            
            add(f: Fragment) {

                let hash = f.hashCode;

                if (this.byHash.has(hash)) {
                    let fs = this.byHash.get(hash);

                    for (let q of fs) {
                        if (Fragment.areEqual(f, q)) return this;
                    }

                    this.fragments[this.fragments.length] = f;
                    fs[fs.length] = f;
                } else {
                    this.fragments[this.fragments.length] = f;
                    this.byHash.set(hash, [f]);
                }

                return this;
            }

            getSeq() {
                return new FragmentSeq(this.ctx, this.fragments);
            }
            
            constructor(private ctx: Context) {
            }

        }
    }
}