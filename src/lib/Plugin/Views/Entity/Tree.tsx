/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Entity {
    "use strict";
    
    import BEntity = Bootstrap.Entity
    
    export const VisibilityControl = (props: { entity: BEntity.Any }) => {
        let e = props.entity;

        let command = () => {
            Bootstrap.Command.Entity.SetVisibility.dispatch(e.tree!.context, { entity: e, visible: e.state.visibility === BEntity.Visibility.Full ? false : true} );
        }

        let state = e.state.visibility;
        let cls: string, title: string;
        if (state === BEntity.Visibility.Full) { cls = 'full'; title = 'Hide' }
        else if (state === BEntity.Visibility.None) { cls = 'none'; title = 'Show' }
        else { cls = 'partial'; title = 'Show' }

        return <Controls.Button title={title} onClick={command} icon='visual-visibility' style='link' 
                        customClass={`lm-entity-tree-entry-toggle-visible lm-entity-tree-entry-toggle-visible-${cls}` } />;  
    }

    class Entity extends ObserverView<{ node: BEntity.Any, tree: Tree }, {}> {

        private renderedVersion = -1;
        private ctx: Bootstrap.Context;
        private root: HTMLDivElement | undefined = void 0;
        
        private ensureVisible() {
            if (this.ctx.currentEntity === this.props.node) {
                if (this.root) this.props.tree.scrollIntoView(this.root);
            }
        }
        
        componentDidMount() {
            this.ensureVisible();   
        }
        
        componentDidUpdate() {
            this.ensureVisible();
        }
        
        get node() {
            return this.props.node;
        }
        
        shouldComponentUpdate(nextProps: { node: BEntity.Any, tree: Tree }, nextState: { version: number }, nextContext: any) {
            return this.node.version !== this.renderedVersion;
        }
    
        componentWillMount() {                        
            this.ctx = this.props.node.tree!.context;
            let node = this.node;
            //this.state.version = node.version;                            
            this.subscribe(Bootstrap.Event.Tree.NodeUpdated.getStream(this.ctx), e => {
                if (e.data === node) {
                    if (node.version !== this.renderedVersion) this.forceUpdate();
                    if (this.ctx.currentEntity === node && this.isFullyBound()) {
                        setTimeout(Bootstrap.Command.Entity.SetCurrent.dispatch(this.ctx, node.children[0]), 0);
                    }
                }
            });
        }
        
        private highlight(isOn: boolean) {
            let node = this.node;            
            Bootstrap.Command.Entity.Highlight.dispatch(this.ctx, { entities: this.ctx.select(Bootstrap.Tree.Selection.byValue(node).subtree()), isOn: isOn });
        }
        
        private row(childCount: number) {
            let entity = this.props.node;
            let props = entity.props;
            let isRoot = entity.parent === entity;  
                                                
            let title = props.label;
            if (props.description) title += ' (' + props.description + ')';

            return <div className={'lm-entity-tree-entry-body' + (this.ctx.currentEntity === entity ? ' lm-entity-tree-entry-current' : '') + (this.isOnCurrentPath() ? ' lm-entity-tree-entry-current-path' : '')} 
                        ref={root => this.root = root!}>
                <Badge type={entity.type.info} />
                <div className='lm-entity-tree-entry-label-wrap'>
                    <Controls.Button  onClick={() => Bootstrap.Command.Entity.SetCurrent.dispatch(this.ctx, entity) }
                        customClass='lm-entity-tree-entry-label' style='link' title={title}>
                        <span>
                            {props.label}
                            <span className='lm-entity-tree-entry-label-tag'>
                                {props.description ? ' ' + props.description : void 0}
                            </span>
                        </span>
                    </Controls.Button>
                </div>
                { !isRoot || childCount  
                    ? <Controls.Button title='Remove' onClick={() => Bootstrap.Command.Tree.RemoveNode.dispatch(entity.tree!.context, entity) } icon='remove' style='link' customClass='lm-entity-tree-entry-remove' />
                    : void 0 }
                { isRoot && !childCount ? void 0 :  <VisibilityControl entity={entity} /> }
            </div>;
                //<RemoveEntityControl entity={entity} />
        }
        
        private renderFlat() {
            let node = this.node; 
            let children: any[] = [];
            for (let c of node.children) {        
                children.push(<Entity key={c.id} node={c} tree={this.props.tree} />);
            }
            
            return <div key={node.id}>
                {children}
            </div>;
        }

        private isFullyBound() {
            let isFullyBound = true;
            for (let c of this.node.children) {
                if (!c.transform.props.isBinding) {
                    isFullyBound = false;
                    break;  
                } 
            }
            return isFullyBound && this.node.children.length === 1;
        }
        
        private isOnCurrentPath() {
            if (!this.ctx.currentEntity) return false;
            
            let n = this.ctx.currentEntity.parent;
            let node = this.node; 
            while (n.parent !== n) {
                if (n === node) return true;
                n = n.parent;
            }
            
            return false;
        }
                
        render() {
            
            let node = this.node;                                    
            this.renderedVersion = node.version;
            let isRoot = node.parent === node;        
            
            if (this.isFullyBound()) return this.renderFlat();
            
            let state = node.state;
            
            let childCount = 0;
            let children: any[] = [];
            
            for (let c of node.children) {     
                if (c.isHidden) continue;   
                if (!isRoot) children.push(<Entity key={c.id} node={c} tree={this.props.tree} />);
                childCount++;
            }
                  
                        
            let expander: any;     
            if (children.length) {
                expander = state.isCollapsed 
                    ?  <Controls.Button style='link' title='Expand' onClick={() =>  Bootstrap.Command.Entity.ToggleExpanded.dispatch(this.ctx, node) } icon='expand' customClass='lm-entity-tree-entry-toggle-group' />
                    :  <Controls.Button style='link' title='Collapse' onClick={() =>  Bootstrap.Command.Entity.ToggleExpanded.dispatch(this.ctx, node)  } icon='collapse' customClass='lm-entity-tree-entry-toggle-group' />;
            } else {
                if (/*BEntity.isVisual(node) &&*/ node.state.visibility === BEntity.Visibility.Full && node.type.info.traits.isFocusable) {
                    expander = <Controls.Button style='link' icon='focus-on-visual' title='Focus'
                        onClick={() => Bootstrap.Command.Entity.Focus.dispatch(this.ctx, this.ctx.select(node) ) } 
                        customClass='lm-entity-tree-entry-toggle-group' />
                } 
            }
                        
            let main = <div className={'lm-entity-tree-entry'} 
                onMouseEnter={() => this.highlight(true)} 
                onMouseLeave={() => this.highlight(false)}
                onTouchStart={() => setTimeout(() => this.highlight(true), 1000 / 30) }
                onTouchCancel={() => setTimeout(() => this.highlight(false), 1000 / 30) }
                onTouchEnd={() => setTimeout(() => this.highlight(false), 1000 / 30) } >
                {expander}
                {this.row(childCount)}
            </div>;
                  
            return <div key={node.id} className={(isRoot ? 'lm-entity-tree-root' : '')}>
                {main}
                <div className='lm-entity-tree-children-wrap' style={{ display: state.isCollapsed ? 'none' : 'block' }}>
                    {children}
                </div>
            </div>
        } 
    }
    
    export class Tree extends View<Bootstrap.Components.Component<{}>, {}, {}> {private renderedVersion = -1;
        private root: HTMLDivElement | undefined = void 0;
        
        scrollIntoView(element: Element) {
            const node = this.root;
            if (!node || !element) return;
            
            try {
                const parent = node.getBoundingClientRect();
                const rect = element.getBoundingClientRect();
                const scrollTop = node.scrollTop;             
                
                if (rect.top < parent.top) {
                    const d = parent.top - rect.top;
                    node.scrollTop = scrollTop - d;
                } else if (rect.bottom > parent.bottom) {
                    const d = rect.bottom - parent.bottom;
                    node.scrollTop = scrollTop + d;
                }
            } catch(e) {
                
            }
        }
        
        componentWillMount() {                        
            const node = this.controller.context.tree.root;
            const ctx = node.tree!.context;
            //this.state.version = node.version;                            
            this.subscribe(Bootstrap.Event.Tree.NodeUpdated.getStream(ctx), e => {
                if (e.data === node) {
                    if (node.version !== this.renderedVersion) this.forceUpdate();
                }
            });
        }
        
        private splash = SplashInfo.Info()
        
        render() {
            
            let root = this.controller.context.tree.root;
            this.renderedVersion = root.version;
            let children: any[] = [];
            
            for (let c of root.children) {     
                if (c.isHidden) continue;   
                children.push(<Entity key={c.id} node={c} tree={this} />);
            }
            
            return <div className='lm-entity-tree' ref={root => this.root = root!}>
                <Entity key={root.id} node={root} tree={this} />
                <div className='lm-entity-tree-children'>
                    {children.length ? children : this.splash }
                </div>                    
            </div>;
        }
    }
}