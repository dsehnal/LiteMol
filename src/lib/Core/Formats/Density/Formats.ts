/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density {
    
    function parse(data: string | ArrayBuffer, name: string, parser: (data: string | ArrayBuffer) => ParserResult<Data>) {
        return computation(async ctx => {
            await ctx.updateProgress(`Parsing ${name}...`);        
            return parser(data);
        }) 
    }

    export namespace SupportedFormats {
        export const CCP4: FormatInfo = { name: 'CCP4', shortcuts: ['ccp4', 'map'], extensions: ['.ccp4', '.map'], isBinary: true, parse: data => parse(data, 'CCP4', d => Density.CCP4.parse(d as ArrayBuffer)) };        
        export const All = [ CCP4 ];
    }
}