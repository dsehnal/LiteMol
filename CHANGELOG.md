Changelog
=========

This a global changelog that outlines overal changes in LiteMol. 
Each component also has its separate changelog 
([Core](src/lib/Core/CHANGELOG.md), [Visualization](src/lib/Visualization/CHANGELOG.md), [Bootstrap](src/lib/Bootstrap/CHANGELOG.md), [Plugin](src/lib/Plugin/CHANGELOG.md), [Viewer](src/Viewer/CHANGELOG.md)).

2.4.1
-----------

* Fixed screenshot support (Chrome changed behaviour of data URIs).

2.4.0-preview
-----------

* Better show interactions between different components of a molecule.
* Better default representation of molecules.
* Added 3D SNFG carbohydrate representation.
* Added "particle coloring" that colors atoms based on the distance to the centroid of the molecule.

2.3.1-preview
-----------

* Support for _struct_conn mmCIF category.
* Better bond computation based on distances.
* Show metallic bond in balls and sticks models.
* Added dashed lines to cartoon models to indicated gaps in sequence.

2.3.0-preview
-----------

* Added support for labels in 3D scene.
* Added more 3D primitives.
* Removed "Object 3D vectors" in favor of array based vectors. (Should only break user code that uses 3D primitives)

2.2.1-preview
-----------

* Added support for "sticky" custom themes. See Commands example's CustomTheme for example usage.

2.2.0-preview
-----------

* Added support to the latest version of the DensityServer that supports downsampling. As a result, surfaces for the entire structures can be visualised almost instantly.

2.1.0-preview
-----------

* Updated the density data model.
* Removed the support for the DSN6 density data format.
* Fixed a bug in marching cubes algorithm.
* Fixed a bug in surface element picking.

2.0.2-preview
-----------

* Added the ability to make the layout regions always shown ("sticky"). This is a breaking change if you were using the 'hiddenRegions'
property of the layout state.

2.0.1-preview
-----------

* Improved low resolution molecular surfaces.
* Determines automatic detail level for molecular surfaces. This means that it is MUCH quicker to display a surface for large structures. For example showing surface for PDB 3j3q (2.44M atoms) is now <2s vs ~16s.
* Automatic detail for small molecules is higher.
* Applying laplacian smoothing to density surfaces now uses weighting to better preserve "small density blobs".

2.0.0-preview
-----------

LiteMol 2 will gradually introduce new features and performance improvements. Some of the changes will be breaking. The changes are outlined in the [migration docs](docs/migrating/1-to-2.md).

* Updated data representation of molecules to enable a more straightforward data sharing between different models. This is the first step towards efficient implementation for molecular dynamics and "low overhead" symmetry and assemblies. Breaking change and subject to change, but should not affect user level code much if at all.
* Using custom implementation of Map/Set instead of ES6 versions where appropriate. This improves the performace by up to ~30% when parsing/visualizing large structures.
* Simplified entity type declaration in TypeScript.

1.0.0
-----------

* Introduced "global version".

Dec 21 2016
-----------

* Bugfixes/improvements of interactivity/highlighting of molecular surfaces.

Dec 18 2016
-----------

Breaking changes discussed in [#12](https://github.com/dsehnal/LiteMol/issues/12).

* Rewrote ``Computation`` and ``Task`` API.
* Use ``async/await`` if favor of callbacks almost everywhere.
* Performance improvements especially for "small" computations gained
  by removing constant overhead each computation had before. 
  This was achieved mostly by doing progress reporting on
  a "delta-time" basis rather than on "chunk-size" basis.