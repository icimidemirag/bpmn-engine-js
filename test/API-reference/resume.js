const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const state = fetchSomeState();
const engine = new Engine().recover(state);

const listener = new EventEmitter();

engine.resume({listener}, () => {
  console.log('completed');
});