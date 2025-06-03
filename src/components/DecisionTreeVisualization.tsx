import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  Position,
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
  const [showExternalDependencies, setShowExternalDependencies] = useState(true);

  // Enhanced layout algorithm for better positioning
  const { nodes, edges } = useMemo(() => {
    const decisions = Object.values(tree.decisions);
    const calculatedNodes: Node[] = [];
    const calculatedEdges: Edge[] = [];

    // Configuration for layout
    const HORIZONTAL_SPACING = 350;
    const VERTICAL_SPACING = 200;
    const EXTERNAL_DEPENDENCY_X_OFFSET = 200;
    const EXTERNAL_DEPENDENCY_Y_SPACING = 120;

    // Calculate levels for hierarchical layout
    const levels: Record<string, number> = {};
    const processed = new Set<string>();

    // Helper function to calculate the depth/level of each decision
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

    // Position decision nodes
    Object.entries(levelGroups).forEach(([levelStr, decisionIds]) => {
      const level = parseInt(levelStr);
      const x = level * HORIZONTAL_SPACING;
      
      decisionIds.forEach((decisionId, index) => {
        const decision = tree.decisions[decisionId];
        if (!decision) return;

        // Center multiple nodes at the same level
        const totalInLevel = decisionIds.length;
        const yOffset = (index - (totalInLevel - 1) / 2) * VERTICAL_SPACING;
        const y = yOffset;

        calculatedNodes.push({
          id: decisionId,
          type: 'decision',
          position: { x, y },
          data: {
            decision,
            isSelected: selectedDecisionId === decisionId,
            onSelect: () => onDecisionSelect(decisionId),
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        });
      });
    });

    // Position external dependency nodes (only if visible)
    if (showExternalDependencies) {
      decisions.forEach(decision => {
        if (decision.externalDependencies && decision.externalDependencies.length > 0) {
          const parentNode = calculatedNodes.find(node => node.id === decision.id);
          if (!parentNode) return;

          decision.externalDependencies.forEach((extDep, index) => {
            const extDepId = `${decision.id}-ext-${extDep.id}`;
            
            // Position external dependencies to the right of their parent decision
            const x = parentNode.position.x + EXTERNAL_DEPENDENCY_X_OFFSET;
            const baseY = parentNode.position.y;
            const y = baseY + (index - (decision.externalDependencies!.length - 1) / 2) * EXTERNAL_DEPENDENCY_Y_SPACING;

            calculatedNodes.push({
              id: extDepId,
              type: 'externalDependency',
              position: { x, y },
              data: {
                dependency: extDep,
                parentDecisionId: decision.id,
                isSelected: selectedDecisionId === extDepId,
                onSelect: () => onDecisionSelect(extDepId),
              },
              targetPosition: Position.Left,
              sourcePosition: Position.Right,
            });
          });
        }
      });
    }

    // Create edges for decision dependencies
    decisions.forEach(decision => {
      if (decision.dependencies) {
        decision.dependencies.forEach(depId => {
          if (tree.decisions[depId]) {
            const edgeStyle = decision.selectedPath === false ? {
              strokeDasharray: '5,5',
              stroke: '#ef4444',
            } : decision.selectedPath === true ? {
              stroke: '#10b981',
              strokeWidth: 2,
            } : {};

            calculatedEdges.push({
              id: `${depId}-${decision.id}`,
              source: depId,
              target: decision.id,
              type: 'smoothstep',
              style: edgeStyle,
              animated: decision.selectedPath === true,
            });
          }
        });
      }
    });

    // Create edges for external dependencies (only if visible)
    if (showExternalDependencies) {
      decisions.forEach(decision => {
        if (decision.externalDependencies && decision.externalDependencies.length > 0) {
          decision.externalDependencies.forEach(extDep => {
            const extDepId = `${decision.id}-ext-${extDep.id}`;
            calculatedEdges.push({
              id: `${decision.id}-${extDepId}`,
              source: decision.id,
              target: extDepId,
              type: 'smoothstep',
              style: {
                strokeDasharray: '3,3',
                stroke: '#6b7280',
              },
              sourceHandle: 'right',
              targetHandle: 'left',
            });
          });
        }
      });
    }

    return { nodes: calculatedNodes, edges: calculatedEdges };
  }, [tree, selectedDecisionId, onDecisionSelect, showExternalDependencies]);

  return (
    <div className="decision-tree-visualization">
      <div className="visualization-controls">
        <button
          onClick={() => setShowExternalDependencies(!showExternalDependencies)}
          className={`toggle-external-deps ${showExternalDependencies ? 'active' : ''}`}
        >
          {showExternalDependencies ? '🔗 Hide External Dependencies' : '🔗 Show External Dependencies'}
        </button>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Selected Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-color rejected"></div>
            <span>Rejected Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-color external"></div>
            <span>External Dependency</span>
          </div>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.5, minZoom: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
} 