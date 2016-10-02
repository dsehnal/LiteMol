/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {       
    let version = '1.1.5';     
    let plugin = new Plugin.Instance(PluginSpec, document.getElementById('app')!);
    plugin.context.logger.message(`LiteMol Viewer ${version}`);  
    LiteMol.Bootstrap.Command.Layout.SetState.dispatch(plugin.context, { isExpanded: true });

    let theme = (((window.location.search || '').match(/theme=([a-z]+)[&]?/i) || [])[1] || '').toLowerCase();
    if (theme === 'light') {
        LiteMol.Bootstrap.Command.Layout.SetViewportOptions.dispatch(plugin.context, { clearColor: Visualization.Color.fromRgb(255, 255, 255) });
    }
}
