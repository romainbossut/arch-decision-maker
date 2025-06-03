import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import DecisionNode from './DecisionNode';
import ExternalDependencyNode from './ExternalDependencyNode';
import type { ArchitectureDecisionTree } from '../types/architecture';
import './DecisionTreeVisualization.css';

interface DecisionTreeVisualizationProps {
  tree: ArchitectureDecisionTree;
  selectedDecisionId?: string;
  onDecisionSelect: (decisionId: string) => void;
}

const nodeTypes = {
  decision: DecisionNode,
  externalDependency: ExternalDependencyNode,
};

export default function DecisionTreeVisualization({ 
  tree, 
  selectedDecisionId, 
  onDecisionSelect 
}: DecisionTreeVisualizationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Function to handle node expansion/collapse
  const handleNodeExpansion = useCallback((nodeId: string, isExpanded: boolean) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(nodeId);
      } else {
        newSet.delete(nodeId);
      }
      return newSet;
    });
  }, []);

  // Enhanced layout algorithm that responds to node expansion
  const { initialNodes, initialEdges } = useMemo(() => {
    const decisions = Object.values(tree.decisions);
    const calculatedNodes: Node[] = [];
    const calculatedEdges: Edge[] = [];

    // Configuration for reactive layout with increased spacing
    const BASE_HORIZONTAL_SPACING = 400;
    const BASE_VERTICAL_SPACING = 200;
    const EXPANDED_NODE_HEIGHT = 350; // Estimated height of expanded node
    const BASE_NODE_HEIGHT = 180; // Estimated height of base node
    const MIN_SPACING_BUFFER = 50; // Minimum buffer between nodes

    // Calculate levels for hierarchical layout
    const levels: Record<string, number> = {};
    const processed = new Set<string>();

    function calculateLevel(decisionId: string, currentLevel = 0): number {
      if (processed.has(decisionId)) {
        return levels[decisionId] || 0;
      }

      const decision = tree.decisions[decisionId];
      if (!decision) return currentLevel;

      let maxParentLevel = -1;
      if (decision.dependencies && decision.dependencies.length > 0) {
        for (const depId of decision.dependencies) {
          const parentLevel = calculateLevel(depId, currentLevel);
          maxParentLevel = Math.max(maxParentLevel, parentLevel);
        }
      }

      const level = maxParentLevel + 1;
      levels[decisionId] = level;
      processed.add(decisionId);
      return level;
    }

    // Calculate levels for all decisions
    decisions.forEach(decision => calculateLevel(decision.id));

    // Group decisions by level
    const levelGroups: Record<number, string[]> = {};
    Object.entries(levels).forEach(([id, level]) => {
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(id);
    });

    // Position decision nodes with enhanced reactive spacing
    Object.entries(levelGroups).forEach(([levelStr, decisionIds]) => {
      const level = parseInt(levelStr);
      const x = level * BASE_HORIZONTAL_SPACING;
      
      // Sort nodes to keep consistent ordering
      const sortedDecisionIds = [...decisionIds].sort();
      
      // Calculate positions with proper spacing for expanded nodes
      let currentY = 0;
      const totalNodes = sortedDecisionIds.length;
      
      // Start from the top and work down, giving each node appropriate space
      const startY = -(totalNodes - 1) * BASE_VERTICAL_SPACING / 2;
      currentY = startY;
      
      sortedDecisionIds.forEach((decisionId, index) => {
        const decision = tree.decisions[decisionId];
        if (!decision) return;

        const isExpanded = expandedNodes.has(decisionId);
        
        // Calculate the space this node needs
        const nodeHeight = isExpanded ? EXPANDED_NODE_HEIGHT : BASE_NODE_HEIGHT;
        
        // If this is not the first node, add spacing from the previous node
        if (index > 0) {
          const prevNodeId = sortedDecisionIds[index - 1];
          const prevIsExpanded = expandedNodes.has(prevNodeId);
          const prevNodeHeight = prevIsExpanded ? EXPANDED_NODE_HEIGHT : BASE_NODE_HEIGHT;
          
          // Calculate the spacing needed between previous node and current node
          const requiredSpacing = (prevNodeHeight / 2) + (nodeHeight / 2) + MIN_SPACING_BUFFER;
          const actualSpacing = Math.max(BASE_VERTICAL_SPACING, requiredSpacing);
          
          currentY += actualSpacing;
        }

        calculatedNodes.push({
          id: decisionId,
          type: 'decision',
          position: { x, y: currentY },
          data: {
            decision,
            isSelected: selectedDecisionId === decisionId,
            onSelect: () => onDecisionSelect(decisionId),
            onExpansionChange: handleNodeExpansion,
            isExpanded,
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        });
      });
    });

    // Create edges for decision dependencies
    decisions.forEach(decision => {
      if (decision.dependencies) {
        decision.dependencies.forEach(depId => {
          if (tree.decisions[depId]) {
            const edgeStyle = decision.status === 'rejected' ? {
              strokeDasharray: '5,5',
              stroke: '#ef4444',
            } : decision.status === 'accepted' ? {
              stroke: '#10b981',
              strokeWidth: 2,
            } : {};

            calculatedEdges.push({
              id: `${depId}-${decision.id}`,
              source: depId,
              target: decision.id,
              type: 'smoothstep',
              style: edgeStyle,
              animated: decision.status === 'accepted',
            });
          }
        });
      }
    });

    return { initialNodes: calculatedNodes, initialEdges: calculatedEdges };
  }, [tree, selectedDecisionId, onDecisionSelect, expandedNodes, handleNodeExpansion]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when the layout changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="decision-tree-visualization">
      <div className="visualization-controls">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Accepted Decision</span>
          </div>
          <div className="legend-item">
            <div className="legend-color rejected"></div>
            <span>Rejected Decision</span>
          </div>
          <div className="legend-item">
            <div className="legend-color external"></div>
            <span>External Dependencies (in nodes)</span>
          </div>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2, minZoom: 0.05 }}
        minZoom={0.05}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
} 