module.exports = function (app ) {
           
    return {
         IOCommand: 'IA',
         io: require('socket.io-client'),
         cbStack: {},
         init: function ( IpService ,options, callback) {
            //var _this = this
            app.socket = this.io.connect(IpService, { reconnect: true })
            //options.socket.firstConnect = true
            app.socket.on('connect', function () {
                app.socket.removeListener(options.IOCommand);
                
 
                app.socket.on(options.IOCommand, function (data) {
                            console.log('(' + app.socket.id + ') receive event:' + data.action)
                            options.receive[data.action](options, data, callback)
                    })
                  
                    
                
                
                //var _this = this
                setTimeout(function () {
                    //console.log('send IA handshake')
                    options.send('handshake', {})
                }, 100)
            });
            app.socket.on('disconnect', function () {
                console.log('Disconnected!');
            });
            console.log('esperando handshake de IA KAOS155!');
            


         },
         receive: {
             handshake: function (_this, data, callback) {
                 //_this.send('handshake', data)
                 callback(_this.socket)
             },
             setinMemory: function (_this, data) {
                 if (app.IA.cbStack[data.action] != null) {
                     var _f = app.IA.cbStack[data.action]
                     app.IA.cbStack[data.action] = null
                     _f(data)
                 }
             },
         },
         send: function (Command, data, callback) {
             
             if(callback!=null)
                 app.IA.cbStack[Command] = callback

             app.socket.emit(this.IOCommand, { action: Command, data: data })
         }
     }
    
}