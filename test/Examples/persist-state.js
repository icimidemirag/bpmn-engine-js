const camundaModdle = require('camunda-bpmn-moddle/resources/camunda');
const {Engine: BpmnEngine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const {v4: uuid} = require('uuid');
const fs = require('fs');

function getSourceSync(file) {
  return fs.readFileSync(file);
}

function getAllowedServices() {
  return {
    myServiceFn(executionMessage,  callback) {
      // do something servicewise
      callback(null, {myResult: 1});
    },
  };
}

function getExtensions() {
  return {};
}

function ignite(executionId, options = {}) {
  const {name, settings} = options;
  const listener = new EventEmitter();
  listener.on('activity.wait', (_, execution) => {
    return publishEvent('bpmn.state.update', {state: execution.getState()});
  });
  listener.on('activity.end', (_, execution) => {
    return publishEvent('bpmn.state.update', {state: execution.getState()});
  });
  listener.on('activity.timer', (api, execution) => {
    return publishEvent('bpmn.state.expires', {
      expires: new Date(api.content.startedAt + api.content.timeout),
      state: execution.getState(),
    });
  });
  listener.on('activity.timeout', (_, execution) => {
    return publishEvent('bpmn.state.expired', {
      expired: new Date(),
      state: execution.getState(),
    });
  });

  const engine = BpmnEngine({
    moddleOptions: {
      camunda: camundaModdle
    },
    ...options,
    settings: {
      ...settings,
      executionId,
      enableDummyService: false,
    }
  });
  engine.once('end', () => {
    publishEvent('bpmn.completed');
  });
  engine.once('error', (err) => {
    publishEvent('bpmn.error', {message: err.message, error: err});
  });

  return {engine, listener};

  function publishEvent(routingKey, message) {
    publish('events', routingKey, {
      name,
      executionId,
      ...message,
    });
  }
}

const {engine} = ignite(uuid(), {
  name: 'persisted engine #1',
  source: getSourceSync('../resources/mother-of-all.bpmn'),
  services: getAllowedServices(),
  extensions: getExtensions(),
});

engine.execute();