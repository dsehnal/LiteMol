/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {       
    let version = '1.1.0';     
    let plugin = new Plugin.Instance(PluginSpec, document.getElementById('app'));
    plugin.context.logger.message(`LiteMol Viewer ${version}`);
    LiteMol.Bootstrap.Command.Layout.SetState.dispatch(plugin.context, { isExpanded: true });
}
