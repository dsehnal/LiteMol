/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule {

    function parseCIF(
        type: string, 
        parse: (data: ArrayBuffer | string, params?: FormatInfo.Params) => ParserResult<CIF.File>)
        : (data: ArrayBuffer | string, params?: FormatInfo.Params) => Computation<ParserResult<Structure.Molecule>> {

        return (data, params) => computation(async ctx => {
            await ctx.updateProgress('Parsing...');                    
            let file = parse(data, params);
            if (file.isError) { throw file.toString() }
            let result = file.result;
            if (!result.dataBlocks.length) { throw `The ${type} data does not contain a data block.`; }
            await ctx.updateProgress('Creating representation...');
        
            let mol = Molecule.mmCIF.ofDataBlock(result.dataBlocks[0]);
            return ParserResult.success(mol, result.dataBlocks.length > 1 ? [`The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block.`] : void 0);
        });
    }

    export namespace SupportedFormats {
        export const mmCIF: FormatInfo = {
            name: 'mmCIF', 
            shortcuts: ['mmcif', 'cif'],
            extensions: ['.cif'], 
            parse: parseCIF('CIF', CIF.Text.parse)
        };

        export const mmBCIF: FormatInfo = {
            name: 'mmCIF (Binary)',
            shortcuts: ['mmbcif', 'bcif', 'binarycif'], 
            extensions: ['.bcif'], 
            isBinary: true, 
            parse: parseCIF('BinaryCIF', CIF.Binary.parse)
        };

        export const PDB: FormatInfo = {
            name: 'PDB', 
            shortcuts: ['pdb', 'ent'],
            extensions: ['.pdb', '.ent'], 
            parse: parseCIF('PDB', (d, p) => Molecule.PDB.toCifFile((p && p.id) || 'PDB', d as string))
        };

        export const SDF: FormatInfo = {
            name: 'SDF',
            shortcuts: ['sdf', 'mol'], 
            extensions: ['.sdf', '.mol'], 
            parse: (data, options) => {
                return computation(async ctx => {
                    await ctx.updateProgress('Parsing...');                        
                    let mol = Molecule.SDF.parse(data as string, (options && options.id) || undefined);
                    if (mol.isError) throw mol.toString();
                    return ParserResult.success(mol.result);
                });
            }
        };

        export const All = [mmCIF, mmBCIF, PDB, SDF];
    }
}