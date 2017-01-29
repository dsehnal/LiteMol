declare namespace LiteMol {
    type Promise<T> = __Promise.Promise<T>;
    const Promise: typeof __Promise.Promise;
}
declare namespace LiteMol.Core {
    export import Rx = __LiteMolRx;
    export import Promise = LiteMol.Promise;
    namespace Formats {
        export import CIF = CIFTools;
    }
}
declare namespace LiteMol.Core {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMol.Core {
    function computation<A>(c: (ctx: Computation.Context) => Promise<A>): Computation<A>;
    class Computation<A> {
        private computation;
        run(ctx?: Computation.Context): __Promise.Promise<A>;
        runWithContext(ctx?: Computation.Context): Computation.Running<A>;
        constructor(computation: (ctx: Computation.Context) => Promise<A>);
    }
    module Computation {
        function resolve<A>(a: A): Computation<A>;
        function reject<A>(reason: any): Computation<A>;
        function createContext(): Computation.Context;
        const Aborted = "Aborted";
        const UpdateProgressDelta = 100;
        interface Progress {
            message: string;
            isIndeterminate: boolean;
            current: number;
            max: number;
            requestAbort?: () => void;
        }
        interface Context {
            progress: Rx.Observable<Progress>;
            requestAbort(): void;
            /**
             * Checks if the computation was aborted. If so, throws.
             * Otherwise, updates the progress.
             */
            updateProgress(msg: string, abort?: boolean | (() => void), current?: number, max?: number): void;
        }
        interface Running<A> {
            progress: Rx.Observable<Progress>;
            result: Promise<A>;
        }
    }
}
declare namespace LiteMol.Core.Utils {
    /**
     * An "object" based implementation of map that supports string and numeric keys
     * which should be ok for most use cases in LiteMol.
     *
     * The type limitation is on purpose to prevent using the type in places that are
     * not appropriate.
     */
    interface FastMap<K extends string | number, V> {
        readonly size: number;
        set(key: K, v: V): void;
        get(key: K): V | undefined;
        delete(key: K): boolean;
        has(key: K): boolean;
        clear(): void;
        /**
         * Iterate over the collection.
         * Optional "context" object can be supplied that is passed to the callback.
         *
         * Enumerates only values that are not undefined.
         */
        forEach<Context>(f: (value: V, key: K, ctx?: Context) => void, ctx?: Context): void;
    }
    /**
     * An "object" based implementation of set that supports string and numeric values
     * which should be ok for most use cases in LiteMol.
     *
     * The type limitation is on purpose to prevent using the type in places that are
     * not appropriate.
     */
    interface FastSet<T extends string | number> {
        readonly size: number;
        add(key: T): boolean;
        delete(key: T): boolean;
        has(key: T): boolean;
        clear(): void;
        /**
         * Iterate over the collection.
         * Optional "context" object can be supplied that is passed to the callback.
         */
        forEach<Context>(f: (key: T, ctx?: Context) => void, ctx?: Context): void;
    }
    namespace FastMap {
        /**
         * Creates an empty map.
         */
        function create<K extends string | number, V>(): FastMap<K, V>;
        /**
         * Create a map from an array of the form [[key, value], ...]
         */
        function ofArray<K extends string | number, V>(data: (K | V)[][]): FastMap<K, V>;
        /**
         * Create a map from an object of the form { key: value, ... }
         */
        function ofObject<V>(data: {
            [key: string]: V;
        }): FastMap<string, V>;
    }
    namespace FastSet {
        /**
         * Create an empty set.
         */
        function create<T extends string | number>(): FastSet<T>;
        /**
         * Create a set of an "array like" sequence.
         */
        function ofArray<T extends string | number>(xs: ArrayLike<T>): FastSet<T>;
    }
}
declare namespace LiteMol.Core.Utils {
    export import FastNumberParsers = Core.Formats.CIF.Utils.FastNumberParsers;
    function extend<S, T, U>(object: S, source: T, guard?: U): S & T & U;
    function debounce<T>(func: () => T, wait: number): () => T;
}
declare namespace LiteMol.Core.Utils {
    type DataTable<Schema> = DataTable.Base<Schema> & DataTable.Columns<Schema>;
    module DataTable {
        type Definition<Schema> = {
            [T in keyof Schema]: ((size: number) => Schema[T][]) | undefined;
        };
        type Columns<Schema> = {
            readonly [P in keyof Schema]: Schema[P][];
        };
        interface ColumnDescriptor<Schema> {
            name: keyof Schema;
            creator: (size: number) => any;
        }
        type TypedArrayContructor = Float32ArrayConstructor | Float64ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int8ArrayConstructor | Uint8ArrayConstructor;
        function typedColumn(t: TypedArrayContructor): (size: number) => number[];
        function customColumn<T>(): (size: number) => T[];
        const stringColumn: (size: number) => string[];
        const stringNullColumn: (size: number) => (string | null)[];
        interface Base<Schema> {
            count: number;
            indices: number[];
            columns: ColumnDescriptor<Schema>[];
            getBuilder(count: number): Builder<Schema>;
            getRawData(): any[][];
            /**
             * Get a MUTABLE representation of a row.
             * Calling getRow() with differnt 'i' will change update old reference.
             */
            getRow(i: number): Schema;
        }
        interface Builder<Schema> {
            count: number;
            columns: ColumnDescriptor<Schema>[];
            addColumn<T>(name: keyof Schema, creator: (size: number) => T): T;
            getRawData(): any[][];
            /**
             * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine
             * use internal class instead of dictionary representation.
             */
            seal(): DataTable<Schema>;
        }
        function builder<Schema>(count: number): Builder<Schema>;
        function ofDefinition<Schema>(definition: Definition<Schema>, count: number): DataTable<Schema>;
    }
}
declare namespace LiteMol.Core.Utils {
    function integerSetToSortedTypedArray(set: FastSet<number>): number[];
    /**
     * A a JS native array with the given size.
     */
    function makeNativeIntArray(size: number): number[];
    /**
     * A a JS native array with the given size.
     */
    function makeNativeFloatArray(size: number): number[];
    /**
     * A generic chunked array builder.
     *
     * When adding elements, the array growns by a specified number
     * of elements and no copying is done until ChunkedArray.compact
     * is called.
     */
    interface ChunkedArray<T> {
        creator: (size: number) => any;
        elementSize: number;
        chunkSize: number;
        current: any;
        currentIndex: number;
        parts: any[];
        elementCount: number;
    }
    namespace ChunkedArray {
        function is(x: any): x is ChunkedArray<any>;
        function add4<T>(array: ChunkedArray<T>, x: T, y: T, z: T, w: T): number;
        function add3<T>(array: ChunkedArray<T>, x: T, y: T, z: T): number;
        function add2<T>(array: ChunkedArray<T>, x: T, y: T): number;
        function add<T>(array: ChunkedArray<T>, x: T): number;
        function compact<T>(array: ChunkedArray<T>): T[];
        function forVertex3D(chunkVertexCount?: number): ChunkedArray<number>;
        function forIndexBuffer(chunkIndexCount?: number): ChunkedArray<number>;
        function forTokenIndices(chunkTokenCount?: number): ChunkedArray<number>;
        function forIndices(chunkTokenCount?: number): ChunkedArray<number>;
        function forInt32(chunkSize?: number): ChunkedArray<number>;
        function forFloat32(chunkSize?: number): ChunkedArray<number>;
        function forArray<T>(chunkSize?: number): ChunkedArray<T>;
        function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ChunkedArray<T>;
    }
    /**
     * Static size array builder.
     */
    interface ArrayBuilder<T> {
        currentIndex: number;
        elementCount: number;
        array: T[];
    }
    namespace ArrayBuilder {
        function add3<T>(array: ArrayBuilder<T>, x: T, y: T, z: T): void;
        function add2<T>(array: ArrayBuilder<T>, x: T, y: T): void;
        function add<T>(array: ArrayBuilder<T>, x: T): void;
        function forVertex3D(count: number): ArrayBuilder<number>;
        function forIndexBuffer(count: number): ArrayBuilder<number>;
        function forTokenIndices(count: number): ArrayBuilder<number>;
        function forIndices(count: number): ArrayBuilder<number>;
        function forInt32(count: number): ArrayBuilder<number>;
        function forFloat32(count: number): ArrayBuilder<number>;
        function forArray<T>(count: number): ArrayBuilder<T>;
        function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ArrayBuilder<T>;
    }
}
declare namespace LiteMol.Core.Utils {
    class PerformanceMonitor {
        private starts;
        private ends;
        static currentTime(): number;
        start(name: string): void;
        end(name: string): void;
        static format(t: number): string;
        formatTime(name: string): string;
        formatTimeSum(...names: string[]): string;
        time(name: string): number;
        timeSum(...names: string[]): number;
    }
}
declare namespace LiteMol.Core.Formats {
    interface FormatInfo {
        name: string;
        shortcuts: string[];
        extensions: string[];
        isBinary?: boolean;
        parse: (data: string | ArrayBuffer, params?: FormatInfo.Params) => Computation<ParserResult<any>>;
    }
    namespace FormatInfo {
        type Params = {
            id?: string;
        };
        function is(o: any): o is FormatInfo;
        function fromShortcut(all: FormatInfo[], name: string): FormatInfo | undefined;
        function formatRegExp(info: FormatInfo): RegExp;
        function formatFileFilters(all: FormatInfo[]): string;
        function getFormat(filename: string, all: FormatInfo[]): FormatInfo | undefined;
    }
    type ParserResult<T> = ParserSuccess<T> | ParserError;
    namespace ParserResult {
        function error<T>(message: string, line?: number): ParserResult<T>;
        function success<T>(result: T, warnings?: string[]): ParserResult<T>;
    }
    class ParserError {
        message: string;
        line: number;
        isError: true;
        toString(): string;
        constructor(message: string, line: number);
    }
    class ParserSuccess<T> {
        result: T;
        warnings: string[];
        isError: false;
        constructor(result: T, warnings: string[]);
    }
    /**
     * A helper for building a typed array of token indices.
     */
    interface TokenIndexBuilder {
        tokensLenMinus2: number;
        count: number;
        tokens: Int32Array;
    }
    namespace TokenIndexBuilder {
        function addToken(builder: TokenIndexBuilder, start: number, end: number): void;
        function create(size: number): TokenIndexBuilder;
    }
    /**
     * This ensures there is only 1 instance of a short string.
     */
    type ShortStringPool = {
        [key: string]: string;
    };
    namespace ShortStringPool {
        function create(): ShortStringPool;
        function get(pool: ShortStringPool, str: string): string;
    }
}
declare namespace LiteMol.Core.Formats.Molecule.mmCIF {
    function ofDataBlock(data: CIF.DataBlock): Structure.Molecule;
}
declare namespace LiteMol.Core.Formats.Molecule.PDB {
    type TokenRange = {
        start: number;
        end: number;
    };
    type HelperData = {
        dot: TokenRange;
        question: TokenRange;
        numberTokens: Utils.FastMap<number, TokenRange>;
        data: string;
    };
    class MoleculeData {
        header: Header;
        crystInfo: CrystStructureInfo | undefined;
        models: ModelsData;
        data: string;
        private makeEntities();
        toCifFile(): CIF.File;
        constructor(header: Header, crystInfo: CrystStructureInfo | undefined, models: ModelsData, data: string);
    }
    class Header {
        id: string;
        constructor(id: string);
    }
    class CrystStructureInfo {
        record: string;
        toCifCategory(id: string): {
            cell: CIF.Category | undefined;
            symm: CIF.Category | undefined;
        };
        constructor(record: string);
    }
    class SecondaryStructure {
        helixTokens: number[];
        sheetTokens: number[];
        toCifCategory(data: string): {
            helices: CIF.Category;
            sheets: CIF.Category;
        } | undefined;
        constructor(helixTokens: number[], sheetTokens: number[]);
    }
    class ModelData {
        idToken: TokenRange;
        atomTokens: number[];
        atomCount: number;
        static COLUMNS: string[];
        private writeToken(index, cifTokens);
        private writeTokenCond(index, cifTokens, dot);
        private writeRange(range, cifTokens);
        private tokenEquals(start, end, value, data);
        private getEntityType(row, data);
        writeCifTokens(modelToken: TokenRange, cifTokens: Utils.ArrayBuilder<number>, helpers: HelperData): void;
        constructor(idToken: TokenRange, atomTokens: number[], atomCount: number);
    }
    class ModelsData {
        models: ModelData[];
        toCifCategory(block: CIF.Text.DataBlock, helpers: HelperData): CIF.Text.Category;
        constructor(models: ModelData[]);
    }
}
declare namespace LiteMol.Core.Formats.Molecule.PDB {
    class Parser {
        private static tokenizeAtom(tokens, tokenizer);
        private static tokenize(id, data);
        static getDotRange(length: number): TokenRange;
        static getNumberRanges(length: number): Utils.FastMap<number, TokenRange>;
        static getQuestionmarkRange(length: number): TokenRange;
        static parse(id: string, data: string): ParserResult<CIF.File>;
    }
    function toCifFile(id: string, data: string): ParserResult<CIF.File>;
}
declare namespace LiteMol.Core.Formats.Molecule.SDF {
    function parse(data: string, id?: string): ParserResult<Structure.Molecule>;
}
declare namespace LiteMol.Core.Formats.Molecule {
    namespace SupportedFormats {
        const mmCIF: FormatInfo;
        const mmBCIF: FormatInfo;
        const PDB: FormatInfo;
        const SDF: FormatInfo;
        const All: FormatInfo[];
    }
}
declare namespace LiteMol.Core.Formats.Density {
    interface Field3D {
        dimensions: number[];
        length: number;
        getAt(idx: number): number;
        setAt(idx: number, v: number): void;
        get(i: number, j: number, k: number): number;
        set(i: number, j: number, k: number, v: number): void;
        fill(v: number): void;
    }
    class Field3DZYX implements Field3D {
        data: number[];
        dimensions: number[];
        private nX;
        private nY;
        private len;
        readonly length: number;
        getAt(idx: number): number;
        setAt(idx: number, v: number): void;
        get(i: number, j: number, k: number): number;
        set(i: number, j: number, k: number, v: number): void;
        fill(v: number): void;
        constructor(data: number[], dimensions: number[]);
    }
    /**
     * Represents electron density data.
     */
    interface Data {
        /**
         * Crystal cell size.
         */
        cellSize: number[];
        /**
         * Crystal cell angles.
         */
        cellAngles: number[];
        /**
         * Origin of the cell
         */
        origin: number[];
        /**
         * 3D volumetric data.
         */
        data: Field3D;
        /**
         * X, Y, Z dimensions of the data matrix.
         */
        dataDimensions: number[];
        /**
         * The basis of the space.
         */
        basis: {
            x: number[];
            y: number[];
            z: number[];
        };
        /**
         * Was the skew matrix present in the input?
         */
        hasSkewMatrix: boolean;
        /**
         * Column major ordered skew matrix.
         */
        skewMatrix: number[];
        /**
         * Information about the min/max/mean/sigma values.
         */
        valuesInfo: {
            min: number;
            max: number;
            mean: number;
            sigma: number;
        };
        /**
         * Additional attributes.
         */
        attributes: {
            [key: string]: any;
        };
        /**
         * Are the data normalized?
         */
        isNormalized: boolean;
    }
    namespace Data {
        function create(cellSize: number[], cellAngles: number[], origin: number[], hasSkewMatrix: boolean, skewMatrix: number[], data: Field3D, dataDimensions: number[], basis: {
            x: number[];
            y: number[];
            z: number[];
        }, valuesInfo: {
            min: number;
            max: number;
            mean: number;
            sigma: number;
        }, attributes?: {
            [key: string]: any;
        }): Data;
        function normalize(densityData: Data): void;
        function denormalize(densityData: Data): void;
    }
}
declare namespace LiteMol.Core.Formats.Density.CCP4 {
    function parse(buffer: ArrayBuffer): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density.CIF {
    function parse(block: Formats.CIF.DataBlock): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density.DSN6 {
    function parse(buffer: ArrayBuffer): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density {
    namespace SupportedFormats {
        const CCP4: FormatInfo;
        const DSN6: FormatInfo;
        const All: FormatInfo[];
    }
}
declare namespace LiteMol.Core.Geometry.LinearAlgebra {
    type ObjectVec3 = {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Stores a 4x4 matrix in a column major (j * 4 + i indexing) format.
     */
    namespace Matrix4 {
        function empty(): number[];
        function identity(): number[];
        function ofRows(rows: number[][]): number[];
        function areEqual(a: number[], b: number[], eps: number): boolean;
        function setValue(a: number[], i: number, j: number, value: number): void;
        function copy(out: number[], a: any): number[];
        function clone(a: number[]): number[];
        function invert(out: number[], a: number[]): number[] | null;
        function mul(out: number[], a: number[], b: number[]): number[];
        function translate(out: number[], a: number[], v: number[]): number[];
        function fromTranslation(out: number[], v: number[]): number[];
        function transformVector3(out: {
            x: number;
            y: number;
            z: number;
        }, a: {
            x: number;
            y: number;
            z: number;
        }, m: number[]): {
            x: number;
            y: number;
            z: number;
        };
        function makeTable(m: number[]): string;
        function determinant(a: number[]): number;
    }
    namespace Vector4 {
        function create(): number[];
        function clone(a: number[]): number[];
        function fromValues(x: number, y: number, z: number, w: number): number[];
        function set(out: number[], x: number, y: number, z: number, w: number): number[];
        function distance(a: number[], b: number[]): number;
        function squaredDistance(a: number[], b: number[]): number;
        function norm(a: number[]): number;
        function squaredNorm(a: number[]): number;
        function transform(out: number[], a: number[], m: number[]): number[];
    }
}
declare namespace LiteMol.Core.Geometry {
    /**
     * Basic shape of the result buffer for range queries.
     */
    interface SubdivisionTree3DResultBuffer {
        count: number;
        indices: number[];
        hasPriorities: boolean;
        priorities: number[] | undefined;
        add(distSq: number, index: number): void;
        reset(): void;
    }
    /**
     * A buffer that only remembers the values.
     */
    namespace SubdivisionTree3DResultIndexBuffer {
        function create(initialCapacity: number): SubdivisionTree3DResultBuffer;
    }
    /**
     * A buffer that remembers values and priorities.
     */
    namespace SubdivisionTree3DResultPriorityBuffer {
        function create(initialCapacity: number): SubdivisionTree3DResultBuffer;
    }
    /**
     * Query context. Handles the actual querying.
     */
    interface SubdivisionTree3DQueryContext<T> {
        tree: SubdivisionTree3D<T>;
        pivot: number[];
        radius: number;
        radiusSq: number;
        indices: number[];
        positions: number[];
        buffer: SubdivisionTree3DResultBuffer;
        nearest(x: number, y: number, z: number, radius: number): void;
    }
    namespace SubdivisionTree3DQueryContext {
        function create<T>(tree: SubdivisionTree3D<T>, buffer: SubdivisionTree3DResultBuffer): SubdivisionTree3DQueryContext<T>;
    }
    /**
     * A kd-like tree to query 3D data.
     */
    interface SubdivisionTree3D<T> {
        data: T[];
        indices: number[];
        positions: number[];
        root: SubdivisionTree3DNode;
    }
    namespace SubdivisionTree3D {
        /**
         * Create a context used for querying the data.
         */
        function createContextRadius<T>(tree: SubdivisionTree3D<T>, radiusEstimate: number, includePriorities?: boolean): SubdivisionTree3DQueryContext<T>;
        /**
         * Takes data and a function that calls SubdivisionTree3DPositionBuilder.add(x, y, z) on each data element.
         */
        function create<T>(data: T[], f: (e: T, add: (x: number, y: number, z: number) => void) => void, leafSize?: number): SubdivisionTree3D<T>;
    }
    /**
     * A tree node.
     */
    interface SubdivisionTree3DNode {
        splitValue: number;
        startIndex: number;
        endIndex: number;
        left: SubdivisionTree3DNode;
        right: SubdivisionTree3DNode;
    }
    namespace SubdivisionTree3DNode {
        function nearest<T>(node: SubdivisionTree3DNode, ctx: SubdivisionTree3DQueryContext<T>, dim: number): void;
        function create(splitValue: number, startIndex: number, endIndex: number, left: SubdivisionTree3DNode, right: SubdivisionTree3DNode): SubdivisionTree3DNode;
    }
    /**
     * A helper to store boundary box.
     */
    interface Box3D {
        min: number[];
        max: number[];
    }
    namespace Box3D {
        function createInfinite(): Box3D;
    }
}
declare namespace LiteMol.Core.Geometry {
    interface Surface {
        /**
         * Number of vertices.
         */
        vertexCount: number;
        /**
         * Number of triangles.
         */
        triangleCount: number;
        /**
         * Array of size 3 * vertexCount. Layout [x1, y1, z1, ...., xn, yn, zn]
         */
        vertices: Float32Array;
        /**
         * 3 indexes for each triangle
         */
        triangleIndices: Uint32Array;
        /**
         * Per vertex annotation.
         */
        annotation?: number[];
        /**
         * Array of size 3 * vertexCount. Layout [x1, y1, z1, ...., xn, yn, zn]
         *
         * Computed on demand.
         */
        normals?: Float32Array;
        /**
         * Bounding sphere.
         */
        boundingSphere?: {
            center: Geometry.LinearAlgebra.ObjectVec3;
            radius: number;
        };
    }
    namespace Surface {
        function computeNormalsImmediate(surface: Surface): void;
        function computeNormals(surface: Surface): Computation<Surface>;
        function laplacianSmooth(surface: Surface, iterCount?: number): Computation<Surface>;
        function computeBoundingSphere(surface: Surface): Computation<Surface>;
        function transformImmediate(surface: Surface, t: number[]): void;
        function transform(surface: Surface, t: number[]): Computation<Surface>;
    }
}
declare namespace LiteMol.Core.Geometry.MarchingCubes {
    /**
     * The parameters required by the algorithm.
     */
    interface MarchingCubesParameters {
        isoLevel: number;
        scalarField: Formats.Density.Field3D;
        bottomLeft?: number[];
        topRight?: number[];
        annotationField?: Formats.Density.Field3D;
    }
    function compute(parameters: MarchingCubesParameters): Computation<Surface>;
}
declare namespace LiteMol.Core.Geometry.MarchingCubes {
    class Index {
        i: number;
        j: number;
        k: number;
        constructor(i: number, j: number, k: number);
    }
    class IndexPair {
        a: Index;
        b: Index;
        constructor(a: Index, b: Index);
    }
    var EdgesXY: number[][];
    var EdgesXZ: number[][];
    var EdgesYZ: number[][];
    var CubeVertices: Index[];
    var CubeEdges: IndexPair[];
    var EdgeIdInfo: {
        i: number;
        j: number;
        k: number;
        e: number;
    }[];
    var EdgeTable: number[];
    var TriTable: number[][];
}
declare namespace LiteMol.Core.Geometry.MolecularSurface {
    interface MolecularIsoSurfaceParameters {
        exactBoundary?: boolean;
        boundaryDelta?: {
            dx: number;
            dy: number;
            dz: number;
        };
        probeRadius?: number;
        atomRadius?: (i: number) => number;
        density?: number;
        interactive?: boolean;
        smoothingIterations?: number;
    }
    interface MolecularIsoField {
        data: Geometry.MarchingCubes.MarchingCubesParameters;
        bottomLeft: Geometry.LinearAlgebra.ObjectVec3;
        topRight: Geometry.LinearAlgebra.ObjectVec3;
        transform: number[];
        inputParameters: MolecularSurfaceInputParameters;
        parameters: MolecularIsoSurfaceParameters;
    }
    interface MolecularIsoSurfaceGeometryData {
        surface: Surface;
        usedParameters: MolecularIsoSurfaceParameters;
    }
    function createMolecularIsoFieldAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoField>;
    interface MolecularSurfaceInputParameters {
        positions: Core.Structure.PositionTable;
        atomIndices: number[];
        parameters?: MolecularIsoSurfaceParameters;
    }
    function computeMolecularSurfaceAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoSurfaceGeometryData>;
}
declare namespace LiteMol.Core.Structure {
    import DataTable = Utils.DataTable;
    interface Position {
        x: number;
        y: number;
        z: number;
    }
    interface Atom {
        id: number;
        name: string;
        authName: string;
        elementSymbol: string;
        altLoc: string | null;
        occupancy: number;
        tempFactor: number;
        residueIndex: number;
        chainIndex: number;
        entityIndex: number;
        rowIndex: number;
    }
    interface Residue {
        name: string;
        seqNumber: number;
        asymId: string;
        authName: string;
        authSeqNumber: number;
        authAsymId: string;
        insCode: string | null;
        entityId: string;
        isHet: number;
        atomStartIndex: number;
        atomEndIndex: number;
        chainIndex: number;
        entityIndex: number;
        secondaryStructureIndex: number;
    }
    interface Chain {
        asymId: string;
        authAsymId: string;
        entityId: string;
        atomStartIndex: number;
        atomEndIndex: number;
        residueStartIndex: number;
        residueEndIndex: number;
        entityIndex: number;
        sourceChainIndex: number;
        operatorIndex: number;
    }
    interface Entity {
        entityId: string;
        atomStartIndex: number;
        atomEndIndex: number;
        residueStartIndex: number;
        residueEndIndex: number;
        chainStartIndex: number;
        chainEndIndex: number;
        type: Entity.Type;
    }
    namespace Entity {
        type Type = 'polymer' | 'non-polymer' | 'water' | 'unknown';
    }
    interface Bond {
        atomAIndex: number;
        atomBIndex: number;
        type: Bond.Type;
    }
    namespace Bond {
        const enum Type {
            Unknown = 0,
            Single = 1,
            Double = 2,
            Triple = 3,
            Aromatic = 4,
            Metallic = 5,
            Ion = 6,
            Hydrogen = 7,
            DisulfideBridge = 8,
        }
    }
    class ComponentBondInfoEntry {
        id: string;
        map: Utils.FastMap<string, Utils.FastMap<string, Bond.Type>>;
        add(a: string, b: string, order: Bond.Type, swap?: boolean): void;
        constructor(id: string);
    }
    class ComponentBondInfo {
        entries: Utils.FastMap<string, ComponentBondInfoEntry>;
        newEntry(id: string): ComponentBondInfoEntry;
    }
    /**
     * Identifier for a reside that is a part of the polymer.
     */
    class PolyResidueIdentifier {
        asymId: string;
        seqNumber: number;
        insCode: string | null;
        constructor(asymId: string, seqNumber: number, insCode: string | null);
        static areEqual(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]): boolean;
        static compare(a: PolyResidueIdentifier, b: PolyResidueIdentifier): 0 | 1 | -1;
        static compareResidue(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]): 0 | 1 | -1;
    }
    const enum SecondaryStructureType {
        None = 0,
        Helix = 1,
        Turn = 2,
        Sheet = 3,
        AminoSeq = 4,
        Strand = 5,
    }
    class SecondaryStructureElement {
        type: SecondaryStructureType;
        startResidueId: PolyResidueIdentifier;
        endResidueId: PolyResidueIdentifier;
        info: any;
        startResidueIndex: number;
        endResidueIndex: number;
        readonly length: number;
        constructor(type: SecondaryStructureType, startResidueId: PolyResidueIdentifier, endResidueId: PolyResidueIdentifier, info?: any);
    }
    class SymmetryInfo {
        spacegroupName: string;
        cellSize: number[];
        cellAngles: number[];
        toFracTransform: number[];
        isNonStandardCrytalFrame: boolean;
        constructor(spacegroupName: string, cellSize: number[], cellAngles: number[], toFracTransform: number[], isNonStandardCrytalFrame: boolean);
    }
    /**
     * Wraps an assembly operator.
     */
    class AssemblyOperator {
        id: string;
        name: string;
        operator: number[];
        constructor(id: string, name: string, operator: number[]);
    }
    /**
     * Wraps a single assembly gen entry.
     */
    class AssemblyGenEntry {
        operators: string[][];
        asymIds: string[];
        constructor(operators: string[][], asymIds: string[]);
    }
    /**
     * Wraps an assembly generation template.
     */
    class AssemblyGen {
        name: string;
        gens: AssemblyGenEntry[];
        constructor(name: string);
    }
    /**
     * Information about the assemblies.
     */
    class AssemblyInfo {
        operators: {
            [id: string]: AssemblyOperator;
        };
        assemblies: AssemblyGen[];
        constructor(operators: {
            [id: string]: AssemblyOperator;
        }, assemblies: AssemblyGen[]);
    }
    type PositionTable = DataTable<Position>;
    type AtomTable = DataTable<Atom>;
    type ResidueTable = DataTable<Residue>;
    type ChainTable = DataTable<Chain>;
    type EntityTable = DataTable<Entity>;
    type BondTable = DataTable<Bond>;
    /**
     * Default Builders
     */
    namespace Tables {
        const Positions: DataTable.Definition<Position>;
        const Atoms: DataTable.Definition<Atom>;
        const Residues: DataTable.Definition<Residue>;
        const Chains: DataTable.Definition<Chain>;
        const Entities: DataTable.Definition<Entity>;
        const Bonds: DataTable.Definition<Bond>;
    }
    class Operator {
        matrix: number[];
        id: string;
        isIdentity: boolean;
        apply(v: Geometry.LinearAlgebra.ObjectVec3): void;
        static applyToModelUnsafe(matrix: number[], m: Molecule.Model): void;
        constructor(matrix: number[], id: string, isIdentity: boolean);
    }
    interface Molecule {
        readonly properties: Molecule.Properties;
        readonly id: string;
        readonly models: Molecule.Model[];
    }
    namespace Molecule {
        function create(id: string, models: Model[], properties?: Properties): Molecule;
        interface Properties {
            experimentMethod?: string;
        }
        interface Bonds {
            covalent?: BondTable;
            nonCovalent?: BondTable;
            computed?: BondTable;
            readonly component?: ComponentBondInfo;
        }
        interface Model extends Model.Base {
            readonly queryContext: Query.Context;
        }
        namespace Model {
            function create(model: Base): Model;
            enum Source {
                File = 0,
                Computed = 1,
            }
            interface Base {
                readonly id: string;
                readonly modelId: string;
                readonly positions: PositionTable;
                readonly data: Data;
                readonly source: Source;
                readonly parent?: Model;
                readonly operators?: Operator[];
            }
            interface Data {
                readonly atoms: AtomTable;
                readonly residues: ResidueTable;
                readonly chains: ChainTable;
                readonly entities: EntityTable;
                readonly bonds: Bonds;
                readonly secondaryStructure: SecondaryStructureElement[];
                readonly symmetryInfo?: SymmetryInfo;
                readonly assemblyInfo?: AssemblyInfo;
            }
            function withTransformedXYZ<T>(model: Model, ctx: T, transform: (ctx: T, x: number, y: number, z: number, out: Geometry.LinearAlgebra.ObjectVec3) => void): Model;
        }
    }
}
declare namespace LiteMol.Core.Structure {
    class Spacegroup {
        info: Structure.SymmetryInfo;
        private temp;
        private tempV;
        private space;
        private operators;
        readonly operatorCount: number;
        getOperatorMatrix(index: number, i: number, j: number, k: number, target: number[]): number[];
        private getSpace();
        private static getOperator(ids);
        private getOperators();
        constructor(info: Structure.SymmetryInfo);
    }
    namespace SpacegroupTables {
        var Transform: number[][];
        var Operator: number[][];
        var Group: number[][];
        var Spacegroup: {
            [key: string]: number;
        };
    }
}
declare namespace LiteMol.Core.Structure {
    function buildPivotGroupSymmetry(model: Molecule.Model, radius: number, pivotsQuery?: Query.Source): Molecule.Model;
    function buildSymmetryMates(model: Molecule.Model, radius: number): Molecule.Model;
    function buildAssembly(model: Molecule.Model, assembly: AssemblyGen): Molecule.Model;
}
declare namespace LiteMol.Core.Structure {
    /**
     * The query is a mapping from a context to a sequence of fragments.
     */
    type Query = (ctx: Query.Context) => Query.FragmentSeq;
    namespace Query {
        function apply(q: Source, m: Molecule.Model): FragmentSeq;
        type Source = Query | string | Builder;
        /**
         * The context of a query.
         *
         * Stores:
         * - the mask of "active" atoms.
         * - kd-tree for fast geometry queries.
         * - the molecule itself.
         *
         */
        class Context {
            private mask;
            private lazyTree;
            /**
             * Number of atoms in the current context.
             */
            readonly atomCount: number;
            /**
             * Determine if the context contains all atoms of the input model.
             */
            readonly isComplete: boolean;
            /**
             * The structure this context is based on.
             */
            structure: Molecule.Model;
            /**
             * Get a kd-tree for the atoms in the current context.
             */
            readonly tree: Geometry.SubdivisionTree3D<number>;
            /**
             * Checks if an atom is included in the current context.
             */
            hasAtom(index: number): boolean;
            /**
             * Checks if an atom from the range is included in the current context.
             */
            hasRange(start: number, end: number): boolean;
            /**
             * Create a new context based on the provide structure.
             */
            static ofStructure(structure: Molecule.Model): Context;
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofFragments(seq: FragmentSeq): Context;
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofAtomIndices(structure: Molecule.Model, atomIndices: number[]): Context;
            constructor(structure: Molecule.Model, mask: Context.Mask);
            private makeTree();
        }
        namespace Context {
            /**
             * Represents the atoms in the context.
             */
            interface Mask {
                size: number;
                has(i: number): boolean;
            }
            module Mask {
                function ofStructure(structure: Molecule.Model): Mask;
                function ofIndices(structure: Molecule.Model, atomIndices: number[]): Mask;
                function ofFragments(seq: FragmentSeq): Mask;
            }
        }
        /**
         * The basic element of the query language.
         * Everything is represented as a fragment.
         */
        class Fragment {
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
            private _hashCode;
            private _hashComputed;
            /**
             * The hash code of the fragment.
             */
            readonly hashCode: number;
            /**
             * Id composed of <moleculeid>_<tag>.
             */
            readonly id: string;
            /**
             * Number of atoms.
             */
            readonly atomCount: number;
            /**
             * Determines if a fragment is HET based on the tag.
             */
            readonly isHet: any;
            private _fingerprint;
            /**
             * A sorted list of residue identifiers.
             */
            readonly fingerprint: string;
            private _authFingerprint;
            /**
             * A sorted list of residue identifiers.
             */
            readonly authFingerprint: string;
            /**
             * Executes a query on the current fragment.
             */
            find(what: Source): FragmentSeq;
            private _residueIndices;
            private _chainIndices;
            private _entityIndices;
            private computeIndices();
            /**
             * A sorted list of residue indices.
             */
            readonly residueIndices: number[];
            /**
             * A sorted list of chain indices.
             */
            readonly chainIndices: number[];
            /**
             * A sorted list of entity indices.
             */
            readonly entityIndices: number[];
            static areEqual(a: Fragment, b: Fragment): boolean;
            /**
             * Create a fragment from an integer set.
             * Assumes the set is in the given context's mask.
             */
            static ofSet(context: Context, atomIndices: Utils.FastSet<number>): Fragment;
            /**
             * Create a fragment from an integer array.
             * Assumes the set is in the given context's mask.
             * Assumes the array is sorted.
             */
            static ofArray(context: Context, tag: number, atomIndices: Int32Array): Fragment;
            /**
             * Create a fragment from a single index.
             * Assumes the index is in the given context's mask.
             */
            static ofIndex(context: Context, index: number): Fragment;
            /**
             * Create a fragment from a <start,end) range.
             * Assumes the fragment is non-empty in the given context's mask.
             */
            static ofIndexRange(context: Context, start: number, endExclusive: number): Fragment;
            /**
             * Create a fragment from an integer set.
             */
            constructor(context: Context, tag: number, atomIndices: number[]);
        }
        /**
         * A sequence of fragments the queries operate on.
         */
        class FragmentSeq {
            context: Context;
            fragments: Fragment[];
            static empty(ctx: Context): FragmentSeq;
            readonly length: number;
            /**
             * Merges atom indices from all fragments.
             */
            unionAtomIndices(): number[];
            /**
             * Merges atom indices from all fragments into a single fragment.
             */
            unionFragment(): Fragment;
            constructor(context: Context, fragments: Fragment[]);
        }
        /**
         * A builder that includes all fragments.
         */
        class FragmentSeqBuilder {
            private ctx;
            private fragments;
            add(f: Fragment): void;
            getSeq(): FragmentSeq;
            constructor(ctx: Context);
        }
        /**
         * A builder that includes only unique fragments.
         */
        class HashFragmentSeqBuilder {
            private ctx;
            private fragments;
            private byHash;
            add(f: Fragment): this;
            getSeq(): FragmentSeq;
            constructor(ctx: Context);
        }
    }
}
declare namespace LiteMol.Core.Structure.Query {
    interface Builder {
        compile(): Query;
        complement(): Builder;
        ambientResidues(radius: number): Builder;
        wholeResidues(): Builder;
        union(): Builder;
        inside(where: Source): Builder;
        intersectWith(where: Source): Builder;
        flatten(selector: (f: Fragment) => FragmentSeq): Builder;
    }
    namespace Builder {
        const BuilderPrototype: any;
        function registerModifier(name: string, f: Function): void;
        function build(compile: () => Query): Builder;
        function parse(query: string): Query;
        function toQuery(q: Source): Query;
    }
    interface EntityIdSchema {
        entityId?: string;
        type?: string;
    }
    interface AsymIdSchema extends EntityIdSchema {
        asymId?: string;
        authAsymId?: string;
    }
    interface ResidueIdSchema extends AsymIdSchema {
        name?: string;
        seqNumber?: number;
        authName?: string;
        authSeqNumber?: number;
        insCode?: string | null;
    }
    function atomsByElement(...elements: string[]): Builder;
    function atomsByName(...names: string[]): Builder;
    function atomsById(...ids: number[]): Builder;
    function residues(...ids: ResidueIdSchema[]): Builder;
    function chains(...ids: AsymIdSchema[]): Builder;
    function entities(...ids: EntityIdSchema[]): Builder;
    function notEntities(...ids: EntityIdSchema[]): Builder;
    function everything(): Builder;
    function entitiesFromIndices(indices: number[]): Builder;
    function chainsFromIndices(indices: number[]): Builder;
    function residuesFromIndices(indices: number[]): Builder;
    function atomsFromIndices(indices: number[]): Builder;
    function sequence(entityId: string, asymId: string | AsymIdSchema, startId: ResidueIdSchema, endId: ResidueIdSchema): Builder;
    function hetGroups(): Builder;
    function nonHetPolymer(): Builder;
    function polymerTrace(...atomNames: string[]): Builder;
    function cartoons(): Builder;
    function backbone(): Builder;
    function sidechain(): Builder;
    function atomsInBox(min: {
        x: number;
        y: number;
        z: number;
    }, max: {
        x: number;
        y: number;
        z: number;
    }): Builder;
    function or(...elements: Source[]): Builder;
    function complement(q: Source): Builder;
    function ambientResidues(q: Source, radius: number): Builder;
    function wholeResidues(q: Source): Builder;
    function union(q: Source): Builder;
    function inside(q: Source, where: Source): Builder;
    function intersectWith(what: Source, where: Source): Builder;
    function flatten(what: Source, selector: (f: Fragment) => FragmentSeq): Builder;
    /**
     * Shortcuts
     */
    function residuesByName(...names: string[]): Builder;
    function residuesById(...ids: number[]): Builder;
    function chainsById(...ids: string[]): Builder;
    /**
     * Query compilation wrapper.
     */
    namespace Compiler {
        function compileEverything(): (ctx: Context) => FragmentSeq;
        function compileAtoms(elements: string[] | number[], sel: (model: Structure.Molecule.Model) => string[] | number[]): (ctx: Context) => FragmentSeq;
        function compileAtomIndices(indices: number[]): (ctx: Context) => FragmentSeq;
        function compileFromIndices(complement: boolean, indices: number[], tableProvider: (molecule: Structure.Molecule.Model) => {
            atomStartIndex: number[];
            atomEndIndex: number[];
        } & Utils.DataTable<any>): Query;
        function compileAtomRanges(complement: boolean, ids: ResidueIdSchema[], tableProvider: (molecule: Structure.Molecule.Model) => {
            atomStartIndex: number[];
            atomEndIndex: number[];
        } & Utils.DataTable<any>): Query;
        function compileSequence(seqEntityId: string, seqAsymId: string | AsymIdSchema, start: ResidueIdSchema, end: ResidueIdSchema): Query;
        function compileHetGroups(): Query;
        function compileNonHetPolymer(): Query;
        function compileAtomsInBox(min: {
            x: number;
            y: number;
            z: number;
        }, max: {
            x: number;
            y: number;
            z: number;
        }): Query;
        function compileInside(what: Source, where: Source): Query;
        function compileIntersectWith(what: Source, where: Source): Query;
        function compileFilter(what: Source, filter: (f: Fragment) => boolean): Query;
        function compileComplement(what: Source): Query;
        function compileOr(queries: Source[]): (ctx: Context) => FragmentSeq;
        function compileUnion(what: Source): Query;
        function compilePolymerNames(names: string[], complement: boolean): Query;
        function compileAmbientResidues(where: Source, radius: number): (ctx: Context) => FragmentSeq;
        function compileWholeResidues(where: Source): (ctx: Context) => FragmentSeq;
        function compileFlatten(what: Source, selector: (f: Fragment) => FragmentSeq): (ctx: Context) => FragmentSeq;
    }
}
declare namespace LiteMol.Core.Structure.Query.Algebraic {
    type Predicate = (ctx: Context, i: number) => boolean;
    type Selector = (ctx: Context, i: number) => any;
    const not: (a: Predicate) => Predicate;
    const and: (a: Predicate, b: Predicate) => Predicate;
    const or: (a: Predicate, b: Predicate) => Predicate;
    const backbone: Predicate;
    const sidechain: Predicate;
    const equal: (a: Selector, b: Selector) => Predicate;
    const notEqual: (a: Selector, b: Selector) => Predicate;
    const greater: (a: Selector, b: Selector) => Predicate;
    const lesser: (a: Selector, b: Selector) => Predicate;
    const greaterEqual: (a: Selector, b: Selector) => Predicate;
    const lesserEqual: (a: Selector, b: Selector) => Predicate;
    function inRange(s: Selector, a: number, b: number): Predicate;
    /**
     * Selectors
     */
    function value(v: any): Selector;
    const residueSeqNumber: Selector;
    const residueName: Selector;
    const elementSymbol: Selector;
    const atomName: Selector;
    const entityType: Selector;
    /**
     * Query
     */
    function query(p: Predicate): Builder;
}
declare module 'LiteMol-core' {
    import __Core = LiteMol.Core;
    export = __Core;
}
