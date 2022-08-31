const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');

const engine = new Engine({
  name: 'onay example',
  source: `<?xml version="1.0" encoding="UTF-8"?>
  <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1jsnnah" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.2.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.17.0">
    <bpmn:process id="Process_151m4is" isExecutable="true">
      <bpmn:startEvent id="start">
        <bpmn:outgoing>flowStart</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:sequenceFlow id="flowStart" sourceRef="start" targetRef="form" />
      <bpmn:userTask id="form" name="Form">
        <bpmn:extensionElements>
          <camunda:formData>
            <camunda:formField id="number" label="Number" type="long" defaultValue="0" />
          </camunda:formData>
        </bpmn:extensionElements>
        <bpmn:incoming>flowStart</bpmn:incoming>
        <bpmn:incoming>flowWay</bpmn:incoming>
        <bpmn:outgoing>flowForm</bpmn:outgoing>
      </bpmn:userTask>
      <bpmn:sequenceFlow id="flowForm" sourceRef="form" targetRef="dmn" />
      <bpmn:manualTask id="approval" name="Approval">
        <bpmn:incoming>flowDmn</bpmn:incoming>
        <bpmn:outgoing>flowManual</bpmn:outgoing>
      </bpmn:manualTask>
      <bpmn:endEvent id="end">
        <bpmn:incoming>flowWayEnd</bpmn:incoming>
        <bpmn:incoming>flowDmnEnd</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="flowManual" sourceRef="approval" targetRef="karar" />
      <bpmn:exclusiveGateway id="karar" camunda:asyncBefore="true" camunda:asyncAfter="true" default="flowWayEnd">
        <bpmn:incoming>flowManual</bpmn:incoming>
        <bpmn:outgoing>flowWay</bpmn:outgoing>
        <bpmn:outgoing>flowWayEnd</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:sequenceFlow id="flowWay" sourceRef="karar" targetRef="form">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" language="Javascript">next(null, this.environment.variables.isNotAprroved)</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="flowWayEnd" sourceRef="karar" targetRef="end" />
      <bpmn:businessRuleTask id="dmn" name="Dmn" camunda:resultVariable="isNotApproval" camunda:decisionRef="decision" camunda:mapDecisionResult="singleEntry">
        <bpmn:incoming>flowForm</bpmn:incoming>
        <bpmn:outgoing>flowDmn</bpmn:outgoing>
        <bpmn:outgoing>flowDmnEnd</bpmn:outgoing>
      </bpmn:businessRuleTask>
      <bpmn:sequenceFlow id="flowDmn" sourceRef="dmn" targetRef="approval" />
      <bpmn:sequenceFlow id="flowDmnEnd" sourceRef="dmn" targetRef="end" />
    </bpmn:process>
    <bpmn:message id="Message_14ur0bt" name="Message_14ur0bt" />
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_151m4is">
        <bpmndi:BPMNEdge id="Flow_0b5kh3g_di" bpmnElement="flowWayEnd">
          <di:waypoint x="695" y="400" />
          <di:waypoint x="870" y="400" />
          <di:waypoint x="870" y="135" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="Flow_09t4khv_di" bpmnElement="flowWay">
          <di:waypoint x="645" y="400" />
          <di:waypoint x="320" y="400" />
          <di:waypoint x="320" y="260" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="Flow_07h3pxp_di" bpmnElement="flowManual">
          <di:waypoint x="670" y="280" />
          <di:waypoint x="670" y="375" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="Flow_07ev3mj_di" bpmnElement="flowForm">
          <di:waypoint x="370" y="220" />
          <di:waypoint x="425" y="220" />
          <di:waypoint x="425" y="117" />
          <di:waypoint x="480" y="117" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="Flow_0gsc750_di" bpmnElement="flowStart">
          <di:waypoint x="188" y="220" />
          <di:waypoint x="270" y="220" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="Flow_0o95tky_di" bpmnElement="flowDmn">
          <di:waypoint x="580" y="117" />
          <di:waypoint x="670" y="117" />
          <di:waypoint x="670" y="200" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="Flow_1g73b51_di" bpmnElement="flowDmnEnd">
          <di:waypoint x="580" y="117" />
          <di:waypoint x="852" y="117" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNShape id="Activity_0hkhafy_di" bpmnElement="dmn">
          <dc:Bounds x="480" y="77" width="100" height="80" />
          <bpmndi:BPMNLabel />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="start">
          <dc:Bounds x="152" y="202" width="36" height="36" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Activity_10es7sw_di" bpmnElement="form">
          <dc:Bounds x="270" y="180" width="100" height="80" />
          <bpmndi:BPMNLabel />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Activity_0ldr0or_di" bpmnElement="approval">
          <dc:Bounds x="620" y="200" width="100" height="80" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Gateway_1odw2i8_di" bpmnElement="karar" isMarkerVisible="true">
          <dc:Bounds x="645" y="375" width="50" height="50" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Event_0d7s9up_di" bpmnElement="end">
          <dc:Bounds x="852" y="99" width="36" height="36" />
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn:definitions>
  `,
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda.json'),
  },
  extensions: {
    camunda: camundaExt,
    camundaServiceTask(activity) {
        if (activity.behaviour.resultVariable) {
          activity.on('end', (api) => {
            activity.environment.output[activity.behaviour.resultVariable] = api.content.output;
          });
        }
      },
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
  if(api.id === 'dmnTask'){
    console.log(api.context);
  }
});

listener.on('activity.end', (api,deneme) => {
  if (api.id === 'form') {
    // console.log(api.content.output);
    deneme.environment.output[api.id] = api.content.output;
    // console.log(api.environment.options);
    // console.log(`<${api.id}> ye geldi`)
  };
  // if (api.id === 'karar') console.log(`<${api.id}> ye geldi`);
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