const {Engine} = require('bpmn-engine');
const JsExtension = require('../tmp/JsExtension');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions id="Definitions_1" xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:js="http://paed01.github.io/bpmn-engine/schema/2017/08/bpmn">
  <process id="Process_with_loop" isExecutable="true">
    <serviceTask id="recurring" name="Each item" implementation="\${environment.services.loop}" js:result="sum">
      <multiInstanceLoopCharacteristics isSequential="true" js:collection="\${environment.variables.input}" />
    </serviceTask>
    <boundaryEvent id="errorEvent" attachedToRef="recurring">
      <errorEventDefinition />
    </boundaryEvent>
  </process>
</definitions>`;

const engine = new Engine({
  name: 'loop collection',
  source,
  moddleOptions: {
    js: JsExtension.moddleOptions
  },
//   extensions: {
//     js: JsExtension.extension
//   },
});

let sum = 0;

engine.execute({
  services: {
    loop: (executionContext, callback) => {
      sum += executionContext.content.item;
      callback(null, sum);
    }
  },
  variables: {
    input: [1, 2, 3, 7]
  }
});

engine.once('end', () => {
  console.log(sum, 'aught to be 13 blazing fast');
});