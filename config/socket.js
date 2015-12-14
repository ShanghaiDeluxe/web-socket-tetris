
var Score = require('../app/models/score.js');
var npmVersion = require('../package.json').version;

module.exports = function (io, users) {
    'use strict';
    io.on('connection', function (socket) {
        console.log('user connected');
        socket.on('join', function (player) {
            if (!users[player.name]) {
                if (!socket.name) {
                    users[player.name] = player;
                    socket.name = player.name;
                    io.emit('join', player);
                    io.emit('users', users);
                } else {
                    socket.name = player.name;
                }
            }
        });
        // Game Flow && Row Plus
        socket.on('status', function (game) {
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
        socket.on('submit', function (data) {
            data.name = socket.name;
            var scoreEntry = new Score(data);
            scoreEntry.save();
            sortScore();
        });
        io.emit('users', users);
        sortScore();
        io.emit('version', npmVersion);
        socket.on('disconnect', function () {
            delete users[socket.name];
            io.emit('users', users);
        });

        function sortScore () {
            Score.find().sort({score: -1}).limit(10).exec(function (err, scoresData) {
                if (err) {
                    return console.error(err);
                }
                io.emit('scores', scoresData);
            });
        }
    });
};