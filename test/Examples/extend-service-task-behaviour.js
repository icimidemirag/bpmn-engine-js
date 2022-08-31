const {Engine} = require('bpmn-engine');

const source = `
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn">
  <process id="theProcess" isExecutable="true">
    <serviceTask id="task1" camunda:expression="\${environment.services.serviceFn}" camunda:resultVariable="result" />
  </process>
</definitions>`;

function ServiceExpression(activity) {
  const {type: atype, behaviour, environment} = activity;
  const expression = behaviour.expression;
  const type = `${atype}:expression`;
  return {
    type,
    expression,
    execute,
  };
  function execute(executionMessage, callback) {
    const serviceFn = environment.resolveExpression(expression, executionMessage);
    serviceFn.call(activity, executionMessage, (err, result) => {
      callback(err, result);
    });
  }
}

const engine = new Engine({
  name: 'extend service task',
  source,
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  services: {
    serviceFn(scope, callback) {
      callback(null, {data: 1});
    }
  },
  extensions: {
    camundaServiceTask(activity) {
      if (activity.behaviour.expression) {
        activity.behaviour.Service = ServiceExpression;
      }
      if (activity.behaviour.resultVariable) {
        activity.on('end', (api) => {
          activity.environment.output[activity.behaviour.resultVariable] = api.content.output;
        });
      }
    },
  }
});

engine.execute((err, instance) => {
  if (err) throw err;
  console.log(instance.name, instance.environment.output);
});