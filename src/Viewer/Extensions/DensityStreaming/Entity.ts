/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.DensityStreaming {
    'use strict';

    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    import Tree = Bootstrap.Tree;

    export interface Streaming extends Entity<Entity.Behaviour.Props<Behaviour>> { }
    export const Streaming = Entity.create<Entity.Behaviour.Props<Behaviour>>({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_DS', description: 'Behaviour that downloads density data for molecule selection on demand.' });

    type DataInfo = { maxQueryRegion: number[], data: {[K in DataType]?: { mean: number, sigma: number, min: number, max: number } } }

    export interface CreateStreamingParamsBase {
        minRadius: number;
        maxRadius: number;
        radius: number,
        server: string,
        source: FieldSource,
        id: string,
        info: DataInfo
    }

    export type CreateStreamingParams = CreateStreamingParamsBase & {[F in FieldType]?: Bootstrap.Visualization.Density.Style }

    export const CreateStreaming = Tree.Transformer.create<Entity.Molecule.Molecule, Streaming, CreateStreamingParams>({
        id: 'density-streaming-create-streaming',
        name: 'Density Streaming',
        description: 'On demand download of density data when a residue or atom is selected.',
        from: [],
        to: [Streaming],
        isUpdatable: true,
        defaultParams: () => <any>{},
        customController: (ctx, t, e) => new Bootstrap.Components.Transform.DensityVisual(ctx, t, e) as Bootstrap.Components.Transform.Controller<any>
    }, (ctx, a, t) => {
        let params = t.params;
        let b = new Behaviour(ctx, {
            styles: {
                'EMD': params['EMD'],
                '2Fo-Fc': params['2Fo-Fc'],
                'Fo-Fc(+ve)': params['Fo-Fc(+ve)'],
                'Fo-Fc(-ve)': params['Fo-Fc(-ve)']
            },
            source: t.params.source,
            id: t.params.id,
            radius: t.params.radius,
            server: t.params.server,
            maxQueryRegion: t.params.info.maxQueryRegion
        });
        return Bootstrap.Task.resolve('Behaviour', 'Background', Streaming.create(t, { label: `Density Streaming`, behaviour: b }));
    }, (ctx, b, t) => {
        let oldParams = b.transform.params as CreateStreamingParams;
        let params = t.params;

        if (oldParams.radius !== params.radius) return void 0;

        return Bootstrap.Task.create<Tree.Node.Any>('Density', 'Background', async ctx => {
            await ctx.updateProgress('Updating styles...');
            try {
                await b.props.behaviour.invalidateStyles(params);
            } catch (e) {
            } finally {
                Entity.nodeUpdated(b);
                return Tree.Node.Null;
            }
        });
    });

    export interface CreateParams {
        server: string,
        id: string,
        source: FieldSource
    }

    export const Create = Bootstrap.Tree.Transformer.actionWithContext<Entity.Molecule.Molecule, Entity.Action, CreateParams, undefined>({
        id: 'density-streaming-create',
        name: 'Density Streaming',
        description: 'On demand download of density data when a residue or atom is selected.',
        from: [Entity.Molecule.Molecule],
        to: [Entity.Action],
        defaultParams: (ctx, e) => {
            let source: FieldSource = 'X-ray';
            let method = (e.props.molecule.properties.experimentMethod || '').toLowerCase();
            if (method.indexOf('microscopy') >= 0) source = 'EMD';
            return { server: ctx.settings.get('extensions.densityStreaming.defaultServer'), id: e.props.molecule.id, source };
        },
        validateParams: p => {
            if (!p.server.trim().length) return ['Enter Server'];
            return !p.id.trim().length ? ['Enter Id'] : void 0;
        }
    }, (context, a, t) => {
        switch (t.params.source) {
            case 'X-ray': return doCS(a, context, t.params);
            case 'EMD': return doEmd(a, context, t.params);
            default: return fail(a, 'Unknown data source.');
        }
    });

    type DensityAction = Tree.Transformer.ActionWithContext<undefined>

    function fail(e: Entity.Any, message: string): DensityAction {
        return {
            action: Bootstrap.Tree.Transform.build()
                .add(e, Transformer.Basic.Fail, { title: 'Density Streaming', message }),
            context: void 0
        };
    }

    function doAction(m: Entity.Molecule.Molecule, params: CreateParams, info: DataInfo, sourceId?: string, contourLevel?: number): DensityAction {
        let radius = info.maxQueryRegion.reduce((m, v) => Math.min(m, v), info.maxQueryRegion[0]) / 2 - 3;
        let taskType: Bootstrap.Task.Type = 'Silent';

        let styles: {[F in FieldType]?: Bootstrap.Visualization.Density.Style } = params.source === 'EMD'
            ? {
                'EMD': Bootstrap.Visualization.Density.Style.create({
                    isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                    isoValueType: contourLevel !== void 0 ? Bootstrap.Visualization.Density.IsoValueType.Absolute : Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                    isWireframe: false,
                    transparency: { alpha: 0.3 },
                    taskType
                })
            }
            : {
                '2Fo-Fc': Bootstrap.Visualization.Density.Style.create({
                    isoValue: 1.5,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                    isWireframe: false,
                    transparency: { alpha: 0.4 },
                    taskType
                }),
                'Fo-Fc(+ve)': Bootstrap.Visualization.Density.Style.create({
                    isoValue: 3,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                    isWireframe: true,
                    transparency: { alpha: 1.0 },
                    taskType
                }),
                'Fo-Fc(-ve)': Bootstrap.Visualization.Density.Style.create({
                    isoValue: -3,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0xBB3333),
                    isWireframe: true,
                    transparency: { alpha: 1.0 },
                    taskType
                })
            };

        let streaming: CreateStreamingParams = {
            minRadius: 0,
            maxRadius: params.source === 'X-ray' ? Math.min(10, radius) : Math.min(50, radius),
            radius: Math.min(5, radius),
            server: params.server,
            source: params.source,
            id: sourceId ? sourceId : params.id,
            info,
            ...styles
        }

        return {
            action: Bootstrap.Tree.Transform.build().add(m, CreateStreaming, streaming),
            context: void 0
        };
    }

    async function doCS(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: CreateParams, sourceId?: string, contourLevel?: number) {
        let server = params.server.trim();
        if (server[server.length - 1] !== '/') server += '/';

        let uri = `${server}${params.source}/${sourceId ? sourceId : params.id}`;

        let s = await Bootstrap.Utils.ajaxGetString(uri, 'DensityServer').run(ctx)
        try {
            let json = JSON.parse(s);
            if (!json.isAvailable) {
                return fail(m, `Density streaming is not available for '${params.source}/${params.id}'.`);
            }
            return doAction(m, params, { maxQueryRegion: json.maxQueryRegion, data: json.dataInfo }, sourceId, contourLevel);
        } catch (e) {
            return fail(e, 'DensityServer API call failed.');
        }
    }

    async function doEmdbId(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: CreateParams, id: string) {
        id = id.trim();
        let s = await Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-${id}`, 'EMDB API').run(ctx);
        try {
            let json = JSON.parse(s);
            let contour: number | undefined = void 0;
            let e = json['EMD-' + id];
            if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                contour = +e[0].map.contour_level.value;
            }
            return await doCS(m, ctx, params, id, contour);
        } catch (e) {
            return fail(m, 'EMDB API call failed.');
        }
    }

    async function doEmd(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: CreateParams) {
        let id = params.id.trim().toLowerCase();
        let s = await Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${id}`, 'PDB API').run(ctx);
        try {
            let json = JSON.parse(s);
            let emdbId: string;
            let e = json[id];
            if (e && e[0] && e[0].related_structures) {
                let emdb = e[0].related_structures.filter((s: any) => s.resource === 'EMDB');
                if (!emdb.length) {
                    return fail(m, `No related EMDB entry found for '${id}'.`);
                }
                emdbId = emdb[0].accession.split('-')[1];
            } else {
                return fail(m, `No related EMDB entry found for '${id}'.`);
            }
            return await doEmdbId(m, ctx, params, emdbId);
        } catch (e) {
            return fail(m, 'PDBe API call failed.')
        }
    }
}