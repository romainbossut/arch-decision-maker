import { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import './YamlEditor.css';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  isParsing?: boolean;
  isValid?: boolean;
  resetToDefault?: () => void;
}

interface ParsedError {
  line: number;
  column?: number;
  message: string;
}

export default function YamlEditor({ value, onChange, errors, isParsing, isValid, resetToDefault }: YamlEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const parseErrorLocation = (error: string): ParsedError | null => {
    // Try to extract line numbers from various error formats
    const patterns = [
      /line (\d+)/i,
      /at line (\d+)/i,
      /\((\d+):(\d+)\)/,  // (line:column)
      /position (\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = error.match(pattern);
      if (match) {
        const line = parseInt(match[1], 10);
        const column = match[2] ? parseInt(match[2], 10) : 1;
        return { line, column, message: error };
      }
    }

    return { line: 1, column: 1, message: error };
  };

  const updateErrorMarkers = useCallback(() => {
    if (!editorRef.current || !monacoRef.current || !errors) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: any[] = errors.map((error) => {
      const parsed = parseErrorLocation(error);
      return {
        severity: monacoRef.current!.MarkerSeverity.Error,
        startLineNumber: parsed?.line || 1,
        startColumn: parsed?.column || 1,
        endLineNumber: parsed?.line || 1,
        endColumn: parsed?.column ? parsed.column + 10 : 100,
        message: parsed?.message || error,
        source: 'yaml-validator'
      };
    });

    monacoRef.current.editor.setModelMarkers(model, 'yaml-validator', markers);
  }, [errors]);

  useEffect(() => {
    updateErrorMarkers();
  }, [updateErrorMarkers]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Monaco Editor provides basic YAML syntax highlighting by default

    // Set up editor options
    editor.updateOptions({
      minimap: { enabled: false },
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
    });

    updateErrorMarkers();
  };

  const handleInputChange = useCallback((value: string | undefined) => {
    onChange(value || '');
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

  const formatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className="yaml-editor">
      <div className="editor-header">
        <h3>YAML Configuration</h3>
        <div className="editor-controls">
          <button
            onClick={formatDocument}
            className="format-button"
            title="Format YAML"
          >
            📝 Format
          </button>
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
        <div className="monaco-editor-container">
          <Editor
            height={isExpanded ? "600px" : "300px"}
            defaultLanguage="yaml"
            value={value}
            onChange={handleInputChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
              glyphMargin: true,
              folding: true,
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              insertSpaces: true,
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
            }}
          />
        </div>

        {errors && errors.length > 0 && (
          <div className="error-list">
            <h4>Validation Errors:</h4>
            <ul>
              {errors.map((error, index) => {
                const parsed = parseErrorLocation(error);
                return (
                  <li key={index} className="error-item">
                    <span className="error-location">Line {parsed?.line || '?'}:</span>
                    <span className="error-message">{parsed?.message || error}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 