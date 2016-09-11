/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

/*
    On data representation of molecular files

    Consider an mmCIF file that stores a molecule with 100k atoms. For the sake of simplicity, 
    lets ignore things like symmetry or assemblies, and assume, that the file only stores the 
    _atom_site records. The atom site "table" in the standard mmCIF from PDB database currently 
    has 26 columns.

    So the data looks something like this:

        loop_
        _atom_site.column1
        ....
        _atom_site.column26
        t1,1 .... t1,26
        t100000,1 .... t100000,26

    The straightforward way to represent this data in JavaScript is to have an array of objects 
    with properties named "column1" ..., "column26":

        [{ column1: "t1,1", ..., column26: "t1,26" }, 
          ..., 
         { column1: "t100000,1", ..., column26: "t100000,26" }]

    So in order to represent the atoms sites, we would need 100k objects and 2.6 million strings. 
    Is this bad? well, sort of. It would not be so bad if this representation would be the only 
    thing we need to keep in memory and/or the life time of the object was short. But usually 
    we would need to keep the object around for the entire lifetime of the app. This alone 
    adds a very non-significant overhead for the garbage collector (which increases the app's 
    latency). What's worse is that we usually only need a fraction of this data, but this can 
    vary application for application. For just 100k atoms, the overhead is not "that bad", but 
    consider 1M atoms and suddenly we have a problem.

    The following data model shows an alternative way of storing molecular file s
    in memory that is very efficient, fast and introduces a very minimal overhead.

 */

namespace LiteMol.Core.Formats.CIF {
    "use strict";

    import ShortStringPool = Formats.ShortStringPool;
            
    /**
     * Represents the input file.
     */
    export class File {
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
        dataBlocks: Block[];

        /**
         * Adds a block.
         */
        addBlock(block: Block) {
            this.dataBlocks[this.dataBlocks.length] = block;
        }

        toJSON() {
            return this.dataBlocks.map(b => b.toJSON());
        }

        constructor(data: string) {
            this.data = data;
            this.dataBlocks = [];
        }
    }

    /**
     * Represents a single data block.
     */
    export class Block {
        
        private categoryMap: { [name: string]: Category };

        /**
         * The "file" the data block is in.
         */
        file: File;

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
         */
        categoryList: Category[];

        /**
         * Categories of the block.
         * block.categories._atom_site / ['_atom_site']
         */
        get categories() {
            return this.categoryMap;
        }

        /**
         * Additional data such as save frames for mmCIF file.
         */
        additionalData: { [name: string]: any };
        
        /**
         * Adds a category.
         */
        addCategory(category: Category) {
            this.categoryList[this.categoryList.length] = category;
            this.categoryMap[category.name] = category;
        }

        /**
         * Gets a category by its name.
         */
        getCategory(name: string) {
            return this.categoryMap[name];
        }

        /**
         * Determines if a given category is present.
         */
        hasCategory(name: string) {
            return this.categoryMap[name] !== void 0;
        }

        toJSON() {
            return {
                id: this.header,
                categories: this.categoryList.map(c => c.toJSON()),
                additionalData: this.additionalData
            };
        }

        constructor(file: File, header: string) {
            this.file = file;
            this.header = header;
            this.data = file.data;
            this.categoryList = [];
            this.additionalData = { };
            this.categoryMap = {};
        }
    }
    
    /**
     * A context for easy (but slower) querying of category data.
     */
    export class CategoryQueryRowContext {
        category: Category;
        rowNumber: number;

        /**
         * Get a string value of the row.
         */
        getString(column: string) {
            return this.category.getStringValue(column, this.rowNumber);
        }

        /**
         * Get an integer value of the row.
         */
        getInt(column: string) {
            return this.category.getIntValue(column, this.rowNumber);
        }

        /**
         * Get a float value of the row.
         */
        getFloat(column: string) {
            return this.category.getFloatValue(column, this.rowNumber);
        }

        constructor(category: Category, rowNumber: number) {
            this.category = category;
            this.rowNumber = rowNumber;
        }
    }

