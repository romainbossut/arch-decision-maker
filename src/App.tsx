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
    status: accepted
    owner: "platform-team"
    authors: ["john.doe", "jane.smith"]
    decisionDate: "2024-01-15"
    lastReviewed: "2024-03-01"
    tags: ["infrastructure", "security", "performance"]
    riskLevel: medium
    costEstimate: "4-6 weeks development"
    links:
      - id: "rfc-001"
        title: "API Gateway RFC"
        url: "https://company.atlassian.net/wiki/spaces/ARCH/pages/123456/API+Gateway+RFC"
        type: "rfc"
      - id: "comparison-doc"
        title: "Gateway Solutions Comparison"
        url: "https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9"
        type: "documentation"
    implementationTasks:
      - id: "INFRA-123"
        title: "Set up Kong API Gateway in staging"
        url: "https://company.atlassian.net/browse/INFRA-123"
        status: "done"
        assignee: "john.doe"
        dueDate: "2024-02-01"
      - id: "INFRA-124"
        title: "Configure authentication plugins"
        url: "https://company.atlassian.net/browse/INFRA-124"
        status: "in-progress"
        assignee: "jane.smith"
        dueDate: "2024-02-15"
      - id: "INFRA-125"
        title: "Setup production environment"
        url: "https://company.atlassian.net/browse/INFRA-125"
        status: "todo"
        assignee: "bob.wilson"
        dueDate: "2024-03-01"
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
    status: proposed
    owner: "platform-team"
    authors: ["alice.cooper"]
    decisionDate: "2024-01-20"
    tags: ["infrastructure", "networking"]
    riskLevel: low
    costEstimate: "2-3 weeks development"
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
    status: rejected
    owner: "data-team"
    authors: ["chris.martinez", "diana.lee"]
    decisionDate: "2024-01-25"
    lastReviewed: "2024-02-15"
    tags: ["data", "architecture", "cost"]
    riskLevel: high
    costEstimate: "12-16 weeks migration"
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
    status: deprecated
    owner: "data-team"
    authors: ["emily.clark"]
    decisionDate: "2024-02-01"
    lastReviewed: "2024-03-10"
    tags: ["data", "architecture", "scalability"]
    riskLevel: high
    costEstimate: "8-10 weeks implementation"
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
    status: accepted
    owner: "sre-team"
    authors: ["frank.brown", "grace.kim"]
    decisionDate: "2024-02-05"
    tags: ["monitoring", "observability", "operations"]
    riskLevel: medium
    costEstimate: "6-8 weeks setup + ongoing costs"
    links:
      - id: "monitoring-rfc"
        title: "Monitoring Architecture RFC"
        url: "https://company.atlassian.net/wiki/spaces/SRE/pages/789012/Monitoring+RFC"
        type: "rfc"
      - id: "vendor-comparison"
        title: "Monitoring Vendor Comparison"
        url: "https://github.com/company/architecture-docs/blob/main/monitoring-comparison.md"
        type: "github"
    implementationTasks:
      - id: "MON-001"
        title: "Setup Prometheus + Grafana"
        url: "https://company.atlassian.net/browse/MON-001"
        status: "done"
        assignee: "frank.brown"
      - id: "MON-002"
        title: "Configure Jaeger for distributed tracing"
        url: "https://company.atlassian.net/browse/MON-002"
        status: "in-progress"
        assignee: "grace.kim"
        dueDate: "2024-03-15"
      - id: "MON-003"
        title: "Setup centralized logging with ELK stack"
        status: "blocked"
        assignee: "henry.wilson"
        dueDate: "2024-03-20"
    externalDependencies:
      - id: "monitoring-tools"
        title: "Monitoring Tools Procurement"
        description: "Procurement approval for monitoring and observability tools (Datadog, New Relic, etc.)."
        expectedResolutionDate: "2024-03-01"
      - id: "compliance-review"
        title: "Compliance Review"
        description: "Legal review of monitoring tools for GDPR and data privacy compliance."
        expectedResolutionDate: "2024-02-15"
        
  # Legacy decisions for reference
  - id: "legacy-dns-discovery"
    title: "Legacy DNS-based Service Discovery"
    description: "Old approach using DNS for service discovery"
    status: deprecated
    decisionDate: "2023-06-01"
    supersededBy: "service-discovery"
    tags: ["legacy", "deprecated"]
    
  - id: "shared-database-v2"
    title: "Shared Database Architecture v2"
    description: "Updated shared database approach with better isolation"
    status: proposed
    supersedes: ["database-per-service"]
    tags: ["data", "architecture"]`;

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
