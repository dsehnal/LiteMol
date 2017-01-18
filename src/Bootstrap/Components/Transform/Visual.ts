/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Transform {
    "use strict";
 
    import Vis = Bootstrap.Visualization;
    
    export class MoleculeVisual extends Controller<Bootstrap.Entity.Transformer.Molecule.CreateVisualParams> {          
        updateTemplate(key: string, all: Map<string, Bootstrap.Visualization.Style.Any>) {                                                
            let s = all.get(key)!; 
            let latestTheme = this.latestState && this.latestState.params!.style!.theme;                 
            let params = s.params;
            let theme = latestTheme || this.getThemeInstance(s.theme!.template!);
            let style: Bootstrap.Visualization.Molecule.Style<any> = { type: s.type, params, theme };
            this.autoUpdateParams({ style });            
        }
        
        updateStyleParams(params: any) {
            let s = Utils.shallowClone(this.latestState.params!.style)!;
            s.params = Utils.merge(s.params, params);            
            this.autoUpdateParams({ style: s })
        }   
        
        updateStyleTheme(theme: Partial<Vis.Theme.Instance>) {
            let s = Utils.shallowClone(this.latestState.params!.style)!;
            s.theme = Utils.merge(s.theme, theme);
            this.autoUpdateParams({ style: s });
        }
                
        updateThemeColor(name: string, value: LiteMol.Visualization.Color) {            
            let oldTheme = this.latestState.params!.style!.theme;            
            if (!oldTheme) return;           
            let colors = oldTheme.colors;
            if (!colors) colors = Immutable.Map<string, LiteMol.Visualization.Color>();            
            colors = colors.set(name, value);
            this.updateStyleTheme({ colors });    
        }
        
        updateThemeTransparency(transparency: LiteMol.Visualization.Theme.Transparency) {
            let oldTheme = this.latestState.params!.style!.theme;            
            if (!oldTheme) return;
            this.updateStyleTheme({ transparency });    
        }    
                
        private getThemeInstance(template: Bootstrap.Visualization.Theme.Template): Bootstrap.Visualization.Theme.Instance {
            let oldTheme = this.latestState.params!.style!.theme;        
            let defaultTransparency = Bootstrap.Visualization.Molecule.Default.ForType.get(this.latestState.params!.style!.type!)!.theme!.transparency;
            if (!oldTheme) return { template, colors: template.colors, transparency: defaultTransparency };     
            let colors = template.colors;            
            if (oldTheme.colors && colors) {
                colors = colors.withMutations(map => {
                    oldTheme!.colors!.forEach((c, n) => {
                        if (map.has(n!)) map.set(n!, c!);
                    });                    
                });               
            }            
            let transparency = oldTheme.transparency ? oldTheme.transparency : defaultTransparency;            
            return { template, colors, transparency };
        }
        
        updateThemeDefinition(definition: Bootstrap.Visualization.Theme.Template) {            
            this.updateStyleTheme(this.getThemeInstance(definition));
        }       
    }   
        
    export class DensityVisual<T, Styles> extends Controller<T> {    
        private cloneStyle(prop?: Styles) {
            return (<any>Utils.shallowClone((this.latestState.params as any)[prop || 'style'])) as Bootstrap.Visualization.Density.Style;
        }

        private getStyle(prop?: Styles) {
            return (this.latestState.params as any)[prop || 'style'] as Bootstrap.Visualization.Density.Style;
        }

        private setStyle(style: Bootstrap.Visualization.Density.Style, prop?: Styles) {
            this.autoUpdateParams(<any>{ [<any>prop || 'style']: style })
        }

        updateStyleParams(params: any, styleProp?: Styles) {
            let s = this.cloneStyle(styleProp);
            s.params = Utils.merge(s.params, params);
            this.setStyle(s, styleProp);
        }   
        
        updateStyleTheme(theme: Partial<Vis.Theme.Instance>, styleProp?:Styles) {
            let s = this.cloneStyle(styleProp);
            s.theme = Utils.merge(s.theme, theme);
            this.setStyle(s, styleProp);
        }
                
        updateThemeColor(name: string, value: LiteMol.Visualization.Color, styleProp?: Styles) {            
            let oldTheme = this.getStyle(styleProp).theme;            
            if (!oldTheme) return;           
            let colors = oldTheme.colors;
            if (!colors) colors = Immutable.Map<string, LiteMol.Visualization.Color>();            
            colors = colors.set(name, value);
            this.updateStyleTheme({ colors }, styleProp);            
        }
        
        updateThemeTransparency(transparency: LiteMol.Visualization.Theme.Transparency, styleProp?: Styles) {
            let oldTheme = this.getStyle(styleProp).theme;            
            if (!oldTheme) return;
            this.updateStyleTheme({ transparency }, styleProp);    
        }    
                
        private getThemeInstance(template: Bootstrap.Visualization.Theme.Template, styleProp?: Styles): Bootstrap.Visualization.Theme.Instance {
            let oldTheme = this.getStyle(styleProp).theme;        
            let defaultTransparency = Bootstrap.Visualization.Density.Default.Transparency;
            if (!oldTheme) return { template, colors: template.colors, transparency: defaultTransparency };     
            let colors = template.colors;            
            if (oldTheme.colors && colors) {
                colors = colors.withMutations(map => {
                    oldTheme!.colors!.forEach((c, n) => {
                        if (map.has(n!)) map.set(n!, c!);
                    });                    
                });               
            }            
            let transparency = oldTheme.transparency ? oldTheme.transparency : defaultTransparency;            
            return { template, colors, transparency };
        }
                
        updateThemeDefinition(definition: Bootstrap.Visualization.Theme.Template, styleProp?: Styles) {            
            this.updateStyleTheme(this.getThemeInstance(definition, styleProp), styleProp);
        }     
    }   
}