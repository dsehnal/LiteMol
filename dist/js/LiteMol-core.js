
; var __LiteMol_Core = function () {
  'use strict';
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.2.1
 */

var __createPromise = function (__promise) {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
        return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
        return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
        return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
        lib$es6$promise$utils$$_isArray = function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        };
    } else {
        lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
        lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
        lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
        lib$es6$promise$asap$$len += 2;
        if (lib$es6$promise$asap$$len === 2) {
            // If len is 2, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            if (lib$es6$promise$asap$$customSchedulerFn) {
                lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
            } else {
                lib$es6$promise$asap$$scheduleFlush();
            }
        }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
        lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
        lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
        // see https://github.com/cujojs/when/issues/410 for details
        return function () {
            process.nextTick(lib$es6$promise$asap$$flush);
        };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
        return function () {
            lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
        };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
        var iterations = 0;
        var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });

        return function () {
            node.data = (iterations = ++iterations % 2);
        };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
        var channel = new MessageChannel();
        channel.port1.onmessage = lib$es6$promise$asap$$flush;
        return function () {
            channel.port2.postMessage(0);
        };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
        return function () {
            setTimeout(lib$es6$promise$asap$$flush, 1);
        };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
        for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
            var callback = lib$es6$promise$asap$$queue[i];
            var arg = lib$es6$promise$asap$$queue[i + 1];

            callback(arg);

            lib$es6$promise$asap$$queue[i] = undefined;
            lib$es6$promise$asap$$queue[i + 1] = undefined;
        }

        lib$es6$promise$asap$$len = 0;
    }

    ////function lib$es6$promise$asap$$attemptVertx() {
    ////    try {
    ////        var r = require;
    ////        var vertx = r('vertx');
    ////        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
    ////        return lib$es6$promise$asap$$useVertxTimer();
    ////    } catch (e) {
    ////        return lib$es6$promise$asap$$useSetTimeout();
    ////    }
    ////}

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } /*else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    }*/ else {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }
    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
        var parent = this;

        var child = new this.constructor(lib$es6$promise$$internal$$noop);

        if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
            lib$es6$promise$$internal$$makePromise(child);
        }

        var state = parent._state;

        if (state) {
            var callback = arguments[state - 1];
            lib$es6$promise$asap$$asap(function () {
                lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
            });
        } else {
            lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
    }
    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
    function lib$es6$promise$promise$resolve$$resolve(object) {
        /*jshint validthis:true */
        var Constructor = this;

        if (object && typeof object === 'object' && object.constructor === Constructor) {
            return object;
        }

        var promise = new Constructor(lib$es6$promise$$internal$$noop);
        lib$es6$promise$$internal$$resolve(promise, object);
        return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

    function lib$es6$promise$$internal$$noop() { }

    var lib$es6$promise$$internal$$PENDING = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
        return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
        return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
        try {
            return promise.then;
        } catch (error) {
            lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
            return lib$es6$promise$$internal$$GET_THEN_ERROR;
        }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
        try {
            then.call(value, fulfillmentHandler, rejectionHandler);
        } catch (e) {
            return e;
        }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
        lib$es6$promise$asap$$asap(function (promise) {
            var sealed = false;
            var error = lib$es6$promise$$internal$$tryThen(then, thenable, function (value) {
                if (sealed) { return; }
                sealed = true;
                if (thenable !== value) {
                    lib$es6$promise$$internal$$resolve(promise, value);
                } else {
                    lib$es6$promise$$internal$$fulfill(promise, value);
                }
            }, function (reason) {
                if (sealed) { return; }
                sealed = true;

                lib$es6$promise$$internal$$reject(promise, reason);
            }, 'Settle: ' + (promise._label || ' unknown promise'));

            if (!sealed && error) {
                sealed = true;
                lib$es6$promise$$internal$$reject(promise, error);
            }
        }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
        if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
            lib$es6$promise$$internal$$fulfill(promise, thenable._result);
        } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
            lib$es6$promise$$internal$$reject(promise, thenable._result);
        } else {
            lib$es6$promise$$internal$$subscribe(thenable, undefined, function (value) {
                lib$es6$promise$$internal$$resolve(promise, value);
            }, function (reason) {
                lib$es6$promise$$internal$$reject(promise, reason);
            });
        }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
        if (maybeThenable.constructor === promise.constructor &&
            then === lib$es6$promise$then$$default &&
            constructor.resolve === lib$es6$promise$promise$resolve$$default) {
            lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
        } else {
            if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
                lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
            } else if (then === undefined) {
                lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
            } else if (lib$es6$promise$utils$$isFunction(then)) {
                lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
            } else {
                lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
            }
        }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
        if (promise === value) {
            lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
        } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
            lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
        } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
        }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
        if (promise._onerror) {
            promise._onerror(promise._result);
        }

        lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
        if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

        promise._result = value;
        promise._state = lib$es6$promise$$internal$$FULFILLED;

        if (promise._subscribers.length !== 0) {
            lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
        }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
        if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
        promise._state = lib$es6$promise$$internal$$REJECTED;
        promise._result = reason;

        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
        var subscribers = parent._subscribers;
        var length = subscribers.length;

        parent._onerror = null;

        subscribers[length] = child;
        subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
        subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;

        if (length === 0 && parent._state) {
            lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
        }
    }

    function lib$es6$promise$$internal$$publish(promise) {
        var subscribers = promise._subscribers;
        var settled = promise._state;

        if (subscribers.length === 0) { return; }

        var child, callback, detail = promise._result;

        for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];

            if (child) {
                lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
            } else {
                callback(detail);
            }
        }

        promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
        this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
        try {
            return callback(detail);
        } catch (e) {
            lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
            return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
        }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
        var hasCallback = lib$es6$promise$utils$$isFunction(callback),
            value, error, succeeded, failed;

        if (hasCallback) {
            value = lib$es6$promise$$internal$$tryCatch(callback, detail);

            if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
                failed = true;
                error = value.error;
                value = null;
            } else {
                succeeded = true;
            }

            if (promise === value) {
                lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
                return;
            }

        } else {
            value = detail;
            succeeded = true;
        }

        if (promise._state !== lib$es6$promise$$internal$$PENDING) {
            // noop
        } else if (hasCallback && succeeded) {
            lib$es6$promise$$internal$$resolve(promise, value);
        } else if (failed) {
            lib$es6$promise$$internal$$reject(promise, error);
        } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
            lib$es6$promise$$internal$$fulfill(promise, value);
        } else if (settled === lib$es6$promise$$internal$$REJECTED) {
            lib$es6$promise$$internal$$reject(promise, value);
        }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
        try {
            resolver(function resolvePromise(value) {
                lib$es6$promise$$internal$$resolve(promise, value);
            }, function rejectPromise(reason) {
                lib$es6$promise$$internal$$reject(promise, reason);
            });
        } catch (e) {
            lib$es6$promise$$internal$$reject(promise, e);
        }
    }

    var lib$es6$promise$$internal$$id = 0;
    function lib$es6$promise$$internal$$nextId() {
        return lib$es6$promise$$internal$$id++;
    }

    function lib$es6$promise$$internal$$makePromise(promise) {
        promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
        promise._state = undefined;
        promise._result = undefined;
        promise._subscribers = [];
    }

    function lib$es6$promise$promise$all$$all(entries) {
        return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
        /*jshint validthis:true */
        var Constructor = this;

        if (!lib$es6$promise$utils$$isArray(entries)) {
            return new Constructor(function (resolve, reject) {
                reject(new TypeError('You must pass an array to race.'));
            });
        } else {
            return new Constructor(function (resolve, reject) {
                var length = entries.length;
                for (var i = 0; i < length; i++) {
                    Constructor.resolve(entries[i]).then(resolve, reject);
                }
            });
        }
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$reject$$reject(reason) {
        /*jshint validthis:true */
        var Constructor = this;
        var promise = new Constructor(lib$es6$promise$$internal$$noop);
        lib$es6$promise$$internal$$reject(promise, reason);
        return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;


    function lib$es6$promise$promise$$needsResolver() {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
        this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
        this._result = this._state = undefined;
        this._subscribers = [];

        if (lib$es6$promise$$internal$$noop !== resolver) {
            typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
            this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
        }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
        constructor: lib$es6$promise$promise$$Promise,

        /**
          The primary way of interacting with a promise is through its `then` method,
          which registers callbacks to receive either a promise's eventual value or the
          reason why the promise cannot be fulfilled.
    
          ```js
          findUser().then(function(user){
            // user is available
          }, function(reason){
            // user is unavailable, and you are given the reason why
          });
          ```
    
          Chaining
          --------
    
          The return value of `then` is itself a promise.  This second, 'downstream'
          promise is resolved with the return value of the first promise's fulfillment
          or rejection handler, or rejected if the handler throws an exception.
    
          ```js
          findUser().then(function (user) {
            return user.name;
          }, function (reason) {
            return 'default name';
          }).then(function (userName) {
            // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
            // will be `'default name'`
          });
    
          findUser().then(function (user) {
            throw new Error('Found user, but still unhappy');
          }, function (reason) {
            throw new Error('`findUser` rejected and we're unhappy');
          }).then(function (value) {
            // never reached
          }, function (reason) {
            // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
            // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
          });
          ```
          If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
    
          ```js
          findUser().then(function (user) {
            throw new PedagogicalException('Upstream error');
          }).then(function (value) {
            // never reached
          }).then(function (value) {
            // never reached
          }, function (reason) {
            // The `PedgagocialException` is propagated all the way down to here
          });
          ```
    
          Assimilation
          ------------
    
          Sometimes the value you want to propagate to a downstream promise can only be
          retrieved asynchronously. This can be achieved by returning a promise in the
          fulfillment or rejection handler. The downstream promise will then be pending
          until the returned promise is settled. This is called *assimilation*.
    
          ```js
          findUser().then(function (user) {
            return findCommentsByAuthor(user);
          }).then(function (comments) {
            // The user's comments are now available
          });
          ```
    
          If the assimliated promise rejects, then the downstream promise will also reject.
    
          ```js
          findUser().then(function (user) {
            return findCommentsByAuthor(user);
          }).then(function (comments) {
            // If `findCommentsByAuthor` fulfills, we'll have the value here
          }, function (reason) {
            // If `findCommentsByAuthor` rejects, we'll have the reason here
          });
          ```
    
          Simple Example
          --------------
    
          Synchronous Example
    
          ```javascript
          var result;
    
          try {
            result = findResult();
            // success
          } catch(reason) {
            // failure
          }
          ```
    
          Errback Example
    
          ```js
          findResult(function(result, err){
            if (err) {
              // failure
            } else {
              // success
            }
          });
          ```
    
          Promise Example;
    
          ```javascript
          findResult().then(function(result){
            // success
          }, function(reason){
            // failure
          });
          ```
    
          Advanced Example
          --------------
    
          Synchronous Example
    
          ```javascript
          var author, books;
    
          try {
            author = findAuthor();
            books  = findBooksByAuthor(author);
            // success
          } catch(reason) {
            // failure
          }
          ```
    
          Errback Example
    
          ```js
    
          function foundBooks(books) {
    
          }
    
          function failure(reason) {
    
          }
    
          findAuthor(function(author, err){
            if (err) {
              failure(err);
              // failure
            } else {
              try {
                findBoooksByAuthor(author, function(books, err) {
                  if (err) {
                    failure(err);
                  } else {
                    try {
                      foundBooks(books);
                    } catch(reason) {
                      failure(reason);
                    }
                  }
                });
              } catch(error) {
                failure(err);
              }
              // success
            }
          });
          ```
    
          Promise Example;
    
          ```javascript
          findAuthor().
            then(findBooksByAuthor).
            then(function(books){
              // found books
          }).catch(function(reason){
            // something went wrong
          });
          ```
    
          @method then
          @param {Function} onFulfilled
          @param {Function} onRejected
          Useful for tooling.
          @return {Promise}
        */
        then: lib$es6$promise$then$$default,

        /**
          `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
          as the catch block of a try/catch statement.
    
          ```js
          function findAuthor(){
            throw new Error('couldn't find that author');
          }
    
          // synchronous
          try {
            findAuthor();
          } catch(reason) {
            // something went wrong
          }
    
          // async with promises
          findAuthor().catch(function(reason){
            // something went wrong
          });
          ```
    
          @method catch
          @param {Function} onRejection
          Useful for tooling.
          @return {Promise}
        */
        'catch': function (onRejection) {
            return this.then(null, onRejection);
        }
    };
    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(lib$es6$promise$$internal$$noop);

        if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
            lib$es6$promise$$internal$$makePromise(this.promise);
        }

        if (Array.isArray(input)) {
            this._input = input;
            this.length = input.length;
            this._remaining = input.length;

            this._result = new Array(this.length);

            if (this.length === 0) {
                lib$es6$promise$$internal$$fulfill(this.promise, this._result);
            } else {
                this.length = this.length || 0;
                this._enumerate();
                if (this._remaining === 0) {
                    lib$es6$promise$$internal$$fulfill(this.promise, this._result);
                }
            }
        } else {
            lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
        }
    }

    function lib$es6$promise$enumerator$$validationError() {
        return new Error('Array Methods must be provided an Array');
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function () {
        var length = this.length;
        var input = this._input;

        for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
            this._eachEntry(input[i], i);
        }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
        var c = this._instanceConstructor;
        var resolve = c.resolve;

        if (resolve === lib$es6$promise$promise$resolve$$default) {
            var then = lib$es6$promise$$internal$$getThen(entry);

            if (then === lib$es6$promise$then$$default &&
                entry._state !== lib$es6$promise$$internal$$PENDING) {
                this._settledAt(entry._state, i, entry._result);
            } else if (typeof then !== 'function') {
                this._remaining--;
                this._result[i] = entry;
            } else if (c === lib$es6$promise$promise$$default) {
                var promise = new c(lib$es6$promise$$internal$$noop);
                lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
                this._willSettleAt(promise, i);
            } else {
                this._willSettleAt(new c(function (resolve) { resolve(entry); }), i);
            }
        } else {
            this._willSettleAt(resolve(entry), i);
        }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
        var promise = this.promise;

        if (promise._state === lib$es6$promise$$internal$$PENDING) {
            this._remaining--;

            if (state === lib$es6$promise$$internal$$REJECTED) {
                lib$es6$promise$$internal$$reject(promise, value);
            } else {
                this._result[i] = value;
            }
        }

        if (this._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(promise, this._result);
        }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
        var enumerator = this;

        lib$es6$promise$$internal$$subscribe(promise, undefined, function (value) {
            enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
        }, function (reason) {
            enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
        });
    };
    function lib$es6$promise$polyfill$$polyfill() {
        var local;

        if (typeof global !== 'undefined') {
            local = global;
        } else if (typeof self !== 'undefined') {
            local = self;
        } else {
            try {
                local = Function('return this')();
            } catch (e) {
                throw new Error('polyfill failed because global object is unavailable in this environment');
            }
        }

        var P = local.Promise;

        if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
            return;
        }

        local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
        'Promise': lib$es6$promise$promise$$default,
        'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    // if (typeof define === 'function' && define['amd']) {
    //     define(function () { return lib$es6$promise$umd$$ES6Promise; });
    // } else if (typeof module !== 'undefined' && module['exports']) {
    //     module['exports'] = lib$es6$promise$umd$$ES6Promise;
    // } else if (typeof this !== 'undefined') {
    //     this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    // }

    lib$es6$promise$polyfill$$default();
    
    __promise.ES6Promise = lib$es6$promise$umd$$ES6Promise    
};

var __LiteMolPromise;

if (typeof window !== 'undefined' && window && window.Promise) {
    __LiteMolPromise = window.Promise;
} else if (typeof global !== 'undefined' && global && global.Promise) {
    __LiteMolPromise = global.Promise;
} else {
    var __promise = {};
    __createPromise(__promise);
    __LiteMolPromise = __promise.ES6Promise.Promise;
}


// Copyright (c) Microsoft, All rights reserved. See License.txt in the project root for license information.

/*
 * Copyright (c) Microsoft.  All rights reserved.
Microsoft Open Technologies would like to thank its contributors, a list
of whom are at http://rx.codeplex.com/wikipage?title=Contributors.

Licensed under the Apache License, Version 2.0 (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions
and limitations under the License.
 * 
 */

var __LiteMolRxTemp = {};

; (function (__LMtarget, __LMpromise, undefined) {

    var objectTypes = {
        'function': true,
        'object': true
    };

    function checkGlobal(value) {
        return (value && value.Object === Object) ? value : null;
    }

    var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType) ? exports : null;
    var freeModule = (objectTypes[typeof module] && module && !module.nodeType) ? module : null;
    var freeGlobal = checkGlobal(freeExports && freeModule && typeof global === 'object' && global);
    var freeSelf = checkGlobal(objectTypes[typeof self] && self);
    var freeWindow = checkGlobal(objectTypes[typeof window] && window);
    var moduleExports = (freeModule && freeModule.exports === freeExports) ? freeExports : null;
    var thisGlobal = checkGlobal(objectTypes[typeof this] && this);
    var root = freeGlobal || ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) || freeSelf || thisGlobal || Function('return this')();

    var Rx = {
        internals: {},
        config: {
            Promise: __LMpromise
        },
        helpers: {}
    };

    // Defaults
    var noop = Rx.helpers.noop = function () { },
      identity = Rx.helpers.identity = function (x) { return x; },
      defaultNow = Rx.helpers.defaultNow = Date.now,
      defaultComparer = Rx.helpers.defaultComparer = function (x, y) { return isEqual(x, y); },
      defaultSubComparer = Rx.helpers.defaultSubComparer = function (x, y) { return x > y ? 1 : (x < y ? -1 : 0); },
      defaultKeySerializer = Rx.helpers.defaultKeySerializer = function (x) { return x.toString(); },
      defaultError = Rx.helpers.defaultError = function (err) { throw err; },
      isPromise = Rx.helpers.isPromise = function (p) { return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function'; },
      isFunction = Rx.helpers.isFunction = (function () {

          var isFn = function (value) {
              return typeof value == 'function' || false;
          };

          // fallback for older versions of Chrome and Safari
          if (isFn(/x/)) {
              isFn = function (value) {
                  return typeof value == 'function' && toString.call(value) == '[object Function]';
              };
          }

          return isFn;
      }());

    function cloneArray(arr) {
        var len = arr.length, a = new Array(len);
        for (var i = 0; i < len; i++) { a[i] = arr[i]; }
        return a;
    }

    var errorObj = { e: {} };

    function tryCatcherGen(tryCatchTarget) {
        return function tryCatcher() {
            try {
                return tryCatchTarget.apply(this, arguments);
            } catch (e) {
                errorObj.e = e;
                return errorObj;
            }
        };
    }

    var tryCatch = Rx.internals.tryCatch = function tryCatch(fn) {
        if (!isFunction(fn)) { throw new TypeError('fn must be a function'); }
        return tryCatcherGen(fn);
    };

    function thrower(e) {
        throw e;
    }

    Rx.config.longStackSupport = false;
    var hasStacks = false, stacks = tryCatch(function () { throw new Error(); })();
    hasStacks = !!stacks.e && !!stacks.e.stack;

    // All code after this point will be filtered from stack traces reported by RxJS
    var rStartingLine = captureLine(), rFileName;

    var STACK_JUMP_SEPARATOR = 'From previous event:';

    function makeStackTraceLong(error, observable) {
        // If possible, transform the error stack trace by removing Node and RxJS
        // cruft, then concatenating with the stack trace of `observable`.
        if (hasStacks &&
            observable.stack &&
            typeof error === 'object' &&
            error !== null &&
            error.stack &&
            error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
        ) {
            var stacks = [];
            for (var o = observable; !!o; o = o.source) {
                if (o.stack) {
                    stacks.unshift(o.stack);
                }
            }
            stacks.unshift(error.stack);

            var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
            error.stack = filterStackString(concatedStacks);
        }
    }

    function filterStackString(stackString) {
        var lines = stackString.split('\n'), desiredLines = [];
        for (var i = 0, len = lines.length; i < len; i++) {
            var line = lines[i];

            if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
                desiredLines.push(line);
            }
        }
        return desiredLines.join('\n');
    }

    function isInternalFrame(stackLine) {
        var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
        if (!fileNameAndLineNumber) {
            return false;
        }
        var fileName = fileNameAndLineNumber[0], lineNumber = fileNameAndLineNumber[1];

        return fileName === rFileName &&
          lineNumber >= rStartingLine &&
          lineNumber <= rEndingLine;
    }

    function isNodeFrame(stackLine) {
        return stackLine.indexOf('(module.js:') !== -1 ||
          stackLine.indexOf('(node.js:') !== -1;
    }

    function captureLine() {
        if (!hasStacks) { return; }

        try {
            throw new Error();
        } catch (e) {
            var lines = e.stack.split('\n');
            var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
            var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
            if (!fileNameAndLineNumber) { return; }

            rFileName = fileNameAndLineNumber[0];
            return fileNameAndLineNumber[1];
        }
    }

    function getFileNameAndLineNumber(stackLine) {
        // Named functions: 'at functionName (filename:lineNumber:columnNumber)'
        var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
        if (attempt1) { return [attempt1[1], Number(attempt1[2])]; }

        // Anonymous functions: 'at filename:lineNumber:columnNumber'
        var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
        if (attempt2) { return [attempt2[1], Number(attempt2[2])]; }

        // Firefox style: 'function@filename:lineNumber or @filename:lineNumber'
        var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
        if (attempt3) { return [attempt3[1], Number(attempt3[2])]; }
    }

    var EmptyError = Rx.EmptyError = function () {
        this.message = 'Sequence contains no elements.';
        Error.call(this);
    };
    EmptyError.prototype = Object.create(Error.prototype);
    EmptyError.prototype.name = 'EmptyError';

    var ObjectDisposedError = Rx.ObjectDisposedError = function () {
        this.message = 'Object has been disposed';
        Error.call(this);
    };
    ObjectDisposedError.prototype = Object.create(Error.prototype);
    ObjectDisposedError.prototype.name = 'ObjectDisposedError';

    var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function () {
        this.message = 'Argument out of range';
        Error.call(this);
    };
    ArgumentOutOfRangeError.prototype = Object.create(Error.prototype);
    ArgumentOutOfRangeError.prototype.name = 'ArgumentOutOfRangeError';

    var NotSupportedError = Rx.NotSupportedError = function (message) {
        this.message = message || 'This operation is not supported';
        Error.call(this);
    };
    NotSupportedError.prototype = Object.create(Error.prototype);
    NotSupportedError.prototype.name = 'NotSupportedError';

    var NotImplementedError = Rx.NotImplementedError = function (message) {
        this.message = message || 'This operation is not implemented';
        Error.call(this);
    };
    NotImplementedError.prototype = Object.create(Error.prototype);
    NotImplementedError.prototype.name = 'NotImplementedError';

    var notImplemented = Rx.helpers.notImplemented = function () {
        throw new NotImplementedError();
    };

    var notSupported = Rx.helpers.notSupported = function () {
        throw new NotSupportedError();
    };

    // Shim in iterator support
    var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) ||
      '_es6shim_iterator_';
    // Bug for mozilla version
    if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
        $iterator$ = '@@iterator';
    }

    var doneEnumerator = Rx.doneEnumerator = { done: true, value: undefined };

    var isIterable = Rx.helpers.isIterable = function (o) {
        return o && o[$iterator$] !== undefined;
    };

    var isArrayLike = Rx.helpers.isArrayLike = function (o) {
        return o && o.length !== undefined;
    };

    Rx.helpers.iterator = $iterator$;

    var bindCallback = Rx.internals.bindCallback = function (func, thisArg, argCount) {
        if (typeof thisArg === 'undefined') { return func; }
        switch (argCount) {
            case 0:
                return function () {
                    return func.call(thisArg)
                };
            case 1:
                return function (arg) {
                    return func.call(thisArg, arg);
                };
            case 2:
                return function (value, index) {
                    return func.call(thisArg, value, index);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(thisArg, value, index, collection);
                };
        }

        return function () {
            return func.apply(thisArg, arguments);
        };
    };

    /** Used to determine if values are of the language type Object */
    var dontEnums = ['toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'],
    dontEnumsLength = dontEnums.length;

    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dateTag] = typedArrayTags[errorTag] =
    typedArrayTags[funcTag] = typedArrayTags[mapTag] =
    typedArrayTags[numberTag] = typedArrayTags[objectTag] =
    typedArrayTags[regexpTag] = typedArrayTags[setTag] =
    typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

    var objectProto = Object.prototype,
        hasOwnProperty = objectProto.hasOwnProperty,
        objToString = objectProto.toString,
        MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

    var keys = Object.keys || (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
              'toString',
              'toLocaleString',
              'valueOf',
              'hasOwnProperty',
              'isPrototypeOf',
              'propertyIsEnumerable',
              'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());

    function equalObjects(object, other, equalFunc, isLoose, stackA, stackB) {
        var objProps = keys(object),
            objLength = objProps.length,
            othProps = keys(other),
            othLength = othProps.length;

        if (objLength !== othLength && !isLoose) {
            return false;
        }
        var index = objLength, key;
        while (index--) {
            key = objProps[index];
            if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
                return false;
            }
        }
        var skipCtor = isLoose;
        while (++index < objLength) {
            key = objProps[index];
            var objValue = object[key],
                othValue = other[key],
                result;

            if (!(result === undefined ? equalFunc(objValue, othValue, isLoose, stackA, stackB) : result)) {
                return false;
            }
            skipCtor || (skipCtor = key === 'constructor');
        }
        if (!skipCtor) {
            var objCtor = object.constructor,
                othCtor = other.constructor;

            if (objCtor !== othCtor &&
                ('constructor' in object && 'constructor' in other) &&
                !(typeof objCtor === 'function' && objCtor instanceof objCtor &&
                  typeof othCtor === 'function' && othCtor instanceof othCtor)) {
                return false;
            }
        }
        return true;
    }

    function equalByTag(object, other, tag) {
        switch (tag) {
            case boolTag:
            case dateTag:
                return +object === +other;

            case errorTag:
                return object.name === other.name && object.message === other.message;

            case numberTag:
                return (object !== +object) ?
                  other !== +other :
                  object === +other;

            case regexpTag:
            case stringTag:
                return object === (other + '');
        }
        return false;
    }

    var isObject = Rx.internals.isObject = function (value) {
        var type = typeof value;
        return !!value && (type === 'object' || type === 'function');
    };

    function isObjectLike(value) {
        return !!value && typeof value === 'object';
    }

    function isLength(value) {
        return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
    }

    var isHostObject = (function () {
        try {
            Object({ 'toString': 0 } + '');
        } catch (e) {
            return function () { return false; };
        }
        return function (value) {
            return typeof value.toString !== 'function' && typeof (value + '') === 'string';
        };
    }());

    function isTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
    }

    var isArray = Array.isArray || function (value) {
        return isObjectLike(value) && isLength(value.length) && objToString.call(value) === arrayTag;
    };

    function arraySome(array, predicate) {
        var index = -1,
            length = array.length;

        while (++index < length) {
            if (predicate(array[index], index, array)) {
                return true;
            }
        }
        return false;
    }

    function equalArrays(array, other, equalFunc, isLoose, stackA, stackB) {
        var index = -1,
            arrLength = array.length,
            othLength = other.length;

        if (arrLength !== othLength && !(isLoose && othLength > arrLength)) {
            return false;
        }
        // Ignore non-index properties.
        while (++index < arrLength) {
            var arrValue = array[index],
                othValue = other[index],
                result;

            if (result !== undefined) {
                if (result) {
                    continue;
                }
                return false;
            }
            // Recursively compare arrays (susceptible to call stack limits).
            if (isLoose) {
                if (!arraySome(other, function (othValue) {
                      return arrValue === othValue || equalFunc(arrValue, othValue, isLoose, stackA, stackB);
                })) {
                    return false;
                }
            } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, isLoose, stackA, stackB))) {
                return false;
            }
        }
        return true;
    }

    function baseIsEqualDeep(object, other, equalFunc, isLoose, stackA, stackB) {
        var objIsArr = isArray(object),
            othIsArr = isArray(other),
            objTag = arrayTag,
            othTag = arrayTag;

        if (!objIsArr) {
            objTag = objToString.call(object);
            if (objTag === argsTag) {
                objTag = objectTag;
            } else if (objTag !== objectTag) {
                objIsArr = isTypedArray(object);
            }
        }
        if (!othIsArr) {
            othTag = objToString.call(other);
            if (othTag === argsTag) {
                othTag = objectTag;
            }
        }
        var objIsObj = objTag === objectTag && !isHostObject(object),
            othIsObj = othTag === objectTag && !isHostObject(other),
            isSameTag = objTag === othTag;

        if (isSameTag && !(objIsArr || objIsObj)) {
            return equalByTag(object, other, objTag);
        }
        if (!isLoose) {
            var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
                othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

            if (objIsWrapped || othIsWrapped) {
                return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, isLoose, stackA, stackB);
            }
        }
        if (!isSameTag) {
            return false;
        }
        // Assume cyclic values are equal.
        // For more information on detecting circular references see https://es5.github.io/#JO.
        stackA || (stackA = []);
        stackB || (stackB = []);

        var length = stackA.length;
        while (length--) {
            if (stackA[length] === object) {
                return stackB[length] === other;
            }
        }
        // Add `object` and `other` to the stack of traversed objects.
        stackA.push(object);
        stackB.push(other);

        var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, isLoose, stackA, stackB);

        stackA.pop();
        stackB.pop();

        return result;
    }

    function baseIsEqual(value, other, isLoose, stackA, stackB) {
        if (value === other) {
            return true;
        }
        if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
            return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, baseIsEqual, isLoose, stackA, stackB);
    }

    var isEqual = Rx.internals.isEqual = function (value, other) {
        return baseIsEqual(value, other);
    };

    var hasProp = {}.hasOwnProperty,
        slice = Array.prototype.slice;

    var inherits = Rx.internals.inherits = function (child, parent) {
        function __() { this.constructor = child; }
        __.prototype = parent.prototype;
        child.prototype = new __();
    };

    var addProperties = Rx.internals.addProperties = function (obj) {
        for (var sources = [], i = 1, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
        for (var idx = 0, ln = sources.length; idx < ln; idx++) {
            var source = sources[idx];
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    };

    // Rx Utils
    var addRef = Rx.internals.addRef = function (xs, r) {
        return new AnonymousObservable(function (observer) {
            return new BinaryDisposable(r.getDisposable(), xs.subscribe(observer));
        });
    };

    function arrayInitialize(count, factory) {
        var a = new Array(count);
        for (var i = 0; i < count; i++) {
            a[i] = factory();
        }
        return a;
    }

    /**
     * Represents a group of disposable resources that are disposed together.
     * @constructor
     */
    var CompositeDisposable = Rx.CompositeDisposable = function () {
        var args = [], i, len;
        if (Array.isArray(arguments[0])) {
            args = arguments[0];
        } else {
            len = arguments.length;
            args = new Array(len);
            for (i = 0; i < len; i++) { args[i] = arguments[i]; }
        }
        this.disposables = args;
        this.isDisposed = false;
        this.length = args.length;
    };

    var CompositeDisposablePrototype = CompositeDisposable.prototype;

    /**
     * Adds a disposable to the CompositeDisposable or disposes the disposable if the CompositeDisposable is disposed.
     * @param {Mixed} item Disposable to add.
     */
    CompositeDisposablePrototype.add = function (item) {
        if (this.isDisposed) {
            item.dispose();
        } else {
            this.disposables.push(item);
            this.length++;
        }
    };

    /**
     * Removes and disposes the first occurrence of a disposable from the CompositeDisposable.
     * @param {Mixed} item Disposable to remove.
     * @returns {Boolean} true if found; false otherwise.
     */
    CompositeDisposablePrototype.remove = function (item) {
        var shouldDispose = false;
        if (!this.isDisposed) {
            var idx = this.disposables.indexOf(item);
            if (idx !== -1) {
                shouldDispose = true;
                this.disposables.splice(idx, 1);
                this.length--;
                item.dispose();
            }
        }
        return shouldDispose;
    };

    /**
     *  Disposes all disposables in the group and removes them from the group.
     */
    CompositeDisposablePrototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            var len = this.disposables.length, currentDisposables = new Array(len);
            for (var i = 0; i < len; i++) { currentDisposables[i] = this.disposables[i]; }
            this.disposables = [];
            this.length = 0;

            for (i = 0; i < len; i++) {
                currentDisposables[i].dispose();
            }
        }
    };

    /**
     * Provides a set of static methods for creating Disposables.
     * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
     */
    var Disposable = Rx.Disposable = function (action) {
        this.isDisposed = false;
        this.action = action || noop;
    };

    /** Performs the task of cleaning up resources. */
    Disposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.action();
            this.isDisposed = true;
        }
    };

    /**
     * Creates a disposable object that invokes the specified action when disposed.
     * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
     * @return {Disposable} The disposable object that runs the given action upon disposal.
     */
    var disposableCreate = Disposable.create = function (action) { return new Disposable(action); };

    /**
     * Gets the disposable that does nothing when disposed.
     */
    var disposableEmpty = Disposable.empty = { dispose: noop };

    /**
     * Validates whether the given object is a disposable
     * @param {Object} Object to test whether it has a dispose method
     * @returns {Boolean} true if a disposable object, else false.
     */
    var isDisposable = Disposable.isDisposable = function (d) {
        return d && isFunction(d.dispose);
    };

    var checkDisposed = Disposable.checkDisposed = function (disposable) {
        if (disposable.isDisposed) { throw new ObjectDisposedError(); }
    };

    var disposableFixup = Disposable._fixup = function (result) {
        return isDisposable(result) ? result : disposableEmpty;
    };

    // Single assignment
    var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function () {
        this.isDisposed = false;
        this.current = null;
    };
    SingleAssignmentDisposable.prototype.getDisposable = function () {
        return this.current;
    };
    SingleAssignmentDisposable.prototype.setDisposable = function (value) {
        if (this.current) { throw new Error('Disposable has already been assigned'); }
        var shouldDispose = this.isDisposed;
        !shouldDispose && (this.current = value);
        shouldDispose && value && value.dispose();
    };
    SingleAssignmentDisposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            var old = this.current;
            this.current = null;
            old && old.dispose();
        }
    };

    // Multiple assignment disposable
    var SerialDisposable = Rx.SerialDisposable = function () {
        this.isDisposed = false;
        this.current = null;
    };
    SerialDisposable.prototype.getDisposable = function () {
        return this.current;
    };
    SerialDisposable.prototype.setDisposable = function (value) {
        var shouldDispose = this.isDisposed;
        if (!shouldDispose) {
            var old = this.current;
            this.current = value;
        }
        old && old.dispose();
        shouldDispose && value && value.dispose();
    };
    SerialDisposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            var old = this.current;
            this.current = null;
        }
        old && old.dispose();
    };

    var BinaryDisposable = Rx.BinaryDisposable = function (first, second) {
        this._first = first;
        this._second = second;
        this.isDisposed = false;
    };

    BinaryDisposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            var old1 = this._first;
            this._first = null;
            old1 && old1.dispose();
            var old2 = this._second;
            this._second = null;
            old2 && old2.dispose();
        }
    };

    var NAryDisposable = Rx.NAryDisposable = function (disposables) {
        this._disposables = disposables;
        this.isDisposed = false;
    };

    NAryDisposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            for (var i = 0, len = this._disposables.length; i < len; i++) {
                this._disposables[i].dispose();
            }
            this._disposables.length = 0;
        }
    };

    /**
     * Represents a disposable resource that only disposes its underlying disposable resource when all dependent disposable objects have been disposed.
     */
    var RefCountDisposable = Rx.RefCountDisposable = (function () {

        function InnerDisposable(disposable) {
            this.disposable = disposable;
            this.disposable.count++;
            this.isInnerDisposed = false;
        }

        InnerDisposable.prototype.dispose = function () {
            if (!this.disposable.isDisposed && !this.isInnerDisposed) {
                this.isInnerDisposed = true;
                this.disposable.count--;
                if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
                    this.disposable.isDisposed = true;
                    this.disposable.underlyingDisposable.dispose();
                }
            }
        };

        /**
         * Initializes a new instance of the RefCountDisposable with the specified disposable.
         * @constructor
         * @param {Disposable} disposable Underlying disposable.
          */
        function RefCountDisposable(disposable) {
            this.underlyingDisposable = disposable;
            this.isDisposed = false;
            this.isPrimaryDisposed = false;
            this.count = 0;
        }

        /**
         * Disposes the underlying disposable only when all dependent disposables have been disposed
         */
        RefCountDisposable.prototype.dispose = function () {
            if (!this.isDisposed && !this.isPrimaryDisposed) {
                this.isPrimaryDisposed = true;
                if (this.count === 0) {
                    this.isDisposed = true;
                    this.underlyingDisposable.dispose();
                }
            }
        };

        /**
         * Returns a dependent disposable that when disposed decreases the refcount on the underlying disposable.
         * @returns {Disposable} A dependent disposable contributing to the reference count that manages the underlying disposable's lifetime.
         */
        RefCountDisposable.prototype.getDisposable = function () {
            return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
        };

        return RefCountDisposable;
    })();

    var ScheduledItem = Rx.internals.ScheduledItem = function (scheduler, state, action, dueTime, comparer) {
        this.scheduler = scheduler;
        this.state = state;
        this.action = action;
        this.dueTime = dueTime;
        this.comparer = comparer || defaultSubComparer;
        this.disposable = new SingleAssignmentDisposable();
    };

    ScheduledItem.prototype.invoke = function () {
        this.disposable.setDisposable(this.invokeCore());
    };

    ScheduledItem.prototype.compareTo = function (other) {
        return this.comparer(this.dueTime, other.dueTime);
    };

    ScheduledItem.prototype.isCancelled = function () {
        return this.disposable.isDisposed;
    };

    ScheduledItem.prototype.invokeCore = function () {
        return disposableFixup(this.action(this.scheduler, this.state));
    };

    /** Provides a set of static properties to access commonly used schedulers. */
    var Scheduler = Rx.Scheduler = (function () {

        function Scheduler() { }

        /** Determines whether the given object is a scheduler */
        Scheduler.isScheduler = function (s) {
            return s instanceof Scheduler;
        };

        var schedulerProto = Scheduler.prototype;

        /**
       * Schedules an action to be executed.
       * @param state State passed to the action to be executed.
       * @param {Function} action Action to be executed.
       * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
       */
        schedulerProto.schedule = function (state, action) {
            throw new NotImplementedError();
        };

        /**
         * Schedules an action to be executed after dueTime.
         * @param state State passed to the action to be executed.
         * @param {Function} action Action to be executed.
         * @param {Number} dueTime Relative time after which to execute the action.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        schedulerProto.scheduleFuture = function (state, dueTime, action) {
            var dt = dueTime;
            dt instanceof Date && (dt = dt - this.now());
            dt = Scheduler.normalize(dt);

            if (dt === 0) { return this.schedule(state, action); }

            return this._scheduleFuture(state, dt, action);
        };

        schedulerProto._scheduleFuture = function (state, dueTime, action) {
            throw new NotImplementedError();
        };

        /** Gets the current time according to the local machine's system clock. */
        Scheduler.now = defaultNow;

        /** Gets the current time according to the local machine's system clock. */
        Scheduler.prototype.now = defaultNow;

        /**
         * Normalizes the specified TimeSpan value to a positive value.
         * @param {Number} timeSpan The time span value to normalize.
         * @returns {Number} The specified TimeSpan value if it is zero or positive; otherwise, 0
         */
        Scheduler.normalize = function (timeSpan) {
            timeSpan < 0 && (timeSpan = 0);
            return timeSpan;
        };

        return Scheduler;
    }());

    var normalizeTime = Scheduler.normalize, isScheduler = Scheduler.isScheduler;

    (function (schedulerProto) {

        function invokeRecImmediate(scheduler, pair) {
            var state = pair[0], action = pair[1], group = new CompositeDisposable();
            action(state, innerAction);
            return group;

            function innerAction(state2) {
                var isAdded = false, isDone = false;

                var d = scheduler.schedule(state2, scheduleWork);
                if (!isDone) {
                    group.add(d);
                    isAdded = true;
                }

                function scheduleWork(_, state3) {
                    if (isAdded) {
                        group.remove(d);
                    } else {
                        isDone = true;
                    }
                    action(state3, innerAction);
                    return disposableEmpty;
                }
            }
        }

        function invokeRecDate(scheduler, pair) {
            var state = pair[0], action = pair[1], group = new CompositeDisposable();
            action(state, innerAction);
            return group;

            function innerAction(state2, dueTime1) {
                var isAdded = false, isDone = false;

                var d = scheduler.scheduleFuture(state2, dueTime1, scheduleWork);
                if (!isDone) {
                    group.add(d);
                    isAdded = true;
                }

                function scheduleWork(_, state3) {
                    if (isAdded) {
                        group.remove(d);
                    } else {
                        isDone = true;
                    }
                    action(state3, innerAction);
                    return disposableEmpty;
                }
            }
        }

        /**
         * Schedules an action to be executed recursively.
         * @param {Mixed} state State passed to the action to be executed.
         * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        schedulerProto.scheduleRecursive = function (state, action) {
            return this.schedule([state, action], invokeRecImmediate);
        };

        /**
         * Schedules an action to be executed recursively after a specified relative or absolute due time.
         * @param {Mixed} state State passed to the action to be executed.
         * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
         * @param {Number | Date} dueTime Relative or absolute time after which to execute the action for the first time.
         * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
         */
        schedulerProto.scheduleRecursiveFuture = function (state, dueTime, action) {
            return this.scheduleFuture([state, action], dueTime, invokeRecDate);
        };

    }(Scheduler.prototype));

    (function (schedulerProto) {

        /**
         * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
         * @param {Mixed} state Initial state passed to the action upon the first iteration.
         * @param {Number} period Period for running the work periodically.
         * @param {Function} action Action to be executed, potentially updating the state.
         * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
         */
        schedulerProto.schedulePeriodic = function (state, period, action) {
            if (typeof root.setInterval === 'undefined') { throw new NotSupportedError(); }
            period = normalizeTime(period);
            var s = state, id = root.setInterval(function () { s = action(s); }, period);
            return disposableCreate(function () { root.clearInterval(id); });
        };

    }(Scheduler.prototype));

    /** Gets a scheduler that schedules work immediately on the current thread. */
    var ImmediateScheduler = (function (__super__) {
        inherits(ImmediateScheduler, __super__);
        function ImmediateScheduler() {
            __super__.call(this);
        }

        ImmediateScheduler.prototype.schedule = function (state, action) {
            return disposableFixup(action(this, state));
        };

        return ImmediateScheduler;
    }(Scheduler));

    var immediateScheduler = Scheduler.immediate = new ImmediateScheduler();

    /**
     * Gets a scheduler that schedules work as soon as possible on the current thread.
     */
    var CurrentThreadScheduler = (function (__super__) {
        var queue;

        function runTrampoline() {
            while (queue.length > 0) {
                var item = queue.dequeue();
                !item.isCancelled() && item.invoke();
            }
        }

        inherits(CurrentThreadScheduler, __super__);
        function CurrentThreadScheduler() {
            __super__.call(this);
        }

        CurrentThreadScheduler.prototype.schedule = function (state, action) {
            var si = new ScheduledItem(this, state, action, this.now());

            if (!queue) {
                queue = new PriorityQueue(4);
                queue.enqueue(si);

                var result = tryCatch(runTrampoline)();
                queue = null;
                if (result === errorObj) { thrower(result.e); }
            } else {
                queue.enqueue(si);
            }
            return si.disposable;
        };

        CurrentThreadScheduler.prototype.scheduleRequired = function () { return !queue; };

        return CurrentThreadScheduler;
    }(Scheduler));

    var currentThreadScheduler = Scheduler.currentThread = new CurrentThreadScheduler();

    var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function () {
        function createTick(self) {
            return function tick(command, recurse) {
                recurse(0, self._period);
                var state = tryCatch(self._action)(self._state);
                if (state === errorObj) {
                    self._cancel.dispose();
                    thrower(state.e);
                }
                self._state = state;
            };
        }

        function SchedulePeriodicRecursive(scheduler, state, period, action) {
            this._scheduler = scheduler;
            this._state = state;
            this._period = period;
            this._action = action;
        }

        SchedulePeriodicRecursive.prototype.start = function () {
            var d = new SingleAssignmentDisposable();
            this._cancel = d;
            d.setDisposable(this._scheduler.scheduleRecursiveFuture(0, this._period, createTick(this)));

            return d;
        };

        return SchedulePeriodicRecursive;
    }());

    var scheduleMethod, clearMethod;

    var localTimer = (function () {
        var localSetTimeout, localClearTimeout = noop;
        if (!!root.setTimeout) {
            localSetTimeout = root.setTimeout;
            localClearTimeout = root.clearTimeout;
        } else if (!!root.WScript) {
            localSetTimeout = function (fn, time) {
                root.WScript.Sleep(time);
                fn();
            };
        } else {
            throw new NotSupportedError();
        }

        return {
            setTimeout: localSetTimeout,
            clearTimeout: localClearTimeout
        };
    }());
    var localSetTimeout = localTimer.setTimeout,
      localClearTimeout = localTimer.clearTimeout;

    (function () {

        var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false;

        clearMethod = function (handle) {
            delete tasksByHandle[handle];
        };

        function runTask(handle) {
            if (currentlyRunning) {
                localSetTimeout(function () { runTask(handle); }, 0);
            } else {
                var task = tasksByHandle[handle];
                if (task) {
                    currentlyRunning = true;
                    var result = tryCatch(task)();
                    clearMethod(handle);
                    currentlyRunning = false;
                    if (result === errorObj) { thrower(result.e); }
                }
            }
        }

        var reNative = new RegExp('^' +
          String(toString)
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/toString| for [^\]]+/g, '.*?') + '$'
        );

        var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' &&
          !reNative.test(setImmediate) && setImmediate;

        function postMessageSupported() {
            // Ensure not in a worker
            if (!root.postMessage || root.importScripts) { return false; }
            var isAsync = false, oldHandler = root.onmessage;
            // Test for async
            root.onmessage = function () { isAsync = true; };
            root.postMessage('', '*');
            root.onmessage = oldHandler;

            return isAsync;
        }

        // Use in order, setImmediate, nextTick, postMessage, MessageChannel, script readystatechanged, setTimeout
        if (isFunction(setImmediate)) {
            scheduleMethod = function (action) {
                var id = nextHandle++;
                tasksByHandle[id] = action;
                setImmediate(function () { runTask(id); });

                return id;
            };
        } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
            scheduleMethod = function (action) {
                var id = nextHandle++;
                tasksByHandle[id] = action;
                process.nextTick(function () { runTask(id); });

                return id;
            };
        } else if (postMessageSupported()) {
            var MSG_PREFIX = 'ms.rx.schedule' + Math.random();

            var onGlobalPostMessage = function (event) {
                // Only if we're a match to avoid any other global events
                if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
                    runTask(event.data.substring(MSG_PREFIX.length));
                }
            };

            root.addEventListener('message', onGlobalPostMessage, false);

            scheduleMethod = function (action) {
                var id = nextHandle++;
                tasksByHandle[id] = action;
                root.postMessage(MSG_PREFIX + id, '*');
                return id;
            };
        } else if (!!root.MessageChannel) {
            var channel = new root.MessageChannel();

            channel.port1.onmessage = function (e) { runTask(e.data); };

            scheduleMethod = function (action) {
                var id = nextHandle++;
                tasksByHandle[id] = action;
                channel.port2.postMessage(id);
                return id;
            };
        } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {

            scheduleMethod = function (action) {
                var scriptElement = root.document.createElement('script');
                var id = nextHandle++;
                tasksByHandle[id] = action;

                scriptElement.onreadystatechange = function () {
                    runTask(id);
                    scriptElement.onreadystatechange = null;
                    scriptElement.parentNode.removeChild(scriptElement);
                    scriptElement = null;
                };
                root.document.documentElement.appendChild(scriptElement);
                return id;
            };

        } else {
            scheduleMethod = function (action) {
                var id = nextHandle++;
                tasksByHandle[id] = action;
                localSetTimeout(function () {
                    runTask(id);
                }, 0);

                return id;
            };
        }
    }());

    /**
     * Gets a scheduler that schedules work via a timed callback based upon platform.
     */
    var DefaultScheduler = (function (__super__) {
        inherits(DefaultScheduler, __super__);
        function DefaultScheduler() {
            __super__.call(this);
        }

        function scheduleAction(disposable, action, scheduler, state) {
            return function schedule() {
                disposable.setDisposable(Disposable._fixup(action(scheduler, state)));
            };
        }

        function ClearDisposable(id) {
            this._id = id;
            this.isDisposed = false;
        }

        ClearDisposable.prototype.dispose = function () {
            if (!this.isDisposed) {
                this.isDisposed = true;
                clearMethod(this._id);
            }
        };

        function LocalClearDisposable(id) {
            this._id = id;
            this.isDisposed = false;
        }

        LocalClearDisposable.prototype.dispose = function () {
            if (!this.isDisposed) {
                this.isDisposed = true;
                localClearTimeout(this._id);
            }
        };

        DefaultScheduler.prototype.schedule = function (state, action) {
            var disposable = new SingleAssignmentDisposable(),
                id = scheduleMethod(scheduleAction(disposable, action, this, state));
            return new BinaryDisposable(disposable, new ClearDisposable(id));
        };

        DefaultScheduler.prototype._scheduleFuture = function (state, dueTime, action) {
            if (dueTime === 0) { return this.schedule(state, action); }
            var disposable = new SingleAssignmentDisposable(),
                id = localSetTimeout(scheduleAction(disposable, action, this, state), dueTime);
            return new BinaryDisposable(disposable, new LocalClearDisposable(id));
        };

        function scheduleLongRunning(state, action, disposable) {
            return function () { action(state, disposable); };
        }

        DefaultScheduler.prototype.scheduleLongRunning = function (state, action) {
            var disposable = disposableCreate(noop);
            scheduleMethod(scheduleLongRunning(state, action, disposable));
            return disposable;
        };

        return DefaultScheduler;
    }(Scheduler));

    var defaultScheduler = Scheduler['default'] = Scheduler.async = new DefaultScheduler();

    function IndexedItem(id, value) {
        this.id = id;
        this.value = value;
    }

    IndexedItem.prototype.compareTo = function (other) {
        var c = this.value.compareTo(other.value);
        c === 0 && (c = this.id - other.id);
        return c;
    };

    var PriorityQueue = Rx.internals.PriorityQueue = function (capacity) {
        this.items = new Array(capacity);
        this.length = 0;
    };

    var priorityProto = PriorityQueue.prototype;
    priorityProto.isHigherPriority = function (left, right) {
        return this.items[left].compareTo(this.items[right]) < 0;
    };

    priorityProto.percolate = function (index) {
        if (index >= this.length || index < 0) { return; }
        var parent = index - 1 >> 1;
        if (parent < 0 || parent === index) { return; }
        if (this.isHigherPriority(index, parent)) {
            var temp = this.items[index];
            this.items[index] = this.items[parent];
            this.items[parent] = temp;
            this.percolate(parent);
        }
    };

    priorityProto.heapify = function (index) {
        +index || (index = 0);
        if (index >= this.length || index < 0) { return; }
        var left = 2 * index + 1,
            right = 2 * index + 2,
            first = index;
        if (left < this.length && this.isHigherPriority(left, first)) {
            first = left;
        }
        if (right < this.length && this.isHigherPriority(right, first)) {
            first = right;
        }
        if (first !== index) {
            var temp = this.items[index];
            this.items[index] = this.items[first];
            this.items[first] = temp;
            this.heapify(first);
        }
    };

    priorityProto.peek = function () { return this.items[0].value; };

    priorityProto.removeAt = function (index) {
        this.items[index] = this.items[--this.length];
        this.items[this.length] = undefined;
        this.heapify();
    };

    priorityProto.dequeue = function () {
        var result = this.peek();
        this.removeAt(0);
        return result;
    };

    priorityProto.enqueue = function (item) {
        var index = this.length++;
        this.items[index] = new IndexedItem(PriorityQueue.count++, item);
        this.percolate(index);
    };

    priorityProto.remove = function (item) {
        for (var i = 0; i < this.length; i++) {
            if (this.items[i].value === item) {
                this.removeAt(i);
                return true;
            }
        }
        return false;
    };
    PriorityQueue.count = 0;

    /**
     *  Represents a notification to an observer.
     */
    var Notification = Rx.Notification = (function () {
        function Notification() {

        }

        Notification.prototype._accept = function (onNext, onError, onCompleted) {
            throw new NotImplementedError();
        };

        Notification.prototype._acceptObserver = function (onNext, onError, onCompleted) {
            throw new NotImplementedError();
        };

        /**
         * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
         * @param {Function | Observer} observerOrOnNext Function to invoke for an OnNext notification or Observer to invoke the notification on..
         * @param {Function} onError Function to invoke for an OnError notification.
         * @param {Function} onCompleted Function to invoke for an OnCompleted notification.
         * @returns {Any} Result produced by the observation.
         */
        Notification.prototype.accept = function (observerOrOnNext, onError, onCompleted) {
            return observerOrOnNext && typeof observerOrOnNext === 'object' ?
              this._acceptObserver(observerOrOnNext) :
              this._accept(observerOrOnNext, onError, onCompleted);
        };

        /**
         * Returns an observable sequence with a single notification.
         *
         * @memberOf Notifications
         * @param {Scheduler} [scheduler] Scheduler to send out the notification calls on.
         * @returns {Observable} The observable sequence that surfaces the behavior of the notification upon subscription.
         */
        Notification.prototype.toObservable = function (scheduler) {
            var self = this;
            isScheduler(scheduler) || (scheduler = immediateScheduler);
            return new AnonymousObservable(function (o) {
                return scheduler.schedule(self, function (_, notification) {
                    notification._acceptObserver(o);
                    notification.kind === 'N' && o.onCompleted();
                });
            });
        };

        return Notification;
    })();

    var OnNextNotification = (function (__super__) {
        inherits(OnNextNotification, __super__);
        function OnNextNotification(value) {
            this.value = value;
            this.kind = 'N';
        }

        OnNextNotification.prototype._accept = function (onNext) {
            return onNext(this.value);
        };

        OnNextNotification.prototype._acceptObserver = function (o) {
            return o.onNext(this.value);
        };

        OnNextNotification.prototype.toString = function () {
            return 'OnNext(' + this.value + ')';
        };

        return OnNextNotification;
    }(Notification));

    var OnErrorNotification = (function (__super__) {
        inherits(OnErrorNotification, __super__);
        function OnErrorNotification(error) {
            this.error = error;
            this.kind = 'E';
        }

        OnErrorNotification.prototype._accept = function (onNext, onError) {
            return onError(this.error);
        };

        OnErrorNotification.prototype._acceptObserver = function (o) {
            return o.onError(this.error);
        };

        OnErrorNotification.prototype.toString = function () {
            return 'OnError(' + this.error + ')';
        };

        return OnErrorNotification;
    }(Notification));

    var OnCompletedNotification = (function (__super__) {
        inherits(OnCompletedNotification, __super__);
        function OnCompletedNotification() {
            this.kind = 'C';
        }

        OnCompletedNotification.prototype._accept = function (onNext, onError, onCompleted) {
            return onCompleted();
        };

        OnCompletedNotification.prototype._acceptObserver = function (o) {
            return o.onCompleted();
        };

        OnCompletedNotification.prototype.toString = function () {
            return 'OnCompleted()';
        };

        return OnCompletedNotification;
    }(Notification));

    /**
     * Creates an object that represents an OnNext notification to an observer.
     * @param {Any} value The value contained in the notification.
     * @returns {Notification} The OnNext notification containing the value.
     */
    var notificationCreateOnNext = Notification.createOnNext = function (value) {
        return new OnNextNotification(value);
    };

    /**
     * Creates an object that represents an OnError notification to an observer.
     * @param {Any} error The exception contained in the notification.
     * @returns {Notification} The OnError notification containing the exception.
     */
    var notificationCreateOnError = Notification.createOnError = function (error) {
        return new OnErrorNotification(error);
    };

    /**
     * Creates an object that represents an OnCompleted notification to an observer.
     * @returns {Notification} The OnCompleted notification.
     */
    var notificationCreateOnCompleted = Notification.createOnCompleted = function () {
        return new OnCompletedNotification();
    };

    /**
     * Supports push-style iteration over an observable sequence.
     */
    var Observer = Rx.Observer = function () { };

    /**
     *  Creates an observer from the specified OnNext, along with optional OnError, and OnCompleted actions.
     * @param {Function} [onNext] Observer's OnNext action implementation.
     * @param {Function} [onError] Observer's OnError action implementation.
     * @param {Function} [onCompleted] Observer's OnCompleted action implementation.
     * @returns {Observer} The observer object implemented using the given actions.
     */
    var observerCreate = Observer.create = function (onNext, onError, onCompleted) {
        onNext || (onNext = noop);
        onError || (onError = defaultError);
        onCompleted || (onCompleted = noop);
        return new AnonymousObserver(onNext, onError, onCompleted);
    };

    /**
     * Abstract base class for implementations of the Observer class.
     * This base class enforces the grammar of observers where OnError and OnCompleted are terminal messages.
     */
    var AbstractObserver = Rx.internals.AbstractObserver = (function (__super__) {
        inherits(AbstractObserver, __super__);

        /**
         * Creates a new observer in a non-stopped state.
         */
        function AbstractObserver() {
            this.isStopped = false;
        }

        // Must be implemented by other observers
        AbstractObserver.prototype.next = notImplemented;
        AbstractObserver.prototype.error = notImplemented;
        AbstractObserver.prototype.completed = notImplemented;

        /**
         * Notifies the observer of a new element in the sequence.
         * @param {Any} value Next element in the sequence.
         */
        AbstractObserver.prototype.onNext = function (value) {
            !this.isStopped && this.next(value);
        };

        /**
         * Notifies the observer that an exception has occurred.
         * @param {Any} error The error that has occurred.
         */
        AbstractObserver.prototype.onError = function (error) {
            if (!this.isStopped) {
                this.isStopped = true;
                this.error(error);
            }
        };

        /**
         * Notifies the observer of the end of the sequence.
         */
        AbstractObserver.prototype.onCompleted = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this.completed();
            }
        };

        /**
         * Disposes the observer, causing it to transition to the stopped state.
         */
        AbstractObserver.prototype.dispose = function () { this.isStopped = true; };

        AbstractObserver.prototype.fail = function (e) {
            if (!this.isStopped) {
                this.isStopped = true;
                this.error(e);
                return true;
            }

            return false;
        };

        return AbstractObserver;
    }(Observer));

    /**
     * Class to create an Observer instance from delegate-based implementations of the on* methods.
     */
    var AnonymousObserver = Rx.AnonymousObserver = (function (__super__) {
        inherits(AnonymousObserver, __super__);

        /**
         * Creates an observer from the specified OnNext, OnError, and OnCompleted actions.
         * @param {Any} onNext Observer's OnNext action implementation.
         * @param {Any} onError Observer's OnError action implementation.
         * @param {Any} onCompleted Observer's OnCompleted action implementation.
         */
        function AnonymousObserver(onNext, onError, onCompleted) {
            __super__.call(this);
            this._onNext = onNext;
            this._onError = onError;
            this._onCompleted = onCompleted;
        }

        /**
         * Calls the onNext action.
         * @param {Any} value Next element in the sequence.
         */
        AnonymousObserver.prototype.next = function (value) {
            this._onNext(value);
        };

        /**
         * Calls the onError action.
         * @param {Any} error The error that has occurred.
         */
        AnonymousObserver.prototype.error = function (error) {
            this._onError(error);
        };

        /**
         *  Calls the onCompleted action.
         */
        AnonymousObserver.prototype.completed = function () {
            this._onCompleted();
        };

        return AnonymousObserver;
    }(AbstractObserver));

    var observableProto;

    /**
     * Represents a push-style collection.
     */
    var Observable = Rx.Observable = (function () {

        function makeSubscribe(self, subscribe) {
            return function (o) {
                var oldOnError = o.onError;
                o.onError = function (e) {
                    makeStackTraceLong(e, self);
                    oldOnError.call(o, e);
                };

                return subscribe.call(self, o);
            };
        }

        function Observable() {
            if (Rx.config.longStackSupport && hasStacks) {
                var oldSubscribe = this._subscribe;
                var e = tryCatch(thrower)(new Error()).e;
                this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
                this._subscribe = makeSubscribe(this, oldSubscribe);
            }
        }

        observableProto = Observable.prototype;

        /**
        * Determines whether the given object is an Observable
        * @param {Any} An object to determine whether it is an Observable
        * @returns {Boolean} true if an Observable, else false.
        */
        Observable.isObservable = function (o) {
            return o && isFunction(o.subscribe);
        };

        /**
         *  Subscribes an o to the observable sequence.
         *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
         *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
         *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
         *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
         */
        observableProto.subscribe = observableProto.forEach = function (oOrOnNext, onError, onCompleted) {
            return this._subscribe(typeof oOrOnNext === 'object' ?
                oOrOnNext :
              observerCreate(oOrOnNext, onError, onCompleted));
        };

        /**
         * Subscribes to the next value in the sequence with an optional "this" argument.
         * @param {Function} onNext The function to invoke on each element in the observable sequence.
         * @param {Any} [thisArg] Object to use as this when executing callback.
         * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
         */
        observableProto.subscribeOnNext = function (onNext, thisArg) {
            return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function (x) { onNext.call(thisArg, x); } : onNext));
        };

        /**
         * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
         * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
         * @param {Any} [thisArg] Object to use as this when executing callback.
         * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
         */
        observableProto.subscribeOnError = function (onError, thisArg) {
            return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function (e) { onError.call(thisArg, e); } : onError));
        };

        /**
         * Subscribes to the next value in the sequence with an optional "this" argument.
         * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
         * @param {Any} [thisArg] Object to use as this when executing callback.
         * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
         */
        observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
            return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function () { onCompleted.call(thisArg); } : onCompleted));
        };

        return Observable;
    })();

    var ScheduledObserver = Rx.internals.ScheduledObserver = (function (__super__) {
        inherits(ScheduledObserver, __super__);

        function ScheduledObserver(scheduler, observer) {
            __super__.call(this);
            this.scheduler = scheduler;
            this.observer = observer;
            this.isAcquired = false;
            this.hasFaulted = false;
            this.queue = [];
            this.disposable = new SerialDisposable();
        }

        function enqueueNext(observer, x) { return function () { observer.onNext(x); }; }
        function enqueueError(observer, e) { return function () { observer.onError(e); }; }
        function enqueueCompleted(observer) { return function () { observer.onCompleted(); }; }

        ScheduledObserver.prototype.next = function (x) {
            this.queue.push(enqueueNext(this.observer, x));
        };

        ScheduledObserver.prototype.error = function (e) {
            this.queue.push(enqueueError(this.observer, e));
        };

        ScheduledObserver.prototype.completed = function () {
            this.queue.push(enqueueCompleted(this.observer));
        };


        function scheduleMethod(state, recurse) {
            var work;
            if (state.queue.length > 0) {
                work = state.queue.shift();
            } else {
                state.isAcquired = false;
                return;
            }
            var res = tryCatch(work)();
            if (res === errorObj) {
                state.queue = [];
                state.hasFaulted = true;
                return thrower(res.e);
            }
            recurse(state);
        }

        ScheduledObserver.prototype.ensureActive = function () {
            var isOwner = false;
            if (!this.hasFaulted && this.queue.length > 0) {
                isOwner = !this.isAcquired;
                this.isAcquired = true;
            }
            isOwner &&
              this.disposable.setDisposable(this.scheduler.scheduleRecursive(this, scheduleMethod));
        };

        ScheduledObserver.prototype.dispose = function () {
            __super__.prototype.dispose.call(this);
            this.disposable.dispose();
        };

        return ScheduledObserver;
    }(AbstractObserver));

    var ObservableBase = Rx.ObservableBase = (function (__super__) {
        inherits(ObservableBase, __super__);

        function fixSubscriber(subscriber) {
            return subscriber && isFunction(subscriber.dispose) ? subscriber :
              isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
        }

        function setDisposable(s, state) {
            var ado = state[0], self = state[1];
            var sub = tryCatch(self.subscribeCore).call(self, ado);
            if (sub === errorObj && !ado.fail(errorObj.e)) { thrower(errorObj.e); }
            ado.setDisposable(fixSubscriber(sub));
        }

        function ObservableBase() {
            __super__.call(this);
        }

        ObservableBase.prototype._subscribe = function (o) {
            var ado = new AutoDetachObserver(o), state = [ado, this];

            if (currentThreadScheduler.scheduleRequired()) {
                currentThreadScheduler.schedule(state, setDisposable);
            } else {
                setDisposable(null, state);
            }
            return ado;
        };

        ObservableBase.prototype.subscribeCore = notImplemented;

        return ObservableBase;
    }(Observable));

    var FlatMapObservable = Rx.FlatMapObservable = (function (__super__) {

        inherits(FlatMapObservable, __super__);

        function FlatMapObservable(source, selector, resultSelector, thisArg) {
            this.resultSelector = isFunction(resultSelector) ? resultSelector : null;
            this.selector = bindCallback(isFunction(selector) ? selector : function () { return selector; }, thisArg, 3);
            this.source = source;
            __super__.call(this);
        }

        FlatMapObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this.selector, this.resultSelector, this));
        };

        inherits(InnerObserver, AbstractObserver);
        function InnerObserver(observer, selector, resultSelector, source) {
            this.i = 0;
            this.selector = selector;
            this.resultSelector = resultSelector;
            this.source = source;
            this.o = observer;
            AbstractObserver.call(this);
        }

        InnerObserver.prototype._wrapResult = function (result, x, i) {
            return this.resultSelector ?
              result.map(function (y, i2) { return this.resultSelector(x, y, i, i2); }, this) :
              result;
        };

        InnerObserver.prototype.next = function (x) {
            var i = this.i++;
            var result = tryCatch(this.selector)(x, i, this.source);
            if (result === errorObj) { return this.o.onError(result.e); }

            isPromise(result) && (result = observableFromPromise(result));
            (isArrayLike(result) || isIterable(result)) && (result = Observable.from(result));
            this.o.onNext(this._wrapResult(result, x, i));
        };

        InnerObserver.prototype.error = function (e) { this.o.onError(e); };

        InnerObserver.prototype.completed = function () { this.o.onCompleted(); };

        return FlatMapObservable;

    }(ObservableBase));

    var Enumerable = Rx.internals.Enumerable = function () { };

    function IsDisposedDisposable(state) {
        this._s = state;
        this.isDisposed = false;
    }

    IsDisposedDisposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            this._s.isDisposed = true;
        }
    };

    var ConcatEnumerableObservable = (function (__super__) {
        inherits(ConcatEnumerableObservable, __super__);
        function ConcatEnumerableObservable(sources) {
            this.sources = sources;
            __super__.call(this);
        }

        function scheduleMethod(state, recurse) {
            if (state.isDisposed) { return; }
            var currentItem = tryCatch(state.e.next).call(state.e);
            if (currentItem === errorObj) { return state.o.onError(currentItem.e); }
            if (currentItem.done) { return state.o.onCompleted(); }

            // Check if promise
            var currentValue = currentItem.value;
            isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

            var d = new SingleAssignmentDisposable();
            state.subscription.setDisposable(d);
            d.setDisposable(currentValue.subscribe(new InnerObserver(state, recurse)));
        }

        ConcatEnumerableObservable.prototype.subscribeCore = function (o) {
            var subscription = new SerialDisposable();
            var state = {
                isDisposed: false,
                o: o,
                subscription: subscription,
                e: this.sources[$iterator$]()
            };

            var cancelable = currentThreadScheduler.scheduleRecursive(state, scheduleMethod);
            return new NAryDisposable([subscription, cancelable, new IsDisposedDisposable(state)]);
        };

        function InnerObserver(state, recurse) {
            this._state = state;
            this._recurse = recurse;
            AbstractObserver.call(this);
        }

        inherits(InnerObserver, AbstractObserver);

        InnerObserver.prototype.next = function (x) { this._state.o.onNext(x); };
        InnerObserver.prototype.error = function (e) { this._state.o.onError(e); };
        InnerObserver.prototype.completed = function () { this._recurse(this._state); };

        return ConcatEnumerableObservable;
    }(ObservableBase));

    Enumerable.prototype.concat = function () {
        return new ConcatEnumerableObservable(this);
    };

    var CatchErrorObservable = (function (__super__) {
        function CatchErrorObservable(sources) {
            this.sources = sources;
            __super__.call(this);
        }

        inherits(CatchErrorObservable, __super__);

        function scheduleMethod(state, recurse) {
            if (state.isDisposed) { return; }
            var currentItem = tryCatch(state.e.next).call(state.e);
            if (currentItem === errorObj) { return state.o.onError(currentItem.e); }
            if (currentItem.done) { return state.lastError !== null ? state.o.onError(state.lastError) : state.o.onCompleted(); }

            var currentValue = currentItem.value;
            isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

            var d = new SingleAssignmentDisposable();
            state.subscription.setDisposable(d);
            d.setDisposable(currentValue.subscribe(new InnerObserver(state, recurse)));
        }

        CatchErrorObservable.prototype.subscribeCore = function (o) {
            var subscription = new SerialDisposable();
            var state = {
                isDisposed: false,
                e: this.sources[$iterator$](),
                subscription: subscription,
                lastError: null,
                o: o
            };

            var cancelable = currentThreadScheduler.scheduleRecursive(state, scheduleMethod);
            return new NAryDisposable([subscription, cancelable, new IsDisposedDisposable(state)]);
        };

        function InnerObserver(state, recurse) {
            this._state = state;
            this._recurse = recurse;
            AbstractObserver.call(this);
        }

        inherits(InnerObserver, AbstractObserver);

        InnerObserver.prototype.next = function (x) { this._state.o.onNext(x); };
        InnerObserver.prototype.error = function (e) { this._state.lastError = e; this._recurse(this._state); };
        InnerObserver.prototype.completed = function () { this._state.o.onCompleted(); };

        return CatchErrorObservable;
    }(ObservableBase));

    Enumerable.prototype.catchError = function () {
        return new CatchErrorObservable(this);
    };

    var RepeatEnumerable = (function (__super__) {
        inherits(RepeatEnumerable, __super__);
        function RepeatEnumerable(v, c) {
            this.v = v;
            this.c = c == null ? -1 : c;
        }

        RepeatEnumerable.prototype[$iterator$] = function () {
            return new RepeatEnumerator(this);
        };

        function RepeatEnumerator(p) {
            this.v = p.v;
            this.l = p.c;
        }

        RepeatEnumerator.prototype.next = function () {
            if (this.l === 0) { return doneEnumerator; }
            if (this.l > 0) { this.l--; }
            return { done: false, value: this.v };
        };

        return RepeatEnumerable;
    }(Enumerable));

    var enumerableRepeat = Enumerable.repeat = function (value, repeatCount) {
        return new RepeatEnumerable(value, repeatCount);
    };

    var OfEnumerable = (function (__super__) {
        inherits(OfEnumerable, __super__);
        function OfEnumerable(s, fn, thisArg) {
            this.s = s;
            this.fn = fn ? bindCallback(fn, thisArg, 3) : null;
        }
        OfEnumerable.prototype[$iterator$] = function () {
            return new OfEnumerator(this);
        };

        function OfEnumerator(p) {
            this.i = -1;
            this.s = p.s;
            this.l = this.s.length;
            this.fn = p.fn;
        }

        OfEnumerator.prototype.next = function () {
            return ++this.i < this.l ?
       { done: false, value: !this.fn ? this.s[this.i] : this.fn(this.s[this.i], this.i, this.s) } :
              doneEnumerator;
        };

        return OfEnumerable;
    }(Enumerable));

    var enumerableOf = Enumerable.of = function (source, selector, thisArg) {
        return new OfEnumerable(source, selector, thisArg);
    };

    var ToArrayObservable = (function (__super__) {
        inherits(ToArrayObservable, __super__);
        function ToArrayObservable(source) {
            this.source = source;
            __super__.call(this);
        }

        ToArrayObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o));
        };

        inherits(InnerObserver, AbstractObserver);
        function InnerObserver(o) {
            this.o = o;
            this.a = [];
            AbstractObserver.call(this);
        }

        InnerObserver.prototype.next = function (x) { this.a.push(x); };
        InnerObserver.prototype.error = function (e) { this.o.onError(e); };
        InnerObserver.prototype.completed = function () { this.o.onNext(this.a); this.o.onCompleted(); };

        return ToArrayObservable;
    }(ObservableBase));

    /**
    * Creates an array from an observable sequence.
    * @returns {Observable} An observable sequence containing a single element with a list containing all the elements of the source sequence.
    */
    observableProto.toArray = function () {
        return new ToArrayObservable(this);
    };

    /**
     *  Creates an observable sequence from a specified subscribe method implementation.
     * @example
     *  var res = Rx.Observable.create(function (observer) { return function () { } );
     *  var res = Rx.Observable.create(function (observer) { return Rx.Disposable.empty; } );
     *  var res = Rx.Observable.create(function (observer) { } );
     * @param {Function} subscribe Implementation of the resulting observable sequence's subscribe method, returning a function that will be wrapped in a Disposable.
     * @returns {Observable} The observable sequence with the specified implementation for the Subscribe method.
     */
    Observable.create = function (subscribe, parent) {
        return new AnonymousObservable(subscribe, parent);
    };

    var Defer = (function (__super__) {
        inherits(Defer, __super__);
        function Defer(factory) {
            this._f = factory;
            __super__.call(this);
        }

        Defer.prototype.subscribeCore = function (o) {
            var result = tryCatch(this._f)();
            if (result === errorObj) { return observableThrow(result.e).subscribe(o); }
            isPromise(result) && (result = observableFromPromise(result));
            return result.subscribe(o);
        };

        return Defer;
    }(ObservableBase));

    /**
     *  Returns an observable sequence that invokes the specified factory function whenever a new observer subscribes.
     *
     * @example
     *  var res = Rx.Observable.defer(function () { return Rx.Observable.fromArray([1,2,3]); });
     * @param {Function} observableFactory Observable factory function to invoke for each observer that subscribes to the resulting sequence or Promise.
     * @returns {Observable} An observable sequence whose observers trigger an invocation of the given observable factory function.
     */
    var observableDefer = Observable.defer = function (observableFactory) {
        return new Defer(observableFactory);
    };

    var EmptyObservable = (function (__super__) {
        inherits(EmptyObservable, __super__);
        function EmptyObservable(scheduler) {
            this.scheduler = scheduler;
            __super__.call(this);
        }

        EmptyObservable.prototype.subscribeCore = function (observer) {
            var sink = new EmptySink(observer, this.scheduler);
            return sink.run();
        };

        function EmptySink(observer, scheduler) {
            this.observer = observer;
            this.scheduler = scheduler;
        }

        function scheduleItem(s, state) {
            state.onCompleted();
            return disposableEmpty;
        }

        EmptySink.prototype.run = function () {
            var state = this.observer;
            return this.scheduler === immediateScheduler ?
              scheduleItem(null, state) :
              this.scheduler.schedule(state, scheduleItem);
        };

        return EmptyObservable;
    }(ObservableBase));

    var EMPTY_OBSERVABLE = new EmptyObservable(immediateScheduler);

    /**
     *  Returns an empty observable sequence, using the specified scheduler to send out the single OnCompleted message.
     *
     * @example
     *  var res = Rx.Observable.empty();
     *  var res = Rx.Observable.empty(Rx.Scheduler.timeout);
     * @param {Scheduler} [scheduler] Scheduler to send the termination call on.
     * @returns {Observable} An observable sequence with no elements.
     */
    var observableEmpty = Observable.empty = function (scheduler) {
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return scheduler === immediateScheduler ? EMPTY_OBSERVABLE : new EmptyObservable(scheduler);
    };

    var FromObservable = (function (__super__) {
        inherits(FromObservable, __super__);
        function FromObservable(iterable, fn, scheduler) {
            this._iterable = iterable;
            this._fn = fn;
            this._scheduler = scheduler;
            __super__.call(this);
        }

        function createScheduleMethod(o, it, fn) {
            return function loopRecursive(i, recurse) {
                var next = tryCatch(it.next).call(it);
                if (next === errorObj) { return o.onError(next.e); }
                if (next.done) { return o.onCompleted(); }

                var result = next.value;

                if (isFunction(fn)) {
                    result = tryCatch(fn)(result, i);
                    if (result === errorObj) { return o.onError(result.e); }
                }

                o.onNext(result);
                recurse(i + 1);
            };
        }

        FromObservable.prototype.subscribeCore = function (o) {
            var list = Object(this._iterable),
                it = getIterable(list);

            return this._scheduler.scheduleRecursive(0, createScheduleMethod(o, it, this._fn));
        };

        return FromObservable;
    }(ObservableBase));

    var maxSafeInteger = Math.pow(2, 53) - 1;

    function StringIterable(s) {
        this._s = s;
    }

    StringIterable.prototype[$iterator$] = function () {
        return new StringIterator(this._s);
    };

    function StringIterator(s) {
        this._s = s;
        this._l = s.length;
        this._i = 0;
    }

    StringIterator.prototype[$iterator$] = function () {
        return this;
    };

    StringIterator.prototype.next = function () {
        return this._i < this._l ? { done: false, value: this._s.charAt(this._i++) } : doneEnumerator;
    };

    function ArrayIterable(a) {
        this._a = a;
    }

    ArrayIterable.prototype[$iterator$] = function () {
        return new ArrayIterator(this._a);
    };

    function ArrayIterator(a) {
        this._a = a;
        this._l = toLength(a);
        this._i = 0;
    }

    ArrayIterator.prototype[$iterator$] = function () {
        return this;
    };

    ArrayIterator.prototype.next = function () {
        return this._i < this._l ? { done: false, value: this._a[this._i++] } : doneEnumerator;
    };

    function numberIsFinite(value) {
        return typeof value === 'number' && root.isFinite(value);
    }

    function isNan(n) {
        return n !== n;
    }

    function getIterable(o) {
        var i = o[$iterator$], it;
        if (!i && typeof o === 'string') {
            it = new StringIterable(o);
            return it[$iterator$]();
        }
        if (!i && o.length !== undefined) {
            it = new ArrayIterable(o);
            return it[$iterator$]();
        }
        if (!i) { throw new TypeError('Object is not iterable'); }
        return o[$iterator$]();
    }

    function sign(value) {
        var number = +value;
        if (number === 0) { return number; }
        if (isNaN(number)) { return number; }
        return number < 0 ? -1 : 1;
    }

    function toLength(o) {
        var len = +o.length;
        if (isNaN(len)) { return 0; }
        if (len === 0 || !numberIsFinite(len)) { return len; }
        len = sign(len) * Math.floor(Math.abs(len));
        if (len <= 0) { return 0; }
        if (len > maxSafeInteger) { return maxSafeInteger; }
        return len;
    }

    /**
    * This method creates a new Observable sequence from an array-like or iterable object.
    * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
    * @param {Function} [mapFn] Map function to call on every element of the array.
    * @param {Any} [thisArg] The context to use calling the mapFn if provided.
    * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
    */
    var observableFrom = Observable.from = function (iterable, mapFn, thisArg, scheduler) {
        if (iterable == null) {
            throw new Error('iterable cannot be null.')
        }
        if (mapFn && !isFunction(mapFn)) {
            throw new Error('mapFn when provided must be a function');
        }
        if (mapFn) {
            var mapper = bindCallback(mapFn, thisArg, 2);
        }
        isScheduler(scheduler) || (scheduler = currentThreadScheduler);
        return new FromObservable(iterable, mapper, scheduler);
    }

    var FromArrayObservable = (function (__super__) {
        inherits(FromArrayObservable, __super__);
        function FromArrayObservable(args, scheduler) {
            this._args = args;
            this._scheduler = scheduler;
            __super__.call(this);
        }

        function scheduleMethod(o, args) {
            var len = args.length;
            return function loopRecursive(i, recurse) {
                if (i < len) {
                    o.onNext(args[i]);
                    recurse(i + 1);
                } else {
                    o.onCompleted();
                }
            };
        }

        FromArrayObservable.prototype.subscribeCore = function (o) {
            return this._scheduler.scheduleRecursive(0, scheduleMethod(o, this._args));
        };

        return FromArrayObservable;
    }(ObservableBase));

    /**
    *  Converts an array to an observable sequence, using an optional scheduler to enumerate the array.
    * @deprecated use Observable.from or Observable.of
    * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
    * @returns {Observable} The observable sequence whose elements are pulled from the given enumerable sequence.
    */
    var observableFromArray = Observable.fromArray = function (array, scheduler) {
        isScheduler(scheduler) || (scheduler = currentThreadScheduler);
        return new FromArrayObservable(array, scheduler)
    };

    var NeverObservable = (function (__super__) {
        inherits(NeverObservable, __super__);
        function NeverObservable() {
            __super__.call(this);
        }

        NeverObservable.prototype.subscribeCore = function (observer) {
            return disposableEmpty;
        };

        return NeverObservable;
    }(ObservableBase));

    var NEVER_OBSERVABLE = new NeverObservable();

    /**
     * Returns a non-terminating observable sequence, which can be used to denote an infinite duration (e.g. when using reactive joins).
     * @returns {Observable} An observable sequence whose observers will never get called.
     */
    var observableNever = Observable.never = function () {
        return NEVER_OBSERVABLE;
    };

    function observableOf(scheduler, array) {
        isScheduler(scheduler) || (scheduler = currentThreadScheduler);
        return new FromArrayObservable(array, scheduler);
    }

    /**
    *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
    * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
    */
    Observable.of = function () {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        return new FromArrayObservable(args, currentThreadScheduler);
    };

    /**
    *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
    * @param {Scheduler} scheduler A scheduler to use for scheduling the arguments.
    * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
    */
    Observable.ofWithScheduler = function (scheduler) {
        var len = arguments.length, args = new Array(len - 1);
        for (var i = 1; i < len; i++) { args[i - 1] = arguments[i]; }
        return new FromArrayObservable(args, scheduler);
    };

    var PairsObservable = (function (__super__) {
        inherits(PairsObservable, __super__);
        function PairsObservable(o, scheduler) {
            this._o = o;
            this._keys = Object.keys(o);
            this._scheduler = scheduler;
            __super__.call(this);
        }

        function scheduleMethod(o, obj, keys) {
            return function loopRecursive(i, recurse) {
                if (i < keys.length) {
                    var key = keys[i];
                    o.onNext([key, obj[key]]);
                    recurse(i + 1);
                } else {
                    o.onCompleted();
                }
            };
        }

        PairsObservable.prototype.subscribeCore = function (o) {
            return this._scheduler.scheduleRecursive(0, scheduleMethod(o, this._o, this._keys));
        };

        return PairsObservable;
    }(ObservableBase));

    /**
     * Convert an object into an observable sequence of [key, value] pairs.
     * @param {Object} obj The object to inspect.
     * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
     * @returns {Observable} An observable sequence of [key, value] pairs from the object.
     */
    Observable.pairs = function (obj, scheduler) {
        scheduler || (scheduler = currentThreadScheduler);
        return new PairsObservable(obj, scheduler);
    };

    var RangeObservable = (function (__super__) {
        inherits(RangeObservable, __super__);
        function RangeObservable(start, count, scheduler) {
            this.start = start;
            this.rangeCount = count;
            this.scheduler = scheduler;
            __super__.call(this);
        }

        function loopRecursive(start, count, o) {
            return function loop(i, recurse) {
                if (i < count) {
                    o.onNext(start + i);
                    recurse(i + 1);
                } else {
                    o.onCompleted();
                }
            };
        }

        RangeObservable.prototype.subscribeCore = function (o) {
            return this.scheduler.scheduleRecursive(
              0,
              loopRecursive(this.start, this.rangeCount, o)
            );
        };

        return RangeObservable;
    }(ObservableBase));

    /**
    *  Generates an observable sequence of integral numbers within a specified range, using the specified scheduler to send out observer messages.
    * @param {Number} start The value of the first integer in the sequence.
    * @param {Number} count The number of sequential integers to generate.
    * @param {Scheduler} [scheduler] Scheduler to run the generator loop on. If not specified, defaults to Scheduler.currentThread.
    * @returns {Observable} An observable sequence that contains a range of sequential integral numbers.
    */
    Observable.range = function (start, count, scheduler) {
        isScheduler(scheduler) || (scheduler = currentThreadScheduler);
        return new RangeObservable(start, count, scheduler);
    };

    var RepeatObservable = (function (__super__) {
        inherits(RepeatObservable, __super__);
        function RepeatObservable(value, repeatCount, scheduler) {
            this.value = value;
            this.repeatCount = repeatCount == null ? -1 : repeatCount;
            this.scheduler = scheduler;
            __super__.call(this);
        }

        RepeatObservable.prototype.subscribeCore = function (observer) {
            var sink = new RepeatSink(observer, this);
            return sink.run();
        };

        return RepeatObservable;
    }(ObservableBase));

    function RepeatSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
    }

    RepeatSink.prototype.run = function () {
        var observer = this.observer, value = this.parent.value;
        function loopRecursive(i, recurse) {
            if (i === -1 || i > 0) {
                observer.onNext(value);
                i > 0 && i--;
            }
            if (i === 0) { return observer.onCompleted(); }
            recurse(i);
        }

        return this.parent.scheduler.scheduleRecursive(this.parent.repeatCount, loopRecursive);
    };

    /**
     *  Generates an observable sequence that repeats the given element the specified number of times, using the specified scheduler to send out observer messages.
     * @param {Mixed} value Element to repeat.
     * @param {Number} repeatCount [Optiona] Number of times to repeat the element. If not specified, repeats indefinitely.
     * @param {Scheduler} scheduler Scheduler to run the producer loop on. If not specified, defaults to Scheduler.immediate.
     * @returns {Observable} An observable sequence that repeats the given element the specified number of times.
     */
    Observable.repeat = function (value, repeatCount, scheduler) {
        isScheduler(scheduler) || (scheduler = currentThreadScheduler);
        return new RepeatObservable(value, repeatCount, scheduler);
    };

    var JustObservable = (function (__super__) {
        inherits(JustObservable, __super__);
        function JustObservable(value, scheduler) {
            this._value = value;
            this._scheduler = scheduler;
            __super__.call(this);
        }

        JustObservable.prototype.subscribeCore = function (o) {
            var state = [this._value, o];
            return this._scheduler === immediateScheduler ?
              scheduleItem(null, state) :
              this._scheduler.schedule(state, scheduleItem);
        };

        function scheduleItem(s, state) {
            var value = state[0], observer = state[1];
            observer.onNext(value);
            observer.onCompleted();
            return disposableEmpty;
        }

        return JustObservable;
    }(ObservableBase));

    /**
     *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
     *  There is an alias called 'just' or browsers <IE9.
     * @param {Mixed} value Single element in the resulting observable sequence.
     * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
     * @returns {Observable} An observable sequence containing the single specified element.
     */
    var observableReturn = Observable['return'] = Observable.just = function (value, scheduler) {
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new JustObservable(value, scheduler);
    };

    var ThrowObservable = (function (__super__) {
        inherits(ThrowObservable, __super__);
        function ThrowObservable(error, scheduler) {
            this._error = error;
            this._scheduler = scheduler;
            __super__.call(this);
        }

        ThrowObservable.prototype.subscribeCore = function (o) {
            var state = [this._error, o];
            return this._scheduler === immediateScheduler ?
              scheduleItem(null, state) :
              this._scheduler.schedule(state, scheduleItem);
        };

        function scheduleItem(s, state) {
            var e = state[0], o = state[1];
            o.onError(e);
            return disposableEmpty;
        }

        return ThrowObservable;
    }(ObservableBase));

    /**
     *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
     *  There is an alias to this method called 'throwError' for browsers <IE9.
     * @param {Mixed} error An object used for the sequence's termination.
     * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
     * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
     */
    var observableThrow = Observable['throw'] = function (error, scheduler) {
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new ThrowObservable(error, scheduler);
    };

    var CatchObservable = (function (__super__) {
        inherits(CatchObservable, __super__);
        function CatchObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this);
        }

        CatchObservable.prototype.subscribeCore = function (o) {
            var d1 = new SingleAssignmentDisposable(), subscription = new SerialDisposable();
            subscription.setDisposable(d1);
            d1.setDisposable(this.source.subscribe(new CatchObserver(o, subscription, this._fn)));
            return subscription;
        };

        return CatchObservable;
    }(ObservableBase));

    var CatchObserver = (function (__super__) {
        inherits(CatchObserver, __super__);
        function CatchObserver(o, s, fn) {
            this._o = o;
            this._s = s;
            this._fn = fn;
            __super__.call(this);
        }

        CatchObserver.prototype.next = function (x) { this._o.onNext(x); };
        CatchObserver.prototype.completed = function () { return this._o.onCompleted(); };
        CatchObserver.prototype.error = function (e) {
            var result = tryCatch(this._fn)(e);
            if (result === errorObj) { return this._o.onError(result.e); }
            isPromise(result) && (result = observableFromPromise(result));

            var d = new SingleAssignmentDisposable();
            this._s.setDisposable(d);
            d.setDisposable(result.subscribe(this._o));
        };

        return CatchObserver;
    }(AbstractObserver));

    /**
     * Continues an observable sequence that is terminated by an exception with the next observable sequence.
     * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
     * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
     */
    observableProto['catch'] = function (handlerOrSecond) {
        return isFunction(handlerOrSecond) ? new CatchObservable(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
    };

    /**
     * Continues an observable sequence that is terminated by an exception with the next observable sequence.
     * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
     * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
     */
    var observableCatch = Observable['catch'] = function () {
        var items;
        if (Array.isArray(arguments[0])) {
            items = arguments[0];
        } else {
            var len = arguments.length;
            items = new Array(len);
            for (var i = 0; i < len; i++) { items[i] = arguments[i]; }
        }
        return enumerableOf(items).catchError();
    };

    /**
     * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
     * This can be in the form of an argument list of observables or an array.
     *
     * @example
     * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
     * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
     * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
     */
    observableProto.combineLatest = function () {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        if (Array.isArray(args[0])) {
            args[0].unshift(this);
        } else {
            args.unshift(this);
        }
        return combineLatest.apply(this, args);
    };

    function falseFactory() { return false; }
    function argumentsToArray() {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        return args;
    }

    var CombineLatestObservable = (function (__super__) {
        inherits(CombineLatestObservable, __super__);
        function CombineLatestObservable(params, cb) {
            this._params = params;
            this._cb = cb;
            __super__.call(this);
        }

        CombineLatestObservable.prototype.subscribeCore = function (observer) {
            var len = this._params.length,
                subscriptions = new Array(len);

            var state = {
                hasValue: arrayInitialize(len, falseFactory),
                hasValueAll: false,
                isDone: arrayInitialize(len, falseFactory),
                values: new Array(len)
            };

            for (var i = 0; i < len; i++) {
                var source = this._params[i], sad = new SingleAssignmentDisposable();
                subscriptions[i] = sad;
                isPromise(source) && (source = observableFromPromise(source));
                sad.setDisposable(source.subscribe(new CombineLatestObserver(observer, i, this._cb, state)));
            }

            return new NAryDisposable(subscriptions);
        };

        return CombineLatestObservable;
    }(ObservableBase));

    var CombineLatestObserver = (function (__super__) {
        inherits(CombineLatestObserver, __super__);
        function CombineLatestObserver(o, i, cb, state) {
            this._o = o;
            this._i = i;
            this._cb = cb;
            this._state = state;
            __super__.call(this);
        }

        function notTheSame(i) {
            return function (x, j) {
                return j !== i;
            };
        }

        CombineLatestObserver.prototype.next = function (x) {
            this._state.values[this._i] = x;
            this._state.hasValue[this._i] = true;
            if (this._state.hasValueAll || (this._state.hasValueAll = this._state.hasValue.every(identity))) {
                var res = tryCatch(this._cb).apply(null, this._state.values);
                if (res === errorObj) { return this._o.onError(res.e); }
                this._o.onNext(res);
            } else if (this._state.isDone.filter(notTheSame(this._i)).every(identity)) {
                this._o.onCompleted();
            }
        };

        CombineLatestObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        CombineLatestObserver.prototype.completed = function () {
            this._state.isDone[this._i] = true;
            this._state.isDone.every(identity) && this._o.onCompleted();
        };

        return CombineLatestObserver;
    }(AbstractObserver));

    /**
    * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
    *
    * @example
    * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
    * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
    * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
    */
    var combineLatest = Observable.combineLatest = function () {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
        Array.isArray(args[0]) && (args = args[0]);
        return new CombineLatestObservable(args, resultSelector);
    };

    /**
     * Concatenates all the observable sequences.  This takes in either an array or variable arguments to concatenate.
     * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
     */
    observableProto.concat = function () {
        for (var args = [], i = 0, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
        args.unshift(this);
        return observableConcat.apply(null, args);
    };

    var ConcatObserver = (function (__super__) {
        inherits(ConcatObserver, __super__);
        function ConcatObserver(s, fn) {
            this._s = s;
            this._fn = fn;
            __super__.call(this);
        }

        ConcatObserver.prototype.next = function (x) { this._s.o.onNext(x); };
        ConcatObserver.prototype.error = function (e) { this._s.o.onError(e); };
        ConcatObserver.prototype.completed = function () { this._s.i++; this._fn(this._s); };

        return ConcatObserver;
    }(AbstractObserver));

    var ConcatObservable = (function (__super__) {
        inherits(ConcatObservable, __super__);
        function ConcatObservable(sources) {
            this._sources = sources;
            __super__.call(this);
        }

        function scheduleRecursive(state, recurse) {
            if (state.disposable.isDisposed) { return; }
            if (state.i === state.sources.length) { return state.o.onCompleted(); }

            // Check if promise
            var currentValue = state.sources[state.i];
            isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

            var d = new SingleAssignmentDisposable();
            state.subscription.setDisposable(d);
            d.setDisposable(currentValue.subscribe(new ConcatObserver(state, recurse)));
        }

        ConcatObservable.prototype.subscribeCore = function (o) {
            var subscription = new SerialDisposable();
            var disposable = disposableCreate(noop);
            var state = {
                o: o,
                i: 0,
                subscription: subscription,
                disposable: disposable,
                sources: this._sources
            };

            var cancelable = immediateScheduler.scheduleRecursive(state, scheduleRecursive);
            return new NAryDisposable([subscription, disposable, cancelable]);
        };

        return ConcatObservable;
    }(ObservableBase));

    /**
     * Concatenates all the observable sequences.
     * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
     * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
     */
    var observableConcat = Observable.concat = function () {
        var args;
        if (Array.isArray(arguments[0])) {
            args = arguments[0];
        } else {
            args = new Array(arguments.length);
            for (var i = 0, len = arguments.length; i < len; i++) { args[i] = arguments[i]; }
        }
        return new ConcatObservable(args);
    };

    /**
     * Concatenates an observable sequence of observable sequences.
     * @returns {Observable} An observable sequence that contains the elements of each observed inner sequence, in sequential order.
     */
    observableProto.concatAll = function () {
        return this.merge(1);
    };

    var MergeObservable = (function (__super__) {
        inherits(MergeObservable, __super__);

        function MergeObservable(source, maxConcurrent) {
            this.source = source;
            this.maxConcurrent = maxConcurrent;
            __super__.call(this);
        }

        MergeObservable.prototype.subscribeCore = function (observer) {
            var g = new CompositeDisposable();
            g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
            return g;
        };

        return MergeObservable;

    }(ObservableBase));

    var MergeObserver = (function (__super__) {
        function MergeObserver(o, max, g) {
            this.o = o;
            this.max = max;
            this.g = g;
            this.done = false;
            this.q = [];
            this.activeCount = 0;
            __super__.call(this);
        }

        inherits(MergeObserver, __super__);

        MergeObserver.prototype.handleSubscribe = function (xs) {
            var sad = new SingleAssignmentDisposable();
            this.g.add(sad);
            isPromise(xs) && (xs = observableFromPromise(xs));
            sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
        };

        MergeObserver.prototype.next = function (innerSource) {
            if (this.activeCount < this.max) {
                this.activeCount++;
                this.handleSubscribe(innerSource);
            } else {
                this.q.push(innerSource);
            }
        };
        MergeObserver.prototype.error = function (e) { this.o.onError(e); };
        MergeObserver.prototype.completed = function () { this.done = true; this.activeCount === 0 && this.o.onCompleted(); };

        function InnerObserver(parent, sad) {
            this.parent = parent;
            this.sad = sad;
            __super__.call(this);
        }

        inherits(InnerObserver, __super__);

        InnerObserver.prototype.next = function (x) { this.parent.o.onNext(x); };
        InnerObserver.prototype.error = function (e) { this.parent.o.onError(e); };
        InnerObserver.prototype.completed = function () {
            this.parent.g.remove(this.sad);
            if (this.parent.q.length > 0) {
                this.parent.handleSubscribe(this.parent.q.shift());
            } else {
                this.parent.activeCount--;
                this.parent.done && this.parent.activeCount === 0 && this.parent.o.onCompleted();
            }
        };

        return MergeObserver;
    }(AbstractObserver));

    /**
    * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
    * Or merges two observable sequences into a single observable sequence.
    * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
    * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
    */
    observableProto.merge = function (maxConcurrentOrOther) {
        return typeof maxConcurrentOrOther !== 'number' ?
          observableMerge(this, maxConcurrentOrOther) :
          new MergeObservable(this, maxConcurrentOrOther);
    };

    /**
     * Merges all the observable sequences into a single observable sequence.
     * The scheduler is optional and if not specified, the immediate scheduler is used.
     * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
     */
    var observableMerge = Observable.merge = function () {
        var scheduler, sources = [], i, len = arguments.length;
        if (!arguments[0]) {
            scheduler = immediateScheduler;
            for (i = 1; i < len; i++) { sources.push(arguments[i]); }
        } else if (isScheduler(arguments[0])) {
            scheduler = arguments[0];
            for (i = 1; i < len; i++) { sources.push(arguments[i]); }
        } else {
            scheduler = immediateScheduler;
            for (i = 0; i < len; i++) { sources.push(arguments[i]); }
        }
        if (Array.isArray(sources[0])) {
            sources = sources[0];
        }
        return observableOf(scheduler, sources).mergeAll();
    };

    var CompositeError = Rx.CompositeError = function (errors) {
        this.innerErrors = errors;
        this.message = 'This contains multiple errors. Check the innerErrors';
        Error.call(this);
    };
    CompositeError.prototype = Object.create(Error.prototype);
    CompositeError.prototype.name = 'CompositeError';

    var MergeDelayErrorObservable = (function (__super__) {
        inherits(MergeDelayErrorObservable, __super__);
        function MergeDelayErrorObservable(source) {
            this.source = source;
            __super__.call(this);
        }

        MergeDelayErrorObservable.prototype.subscribeCore = function (o) {
            var group = new CompositeDisposable(),
              m = new SingleAssignmentDisposable(),
              state = { isStopped: false, errors: [], o: o };

            group.add(m);
            m.setDisposable(this.source.subscribe(new MergeDelayErrorObserver(group, state)));

            return group;
        };

        return MergeDelayErrorObservable;
    }(ObservableBase));

    var MergeDelayErrorObserver = (function (__super__) {
        inherits(MergeDelayErrorObserver, __super__);
        function MergeDelayErrorObserver(group, state) {
            this._group = group;
            this._state = state;
            __super__.call(this);
        }

        function setCompletion(o, errors) {
            if (errors.length === 0) {
                o.onCompleted();
            } else if (errors.length === 1) {
                o.onError(errors[0]);
            } else {
                o.onError(new CompositeError(errors));
            }
        }

        MergeDelayErrorObserver.prototype.next = function (x) {
            var inner = new SingleAssignmentDisposable();
            this._group.add(inner);

            // Check for promises support
            isPromise(x) && (x = observableFromPromise(x));
            inner.setDisposable(x.subscribe(new InnerObserver(inner, this._group, this._state)));
        };

        MergeDelayErrorObserver.prototype.error = function (e) {
            this._state.errors.push(e);
            this._state.isStopped = true;
            this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
        };

        MergeDelayErrorObserver.prototype.completed = function () {
            this._state.isStopped = true;
            this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
        };

        inherits(InnerObserver, __super__);
        function InnerObserver(inner, group, state) {
            this._inner = inner;
            this._group = group;
            this._state = state;
            __super__.call(this);
        }

        InnerObserver.prototype.next = function (x) { this._state.o.onNext(x); };
        InnerObserver.prototype.error = function (e) {
            this._state.errors.push(e);
            this._group.remove(this._inner);
            this._state.isStopped && this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
        };
        InnerObserver.prototype.completed = function () {
            this._group.remove(this._inner);
            this._state.isStopped && this._group.length === 1 && setCompletion(this._state.o, this._state.errors);
        };

        return MergeDelayErrorObserver;
    }(AbstractObserver));

    /**
    * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
    * receive all successfully emitted items from all of the source Observables without being interrupted by
    * an error notification from one of them.
    *
    * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
    * error via the Observer's onError, mergeDelayError will refrain from propagating that
    * error notification until all of the merged Observables have finished emitting items.
    * @param {Array | Arguments} args Arguments or an array to merge.
    * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
    */
    Observable.mergeDelayError = function () {
        var args;
        if (Array.isArray(arguments[0])) {
            args = arguments[0];
        } else {
            var len = arguments.length;
            args = new Array(len);
            for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        }
        var source = observableOf(null, args);
        return new MergeDelayErrorObservable(source);
    };

    var MergeAllObservable = (function (__super__) {
        inherits(MergeAllObservable, __super__);

        function MergeAllObservable(source) {
            this.source = source;
            __super__.call(this);
        }

        MergeAllObservable.prototype.subscribeCore = function (o) {
            var g = new CompositeDisposable(), m = new SingleAssignmentDisposable();
            g.add(m);
            m.setDisposable(this.source.subscribe(new MergeAllObserver(o, g)));
            return g;
        };

        return MergeAllObservable;
    }(ObservableBase));

    var MergeAllObserver = (function (__super__) {
        function MergeAllObserver(o, g) {
            this.o = o;
            this.g = g;
            this.done = false;
            __super__.call(this);
        }

        inherits(MergeAllObserver, __super__);

        MergeAllObserver.prototype.next = function (innerSource) {
            var sad = new SingleAssignmentDisposable();
            this.g.add(sad);
            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
            sad.setDisposable(innerSource.subscribe(new InnerObserver(this, sad)));
        };

        MergeAllObserver.prototype.error = function (e) {
            this.o.onError(e);
        };

        MergeAllObserver.prototype.completed = function () {
            this.done = true;
            this.g.length === 1 && this.o.onCompleted();
        };

        function InnerObserver(parent, sad) {
            this.parent = parent;
            this.sad = sad;
            __super__.call(this);
        }

        inherits(InnerObserver, __super__);

        InnerObserver.prototype.next = function (x) {
            this.parent.o.onNext(x);
        };
        InnerObserver.prototype.error = function (e) {
            this.parent.o.onError(e);
        };
        InnerObserver.prototype.completed = function () {
            this.parent.g.remove(this.sad);
            this.parent.done && this.parent.g.length === 1 && this.parent.o.onCompleted();
        };

        return MergeAllObserver;
    }(AbstractObserver));

    /**
    * Merges an observable sequence of observable sequences into an observable sequence.
    * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
    */
    observableProto.mergeAll = function () {
        return new MergeAllObservable(this);
    };

    var SkipUntilObservable = (function (__super__) {
        inherits(SkipUntilObservable, __super__);

        function SkipUntilObservable(source, other) {
            this._s = source;
            this._o = isPromise(other) ? observableFromPromise(other) : other;
            this._open = false;
            __super__.call(this);
        }

        SkipUntilObservable.prototype.subscribeCore = function (o) {
            var leftSubscription = new SingleAssignmentDisposable();
            leftSubscription.setDisposable(this._s.subscribe(new SkipUntilSourceObserver(o, this)));

            isPromise(this._o) && (this._o = observableFromPromise(this._o));

            var rightSubscription = new SingleAssignmentDisposable();
            rightSubscription.setDisposable(this._o.subscribe(new SkipUntilOtherObserver(o, this, rightSubscription)));

            return new BinaryDisposable(leftSubscription, rightSubscription);
        };

        return SkipUntilObservable;
    }(ObservableBase));

    var SkipUntilSourceObserver = (function (__super__) {
        inherits(SkipUntilSourceObserver, __super__);
        function SkipUntilSourceObserver(o, p) {
            this._o = o;
            this._p = p;
            __super__.call(this);
        }

        SkipUntilSourceObserver.prototype.next = function (x) {
            this._p._open && this._o.onNext(x);
        };

        SkipUntilSourceObserver.prototype.error = function (err) {
            this._o.onError(err);
        };

        SkipUntilSourceObserver.prototype.onCompleted = function () {
            this._p._open && this._o.onCompleted();
        };

        return SkipUntilSourceObserver;
    }(AbstractObserver));

    var SkipUntilOtherObserver = (function (__super__) {
        inherits(SkipUntilOtherObserver, __super__);
        function SkipUntilOtherObserver(o, p, r) {
            this._o = o;
            this._p = p;
            this._r = r;
            __super__.call(this);
        }

        SkipUntilOtherObserver.prototype.next = function () {
            this._p._open = true;
            this._r.dispose();
        };

        SkipUntilOtherObserver.prototype.error = function (err) {
            this._o.onError(err);
        };

        SkipUntilOtherObserver.prototype.onCompleted = function () {
            this._r.dispose();
        };

        return SkipUntilOtherObserver;
    }(AbstractObserver));

    /**
     * Returns the values from the source observable sequence only after the other observable sequence produces a value.
     * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
     * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.
     */
    observableProto.skipUntil = function (other) {
        return new SkipUntilObservable(this, other);
    };

    var SwitchObservable = (function (__super__) {
        inherits(SwitchObservable, __super__);
        function SwitchObservable(source) {
            this.source = source;
            __super__.call(this);
        }

        SwitchObservable.prototype.subscribeCore = function (o) {
            var inner = new SerialDisposable(), s = this.source.subscribe(new SwitchObserver(o, inner));
            return new BinaryDisposable(s, inner);
        };

        inherits(SwitchObserver, AbstractObserver);
        function SwitchObserver(o, inner) {
            this.o = o;
            this.inner = inner;
            this.stopped = false;
            this.latest = 0;
            this.hasLatest = false;
            AbstractObserver.call(this);
        }

        SwitchObserver.prototype.next = function (innerSource) {
            var d = new SingleAssignmentDisposable(), id = ++this.latest;
            this.hasLatest = true;
            this.inner.setDisposable(d);
            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
            d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)));
        };

        SwitchObserver.prototype.error = function (e) {
            this.o.onError(e);
        };

        SwitchObserver.prototype.completed = function () {
            this.stopped = true;
            !this.hasLatest && this.o.onCompleted();
        };

        inherits(InnerObserver, AbstractObserver);
        function InnerObserver(parent, id) {
            this.parent = parent;
            this.id = id;
            AbstractObserver.call(this);
        }
        InnerObserver.prototype.next = function (x) {
            this.parent.latest === this.id && this.parent.o.onNext(x);
        };

        InnerObserver.prototype.error = function (e) {
            this.parent.latest === this.id && this.parent.o.onError(e);
        };

        InnerObserver.prototype.completed = function () {
            if (this.parent.latest === this.id) {
                this.parent.hasLatest = false;
                this.parent.stopped && this.parent.o.onCompleted();
            }
        };

        return SwitchObservable;
    }(ObservableBase));

    /**
    * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
    * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
    */
    observableProto['switch'] = observableProto.switchLatest = function () {
        return new SwitchObservable(this);
    };

    var TakeUntilObservable = (function (__super__) {
        inherits(TakeUntilObservable, __super__);

        function TakeUntilObservable(source, other) {
            this.source = source;
            this.other = isPromise(other) ? observableFromPromise(other) : other;
            __super__.call(this);
        }

        TakeUntilObservable.prototype.subscribeCore = function (o) {
            return new BinaryDisposable(
              this.source.subscribe(o),
              this.other.subscribe(new TakeUntilObserver(o))
            );
        };

        return TakeUntilObservable;
    }(ObservableBase));

    var TakeUntilObserver = (function (__super__) {
        inherits(TakeUntilObserver, __super__);
        function TakeUntilObserver(o) {
            this._o = o;
            __super__.call(this);
        }

        TakeUntilObserver.prototype.next = function () {
            this._o.onCompleted();
        };

        TakeUntilObserver.prototype.error = function (err) {
            this._o.onError(err);
        };

        TakeUntilObserver.prototype.onCompleted = noop;

        return TakeUntilObserver;
    }(AbstractObserver));

    /**
     * Returns the values from the source observable sequence until the other observable sequence produces a value.
     * @param {Observable | Promise} other Observable sequence or Promise that terminates propagation of elements of the source sequence.
     * @returns {Observable} An observable sequence containing the elements of the source sequence up to the point the other sequence interrupted further propagation.
     */
    observableProto.takeUntil = function (other) {
        return new TakeUntilObservable(this, other);
    };

    function falseFactory() { return false; }
    function argumentsToArray() {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        return args;
    }

    var WithLatestFromObservable = (function (__super__) {
        inherits(WithLatestFromObservable, __super__);
        function WithLatestFromObservable(source, sources, resultSelector) {
            this._s = source;
            this._ss = sources;
            this._cb = resultSelector;
            __super__.call(this);
        }

        WithLatestFromObservable.prototype.subscribeCore = function (o) {
            var len = this._ss.length;
            var state = {
                hasValue: arrayInitialize(len, falseFactory),
                hasValueAll: false,
                values: new Array(len)
            };

            var n = this._ss.length, subscriptions = new Array(n + 1);
            for (var i = 0; i < n; i++) {
                var other = this._ss[i], sad = new SingleAssignmentDisposable();
                isPromise(other) && (other = observableFromPromise(other));
                sad.setDisposable(other.subscribe(new WithLatestFromOtherObserver(o, i, state)));
                subscriptions[i] = sad;
            }

            var outerSad = new SingleAssignmentDisposable();
            outerSad.setDisposable(this._s.subscribe(new WithLatestFromSourceObserver(o, this._cb, state)));
            subscriptions[n] = outerSad;

            return new NAryDisposable(subscriptions);
        };

        return WithLatestFromObservable;
    }(ObservableBase));

    var WithLatestFromOtherObserver = (function (__super__) {
        inherits(WithLatestFromOtherObserver, __super__);
        function WithLatestFromOtherObserver(o, i, state) {
            this._o = o;
            this._i = i;
            this._state = state;
            __super__.call(this);
        }

        WithLatestFromOtherObserver.prototype.next = function (x) {
            this._state.values[this._i] = x;
            this._state.hasValue[this._i] = true;
            this._state.hasValueAll = this._state.hasValue.every(identity);
        };

        WithLatestFromOtherObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        WithLatestFromOtherObserver.prototype.completed = noop;

        return WithLatestFromOtherObserver;
    }(AbstractObserver));

    var WithLatestFromSourceObserver = (function (__super__) {
        inherits(WithLatestFromSourceObserver, __super__);
        function WithLatestFromSourceObserver(o, cb, state) {
            this._o = o;
            this._cb = cb;
            this._state = state;
            __super__.call(this);
        }

        WithLatestFromSourceObserver.prototype.next = function (x) {
            var allValues = [x].concat(this._state.values);
            if (!this._state.hasValueAll) { return; }
            var res = tryCatch(this._cb).apply(null, allValues);
            if (res === errorObj) { return this._o.onError(res.e); }
            this._o.onNext(res);
        };

        WithLatestFromSourceObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        WithLatestFromSourceObserver.prototype.completed = function () {
            this._o.onCompleted();
        };

        return WithLatestFromSourceObserver;
    }(AbstractObserver));

    /**
     * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
     * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
     */
    observableProto.withLatestFrom = function () {
        if (arguments.length === 0) { throw new Error('invalid arguments'); }

        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
        Array.isArray(args[0]) && (args = args[0]);

        return new WithLatestFromObservable(this, args, resultSelector);
    };

    function falseFactory() { return false; }
    function emptyArrayFactory() { return []; }

    var ZipObservable = (function (__super__) {
        inherits(ZipObservable, __super__);
        function ZipObservable(sources, resultSelector) {
            this._s = sources;
            this._cb = resultSelector;
            __super__.call(this);
        }

        ZipObservable.prototype.subscribeCore = function (observer) {
            var n = this._s.length,
                subscriptions = new Array(n),
                done = arrayInitialize(n, falseFactory),
                q = arrayInitialize(n, emptyArrayFactory);

            for (var i = 0; i < n; i++) {
                var source = this._s[i], sad = new SingleAssignmentDisposable();
                subscriptions[i] = sad;
                isPromise(source) && (source = observableFromPromise(source));
                sad.setDisposable(source.subscribe(new ZipObserver(observer, i, this, q, done)));
            }

            return new NAryDisposable(subscriptions);
        };

        return ZipObservable;
    }(ObservableBase));

    var ZipObserver = (function (__super__) {
        inherits(ZipObserver, __super__);
        function ZipObserver(o, i, p, q, d) {
            this._o = o;
            this._i = i;
            this._p = p;
            this._q = q;
            this._d = d;
            __super__.call(this);
        }

        function notEmpty(x) { return x.length > 0; }
        function shiftEach(x) { return x.shift(); }
        function notTheSame(i) {
            return function (x, j) {
                return j !== i;
            };
        }

        ZipObserver.prototype.next = function (x) {
            this._q[this._i].push(x);
            if (this._q.every(notEmpty)) {
                var queuedValues = this._q.map(shiftEach);
                var res = tryCatch(this._p._cb).apply(null, queuedValues);
                if (res === errorObj) { return this._o.onError(res.e); }
                this._o.onNext(res);
            } else if (this._d.filter(notTheSame(this._i)).every(identity)) {
                this._o.onCompleted();
            }
        };

        ZipObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        ZipObserver.prototype.completed = function () {
            this._d[this._i] = true;
            this._d.every(identity) && this._o.onCompleted();
        };

        return ZipObserver;
    }(AbstractObserver));

    /**
     * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
     * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
     * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
     */
    observableProto.zip = function () {
        if (arguments.length === 0) { throw new Error('invalid arguments'); }

        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
        Array.isArray(args[0]) && (args = args[0]);

        var parent = this;
        args.unshift(parent);

        return new ZipObservable(args, resultSelector);
    };

    /**
     * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
     * @param arguments Observable sources.
     * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
     * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
     */
    Observable.zip = function () {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        if (Array.isArray(args[0])) {
            args = isFunction(args[1]) ? args[0].concat(args[1]) : args[0];
        }
        var first = args.shift();
        return first.zip.apply(first, args);
    };

    function falseFactory() { return false; }
    function emptyArrayFactory() { return []; }
    function argumentsToArray() {
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        return args;
    }

    var ZipIterableObservable = (function (__super__) {
        inherits(ZipIterableObservable, __super__);
        function ZipIterableObservable(sources, cb) {
            this.sources = sources;
            this._cb = cb;
            __super__.call(this);
        }

        ZipIterableObservable.prototype.subscribeCore = function (o) {
            var sources = this.sources, len = sources.length, subscriptions = new Array(len);

            var state = {
                q: arrayInitialize(len, emptyArrayFactory),
                done: arrayInitialize(len, falseFactory),
                cb: this._cb,
                o: o
            };

            for (var i = 0; i < len; i++) {
                (function (i) {
                    var source = sources[i], sad = new SingleAssignmentDisposable();
                    (isArrayLike(source) || isIterable(source)) && (source = observableFrom(source));

                    subscriptions[i] = sad;
                    sad.setDisposable(source.subscribe(new ZipIterableObserver(state, i)));
                }(i));
            }

            return new NAryDisposable(subscriptions);
        };

        return ZipIterableObservable;
    }(ObservableBase));

    var ZipIterableObserver = (function (__super__) {
        inherits(ZipIterableObserver, __super__);
        function ZipIterableObserver(s, i) {
            this._s = s;
            this._i = i;
            __super__.call(this);
        }

        function notEmpty(x) { return x.length > 0; }
        function shiftEach(x) { return x.shift(); }
        function notTheSame(i) {
            return function (x, j) {
                return j !== i;
            };
        }

        ZipIterableObserver.prototype.next = function (x) {
            this._s.q[this._i].push(x);
            if (this._s.q.every(notEmpty)) {
                var queuedValues = this._s.q.map(shiftEach),
                    res = tryCatch(this._s.cb).apply(null, queuedValues);
                if (res === errorObj) { return this._s.o.onError(res.e); }
                this._s.o.onNext(res);
            } else if (this._s.done.filter(notTheSame(this._i)).every(identity)) {
                this._s.o.onCompleted();
            }
        };

        ZipIterableObserver.prototype.error = function (e) { this._s.o.onError(e); };

        ZipIterableObserver.prototype.completed = function () {
            this._s.done[this._i] = true;
            this._s.done.every(identity) && this._s.o.onCompleted();
        };

        return ZipIterableObserver;
    }(AbstractObserver));

    /**
     * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
     * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
     * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
     */
    observableProto.zipIterable = function () {
        if (arguments.length === 0) { throw new Error('invalid arguments'); }

        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;

        var parent = this;
        args.unshift(parent);
        return new ZipIterableObservable(args, resultSelector);
    };

    function asObservable(source) {
        return function subscribe(o) { return source.subscribe(o); };
    }

    /**
     *  Hides the identity of an observable sequence.
     * @returns {Observable} An observable sequence that hides the identity of the source sequence.
     */
    observableProto.asObservable = function () {
        return new AnonymousObservable(asObservable(this), this);
    };

    var DematerializeObservable = (function (__super__) {
        inherits(DematerializeObservable, __super__);
        function DematerializeObservable(source) {
            this.source = source;
            __super__.call(this);
        }

        DematerializeObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new DematerializeObserver(o));
        };

        return DematerializeObservable;
    }(ObservableBase));

    var DematerializeObserver = (function (__super__) {
        inherits(DematerializeObserver, __super__);

        function DematerializeObserver(o) {
            this._o = o;
            __super__.call(this);
        }

        DematerializeObserver.prototype.next = function (x) { x.accept(this._o); };
        DematerializeObserver.prototype.error = function (e) { this._o.onError(e); };
        DematerializeObserver.prototype.completed = function () { this._o.onCompleted(); };

        return DematerializeObserver;
    }(AbstractObserver));

    /**
     * Dematerializes the explicit notification values of an observable sequence as implicit notifications.
     * @returns {Observable} An observable sequence exhibiting the behavior corresponding to the source sequence's notification values.
     */
    observableProto.dematerialize = function () {
        return new DematerializeObservable(this);
    };

    var DistinctUntilChangedObservable = (function (__super__) {
        inherits(DistinctUntilChangedObservable, __super__);
        function DistinctUntilChangedObservable(source, keyFn, comparer) {
            this.source = source;
            this.keyFn = keyFn;
            this.comparer = comparer;
            __super__.call(this);
        }

        DistinctUntilChangedObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new DistinctUntilChangedObserver(o, this.keyFn, this.comparer));
        };

        return DistinctUntilChangedObservable;
    }(ObservableBase));

    var DistinctUntilChangedObserver = (function (__super__) {
        inherits(DistinctUntilChangedObserver, __super__);
        function DistinctUntilChangedObserver(o, keyFn, comparer) {
            this.o = o;
            this.keyFn = keyFn;
            this.comparer = comparer;
            this.hasCurrentKey = false;
            this.currentKey = null;
            __super__.call(this);
        }

        DistinctUntilChangedObserver.prototype.next = function (x) {
            var key = x, comparerEquals;
            if (isFunction(this.keyFn)) {
                key = tryCatch(this.keyFn)(x);
                if (key === errorObj) { return this.o.onError(key.e); }
            }
            if (this.hasCurrentKey) {
                comparerEquals = tryCatch(this.comparer)(this.currentKey, key);
                if (comparerEquals === errorObj) { return this.o.onError(comparerEquals.e); }
            }
            if (!this.hasCurrentKey || !comparerEquals) {
                this.hasCurrentKey = true;
                this.currentKey = key;
                this.o.onNext(x);
            }
        };
        DistinctUntilChangedObserver.prototype.error = function (e) {
            this.o.onError(e);
        };
        DistinctUntilChangedObserver.prototype.completed = function () {
            this.o.onCompleted();
        };

        return DistinctUntilChangedObserver;
    }(AbstractObserver));

    /**
    *  Returns an observable sequence that contains only distinct contiguous elements according to the keyFn and the comparer.
    * @param {Function} [keyFn] A function to compute the comparison key for each element. If not provided, it projects the value.
    * @param {Function} [comparer] Equality comparer for computed key values. If not provided, defaults to an equality comparer function.
    * @returns {Observable} An observable sequence only containing the distinct contiguous elements, based on a computed key value, from the source sequence.
    */
    observableProto.distinctUntilChanged = function (keyFn, comparer) {
        comparer || (comparer = defaultComparer);
        return new DistinctUntilChangedObservable(this, keyFn, comparer);
    };

    var TapObservable = (function (__super__) {
        inherits(TapObservable, __super__);
        function TapObservable(source, observerOrOnNext, onError, onCompleted) {
            this.source = source;
            this._oN = observerOrOnNext;
            this._oE = onError;
            this._oC = onCompleted;
            __super__.call(this);
        }

        TapObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this));
        };

        inherits(InnerObserver, AbstractObserver);
        function InnerObserver(o, p) {
            this.o = o;
            this.t = !p._oN || isFunction(p._oN) ?
              observerCreate(p._oN || noop, p._oE || noop, p._oC || noop) :
              p._oN;
            this.isStopped = false;
            AbstractObserver.call(this);
        }
        InnerObserver.prototype.next = function (x) {
            var res = tryCatch(this.t.onNext).call(this.t, x);
            if (res === errorObj) { this.o.onError(res.e); }
            this.o.onNext(x);
        };
        InnerObserver.prototype.error = function (err) {
            var res = tryCatch(this.t.onError).call(this.t, err);
            if (res === errorObj) { return this.o.onError(res.e); }
            this.o.onError(err);
        };
        InnerObserver.prototype.completed = function () {
            var res = tryCatch(this.t.onCompleted).call(this.t);
            if (res === errorObj) { return this.o.onError(res.e); }
            this.o.onCompleted();
        };

        return TapObservable;
    }(ObservableBase));

    /**
    *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
    *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
    * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an o.
    * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
    * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
    * @returns {Observable} The source sequence with the side-effecting behavior applied.
    */
    observableProto['do'] = observableProto.tap = observableProto.doAction = function (observerOrOnNext, onError, onCompleted) {
        return new TapObservable(this, observerOrOnNext, onError, onCompleted);
    };

    /**
    *  Invokes an action for each element in the observable sequence.
    *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
    * @param {Function} onNext Action to invoke for each element in the observable sequence.
    * @param {Any} [thisArg] Object to use as this when executing callback.
    * @returns {Observable} The source sequence with the side-effecting behavior applied.
    */
    observableProto.doOnNext = observableProto.tapOnNext = function (onNext, thisArg) {
        return this.tap(typeof thisArg !== 'undefined' ? function (x) { onNext.call(thisArg, x); } : onNext);
    };

    /**
    *  Invokes an action upon exceptional termination of the observable sequence.
    *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
    * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
    * @param {Any} [thisArg] Object to use as this when executing callback.
    * @returns {Observable} The source sequence with the side-effecting behavior applied.
    */
    observableProto.doOnError = observableProto.tapOnError = function (onError, thisArg) {
        return this.tap(noop, typeof thisArg !== 'undefined' ? function (e) { onError.call(thisArg, e); } : onError);
    };

    /**
    *  Invokes an action upon graceful termination of the observable sequence.
    *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
    * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
    * @param {Any} [thisArg] Object to use as this when executing callback.
    * @returns {Observable} The source sequence with the side-effecting behavior applied.
    */
    observableProto.doOnCompleted = observableProto.tapOnCompleted = function (onCompleted, thisArg) {
        return this.tap(noop, null, typeof thisArg !== 'undefined' ? function () { onCompleted.call(thisArg); } : onCompleted);
    };

    var FinallyObservable = (function (__super__) {
        inherits(FinallyObservable, __super__);
        function FinallyObservable(source, fn, thisArg) {
            this.source = source;
            this._fn = bindCallback(fn, thisArg, 0);
            __super__.call(this);
        }

        FinallyObservable.prototype.subscribeCore = function (o) {
            var d = tryCatch(this.source.subscribe).call(this.source, o);
            if (d === errorObj) {
                this._fn();
                thrower(d.e);
            }

            return new FinallyDisposable(d, this._fn);
        };

        function FinallyDisposable(s, fn) {
            this.isDisposed = false;
            this._s = s;
            this._fn = fn;
        }
        FinallyDisposable.prototype.dispose = function () {
            if (!this.isDisposed) {
                var res = tryCatch(this._s.dispose).call(this._s);
                this._fn();
                res === errorObj && thrower(res.e);
            }
        };

        return FinallyObservable;

    }(ObservableBase));

    /**
     *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
     * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
     * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
     */
    observableProto['finally'] = function (action, thisArg) {
        return new FinallyObservable(this, action, thisArg);
    };

    var IgnoreElementsObservable = (function (__super__) {
        inherits(IgnoreElementsObservable, __super__);

        function IgnoreElementsObservable(source) {
            this.source = source;
            __super__.call(this);
        }

        IgnoreElementsObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o));
        };

        function InnerObserver(o) {
            this.o = o;
            this.isStopped = false;
        }
        InnerObserver.prototype.onNext = noop;
        InnerObserver.prototype.onError = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this.o.onError(err);
            }
        };
        InnerObserver.prototype.onCompleted = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this.o.onCompleted();
            }
        };
        InnerObserver.prototype.dispose = function () { this.isStopped = true; };
        InnerObserver.prototype.fail = function (e) {
            if (!this.isStopped) {
                this.isStopped = true;
                this.observer.onError(e);
                return true;
            }

            return false;
        };

        return IgnoreElementsObservable;
    }(ObservableBase));

    /**
     *  Ignores all elements in an observable sequence leaving only the termination messages.
     * @returns {Observable} An empty observable sequence that signals termination, successful or exceptional, of the source sequence.
     */
    observableProto.ignoreElements = function () {
        return new IgnoreElementsObservable(this);
    };

    var MaterializeObservable = (function (__super__) {
        inherits(MaterializeObservable, __super__);
        function MaterializeObservable(source, fn) {
            this.source = source;
            __super__.call(this);
        }

        MaterializeObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new MaterializeObserver(o));
        };

        return MaterializeObservable;
    }(ObservableBase));

    var MaterializeObserver = (function (__super__) {
        inherits(MaterializeObserver, __super__);

        function MaterializeObserver(o) {
            this._o = o;
            __super__.call(this);
        }

        MaterializeObserver.prototype.next = function (x) { this._o.onNext(notificationCreateOnNext(x)) };
        MaterializeObserver.prototype.error = function (e) { this._o.onNext(notificationCreateOnError(e)); this._o.onCompleted(); };
        MaterializeObserver.prototype.completed = function () { this._o.onNext(notificationCreateOnCompleted()); this._o.onCompleted(); };

        return MaterializeObserver;
    }(AbstractObserver));

    /**
     *  Materializes the implicit notifications of an observable sequence as explicit notification values.
     * @returns {Observable} An observable sequence containing the materialized notification values from the source sequence.
     */
    observableProto.materialize = function () {
        return new MaterializeObservable(this);
    };

    /**
     *  Repeats the observable sequence a specified number of times. If the repeat count is not specified, the sequence repeats indefinitely.
     * @param {Number} [repeatCount]  Number of times to repeat the sequence. If not provided, repeats the sequence indefinitely.
     * @returns {Observable} The observable sequence producing the elements of the given sequence repeatedly.
     */
    observableProto.repeat = function (repeatCount) {
        return enumerableRepeat(this, repeatCount).concat();
    };

    /**
     *  Repeats the source observable sequence the specified number of times or until it successfully terminates. If the retry count is not specified, it retries indefinitely.
     *  Note if you encounter an error and want it to retry once, then you must use .retry(2);
     *
     * @example
     *  var res = retried = retry.repeat();
     *  var res = retried = retry.repeat(2);
     * @param {Number} [retryCount]  Number of times to retry the sequence. If not provided, retry the sequence indefinitely.
     * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
     */
    observableProto.retry = function (retryCount) {
        return enumerableRepeat(this, retryCount).catchError();
    };

    function repeat(value) {
        return {
            '@@iterator': function () {
                return {
                    next: function () {
                        return { done: false, value: value };
                    }
                };
            }
        };
    }

    var RetryWhenObservable = (function (__super__) {
        function createDisposable(state) {
            return {
                isDisposed: false,
                dispose: function () {
                    if (!this.isDisposed) {
                        this.isDisposed = true;
                        state.isDisposed = true;
                    }
                }
            };
        }

        function RetryWhenObservable(source, notifier) {
            this.source = source;
            this._notifier = notifier;
            __super__.call(this);
        }

        inherits(RetryWhenObservable, __super__);

        RetryWhenObservable.prototype.subscribeCore = function (o) {
            var exceptions = new Subject(),
              notifier = new Subject(),
              handled = this._notifier(exceptions),
              notificationDisposable = handled.subscribe(notifier);

            var e = this.source['@@iterator']();

            var state = { isDisposed: false },
              lastError,
              subscription = new SerialDisposable();
            var cancelable = currentThreadScheduler.scheduleRecursive(null, function (_, recurse) {
                if (state.isDisposed) { return; }
                var currentItem = e.next();

                if (currentItem.done) {
                    if (lastError) {
                        o.onError(lastError);
                    } else {
                        o.onCompleted();
                    }
                    return;
                }

                // Check if promise
                var currentValue = currentItem.value;
                isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

                var outer = new SingleAssignmentDisposable();
                var inner = new SingleAssignmentDisposable();
                subscription.setDisposable(new BinaryDisposable(inner, outer));
                outer.setDisposable(currentValue.subscribe(
                  function (x) { o.onNext(x); },
                  function (exn) {
                      inner.setDisposable(notifier.subscribe(recurse, function (ex) {
                          o.onError(ex);
                      }, function () {
                          o.onCompleted();
                      }));

                      exceptions.onNext(exn);
                      outer.dispose();
                  },
                  function () { o.onCompleted(); }));
            });

            return new NAryDisposable([notificationDisposable, subscription, cancelable, createDisposable(state)]);
        };

        return RetryWhenObservable;
    }(ObservableBase));

    observableProto.retryWhen = function (notifier) {
        return new RetryWhenObservable(repeat(this), notifier);
    };

    function repeat(value) {
        return {
            '@@iterator': function () {
                return {
                    next: function () {
                        return { done: false, value: value };
                    }
                };
            }
        };
    }

    var RepeatWhenObservable = (function (__super__) {
        function createDisposable(state) {
            return {
                isDisposed: false,
                dispose: function () {
                    if (!this.isDisposed) {
                        this.isDisposed = true;
                        state.isDisposed = true;
                    }
                }
            };
        }

        function RepeatWhenObservable(source, notifier) {
            this.source = source;
            this._notifier = notifier;
            __super__.call(this);
        }

        inherits(RepeatWhenObservable, __super__);

        RepeatWhenObservable.prototype.subscribeCore = function (o) {
            var completions = new Subject(),
              notifier = new Subject(),
              handled = this._notifier(completions),
              notificationDisposable = handled.subscribe(notifier);

            var e = this.source['@@iterator']();

            var state = { isDisposed: false },
              lastError,
              subscription = new SerialDisposable();
            var cancelable = currentThreadScheduler.scheduleRecursive(null, function (_, recurse) {
                if (state.isDisposed) { return; }
                var currentItem = e.next();

                if (currentItem.done) {
                    if (lastError) {
                        o.onError(lastError);
                    } else {
                        o.onCompleted();
                    }
                    return;
                }

                // Check if promise
                var currentValue = currentItem.value;
                isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

                var outer = new SingleAssignmentDisposable();
                var inner = new SingleAssignmentDisposable();
                subscription.setDisposable(new BinaryDisposable(inner, outer));
                outer.setDisposable(currentValue.subscribe(
                  function (x) { o.onNext(x); },
                  function (exn) { o.onError(exn); },
                  function () {
                      inner.setDisposable(notifier.subscribe(recurse, function (ex) {
                          o.onError(ex);
                      }, function () {
                          o.onCompleted();
                      }));

                      completions.onNext(null);
                      outer.dispose();
                  }));
            });

            return new NAryDisposable([notificationDisposable, subscription, cancelable, createDisposable(state)]);
        };

        return RepeatWhenObservable;
    }(ObservableBase));

    observableProto.repeatWhen = function (notifier) {
        return new RepeatWhenObservable(repeat(this), notifier);
    };

    var ScanObservable = (function (__super__) {
        inherits(ScanObservable, __super__);
        function ScanObservable(source, accumulator, hasSeed, seed) {
            this.source = source;
            this.accumulator = accumulator;
            this.hasSeed = hasSeed;
            this.seed = seed;
            __super__.call(this);
        }

        ScanObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new ScanObserver(o, this));
        };

        return ScanObservable;
    }(ObservableBase));

    var ScanObserver = (function (__super__) {
        inherits(ScanObserver, __super__);
        function ScanObserver(o, parent) {
            this._o = o;
            this._p = parent;
            this._fn = parent.accumulator;
            this._hs = parent.hasSeed;
            this._s = parent.seed;
            this._ha = false;
            this._a = null;
            this._hv = false;
            this._i = 0;
            __super__.call(this);
        }

        ScanObserver.prototype.next = function (x) {
            !this._hv && (this._hv = true);
            if (this._ha) {
                this._a = tryCatch(this._fn)(this._a, x, this._i, this._p);
            } else {
                this._a = this._hs ? tryCatch(this._fn)(this._s, x, this._i, this._p) : x;
                this._ha = true;
            }
            if (this._a === errorObj) { return this._o.onError(this._a.e); }
            this._o.onNext(this._a);
            this._i++;
        };

        ScanObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        ScanObserver.prototype.completed = function () {
            !this._hv && this._hs && this._o.onNext(this._s);
            this._o.onCompleted();
        };

        return ScanObserver;
    }(AbstractObserver));

    /**
    *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
    *  For aggregation behavior with no intermediate results, see Observable.aggregate.
    * @param {Mixed} [seed] The initial accumulator value.
    * @param {Function} accumulator An accumulator function to be invoked on each element.
    * @returns {Observable} An observable sequence containing the accumulated values.
    */
    observableProto.scan = function () {
        var hasSeed = false, seed, accumulator = arguments[0];
        if (arguments.length === 2) {
            hasSeed = true;
            seed = arguments[1];
        }
        return new ScanObservable(this, accumulator, hasSeed, seed);
    };

    var SkipLastObservable = (function (__super__) {
        inherits(SkipLastObservable, __super__);
        function SkipLastObservable(source, c) {
            this.source = source;
            this._c = c;
            __super__.call(this);
        }

        SkipLastObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new SkipLastObserver(o, this._c));
        };

        return SkipLastObservable;
    }(ObservableBase));

    var SkipLastObserver = (function (__super__) {
        inherits(SkipLastObserver, __super__);
        function SkipLastObserver(o, c) {
            this._o = o;
            this._c = c;
            this._q = [];
            __super__.call(this);
        }

        SkipLastObserver.prototype.next = function (x) {
            this._q.push(x);
            this._q.length > this._c && this._o.onNext(this._q.shift());
        };

        SkipLastObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        SkipLastObserver.prototype.completed = function () {
            this._o.onCompleted();
        };

        return SkipLastObserver;
    }(AbstractObserver));

    /**
     *  Bypasses a specified number of elements at the end of an observable sequence.
     * @description
     *  This operator accumulates a queue with a length enough to store the first `count` elements. As more elements are
     *  received, elements are taken from the front of the queue and produced on the result sequence. This causes elements to be delayed.
     * @param count Number of elements to bypass at the end of the source sequence.
     * @returns {Observable} An observable sequence containing the source sequence elements except for the bypassed ones at the end.
     */
    observableProto.skipLast = function (count) {
        if (count < 0) { throw new ArgumentOutOfRangeError(); }
        return new SkipLastObservable(this, count);
    };

    /**
     *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
     *  @example
     *  var res = source.startWith(1, 2, 3);
     *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
     * @param {Arguments} args The specified values to prepend to the observable sequence
     * @returns {Observable} The source sequence prepended with the specified values.
     */
    observableProto.startWith = function () {
        var values, scheduler, start = 0;
        if (!!arguments.length && isScheduler(arguments[0])) {
            scheduler = arguments[0];
            start = 1;
        } else {
            scheduler = immediateScheduler;
        }
        for (var args = [], i = start, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
        return observableConcat.apply(null, [observableFromArray(args, scheduler), this]);
    };

    var TakeLastObserver = (function (__super__) {
        inherits(TakeLastObserver, __super__);
        function TakeLastObserver(o, c) {
            this._o = o;
            this._c = c;
            this._q = [];
            __super__.call(this);
        }

        TakeLastObserver.prototype.next = function (x) {
            this._q.push(x);
            this._q.length > this._c && this._q.shift();
        };

        TakeLastObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        TakeLastObserver.prototype.completed = function () {
            while (this._q.length > 0) { this._o.onNext(this._q.shift()); }
            this._o.onCompleted();
        };

        return TakeLastObserver;
    }(AbstractObserver));

    /**
     *  Returns a specified number of contiguous elements from the end of an observable sequence.
     * @description
     *  This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of
     *  the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.
     * @param {Number} count Number of elements to take from the end of the source sequence.
     * @returns {Observable} An observable sequence containing the specified number of elements from the end of the source sequence.
     */
    observableProto.takeLast = function (count) {
        if (count < 0) { throw new ArgumentOutOfRangeError(); }
        var source = this;
        return new AnonymousObservable(function (o) {
            return source.subscribe(new TakeLastObserver(o, count));
        }, source);
    };

    observableProto.flatMapConcat = observableProto.concatMap = function (selector, resultSelector, thisArg) {
        return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(1);
    };
    var MapObservable = (function (__super__) {
        inherits(MapObservable, __super__);

        function MapObservable(source, selector, thisArg) {
            this.source = source;
            this.selector = bindCallback(selector, thisArg, 3);
            __super__.call(this);
        }

        function innerMap(selector, self) {
            return function (x, i, o) { return selector.call(this, self.selector(x, i, o), i, o); };
        }

        MapObservable.prototype.internalMap = function (selector, thisArg) {
            return new MapObservable(this.source, innerMap(selector, this), thisArg);
        };

        MapObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this.selector, this));
        };

        inherits(InnerObserver, AbstractObserver);
        function InnerObserver(o, selector, source) {
            this.o = o;
            this.selector = selector;
            this.source = source;
            this.i = 0;
            AbstractObserver.call(this);
        }

        InnerObserver.prototype.next = function (x) {
            var result = tryCatch(this.selector)(x, this.i++, this.source);
            if (result === errorObj) { return this.o.onError(result.e); }
            this.o.onNext(result);
        };

        InnerObserver.prototype.error = function (e) {
            this.o.onError(e);
        };

        InnerObserver.prototype.completed = function () {
            this.o.onCompleted();
        };

        return MapObservable;

    }(ObservableBase));

    /**
    * Projects each element of an observable sequence into a new form by incorporating the element's index.
    * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
    * @param {Any} [thisArg] Object to use as this when executing callback.
    * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
    */
    observableProto.map = observableProto.select = function (selector, thisArg) {
        var selectorFn = typeof selector === 'function' ? selector : function () { return selector; };
        return this instanceof MapObservable ?
          this.internalMap(selectorFn, thisArg) :
          new MapObservable(this, selectorFn, thisArg);
    };

    function plucker(args, len) {
        return function mapper(x) {
            var currentProp = x;
            for (var i = 0; i < len; i++) {
                var p = currentProp[args[i]];
                if (typeof p !== 'undefined') {
                    currentProp = p;
                } else {
                    return undefined;
                }
            }
            return currentProp;
        };
    }

    /**
     * Retrieves the value of a specified nested property from all elements in
     * the Observable sequence.
     * @param {Arguments} arguments The nested properties to pluck.
     * @returns {Observable} Returns a new Observable sequence of property values.
     */
    observableProto.pluck = function () {
        var len = arguments.length, args = new Array(len);
        if (len === 0) { throw new Error('List of properties cannot be empty.'); }
        for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
        return this.map(plucker(args, len));
    };

    observableProto.flatMap = observableProto.selectMany = observableProto.mergeMap = function (selector, resultSelector, thisArg) {
        return new FlatMapObservable(this, selector, resultSelector, thisArg).mergeAll();
    };

    observableProto.flatMapLatest = observableProto.switchMap = function (selector, resultSelector, thisArg) {
        return new FlatMapObservable(this, selector, resultSelector, thisArg).switchLatest();
    };

    var SkipObservable = (function (__super__) {
        inherits(SkipObservable, __super__);
        function SkipObservable(source, count) {
            this.source = source;
            this._count = count;
            __super__.call(this);
        }

        SkipObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new SkipObserver(o, this._count));
        };

        function SkipObserver(o, c) {
            this._o = o;
            this._r = c;
            AbstractObserver.call(this);
        }

        inherits(SkipObserver, AbstractObserver);

        SkipObserver.prototype.next = function (x) {
            if (this._r <= 0) {
                this._o.onNext(x);
            } else {
                this._r--;
            }
        };
        SkipObserver.prototype.error = function (e) { this._o.onError(e); };
        SkipObserver.prototype.completed = function () { this._o.onCompleted(); };

        return SkipObservable;
    }(ObservableBase));

    /**
     * Bypasses a specified number of elements in an observable sequence and then returns the remaining elements.
     * @param {Number} count The number of elements to skip before returning the remaining elements.
     * @returns {Observable} An observable sequence that contains the elements that occur after the specified index in the input sequence.
     */
    observableProto.skip = function (count) {
        if (count < 0) { throw new ArgumentOutOfRangeError(); }
        return new SkipObservable(this, count);
    };

    var SkipWhileObservable = (function (__super__) {
        inherits(SkipWhileObservable, __super__);
        function SkipWhileObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this);
        }

        SkipWhileObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new SkipWhileObserver(o, this));
        };

        return SkipWhileObservable;
    }(ObservableBase));

    var SkipWhileObserver = (function (__super__) {
        inherits(SkipWhileObserver, __super__);

        function SkipWhileObserver(o, p) {
            this._o = o;
            this._p = p;
            this._i = 0;
            this._r = false;
            __super__.call(this);
        }

        SkipWhileObserver.prototype.next = function (x) {
            if (!this._r) {
                var res = tryCatch(this._p._fn)(x, this._i++, this._p);
                if (res === errorObj) { return this._o.onError(res.e); }
                this._r = !res;
            }
            this._r && this._o.onNext(x);
        };
        SkipWhileObserver.prototype.error = function (e) { this._o.onError(e); };
        SkipWhileObserver.prototype.completed = function () { this._o.onCompleted(); };

        return SkipWhileObserver;
    }(AbstractObserver));

    /**
     *  Bypasses elements in an observable sequence as long as a specified condition is true and then returns the remaining elements.
     *  The element's index is used in the logic of the predicate function.
     *
     *  var res = source.skipWhile(function (value) { return value < 10; });
     *  var res = source.skipWhile(function (value, index) { return value < 10 || index < 10; });
     * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Observable} An observable sequence that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
     */
    observableProto.skipWhile = function (predicate, thisArg) {
        var fn = bindCallback(predicate, thisArg, 3);
        return new SkipWhileObservable(this, fn);
    };

    var TakeObservable = (function (__super__) {
        inherits(TakeObservable, __super__);
        function TakeObservable(source, count) {
            this.source = source;
            this._count = count;
            __super__.call(this);
        }

        TakeObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new TakeObserver(o, this._count));
        };

        function TakeObserver(o, c) {
            this._o = o;
            this._c = c;
            this._r = c;
            AbstractObserver.call(this);
        }

        inherits(TakeObserver, AbstractObserver);

        TakeObserver.prototype.next = function (x) {
            if (this._r-- > 0) {
                this._o.onNext(x);
                this._r <= 0 && this._o.onCompleted();
            }
        };

        TakeObserver.prototype.error = function (e) { this._o.onError(e); };
        TakeObserver.prototype.completed = function () { this._o.onCompleted(); };

        return TakeObservable;
    }(ObservableBase));

    /**
     *  Returns a specified number of contiguous elements from the start of an observable sequence, using the specified scheduler for the edge case of take(0).
     * @param {Number} count The number of elements to return.
     * @param {Scheduler} [scheduler] Scheduler used to produce an OnCompleted message in case <paramref name="count count</paramref> is set to 0.
     * @returns {Observable} An observable sequence that contains the specified number of elements from the start of the input sequence.
     */
    observableProto.take = function (count, scheduler) {
        if (count < 0) { throw new ArgumentOutOfRangeError(); }
        if (count === 0) { return observableEmpty(scheduler); }
        return new TakeObservable(this, count);
    };

    var TakeWhileObservable = (function (__super__) {
        inherits(TakeWhileObservable, __super__);
        function TakeWhileObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this);
        }

        TakeWhileObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new TakeWhileObserver(o, this));
        };

        return TakeWhileObservable;
    }(ObservableBase));

    var TakeWhileObserver = (function (__super__) {
        inherits(TakeWhileObserver, __super__);

        function TakeWhileObserver(o, p) {
            this._o = o;
            this._p = p;
            this._i = 0;
            this._r = true;
            __super__.call(this);
        }

        TakeWhileObserver.prototype.next = function (x) {
            if (this._r) {
                this._r = tryCatch(this._p._fn)(x, this._i++, this._p);
                if (this._r === errorObj) { return this._o.onError(this._r.e); }
            }
            if (this._r) {
                this._o.onNext(x);
            } else {
                this._o.onCompleted();
            }
        };
        TakeWhileObserver.prototype.error = function (e) { this._o.onError(e); };
        TakeWhileObserver.prototype.completed = function () { this._o.onCompleted(); };

        return TakeWhileObserver;
    }(AbstractObserver));

    /**
     *  Returns elements from an observable sequence as long as a specified condition is true.
     *  The element's index is used in the logic of the predicate function.
     * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Observable} An observable sequence that contains the elements from the input sequence that occur before the element at which the test no longer passes.
     */
    observableProto.takeWhile = function (predicate, thisArg) {
        var fn = bindCallback(predicate, thisArg, 3);
        return new TakeWhileObservable(this, fn);
    };

    var FilterObservable = (function (__super__) {
        inherits(FilterObservable, __super__);

        function FilterObservable(source, predicate, thisArg) {
            this.source = source;
            this.predicate = bindCallback(predicate, thisArg, 3);
            __super__.call(this);
        }

        FilterObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this.predicate, this));
        };

        function innerPredicate(predicate, self) {
            return function (x, i, o) { return self.predicate(x, i, o) && predicate.call(this, x, i, o); }
        }

        FilterObservable.prototype.internalFilter = function (predicate, thisArg) {
            return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg);
        };

        inherits(InnerObserver, AbstractObserver);
        function InnerObserver(o, predicate, source) {
            this.o = o;
            this.predicate = predicate;
            this.source = source;
            this.i = 0;
            AbstractObserver.call(this);
        }

        InnerObserver.prototype.next = function (x) {
            var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
            if (shouldYield === errorObj) {
                return this.o.onError(shouldYield.e);
            }
            shouldYield && this.o.onNext(x);
        };

        InnerObserver.prototype.error = function (e) {
            this.o.onError(e);
        };

        InnerObserver.prototype.completed = function () {
            this.o.onCompleted();
        };

        return FilterObservable;

    }(ObservableBase));

    /**
    *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
    * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
    * @param {Any} [thisArg] Object to use as this when executing callback.
    * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
    */
    observableProto.filter = observableProto.where = function (predicate, thisArg) {
        return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) :
          new FilterObservable(this, predicate, thisArg);
    };

    function createCbObservable(fn, ctx, selector, args) {
        var o = new AsyncSubject();

        args.push(createCbHandler(o, ctx, selector));
        fn.apply(ctx, args);

        return o.asObservable();
    }

    function createCbHandler(o, ctx, selector) {
        return function handler() {
            var len = arguments.length, results = new Array(len);
            for (var i = 0; i < len; i++) { results[i] = arguments[i]; }

            if (isFunction(selector)) {
                results = tryCatch(selector).apply(ctx, results);
                if (results === errorObj) { return o.onError(results.e); }
                o.onNext(results);
            } else {
                if (results.length <= 1) {
                    o.onNext(results[0]);
                } else {
                    o.onNext(results);
                }
            }

            o.onCompleted();
        };
    }

    /**
     * Converts a callback function to an observable sequence.
     *
     * @param {Function} fn Function with a callback as the last parameter to convert to an Observable sequence.
     * @param {Mixed} [ctx] The context for the func parameter to be executed.  If not specified, defaults to undefined.
     * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
     * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
     */
    Observable.fromCallback = function (fn, ctx, selector) {
        return function () {
            typeof ctx === 'undefined' && (ctx = this);

            var len = arguments.length, args = new Array(len)
            for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
            return createCbObservable(fn, ctx, selector, args);
        };
    };

    function createNodeObservable(fn, ctx, selector, args) {
        var o = new AsyncSubject();

        args.push(createNodeHandler(o, ctx, selector));
        fn.apply(ctx, args);

        return o.asObservable();
    }

    function createNodeHandler(o, ctx, selector) {
        return function handler() {
            var err = arguments[0];
            if (err) { return o.onError(err); }

            var len = arguments.length, results = [];
            for (var i = 1; i < len; i++) { results[i - 1] = arguments[i]; }

            if (isFunction(selector)) {
                var results = tryCatch(selector).apply(ctx, results);
                if (results === errorObj) { return o.onError(results.e); }
                o.onNext(results);
            } else {
                if (results.length <= 1) {
                    o.onNext(results[0]);
                } else {
                    o.onNext(results);
                }
            }

            o.onCompleted();
        };
    }

    /**
     * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
     * @param {Function} fn The function to call
     * @param {Mixed} [ctx] The context for the func parameter to be executed.  If not specified, defaults to undefined.
     * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
     * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
     */
    Observable.fromNodeCallback = function (fn, ctx, selector) {
        return function () {
            typeof ctx === 'undefined' && (ctx = this);
            var len = arguments.length, args = new Array(len);
            for (var i = 0; i < len; i++) { args[i] = arguments[i]; }
            return createNodeObservable(fn, ctx, selector, args);
        };
    };

    function isNodeList(el) {
        if (root.StaticNodeList) {
            // IE8 Specific
            // instanceof is slower than Object#toString, but Object#toString will not work as intended in IE8
            return el instanceof root.StaticNodeList || el instanceof root.NodeList;
        } else {
            return Object.prototype.toString.call(el) === '[object NodeList]';
        }
    }

    function ListenDisposable(e, n, fn) {
        this._e = e;
        this._n = n;
        this._fn = fn;
        this._e.addEventListener(this._n, this._fn, false);
        this.isDisposed = false;
    }
    ListenDisposable.prototype.dispose = function () {
        if (!this.isDisposed) {
            this._e.removeEventListener(this._n, this._fn, false);
            this.isDisposed = true;
        }
    };

    function createEventListener(el, eventName, handler) {
        var disposables = new CompositeDisposable();

        // Asume NodeList or HTMLCollection
        var elemToString = Object.prototype.toString.call(el);
        if (isNodeList(el) || elemToString === '[object HTMLCollection]') {
            for (var i = 0, len = el.length; i < len; i++) {
                disposables.add(createEventListener(el.item(i), eventName, handler));
            }
        } else if (el) {
            disposables.add(new ListenDisposable(el, eventName, handler));
        }

        return disposables;
    }

    /**
     * Configuration option to determine whether to use native events only
     */
    Rx.config.useNativeEvents = false;

    var EventObservable = (function (__super__) {
        inherits(EventObservable, __super__);
        function EventObservable(el, name, fn) {
            this._el = el;
            this._n = name;
            this._fn = fn;
            __super__.call(this);
        }

        function createHandler(o, fn) {
            return function handler() {
                var results = arguments[0];
                if (isFunction(fn)) {
                    results = tryCatch(fn).apply(null, arguments);
                    if (results === errorObj) { return o.onError(results.e); }
                }
                o.onNext(results);
            };
        }

        EventObservable.prototype.subscribeCore = function (o) {
            return createEventListener(
              this._el,
              this._n,
              createHandler(o, this._fn));
        };

        return EventObservable;
    }(ObservableBase));

    /**
     * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
     * @param {Object} element The DOMElement or NodeList to attach a listener.
     * @param {String} eventName The event name to attach the observable sequence.
     * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
     * @returns {Observable} An observable sequence of events from the specified element and the specified event.
     */
    Observable.fromEvent = function (element, eventName, selector) {
        // Node.js specific
        if (element.addListener) {
            return fromEventPattern(
              function (h) { element.addListener(eventName, h); },
              function (h) { element.removeListener(eventName, h); },
              selector);
        }

        // Use only if non-native events are allowed
        if (!Rx.config.useNativeEvents) {
            // Handles jq, Angular.js, Zepto, Marionette, Ember.js
            if (typeof element.on === 'function' && typeof element.off === 'function') {
                return fromEventPattern(
                  function (h) { element.on(eventName, h); },
                  function (h) { element.off(eventName, h); },
                  selector);
            }
        }

        return new EventObservable(element, eventName, selector).publish().refCount();
    };

    var EventPatternObservable = (function (__super__) {
        inherits(EventPatternObservable, __super__);
        function EventPatternObservable(add, del, fn) {
            this._add = add;
            this._del = del;
            this._fn = fn;
            __super__.call(this);
        }

        function createHandler(o, fn) {
            return function handler() {
                var results = arguments[0];
                if (isFunction(fn)) {
                    results = tryCatch(fn).apply(null, arguments);
                    if (results === errorObj) { return o.onError(results.e); }
                }
                o.onNext(results);
            };
        }

        EventPatternObservable.prototype.subscribeCore = function (o) {
            var fn = createHandler(o, this._fn);
            var returnValue = this._add(fn);
            return new EventPatternDisposable(this._del, fn, returnValue);
        };

        function EventPatternDisposable(del, fn, ret) {
            this._del = del;
            this._fn = fn;
            this._ret = ret;
            this.isDisposed = false;
        }

        EventPatternDisposable.prototype.dispose = function () {
            if (!this.isDisposed) {
                isFunction(this._del) && this._del(this._fn, this._ret);
                this.isDisposed = true;
            }
        };

        return EventPatternObservable;
    }(ObservableBase));

    /**
     * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
     * @param {Function} addHandler The function to add a handler to the emitter.
     * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
     * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
     * @returns {Observable} An observable sequence which wraps an event from an event emitter
     */
    var fromEventPattern = Observable.fromEventPattern = function (addHandler, removeHandler, selector) {
        return new EventPatternObservable(addHandler, removeHandler, selector).publish().refCount();
    };

    var FromPromiseObservable = (function (__super__) {
        inherits(FromPromiseObservable, __super__);
        function FromPromiseObservable(p, s) {
            this._p = p;
            this._s = s;
            __super__.call(this);
        }

        function scheduleNext(s, state) {
            var o = state[0], data = state[1];
            o.onNext(data);
            o.onCompleted();
        }

        function scheduleError(s, state) {
            var o = state[0], err = state[1];
            o.onError(err);
        }

        FromPromiseObservable.prototype.subscribeCore = function (o) {
            var sad = new SingleAssignmentDisposable(), self = this, p = this._p;

            if (isFunction(p)) {
                p = tryCatch(p)();
                if (p === errorObj) {
                    o.onError(p.e);
                    return sad;
                }
            }

            p
              .then(function (data) {
                  sad.setDisposable(self._s.schedule([o, data], scheduleNext));
              }, function (err) {
                  sad.setDisposable(self._s.schedule([o, err], scheduleError));
              });

            return sad;
        };

        return FromPromiseObservable;
    }(ObservableBase));

    /**
    * Converts a Promise to an Observable sequence
    * @param {Promise} An ES6 Compliant promise.
    * @returns {Observable} An Observable sequence which wraps the existing promise success and failure.
    */
    var observableFromPromise = Observable.fromPromise = function (promise, scheduler) {
        scheduler || (scheduler = defaultScheduler);
        return new FromPromiseObservable(promise, scheduler);
    };

    /*
     * Converts an existing observable sequence to an ES6 Compatible Promise
     * @example
     * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
     *
     * // With config
     * Rx.config.Promise = RSVP.Promise;
     * var promise = Rx.Observable.return(42).toPromise();
     * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
     * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
     */
    observableProto.toPromise = function (promiseCtor) {
        promiseCtor || (promiseCtor = Rx.config.Promise);
        if (!promiseCtor) { throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise'); }
        var source = this;
        return new promiseCtor(function (resolve, reject) {
            // No cancellation can be done
            var value;
            source.subscribe(function (v) {
                value = v;
            }, reject, function () {
                resolve(value);
            });
        });
    };

    /**
     * Invokes the asynchronous function, surfacing the result through an observable sequence.
     * @param {Function} functionAsync Asynchronous function which returns a Promise to run.
     * @returns {Observable} An observable sequence exposing the function's result value, or an exception.
     */
    Observable.startAsync = function (functionAsync) {
        var promise = tryCatch(functionAsync)();
        if (promise === errorObj) { return observableThrow(promise.e); }
        return observableFromPromise(promise);
    };

    var MulticastObservable = (function (__super__) {
        inherits(MulticastObservable, __super__);
        function MulticastObservable(source, fn1, fn2) {
            this.source = source;
            this._fn1 = fn1;
            this._fn2 = fn2;
            __super__.call(this);
        }

        MulticastObservable.prototype.subscribeCore = function (o) {
            var connectable = this.source.multicast(this._fn1());
            return new BinaryDisposable(this._fn2(connectable).subscribe(o), connectable.connect());
        };

        return MulticastObservable;
    }(ObservableBase));

    /**
     * Multicasts the source sequence notifications through an instantiated subject into all uses of the sequence within a selector function. Each
     * subscription to the resulting sequence causes a separate multicast invocation, exposing the sequence resulting from the selector function's
     * invocation. For specializations with fixed subject types, see Publish, PublishLast, and Replay.
     *
     * @example
     * 1 - res = source.multicast(observable);
     * 2 - res = source.multicast(function () { return new Subject(); }, function (x) { return x; });
     *
     * @param {Function|Subject} subjectOrSubjectSelector
     * Factory function to create an intermediate subject through which the source sequence's elements will be multicast to the selector function.
     * Or:
     * Subject to push source elements into.
     *
     * @param {Function} [selector] Optional selector function which can use the multicasted source sequence subject to the policies enforced by the created subject. Specified only if <paramref name="subjectOrSubjectSelector" is a factory function.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
     */
    observableProto.multicast = function (subjectOrSubjectSelector, selector) {
        return isFunction(subjectOrSubjectSelector) ?
          new MulticastObservable(this, subjectOrSubjectSelector, selector) :
          new ConnectableObservable(this, subjectOrSubjectSelector);
    };

    /**
     * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence.
     * This operator is a specialization of Multicast using a regular Subject.
     *
     * @example
     * var resres = source.publish();
     * var res = source.publish(function (x) { return x; });
     *
     * @param {Function} [selector] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
     */
    observableProto.publish = function (selector) {
        return selector && isFunction(selector) ?
          this.multicast(function () { return new Subject(); }, selector) :
          this.multicast(new Subject());
    };

    /**
     * Returns an observable sequence that shares a single subscription to the underlying sequence.
     * This operator is a specialization of publish which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
     */
    observableProto.share = function () {
        return this.publish().refCount();
    };

    /**
     * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence containing only the last notification.
     * This operator is a specialization of Multicast using a AsyncSubject.
     *
     * @example
     * var res = source.publishLast();
     * var res = source.publishLast(function (x) { return x; });
     *
     * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will only receive the last notification of the source.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
     */
    observableProto.publishLast = function (selector) {
        return selector && isFunction(selector) ?
          this.multicast(function () { return new AsyncSubject(); }, selector) :
          this.multicast(new AsyncSubject());
    };

    /**
     * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence and starts with initialValue.
     * This operator is a specialization of Multicast using a BehaviorSubject.
     *
     * @example
     * var res = source.publishValue(42);
     * var res = source.publishValue(function (x) { return x.select(function (y) { return y * y; }) }, 42);
     *
     * @param {Function} [selector] Optional selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive immediately receive the initial value, followed by all notifications of the source from the time of the subscription on.
     * @param {Mixed} initialValue Initial value received by observers upon subscription.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
     */
    observableProto.publishValue = function (initialValueOrSelector, initialValue) {
        return arguments.length === 2 ?
          this.multicast(function () {
              return new BehaviorSubject(initialValue);
          }, initialValueOrSelector) :
          this.multicast(new BehaviorSubject(initialValueOrSelector));
    };

    /**
     * Returns an observable sequence that shares a single subscription to the underlying sequence and starts with an initialValue.
     * This operator is a specialization of publishValue which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
     * @param {Mixed} initialValue Initial value received by observers upon subscription.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
     */
    observableProto.shareValue = function (initialValue) {
        return this.publishValue(initialValue).refCount();
    };

    /**
     * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
     * This operator is a specialization of Multicast using a ReplaySubject.
     *
     * @example
     * var res = source.replay(null, 3);
     * var res = source.replay(null, 3, 500);
     * var res = source.replay(null, 3, 500, scheduler);
     * var res = source.replay(function (x) { return x.take(6).repeat(); }, 3, 500, scheduler);
     *
     * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all the notifications of the source subject to the specified replay buffer trimming policy.
     * @param bufferSize [Optional] Maximum element count of the replay buffer.
     * @param windowSize [Optional] Maximum time length of the replay buffer.
     * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
     */
    observableProto.replay = function (selector, bufferSize, windowSize, scheduler) {
        return selector && isFunction(selector) ?
          this.multicast(function () { return new ReplaySubject(bufferSize, windowSize, scheduler); }, selector) :
          this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));
    };

    /**
     * Returns an observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
     * This operator is a specialization of replay which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
     *
     * @example
     * var res = source.shareReplay(3);
     * var res = source.shareReplay(3, 500);
     * var res = source.shareReplay(3, 500, scheduler);
     *
  
     * @param bufferSize [Optional] Maximum element count of the replay buffer.
     * @param window [Optional] Maximum time length of the replay buffer.
     * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
     * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
     */
    observableProto.shareReplay = function (bufferSize, windowSize, scheduler) {
        return this.replay(null, bufferSize, windowSize, scheduler).refCount();
    };

    var RefCountObservable = (function (__super__) {
        inherits(RefCountObservable, __super__);
        function RefCountObservable(source) {
            this.source = source;
            this._count = 0;
            this._connectableSubscription = null;
            __super__.call(this);
        }

        RefCountObservable.prototype.subscribeCore = function (o) {
            var subscription = this.source.subscribe(o);
            ++this._count === 1 && (this._connectableSubscription = this.source.connect());
            return new RefCountDisposable(this, subscription);
        };

        function RefCountDisposable(p, s) {
            this._p = p;
            this._s = s;
            this.isDisposed = false;
        }

        RefCountDisposable.prototype.dispose = function () {
            if (!this.isDisposed) {
                this.isDisposed = true;
                this._s.dispose();
                --this._p._count === 0 && this._p._connectableSubscription.dispose();
            }
        };

        return RefCountObservable;
    }(ObservableBase));

    var ConnectableObservable = Rx.ConnectableObservable = (function (__super__) {
        inherits(ConnectableObservable, __super__);
        function ConnectableObservable(source, subject) {
            this.source = source;
            this._connection = null;
            this._source = source.asObservable();
            this._subject = subject;
            __super__.call(this);
        }

        function ConnectDisposable(parent, subscription) {
            this._p = parent;
            this._s = subscription;
        }

        ConnectDisposable.prototype.dispose = function () {
            if (this._s) {
                this._s.dispose();
                this._s = null;
                this._p._connection = null;
            }
        };

        ConnectableObservable.prototype.connect = function () {
            if (!this._connection) {
                if (this._subject.isStopped) {
                    return disposableEmpty;
                }
                var subscription = this._source.subscribe(this._subject);
                this._connection = new ConnectDisposable(this, subscription);
            }
            return this._connection;
        };

        ConnectableObservable.prototype._subscribe = function (o) {
            return this._subject.subscribe(o);
        };

        ConnectableObservable.prototype.refCount = function () {
            return new RefCountObservable(this);
        };

        return ConnectableObservable;
    }(Observable));

    var TimerObservable = (function (__super__) {
        inherits(TimerObservable, __super__);
        function TimerObservable(dt, s) {
            this._dt = dt;
            this._s = s;
            __super__.call(this);
        }

        TimerObservable.prototype.subscribeCore = function (o) {
            return this._s.scheduleFuture(o, this._dt, scheduleMethod);
        };

        function scheduleMethod(s, o) {
            o.onNext(0);
            o.onCompleted();
        }

        return TimerObservable;
    }(ObservableBase));

    function _observableTimer(dueTime, scheduler) {
        return new TimerObservable(dueTime, scheduler);
    }

    function observableTimerDateAndPeriod(dueTime, period, scheduler) {
        return new AnonymousObservable(function (observer) {
            var d = dueTime, p = normalizeTime(period);
            return scheduler.scheduleRecursiveFuture(0, d, function (count, self) {
                if (p > 0) {
                    var now = scheduler.now();
                    d = new Date(d.getTime() + p);
                    d.getTime() <= now && (d = new Date(now + p));
                }
                observer.onNext(count);
                self(count + 1, new Date(d));
            });
        });
    }

    function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler) {
        return dueTime === period ?
          new AnonymousObservable(function (observer) {
              return scheduler.schedulePeriodic(0, period, function (count) {
                  observer.onNext(count);
                  return count + 1;
              });
          }) :
          observableDefer(function () {
              return observableTimerDateAndPeriod(new Date(scheduler.now() + dueTime), period, scheduler);
          });
    }

    /**
     *  Returns an observable sequence that produces a value after each period.
     *
     * @example
     *  1 - res = Rx.Observable.interval(1000);
     *  2 - res = Rx.Observable.interval(1000, Rx.Scheduler.timeout);
     *
     * @param {Number} period Period for producing the values in the resulting sequence (specified as an integer denoting milliseconds).
     * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, Rx.Scheduler.timeout is used.
     * @returns {Observable} An observable sequence that produces a value after each period.
     */
    var observableinterval = Observable.interval = function (period, scheduler) {
        return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler) ? scheduler : defaultScheduler);
    };

    /**
     *  Returns an observable sequence that produces a value after dueTime has elapsed and then after each period.
     * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) at which to produce the first value.
     * @param {Mixed} [periodOrScheduler]  Period to produce subsequent values (specified as an integer denoting milliseconds), or the scheduler to run the timer on. If not specified, the resulting timer is not recurring.
     * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, the timeout scheduler is used.
     * @returns {Observable} An observable sequence that produces a value after due time has elapsed and then each period.
     */
    var observableTimer = Observable.timer = function (dueTime, periodOrScheduler, scheduler) {
        var period;
        isScheduler(scheduler) || (scheduler = defaultScheduler);
        if (periodOrScheduler != null && typeof periodOrScheduler === 'number') {
            period = periodOrScheduler;
        } else if (isScheduler(periodOrScheduler)) {
            scheduler = periodOrScheduler;
        }
        if ((dueTime instanceof Date || typeof dueTime === 'number') && period === undefined) {
            return _observableTimer(dueTime, scheduler);
        }
        if (dueTime instanceof Date && period !== undefined) {
            return observableTimerDateAndPeriod(dueTime, periodOrScheduler, scheduler);
        }
        return observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);
    };

    function observableDelayRelative(source, dueTime, scheduler) {
        return new AnonymousObservable(function (o) {
            var active = false,
              cancelable = new SerialDisposable(),
              exception = null,
              q = [],
              running = false,
              subscription;
            subscription = source.materialize().timestamp(scheduler).subscribe(function (notification) {
                var d, shouldRun;
                if (notification.value.kind === 'E') {
                    q = [];
                    q.push(notification);
                    exception = notification.value.error;
                    shouldRun = !running;
                } else {
                    q.push({ value: notification.value, timestamp: notification.timestamp + dueTime });
                    shouldRun = !active;
                    active = true;
                }
                if (shouldRun) {
                    if (exception !== null) {
                        o.onError(exception);
                    } else {
                        d = new SingleAssignmentDisposable();
                        cancelable.setDisposable(d);
                        d.setDisposable(scheduler.scheduleRecursiveFuture(null, dueTime, function (_, self) {
                            var e, recurseDueTime, result, shouldRecurse;
                            if (exception !== null) {
                                return;
                            }
                            running = true;
                            do {
                                result = null;
                                if (q.length > 0 && q[0].timestamp - scheduler.now() <= 0) {
                                    result = q.shift().value;
                                }
                                if (result !== null) {
                                    result.accept(o);
                                }
                            } while (result !== null);
                            shouldRecurse = false;
                            recurseDueTime = 0;
                            if (q.length > 0) {
                                shouldRecurse = true;
                                recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());
                            } else {
                                active = false;
                            }
                            e = exception;
                            running = false;
                            if (e !== null) {
                                o.onError(e);
                            } else if (shouldRecurse) {
                                self(null, recurseDueTime);
                            }
                        }));
                    }
                }
            });
            return new BinaryDisposable(subscription, cancelable);
        }, source);
    }

    function observableDelayAbsolute(source, dueTime, scheduler) {
        return observableDefer(function () {
            return observableDelayRelative(source, dueTime - scheduler.now(), scheduler);
        });
    }

    function delayWithSelector(source, subscriptionDelay, delayDurationSelector) {
        var subDelay, selector;
        if (isFunction(subscriptionDelay)) {
            selector = subscriptionDelay;
        } else {
            subDelay = subscriptionDelay;
            selector = delayDurationSelector;
        }
        return new AnonymousObservable(function (o) {
            var delays = new CompositeDisposable(), atEnd = false, subscription = new SerialDisposable();

            function start() {
                subscription.setDisposable(source.subscribe(
                  function (x) {
                      var delay = tryCatch(selector)(x);
                      if (delay === errorObj) { return o.onError(delay.e); }
                      var d = new SingleAssignmentDisposable();
                      delays.add(d);
                      d.setDisposable(delay.subscribe(
                        function () {
                            o.onNext(x);
                            delays.remove(d);
                            done();
                        },
                        function (e) { o.onError(e); },
                        function () {
                            o.onNext(x);
                            delays.remove(d);
                            done();
                        }
                      ));
                  },
                  function (e) { o.onError(e); },
                  function () {
                      atEnd = true;
                      subscription.dispose();
                      done();
                  }
                ));
            }

            function done() {
                atEnd && delays.length === 0 && o.onCompleted();
            }

            if (!subDelay) {
                start();
            } else {
                subscription.setDisposable(subDelay.subscribe(start, function (e) { o.onError(e); }, start));
            }

            return new BinaryDisposable(subscription, delays);
        }, source);
    }

    /**
     *  Time shifts the observable sequence by dueTime.
     *  The relative time intervals between the values are preserved.
     *
     * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) by which to shift the observable sequence.
     * @param {Scheduler} [scheduler] Scheduler to run the delay timers on. If not specified, the timeout scheduler is used.
     * @returns {Observable} Time-shifted sequence.
     */
    observableProto.delay = function () {
        var firstArg = arguments[0];
        if (typeof firstArg === 'number' || firstArg instanceof Date) {
            var dueTime = firstArg, scheduler = arguments[1];
            isScheduler(scheduler) || (scheduler = defaultScheduler);
            return dueTime instanceof Date ?
              observableDelayAbsolute(this, dueTime, scheduler) :
              observableDelayRelative(this, dueTime, scheduler);
        } else if (Observable.isObservable(firstArg) || isFunction(firstArg)) {
            return delayWithSelector(this, firstArg, arguments[1]);
        } else {
            throw new Error('Invalid arguments');
        }
    };

    var DebounceObservable = (function (__super__) {
        inherits(DebounceObservable, __super__);
        function DebounceObservable(source, dt, s) {
            isScheduler(s) || (s = defaultScheduler);
            this.source = source;
            this._dt = dt;
            this._s = s;
            __super__.call(this);
        }

        DebounceObservable.prototype.subscribeCore = function (o) {
            var cancelable = new SerialDisposable();
            return new BinaryDisposable(
              this.source.subscribe(new DebounceObserver(o, this._dt, this._s, cancelable)),
              cancelable);
        };

        return DebounceObservable;
    }(ObservableBase));

    var DebounceObserver = (function (__super__) {
        inherits(DebounceObserver, __super__);
        function DebounceObserver(observer, dueTime, scheduler, cancelable) {
            this._o = observer;
            this._d = dueTime;
            this._scheduler = scheduler;
            this._c = cancelable;
            this._v = null;
            this._hv = false;
            this._id = 0;
            __super__.call(this);
        }

        function scheduleFuture(s, state) {
            state.self._hv && state.self._id === state.currentId && state.self._o.onNext(state.x);
            state.self._hv = false;
        }

        DebounceObserver.prototype.next = function (x) {
            this._hv = true;
            this._v = x;
            var currentId = ++this._id, d = new SingleAssignmentDisposable();
            this._c.setDisposable(d);
            d.setDisposable(this._scheduler.scheduleFuture(this, this._d, function (_, self) {
                self._hv && self._id === currentId && self._o.onNext(x);
                self._hv = false;
            }));
        };

        DebounceObserver.prototype.error = function (e) {
            this._c.dispose();
            this._o.onError(e);
            this._hv = false;
            this._id++;
        };

        DebounceObserver.prototype.completed = function () {
            this._c.dispose();
            this._hv && this._o.onNext(this._v);
            this._o.onCompleted();
            this._hv = false;
            this._id++;
        };

        return DebounceObserver;
    }(AbstractObserver));

    function debounceWithSelector(source, durationSelector) {
        return new AnonymousObservable(function (o) {
            var value, hasValue = false, cancelable = new SerialDisposable(), id = 0;
            var subscription = source.subscribe(
              function (x) {
                  var throttle = tryCatch(durationSelector)(x);
                  if (throttle === errorObj) { return o.onError(throttle.e); }

                  isPromise(throttle) && (throttle = observableFromPromise(throttle));

                  hasValue = true;
                  value = x;
                  id++;
                  var currentid = id, d = new SingleAssignmentDisposable();
                  cancelable.setDisposable(d);
                  d.setDisposable(throttle.subscribe(
                    function () {
                        hasValue && id === currentid && o.onNext(value);
                        hasValue = false;
                        d.dispose();
                    },
                    function (e) { o.onError(e); },
                    function () {
                        hasValue && id === currentid && o.onNext(value);
                        hasValue = false;
                        d.dispose();
                    }
                  ));
              },
              function (e) {
                  cancelable.dispose();
                  o.onError(e);
                  hasValue = false;
                  id++;
              },
              function () {
                  cancelable.dispose();
                  hasValue && o.onNext(value);
                  o.onCompleted();
                  hasValue = false;
                  id++;
              }
            );
            return new BinaryDisposable(subscription, cancelable);
        }, source);
    }

    observableProto.debounce = function () {
        if (isFunction(arguments[0])) {
            return debounceWithSelector(this, arguments[0]);
        } else if (typeof arguments[0] === 'number') {
            return new DebounceObservable(this, arguments[0], arguments[1]);
        } else {
            throw new Error('Invalid arguments');
        }
    };

    var TimestampObservable = (function (__super__) {
        inherits(TimestampObservable, __super__);
        function TimestampObservable(source, s) {
            this.source = source;
            this._s = s;
            __super__.call(this);
        }

        TimestampObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new TimestampObserver(o, this._s));
        };

        return TimestampObservable;
    }(ObservableBase));

    var TimestampObserver = (function (__super__) {
        inherits(TimestampObserver, __super__);
        function TimestampObserver(o, s) {
            this._o = o;
            this._s = s;
            __super__.call(this);
        }

        TimestampObserver.prototype.next = function (x) {
            this._o.onNext({ value: x, timestamp: this._s.now() });
        };

        TimestampObserver.prototype.error = function (e) {
            this._o.onError(e);
        };

        TimestampObserver.prototype.completed = function () {
            this._o.onCompleted();
        };

        return TimestampObserver;
    }(AbstractObserver));

    /**
     *  Records the timestamp for each value in an observable sequence.
     *
     * @example
     *  1 - res = source.timestamp(); // produces { value: x, timestamp: ts }
     *  2 - res = source.timestamp(Rx.Scheduler.default);
     *
     * @param {Scheduler} [scheduler]  Scheduler used to compute timestamps. If not specified, the default scheduler is used.
     * @returns {Observable} An observable sequence with timestamp information on values.
     */
    observableProto.timestamp = function (scheduler) {
        isScheduler(scheduler) || (scheduler = defaultScheduler);
        return new TimestampObservable(this, scheduler);
    };

    var SampleObservable = (function (__super__) {
        inherits(SampleObservable, __super__);
        function SampleObservable(source, sampler) {
            this.source = source;
            this._sampler = sampler;
            __super__.call(this);
        }

        SampleObservable.prototype.subscribeCore = function (o) {
            var state = {
                o: o,
                atEnd: false,
                value: null,
                hasValue: false,
                sourceSubscription: new SingleAssignmentDisposable()
            };

            state.sourceSubscription.setDisposable(this.source.subscribe(new SampleSourceObserver(state)));
            return new BinaryDisposable(
              state.sourceSubscription,
              this._sampler.subscribe(new SamplerObserver(state))
            );
        };

        return SampleObservable;
    }(ObservableBase));

    var SamplerObserver = (function (__super__) {
        inherits(SamplerObserver, __super__);
        function SamplerObserver(s) {
            this._s = s;
            __super__.call(this);
        }

        SamplerObserver.prototype._handleMessage = function () {
            if (this._s.hasValue) {
                this._s.hasValue = false;
                this._s.o.onNext(this._s.value);
            }
            this._s.atEnd && this._s.o.onCompleted();
        };

        SamplerObserver.prototype.next = function () { this._handleMessage(); };
        SamplerObserver.prototype.error = function (e) { this._s.onError(e); };
        SamplerObserver.prototype.completed = function () { this._handleMessage(); };

        return SamplerObserver;
    }(AbstractObserver));

    var SampleSourceObserver = (function (__super__) {
        inherits(SampleSourceObserver, __super__);
        function SampleSourceObserver(s) {
            this._s = s;
            __super__.call(this);
        }

        SampleSourceObserver.prototype.next = function (x) {
            this._s.hasValue = true;
            this._s.value = x;
        };
        SampleSourceObserver.prototype.error = function (e) { this._s.o.onError(e); };
        SampleSourceObserver.prototype.completed = function () {
            this._s.atEnd = true;
            this._s.sourceSubscription.dispose();
        };

        return SampleSourceObserver;
    }(AbstractObserver));

    /**
     *  Samples the observable sequence at each interval.
     *
     * @example
     *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
     *  2 - res = source.sample(5000); // 5 seconds
     *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
     *
     * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
     * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
     * @returns {Observable} Sampled observable sequence.
     */
    observableProto.sample = function (intervalOrSampler, scheduler) {
        isScheduler(scheduler) || (scheduler = defaultScheduler);
        return typeof intervalOrSampler === 'number' ?
          new SampleObservable(this, observableinterval(intervalOrSampler, scheduler)) :
          new SampleObservable(this, intervalOrSampler);
    };

    var TimeoutError = Rx.TimeoutError = function (message) {
        this.message = message || 'Timeout has occurred';
        this.name = 'TimeoutError';
        Error.call(this);
    };
    TimeoutError.prototype = Object.create(Error.prototype);

    function timeoutWithSelector(source, firstTimeout, timeoutDurationSelector, other) {
        if (isFunction(firstTimeout)) {
            other = timeoutDurationSelector;
            timeoutDurationSelector = firstTimeout;
            firstTimeout = observableNever();
        }
        Observable.isObservable(other) || (other = observableThrow(new TimeoutError()));
        return new AnonymousObservable(function (o) {
            var subscription = new SerialDisposable(),
              timer = new SerialDisposable(),
              original = new SingleAssignmentDisposable();

            subscription.setDisposable(original);

            var id = 0, switched = false;

            function setTimer(timeout) {
                var myId = id, d = new SingleAssignmentDisposable();

                function timerWins() {
                    switched = (myId === id);
                    return switched;
                }

                timer.setDisposable(d);
                d.setDisposable(timeout.subscribe(function () {
                    timerWins() && subscription.setDisposable(other.subscribe(o));
                    d.dispose();
                }, function (e) {
                    timerWins() && o.onError(e);
                }, function () {
                    timerWins() && subscription.setDisposable(other.subscribe(o));
                }));
            };

            setTimer(firstTimeout);

            function oWins() {
                var res = !switched;
                if (res) { id++; }
                return res;
            }

            original.setDisposable(source.subscribe(function (x) {
                if (oWins()) {
                    o.onNext(x);
                    var timeout = tryCatch(timeoutDurationSelector)(x);
                    if (timeout === errorObj) { return o.onError(timeout.e); }
                    setTimer(isPromise(timeout) ? observableFromPromise(timeout) : timeout);
                }
            }, function (e) {
                oWins() && o.onError(e);
            }, function () {
                oWins() && o.onCompleted();
            }));
            return new BinaryDisposable(subscription, timer);
        }, source);
    }

    function timeout(source, dueTime, other, scheduler) {
        if (isScheduler(other)) {
            scheduler = other;
            other = observableThrow(new TimeoutError());
        }
        if (other instanceof Error) { other = observableThrow(other); }
        isScheduler(scheduler) || (scheduler = defaultScheduler);
        Observable.isObservable(other) || (other = observableThrow(new TimeoutError()));
        return new AnonymousObservable(function (o) {
            var id = 0,
              original = new SingleAssignmentDisposable(),
              subscription = new SerialDisposable(),
              switched = false,
              timer = new SerialDisposable();

            subscription.setDisposable(original);

            function createTimer() {
                var myId = id;
                timer.setDisposable(scheduler.scheduleFuture(null, dueTime, function () {
                    switched = id === myId;
                    if (switched) {
                        isPromise(other) && (other = observableFromPromise(other));
                        subscription.setDisposable(other.subscribe(o));
                    }
                }));
            }

            createTimer();

            original.setDisposable(source.subscribe(function (x) {
                if (!switched) {
                    id++;
                    o.onNext(x);
                    createTimer();
                }
            }, function (e) {
                if (!switched) {
                    id++;
                    o.onError(e);
                }
            }, function () {
                if (!switched) {
                    id++;
                    o.onCompleted();
                }
            }));
            return new BinaryDisposable(subscription, timer);
        }, source);
    }

    observableProto.timeout = function () {
        var firstArg = arguments[0];
        if (firstArg instanceof Date || typeof firstArg === 'number') {
            return timeout(this, firstArg, arguments[1], arguments[2]);
        } else if (Observable.isObservable(firstArg) || isFunction(firstArg)) {
            return timeoutWithSelector(this, firstArg, arguments[1], arguments[2]);
        } else {
            throw new Error('Invalid arguments');
        }
    };

    /**
     * Returns an Observable that emits only the first item emitted by the source Observable during sequential time windows of a specified duration.
     * @param {Number} windowDuration time to wait before emitting another item after emitting the last item
     * @param {Scheduler} [scheduler] the Scheduler to use internally to manage the timers that handle timeout for each item. If not provided, defaults to Scheduler.timeout.
     * @returns {Observable} An Observable that performs the throttle operation.
     */
    observableProto.throttle = function (windowDuration, scheduler) {
        isScheduler(scheduler) || (scheduler = defaultScheduler);
        var duration = +windowDuration || 0;
        if (duration <= 0) { throw new RangeError('windowDuration cannot be less or equal zero.'); }
        var source = this;
        return new AnonymousObservable(function (o) {
            var lastOnNext = 0;
            return source.subscribe(
              function (x) {
                  var now = scheduler.now();
                  if (lastOnNext === 0 || now - lastOnNext >= duration) {
                      lastOnNext = now;
                      o.onNext(x);
                  }
              }, function (e) { o.onError(e); }, function () { o.onCompleted(); }
            );
        }, source);
    };

    var PausableObservable = (function (__super__) {
        inherits(PausableObservable, __super__);
        function PausableObservable(source, pauser) {
            this.source = source;
            this.controller = new Subject();
            this.paused = true;

            if (pauser && pauser.subscribe) {
                this.pauser = this.controller.merge(pauser);
            } else {
                this.pauser = this.controller;
            }

            __super__.call(this);
        }

        PausableObservable.prototype._subscribe = function (o) {
            var conn = this.source.publish(),
              subscription = conn.subscribe(o),
              connection = disposableEmpty;

            var pausable = this.pauser.startWith(!this.paused).distinctUntilChanged().subscribe(function (b) {
                if (b) {
                    connection = conn.connect();
                } else {
                    connection.dispose();
                    connection = disposableEmpty;
                }
            });

            return new NAryDisposable([subscription, connection, pausable]);
        };

        PausableObservable.prototype.pause = function () {
            this.paused = true;
            this.controller.onNext(false);
        };

        PausableObservable.prototype.resume = function () {
            this.paused = false;
            this.controller.onNext(true);
        };

        return PausableObservable;

    }(Observable));

    /**
     * Pauses the underlying observable sequence based upon the observable sequence which yields true/false.
     * @example
     * var pauser = new Rx.Subject();
     * var source = Rx.Observable.interval(100).pausable(pauser);
     * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
     * @returns {Observable} The observable sequence which is paused based upon the pauser.
     */
    observableProto.pausable = function (pauser) {
        return new PausableObservable(this, pauser);
    };

    function combineLatestSource(source, subject, resultSelector) {
        return new AnonymousObservable(function (o) {
            var hasValue = [false, false],
              hasValueAll = false,
              isDone = false,
              values = new Array(2),
              err;

            function next(x, i) {
                values[i] = x;
                hasValue[i] = true;
                if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
                    if (err) { return o.onError(err); }
                    var res = tryCatch(resultSelector).apply(null, values);
                    if (res === errorObj) { return o.onError(res.e); }
                    o.onNext(res);
                }
                isDone && values[1] && o.onCompleted();
            }

            return new BinaryDisposable(
              source.subscribe(
                function (x) {
                    next(x, 0);
                },
                function (e) {
                    if (values[1]) {
                        o.onError(e);
                    } else {
                        err = e;
                    }
                },
                function () {
                    isDone = true;
                    values[1] && o.onCompleted();
                }),
              subject.subscribe(
                function (x) {
                    next(x, 1);
                },
                function (e) { o.onError(e); },
                function () {
                    isDone = true;
                    next(true, 1);
                })
              );
        }, source);
    }

    var PausableBufferedObservable = (function (__super__) {
        inherits(PausableBufferedObservable, __super__);
        function PausableBufferedObservable(source, pauser) {
            this.source = source;
            this.controller = new Subject();
            this.paused = true;

            if (pauser && pauser.subscribe) {
                this.pauser = this.controller.merge(pauser);
            } else {
                this.pauser = this.controller;
            }

            __super__.call(this);
        }

        PausableBufferedObservable.prototype._subscribe = function (o) {
            var q = [], previousShouldFire;

            function drainQueue() { while (q.length > 0) { o.onNext(q.shift()); } }

            var subscription =
              combineLatestSource(
                this.source,
                this.pauser.startWith(!this.paused).distinctUntilChanged(),
                function (data, shouldFire) {
                    return { data: data, shouldFire: shouldFire };
                })
                .subscribe(
                  function (results) {
                      if (previousShouldFire !== undefined && results.shouldFire !== previousShouldFire) {
                          previousShouldFire = results.shouldFire;
                          // change in shouldFire
                          if (results.shouldFire) { drainQueue(); }
                      } else {
                          previousShouldFire = results.shouldFire;
                          // new data
                          if (results.shouldFire) {
                              o.onNext(results.data);
                          } else {
                              q.push(results.data);
                          }
                      }
                  },
                  function (err) {
                      drainQueue();
                      o.onError(err);
                  },
                  function () {
                      drainQueue();
                      o.onCompleted();
                  }
                );
            return subscription;
        };

        PausableBufferedObservable.prototype.pause = function () {
            this.paused = true;
            this.controller.onNext(false);
        };

        PausableBufferedObservable.prototype.resume = function () {
            this.paused = false;
            this.controller.onNext(true);
        };

        return PausableBufferedObservable;

    }(Observable));

    /**
     * Pauses the underlying observable sequence based upon the observable sequence which yields true/false,
     * and yields the values that were buffered while paused.
     * @example
     * var pauser = new Rx.Subject();
     * var source = Rx.Observable.interval(100).pausableBuffered(pauser);
     * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
     * @returns {Observable} The observable sequence which is paused based upon the pauser.
     */
    observableProto.pausableBuffered = function (pauser) {
        return new PausableBufferedObservable(this, pauser);
    };

    var ControlledObservable = (function (__super__) {
        inherits(ControlledObservable, __super__);
        function ControlledObservable(source, enableQueue, scheduler) {
            __super__.call(this);
            this.subject = new ControlledSubject(enableQueue, scheduler);
            this.source = source.multicast(this.subject).refCount();
        }

        ControlledObservable.prototype._subscribe = function (o) {
            return this.source.subscribe(o);
        };

        ControlledObservable.prototype.request = function (numberOfItems) {
            return this.subject.request(numberOfItems == null ? -1 : numberOfItems);
        };

        return ControlledObservable;

    }(Observable));

    var ControlledSubject = (function (__super__) {
        inherits(ControlledSubject, __super__);
        function ControlledSubject(enableQueue, scheduler) {
            enableQueue == null && (enableQueue = true);

            __super__.call(this);
            this.subject = new Subject();
            this.enableQueue = enableQueue;
            this.queue = enableQueue ? [] : null;
            this.requestedCount = 0;
            this.requestedDisposable = null;
            this.error = null;
            this.hasFailed = false;
            this.hasCompleted = false;
            this.scheduler = scheduler || currentThreadScheduler;
        }

        addProperties(ControlledSubject.prototype, Observer, {
            _subscribe: function (o) {
                return this.subject.subscribe(o);
            },
            onCompleted: function () {
                this.hasCompleted = true;
                if (!this.enableQueue || this.queue.length === 0) {
                    this.subject.onCompleted();
                    this.disposeCurrentRequest();
                } else {
                    this.queue.push(Notification.createOnCompleted());
                }
            },
            onError: function (error) {
                this.hasFailed = true;
                this.error = error;
                if (!this.enableQueue || this.queue.length === 0) {
                    this.subject.onError(error);
                    this.disposeCurrentRequest();
                } else {
                    this.queue.push(Notification.createOnError(error));
                }
            },
            onNext: function (value) {
                if (this.requestedCount <= 0) {
                    this.enableQueue && this.queue.push(Notification.createOnNext(value));
                } else {
                    (this.requestedCount-- === 0) && this.disposeCurrentRequest();
                    this.subject.onNext(value);
                }
            },
            _processRequest: function (numberOfItems) {
                if (this.enableQueue) {
                    while (this.queue.length > 0 && (numberOfItems > 0 || this.queue[0].kind !== 'N')) {
                        var first = this.queue.shift();
                        first.accept(this.subject);
                        if (first.kind === 'N') {
                            numberOfItems--;
                        } else {
                            this.disposeCurrentRequest();
                            this.queue = [];
                        }
                    }
                }

                return numberOfItems;
            },
            request: function (number) {
                this.disposeCurrentRequest();
                var self = this;

                this.requestedDisposable = this.scheduler.schedule(number,
                function (s, i) {
                    var remaining = self._processRequest(i);
                    var stopped = self.hasCompleted || self.hasFailed;
                    if (!stopped && remaining > 0) {
                        self.requestedCount = remaining;

                        return disposableCreate(function () {
                            self.requestedCount = 0;
                        });
                        // Scheduled item is still in progress. Return a new
                        // disposable to allow the request to be interrupted
                        // via dispose.
                    }
                });

                return this.requestedDisposable;
            },
            disposeCurrentRequest: function () {
                if (this.requestedDisposable) {
                    this.requestedDisposable.dispose();
                    this.requestedDisposable = null;
                }
            }
        });

        return ControlledSubject;
    }(Observable));

    /**
     * Attaches a controller to the observable sequence with the ability to queue.
     * @example
     * var source = Rx.Observable.interval(100).controlled();
     * source.request(3); // Reads 3 values
     * @param {bool} enableQueue truthy value to determine if values should be queued pending the next request
     * @param {Scheduler} scheduler determines how the requests will be scheduled
     * @returns {Observable} The observable sequence which only propagates values on request.
     */
    observableProto.controlled = function (enableQueue, scheduler) {

        if (enableQueue && isScheduler(enableQueue)) {
            scheduler = enableQueue;
            enableQueue = true;
        }

        if (enableQueue == null) { enableQueue = true; }
        return new ControlledObservable(this, enableQueue, scheduler);
    };

    /**
     * Pipes the existing Observable sequence into a Node.js Stream.
     * @param {Stream} dest The destination Node.js stream.
     * @returns {Stream} The destination stream.
     */
    observableProto.pipe = function (dest) {
        var source = this.pausableBuffered();

        function onDrain() {
            source.resume();
        }

        dest.addListener('drain', onDrain);

        source.subscribe(
          function (x) {
              !dest.write(x) && source.pause();
          },
          function (err) {
              dest.emit('error', err);
          },
          function () {
              // Hack check because STDIO is not closable
              !dest._isStdio && dest.end();
              dest.removeListener('drain', onDrain);
          });

        source.resume();

        return dest;
    };

    var TransduceObserver = (function (__super__) {
        inherits(TransduceObserver, __super__);
        function TransduceObserver(o, xform) {
            this._o = o;
            this._xform = xform;
            __super__.call(this);
        }

        TransduceObserver.prototype.next = function (x) {
            var res = tryCatch(this._xform['@@transducer/step']).call(this._xform, this._o, x);
            if (res === errorObj) { this._o.onError(res.e); }
        };

        TransduceObserver.prototype.error = function (e) { this._o.onError(e); };

        TransduceObserver.prototype.completed = function () {
            this._xform['@@transducer/result'](this._o);
        };

        return TransduceObserver;
    }(AbstractObserver));

    function transformForObserver(o) {
        return {
            '@@transducer/init': function () {
                return o;
            },
            '@@transducer/step': function (obs, input) {
                return obs.onNext(input);
            },
            '@@transducer/result': function (obs) {
                return obs.onCompleted();
            }
        };
    }

    /**
     * Executes a transducer to transform the observable sequence
     * @param {Transducer} transducer A transducer to execute
     * @returns {Observable} An Observable sequence containing the results from the transducer.
     */
    observableProto.transduce = function (transducer) {
        var source = this;
        return new AnonymousObservable(function (o) {
            var xform = transducer(transformForObserver(o));
            return source.subscribe(new TransduceObserver(o, xform));
        }, source);
    };

    var AnonymousObservable = Rx.AnonymousObservable = (function (__super__) {
        inherits(AnonymousObservable, __super__);

        // Fix subscriber to check for undefined or function returned to decorate as Disposable
        function fixSubscriber(subscriber) {
            return subscriber && isFunction(subscriber.dispose) ? subscriber :
              isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
        }

        function setDisposable(s, state) {
            var ado = state[0], self = state[1];
            var sub = tryCatch(self.__subscribe).call(self, ado);
            if (sub === errorObj && !ado.fail(errorObj.e)) { thrower(errorObj.e); }
            ado.setDisposable(fixSubscriber(sub));
        }

        function AnonymousObservable(subscribe, parent) {
            this.source = parent;
            this.__subscribe = subscribe;
            __super__.call(this);
        }

        AnonymousObservable.prototype._subscribe = function (o) {
            var ado = new AutoDetachObserver(o), state = [ado, this];

            if (currentThreadScheduler.scheduleRequired()) {
                currentThreadScheduler.schedule(state, setDisposable);
            } else {
                setDisposable(null, state);
            }
            return ado;
        };

        return AnonymousObservable;

    }(Observable));

    var AutoDetachObserver = (function (__super__) {
        inherits(AutoDetachObserver, __super__);

        function AutoDetachObserver(observer) {
            __super__.call(this);
            this.observer = observer;
            this.m = new SingleAssignmentDisposable();
        }

        var AutoDetachObserverPrototype = AutoDetachObserver.prototype;

        AutoDetachObserverPrototype.next = function (value) {
            var result = tryCatch(this.observer.onNext).call(this.observer, value);
            if (result === errorObj) {
                this.dispose();
                thrower(result.e);
            }
        };

        AutoDetachObserverPrototype.error = function (err) {
            var result = tryCatch(this.observer.onError).call(this.observer, err);
            this.dispose();
            result === errorObj && thrower(result.e);
        };

        AutoDetachObserverPrototype.completed = function () {
            var result = tryCatch(this.observer.onCompleted).call(this.observer);
            this.dispose();
            result === errorObj && thrower(result.e);
        };

        AutoDetachObserverPrototype.setDisposable = function (value) { this.m.setDisposable(value); };
        AutoDetachObserverPrototype.getDisposable = function () { return this.m.getDisposable(); };

        AutoDetachObserverPrototype.dispose = function () {
            __super__.prototype.dispose.call(this);
            this.m.dispose();
        };

        return AutoDetachObserver;
    }(AbstractObserver));

    var InnerSubscription = function (s, o) {
        this._s = s;
        this._o = o;
    };

    InnerSubscription.prototype.dispose = function () {
        if (!this._s.isDisposed && this._o !== null) {
            var idx = this._s.observers.indexOf(this._o);
            this._s.observers.splice(idx, 1);
            this._o = null;
        }
    };

    /**
     *  Represents an object that is both an observable sequence as well as an observer.
     *  Each notification is broadcasted to all subscribed observers.
     */
    var Subject = Rx.Subject = (function (__super__) {
        inherits(Subject, __super__);
        function Subject() {
            __super__.call(this);
            this.isDisposed = false;
            this.isStopped = false;
            this.observers = [];
            this.hasError = false;
        }

        addProperties(Subject.prototype, Observer.prototype, {
            _subscribe: function (o) {
                checkDisposed(this);
                if (!this.isStopped) {
                    this.observers.push(o);
                    return new InnerSubscription(this, o);
                }
                if (this.hasError) {
                    o.onError(this.error);
                    return disposableEmpty;
                }
                o.onCompleted();
                return disposableEmpty;
            },
            /**
             * Indicates whether the subject has observers subscribed to it.
             * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
             */
            hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
            /**
             * Notifies all subscribed observers about the end of the sequence.
             */
            onCompleted: function () {
                checkDisposed(this);
                if (!this.isStopped) {
                    this.isStopped = true;
                    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                        os[i].onCompleted();
                    }

                    this.observers.length = 0;
                }
            },
            /**
             * Notifies all subscribed observers about the exception.
             * @param {Mixed} error The exception to send to all observers.
             */
            onError: function (error) {
                checkDisposed(this);
                if (!this.isStopped) {
                    this.isStopped = true;
                    this.error = error;
                    this.hasError = true;
                    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                        os[i].onError(error);
                    }

                    this.observers.length = 0;
                }
            },
            /**
             * Notifies all subscribed observers about the arrival of the specified element in the sequence.
             * @param {Mixed} value The value to send to all observers.
             */
            onNext: function (value) {
                checkDisposed(this);
                if (!this.isStopped) {
                    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                        os[i].onNext(value);
                    }
                }
            },
            /**
             * Unsubscribe all observers and release resources.
             */
            dispose: function () {
                this.isDisposed = true;
                this.observers = null;
            }
        });

        /**
         * Creates a subject from the specified observer and observable.
         * @param {Observer} observer The observer used to send messages to the subject.
         * @param {Observable} observable The observable used to subscribe to messages sent from the subject.
         * @returns {Subject} Subject implemented using the given observer and observable.
         */
        Subject.create = function (observer, observable) {
            return new AnonymousSubject(observer, observable);
        };

        return Subject;
    }(Observable));

    /**
     *  Represents the result of an asynchronous operation.
     *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
     */
    var AsyncSubject = Rx.AsyncSubject = (function (__super__) {
        inherits(AsyncSubject, __super__);

        /**
         * Creates a subject that can only receive one value and that value is cached for all future observations.
         * @constructor
         */
        function AsyncSubject() {
            __super__.call(this);
            this.isDisposed = false;
            this.isStopped = false;
            this.hasValue = false;
            this.observers = [];
            this.hasError = false;
        }

        addProperties(AsyncSubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
                checkDisposed(this);

                if (!this.isStopped) {
                    this.observers.push(o);
                    return new InnerSubscription(this, o);
                }

                if (this.hasError) {
                    o.onError(this.error);
                } else if (this.hasValue) {
                    o.onNext(this.value);
                    o.onCompleted();
                } else {
                    o.onCompleted();
                }

                return disposableEmpty;
            },
            /**
             * Indicates whether the subject has observers subscribed to it.
             * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
             */
            hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
            /**
             * Notifies all subscribed observers about the end of the sequence, also causing the last received value to be sent out (if any).
             */
            onCompleted: function () {
                var i, len;
                checkDisposed(this);
                if (!this.isStopped) {
                    this.isStopped = true;
                    var os = cloneArray(this.observers), len = os.length;

                    if (this.hasValue) {
                        for (i = 0; i < len; i++) {
                            var o = os[i];
                            o.onNext(this.value);
                            o.onCompleted();
                        }
                    } else {
                        for (i = 0; i < len; i++) {
                            os[i].onCompleted();
                        }
                    }

                    this.observers.length = 0;
                }
            },
            /**
             * Notifies all subscribed observers about the error.
             * @param {Mixed} error The Error to send to all observers.
             */
            onError: function (error) {
                checkDisposed(this);
                if (!this.isStopped) {
                    this.isStopped = true;
                    this.hasError = true;
                    this.error = error;

                    for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                        os[i].onError(error);
                    }

                    this.observers.length = 0;
                }
            },
            /**
             * Sends a value to the subject. The last value received before successful termination will be sent to all subscribed and future observers.
             * @param {Mixed} value The value to store in the subject.
             */
            onNext: function (value) {
                checkDisposed(this);
                if (this.isStopped) { return; }
                this.value = value;
                this.hasValue = true;
            },
            /**
             * Unsubscribe all observers and release resources.
             */
            dispose: function () {
                this.isDisposed = true;
                this.observers = null;
                this.error = null;
                this.value = null;
            }
        });

        return AsyncSubject;
    }(Observable));

    var AnonymousSubject = Rx.AnonymousSubject = (function (__super__) {
        inherits(AnonymousSubject, __super__);
        function AnonymousSubject(observer, observable) {
            this.observer = observer;
            this.observable = observable;
            __super__.call(this);
        }

        addProperties(AnonymousSubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
                return this.observable.subscribe(o);
            },
            onCompleted: function () {
                this.observer.onCompleted();
            },
            onError: function (error) {
                this.observer.onError(error);
            },
            onNext: function (value) {
                this.observer.onNext(value);
            }
        });

        return AnonymousSubject;
    }(Observable));

    /**
     *  Represents a value that changes over time.
     *  Observers can subscribe to the subject to receive the last (or initial) value and all subsequent notifications.
     */
    var BehaviorSubject = Rx.BehaviorSubject = (function (__super__) {
        inherits(BehaviorSubject, __super__);
        function BehaviorSubject(value) {
            __super__.call(this);
            this.value = value;
            this.observers = [];
            this.isDisposed = false;
            this.isStopped = false;
            this.hasError = false;
        }

        addProperties(BehaviorSubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
                checkDisposed(this);
                if (!this.isStopped) {
                    this.observers.push(o);
                    o.onNext(this.value);
                    return new InnerSubscription(this, o);
                }
                if (this.hasError) {
                    o.onError(this.error);
                } else {
                    o.onCompleted();
                }
                return disposableEmpty;
            },
            /**
             * Gets the current value or throws an exception.
             * Value is frozen after onCompleted is called.
             * After onError is called always throws the specified exception.
             * An exception is always thrown after dispose is called.
             * @returns {Mixed} The initial value passed to the constructor until onNext is called; after which, the last value passed to onNext.
             */
            getValue: function () {
                checkDisposed(this);
                if (this.hasError) { thrower(this.error); }
                return this.value;
            },
            /**
             * Indicates whether the subject has observers subscribed to it.
             * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
             */
            hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
            /**
             * Notifies all subscribed observers about the end of the sequence.
             */
            onCompleted: function () {
                checkDisposed(this);
                if (this.isStopped) { return; }
                this.isStopped = true;
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                    os[i].onCompleted();
                }

                this.observers.length = 0;
            },
            /**
             * Notifies all subscribed observers about the exception.
             * @param {Mixed} error The exception to send to all observers.
             */
            onError: function (error) {
                checkDisposed(this);
                if (this.isStopped) { return; }
                this.isStopped = true;
                this.hasError = true;
                this.error = error;

                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                    os[i].onError(error);
                }

                this.observers.length = 0;
            },
            /**
             * Notifies all subscribed observers about the arrival of the specified element in the sequence.
             * @param {Mixed} value The value to send to all observers.
             */
            onNext: function (value) {
                checkDisposed(this);
                if (this.isStopped) { return; }
                this.value = value;
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                    os[i].onNext(value);
                }
            },
            /**
             * Unsubscribe all observers and release resources.
             */
            dispose: function () {
                this.isDisposed = true;
                this.observers = null;
                this.value = null;
                this.error = null;
            }
        });

        return BehaviorSubject;
    }(Observable));

    /**
     * Represents an object that is both an observable sequence as well as an observer.
     * Each notification is broadcasted to all subscribed and future observers, subject to buffer trimming policies.
     */
    var ReplaySubject = Rx.ReplaySubject = (function (__super__) {

        var maxSafeInteger = Math.pow(2, 53) - 1;

        function createRemovableDisposable(subject, observer) {
            return disposableCreate(function () {
                observer.dispose();
                !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);
            });
        }

        inherits(ReplaySubject, __super__);

        /**
         *  Initializes a new instance of the ReplaySubject class with the specified buffer size, window size and scheduler.
         *  @param {Number} [bufferSize] Maximum element count of the replay buffer.
         *  @param {Number} [windowSize] Maximum time length of the replay buffer.
         *  @param {Scheduler} [scheduler] Scheduler the observers are invoked on.
         */
        function ReplaySubject(bufferSize, windowSize, scheduler) {
            this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
            this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
            this.scheduler = scheduler || currentThreadScheduler;
            this.q = [];
            this.observers = [];
            this.isStopped = false;
            this.isDisposed = false;
            this.hasError = false;
            this.error = null;
            __super__.call(this);
        }

        addProperties(ReplaySubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
                checkDisposed(this);
                var so = new ScheduledObserver(this.scheduler, o), subscription = createRemovableDisposable(this, so);

                this._trim(this.scheduler.now());
                this.observers.push(so);

                for (var i = 0, len = this.q.length; i < len; i++) {
                    so.onNext(this.q[i].value);
                }

                if (this.hasError) {
                    so.onError(this.error);
                } else if (this.isStopped) {
                    so.onCompleted();
                }

                so.ensureActive();
                return subscription;
            },
            /**
             * Indicates whether the subject has observers subscribed to it.
             * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
             */
            hasObservers: function () { checkDisposed(this); return this.observers.length > 0; },
            _trim: function (now) {
                while (this.q.length > this.bufferSize) {
                    this.q.shift();
                }
                while (this.q.length > 0 && (now - this.q[0].interval) > this.windowSize) {
                    this.q.shift();
                }
            },
            /**
             * Notifies all subscribed observers about the arrival of the specified element in the sequence.
             * @param {Mixed} value The value to send to all observers.
             */
            onNext: function (value) {
                checkDisposed(this);
                if (this.isStopped) { return; }
                var now = this.scheduler.now();
                this.q.push({ interval: now, value: value });
                this._trim(now);

                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                    var observer = os[i];
                    observer.onNext(value);
                    observer.ensureActive();
                }
            },
            /**
             * Notifies all subscribed observers about the exception.
             * @param {Mixed} error The exception to send to all observers.
             */
            onError: function (error) {
                checkDisposed(this);
                if (this.isStopped) { return; }
                this.isStopped = true;
                this.error = error;
                this.hasError = true;
                var now = this.scheduler.now();
                this._trim(now);
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                    var observer = os[i];
                    observer.onError(error);
                    observer.ensureActive();
                }
                this.observers.length = 0;
            },
            /**
             * Notifies all subscribed observers about the end of the sequence.
             */
            onCompleted: function () {
                checkDisposed(this);
                if (this.isStopped) { return; }
                this.isStopped = true;
                var now = this.scheduler.now();
                this._trim(now);
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                    var observer = os[i];
                    observer.onCompleted();
                    observer.ensureActive();
                }
                this.observers.length = 0;
            },
            /**
             * Unsubscribe all observers and release resources.
             */
            dispose: function () {
                this.isDisposed = true;
                this.observers = null;
            }
        });

        return ReplaySubject;
    }(Observable));

    /**
    * Used to pause and resume streams.
    */
    Rx.Pauser = (function (__super__) {
        inherits(Pauser, __super__);
        function Pauser() {
            __super__.call(this);
        }

        /**
         * Pauses the underlying sequence.
         */
        Pauser.prototype.pause = function () { this.onNext(false); };

        /**
        * Resumes the underlying sequence.
        */
        Pauser.prototype.resume = function () { this.onNext(true); };

        return Pauser;
    }(Subject));
    
    __LMtarget.Rx = Rx;

    // All code before this point will be filtered from stack traces.
    var rEndingLine = captureLine();

}.call(this, __LiteMolRxTemp, __LiteMolPromise));

var __LiteMolRx = __LiteMolRxTemp.Rx;
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    CIFTools.VERSION = { number: "1.1.6", date: "June 26 2017" };
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Utils;
    (function (Utils) {
        var ChunkedArray;
        (function (ChunkedArray) {
            function is(x) {
                return x.creator && x.chunkSize;
            }
            ChunkedArray.is = is;
            function add4(array, x, y, z, w) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                array.current[array.currentIndex++] = y;
                array.current[array.currentIndex++] = z;
                array.current[array.currentIndex++] = w;
                return array.elementCount++;
            }
            ChunkedArray.add4 = add4;
            function add3(array, x, y, z) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                array.current[array.currentIndex++] = y;
                array.current[array.currentIndex++] = z;
                return array.elementCount++;
            }
            ChunkedArray.add3 = add3;
            function add2(array, x, y) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                array.current[array.currentIndex++] = y;
                return array.elementCount++;
            }
            ChunkedArray.add2 = add2;
            function add(array, x) {
                if (array.currentIndex >= array.chunkSize) {
                    array.currentIndex = 0;
                    array.current = array.creator(array.chunkSize);
                    array.parts[array.parts.length] = array.current;
                }
                array.current[array.currentIndex++] = x;
                return array.elementCount++;
            }
            ChunkedArray.add = add;
            function compact(array) {
                var ret = array.creator(array.elementSize * array.elementCount), offset = (array.parts.length - 1) * array.chunkSize, offsetInner = 0, part;
                if (array.parts.length > 1) {
                    if (array.parts[0].buffer) {
                        for (var i = 0; i < array.parts.length - 1; i++) {
                            ret.set(array.parts[i], array.chunkSize * i);
                        }
                    }
                    else {
                        for (var i = 0; i < array.parts.length - 1; i++) {
                            offsetInner = array.chunkSize * i;
                            part = array.parts[i];
                            for (var j = 0; j < array.chunkSize; j++) {
                                ret[offsetInner + j] = part[j];
                            }
                        }
                    }
                }
                if (array.current.buffer && array.currentIndex >= array.chunkSize) {
                    ret.set(array.current, array.chunkSize * (array.parts.length - 1));
                }
                else {
                    for (var i = 0; i < array.currentIndex; i++) {
                        ret[offset + i] = array.current[i];
                    }
                }
                return ret;
            }
            ChunkedArray.compact = compact;
            function forVertex3D(chunkVertexCount) {
                if (chunkVertexCount === void 0) { chunkVertexCount = 262144; }
                return create(function (size) { return new Float32Array(size); }, chunkVertexCount, 3);
            }
            ChunkedArray.forVertex3D = forVertex3D;
            function forIndexBuffer(chunkIndexCount) {
                if (chunkIndexCount === void 0) { chunkIndexCount = 262144; }
                return create(function (size) { return new Uint32Array(size); }, chunkIndexCount, 3);
            }
            ChunkedArray.forIndexBuffer = forIndexBuffer;
            function forTokenIndices(chunkTokenCount) {
                if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 2);
            }
            ChunkedArray.forTokenIndices = forTokenIndices;
            function forIndices(chunkTokenCount) {
                if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 1);
            }
            ChunkedArray.forIndices = forIndices;
            function forInt32(chunkSize) {
                if (chunkSize === void 0) { chunkSize = 131072; }
                return create(function (size) { return new Int32Array(size); }, chunkSize, 1);
            }
            ChunkedArray.forInt32 = forInt32;
            function forFloat32(chunkSize) {
                if (chunkSize === void 0) { chunkSize = 131072; }
                return create(function (size) { return new Float32Array(size); }, chunkSize, 1);
            }
            ChunkedArray.forFloat32 = forFloat32;
            function forArray(chunkSize) {
                if (chunkSize === void 0) { chunkSize = 131072; }
                return create(function (size) { return []; }, chunkSize, 1);
            }
            ChunkedArray.forArray = forArray;
            function create(creator, chunkElementCount, elementSize) {
                chunkElementCount = chunkElementCount | 0;
                if (chunkElementCount <= 0)
                    chunkElementCount = 1;
                var chunkSize = chunkElementCount * elementSize;
                var current = creator(chunkSize);
                return {
                    elementSize: elementSize,
                    chunkSize: chunkSize,
                    creator: creator,
                    current: current,
                    parts: [current],
                    currentIndex: 0,
                    elementCount: 0
                };
            }
            ChunkedArray.create = create;
        })(ChunkedArray = Utils.ChunkedArray || (Utils.ChunkedArray = {}));
    })(Utils = CIFTools.Utils || (CIFTools.Utils = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
/**
 * Efficient integer and float parsers.
 *
 * For the purposes of parsing numbers from the mmCIF data representations,
 * up to 4 times faster than JS parseInt/parseFloat.
 */
var CIFTools;
(function (CIFTools) {
    var Utils;
    (function (Utils) {
        var FastNumberParsers;
        (function (FastNumberParsers) {
            "use strict";
            function parseIntSkipTrailingWhitespace(str, start, end) {
                while (start < end && str.charCodeAt(start) === 32)
                    start++;
                return parseInt(str, start, end);
            }
            FastNumberParsers.parseIntSkipTrailingWhitespace = parseIntSkipTrailingWhitespace;
            function parseInt(str, start, end) {
                var ret = 0, neg = 1;
                if (str.charCodeAt(start) === 45 /* - */) {
                    neg = -1;
                    start++;
                }
                for (; start < end; start++) {
                    var c = str.charCodeAt(start) - 48;
                    if (c > 9 || c < 0)
                        return (neg * ret) | 0;
                    else
                        ret = (10 * ret + c) | 0;
                }
                return neg * ret;
            }
            FastNumberParsers.parseInt = parseInt;
            function parseScientific(main, str, start, end) {
                // handle + in '1e+1' separately.
                if (str.charCodeAt(start) === 43 /* + */)
                    start++;
                return main * Math.pow(10.0, parseInt(str, start, end));
            }
            function parseFloatSkipTrailingWhitespace(str, start, end) {
                while (start < end && str.charCodeAt(start) === 32)
                    start++;
                return parseFloat(str, start, end);
            }
            FastNumberParsers.parseFloatSkipTrailingWhitespace = parseFloatSkipTrailingWhitespace;
            function parseFloat(str, start, end) {
                var neg = 1.0, ret = 0.0, point = 0.0, div = 1.0;
                if (str.charCodeAt(start) === 45) {
                    neg = -1.0;
                    ++start;
                }
                while (start < end) {
                    var c = str.charCodeAt(start) - 48;
                    if (c >= 0 && c < 10) {
                        ret = ret * 10 + c;
                        ++start;
                    }
                    else if (c === -2) {
                        ++start;
                        while (start < end) {
                            c = str.charCodeAt(start) - 48;
                            if (c >= 0 && c < 10) {
                                point = 10.0 * point + c;
                                div = 10.0 * div;
                                ++start;
                            }
                            else if (c === 53 || c === 21) {
                                return parseScientific(neg * (ret + point / div), str, start + 1, end);
                            }
                            else {
                                return neg * (ret + point / div);
                            }
                        }
                        return neg * (ret + point / div);
                    }
                    else if (c === 53 || c === 21) {
                        return parseScientific(neg * ret, str, start + 1, end);
                    }
                    else
                        break;
                }
                return neg * ret;
            }
            FastNumberParsers.parseFloat = parseFloat;
        })(FastNumberParsers = Utils.FastNumberParsers || (Utils.FastNumberParsers = {}));
    })(Utils = CIFTools.Utils || (CIFTools.Utils = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Utils;
    (function (Utils) {
        var __paddingSpaces = [];
        (function () {
            var s = '';
            for (var i = 0; i < 512; i++) {
                __paddingSpaces[i] = s;
                s = s + ' ';
            }
        })();
        var StringWriter;
        (function (StringWriter) {
            function create(chunkCapacity) {
                if (chunkCapacity === void 0) { chunkCapacity = 512; }
                return {
                    chunkData: [],
                    chunkOffset: 0,
                    chunkCapacity: chunkCapacity,
                    data: []
                };
            }
            StringWriter.create = create;
            function asString(writer) {
                if (!writer.data.length) {
                    if (writer.chunkData.length === writer.chunkOffset)
                        return writer.chunkData.join('');
                    return writer.chunkData.splice(0, writer.chunkOffset).join('');
                }
                if (writer.chunkOffset > 0) {
                    writer.data[writer.data.length] = writer.chunkData.splice(0, writer.chunkOffset).join('');
                }
                return writer.data.join('');
            }
            StringWriter.asString = asString;
            function writeTo(writer, stream) {
                finalize(writer);
                for (var _i = 0, _a = writer.data; _i < _a.length; _i++) {
                    var s = _a[_i];
                    stream.writeString(s);
                }
            }
            StringWriter.writeTo = writeTo;
            function finalize(writer) {
                if (writer.chunkOffset > 0) {
                    if (writer.chunkData.length === writer.chunkOffset)
                        writer.data[writer.data.length] = writer.chunkData.join('');
                    else
                        writer.data[writer.data.length] = writer.chunkData.splice(0, writer.chunkOffset).join('');
                    writer.chunkOffset = 0;
                }
            }
            function newline(writer) {
                write(writer, '\n');
            }
            StringWriter.newline = newline;
            function whitespace(writer, len) {
                write(writer, __paddingSpaces[len]);
            }
            StringWriter.whitespace = whitespace;
            function write(writer, val) {
                if (val === undefined || val === null) {
                    return;
                }
                if (writer.chunkOffset === writer.chunkCapacity) {
                    writer.data[writer.data.length] = writer.chunkData.join('');
                    writer.chunkOffset = 0;
                }
                writer.chunkData[writer.chunkOffset++] = val;
            }
            StringWriter.write = write;
            function writeSafe(writer, val) {
                if (writer.chunkOffset === writer.chunkCapacity) {
                    writer.data[writer.data.length] = writer.chunkData.join('');
                    writer.chunkOffset = 0;
                }
                writer.chunkData[writer.chunkOffset++] = val;
            }
            StringWriter.writeSafe = writeSafe;
            function writePadLeft(writer, val, totalWidth) {
                if (val === undefined || val === null) {
                    write(writer, __paddingSpaces[totalWidth]);
                }
                var padding = totalWidth - val.length;
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
                write(writer, val);
            }
            StringWriter.writePadLeft = writePadLeft;
            function writePadRight(writer, val, totalWidth) {
                if (val === undefined || val === null) {
                    write(writer, __paddingSpaces[totalWidth]);
                }
                var padding = totalWidth - val.length;
                write(writer, val);
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
            }
            StringWriter.writePadRight = writePadRight;
            function writeInteger(writer, val) {
                write(writer, '' + val);
            }
            StringWriter.writeInteger = writeInteger;
            function writeIntegerPadLeft(writer, val, totalWidth) {
                var s = '' + val;
                var padding = totalWidth - s.length;
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
                write(writer, s);
            }
            StringWriter.writeIntegerPadLeft = writeIntegerPadLeft;
            function writeIntegerPadRight(writer, val, totalWidth) {
                var s = '' + val;
                var padding = totalWidth - s.length;
                write(writer, s);
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
            }
            StringWriter.writeIntegerPadRight = writeIntegerPadRight;
            /**
             * @example writeFloat(123.2123, 100) -- 2 decim
             */
            function writeFloat(writer, val, precisionMultiplier) {
                write(writer, '' + Math.round(precisionMultiplier * val) / precisionMultiplier);
            }
            StringWriter.writeFloat = writeFloat;
            function writeFloatPadLeft(writer, val, precisionMultiplier, totalWidth) {
                var s = '' + Math.round(precisionMultiplier * val) / precisionMultiplier;
                var padding = totalWidth - s.length;
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
                write(writer, s);
            }
            StringWriter.writeFloatPadLeft = writeFloatPadLeft;
            function writeFloatPadRight(writer, val, precisionMultiplier, totalWidth) {
                var s = '' + Math.round(precisionMultiplier * val) / precisionMultiplier;
                var padding = totalWidth - s.length;
                write(writer, s);
                if (padding > 0)
                    write(writer, __paddingSpaces[padding]);
            }
            StringWriter.writeFloatPadRight = writeFloatPadRight;
        })(StringWriter = Utils.StringWriter || (Utils.StringWriter = {}));
    })(Utils = CIFTools.Utils || (CIFTools.Utils = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    "use strict";
    /**
     * Represents a column that is not present.
     */
    var _UndefinedColumn = (function () {
        function _UndefinedColumn() {
            this.isDefined = false;
        }
        _UndefinedColumn.prototype.getString = function (row) { return null; };
        ;
        _UndefinedColumn.prototype.getInteger = function (row) { return 0; };
        _UndefinedColumn.prototype.getFloat = function (row) { return 0.0; };
        _UndefinedColumn.prototype.getValuePresence = function (row) { return 1 /* NotSpecified */; };
        _UndefinedColumn.prototype.areValuesEqual = function (rowA, rowB) { return true; };
        _UndefinedColumn.prototype.stringEquals = function (row, value) { return value === null; };
        return _UndefinedColumn;
    }());
    CIFTools.UndefinedColumn = new _UndefinedColumn();
    /**
     * Helper functions for categoies.
     */
    var Category;
    (function (Category) {
        /**
         * Extracts a matrix from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getMatrix(category, field, rows, cols, rowIndex) {
            var ret = [];
            for (var i = 1; i <= rows; i++) {
                var row = [];
                for (var j = 1; j <= cols; j++) {
                    row[j - 1] = category.getColumn(field + "[" + i + "][" + j + "]").getFloat(rowIndex);
                }
                ret[i - 1] = row;
            }
            return ret;
        }
        Category.getMatrix = getMatrix;
        /**
         * Extracts a vector from a category from a specified rowIndex.
         *
         * _category.matrix[1][1] v11
         * ....
         * ....
         * _category.matrix[rows][cols] vRowsCols
         */
        function getVector(category, field, rows, cols, rowIndex) {
            var ret = [];
            for (var i = 1; i <= rows; i++) {
                ret[i - 1] = category.getColumn(field + "[" + i + "]").getFloat(rowIndex);
            }
            return ret;
        }
        Category.getVector = getVector;
    })(Category = CIFTools.Category || (CIFTools.Category = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    "use strict";
    var ParserResult;
    (function (ParserResult) {
        function error(message, line) {
            if (line === void 0) { line = -1; }
            return new ParserError(message, line);
        }
        ParserResult.error = error;
        function success(result, warnings) {
            if (warnings === void 0) { warnings = []; }
            return new ParserSuccess(result, warnings);
        }
        ParserResult.success = success;
    })(ParserResult = CIFTools.ParserResult || (CIFTools.ParserResult = {}));
    var ParserError = (function () {
        function ParserError(message, line) {
            this.message = message;
            this.line = line;
            this.isError = true;
        }
        ParserError.prototype.toString = function () {
            if (this.line >= 0) {
                return "[Line " + this.line + "] " + this.message;
            }
            return this.message;
        };
        return ParserError;
    }());
    CIFTools.ParserError = ParserError;
    var ParserSuccess = (function () {
        function ParserSuccess(result, warnings) {
            this.result = result;
            this.warnings = warnings;
            this.isError = false;
        }
        return ParserSuccess;
    }());
    CIFTools.ParserSuccess = ParserSuccess;
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
/*
    On data representation of molecular files

    Consider an mmCIF file that stores a molecule with 100k atoms. For the sake of simplicity,
    lets ignore things like symmetry or assemblies, and assume, that the file only stores the
    _atom_site records. The atom site "table" in the standard mmCIF from PDB database currently
    has 26 columns.

    So the data looks something like this:

        loop_
        _atom_site.column1
        ....
        _atom_site.column26
        t1,1 .... t1,26
        t100000,1 .... t100000,26

    The straightforward way to represent this data in JavaScript is to have an array of objects
    with properties named "column1" ..., "column26":

        [{ column1: "t1,1", ..., column26: "t1,26" },
          ...,
         { column1: "t100000,1", ..., column26: "t100000,26" }]

    So in order to represent the atoms sites, we would need 100k objects and 2.6 million strings.
    Is this bad? well, sort of. It would not be so bad if this representation would be the only
    thing we need to keep in memory and/or the life time of the object was short. But usually
    we would need to keep the object around for the entire lifetime of the app. This alone
    adds a very non-significant overhead for the garbage collector (which increases the app's
    latency). What's worse is that we usually only need a fraction of this data, but this can
    vary application for application. For just 100k atoms, the overhead is not "that bad", but
    consider 1M atoms and suddenly we have a problem.

    The following data model shows an alternative way of storing molecular file s
    in memory that is very efficient, fast and introduces a very minimal overhead.

 */
var CIFTools;
(function (CIFTools) {
    var Text;
    (function (Text) {
        "use strict";
        var ShortStringPool;
        (function (ShortStringPool) {
            function create() { return Object.create(null); }
            ShortStringPool.create = create;
            function get(pool, str) {
                if (str.length > 6)
                    return str;
                var value = pool[str];
                if (value !== void 0)
                    return value;
                pool[str] = str;
                return str;
            }
            ShortStringPool.get = get;
        })(ShortStringPool || (ShortStringPool = {}));
        /**
         * Represents the input file.
         */
        var File = (function () {
            function File(data) {
                /**
                 * Data blocks inside the file. If no data block is present, a "default" one is created.
                 */
                this.dataBlocks = [];
                this.data = data;
            }
            File.prototype.toJSON = function () {
                return this.dataBlocks.map(function (b) { return b.toJSON(); });
            };
            return File;
        }());
        Text.File = File;
        /**
         * Represents a single data block.
         */
        var DataBlock = (function () {
            function DataBlock(data, header) {
                this.header = header;
                this.data = data;
                this.categoryList = [];
                this.additionalData = {};
                this.categoryMap = new Map();
            }
            Object.defineProperty(DataBlock.prototype, "categories", {
                /**
                 * Categories of the block.
                 * block.categories._atom_site / ['_atom_site']
                 */
                get: function () {
                    return this.categoryList;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets a category by its name.
             */
            DataBlock.prototype.getCategory = function (name) {
                return this.categoryMap.get(name);
            };
            /**
             * Adds a category.
             */
            DataBlock.prototype.addCategory = function (category) {
                this.categoryList[this.categoryList.length] = category;
                this.categoryMap.set(category.name, category);
            };
            DataBlock.prototype.toJSON = function () {
                return {
                    id: this.header,
                    categories: this.categoryList.map(function (c) { return c.toJSON(); }),
                    additionalData: this.additionalData
                };
            };
            return DataBlock;
        }());
        Text.DataBlock = DataBlock;
        /**
         * Represents a single CIF category.
         */
        var Category = (function () {
            function Category(data, name, startIndex, endIndex, columns, tokens, tokenCount) {
                this.name = name;
                this.tokens = tokens;
                this.data = data;
                this.startIndex = startIndex;
                this.endIndex = endIndex;
                this.columnCount = columns.length;
                this.rowCount = (tokenCount / columns.length) | 0;
                this.columnIndices = new Map();
                this.columnNameList = [];
                for (var i = 0; i < columns.length; i++) {
                    var colName = columns[i].substr(name.length + 1);
                    this.columnIndices.set(colName, i);
                    this.columnNameList.push(colName);
                }
            }
            Object.defineProperty(Category.prototype, "columnNames", {
                /**
                 * The array of columns.
                 */
                get: function () {
                    return this.columnNameList;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Get a column object that makes accessing data easier.
             * @returns undefined if the column isn't present, the Column object otherwise.
             */
            Category.prototype.getColumn = function (name) {
                var i = this.columnIndices.get(name);
                if (i !== void 0)
                    return new Column(this, this.data, name, i);
                return CIFTools.UndefinedColumn;
            };
            Category.prototype.toJSON = function () {
                var rows = [], data = this.data, tokens = this.tokens;
                var colNames = this.columnNameList;
                var strings = ShortStringPool.create();
                for (var i = 0; i < this.rowCount; i++) {
                    var item = {};
                    for (var j = 0; j < this.columnCount; j++) {
                        var tk = (i * this.columnCount + j) * 2;
                        item[colNames[j]] = ShortStringPool.get(strings, data.substring(tokens[tk], tokens[tk + 1]));
                    }
                    rows[i] = item;
                }
                return { name: this.name, columns: colNames, rows: rows };
            };
            return Category;
        }());
        Text.Category = Category;
        var fastParseInt = CIFTools.Utils.FastNumberParsers.parseInt;
        var fastParseFloat = CIFTools.Utils.FastNumberParsers.parseFloat;
        /**
         * Represents a single column of a CIF category.
         */
        var Column = (function () {
            function Column(category, data, name, index) {
                this.data = data;
                this.name = name;
                this.index = index;
                this.stringPool = ShortStringPool.create();
                this.isDefined = true;
                this.tokens = category.tokens;
                this.columnCount = category.columnCount;
            }
            /**
             * Returns the string value at given row.
             */
            Column.prototype.getString = function (row) {
                var i = (row * this.columnCount + this.index) * 2;
                var ret = ShortStringPool.get(this.stringPool, this.data.substring(this.tokens[i], this.tokens[i + 1]));
                if (ret === "." || ret === "?")
                    return null;
                return ret;
            };
            /**
             * Returns the integer value at given row.
             */
            Column.prototype.getInteger = function (row) {
                var i = (row * this.columnCount + this.index) * 2;
                return fastParseInt(this.data, this.tokens[i], this.tokens[i + 1]);
            };
            /**
             * Returns the float value at given row.
             */
            Column.prototype.getFloat = function (row) {
                var i = (row * this.columnCount + this.index) * 2;
                return fastParseFloat(this.data, this.tokens[i], this.tokens[i + 1]);
            };
            /**
             * Returns true if the token has the specified string value.
             */
            Column.prototype.stringEquals = function (row, value) {
                var aIndex = (row * this.columnCount + this.index) * 2, s = this.tokens[aIndex], len = value.length;
                if (len !== this.tokens[aIndex + 1] - s)
                    return false;
                for (var i = 0; i < len; i++) {
                    if (this.data.charCodeAt(i + s) !== value.charCodeAt(i))
                        return false;
                }
                return true;
            };
            /**
             * Determines if values at the given rows are equal.
             */
            Column.prototype.areValuesEqual = function (rowA, rowB) {
                var aIndex = (rowA * this.columnCount + this.index) * 2, bIndex = (rowB * this.columnCount + this.index) * 2;
                var aS = this.tokens[aIndex], bS = this.tokens[bIndex], len = this.tokens[aIndex + 1] - aS;
                if (len !== this.tokens[bIndex + 1] - bS)
                    return false;
                for (var i = 0; i < len; i++) {
                    if (this.data.charCodeAt(i + aS) !== this.data.charCodeAt(i + bS)) {
                        return false;
                    }
                }
                return true;
            };
            /**
             * Returns true if the value is not defined (. or ? token).
             */
            Column.prototype.getValuePresence = function (row) {
                var index = row * this.columnCount + this.index;
                var s = this.tokens[2 * index];
                if (this.tokens[2 * index + 1] - s !== 1)
                    return 0 /* Present */;
                var v = this.data.charCodeAt(s);
                if (v === 46 /* . */)
                    return 1 /* NotSpecified */;
                if (v === 63 /* ? */)
                    return 2 /* Unknown */;
                return 0 /* Present */;
            };
            return Column;
        }());
        Text.Column = Column;
    })(Text = CIFTools.Text || (CIFTools.Text = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Text;
    (function (Text) {
        "use strict";
        var TokenIndexBuilder;
        (function (TokenIndexBuilder) {
            function resize(builder) {
                // scale the size using golden ratio, because why not.
                var newBuffer = new Int32Array((1.61 * builder.tokens.length) | 0);
                newBuffer.set(builder.tokens);
                builder.tokens = newBuffer;
                builder.tokensLenMinus2 = (newBuffer.length - 2) | 0;
            }
            function addToken(builder, start, end) {
                if (builder.count >= builder.tokensLenMinus2) {
                    resize(builder);
                }
                builder.tokens[builder.count++] = start;
                builder.tokens[builder.count++] = end;
            }
            TokenIndexBuilder.addToken = addToken;
            function create(size) {
                return {
                    tokensLenMinus2: (size - 2) | 0,
                    count: 0,
                    tokens: new Int32Array(size)
                };
            }
            TokenIndexBuilder.create = create;
        })(TokenIndexBuilder || (TokenIndexBuilder = {}));
        /**
         * Eat everything until a whitespace/newline occurs.
         */
        function eatValue(state) {
            while (state.position < state.length) {
                switch (state.data.charCodeAt(state.position)) {
                    case 9: // \t
                    case 10: // \n
                    case 13: // \r
                    case 32:
                        state.currentTokenEnd = state.position;
                        return;
                    default:
                        ++state.position;
                        break;
                }
            }
            state.currentTokenEnd = state.position;
        }
        /**
         * Eats an escaped values. Handles the "degenerate" cases as well.
         *
         * "Degenerate" cases:
         * - 'xx'x' => xx'x
         * - 'xxxNEWLINE => 'xxx
         *
         */
        function eatEscaped(state, esc) {
            var next, c;
            ++state.position;
            while (state.position < state.length) {
                c = state.data.charCodeAt(state.position);
                if (c === esc) {
                    next = state.data.charCodeAt(state.position + 1);
                    switch (next) {
                        case 9: // \t
                        case 10: // \n
                        case 13: // \r
                        case 32:
                            // get rid of the quotes.
                            state.currentTokenStart++;
                            state.currentTokenEnd = state.position;
                            state.isEscaped = true;
                            ++state.position;
                            return;
                        default:
                            if (next === void 0) {
                                // get rid of the quotes.
                                state.currentTokenStart++;
                                state.currentTokenEnd = state.position;
                                state.isEscaped = true;
                                ++state.position;
                                return;
                            }
                            ++state.position;
                            break;
                    }
                }
                else {
                    // handle 'xxxNEWLINE => 'xxx
                    if (c === 10 || c === 13) {
                        state.currentTokenEnd = state.position;
                        return;
                    }
                    ++state.position;
                }
            }
            state.currentTokenEnd = state.position;
        }
        /**
         * Eats a multiline token of the form NL;....NL;
         */
        function eatMultiline(state) {
            var prev = 59, pos = state.position + 1, c;
            while (pos < state.length) {
                c = state.data.charCodeAt(pos);
                if (c === 59 && (prev === 10 || prev === 13)) {
                    state.position = pos + 1;
                    // get rid of the ;
                    state.currentTokenStart++;
                    // remove trailing newlines
                    pos--;
                    c = state.data.charCodeAt(pos);
                    while (c === 10 || c === 13) {
                        pos--;
                        c = state.data.charCodeAt(pos);
                    }
                    state.currentTokenEnd = pos + 1;
                    state.isEscaped = true;
                    return;
                }
                else {
                    // handle line numbers
                    if (c === 13) {
                        state.currentLineNumber++;
                    }
                    else if (c === 10 && prev !== 13) {
                        state.currentLineNumber++;
                    }
                    prev = c;
                    ++pos;
                }
            }
            state.position = pos;
            return prev;
        }
        /**
         * Skips until \n or \r occurs -- therefore the newlines get handled by the "skipWhitespace" function.
         */
        function skipCommentLine(state) {
            while (state.position < state.length) {
                var c = state.data.charCodeAt(state.position);
                if (c === 10 || c === 13) {
                    return;
                }
                ++state.position;
            }
        }
        /**
         * Skips all the whitespace - space, tab, newline, CR
         * Handles incrementing line count.
         */
        function skipWhitespace(state) {
            var prev = 10;
            while (state.position < state.length) {
                var c = state.data.charCodeAt(state.position);
                switch (c) {
                    case 9: // '\t'
                    case 32:
                        prev = c;
                        ++state.position;
                        break;
                    case 10:
                        // handle \r\n
                        if (prev !== 13) {
                            ++state.currentLineNumber;
                        }
                        prev = c;
                        ++state.position;
                        break;
                    case 13:
                        prev = c;
                        ++state.position;
                        ++state.currentLineNumber;
                        break;
                    default:
                        return prev;
                }
            }
            return prev;
        }
        function isData(state) {
            // here we already assume the 5th char is _ and that the length >= 5
            // d/D
            var c = state.data.charCodeAt(state.currentTokenStart);
            if (c !== 68 && c !== 100)
                return false;
            // a/A
            c = state.data.charCodeAt(state.currentTokenStart + 1);
            if (c !== 65 && c !== 97)
                return false;
            // t/t
            c = state.data.charCodeAt(state.currentTokenStart + 2);
            if (c !== 84 && c !== 116)
                return false;
            // a/A
            c = state.data.charCodeAt(state.currentTokenStart + 3);
            if (c !== 65 && c !== 97)
                return false;
            return true;
        }
        function isSave(state) {
            // here we already assume the 5th char is _ and that the length >= 5
            // s/S
            var c = state.data.charCodeAt(state.currentTokenStart);
            if (c !== 83 && c !== 115)
                return false;
            // a/A
            c = state.data.charCodeAt(state.currentTokenStart + 1);
            if (c !== 65 && c !== 97)
                return false;
            // v/V
            c = state.data.charCodeAt(state.currentTokenStart + 2);
            if (c !== 86 && c !== 118)
                return false;
            // e/E
            c = state.data.charCodeAt(state.currentTokenStart + 3);
            if (c !== 69 && c !== 101)
                return false;
            return true;
        }
        function isLoop(state) {
            // here we already assume the 5th char is _ and that the length >= 5
            if (state.currentTokenEnd - state.currentTokenStart !== 5)
                return false;
            // l/L
            var c = state.data.charCodeAt(state.currentTokenStart);
            if (c !== 76 && c !== 108)
                return false;
            // o/O
            c = state.data.charCodeAt(state.currentTokenStart + 1);
            if (c !== 79 && c !== 111)
                return false;
            // o/O
            c = state.data.charCodeAt(state.currentTokenStart + 2);
            if (c !== 79 && c !== 111)
                return false;
            // p/P
            c = state.data.charCodeAt(state.currentTokenStart + 3);
            if (c !== 80 && c !== 112)
                return false;
            return true;
        }
        /**
         * Checks if the current token shares the namespace with string at <start,end).
         */
        function isNamespace(state, start, end) {
            var i, nsLen = end - start, offset = state.currentTokenStart - start, tokenLen = state.currentTokenEnd - state.currentTokenStart;
            if (tokenLen < nsLen)
                return false;
            for (i = start; i < end; ++i) {
                if (state.data.charCodeAt(i) !== state.data.charCodeAt(i + offset))
                    return false;
            }
            if (nsLen === tokenLen)
                return true;
            if (state.data.charCodeAt(i + offset) === 46) {
                return true;
            }
            return false;
        }
        /**
         * Returns the index of '.' in the current token. If no '.' is present, returns currentTokenEnd.
         */
        function getNamespaceEnd(state) {
            var i;
            for (i = state.currentTokenStart; i < state.currentTokenEnd; ++i) {
                if (state.data.charCodeAt(i) === 46)
                    return i;
            }
            return i;
        }
        /**
         * Get the namespace string. endIndex is obtained by the getNamespaceEnd() function.
         */
        function getNamespace(state, endIndex) {
            return state.data.substring(state.currentTokenStart, endIndex);
        }
        /**
         * String representation of the current token.
         */
        function getTokenString(state) {
            return state.data.substring(state.currentTokenStart, state.currentTokenEnd);
        }
        /**
         * Move to the next token.
         */
        function moveNextInternal(state) {
            var prev = skipWhitespace(state);
            if (state.position >= state.length) {
                state.currentTokenType = 6 /* End */;
                return;
            }
            state.currentTokenStart = state.position;
            state.currentTokenEnd = state.position;
            state.isEscaped = false;
            var c = state.data.charCodeAt(state.position);
            switch (c) {
                case 35:
                    skipCommentLine(state);
                    state.currentTokenType = 5 /* Comment */;
                    break;
                case 34: // ", escaped value
                case 39:
                    eatEscaped(state, c);
                    state.currentTokenType = 3 /* Value */;
                    break;
                case 59:
                    // multiline value must start at the beginning of the line.
                    if (prev === 10 || prev === 13) {
                        eatMultiline(state);
                    }
                    else {
                        eatValue(state);
                    }
                    state.currentTokenType = 3 /* Value */;
                    break;
                default:
                    eatValue(state);
                    // escaped is always Value
                    if (state.isEscaped) {
                        state.currentTokenType = 3 /* Value */;
                        // _ always means column name
                    }
                    else if (state.data.charCodeAt(state.currentTokenStart) === 95) {
                        state.currentTokenType = 4 /* ColumnName */;
                        // 5th char needs to be _ for data_ or loop_
                    }
                    else if (state.currentTokenEnd - state.currentTokenStart >= 5 && state.data.charCodeAt(state.currentTokenStart + 4) === 95) {
                        if (isData(state))
                            state.currentTokenType = 0 /* Data */;
                        else if (isSave(state))
                            state.currentTokenType = 1 /* Save */;
                        else if (isLoop(state))
                            state.currentTokenType = 2 /* Loop */;
                        else
                            state.currentTokenType = 3 /* Value */;
                        // all other tests failed, we are at Value token.
                    }
                    else {
                        state.currentTokenType = 3 /* Value */;
                    }
                    break;
            }
        }
        /**
         * Moves to the next non-comment token.
         */
        function moveNext(state) {
            moveNextInternal(state);
            while (state.currentTokenType === 5 /* Comment */)
                moveNextInternal(state);
        }
        function createTokenizer(data) {
            return {
                data: data,
                length: data.length,
                position: 0,
                currentTokenStart: 0,
                currentTokenEnd: 0,
                currentTokenType: 6 /* End */,
                currentLineNumber: 1,
                isEscaped: false
            };
        }
        /**
         * Reads a category containing a single row.
         */
        function handleSingle(tokenizer, block) {
            var nsStart = tokenizer.currentTokenStart, nsEnd = getNamespaceEnd(tokenizer), name = getNamespace(tokenizer, nsEnd), column, columns = [], tokens = TokenIndexBuilder.create(512), tokenCount = 0, readingNames = true;
            while (readingNames) {
                if (tokenizer.currentTokenType !== 4 /* ColumnName */ || !isNamespace(tokenizer, nsStart, nsEnd)) {
                    readingNames = false;
                    break;
                }
                column = getTokenString(tokenizer);
                moveNext(tokenizer);
                if (tokenizer.currentTokenType !== 3 /* Value */) {
                    return {
                        hasError: true,
                        errorLine: tokenizer.currentLineNumber,
                        errorMessage: "Expected value."
                    };
                }
                columns[columns.length] = column;
                TokenIndexBuilder.addToken(tokens, tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
                tokenCount++;
                moveNext(tokenizer);
            }
            block.addCategory(new Text.Category(block.data, name, nsStart, tokenizer.currentTokenStart, columns, tokens.tokens, tokenCount));
            return {
                hasError: false,
                errorLine: 0,
                errorMessage: ""
            };
        }
        /**
         * Reads a loop.
         */
        function handleLoop(tokenizer, block) {
            var start = tokenizer.currentTokenStart, loopLine = tokenizer.currentLineNumber;
            moveNext(tokenizer);
            var name = getNamespace(tokenizer, getNamespaceEnd(tokenizer)), columns = [], tokens = TokenIndexBuilder.create(name === "_atom_site" ? (block.data.length / 1.85) | 0 : 1024), tokenCount = 0;
            while (tokenizer.currentTokenType === 4 /* ColumnName */) {
                columns[columns.length] = getTokenString(tokenizer);
                moveNext(tokenizer);
            }
            while (tokenizer.currentTokenType === 3 /* Value */) {
                TokenIndexBuilder.addToken(tokens, tokenizer.currentTokenStart, tokenizer.currentTokenEnd);
                tokenCount++;
                moveNext(tokenizer);
            }
            if (tokenCount % columns.length !== 0) {
                return {
                    hasError: true,
                    errorLine: tokenizer.currentLineNumber,
                    errorMessage: "The number of values for loop starting at line " + loopLine + " is not a multiple of the number of columns."
                };
            }
            block.addCategory(new Text.Category(block.data, name, start, tokenizer.currentTokenStart, columns, tokens.tokens, tokenCount));
            return {
                hasError: false,
                errorLine: 0,
                errorMessage: ""
            };
        }
        /**
         * Creates an error result.
         */
        function error(line, message) {
            return CIFTools.ParserResult.error(message, line);
        }
        /**
         * Creates a data result.
         */
        function result(data) {
            return CIFTools.ParserResult.success(data);
        }
        /**
         * Parses an mmCIF file.
         *
         * @returns CifParserResult wrapper of the result.
         */
        function parseInternal(data) {
            var tokenizer = createTokenizer(data), cat, id, file = new Text.File(data), block = new Text.DataBlock(data, "default"), saveFrame = new Text.DataBlock(data, "empty"), inSaveFrame = false, blockSaveFrames;
            moveNext(tokenizer);
            while (tokenizer.currentTokenType !== 6 /* End */) {
                var token = tokenizer.currentTokenType;
                // Data block
                if (token === 0 /* Data */) {
                    if (inSaveFrame) {
                        return error(tokenizer.currentLineNumber, "Unexpected data block inside a save frame.");
                    }
                    if (block.categories.length > 0) {
                        file.dataBlocks.push(block);
                    }
                    block = new Text.DataBlock(data, data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd));
                    moveNext(tokenizer);
                    // Save frame
                }
                else if (token === 1 /* Save */) {
                    id = data.substring(tokenizer.currentTokenStart + 5, tokenizer.currentTokenEnd);
                    if (id.length === 0) {
                        if (saveFrame.categories.length > 0) {
                            blockSaveFrames = block.additionalData["saveFrames"];
                            if (!blockSaveFrames) {
                                blockSaveFrames = [];
                                block.additionalData["saveFrames"] = blockSaveFrames;
                            }
                            blockSaveFrames[blockSaveFrames.length] = saveFrame;
                        }
                        inSaveFrame = false;
                    }
                    else {
                        if (inSaveFrame) {
                            return error(tokenizer.currentLineNumber, "Save frames cannot be nested.");
                        }
                        inSaveFrame = true;
                        saveFrame = new Text.DataBlock(data, id);
                    }
                    moveNext(tokenizer);
                    // Loop
                }
                else if (token === 2 /* Loop */) {
                    cat = handleLoop(tokenizer, inSaveFrame ? saveFrame : block);
                    if (cat.hasError) {
                        return error(cat.errorLine, cat.errorMessage);
                    }
                    // Single row
                }
                else if (token === 4 /* ColumnName */) {
                    cat = handleSingle(tokenizer, inSaveFrame ? saveFrame : block);
                    if (cat.hasError) {
                        return error(cat.errorLine, cat.errorMessage);
                    }
                    // Out of options
                }
                else {
                    return error(tokenizer.currentLineNumber, "Unexpected token. Expected data_, loop_, or data name.");
                }
            }
            // Check if the latest save frame was closed.
            if (inSaveFrame) {
                return error(tokenizer.currentLineNumber, "Unfinished save frame (`" + saveFrame.header + "`).");
            }
            if (block.categories.length > 0) {
                file.dataBlocks.push(block);
            }
            return result(file);
        }
        function parse(data) {
            return parseInternal(data);
        }
        Text.parse = parse;
    })(Text = CIFTools.Text || (CIFTools.Text = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Text;
    (function (Text) {
        "use strict";
        var StringWriter = CIFTools.Utils.StringWriter;
        var Writer = (function () {
            function Writer() {
                this.writer = StringWriter.create();
                this.encoded = false;
                this.dataBlockCreated = false;
            }
            Writer.prototype.startDataBlock = function (header) {
                this.dataBlockCreated = true;
                StringWriter.write(this.writer, "data_" + (header || '').replace(/[ \n\t]/g, '').toUpperCase() + "\n#\n");
            };
            Writer.prototype.writeCategory = function (category, contexts) {
                if (this.encoded) {
                    throw new Error('The writer contents have already been encoded, no more writing.');
                }
                if (!this.dataBlockCreated) {
                    throw new Error('No data block created.');
                }
                var src = !contexts || !contexts.length ? [category(void 0)] : contexts.map(function (c) { return category(c); });
                var data = src.filter(function (c) { return c && c.count > 0; });
                if (!data.length)
                    return;
                var count = data.reduce(function (a, c) { return a + (c.count === void 0 ? 1 : c.count); }, 0);
                if (!count)
                    return;
                else if (count === 1) {
                    writeCifSingleRecord(data[0], this.writer);
                }
                else {
                    writeCifLoop(data, this.writer);
                }
            };
            Writer.prototype.encode = function () {
                this.encoded = true;
            };
            Writer.prototype.flush = function (stream) {
                StringWriter.writeTo(this.writer, stream);
            };
            return Writer;
        }());
        Text.Writer = Writer;
        function isMultiline(value) {
            return !!value && value.indexOf('\n') >= 0;
        }
        function writeCifSingleRecord(category, writer) {
            var fields = category.desc.fields;
            var data = category.data;
            var width = fields.reduce(function (w, s) { return Math.max(w, s.name.length); }, 0) + category.desc.name.length + 5;
            for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                var f = fields_1[_i];
                StringWriter.writePadRight(writer, category.desc.name + "." + f.name, width);
                var presence = f.presence;
                var p = presence ? presence(data, 0) : 0 /* Present */;
                if (p !== 0 /* Present */) {
                    if (p === 1 /* NotSpecified */)
                        writeNotSpecified(writer);
                    else
                        writeUnknown(writer);
                }
                else {
                    var val = f.string(data, 0);
                    if (isMultiline(val)) {
                        writeMultiline(writer, val);
                        StringWriter.newline(writer);
                    }
                    else {
                        writeChecked(writer, val);
                    }
                }
                StringWriter.newline(writer);
            }
            StringWriter.write(writer, '#\n');
        }
        function writeCifLoop(categories, writer) {
            writeLine(writer, 'loop_');
            var first = categories[0];
            var fields = first.desc.fields;
            for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
                var f = fields_2[_i];
                writeLine(writer, first.desc.name + "." + f.name);
            }
            for (var _a = 0, categories_1 = categories; _a < categories_1.length; _a++) {
                var category = categories_1[_a];
                var data = category.data;
                var count = category.count;
                for (var i = 0; i < count; i++) {
                    for (var _b = 0, fields_3 = fields; _b < fields_3.length; _b++) {
                        var f = fields_3[_b];
                        var presence = f.presence;
                        var p = presence ? presence(data, i) : 0 /* Present */;
                        if (p !== 0 /* Present */) {
                            if (p === 1 /* NotSpecified */)
                                writeNotSpecified(writer);
                            else
                                writeUnknown(writer);
                        }
                        else {
                            var val = f.string(data, i);
                            if (isMultiline(val)) {
                                writeMultiline(writer, val);
                                StringWriter.newline(writer);
                            }
                            else {
                                writeChecked(writer, val);
                            }
                        }
                    }
                    StringWriter.newline(writer);
                }
            }
            StringWriter.write(writer, '#\n');
        }
        function writeLine(writer, val) {
            StringWriter.write(writer, val);
            StringWriter.newline(writer);
        }
        function writeInteger(writer, val) {
            StringWriter.writeSafe(writer, '' + val + ' ');
        }
        /**
            * eg writeFloat(123.2123, 100) -- 2 decim
            */
        function writeFloat(writer, val, precisionMultiplier) {
            StringWriter.writeSafe(writer, '' + Math.round(precisionMultiplier * val) / precisionMultiplier + ' ');
        }
        /**
            * Writes '. '
            */
        function writeNotSpecified(writer) {
            StringWriter.writeSafe(writer, '. ');
        }
        /**
            * Writes '? '
            */
        function writeUnknown(writer) {
            StringWriter.writeSafe(writer, '? ');
        }
        function writeChecked(writer, val) {
            if (!val) {
                StringWriter.writeSafe(writer, '. ');
                return;
            }
            var escape = false, escapeCharStart = '\'', escapeCharEnd = '\' ';
            var hasWhitespace = false;
            var hasSingle = false;
            var hasDouble = false;
            for (var i = 0, _l = val.length - 1; i < _l; i++) {
                var c = val.charCodeAt(i);
                switch (c) {
                    case 9:
                        hasWhitespace = true;
                        break; // \t
                    case 10:
                        StringWriter.writeSafe(writer, '\n;' + val);
                        StringWriter.writeSafe(writer, '\n; ');
                        return;
                    case 32:
                        hasWhitespace = true;
                        break; // ' '
                    case 34:
                        if (hasSingle) {
                            StringWriter.writeSafe(writer, '\n;' + val);
                            StringWriter.writeSafe(writer, '\n; ');
                            return;
                        }
                        hasDouble = true;
                        escape = true;
                        escapeCharStart = '\'';
                        escapeCharEnd = '\' ';
                        break;
                    case 39:
                        if (hasDouble) {
                            StringWriter.writeSafe(writer, '\n;' + val);
                            StringWriter.writeSafe(writer, '\n; ');
                            return;
                        }
                        escape = true;
                        hasSingle = true;
                        escapeCharStart = '"';
                        escapeCharEnd = '" ';
                        break;
                }
            }
            var fst = val.charCodeAt(0);
            if (!escape && (fst === 35 /* # */|| fst === 36 /* $ */ || fst === 59 /* ; */ || fst === 91 /* [ */ || fst === 93 /* ] */ || hasWhitespace)) {
                escapeCharStart = '\'';
                escapeCharEnd = '\' ';
                escape = true;
            }
            if (escape) {
                StringWriter.writeSafe(writer, escapeCharStart + val + escapeCharEnd);
            }
            else {
                StringWriter.write(writer, val);
                StringWriter.writeSafe(writer, ' ');
            }
        }
        function writeMultiline(writer, val) {
            StringWriter.writeSafe(writer, '\n;' + val);
            StringWriter.writeSafe(writer, '\n; ');
        }
        function writeToken(writer, data, start, end) {
            var escape = false, escapeCharStart = '\'', escapeCharEnd = '\' ';
            for (var i = start; i < end - 1; i++) {
                var c = data.charCodeAt(i);
                switch (c) {
                    case 10:
                        StringWriter.writeSafe(writer, '\n;' + data.substring(start, end));
                        StringWriter.writeSafe(writer, '\n; ');
                        return;
                    case 34:
                        escape = true;
                        escapeCharStart = '\'';
                        escapeCharEnd = '\' ';
                        break;
                    case 39:
                        escape = true;
                        escapeCharStart = '"';
                        escapeCharEnd = '" ';
                        break;
                }
            }
            if (!escape && data.charCodeAt(start) === 59 /* ; */) {
                escapeCharStart = '\'';
                escapeCharEnd = '\' ';
                escape = true;
            }
            if (escape) {
                StringWriter.writeSafe(writer, escapeCharStart + data.substring(start, end));
                StringWriter.writeSafe(writer, escapeCharStart);
            }
            else {
                StringWriter.write(writer, data.substring(start, end));
                StringWriter.writeSafe(writer, ' ');
            }
        }
    })(Text = CIFTools.Text || (CIFTools.Text = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        var MessagePack;
        (function (MessagePack) {
            /*
             * Adapted from https://github.com/rcsb/mmtf-javascript
             * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
             */
            /**
             * decode all key-value pairs of a map into an object
             * @param  {Integer} length - number of key-value pairs
             * @return {Object} decoded map
             */
            function map(state, length) {
                var value = {};
                for (var i = 0; i < length; i++) {
                    var key = parse(state);
                    value[key] = parse(state);
                }
                return value;
            }
            /**
             * decode binary array
             * @param  {Integer} length - number of elements in the array
             * @return {Uint8Array} decoded array
             */
            function bin(state, length) {
                // This approach to binary parsing wastes a bit of memory to trade for speed compared to:
                //
                //   let value = buffer.subarray(offset, offset + length); //new Uint8Array(buffer.buffer, offset, length);
                // 
                // It turns out that using the view created by subarray probably uses DataView
                // in the background, which causes the element access to be several times slower
                // than creating the new byte array.
                var value = new Uint8Array(length);
                var o = state.offset;
                for (var i = 0; i < length; i++)
                    value[i] = state.buffer[i + o];
                state.offset += length;
                return value;
            }
            /**
             * decode string
             * @param  {Integer} length - number string characters
             * @return {String} decoded string
             */
            function str(state, length) {
                var value = MessagePack.utf8Read(state.buffer, state.offset, length);
                state.offset += length;
                return value;
            }
            /**
                 * decode array
                 * @param  {Integer} length - number of array elements
                 * @return {Array} decoded array
                 */
            function array(state, length) {
                var value = new Array(length);
                for (var i = 0; i < length; i++) {
                    value[i] = parse(state);
                }
                return value;
            }
            /**
             * recursively parse the MessagePack data
             * @return {Object|Array|String|Number|Boolean|null} decoded MessagePack data
             */
            function parse(state) {
                var type = state.buffer[state.offset];
                var value, length;
                // Positive FixInt
                if ((type & 0x80) === 0x00) {
                    state.offset++;
                    return type;
                }
                // FixMap
                if ((type & 0xf0) === 0x80) {
                    length = type & 0x0f;
                    state.offset++;
                    return map(state, length);
                }
                // FixArray
                if ((type & 0xf0) === 0x90) {
                    length = type & 0x0f;
                    state.offset++;
                    return array(state, length);
                }
                // FixStr
                if ((type & 0xe0) === 0xa0) {
                    length = type & 0x1f;
                    state.offset++;
                    return str(state, length);
                }
                // Negative FixInt
                if ((type & 0xe0) === 0xe0) {
                    value = state.dataView.getInt8(state.offset);
                    state.offset++;
                    return value;
                }
                switch (type) {
                    // nil
                    case 0xc0:
                        state.offset++;
                        return null;
                    // false
                    case 0xc2:
                        state.offset++;
                        return false;
                    // true
                    case 0xc3:
                        state.offset++;
                        return true;
                    // bin 8
                    case 0xc4:
                        length = state.dataView.getUint8(state.offset + 1);
                        state.offset += 2;
                        return bin(state, length);
                    // bin 16
                    case 0xc5:
                        length = state.dataView.getUint16(state.offset + 1);
                        state.offset += 3;
                        return bin(state, length);
                    // bin 32
                    case 0xc6:
                        length = state.dataView.getUint32(state.offset + 1);
                        state.offset += 5;
                        return bin(state, length);
                    // float 32
                    case 0xca:
                        value = state.dataView.getFloat32(state.offset + 1);
                        state.offset += 5;
                        return value;
                    // float 64
                    case 0xcb:
                        value = state.dataView.getFloat64(state.offset + 1);
                        state.offset += 9;
                        return value;
                    // uint8
                    case 0xcc:
                        value = state.buffer[state.offset + 1];
                        state.offset += 2;
                        return value;
                    // uint 16
                    case 0xcd:
                        value = state.dataView.getUint16(state.offset + 1);
                        state.offset += 3;
                        return value;
                    // uint 32
                    case 0xce:
                        value = state.dataView.getUint32(state.offset + 1);
                        state.offset += 5;
                        return value;
                    // int 8
                    case 0xd0:
                        value = state.dataView.getInt8(state.offset + 1);
                        state.offset += 2;
                        return value;
                    // int 16
                    case 0xd1:
                        value = state.dataView.getInt16(state.offset + 1);
                        state.offset += 3;
                        return value;
                    // int 32
                    case 0xd2:
                        value = state.dataView.getInt32(state.offset + 1);
                        state.offset += 5;
                        return value;
                    // str 8
                    case 0xd9:
                        length = state.dataView.getUint8(state.offset + 1);
                        state.offset += 2;
                        return str(state, length);
                    // str 16
                    case 0xda:
                        length = state.dataView.getUint16(state.offset + 1);
                        state.offset += 3;
                        return str(state, length);
                    // str 32
                    case 0xdb:
                        length = state.dataView.getUint32(state.offset + 1);
                        state.offset += 5;
                        return str(state, length);
                    // array 16
                    case 0xdc:
                        length = state.dataView.getUint16(state.offset + 1);
                        state.offset += 3;
                        return array(state, length);
                    // array 32
                    case 0xdd:
                        length = state.dataView.getUint32(state.offset + 1);
                        state.offset += 5;
                        return array(state, length);
                    // map 16:
                    case 0xde:
                        length = state.dataView.getUint16(state.offset + 1);
                        state.offset += 3;
                        return map(state, length);
                    // map 32
                    case 0xdf:
                        length = state.dataView.getUint32(state.offset + 1);
                        state.offset += 5;
                        return map(state, length);
                }
                throw new Error("Unknown type 0x" + type.toString(16));
            }
            function decode(buffer) {
                return parse({
                    buffer: buffer,
                    offset: 0,
                    dataView: new DataView(buffer.buffer)
                });
            }
            MessagePack.decode = decode;
        })(MessagePack = Binary.MessagePack || (Binary.MessagePack = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        var MessagePack;
        (function (MessagePack) {
            /*
             * Adapted from https://github.com/rcsb/mmtf-javascript
             * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
             */
            function encode(value) {
                var buffer = new ArrayBuffer(encodedSize(value));
                var view = new DataView(buffer);
                var bytes = new Uint8Array(buffer);
                encodeInternal(value, view, bytes, 0);
                return bytes;
            }
            MessagePack.encode = encode;
            function encodedSize(value) {
                var type = typeof value;
                // Raw Bytes
                if (type === "string") {
                    var length_1 = MessagePack.utf8ByteCount(value);
                    if (length_1 < 0x20) {
                        return 1 + length_1;
                    }
                    if (length_1 < 0x100) {
                        return 2 + length_1;
                    }
                    if (length_1 < 0x10000) {
                        return 3 + length_1;
                    }
                    if (length_1 < 0x100000000) {
                        return 5 + length_1;
                    }
                }
                if (value instanceof Uint8Array) {
                    var length_2 = value.byteLength;
                    if (length_2 < 0x100) {
                        return 2 + length_2;
                    }
                    if (length_2 < 0x10000) {
                        return 3 + length_2;
                    }
                    if (length_2 < 0x100000000) {
                        return 5 + length_2;
                    }
                }
                if (type === "number") {
                    // Floating Point
                    // double
                    if (Math.floor(value) !== value)
                        return 9;
                    // Integers
                    if (value >= 0) {
                        // positive fixnum
                        if (value < 0x80)
                            return 1;
                        // uint 8
                        if (value < 0x100)
                            return 2;
                        // uint 16
                        if (value < 0x10000)
                            return 3;
                        // uint 32
                        if (value < 0x100000000)
                            return 5;
                        throw new Error("Number too big 0x" + value.toString(16));
                    }
                    // negative fixnum
                    if (value >= -0x20)
                        return 1;
                    // int 8
                    if (value >= -0x80)
                        return 2;
                    // int 16
                    if (value >= -0x8000)
                        return 3;
                    // int 32
                    if (value >= -0x80000000)
                        return 5;
                    throw new Error("Number too small -0x" + value.toString(16).substr(1));
                }
                // Boolean, null
                if (type === "boolean" || value === null || value === void 0)
                    return 1;
                // Container Types
                if (type === "object") {
                    var length_3, size = 0;
                    if (Array.isArray(value)) {
                        length_3 = value.length;
                        for (var i = 0; i < length_3; i++) {
                            size += encodedSize(value[i]);
                        }
                    }
                    else {
                        var keys = Object.keys(value);
                        length_3 = keys.length;
                        for (var i = 0; i < length_3; i++) {
                            var key = keys[i];
                            size += encodedSize(key) + encodedSize(value[key]);
                        }
                    }
                    if (length_3 < 0x10) {
                        return 1 + size;
                    }
                    if (length_3 < 0x10000) {
                        return 3 + size;
                    }
                    if (length_3 < 0x100000000) {
                        return 5 + size;
                    }
                    throw new Error("Array or object too long 0x" + length_3.toString(16));
                }
                throw new Error("Unknown type " + type);
            }
            function encodeInternal(value, view, bytes, offset) {
                var type = typeof value;
                // Strings Bytes
                if (type === "string") {
                    var length_4 = MessagePack.utf8ByteCount(value);
                    // fix str
                    if (length_4 < 0x20) {
                        view.setUint8(offset, length_4 | 0xa0);
                        MessagePack.utf8Write(bytes, offset + 1, value);
                        return 1 + length_4;
                    }
                    // str 8
                    if (length_4 < 0x100) {
                        view.setUint8(offset, 0xd9);
                        view.setUint8(offset + 1, length_4);
                        MessagePack.utf8Write(bytes, offset + 2, value);
                        return 2 + length_4;
                    }
                    // str 16
                    if (length_4 < 0x10000) {
                        view.setUint8(offset, 0xda);
                        view.setUint16(offset + 1, length_4);
                        MessagePack.utf8Write(bytes, offset + 3, value);
                        return 3 + length_4;
                    }
                    // str 32
                    if (length_4 < 0x100000000) {
                        view.setUint8(offset, 0xdb);
                        view.setUint32(offset + 1, length_4);
                        MessagePack.utf8Write(bytes, offset + 5, value);
                        return 5 + length_4;
                    }
                }
                if (value instanceof Uint8Array) {
                    var length_5 = value.byteLength;
                    var bytes_1 = new Uint8Array(view.buffer);
                    // bin 8
                    if (length_5 < 0x100) {
                        view.setUint8(offset, 0xc4);
                        view.setUint8(offset + 1, length_5);
                        bytes_1.set(value, offset + 2);
                        return 2 + length_5;
                    }
                    // bin 16
                    if (length_5 < 0x10000) {
                        view.setUint8(offset, 0xc5);
                        view.setUint16(offset + 1, length_5);
                        bytes_1.set(value, offset + 3);
                        return 3 + length_5;
                    }
                    // bin 32
                    if (length_5 < 0x100000000) {
                        view.setUint8(offset, 0xc6);
                        view.setUint32(offset + 1, length_5);
                        bytes_1.set(value, offset + 5);
                        return 5 + length_5;
                    }
                }
                if (type === "number") {
                    if (!isFinite(value)) {
                        throw new Error("Number not finite: " + value);
                    }
                    // Floating point
                    if (Math.floor(value) !== value) {
                        view.setUint8(offset, 0xcb);
                        view.setFloat64(offset + 1, value);
                        return 9;
                    }
                    // Integers
                    if (value >= 0) {
                        // positive fixnum
                        if (value < 0x80) {
                            view.setUint8(offset, value);
                            return 1;
                        }
                        // uint 8
                        if (value < 0x100) {
                            view.setUint8(offset, 0xcc);
                            view.setUint8(offset + 1, value);
                            return 2;
                        }
                        // uint 16
                        if (value < 0x10000) {
                            view.setUint8(offset, 0xcd);
                            view.setUint16(offset + 1, value);
                            return 3;
                        }
                        // uint 32
                        if (value < 0x100000000) {
                            view.setUint8(offset, 0xce);
                            view.setUint32(offset + 1, value);
                            return 5;
                        }
                        throw new Error("Number too big 0x" + value.toString(16));
                    }
                    // negative fixnum
                    if (value >= -0x20) {
                        view.setInt8(offset, value);
                        return 1;
                    }
                    // int 8
                    if (value >= -0x80) {
                        view.setUint8(offset, 0xd0);
                        view.setInt8(offset + 1, value);
                        return 2;
                    }
                    // int 16
                    if (value >= -0x8000) {
                        view.setUint8(offset, 0xd1);
                        view.setInt16(offset + 1, value);
                        return 3;
                    }
                    // int 32
                    if (value >= -0x80000000) {
                        view.setUint8(offset, 0xd2);
                        view.setInt32(offset + 1, value);
                        return 5;
                    }
                    throw new Error("Number too small -0x" + (-value).toString(16).substr(1));
                }
                // null
                if (value === null || value === undefined) {
                    view.setUint8(offset, 0xc0);
                    return 1;
                }
                // Boolean
                if (type === "boolean") {
                    view.setUint8(offset, value ? 0xc3 : 0xc2);
                    return 1;
                }
                // Container Types
                if (type === "object") {
                    var length_6, size = 0;
                    var isArray = Array.isArray(value);
                    var keys = void 0;
                    if (isArray) {
                        length_6 = value.length;
                    }
                    else {
                        keys = Object.keys(value);
                        length_6 = keys.length;
                    }
                    if (length_6 < 0x10) {
                        view.setUint8(offset, length_6 | (isArray ? 0x90 : 0x80));
                        size = 1;
                    }
                    else if (length_6 < 0x10000) {
                        view.setUint8(offset, isArray ? 0xdc : 0xde);
                        view.setUint16(offset + 1, length_6);
                        size = 3;
                    }
                    else if (length_6 < 0x100000000) {
                        view.setUint8(offset, isArray ? 0xdd : 0xdf);
                        view.setUint32(offset + 1, length_6);
                        size = 5;
                    }
                    if (isArray) {
                        for (var i = 0; i < length_6; i++) {
                            size += encodeInternal(value[i], view, bytes, offset + size);
                        }
                    }
                    else {
                        for (var _i = 0, _a = keys; _i < _a.length; _i++) {
                            var key = _a[_i];
                            size += encodeInternal(key, view, bytes, offset + size);
                            size += encodeInternal(value[key], view, bytes, offset + size);
                        }
                    }
                    return size;
                }
                throw new Error("Unknown type " + type);
            }
        })(MessagePack = Binary.MessagePack || (Binary.MessagePack = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        var MessagePack;
        (function (MessagePack) {
            /*
             * Adapted from https://github.com/rcsb/mmtf-javascript
             * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
             */
            function utf8Write(data, offset, str) {
                var byteLength = data.byteLength;
                for (var i = 0, l = str.length; i < l; i++) {
                    var codePoint = str.charCodeAt(i);
                    // One byte of UTF-8
                    if (codePoint < 0x80) {
                        data[offset++] = codePoint >>> 0 & 0x7f | 0x00;
                        continue;
                    }
                    // Two bytes of UTF-8
                    if (codePoint < 0x800) {
                        data[offset++] = codePoint >>> 6 & 0x1f | 0xc0;
                        data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                        continue;
                    }
                    // Three bytes of UTF-8.
                    if (codePoint < 0x10000) {
                        data[offset++] = codePoint >>> 12 & 0x0f | 0xe0;
                        data[offset++] = codePoint >>> 6 & 0x3f | 0x80;
                        data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                        continue;
                    }
                    // Four bytes of UTF-8
                    if (codePoint < 0x110000) {
                        data[offset++] = codePoint >>> 18 & 0x07 | 0xf0;
                        data[offset++] = codePoint >>> 12 & 0x3f | 0x80;
                        data[offset++] = codePoint >>> 6 & 0x3f | 0x80;
                        data[offset++] = codePoint >>> 0 & 0x3f | 0x80;
                        continue;
                    }
                    throw new Error("bad codepoint " + codePoint);
                }
            }
            MessagePack.utf8Write = utf8Write;
            var __chars = function () {
                var data = [];
                for (var i = 0; i < 1024; i++)
                    data[i] = String.fromCharCode(i);
                return data;
            }();
            function throwError(err) {
                throw new Error(err);
            }
            function utf8Read(data, offset, length) {
                var chars = __chars;
                var str = void 0, chunk = [], chunkSize = 512, chunkOffset = 0;
                for (var i = offset, end = offset + length; i < end; i++) {
                    var byte = data[i];
                    // One byte character
                    if ((byte & 0x80) === 0x00) {
                        chunk[chunkOffset++] = chars[byte];
                    }
                    else if ((byte & 0xe0) === 0xc0) {
                        chunk[chunkOffset++] = chars[((byte & 0x0f) << 6) | (data[++i] & 0x3f)];
                    }
                    else if ((byte & 0xf0) === 0xe0) {
                        chunk[chunkOffset++] = String.fromCharCode(((byte & 0x0f) << 12) |
                            ((data[++i] & 0x3f) << 6) |
                            ((data[++i] & 0x3f) << 0));
                    }
                    else if ((byte & 0xf8) === 0xf0) {
                        chunk[chunkOffset++] = String.fromCharCode(((byte & 0x07) << 18) |
                            ((data[++i] & 0x3f) << 12) |
                            ((data[++i] & 0x3f) << 6) |
                            ((data[++i] & 0x3f) << 0));
                    }
                    else
                        throwError("Invalid byte " + byte.toString(16));
                    if (chunkOffset === chunkSize) {
                        str = str || [];
                        str[str.length] = chunk.join('');
                        chunkOffset = 0;
                    }
                }
                if (!str)
                    return chunk.slice(0, chunkOffset).join('');
                if (chunkOffset > 0) {
                    str[str.length] = chunk.slice(0, chunkOffset).join('');
                }
                return str.join('');
            }
            MessagePack.utf8Read = utf8Read;
            function utf8ByteCount(str) {
                var count = 0;
                for (var i = 0, l = str.length; i < l; i++) {
                    var codePoint = str.charCodeAt(i);
                    if (codePoint < 0x80) {
                        count += 1;
                        continue;
                    }
                    if (codePoint < 0x800) {
                        count += 2;
                        continue;
                    }
                    if (codePoint < 0x10000) {
                        count += 3;
                        continue;
                    }
                    if (codePoint < 0x110000) {
                        count += 4;
                        continue;
                    }
                    throwError("bad codepoint " + codePoint);
                }
                return count;
            }
            MessagePack.utf8ByteCount = utf8ByteCount;
        })(MessagePack = Binary.MessagePack || (Binary.MessagePack = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        /**
         * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
         * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
         */
        function decode(data) {
            var current = data.data;
            for (var i = data.encoding.length - 1; i >= 0; i--) {
                current = Decoder.decodeStep(current, data.encoding[i]);
            }
            return current;
        }
        Binary.decode = decode;
        var Decoder;
        (function (Decoder) {
            function decodeStep(data, encoding) {
                switch (encoding.kind) {
                    case 'ByteArray': {
                        switch (encoding.type) {
                            case 4 /* Uint8 */: return data;
                            case 1 /* Int8 */: return int8(data);
                            case 2 /* Int16 */: return int16(data);
                            case 5 /* Uint16 */: return uint16(data);
                            case 3 /* Int32 */: return int32(data);
                            case 6 /* Uint32 */: return uint32(data);
                            case 32 /* Float32 */: return float32(data);
                            case 33 /* Float64 */: return float64(data);
                            default: throw new Error('Unsupported ByteArray type.');
                        }
                    }
                    case 'FixedPoint': return fixedPoint(data, encoding);
                    case 'IntervalQuantization': return intervalQuantization(data, encoding);
                    case 'RunLength': return runLength(data, encoding);
                    case 'Delta': return delta(data, encoding);
                    case 'IntegerPacking': return integerPacking(data, encoding);
                    case 'StringArray': return stringArray(data, encoding);
                }
            }
            Decoder.decodeStep = decodeStep;
            function getIntArray(type, size) {
                switch (type) {
                    case 1 /* Int8 */: return new Int8Array(size);
                    case 2 /* Int16 */: return new Int16Array(size);
                    case 3 /* Int32 */: return new Int32Array(size);
                    case 4 /* Uint8 */: return new Uint8Array(size);
                    case 5 /* Uint16 */: return new Uint16Array(size);
                    case 6 /* Uint32 */: return new Uint32Array(size);
                    default: throw new Error('Unsupported integer data type.');
                }
            }
            function getFloatArray(type, size) {
                switch (type) {
                    case 32 /* Float32 */: return new Float32Array(size);
                    case 33 /* Float64 */: return new Float64Array(size);
                    default: throw new Error('Unsupported floating data type.');
                }
            }
            /* http://stackoverflow.com/questions/7869752/javascript-typed-arrays-and-endianness */
            var isLittleEndian = (function () {
                var arrayBuffer = new ArrayBuffer(2);
                var uint8Array = new Uint8Array(arrayBuffer);
                var uint16array = new Uint16Array(arrayBuffer);
                uint8Array[0] = 0xAA;
                uint8Array[1] = 0xBB;
                if (uint16array[0] === 0xBBAA)
                    return true;
                return false;
            })();
            function int8(data) { return new Int8Array(data.buffer, data.byteOffset); }
            function flipByteOrder(data, bytes) {
                var buffer = new ArrayBuffer(data.length);
                var ret = new Uint8Array(buffer);
                for (var i = 0, n = data.length; i < n; i += bytes) {
                    for (var j = 0; j < bytes; j++) {
                        ret[i + bytes - j - 1] = data[i + j];
                    }
                }
                return buffer;
            }
            function view(data, byteSize, c) {
                if (isLittleEndian)
                    return new c(data.buffer);
                return new c(flipByteOrder(data, byteSize));
            }
            function int16(data) { return view(data, 2, Int16Array); }
            function uint16(data) { return view(data, 2, Uint16Array); }
            function int32(data) { return view(data, 4, Int32Array); }
            function uint32(data) { return view(data, 4, Uint32Array); }
            function float32(data) { return view(data, 4, Float32Array); }
            function float64(data) { return view(data, 8, Float64Array); }
            function fixedPoint(data, encoding) {
                var n = data.length;
                var output = getFloatArray(encoding.srcType, n);
                var f = 1 / encoding.factor;
                for (var i = 0; i < n; i++) {
                    output[i] = f * data[i];
                }
                return output;
            }
            function intervalQuantization(data, encoding) {
                var n = data.length;
                var output = getFloatArray(encoding.srcType, n);
                var delta = (encoding.max - encoding.min) / (encoding.numSteps - 1);
                var min = encoding.min;
                for (var i = 0; i < n; i++) {
                    output[i] = min + delta * data[i];
                }
                return output;
            }
            function runLength(data, encoding) {
                var output = getIntArray(encoding.srcType, encoding.srcSize);
                var dataOffset = 0;
                for (var i = 0, il = data.length; i < il; i += 2) {
                    var value = data[i]; // value to be repeated
                    var length_7 = data[i + 1]; // number of repeats
                    for (var j = 0; j < length_7; ++j) {
                        output[dataOffset++] = value;
                    }
                }
                return output;
            }
            function delta(data, encoding) {
                var n = data.length;
                var output = getIntArray(encoding.srcType, n);
                if (!n)
                    return output;
                output[0] = data[0] + (encoding.origin | 0);
                for (var i = 1; i < n; ++i) {
                    output[i] = data[i] + output[i - 1];
                }
                return output;
            }
            function integerPackingSigned(data, encoding) {
                var upperLimit = encoding.byteCount === 1 ? 0x7F : 0x7FFF;
                var lowerLimit = -upperLimit - 1;
                var n = data.length;
                var output = new Int32Array(encoding.srcSize);
                var i = 0;
                var j = 0;
                while (i < n) {
                    var value = 0, t = data[i];
                    while (t === upperLimit || t === lowerLimit) {
                        value += t;
                        i++;
                        t = data[i];
                    }
                    value += t;
                    output[j] = value;
                    i++;
                    j++;
                }
                return output;
            }
            function integerPackingUnsigned(data, encoding) {
                var upperLimit = encoding.byteCount === 1 ? 0xFF : 0xFFFF;
                var n = data.length;
                var output = new Int32Array(encoding.srcSize);
                var i = 0;
                var j = 0;
                while (i < n) {
                    var value = 0, t = data[i];
                    while (t === upperLimit) {
                        value += t;
                        i++;
                        t = data[i];
                    }
                    value += t;
                    output[j] = value;
                    i++;
                    j++;
                }
                return output;
            }
            function integerPacking(data, encoding) {
                return encoding.isUnsigned ? integerPackingUnsigned(data, encoding) : integerPackingSigned(data, encoding);
            }
            function stringArray(data, encoding) {
                var str = encoding.stringData;
                var offsets = decode({ encoding: encoding.offsetEncoding, data: encoding.offsets });
                var indices = decode({ encoding: encoding.dataEncoding, data: data });
                var cache = Object.create(null);
                var result = new Array(indices.length);
                var offset = 0;
                for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                    var i = indices_1[_i];
                    if (i < 0) {
                        result[offset++] = null;
                        continue;
                    }
                    var v = cache[i];
                    if (v === void 0) {
                        v = str.substring(offsets[i], offsets[i + 1]);
                        cache[i] = v;
                    }
                    result[offset++] = v;
                }
                return result;
            }
        })(Decoder || (Decoder = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        var File = (function () {
            function File(data) {
                this.dataBlocks = data.dataBlocks.map(function (b) { return new DataBlock(b); });
            }
            File.prototype.toJSON = function () {
                return this.dataBlocks.map(function (b) { return b.toJSON(); });
            };
            return File;
        }());
        Binary.File = File;
        var DataBlock = (function () {
            function DataBlock(data) {
                this.additionalData = {};
                this.header = data.header;
                this.categoryList = data.categories.map(function (c) { return new Category(c); });
                this.categoryMap = new Map();
                for (var _i = 0, _a = this.categoryList; _i < _a.length; _i++) {
                    var c = _a[_i];
                    this.categoryMap.set(c.name, c);
                }
            }
            Object.defineProperty(DataBlock.prototype, "categories", {
                get: function () { return this.categoryList; },
                enumerable: true,
                configurable: true
            });
            DataBlock.prototype.getCategory = function (name) { return this.categoryMap.get(name); };
            DataBlock.prototype.toJSON = function () {
                return {
                    id: this.header,
                    categories: this.categoryList.map(function (c) { return c.toJSON(); }),
                    additionalData: this.additionalData
                };
            };
            return DataBlock;
        }());
        Binary.DataBlock = DataBlock;
        var Category = (function () {
            function Category(data) {
                this.name = data.name;
                this.columnCount = data.columns.length;
                this.rowCount = data.rowCount;
                this.columnNameList = [];
                this.encodedColumns = new Map();
                for (var _i = 0, _a = data.columns; _i < _a.length; _i++) {
                    var c = _a[_i];
                    this.encodedColumns.set(c.name, c);
                    this.columnNameList.push(c.name);
                }
            }
            Object.defineProperty(Category.prototype, "columnNames", {
                get: function () { return this.columnNameList; },
                enumerable: true,
                configurable: true
            });
            Category.prototype.getColumn = function (name) {
                var w = this.encodedColumns.get(name);
                if (w)
                    return wrapColumn(w);
                return CIFTools.UndefinedColumn;
            };
            Category.prototype.toJSON = function () {
                var _this = this;
                var rows = [];
                var columns = this.columnNameList.map(function (name) { return ({ name: name, column: _this.getColumn(name) }); });
                for (var i = 0; i < this.rowCount; i++) {
                    var item = {};
                    for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                        var c = columns_1[_i];
                        var d = c.column.getValuePresence(i);
                        if (d === 0 /* Present */)
                            item[c.name] = c.column.getString(i);
                        else if (d === 1 /* NotSpecified */)
                            item[c.name] = '.';
                        else
                            item[c.name] = '?';
                    }
                    rows[i] = item;
                }
                return { name: this.name, columns: this.columnNames, rows: rows };
            };
            return Category;
        }());
        Binary.Category = Category;
        function wrapColumn(column) {
            if (!column.data.data)
                return CIFTools.UndefinedColumn;
            var data = Binary.decode(column.data);
            var mask = void 0;
            if (column.mask)
                mask = Binary.decode(column.mask);
            if (data.buffer && data.byteLength && data.BYTES_PER_ELEMENT) {
                return mask ? new MaskedNumericColumn(data, mask) : new NumericColumn(data);
            }
            return mask ? new MaskedStringColumn(data, mask) : new StringColumn(data);
        }
        var fastParseInt = CIFTools.Utils.FastNumberParsers.parseInt;
        var fastParseFloat = CIFTools.Utils.FastNumberParsers.parseFloat;
        var NumericColumn = (function () {
            function NumericColumn(data) {
                this.data = data;
                this.isDefined = true;
            }
            NumericColumn.prototype.getString = function (row) { return "" + this.data[row]; };
            NumericColumn.prototype.getInteger = function (row) { return this.data[row] | 0; };
            NumericColumn.prototype.getFloat = function (row) { return 1.0 * this.data[row]; };
            NumericColumn.prototype.stringEquals = function (row, value) { return this.data[row] === fastParseFloat(value, 0, value.length); };
            NumericColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
            NumericColumn.prototype.getValuePresence = function (row) { return 0 /* Present */; };
            return NumericColumn;
        }());
        var MaskedNumericColumn = (function () {
            function MaskedNumericColumn(data, mask) {
                this.data = data;
                this.mask = mask;
                this.isDefined = true;
            }
            MaskedNumericColumn.prototype.getString = function (row) { return this.mask[row] === 0 /* Present */ ? "" + this.data[row] : null; };
            MaskedNumericColumn.prototype.getInteger = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : 0; };
            MaskedNumericColumn.prototype.getFloat = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : 0; };
            MaskedNumericColumn.prototype.stringEquals = function (row, value) { return this.mask[row] === 0 /* Present */ ? this.data[row] === fastParseFloat(value, 0, value.length) : value === null || value === void 0; };
            MaskedNumericColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
            MaskedNumericColumn.prototype.getValuePresence = function (row) { return this.mask[row]; };
            return MaskedNumericColumn;
        }());
        var StringColumn = (function () {
            function StringColumn(data) {
                this.data = data;
                this.isDefined = true;
            }
            StringColumn.prototype.getString = function (row) { return this.data[row]; };
            StringColumn.prototype.getInteger = function (row) { var v = this.data[row]; return fastParseInt(v, 0, v.length); };
            StringColumn.prototype.getFloat = function (row) { var v = this.data[row]; return fastParseFloat(v, 0, v.length); };
            StringColumn.prototype.stringEquals = function (row, value) { return this.data[row] === value; };
            StringColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
            StringColumn.prototype.getValuePresence = function (row) { return 0 /* Present */; };
            return StringColumn;
        }());
        var MaskedStringColumn = (function () {
            function MaskedStringColumn(data, mask) {
                this.data = data;
                this.mask = mask;
                this.isDefined = true;
            }
            MaskedStringColumn.prototype.getString = function (row) { return this.mask[row] === 0 /* Present */ ? this.data[row] : null; };
            MaskedStringColumn.prototype.getInteger = function (row) { if (this.mask[row] !== 0 /* Present */)
                return 0; var v = this.data[row]; return fastParseInt(v || '', 0, (v || '').length); };
            MaskedStringColumn.prototype.getFloat = function (row) { if (this.mask[row] !== 0 /* Present */)
                return 0; var v = this.data[row]; return fastParseFloat(v || '', 0, (v || '').length); };
            MaskedStringColumn.prototype.stringEquals = function (row, value) { return this.data[row] === value; };
            MaskedStringColumn.prototype.areValuesEqual = function (rowA, rowB) { return this.data[rowA] === this.data[rowB]; };
            MaskedStringColumn.prototype.getValuePresence = function (row) { return this.mask[row]; };
            return MaskedStringColumn;
        }());
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        /**
         * Fixed point, delta, RLE, integer packing adopted from https://github.com/rcsb/mmtf-javascript/
         * by Alexander Rose <alexander.rose@weirdbyte.de>, MIT License, Copyright (c) 2016
         */
        var Encoder = (function () {
            function Encoder(providers) {
                this.providers = providers;
            }
            Encoder.prototype.and = function (f) {
                return new Encoder(this.providers.concat([f]));
            };
            Encoder.prototype.encode = function (data) {
                var encoding = [];
                for (var _i = 0, _a = this.providers; _i < _a.length; _i++) {
                    var p = _a[_i];
                    var t = p(data);
                    if (!t.encodings.length) {
                        throw new Error('Encodings must be non-empty.');
                    }
                    data = t.data;
                    for (var _b = 0, _c = t.encodings; _b < _c.length; _b++) {
                        var e = _c[_b];
                        encoding.push(e);
                    }
                }
                if (!(data instanceof Uint8Array)) {
                    throw new Error('The encoding must result in a Uint8Array. Fix your encoding chain.');
                }
                return {
                    encoding: encoding,
                    data: data
                };
            };
            return Encoder;
        }());
        Binary.Encoder = Encoder;
        (function (Encoder) {
            function by(f) {
                return new Encoder([f]);
            }
            Encoder.by = by;
            function uint8(data) {
                return {
                    encodings: [{ kind: 'ByteArray', type: 4 /* Uint8 */ }],
                    data: data
                };
            }
            function int8(data) {
                return {
                    encodings: [{ kind: 'ByteArray', type: 1 /* Int8 */ }],
                    data: new Uint8Array(data.buffer, data.byteOffset)
                };
            }
            var writers = (_a = {},
                _a[2 /* Int16 */] = function (v, i, a) { v.setInt16(2 * i, a, true); },
                _a[5 /* Uint16 */] = function (v, i, a) { v.setUint16(2 * i, a, true); },
                _a[3 /* Int32 */] = function (v, i, a) { v.setInt32(4 * i, a, true); },
                _a[6 /* Uint32 */] = function (v, i, a) { v.setUint32(4 * i, a, true); },
                _a[32 /* Float32 */] = function (v, i, a) { v.setFloat32(4 * i, a, true); },
                _a[33 /* Float64 */] = function (v, i, a) { v.setFloat64(8 * i, a, true); },
                _a);
            var byteSizes = (_b = {},
                _b[2 /* Int16 */] = 2,
                _b[5 /* Uint16 */] = 2,
                _b[3 /* Int32 */] = 4,
                _b[6 /* Uint32 */] = 4,
                _b[32 /* Float32 */] = 4,
                _b[33 /* Float64 */] = 8,
                _b);
            function byteArray(data) {
                var type = Binary.Encoding.getDataType(data);
                if (type === 1 /* Int8 */)
                    return int8(data);
                else if (type === 4 /* Uint8 */)
                    return uint8(data);
                var result = new Uint8Array(data.length * byteSizes[type]);
                var w = writers[type];
                var view = new DataView(result.buffer);
                for (var i = 0, n = data.length; i < n; i++) {
                    w(view, i, data[i]);
                }
                return {
                    encodings: [{ kind: 'ByteArray', type: type }],
                    data: result
                };
            }
            Encoder.byteArray = byteArray;
            function _fixedPoint(data, factor) {
                var srcType = Binary.Encoding.getDataType(data);
                var result = new Int32Array(data.length);
                for (var i = 0, n = data.length; i < n; i++) {
                    result[i] = Math.round(data[i] * factor);
                }
                return {
                    encodings: [{ kind: 'FixedPoint', factor: factor, srcType: srcType }],
                    data: result
                };
            }
            function fixedPoint(factor) { return function (data) { return _fixedPoint(data, factor); }; }
            Encoder.fixedPoint = fixedPoint;
            function _intervalQuantizaiton(data, min, max, numSteps, arrayType) {
                var srcType = Binary.Encoding.getDataType(data);
                if (!data.length) {
                    return {
                        encodings: [{ kind: 'IntervalQuantization', min: min, max: max, numSteps: numSteps, srcType: srcType }],
                        data: new Int32Array(0)
                    };
                }
                if (max < min) {
                    var t = min;
                    min = max;
                    max = t;
                }
                var delta = (max - min) / (numSteps - 1);
                var output = new arrayType(data.length);
                for (var i = 0, n = data.length; i < n; i++) {
                    var v = data[i];
                    if (v <= min)
                        output[i] = 0;
                    else if (v >= max)
                        output[i] = numSteps;
                    else
                        output[i] = (Math.round((v - min) / delta)) | 0;
                }
                return {
                    encodings: [{ kind: 'IntervalQuantization', min: min, max: max, numSteps: numSteps, srcType: srcType }],
                    data: output
                };
            }
            function intervalQuantizaiton(min, max, numSteps, arrayType) {
                if (arrayType === void 0) { arrayType = Int32Array; }
                return function (data) { return _intervalQuantizaiton(data, min, max, numSteps, arrayType); };
            }
            Encoder.intervalQuantizaiton = intervalQuantizaiton;
            function runLength(data) {
                var srcType = Binary.Encoding.getDataType(data);
                if (srcType === void 0) {
                    data = new Int32Array(data);
                    srcType = 3 /* Int32 */;
                }
                if (!data.length) {
                    return {
                        encodings: [{ kind: 'RunLength', srcType: srcType, srcSize: 0 }],
                        data: new Int32Array(0)
                    };
                }
                // calculate output size
                var fullLength = 2;
                for (var i = 1, il = data.length; i < il; i++) {
                    if (data[i - 1] !== data[i]) {
                        fullLength += 2;
                    }
                }
                var output = new Int32Array(fullLength);
                var offset = 0;
                var runLength = 1;
                for (var i = 1, il = data.length; i < il; i++) {
                    if (data[i - 1] !== data[i]) {
                        output[offset] = data[i - 1];
                        output[offset + 1] = runLength;
                        runLength = 1;
                        offset += 2;
                    }
                    else {
                        ++runLength;
                    }
                }
                output[offset] = data[data.length - 1];
                output[offset + 1] = runLength;
                return {
                    encodings: [{ kind: 'RunLength', srcType: srcType, srcSize: data.length }],
                    data: output
                };
            }
            Encoder.runLength = runLength;
            function delta(data) {
                if (!Binary.Encoding.isSignedIntegerDataType(data)) {
                    throw new Error('Only signed integer types can be encoded using delta encoding.');
                }
                var srcType = Binary.Encoding.getDataType(data);
                if (srcType === void 0) {
                    data = new Int32Array(data);
                    srcType = 3 /* Int32 */;
                }
                if (!data.length) {
                    return {
                        encodings: [{ kind: 'Delta', origin: 0, srcType: srcType }],
                        data: new data.constructor(0)
                    };
                }
                var output = new data.constructor(data.length);
                var origin = data[0];
                output[0] = data[0];
                for (var i = 1, n = data.length; i < n; i++) {
                    output[i] = data[i] - data[i - 1];
                }
                output[0] = 0;
                return {
                    encodings: [{ kind: 'Delta', origin: origin, srcType: srcType }],
                    data: output
                };
            }
            Encoder.delta = delta;
            function isSigned(data) {
                for (var i = 0, n = data.length; i < n; i++) {
                    if (data[i] < 0)
                        return true;
                }
                return false;
            }
            function packingSize(data, upperLimit) {
                var lowerLimit = -upperLimit - 1;
                var size = 0;
                for (var i = 0, n = data.length; i < n; i++) {
                    var value = data[i];
                    if (value === 0) {
                        size += 1;
                    }
                    else if (value > 0) {
                        size += Math.ceil(value / upperLimit);
                        if (value % upperLimit === 0)
                            size += 1;
                    }
                    else {
                        size += Math.ceil(value / lowerLimit);
                        if (value % lowerLimit === 0)
                            size += 1;
                    }
                }
                return size;
            }
            function determinePacking(data) {
                var signed = isSigned(data);
                var size8 = signed ? packingSize(data, 0x7F) : packingSize(data, 0xFF);
                var size16 = signed ? packingSize(data, 0x7FFF) : packingSize(data, 0xFFFF);
                if (data.length * 4 < size16 * 2) {
                    // 4 byte packing is the most effective
                    return {
                        isSigned: signed,
                        size: data.length,
                        bytesPerElement: 4
                    };
                }
                else if (size16 * 2 < size8) {
                    // 2 byte packing is the most effective
                    return {
                        isSigned: signed,
                        size: size16,
                        bytesPerElement: 2
                    };
                }
                else {
                    // 1 byte packing is the most effective
                    return {
                        isSigned: signed,
                        size: size8,
                        bytesPerElement: 1
                    };
                }
                ;
            }
            function _integerPacking(data, packing) {
                var upperLimit = packing.isSigned
                    ? (packing.bytesPerElement === 1 ? 0x7F : 0x7FFF)
                    : (packing.bytesPerElement === 1 ? 0xFF : 0xFFFF);
                var lowerLimit = -upperLimit - 1;
                var n = data.length;
                var packed = packing.isSigned
                    ? packing.bytesPerElement === 1 ? new Int8Array(packing.size) : new Int16Array(packing.size)
                    : packing.bytesPerElement === 1 ? new Uint8Array(packing.size) : new Uint16Array(packing.size);
                var j = 0;
                for (var i = 0; i < n; i++) {
                    var value = data[i];
                    if (value >= 0) {
                        while (value >= upperLimit) {
                            packed[j] = upperLimit;
                            ++j;
                            value -= upperLimit;
                        }
                    }
                    else {
                        while (value <= lowerLimit) {
                            packed[j] = lowerLimit;
                            ++j;
                            value -= lowerLimit;
                        }
                    }
                    packed[j] = value;
                    ++j;
                }
                var result = byteArray(packed);
                return {
                    encodings: [{
                            kind: 'IntegerPacking',
                            byteCount: packing.bytesPerElement,
                            isUnsigned: !packing.isSigned,
                            srcSize: n
                        },
                        result.encodings[0]
                    ],
                    data: result.data
                };
            }
            /**
             * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
             */
            function integerPacking(data) {
                if (!(data instanceof Int32Array)) {
                    throw new Error('Integer packing can only be applied to Int32 data.');
                }
                var packing = determinePacking(data);
                if (packing.bytesPerElement === 4) {
                    // no packing done, Int32 encoding will be used
                    return byteArray(data);
                }
                return _integerPacking(data, packing);
            }
            Encoder.integerPacking = integerPacking;
            function stringArray(data) {
                var map = Object.create(null);
                var strings = [];
                var accLength = 0;
                var offsets = CIFTools.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, 1024, 1);
                var output = new Int32Array(data.length);
                CIFTools.Utils.ChunkedArray.add(offsets, 0);
                var i = 0;
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var s = data_1[_i];
                    // handle null strings.
                    if (s === null || s === void 0) {
                        output[i++] = -1;
                        continue;
                    }
                    var index = map[s];
                    if (index === void 0) {
                        // increment the length
                        accLength += s.length;
                        // store the string and index                   
                        index = strings.length;
                        strings[index] = s;
                        map[s] = index;
                        // write the offset
                        CIFTools.Utils.ChunkedArray.add(offsets, accLength);
                    }
                    output[i++] = index;
                }
                var encOffsets = Encoder.by(delta).and(integerPacking).encode(CIFTools.Utils.ChunkedArray.compact(offsets));
                var encOutput = Encoder.by(delta).and(runLength).and(integerPacking).encode(output);
                return {
                    encodings: [{ kind: 'StringArray', dataEncoding: encOutput.encoding, stringData: strings.join(''), offsetEncoding: encOffsets.encoding, offsets: encOffsets.data }],
                    data: encOutput.data
                };
            }
            Encoder.stringArray = stringArray;
            var _a, _b;
        })(Encoder = Binary.Encoder || (Binary.Encoder = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        Binary.VERSION = '0.3.0';
        var Encoding;
        (function (Encoding) {
            function getDataType(data) {
                var srcType;
                if (data instanceof Int8Array)
                    srcType = 1 /* Int8 */;
                else if (data instanceof Int16Array)
                    srcType = 2 /* Int16 */;
                else if (data instanceof Int32Array)
                    srcType = 3 /* Int32 */;
                else if (data instanceof Uint8Array)
                    srcType = 4 /* Uint8 */;
                else if (data instanceof Uint16Array)
                    srcType = 5 /* Uint16 */;
                else if (data instanceof Uint32Array)
                    srcType = 6 /* Uint32 */;
                else if (data instanceof Float32Array)
                    srcType = 32 /* Float32 */;
                else if (data instanceof Float64Array)
                    srcType = 33 /* Float64 */;
                else
                    throw new Error('Unsupported integer data type.');
                return srcType;
            }
            Encoding.getDataType = getDataType;
            function isSignedIntegerDataType(data) {
                return data instanceof Int8Array || data instanceof Int16Array || data instanceof Int32Array;
            }
            Encoding.isSignedIntegerDataType = isSignedIntegerDataType;
        })(Encoding = Binary.Encoding || (Binary.Encoding = {}));
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        function checkVersions(min, current) {
            for (var i = 0; i < 2; i++) {
                if (min[i] > current[i])
                    return false;
            }
            return true;
        }
        function parse(data) {
            var minVersion = [0, 3];
            try {
                var array = new Uint8Array(data);
                var unpacked = Binary.MessagePack.decode(array);
                if (!checkVersions(minVersion, unpacked.version.match(/(\d)\.(\d)\.\d/).slice(1))) {
                    return CIFTools.ParserResult.error("Unsupported format version. Current " + unpacked.version + ", required " + minVersion.join('.') + ".");
                }
                var file = new Binary.File(unpacked);
                return CIFTools.ParserResult.success(file);
            }
            catch (e) {
                return CIFTools.ParserResult.error('' + e);
            }
        }
        Binary.parse = parse;
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under MIT License, See LICENSE file for more info.
 */
var CIFTools;
(function (CIFTools) {
    var Binary;
    (function (Binary) {
        "use strict";
        function encodeField(field, data, totalCount) {
            var array, isNative = false;
            if (field.typedArray) {
                array = new field.typedArray(totalCount);
            }
            else {
                isNative = true;
                array = new Array(totalCount);
            }
            var mask = new Uint8Array(totalCount);
            var presence = field.presence;
            var getter = field.number ? field.number : field.string;
            var allPresent = true;
            var offset = 0;
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var _d = data_2[_i];
                var d = _d.data;
                for (var i = 0, _b = _d.count; i < _b; i++) {
                    var p = presence ? presence(d, i) : 0 /* Present */;
                    if (p !== 0 /* Present */) {
                        mask[offset] = p;
                        if (isNative)
                            array[offset] = null;
                        allPresent = false;
                    }
                    else {
                        mask[offset] = 0 /* Present */;
                        array[offset] = getter(d, i);
                    }
                    offset++;
                }
            }
            var encoder = field.encoder ? field.encoder : Binary.Encoder.by(Binary.Encoder.stringArray);
            var encoded = encoder.encode(array);
            var maskData = void 0;
            if (!allPresent) {
                var maskRLE = Binary.Encoder.by(Binary.Encoder.runLength).and(Binary.Encoder.byteArray).encode(mask);
                if (maskRLE.data.length < mask.length) {
                    maskData = maskRLE;
                }
                else {
                    maskData = Binary.Encoder.by(Binary.Encoder.byteArray).encode(mask);
                }
            }
            return {
                name: field.name,
                data: encoded,
                mask: maskData
            };
        }
        var Writer = (function () {
            function Writer(encoder) {
                this.dataBlocks = [];
                this.data = {
                    encoder: encoder,
                    version: Binary.VERSION,
                    dataBlocks: this.dataBlocks
                };
            }
            Writer.prototype.startDataBlock = function (header) {
                this.dataBlocks.push({
                    header: (header || '').replace(/[ \n\t]/g, '').toUpperCase(),
                    categories: []
                });
            };
            Writer.prototype.writeCategory = function (category, contexts) {
                if (!this.data) {
                    throw new Error('The writer contents have already been encoded, no more writing.');
                }
                if (!this.dataBlocks.length) {
                    throw new Error('No data block created.');
                }
                var src = !contexts || !contexts.length ? [category(void 0)] : contexts.map(function (c) { return category(c); });
                var categories = src.filter(function (c) { return c && c.count > 0; });
                if (!categories.length)
                    return;
                var count = categories.reduce(function (a, c) { return a + c.count; }, 0);
                if (!count)
                    return;
                var first = categories[0];
                var cat = { name: first.desc.name, columns: [], rowCount: count };
                var data = categories.map(function (c) { return ({ data: c.data, count: c.count }); });
                for (var _i = 0, _a = first.desc.fields; _i < _a.length; _i++) {
                    var f = _a[_i];
                    cat.columns.push(encodeField(f, data, count));
                }
                this.dataBlocks[this.dataBlocks.length - 1].categories.push(cat);
            };
            Writer.prototype.encode = function () {
                this.encodedData = Binary.MessagePack.encode(this.data);
                this.data = null;
                this.dataBlocks = null;
            };
            Writer.prototype.flush = function (stream) {
                stream.writeBinary(this.encodedData);
            };
            return Writer;
        }());
        Binary.Writer = Writer;
    })(Binary = CIFTools.Binary || (CIFTools.Binary = {}));
})(CIFTools || (CIFTools = {}));
var LiteMolCIFTools = CIFTools;
"use strict";
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    //export type Promise<T> = GlobalPromise<T>;// __Promise.Promise<T>;
    LiteMol.Promise = __LiteMolPromise;
})(LiteMol || (LiteMol = {}));
(function (LiteMol) {
    var Core;
    (function (Core) {
        "use strict";
        Core.Rx = __LiteMolRx;
        Core.Promise = LiteMol.Promise;
        var Formats;
        (function (Formats) {
            Formats.CIF = LiteMolCIFTools;
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        Core.VERSION = { number: "3.2.3", date: "Feb 1 2019" };
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Scheduler;
        (function (Scheduler) {
            "use strict";
            function createImmediateActions() {
                var tasksByHandle = {};
                var doc = typeof document !== 'undefined' ? document : void 0;
                var currentlyRunningATask = false;
                var nextHandle = 1; // Spec says greater than zero
                var registerImmediate;
                function setImmediate(callback) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    // Callback can either be a function or a string
                    if (typeof callback !== 'function') {
                        callback = new Function('' + callback);
                    }
                    // Store and register the task
                    var task = { callback: callback, args: args };
                    tasksByHandle[nextHandle] = task;
                    registerImmediate(nextHandle);
                    return nextHandle++;
                }
                function clearImmediate(handle) {
                    delete tasksByHandle[handle];
                }
                function run(task) {
                    var callback = task.callback;
                    var args = task.args;
                    switch (args.length) {
                        case 0:
                            callback();
                            break;
                        case 1:
                            callback(args[0]);
                            break;
                        case 2:
                            callback(args[0], args[1]);
                            break;
                        case 3:
                            callback(args[0], args[1], args[2]);
                            break;
                        default:
                            callback.apply(undefined, args);
                            break;
                    }
                }
                function runIfPresent(handle) {
                    // From the spec: 'Wait until any invocations of this algorithm started before this one have completed.'
                    // So if we're currently running a task, we'll need to delay this invocation.
                    if (currentlyRunningATask) {
                        // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                        // 'too much recursion' error.
                        setTimeout(runIfPresent, 0, handle);
                    }
                    else {
                        var task = tasksByHandle[handle];
                        if (task) {
                            currentlyRunningATask = true;
                            try {
                                run(task);
                            }
                            finally {
                                clearImmediate(handle);
                                currentlyRunningATask = false;
                            }
                        }
                    }
                }
                function installNextTickImplementation() {
                    registerImmediate = function (handle) {
                        process.nextTick(function () { runIfPresent(handle); });
                    };
                }
                function canUsePostMessage() {
                    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
                    // where `global.postMessage` means something completely different and can't be used for this purpose.
                    var global = window;
                    if (global && global.postMessage && !global.importScripts) {
                        var postMessageIsAsynchronous_1 = true;
                        var oldOnMessage = global.onmessage;
                        global.onmessage = function () {
                            postMessageIsAsynchronous_1 = false;
                        };
                        global.postMessage('', '*');
                        global.onmessage = oldOnMessage;
                        return postMessageIsAsynchronous_1;
                    }
                    return void 0;
                }
                function installPostMessageImplementation() {
                    // Installs an event handler on `global` for the `message` event: see
                    // * https://developer.mozilla.org/en/DOM/window.postMessage
                    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
                    var global = window;
                    var messagePrefix = 'setImmediate$' + Math.random() + '$';
                    var onGlobalMessage = function (event) {
                        if (event.source === global &&
                            typeof event.data === 'string' &&
                            event.data.indexOf(messagePrefix) === 0) {
                            runIfPresent(+event.data.slice(messagePrefix.length));
                        }
                    };
                    if (window.addEventListener) {
                        window.addEventListener('message', onGlobalMessage, false);
                    }
                    else {
                        window.attachEvent('onmessage', onGlobalMessage);
                    }
                    registerImmediate = function (handle) {
                        window.postMessage(messagePrefix + handle, '*');
                    };
                }
                function installMessageChannelImplementation() {
                    var channel = new MessageChannel();
                    channel.port1.onmessage = function (event) {
                        var handle = event.data;
                        runIfPresent(handle);
                    };
                    registerImmediate = function (handle) {
                        channel.port2.postMessage(handle);
                    };
                }
                function installReadyStateChangeImplementation() {
                    var html = doc.documentElement;
                    registerImmediate = function (handle) {
                        // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                        // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                        var script = doc.createElement('script');
                        script.onreadystatechange = function () {
                            runIfPresent(handle);
                            script.onreadystatechange = null;
                            html.removeChild(script);
                            script = null;
                        };
                        html.appendChild(script);
                    };
                }
                function installSetTimeoutImplementation() {
                    registerImmediate = function (handle) {
                        setTimeout(runIfPresent, 0, handle);
                    };
                }
                // Don't get fooled by e.g. browserify environments.
                if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
                    // For Node.js before 0.9
                    installNextTickImplementation();
                }
                else if (canUsePostMessage()) {
                    // For non-IE10 modern browsers
                    installPostMessageImplementation();
                }
                else if (typeof MessageChannel !== 'undefined') {
                    // For web workers, where supported
                    installMessageChannelImplementation();
                }
                else if (doc && 'onreadystatechange' in doc.createElement('script')) {
                    // For IE 6–8
                    installReadyStateChangeImplementation();
                }
                else {
                    // For older browsers
                    installSetTimeoutImplementation();
                }
                return {
                    setImmediate: setImmediate,
                    clearImmediate: clearImmediate
                };
            }
            var immediateActions = (function () {
                if (typeof setImmediate !== 'undefined') {
                    if (typeof window !== 'undefined' && typeof window.setImmediate !== 'undefined') {
                        // this is because of IE
                        return { setImmediate: function (handler) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                return window.setImmediate.apply(window, [handler].concat(args));
                            }, clearImmediate: function (handle) { return window.clearImmediate(handle); } };
                    }
                    else
                        return { setImmediate: setImmediate, clearImmediate: Scheduler.clearImmediate };
                }
                return createImmediateActions();
            }());
            function resolveImmediate(res) {
                immediateActions.setImmediate(res);
            }
            Scheduler.immediate = immediateActions.setImmediate;
            Scheduler.clearImmediate = immediateActions.clearImmediate;
            function immediatePromise() { return new Core.Promise(resolveImmediate); }
            Scheduler.immediatePromise = immediatePromise;
        })(Scheduler = Core.Scheduler || (Core.Scheduler = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        "use strict";
        function computation(c) {
            return new Computation(c);
        }
        Core.computation = computation;
        var Computation = /** @class */ (function () {
            function Computation(computation) {
                this.computation = computation;
            }
            Computation.prototype.run = function (ctx) {
                return this.runWithContext(ctx).result;
            };
            Computation.prototype.runWithContext = function (ctx) {
                var _this = this;
                var context = ctx ? ctx : new ContextImpl();
                return {
                    progress: context.progressStream,
                    result: new Core.Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var result, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, 3, 4]);
                                    context.started();
                                    return [4 /*yield*/, this.computation(context)];
                                case 1:
                                    result = _a.sent();
                                    resolve(result);
                                    return [3 /*break*/, 4];
                                case 2:
                                    e_1 = _a.sent();
                                    if (Computation.PRINT_CONSOLE_ERROR)
                                        console.error(e_1);
                                    reject(e_1);
                                    return [3 /*break*/, 4];
                                case 3:
                                    context.finished();
                                    return [7 /*endfinally*/];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })
                };
            };
            return Computation;
        }());
        Core.Computation = Computation;
        (function (Computation) {
            Computation.PRINT_CONSOLE_ERROR = false;
            function resolve(a) {
                return computation(function () { return Core.Promise.resolve(a); });
            }
            Computation.resolve = resolve;
            function reject(reason) {
                return computation(function () { return Core.Promise.reject(reason); });
            }
            Computation.reject = reject;
            function createContext() {
                return new ContextImpl();
            }
            Computation.createContext = createContext;
            Computation.Aborted = 'Aborted';
            Computation.UpdateProgressDelta = 100;
        })(Computation = Core.Computation || (Core.Computation = {}));
        var ContextImpl = /** @class */ (function () {
            function ContextImpl() {
                var _this = this;
                this._abortRequested = false;
                this._abortRequester = function () { _this._abortRequested = true; };
                this.progressTick = new Core.Rx.Subject();
                this._progress = { message: 'Working...', current: 0, max: 0, isIndeterminate: true, requestAbort: void 0 };
                this.progressStream = new Core.Rx.BehaviorSubject(this._progress);
                this.startEndCounter = 0;
                this.progressTick.throttle(1000 / 15).subscribe(function (p) {
                    _this.progressStream.onNext({
                        message: p.message,
                        isIndeterminate: p.isIndeterminate,
                        current: p.current,
                        max: p.max,
                        requestAbort: p.requestAbort
                    });
                });
            }
            Object.defineProperty(ContextImpl.prototype, "isAbortRequested", {
                get: function () {
                    return this._abortRequested;
                },
                enumerable: true,
                configurable: true
            });
            ContextImpl.prototype.checkAborted = function () {
                if (this._abortRequested)
                    throw Computation.Aborted;
            };
            ContextImpl.prototype.requestAbort = function () {
                try {
                    if (this._abortRequester) {
                        this._abortRequester.call(null);
                    }
                }
                catch (e) { }
            };
            Object.defineProperty(ContextImpl.prototype, "progress", {
                get: function () { return this.progressTick; },
                enumerable: true,
                configurable: true
            });
            ContextImpl.prototype.updateProgress = function (msg, abort, current, max) {
                if (current === void 0) { current = NaN; }
                if (max === void 0) { max = NaN; }
                this.checkAborted();
                this._progress.message = msg;
                if (typeof abort === 'boolean') {
                    this._progress.requestAbort = abort ? this._abortRequester : void 0;
                }
                else {
                    if (abort)
                        this._abortRequester = abort;
                    this._progress.requestAbort = abort ? this._abortRequester : void 0;
                }
                if (isNaN(current)) {
                    this._progress.isIndeterminate = true;
                }
                else {
                    this._progress.isIndeterminate = false;
                    this._progress.current = current;
                    this._progress.max = max;
                }
                this.progressTick.onNext(this._progress);
                return Core.Scheduler.immediatePromise();
                //return new Promise<void>(res => setTimeout(res, 0));
            };
            ContextImpl.prototype.started = function () {
                this.startEndCounter++;
            };
            ContextImpl.prototype.finished = function () {
                this.startEndCounter--;
                if (this.startEndCounter <= 0) {
                    this.progressTick.onCompleted();
                    this.progressStream.onCompleted();
                }
                if (this.startEndCounter < 0) {
                    throw 'Bug in code somewhere, Computation.resolve/reject called too many times.';
                }
            };
            return ContextImpl;
        }());
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            function createMapObject() {
                var map = Object.create(null);
                // to cause deoptimization as we don't want to create hidden classes
                map["__"] = void 0;
                delete map["__"];
                return map;
            }
            var FastMap;
            (function (FastMap) {
                function forEach(data, f, ctx) {
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var key = _a[_i];
                        var v = data[key];
                        if (v === void 0)
                            continue;
                        f(v, key, ctx);
                    }
                }
                var fastMap = {
                    set: function (key, v) {
                        if (this.data[key] === void 0 && v !== void 0) {
                            this.size++;
                        }
                        this.data[key] = v;
                    },
                    get: function (key) {
                        return this.data[key];
                    },
                    delete: function (key) {
                        if (this.data[key] === void 0)
                            return false;
                        delete this.data[key];
                        this.size--;
                        return true;
                    },
                    has: function (key) {
                        return this.data[key] !== void 0;
                    },
                    clear: function () {
                        this.data = createMapObject();
                        this.size = 0;
                    },
                    forEach: function (f, ctx) {
                        forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
                    }
                };
                /**
                 * Creates an empty map.
                 */
                function create() {
                    var ret = Object.create(fastMap);
                    ret.data = createMapObject();
                    ret.size = 0;
                    return ret;
                }
                FastMap.create = create;
                /**
                 * Create a map from an array of the form [[key, value], ...]
                 */
                function ofArray(data) {
                    var ret = create();
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var xs = data_1[_i];
                        ret.set(xs[0], xs[1]);
                    }
                    return ret;
                }
                FastMap.ofArray = ofArray;
                /**
                 * Create a map from an object of the form { key: value, ... }
                 */
                function ofObject(data) {
                    var ret = create();
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var key = _a[_i];
                        var v = data[key];
                        ret.set(key, v);
                    }
                    return ret;
                }
                FastMap.ofObject = ofObject;
            })(FastMap = Utils.FastMap || (Utils.FastMap = {}));
            var FastSet;
            (function (FastSet) {
                function forEach(data, f, ctx) {
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var p = _a[_i];
                        if (data[p] !== null)
                            continue;
                        f(p, ctx);
                    }
                }
                /**
                 * Uses null for present values.
                 */
                var fastSet = {
                    add: function (key) {
                        if (this.data[key] === null)
                            return false;
                        this.data[key] = null;
                        this.size++;
                        return true;
                    },
                    delete: function (key) {
                        if (this.data[key] !== null)
                            return false;
                        delete this.data[key];
                        this.size--;
                        return true;
                    },
                    has: function (key) {
                        return this.data[key] === null;
                    },
                    clear: function () {
                        this.data = createMapObject();
                        this.size = 0;
                    },
                    forEach: function (f, ctx) {
                        forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
                    }
                };
                /**
                 * Create an empty set.
                 */
                function create() {
                    var ret = Object.create(fastSet);
                    ret.data = createMapObject();
                    ret.size = 0;
                    return ret;
                }
                FastSet.create = create;
                /**
                 * Create a set of an "array like" sequence.
                 */
                function ofArray(xs) {
                    var ret = create();
                    for (var i = 0, l = xs.length; i < l; i++) {
                        ret.add(xs[i]);
                    }
                    return ret;
                }
                FastSet.ofArray = ofArray;
            })(FastSet = Utils.FastSet || (Utils.FastSet = {}));
            var Mask;
            (function (Mask) {
                var EmptyMask = /** @class */ (function () {
                    function EmptyMask(size) {
                        this.size = size;
                    }
                    EmptyMask.prototype.has = function (i) { return false; };
                    return EmptyMask;
                }());
                var SingletonMask = /** @class */ (function () {
                    function SingletonMask(idx, size) {
                        this.idx = idx;
                        this.size = size;
                    }
                    SingletonMask.prototype.has = function (i) { return i === this.idx; };
                    return SingletonMask;
                }());
                var BitMask = /** @class */ (function () {
                    function BitMask(mask, size) {
                        this.mask = mask;
                        this.size = size;
                    }
                    BitMask.prototype.has = function (i) { return this.mask[i]; };
                    return BitMask;
                }());
                var AllMask = /** @class */ (function () {
                    function AllMask(size) {
                        this.size = size;
                    }
                    AllMask.prototype.has = function (i) { return true; };
                    return AllMask;
                }());
                function ofStructure(structure) {
                    return new AllMask(structure.data.atoms.count);
                }
                Mask.ofStructure = ofStructure;
                function ofIndices(totalCount, indices) {
                    var len = indices.length;
                    if (len === 0)
                        return new EmptyMask(totalCount);
                    if (len === 1)
                        return new SingletonMask(indices[0], totalCount);
                    var f = len / totalCount;
                    if (f < 1 / 12) {
                        var set = Utils.FastSet.create();
                        for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                            var i = indices_1[_i];
                            set.add(i);
                        }
                        return set;
                    }
                    var mask = new Int8Array(totalCount);
                    for (var _a = 0, indices_2 = indices; _a < indices_2.length; _a++) {
                        var i = indices_2[_a];
                        mask[i] = 1;
                    }
                    return new BitMask(mask, len);
                }
                Mask.ofIndices = ofIndices;
                function ofFragments(seq) {
                    var sizeEstimate = 0;
                    for (var _i = 0, _a = seq.fragments; _i < _a.length; _i++) {
                        var f = _a[_i];
                        sizeEstimate += f.atomCount;
                    }
                    var count = seq.context.structure.data.atoms.count;
                    if (sizeEstimate / count < 1 / 12) {
                        // create set;
                        var mask = Utils.FastSet.create();
                        for (var _b = 0, _c = seq.fragments; _b < _c.length; _b++) {
                            var f = _c[_b];
                            for (var _d = 0, _e = f.atomIndices; _d < _e.length; _d++) {
                                var i = _e[_d];
                                mask.add(i);
                            }
                        }
                        return mask;
                    }
                    else {
                        var mask = new Int8Array(count);
                        for (var _f = 0, _g = seq.fragments; _f < _g.length; _f++) {
                            var f = _g[_f];
                            for (var _h = 0, _j = f.atomIndices; _h < _j.length; _h++) {
                                var i = _j[_h];
                                mask[i] = 1;
                            }
                        }
                        var size = 0;
                        for (var i = 0; i < count; i++) {
                            if (mask[i] !== 0)
                                size++;
                        }
                        return new BitMask(mask, size);
                    }
                }
                Mask.ofFragments = ofFragments;
            })(Mask = Utils.Mask || (Utils.Mask = {}));
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            Utils.FastNumberParsers = Core.Formats.CIF.Utils.FastNumberParsers;
            function extend(object, source, guard) {
                var v;
                var s = source;
                var o = object;
                var g = guard;
                for (var _i = 0, _a = Object.keys(source); _i < _a.length; _i++) {
                    var k = _a[_i];
                    v = s[k];
                    if (v !== void 0)
                        o[k] = v;
                    else if (guard)
                        o[k] = g[k];
                }
                if (guard) {
                    for (var _b = 0, _c = Object.keys(guard); _b < _c.length; _b++) {
                        var k = _c[_b];
                        v = o[k];
                        if (v === void 0)
                            o[k] = g[k];
                    }
                }
                return object;
            }
            Utils.extend = extend;
            ;
            function debounce(func, wait) {
                var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled = 0, maxWait = 0, trailing = true, leading = false;
                wait = Math.max(0, wait) || 0;
                var delayed = function () {
                    var remaining = wait - (performance.now() - stamp);
                    if (remaining <= 0) {
                        if (maxTimeoutId) {
                            clearTimeout(maxTimeoutId);
                        }
                        var isCalled = trailingCall;
                        maxTimeoutId = timeoutId = trailingCall = void 0;
                        if (isCalled) {
                            lastCalled = performance.now();
                            result = func.apply(thisArg, args);
                            if (!timeoutId && !maxTimeoutId) {
                                args = thisArg = null;
                            }
                        }
                    }
                    else {
                        timeoutId = setTimeout(delayed, remaining);
                    }
                };
                var maxDelayed = function () {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    maxTimeoutId = timeoutId = trailingCall = void 0;
                    if (trailing || (maxWait !== wait)) {
                        lastCalled = performance.now();
                        result = func.apply(thisArg, args);
                        if (!timeoutId && !maxTimeoutId) {
                            args = thisArg = null;
                        }
                    }
                };
                return function () {
                    args = arguments;
                    stamp = performance.now();
                    thisArg = this;
                    trailingCall = trailing && (timeoutId || !leading);
                    var isCalled = false;
                    var leadingCall = false;
                    if (maxWait === 0) {
                        leadingCall = leading && !timeoutId;
                    }
                    else {
                        if (!maxTimeoutId && !leading) {
                            lastCalled = stamp;
                        }
                        var remaining = maxWait - (stamp - lastCalled), isCalled_1 = remaining <= 0;
                        if (isCalled_1) {
                            if (maxTimeoutId) {
                                maxTimeoutId = clearTimeout(maxTimeoutId);
                            }
                            lastCalled = stamp;
                            result = func.apply(thisArg, args);
                        }
                        else if (!maxTimeoutId) {
                            maxTimeoutId = setTimeout(maxDelayed, remaining);
                        }
                    }
                    if (isCalled && timeoutId) {
                        timeoutId = clearTimeout(timeoutId);
                    }
                    else if (!timeoutId && wait !== maxWait) {
                        timeoutId = setTimeout(delayed, wait);
                    }
                    if (leadingCall) {
                        isCalled = true;
                        result = func.apply(thisArg, args);
                    }
                    if (isCalled && !timeoutId && !maxTimeoutId) {
                        args = thisArg = null;
                    }
                    return result;
                };
            }
            Utils.debounce = debounce;
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            var DataTable;
            (function (DataTable) {
                function typedColumn(t) {
                    return function (size) { return new t(size); };
                }
                DataTable.typedColumn = typedColumn;
                function customColumn() {
                    return function (size) { return new Array(size); };
                }
                DataTable.customColumn = customColumn;
                DataTable.stringColumn = function (size) { return new Array(size); };
                DataTable.stringNullColumn = function (size) { return new Array(size); };
                function builder(count) {
                    return new BuilderImpl(count);
                }
                DataTable.builder = builder;
                function ofDefinition(definition, count) {
                    var builder = DataTable.builder(count);
                    for (var _i = 0, _a = Object.keys(definition); _i < _a.length; _i++) {
                        var k = _a[_i];
                        if (!Object.prototype.hasOwnProperty.call(definition, k))
                            continue;
                        var col = definition[k];
                        if (col) {
                            builder.addColumn(k, col);
                        }
                    }
                    return builder.seal();
                }
                DataTable.ofDefinition = ofDefinition;
                function rowReader(table, indexer) {
                    var row = Object.create(null);
                    for (var _i = 0, _a = table.columns; _i < _a.length; _i++) {
                        var _c = _a[_i];
                        (function (c, row, idx, data) {
                            Object.defineProperty(row, c.name, { enumerable: true, configurable: false, get: function () { return data[idx.index]; } });
                        })(_c, row, indexer, table[_c.name]);
                    }
                    return row;
                }
                var TableImpl = /** @class */ (function () {
                    function TableImpl(count, srcColumns, srcData) {
                        this.__rowIndexer = { index: 0 };
                        this.count = count;
                        this.indices = new Int32Array(count);
                        this.columns = [];
                        for (var i = 0; i < count; i++) {
                            this.indices[i] = i;
                        }
                        for (var _i = 0, srcColumns_1 = srcColumns; _i < srcColumns_1.length; _i++) {
                            var col = srcColumns_1[_i];
                            var data = srcData[col.name];
                            if (Utils.ChunkedArray.is(data)) {
                                data = Utils.ChunkedArray.compact(data);
                            }
                            Object.defineProperty(this, col.name, { enumerable: true, configurable: false, writable: false, value: data });
                            this.columns[this.columns.length] = col;
                        }
                        this.__row = rowReader(this, this.__rowIndexer);
                    }
                    TableImpl.prototype.getBuilder = function (count) {
                        var b = new BuilderImpl(count);
                        for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                            var c = _a[_i];
                            b.addColumn(c.name, c.creator);
                        }
                        return b;
                    };
                    TableImpl.prototype.getRawData = function () {
                        var _this = this;
                        return this.columns.map(function (c) { return _this[c.name]; });
                    };
                    TableImpl.prototype.getRow = function (i) {
                        this.__rowIndexer.index = i;
                        return this.__row;
                    };
                    return TableImpl;
                }());
                var BuilderImpl = /** @class */ (function () {
                    function BuilderImpl(count) {
                        this.columns = [];
                        this.count = count;
                    }
                    BuilderImpl.prototype.addColumn = function (name, creator) {
                        var c = creator(this.count);
                        Object.defineProperty(this, name, { enumerable: true, configurable: false, writable: false, value: c });
                        this.columns[this.columns.length] = { name: name, creator: creator };
                        return c;
                    };
                    BuilderImpl.prototype.addRawColumn = function (name, creator, data) {
                        var c = data;
                        Object.defineProperty(this, name, { enumerable: true, configurable: false, writable: false, value: c });
                        this.columns[this.columns.length] = { name: name, creator: creator };
                        return c;
                    };
                    BuilderImpl.prototype.getRawData = function () {
                        var _this = this;
                        return this.columns.map(function (c) { return _this[c.name]; });
                    };
                    /**
                     * This functions clones the table and defines all its column inside the constructor, hopefully making the JS engine
                     * use internal class instead of dictionary representation.
                     */
                    BuilderImpl.prototype.seal = function () {
                        return new TableImpl(this.count, this.columns, this);
                    };
                    return BuilderImpl;
                }());
            })(DataTable = Utils.DataTable || (Utils.DataTable = {}));
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            function integerSetToSortedTypedArray(set) {
                var array = new Int32Array(set.size);
                set.forEach(function (v, ctx) { ctx.array[ctx.index++] = v; }, { array: array, index: 0 });
                Array.prototype.sort.call(array, function (x, y) { return x - y; });
                return array;
            }
            Utils.integerSetToSortedTypedArray = integerSetToSortedTypedArray;
            /**
             * A a JS native array with the given size.
             */
            function makeNativeIntArray(size) {
                var arr = [];
                for (var i = 0; i < size; i++)
                    arr[i] = 0;
                return arr;
            }
            Utils.makeNativeIntArray = makeNativeIntArray;
            /**
             * A a JS native array with the given size.
             */
            function makeNativeFloatArray(size) {
                var arr = [];
                if (!size)
                    return arr;
                arr[0] = 0.1;
                for (var i = 0; i < size; i++)
                    arr[i] = 0;
                return arr;
            }
            Utils.makeNativeFloatArray = makeNativeFloatArray;
            var ChunkedArray;
            (function (ChunkedArray) {
                function is(x) {
                    return x.creator && x.chunkSize;
                }
                ChunkedArray.is = is;
                function add4(array, x, y, z, w) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    array.current[array.currentIndex++] = y;
                    array.current[array.currentIndex++] = z;
                    array.current[array.currentIndex++] = w;
                    return array.elementCount++;
                }
                ChunkedArray.add4 = add4;
                function add3(array, x, y, z) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    array.current[array.currentIndex++] = y;
                    array.current[array.currentIndex++] = z;
                    return array.elementCount++;
                }
                ChunkedArray.add3 = add3;
                function add2(array, x, y) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    array.current[array.currentIndex++] = y;
                    return array.elementCount++;
                }
                ChunkedArray.add2 = add2;
                function add(array, x) {
                    if (array.currentIndex >= array.chunkSize) {
                        array.currentIndex = 0;
                        array.current = array.creator(array.chunkSize);
                        array.parts[array.parts.length] = array.current;
                    }
                    array.current[array.currentIndex++] = x;
                    return array.elementCount++;
                }
                ChunkedArray.add = add;
                function compact(array) {
                    var ret = array.creator(array.elementSize * array.elementCount), offset = (array.parts.length - 1) * array.chunkSize, offsetInner = 0, part;
                    if (array.parts.length === 1 && array.chunkSize === array.elementCount) {
                        return array.parts[0];
                    }
                    if (array.parts.length > 1) {
                        if (array.parts[0].buffer) {
                            for (var i = 0; i < array.parts.length - 1; i++) {
                                ret.set(array.parts[i], array.chunkSize * i);
                            }
                        }
                        else {
                            for (var i = 0; i < array.parts.length - 1; i++) {
                                offsetInner = array.chunkSize * i;
                                part = array.parts[i];
                                for (var j = 0; j < array.chunkSize; j++) {
                                    ret[offsetInner + j] = part[j];
                                }
                            }
                        }
                    }
                    if (array.current.buffer && array.currentIndex >= array.chunkSize) {
                        ret.set(array.current, array.chunkSize * (array.parts.length - 1));
                    }
                    else {
                        for (var i = 0; i < array.currentIndex; i++) {
                            ret[offset + i] = array.current[i];
                        }
                    }
                    return ret;
                }
                ChunkedArray.compact = compact;
                function forVertex3D(chunkVertexCount) {
                    if (chunkVertexCount === void 0) { chunkVertexCount = 262144; }
                    return create(function (size) { return new Float32Array(size); }, chunkVertexCount, 3);
                }
                ChunkedArray.forVertex3D = forVertex3D;
                function forIndexBuffer(chunkIndexCount) {
                    if (chunkIndexCount === void 0) { chunkIndexCount = 262144; }
                    return create(function (size) { return new Uint32Array(size); }, chunkIndexCount, 3);
                }
                ChunkedArray.forIndexBuffer = forIndexBuffer;
                function forTokenIndices(chunkTokenCount) {
                    if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                    return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 2);
                }
                ChunkedArray.forTokenIndices = forTokenIndices;
                function forIndices(chunkTokenCount) {
                    if (chunkTokenCount === void 0) { chunkTokenCount = 131072; }
                    return create(function (size) { return new Int32Array(size); }, chunkTokenCount, 1);
                }
                ChunkedArray.forIndices = forIndices;
                function forInt32(chunkSize) {
                    if (chunkSize === void 0) { chunkSize = 131072; }
                    return create(function (size) { return new Int32Array(size); }, chunkSize, 1);
                }
                ChunkedArray.forInt32 = forInt32;
                function forFloat32(chunkSize) {
                    if (chunkSize === void 0) { chunkSize = 131072; }
                    return create(function (size) { return new Float32Array(size); }, chunkSize, 1);
                }
                ChunkedArray.forFloat32 = forFloat32;
                function forArray(chunkSize) {
                    if (chunkSize === void 0) { chunkSize = 131072; }
                    return create(function (size) { return []; }, chunkSize, 1);
                }
                ChunkedArray.forArray = forArray;
                function create(creator, chunkElementCount, elementSize) {
                    chunkElementCount = chunkElementCount | 0;
                    if (chunkElementCount <= 0)
                        chunkElementCount = 1;
                    var chunkSize = chunkElementCount * elementSize;
                    var current = creator(chunkSize);
                    return {
                        elementSize: elementSize,
                        chunkSize: chunkSize,
                        creator: creator,
                        current: current,
                        parts: [current],
                        currentIndex: 0,
                        elementCount: 0
                    };
                }
                ChunkedArray.create = create;
            })(ChunkedArray = Utils.ChunkedArray || (Utils.ChunkedArray = {}));
            var ArrayBuilder;
            (function (ArrayBuilder) {
                function add3(array, x, y, z) {
                    var a = array.array;
                    a[array.currentIndex++] = x;
                    a[array.currentIndex++] = y;
                    a[array.currentIndex++] = z;
                    array.elementCount++;
                }
                ArrayBuilder.add3 = add3;
                function add2(array, x, y) {
                    var a = array.array;
                    a[array.currentIndex++] = x;
                    a[array.currentIndex++] = y;
                    array.elementCount++;
                }
                ArrayBuilder.add2 = add2;
                function add(array, x) {
                    array.array[array.currentIndex++] = x;
                    array.elementCount++;
                }
                ArrayBuilder.add = add;
                function forVertex3D(count) {
                    return create(function (size) { return new Float32Array(size); }, count, 3);
                }
                ArrayBuilder.forVertex3D = forVertex3D;
                function forIndexBuffer(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 3);
                }
                ArrayBuilder.forIndexBuffer = forIndexBuffer;
                function forTokenIndices(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 2);
                }
                ArrayBuilder.forTokenIndices = forTokenIndices;
                function forIndices(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 1);
                }
                ArrayBuilder.forIndices = forIndices;
                function forInt32(count) {
                    return create(function (size) { return new Int32Array(size); }, count, 1);
                }
                ArrayBuilder.forInt32 = forInt32;
                function forFloat32(count) {
                    return create(function (size) { return new Float32Array(size); }, count, 1);
                }
                ArrayBuilder.forFloat32 = forFloat32;
                function forArray(count) {
                    return create(function (size) { return []; }, count, 1);
                }
                ArrayBuilder.forArray = forArray;
                function create(creator, chunkElementCount, elementSize) {
                    chunkElementCount = chunkElementCount | 0;
                    return {
                        array: creator(chunkElementCount * elementSize),
                        currentIndex: 0,
                        elementCount: 0
                    };
                }
                ArrayBuilder.create = create;
            })(ArrayBuilder = Utils.ArrayBuilder || (Utils.ArrayBuilder = {}));
            function UniqueArray() {
                return { _set: Utils.FastSet.create(), array: [] };
            }
            Utils.UniqueArray = UniqueArray;
            (function (UniqueArray) {
                function add(_a, e) {
                    var _set = _a._set, array = _a.array;
                    if (!_set.has(e)) {
                        _set.add(e);
                        array[array.length] = e;
                    }
                }
                UniqueArray.add = add;
            })(UniqueArray = Utils.UniqueArray || (Utils.UniqueArray = {}));
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Utils;
        (function (Utils) {
            "use strict";
            var PerformanceHelper;
            (function (PerformanceHelper) {
                PerformanceHelper.perfGetTime = (function () {
                    if (typeof window !== 'undefined' && window.performance) {
                        return function () { return window.performance.now(); };
                    }
                    else if (typeof process !== 'undefined' && process.hrtime !== 'undefined') {
                        return function () {
                            var t = process.hrtime();
                            return t[0] * 1000 + t[1] / 1000000;
                        };
                    }
                    else {
                        return function () { return +new Date(); };
                    }
                })();
            })(PerformanceHelper || (PerformanceHelper = {}));
            var PerformanceMonitor = /** @class */ (function () {
                function PerformanceMonitor() {
                    this.starts = Utils.FastMap.create();
                    this.ends = Utils.FastMap.create();
                }
                PerformanceMonitor.currentTime = function () {
                    return PerformanceHelper.perfGetTime();
                };
                PerformanceMonitor.prototype.start = function (name) {
                    this.starts.set(name, PerformanceHelper.perfGetTime());
                };
                PerformanceMonitor.prototype.end = function (name) {
                    this.ends.set(name, PerformanceHelper.perfGetTime());
                };
                PerformanceMonitor.format = function (t) {
                    if (isNaN(t))
                        return 'n/a';
                    var h = Math.floor(t / (60 * 60 * 1000)), m = Math.floor(t / (60 * 1000) % 60), s = Math.floor(t / 1000 % 60), ms = Math.floor(t % 1000).toString();
                    while (ms.length < 3)
                        ms = "0" + ms;
                    if (h > 0)
                        return h + "h" + m + "m" + s + "." + ms + "s";
                    if (m > 0)
                        return m + "m" + s + "." + ms + "s";
                    if (s > 0)
                        return s + "." + ms + "s";
                    return t.toFixed(0) + "ms";
                };
                PerformanceMonitor.prototype.formatTime = function (name) {
                    return PerformanceMonitor.format(this.time(name));
                };
                PerformanceMonitor.prototype.formatTimeSum = function () {
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    return PerformanceMonitor.format(this.timeSum.apply(this, names));
                };
                // return the time in milliseconds and removes them from the cache.
                PerformanceMonitor.prototype.time = function (name) {
                    var start = this.starts.get(name), end = this.ends.get(name);
                    this.starts.delete(name);
                    this.ends.delete(name);
                    return end - start;
                };
                PerformanceMonitor.prototype.timeSum = function () {
                    var _this = this;
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    var t = 0;
                    for (var _a = 0, _b = names.map(function (n) { return _this.ends.get(n) - _this.starts.get(n); }); _a < _b.length; _a++) {
                        var m = _b[_a];
                        t += m;
                    }
                    return t;
                };
                return PerformanceMonitor;
            }());
            Utils.PerformanceMonitor = PerformanceMonitor;
        })(Utils = Core.Utils || (Core.Utils = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            "use strict";
            var FormatInfo;
            (function (FormatInfo) {
                function is(o) {
                    return o.name && o.parse;
                }
                FormatInfo.is = is;
                function fromShortcut(all, name) {
                    name = name.toLowerCase().trim();
                    for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
                        var f = all_1[_i];
                        for (var _a = 0, _b = f.shortcuts; _a < _b.length; _a++) {
                            var s = _b[_a];
                            if (s.toLowerCase() === name)
                                return f;
                        }
                    }
                    return void 0;
                }
                FormatInfo.fromShortcut = fromShortcut;
                function formatRegExp(info) {
                    return new RegExp(info.extensions.map(function (e) { return "(\\" + e + ")"; }).join('|') + '(\\.gz){0,1}$', 'i');
                }
                FormatInfo.formatRegExp = formatRegExp;
                function formatFileFilters(all) {
                    return all.map(function (info) { return info.extensions.map(function (e) { return e + "," + e + ".gz"; }).join(','); }).join(',');
                }
                FormatInfo.formatFileFilters = formatFileFilters;
                function getFormat(filename, all) {
                    for (var _i = 0, all_2 = all; _i < all_2.length; _i++) {
                        var f = all_2[_i];
                        if (formatRegExp(f).test(filename))
                            return f;
                    }
                    return void 0;
                }
                FormatInfo.getFormat = getFormat;
            })(FormatInfo = Formats.FormatInfo || (Formats.FormatInfo = {}));
            var ParserResult;
            (function (ParserResult) {
                function error(message, line) {
                    if (line === void 0) { line = -1; }
                    return new ParserError(message, line);
                }
                ParserResult.error = error;
                function success(result, warnings) {
                    if (warnings === void 0) { warnings = []; }
                    return new ParserSuccess(result, warnings);
                }
                ParserResult.success = success;
            })(ParserResult = Formats.ParserResult || (Formats.ParserResult = {}));
            var ParserError = /** @class */ (function () {
                function ParserError(message, line) {
                    this.message = message;
                    this.line = line;
                    this.isError = true;
                }
                ParserError.prototype.toString = function () {
                    if (this.line >= 0) {
                        return "[Line " + this.line + "] " + this.message;
                    }
                    return this.message;
                };
                return ParserError;
            }());
            Formats.ParserError = ParserError;
            var ParserSuccess = /** @class */ (function () {
                function ParserSuccess(result, warnings) {
                    this.result = result;
                    this.warnings = warnings;
                    this.isError = false;
                }
                return ParserSuccess;
            }());
            Formats.ParserSuccess = ParserSuccess;
            var TokenIndexBuilder;
            (function (TokenIndexBuilder) {
                function resize(builder) {
                    // scale the size using golden ratio, because why not.
                    var newBuffer = new Int32Array(Math.round(1.61 * builder.tokens.length));
                    newBuffer.set(builder.tokens);
                    builder.tokens = newBuffer;
                    builder.tokensLenMinus2 = newBuffer.length - 2;
                }
                function addToken(builder, start, end) {
                    if (builder.count >= builder.tokensLenMinus2) {
                        resize(builder);
                    }
                    builder.tokens[builder.count++] = start;
                    builder.tokens[builder.count++] = end;
                }
                TokenIndexBuilder.addToken = addToken;
                function create(size) {
                    return {
                        tokensLenMinus2: Math.round(size) - 2,
                        count: 0,
                        tokens: new Int32Array(size)
                    };
                }
                TokenIndexBuilder.create = create;
            })(TokenIndexBuilder = Formats.TokenIndexBuilder || (Formats.TokenIndexBuilder = {}));
            var ShortStringPool;
            (function (ShortStringPool) {
                function create() { return Object.create(null); }
                ShortStringPool.create = create;
                function get(pool, str) {
                    if (str.length > 6)
                        return str;
                    var value = pool[str];
                    if (value !== void 0)
                        return value;
                    pool[str] = str;
                    return str;
                }
                ShortStringPool.get = get;
            })(ShortStringPool = Formats.ShortStringPool || (Formats.ShortStringPool = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var mmCIF;
                (function (mmCIF) {
                    "use strict";
                    var Defaults;
                    (function (Defaults) {
                        Defaults.ElementSymbol = 'X';
                        Defaults.ResidueName = 'UNK';
                        Defaults.AsymId = '';
                        Defaults.EntityId = '1';
                        Defaults.ModelId = '1';
                    })(Defaults || (Defaults = {}));
                    function getTransform(category, matrixField, translationField, row) {
                        var ret = Core.Geometry.LinearAlgebra.Matrix4.identity(), i, j;
                        for (i = 1; i <= 3; i++) {
                            for (j = 1; j <= 3; j++) {
                                Core.Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, j - 1, category.getColumn(matrixField + "[" + i + "][" + j + "]").getFloat(row));
                            }
                            Core.Geometry.LinearAlgebra.Matrix4.setValue(ret, i - 1, 3, category.getColumn(translationField + "[" + i + "]").getFloat(row));
                        }
                        return ret;
                    }
                    function getModelEndRow(startRow, rowCount, modelNum) {
                        var i = 0;
                        if (!modelNum || !modelNum.isDefined)
                            return rowCount;
                        for (i = startRow + 1; i < rowCount; i++) {
                            if (!modelNum.areValuesEqual(i - 1, i))
                                break;
                        }
                        return i;
                    }
                    var AtomSiteColumns = [
                        'id',
                        'Cartn_x',
                        'Cartn_y',
                        'Cartn_z',
                        'label_atom_id',
                        'type_symbol',
                        'occupancy',
                        'B_iso_or_equiv',
                        'auth_atom_id',
                        'label_alt_id',
                        'label_comp_id',
                        'label_seq_id',
                        'label_asym_id',
                        'auth_comp_id',
                        'auth_seq_id',
                        'auth_asym_id',
                        'group_PDB',
                        'label_entity_id',
                        'pdbx_PDB_ins_code',
                        'pdbx_PDB_model_num'
                    ];
                    function getAtomSiteColumns(category) {
                        var ret = Core.Utils.FastMap.create();
                        for (var _a = 0, AtomSiteColumns_1 = AtomSiteColumns; _a < AtomSiteColumns_1.length; _a++) {
                            var c = AtomSiteColumns_1[_a];
                            ret.set(c, category.getColumn(c));
                        }
                        return ret;
                    }
                    function buildModelAtomTable(startRow, rowCount, columns) {
                        var endRow = getModelEndRow(startRow, rowCount, columns.get('pdbx_PDB_model_num'));
                        var atoms = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Atoms, endRow - startRow), positions = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Positions, endRow - startRow), pX = positions.x, pXCol = columns.get('Cartn_x'), pY = positions.y, pYCol = columns.get('Cartn_y'), pZ = positions.z, pZCol = columns.get('Cartn_z'), id = atoms.id, idCol = columns.get('id'), altLoc = atoms.altLoc, altLocCol = columns.get('label_alt_id'), rowIndex = atoms.rowIndex, residueIndex = atoms.residueIndex, chainIndex = atoms.chainIndex, entityIndex = atoms.entityIndex, name = atoms.name, nameCol = columns.get('label_atom_id'), elementSymbol = atoms.elementSymbol, elementSymbolCol = columns.get('type_symbol'), occupancy = atoms.occupancy, occupancyCol = columns.get('occupancy'), tempFactor = atoms.tempFactor, tempFactorCol = columns.get('B_iso_or_equiv'), authName = atoms.authName, authNameCol = columns.get('auth_atom_id');
                        var asymIdCol = columns.get('label_asym_id'), entityIdCol = columns.get('label_entity_id'), insCodeCol = columns.get('pdbx_PDB_ins_code'), authResSeqNumberCol = columns.get('auth_seq_id'), modelNumCol = columns.get('pdbx_PDB_model_num'), numChains = 0, numResidues = 0, numEntities = 0;
                        var prev = startRow;
                        for (var row = startRow; row < endRow; row++) {
                            var index = row - startRow;
                            id[index] = idCol.getInteger(row);
                            pX[index] = pXCol.getFloat(row);
                            pY[index] = pYCol.getFloat(row);
                            pZ[index] = pZCol.getFloat(row);
                            elementSymbol[index] = elementSymbolCol.getString(row) || Defaults.ElementSymbol;
                            name[index] = nameCol.getString(row) || elementSymbol[index];
                            authName[index] = authNameCol.getString(row) || name[index];
                            altLoc[index] = altLocCol.getString(row);
                            occupancy[index] = occupancyCol.getFloat(row);
                            tempFactor[index] = tempFactorCol.getFloat(row);
                            var newChain = false;
                            var newResidue = !authResSeqNumberCol.areValuesEqual(prev, row) || !insCodeCol.areValuesEqual(prev, row);
                            if (!asymIdCol.areValuesEqual(prev, row)) {
                                newChain = true;
                                newResidue = true;
                            }
                            if (!entityIdCol.areValuesEqual(prev, row)) {
                                numEntities++;
                                newChain = true;
                                newResidue = true;
                            }
                            if (newResidue)
                                numResidues++;
                            if (newChain)
                                numChains++;
                            rowIndex[index] = row;
                            residueIndex[index] = numResidues;
                            chainIndex[index] = numChains;
                            entityIndex[index] = numEntities;
                            prev = row;
                        }
                        var modelId = !modelNumCol.isDefined ? Defaults.ModelId : modelNumCol.getString(startRow) || Defaults.ModelId;
                        return { atoms: atoms, positions: positions, modelId: modelId, endRow: endRow };
                    }
                    function buildStructure(columns, atoms) {
                        var count = atoms.count, residueIndexCol = atoms.residueIndex, chainIndexCol = atoms.chainIndex, entityIndexCol = atoms.entityIndex;
                        var residues = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Residues, atoms.residueIndex[atoms.count - 1] + 1), chains = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Chains, atoms.chainIndex[atoms.count - 1] + 1), entities = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Entities, atoms.entityIndex[atoms.count - 1] + 1);
                        var residueName = residues.name, residueSeqNumber = residues.seqNumber, residueAsymId = residues.asymId, residueAuthName = residues.authName, residueAuthSeqNumber = residues.authSeqNumber, residueAuthAsymId = residues.authAsymId, residueInsertionCode = residues.insCode, residueEntityId = residues.entityId, residueIsHet = residues.isHet, residueAtomStartIndex = residues.atomStartIndex, residueAtomEndIndex = residues.atomEndIndex, residueChainIndex = residues.chainIndex, residueEntityIndex = residues.entityIndex;
                        var chainAsymId = chains.asymId, chainEntityId = chains.entityId, chainAuthAsymId = chains.authAsymId, chainAtomStartIndex = chains.atomStartIndex, chainAtomEndIndex = chains.atomEndIndex, chainResidueStartIndex = chains.residueStartIndex, chainResidueEndIndex = chains.residueEndIndex, chainEntityIndex = chains.entityIndex;
                        var entityId = entities.entityId, entityType = entities.type, entityAtomStartIndex = entities.atomStartIndex, entityAtomEndIndex = entities.atomEndIndex, entityResidueStartIndex = entities.residueStartIndex, entityResidueEndIndex = entities.residueEndIndex, entityChainStartIndex = entities.chainStartIndex, entityChainEndIndex = entities.chainEndIndex;
                        var resNameCol = columns.get('label_comp_id'), resSeqNumberCol = columns.get('label_seq_id'), asymIdCol = columns.get('label_asym_id'), authResNameCol = columns.get('auth_comp_id'), authResSeqNumberCol = columns.get('auth_seq_id'), authAsymIdCol = columns.get('auth_asym_id'), isHetCol = columns.get('group_PDB'), entityCol = columns.get('label_entity_id'), insCodeCol = columns.get('pdbx_PDB_ins_code');
                        var residueStart = 0, chainStart = 0, entityStart = 0, entityChainStart = 0, entityResidueStart = 0, chainResidueStart = 0, currentResidue = 0, currentChain = 0, currentEntity = 0;
                        var i = 0;
                        for (i = 0; i < count; i++) {
                            if (residueIndexCol[i] !== residueIndexCol[residueStart]) {
                                residueName[currentResidue] = resNameCol.getString(residueStart) || Defaults.ResidueName;
                                residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
                                residueAsymId[currentResidue] = asymIdCol.getString(residueStart) || Defaults.AsymId;
                                residueAuthName[currentResidue] = authResNameCol.getString(residueStart) || residueName[currentResidue];
                                residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
                                residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart) || residueAsymId[currentResidue];
                                residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
                                residueEntityId[currentResidue] = entityCol.getString(residueStart) || Defaults.EntityId;
                                residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;
                                residueAtomStartIndex[currentResidue] = residueStart;
                                residueAtomEndIndex[currentResidue] = i;
                                residueChainIndex[currentResidue] = currentChain;
                                residueEntityIndex[currentResidue] = currentEntity;
                                currentResidue++;
                                residueStart = i;
                            }
                            if (chainIndexCol[i] !== chainIndexCol[chainStart]) {
                                chainAsymId[currentChain] = asymIdCol.getString(chainStart) || Defaults.AsymId;
                                chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart) || chainAsymId[currentChain];
                                chainEntityId[currentChain] = entityCol.getString(chainStart) || Defaults.EntityId;
                                chainResidueStartIndex[currentChain] = chainResidueStart;
                                chainResidueEndIndex[currentChain] = currentResidue;
                                chainAtomStartIndex[currentChain] = chainStart;
                                chainAtomEndIndex[currentChain] = i;
                                chainEntityIndex[currentChain] = currentEntity;
                                currentChain++;
                                chainStart = i;
                                chainResidueStart = currentResidue;
                            }
                            if (entityIndexCol[i] !== entityIndexCol[entityStart]) {
                                entityId[currentEntity] = entityCol.getString(entityStart) || Defaults.EntityId;
                                entityType[currentEntity] = 'unknown';
                                entityAtomStartIndex[currentEntity] = entityStart;
                                entityAtomEndIndex[currentEntity] = i;
                                entityResidueStartIndex[currentEntity] = entityResidueStart;
                                entityResidueEndIndex[currentEntity] = currentResidue;
                                entityChainStartIndex[currentEntity] = entityChainStart;
                                entityChainEndIndex[currentEntity] = currentChain;
                                currentEntity++;
                                entityStart = i;
                                entityChainStart = currentChain;
                                entityResidueStart = currentResidue;
                            }
                        }
                        // entity
                        entityId[currentEntity] = entityCol.getString(entityStart) || Defaults.EntityId;
                        entityType[currentEntity] = 'unknown';
                        entityAtomStartIndex[currentEntity] = entityStart;
                        entityAtomEndIndex[currentEntity] = i;
                        entityResidueStartIndex[currentEntity] = entityResidueStart;
                        entityResidueEndIndex[currentEntity] = currentResidue + 1;
                        entityChainStartIndex[currentEntity] = entityChainStart;
                        entityChainEndIndex[currentEntity] = currentChain + 1;
                        // chain
                        chainAsymId[currentChain] = asymIdCol.getString(chainStart) || Defaults.AsymId;
                        chainAuthAsymId[currentChain] = authAsymIdCol.getString(chainStart) || chainAsymId[currentChain];
                        chainEntityId[currentChain] = entityCol.getString(chainStart) || Defaults.EntityId;
                        chainResidueStartIndex[currentChain] = chainResidueStart;
                        chainResidueEndIndex[currentChain] = currentResidue + 1;
                        chainAtomStartIndex[currentChain] = chainStart;
                        chainAtomEndIndex[currentChain] = i;
                        chainEntityIndex[currentChain] = currentEntity;
                        // residue
                        residueName[currentResidue] = resNameCol.getString(residueStart) || Defaults.ResidueName;
                        residueSeqNumber[currentResidue] = resSeqNumberCol.getInteger(residueStart);
                        residueAsymId[currentResidue] = asymIdCol.getString(residueStart) || Defaults.AsymId;
                        residueAuthName[currentResidue] = authResNameCol.getString(residueStart) || residueName[currentResidue];
                        residueAuthSeqNumber[currentResidue] = authResSeqNumberCol.getInteger(residueStart);
                        residueAuthAsymId[currentResidue] = authAsymIdCol.getString(residueStart) || residueAsymId[currentResidue];
                        residueInsertionCode[currentResidue] = insCodeCol.getString(residueStart);
                        residueAtomStartIndex[currentResidue] = residueStart;
                        residueAtomEndIndex[currentResidue] = i;
                        residueChainIndex[currentResidue] = currentChain;
                        residueEntityIndex[currentResidue] = currentEntity;
                        residueIsHet[currentResidue] = isHetCol.stringEquals(residueStart, 'HETATM') ? 1 : 0;
                        return { residues: residues, chains: chains, entities: entities };
                    }
                    function assignEntityTypes(category, entities) {
                        var i;
                        if (!category) {
                            return;
                        }
                        var data = {}, typeCol = category.getColumn('type'), idCol = category.getColumn('id');
                        for (i = 0; i < category.rowCount; i++) {
                            var t = (typeCol.getString(i) || '').toLowerCase();
                            var eId = idCol.getString(i) || Defaults.EntityId;
                            switch (t) {
                                case 'polymer':
                                case 'non-polymer':
                                case 'water':
                                    data[eId] = t;
                                    break;
                                default:
                                    data[eId] = 'unknown';
                                    break;
                            }
                        }
                        for (i = 0; i < entities.count; i++) {
                            var et = data[entities.entityId[i]];
                            if (et !== void 0) {
                                entities.type[i] = et;
                            }
                        }
                    }
                    function residueIdfromColumns(row, asymId, seqNum, insCode) {
                        return new Core.Structure.PolyResidueIdentifier(asymId.getString(row) || Defaults.AsymId, seqNum.getInteger(row), insCode.getString(row));
                    }
                    var aminoAcidNames = { 'ALA': true, 'ARG': true, 'ASP': true, 'CYS': true, 'GLN': true, 'GLU': true, 'GLY': true, 'HIS': true, 'ILE': true, 'LEU': true, 'LYS': true, 'MET': true, 'PHE': true, 'PRO': true, 'SER': true, 'THR': true, 'TRP': true, 'TYR': true, 'VAL': true, 'ASN': true, 'PYL': true, 'SEC': true };
                    function isResidueAminoSeq(atoms, residues, entities, index) {
                        if (entities.type[residues.entityIndex[index]] !== 'polymer')
                            return false;
                        //if (mmCif.aminoAcidNames[residues.name[index]]) return true;
                        var ca = false, o = false, names = atoms.name, assigned = 0;
                        for (var i = residues.atomStartIndex[index], max = residues.atomEndIndex[index]; i < max; i++) {
                            var n = names[i];
                            if (!ca && n === 'CA') {
                                ca = true;
                                assigned++;
                            }
                            else if (!o && n === 'O') {
                                o = true;
                                assigned++;
                            }
                            if (assigned === 2)
                                break;
                        }
                        return (ca && o) || (ca && !residues.isHet[index]);
                    }
                    function isResidueNucleotide(atoms, residues, entities, index) {
                        if (aminoAcidNames[residues.name[index]] || entities.type[residues.entityIndex[index]] !== 'polymer')
                            return false;
                        var names = atoms.name, assigned = 0;
                        var start = residues.atomStartIndex[index], end = residues.atomEndIndex[index];
                        // test for single atom instances
                        if (end - start === 1 && !residues.isHet[start] && names[start] === 'P') {
                            return true;
                        }
                        for (var i = start; i < end; i++) {
                            var n = names[i];
                            if (n === "O5'" || n === "C3'" || n === "N3" || n === "P") {
                                assigned++;
                            }
                            if (assigned >= 3) {
                                return true;
                            }
                        }
                        return false;
                    }
                    function analyzeSecondaryStructure(atoms, residues, entities, start, end, elements) {
                        var asymId = residues.asymId, entityIndex = residues.entityIndex, currentType = 0 /* None */, currentElementStartIndex = start, currentResidueIndex = start, residueCount = end;
                        while (currentElementStartIndex < residueCount) {
                            if (isResidueNucleotide(atoms, residues, entities, currentElementStartIndex)) {
                                currentResidueIndex = currentElementStartIndex + 1;
                                while (currentResidueIndex < residueCount
                                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                                    && isResidueNucleotide(atoms, residues, entities, currentResidueIndex)) {
                                    currentResidueIndex++;
                                }
                                currentType = 5 /* Strand */;
                            }
                            else if (isResidueAminoSeq(atoms, residues, entities, currentElementStartIndex)) {
                                currentResidueIndex = currentElementStartIndex + 1;
                                while (currentResidueIndex < residueCount
                                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                                    && isResidueAminoSeq(atoms, residues, entities, currentResidueIndex)) {
                                    currentResidueIndex++;
                                }
                                currentType = 4 /* AminoSeq */;
                            }
                            else {
                                currentResidueIndex = currentElementStartIndex + 1;
                                while (currentResidueIndex < residueCount
                                    && asymId[currentElementStartIndex] === asymId[currentResidueIndex]
                                    && entityIndex[currentElementStartIndex] === entityIndex[currentResidueIndex]
                                    && !isResidueNucleotide(atoms, residues, entities, currentResidueIndex)
                                    && !isResidueAminoSeq(atoms, residues, entities, currentResidueIndex)) {
                                    currentResidueIndex++;
                                }
                                currentType = 0 /* None */;
                            }
                            var e = new Core.Structure.SecondaryStructureElement(currentType, new Core.Structure.PolyResidueIdentifier(residues.asymId[currentElementStartIndex], residues.seqNumber[currentElementStartIndex], residues.insCode[currentElementStartIndex]), new Core.Structure.PolyResidueIdentifier(residues.asymId[currentResidueIndex - 1], residues.seqNumber[currentResidueIndex - 1], residues.insCode[currentResidueIndex - 1]));
                            e.startResidueIndex = currentElementStartIndex;
                            e.endResidueIndex = currentResidueIndex;
                            elements[elements.length] = e;
                            currentElementStartIndex = currentResidueIndex;
                        }
                    }
                    function splitNonconsecutiveSecondaryStructure(residues, elements) {
                        var ret = [];
                        var authSeqNumber = residues.authSeqNumber;
                        for (var _a = 0, elements_1 = elements; _a < elements_1.length; _a++) {
                            var s = elements_1[_a];
                            var partStart = s.startResidueIndex;
                            var end = s.endResidueIndex - 1;
                            for (var i = s.startResidueIndex; i < end; i++) {
                                if (authSeqNumber[i + 1] - authSeqNumber[i] === 1)
                                    continue;
                                var e = new Core.Structure.SecondaryStructureElement(s.type, s.startResidueId, s.endResidueId, s.info);
                                e.startResidueIndex = partStart;
                                e.endResidueIndex = i + 1;
                                ret[ret.length] = e;
                                partStart = i + 1;
                            }
                            if (partStart === s.startResidueIndex) {
                                ret[ret.length] = s;
                            }
                            else {
                                var e = new Core.Structure.SecondaryStructureElement(s.type, s.startResidueId, s.endResidueId, s.info);
                                e.startResidueIndex = partStart;
                                e.endResidueIndex = s.endResidueIndex;
                                ret[ret.length] = e;
                            }
                        }
                        return ret;
                    }
                    function updateSSIndicesAndFilterEmpty(elements, structure) {
                        var residues = structure.residues, count = residues.count, asymId = residues.asymId, seqNumber = residues.seqNumber, insCode = residues.insCode, currentElement = void 0, key = '', starts = Core.Utils.FastMap.create(), ends = Core.Utils.FastMap.create();
                        for (var _a = 0, elements_2 = elements; _a < elements_2.length; _a++) {
                            var e = elements_2[_a];
                            key = e.startResidueId.asymId + ' ' + e.startResidueId.seqNumber;
                            if (e.startResidueId.insCode)
                                key += ' ' + e.startResidueId.insCode;
                            starts.set(key, e);
                            key = e.endResidueId.asymId + ' ' + e.endResidueId.seqNumber;
                            if (e.endResidueId.insCode)
                                key += ' ' + e.endResidueId.insCode;
                            ends.set(key, e);
                        }
                        for (var i = 0; i < count; i++) {
                            key = asymId[i] + ' ' + seqNumber[i];
                            if (insCode[i])
                                key += ' ' + insCode[i];
                            currentElement = starts.get(key);
                            if (currentElement) {
                                currentElement.startResidueIndex = i;
                                currentElement.endResidueIndex = i + 1;
                            }
                            currentElement = ends.get(key);
                            if (currentElement) {
                                if (currentElement.startResidueIndex < 0)
                                    currentElement.startResidueIndex = i;
                                currentElement.endResidueIndex = i + 1;
                            }
                        }
                        if (currentElement) {
                            currentElement.endResidueIndex = count;
                        }
                        var nonEmpty = [];
                        for (var _b = 0, elements_3 = elements; _b < elements_3.length; _b++) {
                            var e = elements_3[_b];
                            if (e.startResidueIndex < 0 || e.endResidueIndex < 0)
                                continue;
                            if (e.type === 3 /* Sheet */ && e.length < 3)
                                continue;
                            if (e.endResidueIndex >= 0 && e.startResidueIndex >= 0)
                                nonEmpty[nonEmpty.length] = e;
                        }
                        nonEmpty.sort(function (a, b) { return a.startResidueIndex - b.startResidueIndex; });
                        // fix one-off "overlaps" for helices
                        for (var i = 0; i < nonEmpty.length - 1; i++) {
                            if (nonEmpty[i + 1].startResidueIndex - nonEmpty[i].endResidueIndex === -1) {
                                nonEmpty[i + 1].startResidueIndex++;
                            }
                        }
                        if (!nonEmpty.length)
                            return nonEmpty;
                        var ret = [nonEmpty[0]];
                        // handle overlapping structures.
                        for (var i = 1; i < nonEmpty.length; i++) {
                            var a = ret[ret.length - 1], b = nonEmpty[i];
                            if (b.startResidueIndex < a.endResidueIndex) {
                                handleSecondaryStructureCollision(a, b);
                            }
                            else {
                                ret[ret.length] = b;
                            }
                        }
                        return ret;
                    }
                    function handleSecondaryStructureCollision(a, b) {
                        if (b.endResidueIndex > a.endResidueIndex) {
                            a.endResidueIndex = b.endResidueIndex;
                        }
                    }
                    function getSecondaryStructureInfo(data, atoms, structure) {
                        var input = [], elements = [];
                        var _struct_conf = data.getCategory('_struct_conf'), _struct_sheet_range = data.getCategory('_struct_sheet_range'), i;
                        if (_struct_conf) {
                            var type_id_col = _struct_conf.getColumn('conf_type_id');
                            if (type_id_col) {
                                var beg_label_asym_id = _struct_conf.getColumn('beg_label_asym_id');
                                var beg_label_seq_id = _struct_conf.getColumn('beg_label_seq_id');
                                var pdbx_beg_PDB_ins_code = _struct_conf.getColumn('pdbx_beg_PDB_ins_code');
                                var end_label_asym_id = _struct_conf.getColumn('end_label_asym_id');
                                var end_label_seq_id = _struct_conf.getColumn('end_label_seq_id');
                                var pdbx_end_PDB_ins_code = _struct_conf.getColumn('pdbx_end_PDB_ins_code');
                                var pdbx_PDB_helix_class = _struct_conf.getColumn('pdbx_PDB_helix_class');
                                for (i = 0; i < _struct_conf.rowCount; i++) {
                                    var type = void 0;
                                    switch ((type_id_col.getString(i) || '').toUpperCase()) {
                                        case 'HELX_P':
                                            type = 1 /* Helix */;
                                            break;
                                        case 'TURN_P':
                                            type = 2 /* Turn */;
                                            break;
                                    }
                                    if (!type)
                                        continue;
                                    input[input.length] = new Core.Structure.SecondaryStructureElement(type, residueIdfromColumns(i, beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code), residueIdfromColumns(i, end_label_asym_id, end_label_seq_id, pdbx_end_PDB_ins_code), {
                                        helixClass: pdbx_PDB_helix_class.getString(i)
                                    });
                                }
                            }
                        }
                        if (_struct_sheet_range) {
                            var beg_label_asym_id = _struct_sheet_range.getColumn('beg_label_asym_id');
                            var beg_label_seq_id = _struct_sheet_range.getColumn('beg_label_seq_id');
                            var pdbx_beg_PDB_ins_code = _struct_sheet_range.getColumn('pdbx_beg_PDB_ins_code');
                            var end_label_asym_id = _struct_sheet_range.getColumn('end_label_asym_id');
                            var end_label_seq_id = _struct_sheet_range.getColumn('end_label_seq_id');
                            var pdbx_end_PDB_ins_code = _struct_sheet_range.getColumn('pdbx_end_PDB_ins_code');
                            var symmetry = _struct_sheet_range.getColumn('symmetry');
                            var sheet_id = _struct_sheet_range.getColumn('sheet_id');
                            var id = _struct_sheet_range.getColumn('id');
                            for (i = 0; i < _struct_sheet_range.rowCount; i++) {
                                input[input.length] = new Core.Structure.SecondaryStructureElement(3 /* Sheet */, residueIdfromColumns(i, beg_label_asym_id, beg_label_seq_id, pdbx_beg_PDB_ins_code), residueIdfromColumns(i, end_label_asym_id, end_label_seq_id, pdbx_end_PDB_ins_code), {
                                    symmetry: symmetry.getString(i),
                                    sheetId: sheet_id.getString(i),
                                    id: id.getString(i)
                                });
                            }
                        }
                        var secondary = input.length > 0 ? updateSSIndicesAndFilterEmpty(input, structure) : [];
                        var residues = structure.residues, residueCount = residues.count;
                        if (secondary.length === 0) {
                            analyzeSecondaryStructure(atoms, residues, structure.entities, 0, residueCount, elements);
                            return splitNonconsecutiveSecondaryStructure(residues, elements);
                        }
                        var _max = secondary.length - 1;
                        if (secondary[0].startResidueIndex > 0) {
                            analyzeSecondaryStructure(atoms, residues, structure.entities, 0, secondary[0].startResidueIndex, elements);
                        }
                        for (i = 0; i < _max; i++) {
                            elements[elements.length] = secondary[i];
                            if (secondary[i + 1].startResidueIndex - secondary[i].endResidueIndex > 0) {
                                analyzeSecondaryStructure(atoms, residues, structure.entities, secondary[i].endResidueIndex, secondary[i + 1].startResidueIndex, elements);
                            }
                        }
                        elements[elements.length] = secondary[_max];
                        if (secondary[_max].endResidueIndex < residueCount) {
                            analyzeSecondaryStructure(atoms, residues, structure.entities, secondary[_max].endResidueIndex, residueCount, elements);
                        }
                        return splitNonconsecutiveSecondaryStructure(residues, elements);
                    }
                    function assignSecondaryStructureIndex(residues, ss) {
                        var ssIndex = residues.secondaryStructureIndex;
                        var index = 0;
                        for (var _a = 0, ss_1 = ss; _a < ss_1.length; _a++) {
                            var s = ss_1[_a];
                            for (var i = s.startResidueIndex; i < s.endResidueIndex; i++) {
                                ssIndex[i] = index;
                            }
                            index++;
                        }
                        return ssIndex;
                    }
                    function findResidueIndexByLabel(structure, asymId, seqNumber, insCode) {
                        var _a = structure.chains, _asymId = _a.asymId, residueStartIndex = _a.residueStartIndex, residueEndIndex = _a.residueEndIndex, cCount = _a.count;
                        var _b = structure.residues, _seqNumber = _b.seqNumber, _insCode = _b.insCode;
                        for (var cI = 0; cI < cCount; cI++) {
                            if (_asymId[cI] !== asymId)
                                continue;
                            for (var rI = residueStartIndex[cI], _r = residueEndIndex[cI]; rI < _r; rI++) {
                                if (_seqNumber[rI] === seqNumber && _insCode[rI] === insCode)
                                    return rI;
                            }
                        }
                        return -1;
                    }
                    function findAtomIndexByLabelName(atoms, structure, residueIndex, atomName, altLoc) {
                        var _a = structure.residues, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex;
                        var _atomName = atoms.name, _altLoc = atoms.altLoc;
                        for (var i = atomStartIndex[residueIndex], _i = atomEndIndex[residueIndex]; i <= _i; i++) {
                            if (_atomName[i] === atomName && _altLoc[i] === altLoc)
                                return i;
                        }
                        return -1;
                    }
                    function getModRes(data) {
                        var cat = data.getCategory('_pdbx_struct_mod_residue');
                        if (!cat)
                            return void 0;
                        var table = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.ModifiedResidues, cat.rowCount);
                        var label_asym_id = cat.getColumn('label_asym_id');
                        var label_seq_id = cat.getColumn('label_seq_id');
                        var PDB_ins_code = cat.getColumn('PDB_ins_code');
                        var parent_comp_id = cat.getColumn('parent_comp_id');
                        var _details = cat.getColumn('details');
                        var asymId = table.asymId, seqNumber = table.seqNumber, insCode = table.insCode, parent = table.parent, details = table.details;
                        for (var i = 0, __i = cat.rowCount; i < __i; i++) {
                            asymId[i] = label_asym_id.getString(i);
                            seqNumber[i] = label_seq_id.getInteger(i);
                            insCode[i] = PDB_ins_code.getString(i);
                            parent[i] = parent_comp_id.getString(i);
                            details[i] = _details.getString(i);
                        }
                        return table;
                    }
                    function getStructConn(data, atoms, structure) {
                        var cat = data.getCategory('_struct_conn');
                        if (!cat)
                            return void 0;
                        var _idCols = function (i) { return ({
                            label_asym_id: cat.getColumn('ptnr' + i + '_label_asym_id'),
                            label_seq_id: cat.getColumn('ptnr' + i + '_label_seq_id'),
                            label_atom_id: cat.getColumn('ptnr' + i + '_label_atom_id'),
                            label_alt_id: cat.getColumn('pdbx_ptnr' + i + '_label_alt_id'),
                            ins_code: cat.getColumn('pdbx_ptnr' + i + '_PDB_ins_code'),
                            symmetry: cat.getColumn('ptnr' + i + '_symmetry')
                        }); };
                        var conn_type_id = cat.getColumn('conn_type_id');
                        var pdbx_dist_value = cat.getColumn('pdbx_dist_value');
                        var pdbx_value_order = cat.getColumn('pdbx_value_order');
                        var p1 = _idCols(1);
                        var p2 = _idCols(2);
                        var p3 = _idCols(3);
                        var _p = function (row, ps) {
                            if (ps.label_asym_id.getValuePresence(row) !== 0 /* Present */)
                                return void 0;
                            var residueIndex = findResidueIndexByLabel(structure, ps.label_asym_id.getString(row), ps.label_seq_id.getInteger(row), ps.ins_code.getString(row));
                            if (residueIndex < 0)
                                return void 0;
                            var atomIndex = findAtomIndexByLabelName(atoms, structure, residueIndex, ps.label_atom_id.getString(row), ps.label_alt_id.getString(row));
                            if (atomIndex < 0)
                                return void 0;
                            return { residueIndex: residueIndex, atomIndex: atomIndex, symmetry: ps.symmetry.getString(row) || '1_555' };
                        };
                        var _ps = function (row) {
                            var ret = [];
                            var p = _p(row, p1);
                            if (p)
                                ret.push(p);
                            p = _p(row, p2);
                            if (p)
                                ret.push(p);
                            p = _p(row, p3);
                            if (p)
                                ret.push(p);
                            return ret;
                        };
                        var entries = [];
                        for (var i = 0; i < cat.rowCount; i++) {
                            var partners = _ps(i);
                            if (partners.length < 2)
                                continue;
                            var type = conn_type_id.getString(i);
                            var orderType = (pdbx_value_order.getString(i) || '').toLowerCase();
                            var bondType = 0 /* Unknown */;
                            switch (orderType) {
                                case 'sing':
                                    bondType = 1 /* Single */;
                                    break;
                                case 'doub':
                                    bondType = 2 /* Double */;
                                    break;
                                case 'trip':
                                    bondType = 3 /* Triple */;
                                    break;
                                case 'quad':
                                    bondType = 4 /* Aromatic */;
                                    break;
                            }
                            switch (type) {
                                case 'disulf':
                                    bondType = 5 /* DisulfideBridge */;
                                    break;
                                case 'hydrog':
                                    bondType = 8 /* Hydrogen */;
                                    break;
                                case 'metalc':
                                    bondType = 6 /* Metallic */;
                                    break;
                                //case 'mismat': bondType = Structure.BondType.Single; break; 
                                case 'saltbr':
                                    bondType = 7 /* Ion */;
                                    break;
                            }
                            entries.push({
                                bondType: bondType,
                                distance: pdbx_dist_value.getFloat(i),
                                partners: partners
                            });
                        }
                        return new Core.Structure.StructConn(entries);
                    }
                    function parseOperatorList(value) {
                        // '(X0)(1-5)' becomes [['X0']['1', '2', '3', '4', '5']]
                        // kudos to Glen van Ginkel.
                        var oeRegex = /\(?([^\(\)]+)\)?]*/g, g, groups = [], ret = [];
                        while (g = oeRegex.exec(value))
                            groups[groups.length] = g[1];
                        groups.forEach(function (g) {
                            var group = [];
                            g.split(',').forEach(function (e) {
                                var dashIndex = e.indexOf('-');
                                if (dashIndex > 0) {
                                    var from = parseInt(e.substring(0, dashIndex)), to = parseInt(e.substr(dashIndex + 1));
                                    for (var i = from; i <= to; i++)
                                        group[group.length] = i.toString();
                                }
                                else {
                                    group[group.length] = e.trim();
                                }
                            });
                            ret[ret.length] = group;
                        });
                        return ret;
                    }
                    function getAssemblyInfo(data) {
                        var _info = data.getCategory('_pdbx_struct_assembly'), _gen = data.getCategory('_pdbx_struct_assembly_gen'), _opers = data.getCategory('_pdbx_struct_oper_list');
                        if (!_info || !_gen || !_opers) {
                            return void 0;
                        }
                        var i, opers = {}, gens = [], genMap = Core.Utils.FastMap.create();
                        var assembly_id = _gen.getColumn('assembly_id');
                        var oper_expression = _gen.getColumn('oper_expression');
                        var asym_id_list = _gen.getColumn('asym_id_list');
                        for (i = 0; i < _gen.rowCount; i++) {
                            var id = assembly_id.getString(i);
                            if (!id) {
                                return void 0;
                            }
                            var entry = genMap.get(id);
                            if (!entry) {
                                entry = new Core.Structure.AssemblyGen(id);
                                genMap.set(id, entry);
                                gens.push(entry);
                            }
                            entry.gens.push(new Core.Structure.AssemblyGenEntry(parseOperatorList(oper_expression.getString(i)), asym_id_list.getString(i).split(',')));
                        }
                        var _pdbx_struct_oper_list_id = _opers.getColumn('id');
                        var _pdbx_struct_oper_list_name = _opers.getColumn('name');
                        for (i = 0; i < _opers.rowCount; i++) {
                            var oper = getTransform(_opers, 'matrix', 'vector', i);
                            if (!oper) {
                                return void 0;
                            }
                            var op = new Core.Structure.AssemblyOperator(_pdbx_struct_oper_list_id.getString(i), _pdbx_struct_oper_list_name.getString(i), oper);
                            opers[op.id] = op;
                        }
                        return new Core.Structure.AssemblyInfo(opers, gens);
                    }
                    function getSymmetryInfo(data) {
                        var _cell = data.getCategory('_cell'), _symmetry = data.getCategory('_symmetry'), _atom_sites = data.getCategory('_atom_sites');
                        var spacegroupName = '', cellSize = [1.0, 1.0, 1.0], cellAngles = [90.0, 90.0, 90.0], toFracTransform = Core.Geometry.LinearAlgebra.Matrix4.identity(), isNonStandardCrytalFrame = false;
                        if (!_cell || !_symmetry) {
                            return void 0;
                        }
                        spacegroupName = _symmetry.getColumn('space_group_name_H-M').getString(0);
                        cellSize = [_cell.getColumn('length_a').getFloat(0), _cell.getColumn('length_b').getFloat(0), _cell.getColumn('length_c').getFloat(0)];
                        cellAngles = [_cell.getColumn('angle_alpha').getFloat(0), _cell.getColumn('angle_beta').getFloat(0), _cell.getColumn('angle_gamma').getFloat(0)];
                        if (!spacegroupName || cellSize.every(function (s) { return isNaN(s) || s === 0.0; }) || cellSize.every(function (s) { return isNaN(s) || s === 0.0; })) {
                            return void 0;
                        }
                        var sq = function (x) { return x * x; };
                        var toRadians = function (degs) { return degs * Math.PI / 180.0; };
                        var la = cellSize[0], lb = cellSize[1], lc = cellSize[2], aa = toRadians(cellAngles[0]), ab = toRadians(cellAngles[1]), ac = toRadians(cellAngles[2]), v = la * lb * lc * Math.sqrt(1.0 - sq(Math.cos(aa)) - sq(Math.cos(ab)) - sq(Math.cos(ac)) + 2.0 * Math.cos(aa) * Math.cos(ab) * Math.cos(ac));
                        var fromFrac = Core.Geometry.LinearAlgebra.Matrix4.ofRows([
                            [la, lb * Math.cos(ac), lc * Math.cos(ab), 0.0],
                            [0.0, lb * Math.sin(ac), lc * (Math.cos(aa) - Math.cos(ab) * Math.cos(ac)) / Math.sin(ac), 0.0],
                            [0.0, 0.0, v / (la * lb * Math.sin(ac)), 0.0],
                            [0.0, 0.0, 0.0, 1.0]
                        ]);
                        var toFracComputed = Core.Geometry.LinearAlgebra.Matrix4.identity();
                        Core.Geometry.LinearAlgebra.Matrix4.invert(toFracComputed, fromFrac);
                        if (_atom_sites) {
                            var transform = getTransform(_atom_sites, 'fract_transf_matrix', 'fract_transf_vector', 0);
                            if (transform) {
                                toFracTransform = transform;
                                if (!Core.Geometry.LinearAlgebra.Matrix4.areEqual(toFracComputed, transform, 0.0001)) {
                                    isNonStandardCrytalFrame = true;
                                }
                            }
                        }
                        else {
                            toFracTransform = toFracComputed;
                        }
                        return new Core.Structure.SymmetryInfo(spacegroupName, cellSize, cellAngles, toFracTransform, isNonStandardCrytalFrame);
                    }
                    function getComponentBonds(category) {
                        if (!category || !category.rowCount)
                            return void 0;
                        var info = new Core.Structure.ComponentBondInfo();
                        var idCol = category.getColumn('comp_id'), nameACol = category.getColumn('atom_id_1'), nameBCol = category.getColumn('atom_id_2'), orderCol = category.getColumn('value_order'), count = category.rowCount;
                        var entry = info.newEntry(idCol.getString(0));
                        for (var i = 0; i < count; i++) {
                            var id = idCol.getString(i), nameA = nameACol.getString(i), nameB = nameBCol.getString(i), order = orderCol.getString(i);
                            if (entry.id !== id) {
                                entry = info.newEntry(id);
                            }
                            var t = void 0;
                            switch (order.toLowerCase()) {
                                case 'sing':
                                    t = 1 /* Single */;
                                    break;
                                case 'doub':
                                case 'delo':
                                    t = 2 /* Double */;
                                    break;
                                case 'trip':
                                    t = 3 /* Triple */;
                                    break;
                                case 'quad':
                                    t = 4 /* Aromatic */;
                                    break;
                                default:
                                    t = 0 /* Unknown */;
                                    break;
                            }
                            entry.add(nameA, nameB, t);
                        }
                        return info;
                    }
                    function getModel(startRow, data, atomSiteColumns) {
                        var _a = buildModelAtomTable(startRow, data.getCategory('_atom_site').rowCount, atomSiteColumns), atoms = _a.atoms, positions = _a.positions, modelId = _a.modelId, endRow = _a.endRow, structure = buildStructure(atomSiteColumns, atoms), entry = data.getCategory('_entry'), id;
                        if (entry && entry.getColumn('id').isDefined)
                            id = entry.getColumn('id').getString(0);
                        else
                            id = data.header;
                        assignEntityTypes(data.getCategory('_entity'), structure.entities);
                        var ss = getSecondaryStructureInfo(data, atoms, structure);
                        assignSecondaryStructureIndex(structure.residues, ss);
                        return {
                            model: Core.Structure.Molecule.Model.create({
                                id: id,
                                modelId: modelId,
                                data: {
                                    atoms: atoms,
                                    residues: structure.residues,
                                    chains: structure.chains,
                                    entities: structure.entities,
                                    bonds: {
                                        structConn: getStructConn(data, atoms, structure),
                                        component: getComponentBonds(data.getCategory('_chem_comp_bond'))
                                    },
                                    modifiedResidues: getModRes(data),
                                    secondaryStructure: ss,
                                    symmetryInfo: getSymmetryInfo(data),
                                    assemblyInfo: getAssemblyInfo(data),
                                },
                                positions: positions,
                                source: Core.Structure.Molecule.Model.Source.File
                            }),
                            endRow: endRow
                        };
                    }
                    function ofDataBlock(data) {
                        var models = [], atomSite = data.getCategory('_atom_site'), startRow = 0;
                        if (!atomSite) {
                            throw "'_atom_site' category is missing in the input.";
                        }
                        var entry = data.getCategory('_entry'), atomColumns = getAtomSiteColumns(atomSite), id;
                        if (entry && entry.getColumn('id').isDefined)
                            id = entry.getColumn('id').getString(0);
                        else
                            id = data.header;
                        while (startRow < atomSite.rowCount) {
                            var _a = getModel(startRow, data, atomColumns), model = _a.model, endRow = _a.endRow;
                            models.push(model);
                            startRow = endRow;
                        }
                        var experimentMethods = void 0;
                        var _exptl = data.getCategory('_exptl');
                        if (_exptl) {
                            experimentMethods = [];
                            var method = _exptl.getColumn('method');
                            for (var i = 0; i < _exptl.rowCount; i++) {
                                if (method.getValuePresence(i) !== 0 /* Present */)
                                    continue;
                                experimentMethods.push(method.getString(i));
                            }
                        }
                        return Core.Structure.Molecule.create(id, models, { experimentMethods: experimentMethods });
                    }
                    mmCIF.ofDataBlock = ofDataBlock;
                })(mmCIF = Molecule.mmCIF || (Molecule.mmCIF = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var PDB;
                (function (PDB) {
                    "use strict";
                    var MoleculeData = /** @class */ (function () {
                        function MoleculeData(header, crystInfo, models, data) {
                            this.header = header;
                            this.crystInfo = crystInfo;
                            this.models = models;
                            this.data = data;
                        }
                        MoleculeData.prototype.makeEntities = function () {
                            var data = [
                                "data_ent",
                                "loop_",
                                "_entity.id",
                                "_entity.type",
                                "_entity.src_method",
                                "_entity.pdbx_description",
                                "_entity.formula_weight",
                                "_entity.pdbx_number_of_molecules",
                                "_entity.details",
                                "_entity.pdbx_mutation",
                                "_entity.pdbx_fragment",
                                "_entity.pdbx_ec",
                                "1 polymer man polymer 0.0 0 ? ? ? ?",
                                "2 non-polymer syn non-polymer 0.0 0 ? ? ? ?",
                                "3 water nat water 0.0 0 ? ? ? ?"
                            ].join('\n');
                            var file = Formats.CIF.Text.parse(data);
                            if (file.isError) {
                                throw file.toString();
                            }
                            return file.result.dataBlocks[0].getCategory('_entity');
                        };
                        MoleculeData.prototype.toCifFile = function () {
                            var helpers = {
                                dot: PDB.Parser.getDotRange(this.data.length),
                                question: PDB.Parser.getQuestionmarkRange(this.data.length),
                                numberTokens: PDB.Parser.getNumberRanges(this.data.length),
                                data: this.data
                            };
                            var file = new Formats.CIF.Text.File(this.data);
                            var block = new Formats.CIF.Text.DataBlock(this.data, this.header.id);
                            file.dataBlocks.push(block);
                            block.addCategory(this.makeEntities());
                            if (this.crystInfo) {
                                var _a = this.crystInfo.toCifCategory(this.header.id), cell = _a.cell, symm = _a.symm;
                                block.addCategory(cell);
                                block.addCategory(symm);
                            }
                            block.addCategory(this.models.toCifCategory(block, helpers));
                            return file;
                        };
                        return MoleculeData;
                    }());
                    PDB.MoleculeData = MoleculeData;
                    var Header = /** @class */ (function () {
                        function Header(id) {
                            this.id = id;
                        }
                        return Header;
                    }());
                    PDB.Header = Header;
                    var CrystStructureInfo = /** @class */ (function () {
                        function CrystStructureInfo(record) {
                            this.record = record;
                        }
                        CrystStructureInfo.prototype.getValue = function (start, len) {
                            var ret = this.record.substr(6, 9).trim();
                            if (!ret.length)
                                return '.';
                            return ret;
                        };
                        CrystStructureInfo.prototype.toCifCategory = function (id) {
                            //COLUMNS       DATA TYPE      CONTENTS
                            //--------------------------------------------------------------------------------
                            //    1 - 6       Record name    "CRYST1"
                            //7 - 15       Real(9.3)      a (Angstroms)
                            //16 - 24       Real(9.3)      b (Angstroms)
                            //25 - 33       Real(9.3)      c (Angstroms)
                            //34 - 40       Real(7.2)      alpha (degrees)
                            //41 - 47       Real(7.2)      beta (degrees)
                            //48 - 54       Real(7.2)      gamma (degrees)
                            //56 - 66       LString        Space group       
                            //67 - 70       Integer        Z value           
                            var data = [
                                "_cell.entry_id           '" + id + "'",
                                "_cell.length_a           " + this.getValue(6, 9),
                                "_cell.length_b           " + this.getValue(15, 9),
                                "_cell.length_c           " + this.getValue(24, 9),
                                "_cell.angle_alpha        " + this.getValue(33, 7),
                                "_cell.angle_beta         " + this.getValue(40, 7),
                                "_cell.angle_gamma        " + this.getValue(48, 7),
                                "_cell.Z_PDB              " + this.getValue(66, 4),
                                "_cell.pdbx_unique_axis   ?",
                                "_symmetry.entry_id                         '" + id + "'",
                                "_symmetry.space_group_name_H-M             '" + this.getValue(55, 11) + "'",
                                "_symmetry.pdbx_full_space_group_name_H-M   ?",
                                "_symmetry.cell_setting                     ?",
                                "_symmetry.Int_Tables_number                ?",
                                "_symmetry.space_group_name_Hall            ?"
                            ].join('\n');
                            var cif = Formats.CIF.Text.parse(data);
                            if (cif.isError) {
                                throw new Error(cif.toString());
                            }
                            return {
                                cell: cif.result.dataBlocks[0].getCategory('_cell'),
                                symm: cif.result.dataBlocks[0].getCategory('_symmetry')
                            };
                        };
                        return CrystStructureInfo;
                    }());
                    PDB.CrystStructureInfo = CrystStructureInfo;
                    var SecondaryStructure = /** @class */ (function () {
                        function SecondaryStructure(helixTokens, sheetTokens) {
                            this.helixTokens = helixTokens;
                            this.sheetTokens = sheetTokens;
                        }
                        SecondaryStructure.prototype.toCifCategory = function (data) {
                            return void 0;
                        };
                        return SecondaryStructure;
                    }());
                    PDB.SecondaryStructure = SecondaryStructure;
                    var ModelData = /** @class */ (function () {
                        function ModelData(idToken, atomTokens, atomCount) {
                            this.idToken = idToken;
                            this.atomTokens = atomTokens;
                            this.atomCount = atomCount;
                        }
                        ModelData.prototype.writeToken = function (index, cifTokens) {
                            Core.Utils.ArrayBuilder.add2(cifTokens, this.atomTokens[2 * index], this.atomTokens[2 * index + 1]);
                        };
                        ModelData.prototype.writeTokenCond = function (index, cifTokens, dot) {
                            var s = this.atomTokens[2 * index];
                            var e = this.atomTokens[2 * index + 1];
                            if (s === e)
                                Core.Utils.ArrayBuilder.add2(cifTokens, dot.start, dot.end);
                            else
                                Core.Utils.ArrayBuilder.add2(cifTokens, s, e);
                        };
                        ModelData.prototype.writeRange = function (range, cifTokens) {
                            Core.Utils.ArrayBuilder.add2(cifTokens, range.start, range.end);
                        };
                        ModelData.prototype.tokenEquals = function (start, end, value, data) {
                            var len = value.length;
                            if (len !== end - start)
                                return false;
                            for (var i = value.length - 1; i >= 0; i--) {
                                if (data.charCodeAt(i + start) !== value.charCodeAt(i)) {
                                    return false;
                                }
                            }
                            return true;
                        };
                        ModelData.prototype.getEntityType = function (row, data) {
                            var o = row * 14;
                            if (this.tokenEquals(this.atomTokens[2 * o], this.atomTokens[2 * o + 1], "HETATM", data)) {
                                var s = this.atomTokens[2 * (o + 4)], e = this.atomTokens[2 * (o + 4) + 1];
                                if (this.tokenEquals(s, e, "HOH", data) || this.tokenEquals(s, e, "WTR", data) || this.tokenEquals(s, e, "SOL", data)) {
                                    return 3; // water
                                }
                                return 2; // non-polymer
                            }
                            else {
                                return 1; // polymer
                            }
                        };
                        ModelData.prototype.writeCifTokens = function (modelToken, cifTokens, helpers) {
                            var columnIndices = {
                                //COLUMNS        DATA TYPE       CONTENTS                            
                                //--------------------------------------------------------------------------------
                                // 1 -  6        Record name     "ATOM  "                                          
                                RECORD: 0,
                                // 7 - 11        Integer         Atom serial number.                   
                                SERIAL: 1,
                                //13 - 16        Atom            Atom name.          
                                ATOM_NAME: 2,
                                //17             Character       Alternate location indicator. 
                                ALT_LOC: 3,
                                //18 - 20        Residue name    Residue name.       
                                RES_NAME: 4,
                                //22             Character       Chain identifier.         
                                CHAIN_ID: 5,
                                //23 - 26        Integer         Residue sequence number.              
                                RES_SEQN: 6,
                                //27             AChar           Code for insertion of residues.       
                                INS_CODE: 7,
                                //31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.   
                                X: 8,
                                //39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.                            
                                Y: 9,
                                //47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.        
                                Z: 10,
                                //55 - 60        Real(6.2)       Occupancy.       
                                OCCUPANCY: 11,
                                //61 - 66        Real(6.2)       Temperature factor (Default = 0.0).                   
                                TEMP_FACTOR: 12,
                                //73 - 76        LString(4)      Segment identifier, left-justified.   
                                // ignored
                                //77 - 78        LString(2)      Element symbol, right-justified.   
                                ELEMENT: 13
                                //79 - 80        LString(2)      Charge on the atom.      
                                // ignored
                            };
                            var columnCount = 14;
                            for (var i = 0; i < this.atomCount; i++) {
                                var o = i * columnCount;
                                //_atom_site.group_PDB
                                this.writeToken(o + columnIndices.RECORD, cifTokens);
                                //_atom_site.id
                                this.writeToken(o + columnIndices.SERIAL, cifTokens);
                                //_atom_site.type_symbol
                                this.writeToken(o + columnIndices.ELEMENT, cifTokens);
                                //_atom_site.label_atom_id
                                this.writeToken(o + columnIndices.ATOM_NAME, cifTokens);
                                //_atom_site.label_alt_id
                                this.writeTokenCond(o + columnIndices.ALT_LOC, cifTokens, helpers.dot);
                                //_atom_site.label_comp_id
                                this.writeToken(o + columnIndices.RES_NAME, cifTokens);
                                //_atom_site.label_asym_id
                                this.writeToken(o + columnIndices.CHAIN_ID, cifTokens);
                                //_atom_site.label_entity_id
                                this.writeRange(helpers.numberTokens.get(this.getEntityType(i, helpers.data)), cifTokens);
                                //_atom_site.label_seq_id
                                this.writeToken(o + columnIndices.RES_SEQN, cifTokens);
                                //_atom_site.pdbx_PDB_ins_code
                                this.writeTokenCond(o + columnIndices.INS_CODE, cifTokens, helpers.dot);
                                //_atom_site.Cartn_x
                                this.writeToken(o + columnIndices.X, cifTokens);
                                //_atom_site.Cartn_y
                                this.writeToken(o + columnIndices.Y, cifTokens);
                                //_atom_site.Cartn_z
                                this.writeToken(o + columnIndices.Z, cifTokens);
                                //_atom_site.occupancy
                                this.writeToken(o + columnIndices.OCCUPANCY, cifTokens);
                                //_atom_site.B_iso_or_equiv
                                this.writeToken(o + columnIndices.TEMP_FACTOR, cifTokens);
                                //_atom_site.Cartn_x_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.Cartn_y_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.Cartn_z_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.occupancy_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.B_iso_or_equiv_esd
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.pdbx_formal_charge
                                this.writeRange(helpers.question, cifTokens);
                                //_atom_site.auth_seq_id
                                this.writeToken(o + columnIndices.RES_SEQN, cifTokens);
                                //_atom_site.auth_comp_id
                                this.writeToken(o + columnIndices.RES_NAME, cifTokens);
                                //_atom_site.auth_asym_id
                                this.writeToken(o + columnIndices.CHAIN_ID, cifTokens);
                                //_atom_site.auth_atom_id
                                this.writeToken(o + columnIndices.ATOM_NAME, cifTokens);
                                //_atom_site.pdbx_PDB_model_num 
                                this.writeRange(modelToken, cifTokens);
                            }
                        };
                        ModelData.COLUMNS = [
                            "_atom_site.group_PDB",
                            "_atom_site.id",
                            "_atom_site.type_symbol",
                            "_atom_site.label_atom_id",
                            "_atom_site.label_alt_id",
                            "_atom_site.label_comp_id",
                            "_atom_site.label_asym_id",
                            "_atom_site.label_entity_id",
                            "_atom_site.label_seq_id",
                            "_atom_site.pdbx_PDB_ins_code",
                            "_atom_site.Cartn_x",
                            "_atom_site.Cartn_y",
                            "_atom_site.Cartn_z",
                            "_atom_site.occupancy",
                            "_atom_site.B_iso_or_equiv",
                            "_atom_site.Cartn_x_esd",
                            "_atom_site.Cartn_y_esd",
                            "_atom_site.Cartn_z_esd",
                            "_atom_site.occupancy_esd",
                            "_atom_site.B_iso_or_equiv_esd",
                            "_atom_site.pdbx_formal_charge",
                            "_atom_site.auth_seq_id",
                            "_atom_site.auth_comp_id",
                            "_atom_site.auth_asym_id",
                            "_atom_site.auth_atom_id",
                            "_atom_site.pdbx_PDB_model_num"
                        ];
                        return ModelData;
                    }());
                    PDB.ModelData = ModelData;
                    var ModelsData = /** @class */ (function () {
                        function ModelsData(models) {
                            this.models = models;
                        }
                        ModelsData.prototype.toCifCategory = function (block, helpers) {
                            var atomCount = 0;
                            for (var _i = 0, _a = this.models; _i < _a.length; _i++) {
                                var m = _a[_i];
                                atomCount += m.atomCount;
                            }
                            var colCount = 26;
                            var tokens = Core.Utils.ArrayBuilder.forTokenIndices(atomCount * colCount);
                            for (var _b = 0, _c = this.models; _b < _c.length; _b++) {
                                var m = _c[_b];
                                m.writeCifTokens(m.idToken, tokens, helpers);
                            }
                            return new Formats.CIF.Text.Category(block.data, "_atom_site", 0, 0, ModelData.COLUMNS, tokens.array, atomCount * colCount);
                        };
                        return ModelsData;
                    }());
                    PDB.ModelsData = ModelsData;
                })(PDB = Molecule.PDB || (Molecule.PDB = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var PDB;
                (function (PDB) {
                    "use strict";
                    var Tokenizer = /** @class */ (function () {
                        function Tokenizer(data) {
                            this.data = data;
                            this.trimmedToken = { start: 0, end: 0 };
                            this.line = 0;
                            this.position = 0;
                            this.length = data.length;
                        }
                        Tokenizer.prototype.moveToNextLine = function () {
                            while (this.position < this.length && this.data.charCodeAt(this.position) !== 10) {
                                this.position++;
                            }
                            this.position++;
                            this.line++;
                            return this.position;
                        };
                        Tokenizer.prototype.moveToEndOfLine = function () {
                            while (this.position < this.length) {
                                var c = this.data.charCodeAt(this.position);
                                if (c === 10 || c === 13) { //  /n | /r
                                    return this.position;
                                }
                                this.position++;
                            }
                            return this.position;
                        };
                        Tokenizer.prototype.startsWith = function (start, value) {
                            for (var i = value.length - 1; i >= 0; i--) {
                                if (this.data.charCodeAt(i + start) !== value.charCodeAt(i)) {
                                    return false;
                                }
                            }
                            return true;
                        };
                        Tokenizer.prototype.trim = function (start, end) {
                            while (start < end && this.data.charCodeAt(start) === 32)
                                start++;
                            while (end > start && this.data.charCodeAt(end - 1) === 32)
                                end--;
                            this.trimmedToken.start = start;
                            this.trimmedToken.end = end;
                        };
                        Tokenizer.prototype.tokenizeAtomRecord = function (tokens) {
                            var startPos = this.position;
                            var start = this.position;
                            var end = this.moveToEndOfLine();
                            var length = end - start;
                            // invalid atom record
                            if (length < 60)
                                return false;
                            //COLUMNS        DATA TYPE       CONTENTS                            
                            //--------------------------------------------------------------------------------
                            // 1 -  6        Record name     "ATOM  "                                            
                            this.trim(start, start + 6);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            // 7 - 11        Integer         Atom serial number.                   
                            start = startPos + 6;
                            this.trim(start, start + 5);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //13 - 16        Atom            Atom name.          
                            start = startPos + 12;
                            this.trim(start, start + 4);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //17             Character       Alternate location indicator. 
                            if (this.data.charCodeAt(startPos + 16) === 32) { // ' '
                                Formats.TokenIndexBuilder.addToken(tokens, 0, 0);
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, startPos + 16, startPos + 17);
                            }
                            //18 - 20        Residue name    Residue name.       
                            start = startPos + 17;
                            this.trim(start, start + 3);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //22             Character       Chain identifier.         
                            Formats.TokenIndexBuilder.addToken(tokens, startPos + 21, startPos + 22);
                            //23 - 26        Integer         Residue sequence number.              
                            start = startPos + 22;
                            this.trim(start, start + 4);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //27             AChar           Code for insertion of residues.      
                            if (this.data.charCodeAt(startPos + 26) === 32) { // ' '
                                Formats.TokenIndexBuilder.addToken(tokens, 0, 0);
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, startPos + 26, startPos + 27);
                            }
                            //31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.   
                            start = startPos + 30;
                            this.trim(start, start + 8);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.                            
                            start = startPos + 38;
                            this.trim(start, start + 8);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.        
                            start = startPos + 46;
                            this.trim(start, start + 8);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //55 - 60        Real(6.2)       Occupancy.       
                            start = startPos + 54;
                            this.trim(start, start + 6);
                            Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            //61 - 66        Real(6.2)       Temperature factor (Default = 0.0).                   
                            if (length >= 66) {
                                start = startPos + 60;
                                this.trim(start, start + 6);
                                Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, 0, 0);
                            }
                            //73 - 76        LString(4)      Segment identifier, left-justified.   
                            // ignored
                            //77 - 78        LString(2)      Element symbol, right-justified.   
                            if (length >= 78) {
                                start = startPos + 76;
                                this.trim(start, start + 2);
                                if (this.trimmedToken.start < this.trimmedToken.end) {
                                    Formats.TokenIndexBuilder.addToken(tokens, this.trimmedToken.start, this.trimmedToken.end);
                                }
                                else {
                                    Formats.TokenIndexBuilder.addToken(tokens, startPos + 12, startPos + 13);
                                }
                            }
                            else {
                                Formats.TokenIndexBuilder.addToken(tokens, startPos + 12, startPos + 13);
                            }
                            //79 - 80        LString(2)      Charge on the atom.      
                            // ignored
                            return true;
                        };
                        return Tokenizer;
                    }());
                    var Parser = /** @class */ (function () {
                        function Parser() {
                        }
                        Parser.tokenizeAtom = function (tokens, tokenizer) {
                            if (tokenizer.tokenizeAtomRecord(tokens)) {
                                return void 0;
                            }
                            return new Formats.ParserError("Invalid ATOM/HETATM record.", tokenizer.line);
                        };
                        Parser.tokenize = function (id, data) {
                            var tokenizer = new Tokenizer(data);
                            var length = data.length;
                            var modelAtomTokens = Formats.TokenIndexBuilder.create(4096); //2 * 14 * this.data.length / 78);
                            var atomCount = 0;
                            var models = [];
                            var cryst = void 0;
                            var modelIdToken = { start: 0, end: 0 };
                            while (tokenizer.position < length) {
                                var cont = true;
                                switch (data.charCodeAt(tokenizer.position)) {
                                    case 65: // A 
                                        if (tokenizer.startsWith(tokenizer.position, "ATOM")) {
                                            if (!modelAtomTokens) {
                                                modelAtomTokens = Formats.TokenIndexBuilder.create(4096);
                                            }
                                            var err = Parser.tokenizeAtom(modelAtomTokens, tokenizer);
                                            atomCount++;
                                            if (err)
                                                return err;
                                        }
                                        break;
                                    case 67: // C
                                        if (tokenizer.startsWith(tokenizer.position, "CRYST1")) {
                                            var start = tokenizer.position;
                                            var end = tokenizer.moveToEndOfLine();
                                            cryst = new PDB.CrystStructureInfo(data.substring(start, end));
                                        }
                                        break;
                                    case 69: // E 
                                        if (tokenizer.startsWith(tokenizer.position, "ENDMDL") && atomCount > 0) {
                                            if (models.length === 0) {
                                                modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                            }
                                            if (modelAtomTokens) {
                                                models.push(new PDB.ModelData(modelIdToken, modelAtomTokens.tokens, atomCount));
                                            }
                                            atomCount = 0;
                                            modelAtomTokens = null;
                                        }
                                        else if (tokenizer.startsWith(tokenizer.position, "END")) {
                                            var start = tokenizer.position;
                                            var end = tokenizer.moveToEndOfLine();
                                            tokenizer.trim(start, end);
                                            if (tokenizer.trimmedToken.end - tokenizer.trimmedToken.start === 3) {
                                                cont = false;
                                            }
                                        }
                                        break;
                                    case 72: // H 
                                        if (tokenizer.startsWith(tokenizer.position, "HETATM")) {
                                            if (!modelAtomTokens) {
                                                modelAtomTokens = Formats.TokenIndexBuilder.create(4096);
                                            }
                                            var err = Parser.tokenizeAtom(modelAtomTokens, tokenizer);
                                            atomCount++;
                                            if (err)
                                                return err;
                                        }
                                        break;
                                    case 77: //M
                                        if (tokenizer.startsWith(tokenizer.position, "MODEL")) {
                                            if (atomCount > 0) {
                                                if (models.length === 0) {
                                                    modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                                }
                                                if (modelAtomTokens) {
                                                    models.push(new PDB.ModelData(modelIdToken, modelAtomTokens.tokens, atomCount));
                                                }
                                            }
                                            var start = tokenizer.position + 6;
                                            var end = tokenizer.moveToEndOfLine();
                                            tokenizer.trim(start, end);
                                            modelIdToken = { start: tokenizer.trimmedToken.start, end: tokenizer.trimmedToken.end };
                                            if (atomCount > 0 || !modelAtomTokens) {
                                                modelAtomTokens = Formats.TokenIndexBuilder.create(4096);
                                            }
                                            atomCount = 0;
                                        }
                                        break;
                                }
                                tokenizer.moveToNextLine();
                                if (!cont)
                                    break;
                            }
                            var fakeCifData = data + ".?0123";
                            if (atomCount > 0) {
                                if (models.length === 0) {
                                    modelIdToken = { start: data.length + 3, end: data.length + 4 };
                                }
                                if (modelAtomTokens) {
                                    models.push(new PDB.ModelData(modelIdToken, modelAtomTokens.tokens, atomCount));
                                }
                            }
                            return new PDB.MoleculeData(new PDB.Header(id), cryst, new PDB.ModelsData(models), fakeCifData);
                        };
                        Parser.getDotRange = function (length) {
                            return { start: length - 6, end: length - 5 };
                        };
                        Parser.getNumberRanges = function (length) {
                            var ret = Core.Utils.FastMap.create();
                            for (var i = 0; i < 4; i++) {
                                ret.set(i, { start: length - 4 + i, end: length - 3 + i });
                            }
                            return ret;
                        };
                        Parser.getQuestionmarkRange = function (length) {
                            return { start: length - 5, end: length - 4 };
                        };
                        Parser.parse = function (id, data) {
                            var ret = Parser.tokenize(id, data);
                            if (ret instanceof Formats.ParserError) {
                                return Formats.ParserResult.error(ret.message, ret.line);
                            }
                            else {
                                return Formats.ParserResult.success(ret.toCifFile());
                            }
                        };
                        return Parser;
                    }());
                    PDB.Parser = Parser;
                    function toCifFile(id, data) {
                        return Parser.parse(id, data);
                    }
                    PDB.toCifFile = toCifFile;
                })(PDB = Molecule.PDB || (Molecule.PDB = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                var SDF;
                (function (SDF) {
                    function initState(data, customId) {
                        var lines = data.split(/\r?\n/g);
                        var id = lines[0].trim();
                        if (!id.length)
                            id = 'SDF';
                        //let molHeaderInfo = lines[1];
                        //let molHeaderComment = lines[2];
                        var cTabInfo = lines[3];
                        var atomCount = +cTabInfo.substr(0, 3);
                        var bondCount = +cTabInfo.substr(3, 3);
                        return {
                            id: customId ? customId : id,
                            atomCount: atomCount,
                            bondCount: bondCount,
                            atoms: Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Atoms, atomCount),
                            positions: Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Positions, atomCount),
                            bonds: Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Bonds, bondCount),
                            lines: lines,
                            currentLine: 4,
                            error: void 0,
                            stringPool: Formats.ShortStringPool.create()
                        };
                    }
                    function readAtom(i, state) {
                        var line = state.lines[state.currentLine];
                        var atoms = state.atoms, positions = state.positions;
                        var es = Formats.ShortStringPool.get(state.stringPool, line.substr(31, 3).trim());
                        atoms.id[i] = i;
                        atoms.elementSymbol[i] = es;
                        atoms.name[i] = es;
                        atoms.authName[i] = es;
                        atoms.occupancy[i] = 1.0;
                        atoms.rowIndex[i] = state.currentLine;
                        positions.x[i] = Core.Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 0, 10);
                        positions.y[i] = Core.Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 10, 20);
                        positions.z[i] = Core.Utils.FastNumberParsers.parseFloatSkipTrailingWhitespace(line, 20, 30);
                    }
                    function readAtoms(state) {
                        for (var i = 0; i < state.atomCount; i++) {
                            readAtom(i, state);
                            state.currentLine++;
                        }
                    }
                    function readBond(i, state) {
                        var line = state.lines[state.currentLine];
                        var bonds = state.bonds;
                        bonds.atomAIndex[i] = Core.Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 0, 3) - 1;
                        bonds.atomBIndex[i] = Core.Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 3, 6) - 1;
                        switch (Core.Utils.FastNumberParsers.parseIntSkipTrailingWhitespace(line, 6, 9)) {
                            case 1:
                                bonds.type[i] = 1 /* Single */;
                                break;
                            case 2:
                                bonds.type[i] = 2 /* Double */;
                                break;
                            case 3:
                                bonds.type[i] = 3 /* Triple */;
                                break;
                            case 4:
                                bonds.type[i] = 4 /* Aromatic */;
                                break;
                            default:
                                bonds.type[i] = 0 /* Unknown */;
                                break;
                        }
                    }
                    function readBonds(state) {
                        for (var i = 0; i < state.bondCount; i++) {
                            readBond(i, state);
                            state.currentLine++;
                        }
                    }
                    function buildModel(state) {
                        var residues = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Residues, 1), chains = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Chains, 1), entities = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Entities, 1);
                        residues.isHet[0] = 1;
                        residues.insCode[0] = null;
                        residues.name[0]
                            = residues.authName[0]
                                = 'UNK';
                        residues.atomEndIndex[0]
                            = chains.atomEndIndex[0]
                                = entities.atomEndIndex[0]
                                    = state.atomCount;
                        residues.asymId[0]
                            = residues.authAsymId[0]
                                = chains.asymId[0]
                                    = chains.authAsymId[0]
                                        = 'X';
                        residues.entityId[0]
                            = chains.entityId[0]
                                = entities.entityId[0]
                                    = '1';
                        chains.residueEndIndex[0]
                            = entities.residueEndIndex[0]
                                = 0;
                        entities.chainEndIndex[0] = 1;
                        entities.type[0] = 'non-polymer';
                        var ssR = new Core.Structure.PolyResidueIdentifier('X', 0, null);
                        var ss = [new Core.Structure.SecondaryStructureElement(0 /* None */, ssR, ssR)];
                        ss[0].startResidueIndex = 0;
                        ss[0].endResidueIndex = 1;
                        return Core.Structure.Molecule.Model.create({
                            id: state.id,
                            modelId: '1',
                            data: {
                                atoms: state.atoms,
                                residues: residues,
                                chains: chains,
                                entities: entities,
                                bonds: {
                                    input: state.bonds,
                                },
                                secondaryStructure: ss,
                                symmetryInfo: void 0,
                                assemblyInfo: void 0,
                            },
                            positions: state.positions,
                            source: Core.Structure.Molecule.Model.Source.File
                        });
                    }
                    function parse(data, id) {
                        try {
                            var state = initState(data, id);
                            readAtoms(state);
                            readBonds(state);
                            var model = buildModel(state);
                            if (state.error) {
                                return Formats.ParserResult.error(state.error, state.currentLine + 1);
                            }
                            var molecule = Core.Structure.Molecule.create(id ? id : state.id, [model]);
                            return Formats.ParserResult.success(molecule);
                        }
                        catch (e) {
                            return Formats.ParserResult.error("" + e);
                        }
                    }
                    SDF.parse = parse;
                })(SDF = Molecule.SDF || (Molecule.SDF = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Molecule;
            (function (Molecule) {
                function parseCIF(type, parse) {
                    var _this = this;
                    return function (data, params) { return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var file, result, mol;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                case 1:
                                    _a.sent();
                                    file = parse(data, params);
                                    if (file.isError) {
                                        throw file.toString();
                                    }
                                    result = file.result;
                                    if (!result.dataBlocks.length) {
                                        throw "The " + type + " data does not contain a data block.";
                                    }
                                    return [4 /*yield*/, ctx.updateProgress('Creating representation...')];
                                case 2:
                                    _a.sent();
                                    mol = Molecule.mmCIF.ofDataBlock(result.dataBlocks[0]);
                                    return [2 /*return*/, Formats.ParserResult.success(mol, result.dataBlocks.length > 1 ? ["The input data contains multiple data blocks, only the first one was parsed. To parse all data blocks, use the function 'mmCIF.ofDataBlock' separately for each block."] : void 0)];
                            }
                        });
                    }); }); };
                }
                var SupportedFormats;
                (function (SupportedFormats) {
                    var _this = this;
                    SupportedFormats.mmCIF = {
                        name: 'mmCIF',
                        shortcuts: ['mmcif', 'cif'],
                        extensions: ['.cif'],
                        parse: parseCIF('CIF', Formats.CIF.Text.parse)
                    };
                    SupportedFormats.mmBCIF = {
                        name: 'mmCIF (Binary)',
                        shortcuts: ['mmbcif', 'bcif', 'binarycif'],
                        extensions: ['.bcif'],
                        isBinary: true,
                        parse: parseCIF('BinaryCIF', Formats.CIF.Binary.parse)
                    };
                    SupportedFormats.PDB = {
                        name: 'PDB',
                        shortcuts: ['pdb', 'ent'],
                        extensions: ['.pdb', '.ent'],
                        parse: parseCIF('PDB', function (d, p) { return Molecule.PDB.toCifFile((p && p.id) || 'PDB', d); })
                    };
                    SupportedFormats.SDF = {
                        name: 'SDF',
                        shortcuts: ['sdf', 'mol'],
                        extensions: ['.sdf', '.mol'],
                        parse: function (data, options) {
                            return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                                var mol;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                        case 1:
                                            _a.sent();
                                            mol = Molecule.SDF.parse(data, (options && options.id) || undefined);
                                            if (mol.isError)
                                                throw mol.toString();
                                            return [2 /*return*/, Formats.ParserResult.success(mol.result)];
                                    }
                                });
                            }); });
                        }
                    };
                    SupportedFormats.All = [SupportedFormats.mmCIF, SupportedFormats.mmBCIF, SupportedFormats.PDB, SupportedFormats.SDF];
                })(SupportedFormats = Molecule.SupportedFormats || (Molecule.SupportedFormats = {}));
            })(Molecule = Formats.Molecule || (Formats.Molecule = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                "use strict";
                function fill(data, value) {
                    var len = data.length;
                    for (var i = 0; i < len; i++) {
                        data[i] = value;
                    }
                }
                /**
                 * A field with the Z axis being the slowest and the X being the fastest.
                 */
                var Field3DZYX = /** @class */ (function () {
                    function Field3DZYX(data, dimensions) {
                        this.data = data;
                        this.dimensions = dimensions;
                        this.len = this.dimensions[0] * this.dimensions[1] * this.dimensions[2];
                        this.nX = this.dimensions[0];
                        this.nY = this.dimensions[1];
                    }
                    Object.defineProperty(Field3DZYX.prototype, "length", {
                        get: function () {
                            return this.len;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Field3DZYX.prototype.getAt = function (idx) {
                        return this.data[idx];
                    };
                    Field3DZYX.prototype.setAt = function (idx, v) {
                        this.data[idx] = v;
                    };
                    Field3DZYX.prototype.get = function (i, j, k) {
                        return this.data[(this.nX * (k * this.nY + j) + i) | 0];
                    };
                    Field3DZYX.prototype.set = function (i, j, k, v) {
                        this.data[(this.nX * (k * this.nY + j) + i) | 0] = v;
                    };
                    Field3DZYX.prototype.fill = function (v) {
                        fill(this.data, v);
                    };
                    return Field3DZYX;
                }());
                Density.Field3DZYX = Field3DZYX;
                function createSpacegroup(number, size, angles) {
                    var alpha = (Math.PI / 180.0) * angles[0], beta = (Math.PI / 180.0) * angles[1], gamma = (Math.PI / 180.0) * angles[2];
                    var xScale = size[0], yScale = size[1], zScale = size[2];
                    var z1 = Math.cos(beta), z2 = (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma)) / Math.sin(gamma), z3 = Math.sqrt(1.0 - z1 * z1 - z2 * z2);
                    var x = [xScale, 0.0, 0.0];
                    var y = [Math.cos(gamma) * yScale, Math.sin(gamma) * yScale, 0.0];
                    var z = [z1 * zScale, z2 * zScale, z3 * zScale];
                    return {
                        number: number,
                        size: size,
                        angles: angles,
                        basis: { x: x, y: y, z: z }
                    };
                }
                Density.createSpacegroup = createSpacegroup;
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                var CCP4;
                (function (CCP4) {
                    function parse(buffer) {
                        return Parser.parse(buffer);
                    }
                    CCP4.parse = parse;
                    /**
                     * Parses CCP4 files.
                     */
                    var Parser;
                    (function (Parser) {
                        function getArray(r, offset, count) {
                            var ret = [];
                            for (var i = 0; i < count; i++) {
                                ret[i] = r(offset + i);
                            }
                            return ret;
                        }
                        /**
                         * Parse CCP4 file according to spec at http://www.ccp4.ac.uk/html/maplib.html
                         * Inspired by PyMOL implementation of the parser.
                         */
                        function parse(buffer) {
                            var headerSize = 1024, headerView = new DataView(buffer, 0, headerSize), warnings = [];
                            var endian = false;
                            var mode = headerView.getInt32(3 * 4, false);
                            if (mode !== 2) {
                                endian = true;
                                mode = headerView.getInt32(3 * 4, true);
                                if (mode !== 2) {
                                    return Formats.ParserResult.error("Only CCP4 mode 2 is supported.");
                                }
                            }
                            var readInt = function (o) { return headerView.getInt32(o * 4, endian); }, readFloat = function (o) { return headerView.getFloat32(o * 4, endian); };
                            var header = {
                                extent: getArray(readInt, 0, 3),
                                mode: mode,
                                nxyzStart: getArray(readInt, 4, 3),
                                grid: getArray(readInt, 7, 3),
                                cellSize: getArray(readFloat, 10, 3),
                                cellAngles: getArray(readFloat, 13, 3),
                                crs2xyz: getArray(readInt, 16, 3),
                                min: readFloat(19),
                                max: readFloat(20),
                                mean: readFloat(21),
                                spacegroupNumber: readInt(22),
                                symBytes: readInt(23),
                                skewFlag: readInt(24),
                                skewMatrix: getArray(readFloat, 25, 9),
                                skewTranslation: getArray(readFloat, 34, 3),
                                origin2k: getArray(readFloat, 49, 3)
                            };
                            var dataOffset = buffer.byteLength - 4 * header.extent[0] * header.extent[1] * header.extent[2];
                            if (dataOffset !== headerSize + header.symBytes) {
                                if (dataOffset === headerSize) {
                                    warnings.push("File contains bogus symmetry record.");
                                }
                                else if (dataOffset < headerSize) {
                                    return Formats.ParserResult.error("File appears truncated and doesn't match header.");
                                }
                                else if ((dataOffset > headerSize) && (dataOffset < (1024 * 1024))) {
                                    // Fix for loading SPIDER files which are larger than usual
                                    // In this specific case, we must absolutely trust the symBytes record
                                    dataOffset = headerSize + header.symBytes;
                                    warnings.push("File is larger than expected and doesn't match header. Continuing file load, good luck!");
                                }
                                else {
                                    return Formats.ParserResult.error("File is MUCH larger than expected and doesn't match header.");
                                }
                            }
                            //const mapp = readInt(52);
                            //const mapStr = String.fromCharCode((mapp & 0xFF)) + String.fromCharCode(((mapp >> 8) & 0xFF)) + String.fromCharCode(((mapp >> 16) & 0xFF)) + String.fromCharCode(((mapp >> 24) & 0xFF));
                            // pretend we've checked the MAP string at offset 52
                            // pretend we've read the symmetry data
                            if (header.grid[0] === 0 && header.extent[0] > 0) {
                                header.grid[0] = header.extent[0] - 1;
                                warnings.push("Fixed X interval count.");
                            }
                            if (header.grid[1] === 0 && header.extent[1] > 0) {
                                header.grid[1] = header.extent[1] - 1;
                                warnings.push("Fixed Y interval count.");
                            }
                            if (header.grid[2] === 0 && header.extent[2] > 0) {
                                header.grid[2] = header.extent[2] - 1;
                                warnings.push("Fixed Z interval count.");
                            }
                            if (header.crs2xyz[0] === 0 && header.crs2xyz[1] === 0 && header.crs2xyz[2] === 0) {
                                warnings.push("All crs2xyz records are zero. Setting crs2xyz to 1, 2, 3.");
                                header.crs2xyz = [1, 2, 3];
                            }
                            if (header.cellSize[0] === 0.0 &&
                                header.cellSize[1] === 0.0 &&
                                header.cellSize[2] === 0.0) {
                                warnings.push("Cell dimensions are all zero. Setting to 1.0, 1.0, 1.0. Map file will not align with other structures.");
                                header.cellSize[0] = 1.0;
                                header.cellSize[1] = 1.0;
                                header.cellSize[2] = 1.0;
                            }
                            var indices = [0, 0, 0];
                            indices[header.crs2xyz[0] - 1] = 0;
                            indices[header.crs2xyz[1] - 1] = 1;
                            indices[header.crs2xyz[2] - 1] = 2;
                            var originGrid;
                            if (header.origin2k[0] === 0.0 && header.origin2k[1] === 0.0 && header.origin2k[2] === 0.0) {
                                originGrid = [header.nxyzStart[indices[0]], header.nxyzStart[indices[1]], header.nxyzStart[indices[2]]];
                            }
                            else {
                                // Use ORIGIN records rather than old n[xyz]start records
                                //   http://www2.mrc-lmb.cam.ac.uk/image2000.html
                                // XXX the ORIGIN field is only used by the EM community, and
                                //     has undefined meaning for non-orthogonal maps and/or
                                //     non-cubic voxels, etc.
                                originGrid = [header.origin2k[indices[0]], header.origin2k[indices[1]], header.origin2k[indices[2]]];
                            }
                            var extent = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];
                            var nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;
                            var rawData = endian === nativeEndian
                                ? readRawData1(new Float32Array(buffer, headerSize + header.symBytes, extent[0] * extent[1] * extent[2]), endian, extent, header.extent, indices, header.mean)
                                : readRawData(new DataView(buffer, headerSize + header.symBytes), endian, extent, header.extent, indices, header.mean);
                            var field = new Density.Field3DZYX(rawData.data, extent);
                            var data = {
                                spacegroup: Density.createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                                box: {
                                    origin: [originGrid[0] / header.grid[0], originGrid[1] / header.grid[1], originGrid[2] / header.grid[2]],
                                    dimensions: [extent[0] / header.grid[0], extent[1] / header.grid[1], extent[2] / header.grid[2]],
                                    sampleCount: extent
                                },
                                data: field,
                                valuesInfo: { min: header.min, max: header.max, mean: header.mean, sigma: rawData.sigma }
                            };
                            return Formats.ParserResult.success(data, warnings);
                        }
                        Parser.parse = parse;
                        function readRawData1(view, endian, extent, headerExtent, indices, mean) {
                            var data = new Float32Array(extent[0] * extent[1] * extent[2]), coord = [0, 0, 0], mX, mY, mZ, cX, cY, cZ, xSize, xySize, offset = 0, v = 0.1, sigma = 0.0, t = 0.1, iX = indices[0], iY = indices[1], iZ = indices[2];
                            mX = headerExtent[0];
                            mY = headerExtent[1];
                            mZ = headerExtent[2];
                            xSize = extent[0];
                            xySize = extent[0] * extent[1];
                            for (cZ = 0; cZ < mZ; cZ++) {
                                coord[2] = cZ;
                                for (cY = 0; cY < mY; cY++) {
                                    coord[1] = cY;
                                    for (cX = 0; cX < mX; cX++) {
                                        coord[0] = cX;
                                        v = view[offset];
                                        t = v - mean;
                                        sigma += t * t,
                                            data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                                        offset += 1;
                                    }
                                }
                            }
                            sigma /= mX * mY * mZ;
                            sigma = Math.sqrt(sigma);
                            return {
                                data: data,
                                sigma: sigma
                            };
                        }
                        function readRawData(view, endian, extent, headerExtent, indices, mean) {
                            var data = new Float32Array(extent[0] * extent[1] * extent[2]), coord = [0, 0, 0], mX, mY, mZ, cX, cY, cZ, xSize, xySize, offset = 0, v = 0.1, sigma = 0.0, t = 0.1, iX = indices[0], iY = indices[1], iZ = indices[2];
                            mX = headerExtent[0];
                            mY = headerExtent[1];
                            mZ = headerExtent[2];
                            xSize = extent[0];
                            xySize = extent[0] * extent[1];
                            for (cZ = 0; cZ < mZ; cZ++) {
                                coord[2] = cZ;
                                for (cY = 0; cY < mY; cY++) {
                                    coord[1] = cY;
                                    for (cX = 0; cX < mX; cX++) {
                                        coord[0] = cX;
                                        v = view.getFloat32(offset, endian);
                                        t = v - mean;
                                        sigma += t * t,
                                            data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                                        offset += 4;
                                    }
                                }
                            }
                            sigma /= mX * mY * mZ;
                            sigma = Math.sqrt(sigma);
                            return {
                                data: data,
                                sigma: sigma
                            };
                        }
                    })(Parser || (Parser = {}));
                })(CCP4 = Density.CCP4 || (Density.CCP4 = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                var CIF;
                (function (CIF) {
                    function parse(block) {
                        if (block.getCategory('_density_info'))
                            return Parser.parseLegacy(block);
                        else if (block.getCategory('_volume_data_3d_info'))
                            return Parser.parse(block);
                        return Formats.ParserResult.error('Invalid data format.');
                    }
                    CIF.parse = parse;
                    var Parser;
                    (function (Parser) {
                        function parse(block) {
                            var info = block.getCategory('_volume_data_3d_info');
                            if (!info)
                                return Formats.ParserResult.error('_volume_data_3d_info category is missing.');
                            if (!block.getCategory('_volume_data_3d'))
                                return Formats.ParserResult.error('_volume_data_3d category is missing.');
                            function getVector3(name) {
                                var ret = [0, 0, 0];
                                for (var i = 0; i < 3; i++) {
                                    ret[i] = info.getColumn(name + "[" + i + "]").getFloat(0);
                                }
                                return ret;
                            }
                            function getNum(name) { return info.getColumn(name).getFloat(0); }
                            var header = {
                                name: info.getColumn('name').getString(0),
                                axisOrder: getVector3('axis_order'),
                                origin: getVector3('origin'),
                                dimensions: getVector3('dimensions'),
                                sampleCount: getVector3('sample_count'),
                                spacegroupNumber: getNum('spacegroup_number') | 0,
                                cellSize: getVector3('spacegroup_cell_size'),
                                cellAngles: getVector3('spacegroup_cell_angles'),
                                mean: getNum('mean_sampled'),
                                sigma: getNum('sigma_sampled')
                            };
                            var indices = [0, 0, 0];
                            indices[header.axisOrder[0]] = 0;
                            indices[header.axisOrder[1]] = 1;
                            indices[header.axisOrder[2]] = 2;
                            function normalizeOrder(xs) {
                                return [xs[indices[0]], xs[indices[1]], xs[indices[2]]];
                            }
                            var sampleCount = normalizeOrder(header.sampleCount);
                            var rawData = readValues(block.getCategory('_volume_data_3d').getColumn('values'), sampleCount, header.sampleCount, indices);
                            var field = new Density.Field3DZYX(rawData.data, sampleCount);
                            var data = {
                                name: header.name,
                                spacegroup: Density.createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                                box: {
                                    origin: normalizeOrder(header.origin),
                                    dimensions: normalizeOrder(header.dimensions),
                                    sampleCount: sampleCount
                                },
                                data: field,
                                valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma }
                            };
                            return Formats.ParserResult.success(data);
                        }
                        Parser.parse = parse;
                        function parseLegacy(block) {
                            var info = block.getCategory('_density_info');
                            if (!info)
                                return Formats.ParserResult.error('_density_info category is missing.');
                            if (!block.getCategory('_density_data'))
                                return Formats.ParserResult.error('_density_data category is missing.');
                            function getArray(name) {
                                var ret = [];
                                for (var i = 0; i < 3; i++) {
                                    ret[i] = info.getColumn(name + "[" + i + "]").getFloat(0);
                                }
                                return ret;
                            }
                            function getNum(name) { return info.getColumn(name).getFloat(0); }
                            var header = {
                                name: info.getColumn('name').getString(0),
                                grid: getArray('grid'),
                                axisOrder: getArray('axis_order'),
                                extent: getArray('extent'),
                                origin: getArray('origin'),
                                cellSize: getArray('cell_size'),
                                cellAngles: getArray('cell_angles'),
                                mean: getNum('mean'),
                                sigma: getNum('sigma'),
                                spacegroupNumber: getNum('spacegroup_number') | 0,
                            };
                            var indices = [0, 0, 0];
                            indices[header.axisOrder[0]] = 0;
                            indices[header.axisOrder[1]] = 1;
                            indices[header.axisOrder[2]] = 2;
                            var originGrid = [header.origin[indices[0]], header.origin[indices[1]], header.origin[indices[2]]];
                            var xyzSampleCount = [header.extent[indices[0]], header.extent[indices[1]], header.extent[indices[2]]];
                            var rawData = readValues(block.getCategory('_density_data').getColumn('values'), xyzSampleCount, header.extent, indices);
                            var field = new Density.Field3DZYX(rawData.data, xyzSampleCount);
                            var data = {
                                name: header.name,
                                spacegroup: Density.createSpacegroup(header.spacegroupNumber, header.cellSize, header.cellAngles),
                                box: {
                                    origin: [originGrid[0] / header.grid[0], originGrid[1] / header.grid[1], originGrid[2] / header.grid[2]],
                                    dimensions: [xyzSampleCount[0] / header.grid[0], xyzSampleCount[1] / header.grid[1], xyzSampleCount[2] / header.grid[2]],
                                    sampleCount: xyzSampleCount
                                },
                                data: field,
                                valuesInfo: { min: rawData.min, max: rawData.max, mean: header.mean, sigma: header.sigma }
                            };
                            return Formats.ParserResult.success(data);
                        }
                        Parser.parseLegacy = parseLegacy;
                        function readValues(col, xyzSampleCount, sampleCount, axisIndices) {
                            var data = new Float32Array(xyzSampleCount[0] * xyzSampleCount[1] * xyzSampleCount[2]);
                            var coord = [0, 0, 0];
                            var iX = axisIndices[0], iY = axisIndices[1], iZ = axisIndices[2];
                            var mX = sampleCount[0], mY = sampleCount[1], mZ = sampleCount[2];
                            var xSize = xyzSampleCount[0];
                            var xySize = xyzSampleCount[0] * xyzSampleCount[1];
                            var offset = 0;
                            var min = col.getFloat(0), max = min;
                            for (var cZ = 0; cZ < mZ; cZ++) {
                                coord[2] = cZ;
                                for (var cY = 0; cY < mY; cY++) {
                                    coord[1] = cY;
                                    for (var cX = 0; cX < mX; cX++) {
                                        coord[0] = cX;
                                        var v = col.getFloat(offset);
                                        offset += 1;
                                        data[coord[iX] + coord[iY] * xSize + coord[iZ] * xySize] = v;
                                        if (v < min)
                                            min = v;
                                        else if (v > max)
                                            max = v;
                                    }
                                }
                            }
                            return { data: data, min: min, max: max };
                        }
                    })(Parser || (Parser = {}));
                })(CIF = Density.CIF || (Density.CIF = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Formats;
        (function (Formats) {
            var Density;
            (function (Density) {
                function parse(data, name, parser) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress("Parsing " + name + "...")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, parser(data)];
                            }
                        });
                    }); });
                }
                var SupportedFormats;
                (function (SupportedFormats) {
                    SupportedFormats.CCP4 = { name: 'CCP4', shortcuts: ['ccp4', 'map'], extensions: ['.ccp4', '.map'], isBinary: true, parse: function (data) { return parse(data, 'CCP4', function (d) { return Density.CCP4.parse(d); }); } };
                    SupportedFormats.All = [SupportedFormats.CCP4];
                })(SupportedFormats = Density.SupportedFormats || (Density.SupportedFormats = {}));
            })(Density = Formats.Density || (Formats.Density = {}));
        })(Formats = Core.Formats || (Core.Formats = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var LinearAlgebra;
            (function (LinearAlgebra) {
                /*
                 * This code has been modified from https://github.com/toji/gl-matrix/,
                 * copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
                 *
                 * Permission is hereby granted, free of charge, to any person obtaining a copy
                 * of this software and associated documentation files (the "Software"), to deal
                 * in the Software without restriction, including without limitation the rights
                 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                 * copies of the Software, and to permit persons to whom the Software is
                 * furnished to do so, subject to the following conditions:
                 */
                function Matrix4() {
                    return Matrix4.zero();
                }
                LinearAlgebra.Matrix4 = Matrix4;
                /**
                 * Stores a 4x4 matrix in a column major (j * 4 + i indexing) format.
                 */
                (function (Matrix4) {
                    function zero() {
                        // force double backing array by 0.1.
                        var ret = [0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        ret[0] = 0.0;
                        return ret;
                    }
                    Matrix4.zero = zero;
                    function identity() {
                        var out = zero();
                        out[0] = 1;
                        out[1] = 0;
                        out[2] = 0;
                        out[3] = 0;
                        out[4] = 0;
                        out[5] = 1;
                        out[6] = 0;
                        out[7] = 0;
                        out[8] = 0;
                        out[9] = 0;
                        out[10] = 1;
                        out[11] = 0;
                        out[12] = 0;
                        out[13] = 0;
                        out[14] = 0;
                        out[15] = 1;
                        return out;
                    }
                    Matrix4.identity = identity;
                    function fromIdentity(mat) {
                        mat[0] = 1;
                        mat[1] = 0;
                        mat[2] = 0;
                        mat[3] = 0;
                        mat[4] = 0;
                        mat[5] = 1;
                        mat[6] = 0;
                        mat[7] = 0;
                        mat[8] = 0;
                        mat[9] = 0;
                        mat[10] = 1;
                        mat[11] = 0;
                        mat[12] = 0;
                        mat[13] = 0;
                        mat[14] = 0;
                        mat[15] = 1;
                        return mat;
                    }
                    Matrix4.fromIdentity = fromIdentity;
                    function ofRows(rows) {
                        var out = zero(), i, j, r;
                        for (i = 0; i < 4; i++) {
                            r = rows[i];
                            for (j = 0; j < 4; j++) {
                                out[4 * j + i] = r[j];
                            }
                        }
                        return out;
                    }
                    Matrix4.ofRows = ofRows;
                    function areEqual(a, b, eps) {
                        for (var i = 0; i < 16; i++) {
                            if (Math.abs(a[i] - b[i]) > eps) {
                                return false;
                            }
                        }
                        return true;
                    }
                    Matrix4.areEqual = areEqual;
                    function setValue(a, i, j, value) {
                        a[4 * j + i] = value;
                    }
                    Matrix4.setValue = setValue;
                    function copy(out, a) {
                        out[0] = a[0];
                        out[1] = a[1];
                        out[2] = a[2];
                        out[3] = a[3];
                        out[4] = a[4];
                        out[5] = a[5];
                        out[6] = a[6];
                        out[7] = a[7];
                        out[8] = a[8];
                        out[9] = a[9];
                        out[10] = a[10];
                        out[11] = a[11];
                        out[12] = a[12];
                        out[13] = a[13];
                        out[14] = a[14];
                        out[15] = a[15];
                        return out;
                    }
                    Matrix4.copy = copy;
                    function clone(a) {
                        return Matrix4.copy(Matrix4.zero(), a);
                    }
                    Matrix4.clone = clone;
                    function invert(out, a) {
                        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, 
                        // Calculate the determinant
                        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
                        if (!det) {
                            return null;
                        }
                        det = 1.0 / det;
                        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
                        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
                        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
                        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
                        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
                        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
                        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
                        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
                        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
                        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
                        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
                        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
                        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
                        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
                        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
                        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
                        return out;
                    }
                    Matrix4.invert = invert;
                    function mul(out, a, b) {
                        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
                        // Cache only the current line of the second matrix
                        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
                        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        b0 = b[4];
                        b1 = b[5];
                        b2 = b[6];
                        b3 = b[7];
                        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        b0 = b[8];
                        b1 = b[9];
                        b2 = b[10];
                        b3 = b[11];
                        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        b0 = b[12];
                        b1 = b[13];
                        b2 = b[14];
                        b3 = b[15];
                        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
                        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
                        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
                        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
                        return out;
                    }
                    Matrix4.mul = mul;
                    function mul3(out, a, b, c) {
                        return mul(out, mul(out, a, b), c);
                    }
                    Matrix4.mul3 = mul3;
                    function translate(out, a, v) {
                        var x = v[0], y = v[1], z = v[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
                        if (a === out) {
                            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
                            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
                            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
                            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
                        }
                        else {
                            a00 = a[0];
                            a01 = a[1];
                            a02 = a[2];
                            a03 = a[3];
                            a10 = a[4];
                            a11 = a[5];
                            a12 = a[6];
                            a13 = a[7];
                            a20 = a[8];
                            a21 = a[9];
                            a22 = a[10];
                            a23 = a[11];
                            out[0] = a00;
                            out[1] = a01;
                            out[2] = a02;
                            out[3] = a03;
                            out[4] = a10;
                            out[5] = a11;
                            out[6] = a12;
                            out[7] = a13;
                            out[8] = a20;
                            out[9] = a21;
                            out[10] = a22;
                            out[11] = a23;
                            out[12] = a00 * x + a10 * y + a20 * z + a[12];
                            out[13] = a01 * x + a11 * y + a21 * z + a[13];
                            out[14] = a02 * x + a12 * y + a22 * z + a[14];
                            out[15] = a03 * x + a13 * y + a23 * z + a[15];
                        }
                        return out;
                    }
                    Matrix4.translate = translate;
                    function fromTranslation(out, v) {
                        out[0] = 1;
                        out[1] = 0;
                        out[2] = 0;
                        out[3] = 0;
                        out[4] = 0;
                        out[5] = 1;
                        out[6] = 0;
                        out[7] = 0;
                        out[8] = 0;
                        out[9] = 0;
                        out[10] = 1;
                        out[11] = 0;
                        out[12] = v[0];
                        out[13] = v[1];
                        out[14] = v[2];
                        out[15] = 1;
                        return out;
                    }
                    Matrix4.fromTranslation = fromTranslation;
                    function rotate(out, a, rad, axis) {
                        var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
                        if (Math.abs(len) < 0.000001 /* Value */) {
                            return null;
                        }
                        len = 1 / len;
                        x *= len;
                        y *= len;
                        z *= len;
                        s = Math.sin(rad);
                        c = Math.cos(rad);
                        t = 1 - c;
                        a00 = a[0];
                        a01 = a[1];
                        a02 = a[2];
                        a03 = a[3];
                        a10 = a[4];
                        a11 = a[5];
                        a12 = a[6];
                        a13 = a[7];
                        a20 = a[8];
                        a21 = a[9];
                        a22 = a[10];
                        a23 = a[11];
                        // Construct the elements of the rotation matrix
                        b00 = x * x * t + c;
                        b01 = y * x * t + z * s;
                        b02 = z * x * t - y * s;
                        b10 = x * y * t - z * s;
                        b11 = y * y * t + c;
                        b12 = z * y * t + x * s;
                        b20 = x * z * t + y * s;
                        b21 = y * z * t - x * s;
                        b22 = z * z * t + c;
                        // Perform rotation-specific matrix multiplication
                        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
                        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
                        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
                        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
                        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
                        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
                        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
                        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
                        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
                        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
                        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
                        out[11] = a03 * b20 + a13 * b21 + a23 * b22;
                        if (a !== out) { // If the source and destination differ, copy the unchanged last row
                            out[12] = a[12];
                            out[13] = a[13];
                            out[14] = a[14];
                            out[15] = a[15];
                        }
                        return out;
                    }
                    Matrix4.rotate = rotate;
                    function fromRotation(out, rad, axis) {
                        var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t;
                        if (Math.abs(len) < 0.000001 /* Value */) {
                            return fromIdentity(out);
                        }
                        len = 1 / len;
                        x *= len;
                        y *= len;
                        z *= len;
                        s = Math.sin(rad);
                        c = Math.cos(rad);
                        t = 1 - c;
                        // Perform rotation-specific matrix multiplication
                        out[0] = x * x * t + c;
                        out[1] = y * x * t + z * s;
                        out[2] = z * x * t - y * s;
                        out[3] = 0;
                        out[4] = x * y * t - z * s;
                        out[5] = y * y * t + c;
                        out[6] = z * y * t + x * s;
                        out[7] = 0;
                        out[8] = x * z * t + y * s;
                        out[9] = y * z * t - x * s;
                        out[10] = z * z * t + c;
                        out[11] = 0;
                        out[12] = 0;
                        out[13] = 0;
                        out[14] = 0;
                        out[15] = 1;
                        return out;
                    }
                    Matrix4.fromRotation = fromRotation;
                    function scale(out, a, v) {
                        var x = v[0], y = v[1], z = v[2];
                        out[0] = a[0] * x;
                        out[1] = a[1] * x;
                        out[2] = a[2] * x;
                        out[3] = a[3] * x;
                        out[4] = a[4] * y;
                        out[5] = a[5] * y;
                        out[6] = a[6] * y;
                        out[7] = a[7] * y;
                        out[8] = a[8] * z;
                        out[9] = a[9] * z;
                        out[10] = a[10] * z;
                        out[11] = a[11] * z;
                        out[12] = a[12];
                        out[13] = a[13];
                        out[14] = a[14];
                        out[15] = a[15];
                        return out;
                    }
                    Matrix4.scale = scale;
                    function fromScaling(out, v) {
                        out[0] = v[0];
                        out[1] = 0;
                        out[2] = 0;
                        out[3] = 0;
                        out[4] = 0;
                        out[5] = v[1];
                        out[6] = 0;
                        out[7] = 0;
                        out[8] = 0;
                        out[9] = 0;
                        out[10] = v[2];
                        out[11] = 0;
                        out[12] = 0;
                        out[13] = 0;
                        out[14] = 0;
                        out[15] = 1;
                        return out;
                    }
                    Matrix4.fromScaling = fromScaling;
                    function makeTable(m) {
                        var ret = '';
                        for (var i = 0; i < 4; i++) {
                            for (var j = 0; j < 4; j++) {
                                ret += m[4 * j + i].toString();
                                if (j < 3)
                                    ret += ' ';
                            }
                            if (i < 3)
                                ret += '\n';
                        }
                        return ret;
                    }
                    Matrix4.makeTable = makeTable;
                    function determinant(a) {
                        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
                        // Calculate the determinant
                        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
                    }
                    Matrix4.determinant = determinant;
                })(Matrix4 = LinearAlgebra.Matrix4 || (LinearAlgebra.Matrix4 = {}));
                function Vector3(x, y, z) {
                    return Vector3.fromValues(x || 0, y || 0, z || 0);
                }
                LinearAlgebra.Vector3 = Vector3;
                (function (Vector3) {
                    function zero() {
                        var out = [0.1, 0.0, 0.0];
                        out[0] = 0;
                        return out;
                    }
                    Vector3.zero = zero;
                    function clone(a) {
                        var out = zero();
                        out[0] = a[0];
                        out[1] = a[1];
                        out[2] = a[2];
                        return out;
                    }
                    Vector3.clone = clone;
                    function fromObj(v) {
                        return fromValues(v.x, v.y, v.z);
                    }
                    Vector3.fromObj = fromObj;
                    function toObj(v) {
                        return { x: v[0], y: v[1], z: v[2] };
                    }
                    Vector3.toObj = toObj;
                    function fromValues(x, y, z) {
                        var out = zero();
                        out[0] = x;
                        out[1] = y;
                        out[2] = z;
                        return out;
                    }
                    Vector3.fromValues = fromValues;
                    function set(out, x, y, z) {
                        out[0] = x;
                        out[1] = y;
                        out[2] = z;
                        return out;
                    }
                    Vector3.set = set;
                    function copy(out, a) {
                        out[0] = a[0];
                        out[1] = a[1];
                        out[2] = a[2];
                        return out;
                    }
                    Vector3.copy = copy;
                    function add(out, a, b) {
                        out[0] = a[0] + b[0];
                        out[1] = a[1] + b[1];
                        out[2] = a[2] + b[2];
                        return out;
                    }
                    Vector3.add = add;
                    function sub(out, a, b) {
                        out[0] = a[0] - b[0];
                        out[1] = a[1] - b[1];
                        out[2] = a[2] - b[2];
                        return out;
                    }
                    Vector3.sub = sub;
                    function scale(out, a, b) {
                        out[0] = a[0] * b;
                        out[1] = a[1] * b;
                        out[2] = a[2] * b;
                        return out;
                    }
                    Vector3.scale = scale;
                    function scaleAndAdd(out, a, b, scale) {
                        out[0] = a[0] + (b[0] * scale);
                        out[1] = a[1] + (b[1] * scale);
                        out[2] = a[2] + (b[2] * scale);
                        return out;
                    }
                    Vector3.scaleAndAdd = scaleAndAdd;
                    function distance(a, b) {
                        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
                        return Math.sqrt(x * x + y * y + z * z);
                    }
                    Vector3.distance = distance;
                    function squaredDistance(a, b) {
                        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
                        return x * x + y * y + z * z;
                    }
                    Vector3.squaredDistance = squaredDistance;
                    function magnitude(a) {
                        var x = a[0], y = a[1], z = a[2];
                        return Math.sqrt(x * x + y * y + z * z);
                    }
                    Vector3.magnitude = magnitude;
                    function squaredMagnitude(a) {
                        var x = a[0], y = a[1], z = a[2];
                        return x * x + y * y + z * z;
                    }
                    Vector3.squaredMagnitude = squaredMagnitude;
                    function normalize(out, a) {
                        var x = a[0], y = a[1], z = a[2];
                        var len = x * x + y * y + z * z;
                        if (len > 0) {
                            len = 1 / Math.sqrt(len);
                            out[0] = a[0] * len;
                            out[1] = a[1] * len;
                            out[2] = a[2] * len;
                        }
                        return out;
                    }
                    Vector3.normalize = normalize;
                    function dot(a, b) {
                        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
                    }
                    Vector3.dot = dot;
                    function cross(out, a, b) {
                        var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
                        out[0] = ay * bz - az * by;
                        out[1] = az * bx - ax * bz;
                        out[2] = ax * by - ay * bx;
                        return out;
                    }
                    Vector3.cross = cross;
                    function lerp(out, a, b, t) {
                        var ax = a[0], ay = a[1], az = a[2];
                        out[0] = ax + t * (b[0] - ax);
                        out[1] = ay + t * (b[1] - ay);
                        out[2] = az + t * (b[2] - az);
                        return out;
                    }
                    Vector3.lerp = lerp;
                    function transformMat4(out, a, m) {
                        var x = a[0], y = a[1], z = a[2], w = m[3] * x + m[7] * y + m[11] * z + m[15];
                        w = w || 1.0;
                        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
                        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
                        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
                        return out;
                    }
                    Vector3.transformMat4 = transformMat4;
                    var angleTempA = zero(), angleTempB = zero();
                    function angle(a, b) {
                        copy(angleTempA, a);
                        copy(angleTempB, b);
                        normalize(angleTempA, angleTempA);
                        normalize(angleTempB, angleTempB);
                        var cosine = dot(angleTempA, angleTempB);
                        if (cosine > 1.0) {
                            return 0;
                        }
                        else if (cosine < -1.0) {
                            return Math.PI;
                        }
                        else {
                            return Math.acos(cosine);
                        }
                    }
                    Vector3.angle = angle;
                    var rotTemp = zero();
                    function makeRotation(mat, a, b) {
                        var by = angle(a, b);
                        if (Math.abs(by) < 0.0001) {
                            return Matrix4.fromIdentity(mat);
                        }
                        var axis = cross(rotTemp, a, b);
                        var m = squaredMagnitude(axis);
                        if (m < 0.0001) {
                            if (Math.abs(angleTempA[0] - 1) < 0.000001 /* Value */)
                                set(axis, 0, 1, 0);
                            else
                                set(axis, 1, 0, 0);
                        }
                        return Matrix4.fromRotation(mat, by, axis);
                    }
                    Vector3.makeRotation = makeRotation;
                })(Vector3 = LinearAlgebra.Vector3 || (LinearAlgebra.Vector3 = {}));
                function Vector4(x, y, z, w) {
                    return Vector4.fromValues(x || 0, y || 0, z || 0, w || 0);
                }
                LinearAlgebra.Vector4 = Vector4;
                (function (Vector4) {
                    function zero() {
                        // force double backing array by 0.1.
                        var ret = [0.1, 0, 0, 0];
                        ret[0] = 0.0;
                        return ret;
                    }
                    Vector4.zero = zero;
                    function clone(a) {
                        var out = zero();
                        out[0] = a[0];
                        out[1] = a[1];
                        out[2] = a[2];
                        out[3] = a[3];
                        return out;
                    }
                    Vector4.clone = clone;
                    function fromValues(x, y, z, w) {
                        var out = zero();
                        out[0] = x;
                        out[1] = y;
                        out[2] = z;
                        out[3] = w;
                        return out;
                    }
                    Vector4.fromValues = fromValues;
                    function set(out, x, y, z, w) {
                        out[0] = x;
                        out[1] = y;
                        out[2] = z;
                        out[3] = w;
                        return out;
                    }
                    Vector4.set = set;
                    function distance(a, b) {
                        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
                        return Math.sqrt(x * x + y * y + z * z + w * w);
                    }
                    Vector4.distance = distance;
                    function squaredDistance(a, b) {
                        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
                        return x * x + y * y + z * z + w * w;
                    }
                    Vector4.squaredDistance = squaredDistance;
                    function norm(a) {
                        var x = a[0], y = a[1], z = a[2], w = a[3];
                        return Math.sqrt(x * x + y * y + z * z + w * w);
                    }
                    Vector4.norm = norm;
                    function squaredNorm(a) {
                        var x = a[0], y = a[1], z = a[2], w = a[3];
                        return x * x + y * y + z * z + w * w;
                    }
                    Vector4.squaredNorm = squaredNorm;
                    function transform(out, a, m) {
                        var x = a[0], y = a[1], z = a[2], w = a[3];
                        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
                        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
                        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
                        out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
                        return out;
                    }
                    Vector4.transform = transform;
                })(Vector4 = LinearAlgebra.Vector4 || (LinearAlgebra.Vector4 = {}));
            })(LinearAlgebra = Geometry.LinearAlgebra || (Geometry.LinearAlgebra = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            "use strict";
            var Surface;
            (function (Surface) {
                var Vec3 = Geometry.LinearAlgebra.Vector3;
                function computeNormalsImmediate(surface) {
                    if (surface.normals)
                        return;
                    var normals = new Float32Array(surface.vertices.length), v = surface.vertices, triangles = surface.triangleIndices;
                    var x = Vec3.zero(), y = Vec3.zero(), z = Vec3.zero(), d1 = Vec3.zero(), d2 = Vec3.zero(), n = Vec3.zero();
                    for (var i = 0; i < triangles.length; i += 3) {
                        var a = 3 * triangles[i], b = 3 * triangles[i + 1], c = 3 * triangles[i + 2];
                        Vec3.set(x, v[a], v[a + 1], v[a + 2]);
                        Vec3.set(y, v[b], v[b + 1], v[b + 2]);
                        Vec3.set(z, v[c], v[c + 1], v[c + 2]);
                        Vec3.sub(d1, z, y);
                        Vec3.sub(d2, y, x);
                        Vec3.cross(n, d1, d2);
                        normals[a] += n[0];
                        normals[a + 1] += n[1];
                        normals[a + 2] += n[2];
                        normals[b] += n[0];
                        normals[b + 1] += n[1];
                        normals[b + 2] += n[2];
                        normals[c] += n[0];
                        normals[c + 1] += n[1];
                        normals[c + 2] += n[2];
                    }
                    for (var i = 0; i < normals.length; i += 3) {
                        var nx = normals[i];
                        var ny = normals[i + 1];
                        var nz = normals[i + 2];
                        var f = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
                        normals[i] *= f;
                        normals[i + 1] *= f;
                        normals[i + 2] *= f;
                    }
                    surface.normals = normals;
                }
                Surface.computeNormalsImmediate = computeNormalsImmediate;
                function computeNormals(surface) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (surface.normals) {
                                        return [2 /*return*/, surface];
                                    }
                                    ;
                                    return [4 /*yield*/, ctx.updateProgress('Computing normals...')];
                                case 1:
                                    _a.sent();
                                    computeNormalsImmediate(surface);
                                    return [2 /*return*/, surface];
                            }
                        });
                    }); });
                }
                Surface.computeNormals = computeNormals;
                function addVertex(src, i, dst, j) {
                    dst[3 * j] += src[3 * i];
                    dst[3 * j + 1] += src[3 * i + 1];
                    dst[3 * j + 2] += src[3 * i + 2];
                }
                function laplacianSmoothIter(surface, vertexCounts, vs, vertexWeight) {
                    var triCount = surface.triangleIndices.length, src = surface.vertices;
                    var triangleIndices = surface.triangleIndices;
                    for (var i = 0; i < triCount; i += 3) {
                        var a = triangleIndices[i], b = triangleIndices[i + 1], c = triangleIndices[i + 2];
                        addVertex(src, b, vs, a);
                        addVertex(src, c, vs, a);
                        addVertex(src, a, vs, b);
                        addVertex(src, c, vs, b);
                        addVertex(src, a, vs, c);
                        addVertex(src, b, vs, c);
                    }
                    var vw = 2 * vertexWeight;
                    for (var i = 0, _b = surface.vertexCount; i < _b; i++) {
                        var n = vertexCounts[i] + vw;
                        vs[3 * i] = (vs[3 * i] + vw * src[3 * i]) / n;
                        vs[3 * i + 1] = (vs[3 * i + 1] + vw * src[3 * i + 1]) / n;
                        vs[3 * i + 2] = (vs[3 * i + 2] + vw * src[3 * i + 2]) / n;
                    }
                }
                function laplacianSmoothComputation(ctx, surface, iterCount, vertexWeight) {
                    return __awaiter(this, void 0, void 0, function () {
                        var vertexCounts, triCount, tris, i, vs, started, i, j, _b, t, time;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Smoothing surface...', true)];
                                case 1:
                                    _a.sent();
                                    vertexCounts = new Int32Array(surface.vertexCount), triCount = surface.triangleIndices.length;
                                    tris = surface.triangleIndices;
                                    for (i = 0; i < triCount; i++) {
                                        // in a triangle 2 edges touch each vertex, hence the constant.
                                        vertexCounts[tris[i]] += 2;
                                    }
                                    vs = new Float32Array(surface.vertices.length);
                                    started = Core.Utils.PerformanceMonitor.currentTime();
                                    return [4 /*yield*/, ctx.updateProgress('Smoothing surface...', true)];
                                case 2:
                                    _a.sent();
                                    i = 0;
                                    _a.label = 3;
                                case 3:
                                    if (!(i < iterCount)) return [3 /*break*/, 6];
                                    if (i > 0) {
                                        for (j = 0, _b = vs.length; j < _b; j++)
                                            vs[j] = 0;
                                    }
                                    surface.normals = void 0;
                                    laplacianSmoothIter(surface, vertexCounts, vs, vertexWeight);
                                    t = surface.vertices;
                                    surface.vertices = vs;
                                    vs = t;
                                    time = Core.Utils.PerformanceMonitor.currentTime();
                                    if (!(time - started > Core.Computation.UpdateProgressDelta)) return [3 /*break*/, 5];
                                    started = time;
                                    return [4 /*yield*/, ctx.updateProgress('Smoothing surface...', true, i + 1, iterCount)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5:
                                    i++;
                                    return [3 /*break*/, 3];
                                case 6: return [2 /*return*/, surface];
                            }
                        });
                    });
                }
                /*
                 * Smooths the vertices by averaging the neighborhood.
                 *
                 * Resets normals. Might replace vertex array.
                 */
                function laplacianSmooth(surface, iterCount, vertexWeight) {
                    var _this = this;
                    if (iterCount === void 0) { iterCount = 1; }
                    if (vertexWeight === void 0) { vertexWeight = 1; }
                    if (iterCount < 1)
                        iterCount = 0;
                    if (iterCount === 0)
                        return Core.Computation.resolve(surface);
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, laplacianSmoothComputation(ctx, surface, iterCount, (1.1 * vertexWeight) / 1.1)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); });
                }
                Surface.laplacianSmooth = laplacianSmooth;
                function computeBoundingSphere(surface) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var vertices, x, y, z, i, _c, r, i, _c, dx, dy, dz;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (surface.boundingSphere) {
                                        return [2 /*return*/, surface];
                                    }
                                    return [4 /*yield*/, ctx.updateProgress('Computing bounding sphere...')];
                                case 1:
                                    _a.sent();
                                    vertices = surface.vertices;
                                    x = 0, y = 0, z = 0;
                                    for (i = 0, _c = surface.vertices.length; i < _c; i += 3) {
                                        x += vertices[i];
                                        y += vertices[i + 1];
                                        z += vertices[i + 2];
                                    }
                                    x /= surface.vertexCount;
                                    y /= surface.vertexCount;
                                    z /= surface.vertexCount;
                                    r = 0;
                                    for (i = 0, _c = vertices.length; i < _c; i += 3) {
                                        dx = x - vertices[i];
                                        dy = y - vertices[i + 1];
                                        dz = z - vertices[i + 2];
                                        r = Math.max(r, dx * dx + dy * dy + dz * dz);
                                    }
                                    surface.boundingSphere = {
                                        center: Geometry.LinearAlgebra.Vector3.fromValues(x, y, z),
                                        radius: Math.sqrt(r)
                                    };
                                    return [2 /*return*/, surface];
                            }
                        });
                    }); });
                }
                Surface.computeBoundingSphere = computeBoundingSphere;
                function transformImmediate(surface, t) {
                    var p = Geometry.LinearAlgebra.Vector3.zero();
                    var m = Geometry.LinearAlgebra.Vector3.transformMat4;
                    var vertices = surface.vertices;
                    for (var i = 0, _c = surface.vertices.length; i < _c; i += 3) {
                        p[0] = vertices[i];
                        p[1] = vertices[i + 1];
                        p[2] = vertices[i + 2];
                        m(p, p, t);
                        vertices[i] = p[0];
                        vertices[i + 1] = p[1];
                        vertices[i + 2] = p[2];
                    }
                    surface.normals = void 0;
                    surface.boundingSphere = void 0;
                }
                Surface.transformImmediate = transformImmediate;
                function transform(surface, t) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            ctx.updateProgress('Updating surface...');
                            transformImmediate(surface, t);
                            return [2 /*return*/, surface];
                        });
                    }); });
                }
                Surface.transform = transform;
            })(Surface = Geometry.Surface || (Geometry.Surface = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var Query3D;
            (function (Query3D) {
                var Box3D;
                (function (Box3D) {
                    function createInfinite() {
                        return {
                            min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
                            max: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]
                        };
                    }
                    Box3D.createInfinite = createInfinite;
                })(Box3D = Query3D.Box3D || (Query3D.Box3D = {}));
                var QueryContext;
                (function (QueryContext) {
                    function add(ctx, distSq, index) {
                        var buffer = ctx.buffer;
                        buffer.squaredDistances[buffer.count] = distSq;
                        buffer.elements[buffer.count++] = buffer.sourceElements[index];
                    }
                    QueryContext.add = add;
                    function resetBuffer(buffer) { buffer.count = 0; }
                    function createBuffer(sourceElements) {
                        return {
                            sourceElements: sourceElements,
                            elements: [],
                            count: 0,
                            squaredDistances: []
                        };
                    }
                    /**
                     * Query the tree and store the result to this.buffer. Overwrites the old result.
                     */
                    function update(ctx, x, y, z, radius) {
                        ctx.pivot[0] = x;
                        ctx.pivot[1] = y;
                        ctx.pivot[2] = z;
                        ctx.radius = radius;
                        ctx.radiusSq = radius * radius;
                        resetBuffer(ctx.buffer);
                    }
                    QueryContext.update = update;
                    function create(structure, sourceElements) {
                        return {
                            structure: structure,
                            buffer: createBuffer(sourceElements),
                            pivot: [0.1, 0.1, 0.1],
                            radius: 1.1,
                            radiusSq: 1.1 * 1.1
                        };
                    }
                    QueryContext.create = create;
                })(QueryContext = Query3D.QueryContext || (Query3D.QueryContext = {}));
                var PositionBuilder;
                (function (PositionBuilder) {
                    function add(builder, x, y, z) {
                        builder.data[builder._count++] = x;
                        builder.data[builder._count++] = y;
                        builder.data[builder._count++] = z;
                        builder.boundsMin[0] = Math.min(x, builder.boundsMin[0]);
                        builder.boundsMin[1] = Math.min(y, builder.boundsMin[1]);
                        builder.boundsMin[2] = Math.min(z, builder.boundsMin[2]);
                        builder.boundsMax[0] = Math.max(x, builder.boundsMax[0]);
                        builder.boundsMax[1] = Math.max(y, builder.boundsMax[1]);
                        builder.boundsMax[2] = Math.max(z, builder.boundsMax[2]);
                    }
                    PositionBuilder.add = add;
                    function create(size) {
                        var data = new Float32Array((size * 3) | 0);
                        var bounds = Box3D.createInfinite();
                        var boundsMin = bounds.min;
                        var boundsMax = bounds.max;
                        return { _count: 0, data: data, bounds: bounds, boundsMin: boundsMin, boundsMax: boundsMax };
                    }
                    PositionBuilder.create = create;
                    function createAdder(builder) {
                        var add = PositionBuilder.add;
                        return function (x, y, z) {
                            add(builder, x, y, z);
                        };
                    }
                    PositionBuilder.createAdder = createAdder;
                })(PositionBuilder || (PositionBuilder = {}));
                function createInputData(elements, f) {
                    var positions = PositionBuilder.create(elements.length);
                    var indices = new Int32Array(elements.length);
                    var add = PositionBuilder.createAdder(positions);
                    for (var i = 0; i < elements.length; i++) {
                        indices[i] = i;
                        f(elements[i], add);
                    }
                    return { elements: elements, positions: positions.data, bounds: positions.bounds, indices: indices };
                }
                Query3D.createInputData = createInputData;
            })(Query3D = Geometry.Query3D || (Geometry.Query3D = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var Query3D;
            (function (Query3D) {
                var SubdivisionTree3DNode;
                (function (SubdivisionTree3DNode) {
                    function nearestLeaf(node, ctx) {
                        var pivot = ctx.pivot, _a = ctx.structure, indices = _a.indices, positions = _a.positions, rSq = ctx.radiusSq, dx, dy, dz, o, m, i;
                        for (i = node.startIndex; i < node.endIndex; i++) {
                            o = 3 * indices[i];
                            dx = pivot[0] - positions[o];
                            dy = pivot[1] - positions[o + 1];
                            dz = pivot[2] - positions[o + 2];
                            m = dx * dx + dy * dy + dz * dz;
                            if (m <= rSq)
                                Query3D.QueryContext.add(ctx, m, indices[i]);
                        }
                    }
                    function nearestNode(node, ctx, dim) {
                        var pivot = ctx.pivot[dim], left = pivot < node.splitValue;
                        if (left ? pivot + ctx.radius > node.splitValue : pivot - ctx.radius < node.splitValue) {
                            nearest(node.left, ctx, (dim + 1) % 3);
                            nearest(node.right, ctx, (dim + 1) % 3);
                        }
                        else if (left) {
                            nearest(node.left, ctx, (dim + 1) % 3);
                        }
                        else {
                            nearest(node.right, ctx, (dim + 1) % 3);
                        }
                    }
                    function nearest(node, ctx, dim) {
                        // check for empty.
                        if (node.startIndex === node.endIndex)
                            return;
                        // is leaf?
                        if (isNaN(node.splitValue))
                            nearestLeaf(node, ctx);
                        else
                            nearestNode(node, ctx, dim);
                    }
                    SubdivisionTree3DNode.nearest = nearest;
                    function create(splitValue, startIndex, endIndex, left, right) {
                        return { splitValue: splitValue, startIndex: startIndex, endIndex: endIndex, left: left, right: right };
                    }
                    SubdivisionTree3DNode.create = create;
                })(SubdivisionTree3DNode || (SubdivisionTree3DNode = {}));
                /**
                 * A helper to build the tree.
                 */
                var SubdivisionTree3DBuilder;
                (function (SubdivisionTree3DBuilder) {
                    function split(state, startIndex, endIndex, coord) {
                        var delta = endIndex - startIndex + 1;
                        if (delta <= 0) {
                            return state.emptyNode;
                        }
                        else if (delta <= state.leafSize) {
                            return SubdivisionTree3DNode.create(NaN, startIndex, endIndex + 1, state.emptyNode, state.emptyNode);
                        }
                        var min = state.bounds.min[coord], max = state.bounds.max[coord], median = 0.5 * (min + max), midIndex = 0, l = startIndex, r = endIndex, t, left, right;
                        while (l < r) {
                            t = state.indices[r];
                            state.indices[r] = state.indices[l];
                            state.indices[l] = t;
                            while (l <= endIndex && state.positions[3 * state.indices[l] + coord] <= median)
                                l++;
                            while (r >= startIndex && state.positions[3 * state.indices[r] + coord] > median)
                                r--;
                        }
                        midIndex = l - 1;
                        state.bounds.max[coord] = median;
                        left = split(state, startIndex, midIndex, (coord + 1) % 3);
                        state.bounds.max[coord] = max;
                        state.bounds.min[coord] = median;
                        right = split(state, midIndex + 1, endIndex, (coord + 1) % 3);
                        state.bounds.min[coord] = min;
                        return SubdivisionTree3DNode.create(median, startIndex, endIndex + 1, left, right);
                    }
                    function build(_a, leafSize) {
                        var elements = _a.elements, positions = _a.positions, bounds = _a.bounds, indices = _a.indices;
                        var state = {
                            bounds: bounds,
                            positions: positions,
                            leafSize: leafSize,
                            indices: indices,
                            emptyNode: SubdivisionTree3DNode.create(NaN, -1, -1, void 0, void 0),
                        };
                        var root = split(state, 0, indices.length - 1, 0);
                        return { root: root, indices: indices, positions: positions };
                    }
                    SubdivisionTree3DBuilder.build = build;
                })(SubdivisionTree3DBuilder || (SubdivisionTree3DBuilder = {}));
                function createSubdivisionTree(data, leafSize) {
                    if (leafSize === void 0) { leafSize = 32; }
                    var tree = SubdivisionTree3DBuilder.build(data, leafSize);
                    return function () {
                        var ctx = Query3D.QueryContext.create(tree, data.elements);
                        return function (x, y, z, radius) {
                            Query3D.QueryContext.update(ctx, x, y, z, radius);
                            SubdivisionTree3DNode.nearest(tree.root, ctx, 0);
                            return ctx.buffer;
                        };
                    };
                }
                Query3D.createSubdivisionTree = createSubdivisionTree;
            })(Query3D = Geometry.Query3D || (Geometry.Query3D = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var Query3D;
            (function (Query3D) {
                /**
                 * Adapted from https://github.com/arose/ngl
                 * MIT License Copyright (C) 2014+ Alexander Rose
                 */
                function nearest(ctx) {
                    var _a = ctx.structure, _b = _a.min, minX = _b[0], minY = _b[1], minZ = _b[2], _c = _a.size, sX = _c[0], sY = _c[1], sZ = _c[2], bucketOffset = _a.bucketOffset, bucketCounts = _a.bucketCounts, bucketArray = _a.bucketArray, grid = _a.grid, positions = _a.positions;
                    var r = ctx.radius, rSq = ctx.radiusSq, _d = ctx.pivot, x = _d[0], y = _d[1], z = _d[2];
                    var loX = Math.max(0, (x - r - minX) >> 3 /* Exp */);
                    var loY = Math.max(0, (y - r - minY) >> 3 /* Exp */);
                    var loZ = Math.max(0, (z - r - minZ) >> 3 /* Exp */);
                    var hiX = Math.min(sX, (x + r - minX) >> 3 /* Exp */);
                    var hiY = Math.min(sY, (y + r - minY) >> 3 /* Exp */);
                    var hiZ = Math.min(sZ, (z + r - minZ) >> 3 /* Exp */);
                    for (var ix = loX; ix <= hiX; ix++) {
                        for (var iy = loY; iy <= hiY; iy++) {
                            for (var iz = loZ; iz <= hiZ; iz++) {
                                var idx = (((ix * sY) + iy) * sZ) + iz;
                                var bucketIdx = grid[idx];
                                if (bucketIdx > 0) {
                                    var k = bucketIdx - 1;
                                    var offset = bucketOffset[k];
                                    var count = bucketCounts[k];
                                    var end = offset + count;
                                    for (var i = offset; i < end; i++) {
                                        var idx_1 = bucketArray[i];
                                        var dx = positions[3 * idx_1 + 0] - x;
                                        var dy = positions[3 * idx_1 + 1] - y;
                                        var dz = positions[3 * idx_1 + 2] - z;
                                        var distSq = dx * dx + dy * dy + dz * dz;
                                        if (distSq <= rSq) {
                                            Query3D.QueryContext.add(ctx, distSq, idx_1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                function _build(state) {
                    var bounds = state.bounds, _a = state.size, sX = _a[0], sY = _a[1], sZ = _a[2], positions = state.positions, indices = state.indices;
                    var n = sX * sY * sZ;
                    var count = indices.length;
                    var _b = bounds.min, minX = _b[0], minY = _b[1], minZ = _b[2];
                    var bucketCount = 0;
                    var grid = new Uint32Array(n);
                    var bucketIndex = new Int32Array(count);
                    for (var i = 0; i < count; i++) {
                        var x = (positions[3 * i + 0] - minX) >> 3 /* Exp */;
                        var y = (positions[3 * i + 1] - minY) >> 3 /* Exp */;
                        var z = (positions[3 * i + 2] - minZ) >> 3 /* Exp */;
                        var idx = (((x * sY) + y) * sZ) + z;
                        if ((grid[idx] += 1) === 1) {
                            bucketCount += 1;
                        }
                        bucketIndex[i] = idx;
                    }
                    var bucketCounts = new Int32Array(bucketCount);
                    for (var i = 0, j = 0; i < n; i++) {
                        var c = grid[i];
                        if (c > 0) {
                            grid[i] = j + 1;
                            bucketCounts[j] = c;
                            j += 1;
                        }
                    }
                    var bucketOffset = new Uint32Array(count);
                    for (var i = 1; i < count; ++i) {
                        bucketOffset[i] += bucketOffset[i - 1] + bucketCounts[i - 1];
                    }
                    var bucketFill = new Int32Array(bucketCount);
                    var bucketArray = new Int32Array(count);
                    for (var i = 0; i < count; i++) {
                        var bucketIdx = grid[bucketIndex[i]];
                        if (bucketIdx > 0) {
                            var k = bucketIdx - 1;
                            bucketArray[bucketOffset[k] + bucketFill[k]] = i;
                            bucketFill[k] += 1;
                        }
                    }
                    return {
                        size: state.size,
                        bucketArray: bucketArray,
                        bucketCounts: bucketCounts,
                        bucketOffset: bucketOffset,
                        grid: grid,
                        min: state.bounds.min,
                        positions: positions
                    };
                }
                function build(_a) {
                    var elements = _a.elements, positions = _a.positions, bounds = _a.bounds, indices = _a.indices;
                    var size = [
                        ((bounds.max[0] - bounds.min[0]) >> 3 /* Exp */) + 1,
                        ((bounds.max[1] - bounds.min[1]) >> 3 /* Exp */) + 1,
                        ((bounds.max[2] - bounds.min[2]) >> 3 /* Exp */) + 1
                    ];
                    var state = {
                        size: size,
                        positions: positions,
                        indices: indices,
                        bounds: bounds
                    };
                    return _build(state);
                }
                function createSpatialHash(data) {
                    var tree = build(data);
                    return function () {
                        var ctx = Query3D.QueryContext.create(tree, data.elements);
                        return function (x, y, z, radius) {
                            Query3D.QueryContext.update(ctx, x, y, z, radius);
                            nearest(ctx);
                            return ctx.buffer;
                        };
                    };
                }
                Query3D.createSpatialHash = createSpatialHash;
            })(Query3D = Geometry.Query3D || (Geometry.Query3D = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var MarchingCubes;
            (function (MarchingCubes) {
                "use strict";
                function compute(parameters) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var comp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    comp = new MarchingCubesComputation(parameters, ctx);
                                    return [4 /*yield*/, comp.run()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); });
                }
                MarchingCubes.compute = compute;
                var MarchingCubesComputation = /** @class */ (function () {
                    function MarchingCubesComputation(parameters, ctx) {
                        this.ctx = ctx;
                        this.minX = 0;
                        this.minY = 0;
                        this.minZ = 0;
                        this.maxX = 0;
                        this.maxY = 0;
                        this.maxZ = 0;
                        var params = Core.Utils.extend({}, parameters);
                        if (!params.bottomLeft)
                            params.bottomLeft = [0, 0, 0];
                        if (!params.topRight)
                            params.topRight = params.scalarField.dimensions;
                        this.state = new MarchingCubesState(params),
                            this.minX = params.bottomLeft[0];
                        this.minY = params.bottomLeft[1];
                        this.minZ = params.bottomLeft[2];
                        this.maxX = params.topRight[0] - 1;
                        this.maxY = params.topRight[1] - 1;
                        this.maxZ = params.topRight[2] - 1;
                        this.size = (this.maxX - this.minX) * (this.maxY - this.minY) * (this.maxZ - this.minZ);
                        this.sliceSize = (this.maxX - this.minX) * (this.maxY - this.minY);
                    }
                    MarchingCubesComputation.prototype.doSlices = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var done, started, k, t;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        done = 0;
                                        started = Core.Utils.PerformanceMonitor.currentTime();
                                        k = this.minZ;
                                        _a.label = 1;
                                    case 1:
                                        if (!(k < this.maxZ)) return [3 /*break*/, 4];
                                        this.slice(k);
                                        done += this.sliceSize;
                                        t = Core.Utils.PerformanceMonitor.currentTime();
                                        if (!(t - started > Core.Computation.UpdateProgressDelta)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this.ctx.updateProgress('Computing surface...', true, done, this.size)];
                                    case 2:
                                        _a.sent();
                                        started = t;
                                        _a.label = 3;
                                    case 3:
                                        k++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        });
                    };
                    MarchingCubesComputation.prototype.slice = function (k) {
                        for (var j = this.minY; j < this.maxY; j++) {
                            for (var i = this.minX; i < this.maxX; i++) {
                                this.state.processCell(i, j, k);
                            }
                        }
                        this.state.clearEdgeVertexIndexSlice(k);
                    };
                    MarchingCubesComputation.prototype.finish = function () {
                        var vertices = Core.Utils.ChunkedArray.compact(this.state.vertexBuffer);
                        var triangles = Core.Utils.ChunkedArray.compact(this.state.triangleBuffer);
                        this.state.vertexBuffer = void 0;
                        this.state.verticesOnEdges = void 0;
                        var ret = {
                            vertexCount: (vertices.length / 3) | 0,
                            triangleCount: (triangles.length / 3) | 0,
                            vertices: vertices,
                            triangleIndices: triangles,
                            annotation: this.state.annotate ? Core.Utils.ChunkedArray.compact(this.state.annotationBuffer) : void 0
                        };
                        return ret;
                    };
                    MarchingCubesComputation.prototype.run = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.ctx.updateProgress('Computing surface...', true, 0, this.size)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, this.doSlices()];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.ctx.updateProgress('Finalizing...')];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, this.finish()];
                                }
                            });
                        });
                    };
                    return MarchingCubesComputation;
                }());
                var MarchingCubesState = /** @class */ (function () {
                    function MarchingCubesState(params) {
                        this.vertList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        this.i = 0;
                        this.j = 0;
                        this.k = 0;
                        this.nX = params.scalarField.dimensions[0];
                        this.nY = params.scalarField.dimensions[1];
                        this.nZ = params.scalarField.dimensions[2];
                        this.isoLevel = params.isoLevel;
                        this.scalarField = params.scalarField;
                        this.annotationField = params.annotationField;
                        var dX = params.topRight[0] - params.bottomLeft[0], dY = params.topRight[1] - params.bottomLeft[1], dZ = params.topRight[2] - params.bottomLeft[2], vertexBufferSize = Math.min(262144, Math.max(dX * dY * dZ / 16, 1024) | 0), triangleBufferSize = Math.min(1 << 16, vertexBufferSize * 4);
                        this.vertexBuffer = Core.Utils.ChunkedArray.forVertex3D(vertexBufferSize);
                        this.triangleBuffer = Core.Utils.ChunkedArray.create(function (size) { return new Uint32Array(size); }, triangleBufferSize, 3);
                        this.annotate = !!params.annotationField;
                        if (this.annotate)
                            this.annotationBuffer = Core.Utils.ChunkedArray.forInt32(vertexBufferSize);
                        // two layers of vertex indices. Each vertex has 3 edges associated.
                        this.verticesOnEdges = new Int32Array(3 * this.nX * this.nY * 2);
                    }
                    MarchingCubesState.prototype.get3dOffsetFromEdgeInfo = function (index) {
                        return (this.nX * (((this.k + index.k) % 2) * this.nY + this.j + index.j) + this.i + index.i);
                    };
                    /**
                     * This clears the "vertex index buffer" for the slice that will not be accessed anymore.
                     */
                    MarchingCubesState.prototype.clearEdgeVertexIndexSlice = function (k) {
                        // clear either the top or bottom half of the buffer...
                        var start = k % 2 === 0 ? 0 : 3 * this.nX * this.nY;
                        var end = k % 2 === 0 ? 3 * this.nX * this.nY : this.verticesOnEdges.length;
                        for (var i = start; i < end; i++)
                            this.verticesOnEdges[i] = 0;
                    };
                    MarchingCubesState.prototype.interpolate = function (edgeNum) {
                        var info = MarchingCubes.EdgeIdInfo[edgeNum], edgeId = 3 * this.get3dOffsetFromEdgeInfo(info) + info.e;
                        var ret = this.verticesOnEdges[edgeId];
                        if (ret > 0)
                            return (ret - 1) | 0;
                        var edge = MarchingCubes.CubeEdges[edgeNum];
                        var a = edge.a, b = edge.b;
                        var li = a.i + this.i, lj = a.j + this.j, lk = a.k + this.k;
                        var hi = b.i + this.i, hj = b.j + this.j, hk = b.k + this.k;
                        var v0 = this.scalarField.get(li, lj, lk), v1 = this.scalarField.get(hi, hj, hk);
                        var t = (this.isoLevel - v0) / (v0 - v1);
                        var id = Core.Utils.ChunkedArray.add3(this.vertexBuffer, li + t * (li - hi), lj + t * (lj - hj), lk + t * (lk - hk)) | 0;
                        this.verticesOnEdges[edgeId] = id + 1;
                        if (this.annotate) {
                            var a_1 = t < 0.5 ? this.annotationField.get(li, lj, lk) : this.annotationField.get(hi, hj, hk);
                            if (a_1 < 0)
                                a_1 = t < 0.5 ? this.annotationField.get(hi, hj, hk) : this.annotationField.get(li, lj, lk);
                            Core.Utils.ChunkedArray.add(this.annotationBuffer, a_1);
                        }
                        return id;
                    };
                    MarchingCubesState.prototype.processCell = function (i, j, k) {
                        var tableIndex = 0;
                        if (this.scalarField.get(i, j, k) < this.isoLevel)
                            tableIndex |= 1;
                        if (this.scalarField.get(i + 1, j, k) < this.isoLevel)
                            tableIndex |= 2;
                        if (this.scalarField.get(i + 1, j + 1, k) < this.isoLevel)
                            tableIndex |= 4;
                        if (this.scalarField.get(i, j + 1, k) < this.isoLevel)
                            tableIndex |= 8;
                        if (this.scalarField.get(i, j, k + 1) < this.isoLevel)
                            tableIndex |= 16;
                        if (this.scalarField.get(i + 1, j, k + 1) < this.isoLevel)
                            tableIndex |= 32;
                        if (this.scalarField.get(i + 1, j + 1, k + 1) < this.isoLevel)
                            tableIndex |= 64;
                        if (this.scalarField.get(i, j + 1, k + 1) < this.isoLevel)
                            tableIndex |= 128;
                        if (tableIndex === 0 || tableIndex === 255)
                            return;
                        this.i = i;
                        this.j = j;
                        this.k = k;
                        var edgeInfo = MarchingCubes.EdgeTable[tableIndex];
                        if ((edgeInfo & 1) > 0)
                            this.vertList[0] = this.interpolate(0); // 0 1
                        if ((edgeInfo & 2) > 0)
                            this.vertList[1] = this.interpolate(1); // 1 2
                        if ((edgeInfo & 4) > 0)
                            this.vertList[2] = this.interpolate(2); // 2 3
                        if ((edgeInfo & 8) > 0)
                            this.vertList[3] = this.interpolate(3); // 0 3
                        if ((edgeInfo & 16) > 0)
                            this.vertList[4] = this.interpolate(4); // 4 5
                        if ((edgeInfo & 32) > 0)
                            this.vertList[5] = this.interpolate(5); // 5 6
                        if ((edgeInfo & 64) > 0)
                            this.vertList[6] = this.interpolate(6); // 6 7
                        if ((edgeInfo & 128) > 0)
                            this.vertList[7] = this.interpolate(7); // 4 7
                        if ((edgeInfo & 256) > 0)
                            this.vertList[8] = this.interpolate(8); // 0 4
                        if ((edgeInfo & 512) > 0)
                            this.vertList[9] = this.interpolate(9); // 1 5
                        if ((edgeInfo & 1024) > 0)
                            this.vertList[10] = this.interpolate(10); // 2 6
                        if ((edgeInfo & 2048) > 0)
                            this.vertList[11] = this.interpolate(11); // 3 7
                        var triInfo = MarchingCubes.TriTable[tableIndex];
                        for (var t = 0; t < triInfo.length; t += 3) {
                            Core.Utils.ChunkedArray.add3(this.triangleBuffer, this.vertList[triInfo[t]], this.vertList[triInfo[t + 1]], this.vertList[triInfo[t + 2]]);
                        }
                    };
                    return MarchingCubesState;
                }());
            })(MarchingCubes = Geometry.MarchingCubes || (Geometry.MarchingCubes = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var MarchingCubes;
            (function (MarchingCubes) {
                var Index = /** @class */ (function () {
                    function Index(i, j, k) {
                        this.i = i | 0;
                        this.j = j | 0;
                        this.k = k | 0;
                    }
                    return Index;
                }());
                MarchingCubes.Index = Index;
                var IndexPair = /** @class */ (function () {
                    function IndexPair(a, b) {
                        this.a = a;
                        this.b = b;
                    }
                    return IndexPair;
                }());
                MarchingCubes.IndexPair = IndexPair;
                MarchingCubes.EdgesXY = [
                    [],
                    [0, 3],
                    [0, 1],
                    [1, 3],
                    [1, 2],
                    [0, 1, 1, 2, 2, 3, 0, 3],
                    [0, 2],
                    [2, 3],
                    [2, 3],
                    [0, 2],
                    [0, 1, 1, 2, 2, 3, 0, 3],
                    [1, 2],
                    [1, 3],
                    [0, 1],
                    [0, 3],
                    []
                ];
                MarchingCubes.EdgesXZ = [
                    [],
                    [0, 8],
                    [0, 9],
                    [9, 8],
                    [9, 4],
                    [0, 9, 9, 4, 4, 8, 0, 8],
                    [0, 4],
                    [4, 8],
                    [4, 8],
                    [0, 4],
                    [0, 9, 9, 4, 4, 8, 0, 8],
                    [9, 4],
                    [9, 8],
                    [0, 9],
                    [0, 8],
                    []
                ];
                MarchingCubes.EdgesYZ = [
                    [],
                    [3, 8],
                    [3, 11],
                    [11, 8],
                    [11, 7],
                    [3, 11, 11, 7, 7, 8, 3, 8],
                    [3, 7],
                    [7, 8],
                    [7, 8],
                    [3, 7],
                    [3, 11, 11, 7, 7, 8, 3, 8],
                    [11, 7],
                    [11, 8],
                    [3, 11],
                    [3, 8],
                    []
                ];
                MarchingCubes.CubeVertices = [
                    new Index(0, 0, 0),
                    new Index(1, 0, 0),
                    new Index(1, 1, 0),
                    new Index(0, 1, 0),
                    new Index(0, 0, 1),
                    new Index(1, 0, 1),
                    new Index(1, 1, 1),
                    new Index(0, 1, 1),
                ];
                MarchingCubes.CubeEdges = [
                    new IndexPair(MarchingCubes.CubeVertices[0], MarchingCubes.CubeVertices[1]),
                    new IndexPair(MarchingCubes.CubeVertices[1], MarchingCubes.CubeVertices[2]),
                    new IndexPair(MarchingCubes.CubeVertices[2], MarchingCubes.CubeVertices[3]),
                    new IndexPair(MarchingCubes.CubeVertices[3], MarchingCubes.CubeVertices[0]),
                    new IndexPair(MarchingCubes.CubeVertices[4], MarchingCubes.CubeVertices[5]),
                    new IndexPair(MarchingCubes.CubeVertices[5], MarchingCubes.CubeVertices[6]),
                    new IndexPair(MarchingCubes.CubeVertices[6], MarchingCubes.CubeVertices[7]),
                    new IndexPair(MarchingCubes.CubeVertices[7], MarchingCubes.CubeVertices[4]),
                    new IndexPair(MarchingCubes.CubeVertices[0], MarchingCubes.CubeVertices[4]),
                    new IndexPair(MarchingCubes.CubeVertices[1], MarchingCubes.CubeVertices[5]),
                    new IndexPair(MarchingCubes.CubeVertices[2], MarchingCubes.CubeVertices[6]),
                    new IndexPair(MarchingCubes.CubeVertices[3], MarchingCubes.CubeVertices[7]),
                ];
                MarchingCubes.EdgeIdInfo = [
                    { i: 0, j: 0, k: 0, e: 0 },
                    { i: 1, j: 0, k: 0, e: 1 },
                    { i: 0, j: 1, k: 0, e: 0 },
                    { i: 0, j: 0, k: 0, e: 1 },
                    { i: 0, j: 0, k: 1, e: 0 },
                    { i: 1, j: 0, k: 1, e: 1 },
                    { i: 0, j: 1, k: 1, e: 0 },
                    { i: 0, j: 0, k: 1, e: 1 },
                    { i: 0, j: 0, k: 0, e: 2 },
                    { i: 1, j: 0, k: 0, e: 2 },
                    { i: 1, j: 1, k: 0, e: 2 },
                    { i: 0, j: 1, k: 0, e: 2 }
                ];
                // export var EdgeIdInfo = [
                //     { i: 0, j: 0, k: 0, e: 0 },
                //     { i: 1, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 1, k: 0, e: 0 },
                //     { i: 0, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 0, k: 0, e: 0 },
                //     { i: 1, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 1, k: 0, e: 0 },
                //     { i: 0, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 0, k: 0, e: 0 },
                //     { i: 1, j: 0, k: 0, e: 1 },
                //     { i: 0, j: 1, k: 0, e: 0 },
                //     { i: 0, j: 0, k: 0, e: 1 },
                // ];
                // Tables EdgeTable and TriTable taken from http://paulbourke.net/geometry/polygonise/
                MarchingCubes.EdgeTable = [
                    0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
                    0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
                    0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
                    0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
                    0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
                    0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
                    0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
                    0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
                    0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
                    0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
                    0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
                    0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
                    0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
                    0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
                    0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
                    0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
                    0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
                    0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
                    0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
                    0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
                    0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
                    0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
                    0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
                    0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
                    0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
                    0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
                    0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
                    0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
                    0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
                    0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
                    0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
                    0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
                ];
                MarchingCubes.TriTable = [
                    [],
                    [0, 8, 3],
                    [0, 1, 9],
                    [1, 8, 3, 9, 8, 1],
                    [1, 2, 10],
                    [0, 8, 3, 1, 2, 10],
                    [9, 2, 10, 0, 2, 9],
                    [2, 8, 3, 2, 10, 8, 10, 9, 8],
                    [3, 11, 2],
                    [0, 11, 2, 8, 11, 0],
                    [1, 9, 0, 2, 3, 11],
                    [1, 11, 2, 1, 9, 11, 9, 8, 11],
                    [3, 10, 1, 11, 10, 3],
                    [0, 10, 1, 0, 8, 10, 8, 11, 10],
                    [3, 9, 0, 3, 11, 9, 11, 10, 9],
                    [9, 8, 10, 10, 8, 11],
                    [4, 7, 8],
                    [4, 3, 0, 7, 3, 4],
                    [0, 1, 9, 8, 4, 7],
                    [4, 1, 9, 4, 7, 1, 7, 3, 1],
                    [1, 2, 10, 8, 4, 7],
                    [3, 4, 7, 3, 0, 4, 1, 2, 10],
                    [9, 2, 10, 9, 0, 2, 8, 4, 7],
                    [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
                    [8, 4, 7, 3, 11, 2],
                    [11, 4, 7, 11, 2, 4, 2, 0, 4],
                    [9, 0, 1, 8, 4, 7, 2, 3, 11],
                    [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
                    [3, 10, 1, 3, 11, 10, 7, 8, 4],
                    [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
                    [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
                    [4, 7, 11, 4, 11, 9, 9, 11, 10],
                    [9, 5, 4],
                    [9, 5, 4, 0, 8, 3],
                    [0, 5, 4, 1, 5, 0],
                    [8, 5, 4, 8, 3, 5, 3, 1, 5],
                    [1, 2, 10, 9, 5, 4],
                    [3, 0, 8, 1, 2, 10, 4, 9, 5],
                    [5, 2, 10, 5, 4, 2, 4, 0, 2],
                    [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
                    [9, 5, 4, 2, 3, 11],
                    [0, 11, 2, 0, 8, 11, 4, 9, 5],
                    [0, 5, 4, 0, 1, 5, 2, 3, 11],
                    [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
                    [10, 3, 11, 10, 1, 3, 9, 5, 4],
                    [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
                    [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
                    [5, 4, 8, 5, 8, 10, 10, 8, 11],
                    [9, 7, 8, 5, 7, 9],
                    [9, 3, 0, 9, 5, 3, 5, 7, 3],
                    [0, 7, 8, 0, 1, 7, 1, 5, 7],
                    [1, 5, 3, 3, 5, 7],
                    [9, 7, 8, 9, 5, 7, 10, 1, 2],
                    [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
                    [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
                    [2, 10, 5, 2, 5, 3, 3, 5, 7],
                    [7, 9, 5, 7, 8, 9, 3, 11, 2],
                    [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
                    [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
                    [11, 2, 1, 11, 1, 7, 7, 1, 5],
                    [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
                    [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
                    [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
                    [11, 10, 5, 7, 11, 5],
                    [10, 6, 5],
                    [0, 8, 3, 5, 10, 6],
                    [9, 0, 1, 5, 10, 6],
                    [1, 8, 3, 1, 9, 8, 5, 10, 6],
                    [1, 6, 5, 2, 6, 1],
                    [1, 6, 5, 1, 2, 6, 3, 0, 8],
                    [9, 6, 5, 9, 0, 6, 0, 2, 6],
                    [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
                    [2, 3, 11, 10, 6, 5],
                    [11, 0, 8, 11, 2, 0, 10, 6, 5],
                    [0, 1, 9, 2, 3, 11, 5, 10, 6],
                    [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
                    [6, 3, 11, 6, 5, 3, 5, 1, 3],
                    [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
                    [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
                    [6, 5, 9, 6, 9, 11, 11, 9, 8],
                    [5, 10, 6, 4, 7, 8],
                    [4, 3, 0, 4, 7, 3, 6, 5, 10],
                    [1, 9, 0, 5, 10, 6, 8, 4, 7],
                    [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
                    [6, 1, 2, 6, 5, 1, 4, 7, 8],
                    [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
                    [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
                    [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
                    [3, 11, 2, 7, 8, 4, 10, 6, 5],
                    [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
                    [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
                    [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
                    [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6],
                    [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11],
                    [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7],
                    [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9],
                    [10, 4, 9, 6, 4, 10],
                    [4, 10, 6, 4, 9, 10, 0, 8, 3],
                    [10, 0, 1, 10, 6, 0, 6, 4, 0],
                    [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
                    [1, 4, 9, 1, 2, 4, 2, 6, 4],
                    [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
                    [0, 2, 4, 4, 2, 6],
                    [8, 3, 2, 8, 2, 4, 4, 2, 6],
                    [10, 4, 9, 10, 6, 4, 11, 2, 3],
                    [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
                    [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
                    [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
                    [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
                    [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
                    [3, 11, 6, 3, 6, 0, 0, 6, 4],
                    [6, 4, 8, 11, 6, 8],
                    [7, 10, 6, 7, 8, 10, 8, 9, 10],
                    [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
                    [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
                    [10, 6, 7, 10, 7, 1, 1, 7, 3],
                    [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
                    [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
                    [7, 8, 0, 7, 0, 6, 6, 0, 2],
                    [7, 3, 2, 6, 7, 2],
                    [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
                    [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
                    [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
                    [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
                    [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
                    [0, 9, 1, 11, 6, 7],
                    [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
                    [7, 11, 6],
                    [7, 6, 11],
                    [3, 0, 8, 11, 7, 6],
                    [0, 1, 9, 11, 7, 6],
                    [8, 1, 9, 8, 3, 1, 11, 7, 6],
                    [10, 1, 2, 6, 11, 7],
                    [1, 2, 10, 3, 0, 8, 6, 11, 7],
                    [2, 9, 0, 2, 10, 9, 6, 11, 7],
                    [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
                    [7, 2, 3, 6, 2, 7],
                    [7, 0, 8, 7, 6, 0, 6, 2, 0],
                    [2, 7, 6, 2, 3, 7, 0, 1, 9],
                    [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
                    [10, 7, 6, 10, 1, 7, 1, 3, 7],
                    [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
                    [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
                    [7, 6, 10, 7, 10, 8, 8, 10, 9],
                    [6, 8, 4, 11, 8, 6],
                    [3, 6, 11, 3, 0, 6, 0, 4, 6],
                    [8, 6, 11, 8, 4, 6, 9, 0, 1],
                    [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
                    [6, 8, 4, 6, 11, 8, 2, 10, 1],
                    [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
                    [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
                    [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
                    [8, 2, 3, 8, 4, 2, 4, 6, 2],
                    [0, 4, 2, 4, 6, 2],
                    [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
                    [1, 9, 4, 1, 4, 2, 2, 4, 6],
                    [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
                    [10, 1, 0, 10, 0, 6, 6, 0, 4],
                    [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
                    [10, 9, 4, 6, 10, 4],
                    [4, 9, 5, 7, 6, 11],
                    [0, 8, 3, 4, 9, 5, 11, 7, 6],
                    [5, 0, 1, 5, 4, 0, 7, 6, 11],
                    [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
                    [9, 5, 4, 10, 1, 2, 7, 6, 11],
                    [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
                    [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
                    [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
                    [7, 2, 3, 7, 6, 2, 5, 4, 9],
                    [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
                    [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
                    [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
                    [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
                    [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
                    [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
                    [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
                    [6, 9, 5, 6, 11, 9, 11, 8, 9],
                    [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
                    [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
                    [6, 11, 3, 6, 3, 5, 5, 3, 1],
                    [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
                    [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
                    [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
                    [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
                    [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
                    [9, 5, 6, 9, 6, 0, 0, 6, 2],
                    [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
                    [1, 5, 6, 2, 1, 6],
                    [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
                    [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
                    [0, 3, 8, 5, 6, 10],
                    [10, 5, 6],
                    [11, 5, 10, 7, 5, 11],
                    [11, 5, 10, 11, 7, 5, 8, 3, 0],
                    [5, 11, 7, 5, 10, 11, 1, 9, 0],
                    [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
                    [11, 1, 2, 11, 7, 1, 7, 5, 1],
                    [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
                    [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
                    [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
                    [2, 5, 10, 2, 3, 5, 3, 7, 5],
                    [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
                    [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
                    [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
                    [1, 3, 5, 3, 7, 5],
                    [0, 8, 7, 0, 7, 1, 1, 7, 5],
                    [9, 0, 3, 9, 3, 5, 5, 3, 7],
                    [9, 8, 7, 5, 9, 7],
                    [5, 8, 4, 5, 10, 8, 10, 11, 8],
                    [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
                    [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
                    [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
                    [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
                    [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
                    [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
                    [9, 4, 5, 2, 11, 3],
                    [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
                    [5, 10, 2, 5, 2, 4, 4, 2, 0],
                    [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
                    [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
                    [8, 4, 5, 8, 5, 3, 3, 5, 1],
                    [0, 4, 5, 1, 0, 5],
                    [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
                    [9, 4, 5],
                    [4, 11, 7, 4, 9, 11, 9, 10, 11],
                    [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
                    [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
                    [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
                    [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
                    [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
                    [11, 7, 4, 11, 4, 2, 2, 4, 0],
                    [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
                    [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
                    [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
                    [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
                    [1, 10, 2, 8, 7, 4],
                    [4, 9, 1, 4, 1, 7, 7, 1, 3],
                    [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
                    [4, 0, 3, 7, 4, 3],
                    [4, 8, 7],
                    [9, 10, 8, 10, 11, 8],
                    [3, 0, 9, 3, 9, 11, 11, 9, 10],
                    [0, 1, 10, 0, 10, 8, 8, 10, 11],
                    [3, 1, 10, 11, 3, 10],
                    [1, 2, 11, 1, 11, 9, 9, 11, 8],
                    [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
                    [0, 2, 11, 8, 0, 11],
                    [3, 2, 11],
                    [2, 3, 8, 2, 8, 10, 10, 8, 9],
                    [9, 10, 2, 0, 9, 2],
                    [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
                    [1, 10, 2],
                    [1, 3, 8, 9, 1, 8],
                    [0, 9, 1],
                    [0, 3, 8],
                    []
                ];
            })(MarchingCubes = Geometry.MarchingCubes || (Geometry.MarchingCubes = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Geometry;
        (function (Geometry) {
            var MolecularSurface;
            (function (MolecularSurface) {
                "use strict";
                var MolecularIsoSurfaceParametersWrapper = /** @class */ (function () {
                    function MolecularIsoSurfaceParametersWrapper(params) {
                        Core.Utils.extend(this, params, {
                            exactBoundary: false,
                            boundaryDelta: { dx: 1.5, dy: 1.5, dz: 1.5 },
                            probeRadius: 1.4,
                            atomRadii: function () { return 1.0; },
                            density: 1.1,
                            interactive: false,
                            smoothingIterations: 1
                        });
                        if (this.exactBoundary)
                            this.boundaryDelta = { dx: 0, dy: 0, dz: 0 };
                        if (this.density < 0.05)
                            this.density = 0.05;
                    }
                    return MolecularIsoSurfaceParametersWrapper;
                }());
                var MolecularIsoFieldComputation = /** @class */ (function () {
                    function MolecularIsoFieldComputation(inputParameters, ctx) {
                        this.inputParameters = inputParameters;
                        this.ctx = ctx;
                        this.minX = Number.MAX_VALUE;
                        this.minY = Number.MAX_VALUE;
                        this.minZ = Number.MAX_VALUE;
                        this.maxX = -Number.MAX_VALUE;
                        this.maxY = -Number.MAX_VALUE;
                        this.maxZ = -Number.MAX_VALUE;
                        this.nX = 0;
                        this.nY = 0;
                        this.nZ = 0;
                        this.dX = 0.1;
                        this.dY = 0.1;
                        this.dZ = 0.1;
                        this.field = new Float32Array(0);
                        this.distanceField = new Float32Array(0);
                        this.proximityMap = new Int32Array(0);
                        this.minIndex = { i: 0, j: 0, k: 0 };
                        this.maxIndex = { i: 0, j: 0, k: 0 };
                        this.parameters = new MolecularIsoSurfaceParametersWrapper(inputParameters.parameters);
                        var positions = inputParameters.positions;
                        this.x = positions.x;
                        this.y = positions.y;
                        this.z = positions.z;
                        this.atomIndices = inputParameters.atomIndices;
                        // make the atoms artificially bigger for low resolution surfaces
                        if (this.parameters.density >= 0.99) {
                            // so that the number is float and not int32 internally 
                            this.vdwScaleFactor = 1.000000001;
                        }
                        else {
                            this.vdwScaleFactor = 1 + (1 - this.parameters.density * this.parameters.density);
                        }
                    }
                    MolecularIsoFieldComputation.prototype.findBounds = function () {
                        for (var _i = 0, _a = this.atomIndices; _i < _a.length; _i++) {
                            var aI = _a[_i];
                            var r = this.parameters.exactBoundary ? 0 : this.vdwScaleFactor * this.parameters.atomRadius(aI) + this.parameters.probeRadius, xx = this.x[aI], yy = this.y[aI], zz = this.z[aI];
                            if (r < 0)
                                continue;
                            this.minX = Math.min(this.minX, xx - r);
                            this.minY = Math.min(this.minY, yy - r);
                            this.minZ = Math.min(this.minZ, zz - r);
                            this.maxX = Math.max(this.maxX, xx + r);
                            this.maxY = Math.max(this.maxY, yy + r);
                            this.maxZ = Math.max(this.maxZ, zz + r);
                        }
                        if (this.minX === Number.MAX_VALUE) {
                            this.minX = this.minY = this.minZ = -1;
                            this.maxX = this.maxY = this.maxZ = 1;
                        }
                        this.minX -= this.parameters.boundaryDelta.dx;
                        this.minY -= this.parameters.boundaryDelta.dy;
                        this.minZ -= this.parameters.boundaryDelta.dz;
                        this.maxX += this.parameters.boundaryDelta.dx;
                        this.maxY += this.parameters.boundaryDelta.dy;
                        this.maxZ += this.parameters.boundaryDelta.dz;
                        this.nX = Math.floor((this.maxX - this.minX) * this.parameters.density);
                        this.nY = Math.floor((this.maxY - this.minY) * this.parameters.density);
                        this.nZ = Math.floor((this.maxZ - this.minZ) * this.parameters.density);
                        this.nX = Math.min(this.nX, 333);
                        this.nY = Math.min(this.nY, 333);
                        this.nZ = Math.min(this.nZ, 333);
                        this.dX = (this.maxX - this.minX) / (this.nX - 1);
                        this.dY = (this.maxY - this.minY) / (this.nY - 1);
                        this.dZ = (this.maxZ - this.minZ) / (this.nZ - 1);
                    };
                    MolecularIsoFieldComputation.prototype.initData = function () {
                        var len = this.nX * this.nY * this.nZ;
                        this.field = new Float32Array(len);
                        this.distanceField = new Float32Array(len);
                        this.proximityMap = new Int32Array(len);
                        var mv = Number.POSITIVE_INFINITY;
                        for (var j = 0, _b = this.proximityMap.length; j < _b; j++) {
                            this.distanceField[j] = mv;
                            this.proximityMap[j] = -1;
                        }
                    };
                    MolecularIsoFieldComputation.prototype.updateMinIndex = function (x, y, z) {
                        this.minIndex.i = Math.max((Math.floor((x - this.minX) / this.dX)) | 0, 0);
                        this.minIndex.j = Math.max((Math.floor((y - this.minY) / this.dY)) | 0, 0);
                        this.minIndex.k = Math.max((Math.floor((z - this.minZ) / this.dZ)) | 0, 0);
                    };
                    MolecularIsoFieldComputation.prototype.updateMaxIndex = function (x, y, z) {
                        this.maxIndex.i = Math.min((Math.ceil((x - this.minX) / this.dX)) | 0, this.nX);
                        this.maxIndex.j = Math.min((Math.ceil((y - this.minY) / this.dY)) | 0, this.nY);
                        this.maxIndex.k = Math.min((Math.ceil((z - this.minZ) / this.dZ)) | 0, this.nZ);
                    };
                    MolecularIsoFieldComputation.prototype.addBall = function (aI, strength) {
                        var strSq = strength * strength;
                        var cx = this.x[aI], cy = this.y[aI], cz = this.z[aI];
                        this.updateMinIndex(cx - strength, cy - strength, cz - strength);
                        this.updateMaxIndex(cx + strength, cy + strength, cz + strength);
                        var mini = this.minIndex.i, minj = this.minIndex.j, mink = this.minIndex.k;
                        var maxi = this.maxIndex.i, maxj = this.maxIndex.j, maxk = this.maxIndex.k;
                        cx = this.minX - cx;
                        cy = this.minY - cy;
                        cz = this.minZ - cz;
                        for (var k = mink; k < maxk; k++) {
                            var tZ = cz + k * this.dZ, zz = tZ * tZ, oZ = k * this.nY;
                            for (var j = minj; j < maxj; j++) {
                                var tY = cy + j * this.dY, yy = zz + tY * tY, oY = this.nX * (oZ + j);
                                for (var i = mini; i < maxi; i++) {
                                    var tX = cx + i * this.dX, xx = yy + tX * tX, offset = oY + i;
                                    var v = strSq / (0.000001 + xx) - 1;
                                    if (xx < this.distanceField[offset]) {
                                        this.proximityMap[offset] = aI;
                                        this.distanceField[offset] = xx;
                                    }
                                    if (v > 0) {
                                        this.field[offset] += v;
                                    }
                                }
                            }
                        }
                    };
                    MolecularIsoFieldComputation.prototype.processChunks = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var chunkSize, started, currentAtom, _b, aI, r, t;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        chunkSize = 10000;
                                        started = Core.Utils.PerformanceMonitor.currentTime();
                                        return [4 /*yield*/, this.ctx.updateProgress('Creating field...', true)];
                                    case 1:
                                        _a.sent();
                                        currentAtom = 0, _b = this.atomIndices.length;
                                        _a.label = 2;
                                    case 2:
                                        if (!(currentAtom < _b)) return [3 /*break*/, 5];
                                        aI = this.atomIndices[currentAtom];
                                        r = this.vdwScaleFactor * this.parameters.atomRadius(aI) + this.parameters.probeRadius;
                                        if (r >= 0) {
                                            this.addBall(aI, r);
                                        }
                                        if (!((currentAtom + 1) % chunkSize === 0)) return [3 /*break*/, 4];
                                        t = Core.Utils.PerformanceMonitor.currentTime();
                                        if (!(t - started > Core.Computation.UpdateProgressDelta)) return [3 /*break*/, 4];
                                        started = t;
                                        return [4 /*yield*/, this.ctx.updateProgress('Creating field...', true, currentAtom, _b)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        currentAtom++;
                                        return [3 /*break*/, 2];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        });
                    };
                    MolecularIsoFieldComputation.prototype.finish = function () {
                        var t = Geometry.LinearAlgebra.Matrix4.zero();
                        Geometry.LinearAlgebra.Matrix4.fromTranslation(t, [this.minX, this.minY, this.minZ]);
                        t[0] = this.dX;
                        t[5] = this.dY;
                        t[10] = this.dZ;
                        var ret = {
                            data: {
                                scalarField: new Core.Formats.Density.Field3DZYX(this.field, [this.nX, this.nY, this.nZ]),
                                annotationField: this.parameters.interactive ? new Core.Formats.Density.Field3DZYX(this.proximityMap, [this.nX, this.nY, this.nZ]) : void 0,
                                isoLevel: 0.05
                            },
                            bottomLeft: Geometry.LinearAlgebra.Vector3.fromValues(this.minX, this.minY, this.minZ),
                            topRight: Geometry.LinearAlgebra.Vector3.fromValues(this.maxX, this.maxY, this.maxZ),
                            transform: t,
                            inputParameters: this.inputParameters,
                            parameters: this.parameters
                        };
                        // help the gc
                        this.distanceField = null;
                        this.proximityMap = null;
                        return ret;
                    };
                    MolecularIsoFieldComputation.prototype.run = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.ctx.updateProgress('Initializing...')];
                                    case 1:
                                        _a.sent();
                                        this.findBounds();
                                        this.initData();
                                        return [4 /*yield*/, this.processChunks()];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.ctx.updateProgress('Finalizing...', void 0, this.atomIndices.length, this.atomIndices.length)];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, this.finish()];
                                }
                            });
                        });
                    };
                    return MolecularIsoFieldComputation;
                }());
                function createMolecularIsoFieldAsync(parameters) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var field;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    field = new MolecularIsoFieldComputation(parameters, ctx);
                                    return [4 /*yield*/, field.run()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); });
                }
                MolecularSurface.createMolecularIsoFieldAsync = createMolecularIsoFieldAsync;
                function computeMolecularSurfaceAsync(parameters) {
                    var _this = this;
                    return Core.computation(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var field, surface, smoothing, smoothingVertexWeight;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, createMolecularIsoFieldAsync(parameters).run(ctx)];
                                case 1:
                                    field = _a.sent();
                                    return [4 /*yield*/, Geometry.MarchingCubes.compute(field.data).run(ctx)];
                                case 2:
                                    surface = _a.sent();
                                    return [4 /*yield*/, Geometry.Surface.transform(surface, field.transform).run(ctx)];
                                case 3:
                                    surface = _a.sent();
                                    smoothing = (parameters.parameters && parameters.parameters.smoothingIterations) || 1;
                                    smoothingVertexWeight = 1.0;
                                    // low density results in very low detail and large distance between vertices.
                                    // Applying uniform laplacian smmoth to such surfaces makes the surface a lot smaller 
                                    // in each iteration. 
                                    // To reduce this behaviour, the weight of the "central" vertex is increased
                                    // for low desities to better preserve the shape of the surface.
                                    if (parameters.parameters && parameters.parameters.density < 1) {
                                        smoothingVertexWeight = 2 / parameters.parameters.density;
                                    }
                                    return [4 /*yield*/, Geometry.Surface.laplacianSmooth(surface, smoothing, smoothingVertexWeight).run(ctx)];
                                case 4:
                                    surface = _a.sent();
                                    return [2 /*return*/, { surface: surface, usedParameters: field.parameters }];
                            }
                        });
                    }); });
                }
                MolecularSurface.computeMolecularSurfaceAsync = computeMolecularSurfaceAsync;
            })(MolecularSurface = Geometry.MolecularSurface || (Geometry.MolecularSurface = {}));
        })(Geometry = Core.Geometry || (Core.Geometry = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            "use strict";
            var DataTable = Core.Utils.DataTable;
            var ComponentBondInfoEntry = /** @class */ (function () {
                function ComponentBondInfoEntry(id) {
                    this.id = id;
                    this.map = Core.Utils.FastMap.create();
                }
                ComponentBondInfoEntry.prototype.add = function (a, b, order, swap) {
                    if (swap === void 0) { swap = true; }
                    var e = this.map.get(a);
                    if (e !== void 0) {
                        var f = e.get(b);
                        if (f === void 0) {
                            e.set(b, order);
                        }
                    }
                    else {
                        var map = Core.Utils.FastMap.create();
                        map.set(b, order);
                        this.map.set(a, map);
                    }
                    if (swap)
                        this.add(b, a, order, false);
                };
                return ComponentBondInfoEntry;
            }());
            Structure.ComponentBondInfoEntry = ComponentBondInfoEntry;
            var ComponentBondInfo = /** @class */ (function () {
                function ComponentBondInfo() {
                    this.entries = Core.Utils.FastMap.create();
                }
                ComponentBondInfo.prototype.newEntry = function (id) {
                    var e = new ComponentBondInfoEntry(id);
                    this.entries.set(id, e);
                    return e;
                };
                return ComponentBondInfo;
            }());
            Structure.ComponentBondInfo = ComponentBondInfo;
            /**
             * Identifier for a reside that is a part of the polymer.
             */
            var PolyResidueIdentifier = /** @class */ (function () {
                function PolyResidueIdentifier(asymId, seqNumber, insCode) {
                    this.asymId = asymId;
                    this.seqNumber = seqNumber;
                    this.insCode = insCode;
                }
                PolyResidueIdentifier.areEqual = function (a, index, bAsymId, bSeqNumber, bInsCode) {
                    return a.asymId === bAsymId[index]
                        && a.seqNumber === bSeqNumber[index]
                        && a.insCode === bInsCode[index];
                };
                PolyResidueIdentifier.compare = function (a, b) {
                    if (a.asymId === b.asymId) {
                        if (a.seqNumber === b.seqNumber) {
                            if (a.insCode === b.insCode)
                                return 0;
                            if (a.insCode === void 0)
                                return -1;
                            if (b.insCode === void 0)
                                return 1;
                            return a.insCode < b.insCode ? -1 : 1;
                        }
                        return a.seqNumber < b.seqNumber ? -1 : 1;
                    }
                    return a.asymId < b.asymId ? -1 : 1;
                };
                PolyResidueIdentifier.compareResidue = function (a, index, bAsymId, bSeqNumber, bInsCode) {
                    if (a.asymId === bAsymId[index]) {
                        if (a.seqNumber === bSeqNumber[index]) {
                            if (a.insCode === bInsCode[index])
                                return 0;
                            if (a.insCode === void 0)
                                return -1;
                            if (bInsCode[index] === void 0)
                                return 1;
                            return a.insCode < bInsCode[index] ? -1 : 1;
                        }
                        return a.seqNumber < bSeqNumber[index] ? -1 : 1;
                    }
                    return a.asymId < bAsymId[index] ? -1 : 1;
                };
                return PolyResidueIdentifier;
            }());
            Structure.PolyResidueIdentifier = PolyResidueIdentifier;
            var SecondaryStructureElement = /** @class */ (function () {
                function SecondaryStructureElement(type, startResidueId, endResidueId, info) {
                    if (info === void 0) { info = {}; }
                    this.type = type;
                    this.startResidueId = startResidueId;
                    this.endResidueId = endResidueId;
                    this.info = info;
                    this.startResidueIndex = -1;
                    this.endResidueIndex = -1;
                }
                Object.defineProperty(SecondaryStructureElement.prototype, "length", {
                    get: function () {
                        return this.endResidueIndex - this.startResidueIndex;
                    },
                    enumerable: true,
                    configurable: true
                });
                return SecondaryStructureElement;
            }());
            Structure.SecondaryStructureElement = SecondaryStructureElement;
            var SymmetryInfo = /** @class */ (function () {
                function SymmetryInfo(spacegroupName, cellSize, cellAngles, toFracTransform, isNonStandardCrytalFrame) {
                    this.spacegroupName = spacegroupName;
                    this.cellSize = cellSize;
                    this.cellAngles = cellAngles;
                    this.toFracTransform = toFracTransform;
                    this.isNonStandardCrytalFrame = isNonStandardCrytalFrame;
                }
                return SymmetryInfo;
            }());
            Structure.SymmetryInfo = SymmetryInfo;
            /**
             * Wraps _struct_conn mmCIF category.
             */
            var StructConn = /** @class */ (function () {
                function StructConn(entries) {
                    this.entries = entries;
                    this._residuePairIndex = void 0;
                    this._atomIndex = void 0;
                }
                StructConn._resKey = function (rA, rB) {
                    if (rA < rB)
                        return rA + "-" + rB;
                    return rB + "-" + rA;
                };
                StructConn.prototype.getResiduePairIndex = function () {
                    if (this._residuePairIndex)
                        return this._residuePairIndex;
                    this._residuePairIndex = Core.Utils.FastMap.create();
                    for (var _i = 0, _a = this.entries; _i < _a.length; _i++) {
                        var e = _a[_i];
                        var ps = e.partners;
                        var l = ps.length;
                        for (var i = 0; i < l - 1; i++) {
                            for (var j = i + i; j < l; j++) {
                                var key = StructConn._resKey(ps[i].residueIndex, ps[j].residueIndex);
                                if (this._residuePairIndex.has(key)) {
                                    this._residuePairIndex.get(key).push(e);
                                }
                                else {
                                    this._residuePairIndex.set(key, [e]);
                                }
                            }
                        }
                    }
                    return this._residuePairIndex;
                };
                StructConn.prototype.getAtomIndex = function () {
                    if (this._atomIndex)
                        return this._atomIndex;
                    this._atomIndex = Core.Utils.FastMap.create();
                    for (var _i = 0, _a = this.entries; _i < _a.length; _i++) {
                        var e = _a[_i];
                        for (var _c = 0, _d = e.partners; _c < _d.length; _c++) {
                            var p = _d[_c];
                            var key = p.atomIndex;
                            if (this._atomIndex.has(key)) {
                                this._atomIndex.get(key).push(e);
                            }
                            else {
                                this._atomIndex.set(key, [e]);
                            }
                        }
                    }
                    return this._atomIndex;
                };
                StructConn.prototype.getResidueEntries = function (residueAIndex, residueBIndex) {
                    return this.getResiduePairIndex().get(StructConn._resKey(residueAIndex, residueBIndex)) || StructConn._emptyEntry;
                };
                StructConn.prototype.getAtomEntries = function (atomIndex) {
                    return this.getAtomIndex().get(atomIndex) || StructConn._emptyEntry;
                };
                StructConn._emptyEntry = [];
                return StructConn;
            }());
            Structure.StructConn = StructConn;
            /**
             * Wraps an assembly operator.
             */
            var AssemblyOperator = /** @class */ (function () {
                function AssemblyOperator(id, name, operator) {
                    this.id = id;
                    this.name = name;
                    this.operator = operator;
                }
                return AssemblyOperator;
            }());
            Structure.AssemblyOperator = AssemblyOperator;
            /**
             * Wraps a single assembly gen entry.
             */
            var AssemblyGenEntry = /** @class */ (function () {
                function AssemblyGenEntry(operators, asymIds) {
                    this.operators = operators;
                    this.asymIds = asymIds;
                }
                return AssemblyGenEntry;
            }());
            Structure.AssemblyGenEntry = AssemblyGenEntry;
            /**
             * Wraps an assembly generation template.
             */
            var AssemblyGen = /** @class */ (function () {
                function AssemblyGen(name) {
                    this.name = name;
                    this.gens = [];
                }
                return AssemblyGen;
            }());
            Structure.AssemblyGen = AssemblyGen;
            /**
             * Information about the assemblies.
             */
            var AssemblyInfo = /** @class */ (function () {
                function AssemblyInfo(operators, assemblies) {
                    this.operators = operators;
                    this.assemblies = assemblies;
                }
                return AssemblyInfo;
            }());
            Structure.AssemblyInfo = AssemblyInfo;
            /**
             * Default Builders
             */
            var Tables;
            (function (Tables) {
                var int32 = DataTable.typedColumn(Int32Array);
                var float32 = DataTable.typedColumn(Float32Array);
                var str = DataTable.stringColumn;
                var nullStr = DataTable.stringNullColumn;
                Tables.Positions = {
                    x: float32,
                    y: float32,
                    z: float32
                };
                Tables.Atoms = {
                    id: int32,
                    altLoc: str,
                    residueIndex: int32,
                    chainIndex: int32,
                    entityIndex: int32,
                    name: str,
                    elementSymbol: str,
                    occupancy: float32,
                    tempFactor: float32,
                    authName: str,
                    rowIndex: int32
                };
                Tables.Residues = {
                    name: str,
                    seqNumber: int32,
                    asymId: str,
                    authName: str,
                    authSeqNumber: int32,
                    authAsymId: str,
                    insCode: nullStr,
                    entityId: str,
                    isHet: DataTable.typedColumn(Int8Array),
                    atomStartIndex: int32,
                    atomEndIndex: int32,
                    chainIndex: int32,
                    entityIndex: int32,
                    secondaryStructureIndex: int32
                };
                Tables.Chains = {
                    asymId: str,
                    entityId: str,
                    authAsymId: str,
                    atomStartIndex: int32,
                    atomEndIndex: int32,
                    residueStartIndex: int32,
                    residueEndIndex: int32,
                    entityIndex: int32,
                    sourceChainIndex: void 0,
                    operatorIndex: void 0
                };
                Tables.Entities = {
                    entityId: str,
                    type: DataTable.customColumn(),
                    atomStartIndex: int32,
                    atomEndIndex: int32,
                    residueStartIndex: int32,
                    residueEndIndex: int32,
                    chainStartIndex: int32,
                    chainEndIndex: int32
                };
                Tables.Bonds = {
                    atomAIndex: int32,
                    atomBIndex: int32,
                    type: DataTable.typedColumn(Int8Array)
                };
                Tables.ModifiedResidues = {
                    asymId: str,
                    seqNumber: int32,
                    insCode: nullStr,
                    parent: str,
                    details: nullStr
                };
            })(Tables = Structure.Tables || (Structure.Tables = {}));
            var Operator = /** @class */ (function () {
                function Operator(matrix, id, isIdentity) {
                    this.matrix = matrix;
                    this.id = id;
                    this.isIdentity = isIdentity;
                }
                Operator.prototype.apply = function (v) {
                    Core.Geometry.LinearAlgebra.Vector3.transformMat4(v, v, this.matrix);
                };
                Operator.applyToModelUnsafe = function (matrix, m) {
                    var v = Core.Geometry.LinearAlgebra.Vector3.zero();
                    var _a = m.positions, x = _a.x, y = _a.y, z = _a.z;
                    for (var i = 0, _b = m.positions.count; i < _b; i++) {
                        v[0] = x[i];
                        v[1] = y[i];
                        v[2] = z[i];
                        Core.Geometry.LinearAlgebra.Vector3.transformMat4(v, v, matrix);
                        x[i] = v[0];
                        y[i] = v[1];
                        z[i] = v[2];
                    }
                };
                return Operator;
            }());
            Structure.Operator = Operator;
            var Molecule;
            (function (Molecule) {
                function create(id, models, properties) {
                    if (properties === void 0) { properties = {}; }
                    return { id: id, models: models, properties: properties };
                }
                Molecule.create = create;
                var Model;
                (function (Model) {
                    function create(model) {
                        var ret = Core.Utils.extend({}, model);
                        var queryContext = void 0;
                        Object.defineProperty(ret, 'queryContext', { enumerable: true, configurable: false, get: function () {
                                if (queryContext)
                                    return queryContext;
                                queryContext = Structure.Query.Context.ofStructure(ret);
                                return queryContext;
                            } });
                        return ret;
                    }
                    Model.create = create;
                    var Source;
                    (function (Source) {
                        Source[Source["File"] = 0] = "File";
                        Source[Source["Computed"] = 1] = "Computed";
                    })(Source = Model.Source || (Model.Source = {}));
                    function withTransformedXYZ(model, ctx, transform) {
                        var _a = model.positions, x = _a.x, y = _a.y, z = _a.z;
                        var tAtoms = model.positions.getBuilder(model.positions.count).seal();
                        var tX = tAtoms.x, tY = tAtoms.y, tZ = tAtoms.z;
                        var t = Core.Geometry.LinearAlgebra.Vector3.zero();
                        for (var i = 0, _l = model.positions.count; i < _l; i++) {
                            transform(ctx, x[i], y[i], z[i], t);
                            tX[i] = t[0];
                            tY[i] = t[1];
                            tZ[i] = t[2];
                        }
                        return create({
                            id: model.id,
                            modelId: model.modelId,
                            data: model.data,
                            positions: tAtoms,
                            parent: model.parent,
                            source: model.source,
                            operators: model.operators
                        });
                    }
                    Model.withTransformedXYZ = withTransformedXYZ;
                })(Model = Molecule.Model || (Molecule.Model = {}));
            })(Molecule = Structure.Molecule || (Structure.Molecule = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            'use strict';
            function isBondTypeCovalent(t) {
                return t >= 0 /* Unknown */ && t <= 5 /* DisulfideBridge */;
            }
            Structure.isBondTypeCovalent = isBondTypeCovalent;
            // H,D,T are all mapped to H
            var __ElementIndex = { 'H': 0, 'h': 0, 'D': 0, 'd': 0, 'T': 0, 't': 0, 'He': 2, 'HE': 2, 'he': 2, 'Li': 3, 'LI': 3, 'li': 3, 'Be': 4, 'BE': 4, 'be': 4, 'B': 5, 'b': 5, 'C': 6, 'c': 6, 'N': 7, 'n': 7, 'O': 8, 'o': 8, 'F': 9, 'f': 9, 'Ne': 10, 'NE': 10, 'ne': 10, 'Na': 11, 'NA': 11, 'na': 11, 'Mg': 12, 'MG': 12, 'mg': 12, 'Al': 13, 'AL': 13, 'al': 13, 'Si': 14, 'SI': 14, 'si': 14, 'P': 15, 'p': 15, 'S': 16, 's': 16, 'Cl': 17, 'CL': 17, 'cl': 17, 'Ar': 18, 'AR': 18, 'ar': 18, 'K': 19, 'k': 19, 'Ca': 20, 'CA': 20, 'ca': 20, 'Sc': 21, 'SC': 21, 'sc': 21, 'Ti': 22, 'TI': 22, 'ti': 22, 'V': 23, 'v': 23, 'Cr': 24, 'CR': 24, 'cr': 24, 'Mn': 25, 'MN': 25, 'mn': 25, 'Fe': 26, 'FE': 26, 'fe': 26, 'Co': 27, 'CO': 27, 'co': 27, 'Ni': 28, 'NI': 28, 'ni': 28, 'Cu': 29, 'CU': 29, 'cu': 29, 'Zn': 30, 'ZN': 30, 'zn': 30, 'Ga': 31, 'GA': 31, 'ga': 31, 'Ge': 32, 'GE': 32, 'ge': 32, 'As': 33, 'AS': 33, 'as': 33, 'Se': 34, 'SE': 34, 'se': 34, 'Br': 35, 'BR': 35, 'br': 35, 'Kr': 36, 'KR': 36, 'kr': 36, 'Rb': 37, 'RB': 37, 'rb': 37, 'Sr': 38, 'SR': 38, 'sr': 38, 'Y': 39, 'y': 39, 'Zr': 40, 'ZR': 40, 'zr': 40, 'Nb': 41, 'NB': 41, 'nb': 41, 'Mo': 42, 'MO': 42, 'mo': 42, 'Tc': 43, 'TC': 43, 'tc': 43, 'Ru': 44, 'RU': 44, 'ru': 44, 'Rh': 45, 'RH': 45, 'rh': 45, 'Pd': 46, 'PD': 46, 'pd': 46, 'Ag': 47, 'AG': 47, 'ag': 47, 'Cd': 48, 'CD': 48, 'cd': 48, 'In': 49, 'IN': 49, 'in': 49, 'Sn': 50, 'SN': 50, 'sn': 50, 'Sb': 51, 'SB': 51, 'sb': 51, 'Te': 52, 'TE': 52, 'te': 52, 'I': 53, 'i': 53, 'Xe': 54, 'XE': 54, 'xe': 54, 'Cs': 55, 'CS': 55, 'cs': 55, 'Ba': 56, 'BA': 56, 'ba': 56, 'La': 57, 'LA': 57, 'la': 57, 'Ce': 58, 'CE': 58, 'ce': 58, 'Pr': 59, 'PR': 59, 'pr': 59, 'Nd': 60, 'ND': 60, 'nd': 60, 'Pm': 61, 'PM': 61, 'pm': 61, 'Sm': 62, 'SM': 62, 'sm': 62, 'Eu': 63, 'EU': 63, 'eu': 63, 'Gd': 64, 'GD': 64, 'gd': 64, 'Tb': 65, 'TB': 65, 'tb': 65, 'Dy': 66, 'DY': 66, 'dy': 66, 'Ho': 67, 'HO': 67, 'ho': 67, 'Er': 68, 'ER': 68, 'er': 68, 'Tm': 69, 'TM': 69, 'tm': 69, 'Yb': 70, 'YB': 70, 'yb': 70, 'Lu': 71, 'LU': 71, 'lu': 71, 'Hf': 72, 'HF': 72, 'hf': 72, 'Ta': 73, 'TA': 73, 'ta': 73, 'W': 74, 'w': 74, 'Re': 75, 'RE': 75, 're': 75, 'Os': 76, 'OS': 76, 'os': 76, 'Ir': 77, 'IR': 77, 'ir': 77, 'Pt': 78, 'PT': 78, 'pt': 78, 'Au': 79, 'AU': 79, 'au': 79, 'Hg': 80, 'HG': 80, 'hg': 80, 'Tl': 81, 'TL': 81, 'tl': 81, 'Pb': 82, 'PB': 82, 'pb': 82, 'Bi': 83, 'BI': 83, 'bi': 83, 'Po': 84, 'PO': 84, 'po': 84, 'At': 85, 'AT': 85, 'at': 85, 'Rn': 86, 'RN': 86, 'rn': 86, 'Fr': 87, 'FR': 87, 'fr': 87, 'Ra': 88, 'RA': 88, 'ra': 88, 'Ac': 89, 'AC': 89, 'ac': 89, 'Th': 90, 'TH': 90, 'th': 90, 'Pa': 91, 'PA': 91, 'pa': 91, 'U': 92, 'u': 92, 'Np': 93, 'NP': 93, 'np': 93, 'Pu': 94, 'PU': 94, 'pu': 94, 'Am': 95, 'AM': 95, 'am': 95, 'Cm': 96, 'CM': 96, 'cm': 96, 'Bk': 97, 'BK': 97, 'bk': 97, 'Cf': 98, 'CF': 98, 'cf': 98, 'Es': 99, 'ES': 99, 'es': 99, 'Fm': 100, 'FM': 100, 'fm': 100, 'Md': 101, 'MD': 101, 'md': 101, 'No': 102, 'NO': 102, 'no': 102, 'Lr': 103, 'LR': 103, 'lr': 103, 'Rf': 104, 'RF': 104, 'rf': 104, 'Db': 105, 'DB': 105, 'db': 105, 'Sg': 106, 'SG': 106, 'sg': 106, 'Bh': 107, 'BH': 107, 'bh': 107, 'Hs': 108, 'HS': 108, 'hs': 108, 'Mt': 109, 'MT': 109, 'mt': 109 };
            var __ElementBondThresholds = { 0: 1.42, 1: 1.42, 3: 2.7, 4: 2.7, 6: 1.75, 7: 1.6, 8: 1.52, 11: 2.7, 12: 2.7, 13: 2.7, 14: 1.9, 15: 1.9, 16: 1.9, 17: 1.8, 19: 2.7, 20: 2.7, 21: 2.7, 22: 2.7, 23: 2.7, 24: 2.7, 25: 2.7, 26: 2.7, 27: 2.7, 28: 2.7, 29: 2.7, 30: 2.7, 31: 2.7, 33: 2.68, 37: 2.7, 38: 2.7, 39: 2.7, 40: 2.7, 41: 2.7, 42: 2.7, 43: 2.7, 44: 2.7, 45: 2.7, 46: 2.7, 47: 2.7, 48: 2.7, 49: 2.7, 50: 2.7, 55: 2.7, 56: 2.7, 57: 2.7, 58: 2.7, 59: 2.7, 60: 2.7, 61: 2.7, 62: 2.7, 63: 2.7, 64: 2.7, 65: 2.7, 66: 2.7, 67: 2.7, 68: 2.7, 69: 2.7, 70: 2.7, 71: 2.7, 72: 2.7, 73: 2.7, 74: 2.7, 75: 2.7, 76: 2.7, 77: 2.7, 78: 2.7, 79: 2.7, 80: 2.7, 81: 2.7, 82: 2.7, 83: 2.7, 87: 2.7, 88: 2.7, 89: 2.7, 90: 2.7, 91: 2.7, 92: 2.7, 93: 2.7, 94: 2.7, 95: 2.7, 96: 2.7, 97: 2.7, 98: 2.7, 99: 2.7, 100: 2.7, 101: 2.7, 102: 2.7, 103: 2.7, 104: 2.7, 105: 2.7, 106: 2.7, 107: 2.7, 108: 2.7, 109: 2.88 };
            var __ElementPairThresholds = { 0: 0.8, 20: 1.31, 27: 1.3, 35: 1.3, 44: 1.05, 54: 1, 60: 1.84, 72: 1.88, 84: 1.75, 85: 1.56, 86: 1.76, 98: 1.6, 99: 1.68, 100: 1.63, 112: 1.55, 113: 1.59, 114: 1.36, 129: 1.45, 144: 1.6, 170: 1.4, 180: 1.55, 202: 2.4, 222: 2.24, 224: 1.91, 225: 1.98, 243: 2.02, 269: 2, 293: 1.9, 480: 2.3, 512: 2.3, 544: 2.3, 612: 2.1, 629: 1.54, 665: 1, 813: 2.6, 854: 2.27, 894: 1.93, 896: 2.1, 937: 2.05, 938: 2.06, 981: 1.62, 1258: 2.68, 1309: 2.33, 1484: 1, 1763: 2.14, 1823: 2.48, 1882: 2.1, 1944: 1.72, 2380: 2.34, 3367: 2.44, 3733: 2.11, 3819: 2.6, 3821: 2.36, 4736: 2.75, 5724: 2.73, 5959: 2.63, 6519: 2.84, 6750: 2.87, 8991: 2.81 };
            var DefaultBondingRadius = 2.001;
            var MetalsSet = (function () {
                var metals = ['LI', 'NA', 'K', 'RB', 'CS', 'FR', 'BE', 'MG', 'CA', 'SR', 'BA', 'RA', 'AL', 'GA', 'IN', 'SN', 'TL', 'PB', 'BI', 'SC', 'TI', 'V', 'CR', 'MN', 'FE', 'CO', 'NI', 'CU', 'ZN', 'Y', 'ZR', 'NB', 'MO', 'TC', 'RU', 'RH', 'PD', 'AG', 'CD', 'LA', 'HF', 'TA', 'W', 'RE', 'OS', 'IR', 'PT', 'AU', 'HG', 'AC', 'RF', 'DB', 'SG', 'BH', 'HS', 'MT', 'CE', 'PR', 'ND', 'PM', 'SM', 'EU', 'GD', 'TB', 'DY', 'HO', 'ER', 'TM', 'YB', 'LU', 'TH', 'PA', 'U', 'NP', 'PU', 'AM', 'CM', 'BK', 'CF', 'ES', 'FM', 'MD', 'NO', 'LR'];
                var set = Core.Utils.FastSet.create();
                for (var _i = 0, metals_1 = metals; _i < metals_1.length; _i++) {
                    var m = metals_1[_i];
                    set.add(__ElementIndex[m]);
                }
                return set;
            })();
            function pair(a, b) {
                if (a < b)
                    return (a + b) * (a + b + 1) / 2 + b;
                else
                    return (a + b) * (a + b + 1) / 2 + a;
            }
            function idx(e) {
                var i = __ElementIndex[e];
                if (i === void 0)
                    return -1;
                return i;
            }
            function pairThreshold(i, j) {
                if (i < 0 || j < 0)
                    return -1;
                var r = __ElementPairThresholds[pair(i, j)];
                if (r === void 0)
                    return -1;
                return r;
            }
            function threshold(i) {
                if (i < 0)
                    return DefaultBondingRadius;
                var r = __ElementBondThresholds[i];
                if (r === void 0)
                    return DefaultBondingRadius;
                return r;
            }
            var H_ID = __ElementIndex['H'];
            function isHydrogen(i) {
                return i === H_ID;
            }
            function isMetal(e) {
                var i = __ElementIndex[e];
                if (i === void 0)
                    return false;
                return MetalsSet.has(i);
            }
            function bondsFromInput(model, atomIndices) {
                var bonds = model.data.bonds.input;
                if (atomIndices.length === model.data.atoms.count)
                    return bonds;
                var mask = Core.Utils.Mask.ofIndices(model.data.atoms.count, atomIndices);
                var a = bonds.atomAIndex, b = bonds.atomBIndex, t = bonds.type;
                var count = 0;
                for (var i = 0, __i = bonds.count; i < __i; i++) {
                    if (!mask.has(a[i]) || !mask.has(b[i]))
                        continue;
                    count++;
                }
                var ret = Core.Utils.DataTable.ofDefinition(Structure.Tables.Bonds, count);
                var atomAIndex = ret.atomAIndex, atomBIndex = ret.atomBIndex, type = ret.type;
                var elementSymbol = model.data.atoms.elementSymbol;
                var offset = 0;
                for (var i = 0, __i = bonds.count; i < __i; i++) {
                    var u = a[i], v = b[i];
                    if (!mask.has(u) || !mask.has(v))
                        continue;
                    atomAIndex[offset] = u;
                    atomBIndex[offset] = v;
                    var metal = isMetal(elementSymbol[u]) || isMetal(elementSymbol[v]);
                    type[offset] = metal ? 6 /* Metallic */ : t[i];
                    offset++;
                }
                return ret;
            }
            var ChunkedAdd = Core.Utils.ChunkedArray.add;
            function addComponentBonds(_a, rI) {
                var model = _a.model, mask = _a.mask, atomA = _a.atomA, atomB = _a.atomB, type = _a.type;
                var _b = model.data.residues, atomStartIndex = _b.atomStartIndex, atomEndIndex = _b.atomEndIndex, residueName = _b.name;
                var _c = model.data.atoms, atomName = _c.name, altLoc = _c.altLoc, elementSymbol = _c.elementSymbol;
                var map = model.data.bonds.component.entries.get(residueName[rI]).map;
                var start = atomStartIndex[rI], end = atomEndIndex[rI];
                for (var i = start; i < end - 1; i++) {
                    if (!mask.has(i))
                        continue;
                    var pairs = map.get(atomName[i]);
                    if (!pairs)
                        continue;
                    var altA = altLoc[i];
                    var isMetalA = isMetal(elementSymbol[i]);
                    for (var j = i + 1; j < end; j++) {
                        if (!mask.has(j))
                            continue;
                        var altB = altLoc[j];
                        if (altA && altB && altA !== altB)
                            continue;
                        var order = pairs.get(atomName[j]);
                        if (order === void 0)
                            continue;
                        var metal = isMetalA || isMetal(elementSymbol[j]);
                        ChunkedAdd(atomA, i);
                        ChunkedAdd(atomB, j);
                        ChunkedAdd(type, metal ? 6 /* Metallic */ : order);
                    }
                }
            }
            function _computeBonds(model, atomIndices, params) {
                var MAX_RADIUS = 3;
                var _a = model.data.bonds, structConn = _a.structConn, component = _a.component;
                var _b = model.positions, x = _b.x, y = _b.y, z = _b.z;
                var _c = model.data.atoms, elementSymbol = _c.elementSymbol, residueIndex = _c.residueIndex, altLoc = _c.altLoc;
                var residueName = model.data.residues.name;
                var query3d = model.queryContext.lookup3d();
                var atomA = Core.Utils.ChunkedArray.create(function (size) { return new Int32Array(size); }, (atomIndices.length * 1.33) | 0, 1);
                var atomB = Core.Utils.ChunkedArray.create(function (size) { return new Int32Array(size); }, (atomIndices.length * 1.33) | 0, 1);
                var type = Core.Utils.ChunkedArray.create(function (size) { return new Uint8Array(size); }, (atomIndices.length * 1.33) | 0, 1);
                var mask = Core.Utils.Mask.ofIndices(model.data.atoms.count, atomIndices);
                var state = { model: model, mask: mask, atomA: atomA, atomB: atomB, type: type };
                var lastResidue = -1;
                var hasComponent = false;
                for (var _i = 0, atomIndices_1 = atomIndices; _i < atomIndices_1.length; _i++) {
                    var aI = atomIndices_1[_i];
                    var raI = residueIndex[aI];
                    if (!params.forceCompute && raI !== lastResidue) {
                        hasComponent = !!component && component.entries.has(residueName[raI]);
                        if (hasComponent) {
                            addComponentBonds(state, raI);
                        }
                    }
                    lastResidue = raI;
                    var aeI = idx(elementSymbol[aI]);
                    var _d = query3d(x[aI], y[aI], z[aI], MAX_RADIUS), elements = _d.elements, count = _d.count, squaredDistances = _d.squaredDistances;
                    var isHa = isHydrogen(aeI);
                    var thresholdA = threshold(aeI);
                    var altA = altLoc[aI];
                    var metalA = MetalsSet.has(aeI);
                    var structConnEntries = params.forceCompute ? void 0 : structConn && structConn.getAtomEntries(aI);
                    for (var ni = 0; ni < count; ni++) {
                        var bI = elements[ni];
                        if (bI <= aI || !mask.has(bI))
                            continue;
                        var altB = altLoc[bI];
                        if (altA && altB && altA !== altB)
                            continue;
                        var rbI = residueIndex[bI];
                        if (raI === rbI && hasComponent)
                            continue;
                        var beI = idx(elementSymbol[bI]);
                        var isHb = isHydrogen(beI);
                        if (isHa && isHb)
                            continue;
                        var dist = Math.sqrt(squaredDistances[ni]);
                        if (dist === 0)
                            continue;
                        if (structConnEntries) {
                            var added = false;
                            for (var _e = 0, structConnEntries_1 = structConnEntries; _e < structConnEntries_1.length; _e++) {
                                var se = structConnEntries_1[_e];
                                for (var _f = 0, _g = se.partners; _f < _g.length; _f++) {
                                    var p = _g[_f];
                                    if (p.atomIndex === bI) {
                                        ChunkedAdd(atomA, aI);
                                        ChunkedAdd(atomB, bI);
                                        ChunkedAdd(type, se.bondType);
                                        added = true;
                                        break;
                                    }
                                }
                                if (added)
                                    break;
                            }
                            if (added)
                                continue;
                        }
                        if (isHa || isHb) {
                            if (dist < params.maxHbondLength) {
                                ChunkedAdd(atomA, aI);
                                ChunkedAdd(atomB, bI);
                                ChunkedAdd(type, 1 /* Single */);
                            }
                            continue;
                        }
                        var thresholdAB = pairThreshold(aeI, beI);
                        var pairingThreshold = thresholdAB > 0
                            ? thresholdAB
                            : beI < 0 ? thresholdA : Math.max(thresholdA, threshold(beI));
                        var metalB = MetalsSet.has(beI);
                        if (dist <= pairingThreshold) {
                            ChunkedAdd(atomA, aI);
                            ChunkedAdd(atomB, bI);
                            ChunkedAdd(type, metalA || metalB ? 6 /* Metallic */ : 1 /* Single */);
                        }
                    }
                }
                var ret = Core.Utils.DataTable.builder(atomA.elementCount);
                ret.addRawColumn('atomAIndex', function (s) { return new Int32Array(s); }, Core.Utils.ChunkedArray.compact(atomA));
                ret.addRawColumn('atomBIndex', function (s) { return new Int32Array(s); }, Core.Utils.ChunkedArray.compact(atomB));
                ret.addRawColumn('type', function (s) { return new Uint8Array(s); }, Core.Utils.ChunkedArray.compact(type));
                var dataTable = ret.seal();
                return dataTable;
            }
            function computeBonds(model, atomIndices, params) {
                if (model.data.bonds.input)
                    return bondsFromInput(model, atomIndices);
                return _computeBonds(model, atomIndices, {
                    maxHbondLength: (params && params.maxHbondLength) || 1.15,
                    forceCompute: !!(params && params.forceCompute),
                });
            }
            Structure.computeBonds = computeBonds;
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            "use strict";
            var Mat4 = Core.Geometry.LinearAlgebra.Matrix4;
            var Vec4 = Core.Geometry.LinearAlgebra.Vector4;
            var Spacegroup = /** @class */ (function () {
                function Spacegroup(info) {
                    this.info = info;
                    this.temp = Mat4.zero();
                    this.tempV = new Float64Array(4);
                    if (SpacegroupTables.Spacegroup[info.spacegroupName] === void 0) {
                        throw "'" + info.spacegroupName + "' is not a spacegroup recognized by the library.";
                    }
                    this.space = this.getSpace();
                    this.operators = this.getOperators();
                }
                Object.defineProperty(Spacegroup.prototype, "operatorCount", {
                    get: function () {
                        return this.operators.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                Spacegroup.prototype.getOperatorMatrix = function (index, i, j, k, target) {
                    this.tempV[0] = i;
                    this.tempV[1] = j;
                    this.tempV[2] = k;
                    Mat4.fromTranslation(this.temp, this.tempV);
                    Mat4.mul(target, Mat4.mul(target, Mat4.mul(target, this.space.fromFrac, this.temp), this.operators[index]), this.space.toFrac);
                    return target;
                };
                Spacegroup.prototype.getSpace = function () {
                    var toFrac = this.info.toFracTransform, fromFrac = Mat4.zero();
                    Mat4.invert(fromFrac, toFrac);
                    return {
                        toFrac: toFrac,
                        fromFrac: fromFrac,
                        baseX: Vec4.transform(Vec4.zero(), Vec4.fromValues(1, 0, 0, 1), toFrac),
                        baseY: Vec4.transform(Vec4.zero(), Vec4.fromValues(0, 1, 0, 1), toFrac),
                        baseZ: Vec4.transform(Vec4.zero(), Vec4.fromValues(0, 0, 1, 1), toFrac)
                    };
                };
                Spacegroup.getOperator = function (ids) {
                    var r1 = SpacegroupTables.Transform[ids[0]], r2 = SpacegroupTables.Transform[ids[1]], r3 = SpacegroupTables.Transform[ids[2]];
                    return Mat4.ofRows([r1, r2, r3, [0, 0, 0, 1]]);
                };
                Spacegroup.prototype.getOperators = function () {
                    var group = SpacegroupTables.Group[SpacegroupTables.Spacegroup[this.info.spacegroupName]];
                    return group.map(function (i) { return Spacegroup.getOperator(SpacegroupTables.Operator[i]); });
                };
                return Spacegroup;
            }());
            Structure.Spacegroup = Spacegroup;
            var SpacegroupTables;
            (function (SpacegroupTables) {
                SpacegroupTables.Transform = [
                    [1.0, 0.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0, 0.0],
                    [0.0, 0.0, 1.0, 0.0],
                    [-1.0, 0.0, 0.0, 0.0],
                    [0.0, -1.0, 0.0, 0.0],
                    [0.0, 0.0, -1.0, 0.0],
                    [0.0, 1.0, 0.0, 0.5],
                    [1.0, 0.0, 0.0, 0.5],
                    [-1.0, 0.0, 0.0, 0.5],
                    [0.0, 0.0, 1.0, 0.5],
                    [0.0, -1.0, 0.0, 0.5],
                    [0.0, 0.0, -1.0, 0.5],
                    [1.0, 0.0, 0.0, 0.25],
                    [0.0, -1.0, 0.0, 0.25],
                    [0.0, 0.0, 1.0, 0.25],
                    [-1.0, 0.0, 0.0, 0.25],
                    [0.0, 1.0, 0.0, 0.25],
                    [0.0, -1.0, 0.0, 0.75],
                    [0.0, 0.0, 1.0, 0.75],
                    [0.0, 1.0, 0.0, 0.75],
                    [1.0, 0.0, 0.0, 0.75],
                    [-1.0, 0.0, 0.0, 0.75],
                    [0.0, 0.0, -1.0, 0.25],
                    [0.0, 0.0, -1.0, 0.75],
                    [1.0, -1.0, 0.0, 0.0],
                    [-1.0, 1.0, 0.0, 0.0],
                    [0.0, 0.0, 1.0, 0.333333333333333],
                    [0.0, 0.0, 1.0, 0.666666666666667],
                    [1.0, 0.0, 0.0, 0.666666666666667],
                    [0.0, 1.0, 0.0, 0.333333333333333],
                    [0.0, -1.0, 0.0, 0.666666666666667],
                    [1.0, -1.0, 0.0, 0.333333333333333],
                    [-1.0, 1.0, 0.0, 0.666666666666667],
                    [-1.0, 0.0, 0.0, 0.333333333333333],
                    [1.0, 0.0, 0.0, 0.333333333333333],
                    [0.0, 1.0, 0.0, 0.666666666666667],
                    [0.0, -1.0, 0.0, 0.333333333333333],
                    [1.0, -1.0, 0.0, 0.666666666666667],
                    [-1.0, 1.0, 0.0, 0.333333333333333],
                    [-1.0, 0.0, 0.0, 0.666666666666667],
                    [0.0, 0.0, -1.0, 0.333333333333333],
                    [0.0, 0.0, -1.0, 0.666666666666667],
                    [0.0, 0.0, 1.0, 0.833333333333333],
                    [0.0, 0.0, 1.0, 0.166666666666667],
                    [0.0, 0.0, -1.0, 0.833333333333333],
                    [0.0, 0.0, -1.0, 0.166666666666667],
                ];
                SpacegroupTables.Operator = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [3, 1, 5],
                    [3, 6, 5],
                    [7, 6, 2],
                    [8, 6, 5],
                    [0, 4, 2],
                    [0, 4, 9],
                    [7, 10, 2],
                    [7, 10, 9],
                    [0, 10, 2],
                    [8, 10, 5],
                    [3, 1, 11],
                    [3, 6, 11],
                    [0, 10, 9],
                    [8, 6, 11],
                    [3, 4, 2],
                    [0, 4, 5],
                    [3, 4, 9],
                    [7, 10, 5],
                    [8, 4, 9],
                    [8, 10, 9],
                    [8, 10, 2],
                    [0, 6, 9],
                    [3, 10, 9],
                    [0, 10, 11],
                    [7, 1, 9],
                    [8, 1, 11],
                    [7, 4, 11],
                    [7, 6, 9],
                    [7, 10, 11],
                    [3, 10, 2],
                    [8, 1, 5],
                    [0, 4, 11],
                    [3, 1, 2],
                    [3, 1, 9],
                    [7, 4, 2],
                    [8, 1, 2],
                    [8, 1, 9],
                    [3, 6, 9],
                    [7, 4, 9],
                    [8, 6, 2],
                    [8, 6, 9],
                    [3, 6, 2],
                    [12, 13, 14],
                    [15, 16, 14],
                    [12, 17, 18],
                    [15, 19, 18],
                    [20, 13, 18],
                    [21, 16, 18],
                    [20, 17, 14],
                    [21, 19, 14],
                    [0, 1, 5],
                    [8, 10, 11],
                    [7, 6, 11],
                    [7, 6, 5],
                    [8, 4, 2],
                    [7, 4, 5],
                    [7, 1, 5],
                    [7, 1, 11],
                    [0, 10, 5],
                    [0, 1, 11],
                    [0, 6, 11],
                    [0, 6, 5],
                    [3, 10, 11],
                    [8, 4, 11],
                    [15, 13, 22],
                    [12, 16, 22],
                    [15, 17, 23],
                    [12, 19, 23],
                    [21, 13, 23],
                    [20, 16, 23],
                    [21, 17, 22],
                    [20, 19, 22],
                    [4, 0, 2],
                    [1, 3, 2],
                    [4, 0, 14],
                    [1, 3, 18],
                    [4, 0, 9],
                    [1, 3, 9],
                    [4, 0, 18],
                    [1, 3, 14],
                    [10, 7, 9],
                    [6, 8, 9],
                    [4, 7, 14],
                    [6, 3, 18],
                    [10, 0, 18],
                    [1, 8, 14],
                    [1, 3, 5],
                    [4, 0, 5],
                    [6, 8, 11],
                    [10, 7, 11],
                    [1, 3, 11],
                    [4, 0, 11],
                    [10, 7, 2],
                    [6, 8, 2],
                    [3, 10, 22],
                    [7, 1, 23],
                    [8, 4, 23],
                    [0, 6, 22],
                    [1, 0, 5],
                    [4, 3, 5],
                    [1, 0, 23],
                    [4, 3, 22],
                    [10, 7, 14],
                    [6, 8, 18],
                    [8, 6, 22],
                    [7, 10, 23],
                    [4, 3, 11],
                    [1, 0, 11],
                    [1, 0, 22],
                    [4, 3, 23],
                    [10, 7, 18],
                    [6, 8, 14],
                    [8, 6, 23],
                    [7, 10, 22],
                    [6, 7, 11],
                    [10, 8, 11],
                    [8, 1, 23],
                    [0, 10, 22],
                    [3, 6, 22],
                    [7, 4, 23],
                    [4, 3, 2],
                    [1, 0, 2],
                    [10, 8, 2],
                    [6, 7, 2],
                    [4, 3, 9],
                    [1, 0, 9],
                    [10, 8, 9],
                    [6, 7, 9],
                    [4, 8, 14],
                    [6, 0, 18],
                    [10, 3, 18],
                    [1, 7, 14],
                    [4, 8, 18],
                    [6, 0, 14],
                    [10, 3, 14],
                    [1, 7, 18],
                    [6, 7, 5],
                    [10, 8, 5],
                    [6, 8, 5],
                    [10, 7, 5],
                    [8, 1, 22],
                    [0, 10, 23],
                    [3, 6, 23],
                    [7, 4, 22],
                    [4, 24, 2],
                    [25, 3, 2],
                    [4, 24, 26],
                    [25, 3, 27],
                    [4, 24, 27],
                    [25, 3, 26],
                    [28, 29, 26],
                    [30, 31, 26],
                    [32, 33, 26],
                    [34, 35, 27],
                    [36, 37, 27],
                    [38, 39, 27],
                    [2, 0, 1],
                    [1, 2, 0],
                    [1, 25, 5],
                    [24, 0, 5],
                    [39, 36, 40],
                    [35, 38, 40],
                    [37, 34, 40],
                    [33, 30, 41],
                    [29, 32, 41],
                    [31, 28, 41],
                    [5, 3, 4],
                    [4, 5, 3],
                    [25, 1, 5],
                    [0, 24, 5],
                    [24, 4, 5],
                    [3, 25, 5],
                    [4, 3, 41],
                    [25, 1, 40],
                    [24, 4, 41],
                    [3, 25, 40],
                    [4, 3, 40],
                    [25, 1, 41],
                    [24, 4, 40],
                    [3, 25, 41],
                    [35, 34, 40],
                    [37, 36, 40],
                    [39, 38, 40],
                    [29, 28, 41],
                    [31, 30, 41],
                    [33, 32, 41],
                    [3, 5, 4],
                    [5, 4, 3],
                    [25, 1, 2],
                    [0, 24, 2],
                    [24, 4, 2],
                    [3, 25, 2],
                    [25, 1, 9],
                    [0, 24, 9],
                    [24, 4, 9],
                    [3, 25, 9],
                    [30, 33, 26],
                    [32, 29, 26],
                    [28, 31, 26],
                    [36, 39, 27],
                    [38, 35, 27],
                    [34, 37, 27],
                    [0, 2, 1],
                    [2, 1, 0],
                    [30, 33, 42],
                    [32, 29, 42],
                    [28, 31, 42],
                    [36, 39, 43],
                    [38, 35, 43],
                    [34, 37, 43],
                    [7, 9, 6],
                    [9, 6, 7],
                    [25, 1, 11],
                    [0, 24, 11],
                    [24, 4, 11],
                    [3, 25, 11],
                    [35, 34, 44],
                    [37, 36, 44],
                    [39, 38, 44],
                    [29, 28, 45],
                    [31, 30, 45],
                    [33, 32, 45],
                    [8, 11, 10],
                    [11, 10, 8],
                    [1, 25, 2],
                    [24, 0, 2],
                    [1, 25, 42],
                    [24, 0, 43],
                    [1, 25, 43],
                    [24, 0, 42],
                    [1, 25, 27],
                    [24, 0, 26],
                    [1, 25, 26],
                    [24, 0, 27],
                    [1, 25, 9],
                    [24, 0, 9],
                    [4, 24, 5],
                    [25, 3, 5],
                    [4, 24, 11],
                    [25, 3, 11],
                    [1, 0, 40],
                    [4, 3, 44],
                    [0, 24, 45],
                    [1, 0, 41],
                    [4, 3, 45],
                    [0, 24, 44],
                    [0, 24, 40],
                    [0, 24, 41],
                    [2, 3, 4],
                    [5, 3, 1],
                    [5, 0, 4],
                    [4, 2, 3],
                    [1, 5, 3],
                    [4, 5, 0],
                    [2, 7, 6],
                    [2, 8, 10],
                    [5, 8, 6],
                    [5, 7, 10],
                    [1, 9, 7],
                    [4, 9, 8],
                    [1, 11, 8],
                    [4, 11, 7],
                    [9, 0, 6],
                    [9, 3, 10],
                    [11, 3, 6],
                    [11, 0, 10],
                    [6, 2, 7],
                    [10, 2, 8],
                    [6, 5, 8],
                    [10, 5, 7],
                    [9, 7, 1],
                    [9, 8, 4],
                    [11, 8, 1],
                    [11, 7, 4],
                    [6, 9, 0],
                    [10, 9, 3],
                    [6, 11, 3],
                    [10, 11, 0],
                    [9, 7, 6],
                    [9, 8, 10],
                    [11, 8, 6],
                    [11, 7, 10],
                    [6, 9, 7],
                    [10, 9, 8],
                    [6, 11, 8],
                    [10, 11, 7],
                    [2, 3, 10],
                    [5, 8, 1],
                    [11, 0, 4],
                    [10, 2, 3],
                    [1, 5, 8],
                    [4, 11, 0],
                    [5, 0, 1],
                    [2, 0, 4],
                    [2, 3, 1],
                    [1, 5, 0],
                    [4, 2, 0],
                    [1, 2, 3],
                    [11, 8, 10],
                    [11, 7, 6],
                    [9, 7, 10],
                    [9, 8, 6],
                    [10, 11, 8],
                    [6, 11, 7],
                    [10, 9, 7],
                    [6, 9, 8],
                    [5, 8, 10],
                    [5, 7, 6],
                    [2, 7, 10],
                    [2, 8, 6],
                    [4, 11, 8],
                    [1, 11, 7],
                    [4, 9, 7],
                    [1, 9, 8],
                    [11, 3, 10],
                    [11, 0, 6],
                    [9, 0, 10],
                    [9, 3, 6],
                    [10, 5, 8],
                    [6, 5, 7],
                    [10, 2, 7],
                    [6, 2, 8],
                    [11, 8, 4],
                    [11, 7, 1],
                    [9, 7, 4],
                    [9, 8, 1],
                    [10, 11, 3],
                    [6, 11, 0],
                    [10, 9, 0],
                    [6, 9, 3],
                    [22, 15, 13],
                    [22, 12, 16],
                    [14, 12, 13],
                    [14, 15, 16],
                    [13, 22, 15],
                    [16, 22, 12],
                    [13, 14, 12],
                    [16, 14, 15],
                    [22, 21, 17],
                    [22, 20, 19],
                    [14, 20, 17],
                    [14, 21, 19],
                    [13, 23, 21],
                    [16, 23, 20],
                    [13, 18, 20],
                    [16, 18, 21],
                    [23, 15, 17],
                    [23, 12, 19],
                    [18, 12, 17],
                    [18, 15, 19],
                    [17, 22, 21],
                    [19, 22, 20],
                    [17, 14, 20],
                    [19, 14, 21],
                    [23, 21, 13],
                    [23, 20, 16],
                    [18, 20, 13],
                    [18, 21, 16],
                    [17, 23, 15],
                    [19, 23, 12],
                    [17, 18, 12],
                    [19, 18, 15],
                    [5, 0, 6],
                    [2, 7, 4],
                    [9, 3, 1],
                    [6, 5, 0],
                    [4, 2, 7],
                    [1, 9, 3],
                    [0, 2, 4],
                    [3, 2, 1],
                    [0, 5, 1],
                    [2, 1, 3],
                    [2, 4, 0],
                    [5, 1, 0],
                    [7, 9, 10],
                    [8, 9, 6],
                    [7, 11, 6],
                    [9, 6, 8],
                    [9, 10, 7],
                    [11, 6, 7],
                    [1, 7, 11],
                    [4, 8, 11],
                    [1, 8, 9],
                    [4, 7, 9],
                    [0, 9, 10],
                    [3, 9, 6],
                    [3, 11, 10],
                    [0, 11, 6],
                    [2, 6, 8],
                    [2, 10, 7],
                    [5, 6, 7],
                    [5, 10, 8],
                    [6, 0, 11],
                    [10, 3, 11],
                    [6, 3, 9],
                    [10, 0, 9],
                    [7, 2, 10],
                    [8, 2, 6],
                    [8, 5, 10],
                    [7, 5, 6],
                    [9, 1, 8],
                    [9, 4, 7],
                    [11, 1, 7],
                    [11, 4, 8],
                    [7, 9, 4],
                    [8, 9, 1],
                    [8, 11, 4],
                    [7, 11, 1],
                    [9, 6, 3],
                    [9, 10, 0],
                    [11, 6, 0],
                    [11, 10, 3],
                    [19, 12, 23],
                    [13, 15, 22],
                    [16, 21, 18],
                    [17, 20, 14],
                    [20, 14, 17],
                    [21, 18, 16],
                    [15, 22, 13],
                    [12, 23, 19],
                    [18, 16, 21],
                    [14, 17, 20],
                    [23, 19, 12],
                    [22, 13, 15],
                    [19, 20, 22],
                    [13, 21, 23],
                    [16, 15, 14],
                    [17, 12, 18],
                    [20, 18, 13],
                    [21, 14, 19],
                    [15, 23, 17],
                    [12, 22, 16],
                    [18, 19, 15],
                    [14, 13, 12],
                    [23, 16, 20],
                    [22, 17, 21],
                    [16, 12, 22],
                    [17, 15, 23],
                    [19, 21, 14],
                    [13, 20, 18],
                    [12, 14, 13],
                    [15, 18, 19],
                    [21, 22, 17],
                    [20, 23, 16],
                    [14, 16, 15],
                    [18, 17, 12],
                    [22, 19, 20],
                    [23, 13, 21],
                    [16, 20, 23],
                    [17, 21, 22],
                    [19, 15, 18],
                    [13, 12, 14],
                    [12, 18, 17],
                    [15, 14, 16],
                    [21, 23, 13],
                    [20, 22, 19],
                    [14, 19, 21],
                    [18, 13, 20],
                    [22, 16, 12],
                    [23, 17, 15],
                    [19, 12, 22],
                    [17, 21, 23],
                    [16, 15, 18],
                    [13, 20, 14],
                    [20, 14, 13],
                    [15, 18, 16],
                    [21, 23, 17],
                    [12, 22, 19],
                    [18, 16, 15],
                    [14, 13, 20],
                    [22, 19, 12],
                    [23, 17, 21],
                    [3, 2, 4],
                    [3, 5, 1],
                    [0, 5, 4],
                    [2, 4, 3],
                    [5, 1, 3],
                    [5, 4, 0],
                    [1, 7, 9],
                    [4, 8, 9],
                    [1, 8, 11],
                    [4, 7, 11],
                    [0, 9, 6],
                    [3, 9, 10],
                    [3, 11, 6],
                    [0, 11, 10],
                    [2, 6, 7],
                    [2, 10, 8],
                    [5, 6, 8],
                    [5, 10, 7],
                    [6, 0, 9],
                    [10, 3, 9],
                    [6, 3, 11],
                    [10, 0, 11],
                    [7, 2, 6],
                    [8, 2, 10],
                    [8, 5, 6],
                    [7, 5, 10],
                    [9, 1, 7],
                    [9, 4, 8],
                    [11, 1, 8],
                    [11, 4, 7],
                    [7, 9, 1],
                    [8, 9, 4],
                    [8, 11, 1],
                    [7, 11, 4],
                    [9, 6, 0],
                    [9, 10, 3],
                    [11, 6, 3],
                    [11, 10, 0],
                    [8, 9, 10],
                    [8, 11, 6],
                    [7, 11, 10],
                    [9, 10, 8],
                    [11, 6, 8],
                    [11, 10, 7],
                    [6, 0, 2],
                    [10, 3, 2],
                    [6, 3, 5],
                    [10, 0, 5],
                    [7, 2, 1],
                    [8, 2, 4],
                    [8, 5, 1],
                    [7, 5, 4],
                    [9, 1, 0],
                    [9, 4, 3],
                    [11, 1, 3],
                    [11, 4, 0],
                    [1, 7, 2],
                    [4, 8, 2],
                    [1, 8, 5],
                    [4, 7, 5],
                    [0, 9, 1],
                    [3, 9, 4],
                    [3, 11, 1],
                    [0, 11, 4],
                    [2, 6, 0],
                    [2, 10, 3],
                    [5, 6, 3],
                    [5, 10, 0],
                    [0, 2, 6],
                    [3, 2, 10],
                    [3, 5, 6],
                    [0, 5, 10],
                    [2, 1, 7],
                    [2, 4, 8],
                    [5, 1, 8],
                    [5, 4, 7],
                    [16, 12, 14],
                    [13, 21, 18],
                    [19, 15, 23],
                    [17, 20, 22],
                    [12, 14, 16],
                    [21, 18, 13],
                    [15, 23, 19],
                    [20, 22, 17],
                    [14, 16, 12],
                    [18, 13, 21],
                    [23, 19, 15],
                    [22, 17, 20],
                    [19, 20, 18],
                    [17, 15, 14],
                    [16, 21, 22],
                    [13, 12, 23],
                    [20, 18, 19],
                    [15, 14, 17],
                    [21, 22, 16],
                    [12, 23, 13],
                    [18, 19, 20],
                    [14, 17, 15],
                    [22, 16, 21],
                    [23, 13, 12],
                    [6, 0, 5],
                    [10, 3, 5],
                    [6, 3, 2],
                    [10, 0, 2],
                    [7, 2, 4],
                    [8, 2, 1],
                    [8, 5, 4],
                    [7, 5, 1],
                    [9, 1, 3],
                    [9, 4, 0],
                    [11, 1, 0],
                    [11, 4, 3],
                    [1, 7, 5],
                    [4, 8, 5],
                    [1, 8, 2],
                    [4, 7, 2],
                    [0, 9, 4],
                    [3, 9, 1],
                    [3, 11, 4],
                    [0, 11, 1],
                    [2, 6, 3],
                    [2, 10, 0],
                    [5, 6, 0],
                    [5, 10, 3],
                    [0, 2, 10],
                    [3, 2, 6],
                    [3, 5, 10],
                    [0, 5, 6],
                    [2, 1, 8],
                    [2, 4, 7],
                    [5, 1, 7],
                    [5, 4, 8],
                    [21, 17, 23],
                    [20, 16, 22],
                    [12, 13, 18],
                    [15, 19, 14],
                    [23, 21, 17],
                    [22, 20, 16],
                    [18, 12, 13],
                    [14, 15, 19],
                    [17, 23, 21],
                    [16, 22, 20],
                    [13, 18, 12],
                    [19, 14, 15],
                    [21, 13, 22],
                    [20, 19, 23],
                    [12, 17, 14],
                    [15, 16, 18],
                    [23, 15, 13],
                    [22, 12, 19],
                    [18, 20, 17],
                    [14, 21, 16],
                    [17, 22, 15],
                    [16, 23, 12],
                    [13, 14, 20],
                    [19, 18, 21],
                    [15, 17, 22],
                    [12, 16, 23],
                    [20, 13, 14],
                    [21, 19, 18],
                    [22, 21, 13],
                    [23, 20, 19],
                    [14, 12, 17],
                    [18, 15, 16],
                    [13, 23, 15],
                    [19, 22, 12],
                    [17, 18, 20],
                    [16, 14, 21],
                    [15, 13, 23],
                    [12, 19, 22],
                    [20, 17, 18],
                    [21, 16, 14],
                    [22, 15, 17],
                    [23, 12, 16],
                    [14, 20, 13],
                    [18, 21, 19],
                    [13, 22, 21],
                    [19, 23, 20],
                    [17, 14, 12],
                    [16, 18, 15],
                    [6, 5, 3],
                    [4, 9, 3],
                    [9, 3, 4],
                    [5, 7, 4],
                    [4, 5, 7],
                    [5, 3, 6],
                ];
                SpacegroupTables.Group = [
                    [0],
                    [0, 1],
                    [0, 2],
                    [0, 3],
                    [0, 2, 4, 5],
                    [0, 6],
                    [0, 7],
                    [0, 6, 4, 8],
                    [0, 7, 4, 9],
                    [0, 6, 2, 1],
                    [0, 3, 1, 10],
                    [0, 6, 2, 1, 4, 8, 5, 11],
                    [0, 12, 1, 7],
                    [0, 1, 13, 14],
                    [0, 12, 1, 7, 4, 15, 11, 9],
                    [0, 16, 2, 17],
                    [0, 18, 12, 17],
                    [0, 16, 5, 19],
                    [0, 20, 13, 19],
                    [0, 18, 12, 17, 4, 21, 15, 19],
                    [0, 16, 2, 17, 4, 22, 5, 19],
                    [0, 16, 2, 17, 23, 24, 13, 25, 26, 20, 27, 28, 4, 22, 5, 19],
                    [0, 16, 17, 2, 29, 21, 30, 15],
                    [0, 20, 13, 19, 29, 31, 32, 33],
                    [0, 16, 6, 34],
                    [0, 18, 7, 34],
                    [0, 16, 7, 35],
                    [0, 16, 36, 37],
                    [0, 18, 36, 38],
                    [0, 16, 14, 39],
                    [0, 20, 40, 34],
                    [0, 16, 8, 41],
                    [0, 18, 8, 42],
                    [0, 16, 9, 42],
                    [0, 16, 6, 34, 4, 22, 8, 41],
                    [0, 18, 7, 34, 4, 21, 9, 41],
                    [0, 16, 7, 35, 4, 22, 9, 42],
                    [0, 16, 6, 34, 23, 24, 14, 39],
                    [0, 16, 10, 43, 23, 24, 7, 35],
                    [0, 16, 36, 37, 23, 24, 9, 42],
                    [0, 16, 8, 41, 23, 24, 40, 38],
                    [0, 16, 6, 34, 23, 24, 14, 39, 26, 20, 40, 38, 4, 22, 8, 41],
                    [0, 16, 44, 45, 23, 24, 46, 47, 26, 20, 48, 49, 4, 22, 50, 51],
                    [0, 16, 6, 34, 29, 21, 9, 42],
                    [0, 16, 8, 41, 29, 21, 7, 35],
                    [0, 16, 36, 37, 29, 21, 14, 39],
                    [0, 16, 2, 17, 1, 52, 6, 34],
                    [0, 16, 2, 17, 53, 54, 9, 42],
                    [0, 16, 12, 33, 1, 52, 7, 35],
                    [0, 16, 2, 17, 11, 55, 8, 41],
                    [0, 56, 2, 57, 1, 58, 6, 37],
                    [0, 56, 15, 25, 1, 58, 9, 39],
                    [0, 20, 27, 17, 1, 59, 40, 34],
                    [0, 56, 12, 28, 1, 58, 7, 38],
                    [0, 16, 5, 19, 1, 52, 8, 41],
                    [0, 22, 13, 28, 1, 55, 14, 38],
                    [0, 18, 13, 60, 1, 61, 14, 43],
                    [0, 16, 15, 30, 1, 52, 9, 42],
                    [0, 16, 5, 19, 11, 55, 6, 34],
                    [0, 21, 12, 19, 1, 54, 7, 41],
                    [0, 20, 13, 19, 1, 59, 14, 41],
                    [0, 20, 3, 30, 1, 59, 10, 42],
                    [0, 18, 12, 17, 1, 61, 7, 34, 4, 21, 15, 19, 11, 54, 9, 41],
                    [0, 24, 13, 17, 1, 62, 14, 34, 4, 20, 27, 19, 11, 59, 40, 41],
                    [0, 16, 2, 17, 1, 52, 6, 34, 4, 22, 5, 19, 11, 55, 8, 41],
                    [0, 16, 12, 33, 1, 52, 7, 35, 4, 22, 15, 30, 11, 55, 9, 42],
                    [0, 31, 3, 17, 1, 63, 10, 34, 4, 56, 32, 19, 11, 58, 36, 41],
                    [0, 22, 2, 19, 64, 59, 14, 38, 4, 16, 5, 17, 65, 62, 40, 39],
                    [0, 16, 2, 17, 1, 52, 6, 34, 23, 24, 13, 25, 64, 62, 14, 39, 26, 20, 27, 28, 65, 59, 40, 38, 4, 22, 5, 19, 11, 55, 8, 41],
                    [0, 16, 2, 17, 66, 67, 44, 45, 23, 24, 13, 25, 68, 69, 46, 47, 26, 20, 27, 28, 70, 71, 48, 49, 4, 22, 5, 19, 72, 73, 50, 51],
                    [0, 16, 2, 17, 1, 52, 6, 34, 29, 21, 15, 30, 53, 54, 9, 42],
                    [0, 16, 5, 19, 1, 52, 8, 41, 29, 21, 12, 33, 53, 54, 7, 35],
                    [0, 20, 13, 19, 1, 59, 14, 41, 29, 31, 32, 33, 53, 63, 36, 35],
                    [0, 31, 3, 17, 1, 63, 10, 34, 29, 20, 27, 30, 53, 59, 40, 42],
                    [0, 16, 74, 75],
                    [0, 18, 76, 77],
                    [0, 16, 78, 79],
                    [0, 18, 80, 81],
                    [0, 16, 74, 75, 29, 21, 82, 83],
                    [0, 21, 84, 85, 29, 16, 86, 87],
                    [0, 16, 88, 89],
                    [0, 16, 88, 89, 29, 21, 90, 91],
                    [0, 16, 74, 75, 1, 52, 88, 89],
                    [0, 16, 78, 79, 1, 52, 92, 93],
                    [0, 16, 94, 95, 11, 55, 88, 89],
                    [0, 16, 82, 83, 53, 54, 88, 89],
                    [0, 16, 74, 75, 1, 52, 88, 89, 29, 21, 82, 83, 53, 54, 90, 91],
                    [0, 21, 84, 85, 96, 97, 88, 91, 29, 16, 86, 87, 98, 99, 90, 89],
                    [0, 16, 74, 75, 2, 17, 100, 101],
                    [0, 16, 94, 95, 5, 19, 100, 101],
                    [0, 18, 76, 77, 2, 33, 102, 103],
                    [0, 18, 104, 105, 106, 107, 100, 108],
                    [0, 16, 78, 79, 2, 17, 109, 108],
                    [0, 16, 82, 83, 15, 30, 100, 101],
                    [0, 18, 80, 81, 2, 33, 110, 111],
                    [0, 18, 112, 113, 114, 115, 100, 108],
                    [0, 16, 74, 75, 2, 17, 100, 101, 29, 21, 82, 83, 15, 30, 116, 117],
                    [0, 21, 84, 85, 118, 119, 116, 101, 29, 16, 86, 87, 120, 121, 100, 117],
                    [0, 16, 74, 75, 6, 34, 122, 123],
                    [0, 16, 74, 75, 8, 41, 124, 125],
                    [0, 16, 78, 79, 7, 35, 122, 123],
                    [0, 16, 82, 83, 9, 42, 122, 123],
                    [0, 16, 74, 75, 7, 35, 126, 127],
                    [0, 16, 74, 75, 9, 42, 128, 129],
                    [0, 16, 78, 79, 6, 34, 126, 127],
                    [0, 16, 78, 79, 8, 41, 128, 129],
                    [0, 16, 74, 75, 6, 34, 122, 123, 29, 21, 82, 83, 9, 42, 128, 129],
                    [0, 16, 74, 75, 7, 35, 126, 127, 29, 21, 82, 83, 8, 41, 124, 125],
                    [0, 21, 84, 85, 6, 42, 130, 131, 29, 16, 86, 87, 9, 34, 132, 133],
                    [0, 21, 84, 85, 7, 41, 134, 135, 29, 16, 86, 87, 8, 35, 136, 137],
                    [0, 16, 89, 88, 2, 17, 122, 123],
                    [0, 16, 89, 88, 12, 33, 126, 127],
                    [0, 16, 89, 88, 5, 19, 124, 125],
                    [0, 16, 89, 88, 15, 30, 128, 129],
                    [0, 16, 88, 89, 6, 34, 100, 101],
                    [0, 16, 89, 88, 7, 35, 109, 108],
                    [0, 16, 89, 88, 8, 41, 138, 139],
                    [0, 16, 89, 88, 9, 42, 116, 117],
                    [0, 16, 89, 88, 6, 34, 100, 101, 29, 21, 91, 90, 9, 42, 116, 117],
                    [0, 16, 89, 88, 7, 35, 109, 108, 29, 21, 91, 90, 8, 41, 138, 139],
                    [0, 16, 89, 88, 2, 17, 122, 123, 29, 21, 91, 90, 15, 30, 128, 129],
                    [0, 16, 89, 88, 118, 121, 132, 131, 29, 21, 91, 90, 120, 119, 130, 133],
                    [0, 16, 74, 75, 2, 17, 100, 101, 1, 52, 88, 89, 6, 34, 122, 123],
                    [0, 16, 74, 75, 12, 33, 109, 108, 1, 52, 88, 89, 7, 35, 126, 127],
                    [0, 16, 74, 75, 2, 17, 100, 101, 11, 55, 140, 141, 8, 41, 124, 125],
                    [0, 16, 74, 75, 2, 17, 100, 101, 53, 54, 90, 91, 9, 42, 128, 129],
                    [0, 16, 74, 75, 5, 19, 138, 139, 1, 52, 88, 89, 8, 41, 124, 125],
                    [0, 16, 74, 75, 15, 30, 116, 117, 1, 52, 88, 89, 9, 42, 128, 129],
                    [0, 16, 94, 95, 5, 19, 100, 101, 11, 55, 88, 89, 6, 34, 124, 125],
                    [0, 16, 94, 95, 15, 30, 109, 108, 11, 55, 88, 89, 7, 35, 128, 129],
                    [0, 16, 78, 79, 2, 17, 109, 108, 1, 52, 92, 93, 6, 34, 126, 127],
                    [0, 16, 78, 79, 12, 33, 100, 101, 1, 52, 92, 93, 7, 35, 122, 123],
                    [0, 16, 82, 83, 12, 33, 138, 139, 53, 54, 88, 89, 8, 41, 126, 127],
                    [0, 16, 82, 83, 2, 17, 116, 117, 53, 54, 88, 89, 9, 42, 122, 123],
                    [0, 16, 78, 79, 5, 19, 116, 117, 1, 52, 92, 93, 8, 41, 128, 129],
                    [0, 16, 82, 83, 15, 30, 100, 101, 1, 52, 90, 91, 9, 42, 122, 123],
                    [0, 16, 82, 83, 15, 30, 100, 101, 53, 54, 88, 89, 6, 34, 128, 129],
                    [0, 16, 82, 83, 5, 19, 109, 108, 53, 54, 88, 89, 7, 35, 124, 125],
                    [0, 16, 74, 75, 2, 17, 100, 101, 1, 52, 88, 89, 6, 34, 122, 123, 29, 21, 82, 83, 15, 30, 116, 117, 53, 54, 90, 91, 9, 42, 128, 129],
                    [0, 16, 74, 75, 12, 33, 109, 108, 1, 52, 88, 89, 7, 35, 126, 127, 29, 21, 82, 83, 5, 19, 138, 139, 53, 54, 90, 91, 8, 41, 124, 125],
                    [0, 21, 84, 85, 118, 119, 116, 101, 96, 97, 88, 91, 9, 34, 132, 133, 29, 16, 86, 87, 120, 121, 100, 117, 98, 99, 90, 89, 6, 42, 130, 131],
                    [0, 21, 84, 85, 142, 143, 138, 108, 96, 97, 88, 91, 8, 35, 136, 137, 29, 16, 86, 87, 144, 145, 109, 139, 98, 99, 90, 89, 7, 41, 134, 135],
                    [0, 146, 147],
                    [0, 148, 149],
                    [0, 150, 151],
                    [0, 146, 147, 152, 153, 154, 155, 156, 157],
                    [0, 158, 159],
                    [0, 146, 147, 1, 160, 161],
                    [0, 146, 147, 1, 160, 161, 152, 153, 154, 162, 163, 164, 155, 156, 157, 165, 166, 167],
                    [0, 158, 159, 1, 168, 169],
                    [0, 146, 147, 101, 170, 171],
                    [0, 146, 147, 100, 172, 173],
                    [0, 148, 149, 174, 175, 171],
                    [0, 148, 149, 100, 176, 177],
                    [0, 150, 151, 178, 179, 171],
                    [0, 150, 151, 100, 180, 181],
                    [0, 146, 147, 100, 172, 173, 152, 153, 154, 182, 183, 184, 155, 156, 157, 185, 186, 187],
                    [0, 158, 159, 101, 188, 189],
                    [0, 146, 147, 122, 190, 191],
                    [0, 146, 147, 123, 192, 193],
                    [0, 146, 147, 126, 194, 195],
                    [0, 146, 147, 127, 196, 197],
                    [0, 146, 147, 122, 190, 191, 152, 153, 154, 198, 199, 200, 155, 156, 157, 201, 202, 203],
                    [0, 158, 159, 123, 204, 205],
                    [0, 146, 147, 126, 194, 195, 152, 153, 154, 206, 207, 208, 155, 156, 157, 209, 210, 211],
                    [0, 158, 159, 129, 212, 213],
                    [0, 146, 147, 101, 170, 171, 1, 160, 161, 123, 192, 193],
                    [0, 146, 147, 108, 214, 215, 1, 160, 161, 127, 196, 197],
                    [0, 146, 147, 100, 172, 173, 1, 160, 161, 122, 190, 191],
                    [0, 146, 147, 109, 216, 217, 1, 160, 161, 126, 194, 195],
                    [0, 146, 147, 100, 172, 173, 1, 160, 161, 122, 190, 191, 152, 153, 154, 182, 183, 184, 162, 163, 164, 198, 199, 200, 155, 156, 157, 185, 186, 187, 165, 166, 167, 201, 202, 203],
                    [0, 158, 159, 101, 188, 189, 1, 168, 169, 123, 204, 205],
                    [0, 146, 147, 109, 216, 217, 1, 160, 161, 126, 194, 195, 152, 153, 154, 218, 219, 220, 162, 163, 164, 206, 207, 208, 155, 156, 157, 221, 222, 223, 165, 166, 167, 209, 210, 211],
                    [0, 158, 159, 117, 224, 225, 1, 168, 169, 129, 212, 213],
                    [0, 146, 147, 16, 226, 227],
                    [0, 148, 149, 18, 228, 229],
                    [0, 150, 151, 18, 230, 231],
                    [0, 150, 151, 16, 232, 233],
                    [0, 148, 149, 16, 234, 235],
                    [0, 146, 147, 18, 236, 237],
                    [0, 146, 147, 52, 238, 239],
                    [0, 146, 147, 16, 226, 227, 1, 160, 161, 52, 238, 239],
                    [0, 146, 147, 18, 236, 237, 1, 160, 161, 61, 240, 241],
                    [0, 146, 147, 16, 226, 227, 100, 172, 173, 101, 170, 171],
                    [0, 148, 149, 18, 228, 229, 242, 172, 181, 243, 214, 244],
                    [0, 150, 151, 18, 230, 231, 245, 172, 177, 246, 214, 247],
                    [0, 150, 151, 16, 232, 233, 245, 172, 177, 174, 170, 248],
                    [0, 148, 149, 16, 234, 235, 242, 172, 181, 178, 170, 249],
                    [0, 146, 147, 18, 236, 237, 100, 172, 173, 108, 214, 215],
                    [0, 146, 147, 16, 226, 227, 122, 190, 191, 123, 192, 193],
                    [0, 146, 147, 16, 226, 227, 126, 194, 195, 127, 196, 197],
                    [0, 146, 147, 18, 236, 237, 126, 194, 195, 123, 192, 193],
                    [0, 146, 147, 18, 236, 237, 122, 190, 191, 127, 196, 197],
                    [0, 146, 147, 52, 238, 239, 122, 190, 191, 101, 170, 171],
                    [0, 146, 147, 61, 240, 241, 126, 194, 195, 101, 170, 171],
                    [0, 146, 147, 52, 238, 239, 100, 172, 173, 123, 192, 193],
                    [0, 146, 147, 61, 240, 241, 100, 172, 173, 127, 196, 197],
                    [0, 146, 147, 16, 226, 227, 100, 172, 173, 101, 170, 171, 1, 160, 161, 52, 239, 238, 122, 190, 191, 123, 192, 193],
                    [0, 146, 147, 16, 226, 227, 109, 216, 217, 108, 214, 215, 1, 160, 161, 52, 239, 238, 126, 194, 195, 127, 196, 197],
                    [0, 146, 147, 18, 236, 237, 109, 216, 217, 101, 170, 171, 1, 160, 161, 61, 241, 240, 126, 194, 195, 123, 192, 193],
                    [0, 146, 147, 18, 236, 237, 100, 172, 173, 108, 214, 215, 1, 160, 161, 61, 241, 240, 122, 190, 191, 127, 196, 197],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 64, 62, 14, 39, 308, 309, 310, 311, 312, 313, 314, 315, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 65, 59, 40, 38, 316, 317, 318, 319, 320, 321, 322, 323, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 11, 55, 8, 41, 324, 325, 326, 327, 328, 329, 330, 331],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 66, 67, 44, 45, 332, 333, 334, 335, 336, 337, 338, 339, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 68, 69, 46, 47, 340, 341, 342, 343, 344, 345, 346, 347, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 70, 71, 48, 49, 348, 349, 350, 351, 352, 353, 354, 355, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 72, 73, 50, 51, 356, 357, 358, 359, 360, 361, 362, 363],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 1, 59, 14, 41, 168, 325, 318, 311, 169, 313, 330, 323],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 1, 59, 14, 41, 168, 325, 318, 311, 169, 313, 330, 323, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 53, 63, 36, 35, 300, 364, 365, 366, 304, 367, 368, 369],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 138, 139, 95, 94, 406, 407, 408, 409, 410, 411, 412, 413],
                    [0, 24, 5, 28, 158, 265, 258, 275, 159, 277, 270, 263, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 23, 16, 27, 19, 256, 273, 251, 267, 260, 269, 278, 255, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 26, 22, 13, 17, 264, 250, 274, 259, 268, 261, 254, 279, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 4, 20, 2, 25, 272, 257, 266, 252, 276, 253, 262, 271, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 450, 415, 440, 429, 454, 431, 420, 445, 458, 447, 436, 425],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 450, 415, 440, 429, 454, 431, 420, 445, 458, 447, 436, 425],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 123, 122, 88, 89, 204, 474, 475, 476, 205, 477, 478, 479],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 123, 122, 88, 89, 204, 474, 475, 476, 205, 477, 478, 479, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 125, 124, 140, 141, 504, 505, 506, 507, 508, 509, 510, 511],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 123, 122, 88, 89, 204, 474, 475, 476, 205, 477, 478, 479, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 129, 128, 90, 91, 212, 512, 513, 514, 213, 515, 516, 517],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 129, 128, 90, 91, 212, 512, 513, 514, 213, 515, 516, 517],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 129, 128, 90, 91, 212, 512, 513, 514, 213, 515, 516, 517, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 127, 126, 92, 93, 542, 543, 544, 545, 546, 547, 548, 549],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 64, 62, 14, 39, 308, 309, 310, 311, 312, 313, 314, 315, 481, 480, 483, 482, 486, 487, 484, 485, 491, 490, 489, 488, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 65, 59, 40, 38, 316, 317, 318, 319, 320, 321, 322, 323, 493, 492, 495, 494, 498, 499, 496, 497, 503, 502, 501, 500, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 138, 139, 95, 94, 406, 407, 408, 409, 410, 411, 412, 413, 11, 55, 8, 41, 324, 325, 326, 327, 328, 329, 330, 331, 124, 125, 141, 140, 506, 507, 504, 505, 511, 510, 509, 508],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213, 23, 24, 13, 25, 256, 257, 258, 259, 260, 261, 262, 263, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 64, 62, 14, 39, 308, 309, 310, 311, 312, 313, 314, 315, 519, 518, 521, 520, 524, 525, 522, 523, 529, 528, 527, 526, 26, 20, 27, 28, 264, 265, 266, 267, 268, 269, 270, 271, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 65, 59, 40, 38, 316, 317, 318, 319, 320, 321, 322, 323, 531, 530, 533, 532, 536, 537, 534, 535, 541, 540, 539, 538, 4, 22, 5, 19, 272, 273, 274, 275, 276, 277, 278, 279, 109, 108, 79, 78, 598, 599, 600, 601, 602, 603, 604, 605, 11, 55, 8, 41, 324, 325, 326, 327, 328, 329, 330, 331, 126, 127, 93, 92, 544, 545, 542, 543, 549, 548, 547, 546],
                    [0, 24, 5, 28, 158, 265, 258, 275, 159, 277, 270, 263, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 66, 69, 50, 49, 332, 349, 342, 359, 336, 361, 354, 347, 493, 123, 483, 140, 498, 507, 204, 485, 503, 490, 509, 205, 23, 16, 27, 19, 256, 273, 251, 267, 260, 269, 278, 255, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 68, 67, 48, 51, 340, 357, 334, 351, 344, 353, 362, 339, 124, 480, 89, 494, 506, 499, 484, 474, 511, 478, 501, 488, 26, 22, 13, 17, 264, 250, 274, 259, 268, 261, 254, 279, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 70, 73, 46, 45, 348, 333, 358, 343, 352, 345, 338, 363, 122, 492, 141, 482, 475, 487, 496, 505, 479, 510, 489, 500, 4, 20, 2, 25, 272, 257, 266, 252, 276, 253, 262, 271, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 72, 71, 44, 47, 356, 341, 350, 335, 360, 337, 346, 355, 481, 125, 495, 88, 486, 476, 504, 497, 491, 502, 477, 508],
                    [0, 24, 5, 28, 158, 265, 258, 275, 159, 277, 270, 263, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 531, 129, 521, 92, 536, 545, 212, 523, 541, 528, 547, 213, 23, 16, 27, 19, 256, 273, 251, 267, 260, 269, 278, 255, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 126, 518, 91, 532, 544, 537, 522, 512, 549, 516, 539, 526, 26, 22, 13, 17, 264, 250, 274, 259, 268, 261, 254, 279, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 128, 530, 93, 520, 513, 525, 534, 543, 517, 548, 527, 538, 4, 20, 2, 25, 272, 257, 266, 252, 276, 253, 262, 271, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 519, 127, 533, 90, 524, 514, 542, 535, 529, 540, 515, 546],
                    [0, 16, 2, 17, 158, 250, 251, 252, 159, 253, 254, 255, 100, 101, 75, 74, 370, 371, 188, 372, 373, 374, 375, 189, 1, 52, 6, 34, 168, 294, 295, 296, 169, 297, 298, 299, 122, 123, 89, 88, 475, 476, 204, 474, 479, 478, 477, 205, 29, 21, 15, 30, 280, 281, 282, 283, 284, 285, 286, 287, 116, 117, 83, 82, 376, 377, 224, 378, 379, 380, 381, 225, 53, 54, 9, 42, 300, 301, 302, 303, 304, 305, 306, 307, 128, 129, 91, 90, 513, 514, 212, 512, 517, 516, 515, 213],
                    [0, 20, 13, 19, 158, 273, 266, 259, 159, 261, 278, 271, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 1, 59, 14, 41, 168, 325, 318, 311, 169, 313, 330, 323, 551, 550, 553, 552, 556, 557, 554, 555, 561, 560, 559, 558, 29, 31, 32, 33, 280, 288, 289, 290, 284, 291, 292, 293, 450, 415, 440, 429, 454, 431, 420, 445, 458, 447, 436, 425, 53, 63, 36, 35, 300, 364, 365, 366, 304, 367, 368, 369, 563, 562, 565, 564, 568, 569, 566, 567, 573, 572, 571, 570],
                    [0, 16],
                    [0, 18],
                    [0, 16, 26, 20],
                    [0, 2, 23, 13],
                    [0, 3, 4, 32],
                    [0, 2, 29, 15],
                    [0, 3, 29, 27],
                    [0, 52],
                    [0, 63],
                    [0, 52, 26, 59],
                    [0, 63, 26, 54],
                    [0, 52, 16, 1],
                    [0, 18, 1, 61],
                    [0, 52, 16, 1, 26, 59, 20, 65],
                    [0, 31, 1, 63],
                    [0, 1, 24, 62],
                    [0, 31, 1, 63, 26, 21, 65, 54],
                    [0, 2, 57, 56],
                    [0, 60, 3, 16],
                    [0, 22, 57, 3],
                    [0, 2, 28, 20],
                    [0, 17, 13, 24],
                    [0, 20, 19, 13, 4, 24, 17, 27],
                    [0, 22, 57, 3, 4, 16, 60, 32],
                    [0, 22, 57, 3, 23, 20, 30, 12, 26, 24, 33, 15, 4, 16, 60, 32],
                    [0, 22, 57, 3, 29, 18, 27, 25],
                    [0, 22, 3, 57, 1, 55, 10, 37],
                    [0, 22, 385, 396, 3, 57, 109, 117],
                    [0, 22, 57, 3, 159, 279, 654, 655, 158, 274, 656, 657, 29, 18, 25, 27, 284, 658, 262, 269, 280, 659, 257, 267],
                ];
                SpacegroupTables.Spacegroup = {
                    "P 1": 0,
                    "P -1": 1,
                    "P 1 2 1": 2,
                    "P 1 21 1": 3,
                    "C 1 2 1": 4,
                    "P 1 m 1": 5,
                    "P 1 c 1": 6,
                    "C 1 m 1": 7,
                    "C 1 c 1": 8,
                    "P 1 2/m 1": 9,
                    "P 1 21/m 1": 10,
                    "C 1 2/m 1": 11,
                    "P 1 2/c 1": 12,
                    "P 1 21/c 1": 13,
                    "C 1 2/c 1": 14,
                    "P 2 2 2": 15,
                    "P 2 2 21": 16,
                    "P 21 21 2": 17,
                    "P 21 21 21": 18,
                    "C 2 2 21": 19,
                    "C 2 2 2": 20,
                    "F 2 2 2": 21,
                    "I 2 2 2": 22,
                    "I 21 21 21": 23,
                    "P m m 2": 24,
                    "P m c 21": 25,
                    "P c c 2": 26,
                    "P m a 2": 27,
                    "P c a 21": 28,
                    "P n c 2": 29,
                    "P m n 21": 30,
                    "P b a 2": 31,
                    "P n a 21": 32,
                    "P n n 2": 33,
                    "C m m 2": 34,
                    "C m c 21": 35,
                    "C c c 2": 36,
                    "A m m 2": 37,
                    "A b m 2": 38,
                    "A m a 2": 39,
                    "A b a 2": 40,
                    "F m m 2": 41,
                    "F d d 2": 42,
                    "I m m 2": 43,
                    "I b a 2": 44,
                    "I m a 2": 45,
                    "P 2/m 2/m 2/m": 46,
                    "P m m m": 46,
                    "P 2/n 2/n 2/n": 47,
                    "P n n n": 47,
                    "P 2/c 2/c 2/m": 48,
                    "P c c m": 48,
                    "P 2/b 2/a 2/n": 49,
                    "P b a n": 49,
                    "P 21/m 2/m 2/a": 50,
                    "P m m a": 50,
                    "P 2/n 21/n 2/a": 51,
                    "P n n a": 51,
                    "P 2/m 2/n 21/a": 52,
                    "P m n a": 52,
                    "P 21/c 2/c 2/a": 53,
                    "P c c a": 53,
                    "P 21/b 21/a 2/m": 54,
                    "P b a m": 54,
                    "P 21/c 21/c 2/n": 55,
                    "P c c n": 55,
                    "P 2/b 21/c 21/m": 56,
                    "P b c m": 56,
                    "P 21/n 21/n 2/m": 57,
                    "P n n m": 57,
                    "P 21/m 21/m 2/n": 58,
                    "P m m n": 58,
                    "P 21/b 2/c 21/n": 59,
                    "P b c n": 59,
                    "P 21/b 21/c 21/a": 60,
                    "P b c a": 60,
                    "P 21/n 21/m 21/a": 61,
                    "P n m a": 61,
                    "C 2/m 2/c 21/m": 62,
                    "C m c m": 62,
                    "C 2/m 2/c 21/a": 63,
                    "C m c a": 63,
                    "C 2/m 2/m 2/m": 64,
                    "C m m m": 64,
                    "C 2/c 2/c 2/m": 65,
                    "C c c m": 65,
                    "C 2/m 2/m 2/a": 66,
                    "C m m a": 66,
                    "C 2/c 2/c 2/a": 67,
                    "C c c a": 67,
                    "F 2/m 2/m 2/m": 68,
                    "F m m m": 68,
                    "F 2/d 2/d 2/d": 69,
                    "F d d d": 69,
                    "I 2/m 2/m 2/m": 70,
                    "I m m m": 70,
                    "I 2/b 2/a 2/m": 71,
                    "I b a m": 71,
                    "I 21/b 21/c 21/a": 72,
                    "I b c a": 72,
                    "I 21/m 21/m 21/a": 73,
                    "I m m a": 73,
                    "P 4": 74,
                    "P 41": 75,
                    "P 42": 76,
                    "P 43": 77,
                    "I 4": 78,
                    "I 41": 79,
                    "P -4": 80,
                    "I -4": 81,
                    "P 4/m": 82,
                    "P 42/m": 83,
                    "P 4/n": 84,
                    "P 42/n": 85,
                    "I 4/m": 86,
                    "I 41/a": 87,
                    "P 4 2 2": 88,
                    "P 4 21 2": 89,
                    "P 41 2 2": 90,
                    "P 41 21 2": 91,
                    "P 42 2 2": 92,
                    "P 42 21 2": 93,
                    "P 43 2 2": 94,
                    "P 43 21 2": 95,
                    "I 4 2 2": 96,
                    "I 41 2 2": 97,
                    "P 4 m m": 98,
                    "P 4 b m": 99,
                    "P 42 c m": 100,
                    "P 42 n m": 101,
                    "P 4 c c": 102,
                    "P 4 n c": 103,
                    "P 42 m c": 104,
                    "P 42 b c": 105,
                    "I 4 m m": 106,
                    "I 4 c m": 107,
                    "I 41 m d": 108,
                    "I 41 c d": 109,
                    "P -4 2 m": 110,
                    "P -4 2 c": 111,
                    "P -4 21 m": 112,
                    "P -4 21 c": 113,
                    "P -4 m 2": 114,
                    "P -4 c 2": 115,
                    "P -4 b 2": 116,
                    "P -4 n 2": 117,
                    "I -4 m 2": 118,
                    "I -4 c 2": 119,
                    "I -4 2 m": 120,
                    "I -4 2 d": 121,
                    "P 4/m 2/m 2/m": 122,
                    "P4/m m m": 122,
                    "P 4/m 2/c 2/c": 123,
                    "P4/m c c": 123,
                    "P 4/n 2/b 2/m": 124,
                    "P4/n b m": 124,
                    "P 4/n 2/n 2/c": 125,
                    "P4/n n c": 125,
                    "P 4/m 21/b 2/m": 126,
                    "P4/m b m": 126,
                    "P 4/m 21/n 2/c": 127,
                    "P4/m n c": 127,
                    "P 4/n 21/m 2/m": 128,
                    "P4/n m m": 128,
                    "P 4/n 2/c 2/c": 129,
                    "P4/n c c": 129,
                    "P 42/m 2/m 2/c": 130,
                    "P42/m m c": 130,
                    "P 42/m 2/c 2/m": 131,
                    "P42/m c m": 131,
                    "P 42/n 2/b 2/c": 132,
                    "P42/n b c": 132,
                    "P 42/n 2/n 2/m": 133,
                    "P42/n n m": 133,
                    "P 42/m 21/b 2/c": 134,
                    "P42/m b c": 134,
                    "P 42/m 21/n 2/m": 135,
                    "P42/m n m": 135,
                    "P 42/n 21/m 2/c": 136,
                    "P42/n m c": 136,
                    "P 42/n 21/c 2/m": 137,
                    "P42/n c m": 137,
                    "I 4/m 2/m 2/m": 138,
                    "I4/m m m": 138,
                    "I 4/m 2/c 2/m": 139,
                    "I4/m c m": 139,
                    "I 41/a 2/m 2/d": 140,
                    "I41/a m d": 140,
                    "I 41/a 2/c 2/d": 141,
                    "I41/a c d": 141,
                    "P 3": 142,
                    "P 31": 143,
                    "P 32": 144,
                    "H 3": 145,
                    "R 3": 146,
                    "P -3": 147,
                    "H -3": 148,
                    "R -3": 149,
                    "P 3 1 2": 150,
                    "P 3 2 1": 151,
                    "P 31 1 2": 152,
                    "P 31 2 1": 153,
                    "P 32 1 2": 154,
                    "P 32 2 1": 155,
                    "H 3 2": 156,
                    "R 3 2": 157,
                    "P 3 m 1": 158,
                    "P 3 1 m": 159,
                    "P 3 c 1": 160,
                    "P 3 1 c": 161,
                    "H 3 m": 162,
                    "R 3 m": 163,
                    "H 3 c": 164,
                    "R 3 c": 165,
                    "P -3 1 2/m": 166,
                    "P -3 1 m": 166,
                    "P -3 1 2/c": 167,
                    "P -3 1 c": 167,
                    "P -3 2/m 1": 168,
                    "P -3 m 1": 168,
                    "P -3 2/c 1": 169,
                    "P -3 c 1": 169,
                    "H -3 2/m": 170,
                    "H -3 m": 170,
                    "R -3 2/m": 171,
                    "R -3 m": 171,
                    "H -3 2/c": 172,
                    "H -3 c": 172,
                    "R -3 2/c": 173,
                    "R -3 c": 173,
                    "P 6": 174,
                    "P 61": 175,
                    "P 65": 176,
                    "P 62": 177,
                    "P 64": 178,
                    "P 63": 179,
                    "P -6": 180,
                    "P 6/m": 181,
                    "P 63/m": 182,
                    "P 6 2 2": 183,
                    "P 61 2 2": 184,
                    "P 65 2 2": 185,
                    "P 62 2 2": 186,
                    "P 64 2 2": 187,
                    "P 63 2 2": 188,
                    "P 6 m m": 189,
                    "P 6 c c": 190,
                    "P 63 c m": 191,
                    "P 63 m c": 192,
                    "P -6 m 2": 193,
                    "P -6 c 2": 194,
                    "P -6 2 m": 195,
                    "P -6 2 c": 196,
                    "P 6/m 2/m 2/m": 197,
                    "P 6/m m m": 197,
                    "P 6/m 2/c 2/c": 198,
                    "P 6/m c c": 198,
                    "P 63/m 2/c 2/m": 199,
                    "P 63/m c m": 199,
                    "P 63/m 2/m 2/c": 200,
                    "P 63/m m c": 200,
                    "P 2 3": 201,
                    "F 2 3": 202,
                    "I 2 3": 203,
                    "P 21 3": 204,
                    "I 21 3": 205,
                    "P 2/m -3": 206,
                    "P m -3": 206,
                    "P 2/n -3": 207,
                    "P n -3": 207,
                    "F 2/m -3": 208,
                    "F m -3": 208,
                    "F 2/d -3": 209,
                    "F d -3": 209,
                    "I 2/m -3": 210,
                    "I m -3": 210,
                    "P 21/a -3": 211,
                    "P a -3": 211,
                    "I 21/a -3": 212,
                    "I a -3": 212,
                    "P 4 3 2": 213,
                    "P 42 3 2": 214,
                    "F 4 3 2": 215,
                    "F 41 3 2": 216,
                    "I 4 3 2": 217,
                    "P 43 3 2": 218,
                    "P 41 3 2": 219,
                    "I 41 3 2": 220,
                    "P -4 3 m": 221,
                    "F -4 3 m": 222,
                    "I -4 3 m": 223,
                    "P -4 3 n": 224,
                    "F -4 3 c": 225,
                    "I -4 3 d": 226,
                    "P 4/m -3 2/m": 227,
                    "P m -3 m": 227,
                    "P 4/n -3 2/n": 228,
                    "P n -3 n": 228,
                    "P 42/m -3 2/n": 229,
                    "P m -3 n": 229,
                    "P 42/n -3 2/m": 230,
                    "P n -3 m": 230,
                    "F 4/m -3 2/m": 231,
                    "F m -3 m": 231,
                    "F 4/m -3 2/c": 232,
                    "F m -3 c": 232,
                    "F 41/d -3 2/m": 233,
                    "F d -3 m": 233,
                    "F 41/d -3 2/c": 234,
                    "F d -3 c": 234,
                    "I 4/m -3 2/m": 235,
                    "I m -3 m": 235,
                    "I 41/a -3 2/d": 236,
                    "I a -3 d": 236,
                    "P 1 1 2": 237,
                    "P 1 1 21": 238,
                    "B 1 1 2": 239,
                    "B 2": 239,
                    "A 1 2 1": 240,
                    "C 1 21 1": 241,
                    "I 1 2 1": 242,
                    "I 2": 242,
                    "I 1 21 1": 243,
                    "P 1 1 m": 244,
                    "P 1 1 b": 245,
                    "B 1 1 m": 246,
                    "B 1 1 b": 247,
                    "P 1 1 2/m": 248,
                    "P 1 1 21/m": 249,
                    "B 1 1 2/m": 250,
                    "P 1 1 2/b": 251,
                    "P 1 1 21/b": 252,
                    "B 1 1 2/b": 253,
                    "P 21 2 2": 254,
                    "P 2 21 2": 255,
                    "P 21 21 2 (a)": 256,
                    "P 21 2 21": 257,
                    "P 2 21 21": 258,
                    "C 2 2 21a)": 259,
                    "C 2 2 2a": 260,
                    "F 2 2 2a": 261,
                    "I 2 2 2a": 262,
                    "P 21/m 21/m 2/n a": 263,
                    "P 42 21 2a": 264,
                    "I 2 3a": 265,
                };
            })(SpacegroupTables = Structure.SpacegroupTables || (Structure.SpacegroupTables = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            'use strict';
            var DataTable = Core.Utils.DataTable;
            var SymmetryHelpers;
            (function (SymmetryHelpers) {
                var Mat4 = Core.Geometry.LinearAlgebra.Matrix4;
                var Vec3 = Core.Geometry.LinearAlgebra.Vector3;
                function getBoudingSphere(arrays, indices) {
                    var x = arrays.x, y = arrays.y, z = arrays.z;
                    var center = Vec3.zero();
                    for (var _i = 0, indices_3 = indices; _i < indices_3.length; _i++) {
                        var aI = indices_3[_i];
                        center[0] += x[aI];
                        center[1] += y[aI];
                        center[2] += z[aI];
                    }
                    var count = indices.length > 0 ? indices.length : 1;
                    center[0] /= count;
                    center[1] /= count;
                    center[2] /= count;
                    var r = 0;
                    for (var _a = 0, indices_4 = indices; _a < indices_4.length; _a++) {
                        var aI = indices_4[_a];
                        r = Math.max(indexedVectorDistSq(aI, center, arrays), r);
                    }
                    return { center: center, radius: Math.sqrt(r) };
                }
                function getSphereDist(c, r, q) {
                    return Vec3.distance(c, q.center) - (r + q.radius);
                }
                function isWithinRadius(bounds, i, data, t, r, v) {
                    v[0] = data.x[i];
                    v[1] = data.y[i];
                    v[2] = data.z[i];
                    Vec3.transformMat4(v, v, t);
                    return getSphereDist(v, data.r[i], bounds) <= r;
                }
                function indexedDistSq(aI, cI, arrays) {
                    var dx = arrays.x[aI] - arrays.cX[cI], dy = arrays.y[aI] - arrays.cY[cI], dz = arrays.z[aI] - arrays.cZ[cI];
                    return dx * dx + dy * dy + dz * dz;
                }
                function indexedVectorDistSq(aI, v, arrays) {
                    var dx = arrays.x[aI] - v[0], dy = arrays.y[aI] - v[1], dz = arrays.z[aI] - v[2];
                    return dx * dx + dy * dy + dz * dz;
                }
                function createSymmetryContext(model, boundingInfo, spacegroup, radius) {
                    return {
                        model: model,
                        boundingInfo: boundingInfo,
                        spacegroup: spacegroup,
                        radius: radius,
                        transform: Mat4.zero(),
                        transformed: Vec3.zero(),
                        i: 0, j: 0, k: 0, op: 0
                    };
                }
                function symmetryContextMap(ctx, p) {
                    return Vec3.transformMat4(ctx.transformed, p, ctx.transform);
                }
                function symmetryContextGetTransform(ctx) {
                    return createSymmetryTransform(ctx.i, ctx.j, ctx.k, ctx.op, Mat4.clone(ctx.transform));
                }
                function createSymmetryTransform(i, j, k, opIndex, transform) {
                    return {
                        isIdentity: !i && !j && !k && !opIndex,
                        id: opIndex + 1 + "_" + (5 + i) + (5 + j) + (5 + k),
                        transform: transform
                    };
                }
                function createAssemblyTransform(i, transform) {
                    var isIdentity = true;
                    for (var i_1 = 0; i_1 < 4; i_1++) {
                        for (var j = 0; j < 4; j++) {
                            var v = transform[4 * j + i_1];
                            if (i_1 === j) {
                                if (Math.abs(v - 1) > 0.0000001) {
                                    isIdentity = false;
                                    break;
                                }
                            }
                            else if (Math.abs(v) > 0.0000001) {
                                isIdentity = false;
                                break;
                            }
                        }
                        if (!isIdentity)
                            break;
                    }
                    return {
                        isIdentity: isIdentity,
                        id: i.toString(),
                        transform: transform
                    };
                }
                function getBoundingInfo(model, pivotIndices) {
                    var atoms = model.data.atoms, residues = model.data.residues, chains = model.data.chains, entities = model.data.entities, _a = model.positions, x = _a.x, y = _a.y, z = _a.z;
                    var entityTable = DataTable.builder(entities.count), eX = entityTable.addColumn('x', function (s) { return new Float64Array(s); }), eY = entityTable.addColumn('y', function (s) { return new Float64Array(s); }), eZ = entityTable.addColumn('z', function (s) { return new Float64Array(s); }), eR = entityTable.addColumn('r', function (s) { return new Float64Array(s); }), chainTable = DataTable.builder(chains.count), cX = chainTable.addColumn('x', function (s) { return new Float64Array(s); }), cY = chainTable.addColumn('y', function (s) { return new Float64Array(s); }), cZ = chainTable.addColumn('z', function (s) { return new Float64Array(s); }), cR = chainTable.addColumn('r', function (s) { return new Float64Array(s); }), residueTable = DataTable.builder(residues.count), rX = residueTable.addColumn('x', function (s) { return new Float64Array(s); }), rY = residueTable.addColumn('y', function (s) { return new Float64Array(s); }), rZ = residueTable.addColumn('z', function (s) { return new Float64Array(s); }), rR = residueTable.addColumn('r', function (s) { return new Float64Array(s); });
                    var allCenter = Vec3.zero(), allRadius = 0, pivotCenter = Vec3.zero(), pivotRadius = 0, n = 0, eCenter = Vec3.zero(), eRadius = 0, cCenter = Vec3.zero(), cRadius = 0, rCenter = Vec3.zero(), rRadius = 0;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        Vec3.set(eCenter, 0, 0, 0);
                        for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                            Vec3.set(cCenter, 0, 0, 0);
                            for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                Vec3.set(rCenter, 0, 0, 0);
                                for (var aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                                    rCenter[0] += x[aI];
                                    rCenter[1] += y[aI];
                                    rCenter[2] += z[aI];
                                }
                                Vec3.add(allCenter, allCenter, rCenter);
                                n = residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                                Vec3.add(cCenter, cCenter, rCenter);
                                rX[rI] = rCenter[0] / n;
                                rY[rI] = rCenter[1] / n;
                                rZ[rI] = rCenter[2] / n;
                            }
                            Vec3.add(eCenter, eCenter, cCenter);
                            n = chains.atomEndIndex[cI] - chains.atomStartIndex[cI];
                            cX[cI] = cCenter[0] / n;
                            cY[cI] = cCenter[1] / n;
                            cZ[cI] = cCenter[2] / n;
                        }
                        n = entities.atomEndIndex[eI] - entities.atomStartIndex[eI];
                        eX[eI] = eCenter[0] / n;
                        eY[eI] = eCenter[1] / n;
                        eZ[eI] = eCenter[2] / n;
                    }
                    allCenter[0] /= atoms.count;
                    allCenter[1] /= atoms.count;
                    allCenter[2] /= atoms.count;
                    for (var _i = 0, pivotIndices_1 = pivotIndices; _i < pivotIndices_1.length; _i++) {
                        var aI = pivotIndices_1[_i];
                        pivotCenter[0] += x[aI];
                        pivotCenter[1] += y[aI];
                        pivotCenter[2] += z[aI];
                    }
                    var pivotCount = pivotIndices.length > 0 ? pivotIndices.length : 1;
                    pivotCenter[0] /= pivotCount;
                    pivotCenter[1] /= pivotCount;
                    pivotCenter[2] /= pivotCount;
                    var eDA = { x: x, y: y, z: z, cX: eX, cY: eY, cZ: eZ }, cDA = { x: x, y: y, z: z, cX: cX, cY: cY, cZ: cZ }, rDA = { x: x, y: y, z: z, cX: rX, cY: rY, cZ: rZ };
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        eRadius = 0;
                        for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                            cRadius = 0;
                            for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                rRadius = 0;
                                for (var aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                                    rRadius = Math.max(rRadius, indexedDistSq(aI, rI, rDA));
                                    cRadius = Math.max(cRadius, indexedDistSq(aI, cI, cDA));
                                    eRadius = Math.max(eRadius, indexedDistSq(aI, eI, eDA));
                                    allRadius = Math.max(allRadius, indexedVectorDistSq(aI, allCenter, rDA));
                                }
                                rRadius = Math.sqrt(rRadius);
                                rR[rI] = rRadius;
                            }
                            cRadius = Math.sqrt(cRadius);
                            cR[cI] = cRadius;
                        }
                        eRadius = Math.sqrt(eRadius);
                        eR[eI] = eRadius;
                    }
                    allRadius = Math.sqrt(allRadius);
                    for (var _b = 0, pivotIndices_2 = pivotIndices; _b < pivotIndices_2.length; _b++) {
                        var aI = pivotIndices_2[_b];
                        pivotRadius = Math.max(pivotRadius, indexedVectorDistSq(aI, pivotCenter, rDA));
                    }
                    pivotRadius = Math.sqrt(pivotRadius);
                    return {
                        entities: entityTable.seal(),
                        chains: chainTable.seal(),
                        residues: residueTable.seal(),
                        allAtoms: { center: allCenter, radius: allRadius },
                        target: { center: pivotCenter, radius: pivotRadius }
                    };
                }
                function findSuitableTransforms(ctx) {
                    var bounds = ctx.boundingInfo, sg = ctx.spacegroup;
                    var ret = [];
                    ctx.transform = Mat4.identity();
                    ret[0] = symmetryContextGetTransform(ctx);
                    for (var i = -3; i <= 3; i++) {
                        for (var j = -3; j <= 3; j++) {
                            for (var k = -3; k <= 3; k++) {
                                for (var l = (i === 0 && j === 0 && k === 0 ? 1 : 0), lm = sg.operatorCount; l < lm; l++) {
                                    sg.getOperatorMatrix(l, i, j, k, ctx.transform);
                                    ctx.i = i;
                                    ctx.k = k;
                                    ctx.j = j;
                                    ctx.op = l;
                                    var t = symmetryContextMap(ctx, bounds.allAtoms.center), d = getSphereDist(t, bounds.allAtoms.radius, bounds.target);
                                    if (d < ctx.radius) {
                                        ret[ret.length] = symmetryContextGetTransform(ctx);
                                    }
                                }
                            }
                        }
                    }
                    return ret;
                }
                function getSymmetryResidues(ctx, transforms) {
                    var bounds = ctx.boundingInfo, radius = ctx.radius, targetBounds = bounds.target;
                    var model = ctx.model, residues = model.data.residues, chains = model.data.chains, entities = model.data.entities;
                    var residueIndices = Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, residues.count, 1), operatorIndices = Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, residues.count, 1);
                    var v = Vec3.zero(), opIndex = 0;
                    var atomCount = 0, chainCount = 0, entityCount = 0;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        opIndex = 0;
                        var chainAdded = false;
                        for (var _i = 0, transforms_1 = transforms; _i < transforms_1.length; _i++) {
                            var t = transforms_1[_i];
                            for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                                if (!isWithinRadius(targetBounds, cI, bounds.chains, t.transform, radius, v))
                                    continue;
                                var residueAdded = false;
                                for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                    if (!isWithinRadius(targetBounds, rI, bounds.residues, t.transform, radius, v))
                                        continue;
                                    Core.Utils.ChunkedArray.add(residueIndices, rI);
                                    Core.Utils.ChunkedArray.add(operatorIndices, opIndex);
                                    atomCount += residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                                    residueAdded = true;
                                }
                                if (residueAdded) {
                                    chainCount += 1;
                                    chainAdded = true;
                                }
                            }
                            opIndex++;
                        }
                        if (chainAdded) {
                            entityCount++;
                        }
                    }
                    return {
                        residues: Core.Utils.ChunkedArray.compact(residueIndices),
                        operators: Core.Utils.ChunkedArray.compact(operatorIndices),
                        atomCount: atomCount,
                        chainCount: chainCount,
                        entityCount: entityCount
                    };
                }
                function cloneRow(src, sI, target, tI, c) {
                    for (var i = 0; i < c; i++) {
                        target[i][tI] = src[i][sI];
                    }
                }
                function assemble(model, assemblyParts, transforms) {
                    var residues = model.data.residues, residueChainIndex = residues.chainIndex, residueEntityIndex = residues.entityIndex, residueAtomStartIndex = residues.atomStartIndex, residueAtomEndIndex = residues.atomEndIndex, atoms = model.data.atoms, _a = model.positions, x = _a.x, y = _a.y, z = _a.z;
                    var atomTable = DataTable.builder(assemblyParts.atomCount), atomId, atomResidue, atomChain, atomEntity, cols = [];
                    var positionTable = DataTable.ofDefinition(Structure.Tables.Positions, assemblyParts.atomCount), atomX = positionTable.x, atomY = positionTable.y, atomZ = positionTable.z;
                    var entityTableBuilder = model.data.entities.getBuilder(assemblyParts.entityCount), entityTable = entityTableBuilder, srcEntityData = model.data.entities.getRawData(), entityData = entityTable.getRawData(), entityChainStart = entityTable.chainStartIndex, entityChainEnd = entityTable.chainEndIndex, entityResidueStart = entityTable.residueStartIndex, entityResidueEnd = entityTable.residueEndIndex, entityAtomStart = entityTable.atomStartIndex, entityAtomEnd = entityTable.atomEndIndex, entityOffset = 0;
                    var chainTableBuilder = model.data.chains.getBuilder(assemblyParts.chainCount), chainTable = chainTableBuilder, srcChainData = model.data.chains.getRawData(), chainData = chainTable.getRawData(), chainResidueStart = chainTable.residueStartIndex, chainResidueEnd = chainTable.residueEndIndex, chainAtomStart = chainTable.atomStartIndex, chainAtomEnd = chainTable.atomEndIndex, chainId = chainTable.asymId, chainAuthId = chainTable.authAsymId, chainEntity = chainTable.entityIndex, chainSourceChainIndex = chainTableBuilder.addColumn('sourceChainIndex', function (s) { return new Int32Array(s); }), chainOperatorIndex = chainTableBuilder.addColumn('operatorIndex', function (s) { return new Int32Array(s); }), chainOffset = 0;
                    var residueTableBuilder = model.data.residues.getBuilder(assemblyParts.residues.length), residueTable = residueTableBuilder, srcResidueData = model.data.residues.getRawData(), residueData = residueTable.getRawData(), residueAtomStart = residueTable.atomStartIndex, residueAtomEnd = residueTable.atomEndIndex, residueAsymId = residueTable.asymId, residueAuthAsymId = residueTable.authAsymId, residueChain = residueTable.chainIndex, residueEntity = residueTable.entityIndex;
                    for (var _i = 0, _b = model.data.atoms.columns; _i < _b.length; _i++) {
                        var col = _b[_i];
                        var c = atomTable.addColumn(col.name, col.creator);
                        if (col.name === 'residueIndex')
                            atomResidue = c;
                        else if (col.name === 'chainIndex')
                            atomChain = c;
                        else if (col.name === 'entityIndex')
                            atomEntity = c;
                        else if (col.name === 'id')
                            atomId = c;
                        else {
                            cols[cols.length] = {
                                src: atoms[col.name],
                                target: c
                            };
                        }
                    }
                    var assemblyResidueParts = assemblyParts.residues, assemblyOpParts = assemblyParts.operators, temp = Core.Geometry.LinearAlgebra.Vector3.zero(), atomOffset = 0;
                    var rI = assemblyResidueParts[0], currentChain = residueChainIndex[rI], currentEntity = residueEntityIndex[rI], currentOp = assemblyOpParts[0], currentAsymId, currentAuthAsymId;
                    // setup entity table
                    cloneRow(srcEntityData, residueEntityIndex[rI], entityData, 0, srcEntityData.length);
                    entityChainStart[0] = 0;
                    entityResidueStart[0] = 0;
                    entityAtomStart[0] = 0;
                    //setup chain table
                    cloneRow(srcChainData, residueChainIndex[rI], chainData, 0, srcChainData.length);
                    chainEntity[0] = 0;
                    chainResidueStart[0] = 0;
                    chainAtomStart[0] = 0;
                    currentAsymId = model.data.chains.asymId[residueChainIndex[rI]];
                    currentAuthAsymId = model.data.chains.authAsymId[residueChainIndex[rI]];
                    var transform = transforms[assemblyOpParts[0]];
                    if (transform && !transform.isIdentity) {
                        chainId[chainOffset] = model.data.chains.asymId[residueChainIndex[rI]] + '-' + transform.id;
                        chainAuthId[chainOffset] = model.data.chains.authAsymId[residueChainIndex[rI]] + '-' + transform.id;
                        chainSourceChainIndex[chainOffset] = residueChainIndex[rI];
                        chainOperatorIndex[chainOffset] = currentOp;
                        currentAsymId = chainId[chainOffset];
                        currentAuthAsymId = chainAuthId[chainOffset];
                    }
                    for (var residueOffset = 0, _mi = assemblyResidueParts.length; residueOffset < _mi; residueOffset++) {
                        rI = assemblyResidueParts[residueOffset];
                        var opI = assemblyOpParts[residueOffset];
                        transform = transforms[opI];
                        cloneRow(srcResidueData, rI, residueData, residueOffset, residueData.length);
                        var cE = residueEntityIndex[rI], cC = residueChainIndex[rI];
                        var chainChanged = false;
                        if (cE !== currentEntity) {
                            // update chain
                            chainResidueEnd[chainOffset] = residueOffset;
                            chainAtomEnd[chainOffset] = atomOffset;
                            chainOffset += 1;
                            // update entity
                            entityChainEnd[entityOffset] = chainOffset;
                            entityResidueEnd[entityOffset] = residueOffset;
                            entityAtomEnd[entityOffset] = atomOffset;
                            // new entity
                            entityOffset += 1;
                            cloneRow(srcEntityData, cE, entityData, entityOffset, srcEntityData.length);
                            entityChainStart[entityOffset] = chainOffset;
                            entityResidueStart[entityOffset] = residueOffset;
                            entityAtomStart[entityOffset] = atomOffset;
                            chainChanged = true;
                        }
                        else if (cC !== currentChain) {
                            // update chain
                            chainResidueEnd[chainOffset] = residueOffset;
                            chainAtomEnd[chainOffset] = atomOffset;
                            chainOffset += 1;
                            chainChanged = true;
                        }
                        else if (opI !== currentOp) {
                            // update chain
                            chainResidueEnd[chainOffset] = residueOffset;
                            chainAtomEnd[chainOffset] = atomOffset;
                            chainOffset += 1;
                            chainChanged = true;
                        }
                        if (chainChanged) {
                            // new chain
                            cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                            chainEntity[chainOffset] = entityOffset;
                            chainResidueStart[chainOffset] = residueOffset;
                            chainAtomStart[chainOffset] = atomOffset;
                            // update the chain identifier if needed
                            if (!transform.isIdentity) {
                                chainId[chainOffset] = model.data.chains.asymId[cC] + '-' + transform.id;
                                chainAuthId[chainOffset] = model.data.chains.authAsymId[cC] + '-' + transform.id;
                            }
                            chainSourceChainIndex[chainOffset] = cC;
                            chainOperatorIndex[chainOffset] = opI;
                            currentAsymId = chainId[chainOffset];
                            currentAuthAsymId = chainAuthId[chainOffset];
                        }
                        currentChain = cC;
                        currentEntity = cE;
                        currentOp = opI;
                        residueChain[residueOffset] = chainOffset;
                        residueEntity[residueOffset] = entityOffset;
                        residueAtomStart[residueOffset] = atomOffset;
                        residueAsymId[residueOffset] = currentAsymId;
                        residueAuthAsymId[residueOffset] = currentAuthAsymId;
                        for (var aI = residueAtomStartIndex[rI], _mAI = residueAtomEndIndex[rI]; aI < _mAI; aI++) {
                            Vec3.set(temp, x[aI], y[aI], z[aI]);
                            Vec3.transformMat4(temp, temp, transform.transform);
                            atomX[atomOffset] = temp[0];
                            atomY[atomOffset] = temp[1];
                            atomZ[atomOffset] = temp[2];
                            atomId[atomOffset] = atomOffset + 1;
                            atomResidue[atomOffset] = residueOffset;
                            atomChain[atomOffset] = chainOffset;
                            atomEntity[atomOffset] = entityOffset;
                            for (var _c = 0, cols_1 = cols; _c < cols_1.length; _c++) {
                                var c = cols_1[_c];
                                c.target[atomOffset] = c.src[aI];
                            }
                            atomOffset++;
                        }
                        residueAtomEnd[residueOffset] = atomOffset;
                    }
                    // finalize entity
                    entityChainEnd[entityOffset] = chainOffset + 1;
                    entityResidueEnd[entityOffset] = assemblyResidueParts.length;
                    entityAtomEnd[entityOffset] = atomOffset;
                    // finalize chain
                    chainResidueEnd[chainOffset] = assemblyResidueParts.length;
                    chainAtomEnd[chainOffset] = atomOffset;
                    var finalAtoms = atomTable.seal(), finalResidues = residueTableBuilder.seal(), finalChains = chainTableBuilder.seal(), finalEntities = entityTableBuilder.seal();
                    var secondaryStructure = buildSS(model, assemblyParts, finalResidues);
                    var structConn = model.data.bonds.structConn
                        ? buildStructConn(model.data.bonds.structConn, transforms, assemblyParts.residues, assemblyParts.operators, model.data.residues, finalResidues)
                        : void 0;
                    return Structure.Molecule.Model.create({
                        id: model.id,
                        modelId: model.modelId,
                        data: {
                            atoms: finalAtoms,
                            residues: finalResidues,
                            chains: finalChains,
                            entities: finalEntities,
                            bonds: {
                                structConn: structConn,
                                component: model.data.bonds.component
                            },
                            secondaryStructure: secondaryStructure
                        },
                        positions: positionTable,
                        parent: model,
                        source: Structure.Molecule.Model.Source.Computed,
                        operators: transforms.map(function (t) { return new Structure.Operator(t.transform, t.id, t.isIdentity); })
                    });
                }
                function buildStructConn(structConn, ops, residueParts, residueOpParts, oldResidues, newResidues) {
                    var entries = structConn.entries;
                    var opsMap = Core.Utils.FastMap.create();
                    for (var i = 0, __i = ops.length; i < __i; i++) {
                        opsMap.set(ops[i].id, i);
                    }
                    var transformMap = Core.Utils.FastMap.create();
                    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        var e = entries_1[_i];
                        for (var _a = 0, _b = e.partners; _a < _b.length; _a++) {
                            var p = _b[_a];
                            if (!transformMap.has(p.residueIndex)) {
                                transformMap.set(p.residueIndex, Core.Utils.FastMap.create());
                            }
                        }
                    }
                    for (var i = 0, __i = residueParts.length; i < __i; i++) {
                        var r = residueParts[i];
                        if (!transformMap.has(r))
                            continue;
                        transformMap.get(r).set(residueOpParts[i], i);
                    }
                    var oldStart = oldResidues.atomStartIndex;
                    var newStart = newResidues.atomStartIndex;
                    var ret = [];
                    for (var _c = 0, entries_2 = entries; _c < entries_2.length; _c++) {
                        var e = entries_2[_c];
                        var allId = true;
                        for (var _d = 0, _e = e.partners; _d < _e.length; _d++) {
                            var p = _e[_d];
                            if (p.symmetry !== '1_555') {
                                allId = false;
                                break;
                            }
                        }
                        if (allId) {
                            var _loop_1 = function (opIndex, __oi) {
                                var allMapped = true;
                                for (var _i = 0, _a = e.partners; _i < _a.length; _i++) {
                                    var p = _a[_i];
                                    if (!transformMap.get(p.residueIndex).has(opIndex)) {
                                        allMapped = false;
                                        break;
                                    }
                                }
                                if (!allMapped)
                                    return "continue";
                                ret.push({
                                    bondType: e.bondType,
                                    distance: e.distance,
                                    partners: e.partners.map(function (p) {
                                        var rI = transformMap.get(p.residueIndex).get(opIndex);
                                        return {
                                            residueIndex: rI,
                                            atomIndex: newStart[rI] + (p.atomIndex - oldStart[p.residueIndex]),
                                            symmetry: p.symmetry
                                        };
                                    })
                                });
                            };
                            for (var opIndex = 0, __oi = ops.length; opIndex < __oi; opIndex++) {
                                _loop_1(opIndex, __oi);
                            }
                        }
                        else {
                            var partners = [];
                            for (var _f = 0, _g = e.partners; _f < _g.length; _f++) {
                                var p = _g[_f];
                                if (!opsMap.has(p.symmetry))
                                    break;
                                var op = opsMap.get(p.symmetry);
                                var m = transformMap.get(p.residueIndex);
                                if (!m.has(op))
                                    break;
                                var rI = m.get(op);
                                partners.push({
                                    residueIndex: rI,
                                    atomIndex: newStart[rI] + (p.atomIndex - oldStart[p.residueIndex]),
                                    symmetry: p.symmetry
                                });
                            }
                            if (partners.length === e.partners.length) {
                                ret.push({
                                    bondType: e.bondType,
                                    distance: e.distance,
                                    partners: partners
                                });
                            }
                        }
                    }
                    return new Structure.StructConn(ret);
                }
                function buildSS(parent, assemblyParts, newResidues) {
                    var index = parent.data.residues.secondaryStructureIndex;
                    var ss = parent.data.secondaryStructure;
                    var asymId = newResidues.asymId, seqNumber = newResidues.seqNumber, insCode = newResidues.insCode, secondaryStructureIndex = newResidues.secondaryStructureIndex;
                    var residues = assemblyParts.residues, operators = assemblyParts.operators;
                    var count = residues.length;
                    var ret = [];
                    var start = 0;
                    while (start < count) {
                        var end = start;
                        var ssI = index[residues[start]], op = operators[start];
                        while (end < count && operators[end] == op && index[residues[end]] == ssI)
                            end++;
                        var s = ss[ssI];
                        var e = new Structure.SecondaryStructureElement(s.type, new Structure.PolyResidueIdentifier(asymId[start], seqNumber[start], insCode[start]), new Structure.PolyResidueIdentifier(asymId[end - 1], seqNumber[end - 1], insCode[end - 1]), s.info);
                        e.startResidueIndex = start;
                        e.endResidueIndex = end;
                        var updatedSSI = ret.length;
                        for (var i = start; i < end; i++) {
                            secondaryStructureIndex[i] = updatedSSI;
                        }
                        ret[updatedSSI] = e;
                        start = end;
                    }
                    return ret;
                }
                function buildPivotGroupSymmetry(model, radius, pivotsQuery) {
                    var info = model.data.symmetryInfo;
                    if (!info || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                        return model;
                    }
                    var pivotIndices;
                    if (!pivotsQuery)
                        pivotIndices = model.data.atoms.indices;
                    else
                        pivotIndices = Structure.Query.apply(pivotsQuery, model).unionAtomIndices();
                    var bounds = getBoundingInfo(model, pivotIndices), spacegroup = new Structure.Spacegroup(info), ctx = createSymmetryContext(model, bounds, spacegroup, radius);
                    var transforms = findSuitableTransforms(ctx), residues = getSymmetryResidues(ctx, transforms);
                    return assemble(model, residues, transforms);
                }
                SymmetryHelpers.buildPivotGroupSymmetry = buildPivotGroupSymmetry;
                function findMates(model, radius) {
                    var bounds = getBoudingSphere(model.positions, model.positions.indices);
                    var spacegroup = new Structure.Spacegroup(model.data.symmetryInfo);
                    var t = Mat4.zero();
                    var v = Vec3.zero();
                    var transforms = [];
                    for (var i = -3; i <= 3; i++) {
                        for (var j = -3; j <= 3; j++) {
                            for (var k = -3; k <= 3; k++) {
                                for (var op = 0; op < spacegroup.operatorCount; op++) {
                                    spacegroup.getOperatorMatrix(op, i, j, k, t);
                                    Vec3.transformMat4(v, bounds.center, t);
                                    if (getSphereDist(v, bounds.radius, bounds) > radius)
                                        continue;
                                    var copy = Mat4.zero();
                                    Mat4.copy(copy, t);
                                    transforms.push(createSymmetryTransform(i, j, k, op, copy));
                                }
                            }
                        }
                    }
                    return transforms;
                }
                function findMateParts(model, transforms) {
                    var _a = model.data, atoms = _a.atoms, chains = _a.chains, entities = _a.entities, residues = _a.residues;
                    var residueIndices = Core.Utils.ArrayBuilder.create(function (s) { return new Int32Array(s); }, residues.count * transforms.length, 1), operatorIndices = Core.Utils.ArrayBuilder.create(function (s) { return new Int32Array(s); }, residues.count * transforms.length, 1);
                    var atomCount = transforms.length * atoms.count;
                    var chainCount = transforms.length * chains.count;
                    var entityCount = entities.count;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        for (var opIndex = 0; opIndex < transforms.length; opIndex++) {
                            for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                                for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                    Core.Utils.ArrayBuilder.add(residueIndices, rI);
                                    Core.Utils.ArrayBuilder.add(operatorIndices, opIndex);
                                }
                            }
                        }
                    }
                    return {
                        residues: residueIndices.array,
                        operators: operatorIndices.array,
                        atomCount: atomCount,
                        chainCount: chainCount,
                        entityCount: entityCount
                    };
                }
                function buildMates(model, radius) {
                    var info = model.data.symmetryInfo;
                    if (!info || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                        return model;
                    }
                    var transforms = findMates(model, radius);
                    var parts = findMateParts(model, transforms);
                    return assemble(model, parts, transforms);
                }
                SymmetryHelpers.buildMates = buildMates;
                function createOperators(operators, list, i, current) {
                    if (i < 0) {
                        list[list.length] = current.slice(0);
                        return;
                    }
                    var ops = operators[i], len = ops.length;
                    for (var j = 0; j < len; j++) {
                        current[i] = ops[j];
                        createOperators(operators, list, i - 1, current);
                    }
                }
                function getAssemblyTransforms(model, operators, offset) {
                    var info = model.data.assemblyInfo;
                    var transforms = [];
                    var index = offset;
                    for (var _i = 0, operators_1 = operators; _i < operators_1.length; _i++) {
                        var op = operators_1[_i];
                        var m = Mat4.identity();
                        for (var i = 0; i < op.length; i++) {
                            Mat4.mul(m, m, info.operators[op[i]].operator);
                        }
                        index++;
                        transforms[transforms.length] = createAssemblyTransform(index, m);
                    }
                    return transforms;
                }
                function getAssemblyParts(model, residueMask, currentTransforms, state, transformOffset) {
                    var _a = model.data, chains = _a.chains, entities = _a.entities, residues = _a.residues;
                    var residueIndices = state.residueIndices, operatorIndices = state.operatorIndices;
                    var atomCount = 0, chainCount = 0, entityCount = 0;
                    for (var eI = 0, _eC = entities.count; eI < _eC; eI++) {
                        var opIndex = transformOffset;
                        var chainAdded = false;
                        for (var _i = 0, currentTransforms_1 = currentTransforms; _i < currentTransforms_1.length; _i++) {
                            var _ = currentTransforms_1[_i];
                            for (var cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                                var residueAdded = false;
                                for (var rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                                    if (!residueMask[rI])
                                        continue;
                                    Core.Utils.ChunkedArray.add(residueIndices, rI);
                                    Core.Utils.ChunkedArray.add(operatorIndices, opIndex);
                                    atomCount += residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                                    residueAdded = true;
                                }
                                if (residueAdded) {
                                    chainCount += 1;
                                    chainAdded = true;
                                }
                            }
                            opIndex++;
                        }
                        if (chainAdded) {
                            entityCount++;
                        }
                    }
                    state.atomCount += atomCount;
                    state.chainCount += chainCount;
                    state.entityCount += entityCount;
                }
                function buildAssemblyEntry(model, entry, state) {
                    var _a;
                    var ops = [], currentOp = [];
                    for (var i_2 = 0; i_2 < entry.operators.length; i_2++)
                        currentOp[i_2] = '';
                    createOperators(entry.operators, ops, entry.operators.length - 1, currentOp);
                    var transformOffset = state.transforms.length;
                    var transforms = getAssemblyTransforms(model, ops, state.transforms.length);
                    (_a = state.transforms).push.apply(_a, transforms);
                    var asymIds = Core.Utils.FastSet.create();
                    entry.asymIds.forEach(function (id) { return asymIds.add(id); });
                    var residueAsymIds = model.data.residues.asymId;
                    var residueCount = model.data.residues.count;
                    var mask = state.mask;
                    for (var i = 0; i < residueCount; i++) {
                        mask[i] = asymIds.has(residueAsymIds[i]);
                    }
                    getAssemblyParts(model, mask, transforms, state, transformOffset);
                }
                SymmetryHelpers.buildAssemblyEntry = buildAssemblyEntry;
                function buildAssembly(model, assembly) {
                    var state = {
                        atomCount: 0,
                        chainCount: 0,
                        entityCount: 0,
                        transforms: [],
                        mask: new Int8Array(model.data.residues.count),
                        residueIndices: Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, model.data.residues.count, 1),
                        operatorIndices: Core.Utils.ChunkedArray.create(function (s) { return new Int32Array(s); }, model.data.residues.count, 1)
                    };
                    for (var _i = 0, _a = assembly.gens; _i < _a.length; _i++) {
                        var a = _a[_i];
                        buildAssemblyEntry(model, a, state);
                    }
                    var parts = {
                        residues: Core.Utils.ChunkedArray.compact(state.residueIndices),
                        operators: Core.Utils.ChunkedArray.compact(state.operatorIndices),
                        atomCount: state.atomCount,
                        chainCount: state.chainCount,
                        entityCount: state.entityCount
                    };
                    return assemble(model, parts, state.transforms);
                }
                SymmetryHelpers.buildAssembly = buildAssembly;
            })(SymmetryHelpers || (SymmetryHelpers = {}));
            function buildPivotGroupSymmetry(model, radius, pivotsQuery) {
                return SymmetryHelpers.buildPivotGroupSymmetry(model, radius, pivotsQuery);
            }
            Structure.buildPivotGroupSymmetry = buildPivotGroupSymmetry;
            function buildSymmetryMates(model, radius) {
                return SymmetryHelpers.buildMates(model, radius);
            }
            Structure.buildSymmetryMates = buildSymmetryMates;
            function buildAssembly(model, assembly) {
                return SymmetryHelpers.buildAssembly(model, assembly);
            }
            Structure.buildAssembly = buildAssembly;
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            var Query;
            (function (Query) {
                function apply(q, m) {
                    return Query.Builder.toQuery(q)(m.queryContext);
                }
                Query.apply = apply;
                /**
                 * The context of a query.
                 *
                 * Stores:
                 * - the mask of "active" atoms.
                 * - kd-tree for fast geometry queries.
                 * - the molecule itself.
                 *
                 */
                var Context = /** @class */ (function () {
                    function Context(structure, mask) {
                        this.mask = mask;
                        this.structure = structure;
                    }
                    Object.defineProperty(Context.prototype, "atomCount", {
                        /**
                         * Number of atoms in the current context.
                         */
                        get: function () {
                            return this.mask.size;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Context.prototype, "isComplete", {
                        /**
                         * Determine if the context contains all atoms of the input model.
                         */
                        get: function () {
                            return this.mask.size === this.structure.data.atoms.count;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Context.prototype, "lookup3d", {
                        /**
                         * Get a 3d loopup structure for the atoms in the current context.
                         */
                        get: function () {
                            if (!this.lazyLoopup3d)
                                this.makeLookup3d();
                            return this.lazyLoopup3d;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    /**
                     * Checks if an atom is included in the current context.
                     */
                    Context.prototype.hasAtom = function (index) {
                        return !!this.mask.has(index);
                    };
                    /**
                     * Checks if an atom from the range is included in the current context.
                     */
                    Context.prototype.hasRange = function (start, end) {
                        for (var i = start; i < end; i++) {
                            if (this.mask.has(i))
                                return true;
                        }
                        return false;
                    };
                    /**
                     * Create a new context based on the provide structure.
                     */
                    Context.ofStructure = function (structure) {
                        return new Context(structure, Core.Utils.Mask.ofStructure(structure));
                    };
                    /**
                     * Create a new context from a sequence of fragments.
                     */
                    Context.ofFragments = function (seq) {
                        return new Context(seq.context.structure, Core.Utils.Mask.ofFragments(seq));
                    };
                    /**
                     * Create a new context from a sequence of fragments.
                     */
                    Context.ofAtomIndices = function (structure, atomIndices) {
                        return new Context(structure, Core.Utils.Mask.ofIndices(structure.data.atoms.count, atomIndices));
                    };
                    Context.prototype.makeLookup3d = function () {
                        var data = new Int32Array(this.mask.size), dataCount = 0, _a = this.structure.positions, x = _a.x, y = _a.y, z = _a.z;
                        for (var i = 0, _b = this.structure.positions.count; i < _b; i++) {
                            if (this.mask.has(i))
                                data[dataCount++] = i;
                        }
                        var inputData = Core.Geometry.Query3D.createInputData(data, function (i, add) { return add(x[i], y[i], z[i]); });
                        this.lazyLoopup3d = Core.Geometry.Query3D.createSpatialHash(inputData);
                    };
                    return Context;
                }());
                Query.Context = Context;
                /**
                 * The basic element of the query language.
                 * Everything is represented as a fragment.
                 */
                var Fragment = /** @class */ (function () {
                    /**
                     * Create a fragment from an integer set.
                     */
                    function Fragment(context, tag, atomIndices) {
                        this._hashCode = 0;
                        this._hashComputed = false;
                        this.context = context;
                        this.tag = tag;
                        this.atomIndices = atomIndices;
                    }
                    Object.defineProperty(Fragment.prototype, "hashCode", {
                        /**
                         * The hash code of the fragment.
                         */
                        get: function () {
                            if (this._hashComputed)
                                return this._hashCode;
                            var code = 23;
                            for (var _i = 0, _a = this.atomIndices; _i < _a.length; _i++) {
                                var i = _a[_i];
                                code = (31 * code + i) | 0;
                            }
                            this._hashCode = code;
                            this._hashComputed = true;
                            return code;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "id", {
                        /**
                         * Id composed of <moleculeid>_<tag>.
                         */
                        get: function () {
                            return this.context.structure.id + "_" + this.tag;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "atomCount", {
                        /**
                         * Number of atoms.
                         */
                        get: function () {
                            return this.atomIndices.length;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "isHet", {
                        /**
                         * Determines if a fragment is HET based on the tag.
                         */
                        get: function () {
                            var residue = this.context.structure.data.atoms.residueIndex[this.tag];
                            return this.context.structure.data.residues.isHet[residue];
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "fingerprint", {
                        /**
                         * A sorted list of residue identifiers.
                         */
                        get: function () {
                            if (this._fingerprint)
                                return this._fingerprint;
                            var indexList = this.residueIndices, residues = this.context.structure.data.residues, cName = residues.name, cAsym = residues.asymId, cSeq = residues.seqNumber, insCode = residues.insCode, names = [];
                            for (var _i = 0, indexList_1 = indexList; _i < indexList_1.length; _i++) {
                                var i = indexList_1[_i];
                                var name_1 = cName[i] + " " + cAsym[i] + " " + cSeq[i];
                                if (insCode[i])
                                    name_1 += " i:" + insCode[i];
                                names[names.length] = name_1;
                            }
                            return names.join("-");
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "authFingerprint", {
                        /**
                         * A sorted list of residue identifiers.
                         */
                        get: function () {
                            if (this._authFingerprint)
                                return this._authFingerprint;
                            var indexList = this.residueIndices, residues = this.context.structure.data.residues, cName = residues.authName, cAsym = residues.authAsymId, cSeq = residues.authSeqNumber, insCode = residues.insCode, names = [];
                            for (var _i = 0, indexList_2 = indexList; _i < indexList_2.length; _i++) {
                                var i = indexList_2[_i];
                                var name_2 = cName[i] + " " + cAsym[i] + " " + cSeq[i];
                                if (insCode[i])
                                    name_2 += " i:" + insCode[i];
                                names[names.length] = name_2;
                            }
                            return names.join("-");
                        },
                        enumerable: true,
                        configurable: true
                    });
                    /**
                     * Executes a query on the current fragment.
                     */
                    Fragment.prototype.find = function (what) {
                        var ctx = Context.ofFragments(new FragmentSeq(this.context, [this]));
                        return Query.Builder.toQuery(what)(ctx);
                    };
                    Fragment.prototype.computeIndices = function () {
                        if (this._residueIndices)
                            return;
                        var residueIndices = Core.Utils.FastSet.create(), chainIndices = Core.Utils.FastSet.create(), entityIndices = Core.Utils.FastSet.create(), rIndices = this.context.structure.data.atoms.residueIndex, cIndices = this.context.structure.data.residues.chainIndex, eIndices = this.context.structure.data.chains.entityIndex;
                        for (var _i = 0, _a = this.atomIndices; _i < _a.length; _i++) {
                            var i = _a[_i];
                            residueIndices.add(rIndices[i]);
                        }
                        this._residueIndices = Core.Utils.integerSetToSortedTypedArray(residueIndices);
                        for (var _c = 0, _d = this._residueIndices; _c < _d.length; _c++) {
                            var i = _d[_c];
                            chainIndices.add(cIndices[i]);
                        }
                        this._chainIndices = Core.Utils.integerSetToSortedTypedArray(chainIndices);
                        for (var _e = 0, _f = this._chainIndices; _e < _f.length; _e++) {
                            var i = _f[_e];
                            entityIndices.add(eIndices[i]);
                        }
                        this._entityIndices = Core.Utils.integerSetToSortedTypedArray(entityIndices);
                    };
                    Object.defineProperty(Fragment.prototype, "residueIndices", {
                        /**
                         * A sorted list of residue indices.
                         */
                        get: function () {
                            this.computeIndices();
                            return this._residueIndices;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "chainIndices", {
                        /**
                         * A sorted list of chain indices.
                         */
                        get: function () {
                            this.computeIndices();
                            return this._chainIndices;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(Fragment.prototype, "entityIndices", {
                        /**
                         * A sorted list of entity indices.
                         */
                        get: function () {
                            this.computeIndices();
                            return this._entityIndices;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Fragment.areEqual = function (a, b) {
                        if (a.atomCount !== b.atomCount)
                            return false;
                        var xs = a.atomIndices, ys = b.atomIndices;
                        for (var i = 0; i < xs.length; i++) {
                            if (xs[i] !== ys[i])
                                return false;
                        }
                        return a.tag === b.tag;
                    };
                    /**
                     * Create a fragment from an integer set.
                     * Assumes the set is in the given context's mask.
                     */
                    Fragment.ofSet = function (context, atomIndices) {
                        var array = new Int32Array(atomIndices.size);
                        atomIndices.forEach(function (i, ctx) { ctx.array[ctx.index++] = i; }, { array: array, index: 0 });
                        Array.prototype.sort.call(array, function (a, b) { return a - b; });
                        return new Fragment(context, array[0], array);
                    };
                    /**
                     * Create a fragment from an integer array.
                     * Assumes the set is in the given context's mask.
                     * Assumes the array is sorted.
                     */
                    Fragment.ofArray = function (context, tag, atomIndices) {
                        return new Fragment(context, tag, atomIndices);
                    };
                    /**
                     * Create a fragment from a single index.
                     * Assumes the index is in the given context's mask.
                     */
                    Fragment.ofIndex = function (context, index) {
                        var indices = new Int32Array(1);
                        indices[0] = index;
                        return new Fragment(context, index, indices);
                    };
                    /**
                     * Create a fragment from a <start,end) range.
                     * Assumes the fragment is non-empty in the given context's mask.
                     */
                    Fragment.ofIndexRange = function (context, start, endExclusive) {
                        var count = 0;
                        for (var i = start; i < endExclusive; i++) {
                            if (context.hasAtom(i))
                                count++;
                        }
                        var atoms = new Int32Array(count), offset = 0;
                        for (var i = start; i < endExclusive; i++) {
                            if (context.hasAtom(i))
                                atoms[offset++] = i;
                        }
                        return new Fragment(context, start, atoms);
                    };
                    return Fragment;
                }());
                Query.Fragment = Fragment;
                /**
                 * A sequence of fragments the queries operate on.
                 */
                var FragmentSeq = /** @class */ (function () {
                    function FragmentSeq(context, fragments) {
                        this.context = context;
                        this.fragments = fragments;
                    }
                    FragmentSeq.empty = function (ctx) {
                        return new FragmentSeq(ctx, []);
                    };
                    Object.defineProperty(FragmentSeq.prototype, "length", {
                        get: function () {
                            return this.fragments.length;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    /**
                     * Merges atom indices from all fragments.
                     */
                    FragmentSeq.prototype.unionAtomIndices = function () {
                        if (!this.length)
                            return [];
                        if (this.length === 1)
                            return this.fragments[0].atomIndices;
                        var map = new Int8Array(this.context.structure.data.atoms.count), atomCount = 0;
                        for (var _i = 0, _a = this.fragments; _i < _a.length; _i++) {
                            var f = _a[_i];
                            for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                                var i = _d[_c];
                                map[i] = 1;
                            }
                        }
                        for (var _e = 0, map_1 = map; _e < map_1.length; _e++) {
                            var i = map_1[_e];
                            atomCount += i;
                        }
                        var ret = new Int32Array(atomCount), offset = 0;
                        for (var i = 0, _l = map.length; i < _l; i++) {
                            if (map[i])
                                ret[offset++] = i;
                        }
                        return ret;
                    };
                    /**
                     * Merges atom indices from all fragments into a single fragment.
                     */
                    FragmentSeq.prototype.unionFragment = function () {
                        if (!this.length)
                            return new Fragment(this.context, 0, new Int32Array(0));
                        if (this.length === 1)
                            return this.fragments[0];
                        var union = this.unionAtomIndices();
                        return new Fragment(this.context, union[0], union);
                    };
                    return FragmentSeq;
                }());
                Query.FragmentSeq = FragmentSeq;
                /**
                 * A builder that includes all fragments.
                 */
                var FragmentSeqBuilder = /** @class */ (function () {
                    function FragmentSeqBuilder(ctx) {
                        this.ctx = ctx;
                        this.fragments = [];
                    }
                    FragmentSeqBuilder.prototype.add = function (f) {
                        this.fragments[this.fragments.length] = f;
                    };
                    FragmentSeqBuilder.prototype.getSeq = function () {
                        return new FragmentSeq(this.ctx, this.fragments);
                    };
                    return FragmentSeqBuilder;
                }());
                Query.FragmentSeqBuilder = FragmentSeqBuilder;
                /**
                 * A builder that includes only unique fragments.
                 */
                var HashFragmentSeqBuilder = /** @class */ (function () {
                    function HashFragmentSeqBuilder(ctx) {
                        this.ctx = ctx;
                        this.fragments = [];
                        this.byHash = Core.Utils.FastMap.create();
                    }
                    HashFragmentSeqBuilder.prototype.add = function (f) {
                        var hash = f.hashCode;
                        if (this.byHash.has(hash)) {
                            var fs = this.byHash.get(hash);
                            for (var _i = 0, fs_1 = fs; _i < fs_1.length; _i++) {
                                var q = fs_1[_i];
                                if (Fragment.areEqual(f, q))
                                    return this;
                            }
                            this.fragments[this.fragments.length] = f;
                            fs[fs.length] = f;
                        }
                        else {
                            this.fragments[this.fragments.length] = f;
                            this.byHash.set(hash, [f]);
                        }
                        return this;
                    };
                    HashFragmentSeqBuilder.prototype.getSeq = function () {
                        return new FragmentSeq(this.ctx, this.fragments);
                    };
                    return HashFragmentSeqBuilder;
                }());
                Query.HashFragmentSeqBuilder = HashFragmentSeqBuilder;
            })(Query = Structure.Query || (Structure.Query = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            var Query;
            (function (Query) {
                var Builder;
                (function (Builder) {
                    Builder.BuilderPrototype = {};
                    function registerModifier(name, f) {
                        Builder.BuilderPrototype[name] = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return f.call.apply(f, [void 0, this].concat(args));
                        };
                    }
                    Builder.registerModifier = registerModifier;
                    function build(compile) {
                        return Object.create(Builder.BuilderPrototype, { compile: { writable: false, configurable: false, value: compile } });
                    }
                    Builder.build = build;
                    function isBuilder(e) {
                        return !!e.compile;
                    }
                    function parse(query) {
                        if (typeof window === 'undefined')
                            throw 'parse can only be called from a browser.';
                        (function () { }(), eval)("with (LiteMol.Core.Structure.Query) { window.__LiteMol_query = " + query + "; }");
                        var q = window.__LiteMol_query;
                        window.__LiteMol_query = void 0;
                        return q.compile();
                    }
                    Builder.parse = parse;
                    function toQuery(q) {
                        var ret;
                        if (isBuilder(q))
                            ret = q.compile();
                        else if (typeof q === 'string' || q instanceof String)
                            ret = parse(q);
                        else
                            ret = q;
                        return ret;
                    }
                    Builder.toQuery = toQuery;
                })(Builder = Query.Builder || (Query.Builder = {}));
                function allAtoms() { return Builder.build(function () { return Compiler.compileAllAtoms(); }); }
                Query.allAtoms = allAtoms;
                function atomsByElement() {
                    var elements = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        elements[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtoms(elements, function (m) { return m.data.atoms.elementSymbol; }); });
                }
                Query.atomsByElement = atomsByElement;
                function atomsByName() {
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtoms(names, function (m) { return m.data.atoms.name; }); });
                }
                Query.atomsByName = atomsByName;
                function atomsById() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtoms(ids, function (m) { return m.data.atoms.id; }); });
                }
                Query.atomsById = atomsById;
                function residues() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(false, ids, function (m) { return m.data.residues; }); });
                }
                Query.residues = residues;
                function chains() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(false, ids, function (m) { return m.data.chains; }); });
                }
                Query.chains = chains;
                function entities() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(false, ids, function (m) { return m.data.entities; }); });
                }
                Query.entities = entities;
                function notEntities() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileAtomRanges(true, ids, function (m) { return m.data.entities; }); });
                }
                Query.notEntities = notEntities;
                function everything() { return Builder.build(function () { return Compiler.compileEverything(); }); }
                Query.everything = everything;
                function entitiesFromIndices(indices) { return Builder.build(function () { return Compiler.compileFromIndices(false, indices, function (m) { return m.data.entities; }); }); }
                Query.entitiesFromIndices = entitiesFromIndices;
                function chainsFromIndices(indices) { return Builder.build(function () { return Compiler.compileFromIndices(false, indices, function (m) { return m.data.chains; }); }); }
                Query.chainsFromIndices = chainsFromIndices;
                function residuesFromIndices(indices) { return Builder.build(function () { return Compiler.compileFromIndices(false, indices, function (m) { return m.data.residues; }); }); }
                Query.residuesFromIndices = residuesFromIndices;
                function atomsFromIndices(indices) { return Builder.build(function () { return Compiler.compileAtomIndices(indices); }); }
                Query.atomsFromIndices = atomsFromIndices;
                function sequence(entityId, asymId, startId, endId) { return Builder.build(function () { return Compiler.compileSequence(entityId, asymId, startId, endId); }); }
                Query.sequence = sequence;
                function hetGroups() { return Builder.build(function () { return Compiler.compileHetGroups(); }); }
                Query.hetGroups = hetGroups;
                function nonHetPolymer() { return Builder.build(function () { return Compiler.compileNonHetPolymer(); }); }
                Query.nonHetPolymer = nonHetPolymer;
                function polymerTrace() {
                    var atomNames = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        atomNames[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compilePolymerNames(atomNames, false); });
                }
                Query.polymerTrace = polymerTrace;
                function cartoons() { return or(Builder.build(function () { return Compiler.compilePolymerNames(["CA", "O", "O5'", "C3'", "N3"], false); }), hetGroups(), entities({ type: 'water' })); }
                Query.cartoons = cartoons;
                function backbone() { return Builder.build(function () { return Compiler.compilePolymerNames(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"], false); }); }
                Query.backbone = backbone;
                function sidechain() { return Builder.build(function () { return Compiler.compilePolymerNames(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"], true); }); }
                Query.sidechain = sidechain;
                function atomsInBox(min, max) { return Builder.build(function () { return Compiler.compileAtomsInBox(min, max); }); }
                Query.atomsInBox = atomsInBox;
                function or() {
                    var elements = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        elements[_i] = arguments[_i];
                    }
                    return Builder.build(function () { return Compiler.compileOr(elements); });
                }
                Query.or = or;
                Builder.registerModifier('complement', complement);
                function complement(q) { return Builder.build(function () { return Compiler.compileComplement(q); }); }
                Query.complement = complement;
                Builder.registerModifier('ambientResidues', ambientResidues);
                function ambientResidues(q, radius) { return Builder.build(function () { return Compiler.compileAmbientResidues(q, radius); }); }
                Query.ambientResidues = ambientResidues;
                Builder.registerModifier('wholeResidues', wholeResidues);
                function wholeResidues(q) { return Builder.build(function () { return Compiler.compileWholeResidues(q); }); }
                Query.wholeResidues = wholeResidues;
                Builder.registerModifier('union', union);
                function union(q) { return Builder.build(function () { return Compiler.compileUnion(q); }); }
                Query.union = union;
                Builder.registerModifier('inside', inside);
                function inside(q, where) { return Builder.build(function () { return Compiler.compileInside(q, where); }); }
                Query.inside = inside;
                Builder.registerModifier('intersectWith', intersectWith);
                function intersectWith(what, where) { return Builder.build(function () { return Compiler.compileIntersectWith(what, where); }); }
                Query.intersectWith = intersectWith;
                Builder.registerModifier('flatten', flatten);
                function flatten(what, selector) { return Builder.build(function () { return Compiler.compileFlatten(what, selector); }); }
                Query.flatten = flatten;
                Builder.registerModifier('except', except);
                function except(what, toRemove) { return Builder.build(function () { return Compiler.compileExcept(what, toRemove); }); }
                Query.except = except;
                /**
                 * Shortcuts
                 */
                function residuesByName() {
                    var names = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        names[_i] = arguments[_i];
                    }
                    return residues.apply(void 0, names.map(function (n) { return ({ name: n }); }));
                }
                Query.residuesByName = residuesByName;
                function residuesById() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return residues.apply(void 0, ids.map(function (id) { return ({ authSeqNumber: id }); }));
                }
                Query.residuesById = residuesById;
                function chainsById() {
                    var ids = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ids[_i] = arguments[_i];
                    }
                    return chains.apply(void 0, ids.map(function (id) { return ({ authAsymId: id }); }));
                }
                Query.chainsById = chainsById;
                /**
                 * Query compilation wrapper.
                 */
                var Compiler;
                (function (Compiler) {
                    var OptimizedId = /** @class */ (function () {
                        function OptimizedId(id, arrays) {
                            this.columns = [];
                            for (var _i = 0, _a = Object.keys(id); _i < _a.length; _i++) {
                                var key = _a[_i];
                                if (id[key] !== void 0 && !!arrays[key]) {
                                    this.columns.push({ value: id[key], array: arrays[key] });
                                }
                            }
                        }
                        OptimizedId.prototype.isSatisfied = function (i) {
                            for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                                var c = _a[_i];
                                if (c.value !== c.array[i])
                                    return false;
                            }
                            return true;
                        };
                        return OptimizedId;
                    }());
                    function compileEverything() {
                        return function (ctx) {
                            if (ctx.isComplete) {
                                var atoms = ctx.structure.data.atoms.indices;
                                return new Query.FragmentSeq(ctx, [new Query.Fragment(ctx, atoms[0], atoms)]);
                            }
                            var indices = new Int32Array(ctx.atomCount);
                            var offset = 0;
                            for (var _i = 0, _a = ctx.structure.data.atoms.indices; _i < _a.length; _i++) {
                                var i = _a[_i];
                                if (ctx.hasAtom(i))
                                    indices[offset++] = i;
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, indices[0], indices)]);
                        };
                    }
                    Compiler.compileEverything = compileEverything;
                    function compileAllAtoms() {
                        return function (ctx) {
                            var fragments = new Query.FragmentSeqBuilder(ctx);
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i))
                                    fragments.add(Query.Fragment.ofIndex(ctx, i));
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileAllAtoms = compileAllAtoms;
                    function compileAtoms(elements, sel) {
                        return function (ctx) {
                            var set = Core.Utils.FastSet.ofArray(elements), data = sel(ctx.structure), fragments = new Query.FragmentSeqBuilder(ctx);
                            for (var i = 0, _b = data.length; i < _b; i++) {
                                if (ctx.hasAtom(i) && set.has(data[i]))
                                    fragments.add(Query.Fragment.ofIndex(ctx, i));
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileAtoms = compileAtoms;
                    function compileAtomIndices(indices) {
                        return function (ctx) {
                            var count = 0;
                            for (var _i = 0, indices_5 = indices; _i < indices_5.length; _i++) {
                                var aI = indices_5[_i];
                                if (ctx.hasAtom(aI))
                                    count++;
                            }
                            if (!count)
                                return Query.FragmentSeq.empty(ctx);
                            if (count === indices.length)
                                return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, indices[0], indices)]);
                            var offset = 0;
                            var f = new Int32Array(count);
                            for (var _a = 0, indices_6 = indices; _a < indices_6.length; _a++) {
                                var aI = indices_6[_a];
                                if (ctx.hasAtom(aI))
                                    f[offset++] = aI;
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, f[0], f)]);
                        };
                    }
                    Compiler.compileAtomIndices = compileAtomIndices;
                    function compileFromIndices(complement, indices, tableProvider) {
                        return function (ctx) {
                            var table = tableProvider(ctx.structure), atomStartIndex = table.atomStartIndex, atomEndIndex = table.atomEndIndex, fragments = new Query.FragmentSeqBuilder(ctx);
                            if (complement) {
                                var exclude = Core.Utils.FastSet.ofArray(indices);
                                var count = table.count;
                                for (var i = 0; i < count; i++) {
                                    if (exclude.has(i))
                                        continue;
                                    if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i]))
                                        continue;
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                                }
                            }
                            else {
                                for (var _i = 0, indices_7 = indices; _i < indices_7.length; _i++) {
                                    var i = indices_7[_i];
                                    if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i]))
                                        continue;
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileFromIndices = compileFromIndices;
                    function compileAtomRanges(complement, ids, tableProvider) {
                        return function (ctx) {
                            var table = tableProvider(ctx.structure), atomIndexStart = table.atomStartIndex, atomIndexEnd = table.atomEndIndex, fragments = new Query.FragmentSeqBuilder(ctx), count = table.count, include = false;
                            var optimized = ids.map(function (id) { return new OptimizedId(id, table); });
                            var isEmptyIds = optimized.length === 0;
                            for (var i = 0; i < count; i++) {
                                if (!ctx.hasRange(atomIndexStart[i], atomIndexEnd[i]))
                                    continue;
                                include = isEmptyIds;
                                for (var _i = 0, optimized_1 = optimized; _i < optimized_1.length; _i++) {
                                    var id = optimized_1[_i];
                                    if (id.isSatisfied(i)) {
                                        include = true;
                                        break;
                                    }
                                }
                                if (complement)
                                    include = !include;
                                if (include) {
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomIndexStart[i], atomIndexEnd[i]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileAtomRanges = compileAtomRanges;
                    function compileSequence(seqEntityId, seqAsymId, start, end) {
                        return function (ctx) {
                            var _a = ctx.structure.data, residues = _a.residues, chains = _a.chains, seqNumber = residues.seqNumber, authSeqNumber = residues.authSeqNumber, insCode = residues.insCode, atomStartIndex = residues.atomStartIndex, atomEndIndex = residues.atomEndIndex, entityId = chains.entityId, count = chains.count, residueStartIndex = chains.residueStartIndex, residueEndIndex = chains.residueEndIndex, fragments = new Query.FragmentSeqBuilder(ctx);
                            var parent = ctx.structure.parent, sourceChainIndex = chains.sourceChainIndex, isComputed = parent && sourceChainIndex;
                            var targetAsymId = typeof seqAsymId === 'string' ? { asymId: seqAsymId } : seqAsymId;
                            var optTargetAsymId = new OptimizedId(targetAsymId, isComputed ? parent.data.chains : chains);
                            var isAuth = typeof targetAsymId.authAsymId === 'string';
                            var seqSource = isAuth ? authSeqNumber : seqNumber;
                            var startSeqNumber = isAuth ? start.authSeqNumber : start.seqNumber;
                            var endSeqNumber = isAuth ? end.authSeqNumber : end.seqNumber;
                            //optAsymId.isSatisfied();
                            for (var cI = 0; cI < count; cI++) {
                                if ((!!seqEntityId && entityId[cI] !== seqEntityId)
                                    || !optTargetAsymId.isSatisfied(isComputed ? sourceChainIndex[cI] : cI)) {
                                    continue;
                                }
                                var i = residueStartIndex[cI], last = residueEndIndex[cI], startIndex = -1, endIndex = -1;
                                for (; i < last; i++) {
                                    if (seqSource[i] >= startSeqNumber && seqSource[i] <= endSeqNumber) {
                                        if (!!start.insCode && insCode[i] !== start.insCode)
                                            continue;
                                        startIndex = i;
                                        break;
                                    }
                                }
                                if (i < 0 || i === last)
                                    continue;
                                for (i = startIndex; i < last; i++) {
                                    if (seqSource[i] >= endSeqNumber) {
                                        if (!!end.insCode && seqSource[i] === endSeqNumber && insCode[i] !== end.insCode)
                                            continue;
                                        break;
                                    }
                                }
                                endIndex = i;
                                if (ctx.hasRange(atomStartIndex[startIndex], atomEndIndex[endIndex])) {
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[startIndex], atomEndIndex[endIndex]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileSequence = compileSequence;
                    function compileHetGroups() {
                        return function (ctx) {
                            var _a = ctx.structure.data.residues, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, isHet = _a.isHet, entityIndex = _a.entityIndex, count = _a.count, entityType = ctx.structure.data.entities.type, water = 'water', fragments = new Query.FragmentSeqBuilder(ctx);
                            for (var i = 0; i < count; i++) {
                                if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i]))
                                    continue;
                                if (entityType[entityIndex[i]] === water)
                                    continue;
                                if (isHet[i]) {
                                    fragments.add(Query.Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileHetGroups = compileHetGroups;
                    function compileNonHetPolymer() {
                        return function (ctx) {
                            var _a = ctx.structure.data.residues, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, _c = ctx.structure.data.entities, entityType = _c.type, entityCount = _c.count, eRS = _c.residueStartIndex, eRE = _c.residueEndIndex, polymer = 'polymer', size = 0;
                            for (var eI = 0; eI < entityCount; eI++) {
                                if (entityType[eI] !== polymer)
                                    continue;
                                for (var rI = eRS[eI], _bR = eRE[eI]; rI < _bR; rI++) {
                                    for (var aI = atomStartIndex[rI], _bA = atomEndIndex[rI]; aI < _bA; aI++) {
                                        if (ctx.hasAtom(aI))
                                            size++;
                                    }
                                }
                            }
                            if (!size)
                                return Query.FragmentSeq.empty(ctx);
                            var f = new Int32Array(size), offset = 0;
                            for (var eI = 0; eI < entityCount; eI++) {
                                if (entityType[eI] !== polymer)
                                    continue;
                                for (var rI = eRS[eI], _bR = eRE[eI]; rI < _bR; rI++) {
                                    for (var aI = atomStartIndex[rI], _bA = atomEndIndex[rI]; aI < _bA; aI++) {
                                        if (ctx.hasAtom(aI))
                                            f[offset++] = aI;
                                    }
                                }
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, f[0], f)]);
                        };
                    }
                    Compiler.compileNonHetPolymer = compileNonHetPolymer;
                    function compileAtomsInBox(min, max) {
                        return function (ctx) {
                            var positions = ctx.structure.positions, xs = positions.x, ys = positions.y, zs = positions.z, count = positions.count, fragment = [];
                            for (var i = 0; i < count; i++) {
                                if (!ctx.hasAtom(i))
                                    continue;
                                var x = xs[i], y = ys[i], z = zs[i];
                                if (x >= min.x && x <= max.x
                                    && y >= min.y && y <= max.y
                                    && z >= min.z && z <= max.z) {
                                    fragment[fragment.length] = i;
                                }
                            }
                            if (!fragment.length)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [new Query.Fragment(ctx, fragment[0], fragment)]);
                        };
                    }
                    Compiler.compileAtomsInBox = compileAtomsInBox;
                    function compileInside(what, where) {
                        var _what = Builder.toQuery(what);
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            return new Query.FragmentSeq(ctx, _what(Query.Context.ofFragments(_where(ctx))).fragments);
                        };
                    }
                    Compiler.compileInside = compileInside;
                    function narrowFragment(ctx, f, m) {
                        var count = 0;
                        for (var _i = 0, _a = f.atomIndices; _i < _a.length; _i++) {
                            var i = _a[_i];
                            if (m.has(i))
                                count++;
                        }
                        if (!count)
                            return void 0;
                        var ret = new Int32Array(count);
                        var offset = 0;
                        for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                            var i = _d[_c];
                            if (m.has(i))
                                ret[offset++] = i;
                        }
                        return Query.Fragment.ofArray(ctx, ret[0], ret);
                    }
                    function compileIntersectWith(what, where) {
                        var _what = Builder.toQuery(what);
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            var fs = _what(ctx);
                            var map = Core.Utils.Mask.ofFragments(_where(ctx));
                            var ret = new Query.FragmentSeqBuilder(ctx);
                            for (var _i = 0, _a = fs.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var n = narrowFragment(ctx, f, map);
                                if (n)
                                    ret.add(n);
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileIntersectWith = compileIntersectWith;
                    function compileFilter(what, filter) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var src = _what(ctx).fragments, result = new Query.FragmentSeqBuilder(ctx), f;
                            for (var i = 0; i < src.length; i++) {
                                f = src[i];
                                if (filter(f))
                                    result.add(f);
                            }
                            return result.getSeq();
                        };
                    }
                    Compiler.compileFilter = compileFilter;
                    function compileComplement(what) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var mask = Core.Utils.Mask.ofFragments(_what(ctx)), count = 0, offset = 0;
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i) && !mask.has(i))
                                    count++;
                            }
                            if (!count)
                                return Query.FragmentSeq.empty(ctx);
                            var atoms = new Int32Array(count);
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i) && !mask.has(i))
                                    atoms[offset++] = i;
                            }
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, atoms[0], atoms)]);
                        };
                    }
                    Compiler.compileComplement = compileComplement;
                    function compileOr(queries) {
                        var _qs = queries.map(function (q) { return Builder.toQuery(q); });
                        if (_qs.length === 1)
                            return _qs[0];
                        return function (ctx) {
                            var fragments = new Query.HashFragmentSeqBuilder(ctx);
                            for (var _i = 0, _qs_1 = _qs; _i < _qs_1.length; _i++) {
                                var q = _qs_1[_i];
                                var r = q(ctx);
                                for (var _a = 0, _c = r.fragments; _a < _c.length; _a++) {
                                    var f = _c[_a];
                                    fragments.add(f);
                                }
                            }
                            return fragments.getSeq();
                        };
                    }
                    Compiler.compileOr = compileOr;
                    function compileUnion(what) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var src = _what(ctx).fragments, indices = Core.Utils.FastSet.create(), j = 0, atoms;
                            for (var i = 0; i < src.length; i++) {
                                atoms = src[i].atomIndices;
                                for (j = 0; j < atoms.length; j++)
                                    indices.add(atoms[j]);
                            }
                            if (indices.size === 0)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofSet(ctx, indices)]);
                        };
                    }
                    Compiler.compileUnion = compileUnion;
                    function compilePolymerNames(names, complement) {
                        return function (ctx) {
                            var structure = ctx.structure, entities = structure.data.entities, atomNames = structure.data.atoms.name, indices = [], indexCount = 0;
                            var allowedNames = Core.Utils.FastSet.ofArray(names);
                            if (complement) {
                                for (var ei = 0; ei < structure.data.entities.count; ei++) {
                                    if (entities.type[ei] !== 'polymer')
                                        continue;
                                    var start = entities.atomStartIndex[ei], end = entities.atomEndIndex[ei];
                                    for (var i = start; i < end; i++) {
                                        if (ctx.hasAtom(i) && !allowedNames.has(atomNames[i]))
                                            indices[indexCount++] = i;
                                    }
                                }
                            }
                            else {
                                for (var ei = 0; ei < entities.count; ei++) {
                                    if (entities.type[ei] !== 'polymer')
                                        continue;
                                    var start = entities.atomStartIndex[ei], end = entities.atomEndIndex[ei];
                                    for (var i = start; i < end; i++) {
                                        if (ctx.hasAtom(i) && allowedNames.has(atomNames[i]))
                                            indices[indexCount++] = i;
                                    }
                                }
                            }
                            if (!indices.length)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, indices[0], new Int32Array(indices))]);
                        };
                    }
                    Compiler.compilePolymerNames = compilePolymerNames;
                    function compileAmbientResidues(where, radius) {
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            var src = _where(ctx), nearest = ctx.lookup3d(), ret = new Query.HashFragmentSeqBuilder(ctx), _a = ctx.structure.positions, x = _a.x, y = _a.y, z = _a.z, residueIndex = ctx.structure.data.atoms.residueIndex, atomStart = ctx.structure.data.residues.atomStartIndex, atomEnd = ctx.structure.data.residues.atomEndIndex;
                            for (var _i = 0, _c = src.fragments; _i < _c.length; _i++) {
                                var f = _c[_i];
                                var residues_1 = Core.Utils.FastSet.create();
                                for (var _d = 0, _e = f.atomIndices; _d < _e.length; _d++) {
                                    var i = _e[_d];
                                    residues_1.add(residueIndex[i]);
                                    var _f = nearest(x[i], y[i], z[i], radius), elements = _f.elements, count = _f.count;
                                    for (var j = 0; j < count; j++) {
                                        residues_1.add(residueIndex[elements[j]]);
                                    }
                                }
                                var atomCount = { count: 0, start: atomStart, end: atomEnd };
                                residues_1.forEach(function (r, ctx) { ctx.count += ctx.end[r] - ctx.start[r]; }, atomCount);
                                var indices = new Int32Array(atomCount.count), atomIndices = { indices: indices, offset: 0, start: atomStart, end: atomEnd };
                                residues_1.forEach(function (r, ctx) {
                                    for (var i = ctx.start[r], _l = ctx.end[r]; i < _l; i++) {
                                        ctx.indices[ctx.offset++] = i;
                                    }
                                }, atomIndices);
                                Array.prototype.sort.call(indices, function (a, b) { return a - b; });
                                ret.add(Query.Fragment.ofArray(ctx, indices[0], indices));
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileAmbientResidues = compileAmbientResidues;
                    function compileWholeResidues(where) {
                        var _where = Builder.toQuery(where);
                        return function (ctx) {
                            var src = _where(ctx), ret = new Query.HashFragmentSeqBuilder(ctx), residueIndex = ctx.structure.data.atoms.residueIndex, atomStart = ctx.structure.data.residues.atomStartIndex, atomEnd = ctx.structure.data.residues.atomEndIndex;
                            for (var _i = 0, _a = src.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var residues_2 = Core.Utils.FastSet.create();
                                for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                                    var i = _d[_c];
                                    residues_2.add(residueIndex[i]);
                                }
                                var atomCount = { count: 0, start: atomStart, end: atomEnd };
                                residues_2.forEach(function (r, ctx) { ctx.count += ctx.end[r] - ctx.start[r]; }, atomCount);
                                var indices = new Int32Array(atomCount.count), atomIndices = { indices: indices, offset: 0, start: atomStart, end: atomEnd };
                                residues_2.forEach(function (r, ctx) {
                                    for (var i = ctx.start[r], _l = ctx.end[r]; i < _l; i++) {
                                        ctx.indices[ctx.offset++] = i;
                                    }
                                }, atomIndices);
                                Array.prototype.sort.call(indices, function (a, b) { return a - b; });
                                ret.add(Query.Fragment.ofArray(ctx, indices[0], indices));
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileWholeResidues = compileWholeResidues;
                    function compileFlatten(what, selector) {
                        var _what = Builder.toQuery(what);
                        return function (ctx) {
                            var fs = _what(ctx);
                            var ret = new Query.HashFragmentSeqBuilder(ctx);
                            for (var _i = 0, _a = fs.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var xs = selector(f);
                                for (var _c = 0, _d = xs.fragments; _c < _d.length; _c++) {
                                    var x = _d[_c];
                                    ret.add(x);
                                }
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileFlatten = compileFlatten;
                    function compileExcept(what, toRemove) {
                        var _what = Builder.toQuery(what);
                        var _toRemove = Builder.toQuery(toRemove);
                        return function (ctx) {
                            var fs = _what(ctx);
                            var mask = Core.Utils.Mask.ofFragments(_toRemove(ctx));
                            var ret = new Query.HashFragmentSeqBuilder(ctx);
                            for (var _i = 0, _a = fs.fragments; _i < _a.length; _i++) {
                                var f = _a[_i];
                                var size = 0;
                                for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                                    var i = _d[_c];
                                    if (!mask.has(i))
                                        size++;
                                }
                                if (!size)
                                    continue;
                                var indices = new Int32Array(size);
                                var offset = 0;
                                for (var _e = 0, _f = f.atomIndices; _e < _f.length; _e++) {
                                    var i = _f[_e];
                                    if (!mask.has(i))
                                        indices[offset++] = i;
                                }
                                ret.add(Query.Fragment.ofArray(ctx, indices[0], indices));
                            }
                            return ret.getSeq();
                        };
                    }
                    Compiler.compileExcept = compileExcept;
                })(Compiler = Query.Compiler || (Query.Compiler = {}));
            })(Query = Structure.Query || (Structure.Query = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Core;
    (function (Core) {
        var Structure;
        (function (Structure) {
            var Query;
            (function (Query) {
                var Algebraic;
                (function (Algebraic) {
                    /**
                     * Predicates
                     */
                    function unaryP(f) { return function (a) { return function (ctx, i) { return f(a(ctx, i)); }; }; }
                    function binaryP(f) { return function (a, b) { return function (ctx, i) { return f(a(ctx, i), b(ctx, i)); }; }; }
                    Algebraic.not = unaryP(function (a) { return !a; });
                    Algebraic.and = binaryP(function (a, b) { return a && b; });
                    Algebraic.or = binaryP(function (a, b) { return a || b; });
                    var backboneAtoms = Core.Utils.FastSet.ofArray(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"]);
                    Algebraic.backbone = function (ctx, i) { return Algebraic.entityType(ctx, i) === 'polymer' && backboneAtoms.has(Algebraic.atomName(ctx, i)); };
                    Algebraic.sidechain = function (ctx, i) { return Algebraic.entityType(ctx, i) === 'polymer' && !backboneAtoms.has(Algebraic.atomName(ctx, i)); };
                    /**
                     * Relations
                     */
                    function binaryR(f) { return function (a, b) { return function (ctx, i) { return f(a(ctx, i), b(ctx, i)); }; }; }
                    Algebraic.equal = binaryR(function (a, b) { return a === b; });
                    Algebraic.notEqual = binaryR(function (a, b) { return a !== b; });
                    Algebraic.greater = binaryR(function (a, b) { return a > b; });
                    Algebraic.lesser = binaryR(function (a, b) { return a < b; });
                    Algebraic.greaterEqual = binaryR(function (a, b) { return a >= b; });
                    Algebraic.lesserEqual = binaryR(function (a, b) { return a <= b; });
                    function inRange(s, a, b) { return function (ctx, i) { var v = s(ctx, i); return v >= a && v <= b; }; }
                    Algebraic.inRange = inRange;
                    /**
                     * Selectors
                     */
                    function value(v) { return function () { return v; }; }
                    Algebraic.value = value;
                    function atomProp(index, table, value) { return function (ctx, i) { var s = ctx.structure; return value(table(s))[index(s.data.atoms)[i]]; }; }
                    Algebraic.residueSeqNumber = atomProp(function (m) { return m.residueIndex; }, function (m) { return m.data.residues; }, function (t) { return t.seqNumber; });
                    Algebraic.residueName = atomProp(function (m) { return m.residueIndex; }, function (m) { return m.data.residues; }, function (t) { return t.name; });
                    Algebraic.elementSymbol = atomProp(function (m) { return m.indices; }, function (m) { return m.data.atoms; }, function (t) { return t.elementSymbol; });
                    Algebraic.atomName = atomProp(function (m) { return m.indices; }, function (m) { return m.data.atoms; }, function (t) { return t.name; });
                    Algebraic.entityType = atomProp(function (m) { return m.entityIndex; }, function (m) { return m.data.entities; }, function (t) { return t.type; });
                    /**
                     * Query
                     */
                    function query(p) {
                        return Query.Builder.build(function () { return function (ctx) {
                            var result = [];
                            for (var i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                                if (ctx.hasAtom(i) && p(ctx, i))
                                    result[result.length] = i;
                            }
                            if (!result.length)
                                return Query.FragmentSeq.empty(ctx);
                            return new Query.FragmentSeq(ctx, [Query.Fragment.ofArray(ctx, result[0], new Int32Array(result))]);
                        }; });
                    }
                    Algebraic.query = query;
                })(Algebraic = Query.Algebraic || (Query.Algebraic = {}));
            })(Query = Structure.Query || (Structure.Query = {}));
        })(Structure = Core.Structure || (Core.Structure = {}));
    })(Core = LiteMol.Core || (LiteMol.Core = {}));
})(LiteMol || (LiteMol = {}));
  return LiteMol.Core;
}
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = __LiteMol_Core();
} else if (typeof define === 'function' && define.amd) {
  define(['require'], function(require) { return __LiteMol_Core(); })
} else {
  var __target = !!window ? window : this;
  if (!__target.LiteMol) __target.LiteMol = {};
  __target.LiteMol.Core = __LiteMol_Core();
}

