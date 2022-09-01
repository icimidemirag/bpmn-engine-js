const {Engine} = require('bpmn-engine');
const fs = require('fs');
const {EventEmitter} = require('events');

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
  source: fs.readFileSync('../resources/error-task.bpmn'),
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

const listener = new EventEmitter();

listener.on('activity.start', (api) => {
  if (api.id === 'endA') console.log(`<${api.id}> ye geldi`);
  if (api.id === 'endB') console.log(`<${api.id}> ye geldi`);
});

engine.execute({
  listener,
  services: {
    getRequest: async function getRequest(scope, callback) {
        try {
          var result = await getJson('https://webayus-gateway.herokuapp.com/product/categorys'); // eslint-disable-line no-var
          return callback(null, result);
        } catch (err) {
          return callback(null, err);
        }
      }
  }
}, (err, execution) => {
  if (err) throw err;

  // console.log(execution.name, execution.environment.output);
});