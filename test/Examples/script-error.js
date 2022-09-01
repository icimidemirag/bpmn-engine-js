'use strict';

const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');

const engine = new Engine({
  name: 'script task example',
  source: fs.readFileSync('../resources/script-error.bpmn'),
});

const listener = new EventEmitter();

listener.on('activity.start', (api) => {
  if (api.id === 'end') console.log(`<${api.id}> ye geldi`);
  if (api.id === 'endInError') console.log(`<${api.id}> ye geldi`);
});

engine.execute({
  listener,
  variables: {
  }
});
engine.on('end', (execution) => {
  console.log('Output:', execution.environment.output.result[0]._id);
});