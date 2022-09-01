const express = require("express");
const cors = require("cors")
const { Engine } = require("bpmn-engine");
const { EventEmitter } = require("events");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

var state = null;

function camundaExt(activity) {
  if (!activity.behaviour.extensionElements) return;
  let form;
  for (const extn of activity.behaviour.extensionElements.values) {
    if (extn.$type === "camunda:FormData") {
      form = {
        fields: extn.fields.map((f) => ({ ...f })),
      };
    }
  }

  activity.on("enter", () => {
    activity.broker.publish("format", "run.form", { form });
  });
}

app.post("/start", (req, res) => {
  if(state){
    return res.json({started: true});
  }
  const engine = new Engine({
    name: "onay example",
    source: fs.readFileSync("./onay.bpmn"),
    moddleOptions: {
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    },
    extensions: {
      camunda: camundaExt,
    },
  });

  const listener = new EventEmitter();

  listener.on("wait", (api, deneme) => {
    state = deneme.getState();
    res.json({started: true});
  });

  engine.execute({
    listener,
    variables: {
      isNotAprroved: true,
    },
  });
});

app.get("/isFinished", (req, res) => {
  if (state === null) {
    return res.json({started: false});
  }
  const engine = new Engine({
    name: "onay example",
    source: fs.readFileSync("./onay.bpmn"),
    moddleOptions: {
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    },
    extensions: {
      camunda: camundaExt,
    },
  }).recover(state);
  const listener = new EventEmitter();
  listener.on("wait", (elementApi, engineApi) => {
    if (elementApi.environment.variables.isNotAprroved) {
      console.log(elementApi.environment.variables);
      if(elementApi.environment.variables.message){
        res.json({ isFinished: false,message: elementApi.environment.variables.message });
      }
      res.json({ isFinished: false });
    }
    else{
      delete engineApi.environment.output.form;
    }
    elementApi.signal();
  });
  engine.on("end", (elementApi,engineApi) => {
    state = null;
    console.log("completed");
    res.json({ isFinished: true });
  });
  engine.resume({
    listener,
    variables: {
      isNotAprroved: true,
    },
  });
});

app.get("/getNumber", (req, res) => {
  if (state === null) {
    return res.json({started: false});
  }
  const engine = new Engine({
    name: "onay example",
    source: fs.readFileSync("./onay.bpmn"),
    moddleOptions: {
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    },
    extensions: {
      camunda: camundaExt,
    },
  }).recover(state);
  const listener = new EventEmitter();
  listener.on("wait", (elementApi, engineApi) => {
    if(engineApi.environment.output.form){
      res.json({ form: engineApi.environment.output.form });
    }
    else{
      res.json({ isNotForm: true });
    }
  });
  engine.resume({
    listener,
    variables: {
      isNotAprroved: true,
    },
  });
});

app.post("/sendNumber", async (req, res) => {
  if (state === null) {
    return res.json({started: false});
  }
  const engine = new Engine({
    name: "onay example",
    source: fs.readFileSync("./onay.bpmn"),
    moddleOptions: {
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    },
    extensions: {
      camunda: camundaExt,
    },
  }).recover(state);
  const listener = new EventEmitter();
  listener.on("wait", (elementApi, engineApi) => {
    if (elementApi.content.form) {
      return elementApi.signal(
        elementApi.content.form.fields.reduce((result, field) => {
          if (field.label === "Number") {
            result[field.id] = req.body.number;
            engineApi.environment.output[elementApi.id] = {
              number: result[field.id],
            };
            state = engineApi.getState();
            res.json(result);
          }
          return result;
        }, {})
      );
    }
    elementApi.signal();
  });
  engine.resume({
    listener,
    variables: {
      isNotAprroved: true,
    },
  });
});

app.post("/approval", (req, res) => {
  if (state === null) {
    return res.json({started: false});
  }
  const engine = new Engine({
    name: "onay example",
    source: fs.readFileSync("./onay.bpmn"),
    moddleOptions: {
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    },
    extensions: {
      camunda: camundaExt,
    },
  }).recover(state);
  const listener = new EventEmitter();
  listener.on("wait", (elementApi, engineApi) => {
    if (elementApi.id === "approval") {
      if (engineApi.environment.output.form) {
        if(req.body.isNotAprroved){
          elementApi.environment.variables.message = req.body.message
        }
        elementApi.environment.variables.isNotAprroved = req.body.isNotAprroved
        state = engineApi.getState();
        res.json({isNotAprroved:elementApi.environment.variables.isNotAprroved});
      }
      else{
        res.json({ isNotForm: true });
      }
    }
    elementApi.signal();
  });
  engine.resume({
    listener,
    variables: {
      isNotAprroved: true,
    },
  });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı..`);
});
