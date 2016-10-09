/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {       
    let version = '1.1.6';     
    let plugin = new Plugin.Instance(PluginSpec, document.getElementById('app')!);
    plugin.context.logger.message(`LiteMol Viewer ${version}`);  
    LiteMol.Bootstrap.Command.Layout.SetState.dispatch(plugin.context, { isExpanded: true });

    let theme = (((window.location.search || '').match(/theme=([a-z]+)[&]?/i) || [])[1] || '').toLowerCase();
    if (theme === 'light') {
        LiteMol.Bootstrap.Command.Layout.SetViewportOptions.dispatch(plugin.context, { clearColor: Visualization.Color.fromRgb(255, 255, 255) });
    }

    let pdbId = (((window.location.search || '').match(/loadFromPDB=([a-z0-9]+)[&]?/i) || [])[1] || '').toLowerCase().trim();
    if (pdbId.length === 4) {
        let t = Bootstrap.Tree.Transform.build().add(plugin.context.tree.root, PDBe.Data.DownloadMolecule, { id: pdbId });
        Bootstrap.Tree.Transform.apply(plugin.context, t).run(plugin.context)
    }
}
