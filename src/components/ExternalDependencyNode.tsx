import React from 'react';
import { Handle, Position } from 'reactflow';
import type { ExternalDependencyNodeData } from '../types/architecture';
import './ExternalDependencyNode.css';

interface ExternalDependencyNodeProps {
  data: ExternalDependencyNodeData;
}

export default function ExternalDependencyNode({ data }: ExternalDependencyNodeProps) {
  const { dependency, isSelected, onSelect } = data;

  const isOverdue = dependency.expectedResolutionDate 
    ? new Date(dependency.expectedResolutionDate) < new Date()
    : false;

  const getStatusClass = () => {
    if (isOverdue) return 'overdue';
    if (dependency.expectedResolutionDate) return 'scheduled';
    return 'no-date';
  };

  return (
    <div 
      className={`external-dependency-node ${getStatusClass()} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <Handle type="target" position={Position.Left} id="left" />
      
      <div className="ext-dep-header">
        <div className="ext-dep-icon">🔗</div>
        <div className="ext-dep-content">
          <div className="ext-dep-title">{dependency.title}</div>
          <div className="ext-dep-id">ID: {dependency.id}</div>
        </div>
      </div>

      {dependency.expectedResolutionDate && (
        <div className="ext-dep-date">
          <span className="date-icon">📅</span>
          <span className="date-text">
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {dependency.expectedResolutionDate}
          </span>
        </div>
      )}

      {isOverdue && (
        <div className="overdue-warning">
          ⚠️ Overdue
        </div>
      )}
    </div>
  );
} 