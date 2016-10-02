var __LiteMolColorPicker = {};

/*

The MIT License (MIT)

Copyright (c) 2015 Case Sandberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/******/ (function(modules) { // webpackBootstrap
/******/  var __self = {};				
/******/ 	var parentHotUpdateCallback = __self["webpackHotUpdate"];
/******/ 	__self["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(callback) { // eslint-disable-line no-unused-vars
/******/ 		if(typeof XMLHttpRequest === "undefined")
/******/ 			return callback(new Error("No browser support"));
/******/ 		try {
/******/ 			var request = new XMLHttpRequest();
/******/ 			var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 			request.open("GET", requestPath, true);
/******/ 			request.timeout = 10000;
/******/ 			request.send(null);
/******/ 		} catch(err) {
/******/ 			return callback(err);
/******/ 		}
/******/ 		request.onreadystatechange = function() {
/******/ 			if(request.readyState !== 4) return;
/******/ 			if(request.status === 0) {
/******/ 				// timeout
/******/ 				callback(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 			} else if(request.status === 404) {
/******/ 				// no update available
/******/ 				callback();
/******/ 			} else if(request.status !== 200 && request.status !== 304) {
/******/ 				// other failure
/******/ 				callback(new Error("Manifest request to " + requestPath + " failed."));
/******/ 			} else {
/******/ 				// success
/******/ 				try {
/******/ 					var update = JSON.parse(request.responseText);
/******/ 				} catch(e) {
/******/ 					callback(e);
/******/ 					return;
/******/ 				}
/******/ 				callback(null, update);
/******/ 			}
/******/ 		};
/******/ 	}

/******/ 	
/******/ 	
/******/ 	// Copied from https://github.com/facebook/react/blob/bef45b0/src/shared/utils/canDefineProperty.js
/******/ 	var canDefineProperty = false;
/******/ 	try {
/******/ 		Object.defineProperty({}, "x", {
/******/ 			get: function() {}
/******/ 		});
/******/ 		canDefineProperty = true;
/******/ 	} catch(x) {
/******/ 		// IE will fail on defineProperty
/******/ 	}
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "cac23860c44b0ba80f83"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				if(canDefineProperty) {
/******/ 					Object.defineProperty(fn, name, (function(name) {
/******/ 						return {
/******/ 							configurable: true,
/******/ 							enumerable: true,
/******/ 							get: function() {
/******/ 								return __webpack_require__[name];
/******/ 							},
/******/ 							set: function(value) {
/******/ 								__webpack_require__[name] = value;
/******/ 							}
/******/ 						};
/******/ 					}(name)));
/******/ 				} else {
/******/ 					fn[name] = __webpack_require__[name];
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		function ensure(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 	
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		}
/******/ 		if(canDefineProperty) {
/******/ 			Object.defineProperty(fn, "e", {
/******/ 				enumerable: true,
/******/ 				value: ensure
/******/ 			});
/******/ 		} else {
/******/ 			fn.e = ensure;
/******/ 		}
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback;
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/ 	
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = toModuleId(id);
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}

/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "build/";

/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };

/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*export { default as ChromePicker } from './components/chrome/Chrome'
	export { default as CompactPicker } from './components/compact/Compact'
	export { default as MaterialPicker } from './components/material/Material'
	export { default as PhotoshopPicker } from './components/photoshop/Photoshop'
	export { default as SketchPicker } from './components/sketched/Sketch'*/

	//import { default as ColorPicker } from './components/customColor/Slider';
	//import { default as Alpha } from './components/customAlpha/Slider';

	var _Chrome = __webpack_require__(2);

	var _Chrome2 = _interopRequireDefault(_Chrome);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//export SliderPicker
	/*export { default as SwatchesPicker } from './components/swatches/Swatches'
	export { default as CustomPicker } from './components/common/ColorWrap'*/

	//export default from './components/chrome/Chrome'

	//__LiteMolColorPicker.ColorPicker = ColorPicker;
	//__LiteMolColorPicker.AlphaPicker = Alpha;
	__LiteMolColorPicker.ChromePicker = _Chrome2.default;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Chrome = undefined;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _common = __webpack_require__(15);

	var _ChromePointer = __webpack_require__(29);

	var _ChromePointer2 = _interopRequireDefault(_ChromePointer);

	var _ChromePointerCircle = __webpack_require__(30);

	var _ChromePointerCircle2 = _interopRequireDefault(_ChromePointerCircle);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	var _CompactColor = __webpack_require__(31);

	var _CompactColor2 = _interopRequireDefault(_CompactColor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	//import ChromeFields from '../customColor/SketchFields'


	var Chrome = exports.Chrome = function (_ReactCSS$Component) {
	  _inherits(Chrome, _ReactCSS$Component);

	  function Chrome() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Chrome);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Chrome.__proto__ || Object.getPrototypeOf(Chrome)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _this.handleChange = function (data) {
	      _this.props.onChange(data);
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Chrome, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          picker: {
	            //background: '#fff',
	            //borderRadius: '2px',
	            //boxShadow: '0 0 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.3)',
	            //boxSizing: 'initial',
	            width: '100%'
	          },
	          saturation: {
	            width: '100%',
	            //paddingBottom: '35%',
	            //marginBottom: '1px',
	            height: '48px',
	            position: 'relative',
	            borderRadius: '0px',
	            overflow: 'hidden'
	          },
	          Saturation: {
	            radius: '0px'
	          },
	          body: {
	            padding: '0'
	          },
	          controls: {
	            marginTop: '1px',
	            display: 'block'
	          },
	          swatch: {
	            marginTop: '0px',
	            width: '16px',
	            height: '16px',
	            borderRadius: '8px',
	            position: 'relative',
	            overflow: 'hidden'
	          },
	          active: {
	            Absolute: '0 0 0 0',
	            zIndex: 2,
	            borderRadius: '8px',
	            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
	            background: 'rgba(' + this.props.rgb.r + ', ' + this.props.rgb.g + ', ' + this.props.rgb.b + ', ' + this.props.rgb.a + ')'
	          },
	          hue: {
	            height: '16px',
	            position: 'relative',
	            width: '100%'
	          },
	          Hue: {
	            radius: '0'
	          },
	          colors: {
							marginTop: '1px',
	            display: 'flex',
	            flexDirection: 'row'
	          }
	          // fields: {
	          //   marginTop: '8px'
	          // }
	        }
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var colors = [];
	      if (this.props.colors) {
	        for (var i = 0; i < this.props.colors.length; i++) {
	          var color = this.props.colors[i];
	          colors.push(_react2.default.createElement(_CompactColor2.default, { key: color, color: color, active: color.replace('#', '').toLowerCase() == this.props.hex, onClick: this.handleChange }));
	        }
	      }

	      return _react2.default.createElement(
	        'div',
	        { style: this.styles().picker },
	        _react2.default.createElement(
	          'div',
	          { style: this.styles().saturation },
	          _react2.default.createElement(_common.Saturation, _extends({}, this.styles().Saturation, this.props, { pointer: _ChromePointerCircle2.default, onChange: this.handleChange }))
	        ),
	        _react2.default.createElement(
	          'div',
	          { style: this.styles().body },
	          _react2.default.createElement(
	            'div',
	            { style: this.styles().hue },
	            _react2.default.createElement(_common.Hue, _extends({}, this.styles().Hue, this.props, { pointer: _ChromePointer2.default, onChange: this.handleChange }))
	          ),
	          _react2.default.createElement(
	            'div',
	            { style: this.styles().colors },
	            colors
	          )
	        )
	      );

	      // div style={ this.styles().toggles }>
	      //           <div style={ this.styles().hue }>
	      //             <Hue {...this.styles().Hue} {...this.props} pointer={ ChromePointer } onChange={ this.handleChange } />
	      //           </div>
	      //         </div>
	    }
	  }]);

	  return Chrome;
	}(_reactcss2.default.Component);

	Chrome.defaultProps = {
	  colors: ['#000000', '#808080', '#FFFFFF', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#E20F2E']
	};

	exports.default = (0, _common.ColorWrap)(Chrome);

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	//exports['default'] = _libComponentsMove2['default'];
	module.exports = __LiteMolReact;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";module.exports={Component:__webpack_require__(5),inline:__webpack_require__(6),mixin:{css:__webpack_require__(6)}};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),_get=function(e,t,r){for(var n=!0;n;){var o=e,i=t,c=r;n=!1,null===o&&(o=Function.prototype);var a=Object.getOwnPropertyDescriptor(o,i);if(void 0!==a){if("value"in a)return a.value;var u=a.get;if(void 0===u)return;return u.call(c)}var l=Object.getPrototypeOf(o);if(null===l)return;e=l,t=i,r=c,n=!0,a=l=void 0}},React=__webpack_require__(3),inline=__webpack_require__(6),ReactCSSComponent=function(e){function t(){_classCallCheck(this,t),_get(Object.getPrototypeOf(t.prototype),"constructor",this).apply(this,arguments)}return _inherits(t,e),_createClass(t,[{key:"css",value:function(e){return inline.call(this,e)}},{key:"styles",value:function(){return this.css()}}]),t}(React.Component);ReactCSSComponent.contextTypes={mixins:React.PropTypes.object},module.exports=ReactCSSComponent;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var isObject=__webpack_require__(7),checkClassStructure=__webpack_require__(8),combine=__webpack_require__(9);module.exports=function(s){var e=this;combine=__webpack_require__(9);var r=[];if(!this.classes)throw console.warn("Define this.classes on `"+this.constructor.name+"`");checkClassStructure(this.classes());var t=function(s,t){e.classes()[s]?r.push(e.classes()[s]):s&&t&&t.warn===!0&&console.warn("The `"+s+"` css class does not exist on `"+e.constructor.name+"`")};t("default");for(var i in this.props){var c=this.props[i];isObject(c)||(c===!0?(t(i),t(i+"-true")):t(c?i+"-"+c:i+"-false"))}if(this.props&&this.props.activeBounds)for(var o=0;o<this.props.activeBounds.length;o++){var n=this.props.activeBounds[o];t(n)}for(var a in s){var u=s[a];u===!0&&t(a,{warn:!0})}var h={};return this.context&&this.context.mixins&&(h=this.context.mixins),combine(r,h)};

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var isObject=__webpack_require__(7);module.exports=function(e){for(var s in e){var o=e[s];if(isObject(o))for(var t in o){var a=o[t];isObject(a)||console.warn("Make sure the value of the element `"+s+"` is an object of css. You passed it `"+o+"`")}else console.warn("Make sure the value of `"+s+"` is an object of html elements. You passed it `"+o+"`")}};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var merge=__webpack_require__(10),mixins=__webpack_require__(14);module.exports=function(r,e){var i=merge(r);return mixins(i,e)};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var merge=__webpack_require__(11),isObject=__webpack_require__(7),isArray=__webpack_require__(13);module.exports=function(e){return isObject(e)&&!isArray(e)?e:1===e.length?e[0]:merge.recursive.apply(void 0,e)};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/*!
	 * @name JavaScript/NodeJS Merge v1.2.0
	 * @author yeikos
	 * @repository https://github.com/yeikos/js.merge

	 * Copyright 2014 yeikos - MIT license
	 * https://raw.github.com/yeikos/js.merge/master/LICENSE
	 */

	;(function(isNode) {

		/**
		 * Merge one or more objects 
		 * @param bool? clone
		 * @param mixed,... arguments
		 * @return object
		 */

		var Public = function(clone) {

			return merge(clone === true, false, arguments);

		}, publicName = 'merge';

		/**
		 * Merge two or more objects recursively 
		 * @param bool? clone
		 * @param mixed,... arguments
		 * @return object
		 */

		Public.recursive = function(clone) {

			return merge(clone === true, true, arguments);

		};

		/**
		 * Clone the input removing any reference
		 * @param mixed input
		 * @return mixed
		 */

		Public.clone = function(input) {

			var output = input,
				type = typeOf(input),
				index, size;

			if (type === 'array') {

				output = [];
				size = input.length;

				for (index=0;index<size;++index)

					output[index] = Public.clone(input[index]);

			} else if (type === 'object') {

				output = {};

				for (index in input)

					output[index] = Public.clone(input[index]);

			}

			return output;

		};

		/**
		 * Merge two objects recursively
		 * @param mixed input
		 * @param mixed extend
		 * @return mixed
		 */

		function merge_recursive(base, extend) {

			if (typeOf(base) !== 'object')

				return extend;

			for (var key in extend) {

				if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {

					base[key] = merge_recursive(base[key], extend[key]);

				} else {

					base[key] = extend[key];

				}

			}

			return base;

		}

		/**
		 * Merge two or more objects
		 * @param bool clone
		 * @param bool recursive
		 * @param array argv
		 * @return object
		 */

		function merge(clone, recursive, argv) {

			var result = argv[0],
				size = argv.length;

			if (clone || typeOf(result) !== 'object')

				result = {};

			for (var index=0;index<size;++index) {

				var item = argv[index],

					type = typeOf(item);

				if (type !== 'object') continue;

				for (var key in item) {

					var sitem = clone ? Public.clone(item[key]) : item[key];

					if (recursive) {

						result[key] = merge_recursive(result[key], sitem);

					} else {

						result[key] = sitem;

					}

				}

			}

			return result;

		}

		/**
		 * Get type of variable
		 * @param mixed input
		 * @return string
		 *
		 * @see http://jsperf.com/typeofvar
		 */

		function typeOf(input) {

			return ({}).toString.call(input).slice(8, -1).toLowerCase();

		}

		if (isNode) {

			module.exports = Public;

		} else {

			window[publicName] = Public;

		}

	})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)(module)))

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	module.exports = isArray;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";var isObject=__webpack_require__(7),isArray=__webpack_require__(13),merge=__webpack_require__(11),localProps={borderRadius:function(r){return null!==r?{msBorderRadius:r,MozBorderRadius:r,OBorderRadius:r,WebkitBorderRadius:r,borderRadius:r}:void 0},boxShadow:function(r){return null!==r?{msBoxShadow:r,MozBoxShadow:r,OBoxShadow:r,WebkitBoxShadow:r,boxShadow:r}:void 0},userSelect:function(r){return null!==r?{WebkitTouchCallout:r,KhtmlUserSelect:r,MozUserSelect:r,msUserSelect:r,WebkitUserSelect:r,userSelect:r}:void 0},flex:function(r){return null!==r?{WebkitBoxFlex:r,MozBoxFlex:r,WebkitFlex:r,msFlex:r,flex:r}:void 0},flexBasis:function(r){return null!==r?{WebkitFlexBasis:r,flexBasis:r}:void 0},justifyContent:function(r){return null!==r?{WebkitJustifyContent:r,justifyContent:r}:void 0},transition:function(r){return null!==r?{msTransition:r,MozTransition:r,OTransition:r,WebkitTransition:r,transition:r}:void 0},transform:function(r){return null!==r?{msTransform:r,MozTransform:r,OTransform:r,WebkitTransform:r,transform:r}:void 0},Absolute:function(r){if(null!==r){var e=r.split(" ");return{position:"absolute",top:e[0],right:e[1],bottom:e[2],left:e[3]}}},Extend:function(r,e){var o=e[r];return o?o:void 0}},transform=function r(e,o,t){var n=merge(o,localProps),i={};for(var s in e){var u=e[s];if(isObject(u)&&!isArray(u))i[s]=r(u,o,e);else if(n[s]){var l=n[s](u,t);for(var a in l){var f=l[a];i[a]=f}}else i[s]=u}return i};module.exports=function(r,e,o){return transform(r,e,o)};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Alpha = __webpack_require__(16);

	Object.defineProperty(exports, 'Alpha', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_Alpha).default;
	  }
	});

	var _Checkboard = __webpack_require__(20);

	Object.defineProperty(exports, 'Checkboard', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_Checkboard).default;
	  }
	});

	var _Hue = __webpack_require__(21);

	Object.defineProperty(exports, 'Hue', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_Hue).default;
	  }
	});

	var _Saturation = __webpack_require__(22);

	Object.defineProperty(exports, 'Saturation', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_Saturation).default;
	  }
	});

	var _ColorWrap = __webpack_require__(24);

	Object.defineProperty(exports, 'ColorWrap', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_ColorWrap).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Alpha = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	var _Checkboard = __webpack_require__(20);

	var _Checkboard2 = _interopRequireDefault(_Checkboard);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Alpha = exports.Alpha = function (_ReactCSS$Component) {
	  _inherits(Alpha, _ReactCSS$Component);

	  function Alpha() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Alpha);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Alpha.__proto__ || Object.getPrototypeOf(Alpha)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _this.handleChange = function (e, skip) {
	      !skip && e.preventDefault();
	      var container = _this.refs.container;
	      var containerWidth = container.clientWidth;
	      var left = (e.pageX || e.touches[0].pageX) - (container.getBoundingClientRect().left + window.pageXOffset);

	      var a;
	      if (left < 0) {
	        a = 0;
	      } else if (left > containerWidth) {
	        a = 1;
	      } else {
	        a = Math.round(left * 100 / containerWidth) / 100;
	      }

	      if (_this.props.a !== a) {
	        _this.props.onChange({
	          h: _this.props.hsl.h,
	          s: _this.props.hsl.s,
	          l: _this.props.hsl.l,
	          a: a,
	          source: 'rgb'
	        });
	      }
	    }, _this.handleMouseDown = function (e) {
	      _this.handleChange(e, true);
	      window.addEventListener('mousemove', _this.handleChange);
	      window.addEventListener('mouseup', _this.handleMouseUp);
	    }, _this.handleMouseUp = function () {
	      _this.unbindEventListeners();
	    }, _this.unbindEventListeners = function () {
	      window.removeEventListener('mousemove', _this.handleChange);
	      window.removeEventListener('mouseup', _this.handleMouseUp);
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Alpha, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          alpha: {
	            Absolute: '0 0 0 0',
	            borderRadius: this.props.radius
	          },
	          checkboard: {
	            Absolute: '0 0 0 0',
	            overflow: 'hidden'
	          },
	          gradient: {
	            Absolute: '0 0 0 0',
	            background: 'linear-gradient(to right, rgba(' + this.props.rgb.r + ', ' + this.props.rgb.g + ', ' + this.props.rgb.b + ', 0) 0%, rgba(' + this.props.rgb.r + ', ' + this.props.rgb.g + ', ' + this.props.rgb.b + ', 1) 100%)',
	            boxShadow: this.props.shadow,
	            borderRadius: this.props.radius
	          },
	          container: {
	            position: 'relative',
	            zIndex: '2',
	            height: '100%',
	            margin: '0 3px'
	          },
	          pointer: {
	            zIndex: '2',
	            position: 'absolute',
	            left: this.props.rgb.a * 100 + '%'
	          },
	          slider: {
	            width: '4px',
	            borderRadius: '1px',
	            height: '8px',
	            boxShadow: '0 0 2px rgba(0, 0, 0, .6)',
	            background: '#fff',
	            marginTop: '1px',
	            transform: 'translateX(-2px)'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.unbindEventListeners();
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var pointer = _react2.default.createElement('div', { style: this.styles().slider });

	      if (this.props.pointer) {
	        pointer = _react2.default.createElement(this.props.pointer, this.props);
	      }

	      return _react2.default.createElement(
	        'div',
	        { style: this.styles().alpha },
	        _react2.default.createElement(
	          'div',
	          { style: this.styles().checkboard },
	          _react2.default.createElement(_Checkboard2.default, null)
	        ),
	        _react2.default.createElement('div', { style: this.styles().gradient }),
	        _react2.default.createElement(
	          'div',
	          { style: this.styles().container, ref: 'container', onMouseDown: this.handleMouseDown,
	            onTouchMove: this.handleChange,
	            onTouchStart: this.handleChange },
	          _react2.default.createElement(
	            'div',
	            { style: this.styles().pointer, ref: 'pointer' },
	            pointer
	          )
	        )
	      );
	    }
	  }]);

	  return Alpha;
	}(_reactcss2.default.Component);

	exports.default = Alpha;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(18);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	* @providesModule shallowCompare
	*/

	'use strict';

	var shallowEqual = __webpack_require__(19);

	/**
	 * Does a shallow comparison for props and state.
	 * See ReactComponentWithPureRenderMixin
	 */
	function shallowCompare(instance, nextProps, nextState) {
	  return !shallowEqual(instance.props, nextProps) || !shallowEqual(instance.state, nextState);
	}

	module.exports = shallowCompare;

