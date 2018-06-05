/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    export type DataTable<Schema> = DataTable.Base<Schema> & DataTable.Columns<Schema>

    export module DataTable { 
        export type Definition<Schema> = { [T in keyof Schema]: ((size: number) => Schema[T][]) | undefined }

        export type Columns<Schema> = { readonly [P in keyof Schema]: Schema[P][]; }

        export interface ColumnDescriptor<Schema> {
            name: keyof Schema, 
            creator: (size: number) => any
        }

        export type TypedArrayContructor = 
            Float32ArrayConstructor | Float64ArrayConstructor 
            | Int32ArrayConstructor | Uint32ArrayConstructor
            | Int16ArrayConstructor | Uint16ArrayConstructor
            | Int8ArrayConstructor | Uint8ArrayConstructor

        export function typedColumn(t: TypedArrayContructor): (size: number) => number[] {
            return size => <any>new t(size) as number[];
        }

        export function customColumn<T>(): (size: number) => T[] {
            return size => new Array(size) as T[];
        }

        export const stringColumn: (size: number) => string[] = size => new Array(size);
        export const stringNullColumn: (size: number) => (string | null)[] = size => new Array(size);

        export interface Base<Schema> {
            count: number,
            indices: number[],
            columns: ColumnDescriptor<Schema>[],
            getBuilder(count: number): Builder<Schema>,
            getRawData(): any[][],
            /**
             * Get a MUTABLE representation of a row.
             * Calling getRow() with differnt 'i' will change update old reference.
             */
            getRow(i: number): Schema
        }

        export interface Builder<Schema> {
            count: number,
            columns: ColumnDescriptor<Schema>[],
            addColumn<T>(name: keyof Schema, creator: (size: number) => T): T,
            addRawColumn<T>(name: keyof Schema, creator: (size: number) => T, data: T): T,
            getRawData(): any[][],

            /**
             * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine 
             * use internal class instead of dictionary representation.
             */
            seal(): DataTable<Schema>
        }

        export function builder<Schema>(count: number): Builder<Schema> {
            return new BuilderImpl(count) as Builder<Schema>;
        }

        export function ofDefinition<Schema>(definition: Definition<Schema>, count: number) {
            let builder = DataTable.builder<Schema>(count);
            for (let k of Object.keys(definition)) {
                if (!Object.prototype.hasOwnProperty.call(definition, k)) continue;
                let col = (definition as any)[k];
                if (col) {
                    builder.addColumn(k as any, col);
                }
            }
            return builder.seal();
        }

        function rowReader(table: Base<any>, indexer: { index: number }) {
            let row = Object.create(null);
            for (let _c of table.columns) {
                (function(c: ColumnDescriptor<any>, row: any, idx: { index: number }, data: any[]) {                        
                    Object.defineProperty(row, c.name, { enumerable: true, configurable: false, get: function() { return data[idx.index] } });
                })(_c, row, indexer, (table as any)[_c.name]);
            }
            return row;
        }

        class TableImpl implements Base<any> {
            private __row: any;
            private __rowIndexer: { index: number } = { index: 0 };

            count: number;

            /*
            * Indices <0 .. count - 1>
            */
            indices: number[];
            columns: ColumnDescriptor<any>[];
            
            getBuilder(count: number): Builder<any> {
                let b = new BuilderImpl(count);
                for (let c of this.columns) {
                    b.addColumn(c.name as string, c.creator);
                }
                return b;
            }

            getRawData(): any[][] {
                return this.columns.map(c => (<any>this)[c.name]);
            }

            getRow(i: number): any {
                this.__rowIndexer.index = i;
                return this.__row;
            }

            constructor(count: number, srcColumns: ColumnDescriptor<any>[], srcData: { [name: string]: any }) {
                this.count = count;
                this.indices = <any>new Int32Array(count);
                this.columns = [];

                for (let i = 0; i < count; i++) {
                    this.indices[i] = i;
                }

                for (let col of srcColumns) {
                    let data = srcData[col.name as string];
                    if (Utils.ChunkedArray.is(data)) {
                        data = Utils.ChunkedArray.compact(data);
                    }
                    Object.defineProperty(this, col.name, { enumerable: true, configurable: false, writable: false, value: data });
                    this.columns[this.columns.length] = col;
                }

                this.__row = rowReader(this, this.__rowIndexer);
            }
        }

        class BuilderImpl implements Builder<any> {
            count: number;

            columns: ColumnDescriptor<any>[] = [];

            addColumn<T>(name: string, creator: (size: number) => T): T {
                let c = creator(this.count);
                Object.defineProperty(this, name, { enumerable: true, configurable: false, writable: false, value: c });
                this.columns[this.columns.length] = { name, creator };
                return c;
            }

            addRawColumn<T>(name: string, creator: (size: number) => T, data: T): T {
                let c = data;
                Object.defineProperty(this, name, { enumerable: true, configurable: false, writable: false, value: c });
                this.columns[this.columns.length] = { name, creator };
                return c;
            }

            getRawData(): any[][] {
                return this.columns.map(c => (<any>this)[c.name]);
            }

            /**
             * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine 
             * use internal class instead of dictionary representation.
             */
            seal(): DataTable<any> {
                return new TableImpl(this.count, this.columns, this) as any;
            }

            constructor(count: number) {
                this.count = count;
            }
        }
    }
}