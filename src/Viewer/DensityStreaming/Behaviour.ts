/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.DensityStreaming {
    'use strict';

    import Rx = Bootstrap.Rx
    import Entity = Bootstrap.Entity
    import Transformer = Bootstrap.Entity.Transformer
    import Utils = Bootstrap.Utils
    import Interactivity = Bootstrap.Interactivity

    export type FieldSource = 'X-ray' | 'EMD'
    export type FieldType = '2Fo-Fc' | 'Fo-Fc(-ve)' | 'Fo-Fc(+ve)' | 'EMD'

    export const FieldSources: FieldSource[] = ['X-ray', 'EMD' ]  

    export interface BehaviourParams {        
        styles: { [F in FieldType]?: Bootstrap.Visualization.Density.Style },
        source: FieldSource,
        id: string,
        radius: number,
        maxQueryRegion: number[],
        server: string
    }

    const ToastKey = '__ShowDynamicDensity-toast';

    type Box = { a: number[], b: number[] };
    
    export class Behaviour implements Bootstrap.Behaviour.Dynamic {
        private obs: Rx.IDisposable[] = [];
        private server: string;
        private behaviour: Streaming;
        private groups = {
            requested: new Set<string>(),
            shown: new Set<string>(),
            toBeRemoved: new Set<string>()
        };
        private removedGroups = new Set<string>();
        private download: Bootstrap.Task.Running<ArrayBuffer> | undefined = void 0;
        private isBusy = false;
        private latestBox: Box | undefined = void 0;

        private types: FieldType[];

        private areBoxesSame(b: Box) {
            if (!this.latestBox) return false;
            for (let i = 0; i < 3; i++) {
                if (b.a[i] !== this.latestBox.a[i] || b.b[i] !== this.latestBox.b[i]) return false;
            }
            return true;
        } 

        private stop() {
            if (this.download) {
                this.download.discard();
                this.download = void 0;
            }
        }

        private remove() {
            this.stop();
            this.groups.requested.forEach(g => {
                this.groups.toBeRemoved.add(g);
            });
            this.groups.shown.forEach(g => {
                for (let e of this.context.select(g)) Bootstrap.Tree.remove(e);
            });
            this.groups.shown.clear();
            this.latestBox = void 0;
        }

        private groupDone(ref: string, ok: boolean) {
            this.groups.requested.delete(ref);
            if (this.groups.toBeRemoved.has(ref)) {
                for (let e of this.context.select(ref)) Bootstrap.Tree.remove(e);
                this.groups.toBeRemoved.delete(ref);
            } else if (ok) {
                this.groups.shown.add(ref);
            }
        }

        private getVisual(type: FieldType) {
            //return this.context.select(this.groupRef + type)[0] as Entity.Density.Visual;
        }

        private checkResult(data: Core.Formats.CIF.File) {
            let server = data.dataBlocks.filter(b => b.header === 'SERVER')[0];
            if (!server) return false;
            let cat = server.getCategory('_density_server_result');
            if (!cat) return false;
            if (cat.getColumn('is_empty').getString(0) === 'yes' || cat.getColumn('has_error').getString(0) === 'yes') {
                return false;
            }
            return true;
        }

        private updateStyles(box: Box): { [F in FieldType]?: Bootstrap.Visualization.Density.Style } {
            let ret: { [F in FieldType]?: Bootstrap.Visualization.Density.Style } = { }
            for (let t of this.types) {
                let style = Utils.shallowClone(this.params.styles[t]!);
                style.params = Utils.shallowClone(style.params);
                style.params!.bottomLeft = box.a;
                style.params!.topRight = box.b;
                style.computationType = 'Background';
                ret[t] = style;
            }
            return ret;
        }

        private createXray(box: Box, data: Core.Formats.CIF.File) {
            let twoFB = data.dataBlocks.filter(b => b.header === '2FO-FC')[0];
            let oneFB = data.dataBlocks.filter(b => b.header === 'FO-FC')[0];

            if (!twoFB || !oneFB) return false;

            let twoF = Core.Formats.Density.CIF.parse(twoFB);
            let oneF = Core.Formats.Density.CIF.parse(oneFB);
            if (twoF.isError || oneF.isError) return false;

            let action = Bootstrap.Tree.Transform.build();
            let ref = Utils.generateUUID();
            this.groups.requested.add(ref);
            let group = action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref, isHidden: true })

            let styles = this.updateStyles(box);

            let twoFoFc = group.then(Transformer.Density.CreateFromData, { id: '2Fo-Fc', data: twoF.result }, { ref: ref + '2Fo-Fc-data' })
            let foFc = group.then(Transformer.Density.CreateFromData, { id: 'Fo-Fc', data: oneF.result }, { ref: ref + 'Fo-Fc-data' });
            
            Bootstrap.Tree.Transform.apply(this.context, action).run(this.context)
                .then(() => { 
                    let v2fofc = Bootstrap.Tree.Transform.build().add(ref + '2Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['2Fo-Fc'] }, { ref: ref + '2Fo-Fc' });
                    let vfofcp = Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(+ve)'] }, { ref: ref + 'Fo-Fc(+ve)' });
                    let vfofcm = Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(-ve)'] }, { ref: ref + 'Fo-Fc(-ve)' });

                    let done = 0;

                    var update = () => { done++; if (done === 3) this.groupDone(ref, true) };

                    Bootstrap.Tree.Transform.apply(this.context, v2fofc).run(this.context).then(update).catch(update);
                    Bootstrap.Tree.Transform.apply(this.context, vfofcp).run(this.context).then(update).catch(update);
                    Bootstrap.Tree.Transform.apply(this.context, vfofcm).run(this.context).then(update).catch(update);
                })
                .catch(() => this.groupDone(ref, false));
            
            // twoFoFc.then(Transformer.Density.CreateVisual, { style: styles['2Fo-Fc'] }, { ref: ref + '2Fo-Fc' });
            // foFc.then(Transformer.Density.CreateVisual, { style: styles['Fo-Fc(+ve)'] }, { ref: ref + 'Fo-Fc(+ve)' })
            // foFc.then(Transformer.Density.CreateVisual, { style: styles['Fo-Fc(-ve)'] }, { ref: ref + 'Fo-Fc(-ve)' });

            // Bootstrap.Tree.Transform.apply(this.context, action).run(this.context)
            //     .then(() => this.groupDone(ref, true))
            //     .catch(() => this.groupDone(ref, false));
        }

        private createEmd(box: Box, data: Core.Formats.CIF.File) {
            let emdB = data.dataBlocks.filter(b => b.header === 'EM')[0];
            if (!emdB) return false;

            let emd = Core.Formats.Density.CIF.parse(emdB);
            if (emd.isError) return false;

            let action = Bootstrap.Tree.Transform.build();
            let ref = Utils.generateUUID();
            this.groups.requested.add(ref);
            let styles = this.updateStyles(box);
            
            action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref, isHidden: true })
                .then(Transformer.Density.CreateFromData, { id: 'EMD', data: emd.result })
                .then(Transformer.Density.CreateVisual, { style: styles['EMD'] }, { ref: ref + 'EMD' });
            
            Bootstrap.Tree.Transform.apply(this.context, action).run(this.context)
                .then(() => this.groupDone(ref, true))
                .catch(() => this.groupDone(ref, false));
        }

        private update(info: Interactivity.Info ) {            
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                this.remove();
                return;
            }

            Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
            
           
            let i = info as Interactivity.Info.Selection;
            let model = Utils.Molecule.findModel(i.source)!;
            let elems = i.elements;
            let m = model.props.model;
            if (i.elements!.length === 1) {
                elems = Utils.Molecule.getResidueIndices(m, i.elements![0]);
            }                         
            let { bottomLeft:a, topRight:b } = Utils.Molecule.getBox(m, elems!, this.params.radius);   
            let box: Box = { a, b };

            if (this.areBoxesSame(box)) return;

            this.remove(); 
             
            let url = 
                `${this.server}`
                + `/${this.params.source}`
                + `/${this.params.id}`
                + `/${a.map(v => Math.round(1000 * v) / 1000).join(',')}`
                + `/${b.map(v => Math.round(1000 * v) / 1000).join(',')}`;
            
            this.download = Utils.ajaxGetArrayBuffer(url, 'Density').run(this.context);

            this.download.then(data => {
                this.remove();

                let cif = Core.Formats.CIF.Binary.parse(data);
                if (cif.isError || !this.checkResult(cif.result)) return; 

                if (this.params.source === 'EMD') this.createEmd(box, cif.result);
                else this.createXray(box, cif.result);
            });
        }

        dispose() {
            this.remove();
            Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
            for (let o of this.obs) o.dispose();
            this.obs = [];
        }

        register(behaviour: Streaming) {
            this.behaviour = behaviour;

            Bootstrap.Command.Toast.Show.dispatch(this.context, { key: ToastKey, title: 'Density', message: 'Click on a residue or an atom to view the data.', timeoutMs: 30 * 1000 });

            this.obs.push(this.context.behaviours.select.subscribe(e => {                
                this.update(e);
            }));
        }

        constructor(public context: Bootstrap.Context, public params: BehaviourParams) {        
            this.server = params.server;
            if (this.server[this.server.length - 1] === '/') this.server = this.server.substr(0, this.server.length - 1);

            if (params.source === 'EMD') {
                this.types = ['EMD'];
            } else {
                this.types = ['2Fo-Fc', 'Fo-Fc(+ve)', 'Fo-Fc(-ve)'];
            }
        }
    }
}