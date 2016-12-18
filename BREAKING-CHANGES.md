Dec 18 2016 (Bootstrap 1.3.0)
-----------------------------

``Computation/Task`` API was rewritten. Tasks now require a promise that resoves into the result
rather than having to resolve manually, and the progress reporting has changed. 
That means that some ``Transforms`` need to be rewritten.

Applycation of transforms now uses ``Computation`` rather than ``Task``.

Check out [Compution and Task docs](docs/tasks.md) to see how the system works.

### Creating a Task

Before: 

```TypeScript
Task.create<T>('Task', 'Background', ctx => {
    ctx.update('Message');
    ctx.schedule(() => { // need to schedule to give UI the chance to show 'Message'
        // compute task
        ctx.resolve(result)
    })
})
```

Now using ``async/await`` (preferred):

```TypeScript
Task.create<T>('Task', 'Background', async ctx => {
    // ctx.updateProgress returns a promise that can be awaited:
    await ctx.updateProgress('Message');
    // ...
    return result;
})
```

or only using ``Promise`` (if you love callback hell):

```TypeScript
Task.create<T>('Task', 'Background', ctx => new Promise((res, rej) => {
    ctx.updateProgress('Message').then(() => {
        // ...
        res(result);
    })  
}));
```

### Consuming a Task/Computation

Before: 

```TypeScript
let task = Task.create(...);
task.run(plugin.context)
    .then(r => ...)
    .catch(e => ...);
```

Now (``then/catch`` still work tho): 

```TypeScript
let task = Task.create(...);
try {
    let result = await task.run(plugin.context);
    ...
} catch (e) {
    ...
}
```

### Applying a transform and waiting for result:

Before:

```TypeScript
Bootstrap.Tree.Transform.apply(ctx, t).run(plugin.context);
```

Now:

```TypeScript
// remove the need to pass plugin.context to run
Bootstrap.Tree.Transform.apply(ctx, t).run();
```