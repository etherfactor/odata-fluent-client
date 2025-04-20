# @ethergizmos/odata-fluent-client

This library provides a fluent and strongly-typed approach for interacting with OData APIs. It supports key OData operations like CRUD (Create, Read, Update, Delete), navigation, actions, functions, and more, with a focus on type-safety and query composition.

## Features

- **Entity Set Operations**: Provides fluent methods for working with OData entity sets, including reading, creating, updating, and deleting entities.
- **Navigation Properties**: Supports adding and removing items in navigation properties, with both single and collection-based navigations.
- **Actions & Functions**: Allows the execution of OData actions and functions with support for method types, request bodies, and collection responses.
- **Query Composition**: Supports query options such as `$filter`, `$expand`, `$select`, `$top`, `$skip`, and `$orderby`.
- **Type-Safe Operations**: All operations are strongly typed, ensuring safety and consistency throughout the interaction.

## Installation

To install the library, run:

```bash
npm i @ethergizmos/odata-fluent-client --save
```

## Basic Usage

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
import { createOperatorFactory, ODataClient } from "@ethergizmos/odata-fluent-client";

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

//We will cover this in more detail later
const o = createOperatorFactory();
```

The library also includes a mock OData client, `MockODataClient`. Almost all functionality is supported, and it acts against in-memory entities. This is not intended for any production use, but it is intended for unit testing of services that rely on OData components or mock interfaces.

## Working with Entity Sets

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
```

Once you have an entity set client, you can perform CRUD operations against the entity set:

```ts
const setTop = await models.set.top(5).execute().data;

const getOne = await models.get(1).execute().data;

const createOne = await models.create({ name: "Test" }).execute().data;

const updateOne = await models.update(1, { name: "New Name" }).execute().data;

const deleteOne = await models.delete(1).execute().result;
```

Why the `data`? This library supports retrieving the full response set via the `data` property, as well as via an async iterable in the `iterator` property. For example, the following will retrieve entities from the OData service as soon as they are returned to the client (but before all entities are returned):

```ts
const iterator = models.set.top(5).execute().iterator;
for await (const entity of iterator) {
  //Do something with the entity
}
```

In addition, every response contains a `result` property, which is a `Promise<boolean>`, returning `true` if the request succeeded and `false` otherwise. While other properties may throw an error when awaited, this property will always return a value.

## Working with Navigation Properties

TBD

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

## Navigation Properties

- `add(fromId, toId)`
    - For one-to-many navigations, adds an entity
- `remove(fromId, toId)`
    - For one-to-many navigations, removes an entity
- `set(fromId, toId)`
    - For one-to-one navigations, sets the entity
- `unset(fromId, toId)`
    - For one-to-one navigations, unsets the entity
