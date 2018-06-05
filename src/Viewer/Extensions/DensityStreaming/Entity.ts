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
        const b = new Behaviour(ctx, t.params);
        return Bootstrap.Task.resolve('Behaviour', 'Background', Streaming.create(t, { label: `Density Streaming`, behaviour: b }));
    }, (ctx, b, t) => {
        return Bootstrap.Task.create<Tree.Node.Any>('Density', 'Background', async ctx => {
            try {
                await b.props.behaviour.invalidateParams(t.params);
            } catch (e) {
            } finally {
                Entity.nodeUpdated(b);
                return Tree.Node.Null;
            }
        });
    });

    export const Setup = Bootstrap.Tree.Transformer.actionWithContext<Entity.Molecule.Molecule, Entity.Action, SetupParams, undefined>({
        id: 'density-streaming-create',
        name: 'Density Streaming',
        description: 'On demand download of density data when a residue or atom is selected.',
        from: [Entity.Molecule.Molecule],
        to: [Entity.Action],
        defaultParams: (ctx, e) => {
            let source: FieldSource = 'X-ray';
            const methods = (e.props.molecule.properties.experimentMethods || []);
            for (const m of methods) {
                if (m.toLowerCase().indexOf('microscopy') >= 0) {
                    source = 'EM';
                    break;
                }
            }
            return { 
                server: ctx.settings.get('extensions.densityStreaming.defaultServer'), 
                id: e.props.molecule.id, 
                source 
            };
        },
        validateParams: p => {
            if (!p.server.trim().length) return ['Enter Server'];
            return !p.id.trim().length ? ['Enter Id'] : void 0;
        }
    }, (context, a, t) => {
        switch (t.params.source) {
            case 'X-ray': return enableStreaming(a, context, t.params);
            case 'EM': return doEm(a, context, t.params);
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

    function doAction(m: Entity.Molecule.Molecule, params: SetupParams, header: ServerDataFormat.Header, sourceId?: string, contourLevel?: number): DensityAction {
        const taskType: Bootstrap.Task.Type = 'Silent';

        const styles: {[F in FieldType]?: Bootstrap.Visualization.Density.Style } = params.source === 'EM'
            ? {
                'EM': Bootstrap.Visualization.Density.Style.create({
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

        const streaming: Partial<CreateStreamingParams> = {
            maxRadius: params.source === 'X-ray' ? 10 : 50,
            server: params.server,
            source: params.source,
            id: sourceId ? sourceId : params.id,
            header,
            isoValueType: params.source === 'X-ray' || contourLevel === void 0
                ? Bootstrap.Visualization.Density.IsoValueType.Sigma 
                : Bootstrap.Visualization.Density.IsoValueType.Absolute,
            isoValues:  params.source === 'X-ray' 
                ? { '2Fo-Fc': 1.5, 'Fo-Fc(+ve)': 3, 'Fo-Fc(-ve)': -3 }
                : { 'EM': contourLevel !== void 0 ? contourLevel : 1.5 },
            displayType: params.source === 'X-ray' ? 'Around Selection' : 'Everything',
            detailLevel: Math.min(2, header.availablePrecisions.length - 1),
            radius: params.source === 'X-ray' ? 5 : 15,
            showEverythingExtent: 3,
            ...styles,
            ...params.initialStreamingParams
        }

        return {
            action: Bootstrap.Tree.Transform.build().add(m, CreateStreaming, streaming, { ref: params.streamingEntityRef }),
            context: void 0
        };
    }

    async function enableStreaming(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: SetupParams, sourceId?: string, contourLevel?: number) {
        let server = params.server.trim();
        if (server[server.length - 1] !== '/') server += '/';

        const uri = `${server}${params.source}/${sourceId ? sourceId : params.id}`;

        const s = await Bootstrap.Utils.ajaxGetString(uri, 'DensityServer').run(ctx)
        try {
            const header = JSON.parse(s) as ServerDataFormat.Header;
            if (!header.isAvailable) {
                return fail(m, `Density streaming is not available for '${params.source}/${params.id}'.`);
            }
            header.channels = header.channels.map(c => c.toUpperCase());
            return doAction(m, params, header, sourceId, contourLevel);
        } catch (e) {
            return fail(e, 'DensityServer API call failed.');
        }
    }

    async function doEmdbId(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: SetupParams, id: string) {
        id = id.trim();
        const s = await Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/${id}`, 'EMDB API').run(ctx);
        try {
            const json = JSON.parse(s);
            const e = json[id];
            let contour: number | undefined = void 0;
            if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                contour = +e[0].map.contour_level.value;
            }
            return await enableStreaming(m, ctx, params, id, contour);
        } catch (e) {
            return fail(m, 'EMDB API call failed.');
        }
    }

    async function doEm(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: SetupParams) {
        const id = params.id.trim().toLowerCase();
        const s = await Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${id}`, 'PDB API').run(ctx);
        try {
            const json = JSON.parse(s);
            const e = json[id];
            let emdbId: string;
            if (e && e[0] && e[0].related_structures) {
                const emdb = e[0].related_structures.filter((s: any) => s.resource === 'EMDB');
                if (!emdb.length) {
                    return fail(m, `No related EMDB entry found for '${id}'.`);
                }
                emdbId = emdb[0].accession;
            } else {
                return fail(m, `No related EMDB entry found for '${id}'.`);
            }
            return await doEmdbId(m, ctx, params, emdbId);
        } catch (e) {
            return fail(m, 'PDBe API call failed.')
        }
    }
}