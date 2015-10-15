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
        try {
            c2p.Promise = require('es6-promise').Promise;
        }
        catch(err){}
    }

    function fn(arg1, arg2, cb_) {
        var args = slice.call(arguments);
        var cb = args.pop();
        var _this = this;
        setTimeout(function () {
            cb.call(_this, {args:args, that:_this});
        });
    }

    function fnf(cb_, arg1, arg2) {
        var args = slice.call(arguments);
        var cb = args.shift();
        var _this = this;
        setTimeout(function () {
            cb.call(_this, {args:args, that:_this});
        });
    }

    function nfn(arg1, arg2, cb_) {
        var args = slice.call(arguments);
        var cb = args.pop();
        var _this = this;
        setTimeout(function () {
            cb.apply(_this, args);
        });
    }


    describe("c2p", function () {
        it('c2p.Promise or global.Promise should be defined', function () {
            expect(c2p.Promise).toEqual(jasmine.any(Function));
        });
    });

    describe("c2p(fn)(args...)", function () {
        it('should pass all args to fn()', function (done) {
            var a1 = Math.random();
            var a2 = function () {};
            var a3 = 'test';
            c2p(fn)
            .call(a2, a1, a2, a3)
            .then(function (o) {
                expect([a1,a2,a3]).toEqual(o.args, 'fn() should get all arguments passed to c2p(fn)()');
                expect(a2).toBe(o.that, 'should pass this to fn()');
            })
            .then(done)
            ;
        });
        it('should catch errors in fn()', function (done) {
            var _error;
            try {
                c2p(function (cb) {
                    someError;
                    cb();
                })
                ()
                .then(function () {
                    expect(_error).toBeFalsy('should never get here');
                    done();
                })
                .catch(function (error) {
                    expect(error).toBeTruthy('should catch an error');
                    done();
                })
            }
            catch(error) {
                _error = error;
            }
            expect(_error).toBeFalsy('should not throw error synchronously');
        });
    });
    describe("c2p(context, fn)(args...)", function () {
        it('should call context.fn()', function (done) {
            var _that = {r:Math.random()};
            c2p(_that, fn)
            ('arg1')
            .then(function (o) {
                expect(_that).toEqual(o.that);
                expect(['arg1']).toEqual(o.args);
            })
            .then(done)
            ;
        });
        it('should call context[fn] when fn is string', function (done) {
            var _that = {r:Math.random(),fn:fn};
            c2p(_that, 'fn')
            ('arg1')
            .then(function (o) {
                expect(_that).toBe(o.that);
                expect(['arg1']).toEqual(o.args);
            })
            .then(done)
            ;
        });
    });
    describe("c2p(fn, 1, 0)(args...) - node.js style", function () {
        it('should get result from second callback argument', function (done) {
            var res = {data:Math.random()};
            c2p(nfn, 1, 0)
            (null, res)
            .then(function (o) {
                expect(res).toEqual(o);
                done();
            })
            .catch(function (error) {
                expect(error).toBeFalsy('should never be called');
                done();
            })
            .then(done)
            ;
        });
        it('should throw error from first callback argument', function (done) {
            var _error = 'error arg';
            c2p(nfn, 1, 0)
            (_error)
            .then(function (o) {
                expect(true).toBeFalsy('should never be called');
                done();
            })
            .catch(function (error) {
                expect(error).toEqual(_error);
                done();
            })
            .then(done)
            ;
        });
    });

    describe("c2p(fn, true)(args...)", function () {
        it('should accept callback as first argument of fn()', function (done) {
            var a1 = Math.random();
            var a2 = function () {};
            var a3 = 'test';
            c2p(fnf, true)(a1, a2, a3)
            .then(function (o) {
                expect([a1,a2,a3]).toEqual(o.args);
            })
            .then(done)
            ;
        });
    });

    describe("c2p(fn, argsMapper)(args...)", function () {
        it('return of argsMapper() should be the resolved value', function (done) {
            var a1 = function () {};
            var a2 = 'test';
            var a3 = Math.random();
            c2p(nfn, function (a1, a2, a3) { return a3; })
            (a1, a2, a3)
            .then(function (o) {
                expect(a3).toEqual(o);
            })
            .catch(function (error) {
                expect(error).toBeFalsy();
            })
            .then(done)
            ;
        });
    });

    describe('c2p.all(obj)', function () {
        it('should return an object with all methods promised', function (done) {
            var _obj = {
                    f: fn
                  , n: 213
                  , s: 'string'
                  , o: {a:'b'}
                  , a: [1,2,3]
                }
            ,   _res = c2p.all(_obj)
            ;
            expect(_res.n).toBe(undefined);
            expect(_res.s).toBe(undefined);
            expect(_res.o).toBe(undefined);
            expect(_res.a).toBe(undefined);
            expect(_res.f).toEqual(jasmine.any(Function));

            _res.f(1,'2',[3])
            .then(function (o) {
                expect([1,'2',[3]]).toEqual(o.args);
                expect(_res).toEqual(o.that);
            })
            .then(function () {
                return _res.f.call(_obj, 1,'2',[3])
                .then(function (o) {
                    expect([1,'2',[3]]).toEqual(o.args);
                    expect(_obj).toEqual(o.that);
                })
            })
            .then(done)
            .catch(function (error) {
                expect(error).toBeFalsy('should not throw');
                done();
            })
            ;
        });
    });

    describe('c2p.all(obj, dest)', function () {
        it('should promise all methods of obj on dest', function (done) {
            var _obj = {
                    f: fn
                  , g: fn
                  , n: 213
                  , s: 'string'
                  , o: {a:'b'}
                  , a: [1,2,3]
                }
            ,   _dest = {}
            ,   _res = c2p.all(_obj, _dest)
            ;
            expect(_res).toBe(_dest);
            expect(_res.n).toBe(undefined);
            expect(_res.s).toBe(undefined);
            expect(_res.o).toBe(undefined);
            expect(_res.a).toBe(undefined);
            expect(_res.f).toEqual(jasmine.any(Function));
            expect(_res.g).toEqual(jasmine.any(Function));

            _res.f(1,'2',[3])
            .then(function (o) {
                expect([1,'2',[3]]).toEqual(o.args);
                expect(_res).toEqual(o.that);
            })
            .then(done)
            .catch(function (error) {
                expect(error).toBeFalsy('should not throw');
                done();
            })
            ;
        });
    });

  });

}
('c2pSpec', typeof global == 'undefined' ? this : global));




