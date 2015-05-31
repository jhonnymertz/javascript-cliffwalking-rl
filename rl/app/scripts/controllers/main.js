'use strict';

/**
 * @ngdoc function
 * @name rlApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rlApp
 */
angular.module('rlApp')
  .controller('MainCtrl', function ($scope, $timeout) {
    $scope.episodes = 0;
    $scope.method = 'egreedy';

    $scope.execute = function(){
      $scope.rl = new RLearner(new CliffWorld());
      $scope.rl.setEpisodes($scope.episodes);
      $scope.rl.runTrial();

      console.log($scope.rl);
    };

    function RLearner(rlWorld) {
      this.newstate;
      this.action;
      this.reward;
      this.episodes;

      // Getting the world from the invoking method.
      this.thisWorld = rlWorld;

      // Creating new policy with dimensions to suit the world.
      this.policy = new RLPolicy(this.thisWorld.getDimension());

      // Initializing the policy with the initial values defined by the world.
      this.policy.initValues(this.thisWorld.getInitValues());

      // set default values
      this.epsilon = 0.1;

      this.alpha = 1; // For cliffWorld alpha = 1 is good
      this.gamma = 0.1; // For cliffWorld gamma = 0.1 is a good choice.

      console.log("RLearner initialised");
    };

    RLearner.prototype.setEpisodes = function (episodes) {
      this.episodes = episodes;
    };

    // execute one trial
    RLearner.prototype.runTrial = function () {
      console.log("Learning! (" + this.episodes + " episodes)\n");
      for (var i = 0; i < this.episodes; i++) {
        console.log("Running " + i + " episode");
        console.log(this.runEpisode() + " steps for " + i + " episode");
      }
    };

    // execute one epoch
    RLearner.prototype.runEpisode = function () {

      // Reset state to start position defined by the world.

      this.state = this.thisWorld.resetState([]);

      var this_Q;
      var max_Q;
      var new_Q;

      var steps = 0;

      while (!this.thisWorld.endState(this.state)) {

        this.action = this.selectAction(this.state);
        this.newstate = this.thisWorld.getNextState(this.state, this.action);
        this.reward = this.thisWorld.getReward(this.state, this.action);

        this_Q = this.policy.getQValue(this.state, this.action);
        max_Q = this.policy.getMaxQValue(this.newstate);

        // Calculate new Value for Q
        new_Q = this_Q + this.alpha * (this.reward + this.gamma * max_Q - this_Q);
        this.policy.setQValue(this.state, this.action, new_Q);

        if(this.thisWorld.isInCliff(this.state)) {
          this.thisWorld.resetState(this.state);
          //steps = 0;
          continue;
        }

        // Set state to the new state.
        this.state = this.newstate;
        steps++;
      }
      return steps;
    };

    RLearner.prototype.selectAction = function (state) {

      var qValues = this.policy.getQValuesAt(state);
      var selectedAction = -1;

      var maxQ = -Number.MAX_VALUE;
      var doubleValues = [];
      var maxDV = 0;

      //Explore
      if (Math.random() < this.epsilon) {
        selectedAction = -1;
      } else {

        for (var action = 0; action < qValues.length; action++) {

          if (qValues[action] > maxQ) {
            selectedAction = action;
            maxQ = qValues[action];
            maxDV = 0;
            doubleValues[maxDV] = selectedAction;
          } else if (qValues[action] == maxQ) {
            maxDV++;
            doubleValues[maxDV] = action;
          }
        }

        if (maxDV > 0) {
          var randomIndex = parseInt(Math.random() * (maxDV + 1));
          selectedAction = doubleValues[randomIndex];
        }
      }

      // Select random action if all qValues == 0 or exploring.
      if (selectedAction == -1) {
        //console.log("Exploring ...");
        selectedAction = parseInt(Math.random() * qValues.length);
      }

      // Choose new action if not valid.
      while (!this.thisWorld.validAction(state, selectedAction)) {
        selectedAction = parseInt(Math.random() * qValues.length);
        //console.log("Invalid action, new one:" + selectedAction);
      }
      return selectedAction;
    };

    function RLPolicy(dimSize) {
      this.qValues = [];

      this.dimSize = dimSize;

      // Create n-dimensional array with size given in dimSize array.
      this.qValuesTable = [];

      // Get number of states.
      this.states = dimSize[0];
      for (var j = 1; j < dimSize.length - 1; j++)
        this.states *= dimSize[j];

      // Get number of actions.
      this.actions = dimSize[dimSize.length - 1];
    };

    RLPolicy.prototype.initValues = function (initValue) {

      console.log("States: " + this.states);
      for (var x = 0; x < this.dimSize[0]; x++) {
        this.qValuesTable[x] = [] ;
        for (var y = 0; y < this.dimSize[1]; y++) {
          this.qValuesTable[x][y] = [];
          for (var z = 0; z < this.dimSize[2]; z++) {
            this.qValuesTable[x][y][z] = initValue;
          }
        }
      }

    };

    RLPolicy.prototype.myQValues = function (state) {
      return this.qValuesTable[state[0]][state[1]];
    };

    RLPolicy.prototype.getQValuesAt = function (state) {
      this.qValues = this.myQValues(state);
      var returnValues = (JSON.parse(JSON.stringify(this.qValues)));
      return returnValues;
    };

    RLPolicy.prototype.setQValue = function (state, action, newQValue) {
      this.qValues = this.myQValues(state);
      this.qValues[action] = newQValue;
    };

    RLPolicy.prototype.getMaxQValue = function (state) {

      var maxQ = -Number.MAX_VALUE;

      this.qValues = this.myQValues(state);

      for (var action = 0; action < this.qValues.length; action++) {
        if (this.qValues[action] > maxQ) {
          maxQ = this.qValues[action];
        }
      }
      return maxQ;
    };

    RLPolicy.prototype.getQValue = function (state, action) {

      var qValue = 0;

      this.qValues = this.myQValues(state);
      qValue = this.qValues[action];

      return qValue;
    };

    //RLPolicy.prototype.getBestAction = function (state) {
    //
    //  var maxQ = -Number.MAX_VALUE;
    //  var selectedAction = -1;
    //  var doubleValues = [];
    //  var maxDV = 0;
    //
    //  this.qValues = this.myQValues(state);
    //
    //  for (var action = 0; action < this.qValues.length; action++) {
    //    //System.out.println( "STATE: [" + state[0] + "," + state[1] + "]" );
    //    //System.out.println( "action:qValue, maxQ " + action + ":" + qValues[action] + "," + maxQ );
    //
    //    if (this.qValues[action] > maxQ) {
    //      selectedAction = action;
    //      maxQ = this.qValues[action];
    //      maxDV = 0;
    //      doubleValues[maxDV] = selectedAction;
    //    } else if (this.qValues[action] == maxQ) {
    //      maxDV++;
    //      doubleValues[maxDV] = action;
    //    }
    //  }
    //
    //  if (maxDV > 0) {
    //    //System.out.println( "DOUBLE values, random selection, maxdv =" + maxDV );
    //    var randomIndex = parseInt(Math.random() * (maxDV + 1));
    //    selectedAction = doubleValues[randomIndex];
    //  }
    //
    //  if (selectedAction == -1) {
    //    //System.out.println("RANDOM Choice !" );
    //    selectedAction = parseInt(Math.random() * this.qValues.length);
    //  }
    //
    //  return selectedAction;
    //};

    function CliffWorld() {
      // Actions.
      this.UP = 0;
      this.RIGHT = 1;
      this.DOWN = 2;
      this.LEFT = 3;

      // dimension: { x, y, actions }
      this.dimSize = [12, 4, 4];
    };

    CliffWorld.prototype.getDimension = function () {
      return this.dimSize;
    };

    CliffWorld.prototype.getNextState = function (state, action) {

      var newstate = (JSON.parse(JSON.stringify(state)));

      // UP-LEFT corner in coordinates 0,0
      if (action == this.UP)
        newstate[1]++;
      else if (action == this.RIGHT)
        newstate[0]++;
      else if (action == this.DOWN)
        newstate[1]--;
      else if (action == this.LEFT)
        newstate[0]--;
      return newstate;
    };

    CliffWorld.prototype.validAction = function (state, action) {

      // West border
      if (state[0] == 0 && action == this.LEFT)
        return false;
      // East border
      else if (state[0] == 11 && action == this.RIGHT)
        return false;
      // North border
      else if (state[1] == 3 && action == this.UP)
        return false;
      // South border
      else if (state[1] == 0 && action == this.DOWN)
        return false;
      // Cliff
      //else if (state[0] > 0 && state[0] < 11 && state[1] == 1 && action == this.DOWN)
        //return false;
      else return true;
    };

    CliffWorld.prototype.endState = function (state) {
      if (state[0] == 11 && state[1] == 0) {
        return true;
      } else return false;
    };

    CliffWorld.prototype.isInCliff = function(state){
      //Cliff
      if (state[0] > 0 && state[0] < 11 && state[1] == 0)
        return true;
      else return false;
    }

    CliffWorld.prototype.getReward = function (state, action) {
      if (state[0] > 0 && state[0] < 11 && state[1] == 1 && action == this.DOWN){
        return -100;
      }

      //Final state
      if (state[1] == 1 && state[0] == 11 && action == this.DOWN)
        return 0;
      return -1;
    };

    CliffWorld.prototype.resetState = function (state) {

      state[0] = 0;
      state[1] = 0;

      return state;
    };

    CliffWorld.prototype.getInitValues = function () {
      return 0;
    };

    //This is not a highcharts object. It just looks a little like one!
    $scope.chartConfig = {

      options: {
        //This is the Main Highcharts chart config. Any Highchart options are valid here.
        //will be overriden by values specified below.
        chart: {
          type: 'bar'
        },
        tooltip: {
          style: {
            padding: 10,
            fontWeight: 'bold'
          }
        }
      },
      //The below properties are watched separately for changes.

      //Series object (optional) - a list of series using normal highcharts series options.
      series: [{
        data: [10, 15, 12, 8, 7]
      }],
      //Title configuration (optional)
      title: {
        text: 'Hello'
      },
      //Boolean to control showng loading status on chart (optional)
      //Could be a string if you want to show specific loading text.
      loading: false,
      //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
      //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
      xAxis: {
        currentMin: 0,
        currentMax: 20,
        title: {text: 'values'}
      },
      //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
      useHighStocks: false,
      //size (optional) if left out the chart will default to size of the div or something sensible.
      size: {
        width: 400,
        height: 300
      },
      //function (optional)
      func: function (chart) {
        //setup some logic for the chart
      }
    };
  });
