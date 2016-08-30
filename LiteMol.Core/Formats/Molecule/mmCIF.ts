/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule.mmCIF {
    "use strict";


    type StructureWrapper = { residues: Structure.DefaultResidueTableSchema, chains: Structure.DefaultChainTableSchema, entities: Structure.DefaultEntityTableSchema };
            
    function getModelEndRow(startRow: number, category: CIF.Category) {
        let size = category.rowCount,
            modelNumCol = category.getColumnIndex("_atom_site.pdbx_PDB_model_num"),
            currentOffset = 0, colCount = category.columnCount,
            startOffset = startRow * colCount + modelNumCol,
            i = 0;
        
        if (modelNumCol < 0) return size;

        for (i = startRow; i < size; i++) {
            currentOffset = i * colCount;
            if (!category.areTokensEqual(startOffset, currentOffset + modelNumCol)) {
                break;
            }
        }

        return i;
    }

    function buildModelAtomTable(startRow: number, category: CIF.Category): { atoms: Structure.DefaultAtomTableSchema; modelId: string; endRow: number } {

        let endRow = getModelEndRow(startRow, category);
        
        let colCount = category.columnCount,
            atoms = new Structure.DataTableBuilder(endRow - startRow),
            id = atoms.addColumn("id", size => new Int32Array(size)), idX = category.getColumnIndex("_atom_site.id"),
            pX = atoms.addColumn("x", size => new Float32Array(size)), pXX = category.getColumnIndex("_atom_site.Cartn_x"),
            pY = atoms.addColumn("y", size => new Float32Array(size)), pYX = category.getColumnIndex("_atom_site.Cartn_y"),
            pZ = atoms.addColumn("z", size => new Float32Array(size)), pZX = category.getColumnIndex("_atom_site.Cartn_z"),

            altLoc = atoms.addColumn("altLoc", size => []), altLocX = category.getColumnIndex("_atom_site.label_alt_id"),

            rowIndex = atoms.addColumn("rowIndex", size => new Int32Array(size)),

            residueIndex = atoms.addColumn("residueIndex", size => new Int32Array(size)),
            chainIndex = atoms.addColumn("chainIndex", size => new Int32Array(size)),
            entityIndex = atoms.addColumn("entityIndex", size => new Int32Array(size)),

            name: string[] = atoms.addColumn("name", size => []), nameX = category.getColumnIndex("_atom_site.label_atom_id"),
            elementSymbol: string[] = atoms.addColumn("elementSymbol", size => []), elementSymbolX = category.getColumnIndex("_atom_site.type_symbol"),
            occupancy = atoms.addColumn("occupancy", size => new Float32Array(size)), occupancyX = category.getColumnIndex("_atom_site.occupancy"),
            tempFactor = atoms.addColumn("tempFactor", size => new Float32Array(size)), tempFactorX = category.getColumnIndex("_atom_site.B_iso_or_equiv"),
            authName: string[] = atoms.addColumn("authName", size => []), authNameX = category.getColumnIndex("_atom_site.auth_atom_id");
            

        let resSeqNumberCol = category.getColumnIndex("_atom_site.label_seq_id"),
            asymIdCol = category.getColumnIndex("_atom_site.label_asym_id"),
            entityCol = category.getColumnIndex("_atom_site.label_entity_id"),
            insCodeCol = category.getColumnIndex("_atom_site.pdbx_PDB_ins_code"),

            authResSeqNumberCol = category.getColumnIndex("_atom_site.auth_seq_id"),

            modelNumCol = category.getColumnIndex("_atom_site.pdbx_PDB_model_num"),
            //authAsymIdCol = category.getColumnIndex("_atom_site.auth_asym_id"),

            currentResidueNumberToken = resSeqNumberCol,
            currentAsymIdToken = asymIdCol,
            currentInsCodeToken = insCodeCol,

            currentAuthResidueNumberToken = authResSeqNumberCol,
            //currentAuthAsymIdToken = authAsymIdCol,

            currentEntityToken = entityCol,

            currentOffset = 0,

            newResidue = false,
            newChain = false,

            numChains = 0,
            numResidues = 0,
            numEntities = 0;
                    
        for (let row = startRow; row < endRow; row++) {

            let index = row - startRow;

            currentOffset = row * colCount;
            

            id[index] = category.getIntValueFromIndex(idX, row);
            pX[index] = category.getFloatValueFromIndex(pXX, row);
            pY[index] = category.getFloatValueFromIndex(pYX, row);
            pZ[index] = category.getFloatValueFromIndex(pZX, row);

            name[index] = category.getStringValueFromIndex(nameX, row);
            authName[index] = category.getStringValueFromIndex(authNameX, row);
            elementSymbol[index] = category.getStringValueFromIndex(elementSymbolX, row);

            altLoc[index] = category.getStringValueFromIndex(altLocX, row);

            occupancy[index] = category.getFloatValueFromIndex(occupancyX, row);
            tempFactor[index] = category.getFloatValueFromIndex(tempFactorX, row);
                            
            newResidue = false;
            newChain = false;
            if (category.isTokenUndefined(currentResidueNumberToken)) {
                // handle HET residues
                newResidue =
                    !category.areTokensEqual(currentAuthResidueNumberToken, currentOffset + authResSeqNumberCol);
            } else {
                newResidue =
                    !category.areTokensEqual(currentResidueNumberToken, currentOffset + resSeqNumberCol)
                    || !category.areTokensEqual(currentInsCodeToken, currentOffset + insCodeCol);
            }

            if (newResidue) {
                numResidues++;

                currentResidueNumberToken = currentOffset + resSeqNumberCol;
                currentAuthResidueNumberToken = currentOffset + authResSeqNumberCol;
                currentInsCodeToken = currentOffset + insCodeCol;
            }

            if (!category.areTokensEqual(currentAsymIdToken, currentOffset + asymIdCol)) {
                // handle new chain
                newChain = true;
                numChains++;
                currentAsymIdToken = currentOffset + asymIdCol;

                if (!newResidue) {
                    newResidue = true;

                    numResidues++;
                    currentResidueNumberToken = currentOffset + resSeqNumberCol;
                    currentAuthResidueNumberToken = currentOffset + authResSeqNumberCol;
                    currentInsCodeToken = currentOffset + insCodeCol;
                }
            }

            if (!category.areTokensEqual(currentEntityToken, currentOffset + entityCol)) {                    
                // handle new entity
                numEntities++;

                currentEntityToken = currentOffset + entityCol;

                if (!newChain) {
                    newChain = true;
                    numChains++;
                    currentAsymIdToken = currentOffset + asymIdCol;
                }

                if (!newResidue) {
                    newResidue = true;

                    numResidues++;
                    currentResidueNumberToken = currentOffset + resSeqNumberCol;
                    currentAuthResidueNumberToken = currentOffset + authResSeqNumberCol;
                    currentInsCodeToken = currentOffset + insCodeCol;
                }
            }

            rowIndex[index] = row;
            residueIndex[index] = numResidues;
            chainIndex[index] = numChains;
            entityIndex[index] = numEntities;
        }
        
        let modelId = modelNumCol < 0 ? "1" : category.getStringValue("_atom_site.pdbx_PDB_model_num", startRow);
        
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

            residueName = residues.addColumn("name", size => <string[]>[]),
            residueSeqNumber = residues.addColumn("seqNumber", size => new Int32Array(size)),
            residueAsymId = residues.addColumn("asymId", size => <string[]>[]),
            residueAuthName = residues.addColumn("authName", size => <string[]>[]),
            residueAuthSeqNumber = residues.addColumn("authSeqNumber", size => new Int32Array(size)),
            residueAuthAsymId = residues.addColumn("authAsymId", size => <string[]>[]),
            residueInsertionCode = residues.addColumn("insCode", size => <string[]>[]),
            residueEntityId = residues.addColumn("entityId", size => <string[]>[]),
            residueIsHet = residues.addColumn("isHet", size => new Int8Array(size)),
            residueAtomStartIndex = residues.addColumn("atomStartIndex", size => new Int32Array(size)),
            residueAtomEndIndex = residues.addColumn("atomEndIndex", size => new Int32Array(size)),
            residueChainIndex = residues.addColumn("chainIndex", size => new Int32Array(size)),
            residueEntityIndex = residues.addColumn("entityIndex", size => new Int32Array(size)),
            residueSecondaryStructureIndex = residues.addColumn("secondaryStructureIndex", size => new Int32Array(size)),

            chainAsymId = chains.addColumn("asymId", size => <string[]>[]),
            chainEntityId = chains.addColumn("entityId", size => <string[]>[]),
            chainAuthAsymId = chains.addColumn("authAsymId", size => <string[]>[]),
            chainAtomStartIndex = chains.addColumn("atomStartIndex", size => new Int32Array(size)),
            chainAtomEndIndex = chains.addColumn("atomEndIndex", size => new Int32Array(size)),
            chainResidueStartIndex = chains.addColumn("residueStartIndex", size => new Int32Array(size)),
            chainResidueEndIndex = chains.addColumn("residueEndIndex", size => new Int32Array(size)),
            chainEntityIndex = chains.addColumn("entityIndex", size => new Int32Array(size)),

            entityId = entities.addColumn("entityId", size => <string[]>[]),
            entityTypeEnum = entities.addColumn("entityType", size => <Structure.EntityType[]>[]),
            entityType = entities.addColumn("type", size => <string[]>[]),
            entityAtomStartIndex = entities.addColumn("atomStartIndex", size => new Int32Array(size)),
            entityAtomEndIndex = entities.addColumn("atomEndIndex", size => new Int32Array(size)),
            entityResidueStartIndex = entities.addColumn("residueStartIndex", size => new Int32Array(size)),
            entityResidueEndIndex = entities.addColumn("residueEndIndex", size => new Int32Array(size)),
            entityChainStartIndex = entities.addColumn("chainStartIndex", size => new Int32Array(size)),
            entityChainEndIndex = entities.addColumn("chainEndIndex", size => new Int32Array(size)),

            resNameCol = category.getColumnIndex("_atom_site.label_comp_id"),
            resSeqNumberCol = category.getColumnIndex("_atom_site.label_seq_id"),
            asymIdCol = category.getColumnIndex("_atom_site.label_asym_id"),


            authResNameCol = category.getColumnIndex("_atom_site.auth_comp_id"),
            authResSeqNumberCol = category.getColumnIndex("_atom_site.auth_seq_id"),
            authAsymIdCol = category.getColumnIndex("_atom_site.auth_asym_id"),

            isHetCol = category.getColumnIndex("_atom_site.group_PDB"),

            entityCol = category.getColumnIndex("_atom_site.label_entity_id"),
            insCodeCol = category.getColumnIndex("_atom_site.pdbx_PDB_ins_code"),


            residueStart = 0, chainStart = 0, entityStart = 0,
            entityChainStart = 0, entityResidueStart = 0,
            chainResidueStart = 0,

            currentResidue = 0, currentChain = 0, currentEntity = 0;
        
        let i = 0;
        for (i = 0; i < count; i++) {               

            if (residueIndexCol[i] !== residueIndexCol[residueStart]) {
                residueName[currentResidue] = category.getStringValueFromIndex(resNameCol, residueStart);
                residueSeqNumber[currentResidue] = category.getIntValueFromIndex(resSeqNumberCol, residueStart);
                residueAsymId[currentResidue] = category.getStringValueFromIndex(asymIdCol, residueStart);
                residueAuthName[currentResidue] = category.getStringValueFromIndex(authResNameCol, residueStart);
                residueAuthSeqNumber[currentResidue] = category.getIntValueFromIndex(authResSeqNumberCol, residueStart);
                residueAuthAsymId[currentResidue] = category.getStringValueFromIndex(authAsymIdCol, residueStart);                    
                residueInsertionCode[currentResidue] = category.getStringValueFromIndex(insCodeCol, residueStart);
                residueEntityId[currentResidue] = category.getStringValueFromIndex(entityCol, residueStart);
                residueIsHet[currentResidue] = category.valueEqual(isHetCol, residueStart, "HETATM") ? 1 : 0;

                residueAtomStartIndex[currentResidue] = residueStart;
                residueAtomEndIndex[currentResidue] = i;
                residueChainIndex[currentResidue] = currentChain;
                residueEntityIndex[currentResidue] = currentEntity;                    

                currentResidue++;
                residueStart = i;
            }

            if (chainIndexCol[i] !== chainIndexCol[chainStart]) {

                chainAsymId[currentChain] = category.getStringValueFromIndex(asymIdCol, chainStart);
                chainAuthAsymId[currentChain] = category.getStringValueFromIndex(authAsymIdCol, chainStart);
                chainEntityId[currentChain] = category.getStringValueFromIndex(entityCol, chainStart);
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

                entityId[currentEntity] = category.getStringValueFromIndex(entityCol, entityStart);
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
        entityId[currentEntity] = category.getStringValueFromIndex(entityCol, entityStart);
        entityTypeEnum[currentEntity] = Structure.EntityType.Unknown;
        entityType[currentEntity] = 'unknown';
        entityAtomStartIndex[currentEntity] = entityStart;
        entityAtomEndIndex[currentEntity] = i;
        entityResidueStartIndex[currentEntity] = entityResidueStart;
        entityResidueEndIndex[currentEntity] = currentResidue + 1;
        entityChainStartIndex[currentEntity] = entityChainStart;
        entityChainEndIndex[currentEntity] = currentChain + 1;
                    
        // chain
        chainAsymId[currentChain] = category.getStringValueFromIndex(asymIdCol, chainStart);
        chainAuthAsymId[currentChain] = category.getStringValueFromIndex(authAsymIdCol, chainStart);
        chainEntityId[currentChain] = category.getStringValueFromIndex(entityCol, chainStart);
        chainResidueStartIndex[currentChain] = chainResidueStart;
        chainResidueEndIndex[currentChain] = currentResidue + 1;
        chainAtomStartIndex[currentChain] = chainStart;
        chainAtomEndIndex[currentChain] = i;
        chainEntityIndex[currentChain] = currentEntity;

        // residue
        residueName[currentResidue] = category.getStringValueFromIndex(resNameCol, residueStart);
        residueSeqNumber[currentResidue] = category.getIntValueFromIndex(resSeqNumberCol, residueStart);
        residueAsymId[currentResidue] = category.getStringValueFromIndex(asymIdCol, residueStart);
        residueAuthName[currentResidue] = category.getStringValueFromIndex(authResNameCol, residueStart);
        residueAuthSeqNumber[currentResidue] = category.getIntValueFromIndex(authResSeqNumberCol, residueStart);
        residueAuthAsymId[currentResidue] = category.getStringValueFromIndex(authAsymIdCol, residueStart);
        residueInsertionCode[currentResidue] = category.getStringValueFromIndex(insCodeCol, residueStart);
        residueAtomStartIndex[currentResidue] = residueStart;
        residueAtomEndIndex[currentResidue] = i;
        residueChainIndex[currentResidue] = currentChain;
        residueEntityIndex[currentResidue] = currentEntity;
        residueIsHet[currentResidue] = category.valueEqual(isHetCol, residueStart, "HETATM") ? 1 : 0;
        
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
            et: Structure.EntityType;
        for (i = 0; i < category.rowCount; i++) {

            let t = (category.getStringValue("_entity.type", i) || "").toLowerCase();
            switch (t) {
                case "polymer": et = Structure.EntityType.Polymer; break;
                case "non-polymer": et = Structure.EntityType.NonPolymer; break;
                case "water": et = Structure.EntityType.Water; break;
                default: et = Structure.EntityType.Unknown; break;
            }
            let eId = category.getStringValue("_entity.id", i);
            dataEnum[eId] = et;
            data[eId] = t !== "" ? t : "unknown";
        }

        for (i = 0; i < entities.count; i++) {
            et = dataEnum[entities.entityId[i]];
            if (et !== undefined) {
                entities.entityType[i] = et;
                entities.type[i] = data[entities.entityId[i]];
            }
        }            
    }

    function residueIdfromColumns(cat: CIF.Category, row: number, asymId: string, seqNum: string, insCode: string) {
        return new Structure.PolyResidueIdentifier(cat.getStringValue(asymId, row), cat.getIntValue(seqNum, row), cat.getStringValue(insCode, row));
    }


    const aminoAcidNames: { [id: string]: boolean } = { "ALA": true, "ARG": true, "ASP": true, "CYS": true, "GLN": true, "GLU": true, "GLY": true, "HIS": true, "ILE": true, "LEU": true, "LYS": true, "MET": true, "PHE": true, "PRO": true, "SER": true, "THR": true, "TRP": true, "TYR": true, "VAL": true, "ASN": true, "PYL": true, "SEC": true };

    function isResidueAminoSeq(atoms: Structure.DefaultAtomTableSchema, residues: Structure.DefaultResidueTableSchema, entities: Structure.DefaultEntityTableSchema, index: number) {


        if (entities.entityType[residues.entityIndex[index]] !== Structure.EntityType.Polymer) return false;

        //if (mmCif.aminoAcidNames[residues.name[index]]) return true;

        let ca = false, o = false,
            names = atoms.name,
            assigned = 0;
        
        for (let i = residues.atomStartIndex[index], max = residues.atomEndIndex[index]; i < max; i++) {
            let n = names[i];
            if (!ca && n === "CA") {
                ca = true;
                assigned++;
            } else if (!o && n === "O") {
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
            if (!o5 && n === "O5'") {
                o5 = true;
                assigned++;
            }
            else if (!c3 && n === "C3'") {
                c3 = true;
                assigned++;
            } else if (!n3 && n === "N3") {
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
            key = "",
            starts = new Map<string, Structure.SecondaryStructureElement>(),
            ends = new Map<string, Structure.SecondaryStructureElement>();
        
        for (let e of elements) {
            key = e.startResidueId.asymId + " " + e.startResidueId.seqNumber;
            if (e.startResidueId.insCode) key += " " + e.startResidueId.insCode;
            starts.set(key, e);

            key = e.endResidueId.asymId + " " + e.endResidueId.seqNumber;
            if (e.endResidueId.insCode) key += " " + e.endResidueId.insCode;
            ends.set(key, e);
        }

        for (let i = 0; i < count; i++) {

            key = asymId[i] + " " + seqNumber[i];
            if (insCode[i]) key += " " + insCode[i];

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

    function getSecondaryStructureInfo(data: CIF.Block, atoms: Structure.DataTable, structure: StructureWrapper): Structure.SecondaryStructureElement[]{

        let input: Structure.SecondaryStructureElement[] = [],
            elements: Structure.SecondaryStructureElement[] = [];

        let _struct_conf = data.getCategory("_struct_conf"),
            _struct_sheet_range = data.getCategory("_struct_sheet_range"),
            i: number;

        if (_struct_conf) {

            let type_id_col = _struct_conf.getColumn("_struct_conf.conf_type_id");

            if (type_id_col) {
                for (i = 0; i < _struct_conf.rowCount; i++) {

                    let type: Structure.SecondaryStructureType;

                    switch (type_id_col.getString(i).toUpperCase()) {
                        case "HELX_P": type = Structure.SecondaryStructureType.Helix; break;
                        case "TURN_P": type = Structure.SecondaryStructureType.Turn; break;
                    }
                    if (!type) continue;

                    input[input.length] = new Structure.SecondaryStructureElement(
                        type,
                        residueIdfromColumns(_struct_conf, i, "_struct_conf.beg_label_asym_id", "_struct_conf.beg_label_seq_id", "_struct_conf.pdbx_beg_PDB_ins_code"),
                        residueIdfromColumns(_struct_conf, i, "_struct_conf.end_label_asym_id", "_struct_conf.end_label_seq_id", "_struct_conf.pdbx_end_PDB_ins_code"),
                        {
                            helixClass: _struct_conf.getStringValue("_struct_conf.pdbx_PDB_helix_class", i)
                        });
                }
            }
        }

        if (_struct_sheet_range) {
            for (i = 0; i < _struct_sheet_range.rowCount; i++) {
                input[input.length] = new Structure.SecondaryStructureElement(
                    Structure.SecondaryStructureType.Sheet,
                    residueIdfromColumns(_struct_sheet_range, i, "_struct_sheet_range.beg_label_asym_id", "_struct_sheet_range.beg_label_seq_id", "_struct_sheet_range.pdbx_beg_PDB_ins_code"),
                    residueIdfromColumns(_struct_sheet_range, i, "_struct_sheet_range.end_label_asym_id", "_struct_sheet_range.end_label_seq_id", "_struct_sheet_range.pdbx_end_PDB_ins_code"),
                    {
                        symmetry: _struct_sheet_range.getStringValue("_struct_sheet_range.symmetry", i),
                        sheetId: _struct_sheet_range.getStringValue("_struct_sheet_range.sheet_id", i),
                        id: _struct_sheet_range.getStringValue("_struct_sheet_range.id", i)
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
            g.split(",").forEach(e => {
                let dashIndex = e.indexOf("-");
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

    function getAssemblyInfo(data: CIF.Block): Structure.AssemblyInfo {
        let _info = data.getCategory("_pdbx_struct_assembly"),
            _gen = data.getCategory("_pdbx_struct_assembly_gen"),
            _opers = data.getCategory("_pdbx_struct_oper_list");

        if (!_info || !_gen || !_opers) {
            return null;
        }

        let i: number,
            opers: { [id: string]: Structure.AssemblyOperator } = {},
            gens: Structure.AssemblyGen[] = [],
            genMap = new Map<string, Structure.AssemblyGen>();

        for (i = 0; i < _gen.rowCount; i++) {
            
            let id = _gen.getStringValue("_pdbx_struct_assembly_gen.assembly_id", i);
            let entry = genMap.get(id);
            
            if (!entry) {
                entry = new Structure.AssemblyGen(id);
                genMap.set(id, entry);
                gens.push(entry);
            }
                            
            entry.gens.push(new Structure.AssemblyGenEntry(
                parseOperatorList(_gen.getStringValue("_pdbx_struct_assembly_gen.oper_expression", i)),
                _gen.getStringValue("_pdbx_struct_assembly_gen.asym_id_list", i).split(",")     
            ));
        }


        for (i = 0; i < _opers.rowCount; i++) {
            let oper = _opers.getTransform(i, "_pdbx_struct_oper_list.matrix", "_pdbx_struct_oper_list.vector");
            if (!oper) {
                return null;
            }
            let op = new Structure.AssemblyOperator(_opers.getStringValue("_pdbx_struct_oper_list.id", i), _opers.getStringValue("_pdbx_struct_oper_list.name", i), oper);
            opers[op.id] = op;
        }


        return new Structure.AssemblyInfo(opers, gens);
    }
    
    function getSymmetryInfo(data: CIF.Block): Structure.SymmetryInfo {
        let _cell = data.getCategory("_cell"),
            _symmetry = data.getCategory("_symmetry"),
            _atom_sites = data.getCategory("_atom_sites");

        let spacegroupName = "",
            cellSize = [1.0, 1.0, 1.0],
            cellAngles = [90.0, 90.0, 90.0],
            toFracTransform = Geometry.LinearAlgebra.Matrix4.identity(),
            isNonStandardCrytalFrame = false;

        if (!_cell || !_symmetry) {
            return null;
        }

        spacegroupName = _symmetry.getStringValue("_symmetry.space_group_name_H-M");
        cellSize = [_cell.getFloatValue("_cell.length_a"), _cell.getFloatValue("_cell.length_b"), _cell.getFloatValue("_cell.length_c")];
        cellAngles = [_cell.getFloatValue("_cell.angle_alpha"), _cell.getFloatValue("_cell.angle_beta"), _cell.getFloatValue("_cell.angle_gamma")];

        if (_symmetry.isValueUndefined("_symmetry.space_group_name_H-M")
            || _cell.isValueUndefined("_cell.length_a") || _cell.isValueUndefined("_cell.length_b") || _cell.isValueUndefined("_cell.length_c")
            || _cell.isValueUndefined("_cell.angle_alpha") || _cell.isValueUndefined("_cell.angle_beta") || _cell.isValueUndefined("_cell.angle_gamma")) {
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
            let transform = _atom_sites.getTransform(0, "_atom_sites.fract_transf_matrix", "_atom_sites.fract_transf_vector");
            //console.log("CIF", JSON.stringify(Array.prototype.slice.call(transform, 0).map((x: any) => x.toFixed(6))));
            //console.log("COMP", JSON.stringify(Array.prototype.slice.call(toFracComputed, 0).map((x: any) => x.toFixed(6))));
            //console.log("COMP", JSON.stringify(Array.prototype.slice.call(fromFrac, 0).map((x: any) => x.toFixed(6))));
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

        let idCol = category.getColumnIndex("_chem_comp_bond.comp_id"),
            nameACol = category.getColumnIndex("_chem_comp_bond.atom_id_1"),
            nameBCol = category.getColumnIndex("_chem_comp_bond.atom_id_2"),
            orderCol = category.getColumnIndex("_chem_comp_bond.value_order"),

            count = category.rowCount;

        let entry = info.newEntry(category.getStringValueFromIndex(idCol, 0));

        for (let i = 0; i < count; i++) {

            let id = category.getStringValueFromIndex(idCol, i),
                nameA = category.getStringValueFromIndex(nameACol, i),
                nameB = category.getStringValueFromIndex(nameBCol, i),
                order = category.getStringValueFromIndex(orderCol, i);

            if (entry.id !== id) {
                entry = info.newEntry(id);
            }

            let t: Structure.BondOrder;

            switch (order.toLowerCase()) {
                case "sing": t = Structure.BondOrder.Single; break;
                case "doub":
                case "delo":
                    t = Structure.BondOrder.Double;
                    break;
                case "trip": t = Structure.BondOrder.Triple; break;
                case "quad": t = Structure.BondOrder.Quadruple; break;
                default: t = Structure.BondOrder.Single; break;
            }

            entry.add(nameA, nameB, t);
        }

        return info;

    }

    function getModel(startRow: number, data: CIF.Block): { model: Structure.MoleculeModel; endRow: number } {

        let { atoms, modelId, endRow } = buildModelAtomTable(startRow, data.getCategory("_atom_site")),
            structure = buildStructure(data.getCategory("_atom_site"), atoms),
            entry = data.getCategory("_entry"),
            id: string;
        
        if (entry && entry.getColumnIndex("_entry.id") >= 0) id = entry.getStringValue("_entry.id");
        else id = data.header;

        assignEntityTypes(data.getCategory("_entity"), <any>structure.entities);
        
        let ss = getSecondaryStructureInfo(data, atoms, structure);
        assignSecondaryStructureIndex(structure.residues, ss); 
        
        return {
            model: new Structure.MoleculeModel(
                id,
                modelId,
                atoms,
                structure.residues,
                structure.chains,
                structure.entities,
                getComponentBonds(data.getCategory("_chem_comp_bond")),
                ss,
                getSymmetryInfo(data),
                getAssemblyInfo(data),
                undefined,
                Structure.MoleculeModelSource.File,
                undefined),
            endRow
        };
    }

    export function ofDataBlock(data: CIF.Block): Structure.Molecule {

        let models: Structure.MoleculeModel[] = [],
            atomSite = data.getCategory("_atom_site"),
            startRow = 0;

        if (!atomSite) {
            throw "'_atom_site' category is missing in the input.";
        }

        let entry = data.getCategory("_entry"),
            id: string;

        if (entry && entry.getColumnIndex("_entry.id") >= 0) id = entry.getStringValue("_entry.id");
        else id = data.header;
        
        while (startRow < atomSite.rowCount) {
            let { model, endRow } = getModel(startRow, data);
            models.push(model);
            startRow = endRow;
        }

        return new Structure.Molecule(id, models);
    }
}