import React, { useState, useEffect } from 'react';
import YamlEditor from './components/YamlEditor';
import DecisionTreeVisualization from './components/DecisionTreeVisualization';
import DecisionDetails from './components/DecisionDetails';
import { parseYamlContent, validateDecisionTree } from './utils/yamlParser';
import type { ArchitectureDecisionTree } from './types/architecture';
import './App.css';

const DEFAULT_YAML = `name: "API Architecture Decision Tree"
description: "Decisions for our new API architecture"

decisions:
  - id: "api-gateway"
    title: "API Gateway"
    description: "Central entry point for all API requests with routing, authentication, and rate limiting capabilities."
    status: "accepted"
    owner: "john.doe@company.com"
    authors: ["john.doe@company.com", "jane.smith@company.com"]
    decisionDate: "2024-01-15"
    riskLevel: "medium"
    tags: ["infrastructure", "security"]
    costEstimate: "2-3 weeks development"
    drawIoUrl: "https://app.diagrams.net/#G1abc123def456ghi789jkl"
    prosCons:
      pros:
        - id: "centralized-auth"
          title: "Centralized Authentication"
          description: "Single point for authentication and authorization logic"
          impact: "major"
        - id: "rate-limiting"
          title: "Built-in Rate Limiting"
          description: "Protects backend services from abuse"
          impact: "high"
      cons:
        - id: "single-point-failure"
          title: "Single Point of Failure"
          description: "Gateway outage affects all services"
          impact: "high"
        - id: "additional-latency"
          title: "Additional Network Hop"
          description: "Introduces extra latency in request chain"
          impact: "minor"
    links:
      - id: "gateway-rfc"
        title: "API Gateway RFC"
        url: "https://company.atlassian.net/wiki/spaces/ARCH/pages/123456"
        type: "rfc"
      - id: "security-review"
        title: "Security Review Ticket"
        url: "https://company.atlassian.net/browse/SEC-789"
        type: "ticket"
    implementationTasks:
      - id: "setup-gateway"
        title: "Set up Kong API Gateway"
        status: "done"
        assignee: "john.doe@company.com"
        dueDate: "2024-02-01"
      - id: "auth-integration"
        title: "Integrate with OAuth2 provider"
        status: "in-progress"
        assignee: "jane.smith@company.com"
        dueDate: "2024-02-15"

  - id: "service-discovery"
    title: "Service Discovery"
    description: "Mechanism for services to find and communicate with each other in a dynamic environment."
    status: "accepted"
    dependencies: ["api-gateway"]
    riskLevel: "low"
    tags: ["infrastructure", "networking"]
    externalDependencies:
      - id: "consul-cluster"
        title: "Consul Cluster Setup"
        description: "HashiCorp Consul cluster for service discovery"
        expectedResolutionDate: "2024-03-01"
    prosCons:
      pros:
        - id: "dynamic-scaling"
          title: "Dynamic Service Scaling"
          description: "Services can scale up/down without manual configuration"
          impact: "major"
      cons:
        - id: "complexity"
          title: "Added Complexity"
          description: "Requires additional infrastructure management"
          impact: "minor"

  - id: "database-per-service"
    title: "Database per Service"
    description: "Each microservice maintains its own database to ensure loose coupling and independent scaling."
    status: "rejected"
    dependencies: ["service-discovery"]
    riskLevel: "high"
    tags: ["data", "architecture"]
    prosCons:
      pros:
        - id: "data-isolation"
          title: "Data Isolation"
          description: "Services cannot directly access other services' data"
          impact: "major"
      cons:
        - id: "data-consistency"
          title: "Data Consistency Challenges"
          description: "Distributed transactions become complex"
          impact: "high"
        - id: "operational-overhead"
          title: "Operational Overhead"
          description: "More databases to manage and monitor"
          impact: "major"

  - id: "data-sync-service"
    title: "Data Synchronization Service"
    description: "Service to handle data synchronization between microservice databases."
    status: "proposed"
    dependencies: ["database-per-service"]
    riskLevel: "medium"
    tags: ["data", "synchronization"]
    prosCons:
      pros:
        - id: "centralized-sync"
          title: "Centralized Sync Logic"
          description: "Single place to manage data synchronization"
          impact: "major"
      cons:
        - id: "complexity"
          title: "Additional Complexity"
          description: "Another service to maintain and monitor"
          impact: "minor"

  - id: "microservice-orchestration"
    title: "Microservice Orchestration Layer"
    description: "Orchestration layer to coordinate complex business processes across microservices."
    status: "proposed"
    dependencies: ["data-sync-service"]
    riskLevel: "high"
    tags: ["orchestration", "architecture"]

  - id: "monitoring"
    title: "Distributed Monitoring"
    description: "Comprehensive monitoring solution for distributed services with metrics, logs, and tracing."
    status: "accepted"
    dependencies: ["service-discovery"]
    riskLevel: "medium"
    tags: ["monitoring", "observability"]
    externalDependencies:
      - id: "datadog-setup"
        title: "DataDog Integration"
        description: "Set up DataDog for metrics and alerting"
        expectedResolutionDate: "2024-02-20"
      - id: "elk-stack"
        title: "ELK Stack Deployment"
        description: "Deploy Elasticsearch, Logstash, and Kibana"
        expectedResolutionDate: "2024-02-25"

  - id: "event-sourcing"
    title: "Event Sourcing"
    description: "Store all changes as a sequence of events rather than just current state."
    status: "deprecated"
    dependencies: ["monitoring"]
    riskLevel: "high"
    tags: ["data", "architecture"]

  - id: "shared-database-v2"
    title: "Shared Database v2"
    description: "Updated shared database approach with better partitioning and access controls."
    status: "proposed"
    tags: ["data", "architecture"]
    supersedes: ["database-per-service"]`;

