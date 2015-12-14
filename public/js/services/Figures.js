define([
    'jquery',
    'angular',
    'js/services/Settings',
], function ($) {
    'use strict';
    
    return angular.module('Figures', [
        'Settings'
    ])

    .service('Draw', function (Shapes, MAP_UNIT_SIZE) {
        return {
            block: function(object) {
                var borderColor = object.borderColor || '#ededed';
                var block = object.block;
                var blockSize = object.blockSize || MAP_UNIT_SIZE;
                var stage = object.stage;

                var rect;

                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 4; j++) {
                        if (Shapes[block.type][block.rotation][i][j]) {
                            rect = new createjs.Shape();
                            rect.graphics.beginStroke(borderColor);
                            rect.graphics.beginFill(block.color);
                            rect.graphics.drawRect(block.position.x * blockSize + blockSize * j, block.position.y * blockSize + blockSize * i, blockSize, blockSize);
                            stage.addChild(rect);
                        }
                    }
                }
            },
            field: function(object) {
                var fieldDimension = object.fieldDimension;
                var fieldValues = object.fieldValues;
                var stage = object.stage;
                var rect;
                var fillColor;

                for (var i = 0; i < fieldDimension[1]; i++) {
                    for (var j = 0; j < fieldDimension[0]; j++) {
                        fillColor = "#ddd";
                        if (fieldValues[i][j]) {
                            fillColor = fieldValues[i][j].color;
                        }
                        rect = new createjs.Shape();
                        rect.graphics.beginStroke("#ededed");
                        rect.graphics.beginFill(fillColor);
                        rect.graphics.drawRect(MAP_UNIT_SIZE * j, MAP_UNIT_SIZE * i, MAP_UNIT_SIZE, MAP_UNIT_SIZE);
                        stage.addChild(rect);
                    }
                }
            }
        };
    });
});