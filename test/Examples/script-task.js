'use strict';

const {Engine} = require('bpmn-engine');
const bent = require('bent');
const fs = require('fs');

const engine = new Engine({
  name: 'script task example',
  source: fs.readFileSync('../resources/script-task.bpmn'),
});

engine.execute({
  variables: {
    scriptTaskCompleted: false,
    apiPath: 'https://webayus-gateway.herokuapp.com/product/category'
  },
  services: {
    get: bent('json'),
    set,
  }
});
engine.on('end', (execution) => {
  console.log('Output:', execution.environment.output.result[0]._id);
});

function set(activity, name, value) {
  activity.logger.debug('set', name, 'to', value);
}