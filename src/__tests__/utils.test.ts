import { parseYamlContent, validateDecisionTree } from '../utils/yamlParser';
import type { ArchitectureDecisionTree } from '../types/architecture';

describe('yamlParser', () => {
  describe('parseYamlContent', () => {
    test('should parse valid YAML content', () => {
      const yamlContent = `
name: "Test Tree"
description: "A test decision tree"
decisions:
  - id: "decision-1"
    title: "First Decision"
    description: "This is the first decision"
    prosCons:
      pros:
        - id: "pro-1"
          title: "Good Performance"
          description: "Performs well under load"
          impact: high
        - id: "pro-2"
          title: "Easy to Use"
          impact: major
      cons:
        - id: "con-1"
          title: "High Cost"
          description: "Expensive to implement"
          impact: major
`;

      const result = parseYamlContent(yamlContent);
      
      expect(result.name).toBe('Test Tree');
      expect(result.description).toBe('A test decision tree');
      expect(Object.keys(result.decisions)).toHaveLength(1);
      expect(result.decisions['decision-1']).toBeDefined();
      expect(result.decisions['decision-1'].prosCons?.pros?.[0].impact).toBe('high');
      expect(result.decisions['decision-1'].prosCons?.cons?.[0].impact).toBe('major');
    });

    test('should throw error for invalid YAML', () => {
      const invalidYaml = `
name: "Test Tree"
decisions:
  - id: "decision-1"
    title: "First Decision"
    description: "This is the first decision"
    invalid_field: [unclosed array
`;

      expect(() => parseYamlContent(invalidYaml)).toThrow();
    });

    test('should handle decisions with dependencies', () => {
      const yamlContent = `
name: "Test Tree"
decisions:
  - id: "decision-1"
    title: "First Decision"
    description: "This is the first decision"
  - id: "decision-2"
    title: "Second Decision"
    description: "This depends on the first"
    dependencies: ["decision-1"]
`;

      const result = parseYamlContent(yamlContent);
      
      expect(result.decisions['decision-1'].children).toContain('decision-2');
      expect(result.decisions['decision-2'].dependencies).toContain('decision-1');
    });
  });

  describe('validateDecisionTree', () => {
    test('should return no errors for valid tree', () => {
      const tree: ArchitectureDecisionTree = {
        name: 'Test Tree',
        decisions: {
          'decision-1': {
            id: 'decision-1',
            title: 'First Decision',
            description: 'A valid decision',
            children: []
          }
        },
        rootDecisions: ['decision-1']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });

    test('should detect circular dependencies', () => {
      const tree: ArchitectureDecisionTree = {
        name: 'Test Tree',
        decisions: {
          'decision-1': {
            id: 'decision-1',
            title: 'First Decision',
            description: 'A decision',
            children: ['decision-2'],
            dependencies: ['decision-2']
          },
          'decision-2': {
            id: 'decision-2',
            title: 'Second Decision',
            description: 'Another decision',
            children: ['decision-1'],
            dependencies: ['decision-1']
          }
        },
        rootDecisions: []
      };

      const errors = validateDecisionTree(tree);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Circular dependency detected');
    });

    test('should detect invalid dependencies', () => {
      const tree: ArchitectureDecisionTree = {
        name: 'Test Tree',
        decisions: {
          'decision-1': {
            id: 'decision-1',
            title: 'First Decision',
            description: 'A decision',
            children: [],
            dependencies: ['non-existent-decision']
          }
        },
        rootDecisions: ['decision-1']
      };

      const errors = validateDecisionTree(tree);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('references unknown dependency: non-existent-decision');
    });

    test('should validate impact levels in pros and cons', () => {
      const tree: ArchitectureDecisionTree = {
        name: 'Test Tree',
        decisions: {
          'decision-1': {
            id: 'decision-1',
            title: 'First Decision',
            description: 'A decision',
            children: [],
            prosCons: {
              pros: [
                {
                  id: 'pro-1',
                  title: 'Good Pro',
                  impact: 'invalid' as any // Invalid impact level
                }
              ]
            }
          }
        },
        rootDecisions: ['decision-1']
      };

      const errors = validateDecisionTree(tree);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('invalid impact level');
    });
  });
}); 