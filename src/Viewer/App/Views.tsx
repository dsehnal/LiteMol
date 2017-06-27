/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.Views {
    'use strict';

    import React = LiteMol.Plugin.React // this is to enable the HTML-like syntax

    import Controls = LiteMol.Plugin.Controls 
    
    export class LoadExample extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Viewer.Examples.LoadExampleParams>> {
        protected renderControls() {            
            const exampleId = this.params.exampleId;
            return <Controls.OptionsGroup options={Examples.ExampleIds} caption={s => Examples.ExampleMap[s].name} current={exampleId}
                onChange={exampleId => this.updateParams({ exampleId }) } label='Name' />;
        }
    }

    export class ObtainDownload extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<DataSources.MoleculeDownloadParams>> {
        private updateSourceParams(newSrc: Partial<DataSources.ObtainDownloadSource>) {
            const params = this.params;
            const src = params.sources[params.sourceKind];
            const newParams: Partial<DataSources.MoleculeDownloadParams> = {
                sources: { ...params.sources, [params.sourceKind]: { ...src,  ...newSrc } as DataSources.ObtainDownloadSource }
            };
            this.updateParams(newParams);
        }

        private coordServer(src: DataSources.ObtainDownloadSource) {
            if (src.kind !== 'CoordinateServer') return [];

            const showDetails = this.getPersistentState('showDetails', false);   
            const params = src;
            const idField = <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateSourceParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter pdb id...' />;
            const options = [
                <Controls.OptionsGroup options={['Cartoon', 'Full']} caption={s => s} current={params.type} onChange={(o) => this.updateSourceParams({ type: o }) } label='Type' title='Determines whether to send all atoms or just atoms that are needed for the Cartoon representation.' />,
                <Controls.Toggle onChange={(v:boolean) => this.updateSourceParams({ lowPrecisionCoords: v })} value={params.lowPrecisionCoords!} label='Low Precicion' title='If on, sends coordinates with 1 digit precision instead of 3. This saves up to 50% of data that need to be sent.' />,
                <Controls.TextBoxGroup value={params.serverUrl!} onChange={(v) => this.updateSourceParams({ serverUrl: v })} label='Server' title='The base URL of the CoordinateServer.' onEnter={e => this.applyEnter(e) } placeholder='Enter server URL...' />
            ];

            return <Controls.ExpandableGroup  
                select={idField}
                expander={<Controls.ControlGroupExpander isExpanded={showDetails} onChange={e => this.setPersistentState('showDetails', e) }  />}
                options={options}
                isExpanded={showDetails}
            />
        }

        private PDBe(src: DataSources.ObtainDownloadSource) {
            if (src.kind !== 'PDBe Updated mmCIF') return [];
            return <Controls.TextBoxGroup value={src.id} onChange={(v) => this.updateSourceParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter pdb id...' />;
        }

        private url(src: DataSources.ObtainDownloadSource) {
            if (src.kind !== 'URL') return [];
            return [
                <Controls.OptionsGroup options={LiteMol.Core.Formats.Molecule.SupportedFormats.All} caption={s => s.name} current={src.format}
                        onChange={(o) => this.updateSourceParams({ format: o }) } label='Format' />,
                <Controls.TextBoxGroup value={src.url} onChange={(v) => this.updateSourceParams({ url: v })} label='URL' onEnter={e => this.applyEnter(e) } placeholder='Enter pdb id...' />
            ];
        }

        private file(src: DataSources.ObtainDownloadSource) {
            if (src.kind !== 'File on Disk') return [];
            const state = this.controller.latestState;
            const extensions = LiteMol.Core.Formats.FormatInfo.formatFileFilters(LiteMol.Core.Formats.Molecule.SupportedFormats.All);    
            return <div>
                <div className='lm-btn lm-btn-block lm-btn-action lm-loader-lm-btn-file' style={{marginTop: '1px'}}>
                     {src.file ? src.file.name : 'Select a file...'} <input disabled={state.isBusy} type='file' accept={extensions} onChange={ evt => this.updateSourceParams({ file: (evt.target as any).files[0] }) } multiple={false} />
                </div>
            </div>
        }

        protected renderControls() {            
            const params = this.params;      
            const src = params.sources[params.sourceKind];
            const options = params.sourceKind === 'CoordinateServer'
                ? this.coordServer(src)
                : params.sourceKind === 'PDBe Updated mmCIF'
                ? this.PDBe(src)
                : params.sourceKind === 'URL'
                ? this.url(src)
                : this.file(src);

            return <div>
                <Controls.OptionsGroup 
                    options={DataSources.ObtainDownloadSources} caption={s => s} 
                    current={params.sourceKind} onChange={(o) => this.updateParams({ sourceKind: o }) } label='Source' title='Determines where to obtain the data.' />
                {options}
            </div>
        }        
    }   
}