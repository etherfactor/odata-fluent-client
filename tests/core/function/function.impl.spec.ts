import { EntitySetClient } from "../../../src";
import { EntitySetImpl } from "../../../src/core/entity/set/entity-set";
import { EntitySingleImpl } from "../../../src/core/entity/single/entity-single";
import { EntityFunctionImpl, EntityFunctionImplOptions, FunctionImpl, FunctionImplOptions } from "../../../src/core/function/function.impl";
import { extendUrl } from "../../../src/utils/http";
import { SafeAny } from "../../../src/utils/types";

describe("FunctionImpl", () => {
  describe("with isBody = true", () => {
    let options: FunctionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "Function",
        method: "POST",
        isBody: true,
        isCollection: false,
        // no "values" mapping because we are using a body
      };
    });

    it("should use getBody returning the parameters when no converter is provided", () => {
      const Function = new FunctionImpl(options);
      const input = { key: "value" };
      // invoke returns an EntitySingle (since isCollection is false)
      const result = Function.invoke(input);
      // In our dummy single worker, payload should equal the input directly.
      expect((result as SafeAny).worker.options.payload).toEqual(input);
      // Since getQuery returns undefined, the URL should be just the extended URL.
      expect((result as SafeAny).worker.options.url).toBe(extendUrl("http://localhost", "Function"));
      expect((result as SafeAny).worker.options.method).toBe("POST");
    });

    it("should use the converter function when provided", () => {
      options.converter = (params: any) => ({ converted: params.key });
      const Function = new FunctionImpl(options);
      const input = { key: "value" };
      const result = Function.invoke(input);
      expect((result as SafeAny).worker.options.payload).toEqual({ converted: "value" });
    });
  });

  describe("with isBody = false (using query parameters)", () => {
    let options: FunctionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "Function",
        method: "GET",
        isBody: false,
        isCollection: false,
        // When using parameters, a values mapping is required.
      };
    });

    it("should throw an error if values mapping is not provided", () => {
      const Function = new FunctionImpl(options);
      expect(() => Function.invoke({ a: "test" })).toThrow(
        "Must specify a value converter when calling .withParameters"
      );
    });

    it("should construct the query string properly when values mapping is provided", () => {
      options.values = {
        a: (val: any) => val, // identity conversion
      };
      const Function = new FunctionImpl(options);
      const input = { a: "test value" };
      const result = Function.invoke(input);
      // For isBody false, payload should be undefined.
      expect((result as SafeAny).worker.options.payload).toBeUndefined();
      // The query string is built by mapping each key.
      const expectedQuery = "a=" + encodeURIComponent("test value");
      const expectedUrl = extendUrl("http://localhost", "Function") + "?" + expectedQuery;
      expect((result as SafeAny).worker.options.url).toBe(expectedUrl);
    });
  });

  describe("handling collection flag", () => {
    it("should return an EntitySetImpl when isCollection is true", () => {
      const options: FunctionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "collectionFunction",
        method: "GET",
        isBody: true,
        isCollection: true,
      };
      const Function = new FunctionImpl(options);
      const input = { any: "data" };
      const result = Function.invoke(input);
      expect(result).toBeInstanceOf(EntitySetImpl);
    });

    it("should return an EntitySingleImpl when isCollection is false", () => {
      const options: FunctionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "singleFunction",
        method: "GET",
        isBody: true,
        isCollection: false,
      };
      const Function = new FunctionImpl(options);
      const input = { any: "data" };
      const result = Function.invoke(input);
      expect(result).toBeInstanceOf(EntitySingleImpl);
    });
  });
});

// ------------------------------------------------------------------------------
// Tests for EntityFunctionImpl
// ------------------------------------------------------------------------------
describe("EntityFunctionImpl", () => {
  // We'll need a dummy entitySet that provides a buildUrl(key) method.
  let dummyEntitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  beforeEach(() => {
    dummyEntitySet = {
      buildUrl: jest.fn().mockImplementation((key: any) => `http://localhost/entity/${key}`),
    } as SafeAny;
  });

  describe("with isBody = true", () => {
    let options: EntityFunctionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "Function",
        method: "POST",
        isBody: true,
        isCollection: false,
        entitySet: dummyEntitySet,
      };
    });

    it("should use getBody to set payload when no converter is provided", () => {
      const entityFunction = new EntityFunctionImpl(options);
      const input = { key: "value" };
      const result = entityFunction.invoke(1, input);
      // buildUrl should have been called with key 1.
      expect(dummyEntitySet.buildUrl).toHaveBeenCalledWith(1);
      expect((result as SafeAny).worker.options.payload).toEqual(input);
      // The URL is built by first calling buildUrl and then extendUrl.
      const entityUrl = dummyEntitySet.buildUrl(1);
      expect((result as SafeAny).worker.options.url).toBe(extendUrl(entityUrl, "Function"));
    });

    it("should use the converter function when provided", () => {
      options.converter = (params: any) => ({ converted: params.key });
      const entityFunction = new EntityFunctionImpl(options);
      const input = { key: "value" };
      const result = entityFunction.invoke(1, input);
      expect((result as SafeAny).worker.options.payload).toEqual({ converted: "value" });
    });
  });

  describe("with isBody = false (using query parameters)", () => {
    let options: EntityFunctionImplOptions;
    beforeEach(() => {
      options = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "Function",
        method: "GET",
        isBody: false,
        isCollection: false,
        entitySet: dummyEntitySet,
      };
    });

    it("should throw an error if values mapping is not provided", () => {
      const entityFunction = new EntityFunctionImpl(options);
      expect(() => entityFunction.invoke(1, { a: "test" })).toThrow(
        "Must specify a value converter when calling .withParameters"
      );
    });

    it("should construct the query string properly when values mapping is provided", () => {
      options.values = {
        a: (val: any) => val,
      };
      const entityFunction = new EntityFunctionImpl(options);
      const input = { a: "test value" };
      const result = entityFunction.invoke(1, input);
      expect((result as SafeAny).worker.options.payload).toBeUndefined();
      const expectedQuery = "a=" + encodeURIComponent("test value");
      const entityUrl = dummyEntitySet.buildUrl(1);
      const expectedUrl = extendUrl(entityUrl, "Function") + "?" + expectedQuery;
      expect((result as SafeAny).worker.options.url).toBe(expectedUrl);
    });
  });

  describe("handling collection flag", () => {
    it("should return an EntitySetImpl when isCollection is true", () => {
      const options: EntityFunctionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "collectionFunction",
        method: "GET",
        isBody: true,
        isCollection: true,
        entitySet: dummyEntitySet,
      };
      const entityFunction = new EntityFunctionImpl(options);
      const input = { any: "data" };
      const result = entityFunction.invoke(1, input);
      expect(result).toBeInstanceOf(EntitySetImpl);
    });

    it("should return an EntitySingleImpl when isCollection is false", () => {
      const options: EntityFunctionImplOptions = {
        rootOptions: {
          serviceUrl: "http://localhost",
          routingType: "parentheses",
          http: {},
        },
        name: "singleFunction",
        method: "GET",
        isBody: true,
        isCollection: false,
        entitySet: dummyEntitySet,
      };
      const entityFunction = new EntityFunctionImpl(options);
      const input = { any: "data" };
      const result = entityFunction.invoke(1, input);
      expect(result).toBeInstanceOf(EntitySingleImpl);
    });
  });
});
