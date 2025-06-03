import React, { useState, useEffect } from 'react';
import YamlEditor from './components/YamlEditor';
import DecisionTreeVisualization from './components/DecisionTreeVisualization';
import DecisionDetails from './components/DecisionDetails';
import { parseYamlContent, validateDecisionTree } from './utils/yamlParser';
import type { ArchitectureDecisionTree } from './types/architecture';
import './App.css';

const defaultYaml = `name: "Microservices Architecture Decision"
description: "Decisions for implementing a microservices architecture"
decisions:
  - id: "api-gateway"
    title: "API Gateway"
    description: |
      Implement an API Gateway to serve as a single entry point for all client requests.
      
      **Benefits:**
      - Centralized authentication and authorization
      - Request routing and load balancing
      - API versioning and rate limiting
      
      **Considerations:**
      - Additional complexity and potential single point of failure
      - Need for high availability setup
    drawIoUrl: "https://app.diagrams.net/#G1abc123def456"
    selectedPath: true
    externalDependencies:
      - id: "security-audit"
        title: "Security Audit Completion"
        description: "Complete security audit of the API Gateway implementation before production deployment."
        expectedResolutionDate: "2024-03-15"
      - id: "load-testing"
        title: "Load Testing Results"
        description: "Performance testing results to validate gateway can handle expected traffic load."
        expectedResolutionDate: "2024-02-28"
    prosCons:
      pros:
        - id: "centralized-auth"
          title: "Centralized Authentication"
          description: "Single point for managing authentication and authorization across all services."
          impact: high
        - id: "request-routing"
          title: "Intelligent Request Routing"
          description: "Advanced routing capabilities with load balancing and traffic management."
          impact: major
        - id: "api-versioning"
          title: "API Versioning Support"
          description: "Built-in support for API versioning and backward compatibility."
          impact: major
      cons:
        - id: "single-point-failure"
          title: "Single Point of Failure"
          description: "Gateway becomes a critical bottleneck that could impact entire system availability."
          impact: high
        - id: "added-complexity"
          title: "Operational Complexity"
          description: "Additional infrastructure component that requires monitoring and maintenance."
          impact: major
        - id: "latency-overhead"
          title: "Additional Latency"
          description: "Extra network hop introduces latency to all requests."
          impact: minor
    
  - id: "service-discovery"
    title: "Service Discovery"
    description: |
      Implement service discovery mechanism for dynamic service registration and lookup.
      
      **Options:**
      - Consul
      - Eureka
      - Kubernetes built-in service discovery
    dependencies: ["api-gateway"]
    selectedPath: true
    externalDependencies:
      - id: "ops-team-training"
        title: "Operations Team Training"
        description: "Ops team needs training on service discovery tools and troubleshooting."
        expectedResolutionDate: "2024-02-20"
    prosCons:
      pros:
        - id: "dynamic-registration"
          title: "Dynamic Service Registration"
          description: "Services can automatically register and deregister themselves."
          impact: high
        - id: "health-checking"
          title: "Health Checking"
          description: "Built-in health checking removes unhealthy instances from load balancing."
          impact: major
      cons:
        - id: "network-partitions"
          title: "Network Partition Handling"
          description: "Complex behavior during network partitions and split-brain scenarios."
          impact: major
        - id: "additional-dependency"
          title: "Additional Infrastructure Dependency"
          description: "Another piece of infrastructure that needs to be highly available."
          impact: major
    
  - id: "database-per-service"
    title: "Database per Service"
    description: |
      Each microservice owns its data and database schema.
      
      **Benefits:**
      - Data isolation and service autonomy
      - Technology diversity
      - Improved fault isolation
      
      **Challenges:**
      - Data consistency across services
      - Complex queries spanning multiple services
    dependencies: ["service-discovery"]
    selectedPath: false
    externalDependencies:
      - id: "dba-approval"
        title: "Database Administrator Approval"
        description: "DBA team approval for multiple database instances and backup strategies."
        expectedResolutionDate: "2024-01-15"
      - id: "data-migration-plan"
        title: "Data Migration Strategy"
        description: "Detailed plan for migrating existing monolithic database to service-specific databases."
    prosCons:
      pros:
        - id: "data-isolation"
          title: "Complete Data Isolation"
          description: "Each service has full control over its data schema and storage technology."
          impact: high
        - id: "independent-scaling"
          title: "Independent Scaling"
          description: "Database scaling can be tailored to each service's specific needs."
          impact: major
        - id: "fault-isolation"
          title: "Fault Isolation"
          description: "Database issues in one service don't affect others."
          impact: major
      cons:
        - id: "data-consistency"
          title: "Data Consistency Challenges"
          description: "Implementing transactions across multiple databases is complex."
          impact: high
        - id: "operational-overhead"
          title: "Increased Operational Overhead"
          description: "More databases to monitor, backup, and maintain."
          impact: major
        - id: "complex-queries"
          title: "Cross-Service Queries"
          description: "Queries spanning multiple services become much more complex."
          impact: major
    
  - id: "event-sourcing"
    title: "Event Sourcing"
    description: |
      Implement event sourcing for maintaining service state and ensuring data consistency.
      
      **Benefits:**
      - Complete audit trail
      - Temporal queries
      - Scalability
      
      **Complexity:**
      - Learning curve
      - Event store management
    dependencies: ["database-per-service"]
    selectedPath: true
    externalDependencies:
      - id: "event-store-license"
        title: "Event Store License"
        description: "Purchase enterprise license for Event Store database."
        expectedResolutionDate: "2024-04-01"
    
  - id: "monitoring"
    title: "Distributed Monitoring"
    description: |
      Implement comprehensive monitoring and observability across all services.
      
      **Components:**
      - Centralized logging
      - Distributed tracing
      - Metrics collection
      - Health checks
    dependencies: ["service-discovery"]
    selectedPath: true
    externalDependencies:
      - id: "monitoring-tools"
        title: "Monitoring Tools Procurement"
        description: "Procurement approval for monitoring and observability tools (Datadog, New Relic, etc.)."
        expectedResolutionDate: "2024-03-01"
      - id: "compliance-review"
        title: "Compliance Review"
        description: "Legal review of monitoring tools for GDPR and data privacy compliance."
        expectedResolutionDate: "2024-02-15"`;

function App() {
  const [yamlContent, setYamlContent] = useState(defaultYaml);
  const [tree, setTree] = useState<ArchitectureDecisionTree | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>();
  const [errors, setErrors] = useState<string[]>([]);
  const [isYamlCollapsed, setIsYamlCollapsed] = useState(true);
  const [isParsing, setIsParsing] = useState(false);

  // Auto-parse YAML with debounce when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsParsing(true);
      try {
        const parsedTree = parseYamlContent(yamlContent);
        const validationErrors = validateDecisionTree(parsedTree);
        
        if (validationErrors.length === 0) {
          setTree(parsedTree);
          setErrors([]);
          setSelectedDecisionId(undefined);
        } else {
          setErrors(validationErrors);
          setTree(null);
        }
      } catch (error) {
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏗️ Architecture Decision Maker</h1>
        <p>Visualize and explore architecture decisions and their dependencies</p>
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
