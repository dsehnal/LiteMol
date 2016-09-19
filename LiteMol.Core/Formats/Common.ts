/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats {
    "use strict";

    export interface FormatInfo {
        name: string,
        // a list of extensions, including the ., e.g. ['.cif']
        extensions: string[],
        isBinary?: boolean,
        parse: (data: string | ArrayBuffer, params?: { id?: string }) => Computation<ParserResult<any>> 
    }

    export namespace FormatInfo {
        export function formatRegExp(info: FormatInfo) {
            return new RegExp(info.extensions.map(e => `(\\${e})`).join('|') + '(\\.gz){0,1}$', 'i');
        }

        export function formatFileFilters(all: FormatInfo[]) {
            return all.map(info => info.extensions.map(e => `${e},${e}.gz`).join(',')).join(',');
        }

        export function getFormat(filename: string, all: FormatInfo[]) {
            for (let f of all) {
                if (formatRegExp(f).test(filename)) return f;
            }
            return void 0;
        }
    }

    export class ParserError {

        toString() {
            if (this.line >= 0) {
                return `[Line ${this.line}] ${this.message}`;
            }
            return this.message;
        }

        constructor(
            public message: string,
            public line: number) {
        }
    }

    /**
     * A generic parser result.
     */
    export class ParserResult<T> {

        static error(message: string, line = -1) {
            return new ParserResult(new ParserError(message, line), [], void 0);
        }

        static success<T>(result: T, warnings: string[] = []) {
            return new ParserResult<T>(void 0, warnings, result);
        }

        constructor(
            public error: ParserError,
            public warnings: string[],
            public result: T) { }
    }

    /**
     * A helper class for building a typed array of token indices.
     */
    export class TokenIndexBuilder {

        private tokensLenMinus2: number;
        private count = 0;
        tokens: Int32Array;

        private resize() {
            // scale the size using golden ratio, because why not.
            var newBuffer = new Int32Array((1.61 * this.tokens.length) | 0);
            newBuffer.set(this.tokens);
            this.tokens = newBuffer;
            this.tokensLenMinus2 = (newBuffer.length - 2) | 0;
        }

        addToken(start: number, end: number) {
            if (this.count >= this.tokensLenMinus2) {
                this.resize();
            }
            this.tokens[this.count++] = start;
            this.tokens[this.count++] = end;
        }

        constructor(size: number) {
            this.tokens = new Int32Array(size);
            this.tokensLenMinus2 = (size - 2) | 0;
        }
    }

    /**
     * A helper class to store only unique strings.
     */
    export class ShortStringPool {
        strings: Map<string, string> = new Map<string, string>();

        getString(key: string) {
            if (key.length > 6) return key;

            var value = this.strings.get(key);
            if (value !== void 0) return value;
            this.strings.set(key, key);
            return key;
        }
    }    
}