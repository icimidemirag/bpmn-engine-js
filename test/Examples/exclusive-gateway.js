const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');

const engine = new Engine({
  name: 'exclusive gateway example',
  source: fs.readFileSync('../resources/exclusive-gateway.bpmn'),
});

const listener = new EventEmitter();

listener.on('activity.start', (api) => {
  if (api.id === 'end1') throw new Error(`<${api.id}> was not supposed to be taken, check your input`);
  if (api.id === 'end2') console.log(`<${api.id}> correct decision was taken`);
});

engine.execute({
  listener,
  variables: {
    input: 51
  }
});

engine.on('end', () => {
  console.log('completed');
});