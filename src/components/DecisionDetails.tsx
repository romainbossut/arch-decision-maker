import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { DecisionPoint, ProsConsItem } from '../types/architecture';
import './DecisionDetails.css';

interface DecisionDetailsProps {
  decision?: DecisionPoint;
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

function renderStarRating(rating: number): React.JSX.Element {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    );
  }
  return <div className="star-rating">{stars}</div>;
}

function calculateOverallScore(items: ProsConsItem[]): number {
  if (!items || items.length === 0) return 0;
  const totalRating = items.reduce((sum, item) => sum + item.rating, 0);
  return Math.round((totalRating / items.length) * 10) / 10; // Round to 1 decimal place
}

export default function DecisionDetails({ decision }: DecisionDetailsProps) {
  if (!decision) {
    return (
      <div className="decision-details">
        <div className="no-selection">
          <h3>Select a Decision Point</h3>
          <p>Click on a decision point in the tree to view its details.</p>
        </div>
      </div>
    );
  }

  const prosOverallScore = decision.prosCons?.pros ? calculateOverallScore(decision.prosCons.pros) : null;
  const consOverallScore = decision.prosCons?.cons ? calculateOverallScore(decision.prosCons.cons) : null;

  return (
    <div className="decision-details">
      <div className="decision-header">
        <h2>{decision.title}</h2>
        <div className="decision-id">ID: {decision.id}</div>
      </div>

      <div className="decision-content">
        <div className="description-section">
          <h3>Description</h3>
          <div className="description-content">
            <ReactMarkdown>{decision.description}</ReactMarkdown>
          </div>
        </div>

        {decision.dependencies && decision.dependencies.length > 0 && (
          <div className="dependencies-section">
            <h3>Internal Dependencies</h3>
            <ul className="dependencies-list">
              {decision.dependencies.map((depId) => (
                <li key={depId} className="dependency-item">
                  {depId}
                </li>
              ))}
            </ul>
          </div>
        )}

        {decision.externalDependencies && decision.externalDependencies.length > 0 && (
          <div className="external-dependencies-section">
            <h3>External Dependencies</h3>
            <div className="external-dependencies-list">
              {decision.externalDependencies.map((extDep) => (
                <div key={extDep.id} className="external-dependency-item">
                  <div className="external-dependency-header">
                    <h4 className="external-dependency-title">{extDep.title}</h4>
                    <span className="external-dependency-id">ID: {extDep.id}</span>
                  </div>
                  
                  {extDep.description && (
                    <div className="external-dependency-description">
                      <ReactMarkdown>{extDep.description}</ReactMarkdown>
                    </div>
                  )}
                  
                  {extDep.expectedResolutionDate && (
                    <div className={`external-dependency-date ${
                      isDateOverdue(extDep.expectedResolutionDate) ? 'overdue' : ''
                    }`}>
                      <span className="date-label">Expected Resolution:</span>
                      <span className="date-value">{formatDate(extDep.expectedResolutionDate)}</span>
                      {isDateOverdue(extDep.expectedResolutionDate) && (
                        <span className="overdue-indicator">⚠️ Overdue</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {decision.prosCons && ((decision.prosCons.pros && decision.prosCons.pros.length > 0) || (decision.prosCons.cons && decision.prosCons.cons.length > 0)) && (
          <div className="pros-cons-section">
            <h3>Pros & Cons Analysis</h3>
            
            <div className="pros-cons-container">
              {decision.prosCons.pros && decision.prosCons.pros.length > 0 && (
                <div className="pros-section">
                  <div className="pros-header">
                    <h4 className="pros-title">✅ Pros</h4>
                    {prosOverallScore && (
                      <div className="overall-score pros-score">
                        Overall: {prosOverallScore}/5
                      </div>
                    )}
                  </div>
                  <div className="pros-cons-list">
                    {decision.prosCons.pros.map((pro) => (
                      <div key={pro.id} className="pros-cons-item pros-item">
                        <div className="pros-cons-header">
                          <h5 className="pros-cons-title">{pro.title}</h5>
                          <div className="rating-container">
                            {renderStarRating(pro.rating)}
                            <span className="rating-value">{pro.rating}/5</span>
                          </div>
                        </div>
                        
                        {pro.description && (
                          <div className="pros-cons-description">
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
                  <div className="cons-header">
                    <h4 className="cons-title">❌ Cons</h4>
                    {consOverallScore && (
                      <div className="overall-score cons-score">
                        Overall: {consOverallScore}/5
                      </div>
                    )}
                  </div>
                  <div className="pros-cons-list">
                    {decision.prosCons.cons.map((con) => (
                      <div key={con.id} className="pros-cons-item cons-item">
                        <div className="pros-cons-header">
                          <h5 className="pros-cons-title">{con.title}</h5>
                          <div className="rating-container">
                            {renderStarRating(con.rating)}
                            <span className="rating-value">{con.rating}/5</span>
                          </div>
                        </div>
                        
                        {con.description && (
                          <div className="pros-cons-description">
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
          <div className="diagram-section">
            <h3>Architecture Diagram</h3>
            <div className="diagram-link">
              <a
                href={decision.drawIoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="diagram-button"
              >
                🎨 Open in Draw.io
              </a>
              <p className="diagram-description">
                Click the link above to view the architecture diagram for this decision.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 