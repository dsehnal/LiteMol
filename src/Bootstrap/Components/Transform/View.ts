/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Transform {
    "use strict";
 
    export class View extends Component<{ update: Controller<any> | undefined, transforms: Controller<any>[] }> {                        
        private update() {
            if (!this.context.currentEntity) {
                this.setState({ transforms: [] });
                return;
            }

            let e = this.context.currentEntity;
            let manager = this.context.transforms;
            
            let update: Controller<any> | undefined = void 0;
            if (e.transform.transformer && e.transform.transformer.info.isUpdatable /*&& !e.transform.props.isBinding*/) {
                update = manager.getController(e.transform.transformer, e);
            }

            let transforms: Controller<any>[] = [] 
            for (let t of this.context.transforms.getBySourceType(e.type as Entity.AnyType)) {
                if (t.info.isApplicable && !t.info.isApplicable(e)) {
                    continue;
                }
                let c = manager.getController(t, e);
                if (c) transforms.push(c);
                //this.setParams(c);                
            }            
            this.setState({ update, transforms });            
        }
                
        constructor(context: Context) {
            super(context, { update: void 0, transforms: [] });
            
            this.update();
            Event.Entity.CurrentChanged.getStream(context).subscribe(() => this.update());                  
        }        
    }   
}