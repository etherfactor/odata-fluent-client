import { ODataClient, ODataClientOptions } from "./core/client/odata-client";
import { createOperatorFactory } from "./values/base";

interface Model {
  id: number;
  name: string;
  models: SubModel[];
}

interface SubModel {
  id: string;
  name: string;
}

const o = createOperatorFactory();

const client = new ODataClient({} as ODataClientOptions);

const models = client
  .entitySet<Model>("models")
  .withKey("id")
  .withKeyType(o.int)
  .withReadSet("GET")
  .withRead("GET")
  .withCreate("POST")
  .withUpdate("PATCH")
  .withDelete("DELETE")
  .build();

const subModels = client
  .entitySet<SubModel>("models")
  .withKey("id")
  .withKeyType(o.string)
  .withReadSet("GET")
  .withRead("GET")
  .withCreate("POST")
  .withUpdate("PATCH")
  .withDelete("DELETE")
  .build();

const modelSubmodels = client.navigation(models, "models")
  .withCollection()
  .withReference(subModels)
  .withAdd("POST")
  .withRemove("DELETE")
  .build();

modelSubmodels.add(1, "a");

const newModels = client.bind.navigation(models, { models: modelSubmodels });

newModels.navigations.models.add(1, "a");

const test1Action = client.action("test1")
  .withMethod("POST")
  .withBody<{ value: string }>()
  .withReturnType<{ result: boolean }>()
  .build();

const test2Action = client.action(models, "test2")
  .withMethod("POST")
  .withBody<{ value: string }>()
  .withReturnType<{ result: boolean }>()
  .build();

const moreNewModels = client.bind.action(newModels, { test2: test2Action });

// const newModels = models
//   .navigations
//   .add("models")
//   .withCollection()
//   .withReference(subModels)
//   .withAdd("POST")
//   .withRemove("DELETE")
//   .build();

// const a = newModels.create({
//   name: "test"
// });

// newModels.navigations.models.add(1, "a");
