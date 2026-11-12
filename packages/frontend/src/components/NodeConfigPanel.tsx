import { useCanvasStore } from '../store/canvasStore.js';

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNode, removeNode } = useCanvasStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="w-72 bg-[var(--flowforge-surface)] border-l border-[var(--flowforge-border)] flex items-center justify-center">
        <p className="text-sm text-[var(--flowforge-text-muted)] px-4 text-center">
          Select a node to configure its properties
        </p>
      </div>
    );
  }

  const data = node.data as { type: string; name: string; parameters: Record<string, unknown> };

  return (
    <div className="w-72 bg-[var(--flowforge-surface)] border-l border-[var(--flowforge-border)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--flowforge-border)]">
        <div className="text-xs text-[var(--flowforge-text-muted)] mb-1">Node Type</div>
        <h3 className="font-medium text-sm">{data.type}</h3>
      </div>

      {/* Config */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--flowforge-text-muted)] mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateNode(node.id, { name: e.target.value })}
            className="w-full px-2 py-1.5 bg-[var(--flowforge-bg)] border border-[var(--flowforge-border)] rounded-md text-sm text-[var(--flowforge-text)] focus:outline-none focus:border-[var(--flowforge-accent)]"
          />
        </div>

        <div className="border-t border-[var(--flowforge-border)] pt-3">
          <div className="text-xs font-medium text-[var(--flowforge-text-muted)] mb-2">
            Parameters
          </div>
          <p className="text-xs text-[var(--flowforge-text-muted)]">
            Parameter editing will be available per node type. For now, edit via JSON.
          </p>
          <textarea
            value={JSON.stringify(data.parameters || {}, null, 2)}
            onChange={(e) => {
              try {
                updateNode(node.id, { parameters: JSON.parse(e.target.value) });
              } catch {}
            }}
            className="w-full mt-2 px-2 py-1.5 bg-[var(--flowforge-bg)] border border-[var(--flowforge-border)] rounded-md text-xs font-mono text-[var(--flowforge-text)] focus:outline-none focus:border-[var(--flowforge-accent)] min-h-[200px]"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--flowforge-border)]">
        <button
          onClick={() => removeNode(node.id)}
          className="w-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
