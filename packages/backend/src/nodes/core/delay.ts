import type { NodeHandler } from '../registry.js';

export const delayNode: NodeHandler = {
  definition: {
    type: 'delay',
    displayName: 'Delay',
    description: 'Pause execution for a duration',
    group: 'flow',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'duration', displayName: 'Duration', type: 'number', required: true, default: 1000, placeholder: '1000' },
      { name: 'unit', displayName: 'Unit', type: 'select', default: 'milliseconds',
        options: [
          { label: 'Milliseconds', value: 'milliseconds' },
          { label: 'Seconds', value: 'seconds' },
          { label: 'Minutes', value: 'minutes' },
        ],
      },
    ],
  },

  async execute(ctx) {
    const { duration = 1000, unit = 'milliseconds' } = ctx.parameters as {
      duration: number; unit: string;
    };

    let ms = duration;
    if (unit === 'seconds') ms = duration * 1000;
    if (unit === 'minutes') ms = duration * 60 * 1000;

    await new Promise(resolve => setTimeout(resolve, ms));

    return ctx.input;
  },
};
