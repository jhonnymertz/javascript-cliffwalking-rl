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
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'highcharts-ng',
    'rlApp.learner'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
