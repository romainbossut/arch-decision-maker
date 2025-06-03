import React, { useState, useCallback } from 'react';
import './YamlEditor.css';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  errors?: string[];
}

export default function YamlEditor({ value, onChange, onParse, errors }: YamlEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

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
          <button onClick={onParse} className="parse-button">
            Update Tree
          </button>
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