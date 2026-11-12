// @flowforge/shared — Shared types and utilities for FlowForge

// ===== Workflow Types =====

export interface Workflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings: WorkflowSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  parameters: Record<string, unknown>;
  credentials?: Record<string, string>; // credentialId by credentialType
}

export interface WorkflowConnection {
  id: string;
  source: string;        // node id
  sourceHandle: string;  // output index (e.g. "output_0")
  target: string;        // node id
  targetHandle: string;  // input index (e.g. "input_0")
}

export interface WorkflowSettings {
  executionTimeout: number;  // seconds, 0 = no timeout
  retryOnFail: boolean;
  maxRetries: number;
  retryInterval: number;     // seconds
}

// ===== Execution Types =====

export type ExecutionStatus = 'running' | 'success' | 'failed' | 'cancelled' | 'waiting';

export interface Execution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  mode: 'manual' | 'webhook' | 'cron' | 'api';
  startedAt: string;
  finishedAt: string | null;
  duration: number | null;  // ms
  error: string | null;
  data: ExecutionData[];
}

export interface ExecutionData {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'success' | 'failed' | 'skipped';
  startTime: string;
  endTime: string;
  duration: number;  // ms
  input: unknown[];
  output: unknown[];
  error: string | null;
}

// ===== Item Type (data flowing between nodes) =====

export interface FlowItem {
  json: Record<string, unknown>;
  binary?: Record<string, { data: string; mimeType: string; fileName?: string }>;
}

// ===== Credential Types =====

export interface Credential {
  id: string;
  name: string;
  type: string;  // e.g. "httpBasicAuth", "httpBearerAuth"
  data: Record<string, unknown>;  // encrypted in DB
  createdAt: string;
  updatedAt: string;
}

// ===== Node Definition (for Node SDK) =====

export interface NodeDefinition {
  type: string;
  displayName: string;
  description: string;
  group: NodeGroup;
  icon?: string;
  color?: string;
  inputs: NodePort[];
  outputs: NodePort[];
  properties: NodeProperty[];
  credentials?: NodeCredentialRef[];
}

export type NodeGroup = 'trigger' | 'action' | 'transform' | 'flow' | 'output';

export interface NodePort {
  name: string;
  displayName: string;
  type: 'main' | 'data';
  multiple: boolean;  // can accept multiple connections
}

export interface NodeProperty {
  name: string;
  displayName: string;
  description?: string;
  type: PropertyType;
  default?: unknown;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export type PropertyType = 'string' | 'number' | 'boolean' | 'json' | 'select' | 'multiline' | 'code' | 'date' | 'time';

export interface NodeCredentialRef {
  name: string;
  displayName: string;
  type: string;  // credential type
  required: boolean;
}

// ===== API Types =====

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ===== User (single-user MVP) =====

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Settings =====

export interface Settings {
  instanceName: string;
  executionTimeout: number;
  saveExecutionProgress: boolean;
  saveManualExecutions: boolean;
  maxExecutionDataSize: number;  // KB
}
