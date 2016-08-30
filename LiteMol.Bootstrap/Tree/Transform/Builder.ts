/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Tree.Transform {
    "use strict";
    
    import Node = Tree.Node.Any;
            
    export function build() {
        return new Builder.Impl(void 0, []) as Builder.Any;
    }
        
    export interface Builder<A extends Node, B extends Node, P> {        
        add<A extends Node, B extends Node, P>(s: Selector<A>, t: Transformer<A, B, P>, params: P, props?: Transform.Props): Builder<A, B, P>        
        then<C extends Node, Q>(t: Transformer<B, C, Q>, params: Q, props?:Transform.Props): Builder<A, C, Q>
        compile(): Instance[]
    } 
    
    export namespace Builder {
        export class Impl<A extends Node, B extends Node, P> implements Builder<A, B, P> {            
                        
            add<A extends Node, B extends Node, P>(s: Selector<A>, t: Transformer<A, B, P>, params: P, props?: Transform.Props): Builder<A, B, P> {
                let i = { selector: s, transform: t.create(params, props) };
                this.transforms.push(i);
                this.last = i;
                return new Impl(i, this.transforms);
            }
            
            then<C extends Node, Q>(t: Transformer<B, C, Q>, params: Q, props?:Transform.Props): Builder<A, C, Q> {                
                if (!this.last) throw `Cannot 'then' on an empty builder`;                
                let transform = t.create(params, props);
                let i = <Instance>{ selector: this.last.transform.props.ref, transform };
                this.transforms.push(i);
                return new Impl(i, this.transforms);
            }
            
            compile() {
                return this.transforms;
            }
            
            constructor(public last: Instance, public transforms: Instance[]) {                
            }
        }  
        
        export type Any = Builder<any, any, any>
        
    }       
}