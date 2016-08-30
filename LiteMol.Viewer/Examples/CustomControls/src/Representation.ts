/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {

    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    import Query = LiteMol.Core.Structure.Query;

    export interface CreateRepresentationParams {
        source?: 'Asymmetric Unit' | 'Assembly' | 'Symmetry',
        assemblyNames?: string[],
        params?: any
    }

    export const CreateRepresentation = Bootstrap.Tree.Transformer.action<Entity.Molecule.Model, Entity.Action, CreateRepresentationParams>({
            id: 'lm-custom-create-representation',
            name: 'Representation',
            description: 'Create visual representation from the selected source.',
            from: [Entity.Molecule.Model],
            to: [Entity.Action],
            defaultParams: (ctx, e) => {
                let m = Bootstrap.Utils.Molecule.findModel(e); 
                let asm = m.props.model.assemblyInfo;
                if (!asm || !asm.assemblies.length) return { source: 'Asymmetric Unit', assemblyNames: [] };
                return { source: 'Asymmetric Unit', assemblyNames: asm.assemblies.map(a => a.name) };                
            }
        }, (context, a, t) => { 

            // remove any old representation
            let children = Bootstrap.Tree.Selection.byRef('model').children();
            Bootstrap.Command.Tree.RemoveNode.dispatch(context, children);

            let action = Bootstrap.Tree.Transform.build();
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
                        .add(a, Transformer.Molecule.CreateAssembly, t.params.params)
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
                case 'Symmetry':
                    action
                        .add(a, Transformer.Molecule.CreateSymmetryMates, t.params.params)
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
                default:
                    action.add(a, Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
            }

            return action;
        });
}