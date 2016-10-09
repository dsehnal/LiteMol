


// Project: https://github.com/jakearchibald/ES6-Promise
// Definitions by: François de Campredon <https://github.com/fdecampredon/>, vvakame <https://github.com/vvakame>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace __Promise {
    interface Thenable<T> {
        then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
        then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
        catch<U>(onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    }

    class Promise<T> implements Thenable<T> {
        /**
         * If you call resolve in the body of the callback passed to the constructor,
         * your promise is fulfilled with result object passed to resolve.
         * If you call reject your promise is rejected with the object passed to reject.
         * For consistency and debugging (eg stack traces), obj should be an instanceof Error.
         * Any errors thrown in the constructor callback will be implicitly passed to reject().
         */
        constructor(callback: (resolve: (value?: T | Thenable<T>) => void, reject: (error?: any) => void) => void);

        /**
         * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
         * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
         * Both callbacks have a single parameter , the fulfillment value or rejection reason.
         * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
         * If an error is thrown in the callback, the returned promise rejects with that error.
         *
         * @param onFulfilled called when/if "promise" resolves
         * @param onRejected called when/if "promise" rejects
         */
        then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
        then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;

        /**
         * Sugar for promise.then(undefined, onRejected)
         *
         * @param onRejected called when/if "promise" rejects
         */
        catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
    }

    namespace Promise {
        /**
         * Make a new promise from the thenable.
         * A thenable is promise-like in as far as it has a "then" method.
         */
        function resolve<T>(value?: T | Thenable<T>): Promise<T>;

        /**
         * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
         */
        function reject(error: any): Promise<any>;
        function reject<T>(error: T): Promise<T>;

        /**
         * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects.
         * the array passed to all can be a mixture of promise-like objects and other objects.
         * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
         */
        function all<T>(promises: (T | Thenable<T>)[]): Promise<T[]>;

        /**
         * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
         */
        function race<T>(promises: (T | Thenable<T>)[]): Promise<T>;
    }
}
// DefinitelyTyped: partial

// This file contains common part of defintions for rx.d.ts and rx.lite.d.ts
// Do not include the file separately.

declare namespace __LiteMolRx {
    export module internals {
        function isEqual(left: any, right: any): boolean;
        function addRef<T>(xs: Observable<T>, r: { getDisposable(): IDisposable; }): Observable<T>;

        // Priority Queue for Scheduling
        export class PriorityQueue<TTime> {
            constructor(capacity: number);

            length: number;

            isHigherPriority(left: number, right: number): boolean;
            percolate(index: number): void;
            heapify(index: number): void;
            peek(): ScheduledItem<TTime>;
            removeAt(index: number): void;
            dequeue(): ScheduledItem<TTime>;
            enqueue(item: ScheduledItem<TTime>): void;
            remove(item: ScheduledItem<TTime>): boolean;

            static count: number;
        }

        export class ScheduledItem<TTime> {
            constructor(scheduler: IScheduler, state: any, action: (scheduler: IScheduler, state: any) => IDisposable, dueTime: TTime, comparer?: (x: TTime, y: TTime) => number);

            scheduler: IScheduler;
            state: TTime;
            action: (scheduler: IScheduler, state: any) => IDisposable;
            dueTime: TTime;
            comparer: (x: TTime, y: TTime) => number;
            disposable: SingleAssignmentDisposable;

            invoke(): void;
            compareTo(other: ScheduledItem<TTime>): number;
            isCancelled(): boolean;
            invokeCore(): IDisposable;
        }
    }

    export module config {
        export var Promise: { new <T>(resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): IPromise<T>; };
    }

    export module helpers {
        function noop(): void;
        function notDefined(value: any): boolean;
        function identity<T>(value: T): T;
        function defaultNow(): number;
        function defaultComparer(left: any, right: any): boolean;
        function defaultSubComparer(left: any, right: any): number;
        function defaultKeySerializer(key: any): string;
        function defaultError(err: any): void;
        function isPromise(p: any): boolean;
        function asArray<T>(...args: T[]): T[];
        function not(value: any): boolean;
        function isFunction(value: any): boolean;
    }

    export interface IDisposable {
        dispose(): void;
    }

    export class CompositeDisposable implements IDisposable {
        constructor(...disposables: IDisposable[]);
        constructor(disposables: IDisposable[]);

        isDisposed: boolean;
        length: number;

        dispose(): void;
        add(item: IDisposable): void;
        remove(item: IDisposable): boolean;
        toArray(): IDisposable[];
    }

    export class Disposable implements IDisposable {
        constructor(action: () => void);

        static create(action: () => void): IDisposable;
        static empty: IDisposable;

        dispose(): void;
    }

    // Single assignment
    export class SingleAssignmentDisposable implements IDisposable {
        constructor();

        isDisposed: boolean;
        current: IDisposable;

        dispose(): void;
        getDisposable(): IDisposable;
        setDisposable(value: IDisposable): void;
    }

    // SerialDisposable it's an alias of SingleAssignmentDisposable
    export class SerialDisposable extends SingleAssignmentDisposable {
        constructor();
    }

    export class RefCountDisposable implements IDisposable {
        constructor(disposable: IDisposable);

        dispose(): void;

        isDisposed: boolean;
        getDisposable(): IDisposable;
    }

    export interface IScheduler {
        now(): number;
        isScheduler(value: any): boolean;

        schedule(action: () => void): IDisposable;
        scheduleWithState<TState>(state: TState, action: (scheduler: IScheduler, state: TState) => IDisposable): IDisposable;
        scheduleWithAbsolute(dueTime: number, action: () => void): IDisposable;
        scheduleWithAbsoluteAndState<TState>(state: TState, dueTime: number, action: (scheduler: IScheduler, state: TState) => IDisposable): IDisposable;
        scheduleWithRelative(dueTime: number, action: () => void): IDisposable;
        scheduleWithRelativeAndState<TState>(state: TState, dueTime: number, action: (scheduler: IScheduler, state: TState) => IDisposable): IDisposable;

        scheduleRecursive(action: (action: () => void) => void): IDisposable;
        scheduleRecursiveWithState<TState>(state: TState, action: (state: TState, action: (state: TState) => void) => void): IDisposable;
        scheduleRecursiveWithAbsolute(dueTime: number, action: (action: (dueTime: number) => void) => void): IDisposable;
        scheduleRecursiveWithAbsoluteAndState<TState>(state: TState, dueTime: number, action: (state: TState, action: (state: TState, dueTime: number) => void) => void): IDisposable;
        scheduleRecursiveWithRelative(dueTime: number, action: (action: (dueTime: number) => void) => void): IDisposable;
        scheduleRecursiveWithRelativeAndState<TState>(state: TState, dueTime: number, action: (state: TState, action: (state: TState, dueTime: number) => void) => void): IDisposable;

        schedulePeriodic(period: number, action: () => void): IDisposable;
        schedulePeriodicWithState<TState>(state: TState, period: number, action: (state: TState) => TState): IDisposable;
    }

    export interface Scheduler extends IScheduler {
    }

    export interface SchedulerStatic {
        new (
            now: () => number,
            schedule: (state: any, action: (scheduler: IScheduler, state: any) => IDisposable) => IDisposable,
            scheduleRelative: (state: any, dueTime: number, action: (scheduler: IScheduler, state: any) => IDisposable) => IDisposable,
            scheduleAbsolute: (state: any, dueTime: number, action: (scheduler: IScheduler, state: any) => IDisposable) => IDisposable): Scheduler;

        normalize(timeSpan: number): number;

        immediate: IScheduler;
        currentThread: ICurrentThreadScheduler;
        default: IScheduler; // alias for Scheduler.timeout
        timeout: IScheduler;
    }

    export var Scheduler: SchedulerStatic;

    // Current Thread IScheduler
    interface ICurrentThreadScheduler extends IScheduler {
        scheduleRequired(): boolean;
    }

    // Notifications
    export class Notification<T> {
        accept(observer: IObserver<T>): void;
        accept<TResult>(onNext: (value: T) => TResult, onError?: (exception: any) => TResult, onCompleted?: () => TResult): TResult;
        toObservable(scheduler?: IScheduler): Observable<T>;
        hasValue: boolean;
        equals(other: Notification<T>): boolean;
        kind: string;
        value: T;
        exception: any;

        static createOnNext<T>(value: T): Notification<T>;
        static createOnError<T>(exception: any): Notification<T>;
        static createOnCompleted<T>(): Notification<T>;
    }

	/**
	 * Promise A+
	 */
    export interface IPromise<T> {
        then<R>(onFulfilled: (value: T) => IPromise<R>, onRejected: (reason: any) => IPromise<R>): IPromise<R>;
        then<R>(onFulfilled: (value: T) => IPromise<R>, onRejected?: (reason: any) => R): IPromise<R>;
        then<R>(onFulfilled: (value: T) => R, onRejected: (reason: any) => IPromise<R>): IPromise<R>;
        then<R>(onFulfilled?: (value: T) => R, onRejected?: (reason: any) => R): IPromise<R>;
    }

    // Observer
    export interface IObserver<T> {
        onNext(value: T): void;
        onError(exception: any): void;
        onCompleted(): void;
    }

    export interface Observer<T> extends IObserver<T> {
        toNotifier(): (notification: Notification<T>) => void;
        asObserver(): Observer<T>;
    }

    interface ObserverStatic {
        create<T>(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observer<T>;
        fromNotifier<T>(handler: (notification: Notification<T>, thisArg?: any) => void): Observer<T>;
    }

    export var Observer: ObserverStatic;

    export interface IObservable<T> {
        subscribe(observer: Observer<T>): IDisposable;
        subscribe(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;

        subscribeOnNext(onNext: (value: T) => void, thisArg?: any): IDisposable;
        subscribeOnError(onError: (exception: any) => void, thisArg?: any): IDisposable;
        subscribeOnCompleted(onCompleted: () => void, thisArg?: any): IDisposable;
    }

