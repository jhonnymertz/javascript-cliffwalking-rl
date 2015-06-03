'use strict';

/**
 * @ngdoc function
 * @name rlApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rlApp
 */
angular.module('rlApp')
  .controller('MainCtrl', function ($scope, $timeout, LearnService) {

    var configDefault = {
      episodes: 0,
      epsilon: 0.1,
      alpha: 1, // For cliffWorld alpha = 1 is good
      gamma: 0.1, // For cliffWorld gamma = 0.1 is a good choice.
      method: 'egreedy',
      temp: 1,
      maxSteps: 440
    };

    $scope.config = angular.copy(configDefault);

    $scope.default = function(){
      $scope.config = angular.copy(configDefault);
    };

    $scope.execute = function(){
      $scope.results = LearnService.execute($scope.config);
      console.log($scope.results.info);
//This is not a highcharts object. It just looks a little like one!
      $scope.chartConfig = {

        options: {
          //This is the Main Highcharts chart config. Any Highchart options are valid here.
          //will be overriden by values specified below.
          chart: {
            type: 'line',
            zoomType: 'x'
          },
          tooltip: {
            style: {
              padding: 10,
              fontWeight: 'bold'
            },
            formatter: function() {
              return '<b>' + this.series.name + ': ' + this.point.y + '<br>Episódio: ' + this.point.x + '</b>';
            }
          },
          plotOptions: {
            line: {
              dataLabels: {
                enabled: true
              }
            }
          }
        },
        //The below properties are watched separately for changes.

        //Series object (optional) - a list of series using normal highcharts series options.
        series: $scope.results.info,
        //Title configuration (optional)
        title: {
          text: 'Desempenho'
        },
        subtitle: {
          text: 'Taxa de passos por simulação'
        },
        //Boolean to control showng loading status on chart (optional)
        //Could be a string if you want to show specific loading text.
        loading: false,
        //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
        //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
        xAxis: {
          title: {
            text: 'Episódio'
          }
        },
        //function (optional)
        func: function (chart) {
          $timeout(function() {
            chart.reflow();
          }, 0);
        }
      };

    };




  });
