
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat)](https://github.com/dsehnal/LiteMol/blob/master/LICENSE)

![Logo](web/assets/img/lm_logo_small.png)

What is LiteMol
===============

LiteMol is a library/plugin for handling 3D structural molecular data (not only) in the browser.
It is written in [TypeScript](https://www.typescriptlang.org/) (and compiled to JavaScript). LiteMol 
features include, but are not limited to, displaying 3D coordinates of molecules and density maps.

You can see LiteMol in action [here](https://webchemdev.ncbr.muni.cz/LiteMol/).

The program is being developed by David Sehnal from the CEITEC/Masaryk University in Brno, Czech Republic
in collaboration (especially with Mandar Deshpande) with PDBe in Hinxton, Cambridge, UK.

Table of contents
=================

* [Getting Started](#getting-started)
* [Project Structure Overview](#project-structure-overview)
* [Building](#building)
* [License](#license)
* [Support](#Support)
* [Contributing](#Contributing)
* [Roadmap](#roadmap)
* [FAQ](#faq)

Getting Started
========

This repository provides the source code for the LiteMol molecular visualizer. 
Several examples of usage are also provided. It is recommended to use [TypeScript](https://www.typescriptlang.org/) for building apps based 
on LiteMol (or any other non-trivial JavaScript app for that matter), because you will get code completion and type checking.

If you are interested in using LiteMol for simple visualization and do not need any special functionality, we suggest that you use the [PDB Component Library](https://www.ebi.ac.uk/pdbe/pdb-component-library/doc.html#a_LiteMol).

An initial walkthrough for how to go about including LiteMol in your web pages can be found in the [FAQ section](#what-are-the-simplest-steps-to-load-a-molecule-in-litemol) and in the [SimpleController](examples/SimpleController) example.

A list of steps for integrating LiteMol is available [here](docs/integrating.md). For basic information about extending LiteMol see the [extending](docs/extending.md) document.

For feature overview and usage of the ``Viewer`` app please refer to our [wiki](https://webchem.ncbr.muni.cz/Wiki/LiteMol:UserManual).

Project Structure Overview
========

The code is structured into several parts:

  - `Core` - parsing, basic data representation
  - `Visualization` - wrapper around WebGL + geometry
  - `Bootstrap` - higher level wrapper around Core and Visualization
  - `Plugin` - React based UI
  - `Viewer` - Host for plugin + example usage of the plugin
  
Examples
--------

Examples are located in the folder `examples`.

  - `SimpleController` ([view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/SimpleController)) - Shows a simple way to create and instance of the plugin and load a molecule.
  - `Commands` ([view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/Commands)) - Shows how to control the plugin programmatically, how to consume plugin interactions, focus on certain elements in a molecule, etc.
  - `CustomControls` ([view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/CustomControls)) - Shows how to construct a custom control scheme for the plugin.
  - `CustomDensity` ([view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/CustomDensity)) - Shows how to download a PDB file, parse it, download density data and allow user interaction with them.
  - `SplitSurface` ([view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/SplitSurface)) - Shows how to create two complementary selections and display a surface for each of them.
  - `BinaryCIFInspect` ([view live](https://webchemdev.ncbr.muni.cz/LiteMol/Examples/BinaryCIFInspect)) - A simple app that enables a comparison of data inside CIF and BinaryCIF. Also shows how to use the LiteMol.Core code directly without including/instancing the plugin.

Building
========

Install Node.js (tested on version 6.4.0).

LiteMol is written in TypeScript and needs to be compiled to JavaScript before use. To build it, use

    npm install -g gulp
    npm install
    gulp

Any subsequent full LiteMol builds can be done using just the command 

    gulp
        
To build the minified version of the plugin and the stylesheets, use 

    gulp
    gulp Dist-min
        
This will create the files `dist/LiteMol-*.min.js` and `dist/css/LiteMol-plugin*.min.css`.

When embedding the plugin in your pages, do not forget to include the `dist/css` and `dist/fonts` folders with 
the required style sheets and fonts.

License
=======

This project is licensed under the Apache 2.0 license. See the `LICENSE` file for more info.

Support
=======

If you have any questions, do not hesitate to email the author, use the GitHub forum, 
or the LiteMol [mailing list](https://listserver.ebi.ac.uk/mailman/listinfo/litemol).

Contributing
=======

We would like to know about your use cases of the program, bug reports, and feature requests.

Our plan is to make a stable LiteMol Core Library (this repository) and allow users to contribute 
by writing extensions handling their specific use cases of the application. The extension support is currently under development (see the Roadmap below).

Roadmap
=======

LiteMol is still in active development. All things in this section are a subject to change (especially based on user feedback). 
Currently, our priority is to improve these things:

* Creating documentation and adding more usage examples.
* Fixing bugs in the code.

Short term goals 
---------

These features are planned to be introduced during the first half of 2017. 

**Core features**
* Improving extension support: 
  * Streamline the process of extension creation.
  * Support for dynamic extension loading.
* Support for saving and restoring the state of the application.
* More visual primitives (spheres, cylinders, arrows, etc.)
* Support for labels in the 3D scene.  
* Improved internal data representation of molecules.
* Secondary structure detection.
* Restructure the code and update the build process to support NPM.

Long term goals
----------

These features are on our TODO list. Feature requests from users are always welcome.

**Core features**
* Visualization of molecular dynamics.
* Animation support:
    * Animating camera.
    * Animating individual parts of the scene.
* Support for additional input formats (e.g. MOL2, but mostly driven by user demand).

**Non-core features**
* Additional display modes. 
* Basic support for PyMOL-like scripting.
* Collaborative features:
    * Annotation.
    * Sharing of a single app session between multiple users.  

FAQ
=======

How do I include LiteMol in my page?
------------

You can include the plugin as shown in the `src/Viewer` folder. For a simple use case,
please check the `SimpleController` examples. For further examples, please refer to `examples` directory.

Alternatively, you can use the Angular LiteMol wrapper from the [PDB Component Library](https://www.ebi.ac.uk/pdbe/pdb-component-library/doc.html#a_LiteMol).


What are the simplest steps to load a molecule in LiteMol?
------------

- Start by downloading the code:

      git clone https://github.com/dsehnal/LiteMol.git

- From ``dist`` folder, copy the folders ``css``, ``fonts``, and
the file ``LiteMol-plugin.js``.

- Include the CSS and JavaScript in your page:

    ```html
    <link rel="stylesheet" href="css/LiteMol-plugin.css" type="text/css" />
    <script src="js/LiteMol-plugin.js"></script>
    ``` 

- Create a target for the plugin:

    ```html
    <div id="litemol" style="width: 640px; height: 480px; margin-top: 200px"></div>
    ```

- Create the plugin instance and load a molecule:

    ```JavaScript
    var plugin = Plugin.create({ target: '#litemol' });
    plugin.loadMolecule({
        id: '1tqn',
        url: `https://www.ebi.ac.uk/pdbe/static/entry/1tqn_updated.cif`,
    });
    ```

Please check the [SimpleController example](examples/SimpleController) for more information.

What external dependencies do I need to include LiteMol?
------------

LiteMol does not require any external dependencies.


How do I change the color scheme of the plugin?
------------

LiteMol is available with 3 colors schemes: Dark (default), Light, and Blue. The palette can be changed by including a different css file from the `dist/css` folder. 

If this is not enough for your needs, you can easily customize the color palette. Add your palette to `src/Plugin/Skin/colors` using an existing palette as a template and 
create new `src/Plugin/Skin/LiteMol-plugin-MYTHEME.scss` that refences your new colors. Edit the function `CSS` in `gulpfile.js` to include the `-MYTHEME` affix and rebuild
LiteMol. Your theme will then appear in `dist/css`.     

Can I contribute to LiteMol?
------------

Please refer to the Contributing section of this file.

How do I subscribe to the mailing list?
------------

[Here](https://listserver.ebi.ac.uk/mailman/listinfo/litemol). 
