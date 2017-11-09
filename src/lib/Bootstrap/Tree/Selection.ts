/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Tree {
    "use strict";

    export type Selector<T extends Node.Any> = Selection.Query<T> | Selection.Helpers.Builder<T> | string | T;

    export namespace Selection {
        export type NodeSeq<T extends Node.Any> = T[];
        export type Query<T extends Node.Any> = (tree: Tree<T>) => NodeSeq<T>;

        export function select<T extends Node.Any>(s: Selector<T>, tree: Tree<T>) {
            return compile<T>(s)(tree);
        }

        export function compile<T extends Node.Any>(s: Selector<T>): Query<T> {
            let selector = s ? s : Selection.root();
            let query: Query<T>;
            if (isBuilder(selector)) query = (selector as any).compile();
            else if (isEntity(selector)) query = (Selection.byValue(selector) as any).compile();
            else if (isQuery(selector)) query = selector;
            else query = (Selection.byRef(selector as string) as any).compile();
            return query;
        }

        function isEntity<T extends Node.Any>(arg: any): arg is T {
            return arg.ref !== void 0;
        }

        function isBuilder<T extends Node.Any>(arg: any): arg is Helpers.Builder<T> {
            return arg.compile !== void 0;
        }

        function isQuery<T extends Node.Any>(arg: any): arg is Query<T> {
            return typeof arg === 'function';
        }

        export namespace Helpers {
            export const BuilderPrototype: any = {};
            export function registerModifier(name: string, f: Function) {
                BuilderPrototype[name] = function (this: any, ...args: any[]) { return f.call(void 0, this, ...args) };
            }

            export interface Builder<T extends Node.Any> {
                flatMap(f: (n: Node.Any) => Node.Any[]): Builder<T>;
                mapEntity(f: (n: Node.Any) => Node.Any): Builder<T>;
                unique(): Builder<T>;

                parent(): Builder<T>;
                first(): Builder<T>;
                filter(p: (n: Node.Any) => boolean): Builder<T>;
                subtree(): Builder<T>;
                children(): Builder<T>;
                ofType(t: Node.AnyType): Builder<T>;
                ancestorOfType(t: Node.AnyType): Builder<T>;
            }
        }

        function build<T extends Node.Any>(compile: () => Query<T>): Helpers.Builder<T> {
            return Object.create(Helpers.BuilderPrototype, { compile: { writable: false, configurable: false, value: compile } });
        }

        export function root<T extends Node.Any>() { return build(() => (tree: Tree<T>) => [tree.root]) }
        export function byRef<T extends Node.Any>(...refs: string[]) { return build(() => (tree: Tree<T>) => {
                let ret: T[] = [];
                for (let ref of refs) {
                    let xs = tree.refs.get(ref);
                    if (!xs) continue;
                    for (let x of xs) ret.push(x);
                }
                return ret;
            }); 
        }
        export function byValue<T extends Node.Any>(...entities: Node.Any[]) { return build(() => (tree: Tree<T>) => entities); }

        Helpers.registerModifier('flatMap', flatMap);
        export function flatMap<T extends Node.Any>(b: Selector<T>, f: (n: T) => NodeSeq<T>) { 
            let q = compile<T>(b);
            return build(() => (tree: Tree<T>) => {
                let ret: T[] = [];
                for (let n of q(tree)) {
                    for (let m of f(n)) {
                        ret.push(m);
                    }
                }
                return ret;
            });
        }

        Helpers.registerModifier('mapEntity', mapEntity);
        export function mapEntity<T extends Node.Any>(b: Selector<T>, f: (n: T) => T) {
            let q = compile<T>(b);
            return build(() => (tree: Tree<T>) => {
                let ret: T[] = [];
                for (let n of q(tree)) {
                    let x = f(n);
                    if (x) ret.push(x);
                }
                return ret;
            });
        }

        Helpers.registerModifier('unique', unique);
        export function unique<T extends Node.Any>(b: Selector<T>) {
            let q = compile<T>(b);
            return build(() => (tree: Tree<T>) => {
                let set = Core.Utils.FastSet.create<number>();
                let ret: T[] = [];
                for (let n of q(tree)) {
                    if (!set.has(n.id)) {
                        set.add(n.id);
                        ret.push(n);
                    }
                }
                return ret;
            })
        }

        Helpers.registerModifier('first', first);
        export function first<T extends Node.Any>(b: Selector<T>) { let q = compile<T>(b); return build(() => (tree: Tree<T>) => [q(tree)[0]]); }

        Helpers.registerModifier('filter', filter);
        export function filter<T extends Node.Any>(b: Selector<T>, p: (n: Node.Any) => boolean) { return flatMap<T>(b, n => p(n) ? [n] : []); }

        Helpers.registerModifier('subtree', subtree);
        export function subtree<T extends Node.Any>(b: Selector<T>) { return flatMap<T>(b, n => Tree.Node.collect(n) as any); }

        Helpers.registerModifier('children', children);
        export function children<T extends Node.Any>(b: Selector<T>) { return flatMap<T>(b, n => <T[]>n.children); }

        Helpers.registerModifier('ofType', ofType);
        export function ofType<T extends Node.Any>(b: Selector<T>, t: Node.AnyType) { return filter<T>(b, n => n.type === t); }

        Helpers.registerModifier('ancestorOfType', ancestorOfType);
        export function ancestorOfType<T extends Node.Any>(b: Selector<T>, t: Node.AnyType) { return unique(mapEntity<T>(b, n => <T>Node.findAncestor(n, t))); }

        Helpers.registerModifier('parent', parent);
        export function parent<T extends Node.Any>(b: Selector<T>) { return unique(mapEntity<T>(b, n => <T>n.parent)); }
    }
}