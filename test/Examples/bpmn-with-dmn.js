//bozuk

const {Engine} = require('bpmn-engine');
const fs = require('fs');
const { decisionTable } = require("stx-dmn-eval-js");
const getJson = require('bent')('json');

// prepare input
const params = {
  maas: 10000,
  sigorta: true
};
const file = '../resources/tax.dmn';
const dmnTable = 'decisionVergi';
 
// read file and run test function
try {
    const xml = fs.readFileSync(file, 'utf8');
    dmn(xml, dmnTable, params);
} catch (err) {
    console.error('error reading file at path: ', file, 'err: ', err);
}

async function dmn(xml, dmnTable, params) {
  try {
      const parsedDecisionTable = await decisionTable.parseDmnXml(xml)
      const result = decisionTable.evaluateDecision(dmnTable, parsedDecisionTable, params);
      console.log('result: ', result);
  } catch (err) {
      console.error('error: ', err);
  }

}

const engine = new Engine({
  name: 'bpmn with dmn',
  source: fs.readFileSync('../resources/dmn.bpmn'),
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
    getRequest: dmn
  }
}, (err, execution) => {
  if (err) throw err;

  console.log(execution.name, execution.environment.output);
});