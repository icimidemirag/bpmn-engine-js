const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <dataObjectReference id="inputFromUserRef" dataObjectRef="inputFromUser" />
    <dataObject id="inputFromUser" />
    <startEvent id="theStart" />
    <userTask id="userTask">
      <ioSpecification id="inputSpec">
        <dataOutput id="userInput" />
      </ioSpecification>
      <dataOutputAssociation id="associatedWith" sourceRef="userInput" targetRef="inputFromUserRef" />
    </userTask>
    <endEvent id="theEnd" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="userTask" />
    <sequenceFlow id="flow2" sourceRef="userTask" targetRef="theEnd" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'first',
  source,
  variables: {
    data: {
      inputFromUser: 0,
    }
  }
});

const listener = new EventEmitter();
listener.on('wait', (elementApi) => {
  elementApi.owner.logger.debug(`<${elementApi.executionId} (${elementApi.id})> signal with io`, elementApi.content.ioSpecification);
  elementApi.signal({
    ioSpecification: {
      dataOutputs: [{
        id: 'userInput',
        value: 2
      }]
    }
  });
});

engine.execute({
  listener,
  variables: {
    data: {
      inputFromUser: 1,
    }
  }
}, (err, execution) => {
  if (err) throw err;
  console.log('completed with overridden listener', execution.environment.output);
});