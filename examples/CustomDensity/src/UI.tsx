/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {  
    import React = LiteMol.Plugin.React

    function applyDownload(ctx: Bootstrap.Context, type: LoaderType) {
        return (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            let t = ctx.transforms.getController(DownloadDensity, ctx.select('density-downloader')[0]);
            // handled in the transform
            //Bootstrap.Command.Toast.Hide.dispatch(ctx, { key: 'DownloadDensityToast' });
            if (t) {
                t.updateParams({ type })
                t.apply();
            }
        };
    }

    export const DownloadDensityToastMessage = (ctx: Bootstrap.Context) => {
        return <div>
            <a style={{cursor: 'pointer'}} onClick={applyDownload(ctx, 'Full 2Fo-Fc')}>Download 2Fo-Fc Density</a>
            { ' or ' }
            <a style={{cursor: 'pointer'}} onClick={applyDownload(ctx, 'Streaming')}>Enable Density Streaming</a>.
        </div>;
    }

    export class DensityLoaderView extends Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{ type: LoaderType }>> {        
        protected renderControls() {            
            let params = this.params;            
            let state = this.controller.latestState;            
            return <div>
                <Plugin.Controls.OptionsGroup 
                    options={LoaderTypes}
                    caption={s => s} 
                    current={params.type} 
                    onChange={(o) => this.updateParams({ type: o }) } 
                    label='Type' />
            </div>
        }        
    }
}