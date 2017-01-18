/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Behaviour {
    "use strict";
    
    export class Streams {
        
        private subjects = {
            select: new Rx.BehaviorSubject<Interactivity.Info>(Interactivity.Info.empty),
            click: new Rx.BehaviorSubject<Interactivity.Info>(Interactivity.Info.empty),
            currentEntity: new Rx.BehaviorSubject<Entity.Any | undefined>(void 0)
        }
        
        select = this.subjects.select.distinctUntilChanged(i => i, Interactivity.interactivityInfoEqual);
        click = this.subjects.click.distinctUntilChanged(i => i, Interactivity.interactivityInfoEqual);
        currentEntity = this.subjects.currentEntity as Rx.Observable<Entity.Any | undefined>;
        
        private init() {            
            let latestClick: Interactivity.Info = Interactivity.Info.empty;
            
            Event.Tree.NodeRemoved.getStream(this.context).subscribe(e => {            
                if (Interactivity.isSelection(latestClick) && latestClick.source === e.data) {
                    latestClick = Interactivity.Info.empty;    
                    Event.Visual.VisualSelectElement.dispatch(this.context, latestClick);            
                }
            }); 
                                    
            Event.Visual.VisualSelectElement.getStream(this.context).subscribe(e => {
                latestClick = e.data;
                this.subjects.click.onNext(latestClick);                            
                if (Interactivity.isSelection(latestClick) && Entity.isVisual(latestClick.source) && !latestClick.source.props.isSelectable) return;
                this.subjects.select.onNext(latestClick)
            });  
            
            Event.Entity.CurrentChanged.getStream(this.context).subscribe(e => this.subjects.currentEntity.onNext(e.data));
        }
        
        constructor(public context: Context) {
            this.init();
        }
    }
}