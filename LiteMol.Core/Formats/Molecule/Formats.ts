/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule {
    
    export namespace SupportedFormats {
        export const mmCIF: FormatInfo = { name: 'mmCIF', extensions: ['.cif'], parse: (data, { id }) => {
            return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let file = CIF.Text.parse(data as string);
                    if (file.error) { ctx.reject(file.error.toString()); return; }
                    if (!file.result.dataBlocks.length) { ctx.reject(`The CIF data does not contain a data block.`); return; }
                    ctx.update('Creating representation...');
                    ctx.schedule(() => {
                        try {
                            let mol = Molecule.mmCIF.ofDataBlock(file.result.dataBlocks[0]);
                            ctx.resolve(ParserResult.success(mol, file.result.dataBlocks.length > 1 ? [`The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block.`] : void 0));
                        } catch (e) {
                            ctx.reject(`${e}`);
                        }
                    });
                });
            });
        }};

        export const mmBCIF: FormatInfo = { name: 'mmBCIF', extensions: ['.bcif'], isBinary: true, parse: (data, { id }) => {
            return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let file = CIF.Binary.parse(data as ArrayBuffer);
                    if (file.error) { ctx.reject(file.error.toString()); return; }
                    if (!file.result.dataBlocks.length) { ctx.reject(`The BinaryCIF data does not contain a data block.`); return; }
                    ctx.update('Creating representation...');
                    ctx.schedule(() => {
                        try {
                            let mol = Molecule.mmCIF.ofDataBlock(file.result.dataBlocks[0]);
                            ctx.resolve(ParserResult.success(mol, file.result.dataBlocks.length > 1 ? [`The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block.`] : void 0));
                        } catch (e) {
                            ctx.reject(`${e}`);
                        }
                    });
                });
            });
        }};

        export const PDB: FormatInfo = { name: 'PDB', extensions: ['.pdb','.ent'], parse: (data, { id }) => {
            return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let file = Molecule.PDB.toCifFile(id !== void 0 ? id : 'PDB', data as string);
                    if (file.error) { ctx.reject(file.error.toString()); return; }
                    if (!file.result.dataBlocks.length) { ctx.reject(`The PDB data does not contain a data block.`); return; }
                    ctx.update('Creating representation...');
                    ctx.schedule(() => {
                        try {
                            let mol = Molecule.mmCIF.ofDataBlock(file.result.dataBlocks[0]);
                            ctx.resolve(ParserResult.success(mol));
                        } catch (e) {
                            ctx.reject(`${e}`);    
                        }
                    });
                });
            });
        }};

        export const SDF: FormatInfo = { name: 'SDF', extensions: ['.sdf','.mol'], parse: (data, { id }) => {
            return Computation.create<ParserResult<Structure.Molecule>>(ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let mol = Molecule.SDF.parse(data as string, id);
                    if (mol.error) { ctx.reject(mol.error.toString()); return; }
                    ctx.resolve(ParserResult.success(mol.result));
                });
            });
        }};

        export const All = [ mmCIF, mmBCIF, PDB, SDF ];
    }
}