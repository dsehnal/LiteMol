/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Formats.Molecule.SDF {

    interface State {
        id: string,
        atomCount: number,
        bondCount: number,
        atoms: Structure.AtomTable,
        positions: Structure.PositionTable,
        bonds: Structure.BondTable,
        lines: string[],
        currentLine: number,
        error: string | undefined,
        stringPool: ShortStringPool
    }

    function initState(data: string, customId?: string): State {

        let lines = data.split(/\r?\n/g);

        let id = lines[0].trim();
        if (!id.length) id = 'SDF';

        //let molHeaderInfo = lines[1];
        //let molHeaderComment = lines[2];
        let cTabInfo = lines[3];        
        let atomCount = +cTabInfo.substr(0, 3);
        let bondCount = +cTabInfo.substr(3, 3);

        return <State>{
            id: customId ? customId : id,
            atomCount,
            bondCount,
            atoms: Utils.DataTable.ofDefinition(Structure.Tables.Atoms, atomCount),
            positions: Utils.DataTable.ofDefinition(Structure.Tables.Positions, atomCount),
            bonds: Utils.DataTable.ofDefinition(Structure.Tables.Bonds, bondCount),
            lines,
            currentLine: 4,
            error: void 0,
            stringPool: ShortStringPool.create()
        };
    }

    function readAtom(i: number, state: State) {
        let line = state.lines[state.currentLine];
        let atoms = state.atoms, positions = state.positions;

        let es = ShortStringPool.get(state.stringPool, line.substr(31, 3).trim());
        atoms.id[i] = i;
        atoms.elementSymbol[i] = es;
        atoms.name[i] = es;
        atoms.authName[i] = es;
        atoms.occupancy[i] = 1.0;
        atoms.rowIndex[i] = state.currentLine;
        
        positions.x[i] = Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 0, 10);
        positions.y[i] = Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 10, 20);
        positions.z[i] = Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 20, 30);
    }

    function readAtoms(state: State) {
        for (let i = 0; i < state.atomCount; i++) {
            readAtom(i, state);
            state.currentLine++;
        }
    }

    function readBond(i: number, state: State) {
        let line = state.lines[state.currentLine];
        let bonds = state.bonds;

        bonds.atomAIndex[i] = Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 0, 3) - 1;
        bonds.atomBIndex[i] = Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 3, 6) - 1;
        
        switch (Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 6, 9)) {
            case 1: bonds.type[i] = Structure.BondType.Single; break;
            case 2: bonds.type[i] = Structure.BondType.Double; break;
            case 3: bonds.type[i] = Structure.BondType.Triple; break;
            case 4: bonds.type[i] = Structure.BondType.Aromatic; break;
            default: bonds.type[i] = Structure.BondType.Unknown; break;
        }
    }

    function readBonds(state: State) {
        for (let i = 0; i < state.bondCount; i++) {
            readBond(i, state);
            state.currentLine++;
        }
    }

    function buildModel(state: State): Structure.Molecule.Model {

        let residues = Utils.DataTable.ofDefinition(Structure.Tables.Residues, 1),
            chains = Utils.DataTable.ofDefinition(Structure.Tables.Chains, 1),
            entities = Utils.DataTable.ofDefinition(Structure.Tables.Entities, 1);

        residues.isHet[0] = 1;
        residues.insCode[0] = null;
        residues.name[0] 
            = residues.authName[0] 
            = 'UNK';

        residues.atomEndIndex[0] 
            = chains.atomEndIndex[0]
            = entities.atomEndIndex[0]
            = state.atomCount;
            
        residues.asymId[0] 
            = residues.authAsymId[0]
            = chains.asymId[0]
            = chains.authAsymId[0] 
            = 'X';

        residues.entityId[0]
            = chains.entityId[0]
            = entities.entityId[0]
            = '1';
        
        chains.residueEndIndex[0]
            = entities.residueEndIndex[0] 
            = 0; 

        entities.chainEndIndex[0] = 1;
        entities.type[0] = 'non-polymer';

        let ssR = new Structure.PolyResidueIdentifier('X', 0, null);
        let ss = [new Structure.SecondaryStructureElement(Structure.SecondaryStructureType.None, ssR, ssR)];
        ss[0].startResidueIndex = 0;
        ss[0].endResidueIndex = 1;

        return Structure.Molecule.Model.create({
            id: state.id,
            modelId: '1',
            data: {
                atoms: state.atoms,
                residues,
                chains,
                entities,
                bonds: {
                    input: state.bonds,
                },
                secondaryStructure: ss,
                symmetryInfo: void 0,
                assemblyInfo: void 0,
            },
            positions: state.positions,
            source: Structure.Molecule.Model.Source.File
        });
    }

    export function parse(data: string, id?: string): ParserResult<Structure.Molecule> {
        try {
            let state = initState(data, id);
            readAtoms(state);
            readBonds(state);
            let model = buildModel(state);
            if (state.error) {
                return ParserResult.error<Structure.Molecule>(state.error, state.currentLine + 1);
            }
            let molecule = Structure.Molecule.create(id ? id : state.id, [model]);
            return ParserResult.success(molecule);
        } catch (e) {
            return ParserResult.error<Structure.Molecule>(`${e}`);
        }         
    }
}