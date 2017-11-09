/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.SimpleControllerExample {
    let plugin = Plugin.create({
        target: '#app',
        viewportBackground: '#fff',
        layoutState: {
            hideControls: true,
            isExpanded: true
        },

        // Knowing how often and how people use LiteMol 
        // gives us the motivation and data to futher improve it.
        //
        // This option is OFF by default!
        allowAnalytics: true  
    });
    
    let id = '1tqn';
    plugin.loadMolecule({
        id,
        format: 'cif', // or pdb, sdf, binarycif/bcif
        url: `https://www.ebi.ac.uk/pdbe/static/entry/${id.toLowerCase()}_updated.cif`,
        // instead of url, it is possible to use
        // data: "string" or ArrayBuffer (for BinaryCIF)
        
        // loaded molecule and model can be accessed after load
        // using plugin.context.select(modelRef/moleculeRef)[0],
        // for example plugin.context.select('1tqn-molecule')[0]
        moleculeRef: id + '-molecule',
        modelRef: id + '-model',
        // Use this if you want to create your own visual.
        // doNotCreateVisual: true
    }).then(() => {
        // Use this (or a modification of this) for custom visualization:
        // const style = LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks');  
        // const t = plugin.createTransform();
        // t.add(id + '-model', LiteMol.Bootstrap.Entity.Transformer.Molecule.CreateVisual, { style: style })
        // plugin.applyTransform(t);
        console.log('Molecule loaded');
    }).catch(e => {
        console.error(e);
    });

    // To see all the available methods on the SimpleController,
    // please check src/Plugin/Plugin/SimpleController.ts 

    //////////////////////////////////////////////////////////////
    //
    // The underlaying instance of the plugin can be accessed by 
    //
    //   plugin.instance

    //////////////////////////////////////////////////////////////
    //
    // To create and apply transforms, use
    //
    //   let t = plugin.createTransform();
    //   t.add(...).then(...);
    //   plugin.applyTransform(t);
    // 
    // Creation of transforms is illusted in other examples. 

    //////////////////////////////////////////////////////////////
    //
    // To execute commands, the SimpleController provides the method command.
    // 
    //   plugin.command(command, params);
    // 
    // To find examples of commands, please see the Commands example.

    //////////////////////////////////////////////////////////////
    //
    // To subscribe for events, the SimpleController provides the method subscribe.
    // 
    //   plugin.subscribe(event, callback);
    // 
    // To find examples of events, please see the Commands example as well.
    // It shows how to subscribe interaction events, where available events are located, etc.
}
