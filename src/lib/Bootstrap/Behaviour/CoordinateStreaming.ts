/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Behaviour.Molecule {
    "use strict";
    
    
    import Transforms = Entity.Transformer;
    
    export class CoordinateStreaming implements Dynamic {
        
        private obs: Rx.IDisposable[] = [];  
        private target: Entity.Molecule.Model | undefined = void 0; 
        private behaviour: Entity.Behaviour.Any = <any>void 0;
        private ref: string = Utils.generateUUID();
        private download: Task.Running<ArrayBuffer> | undefined = void 0;
        private cache = Utils.LRUCache.create<ArrayBuffer>(100);
        
        server: string;
        
        private remove() {
            if (this.download) {
                this.download.tryAbort();
                this.download = void 0;
            }
            Command.Tree.RemoveNode.dispatch(this.context, this.ref);
        }
                
        private isApplicable(info: Interactivity.Info): info is Interactivity.Info.Selection {
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) return false;
            return Tree.Node.hasAncestor(info.source, this.target!);
        }
           
        private style: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
            type: 'BallsAndSticks',
            taskType: 'Silent',
            params: { useVDW: true, vdwScaling: 0.17, bondRadius: 0.07, detail: 'Automatic' },
            theme: { template: Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 1.0 } },
            isNotSelectable: true
        }      
        
        private update(info: Interactivity.Info) {
            this.remove();
            if (!this.isApplicable(info)) {
                return;
            }
            
            let model = Utils.Molecule.findModel(info.source)!.props.model;
            
            let i = model.data.atoms.residueIndex[info.elements![0]];
            let rs = model.data.residues;
            
            let authAsymId = rs.authAsymId[i];
            let transform: number[] | undefined = void 0;
            
            if (model.source === Core.Structure.Molecule.Model.Source.Computed) {
                let p = model.parent!;
                let cI = rs.chainIndex[i];
                let chain = model.data.chains.sourceChainIndex[cI];
                authAsymId = p.data.chains.authAsymId[chain];
                transform = model.operators![model.data.chains.operatorIndex![cI]].matrix;
            }            
            
            let url = 
                `${this.server}/`
                + `${model.id.toLocaleLowerCase()}/ambientResidues?`
                + `modelId=${encodeURIComponent(model.modelId)}&`
                + `entityId=${encodeURIComponent(rs.entityId[i])}&`
                + `authAsymId=${encodeURIComponent(authAsymId)}&`
                + `authSeqNumber=${encodeURIComponent(''+rs.authSeqNumber[i])}&`
                + `insCode=${encodeURIComponent(rs.insCode[i] !== null ? rs.insCode[i]! : '')}&`
                + `radius=${encodeURIComponent(''+this.radius)}&`
                + `atomSitesOnly=1&`
                + `encoding=bcif&`
                + `lowPrecisionCoords=1`;
             
            this.download = Utils.ajaxGetArrayBuffer(url).runWithContext(this.context);
                       
            let cached = Utils.LRUCache.get(this.cache, url); 
            if (cached) {
                this.create(cached, transform);
            } else {                        
                this.context.performance.start(this.ref);
                this.download.result.then(data => {            
                    Utils.LRUCache.set(this.cache, url, data);
                    this.context.performance.end(this.ref);
                    this.context.logger.info(`Streaming done in ${this.context.performance.formatTime(this.ref)}`);
                    this.create(data, transform);
                }).catch(() => { this.context.performance.end(this.ref); });
            }
            
        }  
        
        private create(data: ArrayBuffer, transform: number[] | undefined) {
            let action = Tree.Transform.build().add(this.behaviour as Entity.Molecule.CoordinateStreaming.Behaviour, Entity.Transformer.Molecule.CoordinateStreaming.CreateModel, { data, transform }, { ref: this.ref, isHidden: true })
                    .then(Transforms.Molecule.CreateVisual, { style: this.style });
            Tree.Transform.apply(this.context, action).run();
        }
          
        dispose() {
            this.remove();
            for (let o of this.obs) o.dispose();
            this.obs = [];
        }
                
        register(behaviour: Entity.Behaviour.Any) {
            this.behaviour = behaviour;
            this.target = <any>behaviour.parent;
            this.obs.push(this.context.behaviours.select.subscribe(e => this.update(e))); 
        }
        
        constructor(public context: Context, server: string, public radius = 5) {
            this.server = CoordinateStreaming.normalizeServerName(server);
        }
    }   
    
    export namespace CoordinateStreaming {        
        export function normalizeServerName(s: string) {
            if (s[s.length - 1] !== '/') return s;
            if (s.length > 0) return s.substr(0, s.length - 1);
            return s;
        }
        
        export function getBaseUrl(id: string, server: string) {
            return `${normalizeServerName(server)}/${id.trim().toLocaleLowerCase()}/cartoon?encoding=bcif&lowPrecisionCoords=1`; 
        }     
    }
}