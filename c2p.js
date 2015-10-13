/**
 * callback-promise
 *
 * Convert callback style APIs to Promise based APIs.
 *
 * https://github.com/duzun/callback-promise
 *
 * Usage:
 *      c2p(fs.readFile, 1, 0)(filename)
 *          .then(function (data) { })
 *          .catch(function (error) { })
 *
 *      c2p(chrome.tabs, 'update')(tabId, props)
 *         .then(function (tab) {})
 *         .catch(function (error) {})
 *
 *
 * @version 0.1.1
 */
// -----------------------------------------------------------
// -----------------------------------------------------------
// @TODO:
// c2p(setTimeout, true)(10).then(function () { })
// c2p(JSON, 'stringify')({some:'data'}).then(function (str) { })
// c2p(JSON.parse)('{"some":"data"}').then(function (obj) { })



// -----------------------------------------------------------
;(function (name, global, undefined) {
    'use strict';

    var UNDEFINED = undefined + ''
    ,   FUNCTION  = 'function'
    ,   Promise   = global.Promise
    ;

    // Native methods
    var _splice = [].splice;
    var _push  = [].push || function (e) {
        var len = this.length >>> 0;
        this[len] = e;
        return this.length = len+1;
    };
    
    var _unshift = [].unshift || function (e) {
        _splice.call( arguments, 0, 0, 0, 0 );
        _splice.apply( this, arguments );
        return( this.length );
    };
    
    // var _slice = [].slice;
(
    typeof define !== FUNCTION || !define.amd ? typeof module != UNDEFINED && module.exports
    // CommonJS
  ? function (deps, factory) { module.exports = factory(); }
    // Browser
  : function (deps, factory) { global[name] = factory(); }
    // AMD
  : define
)
/*define*/([], function factory() {

    // -----------------------------------------------------------
    function c2p(_this, _fn, resultArgNo, errorArgNo, cbAtStart) {
        // No _this arguments
        if ( typeof _this == FUNCTION ) {
            // shift arguments to the right
            errorArgNo  = resultArgNo;
            resultArgNo = _fn;
            _fn         = _this;
            _this       = undefined;
        }
        else {
            // with _this, _fn could be method name
            if ( typeof _fn != FUNCTION ) {
                _fn = _this[_fn];
            }
        }
        if ( resultArgNo === true && cbAtStart == undefined ) {
            cbAtStart = resultArgNo;
            resultArgNo = undefined;
        }

        return function (_fn_args_) {
            var args = arguments;
            var promise = new c2p.Promise(function (resolve, reject) {
                var cb = resolve;
                if ( typeof resultArgNo == FUNCTION ) {
                    cb = function (res) {
                        try {
                            res = resultArgNo(arguments);
                            resolve(res);
                        }
                        catch(error) {
                            reject(error);
                        }
                    };
                }
                else {
                    resultArgNo = +resultArgNo || 0;
                    if ( errorArgNo != undefined ) {
                        cb = function (res) {
                            var error = arguments[+errorArgNo || 0];
                            if ( error ) {
                                reject(error);
                            }
                            else {
                                resolve(arguments[resultArgNo]);
                            }
                        };
                    }
                    else if ( resultArgNo ) {
                        cb = function (res) {
                            resolve(arguments[resultArgNo]);
                        };
                    }
                }

                (cbAtStart?_unshift:_push).call(args, cb);
                _fn.apply(_this, args);
            });
            return promise;
        }
    }

    // -----------------------------------------------------------
    /// Same as _.constant() in LoDash
    c2p.val = function (value) {
        return function () { return value; }
    };

    c2p.Promise = Promise;

    return c2p;
});
    // -----------------------------------------------------------
}
('c2p', typeof global == 'undefined' ? this : global));
