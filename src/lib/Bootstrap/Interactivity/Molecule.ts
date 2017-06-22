/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Interactivity.Molecule {
    "use strict";
      
    export interface AtomInfo {
        index: number;
        
        x: number;
        y: number;
        z: number;
        
        id: number;
        name: string;
        authName: string;        
        elementSymbol: string;
        occupancy: number;   
        tempFactor: number;    
        altLoc: string; 
        residue: ResidueInfo;
    }
    
    export interface ResidueInfo {
        index: number;
        
        name: string;
        authName: string;
        seqNumber: number;
        authSeqNumber: number;
        insCode: string;        
        isHet: boolean;
        chain: ChainInfo;
    } 
    
    export interface ChainInfo {
        index: number;
                
        asymId: string;
        authAsymId: string;        
        entity: EntityInfo;
    }
    
    export interface EntityInfo {
        index: number;    
        
        entityId: string;        
    }
    
    export interface SelectionInfo {        
        modelRef: string;          
        moleculeId: string;
        modelId: string;
        
        atoms: AtomInfo[];
        residues: ResidueInfo[];
        chains: ChainInfo[];
        entities: EntityInfo[];        
    }
    
    export function transformMoleculeAtomIndices(model: Entity.Molecule.Model, context: Core.Structure.Query.Context, indices: number[]): SelectionInfo {
        
        let m = context.structure;
                
        let { residueIndex, chainIndex, entityIndex, name, authName, id, occupancy, tempFactor, elementSymbol, altLoc } = m.data.atoms;
        let { x, y, z } = m.positions;
        let { name:resName, authName:resAuthName, seqNumber, authSeqNumber, insCode, isHet } = m.data.residues;
        let { asymId, authAsymId } = m.data.chains;
        let { entityId } = m.data.entities;                                 
        
        let aI = -1, eI = -1, cI = -1, rI = -1;        
        let e: EntityInfo, c: ChainInfo, r: ResidueInfo, a: AtomInfo;
        
        let eP = () => e = <EntityInfo>{ index: eI, entityId: entityId[eI] };
        let cP = () => c = <ChainInfo>{ index: cI, asymId: asymId[cI], authAsymId: authAsymId[cI], entity: e };
        let rP = () => r = <ResidueInfo>{ index: rI, name: resName[rI], authName: resAuthName[rI], seqNumber: seqNumber[rI], authSeqNumber: authSeqNumber[rI], insCode: insCode[rI], isHet: <any>isHet[rI], chain: c };
        let aP = () => a = <AtomInfo>{ index: aI, id: id[aI], name: name[aI], authName: authName[aI], elementSymbol: elementSymbol[aI], occupancy: occupancy[aI], tempFactor: tempFactor[aI], x: x[aI], y: y[aI], z: z[aI], altLoc: altLoc[aI], residue: r };
                
        let entities: EntityInfo[] = [];
        let chains: ChainInfo[] = [];
        let residues: ResidueInfo[] = [];
        let atoms: AtomInfo[] = [];
        
        
        for (let i = 0; i < indices.length; i++) {
            aI = indices[i];            
            if (!context.hasAtom(aI)) continue;
            if (eI !== entityIndex[aI]) { eI = entityIndex[aI]; entities.push(eP()); }
            if (cI !== chainIndex[aI]) { cI = chainIndex[aI]; chains.push(cP()); }
            if (rI !== residueIndex[aI]) { rI = residueIndex[aI]; residues.push(rP()); }
            atoms.push(aP()); 
        }   
        
        return {
            modelRef: model.ref,
            moleculeId: m.id,
            modelId: m.modelId,
            atoms,
            residues,
            chains,
            entities
        };  
    }   
    
    export function transformInteraction(info: Interactivity.Info): SelectionInfo | undefined {
        if (isEmpty(info)) return void 0;
        
        let modelOrSelection = Utils.Molecule.findModelOrSelection(info.source);
        if (!modelOrSelection) return void 0;

        let context = Utils.Molecule.findQueryContext(modelOrSelection);
        let model = Utils.Molecule.findModel(modelOrSelection);
        if (!context || !model) return void 0;
        return transformMoleculeAtomIndices(model, context, info.elements!);
    }
    
    function formatAtomExtra(a: AtomInfo) {
        let extras: string[] = [];
        if (a.occupancy !== 1) {
            extras.push(`occupancy ${Utils.round(a.occupancy, 2)}`);
        }
        if (a.altLoc) {
            extras.push(`alt. loc ${a.altLoc}`);
        }
        if (!extras.length) return '';
        return ` <small>[${extras.join(', ')}]</small>`;
    }
    
    function formatAtom(a: AtomInfo) {
         return `<span><b>${a.name} ${a.elementSymbol} ${a.id}</b>${formatAtomExtra(a)} at (${Utils.round(a.x, 1)}, ${Utils.round(a.y, 1)}, ${Utils.round(a.z, 1)})</span>`;
    }
    
    function formatAtomShort(a: AtomInfo) {
         return `<span>${a.name} ${a.elementSymbol} ${a.id}${formatAtomExtra(a)}</span>`;
    }
    
    function formatResidue(r: ResidueInfo) {
        return `<span>${r.authName} ${r.chain.authAsymId} ${r.authSeqNumber}${r.insCode !== null ? ' i: ' + r.insCode : ''}</span>`;
    }

    function formatMolecule(info: SelectionInfo) {
        if (info.modelId === '1') {
            return `<span><small>[${info.moleculeId}]</small></span>`;
        }
        return `<span><small>[${info.moleculeId}:${info.modelId}]</small></span>`;
    }
    
    export function formatInfo(info: SelectionInfo | undefined) {
        if (!info || !info.atoms.length) return ``;
        if (info.atoms.length === 1) {
            return `<span>${formatAtom(info.atoms[0])} on <b><small>${formatResidue(info.residues[0])}</small></b> ${formatMolecule(info)}</span>`;
        } else if (info.residues.length === 1) {
            return `<span><b>${formatResidue(info.residues[0])}</b> ${formatMolecule(info)}</span>`;
        } else {
            return `<span><small>${info.atoms.length} atoms on</small> <b>${info.residues.length} residues</b> ${formatMolecule(info)}</span>`;
        }
    }

    export function formatInfoShort(info: SelectionInfo | undefined) {
        if (!info || !info.atoms.length) return ``;
        if (info.atoms.length === 1) {
            return `<span><b>${formatAtomShort(info.atoms[0])}</b> ${formatMolecule(info)}</span>`;
        } else if (info.residues.length === 1) {
            return `<span><b>${formatResidue(info.residues[0])}</b> ${formatMolecule(info)}</span>`;
        } else {
            return `<span><b>${info.residues.length} residues</b> ${formatMolecule(info)}</span>`;
        }
    }
    
    export function isMoleculeModelInteractivity(info: Info): info is Info.Selection {
        if (Interactivity.isEmpty(info)) return false;
        if (info.source.type.info.typeClass === Entity.VisualClass && info.source.type !== Entity.Molecule.Visual) return false;
        let modelOrSelection = Utils.Molecule.findModelOrSelection(info.source);
        if (!modelOrSelection) return false;
        return true;
    }
}