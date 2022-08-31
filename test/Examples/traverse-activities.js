const {Engine} = require('bpmn-engine');
const BpmnModdle = require('bpmn-moddle');
const elements = require('bpmn-elements');
const {default: Serializer, TypeResolver} = require('moddle-context-serializer');

const source = `
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="Process_1" isExecutable="true">
    <startEvent id="start">
      <outgoing>toSayHiTask1</outgoing>
    </startEvent>
    <task id="sayHiTask" name="say hi">
      <incoming>toSayHiTask1</incoming>
      <outgoing>toEnd1</outgoing>
      <outgoing>toEnd2</outgoing>
    </task>
    <sequenceFlow id="toSayHiTask1" sourceRef="start" targetRef="sayHiTask" />
    <endEvent id="end1">
      <incoming>toEnd1</incoming>
    </endEvent>
    <sequenceFlow id="toEnd1" sourceRef="sayHiTask" targetRef="end1" />
    <endEvent id="end2">
      <incoming>toEnd2</incoming>
    </endEvent>
    <sequenceFlow id="toEnd2" sourceRef="sayHiTask" targetRef="end2" />
  </process>
</definitions>`;

(async function IIFE() {
  const moddleContext = await (new BpmnModdle({
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  })).fromXML(source);

  const sourceContext = Serializer(moddleContext, TypeResolver(elements));

  const engine = new Engine({
    sourceContext,
  });

  const [definition] = await engine.getDefinitions();

  const shakenStarts = definition.shake();

  console.log('first sequence', shakenStarts.start[0].sequence.reduce(printSequence, ''));
  console.log('second sequence', shakenStarts.start[1].sequence.reduce(printSequence, ''));

  function printSequence(res, s) {
    if (!res) return s.id;
    res += ' -> ' + s.id;
    return res;
  }
})();