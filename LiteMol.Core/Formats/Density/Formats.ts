/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density {
    
    function parse(data: string | ArrayBuffer, name: string, parser: (data: string | ArrayBuffer) => ParserResult<Data>) {
        return Computation.create(ctx => {
            ctx.update(`Parsing ${name}...`);
            try {
                ctx.resolve(parser(data));
            } catch (e) {
                ctx.reject('' + e);
            }
        })
    }

    export namespace SupportedFormats {
        export const CCP4: FormatInfo = { name: 'CCP4', extensions: ['.ccp4', '.map'], isBinary: true, parse: data => parse(data, 'CCP4', d => Density.CCP4.parse(d as ArrayBuffer)) };
        export const DSN6: FormatInfo = { name: 'DSN6', extensions: ['.dsn6'], isBinary: true, parse: data => parse(data, 'DSN6', d => Density.DSN6.parse(d as ArrayBuffer)) };

        export const All = [ CCP4, DSN6 ];
    }
}