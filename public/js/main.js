define([
    'angular',
    'js/services/Logics',
    'js/services/Settings',
    'js/services/Figures',
    'js/services/Services',
], function (ng) {
    'use strict';

    return ng.module('main', ['Logics', 'Settings', 'Figures', 'Services']);
});