/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule.mmCIF {
    "use strict";

    type StructureWrapper = { residues: Structure.ResidueTable, chains: Structure.ChainTable, entities: Structure.EntityTable };

    namespace Defaults {
        export const ElementSymbol = 'X';
        export const ResidueName = 'UNK';
        export const AsymId = '';
        export const EntityId = '1';
        export const ModelId = '1';
    }

    function getTransform(category: CIF.Category, matrixField: string, translationField: string, row: number): number[] {
        let ret = Geometry.LinearAlgebra.Matrix4.identity(), i: number, j: number;
        for (i = 1; i <= 3; i++) {
            for (j = 1; j <= 3; j++) {
                Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, j - 1, category.getColumn(matrixField + "[" + i + "][" + j + "]").getFloat(row))
            }
            Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, 3, category.getColumn(translationField + "[" + i + "]").getFloat(row))
        }
        return ret;
    }

    function getModelEndRow(startRow: number, rowCount: number, modelNum: CIF.Column) {
        let i = 0;

        if (!modelNum || !modelNum.isDefined) return rowCount;
        for (i = startRow + 1; i < rowCount; i++) {
            if (!modelNum.areValuesEqual(i - 1, i)) break;
        }
        return i;
    }

    type AtomSiteColumnNames = 
        'id' |
        'Cartn_x' |
        'Cartn_y' |
        'Cartn_z' |   
        'label_atom_id' |
        'type_symbol' |
        'occupancy' |
        'B_iso_or_equiv' |
        'auth_atom_id' | 
        'label_alt_id' |
        'label_comp_id' |
        'label_seq_id' |
        'label_asym_id' |
        'auth_comp_id' |
        'auth_seq_id' |
        'auth_asym_id' |
        'group_PDB' |
        'label_entity_id' |
        'pdbx_PDB_ins_code' |
        'pdbx_PDB_model_num'
    
    const AtomSiteColumns:AtomSiteColumnNames[] = [
        'id',
        'Cartn_x',
        'Cartn_y',
        'Cartn_z',   
        'label_atom_id',
        'type_symbol',
        'occupancy',
        'B_iso_or_equiv',
        'auth_atom_id', 
        'label_alt_id',
        'label_comp_id',
        'label_seq_id',
        'label_asym_id',
        'auth_comp_id',
        'auth_seq_id',
        'auth_asym_id',
        'group_PDB',
        'label_entity_id',
        'pdbx_PDB_ins_code',
        'pdbx_PDB_model_num'
    ];

    type AtomSiteColumns = { get(name: AtomSiteColumnNames): CIF.Column }

    function getAtomSiteColumns(category: CIF.Category): AtomSiteColumns {   
        let ret = Utils.FastMap.create<string, CIF.Column>();
        for (let c of AtomSiteColumns) {
            ret.set(c, category.getColumn(c));
        }
        return <any>ret;
    }

    function buildModelAtomTable(startRow: number, rowCount: number, columns: AtomSiteColumns): { atoms: Structure.AtomTable, positions: Structure.PositionTable, modelId: string, endRow: number } {
        let endRow = getModelEndRow(startRow, rowCount, columns.get('pdbx_PDB_model_num')!);

        let atoms = Utils.DataTable.ofDefinition(Structure.Tables.Atoms, endRow - startRow),
            positions = Utils.DataTable.ofDefinition(Structure.Tables.Positions, endRow - startRow),

            pX = positions.x, pXCol = columns.get('Cartn_x'),
            pY = positions.y, pYCol = columns.get('Cartn_y'),
            pZ = positions.z, pZCol = columns.get('Cartn_z'),

            id = atoms.id, idCol = columns.get('id'),

            altLoc = atoms.altLoc, altLocCol = columns.get('label_alt_id'),

            rowIndex = atoms.rowIndex,

            residueIndex = atoms.residueIndex,
            chainIndex = atoms.chainIndex,
            entityIndex = atoms.entityIndex,

            name = atoms.name, nameCol = columns.get('label_atom_id'),
            elementSymbol= atoms.elementSymbol, elementSymbolCol = columns.get('type_symbol'),
            occupancy = atoms.occupancy, occupancyCol = columns.get('occupancy'),
            tempFactor = atoms.tempFactor, tempFactorCol = columns.get('B_iso_or_equiv'),
            authName = atoms.authName, authNameCol = columns.get('auth_atom_id');


        let asymIdCol = columns.get('label_asym_id'),
            entityIdCol = columns.get('label_entity_id'),
            insCodeCol = columns.get('pdbx_PDB_ins_code'),

            authResSeqNumberCol = columns.get('auth_seq_id'),

            modelNumCol = columns.get('pdbx_PDB_model_num'),

            numChains = 0,
            numResidues = 0,
            numEntities = 0;

        let prev = startRow;
        for (let row = startRow; row < endRow; row++) {
            let index = row - startRow;

            id[index] = idCol.getInteger(row);
            pX[index] = pXCol.getFloat(row);
            pY[index] = pYCol.getFloat(row);
            pZ[index] = pZCol.getFloat(row);

            elementSymbol[index] = elementSymbolCol.getString(row) || Defaults.ElementSymbol;
            name[index] = nameCol.getString(row) || elementSymbol[index];
            authName[index] = authNameCol.getString(row) || name[index];

            altLoc[index] = altLocCol.getString(row);

            occupancy[index] = occupancyCol.getFloat(row);
            tempFactor[index] = tempFactorCol.getFloat(row);

            let newChain = false;
            let newResidue = !authResSeqNumberCol.areValuesEqual(prev, row) || !insCodeCol.areValuesEqual(prev, row);

            if (!asymIdCol.areValuesEqual(prev, row)) {
                newChain = true;
                newResidue = true;
            }

            if (!entityIdCol.areValuesEqual(prev, row)) {
                numEntities++;
                newChain = true;
                newResidue = true;
            }

            if (newResidue) numResidues++;
            if (newChain) numChains++;
            rowIndex[index] = row;
            residueIndex[index] = numResidues;
            chainIndex[index] = numChains;
            entityIndex[index] = numEntities;
            prev = row;
        }

        let modelId = !modelNumCol.isDefined ? Defaults.ModelId : modelNumCol.getString(startRow) || Defaults.ModelId;

        return { atoms, positions, modelId, endRow };
    }

    function buildStructure(columns: AtomSiteColumns, atoms: Structure.AtomTable): StructureWrapper {
        let count = atoms.count,

            residueIndexCol = atoms.residueIndex,
            chainIndexCol = atoms.chainIndex,
            entityIndexCol = atoms.entityIndex;

        let residues = Utils.DataTable.ofDefinition(Structure.Tables.Residues, atoms.residueIndex[atoms.count - 1] + 1),
            chains = Utils.DataTable.ofDefinition(Structure.Tables.Chains, atoms.chainIndex[atoms.count - 1] + 1),
            entities = Utils.DataTable.ofDefinition(Structure.Tables.Entities, atoms.entityIndex[atoms.count - 1] + 1);
            
        let residueName = residues.name,
            residueSeqNumber = residues.seqNumber,
            residueAsymId = residues.asymId,
            residueAuthName = residues.authName,
            residueAuthSeqNumber = residues.authSeqNumber,
            residueAuthAsymId = residues.authAsymId,
            residueInsertionCode = residues.insCode,
            residueEntityId = residues.entityId,
            residueIsHet = residues.isHet,
            residueAtomStartIndex = residues.atomStartIndex,
            residueAtomEndIndex = residues.atomEndIndex,
            residueChainIndex = residues.chainIndex,
            residueEntityIndex = residues.entityIndex;        

        let chainAsymId = chains.asymId,
            chainEntityId = chains.entityId,
            chainAuthAsymId = chains.authAsymId,
            chainAtomStartIndex = chains.atomStartIndex,
            chainAtomEndIndex = chains.atomEndIndex,
            chainResidueStartIndex = chains.residueStartIndex,
            chainResidueEndIndex = chains.residueEndIndex,
            chainEntityIndex = chains.entityIndex;

        let entityId = entities.entityId,
            entityType = entities.type,
            entityAtomStartIndex = entities.atomStartIndex,
            entityAtomEndIndex = entities.atomEndIndex,
            entityResidueStartIndex = entities.residueStartIndex,
            entityResidueEndIndex = entities.residueEndIndex,
            entityChainStartIndex = entities.chainStartIndex,
            entityChainEndIndex = entities.chainEndIndex;

        let resNameCol = columns.get('label_comp_id'),
            resSeqNumberCol = columns.get('label_seq_id'),
            asymIdCol = columns.get('label_asym_id'),

            authResNameCol = columns.get('auth_comp_id'),
            authResSeqNumberCol = columns.get('auth_seq_id'),
            authAsymIdCol = columns.get('auth_asym_id'),

            isHetCol = columns.get('group_PDB'),

            entityCol = columns.get('label_entity_id'),
            insCodeCol = columns.get('pdbx_PDB_ins_code');

        let residueStart = 0, chainStart = 0, entityStart = 0,
            entityChainStart = 0, entityResidueStart = 0,
            chainResidueStart = 0,

            currentResidue = 0, currentChain = 0, currentEntity = 0;

        let i = 0;
        for (i = 0; i < count; i++) {
            if (residueIndexCol[i] !== residueIndexCol[residueStart]) {
                residueName[currentResidue] = resNameCol.getString(residueStart) || Defaults.ResidueName;
                residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
                residueAsymId[currentResidue] = asymIdCol.getString(residueStart) || Defaults.AsymId;
                residueAuthName[currentResidue] = authResNameCol.getString(residueStart) || residueName[currentResidue];
                residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
                residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart) || residueAsymId[currentResidue];
                residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
                residueEntityId[currentResidue] = entityCol.getString(residueStart) || Defaults.EntityId;
                residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;

                residueAtomStartIndex[currentResidue] = residueStart;
                residueAtomEndIndex[currentResidue] = i;
                residueChainIndex[currentResidue] = currentChain;
                residueEntityIndex[currentResidue] = currentEntity;

                currentResidue++;
                residueStart = i;
            }

            if (chainIndexCol[i] !== chainIndexCol[chainStart]) {
                chainAsymId[currentChain] = asymIdCol.getString(chainStart) || Defaults.AsymId;
                chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart) || chainAsymId[currentChain];
                chainEntityId[currentChain] = entityCol.getString(chainStart) || Defaults.EntityId;
                chainResidueStartIndex[currentChain] = chainResidueStart;
                chainResidueEndIndex[currentChain] = currentResidue;
                chainAtomStartIndex[currentChain] = chainStart;
                chainAtomEndIndex[currentChain] = i;
                chainEntityIndex[currentChain] = currentEntity;

                currentChain++;
                chainStart = i;
                chainResidueStart = currentResidue;
            }

            if (entityIndexCol[i] !== entityIndexCol[entityStart]) {
                entityId[currentEntity] = entityCol.getString(entityStart) || Defaults.EntityId;
                entityType[currentEntity] = 'unknown';
                entityAtomStartIndex[currentEntity] = entityStart;
                entityAtomEndIndex[currentEntity] = i;
                entityResidueStartIndex[currentEntity] = entityResidueStart;
                entityResidueEndIndex[currentEntity] = currentResidue;
                entityChainStartIndex[currentEntity] = entityChainStart;
                entityChainEndIndex[currentEntity] = currentChain;

                currentEntity++;
                entityStart = i;
                entityChainStart = currentChain;
                entityResidueStart = currentResidue;
            }

        }

        // entity
        entityId[currentEntity] = entityCol.getString(entityStart) || Defaults.EntityId;
        entityType[currentEntity] = 'unknown';
        entityAtomStartIndex[currentEntity] = entityStart;
        entityAtomEndIndex[currentEntity] = i;
        entityResidueStartIndex[currentEntity] = entityResidueStart;
        entityResidueEndIndex[currentEntity] = currentResidue + 1;
        entityChainStartIndex[currentEntity] = entityChainStart;
        entityChainEndIndex[currentEntity] = currentChain + 1;

        // chain
        chainAsymId[currentChain] = asymIdCol.getString(chainStart) || Defaults.AsymId;
        chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart) || chainAsymId[currentChain];
        chainEntityId[currentChain] = entityCol.getString(chainStart) || Defaults.EntityId;
        chainResidueStartIndex[currentChain] = chainResidueStart;
        chainResidueEndIndex[currentChain] = currentResidue + 1;
        chainAtomStartIndex[currentChain] = chainStart;
        chainAtomEndIndex[currentChain] = i;
        chainEntityIndex[currentChain] = currentEntity;

        // residue
        residueName[currentResidue] = resNameCol.getString(residueStart) || Defaults.ResidueName;
        residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
        residueAsymId[currentResidue] = asymIdCol.getString(residueStart) || Defaults.AsymId;
        residueAuthName[currentResidue] = authResNameCol.getString(residueStart) || residueName[currentResidue];
        residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
        residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart) || residueAsymId[currentResidue];
        residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
        residueAtomStartIndex[currentResidue] = residueStart;
        residueAtomEndIndex[currentResidue] = i;
        residueChainIndex[currentResidue] = currentChain;
        residueEntityIndex[currentResidue] = currentEntity;
        residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;

        return { residues, chains, entities };
    }

    function assignEntityTypes(category: CIF.Category | undefined, entities: Structure.EntityTable) {
        let i: number;

        if (!category) {
            return;
        }

        let data: { [id: string]: Structure.Entity.Type } = {},
            typeCol = category.getColumn('type'), idCol = category.getColumn('id');
        for (i = 0; i < category.rowCount; i++) {
            let t = (typeCol.getString(i) || '').toLowerCase();
            let eId = idCol.getString(i) || Defaults.EntityId;
            switch (t) {
                case 'polymer':
                case 'non-polymer':
                case 'water': 
                    data[eId] = t;
                    break;
                default: 
                    data[eId] = 'unknown'; 
                    break;
            }
        }

        for (i = 0; i < entities.count; i++) {
            let et = data[entities.entityId[i]];
            if (et !== void 0) {
                entities.type[i] = et;
            }
        }
    }

    function residueIdfromColumns(row: number, asymId: CIF.Column, seqNum: CIF.Column, insCode: CIF.Column) {
        return new Structure.PolyResidueIdentifier(asymId.getString(row) || Defaults.AsymId, seqNum.getInteger(row), insCode.getString(row));
    }


    const aminoAcidNames: { [id: string]: boolean } = { 'ALA': true, 'ARG': true, 'ASP': true, 'CYS': true, 'GLN': true, 'GLU': true, 'GLY': true, 'HIS': true, 'ILE': true, 'LEU': true, 'LYS': true, 'MET': true, 'PHE': true, 'PRO': true, 'SER': true, 'THR': true, 'TRP': true, 'TYR': true, 'VAL': true, 'ASN': true, 'PYL': true, 'SEC': true };

    function isResidueAminoSeq(atoms: Structure.AtomTable, residues: Structure.ResidueTable, entities: Structure.EntityTable, index: number) {
        if (entities.type[residues.entityIndex[index]] !== 'polymer') return false;

        //if (mmCif.aminoAcidNames[residues.name[index]]) return true;

        let ca = false, o = false,
            names = atoms.name,
            assigned = 0;

        for (let i = residues.atomStartIndex[index], max = residues.atomEndIndex[index]; i < max; i++) {
            let n = names[i];
            if (!ca && n === 'CA') {
                ca = true;
                assigned++;
            } else if (!o && n === 'O') {
                o = true;
                assigned++;
            }
            if (assigned === 2) break;
        }

        return (ca && o) || (ca && !residues.isHet[index]);
    }

    function isResidueNucleotide(atoms: Structure.AtomTable, residues: Structure.ResidueTable, entities: Structure.EntityTable, index: number) {

        if (aminoAcidNames[residues.name[index]] || entities.type[residues.entityIndex[index]] !== 'polymer') return false;

        let names = atoms.name, assigned = 0;        
        let start = residues.atomStartIndex[index], end = residues.atomEndIndex[index];

        // test for single atom instances
        if (end - start === 1 && !residues.isHet[start] && names[start] === 'P') {
            return true;
        }

        for (let i = start; i < end; i++) {
            let n = names[i];
            if (n === `O5'` || n === `C3'` || n === `N3` || n === `P`) {
                assigned++;
            }
            if (assigned >= 3) {
                return true;
            }
        }
        return false;
    }

    function analyzeSecondaryStructure(atoms: Structure.AtomTable, residues: Structure.ResidueTable, entities: Structure.EntityTable, start: number, end: number, elements: Structure.SecondaryStructureElement[]) {
        let asymId = residues.asymId,
            entityIndex = residues.entityIndex,
            currentType = Structure.SecondaryStructureType.None,
            currentElementStartIndex = start, currentResidueIndex = start,
            residueCount = end;

        while (currentElementStartIndex < residueCount) {
            if (isResidueNucleotide(<any>atoms, residues, entities, currentElementStartIndex)) {
                currentResidueIndex = currentElementStartIndex + 1;
                while (currentResidueIndex < residueCount
                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                    && isResidueNucleotide(<any>atoms, residues, entities, currentResidueIndex)) {
                    currentResidueIndex++;
                }
                currentType = Structure.SecondaryStructureType.Strand;
            } else if (isResidueAminoSeq(<any>atoms, residues, entities, currentElementStartIndex)) {
                currentResidueIndex = currentElementStartIndex + 1;
                while (currentResidueIndex < residueCount
                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                    && isResidueAminoSeq(<any>atoms, residues, entities, currentResidueIndex)) {
                    currentResidueIndex++;
                }
                currentType = Structure.SecondaryStructureType.AminoSeq;
            } else {
                currentResidueIndex = currentElementStartIndex + 1;
                while (currentResidueIndex < residueCount
                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                    && !isResidueNucleotide(<any>atoms, residues, entities, currentResidueIndex)
                    && !isResidueAminoSeq(<any>atoms, residues, entities, currentResidueIndex)) {
                    currentResidueIndex++;
                }
                currentType = Structure.SecondaryStructureType.None;
            }

            let e = new Structure.SecondaryStructureElement(currentType,
                new Structure.PolyResidueIdentifier(residues.asymId[currentElementStartIndex], residues.seqNumber[currentElementStartIndex], residues.insCode[currentElementStartIndex]),
                new Structure.PolyResidueIdentifier(residues.asymId[currentResidueIndex - 1], residues.seqNumber[currentResidueIndex - 1], residues.insCode[currentResidueIndex - 1]));
            e.startResidueIndex = currentElementStartIndex;
            e.endResidueIndex = currentResidueIndex;
            elements[elements.length] = e;
            currentElementStartIndex = currentResidueIndex;
        }
    }

    function splitNonconsecutiveSecondaryStructure(residues: Structure.ResidueTable, elements: Structure.SecondaryStructureElement[]) {

        let ret: Structure.SecondaryStructureElement[] = []
        let authSeqNumber = residues.authSeqNumber;

        for (let s of elements) {

            let partStart = s.startResidueIndex;
            let end = s.endResidueIndex - 1;
            for (let i = s.startResidueIndex; i < end; i++) {

                if (authSeqNumber[i + 1] - authSeqNumber[i] === 1) continue;

                let e = new Structure.SecondaryStructureElement(s.type, s.startResidueId, s.endResidueId, s.info);
                e.startResidueIndex = partStart;
                e.endResidueIndex = i + 1;
                ret[ret.length] = e;
                partStart = i + 1;
            }

            if (partStart === s.startResidueIndex) {
                ret[ret.length] = s;
            } else {
                let e = new Structure.SecondaryStructureElement(s.type, s.startResidueId, s.endResidueId, s.info);
                e.startResidueIndex = partStart;
                e.endResidueIndex = s.endResidueIndex;
                ret[ret.length] = e;
            }
        }

        return ret;
    }

    function updateSSIndicesAndFilterEmpty(elements: Structure.SecondaryStructureElement[], structure: StructureWrapper) {
        let residues = structure.residues,
            count = residues.count,
            asymId = residues.asymId, seqNumber = residues.seqNumber, insCode = residues.insCode,
            currentElement: Structure.SecondaryStructureElement | undefined = void 0,
            key = '',
            starts = Utils.FastMap.create<string, Structure.SecondaryStructureElement>(),
            ends = Utils.FastMap.create<string, Structure.SecondaryStructureElement>();

        for (let e of elements) {
            key = e.startResidueId.asymId + ' ' + e.startResidueId.seqNumber;
            if (e.startResidueId.insCode) key += ' ' + e.startResidueId.insCode;
            starts.set(key, e);

            key = e.endResidueId.asymId + ' ' + e.endResidueId.seqNumber;
            if (e.endResidueId.insCode) key += ' ' + e.endResidueId.insCode;
            ends.set(key, e);
        }

        for (let i = 0; i < count; i++) {

            key = asymId[i] + ' ' + seqNumber[i];
            if (insCode[i]) key += ' ' + insCode[i];

            currentElement = starts.get(key);
            if (currentElement) {
                currentElement.startResidueIndex = i;
                currentElement.endResidueIndex = i + 1;
            }

            currentElement = ends.get(key);
            if (currentElement) {
                if (currentElement.startResidueIndex < 0) currentElement.startResidueIndex = i;
                currentElement.endResidueIndex = i + 1;
            }
        }

        if (currentElement) {
            currentElement.endResidueIndex = count;
        }


        let nonEmpty: Structure.SecondaryStructureElement[] = [];
        for (let e of elements) {
            if (e.startResidueIndex < 0 || e.endResidueIndex < 0) continue;
            if (e.type === Structure.SecondaryStructureType.Sheet && e.length < 3) continue;
            if (e.endResidueIndex >= 0 && e.startResidueIndex >= 0) nonEmpty[nonEmpty.length] = e;
        }

        nonEmpty.sort((a, b) => a.startResidueIndex - b.startResidueIndex);

        // fix one-off "overlaps" for helices
        for (let i = 0; i < nonEmpty.length - 1; i++) {
            if (nonEmpty[i + 1].startResidueIndex - nonEmpty[i].endResidueIndex === -1) {
                nonEmpty[i + 1].startResidueIndex++;
            }
        }

        if (!nonEmpty.length) return nonEmpty;

        let ret = [nonEmpty[0]];
        // handle overlapping structures.
        for (let i = 1; i < nonEmpty.length; i++) {
            let a = ret[ret.length - 1], b = nonEmpty[i];
            if (b.startResidueIndex < a.endResidueIndex) {
                handleSecondaryStructureCollision(a, b);
            } else {
                ret[ret.length] = b;
            }
        }

        return ret;

    }

    function handleSecondaryStructureCollision(a: Structure.SecondaryStructureElement, b: Structure.SecondaryStructureElement) {
        if (b.endResidueIndex > a.endResidueIndex) {
            a.endResidueIndex = b.endResidueIndex;
        }
    }

    function getSecondaryStructureInfo(data: CIF.DataBlock, atoms: Structure.AtomTable, structure: StructureWrapper): Structure.SecondaryStructureElement[] {
        let input: Structure.SecondaryStructureElement[] = [],
            elements: Structure.SecondaryStructureElement[] = [];

        let _struct_conf = data.getCategory('_struct_conf'),
            _struct_sheet_range = data.getCategory('_struct_sheet_range'),
            i: number;

        if (_struct_conf) {

            let type_id_col = _struct_conf.getColumn('conf_type_id');

            if (type_id_col) {

                let beg_label_asym_id = _struct_conf.getColumn('beg_label_asym_id');
                let beg_label_seq_id = _struct_conf.getColumn('beg_label_seq_id');
                let pdbx_beg_PDB_ins_code = _struct_conf.getColumn('pdbx_beg_PDB_ins_code');
                let end_label_asym_id = _struct_conf.getColumn('end_label_asym_id');
                let end_label_seq_id = _struct_conf.getColumn('end_label_seq_id');
                let pdbx_end_PDB_ins_code = _struct_conf.getColumn('pdbx_end_PDB_ins_code');
                let pdbx_PDB_helix_class = _struct_conf.getColumn('pdbx_PDB_helix_class');

                for (i = 0; i < _struct_conf.rowCount; i++) {

                    let type: Structure.SecondaryStructureType | undefined;

                    switch ((type_id_col.getString(i) || '').toUpperCase()) {
                        case 'HELX_P': type = Structure.SecondaryStructureType.Helix; break;
                        case 'TURN_P': type = Structure.SecondaryStructureType.Turn; break;
                    }
                    if (!type) continue;

                    input[input.length] = new Structure.SecondaryStructureElement(
                        type,
                        residueIdfromColumns(i, beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code),
                        residueIdfromColumns(i, end_label_asym_id, end_label_seq_id, pdbx_end_PDB_ins_code),
                        {
                            helixClass: pdbx_PDB_helix_class.getString(i)
                        });
                }
            }
        }

        if (_struct_sheet_range) {
            let beg_label_asym_id = _struct_sheet_range.getColumn('beg_label_asym_id');
            let beg_label_seq_id = _struct_sheet_range.getColumn('beg_label_seq_id');
            let pdbx_beg_PDB_ins_code = _struct_sheet_range.getColumn('pdbx_beg_PDB_ins_code');
            let end_label_asym_id = _struct_sheet_range.getColumn('end_label_asym_id');
            let end_label_seq_id = _struct_sheet_range.getColumn('end_label_seq_id');
            let pdbx_end_PDB_ins_code = _struct_sheet_range.getColumn('pdbx_end_PDB_ins_code');

            let symmetry = _struct_sheet_range.getColumn('symmetry');
            let sheet_id = _struct_sheet_range.getColumn('sheet_id');
            let id = _struct_sheet_range.getColumn('id');
            
            for (i = 0; i < _struct_sheet_range.rowCount; i++) {
                input[input.length] = new Structure.SecondaryStructureElement(
                    Structure.SecondaryStructureType.Sheet,
                    residueIdfromColumns(i, beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code),
                    residueIdfromColumns(i, end_label_asym_id, end_label_seq_id, pdbx_end_PDB_ins_code),
                    {
                        symmetry: symmetry.getString(i),
                        sheetId: sheet_id.getString(i),
                        id: id.getString(i)
                    });
            }
        }

        let secondary = input.length > 0 ? updateSSIndicesAndFilterEmpty(input, structure) : [];


        let residues = structure.residues,
            residueCount = residues.count;

        if (secondary.length === 0) {
            analyzeSecondaryStructure(atoms, residues, structure.entities, 0, residueCount, elements);
            return splitNonconsecutiveSecondaryStructure(residues, elements);
        }

        let _max = secondary.length - 1;
        if (secondary[0].startResidueIndex > 0) {
            analyzeSecondaryStructure(atoms, residues, structure.entities, 0, secondary[0].startResidueIndex, elements);
        }
        for (i = 0; i < _max; i++) {
            elements[elements.length] = secondary[i];
            if (secondary[i + 1].startResidueIndex - secondary[i].endResidueIndex > 0) {
                analyzeSecondaryStructure(atoms, residues, structure.entities, secondary[i].endResidueIndex, secondary[i + 1].startResidueIndex, elements);
            }
        }
        elements[elements.length] = secondary[_max];
        if (secondary[_max].endResidueIndex < residueCount) {
            analyzeSecondaryStructure(atoms, residues, structure.entities, secondary[_max].endResidueIndex, residueCount, elements);
        }

        return splitNonconsecutiveSecondaryStructure(residues, elements);
    }

    function assignSecondaryStructureIndex(residues: Structure.ResidueTable, ss: Structure.SecondaryStructureElement[]) {
        let ssIndex = residues.secondaryStructureIndex;

        let index = 0;
        for (let s of ss) {
            for (let i = s.startResidueIndex; i < s.endResidueIndex; i++) {
                ssIndex[i] = index;
            }
            index++;
        }

        return ssIndex;
    }

    function findResidueIndexByLabel(structure: StructureWrapper, asymId: string, seqNumber: number, insCode: string | null) {
        const { asymId: _asymId, residueStartIndex, residueEndIndex, count: cCount } = structure.chains;
        const { seqNumber: _seqNumber, insCode: _insCode } = structure.residues;

        for (let cI = 0; cI < cCount; cI++) {
            if (_asymId[cI] !== asymId) continue;
            for (let rI = residueStartIndex[cI], _r = residueEndIndex[cI]; rI < _r; rI++) {
                if (_seqNumber[rI] === seqNumber && _insCode[rI] === insCode) return rI;
            }
        }
        return -1;
    }

    function findAtomIndexByLabelName(atoms: Structure.AtomTable, structure: StructureWrapper, residueIndex: number, atomName: string, altLoc: string | null) {
        const { atomStartIndex, atomEndIndex } = structure.residues;
        const { name: _atomName, altLoc: _altLoc } = atoms;

        for (let i = atomStartIndex[residueIndex], _i = atomEndIndex[residueIndex]; i <= _i; i++) {
            if (_atomName[i] === atomName && _altLoc[i] === altLoc) return i;
        }
        return -1;
    }

    function getModRes(data: CIF.DataBlock): Structure.ModifiedResidueTable | undefined {
        const cat = data.getCategory('_pdbx_struct_mod_residue');
        if (!cat) return void 0;

        const table = Utils.DataTable.ofDefinition(Structure.Tables.ModifiedResidues, cat.rowCount);
        const label_asym_id = cat.getColumn('label_asym_id');
        const label_seq_id = cat.getColumn('label_seq_id');
        const PDB_ins_code = cat.getColumn('PDB_ins_code');
        const parent_comp_id = cat.getColumn('parent_comp_id');
        const _details = cat.getColumn('details');

        const { asymId, seqNumber, insCode, parent, details } = table;

        for (let i = 0, __i = cat.rowCount; i < __i; i++) {
            asymId[i] = label_asym_id.getString(i)!;
            seqNumber[i] = label_seq_id.getInteger(i)!;
            insCode[i] = PDB_ins_code.getString(i);
            parent[i] = parent_comp_id.getString(i)!;
            details[i] = _details.getString(i);
        }

        return table;
    }

    export type StructConnType = 
          'covale'
        | 'covale_base'
        | 'covale_phosphate'
        | 'covale_sugar'
        | 'disulf'
        | 'hydrog'
        | 'metalc'
        | 'mismat'
        | 'modres'
        | 'saltbr'

    function getStructConn(data: CIF.DataBlock, atoms: Structure.AtomTable, structure: StructureWrapper): Structure.StructConn | undefined {
        const cat = data.getCategory('_struct_conn');
        if (!cat) return void 0;

        const _idCols = (i: number) => ({
            label_asym_id: cat.getColumn('ptnr' + i + '_label_asym_id'),
            label_seq_id: cat.getColumn('ptnr' + i + '_label_seq_id'),
            label_atom_id: cat.getColumn('ptnr' + i + '_label_atom_id'),
            label_alt_id: cat.getColumn('pdbx_ptnr' + i + '_label_alt_id'),
            ins_code: cat.getColumn('pdbx_ptnr' + i + '_PDB_ins_code'),
            symmetry: cat.getColumn('ptnr' + i + '_symmetry')
        });

        const conn_type_id = cat.getColumn('conn_type_id');        
        const pdbx_dist_value = cat.getColumn('pdbx_dist_value');
        const pdbx_value_order = cat.getColumn('pdbx_value_order');
        const p1 = _idCols(1);
        const p2 = _idCols(2);
        const p3 = _idCols(3);

        const _p = (row: number, ps: typeof p1) => {
            if (ps.label_asym_id.getValuePresence(row) !== CIF.ValuePresence.Present) return void 0;
            const residueIndex = findResidueIndexByLabel(structure, ps.label_asym_id.getString(row)!, ps.label_seq_id.getInteger(row), ps.ins_code.getString(row));
            if (residueIndex < 0) return void 0;
            const atomIndex = findAtomIndexByLabelName(atoms, structure, residueIndex, ps.label_atom_id.getString(row)!, ps.label_alt_id.getString(row));
            if (atomIndex < 0) return void 0;
            return { residueIndex, atomIndex, symmetry: ps.symmetry.getString(row) || '1_555' };
        }

        const _ps = (row: number) => {
            const ret = [];
            let p = _p(row, p1);
            if (p) ret.push(p);
            p = _p(row, p2);
            if (p) ret.push(p);
            p = _p(row, p3);
            if (p) ret.push(p);
            return ret;
        }

        const entries: Structure.StructConn.Entry[] = [];
        for (let i = 0; i < cat.rowCount; i++) {
            const partners = _ps(i);
            if (partners.length < 2) continue;

            const type = conn_type_id.getString(i)! as StructConnType;
            const orderType = (pdbx_value_order.getString(i) || '').toLowerCase();
            let bondType = Structure.BondType.Unknown;

            switch (orderType) {
                case 'sing': bondType = Structure.BondType.Single; break; 
                case 'doub': bondType = Structure.BondType.Double; break;
                case 'trip': bondType = Structure.BondType.Triple; break;
                case 'quad': bondType = Structure.BondType.Aromatic; break;
            }

            switch (type) {
                case 'disulf': bondType = Structure.BondType.DisulfideBridge; break; 
                case 'hydrog': bondType = Structure.BondType.Hydrogen; break; 
                case 'metalc': bondType = Structure.BondType.Metallic; break; 
                //case 'mismat': bondType = Structure.BondType.Single; break; 
                case 'saltbr': bondType = Structure.BondType.Ion; break; 
            }        

            entries.push({ 
                bondType,
                distance: pdbx_dist_value.getFloat(i), 
                partners
            });
        }

        return new Structure.StructConn(entries);
    }

    function parseOperatorList(value: string): string[][] {
        // '(X0)(1-5)' becomes [['X0']['1', '2', '3', '4', '5']]
        // kudos to Glen van Ginkel.

        let oeRegex = /\(?([^\(\)]+)\)?]*/g, g: any, groups: string[] = [],
            ret: string[][] = [];
        while (g = oeRegex.exec(value)) groups[groups.length] = g[1];

        groups.forEach(g => {
            let group: string[] = [];
            g.split(',').forEach(e => {
                let dashIndex = e.indexOf('-');
                if (dashIndex > 0) {
                    let from = parseInt(e.substring(0, dashIndex)), to = parseInt(e.substr(dashIndex + 1));
                    for (let i = from; i <= to; i++) group[group.length] = i.toString();
                } else {
                    group[group.length] = e.trim();
                }
            });
            ret[ret.length] = group;
        });

        return ret;
    }

    function getAssemblyInfo(data: CIF.DataBlock): Structure.AssemblyInfo | undefined {
        let _info = data.getCategory('_pdbx_struct_assembly'),
            _gen = data.getCategory('_pdbx_struct_assembly_gen'),
            _opers = data.getCategory('_pdbx_struct_oper_list');

        if (!_info || !_gen || !_opers) {
            return void 0;
        }

        let i: number,
            opers: { [id: string]: Structure.AssemblyOperator } = {},
            gens: Structure.AssemblyGen[] = [],
            genMap = Utils.FastMap.create<string, Structure.AssemblyGen>();

        let assembly_id = _gen.getColumn('assembly_id');
        let oper_expression = _gen.getColumn('oper_expression');
        let asym_id_list = _gen.getColumn('asym_id_list');
        for (i = 0; i < _gen.rowCount; i++) {

            let id = assembly_id.getString(i);
            if (!id) {
                return void 0;
            }
            let entry = genMap.get(id);

            if (!entry) {
                entry = new Structure.AssemblyGen(id);
                genMap.set(id, entry);
                gens.push(entry);
            }

            entry.gens.push(new Structure.AssemblyGenEntry(
                parseOperatorList(oper_expression.getString(i) as string),
                asym_id_list.getString(i) !.split(',')
            ));
        }


        let _pdbx_struct_oper_list_id = _opers.getColumn('id');
        let _pdbx_struct_oper_list_name = _opers.getColumn('name');
        for (i = 0; i < _opers.rowCount; i++) {
            let oper = getTransform(_opers, 'matrix', 'vector', i);
            if (!oper) {
                return void 0;
            }
            let op = new Structure.AssemblyOperator(_pdbx_struct_oper_list_id.getString(i) as string, _pdbx_struct_oper_list_name.getString(i) as string, oper);
            opers[op.id] = op;
        }

        return new Structure.AssemblyInfo(opers, gens);
    }

    function getSymmetryInfo(data: CIF.DataBlock): Structure.SymmetryInfo | undefined {
        let _cell = data.getCategory('_cell'),
            _symmetry = data.getCategory('_symmetry'),
            _atom_sites = data.getCategory('_atom_sites');

        let spacegroupName = '',
            cellSize = [1.0, 1.0, 1.0],
            cellAngles = [90.0, 90.0, 90.0],
            toFracTransform = Geometry.LinearAlgebra.Matrix4.identity(),
            isNonStandardCrytalFrame = false;

        if (!_cell || !_symmetry) {
            return void 0;
        }

        spacegroupName = _symmetry.getColumn('space_group_name_H-M').getString(0) as string;
        cellSize = [_cell.getColumn('length_a').getFloat(0), _cell.getColumn('length_b').getFloat(0), _cell.getColumn('length_c').getFloat(0)];
        cellAngles = [_cell.getColumn('angle_alpha').getFloat(0), _cell.getColumn('angle_beta').getFloat(0), _cell.getColumn('angle_gamma').getFloat(0)];

        if (!spacegroupName || cellSize.every(s => isNaN(s) || s === 0.0) || cellSize.every(s => isNaN(s) || s === 0.0)) {
            return void 0;
        }

        let sq = (x: number) => x * x;
        let toRadians = (degs: number) => degs * Math.PI / 180.0;
        let la = cellSize[0], lb = cellSize[1], lc = cellSize[2],
            aa = toRadians(cellAngles[0]), ab = toRadians(cellAngles[1]), ac = toRadians(cellAngles[2]),
            v = la * lb * lc * Math.sqrt(1.0 - sq(Math.cos(aa)) - sq(Math.cos(ab)) - sq(Math.cos(ac)) + 2.0 * Math.cos(aa) * Math.cos(ab) * Math.cos(ac));

        let fromFrac = Geometry.LinearAlgebra.Matrix4.ofRows([
            [la, lb * Math.cos(ac), lc * Math.cos(ab), 0.0],
            [0.0, lb * Math.sin(ac), lc * (Math.cos(aa) - Math.cos(ab) * Math.cos(ac)) / Math.sin(ac), 0.0],
            [0.0, 0.0, v / (la * lb * Math.sin(ac)), 0.0],
            [0.0, 0.0, 0.0, 1.0]]);
        let toFracComputed = Geometry.LinearAlgebra.Matrix4.identity();
        Geometry.LinearAlgebra.Matrix4.invert(toFracComputed, fromFrac);

        if (_atom_sites) {
            let transform = getTransform(_atom_sites, 'fract_transf_matrix', 'fract_transf_vector', 0);
            if (transform) {
                toFracTransform = transform;
                if (!Geometry.LinearAlgebra.Matrix4.areEqual(toFracComputed, transform, 0.0001)) {
                    isNonStandardCrytalFrame = true;
                }
            }
        } else {
            toFracTransform = toFracComputed;
        }

        return new Structure.SymmetryInfo(spacegroupName, cellSize, cellAngles, <any>toFracTransform, isNonStandardCrytalFrame);
    }


    function getComponentBonds(category: CIF.Category | undefined): Structure.ComponentBondInfo | undefined {
        if (!category || !category.rowCount) return void 0;

        let info = new Structure.ComponentBondInfo();

        let idCol = category.getColumn('comp_id'),
            nameACol = category.getColumn('atom_id_1'),
            nameBCol = category.getColumn('atom_id_2'),
            orderCol = category.getColumn('value_order'),

            count = category.rowCount;

        let entry = info.newEntry(idCol.getString(0) as string);

        for (let i = 0; i < count; i++) {

            let id = idCol.getString(i) as string,
                nameA = nameACol.getString(i) as string,
                nameB = nameBCol.getString(i) as string,
                order = orderCol.getString(i) as string;

            if (entry.id !== id) {
                entry = info.newEntry(id);
            }

            let t: Structure.BondType;

            switch (order.toLowerCase()) {
                case 'sing': t = Structure.BondType.Single; break;
                case 'doub':
                case 'delo':
                    t = Structure.BondType.Double;
                    break;
                case 'trip': t = Structure.BondType.Triple; break;
                case 'quad': t = Structure.BondType.Aromatic; break;
                default: t = Structure.BondType.Unknown; break;
            }

            entry.add(nameA, nameB, t);
        }

        return info;
    }

    function getModel(startRow: number, data: CIF.DataBlock, atomSiteColumns: AtomSiteColumns): { model: Structure.Molecule.Model; endRow: number } {

        let { atoms, positions, modelId, endRow } = buildModelAtomTable(startRow, data.getCategory('_atom_site')!.rowCount, atomSiteColumns),
            structure = buildStructure(atomSiteColumns, atoms),
            entry = data.getCategory('_entry'),
            id: string;

        if (entry && entry.getColumn('id').isDefined) id = entry.getColumn('id').getString(0) as string;
        else id = data.header;

        assignEntityTypes(data.getCategory('_entity'), <any>structure.entities);
        let ss = getSecondaryStructureInfo(data, atoms, structure);
        assignSecondaryStructureIndex(structure.residues, ss);

        return {
            model: Structure.Molecule.Model.create({
                id,
                modelId,
                data: { 
                    atoms,
                    residues: structure.residues,
                    chains: structure.chains,
                    entities: structure.entities,
                    bonds: { 
                        structConn: getStructConn(data, atoms, structure),
                        component: getComponentBonds(data.getCategory('_chem_comp_bond'))
                    },
                    modifiedResidues: getModRes(data),
                    secondaryStructure: ss,
                    symmetryInfo: getSymmetryInfo(data),
                    assemblyInfo: getAssemblyInfo(data),
                },
                positions,
                source: Structure.Molecule.Model.Source.File
            }),
            endRow
        };
    }

    export function ofDataBlock(data: CIF.DataBlock): Structure.Molecule {
        let models: Structure.Molecule.Model[] = [],
            atomSite = data.getCategory('_atom_site'),
            startRow = 0;

        if (!atomSite) {
            throw `'_atom_site' category is missing in the input.`;
        }

        let entry = data.getCategory('_entry'),
            atomColumns = getAtomSiteColumns(atomSite),
            id: string;

        if (entry && entry.getColumn('id').isDefined) id = entry.getColumn('id').getString(0)!;
        else id = data.header;

        while (startRow < atomSite.rowCount) {
            let { model, endRow } = getModel(startRow, data, atomColumns);
            models.push(model);
            startRow = endRow;
        }

        let experimentMethods: string[] | undefined = void 0;
        let _exptl = data.getCategory('_exptl');
        if (_exptl) {
            experimentMethods = [];
            const method = _exptl.getColumn('method');
            for (let i = 0; i < _exptl.rowCount; i++) {
                if (method.getValuePresence(i) !== CIF.ValuePresence.Present) continue;
                experimentMethods.push(method.getString(i)!);
            }
        }

        return Structure.Molecule.create(id, models, { experimentMethods });
    }
}