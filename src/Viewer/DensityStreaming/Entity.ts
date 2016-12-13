/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.DensityStreaming {
    'use strict';

    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    import Tree = Bootstrap.Tree;

    export interface StreamingProps extends Entity.Behaviour.Props<Behaviour> { }    
    export interface Streaming extends Entity<Streaming, StreamingType, StreamingProps> { } 
    export interface StreamingType extends Entity.Type<StreamingType, Streaming, StreamingProps> { }
    export const Streaming = Entity.create<Streaming, StreamingType, StreamingProps>({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_DS', description: 'Behaviour that downloads density data for molecule selection on demand.' }); 

    export interface CreateStreamingParams {
        minRadius: number;
        maxRadius: number;
        radius: number,
        server: string,
        source: FieldSource,
        id: string,
        maxQueryRegion: number[],
        styles: { [F in FieldType]?: Bootstrap.Visualization.Density.Style }
    }

    export const CreateStreaming = Tree.Transformer.create<Entity.Molecule.Molecule, Streaming, CreateStreamingParams>({
        id: 'density-streaming-create-streaming',
        name: 'Density Streaming',
        description: 'On demand download of density data when a residue or atom is selected.',
        from: [],
        to: [Streaming],
        isUpdatable: true,
        defaultParams: () => <any>{}
        //customController: (ctx, t, e) => new Components.Transform.DensityVisual(ctx, t, e) as Components.Transform.Controller<any>,
    }, (ctx, a, t) => {
        let params = t.params;
        let b = new Behaviour(ctx, { 
            styles: params.styles, 
            source: t.params.source, 
            id: t.params.id,
            radius: t.params.radius, 
            server: t.params.server, 
            maxQueryRegion: t.params.maxQueryRegion 
        });
        return Bootstrap.Task.resolve('Behaviour', 'Background', Streaming.create(t, { label: `Density Streaming`, behaviour: b }));
    }, (ctx, b, t) => {
        return void 0;
        // let oldParams = b.transform.params as CreateStreamingParams;
        // let params = t.params;
        // if (oldParams.style!.type !== params.style!.type || !Utils.deepEqual(oldParams.style!.params, params.style!.params)) return void 0;

        // if (oldParams.isoSigmaMin !== params.isoSigmaMin
        //     || oldParams.isoSigmaMax !== params.isoSigmaMax
        //     || oldParams.minRadius !== params.minRadius
        //     || oldParams.maxRadius !== params.maxRadius
        //     || oldParams.radius !== params.radius
        //     || oldParams.showFull !== params.showFull) {
        //     return void 0; 
        // }
        
        // let parent = Tree.Node.findClosestNodeOfType(b, [Entity.Density.Data]);
        // if (!parent) return void 0;

        // let ti = params.style.theme;
        // b.props.behaviour.updateTheme(ti);
        // Entity.nodeUpdated(b);
        // return Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
    });

    type DensityAction = Tree.Transformer.ActionWithContext<undefined>

    function fail(e: Entity.Any, message: string): DensityAction {
        return {
            action: Bootstrap.Tree.Transform.build()
                .add(e, Transformer.Basic.Fail, { title: 'Density Streaming', message }),
            context: void 0
        };
    }

    function doAction(m: Entity.Molecule.Molecule, params: CreateParams, maxQueryRegion: number[], sourceId?: string, contourLevel?: number): DensityAction {
        let radius = maxQueryRegion.reduce((m, v) => Math.min(m, v), maxQueryRegion[0]) / 2 - 3;

        let styles: { [F in FieldType]?: Bootstrap.Visualization.Density.Style } = params.source === 'EMD'
            ? {
                'EMD': Bootstrap.Visualization.Density.Style.create({
                    isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                    isoValueType: contourLevel !== void 0 ? Bootstrap.Visualization.Density.IsoValueType.Absolute : Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                    isWireframe: false,
                    transparency: { alpha: 0.3 }
                })
            }
            : {
                '2Fo-Fc': Bootstrap.Visualization.Density.Style.create({
                    isoValue: 1.5,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2), 
                    isWireframe: false,
                    transparency: { alpha: 0.4 }
                }),
                'Fo-Fc(+ve)': Bootstrap.Visualization.Density.Style.create({
                    isoValue: 3,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x33BB33), 
                    isWireframe: true,
                    transparency: { alpha: 1.0 }
                }),
                'Fo-Fc(-ve)': Bootstrap.Visualization.Density.Style.create({
                    isoValue: -3,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0xBB3333),
                    isWireframe: true,
                    transparency: { alpha: 1.0 }
                })
            };

        let streaming: CreateStreamingParams = {
            minRadius: 0,
            maxRadius: params.source === 'X-ray' ? Math.min(10, radius) : Math.min(50, radius),
            radius: Math.min(40, radius),
            server: params.server,
            source: params.source,
            id: sourceId ? sourceId : params.id,
            maxQueryRegion,
            styles
        }

        return { 
            action: Bootstrap.Tree.Transform.build().add(m, CreateStreaming, streaming),
            context: void 0
        };
    }

    function doCS(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: CreateParams, sourceId?: string, contourLevel?: number) {
        let server = params.server.trim();
        if (server[server.length - 1] !== '/') server += '/';
        
        let uri = `${server}${params.source}/${sourceId ? sourceId : params.id}`;

        return new LiteMol.Core.Promise<DensityAction>((res, rej) => {
            Bootstrap.Utils.ajaxGetString(uri, 'DensityServer')
                .run(ctx)
                .then(s => {
                    try {
                        let json = JSON.parse(s);                  
                        if (!json.isAvailable) {
                            res(fail(m, `Density streaming is not available for '${params.source}/${params.id}'.`));
                            return; 
                        } 
                        res(doAction(m, params, json.maxQueryRegion, sourceId, contourLevel));
                    } catch (e) {
                        res(fail(e, 'DensityServer API call failed.'))
                    }
                })
                .catch(e => res(fail(e, 'DensityServer API call failed.')));
        });
    }

    function doEmdbId(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: CreateParams, id: string) {
        return new LiteMol.Core.Promise<DensityAction>((res, rej) => {
            id = id.trim();
            Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-${id}`, 'EMDB API')
                .run(ctx)
                .then(s => {
                    try {
                        let json = JSON.parse(s);
                        let contour: number | undefined = void 0;
                        let e = json['EMD-' + id];
                        if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                            contour = +e[0].map.contour_level.value;
                        }
                        doCS(m, ctx, params, id, contour)
                            .then(a => res(a))
                            .catch(() => res(fail(m, 'Something went terribly wrong.')));
                    } catch (e) {
                        res(fail(m, 'EMDB API call failed.'))
                    }
                })
                .catch(e => res(fail(m, 'EMDB API call failed.')));
        });
    }

    function doEmd(m: Entity.Molecule.Molecule, ctx: Bootstrap.Context, params: CreateParams) {
        return new LiteMol.Core.Promise((res, rej) => {
            let id = params.id.trim().toLowerCase();
            Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${id}`, 'PDB API')
                .run(ctx)
                .then(s => {
                    try {
                        let json = JSON.parse(s);
                        let emdbId: string;
                        let e = json[id];
                        if (e && e[0] && e[0].related_structures) {
                            let emdb = e[0].related_structures.filter((s: any) => s.resource === 'EMDB');
                            if (!emdb.length) {
                                res(fail(m, `No related EMDB entry found for '${id}'.`));
                                return;        
                            }
                            emdbId = emdb[0].accession.split('-')[1]; 
                        } else {
                            res(fail(m, `No related EMDB entry found for '${id}'.`));
                            return;
                        }
                        doEmdbId(m, ctx, params, emdbId)
                            .then(a => res(a))
                            .catch(() => res(fail(m, 'Something went terribly wrong.')));
                    } catch (e) {
                        res(fail(m, 'PDBe API call failed.'))
                    }
                })
                .catch(e => res(fail(m, 'PDBe API call failed.')));
        });
    }

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
            return { server: ctx.settings.get('density.streaming.defaultServer'), id: e.props.molecule.id, source };
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
}