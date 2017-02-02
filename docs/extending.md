Extending LiteMol
=================

To extend LiteMol to support your data and behaviour you need to:

* Define entities that represent your data and/or behavior.
* Define transforms that create your entities.
    - Optionally define views that control the transforms and include them in your plugin spec. This is only required if you need UI support from within LiteMol.


A good example of defining custom entities, behaviors, and view is probably the support for annotation from the PDBe API. 
The entity and transforms can be found [here](https://github.com/dsehnal/LiteMol/blob/master/src/Viewer/PDBe/SequenceAnnotation.ts),
and the view [here](https://github.com/dsehnal/LiteMol/blob/master/src/Viewer/PDBe/Views.tsx).

Defining Entities
-----------------

To define an entity, you need to specify its type, class, and properties. 

For example, to define the ``Annotations`` entity that encapsulates annotation data from the PDBe API:

```TypeScript 
export interface Annotations extends Entity<{ data: any }> { }         
export const Annotations = Entity.create<{ data: any }>({ 
    name: 'PDBe Sequence Annotations', 
    typeClass: 'Data',
    shortName: 'SA', 
    description: 'Represents PDBe sequence annotation data.' 
});
```

Defining Transforms
-------------------

A transformation takes one type of entity, parameters, and produces a different entity.

```TypeScript
const Parse = Bootstrap.Tree.Transformer.create<Entity.Data.String, Annotations, { }>({
        id: 'pdbe-sequence-annotations-parse',
        name: 'PDBe Sequence Annotations',
        description: 'Parse sequence annotaions JSON.',
        from: [Entity.Data.String],
        to: [Annotations],
        defaultParams: () => ({})
    }, (context, a, t) => { 
        return Bootstrap.Task.create<Annotations>(`Sequence Annotations`, 'Normal', ctx => {
            ctx.update('Parsing...');
            ctx.schedule(() => {
                let data = JSON.parse(a.props.data);               
                ctx.resolve(Annotations.create(t, { label: 'Sequence Annotations', data }))
            });
        }).setReportTime(true);
    }       
);
```

Defining Views
--------------

Views are defined as React components derived from the ``LiteMol.Plugin.Views.Transform.ControllerBase`` class.

For example a view that specifies a color to create a sequence annotation object can be defined as 

```JSX
export class CreateSequenceAnnotationView extends LiteMol.Plugin.Views.Transform.ControllerBase<
    Bootstrap.Components.Transform.Controller<SequenceAnnotation.CreateSingleProps>,  
    SequenceAnnotation.CreateSingleProps> {
    
    protected renderControls() {            
        let params = this.params;                                                           
        return <div>
            <Controls.ToggleColorPicker label='Color' color={params.color!} onChange={c => this.controller.autoUpdateParams({ color: c }) } position='below' />
        </div>
    }        
}
```
