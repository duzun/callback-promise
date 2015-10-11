# callback-promise
Convert callback style APIs to Promise based APIs

## Examples

### Node API

```javascript
// Common Node.js code
fs.readFile(filename, function (error, data) {
    if ( error ) {
        ...
    }
    else {
        ...
    }
});

// becomes:
pfs.readFile = cp(fs.readFile, 1, 0);
// or
pfs.readFile = cp(fs.readFile, function (error, data) {
    if ( error ) throw error;
    return data;
});
// or with this
pfs.readFile = cp(fs, 'readFile', 1, 0);

// then
pfs.readFile(filename)
    .then(function (data) { })
    .catch(function (error) { })
;
```

### Chrome Extension API

```javascript
// Common Chrome Extension code
chrome.tabs.update(tabId, props, function (tab) {});

// becomes:
pchrome.tabs.update = cp(chrome.tabs.update);

// or with this
pchrome.tabs.update = cp(chrome.tabs, 'update');
// or
pchrome.tabs.update = cp(chrome.tabs, chrome.tabs.update);
// or
pchrome.tabs.update = cp(chrome.tabs.update, function (tab) {
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

# to be continued ...

