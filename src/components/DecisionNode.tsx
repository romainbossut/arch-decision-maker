import React from 'react';
import { Handle, Position } from 'reactflow';
import type { DecisionNodeData } from '../types/architecture';
import './DecisionNode.css';

interface DecisionNodeProps {
  data: DecisionNodeData;
}

export default function DecisionNode({ data }: DecisionNodeProps) {
  const { decision, isSelected, onSelect, onExpansionChange, isExpanded, isInheritedRejection } = data;

  const getStatusColor = (status?: string, isInherited = false) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'rejected': return isInherited ? '#fca5a5' : '#ef4444'; // lighter red for inherited
      case 'deprecated': return '#f59e0b';
      case 'proposed': return '#6b7280';
      default: return '#64748b';
    }
  };

  const getEffectiveStatus = () => {
    if (isInheritedRejection) {
      return 'rejected';
    }
    return decision.status;
  };

  const getStatusLabel = () => {
    if (isInheritedRejection) {
      return 'rejected (inherited)';
    }
    return decision.status;
  };

  const getPathClass = () => {
    const effectiveStatus = getEffectiveStatus();
    if (effectiveStatus === 'accepted') return 'selected-path';
    if (effectiveStatus === 'rejected') {
      return isInheritedRejection ? 'inherited-rejected-path' : 'rejected-path';
    }
    return '';
  };

  const handleExternalDepsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpansionChange) {
      onExpansionChange(decision.id, !isExpanded);
    }
  };

  const getExternalDepStatus = (extDep: any) => {
    if (extDep.expectedResolutionDate) {
      const isOverdue = new Date(extDep.expectedResolutionDate) < new Date();
      return isOverdue ? 'overdue' : 'scheduled';
    }
    return 'no-date';
  };

  const showExternalDeps = isExpanded || false;

  return (
    <div 
      className={`decision-node ${getPathClass()} ${isSelected ? 'selected' : ''} ${showExternalDeps ? 'expanded' : ''}`}
      onClick={onSelect}
      style={{
        borderColor: getStatusColor(getEffectiveStatus(), isInheritedRejection),
      }}
    >
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      <div className="decision-header">
        <div className="decision-title">{decision.title}</div>
        {(decision.status || isInheritedRejection) && (
          <div 
            className={`status-indicator ${isInheritedRejection ? 'inherited' : ''}`}
            style={{ backgroundColor: getStatusColor(getEffectiveStatus(), isInheritedRejection) }}
          >
            {getStatusLabel()}
          </div>
        )}
      </div>
      
      <div className="decision-id">ID: {decision.id}</div>
      
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
        <div className="external-deps-section">
          <div 
            className="external-deps-header"
            onClick={handleExternalDepsClick}
          >
            <span className="external-deps-count">
              🔗 {decision.externalDependencies.length} external dep{decision.externalDependencies.length > 1 ? 's' : ''}
            </span>
            <span className={`expand-arrow ${showExternalDeps ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          
          {showExternalDeps && (
            <div className="external-deps-list">
              {decision.externalDependencies.map((extDep, index) => {
                const status = getExternalDepStatus(extDep);
                const isOverdue = status === 'overdue';
                
                return (
                  <div key={index} className={`external-dep-item ${status}`}>
                    <div className="external-dep-title">
                      {extDep.title}
                      {isOverdue && <span className="overdue-badge">⚠️</span>}
                    </div>
                    <div className="external-dep-id">ID: {extDep.id}</div>
                    {extDep.expectedResolutionDate && (
                      <div className="external-dep-date">
                        📅 {isOverdue ? 'Overdue: ' : 'Due: '}{extDep.expectedResolutionDate}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 