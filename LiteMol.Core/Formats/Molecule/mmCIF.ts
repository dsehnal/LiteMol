/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule.mmCIF {
    "use strict";


    type StructureWrapper = { residues: Structure.DefaultResidueTableSchema, chains: Structure.DefaultChainTableSchema, entities: Structure.DefaultEntityTableSchema };
            
    function getModelEndRow(startRow: number, _atom_site: CIF.Category) {
        let size = _atom_site.rowCount,
            modelNum = _atom_site.getColumn('pdbx_PDB_model_num'),
            i = 0;
        
        if (!modelNum.isDefined) return size;
        for (i = startRow + 1; i < size; i++) {
            if (!modelNum.areValuesEqual(i - 1, i)) break;
        }
        return i;
    }

    function buildModelAtomTable(startRow: number, category: CIF.Category): { atoms: Structure.DefaultAtomTableSchema; modelId: string; endRow: number } {

        let endRow = getModelEndRow(startRow, category);
        
        let colCount = category.columnCount,
            atoms = new Structure.DataTableBuilder(endRow - startRow),
            id = atoms.addColumn('id', size => new Int32Array(size)), idCol = category.getColumn('id'),
            pX = atoms.addColumn('x', size => new Float32Array(size)), pXCol = category.getColumn('Cartn_x'),
            pY = atoms.addColumn('y', size => new Float32Array(size)), pYCol = category.getColumn('Cartn_y'),
            pZ = atoms.addColumn('z', size => new Float32Array(size)), pZCol = category.getColumn('Cartn_z'),

            altLoc = atoms.addColumn('altLoc', size => new Array(size)), altLocCol = category.getColumn('label_alt_id'),

            rowIndex = atoms.addColumn('rowIndex', size => new Int32Array(size)),

            residueIndex = atoms.addColumn('residueIndex', size => new Int32Array(size)),
            chainIndex = atoms.addColumn('chainIndex', size => new Int32Array(size)),
            entityIndex = atoms.addColumn('entityIndex', size => new Int32Array(size)),

            name: string[] = atoms.addColumn('name', size => new Array(size)), nameCol = category.getColumn('label_atom_id'),
            elementSymbol: string[] = atoms.addColumn('elementSymbol', size => new Array(size)), elementSymbolCol = category.getColumn('type_symbol'),
            occupancy = atoms.addColumn('occupancy', size => new Float32Array(size)), occupancyCol = category.getColumn('occupancy'),
            tempFactor = atoms.addColumn('tempFactor', size => new Float32Array(size)), tempFactorCol = category.getColumn('B_iso_or_equiv'),
            authName: string[] = atoms.addColumn('authName', size => new Array(size)), authNameCol = category.getColumn('auth_atom_id');
            

        let resSeqNumberCol = category.getColumn('label_seq_id'),
            asymIdCol = category.getColumn('label_asym_id'),
            entityIdCol = category.getColumn('label_entity_id'),
            insCodeCol = category.getColumn('pdbx_PDB_ins_code'),

            authResSeqNumberCol = category.getColumn('auth_seq_id'),

            modelNumCol = category.getColumn('pdbx_PDB_model_num'),

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

            name[index] = nameCol.getString(row);
            authName[index] = authNameCol.getString(row);
            elementSymbol[index] = elementSymbolCol.getString(row);

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
        
        let modelId = !modelNumCol.isDefined ? '1' : modelNumCol.getString(startRow);

        return {
            atoms: <Structure.DefaultAtomTableSchema>atoms.seal(),
            modelId,
            endRow
        };
    }

    function buildStructure(category: CIF.Category, atoms: Structure.DefaultAtomTableSchema): StructureWrapper {

        let count = atoms.count,

            residueIndexCol = atoms.residueIndex,
            chainIndexCol = atoms.chainIndex,
            entityIndexCol = atoms.entityIndex,

            residues = new Structure.DataTableBuilder(atoms.residueIndex[atoms.count - 1] + 1),
            chains = new Structure.DataTableBuilder(atoms.chainIndex[atoms.count - 1] + 1),
            entities = new Structure.DataTableBuilder(atoms.entityIndex[atoms.count - 1] + 1),

            residueName = residues.addColumn('name', size => <string[]>new Array(size)),
            residueSeqNumber = residues.addColumn('seqNumber', size => new Int32Array(size)),
            residueAsymId = residues.addColumn('asymId', size => <string[]>new Array(size)),
            residueAuthName = residues.addColumn('authName', size => <string[]>new Array(size)),
            residueAuthSeqNumber = residues.addColumn('authSeqNumber', size => new Int32Array(size)),
            residueAuthAsymId = residues.addColumn('authAsymId', size => <string[]>new Array(size)),
            residueInsertionCode = residues.addColumn('insCode', size => <string[]>new Array(size)),
            residueEntityId = residues.addColumn('entityId', size => <string[]>new Array(size)),
            residueIsHet = residues.addColumn('isHet', size => new Int8Array(size)),
            residueAtomStartIndex = residues.addColumn('atomStartIndex', size => new Int32Array(size)),
            residueAtomEndIndex = residues.addColumn('atomEndIndex', size => new Int32Array(size)),
            residueChainIndex = residues.addColumn('chainIndex', size => new Int32Array(size)),
            residueEntityIndex = residues.addColumn('entityIndex', size => new Int32Array(size)),
            residueSecondaryStructureIndex = residues.addColumn('secondaryStructureIndex', size => new Int32Array(size)),

            chainAsymId = chains.addColumn('asymId', size => <string[]>[]),
            chainEntityId = chains.addColumn('entityId', size => <string[]>[]),
            chainAuthAsymId = chains.addColumn('authAsymId', size => <string[]>[]),
            chainAtomStartIndex = chains.addColumn('atomStartIndex', size => new Int32Array(size)),
            chainAtomEndIndex = chains.addColumn('atomEndIndex', size => new Int32Array(size)),
            chainResidueStartIndex = chains.addColumn('residueStartIndex', size => new Int32Array(size)),
            chainResidueEndIndex = chains.addColumn('residueEndIndex', size => new Int32Array(size)),
            chainEntityIndex = chains.addColumn('entityIndex', size => new Int32Array(size)),

            entityId = entities.addColumn('entityId', size => <string[]>[]),
            entityTypeEnum = entities.addColumn('entityType', size => <Structure.EntityType[]>[]),
            entityType = entities.addColumn('type', size => <string[]>[]),
            entityAtomStartIndex = entities.addColumn('atomStartIndex', size => new Int32Array(size)),
            entityAtomEndIndex = entities.addColumn('atomEndIndex', size => new Int32Array(size)),
            entityResidueStartIndex = entities.addColumn('residueStartIndex', size => new Int32Array(size)),
            entityResidueEndIndex = entities.addColumn('residueEndIndex', size => new Int32Array(size)),
            entityChainStartIndex = entities.addColumn('chainStartIndex', size => new Int32Array(size)),
            entityChainEndIndex = entities.addColumn('chainEndIndex', size => new Int32Array(size)),

            resNameCol = category.getColumn('label_comp_id'),
            resSeqNumberCol = category.getColumn('label_seq_id'),
            asymIdCol = category.getColumn('label_asym_id'),


            authResNameCol = category.getColumn('auth_comp_id'),
            authResSeqNumberCol = category.getColumn('auth_seq_id'),
            authAsymIdCol = category.getColumn('auth_asym_id'),

            isHetCol = category.getColumn('group_PDB'),

            entityCol = category.getColumn('label_entity_id'),
            insCodeCol = category.getColumn('pdbx_PDB_ins_code'),


            residueStart = 0, chainStart = 0, entityStart = 0,
            entityChainStart = 0, entityResidueStart = 0,
            chainResidueStart = 0,

            currentResidue = 0, currentChain = 0, currentEntity = 0;
        
        let i = 0;
        for (i = 0; i < count; i++) {               

            if (residueIndexCol[i] !== residueIndexCol[residueStart]) {
                residueName[currentResidue] = resNameCol.getString(residueStart);
                residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
                residueAsymId[currentResidue] = asymIdCol.getString(residueStart);
                residueAuthName[currentResidue] = authResNameCol.getString(residueStart);
                residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
                residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart);                    
                residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
                residueEntityId[currentResidue] = entityCol.getString(residueStart);
                residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;

                residueAtomStartIndex[currentResidue] = residueStart;
                residueAtomEndIndex[currentResidue] = i;
                residueChainIndex[currentResidue] = currentChain;
                residueEntityIndex[currentResidue] = currentEntity;                    

                currentResidue++;
                residueStart = i;
            }

            if (chainIndexCol[i] !== chainIndexCol[chainStart]) {

                chainAsymId[currentChain] = asymIdCol.getString(chainStart);
                chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart);
                chainEntityId[currentChain] = entityCol.getString(chainStart);
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

                entityId[currentEntity] = entityCol.getString(entityStart);
                entityTypeEnum[currentEntity] = Structure.EntityType.Unknown;
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
        entityId[currentEntity] = entityCol.getString(entityStart);
        entityTypeEnum[currentEntity] = Structure.EntityType.Unknown;
        entityType[currentEntity] = 'unknown';
        entityAtomStartIndex[currentEntity] = entityStart;
        entityAtomEndIndex[currentEntity] = i;
        entityResidueStartIndex[currentEntity] = entityResidueStart;
        entityResidueEndIndex[currentEntity] = currentResidue + 1;
        entityChainStartIndex[currentEntity] = entityChainStart;
        entityChainEndIndex[currentEntity] = currentChain + 1;
                    
        // chain
        chainAsymId[currentChain] = asymIdCol.getString(chainStart);
        chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart);
        chainEntityId[currentChain] = entityCol.getString(chainStart);
        chainResidueStartIndex[currentChain] = chainResidueStart;
        chainResidueEndIndex[currentChain] = currentResidue + 1;
        chainAtomStartIndex[currentChain] = chainStart;
        chainAtomEndIndex[currentChain] = i;
        chainEntityIndex[currentChain] = currentEntity;

        // residue
        residueName[currentResidue] = resNameCol.getString(residueStart);
        residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
        residueAsymId[currentResidue] = asymIdCol.getString(residueStart);
        residueAuthName[currentResidue] = authResNameCol.getString(residueStart);
        residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
        residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart);
        residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
        residueAtomStartIndex[currentResidue] = residueStart;
        residueAtomEndIndex[currentResidue] = i;
        residueChainIndex[currentResidue] = currentChain;
        residueEntityIndex[currentResidue] = currentEntity;
        residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;
                
        return {
            residues: <Structure.DefaultResidueTableSchema>residues.seal(),
            chains: <Structure.DefaultChainTableSchema>chains.seal(),
            entities: <Structure.DefaultEntityTableSchema>entities.seal()
        };
    }

    function assignEntityTypes(category: CIF.Category, entities: Structure.DefaultEntityTableSchema) {

        let i: number;

        for (i = 0; i < entities.count; i++) {
            entities.entityType[i] = Structure.EntityType.Unknown;
        }

        if (!category) {
            return;
        }

        let dataEnum: { [id: string]: Structure.EntityType } = {},
            data: { [id: string]: string } = {},
            et: Structure.EntityType,
            typeCol = category.getColumn('type'), idCol = category.getColumn('id');
        for (i = 0; i < category.rowCount; i++) {

            let t = (typeCol.getString(i) || '').toLowerCase();
            switch (t) {
                case 'polymer': et = Structure.EntityType.Polymer; break;
                case 'non-polymer': et = Structure.EntityType.NonPolymer; break;
                case 'water': et = Structure.EntityType.Water; break;
                default: et = Structure.EntityType.Unknown; break;
            }
            let eId = idCol.getString(i);
            dataEnum[eId] = et;
            data[eId] = t !== '' ? t : 'unknown';
        }

        for (i = 0; i < entities.count; i++) {
            et = dataEnum[entities.entityId[i]];
            if (et !== undefined) {
                entities.entityType[i] = et;
                entities.type[i] = data[entities.entityId[i]];
            }
        }            
    }

    function residueIdfromColumns(row: number, asymId: CIF.Column, seqNum: CIF.Column, insCode: CIF.Column) {
        return new Structure.PolyResidueIdentifier(asymId.getString(row), seqNum.getInteger(row), insCode.getString(row));
    }


    const aminoAcidNames: { [id: string]: boolean } = { 'ALA': true, 'ARG': true, 'ASP': true, 'CYS': true, 'GLN': true, 'GLU': true, 'GLY': true, 'HIS': true, 'ILE': true, 'LEU': true, 'LYS': true, 'MET': true, 'PHE': true, 'PRO': true, 'SER': true, 'THR': true, 'TRP': true, 'TYR': true, 'VAL': true, 'ASN': true, 'PYL': true, 'SEC': true };

    function isResidueAminoSeq(atoms: Structure.DefaultAtomTableSchema, residues: Structure.DefaultResidueTableSchema, entities: Structure.DefaultEntityTableSchema, index: number) {


        if (entities.entityType[residues.entityIndex[index]] !== Structure.EntityType.Polymer) return false;

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

    function isResidueNucleotide(atoms: Structure.DefaultAtomTableSchema, residues: Structure.DefaultResidueTableSchema, entities: Structure.DefaultEntityTableSchema, index: number) {

        if (aminoAcidNames[residues.name[index]] || entities.entityType[residues.entityIndex[index]] !== Structure.EntityType.Polymer) return false;

        let o5 = false, c3 = false, n3 = false,
            names = atoms.name, assigned = 0;
        for (let i = residues.atomStartIndex[index], max = residues.atomEndIndex[index]; i < max; i++) {
            let n = names[i];
            if (!o5 && n === `O5'`) {
                o5 = true;
                assigned++;
            }
            else if (!c3 && n === `C3'`) {
                c3 = true;
                assigned++;
            } else if (!n3 && n === 'N3') {
                n3 = true;
                assigned++;
            }
            if (assigned === 3) break;
        }
        return o5 && c3 && n3;
    }

    function analyzeSecondaryStructure(atoms: Structure.DataTable, residues: Structure.DefaultResidueTableSchema, entities: Structure.DefaultEntityTableSchema, start: number, end: number, elements: Structure.SecondaryStructureElement[]) {
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

    function splitNonconsecutiveSecondaryStructure(residues: Structure.DefaultResidueTableSchema, elements: Structure.SecondaryStructureElement[]) {

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
            inSS = false,
            currentElement: Structure.SecondaryStructureElement, endPivot: Structure.PolyResidueIdentifier,
            key = '',
            starts = new Map<string, Structure.SecondaryStructureElement>(),
            ends = new Map<string, Structure.SecondaryStructureElement>();
        
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

    function getSecondaryStructureInfo(data: CIF.DataBlock, atoms: Structure.DataTable, structure: StructureWrapper): Structure.SecondaryStructureElement[]{

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

                    let type: Structure.SecondaryStructureType;

                    switch (type_id_col.getString(i).toUpperCase()) {
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
                        id: sheet_id.getString(i)
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

    function assignSecondaryStructureIndex(residues: Structure.DefaultResidueTableSchema, ss: Structure.SecondaryStructureElement[]) {
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

    function parseOperatorList(value: string): string[][] {
        // '(X0)(1-5)' becomes [['X0']['1', '2', '3', '4', '5']]
        // kudos to Glen van Ginkel.

        let oeRegex = /\(?([^\(\)]+)\)?]*/g, g: any, groups: string[] = [],
            ret: string[][] = [];
        while (g = oeRegex.exec(value)) groups[groups.length] = g[1];

        groups.forEach(g => {
            let group:string[] = [];
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

    function getAssemblyInfo(data: CIF.DataBlock): Structure.AssemblyInfo {
        let _info = data.getCategory('_pdbx_struct_assembly'),
            _gen = data.getCategory('_pdbx_struct_assembly_gen'),
            _opers = data.getCategory('_pdbx_struct_oper_list');

        if (!_info || !_gen || !_opers) {
            return null;
        }

        let i: number,
            opers: { [id: string]: Structure.AssemblyOperator } = {},
            gens: Structure.AssemblyGen[] = [],
            genMap = new Map<string, Structure.AssemblyGen>();

        let assembly_id = _gen.getColumn('assembly_id');
        let oper_expression = _gen.getColumn('oper_expression');
        let asym_id_list = _gen.getColumn('asym_id_list');
        for (i = 0; i < _gen.rowCount; i++) {
            
            let id = assembly_id.getString(i);
            let entry = genMap.get(id);
            
            if (!entry) {
                entry = new Structure.AssemblyGen(id);
                genMap.set(id, entry);
                gens.push(entry);
            }
                            
            entry.gens.push(new Structure.AssemblyGenEntry(
                parseOperatorList(oper_expression.getString(i)),
                asym_id_list.getString(i).split(',')     
            ));
        }


        let _pdbx_struct_oper_list_id = _opers.getColumn('id');
        let _pdbx_struct_oper_list_name = _opers.getColumn('name');
        for (i = 0; i < _opers.rowCount; i++) {
            let oper = CIF.Category.getTransform(_opers, 'matrix', 'vector', i);
            if (!oper) {
                return null;
            }
            let op = new Structure.AssemblyOperator(_pdbx_struct_oper_list_id.getString(i), _pdbx_struct_oper_list_name.getString(i), oper);
            opers[op.id] = op;
        }

        return new Structure.AssemblyInfo(opers, gens);
    }
    
    function getSymmetryInfo(data: CIF.DataBlock): Structure.SymmetryInfo {
        let _cell = data.getCategory('_cell'),
            _symmetry = data.getCategory('_symmetry'),
            _atom_sites = data.getCategory('_atom_sites');

        let spacegroupName = '',
            cellSize = [1.0, 1.0, 1.0],
            cellAngles = [90.0, 90.0, 90.0],
            toFracTransform = Geometry.LinearAlgebra.Matrix4.identity(),
            isNonStandardCrytalFrame = false;

        if (!_cell || !_symmetry) {
            return null;
        }

        spacegroupName = _symmetry.getColumn('space_group_name_H-M').getString(0);
        cellSize = [_cell.getColumn('length_a').getFloat(0), _cell.getColumn('length_b').getFloat(0), _cell.getColumn('length_c').getFloat(0)];
        cellAngles = [_cell.getColumn('angle_alpha').getFloat(0), _cell.getColumn('angle_beta').getFloat(0), _cell.getColumn('angle_gamma').getFloat(0)];

        if (!spacegroupName || cellSize.every(s => isNaN(s) || s === 0.0) || cellSize.every(s => isNaN(s) || s === 0.0)) {
            return null;
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
            let transform = CIF.Category.getTransform(_atom_sites, 'fract_transf_matrix', 'fract_transf_vector', 0);
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


    function getComponentBonds(category: CIF.Category): Structure.ComponentBondInfo {            
        if (!category || !category.rowCount) return undefined;

        let info = new Structure.ComponentBondInfo();

        let idCol = category.getColumn('comp_id'),
            nameACol = category.getColumn('atom_id_1'),
            nameBCol = category.getColumn('atom_id_2'),
            orderCol = category.getColumn('value_order'),

            count = category.rowCount;

        let entry = info.newEntry(idCol.getString(0));

        for (let i = 0; i < count; i++) {

            let id = idCol.getString(i),
                nameA = nameACol.getString(i),
                nameB = nameBCol.getString(i),
                order = orderCol.getString(i);

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

    function getModel(startRow: number, data: CIF.DataBlock): { model: Structure.MoleculeModel; endRow: number } {

        let { atoms, modelId, endRow } = buildModelAtomTable(startRow, data.getCategory('_atom_site')),
            structure = buildStructure(data.getCategory('_atom_site'), atoms),
            entry = data.getCategory('_entry'),
            id: string;
        
        if (entry && entry.getColumn('id').isDefined) id = entry.getColumn('id').getString(0);
        else id = data.header;

        assignEntityTypes(data.getCategory('_entity'), <any>structure.entities);
        let ss = getSecondaryStructureInfo(data, atoms, structure);
        assignSecondaryStructureIndex(structure.residues, ss); 
                
        return {
            model: new Structure.MoleculeModel({
                id,
                modelId,
                atoms,
                residues: structure.residues,
                chains: structure.chains,
                entities: structure.entities,
                componentBonds: getComponentBonds(data.getCategory('_chem_comp_bond')),
                secondaryStructure: ss,
                symmetryInfo: getSymmetryInfo(data),
                assemblyInfo: getAssemblyInfo(data),
                source: Structure.MoleculeModelSource.File
            }),
            endRow
        };
    }

    export function ofDataBlock(data: CIF.DataBlock): Structure.Molecule {
        let models: Structure.MoleculeModel[] = [],
            atomSite = data.getCategory('_atom_site'),
            startRow = 0;

        if (!atomSite) {
            throw `'_atom_site' category is missing in the input.`;
        }

        let entry = data.getCategory('_entry'),
            id: string;

        if (entry && entry.getColumn('id').isDefined) id = entry.getColumn('id').getString(0);
        else id = data.header;
        
        while (startRow < atomSite.rowCount) {
            let { model, endRow } = getModel(startRow, data);
            models.push(model);
            startRow = endRow;
        }
        return new Structure.Molecule(id, models);
    }
}