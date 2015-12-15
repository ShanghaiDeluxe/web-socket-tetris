define([
    'jquery',
    'socket',
    'js/main',
    'angular',
    'easel'
], function ($, io, main) {
    'use strict';
    main.controller('MainController', function ($scope, $window, Factory, Shapes, MAP_UNIT_SIZE, MAP_SIZE, Draw, Render, Points) {

        var KEY = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            SPACE: 32
        };
        var ACTION = KEY;
        ACTION.ROTATE = ACTION.UP;

        var stage;
        var fieldDimension = MAP_SIZE;
        var fieldValues = [];

        var socket;
        $scope.users = [];
        $scope.duellLog = [];

        $scope.thumbnails = {};
        Object.keys(Shapes).forEach(function(value) {
            $scope.thumbnails[value] = Render.thumbnail(value);
        });
        
        $scope.stop = function() {
            if ($scope.gameOver) {
                return;
            }
            $scope.gameStopped = true;
            gameLoopStart = false;
            createjs.Ticker.removeEventListener("tick", gameLoop);
        };
        $scope.start = function() {
            if ($scope.gameOver) {
                return;
            }
            $scope.gameStopped = false;
            createjs.Ticker.addEventListener("tick", gameLoop);
        };
        $scope.reset = function() {
            $scope.gameStopped = true;
            gameLoopStart = false;
            createjs.Ticker.removeEventListener("tick", gameLoop);

            initGame();
        };

        $scope.init = function() {
            if (!$scope.id) {
                return;
            }
            if ($scope.id.length > 10) {
                alert("글자수는 10글자 미만으로 해주세요.");
                return false;
            }
            for (var id in $scope.users) {
                if ($scope.id === id) {
                    alert("동일 아이디 사용자가 있습니다.");
                    return false;
                }
            }
            $scope.userName = $scope.id;
            socket.emit('join', {
                name: $scope.userName,
                game: {}
            });

            initGame();
        };

        function initGame() {
            $scope.gameInitialized = true;
            $scope.gameOver = false;

            window.onkeydown = function(e) {
                $scope.keys["key" + e.which] = true;
                if (e.which == KEY.UP || e.which == KEY.DOWN || e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.SPACE) {
                    e.preventDefault();
                }
            };

            createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
            createjs.Ticker.setFPS(30);

            $scope.points = 0;
            $scope.level = 1;
            $scope.levelStepTime = (-20) * ($scope.level + 1) + 500;
            $scope.keys = {};
            $scope.blocksCount = {};
            $scope.totalBlockCount = 0;
            $scope.rowCount = 0;
            $scope.rowsRecieved = 0;

            Object.keys(Shapes).forEach(function(value) {
                $scope.blocksCount[value] = {
                    shape: Shapes[value],
                    count: 0
                };
            });

            stage = new createjs.Stage("canvas");
            stage.enableMouseOver(0);
            stage.enableDOMEvents(false);

            for (var i = 0; i < fieldDimension[1]; i++) {
                fieldValues[i] = createEmptyRow();
            }

            // $scope.nextBlock = Factory.getRandomBlock();
            $scope.nextBlock = Factory.getBlock('rand');
            $scope.activeBlock = false;
            updateLevel();

            drawAll();
        }

        $scope.isKeyDown = function(code) {
            if ($scope.keys["key" + code]) {
                return true;
            }
            return false;
        };

        // Clear KeyEvent
        function clearKeyEvent() {
            for (var code in $scope.keys) {
                if ($scope.keys.hasOwnProperty(code)) {
                    $scope.keys[code] = false;
                }
            }
        }

        //Key Event Handler
        function keyEventHandlers() {
            if ($scope.isKeyDown(KEY.RIGHT)) {
                if (checkMove(ACTION.RIGHT)) {
                    $scope.activeBlock.position.x++;
                }
            }
            else if ($scope.isKeyDown(KEY.LEFT)) {
                if (checkMove(ACTION.LEFT)) {
                    $scope.activeBlock.position.x--;
                }
            }

            if ($scope.isKeyDown(KEY.UP)) {
                if (checkMove(ACTION.ROTATE)) {
                    $scope.activeBlock.rotation = ($scope.activeBlock.rotation + 1) % 4;
                }
            }
            else if ($scope.isKeyDown(KEY.DOWN)) {
                if (checkMove(ACTION.DOWN)) {
                    $scope.activeBlock.position.y++;
                }
            }

            if ($scope.isKeyDown(KEY.SPACE)) {
                for (var h = 0; h < fieldDimension[1]; h++) {
                    if (checkMove(ACTION.DOWN)) {
                        $scope.activeBlock.position.y++;
                    }
                    else {
                        $scope.activeBlock.position.fixed = true;
                        updatePoints({
                            droppedLines: h
                        });
                        break;
                    }
                }
            }
        }

        var gameLoopStart = 0;
        // Game Loop
        function gameLoop(event) {
            var i, j;
            var x;
            var y;
            var r;
            var rowsToRemove = [];
            var currentRow;
            var hasFullRow;

            //No ActiveBlock -> New Block
            if (!$scope.activeBlock) {
                $scope.$apply(function() {
                    $scope.activeBlock = $scope.nextBlock;
                    $scope.nextBlock = Factory.getBlock('rand');
                    $scope.blocksCount[$scope.activeBlock.type].count++;
                    $scope.totalBlockCount++;
                });
            }

            //Key Handlers
            keyEventHandlers();

            clearKeyEvent();

            /* Start Game Loop */
            if (!gameLoopStart) {
                gameLoopStart = event.runTime;
            }
            var timeDiff = event.runTime - gameLoopStart;
            if (timeDiff > $scope.levelStepTime) {
                gameLoopStart = 0;

                if (checkMove(ACTION.DOWN)) {
                    $scope.activeBlock.position.y++;
                }
                else {
                    //Place Block and get new Block
                    x = $scope.activeBlock.position.x;
                    y = $scope.activeBlock.position.y;
                    r = $scope.activeBlock.rotation;

                    if (y < 0) {
                        $scope.$apply(function() {
                            $scope.gameStopped = true;
                            $scope.gameOver = true;
                            createjs.Ticker.removeEventListener("tick", gameLoop);
                        });
                        socket.emit('submit', {
                            name: $scope.id,
                            score: $scope.points,
                        });
                    }
                    else {
                        for (i = 0; i < 4; i++) {
                            for (j = 0; j < 4; j++) {
                                if (Shapes[$scope.activeBlock.type][r][i][j]) {
                                    fieldValues[y + i][x + j] = {
                                        color: $scope.activeBlock.color
                                    };
                                }
                            }
                        }
                        $scope.activeBlock.position.fixed = true;
                    }
                }

                if ($scope.activeBlock.position.fixed) {
                    //Check for complete rows
                    for (i = 0; i < fieldDimension[1]; i++) {
                        for (j = 0; j < fieldDimension[0]; j++) {
                            if (currentRow !== i) {
                                if (hasFullRow) {
                                    rowsToRemove.push(currentRow);
                                }
                                currentRow = i;
                                hasFullRow = true;
                            }
                            if (!fieldValues[i][j]) {
                                hasFullRow = false;
                                break;
                            }
                        }
                    }
                    if (hasFullRow) {
                        rowsToRemove.push(currentRow);
                    }
                    removeRows(rowsToRemove);

                    $scope.activeBlock = false;
                }
                socket.emit('status', {
                    points: $scope.points,
                    level: $scope.level,
                    rowCount: $scope.rowCount,
                    rowPlus: rowsToRemove.length,
                    field: stage.toDataURL() || null
                });
            }

            if (!$scope.gameStopped) {
                drawAll();
            }
        }

        function removeRows(rowsArray) {
            if (rowsArray.length) {
                $scope.rowCount += rowsArray.length;

                rowsArray.forEach(function(row) {
                    fieldValues.splice(row, 1);
                    fieldValues.unshift(createEmptyRow());
                });

                updatePoints({
                    clearedRows: rowsArray.length
                });
                updateLevel();
            }
        }

        function updatePoints(triggerObj) {
            var clearedRows = triggerObj.clearedRows || 0;
            var droppedLines = triggerObj.droppedLines || 0;
            var levelMultiplier = (1 + ($scope.level - 1) / 10);

            var points = Points.calculatePoints(clearedRows, droppedLines, levelMultiplier);

            $scope.points = $scope.points + points;
        }

        function updateLevel() {
            $scope.level = Math.floor($scope.rowCount / 10) + 1;
            $scope.levelStepTime = (-20) * ($scope.level + 1) + 500;
            if ($scope.levelStepTime < 0) {
                $scope.levelStepTime = 0;
            }
        }


        function checkMove(direction) {
            var i, j;
            var x = $scope.activeBlock.position.x;
            var y = $scope.activeBlock.position.y;
            var r = $scope.activeBlock.rotation;
            if ($scope.activeBlock.position.fixed) {
                return false;
            }

            switch (direction) {
            case ACTION.ROTATE:
                y = (y === -1) ? 0 : y;
                r = (r + 1) % 4;
                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        if (Shapes[$scope.activeBlock.type][r][i][j]) {
                            if (x + j < 0 || x + j >= fieldDimension[0] || y + i >= fieldDimension[1] || fieldValues[y + i][x + j]) {
                                return false;
                            }
                        }
                    }
                }
                break;
            case ACTION.DOWN:
                y = y + 1;
                y = (y === -1) ? 0 : y;
                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        if (Shapes[$scope.activeBlock.type][r][i][j]) {
                            if (y + i >= fieldDimension[1] || fieldValues[y + i][x + j]) {
                                return false;
                            }
                        }
                    }
                }
                break;
            case ACTION.LEFT:
                x = x - 1;
                y = (y === -1) ? 0 : y;
                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        if (Shapes[$scope.activeBlock.type][r][i][j]) {
                            if (x + j < 0 || fieldValues[y + i][x + j]) {
                                return false;
                            }
                        }
                    }
                }
                break;
            case ACTION.RIGHT:
                x = x + 1;
                y = (y === -1) ? 0 : y;
                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        if (Shapes[$scope.activeBlock.type][r][i][j]) {
                            if (x + j >= fieldDimension[0] || fieldValues[y + i][x + j]) {
                                return false;
                            }
                        }
                    }
                }
                break;
            }

            return true;
        }


        function drawField() {
            Draw.field({
                fieldDimension: fieldDimension,
                fieldValues: fieldValues,
                stage: stage
            });
        }

        function drawActiveBlock() {
            Draw.block({
                block: $scope.activeBlock,
                stage: stage
            });
        }

        function drawAll() {
            stage.removeAllChildren();
            drawField();
            if ($scope.activeBlock) {
                drawActiveBlock();
            }
            stage.update();
        }

        function createEmptyRow() {
            var emptyRow = [];
            for (var j = 0; j < fieldDimension[0]; j++) {
                emptyRow[j] = false;
            }
            return emptyRow;
        }

        function createBlockRow(freeBlock) {
            var row = [];

            for (var j = 0; j < fieldDimension[0]; j++) {
                row[j] = (j !== freeBlock) ? {
                    color: '#666'
                } : false;
            }
            return row;
        }

        socket = io.connect($window.location.protocol + '//' + $window.location.host);
        
        socket.on('rowPlus', function(data) {
            if (data.player !== $scope.userName) {
                var freeBlock = (Math.random() * fieldDimension[0]) | 0;
                for (var i = data.rowPlus; i--;) {
                    fieldValues.splice(0, 1);
                    fieldValues.push(createBlockRow(freeBlock));
                }
            }
            $scope.$apply(function() {
                $scope.rowsRecieved += data.rowPlus;
                $scope.duellLog.unshift(data);
            });
        });

        socket.on('users', function(users) {
            $scope.$apply(function() {
                $scope.users = users;
            });
        });
        
        socket.on('scores', function(scores) {
            $scope.$apply(function() {
                $scope.scores = scores;
            });
        });
        
        socket.on('version', function(version) {
            $scope.$apply(function() {
                $scope.version = version;
            });
        });
    });
});