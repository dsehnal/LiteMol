/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Transforms {
    
    let pluginSuperposed = Plugin.create({
        target: '#superposed',
        viewportBackground: '#fff',
        layoutState: {
            hideControls: true,
            isExpanded: false
        },
        customSpecification: PluginSpec
    });

    let pluginOriginal = Plugin.create({
        target: '#original',
        viewportBackground: '#fff',
        layoutState: {
            hideControls: true,
            isExpanded: false
        },
        customSpecification: PluginSpec
    });
    
    async function process() {
        let ids = (document.getElementById('pdbIDs') as HTMLInputElement).value.split(',').map(id => id.trim());

        pluginSuperposed.clear();
        pluginOriginal.clear();

        // this makes an extra call to the server to display the original structures
        // because I was lazy to redo this app to reuse the same data in two 
        // different plugin instances.
        //
        // Do not do this in production :)
        await fetch(pluginOriginal, ids, true);

        // wrap the process in a task to show progress in the build-in UI
        let task = Bootstrap.Task.create('Transforms', 'Normal', async ctx => {
            await ctx.updateProgress('Downloading data...');
            await fetch(pluginSuperposed, ids);            
            await ctx.updateProgress('Creating superposition data...');
            let data = getSuperpositionData(pluginSuperposed);
            await ctx.updateProgress('Finding transforms...');
            let transforms = Comparison.Structure.superimposeByIndices(data);
            await ctx.updateProgress('Finishing...');
            applyTransforms(pluginSuperposed, data, transforms);
        });

        task.run(pluginSuperposed.context);
    }

    (document.getElementById('process') as HTMLButtonElement).onclick = process;
}
