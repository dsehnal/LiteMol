/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";

    export interface LinkedElement<T>  { 
        previous: T | null; 
        next: T | null; 
        inList: boolean; 
    }

    export class LinkedList<T extends LinkedElement<T>> {

        count: number = 0;
        first: T | null = null;
        private last: T | null = null;

        addFirst(item: T) {
            item.inList = true;
            if (this.first) this.first.previous = item;
            item.next = this.first;
            this.first = item;
            this.count++;
        }

        addLast(item: T) {
            if (this.last != null) {
                this.last.next = item;
            }
            item.previous = this.last;
            this.last = item;
            if (this.first == null) {
                this.first = item;
            }
            item.inList = true;
            this.count++;
        }

        remove(item: T) {
            if (!item.inList) return;

            item.inList = false;

            if (item.previous !== null) {
                item.previous.next = item.next;
            }
            else if (/*first == item*/ item.previous === null) {
                this.first = item.next;
            }

            if (item.next !== null) {
                item.next.previous = item.previous;
            }
            else if (/*last == item*/ item.next === null) {
                this.last = item.previous;
            }

            item.next = null;
            item.previous = null;
            this.count--;
        }
    }
}