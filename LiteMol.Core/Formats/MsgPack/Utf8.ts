/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.MsgPack {

    /* 
     * Adapted from https://github.com/rcsb/mmtf-javascript
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */

    export function utf8Write(data: Uint8Array, offset: number, str: string) {
        let byteLength = data.byteLength;
        for (let i = 0, l = str.length; i < l; i++) {
            let codePoint = str.charCodeAt(i);

            // One byte of UTF-8
            if (codePoint < 0x80) {
                data[offset++] = codePoint >>> 0 & 0x7f | 0x00;
                continue;
            }

            // Two bytes of UTF-8
            if (codePoint < 0x800) {
                data[offset++] = codePoint >>> 6 & 0x1f | 0xc0;
                data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                continue;
            }

            // Three bytes of UTF-8.
            if (codePoint < 0x10000) {
                data[offset++] = codePoint >>> 12 & 0x0f | 0xe0;
                data[offset++] = codePoint >>> 6 & 0x3f | 0x80;
                data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                continue;
            }

            // Four bytes of UTF-8
            if (codePoint < 0x110000) {
                data[offset++] = codePoint >>> 18 & 0x07 | 0xf0;
                data[offset++] = codePoint >>> 12 & 0x3f | 0x80;
                data[offset++] = codePoint >>> 6 & 0x3f | 0x80;
                data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                continue;
            }
            throw new Error("bad codepoint " + codePoint);
        }
    }

    export function utf8Read(data: Uint8Array, offset: number, length: number) {
        let str: string[] = [];
        for (let i = offset, end = offset + length; i < end; i++) {
            let byte = data[i];
            // One byte character
            if ((byte & 0x80) === 0x00) {
                str[str.length] = String.fromCharCode(byte);
                continue;
            }
            // Two byte character
            if ((byte & 0xe0) === 0xc0) {
                str[str.length] = String.fromCharCode(
                    ((byte & 0x0f) << 6) |
                    (data[++i] & 0x3f)
                );
                continue;
            }
            // Three byte character
            if ((byte & 0xf0) === 0xe0) {
                str[str.length] = String.fromCharCode(
                    ((byte & 0x0f) << 12) |
                    ((data[++i] & 0x3f) << 6) |
                    ((data[++i] & 0x3f) << 0)
                );
                continue;
            }
            // Four byte character
            if ((byte & 0xf8) === 0xf0) {
                str[str.length] = String.fromCharCode(
                    ((byte & 0x07) << 18) |
                    ((data[++i] & 0x3f) << 12) |
                    ((data[++i] & 0x3f) << 6) |
                    ((data[++i] & 0x3f) << 0)
                );
                continue;
            }
            throw new Error("Invalid byte " + byte.toString(16));
        }
        return str.join('');
    }

    export function utf8ByteCount(str: string) {
        let count = 0;
        for (let i = 0, l = str.length; i < l; i++) {
            let codePoint = str.charCodeAt(i);
            if (codePoint < 0x80) {
                count += 1;
                continue;
            }
            if (codePoint < 0x800) {
                count += 2;
                continue;
            }
            if (codePoint < 0x10000) {
                count += 3;
                continue;
            }
            if (codePoint < 0x110000) {
                count += 4;
                continue;
            }
            throw new Error("bad codepoint " + codePoint);
        }
        return count;
    }
}