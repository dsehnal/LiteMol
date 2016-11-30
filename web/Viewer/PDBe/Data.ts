/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Data {
  
    import Plugin = LiteMol.Plugin;
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
            
    import Transformer = Bootstrap.Entity.Transformer;
    import Tree = Bootstrap.Tree;
    import Transform = Tree.Transform;     
    import Visualization = Bootstrap.Visualization;
    
    // straigtforward
    export const DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({ 
        sourceId: 'pdbe-molecule', 
        name: 'PDBe', 
        description: 'Download a molecule from PDBe.',  
        defaultId: '1cbs',
        specificFormat: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF,
        urlTemplate: id => `https://www.ebi.ac.uk/pdbe/static/entry/${id.toLowerCase()}_updated.cif`
    });
    
    export interface DownloadBinaryCIFFromCoordinateServerParams {
        id?: string,
        type?: 'Cartoon' | 'Full',
        lowPrecisionCoords?: boolean,
        serverUrl?: string
    }
    export const DownloadBinaryCIFFromCoordinateServer = Bootstrap.Tree.Transformer.action<Entity.Root, Entity.Action, DownloadBinaryCIFFromCoordinateServerParams>({
        id: 'molecule-download-bcif-from-coordinate-server',
        name: 'Molecule (BinaryCIF)',
        description: 'Download full or cartoon representation of a PDB entry from the CoordinateServer.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: (ctx) => ({ id: '5iv5', type: 'Cartoon', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://webchemdev.ncbr.muni.cz/CoordinateServer' }),
        validateParams: p => (!p.id || !p.id.trim().length) ? ['Enter Id'] : (!p.serverUrl || !p.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0,  
    }, (context, a, t) => {
        let query = t.params.type === 'Cartoon' ? 'cartoon' : 'full';
        let id = t.params.id!.toLowerCase().trim();
        let url = `${t.params.serverUrl}${t.params.serverUrl![t.params.serverUrl!.length - 1] === '/' ? '' : '/'}${id}/${query}?encoding=bcif&lowPrecisionCoords=${t.params.lowPrecisionCoords ? '1' : '2'}`;

        return Bootstrap.Tree.Transform.build()
            .add(a, Entity.Transformer.Data.Download, { url, type: 'Binary', id })
            .then(Entity.Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
            .then(Entity.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false })
    });
         
    // this creates the electron density based on the spec you sent me
    export const DownloadDensity = Bootstrap.Tree.Transformer.action<Entity.Root, Entity.Action, { id?: string }>({
        id: 'pdbe-density-download-data',
        name: 'Density Data from PDBe',
        description: 'Download density data from PDBe.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: () => ({ id: '1cbs' }),
        validateParams: p => (!p.id || !p.id.trim().length) ? ['Enter Id'] : void 0,  
    }, (context, a, t) => {
        
        let action = Bootstrap.Tree.Transform.build();
        let id = t.params.id!.trim().toLocaleLowerCase();
        
        let group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: t.props.ref })
            
        let diff = group
            .then(Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/coordinates/files/${id}_diff.ccp4`, type: 'Binary', id: t.params.id, description: 'Fo-Fc' })
            .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc', normalize: false }, { isBinding: true });
            
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
        
        let base = group
            .then(Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/coordinates/files/${id}.ccp4`, type: 'Binary', id: t.params.id, description: '2Fo-Fc' })
            .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc', normalize: false }, { isBinding: true })
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
                    transparency: { alpha: 0.45 }
                })
            });
            
        return action;
    }, "Electron density loaded, click on a residue or an atom to view the data.");
        
}