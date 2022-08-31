'use strict';

const {Engine} = require('bpmn-engine');
const fs = require('fs');

const getJson = require('bent')('json');

async function getRequest(scope, callback) {
  try {
    var result = await getJson(scope.environment.variables.apiPath); // eslint-disable-line no-var
    return callback(null, result);
  } catch (err) {
    return callback(null, err);
  }
}

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:camunda="http://camunda.org/schema/1.0/bpmn">
  <process id="theProcess" isExecutable="true">
  <startEvent id="theStart" />
  <serviceTask id="serviceTask" implementation="\${environment.services.getRequest}" camunda:resultVariable="serviceResult" />
  <serviceTask id="serviceTask2" implementation="\${environment.services.getRequest2}" camunda:resultVariable="serviceResult2" />
  <endEvent id="theEnd" />
  <sequenceFlow id="flow1" sourceRef="theStart" targetRef="serviceTask" />
  <sequenceFlow id="flow2" sourceRef="serviceTask" targetRef="theEnd" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'service task example 1',
  source,
  // source: fs.readFileSync('../resources/service-task.bpmn'),
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  extensions: {
    saveToResultVariable(activity, {environment}) {
      if (activity.behaviour['$type'] !== 'bpmn:ServiceTask') return;

      // activity.on('end', ({environment, content}) => {
      //   environment.output["omer"] = content.output[0];
      // });
      activity.on('end', (api) => {
        environment.output[api.id] = api.content.output;
      });
    },
  }
});

engine.execute({
  variables: {
    apiPath: 'https://webayus-gateway.herokuapp.com/product/category'
  },
  services: {
    getRequest,
    getRequest2: getRequest
  }
}, (err, execution) => {
  if (err) throw err;

  console.log('Service task output:', execution.environment.output['serviceTask2'][0][0]._id);
});