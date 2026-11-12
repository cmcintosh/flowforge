const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('flowforge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Workflows
  listWorkflows: (page = 1) => request<{ data: any[]; total: number; page: number; pageSize: number }>(`/workflows?page=${page}`),
  getWorkflow: (id: string) => request<{ data: any }>(`/workflows/${id}`),
  createWorkflow: (data: { name: string; description?: string }) =>
    request<{ data: any }>('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id: string, data: any) =>
    request<{ data: any }>(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflow: (id: string) => request<{ success: boolean }>(`/workflows/${id}`, { method: 'DELETE' }),
  activateWorkflow: (id: string) => request<{ data: any }>(`/workflows/${id}/activate`, { method: 'POST' }),
  deactivateWorkflow: (id: string) => request<{ data: any }>(`/workflows/${id}/deactivate`, { method: 'POST' }),
  executeWorkflow: (id: string) => request<{ data: any }>(`/workflows/${id}/execute`, { method: 'POST' }),

  // Credentials
  listCredentials: () => request<{ data: any[] }>('/credentials'),
  getCredential: (id: string) => request<{ data: any }>(`/credentials/${id}`),
  createCredential: (data: { name: string; type: string; data: Record<string, unknown> }) =>
    request<{ data: any }>('/credentials', { method: 'POST', body: JSON.stringify(data) }),
  updateCredential: (id: string, data: any) =>
    request<{ data: any }>(`/credentials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCredential: (id: string) => request<{ success: boolean }>(`/credentials/${id}`, { method: 'DELETE' }),

  // Executions
  listExecutions: (page = 1, workflowId?: string) =>
    request<{ data: any[]; total: number; page: number; pageSize: number }>(
      `/executions?page=${page}${workflowId ? `&workflowId=${workflowId}` : ''}`
    ),
  getExecution: (id: string) => request<{ data: any }>(`/executions/${id}`),
  deleteExecution: (id: string) => request<{ success: boolean }>(`/executions/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request<{ data: any }>('/settings'),
  updateSettings: (data: any) => request<{ data: any }>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  login: (email: string, password: string) =>
    request<{ data: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  setup: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    request<{ data: any; token: string }>('/auth/setup', { method: 'POST', body: JSON.stringify(data) }),
};
