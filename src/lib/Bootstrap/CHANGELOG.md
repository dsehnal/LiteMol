# 1.4.4
* Fixed a bug in Balls and Sticks atom scaling.

# 1.4.3
* Remember the camera position when updating visuals with the same parent.

# 1.4.2
* Updated selection behaviour.

# 1.4.1
* Fixed a bug in creating nested selections.
* Autoamtic mol. surface density is now based on volume rather than count.

# 1.4.0
* Added support for labels.

# 1.3.6
* Fixed rainbow color theme to work correctly on out-of-order chains and entities.

# 1.3.5
* Sticky custom theme support.

# 1.3.4
* Updated to reflect density data model changes.

# 1.3.3
* Better controls for UI layout regions.

# 1.3.2
* Automatic density for molecular surfaces.
* Automatic maximum detail level for balls and sticks and cartoons for small molecules.
* Applying laplacian smoothing to density surfaces now uses weighting to better preserve "small density blobs".

# 1.3.1
* Where appropriate, use Core.Utils.FastMap/Set instead of ES6 versions.

# 1.3.0
* Breaking: Updated Task to be backed by a computation rather than a Promise.
  - Tasks are not created by providing a computation object or a Promise and their context object 
    is the same as as the uderlaying Computation's one.
* Tree.Transform function are now implemented using Computation rather than a Task.
* Removed 'Child' task type.
* Opening a compressed text file now uses UTF8 encoding.

# 1.2.13
* Visual.Style.computationType is now taskType. 

# 1.2.12
* Visual.Style.computeOnBackground is now computationType: 'Normal' | 'Silent' | 'Background'.
* Added Density.CreateFromData transform.
* Updated how DensityVisual controller works to be able to edit more than one style at once.

# 1.2.11
* Added CIF density parse transform.

# 1.2.8
* Fixed a bug in Action/Updater controller then the controlled entity was removed. 

# 1.2.7
* Fixed Transform UI state issue.

# 1.2.6
* Updated Transformer.action to provide option "onError" message and support actions returned as a promise.
* Updated Tree.Selection.byRef/byValue to accept multiple arguments. 
* Added Transform.actionWithContext.
* Added Entity.Transformer.Basic.Fail.
* Support for title in Data.Download transform.

# 1.2.5
* Density behavior updates.

# 1.2.4
* Added Entity.Visual.Surface entity.
* Updated FocusCameraOnSelect behavior to handle non-molecule objects as well.

# 1.2.3
* Specify min and maxRadius for density behavior. 

# 1.2.2
* Added support for popup messages (toasts).
* Added the option to disable fog on per visual basis.
* Fog no longer affects selected residue, ambience, and dynamic density data.
* Ability to better control layout regions.
* Persistent state for transformer controllers.

# 1.2.1
* Transform builder no longer requires verbose type annotations that were sometimes required.

# 1.2.0
* Changed how visual interactivity works.
* Modified how ShowInteractionOnSelect behavior works (clicking an ambient residue now moves the selection).
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