    /**
     * Represents a single column of a CIF category.
     */
    export interface IColumn {

        /**
         * Returns the raw string value at given row.
         */
        getRaw(row: number): string;

        /**
         * Returns the string value at given row.
         */
        getString(row: number): string;

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
         * Returns true if the value is not defined (. or ? token).
         */
        isUndefined(row: number):boolean;
    }

    /**
     * Represents a single column of a CIF category.
     */
    export class Column implements IColumn {

        /**
         * Returns the raw string value at given row.
         */
        getRaw(row: number): string {
            return this.category.getRawValueFromIndex(this.index, row);
        }

        /**
         * Returns the string value at given row.
         */
        getString(row: number): string {
            return this.category.getStringValueFromIndex(this.index, row);
        }

        /**
         * Returns the integer value at given row.
         */
        getInteger(row: number): number {
            return this.category.getIntValueFromIndex(this.index, row);
        }

        /**
         * Returns the float value at given row.
         */
        getFloat(row: number): number {
            return this.category.getFloatValueFromIndex(this.index, row);
        }

        /**
         * Returns true if the token has the specified string value.
         */
        stringEquals(row: number, value: string) {
            return this.category.valueEqual(this.index, row, value);
        }

        /**
         * Returns true if the value is not defined (. or ? token).
         */
        isUndefined(row: number) {
            return this.category.isValueUndefinedFromIndex(this.index, row);
        }

        constructor(private category: Category, public name: string, public index: number) {
        }
    }

    /**
     * Represents a single column of a CIF category that has all values undefined.
     */
    class UndefinedColumn implements IColumn {
        getRaw(row: number): string { return '.'; };
        getString(row: number): string { return null; };
        getInteger(row: number): number { return 0; }
        getFloat(row: number): number { return 0.0; }
        stringEquals(row: number, value: string):boolean { return value === null; }
        isUndefined(row: number) { return true; }
    }
    const UndefinedColumnInstance = new UndefinedColumn();

    /**
     * Represents a single CIF category.
     */
    export class Category {
        private data: string;
        private columnIndices: { [name: string]: number };
        private columnWrappers: { [name: string]: Column };
        private shortColumnWrappers: { [name: string]: Column };
        private _columnArray: Column[];
        
        /**
         * Name of the category.
         */
        name: string;

        /**
         * The column names of the category.
         * Includes the full name, i.e. _namespace.columns.
         */
        columnNames: string[];

        /**
         * The column wrappers used to access the colummns.
         * Can be accessed for example as category.columns.id.
         */
        get columns() {
            return this.shortColumnWrappers;
        }
        
        /**
         * The array of column wrappers used to access the colummns.
         */
        get columnArray() {
            return this._columnArray;
        }
        
        /**
         * Number of columns in the category.
         */
        columnCount: number;

        /**
         * Number of rows in the category.
         */
        rowCount: number;

        /**
         * Number of tokens.
         */
        tokenCount: number;

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
         * Compute the token index.
         */
        getTokenIndex(row: number, columnIndex: number) {
            return row * this.columnCount + columnIndex;
        }
        
        /**
         * Get index of a columns.
         * @returns -1 if the column isn't present, the index otherwise.
         */
        getColumnIndex(name: string) {
            let idx = this.columnIndices[name];
            if (idx !== undefined) return idx;
            return -1;
        }

        /**
         * Get a column object that makes accessing data easier.
         * @returns undefined if the column isn't present, the Column object otherwise.
         */
        getColumn(name: string): IColumn {
            return this.columnWrappers[name] || UndefinedColumnInstance;
        }

        /**
         * Updates the range of the token given by the column and row.
         */
        updateTokenRange(columnIndex: number, row: number, token: { start: number; end: number }) {
            let offset = 2 * (row * this.columnCount + columnIndex);
            token.start = this.tokens[offset];
            token.end = this.tokens[offset + 1];
        }

        /**
         * Updates the range of the token given by its index.
         */
        updateTokenIndexRange(tokenIndex: number, token: { start: number; end: number }) {
            token.start = this.tokens[2 * tokenIndex];
            token.end = this.tokens[2 * tokenIndex + 1];
        }

