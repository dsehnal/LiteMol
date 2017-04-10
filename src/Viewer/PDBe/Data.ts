/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Data {
    "use strict";

    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
            
    import Transformer = Bootstrap.Entity.Transformer;
    
    // straigtforward
    export const DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({ 
        sourceId: 'pdbe-molecule', 
        name: 'PDBe (mmCIF)', 
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
        name: 'Download Molecule',
        description: 'Download full or cartoon representation of a PDB entry using the BinaryCIF format.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: (ctx) => ({ id: '1cbs', type: 'Full', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://webchem.ncbr.muni.cz/CoordinateServer' }),
        validateParams: p => (!p.id || !p.id.trim().length) ? ['Enter Id'] : (!p.serverUrl || !p.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0,  
    }, (context, a, t) => {
        let query = t.params.type === 'Cartoon' ? 'cartoon' : 'full';
        let id = t.params.id!.toLowerCase().trim();
        let url = `${t.params.serverUrl}${t.params.serverUrl![t.params.serverUrl!.length - 1] === '/' ? '' : '/'}${id}/${query}?encoding=bcif&lowPrecisionCoords=${t.params.lowPrecisionCoords ? '1' : '0'}`;

        return Bootstrap.Tree.Transform.build()
            .add(a, Entity.Transformer.Data.Download, { url, type: 'Binary', id, title: 'Molecule' })
            .then(Entity.Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
            .then(Entity.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false })
    });        
}