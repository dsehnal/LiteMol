/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity {
    "use strict";
   
    export function isMolecule(e: Any): e is Molecule.Molecule {
        return e && e.type === Molecule.Molecule;
    } 
    
    export function isMoleculeModel(e: Any): e is Molecule.Model {
        return e && e.type === Molecule.Model;
    } 
    
    export function isMoleculeSelection(e: Any): e is Molecule.Selection {
        return e && e.type === Molecule.Selection;
    }
    
    export function isVisual(e: Any): e is Visual.Any {
        return e && e.type.info.typeClass === VisualClass;
    } 
            
    /* Base */    
    
    export const RootTransform = Tree.Transform.create<Root, Root, {}>({}, {}, <any>void 0);
    
    export interface Root extends Entity<{}> {}
    export const Root = create<{}>({ name: 'Root', typeClass: 'Root', shortName: 'R', description: 'Where everything begins.' } );
        
    export interface Group extends Entity<{}> {}
    export const Group = create<{}>({ name: 'Group', typeClass: 'Group', shortName: 'G', description: 'A group on entities.' }   );
    
    export interface Action extends Entity<{}> {}
    export const Action = create<{}>({ name: 'Action', typeClass: 'Action', shortName: 'A', description: 'Represents an action performed on the entity tree.' });

    export namespace Behaviour {    
        export interface Props<T extends Bootstrap.Behaviour.Dynamic> { 
            behaviour: T
        }   

        export interface Any extends Entity<{ behaviour: Bootstrap.Behaviour.Dynamic }> { }
    }
    
    /* Data */
    
    export namespace Data {    
        export type Type = 'String' | 'Binary'        
        export const Types:Type[] = ['String', 'Binary'];
        
        export interface String extends Entity<{ data: string }> { }
        export const String = create<{ data: string }>({ name: 'String Data', typeClass: 'Data', shortName: 'S_D', description: 'A string.' });
        
        export interface Binary extends Entity<{ data: ArrayBuffer }> { }
        export const Binary = create<{ data: ArrayBuffer }>( { name: 'Binary Data', typeClass: 'Data', shortName: 'B_D', description: 'A binary blob.' });
        
        export interface CifDictionary extends Entity<{ dictionary: Core.Formats.CIF.File }> { }
        export const CifDictionary = create<{ dictionary: Core.Formats.CIF.File }>({ name: 'Cif Dictionary', typeClass: 'Data', shortName: 'CD', description: 'Represents parsed CIF data.' });

        export interface Json extends Entity<{ data: any }> { }
        export const Json = create<{ data: any }>({ name: 'JSON Data', typeClass: 'Data', shortName: 'JS_D', description: 'Represents JSON data.' });
    }
    
    // /* Visual props */
    
    export namespace Visual {
        export interface Props<Type> { 
            model: LiteMol.Visualization.Model,
            style: Visualization.Style<Type, any>,
            isSelectable: boolean
        }   
        
        export interface Any extends Entity<Props<any>> { }  

        export interface Surface extends Entity<Props<'Surface'> & { tag: any }> { }
        export const Surface = create<Props<'Surface'> & { tag: any }>({ name: 'Surface Visual', typeClass: 'Visual', shortName: 'V_S', description: 'A surface visual.' }, { isFocusable: true });

        export interface Labels extends Entity<Visual.Props<'Labels'>> { }
        export const Labels = create<Visual.Props<'Labels'>>({ name: 'Labels Visual', typeClass: 'Visual', shortName: 'V_L', description: '3D labels.' }, { isFocusable: false });

    }
    
    /* Molecule */
    
    export namespace Molecule {     
        export interface Molecule extends Entity<{ molecule: Core.Structure.Molecule }> { }
        export const Molecule = create<{ molecule: Core.Structure.Molecule }>({ name: 'Molecule', typeClass: 'Object', shortName: 'M', description: 'A molecule that might contain one or more models.' });

        export interface Model extends Entity<{ model: Core.Structure.Molecule.Model }> { }
        export const Model = create<{ model: Core.Structure.Molecule.Model }>( { name: 'Molecule Model', typeClass: 'Object', shortName: 'M_M', description: 'A model of a molecule.' });
        
        export interface Selection extends Entity<{ indices: number[] }> { }
        export const Selection = create<{ indices: number[] }>( { name: 'Molecule Model Selection', typeClass: 'Selection', shortName: 'S_M', description: 'A selection of atoms.' }, { isFocusable: true });
        
        export interface Visual extends Entity<Visual.Props<Bootstrap.Visualization.Molecule.Type> & { tag?: any }> { }
        export const Visual = create<Visual.Props<Bootstrap.Visualization.Molecule.Type> & { tag?: any }>({ name: 'Molecule Visual', typeClass: 'Visual', shortName: 'V_M', description: 'A visual of a molecule.' }, { isFocusable: true });
        
        export namespace CoordinateStreaming {
            export interface Behaviour extends Entity<Behaviour.Props<Bootstrap.Behaviour.Molecule.CoordinateStreaming>> {}
            export const Behaviour = create<Behaviour.Props<Bootstrap.Behaviour.Molecule.CoordinateStreaming>>({ name: 'Coordinate Streaming', typeClass: 'Behaviour', shortName: 'CS', description: 'Behaviour that downloads surrounding residues when an atom or residue is selected.' });
        }
    }
    
    /* Density */
    
    export namespace Density {     
        export interface Data extends Entity<{ data: Core.Formats.Density.Data }> { }   
        export const Data = create<{ data: Core.Formats.Density.Data }>({ name: 'Density Data', typeClass: 'Object', shortName: 'DD', description: 'Density data.' });
        
        export interface Visual extends Entity<Visual.Props<'Density'>> { }
        export const Visual = create<Visual.Props<'Density'>>({ name: 'Density Visual', typeClass: 'Visual', shortName: 'V_DD', description: 'A visual of density data.' }, { isFocusable: true });       
        
        export interface InteractiveSurface extends Entity<Behaviour.Props<Bootstrap.Behaviour.Density.ShowDynamicDensity>>  {}
        export const InteractiveSurface = create<Behaviour.Props<Bootstrap.Behaviour.Density.ShowDynamicDensity>>({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_IS', description: 'Behaviour that creates an interactive surface when an atom or residue is selected.' });
    }
}