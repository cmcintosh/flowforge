import type { NodeHandler } from '../registry.js';

export const webhookTriggerNode: NodeHandler = {
  definition: {
    type: 'webhookTrigger',
    displayName: 'Webhook',
    description: 'Triggers the workflow when a webhook is received',
    group: 'trigger',
    inputs: [],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'httpMethod', displayName: 'HTTP Method', type: 'select', default: 'POST',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'DELETE', value: 'DELETE' },
        ],
        required: true,
      },
      { name: 'path', displayName: 'Path', description: 'Custom path segment (optional)', type: 'string', placeholder: 'my-webhook' },
      { name: 'responseMode', displayName: 'Response Mode', type: 'select', default: 'immediate',
        options: [
          { label: 'Immediate (200 OK)', value: 'immediate' },
          { label: 'Using Respond Node', value: 'responseNode' },
        ],
      },
    ],
  },

  async execute(ctx) {
    // Webhook trigger passes through the webhook data
    // The triggerData is already in the input items
    return ctx.input;
  },
};
