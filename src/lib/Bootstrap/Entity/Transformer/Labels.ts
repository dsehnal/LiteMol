/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Entity.Transformer.Labels {


    export interface CreateParams {
        positions: Core.Structure.PositionTable,
        sizes: number[],
        labels: string[],
        options: LiteMol.Visualization.Labels.LabelsOptions, 
        style: Visualization.Labels.Style<LiteMol.Visualization.Labels.LabelsOptions>
    }

    export const Create = Tree.Transformer.create<Entity.Root, Entity.Visual.Labels, CreateParams>({
        id: 'labels-create',
        name: 'Labels',
        description: 'Create a labels for a molecule or a selection.',
        from: [],
        to: [Entity.Visual.Labels],
        isUpdatable: false,
        defaultParams: ctx => ({  } as any),
        customController: (ctx, t, e) => new Components.Transform.MoleculeLabels(ctx, t, e) as Components.Transform.Controller<any>
    }, (ctx, a, t) => {
        return Visualization.Labels.createGenericLabels(a, t, t.params).setReportTime(false);
    }, (ctx, b, t) => {
        const oldParams = b.transform.params;
        const newParams = t.params;

        if (oldParams.positions !== newParams.positions 
            || oldParams.sizes !== newParams.sizes 
            || oldParams.labels !== newParams.labels
            || oldParams.options !== newParams.options) {
            return void 0;
        }

        const model = b.props.model;
        const a = Tree.Node.findClosestNodeOfType(b, [Entity.Root]);
        if (!a) return void 0;
        const theme = newParams.style.theme.template.provider(a, Visualization.Theme.getProps(newParams.style.theme));
        model.applyTheme(theme);
        Entity.nodeUpdated(b);
        return Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
    });
}