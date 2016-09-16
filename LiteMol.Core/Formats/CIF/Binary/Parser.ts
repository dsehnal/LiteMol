/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Binary {
    "use strict";

    export function parse(data: ArrayBuffer): ParserResult<CIF.File> {
        try {
            let array = new Uint8Array(data);
            let unpacked = MessagePack.decode(array);
            let file = new File(unpacked);
            return ParserResult.success(file);        
        } catch (e) {
            return ParserResult.error('' + e);
        }
    }
}