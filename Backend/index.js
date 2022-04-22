'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

//mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/api_rest_articulos', { useNewUrlParser: true })
.then(() => {
    console.log('Conexion a base de datos exitosa ✓');

    // Crear servidor
    app.listen(port, () => {
        console.log('servidor corriendo en LocalHost:'+ port);
    });
});