import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client.js';

export function CredentialsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'httpBasicAuth', data: {} as Record<string, unknown> });

  const { data, isLoading } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => api.listCredentials(),
  });

  const createMutation = useMutation({
    mutationFn: () => api.createCredential(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      setShowForm(false);
      setForm({ name: '', type: 'httpBasicAuth', data: {} });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCredential(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['credentials'] }),
  });

  const credentialTypes = [
    { value: 'httpBasicAuth', label: 'HTTP Basic Auth', fields: ['username', 'password'] },
    { value: 'httpBearerAuth', label: 'HTTP Bearer Token', fields: ['token'] },
    { value: 'httpHeaderAuth', label: 'HTTP Header Auth', fields: ['headerName', 'headerValue'] },
  ];

  const currentType = credentialTypes.find((t) => t.value === form.type);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Credentials</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--flowforge-accent)] text-white rounded-md text-sm hover:opacity-90"
        >
          <Plus size={16} />
          New Credential
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-[var(--flowforge-surface)] border border-[var(--flowforge-border)] rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--flowforge-text-muted)] mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-2 py-1.5 bg-[var(--flowforge-bg)] border border-[var(--flowforge-border)] rounded-md text-sm"
              placeholder="My API Key"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--flowforge-text-muted)] mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, data: {} })}
              className="w-full px-2 py-1.5 bg-[var(--flowforge-bg)] border border-[var(--flowforge-border)] rounded-md text-sm"
            >
              {credentialTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {currentType?.fields.map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[var(--flowforge-text-muted)] mb-1">{field}</label>
              <input
                type={field === 'password' || field === 'token' || field === 'headerValue' ? 'password' : 'text'}
                value={(form.data[field] as string) || ''}
                onChange={(e) => setForm({ ...form, data: { ...form.data, [field]: e.target.value } })}
                className="w-full px-2 py-1.5 bg-[var(--flowforge-bg)] border border-[var(--flowforge-border)] rounded-md text-sm"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.name}
              className="px-3 py-1.5 bg-[var(--flowforge-accent)] text-white rounded-md text-sm disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-[var(--flowforge-text-muted)] text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-[var(--flowforge-text-muted)]">Loading...</p>
      ) : data?.data.length === 0 ? (
        <p className="text-[var(--flowforge-text-muted)] text-center py-12">No credentials yet</p>
      ) : (
        <div className="grid gap-3">
          {data?.data.map((cred: any) => (
            <div
              key={cred.id}
              className="flex items-center justify-between p-4 bg-[var(--flowforge-surface)] border border-[var(--flowforge-border)] rounded-lg"
            >
              <div>
                <div className="font-medium text-sm">{cred.name}</div>
                <div className="text-xs text-[var(--flowforge-text-muted)]">{cred.type}</div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(cred.id)}
                className="p-1.5 hover:bg-white/5 rounded-md text-[var(--flowforge-text-muted)] hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
