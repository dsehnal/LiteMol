/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
    
    
    export const RootTransform = Tree.Transform.create<Root, Root, {}>({}, {}, void 0);
        
    export interface Root extends Entity<Root, RootType, CommonProps> { } 
    export interface RootType extends Type<RootType, Root, CommonProps> {}
    export const Root = create<Root, RootType, CommonProps>({ name: 'Root', typeClass: 'Root', shortName: 'R', description: 'Where everything begins.' } );
        
    export interface Group extends Entity<Group, GroupType, CommonProps> { } 
    export interface GroupType extends Type<GroupType, Group, CommonProps> { }
    export const Group = create<Group, GroupType, CommonProps>({ name: 'Group', typeClass: 'Group', shortName: 'G', description: 'A group on entities.' }   );
    
    export interface ActionProps extends CommonProps { }    
    export interface Action extends Entity<Action, ActionType, ActionProps> { } 
    export interface ActionType extends Type<ActionType, Action, ActionProps> { }
    export const Action = create<Action, ActionType, ActionProps>({ name: 'Action', typeClass: 'Action', shortName: 'A', description: 'Represents an action performed on the entity tree.' });
    
    export namespace Behaviour { 
        export interface Props<T extends Bootstrap.Behaviour.Dynamic> extends CommonProps { behaviour: T }            
        export interface Any extends Entity<Any, Type<any, Any, Props<Bootstrap.Behaviour.Dynamic>>, Props<Bootstrap.Behaviour.Dynamic>> { }
          
        // export interface Behaviour extends Entity<Behaviour, BehaviourType, BehaviourProps> { } 
        // export interface BehaviourType extends Type<BehaviourType, Behaviour, BehaviourProps> { }
        // export const Behaviour = create<Behaviour, BehaviourType, BehaviourProps>({ name: 'Behaviour', typeClass: 'Behaviour', shortName: 'B', description: 'Represents a dynamic behaviour of the program.' });
    }
    
    /* Data */
    
    export namespace Data {
    
        export type Type = 'String' | 'Binary'        
        export const Types:Type[] = ['String', 'Binary']
        export interface Props<T> extends CommonProps { data: T }
            
        export interface StringProps extends Props<string> { }    
        export interface String extends Entity<String, StringType, StringProps> { }         
        export interface StringType extends Entity.Type<StringType, String, StringProps> { }                
        export const String = create<String, StringType, StringProps>({ name: 'String Data', typeClass: 'Data', shortName: 'S_D', description: 'A string.' });
                         
        export interface BinaryProps extends Props<ArrayBuffer> { }    
        export interface Binary extends Entity<Binary, BinaryType, BinaryProps> { }         
        export interface BinaryType extends Entity.Type<BinaryType, Binary, BinaryProps> { }        
        export const Binary = create<Binary, BinaryType, BinaryProps>( { name: 'Binary Data', typeClass: 'Data', shortName: 'B_D', description: 'A binary blob.' });
                
        export interface CifDictionaryProps extends CommonProps { dictionary: Core.Formats.CIF.File }
        export interface CifDictionary extends Entity<CifDictionary, CifDictionaryType, CifDictionaryProps> { }         
        export interface CifDictionaryType extends Entity.Type<CifDictionaryType, CifDictionary, CifDictionaryProps> { }   
        export const CifDictionary = create<CifDictionary, CifDictionaryType, CifDictionaryProps>({ name: 'Cif Dictionary', typeClass: 'Data', shortName: 'CD', description: 'Represents parsed CIF data.' });
        
        export interface JsonProps extends CommonProps { data: any }
        export interface Json extends Entity<Json, JsonType, JsonProps> { }         
        export interface JsonType extends Entity.Type<JsonType, Json, JsonProps> { }   
        export const Json = create<Json, JsonType, JsonProps>({ name: 'JSON Data', typeClass: 'Data', shortName: 'JS_D', description: 'Represents JSON data.' });
    }
    
    // /* Visual props */
    
    export namespace Visual {
        export interface Props<Type> extends CommonProps { 
            model: LiteMol.Visualization.Model,
            style: Visualization.Style<Type, any>,
            isSelectable: boolean
        }   
        
        export interface Any extends Entity<Any, Type<any, Any, Props<any>>, Props<any>> { }  
    }
    
    /* Molecule */
    
    export namespace Molecule {                
        
        export interface MoleculeProps extends CommonProps { molecule: Core.Structure.Molecule }
        export interface Molecule extends Entity<Molecule, MoleculeType, MoleculeProps> { }         
        export interface MoleculeType extends Entity.Type<MoleculeType, Molecule, MoleculeProps> { }     
        export const Molecule = create<Molecule, MoleculeType, MoleculeProps>({ name: 'Molecule', typeClass: 'Object', shortName: 'M', description: 'A molecule that might contain one or more models.' });
        
        export interface ModelProps extends CommonProps { model: Core.Structure.MoleculeModel }
        export interface Model extends Entity<Model, ModelType, ModelProps> { }         
        export interface ModelType extends Entity.Type<ModelType, Model, ModelProps> { }     
        export const Model = create<Model, ModelType, ModelProps>( { name: 'Molecule Model', typeClass: 'Object', shortName: 'M_M', description: 'A model of a molecule.' });
        
        export interface SelectionProps extends CommonProps { indices: number[] }
        export interface Selection extends Entity<Selection, SelectionType, SelectionProps> { }         
        export interface SelectionType extends Entity.Type<SelectionType, Selection, SelectionProps> { }     
        export const Selection = create<Selection, SelectionType, SelectionProps>( { name: 'Molecule Model Selection', typeClass: 'Selection', shortName: 'S_M', description: 'A selection of atoms.' }, { isFocusable: true });
        
        export interface VisualProps extends Entity.Visual.Props<Bootstrap.Visualization.Molecule.Type> { }             
        export interface Visual extends Entity<Visual, VisualType, VisualProps> { }         
        export interface VisualType extends Entity.Type<VisualType, Visual, VisualProps> { }     
        export const Visual = create<Visual, VisualType, VisualProps>({ name: 'Molecule Visual', typeClass: 'Visual', shortName: 'V_M', description: 'A visual of a molecule.' }, { isFocusable: true });
        
        export namespace CoordinateStreaming {
            export interface BehaviourProps extends Behaviour.Props<Bootstrap.Behaviour.Molecule.CoordinateStreaming> { }    
            export interface Behaviour extends Entity<Behaviour, BehaviourType, BehaviourProps> { } 
            export interface BehaviourType extends Type<BehaviourType, Behaviour, BehaviourProps> { }
            export const Behaviour = create<Behaviour, BehaviourType, BehaviourProps>({ name: 'Coordinate Streaming', typeClass: 'Behaviour', shortName: 'CS', description: 'Behaviour that downloads surrounding residues when an atom or residue is selected.' });
        }
    }
    
    /* Density */
    
    export namespace Density {
        
        export interface DataProps extends CommonProps { data: Core.Formats.Density.Data }
        export interface Data extends Entity<Data, DataType, DataProps> { }         
        export interface DataType extends Entity.Type<DataType, Data, DataProps> { }     
        export const Data = create<Data, DataType, DataProps>({ name: 'Density Data', typeClass: 'Object', shortName: 'DD', description: 'Density data.' });
        
        export interface VisualProps extends Entity.Visual.Props<{}> { }             
        export interface Visual extends Entity<Visual, VisualType, VisualProps> { }         
        export interface VisualType extends Entity.Type<VisualType, Visual, VisualProps> { }     
        export const Visual = create<Visual, VisualType, VisualProps>({ name: 'Density Visual', typeClass: 'Visual', shortName: 'V_DD', description: 'A visual of density data.' }, { isFocusable: true });       
        
        export interface InteractiveSurfaceProps extends Behaviour.Props<Bootstrap.Behaviour.Density.ShowElectronDensityAroundSelection> { }    
        export interface InteractiveSurface extends Entity<InteractiveSurface, InteractiveSurfaceType, InteractiveSurfaceProps> { } 
        export interface InteractiveSurfaceType extends Type<InteractiveSurfaceType, InteractiveSurface, InteractiveSurfaceProps> { }
        export const InteractiveSurface = create<InteractiveSurface, InteractiveSurfaceType, InteractiveSurfaceProps>({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_IS', description: 'Behaviour that creates an interactive surface when an atom or residue is selected.' }); 
    }
}