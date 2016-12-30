/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {  
    import React = LiteMol.Plugin.React

    export const DownloadDensityToastMessage = (ctx: Bootstrap.Context) => {
        let download = (e: React.MouseEvent) => {
            e.preventDefault();
            let t = ctx.transforms.getController(DownloadDensity, ctx.select('density-downloader')[0]);
            Bootstrap.Command.Toast.Hide.dispatch(ctx, { key: 'DownloadDensityToast' });
            if (t) t.apply();
        };
        return <div>
            Density data available. <a style={{cursor: 'pointer'}} onClick={download}>Click here</a> to download.
        </div>;
    }
}