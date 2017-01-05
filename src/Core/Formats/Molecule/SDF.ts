/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
            atoms: Structure.Tables.atoms(atomCount).table,
            positions: Structure.Tables.positions(atomCount).table,
            bonds: Structure.Tables.bonds(bondCount).table,
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
            case 1: bonds.type[i] = Structure.Bond.Type.Single; break;
            case 2: bonds.type[i] = Structure.Bond.Type.Double; break;
            case 3: bonds.type[i] = Structure.Bond.Type.Triple; break;
            case 4: bonds.type[i] = Structure.Bond.Type.Aromatic; break;
            default: bonds.type[i] = Structure.Bond.Type.Unknown; break;
        }
    }

    function readBonds(state: State) {
        for (let i = 0; i < state.bondCount; i++) {
            readBond(i, state);
            state.currentLine++;
        }
    }

    function buildModel(state: State): Structure.Molecule.Model {

        let residues = Structure.Tables.residues(1),
            chains = Structure.Tables.chains(1),
            entities = Structure.Tables.entities(1);

        residues.columns.isHet[0] = 1;
        residues.columns.insCode[0] = null;
        residues.columns.name[0] 
            = residues.columns.authName[0] 
            = 'UNK';

        residues.columns.atomEndIndex[0] 
            = chains.columns.atomEndIndex[0]
            = entities.columns.atomEndIndex[0]
            = state.atomCount;
            
        residues.columns.asymId[0] 
            = residues.columns.authAsymId[0]
            = chains.columns.asymId[0]
            = chains.columns.authAsymId[0] 
            = 'X';

        residues.columns.entityId[0]
            = chains.columns.entityId[0]
            = entities.columns.entityId[0]
            = '1';
        
        chains.columns.residueEndIndex[0]
            = entities.columns.residueEndIndex[0] 
            = 0; 

        entities.columns.chainEndIndex[0] = 1;
        entities.columns.type[0] = 'non-polymer';

        let ssR = new Structure.PolyResidueIdentifier('X', 0, null);
        let ss = [new Structure.SecondaryStructureElement(Structure.SecondaryStructureType.None, ssR, ssR)];
        ss[0].startResidueIndex = 0;
        ss[0].endResidueIndex = 1;

        return Structure.Molecule.Model.create({
            id: state.id,
            modelId: '1',
            data: {
                atoms: state.atoms,
                residues: residues.table,
                chains: chains.table,
                entities: entities.table,
                bonds: {
                    covalent: state.bonds,
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