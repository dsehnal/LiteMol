Computations, Tasks, and Progress Reporting
===========================================

Computations
------------

Most computations in LiteMol are wrapped in a ``Computation`` class (defined in ``LiteMol.Core.Computation`` namespace). 
``Computation`` is a wrapper around a ``Promise`` that provides facilities
for progress tracking. Unlike a ``Promise``, a ``Computation`` is deferred,
meaning it has to be run manually using the ``run`` function. To create a ``Computation`` it is required to provide a ``Promise`` that 
produces the desired result.

The use of the ``Computation`` is probably best shown using examples:

```TypeScript
async function sumComputation() {
    return Core.computation<number>(async ctx => {
        let sum = 0;
        for (let i = 0; i < 10; i++) {
            await ctx.updateProgress(`Computing sum...`, true /* abortable */, i, 10);
            sum += i;
        }
        return sum;
    });    
}
```

There are a few ways of consuming the computation. If we don't care about the progress,
we could simply call

```TypeScript
sumComputation().run().then(sum => console.log(sum));
```

or inside an ``async`` function:

```TypeScript
let sum = await sumComputation().run();
console.log(sum);
```

To use the progress tracking, there are two options:

- Manually creating ``Context`` object:

    ```TypeScript
    let ctx = LiteMol.Core.Computation.createContext();
    ctx.progress.subscribe(p => console.log(p));
    let sum = await sumComputation().run(ctx);
    console.log(sum);
    ```

- Using ``runWithContext`` instead of ``run``:

    ```TypeScript
    let comp = sumComputation().runWithContext();
    comp.progress.subscribe(p => console.log(p));
    let sum = await comp.result;
    console.log(sum);
    ```

The computation context object can be reused in multiple computations to merge
their progress reporting:

```TypeScript
let ctx = LiteMol.Core.Computation.createContext();
let a = await cA.run(ctx);
let b = await cB.run(ctx);
// ...
```

### Aborting Computations

Optionally, computations support aborting that is built into the ``updateProgress`` function.
This can be achieved by calling ``Context.requestAbort()`` function (or ``Progress.abort()`` if defined). 
The next time the ``updateProgress`` function is called, it will ``throw 'Aborted'`` resulting
in termination of the computation. The "abort function" can be customized as shown
for example, in the ``ajaxGetInternal`` function in [Bootstrap/Utils/DataSource.ts](https://github.com/dsehnal/LiteMol/blob/master/src/Bootstrap/Utils/DataSource.ts).

### Handling Errors

Exceptions are automatically propagated using ``Promise.catch``.

```TypeScript
async function badBadComputation() {
    return Core.computation<number>(async ctx => {
        throw Error('I am an error');
    });    
}

badBadComputation().run().catch(e => console.error(e));
```

Tasks
-----

Tasks are simply wrappers around the ``Computation`` object that raise started/completed/updated
events that can be easily handled by the user interface. When creating a task, it is required to specify its name, type, and computation:

```TypeScript
let task = Bootstrap.Task.create<number>('Sum', 'Background', async ctx => ...);
```

or

```TypeScript
let task = Bootstrap.Task.fromComputation('Sum', 'Background', sumComputation());
```

There are 3 types of computations: 

- ``Normal`` - Reports progress in a way that blocks the user interface (i.e. in an overlay). For example, computing new visual that takes long time.
- ``Background`` - Reported in a non-blocking way. For example, downloading new data.
- ``Silent`` - No reporting done.

Additionally, timing of tasks can be automatically reported using the ``Task.setReportTime()`` function:

```TypeScript
let task = Bootstrap.Task.fromComputation('Sum', 'Background', sumComputation())
    .setReportTime(true);
```

Tasks are run and consumed in a fashion similar to computations with the difference
that they need to be provided a ``Bootstrap.Context`` object to enable raising
of the events:

```TypeScript
let plugin = Plugin.create(...);
let task = ...;
let result = await task.run(plugin.context);
```

Similarly to the ``Computation``, ``runWithContext`` is provided that enables
to call the function ``tryAbort()``:

```TypeScript
let plugin = Plugin.create(...);
let task = ...;
let running = task.runWithContext(plugin.context);
...
let result = await running.result;

// somewhere else
running.tryAbort();
```
