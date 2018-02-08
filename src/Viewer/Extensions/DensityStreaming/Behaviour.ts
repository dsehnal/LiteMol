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
    
    const ToastKey = '__ShowDynamicDensity-toast';

    type Box = { a: number[], b: number[] };

    type Channel = Core.Formats.Density.Data
    
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
        private selectionBox: Box | undefined = void 0;
        private modelBoundingBox: Box | undefined = void 0;
        private channels: { [name: string]: Channel } | undefined = void 0;
        private cache = Bootstrap.Utils.LRUCache.create<{ [name: string]: Channel }>(25);
        private performance = new Core.Utils.PerformanceMonitor();
        private wasCached = false;

        private types: FieldType[];

        private areBoxesSame(b: Box) {
            if (!this.selectionBox) return false;
            for (let i = 0; i < 3; i++) {
                if (b.a[i] !== this.selectionBox.a[i] || b.b[i] !== this.selectionBox.b[i]) return false;
            }
            return true;
        } 

        private getModelBoundingBox(): Box {
            if (this.modelBoundingBox) return this.modelBoundingBox;
            const sourceMolecule = Utils.Molecule.findMolecule(this.behaviour)!;
            const { bottomLeft: a, topRight: b } = Utils.Molecule.getBox(sourceMolecule.props.molecule.models[0], sourceMolecule.props.molecule.models[0].data.atoms.indices, this.params.showEverythingExtent);
            this.modelBoundingBox = { a, b};
            return this.modelBoundingBox;
        }

        private stop() {
            if (this.download) {
                this.download.tryAbort();
                this.download = void 0;
            }
        }

        private remove(ref: string) {
            for (const e of this.context.select(ref)) Bootstrap.Tree.remove(e);
            this.groups.toBeRemoved.delete(ref);
        }

        private clear() {
            this.stop();
            this.groups.requested.forEach(g => this.groups.toBeRemoved.add(g));
            this.groups.locked.forEach(g => this.groups.toBeRemoved.add(g));
            this.groups.shown.forEach(g => { if (!this.groups.locked.has(g)) this.remove(g); });
            this.groups.shown.clear();
            this.channels = void 0;
        }

        private groupDone(ref: string, ok: boolean) {
            this.groups.requested.delete(ref);
            if (this.groups.toBeRemoved.has(ref)) {
                this.remove(ref);
            } else if (ok) {
                this.groups.shown.add(ref);
            }
        }

        private checkResult(data: Core.Formats.CIF.File) {
            const server = data.dataBlocks.filter(b => b.header === 'SERVER')[0];
            if (!server) return false;
            const cat = server.getCategory('_density_server_result');
            if (!cat) return false;
            if (cat.getColumn('is_empty').getString(0) === 'yes' || cat.getColumn('has_error').getString(0) === 'yes') {
                return false;
            }
            return true;
        }

        private apply(b: Bootstrap.Tree.Transform.Builder) {
            return Bootstrap.Tree.Transform.apply(this.context, b).run();
        }

        private finish() {
            this.performance.end('query');
            this.context.logger.info(`[Density] Streaming done in ${this.performance.formatTime('query')}${this.wasCached ? ' (cached)' : ''}.`);
        }

        private async createXray() {
            try {
                if (!this.channels) return;

                this.syncStyles();

                const twoF = this.channels!['2FO-FC'];
                const oneF = this.channels!['FO-FC'];
                
                const action = Bootstrap.Tree.Transform.build();
                const ref = Utils.generateUUID();
                this.groups.requested.add(ref);
                const group = action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref, isHidden: true })

                const styles = this.params;

                group.then(Transformer.Density.CreateFromData, { id: '2Fo-Fc', data: twoF }, { ref: ref + '2Fo-Fc-data' })
                group.then(Transformer.Density.CreateFromData, { id: 'Fo-Fc', data: oneF }, { ref: ref + 'Fo-Fc-data' });
            
                await this.apply(action);            
                const a = this.apply(Bootstrap.Tree.Transform.build().add(ref + '2Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['2Fo-Fc'] }, { ref: ref + '2Fo-Fc' }));
                const b = this.apply(Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(+ve)'] }, { ref: ref + 'Fo-Fc(+ve)' }));
                const c = this.apply(Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(-ve)'] }, { ref: ref + 'Fo-Fc(-ve)' }));
                await a;
                await b;
                await c;

                this.finish();
                this.groupDone(ref, true);
            } catch (e) {
                this.context.logger.error('[Density] ' + e);
            }
        }

        private createEm() {
            try {
                if (!this.channels) return;

                this.syncStyles();

                const emd = this.channels!['EM'];

                const action = Bootstrap.Tree.Transform.build();
                const ref = Utils.generateUUID();
                this.groups.requested.add(ref);
                const styles = this.params;
                
                action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref, isHidden: true })
                    .then(Transformer.Density.CreateFromData, { id: 'EM', data: emd })
                    .then(Transformer.Density.CreateVisual, { style: styles['EM'] }, { ref: ref + 'EM' });
                
                Bootstrap.Tree.Transform.apply(this.context, action).run()
                    .then(() => { this.finish(); this.groupDone(ref, true); })
                    .catch(() => this.groupDone(ref, false));
            } catch (e) {
                this.context.logger.error('[Density] ' + e);
            }
        }

        private extendSelectionBox(): Box {
            const { a, b } = this.selectionBox!;
            const r = this.params.radius;
            return {
                a: a.map(v => v - r),
                b: b.map(v => v + r),
            }
        }

        private isSameMolecule(info: Interactivity.Info.Selection) {
            const sourceMolecule = Utils.Molecule.findMolecule(this.behaviour);
            const infoMolecule = Utils.Molecule.findMolecule(info.source);
            return sourceMolecule === infoMolecule;
        }

        private static getChannel(data: Core.Formats.CIF.File, name: string): Channel | undefined {
            const block = data.dataBlocks.filter(b => b.header === name)[0];
            if (!block) {  
                return void 0;
            }

            const density = Core.Formats.Density.CIF.parse(block);
            if (density.isError) return void 0;

            return density.result;
        }

        private noChannels() {
            this.context.logger.warning('Density Streaming: No data.');
            return void 0;
        }

        private parseChannels(data: ArrayBuffer) {
            const cif = Core.Formats.CIF.Binary.parse(data);
            if (cif.isError || !this.checkResult(cif.result)) return this.noChannels();

            if (this.params.source === 'EM') {
                const ch = Behaviour.getChannel(cif.result, 'EM');
                if (!ch) return this.noChannels();
                return { 'EM': ch };
            } else {
                const twoF = Behaviour.getChannel(cif.result, '2FO-FC');
                if (!twoF) return this.noChannels();
                const oneF = Behaviour.getChannel(cif.result, 'FO-FC');
                if (!oneF) return this.noChannels();
                return { '2FO-FC': twoF, 'FO-FC': oneF };
            }
        }

        private query(box?: Box) {
            this.clear(); 
                         
            let url = 
                `${this.server}`
                + `/${this.params.source}`
                + `/${this.params.id}`;

            if (box) {
                const { a, b } = box;
                url += `/box`
                    + `/${a.map(v => Math.round(1000 * v) / 1000).join(',')}`
                    + `/${b.map(v => Math.round(1000 * v) / 1000).join(',')}`;
            } else {
                url += `/cell`;
            }
            url += `?detail=${this.params.detailLevel}`;

            this.performance.start('query');

            const channels = Bootstrap.Utils.LRUCache.get(this.cache, url);
            if (channels) {
                this.clear();
                this.channels = channels;
                this.wasCached = true;
                if (this.params.source === 'EM') this.createEm();
                else this.createXray();
                return;
            }

            this.download = Utils.ajaxGetArrayBuffer(url, 'Density').runWithContext(this.context);
            this.download.result.then(data => {
                this.clear();
                this.channels = this.parseChannels(data) as Behaviour['channels'];
                if (!this.channels) return;
                this.wasCached = false;
                Bootstrap.Utils.LRUCache.set(this.cache, url, this.channels);
                if (this.params.source === 'EM') this.createEm();
                else this.createXray();
            });
        }

        private tryUpdateSelectionDataBox(info: Interactivity.Info) {
            const i = info as Interactivity.Info.Selection;            
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info) || !this.isSameMolecule(i)) {
                const changed = this.selectionBox !== void 0;
                this.selectionBox = void 0;
                return changed;
            }
                                   
            const model = Utils.Molecule.findModel(i.source)!;
            let elems = i.elements;
            const m = model.props.model;
            if (i.elements!.length === 1) {
                elems = Utils.Molecule.getResidueIndices(m, i.elements![0]);
            }                         
            const { bottomLeft:a, topRight:b } = Utils.Molecule.getBox(m, elems!, 0);   
            const box: Box = { a, b };
            if (this.areBoxesSame(box)) {
                return false;
            } else {
                this.selectionBox = box;
                return true;
            }
        }

        private async update() {
            Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });

            if (this.params.displayType === 'Everything') {
                if (this.params.source === 'EM') {
                    if (this.params.forceBox) this.query(this.getModelBoundingBox());
                    else this.query();
                } else {
                    this.query(this.getModelBoundingBox());
                }
            } else {
                if (this.selectionBox) {
                    this.query(this.extendSelectionBox());
                } else {
                    this.clear();                    
                }
            }
        }

        private toSigma(type: FieldType) {;
            const index = this.params.header.channels.indexOf(IsoInfo[type].dataKey);
            const valuesInfo = this.params.header.sampling[0].valuesInfo[index];
            const value = this.params.isoValues[type]!;
            return (value - valuesInfo.mean) / valuesInfo.sigma;
        }
        
        private syncStyles() {
            const taskType: Bootstrap.Task.Type = this.params.displayType === 'Everything'
                ? 'Background' : (this.params.radius > 15 ? 'Background' : 'Silent');
            
            const isSigma = this.params.isoValueType === Bootstrap.Visualization.Density.IsoValueType.Sigma;
            for (const t of this.types) {

                const oldStyle = this.params[t]!;
                const oldParams = oldStyle.params;
                const isoValue = isSigma 
                    ? this.params.isoValues[t]!
                    : this.toSigma(t);

                this.params[t] = { ...oldStyle, taskType, params: { ...oldParams, isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma, isoValue } };
            }
        }

        private updateVisual(v: Entity.Density.Visual, style: Bootstrap.Visualization.Density.Style) {
            return Entity.Transformer.Density.CreateVisual.create({ style }, { ref: v.ref }).update(this.context, v).run();
        }

        private async invalidateStyles() {
            if (this.groups.shown.size === 0) return;

            this.syncStyles();
            const styles = this.params; 

            // cache the refs and lock them
            const refs: string[] = [];
            this.groups.shown.forEach(r => {
                refs.push(r);
                this.groups.locked.add(r);
            });

            // update all the existing visuals.
            for (const t of this.types) {
                const s = styles[t];
                if (!s) continue;
                const vs = this.context.select(Bootstrap.Tree.Selection.byRef(...refs.map(r => r + t)));
                for (const v of vs) {
                    await this.updateVisual(v as Entity.Density.Visual, s);
                }
            }

            // unlock and delete if the request is pending
            for (const r of refs) {
                this.groups.locked.delete(r);
                if (this.groups.toBeRemoved.has(r)) this.remove(r);
            }
        }

        async invalidateParams(newParams: CreateStreamingParams): Promise<void> {
            const oldParams = this.params;

            if (oldParams.displayType !== newParams.displayType 
                || oldParams.detailLevel !== newParams.detailLevel
                || oldParams.radius !== newParams.radius) {
                this.params = newParams;
                this.update();
                return;
            }

            this.params = newParams;
            await this.invalidateStyles();
        }

        dispose() {
            this.clear();
            Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
            for (const o of this.obs) o.dispose();
            this.obs = [];
        }

        register(behaviour: Entity.Behaviour.Any) {
            this.behaviour = behaviour;

            const message = this.params.source === 'X-ray'
                ? 'Streaming enabled, click on a residue or an atom to view the data.'
                : `Streaming enabled, showing full surface. To view higher detail, use 'Around Selection' mode.`;

            Bootstrap.Command.Toast.Show.dispatch(this.context, { key: ToastKey, title: 'Density', message, timeoutMs: 30 * 1000 });

            this.obs.push(this.context.behaviours.select.subscribe(e => {
                if (this.tryUpdateSelectionDataBox(e)) {
                    if (this.params.displayType === 'Around Selection') {
                        this.update();
                    }
                } 
            }));

            if (this.params.displayType === 'Everything') this.update();
        }

        constructor(public context: Bootstrap.Context, public params: CreateStreamingParams) {        
            this.server = params.server;
            if (this.server[this.server.length - 1] === '/') this.server = this.server.substr(0, this.server.length - 1);

            if (params.source === 'EM') {
                this.types = ['EM'];
            } else {
                this.types = ['2Fo-Fc', 'Fo-Fc(+ve)', 'Fo-Fc(-ve)'];
            }
        }
    }
}