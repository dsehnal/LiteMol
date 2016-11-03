/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {

    function getParam(name: string, regex: string): string {
        let r = new RegExp(`${name}=(${regex})[&]?`, 'i');
        return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || ''); 
    }

    let plugin = new Plugin.Instance(PluginSpec, document.getElementById('app')!);
    plugin.context.logger.message(`LiteMol Viewer ${VERSION.number}`);  
    LiteMol.Bootstrap.Command.Layout.SetState.dispatch(plugin.context, { isExpanded: true });

    let theme = getParam('theme', '[a-z]+').toLowerCase(); 
    if (theme === 'light') {
        LiteMol.Bootstrap.Command.Layout.SetViewportOptions.dispatch(plugin.context, { clearColor: Visualization.Color.fromRgb(255, 255, 255) });
    }

    (function () {
        let pdbId = getParam('loadFromPDB', '[a-z0-9]+').toLowerCase().trim();
        if (pdbId.length === 4) {
            let t = Bootstrap.Tree.Transform.build().add(plugin.context.tree.root, PDBe.Data.DownloadMolecule, { id: pdbId });
            Bootstrap.Tree.Transform.apply(plugin.context, t).run(plugin.context);
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
            let t = Bootstrap.Tree.Transform.build().add(plugin.context.tree.root, DataSources.DownloadMolecule, { id: downloadUrl, format });
            Bootstrap.Tree.Transform.apply(plugin.context, t).run(plugin.context);
        }
    })();
}