    export interface Observable<T> extends IObservable<T> {
        forEach(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;	// alias for subscribe
        toArray(): Observable<T[]>;

        catch(handler: (exception: any) => Observable<T>): Observable<T>;
        catchException(handler: (exception: any) => Observable<T>): Observable<T>;	// alias for catch
        catch(handler: (exception: any) => IPromise<T>): Observable<T>;
        catchException(handler: (exception: any) => IPromise<T>): Observable<T>;	// alias for catch
        catch(second: Observable<T>): Observable<T>;
        catchException(second: Observable<T>): Observable<T>;	// alias for catch
        combineLatest<T2, TResult>(second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        combineLatest<T2, TResult>(second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        combineLatest<T2, T3, TResult>(second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T2, T3, TResult>(second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T2, T3, TResult>(second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T2, T3, TResult>(second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, TResult>(second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T2, T3, T4, T5, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, fifth: Observable<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        combineLatest<TOther, TResult>(souces: Observable<TOther>[], resultSelector: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
        combineLatest<TOther, TResult>(souces: IPromise<TOther>[], resultSelector: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
        withLatestFrom<T2, TResult>(second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        withLatestFrom<T2, TResult>(second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, TResult>(second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, TResult>(second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, TResult>(second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, TResult>(second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, TResult>(second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T2, T3, T4, T5, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, fifth: Observable<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        withLatestFrom<TOther, TResult>(souces: Observable<TOther>[], resultSelector: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
        withLatestFrom<TOther, TResult>(souces: IPromise<TOther>[], resultSelector: (firstValue: T, ...otherValues: TOther[]) => TResult): Observable<TResult>;
        concat(...sources: Observable<T>[]): Observable<T>;
        concat(...sources: IPromise<T>[]): Observable<T>;
        concat(sources: Observable<T>[]): Observable<T>;
        concat(sources: IPromise<T>[]): Observable<T>;
        concatAll(): T;
        concatObservable(): T;	// alias for concatAll
        concatMap<T2, R>(selector: (value: T, index: number) => Observable<T2>, resultSelector: (value1: T, value2: T2, index: number) => R): Observable<R>;	// alias for selectConcat
        concatMap<T2, R>(selector: (value: T, index: number) => IPromise<T2>, resultSelector: (value1: T, value2: T2, index: number) => R): Observable<R>;	// alias for selectConcat
        concatMap<R>(selector: (value: T, index: number) => Observable<R>): Observable<R>;	// alias for selectConcat
        concatMap<R>(selector: (value: T, index: number) => IPromise<R>): Observable<R>;	// alias for selectConcat
        concatMap<R>(sequence: Observable<R>): Observable<R>;	// alias for selectConcat
        merge(maxConcurrent: number): T;
        merge(other: Observable<T>): Observable<T>;
        merge(other: IPromise<T>): Observable<T>;
        mergeAll(): T;
        mergeObservable(): T;	// alias for mergeAll
        skipUntil<T2>(other: Observable<T2>): Observable<T>;
        skipUntil<T2>(other: IPromise<T2>): Observable<T>;
        switch(): T;
        switchLatest(): T;	// alias for switch
        takeUntil<T2>(other: Observable<T2>): Observable<T>;
        takeUntil<T2>(other: IPromise<T2>): Observable<T>;
        zip<T2, TResult>(second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        zip<T2, TResult>(second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        zip<T2, T3, TResult>(second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        zip<T2, T3, TResult>(second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        zip<T2, T3, TResult>(second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        zip<T2, T3, TResult>(second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, TResult>(second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        zip<T2, T3, T4, T5, TResult>(second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, fifth: Observable<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        zip<TOther, TResult>(second: Observable<TOther>[], resultSelector: (left: T, ...right: TOther[]) => TResult): Observable<TResult>;
        zip<TOther, TResult>(second: IPromise<TOther>[], resultSelector: (left: T, ...right: TOther[]) => TResult): Observable<TResult>;

        asObservable(): Observable<T>;
        dematerialize<TOrigin>(): Observable<TOrigin>;
        distinctUntilChanged(skipParameter: boolean, comparer: (x: T, y: T) => boolean): Observable<T>;
        distinctUntilChanged<TValue>(keySelector?: (value: T) => TValue, comparer?: (x: TValue, y: TValue) => boolean): Observable<T>;
        do(observer: Observer<T>): Observable<T>;
        doAction(observer: Observer<T>): Observable<T>;	// alias for do
        tap(observer: Observer<T>): Observable<T>;	// alias for do
        do(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observable<T>;
        doAction(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observable<T>;	// alias for do
        tap(onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Observable<T>;	// alias for do

        doOnNext(onNext: (value: T) => void, thisArg?: any): Observable<T>;
        doOnError(onError: (exception: any) => void, thisArg?: any): Observable<T>;
        doOnCompleted(onCompleted: () => void, thisArg?: any): Observable<T>;
        tapOnNext(onNext: (value: T) => void, thisArg?: any): Observable<T>;
        tapOnError(onError: (exception: any) => void, thisArg?: any): Observable<T>;
        tapOnCompleted(onCompleted: () => void, thisArg?: any): Observable<T>;

        finally(action: () => void): Observable<T>;
        finallyAction(action: () => void): Observable<T>;	// alias for finally
        ignoreElements(): Observable<T>;
        materialize(): Observable<Notification<T>>;
        repeat(repeatCount?: number): Observable<T>;
        retry(retryCount?: number): Observable<T>;

		/**
		 *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
		 *  For aggregation behavior with no intermediate results, see Observable.aggregate.
		 * @example
		 *  var res = source.scan(function (acc, x) { return acc + x; });
		 *  var res = source.scan(function (acc, x) { return acc + x; }, 0);
		 * @param accumulator An accumulator function to be invoked on each element.
		 * @param seed The initial accumulator value.
		 * @returns An observable sequence containing the accumulated values.
		 */
        scan<TAcc>(accumulator: (acc: TAcc, value: T, index?: number, source?: Observable<TAcc>) => TAcc, seed: TAcc): Observable<TAcc>;
        scan(accumulator: (acc: T, value: T, index?: number, source?: Observable<T>) => T): Observable<T>;

        skipLast(count: number): Observable<T>;
        startWith(...values: T[]): Observable<T>;
        startWith(scheduler: IScheduler, ...values: T[]): Observable<T>;
        takeLast(count: number): Observable<T>;
        takeLastBuffer(count: number): Observable<T[]>;

        select<TResult>(selector: (value: T, index: number, source: Observable<T>) => TResult, thisArg?: any): Observable<TResult>;
        map<TResult>(selector: (value: T, index: number, source: Observable<T>) => TResult, thisArg?: any): Observable<TResult>;	// alias for select
        pluck<TResult>(prop: string): Observable<TResult>;
        selectMany<TOther, TResult>(selector: (value: T) => Observable<TOther>, resultSelector: (item: T, other: TOther) => TResult): Observable<TResult>;
        selectMany<TOther, TResult>(selector: (value: T) => IPromise<TOther>, resultSelector: (item: T, other: TOther) => TResult): Observable<TResult>;
        selectMany<TResult>(selector: (value: T) => Observable<TResult>): Observable<TResult>;
        selectMany<TResult>(selector: (value: T) => IPromise<TResult>): Observable<TResult>;
        selectMany<TResult>(other: Observable<TResult>): Observable<TResult>;
        selectMany<TResult>(other: IPromise<TResult>): Observable<TResult>;
        selectMany<TResult>(selector: (value: T) => TResult[]): Observable<TResult>;	// alias for selectMany
        flatMap<TOther, TResult>(selector: (value: T) => Observable<TOther>, resultSelector: (item: T, other: TOther) => TResult): Observable<TResult>;	// alias for selectMany
        flatMap<TOther, TResult>(selector: (value: T) => IPromise<TOther>, resultSelector: (item: T, other: TOther) => TResult): Observable<TResult>;	// alias for selectMany
        flatMap<TResult>(selector: (value: T) => Observable<TResult>): Observable<TResult>;	// alias for selectMany
        flatMap<TResult>(selector: (value: T) => IPromise<TResult>): Observable<TResult>;	// alias for selectMany
        flatMap<TResult>(other: Observable<TResult>): Observable<TResult>;	// alias for selectMany
        flatMap<TResult>(other: IPromise<TResult>): Observable<TResult>;	// alias for selectMany
        flatMap<TResult>(selector: (value: T) => TResult[]): Observable<TResult>;	// alias for selectMany

		/**
		 * Projects each notification of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
		 * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
		 * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
		 * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
		 * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
		 * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
		 */
        selectManyObserver<T2, T3, T4>(onNext: (value: T, index: number) => Observable<T2>, onError: (exception: any) => Observable<T3>, onCompleted: () => Observable<T4>, thisArg?: any): Observable<T2 | T3 | T4>;

		/**
		 * Projects each notification of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
		 * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
		 * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
		 * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
		 * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
		 * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
		 */
        flatMapObserver<T2, T3, T4>(onNext: (value: T, index: number) => Observable<T2>, onError: (exception: any) => Observable<T3>, onCompleted: () => Observable<T4>, thisArg?: any): Observable<T2 | T3 | T4>;

        selectConcat<T2, R>(selector: (value: T, index: number) => Observable<T2>, resultSelector: (value1: T, value2: T2, index: number) => R): Observable<R>;
        selectConcat<T2, R>(selector: (value: T, index: number) => IPromise<T2>, resultSelector: (value1: T, value2: T2, index: number) => R): Observable<R>;
        selectConcat<R>(selector: (value: T, index: number) => Observable<R>): Observable<R>;
        selectConcat<R>(selector: (value: T, index: number) => IPromise<R>): Observable<R>;
        selectConcat<R>(sequence: Observable<R>): Observable<R>;

		/**
		*  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
		*  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
		* @param selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
		* @param [thisArg] Object to use as this when executing callback.
		* @returns An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
		*  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
		*/
        selectSwitch<TResult>(selector: (value: T, index: number, source: Observable<T>) => Observable<TResult>, thisArg?: any): Observable<TResult>;
		/**
		*  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
		*  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
		* @param selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
		* @param [thisArg] Object to use as this when executing callback.
		* @returns An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
		*  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
		*/
        flatMapLatest<TResult>(selector: (value: T, index: number, source: Observable<T>) => Observable<TResult>, thisArg?: any): Observable<TResult>;	// alias for selectSwitch
		/**
		*  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
		*  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
		* @param selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
		* @param [thisArg] Object to use as this when executing callback.
		* @since 2.2.28
		* @returns An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
		*  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
		*/
        switchMap<TResult>(selector: (value: T, index: number, source: Observable<T>) => TResult, thisArg?: any): Observable<TResult>;	// alias for selectSwitch

        skip(count: number): Observable<T>;
        skipWhile(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
        take(count: number, scheduler?: IScheduler): Observable<T>;
        takeWhile(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
        where(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
        filter(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>; // alias for where

		/**
		* Converts an existing observable sequence to an ES6 Compatible Promise
		* @example
		* var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
		* @param promiseCtor The constructor of the promise.
		* @returns An ES6 compatible promise with the last value from the observable sequence.
		*/
        toPromise<TPromise extends IPromise<T>>(promiseCtor: { new (resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): TPromise; }): TPromise;
		/**
		* Converts an existing observable sequence to an ES6 Compatible Promise
		* @example
		* var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
		*
		* // With config
		* Rx.config.Promise = RSVP.Promise;
		* var promise = Rx.Observable.return(42).toPromise();
		* @param [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
		* @returns An ES6 compatible promise with the last value from the observable sequence.
		*/
        toPromise(promiseCtor?: { new (resolver: (resolvePromise: (value: T) => void, rejectPromise: (reason: any) => void) => void): IPromise<T>; }): IPromise<T>;

        // Experimental Flattening

		/**
		* Performs a exclusive waiting for the first to finish before subscribing to another observable.
		* Observables that come in between subscriptions will be dropped on the floor.
		* Can be applied on `Observable<Observable<R>>` or `Observable<IPromise<R>>`.
		* @since 2.2.28
		* @returns A exclusive observable with only the results that happen when subscribed.
		*/
        exclusive<R>(): Observable<R>;

		/**
		* Performs a exclusive map waiting for the first to finish before subscribing to another observable.
		* Observables that come in between subscriptions will be dropped on the floor.
		* Can be applied on `Observable<Observable<I>>` or `Observable<IPromise<I>>`.
		* @since 2.2.28
		* @param selector Selector to invoke for every item in the current subscription.
		* @param [thisArg] An optional context to invoke with the selector parameter.
		* @returns {An exclusive observable with only the results that happen when subscribed.
		*/
        exclusiveMap<I, R>(selector: (value: I, index: number, source: Observable<I>) => R, thisArg?: any): Observable<R>;
    }

    interface ObservableStatic {
        create<T>(subscribe: (observer: Observer<T>) => IDisposable): Observable<T>;
        create<T>(subscribe: (observer: Observer<T>) => () => void): Observable<T>;
        create<T>(subscribe: (observer: Observer<T>) => void): Observable<T>;
        createWithDisposable<T>(subscribe: (observer: Observer<T>) => IDisposable): Observable<T>;
        defer<T>(observableFactory: () => Observable<T>): Observable<T>;
        defer<T>(observableFactory: () => IPromise<T>): Observable<T>;
        empty<T>(scheduler?: IScheduler): Observable<T>;

		/**
		* This method creates a new Observable sequence from an array object.
		* @param array An array-like or iterable object to convert to an Observable sequence.
		* @param mapFn Map function to call on every element of the array.
		* @param [thisArg] The context to use calling the mapFn if provided.
		* @param [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
		*/
        from<T, TResult>(array: T[], mapFn: (value: T, index: number) => TResult, thisArg?: any, scheduler?: IScheduler): Observable<TResult>;
		/**
		* This method creates a new Observable sequence from an array object.
		* @param array An array-like or iterable object to convert to an Observable sequence.
		* @param [mapFn] Map function to call on every element of the array.
		* @param [thisArg] The context to use calling the mapFn if provided.
		* @param [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
		*/
        from<T>(array: T[], mapFn?: (value: T, index: number) => T, thisArg?: any, scheduler?: IScheduler): Observable<T>;

		/**
		* This method creates a new Observable sequence from an array-like object.
		* @param array An array-like or iterable object to convert to an Observable sequence.
		* @param mapFn Map function to call on every element of the array.
		* @param [thisArg] The context to use calling the mapFn if provided.
		* @param [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
		*/
        from<T, TResult>(array: { length: number;[index: number]: T; }, mapFn: (value: T, index: number) => TResult, thisArg?: any, scheduler?: IScheduler): Observable<TResult>;
		/**
		* This method creates a new Observable sequence from an array-like object.
		* @param array An array-like or iterable object to convert to an Observable sequence.
		* @param [mapFn] Map function to call on every element of the array.
		* @param [thisArg] The context to use calling the mapFn if provided.
		* @param [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
		*/
        from<T>(array: { length: number;[index: number]: T; }, mapFn?: (value: T, index: number) => T, thisArg?: any, scheduler?: IScheduler): Observable<T>;

		/**
		* This method creates a new Observable sequence from an array-like or iterable object.
		* @param array An array-like or iterable object to convert to an Observable sequence.
		* @param [mapFn] Map function to call on every element of the array.
		* @param [thisArg] The context to use calling the mapFn if provided.
		* @param [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
		*/
        from<T>(iterable: any, mapFn?: (value: any, index: number) => T, thisArg?: any, scheduler?: IScheduler): Observable<T>;

        fromArray<T>(array: T[], scheduler?: IScheduler): Observable<T>;
        fromArray<T>(array: { length: number;[index: number]: T; }, scheduler?: IScheduler): Observable<T>;

        generate<TState, TResult>(initialState: TState, condition: (state: TState) => boolean, iterate: (state: TState) => TState, resultSelector: (state: TState) => TResult, scheduler?: IScheduler): Observable<TResult>;
        never<T>(): Observable<T>;

		/**
		*  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
		*
		* @example
		*  var res = Rx.Observable.of(1, 2, 3);
		* @since 2.2.28
		* @returns The observable sequence whose elements are pulled from the given arguments.
		*/
        of<T>(...values: T[]): Observable<T>;

		/**
		*  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
		* @example
		*  var res = Rx.Observable.ofWithScheduler(Rx.Scheduler.timeout, 1, 2, 3);
		* @since 2.2.28
		* @param [scheduler] A scheduler to use for scheduling the arguments.
		* @returns The observable sequence whose elements are pulled from the given arguments.
		*/
        ofWithScheduler<T>(scheduler?: IScheduler, ...values: T[]): Observable<T>;
        range(start: number, count: number, scheduler?: IScheduler): Observable<number>;
        repeat<T>(value: T, repeatCount?: number, scheduler?: IScheduler): Observable<T>;
        return<T>(value: T, scheduler?: IScheduler): Observable<T>;
		/**
		 * @since 2.2.28
		 */
        just<T>(value: T, scheduler?: IScheduler): Observable<T>;	// alias for return
        returnValue<T>(value: T, scheduler?: IScheduler): Observable<T>;	// alias for return
        throw<T>(exception: Error, scheduler?: IScheduler): Observable<T>;
        throw<T>(exception: any, scheduler?: IScheduler): Observable<T>;
        throwException<T>(exception: Error, scheduler?: IScheduler): Observable<T>;	// alias for throw
        throwException<T>(exception: any, scheduler?: IScheduler): Observable<T>;	// alias for throw
        throwError<T>(error: Error, scheduler?: IScheduler): Observable<T>;	// alias for throw
        throwError<T>(error: any, scheduler?: IScheduler): Observable<T>;	// alias for throw

        catch<T>(sources: Observable<T>[]): Observable<T>;
        catch<T>(sources: IPromise<T>[]): Observable<T>;
        catchException<T>(sources: Observable<T>[]): Observable<T>;	// alias for catch
        catchException<T>(sources: IPromise<T>[]): Observable<T>;	// alias for catch
        catchError<T>(sources: Observable<T>[]): Observable<T>;	// alias for catch
        catchError<T>(sources: IPromise<T>[]): Observable<T>;	// alias for catch
        catch<T>(...sources: Observable<T>[]): Observable<T>;
        catch<T>(...sources: IPromise<T>[]): Observable<T>;
        catchException<T>(...sources: Observable<T>[]): Observable<T>;	// alias for catch
        catchException<T>(...sources: IPromise<T>[]): Observable<T>;	// alias for catch
        catchError<T>(...sources: Observable<T>[]): Observable<T>;	// alias for catch
        catchError<T>(...sources: IPromise<T>[]): Observable<T>;	// alias for catch

        combineLatest<T, T2>(first: Observable<T>, second: Observable<T2>): Observable<[T, T2]>;
        combineLatest<T, T2, TResult>(first: Observable<T>, second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        combineLatest<T, T2, TResult>(first: IPromise<T>, second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        combineLatest<T, T2, TResult>(first: Observable<T>, second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        combineLatest<T, T2, TResult>(first: IPromise<T>, second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>): Observable<[T, T2, T3]>;
        combineLatest<T, T2, T3, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: Observable<T>, second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: Observable<T>, second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: Observable<T>, second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: IPromise<T>, second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: IPromise<T>, second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: IPromise<T>, second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, TResult>(first: IPromise<T>, second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>): Observable<[T, T2, T3, T4]>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        combineLatest<T, T2, T3, T4, T5>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, fifth: Observable<T5>): Observable<[T, T2, T3, T4, T5]>;
        combineLatest<T, T2, T3, T4, T5, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, fifth: Observable<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        combineLatest<T>(sources: Observable<T>[]): Observable<T[]>;
        combineLatest<TOther, TResult>(sources: Observable<TOther>[], resultSelector: (...otherValues: TOther[]) => TResult): Observable<TResult>;
        combineLatest<TOther, TResult>(sources: IPromise<TOther>[], resultSelector: (...otherValues: TOther[]) => TResult): Observable<TResult>;

        withLatestFrom<T, T2, TResult>(first: Observable<T>, second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, TResult>(first: IPromise<T>, second: Observable<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, TResult>(first: Observable<T>, second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, TResult>(first: IPromise<T>, second: IPromise<T2>, resultSelector: (v1: T, v2: T2) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: Observable<T>, second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: Observable<T>, second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: Observable<T>, second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: IPromise<T>, second: Observable<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: IPromise<T>, second: Observable<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: IPromise<T>, second: IPromise<T2>, third: Observable<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, TResult>(first: IPromise<T>, second: IPromise<T2>, third: IPromise<T3>, resultSelector: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: Observable<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: Observable<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: Observable<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: Observable<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: Observable<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, TResult>(first: IPromise<T>, second: IPromise<T2>, third: IPromise<T3>, fourth: IPromise<T4>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        withLatestFrom<T, T2, T3, T4, T5, TResult>(first: Observable<T>, second: Observable<T2>, third: Observable<T3>, fourth: Observable<T4>, fifth: Observable<T5>, resultSelector: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        withLatestFrom<TOther, TResult>(souces: Observable<TOther>[], resultSelector: (...otherValues: TOther[]) => TResult): Observable<TResult>;
        withLatestFrom<TOther, TResult>(souces: IPromise<TOther>[], resultSelector: (...otherValues: TOther[]) => TResult): Observable<TResult>;

        concat<T>(...sources: Observable<T>[]): Observable<T>;
        concat<T>(...sources: IPromise<T>[]): Observable<T>;
        concat<T>(sources: Observable<T>[]): Observable<T>;
        concat<T>(sources: IPromise<T>[]): Observable<T>;
        merge<T>(...sources: Observable<T>[]): Observable<T>;
        merge<T>(...sources: IPromise<T>[]): Observable<T>;
        merge<T>(sources: Observable<T>[]): Observable<T>;
        merge<T>(sources: IPromise<T>[]): Observable<T>;
        merge<T>(scheduler: IScheduler, ...sources: Observable<T>[]): Observable<T>;
        merge<T>(scheduler: IScheduler, ...sources: IPromise<T>[]): Observable<T>;
        merge<T>(scheduler: IScheduler, sources: Observable<T>[]): Observable<T>;
        merge<T>(scheduler: IScheduler, sources: IPromise<T>[]): Observable<T>;

        pairs<T>(obj: { [key: string]: T }, scheduler?: IScheduler): Observable<[string, T]>;

        zip<T1, T2, TResult>(first: Observable<T1>, sources: Observable<T2>[], resultSelector: (item1: T1, ...right: T2[]) => TResult): Observable<TResult>;
        zip<T1, T2, TResult>(first: Observable<T1>, sources: IPromise<T2>[], resultSelector: (item1: T1, ...right: T2[]) => TResult): Observable<TResult>;
        zip<T1, T2, TResult>(source1: Observable<T1>, source2: Observable<T2>, resultSelector: (item1: T1, item2: T2) => TResult): Observable<TResult>;
        zip<T1, T2, TResult>(source1: Observable<T1>, source2: IPromise<T2>, resultSelector: (item1: T1, item2: T2) => TResult): Observable<TResult>;
        zip<T1, T2, T3, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: Observable<T3>, resultSelector: (item1: T1, item2: T2, item3: T3) => TResult): Observable<TResult>;
        zip<T1, T2, T3, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: IPromise<T3>, resultSelector: (item1: T1, item2: T2, item3: T3) => TResult): Observable<TResult>;
        zip<T1, T2, T3, TResult>(source1: Observable<T1>, source2: IPromise<T2>, source3: Observable<T3>, resultSelector: (item1: T1, item2: T2, item3: T3) => TResult): Observable<TResult>;
        zip<T1, T2, T3, TResult>(source1: Observable<T1>, source2: IPromise<T2>, source3: IPromise<T3>, resultSelector: (item1: T1, item2: T2, item3: T3) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: Observable<T3>, source4: Observable<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: Observable<T3>, source4: IPromise<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: IPromise<T3>, source4: Observable<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: IPromise<T3>, source4: IPromise<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: IPromise<T2>, source3: Observable<T3>, source4: Observable<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: IPromise<T2>, source3: Observable<T3>, source4: IPromise<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: IPromise<T2>, source3: IPromise<T3>, source4: Observable<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, TResult>(source1: Observable<T1>, source2: IPromise<T2>, source3: IPromise<T3>, source4: IPromise<T4>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4) => TResult): Observable<TResult>;
        zip<T1, T2, T3, T4, T5, TResult>(source1: Observable<T1>, source2: Observable<T2>, source3: Observable<T3>, source4: Observable<T4>, source5: Observable<T5>, resultSelector: (item1: T1, item2: T2, item3: T3, item4: T4, item5: T5) => TResult): Observable<TResult>;
        zipArray<T>(...sources: Observable<T>[]): Observable<T[]>;
        zipArray<T>(sources: Observable<T>[]): Observable<T[]>;

		/**
		* Converts a Promise to an Observable sequence
		* @param promise An ES6 Compliant promise.
		* @returns An Observable sequence which wraps the existing promise success and failure.
		*/
        fromPromise<T>(promise: IPromise<T>): Observable<T>;

        prototype: any;
    }

    export var Observable: ObservableStatic;

    interface ISubject<T> extends Observable<T>, Observer<T>, IDisposable {
        hasObservers(): boolean;
    }

    export interface Subject<T> extends ISubject<T> {
    }

    interface SubjectStatic {
        new <T>(): Subject<T>;
        create<T>(observer?: Observer<T>, observable?: Observable<T>): ISubject<T>;
    }

    export var Subject: SubjectStatic;

    export interface AsyncSubject<T> extends Subject<T> {
    }

    interface AsyncSubjectStatic {
        new <T>(): AsyncSubject<T>;
    }

    export var AsyncSubject: AsyncSubjectStatic;

    export interface TimeInterval<T> {
        value: T;
        interval: number;
    }

    export interface Timestamp<T> {
        value: T;
        timestamp: number;
    }

    export interface Observable<T> {
        delay(dueTime: Date, scheduler?: IScheduler): Observable<T>;
        delay(dueTime: number, scheduler?: IScheduler): Observable<T>;

        debounce(dueTime: number, scheduler?: IScheduler): Observable<T>;
        throttleWithTimeout(dueTime: number, scheduler?: IScheduler): Observable<T>;
		/**
		* @deprecated use #debounce or #throttleWithTimeout instead.
		*/
        throttle(dueTime: number, scheduler?: IScheduler): Observable<T>;

        timeInterval(scheduler?: IScheduler): Observable<TimeInterval<T>>;

        timestamp(scheduler?: IScheduler): Observable<Timestamp<T>>;

        sample(interval: number, scheduler?: IScheduler): Observable<T>;
        sample<TSample>(sampler: Observable<TSample>, scheduler?: IScheduler): Observable<T>;

        timeout(dueTime: Date, other?: Observable<T>, scheduler?: IScheduler): Observable<T>;
        timeout(dueTime: number, other?: Observable<T>, scheduler?: IScheduler): Observable<T>;
    }

    interface ObservableStatic {
        interval(period: number, scheduler?: IScheduler): Observable<number>;
        interval(dutTime: number, period: number, scheduler?: IScheduler): Observable<number>;
        timer(dueTime: number, period: number, scheduler?: IScheduler): Observable<number>;
        timer(dueTime: number, scheduler?: IScheduler): Observable<number>;
    }

    export interface BehaviorSubject<T> extends Subject<T> {
        getValue(): T;
    }

    interface BehaviorSubjectStatic {
        new <T>(initialValue: T): BehaviorSubject<T>;
    }

    export var BehaviorSubject: BehaviorSubjectStatic;

    export interface ReplaySubject<T> extends Subject<T> {
    }

    interface ReplaySubjectStatic {
        new <T>(bufferSize?: number, window?: number, scheduler?: IScheduler): ReplaySubject<T>;
    }

    export var ReplaySubject: ReplaySubjectStatic;

    interface ConnectableObservable<T> extends Observable<T> {
        connect(): IDisposable;
        refCount(): Observable<T>;
    }

    interface ConnectableObservableStatic {
        new <T>(): ConnectableObservable<T>;
    }

    export var ConnectableObservable: ConnectableObservableStatic;

    export interface Observable<T> {
        multicast(subject: Observable<T>): ConnectableObservable<T>;
        multicast<TResult>(subjectSelector: () => ISubject<T>, selector: (source: ConnectableObservable<T>) => Observable<T>): Observable<T>;
        publish(): ConnectableObservable<T>;
        publish<TResult>(selector: (source: ConnectableObservable<T>) => Observable<TResult>): Observable<TResult>;
		/**
		* Returns an observable sequence that shares a single subscription to the underlying sequence.
		* This operator is a specialization of publish which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
		*
		* @example
		* var res = source.share();
		*
		* @returns An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
		*/
        share(): Observable<T>;
        publishLast(): ConnectableObservable<T>;
        publishLast<TResult>(selector: (source: ConnectableObservable<T>) => Observable<TResult>): Observable<TResult>;
        publishValue(initialValue: T): ConnectableObservable<T>;
        publishValue<TResult>(selector: (source: ConnectableObservable<T>) => Observable<TResult>, initialValue: T): Observable<TResult>;
		/**
		* Returns an observable sequence that shares a single subscription to the underlying sequence and starts with an initialValue.
		* This operator is a specialization of publishValue which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
		*
		* @example
		* var res = source.shareValue(42);
		*
		* @param initialValue Initial value received by observers upon subscription.
		* @returns An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
		*/
        shareValue(initialValue: T): Observable<T>;
        replay(selector?: boolean, bufferSize?: number, window?: number, scheduler?: IScheduler): ConnectableObservable<T>;	// hack to catch first omitted parameter
        replay(selector: (source: ConnectableObservable<T>) => Observable<T>, bufferSize?: number, window?: number, scheduler?: IScheduler): Observable<T>;
        shareReplay(bufferSize?: number, window?: number, scheduler?: IScheduler): Observable<T>;
    }
}
declare namespace LiteMol.Core {
    export import Rx = __LiteMolRx;
    type Promise<T> = __Promise.Promise<T>;
    const Promise: typeof __Promise.Promise;
}
declare namespace LiteMol.Core {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMol.Core {
    class Computation<A> {
        private computation;
        bind<B>(next: (r: A) => Computation<B>): Computation<B>;
        map<B>(f: (r: A) => B): Computation<{}>;
        run(ctx?: Computation.Context<A>): Computation.RunningComputation<A>;
        constructor(computation: (ctx: Computation.Context<A>) => void);
    }
    module Computation {
        function create<A>(computation: (ctx: Context<A>) => void): Computation<A>;
        function resolve<A>(a: A): Computation<{}>;
        interface ProgressInfo {
            message: string;
            isIndeterminate: boolean;
            current: number;
            max: number;
            requestAbort?: () => void;
        }
        class Context<A> {
            schedule(action: () => void, afterMs?: number): void;
            private _abortRequested;
            readonly abortRequested: boolean;
            setRequestAbort(abort?: () => void): void;
            private _abortRequest;
            readonly abortRequest: () => true;
            private progressTick;
            private progress;
            progressStream: Rx.BehaviorSubject<ProgressInfo>;
            update(msg: string, abort?: () => void, current?: number, max?: number): void;
            private promiseStack;
            __push(resolve: (r: A) => void, reject: (err: any) => void): void;
            private _resolve(result);
            private _reject(err);
            resolve: any;
            reject: any;
            abort(): void;
            constructor();
        }
        interface RunningComputation<A> {
            progress: Rx.Observable<ProgressInfo>;
            result: Promise<A>;
        }
    }
}
declare namespace LiteMol.Core.Utils {
    function extend<S, T, U>(object: S, source: T, guard?: U): S & T & U;
    function debounce<T>(func: () => T, wait: number): () => T;
}
declare namespace LiteMol.Core.Utils {
    function integerSetToSortedTypedArray(set: Set<number>): number[];
    /**
     * A a JS native array with the given size.
     */
    function makeNativeIntArray(size: number): number[];
    /**
     * A a JS native array with the given size.
     */
    function makeNativeFloatArray(size: number): number[];
    /**
     * A generic chunked array builder.
     */
    class ChunkedArrayBuilder<T> {
        private creator;
        private elementSize;
        private chunkSize;
        private current;
        private currentIndex;
        parts: any[];
        elementCount: number;
        add4(x: T, y: T, z: T, w: T): number;
        add3(x: T, y: T, z: T): number;
        add2(x: T, y: T): number;
        add(x: T): number;
        compact(): T[];
        static forVertex3D(chunkVertexCount?: number): ChunkedArrayBuilder<number>;
        static forIndexBuffer(chunkIndexCount?: number): ChunkedArrayBuilder<number>;
        static forTokenIndices(chunkTokenCount?: number): ChunkedArrayBuilder<number>;
        static forIndices(chunkTokenCount?: number): ChunkedArrayBuilder<number>;
        static forInt32(chunkSize?: number): ChunkedArrayBuilder<number>;
        static forFloat32(chunkSize?: number): ChunkedArrayBuilder<number>;
        static forArray<TElement>(chunkSize?: number): ChunkedArrayBuilder<TElement>;
        constructor(creator: (size: number) => any, chunkElementCount: number, elementSize: number);
    }
    /**
     * Static size array builder.
     */
    class ArrayBuilder<T> {
        private currentIndex;
        elementCount: number;
        array: T[];
        add3(x: T, y: T, z: T): void;
        add2(x: T, y: T): void;
        add(x: T): void;
        static forVertex3D(count: number): ArrayBuilder<number>;
        static forIndexBuffer(count: number): ArrayBuilder<number>;
        static forTokenIndices(count: number): ArrayBuilder<number>;
        static forIndices(count: number): ArrayBuilder<number>;
        static forInt32(count: number): ArrayBuilder<number>;
        static forFloat32(count: number): ArrayBuilder<number>;
        static forArray<TElement>(count: number): ArrayBuilder<TElement>;
        constructor(creator: (size: number) => any, chunkElementCount: number, elementSize: number);
    }
}
/**
 * Efficient integer and float parsers.
 *
 * For the purposes of parsing numbers from the mmCIF data representations,
 * up to 4 times faster than JS parseInt/parseFloat.
 */
declare namespace LiteMol.Core.Utils.FastNumberParsers {
    function parseIntSkipTrailingWhitespace(str: string, start: number, end: number): number;
    function parseInt(str: string, start: number, end: number): number;
    function parseScientific(main: number, str: string, start: number, end: number): number;
    function parseFloatSkipTrailingWhitespace(str: string, start: number, end: number): number;
    function parseFloat(str: string, start: number, end: number): number;
}
declare namespace LiteMol.Core.Utils {
    class PerformanceMonitor {
        private starts;
        private ends;
        static currentTime(): number;
        start(name: string): void;
        end(name: string): void;
        static format(t: number): string;
        formatTime(name: string): string;
        formatTimeSum(...names: string[]): string;
        time(name: string): number;
        timeSum(...names: string[]): number;
    }
}
declare namespace LiteMol.Core.Formats {
    interface FormatInfo {
        name: string;
        extensions: string[];
        isBinary?: boolean;
        parse: (data: string | ArrayBuffer, params?: {
            id?: string;
        }) => Computation<ParserResult<any>>;
    }
    namespace FormatInfo {
        function formatRegExp(info: FormatInfo): RegExp;
        function formatFileFilters(all: FormatInfo[]): string;
        function getFormat(filename: string, all: FormatInfo[]): FormatInfo | undefined;
    }
    class ParserError {
        message: string;
        line: number;
        toString(): string;
        constructor(message: string, line: number);
    }
    /**
     * A generic parser result.
     */
    class ParserResult<T> {
        error: ParserError | undefined;
        warnings: string[];
        result: T | undefined;
        static error<T>(message: string, line?: number): ParserResult<T>;
        static success<T>(result: T, warnings?: string[]): ParserResult<T>;
        constructor(error: ParserError | undefined, warnings: string[], result: T | undefined);
    }
    /**
     * A helper for building a typed array of token indices.
     */
    interface TokenIndexBuilder {
        tokensLenMinus2: number;
        count: number;
        tokens: Int32Array;
    }
    namespace TokenIndexBuilder {
        function addToken(builder: TokenIndexBuilder, start: number, end: number): void;
        function create(size: number): TokenIndexBuilder;
    }
    /**
     * This ensures there is only 1 instance of a short string.
     */
    type ShortStringPool = Map<string, string>;
    namespace ShortStringPool {
        function create(): ShortStringPool;
        function get(pool: ShortStringPool, str: string): string;
    }
}
declare namespace LiteMol.Core.Formats.MessagePack {
    function encode(value: any): Uint8Array;
}
declare namespace LiteMol.Core.Formats.MessagePack {
    function decode(buffer: Uint8Array): any;
}
declare namespace LiteMol.Core.Formats.MessagePack {
    function utf8Write(data: Uint8Array, offset: number, str: string): void;
    function utf8Read(data: Uint8Array, offset: number, length: number): string;
    function utf8ByteCount(str: string): number;
}
declare namespace LiteMol.Core.Formats.CIF {
    /**
     * Represents a "CIF FILE" with one or more data blocks.
     */
    interface File {
        dataBlocks: DataBlock[];
        toJSON(): any;
    }
    /**
     * Represents a single CIF data block that contains categories and possibly
     * additonal data such as save frames.
     *
     * Example:
     * data_HEADER
     * _category1.field1
     * ...
     * ...
     * _categoryN.fieldN
     */
    interface DataBlock {
        header: string;
        categories: Category[];
        additionalData: {
            [name: string]: any;
        };
        getCategory(name: string): Category;
        toJSON(): any;
    }
    /**
     * Represents that CIF category with multiple fields represented as columns.
     *
     * Example:
     * _category.field1
     * _category.field2
     * ...
     */
    interface Category {
        name: string;
        rowCount: number;
        columnCount: number;
        columnNames: string[];
        /**
         * If a field with the given name is not present, returns UndefinedColumn.
         *
         * Columns are accessed by their field name only, i.e.
         * _category.field is accessed by
         * category.getColumn('field')
         */
        getColumn(name: string): Column;
        toJSON(): any;
    }
    const enum ValuePresence {
        Present = 0,
        NotSpecified = 1,
        Unknown = 2,
    }
    /**
     * A columns represents a single field of a CIF category.
     */
    interface Column {
        isDefined: boolean;
        getString(row: number): string | null;
        getInteger(row: number): number;
        getFloat(row: number): number;
        getValuePresence(row: number): ValuePresence;
        areValuesEqual(rowA: number, rowB: number): boolean;
        stringEquals(row: number, value: string): boolean;
    }
    const UndefinedColumn: Column;
    /**
     * Helper functions for categoies.
     */
    namespace Category {
        /**
         * Extracts a matrix from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getMatrix(category: Category, field: string, rows: number, cols: number, rowIndex: number): number[][];
        /**
         * Extracts a vector from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getVector(category: Category, field: string, rows: number, cols: number, rowIndex: number): number[];
        /**
         * Extracts a 3D transform given by a 3x3 matrix and a translation vector from a category from a specified row.
         * The transform is represented a column major matrix stored as 1D array.
         *
         * _category.matrix[1][1] m11
         * ....
         * ....
         * _category.matrix[3][3] m33
         * _category.translation[1] t1
         * _category.translation[1][1] m11
         *
         * @example
         * Category.getTransform(_atom_sites, 'fract_transf_matrix', 'fract_transf_vector', 0)
         */
        function getTransform(category: Category, matrixField: string, translationField: string, row: number): number[];
    }
}
declare namespace LiteMol.Core.Formats.CIF.Text {
    /**
     * Represents the input file.
     */
    class File implements CIF.File {
        /**
         * The input string.
         *
         * In JavaScript, the input must always* be a string as there is no support for streams.
         * So since we already have the string in memory, we won't store unnecessary copies of
         * substrings but rather represent individual elements as pairs of <start,end) indices
         * to the data string.
         *
         * * It can also be a typed array buffer, but the point still holds: we need to have the entire
         *   input in memory. And most molecular file formats are text based.
         */
        data: string;
        /**
         * Data blocks inside the file. If no data block is present, a "default" one is created.
         */
        dataBlocks: DataBlock[];
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        }[];
        constructor(data: string);
    }
    /**
     * Represents a single data block.
     */
    class DataBlock implements CIF.DataBlock {
        private categoryMap;
        private categoryList;
        /**
         * The input mmCIF string (same as file.data)
         */
        data: string;
        /**
         * Header of the data block.
         */
        header: string;
        /**
         * Categories of the block.
         * block.categories._atom_site / ['_atom_site']
         */
        readonly categories: Category[];
        /**
         * Additional data such as save frames for mmCIF file.
         */
        additionalData: {
            [name: string]: any;
        };
        /**
         * Gets a category by its name.
         */
        getCategory(name: string): Category;
        /**
         * Adds a category.
         */
        addCategory(category: Category): void;
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        };
        constructor(data: string, header: string);
    }
    /**
     * Represents a single CIF category.
     */
    class Category implements CIF.Category {
        private data;
        private columnWrappers;
        private columnNameList;
        /**
         * Name of the category.
         */
        name: string;
        /**
         * The array of columns.
         */
        readonly columnNames: string[];
        /**
         * Number of columns in the category.
         */
        columnCount: number;
        /**
         * Number of rows in the category.
         */
        rowCount: number;
        /**
         * Pairs of (start at index 2 * i, end at index 2 * i + 1) indices to the data string.
         * The "end" character is not included (for it's iterated as for (i = start; i < end; i++)).
         */
        tokens: number[];
        /**
         * Start index of the category in the input string.
         */
        startIndex: number;
        /**
         * Start index of the category in the input string.
         */
        endIndex: number;
        /**
         * Get a column object that makes accessing data easier.
         * @returns undefined if the column isn't present, the Column object otherwise.
         */
        getColumn(name: string): CIF.Column;
        constructor(data: string, name: string, startIndex: number, endIndex: number, columns: string[], tokens: number[], tokenCount: number);
        toJSON(): {
            name: string;
            columns: string[];
            rows: any[];
        };
    }
    /**
     * Represents a single column of a CIF category.
     */
    class Column implements CIF.Column {
        private data;
        name: string;
        index: number;
        private tokens;
        private columnCount;
        private rowCount;
        private stringPool;
        isDefined: boolean;
        /**
         * Returns the string value at given row.
         */
        getString(row: number): string | null;
        /**
         * Returns the integer value at given row.
         */
        getInteger(row: number): number;
        /**
         * Returns the float value at given row.
         */
        getFloat(row: number): number;
        /**
         * Returns true if the token has the specified string value.
         */
        stringEquals(row: number, value: string): boolean;
        /**
         * Determines if values at the given rows are equal.
         */
        areValuesEqual(rowA: number, rowB: number): boolean;
        /**
         * Returns true if the value is not defined (. or ? token).
         */
        getValuePresence(row: number): ValuePresence;
        constructor(category: Category, data: string, name: string, index: number);
    }
}
declare namespace LiteMol.Core.Formats.CIF.Text {
    function parse(data: string): ParserResult<CIF.File>;
}
declare namespace LiteMol.Core.Formats.CIF.Binary {
    class File implements CIF.File {
        dataBlocks: DataBlock[];
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        }[];
        constructor(data: EncodedFile);
    }
    class DataBlock implements CIF.DataBlock {
        private categoryMap;
        private categoryList;
        header: string;
        additionalData: {
            [name: string]: any;
        };
        readonly categories: Category[];
        getCategory(name: string): Category;
        toJSON(): {
            id: string;
            categories: {
                name: string;
                columns: string[];
                rows: any[];
            }[];
            additionalData: {
                [name: string]: any;
            };
        };
        constructor(data: EncodedDataBlock);
    }
    class Category implements CIF.Category {
        private encodedColumns;
        private columnWrappers;
        private columnNameList;
        name: string;
        columnCount: number;
        rowCount: number;
        readonly columnNames: string[];
        getColumn(name: string): CIF.Column;
        toJSON(): {
            name: string;
            columns: string[];
            rows: any[];
        };
        constructor(data: EncodedCategory);
    }
}
declare namespace LiteMol.Core.Formats.CIF.Binary {
    const VERSION: string;
    type Encoding = Encoding.ByteArray | Encoding.FixedPoint | Encoding.RunLength | Encoding.Delta | Encoding.IntegerPacking | Encoding.StringArray;
    interface EncodedFile {
        version: string;
        encoder: string;
        dataBlocks: EncodedDataBlock[];
    }
    interface EncodedDataBlock {
        header: string;
        categories: EncodedCategory[];
    }
    interface EncodedCategory {
        name: string;
        rowCount: number;
        columns: EncodedColumn[];
    }
    interface EncodedColumn {
        name: string;
        data: EncodedData;
        /**
         * The mask represents the presence or absent of particular "CIF value".
         * If the mask is not set, every value is present.
         *
         * 0 = Value is present
         * 1 = . = value not specified
         * 2 = ? = value unknown
         */
        mask?: EncodedData;
    }
    interface EncodedData {
        encoding: Encoding[];
        data: Uint8Array;
    }
    namespace Encoding {
        const enum DataType {
            Int8 = 0,
            Int16 = 1,
            Int32 = 2,
            Uint8 = 3,
            Float32 = 4,
            Float64 = 5,
        }
        const enum IntDataType {
            Int8 = 0,
            Int16 = 1,
            Int32 = 2,
            Uint8 = 3,
        }
        function getIntDataType(data: (Int8Array | Int16Array | Int32Array | number[])): IntDataType;
        interface ByteArray {
            kind: 'ByteArray';
            type: DataType;
        }
        interface FixedPoint {
            kind: 'FixedPoint';
            factor: number;
        }
        interface RunLength {
            kind: 'RunLength';
            srcType: IntDataType;
            srcSize: number;
        }
        interface Delta {
            kind: 'Delta';
            srcType: IntDataType;
        }
        interface IntegerPacking {
            kind: 'IntegerPacking';
            byteCount: number;
            srcSize: number;
        }
        interface StringArray {
            kind: 'StringArray';
            dataEncoding: Encoding[];
            stringData: string;
            offsetEncoding: Encoding[];
            offsets: Uint8Array;
        }
    }
}
declare namespace LiteMol.Core.Formats.CIF.Binary {
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */
    class Encoder {
        private providers;
        and(f: Encoder.Provider): Encoder;
        encode(data: any): EncodedData;
        constructor(providers: Encoder.Provider[]);
    }
    namespace Encoder {
        interface Result {
            encodings: Encoding[];
            data: any;
        }
        type Provider = (data: any) => Result;
        function by(f: Provider): Encoder;
        function uint8(data: Int16Array): Result;
        function int8(data: Int8Array): Result;
        function int16(data: Int16Array): Result;
        function int32(data: Int32Array): Result;
        function float32(data: Float32Array): Result;
        function float64(data: Float64Array): Result;
        function fixedPoint(factor: number): Provider;
        function runLength(data: (Uint8Array | Int8Array | Int16Array | Int32Array | number[])): Result;
        function delta(data: (Int8Array | Int16Array | Int32Array | number[])): Result;
        /**
         * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
         */
        function integerPacking(data: Int32Array): Result;
        function stringArray(data: string[]): Result;
    }
}
declare namespace LiteMol.Core.Formats.CIF.Binary {
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */
    function decode(data: EncodedData): any;
}
declare namespace LiteMol.Core.Formats.CIF.Binary {
    function parse(data: ArrayBuffer): ParserResult<CIF.File>;
}
declare namespace LiteMol.Core.Formats.Molecule.mmCIF {
    function ofDataBlock(data: CIF.DataBlock): Structure.Molecule;
}
declare namespace LiteMol.Core.Formats.Molecule.PDB {
    type TokenRange = {
        start: number;
        end: number;
    };
    type HelperData = {
        dot: TokenRange;
        question: TokenRange;
        numberTokens: Map<number, TokenRange>;
        data: string;
    };
    class MoleculeData {
        header: Header;
        crystInfo: CrystStructureInfo | undefined;
        models: ModelsData;
        data: string;
        private makeEntities();
        toCifFile(): CIF.File;
        constructor(header: Header, crystInfo: CrystStructureInfo | undefined, models: ModelsData, data: string);
    }
    class Header {
        id: string;
        constructor(id: string);
    }
    class CrystStructureInfo {
        record: string;
        toCifCategory(id: string): {
            cell: CIF.Category;
            symm: CIF.Category;
        };
        constructor(record: string);
    }
    class SecondaryStructure {
        helixTokens: number[];
        sheetTokens: number[];
        toCifCategory(data: string): {
            helices: CIF.Category;
            sheets: CIF.Category;
        } | undefined;
        constructor(helixTokens: number[], sheetTokens: number[]);
    }
    class ModelData {
        idToken: TokenRange;
        atomTokens: number[];
        atomCount: number;
        static COLUMNS: string[];
        private writeToken(index, cifTokens);
        private writeTokenCond(index, cifTokens, dot);
        private writeRange(range, cifTokens);
        private tokenEquals(start, end, value, data);
        private getEntityType(row, data);
        writeCifTokens(modelToken: TokenRange, cifTokens: Utils.ArrayBuilder<number>, helpers: HelperData): void;
        constructor(idToken: TokenRange, atomTokens: number[], atomCount: number);
    }
    class ModelsData {
        models: ModelData[];
        toCifCategory(block: CIF.Text.DataBlock, helpers: HelperData): CIF.Text.Category;
        constructor(models: ModelData[]);
    }
}
declare namespace LiteMol.Core.Formats.Molecule.PDB {
    class Parser {
        id: string;
        private data;
        private static tokenizeAtom(tokens, tokenizer);
        private static tokenize(id, data);
        static getDotRange(length: number): TokenRange;
        static getNumberRanges(length: number): Map<number, TokenRange>;
        static getQuestionmarkRange(length: number): TokenRange;
        static parse(id: string, data: string): ParserResult<CIF.File>;
        constructor(id: string, data: string);
    }
    function toCifFile(id: string, data: string): ParserResult<CIF.File>;
}
declare namespace LiteMol.Core.Formats.Molecule.SDF {
    function parse(data: string, id?: string): ParserResult<Structure.Molecule>;
}
declare namespace LiteMol.Core.Formats.Molecule {
    namespace SupportedFormats {
        const mmCIF: FormatInfo;
        const mmBCIF: FormatInfo;
        const PDB: FormatInfo;
        const SDF: FormatInfo;
        const All: FormatInfo[];
    }
}
declare namespace LiteMol.Core.Formats.Density {
    interface Field3D {
        dimensions: number[];
        length: number;
        getAt(idx: number): number;
        setAt(idx: number, v: number): void;
        get(i: number, j: number, k: number): number;
        set(i: number, j: number, k: number, v: number): void;
        fill(v: number): void;
    }
    class Field3DZYX implements Field3D {
        data: number[];
        dimensions: number[];
        private nX;
        private nY;
        private len;
        readonly length: number;
        getAt(idx: number): number;
        setAt(idx: number, v: number): void;
        get(i: number, j: number, k: number): number;
        set(i: number, j: number, k: number, v: number): void;
        fill(v: number): void;
        constructor(data: number[], dimensions: number[]);
    }
    /**
     * Represents electron density data.
     */
    interface Data {
        /**
         * Crystal cell size.
         */
        cellSize: number[];
        /**
         * Crystal cell angles.
         */
        cellAngles: number[];
        /**
         * Origin of the cell
         */
        origin: number[];
        /**
         * 3D volumetric data.
         */
        data: Field3D;
        /**
         * X, Y, Z dimensions of the data matrix.
         */
        dataDimensions: number[];
        /**
         * The basis of the space.
         */
        basis: {
            x: number[];
            y: number[];
            z: number[];
        };
        /**
         * Start offsets.
         */
        startOffset: number[];
        /**
         * Was the skew matrix present in the input?
         */
        hasSkewMatrix: boolean;
        /**
         * Column major ordered skew matrix.
         */
        skewMatrix: number[];
        /**
         * Information about the min/max/mean/sigma values.
         */
        valuesInfo: {
            min: number;
            max: number;
            mean: number;
            sigma: number;
        };
        /**
         * Additional attributes.
         */
        attributes: {
            [key: string]: any;
        };
        /**
         * Are the data normalized?
         */
        isNormalized: boolean;
    }
    namespace Data {
        function create(cellSize: number[], cellAngles: number[], origin: number[], hasSkewMatrix: boolean, skewMatrix: number[], data: Field3D, dataDimensions: number[], basis: {
            x: number[];
            y: number[];
            z: number[];
        }, startOffset: number[], valuesInfo: {
            min: number;
            max: number;
            mean: number;
            sigma: number;
        }, attributes?: {
            [key: string]: any;
        }): Data;
        function normalize(densityData: Data): void;
        function denormalize(densityData: Data): void;
    }
}
declare namespace LiteMol.Core.Formats.Density.CCP4 {
    function parse(buffer: ArrayBuffer): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density.DSN6 {
    function parse(buffer: ArrayBuffer): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density {
    namespace SupportedFormats {
        const CCP4: FormatInfo;
        const DSN6: FormatInfo;
        const All: FormatInfo[];
    }
}
declare namespace LiteMol.Core.Geometry.LinearAlgebra {
    type ObjectVec3 = {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Stores a 4x4 matrix in a column major (j * 4 + i indexing) format.
     */
    namespace Matrix4 {
        function empty(): number[];
        function identity(): number[];
        function ofRows(rows: number[][]): number[];
        function areEqual(a: number[], b: number[], eps: number): boolean;
        function setValue(a: number[], i: number, j: number, value: number): void;
        function copy(out: number[], a: any): number[];
        function clone(a: number[]): number[];
        function invert(out: number[], a: number[]): number[] | null;
        function mul(out: number[], a: number[], b: number[]): number[];
        function translate(out: number[], a: number[], v: number[]): number[];
        function fromTranslation(out: number[], v: number[]): number[];
        function transformVector3(out: {
            x: number;
            y: number;
            z: number;
        }, a: {
            x: number;
            y: number;
            z: number;
        }, m: number[]): {
            x: number;
            y: number;
            z: number;
        };
        function makeTable(m: number[]): string;
        function determinant(a: number[]): number;
    }
    namespace Vector4 {
        function create(): number[];
        function clone(a: number[]): number[];
        function fromValues(x: number, y: number, z: number, w: number): number[];
        function set(out: number[], x: number, y: number, z: number, w: number): number[];
        function distance(a: number[], b: number[]): number;
        function squaredDistance(a: number[], b: number[]): number;
        function norm(a: number[]): number;
        function squaredNorm(a: number[]): number;
        function transform(out: number[], a: number[], m: number[]): number[];
    }
}
declare namespace LiteMol.Core.Geometry {
    /**
     * Basic shape of the result buffer for range queries.
     */
    interface SubdivisionTree3DResultBuffer {
        count: number;
        indices: number[];
        hasPriorities: boolean;
        priorities: number[] | undefined;
        add(distSq: number, index: number): void;
        reset(): void;
    }
    /**
     * A buffer that only remembers the values.
     */
    namespace SubdivisionTree3DResultIndexBuffer {
        function create(initialCapacity: number): SubdivisionTree3DResultBuffer;
    }
    /**
     * A buffer that remembers values and priorities.
     */
    namespace SubdivisionTree3DResultPriorityBuffer {
        function create(initialCapacity: number): SubdivisionTree3DResultBuffer;
    }
    /**
     * Query context. Handles the actual querying.
     */
    interface SubdivisionTree3DQueryContext<T> {
        tree: SubdivisionTree3D<T>;
        pivot: number[];
        radius: number;
        radiusSq: number;
        indices: number[];
        positions: number[];
        buffer: SubdivisionTree3DResultBuffer;
        nearest(x: number, y: number, z: number, radius: number): void;
    }
    namespace SubdivisionTree3DQueryContext {
        function create<T>(tree: SubdivisionTree3D<T>, buffer: SubdivisionTree3DResultBuffer): SubdivisionTree3DQueryContext<T>;
    }
    /**
     * A kd-like tree to query 3D data.
     */
    interface SubdivisionTree3D<T> {
        data: T[];
        indices: number[];
        positions: number[];
        root: SubdivisionTree3DNode;
    }
    namespace SubdivisionTree3D {
        /**
         * Create a context used for querying the data.
         */
        function createContextRadius<T>(tree: SubdivisionTree3D<T>, radiusEstimate: number, includePriorities?: boolean): SubdivisionTree3DQueryContext<T>;
        /**
         * Takes data and a function that calls SubdivisionTree3DPositionBuilder.add(x, y, z) on each data element.
         */
        function create<T>(data: T[], f: (e: T, add: (x: number, y: number, z: number) => void) => void, leafSize?: number): SubdivisionTree3D<T>;
    }
    /**
     * A tree node.
     */
    interface SubdivisionTree3DNode {
        splitValue: number;
        startIndex: number;
        endIndex: number;
        left: SubdivisionTree3DNode;
        right: SubdivisionTree3DNode;
    }
    namespace SubdivisionTree3DNode {
        function nearest<T>(node: SubdivisionTree3DNode, ctx: SubdivisionTree3DQueryContext<T>, dim: number): void;
        function create(splitValue: number, startIndex: number, endIndex: number, left: SubdivisionTree3DNode, right: SubdivisionTree3DNode): SubdivisionTree3DNode;
    }
    /**
     * A helper to store boundary box.
     */
    interface Box3D {
        min: number[];
        max: number[];
    }
    namespace Box3D {
        function createInfinite(): Box3D;
    }
}
declare namespace LiteMol.Core.Geometry {
    interface Surface {
        /**
         * Number of vertices.
         */
        vertexCount: number;
        /**
         * Number of triangles.
         */
        triangleCount: number;
        /**
         * Array of size 3 * vertexCount. Layout [x1, y1, z1, ...., xn, yn, zn]
         */
        vertices: Float32Array;
        /**
         * 3 indexes for each triangle
         */
        triangleIndices: Uint32Array;
        /**
         * Per vertex annotation.
         */
        annotation?: number[];
        /**
         * Array of size 3 * vertexCount. Layout [x1, y1, z1, ...., xn, yn, zn]
         *
         * Computed on demand.
         */
        normals?: Float32Array;
        /**
         * Bounding sphere.
         */
        boundingSphere?: {
            center: Geometry.LinearAlgebra.ObjectVec3;
            radius: number;
        };
    }
    namespace Surface {
        function computeNormals(surface: Surface): Computation<Surface>;
        function laplacianSmooth(surface: Surface, iterCount?: number): Computation<Surface>;
        function computeBoundingSphere(surface: Surface): Computation<Surface>;
        function transform(surface: Surface, t: number[]): Computation<Surface>;
    }
}
declare namespace LiteMol.Core.Geometry.MarchingCubes {
    /**
     * The parameters required by the algorithm.
     */
    interface MarchingCubesParameters {
        isoLevel: number;
        scalarField: Formats.Density.Field3D;
        bottomLeft?: number[];
        topRight?: number[];
        annotationField?: Formats.Density.Field3D;
    }
    function compute(parameters: MarchingCubesParameters): Computation<Surface>;
}
declare namespace LiteMol.Core.Geometry.MarchingCubes {
    class Index {
        i: number;
        j: number;
        k: number;
        constructor(i: number, j: number, k: number);
    }
    class IndexPair {
        a: Index;
        b: Index;
        constructor(a: Index, b: Index);
    }
    var EdgesXY: number[][];
    var EdgesXZ: number[][];
    var EdgesYZ: number[][];
    var CubeVertices: Index[];
    var CubeEdges: IndexPair[];
    var EdgeIdInfo: {
        i: number;
        j: number;
        k: number;
        e: number;
    }[];
    var EdgeTable: number[];
    var TriTable: number[][];
}
declare namespace LiteMol.Core.Geometry.MolecularSurface {
    interface MolecularIsoSurfaceParameters {
        exactBoundary?: boolean;
        boundaryDelta?: {
            dx: number;
            dy: number;
            dz: number;
        };
        probeRadius?: number;
        atomRadius?: (i: number) => number;
        density?: number;
        interactive?: boolean;
        smoothingIterations?: number;
    }
    interface MolecularIsoField {
        data: Geometry.MarchingCubes.MarchingCubesParameters;
        bottomLeft: Geometry.LinearAlgebra.ObjectVec3;
        topRight: Geometry.LinearAlgebra.ObjectVec3;
        transform: number[];
        inputParameters: MolecularSurfaceInputParameters;
        parameters: MolecularIsoSurfaceParameters;
    }
    interface MolecularIsoSurfaceGeometryData {
        surface: Surface;
        usedParameters: MolecularIsoSurfaceParameters;
    }
    function createMolecularIsoFieldAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoField>;
    interface MolecularSurfaceInputParameters {
        positions: Core.Structure.PositionTableSchema;
        atomIndices: number[];
        parameters?: MolecularIsoSurfaceParameters;
    }
    function computeMolecularSurfaceAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoSurfaceGeometryData>;
}
declare namespace LiteMol.Core.Structure {
    class DataTableColumnDescriptor {
        name: string;
        creator: (size: number) => any;
        constructor(name: string, creator: (size: number) => any);
    }
    class DataTable {
        count: number;
        indices: number[];
        columns: DataTableColumnDescriptor[];
        clone(): DataTable;
        getBuilder(count: number): DataTableBuilder;
        getRawData(): any[][];
        constructor(count: number, source: DataTableBuilder);
    }
    class DataTableBuilder {
        count: number;
        columns: DataTableColumnDescriptor[];
        addColumn<T>(name: string, creator: (size: number) => T): T;
        getRawData(): any[][];
        /**
         * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine
         * use internal class instead of dictionary representation.
         */
        seal<TTable extends DataTable>(): TTable;
        constructor(count: number);
    }
    enum EntityType {
        Polymer = 0,
        NonPolymer = 1,
        Water = 2,
        Unknown = 3,
    }
    const enum BondType {
        Unknown = 0,
        Single = 1,
        Double = 2,
        Triple = 3,
        Aromatic = 4,
        Metallic = 5,
        Ion = 6,
        Hydrogen = 7,
        DisulfideBridge = 8,
    }
    class ComponentBondInfoEntry {
        id: string;
        map: Map<string, Map<string, BondType>>;
        add(a: string, b: string, order: BondType, swap?: boolean): void;
        constructor(id: string);
    }
    class ComponentBondInfo {
        entries: Map<string, ComponentBondInfoEntry>;
        newEntry(id: string): ComponentBondInfoEntry;
    }
    /**
     * Identifier for a reside that is a part of the polymer.
     */
    class PolyResidueIdentifier {
        asymId: string;
        seqNumber: number;
        insCode: string | null;
        constructor(asymId: string, seqNumber: number, insCode: string | null);
        static areEqual(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]): boolean;
        static compare(a: PolyResidueIdentifier, b: PolyResidueIdentifier): number;
        static compareResidue(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]): number;
    }
    const enum SecondaryStructureType {
        None = 0,
        Helix = 1,
        Turn = 2,
        Sheet = 3,
        AminoSeq = 4,
        Strand = 5,
    }
    class SecondaryStructureElement {
        type: SecondaryStructureType;
        startResidueId: PolyResidueIdentifier;
        endResidueId: PolyResidueIdentifier;
        info: any;
        startResidueIndex: number;
        endResidueIndex: number;
        readonly length: number;
        constructor(type: SecondaryStructureType, startResidueId: PolyResidueIdentifier, endResidueId: PolyResidueIdentifier, info?: any);
    }
    class SymmetryInfo {
        spacegroupName: string;
        cellSize: number[];
        cellAngles: number[];
        toFracTransform: number[];
        isNonStandardCrytalFrame: boolean;
        constructor(spacegroupName: string, cellSize: number[], cellAngles: number[], toFracTransform: number[], isNonStandardCrytalFrame: boolean);
    }
    /**
     * Wraps an assembly operator.
     */
    class AssemblyOperator {
        id: string;
        name: string;
        operator: number[];
        constructor(id: string, name: string, operator: number[]);
    }
    /**
     * Wraps a single assembly gen entry.
     */
    class AssemblyGenEntry {
        operators: string[][];
        asymIds: string[];
        constructor(operators: string[][], asymIds: string[]);
    }
    /**
     * Wraps an assembly generation template.
     */
    class AssemblyGen {
        name: string;
        gens: AssemblyGenEntry[];
        constructor(name: string);
    }
    /**
     * Information about the assemblies.
     */
    class AssemblyInfo {
        operators: {
            [id: string]: AssemblyOperator;
        };
        assemblies: AssemblyGen[];
        constructor(operators: {
            [id: string]: AssemblyOperator;
        }, assemblies: AssemblyGen[]);
    }
    interface PositionTableSchema extends DataTable {
        x: number[];
        y: number[];
        z: number[];
    }
    interface DefaultAtomTableSchema extends DataTable {
        id: number[];
        name: string[];
        authName: string[];
        elementSymbol: string[];
        x: number[];
        y: number[];
        z: number[];
        altLoc: (string | null)[];
        occupancy: number[];
        tempFactor: number[];
        rowIndex: number[];
        residueIndex: number[];
        chainIndex: number[];
        entityIndex: number[];
    }
    interface DefaultResidueTableSchema extends DataTable {
        name: string[];
        seqNumber: number[];
        asymId: string[];
        authName: string[];
        authSeqNumber: number[];
        authAsymId: string[];
        insCode: (string | null)[];
        entityId: string[];
        isHet: number[];
        atomStartIndex: number[];
        atomEndIndex: number[];
        chainIndex: number[];
        entityIndex: number[];
        secondaryStructureIndex: number[];
    }
    interface DefaultChainTableSchema extends DataTable {
        asymId: string[];
        authAsymId: string[];
        entityId: string[];
        atomStartIndex: number[];
        atomEndIndex: number[];
        residueStartIndex: number[];
        residueEndIndex: number[];
        entityIndex: number[];
        sourceChainIndex?: number[];
        operatorIndex?: number[];
    }
    interface DefaultEntityTableSchema extends DataTable {
        entityId: string[];
        entityType: EntityType[];
        atomStartIndex: number[];
        atomEndIndex: number[];
        residueStartIndex: number[];
        residueEndIndex: number[];
        chainStartIndex: number[];
        chainEndIndex: number[];
        type: string[];
    }
    interface DefaultBondTableSchema extends DataTable {
        atomAIndex: number[];
        atomBIndex: number[];
        type: BondType[];
    }
    /**
     * Default Builders
     */
    namespace DefaultDataTables {
        function forAtoms(count: number): {
            table: DefaultAtomTableSchema;
            columns: {
                id: Int32Array;
                x: Float32Array;
                y: Float32Array;
                z: Float32Array;
                altLoc: never[];
                rowIndex: Int32Array;
                residueIndex: Int32Array;
                chainIndex: Int32Array;
                entityIndex: Int32Array;
                name: string[];
                elementSymbol: string[];
                occupancy: Float32Array;
                tempFactor: Float32Array;
                authName: string[];
            };
        };
        function forResidues(count: number): {
            table: DefaultResidueTableSchema;
            columns: {
                name: string[];
                seqNumber: Int32Array;
                asymId: string[];
                authName: string[];
                authSeqNumber: Int32Array;
                authAsymId: string[];
                insCode: (string | null)[];
                entityId: string[];
                isHet: Int8Array;
                atomStartIndex: Int32Array;
                atomEndIndex: Int32Array;
                chainIndex: Int32Array;
                entityIndex: Int32Array;
                secondaryStructureIndex: Int32Array;
            };
        };
        function forChains(count: number): {
            table: DefaultChainTableSchema;
            columns: {
                asymId: string[];
                entityId: string[];
                authAsymId: string[];
                atomStartIndex: Int32Array;
                atomEndIndex: Int32Array;
                residueStartIndex: Int32Array;
                residueEndIndex: Int32Array;
                entityIndex: Int32Array;
            };
        };
        function forEntities(count: number): {
            table: DefaultEntityTableSchema;
            columns: {
                entityId: string[];
                entityType: EntityType[];
                type: string[];
                atomStartIndex: Int32Array;
                atomEndIndex: Int32Array;
                residueStartIndex: Int32Array;
                residueEndIndex: Int32Array;
                chainStartIndex: Int32Array;
                chainEndIndex: Int32Array;
            };
        };
        function forBonds(count: number): {
            table: DefaultBondTableSchema;
            columns: {
                atomAIndex: Int32Array;
                atomBIndex: Int32Array;
                type: Int8Array;
            };
        };
    }
    enum MoleculeModelSource {
        File = 0,
        Computed = 1,
    }
    class Operator {
        matrix: number[];
        id: string;
        isIdentity: boolean;
        apply(v: Geometry.LinearAlgebra.ObjectVec3): void;
        static applyToModelUnsafe(matrix: number[], m: MoleculeModel): void;
        constructor(matrix: number[], id: string, isIdentity: boolean);
    }
    interface MoleculeModelData {
        id: string;
        modelId: string;
        atoms: DefaultAtomTableSchema;
        residues: DefaultResidueTableSchema;
        chains: DefaultChainTableSchema;
        entities: DefaultEntityTableSchema;
        covalentBonds?: DefaultBondTableSchema;
        nonCovalentbonds?: DefaultBondTableSchema;
        componentBonds?: ComponentBondInfo;
        secondaryStructure: SecondaryStructureElement[];
        symmetryInfo?: SymmetryInfo;
        assemblyInfo?: AssemblyInfo;
        parent?: MoleculeModel;
        source: MoleculeModelSource;
        operators?: Operator[];
    }
    class MoleculeModel implements MoleculeModelData {
        private _queryContext;
        id: string;
        modelId: string;
        atoms: DefaultAtomTableSchema;
        residues: DefaultResidueTableSchema;
        chains: DefaultChainTableSchema;
        entities: DefaultEntityTableSchema;
        covalentBonds?: DefaultBondTableSchema;
        nonCovalentbonds?: DefaultBondTableSchema;
        componentBonds?: ComponentBondInfo;
        secondaryStructure: SecondaryStructureElement[];
        symmetryInfo?: SymmetryInfo;
        assemblyInfo?: AssemblyInfo;
        parent?: MoleculeModel;
        source: MoleculeModelSource;
        operators?: Operator[];
        readonly queryContext: Query.Context;
        query(q: Query.Source): Query.FragmentSeq;
        constructor(data: MoleculeModelData);
    }
    class Molecule {
        id: string;
        models: MoleculeModel[];
        constructor(id: string, models: MoleculeModel[]);
    }
}
declare namespace LiteMol.Core.Structure {
    class Spacegroup {
        info: Structure.SymmetryInfo;
        private temp;
        private tempV;
        private space;
        private operators;
        readonly operatorCount: number;
        getOperatorMatrix(index: number, i: number, j: number, k: number, target: number[]): number[];
        private getSpace();
        private static getOperator(ids);
        private getOperators();
        constructor(info: Structure.SymmetryInfo);
    }
    namespace SpacegroupTables {
        var Transform: number[][];
        var Operator: number[][];
        var Group: number[][];
        var Spacegroup: {
            [key: string]: number;
        };
    }
}
declare namespace LiteMol.Core.Structure {
    function buildPivotGroupSymmetry(model: MoleculeModel, radius: number, pivotsQuery?: Query.Source): MoleculeModel;
    function buildSymmetryMates(model: MoleculeModel, radius: number): MoleculeModel;
    function buildAssembly(model: MoleculeModel, assembly: AssemblyGen): MoleculeModel;
}
declare namespace LiteMol.Core.Structure {
    /**
     * The query is a mapping from a context to a sequence of fragments.
     */
    type Query = (ctx: Query.Context) => Query.FragmentSeq;
    namespace Query {
        type Source = Query | string | Builder;
        /**
         * The context of a query.
         *
         * Stores:
         * - the mask of "active" atoms.
         * - kd-tree for fast geometry queries.
         * - the molecule itself.
         *
         */
        class Context {
            private mask;
            private lazyTree;
            /**
             * Number of atoms in the current context.
             */
            readonly atomCount: number;
            /**
             * Determine if the context contains all atoms of the input model.
             */
            readonly isComplete: boolean;
            /**
             * The structure this context is based on.
             */
            structure: MoleculeModel;
            /**
             * Get a kd-tree for the atoms in the current context.
             */
            readonly tree: Geometry.SubdivisionTree3D<number>;
            /**
             * Checks if an atom is included in the current context.
             */
            hasAtom(index: number): boolean;
            /**
             * Checks if an atom from the range is included in the current context.
             */
            hasRange(start: number, end: number): boolean;
            /**
             * Create a new context based on the provide structure.
             */
            static ofStructure(structure: MoleculeModel): Context;
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofFragments(seq: FragmentSeq): Context;
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofAtomIndices(structure: MoleculeModel, atomIndices: number[]): Context;
            constructor(structure: MoleculeModel, mask: Context.Mask);
            private makeTree();
        }
        namespace Context {
            /**
             * Represents the atoms in the context.
             */
            interface Mask {
                size: number;
                has(i: number): boolean;
            }
            module Mask {
                function ofStructure(structure: MoleculeModel): Mask;
                function ofIndices(structure: MoleculeModel, atomIndices: number[]): Mask;
                function ofFragments(seq: FragmentSeq): Mask;
            }
        }
        /**
         * The basic element of the query language.
         * Everything is represented as a fragment.
         */
        class Fragment {
            /**
             * The index of the first atom of the generator.
             */
            tag: number;
            /**
             * Indices of atoms.
             */
            atomIndices: number[];
            /**
             * The context the fragment belongs to.
             */
            context: Context;
            private _hashCode;
            private _hashComputed;
            /**
             * The hash code of the fragment.
             */
            readonly hashCode: number;
            /**
             * Id composed of <moleculeid>_<tag>.
             */
            readonly id: string;
            /**
             * Number of atoms.
             */
            readonly atomCount: number;
            /**
             * Determines if a fragment is HET based on the tag.
             */
            readonly isHet: any;
            private _fingerprint;
            /**
             * A sorted list of residue identifiers.
             */
            readonly fingerprint: string;
            private _authFingerprint;
            /**
             * A sorted list of residue identifiers.
             */
            readonly authFingerprint: string;
            /**
             * Executes a query on the current fragment.
             */
            find(what: Source): FragmentSeq;
            private _residueIndices;
            private _chainIndices;
            private _entityIndices;
            private computeIndices();
            /**
             * A sorted list of residue indices.
             */
            readonly residueIndices: number[];
            /**
             * A sorted list of chain indices.
             */
            readonly chainIndices: number[];
            /**
             * A sorted list of entity indices.
             */
            readonly entityIndices: number[];
            static areEqual(a: Fragment, b: Fragment): boolean;
            /**
             * Create a fragment from an integer set.
             * Assumes the set is in the given context's mask.
             */
            static ofSet(context: Context, atomIndices: Set<number>): Fragment;
            /**
             * Create a fragment from an integer array.
             * Assumes the set is in the given context's mask.
             * Assumes the array is sorted.
             */
            static ofArray(context: Context, tag: number, atomIndices: Int32Array): Fragment;
            /**
             * Create a fragment from a single index.
             * Assumes the index is in the given context's mask.
             */
            static ofIndex(context: Context, index: number): Fragment;
            /**
             * Create a fragment from a <start,end) range.
             * Assumes the fragment is non-empty in the given context's mask.
             */
            static ofIndexRange(context: Context, start: number, endExclusive: number): Fragment;
            /**
             * Create a fragment from an integer set.
             */
            constructor(context: Context, tag: number, atomIndices: number[]);
        }
        /**
         * A sequence of fragments the queries operate on.
         */
        class FragmentSeq {
            context: Context;
            fragments: Fragment[];
            static empty(ctx: Context): FragmentSeq;
            readonly length: number;
            /**
             * Merges atom indices from all fragments.
             */
            unionAtomIndices(): number[];
            /**
             * Merges atom indices from all fragments into a single fragment.
             */
            unionFragment(): Fragment;
            constructor(context: Context, fragments: Fragment[]);
        }
        /**
         * A builder that includes all fragments.
         */
        class FragmentSeqBuilder {
            private ctx;
            private fragments;
            add(f: Fragment): void;
            getSeq(): FragmentSeq;
            constructor(ctx: Context);
        }
        /**
         * A builder that includes only unique fragments.
         */
        class HashFragmentSeqBuilder {
            private ctx;
            private fragments;
            private byHash;
            add(f: Fragment): this;
            getSeq(): FragmentSeq;
            constructor(ctx: Context);
        }
    }
}
declare namespace LiteMol.Core.Structure.Query {
    interface Builder {
        compile(): Query;
        complement(): Builder;
        ambientResidues(radius: number): Builder;
        wholeResidues(): Builder;
        union(): Builder;
        inside(where: Source): Builder;
        intersectWith(where: Source): Builder;
        flatten(selector: (f: Fragment) => FragmentSeq): Builder;
    }
    namespace Builder {
        const BuilderPrototype: any;
        function registerModifier(name: string, f: Function): void;
        function build(compile: () => Query): Builder;
        function parse(query: string): Query;
        function toQuery(q: Source): Query;
    }
    interface EntityIdSchema {
        entityId?: string;
        type?: string;
    }
    interface AsymIdSchema extends EntityIdSchema {
        asymId?: string;
        authAsymId?: string;
    }
    interface ResidueIdSchema extends AsymIdSchema {
        name?: string;
        seqNumber?: number;
        authName?: string;
        authSeqNumber?: number;
        insCode?: string | null;
    }
    function atomsByElement(...elements: string[]): Builder;
    function atomsByName(...names: string[]): Builder;
    function atomsById(...ids: number[]): Builder;
    function residues(...ids: ResidueIdSchema[]): Builder;
    function chains(...ids: AsymIdSchema[]): Builder;
    function entities(...ids: EntityIdSchema[]): Builder;
    function notEntities(...ids: EntityIdSchema[]): Builder;
    function everything(): Builder;
    function entitiesFromIndices(indices: number[]): Builder;
    function chainsFromIndices(indices: number[]): Builder;
    function residuesFromIndices(indices: number[]): Builder;
    function atomsFromIndices(indices: number[]): Builder;
    function sequence(entityId: string, asymId: string, startId: ResidueIdSchema, endId: ResidueIdSchema): Builder;
    function hetGroups(): Builder;
    function nonHetPolymer(): Builder;
    function polymerTrace(...atomNames: string[]): Builder;
    function cartoons(): Builder;
    function backbone(): Builder;
    function sidechain(): Builder;
    function atomsInBox(min: {
        x: number;
        y: number;
        z: number;
    }, max: {
        x: number;
        y: number;
        z: number;
    }): Builder;
    function or(...elements: Source[]): Builder;
    function complement(q: Source): Builder;
    function ambientResidues(q: Source, radius: number): Builder;
    function wholeResidues(q: Source): Builder;
    function union(q: Source): Builder;
    function inside(q: Source, where: Source): Builder;
    function intersectWith(what: Source, where: Source): Builder;
    function flatten(what: Source, selector: (f: Fragment) => FragmentSeq): Builder;
    /**
     * Shortcuts
     */
    function residuesByName(...names: string[]): Builder;
    function residuesById(...ids: number[]): Builder;
    function chainsById(...ids: string[]): Builder;
    /**
     * Query compilation wrapper.
     */
    namespace Compiler {
        function compileEverything(): (ctx: Context) => FragmentSeq;
        function compileAtoms(elements: string[] | number[], sel: (model: Structure.MoleculeModel) => string[] | number[]): (ctx: Context) => FragmentSeq;
        function compileAtomIndices(indices: number[]): (ctx: Context) => FragmentSeq;
        function compileFromIndices(complement: boolean, indices: number[], tableProvider: (molecule: Structure.MoleculeModel) => {
            atomStartIndex: number[];
            atomEndIndex: number[];
        } & Structure.DataTable): Query;
        function compileAtomRanges(complement: boolean, ids: ResidueIdSchema[], tableProvider: (molecule: Structure.MoleculeModel) => {
            atomStartIndex: number[];
            atomEndIndex: number[];
        } & Structure.DataTable): Query;
        function compileSequence(seqEntityId: string, seqAsymId: string, start: ResidueIdSchema, end: ResidueIdSchema): Query;
        function compileHetGroups(): Query;
        function compileNonHetPolymer(): Query;
        function compileAtomsInBox(min: {
            x: number;
            y: number;
            z: number;
        }, max: {
            x: number;
            y: number;
            z: number;
        }): Query;
        function compileInside(what: Source, where: Source): Query;
        function compileIntersectWith(what: Source, where: Source): Query;
        function compileFilter(what: Source, filter: (f: Fragment) => boolean): Query;
        function compileComplement(what: Source): Query;
        function compileOr(queries: Source[]): (ctx: Context) => FragmentSeq;
        function compileUnion(what: Source): Query;
        function compilePolymerNames(names: string[], complement: boolean): Query;
        function compileAmbientResidues(where: Source, radius: number): (ctx: Context) => FragmentSeq;
        function compileWholeResidues(where: Source): (ctx: Context) => FragmentSeq;
        function compileFlatten(what: Source, selector: (f: Fragment) => FragmentSeq): (ctx: Context) => FragmentSeq;
    }
}
declare namespace LiteMol.Core.Structure.Query.Algebraic {
    type Predicate = (ctx: Context, i: number) => boolean;
    type Selector = (ctx: Context, i: number) => any;
    const not: (a: Predicate) => Predicate;
    const and: (a: Predicate, b: Predicate) => Predicate;
    const or: (a: Predicate, b: Predicate) => Predicate;
    const backbone: Predicate;
    const sidechain: Predicate;
    const equal: (a: Selector, b: Selector) => Predicate;
    const notEqual: (a: Selector, b: Selector) => Predicate;
    const greater: (a: Selector, b: Selector) => Predicate;
    const lesser: (a: Selector, b: Selector) => Predicate;
    const greaterEqual: (a: Selector, b: Selector) => Predicate;
    const lesserEqual: (a: Selector, b: Selector) => Predicate;
    function inRange(s: Selector, a: number, b: number): Predicate;
    /**
     * Selectors
     */
    function value(v: any): Selector;
    const residueSeqNumber: Selector;
    const residueName: Selector;
    const elementSymbol: Selector;
    const atomName: Selector;
    const entityType: Selector;
    /**
     * Query
     */
    function query(p: Predicate): Builder;
}
declare module 'LiteMol-core' {
    import __Core = LiteMol.Core;
    export = __Core;
}
