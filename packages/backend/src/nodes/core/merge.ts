import type { NodeHandler } from '../registry.js';

export const mergeNode: NodeHandler = {
  definition: {
    type: 'merge',
    displayName: 'Merge',
    description: 'Combine data from multiple branches',
    group: 'flow',
    inputs: [
      { name: 'input_0', displayName: 'Input 1', type: 'main', multiple: true },
      { name: 'input_1', displayName: 'Input 2', type: 'main', multiple: true },
    ],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'mode', displayName: 'Merge Mode', type: 'select', default: 'append',
        options: [
          { label: 'Append', value: 'append' },
          { label: 'Combine (by index)', value: 'combine' },
        ],
      },
    ],
  },

  async execute(ctx) {
    // For MVP, merge simply concatenates all input items
    // The engine passes all inputs as a flat array
    return ctx.input;
  },
};
