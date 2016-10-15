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

    export type ParserResult<T> = ParserSuccess<T> | ParserError

    export namespace ParserResult {
        export function error<T>(message: string, line = -1): ParserResult<T> {
            return new ParserError(message, line);
        }

        export function success<T>(result: T, warnings: string[] = []): ParserResult<T> {
            return new ParserSuccess<T>(result, warnings);
        }
    }

    export class ParserError {
        isError: true = true;

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

    export class ParserSuccess<T> {
        isError: false = false;

        constructor(public result: T,
            public warnings: string[]) { }
    }

    /**
     * A helper for building a typed array of token indices.
     */
    export interface TokenIndexBuilder {
        tokensLenMinus2: number,
        count: number,
        tokens: Int32Array
    }

    export namespace TokenIndexBuilder {
        function resize(builder: TokenIndexBuilder) {
            // scale the size using golden ratio, because why not.
            var newBuffer = new Int32Array((1.61 * builder.tokens.length) | 0);
            newBuffer.set(builder.tokens);
            builder.tokens = newBuffer;
            builder.tokensLenMinus2 = (newBuffer.length - 2) | 0;
        }

        export function addToken(builder: TokenIndexBuilder, start: number, end: number) {
            if (builder.count >= builder.tokensLenMinus2) {
                resize(builder);
            }
            builder.tokens[builder.count++] = start;
            builder.tokens[builder.count++] = end;
        }

        export function create(size: number): TokenIndexBuilder {
            return {
                tokensLenMinus2: (size - 2) | 0,
                count: 0,
                tokens: new Int32Array(size)
            }
        }
    }

    /**
     * This ensures there is only 1 instance of a short string.
     */
    export type ShortStringPool = Map<string, string>
    export namespace ShortStringPool {
        export function create(): ShortStringPool { return new Map<string, string>(); }
        export function get(pool: ShortStringPool, str: string) {
            if (str.length > 6) return str;
            var value = pool.get(str);
            if (value !== void 0) return value;
            pool.set(str, str);
            return str;
        }
    }
}