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

namespace LiteMol.Core.Formats.CIF.Text {
    "use strict";

    import ShortStringPool = Formats.ShortStringPool;
            
    /**
     * Represents the input file.
     */
    export class File implements CIF.File {
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
        dataBlocks: DataBlock[] = [];

        toJSON() {
            return this.dataBlocks.map(b => b.toJSON());
        }

        constructor(data: string) {
            this.data = data;
        }
    }

    /**
     * Represents a single data block.
     */
    export class DataBlock implements CIF.DataBlock {
        
        private categoryMap: { [name: string]: Category };
        private categoryList: Category[];

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
        get categories() {
            return this.categoryList;
        }

        /**
         * Additional data such as save frames for mmCIF file.
         */
        additionalData: { [name: string]: any };
        
        /**
         * Gets a category by its name.
         */
        getCategory(name: string) {
            return this.categoryMap[name];
        }

        /**
         * Adds a category.
         */
        addCategory(category: Category) {
            this.categoryList[this.categoryList.length] = category;
            this.categoryMap[category.name] = category;
        }

        toJSON() {
            return {
                id: this.header,
                categories: this.categoryList.map(c => c.toJSON()),
                additionalData: this.additionalData
            };
        }        

        constructor(data: string, header: string) {
            this.header = header;
            this.data = data;
            this.categoryList = [];
            this.additionalData = { };
            this.categoryMap = {};
        }
    }

    /**
     * Represents a single CIF category.
     */
    export class Category implements CIF.Category {
        private data: string;
        private columnWrappers: { [name: string]: Column };
        private columnNameList: string[];
        
        /**
         * Name of the category.
         */
        name: string;
        
        /**
         * The array of columns.
         */
        get columnNames() {
            return this.columnNameList;
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
        getColumn(name: string): CIF.Column {
            return <CIF.Column>this.columnWrappers[name] || CIF.UndefinedColumn;
        }
                      
        constructor(
            data: string, name: string,
            startIndex: number, endIndex: number,
            columns: string[], tokens: number[], tokenCount: number) {
            this.name = name;
            this.tokens = tokens;
            this.data = data;

            this.startIndex = startIndex;
            this.endIndex = endIndex;

            this.columnCount = columns.length;
            this.rowCount = (tokenCount / columns.length) | 0; 

            this.columnWrappers = {};
            this.columnNameList = [];
            for (let i = 0; i < columns.length; i++) {
                let colName = columns[i].substr(name.length + 1);
                let col = new Column(this, data, colName, i);
                this.columnWrappers[colName] = col; 
                this.columnNameList.push(colName);
            }
        }
        
        toJSON() {
            let rows: any[] = [],
                data = this.data, tokens = this.tokens;
            
            let colNames = this.columnNameList;
            let strings = ShortStringPool.create();
            
            for (let i = 0; i < this.rowCount; i++) {
                let item:any = {};
                for (let j = 0; j < this.columnCount; j++) {
                    let tk = (i * this.columnCount + j) * 2;                    
                    item[<any>colNames[j]] = ShortStringPool.get(strings, data.substring(tokens[tk], tokens[tk + 1]));
                }
                rows[i] = item;
            }

            return { name: this.name, columns: colNames, rows };
        }
    }    

    import fastParseInt = Utils.FastNumberParsers.parseInt
    import fastParseFloat = Utils.FastNumberParsers.parseFloat 
    
    /**
     * Represents a single column of a CIF category.
     */
    export class Column implements CIF.Column {

        private tokens: number[];
        private columnCount: number;
        private rowCount: number;
        private stringPool = ShortStringPool.create();

        isDefined = true;

        /**
         * Returns the string value at given row.
         */
        getString(row: number): string | null {
            let i = (row * this.columnCount + this.index) * 2;
            let ret = ShortStringPool.get(this.stringPool, this.data.substring(this.tokens[i], this.tokens[i + 1]));
            if (ret === "." || ret === "?") return null;
            return ret;
        }

        /**
         * Returns the integer value at given row.
         */
        getInteger(row: number): number {
            let i = (row * this.columnCount + this.index) * 2;
            return fastParseInt(this.data, this.tokens[i], this.tokens[i + 1]);
        }

        /**
         * Returns the float value at given row.
         */
        getFloat(row: number): number {
            let i = (row * this.columnCount + this.index) * 2;
            return fastParseFloat(this.data, this.tokens[i], this.tokens[i + 1]);
        }

        /**
         * Returns true if the token has the specified string value.
         */
        stringEquals(row: number, value: string) {
            let aIndex = (row * this.columnCount + this.index) * 2,
                s = this.tokens[aIndex],
                len = value.length;
            if (len !== this.tokens[aIndex + 1] - s) return false;
            for (let i = 0; i < len; i++) {
                if (this.data.charCodeAt(i + s) !== value.charCodeAt(i)) return false;
            }
            return true;
        }
    
        /**
         * Determines if values at the given rows are equal.
         */
        areValuesEqual(rowA: number, rowB: number): boolean {
            let aIndex = (rowA * this.columnCount + this.index) * 2, bIndex = (rowB * this.columnCount + this.index) * 2;
            let aS = this.tokens[aIndex], bS = this.tokens[bIndex],
                len = this.tokens[aIndex + 1] - aS;            
            if (len !== this.tokens[bIndex + 1] - bS) return false;
            for (let i = 0; i < len; i++) {
                if (this.data.charCodeAt(i + aS) !== this.data.charCodeAt(i + bS)) {
                    return false;
                }
            }
            return true;
        }

        /**
         * Returns true if the value is not defined (. or ? token).
         */
        getValuePresence(row: number) {
            let index = row * this.columnCount + this.index;
            let s = this.tokens[2 * index];
            if (this.tokens[2 * index + 1] - s !== 1) return ValuePresence.Present;
            let v = this.data.charCodeAt(s);
            if (v === 46 /* . */) return ValuePresence.NotSpecified;
            if (v === 63 /* ? */) return ValuePresence.Unknown;
            return ValuePresence.Present;
        }

        constructor(category: Category, private data: string, public name: string, public index: number) {
            this.tokens = category.tokens;
            this.columnCount = category.columnCount;
        }
    }
} 