/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule shallowEqual
	 * @typechecks
	 * 
	 */

	'use strict';

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * Performs equality by iterating through keys on an object and returning false
	 * when any key has values which are not strictly equal between the arguments.
	 * Returns true when the values of all keys are strictly equal.
	 */
	function shallowEqual(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }

	  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
	    return false;
	  }

	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);

	  if (keysA.length !== keysB.length) {
	    return false;
	  }

	  // Test for A's keys different from B.
	  var bHasOwnProperty = hasOwnProperty.bind(objB);
	  for (var i = 0; i < keysA.length; i++) {
	    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
	      return false;
	    }
	  }

	  return true;
	}

	module.exports = shallowEqual;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Checkboard = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _checkboardCache = {};

	function renderCheckboard(c1, c2, size) {
	  if (typeof document == 'undefined') return null; // Dont Render On Server
	  var canvas = document.createElement('canvas');
	  canvas.width = canvas.height = size * 2;
	  var ctx = canvas.getContext('2d');
	  if (!ctx) return null; // If no context can be found, return early.
	  ctx.fillStyle = c1;
	  ctx.fillRect(0, 0, canvas.width, canvas.height);
	  ctx.fillStyle = c2;
	  ctx.fillRect(0, 0, size, size);
	  ctx.translate(size, size);
	  ctx.fillRect(0, 0, size, size);
	  return canvas.toDataURL();
	}

	function getCheckboard(c1, c2, size) {
	  var key = c1 + ',' + c2 + ',' + size;

	  if (_checkboardCache[key]) {
	    return _checkboardCache[key];
	  } else {
	    var checkboard = renderCheckboard(c1, c2, size);
	    _checkboardCache[key] = checkboard;
	    return checkboard;
	  }
	}

	var Checkboard = exports.Checkboard = function (_ReactCSS$Component) {
	  _inherits(Checkboard, _ReactCSS$Component);

	  function Checkboard() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Checkboard);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Checkboard.__proto__ || Object.getPrototypeOf(Checkboard)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Checkboard, [{
	    key: 'classes',
	    value: function classes() {
	      var background = getCheckboard(this.props.white, this.props.grey, this.props.size);
	      return {
	        'default': {
	          grid: {
	            Absolute: '0 0 0 0',
	            background: 'url(' + background + ') center left'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement('div', { style: this.styles().grid, ref: 'grid' });
	    }
	  }]);

	  return Checkboard;
	}(_reactcss2.default.Component);

	Checkboard.defaultProps = {
	  size: 8,
	  white: '#fff',
	  grey: '#e6e6e6'
	};

	exports.default = Checkboard;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Hue = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Hue = exports.Hue = function (_ReactCSS$Component) {
	  _inherits(Hue, _ReactCSS$Component);

	  function Hue() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Hue);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Hue.__proto__ || Object.getPrototypeOf(Hue)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _this.handleChange = function (e, skip) {
	      !skip && e.preventDefault();
	      var container = _this.refs.container;
	      var containerWidth = container.clientWidth;
	      var containerHeight = container.clientHeight;
	      var left = (e.pageX || e.touches && e.touches[0].pageX || 0) - (container.getBoundingClientRect().left + window.pageXOffset);
	      var top = (e.pageY || e.touches && e.touches[0].pageY || 0) - (container.getBoundingClientRect().top + window.pageYOffset);

	      if (_this.props.direction === 'vertical') {
	        var h;
	        if (top < 0) {
	          h = 359;
	        } else if (top > containerHeight) {
	          h = 0;
	        } else {
	          var percent = -(top * 100 / containerHeight) + 100;
	          h = 360 * percent / 100;
	        }

	        if (_this.props.hsl.h !== h) {
	          _this.props.onChange({
	            h: h,
	            s: _this.props.hsl.s,
	            l: _this.props.hsl.l,
	            a: _this.props.hsl.a,
	            source: 'rgb'
	          });
	        }
	      } else {
	        var h;
	        if (left < 0) {
	          h = 0;
	        } else if (left > containerWidth) {
	          h = 359;
	        } else {
	          var percent = left * 100 / containerWidth;
	          h = 360 * percent / 100;
	        }

	        if (_this.props.hsl.h !== h) {
	          _this.props.onChange({
	            h: h,
	            s: _this.props.hsl.s,
	            l: _this.props.hsl.l,
	            a: _this.props.hsl.a,
	            source: 'rgb'
	          });
	        }
	      }
	    }, _this.handleMouseDown = function (e) {
	      _this.handleChange(e, true);
	      window.addEventListener('mousemove', _this.handleChange);
	      window.addEventListener('mouseup', _this.handleMouseUp);
	    }, _this.handleMouseUp = function () {
	      _this.unbindEventListeners();
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Hue, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          hue: {
	            Absolute: '0 0 0 0',
	            background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
	            borderRadius: this.props.radius,
	            boxShadow: this.props.shadow
	          },
	          container: {
	            margin: '0 2px',
	            position: 'relative',
	            height: '100%'
	          },
	          pointer: {
	            zIndex: '2',
	            position: 'absolute',
	            left: this.props.hsl.h * 100 / 360 + '%'
	          },
	          slider: {
	            marginTop: '1px',
	            width: '4px',
	            borderRadius: '1px',
	            height: '8px',
	            boxShadow: '0 0 2px rgba(0, 0, 0, .6)',
	            background: '#fff',
	            transform: 'translateX(-2px)'
	          }
	        },
	        'direction-vertical': {
	          hue: {
	            background: 'linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
	          },
	          pointer: {
	            left: '0',
	            top: -(this.props.hsl.h * 100 / 360) + 100 + '%'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.unbindEventListeners();
	    }
	  }, {
	    key: 'unbindEventListeners',
	    value: function unbindEventListeners() {
	      window.removeEventListener('mousemove', this.handleChange);
	      window.removeEventListener('mouseup', this.handleMouseUp);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var pointer = _react2.default.createElement('div', { style: this.styles().slider });

	      if (this.props.pointer) {
	        pointer = _react2.default.createElement(this.props.pointer, this.props);
	      }

	      return _react2.default.createElement(
	        'div',
	        { style: this.styles().hue },
	        _react2.default.createElement(
	          'div',
	          { style: this.styles().container, ref: 'container', onMouseDown: this.handleMouseDown,
	            onTouchMove: this.handleChange,
	            onTouchStart: this.handleChange },
	          _react2.default.createElement(
	            'div',
	            { style: this.styles().pointer, ref: 'pointer' },
	            pointer
	          )
	        )
	      );
	    }
	  }]);

	  return Hue;
	}(_reactcss2.default.Component);

	exports.default = Hue;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Saturation = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _lodash = __webpack_require__(23);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Saturation = exports.Saturation = function (_ReactCSS$Component) {
	  _inherits(Saturation, _ReactCSS$Component);

	  function Saturation(props) {
	    _classCallCheck(this, Saturation);

	    var _this = _possibleConstructorReturn(this, (Saturation.__proto__ || Object.getPrototypeOf(Saturation)).call(this));

	    _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]);

	    _this.handleChange = function (e, skip) {
	      !skip && e.preventDefault();
	      var container = _this.refs.container;
	      var containerWidth = container.clientWidth;
	      var containerHeight = container.clientHeight;
	      var left = (e.pageX || e.touches[0].pageX) - (container.getBoundingClientRect().left + window.pageXOffset);
	      var top = (e.pageY || e.touches[0].pageY) - (container.getBoundingClientRect().top + window.pageYOffset);

	      if (left < 0) {
	        left = 0;
	      } else if (left > containerWidth) {
	        left = containerWidth;
	      } else if (top < 0) {
	        top = 0;
	      } else if (top > containerHeight) {
	        top = containerHeight;
	      }

	      var saturation = left * 100 / containerWidth;
	      var bright = -(top * 100 / containerHeight) + 100;

	      _this.throttle(_this.props.onChange, {
	        h: _this.props.hsl.h,
	        s: saturation,
	        v: bright,
	        a: _this.props.hsl.a,
	        source: 'rgb'
	      });
	    };

	    _this.handleMouseDown = function (e) {
	      _this.handleChange(e, true);
	      window.addEventListener('mousemove', _this.handleChange);
	      window.addEventListener('mouseup', _this.handleMouseUp);
	    };

	    _this.handleMouseUp = function () {
	      _this.unbindEventListeners();
	    };

	    _this.throttle = (0, _lodash2.default)(function (fn, data) {
	      fn(data);
	    }, 50);
	    return _this;
	  }

	  _createClass(Saturation, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          color: {
	            Absolute: '0 0 0 0',
	            background: 'hsl(' + this.props.hsl.h + ',100%, 50%)',
	            borderRadius: this.props.radius
	          },
	          white: {
	            Absolute: '0 0 0 0',
	            background: 'linear-gradient(to right, #fff, rgba(255,255,255,0))'
	          },
	          black: {
	            Absolute: '0 0 0 0',
	            background: 'linear-gradient(to top, #000, rgba(0,0,0,0))',
	            boxShadow: this.props.shadow
	          },
	          pointer: {
	            position: 'absolute',
	            top: -(this.props.hsv.v * 100) + 100 + '%',
	            left: this.props.hsv.s * 100 + '%',
	            cursor: 'default'
	          },
	          circle: {
	            width: '4px',
	            height: '4px',
	            boxShadow: '0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0,0,0,.3), 0 0 1px 2px rgba(0,0,0,.4)',
	            borderRadius: '50%',
	            cursor: 'hand',
	            transform: 'translate(-2px, -2px)'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.unbindEventListeners();
	    }
	  }, {
	    key: 'unbindEventListeners',
	    value: function unbindEventListeners() {
	      window.removeEventListener('mousemove', this.handleChange);
	      window.removeEventListener('mouseup', this.handleMouseUp);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var pointer = _react2.default.createElement('div', { style: this.styles().circle });

	      if (this.props.pointer) {
	        pointer = _react2.default.createElement(this.props.pointer, this.props);
	      }

	      return _react2.default.createElement(
	        'div',
	        { style: this.styles().color, ref: 'container', onMouseDown: this.handleMouseDown,
	          onTouchMove: this.handleChange,
	          onTouchStart: this.handleChange },
	        _react2.default.createElement(
	          'div',
	          { style: this.styles().white },
	          _react2.default.createElement('div', { style: this.styles().black }),
	          _react2.default.createElement(
	            'div',
	            { style: this.styles().pointer, ref: 'pointer' },
	            pointer
	          )
	        )
	      );
	    }
	  }]);

	  return Saturation;
	}(_reactcss2.default.Component);

	exports.default = Saturation;

