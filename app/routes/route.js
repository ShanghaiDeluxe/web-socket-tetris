
module.exports = function (app) {
    'use strict';
    app.get('/', function (req, res) {
        res.render('index.html');
    });

    app.get('*', function (req, res) {
        res.status(404).send("404 Error! Not found this page!");
    });
};
