Changelog
=========

This a global changelog that outlines overal changes in LiteMol. 
Each component also has its separate changelog 
([Core](src/Core/CHANGELOG.md), [Visualization](src/Visualization/CHANGELOG.md), [Bootstrap](src/Bootstrap/CHANGELOG.md), [Plugin](src/Plugin/CHANGELOG.md), [Viewer](src/Viewer/CHANGELOG.md)).

Breaking changes are discussed in a [separate document](BREAKING-CHANGES.md).

Dec 18 2016
-----------

Breaking changes.

* Rewrote ``Computation`` and ``Task`` API.
* Use ``async/await`` if favor of callbacks almost everywhere.
* Performance improvements especially for "small" computations gained
  by removing constant overhead each computation had before. 
  This was achieved mostly by doing progress reporting on
  a "delta-time" basis rather than on "chunk-size" basis.