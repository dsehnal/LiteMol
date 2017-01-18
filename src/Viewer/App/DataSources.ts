/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.DataSources { 
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;

    export const DownloadMolecule = Entity.Transformer.Molecule.downloadMoleculeSource({ 
        sourceId: 'url-molecule', 
        name: 'URL', 
        description: 'Download a molecule from the specified Url (if the host server supports cross domain requests).',  
        defaultId: 'https://webchemdev.ncbr.muni.cz/CoordinateServer/1tqn/cartoon',
        urlTemplate: id => id,
        isFullUrl: true
    });        
}