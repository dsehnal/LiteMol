/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Event {
    "use strict";
    
    import Lane = Service.Dispatcher.Lane;
    
    export const Log = create<Service.Logger.Entry>('bs.Log', Lane.Log);
        
    export namespace Common {         
        export const LayoutChanged = create('bs.Common.LayoutChanged', Lane.Slow);
        export const ComponentsChanged = create('bs.Common.ComponentsChanged', Lane.Slow);
    }
    
    export namespace Task {
        export const Started = create<Bootstrap.Task.Info>('bs.Tasks.Started', Lane.Task);
        export const Completed = create<number>('bs.Tasks.Completed', Lane.Task);
        export const StateUpdated = create<Bootstrap.Task.State>('bs.Tasks.StateUpdated', Lane.Busy);        
    }
    
    export namespace Tree {        
        import Node = Bootstrap.Tree.Node.Any;
        
        export const NodeUpdated = create<Node>('bs.Tree.NodeUpdated', Lane.Slow);
        export const NodeAdded = create<Node>('bs.Tree.NodeAdded', Lane.Slow);
        export const NodeRemoved = create<Node>('bs.Tree.NodeRemoved', Lane.Slow);
        
        export const TransformStarted = create<Bootstrap.Tree.Transform.Any>('bs.Tree.TransformStarted', Lane.Slow);
        export const TransformFinished = create<{ transform: Bootstrap.Tree.Transform.Any, error?: any }>('bs.Tree.TransformFinished', Lane.Slow);
        
        export const TransformerApply = create<{ a: Bootstrap.Entity.Any, t: Bootstrap.Tree.Transform.Any }>('bs.Tree.TransformerApplied', Lane.Transformer);
    }
        
    export namespace Entity {
        import Entity = Bootstrap.Entity.Any;
        
        export const CurrentChanged = create<Entity>('bs.Entity.CurrentChanged', Lane.Slow);
    }
    
    export namespace Interactivity {
        export const Highlight = create<Bootstrap.Interactivity.HighlightEntry[]>('bs.Visuals.HoverElement', Lane.Fast);
    }
    
    export namespace Visual {                
        export const VisualHoverElement = create<Bootstrap.Interactivity.Info>('bs.Visual.HoverElement', Lane.Fast);
        export const VisualSelectElement = create<Bootstrap.Interactivity.Info>('bs.Visual.SelectElement', Lane.Fast);
        
        export const CameraChanged = create<LiteMol.Visualization.Camera>('bs.Visual.CameraChanged', Lane.Fast);        
    }    
    
    export namespace Molecule {
        export const ModelHighlight = create<Bootstrap.Interactivity.Molecule.SelectionInfo | undefined>('bs.Molecule.ModelHighlight', Lane.Fast);
        export const ModelSelect = create<Bootstrap.Interactivity.Molecule.SelectionInfo | undefined>('bs.Molecule.ModelSelect', Lane.Fast);
    }    
}