        /**
         * Determines if the token at the given index is . or ?.
         */
        isTokenUndefined(index: number) {            
            let s = this.tokens[2 * index];
            if (this.tokens[2 * index + 1] - s !== 1) return;
            let v = this.data.charCodeAt(s);
            return v === 46 /* . */ || v === 63 /* ? */;
        }

        /**
         * Determines if the token at the given range is . or ?.
         */
        isTokenRangeUndefined(start: number, end: number) {
            if (end - start !== 1) return;
            let v = this.data.charCodeAt(start);
            return v === 46 /* . */ || v === 63 /* ? */;
        }

        /**
         * Determines if a column value is defined (has to be present and not . nor ?).
         */
        isValueUndefined(column: string, row: number = 0) {
            row = row | 0;
            let c = this.getColumnIndex(column);
            if (c < 0) return true;
            return this.isTokenUndefined(row * this.columnCount + c);
        }

        /**
         * Determines if a column value is defined (has to be present and not . nor ?).
         */
        isValueUndefinedFromIndex(columnIndex: number, row: number) {
            row = row | 0;
            if (columnIndex < 0) return true;
            return this.isTokenUndefined(row * this.columnCount + columnIndex);
        }

        /**
         * Returns the length of the given token;
         */
        getTokenLengthFromIndex(columnIndex: number, row: number): number {
            if (columnIndex < 0) return 0;
            let i = (row * this.columnCount + columnIndex) * 2;
            return this.tokens[i + 1] - this.tokens[i];
        }
        
        /**
         * Get a string value from a token at a given index.
         */
        getStringValueFromToken(index: number) {
            let s = this.tokens[2 * index], e = this.tokens[2 * index + 1];
            if (e - s === 1) {
                let v = this.data.charCodeAt(s);
                if (v === 46 /* . */ || v === 63 /* ? */) return null;
            }
            let ret = ShortStringPool.getString(this.data.substring(s, e));
            return ret;
        }

        /**
         * Returns the string value of the column. 
         * @returns null if not present or ./?.
         */
        getStringValue(column: string, row: number = 0): string {
            row = row | 0;
            let col = this.getColumnIndex(column);
            if (col < 0) return null;
            return this.getStringValueFromToken(row * this.columnCount + col);
        }

        /**
         * Returns the string value of the column. 
         * @returns Default if not present or ./?.
         */
        getStringValueOrDefault(column: string, defaultValue: string = "", row: number = 0): string {
            let ret = this.getStringValue(column, row);
            if (!ret) return defaultValue;
            return ret;
        }

        /**
         * Returns the float value of the column. 
         * @returns NaN if not present or ./?.
         */
        getFloatValue(column: string, row: number = 0) : number {
            row = row | 0;
            let col = this.getColumnIndex(column);
            if (col < 0) return NaN;
            let i = (row * this.columnCount + col) * 2,
                s = this.tokens[i], e = this.tokens[i + 1];

            if (e - s === 1) {
                let v = this.data.charCodeAt(s);
                if (v === 46 /* . */ || v === 63 /* ? */) return NaN;
            }

            return Utils.FastNumberParsers.parseFloat(this.data, this.tokens[i], this.tokens[i + 1]);
        }

        /**
         * Returns the float value of the column. 
         * @returns Default if not present or ./?.
         */
        getFloatValueOrDefault(column: string, defaultValue: number = 0, row: number = 0): number {
            let ret = this.getFloatValue(column, row);
            if (isNaN(ret)) return defaultValue;
            return ret;
        }

        /**
         * Returns the integer value of the column. 
         * @returns NaN if not present or ./?.
         */
        getIntValue(column: string, row: number = 0): number {
            row = row | 0;
            let col = this.getColumnIndex(column);
            if (col < 0) return NaN;
            let i = (row * this.columnCount + col) * 2,
                s = this.tokens[i], e = this.tokens[i + 1];

            if (e - s === 1) {
                let v = this.data.charCodeAt(s);
                if (v === 46 /* . */ || v === 63 /* ? */) return NaN;
            }

            return Utils.FastNumberParsers.parseInt(this.data, this.tokens[i], this.tokens[i + 1]);
        }

