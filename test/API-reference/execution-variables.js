const {Engine} = require('bpmn-engine');
const fs = require('fs');

const engine = new Engine({
  name: 'using variables',
  source: fs.readFileSync('../resources/simple-task.bpmn')
});

const variables = {
  input: 1
};

engine.execute({
  variables
}, (err, engineApi) => {
  if (err) throw err;
  console.log('completed');
});