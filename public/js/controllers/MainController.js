define([
    'jquery',
    'angular',
    'socket',
    'easel',
    'js/main'
], function ($, ng, socket, easel, main) {
    'use strict';
    console.log('MainController');
    main.controller('MainController', function ($scope, $window, BlockFactory, Shapes, Colors, FIELD_UNIT_SIZE, FIELD_SIZE, DrawService, UtilService, PointsService) {
        
        $scope.test = "Test";
        $scope.version = 10;
        $scope.playerName = "jjjj";
        var KEY = {
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40,
            SPACE: 32
        };
        var ACTION = KEY;
        ACTION.ROTATE = ACTION.UP;

        var stage;
        // var fieldDimension = FIELD_SIZE;
        var fieldValues = [];

        var socket;
        $scope.players = [];

        $scope.thumbnails = {};
    });
});