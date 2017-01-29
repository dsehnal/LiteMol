/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Components.Visualization {
    "use strict";

    import Vis = LiteMol.Visualization;
    export class Viewport extends Component<Vis.SceneOptions> {

        private _scene: Bootstrap.Visualization.SceneWrapper;

        get scene() {
            return this._scene;
        }
        
        init(element: HTMLElement): boolean {
            if (!LiteMol.Visualization.checkWebGL()) return false;
            
            try {            
                this._scene = new Bootstrap.Visualization.SceneWrapper(element, this.context, this.latestState);
                this.context.scene = this._scene;
                return true;
            } catch(e) {
                return false;
            }
        }

        destroy() {
            if (this._scene) {
                this._scene.destroy();
                this._scene = <any>null;
            }
        }
        
        constructor(context: Context) {
            super(context, Bootstrap.Utils.shallowClone(Vis.DefaultSceneOptions));
                                    
            Event.Common.LayoutChanged.getStream(this.context).subscribe(e => {
                if (this._scene) this._scene.scene.resized();
            });
            
            Command.Layout.SetViewportOptions.getStream(this.context).subscribe(e => this.setState(e.data) );
                        
            this.state.throttle(1000 / 30).subscribe(s => {
                this.scene.scene.updateOptions(s);
            });
        }
    }
}