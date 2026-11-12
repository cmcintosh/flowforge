import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import clsx from 'clsx';

interface NodeTemplate {
  type: string;
  name: string;
  icon: string;
  group: string;
}

const nodeTemplates: NodeTemplate[] = [
  { type: 'webhookTrigger', name: 'Webhook', icon: '🔗', group: 'Triggers' },
  { type: 'cronTrigger', name: 'Cron', icon: '⏰', group: 'Triggers' },
  { type: 'httpRequest', name: 'HTTP Request', icon: '🌐', group: 'Actions' },
  { type: 'code', name: 'Code', icon: '📄', group: 'Actions' },
  { type: 'set', name: 'Set', icon: '✏️', group: 'Transform' },
  { type: 'filter', name: 'Filter', icon: '🔍', group: 'Flow' },
  { type: 'conditional', name: 'IF', icon: '🔀', group: 'Flow' },
  { type: 'merge', name: 'Merge', icon: '🔗', group: 'Flow' },
  { type: 'delay', name: 'Delay', icon: '⏳', group: 'Flow' },
  { type: 'respondToWebhook', name: 'Respond to Webhook', icon: '↩️', group: 'Output' },
];

const groupOrder = ['Triggers', 'Actions', 'Transform', 'Flow', 'Output'];

interface NodePaletteProps {
  onAddNode: (type: string, name: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [search, setSearch] = useState('');

  const filtered = nodeTemplates.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = groupOrder.map((group) => ({
    group,
    nodes: filtered.filter((n) => n.group === group),
  })).filter((g) => g.nodes.length > 0);

  return (
    <div className="w-60 bg-[var(--flowforge-surface)] border-r border-[var(--flowforge-border)] flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-[var(--flowforge-border)]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--flowforge-text-muted)]" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--flowforge-bg)] border border-[var(--flowforge-border)] rounded-md text-sm text-[var(--flowforge-text)] placeholder:text-[var(--flowforge-text-muted)] focus:outline-none focus:border-[var(--flowforge-accent)]"
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto">
        {grouped.map(({ group, nodes }) => (
          <div key={group}>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase text-[var(--flowforge-text-muted)] tracking-wider">
              {group}
            </div>
            {nodes.map((node) => (
              <button
                key={node.type}
                onClick={() => onAddNode(node.type, node.name)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{node.icon}</span>
                <span>{node.name}</span>
                <Plus size={12} className="ml-auto text-[var(--flowforge-text-muted)]" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
