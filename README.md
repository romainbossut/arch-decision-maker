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
    externalDependencies:
      - id: "external-dep-1"
        title: "Security Audit"
        description: "Security review must be completed before implementation"
        expectedResolutionDate: "2024-03-15"
      - id: "external-dep-2"
        title: "Budget Approval"
        description: "Finance approval for additional infrastructure costs"
        expectedResolutionDate: "2024-02-28"
    prosCons:
      pros:
        - id: "pro-1"
          title: "High Performance"
          description: "Significantly improves system performance"
          rating: 5
        - id: "pro-2"
          title: "Easy to Maintain"
          description: "Reduces maintenance overhead"
          rating: 4
      cons:
        - id: "con-1"
          title: "High Initial Cost"
          description: "Requires significant upfront investment"
          rating: 3
        - id: "con-2"
          title: "Learning Curve"
          description: "Team needs time to learn new technology"
          rating: 2
    
  - id: "another-decision"
    title: "Another Decision"
    description: "This decision depends on the first one"
    dependencies: ["unique-decision-id"]
    selectedPath: true
```

### Field Descriptions

- **`name`** (required): The name of your architecture decision tree
- **`description`** (optional): A description of what this decision tree represents
- **`decisions`** (required): Array of decision points

For each decision:
- **`id`** (required): Unique identifier for the decision
- **`title`** (required): Human-readable title
- **`description`** (required): Detailed description (supports Markdown)
- **`drawIoUrl`** (optional): Link to a Draw.io diagram
- **`dependencies`** (optional): Array of decision IDs that this decision depends on
- **`selectedPath`** (optional): Boolean indicating if this path is chosen (true = green, false = red, undefined = neutral)
- **`externalDependencies`** (optional): Array of external dependencies
- **`prosCons`** (optional): Pros and cons analysis for the decision

For each external dependency:
- **`id`** (required): Unique identifier for the external dependency
- **`title`** (required): Human-readable title of the dependency
- **`description`** (optional): Detailed description (supports Markdown)
- **`expectedResolutionDate`** (optional): Expected resolution date in YYYY-MM-DD format

For pros and cons:
- **`pros`** (optional): Array of positive aspects
- **`cons`** (optional): Array of negative aspects

For each pros/cons item:
- **`id`** (required): Unique identifier for the pros/cons item
- **`title`** (required): Human-readable title
- **`description`** (optional): Detailed description (supports Markdown)
- **`rating`** (required): Impact rating from 1 (low) to 5 (high)

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
          rating: 5
        - id: "load-balancing"
          title: "Load Balancing"
          description: "Built-in load balancing capabilities"
          rating: 4
      cons:
        - id: "single-point-failure"
          title: "Single Point of Failure"
          description: "Gateway failure affects entire system"
          rating: 4
        - id: "added-latency"
          title: "Additional Latency"
          description: "Extra network hop increases response time"
          rating: 2
    
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
