const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <userTask id="userTasks" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'first listener',
  source
});

const listener = new EventEmitter();
listener.on('activity.enter', (elementApi, engineApi) => {
  console.log(`${elementApi.type} <${elementApi.id}> of ${engineApi.name} is entered`);
});

listener.on('wait', (elementApi, instance) => {
  console.log(`${elementApi.type} <${elementApi.id}> of ${instance.name} is waiting for input`);
  elementApi.signal('don´t wait for me');
});

engine.execute({
  listener
});