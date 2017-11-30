
[![Version](https://img.shields.io/badge/Version-2.4.1-blue.svg?style=flat)](CHANGELOG.md)
[![Latest Release](https://img.shields.io/badge/Latest%20Release-2-blue.svg?style=flat)](https://github.com/dsehnal/LiteMol/releases/tag/v2)
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

Read more about LiteMol in [Nature Methods](https://rdcu.be/z0Hf).

Table of Contents
=================

* [Getting Started](#getting-started)
* [Project Structure Overview](#project-structure-overview)
* [Building](#building)
* [License](#license)
* [Support](#support)
* [Contributing](#contributing)
* [Releases and Roadmap](#releases-and-roadmap)
* [Citing](#citing)
* [FAQ](#faq)

Getting Started
========

This repository provides the source code for the LiteMol molecular visualizer. 
Several examples of usage are also provided. It is recommended to use [TypeScript](https://www.typescriptlang.org/) for building apps based 
on LiteMol (or any other non-trivial JavaScript app for that matter), because you will get code completion and type checking.

- An initial walkthrough for how to go about including LiteMol in your web pages can be found in the [FAQ section](#what-are-the-simplest-steps-to-load-a-molecule-in-litemol) and in the [SimpleController](examples/SimpleController) example.
- Auto-generated source code documentation is available [here](https://webchemdev.ncbr.muni.cz/LiteMol/SourceDocs/).
- If you are interested in using LiteMol for simple visualization and do not need any special functionality, you can use the [PDB Component Library](https://www.ebi.ac.uk/pdbe/pdb-component-library/doc.html#a_LiteMol) that provides an Angular wrapper for LiteMol.
- A walkthrough for integrating LiteMol is available [here](docs/integrating.md). 
- For basic information about extending LiteMol see the [extending](docs/extending.md) document.
- For feature overview and usage of the ``Viewer`` app please refer to our [wiki](https://webchem.ncbr.muni.cz/Wiki/LiteMol:UserManual).

Project Structure Overview
========

The LiteMol library code is structured into four modules:

  - `Core` - parsing, basic data representation
  - `Visualization` - wrapper around WebGL + geometry
  - `Bootstrap` - higher level wrapper around Core and Visualization
  - `Plugin` - React based UI

Auto-generated source code documentation is available [here](https://webchemdev.ncbr.muni.cz/LiteMol/SourceDocs/).

Additionally, the [LiteMol Viewer](https://webchemdev.ncbr.muni.cz/LiteMol/Viewer/) application is available:

  - `Viewer` - Host for plugin, integration with the PDBe services (electron density, validation, etc.) and CoordinateServer

  
Examples
--------

See the [Examples folder](examples).

Building
========

Install Node.js (tested on version 8).

LiteMol is written in TypeScript and needs to be compiled to JavaScript before use. To build it, use

    npm install -g gulp
    npm install
    gulp

On Windows, it might be required to install the package `windows-build-tools` before the `npm intall` command:

    npm install windows-build-tools -g

Any subsequent full LiteMol builds can be done using just the command 

    gulp
        
To build the minified version of the plugin and the stylesheets, use 

    gulp
    gulp Dist-min
        
This will create the files `dist/js/LiteMol-*.min.js` and `dist/css/LiteMol-plugin*.min.css`.

When embedding the plugin in your pages, do not forget to include the `dist/css` and `dist/fonts` folders with 
the required style sheets and fonts.

### Modifying Examples

Go to the [Examples folder](examples) to learn how to modify individual examples.

License
=======

This project is licensed under the Apache 2.0 license. See the `LICENSE` file for more info.

Support
=======

If you have any questions or feature requests, do not hesitate to email the author, use the GitHub forum, 
or the LiteMol [mailing list](https://listserver.ebi.ac.uk/mailman/listinfo/litemol).

Makes sure to check out the [documentation](docs) and [examples](examples).

Contributing
=======

We would like to know about your use cases of the program, bug reports, and feature requests.

Our plan is to make a stable LiteMol Core Library (this repository) and allow users to contribute 
by writing extensions handling their specific use cases of the application. The extension support is currently under development (see the Roadmap below).

Releases and Roadmap
=======

LiteMol is still in active development. All things in this section are a subject to change (especially based on user feedback). 
Currently, our priority is to improve these things:

* Creating documentation and adding more usage examples.
* Fixing bugs in the code.

Releases
--------

The latest stable release of LiteMol is the [version 2](https://github.com/dsehnal/LiteMol/releases/tag/v2).

Migration summary can be found [here](docs/migrating/1-to-2.md).

Short term goals 
---------

These features are planned to be introduced in version 3:

**Core features**
* Improving extension support: 
  * Streamline the process of extension creation.
  * Support for dynamic extension loading.
* Support for saving and restoring the state of the application.
* Improved internal data representation of molecules.

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

Citing
======

Sehnal,D., Deshpande,M., Vařeková,R.S., Mir,S., Berka,K., Midlik,A., Pravda,L., Velankar,S. and Koča,J. (2017) LiteMol suite: interactive web-based visualization of large-scale macromolecular structure data. Nat. Methods, 14, 1121–1122, doi:10.1038/nmeth.4499.

[Full-text](https://rdcu.be/z0Hf)

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

    ```
    git clone https://github.com/dsehnal/LiteMol.git
    ```

    or [download it as ZIP](https://github.com/dsehnal/LiteMol/archive/master.zip). No building is required, only the `dist` folder in the archive is needed.

- From ``dist`` folder, copy the folders ``css``, ``fonts``, and
the file ``js/LiteMol-plugin.js`` (or ``js/LiteMol-plugin.min.js`` for production).

- Include the CSS and JavaScript in your page:

    ```html
    <link rel="stylesheet" href="css/LiteMol-plugin.css" type="text/css" />
    <script src="js/LiteMol-plugin.js"></script>
    ``` 

    You can include ``css/LiteMol-plugin-light.css`` or ``css/LiteMol-plugin-blue.css`` for different
    color schemes.

    For production, include ``LiteMol-plugin.min.js`` and ``css/LiteMol-plugin.min.css`` instead. 

- Create a target for the plugin:

    ```html
    <div id="litemol" style="width: 640px; height: 480px; margin-top: 200px; position: relative"></div>
    ```

- Create the plugin instance:

    ```JavaScript
    var plugin = LiteMol.Plugin.create({ target: '#litemol' });
    ```
    
- Load the molecule:

    ```JavaScript
    plugin.loadMolecule({
        id: '1tqn',
        url: 'https://www.ebi.ac.uk/pdbe/static/entry/1tqn_updated.cif',
        format: 'cif' // default
    });
    ```

    To load a file in the PDB format, use 

    ```JavaScript
    url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/pdb1tqn.ent',
    format: 'pdb'
    ```

    If you decide to use a different URL and it does not work, make sure that the server
    in question supports [cross-origin requests](https://en.wikipedia.org/wiki/Cross-Origin_Resource_Sharing).

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
