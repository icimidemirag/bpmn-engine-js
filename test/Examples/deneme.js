const {Engine} = require('bpmn-engine');
const fs = require('fs');
const {EventEmitter} = require('events');

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

const engine = new Engine({
  name: 'deneme 2',
  source: fs.readFileSync('../resources/deneme.bpmn'),
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  extensions: {
    camunda: camundaExt,
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

listener.on('wait', (elementApi) => {
    if (elementApi.content.form) {
      // console.log(elementApi.content.form);
      return elementApi.signal(elementApi.content.form.fields.reduce((result, field) => {
        console.log(field.id);
        if (field.label === 'Given quantity') result[field.id] = 15;
        if (field.label === 'Given name') result[field.id] = 'Sebastian';
      console.log(result);
        return result;
      }, {}));
    }
  
    elementApi.signal();
  });
  
listener.on('activity.end', (activity) => {
  if (activity.isEnd) {
    console.log(`${activity.type} <${activity.id}> input is`, activity.getInput());
  }
});

engine.execute({
    listener,
  services: {
    getRequest: async function getRequest(scope) {
        // console.log();
      }
  }
}, (err, execution) => {
  if (err) throw err;

  console.log(execution.name, execution.environment.output);
});