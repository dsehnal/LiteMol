/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Behaviour {
    "use strict";
    
    export class Streams {
        
        private subjects = {
            select: new Rx.BehaviorSubject<Interactivity.Info>({}),
            click: new Rx.BehaviorSubject<Interactivity.Info>({}),
            currentEntity: new Rx.BehaviorSubject<Entity.Any>(void 0)
        }
        
        select = this.subjects.select.distinctUntilChanged(i => i, Interactivity.interactivityInfoEqual);
        click = this.subjects.click.distinctUntilChanged(i => i, Interactivity.interactivityInfoEqual);
        currentEntity = this.subjects.currentEntity as Rx.Observable<Entity.Any>;
        
        private init() {            
            let emptyClick = {};
            let latestClick: Interactivity.Info = emptyClick;
            
            Event.Tree.NodeRemoved.getStream(this.context).subscribe(e => {            
                if ((latestClick !== emptyClick) && (latestClick.entity === e.data || latestClick.visual === e.data)) {
                    latestClick = emptyClick;    
                    Event.Visual.VisualSelectElement.dispatch(this.context, {});            
                }
            }); 
                                    
            Event.Visual.VisualSelectElement.getStream(this.context).subscribe(e => {
                latestClick = e.data.entity ? e.data : emptyClick;
                this.subjects.click.onNext(e.data);                            
                if (e.data.visual && !e.data.visual.props.isSelectable) return;
                this.subjects.select.onNext(e.data)
            });  
            
            Event.Entity.CurrentChanged.getStream(this.context).subscribe(e => this.subjects.currentEntity.onNext(e.data));
        }
        
        constructor(public context: Context) {
            this.init();
        }
    }
}