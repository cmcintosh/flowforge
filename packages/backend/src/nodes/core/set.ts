import type { NodeHandler } from '../registry.js';

export const setNode: NodeHandler = {
  definition: {
    type: 'set',
    displayName: 'Set',
    description: 'Set or modify fields on items',
    group: 'transform',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'assignments', displayName: 'Assignments', description: 'JSON object of key-value pairs to set', type: 'json', required: true, default: {} },
      { name: 'mode', displayName: 'Mode', type: 'select', default: 'merge',
        options: [
          { label: 'Merge with existing', value: 'merge' },
          { label: 'Replace all', value: 'replace' },
        ],
      },
    ],
  },

  async execute(ctx) {
    const { assignments = {}, mode = 'merge' } = ctx.parameters as {
      assignments: Record<string, unknown>; mode?: 'merge' | 'replace';
    };

    return ctx.input.map(item => {
      if (mode === 'replace') {
        return { json: { ...assignments } };
      }
      return { json: { ...item.json, ...assignments } };
    });
  },
};
