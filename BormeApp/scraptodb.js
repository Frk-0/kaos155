﻿var Version = '0.0.1'
//debugger
console.log('loading Scrap - version -' + Version)
var myArgs = process.argv.slice(2);

if (myArgs.length == 0)
    myArgs = ['BOE', '2016'] //, 'BOE-B-2003-31017' ]

if (myArgs[0] != 'BORME') {

    var date = new Date(myArgs[1].substr(0, 4), 0, 1) //myArgs[1])

    if (date.getDay() == 0) {
        date.setDate(date.getDate() + 1)
    }
} else {

    var date = new Date(myArgs[1].substr(0, 4), 0, 2) //myArgs[1])
    if (date.getDay() == 6) {
        date.setDate(date.getDate() + 1)

    }
    if (date.getDay() == 0) {
        date.setDate(date.getDate() + 1)

    }
}

//
//ampliacion de primitivas para cadenas
// string.Trim()
// string.pad()
// string.Between()
// string.replaceAll()
// string.indexOfRegex()
//
String.prototype.Trim = function Trim(x) {
    if (typeof x === 'object') {
        for (i in x) {
            x[i] = x[i].replace(/^\s+|\s+$/gm, '');
        }
        return x
    } else {
        return x.replace(/^\s+|\s+$/gm, '');
    }
}

String.prototype.pad = function (size) {
    var s = "000000000" + this;
    return s.substr(s.length - size);
}

String.prototype.Between = function (init, last, contains, not) {
    var string = this.toString()
    var _exit = ""
    var _i = 0
    while (string.indexOf(last, _i) > 0) {
        var _str = ""
        var pf = pi = string.indexOf(last, _i)
        //var found = false
        while (pi > 0 && string.substr(pi, 1) != init) {
            var char = string.substr(pi, 1)
            if (char != not)
                _str = char + _str
            pi--
        }
        if (_str.indexOf(contains) > -1)
            _exit = ''.Trim(_str.substr(0, _str.indexOf(contains))) + (_exit.length > 0 ? ';' : '') + _exit
        string = string.substr(pf + 1, string.length)
    }
    return _exit.length > 0 ? _exit : null
}

String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};
String.prototype.indexOfRegex = function (regex) {
    var match = this.match(regex);
    return match ? this.indexOf(match[0]) : -1;
}

