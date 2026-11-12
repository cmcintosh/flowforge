import type { NodeHandler } from '../registry.js';

export const conditionalNode: NodeHandler = {
  definition: {
    type: 'conditional',
    displayName: 'IF',
    description: 'Branch based on a condition',
    group: 'flow',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [
      { name: 'true', displayName: 'True', type: 'main', multiple: false },
      { name: 'false', displayName: 'False', type: 'main', multiple: false },
    ],
    properties: [
      { name: 'field', displayName: 'Field', description: 'JSON path to evaluate', type: 'string', required: true, placeholder: 'data.status' },
      { name: 'operator', displayName: 'Operator', type: 'select', required: true, default: 'equals',
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Not Equals', value: 'notEquals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Greater Than', value: 'greaterThan' },
          { label: 'Less Than', value: 'lessThan' },
          { label: 'Is Empty', value: 'isEmpty' },
          { label: 'Is Not Empty', value: 'isNotEmpty' },
        ],
      },
      { name: 'value', displayName: 'Value', type: 'string', placeholder: 'active' },
    ],
  },

  async execute(ctx) {
    const { field, operator = 'equals', value } = ctx.parameters as {
      field: string; operator: string; value?: string;
    };

    const trueItems: typeof ctx.input = [];
    const falseItems: typeof ctx.input = [];

    for (const item of ctx.input) {
      const fieldValue = field.split('.').reduce((obj: any, key: string) => obj?.[key], item.json);

      let condition = false;
      switch (operator) {
        case 'equals': condition = String(fieldValue) === value; break;
        case 'notEquals': condition = String(fieldValue) !== value; break;
        case 'contains': condition = String(fieldValue || '').includes(value || ''); break;
        case 'greaterThan': condition = Number(fieldValue) > Number(value); break;
        case 'lessThan': condition = Number(fieldValue) < Number(value); break;
        case 'isEmpty': condition = !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0); break;
        case 'isNotEmpty': condition = fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0); break;
      }

      if (condition) {
        trueItems.push(item);
      } else {
        falseItems.push(item);
      }
    }

    // For now, return both — the engine handles routing via output handles
    // Since our engine uses simple adjacency, we return all items and let
    // connection handles determine routing. This is a simplification for MVP.
    // TODO: Engine should handle multi-output nodes properly
    return [...trueItems, ...falseItems];
  },
};
