'use strict';

const BpmnEngine = require('bpmn-engine');
const EventEmitter = require('events').EventEmitter;

const aboveSource = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>SequenceFlow_1blokv8</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="SequenceFlow_1blokv8" sourceRef="StartEvent_1" targetRef="sp1" />
    <bpmn:subProcess id="sp1" name="subprocess">
      <bpmn:incoming>SequenceFlow_1blokv8</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_1aosxye</bpmn:outgoing>
      <bpmn:startEvent id="StartEvent_1jffh2p">
        <bpmn:outgoing>SequenceFlow_06ldstg</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:sequenceFlow id="SequenceFlow_06ldstg" sourceRef="StartEvent_1jffh2p" targetRef="Task1" />
      <bpmn:userTask id="Task1" name="propose draft">
        <bpmn:extensionElements>
          <camunda:formData>
            <camunda:formField id="name" type="string" />
          </camunda:formData>
          <camunda:inputOutput>
            <camunda:outputParameter name="m_name">
              <camunda:script scriptFormat="javascript">this.name</camunda:script>
            </camunda:outputParameter>
          </camunda:inputOutput>
        </bpmn:extensionElements>
        <bpmn:incoming>SequenceFlow_06ldstg</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_14l40b3</bpmn:outgoing>
      </bpmn:userTask>
      <bpmn:sequenceFlow id="SequenceFlow_14l40b3" sourceRef="Task1" targetRef="Task2" />
      <bpmn:endEvent id="EndEvent_0uhk3vh">
        <bpmn:incoming>SequenceFlow_039clkq</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_039clkq" sourceRef="Task2" targetRef="EndEvent_0uhk3vh" />
      <bpmn:userTask id="Task2" name="confirm final name">
        <bpmn:extensionElements>
          <camunda:formData>
            <camunda:formField id="finalName" type="string" />
          </camunda:formData>
          <camunda:inputOutput>

            <!-- Expressions are faster ($ is escaped only when in js) -->
            <camunda:outputParameter name="m_finalName" value="\${finalName}"/>

          </camunda:inputOutput>
        </bpmn:extensionElements>
        <bpmn:incoming>SequenceFlow_14l40b3</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_039clkq</bpmn:outgoing>
      </bpmn:userTask>

      <!-- SubProcesses takes IO as well -->
      <bpmn:extensionElements>
        <camunda:inputOutput>
          <camunda:outputParameter name="finalName" value="\${m_finalName}" />
        </camunda:inputOutput>
      </bpmn:extensionElements>

    </bpmn:subProcess>
    <bpmn:endEvent id="EndEvent_0hyjotx">
      <bpmn:incoming>SequenceFlow_1aosxye</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_1aosxye" sourceRef="sp1" targetRef="EndEvent_0hyjotx" />
  </bpmn:process>
</definitions>
`;

const listener = new EventEmitter();

listener.on('wait', (task) => {
  console.log(`${task.type} <${task.id}> is waiting for signal`);

  if (task.id === 'Task1') {
    return task.signal({name: 'kebab-case-draft'});
  }
  if (task.id === 'Task2') {
    return task.signal({finalName: 'camelCase'});
  }

  task.signal();
});

const engine = new BpmnEngine.Engine({
  source: aboveSource,
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda')
  }
});
engine.execute({
  listener,
  variables: {}
}, (err) => {
  if (err) console.log(err)
});
engine.once('end', (def) => {
  console.log('completed', def.variables);
});