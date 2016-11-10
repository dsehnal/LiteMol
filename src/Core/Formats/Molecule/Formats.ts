/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule {

    export namespace SupportedFormats {
        export const mmCIF: FormatInfo = {
            name: 'mmCIF', 
            shortcuts: ['mmcif', 'cif'],
            extensions: ['.cif'], 
            parse: (data) => {
                return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                    ctx.update('Parsing...');
                    ctx.schedule(() => {
                        let file = CIF.Text.parse(data as string);
                        if (file.isError) { ctx.reject(file.toString()); return; }
                        let result = file.result;
                        if (!result.dataBlocks.length) { ctx.reject(`The CIF data does not contain a data block.`); return; }
                        ctx.update('Creating representation...');
                        ctx.schedule(() => {
                            try {
                                let mol = Molecule.mmCIF.ofDataBlock(result.dataBlocks[0]);
                                ctx.resolve(ParserResult.success(mol, result.dataBlocks.length > 1 ? [`The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block.`] : void 0));
                            } catch (e) {
                                ctx.reject(`${e}`);
                            }
                        });
                    });
                });
            }
        };

        export const mmBCIF: FormatInfo = {
            name: 'mmCIF (Binary)',
            shortcuts: ['mmbcif', 'bcif', 'binarycif'], 
            extensions: ['.bcif'], 
            isBinary: true, 
            parse: (data) => {
                return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                    ctx.update('Parsing...');
                    ctx.schedule(() => {
                        let file = CIF.Binary.parse(data as ArrayBuffer);
                        if (file.isError) { ctx.reject(file.toString()); return; }
                        let result = file.result;
                        if (!result.dataBlocks.length) { ctx.reject(`The BinaryCIF data does not contain a data block.`); return; }
                        ctx.update('Creating representation...');
                        ctx.schedule(() => {
                            try {
                                let mol = Molecule.mmCIF.ofDataBlock(result.dataBlocks[0]);
                                ctx.resolve(ParserResult.success(mol, result.dataBlocks.length > 1 ? [`The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block.`] : void 0));
                            } catch (e) {
                                ctx.reject(`${e}`);
                            }
                        });
                    });
                });
            }
        };

        export const PDB: FormatInfo = {
            name: 'PDB', 
            shortcuts: ['pdb', 'ent'],
            extensions: ['.pdb', '.ent'], 
            parse: (data, options) => {
                return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                    ctx.update('Parsing...');
                    ctx.schedule(() => {
                        let file = Molecule.PDB.toCifFile((options && options.id) || 'PDB', data as string);
                        if (file.isError) { ctx.reject(file.toString()); return; }
                        let result = file.result;
                        if (!result.dataBlocks.length) { ctx.reject(`The PDB data does not contain a data block.`); return; }
                        ctx.update('Creating representation...');
                        ctx.schedule(() => {
                            try {
                                let mol = Molecule.mmCIF.ofDataBlock(result.dataBlocks[0]);
                                ctx.resolve(ParserResult.success(mol));
                            } catch (e) {
                                ctx.reject(`${e}`);
                            }
                        });
                    });
                });
            }
        };

        export const SDF: FormatInfo = {
            name: 'SDF',
            shortcuts: ['sdf', 'mol'], 
            extensions: ['.sdf', '.mol'], 
            parse: (data, options) => {
                return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                    ctx.update('Parsing...');
                    ctx.schedule(() => {
                        let mol = Molecule.SDF.parse(data as string, (options && options.id) || undefined);
                        if (mol.isError) { ctx.reject(mol.toString()); return; }
                        ctx.resolve(ParserResult.success(mol.result));
                    });
                });
            }
        };

        export const All = [mmCIF, mmBCIF, PDB, SDF];
    }
}