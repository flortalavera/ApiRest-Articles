'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

    datosProject: (req, res) => {

        return res.status(200).send({
            aprendiendo: 'Node JS, MongoDB y Frameworks',
            autor: 'Flor Talavera',
            url: 'https://github.com/flortalavera'
        });
    },

    test: (req, res) => {

        return res.status(200).send({
            message: 'metodo test'
        });
    },

    save: (req, res) => {
        var params = req.body;

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'faltan datos'
            });
        }
        if (validate_title && validate_content) {

            // Objeto a guardar
            var article = new Article();
            // Asigno valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            // Guardo el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'no se guardó el articulo'
                    })
                }
                // Devuelvo respuesta
                return res.status(200).send({
                    status: 'success',
                    article
                });
            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'datos no validos'
            });
        }
    },

    // Obtener todos los articulos
    getArticles: (req, res) => {

        var query = Article.find({});
        // Aplico un máximo de articulos para mostrar
        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5)
        }

        query.sort('-id').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'error al devolverlos datos'
                });
            }
            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'no existen los articulos'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    },
    // Obtener articulo x ID
    getArticle: (req, res) => {

        var articleId = req.params.id;

        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo'
            });
        }
        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo'
                });
            }
            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },
    // Actualizar articulo
    update: (req, res) => {

        var articleId = req.params.id;
        var params = req.body;

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'faltan datos'
            });
        }
        if (validate_title && validate_content) {
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'La validacion no es correcta'
            });
        }
    },

    delete: (req, res) => {
        var articleId = req.params.id;

        Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err || !articleRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
            }
            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });

        });
    },
    upload: (req, res) => {
        var file_name = 'Imagen no subida..';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        var file_name = file_split[2];

        // Extensión del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        if (file_ext != 'jpg' && file_ext != 'png' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {
                return res.status(404).send({
                    status: 'error',
                    message: 'La extension de la imagen no es válida'
                });
            });
        } else {
            var articleId = req.params.id;
            // Buscar articulo, asignarle el nombre de la imagen y actualizarlo
            Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdated) => {

                if (err || !articleUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar la imagen'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
            });
        }
    }, // End upload file

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        exists(path_file, (e) => {
            if (e) {
                return res.sendFile(path.resolve(path_file))
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'la imagen no existe'
                });
            }
        });
    },

    search: (req, res) => {
        var searchString = req.params.search;

        Article.find({ "$or": [
            {"title": { "$regex": searchString, "$options": "i"}},
            {"content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu búsqueda'
                });
            }
            
            return res.status(200).send({
                status: 'success',
                articles
            });
        })
    }

}; // End controller

module.exports = controller;