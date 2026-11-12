import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const statusColors: Record<string, string> = {
  success: 'text-green-400',
  failed: 'text-red-400',
  running: 'text-blue-400',
  cancelled: 'text-[var(--flowforge-text-muted)]',
  waiting: 'text-yellow-400',
};

export function ExecutionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: () => api.listExecutions(),
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Executions</h1>

      {isLoading ? (
        <p className="text-[var(--flowforge-text-muted)]">Loading...</p>
      ) : data?.data.length === 0 ? (
        <p className="text-[var(--flowforge-text-muted)] text-center py-12">No executions yet</p>
      ) : (
        <div className="bg-[var(--flowforge-surface)] border border-[var(--flowforge-border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--flowforge-border)] text-[var(--flowforge-text-muted)]">
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Workflow</th>
                <th className="text-left px-4 py-2 font-medium">Mode</th>
                <th className="text-left px-4 py-2 font-medium">Duration</th>
                <th className="text-left px-4 py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((exec: any) => (
                <tr key={exec.id} className="border-b border-[var(--flowforge-border)] hover:bg-white/5">
                  <td className="px-4 py-2">
                    <span className={statusColors[exec.status] || ''}>{exec.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/workflows/${exec.workflowId}`} className="text-[var(--flowforge-accent)] hover:underline">
                      {exec.workflowId.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-[var(--flowforge-text-muted)]">{exec.mode}</td>
                  <td className="px-4 py-2 text-[var(--flowforge-text-muted)]">
                    {exec.duration ? `${exec.duration}ms` : '-'}
                  </td>
                  <td className="px-4 py-2 text-[var(--flowforge-text-muted)]">
                    {new Date(exec.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
