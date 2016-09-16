/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.MessagePack {

    /* 
     * Adapted from https://github.com/rcsb/mmtf-javascript
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */


    export function decode(buffer: Uint8Array) {
        // Loosely based on
        // The MIT License (MIT)
        // Copyright (c) 2013 Tim Caswell <tim@creationix.com>
        // https://github.com/creationix/msgpack-js
        let offset = 0;
        let dataView = new DataView(buffer.buffer);

        /**
         * decode all key-value pairs of a map into an object
         * @param  {Integer} length - number of key-value pairs
         * @return {Object} decoded map
         */
        function map(length: number) {
            let value: any = {};
            for (let i = 0; i < length; i++) {
                let key = parse();
                value[key] = parse();
            }
            return value;
        }

        /**
         * decode binary array
         * @param  {Integer} length - number of elements in the array
         * @return {Uint8Array} decoded array
         */
        function bin(length: number) {
            ////let value = buffer.subarray(offset, offset + length); //new Uint8Array(buffer.buffer, offset, length);

            // This approach wastes a bit of memory to trade for speed.
            // it turns out that using the view created by subarray probably uses DataView
            // in the background, which causes the element access to be several times slower
            // than creating the new byte array.
            let value = new Uint8Array(length);
            for (let i = 0; i < length; i++) value[i] = buffer[i + offset];
            offset += length;
            return value;
        }

        /**
         * decode string
         * @param  {Integer} length - number string characters
         * @return {String} decoded string
         */
        function str(length: number) {
            let value = utf8Read(buffer, offset, length);
            offset += length;
            return value;
        }

        /**
         * decode array
         * @param  {Integer} length - number of array elements
         * @return {Array} decoded array
         */
        function array(length: number) {
            let value:any[] = [];// new Array(length);
            for (let i = 0; i < length; i++) {
                value[i] = parse();
            }
            return value;
        }

        /**
         * recursively parse the MessagePack data
         * @return {Object|Array|String|Number|Boolean|null} decoded MessagePack data
         */
        function parse() {
            let type = buffer[offset];
            let value: any, length: number;
            // Positive FixInt
            if ((type & 0x80) === 0x00) {
                offset++;
                return type;
            }
            // FixMap
            if ((type & 0xf0) === 0x80) {
                length = type & 0x0f;
                offset++;
                return map(length);
            }
            // FixArray
            if ((type & 0xf0) === 0x90) {
                length = type & 0x0f;
                offset++;
                return array(length);
            }
            // FixStr
            if ((type & 0xe0) === 0xa0) {
                length = type & 0x1f;
                offset++;
                return str(length);
            }
            // Negative FixInt
            if ((type & 0xe0) === 0xe0) {
                value = dataView.getInt8(offset);
                offset++;
                return value;
            }
            switch (type) {
                // nil
                case 0xc0:
                    offset++;
                    return null;
                // false
                case 0xc2:
                    offset++;
                    return false;
                // true
                case 0xc3:
                    offset++;
                    return true;
                // bin 8
                case 0xc4:
                    length = dataView.getUint8(offset + 1);
                    offset += 2;
                    return bin(length);
                // bin 16
                case 0xc5:
                    length = dataView.getUint16(offset + 1);
                    offset += 3;
                    return bin(length);
                // bin 32
                case 0xc6:
                    length = dataView.getUint32(offset + 1);
                    offset += 5;
                    return bin(length);
                // float 32
                case 0xca:
                    value = dataView.getFloat32(offset + 1);
                    offset += 5;
                    return value;
                // float 64
                case 0xcb:
                    value = dataView.getFloat64(offset + 1);
                    offset += 9;
                    return value;
                // uint8
                case 0xcc:
                    value = buffer[offset + 1];
                    offset += 2;
                    return value;
                // uint 16
                case 0xcd:
                    value = dataView.getUint16(offset + 1);
                    offset += 3;
                    return value;
                // uint 32
                case 0xce:
                    value = dataView.getUint32(offset + 1);
                    offset += 5;
                    return value;
                // int 8
                case 0xd0:
                    value = dataView.getInt8(offset + 1);
                    offset += 2;
                    return value;
                // int 16
                case 0xd1:
                    value = dataView.getInt16(offset + 1);
                    offset += 3;
                    return value;
                // int 32
                case 0xd2:
                    value = dataView.getInt32(offset + 1);
                    offset += 5;
                    return value;
                // str 8
                case 0xd9:
                    length = dataView.getUint8(offset + 1);
                    offset += 2;
                    return str(length);
                // str 16
                case 0xda:
                    length = dataView.getUint16(offset + 1);
                    offset += 3;
                    return str(length);
                // str 32
                case 0xdb:
                    length = dataView.getUint32(offset + 1);
                    offset += 5;
                    return str(length);
                // array 16
                case 0xdc:
                    length = dataView.getUint16(offset + 1);
                    offset += 3;
                    return array(length);
                // array 32
                case 0xdd:
                    length = dataView.getUint32(offset + 1);
                    offset += 5;
                    return array(length);
                // map 16:
                case 0xde:
                    length = dataView.getUint16(offset + 1);
                    offset += 3;
                    return map(length);
                // map 32
                case 0xdf:
                    length = dataView.getUint32(offset + 1);
                    offset += 5;
                    return map(length);
            }

            throw new Error("Unknown type 0x" + type.toString(16));
        }

        // start the recursive parsing
        return parse();
    }
}