/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity.Transformer.Molecule.CoordinateStreaming {
    "use strict";



    export interface CreateStreamingBehaviourParams {
        server?: string,
        radius?: number
    }

    export const CreateBehaviour = Tree.Transformer.create<Entity.Molecule.Model, Entity.Molecule.CoordinateStreaming.Behaviour, CreateStreamingBehaviourParams>({
        id: 'streaming-create-behaviour',
        name: 'Coordinate Streaming',
        description: 'Enable coordinate data streaming for this molecule.',
        from: [Entity.Molecule.Model],
        to: [Entity.Molecule.CoordinateStreaming.Behaviour],
        defaultParams: ctx => ({ server: ctx.settings.get('molecule.coordinateStreaming.defaultServer') || '', radius: ctx.settings.get('molecule.coordinateStreaming.defaultRadius') || 0 }),
    }, (ctx, a, t) => {
        return Task.resolve('Behaviour', 'Background', Entity.Molecule.CoordinateStreaming.Behaviour.create(t, { label: `Coordinate Streaming`, behaviour: new Bootstrap.Behaviour.Molecule.CoordinateStreaming(ctx, t.params.server!, t.params.radius) }));
    }
    );

    export interface CreateModelParams {
        data?: ArrayBuffer,
        transform?: number[]
    }

    export const CreateModel = Tree.Transformer.create<Entity.Molecule.CoordinateStreaming.Behaviour, Entity.Molecule.Model, CreateModelParams>({
        id: 'streaming-create-model',
        name: 'Streaming Model',
        description: '',
        from: [Entity.Molecule.CoordinateStreaming.Behaviour],
        to: [Entity.Molecule.Model],
        defaultParams: () => ({})
    }, (ctx, a, t) => {

        return Task.create<Entity.Molecule.Model>('Load', 'Silent', ctx => {
            let cif = Core.Formats.CIF.Binary.parse(t.params.data!);
            if (cif.isError) return;

            let model = Core.Formats.Molecule.mmCIF.ofDataBlock(cif.result.dataBlocks[0]).models[0];
            if (t.params.transform) Core.Structure.Operator.applyToModelUnsafe(t.params.transform, model);
            ctx.resolve(Entity.Molecule.Model.create(t, { label: 'part', model }));
        });
    }
    );

    export interface InitStreamingParams {
        id?: string,
        server?: string,
        radius?: number
    }

    export const InitStreaming = Tree.Transformer.create<Entity.Root, Entity.Action, InitStreamingParams>({
        id: 'streaming-init',
        name: 'Coordinate Streaming',
        description: 'Download a smaller version of the molecule required to display cartoon representation and stream the rest of the coordinates as required.',
        from: [Entity.Root],
        to: [Entity.Action],
        validateParams: p => !(p.id || '').trim().length ? ['Enter id'] : !(p.server || '').trim().length ? ['Specify server'] : void 0,
        defaultParams: ctx => ({ id: ctx.settings.get('molecule.coordinateStreaming.defaultId') || '', server: ctx.settings.get('molecule.coordinateStreaming.defaultServer') || '', radius: ctx.settings.get('molecule.coordinateStreaming.defaultRadius') || 0 }),
    }, (context, a, t) => {

        return Task.create<Entity.Action>('Macromolecule', 'Normal', ctx => {

            let action = Tree.Transform.build()
                .add(a, <Tree.Transformer.To<Entity.Data.Binary>>Data.Download, { url: Bootstrap.Behaviour.Molecule.CoordinateStreaming.getBaseUrl(t.params.id!, t.params.server!), type: 'Binary', id: t.params.id })
                .then(Data.ParseBinaryCif, { id: t.params.id }, { isBinding: true })
                .then(Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
                .then(Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false })
                .then(CreateBehaviour, { server: t.params.server, radius: t.params.radius });

            Tree.Transform.apply(context, action).run(context)
                .then(r => ctx.resolve(Tree.Node.Null))
                .catch(ctx.reject);
        });
    });
}
