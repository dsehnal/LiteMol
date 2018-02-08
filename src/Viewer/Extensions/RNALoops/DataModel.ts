/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.RNALoops {
    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;
    
    export interface LoopAnnotation extends Entity<Entity.Behaviour.Props<Interactivity.Behaviour>> { }
    export const LoopAnnotation = Entity.create<Entity.Behaviour.Props<Interactivity.Behaviour>>({ name: 'BGSU RNA Loops', typeClass: 'Behaviour', shortName: 'RL', description: 'Represents BGSU loop annotation.' });

    export namespace Api {        
        export interface ResidueRef { modelId: string, authAsymId: string, authSeqNumber: number, insCode: string }

        export interface Entry {
            id: string,
            type: 'IL' | 'HL' | 'J3',
            residues: ResidueRef[]
        }

        export interface Annotation { 
            [modelId: string]: { 
                [chainId: string]: { 
                    [resSeqNumber: number]: {
                        [insCode: string]: Entry[]
                    } 
                } 
            }
        }
        
        export function parseCSV(data: string) {
            const lines = data.split('\n');
            const entries: Entry[] = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const comma = line.indexOf(',');
                if (comma < 0) continue;

                const id = line.substring(1, comma - 2);
                const type = (id[0] + id[1]) as Entry['type'];

                const residueIds = line.substring(comma + 2, line.length - 1).split(',');
                const residues: Entry['residues'] = [];

                for (let j = 0; j < residueIds.length; j++) {
                    const t = residueIds[j].split('|');
                    residues.push({ modelId: t[1], authAsymId: t[2], authSeqNumber: +t[4], insCode: t[7] || '' });
                }
                entries.push({ id, type, residues });
            }

            return entries;
        }
        
        export function create(entries: Entry[]) {
            const annotation: Annotation = { };
            if (!entries.length) {
                return annotation;
            }
            for (const entry of entries) {
                for (const residue of entry.residues) {
                    const model = annotation[residue.modelId] || (annotation[residue.modelId] = { });
                    const chain = model[residue.authAsymId] || (model[residue.authAsymId] = { });
                    const seq = chain[residue.authSeqNumber] || (chain[residue.authSeqNumber] = { });
                    const ins = seq[residue.insCode] || (seq[residue.insCode] = []);
                    ins[ins.length] = entry;
                }
            }
            return annotation;  
        }

        export function getEntries(annotation: Annotation, modelId: string, asymId: string, seqNumber: number, insCode: string) {
            const m = annotation[modelId];
            if (!m) return void 0;
            const c = m[asymId];
            if (!c) return void 0;
            const r = c[seqNumber];
            if (!r) return void 0;
            return r[insCode];
        } 
    }
    
    export namespace Interactivity {        
        export class Behaviour implements Bootstrap.Behaviour.Dynamic {
            private provider: Bootstrap.Interactivity.HighlightProvider;
            
            dispose() {
                this.context.highlight.removeProvider(this.provider);
            }
                    
            register(behaviour: any) {
                 this.context.highlight.addProvider(this.provider);
            }
            
            private processInfo(info: Bootstrap.Interactivity.Info): string | undefined {
                const i = Bootstrap.Interactivity.Molecule.transformInteraction(info);                
                if (!i || i.residues.length !== 1) return void 0;

                const r = i.residues[0];
                const xs = Api.getEntries(this.annotation, i.modelId, r.chain.authAsymId, r.authSeqNumber, r.insCode || '');
                if (!xs || !xs.length) return void 0;                
                return 'RNA Loops: ' + xs.map(x => `<b>${x.type}</b> (${x.id})`).join(', ');
            }
            
            constructor(public context: Bootstrap.Context, public annotation: Api.Annotation) {
                this.provider = info => {                    
                    try {
                        return this.processInfo(info);
                    } catch (e) {
                        console.error('Error showing loop annotation label', e);   
                        return void 0;
                    }
                };                
            }   
        }        
    }
    
    namespace Theme {    
        const colorMap = (function () {
            const colors = Core.Utils.FastMap.create<number, LiteMol.Visualization.Color>();
            colors.set(0, { r: 0x5B / 0xFF, g: 0xB7 / 0xFF, b: 0x5B / 0xFF }); // (IL): #5BB75B
            colors.set(1, { r: 0x49 / 0xFF, g: 0xAF / 0xFF, b: 0xCD / 0xFF }); // (HL): #49AFCD
            colors.set(2, { r: 0xCD / 0xFF, g: 0xAC / 0xFF, b: 0x4A / 0xFF }); // (J3): #CDAC4A
            colors.set(3, { r: 0.6, g: 0.6, b: 0.6 }); // not applicable
            return colors;
        })();
        
        const defaultColor = <LiteMol.Visualization.Color>{ r: 0.6, g: 0.6, b: 0.6 };
        const selectionColor = <LiteMol.Visualization.Color>{ r: 0, g: 0, b: 1 };
        const highlightColor = <LiteMol.Visualization.Color>{ r: 1, g: 0, b: 1 };
    
        function createResidueMapNormal(model: LiteMol.Core.Structure.Molecule.Model, annotation: Api.Annotation) {
            const map = new Uint8Array(model.data.residues.count);            
            const mId = model.modelId;
            const { authAsymId, authSeqNumber, insCode } = model.data.residues;
            for (let i = 0, _b = model.data.residues.count; i < _b; i++) {                
                const entries = Api.getEntries(annotation, mId, authAsymId[i], authSeqNumber[i], insCode[i] || '');
                if (!entries) {
                    map[i] = 3;
                    continue;
                }
                const e = entries[0];
                if (e.type === 'IL') map[i] = 0;
                else if (e.type === 'HL') map[i] = 1;
                else if (e.type === 'J3') map[i] = 2;
                else map[i] = 3;                    
            }            
            return map;            
        }
        
        function createResidueMapComputed(model: LiteMol.Core.Structure.Molecule.Model, annotation: Api.Annotation) {
            const map = new Uint8Array(model.data.residues.count);            
            const mId = model.modelId;
            const parent = model.parent!;
            const { chainIndex, authSeqNumber, insCode } = model.data.residues;
            const { sourceChainIndex } = model.data.chains;
            const { authAsymId } = parent.data.chains;
                                   
            for (let i = 0, _b = model.data.residues.count; i < _b; i++) {
                const aId = authAsymId[sourceChainIndex![chainIndex[i]]];           
                const entries = Api.getEntries(annotation, mId, aId, authSeqNumber[i], insCode[i] || '');
                if (!entries) {
                    map[i] = 3;
                    continue;
                }
                const e = entries[0];
                if (e.type === 'IL') map[i] = 0;
                else if (e.type === 'HL') map[i] = 1;
                else if (e.type === 'J3') map[i] = 2;
                else map[i] = 3;                    
            }            
            return map;            
        }
    
        export function create(entity: Bootstrap.Entity.Molecule.Model, report: any) {
            const model = entity.props.model;
            const map = model.source === Core.Structure.Molecule.Model.Source.File 
                ? createResidueMapNormal(model, report)
                : createResidueMapComputed(model, report);
            
            const colors = Core.Utils.FastMap.create<string, LiteMol.Visualization.Color>();
            colors.set('Uniform', defaultColor)
            colors.set('Selection', selectionColor)
            colors.set('Highlight', highlightColor);
            const residueIndex = model.data.atoms.residueIndex;            
            
            const mapping = Visualization.Theme.createColorMapMapping(i => map[residueIndex[i]], colorMap, defaultColor);
            return Visualization.Theme.createMapping(mapping, { colors, interactive: true, transparency: { alpha: 1.0 } });
        }                
    }
    
    const Create = Bootstrap.Tree.Transformer.create<Entity.Data.String, LoopAnnotation, { id?: string }>({
            id: 'rna-loops-create',
            name: 'RNA Loops',
            description: 'Create the RNA loop annotation object from a string.',
            from: [Entity.Data.String],
            to: [LoopAnnotation],
            defaultParams: () => ({})
        }, (context, a, t) => { 
            return Bootstrap.Task.create<LoopAnnotation>(`RNA Loop Annotation (${t.params.id})`, 'Normal', async ctx => {
                await ctx.updateProgress('Parsing...');               

                const entries = Api.parseCSV(a.props.data);
                if (!entries.length) {
                    throw new Error(`No RNA loop annotation for '${t.params.id}' is available.`);
                }
                const annotation = Api.create(entries);
                return LoopAnnotation.create(t, { label: 'RNA Loop Annotation', behaviour: new Interactivity.Behaviour(context, annotation) });
            }).setReportTime(true);
        }       
    );

    export interface DownloadAndCreateProps { server: string, reportRef?: string }
    export const DownloadAndCreate = Bootstrap.Tree.Transformer.actionWithContext<Entity.Molecule.Molecule, Entity.Action, DownloadAndCreateProps, { reportRef: string }>({
        id: 'rna-loops-download-and-create',
        name: 'BGSU RNA Loop Annotation',
        description: 'Download RNA loop annotation from BGSU',
        from: [Entity.Molecule.Molecule],
        to: [Entity.Action],
        defaultParams: (ctx) => ({ server: ctx.settings.get('extensions.rnaLoops.defaultServer') })
    }, (context, a, t) => {        
        const id = a.props.molecule.id.trim().toLocaleUpperCase();                 
        const reportRef = t.params.reportRef || Bootstrap.Utils.generateUUID();
        const action = Bootstrap.Tree.Transform.build()
            .add(a, Transformer.Data.Download, { url: t.params.server.replace('#id', id), type: 'String', id, description: 'Annotation Data', title: 'RNA Annotation' })
            .then(Create, { id }, { isBinding: true, ref: reportRef });

        return { action, context: { reportRef} };
    }, (ctx, actionCtx) => {
        if (!actionCtx || !ctx.select(actionCtx.reportRef).length) {
            ctx.logger.error('Failed to load BGSU RNA annotation. Possible causes: no annotation available, server is down, server does not support HTTPS (use http:// in LiteMol URL to fix).');
            return;
        }
        ctx.logger.info('BGSU RNA annotation loaded. Hovering over RNA residue will now contain loop info. To apply coloring, select the entity in the tree and apply it the right panel.');
    });

    export const ApplyTheme = Bootstrap.Tree.Transformer.create<LoopAnnotation, Entity.Action, { }>({
        id: 'rna-loops-apply-theme',
        name: 'Apply Coloring',
        description: 'Colors RNA strands according to annotation of secondary structure loops.',
        from: [LoopAnnotation],
        to: [Entity.Action],
        defaultParams: () => ({})  
    }, (context, a, t) => {        
            return Bootstrap.Task.create<Entity.Action>('RNA Annotation Coloring', 'Background', async ctx => {            
            const molecule = Bootstrap.Tree.Node.findAncestor(a, Bootstrap.Entity.Molecule.Molecule);
            if (!molecule)  {
                throw 'No suitable parent found.';
            } 
                
            const themes = Core.Utils.FastMap.create<number, Visualization.Theme>();      
            const visuals = context.select(Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(Bootstrap.Entity.Molecule.Visual));            
            for (const v of visuals) {
                const model = Bootstrap.Utils.Molecule.findModel(v);
                if (!model) continue;                
                let theme = themes.get(model.id);                
                if (!theme) {
                    theme = Theme.create(model, a.props.behaviour.annotation);
                    themes.set(model.id, theme);
                }                
                Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v as any, theme });
            }                                   
            context.logger.message('RNA annotation coloring applied.');
            return Bootstrap.Tree.Node.Null;
        });
    });
}