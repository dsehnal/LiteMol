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
    export const Root = create<Root>({ name: 'Root', typeClass: 'Root', shortName: 'R', description: 'Where everything begins.' } );
        
    export interface Group extends Entity<{}> {}
    export const Group = create<Group>({ name: 'Group', typeClass: 'Group', shortName: 'G', description: 'A group on entities.' }   );
    
    export interface Action extends Entity<{}> {}
    export const Action = create<Action>({ name: 'Action', typeClass: 'Action', shortName: 'A', description: 'Represents an action performed on the entity tree.' });
    
    export interface Behaviour<T extends Bootstrap.Behaviour.Dynamic, Props> extends Entity<{ behaviour: T } & Props>  { }

    export namespace Behaviour {            
        export interface Any extends Entity<{ behaviour: Bootstrap.Behaviour.Dynamic } & CommonProps> { }
    }
    
    /* Data */
    
    export namespace Data {    
        export type Type = 'String' | 'Binary'        
        export const Types:Type[] = ['String', 'Binary'];
        
        export interface String extends Entity<{ data: string }> { }
        export const String = create<String>({ name: 'String Data', typeClass: 'Data', shortName: 'S_D', description: 'A string.' });
        
        export interface Binary extends Entity<{ data: ArrayBuffer }> { }
        export const Binary = create<Binary>( { name: 'Binary Data', typeClass: 'Data', shortName: 'B_D', description: 'A binary blob.' });
        
        export interface CifDictionary extends Entity<{ dictionary: Core.Formats.CIF.File }> { }
        export const CifDictionary = create<CifDictionary>({ name: 'Cif Dictionary', typeClass: 'Data', shortName: 'CD', description: 'Represents parsed CIF data.' });

        export interface Json extends Entity<{ data: any }> { }
        export const Json = create<Json>({ name: 'JSON Data', typeClass: 'Data', shortName: 'JS_D', description: 'Represents JSON data.' });
    }
    
    // /* Visual props */
    
    export interface Visual<Type, Props> extends Entity<Visual.Props<Type> & Props>  { }

    export namespace Visual {
        export interface Props<Type> { 
            model: LiteMol.Visualization.Model,
            style: Visualization.Style<Type, any>,
            isSelectable: boolean
        }   
        
        export interface Any extends Visual<any, {}> { }  

        export interface Surface extends Visual<"Surface", { tag: any }> { }
        export const Surface = create<Surface>({ name: 'Surface Visual', typeClass: 'Visual', shortName: 'V_S', description: 'A surface visual.' }, { isFocusable: true });
    }
    
    /* Molecule */
    
    export namespace Molecule {     
        export interface Molecule extends Entity<{ molecule: Core.Structure.Molecule }> { }
        export const Molecule = create<Molecule>({ name: 'Molecule', typeClass: 'Object', shortName: 'M', description: 'A molecule that might contain one or more models.' });

        export interface Model extends Entity<{ model: Core.Structure.Molecule.Model }> { }
        export const Model = create<Model>( { name: 'Molecule Model', typeClass: 'Object', shortName: 'M_M', description: 'A model of a molecule.' });
        
        export interface Selection extends Entity<{ indices: number[] }> { }
        export const Selection = create<Selection>( { name: 'Molecule Model Selection', typeClass: 'Selection', shortName: 'S_M', description: 'A selection of atoms.' }, { isFocusable: true });
        
        export interface Visual extends Entity.Visual<Bootstrap.Visualization.Molecule.Type, { }> { }
        export const Visual = create<Visual>({ name: 'Molecule Visual', typeClass: 'Visual', shortName: 'V_M', description: 'A visual of a molecule.' }, { isFocusable: true });
        
        export namespace CoordinateStreaming {
            export interface Behaviour extends Entity.Behaviour<Bootstrap.Behaviour.Molecule.CoordinateStreaming, {}>  {}
            export const Behaviour = create<Behaviour>({ name: 'Coordinate Streaming', typeClass: 'Behaviour', shortName: 'CS', description: 'Behaviour that downloads surrounding residues when an atom or residue is selected.' });
        }
    }
    
    /* Density */
    
    export namespace Density {     
        export interface Data extends Entity<{ data: Core.Formats.Density.Data }> { }   
        export const Data = create<Data>({ name: 'Density Data', typeClass: 'Object', shortName: 'DD', description: 'Density data.' });
        
        export interface Visual extends Entity.Visual<'Density', {}> { }
        export const Visual = create<Visual>({ name: 'Density Visual', typeClass: 'Visual', shortName: 'V_DD', description: 'A visual of density data.' }, { isFocusable: true });       
        
        export interface InteractiveSurface extends Behaviour<Bootstrap.Behaviour.Density.ShowDynamicDensity, {}>  {}
        export const InteractiveSurface = create<InteractiveSurface>({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_IS', description: 'Behaviour that creates an interactive surface when an atom or residue is selected.' });
    }
}