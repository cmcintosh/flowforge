import type { NodeHandler } from '../registry.js';
import cron from 'node-cron';

export const cronTriggerNode: NodeHandler = {
  definition: {
    type: 'cronTrigger',
    displayName: 'Cron',
    description: 'Triggers the workflow on a schedule',
    group: 'trigger',
    inputs: [],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'expression', displayName: 'Cron Expression', description: 'Standard cron expression', type: 'string', required: true, default: '0 * * * *', placeholder: '0 * * * * (every hour)' },
      { name: 'timezone', displayName: 'Timezone', type: 'string', default: 'UTC', placeholder: 'America/Chicago' },
    ],
  },

  async execute(_ctx) {
    // Cron trigger outputs the current timestamp
    return [{
      json: {
        timestamp: new Date().toISOString(),
        triggeredBy: 'cron',
      },
    }];
  },
};
