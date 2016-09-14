/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.CIF.Binary {
    "use strict";

    export function parse(data: ArrayBuffer): ParserResult<CIF.File> {

        let array = new Uint8Array(data);
        let unpacked = MessagePack.decode(array);

        //console.log(unpacked);
        let file = new File(unpacked);
        return ParserResult.success(file);
        //console.log('file', file);
        //console.log(file.toJSON());

        //return ParserResult.error("Not implemented");
    }
}