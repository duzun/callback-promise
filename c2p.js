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
 *   @version 0.3.0
 *   @repo    https://github.com/duzun/callback-promise
 *   @author  Dumitru Uzun (DUzun.Me)
 */
// -----------------------------------------------------------
// -----------------------------------------------------------
// @TODO:
// c2p(JSON, 'stringify')({some:'data'}).then(function (str) { })
// c2p(JSON.parse)('{"some":"data"}').then(function (obj) { })
// c2pWithCb(setTimeout, true)(cb, 10).then(function () { })


// -----------------------------------------------------------
;(function (name, global, undefined) {
    'use strict';

    var UNDEFINED = undefined + ''
    ,   FUNCTION  = 'function'
    ,   Promise   = global.Promise

    // Native methods
    ,   _hop = ({}).hasOwnProperty

    ,   _splice = [].splice

    ,   _push  = [].push || function (e) {
            var len = this.length >>> 0;
            this[len] = e;
            return this.length = len+1;
        }

    ,   _unshift = [].unshift || function (e) {
            _splice.call( arguments, 0, 0, 0, 0 );
            _splice.apply( this, arguments );
            return( this.length );
        }
    ;

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
     * @param any      _this      - a context object for _fn.
     * @param Function _fn        - a function (name on _this) that accepts a callback argument and optinally other arguments.
     * @param int     resultArgNo - argument number of result in callback. If false, all arguments are considered the result.
     * @param int     errorArgNo  - argument number of error in callback.
     * @param Boolean cbAtStart   - if _fn expects callback as first argument, set this to true.
     * @param Boolean noCb        - if true, the new version of _fn doesn't accept the callback argument.
     *
     * Note: All argumetns except _fn are optional
     *
     * @return Function that accepts same arguments as _fn, except callback, and returns a Promise
     */
    function c2p(_this, _fn, resultArgNo, errorArgNo, cbAtStart, noCb) {
        // No _this arguments
        if ( typeof _this == FUNCTION ) {
            // shift arguments to the right
            noCb        = cbAtStart;
            cbAtStart   = errorArgNo;
            errorArgNo  = resultArgNo;
            resultArgNo = _fn;
            _fn         = _this;
            _this       = undefined;
        }
        // There is _this argument
        else {
            // with _this, _fn could be method name
            if ( typeof _fn != FUNCTION ) {
                _fn = _this[_fn];
            }
        }

        if ( resultArgNo === true && cbAtStart == undefined ) {
            cbAtStart = resultArgNo;
            resultArgNo = undefined;
            if ( errorArgNo === true && noCb == undefined ) {
                noCb = errorArgNo;
                errorArgNo = undefined;
            }
        }

        var resolver
        ,   rejecter
        ;

        if ( resultArgNo === false ) {
            resolver = function (args, resolve) {
                resolve(args);
            };
        }
        else
        if ( typeof resultArgNo == FUNCTION ) {
            resolver = function (args, resolve, promise, self) {
                resolve(resultArgNo.apply(_this || self, args));
            };
        }
        else {
            resultArgNo = +resultArgNo || 0;
            resolver = function (args, resolve) {
                resolve(args[resultArgNo]);
            };
        }

        if ( errorArgNo != undefined ) {
            errorArgNo = +errorArgNo || 0;
            rejecter = function (args) {
                var error = args[errorArgNo];
                if ( error != undefined ) throw error;
            }
        }

        return function _promised_fn_(_fn_args_) {
            var args = arguments;
            var Prom = _promised_fn_.Promise || c2p.Promise || Promise;
            var self = _this || this;
            var result;
            var promise = new Prom(function (resolve, reject) {
                var cbArg;
                var cb = function () {
                    try {
                        var _args = arguments;
                        rejecter && rejecter(_args);
                        cbArg && cbArg.apply(this, _args);
                        resolver(_args, resolve, promise, self);
                    }
                    catch(error) {
                        reject(error);
                    }
                };

                if ( !noCb ) {
                    var cbIdx = cbAtStart ? 0 : args.length-1;
                    cbArg = args[cbIdx];

                    // args contains a callback
                    if ( typeof cbArg == FUNCTION ) {
                        args[cbIdx] = cb;
                    }
                    // args doesn't contain a callback
                    else {
                        cbArg = undefined;
                    }
                }
                // add callback to args
                if ( !cbArg ) {
                    (cbAtStart?_unshift:_push).call(args, cb);
                }

                result = _fn.apply(self, args);
            });

            // Kind of event.result in jQuery
            if ( result != undefined ) {
                promise.result = result;
            }
            return promise;
        }
    }

    // -----------------------------------------------------------
    /**
     * Converts all methods of _src to promise based.
     *
     * @param Object  _src        - an object with some methods
     * @param Object  _dest       - promised methods go here.
     * @param int     resultArgNo - argument number of result in callback
     * @param int     errorArgNo  - argument number of error in callback
     * @param Boolean cbAtStart   - if _fn expects callback as first argument, set this to true
     *
     *
     * @return Object _dest
     */
    function c2p_all(_src, _dest, resultArgNo, errorArgNo, cbAtStart, noCb) {
        if ( typeof _dest != 'object' ) {
            noCb        = cbAtStart;
            cbAtStart   = errorArgNo;
            errorArgNo  = resultArgNo;
            resultArgNo = _dest;
            _dest = {};
        }
        for(var _fn in _src) if ( _hop.call(_src, _fn) && typeof _src[_fn] == FUNCTION ) {
            _dest[_fn] = c2p(_src[_fn], resultArgNo, errorArgNo, cbAtStart, noCb);
        }
        return _dest;
    }
    // -----------------------------------------------------------
    c2p.all = c2p_all;

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
