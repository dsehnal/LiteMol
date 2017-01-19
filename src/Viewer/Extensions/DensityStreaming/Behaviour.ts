/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.DensityStreaming {
    'use strict';

    import Rx = Bootstrap.Rx
    import Entity = Bootstrap.Entity
    import Transformer = Bootstrap.Entity.Transformer
    import Utils = Bootstrap.Utils
    import Interactivity = Bootstrap.Interactivity
        
    export type FieldSource = 'X-ray' | 'EMD'
    export type DataType = 'EM' | '2FO-FC' | 'FO-FC'
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
        private behaviour: Entity.Behaviour.Any;
        private groups = {
            requested: Core.Utils.FastSet.create<string>(),
            shown: Core.Utils.FastSet.create<string>(),
            locked: Core.Utils.FastSet.create<string>(),
            toBeRemoved: Core.Utils.FastSet.create<string>()
        };
        private download: Bootstrap.Task.Running<ArrayBuffer> | undefined = void 0;
        private dataBox: Box | undefined = void 0;

        private types: FieldType[];

        private areBoxesSame(b: Box) {
            if (!this.dataBox) return false;
            for (let i = 0; i < 3; i++) {
                if (b.a[i] !== this.dataBox.a[i] || b.b[i] !== this.dataBox.b[i]) return false;
            }
            return true;
        } 

        private stop() {
            if (this.download) {
                this.download.tryAbort();
                this.download = void 0;
            }
        }

        private remove(ref: string) {
            for (let e of this.context.select(ref)) Bootstrap.Tree.remove(e);
            this.groups.toBeRemoved.delete(ref);
        }

        private clear() {
            this.stop();
            this.groups.requested.forEach(g => this.groups.toBeRemoved.add(g));
            this.groups.locked.forEach(g => this.groups.toBeRemoved.add(g));
            this.groups.shown.forEach(g => { if (!this.groups.locked.has(g)) this.remove(g); });
            this.groups.shown.clear();
            this.dataBox = void 0;
        }

        private groupDone(ref: string, ok: boolean) {
            this.groups.requested.delete(ref);
            if (this.groups.toBeRemoved.has(ref)) {
                this.remove(ref);
            } else if (ok) {
                this.groups.shown.add(ref);
            }
        }

        private updateStyleTaskTypes() {
            let taskType: Bootstrap.Task.Type = this.params.radius > 15 ? 'Background' : 'Silent';
            for (let t of this.types) {
                this.params.styles[t]!.taskType = taskType;
            }
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

        private apply(b: Bootstrap.Tree.Transform.Builder) {
            return Bootstrap.Tree.Transform.apply(this.context, b).run();
        }

        private async createXray(data: Core.Formats.CIF.File) {
            try {
                let twoFB = data.dataBlocks.filter(b => b.header === '2FO-FC')[0];
                let oneFB = data.dataBlocks.filter(b => b.header === 'FO-FC')[0];

                if (!twoFB || !oneFB) return;

                let twoF = Core.Formats.Density.CIF.parse(twoFB);
                let oneF = Core.Formats.Density.CIF.parse(oneFB);
                if (twoF.isError || oneF.isError) return;

                let action = Bootstrap.Tree.Transform.build();
                let ref = Utils.generateUUID();
                this.groups.requested.add(ref);
                let group = action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref, isHidden: true })

                let styles = this.params.styles; 

                group.then(Transformer.Density.CreateFromData, { id: '2Fo-Fc', data: twoF.result }, { ref: ref + '2Fo-Fc-data' })
                group.then(Transformer.Density.CreateFromData, { id: 'Fo-Fc', data: oneF.result }, { ref: ref + 'Fo-Fc-data' });
            
                await this.apply(action);            
                let a = this.apply(Bootstrap.Tree.Transform.build().add(ref + '2Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['2Fo-Fc'] }, { ref: ref + '2Fo-Fc' }));
                let b = this.apply(Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(+ve)'] }, { ref: ref + 'Fo-Fc(+ve)' }));
                let c = this.apply(Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(-ve)'] }, { ref: ref + 'Fo-Fc(-ve)' }));
                await a;
                await b;
                await c;

                this.groupDone(ref, true);
            } catch (e) {
                this.context.logger.error('[Density] ' + e);
            }
        }

        private createEmd(data: Core.Formats.CIF.File) {
            let emdB = data.dataBlocks.filter(b => b.header === 'EM')[0];
            if (!emdB) return false;

            let emd = Core.Formats.Density.CIF.parse(emdB);
            if (emd.isError) return false;

            let action = Bootstrap.Tree.Transform.build();
            let ref = Utils.generateUUID();
            this.groups.requested.add(ref);
            let styles = this.params.styles;//  this.updateStyles(box);
            
            action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref, isHidden: true })
                .then(Transformer.Density.CreateFromData, { id: 'EMD', data: emd.result })
                .then(Transformer.Density.CreateVisual, { style: styles['EMD'] }, { ref: ref + 'EMD' });
            
            Bootstrap.Tree.Transform.apply(this.context, action).run()
                .then(() => this.groupDone(ref, true))
                .catch(() => this.groupDone(ref, false));

            return true;
        }

        private clampBox(box: Box) {
            let max = this.params.maxQueryRegion;
            for (let i = 0; i < 3; i++) {
                let d = box.b[i] - box.a[i];
                if (d < max[i]) continue;
                let r = max[i] / 2;
                let m = 0.5 * (box.b[i] + box.a[i]);
                box.a[i] = m - r;
                box.b[i] = m + r;
            }
            return box;
        }

        private update(info: Interactivity.Info ) {            
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                this.clear();
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
            let box: Box = this.clampBox({ a, b });

            if (this.areBoxesSame(box)) return;

            this.clear(); 
             
            let url = 
                `${this.server}`
                + `/${this.params.source}`
                + `/${this.params.id}`
                + `/${a.map(v => Math.round(1000 * v) / 1000).join(',')}`
                + `/${b.map(v => Math.round(1000 * v) / 1000).join(',')}`;
            
            this.download = Utils.ajaxGetArrayBuffer(url, 'Density').runWithContext(this.context);

            this.download.result.then(data => {
                this.clear();

                this.dataBox = box;
                let cif = Core.Formats.CIF.Binary.parse(data);
                if (cif.isError || !this.checkResult(cif.result)) return; 

                this.updateStyleTaskTypes();
                if (this.params.source === 'EMD') this.createEmd(cif.result);
                else this.createXray(cif.result);
            });
        }

        private updateVisual(v: Entity.Density.Visual, style: Bootstrap.Visualization.Density.Style) {
            return Entity.Transformer.Density.CreateVisual.create({ style }, { ref: v.ref }).update(this.context, v).run();
        }

        private async invalidate(inputStyles: CreateStreamingParams): Promise<boolean> {
            for (let t of this.types) {
                this.params.styles[t] = inputStyles[t];
            }

            if (!this.dataBox) return true;

            this.updateStyleTaskTypes();
            let styles = this.params.styles; 

            // cache the refs and lock them
            let refs: string[] = [];
            this.groups.shown.forEach(r => {
                refs.push(r)
                this.groups.locked.add(r);
            });

            // update all the existing visuals.
            for (let t of this.types) {
                let s = styles[t];
                if (!s) continue;
                let vs = this.context.select(Bootstrap.Tree.Selection.byRef(...refs.map(r => r + t)));
                for (let v of vs) {
                    await this.updateVisual(v as Entity.Density.Visual, s);
                }
            }

            // unlock and delete if the request is pending
            for (let r of refs) {
                this.groups.locked.delete(r);
                if (this.groups.toBeRemoved.has(r)) this.remove(r);
            }

            return true;
        }

        async invalidateStyles(styles: CreateStreamingParams): Promise<boolean> {
            try {
                return this.invalidate(styles);
            } catch (e) {
                return true;
            }
        }

        dispose() {
            this.clear();
            Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
            for (let o of this.obs) o.dispose();
            this.obs = [];
        }

        register(behaviour: Entity.Behaviour.Any) {
            this.behaviour = behaviour;

            Bootstrap.Command.Toast.Show.dispatch(this.context, { key: ToastKey, title: 'Density', message: 'Streaming enabled, click on a residue or an atom to view the data.', timeoutMs: 30 * 1000 });

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