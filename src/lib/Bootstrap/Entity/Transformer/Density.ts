/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity.Transformer.Density {
    "use strict";

    export interface ParseDataParams {
        id?: string,
        format: LiteMol.Core.Formats.FormatInfo
    }
    export const ParseData = Tree.Transformer.create<Entity.Data.String | Entity.Data.Binary, Entity.Density.Data, ParseDataParams>({
        id: 'density-parse-binary',
        name: 'Density Data',
        description: 'Parse density from binary data.',
        from: [Entity.Data.String, Entity.Data.Binary],
        to: [Entity.Density.Data],
        isUpdatable: true,
        defaultParams: () => ({ format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4 })
    }, (bigCtx, a, t) => {
        return Task.create<Entity.Density.Data>(`Create Density (${a.props.label})`, 'Background', async ctx => {
            let data = await Task.fromComputation(`Parse Density (${a.props.label})`, 'Normal', t.params.format!.parse(a.props.data)).setReportTime(true).run(bigCtx);
            if (data.isError) {
                throw data.toString();
            }
            let e = Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data: data.result });
            return e;
        });
    });

    export interface CreateFromCifParams {
        id?: string,
        blockIndex: number
    }

    export const CreateFromCif = Tree.Transformer.create<Entity.Data.CifDictionary, Entity.Density.Data, CreateFromCifParams>({
        id: 'density-create-from-cif',
        name: 'Density Data',
        description: 'Parse density from CIF data.',
        from: [Entity.Data.CifDictionary],
        to: [Entity.Density.Data],
        isUpdatable: false,
        defaultParams: () => ({ blockIndex: 0 })
    }, (bigCtx, a, t) => {
        return Task.create<Entity.Density.Data>('Create Density', 'Normal', async ctx => {
            await ctx.updateProgress('Parsing...');
            let data = Core.Formats.Density.CIF.parse(a.props.dictionary.dataBlocks[t.params.blockIndex]);
            if (data.isError) {
                throw data.toString();
            }
            return Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data: data.result, description: data.result.name });        
        }).setReportTime(true);
    });

    export interface CreateFromDataParams {
        id?: string,
        data: Core.Formats.Density.Data
    }
    
    export const CreateFromData = Tree.Transformer.create<Entity.Root, Entity.Density.Data, CreateFromDataParams>({
        id: 'density-create-from-data',
        name: 'Density Data',
        description: 'Create density from data.',
        from: [],
        to: [Entity.Density.Data],
        isUpdatable: false,
        defaultParams: () => (<any>{ })
    }, (ctx, a, t) => {
        let e = Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data: t.params.data, description: t.params.data.name });
        return Task.resolve<Entity.Density.Data>('Create Density', 'Background', e);
    });

    export interface CreateVisualParams {
        style: Visualization.Density.Style
    }

    export const CreateVisual = Tree.Transformer.create<Entity.Density.Data, Entity.Density.Visual, CreateVisualParams>({
        id: 'density-create-visual',
        name: 'Surface',
        description: 'Create a surface from the density data.',
        from: [Entity.Density.Data],
        to: [Entity.Density.Visual],
        isUpdatable: true,
        defaultParams: () => ({ style: Visualization.Density.Default.Style }),
        validateParams: p => !p.style ? ['Specify Style'] : void 0,
        customController: (ctx, t, e) => new Components.Transform.DensityVisual(ctx, t, e) as Components.Transform.Controller<any>,
    }, (ctx, a, t) => {
        let params = t.params;
        return Visualization.Density.create(a, t, params.style!).setReportTime(Visualization.Style.getTaskType(t.params.style) === 'Normal');
    }, (ctx, b, t) => {
        const oldStyle = (b.transform.params as CreateVisualParams).style;
        const newStyle = t.params.style;

        if (oldStyle.type !== t.params.style.type) return void 0;

        const parent = Tree.Node.findClosestNodeOfType(b, [Entity.Density.Data]) as Entity.Density.Data;
        if (!parent) return void 0;
        const model = b.props.model;
        if (!model) return void 0;

        if (!compareVisualParams(parent.props.data, oldStyle.params, newStyle.params)) return void 0;

        if (!Utils.deepEqual(oldStyle.theme, t.params.style!.theme)) {
            const ti = newStyle.theme;
            const theme = ti.template!.provider(parent, Visualization.Theme.getProps(ti));
            model.applyTheme(theme);
            b.props.style.theme = ti;
            Entity.nodeUpdated(b);
        }
        return Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
    });

    export interface CreateVisualBehaviourParams {
        id?: string,
        isoSigmaMin: number;
        isoSigmaMax: number;
        minRadius: number;
        maxRadius: number;
        radius: number,
        showFull: boolean,
        style: Visualization.Density.Style
    }

    export const CreateVisualBehaviour = Tree.Transformer.create<Entity.Density.Data, Entity.Density.InteractiveSurface, CreateVisualBehaviourParams>({
        id: 'density-create-visual-behaviour',
        name: 'Interactive Surface',
        description: 'Create a surface from the density data when a residue or atom is selected.',
        from: [Entity.Density.Data],
        to: [Entity.Density.InteractiveSurface],
        isUpdatable: true,
        defaultParams: ctx => ({ style: Visualization.Density.Default.Style, radius: ctx.settings.get('density.defaultVisualBehaviourRadius') || 0, isoSigmaMin: -5, isoSigmaMax: 5, minRadius: 0, maxRadius: 10, showFull: false }),
        customController: (ctx, t, e) => new Components.Transform.DensityVisual(ctx, t, e) as Components.Transform.Controller<any>,
    }, (ctx, a, t) => {
        let params = t.params;
        let b = new Bootstrap.Behaviour.Density.ShowDynamicDensity(ctx, {
            style: params.style,
            radius: params.radius,
            showFull: params.showFull
        });
        let isSigma = params.style!.params!.isoValueType === void 0 || params.style!.params!.isoValueType === Visualization.Density.IsoValueType.Sigma;
        return Task.resolve('Behaviour', 'Background', Entity.Density.InteractiveSurface.create(t, { label: `${params.id ? t.params.id : 'Interactive'}, ${Utils.round(params.style!.params!.isoValue!, 2)}${isSigma ? ' \u03C3' : ''}`, behaviour: b }));
    }, (ctx, b, t) => {
        const oldParams = b.transform.params as CreateVisualBehaviourParams;
        const newParams = t.params;
        if (oldParams.style.type !== newParams.style.type) return void 0;

        if (oldParams.isoSigmaMin !== newParams.isoSigmaMin
            || oldParams.isoSigmaMax !== newParams.isoSigmaMax
            || oldParams.minRadius !== newParams.minRadius
            || oldParams.maxRadius !== newParams.maxRadius
            || oldParams.radius !== newParams.radius
            || oldParams.showFull !== newParams.showFull) {
            return void 0; 
        }
        
        let parent = Tree.Node.findClosestNodeOfType(b, [Entity.Density.Data]) as Entity.Density.Data;
        if (!parent) return void 0;

        if (!compareVisualParams(parent.props.data, oldParams.style.params, newParams.style.params)) return void 0;

        let ti = newParams.style.theme;
        b.props.behaviour.updateTheme(ti);
        Entity.nodeUpdated(b);
        return Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
    });

    function compareVisualParams(data: Core.Formats.Density.Data, a: Visualization.Density.Params, b: Visualization.Density.Params) {
        if (!Visualization.Density.areNonIsoParamsSame(a, b)) return false;
        const { valuesInfo } = data;
        const oldIso = a.isoValueType === Visualization.Density.IsoValueType.Absolute
            ? a.isoValue : valuesInfo.mean + valuesInfo.sigma * a.isoValue;
        const newIso = b.isoValueType === Visualization.Density.IsoValueType.Absolute
            ? b.isoValue : valuesInfo.mean + valuesInfo.sigma * b.isoValue;
        return Math.abs(oldIso - newIso) < 1e-6;
    }
}