/***/ },
/* 23 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max,
	    nativeMin = Math.min;

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now = function() {
	  return root.Date.now();
	};

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var lastArgs,
	      lastThis,
	      maxWait,
	      result,
	      timerId,
	      lastCallTime,
	      lastInvokeTime = 0,
	      leading = false,
	      maxing = false,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber(wait) || 0;
	  if (isObject(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }

	  function invokeFunc(time) {
	    var args = lastArgs,
	        thisArg = lastThis;

	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }

	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }

	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime,
	        result = wait - timeSinceLastCall;

	    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
	  }

	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime;

	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
	      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	  }

	  function timerExpired() {
	    var time = now();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }

	  function trailingEdge(time) {
	    timerId = undefined;

	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }

	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }

	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now());
	  }

	  function debounced() {
	    var time = now(),
	        isInvoking = shouldInvoke(time);

	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;

	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}

	/**
	 * Creates a throttled function that only invokes `func` at most once per
	 * every `wait` milliseconds. The throttled function comes with a `cancel`
	 * method to cancel delayed `func` invocations and a `flush` method to
	 * immediately invoke them. Provide `options` to indicate whether `func`
	 * should be invoked on the leading and/or trailing edge of the `wait`
	 * timeout. The `func` is invoked with the last arguments provided to the
	 * throttled function. Subsequent calls to the throttled function return the
	 * result of the last `func` invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the throttled function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.throttle` and `_.debounce`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to throttle.
	 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=true]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new throttled function.
	 * @example
	 *
	 * // Avoid excessively updating the position while scrolling.
	 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	 *
	 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	 * jQuery(element).on('click', throttled);
	 *
	 * // Cancel the trailing throttled invocation.
	 * jQuery(window).on('popstate', throttled.cancel);
	 */
	function throttle(func, wait, options) {
	  var leading = true,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  if (isObject(options)) {
	    leading = 'leading' in options ? !!options.leading : leading;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	  return debounce(func, wait, {
	    'leading': leading,
	    'maxWait': wait,
	    'trailing': trailing
	  });
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = throttle;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ColorWrap = undefined;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _merge = __webpack_require__(11);

	var _merge2 = _interopRequireDefault(_merge);

	var _lodash = __webpack_require__(25);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _lodash3 = __webpack_require__(26);

	var _lodash4 = _interopRequireDefault(_lodash3);

	var _color = __webpack_require__(27);

	var _color2 = _interopRequireDefault(_color);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ColorWrap = exports.ColorWrap = function ColorWrap(Picker) {
	  var ColorPicker = function (_React$Component) {
	    _inherits(ColorPicker, _React$Component);

	    function ColorPicker(props) {
	      _classCallCheck(this, ColorPicker);

	      var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this));

	      _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]);

	      _this.handleChange = function (data) {
	        data = _color2.default.simpleCheckForValidColor(data);
	        if (data) {
	          var colors = _color2.default.toState(data, data.h || _this.state.oldHue);
	          _this.setState(colors);
	          _this.props.onChangeComplete && _this.debounce(_this.props.onChangeComplete, colors);
	          _this.props.onChange && _this.props.onChange(colors);
	        }
	      };

	      _this.state = (0, _merge2.default)(_color2.default.toState(props.color, 0), {
	        visible: props.display
	      });

	      _this.debounce = (0, _lodash4.default)(function (fn, data) {
	        fn(data);
	      }, 100);
	      return _this;
	    }

	    _createClass(ColorPicker, [{
	      key: 'componentWillReceiveProps',
	      value: function componentWillReceiveProps(nextProps) {
	        this.setState((0, _merge2.default)(_color2.default.toState(nextProps.color, this.state.oldHue), {
	          visible: nextProps.display
	        }));
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        return _react2.default.createElement(Picker, _extends({}, this.props, this.state, { onChange: this.handleChange }));
	      }
	    }]);

	    return ColorPicker;
	  }(_react2.default.Component);

	  ColorPicker.defaultProps = {
	    color: {
	      h: 250,
	      s: .50,
	      l: .20,
	      a: 1
	    }
	  };

	  return ColorPicker;
	};

	exports.default = ColorWrap;

