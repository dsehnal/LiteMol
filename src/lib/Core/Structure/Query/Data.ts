/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {    
    /**
     * The query is a mapping from a context to a sequence of fragments.
     */
    export type Query = (ctx: Query.Context) => Query.FragmentSeq;    
    
    export namespace Query {
        
        export function apply(q: Source, m: Molecule.Model) {
            return Builder.toQuery(q)(m.queryContext);
        }

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
            private lazyLoopup3d: Geometry.Query3D.LookupStructure<number>;

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
                return this.mask.size === this.structure.data.atoms.count;
            }

            /**
             * The structure this context is based on.
             */
            structure: Molecule.Model;

            /**
             * Get a 3d loopup structure for the atoms in the current context.
             */
            get lookup3d() {
                if (!this.lazyLoopup3d) this.makeLookup3d();
                return this.lazyLoopup3d;
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
            static ofStructure(structure: Molecule.Model) {
                return new Context(structure, Utils.Mask.ofStructure(structure));
            }

            /**
             * Create a new context from a sequence of fragments.
             */
            static ofFragments(seq: FragmentSeq) {
                return new Context(seq.context.structure, Utils.Mask.ofFragments(seq));
            }
            
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofAtomIndices(structure: Molecule.Model, atomIndices: number[]) {                
                return new Context(structure, Utils.Mask.ofIndices(structure.data.atoms.count, atomIndices));
            }

            constructor(structure: Molecule.Model, public readonly mask: Utils.Mask) {
                this.structure = structure;
            }

            private makeLookup3d() {
                let data = new Int32Array(this.mask.size),
                    dataCount = 0,
                    {x, y, z} = this.structure.positions;

                for (let i = 0, _b = this.structure.positions.count; i < _b; i++) {
                    if (this.mask.has(i)) data[dataCount++] = i;
                }

                const inputData = Geometry.Query3D.createInputData(data as any as number[], (i, add) => add(x[i], y[i], z[i]));
                this.lazyLoopup3d = Geometry.Query3D.createSpatialHash(inputData);
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
                let residue = (<any>this.context.structure.data.atoms).residueIndex[this.tag];
                return (<any>this.context.structure.data.residues).isHet[residue];
            }


            private _fingerprint: string;
            /**
             * A sorted list of residue identifiers.
             */
            get fingerprint() {
                if (this._fingerprint) return this._fingerprint;

                let indexList: number[] = this.residueIndices,
                    residues = this.context.structure.data.residues,
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
                    residues = this.context.structure.data.residues,
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

                let residueIndices = Utils.FastSet.create<number>(),
                    chainIndices = Utils.FastSet.create<number>(),
                    entityIndices = Utils.FastSet.create<number>(),
                    rIndices = this.context.structure.data.atoms.residueIndex,
                    cIndices = this.context.structure.data.residues.chainIndex,
                    eIndices = this.context.structure.data.chains.entityIndex;

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
            static ofSet(context: Context, atomIndices: Utils.FastSet<number>) {
                let array = new Int32Array(atomIndices.size);

                atomIndices.forEach((i, ctx) => { ctx!.array[ctx!.index++] = i }, { array, index: 0 });
                Array.prototype.sort.call(array, function (a: number, b: number) { return a - b; });

                return new Fragment(context, array[0], <any>array);
            }

            /**
             * Create a fragment from an integer array.
             * Assumes the set is in the given context's mask.
             * Assumes the array is sorted.
             */
            static ofArray(context: Context, tag: number, atomIndices: Int32Array | number[]) {
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

                let map = <number[]><any>new Int8Array(this.context.structure.data.atoms.count),
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
            private byHash = Utils.FastMap.create<number, Fragment[]>();
            
            add(f: Fragment) {

                let hash = f.hashCode;

                if (this.byHash.has(hash)) {
                    let fs = this.byHash.get(hash)!;

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