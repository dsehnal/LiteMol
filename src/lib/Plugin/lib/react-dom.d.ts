// Type definitions for React (react-dom) 15.5
// Project: http://facebook.github.io/react/
// Definitions by: Asana <https://asana.com>, AssureSign <http://www.assuresign.com>, Microsoft <https://microsoft.com>, MartynasZilinskas <https://github.com/MartynasZilinskas>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

declare namespace __LiteMolReactDOM {
    export function findDOMNode<E extends Element>(instance: __LiteMolReact.ReactInstance): E;
    export function findDOMNode(instance: __LiteMolReact.ReactInstance): Element;

    export function render<P extends __LiteMolReact.DOMAttributes<T>, T extends Element>(
        element: __LiteMolReact.DOMElement<P, T>,
        container: Element | null,
        callback?: (element: T) => any
    ): T;
    export function render<P>(
        element: __LiteMolReact.SFCElement<P>,
        container: Element | null,
        callback?: () => any
    ): void;
    export function render<P, T extends __LiteMolReact.Component<P, __LiteMolReact.ComponentState>>(
        element: __LiteMolReact.CElement<P, T>,
        container: Element | null,
        callback?: (component: T) => any
    ): T;
    export function render<P>(
        element: __LiteMolReact.ReactElement<P>,
        container: Element | null,
        callback?: (component?: __LiteMolReact.Component<P, __LiteMolReact.ComponentState> | Element) => any
    ): __LiteMolReact.Component<P, __LiteMolReact.ComponentState> | Element | void;
    export function render<P>(
        parentComponent: __LiteMolReact.Component<any, any>,
        element: __LiteMolReact.SFCElement<P>,
        container: Element,
        callback?: () => any
    ): void;

    export function unmountComponentAtNode(container: Element): boolean;

    export const version: string;

    export function unstable_batchedUpdates<A, B>(callback: (a: A, b: B) => any, a: A, b: B): void;
    export function unstable_batchedUpdates<A>(callback: (a: A) => any, a: A): void;
    export function unstable_batchedUpdates(callback: () => any): void;

    export function unstable_renderSubtreeIntoContainer<P extends __LiteMolReact.DOMAttributes<T>, T extends Element>(
        parentComponent: __LiteMolReact.Component<any, any>,
        element: __LiteMolReact.DOMElement<P, T>,
        container: Element,
        callback?: (element: T) => any): T;
    export function unstable_renderSubtreeIntoContainer<P, T extends __LiteMolReact.Component<P, __LiteMolReact.ComponentState>>(
        parentComponent: __LiteMolReact.Component<any, any>,
        element: __LiteMolReact.CElement<P, T>,
        container: Element,
        callback?: (component: T) => any): T;
    export function unstable_renderSubtreeIntoContainer<P>(
        parentComponent: __LiteMolReact.Component<any, any>,
        element: __LiteMolReact.ReactElement<P>,
        container: Element,
        callback?: (component?: __LiteMolReact.Component<P, __LiteMolReact.ComponentState> | Element) => any): __LiteMolReact.Component<P, __LiteMolReact.ComponentState> | Element | void;
}