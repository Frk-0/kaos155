
module.exports = function (app, memory) {

    return {
        IOCommand: 'IA',
        listen: function (options, io) {
                var _this = this
                ioevents: ['hello'],
                io.on('connection', function (socket) {
                    console.log('IA IO Connected!');
                    socket.removeAllListeners();

                    socket.on(options.IOCommand, function (data) {
                        console.log('(' + socket.id + ') receive event:' + data.action)
                        options.receive[data.action](options, socket, data)

                    })

                    socket.emit('connected')
                })
                io.on('disconnect', function (reason) {
                    debugger
                    console.log('disconnect', reason)
                })
            return io
        },
        receive: {
            handshake: function (_this, socket, data) {
                socket.emit( _this.IOCommand , data)
            },
            setinMemory: function (_this, socket, data) {
                var _t = data.data.type
                var _a = data.data.array 
                var _c = data.data.compress
                data.data = {}
                memory.setinMemory(_t, _a, _c, function (_keys,_ids, _add) {
                    data.data.array = { _keys: _keys, _id: _ids , add:_add }
                    socket.emit(_this.IOCommand, data )
                })
            }
        }
    }
}