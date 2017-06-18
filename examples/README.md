Examples
========

  - `SimpleController` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/SimpleController) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/SimpleController) ] - Shows a simple way to create and instance of the plugin and load a molecule.
  - `Commands` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/Commands) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/Commands) ] - Shows how to control the plugin programmatically, how to consume plugin interactions, focus on certain elements in a molecule, etc.
  - `CustomControls` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/CustomControls) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/CustomControls) ] - Shows how to construct a custom control scheme for the plugin.
  - `CustomDensity` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/CustomDensity) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/CustomDensity) ] - Shows how to download a molecule, parse it, download full 2Fo-Fc density data or enable density streaming, and allow user interaction with them.
  - `SplitSurface` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/SplitSurface) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/SplitSurface) ] - Shows how to create two complementary selections and display a surface for each of them.
  - `BinaryCIFInspect` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/BinaryCIFInspect) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/BinaryCIFInspect) ] - A simple app that enables a comparison of data inside CIF and BinaryCIF. Also shows how to use the LiteMol.Core code directly without including/instancing the plugin.
  - `Transforms` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/Transforms) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/Transforms) ] - This is a more complicated example that shows how to download multiple structures, apply a superposition algorithm, transform using a 4x4 matrix, and visualize them.
  - `Channels` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/Channels) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/Channels) ] - An advanced examples that shows the results produced by the command line version of [MOLE](https://webchem.ncbr.muni.cz/Platform/App/Mole). It shows how to create custom visuals from JSON data and make them interactive, and how to enable interaction from outside the plugin.
  - `AngularExample` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/AngularExample) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/AngularExample) ] - Shows how to wrap the LiteMol plugin in Angular Directive. Thanks to @mjamroz for contributing the basis for the example.
  - `PrimitivesAndLabels` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/PrimitivesAndLabels) | [view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/PrimitivesAndLabels) ] - And advanced example that shows to create custom sphere and tube
  geometries that represent a "binding site", add labels, and custom highlight interaction.
  - `BasicNode` [ [source](https://github.com/dsehnal/LiteMol/tree/master/examples/BasicNode) ] - A basic example that shows how to use LiteMol Core in NodeJS.

To run the examples locally, build LiteMol using the ``gulp`` command and 
simply open the corresponding ``index.html`` from the ``build/web/Examples`` directory in your
favourite web browser (this is because the paths to the LiteMol CSS and JS are set up so that they can be shared
when deplyed to the web).  

Alternatively, from the LiteMol root directory use 

```
npm install -g http-server
cd build/web
http-server
```

Then the examples will be accessible from ``http://localhost:8080/Examples/example_name/``.

### Modifying Examples

To play with just a single example without having to rebuild the entire project, change the paths to `LiteMol-plugin.js` and CSS in the corresponding ``index.html`` file from

```HTML
<link rel="stylesheet" href="../../assets/css/LiteMol-plugin.css?lmversion=10" type="text/css" />
<script src="../../assets/js/LiteMol-plugin.js?lmversion=10"></script>
```

to

```HTML
<link rel="stylesheet" href="../../dist/css/LiteMol-plugin.css?lmversion=10" type="text/css" />
<script src="../../dist/js/LiteMol-plugin.js?lmversion=10"></script>
```

This is needed because the paths are set up so that they work when the examples are accessed from the ``web`` folder.

Afterwards, you can recompile just the single example from a command line using the ``tsc`` command, provided you have the correct version of [TypeScript](https://www.typescriptlang.org/)
installed (for the version needed, please check the ``package.json`` in the root directory of LiteMol and look for ``"typescript"``). For example

```
cd examples/Channels
tsc
```

Finally, just open ``index.html`` in a browser or run the ``http-server`` in the example directory as shown above.

Individual examples can also be built from the root directory using the command 

```
gulp Example-"name of example"
```

For example ``gulp Example-Channels``.

