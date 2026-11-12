import { useState, useCallback, useRef } from 'react';
import { create } from 'zustand';
import type { WorkflowNode, WorkflowConnection } from '@flowforge/shared';

interface CanvasState {
  nodes: any[];
  edges: any[];
  selectedNodeId: string | null;
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  addNode: (node: any) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  loadFromWorkflow: (nodes: WorkflowNode[], connections: WorkflowConnection[]) => void;
  exportToWorkflow: () => { nodes: WorkflowNode[]; connections: WorkflowConnection[] };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),

  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== id),
    edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
  })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  loadFromWorkflow: (wfNodes, wfConnections) => {
    const nodes = wfNodes.map((n) => ({
      id: n.id,
      type: 'flowforge',
      position: n.position,
      data: {
        type: n.type,
        name: n.name,
        parameters: n.parameters,
        credentials: n.credentials,
      },
    }));

    const edges = wfConnections.map((c) => ({
      id: c.id,
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle,
      targetHandle: c.targetHandle,
    }));

    set({ nodes, edges });
  },

  exportToWorkflow: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        name: n.data.name,
        position: n.position,
        parameters: n.data.parameters || {},
        credentials: n.data.credentials,
      })),
      connections: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || 'output_0',
        targetHandle: e.targetHandle || 'input_0',
      })),
    };
  },
}));
