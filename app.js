var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');  // mongodb odm
var port = process.env.PORT || 8000;  // port
var database = require('./config/database');  // load to database config file
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var ejs = require('ejs');

app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));  // static files
app.use(morgan('dev'));  // request log to the console
app.use(bodyParser.urlencoded({extended: 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json());  // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override'));   // override with the X-HTTP-Method-Override header in the request

require('./app/routes/route')(app);

mongoose.connect(database.url);  // connect to mongoDB database on mongoose

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var users = {};

// socket code in here!!!!
require('./config/socket.js')(io, users);

server.listen(process.env.PORT || port);
console.log("App listening on port " + port);
