import { EntitySetClient } from "../../../src";
import { ActionImpl, ActionImplOptions, EntityActionImpl, EntityActionImplOptions } from "../../../src/core/action/action.impl";
import { EntitySetImpl } from "../../../src/core/entity/set/entity-set";
import { EntitySingleImpl } from "../../../src/core/entity/single/entity-single";
import { extendUrl } from "../../../src/utils/http";
import { SafeAny } from "../../../src/utils/types";

describe("ActionImpl", () => {
  describe("with isBody = true", () => {
    let options: ActionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "action",
        method: "POST",
        isBody: true,
        isCollection: false,
        // no "values" mapping because we are using a body
      };
    });

    it("should use getBody returning the parameters when no converter is provided", () => {
      const action = new ActionImpl(options);
      const input = { key: "value" };
      // invoke returns an EntitySingle (since isCollection is false)
      const result = action.invoke(input);
      // In our dummy single worker, payload should equal the input directly.
      expect((result as SafeAny).worker.options.payload).toEqual(input);
      // Since getQuery returns undefined, the URL should be just the extended URL.
      expect((result as SafeAny).worker.options.url).toBe(extendUrl("http://localhost", "action"));
      expect((result as SafeAny).worker.options.method).toBe("POST");
    });

    it("should use the converter function when provided", () => {
      options.converter = (params: any) => ({ converted: params.key });
      const action = new ActionImpl(options);
      const input = { key: "value" };
      const result = action.invoke(input);
      expect((result as SafeAny).worker.options.payload).toEqual({ converted: "value" });
    });
  });

  describe("with isBody = false (using query parameters)", () => {
    let options: ActionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "action",
        method: "GET",
        isBody: false,
        isCollection: false,
        // When using parameters, a values mapping is required.
      };
    });

    it("should throw an error if values mapping is not provided", () => {
      const action = new ActionImpl(options);
      expect(() => action.invoke({ a: "test" })).toThrow(
        "Must specify a value converter when calling .withParameters"
      );
    });

    it("should construct the query string properly when values mapping is provided", () => {
      options.values = {
        a: (val: any) => val, // identity conversion
      };
      const action = new ActionImpl(options);
      const input = { a: "test value" };
      const result = action.invoke(input);
      // For isBody false, payload should be undefined.
      expect((result as SafeAny).worker.options.payload).toBeUndefined();
      // The query string is built by mapping each key.
      const expectedQuery = "a=" + encodeURIComponent("test value");
      const expectedUrl = extendUrl("http://localhost", "action") + "?" + expectedQuery;
      expect((result as SafeAny).worker.options.url).toBe(expectedUrl);
    });
  });

  describe("handling collection flag", () => {
    it("should return an EntitySetImpl when isCollection is true", () => {
      const options: ActionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "collectionAction",
        method: "GET",
        isBody: true,
        isCollection: true,
      };
      const action = new ActionImpl(options);
      const input = { any: "data" };
      const result = action.invoke(input);
      expect(result).toBeInstanceOf(EntitySetImpl);
    });

    it("should return an EntitySingleImpl when isCollection is false", () => {
      const options: ActionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "singleAction",
        method: "GET",
        isBody: true,
        isCollection: false,
      };
      const action = new ActionImpl(options);
      const input = { any: "data" };
      const result = action.invoke(input);
      expect(result).toBeInstanceOf(EntitySingleImpl);
    });
  });
});

// ------------------------------------------------------------------------------
// Tests for EntityActionImpl
// ------------------------------------------------------------------------------
describe("EntityActionImpl", () => {
  // We'll need a dummy entitySet that provides a buildUrl(key) method.
  let dummyEntitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  beforeEach(() => {
    dummyEntitySet = {
      buildUrl: jest.fn().mockImplementation((key: any) => `http://localhost/entity/${key}`),
    } as SafeAny;
  });

  describe("with isBody = true", () => {
    let options: EntityActionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "action",
        method: "POST",
        isBody: true,
        isCollection: false,
        entitySet: dummyEntitySet,
      };
    });

    it("should use getBody to set payload when no converter is provided", () => {
      const entityAction = new EntityActionImpl(options);
      const input = { key: "value" };
      const result = entityAction.invoke(1, input);
      // buildUrl should have been called with key 1.
      expect(dummyEntitySet.buildUrl).toHaveBeenCalledWith(1);
      expect((result as SafeAny).worker.options.payload).toEqual(input);
      // The URL is built by first calling buildUrl and then extendUrl.
      const entityUrl = dummyEntitySet.buildUrl(1);
      expect((result as SafeAny).worker.options.url).toBe(extendUrl(entityUrl, "action"));
    });

    it("should use the converter function when provided", () => {
      options.converter = (params: any) => ({ converted: params.key });
      const entityAction = new EntityActionImpl(options);
      const input = { key: "value" };
      const result = entityAction.invoke(1, input);
      expect((result as SafeAny).worker.options.payload).toEqual({ converted: "value" });
    });
  });

  describe("with isBody = false (using query parameters)", () => {
    let options: EntityActionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "action",
        method: "GET",
        isBody: false,
        isCollection: false,
        entitySet: dummyEntitySet,
      };
    });

    it("should throw an error if values mapping is not provided", () => {
      const entityAction = new EntityActionImpl(options);
      expect(() => entityAction.invoke(1, { a: "test" })).toThrow(
        "Must specify a value converter when calling .withParameters"
      );
    });

    it("should construct the query string properly when values mapping is provided", () => {
      options.values = {
        a: (val: any) => val,
      };
      const entityAction = new EntityActionImpl(options);
      const input = { a: "test value" };
      const result = entityAction.invoke(1, input);
      expect((result as SafeAny).worker.options.payload).toBeUndefined();
      const expectedQuery = "a=" + encodeURIComponent("test value");
      const entityUrl = dummyEntitySet.buildUrl(1);
      const expectedUrl = extendUrl(entityUrl, "action") + "?" + expectedQuery;
      expect((result as SafeAny).worker.options.url).toBe(expectedUrl);
    });
  });

  describe("handling collection flag", () => {
    it("should return an EntitySetImpl when isCollection is true", () => {
      const options: EntityActionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "collectionAction",
        method: "GET",
        isBody: true,
        isCollection: true,
        entitySet: dummyEntitySet,
      };
      const entityAction = new EntityActionImpl(options);
      const input = { any: "data" };
      const result = entityAction.invoke(1, input);
      expect(result).toBeInstanceOf(EntitySetImpl);
    });

    it("should return an EntitySingleImpl when isCollection is false", () => {
      const options: EntityActionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "singleAction",
        method: "GET",
        isBody: true,
        isCollection: false,
        entitySet: dummyEntitySet,
      };
      const entityAction = new EntityActionImpl(options);
      const input = { any: "data" };
      const result = entityAction.invoke(1, input);
      expect(result).toBeInstanceOf(EntitySingleImpl);
    });
  });
});
