/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule.PDB {
    "use strict";

    export type TokenRange = { start: number; end: number };

    export type HelperData = { dot: TokenRange; question: TokenRange; numberTokens: Utils.FastMap<number, TokenRange>; data: string };

    export class MoleculeData {

        private makeEntities() {

            let data = [
                `data_ent`,
                `loop_`,
                `_entity.id`,
                `_entity.type`,
                `_entity.src_method`,
                `_entity.pdbx_description`,
                `_entity.formula_weight`,
                `_entity.pdbx_number_of_molecules`,
                `_entity.details`,
                `_entity.pdbx_mutation`,
                `_entity.pdbx_fragment`,
                `_entity.pdbx_ec`,
                `1 polymer man polymer 0.0 0 ? ? ? ?`,
                `2 non-polymer syn non-polymer 0.0 0 ? ? ? ?`,
                `3 water nat water 0.0 0 ? ? ? ?`
            ].join('\n');

            let file = CIF.Text.parse(data);
            if (file.isError) {
                throw file.toString();
            }
            return file.result.dataBlocks[0].getCategory('_entity') as CIF.Text.Category;
        }

        toCifFile(): CIF.File {

            let helpers: HelperData = {
                dot: Parser.getDotRange(this.data.length),
                question: Parser.getQuestionmarkRange(this.data.length),
                numberTokens: Parser.getNumberRanges(this.data.length),
                data: this.data
            };

            let file = new CIF.Text.File(this.data);

            let block = new CIF.Text.DataBlock(this.data, this.header.id);
            file.dataBlocks.push(block);

            block.addCategory(this.makeEntities());

            if (this.crystInfo) {
                let { cell, symm } = this.crystInfo.toCifCategory(this.header.id);
                block.addCategory(cell as CIF.Text.Category);
                block.addCategory(symm as CIF.Text.Category);
            }

            block.addCategory(this.models.toCifCategory(block, helpers));

            return file;
        }

        constructor(
            public header: Header,
            public crystInfo: CrystStructureInfo | undefined,
            public models: ModelsData,
            public data: string
        ) {
        }

    }

    export class Header {
        constructor(public id: string) {
        }
    }

    export class CrystStructureInfo {

        private getValue(start: number, len: number) {
            let ret = this.record.substr(6, 9).trim();
            if (!ret.length) return '.';
            return ret;
        }

        toCifCategory(id: string) {

            //COLUMNS       DATA TYPE      CONTENTS
            //--------------------------------------------------------------------------------
            //    1 - 6       Record name    "CRYST1"
            //7 - 15       Real(9.3)      a (Angstroms)
            //16 - 24       Real(9.3)      b (Angstroms)
            //25 - 33       Real(9.3)      c (Angstroms)
            //34 - 40       Real(7.2)      alpha (degrees)
            //41 - 47       Real(7.2)      beta (degrees)
            //48 - 54       Real(7.2)      gamma (degrees)
            //56 - 66       LString        Space group       
            //67 - 70       Integer        Z value           

            let data = [
                `_cell.entry_id           '${id}'`,
                `_cell.length_a           ${this.getValue(6, 9)}`,
                `_cell.length_b           ${this.getValue(15, 9)}`,
                `_cell.length_c           ${this.getValue(24, 9)}`,
                `_cell.angle_alpha        ${this.getValue(33, 7)}`,
                `_cell.angle_beta         ${this.getValue(40, 7)}`,
                `_cell.angle_gamma        ${this.getValue(48, 7)}`,
                `_cell.Z_PDB              ${this.getValue(66, 4)}`,
                `_cell.pdbx_unique_axis   ?`,
                `_symmetry.entry_id                         '${id}'`,
                `_symmetry.space_group_name_H-M             '${this.getValue(55, 11)}'`,
                `_symmetry.pdbx_full_space_group_name_H-M   ?`,
                `_symmetry.cell_setting                     ?`,
                `_symmetry.Int_Tables_number                ?`,
                `_symmetry.space_group_name_Hall            ?`
            ].join('\n');

            let cif = CIF.Text.parse(data);

            if (cif.isError) {
                throw new Error(cif.toString());
            }

            return {
                cell: cif.result.dataBlocks[0].getCategory('_cell'),
                symm: cif.result.dataBlocks[0].getCategory('_symmetry')
            };
        }

        constructor(public record: string) {
        }
    }

    export class SecondaryStructure {

        toCifCategory(data: string): { helices: CIF.Category; sheets: CIF.Category } | undefined {
            return void 0;
        }

        constructor(public helixTokens: number[], public sheetTokens: number[]) {
        }
    }


    export class ModelData {


        static COLUMNS = [
            "_atom_site.group_PDB",
            "_atom_site.id",
            "_atom_site.type_symbol",
            "_atom_site.label_atom_id",
            "_atom_site.label_alt_id",
            "_atom_site.label_comp_id",
            "_atom_site.label_asym_id",
            "_atom_site.label_entity_id",
            "_atom_site.label_seq_id",
            "_atom_site.pdbx_PDB_ins_code",
            "_atom_site.Cartn_x",
            "_atom_site.Cartn_y",
            "_atom_site.Cartn_z",
            "_atom_site.occupancy",
            "_atom_site.B_iso_or_equiv",
            "_atom_site.Cartn_x_esd",
            "_atom_site.Cartn_y_esd",
            "_atom_site.Cartn_z_esd",
            "_atom_site.occupancy_esd",
            "_atom_site.B_iso_or_equiv_esd",
            "_atom_site.pdbx_formal_charge",
            "_atom_site.auth_seq_id",
            "_atom_site.auth_comp_id",
            "_atom_site.auth_asym_id",
            "_atom_site.auth_atom_id",
            "_atom_site.pdbx_PDB_model_num"
        ];

        private writeToken(index: number, cifTokens: Utils.ArrayBuilder<number>) {
            Utils.ArrayBuilder.add2(cifTokens, this.atomTokens[2 * index], this.atomTokens[2 * index + 1]);
        }

        private writeTokenCond(index: number, cifTokens: Utils.ArrayBuilder<number>, dot: TokenRange) {
            let s = this.atomTokens[2 * index];
            let e = this.atomTokens[2 * index + 1];

            if (s === e) Utils.ArrayBuilder.add2(cifTokens, dot.start, dot.end);
            else Utils.ArrayBuilder.add2(cifTokens, s, e);
        }

        private writeRange(range: TokenRange, cifTokens: Utils.ArrayBuilder<number>) {
            Utils.ArrayBuilder.add2(cifTokens, range.start, range.end);
        }

        private tokenEquals(start: number, end: number, value: string, data: string) {
            let len = value.length;
            if (len !== end - start) return false;
            for (let i = value.length - 1; i >= 0; i--) {
                if (data.charCodeAt(i + start) !== value.charCodeAt(i)) {
                    return false;
                }
            }
            return true;
        }

        private getEntityType(row: number, data: string) {

            let o = row * 14;
            if (this.tokenEquals(this.atomTokens[2 * o], this.atomTokens[2 * o + 1], "HETATM", data)) {
                let s = this.atomTokens[2 * (o + 4)], e = this.atomTokens[2 * (o + 4) + 1];

                if (this.tokenEquals(s, e, "HOH", data) || this.tokenEquals(s, e, "WTR", data) || this.tokenEquals(s, e, "SOL", data)) {
                    return 3; // water
                }
                return 2; // non-polymer
            } else {
                return 1; // polymer
            }
        }

        writeCifTokens(modelToken: TokenRange, cifTokens: Utils.ArrayBuilder<number>, helpers: HelperData) {

            const columnIndices = {
                //COLUMNS        DATA TYPE       CONTENTS                            
                //--------------------------------------------------------------------------------
                // 1 -  6        Record name     "ATOM  "                                          
                RECORD: 0,
                // 7 - 11        Integer         Atom serial number.                   
                SERIAL: 1,
                //13 - 16        Atom            Atom name.          
                ATOM_NAME: 2,
                //17             Character       Alternate location indicator. 
                ALT_LOC: 3,
                //18 - 20        Residue name    Residue name.       
                RES_NAME: 4,
                //22             Character       Chain identifier.         
                CHAIN_ID: 5,
                //23 - 26        Integer         Residue sequence number.              
                RES_SEQN: 6,
                //27             AChar           Code for insertion of residues.       
                INS_CODE: 7,
                //31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.   
                X: 8,
                //39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.                            
                Y: 9,
                //47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.        
                Z: 10,
                //55 - 60        Real(6.2)       Occupancy.       
                OCCUPANCY: 11,
                //61 - 66        Real(6.2)       Temperature factor (Default = 0.0).                   
                TEMP_FACTOR: 12,
                //73 - 76        LString(4)      Segment identifier, left-justified.   
                // ignored
                //77 - 78        LString(2)      Element symbol, right-justified.   
                ELEMENT: 13
                //79 - 80        LString(2)      Charge on the atom.      
                // ignored
            };

            const columnCount = 14;

            for (let i = 0; i < this.atomCount; i++) {

                let o = i * columnCount;

                //_atom_site.group_PDB
                this.writeToken(o + columnIndices.RECORD, cifTokens);

                //_atom_site.id
                this.writeToken(o + columnIndices.SERIAL, cifTokens);

                //_atom_site.type_symbol
                this.writeToken(o + columnIndices.ELEMENT, cifTokens);

                //_atom_site.label_atom_id
                this.writeToken(o + columnIndices.ATOM_NAME, cifTokens);

                //_atom_site.label_alt_id
                this.writeTokenCond(o + columnIndices.ALT_LOC, cifTokens, helpers.dot);

                //_atom_site.label_comp_id
                this.writeToken(o + columnIndices.RES_NAME, cifTokens);

                //_atom_site.label_asym_id
                this.writeToken(o + columnIndices.CHAIN_ID, cifTokens);

                //_atom_site.label_entity_id
                this.writeRange(helpers.numberTokens.get(this.getEntityType(i, helpers.data)) !, cifTokens);

                //_atom_site.label_seq_id
                this.writeToken(o + columnIndices.RES_SEQN, cifTokens);

                //_atom_site.pdbx_PDB_ins_code
                this.writeTokenCond(o + columnIndices.INS_CODE, cifTokens, helpers.dot);

                //_atom_site.Cartn_x
                this.writeToken(o + columnIndices.X, cifTokens);

                //_atom_site.Cartn_y
                this.writeToken(o + columnIndices.Y, cifTokens);

                //_atom_site.Cartn_z
                this.writeToken(o + columnIndices.Z, cifTokens);

                //_atom_site.occupancy
                this.writeToken(o + columnIndices.OCCUPANCY, cifTokens);

                //_atom_site.B_iso_or_equiv
                this.writeToken(o + columnIndices.TEMP_FACTOR, cifTokens);

                //_atom_site.Cartn_x_esd
                this.writeRange(helpers.question, cifTokens);

                //_atom_site.Cartn_y_esd
                this.writeRange(helpers.question, cifTokens);

                //_atom_site.Cartn_z_esd
                this.writeRange(helpers.question, cifTokens);

                //_atom_site.occupancy_esd
                this.writeRange(helpers.question, cifTokens);

                //_atom_site.B_iso_or_equiv_esd
                this.writeRange(helpers.question, cifTokens);

                //_atom_site.pdbx_formal_charge
                this.writeRange(helpers.question, cifTokens);

                //_atom_site.auth_seq_id
                this.writeToken(o + columnIndices.RES_SEQN, cifTokens);

                //_atom_site.auth_comp_id
                this.writeToken(o + columnIndices.RES_NAME, cifTokens);

                //_atom_site.auth_asym_id
                this.writeToken(o + columnIndices.CHAIN_ID, cifTokens);

                //_atom_site.auth_atom_id
                this.writeToken(o + columnIndices.ATOM_NAME, cifTokens);

                //_atom_site.pdbx_PDB_model_num 
                this.writeRange(modelToken, cifTokens);
            }
        }

        constructor(public idToken: TokenRange, public atomTokens: number[], public atomCount: number) {
        }
    }

    export class ModelsData {
        toCifCategory(block: CIF.Text.DataBlock, helpers: HelperData): CIF.Text.Category {

            let atomCount = 0;
            for (let m of this.models) {
                atomCount += m.atomCount;
            }

            const colCount = 26;
            let tokens = Utils.ArrayBuilder.forTokenIndices(atomCount * colCount);

            for (let m of this.models) {
                m.writeCifTokens(m.idToken, tokens, helpers);
            }

            return new CIF.Text.Category(block.data, "_atom_site", 0, 0, ModelData.COLUMNS, tokens.array, atomCount * colCount);
        }

        constructor(public models: ModelData[]) {
        }
    }
}