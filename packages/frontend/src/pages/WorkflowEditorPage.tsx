import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Play, ArrowLeft } from 'lucide-react';
import { api } from '../api/client.js';
import { useCanvasStore } from '../store/canvasStore.js';
import { WorkflowCanvas } from '../components/WorkflowCanvas.js';
import { NodePalette } from '../components/NodePalette.js';
import { NodeConfigPanel } from '../components/NodeConfigPanel.js';

export function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadFromWorkflow, exportToWorkflow, addNode } = useCanvasStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => api.getWorkflow(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.data) {
      loadFromWorkflow(data.data.nodes, data.data.connections);
    }
  }, [data, loadFromWorkflow]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const { nodes, connections } = exportToWorkflow();
      return api.updateWorkflow(id!, { name: data?.data.name, nodes, connections });
    },
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const executeMutation = useMutation({
    mutationFn: () => api.executeWorkflow(id!),
  });

  const handleAddNode = useCallback((type: string, name: string) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      type: 'flowforge',
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        type,
        name,
        parameters: {},
      },
    };
    addNode(newNode);
  }, [addNode]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-[var(--flowforge-text-muted)]">Loading...</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--flowforge-surface)] border-b border-[var(--flowforge-border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workflows')}
            className="p-1.5 hover:bg-white/5 rounded-md text-[var(--flowforge-text-muted)]"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-sm font-medium">{data?.data.name || 'Untitled'}</h2>
          {saveStatus === 'saving' && <span className="text-xs text-[var(--flowforge-text-muted)]">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveMutation.mutate()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--flowforge-surface)] border border-[var(--flowforge-border)] rounded-md text-sm hover:border-[var(--flowforge-accent)] transition-colors"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => executeMutation.mutate()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--flowforge-accent)] text-white rounded-md text-sm hover:opacity-90 transition-opacity"
          >
            <Play size={14} />
            Execute
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAddNode={handleAddNode} />
        <div className="flex-1 relative">
          <WorkflowCanvas />
        </div>
        <NodeConfigPanel />
      </div>

      {/* Execution result toast */}
      {executeMutation.data && (
        <div className="absolute bottom-4 right-4 p-4 bg-[var(--flowforge-surface)] border border-[var(--flowforge-border)] rounded-lg shadow-lg max-w-md">
          <div className="text-sm font-medium mb-1">
            Execution {executeMutation.data.data.status}
          </div>
          <div className="text-xs text-[var(--flowforge-text-muted)]">
            Duration: {executeMutation.data.data.duration}ms ·
            {' '}{executeMutation.data.data.data.length} nodes executed
          </div>
          {executeMutation.data.data.error && (
            <div className="text-xs text-red-400 mt-1">{executeMutation.data.data.error}</div>
          )}
          <button
            onClick={() => executeMutation.reset()}
            className="absolute top-2 right-2 text-[var(--flowforge-text-muted)] hover:text-[var(--flowforge-text)]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