String.prototype.lastIndexOfRegex = function (regex) {
    var match = this.match(regex);
    return match ? this.lastIndexOf(match[match.length - 1]) : -1;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// comienzo de la aplicación
//
// app

var App = {
    update: myArgs[2],
    anyo: !isNaN(myArgs[1]) ? myArgs[1] : date.getFullYear(),
    TypeBoletines: ["BORME", "BOE", "BOCM"],
    Mins: { BOE: 1995, BOCM: 2010, BORME: 2009 },
    timeDelay: 1500,
    drop: false,
    SqlIP: null, //'192.168.0.3',
    urlBOE: 'http://81.89.32.200/',
    urlBORME: 'http://81.89.32.200/',
    urlBOCM: 'http://w3.bocm.es/boletin/CM',
    PDFStore: "../DataFiles/_almacen/PDF/",
    mysql: require('mysql'),
    iconv: require('iconv-lite'),
    request: require('request'),
    mkdirp: require('mkdirp'),
    cheerio: require('cheerio'),
    path: require('path'),
    fs: require("fs"),
    http: require('http'),
    _xData: {
        VisualCif: {
            Ranking: {
                Directivos: [],
                Empresas: []
            },
            Empresa: 0,
            Directivo: 0,
            counter: 1
        },
        Sumario: {
            BOE: { SUMARIO_LAST: '', SUMARIO_NEXT: 'BOE-S-19950102' },
            BORME: { SUMARIO_LAST: '', SUMARIO_NEXT: 'BORME-S-20090102' },
            BOCM: { SUMARIO_LAST: '', SUMARIO_NEXT: 'BOCM-S-20100212' }
        },
        TSUMARIOS: {
            BOE: {},
            BORME: {},
            BOCM: {}
        },
        TBOE: 0,
        TBORME: 0,
        TBOCM: 0
    },
    _lData: {},
    poolSql: [],
    Rutines: function (app) {
        _this = this
        return require('./node_app/func_common.js')(app)
    },
    init: function (app, cb) {


        this.pdftotext = require('./node_app/pdftotext.js')
        require('./node_app/sql_common.js')(app, function (SQL) {
            app.commonSQL = SQL

            cb({
                BOCM: function (dataFile) {
                    // require('./node_app/parser/borme.js')(app, false, dataFile, function (options) {
                    //app.Borme = options
                    require('./node_app/parser/bocm.js')(app, function (options) {
                        app.getCounter(app, options, 'BOCM', function (options) {
                            options._common.Actualize(options, 'BOCM', { desde: app._xData.Sumario.BOCM.SUMARIO_NEXT.substr(7, 8), type: "BOCM", hasta: new Date() })
                        })
                    })
                    //})
                },
                BOE: function (dataFile) {
                    //require('./node_app/parser/borme.js')(app, false, dataFile, function (Borme) {
                    //app.Borme = options
                    require('./node_app/parser/boe.js')(app, function (options) {
                        app.BOE = options
                        //options.Borme = Borme
                        app.getCounter(app, options, 'BOE', function (options) {
                            options._common.Actualize(options, 'BOE', { desde: app._xData.Sumario.BOE.SUMARIO_NEXT.substr(6, 8), type: "BOE", Secciones: "5A", hasta: new Date() })
                        })
                    })
                    //})
                },
                BORME: function (dataFile) {
                    require('./node_app/parser/borme.js')(app, dataFile, function (options) {
                        app.getCounter(app, options, 'BORME', function (options) {
                            console.log('actualización de contadores OK')
                            options._common.Actualize(options, 'BORME', { desde: app._xData.Sumario.BORME.SUMARIO_NEXT.substr(8, 8), into: app._xData.Sumario.BORME.ID_LAST, type: "BORME", hasta: new Date() })
                        })
                    })
                    //})
                },
                CREATE: function (datafile) {
                    app.commonSQL.init({ SQL: { db: null } }, 'CREATE', function () {
                        process.exit(1)
                    })

                }
            })
            //})
        })
    },
    parameters: function (app, myArgs, callback) {


        var arg = myArgs[2]
        //app.SqlIP = myArgs[0]
        if (app.SqlIP != null && app.SqlIP != 'localhost') {
            if (app.SqlIP.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/g).length != 1) {
                app.SqlIP = 'localhost'
            }
        } else {
            app.SqlIP = 'localhost'
        }

        if (app.TypeBoletines.indexOf(myArgs[0]) == -1) {
            console.log('parametros no validos falta BOCM,BOE,BORME')
            process.exit(1)
        }

        app.Type = myArgs[0]
        callback(app)
    },
    getCounter: function (app, _options, type, callback) {
        _cadsql = "SELECT * FROM lastread WHERE Type = '" + type + "' AND Anyo = " + app.anyo
        _options.SQL.db.query(_cadsql, function (err, Record) {
            if (err)
                debugger
            if (Record.length == 0) {
                _cadsql = "INSERT INTO lastread (Type, Anyo, SUMARIO_NEXT) VALUES ('" + type + "'," + app.anyo + ",'" + type + "-S-" + app.initDate + "')"  //2001
                _options.SQL.db.query(_cadsql, function (err, _data) {
                    app._xData.Sumario[type] = { SUMARIO_LAST: '', SUMARIO_NEXT: type + '-S-' + app.initDate }
                })
            } else {
                app._xData.Sumario[type] = Record[0]
            }
            var _cadsql = "SELECT count(*) FROM sumarios WHERE Type='" + type + "'"
            _options.SQL.db.query(_cadsql, function (err, Record) {
                if (err)
                    app._xData.TSUMARIOS[type] = Record[0]["count(*)"]

                _cadsql = "SELECT count(*) FROM boletin where Type='" + type + "'"
                _options.SQL.db.query(_cadsql, function (err, Record) {
                    app._xData['T' + type] = Record[0]["count(*)"]
                    callback(_options)
                })
            })
        })
    }

}