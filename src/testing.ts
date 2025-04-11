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

const modelSubmodels = client
  .navigation(models, "models")
  .withCollection()
  .withReference(subModels)
  .withAdd("POST")
  .withRemove("DELETE")
  .build();

modelSubmodels.add(1, "a");

const newModels = client.bind.navigation(models, { models: modelSubmodels });

newModels.navigations.models.add(1, "a");

const act1Action = client
  .action("act1")
  .withMethod("POST")
  .withBody<{ value: string }>()
  .withCollectionResponse<{ result: boolean }>()
  .build();

const act2Action = client
  .action(models, "act2")
  .withMethod("POST")
  .withBody<{ value: string }>()
  .withCollectionResponse<{ result: boolean }>()
  .build();

const moreNewModels = client.bind.action(newModels, { act2: act2Action });

const func1Function = client
  .function("func1")
  .withMethod("GET")
  .withParameters<{ value: string }>()
  .withCollectionResponse<{ result: boolean }>()
  .build();

const func2Function = client
  .function(models, "func2")
  .withMethod("GET")
  .withParameters<{ value: string }>()
  .withCollectionResponse<{ result: boolean }>()
  .build();

const evenMoreNewModels = client.bind.function(moreNewModels, { func2: func2Function });

evenMoreNewModels.actions
  .act2.invoke(1, { value: "a" })
  .filter(e =>
    o.eq(
      e.prop("result"),
      o.bool(true)
    )
  );

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
