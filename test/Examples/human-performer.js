const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

const source = `
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn">
  <process id="theProcess" isExecutable="true">
    <startEvent id="start" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="task" />
    <userTask id="task">
      <humanPerformer>
        <resourceAssignmentExpression>
          <formalExpression>\${environment.services.getUser()}</formalExpression>
        </resourceAssignmentExpression>
      </humanPerformer>
      <potentialOwner>
        <resourceAssignmentExpression>
          <formalExpression>user(pal), group(users)</formalExpression>
        </resourceAssignmentExpression>
      </potentialOwner>
    </userTask>
    <sequenceFlow id="flow2" sourceRef="task" targetRef="end" />
    <endEvent id="end" />
  </process>
</definitions>`;

function humanInvolvement(activity) {
  if (!activity.behaviour.resources || !activity.behaviour.resources.length) return;

  const humanPerformer = activity.behaviour.resources.find((resource) => resource.type === 'bpmn:HumanPerformer');
  const potentialOwner = activity.behaviour.resources.find((resource) => resource.type === 'bpmn:PotentialOwner');

  activity.on('enter', (api) => {
    activity.broker.publish('format', 'run.call.humans', {
      humanPerformer: api.resolveExpression(humanPerformer.expression),
      potentialOwner: api.resolveExpression(potentialOwner.expression),
    });
  });

  activity.on('wait', (api) => {
    api.owner.broker.publish('event', 'activity.call', {...api.content});
  });
}

const listener = new EventEmitter();

const engine = new Engine({
  name: 'call humans',
  source,
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  services: {
    getUser() {
      return 'pal';
    }
  },
  extensions: {
    humanInvolvement
  }
});

listener.on('activity.call', (api) => {
  console.log('Make call to', api.content.humanPerformer);
  console.log('Owner:', api.content.potentialOwner);
  api.signal();
});

engine.execute({listener}, (err, instance) => {
  if (err) throw err;
  console.log(instance.name, 'completed');
});