import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';

const nodeColors: Record<string, string> = {
  trigger: '#10b981',
  action: '#6366f1',
  transform: '#f59e0b',
  flow: '#ec4899',
  output: '#ef4444',
};

const nodeIcons: Record<string, string> = {
  webhookTrigger: '🔗',
  cronTrigger: '⏰',
  httpRequest: '🌐',
  code: '📄',
  set: '✏️',
  filter: '🔍',
  conditional: '🔀',
  merge: '🔗',
  delay: '⏳',
  respondToWebhook: '↩️',
};

export function FlowForgeNode({ data, selected }: NodeProps) {
  const nodeData = data as { type: string; name: string; parameters: Record<string, unknown> };
  const color = nodeColors[getGroupForType(nodeData.type)] || '#6366f1';
  const icon = nodeIcons[nodeData.type] || '⚙️';

  return (
    <div
      className={clsx(
        'react-flow__node-flowforge',
        'rounded-lg px-3 py-2 min-w-[150px]',
        selected && 'ring-2 ring-offset-2 ring-offset-[var(--flowforge-bg)]'
      )}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input_0"
        className="!w-2.5 !h-2.5"
      />

      {/* Node content */}
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <div className="font-medium text-xs">{nodeData.name}</div>
          <div className="text-[10px] text-[var(--flowforge-text-muted)]">{nodeData.type}</div>
        </div>
      </div>

      {/* Output handle(s) */}
      {nodeData.type === 'conditional' ? (
        <>
          <Handle type="source" position={Position.Right} id="output_true" style={{ top: '30%' }} className="!w-2.5 !h-2.5" />
          <Handle type="source" position={Position.Right} id="output_false" style={{ top: '70%' }} className="!w-2.5 !h-2.5" />
        </>
      ) : (
        <Handle type="source" position={Position.Right} id="output_0" className="!w-2.5 !h-2.5" />
      )}
    </div>
  );
}

function getGroupForType(type: string): string {
  if (type.includes('Trigger')) return 'trigger';
  if (['httpRequest', 'code'].includes(type)) return 'action';
  if (['set'].includes(type)) return 'transform';
  if (['filter', 'conditional', 'merge', 'delay'].includes(type)) return 'flow';
  if (['respondToWebhook'].includes(type)) return 'output';
  return 'action';
}
