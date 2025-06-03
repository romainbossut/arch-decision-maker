import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DecisionDetails from '../DecisionDetails';
import type { DecisionPoint } from '../../types/architecture';

describe('DecisionDetails', () => {
  const mockDecision: DecisionPoint = {
    id: 'test-decision',
    title: 'Test Decision',
    description: 'This is a **test** decision with markdown',
    dependencies: ['dep-1', 'dep-2'],
    drawIoUrl: 'https://app.diagrams.net/#G123',
    children: []
  };

  const mockDecisionWithExternalDeps: DecisionPoint = {
    id: 'test-decision-ext',
    title: 'Test Decision with External Dependencies',
    description: 'This decision has external dependencies',
    externalDependencies: [
      {
        id: 'ext-dep-1',
        title: 'Security Audit',
        description: 'Complete security review',
        expectedResolutionDate: '2025-12-25'
      },
      {
        id: 'ext-dep-2',
        title: 'Budget Approval',
        description: 'Finance team approval',
        expectedResolutionDate: '2020-01-01' // Overdue date
      },
      {
        id: 'ext-dep-3',
        title: 'Simple External Dependency',
        // No description or date
      }
    ],
    children: []
  };

  const mockDecisionWithProsCons: DecisionPoint = {
    id: 'test-decision-pros-cons',
    title: 'Test Decision with Pros and Cons',
    description: 'This decision has pros and cons analysis',
    prosCons: {
      pros: [
        {
          id: 'pro-1',
          title: 'Great Performance',
          description: 'Significantly improves system performance',
          impact: 'high'
        },
        {
          id: 'pro-2',
          title: 'Easy to Use',
          impact: 'major'
        }
      ],
      cons: [
        {
          id: 'con-1',
          title: 'High Cost',
          description: 'Expensive to implement and maintain',
          impact: 'major'
        },
        {
          id: 'con-2',
          title: 'Learning Curve',
          impact: 'minor'
        }
      ]
    },
    children: []
  };

  it('renders no selection message when no decision provided', () => {
    render(<DecisionDetails />);

    expect(screen.getByText('Select a Decision Point or External Dependency')).toBeInTheDocument();
    expect(screen.getByText('Click on any node in the tree to see detailed information.')).toBeInTheDocument();
  });

  it('renders decision details when decision is provided', () => {
    render(<DecisionDetails decision={mockDecision} />);

    expect(screen.getByRole('heading', { name: /test decision/i })).toBeInTheDocument();
    expect(screen.getByText('ID: test-decision')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders internal dependencies when decision has dependencies', () => {
    render(<DecisionDetails decision={mockDecision} />);

    expect(screen.getByText('🔗 Dependencies')).toBeInTheDocument();
    expect(screen.getByText('dep-1')).toBeInTheDocument();
    expect(screen.getByText('dep-2')).toBeInTheDocument();
  });

  it('does not render dependencies section when decision has no dependencies', () => {
    const decisionWithoutDeps = { ...mockDecision, dependencies: undefined };
    render(<DecisionDetails decision={decisionWithoutDeps} />);

    expect(screen.queryByText('🔗 Dependencies')).not.toBeInTheDocument();
  });

  it('renders external dependencies when decision has external dependencies', () => {
    render(<DecisionDetails decision={mockDecisionWithExternalDeps} />);

    expect(screen.getByText('🔗 External Dependencies')).toBeInTheDocument();
    expect(screen.getByText('Security Audit')).toBeInTheDocument();
    expect(screen.getByText('Budget Approval')).toBeInTheDocument();
    expect(screen.getByText('Simple External Dependency')).toBeInTheDocument();
  });

  it('renders external dependency descriptions when provided', () => {
    render(<DecisionDetails decision={mockDecisionWithExternalDeps} />);

    expect(screen.getByText('Complete security review')).toBeInTheDocument();
    expect(screen.getByText('Finance team approval')).toBeInTheDocument();
  });

  it('renders expected resolution dates in formatted form', () => {
    render(<DecisionDetails decision={mockDecisionWithExternalDeps} />);

    expect(screen.getByText(/2025-12-25/)).toBeInTheDocument();
    expect(screen.getByText(/2020-01-01/)).toBeInTheDocument();
  });

  it('shows overdue indicator for past dates', () => {
    render(<DecisionDetails decision={mockDecisionWithExternalDeps} />);

    expect(screen.getByText(/⚠️ Overdue:/)).toBeInTheDocument();
  });

  it('does not render external dependencies section when decision has no external dependencies', () => {
    render(<DecisionDetails decision={mockDecision} />);

    expect(screen.queryByText('🔗 External Dependencies')).not.toBeInTheDocument();
  });

  it('handles external dependencies without expected resolution date', () => {
    const decisionWithMinimalExtDep: DecisionPoint = {
      id: 'test-minimal',
      title: 'Test Minimal',
      description: 'Test decision',
      externalDependencies: [
        {
          id: 'ext-dep-minimal',
          title: 'Minimal External Dependency'
        }
      ],
      children: []
    };

    render(<DecisionDetails decision={decisionWithMinimalExtDep} />);

    expect(screen.getByText('Minimal External Dependency')).toBeInTheDocument();
    expect(screen.queryByText(/📅 Due:/)).not.toBeInTheDocument();
  });

  it('renders draw.io link when provided', () => {
    render(<DecisionDetails decision={mockDecision} />);

    expect(screen.getByText('📊 Architecture Diagram')).toBeInTheDocument();
    expect(screen.getByText('🎨 Open in Draw.io')).toBeInTheDocument();
    
    const link = screen.getByRole('link', { name: /open in draw\.io/i });
    expect(link).toHaveAttribute('href', 'https://app.diagrams.net/#G123');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('does not render diagram section when no draw.io URL provided', () => {
    const decisionWithoutDiagram = { ...mockDecision, drawIoUrl: undefined };
    render(<DecisionDetails decision={decisionWithoutDiagram} />);

    expect(screen.queryByText('📊 Architecture Diagram')).not.toBeInTheDocument();
    expect(screen.queryByText('🎨 Open in Draw.io')).not.toBeInTheDocument();
  });

  it('renders markdown content in description', () => {
    render(<DecisionDetails decision={mockDecision} />);

    // Check if markdown is rendered (bold text should become <strong>)
    const description = screen.getByText('test');
    expect(description).toBeInTheDocument();
  });

  it('renders pros and cons when decision has pros and cons', () => {
    render(<DecisionDetails decision={mockDecisionWithProsCons} />);

    expect(screen.getByText('⚖️ Pros & Cons Analysis')).toBeInTheDocument();
    expect(screen.getByText('Pros')).toBeInTheDocument();
    expect(screen.getByText('Cons')).toBeInTheDocument();
    
    // Check pros
    expect(screen.getByText('Great Performance')).toBeInTheDocument();
    expect(screen.getByText('Easy to Use')).toBeInTheDocument();
    expect(screen.getByText('Significantly improves system performance')).toBeInTheDocument();
    
    // Check cons
    expect(screen.getByText('High Cost')).toBeInTheDocument();
    expect(screen.getByText('Learning Curve')).toBeInTheDocument();
    expect(screen.getByText('Expensive to implement and maintain')).toBeInTheDocument();
  });

  it('renders impact indicators for pros and cons', () => {
    render(<DecisionDetails decision={mockDecisionWithProsCons} />);

    // Check impact displays
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getAllByText('Major')).toHaveLength(2);
    expect(screen.getByText('Minor')).toBeInTheDocument();
  });

  it('renders overall scores for pros and cons', () => {
    // This test is no longer applicable with impact levels
    // Just ensure the component renders without errors
    render(<DecisionDetails decision={mockDecisionWithProsCons} />);
    expect(screen.getByText('⚖️ Pros & Cons Analysis')).toBeInTheDocument();
  });

  it('handles decision with only pros', () => {
    const decisionWithOnlyPros: DecisionPoint = {
      id: 'test-pros-only',
      title: 'Test Pros Only',
      description: 'Test decision',
      prosCons: {
        pros: [
          {
            id: 'pro-1',
            title: 'Great Feature',
            impact: 'high'
          }
        ]
      },
      children: []
    };

    render(<DecisionDetails decision={decisionWithOnlyPros} />);

    expect(screen.getByText('⚖️ Pros & Cons Analysis')).toBeInTheDocument();
    expect(screen.getByText('Pros')).toBeInTheDocument();
    expect(screen.getByText('Great Feature')).toBeInTheDocument();
    expect(screen.queryByText('Cons')).not.toBeInTheDocument();
  });

  it('handles decision with only cons', () => {
    const decisionWithOnlyCons: DecisionPoint = {
      id: 'test-cons-only',
      title: 'Test Cons Only',
      description: 'Test decision',
      prosCons: {
        cons: [
          {
            id: 'con-1',
            title: 'Major Issue',
            impact: 'major'
          }
        ]
      },
      children: []
    };

    render(<DecisionDetails decision={decisionWithOnlyCons} />);

    expect(screen.getByText('⚖️ Pros & Cons Analysis')).toBeInTheDocument();
    expect(screen.getByText('Cons')).toBeInTheDocument();
    expect(screen.getByText('Major Issue')).toBeInTheDocument();
    expect(screen.queryByText('Pros')).not.toBeInTheDocument();
  });

  it('does not render pros and cons section when decision has no pros and cons', () => {
    render(<DecisionDetails decision={mockDecision} />);

    expect(screen.queryByText('⚖️ Pros & Cons Analysis')).not.toBeInTheDocument();
  });

  it('handles pros and cons without descriptions', () => {
    const decisionWithoutDescriptions: DecisionPoint = {
      id: 'test-no-desc',
      title: 'Test No Descriptions',
      description: 'Test decision',
      prosCons: {
        pros: [
          {
            id: 'pro-no-desc',
            title: 'Pro without Description',
            impact: 'major'
          }
        ],
        cons: [
          {
            id: 'con-no-desc',
            title: 'Con without Description',
            impact: 'minor'
          }
        ]
      },
      children: []
    };

    render(<DecisionDetails decision={decisionWithoutDescriptions} />);

    expect(screen.getByText('Pro without Description')).toBeInTheDocument();
    expect(screen.getByText('Con without Description')).toBeInTheDocument();
    expect(screen.getByText('Major')).toBeInTheDocument();
    expect(screen.getByText('Minor')).toBeInTheDocument();
  });

  it('handles empty pros and cons arrays', () => {
    const decisionWithEmptyProsCons: DecisionPoint = {
      id: 'test-empty',
      title: 'Test Empty',
      description: 'Test decision',
      prosCons: {
        pros: [],
        cons: []
      },
      children: []
    };

    render(<DecisionDetails decision={decisionWithEmptyProsCons} />);

    expect(screen.queryByText('⚖️ Pros & Cons Analysis')).not.toBeInTheDocument();
  });
}); 