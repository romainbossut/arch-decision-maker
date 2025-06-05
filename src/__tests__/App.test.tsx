import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock ReactFlow since it doesn't work well in test environment
vi.mock('reactflow', () => ({
  default: ({ children, ...props }: any) => <div data-testid="react-flow" {...props}>{children}</div>,
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  BackgroundVariant: { Dots: 'dots' },
  Handle: () => <div data-testid="handle" />,
  Position: { Top: 'top', Bottom: 'bottom' },
  addEdge: vi.fn(),
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
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
    
    // Initially the YAML section should be collapsed
    expect(screen.queryByText('YAML Configuration')).not.toBeInTheDocument();
    
    // Click the toggle button to expand
    const toggleButton = screen.getByText('📝 Edit YAML');
    await user.click(toggleButton);
    
    // Now the YAML editor should be visible
    expect(screen.getByText('YAML Configuration')).toBeInTheDocument();
    // Auto-parsing means no manual Update Tree button
    expect(screen.queryByText('Update Tree')).not.toBeInTheDocument();
  });

  it.skip('renders the tree info when valid YAML is loaded', async () => {
    render(<App />);
    
    // Wait for initial parsing to complete
    await waitFor(() => {
      expect(screen.getByText('API Architecture Decision Tree')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/7 decisions/)).toBeInTheDocument();
    expect(screen.getByText(/3 root decisions/)).toBeInTheDocument();
  });

  it('does not render decision details panel when no decision is selected', () => {
    render(<App />);
    
    // Details section should not be present when no decision is selected
    expect(screen.queryByText('Decision Details')).not.toBeInTheDocument();
  });

  it('renders toggle buttons in different states', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Initially should show "Edit YAML" button
    expect(screen.getByText('📝 Edit YAML')).toBeInTheDocument();
    
    // Click to expand
    await user.click(screen.getByText('📝 Edit YAML'));
    
    // Now should show "Collapse" button
    expect(screen.getByText('🗂️ Collapse')).toBeInTheDocument();
  });

  it('toggles YAML section correctly', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Initially collapsed
    expect(screen.queryByText('YAML Configuration')).not.toBeInTheDocument();
    
    // Expand
    await user.click(screen.getByText('📝 Edit YAML'));
    expect(screen.getByText('YAML Configuration')).toBeInTheDocument();
    
    // Collapse again
    await user.click(screen.getByText('🗂️ Collapse'));
    expect(screen.queryByText('YAML Configuration')).not.toBeInTheDocument();
  });
}); 