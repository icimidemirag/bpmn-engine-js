const {Engine} = require('bpmn-engine');

const state = fetchSomeState();
const engine = new Engine().recover(state);