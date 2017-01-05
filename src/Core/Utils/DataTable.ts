/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    export type DataTable<Schema> = DataTable.Base<Schema> & { [P in keyof Schema]: Schema[P][]; }

    export module DataTable {        
        export interface ColumnDescriptor {
            name: string, 
            creator: (size: number) => any
        }

        export interface Base<Schema> {
            count: number,
            indices: number[],
            columns: ColumnDescriptor[],
            getBuilder(count: number): Builder,
            getRawData(): any[][],
            getRow(i: number): Schema;
        }

        export interface Builder {
            count: number,
            columns: ColumnDescriptor[],
            addColumn<T>(name: string, creator: (size: number) => T): T,
            getRawData(): any[][],

            /**
             * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine 
             * use internal class instead of dictionary representation.
             */
            seal<Schema>(): DataTable<Schema>
        }

        export function createBuilder(count: number): Builder {
            return new BuilderImpl(count);
        }

        class Row  {
            public __index: number = 0;
            constructor(table: Base<any>) {
                for (let _c of table.columns) {
                    (function(c: ColumnDescriptor, el: Row, data: any[]) {                        
                        Object.defineProperty(el, c.name, { enumerable: true, configurable: false, writable: false, get: function() { return data[el.__index] } });
                    })(_c, this, (table as any)[_c.name]);
                }
            }
        }

        class TableImpl implements Base<any> {
            private __row: Row;

            count: number;

            /*
            * Indices <0 .. count - 1>
            */
            indices: number[];
            columns: ColumnDescriptor[];
            
            getBuilder(count: number): Builder {
                let b = new BuilderImpl(count);
                for (let c of this.columns) {
                    b.addColumn(c.name, c.creator);
                }
                return b;
            }

            getRawData(): any[][] {
                return this.columns.map(c => (<any>this)[c.name]);
            }

            getRow(i: number) {
                this.__row.__index = i;
                return this.__row;
            }

            constructor(count: number, srcColumns: ColumnDescriptor[], srcData: { [name: string]: any }) {
                this.count = count;
                this.indices = <any>new Int32Array(count);
                this.columns = [];

                for (let i = 0; i < count; i++) {
                    this.indices[i] = i;
                }

                for (let col of srcColumns) {

                    let data = srcData[col.name];
                    if (Utils.ChunkedArray.is(data)) {
                        data = Utils.ChunkedArray.compact(data);
                    }
                    Object.defineProperty(this, col.name, { enumerable: true, configurable: false, writable: false, value: data });
                    this.columns[this.columns.length] = col;
                }

                this.__row = new Row(this);
            }
        }

        class BuilderImpl implements Builder {
            count: number;

            columns: ColumnDescriptor[] = [];

            addColumn<T>(name: string, creator: (size: number) => T): T {
                let c = creator(this.count);
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
            seal<Schema>(): DataTable<Schema> {
                return new TableImpl(this.count, this.columns, this) as DataTable<Schema>;
            }

            constructor(count: number) {
                this.count = count;
            }
        }
    }
}