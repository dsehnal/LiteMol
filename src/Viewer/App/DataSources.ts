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
        defaultId: 'https://webchem.ncbr.muni.cz/CoordinateServer/1tqn/cartoon',
        urlTemplate: id => id,
        isFullUrl: true
    });  

    export type ObtainDownloadSource 
        = { 
            kind: 'CoordinateServer', 
            id: string,
            type: 'Cartoon' | 'Full',
            lowPrecisionCoords: boolean,
            serverUrl: string 
        } | {
            kind: 'PDBe Updated mmCIF',
            id: string
        } | {
            kind: 'URL',
            format: Core.Formats.FormatInfo,
            url: string
        } | {
            kind: 'File on Disk',
            file?: File
        }

    export const ObtainDownloadSources: ObtainDownloadSource['kind'][] = ['CoordinateServer', 'PDBe Updated mmCIF', 'URL', 'File on Disk'];

    export interface MoleculeDownloadParams {
        sourceKind: ObtainDownloadSource['kind'],
        sources: { [kind: string]: ObtainDownloadSource }
    }

    export const ObtainMolecule = Bootstrap.Tree.Transformer.action<Entity.Root, Entity.Action, MoleculeDownloadParams>({
        id: 'viewer-obtain-molecule',
        name: 'Molecule',
        description: 'Download or open a molecule from various sources.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: (ctx) => ({
            sourceKind: 'CoordinateServer',
            sources: {
                'CoordinateServer': { kind: 'CoordinateServer', id: '1cbs', type: 'Full', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://webchem.ncbr.muni.cz/CoordinateServer' },
                'PDBe Updated mmCIF': { kind: 'PDBe Updated mmCIF', id: '1cbs' },
                'URL': { kind: 'URL', format: Core.Formats.Molecule.SupportedFormats.mmCIF, url: 'https://webchem.ncbr.muni.cz/CoordinateServer/1tqn/cartoon' },
                'File on Disk': { kind: 'File on Disk', file: void 0 }
            }
        }),
        validateParams: p => {
            const src = p.sources[p.sourceKind];
            switch (src.kind) {
                case 'CoordinateServer':
                    return (!src.id || !src.id.trim().length) ? ['Enter Id'] : (!src.serverUrl || !src.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0;
                case 'PDBe Updated mmCIF':
                    return (!src.id || !src.id.trim().length) ? ['Enter Id'] : void 0;
                case 'URL':
                    return (!src.url || !src.url.trim().length) ? ['Enter URL'] : void 0;
                case 'File on Disk':
                    return (!src.file) ? ['Select a File'] : void 0;
            }
            return void 0;
        }        
    }, (context, a, t) => {
        const src = t.params.sources[t.params.sourceKind];
        const transform = Bootstrap.Tree.Transform.build();
        switch (src.kind) {
            case 'CoordinateServer':
                transform.add(a, PDBe.Data.DownloadBinaryCIFFromCoordinateServer, src);
                break;
            case 'PDBe Updated mmCIF':
                transform.add(a, PDBe.Data.DownloadMolecule, { id: src.id });
                break;
            case 'URL':
                transform.add(a, DownloadMolecule, { format: src.format, id: src.url });
                break;
            case 'File on Disk':
                transform.add(a, Bootstrap.Entity.Transformer.Molecule.OpenMoleculeFromFile, { file: src.file });
                break;
        }

        return transform;
    });   
}