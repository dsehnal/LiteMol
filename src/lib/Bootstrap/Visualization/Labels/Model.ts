/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Labels {
    "use strict";

    export function createMoleculeLabels(
        parent: Entity.Any,
        transform: Tree.Transform<Entity.Any, Entity.Visual.Labels, any>,
        style: Style<Utils.Molecule.Labels3DOptions>): Task<Entity.Visual.Labels> {

        return Task.create<Entity.Visual.Labels>('Labels', 'Background', async ctx => {
            const params = style.params!;
            
            const theme = style.theme!.template!.provider(parent, Theme.getProps(style.theme!));
            const labelsParams = Bootstrap.Utils.Molecule.create3DLabelsParams(parent, params, theme);
                            
            await ctx.updateProgress('Creating labels...');
            const model = await LiteMol.Visualization.Labels.Model.create(parent, labelsParams).run(ctx);               
            return Entity.Visual.Labels.create(transform, { label: 'Labels', model, style, isSelectable: false });
        });
    }    

    export function createGenericLabels(
        parent: Entity.Any,
        transform: Tree.Transform<Entity.Any, Entity.Visual.Labels, any>,
        params: Bootstrap.Entity.Transformer.Labels.CreateParams): Task<Entity.Visual.Labels> {
        return Task.create<Entity.Visual.Labels>('Labels', 'Background', async ctx => {                            
            await ctx.updateProgress('Creating labels...');
            const theme = params.style.theme!.template!.provider(parent, Theme.getProps(params.style.theme!));
            const labelsParams: LiteMol.Visualization.Labels.LabelsParams = {
                positions: params.positions,
                sizes: params.sizes,
                labels: params.labels,
                options: params.options,
                theme
            };

            const model = await LiteMol.Visualization.Labels.Model.create(parent, labelsParams).run(ctx);               
            return Entity.Visual.Labels.create(transform, { label: 'Labels', model, style: params.style, isSelectable: false });
        });
    }    
}