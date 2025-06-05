import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YamlEditor from '../YamlEditor';

describe('YamlEditor', () => {
  it('renders with default props', () => {
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('YAML Configuration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your YAML configuration here...')).toBeInTheDocument();
    expect(screen.getByText('Expand')).toBeInTheDocument();
    expect(screen.getByText('❌ Invalid')).toBeInTheDocument(); // Default state when no isValid prop
  });

  it('displays the provided value in textarea', () => {
    const testValue = 'name: "Test Tree"\ndecisions: []';
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value={testValue}
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByPlaceholderText('Paste your YAML configuration here...');
    expect(textarea).toHaveValue(testValue);
  });

  it('calls onChange when textarea value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByPlaceholderText('Paste your YAML configuration here...');
    await user.type(textarea, 'test');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('shows parsing status when isParsing is true', () => {
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        isParsing={true}
      />
    );

    expect(screen.getByText('🔄 Parsing...')).toBeInTheDocument();
  });

  it('shows valid status when isValid is true', () => {
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        isParsing={false}
        isValid={true}
      />
    );

    expect(screen.getByText('✅ Valid')).toBeInTheDocument();
  });

  it('toggles between collapsed and expanded states', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const toggleButton = screen.getByText('Expand');
    await user.click(toggleButton);

    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('displays validation errors when provided', () => {
    const mockOnChange = vi.fn();
    const errors = ['Error 1', 'Error 2'];

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        errors={errors}
      />
    );

    expect(screen.getByText('Validation Errors:')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('does not display error section when no errors', () => {
    const mockOnChange = vi.fn();

    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Validation Errors:')).not.toBeInTheDocument();
  });
}); 