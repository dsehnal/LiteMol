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

    export const CreateVisual = Tree.Transformer.actionWithContext<ComplexInfo, Entity.Action, {}, { warnings: string[] }>({
        id: 'complex-representation-create-visual',
        name: 'Complex Visual',
        description: 'Create a visual of a macromolecular complex.',
        from: [ComplexInfo],
        to: [Entity.Action],
        defaultParams: ctx => ({}),
    }, (context, a, t) => {
        const action = Tree.Transform.build();
        const info = a.props.info;

        if (info.sequence.all.length) {

            const sequence = action.add(a, Transformer.Basic.CreateGroup, { label: 'Sequence', description: '' }, { isBinding: false });

            sequence.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.sequence.all), name: 'All Residues', silent: true }, { isBinding: false })
              .then(Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('Cartoons') }, { });

            const sequenceBSStyle: Bootstrap.Visualization.Molecule.Style<Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
                type: 'BallsAndSticks',
                taskType: 'Silent',
                params: { useVDW: true, vdwScaling: 0.21, bondRadius: 0.085, detail: 'Automatic' },
                theme: { template: Bootstrap.Visualization.Molecule.Default.CartoonThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.CartoonThemeTemplate.colors!, transparency: { alpha: 1.0 } },
            }

            if (info.sequence.interacting.length) {
                sequence.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.sequence.interacting), name: 'Interacting Residues', silent: true }, { isBinding: false })
                    .then(Transformer.Molecule.CreateVisual, { style: sequenceBSStyle });
            }

            if (info.sequence.modified.length) {
                sequence.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.sequence.modified), name: 'Modified Residues', silent: true }, { isBinding: false })
                    .then(Transformer.Molecule.CreateVisual, { style: sequenceBSStyle });
            }
        }

        if (info.het.other.length || info.het.carbohydrates.entries.length) {
            const hetGroups = action.add(a, Transformer.Basic.CreateGroup, { label: 'HET', description: '' }, { isBinding: false });
            
            if (info.het.other.length) {
                hetGroups.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.het.other), name: 'Ligands', silent: true })
                    .then(Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, { isBinding: false });
            }

            if (info.het.carbohydrates.entries.length) {
                const shadeStyle: Bootstrap.Visualization.Molecule.Style<Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
                    type: 'BallsAndSticks',
                    taskType: 'Silent',
                    params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                    theme: { template: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors!, transparency: { alpha: 0.15 } }
                }

                const carbsQ = Q.or(Q.residuesFromIndices(info.het.carbohydrates.carbohydrateIndices), Q.residuesFromIndices(info.het.carbohydrates.terminalIndices)).union();
                const carbs = hetGroups.then(Bootstrap.Entity.Transformer.Molecule.CreateSelectionFromQuery, { query: carbsQ, name: 'Std. Carbohydrates', silent: true }, {});
                    
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

            action.add(a as any, Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.freeWaterAtoms), name: 'Unbound Water', silent: true }, { isBinding: true })
                .then(Transformer.Molecule.CreateVisual, { style }, { });
        }
        return { action, context: { warnings: info.het.carbohydrates.warnings } };
    }, (context, ws) => {
        if (!ws) return;
        for (const w of ws.warnings) {
            context.logger.warning(`Carbohydrates: ${w}`);
        }
    });

    export let SuppressCreateVisualWhenModelIsAdded = false;
    export function CreateRepresentationWhenModelIsAddedBehaviour(context: Bootstrap.Context) {
        Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(e => {
            if (SuppressCreateVisualWhenModelIsAdded || !Bootstrap.Tree.Node.is(e.data, Bootstrap.Entity.Molecule.Model) || (e.data as Bootstrap.Entity.Any).isHidden) {
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