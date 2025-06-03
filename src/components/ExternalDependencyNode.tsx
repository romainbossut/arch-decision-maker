import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ExternalDependencyNodeData } from '../types/architecture';

export default function ExternalDependencyNode({ data }: NodeProps<ExternalDependencyNodeData>) {
  const { dependency, parentDecisionId, isSelected, onSelect } = data;

  // Check if dependency is overdue
  const isOverdue = dependency.expectedResolutionDate 
    ? new Date(dependency.expectedResolutionDate) < new Date()
    : false;

  const getNodeStyling = () => {
    const baseStyle = {
      borderRadius: '50%', // Circular shape
      padding: '16px',
      width: '120px',
      height: '120px',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      border: '2px solid',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
    };

    if (isSelected) {
      return {
        ...baseStyle,
        background: '#3b82f6',
        color: '#ffffff',
        borderColor: '#2563eb',
        transform: 'scale(1.05)',
      };
    } else if (isOverdue) {
      return {
        ...baseStyle,
        background: '#fee2e2',
        color: '#7f1d1d',
        borderColor: '#ef4444',
      };
    } else if (dependency.expectedResolutionDate) {
      return {
        ...baseStyle,
        background: '#fef3c7',
        color: '#92400e',
        borderColor: '#f59e0b',
      };
    } else {
      return {
        ...baseStyle,
        background: '#f3f4f6',
        color: '#374151',
        borderColor: '#9ca3af',
      };
    }
  };

  const getStatusIcon = () => {
    if (isOverdue) {
      return '⚠️';
    } else if (dependency.expectedResolutionDate) {
      return '📅';
    } else {
      return '🔗';
    }
  };

  return (
    <div
      className={`external-dependency-node ${isSelected ? 'selected' : ''} ${isOverdue ? 'overdue' : ''}`}
      onClick={onSelect}
      style={getNodeStyling()}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isOverdue ? '#ef4444' : '#9ca3af',
          width: '8px',
          height: '8px',
        }}
      />
      
      <div style={{ fontSize: '16px', marginBottom: '4px' }}>
        {getStatusIcon()}
      </div>
      
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        lineHeight: '1.2',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        marginBottom: '2px',
      }}>
        {dependency.title}
      </div>
      
      {dependency.expectedResolutionDate && (
        <div style={{
          fontSize: '9px',
          opacity: 0.8,
          lineHeight: '1.1',
        }}>
          {isOverdue ? 'Overdue' : 'Due'}: {dependency.expectedResolutionDate}
        </div>
      )}
    </div>
  );
} 