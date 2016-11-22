# 1.2.0
* Change how visual interactivity works.
* BREAKING CHANGE: Command.Molecule.CreateSelectInteraction now takes the parameters { entity, query } instead of { visual, query }.

# 1.1.8
* Added the ability to decompress Gzip from binary ajax response.
* Support for specifying absolute iso values for density data. (BREAKING CHANGE: Instead of isoSigma, isoValue and isoValueType properties are now used).

# 1.1.7
* Fixed molecule highlight info to show authAsymId instead of asymId for highlighted residues.  

# 1.1.6
* Added Data.FromData transformer.

# 1.1.5
* Bugfix in CreateSelectInteraction command.

# 1.1.4
* Added rainbow coloring.
* Coordinate Streaming now uses BinaryCIF.

# 1.1.3
* Updated to match Core version 2.4.
* Entity.Transformer.Molecule.CreateFromString => Entity.Transformer.Molecule.CreateFromData
* Entity.Transformer.Density.ParseBinary => Entity.Transformer.Density.ParseString

# 1.1.2
* Fixed a bug where updating molecule visual coloring led to mutating the default theme.

# 1.1.1
* Fix in selecting the next entity when the current one is removed.

# 1.1.0
* Added more parsing transforms for molecules (CreateFromString) and density (CreateFromBinary)
* Renamed Entity.Transformer.Molecule.CreateFromCif to Entity.Transformer.Molecule.CreateFromMmCif
* Updated Entity.Transformer.Molecule.downloadMoleculeSource to support multiple formats.
* Updated Entity.Transformer.Molecule.OpenCifMoleculeFromFile to Entity.Transformer.Molecule.OpenMoleculeFromFile and added support for multiple file formats.
* LiteMol.Bootstrap.Entity.Transformer.Density.ParseCcp4 and LiteMol.Bootstrap.Entity.Transformer.Density.ParseBrix merged into LiteMol.Bootstrap.Entity.Transformer.Density.ParseBinary

# 1.0.12
* Fixes to Plugin fullscreen mode when body max dimensions were altered.

# 1.0.11
* SetVisibility command now checks for undefined entity.

# 1.0.10
* "Fixed" Int32Array.forEach because IE and Safari do not support it. 

# 1.0.9
* Added interfaces for plugin definition.

# 1.0.8
* Added "UnselectElementOnRepeatedClick" behaviour.
* Added Molecule.CreateSelection transform handler to analytics.

# 1.0.7
* Fixed document scrolling issue when toggling expanded mode.

# 1.0.6
* Added support for "custom" updaters.

# 1.0.5
* Tweak to AJAX get.

# 1.0.4
* Support for wireframe surfaces.

# 1.0.3
* Updated controller for visual transforms to preserve old theme when type is changed.
* Updated AJAX utils to property reject "non-OK" responses. 

# 1.0.2
* Updated formatting of atom highlights with non-1 occupancy and altLoc present.

# 1.0.1
* Updated "Visualiztion.ResetThemes" command to ResetTheme and added optinal selection.

# 1.0.0
* Initial.