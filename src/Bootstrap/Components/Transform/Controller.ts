/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Transform {
    "use strict";
    
    export interface ControllerParams<P> {
        params: P, 
        isDirty: boolean, 
        issues: string[] | undefined, 
        canApply: boolean, 
        isBusy: boolean, 
        parametersAutoUpdating: boolean
    }

    export class Controller<P> extends Component<ControllerParams<P>> {        
        private updateTimeout = new Rx.Subject<Rx.Observable<number>>();
        private timeout = Rx.Observable.timer(50);
        private never = Rx.Observable.never<number>();
        
        private _update() {
            if (this.isUpdate && !this.latestState.isBusy) {
                if (this.updateTimeout) {
                    this.updateTimeout.onNext(this.timeout);
                    this.setState({ parametersAutoUpdating: true });  
                } 
            }
        }
        
        private _reset() {
            this.setState({ parametersAutoUpdating: false });
            if (this.updateTimeout) this.updateTimeout.onNext(this.never);
        }
            
        private anchorParams: P;
        
        private _updateParams(params: Partial<P>) {            
            let updated = Utils.merge(this.latestState.params, params);       
            if (this.transformer.info.validateParams) {
                let isInvalid = this.transformer.info.validateParams(updated);
                if (isInvalid && isInvalid.length > 0) {
                    this.setState(<any>{ params: updated, issues: isInvalid, canApply: false });
                    return;
                }
            }
            let isDirty = !Utils.deepEqual(this.anchorParams, updated);
            this.setState({ params: updated, isDirty, issues: void 0, canApply: true });
        }
        
        updateParams(params: Partial<P>) {
            this._reset();
            this._updateParams(params);   
        }
        
        autoUpdateParams(params: Partial<P>) {
            this._update();
            this._updateParams(params);
        }
        
        get isUpdate() {
            return  this.transformer === this.entity.transform.transformer;
        }
        
        apply() {            
            this._reset();
            if (this.latestState.isBusy) return;
            
            let transform = this.transformer.create(this.latestState.params);
            
            this.anchorParams = this.latestState.params!;
            this.setState({ isDirty: false, isBusy: true });
            
            try {
                let task = this.isUpdate ? transform.update(this.context, this.entity) : transform.apply(this.context, this.entity);            
                let ret = task.run();
                ret.then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false }));
                return ret;
            } catch(e) {
                this.setState({ isBusy: false });
                return Core.Computation.reject(e);
            }
        }     
                
        setParams(params: P) {
            this._reset();
            this.anchorParams = params;
            this.updateParams(params);
        }
                
        constructor(context: Context, public transformer: Tree.Transformer.Any, public entity: Entity.Any) {
            super(context, { 
                params: transformer.info.defaultParams(context, entity),
                canApply: false,
                isBusy: false,
                issues: void 0,
                parametersAutoUpdating: false, 
                isDirty: false 
            });            
            this.anchorParams = this.latestState.params!;    
            this.updateParams(this.anchorParams);
            
            this.updateTimeout.flatMapLatest(t => t).forEach(() => this.apply()); 
        }        
    }    
    
}