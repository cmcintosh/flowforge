import type { NodeHandler } from '../registry.js';
import vm from 'vm';

export const codeNode: NodeHandler = {
  definition: {
    type: 'code',
    displayName: 'Code',
    description: 'Run JavaScript code on input items',
    group: 'action',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [{ name: 'main', displayName: 'Output', type: 'main', multiple: false }],
    properties: [
      { name: 'code', displayName: 'JavaScript Code', description: 'Code has access to `items` (input) and must return an array of items', type: 'code', required: true, default: '// Access input via items[0].json\n// Return array of { json: {...} }\nreturn items;' },
    ],
  },

  async execute(ctx) {
    const { code } = ctx.parameters as { code: string };

    // Create sandbox context
    const items = ctx.input.map(item => ({ json: item.json }));

    const sandbox = {
      items,
      console: { log: (...args: unknown[]) => console.log('[CodeNode]', ...args) },
      JSON,
      Math,
      Date,
      Object,
      Array,
      String,
      Number,
      Boolean,
    };

    try {
      const script = new vm.Script(`(function() { ${code} })()`);
      const context = vm.createContext(sandbox);
      const result = script.runInContext(context, { timeout: 5000 });

      if (!Array.isArray(result)) {
        throw new Error('Code must return an array of items');
      }

      return result.map((item: any) => ({
        json: item.json || item,
      }));
    } catch (err) {
      throw new Error(`Code execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};
