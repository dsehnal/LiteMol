/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Data {
  
    import Plugin = LiteMol.Plugin;
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
            
    import Transformer = Bootstrap.Entity.Transformer;
    import Tree = Bootstrap.Tree;
    import Transform = Tree.Transform;     
    import Visualization = Bootstrap.Visualization;
    
    // straigtforward
    export const DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({ 
        sourceId: 'pdbe-molecule', 
        name: 'PDBe', 
        description: 'Download a molecule from PDBe.',  
        defaultId: '1cbs',
        specificFormat: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF,
        urlTemplate: id => `http://www.ebi.ac.uk/pdbe/static/entry/${id.toLowerCase()}_updated.cif`
    }); 
     
    // this creates the electron density based on the spec you sent me
    export const DownloadDensity = Bootstrap.Tree.Transformer.action<Entity.Root, Entity.Action, { id?: string }>({
        id: 'pdbe-density-download-data',
        name: 'Density Data from PDBe',
        description: 'Download density data from PDBe.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: () => ({ id: '1cbs' }),
        validateParams: p => (!p.id || !p.id.trim().length) ? ['Enter Id'] : void 0,  
    }, (context, a, t) => {
        
        let action = Bootstrap.Tree.Transform.build();
        let id = t.params.id.trim().toLocaleLowerCase();
        
        let group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: t.props.ref })
            
        let diff = group
            .then(<Bootstrap.Tree.Transformer.To<Entity.Data.Binary>>Transformer.Data.Download, { url: `http://www.ebi.ac.uk/pdbe/coordinates/files/${id}_diff.ccp4`, type: 'Binary', id: t.params.id, description: 'Fo-Fc' })
            .then(Transformer.Density.ParseBinary, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc', normalize: false }, { isBinding: true });
            
        diff
            .then(Transformer.Density.CreateVisualBehaviour, {
                id: 'Fo-Fc(-ve)',  
                isoSigmaMin: -5,
                isoSigmaMax: 0,                    
                radius: 5,
                style: Visualization.Density.Style.create({
                    isoSigma: -3,
                    color: LiteMol.Visualization.Color.fromHex(0xBB3333), // can also use fromRgb(0-255 ranges), fromHsl, fromHsv; found in Visualization/Base/Theme.ts
                    isWireframe: true,
                    transparency: { alpha: 1.0 }
                })
            });
            
        diff
            .then(Transformer.Density.CreateVisualBehaviour, {  
                id: 'Fo-Fc(+ve)', 
                isoSigmaMin: 0,
                isoSigmaMax: 5,                    
                radius: 5,
                style: Visualization.Density.Style.create({
                    isoSigma: 3,
                    color: LiteMol.Visualization.Color.fromHex(0x33BB33), 
                    isWireframe: true,
                    transparency: { alpha: 1.0 }
                })
            });            
        
        let base = group
            .then(<Bootstrap.Tree.Transformer.To<Entity.Data.Binary>>Transformer.Data.Download, { url: `http://www.ebi.ac.uk/pdbe/coordinates/files/${id}.ccp4`, type: 'Binary', id: t.params.id, description: '2Fo-Fc' })
            .then(Transformer.Density.ParseBinary, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc', normalize: false }, { isBinding: true })
            .then(Transformer.Density.CreateVisualBehaviour, {  
                id: '2Fo-Fc',
                isoSigmaMin: 0,
                isoSigmaMax: 2,                    
                radius: 5,
                style: Visualization.Density.Style.create({
                    isoSigma: 1.5,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2), 
                    isWireframe: false,
                    transparency: { alpha: 0.45 }
                })
            });
            
        return action;
    }, "Electron density loaded, click on a residue or atom to display it.");
        
}