/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Binary {
    "use strict";

    export class File implements CIF.File {

        dataBlocks: DataBlock[];

        toJSON() {
            return this.dataBlocks.map(b => b.toJSON());
        }

        constructor(data: EncodedFile) {
            this.dataBlocks = data.dataBlocks.map(b => new DataBlock(b));
        }
    }

    export class DataBlock implements CIF.DataBlock {
        private categoryMap: { [name: string]: Category };
        private categoryList: Category[];
        
        header: string;
        additionalData: { [name: string]: any } = { }
        get categories() { return this.categoryList; }
        getCategory(name: string) { return this.categoryMap[name]; }

        toJSON() {
            return {
                id: this.header,
                categories: this.categoryList.map(c => c.toJSON()),
                additionalData: this.additionalData
            };
        }

        constructor(data: EncodedDataBlock) {
            this.header = data.header;
            this.categoryList = data.categories.map(c => new Category(c));
            this.categoryMap = {};
            for (let c of this.categoryList) {
                this.categoryMap[c.name] = c;
            }
        }
    } 

    export class Category implements CIF.Category {
        private encodedColumns: { [name: string]: EncodedColumn };
        private columnWrappers: { [name: string]: Column | null };
        private columnNameList: string[];

        name: string;
        columnCount: number;
        rowCount: number;

        get columnNames() { return this.columnNameList; }

        getColumn(name: string): CIF.Column {
            let c = this.columnWrappers[name];
            if (c) return c;
            let w = this.encodedColumns[name];
            if (w) {
                c = wrapColumn(w);
                this.columnWrappers[name] = c;
                return c;
            }            
            return CIF.UndefinedColumn;
        }

        toJSON() {
            let rows: any[] = [];
            let columns = this.columnNameList.map(name => ({ name, column: this.getColumn(name) }));

            for (let i = 0; i < this.rowCount; i++) {
                let item: any = {};
                for (let c of columns) {
                    let d = c.column.getValuePresence(i);
                    if (d === ValuePresence.Present) item[c.name] = c.column.getString(i);
                    else if (d === ValuePresence.NotSpecified) item[c.name] = '.';
                    else item[c.name] = '?';
                }
                rows[i] = item;
            } 
            return { name: this.name, columns: this.columnNames, rows };
        }

        constructor(data: EncodedCategory) {
            this.name = data.name;
            this.columnCount = data.columns.length;
            this.rowCount = data.rowCount;
            this.columnNameList = [];
            this.encodedColumns = {};
            this.columnWrappers = {};

            for (let c of data.columns) {
                this.encodedColumns[c.name] = c;
                this.columnWrappers[c.name] = null;
                this.columnNameList.push(c.name);
            }
        }
    }

    function wrapColumn(column: EncodedColumn): Column {
        if (!column.data.data) return UndefinedColumn;
        let data = decode(column.data);
        let mask:Uint8Array|undefined = void 0;
        if (column.mask) mask = decode(column.mask);
        if (data.buffer && data.byteLength && data.BYTES_PER_ELEMENT) {
            return mask ? new MaskedNumericColumn(data, mask) : new NumericColumn(data);
        } 
        return mask ? new MaskedStringColumn(data, mask) : new StringColumn(data);
    }

    class NumericColumn implements Column {
        isDefined = true;
        getString(row: number): string { return `${this.data[row]}`; }
        getInteger(row: number): number { return this.data[row] | 0; }
        getFloat(row: number): number { return 1.0 * this.data[row]; }
        stringEquals(row: number, value: string) { return this.data[row] === Utils.FastNumberParsers.parseFloat(value, 0, value.length); }
        areValuesEqual(rowA: number, rowB: number) { return this.data[rowA] === this.data[rowB]; }
        getValuePresence(row: number) { return ValuePresence.Present; }
        constructor(private data: any) { }
    } 

    class MaskedNumericColumn implements Column {
        isDefined = true;
        getString(row: number): string | null { return this.mask[row] === ValuePresence.Present ? `${this.data[row]}` : null; }
        getInteger(row: number): number { return this.mask[row] === ValuePresence.Present ? this.data[row] : 0; }
        getFloat(row: number): number { return this.mask[row] === ValuePresence.Present ? this.data[row] : 0; }
        stringEquals(row: number, value: string) { return this.mask[row] === ValuePresence.Present ? this.data[row] === Utils.FastNumberParsers.parseFloat(value, 0, value.length) : value === null || value === void 0; }
        areValuesEqual(rowA: number, rowB: number) { return this.data[rowA] === this.data[rowB]; }
        getValuePresence(row: number): ValuePresence { return this.mask[row]; }
        constructor(private data: any, private mask: Uint8Array) { }
    }

    import fastParseInt = Utils.FastNumberParsers.parseInt
    import fastParseFloat = Utils.FastNumberParsers.parseFloat 

    class StringColumn implements Column {
        isDefined = true;
        getString(row: number): string | null { return this.data[row]; }
        getInteger(row: number): number { let v = this.data[row]; return fastParseInt(v, 0, v.length); }
        getFloat(row: number): number { let v = this.data[row]; return fastParseFloat(v, 0, v.length); }
        stringEquals(row: number, value: string) { return this.data[row] === value; }
        areValuesEqual(rowA: number, rowB: number) { return this.data[rowA] === this.data[rowB]; }
        getValuePresence(row: number) { return ValuePresence.Present; }
        constructor(private data: string[]) { }
    } 

    class MaskedStringColumn implements Column {
        isDefined = true;
        getString(row: number): string | null { return this.mask[row] === ValuePresence.Present ? this.data[row] : null; }
        getInteger(row: number): number { if (this.mask[row] !== ValuePresence.Present) return 0; let v = this.data[row]; return fastParseInt(v || '', 0, (v || '').length); }
        getFloat(row: number): number { if (this.mask[row] !== ValuePresence.Present) return 0; let v = this.data[row]; return fastParseFloat(v || '', 0, (v || '').length); }
        stringEquals(row: number, value: string) { return this.data[row] === value; }
        areValuesEqual(rowA: number, rowB: number) { return this.data[rowA] === this.data[rowB]; }
        getValuePresence(row: number): ValuePresence { return this.mask[row]; }
        constructor(private data: any, private mask: Uint8Array) { }
    }
}