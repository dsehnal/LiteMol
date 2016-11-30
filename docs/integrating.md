Integrating LiteMol
===================

LiteMol is written in [TypeScript](https://www.typescriptlang.org/). While it is recommended to use TypeScript (and an 
editor that supports it such as [VS Code](https://code.visualstudio.com/)) because it provides
code completion and compile time type checking, LiteMol can also be used directly from JavaScript.

The best way to integrate LiteMol is probably to modify the ``Viewer`` app or one of the examples. 
This documents gives an overview of the required steps.

Overview
--------

To start using LiteMol, you need to:

* Get the source code:

    ```
    git clone https://github.com/dsehnal/LiteMol
    ```

    or [download it as ZIP](https://github.com/dsehnal/LiteMol/archive/master.zip).

* From the ``dist`` directory, get
  - ``dist/LiteMol-plugin.js`` (or ``dist/LiteMol-plugin.min.js`` for production)
  - ``dist/css/LiteMol-plugin.css`` (or ``dist/css/LiteMol-plugin.min.css``; here you can choose a color theme of your choosing or [create your own](#creating-custom-color-theme))
  - ``dist/fonts/*`` (this contains the icons used by LiteMol)

  The ``css`` and ``fonts`` folders must retain the their structure, i.e. keep the css file in ``css`` folder and the font files in the ``fonts`` folder at the same level.

* [Create a plugin instance](#creating-plugin-instance) in a file ``litemol.js``.

* Include LiteMol to your page

  ```HTML
  <link rel="stylesheet" href="css/LiteMol-plugin.css">
  <script src="js/LiteMol-plugin.js"></script>

  ...
  <div id="litemol" />
  ...
  <script src="js/litemol.js"></script>
  ```

Creating Plugin Instance
------------------------

To create an instance of the plugin, use the ``LiteMol.Plugin.create`` function:

```TypeScript
let plugin = LiteMol.Plugin.create({ 
    target: document.getElementById('litemol'),
    viewportBackground: '#ffffff',
    layoutState: { hideControls: true } // you can also include isExpanded: true
});
plugin.context.logger.message(`Hello LiteMol`);
```

To load a molecule at app startup, create a state *transform*:

```TypeScript
import Transformer = LiteMol.Bootstrap.Entity.Transformer

let id = '1cbs';
let action = plugin.createTransform();
    
action.add(plugin.root, Transformer.Data.Download, 
        { url: `https://www.ebi.ac.uk/pdbe/static/entry/${id}_updated.cif`, type: 'String', id })
    .then(Transformer.Data.ParseCif, { id }, { isBinding: true })
    .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 })
    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
    .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true, water: false });

plugin.applyTransform(action);
```

Customizing the Plugin Specification
------------------------------------

LiteMol Plugin can include a *specification* that specifies what components and functionality to use. 

For example, this is a reduced version of the spec used by the ``Viewer`` app:

```TypeScript
const PluginSpec: Plugin.Specification = {
    settings: {
        'molecule.model.defaultQuery': `residuesByName('GLY', 'ALA')`,
        'molecule.model.defaultAssemblyName': '1',
        // ...
    },
    transforms: [
        // Root transforms -- things that load data.
        { transformer: PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField },
        { transformer: PDBe.Data.DownloadDensity, view: Views.Transform.Data.WithIdField },
        { transformer: PDBe.Data.DownloadBinaryCIFFromCoordinateServer, view: Viewer.PDBe.Views.DownloadBinaryCIFFromCoordinateServerView, initiallyCollapsed: true },
        
        // Raw data transforms
        { transformer: Transformer.Molecule.CreateFromData, view: Views.Transform.Molecule.CreateFromData },
        { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
        
        // ...
    ],
    behaviours: [        
        Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
        Bootstrap.Behaviour.FocusCameraOnSelect,
        Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
        
        // this colors the visual when a selection is created on it.
        Bootstrap.Behaviour.ApplySelectionToVisual,
        
        // creates a visual when model is added.
        Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
        
        // ...
    ],            
    components: [
        Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               
        Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
        Plugin.Components.Transform.View(LayoutRegion.Right),
        // ...
    ],
    viewport: { view: Views.Visualization.Viewport, controlsView: Views.Visualization.ViewportControls },
    layoutView: Views.Layout, 
    tree: { region: LayoutRegion.Left, view: Views.Entity.Tree }
} 
```

To use a custom specification, create the plugin with the ``customSpecification`` option:

```TypeScript
let plugin = LiteMol.Plugin.create({ 
    customSpecification: PluginSpec, 
    ...
});
```

Minifying the Source Code and CSS
----------------------------------

If you don't have it, install [node.js](https://nodejs.org/en/). Then, from the root directory of LiteMol 

    npm install -g gulp
    npm install
    gulp
    gulp Dist-min
        
This will create the files `dist/LiteMol-*.min.js` and `dist/css/LiteMol-plugin*.min.css`.

Creating Custom Color Theme
---------------------------

LiteMol is available with 3 colors schemes: Dark (default), Light, and Blue. The palette can be changed by including a different css file from the `dist/css` folder. 

If this is not enough for your needs, you can easily customize the color palette. Add your palette to `src/Plugin/Skin/colors` using an existing palette as a template and 
create new `src/Plugin/Skin/LiteMol-plugin-MYTHEME.scss` that refences your new colors. Edit the function `CSS` in `gulpfile.js` to include the `-MYTHEME` affix and rebuild
LiteMol. Your theme will then appear in `dist/css`.  