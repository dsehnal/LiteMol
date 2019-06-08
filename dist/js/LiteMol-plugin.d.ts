/// <reference types='react' />
/// <reference types='react-dom' />

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
declare namespace LiteMolCIFTools {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMolCIFTools.Utils {
    /**
     * A generic chunked array builder.
     *
     * When adding elements, the array growns by a specified number
     * of elements and no copying is done until ChunkedArray.compact
     * is called.
     */
    interface ChunkedArray<T> {
        creator: (size: number) => any;
        elementSize: number;
        chunkSize: number;
        current: any;
        currentIndex: number;
        parts: any[];
        elementCount: number;
    }
    namespace ChunkedArray {
        function is(x: any): x is ChunkedArray<any>;
        function add4<T>(array: ChunkedArray<T>, x: T, y: T, z: T, w: T): number;
        function add3<T>(array: ChunkedArray<T>, x: T, y: T, z: T): number;
        function add2<T>(array: ChunkedArray<T>, x: T, y: T): number;
        function add<T>(array: ChunkedArray<T>, x: T): number;
        function compact<T>(array: ChunkedArray<T>): T[];
        function forVertex3D<T>(chunkVertexCount?: number): ChunkedArray<number>;
        function forIndexBuffer<T>(chunkIndexCount?: number): ChunkedArray<number>;
        function forTokenIndices<T>(chunkTokenCount?: number): ChunkedArray<number>;
        function forIndices<T>(chunkTokenCount?: number): ChunkedArray<number>;
        function forInt32<T>(chunkSize?: number): ChunkedArray<number>;
        function forFloat32<T>(chunkSize?: number): ChunkedArray<number>;
        function forArray<T>(chunkSize?: number): ChunkedArray<T>;
        function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ChunkedArray<T>;
    }
}
/**
 * Efficient integer and float parsers.
 *
 * For the purposes of parsing numbers from the mmCIF data representations,
 * up to 4 times faster than JS parseInt/parseFloat.
 */
declare namespace LiteMolCIFTools.Utils.FastNumberParsers {
    function parseIntSkipTrailingWhitespace(str: string, start: number, end: number): number;
    function parseInt(str: string, start: number, end: number): number;
    function parseFloatSkipTrailingWhitespace(str: string, start: number, end: number): number;
    function parseFloat(str: string, start: number, end: number): number;
}
declare namespace LiteMolCIFTools.Utils {
    interface StringWriter {
        chunkData: string[];
        chunkOffset: number;
        chunkCapacity: number;
        data: string[];
    }
    namespace StringWriter {
        function create(chunkCapacity?: number): StringWriter;
        function asString(writer: StringWriter): string;
        function writeTo(writer: StringWriter, stream: OutputStream): void;
        function newline(writer: StringWriter): void;
        function whitespace(writer: StringWriter, len: number): void;
        function write(writer: StringWriter, val: string): void;
        function writeSafe(writer: StringWriter, val: string): void;
        function writePadLeft(writer: StringWriter, val: string, totalWidth: number): void;
        function writePadRight(writer: StringWriter, val: string, totalWidth: number): void;
        function writeInteger(writer: StringWriter, val: number): void;
        function writeIntegerPadLeft(writer: StringWriter, val: number, totalWidth: number): void;
        function writeIntegerPadRight(writer: StringWriter, val: number, totalWidth: number): void;
        /**
         * @example writeFloat(123.2123, 100) -- 2 decim
         */
        function writeFloat(writer: StringWriter, val: number, precisionMultiplier: number): void;
        function writeFloatPadLeft(writer: StringWriter, val: number, precisionMultiplier: number, totalWidth: number): void;
        function writeFloatPadRight(writer: StringWriter, val: number, precisionMultiplier: number, totalWidth: number): void;
    }
}
declare namespace LiteMolCIFTools {
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
        getCategory(name: string): Category | undefined;
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
         *
         * Note that column are created on demand and there is some computational
         * cost when creating a new column. Therefore, if you need to reuse a column,
         * it is a good idea to cache it.
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
    }
}
declare namespace LiteMolCIFTools {
    type ParserResult<T> = ParserSuccess<T> | ParserError;
    namespace ParserResult {
        function error<T>(message: string, line?: number): ParserResult<T>;
        function success<T>(result: T, warnings?: string[]): ParserResult<T>;
    }
    class ParserError {
        message: string;
        line: number;
        isError: true;
        toString(): string;
        constructor(message: string, line: number);
    }
    class ParserSuccess<T> {
        result: T;
        warnings: string[];
        isError: false;
        constructor(result: T, warnings: string[]);
    }
}
declare namespace LiteMolCIFTools {
    interface FieldDesc<Data> {
        name: string;
        string?: (data: Data, i: number) => string | null;
        number?: (data: Data, i: number) => number;
        typedArray?: any;
        encoder?: Binary.Encoder;
        presence?: (data: Data, i: number) => ValuePresence;
    }
    interface CategoryDesc<Data> {
        name: string;
        fields: FieldDesc<Data>[];
    }
    type CategoryInstance<Data> = {
        data: any;
        count: number;
        desc: CategoryDesc<Data>;
    };
    type CategoryProvider = (ctx: any) => CategoryInstance<any> | undefined;
    type OutputStream = {
        writeString: (data: string) => boolean;
        writeBinary: (data: Uint8Array) => boolean;
    };
    interface Writer<Context> {
        startDataBlock(header: string): void;
        writeCategory(category: CategoryProvider, contexts?: Context[]): void;
        encode(): void;
        flush(stream: OutputStream): void;
    }
}
declare namespace LiteMolCIFTools.Text {
    /**
     * Represents the input file.
     */
    class File implements LiteMolCIFTools.File {
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
    class DataBlock implements LiteMolCIFTools.DataBlock {
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
        getCategory(name: string): Category | undefined;
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
    class Category implements LiteMolCIFTools.Category {
        private data;
        private columnIndices;
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
        getColumn(name: string): LiteMolCIFTools.Column;
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
    class Column implements LiteMolCIFTools.Column {
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
declare namespace LiteMolCIFTools.Text {
    function parse(data: string): ParserResult<LiteMolCIFTools.File>;
}
declare namespace LiteMolCIFTools.Text {
    class Writer<Context> implements LiteMolCIFTools.Writer<Context> {
        private writer;
        private encoded;
        private dataBlockCreated;
        startDataBlock(header: string): void;
        writeCategory(category: CategoryProvider, contexts?: Context[]): void;
        encode(): void;
        flush(stream: OutputStream): void;
        constructor();
    }
}
declare namespace LiteMolCIFTools.Binary.MessagePack {
    function decode(buffer: Uint8Array): any;
}
declare namespace LiteMolCIFTools.Binary.MessagePack {
    function encode(value: any): Uint8Array;
}
declare namespace LiteMolCIFTools.Binary.MessagePack {
    function utf8Write(data: Uint8Array, offset: number, str: string): void;
    function utf8Read(data: Uint8Array, offset: number, length: number): string;
    function utf8ByteCount(str: string): number;
}
declare namespace LiteMolCIFTools.Binary {
    /**
     * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
     * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
     */
    function decode(data: EncodedData): any;
}
declare namespace LiteMolCIFTools.Binary {
    class File implements LiteMolCIFTools.File {
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
    class DataBlock implements LiteMolCIFTools.DataBlock {
        private categoryMap;
        private categoryList;
        header: string;
        additionalData: {
            [name: string]: any;
        };
        readonly categories: Category[];
        getCategory(name: string): Category | undefined;
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
    class Category implements LiteMolCIFTools.Category {
        private encodedColumns;
        private columnNameList;
        name: string;
        columnCount: number;
        rowCount: number;
        readonly columnNames: string[];
        getColumn(name: string): LiteMolCIFTools.Column;
        toJSON(): {
            name: string;
            columns: string[];
            rows: any[];
        };
        constructor(data: EncodedCategory);
    }
}
declare namespace LiteMolCIFTools.Binary {
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
        function byteArray(data: Encoding.FloatArray | Encoding.IntArray): Result;
        function fixedPoint(factor: number): Provider;
        function intervalQuantizaiton(min: number, max: number, numSteps: number, arrayType?: new (size: number) => Encoding.IntArray): Provider;
        function runLength(data: Encoding.IntArray): Result;
        function delta(data: Int8Array | Int16Array | Int32Array): Result;
        /**
         * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
         */
        function integerPacking(data: Int32Array): Result;
        function stringArray(data: string[]): Result;
    }
}
declare namespace LiteMolCIFTools.Binary {
    const VERSION = "0.3.0";
    type Encoding = Encoding.ByteArray | Encoding.FixedPoint | Encoding.RunLength | Encoding.Delta | Encoding.IntervalQuantization | Encoding.IntegerPacking | Encoding.StringArray;
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
        const enum IntDataType {
            Int8 = 1,
            Int16 = 2,
            Int32 = 3,
            Uint8 = 4,
            Uint16 = 5,
            Uint32 = 6,
        }
        const enum FloatDataType {
            Float32 = 32,
            Float64 = 33,
        }
        type DataType = IntDataType | FloatDataType;
        type IntArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array;
        type FloatArray = Float32Array | Float64Array;
        function getDataType(data: IntArray | FloatArray): DataType;
        function isSignedIntegerDataType(data: IntArray): boolean;
        interface ByteArray {
            kind: 'ByteArray';
            type: DataType;
        }
        interface FixedPoint {
            kind: 'FixedPoint';
            factor: number;
            srcType: FloatDataType;
        }
        interface IntervalQuantization {
            kind: 'IntervalQuantization';
            min: number;
            max: number;
            numSteps: number;
            srcType: FloatDataType;
        }
        interface RunLength {
            kind: 'RunLength';
            srcType: IntDataType;
            srcSize: number;
        }
        interface Delta {
            kind: 'Delta';
            origin: number;
            srcType: IntDataType;
        }
        interface IntegerPacking {
            kind: 'IntegerPacking';
            byteCount: number;
            isUnsigned: boolean;
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
declare namespace LiteMolCIFTools.Binary {
    function parse(data: ArrayBuffer): ParserResult<LiteMolCIFTools.File>;
}
declare namespace LiteMolCIFTools.Binary {
    class Writer<Context> implements LiteMolCIFTools.Writer<Context> {
        private data;
        private dataBlocks;
        private encodedData;
        startDataBlock(header: string): void;
        writeCategory(category: CategoryProvider, contexts?: Context[]): void;
        encode(): void;
        flush(stream: OutputStream): void;
        constructor(encoder: string);
    }
}
// Type definitions for three.js r71
// Project: http://mrdoob.github.com/three.js/
// Definitions by: Kon <http://phyzkit.net/>, Satoru Kimura <https://github.com/gyohk>
// Definitions: https://github.com/borisyankov/DefinitelyTyped  

interface WebGLRenderingContext { }

declare module LiteMolTHREE {
    export var REVISION: string;

    export var TrackballControls: any;

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.button
    export enum MOUSE { }
    export var LEFT: MOUSE;
    export var MIDDLE: MOUSE;
    export var RIGHT: MOUSE;

    // GL STATE CONSTANTS
    export enum CullFace { }
    export var CullFaceNone: CullFace;
    export var CullFaceBack: CullFace;
    export var CullFaceFront: CullFace;
    export var CullFaceFrontBack: CullFace;

    export enum FrontFaceDirection { }
    export var FrontFaceDirectionCW: FrontFaceDirection;
    export var FrontFaceDirectionCCW: FrontFaceDirection;

    // Shadowing Type
    export enum ShadowMapType { }
    export var BasicShadowMap: ShadowMapType;
    export var PCFShadowMap: ShadowMapType;
    export var PCFSoftShadowMap: ShadowMapType;

    // MATERIAL CONSTANTS

    // side
    export enum Side { }
    export var FrontSide: Side;
    export var BackSide: Side;
    export var DoubleSide: Side;

    // shading
    export enum Shading { }
    export var NoShading: Shading;
    export var FlatShading: Shading;
    export var SmoothShading: Shading;

    // colors
    export enum Colors { }
    export var NoColors: Colors;
    export var FaceColors: Colors;
    export var VertexColors: Colors;

    // blending modes
    export enum Blending { }
    export var NoBlending: Blending;
    export var NormalBlending: Blending;
    export var AdditiveBlending: Blending;
    export var SubtractiveBlending: Blending;
    export var MultiplyBlending: Blending;
    export var CustomBlending: Blending;

    // custom blending equations
    // (numbers start from 100 not to clash with other
    //  mappings to OpenGL constants defined in Texture.js)
    export enum BlendingEquation { }
    export var AddEquation: BlendingEquation;
    export var SubtractEquation: BlendingEquation;
    export var ReverseSubtractEquation: BlendingEquation;
    export var MinEquation: BlendingEquation;
    export var MaxEquation: BlendingEquation;

    // custom blending destination factors
    export enum BlendingDstFactor { }
    export var ZeroFactor: BlendingDstFactor;
    export var OneFactor: BlendingDstFactor;
    export var SrcColorFactor: BlendingDstFactor;
    export var OneMinusSrcColorFactor: BlendingDstFactor;
    export var SrcAlphaFactor: BlendingDstFactor;
    export var OneMinusSrcAlphaFactor: BlendingDstFactor;
    export var DstAlphaFactor: BlendingDstFactor;
    export var OneMinusDstAlphaFactor: BlendingDstFactor;

    // custom blending src factors
    export enum BlendingSrcFactor { }
    export var DstColorFactor: BlendingSrcFactor;
    export var OneMinusDstColorFactor: BlendingSrcFactor;
    export var SrcAlphaSaturateFactor: BlendingSrcFactor;

    // TEXTURE CONSTANTS
    // Operations
    export enum Combine { }
    export var MultiplyOperation: Combine;
    export var MixOperation: Combine;
    export var AddOperation: Combine;

    // Mapping modes
    export enum Mapping { }
    export var UVMapping: Mapping;
    export var CubeReflectionMapping: Mapping;
    export var CubeRefractionMapping: Mapping;
    export var EquirectangularReflectionMapping: Mapping;
    export var EquirectangularRefractionMapping: Mapping;
    export var SphericalReflectionMapping: Mapping;

    // Wrapping modes
    export enum Wrapping { }
    export var RepeatWrapping: Wrapping;
    export var ClampToEdgeWrapping: Wrapping;
    export var MirroredRepeatWrapping: Wrapping;

    // Filters
    export enum TextureFilter { }
    export var NearestFilter: TextureFilter;
    export var NearestMipMapNearestFilter: TextureFilter;
    export var NearestMipMapLinearFilter: TextureFilter;
    export var LinearFilter: TextureFilter;
    export var LinearMipMapNearestFilter: TextureFilter;
    export var LinearMipMapLinearFilter: TextureFilter;

    // Data types
    export enum TextureDataType { }
    export var UnsignedByteType: TextureDataType;
    export var ByteType: TextureDataType;
    export var ShortType: TextureDataType;
    export var UnsignedShortType: TextureDataType;
    export var IntType: TextureDataType;
    export var UnsignedIntType: TextureDataType;
    export var FloatType: TextureDataType;
    export var HalfFloatType: TextureDataType;

    // Pixel types
    export enum PixelType { }
    export var UnsignedShort4444Type: PixelType;
    export var UnsignedShort5551Type: PixelType;
    export var UnsignedShort565Type: PixelType;

    // Pixel formats
    export enum PixelFormat { }
    export var AlphaFormat: PixelFormat;
    export var RGBFormat: PixelFormat;
    export var RGBAFormat: PixelFormat;
    export var LuminanceFormat: PixelFormat;
    export var LuminanceAlphaFormat: PixelFormat;
    export var RGBEFormat: PixelFormat;

    // Compressed texture formats
    // DDS / ST3C Compressed texture formats
    export enum CompressedPixelFormat { }
    export var RGB_S3TC_DXT1_Format: CompressedPixelFormat;
    export var RGBA_S3TC_DXT1_Format: CompressedPixelFormat;
    export var RGBA_S3TC_DXT3_Format: CompressedPixelFormat;
    export var RGBA_S3TC_DXT5_Format: CompressedPixelFormat;

    // PVRTC compressed texture formats
    export var RGB_PVRTC_4BPPV1_Format: CompressedPixelFormat;
    export var RGB_PVRTC_2BPPV1_Format: CompressedPixelFormat;
    export var RGBA_PVRTC_4BPPV1_Format: CompressedPixelFormat;
    export var RGBA_PVRTC_2BPPV1_Format: CompressedPixelFormat;

    // log handlers
    export function warn(message?: any, ...optionalParams: any[]): void;
    export function error(message?: any, ...optionalParams: any[]): void;
    export function log(message?: any, ...optionalParams: any[]): void;


    // Cameras ////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Abstract base class for cameras. This class should always be inherited when you build a new camera.
     */
    export class Camera extends Object3D {
        /**
         * This constructor sets following properties to the correct type: matrixWorldInverse, projectionMatrix and projectionMatrixInverse.
         */
        constructor();

        /**
         * This is the inverse of matrixWorld. MatrixWorld contains the Matrix which has the world transform of the Camera.
         */
        matrixWorldInverse: Matrix4;

        /**
         * This is the matrix which contains the projection.
         */
        projectionMatrix: Matrix4;

        getWorldDirection(optionalTarget?: Vector3): Vector3;

        /**
         * This make the camera look at the vector position in local space.
         * @param vector point to look at
         */
        lookAt(vector: Vector3): void;

        clone(camera?: Camera): Camera;
    }

    export class CubeCamera extends Object3D {
        constructor(near?: number, far?: number, cubeResolution?: number);

        renderTarget: WebGLRenderTargetCube;

        updateCubeMap(renderer: Renderer, scene: Scene): void;

    }

    /**
     * Camera with orthographic projection
     *
     * @example
     * var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
     * scene.add( camera );
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/cameras/OrthographicCamera.js">src/cameras/OrthographicCamera.js</a>
     */
    export class OrthographicCamera extends Camera {
        /**
         * @param left Camera frustum left plane.
         * @param right Camera frustum right plane.
         * @param top Camera frustum top plane.
         * @param bottom Camera frustum bottom plane.
         * @param near Camera frustum near plane.
         * @param far Camera frustum far plane.
         */
        constructor(left: number, right: number, top: number, bottom: number, near?: number, far?: number);

        zoom: number;

        /**
         * Camera frustum left plane.
         */
        left: number;

        /**
         * Camera frustum right plane.
         */
        right: number;

        /**
         * Camera frustum top plane.
         */
        top: number;

        /**
         * Camera frustum bottom plane.
         */
        bottom: number;

        /**
         * Camera frustum near plane.
         */
        near: number;

        /**
         * Camera frustum far plane.
         */
        far: number;

        /**
         * Updates the camera projection matrix. Must be called after change of parameters.
         */
        updateProjectionMatrix(): void;

        clone(): OrthographicCamera;
    }

    /**
     * Camera with perspective projection.
     *
     * # example
     *     var camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
     *     scene.add( camera );
     *
     * @source https://github.com/mrdoob/three.js/blob/master/src/cameras/PerspectiveCamera.js
     */
    export class PerspectiveCamera extends Camera {
        /**
         * @param fov Camera frustum vertical field of view. Default value is 50.
         * @param aspect Camera frustum aspect ratio. Default value is 1.
         * @param near Camera frustum near plane. Default value is 0.1.
         * @param far Camera frustum far plane. Default value is 2000.
         */
        constructor(fov?: number, aspect?: number, near?: number, far?: number);

        zoom: number;

        /**
         * Camera frustum vertical field of view, from bottom to top of view, in degrees.
         */
        fov: number;

        /**
         * Camera frustum aspect ratio, window width divided by window height.
         */
        aspect: number;

        /**
         * Camera frustum near plane.
         */
        near: number;

        /**
         * Camera frustum far plane.
         */
        far: number;

        /**
         * Uses focal length (in mm) to estimate and set FOV 35mm (fullframe) camera is used if frame size is not specified.
         * Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
         * @param focalLength focal length
         * @param frameHeight frame size. Default value is 24.
         */
        setLens(focalLength: number, frameHeight?: number): void;

        /**
         * Sets an offset in a larger frustum. This is useful for multi-window or multi-monitor/multi-machine setups.
         * For example, if you have 3x2 monitors and each monitor is 1920x1080 and the monitors are in grid like this:
         *
         *     +---+---+---+
         *     | A | B | C |
         *     +---+---+---+
         *     | D | E | F |
         *     +---+---+---+
         *
         * then for each monitor you would call it like this:
         *
         *     var w = 1920;
         *     var h = 1080;
         *     var fullWidth = w * 3;
         *     var fullHeight = h * 2;
         *
         *     // A
         *     camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
         *     // B
         *     camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
         *     // C
         *     camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
         *     // D
         *     camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
         *     // E
         *     camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
         *     // F
         *     camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h ); Note there is no reason monitors have to be the same size or in a grid.
         *
         * @param fullWidth full width of multiview setup
         * @param fullHeight full height of multiview setup
         * @param x horizontal offset of subcamera
         * @param y vertical offset of subcamera
         * @param width width of subcamera
         * @param height height of subcamera
         */
        setViewOffset(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number): void;

        /**
         * Updates the camera projection matrix. Must be called after change of parameters.
         */
        updateProjectionMatrix(): void;
        clone(): PerspectiveCamera;
    }

    // Core ///////////////////////////////////////////////////////////////////////////////////////////////
    export class BufferAttribute {
        constructor(array: any, itemSize: number); // array parameter should be TypedArray.

        array: number[];
        itemSize: number;
        needsUpdate: boolean;
        length: number;

        copyAt(index1: number, attribute: BufferAttribute, index2: number): void;
        set(value: number, offset?: number): BufferAttribute;
        setX(index: number, x: number): BufferAttribute;
        setY(index: number, y: number): BufferAttribute;
        setZ(index: number, z: number): BufferAttribute;
        setXY(index: number, x: number, y: number): BufferAttribute;
        setXYZ(index: number, x: number, y: number, z: number): BufferAttribute;
        setXYZW(index: number, x: number, y: number, z: number, w: number): BufferAttribute;
        clone(): BufferAttribute;
    }

    // deprecated
    export class Int8Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Uint8Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Uint8ClampedAttribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Int16Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Uint16Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Int32Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Uint32Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Float32Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    // deprecated
    export class Float64Attribute extends BufferAttribute {
        constructor(data: any, itemSize: number);
    }

    /**
     * This is a superefficent class for geometries because it saves all data in buffers.
     * It reduces memory costs and cpu cycles. But it is not as easy to work with because of all the nessecary buffer calculations.
     * It is mainly interesting when working with static objects.
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/BufferGeometry.js">src/core/BufferGeometry.js</a>
     */
    export class BufferGeometry {
        /**
         * This creates a new BufferGeometry. It also sets several properties to an default value.
         */
        constructor();

        /**
         * Unique number of this buffergeometry instance
         */
        id: number;
        uuid: string;
        name: string;
        type: string;
        attributes: BufferAttribute[];
        attributesKeys: string[];
        drawcalls: { start: number; count: number; index: number; }[];
        offsets: { start: number; count: number; index: number; }[];
        boundingBox: Box3;
        boundingSphere: BoundingSphere;

        addAttribute(name: string, attribute: BufferAttribute): any;
        addAttribute(name: string, array: any, itemSize: number): any;
        getAttribute(name: string): any;
        addDrawCall(start: number, count: number, index: number): void;

        /**
         * Bakes matrix transform directly into vertex coordinates.
         */
        applyMatrix(matrix: Matrix4): void;

        center(): Vector3;

        fromGeometry(geometry: Geometry, settings?: any): BufferGeometry;

        /**
         * Computes bounding box of the geometry, updating Geometry.boundingBox attribute.
         * Bounding boxes aren't computed by default. They need to be explicitly computed, otherwise they are null.
         */
        computeBoundingBox(): void;

        /**
         * Computes bounding sphere of the geometry, updating Geometry.boundingSphere attribute.
         * Bounding spheres aren't' computed by default. They need to be explicitly computed, otherwise they are null.
         */
        computeBoundingSphere(): void;

        // deprecated
        computeFaceNormals(): void;

        /**
         * Computes vertex normals by averaging face normals.
         */
        computeVertexNormals(): void;

        /**
         * Computes vertex tangents.
         * Based on http://www.terathon.com/code/tangent.html
         * Geometry must have vertex UVs (layer 0 will be used).
         */
        computeTangents(): void;

        computeOffsets(size: number): void;
        merge(geometry: BufferGeometry, offset: number): BufferGeometry;
        normalizeNormals(): void;
        reorderBuffers(indexBuffer: number, indexMap: number[], vertexCount: number): void;
        toJSON(): any;
        clone(): BufferGeometry;

        /**
         * Disposes the object from memory.
         * You need to call this when you want the bufferGeometry removed while the application is running.
         */
        dispose(): void;


        // EventDispatcher mixins
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string; target: any; }): void;
    }

    /**
     * Object for keeping track of time.
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js">src/core/Clock.js</a>
     */
    export class Clock {
        /**
         * @param autoStart Automatically start the clock.
         */
        constructor(autoStart?: boolean);

        /**
         * If set, starts the clock automatically when the first update is called.
         */
        autoStart: boolean;

        /**
         * When the clock is running, It holds the starttime of the clock.
         * This counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
         */
        startTime: number;

        /**
         * When the clock is running, It holds the previous time from a update.
         * This counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
         */
        oldTime: number;

        /**
         * When the clock is running, It holds the time elapsed between the start of the clock to the previous update.
         * This parameter is in seconds of three decimal places.
         */
        elapsedTime: number;

        /**
         * This property keeps track whether the clock is running or not.
         */
        running: boolean;

        /**
         * Starts clock.
         */
        start(): void;

        /**
         * Stops clock.
         */
        stop(): void;

        /**
         * Get the seconds passed since the clock started.
         */
        getElapsedTime(): number;

        /**
         * Get the seconds passed since the last call to this method.
         */
        getDelta(): number;
    }

    export class DynamicBufferAttribute extends BufferAttribute {
        constructor(array: any, itemSize: number);

        updateRange: {
            offset: number;
            count: number;
        }

        clone(): DynamicBufferAttribute;
    }

    /**
     * JavaScript events for custom objects
     *
     * # Example
     *     var Car = function () {
     *     
     *         EventDispatcher.call( this );
     *         this.start = function () {
     *     
     *             this.dispatchEvent( { type: 'start', message: 'vroom vroom!' } );
     *     
     *         };
     *     
     *     };
     *
     *     var car = new Car();
     *     car.addEventListener( 'start', function ( event ) {
     *     
     *         alert( event.message );
     *     
     *     } );
     *     car.start();
     *
     * @source src/core/EventDispatcher.js
     */
    export class EventDispatcher {
        /**
         * Creates eventDispatcher object. It needs to be call with '.call' to add the functionality to an object.
         */
        constructor();

        /**
         * Adds a listener to an event type.
         * @param type The type of the listener that gets removed.
         * @param listener The listener function that gets removed.
         */
        addEventListener(type: string, listener: (event: any) => void): void;

        /**
         * Adds a listener to an event type.
         * @param type The type of the listener that gets removed.
         * @param listener The listener function that gets removed.
         */
        hasEventListener(type: string, listener: (event: any) => void): void;

        /**
         * Removes a listener from an event type.
         * @param type The type of the listener that gets removed.
         * @param listener The listener function that gets removed.
         */
        removeEventListener(type: string, listener: (event: any) => void): void;

        /**
         * Fire an event type.
         * @param type The type of event that gets fired.
         */
        dispatchEvent(event: { type: string; target: any; }): void;
    }

    /**
     * Triangle face.
     *
     * # Example
     *     var normal = new THREE.Vector3( 0, 1, 0 );
     *     var color = new THREE.Color( 0xffaa00 );
     *     var face = new THREE.Face3( 0, 1, 2, normal, color, 0 );
     *
     * @source https://github.com/mrdoob/three.js/blob/master/src/core/Face3.js
     */
    export class Face3 {
        /**
         * @param a Vertex A index.
         * @param b Vertex B index.
         * @param c Vertex C index.
         * @param normal Face normal or array of vertex normals.
         * @param color Face color or array of vertex colors.
         * @param materialIndex Material index.
         */
        constructor(a: number, b: number, c: number, normal?: Vector3, color?: Color, materialIndex?: number);
        constructor(a: number, b: number, c: number, normal?: Vector3, vertexColors?: Color[], materialIndex?: number);
        constructor(a: number, b: number, c: number, vertexNormals?: Vector3[], color?: Color, materialIndex?: number);
        constructor(a: number, b: number, c: number, vertexNormals?: Vector3[], vertexColors?: Color[], materialIndex?: number);

        /**
         * Vertex A index.
         */
        a: number;

        /**
         * Vertex B index.
         */
        b: number;

        /**
         * Vertex C index.
         */
        c: number;

        /**
         * Face normal.
         */
        normal: Vector3;

        /**
         * Array of 4 vertex normals.
         */
        vertexNormals: Vector3[];

        /**
         * Face color.
         */
        color: Color;

        /**
         * Array of 4 vertex normals.
         */
        vertexColors: Color[];

        /**
         * Array of 4 vertex tangets.
         */
        vertexTangents: number[];

        /**
         * Material index (points to {@link Geometry.materials}).
         */
        materialIndex: number;

        clone(): Face3;
    }

    export interface MorphTarget {
        name: string;
        vertices: Vector3[];
    }

    export interface MorphColor {
        name: string;
        colors: Color[];
    }

    export interface MorphNormals {
        name: string;
        normals: Vector3[];
    }

    export interface BoundingSphere {
        center: Vector3;
        radius: number;
    }


    /**
     * Base class for geometries
     *
     * # Example
     *     var geometry = new THREE.Geometry();
     *     geometry.vertices.push( new THREE.Vector3( -10, 10, 0 ) );
     *     geometry.vertices.push( new THREE.Vector3( -10, -10, 0 ) );
     *     geometry.vertices.push( new THREE.Vector3( 10, -10, 0 ) );
     *     geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
     *     geometry.computeBoundingSphere();
     *
     * @see https://github.com/mrdoob/three.js/blob/master/src/core/Geometry.js
     */
    export class Geometry {
        constructor();

        /**
         * Unique number of this geometry instance
         */
        id: number;

        uuid: string;

        /**
         * Name for this geometry. Default is an empty string.
         */
        name: string;

        type: string;

        /**
         * The array of vertices hold every position of points of the model.
         * To signal an update in this array, Geometry.verticesNeedUpdate needs to be set to true.
         */
        vertices: Vector3[];

        /**
         * Array of vertex colors, matching number and order of vertices.
         * Used in ParticleSystem, Line and Ribbon.
         * Meshes use per-face-use-of-vertex colors embedded directly in faces.
         * To signal an update in this array, Geometry.colorsNeedUpdate needs to be set to true.
         */
        colors: Color[];

        /**
         * Array of triangles or/and quads.
         * The array of faces describe how each vertex in the model is connected with each other.
         * To signal an update in this array, Geometry.elementsNeedUpdate needs to be set to true.
         */
        faces: Face3[];

        /**
         * Array of face UV layers.
         * Each UV layer is an array of UV matching order and number of vertices in faces.
         * To signal an update in this array, Geometry.uvsNeedUpdate needs to be set to true.
         */
        faceVertexUvs: Vector2[][][];

        /**
         * Array of morph targets. Each morph target is a Javascript object:
         *
         *     { name: "targetName", vertices: [ new THREE.Vector3(), ... ] }
         *
         * Morph vertices match number and order of primary vertices.
         */
        morphTargets: MorphTarget[];

        /**
         * Array of morph colors. Morph colors have similar structure as morph targets, each color set is a Javascript object:
         *
         *     morphColor = { name: "colorName", colors: [ new THREE.Color(), ... ] }
         */
        morphColors: MorphColor[];

        /**
         * Array of morph normals. Morph normals have similar structure as morph targets, each normal set is a Javascript object:
         *
         *     morphNormal = { name: "NormalName", normals: [ new THREE.Vector3(), ... ] }
         */
        morphNormals: MorphNormals[];

        /**
         * Array of skinning weights, matching number and order of vertices.
         */
        skinWeights: number[];

        /**
         * Array of skinning indices, matching number and order of vertices.
         */
        skinIndices: number[];

        /**
         *
         */
        lineDistances: number[];

        /**
         * Bounding box.
         */
        boundingBox: Box3;

        /**
         * Bounding sphere.
         */
        boundingSphere: BoundingSphere;

        /**
         * True if geometry has tangents. Set in Geometry.computeTangents.
         */
        hasTangents: boolean;

        /**
         * Set to true if attribute buffers will need to change in runtime (using "dirty" flags).
         * Unless set to true internal typed arrays corresponding to buffers will be deleted once sent to GPU.
         * Defaults to true.
         */
        dynamic: boolean;

        /**
         * Set to true if the vertices array has been updated.
         */
        verticesNeedUpdate: boolean;

        /**
         * Set to true if the faces array has been updated.
         */
        elementsNeedUpdate: boolean;

        /**
         * Set to true if the uvs array has been updated.
         */
        uvsNeedUpdate: boolean;

        /**
         * Set to true if the normals array has been updated.
         */
        normalsNeedUpdate: boolean;

        /**
         * Set to true if the tangents in the faces has been updated.
         */
        tangentsNeedUpdate: boolean;

        /**
         * Set to true if the colors array has been updated.
         */
        colorsNeedUpdate: boolean;

        /**
         * Set to true if the linedistances array has been updated.
         */
        lineDistancesNeedUpdate: boolean;

        /**
         *
         */
        groupsNeedUpdate: boolean;

        /**
         * Bakes matrix transform directly into vertex coordinates.
         */
        applyMatrix(matrix: Matrix4): void;

        fromBufferGeometry(geometry: BufferGeometry): Geometry;

        /**
         *
         */
        center(): Vector3;

        /**
         * Computes face normals.
         */
        computeFaceNormals(): void;

        /**
         * Computes vertex normals by averaging face normals.
         * Face normals must be existing / computed beforehand.
         */
        computeVertexNormals(areaWeighted?: boolean): void;

        /**
         * Computes morph normals.
         */
        computeMorphNormals(): void;

        /**
         * Computes vertex tangents.
         * Based on <a href="http://www.terathon.com/code/tangent.html">http://www.terathon.com/code/tangent.html</a>
         * Geometry must have vertex UVs (layer 0 will be used).
         */
        computeTangents(): void;

        computeLineDistances(): void;

        /**
         * Computes bounding box of the geometry, updating {@link Geometry.boundingBox} attribute.
         */
        computeBoundingBox(): void;

        /**
         * Computes bounding sphere of the geometry, updating Geometry.boundingSphere attribute.
         * Neither bounding boxes or bounding spheres are computed by default. They need to be explicitly computed, otherwise they are null.
         */
        computeBoundingSphere(): void;

        merge(geometry: Geometry, matrix: Matrix, materialIndexOffset: number): void;

        mergeMesh(mesh: Mesh): void;

        /**
         * Checks for duplicate vertices using hashmap.
         * Duplicated vertices are removed and faces' vertices are updated.
         */
        mergeVertices(): number;

        toJSON(): any;

        /**
         * Creates a new clone of the Geometry.
         */
        clone(): Geometry;

        /**
         * Removes The object from memory.
         * Don't forget to call this method when you remove an geometry because it can cuase meomory leaks.
         */
        dispose(): void;


        //These properties do not exist in a normal Geometry class, but if you use the instance that was passed by JSONLoader, it will be added.
        bones: Bone[];
        animation: AnimationData;
        animations: AnimationData[];

        // EventDispatcher mixins
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string; target: any; }): void;
    }

    /**
     * Base class for scene graph objects
     */
    export class Object3D {
        constructor();

        /**
         * Unique number of this object instance.
         */
        id: number;

        /**
         *
         */
        uuid: string;

        /**
         * Optional name of the object (doesn't need to be unique).
         */
        name: string;

        type: string;

        /**
         * Object's parent in the scene graph.
         */
        parent: Object3D;

        /**
         * Array with object's children.
         */
        children: Object3D[];

        /**
         * Up direction.
         */
        up: Vector3;

        /**
         * Object's local position.
         */
        position: Vector3;

        /**
         * Object's local rotation (Euler angles), in radians.
         */
        rotation: Euler;

        /**
         * Global rotation.
         */
        quaternion: Quaternion;

        /**
         * Object's local scale.
         */
        scale: Vector3;

        /**
         * When this is set, then the rotationMatrix gets calculated every frame.
         */
        rotationAutoUpdate: boolean;

        /**
         * Local transform.
         */
        matrix: Matrix4;

        /**
         * The global transform of the object. If the Object3d has no parent, then it's identical to the local transform.
         */
        matrixWorld: Matrix4;

        /**
         * When this is set, it calculates the matrix of position, (rotation or quaternion) and scale every frame and also recalculates the matrixWorld property.
         */
        matrixAutoUpdate: boolean;

        /**
         * When this is set, it calculates the matrixWorld in that frame and resets this property to false.
         */
        matrixWorldNeedsUpdate: boolean;

        /**
         * Object gets rendered if true.
         */
        visible: boolean;

        /**
         * Gets rendered into shadow map.
         */
        castShadow: boolean;

        /**
         * Material gets baked in shadow receiving.
         */
        receiveShadow: boolean;

        /**
         * When this is set, it checks every frame if the object is in the frustum of the camera. Otherwise the object gets drawn every frame even if it isn't visible.
         */
        frustumCulled: boolean;

        renderOrder: number;

        /**
         * An object that can be used to store custom data about the Object3d. It should not hold references to functions as these will not be cloned.
         */
        userData: any;

        /**
         *
         */
        static DefaultUp: Vector3;


        /**
         * Order of axis for Euler angles.
         */
        // deprecated
        eulerOrder: string;


        /**
         * This updates the position, rotation and scale with the matrix.
         */
        applyMatrix(matrix: Matrix4): void;

        /**
         *
         */
        setRotationFromAxisAngle(axis: Vector3, angle: number): void;

        /**
         *
         */
        setRotationFromEuler(euler: Euler): void;

        /**
         *
         */
        setRotationFromMatrix(m: Matrix4): void;

        /**
         *
         */
        setRotationFromQuaternion(q: Quaternion): void;

        /**
         * Rotate an object along an axis in object space. The axis is assumed to be normalized.
         * @param axis  A normalized vector in object space.
         * @param angle  The angle in radians.
         */
        rotateOnAxis(axis: Vector3, angle: number): Object3D;

        /**
         *
         * @param angle
         */
        rotateX(angle: number): Object3D;

        /**
         *
         * @param angle
         */
        rotateY(angle: number): Object3D;

        /**
         *
         * @param angle
         */
        rotateZ(angle: number): Object3D;

        /**
         * @param axis  A normalized vector in object space.
         * @param distance  The distance to translate.
         */
        translateOnAxis(axis: Vector3, distance: number): Object3D;

        /**
         *
         * @param distance
         * @param axis
         */
        translate(distance: number, axis: Vector3): Object3D;

        /**
         * Translates object along x axis by distance.
         * @param distance Distance.
         */
        translateX(distance: number): Object3D;

        /**
         * Translates object along y axis by distance.
         * @param distance Distance.
         */
        translateY(distance: number): Object3D;

        /**
         * Translates object along z axis by distance.
         * @param distance Distance.
         */
        translateZ(distance: number): Object3D;

        /**
         * Updates the vector from local space to world space.
         * @param vector A local vector.
         */
        localToWorld(vector: Vector3): Vector3;

        /**
         * Updates the vector from world space to local space.
         * @param vector A world vector.
         */
        worldToLocal(vector: Vector3): Vector3;

        /**
         * Rotates object to face point in space.
         * @param vector A world vector to look at.
         */
        lookAt(vector: Vector3): void;

        /**
         * Adds object as child of this object.
         */
        add(object: Object3D): void;

        /**
         * Removes object as child of this object.
         */
        remove(object: Object3D): void;

        /* deprecated */
        getChildByName(name: string): Object3D;

        /**
         * Searches through the object's children and returns the first with a matching id, optionally recursive.
         * @param id  Unique number of the object instance
         */
        getObjectById(id: string): Object3D;

        /**
         * Searches through the object's children and returns the first with a matching name, optionally recursive.
         * @param name  String to match to the children's Object3d.name property.
         */
        getObjectByName(name: string): Object3D;

        getObjectByProperty(name: string, value: string): Object3D;

        getWorldPosition(optionalTarget?: Vector3): Vector3;
        getWorldQuaternion(optionalTarget?: Quaternion): Quaternion;
        getWorldRotation(optionalTarget?: Euler): Euler;
        getWorldScale(optionalTarget?: Vector3): Vector3;
        getWorldDirection(optionalTarget?: Vector3): Vector3;

        /**
         * Translates object along arbitrary axis by distance.
         * @param distance Distance.
         * @param axis Translation direction.
         */
        traverse(callback: (object: Object3D) => any): void;

        traverseVisible(callback: (object: Object3D) => any): void;

        traverseAncestors(callback: (object: Object3D) => any): void;

        /**
         * Updates local transform.
         */
        updateMatrix(): void;

        /**
         * Updates global transform of the object and its children.
         */
        updateMatrixWorld(force: boolean): void;

        toJSON(): any;

        /**
         *
         * @param object
         * @param recursive
         */
        clone(object?: Object3D, recursive?: boolean): Object3D;

        // EventDispatcher mixins
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string; target: any; }): void;

    }

    export interface Intersection {
        distance: number;
        point: Vector3;
        face: Face3;
        object: Object3D;
    }

    export interface RaycasterParameters {
        Sprite?: any;
        Mesh?: any;
        PointCloud?: any;
        LOD?: any;
        Line?: any;
    }

    export class Raycaster {
        constructor(origin?: Vector3, direction?: Vector3, near?: number, far?: number);

        ray: Ray;
        near: number;
        far: number;
        params: RaycasterParameters;
        precision: number;
        linePrecision: number;
        set(origin: Vector3, direction: Vector3): void;
        setFromCamera(coords: { x: number; y: number; }, camera: Camera): void;
        intersectObject(object: Object3D, recursive?: boolean): Intersection[];
        intersectObjects(objects: Object3D[], recursive?: boolean): Intersection[];
    }

    // Lights //////////////////////////////////////////////////////////////////////////////////

    /**
     * Abstract base class for lights.
     */
    export class Light extends Object3D {
        constructor(hex?: number);

        color: Color;

        clone(light?: Light): Light;
    }

    /**
     * This light's color gets applied to all the objects in the scene globally.
     *
     * # example
     *     var light = new THREE.AmbientLight( 0x404040 ); // soft white light
     *     scene.add( light );
     *
     * @source https://github.com/mrdoob/three.js/blob/master/src/lights/AmbientLight.js
     */
    export class AmbientLight extends Light {
        /**
         * This creates a Ambientlight with a color.
         * @param hex Numeric value of the RGB component of the color.
         */
        constructor(hex?: number);

        clone(): AmbientLight;
    }

    export class AreaLight extends Light {
        constructor(hex: number, intensity?: number);

        normal: Vector3;
        right: Vector3;
        intensity: number;
        width: number;
        height: number;
        constantAttenuation: number;
        linearAttenuation: number;
        quadraticAttenuation: number;

    }

    /**
     * Affects objects using MeshLambertMaterial or MeshPhongMaterial.
     *
     * @example
     * // White directional light at half intensity shining from the top.
     * var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
     * directionalLight.position.set( 0, 1, 0 );
     * scene.add( directionalLight );
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/lights/DirectionalLight.js">src/lights/DirectionalLight.js</a>
     */
    export class DirectionalLight extends Light {

        constructor(hex?: number, intensity?: number);

        /**
         * Target used for shadow camera orientation.
         */
        target: Object3D;

        /**
         * Light's intensity.
         * Default — 1.0.
         */
        intensity: number;

        /**
         * If set to true light will cast dynamic shadows. Warning: This is expensive and requires tweaking to get shadows looking right.
         * Default — false.
         */
        castShadow: boolean;

        /**
         * If set to true light will only cast shadow but not contribute any lighting (as if intensity was 0 but cheaper to compute).
         * Default — false.
         */
        onlyShadow: boolean;

        /**
         * Orthographic shadow camera frustum parameter.
         * Default — 50.
         */
        shadowCameraNear: number;

        /**
         * Orthographic shadow camera frustum parameter.
         * Default — 5000.
         */
        shadowCameraFar: number;

        /**
         * Orthographic shadow camera frustum parameter.
         * Default — -500.
         */
        shadowCameraLeft: number;

        /**
         * Orthographic shadow camera frustum parameter.
         * Default — 500.
         */
        shadowCameraRight: number;

        /**
         * Orthographic shadow camera frustum parameter.
         * Default — 500.
         */
        shadowCameraTop: number;

        /**
         * Orthographic shadow camera frustum parameter.
         * Default — -500.
         */
        shadowCameraBottom: number;

        /**
         * Show debug shadow camera frustum.
         * Default — false.
         */
        shadowCameraVisible: boolean;

        /**
         * Shadow map bias.
         * Default — 0.
         */
        shadowBias: number;

        /**
         * Darkness of shadow casted by this light (from 0 to 1).
         * Default — 0.5.
         */
        shadowDarkness: number;

        /**
         * Shadow map texture width in pixels.
         * Default — 512.
         */
        shadowMapWidth: number;

        /**
         * Shadow map texture height in pixels.
         * Default — 512.
         */
        shadowMapHeight: number;

        /**
         * Default — false.
         */
        shadowCascade: boolean;

        /**
         * Three.Vector3( 0, 0, -1000 ).
         */
        shadowCascadeOffset: Vector3;

        /**
         * Default — 2.
         */
        shadowCascadeCount: number;

        /**
         * Default — [ 0, 0, 0 ].
         */
        shadowCascadeBias: number[];

        /**
         * Default — [ 512, 512, 512 ].
         */
        shadowCascadeWidth: number[];

        /**
         * Default — [ 512, 512, 512 ].
         */
        shadowCascadeHeight: number[];

        /**
         * Default — [ -1.000, 0.990, 0.998 ].
         */
        shadowCascadeNearZ: number[];

        /**
         * Default — [ 0.990, 0.998, 1.000 ].
         */
        shadowCascadeFarZ: number[];

        /**
         * Default — [ ].
         */
        shadowCascadeArray: DirectionalLight[];

        /**
         * Default — null.
         */
        shadowMap: RenderTarget;

        /**
         * Default — null.
         */
        shadowMapSize: number;

        /**
         * Default — null.
         */
        shadowCamera: Camera;

        /**
         * Default — null.
         */
        shadowMatrix: Matrix4;

        clone(): DirectionalLight;
    }

    export class HemisphereLight extends Light {
        constructor(skyColorHex?: number, groundColorHex?: number, intensity?: number);

        groundColor: Color;
        intensity: number;

        clone(): HemisphereLight;
    }

    /**
     * Affects objects using {@link MeshLambertMaterial} or {@link MeshPhongMaterial}.
     *
     * @example
     * var light = new THREE.PointLight( 0xff0000, 1, 100 );
     * light.position.set( 50, 50, 50 );
     * scene.add( light );
     */
    export class PointLight extends Light {
        constructor(hex?: number, intensity?: number, distance?: number, decay?: number);

        /*
         * Light's intensity.
         * Default - 1.0.
         */
        intensity: number;

        /**
         * If non-zero, light will attenuate linearly from maximum intensity at light position down to zero at distance.
         * Default — 0.0.
         */
        distance: number;

        decay: number;

        clone(): PointLight;
    }

    /**
     * A point light that can cast shadow in one direction.
     *
     * @example
     * // white spotlight shining from the side, casting shadow
     * var spotLight = new THREE.SpotLight( 0xffffff );
     * spotLight.position.set( 100, 1000, 100 );
     * spotLight.castShadow = true;
     * spotLight.shadowMapWidth = 1024;
     * spotLight.shadowMapHeight = 1024;
     * spotLight.shadowCameraNear = 500;
     * spotLight.shadowCameraFar = 4000;
     * spotLight.shadowCameraFov = 30;
     * scene.add( spotLight );
     */
    export class SpotLight extends Light {
        constructor(hex?: number, intensity?: number, distance?: number, angle?: number, exponent?: number, decay?: number);

        /**
         * Spotlight focus points at target.position.
         * Default position — (0,0,0).
         */
        target: Object3D;

        /**
         * Light's intensity.
         * Default — 1.0.
         */
        intensity: number;

        /**
         * If non-zero, light will attenuate linearly from maximum intensity at light position down to zero at distance.
         * Default — 0.0.
         */
        distance: number;

        /*
         * Maximum extent of the spotlight, in radians, from its direction.
         * Default — Math.PI/2.
         */
        angle: number;

        /**
         * Rapidity of the falloff of light from its target direction.
         * Default — 10.0.
         */
        exponent: number;

        decay: number;

        /**
         * If set to true light will cast dynamic shadows. Warning: This is expensive and requires tweaking to get shadows looking right.
         * Default — false.
         */
        castShadow: boolean;

        /**
         * If set to true light will only cast shadow but not contribute any lighting (as if intensity was 0 but cheaper to compute).
         * Default — false.
         */
        onlyShadow: boolean;

        /**
         * Perspective shadow camera frustum near parameter.
         * Default — 50.
         */
        shadowCameraNear: number;

        /**
         * Perspective shadow camera frustum far parameter.
         * Default — 5000.
         */
        shadowCameraFar: number;

        /**
         * Perspective shadow camera frustum field of view parameter.
         * Default — 50.
         */
        shadowCameraFov: number;

        /**
         * Show debug shadow camera frustum.
         * Default — false.
         */
        shadowCameraVisible: boolean;

        /**
         * Shadow map bias.
         * Default — 0.
         */
        shadowBias: number;

        /**
         * Darkness of shadow casted by this light (from 0 to 1).
         * Default — 0.5.
         */
        shadowDarkness: number;

        /**
         * Shadow map texture width in pixels.
         * Default — 512.
         */
        shadowMapWidth: number;

        /**
         * Shadow map texture height in pixels.
         * Default — 512.
         */
        shadowMapHeight: number;

        shadowMap: RenderTarget;
        shadowMapSize: Vector2;
        shadowCamera: Camera;
        shadowMatrix: Matrix4;

        clone(): SpotLight;
    }

    // Loaders //////////////////////////////////////////////////////////////////////////////////

    export interface Progress {
        total: number;
        loaded: number;
    }

    /**
     * Base class for implementing loaders.
     *
     * Events:
     *     load
     *         Dispatched when the image has completed loading
     *         content — loaded image
     *
     *     error
     *
     *          Dispatched when the image can't be loaded
     *          message — error message
     */
    export class Loader {
        constructor(showStatus?: boolean);

        /**
         * If true, show loading status in the statusDomElement.
         */
        showStatus: boolean;

        /**
         * This is the recipient of status messages.
         */
        statusDomElement: HTMLElement;

        imageLoader: ImageLoader;

        /**
         * Will be called when load starts.
         * The default is a function with empty body.
         */
        onLoadStart: () => void;

        /**
         * Will be called while load progresses.
         * The default is a function with empty body.
         */
        onLoadProgress: () => void;

        /**
         * Will be called when load completes.
         * The default is a function with empty body.
         */
        onLoadComplete: () => void;

        /**
         * default — null.
         * If set, assigns the crossOrigin attribute of the image to the value of crossOrigin, prior to starting the load.
         */
        crossOrigin: string;

        addStatusElement(): HTMLElement;
        updateProgress(progress: Progress): void;
        extractUrlBase(url: string): string;
        initMaterials(materials: Material[], texturePath: string): Material[];
        needsTangents(materials: Material[]): boolean;
        createMaterial(m: Material, texturePath: string): boolean;

        static Handlers: LoaderHandler;
    }

    export interface LoaderHandler {
        handlers: any[];
        add(regex: string, loader: Loader): void;
        get(file: string): Loader;
    }

    export class BinaryTextureLoader {
        constructor();

        load(url: string, onLoad: (dataTexture: DataTexture) => void, onProgress?: (event: any) => void, onError?: (event: any) => void): void;
    }

    export class BufferGeometryLoader {
        constructor(manager?: LoadingManager);

        manager: LoadingManager;
        load(url: string, onLoad: (bufferGeometry: BufferGeometry) => void, onProgress?: (event: any) => void, onError?: (event: any) => void): void;
        setCrossOrigin(crossOrigin: string): void;
        parse(json: any): BufferGeometry;
    }

    export interface Cache {
        files: any[];

        add(key: string, file: any): void;
        get(key: string): any;
        remove(key: string): void;
        clear(): void;
    }
    export var Cache: Cache;

    export class CompressedTextureLoader {
        constructor();

        load(url: string, onLoad: (bufferGeometry: BufferGeometry) => void, onError?: (event: any) => void): void;
    }

    export class DataTextureLoader extends BinaryTextureLoader {
        // alias for BinaryTextureLoader.
    }

    /*
     * GeometryLoader class is experimental, and it is not yet included in the compiled source code.
     *
     export class GeometryLoader {

     }
     */

    /**
     * A loader for loading an image.
     * Unlike other loaders, this one emits events instead of using predefined callbacks. So if you're interested in getting notified when things happen, you need to add listeners to the object.
     */
    export class ImageLoader {
        constructor(manager?: LoadingManager);

        cache: Cache;
        manager: LoadingManager;
        crossOrigin: string;

        /**
         * Begin loading from url
         * @param url
         */
        load(url: string, onLoad?: (image: HTMLImageElement) => void, onProgress?: (event: any) => void, onError?: (event: any) => void): HTMLImageElement;

        setCrossOrigin(crossOrigin: string): void;
    }

    /**
     * A loader for loading objects in JSON format.
     */
    export class JSONLoader extends Loader {
        constructor(showStatus?: boolean);

        withCredentials: boolean;

        /**
         * @param url
         * @param callback. This function will be called with the loaded model as an instance of geometry when the load is completed.
         * @param texturePath If not specified, textures will be assumed to be in the same folder as the Javascript model file.
         */
        load(url: string, callback: (geometry: Geometry, materials: Material[]) => void, texturePath?: string): void;

        loadAjaxJSON(context: JSONLoader, url: string, callback: (geometry: Geometry, materials: Material[]) => void, texturePath?: string, callbackProgress?: (progress: Progress) => void): void;

        parse(json: any, texturePath?: string): { geometry: Geometry; materials?: Material[] };
    }

    /**
     * Handles and keeps track of loaded and pending data.
     */
    export class LoadingManager {
        constructor(onLoad?: () => void, onProgress?: (url: string, loaded: number, total: number) => void, onError?: () => void);

        /**
         * Will be called when load starts.
         * The default is a function with empty body.
         */
        onLoad: () => void;

        /**
         * Will be called while load progresses.
         * The default is a function with empty body.
         */
        onProgress: (item: any, loaded: number, total: number) => void;

        /**
         * Will be called when each element in the scene completes loading.
         * The default is a function with empty body.
         */
        onError: () => void;

        itemStart(url: string): void;
        itemEnd(url: string): void;

    }

    export class MaterialLoader {
        constructor(manager?: LoadingManager);

        manager: LoadingManager;

        load(url: string, onLoad: (material: Material) => void): void;
        setCrossOrigin(crossOrigin: string): void;
        parse(json: any): Material;
    }

    export class ObjectLoader {
        constructor(manager?: LoadingManager);

        manager: LoadingManager;
        texturePass: string;

        load(url: string, onLoad?: (object: Object3D) => void): void;
        setTexturePath(value: string): void;
        setCrossOrigin(crossOrigin: string): void;
        parse<T extends Object3D>(json: any, onLoad?: (object: Object3D) => void): T;
        parseGeometries(json: any): any[]; // Array of BufferGeometry or Geometry or Geometry2.
        parseMaterials(json: any, textures: Texture[]): Material[]; // Array of Classes that inherits from Matrial.
        parseImages(json: any, onLoad: () => void): any[];
        parseTextures(json: any, images: any): Texture[];
        parseObject<T extends Object3D>(data: any, geometries: any[], materials: Material[]): T;

    }

    /**
     * Class for loading a texture.
     * Unlike other loaders, this one emits events instead of using predefined callbacks. So if you're interested in getting notified when things happen, you need to add listeners to the object.
     */
    export class TextureLoader {
        constructor(manager?: LoadingManager);

        manager: LoadingManager;
        crossOrigin: string;
        
        /**
         * Begin loading from url
         *
         * @param url
         */
        load(url: string, onLoad: (texture: Texture) => void): void;
        setCrossOrigin(crossOrigin: string): void;
    }

    export class XHRLoader {
        constructor(manager?: LoadingManager);

        cache: Cache;
        manager: LoadingManager;
        responseType: string;
        crossOrigin: string;

        load(url: string, onLoad?: (responseText: string) => void, onProgress?: (event: any) => void, onError?: (event: any) => void): void;
        setResponseType(responseType: string): void;
        setCrossOrigin(crossOrigin: string): void;
    }

    // Materials //////////////////////////////////////////////////////////////////////////////////
    export interface MaterialParameters {
        name?: string;
        side?: Side;
        opacity?: number;
        transparent?: boolean;
        blending?: Blending;
        blendSrc?: BlendingDstFactor;
        blendDst?: BlendingSrcFactor;
        blendEquation?: BlendingEquation;
        depthTest?: boolean;
        depthWrite?: boolean;
        polygonOffset?: boolean;
        polygonOffsetFactor?: number;
        polygonOffsetUnits?: number;
        alphaTest?: number;
        overdraw?: number;
        visible?: boolean;
        needsUpdate?: boolean;
    }

    /**
     * Materials describe the appearance of objects. They are defined in a (mostly) renderer-independent way, so you don't have to rewrite materials if you decide to use a different renderer.
     */
    export class Material {
        constructor();

        /**
         * Unique number of this material instance.
         */
        id: number;

        uuid: string;

        /**
         * Material name. Default is an empty string.
         */
        name: string;

        type: string;

        /**
         * Defines which of the face sides will be rendered - front, back or both.
         * Default is THREE.FrontSide. Other options are THREE.BackSide and THREE.DoubleSide.
         */
        side: Side;

        /**
         * Opacity. Default is 1.
         */
        opacity: number;

        /**
         * Defines whether this material is transparent. This has an effect on rendering, as transparent objects need an special treatment, and are rendered after the opaque (i.e. non transparent) objects. For a working example of this behaviour, check the {@link WebGLRenderer} code.
         * Default is false.
         */
        transparent: boolean;

        /**
         * Which blending to use when displaying objects with this material. Default is {@link NormalBlending}.
         */
        blending: Blending;

        /**
         * Blending source. It's one of the blending mode constants defined in Three.js. Default is {@link SrcAlphaFactor}.
         */
        blendSrc: BlendingDstFactor;

        /**
         * Blending destination. It's one of the blending mode constants defined in Three.js. Default is {@link OneMinusSrcAlphaFactor}.
         */
        blendDst: BlendingSrcFactor;

        /**
         * Blending equation to use when applying blending. It's one of the constants defined in Three.js. Default is AddEquation.
         */
        blendEquation: BlendingEquation;

        blendSrcAlpha: number;
        blendDstAlpha: number;
        blendEquationAlpha: number;

        /**
         * Whether to have depth test enabled when rendering this material. Default is true.
         */
        depthTest: boolean;

        /**
         * Whether rendering this material has any effect on the depth buffer. Default is true.
         * When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.
         */
        depthWrite: boolean;

        colorWrite: boolean;

        /**
         * Whether to use polygon offset. Default is false. This corresponds to the POLYGON_OFFSET_FILL WebGL feature.
         */
        polygonOffset: boolean;

        /**
         * Sets the polygon offset factor. Default is 0.
         */
        polygonOffsetFactor: number;

        /**
         * Sets the polygon offset units. Default is 0.
         */
        polygonOffsetUnits: number;

        /**
         * Sets the alpha value to be used when running an alpha test. Default is 0.
         */
        alphaTest: number;

        /**
         * Enables/disables overdraw. If greater than zero, polygons are drawn slightly bigger in order to fix antialiasing gaps when using the CanvasRenderer. Default is 0.
         */
        overdraw: number;

        /**
         * Defines whether this material is visible. Default is true.
         */
        visible: boolean;

        /**
         * Specifies that the material needs to be updated, WebGL wise. Set it to true if you made changes that need to be reflected in WebGL.
         * This property is automatically set to true when instancing a new material.
         */
        needsUpdate: boolean;

        setValues(values: Object): void;
        toJSON(): any;
        clone(material?: Material): Material;
        update(): void;
        dispose(): void;

        // EventDispatcher mixins
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string; target: any; }): void;
    }

    export interface LineBasicMaterialParameters extends MaterialParameters {
        color?: number;
        linewidth?: number;
        linecap?: string;
        linejoin?: string;
        vertexColors?: Colors;
        fog?: boolean;
    }

    export class LineBasicMaterial extends Material {
        constructor(parameters?: LineBasicMaterialParameters);

        color: Color;
        linewidth: number;
        linecap: string;
        linejoin: string;
        vertexColors: Colors;
        fog: boolean;

        clone(): LineBasicMaterial;
    }

    export interface LineDashedMaterialParameters extends MaterialParameters {
        color?: number;
        linewidth?: number;
        scale?: number;
        dashSize?: number;
        gapSize?: number;
        vertexColors?: Colors;
        fog?: boolean;
    }

    export class LineDashedMaterial extends Material {
        constructor(parameters?: LineDashedMaterialParameters);

        color: Color;
        linewidth: number;
        scale: number;
        dashSize: number;
        gapSize: number;
        vertexColors: Colors;
        fog: boolean;

        clone(): LineDashedMaterial;
    }

    /**
     * parameters is an object with one or more properties defining the material's appearance.
     */
    export interface MeshBasicMaterialParameters extends MaterialParameters {
        color?: number;
        map?: Texture;
        lightMap?: Texture;
        specularMap?: Texture;
        alphaMap?: Texture;
        envMap?: Texture;
        combine?: Combine;
        reflectivity?: number;
        refractionRatio?: number;
        fog?: boolean;
        shading?: Shading;
        wireframe?: boolean;
        wireframeLinewidth?: number;
        wireframeLinecap?: string;
        wireframeLinejoin?: string;
        vertexColors?: Colors;
        skinning?: boolean;
        morphTargets?: boolean;
    }

    export class MeshBasicMaterial extends Material {
        constructor(parameters?: MeshBasicMaterialParameters);

        color: Color;
        map: Texture;
        lightMap: Texture;
        specularMap: Texture;
        alphaMap: Texture;
        envMap: Texture;
        combine: Combine;
        reflectivity: number;
        refractionRatio: number;
        fog: boolean;
        shading: Shading;
        wireframe: boolean;
        wireframeLinewidth: number;
        wireframeLinecap: string;
        wireframeLinejoin: string;
        vertexColors: Colors;
        skinning: boolean;
        morphTargets: boolean;

        clone(): MeshBasicMaterial;
    }

    export interface MeshDepthMaterialParameters extends MaterialParameters {
        wireframe?: boolean;
        wireframeLinewidth?: number;
    }

    export class MeshDepthMaterial extends Material {
        constructor(parameters?: MeshDepthMaterialParameters);

        wireframe: boolean;
        wireframeLinewidth: number;

        clone(): MeshDepthMaterial;
    }

    // MeshFaceMaterial does not inherit the Material class in the original code. However, it should treat as Material class.
    // See tests/canvas/canvas_materials.ts.
    export class MeshFaceMaterial extends Material {
        constructor(materials?: Material[]);
        materials: Material[];

        toJSON(): any;
        clone(): MeshFaceMaterial;
    }

    export interface MeshLambertMaterialParameters extends MaterialParameters {
        color?: number;
        emissive?: number;
        wrapAround?: boolean;
        wrapRGB?: Vector3;
        map?: Texture;
        lightMap?: Texture;
        specularMap?: Texture;
        alphaMap?: Texture;
        envMap?: Texture;
        combine?: Combine;
        reflectivity?: number;
        refractionRatio?: number;
        fog?: boolean;
        shading?: Shading;
        wireframe?: boolean;
        wireframeLinewidth?: number;
        wireframeLinecap?: string;
        wireframeLinejoin?: string;
        vertexColors?: Colors;
        skinning?: boolean;
        morphTargets?: boolean;
        morphNormals?: boolean;
    }

    export class MeshLambertMaterial extends Material {
        constructor(parameters?: MeshLambertMaterialParameters);
        color: Color;
        emissive: Color;
        wrapAround: boolean;
        wrapRGB: Vector3;
        map: Texture;
        lightMap: Texture;
        specularMap: Texture;
        alphaMap: Texture;
        envMap: Texture;
        combine: Combine;
        reflectivity: number;
        refractionRatio: number;
        fog: boolean;
        shading: Shading;
        wireframe: boolean;
        wireframeLinewidth: number;
        wireframeLinecap: string;
        wireframeLinejoin: string;
        vertexColors: Colors;
        skinning: boolean;
        morphTargets: boolean;
        morphNormals: boolean;

        clone(): MeshLambertMaterial;
    }

    export interface MeshNormalMaterialParameters extends MaterialParameters {
        wireframe?: boolean;
        wireframeLinewidth?: number;
        morphTargets?: boolean;
    }

    export class MeshNormalMaterial extends Material {
        constructor(parameters?: MeshNormalMaterialParameters);

        wireframe: boolean;
        wireframeLinewidth: number;
        morphTargets: boolean;

        clone(): MeshNormalMaterial;
    }

    export interface MeshPhongMaterialParameters extends MaterialParameters {
        color?: number; // diffuse
        emissive?: number;
        specular?: number;
        shininess?: number;
        metal?: boolean;
        wrapAround?: boolean;
        wrapRGB?: Vector3;
        map?: Texture;
        lightMap?: Texture;
        bumpMap?: Texture;
        bumpScale?: number;
        normalMap?: Texture;
        normalScale?: Vector2;
        specularMap?: Texture;
        alphaMap?: Texture;
        envMap?: Texture;
        combine?: Combine;
        reflectivity?: number;
        refractionRatio?: number;
        fog?: boolean;
        shading?: Shading;
        wireframe?: boolean;
        wireframeLinewidth?: number;
        wireframeLinecap?: string;
        wireframeLinejoin?: string;
        vertexColors?: Colors;
        skinning?: boolean;
        morphTargets?: boolean;
        morphNormals?: boolean;
    }

    export class MeshPhongMaterial extends Material {
        constructor(parameters?: MeshPhongMaterialParameters);

        color: Color; // diffuse
        emissive: Color;
        specular: Color;
        shininess: number;
        metal: boolean;
        wrapAround: boolean;
        wrapRGB: Vector3;
        map: Texture;
        lightMap: Texture;
        bumpMap: Texture;
        bumpScale: number;
        normalMap: Texture;
        normalScale: Vector2;
        specularMap: Texture;
        alphaMap: Texture;
        envMap: Texture;
        combine: Combine;
        reflectivity: number;
        refractionRatio: number;
        fog: boolean;
        shading: Shading;
        wireframe: boolean;
        wireframeLinewidth: number;
        wireframeLinecap: string;
        wireframeLinejoin: string;
        vertexColors: Colors;
        skinning: boolean;
        morphTargets: boolean;
        morphNormals: boolean;

        clone(): MeshPhongMaterial;
    }

    export interface PointCloudMaterialParameters extends MaterialParameters {
        color?: number;
        map?: Texture;
        size?: number;
        sizeAttenuation?: boolean;
        vertexColors?: Colors;
        fog?: boolean;
    }

    export class PointCloudMaterial extends Material {
        constructor(parameters?: PointCloudMaterialParameters);

        color: Color;
        map: Texture;
        size: number;
        sizeAttenuation: boolean;
        vertexColors: boolean;
        fog: boolean;

        clone(): PointCloudMaterial;
    }

    // deprecated
    export class ParticleBasicMaterial extends PointCloudMaterial {

    }

    // deprecated
    export class ParticleSystemMaterial extends PointCloudMaterial {

    }

    export class RawShaderMaterial extends ShaderMaterial {
        constructor(parameters?: ShaderMaterialParameters);

    }

    export interface ShaderMaterialParameters extends MaterialParameters {
        defines?: any;
        uniforms?: any;
        attributes?: any;
        vertexShader?: string;
        fragmentShader?: string;
        shading?: Shading;
        linewidth?: number;
        wireframe?: boolean;
        wireframeLinewidth?: number;
        fog?: boolean;
        lights?: boolean;
        vertexColors?: Colors;
        skinning?: boolean;
        morphTargets?: boolean;
        morphNormals?: boolean;
    }

    export class ShaderMaterial extends Material {
        constructor(parameters?: ShaderMaterialParameters);

        defines: any;
        uniforms: any;
        attributes: any;
        vertexShader: string;
        fragmentShader: string;
        shading: Shading;
        linewidth: number;
        wireframe: boolean;
        wireframeLinewidth: number;
        fog: boolean;
        lights: boolean;
        vertexColors: Colors;
        skinning: boolean;
        morphTargets: boolean;
        morphNormals: boolean;

        clone(): ShaderMaterial;
    }

    export interface SpriteMaterialParameters extends MaterialParameters {
        color?: number;
        map?: Texture;
        rotation?: number;
        fog?: boolean;
    }

    export class SpriteMaterial extends Material {
        constructor(parameters?: SpriteMaterialParameters);

        color: Color;
        map: Texture;
        rotation: number;
        fog: boolean;

        clone(): SpriteMaterial;
    }

    // Math //////////////////////////////////////////////////////////////////////////////////

    export class Box2 {
        constructor(min?: Vector2, max?: Vector2);

        max: Vector2;
        min: Vector2;

        set(min: Vector2, max: Vector2): Box2;
        setFromPoints(points: Vector2[]): Box2;
        setFromCenterAndSize(center: Vector2, size: Vector2): Box2;
        copy(box: Box2): Box2;
        makeEmpty(): Box2;
        empty(): boolean;
        center(optionalTarget?: Vector2): Vector2;
        size(optionalTarget?: Vector2): Vector2;
        expandByPoint(point: Vector2): Box2;
        expandByVector(vector: Vector2): Box2;
        expandByScalar(scalar: number): Box2;
        containsPoint(point: Vector2): boolean;
        containsBox(box: Box2): boolean;
        getParameter(point: Vector2): Vector2;
        isIntersectionBox(box: Box2): boolean;
        clampPoint(point: Vector2, optionalTarget?: Vector2): Vector2;
        distanceToPoint(point: Vector2): number;
        intersect(box: Box2): Box2;
        union(box: Box2): Box2;
        translate(offset: Vector2): Box2;
        equals(box: Box2): boolean;
        clone(): Box2;
    }

    export class Box3 {
        constructor(min?: Vector3, max?: Vector3);

        max: Vector3;
        min: Vector3;

        set(min: Vector3, max: Vector3): Box3;
        setFromPoints(points: Vector3[]): Box3;
        setFromCenterAndSize(center: Vector3, size: Vector3): Box3;
        setFromObject(object: Object3D): Box3;
        copy(box: Box3): Box3;
        makeEmpty(): Box3;
        empty(): boolean;
        center(optionalTarget?: Vector3): Vector3;
        size(optionalTarget?: Vector3): Vector3;
        expandByPoint(point: Vector3): Box3;
        expandByVector(vector: Vector3): Box3;
        expandByScalar(scalar: number): Box3;
        containsPoint(point: Vector3): boolean;
        containsBox(box: Box3): boolean;
        getParameter(point: Vector3): Vector3;
        isIntersectionBox(box: Box3): boolean;
        clampPoint(point: Vector3, optionalTarget?: Vector3): Vector3;
        distanceToPoint(point: Vector3): number;
        getBoundingSphere(optionalTarget?: Sphere): Sphere;
        intersect(box: Box3): Box3;
        union(box: Box3): Box3;
        applyMatrix4(matrix: Matrix4): Box3;
        translate(offset: Vector3): Box3;
        equals(box: Box3): boolean;
        clone(): Box3;
    }

    export interface HSL {
        h: number;
        s: number;
        l: number;
    }

    /**
     * Represents a color. See also {@link ColorUtils}.
     *
     * @example
     * var color = new THREE.Color( 0xff0000 );
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/math/Color.js">src/math/Color.js</a>
     */
    export class Color {
        constructor(color?: Color);
        constructor(color?: string);
        constructor(color?: number);
        constructor(r: number, g: number, b: number);

        /**
         * Red channel value between 0 and 1. Default is 1.
         */
        r: number;

        /**
         * Green channel value between 0 and 1. Default is 1.
         */
        g: number;

        /**
         * Blue channel value between 0 and 1. Default is 1.
         */
        b: number;

        set(color: Color): Color;
        set(color: number): Color;
        set(color: string): Color;
        setHex(hex: number): Color;

        /**
         * Sets this color from RGB values.
         * @param r Red channel value between 0 and 1.
         * @param g Green channel value between 0 and 1.
         * @param b Blue channel value between 0 and 1.
         */
        setRGB(r: number, g: number, b: number): Color;

        /**
         * Sets this color from HSL values.
         * Based on MochiKit implementation by Bob Ippolito.
         *
         * @param h Hue channel value between 0 and 1.
         * @param s Saturation value channel between 0 and 1.
         * @param l Value channel value between 0 and 1.
         */
        setHSL(h: number, s: number, l: number): Color;

        /**
         * Sets this color from a CSS context style string.
         * @param contextStyle Color in CSS context style format.
         */
        setStyle(style: string): Color;

        /**
         * Copies given color.
         * @param color Color to copy.
         */
        copy(color: Color): Color;

        /**
         * Copies given color making conversion from gamma to linear space.
         * @param color Color to copy.
         */
        copyGammaToLinear(color: Color, gammaFactor?: number): Color;

        /**
         * Copies given color making conversion from linear to gamma space.
         * @param color Color to copy.
         */
        copyLinearToGamma(color: Color, gammaFactor?: number): Color;

        /**
         * Converts this color from gamma to linear space.
         */
        convertGammaToLinear(): Color;

        /**
         * Converts this color from linear to gamma space.
         */
        convertLinearToGamma(): Color;

        /**
         * Returns the hexadecimal value of this color.
         */
        getHex(): number;

        /**
         * Returns the string formated hexadecimal value of this color.
         */
        getHexString(): string;

        getHSL(): HSL;

        /**
         * Returns the value of this color in CSS context style.
         * Example: rgb(r, g, b)
         */
        getStyle(): string;

        offsetHSL(h: number, s: number, l: number): Color;

        add(color: Color): Color;
        addColors(color1: Color, color2: Color): Color;
        addScalar(s: number): Color;
        multiply(color: Color): Color;
        multiplyScalar(s: number): Color;
        lerp(color: Color, alpha: number): Color;
        equals(color: Color): boolean;
        fromArray(rgb: number[]): Color;
        toArray(array?: number[], offset?: number): number[];

        /**
         * Clones this color.
         */
        clone(): Color;
    }

    export class ColorKeywords {
        static aliceblue: number;
        static antiquewhite: number;
        static aqua: number;
        static aquamarine: number;
        static azure: number;
        static beige: number;
        static bisque: number;
        static black: number;
        static blanchedalmond: number;
        static blue: number;
        static blueviolet: number;
        static brown: number;
        static burlywood: number;
        static cadetblue: number;
        static chartreuse: number;
        static chocolate: number;
        static coral: number;
        static cornflowerblue: number;
        static cornsilk: number;
        static crimson: number;
        static cyan: number;
        static darkblue: number;
        static darkcyan: number;
        static darkgoldenrod: number;
        static darkgray: number;
        static darkgreen: number;
        static darkgrey: number;
        static darkkhaki: number;
        static darkmagenta: number;
        static darkolivegreen: number;
        static darkorange: number;
        static darkorchid: number;
        static darkred: number;
        static darksalmon: number;
        static darkseagreen: number;
        static darkslateblue: number;
        static darkslategray: number;
        static darkslategrey: number;
        static darkturquoise: number;
        static darkviolet: number;
        static deeppink: number;
        static deepskyblue: number;
        static dimgray: number;
        static dimgrey: number;
        static dodgerblue: number;
        static firebrick: number;
        static floralwhite: number;
        static forestgreen: number;
        static fuchsia: number;
        static gainsboro: number;
        static ghostwhite: number;
        static gold: number;
        static goldenrod: number;
        static gray: number;
        static green: number;
        static greenyellow: number;
        static grey: number;
        static honeydew: number;
        static hotpink: number;
        static indianred: number;
        static indigo: number;
        static ivory: number;
        static khaki: number;
        static lavender: number;
        static lavenderblush: number;
        static lawngreen: number;
        static lemonchiffon: number;
        static lightblue: number;
        static lightcoral: number;
        static lightcyan: number;
        static lightgoldenrodyellow: number;
        static lightgray: number;
        static lightgreen: number;
        static lightgrey: number;
        static lightpink: number;
        static lightsalmon: number;
        static lightseagreen: number;
        static lightskyblue: number;
        static lightslategray: number;
        static lightslategrey: number;
        static lightsteelblue: number;
        static lightyellow: number;
        static lime: number;
        static limegreen: number;
        static linen: number;
        static magenta: number;
        static maroon: number;
        static mediumaquamarine: number;
        static mediumblue: number;
        static mediumorchid: number;
        static mediumpurple: number;
        static mediumseagreen: number;
        static mediumslateblue: number;
        static mediumspringgreen: number;
        static mediumturquoise: number;
        static mediumvioletred: number;
        static midnightblue: number;
        static mintcream: number;
        static mistyrose: number;
        static moccasin: number;
        static navajowhite: number;
        static navy: number;
        static oldlace: number;
        static olive: number;
        static olivedrab: number;
        static orange: number;
        static orangered: number;
        static orchid: number;
        static palegoldenrod: number;
        static palegreen: number;
        static paleturquoise: number;
        static palevioletred: number;
        static papayawhip: number;
        static peachpuff: number;
        static peru: number;
        static pink: number;
        static plum: number;
        static powderblue: number;
        static purple: number;
        static red: number;
        static rosybrown: number;
        static royalblue: number;
        static saddlebrown: number;
        static salmon: number;
        static sandybrown: number;
        static seagreen: number;
        static seashell: number;
        static sienna: number;
        static silver: number;
        static skyblue: number;
        static slateblue: number;
        static slategray: number;
        static slategrey: number;
        static snow: number;
        static springgreen: number;
        static steelblue: number;
        static tan: number;
        static teal: number;
        static thistle: number;
        static tomato: number;
        static turquoise: number;
        static violet: number;
        static wheat: number;
        static white: number;
        static whitesmoke: number;
        static yellow: number;
        static yellowgreen: number;
    }

    export class Euler {
        constructor(x?: number, y?: number, z?: number, order?: string);

        x: number;
        y: number;
        z: number;
        order: string;

        set(x: number, y: number, z: number, order?: string): Euler;
        copy(euler: Euler): Euler;
        setFromRotationMatrix(m: Matrix4, order?: string, update?: boolean): Euler;
        setFromQuaternion(q: Quaternion, order?: string, update?: boolean): Euler;
        setFromVector3(v: Vector3, order?: string): Euler;
        reorder(newOrder: string): Euler;
        equals(euler: Euler): boolean;
        fromArray(xyzo: any[]): Euler;
        toArray(array?: number[], offset?: number): number[];
        toVector3(optionalResult?: Vector3): Vector3;
        onChange: () => void;

        clone(): Euler;
    }

    /**
     * Frustums are used to determine what is inside the camera's field of view. They help speed up the rendering process.
     */
    export class Frustum {
        constructor(p0?: Plane, p1?: Plane, p2?: Plane, p3?: Plane, p4?: Plane, p5?: Plane);

        /**
         * Array of 6 vectors.
         */
        planes: Plane[];

        set(p0?: number, p1?: number, p2?: number, p3?: number, p4?: number, p5?: number): Frustum;
        copy(frustum: Frustum): Frustum;
        setFromMatrix(m: Matrix4): Frustum;
        intersectsObject(object: Object3D): boolean;
        intersectsSphere(sphere: Sphere): boolean;
        intersectsBox(box: Box3): boolean;
        containsPoint(point: Vector3): boolean;
        clone(): Frustum;

    }

    export class Line3 {
        constructor(start?: Vector3, end?: Vector3);
        start: Vector3;
        end: Vector3;

        set(start?: Vector3, end?: Vector3): Line3;
        copy(line: Line3): Line3;
        center(optionalTarget?: Vector3): Vector3;
        delta(optionalTarget?: Vector3): Vector3;
        distanceSq(): number;
        distance(): number;
        at(t: number, optionalTarget?: Vector3): Vector3;
        closestPointToPointParameter(point: Vector3, clampToLine?: boolean): number;
        closestPointToPoint(point: Vector3, clampToLine?: boolean, optionalTarget?: Vector3): Vector3;
        applyMatrix4(matrix: Matrix4): Line3;
        equals(line: Line3): boolean;
        clone(): Line3;
    }

    interface Math {
        generateUUID(): string;

        /**
         * Clamps the x to be between a and b.
         *
         * @param x Value to be clamped.
         * @param a Minimum value
         * @param b Maximum value.
         */
        clamp(x: number, a: number, b: number): number;

        /**
         * Clamps the x to be larger than a.
         *
         * @param x — Value to be clamped.
         * @param a — Minimum value
         */
        clampBottom(x: number, a: number): number;

        /**
         * Linear mapping of x from range [a1, a2] to range [b1, b2].
         *
         * @param x Value to be mapped.
         * @param a1 Minimum value for range A.
         * @param a2 Maximum value for range A.
         * @param b1 Minimum value for range B.
         * @param b2 Maximum value for range B.
         */
        mapLinear(x: number, a1: number, a2: number, b1: number, b2: number): number;

        smoothstep(x: number, min: number, max: number): number;

        smootherstep(x: number, min: number, max: number): number;

        /**
         * Random float from 0 to 1 with 16 bits of randomness.
         * Standard Math.random() creates repetitive patterns when applied over larger space.
         */
        random16(): number;

        /**
         * Random integer from low to high interval.
         */
        randInt(low: number, high: number): number;

        /**
         * Random float from low to high interval.
         */
        randFloat(low: number, high: number): number;

        /**
         * Random float from - range / 2 to range / 2 interval.
         */
        randFloatSpread(range: number): number;

        degToRad(degrees: number): number;

        radToDeg(radians: number): number;

        isPowerOfTwo(value: number): boolean;

        nextPowerOfTwo(value: number): number;
    }

    /**
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/math/Math.js">src/math/Math.js</a>
     */
    export var Math: Math;

    /**
     * ( interface Matrix&lt;T&gt; )
     */
    export interface Matrix {
        /**
         * Float32Array with matrix values.
         */
        elements: Float32Array;

        /**
         * identity():T;
         */
        identity(): Matrix;

        /**
         * copy(m:T):T;
         */
        copy(m: Matrix): Matrix;

        /**
         * multiplyScalar(s:number):T;
         */
        multiplyScalar(s: number): Matrix;

        determinant(): number;

        /**
         * getInverse(matrix:T, throwOnInvertible?:boolean):T;
         */
        getInverse(matrix: Matrix, throwOnInvertible?: boolean): Matrix;

        /**
         * transpose():T;
         */
        transpose(): Matrix;

        /**
         * clone():T;
         */
        clone(): Matrix;
    }

    /**
     * ( class Matrix3 implements Matrix&lt;Matrix3&gt; )
     */
    export class Matrix3 implements Matrix {
        /**
         * Creates an identity matrix.
         */
        constructor();

        /**
         * Initialises the matrix with the supplied n11..n33 values.
         */
        constructor(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number);

        /**
         * Float32Array with matrix values.
         */
        elements: Float32Array;

        set(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number): Matrix3;
        identity(): Matrix3;
        copy(m: Matrix3): Matrix3;
        applyToVector3Array(array: number[], offset?: number, length?: number): number[];
        multiplyScalar(s: number): Matrix3;
        determinant(): number;
        getInverse(matrix: Matrix3, throwOnInvertible?: boolean): Matrix3;
        getInverse(matrix: Matrix4, throwOnInvertible?: boolean): Matrix3;

        /**
         * Transposes this matrix in place.
         */
        transpose(): Matrix3;
        flattenToArrayOffset(array: number[], offset: number): number[];
        getNormalMatrix(m: Matrix4): Matrix3;

        /**
         * Transposes this matrix into the supplied array r, and returns itself.
         */
        transposeIntoArray(r: number[]): number[];
        fromArray(array: number[]): Matrix3;
        toArray(): number[];
        clone(): Matrix3;
    }

    /**
     * A 4x4 Matrix.
     *
     * @example
     * // Simple rig for rotating around 3 axes
     * var m = new THREE.Matrix4();
     * var m1 = new THREE.Matrix4();
     * var m2 = new THREE.Matrix4();
     * var m3 = new THREE.Matrix4();
     * var alpha = 0;
     * var beta = Math.PI;
     * var gamma = Math.PI/2;
     * m1.makeRotationX( alpha );
     * m2.makeRotationY( beta );
     * m3.makeRotationZ( gamma );
     * m.multiplyMatrices( m1, m2 );
     * m.multiply( m3 );
     */
    export class Matrix4 implements Matrix {
        /**
         * Initialises the matrix with the supplied n11..n44 values.
         */
        constructor(n11?: number, n12?: number, n13?: number, n14?: number, n21?: number, n22?: number, n23?: number, n24?: number, n31?: number, n32?: number, n33?: number, n34?: number, n41?: number, n42?: number, n43?: number, n44?: number);

        /**
         * Float32Array with matrix values.
         */
        elements: Float32Array;

        /**
         * Sets all fields of this matrix.
         */
        set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): Matrix4;

        /**
         * Resets this matrix to identity.
         */
        identity(): Matrix4;

        /**
         * Copies a matrix m into this matrix.
         */
        copy(m: Matrix4): Matrix4;
        copyPosition(m: Matrix4): Matrix4;

        extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): Matrix4;
        makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): Matrix4;

        /**
         * Copies the rotation component of the supplied matrix m into this matrix rotation component.
         */
        extractRotation(m: Matrix4): Matrix4;
        makeRotationFromEuler(euler: Euler): Matrix4;
        makeRotationFromQuaternion(q: Quaternion): Matrix4;
        /**
         * Constructs a rotation matrix, looking from eye towards center with defined up vector.
         */
        lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4;

        /**
         * Multiplies this matrix by m.
         */
        multiply(m: Matrix4): Matrix4;

        /**
         * Sets this matrix to a x b.
         */
        multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4;

        /**
         * Sets this matrix to a x b and stores the result into the flat array r.
         * r can be either a regular Array or a TypedArray.
         */
        multiplyToArray(a: Matrix4, b: Matrix4, r: number[]): Matrix4;

        /**
         * Multiplies this matrix by s.
         */
        multiplyScalar(s: number): Matrix4;
        applyToVector3Array(array: number[], offset?: number, length?: number): number[];

        /**
         * Computes determinant of this matrix.
         * Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
         */
        determinant(): number;

        /**
         * Transposes this matrix.
         */
        transpose(): Matrix4;

        /**
         * Flattens this matrix into supplied flat array starting from offset position in the array.
         */
        flattenToArrayOffset(array: number[], offset: number): number[];

        /**
         * Sets the position component for this matrix from vector v.
         */
        setPosition(v: Vector3): Vector3;

        /**
         * Sets this matrix to the inverse of matrix m.
         * Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm.
         */
        getInverse(m: Matrix4, throwOnInvertible?: boolean): Matrix4;

        /**
         * Multiplies the columns of this matrix by vector v.
         */
        scale(v: Vector3): Matrix4;

        getMaxScaleOnAxis(): number;
        /**
         * Sets this matrix as translation transform.
         */
        makeTranslation(x: number, y: number, z: number): Matrix4;

        /**
         * Sets this matrix as rotation transform around x axis by theta radians.
         *
         * @param theta Rotation angle in radians.
         */
        makeRotationX(theta: number): Matrix4;

        /**
         * Sets this matrix as rotation transform around y axis by theta radians.
         *
         * @param theta Rotation angle in radians.
         */
        makeRotationY(theta: number): Matrix4;

        /**
         * Sets this matrix as rotation transform around z axis by theta radians.
         *
         * @param theta Rotation angle in radians.
         */
        makeRotationZ(theta: number): Matrix4;

        /**
         * Sets this matrix as rotation transform around axis by angle radians.
         * Based on http://www.gamedev.net/reference/articles/article1199.asp.
         *
         * @param axis Rotation axis.
         * @param theta Rotation angle in radians.
         */
        makeRotationAxis(axis: Vector3, angle: number): Matrix4;

        /**
         * Sets this matrix as scale transform.
         */
        makeScale(x: number, y: number, z: number): Matrix4;

        /**
         * Sets this matrix to the transformation composed of translation, rotation and scale.
         */
        compose(translation: Vector3, rotation: Quaternion, scale: Vector3): Matrix4;

        /**
         * Decomposes this matrix into the translation, rotation and scale components.
         * If parameters are not passed, new instances will be created.
         */
        decompose(translation?: Vector3, rotation?: Quaternion, scale?: Vector3): Object[]; // [Vector3, Quaternion, Vector3]

        /**
         * Creates a frustum matrix.
         */
        makeFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;

        /**
         * Creates a perspective projection matrix.
         */
        makePerspective(fov: number, aspect: number, near: number, far: number): Matrix4;

        /**
         * Creates an orthographic projection matrix.
         */
        makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): Matrix4;
        fromArray(array: number[]): Matrix4;
        toArray(): number[];
        /**
         * Clones this matrix.
         */
        clone(): Matrix4;
    }

    export class Plane {
        constructor(normal?: Vector3, constant?: number);

        normal: Vector3;
        constant: number;

        set(normal: Vector3, constant: number): Plane;
        setComponents(x: number, y: number, z: number, w: number): Plane;
        setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): Plane;
        setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): Plane;
        copy(plane: Plane): Plane;
        normalize(): Plane;
        negate(): Plane;
        distanceToPoint(point: Vector3): number;
        distanceToSphere(sphere: Sphere): number;
        projectPoint(point: Vector3, optionalTarget?: Vector3): Vector3;
        orthoPoint(point: Vector3, optionalTarget?: Vector3): Vector3;
        isIntersectionLine(line: Line3): boolean;
        intersectLine(line: Line3, optionalTarget?: Vector3): Vector3;
        coplanarPoint(optionalTarget?: boolean): Vector3;
        applyMatrix4(matrix: Matrix4, optionalNormalMatrix?: Matrix3): Plane;
        translate(offset: Vector3): Plane;
        equals(plane: Plane): boolean;
        clone(): Plane;
    }

    /**
     * Implementation of a quaternion. This is used for rotating things without incurring in the dreaded gimbal lock issue, amongst other advantages.
     *
     * @example
     * var quaternion = new THREE.Quaternion();
     * quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
     * var vector = new THREE.Vector3( 1, 0, 0 );
     * vector.applyQuaternion( quaternion );
     */
    export class Quaternion {
        /**
         * @param x x coordinate
         * @param y y coordinate
         * @param z z coordinate
         * @param w w coordinate
         */
        constructor(x?: number, y?: number, z?: number, w?: number);

        x: number;
        y: number;
        z: number;
        w: number;

        /**
         * Sets values of this quaternion.
         */
        set(x: number, y: number, z: number, w: number): Quaternion;

        /**
         * Copies values of q to this quaternion.
         */
        copy(q: Quaternion): Quaternion;

        /**
         * Sets this quaternion from rotation specified by Euler angles.
         */
        setFromEuler(euler: Euler, update?: boolean): Quaternion;

        /**
         * Sets this quaternion from rotation specified by axis and angle.
         * Adapted from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm.
         * Axis have to be normalized, angle is in radians.
         */
        setFromAxisAngle(axis: Vector3, angle: number): Quaternion;

        /**
         * Sets this quaternion from rotation component of m. Adapted from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm.
         */
        setFromRotationMatrix(m: Matrix4): Quaternion;
        setFromUnitVectors(vFrom: Vector3, vTo: Vector3): Quaternion;
        /**
         * Inverts this quaternion.
         */
        inverse(): Quaternion;

        conjugate(): Quaternion;
        dot(v: Vector3): number;
        lengthSq(): number;

        /**
         * Computes length of this quaternion.
         */
        length(): number;

        /**
         * Normalizes this quaternion.
         */
        normalize(): Quaternion;

        /**
         * Multiplies this quaternion by b.
         */
        multiply(q: Quaternion): Quaternion;

        /**
         * Sets this quaternion to a x b
         * Adapted from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm.
         */
        multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion;

        /** 
          * Deprecated. Use Vector3.applyQuaternion instead 
          */
        multiplyVector3(vector: Vector3): Vector3;
        slerp(qb: Quaternion, t: number): Quaternion;
        equals(v: Quaternion): boolean;
        fromArray(n: number[]): Quaternion;
        toArray(): number[];

        fromArray(xyzw: number[], offset?: number): Quaternion;
        toArray(xyzw?: number[], offset?: number): number[];

        onChange: () => void;

        /**
         * Clones this quaternion.
         */
        clone(): Quaternion;

        /**
         * Adapted from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/.
         */
        static slerp(qa: Quaternion, qb: Quaternion, qm: Quaternion, t: number): Quaternion;
    }

    export class Ray {
        constructor(origin?: Vector3, direction?: Vector3);

        origin: Vector3;
        direction: Vector3;

        set(origin: Vector3, direction: Vector3): Ray;
        copy(ray: Ray): Ray;
        at(t: number, optionalTarget?: Vector3): Vector3;
        recast(t: number): Ray;
        closestPointToPoint(point: Vector3, optionalTarget?: Vector3): Vector3;
        distanceToPoint(point: Vector3): number;
        distanceSqToSegment(v0: Vector3, v1: Vector3, optionalPointOnRay?: Vector3, optionalPointOnSegment?: Vector3): number;
        isIntersectionSphere(sphere: Sphere): boolean;
        intersectSphere(sphere: Sphere, optionalTarget?: Vector3): Vector3;
        isIntersectionPlane(plane: Plane): boolean;
        distanceToPlane(plane: Plane): number;
        intersectPlane(plane: Plane, optionalTarget?: Vector3): Vector3;
        isIntersectionBox(box: Box3): boolean;
        intersectBox(box: Box3, optionalTarget?: Vector3): Vector3;
        intersectTriangle(a: Vector3, b: Vector3, c: Vector3, backfaceCulling: boolean, optionalTarget?: Vector3): Vector3;
        applyMatrix4(matrix4: Matrix4): Ray;
        equals(ray: Ray): boolean;
        clone(): Ray;
    }

    export class Sphere {
        constructor(center?: Vector3, radius?: number);

        center: Vector3;
        radius: number;

        set(center: Vector3, radius: number): Sphere;
        setFromPoints(points: Vector3[], optionalCenter?: Vector3): Sphere;
        copy(sphere: Sphere): Sphere;
        empty(): boolean;
        containsPoint(point: Vector3): boolean;
        distanceToPoint(point: Vector3): number;
        intersectsSphere(sphere: Sphere): boolean;
        clampPoint(point: Vector3, optionalTarget?: Vector3): Vector3;
        getBoundingBox(optionalTarget?: Box3): Box3;
        applyMatrix4(matrix: Matrix4): Sphere;
        translate(offset: Vector3): Sphere;
        equals(sphere: Sphere): boolean;

        clone(): Sphere;
    }

    export interface SplineControlPoint {
        x: number;
        y: number;
        z: number;
    }

    /**
     * Represents a spline.
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/math/Spline.js">src/math/Spline.js</a>
     */
    export class Spline {
        /**
         * Initialises the spline with points, which are the places through which the spline will go.
         */
        constructor(points: SplineControlPoint[]);

        points: SplineControlPoint[];

        /**
         * Initialises using the data in the array as a series of points. Each value in a must be another array with three values, where a[n] is v, the value for the nth point, and v[0], v[1] and v[2] are the x, y and z coordinates of that point n, respectively.
         *
         * @param a array of triplets containing x, y, z coordinates
         */
        initFromArray(a: number[][]): void;

        /**
         * Return the interpolated point at k.
         *
         * @param k point index
         */
        getPoint(k: number): SplineControlPoint;

        /**
         * Returns an array with triplets of x, y, z coordinates that correspond to the current control points.
         */
        getControlPointsArray(): number[][];

        /**
         * Returns the length of the spline when using nSubDivisions.
         * @param nSubDivisions number of subdivisions between control points. Default is 100.
         */
        getLength(nSubDivisions?: number): { chunks: number[]; total: number; };

        /**
         * Modifies the spline so that it looks similar to the original but has its points distributed in such way that moving along the spline it's done at a more or less constant speed. The points should also appear more uniformly spread along the curve.
         * This is done by resampling the original spline, with the density of sampling controlled by samplingCoef. Here it's interesting to note that denser sampling is not necessarily better: if sampling is too high, you may get weird kinks in curvature.
         *
         * @param samplingCoef how many intermediate values to use between spline points
         */
        reparametrizeByArcLength(samplingCoef: number): void;
    }

    class Triangle {
        constructor(a?: Vector3, b?: Vector3, c?: Vector3);

        a: Vector3;
        b: Vector3;
        c: Vector3;

        set(a: Vector3, b: Vector3, c: Vector3): Triangle;
        setFromPointsAndIndices(points: Vector3[], i0: number, i1: number, i2: number): Triangle;
        copy(triangle: Triangle): Triangle;
        area(): number;
        midpoint(optionalTarget?: Vector3): Vector3;
        normal(optionalTarget?: Vector3): Vector3;
        plane(optionalTarget?: Vector3): Plane;
        barycoordFromPoint(point: Vector3, optionalTarget?: Vector3): Vector3;
        containsPoint(point: Vector3): boolean;
        equals(triangle: Triangle): boolean;
        clone(): Triangle;

        static normal(a: Vector3, b: Vector3, c: Vector3, optionalTarget?: Vector3): Vector3;
        static barycoordFromPoint(point: Vector3, a: Vector3, b: Vector3, c: Vector3, optionalTarget: Vector3): Vector3;
        static containsPoint(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean;
    }


    /**
     * ( interface Vector&lt;T&gt; )
     *
     * Abstruct interface of Vector2, Vector3 and Vector4.
     * Currently the members of Vector is NOT type safe because it accepts different typed vectors.
     * Those definitions will be changed when TypeScript innovates Generics to be type safe.
     *
     * @example
     * var v:THREE.Vector = new THREE.Vector3();
     * v.addVectors(new THREE.Vector2(0, 1), new THREE.Vector2(2, 3));    // invalid but compiled successfully
     */
    export interface Vector {
        setComponent(index: number, value: number): void;

        getComponent(index: number): number;

        /**
         * copy(v:T):T;
         */
        copy(v: Vector): Vector;

        /**
         * add(v:T):T;
         */
        add(v: Vector): Vector;

        /**
         * addVectors(a:T, b:T):T;
         */
        addVectors(a: Vector, b: Vector): Vector;

        /**
         * sub(v:T):T;
         */
        sub(v: Vector): Vector;

        /**
         * subVectors(a:T, b:T):T;
         */
        subVectors(a: Vector, b: Vector): Vector;

        /**
         * multiplyScalar(s:number):T;
         */
        multiplyScalar(s: number): Vector;

        /**
         * divideScalar(s:number):T;
         */
        divideScalar(s: number): Vector;

        /**
         * negate():T;
         */
        negate(): Vector;

        /**
         * dot(v:T):T;
         */
        dot(v: Vector): number;

        /**
         * lengthSq():number;
         */
        lengthSq(): number;

        /**
         * length():number;
         */
        length(): number;

        /**
         * normalize():T;
         */
        normalize(): Vector;

        /**
         * NOTE: Vector4 doesn't have the property.
         *
         * distanceTo(v:T):number;
         */
        distanceTo?(v: Vector): number;

        /**
         * NOTE: Vector4 doesn't have the property.
         *
         * distanceToSquared(v:T):number;
         */
        distanceToSquared?(v: Vector): number;

        /**
         * setLength(l:number):T;
         */
        setLength(l: number): Vector;

        /**
         * lerp(v:T, alpha:number):T;
         */
        lerp(v: Vector, alpha: number): Vector;

        /**
         * equals(v:T):boolean;
         */
        equals(v: Vector): boolean;

        /**
         * clone():T;
         */
        clone(): Vector;
    }

    /**
     * 2D vector.
     *
     * ( class Vector2 implements Vector<Vector2> )
     */
    export class Vector2 implements Vector {
        constructor(x?: number, y?: number);

        x: number;
        y: number;

        /**
         * Sets value of this vector.
         */
        set(x: number, y: number): Vector2;

        /**
         * Sets X component of this vector.
         */
        setX(x: number): Vector2;

        /**
         * Sets Y component of this vector.
         */
        setY(y: number): Vector2;

        /**
         * Sets a component of this vector.
         */
        setComponent(index: number, value: number): void;

        /**
         * Gets a component of this vector.
         */
        getComponent(index: number): number;

        /**
         * Copies value of v to this vector.
         */
        copy(v: Vector2): Vector2;

        /**
         * Adds v to this vector.
         */
        add(v: Vector2): Vector2;

        /**
         * Sets this vector to a + b.
         */
        addScalar(s: number): Vector2;
        addVectors(a: Vector2, b: Vector2): Vector2;

        /**
         * Subtracts v from this vector.
         */
        sub(v: Vector2): Vector2;

        /**
         * Sets this vector to a - b.
         */
        subVectors(a: Vector2, b: Vector2): Vector2;

        multiply(v: Vector2): Vector2;
        /**
         * Multiplies this vector by scalar s.
         */
        multiplyScalar(s: number): Vector2;

        divide(v: Vector2): Vector2;
        /**
         * Divides this vector by scalar s.
         * Set vector to ( 0, 0 ) if s == 0.
         */
        divideScalar(s: number): Vector2;

        min(v: Vector2): Vector2;

        max(v: Vector2): Vector2;
        clamp(min: Vector2, max: Vector2): Vector2;
        clampScalar(min: number, max: number): Vector2;
        floor(): Vector2;
        ceil(): Vector2;
        round(): Vector2;
        roundToZero(): Vector2;

        /**
         * Inverts this vector.
         */
        negate(): Vector2;

        /**
         * Computes dot product of this vector and v.
         */
        dot(v: Vector2): number;

        /**
         * Computes squared length of this vector.
         */
        lengthSq(): number;

        /**
         * Computes length of this vector.
         */
        length(): number;

        /**
         * Normalizes this vector.
         */
        normalize(): Vector2;

        /**
         * Computes distance of this vector to v.
         */
        distanceTo(v: Vector2): number;

        /**
         * Computes squared distance of this vector to v.
         */
        distanceToSquared(v: Vector2): number;

        /**
         * Normalizes this vector and multiplies it by l.
         */
        setLength(l: number): Vector2;

        lerp(v: Vector2, alpha: number): Vector2;

        lerpVectors(v1: Vector2, v2: Vector2, alpha: number): Vector2;

        /**
         * Checks for strict equality of this vector and v.
         */
        equals(v: Vector2): boolean;

        fromArray(xy: number[], offset?: number): Vector2;

        toArray(xy?: number[], offset?: number): number[];

        fromAttribute(attribute: BufferAttribute, index: number, offset?: number): Vector2;

        /**
         * Clones this vector.
         */
        clone(): Vector2;
    }

    /**
     * 3D vector.
     *
     * @example
     * var a = new THREE.Vector3( 1, 0, 0 );
     * var b = new THREE.Vector3( 0, 1, 0 );
     * var c = new THREE.Vector3();
     * c.crossVectors( a, b );
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js">src/math/Vector3.js</a>
     *
     * ( class Vector3 implements Vector<Vector3> )
     */
    export class Vector3 implements Vector {

        constructor(x?: number, y?: number, z?: number);

        x: number;
        y: number;
        z: number;

        /**
         * Sets value of this vector.
         */
        set(x: number, y: number, z: number): Vector3;

        /**
         * Sets x value of this vector.
         */
        setX(x: number): Vector3;

        /**
         * Sets y value of this vector.
         */
        setY(y: number): Vector3;

        /**
         * Sets z value of this vector.
         */
        setZ(z: number): Vector3;

        setComponent(index: number, value: number): void;
        getComponent(index: number): number;

        /**
         * Copies value of v to this vector.
         */
        copy(v: Vector3): Vector3;

        /**
         * Adds v to this vector.
         */
        add(a: Vector3): Vector3;
        addScalar(s: number): Vector3;

        /**
         * Sets this vector to a + b.
         */
        addVectors(a: Vector3, b: Vector3): Vector3;

        /**
         * Subtracts v from this vector.
         */
        sub(a: Vector3): Vector3;

        subScalar(s: number): Vector3;

        /**
         * Sets this vector to a - b.
         */
        subVectors(a: Vector3, b: Vector3): Vector3;

        multiply(v: Vector3): Vector3;
        /**
         * Multiplies this vector by scalar s.
         */
        multiplyScalar(s: number): Vector3;
        multiplyVectors(a: Vector3, b: Vector3): Vector3;
        applyEuler(euler: Euler): Vector3;
        applyAxisAngle(axis: Vector3, angle: number): Vector3;
        applyMatrix3(m: Matrix3): Vector3;
        applyMatrix4(m: Matrix4): Vector3;
        applyProjection(m: Matrix4): Vector3;
        applyQuaternion(q: Quaternion): Vector3;
        project(camrea: Camera): Vector3;
        unproject(camera: Camera): Vector3;
        transformDirection(m: Matrix4): Vector3;
        divide(v: Vector3): Vector3;

        /**
         * Divides this vector by scalar s.
         * Set vector to ( 0, 0, 0 ) if s == 0.
         */
        divideScalar(s: number): Vector3;
        min(v: Vector3): Vector3;
        max(v: Vector3): Vector3;
        clamp(min: Vector3, max: Vector3): Vector3;
        clampScalar(min: number, max: number): Vector3;
        floor(): Vector3;
        ceil(): Vector3;
        round(): Vector3;
        roundToZero(): Vector3;

        /**
         * Inverts this vector.
         */
        negate(): Vector3;

        /**
         * Computes dot product of this vector and v.
         */
        dot(v: Vector3): number;

        /**
         * Computes squared length of this vector.
         */
        lengthSq(): number;

        /**
         * Computes length of this vector.
         */
        length(): number;

        /**
         * Computes Manhattan length of this vector.
         * http://en.wikipedia.org/wiki/Taxicab_geometry
         */
        lengthManhattan(): number;

        /**
         * Normalizes this vector.
         */
        normalize(): Vector3;

        /**
         * Normalizes this vector and multiplies it by l.
         */
        setLength(l: number): Vector3;
        lerp(v: Vector3, alpha: number): Vector3;

        lerpVectors(v1: Vector3, v2: Vector3, alpha: number): Vector3;

        /**
         * Sets this vector to cross product of itself and v.
         */
        cross(a: Vector3): Vector3;

        /**
         * Sets this vector to cross product of a and b.
         */
        crossVectors(a: Vector3, b: Vector3): Vector3;
        projectOnVector(v: Vector3): Vector3;
        projectOnPlane(planeNormal: Vector3): Vector3;
        reflect(vector: Vector3): Vector3;
        angleTo(v: Vector3): number;

        /**
         * Computes distance of this vector to v.
         */
        distanceTo(v: Vector3): number;

        /**
         * Computes squared distance of this vector to v.
         */
        distanceToSquared(v: Vector3): number;

        setFromMatrixPosition(m: Matrix4): Vector3;
        setFromMatrixScale(m: Matrix4): Vector3;
        setFromMatrixColumn(index: number, matrix: Matrix4): Vector3;

        /**
         * Checks for strict equality of this vector and v.
         */
        equals(v: Vector3): boolean;

        fromArray(xyz: number[], offset?: number): Vector3;

        toArray(xyz?: number[], offset?: number): number[];

        fromAttribute(attribute: BufferAttribute, index: number, offset?: number): Vector3;

        /**
         * Clones this vector.
         */
        clone(): Vector3;
    }

    /**
     * 4D vector.
     *
     * ( class Vector4 implements Vector<Vector4> )
     */
    export class Vector4 implements Vector {
        constructor(x?: number, y?: number, z?: number, w?: number);
        x: number;
        y: number;
        z: number;
        w: number;

        /**
         * Sets value of this vector.
         */
        set(x: number, y: number, z: number, w: number): Vector4;

        /**
         * Sets X component of this vector.
         */
        setX(x: number): Vector4;

        /**
         * Sets Y component of this vector.
         */
        setY(y: number): Vector4;

        /**
         * Sets Z component of this vector.
         */
        setZ(z: number): Vector4;

        /**
         * Sets w component of this vector.
         */
        setW(w: number): Vector4;

        setComponent(index: number, value: number): void;
        getComponent(index: number): number;

        /**
         * Copies value of v to this vector.
         */
        copy(v: Vector4): Vector4;

        /**
         * Adds v to this vector.
         */
        add(v: Vector4): Vector4;
        addScalar(s: number): Vector4;

        /**
         * Sets this vector to a + b.
         */
        addVectors(a: Vector4, b: Vector4): Vector4;

        /**
         * Subtracts v from this vector.
         */
        sub(v: Vector4): Vector4;

        subScalar(s: number): Vector4;

        /**
         * Sets this vector to a - b.
         */
        subVectors(a: Vector4, b: Vector4): Vector4;

        /**
         * Multiplies this vector by scalar s.
         */
        multiplyScalar(s: number): Vector4;
        applyMatrix4(m: Matrix4): Vector4;

        /**
         * Divides this vector by scalar s.
         * Set vector to ( 0, 0, 0 ) if s == 0.
         */
        divideScalar(s: number): Vector4;

        /**
         * http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
         * @param q is assumed to be normalized
         */
        setAxisAngleFromQuaternion(q: Quaternion): Vector4;

        /**
         * http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm
         * @param m assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
         */
        setAxisAngleFromRotationMatrix(m: Matrix3): Vector4;

        min(v: Vector4): Vector4;
        max(v: Vector4): Vector4;
        clamp(min: Vector4, max: Vector4): Vector4;
        clampScalar(min: number, max: number): Vector4;
        floor(): Vector4;
        ceil(): Vector4;
        round(): Vector4;
        roundToZero(): Vector4;

        /**
         * Inverts this vector.
         */
        negate(): Vector4;

        /**
         * Computes dot product of this vector and v.
         */
        dot(v: Vector4): number;

        /**
         * Computes squared length of this vector.
         */
        lengthSq(): number;

        /**
         * Computes length of this vector.
         */
        length(): number;
        lengthManhattan(): number;

        /**
         * Normalizes this vector.
         */
        normalize(): Vector4;
        /**
         * Normalizes this vector and multiplies it by l.
         */
        setLength(l: number): Vector4;

        /**
         * Linearly interpolate between this vector and v with alpha factor.
         */
        lerp(v: Vector4, alpha: number): Vector4;

        lerpVectors(v1: Vector4, v2: Vector4, alpha: number): Vector4;

        /**
         * Checks for strict equality of this vector and v.
         */
        equals(v: Vector4): boolean;

        fromArray(xyzw: number[], offset?: number): Vector4;

        toArray(xyzw?: number[], offset?: number): number[];

        fromAttribute(attribute: BufferAttribute, index: number, offset?: number): Vector4;

        /**
         * Clones this vector.
         */
        clone(): Vector4;
    }

    // Objects //////////////////////////////////////////////////////////////////////////////////

    export class Bone extends Object3D {
        constructor(skin: SkinnedMesh);

        skin: SkinnedMesh;
    }

    export class Group extends Object3D {
        constructor();
    }

    export interface LensFlareProperty {
        texture: Texture;             // Texture
        size: number;             // size in pixels (-1 = use texture.width)
        distance: number;             // distance (0-1) from light source (0=at light source)
        x: number;
        y: number;
        z: number;            // screen position (-1 =>  1) z = 0 is ontop z = 1 is back
        scale: number;             // scale
        rotation: number;             // rotation
        opacity: number;            // opacity
        color: Color;                // color
        blending: Blending;
    }

    export class LensFlare extends Object3D {
        constructor(texture?: Texture, size?: number, distance?: number, blending?: Blending, color?: Color);

        lensFlares: LensFlareProperty[];
        positionScreen: Vector3;
        customUpdateCallback: (object: LensFlare) => void;

        add(texture: Texture, size?: number, distance?: number, blending?: Blending, color?: Color): void;
        add(obj: Object3D): void;


        updateLensFlares(): void;
    }

    export class Line extends Object3D {
        constructor(geometry?: Geometry, material?: LineDashedMaterial, mode?: number);
        constructor(geometry?: Geometry, material?: LineBasicMaterial, mode?: number);
        constructor(geometry?: Geometry, material?: ShaderMaterial, mode?: number);
        constructor(geometry?: BufferGeometry, material?: LineDashedMaterial, mode?: number);
        constructor(geometry?: BufferGeometry, material?: LineBasicMaterial, mode?: number);
        constructor(geometry?: BufferGeometry, material?: ShaderMaterial, mode?: number);

        geometry: any; // Geometry or BufferGeometry;
        material: Material; // LineDashedMaterial or LineBasicMaterial or ShaderMaterial
        mode: LineMode;

        raycast(raycaster: Raycaster, intersects: any): void;
        clone(object?: Line): Line;
    }

    enum LineMode { }
    var LineStrip: LineMode;
    var LinePieces: LineMode;

    export class LOD extends Object3D {
        constructor();

        objects: any[];

        addLevel(object: Object3D, distance?: number): void;
        getObjectForDistance(distance: number): Object3D;
        raycast(raycaster: Raycaster, intersects: any): void;
        update(camera: Camera): void;
        clone(object?: LOD): LOD;
    }

    export class Mesh extends Object3D {
        constructor(geometry?: Geometry, material?: Material);
        constructor(geometry?: BufferGeometry, material?: Material);

        geometry: Geometry;
        material: Material;

        updateMorphTargets(): void;
        getMorphTargetIndexByName(name: string): number;
        raycast(raycaster: Raycaster, intersects: any): void;
        clone(object?: Mesh): Mesh;
    }

    export class MorphAnimMesh extends Mesh {
        constructor(geometry?: Geometry, material?: MeshBasicMaterial);
        constructor(geometry?: Geometry, material?: MeshDepthMaterial);
        constructor(geometry?: Geometry, material?: MeshFaceMaterial);
        constructor(geometry?: Geometry, material?: MeshLambertMaterial);
        constructor(geometry?: Geometry, material?: MeshNormalMaterial);
        constructor(geometry?: Geometry, material?: MeshPhongMaterial);
        constructor(geometry?: Geometry, material?: ShaderMaterial);

        duration: number; // milliseconds
        mirroredLoop: boolean;
        time: number;
        lastKeyframe: number;
        currentKeyframe: number;
        direction: number;
        directionBackwards: boolean;

        startKeyframe: number;
        endKeyframe: number;
        length: number;

        setFrameRange(start: number, end: number): void;
        setDirectionForward(): void;
        setDirectionBackward(): void;
        parseAnimations(): void;
        setAnimationLabel(label: string, start: number, end: number): void;
        playAnimation(label: string, fps: number): void;
        updateAnimation(delta: number): void;
        interpolateTargets(a: number, b: number, t: number): void;
        clone(object?: MorphAnimMesh): MorphAnimMesh;
    }

    /**
     * A class for displaying particles in the form of variable size points. For example, if using the WebGLRenderer, the particles are displayed using GL_POINTS.
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/objects/ParticleSystem.js">src/objects/ParticleSystem.js</a>
     */
    export class PointCloud extends Object3D {

        /**
         * @param geometry An instance of Geometry.
         * @param material An instance of Material (optional).
         */
        constructor(geometry: Geometry, material?: PointCloudMaterial);
        constructor(geometry: Geometry, material?: ShaderMaterial);
        constructor(geometry: BufferGeometry, material?: PointCloudMaterial);
        constructor(geometry: BufferGeometry, material?: ShaderMaterial);

        /**
         * An instance of Geometry, where each vertex designates the position of a particle in the system.
         */
        geometry: Geometry;

        /**
         * An instance of Material, defining the object's appearance. Default is a ParticleBasicMaterial with randomised colour.
         */
        material: Material;

        raycast(raycaster: Raycaster, intersects: any): void;
        clone(object?: PointCloud): PointCloud;
    }

    export class Skeleton {
        constructor(bones: Bone[], boneInverses?: Matrix4[], useVertexTexture?: boolean);

        useVertexTexture: boolean;
        identityMatrix: Matrix4;
        bones: Bone[];
        boneTextureWidth: number;
        boneTextureHeight: number;
        boneMatrices: Float32Array;
        boneTexture: DataTexture;
        boneInverses: Matrix4[];

        calculateInverses(bone: Bone): void;
        pose(): void;
        update(): void;
    }

    export class SkinnedMesh extends Mesh {
        constructor(geometry?: Geometry|BufferGeometry, material?: MeshBasicMaterial, useVertexTexture?: boolean);
        constructor(geometry?: Geometry|BufferGeometry, material?: MeshDepthMaterial, useVertexTexture?: boolean);
        constructor(geometry?: Geometry|BufferGeometry, material?: MeshFaceMaterial, useVertexTexture?: boolean);
        constructor(geometry?: Geometry|BufferGeometry, material?: MeshLambertMaterial, useVertexTexture?: boolean);
        constructor(geometry?: Geometry|BufferGeometry, material?: MeshNormalMaterial, useVertexTexture?: boolean);
        constructor(geometry?: Geometry|BufferGeometry, material?: MeshPhongMaterial, useVertexTexture?: boolean);
        constructor(geometry?: Geometry|BufferGeometry, material?: ShaderMaterial, useVertexTexture?: boolean);

        bindMode: string;
        bindMatrix: Matrix4;
        bindMatrixInverse: Matrix4;

        bind(skeleton: Skeleton, bindMatrix?: Matrix4): void;
        pose(): void;
        normalizeSkinWeights(): void;
        updateMatrixWorld(force?: boolean): void;
        clone(object?: SkinnedMesh): SkinnedMesh;

        skeleton: Skeleton;
    }

    export class Sprite extends Object3D {
        constructor(material?: Material);

        geometry: BufferGeometry;
        material: SpriteMaterial;

        raycast(raycaster: Raycaster, intersects: any): void;
        clone(object?: Sprite): Sprite;
    }


    // Renderers //////////////////////////////////////////////////////////////////////////////////

    export interface Renderer {
        render(scene: Scene, camera: Camera): void;
        setSize(width: number, height: number, updateStyle?: boolean): void;
        domElement: HTMLCanvasElement;
    }

    export interface WebGLRendererParameters {
        /**
         * A Canvas where the renderer draws its output.
         */
        canvas?: HTMLCanvasElement;

        /**
         *  shader precision. Can be "highp", "mediump" or "lowp".
         */
        precision?: string;

        /**
         * default is true.
         */
        alpha?: boolean;

        /**
         * default is true.
         */
        premultipliedAlpha?: boolean;

        /**
         * default is false.
         */
        antialias?: boolean;

        /**
         * default is true.
         */
        stencil?: boolean;

        /**
         * default is false.
         */
        preserveDrawingBuffer?: boolean;

        /**
         * default is 0x000000.
         */
        clearColor?: number;

        /**
         * default is 0.
         */
        clearAlpha?: number;

        devicePixelRatio?: number;
    }


    /**
     * The WebGL renderer displays your beautifully crafted scenes using WebGL, if your device supports it.
     * This renderer has way better performance than CanvasRenderer.
     *
     * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderer.js">src/renderers/WebGLRenderer.js</a>
     */
    export class WebGLRenderer implements Renderer {
        /**
         * parameters is an optional object with properties defining the renderer's behaviour. The constructor also accepts no parameters at all. In all cases, it will assume sane defaults when parameters are missing.
         */
        constructor(parameters?: WebGLRendererParameters);

        /**
         * A Canvas where the renderer draws its output.
         * This is automatically created by the renderer in the constructor (if not provided already); you just need to add it to your page.
         */
        domElement: HTMLCanvasElement;

        /**
         * The HTML5 Canvas's 'webgl' context obtained from the canvas where the renderer will draw.
         */
        //  If you are using three.d.ts with other complete definitions of webgl, context:WebGLRenderingContext is suitable.
        //context:WebGLRenderingContext;
        context: any;

        /**
         * Defines whether the renderer should automatically clear its output before rendering.
         */
        autoClear: boolean;

        /**
         * If autoClear is true, defines whether the renderer should clear the color buffer. Default is true.
         */
        autoClearColor: boolean;

        /**
         * If autoClear is true, defines whether the renderer should clear the depth buffer. Default is true.
         */
        autoClearDepth: boolean;

        /**
         * If autoClear is true, defines whether the renderer should clear the stencil buffer. Default is true.
         */
        autoClearStencil: boolean;

        /**
         * Defines whether the renderer should sort objects. Default is true.
         */
        sortObjects: boolean;

        gammaFactor: number;

        /**
         * Default is false.
         */
        gammaInput: boolean;

        /**
         * Default is false.
         */
        gammaOutput: boolean;

        /**
         * Default is false.
         */
        shadowMapEnabled: boolean;

        /**
         * Defines shadow map type (unfiltered, percentage close filtering, percentage close filtering with bilinear filtering in shader)
         * Options are THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap. Default is THREE.PCFShadowMap.
         */
        shadowMapType: ShadowMapType;

        /**
         * Default is true
         */
        shadowMapCullFace: CullFace;

        /**
         * Default is false.
         */
        shadowMapDebug: boolean;

        /**
         * Default is false.
         */
        shadowMapCascade: boolean;

        /**
         * Default is 8.
         */
        maxMorphTargets: number;

        /**
         * Default is 4.
         */
        maxMorphNormals: number;

        /**
         * Default is true.
         */
        autoScaleCubemaps: boolean;

        /**
         * An object with a series of statistical information about the graphics board memory and the rendering process. Useful for debugging or just for the sake of curiosity. The object contains the following fields:
         */
        info: {
            memory: {
                programs: number;
                geometries: number;
                textures: number;
            };
            render: {
                calls: number;
                vertices: number;
                faces: number;
                points: number;
            };
        };

        shadowMapPlugin: ShadowMapPlugin;

        /**
         * Return the WebGL context.
         */
        getContext(): WebGLRenderingContext;

        forceContextLoss(): void;

        /**
         * Return a Boolean true if the context supports vertex textures.
         */
        supportsVertexTextures(): boolean;
        supportsFloatTextures(): boolean;
        supportsStandardDerivatives(): boolean;
        supportsCompressedTextureS3TC(): boolean;
        supportsCompressedTexturePVRTC(): boolean;
        supportsBlendMinMax(): boolean;
        getMaxAnisotropy(): number;
        getPrecision(): string;
        getPixelRatio(): number;
        setPixelRatio(value: number): void;

        /**
         * Resizes the output canvas to (width, height), and also sets the viewport to fit that size, starting in (0, 0).
         */
        setSize(width: number, height: number, updateStyle?: boolean): void;

        /**
         * Sets the viewport to render from (x, y) to (x + width, y + height).
         */
        setViewport(x?: number, y?: number, width?: number, height?: number): void;

        /**
         * Sets the scissor area from (x, y) to (x + width, y + height).
         */
        setScissor(x: number, y: number, width: number, height: number): void;

        /**
         * Enable the scissor test. When this is enabled, only the pixels within the defined scissor area will be affected by further renderer actions.
         */
        enableScissorTest(enable: boolean): void;

        /**
         * Sets the clear color, using color for the color and alpha for the opacity.
         */
        setClearColor(color: Color, alpha?: number): void;
        setClearColor(color: string, alpha?: number): void;
        setClearColor(color: number, alpha?: number): void;

        setClearAlpha(alpha: number): void;

        /**
         * Sets the clear color, using hex for the color and alpha for the opacity.
         *
         * @example
         * // Creates a renderer with black background
         * var renderer = new THREE.WebGLRenderer();
         * renderer.setSize(200, 100);
         * renderer.setClearColorHex(0x000000, 1);
         */
        setClearColorHex(hex: number, alpha: number): void;

        /**
         * Returns a THREE.Color instance with the current clear color.
         */
        getClearColor(): Color;

        /**
         * Returns a float with the current clear alpha. Ranges from 0 to 1.
         */
        getClearAlpha(): number;

        /**
         * Tells the renderer to clear its color, depth or stencil drawing buffer(s).
         * If no parameters are passed, no buffer will be cleared.
         */
        clear(color?: boolean, depth?: boolean, stencil?: boolean): void;

        clearColor(): void;
        clearDepth(): void;
        clearStencil(): void;
        clearTarget(renderTarget: WebGLRenderTarget, color: boolean, depth: boolean, stencil: boolean): void;
        resetGLState(): void;

        /**
         * Tells the shadow map plugin to update using the passed scene and camera parameters.
         *
         * @param scene an instance of Scene
         * @param camera — an instance of Camera
         */
        updateShadowMap(scene: Scene, camera: Camera): void;

        renderBufferImmediate(object: Object3D, program: Object, material: Material): void;

        renderBufferDirect(camera: Camera, lights: Light[], fog: Fog, material: Material, geometryGroup: any, object: Object3D): void;

        renderBuffer(camera: Camera, lights: Light[], fog: Fog, material: Material, geometryGroup: any, object: Object3D): void;

        /**
         * Render a scene using a camera.
         * The render is done to the renderTarget (if specified) or to the canvas as usual.
         * If forceClear is true, the canvas will be cleared before rendering, even if the renderer's autoClear property is false.
         */
        render(scene: Scene, camera: Camera, renderTarget?: RenderTarget, forceClear?: boolean): void;
        renderImmediateObject(camera: Camera, lights: Light[], fog: Fog, material: Material, object: Object3D): void;

        /**
         * Used for setting the gl frontFace, cullFace states in the GPU, thus enabling/disabling face culling when rendering.
         * If cullFace is false, culling will be disabled.
         * @param cullFace "back", "front", "front_and_back", or false.
         * @param frontFace "ccw" or "cw
         */
        setFaceCulling(cullFace?: CullFace, frontFace?: FrontFaceDirection): void;
        setMaterialFaces(material: Material): void;
        setDepthTest(depthTest: boolean): void;
        setDepthWrite(depthWrite: boolean): void;
        setBlending(blending: Blending, blendEquation: BlendingEquation, blendSrc: BlendingSrcFactor, blendDst: BlendingDstFactor): void;
        uploadTexture(texture: Texture): void;
        setTexture(texture: Texture, slot: number): void;
        setRenderTarget(renderTarget: RenderTarget): void;
        readRenderTargetPixels(renderTarget: RenderTarget, x: number, y: number, width: number, height: number, buffer: any): void;
    }

    export interface RenderTarget {
    }

    export interface WebGLRenderTargetOptions {
        wrapS?: Wrapping;
        wrapT?: Wrapping;
        magFilter?: TextureFilter;
        minFilter?: TextureFilter;
        anisotropy?: number; // 1;
        format?: number; // RGBAFormat;
        type?: TextureDataType; // UnsignedByteType;
        depthBuffer?: boolean; // true;
        stencilBuffer?: boolean; // true;
    }

    export class WebGLRenderTarget implements RenderTarget {
        constructor(width: number, height: number, options?: WebGLRenderTargetOptions);

        width: number;
        height: number;
        wrapS: Wrapping;
        wrapT: Wrapping;
        magFilter: TextureFilter;
        minFilter: TextureFilter;
        anisotropy: number;
        offset: Vector2;
        repeat: Vector2;
        format: number;
        type: number;
        depthBuffer: boolean;
        stencilBuffer: boolean;
        generateMipmaps: boolean;
        shareDepthFrom: any;

        setSize(width: number, height: number): void;
        clone(): WebGLRenderTarget;
        dispose(): void;


        // EventDispatcher mixins
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string; target: any; }): void;
    }

    export class WebGLRenderTargetCube extends WebGLRenderTarget {
        constructor(width: number, height: number, options?: WebGLRenderTargetOptions);

        activeCubeFace: number; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
    }

    // Renderers / Shaders /////////////////////////////////////////////////////////////////////
    export interface ShaderChunk {
        [name: string]: string;

        common: string;
        alphamap_fragment: string;
        alphamap_pars_fragment: string;
        alphatest_fragment: string;
        bumpmap_pars_fragment: string;
        color_fragment: string;
        color_pars_fragment: string;
        color_pars_vertex: string;
        color_vertex: string;
        default_vertex: string;
        defaultnormal_vertex: string;
        envmap_fragment: string;
        envmap_pars_fragment: string;
        envmap_pars_vertex: string;
        envmap_vertex: string;
        fog_fragment: string;
        fog_pars_fragment: string;

        lightmap_fragment: string;
        lightmap_pars_fragment: string;
        lightmap_pars_vertex: string;
        lightmap_vertex: string;
        lights_lambert_pars_vertex: string;
        lights_lambert_vertex: string;
        lights_phong_fragment: string;
        lights_phong_pars_fragment: string;
        lights_phong_pars_vertex: string;
        lights_phong_vertex: string;
        linear_to_gamma_fragment: string;
        logdepthbuf_fragment: string;
        logdepthbuf_pars_fragment: string;
        logdepthbuf_pars_vertex: string;
        logdepthbuf_vertex: string;
        map_fragment: string;
        map_pars_fragment: string;
        map_pars_vertex: string;
        map_particle_fragment: string;
        map_particle_pars_fragment: string;
        map_vertex: string;
        morphnormal_vertex: string;
        morphtarget_pars_vertex: string;
        morphtarget_vertex: string;
        normalmap_pars_fragment: string;
        shadowmap_fragment: string;
        shadowmap_pars_fragment: string;
        shadowmap_pars_vertex: string;
        shadowmap_vertex: string;
        skinbase_vertex: string;
        skinning_pars_vertex: string;
        skinning_vertex: string;
        skinnormal_vertex: string;
        specularmap_fragment: string;
        specularmap_pars_fragment: string;
        worldpos_vertex: string;
    }

    export var ShaderChunk: ShaderChunk;

    export interface Shader {
        uniforms: any;
        vertexShader: string;
        fragmentShader: string;
    }

    export var ShaderLib: {
        [name: string]: Shader;
        basic: Shader;
        lambert: Shader;
        phong: Shader;
        particle_basic: Shader;
        dashed: Shader;
        depth: Shader;
        normal: Shader;
        normalmap: Shader;
        cube: Shader;
        equirect: Shader;
        depthRGBA: Shader;
    };

    export var UniformsLib: {
        common: any;
        bump: any;
        normalmap: any;
        fog: any;
        lights: any;
        particle: any;
        shadowmap: any;
    };

    export var UniformsUtils: {
        merge(uniforms: any[]): any;
        clone(uniforms_src: any): any;
    };

    // Renderers / WebGL /////////////////////////////////////////////////////////////////////
    export class WebGLExtensions {
        constructor(gl: any); // WebGLRenderingContext

        get(name: string): any;
    }

    export class WebGLProgram {
        constructor(renderer: WebGLRenderer, code: string, material: ShaderMaterial, parameters: WebGLRendererParameters);

        attributes: any;
        attributesKeys: string[];
        id: number;
        code: string;
        usedTimes: number;
        program: any;
        vertexShader: WebGLShader;
        fragmentShader: WebGLShader;
    }

    export class WebGLShader {
        constructor(gl: any, type: string, string: string);
    }

    interface WebGLStateInstance {
        new (gl: any, paramThreeToGL: Function): void;
        initAttributes(): void;
        enableAttribute(attribute: string): void;
        disableUnusedAttributes(): void;
        setBlending(blending: number, blendEquation: number, blendSrc: number, blendDst: number, blendEquationAlpha: number, blendSrcAlpha: number, blendDstAlpha: number): void;
        setDepthTest(depthTest: number): void;
        setDepthWrite(depthWrite: number): void;
        setColorWrite(colorWrite: number): void;
        setDoubleSided(doubleSided: number): void;
        setFlipSided(flipSided: number): void;
        setLineWidth(width: number): void;
        setPolygonOffset(polygonoffset: number, factor: number, units: number): void;
        reset(): void;
    }
    interface WebGLStateStatic {
        (gl: any, paramThreeToGL: Function): WebGLStateInstance;
    }
    export var WebGLState: WebGLStateStatic;


    interface WebGLTexturesInstance {
        new (webgglcontext: any): WebGLTexturesInstance;

        get(texture: Texture): any; // it will return result of gl.createTexture().
        create(texture: Texture): any; // it will return result of gl.createTexture().
        delete(texture: Texture): void;
    }
    interface WebGLTexturesStatic {
        (webgglcontext: any): WebGLTexturesInstance;
    }
    export var WebGLTextures: WebGLTexturesStatic;


    // Renderers / WebGL / Plugins /////////////////////////////////////////////////////////////////////
    export interface RendererPlugin {
        init(renderer: WebGLRenderer): void;
        render(scene: Scene, camera: Camera, currentWidth: number, currentHeight: number): void;
    }

    export class LensFlarePlugin implements RendererPlugin {
        constructor();

        init(renderer: Renderer): void;
        render(scene: Scene, camera: Camera, viewportWidth: number, viewportHeight: number): void;
    }

    export class ShadowMapPlugin implements RendererPlugin {
        constructor();

        init(renderer: Renderer): void;
        render(scene: Scene, camera: Camera): void;
        update(scene: Scene, camera: Camera): void;
    }

    export class SpritePlugin implements RendererPlugin {
        constructor();

        init(renderer: Renderer): void;
        render(scene: Scene, camera: Camera, viewportWidth: number, viewportHeight: number): void;
    }

    // Scenes /////////////////////////////////////////////////////////////////////

    export interface IFog {
        name: string;
        color: Color;
        clone(): IFog;
    }


    /**
     * This class contains the parameters that define linear fog, i.e., that grows linearly denser with the distance.
     */
    export class Fog implements IFog {
        constructor(hex: number, near?: number, far?: number);

        name: string;

        /**
         * Fog color.
         */
        color: Color;

        /**
         * The minimum distance to start applying fog. Objects that are less than 'near' units from the active camera won't be affected by fog.
         */
        near: number;

        /**
         * The maximum distance at which fog stops being calculated and applied. Objects that are more than 'far' units away from the active camera won't be affected by fog.
         * Default is 1000.
         */
        far: number;

        clone(): Fog;
    }

    /**
     * This class contains the parameters that define linear fog, i.e., that grows exponentially denser with the distance.
     */
    export class FogExp2 implements IFog {
        constructor(hex: number, density?: number);

        name: string;
        color: Color;

        /**
         * Defines how fast the fog will grow dense.
         * Default is 0.00025.
         */
        density: number;

        clone(): FogExp2;
    }

    /**
     * Scenes allow you to set up what and where is to be rendered by three.js. This is where you place objects, lights and cameras.
     */
    export class Scene extends Object3D {
        constructor();

        /**
         * A fog instance defining the type of fog that affects everything rendered in the scene. Default is null.
         */
        fog: IFog;

        /**
         * If not null, it will force everything in the scene to be rendered with that material. Default is null.
         */
        overrideMaterial: Material;
        autoUpdate: boolean;

        clone(): Scene;
    }

    // Textures /////////////////////////////////////////////////////////////////////
    export class CompressedTexture extends Texture {
        constructor(
            mipmaps: ImageData[],
            width: number,
            height: number,
            format?: PixelFormat,
            type?: TextureDataType,
            mapping?: Mapping,
            wrapS?: Wrapping,
            wrapT?: Wrapping,
            magFilter?: TextureFilter,
            minFilter?: TextureFilter,
            anisotropy?: number
            );

        image: { width: number; height: number; };
        mipmaps: ImageData[];
        flipY: boolean;
        generateMipmaps: boolean;

        clone(): CompressedTexture;
    }

    export class CubeTexture extends Texture {
        constructor(
            images: any[], // HTMLImageElement or HTMLCanvasElement
            mapping?: Mapping,
            wrapS?: Wrapping,
            wrapT?: Wrapping,
            magFilter?: TextureFilter,
            minFilter?: TextureFilter,
            format?: PixelFormat,
            type?: TextureDataType,
            anisotropy?: number
            );

        images: any[];

        clone(texture?: CubeTexture): CubeTexture;
    }

    export class DataTexture extends Texture {
        constructor(
            data: ImageData,
            width: number,
            height: number,
            format: PixelFormat,
            type: TextureDataType,
            mapping: Mapping,
            wrapS: Wrapping,
            wrapT: Wrapping,
            magFilter: TextureFilter,
            minFilter: TextureFilter,
            anisotropy?: number
            );

        image: { data: ImageData; width: number; height: number; };

        clone(): DataTexture;
    }

    export class Texture {
        constructor(
            image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
            mapping?: Mapping,
            wrapS?: Wrapping,
            wrapT?: Wrapping,
            magFilter?: TextureFilter,
            minFilter?: TextureFilter,
            format?: PixelFormat,
            type?: TextureDataType,
            anisotropy?: number
            );

        id: number;
        uuid: string;
        name: string;
        sourceFile: string;
        image: any; // HTMLImageElement or ImageData ;
        mipmaps: ImageData[];
        mapping: Mapping;
        wrapS: Wrapping;
        wrapT: Wrapping;
        magFilter: TextureFilter;
        minFilter: TextureFilter;
        anisotropy: number;
        format: PixelFormat;
        type: TextureDataType;
        offset: Vector2;
        repeat: Vector2;
        generateMipmaps: boolean;
        premultiplyAlpha: boolean;
        flipY: boolean;
        unpackAlignment: number;
        needsUpdate: boolean;
        onUpdate: () => void;
        static DEFAULT_IMAGE: any;
        static DEFAULT_MAPPING: any;

        clone(): Texture;
        update(): void;
        dispose(): void;

        // EventDispatcher mixins
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string; target: any; }): void;
    }

    class VideoTexture extends Texture {
        constructor(
            video: HTMLVideoElement,
            mapping?: Mapping,
            wrapS?: Wrapping,
            wrapT?: Wrapping,
            magFilter?: TextureFilter,
            minFilter?: TextureFilter,
            format?: PixelFormat,
            type?: TextureDataType,
            anisotropy?: number
            );

        generateMipmaps: boolean;
    }

    // Extras /////////////////////////////////////////////////////////////////////

    export interface TypefaceData {
        familyName: string;
        cssFontWeight: string;
        cssFontStyle: string;
    }

    export var FontUtils: {
        faces: { [weight: string]: { [style: string]: Face3; }; };
        face: string;
        weight: string;
        style: string;
        size: number;
        divisions: number;

        getFace(): Face3;
        loadFace(data: TypefaceData): TypefaceData;
        drawText(text: string): { paths: Path[]; offset: number; };
        extractGlyphPoints(c: string, face: Face3, scale: number, offset: number, path: Path): { offset: number; path: Path; };

        generateShapes(text: string, parameters?: { size?: number; curveSegments?: number; font?: string; weight?: string; style?: string; }): Shape[];
        Triangulate: {
            (contour: Vector2[], indices: boolean): Vector2[];
            area(contour: Vector2[]): number;
        };
    };

    export var GeometryUtils: {
        // DEPRECATED
        merge(geometry1: Geometry, object2: Mesh, materialIndexOffset?: number): void;

        // DEPRECATED
        merge(geometry1: Geometry, object2: Geometry, materialIndexOffset?: number): void;

        // DEPRECATED
        center(geometry: Geometry): Vector3;
    };

    export var ImageUtils: {
        crossOrigin: string;

        loadTexture(url: string, mapping?: Mapping, onLoad?: (texture: Texture) => void, onError?: (message: string) => void): Texture;
        loadTextureCube(array: string[], mapping?: Mapping, onLoad?: (texture: Texture) => void, onError?: (message: string) => void): Texture;
        getNormalMap(image: HTMLImageElement, depth?: number): HTMLCanvasElement;
        generateDataTexture(width: number, height: number, color: Color): DataTexture;
    };

    export var SceneUtils: {
        createMultiMaterialObject(geometry: Geometry, materials: Material[]): Object3D;
        detach(child: Object3D, parent: Object3D, scene: Scene): void;
        attach(child: Object3D, scene: Scene, parent: Object3D): void;
    };

    // Extras / Animation /////////////////////////////////////////////////////////////////////

    export interface KeyFrame {
        pos: number[];
        rot: number[];
        scl: number[];
        time: number;
    }

    export interface KeyFrames {
        keys: KeyFrame[];
        parent: number;
    }

    export interface AnimationData {
        JIT: number;
        fps: number;
        hierarchy: KeyFrames[];
        length: number;
        name: string;
    }

    export class Animation {
        constructor(root: Mesh, data: AnimationData);

        root: Mesh;
        data: AnimationData;
        hierarchy: Bone[];
        currentTime: number;
        timeScale: number;
        isPlaying: boolean;
        loop: boolean;
        weight: number;
        interpolationType: number;

        play(startTime?: number, weight?: number): void;
        stop(): void;
        reset(): void;
        resetBlendWeights(): void;
        update(delta: number): void;
        getNextKeyWith(type: string, h: number, key: number): KeyFrame;
        getPrevKeyWith(type: string, h: number, key: number): KeyFrame;
    }

    export var AnimationHandler: {
        LINEAR: number;
        CATMULLROM: number;
        CATMULLROM_FORWARD: number;

        animations: any[];

        init(data: AnimationData): AnimationData;
        parse(root: Mesh): Object3D[];
        play(animation: Animation): void;
        stop(animation: Animation): void;
        update(deltaTimeMS: number): void;
    };

    export class KeyFrameAnimation {
        constructor(data: any);

        root: Mesh;
        data: AnimationData;
        hierarchy: KeyFrames[];
        currentTime: number;
        timeScale: number;
        isPlaying: boolean;
        isPaused: boolean;
        loop: boolean;

        play(startTime?: number): void;
        stop(): void;
        update(delta: number): void;
        getNextKeyWith(type: string, h: number, key: number): KeyFrame;
        getPrevKeyWith(type: string, h: number, key: number): KeyFrame;
    }

    export class MorphAnimation {
        constructor(mesh: Mesh);

        mesh: Mesh;
        frames: number;
        currentTime: number;
        duration: number;
        loop: boolean;
        lastFrame: number;
        currentFrame: number;
        isPlaying: boolean;

        play(): void;
        pause(): void;
        update(delta: number): void;
    }

    // Extras / Audio /////////////////////////////////////////////////////////////////////

    export class Audio extends Object3D {
        constructor(listener: AudioListener);
        type: string;
        context: AudioContext;
        source: AudioBufferSourceNode;
        gain: GainNode;
        panner: PannerNode;
        autoplay: boolean;
        startTime: number;
        isPlaying: boolean;

        load(file: string): Audio;
        play(): void;
        pause(): void;
        stop(): void;
        setLoop(value: boolean): void;
        setRefDistance(value: number): void;
        setRolloffFactor(value: number): void;
        setVolume(value: number): void;
        updateMatrixWorld(force?: boolean): void;
    }

    export class AudioListener extends Object3D {
        constructor();

        type: string;
        context: AudioContext;

        updateMatrixWorld(force?: boolean): void;
    }

    // Extras / Core /////////////////////////////////////////////////////////////////////

    /**
     * An extensible curve object which contains methods for interpolation
     * class Curve&lt;T extends Vector&gt;
     */
    export class Curve<T extends Vector> {
        /**
         * Returns a vector for point t of the curve where t is between 0 and 1
         * getPoint(t: number): T;
         */
        getPoint(t: number): T;

        /**
         * Returns a vector for point at relative position in curve according to arc length
         * getPointAt(u: number): T;
         */
        getPointAt(u: number): T;

        /**
         * Get sequence of points using getPoint( t )
         * getPoints(divisions?: number): T[];
         */
        getPoints(divisions?: number): T[];

        /**
         * Get sequence of equi-spaced points using getPointAt( u )
         * getSpacedPoints(divisions?: number): T[];
         */
        getSpacedPoints(divisions?: number): T[];

        /**
         * Get total curve arc length
         */
        getLength(): number;

        /**
         * Get list of cumulative segment lengths
         */
        getLengths(divisions?: number): number[];

        /**
         * Update the cumlative segment distance cache
         */
        updateArcLengths(): void;

        /**
         * Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equi distance
         */
        getUtoTmapping(u: number, distance: number): number;

        /**
         * Returns a unit vector tangent at t. If the subclassed curve do not implement its tangent derivation, 2 points a small delta apart will be used to find its gradient which seems to give a reasonable approximation
         * getTangent(t: number): T;
         */
        getTangent(t: number): T;

        /**
         * Returns tangent at equidistance point u on the curve
         * getTangentAt(u: number): T;
         */
        getTangentAt(u: number): T;

        static Utils: {
            tangentQuadraticBezier(t: number, p0: number, p1: number, p2: number): number;
            tangentCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number;
            tangentSpline(t: number, p0: number, p1: number, p2: number, p3: number): number;
            interpolate(p0: number, p1: number, p2: number, p3: number, t: number): number;
        };

        static create(constructorFunc: Function, getPointFunc: Function): Function;
    }

    export interface BoundingBox {
        minX: number;
        minY: number;
        minZ?: number;
        maxX: number;
        maxY: number;
        maxZ?: number;
    }

    export class CurvePath<T extends Vector> extends Curve<T> {
        constructor();

        curves: Curve<T>[];
        bends: Path[];
        autoClose: boolean;

        add(curve: Curve<T>): void;
        checkConnection(): boolean;
        closePath(): void;
        getLength(): number;
        getCurveLengths(): number[];
        getBoundingBox(): BoundingBox;
        createPointsGeometry(divisions: number): Geometry;
        createSpacedPointsGeometry(divisions: number): Geometry;
        createGeometry(points: T[]): Geometry;
        addWrapPath(bendpath: Path): void;
        getTransformedPoints(segments: number, bends?: Path[]): T[];
        getTransformedSpacedPoints(segments: number, bends?: Path[]): T[];
        getWrapPoints(oldPts: T[], path: Path): T[];
    }

    export class Gyroscope extends Object3D {
        constructor();

        updateMatrixWorld(force?: boolean): void;
    }

    export enum PathActions {
        MOVE_TO,
        LINE_TO,
        QUADRATIC_CURVE_TO, // Bezier quadratic curve
        BEZIER_CURVE_TO,     // Bezier cubic curve
        CSPLINE_THRU,        // Catmull-rom spline
        ARC,                // Circle
        ELLIPSE,
    }

    export interface PathAction {
        action: PathActions;
        args: any;
    }

    /**
     * a 2d path representation, comprising of points, lines, and cubes, similar to the html5 2d canvas api. It extends CurvePath.
     */
    export class Path extends CurvePath<Vector2> {
        constructor(points?: Vector2[]);

        actions: PathAction[];

        fromPoints(vectors: Vector2[]): void;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): void;
        bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number): void;
        splineThru(pts: Vector2[]): void;
        arc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void;
        absarc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void;
        ellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void;
        absellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void;
        getSpacedPoints(divisions?: number, closedPath?: boolean): Vector2[];
        getPoints(divisions?: number, closedPath?: boolean): Vector2[];
        toShapes(): Shape[];
    }

    /**
     * Defines a 2d shape plane using paths.
     */
    export class Shape extends Path {
        constructor(points?: Vector2[]);

        holes: Path[];

        extrude(options?: any): ExtrudeGeometry;
        makeGeometry(options?: any): ShapeGeometry;
        getPointsHoles(divisions: number): Vector2[][];
        getSpacedPointsHoles(divisions: number): Vector2[][];
        extractAllPoints(divisions: number): {
            shape: Vector2[];
            holes: Vector2[][];
        };
        extractPoints(divisions: number): Vector2[];
        extractAllSpacedPoints(divisions: Vector2): {
            shape: Vector2[];
            holes: Vector2[][];
        };

    }

    // Extras / Curves /////////////////////////////////////////////////////////////////////
    export class ArcCurve extends EllipseCurve {
        constructor(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean);
    }

    export class ClosedSplineCurve3 extends Curve<Vector3> {
        constructor(points?: Vector3[]);

        points: Vector3[];
    }

    export class CubicBezierCurve extends Curve<Vector2> {
        constructor(v0: Vector2, v1: Vector2, v2: Vector2, v3: Vector2);

        v0: Vector2;
        v1: Vector2;
        v2: Vector2;
        v3: Vector2;
    }
    export class CubicBezierCurve3 extends Curve<Vector3> {
        constructor(v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3);

        v0: Vector3;
        v1: Vector3;
        v2: Vector3;
        v3: Vector3;
    }
    export class EllipseCurve extends Curve<Vector2> {
        constructor(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean);

        aX: number;
        aY: number;
        xRadius: number;
        yRadius: number;
        aStartAngle: number;
        aEndAngle: number;
        aClockwise: boolean;
    }
    export class LineCurve extends Curve<Vector2> {
        constructor(v1: Vector2, v2: Vector2);

        v1: Vector2;
        v2: Vector2;

    }
    export class LineCurve3 extends Curve<Vector3> {
        constructor(v1: Vector3, v2: Vector3);

        v1: Vector3;
        v2: Vector3;
    }
    export class QuadraticBezierCurve extends Curve<Vector2> {
        constructor(v0: Vector2, v1: Vector2, v2: Vector2);

        v0: Vector2;
        v1: Vector2;
        v2: Vector2;
    }
    export class QuadraticBezierCurve3 extends Curve<Vector3> {
        constructor(v0: Vector3, v1: Vector3, v2: Vector3);

        v0: Vector3;
        v1: Vector3;
        v2: Vector3;
    }
    export class SplineCurve extends Curve<Vector2> {
        constructor(points?: Vector2[]);

        points: Vector2[];
    }
    export class SplineCurve3 extends Curve<Vector3> {
        constructor(points?: Vector3[]);

        points: Vector3[];
    }

    // Extras / Geomerties /////////////////////////////////////////////////////////////////////
    /**
     * BoxGeometry is the quadrilateral primitive geometry class. It is typically used for creating a cube or irregular quadrilateral of the dimensions provided within the (optional) 'width', 'height', & 'depth' constructor arguments.
     */
    export class BoxGeometry extends Geometry {
        /**
         * @param width — Width of the sides on the X axis.
         * @param height — Height of the sides on the Y axis.
         * @param depth — Depth of the sides on the Z axis.
         * @param widthSegments — Number of segmented faces along the width of the sides.
         * @param heightSegments — Number of segmented faces along the height of the sides.
         * @param depthSegments — Number of segmented faces along the depth of the sides.
         */
        constructor(width: number, height: number, depth: number, widthSegments?: number, heightSegments?: number, depthSegments?: number);

        parameters: {
            width: number;
            height: number;
            depth: number;
            widthSegments: number;
            heightSegments: number;
            depthSegments: number;
        };
    }

    export class CircleGeometry extends Geometry {
        constructor(radius?: number, segments?: number, thetaStart?: number, thetaLength?: number);

        parameters: {
            radius: number;
            segments: number;
            thetaStart: number;
            thetaLength: number;
        };
    }

    // deprecated
    export class CubeGeometry extends BoxGeometry {
    }

    export class CylinderGeometry extends Geometry {
        /**
         * @param radiusTop — Radius of the cylinder at the top.
         * @param radiusBottom — Radius of the cylinder at the bottom.
         * @param height — Height of the cylinder.
         * @param radiusSegments — Number of segmented faces around the circumference of the cylinder.
         * @param heightSegments — Number of rows of faces along the height of the cylinder.
         * @param openEnded - A Boolean indicating whether or not to cap the ends of the cylinder.
         */
        constructor(radiusTop?: number, radiusBottom?: number, height?: number, radiusSegments?: number, heightSegments?: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number);

        parameters: {
            radiusTop: number;
            radiusBottom: number;
            height: number;
            radialSegments: number;
            heightSegments: number;
            openEnded: boolean;
            thetaStart: number;
            thetaLength: number;
        };
    }

    export class DodecahedronGeometry extends Geometry {
        constructor(radius: number, detail: number);

        parameters: {
            radius: number;
            detail: number;
        };
    }

    export class ExtrudeGeometry extends Geometry {
        constructor(shape?: Shape, options?: any);
        constructor(shapes?: Shape[], options?: any);

        WorldUVGenerator: {
            generateTopUV(geometry: Geometry, indexA: number, indexB: number, indexC: number): Vector2[];
            generateSideWallUV(geometry: Geometry, indexA: number, indexB: number, indexC: number, indexD: number): Vector2[];
        };

        addShapeList(shapes: Shape[], options?: any): void;
        addShape(shape: Shape, options?: any): void;
    }

    export class IcosahedronGeometry extends PolyhedronGeometry {
        constructor(radius: number, detail: number);
    }

    export class LatheGeometry extends Geometry {
        constructor(points: Vector3[], segments?: number, phiStart?: number, phiLength?: number);

        parameters: {
            points: Vector3[];
            segments: number;
            phiStart: number;
            phiLength: number;
        };
    }

    export class OctahedronGeometry extends PolyhedronGeometry {
        constructor(radius: number, detail: number);
    }

    export class ParametricGeometry extends Geometry {
        constructor(func: (u: number, v: number) => Vector3, slices: number, stacks: number);

        parameters: {
            func: (u: number, v: number) => Vector3;
            slices: number;
            stacks: number;
        };
    }

    export class PlaneBufferGeometry extends BufferGeometry {
        constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);

        parameters: {
            width: number;
            height: number;
            widthSegments: number;
            heightSegments: number;
        };
    }

    export class PlaneGeometry extends Geometry {
        constructor(width: number, height: number, widthSegments?: number, heightSegments?: number);

        parameters: {
            width: number;
            height: number;
            widthSegments: number;
            heightSegments: number;
        };
    }

    export class PolyhedronGeometry extends Geometry {
        constructor(vertices: Vector3[], faces: Face3[], radius?: number, detail?: number);

        parameters: {
            vertices: Vector3[];
            faces: Face3[];
            radius: number;
            detail: number;
        };
    }

    export class RingGeometry extends Geometry {
        constructor(innerRadius?: number, outerRadius?: number, thetaSegments?: number, phiSegments?: number, thetaStart?: number, thetaLength?: number);

        parameters: {
            innerRadius: number;
            outerRadius: number;
            thetaSegments: number;
            phiSegments: number;
            thetaStart: number;
            thetaLength: number;
        };
    }

    export class ShapeGeometry extends Geometry {
        constructor(shape: Shape, options?: any);
        constructor(shapes: Shape[], options?: any);


        addShapeList(shapes: Shape[], options: any): ShapeGeometry;
        addShape(shape: Shape, options?: any): void;
    }

    /**
     * A class for generating sphere geometries
     */
    export class SphereGeometry extends Geometry {
        /**
         * The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) and the Z axis (vertical sweep). Thus, incomplete spheres (akin to 'sphere slices') can be created through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order to define the points in which we start (or end) calculating those vertices.
         *
         * @param radius — sphere radius. Default is 50.
         * @param widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
         * @param heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
         * @param phiStart — specify horizontal starting angle. Default is 0.
         * @param phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
         * @param thetaStart — specify vertical starting angle. Default is 0.
         * @param thetaLength — specify vertical sweep angle size. Default is Math.PI.
         */
        constructor(radius: number, widthSegments?: number, heightSegments?: number, phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number);

        parameters: {
            radius: number;
            widthSegments: number;
            heightSegments: number;
            phiStart: number;
            phiLength: number;
            thetaStart: number;
            thetaLength: number;
        };
    }

    export class TetrahedronGeometry extends PolyhedronGeometry {
        constructor(radius?: number, detail?: number);
    }

    export interface TextGeometryParameters {
        size?: number; // size of the text
        height?: number; // thickness to extrude text
        curveSegments?: number; // number of points on the curves
        font?: string; // font name
        weight?: string; // font weight (normal, bold)
        style?: string; // font style  (normal, italics)
        bevelEnabled?: boolean;   // turn on bevel
        bevelThickness?: number; // how deep into text bevel goes
        bevelSize?: number; // how far from text outline is bevel
    }

    export class TextGeometry extends ExtrudeGeometry {
        constructor(text: string, TextGeometryParameters?: TextGeometryParameters);
    }

    export class TorusGeometry extends Geometry {
        constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, arc?: number);

        parameters: {
            radius: number;
            tube: number;
            radialSegments: number;
            tubularSegments: number;
            arc: number;
        };
    }

    export class TorusKnotGeometry extends Geometry {
        constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, p?: number, q?: number, heightScale?: number);

        parameters: {
            radius: number;
            tube: number;
            radialSegments: number;
            tubularSegments: number;
            p: number;
            q: number;
            heightScale: number;
        };
    }


    export class TubeGeometry extends Geometry {
        constructor(path: Path, segments?: number, radius?: number, radiusSegments?: number, closed?: boolean, taper?: (u: number) => number);

        parameters: {
            path: Path;
            segments: number;
            radius: number;
            radialSegments: number;
            closed: boolean;
            taper: (u: number) => number; // NoTaper or SinusoidalTaper;
        };
        tangents: Vector3[];
        normals: Vector3[];
        binormals: Vector3[];

        static NoTaper(u?: number): number;
        static SinusoidalTaper(u: number): number;
        static FrenetFrames(path: Path, segments: number, closed: boolean): void;

    }

    // Extras / Helpers /////////////////////////////////////////////////////////////////////

    export class ArrowHelper extends Object3D {
        constructor(dir: Vector3, origin?: Vector3, length?: number, hex?: number, headLength?: number, headWidth?: number);

        line: Line;
        cone: Mesh;

        setDirection(dir: Vector3): void;
        setLength(length: number, headLength?: number, headWidth?: number): void;
        setColor(hex: number): void;
    }

    export class AxisHelper extends Line {
        constructor(size?: number);
    }

    export class BoundingBoxHelper extends Mesh {
        constructor(object?: Object3D, hex?: number);

        object: Object3D;
        box: Box3;

        update(): void;
    }

    export class BoxHelper extends Line {
        constructor(object?: Object3D);

        update(object?: Object3D): void;
    }

    export class CameraHelper extends Line {
        constructor(camera: Camera);

        camera: Camera;
        pointMap: { [id: string]: number[]; };

        update(): void;
    }

    export class DirectionalLightHelper extends Object3D {
        constructor(light: Light, size?: number);

        light: Light;
        lightPlane: Line;
        targetLine: Line;

        dispose(): void;
        update(): void;
    }

    export class EdgesHelper extends Line {
        constructor(object: Object3D, hex?: number, thresholdAngle?: number);

    }

    export class FaceNormalsHelper extends Line {
        constructor(object: Object3D, size?: number, hex?: number, linewidth?: number);

        object: Object3D;
        size: number;
        normalMatrix: Matrix3;

        update(object?: Object3D): void;
    }

    export class GridHelper extends Line {
        constructor(size: number, step: number);

        color1: Color;
        color2: Color;

        setColors(colorCenterLine: number, colorGrid: number): void;
    }
    export class HemisphereLightHelper extends Object3D {
        constructor(light: Light, sphereSize: number);

        light: Light;
        colors: Color[];
        lightSphere: Mesh;

        dispose(): void;
        update(): void;
    }

    export class PointLightHelper extends Object3D {
        constructor(light: Light, sphereSize: number);

        light: Light;

        dispose(): void;
        update(): void;
    }

    export class SkeletonHelper extends Line {
        constructor(bone: Object3D);

        bones: Bone[];
        root: Object3D;

        getBoneList(object: Object3D): Bone[];
        update(): void;
    }

    export class SpotLightHelper extends Object3D {
        constructor(light: Light, sphereSize: number, arrowLength: number);

        light: Light;
        cone: Mesh;

        dispose(): void;
        update(): void;
    }

    export class VertexNormalsHelper extends Line {
        constructor(object: Object3D, size?: number, hex?: number, linewidth?: number);

        object: Object3D;
        size: number;
        normalMatrix: Matrix3;

        update(object?: Object3D): void;
    }

    export class VertexTangentsHelper extends Line {
        constructor(object: Object3D, size?: number, hex?: number, linewidth?: number);

        object: Object3D;
        size: number;

        update(object?: Object3D): void;
    }

    export class WireframeHelper extends Line {
        constructor(object: Object3D, hex?: number);

    }

    // Extras / Objects /////////////////////////////////////////////////////////////////////

    export class ImmediateRenderObject extends Object3D {
        constructor();

        render(renderCallback: Function): void;
    }

    export interface MorphBlendMeshAnimation {
        startFrame: number;
        endFrame: number;
        length: number;
        fps: number;
        duration: number;
        lastFrame: number;
        currentFrame: number;
        active: boolean;
        time: number;
        direction: number;
        weight: number;
        directionBackwards: boolean;
        mirroredLoop: boolean;
    }

    export class MorphBlendMesh extends Mesh {
        constructor(geometry: Geometry, material: Material);

        animationsMap: { [name: string]: MorphBlendMeshAnimation; };
        animationsList: MorphBlendMeshAnimation[];

        createAnimation(name: string, start: number, end: number, fps: number): void;
        autoCreateAnimations(fps: number): void;
        setAnimationDirectionForward(name: string): void;
        setAnimationDirectionBackward(name: string): void;
        setAnimationFPS(name: string, fps: number): void;
        setAnimationDuration(name: string, duration: number): void;
        setAnimationWeight(name: string, weight: number): void;
        setAnimationTime(name: string, time: number): void;
        getAnimationTime(name: string): number;
        getAnimationDuration(name: string): number;
        playAnimation(name: string): void;
        stopAnimation(name: string): void;
        update(delta: number): void;
    }
}


/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Immutable data encourages pure functions (data-in, data-out) and lends itself
 * to much simpler application development and enabling techniques from
 * functional programming such as lazy evaluation.
 *
 * While designed to bring these powerful functional concepts to JavaScript, it
 * presents an Object-Oriented API familiar to Javascript engineers and closely
 * mirroring that of Array, Map, and Set. It is easy and efficient to convert to
 * and from plain Javascript types.

 * Note: all examples are presented in [ES6][]. To run in all browsers, they
 * need to be translated to ES3. For example:
 *
 *     // ES6
 *     foo.map(x => x * x);
 *     // ES3
 *     foo.map(function (x) { return x * x; });
 *
 * [ES6]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
 */

declare module __LiteMolImmutable {

  /**
   * Deeply converts plain JS objects and arrays to Immutable Maps and Lists.
   *
   * If a `reviver` is optionally provided, it will be called with every
   * collection as a Seq (beginning with the most nested collections
   * and proceeding to the top-level collection itself), along with the key
   * refering to each collection and the parent JS object provided as `this`.
   * For the top level, object, the key will be `""`. This `reviver` is expected
   * to return a new Immutable Iterable, allowing for custom conversions from
   * deep JS objects.
   *
   * This example converts JSON to List and OrderedMap:
   *
   *     Immutable.fromJS({a: {b: [10, 20, 30]}, c: 40}, function (key, value) {
   *       var isIndexed = Immutable.Iterable.isIndexed(value);
   *       return isIndexed ? value.toList() : value.toOrderedMap();
   *     });
   *
   *     // true, "b", {b: [10, 20, 30]}
   *     // false, "a", {a: {b: [10, 20, 30]}, c: 40}
   *     // false, "", {"": {a: {b: [10, 20, 30]}, c: 40}}
   *
   * If `reviver` is not provided, the default behavior will convert Arrays into
   * Lists and Objects into Maps.
   *
   * `reviver` acts similarly to the [same parameter in `JSON.parse`][1].
   *
   * `Immutable.fromJS` is conservative in it's conversion. It will only convert
   * arrays which pass `Array.isArray` to Lists, and only raw objects (no custom
   * prototype) to Map.
   *
   * Keep in mind, when using JS objects to construct Immutable Maps, that
   * JavaScript Object properties are always strings, even if written in a
   * quote-less shorthand, while Immutable Maps accept keys of any type.
   *
   * ```js
   * var obj = { 1: "one" };
   * Object.keys(obj); // [ "1" ]
   * obj["1"]; // "one"
   * obj[1];   // "one"
   *
   * var map = Map(obj);
   * map.get("1"); // "one"
   * map.get(1);   // undefined
   * ```
   *
   * Property access for JavaScript Objects first converts the key to a string,
   * but since Immutable Map keys can be of any type the argument to `get()` is
   * not altered.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter
   *      "Using the reviver parameter"
   */
  export function fromJS(
    json: any,
    reviver?: (k: any, v: Iterable<any, any>) => any
  ): any;


  /**
   * Value equality check with semantics similar to `Object.is`, but treats
   * Immutable `Iterable`s as values, equal if the second `Iterable` includes
   * equivalent values.
   *
   * It's used throughout Immutable when checking for equality, including `Map`
   * key equality and `Set` membership.
   *
   *     var map1 = Immutable.Map({a:1, b:1, c:1});
   *     var map2 = Immutable.Map({a:1, b:1, c:1});
   *     assert(map1 !== map2);
   *     assert(Object.is(map1, map2) === false);
   *     assert(Immutable.is(map1, map2) === true);
   *
   * Note: Unlike `Object.is`, `Immutable.is` assumes `0` and `-0` are the same
   * value, matching the behavior of ES6 Map key equality.
   */
  export function is(first: any, second: any): boolean;


  /**
   * Lists are ordered indexed dense collections, much like a JavaScript
   * Array.
   *
   * Lists are immutable and fully persistent with O(log32 N) gets and sets,
   * and O(1) push and pop.
   *
   * Lists implement Deque, with efficient addition and removal from both the
   * end (`push`, `pop`) and beginning (`unshift`, `shift`).
   *
   * Unlike a JavaScript Array, there is no distinction between an
   * "unset" index and an index set to `undefined`. `List#forEach` visits all
   * indices from 0 to size, regardless of if they were explicitly defined.
   */
  export module List {

    /**
     * True if the provided value is a List
     */
    function isList(maybeList: any): boolean;

    /**
     * Creates a new List containing `values`.
     */
    function of<T>(...values: T[]): List<T>;
  }

  /**
   * Create a new immutable List containing the values of the provided
   * iterable-like.
   */
  export function List<T>(): List<T>;
  export function List<T>(iter: Iterable.Indexed<T>): List<T>;
  export function List<T>(iter: Iterable.Set<T>): List<T>;
  export function List<K, V>(iter: Iterable.Keyed<K, V>): List</*[K,V]*/any>;
  export function List<T>(array: Array<T>): List<T>;
  export function List<T>(iterator: Iterator<T>): List<T>;
  export function List<T>(iterable: /*Iterable<T>*/Object): List<T>;


  export interface List<T> extends Collection.Indexed<T> {

    // Persistent changes

    /**
     * Returns a new List which includes `value` at `index`. If `index` already
     * exists in this List, it will be replaced.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.set(-1, "value")` sets the last item in the List.
     *
     * If `index` larger than `size`, the returned List's `size` will be large
     * enough to include the `index`.
     */
    set(index: number, value: T): List<T>;

    /**
     * Returns a new List which excludes this `index` and with a size 1 less
     * than this List. Values at indices above `index` are shifted down by 1 to
     * fill the position.
     *
     * This is synonymous with `list.splice(index, 1)`.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.delete(-1)` deletes the last item in the List.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias remove
     */
    delete(index: number): List<T>;
    remove(index: number): List<T>;

    /**
     * Returns a new List with `value` at `index` with a size 1 more than this
     * List. Values at indices above `index` are shifted over by 1.
     *
     * This is synonymous with `list.splice(index, 0, value)
     */
    insert(index: number, value: T): List<T>;

    /**
     * Returns a new List with 0 size and no values.
     */
    clear(): List<T>;

    /**
     * Returns a new List with the provided `values` appended, starting at this
     * List's `size`.
     */
    push(...values: T[]): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the last index in this List.
     *
     * Note: this differs from `Array#pop` because it returns a new
     * List rather than the removed value. Use `last()` to get the last value
     * in this List.
     */
    pop(): List<T>;

    /**
     * Returns a new List with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     */
    unshift(...values: T[]): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the first index in this List, shifting all other values to a lower index.
     *
     * Note: this differs from `Array#shift` because it returns a new
     * List rather than the removed value. Use `first()` to get the first
     * value in this List.
     */
    shift(): List<T>;

    /**
     * Returns a new List with an updated value at `index` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * `index` was not set. If called with a single argument, `updater` is
     * called with the List itself.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.update(-1)` updates the last item in the List.
     *
     * @see `Map#update`
     */
    update(updater: (value: List<T>) => List<T>): List<T>;
    update(index: number, updater: (value: T) => T): List<T>;
    update(index: number, notSetValue: T, updater: (value: T) => T): List<T>;

    /**
     * @see `Map#merge`
     */
    merge(...iterables: Iterable.Indexed<T>[]): List<T>;
    merge(...iterables: Array<T>[]): List<T>;

    /**
     * @see `Map#mergeWith`
     */
    mergeWith(
      merger: (previous?: T, next?: T, key?: number) => T,
      ...iterables: Iterable.Indexed<T>[]
    ): List<T>;
    mergeWith(
      merger: (previous?: T, next?: T, key?: number) => T,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * @see `Map#mergeDeep`
     */
    mergeDeep(...iterables: Iterable.Indexed<T>[]): List<T>;
    mergeDeep(...iterables: Array<T>[]): List<T>;

    /**
     * @see `Map#mergeDeepWith`
     */
    mergeDeepWith(
      merger: (previous?: T, next?: T, key?: number) => T,
      ...iterables: Iterable.Indexed<T>[]
    ): List<T>;
    mergeDeepWith(
      merger: (previous?: T, next?: T, key?: number) => T,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * Returns a new List with size `size`. If `size` is less than this
     * List's size, the new List will exclude values at the higher indices.
     * If `size` is greater than this List's size, the new List will have
     * undefined values for the newly available indices.
     *
     * When building a new List and the final size is known up front, `setSize`
     * used in conjunction with `withMutations` may result in the more
     * performant construction.
     */
    setSize(size: number): List<T>;


    // Deep persistent changes

    /**
     * Returns a new List having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     *
     * Index numbers are used as keys to determine the path to follow in
     * the List.
     */
    setIn(keyPath: Array<any>, value: any): List<T>;
    setIn(keyPath: Iterable<any, any>, value: any): List<T>;

    /**
     * Returns a new List having removed the value at this `keyPath`. If any
     * keys in `keyPath` do not exist, no change will occur.
     *
     * @alias removeIn
     */
    deleteIn(keyPath: Array<any>): List<T>;
    deleteIn(keyPath: Iterable<any, any>): List<T>;
    removeIn(keyPath: Array<any>): List<T>;
    removeIn(keyPath: Iterable<any, any>): List<T>;

    /**
     * @see `Map#updateIn`
     */
    updateIn(
      keyPath: Array<any>,
      updater: (value: any) => any
    ): List<T>;
    updateIn(
      keyPath: Array<any>,
      notSetValue: any,
      updater: (value: any) => any
    ): List<T>;
    updateIn(
      keyPath: Iterable<any, any>,
      updater: (value: any) => any
    ): List<T>;
    updateIn(
      keyPath: Iterable<any, any>,
      notSetValue: any,
      updater: (value: any) => any
    ): List<T>;

    /**
     * @see `Map#mergeIn`
     */
    mergeIn(
      keyPath: Iterable<any, any>,
      ...iterables: Iterable.Indexed<T>[]
    ): List<T>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: Iterable.Indexed<T>[]
    ): List<T>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * @see `Map#mergeDeepIn`
     */
    mergeDeepIn(
      keyPath: Iterable<any, any>,
      ...iterables: Iterable.Indexed<T>[]
    ): List<T>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: Iterable.Indexed<T>[]
    ): List<T>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: Array<T>[]
    ): List<T>;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Only `set`, `push`, `pop`, `shift`, `unshift` and
     * `merge` may be used mutatively.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: List<T>) => any): List<T>;

    /**
     * @see `Map#asMutable`
     */
    asMutable(): List<T>;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): List<T>;
  }


  /**
   * Immutable Map is an unordered Iterable.Keyed of (key, value) pairs with
   * `O(log32 N)` gets and `O(log32 N)` persistent sets.
   *
   * Iteration order of a Map is undefined, however is stable. Multiple
   * iterations of the same Map will iterate in the same order.
   *
   * Map's keys can be of any type, and use `Immutable.is` to determine key
   * equality. This allows the use of any value (including NaN) as a key.
   *
   * Because `Immutable.is` returns equality based on value semantics, and
   * Immutable collections are treated as values, any Immutable collection may
   * be used as a key.
   *
   *     Map().set(List.of(1), 'listofone').get(List.of(1));
   *     // 'listofone'
   *
   * Any JavaScript object may be used as a key, however strict identity is used
   * to evaluate key equality. Two similar looking objects will represent two
   * different keys.
   *
   * Implemented by a hash-array mapped trie.
   */
  export module Map {

    /**
     * True if the provided value is a Map
     */
    function isMap(maybeMap: any): boolean;
  }

  /**
   * Creates a new Immutable Map.
   *
   * Created with the same key value pairs as the provided Iterable.Keyed or
   * JavaScript Object or expects an Iterable of [K, V] tuple entries.
   *
   *     var newMap = Map({key: "value"});
   *     var newMap = Map([["key", "value"]]);
   *
   * Keep in mind, when using JS objects to construct Immutable Maps, that
   * JavaScript Object properties are always strings, even if written in a
   * quote-less shorthand, while Immutable Maps accept keys of any type.
   *
   * ```js
   * var obj = { 1: "one" };
   * Object.keys(obj); // [ "1" ]
   * obj["1"]; // "one"
   * obj[1];   // "one"
   *
   * var map = Map(obj);
   * map.get("1"); // "one"
   * map.get(1);   // undefined
   * ```
   *
   * Property access for JavaScript Objects first converts the key to a string,
   * but since Immutable Map keys can be of any type the argument to `get()` is
   * not altered.
   */
  export function Map<K, V>(): Map<K, V>;
  export function Map<K, V>(iter: Iterable.Keyed<K, V>): Map<K, V>;
  export function Map<K, V>(iter: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<V>(obj: {[key: string]: V}): Map<string, V>;
  export function Map<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;

  export interface Map<K, V> extends Collection.Keyed<K, V> {

    // Persistent changes

    /**
     * Returns a new Map also containing the new key, value pair. If an equivalent
     * key already exists in this Map, it will be replaced.
     */
    set(key: K, value: V): Map<K, V>;

    /**
     * Returns a new Map which excludes this `key`.
     *
     * Note: `delete` cannot be safely used in IE8, but is provided to mirror
     * the ES6 collection API.
     * @alias remove
     */
    delete(key: K): Map<K, V>;
    remove(key: K): Map<K, V>;

    /**
     * Returns a new Map containing no keys or values.
     */
    clear(): Map<K, V>;

    /**
     * Returns a new Map having updated the value at this `key` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * the key was not set. If called with only a single argument, `updater` is
     * called with the Map itself.
     *
     * Equivalent to: `map.set(key, updater(map.get(key, notSetValue)))`.
     */
    update(updater: (value: Map<K, V>) => Map<K, V>): Map<K, V>;
    update(key: K, updater: (value: V) => V): Map<K, V>;
    update(key: K, notSetValue: V, updater: (value: V) => V): Map<K, V>;

    /**
     * Returns a new Map resulting from merging the provided Iterables
     * (or JS objects) into this Map. In other words, this takes each entry of
     * each iterable and sets it on this Map.
     *
     * If any of the values provided to `merge` are not Iterable (would return
     * false for `Immutable.Iterable.isIterable`) then they are deeply converted
     * via `Immutable.fromJS` before being merged. However, if the value is an
     * Iterable but includes non-iterable JS objects or arrays, those nested
     * values will be preserved.
     *
     *     var x = Immutable.Map({a: 10, b: 20, c: 30});
     *     var y = Immutable.Map({b: 40, a: 50, d: 60});
     *     x.merge(y) // { a: 50, b: 40, c: 30, d: 60 }
     *     y.merge(x) // { b: 20, a: 10, d: 60, c: 30 }
     *
     */
    merge(...iterables: Iterable<K, V>[]): Map<K, V>;
    merge(...iterables: {[key: string]: V}[]): Map<string, V>;

    /**
     * Like `merge()`, `mergeWith()` returns a new Map resulting from merging
     * the provided Iterables (or JS objects) into this Map, but uses the
     * `merger` function for dealing with conflicts.
     *
     *     var x = Immutable.Map({a: 10, b: 20, c: 30});
     *     var y = Immutable.Map({b: 40, a: 50, d: 60});
     *     x.mergeWith((prev, next) => prev / next, y) // { a: 0.2, b: 0.5, c: 30, d: 60 }
     *     y.mergeWith((prev, next) => prev / next, x) // { b: 2, a: 5, d: 60, c: 30 }
     *
     */
    mergeWith(
      merger: (previous?: V, next?: V, key?: K) => V,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeWith(
      merger: (previous?: V, next?: V, key?: K) => V,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * Like `merge()`, but when two Iterables conflict, it merges them as well,
     * recursing deeply through the nested data.
     *
     *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
     *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
     *     x.mergeDeep(y) // {a: { x: 2, y: 10 }, b: { x: 20, y: 5 }, c: { z: 3 } }
     *
     */
    mergeDeep(...iterables: Iterable<K, V>[]): Map<K, V>;
    mergeDeep(...iterables: {[key: string]: V}[]): Map<string, V>;

    /**
     * Like `mergeDeep()`, but when two non-Iterables conflict, it uses the
     * `merger` function to determine the resulting value.
     *
     *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
     *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
     *     x.mergeDeepWith((prev, next) => prev / next, y)
     *     // {a: { x: 5, y: 10 }, b: { x: 20, y: 10 }, c: { z: 3 } }
     *
     */
    mergeDeepWith(
      merger: (previous?: V, next?: V, key?: K) => V,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepWith(
      merger: (previous?: V, next?: V, key?: K) => V,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;


    // Deep persistent changes

    /**
     * Returns a new Map having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     */
    setIn(keyPath: Array<any>, value: any): Map<K, V>;
    setIn(KeyPath: Iterable<any, any>, value: any): Map<K, V>;

    /**
     * Returns a new Map having removed the value at this `keyPath`. If any keys
     * in `keyPath` do not exist, no change will occur.
     *
     * @alias removeIn
     */
    deleteIn(keyPath: Array<any>): Map<K, V>;
    deleteIn(keyPath: Iterable<any, any>): Map<K, V>;
    removeIn(keyPath: Array<any>): Map<K, V>;
    removeIn(keyPath: Iterable<any, any>): Map<K, V>;

    /**
     * Returns a new Map having applied the `updater` to the entry found at the
     * keyPath.
     *
     * If any keys in `keyPath` do not exist, new Immutable `Map`s will
     * be created at those keys. If the `keyPath` does not already contain a
     * value, the `updater` function will be called with `notSetValue`, if
     * provided, otherwise `undefined`.
     *
     *     var data = Immutable.fromJS({ a: { b: { c: 10 } } });
     *     data = data.updateIn(['a', 'b', 'c'], val => val * 2);
     *     // { a: { b: { c: 20 } } }
     *
     * If the `updater` function returns the same value it was called with, then
     * no change will occur. This is still true if `notSetValue` is provided.
     *
     *     var data1 = Immutable.fromJS({ a: { b: { c: 10 } } });
     *     data2 = data1.updateIn(['x', 'y', 'z'], 100, val => val);
     *     assert(data2 === data1);
     *
     */
    updateIn(
      keyPath: Array<any>,
      updater: (value: any) => any
    ): Map<K, V>;
    updateIn(
      keyPath: Array<any>,
      notSetValue: any,
      updater: (value: any) => any
    ): Map<K, V>;
    updateIn(
      keyPath: Iterable<any, any>,
      updater: (value: any) => any
    ): Map<K, V>;
    updateIn(
      keyPath: Iterable<any, any>,
      notSetValue: any,
      updater: (value: any) => any
    ): Map<K, V>;

    /**
     * A combination of `updateIn` and `merge`, returning a new Map, but
     * performing the merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     *     x.updateIn(['a', 'b', 'c'], abc => abc.merge(y));
     *     x.mergeIn(['a', 'b', 'c'], y);
     *
     */
    mergeIn(
      keyPath: Iterable<any, any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * A combination of `updateIn` and `mergeDeep`, returning a new Map, but
     * performing the deep merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     *     x.updateIn(['a', 'b', 'c'], abc => abc.mergeDeep(y));
     *     x.mergeDeepIn(['a', 'b', 'c'], y);
     *
     */
    mergeDeepIn(
      keyPath: Iterable<any, any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;


    // Transient changes

    /**
     * Every time you call one of the above functions, a new immutable Map is
     * created. If a pure function calls a number of these to produce a final
     * return value, then a penalty on performance and memory has been paid by
     * creating all of the intermediate immutable Maps.
     *
     * If you need to apply a series of mutations to produce a new immutable
     * Map, `withMutations()` creates a temporary mutable copy of the Map which
     * can apply mutations in a highly performant manner. In fact, this is
     * exactly how complex mutations like `merge` are done.
     *
     * As an example, this results in the creation of 2, not 4, new Maps:
     *
     *     var map1 = Immutable.Map();
     *     var map2 = map1.withMutations(map => {
     *       map.set('a', 1).set('b', 2).set('c', 3);
     *     });
     *     assert(map1.size === 0);
     *     assert(map2.size === 3);
     *
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Only `set` and `merge` may be used mutatively.
     *
     */
    withMutations(mutator: (mutable: Map<K, V>) => any): Map<K, V>;

    /**
     * Another way to avoid creation of intermediate Immutable maps is to create
     * a mutable copy of this collection. Mutable copies *always* return `this`,
     * and thus shouldn't be used for equality. Your function should never return
     * a mutable copy of a collection, only use it internally to create a new
     * collection. If possible, use `withMutations` as it provides an easier to
     * use API.
     *
     * Note: if the collection is already mutable, `asMutable` returns itself.
     *
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Only `set` and `merge` may be used mutatively.
     */
    asMutable(): Map<K, V>;

    /**
     * The yin to `asMutable`'s yang. Because it applies to mutable collections,
     * this operation is *mutable* and returns itself. Once performed, the mutable
     * copy has become immutable and can be safely returned from a function.
     */
    asImmutable(): Map<K, V>;
  }


  /**
   * A type of Map that has the additional guarantee that the iteration order of
   * entries will be the order in which they were set().
   *
   * The iteration behavior of OrderedMap is the same as native ES6 Map and
   * JavaScript Object.
   *
   * Note that `OrderedMap` are more expensive than non-ordered `Map` and may
   * consume more memory. `OrderedMap#set` is amortized O(log32 N), but not
   * stable.
   */

  export module OrderedMap {

    /**
     * True if the provided value is an OrderedMap.
     */
    function isOrderedMap(maybeOrderedMap: any): boolean;
  }

  /**
   * Creates a new Immutable OrderedMap.
   *
   * Created with the same key value pairs as the provided Iterable.Keyed or
   * JavaScript Object or expects an Iterable of [K, V] tuple entries.
   *
   * The iteration order of key-value pairs provided to this constructor will
   * be preserved in the OrderedMap.
   *
   *     var newOrderedMap = OrderedMap({key: "value"});
   *     var newOrderedMap = OrderedMap([["key", "value"]]);
   *
   */
  export function OrderedMap<K, V>(): OrderedMap<K, V>;
  export function OrderedMap<K, V>(iter: Iterable.Keyed<K, V>): OrderedMap<K, V>;
  export function OrderedMap<K, V>(iter: Iterable<any, /*[K,V]*/Array<any>>): OrderedMap<K, V>;
  export function OrderedMap<K, V>(array: Array</*[K,V]*/Array<any>>): OrderedMap<K, V>;
  export function OrderedMap<V>(obj: {[key: string]: V}): OrderedMap<string, V>;
  export function OrderedMap<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): OrderedMap<K, V>;
  export function OrderedMap<K, V>(iterable: /*Iterable<[K,V]>*/Object): OrderedMap<K, V>;

  export interface OrderedMap<K, V> extends Map<K, V> {}


  /**
   * A Collection of unique values with `O(log32 N)` adds and has.
   *
   * When iterating a Set, the entries will be (value, value) pairs. Iteration
   * order of a Set is undefined, however is stable. Multiple iterations of the
   * same Set will iterate in the same order.
   *
   * Set values, like Map keys, may be of any type. Equality is determined using
   * `Immutable.is`, enabling Sets to uniquely include other Immutable
   * collections, custom value types, and NaN.
   */
  export module Set {

    /**
     * True if the provided value is a Set
     */
    function isSet(maybeSet: any): boolean;

    /**
     * Creates a new Set containing `values`.
     */
    function of<T>(...values: T[]): Set<T>;

    /**
     * `Set.fromKeys()` creates a new immutable Set containing the keys from
     * this Iterable or JavaScript Object.
     */
    function fromKeys<T>(iter: Iterable<T, any>): Set<T>;
    function fromKeys(obj: {[key: string]: any}): Set<string>;
  }

  /**
   * Create a new immutable Set containing the values of the provided
   * iterable-like.
   */
  export function Set<T>(): Set<T>;
  export function Set<T>(iter: Iterable.Set<T>): Set<T>;
  export function Set<T>(iter: Iterable.Indexed<T>): Set<T>;
  export function Set<K, V>(iter: Iterable.Keyed<K, V>): Set</*[K,V]*/any>;
  export function Set<T>(array: Array<T>): Set<T>;
  export function Set<T>(iterator: Iterator<T>): Set<T>;
  export function Set<T>(iterable: /*Iterable<T>*/Object): Set<T>;

  export interface Set<T> extends Collection.Set<T> {

    // Persistent changes

    /**
     * Returns a new Set which also includes this value.
     */
    add(value: T): Set<T>;

    /**
     * Returns a new Set which excludes this value.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias remove
     */
    delete(value: T): Set<T>;
    remove(value: T): Set<T>;

    /**
     * Returns a new Set containing no values.
     */
    clear(): Set<T>;

    /**
     * Returns a Set including any value from `iterables` that does not already
     * exist in this Set.
     * @alias merge
     */
    union(...iterables: Iterable<any, T>[]): Set<T>;
    union(...iterables: Array<T>[]): Set<T>;
    merge(...iterables: Iterable<any, T>[]): Set<T>;
    merge(...iterables: Array<T>[]): Set<T>;


    /**
     * Returns a Set which has removed any values not also contained
     * within `iterables`.
     */
    intersect(...iterables: Iterable<any, T>[]): Set<T>;
    intersect(...iterables: Array<T>[]): Set<T>;

    /**
     * Returns a Set excluding any values contained within `iterables`.
     */
    subtract(...iterables: Iterable<any, T>[]): Set<T>;
    subtract(...iterables: Array<T>[]): Set<T>;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Only `add` may be used mutatively.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: Set<T>) => any): Set<T>;

    /**
     * @see `Map#asMutable`
     */
    asMutable(): Set<T>;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): Set<T>;
  }


  /**
   * A type of Set that has the additional guarantee that the iteration order of
   * values will be the order in which they were `add`ed.
   *
   * The iteration behavior of OrderedSet is the same as native ES6 Set.
   *
   * Note that `OrderedSet` are more expensive than non-ordered `Set` and may
   * consume more memory. `OrderedSet#add` is amortized O(log32 N), but not
   * stable.
   */
  export module OrderedSet {

    /**
     * True if the provided value is an OrderedSet.
     */
    function isOrderedSet(maybeOrderedSet: any): boolean;

    /**
     * Creates a new OrderedSet containing `values`.
     */
    function of<T>(...values: T[]): OrderedSet<T>;

    /**
     * `OrderedSet.fromKeys()` creates a new immutable OrderedSet containing
     * the keys from this Iterable or JavaScript Object.
     */
    function fromKeys<T>(iter: Iterable<T, any>): OrderedSet<T>;
    function fromKeys(obj: {[key: string]: any}): OrderedSet<string>;
  }

  /**
   * Create a new immutable OrderedSet containing the values of the provided
   * iterable-like.
   */
  export function OrderedSet<T>(): OrderedSet<T>;
  export function OrderedSet<T>(iter: Iterable.Set<T>): OrderedSet<T>;
  export function OrderedSet<T>(iter: Iterable.Indexed<T>): OrderedSet<T>;
  export function OrderedSet<K, V>(iter: Iterable.Keyed<K, V>): OrderedSet</*[K,V]*/any>;
  export function OrderedSet<T>(array: Array<T>): OrderedSet<T>;
  export function OrderedSet<T>(iterator: Iterator<T>): OrderedSet<T>;
  export function OrderedSet<T>(iterable: /*Iterable<T>*/Object): OrderedSet<T>;

  export interface OrderedSet<T> extends Set<T> {}


  /**
   * Stacks are indexed collections which support very efficient O(1) addition
   * and removal from the front using `unshift(v)` and `shift()`.
   *
   * For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but
   * be aware that they also operate on the front of the list, unlike List or
   * a JavaScript Array.
   *
   * Note: `reverse()` or any inherent reverse traversal (`reduceRight`,
   * `lastIndexOf`, etc.) is not efficient with a Stack.
   *
   * Stack is implemented with a Single-Linked List.
   */
  export module Stack {

    /**
     * True if the provided value is a Stack
     */
    function isStack(maybeStack: any): boolean;

    /**
     * Creates a new Stack containing `values`.
     */
    function of<T>(...values: T[]): Stack<T>;
  }

  /**
   * Create a new immutable Stack containing the values of the provided
   * iterable-like.
   *
   * The iteration order of the provided iterable is preserved in the
   * resulting `Stack`.
   */
  export function Stack<T>(): Stack<T>;
  export function Stack<T>(iter: Iterable.Indexed<T>): Stack<T>;
  export function Stack<T>(iter: Iterable.Set<T>): Stack<T>;
  export function Stack<K, V>(iter: Iterable.Keyed<K, V>): Stack</*[K,V]*/any>;
  export function Stack<T>(array: Array<T>): Stack<T>;
  export function Stack<T>(iterator: Iterator<T>): Stack<T>;
  export function Stack<T>(iterable: /*Iterable<T>*/Object): Stack<T>;

  export interface Stack<T> extends Collection.Indexed<T> {

    // Reading values

    /**
     * Alias for `Stack.first()`.
     */
    peek(): T;


    // Persistent changes

    /**
     * Returns a new Stack with 0 size and no values.
     */
    clear(): Stack<T>;

    /**
     * Returns a new Stack with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * This is very efficient for Stack.
     */
    unshift(...values: T[]): Stack<T>;

    /**
     * Like `Stack#unshift`, but accepts a iterable rather than varargs.
     */
    unshiftAll(iter: Iterable<any, T>): Stack<T>;
    unshiftAll(iter: Array<T>): Stack<T>;

    /**
     * Returns a new Stack with a size ones less than this Stack, excluding
     * the first item in this Stack, shifting all other values to a lower index.
     *
     * Note: this differs from `Array#shift` because it returns a new
     * Stack rather than the removed value. Use `first()` or `peek()` to get the
     * first value in this Stack.
     */
    shift(): Stack<T>;

    /**
     * Alias for `Stack#unshift` and is not equivalent to `List#push`.
     */
    push(...values: T[]): Stack<T>;

    /**
     * Alias for `Stack#unshiftAll`.
     */
    pushAll(iter: Iterable<any, T>): Stack<T>;
    pushAll(iter: Array<T>): Stack<T>;

    /**
     * Alias for `Stack#shift` and is not equivalent to `List#pop`.
     */
    pop(): Stack<T>;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Only `set`, `push`, and `pop` may be used mutatively.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: Stack<T>) => any): Stack<T>;

    /**
     * @see `Map#asMutable`
     */
    asMutable(): Stack<T>;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): Stack<T>;
  }


  /**
   * Returns a Seq.Indexed of numbers from `start` (inclusive) to `end`
   * (exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to
   * infinity. When `start` is equal to `end`, returns empty range.
   *
   *     Range() // [0,1,2,3,...]
   *     Range(10) // [10,11,12,13,...]
   *     Range(10,15) // [10,11,12,13,14]
   *     Range(10,30,5) // [10,15,20,25]
   *     Range(30,10,5) // [30,25,20,15]
   *     Range(30,30,5) // []
   *
   */
  export function Range(start?: number, end?: number, step?: number): Seq.Indexed<number>;


  /**
   * Returns a Seq.Indexed of `value` repeated `times` times. When `times` is
   * not defined, returns an infinite `Seq` of `value`.
   *
   *     Repeat('foo') // ['foo','foo','foo',...]
   *     Repeat('bar',4) // ['bar','bar','bar','bar']
   *
   */
  export function Repeat<T>(value: T, times?: number): Seq.Indexed<T>;


  /**
   * Creates a new Class which produces Record instances. A record is similar to
   * a JS object, but enforce a specific set of allowed string keys, and have
   * default values.
   *
   *     var ABRecord = Record({a:1, b:2})
   *     var myRecord = new ABRecord({b:3})
   *
   * Records always have a value for the keys they define. `remove`ing a key
   * from a record simply resets it to the default value for that key.
   *
   *     myRecord.size // 2
   *     myRecord.get('a') // 1
   *     myRecord.get('b') // 3
   *     myRecordWithoutB = myRecord.remove('b')
   *     myRecordWithoutB.get('b') // 2
   *     myRecordWithoutB.size // 2
   *
   * Values provided to the constructor not found in the Record type will
   * be ignored. For example, in this case, ABRecord is provided a key "x" even
   * though only "a" and "b" have been defined. The value for "x" will be
   * ignored for this record.
   *
   *     var myRecord = new ABRecord({b:3, x:10})
   *     myRecord.get('x') // undefined
   *
   * Because Records have a known set of string keys, property get access works
   * as expected, however property sets will throw an Error.
   *
   * Note: IE8 does not support property access. Only use `get()` when
   * supporting IE8.
   *
   *     myRecord.b // 3
   *     myRecord.b = 5 // throws Error
   *
   * Record Classes can be extended as well, allowing for custom methods on your
   * Record. This is not a common pattern in functional environments, but is in
   * many JS programs.
   *
   * Note: TypeScript does not support this type of subclassing.
   *
   *     class ABRecord extends Record({a:1,b:2}) {
   *       getAB() {
   *         return this.a + this.b;
   *       }
   *     }
   *
   *     var myRecord = new ABRecord({b: 3})
   *     myRecord.getAB() // 4
   *
   */
  export module Record {
    interface Class {
      new (): Map<string, any>;
      new (values: {[key: string]: any}): Map<string, any>;
      new (values: Iterable<string, any>): Map<string, any>; // deprecated

      (): Map<string, any>;
      (values: {[key: string]: any}): Map<string, any>;
      (values: Iterable<string, any>): Map<string, any>; // deprecated
    }
  }

  export function Record(
    defaultValues: {[key: string]: any}, name?: string
  ): Record.Class;


  /**
   * Represents a sequence of values, but may not be backed by a concrete data
   * structure.
   *
   * **Seq is immutable** — Once a Seq is created, it cannot be
   * changed, appended to, rearranged or otherwise modified. Instead, any
   * mutative method called on a `Seq` will return a new `Seq`.
   *
   * **Seq is lazy** — Seq does as little work as necessary to respond to any
   * method call. Values are often created during iteration, including implicit
   * iteration when reducing or converting to a concrete data structure such as
   * a `List` or JavaScript `Array`.
   *
   * For example, the following performs no work, because the resulting
   * Seq's values are never iterated:
   *
   *     var oddSquares = Immutable.Seq.of(1,2,3,4,5,6,7,8)
   *       .filter(x => x % 2).map(x => x * x);
   *
   * Once the Seq is used, it performs only the work necessary. In this
   * example, no intermediate data structures are ever created, filter is only
   * called three times, and map is only called once:
   *
   *     console.log(evenSquares.get(1)); // 9
   *
   * Seq allows for the efficient chaining of operations,
   * allowing for the expression of logic that can otherwise be very tedious:
   *
   *     Immutable.Seq({a:1, b:1, c:1})
   *       .flip().map(key => key.toUpperCase()).flip().toObject();
   *     // Map { A: 1, B: 1, C: 1 }
   *
   * As well as expressing logic that would otherwise be memory or time limited:
   *
   *     Immutable.Range(1, Infinity)
   *       .skip(1000)
   *       .map(n => -n)
   *       .filter(n => n % 2 === 0)
   *       .take(2)
   *       .reduce((r, n) => r * n, 1);
   *     // 1006008
   *
   * Seq is often used to provide a rich collection API to JavaScript Object.
   *
   *     Immutable.Seq({ x: 0, y: 1, z: 2 }).map(v => v * 2).toObject();
   *     // { x: 0, y: 2, z: 4 }
   */

  export module Seq {
    /**
     * True if `maybeSeq` is a Seq, it is not backed by a concrete
     * structure such as Map, List, or Set.
     */
    function isSeq(maybeSeq: any): boolean;

    /**
     * Returns a Seq of the values provided. Alias for `Seq.Indexed.of()`.
     */
    function of<T>(...values: T[]): Seq.Indexed<T>;


    /**
     * `Seq` which represents key-value pairs.
     */
    export module Keyed {}

    /**
     * Always returns a Seq.Keyed, if input is not keyed, expects an
     * iterable of [K, V] tuples.
     */
    export function Keyed<K, V>(): Seq.Keyed<K, V>;
    export function Keyed<K, V>(seq: Iterable.Keyed<K, V>): Seq.Keyed<K, V>;
    export function Keyed<K, V>(seq: Iterable<any, /*[K,V]*/any>): Seq.Keyed<K, V>;
    export function Keyed<K, V>(array: Array</*[K,V]*/any>): Seq.Keyed<K, V>;
    export function Keyed<V>(obj: {[key: string]: V}): Seq.Keyed<string, V>;
    export function Keyed<K, V>(iterator: Iterator</*[K,V]*/any>): Seq.Keyed<K, V>;
    export function Keyed<K, V>(iterable: /*Iterable<[K,V]>*/Object): Seq.Keyed<K, V>;

    export interface Keyed<K, V> extends Seq<K, V>, Iterable.Keyed<K, V> {

      /**
       * Returns itself
       */
      toSeq(): /*this*/Seq.Keyed<K, V>
    }


    /**
     * `Seq` which represents an ordered indexed list of values.
     */
    module Indexed {

      /**
       * Provides an Seq.Indexed of the values provided.
       */
      function of<T>(...values: T[]): Seq.Indexed<T>;
    }

    /**
     * Always returns Seq.Indexed, discarding associated keys and
     * supplying incrementing indices.
     */
    export function Indexed<T>(): Seq.Indexed<T>;
    export function Indexed<T>(seq: Iterable.Indexed<T>): Seq.Indexed<T>;
    export function Indexed<T>(seq: Iterable.Set<T>): Seq.Indexed<T>;
    export function Indexed<K, V>(seq: Iterable.Keyed<K, V>): Seq.Indexed</*[K,V]*/any>;
    export function Indexed<T>(array: Array<T>): Seq.Indexed<T>;
    export function Indexed<T>(iterator: Iterator<T>): Seq.Indexed<T>;
    export function Indexed<T>(iterable: /*Iterable<T>*/Object): Seq.Indexed<T>;

    export interface Indexed<T> extends Seq<number, T>, Iterable.Indexed<T> {

      /**
       * Returns itself
       */
      toSeq(): /*this*/Seq.Indexed<T>
    }


    /**
     * `Seq` which represents a set of values.
     *
     * Because `Seq` are often lazy, `Seq.Set` does not provide the same guarantee
     * of value uniqueness as the concrete `Set`.
     */
    export module Set {

      /**
       * Returns a Seq.Set of the provided values
       */
      function of<T>(...values: T[]): Seq.Set<T>;
    }

    /**
     * Always returns a Seq.Set, discarding associated indices or keys.
     */
    export function Set<T>(): Seq.Set<T>;
    export function Set<T>(seq: Iterable.Set<T>): Seq.Set<T>;
    export function Set<T>(seq: Iterable.Indexed<T>): Seq.Set<T>;
    export function Set<K, V>(seq: Iterable.Keyed<K, V>): Seq.Set</*[K,V]*/any>;
    export function Set<T>(array: Array<T>): Seq.Set<T>;
    export function Set<T>(iterator: Iterator<T>): Seq.Set<T>;
    export function Set<T>(iterable: /*Iterable<T>*/Object): Seq.Set<T>;

    export interface Set<T> extends Seq<T, T>, Iterable.Set<T> {

      /**
       * Returns itself
       */
      toSeq(): /*this*/Seq.Set<T>
    }

  }

  /**
   * Creates a Seq.
   *
   * Returns a particular kind of `Seq` based on the input.
   *
   *   * If a `Seq`, that same `Seq`.
   *   * If an `Iterable`, a `Seq` of the same kind (Keyed, Indexed, or Set).
   *   * If an Array-like, an `Seq.Indexed`.
   *   * If an Object with an Iterator, an `Seq.Indexed`.
   *   * If an Iterator, an `Seq.Indexed`.
   *   * If an Object, a `Seq.Keyed`.
   *
   */
  export function Seq<K, V>(): Seq<K, V>;
  export function Seq<K, V>(seq: Seq<K, V>): Seq<K, V>;
  export function Seq<K, V>(iterable: Iterable<K, V>): Seq<K, V>;
  export function Seq<T>(array: Array<T>): Seq.Indexed<T>;
  export function Seq<V>(obj: {[key: string]: V}): Seq.Keyed<string, V>;
  export function Seq<T>(iterator: Iterator<T>): Seq.Indexed<T>;
  export function Seq<T>(iterable: /*ES6Iterable<T>*/Object): Seq.Indexed<T>;

  export interface Seq<K, V> extends Iterable<K, V> {

    /**
     * Some Seqs can describe their size lazily. When this is the case,
     * size will be an integer. Otherwise it will be undefined.
     *
     * For example, Seqs returned from `map()` or `reverse()`
     * preserve the size of the original `Seq` while `filter()` does not.
     *
     * Note: `Range`, `Repeat` and `Seq`s made from `Array`s and `Object`s will
     * always have a size.
     */
    size: number/*?*/;


    // Force evaluation

    /**
     * Because Sequences are lazy and designed to be chained together, they do
     * not cache their results. For example, this map function is called a total
     * of 6 times, as each `join` iterates the Seq of three values.
     *
     *     var squares = Seq.of(1,2,3).map(x => x * x);
     *     squares.join() + squares.join();
     *
     * If you know a `Seq` will be used multiple times, it may be more
     * efficient to first cache it in memory. Here, the map function is called
     * only 3 times.
     *
     *     var squares = Seq.of(1,2,3).map(x => x * x).cacheResult();
     *     squares.join() + squares.join();
     *
     * Use this method judiciously, as it must fully evaluate a Seq which can be
     * a burden on memory and possibly performance.
     *
     * Note: after calling `cacheResult`, a Seq will always have a `size`.
     */
    cacheResult(): /*this*/Seq<K, V>;
  }

  /**
   * The `Iterable` is a set of (key, value) entries which can be iterated, and
   * is the base class for all collections in `immutable`, allowing them to
   * make use of all the Iterable methods (such as `map` and `filter`).
   *
   * Note: An iterable is always iterated in the same order, however that order
   * may not always be well defined, as is the case for the `Map` and `Set`.
   */
  export module Iterable {
    /**
     * True if `maybeIterable` is an Iterable, or any of its subclasses.
     */
    function isIterable(maybeIterable: any): boolean;

    /**
     * True if `maybeKeyed` is an Iterable.Keyed, or any of its subclasses.
     */
    function isKeyed(maybeKeyed: any): boolean;

    /**
     * True if `maybeIndexed` is a Iterable.Indexed, or any of its subclasses.
     */
    function isIndexed(maybeIndexed: any): boolean;

    /**
     * True if `maybeAssociative` is either a keyed or indexed Iterable.
     */
    function isAssociative(maybeAssociative: any): boolean;

    /**
     * True if `maybeOrdered` is an Iterable where iteration order is well
     * defined. True for Iterable.Indexed as well as OrderedMap and OrderedSet.
     */
    function isOrdered(maybeOrdered: any): boolean;


    /**
     * Keyed Iterables have discrete keys tied to each value.
     *
     * When iterating `Iterable.Keyed`, each iteration will yield a `[K, V]`
     * tuple, in other words, `Iterable#entries` is the default iterator for
     * Keyed Iterables.
     */
    export module Keyed {}

    /**
     * Creates an Iterable.Keyed
     *
     * Similar to `Iterable()`, however it expects iterable-likes of [K, V]
     * tuples if not constructed from a Iterable.Keyed or JS Object.
     */
    export function Keyed<K, V>(iter: Iterable.Keyed<K, V>): Iterable.Keyed<K, V>;
    export function Keyed<K, V>(iter: Iterable<any, /*[K,V]*/any>): Iterable.Keyed<K, V>;
    export function Keyed<K, V>(array: Array</*[K,V]*/any>): Iterable.Keyed<K, V>;
    export function Keyed<V>(obj: {[key: string]: V}): Iterable.Keyed<string, V>;
    export function Keyed<K, V>(iterator: Iterator</*[K,V]*/any>): Iterable.Keyed<K, V>;
    export function Keyed<K, V>(iterable: /*Iterable<[K,V]>*/Object): Iterable.Keyed<K, V>;

    export interface Keyed<K, V> extends Iterable<K, V> {

      /**
       * Returns Seq.Keyed.
       * @override
       */
      toSeq(): Seq.Keyed<K, V>;


      // Sequence functions

      /**
       * Returns a new Iterable.Keyed of the same type where the keys and values
       * have been flipped.
       *
       *     Seq({ a: 'z', b: 'y' }).flip() // { z: 'a', y: 'b' }
       *
       */
      flip(): /*this*/Iterable.Keyed<V, K>;

      /**
       * Returns a new Iterable.Keyed of the same type with keys passed through
       * a `mapper` function.
       *
       *     Seq({ a: 1, b: 2 })
       *       .mapKeys(x => x.toUpperCase())
       *     // Seq { A: 1, B: 2 }
       *
       */
      mapKeys<M>(
        mapper: (key?: K, value?: V, iter?: /*this*/Iterable.Keyed<K, V>) => M,
        context?: any
      ): /*this*/Iterable.Keyed<M, V>;

      /**
       * Returns a new Iterable.Keyed of the same type with entries
       * ([key, value] tuples) passed through a `mapper` function.
       *
       *     Seq({ a: 1, b: 2 })
       *       .mapEntries(([k, v]) => [k.toUpperCase(), v * 2])
       *     // Seq { A: 2, B: 4 }
       *
       */
      mapEntries<KM, VM>(
        mapper: (
          entry?: /*(K, V)*/Array<any>,
          index?: number,
          iter?: /*this*/Iterable.Keyed<K, V>
        ) => /*[KM, VM]*/Array<any>,
        context?: any
      ): /*this*/Iterable.Keyed<KM, VM>;


      // Search for value

      /**
       * Returns the key associated with the search value, or undefined.
       */
      keyOf(searchValue: V): K;

      /**
       * Returns the last key associated with the search value, or undefined.
       */
      lastKeyOf(searchValue: V): K;

      /**
       * Returns the key for which the `predicate` returns true.
       */
      findKey(
        predicate: (value?: V, key?: K, iter?: /*this*/Iterable.Keyed<K, V>) => boolean,
        context?: any
      ): K;

      /**
       * Returns the last key for which the `predicate` returns true.
       *
       * Note: `predicate` will be called for each entry in reverse.
       */
      findLastKey(
        predicate: (value?: V, key?: K, iter?: /*this*/Iterable.Keyed<K, V>) => boolean,
        context?: any
      ): K;
    }


    /**
     * Indexed Iterables have incrementing numeric keys. They exhibit
     * slightly different behavior than `Iterable.Keyed` for some methods in order
     * to better mirror the behavior of JavaScript's `Array`, and add methods
     * which do not make sense on non-indexed Iterables such as `indexOf`.
     *
     * Unlike JavaScript arrays, `Iterable.Indexed`s are always dense. "Unset"
     * indices and `undefined` indices are indistinguishable, and all indices from
     * 0 to `size` are visited when iterated.
     *
     * All Iterable.Indexed methods return re-indexed Iterables. In other words,
     * indices always start at 0 and increment until size. If you wish to
     * preserve indices, using them as keys, convert to a Iterable.Keyed by
     * calling `toKeyedSeq`.
     */
    export module Indexed {}

    /**
     * Creates a new Iterable.Indexed.
     */
    export function Indexed<T>(iter: Iterable.Indexed<T>): Iterable.Indexed<T>;
    export function Indexed<T>(iter: Iterable.Set<T>): Iterable.Indexed<T>;
    export function Indexed<K, V>(iter: Iterable.Keyed<K, V>): Iterable.Indexed</*[K,V]*/any>;
    export function Indexed<T>(array: Array<T>): Iterable.Indexed<T>;
    export function Indexed<T>(iterator: Iterator<T>): Iterable.Indexed<T>;
    export function Indexed<T>(iterable: /*Iterable<T>*/Object): Iterable.Indexed<T>;

    export interface Indexed<T> extends Iterable<number, T> {

      // Reading values

      /**
       * Returns the value associated with the provided index, or notSetValue if
       * the index is beyond the bounds of the Iterable.
       *
       * `index` may be a negative number, which indexes back from the end of the
       * Iterable. `s.get(-1)` gets the last item in the Iterable.
       */
      get(index: number, notSetValue?: T): T;


      // Conversion to Seq

      /**
       * Returns Seq.Indexed.
       * @override
       */
      toSeq(): Seq.Indexed<T>;

      /**
       * If this is an iterable of [key, value] entry tuples, it will return a
       * Seq.Keyed of those entries.
       */
      fromEntrySeq(): Seq.Keyed<any, any>;


      // Combination

      /**
       * Returns an Iterable of the same type with `separator` between each item
       * in this Iterable.
       */
      interpose(separator: T): /*this*/Iterable.Indexed<T>;

      /**
       * Returns an Iterable of the same type with the provided `iterables`
       * interleaved into this iterable.
       *
       * The resulting Iterable includes the first item from each, then the
       * second from each, etc.
       *
       *     I.Seq.of(1,2,3).interleave(I.Seq.of('A','B','C'))
       *     // Seq [ 1, 'A', 2, 'B', 3, 'C' ]
       *
       * The shortest Iterable stops interleave.
       *
       *     I.Seq.of(1,2,3).interleave(
       *       I.Seq.of('A','B'),
       *       I.Seq.of('X','Y','Z')
       *     )
       *     // Seq [ 1, 'A', 'X', 2, 'B', 'Y' ]
       */
      interleave(...iterables: Array<Iterable<any, T>>): /*this*/Iterable.Indexed<T>;

      /**
       * Splice returns a new indexed Iterable by replacing a region of this
       * Iterable with new values. If values are not provided, it only skips the
       * region to be removed.
       *
       * `index` may be a negative number, which indexes back from the end of the
       * Iterable. `s.splice(-2)` splices after the second to last item.
       *
       *     Seq(['a','b','c','d']).splice(1, 2, 'q', 'r', 's')
       *     // Seq ['a', 'q', 'r', 's', 'd']
       *
       */
      splice(
        index: number,
        removeNum: number,
        ...values: /*Array<Iterable.Indexed<T> | T>*/any[]
      ): /*this*/Iterable.Indexed<T>;

      /**
       * Returns an Iterable of the same type "zipped" with the provided
       * iterables.
       *
       * Like `zipWith`, but using the default `zipper`: creating an `Array`.
       *
       *     var a = Seq.of(1, 2, 3);
       *     var b = Seq.of(4, 5, 6);
       *     var c = a.zip(b); // Seq [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
       *
       */
      zip(...iterables: Array<Iterable<any, any>>): /*this*/Iterable.Indexed<any>;

      /**
       * Returns an Iterable of the same type "zipped" with the provided
       * iterables by using a custom `zipper` function.
       *
       *     var a = Seq.of(1, 2, 3);
       *     var b = Seq.of(4, 5, 6);
       *     var c = a.zipWith((a, b) => a + b, b); // Seq [ 5, 7, 9 ]
       *
       */
      zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherIterable: Iterable<any, U>
      ): Iterable.Indexed<Z>;
      zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherIterable: Iterable<any, U>,
        thirdIterable: Iterable<any, V>
      ): Iterable.Indexed<Z>;
      zipWith<Z>(
        zipper: (...any: Array<any>) => Z,
        ...iterables: Array<Iterable<any, any>>
      ): Iterable.Indexed<Z>;


      // Search for value

      /**
       * Returns the first index at which a given value can be found in the
       * Iterable, or -1 if it is not present.
       */
      indexOf(searchValue: T): number;

      /**
       * Returns the last index at which a given value can be found in the
       * Iterable, or -1 if it is not present.
       */
      lastIndexOf(searchValue: T): number;

      /**
       * Returns the first index in the Iterable where a value satisfies the
       * provided predicate function. Otherwise -1 is returned.
       */
      findIndex(
        predicate: (value?: T, index?: number, iter?: /*this*/Iterable.Indexed<T>) => boolean,
        context?: any
      ): number;

      /**
       * Returns the last index in the Iterable where a value satisfies the
       * provided predicate function. Otherwise -1 is returned.
       */
      findLastIndex(
        predicate: (value?: T, index?: number, iter?: /*this*/Iterable.Indexed<T>) => boolean,
        context?: any
      ): number;
    }


    /**
     * Set Iterables only represent values. They have no associated keys or
     * indices. Duplicate values are possible in Seq.Sets, however the
     * concrete `Set` does not allow duplicate values.
     *
     * Iterable methods on Iterable.Set such as `map` and `forEach` will provide
     * the value as both the first and second arguments to the provided function.
     *
     *     var seq = Seq.Set.of('A', 'B', 'C');
     *     assert.equal(seq.every((v, k) => v === k), true);
     *
     */
    export module Set {}

    /**
     * Similar to `Iterable()`, but always returns a Iterable.Set.
     */
    export function Set<T>(iter: Iterable.Set<T>): Iterable.Set<T>;
    export function Set<T>(iter: Iterable.Indexed<T>): Iterable.Set<T>;
    export function Set<K, V>(iter: Iterable.Keyed<K, V>): Iterable.Set</*[K,V]*/any>;
    export function Set<T>(array: Array<T>): Iterable.Set<T>;
    export function Set<T>(iterator: Iterator<T>): Iterable.Set<T>;
    export function Set<T>(iterable: /*Iterable<T>*/Object): Iterable.Set<T>;

    export interface Set<T> extends Iterable<T, T> {

      /**
       * Returns Seq.Set.
       * @override
       */
      toSeq(): Seq.Set<T>;
    }

  }

  /**
   * Creates an Iterable.
   *
   * The type of Iterable created is based on the input.
   *
   *   * If an `Iterable`, that same `Iterable`.
   *   * If an Array-like, an `Iterable.Indexed`.
   *   * If an Object with an Iterator, an `Iterable.Indexed`.
   *   * If an Iterator, an `Iterable.Indexed`.
   *   * If an Object, an `Iterable.Keyed`.
   *
   * This methods forces the conversion of Objects and Strings to Iterables.
   * If you want to ensure that a Iterable of one item is returned, use
   * `Seq.of`.
   */
  export function Iterable<K, V>(iterable: Iterable<K, V>): Iterable<K, V>;
  export function Iterable<T>(array: Array<T>): Iterable.Indexed<T>;
  export function Iterable<V>(obj: {[key: string]: V}): Iterable.Keyed<string, V>;
  export function Iterable<T>(iterator: Iterator<T>): Iterable.Indexed<T>;
  export function Iterable<T>(iterable: /*ES6Iterable<T>*/Object): Iterable.Indexed<T>;
  export function Iterable<V>(value: V): Iterable.Indexed<V>;

  export interface Iterable<K, V> {

    // Value equality

    /**
     * True if this and the other Iterable have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: Iterable<K, V>): boolean;

    /**
     * Computes and returns the hashed identity for this Iterable.
     *
     * The `hashCode` of an Iterable is used to determine potential equality,
     * and is used when adding this to a `Set` or as a key in a `Map`, enabling
     * lookup via a different instance.
     *
     *     var a = List.of(1, 2, 3);
     *     var b = List.of(1, 2, 3);
     *     assert(a !== b); // different instances
     *     var set = Set.of(a);
     *     assert(set.has(b) === true);
     *
     * If two values have the same `hashCode`, they are [not guaranteed
     * to be equal][Hash Collision]. If two values have different `hashCode`s,
     * they must not be equal.
     *
     * [Hash Collision]: http://en.wikipedia.org/wiki/Collision_(computer_science)
     */
    hashCode(): number;


    // Reading values

    /**
     * Returns the value associated with the provided key, or notSetValue if
     * the Iterable does not contain this key.
     *
     * Note: it is possible a key may be associated with an `undefined` value,
     * so if `notSetValue` is not provided and this method returns `undefined`,
     * that does not guarantee the key was not found.
     */
    get(key: K, notSetValue?: V): V;

    /**
     * True if a key exists within this `Iterable`.
     */
    has(key: K): boolean;

    /**
     * True if a value exists within this `Iterable`.
     * @alias contains
     */
    includes(value: V): boolean;
    contains(value: V): boolean;

    /**
     * The first value in the Iterable.
     */
    first(): V;

    /**
     * The last value in the Iterable.
     */
    last(): V;


    // Reading deep values

    /**
     * Returns the value found by following a path of keys or indices through
     * nested Iterables.
     */
    getIn(searchKeyPath: Array<any>, notSetValue?: any): any;
    getIn(searchKeyPath: Iterable<any, any>, notSetValue?: any): any;

    /**
     * True if the result of following a path of keys or indices through nested
     * Iterables results in a set value.
     */
    hasIn(searchKeyPath: Array<any>): boolean;
    hasIn(searchKeyPath: Iterable<any, any>): boolean;


    // Conversion to JavaScript types

    /**
     * Deeply converts this Iterable to equivalent JS.
     *
     * `Iterable.Indexeds`, and `Iterable.Sets` become Arrays, while
     * `Iterable.Keyeds` become Objects.
     *
     * @alias toJSON
     */
    toJS(): any;

    /**
     * Shallowly converts this iterable to an Array, discarding keys.
     */
    toArray(): Array<V>;

    /**
     * Shallowly converts this Iterable to an Object.
     *
     * Throws if keys are not strings.
     */
    toObject(): { [key: string]: V };


    // Conversion to Collections

    /**
     * Converts this Iterable to a Map, Throws if keys are not hashable.
     *
     * Note: This is equivalent to `Map(this.toKeyedSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toMap(): Map<K, V>;

    /**
     * Converts this Iterable to a Map, maintaining the order of iteration.
     *
     * Note: This is equivalent to `OrderedMap(this.toKeyedSeq())`, but
     * provided for convenience and to allow for chained expressions.
     */
    toOrderedMap(): Map<K, V>;

    /**
     * Converts this Iterable to a Set, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Set(this)`, but provided to allow for
     * chained expressions.
     */
    toSet(): Set<V>;

    /**
     * Converts this Iterable to a Set, maintaining the order of iteration and
     * discarding keys.
     *
     * Note: This is equivalent to `OrderedSet(this.valueSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toOrderedSet(): Set<V>;

    /**
     * Converts this Iterable to a List, discarding keys.
     *
     * Note: This is equivalent to `List(this)`, but provided to allow
     * for chained expressions.
     */
    toList(): List<V>;

    /**
     * Converts this Iterable to a Stack, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Stack(this)`, but provided to allow for
     * chained expressions.
     */
    toStack(): Stack<V>;


    // Conversion to Seq

    /**
     * Converts this Iterable to a Seq of the same kind (indexed,
     * keyed, or set).
     */
    toSeq(): Seq<K, V>;

    /**
     * Returns a Seq.Keyed from this Iterable where indices are treated as keys.
     *
     * This is useful if you want to operate on an
     * Iterable.Indexed and preserve the [index, value] pairs.
     *
     * The returned Seq will have identical iteration order as
     * this Iterable.
     *
     * Example:
     *
     *     var indexedSeq = Immutable.Seq.of('A', 'B', 'C');
     *     indexedSeq.filter(v => v === 'B').toString() // Seq [ 'B' ]
     *     var keyedSeq = indexedSeq.toKeyedSeq();
     *     keyedSeq.filter(v => v === 'B').toString() // Seq { 1: 'B' }
     *
     */
    toKeyedSeq(): Seq.Keyed<K, V>;

    /**
     * Returns an Seq.Indexed of the values of this Iterable, discarding keys.
     */
    toIndexedSeq(): Seq.Indexed<V>;

    /**
     * Returns a Seq.Set of the values of this Iterable, discarding keys.
     */
    toSetSeq(): Seq.Set<V>;


    // Iterators

    /**
     * An iterator of this `Iterable`'s keys.
     */
    keys(): Iterator<K>;

    /**
     * An iterator of this `Iterable`'s values.
     */
    values(): Iterator<V>;

    /**
     * An iterator of this `Iterable`'s entries as `[key, value]` tuples.
     */
    entries(): Iterator</*[K, V]*/Array<any>>;


    // Iterables (Seq)

    /**
     * Returns a new Seq.Indexed of the keys of this Iterable,
     * discarding values.
     */
    keySeq(): Seq.Indexed<K>;

    /**
     * Returns an Seq.Indexed of the values of this Iterable, discarding keys.
     */
    valueSeq(): Seq.Indexed<V>;

    /**
     * Returns a new Seq.Indexed of [key, value] tuples.
     */
    entrySeq(): Seq.Indexed</*(K, V)*/Array<any>>;


    // Sequence algorithms

    /**
     * Returns a new Iterable of the same type with values passed through a
     * `mapper` function.
     *
     *     Seq({ a: 1, b: 2 }).map(x => 10 * x)
     *     // Seq { a: 10, b: 20 }
     *
     */
    map<M>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => M,
      context?: any
    ): /*this*/Iterable<K, M>;

    /**
     * Returns a new Iterable of the same type with only the entries for which
     * the `predicate` function returns true.
     *
     *     Seq({a:1,b:2,c:3,d:4}).filter(x => x % 2 === 0)
     *     // Seq { b: 2, d: 4 }
     *
     */
    filter(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type with only the entries for which
     * the `predicate` function returns false.
     *
     *     Seq({a:1,b:2,c:3,d:4}).filterNot(x => x % 2 === 0)
     *     // Seq { a: 1, c: 3 }
     *
     */
    filterNot(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type in reverse order.
     */
    reverse(): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes the same entries,
     * stably sorted by using a `comparator`.
     *
     * If a `comparator` is not provided, a default comparator uses `<` and `>`.
     *
     * `comparator(valueA, valueB)`:
     *
     *   * Returns `0` if the elements should not be swapped.
     *   * Returns `-1` (or any negative number) if `valueA` comes before `valueB`
     *   * Returns `1` (or any positive number) if `valueA` comes after `valueB`
     *   * Is pure, i.e. it must always return the same value for the same pair
     *     of values.
     *
     * When sorting collections which have no defined order, their ordered
     * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
     */
    sort(comparator?: (valueA: V, valueB: V) => number): /*this*/Iterable<K, V>;

    /**
     * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
     * sorting by more sophisticated means:
     *
     *     hitters.sortBy(hitter => hitter.avgHits);
     *
     */
    sortBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a `Iterable.Keyed` of `Iterable.Keyeds`, grouped by the return
     * value of the `grouper` function.
     *
     * Note: This is always an eager operation.
     */
    groupBy<G>(
      grouper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => G,
      context?: any
    ): /*Map*/Seq.Keyed<G, /*this*/Iterable<K, V>>;


    // Side effects

    /**
     * The `sideEffect` is executed for every entry in the Iterable.
     *
     * Unlike `Array#forEach`, if any call of `sideEffect` returns
     * `false`, the iteration will stop. Returns the number of entries iterated
     * (including the last iteration which returned false).
     */
    forEach(
      sideEffect: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => any,
      context?: any
    ): number;


    // Creating subsets

    /**
     * Returns a new Iterable of the same type representing a portion of this
     * Iterable from start up to but not including end.
     *
     * If begin is negative, it is offset from the end of the Iterable. e.g.
     * `slice(-2)` returns a Iterable of the last two entries. If it is not
     * provided the new Iterable will begin at the beginning of this Iterable.
     *
     * If end is negative, it is offset from the end of the Iterable. e.g.
     * `slice(0, -1)` returns an Iterable of everything but the last entry. If
     * it is not provided, the new Iterable will continue through the end of
     * this Iterable.
     *
     * If the requested slice is equivalent to the current Iterable, then it
     * will return itself.
     */
    slice(begin?: number, end?: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type containing all entries except
     * the first.
     */
    rest(): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type containing all entries except
     * the last.
     */
    butLast(): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which excludes the first `amount`
     * entries from this Iterable.
     */
    skip(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which excludes the last `amount`
     * entries from this Iterable.
     */
    skipLast(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes entries starting
     * from when `predicate` first returns false.
     *
     *     Seq.of('dog','frog','cat','hat','god')
     *       .skipWhile(x => x.match(/g/))
     *     // Seq [ 'cat', 'hat', 'god' ]
     *
     */
    skipWhile(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes entries starting
     * from when `predicate` first returns true.
     *
     *     Seq.of('dog','frog','cat','hat','god')
     *       .skipUntil(x => x.match(/hat/))
     *     // Seq [ 'hat', 'god' ]
     *
     */
    skipUntil(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes the first `amount`
     * entries from this Iterable.
     */
    take(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes the last `amount`
     * entries from this Iterable.
     */
    takeLast(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes entries from this
     * Iterable as long as the `predicate` returns true.
     *
     *     Seq.of('dog','frog','cat','hat','god')
     *       .takeWhile(x => x.match(/o/))
     *     // Seq [ 'dog', 'frog' ]
     *
     */
    takeWhile(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which includes entries from this
     * Iterable as long as the `predicate` returns false.
     *
     *     Seq.of('dog','frog','cat','hat','god').takeUntil(x => x.match(/at/))
     *     // ['dog', 'frog']
     *
     */
    takeUntil(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;


    // Combination

    /**
     * Returns a new Iterable of the same type with other values and
     * iterable-like concatenated to this one.
     *
     * For Seqs, all entries will be present in
     * the resulting iterable, even if they have the same key.
     */
    concat(...valuesOrIterables: /*Array<Iterable<K, V>|V*/any[]): /*this*/Iterable<K, V>;

    /**
     * Flattens nested Iterables.
     *
     * Will deeply flatten the Iterable by default, returning an Iterable of the
     * same type, but a `depth` can be provided in the form of a number or
     * boolean (where true means to shallowly flatten one level). A depth of 0
     * (or shallow: false) will deeply flatten.
     *
     * Flattens only others Iterable, not Arrays or Objects.
     *
     * Note: `flatten(true)` operates on Iterable<any, Iterable<K, V>> and
     * returns Iterable<K, V>
     */
    flatten(depth?: number): /*this*/Iterable<any, any>;
    flatten(shallow?: boolean): /*this*/Iterable<any, any>;

    /**
     * Flat-maps the Iterable, returning an Iterable of the same type.
     *
     * Similar to `iter.map(...).flatten(true)`.
     */
    flatMap<MK, MV>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => Iterable<MK, MV>,
      context?: any
    ): /*this*/Iterable<MK, MV>;
    flatMap<MK, MV>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => /*iterable-like*/any,
      context?: any
    ): /*this*/Iterable<MK, MV>;


    // Reducing a value

    /**
     * Reduces the Iterable to a value by calling the `reducer` for every entry
     * in the Iterable and passing along the reduced value.
     *
     * If `initialReduction` is not provided, or is null, the first item in the
     * Iterable will be used.
     *
     * @see `Array#reduce`.
     */
    reduce<R>(
      reducer: (reduction?: R, value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Reduces the Iterable in reverse (from the right side).
     *
     * Note: Similar to this.reverse().reduce(), and provided for parity
     * with `Array#reduceRight`.
     */
    reduceRight<R>(
      reducer: (reduction?: R, value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * True if `predicate` returns true for all entries in the Iterable.
     */
    every(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): boolean;

    /**
     * True if `predicate` returns true for any entry in the Iterable.
     */
    some(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): boolean;

    /**
     * Joins values together as a string, inserting a separator between each.
     * The default separator is `","`.
     */
    join(separator?: string): string;

    /**
     * Returns true if this Iterable includes no values.
     *
     * For some lazy `Seq`, `isEmpty` might need to iterate to determine
     * emptiness. At most one iteration will occur.
     */
    isEmpty(): boolean;

    /**
     * Returns the size of this Iterable.
     *
     * Regardless of if this Iterable can describe its size lazily (some Seqs
     * cannot), this method will always return the correct size. E.g. it
     * evaluates a lazy `Seq` if necessary.
     *
     * If `predicate` is provided, then this returns the count of entries in the
     * Iterable for which the `predicate` returns true.
     */
    count(): number;
    count(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): number;

    /**
     * Returns a `Seq.Keyed` of counts, grouped by the return value of
     * the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    countBy<G>(
      grouper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => G,
      context?: any
    ): Map<G, number>;


    // Search for value

    /**
     * Returns the value for which the `predicate` returns true.
     */
    find(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): V;

    /**
     * Returns the last value for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLast(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): V;

    /**
     * Returns the [key, value] entry for which the `predicate` returns true.
     */
    findEntry(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): /*[K, V]*/Array<any>;

    /**
     * Returns the last [key, value] entry for which the `predicate`
     * returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLastEntry(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): /*[K, V]*/Array<any>;

    /**
     * Returns the maximum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Iterable#sort`. If it is not
     * provided, the default comparator is `>`.
     *
     * When two values are considered equivalent, the first encountered will be
     * returned. Otherwise, `max` will operate independent of the order of input
     * as long as the comparator is commutative. The default comparator `>` is
     * commutative *only* when types do not differ.
     *
     * If `comparator` returns 0 and either value is NaN, undefined, or null,
     * that value will be returned.
     */
    max(comparator?: (valueA: V, valueB: V) => number): V;

    /**
     * Like `max`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.maxBy(hitter => hitter.avgHits);
     *
     */
    maxBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V;

    /**
     * Returns the minimum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Iterable#sort`. If it is not
     * provided, the default comparator is `<`.
     *
     * When two values are considered equivalent, the first encountered will be
     * returned. Otherwise, `min` will operate independent of the order of input
     * as long as the comparator is commutative. The default comparator `<` is
     * commutative *only* when types do not differ.
     *
     * If `comparator` returns 0 and either value is NaN, undefined, or null,
     * that value will be returned.
     */
    min(comparator?: (valueA: V, valueB: V) => number): V;

    /**
     * Like `min`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.minBy(hitter => hitter.avgHits);
     *
     */
    minBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V;


    // Comparison

    /**
     * True if `iter` includes every value in this Iterable.
     */
    isSubset(iter: Iterable<any, V>): boolean;
    isSubset(iter: Array<V>): boolean;

    /**
     * True if this Iterable includes every value in `iter`.
     */
    isSuperset(iter: Iterable<any, V>): boolean;
    isSuperset(iter: Array<V>): boolean;


    /**
     * Note: this is here as a convenience to work around an issue with
     * TypeScript https://github.com/Microsoft/TypeScript/issues/285, but
     * Iterable does not define `size`, instead `Seq` defines `size` as
     * nullable number, and `Collection` defines `size` as always a number.
     *
     * @ignore
     */
    size: number;
  }


  /**
   * Collection is the abstract base class for concrete data structures. It
   * cannot be constructed directly.
   *
   * Implementations should extend one of the subclasses, `Collection.Keyed`,
   * `Collection.Indexed`, or `Collection.Set`.
   */
  export module Collection {


    /**
     * `Collection` which represents key-value pairs.
     */
    export module Keyed {}

    export interface Keyed<K, V> extends Collection<K, V>, Iterable.Keyed<K, V> {

      /**
       * Returns Seq.Keyed.
       * @override
       */
      toSeq(): Seq.Keyed<K, V>;
    }


    /**
     * `Collection` which represents ordered indexed values.
     */
    export module Indexed {}

    export interface Indexed<T> extends Collection<number, T>, Iterable.Indexed<T> {

      /**
       * Returns Seq.Indexed.
       * @override
       */
      toSeq(): Seq.Indexed<T>;
    }


    /**
     * `Collection` which represents values, unassociated with keys or indices.
     *
     * `Collection.Set` implementations should guarantee value uniqueness.
     */
    export module Set {}

    export interface Set<T> extends Collection<T, T>, Iterable.Set<T> {

      /**
       * Returns Seq.Set.
       * @override
       */
      toSeq(): Seq.Set<T>;
    }

  }

  export interface Collection<K, V> extends Iterable<K, V> {

    /**
     * All collections maintain their current `size` as an integer.
     */
    size: number;
  }


  /**
   * ES6 Iterator.
   *
   * This is not part of the Immutable library, but a common interface used by
   * many types in ES6 JavaScript.
   *
   * @ignore
   */
  export interface Iterator<T> {
    next(): { value: T; done: boolean; }
  }

}


declare namespace LiteMolZlib {
    class Inflate {
        decompress(): Uint8Array;
        constructor(data: number[] | Uint8Array);
    }

    class Gunzip {
        decompress(): Uint8Array;
        constructor(data: number[] | Uint8Array);
    }
}



declare namespace __LiteMolColorPicker {
    
    interface __LiteMolColorPickerRGB {
        a: number; r: number; g: number; b: number;
    }

    interface __LiteMolColorPickerHSV {
        a: number; h: number; s: number; v: number;
    }

    interface __LiteMolColorPickerHSL {
        a: number; h: number; s: number; l: number;
    }

    interface __LiteMolColorPickerChangeEvent {
        rgb: __LiteMolColorPickerRGB;
        hsv: __LiteMolColorPickerHSV;
        rsl: __LiteMolColorPickerHSL;
        hex: string;   
    }
    
    // class ColorPicker extends __LiteMolReact.Component<{
    //     color?: string | __LiteMolColorPickerRGB | __LiteMolColorPickerHSV | __LiteMolColorPickerHSL,
    //     onChange?: (e: __LiteMolColorPickerChangeEvent) => void,
    // }, {}> {
        
    // }
    
    class ChromePicker extends __LiteMolReact.Component<{
        color?: string | __LiteMolColorPickerRGB | __LiteMolColorPickerHSV | __LiteMolColorPickerHSL,
        onChange?: (e: __LiteMolColorPickerChangeEvent) => void,
        onChangeComplete?: (e: __LiteMolColorPickerChangeEvent) => void,
    }, {}> {
        
    }
    
    // class AlphaPicker extends __LiteMolReact.Component<{
    //     color?: string | __LiteMolColorPickerRGB | __LiteMolColorPickerHSV | __LiteMolColorPickerHSL,
    //     onChange?: (e: __LiteMolColorPickerChangeEvent) => void,
    // }, {}> {
        
    // }
}
/// <reference types="react" />
declare namespace LiteMol {
    const Promise: PromiseConstructor;
}
declare namespace LiteMol.Core {
    export import Rx = __LiteMolRx;
    export import Promise = LiteMol.Promise;
    namespace Formats {
        export import CIF = LiteMolCIFTools;
    }
}
declare namespace LiteMol.Core {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMol.Core.Scheduler {
    const immediate: any;
    const clearImmediate: any;
    function immediatePromise(): Promise<void>;
}
declare namespace LiteMol.Core {
    function computation<A>(c: (ctx: Computation.Context) => Promise<A>): Computation<A>;
    class Computation<A> {
        private computation;
        run(ctx?: Computation.Context): Promise<A>;
        runWithContext(ctx?: Computation.Context): Computation.Running<A>;
        constructor(computation: (ctx: Computation.Context) => Promise<A>);
    }
    module Computation {
        let PRINT_CONSOLE_ERROR: boolean;
        function resolve<A>(a: A): Computation<A>;
        function reject<A>(reason: any): Computation<A>;
        function createContext(): Computation.Context;
        const Aborted = "Aborted";
        const UpdateProgressDelta = 100;
        interface Progress {
            message: string;
            isIndeterminate: boolean;
            current: number;
            max: number;
            requestAbort?: () => void;
        }
        interface Context {
            progress: Rx.Observable<Progress>;
            requestAbort(): void;
            /**
             * Checks if the computation was aborted. If so, throws.
             * Otherwise, updates the progress.
             */
            updateProgress(msg: string, abort?: boolean | (() => void), current?: number, max?: number): Promise<void>;
        }
        interface Running<A> {
            progress: Rx.Observable<Progress>;
            result: Promise<A>;
        }
    }
}
declare namespace LiteMol.Core.Utils {
    /**
     * An "object" based implementation of map that supports string and numeric keys
     * which should be ok for most use cases in LiteMol.
     *
     * The type limitation is on purpose to prevent using the type in places that are
     * not appropriate.
     */
    interface FastMap<K extends string | number, V> {
        readonly size: number;
        set(key: K, v: V): void;
        get(key: K): V | undefined;
        delete(key: K): boolean;
        has(key: K): boolean;
        clear(): void;
        /**
         * Iterate over the collection.
         * Optional "context" object can be supplied that is passed to the callback.
         *
         * Enumerates only values that are not undefined.
         */
        forEach<Context>(f: (value: V, key: K, ctx?: Context) => void, ctx?: Context): void;
    }
    /**
     * An "object" based implementation of set that supports string and numeric values
     * which should be ok for most use cases in LiteMol.
     *
     * The type limitation is on purpose to prevent using the type in places that are
     * not appropriate.
     */
    interface FastSet<T extends string | number> {
        readonly size: number;
        add(key: T): boolean;
        delete(key: T): boolean;
        has(key: T): boolean;
        clear(): void;
        /**
         * Iterate over the collection.
         * Optional "context" object can be supplied that is passed to the callback.
         */
        forEach<Context>(f: (key: T, ctx?: Context) => void, ctx?: Context): void;
    }
    namespace FastMap {
        /**
         * Creates an empty map.
         */
        function create<K extends string | number, V>(): FastMap<K, V>;
        /**
         * Create a map from an array of the form [[key, value], ...]
         */
        function ofArray<K extends string | number, V>(data: [K, V][]): FastMap<K, V>;
        /**
         * Create a map from an object of the form { key: value, ... }
         */
        function ofObject<V>(data: {
            [key: string]: V;
        }): FastMap<string, V>;
    }
    namespace FastSet {
        /**
         * Create an empty set.
         */
        function create<T extends string | number>(): FastSet<T>;
        /**
         * Create a set of an "array like" sequence.
         */
        function ofArray<T extends string | number>(xs: ArrayLike<T>): FastSet<T>;
    }
    /**
     * An optimized set-like structure.
     */
    interface Mask {
        size: number;
        has(i: number): boolean;
    }
    namespace Mask {
        function ofStructure(structure: Structure.Molecule.Model): Mask;
        function ofIndices(totalCount: number, indices: number[]): Mask;
        function ofFragments(seq: Structure.Query.FragmentSeq): Mask;
    }
}
declare namespace LiteMol.Core.Utils {
    export import FastNumberParsers = Core.Formats.CIF.Utils.FastNumberParsers;
    function extend<S, T, U>(object: S, source: T, guard?: U): S & T & U;
    function debounce<T>(func: () => T, wait: number): () => T;
}
declare namespace LiteMol.Core.Utils {
    type DataTable<Schema> = DataTable.Base<Schema> & DataTable.Columns<Schema>;
    module DataTable {
        type Definition<Schema> = {
            [T in keyof Schema]: ((size: number) => Schema[T][]) | undefined;
        };
        type Columns<Schema> = {
            readonly [P in keyof Schema]: Schema[P][];
        };
        interface ColumnDescriptor<Schema> {
            name: keyof Schema;
            creator: (size: number) => any;
        }
        type TypedArrayContructor = Float32ArrayConstructor | Float64ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int8ArrayConstructor | Uint8ArrayConstructor;
        function typedColumn(t: TypedArrayContructor): (size: number) => number[];
        function customColumn<T>(): (size: number) => T[];
        const stringColumn: (size: number) => string[];
        const stringNullColumn: (size: number) => (string | null)[];
        interface Base<Schema> {
            count: number;
            indices: number[];
            columns: ColumnDescriptor<Schema>[];
            getBuilder(count: number): Builder<Schema>;
            getRawData(): any[][];
            /**
             * Get a MUTABLE representation of a row.
             * Calling getRow() with differnt 'i' will change update old reference.
             */
            getRow(i: number): Schema;
        }
        interface Builder<Schema> {
            count: number;
            columns: ColumnDescriptor<Schema>[];
            addColumn<T>(name: keyof Schema, creator: (size: number) => T): T;
            addRawColumn<T>(name: keyof Schema, creator: (size: number) => T, data: T): T;
            getRawData(): any[][];
            /**
             * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine
             * use internal class instead of dictionary representation.
             */
            seal(): DataTable<Schema>;
        }
        function builder<Schema>(count: number): Builder<Schema>;
        function ofDefinition<Schema>(definition: Definition<Schema>, count: number): DataTable<Schema>;
    }
}
declare namespace LiteMol.Core.Utils {
    function integerSetToSortedTypedArray(set: FastSet<number>): number[];
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
     *
     * When adding elements, the array growns by a specified number
     * of elements and no copying is done until ChunkedArray.compact
     * is called.
     */
    interface ChunkedArray<T> {
        creator: (size: number) => any;
        elementSize: number;
        chunkSize: number;
        current: any;
        currentIndex: number;
        parts: any[];
        elementCount: number;
    }
    namespace ChunkedArray {
        function is(x: any): x is ChunkedArray<any>;
        function add4<T>(array: ChunkedArray<T>, x: T, y: T, z: T, w: T): number;
        function add3<T>(array: ChunkedArray<T>, x: T, y: T, z: T): number;
        function add2<T>(array: ChunkedArray<T>, x: T, y: T): number;
        function add<T>(array: ChunkedArray<T>, x: T): number;
        function compact<T>(array: ChunkedArray<T>): T[];
        function forVertex3D(chunkVertexCount?: number): ChunkedArray<number>;
        function forIndexBuffer(chunkIndexCount?: number): ChunkedArray<number>;
        function forTokenIndices(chunkTokenCount?: number): ChunkedArray<number>;
        function forIndices(chunkTokenCount?: number): ChunkedArray<number>;
        function forInt32(chunkSize?: number): ChunkedArray<number>;
        function forFloat32(chunkSize?: number): ChunkedArray<number>;
        function forArray<T>(chunkSize?: number): ChunkedArray<T>;
        function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ChunkedArray<T>;
    }
    /**
     * Static size array builder.
     */
    interface ArrayBuilder<T> {
        currentIndex: number;
        elementCount: number;
        array: T[];
    }
    namespace ArrayBuilder {
        function add3<T>(array: ArrayBuilder<T>, x: T, y: T, z: T): void;
        function add2<T>(array: ArrayBuilder<T>, x: T, y: T): void;
        function add<T>(array: ArrayBuilder<T>, x: T): void;
        function forVertex3D(count: number): ArrayBuilder<number>;
        function forIndexBuffer(count: number): ArrayBuilder<number>;
        function forTokenIndices(count: number): ArrayBuilder<number>;
        function forIndices(count: number): ArrayBuilder<number>;
        function forInt32(count: number): ArrayBuilder<number>;
        function forFloat32(count: number): ArrayBuilder<number>;
        function forArray<T>(count: number): ArrayBuilder<T>;
        function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ArrayBuilder<T>;
    }
    interface UniqueArray<T extends number | string> {
        _set: FastSet<T>;
        array: T[];
    }
    function UniqueArray<T extends number | string>(): UniqueArray<T>;
    namespace UniqueArray {
        function add<T extends number | string>({ _set, array }: UniqueArray<T>, e: T): void;
    }
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
        shortcuts: string[];
        extensions: string[];
        isBinary?: boolean;
        parse: (data: string | ArrayBuffer, params?: FormatInfo.Params) => Computation<ParserResult<any>>;
    }
    namespace FormatInfo {
        type Params = {
            id?: string;
        };
        function is(o: any): o is FormatInfo;
        function fromShortcut(all: FormatInfo[], name: string): FormatInfo | undefined;
        function formatRegExp(info: FormatInfo): RegExp;
        function formatFileFilters(all: FormatInfo[]): string;
        function getFormat(filename: string, all: FormatInfo[]): FormatInfo | undefined;
    }
    type ParserResult<T> = ParserSuccess<T> | ParserError;
    namespace ParserResult {
        function error<T>(message: string, line?: number): ParserResult<T>;
        function success<T>(result: T, warnings?: string[]): ParserResult<T>;
    }
    class ParserError {
        message: string;
        line: number;
        isError: true;
        toString(): string;
        constructor(message: string, line: number);
    }
    class ParserSuccess<T> {
        result: T;
        warnings: string[];
        isError: false;
        constructor(result: T, warnings: string[]);
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
    type ShortStringPool = {
        [key: string]: string;
    };
    namespace ShortStringPool {
        function create(): ShortStringPool;
        function get(pool: ShortStringPool, str: string): string;
    }
}
declare namespace LiteMol.Core.Formats.Molecule.mmCIF {
    type StructConnType = 'covale' | 'covale_base' | 'covale_phosphate' | 'covale_sugar' | 'disulf' | 'hydrog' | 'metalc' | 'mismat' | 'modres' | 'saltbr';
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
        numberTokens: Utils.FastMap<number, TokenRange>;
        data: string;
    };
    class MoleculeData {
        header: Header;
        crystInfo: CrystStructureInfo | undefined;
        models: ModelsData;
        data: string;
        private makeEntities;
        toCifFile(): CIF.File;
        constructor(header: Header, crystInfo: CrystStructureInfo | undefined, models: ModelsData, data: string);
    }
    class Header {
        id: string;
        constructor(id: string);
    }
    class CrystStructureInfo {
        record: string;
        private getValue;
        toCifCategory(id: string): {
            cell: CIF.Category | undefined;
            symm: CIF.Category | undefined;
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
        private writeToken;
        private writeTokenCond;
        private writeRange;
        private tokenEquals;
        private getEntityType;
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
        private static tokenizeAtom;
        private static tokenize;
        static getDotRange(length: number): TokenRange;
        static getNumberRanges(length: number): Utils.FastMap<number, TokenRange>;
        static getQuestionmarkRange(length: number): TokenRange;
        static parse(id: string, data: string): ParserResult<CIF.File>;
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
    /**
     * A field with the Z axis being the slowest and the X being the fastest.
     */
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
    interface Spacegroup {
        number: number;
        size: number[];
        angles: number[];
        basis: {
            x: number[];
            y: number[];
            z: number[];
        };
    }
    /**
     * Represents electron density data.
     */
    interface Data {
        name?: string;
        spacegroup: Spacegroup;
        box: {
            /** Origin of the data block in fractional coords. */
            origin: number[];
            /** Dimensions oft he data block in fractional coords. */
            dimensions: number[];
            /** X, Y, Z dimensions of the data matrix. */
            sampleCount: number[];
        };
        /**
         * 3D volumetric data.
         */
        data: Field3D;
        /**
         * Information about the min/max/mean/sigma values.
         */
        valuesInfo: {
            min: number;
            max: number;
            mean: number;
            sigma: number;
        };
    }
    function createSpacegroup(number: number, size: number[], angles: number[]): Spacegroup;
}
declare namespace LiteMol.Core.Formats.Density.CCP4 {
    function parse(buffer: ArrayBuffer): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density.CIF {
    function parse(block: Formats.CIF.DataBlock): ParserResult<Data>;
}
declare namespace LiteMol.Core.Formats.Density {
    namespace SupportedFormats {
        const CCP4: FormatInfo;
        const All: FormatInfo[];
    }
}
declare namespace LiteMol.Core.Geometry.LinearAlgebra {
    type Matrix4 = number[];
    type Vector3 = number[];
    type Vector4 = number[];
    function Matrix4(): number[];
    /**
     * Stores a 4x4 matrix in a column major (j * 4 + i indexing) format.
     */
    namespace Matrix4 {
        function zero(): number[];
        function identity(): number[];
        function fromIdentity(mat: number[]): number[];
        function ofRows(rows: number[][]): number[];
        function areEqual(a: number[], b: number[], eps: number): boolean;
        function setValue(a: number[], i: number, j: number, value: number): void;
        function copy(out: number[], a: number[]): number[];
        function clone(a: number[]): number[];
        function invert(out: number[], a: number[]): number[] | null;
        function mul(out: number[], a: number[], b: number[]): number[];
        function mul3(out: number[], a: number[], b: number[], c: number[]): number[];
        function translate(out: number[], a: number[], v: number[]): number[];
        function fromTranslation(out: number[], v: number[]): number[];
        function rotate(out: number[], a: number[], rad: number, axis: number[]): number[] | null;
        function fromRotation(out: number[], rad: number, axis: number[]): number[];
        function scale(out: number[], a: number[], v: number[]): number[];
        function fromScaling(out: number[], v: number[]): number[];
        function makeTable(m: number[]): string;
        function determinant(a: number[]): number;
    }
    function Vector3(x?: number, y?: number, z?: number): number[];
    namespace Vector3 {
        function zero(): number[];
        function clone(a: number[]): number[];
        function fromObj(v: {
            x: number;
            y: number;
            z: number;
        }): number[];
        function toObj(v: number[]): {
            x: number;
            y: number;
            z: number;
        };
        function fromValues(x: number, y: number, z: number): number[];
        function set(out: number[], x: number, y: number, z: number): number[];
        function copy(out: number[], a: number[]): number[];
        function add(out: number[], a: number[], b: number[]): number[];
        function sub(out: number[], a: number[], b: number[]): number[];
        function scale(out: number[], a: number[], b: number): number[];
        function scaleAndAdd(out: number[], a: number[], b: number[], scale: number): number[];
        function distance(a: number[], b: number[]): number;
        function squaredDistance(a: number[], b: number[]): number;
        function magnitude(a: number[]): number;
        function squaredMagnitude(a: number[]): number;
        function normalize(out: number[], a: number[]): number[];
        function dot(a: number[], b: number[]): number;
        function cross(out: number[], a: number[], b: number[]): number[];
        function lerp(out: number[], a: number[], b: number[], t: number): number[];
        function transformMat4(out: number[], a: number[], m: number[]): number[];
        function angle(a: number[], b: number[]): number;
        function makeRotation(mat: Matrix4, a: Vector3, b: Vector3): Matrix4;
    }
    function Vector4(x?: number, y?: number, z?: number, w?: number): number[];
    namespace Vector4 {
        function zero(): number[];
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
            center: Geometry.LinearAlgebra.Vector3;
            radius: number;
        };
    }
    namespace Surface {
        function computeNormalsImmediate(surface: Surface): void;
        function computeNormals(surface: Surface): Computation<Surface>;
        function laplacianSmooth(surface: Surface, iterCount?: number, vertexWeight?: number): Computation<Surface>;
        function computeBoundingSphere(surface: Surface): Computation<Surface>;
        function transformImmediate(surface: Surface, t: number[]): void;
        function transform(surface: Surface, t: number[]): Computation<Surface>;
    }
}
declare namespace LiteMol.Core.Geometry.Query3D {
    /**
     * Query context. Handles the actual querying.
     */
    type QueryFunc<T> = (x: number, y: number, z: number, radius: number) => Result<T>;
    interface Result<T> {
        readonly count: number;
        readonly elements: T[];
        readonly squaredDistances: number[];
    }
    interface InputData<T> {
        elements: T[];
        indices: Int32Array;
        bounds: Box3D;
        positions: number[];
    }
    type LookupStructure<T> = () => QueryFunc<T>;
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
    /**
    * Query context. Handles the actual querying.
    */
    interface QueryContext<T> {
        structure: T;
        pivot: number[];
        radius: number;
        radiusSq: number;
        buffer: QueryContext.Buffer;
    }
    namespace QueryContext {
        interface Buffer {
            sourceElements: any[];
            count: number;
            elements: any[];
            squaredDistances: number[];
        }
        function add<T>(ctx: QueryContext<T>, distSq: number, index: number): void;
        /**
         * Query the tree and store the result to this.buffer. Overwrites the old result.
         */
        function update<T>(ctx: QueryContext<T>, x: number, y: number, z: number, radius: number): void;
        function create<T>(structure: T, sourceElements: any[]): QueryContext<T>;
    }
    function createInputData<T>(elements: T[], f: (e: T, add: (x: number, y: number, z: number) => void) => void): InputData<T>;
}
declare namespace LiteMol.Core.Geometry.Query3D {
    function createSubdivisionTree<T>(data: InputData<T>, leafSize?: number): LookupStructure<T>;
}
declare namespace LiteMol.Core.Geometry.Query3D {
    function createSpatialHash<T>(data: InputData<T>): LookupStructure<T>;
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
        bottomLeft: Geometry.LinearAlgebra.Vector3;
        topRight: Geometry.LinearAlgebra.Vector3;
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
        positions: Core.Structure.PositionTable;
        atomIndices: number[];
        parameters?: MolecularIsoSurfaceParameters;
    }
    function computeMolecularSurfaceAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoSurfaceGeometryData>;
}
declare namespace LiteMol.Core.Structure {
    import DataTable = Utils.DataTable;
    interface Position {
        x: number;
        y: number;
        z: number;
    }
    interface Atom {
        id: number;
        name: string;
        authName: string;
        elementSymbol: string;
        altLoc: string | null;
        occupancy: number;
        tempFactor: number;
        residueIndex: number;
        chainIndex: number;
        entityIndex: number;
        rowIndex: number;
    }
    interface Residue {
        name: string;
        seqNumber: number;
        asymId: string;
        authName: string;
        authSeqNumber: number;
        authAsymId: string;
        insCode: string | null;
        entityId: string;
        isHet: number;
        atomStartIndex: number;
        atomEndIndex: number;
        chainIndex: number;
        entityIndex: number;
        secondaryStructureIndex: number;
    }
    interface Chain {
        asymId: string;
        authAsymId: string;
        entityId: string;
        atomStartIndex: number;
        atomEndIndex: number;
        residueStartIndex: number;
        residueEndIndex: number;
        entityIndex: number;
        sourceChainIndex: number;
        operatorIndex: number;
    }
    interface Entity {
        entityId: string;
        atomStartIndex: number;
        atomEndIndex: number;
        residueStartIndex: number;
        residueEndIndex: number;
        chainStartIndex: number;
        chainEndIndex: number;
        type: Entity.Type;
    }
    namespace Entity {
        type Type = 'polymer' | 'non-polymer' | 'water' | 'unknown';
    }
    interface Bond {
        atomAIndex: number;
        atomBIndex: number;
        type: BondType;
    }
    interface ModifiedResidue {
        asymId: string;
        seqNumber: number;
        insCode: string | null;
        parent: string;
        details: string | null;
    }
    class ComponentBondInfoEntry {
        id: string;
        map: Utils.FastMap<string, Utils.FastMap<string, BondType>>;
        add(a: string, b: string, order: BondType, swap?: boolean): void;
        constructor(id: string);
    }
    class ComponentBondInfo {
        entries: Utils.FastMap<string, ComponentBondInfoEntry>;
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
        static compare(a: PolyResidueIdentifier, b: PolyResidueIdentifier): 0 | 1 | -1;
        static compareResidue(a: PolyResidueIdentifier, index: number, bAsymId: string[], bSeqNumber: number[], bInsCode: string[]): 0 | 1 | -1;
    }
    const enum SecondaryStructureType {
        None = 0,
        Helix = 1,
        Turn = 2,
        Sheet = 3,
        AminoSeq = 4,
        Strand = 5
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
     * Wraps _struct_conn mmCIF category.
     */
    class StructConn {
        entries: StructConn.Entry[];
        private _residuePairIndex;
        private _atomIndex;
        private static _resKey;
        private getResiduePairIndex;
        private getAtomIndex;
        private static _emptyEntry;
        getResidueEntries(residueAIndex: number, residueBIndex: number): ReadonlyArray<StructConn.Entry>;
        getAtomEntries(atomIndex: number): ReadonlyArray<StructConn.Entry>;
        constructor(entries: StructConn.Entry[]);
    }
    namespace StructConn {
        interface Entry {
            distance: number;
            bondType: BondType;
            partners: {
                residueIndex: number;
                atomIndex: number;
                symmetry: string;
            }[];
        }
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
    type PositionTable = DataTable<Position>;
    type AtomTable = DataTable<Atom>;
    type ResidueTable = DataTable<Residue>;
    type ChainTable = DataTable<Chain>;
    type EntityTable = DataTable<Entity>;
    type BondTable = DataTable<Bond>;
    type ModifiedResidueTable = DataTable<ModifiedResidue>;
    /**
     * Default Builders
     */
    namespace Tables {
        const Positions: DataTable.Definition<Position>;
        const Atoms: DataTable.Definition<Atom>;
        const Residues: DataTable.Definition<Residue>;
        const Chains: DataTable.Definition<Chain>;
        const Entities: DataTable.Definition<Entity>;
        const Bonds: DataTable.Definition<Bond>;
        const ModifiedResidues: DataTable.Definition<ModifiedResidue>;
    }
    class Operator {
        matrix: number[];
        id: string;
        isIdentity: boolean;
        apply(v: Geometry.LinearAlgebra.Vector3): void;
        static applyToModelUnsafe(matrix: number[], m: Molecule.Model): void;
        constructor(matrix: number[], id: string, isIdentity: boolean);
    }
    interface Molecule {
        readonly properties: Molecule.Properties;
        readonly id: string;
        readonly models: Molecule.Model[];
    }
    namespace Molecule {
        function create(id: string, models: Model[], properties?: Properties): Molecule;
        interface Properties {
            experimentMethods?: string[];
        }
        interface Bonds {
            readonly structConn?: StructConn;
            readonly input?: BondTable;
            readonly component?: ComponentBondInfo;
        }
        interface Model extends Model.Base {
            readonly queryContext: Query.Context;
        }
        namespace Model {
            function create(model: Base): Model;
            enum Source {
                File = 0,
                Computed = 1
            }
            interface Base {
                readonly id: string;
                readonly modelId: string;
                readonly positions: PositionTable;
                readonly data: Data;
                readonly source: Source;
                readonly parent?: Model;
                readonly operators?: Operator[];
            }
            interface Data {
                readonly atoms: AtomTable;
                readonly residues: ResidueTable;
                readonly chains: ChainTable;
                readonly entities: EntityTable;
                readonly bonds: Bonds;
                readonly secondaryStructure: SecondaryStructureElement[];
                readonly modifiedResidues?: ModifiedResidueTable;
                readonly symmetryInfo?: SymmetryInfo;
                readonly assemblyInfo?: AssemblyInfo;
            }
            function withTransformedXYZ<T>(model: Model, ctx: T, transform: (ctx: T, x: number, y: number, z: number, out: Geometry.LinearAlgebra.Vector3) => void): Model;
        }
    }
}
declare namespace LiteMol.Core.Structure {
    const enum BondType {
        Unknown = 0,
        Single = 1,
        Double = 2,
        Triple = 3,
        Aromatic = 4,
        DisulfideBridge = 5,
        Metallic = 6,
        Ion = 7,
        Hydrogen = 8
    }
    function isBondTypeCovalent(t: BondType): boolean;
    interface BondComputationParameters {
        maxHbondLength: number;
        forceCompute: boolean;
    }
    function computeBonds(model: Molecule.Model, atomIndices: number[], params?: Partial<BondComputationParameters>): Utils.DataTable<Bond>;
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
        private getSpace;
        private static getOperator;
        private getOperators;
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
    function buildPivotGroupSymmetry(model: Molecule.Model, radius: number, pivotsQuery?: Query.Source): Molecule.Model;
    function buildSymmetryMates(model: Molecule.Model, radius: number): Molecule.Model;
    function buildAssembly(model: Molecule.Model, assembly: AssemblyGen): Molecule.Model;
}
declare namespace LiteMol.Core.Structure {
    /**
     * The query is a mapping from a context to a sequence of fragments.
     */
    type Query = (ctx: Query.Context) => Query.FragmentSeq;
    namespace Query {
        function apply(q: Source, m: Molecule.Model): FragmentSeq;
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
            readonly mask: Utils.Mask;
            private lazyLoopup3d;
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
            structure: Molecule.Model;
            /**
             * Get a 3d loopup structure for the atoms in the current context.
             */
            readonly lookup3d: Geometry.Query3D.LookupStructure<number>;
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
            static ofStructure(structure: Molecule.Model): Context;
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofFragments(seq: FragmentSeq): Context;
            /**
             * Create a new context from a sequence of fragments.
             */
            static ofAtomIndices(structure: Molecule.Model, atomIndices: number[]): Context;
            constructor(structure: Molecule.Model, mask: Utils.Mask);
            private makeLookup3d;
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
            private computeIndices;
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
            static ofSet(context: Context, atomIndices: Utils.FastSet<number>): Fragment;
            /**
             * Create a fragment from an integer array.
             * Assumes the set is in the given context's mask.
             * Assumes the array is sorted.
             */
            static ofArray(context: Context, tag: number, atomIndices: Int32Array | number[]): Fragment;
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
        except(toRemove: Source): Builder;
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
    function allAtoms(): Builder;
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
    function sequence(entityId: string | undefined, asymId: string | AsymIdSchema, startId: ResidueIdSchema, endId: ResidueIdSchema): Builder;
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
    function except(what: Source, toRemove: Source): Builder;
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
        function compileAllAtoms(): (ctx: Context) => FragmentSeq;
        function compileAtoms(elements: string[] | number[], sel: (model: Structure.Molecule.Model) => string[] | number[]): (ctx: Context) => FragmentSeq;
        function compileAtomIndices(indices: number[]): (ctx: Context) => FragmentSeq;
        function compileFromIndices(complement: boolean, indices: number[], tableProvider: (molecule: Structure.Molecule.Model) => {
            atomStartIndex: number[];
            atomEndIndex: number[];
        } & Utils.DataTable<any>): Query;
        function compileAtomRanges(complement: boolean, ids: ResidueIdSchema[], tableProvider: (molecule: Structure.Molecule.Model) => {
            atomStartIndex: number[];
            atomEndIndex: number[];
        } & Utils.DataTable<any>): Query;
        function compileSequence(seqEntityId: string | undefined, seqAsymId: string | AsymIdSchema, start: ResidueIdSchema, end: ResidueIdSchema): Query;
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
        function compileOr(queries: Source[]): Query;
        function compileUnion(what: Source): Query;
        function compilePolymerNames(names: string[], complement: boolean): Query;
        function compileAmbientResidues(where: Source, radius: number): (ctx: Context) => FragmentSeq;
        function compileWholeResidues(where: Source): (ctx: Context) => FragmentSeq;
        function compileFlatten(what: Source, selector: (f: Fragment) => FragmentSeq): (ctx: Context) => FragmentSeq;
        function compileExcept(what: Source, toRemove: Source): (ctx: Context) => FragmentSeq;
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
declare namespace LiteMol.Visualization {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMol.Visualization {
    export import THREE = LiteMolTHREE;
}
declare namespace LiteMol.Visualization.Utils {
    class Palette {
        static getRandomColor(amountOfGrey?: number): Visualization.Color;
        static randomMix(color1: Visualization.Color, color2: Visualization.Color, color3: Visualization.Color, greyControl: number): Visualization.Color;
        private static previous;
        /**
         *
         * @example
         *   let min = Palette.getRandomColor(0.3);
         *   let max = Palette.getRandomColor(0.3);
         *   let color = Palette.interpolate(0.1, min, 0.6, max, 0.354);
         */
        static interpolate(min: number, minColor: Visualization.Color, max: number, maxColor: Visualization.Color, value: number, target?: Visualization.Color): Color;
    }
}
declare namespace LiteMol.Visualization {
    function checkWebGL(): boolean;
    interface IDisposable {
        dispose(): void;
    }
    class GeometryHelper {
        static setPickBase(objectId: number, objectIdWidth: number, elementId: number, color: {
            r: number;
            g: number;
            b: number;
        }): void;
        static setPickColor(objectId: number, objectIdWidth: number, elementId: number, buffer: Float32Array, offset: number): void;
        static toSurface(source: THREE.Geometry): Core.Geometry.Surface;
        static toRawGeometry(source: THREE.Geometry): Geometry.RawGeometry;
        static getIndexedBufferGeometry(source: THREE.Geometry): THREE.BufferGeometry;
    }
}
declare namespace LiteMol.Visualization {
    interface Color {
        r: number;
        g: number;
        b: number;
    }
    namespace Color {
        function copy(from: Color, to: Color): void;
        function clone({ r, g, b }: Color): Color;
        function toVector(color: Color): THREE.Vector3;
        function fromVector(v: {
            x: number;
            y: number;
            z: number;
        }): Color;
        function fromRgb(r: number, g: number, b: number): Color;
        function fromHsl(h: number, s: number, l: number): Color;
        function fromHsv(h: number, s: number, v: number): Color;
        function random(): Color;
        function fromHex(v: number): Color;
        /**
         * Parse color in formats #rgb and #rrggbb
         */
        function fromHexString(s: string): Color;
        function interpolate(a: Color, b: Color, t: number, target: Color): void;
        function isColor(c: any): c is Color;
    }
    interface Theme {
        colors: Theme.ColorMap;
        variables: Theme.VariableMap;
        transparency: Theme.Transparency;
        interactive: boolean;
        disableFog: boolean;
        isSticky: boolean;
        setElementColor(index: number, target: Color): void;
    }
    namespace Theme {
        interface Props {
            colors?: ColorMap;
            variables?: VariableMap;
            transparency?: Theme.Transparency;
            interactive?: boolean;
            disableFog?: boolean;
            isSticky?: boolean;
        }
        interface Transparency {
            alpha?: number;
            writeDepth?: boolean;
        }
        interface ColorMap {
            get(key: any): Color | undefined;
            forEach(f: (value: Color, key: any) => void): void;
        }
        interface VariableMap {
            get(key: any): any | undefined;
            forEach(f: (value: any, key: any) => void): void;
        }
        namespace Default {
            const HighlightColor: Color;
            const SelectionColor: Color;
            const UniformColor: Color;
            const Transparency: Transparency;
        }
        interface ElementMapping {
            getProperty(index: number): any;
            setColor(property: any, c: Color): void;
        }
        function isTransparent(theme: Theme): boolean;
        function getColor(theme: Theme, name: string, fallback: Color): Color;
        function createUniform(props?: Props): Theme;
        function createMapping(mapping: ElementMapping, props?: Props): Theme;
        function createColorMapMapping(getProperty: (index: number) => any, map: ColorMap, fallbackColor: Color): ElementMapping;
        function createPalleteMapping(getProperty: (index: number) => any, pallete: Color[]): ElementMapping;
        function createPalleteIndexMapping(getProperty: (index: number) => number, pallete: Color[]): ElementMapping;
    }
}
declare namespace LiteMol.Visualization {
    class MaterialsHelper {
        private static pickVertexShader;
        private static pickFragmentShader;
        static getPickMaterial(): THREE.ShaderMaterial;
        static getPickExcludeMaterial(): THREE.MeshBasicMaterial;
        static shader: {
            uniforms: any;
            vertexShader: string;
            fragmentShader: string;
        };
        private static compareVectorAndColor;
        static updateMaterial(material: THREE.ShaderMaterial | THREE.MeshPhongMaterial, theme: Theme, object: THREE.Object3D): void;
        private static updateHighlightColor;
        private static updateTransparencyAndFog;
        static getMeshMaterial(shading?: THREE.Shading, isWireframe?: boolean): THREE.ShaderMaterial;
        static getPhongVertexColorMaterial(): THREE.MeshPhongMaterial;
        static getDefaultHighlightMaterial(): THREE.MeshPhongMaterial;
        static applyColorToBuffer(bufferAttribute: THREE.BufferAttribute, color: Color): void;
        static applyColorToMap(map: Selection.VertexMap, bufferAttribute: THREE.BufferAttribute, getter: (i: number, c: Color) => void): void;
    }
}
declare namespace LiteMol.Visualization {
    abstract class GeometryBase implements IDisposable {
        abstract dispose(): void;
        constructor();
    }
    abstract class Model {
        constructor();
        id: number;
        entity: any;
        centroid: THREE.Vector3;
        radius: number;
        object: THREE.Object3D;
        theme: Theme;
        disposeList: IDisposable[];
        pickObject: THREE.Object3D | undefined;
        pickBufferAttributes: THREE.BufferAttribute[];
        dirty: boolean;
        props: Model.Props;
        tag: any;
        updateVisibility(visible: boolean): void;
        getVisibility(): boolean;
        applyTheme(theme: Theme): void;
        updateId(id: number, idWidth: number): void;
        dispose(): void;
        highlight(isOn: boolean): boolean;
        applySelection(indices: number[], action: Selection.Action): boolean;
        getBoundingSphereOfSelection(indices: number[]): {
            radius: number;
            center: Core.Geometry.LinearAlgebra.Vector3;
        } | undefined;
        abstract highlightElement(pickId: number, highlight: boolean): boolean;
        abstract getPickElements(pickId: number): number[];
        protected abstract applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        protected abstract applyThemeInternal(theme: Theme): void;
        protected abstract highlightInternal(isOn: boolean): boolean;
        protected getPickObjectVisibility(visible: boolean): boolean;
    }
    namespace Model {
        interface Props {
        }
    }
}
declare namespace LiteMol.Visualization {
    class ModelStore {
        scene: Scene;
        private availableIds;
        private list;
        private map;
        private maxId;
        private _idWidth;
        readonly idWidth: number;
        readonly all: Model[];
        readonly count: number;
        getBySceneId(id: number): Model | undefined;
        add(model: Model, resetCamera?: boolean): void;
        private dispose;
        removeAndDispose(model: Model): void;
        clear(): void;
        constructor(scene: Scene);
    }
}
declare namespace LiteMol.Visualization {
    enum CameraType {
        Perspective = 0,
        Orthographic = 1
    }
    class SlabControls {
        private height;
        private touchSlabOn;
        private touchStartPosition;
        private touchPosition;
        private radius;
        private slabWheelRate;
        private _planeDelta;
        private subs;
        private enableWheel;
        private mouseMoveDelta;
        private lastMousePosition;
        readonly planeDelta: LiteMol.Core.Rx.IObservable<number>;
        updateSize(w: number, h: number): void;
        updateRadius(r: number): void;
        destroy(): void;
        private handleMouseWheel;
        private touchstart;
        private touchend;
        private touchmove;
        private mousemove;
        private mouseOut;
        constructor(element: HTMLElement);
    }
    class Camera {
        private scene;
        private domElement;
        private camera;
        controls: CameraControls;
        private slabControls;
        fog: THREE.Fog;
        focusPoint: THREE.Vector3;
        focusRadius: number;
        targetDistance: number;
        nearPlaneDistance: number;
        nearPlaneDelta: number;
        fogEnabled: boolean;
        fogDelta: number;
        fogFactor: number;
        static shouldInUpdateInclude(m: Model): boolean;
        private updateFocus;
        private focus;
        reset(): void;
        snapshot(): {
            state: CameraControlsState;
            prevState: CameraControlsState;
            target: THREE.Vector3;
            objPos: THREE.Vector3;
            objUp: THREE.Vector3;
            eye: THREE.Vector3;
            lastPosition: THREE.Vector3;
        };
        restore(state: any): void;
        focusOnModel(...models: Model[]): void;
        focusOnPoint(center: {
            x: number;
            y: number;
            z: number;
        }, radius: number): void;
        move(target: {
            x: number;
            y: number;
            z: number;
        }): void;
        updateSize(w: number, h: number): void;
        readonly position: THREE.Vector3;
        readonly object: THREE.Camera;
        private unbindCamera;
        dispose(): void;
        private planeDeltaUpdate;
        computeNearDistance(): number;
        cameraUpdated(): void;
        createCamera(): void;
        private setup;
        private observers;
        observe(callback: (c: Camera) => void): void;
        stopObserving(callback: (c: Camera) => void): void;
        constructor(scene: Scene, domElement: HTMLElement);
    }
}
declare namespace LiteMol.Visualization {
    interface SceneOptions {
        alpha?: boolean;
        clearColor?: {
            r: number;
            g: number;
            b: number;
        };
        cameraFOV?: number;
        cameraSpeed?: number;
        cameraType?: CameraType;
        enableFog?: boolean;
        fogFactor?: number;
        enableFrontClip?: boolean;
    }
    const DefaultSceneOptions: SceneOptions;
    class MouseInfo {
        private renderState;
        private domElement;
        private position;
        private lastPosition;
        private isDirty;
        private rect;
        exactPosition: {
            x: number;
            y: number;
        };
        constructor(renderState: RenderState, domElement: Element);
        updateRect(): void;
        updatePosition(clientX: number, clientY: number): void;
        update(): boolean;
        isInside: boolean;
        isButtonDown: boolean;
        setExactPosition(): void;
    }
    interface ILighting {
        setup(scene: THREE.Scene): void;
        update(cameraPosition: THREE.Vector3): void;
    }
    class DefaultLighting implements ILighting {
        private lights;
        setup(scene: THREE.Scene): void;
        update(cameraPosition: THREE.Vector3): void;
        constructor();
    }
    class RenderState {
        width: number;
        height: number;
        resizing: boolean;
        rendered: boolean;
        lastRenderTime: number;
        pickDelta: number;
        animationFrame: number;
    }
    class Scene {
        private static hoverEvent;
        private static selectEvent;
        private renderer;
        renderState: RenderState;
        scene: THREE.Scene;
        pickScene: THREE.Scene;
        private pickTarget;
        mouseInfo: MouseInfo;
        private pickInfo;
        private unbindEvents;
        private lighting;
        parentElement: HTMLElement;
        options: SceneOptions;
        camera: Camera;
        models: ModelStore;
        events: THREE.EventDispatcher;
        private initialResizeTimeout;
        updateOptions(options: SceneOptions): void;
        constructor(element: HTMLElement, options?: SceneOptions);
        private setupMouse;
        private clearHighlightsCall;
        private handleSelectStart;
        private handleSelectEnd;
        private handleResize;
        private needsRender;
        private checkDirty;
        private renderFunc;
        private render;
        private pickBuffer;
        private dispatchHoverEvent;
        private dispatchSelectEvent;
        private clearHighlights;
        private handlePick;
        resized(): void;
        forceRender(): void;
        clear(): void;
        downloadScreenshot(): void;
        destroy(): void;
    }
}
declare namespace LiteMol.Visualization {
    const enum CameraControlsState {
        NONE = -1,
        ROTATE = 0,
        ZOOM = 2,
        PAN = 1,
        TOUCH_ROTATE = 3,
        TOUCH_ZOOM_PAN = 4
    }
    class CameraControls {
        camera: THREE.Camera;
        private domElement;
        private scene;
        constructor(camera: THREE.Camera, domElement: HTMLElement, scene: Scene);
        enabled: boolean;
        rotateSpeed: number;
        zoomSpeed: number;
        panSpeed: number;
        noRotate: boolean;
        noZoom: boolean;
        noPan: boolean;
        noRoll: boolean;
        staticMoving: boolean;
        dynamicDampingFactor: number;
        minDistance: number;
        maxDistance: number;
        keys: number[];
        target: THREE.Vector3;
        private EPS;
        private lastPosition;
        private _state;
        private _keyDownState;
        private _prevState;
        private _eye;
        private _rotateStart;
        private _rotateEnd;
        private _zoomStart;
        private _zoomEnd;
        private _touchZoomDistanceStart;
        private _touchZoomDistanceEnd;
        private _panStart;
        private _panEnd;
        private target0;
        private position0;
        private up0;
        private changeEvent;
        private startEvent;
        private endEvent;
        events: THREE.EventDispatcher;
        private _mouseOnScreen;
        private getMouseOnScreen;
        private _mouseOnBallProjection;
        private _objectUp;
        private _mouseOnBall;
        private getMouseProjectionOnBall;
        private _rotationAxis;
        private _rotationQuaternion;
        private rotateCamera;
        private zoomCamera;
        private _panMouseChange;
        private _panObjectUp;
        private _panPan;
        private panCamera;
        private _panToDelta;
        private _panToVector;
        panTo({ x, y, z }: {
            x: number;
            y: number;
            z: number;
        }): void;
        panAndMoveToDistance({ x, y, z }: {
            x: number;
            y: number;
            z: number;
        }, distance: number): void;
        private checkDistances;
        update(): void;
        reset(): void;
        getState(): {
            state: CameraControlsState;
            prevState: CameraControlsState;
            target: THREE.Vector3;
            objPos: THREE.Vector3;
            objUp: THREE.Vector3;
            eye: THREE.Vector3;
            lastPosition: THREE.Vector3;
        };
        setState(state: any): void;
        private keydown;
        private keyup;
        private mousedown;
        mousemove(event: MouseEvent): void;
        mouseup(event: MouseEvent): void;
        private touchstart;
        private touchmove;
        private touchend;
        private preventContextMenu;
        private eventHandlers;
        private init;
        destroy(): void;
    }
}
declare namespace LiteMol.Visualization.Selection {
    interface Info {
        model: Model;
        elements?: number[];
    }
    class Pick {
        current: Info | null;
        currentPickId: number;
        currentPickElementId: number;
        getPickInfo(): Info | null;
        reset(): boolean;
        private selectPos;
        selectStart(x: number, y: number): void;
        selectEnd(x: number, y: number): boolean;
    }
    module Picking {
        function assignPickColor(elementId: number, color: {
            r: number;
            g: number;
            b: number;
        }): void;
        function applySceneIdFast(id: number, offset: number, data: number[]): void;
        function applySceneIdSlow(extraBits: number, id: number, offset: number, data: number[]): void;
        function getElementId(idWidth: number, buffer: Uint8Array): number;
        function getSceneId(idWidth: number, buffer: Uint8Array): number;
    }
    const enum Action {
        Select = 1,
        RemoveSelect = 2,
        Highlight = 3,
        RemoveHighlight = 4,
        Clear = 5
    }
    class VertexMapBuilder {
        private elementIndices;
        private elementMap;
        private elementRanges;
        private vertexRanges;
        private elementIndex;
        private elementRangeIndex;
        private rangeIndex;
        private added;
        startElement(index: number): void;
        addVertexRange(start: number, end: number): void;
        endElement(): void;
        getMap(): VertexMap;
        constructor(elementCount: number);
    }
    class VertexMap {
        elementIndices: number[];
        elementMap: Core.Utils.FastMap<number, number>;
        elementRanges: number[];
        vertexRanges: number[];
        constructor(elementIndices: number[], elementMap: Core.Utils.FastMap<number, number>, elementRanges: number[], vertexRanges: number[]);
    }
    function applyActionToRange(array: Float32Array, start: number, end: number, action: Action): boolean;
    function applyActionToBuffer(buffer: THREE.BufferAttribute, action: Action): boolean;
}
declare namespace LiteMol.Visualization.Geometry {
    interface RawGeometry {
        vertices: Float32Array;
        vertexCount: number;
        indices: Uint32Array;
        indexCount: number;
        normals?: Float32Array;
        elementSize: 2 | 3;
    }
    function toBufferGeometry(raw: RawGeometry): THREE.BufferGeometry;
    function addAttribute(geom: THREE.BufferGeometry, name: string, a: ArrayLike<number>, elementSize: number): void;
    import CoreUtils = Core.Utils;
    import ChunkedArray = CoreUtils.ChunkedArray;
    import ArrayBuilder = CoreUtils.ArrayBuilder;
    type Builder = Builder.Static | Builder.Dynamic;
    namespace Builder {
        interface Static {
            type: 'Static';
            vertices: ArrayBuilder<number>;
            indices: ArrayBuilder<number>;
            normals?: ArrayBuilder<number>;
            elementSize: 2 | 3;
        }
        interface Dynamic {
            type: 'Dynamic';
            vertices: ChunkedArray<number>;
            indices: ChunkedArray<number>;
            normals?: ChunkedArray<number>;
            elementSize: 2 | 3;
        }
        function createStatic(vertexCount: number, indexCount: number, elementSize?: 2 | 3): Static;
        function createDynamic(vertexChunkSize: number, indexChunkSize: number, elementSize?: 2 | 3): Dynamic;
        import Geom = Core.Geometry;
        import Vec3 = Geom.LinearAlgebra.Vector3;
        import Mat4 = Geom.LinearAlgebra.Matrix4;
        function addRawTransformed(builder: Builder, geom: RawGeometry, scale: number[] | undefined, translation: number[] | undefined, rotation: Mat4 | undefined): void;
        function addVertex3s(builder: Static, x: number, y: number, z: number): void;
        function addNormal3s(builder: Static, x: number, y: number, z: number): void;
        function addIndex3s(builder: Static, i: number, j: number, k: number): void;
        function addVertex3d(builder: Dynamic, x: number, y: number, z: number): void;
        function addNormal3d(builder: Dynamic, x: number, y: number, z: number): void;
        function addIndex3d(builder: Dynamic, i: number, j: number, k: number): void;
        function getDashTemplate(): RawGeometry;
        function addDashedLine(builder: Builder, a: Vec3, b: Vec3, size: number, gap: number, r: number): void;
        function toBufferGeometry(builder: Builder): THREE.BufferGeometry;
    }
}
declare namespace LiteMol.Visualization.Surface {
    import Data = Core.Geometry.Surface;
    function buildGeometry(data: Data, computation: Core.Computation.Context, isWireframe: boolean): Promise<Geometry>;
    class Geometry extends GeometryBase {
        geometry: THREE.BufferGeometry;
        vertexToElementMap: number[];
        elementToVertexMap: Selection.VertexMap;
        pickGeometry: THREE.BufferGeometry;
        pickPlatesGeometry: THREE.BufferGeometry;
        vertexStateBuffer: THREE.BufferAttribute;
        dispose(): void;
        constructor();
    }
}
declare namespace LiteMol.Visualization.Surface {
    interface Parameters {
        isWireframe?: boolean;
        mapPickElements?: (pickId: number) => (number[] | undefined);
    }
    const DefaultSurfaceModelParameters: Parameters;
    class Model extends Visualization.Model {
        private surface;
        private geometry;
        private material;
        private pickMaterial;
        private _mapPickElements;
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        highlightElement(pickId: number, highlight: boolean): boolean;
        protected highlightInternal(isOn: boolean): boolean;
        getPickElements(pickId: number): number[];
        getBoundingSphereOfSelection(indices: number[]): {
            radius: number;
            center: Core.Geometry.LinearAlgebra.Vector3;
        } | undefined;
        applyThemeInternal(theme: Theme): void;
        protected getPickObjectVisibility(visible: boolean): boolean;
        private createObjects;
        static create(entity: any, { surface, theme, parameters, props }: {
            surface: Core.Geometry.Surface;
            theme: Theme;
            parameters?: Parameters;
            props?: Model.Props;
        }): Core.Computation<Model>;
    }
}
declare namespace LiteMol.Visualization.Lines {
    class Geometry extends GeometryBase {
        geometry: THREE.BufferGeometry;
        center: THREE.Vector3;
        radius: number;
        dispose(): void;
        static create(vertices: Float32Array, indices: Uint32Array): Geometry;
        constructor();
    }
}
declare namespace LiteMol.Visualization.Lines {
    class Model extends Visualization.Model {
        private geometry;
        private material;
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        highlightElement(pickId: number, highlight: boolean): boolean;
        protected highlightInternal(isOn: boolean): boolean;
        getPickElements(pickId: number): number[];
        applyThemeInternal(theme: Theme): void;
        protected getPickObjectVisibility(visible: boolean): boolean;
        private createObjects;
        static create(entity: any, { geometry, theme, props }: {
            geometry: Geometry;
            theme: Theme;
            props?: Model.Props;
        }): Core.Computation<Model>;
    }
}
declare namespace LiteMol.Visualization.Labels {
    /**
     * Adapted from https://github.com/arose/ngl
     * MIT License Copyright (C) 2014+ Alexander Rose
     */
    interface TextAtlasParams {
        font: string[];
        size: number;
        style: string;
        variant: string;
        weight: string;
        outline: number;
        width: number;
        height: number;
    }
    const DefaultTextAtlasParams: TextAtlasParams;
    function getTextAtlas(params: Partial<TextAtlasParams>): TextAtlas;
    interface MappedMetrics {
        x: number;
        y: number;
        w: number;
        h: number;
    }
    class TextAtlas {
        params: TextAtlasParams;
        private gamma;
        private mapped;
        private state;
        private placeholder;
        lineHeight: number;
        private canvas;
        texture: THREE.Texture;
        constructor(params: Partial<TextAtlasParams>);
        private build;
        private map;
        getTextMetrics(text: string): MappedMetrics;
        private draw;
        private populate;
    }
}
declare namespace LiteMol.Visualization.Labels.Geometry {
    /**
     * Adapted from https://github.com/arose/ngl
     * MIT License Copyright (C) 2014+ Alexander Rose
     */
    function create(params: LabelsParams): {
        geometry: THREE.BufferGeometry;
        texture: THREE.Texture;
        options: LabelsOptions;
    };
}
declare namespace LiteMol.Visualization.Labels.Material {
    /**
     * Adapted from https://github.com/arose/ngl
     * MIT License Copyright (C) 2014+ Alexander Rose
     */
    const VERTEX_SHADER: string;
    const FRAGMENT_SHADER: string;
}
declare namespace LiteMol.Visualization.Labels.Material {
    function create(texture: THREE.Texture): THREE.ShaderMaterial;
}
declare namespace LiteMol.Visualization.Labels {
    interface LabelsOptions {
        fontFamily: "sans-serif" | "monospace" | "serif";
        fontSize: number;
        fontStyle: "normal" | "italic";
        fontWeight: "normal" | "bold";
        useSDF: boolean;
        attachment: "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-center" | "middle-right" | "top-left" | "top-center" | "top-right";
        backgroundMargin: number;
    }
    const DefaultLabelsOptions: LabelsOptions;
    interface LabelsParams {
        positions: Core.Structure.PositionTable;
        sizes: number[];
        labels: string[];
        options?: Partial<LabelsOptions>;
        theme: Theme;
    }
    class Model extends Visualization.Model {
        private geometry;
        private material;
        private labels;
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        getPickElements(pickId: number): number[];
        highlightElement(pickId: number, highlight: boolean): boolean;
        protected highlightInternal(isOn: boolean): boolean;
        private applyColoring;
        protected applyThemeInternal(theme: Theme): void;
        static create(entity: any, params: LabelsParams): Core.Computation<Model>;
    }
}
declare namespace LiteMol.Visualization.Molecule.BallsAndSticks {
    interface Parameters {
        tessalation?: number;
        atomRadius?: (i: number) => number;
        hideBonds?: boolean;
        hideHydrogens?: boolean;
        bondRadius?: number;
        customMaxBondLengths?: {
            get(e: string): number | undefined;
            has(e: string): boolean;
        };
    }
    const DefaultBallsAndSticksModelParameters: Parameters;
    class Model extends Visualization.Model {
        private material;
        private bondsMaterial;
        private pickMaterial;
        ballsAndSticks: BallsAndSticksGeometry;
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        getPickElements(pickId: number): number[];
        highlightElement(pickId: number, highlight: boolean): boolean;
        protected highlightInternal(isOn: boolean): boolean;
        applyThemeInternal(theme: Theme): void;
        private createObjects;
        static create(entity: any, { model, atomIndices, theme, params, props }: {
            model: Core.Structure.Molecule.Model;
            atomIndices: number[];
            theme: Theme;
            params: Parameters;
            props?: Model.Props;
        }): Core.Computation<Model>;
    }
}
declare namespace LiteMol.Visualization.Molecule.BallsAndSticks {
    function buildGeometry(model: Core.Structure.Molecule.Model, parameters: Parameters, atomIndices: number[], ctx: Core.Computation.Context): Promise<BallsAndSticksGeometry>;
    class BallsAndSticksGeometry extends GeometryBase {
        atomsGeometry: THREE.BufferGeometry;
        bondsGeometry: THREE.BufferGeometry;
        pickGeometry: THREE.BufferGeometry;
        atomVertexMap: Selection.VertexMap;
        vertexStateBuffer: THREE.BufferAttribute;
        dispose(): void;
    }
}
declare namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    class Data extends GeometryBase {
        geometry: THREE.BufferGeometry;
        pickGeometry: THREE.BufferGeometry;
        gapsGeometry: THREE.BufferGeometry | undefined;
        directionConesGeometry: THREE.BufferGeometry | undefined;
        vertexMap: Selection.VertexMap;
        vertexStateBuffer: THREE.BufferAttribute;
        dispose(): void;
    }
    interface CreateParameters {
        radialSegmentCount: number;
        tessalation: number;
        showDirectionCones: boolean;
    }
    interface Context {
        computation: Core.Computation.Context;
        model: Core.Structure.Molecule.Model;
        atomIndices: number[];
        linearSegments: number;
        parameters: CreateParameters;
        isTrace: boolean;
        params: CartoonsGeometryParams;
        state: CartoonsGeometryState;
        units: CartoonAsymUnit[];
        strandTemplate: {
            vertex: number[];
            normal: number[];
            index: number[];
            geometry: THREE.BufferGeometry;
        };
        strandArrays: {
            startIndex: number[];
            endIndex: number[];
            x: number[];
            y: number[];
            z: number[];
            name: string[];
        };
        builder: Builder;
        geom: Data;
    }
    function create(model: Core.Structure.Molecule.Model, atomIndices: number[], linearSegments: number, parameters: CreateParameters, isTrace: boolean, computation: Core.Computation.Context): Promise<Data>;
}
declare namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    class CartoonAsymUnit {
        private model;
        private elements;
        linearSegmentCount: number;
        private controlPointsBuilder;
        private torsionVectorsBuilder;
        private normalVectorsBuilder;
        private tempA;
        private tempB;
        private tempC;
        controlPoints: number[];
        torsionVectors: number[];
        normalVectors: number[];
        residueCount: number;
        structureStarts: Core.Utils.FastSet<string | number>;
        structureEnds: Core.Utils.FastSet<string | number>;
        residueType: Core.Structure.SecondaryStructureType[];
        residueIndex: Int32Array;
        backboneOnly: boolean;
        startResidueIndex: number;
        endResidueIndex: number;
        constructor(model: Core.Structure.Molecule.Model, elements: Core.Structure.SecondaryStructureElement[], linearSegmentCount: number);
        private createControlPoints;
        private initPositions;
        private initControlsPoints;
        private computeSplines;
        private addSplineNode;
        private reflectPositions;
    }
    namespace CartoonAsymUnit {
        function reflect(target: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, amount: number): void;
        function spline(target: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number): void;
        function maskSplit(element: Core.Structure.SecondaryStructureElement, mask: boolean[], target: Core.Structure.SecondaryStructureElement[]): void;
        function isCartoonLike(atomIndices: number[], start: number, end: number, name: string[], a: string, b: string, isAmk: boolean): boolean;
        function createMask(model: Core.Structure.Molecule.Model, atomIndices: number[]): boolean[];
        function buildUnits(model: Core.Structure.Molecule.Model, atomIndices: number[], linearSegmentCount: number): CartoonAsymUnit[];
    }
}
declare namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    class CartoonsGeometryParams {
        radialSegmentCount: number;
        turnWidth: number;
        strandWidth: number;
        nucleotideStrandLineWidth: number;
        nucleotideStrandFactor: number;
        helixWidth: number;
        helixHeight: number;
        sheetWidth: number;
        sheetHeight: number;
        arrowWidth: number;
        tessalation: number;
        static Default: CartoonsGeometryParams;
    }
    import GB = Visualization.Geometry.Builder;
    class CartoonsGeometryState {
        params: CartoonsGeometryParams;
        private residueCount;
        residueIndex: number;
        readonly verticesDone: number;
        readonly trianglesDone: number;
        builder: GB.Dynamic;
        private vs;
        private is;
        gapsBuilder: GB.Dynamic;
        private dCones;
        private dConesInit;
        readonly directionConesBuilder: GB.Dynamic;
        translationMatrix: THREE.Matrix4;
        scaleMatrix: THREE.Matrix4;
        rotationMatrix: THREE.Matrix4;
        invMatrix: THREE.Matrix4;
        vertexMap: Selection.VertexMapBuilder;
        addVertex(v: THREE.Vector3, n: THREE.Vector3): void;
        addTriangle(i: number, j: number, k: number): void;
        addTriangles(i: number, j: number, k: number, u: number, v: number, w: number): void;
        constructor(params: CartoonsGeometryParams, residueCount: number);
    }
    function buildUnit(unit: CartoonAsymUnit, ctx: Context): void;
    function buildUnitsAsync(ctx: Context): Promise<void>;
    function createGeometry(ctx: Context): void;
    class Builder {
        constructor();
        private tempVectors;
        private setVector;
        addTube(element: CartoonAsymUnit, state: CartoonsGeometryState, width: number, height: number, waveFactor: number): void;
        addTubeCap(element: CartoonAsymUnit, state: CartoonsGeometryState, width: number, height: number, isStart: boolean, isEnd: boolean): void;
        addSheet(element: CartoonAsymUnit, state: CartoonsGeometryState, isStart: boolean, isEnd: boolean): void;
        addSheetCap(element: CartoonAsymUnit, state: CartoonsGeometryState, isStart: boolean, isEnd: boolean): void;
        addSheepCapSection(state: CartoonsGeometryState, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3): void;
        private findN3;
        hasP(index: number, arrays: {
            startIndex: number[];
            endIndex: number[];
            x: number[];
            y: number[];
            z: number[];
            name: string[];
        }): boolean;
        addStrandLine(element: CartoonAsymUnit, state: CartoonsGeometryState, template: {
            vertex: number[];
            normal: number[];
            index: number[];
            geometry: THREE.BufferGeometry;
        }, arrays: {
            startIndex: number[];
            endIndex: number[];
            x: number[];
            y: number[];
            z: number[];
            name: string[];
        }, residueIndex: number): void;
    }
}
declare namespace LiteMol.Visualization.Molecule.Cartoons {
    enum CartoonsModelType {
        Default = 0,
        AlphaTrace = 1
    }
    interface Parameters {
        tessalation?: number;
        drawingType?: CartoonsModelType;
        showDirectionCones?: boolean;
    }
    const DefaultCartoonsModelParameters: Parameters;
    class Model extends Visualization.Model {
        private model;
        private material;
        private gapMaterial;
        private directionConeMaterial;
        private pickMaterial;
        private queryContext;
        private cartoons;
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        getPickElements(pickId: number): number[];
        highlightElement(pickId: number, highlight: boolean): boolean;
        protected highlightInternal(isOn: boolean): boolean;
        private applyColoring;
        protected applyThemeInternal(theme: Theme): void;
        private createObjects;
        static create(entity: any, { model, queryContext, atomIndices, theme, params, props }: {
            model: Core.Structure.Molecule.Model;
            queryContext: Core.Structure.Query.Context;
            atomIndices: number[];
            theme: Theme;
            params: Parameters;
            props?: Model.Props;
        }): Core.Computation<Model>;
    }
}
declare namespace LiteMol.Visualization.Molecule.Colors {
    const DefaultBondColor: Color;
    const DefaultCartoonDirectionConeColor: Color;
    const DefaultElementColor: {
        r: number;
        g: number;
        b: number;
    };
    const DefaultElementColorMap: Theme.ColorMap;
    const DefaultPallete: Color[];
}
declare namespace LiteMol.Visualization.Primitive {
    function createSphereSurface(sphere: Shape.Sphere): Core.Geometry.Surface;
    function createTubeSurface(tube: Shape.Tube): Core.Geometry.Surface;
    function createCone(cone: Shape.Cone): Core.Geometry.Surface;
    function createArrow(arrow: Shape.Arrow): Shape[];
    function createDashes(line: Shape.DashedLine): Shape.Surface[];
}
declare namespace LiteMol.Visualization.Primitive {
    import LA = Core.Geometry.LinearAlgebra;
    import Surface = Core.Geometry.Surface;
    type Shape = Shape.Sphere | Shape.Tube | Shape.Surface | Shape.DashedLine | Shape.Cone | Shape.Arrow;
    namespace Shape {
        type Sphere = {
            type: 'Sphere';
            center: LA.Vector3;
            radius: number;
            id: number;
            tessalation?: number;
        };
        type Tube = {
            type: 'Tube';
            a: LA.Vector3;
            b: LA.Vector3;
            radius: number;
            id: number;
            slices?: number;
        };
        type DashedLine = {
            type: 'DashedLine';
            a: LA.Vector3;
            b: LA.Vector3;
            width: number;
            dashSize: number;
            spaceSize?: number;
            id: number;
        };
        type Arrow = {
            type: 'Arrow';
            a: LA.Vector3;
            b: LA.Vector3;
            radius: number;
            id: number;
            coneRadius: number;
            coneHeight: number;
            slices?: number;
        };
        type Cone = {
            type: 'Cone';
            a: LA.Vector3;
            b: LA.Vector3;
            radius: number;
            id: number;
            slices?: number;
        };
        type Surface = {
            type: 'Surface';
            surface: Core.Geometry.Surface;
            id: number;
            scale?: number[];
            translation?: number[];
            rotation?: LA.Matrix4;
        };
    }
    class Builder {
        private shapes;
        add(shape: Shape): this;
        buildSurface(): Core.Computation<Surface>;
        static create(): Builder;
    }
}
declare namespace LiteMol.Bootstrap {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare namespace LiteMol.Bootstrap {
    export import Immutable = __LiteMolImmutable;
    export import Rx = Core.Rx;
    export import Zlib = LiteMolZlib;
}
declare namespace LiteMol.Bootstrap.Utils {
    /** Last recently used cache */
    interface LRUCache<T> {
        entries: LinkedList<LRUCache.Entry<T>>;
        capacity: number;
    }
    namespace LRUCache {
        interface Entry<T> extends LinkedElement<Entry<T>> {
            key: string;
            data: T;
        }
        function entry<T>(key: string, data: T): Entry<T>;
        function create<T>(capacity: number): LRUCache<T>;
        function get<T>(cache: LRUCache<T>, key: string): T | undefined;
        function set<T>(cache: LRUCache<T>, key: string, data: T): T;
    }
}
declare namespace LiteMol.Bootstrap.Utils {
    enum DataCompressionMethod {
        None = 0,
        Gzip = 1
    }
    interface AjaxGetParams {
        url: string;
        type: Entity.Data.Type;
        title?: string;
        compression?: DataCompressionMethod;
    }
    function readStringFromFile(file: File): Task<string>;
    function readArrayBufferFromFile(file: File): Task<ArrayBuffer>;
    function readFromFile(file: File, type: Entity.Data.Type): Task<string | ArrayBuffer>;
    function ajaxGetString(url: string, title?: string): Task<string>;
    function ajaxGetArrayBuffer(url: string, title?: string): Task<ArrayBuffer>;
    function ajaxGet(params: AjaxGetParams): Task<string | ArrayBuffer>;
}
declare namespace LiteMol.Bootstrap.Utils.Query {
    function parseAuthResidueId(ids: string, separator?: string): Core.Structure.Query;
}
declare namespace LiteMol.Bootstrap.Utils.Query {
    class ValueOrError<A> {
        isError: boolean;
        value?: A | undefined;
        error?: any;
        bind<B>(f: (v: A) => ValueOrError<B>): ValueOrError<B>;
        constructor(isError: boolean, value?: A | undefined, error?: any);
    }
    module ValueOrError {
        function error(err: any): ValueOrError<undefined>;
        function value<A>(v: A): ValueOrError<A>;
    }
}
declare namespace LiteMol.Bootstrap.Utils {
    interface LinkedElement<T> {
        previous: T | null;
        next: T | null;
        inList: boolean;
    }
    class LinkedList<T extends LinkedElement<T>> {
        count: number;
        first: T | null;
        private last;
        addFirst(item: T): void;
        addLast(item: T): void;
        remove(item: T): void;
    }
}
declare namespace LiteMol.Bootstrap.Utils {
    function formatTime(d: Date): string;
    function round(n: number, d: number): number;
    function formatProgress(p: Core.Computation.Progress): string;
    function generateUUID(): string;
}
declare namespace LiteMol.Bootstrap.Utils {
    function vdwRadiusFromElementSymbol(model: Core.Structure.Molecule.Model): (i: number) => number;
}
declare namespace LiteMol.Bootstrap.Utils {
    function shallowClone<T>(o: T): T;
    function shallowEqual<T>(a: T, b: T): boolean;
    function deepEqual<T>(a: T, b: T): boolean;
    function _assignType<T>(o: T, ...from: any[]): T;
    const assign: (<T>(o: T, ...from: any[]) => T);
    const merge: (<T>(source: T, ...rest: Partial<T>[]) => T);
}
declare namespace LiteMol.Bootstrap.Service {
    class Dispatcher {
        LOG_DISPATCH_STREAM: boolean;
        private lanes;
        constructor();
        dispatch<T>(event: Event<T>): void;
        schedule(action: () => void, onError?: (e: string) => void, timeout?: number): number;
        getStream<T>(type: Event.Type<T>): Event.Stream<T>;
        finished(): void;
    }
    module Dispatcher {
        enum Lane {
            Slow = 0,
            Fast = 1,
            Log = 2,
            Busy = 3,
            Transformer = 4,
            Task = 5
        }
    }
}
declare namespace LiteMol.Bootstrap.Service {
    class Logger {
        private context;
        private log;
        message(m: string): void;
        error(m: string): void;
        warning(m: string): void;
        info(m: string): void;
        constructor(context: Context);
    }
    module Logger {
        enum EntryType {
            Message = 0,
            Error = 1,
            Warning = 2,
            Info = 3
        }
        interface Entry {
            type: EntryType;
            timestamp: Date;
            message: any;
        }
    }
}
declare namespace LiteMol.Bootstrap.Service {
    interface Toast {
        title: string;
        message: string | {};
        /**
         * Only one message with a given key can be shown.
         */
        key?: string;
        /**
         * Specify a timeout for the message in milliseconds.
         */
        timeoutMs?: number;
    }
}
declare namespace LiteMol.Bootstrap {
    import Computation = Core.Computation;
    class Task<A> {
        name: string;
        type: Task.Type;
        private computation;
        private info;
        readonly id: number;
        readonly reportTime: boolean;
        run(context: Context): Promise<A>;
        runWithContext(context: Context): Task.Running<A>;
        setReportTime(report: boolean): this;
        constructor(name: string, type: Task.Type, computation: Computation<A>);
    }
    module Task {
        let __DEBUG_MODE__: boolean;
        type Type = 'Normal' | 'Background' | 'Silent';
        interface Info {
            id: number;
            type: Type;
            name: string;
            reportTime: boolean;
        }
        class Running<T> {
            private context;
            private computation;
            private info;
            private computationCtx;
            result: Promise<T>;
            tryAbort(): void;
            private progressUpdated;
            private resolved;
            private rejected;
            private run;
            constructor(context: Bootstrap.Context, computation: Computation<T>, info: Info);
        }
        interface State {
            taskId: number;
            type: Type;
            name: string;
            message: string;
            abort?: () => void;
        }
        function create<A>(name: string, type: Type, computation: (ctx: Computation.Context) => Promise<A>): Task<A>;
        function resolve<A>(name: string, type: Type, value: A): Task<A>;
        function reject<A>(name: string, type: Type, reason: any): Task<A>;
        function fromComputation<A>(name: string, type: Type, computation: Core.Computation<A>): Task<A>;
        function isPromise(t: any): t is Promise<any>;
    }
}
declare namespace LiteMol.Bootstrap {
    interface Event<T> {
        type: Event.Type<T>;
        data: T;
    }
    namespace Event {
        type Stream<T> = Rx.Observable<Event<T>>;
        import Lane = Service.Dispatcher.Lane;
        type Any = Event<any>;
        type AnyType = Type<any>;
        interface Type<T> {
            name: string;
            lane: Lane;
            dispatch(context: Context, data: T): void;
            getStream(context: Context): Stream<T>;
        }
        function create<T>(name: string, lane: Service.Dispatcher.Lane): Type<T>;
    }
}
declare namespace LiteMol.Bootstrap.Event {
    const Log: Type<Service.Logger.Entry>;
    namespace Common {
        const LayoutChanged: Type<{}>;
        const ComponentsChanged: Type<{}>;
    }
    namespace Task {
        const Started: Type<Bootstrap.Task.Info>;
        const Completed: Type<number>;
        const StateUpdated: Type<Bootstrap.Task.State>;
    }
    namespace Tree {
        import Node = Bootstrap.Tree.Node.Any;
        const NodeUpdated: Type<Node>;
        const NodeAdded: Type<Node>;
        const NodeRemoved: Type<Node>;
        const TransformStarted: Type<Bootstrap.Tree.Transform<Node, Node, any>>;
        const TransformFinished: Type<{
            transform: Bootstrap.Tree.Transform<Node, Node, any>;
            error?: any;
        }>;
        const TransformerApply: Type<{
            a: Bootstrap.Entity.Any;
            t: Bootstrap.Tree.Transform<Node, Node, any>;
        }>;
    }
    namespace Entity {
        import Entity = Bootstrap.Entity.Any;
        const CurrentChanged: Type<Entity>;
    }
    namespace Interactivity {
        const Highlight: Type<string[]>;
    }
    namespace Visual {
        const VisualHoverElement: Type<Bootstrap.Interactivity.Info>;
        const VisualSelectElement: Type<Bootstrap.Interactivity.Info>;
        const CameraChanged: Type<LiteMol.Visualization.Camera>;
    }
    namespace Molecule {
        const ModelHighlight: Type<Bootstrap.Interactivity.Molecule.SelectionInfo | undefined>;
        const ModelSelect: Type<Bootstrap.Interactivity.Molecule.SelectionInfo | undefined>;
    }
}
declare namespace LiteMol.Bootstrap.Command {
    namespace Tree {
        import Node = Bootstrap.Tree.Node.Any;
        const RemoveNode: Event.Type<any>;
        const ApplyTransform: Event.Type<{
            node: Node;
            transform: Bootstrap.Tree.Transform<Node, Node, any>;
            isUpdate?: boolean | undefined;
        }>;
    }
    namespace Entity {
        const SetCurrent: Event.Type<Bootstrap.Entity.Any>;
        const ToggleExpanded: Event.Type<Bootstrap.Entity.Any>;
        const SetVisibility: Event.Type<{
            entity: Bootstrap.Entity.Any;
            visible: boolean;
        }>;
        const Focus: Event.Type<Bootstrap.Entity.Any[]>;
        const Highlight: Event.Type<{
            entities: Bootstrap.Entity.Any[];
            isOn: boolean;
        }>;
    }
    namespace Layout {
        const SetState: Event.Type<Partial<Components.LayoutState>>;
        const SetViewportOptions: Event.Type<LiteMol.Visualization.SceneOptions>;
    }
    namespace Molecule {
        const FocusQuery: Event.Type<{
            model: Bootstrap.Entity.Molecule.Model;
            query: Core.Structure.Query.Source;
        }>;
        const Highlight: Event.Type<{
            model: Bootstrap.Entity.Molecule.Model;
            query: Core.Structure.Query.Source;
            isOn: boolean;
        }>;
        const CreateSelectInteraction: Event.Type<{
            entity: Bootstrap.Entity.Any;
            query: Core.Structure.Query.Source;
        }>;
    }
    namespace Visual {
        const ResetScene: Event.Type<void>;
        const ResetTheme: Event.Type<{
            selection?: string | Bootstrap.Entity.Any | Bootstrap.Tree.Selection.Query<Bootstrap.Entity.Any> | Bootstrap.Tree.Selection.Helpers.Builder<Bootstrap.Entity.Any> | undefined;
        } | undefined>;
        const UpdateBasicTheme: Event.Type<{
            visual: Bootstrap.Entity.Visual.Any;
            theme: LiteMol.Visualization.Theme;
        }>;
    }
    namespace Toast {
        const Show: Event.Type<Service.Toast>;
        const Hide: Event.Type<{
            key: string;
        }>;
    }
}
declare namespace LiteMol.Bootstrap {
    interface Tree<T extends Tree.Node.Any> {
        refs: Core.Utils.FastMap<string, T[]>;
        root: T;
        context: Context;
    }
    namespace Tree {
        type Any = Tree<Node.Any>;
        function create<T extends Node.Any>(context: Context, root: T): Tree<T>;
        function add<T extends Node.Any>(node: T): void;
        function update<T extends Node.Any>(tree: Tree<T>, old: T, e: T): void;
        function updatePath(node: Node.Any): void;
        function remove<T extends Tree.Node.Any>(node: T): void;
    }
}
declare namespace LiteMol.Bootstrap.Tree {
    interface Node<Props, State, TypeInfo> {
        id: number;
        version: number;
        index: number;
        ref: string;
        tag: any;
        type: Node.Type<TypeInfo, Props, this>;
        transform: Transform<any, this, any>;
        tree: Tree<Node.Any> | undefined;
        props: Props;
        state: State;
        isHidden: boolean;
        parent: Node.Any;
        children: Node.Any[];
    }
    module Node {
        interface Any extends Node<any, any, any> {
        }
        const Null: Any;
        interface Type<Info, Props, T extends Node.Any> {
            id: string;
            info: Info;
            create(transform: Transform<any, T, any>, props: Props): T;
        }
        type TypeOf<T extends Any> = Type<any, any, T>;
        type AnyType = Type<any, any, Any>;
        function is(e: Any, t: AnyType): boolean;
        function hasAncestor(e: Any, a: Any): boolean;
        function findAncestor(e: Any, t: AnyType): Any | undefined;
        function findClosestNodeOfType(e: Any, t: AnyType[]): Any | undefined;
        function createId(): number;
        function update<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(e: T): T;
        function withProps<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, props: Props): T;
        function withState<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, state: State): T;
        function addChild<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, c: T): T;
        function removeChild<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, child: T): T;
        function replaceChild<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, oldChild: T, newChild: T): T;
        function forEach<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, f: (n: T) => void): void;
        function forEachPreorder<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, f: (n: T) => void): void;
        function collect<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T): T[];
        function isHidden(e: Any): boolean;
    }
}
declare namespace LiteMol.Bootstrap.Tree {
    type Selector<T extends Node.Any> = Selection.Query<T> | Selection.Helpers.Builder<T> | string | T;
    namespace Selection {
        type NodeSeq<T extends Node.Any> = T[];
        type Query<T extends Node.Any> = (tree: Tree<T>) => NodeSeq<T>;
        function select<T extends Node.Any>(s: Selector<T>, tree: Tree<T>): T[];
        function compile<T extends Node.Any>(s: Selector<T>): Query<T>;
        namespace Helpers {
            const BuilderPrototype: any;
            function registerModifier(name: string, f: Function): void;
            interface Builder<T extends Node.Any> {
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
        function root<T extends Node.Any>(): Helpers.Builder<T>;
        function byRef<T extends Node.Any>(...refs: string[]): Helpers.Builder<T>;
        function byValue<T extends Node.Any>(...entities: Node.Any[]): Helpers.Builder<Node.Any>;
        function flatMap<T extends Node.Any>(b: Selector<T>, f: (n: T) => NodeSeq<T>): Helpers.Builder<T>;
        function mapEntity<T extends Node.Any>(b: Selector<T>, f: (n: T) => T): Helpers.Builder<T>;
        function unique<T extends Node.Any>(b: Selector<T>): Helpers.Builder<T>;
        function first<T extends Node.Any>(b: Selector<T>): Helpers.Builder<T>;
        function filter<T extends Node.Any>(b: Selector<T>, p: (n: Node.Any) => boolean): Helpers.Builder<T>;
        function subtree<T extends Node.Any>(b: Selector<T>): Helpers.Builder<T>;
        function children<T extends Node.Any>(b: Selector<T>): Helpers.Builder<T>;
        function ofType<T extends Node.Any>(b: Selector<T>, t: Node.AnyType): Helpers.Builder<T>;
        function ancestorOfType<T extends Node.Any>(b: Selector<T>, t: Node.AnyType): Helpers.Builder<T>;
        function parent<T extends Node.Any>(b: Selector<T>): Helpers.Builder<T>;
    }
}
declare namespace LiteMol.Bootstrap.Tree {
    import Node = Tree.Node.Any;
    interface Transformer<A extends Node, B extends Node, P> {
        info: Transformer.Info<A, B, P>;
        apply(context: Context, a: A, t: Transform<A, B, P>): Task<B>;
        update(context: Context, b: B, t: Transform<A, B, P>): Task<B>;
        create(params: P, props?: Transform.Props): Transform<A, B, P>;
    }
    namespace Transformer {
        type Any = Transformer<Node, Node, any>;
        interface Info<A extends Node, B extends Node, P> {
            id: string;
            name: string;
            description: string;
            isUpdatable?: boolean;
            from: Tree.Node.TypeOf<A>[];
            to: Tree.Node.TypeOf<B>[];
            validateParams?: (params: P) => string[] | undefined;
            defaultParams: (ctx: Context, e: A) => P | undefined;
            customController?: (ctx: Context, transformer: Transformer<A, B, P>, entity: Entity.Any) => Components.Transform.Controller<P>;
            isApplicable?: (e: A) => boolean;
            isComposed?: boolean;
        }
        function create<A extends Node, B extends Node, P>(info: Info<A, B, P>, transform: (ctx: Context, a: A, t: Transform<A, B, P>) => Task<B>, updater?: (ctx: Context, b: B, t: Transform<A, B, P>) => Task<B> | undefined): Transformer<A, B, P>;
        function internal<A extends Node, B extends Node, P>(id: string, from: Tree.Node.TypeOf<A>[], to: Tree.Node.TypeOf<B>[], transform: (ctx: Context, a: A, t: Transform<A, B, P>) => Task<B>): Transformer<Entity.Root, Entity.Root, {}>;
        interface ActionWithContext<T> {
            action: Transform.Source;
            context: T;
        }
        function action<A extends Node, B extends Node, P>(info: Info<A, B, P>, builder: (ctx: Context, a: A, t: Transform<A, B, P>) => Transform.Source, onDone?: string, onError?: string): Transformer<A, B, P>;
        function actionWithContext<A extends Node, B extends Node, P, T>(info: Info<A, B, P>, builder: (ctx: Context, a: A, t: Transform<A, B, P>) => ActionWithContext<T> | Promise<ActionWithContext<T>>, onDone?: (ctx: Context, actionCtx: T | undefined) => void, onError?: (ctx: Context, actionCtx: T | undefined, error: any) => void): Transformer<A, B, P>;
    }
}
declare namespace LiteMol.Bootstrap.Tree {
    import Node = Tree.Node.Any;
    interface Transform<A extends Node, B extends Node, P> {
        props: Transform.Props;
        transformer: Transformer<A, B, P>;
        params: P;
        isUpdate?: boolean;
        apply(context: Context, a: A): Core.Computation<B>;
        update(context: Context, b: B): Core.Computation<B>;
    }
    namespace Transform {
        type Any = Transform<Node, Node, any>;
        interface Props {
            isHidden?: boolean;
            isBinding?: boolean;
            ref?: string;
        }
        interface Instance {
            selector: Selector<Node>;
            transform: Any;
        }
        type Source = Instance | Instance[] | Builder;
        function create<A extends Node, B extends Node, P>(params: P, props: Props, transformer: Transformer<A, B, P>): Transform<A, B, P>;
        function execute(ctx: Context, source: Source, isUpdate: boolean): Core.Computation<void>;
        function apply(ctx: Context, source: Source): Core.Computation<void>;
        function update(ctx: Context, source: Source): Core.Computation<void>;
    }
}
declare namespace LiteMol.Bootstrap.Tree.Transform {
    import Node = Tree.Node.Any;
    function build(): Builder;
    interface Builder {
        add<A extends Node, B extends Node, P>(s: Selector<A>, t: Transformer<A, B, P>, params: P, props?: Transform.Props): Builder;
        then<C extends Node, Q>(t: Transformer<Node, C, Q>, params: Q, props?: Transform.Props): Builder;
        compile(): Instance[];
    }
    namespace Builder {
        class Impl<To extends Node> implements Builder {
            last: Instance | undefined;
            transforms: Instance[];
            add<A extends Node, B extends Node, P>(s: Selector<A>, t: Transformer<A, B, P>, params: P, props?: Transform.Props): Builder;
            then<C extends Node, Q>(t: Transformer<To, C, Q>, params: Q, props?: Transform.Props): Builder;
            compile(): Instance[];
            constructor(last: Instance | undefined, transforms: Instance[]);
        }
    }
}
declare namespace LiteMol.Bootstrap.Interactivity {
    type Info = Info.Empty | Info.Selection;
    namespace Info {
        const enum __Kind {
            Empty = 0,
            Selection = 1
        }
        interface Empty {
            kind: __Kind.Empty;
        }
        interface Selection {
            kind: __Kind.Selection;
            source: Entity.Any;
            elements: number[];
        }
        const empty: Empty;
        function selection(source: Entity.Any, elements: number[]): Selection;
    }
    function isEmpty(info: Info): info is Info.Empty;
    function isSelection(info: Info): info is Info.Selection;
    function interactivityInfoEqual(a: Info, b: Info): boolean;
    function interactivitySelectionElementsEqual(a: Info.Selection, b: Info.Selection): boolean;
}
declare namespace LiteMol.Bootstrap.Interactivity {
    type HighlightEntry = string;
    type HighlightProvider = (info: Info) => string | undefined;
    class HighlightManager {
        context: Context;
        providers: HighlightProvider[];
        addProvider(provider: HighlightProvider): void;
        removeProvider(provider: HighlightProvider): void;
        private empty;
        private getInfo;
        constructor(context: Context);
    }
}
declare namespace LiteMol.Bootstrap.Interactivity.Molecule {
    interface AtomInfo {
        index: number;
        x: number;
        y: number;
        z: number;
        id: number;
        name: string;
        authName: string;
        elementSymbol: string;
        occupancy: number;
        tempFactor: number;
        altLoc: string;
        residue: ResidueInfo;
    }
    interface ResidueInfo {
        index: number;
        name: string;
        authName: string;
        seqNumber: number;
        authSeqNumber: number;
        insCode: string;
        isHet: boolean;
        chain: ChainInfo;
    }
    interface ChainInfo {
        index: number;
        asymId: string;
        authAsymId: string;
        entity: EntityInfo;
    }
    interface EntityInfo {
        index: number;
        entityId: string;
    }
    interface SelectionInfo {
        modelRef: string;
        moleculeId: string;
        modelId: string;
        atoms: AtomInfo[];
        residues: ResidueInfo[];
        chains: ChainInfo[];
        entities: EntityInfo[];
    }
    function transformMoleculeAtomIndices(model: Entity.Molecule.Model, context: Core.Structure.Query.Context, indices: number[]): SelectionInfo;
    function transformInteraction(info: Interactivity.Info): SelectionInfo | undefined;
    function formatInfo(info: SelectionInfo | undefined): string;
    function formatInfoShort(info: SelectionInfo | undefined): string;
    function isMoleculeModelInteractivity(info: Info): info is Info.Selection;
}
declare namespace LiteMol.Bootstrap.Visualization {
    import Visual = Entity.Visual.Any;
    class DisplayList {
        private context;
        private scene;
        private entries;
        private originalThemes;
        private lastParent;
        isEmpty(): boolean;
        add(v: Visual): boolean;
        remove(v: Visual): boolean;
        get(id: number): {
            parentId: number;
            visual: Visual;
        } | undefined;
        resetThemesAndHighlight(sel?: Bootstrap.Tree.Selector<Bootstrap.Entity.Any>): void;
        private highlightMoleculeModel;
        constructor(context: Context, scene: SceneWrapper);
    }
    class SceneWrapper {
        private context;
        private _destroyed;
        private cameraChanged;
        private cameraObserver;
        scene: LiteMol.Visualization.Scene;
        models: DisplayList;
        private resetScene;
        readonly camera: LiteMol.Visualization.Camera;
        destroy(): void;
        private handleEvent;
        private focusMoleculeModelSelection;
        private focusMoleculeModelOnQuery;
        constructor(element: HTMLElement, context: Context, options?: LiteMol.Visualization.SceneOptions);
    }
}
declare namespace LiteMol.Bootstrap.Visualization {
    interface TypeDescription {
        label: string;
        shortLabel: string;
        description?: string;
    }
    interface Style<Type, Params> {
        taskType?: Task.Type;
        isNotSelectable?: boolean;
        type: Type;
        theme: Theme.Instance;
        params: Params;
    }
    import TransparencyDescription = LiteMol.Visualization.Theme.Transparency;
    namespace Style {
        interface Props<T> {
            taskType?: Task.Type;
            type: T;
            theme: Theme.Instance;
        }
        function getTaskType(style: Any): Task.Type;
        type Any = Style<any, any>;
        function create<Type>(style: Style<Type, any>): Style<Type, any>;
    }
    namespace Theme {
        interface Template {
            name: string;
            description?: string;
            colors?: Immutable.Map<string, LiteMol.Visualization.Color>;
            variables?: Immutable.Map<string, any>;
            provider: (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) => LiteMol.Visualization.Theme;
        }
        interface Instance {
            template: Template;
            colors?: Immutable.Map<string, LiteMol.Visualization.Color>;
            variables?: Immutable.Map<string, any>;
            transparency?: TransparencyDescription;
            interactive?: boolean;
            disableFog?: boolean;
        }
        function getProps(theme: Instance): LiteMol.Visualization.Theme.Props;
    }
}
declare namespace LiteMol.Bootstrap.Visualization.Molecule {
    import Vis = LiteMol.Visualization;
    const UniformBaseColors: Immutable.Map<string, Vis.Color>;
    const ModelVisualBaseColors: Immutable.Map<string, Vis.Color>;
    function createPaletteThemeProvider(provider: (m: Core.Structure.Molecule.Model) => {
        index: number[];
        property: any[];
    }, pallete: LiteMol.Visualization.Color[]): (e: Entity.Any, props?: Vis.Theme.Props | undefined) => Vis.Theme;
    function createCachedPaletteThemeProvider(name: string, provider: (m: Core.Structure.Molecule.Model) => {
        index: number[];
        property: any[];
    }, pallete: LiteMol.Visualization.Color[]): (e: Entity.Any, props?: Vis.Theme.Props | undefined) => Vis.Theme;
    function uniformThemeProvider(e: Entity.Any, props?: LiteMol.Visualization.Theme.Props): Vis.Theme;
    function createColorMapThemeProvider(provider: (m: Core.Structure.Molecule.Model) => {
        index: number[];
        property: any[];
    }, colorMap: LiteMol.Visualization.Theme.ColorMap, fallbackColor: LiteMol.Visualization.Color): (e: Entity.Any, props?: Vis.Theme.Props | undefined) => Vis.Theme;
    function createCachedColorMapThemeProvider(name: string, provider: (m: Core.Structure.Molecule.Model) => {
        index: number[];
        property: any[];
    }, colorMap: LiteMol.Visualization.Theme.ColorMap, fallbackColor: LiteMol.Visualization.Color): (e: Entity.Any, props?: Vis.Theme.Props | undefined) => Vis.Theme;
    const RainbowPalette: Vis.Color[];
    namespace Default {
        const Themes: Theme.Template[];
        const CartoonThemeTemplate: Theme.Template;
        const ElementSymbolThemeTemplate: Theme.Template;
        const SurfaceThemeTemplate: Theme.Template;
        const UniformThemeTemplate: Theme.Template;
        const RainbowEntityThemeTemplate: Theme.Template;
    }
}
declare namespace LiteMol.Bootstrap.Visualization.Molecule {
    type Source = Entity.Molecule.Model | Entity.Molecule.Selection;
    type DetailType = 'Automatic' | 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
    type Style<Params> = Visualization.Style<Type, Params>;
    const TypeDescriptions: {
        'Cartoons': TypeDescription;
        'Calpha': TypeDescription;
        'BallsAndSticks': TypeDescription;
        'VDWBalls': TypeDescription;
        'Surface': TypeDescription;
    };
    type Type = keyof (typeof TypeDescriptions);
    const Types: Type[];
    const DetailTypes: DetailType[];
    interface DetailParams {
        detail: DetailType;
    }
    interface CartoonParams extends DetailParams {
        showDirectionCone: boolean;
    }
    interface BallsAndSticksParams extends DetailParams {
        useVDW: boolean;
        vdwScaling?: number;
        atomRadius?: number;
        bondRadius: number;
        hideHydrogens?: boolean;
        customMaxBondLengths?: {
            [e: string]: number;
        };
    }
    interface SurfaceParams {
        probeRadius: number;
        automaticDensity?: boolean;
        density: number;
        smoothing: number;
        isWireframe: boolean;
    }
    namespace Default {
        const DetailParams: DetailParams;
        const CartoonParams: CartoonParams;
        const BallsAndSticksParams: BallsAndSticksParams;
        const SurfaceParams: SurfaceParams;
        const Transparency: LiteMol.Visualization.Theme.Transparency;
        const ForType: Map<Type, Style<any>>;
    }
}
declare namespace LiteMol.Bootstrap.Visualization.Molecule {
    function create(source: Source, transform: Tree.Transform<Entity.Molecule.Model | Entity.Molecule.Selection, Entity.Molecule.Visual, any>, style: Style<any>): Task<Entity.Molecule.Visual>;
}
declare namespace LiteMol.Bootstrap.Visualization.Labels {
    function createMoleculeLabels(parent: Entity.Any, transform: Tree.Transform<Entity.Any, Entity.Visual.Labels, any>, style: Style<Utils.Molecule.Labels3DOptions>): Task<Entity.Visual.Labels>;
    function createGenericLabels(parent: Entity.Any, transform: Tree.Transform<Entity.Any, Entity.Visual.Labels, any>, params: Bootstrap.Entity.Transformer.Labels.CreateParams): Task<Entity.Visual.Labels>;
}
declare namespace LiteMol.Bootstrap.Visualization.Labels {
    type Style<P> = Visualization.Style<'Labels', P>;
    namespace Style {
        function moleculeHasOnlyThemeChanged(oldS: Style<Utils.Molecule.Labels3DOptions>, newS: Style<Utils.Molecule.Labels3DOptions>): boolean;
        function createMoleculeStyle(params: {
            kind: Utils.Molecule.Labels3DOptions['kind'];
            labelsOptions?: LiteMol.Visualization.Labels.LabelsOptions;
            theme?: Theme.Instance;
        }): Style<Utils.Molecule.Labels3DOptions>;
    }
    namespace Default {
        import Vis = LiteMol.Visualization;
        const Theme: Theme.Template;
        const MoleculeLabels: Style<Utils.Molecule.Labels3DOptions>;
        const GenericLabels: Style<Vis.Labels.LabelsOptions>;
    }
}
declare namespace LiteMol.Bootstrap.Visualization.Density {
    function create(parent: Entity.Density.Data, transform: Tree.Transform<Entity.Density.Data, Entity.Density.Visual, any>, style: Style): Task<Entity.Density.Visual>;
}
declare namespace LiteMol.Bootstrap.Visualization.Density {
    enum IsoValueType {
        Sigma = 0,
        Absolute = 1
    }
    interface Params {
        bottomLeft?: number[];
        topRight?: number[];
        isoValueType: IsoValueType;
        isoValue: number;
        smoothing: number;
        isWireframe: boolean;
    }
    function areNonIsoParamsSame(a: Params, b: Params): boolean;
    type Style = Visualization.Style<'Density', Params>;
    namespace Style {
        function create(params: {
            isoValue: number;
            isoValueType: IsoValueType;
            color: LiteMol.Visualization.Color;
            isWireframe?: boolean;
            disableFog?: boolean;
            transparency?: LiteMol.Visualization.Theme.Transparency;
            taskType?: Task.Type;
        }): Style;
    }
    namespace Default {
        const Params: Params;
        const Themes: Theme.Template[];
        const Transparency: LiteMol.Visualization.Theme.Transparency;
        const Theme: Theme.Template;
        const Style: Style;
    }
}
declare namespace LiteMol.Bootstrap {
    interface Entity<Props extends {}> extends Tree.Node<Props & Entity.CommonProps, Entity.State, Entity.TypeInfo> {
    }
    namespace Entity {
        interface CommonProps {
            label: string;
            description?: string;
        }
        const enum Visibility {
            Full = 0,
            Partial = 1,
            None = 2
        }
        interface State {
            isCollapsed?: boolean;
            visibility?: Visibility;
        }
        interface Any extends Entity<{}> {
        }
        type Tree = Bootstrap.Tree<Any>;
        function isClass(e: Any, cls: TypeClass): boolean;
        function isTypeClass(e: AnyType, cls: TypeClass): boolean;
        type TypeClass = 'Root' | 'Group' | 'Data' | 'Object' | 'Visual' | 'Selection' | 'Action' | 'Behaviour';
        interface TypeTraits {
            isFocusable?: boolean;
            isSilent?: boolean;
        }
        interface TypeInfoBase {
            name: string;
            shortName: string;
            description: string;
            typeClass: TypeClass;
        }
        interface TypeInfo extends TypeInfoBase {
            traits: TypeTraits;
        }
        interface Type<P> extends Tree.Node.Type<TypeInfo, P, Entity<P>> {
            create(transform: Tree.Transform<Any, Entity<P>, any>, props: P & CommonProps): Entity<P>;
        }
        type AnyType = Type<{}>;
        const RootClass: TypeClass;
        const GroupClass: TypeClass;
        const DataClass: TypeClass;
        const ObjectClass: TypeClass;
        const VisualClass: TypeClass;
        const SelectionClass: TypeClass;
        const ActionClass: TypeClass;
        const BehaviourClass: TypeClass;
        function create<Props>(info: TypeInfoBase, traits?: TypeTraits): Type<Props>;
    }
}
declare namespace LiteMol.Bootstrap.Entity {
    function nodeUpdated(e: Any): void;
    function toggleExpanded(e: Entity.Any): void;
    function setCurrent(e: Entity.Any): void;
    function updateVisibilityState(entity: Any): void;
    function setVisibility(entity: Any, visible: boolean): void;
}
declare namespace LiteMol.Bootstrap.Entity {
    function isMolecule(e: Any): e is Molecule.Molecule;
    function isMoleculeModel(e: Any): e is Molecule.Model;
    function isMoleculeSelection(e: Any): e is Molecule.Selection;
    function isVisual(e: Any): e is Visual.Any;
    const RootTransform: Tree.Transform<Root, Root, {}>;
    interface Root extends Entity<{}> {
    }
    const Root: Type<{}>;
    interface Group extends Entity<{}> {
    }
    const Group: Type<{}>;
    interface Action extends Entity<{}> {
    }
    const Action: Type<{}>;
    namespace Behaviour {
        interface Props<T extends Bootstrap.Behaviour.Dynamic> {
            behaviour: T;
        }
        interface Any extends Entity<{
            behaviour: Bootstrap.Behaviour.Dynamic;
        }> {
        }
    }
    namespace Data {
        type Type = 'String' | 'Binary';
        const Types: Type[];
        interface String extends Entity<{
            data: string;
        }> {
        }
        const String: Entity.Type<{
            data: string;
        }>;
        interface Binary extends Entity<{
            data: ArrayBuffer;
        }> {
        }
        const Binary: Entity.Type<{
            data: ArrayBuffer;
        }>;
        interface CifDictionary extends Entity<{
            dictionary: Core.Formats.CIF.File;
        }> {
        }
        const CifDictionary: Entity.Type<{
            dictionary: LiteMolCIFTools.File;
        }>;
        interface Json extends Entity<{
            data: any;
        }> {
        }
        const Json: Entity.Type<{
            data: any;
        }>;
    }
    namespace Visual {
        interface Props<Type> {
            model: LiteMol.Visualization.Model;
            style: Visualization.Style<Type, any>;
            isSelectable: boolean;
        }
        interface Any extends Entity<Props<any>> {
        }
        interface Surface extends Entity<Props<'Surface'> & {
            tag: any;
        }> {
        }
        const Surface: Type<Props<"Surface"> & {
            tag: any;
        }>;
        interface Labels extends Entity<Visual.Props<'Labels'>> {
        }
        const Labels: Type<Props<"Labels">>;
    }
    namespace Molecule {
        interface Molecule extends Entity<{
            molecule: Core.Structure.Molecule;
        }> {
        }
        const Molecule: Type<{
            molecule: Core.Structure.Molecule;
        }>;
        interface Model extends Entity<{
            model: Core.Structure.Molecule.Model;
        }> {
        }
        const Model: Type<{
            model: Core.Structure.Molecule.Model;
        }>;
        interface Selection extends Entity<{
            indices: number[];
        }> {
        }
        const Selection: Type<{
            indices: number[];
        }>;
        interface Visual extends Entity<Visual.Props<Bootstrap.Visualization.Molecule.Type> & {
            tag?: any;
        }> {
        }
        const Visual: Type<Visual.Props<"Surface" | "Cartoons" | "Calpha" | "BallsAndSticks" | "VDWBalls"> & {
            tag?: any;
        }>;
        namespace CoordinateStreaming {
            interface Behaviour extends Entity<Behaviour.Props<Bootstrap.Behaviour.Molecule.CoordinateStreaming>> {
            }
            const Behaviour: Type<Behaviour.Props<Bootstrap.Behaviour.Molecule.CoordinateStreaming>>;
        }
    }
    namespace Density {
        interface Data extends Entity<{
            data: Core.Formats.Density.Data;
        }> {
        }
        const Data: Type<{
            data: Core.Formats.Density.Data;
        }>;
        interface Visual extends Entity<Visual.Props<'Density'>> {
        }
        const Visual: Type<Visual.Props<"Density">>;
        interface InteractiveSurface extends Entity<Behaviour.Props<Bootstrap.Behaviour.Density.ShowDynamicDensity>> {
        }
        const InteractiveSurface: Type<Behaviour.Props<Bootstrap.Behaviour.Density.ShowDynamicDensity>>;
    }
}
declare namespace LiteMol.Bootstrap.Entity {
    class Cache {
        private data;
        get<T>(e: Any, prop: string): T | undefined;
        set<T>(e: Any, prop: string, value: T): T;
        constructor(context: Context);
    }
    namespace Cache.Keys {
        const QueryContext = "queryContext";
    }
}
declare namespace LiteMol.Bootstrap.Entity.Transformer.Basic {
    import Transformer = Tree.Transformer;
    const Root: Transformer<Root, Root, {}>;
    const Fail: Transformer<Any, Root, {
        title: string;
        message: string;
    }>;
    interface CreateGroupParams {
        label?: string;
        description?: string;
        isCollapsed?: boolean;
    }
    const CreateGroup: Transformer<Any, Root, CreateGroupParams>;
    const Delay: Transformer<Root, Action, {
        timeoutMs: number;
    }>;
    interface CreateSurfaceVisualParams {
        surface: Core.Geometry.Surface;
        theme: LiteMol.Visualization.Theme;
        label?: string;
        tag?: any;
        isWireframe?: boolean;
        isNotInteractive?: boolean;
        taskType?: Task.Type;
    }
    const CreateSurfaceVisual: Transformer<Root, Visual.Surface, CreateSurfaceVisualParams>;
}
declare namespace LiteMol.Bootstrap.Entity.Transformer.Molecule {
    interface DownloadMoleculeSourceParams {
        id: string;
        format: Core.Formats.FormatInfo;
    }
    function downloadMoleculeSource(params: {
        sourceId: string;
        name: string;
        description: string;
        urlTemplate: (id: string) => string;
        defaultId: string;
        specificFormat?: Core.Formats.FormatInfo;
        isFullUrl?: boolean;
    }): Tree.Transformer<Root, Action, DownloadMoleculeSourceParams>;
    interface OpenMoleculeFromFileParams {
        file: File | undefined;
    }
    const OpenMoleculeFromFile: Tree.Transformer<Root, Action, OpenMoleculeFromFileParams>;
    interface CreateFromDataParams {
        format: Core.Formats.FormatInfo;
        customId?: string;
    }
    const CreateFromData: Tree.Transformer<Entity.Data.String | Entity.Data.Binary, Entity.Molecule.Molecule, CreateFromDataParams>;
    interface CreateFromMmCifParams {
        blockIndex: number;
    }
    const CreateFromMmCif: Tree.Transformer<Entity.Data.CifDictionary, Entity.Molecule.Molecule, CreateFromMmCifParams>;
    interface CreateModelParams {
        modelIndex: number;
    }
    const CreateModel: Tree.Transformer<Entity.Molecule.Molecule, Entity.Molecule.Model, CreateModelParams>;
    interface CreateSelectionParams {
        name?: string;
        queryString: string;
        silent?: boolean;
        inFullContext?: boolean;
    }
    const CreateSelection: Tree.Transformer<Entity.Molecule.Model | Entity.Molecule.Visual, Entity.Molecule.Selection, CreateSelectionParams>;
    interface CreateSelectionFromQueryParams {
        query: Core.Structure.Query.Source;
        name?: string;
        silent?: boolean;
        inFullContext?: boolean;
    }
    const CreateSelectionFromQuery: Tree.Transformer<Entity.Molecule.Model | Entity.Molecule.Selection | Entity.Molecule.Visual, Entity.Molecule.Selection, CreateSelectionFromQueryParams>;
    interface CreateAssemblyParams {
        name: string;
    }
    const CreateAssembly: Tree.Transformer<Entity.Molecule.Model, Entity.Molecule.Model, CreateAssemblyParams>;
    interface CreateSymmetryMatesParams {
        type: 'Mates' | 'Interaction';
        radius: number;
    }
    const CreateSymmetryMates: Tree.Transformer<Entity.Molecule.Model, Entity.Molecule.Model, CreateSymmetryMatesParams>;
    interface ModelTransform3DParams {
        /**
         * a 4x4 matrix stored as 1D array in column major order.
         * (Use Core.Geometry.LinearAlgebra.Matrix4.empty & setValue(m, row, column, value)
         *  if you are not sure).
         */
        transform: number[];
        description?: string;
    }
    const ModelTransform3D: Tree.Transformer<Entity.Molecule.Model, Entity.Molecule.Model, ModelTransform3DParams>;
    interface CreateVisualParams {
        style: Visualization.Molecule.Style<any>;
    }
    const CreateVisual: Tree.Transformer<Entity.Molecule.Model | Entity.Molecule.Selection, Entity.Molecule.Visual, CreateVisualParams>;
    interface CreateMacromoleculeVisualParams {
        groupRef?: string;
        polymer?: boolean;
        polymerRef?: string;
        het?: boolean;
        hetRef?: string;
        water?: boolean;
        waterRef?: string;
    }
    const CreateMacromoleculeVisual: Tree.Transformer<Entity.Molecule.Model | Entity.Molecule.Selection, Action, CreateMacromoleculeVisualParams>;
    interface CreateLabelsParams {
        style: Visualization.Labels.Style<Utils.Molecule.Labels3DOptions>;
    }
    const CreateLabels: Tree.Transformer<Entity.Molecule.Model | Entity.Molecule.Selection | Entity.Molecule.Visual, Visual.Labels, CreateLabelsParams>;
}
declare namespace LiteMol.Bootstrap.Entity.Transformer.Labels {
    interface CreateParams {
        positions: Core.Structure.PositionTable;
        sizes: number[];
        labels: string[];
        options: LiteMol.Visualization.Labels.LabelsOptions;
        style: Visualization.Labels.Style<LiteMol.Visualization.Labels.LabelsOptions>;
    }
    const Create: Tree.Transformer<Root, Visual.Labels, CreateParams>;
}
declare namespace LiteMol.Bootstrap.Entity.Transformer.Data {
    interface DownloadParams {
        id?: string;
        description?: string;
        type: string;
        url: string;
        title?: string;
        responseCompression?: Utils.DataCompressionMethod;
    }
    const Download: Tree.Transformer<Root, Entity.Data.String | Entity.Data.Binary, DownloadParams>;
    interface OpenFileParams {
        description?: string;
        id?: string;
        file: File | undefined;
        type?: string;
    }
    const OpenFile: Tree.Transformer<Root, Entity.Data.String | Entity.Data.Binary, OpenFileParams>;
    interface ParseCifParams {
        id?: string;
        description?: string;
    }
    const ParseCif: Tree.Transformer<Entity.Data.String, Entity.Data.CifDictionary, ParseCifParams>;
    interface ParseBinaryCifParams {
        id?: string;
        description?: string;
    }
    const ParseBinaryCif: Tree.Transformer<Entity.Data.Binary, Entity.Data.CifDictionary, ParseBinaryCifParams>;
    interface ParseJsonParams {
        id?: string;
        description?: string;
    }
    const ParseJson: Tree.Transformer<Entity.Data.String, Entity.Data.Json, ParseJsonParams>;
    interface FromDataParams {
        id?: string;
        description?: string;
        data: string | ArrayBuffer;
    }
    const FromData: Tree.Transformer<Root, Entity.Data.String | Entity.Data.Binary, FromDataParams>;
}
declare namespace LiteMol.Bootstrap.Entity.Transformer.Density {
    interface ParseDataParams {
        id?: string;
        format: LiteMol.Core.Formats.FormatInfo;
    }
    const ParseData: Tree.Transformer<Entity.Data.String | Entity.Data.Binary, Entity.Density.Data, ParseDataParams>;
    interface CreateFromCifParams {
        id?: string;
        blockIndex: number;
    }
    const CreateFromCif: Tree.Transformer<Entity.Data.CifDictionary, Entity.Density.Data, CreateFromCifParams>;
    interface CreateFromDataParams {
        id?: string;
        data: Core.Formats.Density.Data;
    }
    const CreateFromData: Tree.Transformer<Root, Entity.Density.Data, CreateFromDataParams>;
    interface CreateVisualParams {
        style: Visualization.Density.Style;
    }
    const CreateVisual: Tree.Transformer<Entity.Density.Data, Entity.Density.Visual, CreateVisualParams>;
    interface CreateVisualBehaviourParams {
        id?: string;
        isoSigmaMin: number;
        isoSigmaMax: number;
        minRadius: number;
        maxRadius: number;
        radius: number;
        showFull: boolean;
        style: Visualization.Density.Style;
    }
    const CreateVisualBehaviour: Tree.Transformer<Entity.Density.Data, Entity.Density.InteractiveSurface, CreateVisualBehaviourParams>;
}
declare namespace LiteMol.Bootstrap.Entity.Transformer.Molecule.CoordinateStreaming {
    interface CreateStreamingBehaviourParams {
        server: string;
        radius: number;
    }
    const CreateBehaviour: Tree.Transformer<Entity.Molecule.Model, Entity.Molecule.CoordinateStreaming.Behaviour, CreateStreamingBehaviourParams>;
    interface CreateModelParams {
        data: ArrayBuffer;
        transform: number[];
    }
    const CreateModel: Tree.Transformer<Entity.Molecule.CoordinateStreaming.Behaviour, Entity.Molecule.Model, CreateModelParams>;
    interface InitStreamingParams {
        id: string;
        server: string;
        radius: number;
    }
    const InitStreaming: Tree.Transformer<Root, Action, InitStreamingParams>;
}
declare namespace LiteMol.Bootstrap.Utils.Molecule {
    import Structure = LiteMol.Core.Structure;
    import Geometry = LiteMol.Core.Geometry;
    import LA = Geometry.LinearAlgebra;
    function findModel(entity: Entity.Any): Entity.Molecule.Model | undefined;
    function findModelOrSelection(entity: Entity.Any): Entity.Molecule.Model | Entity.Molecule.Selection | undefined;
    function findMolecule(entity: Entity.Any): Entity.Molecule.Molecule | undefined;
    function findQueryContext(entity: Entity.Any): Structure.Query.Context;
    function getDistance(mA: Structure.Molecule.Model, startAtomIndexA: number, endAtomIndexA: number, mB: Structure.Molecule.Model, startAtomIndexB: number, endAtomIndexB: number): number;
    function getDistanceSet(mA: Structure.Molecule.Model, setA: number[], mB: Structure.Molecule.Model, setB: number[]): number;
    function getModelAndIndicesFromQuery(m: Entity.Any, query: Core.Structure.Query.Source): {
        model: Entity.Molecule.Model;
        indices: number[];
        queryContext: Core.Structure.Query.Context;
    } | undefined;
    function getResidueIndices(m: Core.Structure.Molecule.Model, atom: number): number[];
    function getBox(molecule: Core.Structure.Molecule.Model, atomIndices: number[], delta: number): {
        bottomLeft: number[];
        topRight: number[];
    };
    class CentroidHelper {
        center: {
            x: number;
            y: number;
            z: number;
        };
        radiusSquared: number;
        count: number;
        private x;
        private y;
        private z;
        addAtom(i: number): void;
        finishedAdding(): void;
        radiusVisit(i: number): void;
        constructor(model: LiteMol.Core.Structure.Molecule.Model);
    }
    function getCentroidAndRadius(m: Structure.Molecule.Model, indices: number[], into: LA.Vector3): number;
    interface Labels3DOptions {
        kind: 'Residue-Name' | 'Residue-Full-Id' | 'Atom-Name' | 'Atom-Element';
        labelsOptions: LiteMol.Visualization.Labels.LabelsOptions;
    }
    const Labels3DKinds: Labels3DOptions['kind'][];
    const Labels3DKindLabels: {
        [kind: string]: string;
    };
    function create3DLabelsParams(entity: Entity.Any, options: Labels3DOptions, theme: LiteMol.Visualization.Theme): LiteMol.Visualization.Labels.LabelsParams;
}
declare namespace LiteMol.Bootstrap.Behaviour {
    class Streams {
        context: Context;
        private subjects;
        select: Rx.Observable<Interactivity.Info>;
        click: Rx.Observable<Interactivity.Info>;
        currentEntity: Rx.Observable<Entity.Any | undefined>;
        private init;
        constructor(context: Context);
    }
}
declare namespace LiteMol.Bootstrap.Behaviour {
    interface Dynamic {
        dispose(): void;
        register(behaviour: Entity.Behaviour.Any): void;
    }
    function SetEntityToCurrentWhenAdded(context: Context): void;
    /** An ugly hack that will be removed when the time comes */
    let SuppressCreateVisualWhenModelIsAdded: boolean;
    function CreateVisualWhenModelIsAdded(context: Context): void;
    function ApplySelectionToVisual(context: Context): void;
    function ApplyInteractivitySelection(context: Context): void;
    function FilteredApplyInteractivitySelection(filter: (e: Interactivity.Info, ctx: Context) => boolean): (context: Context) => void;
    function UnselectElementOnRepeatedClick(context: Context): void;
    function FocusCameraOnSelect(context: Context): void;
    function FilteredFocusCameraOnSelect(filter: (e: Interactivity.Info, ctx: Context) => boolean): (context: Context) => void;
}
declare namespace LiteMol.Bootstrap.Behaviour.Molecule {
    /** An ugly hack that will be removed when the time comes */
    let SuppressShowInteractionOnSelect: boolean;
    function ShowInteractionOnSelect(radius: number): (context: Context) => void;
    function HighlightElementInfo(context: Context): void;
    function DistanceToLastClickedElement(context: Context): void;
}
declare namespace LiteMol.Bootstrap.Behaviour.Density {
    interface ShowDynamicDensityParams {
        style: Visualization.Density.Style;
        showFull: boolean;
        radius: number;
    }
    class ShowDynamicDensity implements Dynamic {
        context: Context;
        params: ShowDynamicDensityParams;
        private obs;
        private behaviour;
        private ref;
        private remove;
        private getVisual;
        private update;
        updateTheme(ti: Visualization.Theme.Instance): void;
        dispose(): void;
        register(behaviour: Entity.Behaviour.Any): void;
        constructor(context: Context, params: ShowDynamicDensityParams);
    }
}
declare namespace LiteMol.Bootstrap.Behaviour.Molecule {
    class CoordinateStreaming implements Dynamic {
        context: Context;
        radius: number;
        private obs;
        private target;
        private behaviour;
        private ref;
        private download;
        private cache;
        server: string;
        private remove;
        private isApplicable;
        private style;
        private update;
        private create;
        dispose(): void;
        register(behaviour: Entity.Behaviour.Any): void;
        constructor(context: Context, server: string, radius?: number);
    }
    namespace CoordinateStreaming {
        function normalizeServerName(s: string): string;
        function getBaseUrl(id: string, server: string): string;
    }
}
declare namespace LiteMol.Bootstrap.Behaviour {
    function GoogleAnalytics(id: string, key?: string): (context: Context) => void;
}
declare namespace LiteMol.Bootstrap.Components {
    class Component<State> {
        context: Context;
        private _state;
        private _latestState;
        readonly dispatcher: Service.Dispatcher;
        setState(...states: Partial<State>[]): void;
        readonly state: Rx.Observable<State>;
        readonly latestState: State;
        constructor(context: Context, initialState: State);
    }
    interface ComponentInfo {
        key: string;
        controller: Bootstrap.Components.Component<any>;
        view: any;
        region: LayoutRegion;
        isStatic?: boolean;
    }
}
declare namespace LiteMol.Bootstrap.Components {
    enum LayoutRegion {
        Main = 0,
        Top = 1,
        Right = 2,
        Bottom = 3,
        Left = 4,
        Root = 5
    }
    enum CollapsedControlsLayout {
        Outside = 0,
        Landscape = 1,
        Portrait = 2
    }
    class LayoutTarget {
        cssClass: string;
        components: ComponentInfo[];
        constructor(cssClass: string);
    }
    function makeEmptyTargets(): LayoutTarget[];
    type RegionState = 'Hidden' | 'Sticky' | 'Default';
    interface LayoutState {
        isExpanded: boolean;
        hideControls: boolean;
        collapsedControlsLayout: CollapsedControlsLayout;
        regionStates?: {
            [region: number]: RegionState;
        };
    }
    class Layout extends Component<LayoutState> {
        targets: LayoutTarget[];
        private root;
        update(state: Partial<LayoutState>): void;
        private rootState;
        private expandedViewport;
        private getScrollElement;
        private handleExpand;
        updateTargets(targets: LayoutTarget[]): void;
        constructor(context: Context, targets: LayoutTarget[], root: HTMLElement);
    }
}
declare namespace LiteMol.Bootstrap.Components.Transform {
    interface ControllerParams<P> {
        params: P;
        isDirty: boolean;
        issues: string[] | undefined;
        canApply: boolean;
        isBusy: boolean;
        parametersAutoUpdating: boolean;
    }
    class Controller<P> extends Component<ControllerParams<P>> {
        transformer: Tree.Transformer.Any;
        entity: Entity.Any;
        private updateTimeout;
        private timeout;
        private never;
        private _update;
        private _reset;
        private anchorParams;
        private _updateParams;
        updateParams(params: Partial<P>): void;
        autoUpdateParams(params: Partial<P>): void;
        readonly isUpdate: boolean;
        apply(): Promise<Tree.Node.Any> | Core.Computation<{}> | undefined;
        setParams(params: P): void;
        constructor(context: Context, transformer: Tree.Transformer.Any, entity: Entity.Any);
    }
}
declare namespace LiteMol.Bootstrap.Components.Transform {
    class View extends Component<{
        update: Controller<any> | undefined;
        transforms: Controller<any>[];
    }> {
        private update;
        constructor(context: Context);
    }
}
declare namespace LiteMol.Bootstrap.Components.Transform {
    import Vis = Bootstrap.Visualization;
    class VisualStyle<Params extends {
        style: Bootstrap.Visualization.Style<any, any>;
    }> extends Controller<Params> {
        updateTemplate(key: string, all: Map<string, Bootstrap.Visualization.Style.Any>): void;
        updateStyleParams(params: any): void;
        updateStyleTheme(theme: Partial<Vis.Theme.Instance>): void;
        updateThemeColor(name: string, value: LiteMol.Visualization.Color): void;
        updateThemeVariable(name: string, value: any): void;
        updateThemeTransparency(transparency: LiteMol.Visualization.Theme.Transparency): void;
        private getThemeInstance;
        updateThemeDefinition(definition: Bootstrap.Visualization.Theme.Template): void;
    }
    class MoleculeVisual extends VisualStyle<Bootstrap.Entity.Transformer.Molecule.CreateVisualParams> {
    }
    class MoleculeLabels extends VisualStyle<Bootstrap.Entity.Transformer.Molecule.CreateLabelsParams> {
    }
    class GenericLabels extends VisualStyle<Bootstrap.Entity.Transformer.Labels.CreateParams> {
    }
    class DensityVisual<T, Styles> extends Controller<T> {
        private cloneStyle;
        private getStyle;
        private setStyle;
        updateStyleParams(params: any, styleProp?: Styles): void;
        updateStyleTheme(theme: Partial<Vis.Theme.Instance>, styleProp?: Styles): void;
        updateThemeColor(name: string, value: LiteMol.Visualization.Color, styleProp?: Styles): void;
        updateThemeTransparency(transparency: LiteMol.Visualization.Theme.Transparency, styleProp?: Styles): void;
        private getThemeInstance;
        updateThemeDefinition(definition: Bootstrap.Visualization.Theme.Template, styleProp?: Styles): void;
    }
}
declare namespace LiteMol.Bootstrap.Components.Transform {
    interface UpdaterState {
        controller: Controller<any> | undefined;
    }
    class Updater extends Component<UpdaterState> {
        private selector;
        header: string;
        private removed;
        private added;
        constructor(ctx: Context, selector: Tree.Selector<Entity.Any>, header: string);
    }
}
declare namespace LiteMol.Bootstrap.Components.Transform {
    interface ActionState {
        controller: Controller<any> | undefined;
    }
    class Action extends Component<ActionState> {
        private selector;
        transformer: Tree.Transformer.Any;
        header: string;
        private removed;
        private added;
        constructor(ctx: Context, selector: Tree.Selector<Entity.Any>, transformer: Tree.Transformer.Any, header: string);
    }
}
declare namespace LiteMol.Bootstrap.Components.Context {
    class Log extends Component<{
        entries: Immutable.List<Service.Logger.Entry>;
    }> {
        constructor(context: Context);
    }
}
declare namespace LiteMol.Bootstrap.Components.Context {
    class Toast extends Component<{
        entries: Immutable.Map<number, Toast.Entry>;
    }> {
        private serialNumber;
        private serialId;
        private findByKey;
        private show;
        private timeout;
        private hideId;
        private hide;
        constructor(context: Context);
    }
    namespace Toast {
        interface Entry {
            id: number;
            serialNumber: number;
            key?: string;
            title: string;
            message: string | {};
            hide: () => void;
            timeout?: number;
        }
    }
}
declare namespace LiteMol.Bootstrap.Components.Context {
    interface TaskInfo {
        name: string;
        message: string;
        abort?: () => void;
    }
    interface TasksState {
        tasks: Immutable.Map<number, TaskInfo>;
    }
    class TaskWatcher extends Component<TasksState> {
        private type;
        private updated;
        private started;
        private completed;
        constructor(context: Context, type: Task.Type);
    }
}
declare namespace LiteMol.Bootstrap.Components.Visualization {
    interface HighlightInfoState {
        info?: Interactivity.HighlightEntry[];
    }
    class HighlightInfo extends Component<HighlightInfoState> {
        constructor(context: Context);
    }
}
declare namespace LiteMol.Bootstrap.Components.Visualization {
    import Vis = LiteMol.Visualization;
    class Viewport extends Component<Vis.SceneOptions> {
        private _scene;
        readonly scene: Bootstrap.Visualization.SceneWrapper;
        init(element: HTMLElement): boolean;
        destroy(): void;
        constructor(context: Context);
    }
}
declare namespace LiteMol.Bootstrap {
    class Settings {
        private settings;
        set(key: string, value: any): void;
        get(key: string): any;
    }
    class Context {
        plugin?: Plugin.Instance | undefined;
        id: string;
        dispatcher: Service.Dispatcher;
        logger: Service.Logger;
        performance: Core.Utils.PerformanceMonitor;
        scene: Visualization.SceneWrapper;
        tree: Tree<Entity.Any>;
        currentEntity: Entity.Any | undefined;
        transforms: TransformManager;
        entityCache: Entity.Cache;
        viewport: Components.Visualization.Viewport;
        layout: Components.Layout;
        highlight: Interactivity.HighlightManager;
        behaviours: Behaviour.Streams;
        settings: Settings;
        createLayout(targets: Components.LayoutTarget[], target: HTMLElement): void;
        select(selector: Tree.Selector<Entity.Any>): Entity.Any[];
        constructor(plugin?: Plugin.Instance | undefined);
    }
}
declare namespace LiteMol.Bootstrap.Plugin {
    interface TransformerInfo {
        transformer: Bootstrap.Tree.Transformer.Any;
        view: any;
        initiallyCollapsed?: boolean;
    }
    type BehaviourProvider = (stack: Context) => void;
    type ComponentProvider = (context: Context) => Bootstrap.Components.ComponentInfo;
    interface Instance {
        getTransformerInfo(transformer: Bootstrap.Tree.Transformer.Any): TransformerInfo;
        setComponents(components: ComponentProvider[]): void;
        readonly context: Context;
        destroy(): void;
    }
}
declare namespace LiteMol.Bootstrap {
    function initEventsAndCommands(context: Context): void;
}
declare namespace LiteMol.Bootstrap {
    import Transformer = Tree.Transformer.Any;
    class TransformManager {
        private context;
        private controllerCache;
        private state;
        private byId;
        private bySourceType;
        private byTargetType;
        private addType;
        getController(t: Transformer, e: Entity.Any): Components.Transform.Controller<any> | undefined;
        getBySourceType(t: Entity.AnyType): Tree.Transformer<Tree.Node.Any, Tree.Node.Any, any>[];
        getByTargetType(t: Entity.AnyType): Tree.Transformer<Tree.Node.Any, Tree.Node.Any, any>[];
        add(t: Transformer): void;
        hasPersistentState(t: Transformer, e: Entity.Any, prop: string): boolean;
        getPersistentState<T>(t: Transformer, e: Entity.Any, prop: string, defaultValue: T): any;
        /**
         * returns whether the value changed or not
         */
        setPersistentState<T>(t: Transformer, e: Entity.Any, prop: string, value: T): boolean;
        constructor(context: Context);
    }
}
declare namespace LiteMol.Plugin {
    var VERSION: {
        number: string;
        date: string;
    };
}
declare type RD = typeof ReactDOM;
declare type R = typeof React;
declare var __LiteMolReact: R;
declare var __LiteMolReactDOM: RD;
declare namespace LiteMol.Plugin {
    type React = R;
    const React: R;
    type ReactDOM = RD;
    const ReactDOM: RD;
    namespace Controls {
        class ChromePickerHelper extends __LiteMolColorPicker.ChromePicker {
        }
    }
}
declare namespace LiteMol.Plugin.Controls {
    type ButtonSize = 'xs' | 'sm' | 'normal' | 'lg';
    type ButtonStyle = 'link' | 'remove' | 'default';
    abstract class Pure<Props> extends React.Component<Props, {}> {
        shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    }
    class Button extends Pure<{
        onClick: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
        size?: ButtonSize;
        style?: ButtonStyle;
        active?: boolean;
        activeStyle?: ButtonStyle;
        icon?: string;
        activeIcon?: string;
        disabled?: boolean;
        disabledStyle?: ButtonStyle;
        asBlock?: boolean;
        title?: string;
        customClass?: string;
        customStyle?: any;
    }> {
        render(): JSX.Element;
    }
    const TextBox: (props: {
        onChange: (v: string) => void;
        value?: string | undefined;
        defaultValue?: string | undefined;
        onKeyPress?: ((e: React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
        onBlur?: ((e: React.FormEvent<HTMLInputElement>) => void) | undefined;
        placeholder?: string | undefined;
    }) => JSX.Element;
    function isEnter(e: React.KeyboardEvent<HTMLInputElement>): boolean;
    function TextBoxGroup(props: {
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
        label: string;
        onEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
        title?: string;
    }): JSX.Element;
    const CommitButton: (props: {
        action: () => void;
        isOn: boolean;
        on: string;
        off?: string | undefined;
        title?: string | undefined;
    }) => JSX.Element;
    const Toggle: (props: {
        onChange: (v: boolean) => void;
        value: boolean;
        label: string;
        title?: string | undefined;
    }) => JSX.Element;
    const ControlGroupExpander: (props: {
        onChange: (e: boolean) => void;
        isExpanded: boolean;
    }) => JSX.Element;
    const RowText: (props: {
        value: any;
        label: string;
        title?: string | undefined;
    }) => JSX.Element;
    const HelpBox: (props: {
        title: string;
        content: string | JSX.Element;
    }) => JSX.Element;
}
declare namespace LiteMol.Plugin.Controls {
    class OptionsBox extends React.Component<{
        options: any[] | Bootstrap.Immutable.List<any>;
        current: any;
        caption: (o: any) => any;
        onChange: (o: any) => void;
        small?: boolean;
        title?: string;
    }, {}> {
        current: any;
        private get;
        render(): JSX.Element;
    }
    function OptionsGroup(props: {
        options: any[] | Bootstrap.Immutable.List<any>;
        current: any;
        caption?: (o: any) => string | number;
        onChange: (o: any) => void;
        label: string;
        title?: string;
    }): JSX.Element;
}
declare namespace LiteMol.Plugin.Controls {
    class Panel extends React.Component<{
        header: any;
        title?: string;
        className?: string;
        badge?: any;
        isExpanded: boolean;
        onExpand: (e: boolean) => void;
        description: string;
        topRightAction?: JSX.Element;
    }, {}> {
        private header;
        render(): JSX.Element;
    }
    const ExpandableGroup: (props: {
        select: any;
        options: any[];
        expander: any;
        isExpanded: boolean;
        colorStripe?: Visualization.Color | undefined;
    }) => JSX.Element;
}
declare namespace LiteMol.Plugin.Controls {
    class Slider extends React.Component<{
        label: any;
        min: number;
        max: number;
        value: number;
        step?: number;
        title?: string;
        onChange: (v: number) => void;
    }, {
        value: string;
    }> {
        state: {
            value: string;
        };
        private firedValue;
        componentWillMount(): void;
        componentWillReceiveProps(nextProps: any): void;
        private updateValue;
        private fire;
        render(): JSX.Element;
    }
    class Handle extends React.Component<Partial<HandleProps>, {}> {
        render(): JSX.Element;
    }
    interface SliderBaseProps {
        min: number;
        max: number;
        step?: number;
        defaultValue?: number | number[];
        value?: number | number[];
        marks?: any;
        included?: boolean;
        className?: string;
        prefixCls?: string;
        disabled?: boolean;
        children?: any;
        onBeforeChange?: (value: number | number[]) => void;
        onChange?: (value: number | number[]) => void;
        onAfterChange?: (value: number | number[]) => void;
        handle?: JSX.Element;
        tipFormatter?: (value: number, index: number) => any;
        dots?: boolean;
        range?: boolean | number;
        vertical?: boolean;
        allowCross?: boolean;
        pushable?: boolean | number;
    }
    interface SliderBaseState {
        handle: number | null;
        recent: number;
        bounds: number[];
    }
    class SliderBase extends React.Component<SliderBaseProps, SliderBaseState> {
        private sliderElement;
        private handleElements;
        constructor(props: SliderBaseProps);
        static defaultProps: SliderBaseProps;
        private dragOffset;
        private startPosition;
        private startValue;
        private _getPointsCache;
        componentWillReceiveProps(nextProps: SliderBaseProps): void;
        onChange(state: this['state']): void;
        onMouseDown(e: MouseEvent): void;
        onMouseMove(e: MouseEvent): void;
        onMove(e: MouseEvent | TouchEvent, position: number): void;
        onStart(position: number): void;
        onTouchMove(e: TouchEvent): void;
        onTouchStart(e: TouchEvent): void;
        /**
         * Returns an array of possible slider points, taking into account both
         * `marks` and `step`. The result is cached.
         */
        getPoints(): any;
        getPrecision(step: number): number;
        getSliderLength(): number;
        getSliderStart(): number;
        getValue(): number;
        private eventHandlers;
        addDocumentEvents(type: 'touch' | 'mouse'): void;
        calcOffset(value: number): number;
        calcValue(offset: number): number;
        calcValueByPos(position: number): number;
        end(type: 'mouse' | 'touch'): void;
        isEventFromHandle(e: Event): boolean;
        isValueOutOfBounds(value: number, props: SliderBaseProps): boolean;
        pushHandle(bounds: number[], handle: number, direction: number, amount: number): boolean;
        pushHandleOnePoint(bounds: number[], handle: number, direction: number): boolean;
        pushSurroundingHandles(bounds: number[], handle: number, originalValue: number): void;
        removeEvents(type: 'touch' | 'mouse'): void;
        trimAlignValue(v: number, nextProps?: SliderBaseProps): number;
        render(): JSX.Element;
    }
    interface HandleProps {
        className: string;
        vertical: boolean;
        offset: number;
        tipFormatter: (v: number, index: number) => any;
        value: number;
        index: number;
    }
}
declare namespace LiteMol.Plugin.Controls {
    interface ColorPickerProps {
        color: LiteMol.Visualization.Color;
        onChange: (c: LiteMol.Visualization.Color) => void;
    }
    class ColorPicker extends React.Component<ColorPickerProps, {}> {
        shouldComponentUpdate(nextProps: ColorPickerProps, nextState: {}, nextContext: any): boolean;
        render(): JSX.Element;
    }
    class ToggleColorPicker extends React.Component<ColorPickerProps & {
        label: string;
        position?: 'above' | 'below';
    }, {
        isExpanded?: boolean;
    }> {
        state: {
            isExpanded: boolean;
        };
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Controls {
    function QueryEditor(props: {
        value: string;
        onChange: (v: string) => void;
        onEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    }): JSX.Element;
}
declare namespace LiteMol.Plugin.Views {
    abstract class PureView<State, Props, ViewState> extends React.Component<{
        state: State;
        onChange: (s: State) => void;
    } & Props, ViewState> {
        protected update(s: State): void;
        shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    }
    abstract class Component<Props> extends React.Component<{
        context: Bootstrap.Context;
    } & Props, {}> {
        private subs;
        protected subscribe<T>(stream: Bootstrap.Rx.Observable<T>, obs: (n: T) => void): __LiteMolRx.IDisposable;
        protected unsubscribe(sub: Bootstrap.Rx.IDisposable): void;
        componentWillUnmount(): void;
    }
    abstract class ObserverView<P, S> extends React.Component<P, S> {
        private subs;
        protected subscribe<T>(stream: Bootstrap.Rx.Observable<T>, obs: (n: T) => void): __LiteMolRx.IDisposable;
        protected unsubscribe(sub: Bootstrap.Rx.IDisposable): void;
        componentWillUnmount(): void;
    }
    abstract class View<Controller extends Bootstrap.Components.Component<any>, State, CustomProps> extends ObserverView<{
        controller: Controller;
    } & CustomProps, State> {
        readonly controller: Controller;
        componentWillMount(): void;
    }
}
declare namespace LiteMol.Plugin.Views {
    class Layout extends View<Bootstrap.Components.Layout, {}, {}> {
        componentDidMount(): void;
        private renderTarget;
        private updateTarget;
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Transform {
    abstract class ControllerBase<C extends Bootstrap.Components.Transform.Controller<any>> extends Views.View<C, {}, {
        customHeader?: string;
        hideBadge?: boolean;
        isAction?: boolean;
        showVisibilityIcon?: boolean;
    }> {
        protected abstract renderControls(): void;
        readonly params: C['latestState']['params'];
        updateParams(p: Partial<C['latestState']['params']>): void;
        autoUpdateParams(p: Partial<C['latestState']['params']>): void;
        getPersistentState<T>(prop: string, defaultValue: T): any;
        setPersistentState<T>(prop: string, value: T): void;
        readonly transformSourceEntity: Bootstrap.Tree.Node.Any;
        readonly isUpdate: boolean;
        readonly canApply: boolean;
        protected applyEnter(e: React.KeyboardEvent<HTMLElement>): void;
        render(): JSX.Element;
    }
    class Empty extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{}>> {
        protected renderControls(): JSX.Element;
    }
    class View extends Views.View<Bootstrap.Components.Transform.View, {}, {}> {
        render(): JSX.Element;
    }
    const TransparencyControl: (props: {
        onChange: (td: LiteMol.Visualization.Theme.Transparency) => void;
        definition: LiteMol.Visualization.Theme.Transparency;
    }) => JSX.Element;
    class Updater extends Views.View<Bootstrap.Components.Transform.Updater, {}, {}> {
        componentWillMount(): void;
        render(): JSX.Element;
    }
    class Action extends Views.View<Bootstrap.Components.Transform.Action, {}, {}> {
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Transform.Data {
    import Transformer = Bootstrap.Entity.Transformer;
    class Download extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Data.DownloadParams>> {
        protected renderControls(): JSX.Element;
    }
    class OpenFile extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Data.OpenFileParams>> {
        protected renderControls(): JSX.Element;
    }
    class WithIdField extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{
        id: string;
    }>> {
        protected renderControls(): JSX.Element;
    }
    class WithUrlIdField extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{
        id: string;
    }>> {
        protected renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Transform.Molecule {
    import Transformer = Bootstrap.Entity.Transformer;
    class CreateFromData extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateFromDataParams>> {
        protected renderControls(): JSX.Element;
    }
    class DownloadFromUrl extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.DownloadMoleculeSourceParams>> {
        protected renderControls(): JSX.Element;
    }
    class OpenFile extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.OpenMoleculeFromFileParams>> {
        protected renderControls(): JSX.Element;
    }
    class InitCoordinateStreaming extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CoordinateStreaming.InitStreamingParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateFromMmCif extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateFromMmCifParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateModel extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateModelParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateAssembly extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateAssemblyParams>> {
        protected renderControls(): JSX.Element | undefined;
    }
    class CreateSymmetryMates extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateSymmetryMatesParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateSelection extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateSelectionParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateMacromoleculeVisual extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Molecule.CreateMacromoleculeVisualParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateVisual extends Transform.ControllerBase<Bootstrap.Components.Transform.MoleculeVisual> {
        private detail;
        private cartoons;
        private ballsAndSticks;
        private surface;
        private createColors;
        protected renderControls(): JSX.Element;
    }
    class CreateLabels extends Transform.ControllerBase<Bootstrap.Components.Transform.MoleculeLabels> {
        renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Transform.Density {
    import Transformer = Bootstrap.Entity.Transformer;
    class ParseData extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Density.ParseDataParams>> {
        protected renderControls(): JSX.Element;
    }
    class CreateVisual extends Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<Transformer.Density.CreateVisualParams, 'style'>> {
        private surface;
        private colors;
        protected renderControls(): JSX.Element;
    }
    class CreateVisualBehaviour extends Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<Transformer.Density.CreateVisualBehaviourParams, 'style'>> {
        private surface;
        private colors;
        private show;
        protected renderControls(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Transform.Labels {
    function optionsControls(controller: Bootstrap.Components.Transform.MoleculeLabels): JSX.Element[];
}
declare namespace LiteMol.Plugin.Views.Context {
    class Log extends View<Bootstrap.Components.Context.Log, {}, {}> {
        private wrapper;
        componentWillMount(): void;
        componentDidUpdate(): void;
        private scrollToBottom;
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Context {
    class Overlay extends View<Bootstrap.Components.Context.TaskWatcher, {}, {}> {
        render(): JSX.Element;
    }
    class BackgroundTasks extends View<Bootstrap.Components.Context.TaskWatcher, {}, {}> {
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Context {
    class Toast extends View<Bootstrap.Components.Context.Toast, {}, {}> {
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Entity {
    import BEntity = Bootstrap.Entity;
    const VisibilityControl: (props: {
        entity: BEntity.Any;
    }) => JSX.Element;
    class Tree extends View<Bootstrap.Components.Component<{}>, {}, {}> {
        private renderedVersion;
        private root;
        scrollIntoView(element: Element): void;
        componentWillMount(): void;
        private splash;
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Entity {
    const Remove: (props: {
        entity: Bootstrap.Entity.Any;
        onRemove: () => void;
    }) => JSX.Element;
    class Badge extends React.Component<{
        type: Bootstrap.Entity.TypeInfo;
    }, {}> {
        shouldComponentUpdate(nextProps: {
            type: Bootstrap.Entity.TypeInfo;
        }, nextState: {}, nextContext: any): boolean;
        private createBadge;
        render(): JSX.Element;
    }
    class CurrentEntityControl extends View<Plugin.Components.AppInfo, {
        current?: Bootstrap.Entity.Any;
    }, {}> {
        state: {
            current?: Bootstrap.Entity.Any;
        };
        componentWillMount(): void;
        render(): JSX.Element;
    }
    namespace SplashInfo {
        const General: () => JSX.Element;
        const Info: () => JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Views.Visualization {
    class ViewportControls extends View<Bootstrap.Components.Visualization.Viewport, {
        showSceneOptions?: boolean;
        showHelp?: boolean;
    }, {}> {
        state: {
            showSceneOptions: boolean;
            showHelp: boolean;
        };
        private help;
        render(): JSX.Element;
    }
    class HighlightInfo extends View<Bootstrap.Components.Visualization.HighlightInfo, {}, {}> {
        render(): JSX.Element;
    }
    const Logo: () => JSX.Element;
    class Viewport extends View<Bootstrap.Components.Visualization.Viewport, {}, {
        noWebGl?: boolean;
        showLogo?: boolean;
    }> {
        private host3d;
        private defaultBg;
        state: {
            noWebGl: boolean;
            showLogo: boolean;
        };
        componentDidMount(): void;
        componentWillUnmount(): void;
        renderMissing(): JSX.Element;
        private handleLogo;
        private getShowLogo;
        render(): JSX.Element;
    }
}
declare namespace LiteMol.Plugin.Components {
    function create(key: string, controller: (ctx: Context) => Bootstrap.Components.Component<any>, view: ViewDefinition): (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
        key: string;
        controller: Bootstrap.Components.Component<any>;
        region: Bootstrap.Components.LayoutRegion;
        view: React.ComponentClass<any>;
        isStatic: boolean | undefined;
    };
    class AppInfo extends Bootstrap.Components.Component<{}> {
        appName: string;
        appVersion: string;
        constructor(ctx: Bootstrap.Context, appName: string, appVersion: string);
    }
    namespace Context {
        const Log: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
        const Toast: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
        const Overlay: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
        const BackgroundTasks: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
    }
    namespace Transform {
        const View: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
    }
    namespace Entity {
        const Current: (appName: string, appVersion: string) => (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
    }
    namespace Visualization {
        const Viewport: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
        const HighlightInfo: (t: Bootstrap.Components.LayoutRegion, isStatic?: boolean | undefined) => (ctx: Context) => {
            key: string;
            controller: Bootstrap.Components.Component<any>;
            region: Bootstrap.Components.LayoutRegion;
            view: React.ComponentClass<any>;
            isStatic: boolean | undefined;
        };
    }
}
declare namespace LiteMol.Plugin {
    export import Context = Bootstrap.Context;
    type ViewDefinition = React.ComponentClass<{
        controller: Bootstrap.Components.Component<any>;
    } & any>;
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    interface TransformerInfo extends Bootstrap.Plugin.TransformerInfo {
        transformer: Bootstrap.Tree.Transformer.Any;
        view: ViewDefinition;
        initiallyCollapsed?: boolean;
    }
    interface Specification {
        settings: {
            [key: string]: any;
        };
        behaviours: Bootstrap.Plugin.BehaviourProvider[];
        transforms: TransformerInfo[];
        layoutView: ViewDefinition;
        tree: {
            view: ViewDefinition;
            region: LayoutRegion;
        } | undefined;
        viewport: {
            view: ViewDefinition;
            controlsView: ViewDefinition;
        };
        components: Bootstrap.Plugin.ComponentProvider[];
    }
    class Instance implements Bootstrap.Plugin.Instance {
        private spec;
        private target;
        private transformersInfo;
        context: Bootstrap.Context;
        private compose;
        private prepareTargets;
        getTransformerInfo(transformer: Bootstrap.Tree.Transformer.Any): TransformerInfo;
        destroy(): void;
        setComponents(components: Bootstrap.Plugin.ComponentProvider[]): void;
        private init;
        constructor(spec: Specification, target: HTMLElement);
    }
}
declare namespace LiteMol.Plugin {
    import Transformer = Bootstrap.Entity.Transformer;
    namespace DataSources {
        const DownloadMolecule: Bootstrap.Tree.Transformer<Bootstrap.Entity.Root, Bootstrap.Entity.Action, Transformer.Molecule.DownloadMoleculeSourceParams>;
    }
    function getDefaultSpecification(): Specification;
}
declare namespace LiteMol.Plugin {
    interface PluginControllerOptions {
        /**
         * query selector or HTMLElement
         */
        target: string | HTMLElement;
        customSpecification?: Specification;
        /**
         * HEX color in format '#rgb' or '#rrggbb'
         * or Visualization.Color instance.
         */
        viewportBackground?: string | Visualization.Color;
        layoutState?: Partial<Bootstrap.Components.LayoutState>;
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
        allowAnalytics?: boolean;
        /**
         * This specifies what Google Analytics ID to use. This
         * means you can create your own google analytics account
         * and collect the information for yourself.
         */
        analyticsId?: string;
    }
    interface ControllerLoadMoleculeInfo {
        id?: string;
        moleculeRef?: string;
        modelRef?: string;
        url?: string;
        data?: string | ArrayBuffer;
        format?: string | Core.Formats.FormatInfo;
        onLoad?: () => void;
        onError?: (e: any) => void;
        doNotCreateVisual?: boolean;
    }
    import Entity = Bootstrap.Entity;
    class Controller {
        private _instance;
        readonly instance: Bootstrap.Plugin.Instance;
        readonly context: Context;
        readonly root: Entity.Any;
        /**
         * execute a command with the specified params.
         */
        command<T>(cmd: Bootstrap.Event.Type<T>, params?: T): void;
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
        selectEntities(selector: Bootstrap.Tree.Selector<Bootstrap.Entity.Any>): Entity.Any[];
        /**
         * Subscribes the specified event and returns
         * a disposable for the event.
         *
         * let sub = litemol.subscribe(...)
         * ...
         * sub.dispose(); // to stop listening
         */
        subscribe<T>(event: Bootstrap.Event.Type<T>, onEvent: (e: Bootstrap.Event<T>) => void): __LiteMolRx.IDisposable;
        /**
         * Create a transform builder.
         */
        createTransform(): Bootstrap.Tree.Transform.Builder;
        /**
         * Applies a state trasnform.
         */
        applyTransform(transform: Bootstrap.Tree.Transform.Source): Promise<void>;
        /**
         * Remove all entities.
         */
        clear(): void;
        /**
         * Set the background of the viewport from:
         *
         * HEX color in format '#rgb' or '#rrggbb'
         * or Visualization.Color instance.
         */
        setViewportBackground(color: string | Visualization.Color): void;
        /**
         * Sets the state of the plugin layout.
         *
         * Expanded, show/hide controls, etc..
         */
        setLayoutState(state: Partial<Bootstrap.Components.LayoutState>): void;
        /**
         * Load molecule from url or string/binary data.
         *
         * Default format is mmCIF.
         */
        loadMolecule(source: ControllerLoadMoleculeInfo): Promise<void>;
        /**
         * Destroys the the plugin instance.
         * The controller becomes unusable as a result.
         */
        destroy(): void;
        private ofOptions;
        private ofInstace;
        constructor(optionsOrInstance: PluginControllerOptions | Bootstrap.Plugin.Instance);
    }
    function create(options: PluginControllerOptions): Controller;
}
declare module 'LiteMol-plugin' {
    import __Plugin = LiteMol.Plugin;
    export = __Plugin;
}
