const {Engine} = require('bpmn-engine');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions id="Definition_42" xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="theStart" />
    <userTask id="userTask" />
    <endEvent id="theEnd" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="userTask" />
    <sequenceFlow id="flow2" sourceRef="userTask" targetRef="theEnd" />
  </process>
</definitions>`;

const engine = new Engine({
  source
});

engine.getDefinitions().then((definitions) => {
  console.log('Loaded', definitions[0].id);
  console.log('The definition comes with process', definitions[0].getProcesses()[0].id);
});