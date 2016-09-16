
[![License](http://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat)](https://github.com/dsehnal/LiteMol/blob/master/LICENSE)

What is LiteMol
========

LiteMol is a library/plugin for handling 3D structural molecular data (not only) in the browser.
It is written in [TypeScript](http://www.typescriptlang.org/) (and compiled to JavaScript). LiteMol 
features include, but are not limited to, displaying 3D coordinates of molecules and density maps.

You can see LiteMol in action [here](http://webchemdev.ncbr.muni.cz/Litemol/).

The program is being developed by David Sehnal from the CEITEC/Masaryk University in Brno, Czech Republic
in collaboration (espectially with Mandar Deshpande) with PDBe in Hinxton, Cambridge, UK.

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
Several examples of usage are also provided. It is recommended to use [TypeScript](http://www.typescriptlang.org/) for building apps based 
on LiteMol (or any other non-trivial JavaScript app for that matter), because you will get code completion and type checking.

If you are interested in using LiteMol for simple visualization and do not need any special functionality, we suggest that you use the [PDB Component Library](http://www.ebi.ac.uk/pdbe/pdb-component-library/doc.html#a_LiteMol).

For feature overview and usage of the app please refer to our [wiki](http://webchem.ncbr.muni.cz/Wiki/LiteMol:UserManual).

Project Structure Overview
========

The code is structured into several parts:

  - `LiteMol.Core` - parsing, basic data representation
  - `LiteMol.Visualization` - wrapper around WebGL + geometry
  - `LiteMol.Bootstrap` - higher level wrapper around Core and Visualization
  - `LiteMol.Plugin` - React based UI
  - `LiteMol.Viewer` - Host for plugin + example usage of the plugin
  
Examples
--------

Examples are located in the folder `LiteMol.Viewer/Examples`.

  - `Commands` ([view live](http://webchemdev.ncbr.muni.cz/Litemol/Examples/Commands)) - Shows how to control the plugin programmatically, how to consume plugin interactions, focus on certain elements in a molecule, etc.
  - `CustomControls` ([view live](http://webchemdev.ncbr.muni.cz/Litemol/Examples/CustomControls)) - Shows how to construct a custom control scheme for the plugin.
  - `CustomDensity` ([view live](http://webchemdev.ncbr.muni.cz/Litemol/Examples/CustomDensity)) - Shows how to download a PDB file, parse it, download density data and allow user interaction with them.
  - `SplitSurface` ([view live](http://webchemdev.ncbr.muni.cz/Litemol/Examples/SplitSurface)) - Shows how to create two complementary selections and display a surface for each of them.
  - `BinaryCIFInspect` ([view live](http://webchemdev.ncbr.muni.cz/Litemol/Examples/BinaryCIFInspect)) - A simple app that enables a comparison of data inside CIF and BinaryCIF. Also shows how to use the LiteMol.Core code directly without including/instancing the plugin.

Building
========

Install Node.js (tested on version 6.4.0).

LiteMol is written in TypeScript and needs to be compiled to JavaScript before use. To build it, use

    npm install -g gulp
    npm install -g typescript
    npm install
    gulp

Any subsequent full LiteMol builds can be done using the command 

    gulp
        
To build the minified version of the plugin and stylesheets, use 

    gulp Plugin
    gulp Viewer-min
        
This will create the files `LiteMol.Viewer/LiteMol-plugin.min.js` file and `LiteMol.Viewer/assets/css/LiteMol-plugin.min.css` will then be minified.

To build only the Viewer and included examples in `LiteMol.Viewer` when experimenting with the examples, you can use 

    gulp Viewer

When embedding the pluing in your pages, do not forget to include the `LiteMol.Viewer/assets` folder with 
there required style sheets and fonts.

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

You can include the plugin as shown in the `LiteMol.Viewer` folder.
For more advanced use cases, please refer to `LiteMol.Viewer/Examples`.

Alternatively, you can use the Angular LiteMol wrapper from the [PDB Component Library](http://www.ebi.ac.uk/pdbe/pdb-component-library/doc.html#a_LiteMol).

What external dependencies do I need to include LiteMol?
------------

LiteMol does not require any external dependencies.

Can I contribute to LiteMol?
------------

Please refer to the Contributing section of this file.

How do I subscribe to the mailing list?
------------

[Here](https://listserver.ebi.ac.uk/mailman/listinfo/litemol). 