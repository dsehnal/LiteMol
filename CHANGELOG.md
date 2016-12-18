Changelog
=========

This a global changelog that outlines overal changes in LiteMol. 
Each component also has its separate changelog 
([Core](src/Core/CHANGELOG.md), [Visualization](src/Visualization/CHANGELOG.md), [Bootstrap](src/Bootstrap/CHANGELOG.md), [Plugin](src/Plugin/CHANGELOG.md), [Viewer](src/Viewer/CHANGELOG.md)).

Dec 18 2016
-----------

Breaking changes discussed in [#12](https://github.com/dsehnal/LiteMol/issues/12).

* Rewrote ``Computation`` and ``Task`` API.
* Use ``async/await`` if favor of callbacks almost everywhere.
* Performance improvements especially for "small" computations gained
  by removing constant overhead each computation had before. 
  This was achieved mostly by doing progress reporting on
  a "delta-time" basis rather than on "chunk-size" basis.