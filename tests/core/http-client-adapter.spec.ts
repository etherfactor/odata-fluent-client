import { DefaultHttpClientAdapter, HttpRequestData } from "../../src/core/http-client-adapter";

describe('DefaultHttpClientAdapter', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call fetch with the proper URL and options and handle streaming response', async () => {
    //Create a fake response to simulate streaming data
    const encoder = new TextEncoder();
    const fakeReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ done: false, value: encoder.encode('hel') })
        .mockResolvedValueOnce({ done: true, value: encoder.encode('lo') }),
    };

    const fakeResponse = {
      status: 200,
      body: {
        getReader: () => fakeReader,
      },
    };

    //Configure the fetch mock to return the fakeResponse
    (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

    //Define the HTTP request configuration
    const config: HttpRequestData = {
      method: 'GET',
      url: 'http://example.com/api',
      headers: { 'custom-header': 'test' },
      query: { q: 'test' },
    };

    //Invoke the adapter
    const response = await DefaultHttpClientAdapter.invoke(config);

    //Verify fetch was called with the correct URL (including query parameters)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://example.com/api?q=test',
      expect.objectContaining({
        method: 'GET',
        headers: { 'custom-header': 'test' },
      })
    );
    
    //Check that the status is as expected
    expect(response.status).toBe(200);

    //Consume the async iterable returned in data
    let collectedData = '';
    if (response.data instanceof Promise) {
      collectedData += await response.data;
    } else {
      for await (const chunk of response.data) {
        collectedData += chunk;
      }
    }

    expect(collectedData).toBe('hello');
  });

  it('should add content-type header and stringify body on POST requests', async () => {
    const fakeReader = {
      read: jest.fn().mockResolvedValue({ done: true, value: new Uint8Array() }),
    };

    const fakeResponse = {
      status: 201,
      body: {
        getReader: () => fakeReader,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

    const config: HttpRequestData = {
      method: 'POST',
      url: 'http://example.com/api',
      headers: { 'custom-header': 'value' },
      query: {},
      body: { key: 'value' },
    };

    const response = await DefaultHttpClientAdapter.invoke(config);

    //Verify that fetch was called with the appropriate options for a POST
    expect(global.fetch).toHaveBeenCalledWith(
      'http://example.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'custom-header': 'value',
          'content-type': 'application/json',
        }),
        body: JSON.stringify({ key: 'value' }),
      })
    );

    expect(response.status).toBe(201);
  });

  it('should fall back to empty iterable if no body is returned', async () => {
    const fakeResponse = {
      status: 200,
      body: undefined,
    };

    //Configure the fetch mock to return the fakeResponse
    (global.fetch as jest.Mock).mockResolvedValue(fakeResponse);

    //Define the HTTP request configuration
    const config: HttpRequestData = {
      method: 'GET',
      url: 'http://example.com/api',
      headers: { 'custom-header': 'test' },
      query: { q: 'test' },
    };

    //Invoke the adapter
    const response = await DefaultHttpClientAdapter.invoke(config);

    //Check that the status is as expected
    expect(response.status).toBe(200);

    //Consume the async iterable returned in data
    let collectedData = '';
    if (response.data instanceof Promise) {
      collectedData += await response.data;
    } else {
      for await (const chunk of response.data) {
        collectedData += chunk;
      }
    }

    expect(collectedData).toBe('');
  });
});
