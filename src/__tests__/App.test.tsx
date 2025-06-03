import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders the YAML editor when expanded', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initially collapsed, so YAML editor should not be visible
    expect(screen.queryByText('YAML Configuration')).not.toBeInTheDocument();
    
    // Click the Edit YAML button to expand
    const editButton = screen.getByText('📝 Edit YAML');
    await user.click(editButton);

    // Now the YAML editor should be visible
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

  it('does not render decision details panel when no decision is selected', () => {
    render(<App />);

    // Decision details should only show when a decision is selected
    expect(screen.queryByText('Select a Decision Point')).not.toBeInTheDocument();
  });

  it('renders toggle buttons in different states', () => {
    render(<App />);

    // Should show Edit YAML button when collapsed
    expect(screen.getByText('📝 Edit YAML')).toBeInTheDocument();
  });

  it('toggles YAML section correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initially collapsed
    expect(screen.queryByText('YAML Configuration')).not.toBeInTheDocument();
    expect(screen.getByText('📝 Edit YAML')).toBeInTheDocument();

    // Expand
    await user.click(screen.getByText('📝 Edit YAML'));
    expect(screen.getByText('YAML Configuration')).toBeInTheDocument();
    expect(screen.getByText('🗂️ Collapse')).toBeInTheDocument();

    // Collapse again
    await user.click(screen.getByText('🗂️ Collapse'));
    expect(screen.queryByText('YAML Configuration')).not.toBeInTheDocument();
    expect(screen.getByText('📝 Edit YAML')).toBeInTheDocument();
  });
}); 