/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Density {
    
    export namespace SupportedFormats {
        export const CCP4: FormatInfo = { name: 'CCP4', extensions: ['.ccp4', '.map'] };
        export const DSN6: FormatInfo = { name: 'DSN6', extensions: ['.dsn6'] };

        export const All = [ CCP4, DSN6 ];
    }

    export function parse(format: FormatInfo, data: string | ArrayBuffer, id?: string): ParserResult<Data> {
        switch (format.name) {
            case SupportedFormats.CCP4.name: {
                return CCP4.parse(data as ArrayBuffer);
            }
            case SupportedFormats.DSN6.name: {
                return DSN6.parse(data as ArrayBuffer);
            }
            default: {
                return ParserResult.error(`'${format}' is not a supported density data format.`);
            }
        }
    }
}