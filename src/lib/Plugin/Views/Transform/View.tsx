/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Transform {
    "use strict";

    export abstract class ControllerBase<C extends Bootstrap.Components.Transform.Controller<any>> extends
        Views.View<C, {}, {
            customHeader?: string,
            hideBadge?: boolean,
            isAction?: boolean,
            showVisibilityIcon?: boolean
        }> {

        protected abstract renderControls(): void;

        get params(): C['latestState']['params'] {
            return this.controller.latestState.params;
        }

        updateParams(p: Partial<C['latestState']['params']>) {
            this.controller.updateParams(p);
        }

        autoUpdateParams(p: Partial<C['latestState']['params']>) {
            this.controller.autoUpdateParams(p);
        }

        getPersistentState<T>(prop: string, defaultValue: T) {
            return this.controller.context.transforms.getPersistentState<T>(this.controller.transformer, this.transformSourceEntity, prop, defaultValue);
        }

        setPersistentState<T>(prop: string, value: T) {
            if (this.controller.context.transforms.setPersistentState(this.controller.transformer, this.transformSourceEntity, prop, value)) {
                this.forceUpdate();
            }
        }

        get transformSourceEntity() {
            return this.isUpdate ? this.controller.entity.parent : this.controller.entity;
        }

        get isUpdate() {
            return this.controller.isUpdate;
        }

        get canApply() {
            let state = this.controller.latestState;
            let base = state.canApply! && (!this.isUpdate || state.isDirty!) && !state.isBusy;
            if (base && this.isUpdate && state.parametersAutoUpdating) return false;
            return base;
        }

        protected applyEnter(e: React.KeyboardEvent<HTMLElement>) {
            if (!this.canApply) return;
            (e.target as HTMLElement).blur();
            this.controller.apply();
        }

        render() {
            let isUpdate = this.isUpdate;
            let state = this.controller.latestState;
            let issues = state.issues;
            let hasError = issues && issues.length;
            let isBusy = state.isBusy;
            let offMsg = isBusy ? 'Working...' : isUpdate && !hasError ? 'Nothing to update' : (issues ? issues[0] : void 0);
            let t = this.controller.transformer.info;
            let commit = <Controls.CommitButton action={() => this.controller.apply()} isOn={this.canApply} title={issues && issues.length ? issues[0] : this.canApply ? isUpdate ? 'An update will remove all child nodes.' : void 0 : void 0}
                on={isUpdate ? 'Update' : this.props.isAction ? 'Apply' : 'Add'} off={offMsg} />

            let showCommit = this.canApply || hasError;

            let header = this.props.customHeader
                ? this.props.customHeader
                : (isUpdate ? 'Update ' : '') + t.name;

            let isExpanded = this.getPersistentState('isExpanded', true);

            return <div className='lm-transformer-wrapper'>
                <Controls.Panel
                    header={header}
                    badge={this.props.hideBadge ? void 0 : <Entity.Badge type={t.to[0].info} />}
                    className={'lm-control lm-transformer lm-panel-' + t.to[0].info.typeClass} key={t.id} title={t.description} isExpanded={isExpanded}
                    onExpand={e => { this.setPersistentState('isExpanded', e) } }
                    description={this.controller.transformer.info.description}
                    topRightAction={this.props.showVisibilityIcon ? <Entity.VisibilityControl entity={this.controller.entity} /> : void 0}>
                    {this.renderControls()}
                    {showCommit ? commit : void 0}
                </Controls.Panel>
            </div>;
        }

    }

    export class Empty extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{}>> {
        protected renderControls() {
            return <div>
            </div>
        }
    }

    export class View extends Views.View<Bootstrap.Components.Transform.View, {}, {}> {

        render() {
            let ctx = this.controller.context;

            let plugin = ctx.plugin as Instance;
            let state = this.controller.latestState;
            let transforms = state.transforms!;

            let views = transforms.map(t => {
                let v = plugin.getTransformerInfo(t.transformer).view;
                return React.createElement(v, { controller: t, key: t.transformer.info.id + '-' + t.entity.id });
            });

            if (state.update) {
                let v = plugin.getTransformerInfo(state.update.transformer).view;
                views.push(React.createElement(v, { controller: state.update, key: state.update.transformer.info.id + '-' + state.update.entity.id }));
            }

            return <div className='lm-transform-view'>
                {views}
            </div>;
        }

    }

    export const TransparencyControl = (props: {
        onChange: (td: LiteMol.Visualization.Theme.Transparency) => void;
        definition: LiteMol.Visualization.Theme.Transparency
    }) => {

        let d = props.definition.alpha!;
        return <Controls.Slider label='Opacity' onChange={v => props.onChange({ alpha: v, writeDepth: props.definition.writeDepth })}
            min={0} max={1} step={0.01} value={d} />
    }

    export class Updater extends Views.View<Bootstrap.Components.Transform.Updater, {}, {}> {

        componentWillMount() {
            super.componentWillMount();

            this.subscribe(Bootstrap.Event.Tree.NodeUpdated.getStream(this.controller.context), (s) => {
                let c = this.controller.latestState.controller;
                let e = c && c.entity;
                if (s.data === e) this.forceUpdate();
            });
        }

        render() {
            let c = this.controller.latestState.controller;
            if (!c) return <div className='lm-empty-control' />

            let ctx = this.controller.context;
            let plugin = ctx.plugin as Instance;
            let v = plugin.getTransformerInfo(c.transformer).view;

            if (!v) {
                console.warn(`Count not find view for updater (${c.transformer.info.id}), please register it.`);
                return <div className='lm-empty-control' />
            }

            return React.createElement(v, { controller: c, key: c.transformer.info.id + '-' + c.entity.id, customHeader: this.controller.header, hideBadge: true, showVisibilityIcon: true });
        }
    }

    export class Action extends Views.View<Bootstrap.Components.Transform.Action, {}, {}> {
        render() {
            let c = this.controller.latestState.controller;
            if (!c) return <div className='lm-empty-control' />

            let ctx = this.controller.context;
            let plugin = ctx.plugin as Instance;
            let v = plugin.getTransformerInfo(c.transformer).view;

            if (!v) {
                console.warn(`Count not find view for updater (${c.transformer.info.id}), please register it.`);
                return <div className='lm-empty-control' />
            }

            return React.createElement(v, { controller: c, key: c.transformer.info.id + '-' + c.entity.id, customHeader: this.controller.header, hideBadge: true, isAction: true });
        }
    }
}