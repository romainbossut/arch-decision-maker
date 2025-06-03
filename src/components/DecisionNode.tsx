import React from 'react';
import { Handle, Position } from 'reactflow';
import type { DecisionNodeData } from '../types/architecture';
import './DecisionNode.css';

interface DecisionNodeProps {
  data: DecisionNodeData;
}

export default function DecisionNode({ data }: DecisionNodeProps) {
  const { decision, isSelected, onSelect } = data;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'deprecated': return '#f59e0b';
      case 'proposed': return '#6b7280';
      default: return '#64748b';
    }
  };

  const getPathClass = () => {
    if (decision.selectedPath === true) return 'selected-path';
    if (decision.selectedPath === false) return 'rejected-path';
    return '';
  };

  return (
    <div 
      className={`decision-node ${getPathClass()} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        borderColor: getStatusColor(decision.status),
      }}
    >
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      <div className="decision-header">
        <div className="decision-title">{decision.title}</div>
        {decision.status && (
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(decision.status) }}
          >
            {decision.status}
          </div>
        )}
      </div>
      
      <div className="decision-id">ID: {decision.id}</div>
      
      {decision.selectedPath !== undefined && (
        <div className="path-indicator">
          {decision.selectedPath ? '✅ Selected' : '❌ Rejected'}
        </div>
      )}

      {(decision.riskLevel || decision.tags) && (
        <div className="decision-meta">
          {decision.riskLevel && (
            <span className={`risk-badge risk-${decision.riskLevel}`}>
              {decision.riskLevel === 'high' && '🔴'}
              {decision.riskLevel === 'medium' && '🟡'}
              {decision.riskLevel === 'low' && '🟢'}
              {decision.riskLevel}
            </span>
          )}
          {decision.tags && decision.tags.length > 0 && (
            <div className="tags-preview">
              {decision.tags.slice(0, 2).map(tag => (
                <span key={tag} className="tag-mini">{tag}</span>
              ))}
              {decision.tags.length > 2 && (
                <span className="tags-more">+{decision.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      )}

      {decision.externalDependencies && decision.externalDependencies.length > 0 && (
        <div className="external-deps-indicator">
          🔗 {decision.externalDependencies.length} external deps
        </div>
      )}
    </div>
  );
} 