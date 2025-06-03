import React, { useCallback, useMemo, useEffect } from 'react';
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
import ExternalDependencyNode from './ExternalDependencyNode';

interface DecisionTreeVisualizationProps {
  tree: ArchitectureDecisionTree;
  selectedDecisionId?: string;
  onDecisionSelect: (decisionId: string) => void;
}

const nodeTypes: NodeTypes = {
  decision: DecisionNode,
  externalDependency: ExternalDependencyNode,
};

export default function DecisionTreeVisualization({
  tree,
  selectedDecisionId,
  onDecisionSelect,
}: DecisionTreeVisualizationProps) {
  // Convert decision tree to ReactFlow nodes and edges
  const { nodes: calculatedNodes, edges: calculatedEdges } = useMemo(() => {
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

    // Create decision nodes with calculated positions
    Object.entries(levels).forEach(([level, decisionIds]) => {
      decisionIds.forEach((decisionId, index) => {
        const decision = tree.decisions[decisionId];
        const x = (index - decisionIds.length / 2) * 300 + 400; // Increased spacing for external deps
        const y = parseInt(level) * 200 + 100; // Increased vertical spacing

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

        // Add external dependency nodes for this decision
        if (decision.externalDependencies && decision.externalDependencies.length > 0) {
          decision.externalDependencies.forEach((extDep, extIndex) => {
            const extDepNodeId = `${decisionId}-ext-${extDep.id}`;
            const extDepX = x + 200 + (extIndex * 140); // Position to the right of decision
            const extDepY = y - 20; // Slightly above decision level

            // Mark as overdue if past expected resolution date
            const extDepWithOverdue = {
              ...extDep,
              isOverdue: extDep.expectedResolutionDate 
                ? new Date(extDep.expectedResolutionDate) < new Date()
                : false
            };

            nodes.push({
              id: extDepNodeId,
              type: 'externalDependency',
              position: { x: extDepX, y: extDepY },
              data: {
                dependency: extDepWithOverdue,
                parentDecisionId: decisionId,
                isSelected: selectedDecisionId === extDepNodeId,
                onSelect: () => onDecisionSelect(extDepNodeId),
              },
            });

            // Create edge from decision to external dependency
            edges.push({
              id: `${decisionId}-${extDepNodeId}`,
              source: decisionId,
              target: extDepNodeId,
              type: 'straight',
              style: { 
                stroke: '#9ca3af',
                strokeWidth: 1,
                strokeDasharray: '5,5', // Dashed line for external deps
              },
              animated: false,
            });
          });
        }
      });
    });

    // Create edges between decisions
    Object.values(tree.decisions).forEach(decision => {
      if (decision.children) {
        decision.children.forEach(childId => {
          const child = tree.decisions[childId];
          
          // Determine edge color based on path selection
          let edgeColor = '#64748b'; // Default gray
          let edgeWidth = 2;
          
          if (decision.selectedPath === true && child.selectedPath === true) {
            edgeColor = '#10b981'; // Green for selected path
            edgeWidth = 3;
          } else if (decision.selectedPath === false || child.selectedPath === false) {
            edgeColor = '#ef4444'; // Red for rejected path
            edgeWidth = 2;
          }

          edges.push({
            id: `${decision.id}-${childId}`,
            source: decision.id,
            target: childId,
            type: 'smoothstep',
            animated: decision.selectedPath === true && child.selectedPath === true,
            style: { 
              stroke: edgeColor,
              strokeWidth: edgeWidth,
            },
          });
        });
      }
    });

    return { nodes, edges };
  }, [tree, selectedDecisionId, onDecisionSelect]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes and edges when tree changes
  useEffect(() => {
    setNodes(calculatedNodes);
    setEdges(calculatedEdges);
  }, [calculatedNodes, calculatedEdges, setNodes, setEdges]);

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