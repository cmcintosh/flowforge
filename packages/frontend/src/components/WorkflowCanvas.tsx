import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCanvasStore } from '../store/canvasStore.js';
import { FlowForgeNode } from './FlowForgeNode.js';

const nodeTypes: NodeTypes = {
  flowforge: FlowForgeNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
};

export function WorkflowCanvas() {
  const { nodes, edges, setNodes, setEdges, setSelectedNode, addNode } = useCanvasStore();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes) as any);
    },
    [nodes, setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges) as any);
    },
    [edges, setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges(addEdge({ ...connection, animated: true }, edges) as any);
    },
    [edges, setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={['Delete', 'Backspace']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2d3a" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const type = (node.data as any)?.type || '';
            if (type.includes('Trigger')) return '#10b981';
            if (['httpRequest', 'code'].includes(type)) return '#6366f1';
            if (['filter', 'conditional', 'merge', 'delay'].includes(type)) return '#ec4899';
            return '#6366f1';
          }}
          maskColor="rgba(15, 17, 23, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