const STORAGE_KEY = 'arch-decision-maker-yaml';

// Function to load YAML from localStorage or return default
function loadYamlFromStorage(): string {
  try {
    const storedYaml = localStorage.getItem(STORAGE_KEY);
    return storedYaml || DEFAULT_YAML;
  } catch (error) {
    console.warn('Failed to load YAML from localStorage:', error);
    return DEFAULT_YAML;
  }
}

// Function to save YAML to localStorage
function saveYamlToStorage(yamlContent: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, yamlContent);
  } catch (error) {
    console.warn('Failed to save YAML to localStorage:', error);
  }
}

function App() {
  const [yamlContent, setYamlContent] = useState(() => loadYamlFromStorage());
  const [tree, setTree] = useState<ArchitectureDecisionTree | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>();
  const [errors, setErrors] = useState<string[]>([]);
  const [isYamlCollapsed, setIsYamlCollapsed] = useState(true);
  const [isParsing, setIsParsing] = useState(false);

  // Save YAML to localStorage whenever it changes
  useEffect(() => {
    saveYamlToStorage(yamlContent);
  }, [yamlContent]);

  // Auto-parse YAML with debounce when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsParsing(true);
      console.log('🔍 Starting YAML parsing...');
      try {
        const parsedTree = parseYamlContent(yamlContent);
        console.log('✅ YAML parsed successfully:', parsedTree.name);
        console.log('📊 Number of decisions:', Object.keys(parsedTree.decisions).length);
        
        const validationErrors = validateDecisionTree(parsedTree);
        console.log('🔎 Validation completed, errors:', validationErrors.length);
        
        if (validationErrors.length === 0) {
          console.log('✅ No validation errors, setting tree');
          setTree(parsedTree);
          setErrors([]);
          setSelectedDecisionId(undefined);
        } else {
          console.log('❌ Validation errors found:', validationErrors);
          validationErrors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
          });
          setErrors(validationErrors);
          setTree(null);
        }
      } catch (error) {
        console.error('❌ YAML parsing failed:', error);
        setErrors([error instanceof Error ? error.message : 'Unknown parsing error']);
        setTree(null);
      } finally {
        setIsParsing(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [yamlContent]); // Direct dependency on yamlContent

  // Parse selected item (decision or external dependency)
  const selectedItem = React.useMemo(() => {
    if (!tree || !selectedDecisionId) return null;

    // Check if it's a regular decision
    if (tree.decisions[selectedDecisionId]) {
      return { 
        type: 'decision' as const, 
        data: tree.decisions[selectedDecisionId] 
      };
    }

    // Check if it's an external dependency (format: decisionId-ext-depId)
    if (selectedDecisionId.includes('-ext-')) {
      const [parentDecisionId, , extDepId] = selectedDecisionId.split('-ext-');
      const parentDecision = tree.decisions[parentDecisionId];
      
      if (parentDecision?.externalDependencies) {
        const extDep = parentDecision.externalDependencies.find(dep => dep.id === extDepId);
        if (extDep) {
          return {
            type: 'externalDependency' as const,
            data: extDep,
            parentDecisionId
          };
        }
      }
    }

    return null;
  }, [tree, selectedDecisionId]);

  const toggleYamlSection = () => {
    setIsYamlCollapsed(!isYamlCollapsed);
  };

  const resetToDefault = () => {
    setYamlContent(DEFAULT_YAML);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏗️ Architecture Decision Maker</h1>
        <p>Visualize and explore architecture decisions and their dependencies</p>
        <div className="auto-save-status">
          💾 Auto-saves to browser storage
        </div>
      </header>

      <div className="app-content">
        <div className={`yaml-section ${isYamlCollapsed ? 'collapsed' : ''}`}>
          {!isYamlCollapsed && (
            <YamlEditor
              value={yamlContent}
              onChange={setYamlContent}
              errors={errors}
              isParsing={isParsing}
              isValid={tree !== null && errors.length === 0}
              resetToDefault={resetToDefault}
            />
          )}

          {tree && (
            <div className="tree-info">
              <div className="tree-info-content">
                <h3>{tree.name}</h3>
                {tree.description && <p>{tree.description}</p>}
                <div className="stats">
                  <span>📊 {Object.keys(tree.decisions).length} decisions</span>
                  <span>🌱 {tree.rootDecisions.length} root decisions</span>
                </div>
              </div>
              <button 
                onClick={toggleYamlSection}
                className="yaml-toggle-btn"
              >
                {isYamlCollapsed ? '📝 Edit YAML' : '🗂️ Collapse'}
              </button>
            </div>
          )}

          {!tree && !isYamlCollapsed && (
            <button 
              onClick={toggleYamlSection}
              className="yaml-toggle-btn"
              style={{ marginTop: '16px' }}
            >
              🗂️ Collapse
            </button>
          )}
        </div>

        <div className="chart-section">
          {tree ? (
            <DecisionTreeVisualization
              tree={tree}
              selectedDecisionId={selectedDecisionId}
              onDecisionSelect={setSelectedDecisionId}
            />
          ) : (
            <div className="empty-state">
              <h3>No valid decision tree</h3>
              <p>Please fix the YAML configuration to see the visualization.</p>
              {isYamlCollapsed && (
                <button 
                  onClick={toggleYamlSection}
                  className="yaml-toggle-btn"
                  style={{ marginTop: '16px' }}
                >
                  📝 Edit YAML
                </button>
              )}
            </div>
          )}
        </div>

        {selectedItem && (
          <div className="details-section">
            {selectedItem.type === 'decision' ? (
              <DecisionDetails decision={selectedItem.data} />
            ) : (
              <DecisionDetails 
                externalDependency={selectedItem.data}
                parentDecisionId={selectedItem.parentDecisionId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
