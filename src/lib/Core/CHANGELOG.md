# 3.2.2
* Better Computation scheduling (using setImmediate alternatives instead of setTimeout).

# 3.2.1
* Parse _pdbx_struct_mod_residue from mmCIF.

# 3.2.0
* Fixed bug in CIFTools.
* Add more robust bond computation.

# 3.1.6
* Added support for _struct_conn mmCIF category.
* Refactored geometry 3D search API and added spatial hash option.

# 3.1.5
* Renamed Matrix4.empty and Vector4.create to Matrix4/Vector4.zero.
* Added more linear algebra functions.
* Removed ObjectVec3 from linear algebra.

# 3.1.4
* Added "allAtoms" query.

# 3.1.3
* Fixed a issue in the PDB parser where ATOM/HETATM records without temperature factor would not be parsed.

# 3.1.2
* Fixed an assembly generation issue.

# 3.1.1
* More robust nucleotide detection.

# 3.1.0
* Updated density data model.
* Removed the support for the DSN6 density data format.
* Fixed a bug in marching cubes that sometimes added bad triangles because of a vertex index cache not being properly cleaned.
* Marching cubes annotation tweak.

# 3.0.4
* Fix in PDB CRYST1 record parsing.

# 3.0.3
* Better low resolution mol. surfaces.
* Surface laplacian smooting now supports center vertex weight.

# 3.0.2
* Enable generating symmetry mates for the P 1 spacegroup.

# 3.0.1
* Fixed a bug in Symmetry Mates generation.
* Fixed a bug in CIF based density parsing.

# 3.0.0
* Updated Molecule representation.
  - Changed namespaces for MoleculeModel to Molecule.Model
  - Molecule.Model:
    - atoms/residues/chains/... are now accessed as data.atoms/...
    - positions are now a separate table and no longer part of atoms. 
    - these changes are to enable better data sharing between different models of the same molecule
  - Core.Structure.DataTable is now Core.Utils.DataTable and the API has been updated
* Added Core.Utils.FastMap/FastSet
  - This replaces most ES6 map usage in LiteMol.


# 2.5.1
* Updated molecular surface vertex annotation code.

# 2.5.0
* Updated Computation API. As a result, many (especially small) computation should feel a lot more responsive.

# 2.4.11
* Support for CIF density data.
* CIFTools updated.
* Support for BinaryCIF 0.3.
* BinaryCIF molecules will consume less memory.

# 2.4.10
* Detection of "single atom" nucleotides.

# 2.4.9
* Updated sequence query to support "auth_asym_id".
* Added MoleculeModel.withTransformedXYZ function.

# 2.4.8
* Updated CIFTools.

# 2.4.7
* Refactor ChunkedArray and ArrayBuilder to procedural style to avoid deoptimization on long runs.
* CIF support has been factored out as CIFTools.js.

# 2.4.6
* Improved BinaryCIF interger packing encoder.

# 2.4.5
* PDB parser fix.

# 2.4.4
* Added polymerTrace(...atomNames) query.

# 2.4.3
* Refactored code that used "private classes" to a procedural style to avoid it from being deoptimized by garbage collector on long computations.

# 2.4.2
* SDF parser fix.
* StringPool is now "local" to avoid memory leaks.

# 2.4.1
* A bugfix in BinaryCIF decoder.
* A bugfix in mmCIF assembly parsing.

# 2.4.0
* Refactored CIF support. The CIF access is now a lot more streamlined.
* Added support for BinarCIF.
* Renamed Formats.Density.BRIX to Formats.Density.DSN6 

# 2.3.1
* Adding MOL/SDF support.

# 2.3.0
* Refactoring of "Formats" namespace to enable easier support for additional formats.
  - Formats.Cif is now Formats.CIF
  - Moved Formats.Cif.mmCif to Formats.Molecule.mmCIF
  - Moved Formats.PDB to Formats.Molecule.PDB
  - Moved Formats.CCP4/BRIX to Formats.Density.CCP4/BRIX
  - Moved Formats/Field.ts to Formats/Density/Data.ts and changed the namespace to Formats.Density
  - Added a "common" parsing functions for all formats supported by the Core.

# 2.2.7
* Fixed a bug in PDB parser.

# 2.2.6
* Fixed a bug that prevented creating of "non-interactive" molecular surfaces.

# 2.2.5
* Added query flatten and function Fragment.find(query). (for example residuesByName('ALA').flatten(f => f.find(atomsByElement('C')))).

# 2.2.4
* Added intersectWith query.
* Fixed a problem with kD tree based queries (ambient*) in "partial contexts" (i.e. when inside "inside" query).

# 2.2.3
* Added algebraic query support.

# 2.2.2
* Added complement query.

# 2.2.1
* Added additional pattern queries.

# 2.2.0
* Added support for the BRIX density format.

# 2.1.15
* Fix to overlaping secondary structure elements.

# 2.1.14
* Fixes to assembly generation.

# 2.1.13
* Refactored symmetry generation code to be slightly more readable.

# 2.1.12
* Fixed symmetry/assembly generation that contained lower amount of entities in it's result. 
* Fixed secondary structure indexing in symmetry/assembly generation when the output molecule is smaller than the original.

# 2.1.11
* Updated sequence query to work on computed models.

# 2.1.10
* Fixed another bug in asymIds :)

# 2.1.9
* Fixed a bug with incorrect asymIds in the symmetry mate generation.

# 2.1.8
* Refactored queries.

# 2.1.7
* Added C4 atom to the sidechain and backbone queries.

# 2.1.6
* Computed molecules (assemblies) now include operator indices used. 

# 2.1.5
* Fixed a bug in the CIF parser that crashed on ' X' (i.e. string token that starts with space).

# 2.1.4
* Added support for TURN secondary structure.

# 2.1.3
* Assembly and symmetry generation now supports secondary structure.

# 2.1.2
* Updated the module system (again).

# 2.1.1
* Moved marching cubes from Visualization to Core
* Added PerformanceMonitor to Utils

# 2.1.0
* Added support for generating symmetry mates and assembly models.

# 2.0.1
* Fixes in module support.

# 2.0.0
* Big code refactoring.

# 1.3.0
* Added basic support for the PDB format.
* Fixed a minor bug in visualization picking code.

# 1.2.1
* Changed the visuals' constructors to take a single object as input rather than a long list of arguments.

# 1.2.0
* Added basic support for molecule comparison based on RMSD.

# 1.1.5
* Added support for "full" density surfaces.

# 1.1.4
* Added entityId property to chain table in molecule representation.
* Changed entity table id to entityId.

# 1.1.3
* Fixed a bug "atom names" queries.

# 1.1.2
* Coloring of molecular surfaces.

# 1.1.1
* Fixed a bug in assembly visuals.
* Fixed symmetry visuals.

# 1.1.0
* Updated Density/MarchingCubes to support vertex annotation.
* Added MolecularSurface support.
* Added namespace LiteMol.Visualization.Molecule.