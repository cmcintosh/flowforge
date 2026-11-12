import type { NodeHandler } from '../registry.js';

export const httpRequestNode: NodeHandler = {
  definition: {
    type: 'httpRequest',
    displayName: 'HTTP Request',
    description: 'Make an HTTP request to a URL',
    group: 'action',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'method', displayName: 'Method', type: 'select', default: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'DELETE', value: 'DELETE' },
        ],
        required: true,
      },
      { name: 'url', displayName: 'URL', description: 'The URL to request', type: 'string', required: true, placeholder: 'https://api.example.com/data' },
      { name: 'headers', displayName: 'Headers', description: 'JSON object of headers', type: 'json', default: {} },
      { name: 'body', displayName: 'Body', description: 'Request body (JSON)', type: 'json', default: {} },
      { name: 'timeout', displayName: 'Timeout (ms)', type: 'number', default: 30000 },
    ],
    credentials: [
      { name: 'httpBasicAuth', displayName: 'Basic Auth', type: 'httpBasicAuth', required: false },
      { name: 'httpBearerAuth', displayName: 'Bearer Token', type: 'httpBearerAuth', required: false },
    ],
  },

  async execute(ctx) {
    const { method, url, headers = {}, body = {}, timeout = 30000 } = ctx.parameters as {
      method: string; url: string; headers?: Record<string, string>; body?: unknown; timeout?: number;
    };

    // Merge auth headers
    const finalHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
    if (ctx.credentials.httpBasicAuth) {
      const { username, password } = ctx.credentials.httpBasicAuth as { username: string; password: string };
      finalHeaders['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }
    if (ctx.credentials.httpBearerAuth) {
      const { token } = ctx.credentials.httpBearerAuth as { token: string };
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Process URL/body templates with input data
    const processedUrl = interpolateTemplate(url, ctx.input[0]?.json || {});
    const processedBody = body ? JSON.parse(interpolateTemplate(JSON.stringify(body), ctx.input[0]?.json || {})) : undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout as number);

    try {
      const response = await fetch(processedUrl, {
        method,
        headers: finalHeaders,
        body: method !== 'GET' && processedBody ? JSON.stringify(processedBody) : undefined,
        signal: controller.signal,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });

      const contentType = response.headers.get('content-type') || '';
      let responseBody: unknown;
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      return [{
        json: {
          statusCode: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
        },
      }];
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

function interpolateTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = path.trim().split('.').reduce((obj: any, key: string) => obj?.[key], data);
    return value !== undefined ? String(value) : `{{${path}}}`;
  });
}
