import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YamlEditor from '../YamlEditor';

describe('YamlEditor', () => {
  const mockOnChange = vi.fn();
  const mockOnParse = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnParse.mockClear();
  });

  it('renders with default props', () => {
    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        onParse={mockOnParse}
      />
    );

    expect(screen.getByText('YAML Configuration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your YAML configuration here...')).toBeInTheDocument();
    expect(screen.getByText('Expand')).toBeInTheDocument();
    expect(screen.getByText('Update Tree')).toBeInTheDocument();
  });

  it('displays the provided value in textarea', () => {
    const testValue = 'name: "Test"\ndecisions: []';
    render(
      <YamlEditor
        value={testValue}
        onChange={mockOnChange}
        onParse={mockOnParse}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(testValue);
  });

  it('calls onChange when textarea value changes', async () => {
    const user = userEvent.setup();
    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        onParse={mockOnParse}
      />
    );

    const textarea = screen.getByPlaceholderText('Paste your YAML configuration here...');
    await user.type(textarea, 'test content');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onParse when Update Tree button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        onParse={mockOnParse}
      />
    );

    const updateButton = screen.getByText('Update Tree');
    await user.click(updateButton);

    expect(mockOnParse).toHaveBeenCalledTimes(1);
  });

  it('toggles between collapsed and expanded states', async () => {
    const user = userEvent.setup();
    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        onParse={mockOnParse}
      />
    );

    const toggleButton = screen.getByText('Expand');
    await user.click(toggleButton);

    expect(screen.getByText('Collapse')).toBeInTheDocument();

    await user.click(screen.getByText('Collapse'));
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('displays validation errors when provided', () => {
    const errors = ['Error 1', 'Error 2'];
    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        onParse={mockOnParse}
        errors={errors}
      />
    );

    expect(screen.getByText('Validation Errors:')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('does not display error section when no errors', () => {
    render(
      <YamlEditor
        value=""
        onChange={mockOnChange}
        onParse={mockOnParse}
      />
    );

    expect(screen.queryByText('Validation Errors:')).not.toBeInTheDocument();
  });
}); 