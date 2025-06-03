import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow';
import type { Node, Edge, Connection, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import type { ArchitectureDecisionTree } from '../types/architecture';
import DecisionNode from './DecisionNode';

interface DecisionTreeVisualizationProps {
  tree: ArchitectureDecisionTree;
  selectedDecisionId?: string;
  onDecisionSelect: (decisionId: string) => void;
}

const nodeTypes: NodeTypes = {
  decision: DecisionNode,
};

export default function DecisionTreeVisualization({
  tree,
  selectedDecisionId,
  onDecisionSelect,
}: DecisionTreeVisualizationProps) {
  // Convert decision tree to ReactFlow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Calculate positions using a simple hierarchical layout
    const levels: Record<number, string[]> = {};
    const visited = new Set<string>();
    
    function calculateLevel(decisionId: string, level: number = 0): number {
      if (visited.has(decisionId)) return level;
      visited.add(decisionId);
      
      if (!levels[level]) levels[level] = [];
      levels[level].push(decisionId);
      
      const decision = tree.decisions[decisionId];
      let maxChildLevel = level;
      
      if (decision.children) {
        decision.children.forEach(childId => {
          const childLevel = calculateLevel(childId, level + 1);
          maxChildLevel = Math.max(maxChildLevel, childLevel);
        });
      }
      
      return maxChildLevel;
    }

    // Start from root decisions
    tree.rootDecisions.forEach(rootId => calculateLevel(rootId));

    // Create nodes with calculated positions
    Object.entries(levels).forEach(([level, decisionIds]) => {
      decisionIds.forEach((decisionId, index) => {
        const decision = tree.decisions[decisionId];
        const x = (index - decisionIds.length / 2) * 250 + 300;
        const y = parseInt(level) * 150 + 100;

        nodes.push({
          id: decisionId,
          type: 'decision',
          position: { x, y },
          data: {
            decision,
            isSelected: selectedDecisionId === decisionId,
            onSelect: () => onDecisionSelect(decisionId),
          },
        });
      });
    });

    // Create edges
    Object.values(tree.decisions).forEach(decision => {
      if (decision.children) {
        decision.children.forEach(childId => {
          edges.push({
            id: `${decision.id}-${childId}`,
            source: decision.id,
            target: childId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#64748b' },
          });
        });
      }
    });

    return { nodes, edges };
  }, [tree, selectedDecisionId, onDecisionSelect]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
} 