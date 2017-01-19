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
        
    export const Root = create({ name: 'Root', typeClass: 'Root', shortName: 'R', description: 'Where everything begins.' } );
    export type Root = typeof Root.Entity
        
    export const Group = create({ name: 'Group', typeClass: 'Group', shortName: 'G', description: 'A group on entities.' }   );
    export type Group = typeof Group.Entity
    
    export const Action = create({ name: 'Action', typeClass: 'Action', shortName: 'A', description: 'Represents an action performed on the entity tree.' });
    export type Action = typeof Action.Entity
    
    export namespace Behaviour {            
        export interface Any extends Entity<{ behaviour: Bootstrap.Behaviour.Dynamic } & CommonProps> { }

        export function create<B extends Bootstrap.Behaviour.Dynamic, Props extends { }>(info: TypeInfoBase, traits?: TypeTraits): Type<{ behaviour: B } & Props & CommonProps> {
            return Entity.create<{ behaviour: B } & Props & CommonProps>(info, traits);
        }
    }
    
    /* Data */
    
    export namespace Data {    
        export type Type = 'String' | 'Binary'        
        export const Types:Type[] = ['String', 'Binary'];
            
        export const String = create<{ data: string }>({ name: 'String Data', typeClass: 'Data', shortName: 'S_D', description: 'A string.' });
        export type String = typeof String.Entity
                         
        export const Binary = create<{ data: ArrayBuffer }>( { name: 'Binary Data', typeClass: 'Data', shortName: 'B_D', description: 'A binary blob.' });
        export type Binary = typeof Binary.Entity
                
        export const CifDictionary = create<{ dictionary: Core.Formats.CIF.File }>({ name: 'Cif Dictionary', typeClass: 'Data', shortName: 'CD', description: 'Represents parsed CIF data.' });
        export type CifDictionary = typeof CifDictionary.Entity

        export const Json = create<{ data: any }>({ name: 'JSON Data', typeClass: 'Data', shortName: 'JS_D', description: 'Represents JSON data.' });
        export type Json = typeof Json.Entity
    }
    
    // /* Visual props */
    
    export namespace Visual {
        export interface Props<Type> { 
            model: LiteMol.Visualization.Model,
            style: Visualization.Style<Type, any>,
            isSelectable: boolean
        }   
        
        export interface Any extends Entity<Props<any> & CommonProps> { }  

        export const Surface = create<Entity.Visual.Props<"Surface"> & { tag: any }>({ name: 'Surface Visual', typeClass: 'Visual', shortName: 'V_S', description: 'A surface visual.' }, { isFocusable: true });
        export type Surface = typeof Surface.Entity
    }
    
    /* Molecule */
    
    export namespace Molecule {                        
        export const Molecule = create<{ molecule: Core.Structure.Molecule }>({ name: 'Molecule', typeClass: 'Object', shortName: 'M', description: 'A molecule that might contain one or more models.' });
        export type Molecule = typeof Molecule.Entity

        export const Model = create<{ model: Core.Structure.Molecule.Model }>( { name: 'Molecule Model', typeClass: 'Object', shortName: 'M_M', description: 'A model of a molecule.' });
        export type Model = typeof Model.Entity
        
        export const Selection = create<{ indices: number[] }>( { name: 'Molecule Model Selection', typeClass: 'Selection', shortName: 'S_M', description: 'A selection of atoms.' }, { isFocusable: true });
        export type Selection = typeof Selection.Entity
        
        export const Visual = create<Entity.Visual.Props<Bootstrap.Visualization.Molecule.Type>>({ name: 'Molecule Visual', typeClass: 'Visual', shortName: 'V_M', description: 'A visual of a molecule.' }, { isFocusable: true });
        export type Visual = typeof Visual.Entity
        
        export namespace CoordinateStreaming {
            export const Behaviour = Entity.Behaviour.create<Bootstrap.Behaviour.Molecule.CoordinateStreaming, {}>({ name: 'Coordinate Streaming', typeClass: 'Behaviour', shortName: 'CS', description: 'Behaviour that downloads surrounding residues when an atom or residue is selected.' });
            export type Behaviour = typeof CoordinateStreaming.Behaviour.Entity
        }
    }
    
    /* Density */
    
    export namespace Density {        
        export const Data = create<{ data: Core.Formats.Density.Data }>({ name: 'Density Data', typeClass: 'Object', shortName: 'DD', description: 'Density data.' });
        export type Data = typeof Data.Entity
        
        export const Visual = create<Entity.Visual.Props<{}>>({ name: 'Density Visual', typeClass: 'Visual', shortName: 'V_DD', description: 'A visual of density data.' }, { isFocusable: true });       
        export type Visual = typeof Visual.Entity
        
        export const InteractiveSurface = Behaviour.create<Bootstrap.Behaviour.Density.ShowDynamicDensity, {}>({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_IS', description: 'Behaviour that creates an interactive surface when an atom or residue is selected.' }); 
        export type InteractiveSurface = typeof InteractiveSurface.Entity
    }
}