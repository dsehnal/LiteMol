/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin {
    "use strict";

    export interface PluginControllerOptions {
        /**
         * query selector or HTMLElement
         */
        target: string | HTMLElement,

        customSpecification?: Specification,

        /**
         * HEX color in format '#rgb' or '#rrggbb'
         * or Visualization.Color instance.
         */
        viewportBackground?: string | Visualization.Color,

        layoutState?: Partial<Bootstrap.Components.LayoutState>,

        /**
         * This options determines if Google Analytics is enabled
         * to collect data about the plugin usage.
         * The type of information includes PDBids downloaded or types
         * of representations created.
         * 
         * All information about what data is sent can be found in 
         * src/Bootstrap/Behaviour/Analytics.ts.
         * 
         * By default this is OFF.
         * This option is ignored if customSpecification is specified.
         */
        allowAnalytics?: boolean,

        /**
         * This specifies what Google Analytics ID to use. This
         * means you can create your own google analytics account
         * and collect the information for yourself.
         */
        analyticsId?: string,
    }

    export interface ControllerLoadMoleculeInfo {
        id?: string,
        moleculeRef?: string,
        modelRef?: string,
        url?: string,
        data?: string | ArrayBuffer,
        format?: string | Core.Formats.FormatInfo,
        onLoad?: () => void,
        onError?: (e: any) => void,
        doNotCreateVisual?: boolean
    }

    import Entity = Bootstrap.Entity;
    import Transformer = Entity.Transformer;

    export class Controller {
        private _instance: Bootstrap.Plugin.Instance;

        get instance() { return this._instance; }
        get context() { return this._instance.context; }
        get root() { return this._instance.context.tree.root; }

        /**
         * execute a command with the specified params.
         */
        command<T>(cmd: Bootstrap.Event.Type<T>, params?:T) {
            cmd.dispatch(this.context, params!);
        }

        /**
         * Queries the entity state tree to select a list of entities 
         * satisfying the selector.
         * 
         * Equivalent to plugin.context.select(selector).
         * 
         * @example
         *   selectEntities('model') // select node with ref = 'model'
         *   selectEntities(entity).subtree()
         *   selectEntities(Bootstrap.Tree.Selection.byRef('ref').ancestorOfType(Bootstrap.Entity.Molecule.Model))
         */
        selectEntities(selector: Bootstrap.Tree.Selector<Bootstrap.Entity.Any>) {
            return this.context.select(selector);
        }

        /**
         * Subscribes the specified event and returns
         * a disposable for the event.
         * 
         * let sub = litemol.subscribe(...)
         * ...
         * sub.dispose(); // to stop listening
         */
        subscribe<T>(event: Bootstrap.Event.Type<T>, onEvent: (e: Bootstrap.Event<T>) => void) {
            return event.getStream(this.context).subscribe(onEvent);
        }

        /**
         * Create a transform builder.
         */
        createTransform() {
            return Bootstrap.Tree.Transform.build();
        }

        /** 
         * Applies a state trasnform.
         */
        applyTransform(transform: Bootstrap.Tree.Transform.Source) {
            const ctx = this.context;
            return Bootstrap.Tree.Transform.apply(ctx, transform).run();
        }

        /**
         * Remove all entities.
         */
        clear() {
            this.command(Bootstrap.Command.Tree.RemoveNode, this.root);
        }

        /**
         * Set the background of the viewport from:
         * 
         * HEX color in format '#rgb' or '#rrggbb'
         * or Visualization.Color instance.
         */
        setViewportBackground(color: string | Visualization.Color) {
            if (Visualization.Color.isColor(color)) {
                this.command(Bootstrap.Command.Layout.SetViewportOptions, { clearColor: color });
            } else {
                this.command(Bootstrap.Command.Layout.SetViewportOptions, { clearColor: Visualization.Color.fromHexString(color) });
            }
        }

        /**
         * Sets the state of the plugin layout.
         * 
         * Expanded, show/hide controls, etc..
         */
        setLayoutState(state: Partial<Bootstrap.Components.LayoutState>) {
            this.command(Bootstrap.Command.Layout.SetState, state);
        }

        /**
         * Load molecule from url or string/binary data.
         * 
         * Default format is mmCIF.
         */
        loadMolecule(source: ControllerLoadMoleculeInfo) {
            let action = this.createTransform();

            if (!source.url && !source.data) {
                throw new Error('Please specify either url or data');
            }

            let format: Core.Formats.FormatInfo = Core.Formats.Molecule.SupportedFormats.mmCIF;
            if (source.format) {
                if (Core.Formats.FormatInfo.is(source.format)) {
                    format = source.format;
                } else {
                    let f = Core.Formats.FormatInfo.fromShortcut(Core.Formats.Molecule.SupportedFormats.All, source.format);
                    if (!f) {
                        throw new Error(`'${source.format}' is not a supported format.`);
                    }
                    format = f;
                } 
            }

            let data = source.data 
                ? action.add(this.root, Entity.Transformer.Data.FromData, { data: source.data, id: source.id })
                : action.add(this.root, Transformer.Data.Download, { url: source.url!, type: format.isBinary ? 'Binary' : 'String', id: source.id, title: 'Molecule' });
            
            let model = data
                .then(Transformer.Molecule.CreateFromData, { format, customId: source.id }, { isBinding: true, ref: source.moleculeRef })
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: source.modelRef });

            if (!source.doNotCreateVisual) {
                model.then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true, water: true });
            }

            return this.applyTransform(data);
        }

        /**
         * Destroys the the plugin instance.
         * The controller becomes unusable as a result.
         */
        destroy() {
            if (!this._instance) return;
            this._instance.destroy();
            this._instance = <any>void 0;
        }

        private ofOptions(options: PluginControllerOptions) {
            const spec = options.customSpecification ? options.customSpecification : getDefaultSpecification();

            if (!!options.allowAnalytics && !options.customSpecification) {
                spec.behaviours.push(Bootstrap.Behaviour.GoogleAnalytics(options.analyticsId ? options.analyticsId : 'UA-77062725-1'));
            }

            let target: HTMLElement;
            if (options.target instanceof HTMLElement) {
                target = options.target;
            } else {
                target = document.querySelector(options.target)! as HTMLElement;
            }

            if (!target) {
                throw new Error("options.target cannot be undefined.");
            }

            this._instance = new Instance(spec, target);

            if (options.viewportBackground) {
                this.setViewportBackground(options.viewportBackground!);
            }

            if (options.layoutState) {
                this.setLayoutState(options.layoutState);
            }
        }

        private ofInstace(instance: Bootstrap.Plugin.Instance) {
            this._instance = instance;
        }

        constructor(optionsOrInstance: PluginControllerOptions | Bootstrap.Plugin.Instance) {
            if ((optionsOrInstance as Instance).getTransformerInfo) {
                this.ofInstace(optionsOrInstance as Instance);
            } else {
                this.ofOptions(optionsOrInstance as PluginControllerOptions);
            }
        }
    }

    export function create(options: PluginControllerOptions) {
        return new Controller(options);
    }
}