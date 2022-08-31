const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions id="testProcess" xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess1" isExecutable="true">
    <startEvent id="theStart" />
    <exclusiveGateway id="decision" default="flow2" />
    <endEvent id="end1" />
    <endEvent id="end2" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="decision" />
    <sequenceFlow id="flow2" sourceRef="decision" targetRef="end1" />
    <sequenceFlow id="flow3withExpression" sourceRef="decision" targetRef="end2">
      <conditionExpression xsi:type="tFormalExpression">\${environment.services.isBelow(environment.variables.input,2)}</conditionExpression>
    </sequenceFlow>
  </process>
</definitions>
`;

const engine = new Engine({
  name: 'sequence flow example',
  source
});

const listener = new EventEmitter();
listener.on('activity.end', (elementApi) => {
  if (elementApi.id === 'end2') throw new Error(`<${elementApi.id}> should not have been taken`);
});

engine.execute({
  listener,
  services: {
    isBelow: (input, test) => {
      return input < test;
    }
  },
  variables: {
    input: 3
  }
});

engine.once('end', () => {
  console.log('WOHO!');
});