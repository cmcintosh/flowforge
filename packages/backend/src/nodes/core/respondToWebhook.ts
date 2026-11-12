import type { NodeHandler } from '../registry.js';

export const respondToWebhookNode: NodeHandler = {
  definition: {
    type: 'respondToWebhook',
    displayName: 'Respond to Webhook',
    description: 'Send an HTTP response back to the webhook caller',
    group: 'output',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [],
    properties: [
      { name: 'statusCode', displayName: 'Status Code', type: 'number', default: 200 },
      { name: 'headers', displayName: 'Headers', type: 'json', default: { 'Content-Type': 'application/json' } },
      { name: 'body', displayName: 'Response Body', description: 'JSON body to return', type: 'json', default: {} },
    ],
  },

  async execute(ctx) {
    const { statusCode = 200, headers = {}, body = {} } = ctx.parameters as {
      statusCode: number; headers?: Record<string, string>; body?: unknown;
    };

    // Return the response data — the webhook handler picks this up
    return [{
      json: {
        statusCode,
        headers,
        body,
      },
    }];
  },
};