/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	module.exports = isPlainObject;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max,
	    nativeMin = Math.min;

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now = function() {
	  return root.Date.now();
	};

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var lastArgs,
	      lastThis,
	      maxWait,
	      result,
	      timerId,
	      lastCallTime,
	      lastInvokeTime = 0,
	      leading = false,
	      maxing = false,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber(wait) || 0;
	  if (isObject(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }

	  function invokeFunc(time) {
	    var args = lastArgs,
	        thisArg = lastThis;

	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }

	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }

	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime,
	        result = wait - timeSinceLastCall;

	    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
	  }

	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime;

	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
	      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	  }

	  function timerExpired() {
	    var time = now();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }

	  function trailingEdge(time) {
	    timerId = undefined;

	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }

	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }

	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now());
	  }

	  function debounced() {
	    var time = now(),
	        isInvoking = shouldInvoke(time);

	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;

	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = debounce;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _tinycolor = __webpack_require__(28);

	var _tinycolor2 = _interopRequireDefault(_tinycolor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {

	  simpleCheckForValidColor: function simpleCheckForValidColor(data) {
	    var keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'a', 'v'];
	    var checked = 0;
	    var passed = 0;
	    for (var i = 0; i < keysToCheck.length; i++) {
	      var letter = keysToCheck[i];
	      if (data[letter]) {
	        checked++;
	        if (!isNaN(data[letter])) {
	          passed++;
	        }
	      }
	    }

	    if (checked === passed) {
	      return data;
	    }
	  },

	  toState: function toState(data, oldHue) {
	    var color = data.hex ? (0, _tinycolor2.default)(data.hex) : (0, _tinycolor2.default)(data);
	    var hsl = color.toHsl();
	    var hsv = color.toHsv();
	    if (hsl.s === 0) {
	      hsl.h = oldHue || 0;
	      hsv.h = oldHue || 0;
	    }

	    return {
	      hsl: hsl,
	      hex: '#' + color.toHex(),
	      rgb: color.toRgb(),
	      hsv: hsv,
	      oldHue: data.h || oldHue || hsl.h,
	      source: data.source
	    };
	  },

	  isValidHex: function isValidHex(hex) {
	    return (0, _tinycolor2.default)(hex).isValid();
	  }

	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// jscs: disable

	// TinyColor v1.1.2
	// https://github.com/bgrins/TinyColor
	// Brian Grinstead, MIT License

	(function() {

	var trimLeft = /^[\s,#]+/;
	var trimRight = /\s+$/;
	var tinyCounter = 0;
	var math = Math;
	var mathRound = math.round;
	var mathMin = math.min;
	var mathMax = math.max;
	var mathRandom = math.random;

	function tinycolor(color, opts) {

			color = (color) ? color : '';
			opts = opts || { };

			// If input is already a tinycolor, return itself
			if (color instanceof tinycolor) {
				 return color;
			}
			// If we are called as a function, call using new instead
			if (!(this instanceof tinycolor)) {
					return new tinycolor(color, opts);
			}

			var rgb = inputToRGB(color);
			this._originalInput = color,
			this._r = rgb.r,
			this._g = rgb.g,
			this._b = rgb.b,
			this._a = rgb.a,
			this._roundA = mathRound(100*this._a) / 100,
			this._format = opts.format || rgb.format;
			this._gradientType = opts.gradientType;

			// Don't let the range of [0,255] come back in [0,1].
			// Potentially lose a little bit of precision here, but will fix issues where
			// .5 gets interpreted as half of the total, instead of half of 1
			// If it was supposed to be 128, this was already taken care of by `inputToRgb`
			if (this._r < 1) { this._r = mathRound(this._r); }
			if (this._g < 1) { this._g = mathRound(this._g); }
			if (this._b < 1) { this._b = mathRound(this._b); }

			this._ok = rgb.ok;
			this._tc_id = tinyCounter++;
	}

	tinycolor.prototype = {
			isDark: function() {
					return this.getBrightness() < 128;
			},
			isLight: function() {
					return !this.isDark();
			},
			isValid: function() {
					return this._ok;
			},
			getOriginalInput: function() {
				return this._originalInput;
			},
			getFormat: function() {
					return this._format;
			},
			getAlpha: function() {
					return this._a;
			},
			getBrightness: function() {
					//http://www.w3.org/TR/AERT#color-contrast
					var rgb = this.toRgb();
					return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
			},
			getLuminance: function() {
					//http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
					var rgb = this.toRgb();
					var RsRGB, GsRGB, BsRGB, R, G, B;
					RsRGB = rgb.r/255;
					GsRGB = rgb.g/255;
					BsRGB = rgb.b/255;

					if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
					if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
					if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
					return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
			},
			setAlpha: function(value) {
					this._a = boundAlpha(value);
					this._roundA = mathRound(100*this._a) / 100;
					return this;
			},
			toHsv: function() {
					var hsv = rgbToHsv(this._r, this._g, this._b);
					return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
			},
			toHsvString: function() {
					var hsv = rgbToHsv(this._r, this._g, this._b);
					var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
					return (this._a == 1) ?
						"hsv("	+ h + ", " + s + "%, " + v + "%)" :
						"hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
			},
			toHsl: function() {
					var hsl = rgbToHsl(this._r, this._g, this._b);
					return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
			},
			toHslString: function() {
					var hsl = rgbToHsl(this._r, this._g, this._b);
					var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
					return (this._a == 1) ?
						"hsl("	+ h + ", " + s + "%, " + l + "%)" :
						"hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
			},
			toHex: function(allow3Char) {
					return rgbToHex(this._r, this._g, this._b, allow3Char);
			},
			toHexString: function(allow3Char) {
					return '#' + this.toHex(allow3Char);
			},
			toHex8: function() {
					return rgbaToHex(this._r, this._g, this._b, this._a);
			},
			toHex8String: function() {
					return '#' + this.toHex8();
			},
			toRgb: function() {
					return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
			},
			toRgbString: function() {
					return (this._a == 1) ?
						"rgb("	+ mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
						"rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
			},
			toPercentageRgb: function() {
					return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
			},
			toPercentageRgbString: function() {
					return (this._a == 1) ?
						"rgb("	+ mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
						"rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
			},
			toName: function() {
					if (this._a === 0) {
							return "transparent";
					}

					if (this._a < 1) {
							return false;
					}

					return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
			},
			toFilter: function(secondColor) {
					var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
					var secondHex8String = hex8String;
					var gradientType = this._gradientType ? "GradientType = 1, " : "";

					if (secondColor) {
							var s = tinycolor(secondColor);
							secondHex8String = s.toHex8String();
					}

					return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
			},
			toString: function(format) {
					var formatSet = !!format;
					format = format || this._format;

					var formattedString = false;
					var hasAlpha = this._a < 1 && this._a >= 0;
					var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

					if (needsAlphaFormat) {
							// Special case for "transparent", all other non-alpha formats
							// will return rgba when there is transparency.
							if (format === "name" && this._a === 0) {
									return this.toName();
							}
							return this.toRgbString();
					}
					if (format === "rgb") {
							formattedString = this.toRgbString();
					}
					if (format === "prgb") {
							formattedString = this.toPercentageRgbString();
					}
					if (format === "hex" || format === "hex6") {
							formattedString = this.toHexString();
					}
					if (format === "hex3") {
							formattedString = this.toHexString(true);
					}
					if (format === "hex8") {
							formattedString = this.toHex8String();
					}
					if (format === "name") {
							formattedString = this.toName();
					}
					if (format === "hsl") {
							formattedString = this.toHslString();
					}
					if (format === "hsv") {
							formattedString = this.toHsvString();
					}

					return formattedString || this.toHexString();
			},

			_applyModification: function(fn, args) {
					var color = fn.apply(null, [this].concat([].slice.call(args)));
					this._r = color._r;
					this._g = color._g;
					this._b = color._b;
					this.setAlpha(color._a);
					return this;
			},
			lighten: function() {
					return this._applyModification(lighten, arguments);
			},
			brighten: function() {
					return this._applyModification(brighten, arguments);
			},
			darken: function() {
					return this._applyModification(darken, arguments);
			},
			desaturate: function() {
					return this._applyModification(desaturate, arguments);
			},
			saturate: function() {
					return this._applyModification(saturate, arguments);
			},
			greyscale: function() {
					return this._applyModification(greyscale, arguments);
			},
			spin: function() {
					return this._applyModification(spin, arguments);
			},

			_applyCombination: function(fn, args) {
					return fn.apply(null, [this].concat([].slice.call(args)));
			},
			analogous: function() {
					return this._applyCombination(analogous, arguments);
			},
			complement: function() {
					return this._applyCombination(complement, arguments);
			},
			monochromatic: function() {
					return this._applyCombination(monochromatic, arguments);
			},
			splitcomplement: function() {
					return this._applyCombination(splitcomplement, arguments);
			},
			triad: function() {
					return this._applyCombination(triad, arguments);
			},
			tetrad: function() {
					return this._applyCombination(tetrad, arguments);
			}
	};

	// If input is an object, force 1 into "1.0" to handle ratios properly
	// String input requires "1.0" as input, so 1 will be treated as 1
	tinycolor.fromRatio = function(color, opts) {
			if (typeof color == "object") {
					var newColor = {};
					for (var i in color) {
							if (color.hasOwnProperty(i)) {
									if (i === "a") {
											newColor[i] = color[i];
									}
									else {
											newColor[i] = convertToPercentage(color[i]);
									}
							}
					}
					color = newColor;
			}

			return tinycolor(color, opts);
	};

	// Given a string or object, convert that input to RGB
	// Possible string inputs:
	//
	//		 "red"
	//		 "#f00" or "f00"
	//		 "#ff0000" or "ff0000"
	//		 "#ff000000" or "ff000000"
	//		 "rgb 255 0 0" or "rgb (255, 0, 0)"
	//		 "rgb 1.0 0 0" or "rgb (1, 0, 0)"
	//		 "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
	//		 "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
	//		 "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
	//		 "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
	//		 "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
	//
	function inputToRGB(color) {

			var rgb = { r: 0, g: 0, b: 0 };
			var a = 1;
			var ok = false;
			var format = false;

			if (typeof color == "string") {
					color = stringInputToObject(color);
			}

			if (typeof color == "object") {
					if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
							rgb = rgbToRgb(color.r, color.g, color.b);
							ok = true;
							format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
					}
					else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
							color.s = convertToPercentage(color.s, 1);
							color.v = convertToPercentage(color.v, 1);
							rgb = hsvToRgb(color.h, color.s, color.v);
							ok = true;
							format = "hsv";
					}
					else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
							color.s = convertToPercentage(color.s);
							color.l = convertToPercentage(color.l);
							rgb = hslToRgb(color.h, color.s, color.l);
							ok = true;
							format = "hsl";
					}

					if (color.hasOwnProperty("a")) {
							a = color.a;
					}
			}

			a = boundAlpha(a);

			return {
					ok: ok,
					format: color.format || format,
					r: mathMin(255, mathMax(rgb.r, 0)),
					g: mathMin(255, mathMax(rgb.g, 0)),
					b: mathMin(255, mathMax(rgb.b, 0)),
					a: a
			};
	}


	// Conversion Functions
	// --------------------

	// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
	// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

	// `rgbToRgb`
	// Handle bounds / percentage checking to conform to CSS color spec
	// <http://www.w3.org/TR/css3-color/>
	// *Assumes:* r, g, b in [0, 255] or [0, 1]
	// *Returns:* { r, g, b } in [0, 255]
	function rgbToRgb(r, g, b){
			return {
					r: bound01(r, 255) * 255,
					g: bound01(g, 255) * 255,
					b: bound01(b, 255) * 255
			};
	}

	// `rgbToHsl`
	// Converts an RGB color value to HSL.
	// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
	// *Returns:* { h, s, l } in [0,1]
	function rgbToHsl(r, g, b) {

			r = bound01(r, 255);
			g = bound01(g, 255);
			b = bound01(b, 255);

			var max = mathMax(r, g, b), min = mathMin(r, g, b);
			var h, s, l = (max + min) / 2;

			if(max == min) {
					h = s = 0; // achromatic
			}
			else {
					var d = max - min;
					s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
					switch(max) {
							case r: h = (g - b) / d + (g < b ? 6 : 0); break;
							case g: h = (b - r) / d + 2; break;
							case b: h = (r - g) / d + 4; break;
					}

					h /= 6;
			}

			return { h: h, s: s, l: l };
	}

	// `hslToRgb`
	// Converts an HSL color value to RGB.
	// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
	// *Returns:* { r, g, b } in the set [0, 255]
	function hslToRgb(h, s, l) {
			var r, g, b;

			h = bound01(h, 360);
			s = bound01(s, 100);
			l = bound01(l, 100);

			function hue2rgb(p, q, t) {
					if(t < 0) t += 1;
					if(t > 1) t -= 1;
					if(t < 1/6) return p + (q - p) * 6 * t;
					if(t < 1/2) return q;
					if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
					return p;
			}

			if(s === 0) {
					r = g = b = l; // achromatic
			}
			else {
					var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
					var p = 2 * l - q;
					r = hue2rgb(p, q, h + 1/3);
					g = hue2rgb(p, q, h);
					b = hue2rgb(p, q, h - 1/3);
			}

			return { r: r * 255, g: g * 255, b: b * 255 };
	}

	// `rgbToHsv`
	// Converts an RGB color value to HSV
	// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
	// *Returns:* { h, s, v } in [0,1]
	function rgbToHsv(r, g, b) {

			r = bound01(r, 255);
			g = bound01(g, 255);
			b = bound01(b, 255);

			var max = mathMax(r, g, b), min = mathMin(r, g, b);
			var h, s, v = max;

			var d = max - min;
			s = max === 0 ? 0 : d / max;

			if(max == min) {
					h = 0; // achromatic
			}
			else {
					switch(max) {
							case r: h = (g - b) / d + (g < b ? 6 : 0); break;
							case g: h = (b - r) / d + 2; break;
							case b: h = (r - g) / d + 4; break;
					}
					h /= 6;
			}
			return { h: h, s: s, v: v };
	}

	// `hsvToRgb`
	// Converts an HSV color value to RGB.
	// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
	// *Returns:* { r, g, b } in the set [0, 255]
	 function hsvToRgb(h, s, v) {

			h = bound01(h, 360) * 6;
			s = bound01(s, 100);
			v = bound01(v, 100);

			var i = math.floor(h),
					f = h - i,
					p = v * (1 - s),
					q = v * (1 - f * s),
					t = v * (1 - (1 - f) * s),
					mod = i % 6,
					r = [v, q, p, p, t, v][mod],
					g = [t, v, v, q, p, p][mod],
					b = [p, p, t, v, v, q][mod];

			return { r: r * 255, g: g * 255, b: b * 255 };
	}

	// `rgbToHex`
	// Converts an RGB color to hex
	// Assumes r, g, and b are contained in the set [0, 255]
	// Returns a 3 or 6 character hex
	function rgbToHex(r, g, b, allow3Char) {

			var hex = [
					pad2(mathRound(r).toString(16)),
					pad2(mathRound(g).toString(16)),
					pad2(mathRound(b).toString(16))
			];

			// Return a 3 character hex if possible
			if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
					return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
			}

			return hex.join("");
	}
			// `rgbaToHex`
			// Converts an RGBA color plus alpha transparency to hex
			// Assumes r, g, b and a are contained in the set [0, 255]
			// Returns an 8 character hex
			function rgbaToHex(r, g, b, a) {

					var hex = [
							pad2(convertDecimalToHex(a)),
							pad2(mathRound(r).toString(16)),
							pad2(mathRound(g).toString(16)),
							pad2(mathRound(b).toString(16))
					];

					return hex.join("");
			}

	// `equals`
	// Can be called with any tinycolor input
	tinycolor.equals = function (color1, color2) {
			if (!color1 || !color2) { return false; }
			return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
	};
	tinycolor.random = function() {
			return tinycolor.fromRatio({
					r: mathRandom(),
					g: mathRandom(),
					b: mathRandom()
			});
	};


	// Modification Functions
	// ----------------------
	// Thanks to less.js for some of the basics here
	// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

	function desaturate(color, amount) {
			amount = (amount === 0) ? 0 : (amount || 10);
			var hsl = tinycolor(color).toHsl();
			hsl.s -= amount / 100;
			hsl.s = clamp01(hsl.s);
			return tinycolor(hsl);
	}

	function saturate(color, amount) {
			amount = (amount === 0) ? 0 : (amount || 10);
			var hsl = tinycolor(color).toHsl();
			hsl.s += amount / 100;
			hsl.s = clamp01(hsl.s);
			return tinycolor(hsl);
	}

	function greyscale(color) {
			return tinycolor(color).desaturate(100);
	}

	function lighten (color, amount) {
			amount = (amount === 0) ? 0 : (amount || 10);
			var hsl = tinycolor(color).toHsl();
			hsl.l += amount / 100;
			hsl.l = clamp01(hsl.l);
			return tinycolor(hsl);
	}

	function brighten(color, amount) {
			amount = (amount === 0) ? 0 : (amount || 10);
			var rgb = tinycolor(color).toRgb();
			rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
			rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
			rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
			return tinycolor(rgb);
	}

	function darken (color, amount) {
			amount = (amount === 0) ? 0 : (amount || 10);
			var hsl = tinycolor(color).toHsl();
			hsl.l -= amount / 100;
			hsl.l = clamp01(hsl.l);
			return tinycolor(hsl);
	}

	// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
	// Values outside of this range will be wrapped into this range.
	function spin(color, amount) {
			var hsl = tinycolor(color).toHsl();
			var hue = (mathRound(hsl.h) + amount) % 360;
			hsl.h = hue < 0 ? 360 + hue : hue;
			return tinycolor(hsl);
	}

	// Combination Functions
	// ---------------------
	// Thanks to jQuery xColor for some of the ideas behind these
	// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

	function complement(color) {
			var hsl = tinycolor(color).toHsl();
			hsl.h = (hsl.h + 180) % 360;
			return tinycolor(hsl);
	}

	function triad(color) {
			var hsl = tinycolor(color).toHsl();
			var h = hsl.h;
			return [
					tinycolor(color),
					tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
					tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
			];
	}

	function tetrad(color) {
			var hsl = tinycolor(color).toHsl();
			var h = hsl.h;
			return [
					tinycolor(color),
					tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
					tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
					tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
			];
	}

	function splitcomplement(color) {
			var hsl = tinycolor(color).toHsl();
			var h = hsl.h;
			return [
					tinycolor(color),
					tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
					tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
			];
	}

	function analogous(color, results, slices) {
			results = results || 6;
			slices = slices || 30;

			var hsl = tinycolor(color).toHsl();
			var part = 360 / slices;
			var ret = [tinycolor(color)];

			for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
					hsl.h = (hsl.h + part) % 360;
					ret.push(tinycolor(hsl));
			}
			return ret;
	}

	function monochromatic(color, results) {
			results = results || 6;
			var hsv = tinycolor(color).toHsv();
			var h = hsv.h, s = hsv.s, v = hsv.v;
			var ret = [];
			var modification = 1 / results;

			while (results--) {
					ret.push(tinycolor({ h: h, s: s, v: v}));
					v = (v + modification) % 1;
			}

			return ret;
	}

	// Utility Functions
	// ---------------------

	tinycolor.mix = function(color1, color2, amount) {
			amount = (amount === 0) ? 0 : (amount || 50);

			var rgb1 = tinycolor(color1).toRgb();
			var rgb2 = tinycolor(color2).toRgb();

			var p = amount / 100;
			var w = p * 2 - 1;
			var a = rgb2.a - rgb1.a;

			var w1;

			if (w * a == -1) {
					w1 = w;
			} else {
					w1 = (w + a) / (1 + w * a);
			}

			w1 = (w1 + 1) / 2;

			var w2 = 1 - w1;

			var rgba = {
					r: rgb2.r * w1 + rgb1.r * w2,
					g: rgb2.g * w1 + rgb1.g * w2,
					b: rgb2.b * w1 + rgb1.b * w2,
					a: rgb2.a * p	+ rgb1.a * (1 - p)
			};

			return tinycolor(rgba);
	};


	// Readability Functions
	// ---------------------
	// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

	// `contrast`
	// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
	tinycolor.readability = function(color1, color2) {
			var c1 = tinycolor(color1);
			var c2 = tinycolor(color2);
			return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
	};

	// `isReadable`
	// Ensure that foreground and background color combinations meet WCAG2 guidelines.
	// The third argument is an optional Object.
	//			the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
	//			the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
	// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

	// *Example*
	//		tinycolor.isReadable("#000", "#111") => false
	//		tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false

	tinycolor.isReadable = function(color1, color2, wcag2) {
			var readability = tinycolor.readability(color1, color2);
			var wcag2Parms, out;

			out = false;

			wcag2Parms = validateWCAG2Parms(wcag2);
			switch (wcag2Parms.level + wcag2Parms.size) {
					case "AAsmall":
					case "AAAlarge":
							out = readability >= 4.5;
							break;
					case "AAlarge":
							out = readability >= 3;
							break;
					case "AAAsmall":
							out = readability >= 7;
							break;
			}
			return out;

	};

	// `mostReadable`
	// Given a base color and a list of possible foreground or background
	// colors for that base, returns the most readable color.
	// Optionally returns Black or White if the most readable color is unreadable.
	// *Example*
	//		tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
	//		tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();	// "#ffffff"
	//		tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
	//		tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"


	tinycolor.mostReadable = function(baseColor, colorList, args) {
			var bestColor = null;
			var bestScore = 0;
			var readability;
			var includeFallbackColors, level, size ;
			args = args || {};
			includeFallbackColors = args.includeFallbackColors ;
			level = args.level;
			size = args.size;

			for (var i= 0; i < colorList.length ; i++) {
					readability = tinycolor.readability(baseColor, colorList[i]);
					if (readability > bestScore) {
							bestScore = readability;
							bestColor = tinycolor(colorList[i]);
					}
			}

			if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
					return bestColor;
			}
			else {
					args.includeFallbackColors=false;
					return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
			}
	};


	// Big List of Colors
	// ------------------
	// <http://www.w3.org/TR/css3-color/#svg-color>
	var names = tinycolor.names = {
			aliceblue: "f0f8ff",
			antiquewhite: "faebd7",
			aqua: "0ff",
			aquamarine: "7fffd4",
			azure: "f0ffff",
			beige: "f5f5dc",
			bisque: "ffe4c4",
			black: "000",
			blanchedalmond: "ffebcd",
			blue: "00f",
			blueviolet: "8a2be2",
			brown: "a52a2a",
			burlywood: "deb887",
			burntsienna: "ea7e5d",
			cadetblue: "5f9ea0",
			chartreuse: "7fff00",
			chocolate: "d2691e",
			coral: "ff7f50",
			cornflowerblue: "6495ed",
			cornsilk: "fff8dc",
			crimson: "dc143c",
			cyan: "0ff",
			darkblue: "00008b",
			darkcyan: "008b8b",
			darkgoldenrod: "b8860b",
			darkgray: "a9a9a9",
			darkgreen: "006400",
			darkgrey: "a9a9a9",
			darkkhaki: "bdb76b",
			darkmagenta: "8b008b",
			darkolivegreen: "556b2f",
			darkorange: "ff8c00",
			darkorchid: "9932cc",
			darkred: "8b0000",
			darksalmon: "e9967a",
			darkseagreen: "8fbc8f",
			darkslateblue: "483d8b",
			darkslategray: "2f4f4f",
			darkslategrey: "2f4f4f",
			darkturquoise: "00ced1",
			darkviolet: "9400d3",
			deeppink: "ff1493",
			deepskyblue: "00bfff",
			dimgray: "696969",
			dimgrey: "696969",
			dodgerblue: "1e90ff",
			firebrick: "b22222",
			floralwhite: "fffaf0",
			forestgreen: "228b22",
			fuchsia: "f0f",
			gainsboro: "dcdcdc",
			ghostwhite: "f8f8ff",
			gold: "ffd700",
			goldenrod: "daa520",
			gray: "808080",
			green: "008000",
			greenyellow: "adff2f",
			grey: "808080",
			honeydew: "f0fff0",
			hotpink: "ff69b4",
			indianred: "cd5c5c",
			indigo: "4b0082",
			ivory: "fffff0",
			khaki: "f0e68c",
			lavender: "e6e6fa",
			lavenderblush: "fff0f5",
			lawngreen: "7cfc00",
			lemonchiffon: "fffacd",
			lightblue: "add8e6",
			lightcoral: "f08080",
			lightcyan: "e0ffff",
			lightgoldenrodyellow: "fafad2",
			lightgray: "d3d3d3",
			lightgreen: "90ee90",
			lightgrey: "d3d3d3",
			lightpink: "ffb6c1",
			lightsalmon: "ffa07a",
			lightseagreen: "20b2aa",
			lightskyblue: "87cefa",
			lightslategray: "789",
			lightslategrey: "789",
			lightsteelblue: "b0c4de",
			lightyellow: "ffffe0",
			lime: "0f0",
			limegreen: "32cd32",
			linen: "faf0e6",
			magenta: "f0f",
			maroon: "800000",
			mediumaquamarine: "66cdaa",
			mediumblue: "0000cd",
			mediumorchid: "ba55d3",
			mediumpurple: "9370db",
			mediumseagreen: "3cb371",
			mediumslateblue: "7b68ee",
			mediumspringgreen: "00fa9a",
			mediumturquoise: "48d1cc",
			mediumvioletred: "c71585",
			midnightblue: "191970",
			mintcream: "f5fffa",
			mistyrose: "ffe4e1",
			moccasin: "ffe4b5",
			navajowhite: "ffdead",
			navy: "000080",
			oldlace: "fdf5e6",
			olive: "808000",
			olivedrab: "6b8e23",
			orange: "ffa500",
			orangered: "ff4500",
			orchid: "da70d6",
			palegoldenrod: "eee8aa",
			palegreen: "98fb98",
			paleturquoise: "afeeee",
			palevioletred: "db7093",
			papayawhip: "ffefd5",
			peachpuff: "ffdab9",
			peru: "cd853f",
			pink: "ffc0cb",
			plum: "dda0dd",
			powderblue: "b0e0e6",
			purple: "800080",
			rebeccapurple: "663399",
			red: "f00",
			rosybrown: "bc8f8f",
			royalblue: "4169e1",
			saddlebrown: "8b4513",
			salmon: "fa8072",
			sandybrown: "f4a460",
			seagreen: "2e8b57",
			seashell: "fff5ee",
			sienna: "a0522d",
			silver: "c0c0c0",
			skyblue: "87ceeb",
			slateblue: "6a5acd",
			slategray: "708090",
			slategrey: "708090",
			snow: "fffafa",
			springgreen: "00ff7f",
			steelblue: "4682b4",
			tan: "d2b48c",
			teal: "008080",
			thistle: "d8bfd8",
			tomato: "ff6347",
			turquoise: "40e0d0",
			violet: "ee82ee",
			wheat: "f5deb3",
			white: "fff",
			whitesmoke: "f5f5f5",
			yellow: "ff0",
			yellowgreen: "9acd32"
	};

	// Make it easy to access colors via `hexNames[hex]`
	var hexNames = tinycolor.hexNames = flip(names);


	// Utilities
	// ---------

	// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
	function flip(o) {
			var flipped = { };
			for (var i in o) {
					if (o.hasOwnProperty(i)) {
							flipped[o[i]] = i;
					}
			}
			return flipped;
	}

	// Return a valid alpha value [0,1] with all invalid values being set to 1
	function boundAlpha(a) {
			a = parseFloat(a);

			if (isNaN(a) || a < 0 || a > 1) {
					a = 1;
			}

			return a;
	}

	// Take input from [0, n] and return it as [0, 1]
	function bound01(n, max) {
			if (isOnePointZero(n)) { n = "100%"; }

			var processPercent = isPercentage(n);
			n = mathMin(max, mathMax(0, parseFloat(n)));

			// Automatically convert percentage into number
			if (processPercent) {
					n = parseInt(n * max, 10) / 100;
			}

			// Handle floating point rounding errors
			if ((math.abs(n - max) < 0.000001)) {
					return 1;
			}

			// Convert into [0, 1] range if it isn't already
			return (n % max) / parseFloat(max);
	}

	// Force a number between 0 and 1
	function clamp01(val) {
			return mathMin(1, mathMax(0, val));
	}

	// Parse a base-16 hex value into a base-10 integer
	function parseIntFromHex(val) {
			return parseInt(val, 16);
	}

	// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
	// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
	function isOnePointZero(n) {
			return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
	}

	// Check to see if string passed in is a percentage
	function isPercentage(n) {
			return typeof n === "string" && n.indexOf('%') != -1;
	}

	// Force a hex value to have 2 characters
	function pad2(c) {
			return c.length == 1 ? '0' + c : '' + c;
	}

	// Replace a decimal with it's percentage value
	function convertToPercentage(n, multiplier) {
			multiplier = multiplier || 100;
			if (n <= 1) {
					n = (n * multiplier) + "%";
			}

			return n;
	}

	// Converts a decimal to a hex value
	function convertDecimalToHex(d) {
			return Math.round(parseFloat(d) * 255).toString(16);
	}
	// Converts a hex value to a decimal
	function convertHexToDecimal(h) {
			return (parseIntFromHex(h) / 255);
	}

	var matchers = (function() {

			// <http://www.w3.org/TR/css3-values/#integers>
			var CSS_INTEGER = "[-\\+]?\\d+%?";

			// <http://www.w3.org/TR/css3-values/#number-value>
			var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

			// Allow positive/negative integer/number.	Don't capture the either/or, just the entire outcome.
			var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

			// Actual matching.
			// Parentheses and commas are optional, but not required.
			// Whitespace can take the place of commas or opening paren
			var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
			var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

			return {
					rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
					rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
					hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
					hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
					hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
					hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
					hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
					hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
					hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
			};
	})();

	// `stringInputToObject`
	// Permissive string parsing.	Take in a number of formats, and output an object
	// based on detected format.	Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
	function stringInputToObject(color) {

			color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
			var named = false;
			if (names[color]) {
					color = names[color];
					named = true;
			}
			else if (color == 'transparent') {
					return { r: 0, g: 0, b: 0, a: 0, format: "name" };
			}

			// Try to match string input using regular expressions.
			// Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
			// Just return an object and let the conversion functions handle that.
			// This way the result will be the same whether the tinycolor is initialized with string or object.
			var match;
			if ((match = matchers.rgb.exec(color))) {
					return { r: match[1], g: match[2], b: match[3] };
			}
			if ((match = matchers.rgba.exec(color))) {
					return { r: match[1], g: match[2], b: match[3], a: match[4] };
			}
			if ((match = matchers.hsl.exec(color))) {
					return { h: match[1], s: match[2], l: match[3] };
			}
			if ((match = matchers.hsla.exec(color))) {
					return { h: match[1], s: match[2], l: match[3], a: match[4] };
			}
			if ((match = matchers.hsv.exec(color))) {
					return { h: match[1], s: match[2], v: match[3] };
			}
			if ((match = matchers.hsva.exec(color))) {
					return { h: match[1], s: match[2], v: match[3], a: match[4] };
			}
			if ((match = matchers.hex8.exec(color))) {
					return {
							a: convertHexToDecimal(match[1]),
							r: parseIntFromHex(match[2]),
							g: parseIntFromHex(match[3]),
							b: parseIntFromHex(match[4]),
							format: named ? "name" : "hex8"
					};
			}
			if ((match = matchers.hex6.exec(color))) {
					return {
							r: parseIntFromHex(match[1]),
							g: parseIntFromHex(match[2]),
							b: parseIntFromHex(match[3]),
							format: named ? "name" : "hex"
					};
			}
			if ((match = matchers.hex3.exec(color))) {
					return {
							r: parseIntFromHex(match[1] + '' + match[1]),
							g: parseIntFromHex(match[2] + '' + match[2]),
							b: parseIntFromHex(match[3] + '' + match[3]),
							format: named ? "name" : "hex"
					};
			}

			return false;
	}

	function validateWCAG2Parms(parms) {
			// return valid WCAG2 parms for isReadable.
			// If input parms are invalid, return {"level":"AA", "size":"small"}
			var level, size;
			parms = parms || {"level":"AA", "size":"small"};
			level = (parms.level || "AA").toUpperCase();
			size = (parms.size || "small").toLowerCase();
			if (level !== "AA" && level !== "AAA") {
					level = "AA";
			}
			if (size !== "small" && size !== "large") {
					size = "small";
			}
			return {"level":level, "size":size};
	}
	// Node: Export function
	if (typeof module !== "undefined" && module.exports) {
			module.exports = tinycolor;
	}
	// AMD/requirejs: Define the module
	else if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {return tinycolor;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	// Browser: Expose to window
	else {
			window.tinycolor = tinycolor;
	}

	})();


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ChromePointer = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ChromePointer = exports.ChromePointer = function (_ReactCSS$Component) {
	  _inherits(ChromePointer, _ReactCSS$Component);

	  function ChromePointer() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, ChromePointer);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ChromePointer.__proto__ || Object.getPrototypeOf(ChromePointer)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(ChromePointer, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          picker: {
	            width: '10px',
	            height: '16px',
	            borderRadius: '5px',
	            transform: 'translate(-5px, 0px)',
	            backgroundColor: 'rgb(248, 248, 248)',
	            boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement('div', { style: this.styles().picker });
	    }
	  }]);

	  return ChromePointer;
	}(_reactcss2.default.Component);

	exports.default = ChromePointer;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ChromePointerCircle = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ChromePointerCircle = exports.ChromePointerCircle = function (_ReactCSS$Component) {
	  _inherits(ChromePointerCircle, _ReactCSS$Component);

	  function ChromePointerCircle() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, ChromePointerCircle);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ChromePointerCircle.__proto__ || Object.getPrototypeOf(ChromePointerCircle)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(ChromePointerCircle, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          picker: {
	            width: '12px',
	            height: '12px',
	            borderRadius: '6px',
	            boxShadow: 'inset 0 0 0 1px #fff',
	            transform: 'translate(-6px, -6px)'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement('div', { style: this.styles().picker });
	    }
	  }]);

	  return ChromePointerCircle;
	}(_reactcss2.default.Component);

	exports.default = ChromePointerCircle;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.CompactColor = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactcss = __webpack_require__(4);

	var _reactcss2 = _interopRequireDefault(_reactcss);

	var _reactAddonsShallowCompare = __webpack_require__(17);

	var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var CompactColor = exports.CompactColor = function (_ReactCSS$Component) {
	  _inherits(CompactColor, _ReactCSS$Component);

	  function CompactColor() {
	    var _ref;

	    var _temp, _this, _ret;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, CompactColor);

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CompactColor.__proto__ || Object.getPrototypeOf(CompactColor)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default.bind(_this, _this, arguments[0], arguments[1]), _this.handleClick = function () {
	      _this.props.onClick({ hex: _this.props.color });
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(CompactColor, [{
	    key: 'classes',
	    value: function classes() {
	      return {
	        'default': {
	          color: {
	            background: this.props.color,
	            //width: '15px',
	            height: '15px',
	            // float: 'left',
	            //margin: '4px 2px',
	            //marginBottom: '5px',
	            //position: 'relative',
	            cursor: 'pointer',
	            flexGrow: '1'
	          }
	        }
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement('div', { style: this.styles().color, ref: 'color', onClick: this.handleClick });
	    }
	  }]);

	  return CompactColor;
	}(_reactcss2.default.Component);

	exports.default = CompactColor;

/***/ }
/******/ ]);