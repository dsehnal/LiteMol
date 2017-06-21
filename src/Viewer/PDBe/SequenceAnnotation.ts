/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.SequenceAnnotation {    
    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    import Query = LiteMol.Core.Structure.Query;
    
    export interface Annotations extends Entity<{ data: any }> { }
    export const Annotations = Entity.create<{ data: any }>({ name: 'PDBe Sequence Annotations', typeClass: 'Data', shortName: 'SA', description: 'Represents PDBe sequence annotation data.' });

    export interface Annotation extends Entity<{ query: Query.Source; color: Visualization.Color; }> { }
    export const Annotation = Entity.create<{ query: Query.Source; color: Visualization.Color; }>({ name: 'PDBe Sequence Annotation', typeClass: 'Object', shortName: 'SA', description: 'Represents PDBe sequence annotation.' }, { isSilent: true, isFocusable: true });
    
    export interface Behaviour extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> { }
    export const Behaviour = Entity.create<Entity.Behaviour.Props<Interactivity.Behaviour>>({ name: 'PDBe Sequence Annotation Behaviour', typeClass: 'Behaviour', shortName: 'SA', description: 'Represents PDBe sequence annoation behaviour.' });
        
    export namespace Interactivity {
        
        export class Behaviour implements Bootstrap.Behaviour.Dynamic {
            private node: Entity.Behaviour.Any = <any>void 0;
            private current: Annotation | undefined = void 0;
            private subs: Bootstrap.Rx.IDisposable[] = [];
            
            private toHighlight: Entity.Any | undefined = void 0;
            private isHighlightOn = false;
            
            dispose() {
                this.resetTheme();
                for (let sub of this.subs) {
                    sub.dispose();
                }
                this.subs = [];
                this.node = <any>void 0;
            }
                    
            register(behaviour: Entity.Behaviour.Any) {
                this.node = behaviour;
                this.subs.push(this.context.behaviours.currentEntity.subscribe(e => this.update(e)));
                this.subs.push(Bootstrap.Command.Entity.Highlight.getStream(this.context).subscribe(e => {
                    if (e.data.entities.length === 1) {
                        let a = e.data.entities[0];
                        if (a.type !== Annotation) return;                        
                        this.toHighlight = a;
                        this.isHighlightOn = e.data.isOn;
                        this.__highlight();
                    }
                }));
                this.subs.push(Bootstrap.Command.Entity.Focus.getStream(this.context).subscribe(e => {
                    if (e.data.length === 1) {
                        let a = e.data[0];
                        if (a.type !== Annotation) return;
                        this.focus(a as Annotation);
                    }
                }));
            }
            
            private __highlight = LiteMol.Core.Utils.debounce(() => this.highlight(), 33);
            
            get molecule() {
                return Bootstrap.Utils.Molecule.findMolecule(this.node)
            }
            
            private resetTheme() {
                let molecule = this.molecule;
                if (molecule) {
                    Bootstrap.Command.Visual.ResetTheme.dispatch(this.context, { selection: Bootstrap.Tree.Selection.byValue(molecule).subtree() });
                } 
            }
            
            private getCached(a: Annotation, model: Entity.Molecule.Model) {
                return this.context.entityCache.get(a, `theme-${model.id}`) as Visualization.Theme;                
            }
            
            private setCached(a: Annotation, model: Entity.Molecule.Model, theme: Visualization.Theme) {
                this.context.entityCache.set(a, `theme-${model.id}`, theme);                
            }
            
            private highlight() {
                let e = this.toHighlight;
                this.toHighlight = void 0;
                
                if (!e || e.type !== Annotation) return;
                let a = e as Annotation;
                if (!this.isHighlightOn) {
                    if (this.current) {
                        this.update(this.current);
                    } else {
                        this.resetTheme();
                    }
                } else {
                    this.apply(a);
                }
            }
            
            private focus(a: Annotation) {
                let molecule = this.molecule;
                if (!molecule) return;        
                let model = this.context.select(Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(Bootstrap.Entity.Molecule.Model))[0] as Bootstrap.Entity.Molecule.Model;
                if (!model) return;
                
                Bootstrap.Command.Molecule.FocusQuery.dispatch(this.context, { model, query: a.props.query });   
                Bootstrap.Command.Entity.SetCurrent.dispatch(this.context, a); 
            }
            
            private apply(a: Annotation) {
                let molecule = this.molecule;
                if (!molecule) return;                
                let visuals = this.context.select(Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(Bootstrap.Entity.Molecule.Visual));                
                for (let v of visuals) {
                    let model = Bootstrap.Utils.Molecule.findModel(v);
                    if (!model) continue;                
                    let theme = this.getCached(a, model);                
                    if (!theme) {
                        theme = Theme.create(model, a.props.query, a.props.color);
                        this.setCached(a, model, theme);
                    }                
                    Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(this.context, { visual: v as any, theme });
                }    
            }
            
            private update(e: Entity.Any | undefined) {                
                if (!e || e.type !== Annotation) {
                    if (this.current) this.resetTheme();         
                    this.current = void 0;
                    return;
                }                         
                this.current = e as Annotation;                
                this.apply(this.current);
            }
            
            constructor(public context: Bootstrap.Context) {             
            }   
        }        
    }
    
    namespace Theme {        
        const defaultColor = <LiteMol.Visualization.Color>{ r: 1, g: 1, b: 1 };
        const selectionColor = Visualization.Theme.Default.SelectionColor;
        const highlightColor = Visualization.Theme.Default.HighlightColor;
    
        function createResidueMap(model: LiteMol.Core.Structure.Molecule.Model, fs: Query.FragmentSeq) {
            let map = new Uint8Array(model.data.residues.count);            
            let residueIndex = model.data.atoms.residueIndex;
            for (let f of fs.fragments) {
                for (let i of f.atomIndices) {
                    map[residueIndex[i]] = 1;
                }
            }
            return map;            
        }
        
        export function create(entity: Bootstrap.Entity.Molecule.Model, query: Query.Source, color: Visualization.Color) {
            let model = entity.props.model;            
            let q = Query.Builder.toQuery(query);
            let fs = q(model.queryContext);                        
            let map = createResidueMap(model, fs);
            
            let colors = Core.Utils.FastMap.create<string, LiteMol.Visualization.Color>();
            colors.set('Uniform', defaultColor);
            colors.set('Bond', defaultColor);
            colors.set('Selection', selectionColor);
            colors.set('Highlight', highlightColor);
            
            let colorMap = Core.Utils.FastMap.create<number, Visualization.Color>();
            colorMap.set(1, color);
            
            let residueIndex = model.data.atoms.residueIndex;            
            let mapping = Visualization.Theme.createColorMapMapping(i => map[residueIndex[i]], colorMap, defaultColor);
            return Visualization.Theme.createMapping(mapping, { colors, interactive: true, transparency: { alpha: 1.0 } });
        }     
    }
    
    function buildAnnotations(parent: Annotations, id: string, data: any) {

        let action = Bootstrap.Tree.Transform.build(); 
        if (!data) {            
            return action;
        }
        
        let baseColor = Visualization.Color.fromHex(0xFA6900);
        for (let g of ["Pfam", "InterPro", "CATH", "SCOP", "UniProt"]) {
            let ans = data[g];
            if (!ans) continue;      
            let entries =  Object.keys(ans).filter(a => Object.prototype.hasOwnProperty.call(ans, a))
            if (!entries.length) continue;
              
            let group = action.add(parent, Transformer.Basic.CreateGroup, { label: g, isCollapsed: true }, { isBinding: true });           
            for (let a of entries) {       
                group.then(CreateSingle, { data: ans[a], id: a, color: baseColor });                
            }            
        }
        
        action.add(parent, CreateBehaviour, {}, { isHidden: true });
                
        return action;
    }
    
    function getInsCode(v: string) {
        if (v.length === 0) return null;
        return v;        
    }
    
    export interface CreateSingleProps { id?: string, data?: any, color?: Visualization.Color }
    export const CreateSingle = Bootstrap.Tree.Transformer.create<Entity.Group, Annotation, CreateSingleProps>({
            id: 'pdbe-sequence-annotations-create-single',
            name: 'PDBe Sequence Annotation',
            description: 'Create a sequence annotation object.',
            from: [], // this is empty because we only want to show it as an update
            to: [Annotation],
            defaultParams: () => ({ }),
            isUpdatable: true
        }, (context, a, t) => { 
            return Bootstrap.Task.create<Annotation>(`Sequence Annotation`, 'Background', async ctx => {                
                let data = t.params.data;                
                let query =
                    Query.or.apply(null, data.mappings.map((m: any) =>
                        Query.sequence(
                            m.entity_id.toString(), m.struct_asym_id,
                            { seqNumber: m.start.residue_number, insCode: getInsCode(m.start.author_insertion_code) },
                            { seqNumber: m.end.residue_number, insCode: getInsCode(m.end.author_insertion_code) })))
                        .union();                                    
                return Annotation.create(t, { label: data.identifier, description: t.params.id, query, color: t.params.color! });
            });
        }       
    );
    
    const Parse = Bootstrap.Tree.Transformer.create<Entity.Data.String, Annotations, { }>({
            id: 'pdbe-sequence-annotations-parse',
            name: 'PDBe Sequence Annotations',
            description: 'Parse sequence annotation JSON.',
            from: [Entity.Data.String],
            to: [Annotations],
            defaultParams: () => ({})
        }, (context, a, t) => { 
            return Bootstrap.Task.create<Annotations>(`Sequence Annotations`, 'Normal', async ctx => {
                await ctx.updateProgress('Parsing...');                
                let data = JSON.parse(a.props.data);               
                return Annotations.create(t, { label: 'Sequence Annotations', data });
            }).setReportTime(true);
        }       
    );
    
    const CreateBehaviour = Bootstrap.Tree.Transformer.create<Annotations, Behaviour, { }>({
            id: 'pdbe-sequence-annotations-create-behaviour',
            name: 'PDBe Sequence Annotation Behaviour',
            description: 'Create sequence annotation behaviour.',
            from: [Annotations],
            to: [Behaviour],
            defaultParams: () => ({})
        }, (context, a, t) => { 
            return Bootstrap.Task.resolve<Behaviour>(`Sequence Annotations`, 'Background', Behaviour.create(t, { label: 'Sequence Annotations', behaviour: new Interactivity.Behaviour(context) }))
        }       
    );
        
    
    const Build = Bootstrap.Tree.Transformer.action<Annotations, Entity.Action, { }>({
            id: 'pdbe-sequence-annotations-build',
            name: 'PDBe Sequence Annotations',
            description: 'Build sequence validations behaviour.',
            from: [Annotations],
            to: [Entity.Action],
            defaultParams: () => ({})
        }, (context, a, t) => { 
            let data = a.props.data;
            let keys = Object.keys(data);            
            return buildAnnotations(a, keys[0], data[keys[0]]);
        }, "Sequence annotations downloaded. Selecting or hovering an annotation in the tree will color the visuals."       
    );
    
    export const DownloadAndCreate = Bootstrap.Tree.Transformer.action<Entity.Molecule.Molecule, Entity.Action, { }>({
        id: 'pdbe-sequence-annotations-download-and-create',
        name: 'PDBe Sequence Annotations',
        description: 'Download Sequence Annotations from PDBe',
        from: [Entity.Molecule.Molecule],
        to: [Entity.Action],
        defaultParams: () => ({})
    }, (context, a, t) => {        
        let id = a.props.molecule.id.trim().toLocaleLowerCase();                    
        return Bootstrap.Tree.Transform.build()
            .add(a, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/api/mappings/${id}`, type: 'String', id, description: 'Annotation Data', title: 'Annotation' })
            .then(Parse, { }, { isBinding: true })
            .then(Build, { }, { isBinding: true });
    });
    
}