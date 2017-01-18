/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Command {
    "use strict";

    import Lane = Service.Dispatcher.Lane;
    import create = Event.create
     
    export namespace Tree {
        import Node = Bootstrap.Tree.Node.Any;
        export const RemoveNode = create<Bootstrap.Tree.Selector<any>>('bs.cmd.Tree.RemoveNode', Lane.Slow);   
        export const ApplyTransform = create<{ node: Node, transform: Bootstrap.Tree.Transform.Any, isUpdate?: boolean }>('bs.cmd.Tree.ApplyTransform', Lane.Slow);
    }
    
    export namespace Entity {
        export const SetCurrent = create<Bootstrap.Entity.Any>('bs.cmd.Entity.SetCurrentNode', Lane.Slow);     
        export const ToggleExpanded = create<Bootstrap.Entity.Any>('bs.cmd.Entity.ToggleExpanded', Lane.Slow);        
        export const SetVisibility = create<{ entity: Bootstrap.Entity.Any, visible: boolean }>('bs.cmd.Entity.SetVisibility', Lane.Slow);
        
        export const Focus = create<Bootstrap.Entity.Any[]>('bs.cmd.Entity.Focus', Lane.Slow);        
        export const Highlight = create<{ entities: Bootstrap.Entity.Any[], isOn: boolean }>('bs.cmd.Entity.Highlight', Lane.Slow);                             
    }
    
    export namespace Layout {
        export const SetState = LiteMol.Bootstrap.Event.create<Partial<Components.LayoutState>>('lm.cmd.Layout.SetState', Lane.Slow);
        export const SetViewportOptions = create<LiteMol.Visualization.SceneOptions>('bs.cmd.Layout.SetViewportOptions', Lane.Slow);
    }
    
    export namespace Molecule {
        export const FocusQuery = create<{ model: Bootstrap.Entity.Molecule.Model, query: Core.Structure.Query.Source }>('bs.cmd.Molecule.FocusQuery', Lane.Slow);
        export const Highlight = create<{ model: Bootstrap.Entity.Molecule.Model, query: Core.Structure.Query.Source, isOn: boolean }>('bs.cmd.Molecule.Highlight', Lane.Slow);
        
        export const CreateSelectInteraction = create<{ entity: Bootstrap.Entity.Any, query: Core.Structure.Query.Source }>('bs.cmd.Molecule.CreateSelectInteraction', Lane.Slow);
    }
        
    export namespace Visual {
        export const ResetScene = create<void>('bs.cmd.Visual.ResetScene', Lane.Slow);
        export const ResetTheme = create<{ selection?: Bootstrap.Tree.Selector<Bootstrap.Entity.Any> } | undefined>('bs.cmd.Visual.ResetTheme', Lane.Slow);
        export const UpdateBasicTheme = create<{ visual: Bootstrap.Entity.Visual.Any, theme: LiteMol.Visualization.Theme }>('bs.cmd.Visual.UpdateBasicTheme', Lane.Slow);
    }    

    export namespace Toast {
        export const Show = create<Service.Toast>('bs.cmd.Toast.Show', Lane.Slow);
        export const Hide = create<{ key: string }>('bs.cmd.Toast.Hide', Lane.Slow);
    }
}