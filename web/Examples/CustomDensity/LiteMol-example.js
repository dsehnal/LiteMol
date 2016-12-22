/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Custom;
    (function (Custom) {
        var React = LiteMol.Plugin.React;
        Custom.DownloadDensityToastMessage = function (ctx) {
            var download = function (e) {
                e.preventDefault();
                var t = ctx.transforms.getController(Custom.DownloadDensity, ctx.select('density-downloader')[0]);
                LiteMol.Bootstrap.Command.Toast.Hide.dispatch(ctx, { key: 'DownloadDensityToast' });
                if (t)
                    t.apply();
            };
            return React.createElement("div", null,
                "Density data available. ",
                React.createElement("a", { style: { cursor: 'pointer' }, onClick: download }, "Click here"),
                " to download.");
        };
    })(Custom = LiteMol.Custom || (LiteMol.Custom = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Custom;
    (function (Custom) {
        var Bootstrap = LiteMol.Bootstrap;
        var Entity = Bootstrap.Entity;
        var Transformer = Bootstrap.Entity.Transformer;
        Custom.DensityLoader = Entity.create({ name: 'Density Loader', typeClass: 'Data', shortName: 'DL', description: 'Represents density loader entity.' });
        Custom.CreateDensityLoader = Bootstrap.Tree.Transformer.create({
            id: 'litemol-custom_density_example-create-loader',
            name: 'Load Density',
            description: 'Download 2Fo-Fc density.',
            from: [Entity.Root],
            to: [Custom.DensityLoader],
            defaultParams: function () { return ({ id: '1cbs' }); },
            validateParams: function (p) { return p.id && p.id.trim().length > 0 ? void 0 : ['Enter Id.']; }
        }, function (context, a, t) {
            return Bootstrap.Task.resolve('Density', 'Silent', Custom.DensityLoader.create(t, { id: t.params.id, label: 'Density Loader' }));
        });
        Custom.DownloadDensity = Bootstrap.Tree.Transformer.actionWithContext({
            id: 'litemol-custom_density_example-download-density',
            name: 'Load Density',
            description: 'Download 2Fo-Fc density.',
            from: [Custom.DensityLoader],
            to: [Entity.Action],
            defaultParams: function () { return ({}); }
        }, function (context, a, t) {
            var id = a.props.id;
            var action = Bootstrap.Tree.Transform.build();
            // Download the density and enable the interactive density display
            action.add(context.tree.root, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: id, description: '2Fo-Fc Density' })
                .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc Density', normalize: false }, { isBinding: true })
                .then(Transformer.Density.CreateVisualBehaviour, {
                id: '2Fo-Fc Density',
                isoSigmaMin: 0,
                isoSigmaMax: 2,
                radius: 5,
                showFull: false,
                minRadius: 0,
                maxRadius: 10,
                style: Bootstrap.Visualization.Density.Style.create({
                    isoValue: 1.5,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                    isWireframe: true,
                    transparency: { alpha: 0.75 }
                })
            }, { ref: 'density-2fo-fc' });
            return {
                action: action,
                context: a.ref
            };
        }, function (ctx, ref) {
            if (!ref)
                return;
            Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, ref);
        });
        Custom.DownloadAndCreate = Bootstrap.Tree.Transformer.action({
            id: 'litemol-custom_density_example-download-and-create',
            name: 'Data',
            description: 'Download molecule and create the option to lazy load density.',
            from: [Entity.Root],
            to: [Entity.Action],
            defaultParams: function () { return ({ id: '1cbs' }); },
            validateParams: function (p) { return p.id && p.id.trim().length > 0 ? void 0 : ['Enter Id.']; }
        }, function (context, a, t) {
            var id = t.params.id.trim().toLowerCase();
            // Clear the previous data.
            Bootstrap.Command.Tree.RemoveNode.dispatch(context, context.tree.root);
            var action = Bootstrap.Tree.Transform.build();
            // Download the PDB file and create it's representation
            action.add(a, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/entry-files/pdb" + id + ".ent", type: 'String', id: id })
                .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.PDB }, {})
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: true }, {});
            //.then(Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {}) // this can be used insteadf of the CreateMacromoleculeVisual
            // Download the density and enable the interactive density display
            action.add(a, Custom.CreateDensityLoader, { id: id }, { ref: 'density-downloader' });
            return action;
        });
    })(Custom = LiteMol.Custom || (LiteMol.Custom = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Custom;
    (function (Custom) {
        var Plugin = LiteMol.Plugin;
        var Views = Plugin.Views;
        var Bootstrap = LiteMol.Bootstrap;
        var Transformer = Bootstrap.Entity.Transformer;
        var LayoutRegion = Bootstrap.Components.LayoutRegion;
        function create(target) {
            var customSpecification = {
                settings: {
                    'density.defaultVisualBehaviourRadius': 5
                },
                transforms: [
                    { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                    { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                    { transformer: Custom.DownloadDensity, view: Views.Transform.Empty },
                    { transformer: Custom.DownloadAndCreate, view: LiteMol.Plugin.Views.Transform.Data.WithIdField, initiallyCollapsed: false }
                ],
                behaviours: [
                    // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                    // keep these 2
                    Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                    Bootstrap.Behaviour.FocusCameraOnSelect,
                    // this colors the visual when it's selected by mouse or touch
                    Bootstrap.Behaviour.ApplyInteractivitySelection,
                    // this shows what atom/residue is the pointer currently over
                    Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                    // distance to the last "clicked" element
                    Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                    // when the same element is clicked twice in a row, the selection is emptied
                    Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                    // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
                    // you will not want to use this for the ligand pages, where you create the same thing this does at startup
                    Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),
                    // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                    // While it is not required for any functionality, we as authors are very much interested in basic 
                    // usage statistics of the application and would appriciate if this behaviour is used.
                    Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
                ],
                components: [
                    Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                    //Plugin.Components.create('RepresentationControls', ctx => new Bootstrap.Components.Transform.Action(ctx, 'model', CreateRepresentation, 'Source'), Plugin.Views.Transform.Action)(LayoutRegion.Right),
                    Plugin.Components.create('SourceControls', function (ctx) { return new Bootstrap.Components.Transform.Action(ctx, ctx.tree.root, Custom.DownloadAndCreate, 'Source'); }, Plugin.Views.Transform.Action)(LayoutRegion.Right),
                    Plugin.Components.create('DownloadDensity', function (ctx) { return new Bootstrap.Components.Transform.Action(ctx, 'density-downloader', Custom.DownloadDensity, 'Load 2Fo-Fc Density'); }, Plugin.Views.Transform.Action)(LayoutRegion.Right),
                    Plugin.Components.create('DensityControls', function (ctx) { return new Bootstrap.Components.Transform.Updater(ctx, 'density-2fo-fc', 'Density: 2Fo-Fc'); }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                    Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
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
            var plugin = Plugin.create({ target: target, customSpecification: customSpecification, layoutState: { isExpanded: true } });
            plugin.context.logger.message("LiteMol Plugin " + Plugin.VERSION.number);
            return plugin;
        }
        Custom.create = create;
        // create the instance...
        var id = '1cbs';
        var plugin = create(document.getElementById('app'));
        var action = plugin.createTransform();
        action.add(plugin.context.tree.root, Custom.DownloadAndCreate, { id: id });
        plugin.applyTransform(action);
        function showToast() {
            plugin.command(Bootstrap.Command.Toast.Show, {
                key: 'DownloadDensityToast',
                title: 'Density',
                message: Custom.DownloadDensityToastMessage(plugin.context),
                timeoutMs: 30 * 1000
            });
        }
        showToast();
    })(Custom = LiteMol.Custom || (LiteMol.Custom = {}));
})(LiteMol || (LiteMol = {}));
