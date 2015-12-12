var express = require('express');
var app = express();

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
var Score = require('./app/models/score.js');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// socket code in here!!!!
// io.on('connection', function(socket) {
//     socket.on('player join', function(player) {
//         if (players[player.name]) {
//             //fn(true);
//         } else {
//             if (socket.name) {
//                 socket.name = player.name;
//             } else {
//                 //fn(false);
//                 players[player.name] = player;
//                 socket.name = player.name;
//                 io.emit('player joined', player);
//                 io.emit('players', players);
//             }
//         }
//     });
//     socket.on('game status', function(game) {
//         if (players[socket.name]) {
//             players[socket.name].game = game;
//         }
//         io.emit('players', players);
//         if (game.rowPlus > 1) {
//             io.emit('duell.rowPlus', {
//                 player: socket.name,
//                 rowPlus: game.rowPlus - 1
//             });
//         }
//     });
//     socket.on('disconnect', function() {
//         delete players[socket.name];
//         io.emit('players', players);
//     });
//     socket.on('score submit', function(data) {
//         data.name = socket.name;
//         var scoreEntry = new Score(data);
//         scoreEntry.save();
//         Score.find().sort({score: -1}).limit(100).exec(function(err, scoresData) {
//             if (err) return console.error(err);
//             io.emit('scores', scoresData);
//         });
//     });
//     io.emit('players', players);
//     Score.find().sort({score: -1}).limit(100).exec(function(err, scoresData) {
//         if (err) return console.error(err);
//         io.emit('scores', scoresData);
//     });
//     io.emit('version', packagejson.version);
// });

// listen (start app with node app.js) ======================================
app.listen(process.env.PORT || port);
console.log("App listening on port " + port);




