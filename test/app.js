const {Engine} = require('bpmn-engine');
const fs = require('fs');

const engine = new Engine({
  name: 'mother of all',
  source: fs.readFileSync('./mother-of-all.bpmn'),
});