        /**
          * Returns the float value of the column. 
          * @returns Default if not present or ./?.
          */
        getIntValueOrDefault(column: string, defaultValue: number = 0, row: number = 0): number {
            let ret = this.getIntValue(column, row);
            if (isNaN(ret)) return defaultValue;
            return ret;
        }

        /**
         * Returns the raw value of the column (does not do null check for ./?).
         */
        getRawValueFromIndex(columnIndex: number, row: number): string {
            if (columnIndex < 0) return null;
            let i = (row * this.columnCount + columnIndex) * 2;
            return ShortStringPool.getString(this.data.substring(this.tokens[i], this.tokens[i + 1]));
        }

        /**
         * Returns the string value of the column.
         */
        getStringValueFromIndex(columnIndex: number, row: number): string {
            if (columnIndex < 0) return null;
            let i = (row * this.columnCount + columnIndex) * 2;
            let ret = ShortStringPool.getString(this.data.substring(this.tokens[i], this.tokens[i + 1]));
            if (ret === "." || ret === "?") return null;
            return ret;
        }

        /**
         * Returns the integer value of the column.
         */
        getIntValueFromIndex(columnIndex: number, row: number): number {
            if (columnIndex < 0) return NaN;
            let i = (row * this.columnCount + columnIndex) * 2;
            return Utils.FastNumberParsers.parseInt(this.data, this.tokens[i], this.tokens[i + 1]);
        }

        /**
         * Returns the integer value of the column.
         */
        getFloatValueFromIndex(columnIndex: number, row: number): number {
            if (columnIndex < 0) return NaN;
            let i = (row * this.columnCount + columnIndex) * 2;
            return Utils.FastNumberParsers.parseFloat(this.data, this.tokens[i], this.tokens[i + 1]);
        }

        /**
         * Returns a matrix constructed from a given field: category.field[1..rows][1..cols]
         */
        getMatrix(field: string, rows: number, cols: number, rowIndex: number): number[][] {
            let ret: number[][] = [], row: number[];

            for (let i = 1; i <= rows; i++) {
                row = [];
                for (let j = 1; j <= cols; j++) {
                    let c = field + "[" + i + "][" + j + "]";
                    if (this.isValueUndefined(c, rowIndex)) return undefined;
                    row[j - 1] = this.getFloatValue(c, rowIndex);
                }
                ret[i - 1] = row;
            }

            return ret;
        }

        /**
         * Returns a vector constructed from a given field: category.field[1..rows]
         */
        getVector(field: string, rows: number, cols: number, rowIndex: number): number[] {
            let ret: number[] = [];

            for (let i = 1; i <= rows; i++) {
                let c = field + "[" + i + "]";
                if (this.isValueUndefined(c, rowIndex)) return undefined;
                ret[i - 1] = this.getFloatValue(c, rowIndex);
            }

            return ret;
        }

