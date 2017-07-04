/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {

    function getParam(name: string, regex: string): string {
        let r = new RegExp(`${name}=(${regex})[&]?`, 'i');
        return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || ''); 
    }

    export function createInstance(target: HTMLElement, layoutState: Bootstrap.Components.LayoutState, ignoreUrlParams = false) {
        const plugin = Plugin.create({ 
            customSpecification: PluginSpec, 
            target, 
            layoutState
        });
        plugin.context.logger.message(`LiteMol Viewer ${VERSION.number}`);  

        if (ignoreUrlParams) return plugin;

        let theme = getParam('theme', '[a-z]+').toLowerCase() || 'light'; 
        if (theme === 'light') {
            plugin.setViewportBackground('#FCFBF9');
        }

        let pdbId = getParam('loadFromPDB', '[a-z0-9]+').toLowerCase().trim();
        if (pdbId.length === 4) {
            let t = plugin.createTransform().add(plugin.root, PDBe.Data.DownloadMolecule, { id: pdbId });
            plugin.applyTransform(t);
            return;
        }

        let downloadUrl = getParam('loadFromURL', '[^&]+').trim();
        if (downloadUrl) {
            let format = Core.Formats.Molecule.SupportedFormats.mmCIF;
            switch (getParam('loadFromURLFormat', '[a-z]+').toLocaleLowerCase().trim()) {
                case 'pdb': format = Core.Formats.Molecule.SupportedFormats.PDB; break;
                case 'sdf': format = Core.Formats.Molecule.SupportedFormats.SDF; break;
                case 'mmbcif': format = Core.Formats.Molecule.SupportedFormats.mmBCIF; break;
            }
            let t = plugin.createTransform().add(plugin.root, DataSources.DownloadMolecule, { id: downloadUrl, format });
            plugin.applyTransform(t);
        }

        let downloadCS = getParam('loadFromCS', '[^&]+').trim();
        if (downloadCS && downloadCS.length >= 4 && downloadCS.length <= 10) {
            let t = plugin.createTransform().add(plugin.context.tree.root, PDBe.Data.DownloadBinaryCIFFromCoordinateServer, { 
                id: downloadCS,
                type: 'Full' as 'Full',
                lowPrecisionCoords: true,
                serverUrl: 'https://webchem.ncbr.muni.cz/CoordinateServer'
            });
            plugin.applyTransform(t);
        }

        let example = Examples.ExampleMap[getParam('example', '[a-z0-9\-]+').toLowerCase().trim()];
        if (example) example.provider(plugin);

        return plugin;
    }
}
