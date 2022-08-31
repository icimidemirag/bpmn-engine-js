const {Engine} = require('bpmn-engine');
const fs = require('fs');

const engine = new Engine({
  name: 'mother of all',
  source: fs.readFileSync('../resources/mother-of-all.bpmn'),
});