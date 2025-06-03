import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { DecisionPoint, ExternalDependency, ProsConsItem } from '../types/architecture';
import './DecisionDetails.css';

interface DecisionDetailsProps {
  decision?: DecisionPoint;
  externalDependency?: ExternalDependency;
  parentDecisionId?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function isDateOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function renderImpactIndicator(impact: 'minor' | 'major' | 'high'): React.JSX.Element {
  const impactConfig = {
    minor: { icon: '○', label: 'Minor', class: 'impact-minor' },
    major: { icon: '◐', label: 'Major', class: 'impact-major' },
    high: { icon: '●', label: 'High', class: 'impact-high' }
  };
  
  const config = impactConfig[impact];
  return (
    <span className={`impact-indicator ${config.class}`}>
      <span className="impact-icon">{config.icon}</span>
      <span className="impact-label">{config.label}</span>
    </span>
  );
}

function calculateOverallScore(items: ProsConsItem[]): number {
  if (items.length === 0) return 0;
  // Convert impact to numeric values for calculation
  const impactValues = { minor: 1, major: 3, high: 5 };
  const sum = items.reduce((acc, item) => acc + impactValues[item.impact], 0);
  return Math.round((sum / items.length) * 10) / 10;
}

export default function DecisionDetails({ 
  decision, 
  externalDependency,
  parentDecisionId 
}: DecisionDetailsProps) {
  if (externalDependency) {
    return (
      <div className="decision-details">
        <div className="details-header">
          <h2>🔗 External Dependency</h2>
          <div className="decision-meta">
            <span className="decision-id">ID: {externalDependency.id}</span>
            {parentDecisionId && (
              <span className="parent-decision">Blocks: {parentDecisionId}</span>
            )}
          </div>
        </div>

        <div className="details-content">
          <div className="details-section">
            <h3>{externalDependency.title}</h3>
            
            {externalDependency.description && (
              <div className="description">
                <ReactMarkdown>{externalDependency.description}</ReactMarkdown>
              </div>
            )}

            {externalDependency.expectedResolutionDate && (
              <div className="external-dependency-info">
                <h4>📅 Timeline</h4>
                <div className="timeline-info">
                  <span className="label">Expected Resolution:</span>
                  <span className={`date ${new Date(externalDependency.expectedResolutionDate) < new Date() ? 'overdue' : ''}`}>
                    {externalDependency.expectedResolutionDate}
                    {new Date(externalDependency.expectedResolutionDate) < new Date() && (
                      <span className="overdue-badge">⚠️ Overdue</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="decision-details">
        <div className="details-placeholder">
          <h3>Select a Decision Point or External Dependency</h3>
          <p>Click on any node in the tree to see detailed information.</p>
        </div>
      </div>
    );
  }

  const isOverdue = (dateString?: string): boolean => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const prosOverallScore = decision.prosCons?.pros ? calculateOverallScore(decision.prosCons.pros) : null;
  const consOverallScore = decision.prosCons?.cons ? calculateOverallScore(decision.prosCons.cons) : null;

  return (
    <div className="decision-details">
      <div className="details-header">
        <h2>📋 {decision.title}</h2>
        <div className="decision-meta">
          <span className="decision-id">ID: {decision.id}</span>
          {decision.selectedPath !== undefined && (
            <span className={`path-status ${decision.selectedPath ? 'selected' : 'rejected'}`}>
              {decision.selectedPath ? '✅ Selected' : '❌ Rejected'}
            </span>
          )}
        </div>
      </div>

      <div className="details-content">
        <div className="details-section">
          <h3>Description</h3>
          <div className="description">
            <ReactMarkdown>{decision.description}</ReactMarkdown>
          </div>
        </div>

        {decision.dependencies && decision.dependencies.length > 0 && (
          <div className="details-section">
            <h3>🔗 Dependencies</h3>
            <ul className="dependency-list">
              {decision.dependencies.map((dep) => (
                <li key={dep}>{dep}</li>
              ))}
            </ul>
          </div>
        )}

        {decision.externalDependencies && decision.externalDependencies.length > 0 && (
          <div className="details-section">
            <h3>🔗 External Dependencies</h3>
            <div className="external-dependencies">
              {decision.externalDependencies.map((extDep) => (
                <div key={extDep.id} className={`external-dependency ${isOverdue(extDep.expectedResolutionDate) ? 'overdue' : ''}`}>
                  <div className="ext-dep-header">
                    <h4>{extDep.title}</h4>
                    {extDep.expectedResolutionDate && (
                      <span className={`ext-dep-date ${isOverdue(extDep.expectedResolutionDate) ? 'overdue' : ''}`}>
                        {isOverdue(extDep.expectedResolutionDate) ? '⚠️ Overdue: ' : '📅 Due: '}
                        {extDep.expectedResolutionDate}
                      </span>
                    )}
                  </div>
                  {extDep.description && (
                    <div className="ext-dep-description">
                      <ReactMarkdown>{extDep.description}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {decision.prosCons && (
          (decision.prosCons.pros && decision.prosCons.pros.length > 0) ||
          (decision.prosCons.cons && decision.prosCons.cons.length > 0)
        ) && (
          <div className="details-section">
            <h3>⚖️ Pros & Cons Analysis</h3>
            <div className="pros-cons-container">
              {decision.prosCons.pros && decision.prosCons.pros.length > 0 && (
                <div className="pros-section">
                  <h4 className="pros-title">Pros</h4>
                  <div className="pros-cons-list">
                    {decision.prosCons.pros.map((pro) => (
                      <div key={pro.id} className="pros-cons-item pros">
                        <div className="item-header">
                          <span className="item-title">{pro.title}</span>
                          {renderImpactIndicator(pro.impact)}
                        </div>
                        {pro.description && (
                          <div className="item-description">
                            <ReactMarkdown>{pro.description}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {decision.prosCons.cons && decision.prosCons.cons.length > 0 && (
                <div className="cons-section">
                  <h4 className="cons-title">Cons</h4>
                  <div className="pros-cons-list">
                    {decision.prosCons.cons.map((con) => (
                      <div key={con.id} className="pros-cons-item cons">
                        <div className="item-header">
                          <span className="item-title">{con.title}</span>
                          {renderImpactIndicator(con.impact)}
                        </div>
                        {con.description && (
                          <div className="item-description">
                            <ReactMarkdown>{con.description}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {decision.drawIoUrl && (
          <div className="details-section">
            <h3>📊 Architecture Diagram</h3>
            <div className="diagram-link">
              <a href={decision.drawIoUrl} target="_blank" rel="noopener noreferrer">
                🎨 Open in Draw.io
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 