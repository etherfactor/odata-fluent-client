# @ethergizmos/odata-fluent-client

This library provides a fluent and strongly-typed approach for interacting with OData APIs. It supports key OData operations like CRUD (Create, Read, Update, Delete), navigation, actions, functions, and more, with a focus on type-safety and query composition, via immutable query chaining.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
    - [Minimal Example](#minimal-example)
    - [Define Your Models](#define-your-models)
    - [Create the OData Client](#create-the-odata-client)
    - [Working with Entity Sets](#working-with-entity-sets)
    - [Working with Navigation Properties](#working-with-navigation-properties)
    - [Working with Actions and Functions](#working-with-actions-and-functions)
    - [Binding Navigations, Actions, and Functions](#binding-navigations-actions-and-functions)
- [Query Options](#query-options)
    - [Utilizing Query Options](#utilizing-query-options)
- [Supported Operations](#supported-operations)
    - [Entity Sets](#entity-sets)
    - [Navigation Properties](#navigation-properties)

## Features

- **Entity Set Operations**: Provides fluent methods for working with OData entity sets, including reading, creating, updating, and deleting entities.
- **Navigation Properties**: Supports adding and removing items in navigation properties, with both single and collection-based navigations.
- **Actions & Functions**: Allows the execution of OData actions and functions with support for method types, request bodies, and collection responses.
- **Query Composition**: Supports query options such as `$filter`, `$expand`, `$select`, `$top`, `$skip`, `$orderby`, and `$count`.
- **Type-Safe Operations**: All operations are strongly typed, ensuring safety and consistency throughout the interaction.

## Installation

To install the library, run:

```bash
npm i @ethergizmos/odata-fluent-client --save
```

## Usage

### Minimal Example

```ts
import { ODataClient, createOperatorFactory } from "@ethergizmos/odata-fluent-client";

const client = new ODataClient({
  serviceUrl: "https://localhost/odata",
  routingType: "parentheses",
  http: {}
});
const o = createOperatorFactory();

const widgets = client
  .entitySet<Widget>("widgets")
  .withKey("id")
  .withKeyType(o.int)
  .withRead("GET")
  .build();

const all = await widgets
  .set
  .top(3)
  .execute()
  .data;

console.log(all);
```

### Define Your Models

Define the models you will work with. For example:

```ts
interface Model {
  id: number;
  name: string;
  models: SubModel[];
}

interface SubModel {
  id: string;
  name: string;
}
```

### Create the OData Client

Initialize the OData client:

```ts
import { ODataClient } from "@ethergizmos/odata-fluent-client";

const client = new ODataClient({
  serviceUrl: "https://localhost/odata",
  routingType: "parentheses",
  http: {
    headers: {
      "X-Api-Key": "My-Api-Key"
    },
    adapter: undefined //Can optionally provide an HttpClientAdapter implementation
  }
});
```

The library also includes a mock OData client, `MockODataClient`. Almost all functionality is supported, and it acts against in-memory entities. This is not intended for any production use, but it is intended for unit testing of services that rely on OData components or mock interfaces.

```ts
import { MockODataClient } from "@ethergizmos/odata-fluent-client";

let modelId = 0;
const modelData: Record<string, Model> = {};

const client = new MockODataClient({
  entitySets: {
    models: {
      data: () => modelData,
      id: "id",
      idGenerator: () => ++modelId,
    },
  },
  actions: {
    testAction: {
      handler(_, parameters) {
        return { result: true };
      },
    },
  },
  functions: {
    testFunction: {
      entitySet: "models",
      handler(entityKey, parameters) {
        return { result: true };
      },
    },
  },
})
```

In addition to creating a client, you will also need to create an operator factory. This is required to convert values from JavaScript to their OData equivalents. For example, `o.str` wraps the provided string in single quotes. An operator factory can be created by calling the following:

```ts
import { createOperatorFactory } from "@ethergizmos/odata-fluent-client";

const o = createOperatorFactory();

//If desired, you can override or add new operators:
const o = createOperatorFactory({
  date: value => new LuxonDateValue(value),
})
```

Note that you will need to extend the `Value` class to add custom operators.

### Working with Entity Sets

Construct an entity set matching that of one in your OData service:

```ts
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
  .entitySet<SubModel>("subModels")
  .withKey("id")
  .withKeyType(o.str)
  .withReadSet("GET")
  .withRead("GET")
  .withCreate("POST")
  .withUpdate("PATCH")
  .withDelete("DELETE")
  .build();

//Of note, if the entity has multiple keys, specify them in an array: ["id1", "id2"].
//The key type will also need to be specified in an array: [o.int, o.int].
const iAmComposites = client
  .entitySet<IAmComposite>("iAmComposites")
  .withKey(["id1", "id2"])
  .withKeyType([o.int, o.int])
  .withReadSet("GET")
  .withRead("GET")
  .withCreate("POST")
  .withUpdate("PATCH")
  .withDelete("DELETE")
  .build();
```

Once you have an entity set client, you can perform CRUD operations against the entity set:

```ts
const setTop = await models
  .set
  .top(5)
  .execute()
  .data;

const getOne = await models
  .get(1)
  .execute()
  .data;

const createOne = await models
  .create({ name: "New Model" })
  .execute()
  .data;

const updateOne = await models
  .update(1, { name: "Updated Model" })
  .execute()
  .data;

const deleteOne = await models
  .delete(1)
  .execute()
  .result;
```

Why the `data`? This library supports retrieving the full response set via the `data` property, as well as via an async iterable in the `iterator` property. For example, the following will retrieve entities from the OData service as soon as they are returned to the client (but before all entities are returned):

```ts
const iterator = models
  .set
  .top(5)
  .execute()
  .iterator;

for await (const entity of iterator) {
  //Do something with the entity
}
```

In addition, every response contains a `result` property, which is a `Promise<boolean>`, returning `true` if the request succeeded and `false` otherwise. While other properties may throw an error when awaited, this property will always return a value.

Single responses:

| Property | Type                 | Description                                        |
|----------|----------------------|----------------------------------------------------|
| `data`   | `Promise<T>`         | Waits for the result before resolving              |
| `result` | `Promise<boolean>`   | `true` if the request succeeded, `false` otherwise |

Collection responses:

| Property   | Type               | Description                                        |
|------------|--------------------|----------------------------------------------------|
| `data`     | `Promise<T[]>`     | Waits for all results before resolving             |
| `iterator` | `AsyncIterator<T>` | Yields items as they are returned                  |
| `result`   | `Promise<boolean>` | `true` if the request succeeded, `false` otherwise |

### Working with Navigation Properties

Construct a navigation property client matching that of one in your OData service:

```ts
const modelSubModels = client
  .navigation(models, "models")
  .withCollection()
  .withReference(subModels)
  .withAdd("POST")
  .withRemove("DELETE")
  .build();
```

To create a navigation client, you need to first create entity set clients for both entity sets in the relationship.

Once you have a navigation client, you can create or delete relations between those entities:

```ts
await modelSubModels
  .add(1, "1")
  .execute()
  .result;

await modelSubModels
  .remove(1, "1")
  .execute()
  .result;
```

For single navigation properties, the methods `set` and `unset` will be available in place of `add` and `remove`.

### Working with Actions and Functions

You can also bind to actions and functions exposed on the OData service:

```ts
const testAction = client
  .action("testAction")
  .withMethod("POST")
  .withBody<{ value: string }>()
  .withCollectionResponse<{ result: boolean }>()
  .build();
```

Actions and functions can also be bound to entity sets, which will require an entity id to invoke:

```ts
const testFunction = client
  .function(models, "testFunction")
  .withMethod("GET")
  .withParameters<{ value: string }>({ value: o.str })
  .withSingleResponse<{ result: boolean }>()
  .build();
```

Once created, actions and functions can be invoked similar to the previous clients:

```ts
const actionResult = await testAction
  .invoke({ value: "hello" })
  .execute()
  .data;

const functionResult = await testFunction
  .invoke(1, { value: "goodbye" })
  .execute()
  .data;
```

### Binding Navigations, Actions, and Functions

Once created, navigations, actions, and functions can be bound to entity sets. This enables accessing the navigations, actions, and functions through the entity set, as opposed to using separate objects. This can be accomplished via the following:

```ts
const modelsNav = client
  .bind
  .navigation(models, { models: modelSubModels });

const modelsNavFunc = client
  .bind
  .function(modelsNav, { testFunction: testFunction });

const functionResult = await modelsNavFunc
  .functions
  .testFunction
  .invoke(1, { value: "goodbye" })
  .execute()
  .data;
```

Of note, navigations, actions, and functions must be appended individually, through three separate calls.

## Query Options

The following query options are supported:
- `$filter`
    - Filters the returned entities
- `$expand`
    - Expands a navigation property on the entity
- `$select`
    - Selects certain properties on an entity to return just those
- `$orderby`
    - Sorts the returned entities
- `$top`
    - Returns up to the specified number of entities
- `$skip`
    - Skips over the specified number of entities before returning any
- `$count`
    - Counts the total number of entities matching the filter

Of note, `$apply` is currently not supported due to its complexity.

### Utilizing Query Options

With the exception of navigation and deletion responses, all responses are compatible with query options. For single object responses, only `$select` and `$expand` are available. For collection responses, all of the above query options are supported. These can be invoked fluently, similar to the below:

```ts
const results = models
  .set
  .filter(e =>
    o.startsWith(
      e.prop("name"),
      o.string("Test")
    )
  )
  .skip(1)
  .top(10)
  .expand("models", ex => ex.top(5))
  .execute()
  .data;
```

The above would find entities from the `models` entity set whose name starts with 'Test', skipping the first result and returning results 2 through 11. For each model, the first 5 associated `subModels` will be included in the response.

Query option chains are immutable, so you can store any step into a variable and continue it with as many variations as desired:

```ts
const startsWithTest = models
  .set
  .filter(e =>
    o.startsWith(
      e.prop("name"),
      o.string("Test")
    )
  );

const alsoIdIsLessThan10 = startsWithTest
  .filter(e =>
    o.le(
      o.prop("id"),
      o.int(10)
    )
  );

const alsoIdIsGreaterThan10 = startsWithTest
  .filter(e =>
    o.gt(
      o.prop("id"),
      o.int(10)
    )
  );

const results1 = await alsoIdIsLessThan10
  .execute()
  .data;

const results2 = await alsoIdIsGreaterThan10
  .execute()
  .data;
```

The first result set will find `models` whose name starts with 'Test', with an id <= 10. The second result set will find `models` whose name starts with 'Test', with an id > 10.

## Supported Operations

### Entity Sets

- `set`
    - Access the entity set directly
- `get(id)`
    - Retrieves a single entity
- `create(data)`
    - Creates a new entity
- `update(id, data)`
    - Updates an existing entity
- `delete(id)`
    - Deletes an existing entity

### Navigation Properties

- `add(fromId, toId)`
    - For one-to-many navigations, adds an entity
- `remove(fromId, toId)`
    - For one-to-many navigations, removes an entity
- `set(fromId, toId)`
    - For one-to-one navigations, sets the entity
- `unset(fromId, toId)`
    - For one-to-one navigations, unsets the entity

## License

This project is licensed under the **MIT License**.
