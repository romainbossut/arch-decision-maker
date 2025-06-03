# 🏗️ Architecture Decision Maker

A React 19 + Vite tool for visualizing architecture decisions from YAML files. This tool allows you to define architecture decision trees with dependencies, visualize them as interactive diagrams, and explore detailed information about each decision point.

## Features

- **📝 YAML Configuration**: Define decision trees using simple YAML syntax
- **🌳 Interactive Visualization**: View decisions as a connected tree diagram
- **🔗 Dependency Management**: Model dependencies between decisions
- **🔗 External Dependencies**: Track external blockers with expected resolution dates
- **⚖️ Pros & Cons Analysis**: Evaluate decisions with rated pros and cons (1-5 scale)
- **📋 Detailed Views**: Rich descriptions with Markdown support
- **🎨 Draw.io Integration**: Link to external architecture diagrams
- **✅ Validation**: Built-in validation for decision tree consistency
- **⚠️ Overdue Tracking**: Visual indicators for overdue external dependencies
- **⭐ Rating System**: Star-based rating system for pros and cons analysis
- **🎯 Path Selection**: Mark decision paths as selected (green) or rejected (red) for clear visualization

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arch-decision-maker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Testing

The project includes comprehensive tests using Vitest and React Testing Library.

### Running Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode (default)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes:

- **Unit tests** for utility functions (YAML parsing, validation)
- **Component tests** for React components (YamlEditor, DecisionDetails)
- **Integration tests** for the main App component
- **Type tests** to validate TypeScript interfaces

All core functionality is tested to ensure reliability and prevent regressions.

## YAML Format

The tool uses a specific YAML format to define architecture decision trees:

```yaml
name: "Your Architecture Decision Tree Name"
description: "Optional description of the decision tree"
decisions:
  - id: "unique-decision-id"
    title: "Human Readable Title"
    description: |
      Markdown formatted description of the decision.
      
      **You can use:**
      - Lists
      - **Bold text**
      - Code blocks
      - Links
    drawIoUrl: "https://app.diagrams.net/#G<your-diagram-id>"
    dependencies: ["other-decision-id"]
    selectedPath: true  # true = green, false = red, undefined = neutral
    
    # Auditable and traceable fields
    status: "accepted"  # proposed, accepted, rejected, deprecated
    owner: "platform-team"
    authors: ["john.doe", "jane.smith"]
    decisionDate: "2024-01-15"
    lastReviewed: "2024-03-01"
    supersedes: ["legacy-decision-id"]
    supersededBy: "newer-decision-id"
    tags: ["security", "performance", "cost"]
    riskLevel: "medium"  # low, medium, high
    costEstimate: "4-6 weeks development"
    
    # Related links
    links:
      - id: "rfc-001"
        title: "Architecture RFC"
        url: "https://company.atlassian.net/wiki/spaces/ARCH/pages/123456/RFC"
        type: "rfc"  # rfc, ticket, confluence, github, documentation, other
      - id: "comparison-doc"
        title: "Solution Comparison"
        url: "https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9"
        type: "documentation"
        
    # Implementation tracking
    implementationTasks:
      - id: "PROJ-123"
        title: "Set up infrastructure"
        url: "https://company.atlassian.net/browse/PROJ-123"
        status: "done"  # todo, in-progress, done, blocked
        assignee: "john.doe"
        dueDate: "2024-02-01"
      - id: "PROJ-124"
        title: "Configure security"
        url: "https://github.com/company/project/issues/124"
        status: "in-progress"
        assignee: "jane.smith"
        dueDate: "2024-02-15"
        
    externalDependencies:
      - id: "security-audit"
        title: "Security Audit Completion"
        description: "Complete security audit before production deployment"
        expectedResolutionDate: "2024-03-15"
        
    prosCons:
      pros:
        - id: "pro-1"
          title: "High Performance"
          description: "Significantly improves system performance"
          impact: high  # minor, major, high
        - id: "pro-2"
          title: "Easy to Maintain"
          impact: major
      cons:
        - id: "con-1"
          title: "High Initial Cost"
          description: "Requires significant upfront investment"
          impact: major
```

### Field Descriptions

#### Core Fields
- **`name`** (required): The name of your architecture decision tree
- **`description`** (optional): A description of what this decision tree represents
- **`decisions`** (required): Array of decision points

#### Decision Fields
- **`id`** (required): Unique identifier for the decision
- **`title`** (required): Human-readable title
- **`description`** (required): Detailed description (supports Markdown)
- **`drawIoUrl`** (optional): Link to a Draw.io diagram
- **`dependencies`** (optional): Array of decision IDs that this decision depends on
- **`selectedPath`** (optional): Boolean indicating if this path is chosen (true = green, false = red, undefined = neutral)

#### Auditable and Traceable Fields
- **`status`** (optional): Current state - `proposed`, `accepted`, `rejected`, or `deprecated`
- **`owner`** (optional): Who is accountable for shepherding or revisiting the decision
- **`authors`** (optional): Array of people who contributed to the decision
- **`decisionDate`** (optional): When the decision was made (YYYY-MM-DD format)
- **`lastReviewed`** (optional): When the decision was last reviewed (YYYY-MM-DD format)
- **`supersedes`** (optional): Array of decision IDs that this decision replaces
- **`supersededBy`** (optional): Decision ID that replaces this decision
- **`tags`** (optional): Array of tags for categorization (e.g., `security`, `performance`, `cost`)
- **`riskLevel`** (optional): Risk assessment - `low`, `medium`, or `high`
- **`costEstimate`** (optional): Free-form cost estimation (e.g., "2-3 weeks", "$50k", "High")

