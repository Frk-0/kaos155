module.exports = function (app,  callback) {
    
    options = {
        
        Command: app.command,
        Rutines: require('../utils/BORME/Borme_Rutines')(app, require('./BORME/Borme_Transforms')(app)),
        pdfOpc: ['-nopgbrk', '-enc UTF-8'],
        keyMap: [
            'Constitución.',
            'Apertura de sucursal.',
            'Objeto social.',
            'Ampliacion del objeto social.',
            'Cambio de domicilio social.',
            'Cambio de objeto social.',
            'Cambio objeto social.',
            'Sociedad unipersonal.',
            'Declaración de unipersonalidad.',
            'Nombramientos.',
            'Reelecciones.',
            'Modificación de poderes.',
            'Ceses/Dimisiones.',
            'Revocaciones.',
            'Datos registrales.',
            'Fe de erratas:'],
        url: app.urlBORME,
        _common: require('../parser_common')(app),
        SQL: { db: null },
        DirEmpresas: [],
        foundEmpresas: function (DirEmpresas, _empresa) {
            for (n in options.DirEmpresas) {
                if (options.DirEmpresas[n].Name == _empresa)
                    return options.DirEmpresas[n]
            }
            return false
        },
        parser: {
            saveLineaDeMovimientos: function (_linea, _cb) {
                //var _ok =false
                var _this = this

                _add = function (options, _linea) {
                    app.commonSQL.SQL.commands.insert.Borme.keys(options, _linea, function (_linea, _rec) {
                        _linea.ID = _rec[0][0].Id
                        options.parser.saveDiarioMovimientos(_linea, _cb)

                    }, _cb )
                        
                }
                if (_linea.addNew) {
                    _add(options, _linea)
                } else {
                    options.parser.saveDiarioMovimientos(_linea, _cb)
                }
            },
            saveDiarioMovimientos: function ( _linea, _ret ) {
                var saveLineContenido = function (  _e, _linea, _cb, _func) {
                    var _this = this
                    var line = _linea.contenido[e]
                    if (_e < _linea.contenido.length) {
                        if (options.Rutines.SQL[_linea.contenido[_e].type] == null)
                            debugger
                        //
                        // !!! Magic Point ¡¡¡¡
                        // ejecutamos una rutina especifica dependiendo del valor de Type
                        // 
                        options.Rutines.SQL[_linea.contenido[_e].type](_linea.contenido[_e], function (_Dl, idDirectivo, Active) {
                            if (_Dl == null)
                                debugger
                            //if (_line.data[e] == null)
                            //    debugger
                            var _idEmpresa = true
                            if(idDirectivo>0)
                                 _idEmpresa = options.foundEmpresas(options.DirEmpresas, _linea.k)
                            //if (_idEmpresa == null)
                            //    debugger

                            debugger

                            params = [
                                 _linea.data.BOLETIN,
                                 _linea.data.BOLETIN.match(/[\d]{1,7}$/)[0],
                                 _linea.data.dia,
                                 _linea.data.mes,
                                 _linea.data.BOLETIN.match(/[\d]{4}/)[0],
                                 _linea.data.provincia,
                                 _linea.data.ID_Empresa,
                                 _linea.k,
                                 idDirectivo,
                                 _idEmpresa ? 0 : 1,
                                 (Active ? 1 : 0),
                                 _Dl.type ? _Dl.type : _Dl.values.type,
                                 _Dl.key ? _Dl.key : _Dl.values.key.substr(0, 55),
                                 (_Dl.value == null && _Dl.values == null ? null : _Dl.value ? _Dl.value : _Dl.values == null ? null : _Dl.values.value)
                            ]

                            if (_Dl == null) {
                                debugger
                                console.log('_Dl = null error borme.js')
                            }
                            //
                            //insertamos un dato en el diario de movimientos
                            //
                            app.commonSQL.SQL.commands.insert.Borme.diario(options, params, function (err, _record) {
                                process.stdout.write('\x1b[33m.\x1b[0m')
                                //repitiendo el proceso para todos los datos de una linea
                                _e++
                                _func( _e, _linea, _cb, _func)
                            })

                        })
                    } else {
                        //salida de la rutina de PARSEO
                        _cb(_linea)

                    }
                }
                //guardamos el contenido de la linea
                saveLineContenido(0, _linea, _ret, saveLineContenido)
                    

            },
            Preceptos: function (options, type, callback, Preceptos) {
                var _this = this
                var _lines = []
                //obtenemos el siguiente texto a parsear
                app.commonSQL.SQL.commands.select.NextTextParser(options, [type, app.anyo], function (err, recordset) {
                    if (recordset[0].length > 0) {

                        //analizamos la linea y obtenemos una estructura con su contenido
                        _line = options.Rutines.analizeSimpleLine(options.Rutines, recordset[0][0].texto, options.Rutines.maps)
                        _line.data = recordset[0][0]
                        //console.log(_line.k, "=", _line.e)


                        //if (app.IA.find('BM', _line.k)==null)
                        //    if (app.IA.setinMemory('BM', _line.k, 1245489, app.IA.find, "_ks") != null)
                        //        debugger
                        app.IA.send('setinMemory', { type: '_E', array: [_line.e], compress: 'shorthash.unique' }, function (data) {
                            _line.data.ID_Empresa = data.data.array._id[0]
                            _line.addNew = data.data.array.add[0]
                            _this.saveLineaDeMovimientos(_line ,function(){
                                options.SQL.scrapDb.SQL.db.query("UPDATE _"+type.toLowerCase()+"_text_"+app.anyo+" set parser=1 where ID_BORME = ? ",[recordset[0][0].ID_BORME],function(err,record){
                                    Preceptos(options, type, callback, Preceptos)
                                })
                            })
                        })

                    } else {
                        callback(null,true)
                    }
                })
            }
        }
    }

    options.Rutines.cargos = [] //dataCargos
    app.commonSQL.init(options, 'PARSER', app._fileCredenciales + options.Command , function(options){
        app.commonSQL.init({ SQL: { db: null } }, 'SCRAP', app._fileCredenciales + "SCRAP", function (scrapdb) {

            options.SQL.scrapDb = scrapdb
            callback(options)

        })
    })

}