/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Data {
    "use strict";

    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
            
    import Transformer = Bootstrap.Entity.Transformer;
    import Tree = Bootstrap.Tree;
    import Transform = Tree.Transform;     
    import Visualization = Bootstrap.Visualization;
         
    export const DensitySourceLabels = {
        'electron-density': 'X-ray (from PDB Id)',
        'emdb-pdbid': 'EMDB (from PDB Id)',
        'emdb-id': 'EMDB (from EMDB Id)'
    }
    export const DensitySources: (keyof typeof DensitySourceLabels)[] = ['electron-density', 'emdb-pdbid', 'emdb-id'];
    export interface DownloadDensityParams {
        /**
         * Default source is 'electron-density'
         */
        sourceId?: keyof typeof DensitySourceLabels, 
        id?: string | { [sourceId: string]: string }
    }

    export interface DensityActionContext { id: string, refs: string[], groupRef?: string }
    type DensityAction = Tree.Transformer.ActionWithContext<DensityActionContext>

    function doElectron(a: Entity.Root, t: Transform<Entity.Root, Entity.Action, DownloadDensityParams>, id: string): DensityAction {
        let action = Bootstrap.Tree.Transform.build();
        id = id.trim().toLowerCase();
        
        let groupRef = t.props.ref ? t.props.ref : Bootstrap.Utils.generateUUID();       
        let group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: groupRef })
        
        let diffRef = Bootstrap.Utils.generateUUID();
        let mainRef = Bootstrap.Utils.generateUUID();

        let diff = group
            .then(Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/coordinates/files/${id}_diff.ccp4`, type: 'Binary', id, description: 'Fo-Fc', title: 'Density' })
            .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc' }, { isBinding: true, ref: diffRef });
            
        diff
            .then(Transformer.Density.CreateVisualBehaviour, {
                id: 'Fo-Fc(-ve)',  
                isoSigmaMin: -5,
                isoSigmaMax: 0,    
                minRadius: 0,
                maxRadius: 10,                
                radius: 5,
                showFull: false,
                style: Visualization.Density.Style.create({
                    isoValue: -3,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0xBB3333), // can also use fromRgb(0-255 ranges), fromHsl, fromHsv; found in Visualization/Base/Theme.ts
                    isWireframe: true,
                    transparency: { alpha: 1.0 }
                })
            });
            
        diff
            .then(Transformer.Density.CreateVisualBehaviour, {  
                id: 'Fo-Fc(+ve)', 
                isoSigmaMin: 0,
                isoSigmaMax: 5,
                minRadius: 0,
                maxRadius: 10,                    
                radius: 5,
                showFull: false,
                style: Visualization.Density.Style.create({
                    isoValue: 3,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x33BB33), 
                    isWireframe: true,
                    transparency: { alpha: 1.0 }
                })
            });            
        
        group
            .then(Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/coordinates/files/${id}.ccp4`, type: 'Binary', id, description: '2Fo-Fc', title: 'Density' })
            .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc' }, { isBinding: true, ref: mainRef })
            .then(Transformer.Density.CreateVisualBehaviour, {  
                id: '2Fo-Fc',
                isoSigmaMin: 0,
                isoSigmaMax: 2,                    
                minRadius: 0,
                maxRadius: 10,
                radius: 5,
                showFull: false,
                style: Visualization.Density.Style.create({
                    isoValue: 1.5,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2), 
                    isWireframe: false,
                    transparency: { alpha: 0.4 }
                })
            });
            
        return {
            action,
            context: { id, refs: [mainRef, diffRef], groupRef }
        };
    }

    function doEmdb(a: Entity.Root, t: Transform<Entity.Root, Entity.Action, DownloadDensityParams>, id: string, contourLevel?: number): DensityAction {
        let action = Bootstrap.Tree.Transform.build();
                
        let mainRef = Bootstrap.Utils.generateUUID();

        let labelId = 'EMD-' + id;

        action
            .add(a, Transformer.Data.Download, { 
                url: `https://www.ebi.ac.uk/pdbe/static/files/em/maps/emd_${id}.map.gz`, 
                type: 'Binary', 
                id: labelId, 
                description: 'EMDB Density', 
                responseCompression: Bootstrap.Utils.DataCompressionMethod.Gzip,
                title: 'Density' 
            })
            .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: labelId }, { isBinding: true, ref: mainRef })
            .then(Transformer.Density.CreateVisualBehaviour, {
                id: 'Density',  
                isoSigmaMin: -5,
                isoSigmaMax: 5,    
                minRadius: 0,
                maxRadius: 50,                
                radius: 5,
                showFull: false,
                style: Visualization.Density.Style.create({
                    isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                    isoValueType: contourLevel !== void 0 ? Bootstrap.Visualization.Density.IsoValueType.Absolute : Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                    isWireframe: false,
                    transparency: { alpha: 0.3 }
                })
            });
        
        return {
            action,
            context: { id, refs: [mainRef] }
        };
    }

    function fail(a: Entity.Root, message: string): DensityAction {
        return {
            action: Bootstrap.Tree.Transform.build()
                .add(a, Transformer.Basic.Fail, { title: 'Density', message }),
            context: <any>void 0 
        };
    }

    async function doEmdbPdbId(ctx: Bootstrap.Context, a: Entity.Root, t: Transform<Entity.Root, Entity.Action, DownloadDensityParams>, id: string) {
        id = id.trim().toLowerCase();
        let s = await Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${id}`, 'PDB API').run(ctx)
                
        try {
            let json = JSON.parse(s);
            let emdbId: string;
            let e = json[id];
            if (e && e[0] && e[0].related_structures) {
                let emdb = e[0].related_structures.filter((s: any) => s.resource === 'EMDB');
                if (!emdb.length) {
                    return fail(a, `No related EMDB entry found for '${id}'.`);
                }
                emdbId = emdb[0].accession.split('-')[1]; 
            } else {
                return fail(a, `No related EMDB entry found for '${id}'.`);
            }
            return doEmdbId(ctx, a, t, emdbId);
        } catch (e) {
            return fail(a, 'PDBe API call failed.');
        }
    }

    async function doEmdbId(ctx: Bootstrap.Context, a: Entity.Root, t: Transform<Entity.Root, Entity.Action, DownloadDensityParams>, id: string) {
        id = id.trim();
        let s = await Bootstrap.Utils.ajaxGetString(`https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-${id}`, 'EMDB API').run(ctx)
        try {
            let json = JSON.parse(s);
            let contour: number | undefined = void 0;
            let e = json['EMD-' + id];
            if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                contour = +e[0].map.contour_level.value;
            }
            return doEmdb(a, t, id, contour);
        } catch (e) {
            return fail(a, 'EMDB API call failed.');
        }
    }

    // this creates the electron density based on the spec you sent me
    export const DownloadDensity = Bootstrap.Tree.Transformer.actionWithContext<Entity.Root, Entity.Action, DownloadDensityParams, DensityActionContext>({
        id: 'pdbe-density-download-data',
        name: 'Density Data from PDBe',
        description: 'Download density data from PDBe.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: () => ({ 
            sourceId: 'electron-density', 
            id: { 
                'electron-density': '1cbs',
                'emdb-id': '3121',
                'emdb-pdbid': '5aco' 
            } 
        }),
        validateParams: p => {
            let source = p.sourceId ? p.sourceId : 'electron-density';
            if (!p.id) return ['Enter Id'];
            let id = typeof p.id === 'string' ? p.id : p.id[source];
            return !id.trim().length ? ['Enter Id'] : void 0;  
        }   
    }, (context, a, t) => {        
        let id: string;
        if (typeof t.params.id === 'string') id = t.params.id;
        else id = t.params.id![t.params.sourceId!]
        switch (t.params.sourceId || 'electron-density') {
            case 'electron-density': return doElectron(a, t, id);
            case 'emdb-id': return doEmdbId(context, a, t, id);
            case 'emdb-pdbid': return doEmdbPdbId(context, a, t, id);
            default: return fail(a, 'Unknown source.');
        }
    }, (ctx, actionCtx) => {
        if (!actionCtx) return;

        let { id, refs, groupRef } = actionCtx!; 
        let sel = ctx.select(Tree.Selection.byRef(...refs));
        if (sel.length === refs.length) {
            ctx.logger.message('Density loaded, click on a residue or an atom to view the data.');
        } else if (sel.length > 0) {
            ctx.logger.message('Density partially loaded, click on a residue or an atom to view the data.');
        } else {
            ctx.logger.error(`Density for ID '${id}' failed to load.`);
            if (groupRef) {
                Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, groupRef);
            }
        }
    });
        
}