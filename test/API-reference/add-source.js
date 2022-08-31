const BpmnModdle = require('bpmn-moddle');
const elements = require('bpmn-elements');
const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const {default: serializer, TypeResolver} = require('moddle-context-serializer');

const engine = new Engine({
  name: 'add source',
});

(async function IIFE(source) {
  const sourceContext = await getContext(source);
  engine.addSource({
    sourceContext,
  });

  const listener = new EventEmitter();
  listener.once('wait', (api) => {
    console.log(api.name, 'is waiting');
    api.signal();
  });

  await engine.execute({
    listener
  });

  await engine.waitFor('end');
})(`
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="start" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="task" />
    <userTask id="task" name="lazy source user" />
    <sequenceFlow id="flow2" sourceRef="task" targetRef="end" />
    <endEvent id="end" />
  </process>
</definitions>
`);

async function getContext(source, options = {}) {
  const moddleContext = await getModdleContext(source, options);
  if (moddleContext.warnings) {
    moddleContext.warnings.forEach(({error, message, element, property}) => {
      if (error) return console.error(message);
      console.error(`<${element.id}> ${property}:`, message);
    });
  }

  const types = TypeResolver({
    ...elements,
    ...options.elements,
  });

  return serializer(moddleContext, types, options.extendFn);
}

function getModdleContext(source, options) {
  const bpmnModdle = new BpmnModdle(options);
  return bpmnModdle.fromXML(source);
}