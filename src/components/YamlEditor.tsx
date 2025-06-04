import React, { useState, useCallback } from 'react';
import './YamlEditor.css';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  isParsing?: boolean;
  isValid?: boolean;
  resetToDefault?: () => void;
}

export default function YamlEditor({ value, onChange, errors, isParsing, isValid, resetToDefault }: YamlEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const getStatusIndicator = () => {
    if (isParsing) {
      return <span className="auto-update-indicator parsing">🔄 Parsing...</span>;
    } else if (isValid) {
      return <span className="auto-update-indicator valid">✅ Valid</span>;
    } else {
      return <span className="auto-update-indicator invalid">❌ Invalid</span>;
    }
  };

  const handleReset = () => {
    if (resetToDefault && window.confirm('Are you sure you want to reset to the default YAML? This will overwrite your current configuration.')) {
      resetToDefault();
    }
  };

  return (
    <div className="yaml-editor">
      <div className="editor-header">
        <h3>YAML Configuration</h3>
        <div className="editor-controls">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-button"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {resetToDefault && (
            <button
              onClick={handleReset}
              className="reset-button"
              title="Reset to default example"
            >
              🔄 Reset to Default
            </button>
          )}
          {getStatusIndicator()}
        </div>
      </div>

      <div className={`editor-content ${isExpanded ? 'expanded' : ''}`}>
        <textarea
          value={value}
          onChange={handleInputChange}
          placeholder="Paste your YAML configuration here..."
          spellCheck={false}
        />

        {errors && errors.length > 0 && (
          <div className="error-list">
            <h4>Validation Errors:</h4>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 