module.exports = function (app, callback) {

    var _m = {
            _: require('lodash'),
            shorthash: require('shorthash'),

            init: function (options, callback) {
                callback(options)
            },
            RAM: { },
            find: function (type, _k, _this) {
                if (_this != null) {
                    return _this.RAM[type][_k]
                } else {
                    return this.RAM[type][_k]
                }
            },
            setinMemory: function (type, _d, _f, _exit, exitType) {
                _this = this
                _ = this._
                _r = {}
                var _e = 0
                var _t = {}
                var _x = []
                var _y = []
                var _a = []

                if(_this.RAM[type] ==null)
                    _this.RAM[type] = {}

                _.forEach(_d, function (val) {
                    _v = _this[ _f.split(".")[0] ][_f.split(".")[1]](val)  //convertimos el valor aplicandole la funcion _f = plugin.funcion (viene desde el cliente por los datos de socket IO)
                    
                    if (_this.RAM[type][_v] == null) {
                        _this.RAM[type][_v] = _.size(_this.RAM[type]) + 1 //calculamos el numero de elementos para obtener un Id numerico 
                        _a[_a.length] = true
                    } else {
                        _a[_a.length] = false
                    }
                    _t[_v] = _this.RAM[type][_v]
                    _x[_x.length] = _v
                    _y[_y.length] = _t[_v]
                })
                if(_exit)
                    return _exit(_x, _y, _a)
            },
            push: function (type, _r) {
                this.RAM[type].push(_r)
            }
    }
    _m.init(_m, callback)
}
