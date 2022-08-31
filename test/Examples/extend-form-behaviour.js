const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions id="pending" xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:camunda="http://camunda.org/schema/1.0/bpmn">
  <process id="theWaitingGame" isExecutable="true">
    <startEvent id="start" />
    <parallelGateway id="fork" />
    <userTask id="userTask1">
      <extensionElements>
        <camunda:formData>
          <camunda:formField id="surname" label="Surname" type="string" />
          <camunda:formField id="givenName" label="Given name" type="string" />
        </camunda:formData>
      </extensionElements>
    </userTask>
    <userTask id="userTask2" />
    <task id="task" />
    <parallelGateway id="join" />
    <endEvent id="end" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="fork" />
    <sequenceFlow id="flow2" sourceRef="fork" targetRef="userTask1" />
    <sequenceFlow id="flow3" sourceRef="fork" targetRef="userTask2" />
    <sequenceFlow id="flow4" sourceRef="fork" targetRef="task" />
    <sequenceFlow id="flow5" sourceRef="userTask1" targetRef="join" />
    <sequenceFlow id="flow6" sourceRef="userTask2" targetRef="join" />
    <sequenceFlow id="flow7" sourceRef="task" targetRef="join" />
    <sequenceFlow id="flowEnd" sourceRef="join" targetRef="end" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'Pending game',
  source,
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  extensions: {
    camunda: camundaExt
  }
});

const listener = new EventEmitter();

listener.on('wait', (elementApi) => {
  if (elementApi.content.form) {
    // console.log(elementApi.content.form);
    return elementApi.signal(elementApi.content.form.fields.reduce((result, field) => {
      console.log(field.id, field.value);
      if (field.label === 'Surname') result[field.id] = 'von Rosen';
      if (field.label === 'Given name') result[field.id] = 'Sebastian';
    console.log(result);
      return result;
    }, {}));
  }
  console.log(elementApi);
  elementApi.signal();
});

engine.execute({
  listener
});

function camundaExt(activity) {
  if (!activity.behaviour.extensionElements) return;
  let form;
  for (const extn of activity.behaviour.extensionElements.values) {
    if (extn.$type === 'camunda:FormData') {
      form = {
        fields: extn.fields.map((f) => ({...f}))
      };
    }
  }

  activity.on('enter', () => {
    activity.broker.publish('format', 'run.form', {form});
  });
}