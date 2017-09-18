/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Selection {

    export interface Info {
        model: Model,
        elements?: number[]
    }

    export class Pick {
        current: Info | null = null;
        currentPickId: number = -1;
        currentPickElementId: number = -1;

        getPickInfo(): Info | null {
            if (!this.current) return this.current;
            if (this.current.elements && !this.current.elements.length) return null;
            return {
                model: this.current.model,
                elements: this.current.elements,
            };
        }

        reset(): boolean {
            var changed = this.current !== null;

            this.currentPickId = -1;
            this.currentPickElementId = -1;
            this.current = null;

            return changed;
        }

        private selectPos = { x: 0.0, y: 0.0 };
        selectStart(x: number, y: number) {
            this.selectPos.x = x;
            this.selectPos.y = y;
        }

        selectEnd(x: number, y: number): boolean {
            var dx = x - this.selectPos.x,
                dy = y - this.selectPos.y;

            return dx * dx + dy * dy < 4.5;
        }
    }

    export module Picking {

        export function assignPickColor(elementId: number, color: { r: number; g: number; b: number }) {
            let b = (elementId >> 16) & 0xFF, g = (elementId >> 8) & 0xFF, r = elementId & 0xFF;

            color.r = r / 255.0;
            color.g = g / 255.0;
            color.b = b / 255.0;
        }

        export function applySceneIdFast(id: number, offset: number, data: number[]) {
            data[offset + 3] = id / 255.0;
        }

        export function applySceneIdSlow(extraBits: number, id: number, offset: number, data: number[]) {
            let low = (id & ((1 << extraBits) - 1)) << (8 - extraBits);
            let high = id >> extraBits;
            data[offset + 3] = high / 255.0;
            let v = (data[offset + 2] * 255) | 0;
            data[offset + 2] = (v | low) / 255.0;
        }


        export function getElementId(idWidth: number, buffer: Uint8Array) {
            let mask = (1 << (16 - idWidth)) - 1;
            return buffer[0] | (buffer[1] << 8) | ((buffer[2] & mask) << 16);
        }

        export function getSceneId(idWidth: number, buffer: Uint8Array) {
            let extraBits = idWidth - 8;
            let low = (buffer[2] & (((1 << extraBits) - 1) << (8 - extraBits)) >> (8 - extraBits));
            let high = buffer[3] << extraBits;
            return low | high;
        }
    }

    export const enum Action {
        Select = 1,
        RemoveSelect = 2,

        Highlight = 3,
        RemoveHighlight = 4,

        Clear = 5
    };

    import ChunkedArray = Core.Utils.ChunkedArray;

    export class VertexMapBuilder {

        private elementIndices: ChunkedArray<number>;
        private elementMap = Core.Utils.FastMap.create<number, number>();
        private elementRanges: Int32Array;
        private vertexRanges: ChunkedArray<number>;

        private elementIndex = 0;
        private elementRangeIndex = 0;
        private rangeIndex = 0;
        private added = 0;

        startElement(index: number) {
            this.elementIndex = index;
            this.elementRangeIndex = this.elementMap.size;
            this.rangeIndex = this.vertexRanges.elementCount;

            this.added = 0;
        }

        addVertexRange(start: number, end: number) {
            this.added++;
            ChunkedArray.add2(this.vertexRanges, start, end);
        }

        endElement() {
            ChunkedArray.add(this.elementIndices, this.elementIndex);
            this.elementMap.set(this.elementIndex, this.elementRangeIndex);
            this.elementRanges[2 * this.elementRangeIndex] = 2 * this.rangeIndex;
            this.elementRanges[2 * this.elementRangeIndex + 1] = 2 * (this.rangeIndex + this.added);
        }

        getMap() {
            return new VertexMap(
                ChunkedArray.compact(this.elementIndices),
                this.elementMap,
                <any>this.elementRanges,
                ChunkedArray.compact(this.vertexRanges));
        }


        constructor(elementCount: number) {
            this.elementIndices = ChunkedArray.create<number>(size => new Int32Array(size), elementCount, 1);
            this.elementRanges = new Int32Array(2 * elementCount);
            this.vertexRanges = ChunkedArray.create<number>(size => new Int32Array(size), elementCount, 2);
        }
    }

    export class VertexMap {
        constructor(
            public elementIndices: number[],
            public elementMap: Core.Utils.FastMap<number, number>,
            public elementRanges: number[],
            public vertexRanges: number[]) {
        }
    }

    export function applyActionToRange(array: Float32Array, start: number, end: number, action: Action) {
        let changed = false;
        if (action === Action.Highlight) {
            for (let i = start; i < end; i++) {
                let v = array[i];
                let c = (v | 0);
                if (v - c < 0.33) {
                    array[i] = c + 0.55;
                    changed = true;
                }
            }
        } else if (action === Action.RemoveHighlight) {
            for (let i = start; i < end; i++) {
                let v = array[i];
                let c = (v | 0);
                if (v - c > 0.33) {
                    array[i] = c;
                    changed = true;
                }
            }
        } else if (action === Action.Select) {
            for (let i = start; i < end; i++) {
                array[i] = array[i] + 1;
                changed = true;
            }
        } else if (action === Action.RemoveSelect) {
            for (let i = start; i < end; i++) {
                if (array[i] > 0.75) {
                    let v = array[i] - 1;
                    if (v < 0) v = 0;
                    array[i] = v;
                    changed = true;
                }
            }
        } else { // clear
            for (let i = start; i < end; i++) {
                let v = array[i];
                array[i] = 0;
                changed = changed || v !== 0;
            }
        }
        return changed;
    }

    export function applyActionToBuffer(buffer: THREE.BufferAttribute, action: Action) {
        let array = <any>buffer.array as Float32Array;
        let ret = applyActionToRange(array, 0, array.length, action);
        if (ret) buffer.needsUpdate = true;
        return ret;
    }

}