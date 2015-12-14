define([
    'jquery',
    'angular',
    'js/services/Settings',
    'js/services/Figures'
], function ($) {
    'use strict';
    
    return angular.module('Services', [
        'Settings',
        'Figures'
    ])

    .service('Factory', function (Shapes) {
        var colors = {
            I: "#DAB6C4",
            X: "#F4D06F",
            P: "#0042C6",
            L: "#291F1E",
            T: "#F64740",
            S: "#4E407C",
            Z: "#A3333D"
        }
        return {
            getBlock: function (type) {
                var x = 0, y = 0;
                if (type == "rand") {
                    x = 3;
                    y = -1;
                    type = Object.keys(Shapes)[Math.floor(Math.random() * Object.keys(Shapes).length)];
                }
                return {
                    type: type,
                    color: colors[type],
                    rotation: 0,
                    position: {
                        x: x,
                        y: y,
                        fixed: false
                    }
                };
            }
        };
    })

    .service('Render', function (Draw, Factory) {
        return {
            thumbnail: function(value) {
                var stage = document.createElement('canvas');
                stage.id = 'block_' + value;
                stage.setAttribute('width', 40);
                stage.setAttribute('height', 40);

                var preview = new createjs.Stage(stage);

                Draw.block({
                    block: Factory.getBlock(value),
                    blockSize: 10,
                    stage: preview,
                });
                preview.update();
                return preview.toDataURL();
            }
        };
    });
});