        getTransform(row: number, matrix: string, vector: string): number[]{
            let ret = Geometry.LinearAlgebra.Matrix4.identity(), i: number, j: number, c: string;
            for (i = 1; i <= 3; i++) {
                for (j = 1; j <= 3; j++) {
                    c = matrix + "[" + i + "][" + j + "]";
                    if (this.isValueUndefined(c, row)) return undefined;
                    Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, j - 1, this.getFloatValue(c, row))
                }
                c = vector + "[" + i + "]";
                Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, 3, this.getFloatValue(c, row))
            }
            return ret;
        }
        
        /**
         * Determines if two tokens have the same string value.
         */
        areTokensEqual(aIndex: number, bIndex: number) {
            let aS = this.tokens[aIndex * 2], bS = this.tokens[bIndex * 2],
                len = this.tokens[aIndex * 2 + 1] - aS;            
            if (len !== this.tokens[bIndex * 2 + 1] - bS) return false;
            for (let i = 0; i < len; i++) {
                if (this.data.charCodeAt(i + aS) !== this.data.charCodeAt(i + bS)) return false;
            }
            return true;
        }

        /**
         * Determines if a token contains a given string.
         */
        tokenEqual(aIndex: number, value: string) {
            let s = this.tokens[aIndex * 2],
                len = value.length;
            if (len !== this.tokens[aIndex * 2 + 1] - s) return false;
            for (let i = 0; i < len; i++) {
                if (this.data.charCodeAt(i + s) !== value.charCodeAt(i)) return false;
            }
            return true;
        }

        /**
         * Determines if a value contains a given string.
         */
        valueEqual(columnIndex: number, row: number, value: string) {
            let aIndex = (row * this.columnCount + columnIndex) * 2,
                s = this.tokens[aIndex],
                len = value.length;
            if (len !== this.tokens[aIndex + 1] - s) return false;
            for (let i = 0; i < len; i++) {
                if (this.data.charCodeAt(i + s) !== value.charCodeAt(i)) return false;
            }
            return true;
        }
        
        /**
         * Maps the rows to an user defined representation.
         * 
         * @example
         *   // returns an array objects with id and type properties.
         *   category.select(row => { id: row.getInt("_entity.id"), type: row.getString("_entity.type") })
         */
        select<T>(selector: (ctx: CategoryQueryRowContext) => T): T[] {
            let ret: T[] = [];

            for (let i = 0; i < this.rowCount; i++) {
                ret[i] = selector(new CategoryQueryRowContext(this, i));
            }

            return ret;
        }

        /**
         * Maps the rows that satisfy a condition to an user defined representation.
         * 
         * @example
         *   // returns entity ids of entities with weight > 1000.
         *   category.selectWhere(
         *     row => row.getFloat("_entity.weight") > 1000,
         *     row => row.getInt("_entity.id"))
         */
        selectWhere<T>(condition: (ctx: CategoryQueryRowContext) => boolean, selector: (ctx: CategoryQueryRowContext) => T): T[] {
            let ret: T[] = [];

            for (let i = 0; i < this.rowCount; i++) {
                let ctx = new CategoryQueryRowContext(this, i);
                if (condition(ctx)) {
                    ret[ret.length] = selector(ctx);
                }
            }

            return ret;
        }
        
        constructor(
            data: string, name: string,
            startIndex: number, endIndex: number,
            columns: string[], tokens: number[], tokenCount: number) {
            this.name = name;
            this.columnNames = columns;
            this.tokens = tokens;
            this.data = data;

            this.startIndex = startIndex;
            this.endIndex = endIndex;

            this.columnCount = this.columnNames.length;
            this.rowCount = (tokenCount / this.columnNames.length) | 0;  //((this.tokens.length / 2) / this.columns.length) | 0;
            this.tokenCount = tokenCount;

            this.columnIndices = {};
            this.columnWrappers = {};
            this._columnArray = [];
            this.shortColumnWrappers = {};
            for (let i = 0; i < this.columnNames.length; i++) {
                this.columnIndices[this.columnNames[i]] = i;
                let col = new Column(this, this.columnNames[i], i);
                this.columnWrappers[this.columnNames[i]] = col;
                this.shortColumnWrappers[this.columnNames[i].substr(name.length + 1)] = col;
                this._columnArray[i] = col; 
            }
        }
        
        toJSON(): any {
            let rows: any[] = [],
                data = this.data, tokens = this.tokens;
            
            let colNames = this.columnNames.map(c => c.substr(this.name.length + 1));
            
            for (let i = 0; i < this.rowCount; i++) {
                let item:any = {};
                for (let j = 0; j < this.columnCount; j++) {
                    let tk = (i * this.columnCount + j) * 2;                    
                    item[<any>colNames[j]] = ShortStringPool.getString(data.substring(tokens[tk], tokens[tk + 1]));
                }
                rows[i] = item;
            }

            return { name: this.name, columns: colNames, rows };
        }
    }    
} 