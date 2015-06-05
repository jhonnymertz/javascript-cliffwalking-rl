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

  console.log("RLearner initialised");
};

// execute one trial
RLearner.prototype.runTrial = function () {

  var chartData = [{
      name: 'Quedas',
      data: []
    }, {
        name: 'Passos',
        data: []
      },
    {
      name: 'Explorações',
      data: []
    }];

  console.log("Learning! (" + this.episodes + " episodes)\n");
  for (var i = 0; i < this.episodes; i++) {
    console.log("Running " + i + " episode");
    var info = this.runEpisode();
    console.log(info.steps + " steps and " + info.falls + " falls for " + i + " episode");
    chartData[0].data.push(info.falls);
    chartData[1].data.push(info.steps);
    chartData[2].data.push(info.explorations);
  }

  return chartData;
};

// execute one epoch
RLearner.prototype.runEpisode = function () {

  // Reset state to start position defined by the world.

  this.state = this.thisWorld.resetState();

  var this_Q;
  var max_Q;
  var new_Q;

  var info = {
      steps: 0,
      falls: 0
    };

  this.explorations = 0;

  while (!this.thisWorld.endState(this.state)) {

    this.alpha = 1 / (1 + info.steps);

    this.action = this.selectAction(this.state);
    this_Q = this.policy.getQValue(this.state, this.action);

    this.newstate = this.thisWorld.getNextState(this.state, this.action);
    this.reward = this.thisWorld.getReward(this.newstate);
    max_Q = this.policy.getMaxQValue(this.newstate, this.thisWorld.validAction);

    // Calculate new Value for Q
    new_Q = this_Q + this.alpha * (this.reward + this.gamma * max_Q - this_Q);
    this.policy.setQValue(this.state, this.action, new_Q);

    if(this.thisWorld.isInCliff(this.newstate)) {
      this.state = this.thisWorld.resetState();
      info.steps = 0;
      info.falls++;
      continue;
    }

    if(info.steps > this.maxSteps){
      this.state = this.thisWorld.resetState();
      info.steps = 0;
      this.explorations = 0;
      continue;
    }

    this.state = this.newstate;
    info.steps++;
  }
  info.explorations = this.explorations;
  return info;
};

RLearner.prototype.softmax = function(qValues, state){
  var action;
  var prob = [];
  var sumProb = 0;
  var selectedAction;

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

  return selectedAction;
};

RLearner.prototype.greedy = function(qValues, state){
  var maxQ = -Infinity;
  var doubleValues = [];
  var selectedAction;

  for (var action = 0; action < qValues.length; action++) {
    if (qValues[action] > maxQ && this.thisWorld.validAction(state, action)) {
      selectedAction = action;
      maxQ = qValues[action];
      doubleValues = [];
      doubleValues.push(selectedAction);
    } else if (qValues[action] == maxQ && this.thisWorld.validAction(state, action)) {
      doubleValues.push(action);
    }
  }

  if (doubleValues.length > 0) {
    selectedAction = _.sample(doubleValues);//_.find(doubleValues, function(action){ return this.thisWorld.validAction(state, action); }, this);
  }

  return selectedAction;
};

RLearner.prototype.random = function(qValues, state) {
  // Choose new action if not valid.
  var selectedAction = _.random(0, qValues.length - 1);
  while (!this.thisWorld.validAction(state, selectedAction)) {
    selectedAction = _.random(0, qValues.length - 1);
    //console.log("Invalid action, new one:" + selectedAction);
  }
  return selectedAction;
};

RLearner.prototype.selectAction = function (state) {

  var qValues = this.policy.getQValuesAt(state);
  var selectedAction = -1;

  switch (this.method) {
    case 'random':
      selectedAction = this.random(qValues, state);
      break;
    case 'egreedy':
    {
      //Explore
      if (Math.random() < this.epsilon) {
        //console.log("Exploring ...");
        this.explorations++;
        selectedAction = this.random(qValues, state);
      } else {
        selectedAction = this.greedy(qValues, state);
      }
      break;
    }
    case 'greedy': selectedAction = this.greedy(qValues, state); break;
    case 'softmax': selectedAction = this.softmax(qValues, state); break;
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

RLPolicy.prototype.getMaxQValue = function (state, validAction) {
  return _.max(_.filter(this.qValuesTable[state[0]][state[1]], function(value, index){
    return validAction(state, index);
  }, validAction), function(value){
    return value;
  });
};

RLPolicy.prototype.getQValue = function (state, action) {
  return this.qValuesTable[state[0]][state[1]][action];
};

function CliffWorld() {
  // Actions.
  //this.UP = 0;
  //this.RIGHT = 1;
  //this.DOWN = 2;
  //this.LEFT = 3;

  // dimension: { x, y, actions }
  this.dimSize = [12, 4, 4];
};

CliffWorld.prototype.getDimension = function () {
  return this.dimSize;
};

CliffWorld.prototype.getNextState = function (state, action) {

  var newstate = (JSON.parse(JSON.stringify(state)));

  // UP-LEFT corner in coordinates 0,0
  if (action == 0)
    newstate[1]++;
  else if (action == 1)
    newstate[0]++;
  else if (action == 2)
    newstate[1]--;
  else if (action == 3)
    newstate[0]--;
  return newstate;
};

CliffWorld.prototype.isInBoard = function (state) {
  if (state[0] < 0 || state[0] > 11 || state[1] > 3 || state[1] < 0)
    return false;
  else return true;
};

CliffWorld.prototype.validAction = function (state, action) {

  // West border
  if (state[0] == 0 && action == 3)
    return false;
  // East border
  else if (state[0] == 11 && action == 1)
    return false;
  // North border
  else if (state[1] == 3 && action == 0)
    return false;
  // South border
  else if (state[1] == 0 && action == 2)
    return false;
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
    return 1;

  return -1;
};

CliffWorld.prototype.resetState = function () {
  return [0,0];
};

CliffWorld.prototype.getInitValues = function () {
  return 0;
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
