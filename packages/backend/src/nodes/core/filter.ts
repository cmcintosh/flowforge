import type { NodeHandler } from '../registry.js';

export const filterNode: NodeHandler = {
  definition: {
    type: 'filter',
    displayName: 'Filter',
    description: 'Filter items by a condition',
    group: 'flow',
    inputs: [{ name: 'main', displayName: 'Input', type: 'main', multiple: false }],
    outputs: [{ name: 'main', displayName: 'Passed', type: 'main', multiple: false }],
    properties: [
      { name: 'field', displayName: 'Field', description: 'JSON path to check (e.g. "status")', type: 'string', required: true, placeholder: 'status' },
      { name: 'operator', displayName: 'Operator', type: 'select', required: true, default: 'equals',
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Not Equals', value: 'notEquals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Greater Than', value: 'greaterThan' },
          { label: 'Less Than', value: 'lessThan' },
          { label: 'Exists', value: 'exists' },
        ],
      },
      { name: 'value', displayName: 'Value', description: 'Value to compare against', type: 'string', placeholder: 'active' },
    ],
  },

  async execute(ctx) {
    const { field, operator = 'equals', value } = ctx.parameters as {
      field: string; operator: string; value?: string;
    };

    return ctx.input.filter(item => {
      const fieldValue = field.split('.').reduce((obj: any, key: string) => obj?.[key], item.json);

      switch (operator) {
        case 'equals': return String(fieldValue) === value;
        case 'notEquals': return String(fieldValue) !== value;
        case 'contains': return String(fieldValue || '').includes(value || '');
        case 'greaterThan': return Number(fieldValue) > Number(value);
        case 'lessThan': return Number(fieldValue) < Number(value);
        case 'exists': return fieldValue !== undefined && fieldValue !== null;
        default: return false;
      }
    });
  },
};
