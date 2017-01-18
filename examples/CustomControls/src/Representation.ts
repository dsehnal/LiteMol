/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {

    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    import Query = LiteMol.Core.Structure.Query;

    export interface CreateRepresentationParams {
        modelIndex?: number,
        source?: 'Asymmetric Unit' | 'Assembly' | 'Symmetry',
        assemblyNames?: string[],
        params?: any
    }

    export const CreateRepresentation = Bootstrap.Tree.Transformer.action<Entity.Molecule.Molecule, Entity.Action, CreateRepresentationParams>({
            id: 'lm-custom-create-representation',
            name: 'Representation',
            description: 'Create visual representation from the selected source.',
            from: [Entity.Molecule.Molecule],
            to: [Entity.Action],
            defaultParams: (ctx, e) => {
                let m = Bootstrap.Utils.Molecule.findMolecule(e)!.props.molecule.models[0]; 
                let asm = m.data.assemblyInfo;
                if (!asm || !asm.assemblies.length) return { source: 'Asymmetric Unit', assemblyNames: [] };
                return { source: 'Asymmetric Unit', assemblyNames: asm.assemblies.map(a => a.name), modelIndex: 0 };                
            }
        }, (context, a, t) => { 

            // remove any old representation
            let children = Bootstrap.Tree.Selection.byRef('molecule').children();
            Bootstrap.Command.Tree.RemoveNode.dispatch(context, children);

            let action = Bootstrap.Tree.Transform.build().add(a, Transformer.Molecule.CreateModel, { modelIndex: t.params.modelIndex || 0 }, { ref: 'model' });
            let visualParams: Transformer.Molecule.CreateMacromoleculeVisualParams = { 
                polymer: true, 
                polymerRef: 'polymer-visual', 
                het: true, 
                hetRef: 'het-visual',
                water: true,
                waterRef: 'water-visual'
            };

            switch (t.params.source || 'Asymmetric Unit') {
                case 'Assembly':
                    action
                        .then(Transformer.Molecule.CreateAssembly, t.params.params)
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
                case 'Symmetry':
                    action
                        .then(Transformer.Molecule.CreateSymmetryMates, t.params.params)
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
                default:
                    action.then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
            }

            return action;
        });
}