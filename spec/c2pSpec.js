// -----------------------------------------------------
/**
 *  callback-promise tests
 *
 *  @author DUzun.Me
 */
// -----------------------------------------------------
;(function (name, global) {
  'use strict';

  (typeof define == 'function' && define.amd
      ? define
      : (function (require) {
          return typeof module != 'undefined' && module.exports
              ? function (deps, factory) { module.exports = factory(require, module, require('../c2p')); }
              : function (deps, factory) { global[name] = factory(require, undefined, global.c2p); }
      }
      (typeof require == 'function' ? require : function (id){return global[id]}))
  )
  /*define*/(
  ['require', 'module'
      , '../c2p'
  ]
  , function (require, module, c2p) {

    var log = console.log.bind(console);
    var slice = [].slice;

    if(!c2p.Promise) {
        console.warn('Warning: No Promise support!');
    }
    
    var cbAtEnd = c2p(function (arg1, arg2, cb_) {
        var args = slice.call(arguments);
        var cb = args.pop();
        var _this = this;
        setTimeout(function () { cb.call(_this, args); });
    });

    describe("c2p(fn)(args)", function () {
        it('should pass all args to fn()', function (done) {
            var a1 = Math.random();
            var a2 = 'test';
            var a3 = function () {};
            cbAtEnd(a1, a2, a3)
            .then(function (args) {
                expect([a1,a2,a3]).toEqual(args);
            })
            .then(done)
            ;
        });
    });
  });

}('c2pSpec', typeof global == 'undefined' ? this : global));
