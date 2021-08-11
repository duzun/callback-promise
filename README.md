# callback-promise [![Build Status](https://travis-ci.com/duzun/callback-promise.svg?branch=master)](https://travis-ci.com/duzun/callback-promise) [![codecov](https://codecov.io/gh/duzun/callback-promise/branch/master/graph/badge.svg)](https://codecov.io/gh/duzun/callback-promise)

Convert callback style APIs to Promise based APIs.

Suitable for Browsers and Node.js.

Pure JS for best performance, no `eval`s, `with`s or other "dangerous" constructs used.

## Breaking Changes

#### **v0.5.0**
 - The `this` of the arguments transformation function became the promise:

```js
const papi = c2p(obj, meth, function (...args) {
    const context = this; 
    // in v0.4 context === obj, 
    // in v0.5 context.this === obj, 
    //     and context is the promise object returned by papi()
    ...
});

let promise = papi(x, y, z);
// promise.this === obj
```

## Install

- Just add a script tag to your page (Browser):
 
```html
<script src="https://unpkg.com/callback-promise"></script>
```

- Alternatively copy `c2p.js` to your project or install it using npm:
```sh
npm install callback-promise
```

- Then `import` `c2p` to your app (ESM):
```js
import c2p from 'callback-promise';
```

- or `require` `c2p` (AMD or CommonJs):
```js
const c2p = require('callback-promise');
```


- Make sure there is a `Promise` implementation or get a polyfill like [es6-promise](https://www.npmjs.com/package/es6-promise).

```js
c2p.Promise = require('es6-promise').Promise; // polyfill
```


## Usage

- Convert any API based on callbacks to promises

```js
// convert speciffic methods
var pAPI = {
    meth: c2p([API, ]API.meth, resultArgNo, errorArgNo, cbAtStart, noCb),
};

// or convert the entire API object
var pAPI = c2p.all(API[, dest_pAPI], resultArgNo, errorArgNo, cbAtStart, noCb);


// @param any      API        - a context object for API.meth.
// @param Function meth       - a function (name on API) that accepts a callback argument and optinally other arguments.
// @param int     resultArgNo - argument number of result in callback. If false, all arguments are considered the result.
// @param int     errorArgNo  - argument number of error in callback.
// @param Boolean cbAtStart   - if _fn expects callback as first argument, set this to true.
// @param Boolean noCb        - if true, the new version of _fn doesn't accept the callback argument.

// Note: All argumetns except .meth are optional

// @return Function that accepts same arguments as _fn, except callback, and returns a Promise
```

- Now you can use your new `pAPI`

```js
pAPI.meth(arg1, arg2, ...)
    .then(function(result){...})
    .catch(function(error){...})
;

// equivalent with old API

API.meth(arg1, arg2, ..., function (some, args, with, result, and, error){
    if ( error ) ...;
    ...
})
```


## Examples

### Node API

```js
// Common Node.js code
fs.readFile(filename, function (error, data) {
    if ( error ) {
        ...
    }
    else {
        ...
    }
});

// convert to Promise based API:
pfs.readFile = c2p(fs.readFile, 1, 0);
// same with explicit arguments mapping
pfs.readFile = c2p(fs.readFile, function (error, data) {
    if ( error ) throw error;
    return data;
});
// or with this
pfs.readFile = c2p(fs, 'readFile', 1, 0);

// then
pfs.readFile(filename)
    .then(function (data) { })
    .catch(function (error) { })
;
```

### Callback with sync return

```js
// Node.js method that accepts a callback and returns an EventEmitter
var child = child_process.exec(command, options, function (error, stdout, stderr){ ... });
var pid = child.pid;
child.stdin.end();

// convert to Promise base API:
pchild_process.exec = c2p(child_process.exec, 1, 0);


// then
var pchild = pchild_process.exec(command, options);

var child = pchild.result; // like an event in jQuery
var pid = child.pid;
child.stdin.end();

pchild
    .then(function (stdout){ ... })
    .catch(function (error){ ... })
;


// and if you need to catch stderr, use the callback:
var pchild = pchild_process.exec(command, options, function (error, stdout, stderr){ ... })
    .then(function(stdout){ ... })
    .catch(function (error){ ... })
;

```


### Chrome Extension API

```js
// Common Chrome Extension code
chrome.tabs.update(tabId, props, function (tab) {});

// becomes:
pchrome.tabs.update = c2p(chrome.tabs.update);
// or with this
pchrome.tabs.update = c2p(chrome.tabs, 'update');
// either
pchrome.tabs.update = c2p(chrome.tabs, chrome.tabs.update);
// either with explicit arguments mapping and API error handling
pchrome.tabs.update = c2p(chrome.tabs.update, function (tab) {
    var error = chrome.runtime.lastError;
    if ( error ) throw error;
    return tab;
});

// then
pchrome.tabs.update(tabId, props)
    .then(function (tab) {})
    .catch(function (error) {})
;
```


### Other use cases

```js
var wait = c2p(setTimeout, true);
wait(100).then(function () { doSomethingLater() })
```


## Testing

```sh
npm test     # test in node
npm test-dev # test in browsers using karma with livereload
```


# to be continued ...

