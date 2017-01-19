Changelog
=========

This a global changelog that outlines overal changes in LiteMol. 
Each component also has its separate changelog 
([Core](src/Core/CHANGELOG.md), [Visualization](src/Visualization/CHANGELOG.md), [Bootstrap](src/Bootstrap/CHANGELOG.md), [Plugin](src/Plugin/CHANGELOG.md), [Viewer](src/Viewer/CHANGELOG.md)).


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