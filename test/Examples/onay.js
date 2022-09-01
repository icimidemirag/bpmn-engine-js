const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');

const engine = new Engine({
  name: 'onay example',
  source: fs.readFileSync('../resources/onay.bpmn'),
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  extensions: {
    camunda: camundaExt
  }
});

const listener = new EventEmitter();

listener.on('activity.start', (api,deneme) => {
  if (api.id === 'approval') {
    if(deneme.environment.output.form.number > 10){
      api.environment.variables.isNotAprroved = false;
    }else{
      api.environment.variables.isNotAprroved = true;
    }
    // console.log(deneme.environment.output);
    // console.log(api.environment.options);
    // console.log(`<${api.id}> ye geldi`)
  };
  // if (api.id === 'karar') console.log(`<${api.id}> ye geldi`);
});

listener.on('activity.end', (api,deneme) => {
  if (api.id === 'form') {
    // console.log(api.content.output);
    deneme.environment.output[api.id] = api.content.output;
    // console.log(api.environment.options);
    // console.log(`<${api.id}> ye geldi`)
  };
  if (api.id === 'karar') console.log(`<${api.id}> ye geldi`);
});


listener.on('wait', (elementApi,engineApi) => {
  // console.log(elementApi.content);
    if (elementApi.content.form) {
      // console.log(elementApi.content.form);
      return elementApi.signal(elementApi.content.form.fields.reduce((result, field) => {
        // console.log(field.id);
        if (field.label === 'Number') {
          // console.log(engineApi.environment.output.form);
          result[field.id] = engineApi.environment.output.form ? engineApi.environment.output.form.number+1 : 7;
        };
      console.log(result);
        return result;
      }, {}));
    }
  
    elementApi.signal();
  });

engine.execute({
  listener,
  variables: {
    isNotAprroved: true
  }
});

engine.on('end', () => {
  console.log('completed');
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