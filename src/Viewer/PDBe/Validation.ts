/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Validation {
    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    
    export interface Report extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> { }
    export const Report = Entity.create<Entity.Behaviour.Props<Interactivity.Behaviour>>({ name: 'PDBe Molecule Validation Report', typeClass: 'Behaviour', shortName: 'VR', description: 'Represents PDBe validation report.' });

    namespace Api {        
        export function getResidueId(seqNumber: number, insCode: string | null) {
            var id = seqNumber.toString();
            if ((insCode || "").length !== 0) id += " " + insCode;
            return id;
        }

        export function getEntry(report: any, modelId: string, entity: string, asymId: string, residueId: string) {
            let e = report[entity];
            if (!e) return void 0;
            e = e[asymId];
            if (!e) return void 0;
            e = e[modelId];
            if (!e) return void 0;
            return e[residueId];
        } 
        
        export function createReport(data: any) {
            let report: any = {};
            if (!data.molecules) return report;
            for (let entity of data.molecules) {
                let chains: any = {};
                for (let chain of entity.chains) {
                    let models: any = {};
                    for (let model of chain.models) {
                        let residues: any = {};
                        for (let residue of model.residues) {
                            let id = getResidueId(residue.residue_number, residue.author_insertion_code),
                                entry = residues[id];

                            if (entry) {
                                entry.residues.push(residue);
                                entry.numIssues = Math.max(entry.numIssues, residue.outlier_types.length);
                            }
                            else {
                                residues[id] = {
                                    residues: [residue],
                                    numIssues: residue.outlier_types.length
                                };
                            }
                        }
                        models[model.model_id.toString()] = residues;
                    }
                    chains[chain.struct_asym_id] = models;
                }
                report[entity.entity_id.toString()] = chains;                        
            }         
            return report;  
        }
    }
    
    namespace Interactivity {
        
        export class Behaviour implements Bootstrap.Behaviour.Dynamic {
            private provider: Bootstrap.Interactivity.HighlightProvider;
            
            dispose() {
                this.context.highlight.removeProvider(this.provider);
            }
                    
            register(behaviour: any) {
                 this.context.highlight.addProvider(this.provider);
            }
            
            private processInfo(info: Bootstrap.Interactivity.Info): string | undefined {
                let i = Bootstrap.Interactivity.Molecule.transformInteraction(info);
                
                if (!i || i.residues.length > 1) return void 0;                    
                let r = i.residues[0];
                let e = Api.getEntry(this.report, i.modelId, r.chain.entity.entityId, r.chain.asymId, Api.getResidueId(r.seqNumber, r.insCode));             
                if (!e) return void 0;
                
                let label: string;
                
                if (e.residues.length === 1) {
                    let vr = e.residues[0];
                    label = 'Validation: ';
                    if (!vr.outlier_types.length) label += 'no issue';
                    else label += `<b>${e.residues[0].outlier_types.join(", ")}</b>`;
                    return label;
                } else {
                    label = '';
                    let index = 0;
                    for (let v of e.residues) {
                        if (index > 0) label += ', ';
                        label += `Validation (altLoc ${v.alt_code}): <b>${v.outlier_types.join(", ")}</b>`;                        
                        index++;
                    }   
                    return label;
                }
            }
            
            constructor(public context: Bootstrap.Context, public report: any) {                
                this.provider = info => {                    
                    try {
                        return this.processInfo(info);
                    } catch (e) {
                        console.error('Error showing validation label', e);   
                        return void 0;
                    }
                };                
            }   
        }
        
    }
    
    namespace Theme {    
        const colorMap = (function () {
            let colors = Core.Utils.FastMap.create<number, LiteMol.Visualization.Color>();
            colors.set(0, { r: 0, g: 1, b: 0 }); 
            colors.set(1, { r: 1, g: 1, b: 0 });
            colors.set(2, { r: 1, g: 0.5, b: 0 });
            colors.set(3, { r: 1, g: 0, b: 0 });
            return colors;
        })();
        
        const defaultColor = <LiteMol.Visualization.Color>{ r: 0.6, g: 0.6, b: 0.6 };
        const selectionColor = <LiteMol.Visualization.Color>{ r: 0, g: 0, b: 1 };
        const highlightColor = <LiteMol.Visualization.Color>{ r: 1, g: 0, b: 1 };
    
        function createResidueMapNormal(model: LiteMol.Core.Structure.Molecule.Model, report: any) {
            let map = new Uint8Array(model.data.residues.count);            
            let mId = model.modelId;
            let { asymId, entityId, seqNumber, insCode } = model.data.residues;                        
            for (let i = 0, _b = model.data.residues.count; i < _b; i++) {                
                let e = Api.getEntry(report, mId, entityId[i], asymId[i], Api.getResidueId(seqNumber[i], insCode[i]));
                if (e) {
                    map[i] = Math.min(e.numIssues, 3);
                }
            }            
            return map;            
        }
        
        function createResidueMapComputed(model: LiteMol.Core.Structure.Molecule.Model, report: any) {
            let map = new Uint8Array(model.data.residues.count);            
            let mId = model.modelId;
            let parent = model.parent!;
            let { entityId, seqNumber, insCode, chainIndex } = model.data.residues; 
            let { sourceChainIndex } = model.data.chains;
            let { asymId } = parent.data.chains;
                                   
            for (let i = 0, _b = model.data.residues.count; i < _b; i++) {     
                let aId = asymId[sourceChainIndex![chainIndex[i]]];           
                let e = Api.getEntry(report, mId, entityId[i], aId, Api.getResidueId(seqNumber[i], insCode[i]));
                if (e) {
                    map[i] = Math.min(e.numIssues, 3);
                }
            }            
            return map;            
        }
    
        export function create(entity: Bootstrap.Entity.Molecule.Model, report: any) {
            let model = entity.props.model;
            let map = model.source === Core.Structure.Molecule.Model.Source.File 
                ? createResidueMapNormal(model, report)
                : createResidueMapComputed(model, report);
            
            let colors = Core.Utils.FastMap.create<string, LiteMol.Visualization.Color>();
            colors.set('Uniform', defaultColor)
            colors.set('Selection', selectionColor)
            colors.set('Highlight', highlightColor);
            let residueIndex = model.data.atoms.residueIndex;            
            
            let mapping = Visualization.Theme.createColorMapMapping(i => map[residueIndex[i]], colorMap, defaultColor);
            return Visualization.Theme.createMapping(mapping, { colors, interactive: true, transparency: { alpha: 1.0 } });
        }                
    }
    
    const Create = Bootstrap.Tree.Transformer.create<Entity.Data.String, Report, { id?: string }>({
            id: 'pdbe-validation-create',
            name: 'PDBe Validation',
            description: 'Create the validation report from a string.',
            from: [Entity.Data.String],
            to: [Report],
            defaultParams: () => ({})
        }, (context, a, t) => { 
            return Bootstrap.Task.create<Report>(`Validation Report (${t.params.id})`, 'Normal', async ctx => {
                await ctx.updateProgress('Parsing...');                
                let data = JSON.parse(a.props.data);
                let model = data[t.params.id!];
                let report = Api.createReport(model || {});                    
                return Report.create(t, { label: 'Validation Report', behaviour: new Interactivity.Behaviour(context, report) });
            }).setReportTime(true);
        }       
    );
        
    export const DownloadAndCreate = Bootstrap.Tree.Transformer.action<Entity.Molecule.Molecule, Entity.Action, { reportRef?: string }>({
        id: 'pdbe-validation-download-and-create',
        name: 'PDBe Validation Report',
        description: 'Download Validation Report from PDBe',
        from: [Entity.Molecule.Molecule],
        to: [Entity.Action],
        defaultParams: () => ({})
    }, (context, a, t) => {        
        let id = a.props.molecule.id.trim().toLocaleLowerCase();                    
        let action = Bootstrap.Tree.Transform.build()
            .add(a, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/${id}`, type: 'String', id, description: 'Validation Data', title: 'Validation' })
            .then(Create, { id }, { isBinding: true, ref: t.params.reportRef });

        return action;
    }, "Validation report loaded. Hovering over residue will now contain validation info. To apply validation coloring, select the entity in the tree and apply it the right panel.");
    
    export const ApplyTheme = Bootstrap.Tree.Transformer.create<Report, Entity.Action, { }>({
        id: 'pdbe-validation-apply-theme',
        name: 'Apply Coloring',
        description: 'Colors all visuals using the validation report.',
        from: [Report],
        to: [Entity.Action],
        defaultParams: () => ({})  
    }, (context, a, t) => {        
            return Bootstrap.Task.create<Entity.Action>('Validation Coloring', 'Background', async ctx => {            
            let molecule = Bootstrap.Tree.Node.findAncestor(a, Bootstrap.Entity.Molecule.Molecule);
            if (!molecule)  {
                throw 'No suitable parent found.';
            } 
                
            let themes = Core.Utils.FastMap.create<number, Visualization.Theme>();      
            let visuals = context.select(Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(Bootstrap.Entity.Molecule.Visual));            
            for (let v of visuals) {
                let model = Bootstrap.Utils.Molecule.findModel(v);
                if (!model) continue;                
                let theme = themes.get(model.id);                
                if (!theme) {
                    theme = Theme.create(model, a.props.behaviour.report);
                    themes.set(model.id, theme);
                }                
                Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v as any, theme });
            }                                   
            context.logger.message('Validation coloring applied.');
            return Bootstrap.Tree.Node.Null;
        });
    });
}