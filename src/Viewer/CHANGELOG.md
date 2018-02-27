# 1.6.5
* Added optional "direction cones" to cartoons visualization.

# 1.6.5
* Added BGSU RNA Loop Annotation.

# 1.6.4
* Updated/fixed carbohydrate selection behaviour.

# 1.6.3
* Fixed screenshot support.

# 1.6.2
* Increased camera rotation speed.

# 1.6.1
* Added "particle coloring" extension.

# 1.6.0
* Better show interactions between different components of a molecule.
* Better default representation of molecules.
* Added 3D SNFG carbohydrate representation.

# 1.5.1
* Support for _struct_conn mmCIF category.
* Show metallic bonds in balls and sticks models.

# 1.5.0
* Support for labels.
* Default theme changed to light.

# 1.4.4
* Updated DensityServer mapping.

# 1.4.3
* Updated PDBe Validation Report support to the latest version of the API.

# 1.4.2
* Simplified downloading/opening molecule data.
* PDBe Validation Reports are no longer applied to HET residues.

# 1.4.1
* BinaryCIF is now the default format.

# 1.4.0
* Updated Density Streaming to work with the new DensityServer.
* Added examples.

# 1.3.2
* Fixed Density Streaming to work on multiple structures at the same time.

# 1.3.1
* Automatic detail for molecular surfaces => improved performance for large molecules.
* Higher automatic detail for small molecules.

# 1.3.0
* Updated for "LiteMol 2". 

# 1.2.1
* Performance updates thanks to rewrite of the Computation/Task API.

# 1.2.0
* Support for density streaming vie DensityServer. 

# 1.1.14
* Support for PDBe EMDB density data.

# 1.1.13
* It is now possible to select 'Show: Everything' in the dynamic denisty surface behaviour.
* Fixed/improved support for CA/P-only models.

# 1.1.12
* Help for viewport.
* Touch slabbing.
* Mouse wheel now works similar to PyMOL.
* Basic ValidatorDB support.

# 1.1.11
* Added support for popup messages (toasts).
* Fog no longer affects selected residue, ambience, and dynamic density data.
* Expandable transform controls no longer collapse when a value changes. 

# 1.1.10
* Changed how visual interactivity works.
  - Repeatedly clicking on any element clears the selection.
  - Clicking on dynamically created "ambient" residues now shifts the selection.

# 1.1.9
* Ability to manually decompress binary AJAX responses.
* Support for specifying absolute iso values for density data.

# 1.1.8
* Added secondary structure (helices and sheets) approximation for cartoons visualization if not present in the input file.
* Fixed molecule highlight info to show authAsymId instead of asymId for highlighted residues.

# 1.1.7
* Support for ?loadFromURL=url and loadFromURLFormat=format query params,

# 1.1.6
* Support for ?loadFromPDB=ID URL query to enable loading of default structures.

# 1.1.5
* Improved color picker.

# 1.1.4
* Fixed bond display between atoms that have no altLoc specified and these that do.

# 1.1.3
* Added rainbow coloring for molecules.
* Coordinate Streaming now uses BinaryCIF.

# 1.1.2
* Added support for BinaryCIF.

# 1.1.1
* Added basic SDF support.
* Improved the behaviour of selecting the next node when the current one is removed.

# 1.1.0
* This version is the result of refactoring the "format" support in the Core to better support different formats in the future.
* To support these features, refactored parsing of molecular and desnity data.
  - This introduces a few breaking changes. 
  - Most of these changes happen in the Plugin Spec. 
  - Outside of the spec, the most notable change change is renaming Bootstrap.Entity.Transformer.Molecule.CreateFromCif to Bootstrap.Entity.Transformer.Molecule.CreateFromMmCif and Bootstrap.Entity.Transformer.Density.ParseCcp4 to Bootstrap.Entity.Transformer.Density.ParseBinary.
  - Refer to changelogs for Core, Bootstrap, and Plugin for more details.
* Added the ability to download/open/parse old PDB files.

# 1.0.14
* Added query flatten and function Fragment.find(query). (for example residuesByName('ALA').flatten(f => f.find(atomsByElement('C')))).

# 1.0.13
* Added xs.intersectWith(ys) query.
* Fixed and issue with ambientResidues/Atoms query when used inside "inside" query.
* Fixed transparent objects incorrectly being made interactive when updating visibility.
* Fixed a mouse-scrolling issue that would scroll the entire page is scrolled on top of the plugin.

# 1.0.12
* Updated some internals (the way "collapsed" transforms are handled).

# 1.0.11
* Added behaviour to unselect elements on repeated click.
* Added new queries: atomsByElement, atomsByName, atomsById, residuesByName, residuesById, chainsById.

# 1.0.10
* Added BRIX density data support.

# 1.0.9
* Fixed mouse issues related to scrollbar position.
* Toggling expand no longer resets scrollbar position to 0.

# 1.0.8
* Screenshot support.

# 1.0.7
* Fix to overlapping secondary structure elements.

# 1.0.6
* Added support for wireframe models of all surfaces.
* Camera zoom reversed (moving mouse down brings the structure closer).

# 1.0.5
* Fix for visibility state not updating in Chrome.
* Fix for strange behaviour of themes when updating visuals.
* Fix of assembly generation.
* Better handling of AJAX errors.
* Fixed slider issues in chrome.
* Align label of the header in the "transform panel" to the center + added bottom border.

# 1.0.4
* Fixes in assembly/symmetry generation.
* Tweaks in atom highlight label.
* Added atom count to molecule model nodes.

# 1.0.3
* Added support for sequence annotations.

# 1.0.2
* Added support for validation coloring.

# 1.0.1
* Fix for non-displaying C-alpha only molecules.

# 1.0.0
* Initial release.