#### Links and Documentation
- **`links`** (optional): Array of related links
  - **`id`** (required): Unique identifier for the link
  - **`title`** (required): Human-readable title
  - **`url`** (required): The URL
  - **`type`** (optional): Type of link - `rfc`, `ticket`, `confluence`, `github`, `documentation`, or `other`

#### Implementation Tracking
- **`implementationTasks`** (optional): Array of implementation tasks
  - **`id`** (required): Unique identifier (e.g., JIRA ticket ID)
  - **`title`** (required): Task description
  - **`url`** (optional): Link to the task (JIRA, GitHub issue, etc.)
  - **`status`** (optional): Current status - `todo`, `in-progress`, `done`, or `blocked`
  - **`assignee`** (optional): Who is responsible for the task
  - **`dueDate`** (optional): Due date (YYYY-MM-DD format)

#### External Dependencies
- **`externalDependencies`** (optional): Array of external dependencies
  - **`id`** (required): Unique identifier for the external dependency
  - **`title`** (required): Human-readable title of the dependency
  - **`description`** (optional): Detailed description (supports Markdown)
  - **`expectedResolutionDate`** (optional): Expected resolution date in YYYY-MM-DD format

#### Pros and Cons Analysis
- **`prosCons`** (optional): Pros and cons analysis for the decision
  - **`pros`** (optional): Array of positive aspects
  - **`cons`** (optional): Array of negative aspects

For each pros/cons item:
- **`id`** (required): Unique identifier for the pros/cons item
- **`title`** (required): Human-readable title
- **`description`** (optional): Detailed description (supports Markdown)
- **`impact`** (required): Impact level - one of `minor`, `major`, or `high`

## Example Use Cases

### Microservices Architecture
```yaml
name: "Microservices Migration"
description: "Step-by-step decisions for migrating to microservices"
decisions:
  - id: "api-gateway"
    title: "Implement API Gateway"
    description: "Central entry point for all client requests"
    selectedPath: true
    externalDependencies:
      - id: "security-audit"
        title: "Security Audit"
        description: "Complete security review of gateway implementation"
        expectedResolutionDate: "2024-03-15"
    prosCons:
      pros:
        - id: "centralized-auth"
          title: "Centralized Authentication"
          description: "Single point for authentication management"
          impact: high
        - id: "load-balancing"
          title: "Load Balancing"
          description: "Built-in load balancing capabilities"
          impact: major
      cons:
        - id: "single-point-failure"
          title: "Single Point of Failure"
          description: "Gateway failure affects entire system"
          impact: high
        - id: "added-latency"
          title: "Additional Latency"
          description: "Extra network hop increases response time"
          impact: minor
    
  - id: "service-discovery"
    title: "Service Discovery"
    description: "Dynamic service registration and lookup"
    dependencies: ["api-gateway"]
    selectedPath: true
    externalDependencies:
      - id: "ops-training"
        title: "Operations Training"
        description: "Train ops team on service discovery tools"
        expectedResolutionDate: "2024-02-20"
    prosCons:
      pros:
        - id: "dynamic-registration"
          title: "Dynamic Registration"
          description: "Services automatically register themselves"
          rating: 5
      cons:
        - id: "complexity"
          title: "Added Complexity"
          description: "Additional infrastructure to manage"
          rating: 3
    
  - id: "database-separation"
    title: "Separate Databases"
    description: "Move to database-per-service pattern"
    dependencies: ["service-discovery"]
    selectedPath: false
    externalDependencies:
      - id: "dba-approval"
        title: "DBA Approval"
        description: "Database administrator approval for multiple DB instances"
        expectedResolutionDate: "2024-01-15"
    prosCons:
      pros:
        - id: "data-isolation"
          title: "Data Isolation"
          description: "Complete control over data schema"
          rating: 5
        - id: "independent-scaling"
          title: "Independent Scaling"
          description: "Scale databases independently"
          rating: 4
      cons:
        - id: "data-consistency"
          title: "Data Consistency"
          description: "Complex cross-service transactions"
          rating: 5
        - id: "operational-overhead"
          title: "Operational Overhead"
          description: "More databases to maintain"
          rating: 4
```

### Cloud Migration
```yaml
name: "Cloud Migration Strategy"
decisions:
  - id: "cloud-provider"
    title: "Choose Cloud Provider"
    description: "Select AWS, Azure, or GCP based on requirements"
    
  - id: "containerization"
    title: "Containerize Applications"
    description: "Package applications using Docker"
    dependencies: ["cloud-provider"]
    
  - id: "orchestration"
    title: "Container Orchestration"
    description: "Implement Kubernetes or similar"
    dependencies: ["containerization"]
```

## Technology Stack

- **React 19**: Latest React with modern features
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **ReactFlow**: Interactive diagrams and flowcharts
- **js-yaml**: YAML parsing
- **react-markdown**: Markdown rendering in descriptions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Save/load YAML files
- [ ] Export diagrams as images
- [ ] Multiple diagram views (tree, network, timeline)
- [ ] Collaborative editing
- [ ] Integration with ADR (Architecture Decision Records)
- [ ] Template gallery for common architectural patterns
