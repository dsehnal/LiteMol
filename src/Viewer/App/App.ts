/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {

    function getParam(name: string, regex: string): string {
        let r = new RegExp(`${name}=(${regex})[&]?`, 'i');
        return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || ''); 
    }

    let plugin = Plugin.create({ 
        customSpecification: PluginSpec, 
        target: document.getElementById('app')!, 
        layoutState: { isExpanded: true } 
    });
    plugin.context.logger.message(`LiteMol Viewer ${VERSION.number}`);  

    let theme = getParam('theme', '[a-z]+').toLowerCase(); 
    if (theme === 'light') {
        plugin.setViewportBackground('#fff');
    }

    (function () {
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

        let example = Examples.ExampleMap[getParam('example', '[a-z0-9\-]+').toLowerCase().trim()];
        if (example) example.provider(plugin);
    })();
}
