'use strict';

const {Engine} = require('bpmn-engine');
const getJson = require('bent')('json');


async function getRequest(scope, callback) {
  try {
    var result = await getJson(scope.environment.variables.apiPath); // eslint-disable-line no-var
  } catch (err) {
    return callback(null, err);
  }

  return callback(null, result);
}

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <serviceTask id="serviceTask" name="Get" implementation="\${environment.services.getRequest}" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'service task example 3',
  source
});

engine.execute({
  variables: {
    apiPath: 'https://webayus-gateway.herokuapp.com/product/category'
  },
  services: {
    getRequest,
    // getService(defaultScope) {
    //   if (!defaultScope.content.id === 'serviceTask') return;
    //   return (executionContext, callback) => {
    //     callback(null, executionContext.environment.variables.input);
    //   };
    // }
  },
  // variables: {
  //   input: 1
  // },
  extensions: {
    saveToEnvironmentOutput(activity, {environment}) {
      activity.on('end', (api) => {
        environment.output[api.id] = api.content.output;
      });
    }
  }
});

engine.once('end', (execution) => {
  console.log(execution.name, execution.environment.output.serviceTask[0][0]._id);
});