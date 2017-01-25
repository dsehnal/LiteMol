/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {
 
    import React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls;
    import Transformer = Bootstrap.Entity.Transformer;
 
    export class RepresentationView extends LiteMol.Plugin.Views.Transform.ControllerBase<
        Bootstrap.Components.Transform.Controller<LiteMol.Custom.CreateRepresentationParams>> { // you dont have to use these full type annotations, and just use "any" type instead, but then you will loose code completition. 
                        
        private asm() {

            let n = this.params.params ? this.params.params.name : this.params.assemblyNames![0];
            if (!n) n = this.params.assemblyNames![0];

            return [<Controls.OptionsGroup options={this.params.assemblyNames!} current={n}
                     onChange={(o) => this.updateParams({ params: { name: o } }) } label='Asm. Name' />];
        }

        private symm() {
            let options = ['Mates', 'Interaction'];    
            let params = this.params.params;

            return [ <Controls.OptionsGroup options={options} current={params.type}
                     onChange={(o) => this.updateParams({ params: { type: o, radius: params.radius } }) } label='Type' title='Mates: copies whole asymetric unit. Interaction: Includes only residues that are no more than `radius` from the asymetric unit.' />,
                <Controls.Slider label='Radius' onChange={v => this.updateParams({ params: { type: params.type, radius: v } })} 
                     min={0} max={25} step={0.1} value={params.radius} title='Interaction radius.' />];
        }

        private updateSource(source: string) {
            switch (source) {
                case 'Assembly':
                    this.updateParams({ source: source as any, params: { name: this.params.assemblyNames![0] } });
                    break;
                case 'Symmetry':
                    this.updateParams({ source: source as any, params: { type: 'Mates', radius: 5.0 } });
                    break;
                default:
                    this.updateParams({ source: 'Asymmetric Unit' });
                    break;
            }
        }

        protected renderControls() {            
            let params = this.params;

            let molecule = (this.controller.entity as Bootstrap.Entity.Molecule.Molecule).props.molecule;
            let model = molecule.models[0];
            let options = ['Asymmetric Unit'];
            if (params.assemblyNames && params.assemblyNames.length > 0) options.push('Assembly');
            if (model.data.symmetryInfo) options.push('Symmetry');
            let modelIndex = molecule.models.length > 1 
                ? <Controls.Slider label='Model' onChange={v => this.updateParams({ modelIndex: v - 1 })} min={1} max={molecule.models.length} step={1} value={params.modelIndex! + 1} title='Interaction radius.' />
                : void 0;

            return <div>
                <Controls.OptionsGroup options={options} caption={s => s} current={params.source} onChange={(o) => this.updateSource(o) } label='Source' />
                {
                    params.source === 'Assembly' 
                        ? this.asm()
                        : params.source === 'Symmetry' 
                            ? this.symm()
                            : void 0
                }
                { modelIndex }
            </div>
        }        
    }
}