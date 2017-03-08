function DensityDisplayController($window) {
    var vm = this;
    vm.model = this.model || '';
    vm.fofc = this.fofc || '';
    vm.twofofc = this.twofofc || '';

    var LiteMol = $window.LiteMol;
    var Bootstrap = LiteMol.Bootstrap;
    var Plugin = LiteMol.Plugin;
    var Views = Plugin.Views;
    var Transformer = Bootstrap.Entity.Transformer;
    var LayoutRegion = Bootstrap.Components.LayoutRegion;
    var Visualization = Bootstrap.Visualization;

    vm.create = function(target) {
        var customSpecification = {
            settings: {
                'density.defaultVisualBehaviourRadius': 2
            },
            transforms: [{
                transformer: Transformer.Density.CreateVisualBehaviour,
                view: Views.Transform.Density.CreateVisualBehaviour
            }, ],
            behaviours: [
                Bootstrap.Behaviour.FocusCameraOnSelect,
                Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(6),
            ],
            components: [
                Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                Plugin.Components.create('DensityControls', function(ctx) {
                    return new Bootstrap.Components.Transform.Updater(ctx, 'density-2fo-fc', 'Density: 2Fo-Fc');
                }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                Plugin.Components.create('DensityControls2', function(ctx) {
                    return new Bootstrap.Components.Transform.Updater(ctx, 'density-fo-fc1', 'Density: Fo-Fc (+3σ)');
                }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                Plugin.Components.create('DensityControls3', function(ctx) {
                    return new Bootstrap.Components.Transform.Updater(ctx, 'density-fo-fc2', 'Density: Fo-Fc (-3σ)');
                }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                Plugin.Components.Context.Overlay(LayoutRegion.Root),
                Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
            ],
            viewport: {
                // dont touch this either 
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout,
            tree: void 0 //{ region: LayoutRegion.Left, view: Views.Entity.Tree }
        };
        return Plugin.create({
            target: target,
            customSpecification: customSpecification,
            //viewportBackground: '#fff',
            viewportBackground: 'black',
            layoutState: {
                isExpanded: false,
                hideControls: true
            }
        });
    };

    var plugin = vm.create(document.getElementById('litemol'));
    var action = plugin.createTransform();

    action.add(plugin.root, Transformer.Data.Download, {
            url: vm.model,
            type: 'String'
        })
        .then(Transformer.Molecule.CreateFromData, {
            format: LiteMol.Core.Formats.Molecule.SupportedFormats.PDB
        }, {})
        .then(Transformer.Molecule.CreateModel, {
            modelIndex: 0
        })
        .then(Transformer.Molecule.CreateSelectionFromQuery, {
            query: LiteMol.Core.Structure.Query.hetGroups(),
            name: 'Ligand',
            silent: true
        }, {
            isBinding: true
        })
        .then(Transformer.Molecule.CreateVisual, {
            style: {
                type: 'BallsAndSticks',
                params: {
                    useVDW: true,
                    vdwScaling: 0.25,
                    bondRadius: 0.13,
                    detail: 'Automatic'
                },
                theme: {
                    template: Visualization.Molecule.Default.ElementSymbolThemeTemplate,
                    colors: Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors,
                    transparency: {
                        alpha: 1.0
                    }
                }
            }
        }, {
            ref: 'Ligand'
        })
        .then(Transformer.Molecule.CreateSelectionFromQuery, {
            query: LiteMol.Core.Structure.Query.nonHetPolymer(),
            name: 'Polymer',
            silent: true
        }, {
            isBinding: true
        });
    // .then(Transformer.Molecule.CreateVisual, {
    //     style: Visualization.Molecule.Default.ForType.get('Cartoons')
    //
    // }, {
    //     ref: 'Polymer'
    // });

    // load densities
    action.add(plugin.root, Transformer.Data.Download, {
            url: vm.twofofc,
            type: 'Binary',
            description: '2Fo-Fc Density'
        })
        .then(Transformer.Density.ParseData, {
            format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4,
            id: '2Fo-Fc Density',
            normalize: false
        }, {
            isBinding: true
        })
        .then(Transformer.Density.CreateVisualBehaviour, {
            id: '2Fo-Fc Density',
            isoSigmaMin: 0,
            isoSigmaMax: 2,
            radius: 5,
            minRadius: 0,
            maxRadius: 10,
            showFull: false,
            style: Bootstrap.Visualization.Density.Style.create({
                isoValue: 0.8,
                isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                isWireframe: true,
                transparency: {
                    alpha: 0.9,
                }
            })
        }, {
            ref: 'density-2fo-fc'
        });
    action.add(plugin.root, Transformer.Data.Download, {
            url: vm.fofc,
            type: 'Binary',
            description: 'Fo-Fc +3σ Density'
        })
        .then(Transformer.Density.ParseData, {
            format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4,
            id: 'Fo-Fc +3σ Density',
            normalize: false
        }, {
            isBinding: true
        })
        .then(Transformer.Density.CreateVisualBehaviour, {
            id: 'Fo-Fc +3σ Density',
            isoSigmaMin: 0,
            isoSigmaMax: 5,
            radius: 5,
            showFull: false,
            minRadius: 0,
            maxRadius: 10,
            style: Bootstrap.Visualization.Density.Style.create({
                isoValue: 3,
                isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                isWireframe: true,
                transparency: {
                    alpha: 0.9,
                }
            })
        }, {
            ref: 'density-fo-fc1'
        });
    action.add(plugin.root, Transformer.Data.Download, {
            url: vm.fofc,
            type: 'Binary',
            description: 'Fo-Fc -3σ Density'
        })
        .then(Transformer.Density.ParseData, {
            format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4,
            id: 'Fo-Fc -3σ Density',
            normalize: false
        }, {
            isBinding: true
        })
        .then(Transformer.Density.CreateVisualBehaviour, {
            id: 'Fo-Fc -3σ Density',
            isoSigmaMin: -5,
            isoSigmaMax: 0,
            radius: 5,
            showFull: false,
            minRadius: 0,
            maxRadius: 10,
            style: Bootstrap.Visualization.Density.Style.create({
                isoValue: -3,
                isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                color: LiteMol.Visualization.Color.fromHex(0xBB3333), // red
                isWireframe: true,
                transparency: {
                    alpha: 0.9,
                }
            })
        }, {
            ref: 'density-fo-fc2'
        });

    plugin.applyTransform(action);

}
DensityDisplayController.$inject = ['$window'];
angular.module('ligands.density', [])
    .directive('densityDisplay', [function() {
        return {
            template: '<center><div id="litemol" style="text-align:center;width:600px;height:400px;z-index:100000;position:relative"></div></center>',
            transclude: true,
            controller: DensityDisplayController,
            controllerAs: 'density',
            bindToController: true,
            scope: {
                model: '=',
                fofc: '=',
                twofofc: '=',
            }
        };
    }]);
