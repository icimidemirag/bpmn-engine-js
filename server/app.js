const express = require("express");
const cors = require("cors")
const mongoose = require('mongoose');
const { Engine } = require("bpmn-engine");
const { EventEmitter } = require("events");
const fs = require("fs");
const State = require("./models/State");

const app = express();
app.use(cors());
app.use(express.json());

var state = null;

//Connect DB
mongoose.connect('mongodb://localhost/onay-db').then(() => {
    console.log("DB connected successfully");
});

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
  // if(state){
  //   return res.json({started: true});
  // }
  const engine = new Engine({
    name: "onay example 1",
    source: fs.readFileSync("./onay.bpmn"),
    moddleOptions: {
      camunda: require("camunda-bpmn-moddle/resources/camunda.json"),
    },
    extensions: {
      camunda: camundaExt,
    },
  });

  const listener = new EventEmitter();

  listener.on("wait", async (api, deneme) => {
    state = deneme.getState();
    // console.log(state);
    await State.create(state);
    res.json({started: true, state: state});
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

  console.log(state);

  const engine = new Engine({
    name: "onay example 1",
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
  engine.on("end", async (elementApi,engineApi) => {
    await State.findOneAndDelete({name: state.name});
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

app.get("/getNumber", async (req, res) => {
  state = await State.findOne({ name: "onay example 1" });
  if (state === null) {
    return res.json({started: false});
  }

  console.log(state);

  const engine = new Engine({
    name: "onay example 1",
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
  await State.findOneAndUpdate({ name: "onay example 1" }, state);
});

app.post("/sendNumber", async (req, res) => {
  state = await State.findOne({ name: "onay example 1" });
  if (state === null) {
    return res.json({started: false});
  }

  console.log(state);

  const engine = new Engine({
    name: "onay example 1",
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
  await State.findOneAndUpdate({ name: "onay example 1" }, state);
});

app.post("/approval",  async(req, res) => {
  if (state === null) {
    return res.json({started: false});
  }

  console.log(state);

  const engine = new Engine({
    name: "onay example 1",
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
  await State.findOneAndUpdate({ name: "onay example 1" }, state);
});

const port = 4000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı..`);
});
