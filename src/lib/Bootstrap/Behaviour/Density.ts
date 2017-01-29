/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Behaviour.Density {
    "use strict";
        
    export interface ShowDynamicDensityParams {        
        style: Visualization.Density.Style,
        showFull: boolean,
        radius: number        
    }

    const ToastKey = '__ShowDynamicDensity-toast';
    
    export class ShowDynamicDensity implements Dynamic {
        
        private obs: Rx.IDisposable[] = [];
        private behaviour: Entity.Behaviour.Any;
        private ref = Utils.generateUUID();
        
        private remove() {
            let v = this.getVisual();
            if (v) {
                Tree.remove(v);
            }
        }
        
        private getVisual() {
            return this.context.select(this.ref)[0] as Entity.Density.Visual;
        }
           
        private update(info: Interactivity.Info ) {            
            if (!this.params.showFull && !Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                this.remove();
                return;
            }

            Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
            
            let style = Utils.shallowClone(this.params.style);
            style.params = Utils.shallowClone(style.params);

            if (this.params.showFull) {
                style.params!.bottomLeft = void 0;
                style.params!.topRight = void 0;
                style.taskType = 'Normal';
            } else {
                let i = info as Interactivity.Info.Selection;
                let model = Utils.Molecule.findModel(i.source)!;
                let elems = i.elements;
                let m = model.props.model;
                if (i.elements!.length === 1) {
                    elems = Utils.Molecule.getResidueIndices(m, i.elements![0]);
                }                         
                let box = Utils.Molecule.getBox(m, elems!, this.params.radius);   

                style.params!.bottomLeft = box.bottomLeft;
                style.params!.topRight = box.topRight;
                style.taskType = 'Silent';
            }
            
            let task: Core.Computation<any>;
            
            let visual = this.getVisual();       
            if (!visual) {
                let t = Entity.Transformer.Density.CreateVisual.create({ style }, { ref: this.ref, isHidden: true });
                t.isUpdate = true;
                task = t.apply(this.context, <any>this.behaviour)
            }
            else task = Entity.Transformer.Density.CreateVisual.create({ style }, { ref: this.ref, isHidden: true }).update(this.context, visual);
            
            task.run();   
        }

        updateTheme(ti: Visualization.Theme.Instance) {
            this.params.style.theme = ti;
            if (!this.behaviour) return;
            let v = this.getVisual();
            if (!v) return;
            let source = Tree.Node.findClosestNodeOfType(this.behaviour, [Entity.Density.Data]) as Entity.Density.Data;
            let theme = ti.template!.provider(source, Visualization.Theme.getProps(ti));
            v.props.model.applyTheme(theme);
        }
        
        dispose() {
            this.remove();
            Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
            for (let o of this.obs) o.dispose();
            this.obs = [];
        }
        
        register(behaviour: Entity.Behaviour.Any) {
            this.behaviour = behaviour;

            if (!this.params.showFull) {
                Command.Toast.Show.dispatch(this.context, { key: ToastKey, title: 'Density', message: 'Click on a residue or an atom to view the data.', timeoutMs: 30 * 1000 });
            }

            this.obs.push(this.context.behaviours.select.subscribe(e => {                
                this.update(e);
            }));
        }
                
        constructor(public context: Context, public params: ShowDynamicDensityParams) {            
        }
    }
}