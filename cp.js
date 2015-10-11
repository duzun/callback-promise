/**
 * callback-promise
 *
 * https://github.com/duzun/callback-promise
 *
 * @version 0.0.1
 */
// -----------------------------------------------------------
// -----------------------------------------------------------
// @TODO:
// cp(JSON, 'stringify')({some:'data'}).then(function (str) { })
// cp(JSON.parse)('{"some":"data"}').then(function (obj) { })

// -----------------------------------------------------------
var _slice = [].slice;
var _push = [].push;

function cp(_this, _fn, _resArgNo, _errArgNo) {
    // No _this arguments
    if ( typeof _this == 'function' ) {
        // shift arguments to the right
        _errArgNo = _resArgNo;
        _resArgNo = _fn;
        _fn = _this;
        _this = undefined;
    }
    else {
        // with _this, _fn could be method name
        if ( typeof _fn != 'function' ) {
            _fn = _this[_fn];
        }
    }

    return function () {
        var args = arguments;
        var promise = new cp.Promise(function (_resolve, _reject) {
            var _cb = resolve;
            if ( typeof _resArgNo == 'function' ) {
                _cb = function (res) {
                    try {
                        res = _resArgNo(arguments);
                        _resolve(res);
                    }
                    catch(error) {
                        _reject(error);
                    }
                };
            }
            else {
                _resArgNo = +_resArgNo || 0;
                if ( _errArgNo != undefined ) {
                    _cb = function (res) {
                        var error = arguments[+_errArgNo || 0];
                        if ( error ) {
                            _reject(error);
                        }
                        else {
                            _resolve(arguments[_resArgNo]);
                        }
                    };
                }
                else if ( _resArgNo ) {
                    _cb = function (res) {
                        _resolve(arguments[_resArgNo]);
                    };
                }
            }

            _push.call(args, _cb);
            _fn.apply(_this, args);
        });
        return promise;
    }
}

/// Same as _.constant() in LoDash
cp.val = function (value) {
    return function () { return value; }
};

cp.Promise = Promise;
