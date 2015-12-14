
var Score = require('../app/models/score.js');
var npmVersion = require('../package.json').version;

module.exports = function (io, users) {
    'use strict';
    io.on('connection', function (socket) {
        console.log('user connected');
        socket.on('player join', function (player) {
            if (!users[player.name]) {
                socket.name = player.name;
                if (!socket.name) {
                    //fn(false);
                    users[player.name] = player;
                    socket.name = player.name;
                    io.emit('player joined', player);
                    io.emit('users', users);
                }
            }
        });
        socket.on('game status', function (game) {
            if (users[socket.name]) {
                users[socket.name].game = game;
            }
            io.emit('users', users);
            if (game.rowPlus > 1) {
                io.emit('rowPlus', {
                    player: socket.name,
                    rowPlus: game.rowPlus - 1
                });
            }
        });
        socket.on('disconnect', function () {
            delete users[socket.name];
            io.emit('users', users);
        });
        socket.on('score submit', function (data) {
            data.name = socket.name;
            var scoreEntry = new Score(data);
            scoreEntry.save();
            Score.find().sort({score: -1}).limit(100).exec(function (err, scoresData) {
                if (err) {
                    return console.error(err);
                }
                io.emit('scores', scoresData);
            });
        });
        io.emit('users', users);
        Score.find().sort({score: -1}).limit(100).exec(function (err, scoresData) {
            if (err) {
                return console.error(err);
            }
            io.emit('scores', scoresData);
        });
        io.emit('version', npmVersion);
    });
};