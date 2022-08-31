'use strict';

const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="start" />
    <userTask id="task" />
    <endEvent id="end" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="task" />
    <sequenceFlow id="flow2" sourceRef="task" targetRef="end" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'user task example 1',
  source
});

const listener = new EventEmitter();

listener.once('wait', (elementApi) => {
  elementApi.signal({
    sirname: 'von Rosen'
  });
});

listener.on('activity.end', (elementApi, engineApi) => {
  if (elementApi.content.output) engineApi.environment.output[elementApi.id] = elementApi.content.output;
});

engine.execute({
  listener
}, (err, execution) => {
  if (err) throw err;
  console.log(`User sirname is ${execution.environment.output.task.sirname}`);
});