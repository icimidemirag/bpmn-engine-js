const {Engine} = require('bpmn-engine');
const bent = require('bent');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="theStart" />
    <scriptTask id="scriptTask" scriptFormat="Javascript">
      <script>
        <![CDATA[
          const get = environment.services.get;

          const self = this;

          get('https://example.com/test').then((body) => {
            environment.variables.scriptTaskCompleted = true;
            next(null, {result: body});
          }).catch(next)
        ]]>
      </script>
    </scriptTask>
    <endEvent id="theEnd" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="scriptTask" />
    <sequenceFlow id="flow2" sourceRef="scriptTask" targetRef="theEnd" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'services doc',
  source
});

engine.execute({
  services: {
    get: bent('json')
  }
}, (err, engineApi) => {
  if (err) throw err;
  console.log('completed', engineApi.name, engineApi.environment.variables);
});