import { buildUrl, extendUrl, extractBaseUrl } from "../../src/utils/http";

describe('buildUrl', () => {
  it('should create url from base url', () => {
    const baseUrl = "https://localhost:9000";
    const relUrl = "some/resource";

    const url = buildUrl(baseUrl, relUrl);

    expect(url).toBe("https://localhost:9000/some/resource");
  });

  it('should create url from full url', () => {
    const baseUrl = "https://localhost:9000/another/resource";
    const relUrl = "some/resource";

    const url = buildUrl(baseUrl, relUrl);

    expect(url).toBe("https://localhost:9000/some/resource");
  })
});

describe('extractBaseUrl', () => {
  it('should extract the base url from resource', () => {
    const url = "https://localhost:9000/some/resource";

    const baseUrl = extractBaseUrl(url);

    expect(baseUrl).toBe("https://localhost:9000");
  });

  it('should extract the base url from base', () => {
    const url = "https://localhost:9000";

    const baseUrl = extractBaseUrl(url);

    expect(baseUrl).toBe(url);
  });
});

describe('extendUrl', () => {
  it('should extend a base url', () => {
    const initUrl = "https://localhost:9000";
    const addUrl = "some/path";

    const url = extendUrl(initUrl, addUrl);

    expect(url).toBe("https://localhost:9000/some/path");
  });

  it('should extend a url with path', () => {
    const initUrl = "https://localhost:9000/some/path";
    const addUrl = "new/path";

    const url = extendUrl(initUrl, addUrl);

    expect(url).toBe("https://localhost:9000/some/path/new/path");
  });
});
