(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.c2p = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  /**
   * Convert callback style APIs to Promise based APIs.
   *
   *   @license MIT
   *   @version 0.5.0
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
  // Native methods/constructs
  var GlobalPromise = typeof Promise != 'undefined' ? Promise : undefined;
  var _ref = {},
      hasOwnProperty = _ref.hasOwnProperty;
  var _ref2 = [],
      unshift = _ref2.unshift,
      push = _ref2.push,
      slice = _ref2.slice; // -----------------------------------------------------------

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
   * Note: All arguments except _fn are optional
   *
   * @return Function that accepts same arguments as _fn, except callback, and returns a Promise
   *
   * Usage:
   *      c2p(fs.readFile, 1, 0)(filename)
   *          .then(function (data) { })
   *          .catch(function (error) { })
   *
   *      c2p(chrome.tabs, 'update')(tabId, props)
   *         .then(function (tab) {})
   *         .catch(function (error) {})
   */

  function c2p(_this, _fn, resultArgNo, errorArgNo, cbAtStart, noCb) {
    // No _this arguments
    if (isFunction(_this)) {
      // shift arguments to the right
      noCb = cbAtStart;
      cbAtStart = errorArgNo;
      errorArgNo = resultArgNo;
      resultArgNo = _fn;
      _fn = _this;
      _this = undefined;
    } // There is _this argument
    else {
      // with _this, _fn could be method name
      if (!isFunction(_fn)) {
        _fn = _this[_fn];
      }
    }

    if (resultArgNo === true && cbAtStart == undefined) {
      cbAtStart = resultArgNo;
      resultArgNo = undefined;

      if (errorArgNo === true && noCb == undefined) {
        noCb = errorArgNo;
        errorArgNo = undefined;
      }
    }

    var resolver, rejecter;

    if (resultArgNo === false) {
      resolver = function resolver(args, resolve) {
        resolve(args);
      };
    } else if (isFunction(resultArgNo)) {
      resolver = function resolver(args, resolve, promise, self) {
        // promise.this === self
        // promise.result = _fn()
        resolve(resultArgNo.apply(promise, args));
      };
    } else {
      resultArgNo = +resultArgNo || 0;

      resolver = function resolver(args, resolve) {
        resolve(args[resultArgNo]);
      };
    }

    if (errorArgNo != undefined) {
      errorArgNo = +errorArgNo || 0;

      rejecter = function rejecter(args) {
        var error = args[errorArgNo];
        if (error != undefined) throw error;
      };
    }

    return function _promised_fn_(_fn_args_) {
      var args = arguments;
      var Prom = _promised_fn_.Promise || c2p.Promise || GlobalPromise;
      var self = _this || this;
      var result;
      var promise = new Prom(function (resolve, reject) {
        var cbArg;

        var cb = function cb() {
          try {
            var _args = slice.call(arguments);

            rejecter && rejecter(_args);
            cbArg && cbArg.apply(this, _args);
            resolver(_args, resolve, promise, self);
          } catch (error) {
            reject(error);
          }
        };

        if (!noCb) {
          var cbIdx = cbAtStart ? 0 : args.length - 1;
          cbArg = args[cbIdx]; // args contains a callback

          if (isFunction(cbArg)) {
            args[cbIdx] = cb;
          } // args doesn't contain a callback
          else {
            cbArg = undefined;
          }
        } // add callback to args


        if (!cbArg) {
          (cbAtStart ? unshift : push).call(args, cb);
        }

        result = _fn.apply(self, args);
      });
      if (self) promise["this"] = self; // Kind of event.result in jQuery

      if (result != undefined) {
        promise.result = result;
      }

      return promise;
    };
  } // -----------------------------------------------------------

  /**
   * Convert a promise to Node.js style callback call.
   *
   * @param {Primise} promise
   * @param {Function(error, result)} cb
   */

  function p2c(promise, cb) {
    cb && promise.then(function (r) {
      return cb(undefined, r);
    }, cb);
    return promise;
  } // -----------------------------------------------------------

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
    if (_typeof(_dest) != 'object') {
      noCb = cbAtStart;
      cbAtStart = errorArgNo;
      errorArgNo = resultArgNo;
      resultArgNo = _dest;
      _dest = {};
    }

    for (var _fn in _src) {
      if (hasOwnProperty.call(_src, _fn) && isFunction(_src[_fn])) {
        _dest[_fn] = c2p(_src[_fn], resultArgNo, errorArgNo, cbAtStart, noCb);
      }
    }

    return _dest;
  } // -----------------------------------------------------------


  c2p.all = c2p_all;
  c2p.p2c = p2c; /// Promise implementation used

  c2p.Promise = GlobalPromise; // -----------------------------------------------------------
  /// Same as _.constant() in LoDash

  c2p.val = _constant;

  function _constant(value) {
    return function () {
      return value;
    };
  }

  function isFunction(fn) {
    return typeof fn === 'function';
  } // -----------------------------------------------------------

  return c2p;

})));
