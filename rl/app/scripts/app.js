'use strict';

/**
 * @ngdoc overview
 * @name rlApp
 * @description
 * # rlApp
 *
 * Main module of the application.
 */
angular
  .module('rlApp', [
    'highcharts-ng',
    'rlApp.learner'
  ]).filter('reverse', function() {
    return function (items) {
      return items.slice().reverse();
    };
  });
