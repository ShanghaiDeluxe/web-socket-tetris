define([
    'angular',
    'js/services/Logics',
    'js/services/Settings',
    'js/services/Figures',
    'js/services/Services'
], function () {
    'use strict';

    return angular.module('main', ['Logics', 'Settings', 'Figures', 'Services']);
});