import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { DecisionPoint } from '../types/architecture';

interface DecisionNodeData {
  decision: DecisionPoint;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DecisionNode({ data }: NodeProps<DecisionNodeData>) {
  const { decision, isSelected, onSelect } = data;

  return (
    <div
      className={`decision-node ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        background: isSelected ? '#3b82f6' : '#ffffff',
        color: isSelected ? '#ffffff' : '#1f2937',
        border: '2px solid #e5e7eb',
        borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        minWidth: '200px',
        maxWidth: '250px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#6b7280',
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
          {decision.title}
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
          background: '#6b7280',
          width: '8px',
          height: '8px',
        }}
      />
    </div>
  );
} 