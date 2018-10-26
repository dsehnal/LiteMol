# 1.7.8
* Relaxed condition for switching to "backbone only" mode.

# 1.7.7
* Added optional "direction cones" to cartoons.

# 1.7.6
* Swapped direction of the camera Z axis.
* DNA/RNA now render as "waves".

# 1.7.5
* Fixed secondary structure assigment for cartoon models.

# 1.7.4
* Updated selection behaviour.

# 1.7.3
* Fixed screenshot support.

# 1.7.2
* Ability to hide hydrogens in Balls and Sticks models.

# 1.7.1
* MouseWheel event is now triggered only if the user moves the mouse over the area.
* Refactored balls and sticks model to include metallic bonds.
* Added geometry builder.
* Added dashed lines indicating gaps in cartoon models.

# 1.7.0
* Added support for labels.
* Added support for additional primitives.
* Updated Surface primitive transforms.
* Fixed surface highlighting.

# 1.6.7
* Ability to customize maximum H bond length.

# 1.6.6
* Sticky theme support.

# 1.6.5
* Fixed a bug in surface picking.

# 1.6.4
* Bugfix when renderer DOM element is not initially sized correctly.

# 1.6.3
* Fixed a bug in wireframe mesh generation.

# 1.6.2
* Fixed a bug in secondary structure detection.

# 1.6.1
* Fixed an issue with bonds in Balls and Sticks model when hydrogens are present.

# 1.6.0
* Avoid using ES6 Map/Set for performance reasons.

# 1.5.5
* Fixed a bug in surface highlighting code.

# 1.5.4
* Updated code to use new Computation API with async/await. As a result, stuff should be faster.

# 1.5.3
* Default selection color is now purple.

# 1.5.2
* Improved support for CA/P-only cartoon (alpha-trace) models.

# 1.5.1
* Updated slabbing (now using relative values + touch support).

# 1.5.0
* Support for primitive visuals. So far sphere and arbitrary surface are implemented.
* Bugfix in surface element map generation.

# 1.4.2
* Fixed fog shader when interacting with transparent objects.

# 1.4.1
* Added the ability to disable fog on per-visual basis.

# 1.4.0
* Secondary structure detection for Cartoons.

# 1.3.2
* Modified to reflect changes in the core.

# 1.3.1
* Fixed bond display between atoms that have no altLoc specified and these that do.

# 1.3.0
* Added support for displaying "covalent bonds" read from formats that contain them (e.g. SDF). 

# 1.2.8
* Added lines geometry and model.

# 1.2.7
* Fixed transparent object interactivity bug when updating its visibility.
* Fixed a mouse-scrolling issue that would scroll the entire page if scrolled on top of the plugin.

# 1.2.6
* Fixed IE11 related ES6 Set issue.

# 1.2.5
* Screenshot support.

# 1.2.4
* Support for wireframe surfaces.
* Changed camera zoom behaviour.

# 1.2.3
* Calling Model.applySelection now modifies the dirty flag.

# 1.2.2
* Fixed bonds between non-1 occupancy oxygens on water entities.

# 1.2.1
* More fixes and refactoring.

# 1.2.0
* Refactored a lot of stuff.
* Support for computation.
* Camera fixes.

# 1.1.3
* Fixed assembly visual generation.

# 1.1.2
* Fixed cartoons display bug with non-consecutive residues.

# 1.1.1
* Refactored molecular surfaces.

# 1.1.0
* Better support for molecular surfaces.

# 1.0.3
* Updated the module system (again).

# 1.0.2
* Moved marching cubes from Visualization to Core

# 1.0.1
* Fixes in module support.

# 1.0.0
* Initial.