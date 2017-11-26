module.exports = function (app) {
    return {
        _ : require('lodash'),
        memory: { BM: [], _ks: [] },
        find: function (type, _k, _this) {
            if (_this != null) {
                return _this.memory[type][_k]
            } else {
                return this.memory[type][_k]
            }
        },
        setinMemory: function (type, _d, _f, _exit, exitType) {
            _this = this
            _ = this._
            _r = {}
            if (_.isArray(_d)) {
                _.forEach(_d, function (val) {
                    //debugger
                    _r = { } //_f(val)
                    _r[_f(val)] = val
                    _this.memory[type].push( _r ) 
                })
            } else {
                if (_.isString(_d) && _.isNumber(_f)) {
                    _r[_d] = _f
                    _this.push(type,_r)
                }
            }
            if(_exit)
                return _exit(exitType , _d, this)
        },
        push: function (type, _r) {
            this.memory[type].push(_r)
        }
    }
}