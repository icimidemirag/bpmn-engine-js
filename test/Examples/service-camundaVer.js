const {Engine} = require('bpmn-engine');
const fs = require('fs');

const getJson = require('bent')('json');

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
      const getRequest = environment.resolveExpression(expression, executionMessage);
      getRequest.call(activity, executionMessage, (err, result) => {
        callback(err, result);
      });
    }
  }

const engine = new Engine({
  name: 'deneme 2',
  source: fs.readFileSync('../resources/service-task.bpmn'),
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
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

engine.execute({
  services: {
    getRequest: async function getRequest(scope, callback) {
        try {
          var result = await getJson('https://webayus-gateway.herokuapp.com/product/category'); // eslint-disable-line no-var
          return callback(null, result);
        } catch (err) {
          return callback(null, err);
        }
      }
  }
}, (err, execution) => {
  if (err) throw err;

  console.log(execution.name, execution.environment.output);
});