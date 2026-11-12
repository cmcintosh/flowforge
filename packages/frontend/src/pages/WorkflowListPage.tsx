import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Play, Pause, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';

export function WorkflowListPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.listWorkflows(),
  });

  const createMutation = useMutation({
    mutationFn: () => api.createWorkflow({ name: 'New Workflow' }),
    onSuccess: (wf) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      window.location.href = `/workflows/${wf.data.id}`;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (wf: any) => wf.active ? api.deactivateWorkflow(wf.id) : api.activateWorkflow(wf.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteWorkflow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Workflows</h1>
        <button
          onClick={() => createMutation.mutate()}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--flowforge-accent)] text-white rounded-md text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      {isLoading ? (
        <p className="text-[var(--flowforge-text-muted)]">Loading...</p>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--flowforge-text-muted)] mb-4">No workflows yet</p>
          <button
            onClick={() => createMutation.mutate()}
            className="text-[var(--flowforge-accent)] text-sm"
          >
            Create your first workflow →
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.data.map((wf: any) => (
            <div
              key={wf.id}
              className="flex items-center justify-between p-4 bg-[var(--flowforge-surface)] border border-[var(--flowforge-border)] rounded-lg hover:border-[var(--flowforge-accent)] transition-colors"
            >
              <Link to={`/workflows/${wf.id}`} className="flex-1">
                <div className="font-medium text-sm">{wf.name}</div>
                <div className="text-xs text-[var(--flowforge-text-muted)]">
                  {wf.nodes.length} nodes · {wf.active ? 'Active' : 'Inactive'}
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMutation.mutate(wf)}
                  className="p-1.5 hover:bg-white/5 rounded-md text-[var(--flowforge-text-muted)] hover:text-[var(--flowforge-text)]"
                  title={wf.active ? 'Deactivate' : 'Activate'}
                >
                  {wf.active ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(wf.id)}
                  className="p-1.5 hover:bg-white/5 rounded-md text-[var(--flowforge-text-muted)] hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
