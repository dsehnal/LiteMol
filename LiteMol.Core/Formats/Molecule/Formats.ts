/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule {
    
    export namespace SupportedFormats {
        export const mmCIF: FormatInfo = { name: 'mmCIF', extensions: ['.cif'] };
        export const PDB: FormatInfo = { name: 'PDB', extensions: ['.pdb','.ent'] };

        export const All = [ mmCIF, PDB ];
    }

    export function parse(format: FormatInfo, data: string | ArrayBuffer, id?: string): Computation<ParserResult<Structure.Molecule>> {
        return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
            switch (format.name) {
                case SupportedFormats.mmCIF.name: {
                    ctx.update('Parsing...');
                    ctx.schedule(() => {
                        let file = CIF.parse(data as string);
                        if (file.error) { ctx.reject(file.error.toString()); return; }
                        if (!file.result.dataBlocks.length) { ctx.reject(`The CIF data does not contain a data block.`); return; }
                        ctx.update('Creating representation...');
                        ctx.schedule(() => {
                            try {
                                let mol = mmCIF.ofDataBlock(file.result.dataBlocks[0]);
                                ctx.resolve(ParserResult.success(mol, file.result.dataBlocks.length > 1 ? [ `The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block.` ] : void 0));
                            } catch (e) {
                                ctx.reject(`${e}`);    
                            }
                        });
                    });
                    break;
                }
                case SupportedFormats.PDB.name: {
                    ctx.update('Parsing...');
                    ctx.schedule(() => {
                        let file = PDB.toCifFile(id !== void 0 ? id : 'PDB', data as string);
                        if (file.error) { ctx.reject(file.error.toString()); return; }
                        if (!file.result.dataBlocks.length) { ctx.reject(`The PDB data does not contain a data block.`); return; }
                        ctx.update('Creating representation...');
                        ctx.schedule(() => {
                            try {
                                let mol = mmCIF.ofDataBlock(file.result.dataBlocks[0]);
                                ctx.resolve(ParserResult.success(mol));
                            } catch (e) {
                                ctx.reject(`${e}`);    
                            }
                        });
                    });
                    break;
                }
                default: {
                    ctx.reject(`'${format}' is not a supported molecule format.`);
                    break;
                }
            }
        });
    }
}