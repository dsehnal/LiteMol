/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Transform.Molecule {
    "use strict";
    
    import Transformer = Bootstrap.Entity.Transformer

    export class CreateFromData extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateFromDataParams>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.OptionsGroup options={LiteMol.Core.Formats.Molecule.SupportedFormats.All} caption={s => s.name} current={params.format}
                        onChange={(o) => this.updateParams({ format: o }) } label='Format' />
            </div>
        }        
    }
    
    export class DownloadFromUrl extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.DownloadMoleculeSourceParams>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.OptionsGroup options={LiteMol.Core.Formats.Molecule.SupportedFormats.All} caption={s => s.name} current={params.format}
                        onChange={(o) => this.updateParams({ format: o }) } label='Format' />
                <Controls.TextBoxGroup value={params.id!} onChange={(v) => this.updateParams({ id: v })} label='URL' onEnter={e => this.applyEnter(e) } placeholder='Enter url...' />
            </div>
        }        
    }

    export class OpenFile extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.OpenMoleculeFromFileParams>> {        
        protected renderControls() {            
            let params = this.params;            
            let state = this.controller.latestState;        
            let extensions = LiteMol.Core.Formats.FormatInfo.formatFileFilters(LiteMol.Core.Formats.Molecule.SupportedFormats.All);    
            return <div>
                <div className='lm-btn lm-btn-block lm-btn-action lm-loader-lm-btn-file' style={{marginTop: '1px'}}>
                     {params.file ? params.file.name : 'Select a file...'} <input disabled={state.isBusy} type='file' accept={extensions} onChange={ evt => this.updateParams({ file: (evt.target as any).files[0] }) } multiple={false} />
                </div>
            </div>
        }        
    }
    
    export class InitCoordinateStreaming extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CoordinateStreaming.InitStreamingParams>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.TextBoxGroup value={params.id!} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter pdb id...' />
                <Controls.TextBoxGroup value={params.server!} onChange={(v) => this.updateParams({ server: v })} label='Server' onEnter={e => this.applyEnter(e) } placeholder='Server url...' />
            </div>
        }        
    }
    
    export class CreateFromMmCif extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateFromMmCifParams>> {        
        protected renderControls() {            
            let cif = this.transformSourceEntity as Bootstrap.Entity.Data.CifDictionary;
            let options = cif.props.dictionary.dataBlocks.map((b, i) => ({ b: b.header, i }) );                                    
            return <div>
                <Controls.OptionsGroup options={options} caption={s => s.b} current={options[this.params.blockIndex!]}
                     onChange={(o) => this.updateParams({ blockIndex: o.i }) } label='Source' />
            </div>
        }        
    }
    
    export class CreateModel extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateModelParams>> {        
        protected renderControls() {          
            let modelCount = (this.transformSourceEntity as Bootstrap.Entity.Molecule.Molecule).props.molecule.models.length;
            return <div>
                <Controls.Slider label='Index' onChange={v => this.updateParams({ modelIndex: v - 1  })} 
                     min={1} max={modelCount} step={1} value={ (this.params.modelIndex | 0) + 1 } title='Index of the model.' />
            </div>
        }        
    }
    
    export class CreateAssembly extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateAssemblyParams>> {        
        protected renderControls() {            
            let params = this.params;
            //let model = this.isUpdate ? Bootstrap.Utils.Molecule.findModel(this.transformSourceEntity) : this.entity as Bootstrap.Entity.Molecule.Model;
            let model = Bootstrap.Utils.Molecule.findModel(this.transformSourceEntity)!;
            let asm = model.props.model.data.assemblyInfo;
            if (!asm) return void 0;            
            let names =  asm.assemblies.map(a => a.name);            
            return <div>
                <Controls.OptionsGroup options={names} current={params.name}
                     onChange={(o) => this.updateParams({ name: o }) } label='Name' />
            </div>
        }        
    }
    
    export class CreateSymmetryMates extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateSymmetryMatesParams>> {        
        protected renderControls() {            
            let params = this.params;
            let options: (typeof params.type)[] = ['Mates', 'Interaction'];           
            return <div>
                <Controls.OptionsGroup options={options} current={params.type}
                     onChange={(o) => this.updateParams({ type: o }) } label='Type' title='Mates: copies whole asymetric unit. Interaction: Includes only residues that are no more than `radius` from the asymetric unit.' />
                <Controls.Slider label='Radius' onChange={v => this.updateParams({ radius: v })} 
                     min={0} max={25} step={0.1} value={params.radius!} title='Interaction radius.' />
            </div>
        }        
    }
    
    export class CreateSelection extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateSelectionParams>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.TextBoxGroup value={params.name!} onChange={(v) => this.updateParams({ name: v })} label='Name' onEnter={e => this.applyEnter(e) } placeholder='Optional name...' />
                <Controls.QueryEditor value={params.queryString!} onChange={(v) => this.updateParams({ queryString: v })} onEnter={e => this.applyEnter(e) } />
            </div>
            //<Controls.TextBoxGroup value={params.queryString} onChange={(v) => this.updateParams({ queryString: v })} onEnter={e => this.applyEnter(e) } label='Query' placeholder='Enter a query...' />
        }        
    }
    
    export class CreateMacromoleculeVisual extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateMacromoleculeVisualParams>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.Toggle onChange={v => this.updateParams({ polymer: v })} value={params.polymer!} label='Polymer' />
                <Controls.Toggle onChange={v => this.updateParams({ het: v })} value={params.het!} label='HET' />
                <Controls.Toggle onChange={v => this.updateParams({ water: v })} value={params.water!} label='Water' />
            </div>;
        }        
    }
        
    export class CreateVisual extends Transform.ControllerBase<Bootstrap.Components.Transform.MoleculeVisual> {        
        
        private detail() {
            let p = this.params.style!.params as Bootstrap.Visualization.Molecule.DetailParams;
            return [<Controls.OptionsGroup options={Bootstrap.Visualization.Molecule.DetailTypes} caption={s => s} current={p.detail}
                    onChange={(o) => this.controller.updateStyleParams({ detail: o }) } label='Detail' />];
        }

        private cartoons() {
            let p = this.params.style!.params as Bootstrap.Visualization.Molecule.CartoonParams;
            return [
                <Controls.Toggle key={0} onChange={v => this.controller.updateStyleParams({ showDirectionCone: v }) } value={p.showDirectionCone} label='Dir. Cones' />,
                <Controls.OptionsGroup key={1} options={Bootstrap.Visualization.Molecule.DetailTypes} caption={s => s} current={p.detail}
                    onChange={(o) => this.controller.updateStyleParams({ detail: o }) } label='Detail' />];
        }
        
        private ballsAndSticks() {
            let p = this.params.style!.params as Bootstrap.Visualization.Molecule.BallsAndSticksParams;
            let controls: any[] = [];
            let key = 0;
                    
            controls.push(<Controls.Toggle 
                    title='Scale atoms using their VDW radius.' 
                    onChange={v => this.controller.updateStyleParams({ useVDW: v }) } value={p.useVDW!} label='VDW' />);
                    
            if (p.useVDW) {
                controls.push(<Controls.Slider key={key++} label='Scale' onChange={v => this.controller.updateStyleParams({ vdwScaling: v }) }  
                        min={0.1} max={1} step={0.01} value={p.vdwScaling!} title='VDW scale factor.' />);
            } else {
                controls.push(<Controls.Slider key={key++} label='Atom Rds' onChange={v => this.controller.updateStyleParams({ atomRadius: v }) }  
                        min={0.05} max={2} step={0.01} value={p.atomRadius!} title='Atom Radius' />);
            }
            
            controls.push(<Controls.Slider key={key++} label='Bond Rds' onChange={v => this.controller.updateStyleParams({ bondRadius: v }) }  
                    min={0.05} max={1} step={0.01} value={p.bondRadius!} title='Bond Radius'  />);

            const maxHbondLength = p.customMaxBondLengths && p.customMaxBondLengths['H'] ? p.customMaxBondLengths['H'] : 1.15;
            controls.push(<Controls.Slider key={key++} label='H Bond Len' onChange={v => this.controller.updateStyleParams({ customMaxBondLengths: { ...p.customMaxBondLengths, 'H': v } }) }  
                    min={0.9} max={1.5} step={0.01} value={maxHbondLength} title='Maximum H bond length'  />);
            
            controls.push(<Controls.Toggle key={key++} onChange={v => this.controller.updateStyleParams({ hideHydrogens: v }) } value={p.hideHydrogens!} label='Hide H' />);

            controls.push(<Controls.OptionsGroup key={key++} options={Bootstrap.Visualization.Molecule.DetailTypes} caption={s => s} current={p.detail}
                    onChange={(o) => this.controller.updateStyleParams({ detail: o }) } label='Detail' />);
            
            return controls;
        }
        
        private surface() {                       
            let params = this.params.style!.params as Bootstrap.Visualization.Molecule.SurfaceParams;
            let key = 0;
            return [
                <Controls.Slider key={key++} label='Probe Radius' onChange={v => this.controller.updateStyleParams({ probeRadius: v  })} 
                    min={0} max={6} step={0.1} value={params.probeRadius!} />,
                <Controls.Slider key={key++} label='Smoothing' onChange={v => this.controller.updateStyleParams({ smoothing: v  })} 
                    min={0} max={20} step={1} value={params.smoothing!} title='Number of laplacian smoothing itrations.' />,   
                <Controls.Toggle key={key++} onChange={v => this.controller.updateStyleParams({ automaticDensity: v }) } value={params.automaticDensity!} label='Auto Detail' />,
                (params.automaticDensity 
                    ? void 0 
                    : <Controls.Slider key={key++} label='Detail' onChange={v => this.controller.updateStyleParams({ density: v  })} 
                            min={0.1} max={3} step={0.1} value={params.density!} title='Determines the size of a grid cell (size = 1/detail).' />),
                <Controls.Toggle key={key++} onChange={v => this.controller.updateStyleParams({ isWireframe: v }) } value={params.isWireframe!} label='Wireframe' />                
            ];
        }
        
        private createColors() {                                   
            let theme = this.params.style!.theme!;
            
            let isBallsAndSticks = this.params.style!.type === 'BallsAndSticks';
            
            let controls = theme.colors!
                    .filter((c, n) => !isBallsAndSticks ? n !== 'Bond' : true)
                    .map((c, n) => <Controls.ToggleColorPicker  key={n} label={n!} color={c!} onChange={c => this.controller.updateThemeColor(n!, c) } />).toArray();
                    
            controls.push(<TransparencyControl definition={theme.transparency!} onChange={d => this.controller.updateThemeTransparency(d) } />);
            // controls.push(<Controls.Toggle 
            //         onChange={v => this.controller.updateStyleTheme({ wireframe: v }) } value={theme.wireframe} label='Wireframe' />);
            return controls;
        }
        
        protected renderControls() {            
            let params = this.params;
            let controls: any;
            switch (params.style!.type) {
                case 'Surface': controls = this.surface(); break;
                case 'BallsAndSticks': controls = this.ballsAndSticks(); break;
                case 'Cartoons': controls = this.cartoons(); break;
                default: controls = this.detail(); break;
            }
                       
            let desc = (key: Bootstrap.Visualization.Molecule.Type) => Bootstrap.Visualization.Molecule.TypeDescriptions[key];
           
            let showTypeOptions = this.getPersistentState('showTypeOptions', false);
            let showThemeOptions = this.getPersistentState('showThemeOptions', false);
                       
            return <div>
                <Controls.ExpandableGroup
                    select={<Controls.OptionsGroup options={Bootstrap.Visualization.Molecule.Types} caption={k => desc(k).label} current={params.style!.type}
                        onChange={(o) => this.controller.updateTemplate(o, Bootstrap.Visualization.Molecule.Default.ForType) } label='Type' />}
                    expander={<Controls.ControlGroupExpander isExpanded={showTypeOptions} onChange={e => this.setPersistentState('showTypeOptions', e) }  />}
                    options={controls}
                    isExpanded={showTypeOptions} />
                
                <Controls.ExpandableGroup       
                    select={<Controls.OptionsGroup options={Bootstrap.Visualization.Molecule.Default.Themes} caption={(k: Bootstrap.Visualization.Theme.Template) => k.name} current={params.style!.theme!.template}
                        onChange={(o) => this.controller.updateThemeDefinition(o) } label='Coloring' />}
                    expander={<Controls.ControlGroupExpander isExpanded={showThemeOptions} onChange={e => this.setPersistentState('showThemeOptions', e) }  />}
                    options={this.createColors()}
                    isExpanded={showThemeOptions} />
                
            </div>
        }        
    }

    export class CreateLabels extends Transform.ControllerBase<Bootstrap.Components.Transform.MoleculeLabels> {        
        renderControls() {
            const style = this.controller.latestState.params.style;
            const select = <Controls.OptionsGroup options={Bootstrap.Utils.Molecule.Labels3DKinds} 
                caption={(k: string) => Bootstrap.Utils.Molecule.Labels3DKindLabels[k]} current={style.params.kind}
                onChange={(o) => this.controller.updateStyleParams({ kind: o }) } label='Kind' />
            const showOptions = this.getPersistentState('showOptions', false);

            return <div>
                <Controls.ExpandableGroup       
                    select={select}
                    expander={<Controls.ControlGroupExpander isExpanded={showOptions} onChange={e => this.setPersistentState('showOptions', e) }  />}
                    options={Labels.optionsControls(this.controller)}
                    isExpanded={showOptions} />
            </div>;
        }
    }
}