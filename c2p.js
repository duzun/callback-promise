/**
 * callback-promise
 *
 * Convert callback style APIs to Promise based APIs.
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
 *   @license MIT
 *   @version 0.2.0
 *   @repo    https://github.com/duzun/callback-promise
 *   @author  Dumitru Uzun (DUzun.Me)
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
    var _hop = ({}).hasOwnProperty;
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
    /**
     * Converts a callback-based function or method to promise based function.
     *
     * @param any      _this      - a context object for _fn
     * @param Function _fn        - a function (name on _this) that accepts a callback argument and optinally other arguments.
     * @param int     resultArgNo - argument number of result in callback
     * @param int     errorArgNo  - argument number of error in callback
     * @param Boolean cbAtStart   - if _fn expects callback as first argument, set this to true
     *
     * Note: All argumetns except _fn are optional
     *
     * @return Function that accepts same arguments as _fn, except callback, and returns a Promise
     */
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

        return function _promised_fn_(_fn_args_) {
            var args = arguments;
            var Prom = _promised_fn_.Promise || c2p.Promise || Promise;
            var self = _this || this;
            var promise = new Prom(function (resolve, reject) {
                var cb = resolve;
                if ( typeof resultArgNo == FUNCTION ) {
                    cb = function (res) {
                        try {
                            res = resultArgNo.apply(self, arguments);
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
                _fn.apply(self, args);
            });
            return promise;
        }
    }

    // -----------------------------------------------------------
    c2p.all = c2p_all;

    function c2p_all(_src, _dest, resultArgNo, errorArgNo, cbAtStart) {
        if ( typeof _dest != 'object' ) {
            cbAtStart = errorArgNo;
            errorArgNo = resultArgNo;
            resultArgNo = _dest;
            _dest = {};
        }
        for(var _fn in _src) if ( _hop.call(_src, _fn) && typeof _src[_fn] == FUNCTION ) {
            _dest[_fn] = c2p(_src[_fn], resultArgNo, errorArgNo, cbAtStart);
        }
        return _dest;
    }
    // -----------------------------------------------------------
    /// Promise implementation used
    c2p.Promise = Promise;

    // -----------------------------------------------------------
    /// Same as _.constant() in LoDash
    c2p.val = function (value) {
        return function () { return value; }
    };

    return c2p;
});
    // -----------------------------------------------------------
}
('c2p', typeof global == 'undefined' ? this : global));
