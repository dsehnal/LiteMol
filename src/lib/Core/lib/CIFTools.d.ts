declare namespace LiteMolCIFTools {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMolCIFTools.Utils {
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
        function forVertex3D<T>(chunkVertexCount?: number): ChunkedArray<number>;
        function forIndexBuffer<T>(chunkIndexCount?: number): ChunkedArray<number>;
        function forTokenIndices<T>(chunkTokenCount?: number): ChunkedArray<number>;
        function forIndices<T>(chunkTokenCount?: number): ChunkedArray<number>;
        function forInt32<T>(chunkSize?: number): ChunkedArray<number>;
        function forFloat32<T>(chunkSize?: number): ChunkedArray<number>;
        function forArray<T>(chunkSize?: number): ChunkedArray<T>;
        function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ChunkedArray<T>;
    }
}
/**
 * Efficient integer and float parsers.
 *
 * For the purposes of parsing numbers from the mmCIF data representations,
 * up to 4 times faster than JS parseInt/parseFloat.
 */
declare namespace LiteMolCIFTools.Utils.FastNumberParsers {
    function parseIntSkipTrailingWhitespace(str: string, start: number, end: number): number;
    function parseInt(str: string, start: number, end: number): number;
    function parseFloatSkipTrailingWhitespace(str: string, start: number, end: number): number;
    function parseFloat(str: string, start: number, end: number): number;
}
declare namespace LiteMolCIFTools.Utils {
    interface StringWriter {
        chunkData: string[];
        chunkOffset: number;
        chunkCapacity: number;
        data: string[];
    }
    namespace StringWriter {
        function create(chunkCapacity?: number): StringWriter;
        function asString(writer: StringWriter): string;
        function writeTo(writer: StringWriter, stream: OutputStream): void;
        function newline(writer: StringWriter): void;
        function whitespace(writer: StringWriter, len: number): void;
        function write(writer: StringWriter, val: string): void;
        function writeSafe(writer: StringWriter, val: string): void;
        function writePadLeft(writer: StringWriter, val: string, totalWidth: number): void;
        function writePadRight(writer: StringWriter, val: string, totalWidth: number): void;
        function writeInteger(writer: StringWriter, val: number): void;
        function writeIntegerPadLeft(writer: StringWriter, val: number, totalWidth: number): void;
        function writeIntegerPadRight(writer: StringWriter, val: number, totalWidth: number): void;
        /**
         * @example writeFloat(123.2123, 100) -- 2 decim
         */
        function writeFloat(writer: StringWriter, val: number, precisionMultiplier: number): void;
        function writeFloatPadLeft(writer: StringWriter, val: number, precisionMultiplier: number, totalWidth: number): void;
        function writeFloatPadRight(writer: StringWriter, val: number, precisionMultiplier: number, totalWidth: number): void;
    }
}
declare namespace LiteMolCIFTools {
    /**
     * Represents a "CIF FILE" with one or more data blocks.
     */
    interface File {
        dataBlocks: DataBlock[];
        toJSON(): any;
    }
    /**
     * Represents a single CIF data block that contains categories and possibly
     * additonal data such as save frames.
     *
     * Example:
     * data_HEADER
     * _category1.field1
     * ...
     * ...
     * _categoryN.fieldN
     */
    interface DataBlock {
        header: string;
        categories: Category[];
        additionalData: {
            [name: string]: any;
        };
        getCategory(name: string): Category | undefined;
        toJSON(): any;
    }
    /**
     * Represents that CIF category with multiple fields represented as columns.
     *
     * Example:
     * _category.field1
     * _category.field2
     * ...
     */
    interface Category {
        name: string;
        rowCount: number;
        columnCount: number;
        columnNames: string[];
        /**
         * If a field with the given name is not present, returns UndefinedColumn.
         *
         * Columns are accessed by their field name only, i.e.
         * _category.field is accessed by
         * category.getColumn('field')
         *
         * Note that column are created on demand and there is some computational
         * cost when creating a new column. Therefore, if you need to reuse a column,
         * it is a good idea to cache it.
         */
        getColumn(name: string): Column;
        toJSON(): any;
    }
    const enum ValuePresence {
        Present = 0,
        NotSpecified = 1,
        Unknown = 2,
    }
    /**
     * A columns represents a single field of a CIF category.
     */
    interface Column {
        isDefined: boolean;
        getString(row: number): string | null;
        getInteger(row: number): number;
        getFloat(row: number): number;
        getValuePresence(row: number): ValuePresence;
        areValuesEqual(rowA: number, rowB: number): boolean;
        stringEquals(row: number, value: string): boolean;
    }
    const UndefinedColumn: Column;
    /**
     * Helper functions for categoies.
     */
    namespace Category {
        /**
         * Extracts a matrix from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getMatrix(category: Category, field: string, rows: number, cols: number, rowIndex: number): number[][];
        /**
         * Extracts a vector from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getVector(category: Category, field: string, rows: number, cols: number, rowIndex: number): number[];
    }
}
declare namespace LiteMolCIFTools {
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
}
declare namespace LiteMolCIFTools {
    interface FieldDesc<Data> {
        name: string;
        string?: (data: Data, i: number) => string | null;
        number?: (data: Data, i: number) => number;
        typedArray?: any;
        encoder?: Binary.Encoder;
        presence?: (data: Data, i: number) => ValuePresence;
    }
    interface CategoryDesc<Data> {
        name: string;
        fields: FieldDesc<Data>[];
    }
    type CategoryInstance<Data> = {
        data: any;
        count: number;
        desc: CategoryDesc<Data>;
    };
    type CategoryProvider = (ctx: any) => CategoryInstance<any> | undefined;
    type OutputStream = {
        writeString: (data: string) => boolean;
        writeBinary: (data: Uint8Array) => boolean;
    };
    interface Writer<Context> {
        startDataBlock(header: string): void;
        writeCategory(category: CategoryProvider, contexts?: Context[]): void;
        encode(): void;
        flush(stream: OutputStream): void;
    }
}
declare namespace LiteMolCIFTools.Text {
    /**
     * Represents the input file.
     */
    class File implements LiteMolCIFTools.File {
        /**
         * The input string.
         *
         * In JavaScript, the input must always* be a string as there is no support for streams.
         * So since we already have the string in memory, we won't store unnecessary copies of
         * substrings but rather represent individual elements as pairs of <start,end) indices
         * to the data string.
         *
         * * It can also be a typed array buffer, but the point still holds: we need to have the entire
         *   input in memory. And most molecular file formats are text based.
         */
        data: string;
        /**
         * Data blocks inside the file. If no data block is present, a "default" one is created.
         */
        dataBlocks: DataBlock[];
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        }[];
        constructor(data: string);
    }
    /**
     * Represents a single data block.
     */
    class DataBlock implements LiteMolCIFTools.DataBlock {
        private categoryMap;
        private categoryList;
        /**
         * The input mmCIF string (same as file.data)
         */
        data: string;
        /**
         * Header of the data block.
         */
        header: string;
        /**
         * Categories of the block.
         * block.categories._atom_site / ['_atom_site']
         */
        readonly categories: Category[];
        /**
         * Additional data such as save frames for mmCIF file.
         */
        additionalData: {
            [name: string]: any;
        };
        /**
         * Gets a category by its name.
         */
        getCategory(name: string): Category | undefined;
        /**
         * Adds a category.
         */
        addCategory(category: Category): void;
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        };
        constructor(data: string, header: string);
    }
    /**
     * Represents a single CIF category.
     */
    class Category implements LiteMolCIFTools.Category {
        private data;
        private columnIndices;
        private columnNameList;
        /**
         * Name of the category.
         */
        name: string;
        /**
         * The array of columns.
         */
        readonly columnNames: string[];
        /**
         * Number of columns in the category.
         */
        columnCount: number;
        /**
         * Number of rows in the category.
         */
        rowCount: number;
        /**
         * Pairs of (start at index 2 * i, end at index 2 * i + 1) indices to the data string.
         * The "end" character is not included (for it's iterated as for (i = start; i < end; i++)).
         */
        tokens: number[];
        /**
         * Start index of the category in the input string.
         */
        startIndex: number;
        /**
         * Start index of the category in the input string.
         */
        endIndex: number;
        /**
         * Get a column object that makes accessing data easier.
         * @returns undefined if the column isn't present, the Column object otherwise.
         */
        getColumn(name: string): LiteMolCIFTools.Column;
        constructor(data: string, name: string, startIndex: number, endIndex: number, columns: string[], tokens: number[], tokenCount: number);
        toJSON(): {
            name: string;
            columns: string[];
            rows: any[];
        };
    }
    /**
     * Represents a single column of a CIF category.
     */
    class Column implements LiteMolCIFTools.Column {
        private data;
        name: string;
        index: number;
        private tokens;
        private columnCount;
        private rowCount;
        private stringPool;
        isDefined: boolean;
        /**
         * Returns the string value at given row.
         */
        getString(row: number): string | null;
        /**
         * Returns the integer value at given row.
         */
        getInteger(row: number): number;
        /**
         * Returns the float value at given row.
         */
        getFloat(row: number): number;
        /**
         * Returns true if the token has the specified string value.
         */
        stringEquals(row: number, value: string): boolean;
        /**
         * Determines if values at the given rows are equal.
         */
        areValuesEqual(rowA: number, rowB: number): boolean;
        /**
         * Returns true if the value is not defined (. or ? token).
         */
        getValuePresence(row: number): ValuePresence;
        constructor(category: Category, data: string, name: string, index: number);
    }
}
declare namespace LiteMolCIFTools.Text {
    function parse(data: string): ParserResult<LiteMolCIFTools.File>;
}
declare namespace LiteMolCIFTools.Text {
    class Writer<Context> implements LiteMolCIFTools.Writer<Context> {
        private writer;
        private encoded;
        private dataBlockCreated;
        startDataBlock(header: string): void;
        writeCategory(category: CategoryProvider, contexts?: Context[]): void;
        encode(): void;
        flush(stream: OutputStream): void;
        constructor();
    }
}
declare namespace LiteMolCIFTools.Binary.MessagePack {
    function decode(buffer: Uint8Array): any;
}
declare namespace LiteMolCIFTools.Binary.MessagePack {
    function encode(value: any): Uint8Array;
}
declare namespace LiteMolCIFTools.Binary.MessagePack {
    function utf8Write(data: Uint8Array, offset: number, str: string): void;
    function utf8Read(data: Uint8Array, offset: number, length: number): string;
    function utf8ByteCount(str: string): number;
}
declare namespace LiteMolCIFTools.Binary {
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */
    function decode(data: EncodedData): any;
}
declare namespace LiteMolCIFTools.Binary {
    class File implements LiteMolCIFTools.File {
        dataBlocks: DataBlock[];
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        }[];
        constructor(data: EncodedFile);
    }
    class DataBlock implements LiteMolCIFTools.DataBlock {
        private categoryMap;
        private categoryList;
        header: string;
        additionalData: {
            [name: string]: any;
        };
        readonly categories: Category[];
        getCategory(name: string): Category | undefined;
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        };
        constructor(data: EncodedDataBlock);
    }
    class Category implements LiteMolCIFTools.Category {
        private encodedColumns;
        private columnNameList;
        name: string;
        columnCount: number;
        rowCount: number;
        readonly columnNames: string[];
        getColumn(name: string): LiteMolCIFTools.Column;
        toJSON(): {
            name: string;
            columns: string[];
            rows: any[];
        };
        constructor(data: EncodedCategory);
    }
}
declare namespace LiteMolCIFTools.Binary {
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */
    class Encoder {
        private providers;
        and(f: Encoder.Provider): Encoder;
        encode(data: any): EncodedData;
        constructor(providers: Encoder.Provider[]);
    }
    namespace Encoder {
        interface Result {
            encodings: Encoding[];
            data: any;
        }
        type Provider = (data: any) => Result;
        function by(f: Provider): Encoder;
        function byteArray(data: Encoding.FloatArray | Encoding.IntArray): Result;
        function fixedPoint(factor: number): Provider;
        function intervalQuantizaiton(min: number, max: number, numSteps: number, arrayType?: new (size: number) => Encoding.IntArray): Provider;
        function runLength(data: Encoding.IntArray): Result;
        function delta(data: Int8Array | Int16Array | Int32Array): Result;
        /**
         * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
         */
        function integerPacking(data: Int32Array): Result;
        function stringArray(data: string[]): Result;
    }
}
declare namespace LiteMolCIFTools.Binary {
    const VERSION = "0.3.0";
    type Encoding = Encoding.ByteArray | Encoding.FixedPoint | Encoding.RunLength | Encoding.Delta | Encoding.IntervalQuantization | Encoding.IntegerPacking | Encoding.StringArray;
    interface EncodedFile {
        version: string;
        encoder: string;
        dataBlocks: EncodedDataBlock[];
    }
    interface EncodedDataBlock {
        header: string;
        categories: EncodedCategory[];
    }
    interface EncodedCategory {
        name: string;
        rowCount: number;
        columns: EncodedColumn[];
    }
    interface EncodedColumn {
        name: string;
        data: EncodedData;
        /**
         * The mask represents the presence or absent of particular "CIF value".
         * If the mask is not set, every value is present.
         *
         * 0 = Value is present
         * 1 = . = value not specified
         * 2 = ? = value unknown
         */
        mask?: EncodedData;
    }
    interface EncodedData {
        encoding: Encoding[];
        data: Uint8Array;
    }
    namespace Encoding {
        const enum IntDataType {
            Int8 = 1,
            Int16 = 2,
            Int32 = 3,
            Uint8 = 4,
            Uint16 = 5,
            Uint32 = 6,
        }
        const enum FloatDataType {
            Float32 = 32,
            Float64 = 33,
        }
        type DataType = IntDataType | FloatDataType;
        type IntArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array;
        type FloatArray = Float32Array | Float64Array;
        function getDataType(data: IntArray | FloatArray): DataType;
        function isSignedIntegerDataType(data: IntArray): boolean;
        interface ByteArray {
            kind: 'ByteArray';
            type: DataType;
        }
        interface FixedPoint {
            kind: 'FixedPoint';
            factor: number;
            srcType: FloatDataType;
        }
        interface IntervalQuantization {
            kind: 'IntervalQuantization';
            min: number;
            max: number;
            numSteps: number;
            srcType: FloatDataType;
        }
        interface RunLength {
            kind: 'RunLength';
            srcType: IntDataType;
            srcSize: number;
        }
        interface Delta {
            kind: 'Delta';
            origin: number;
            srcType: IntDataType;
        }
        interface IntegerPacking {
            kind: 'IntegerPacking';
            byteCount: number;
            isUnsigned: boolean;
            srcSize: number;
        }
        interface StringArray {
            kind: 'StringArray';
            dataEncoding: Encoding[];
            stringData: string;
            offsetEncoding: Encoding[];
            offsets: Uint8Array;
        }
    }
}
declare namespace LiteMolCIFTools.Binary {
    function parse(data: ArrayBuffer): ParserResult<LiteMolCIFTools.File>;
}
declare namespace LiteMolCIFTools.Binary {
    class Writer<Context> implements LiteMolCIFTools.Writer<Context> {
        private data;
        private dataBlocks;
        private encodedData;
        startDataBlock(header: string): void;
        writeCategory(category: CategoryProvider, contexts?: Context[]): void;
        encode(): void;
        flush(stream: OutputStream): void;
        constructor(encoder: string);
    }
}