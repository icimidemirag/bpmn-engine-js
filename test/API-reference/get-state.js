const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');

const processXml = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="theStart" />
    <userTask id="userTask" />
    <endEvent id="theEnd" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="userTask" />
    <sequenceFlow id="flow2" sourceRef="userTask" targetRef="theEnd" />
  </process>
</definitions>`;

const engine = new Engine({
  name: "Icimi",
  source: processXml
});

const listener = new EventEmitter();

let state;
listener.once('wait', async() => {
  state = await engine.getState();
  fs.writeFileSync('../tmp/some-random-id.json', JSON.stringify(state, null, 2));
  console.log(JSON.stringify(state, null, 2));
});

listener.once('activity.start', () => {
  state = engine.getState();
  fs.writeFileSync('../tmp/some-random-id.json', JSON.stringify(state, null, 2));
  console.log(state);
});

engine.execute({
  listener
}, (err) => {
  if (err) throw err;
});