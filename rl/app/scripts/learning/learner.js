/**
 * Created by jhonnymertz on 02/06/15.
 */

function RLearner(rlWorld, config) {

  angular.extend(this, config);

  // Getting the world from the invoking method.
  this.thisWorld = rlWorld;

  // Creating new policy with dimensions to suit the world.
  this.policy = new RLPolicy(this.thisWorld.getDimension());

  // Initializing the policy with the initial values defined by the world.
  this.policy.initValues(this.thisWorld.getInitValues());


  this.explorations = 0;

  console.log("RLearner initialised");
};

RLearner.prototype.setEpisodes = function (episodes) {
  this.episodes = episodes;
};

// execute one trial
RLearner.prototype.runTrial = function () {

  var chartData = [{
      name: 'Quedas',
      data: []
    }, {
        name: 'Passos',
        data: []
      }];

  console.log("Learning! (" + this.episodes + " episodes)\n");
  for (var i = 0; i < this.episodes; i++) {
    console.log("Running " + i + " episode");
    var info = this.runEpisode();
    while(info.steps > this.maxSteps){
      info = this.runEpisode();
    }
    console.log(info.steps + " steps and " + info.falls + " falls for " + i + " episode");
    chartData[0].data.push(info.falls);
    chartData[1].data.push(info.steps);
  }

  return chartData;
};

// execute one epoch
RLearner.prototype.runEpisode = function () {

  // Reset state to start position defined by the world.

  this.state = this.thisWorld.resetState([]);

  var this_Q;
  var max_Q;
  var new_Q;

  var info = {
      steps: 0,
      falls: 0
    };


  while (!this.thisWorld.endState(this.state)) {

    this.action = this.selectAction(this.state);
    this.newstate = this.thisWorld.getNextState(this.state, this.action);
    this.reward = this.thisWorld.getReward(this.newstate);

    this_Q = this.policy.getQValue(this.state, this.action);
    max_Q = this.policy.getMaxQValue(this.newstate);

    // Calculate new Value for Q
    new_Q = this_Q + this.alpha * (this.reward + this.gamma * max_Q - this_Q);
    this.policy.setQValue(this.state, this.action, new_Q);

    if(this.thisWorld.isInCliff(this.newstate)) {
      this.state = this.thisWorld.resetState(this.state);
      info.steps = 0;
      info.falls++;
      continue;
    }

    // Set state to the new state.
    this.state = this.newstate;
    info.steps++;
  }
  return info;
};

RLearner.prototype.selectAction = function (state) {

  var qValues = this.policy.getQValuesAt(state);
  var selectedAction = -1;

  switch (this.method) {

    case 'egreedy':
    {
      var maxQ = -Number.MAX_VALUE;
      var doubleValues = [];
      var maxDV = 0;

      //Explore
      if (Math.random() < this.epsilon) {
        //console.log("Exploring ...");
        selectedAction = Math.floor(Math.random() * qValues.length);
        this.explorations++;
      } else {
        for (var action = 0; action < qValues.length; action++) {
          if (qValues[action] > maxQ) {
            selectedAction = action;
            maxQ = qValues[action];
            maxDV = 0;
            doubleValues = [];
            doubleValues[maxDV] = selectedAction;
          } else if (qValues[action] == maxQ) {
            maxDV++;
            doubleValues[maxDV] = action;
          }
        }

        if (maxDV > 0) {
          for (var action = 0; action < doubleValues.length; action++) {
            var randomIndex = Math.floor(Math.random() * (maxDV + 1));
            selectedAction = doubleValues[randomIndex];
            if(this.thisWorld.validAction(state, selectedAction))
              break;
          }
        }
      }

      // Choose new action if not valid.
      while (!this.thisWorld.validAction(state, selectedAction)) {
        selectedAction = Math.floor(Math.random() * qValues.length);
        //console.log("Invalid action, new one:" + selectedAction);
      }

      break;
    }

    case 'greedy':
    {
      var maxQ = -Number.MAX_VALUE;
      var doubleValues = [];
      var maxDV = 0;

      for (var action = 0; action < qValues.length; action++) {
        if (qValues[action] > maxQ) {
          selectedAction = action;
          maxQ = qValues[action];
          maxDV = 0;
          doubleValues = [];
          doubleValues[maxDV] = selectedAction;
        } else if (qValues[action] == maxQ) {
          maxDV++;
          doubleValues[maxDV] = action;
        }
      }

      if (maxDV > 0) {
        for (var action = 0; action < doubleValues.length; action++) {
          var randomIndex = Math.floor(Math.random() * (maxDV + 1));
          selectedAction = doubleValues[randomIndex];
          if(this.thisWorld.validAction(state, selectedAction))
            break;
        }
      }

      // Choose new action if not valid.
      while (!this.thisWorld.validAction(state, selectedAction)) {
        selectedAction = Math.floor(Math.random() * qValues.length);
      }
      break;
    }

    case 'softmax':
    {

      var action;
      var prob = [];
      var sumProb = 0;

      for (action = 0; action < qValues.length; action++) {
        prob[action] = Math.exp(qValues[action] / this.temp);
        sumProb += prob[action];
      }
      for (action = 0; action < qValues.length; action++)
        prob[action] = prob[action] / sumProb;

      var valid = false;
      var rndValue;
      var offset;

      while (!valid) {

        rndValue = Math.random();
        offset = 0;

        for (action = 0; action < qValues.length; action++) {
          if (rndValue > offset && rndValue < offset + prob[action])
            selectedAction = action;
          offset += prob[action];
          //console.log("Action " + action + " chosen with " + prob[action]);
        }

        if (this.thisWorld.validAction(state, selectedAction))
          valid = true;
      }
      break;
    }
  };
  return selectedAction;
};

function RLPolicy(dimSize) {

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

RLPolicy.prototype.getQValuesAt = function (state) {
  return this.qValuesTable[state[0]][state[1]];
};

RLPolicy.prototype.setQValue = function (state, action, newQValue) {
  this.qValuesTable[state[0]][state[1]][action] = newQValue;
};

RLPolicy.prototype.getMaxQValue = function (state) {
  return Math.max.apply(null, this.qValuesTable[state[0]][state[1]]);
};

RLPolicy.prototype.getQValue = function (state, action) {
  return this.qValuesTable[state[0]][state[1]][action];
};

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
  return (state[0] == 11 && state[1] == 0);
};

CliffWorld.prototype.isInCliff = function(state){
  return (state[0] > 0 && state[0] < 11 && state[1] == 0);
};

CliffWorld.prototype.getReward = function (state) {
  //Cliff
  if (this.isInCliff(state)){
    return -100;
  }

  //Final state
  if (this.endState(state))
    return 0;

  return -1;
};

CliffWorld.prototype.resetState = function () {
  return [0,0];
};

CliffWorld.prototype.getInitValues = function () {
  return -1.5;
};

function LearnService() {
  var service = {
    execute: execute
  };
  return service;

  ////////////

  function execute(config){
    var rl = new RLearner(new CliffWorld(), config);
    var data = {info: rl.runTrial()};
    data.rl = rl;
    return data;
  };
};

angular.module('rlApp.learner', [])
  .service('LearnService', LearnService);
