/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation.Transforms {
    import Entity = Bootstrap.Entity
    import Transformer = Bootstrap.Entity.Transformer
    import Tree = Bootstrap.Tree
    import Q = Core.Structure.Query

    export interface ComplexInfo extends Entity<{ info: Info }> { }
    export const ComplexInfo = Entity.create<{ info: Info }>({ name: 'Macromolecular Complex Info', typeClass: 'Object', shortName: 'MC', description: 'Information about a macromolecular complex.' });

    export const CreateComplexInfo = Tree.Transformer.create<Entity.Molecule.Model | Entity.Molecule.Selection, ComplexInfo, {}>({
        id: 'complex-representation-create-info',
        name: 'Complex Info',
        description: 'Information about macromolecular complex (Main sequence, ligands, etc.).',
        from: [Entity.Molecule.Model, Entity.Molecule.Selection],
        to: [ComplexInfo],
        isUpdatable: false,
        defaultParams: () => ({} as any)
    }, (ctx, a, t) => {
        return Bootstrap.Task.create<ComplexInfo>('Complex', 'Normal', async ctx => {
            const model = Bootstrap.Utils.Molecule.findModel(a)!;
            const queryCtx = Bootstrap.Utils.Molecule.findQueryContext(a);
            const info = await createComplexRepresentation(ctx, model.props.model, queryCtx);
            return ComplexInfo.create(t, { label: 'Complex', info });
        }).setReportTime(true);
    });

    export const CreateVisual = Tree.Transformer.action<ComplexInfo, Entity.Action, {}>({
        id: 'complex-representation-create-visual',
        name: 'Complex Visual',
        description: 'Create a visual of a macromolecular complex.',
        from: [ComplexInfo],
        to: [Entity.Action],
        defaultParams: ctx => ({}),
    }, (context, a, t) => {
        const g = Tree.Transform.build();
        const info = a.props.info;

        if (info.mainSequenceAtoms.length) {
            g.add(a as any, Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.mainSequenceAtoms), name: 'Main Sequence', silent: true }, { isBinding: true })
              .then(Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('Cartoons') });
        }

        if (info.het.commonAtoms.length || info.het.carbohydrates.entries.length) {
            const hetGroups = g.add(a, Transformer.Basic.CreateGroup, { label: 'Ligands', description: '+ Interactions' }, { isBinding: true });
            
            if (info.het.commonAtoms.length) {
                hetGroups.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.het.commonAtoms), name: 'Ligands', silent: true })
                    .then(Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, { isBinding: true });
            }

            if (info.het.carbohydrates.entries.length) {
                const shadeStyle: Bootstrap.Visualization.Molecule.Style<Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
                    type: 'BallsAndSticks',
                    taskType: 'Silent',
                    params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                    theme: { template: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors!, transparency: { alpha: 0.15 } },
                    isNotSelectable: true
                }

                const carbsQ = Q.or(Q.residuesFromIndices(info.het.carbohydrates.carbohydrateIndices), Q.residuesFromIndices(info.het.carbohydrates.terminalIndices)).union();
                const carbs = hetGroups.then(Bootstrap.Entity.Transformer.Molecule.CreateSelectionFromQuery, { query: carbsQ, name: 'Carbohydrates', silent: true }, {});
                    
                carbs.then(Bootstrap.Entity.Transformer.Molecule.CreateVisual, { style: shadeStyle });
                carbs.then(Carbohydrates.Transforms.CreateInfo, { info: info.het.carbohydrates })
                    .then(Carbohydrates.Transforms.CreateVisual, Carbohydrates.DefaultFullParams, { isBinding: true });
            }
        }

        if (info.freeWaterAtoms.length) {
            const style: Bootstrap.Visualization.Molecule.Style<Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
                type: 'BallsAndSticks',
                params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                theme: { template: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 0.2 } }
            }

            g.add(a as any, Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.freeWaterAtoms), name: 'Free Water', silent: true }, { isBinding: true })
                .then(Transformer.Molecule.CreateVisual, { style }, { });
        }
        return g;
    });

    export function CreateRepresentationWhenModelIsAddedBehaviour(context: Bootstrap.Context) {
        Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(e => {
            if (!Bootstrap.Tree.Node.is(e.data, Bootstrap.Entity.Molecule.Model) || (e.data as Bootstrap.Entity.Any).isHidden) {
                return;
            }
            const action = Bootstrap.Tree.Transform.build()
                .add(e.data, Transforms.CreateComplexInfo, {})
                .then(Transforms.CreateVisual, {}, { isBinding: true });

            Bootstrap.Tree.Transform.apply(context, action).run().then(() => {
                Bootstrap.Command.Visual.ResetScene.dispatch(context, void 0);
            });
        });
    }
}