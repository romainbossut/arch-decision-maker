import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { DecisionNodeData } from '../types/architecture';

export default function DecisionNode({ data }: NodeProps<DecisionNodeData>) {
  const { decision, isSelected, onSelect } = data;

  // Determine node styling based on selection state
  const getNodeStyling = () => {
    const baseStyle = {
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '200px',
      maxWidth: '250px',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      border: '2px solid',
    };

    if (isSelected) {
      // Currently selected node (darker styling for visibility)
      if (decision.selectedPath === true) {
        return {
          ...baseStyle,
          background: '#059669', // Dark green
          color: '#ffffff',
          borderColor: '#047857',
        };
      } else if (decision.selectedPath === false) {
        return {
          ...baseStyle,
          background: '#dc2626', // Dark red
          color: '#ffffff',
          borderColor: '#b91c1c',
        };
      } else {
        return {
          ...baseStyle,
          background: '#3b82f6', // Blue for selected neutral
          color: '#ffffff',
          borderColor: '#2563eb',
        };
      }
    } else {
      // Non-selected nodes
      if (decision.selectedPath === true) {
        return {
          ...baseStyle,
          background: '#d1fae5', // Light green
          color: '#065f46',
          borderColor: '#10b981',
        };
      } else if (decision.selectedPath === false) {
        return {
          ...baseStyle,
          background: '#fee2e2', // Light red
          color: '#7f1d1d',
          borderColor: '#ef4444',
        };
      } else {
        return {
          ...baseStyle,
          background: '#ffffff', // Default white
          color: '#1f2937',
          borderColor: '#e5e7eb',
        };
      }
    }
  };

  const getHandleColor = () => {
    if (decision.selectedPath === true) {
      return '#10b981'; // Green
    } else if (decision.selectedPath === false) {
      return '#ef4444'; // Red
    } else {
      return '#6b7280'; // Gray
    }
  };

  const getPathIndicator = () => {
    if (decision.selectedPath === true) {
      return '✅ ';
    } else if (decision.selectedPath === false) {
      return '❌ ';
    } else {
      return '';
    }
  };

  return (
    <div
      className={`decision-node ${isSelected ? 'selected' : ''} ${
        decision.selectedPath === true ? 'selected-path' : 
        decision.selectedPath === false ? 'rejected-path' : 'neutral-path'
      }`}
      onClick={onSelect}
      style={getNodeStyling()}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: getHandleColor(),
          width: '8px',
          height: '8px',
        }}
      />
      
      <div>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            lineHeight: '1.2',
          }}
        >
          {getPathIndicator()}{decision.title}
        </h3>
        
        {decision.dependencies && decision.dependencies.length > 0 && (
          <div
            style={{
              fontSize: '11px',
              opacity: 0.8,
              marginBottom: '4px',
            }}
          >
            Depends on: {decision.dependencies.join(', ')}
          </div>
        )}
        
        <div
          style={{
            fontSize: '12px',
            opacity: 0.9,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.3',
          }}
        >
          {decision.description}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: getHandleColor(),
          width: '8px',
          height: '8px',
        }}
      />
    </div>
  );
} 