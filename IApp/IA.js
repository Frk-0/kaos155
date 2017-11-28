

var App = {
        
        init: function (app) {
            require('./IA/MemoryMind.js')(app, function ( memory ) { 
                app._io = require('./IA/IO.js')(app, memory)
                app.io = app._io.listen(app._io, require('socket.io').listen(8080) )
            })
        }
    }

    App.init(App)
