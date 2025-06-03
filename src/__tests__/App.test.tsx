import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock ReactFlow to avoid rendering issues in tests
vi.mock('reactflow', () => ({
  default: () => <div data-testid="reactflow-mock">Mocked ReactFlow</div>,
  addEdge: vi.fn(),
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
  Controls: () => <div>Controls</div>,
  Background: () => <div>Background</div>,
  BackgroundVariant: { Dots: 'dots' },
  Handle: () => <div>Handle</div>,
  Position: { Top: 'top', Bottom: 'bottom' }
}));

describe('App', () => {
  it('renders the main header', () => {
    render(<App />);

    expect(screen.getByText('🏗️ Architecture Decision Maker')).toBeInTheDocument();
    expect(screen.getByText('Visualize and explore architecture decisions and their dependencies')).toBeInTheDocument();
  });

  it('renders the YAML editor', () => {
    render(<App />);

    expect(screen.getByText('YAML Configuration')).toBeInTheDocument();
    expect(screen.getByText('Update Tree')).toBeInTheDocument();
  });

  it('renders the tree info when valid YAML is loaded', () => {
    render(<App />);

    // The default YAML should be parsed and displayed
    expect(screen.getByText('Microservices Architecture Decision')).toBeInTheDocument();
    expect(screen.getByText(/5 decisions/)).toBeInTheDocument();
    expect(screen.getByText(/1 root decisions/)).toBeInTheDocument();
  });

  it('renders the decision details panel', () => {
    render(<App />);

    expect(screen.getByText('Select a Decision Point')).toBeInTheDocument();
  });
}); 