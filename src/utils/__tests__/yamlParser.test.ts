import { describe, it, expect } from 'vitest';
import { parseYamlContent, validateDecisionTree } from '../yamlParser';

describe('yamlParser', () => {
  describe('parseYamlContent', () => {
    it('should parse valid YAML content', () => {
      const yamlContent = `
name: "Test Decision Tree"
description: "A test tree"
decisions:
  - id: "decision-1"
    title: "First Decision"
    description: "This is the first decision"
  - id: "decision-2"
    title: "Second Decision"
    description: "This is the second decision"
    dependencies: ["decision-1"]
      `;

      const result = parseYamlContent(yamlContent);

      expect(result.name).toBe('Test Decision Tree');
      expect(result.description).toBe('A test tree');
      expect(Object.keys(result.decisions)).toHaveLength(2);
      expect(result.decisions['decision-1'].title).toBe('First Decision');
      expect(result.decisions['decision-2'].dependencies).toEqual(['decision-1']);
      expect(result.decisions['decision-1'].children).toEqual(['decision-2']);
      expect(result.rootDecisions).toEqual(['decision-1']);
    });

    it('should parse YAML content with external dependencies', () => {
      const yamlContent = `
name: "Test Tree with External Dependencies"
decisions:
  - id: "decision-1"
    title: "Decision with External Deps"
    description: "A decision with external dependencies"
    externalDependencies:
      - id: "ext-dep-1"
        title: "External Dependency 1"
        description: "First external dependency"
        expectedResolutionDate: "2024-03-15"
      - id: "ext-dep-2"
        title: "External Dependency 2"
        expectedResolutionDate: "2024-04-01"
      `;

      const result = parseYamlContent(yamlContent);

      expect(result.decisions['decision-1'].externalDependencies).toHaveLength(2);
      expect(result.decisions['decision-1'].externalDependencies![0]).toEqual({
        id: 'ext-dep-1',
        title: 'External Dependency 1',
        description: 'First external dependency',
        expectedResolutionDate: '2024-03-15'
      });
      expect(result.decisions['decision-1'].externalDependencies![1]).toEqual({
        id: 'ext-dep-2',
        title: 'External Dependency 2',
        expectedResolutionDate: '2024-04-01'
      });
    });

    it('should handle external dependencies without optional fields', () => {
      const yamlContent = `
name: "Minimal External Dependencies"
decisions:
  - id: "decision-1"
    title: "Decision"
    description: "A decision"
    externalDependencies:
      - id: "ext-dep-1"
        title: "Minimal External Dependency"
      `;

      const result = parseYamlContent(yamlContent);

      expect(result.decisions['decision-1'].externalDependencies).toHaveLength(1);
      expect(result.decisions['decision-1'].externalDependencies![0]).toEqual({
        id: 'ext-dep-1',
        title: 'Minimal External Dependency'
      });
    });

    it('should handle decisions without dependencies', () => {
      const yamlContent = `
name: "Single Decision Tree"
decisions:
  - id: "standalone"
    title: "Standalone Decision"
    description: "A decision with no dependencies"
      `;

      const result = parseYamlContent(yamlContent);

      expect(result.rootDecisions).toEqual(['standalone']);
      expect(result.decisions['standalone'].dependencies).toBeUndefined();
      expect(result.decisions['standalone'].children).toEqual([]);
    });

    it('should throw error for invalid YAML', () => {
      const invalidYaml = `
name: "Invalid YAML"
decisions:
  - id: "test"
    title: "Test"
    description: "Test decision
      `;

      expect(() => parseYamlContent(invalidYaml)).toThrow('Failed to parse YAML');
    });

    it('should handle multiple root decisions', () => {
      const yamlContent = `
name: "Multi-root Test"
decisions:
  - id: "root1"
    title: "First Root"
    description: "First root decision"
  - id: "root2"
    title: "Second Root"
    description: "Second root decision"
  - id: "child"
    title: "Child"
    description: "Child decision"
    dependencies: ["root1"]
      `;

      const result = parseYamlContent(yamlContent);
      expect(result.rootDecisions).toEqual(['root1', 'root2']);
      expect(result.decisions['child'].dependencies).toEqual(['root1']);
      expect(result.decisions['root1'].children).toEqual(['child']);
    });

    it('should parse YAML content with pros and cons', () => {
      const yamlContent = `
name: "Test Tree with Pros and Cons"
decisions:
  - id: "decision-1"
    title: "Decision with Pros and Cons"
    description: "A decision with pros and cons"
    prosCons:
      pros:
        - id: "pro-1"
          title: "Great Performance"
          description: "Significantly improves performance"
          impact: "high"
        - id: "pro-2"
          title: "Easy to Use"
          impact: "major"
      cons:
        - id: "con-1"
          title: "High Cost"
          description: "Expensive to implement"
          impact: "major"
        - id: "con-2"
          title: "Learning Curve"
          impact: "minor"
      `;

      const result = parseYamlContent(yamlContent);

      expect(result.decisions['decision-1'].prosCons?.pros).toHaveLength(2);
      expect(result.decisions['decision-1'].prosCons?.cons).toHaveLength(2);
      
      expect(result.decisions['decision-1'].prosCons?.pros![0]).toEqual({
        id: 'pro-1',
        title: 'Great Performance',
        description: 'Significantly improves performance',
        impact: 'high'
      });
      
      expect(result.decisions['decision-1'].prosCons?.pros![1]).toEqual({
        id: 'pro-2',
        title: 'Easy to Use',
        impact: 'major'
      });
      
      expect(result.decisions['decision-1'].prosCons?.cons![0]).toEqual({
        id: 'con-1',
        title: 'High Cost',
        description: 'Expensive to implement',
        impact: 'major'
      });
      
      expect(result.decisions['decision-1'].prosCons?.cons![1]).toEqual({
        id: 'con-2',
        title: 'Learning Curve',
        impact: 'minor'
      });
    });
  });

  describe('validateDecisionTree', () => {
    it('should return no errors for valid tree', () => {
      const tree = {
        name: 'Valid Tree',
        decisions: {
          'a': { id: 'a', title: 'A', description: 'Decision A', dependencies: [], children: ['b'] },
          'b': { id: 'b', title: 'B', description: 'Decision B', dependencies: ['a'], children: [] }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for valid tree with external dependencies', () => {
      const tree = {
        name: 'Valid Tree with External Dependencies',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: ['b'],
            externalDependencies: [
              {
                id: 'ext-dep-1',
                title: 'External Dependency 1',
                description: 'A valid external dependency',
                expectedResolutionDate: '2024-03-15'
              }
            ]
          },
          'b': { id: 'b', title: 'B', description: 'Decision B', dependencies: ['a'], children: [] }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });

    it('should detect circular dependencies', () => {
      const tree = {
        name: 'Circular Tree',
        decisions: {
          'a': { id: 'a', title: 'A', description: 'Decision A', dependencies: ['b'], children: ['b'] },
          'b': { id: 'b', title: 'B', description: 'Decision B', dependencies: ['a'], children: ['a'] }
        },
        rootDecisions: []
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Circular dependency detected');
    });

    it('should detect invalid dependency references', () => {
      const tree = {
        name: 'Invalid Refs Tree',
        decisions: {
          'a': { id: 'a', title: 'A', description: 'Decision A', dependencies: ['nonexistent'], children: [] }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('references unknown dependency: nonexistent');
    });

    it('should detect duplicate external dependency IDs', () => {
      const tree = {
        name: 'Duplicate External Deps Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            externalDependencies: [
              {
                id: 'duplicate-id',
                title: 'First External Dependency'
              },
              {
                id: 'duplicate-id',
                title: 'Second External Dependency'
              }
            ]
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('duplicate external dependency ID: duplicate-id');
    });

    it('should detect invalid date formats in external dependencies', () => {
      const tree = {
        name: 'Invalid Date Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            externalDependencies: [
              {
                id: 'ext-dep-1',
                title: 'Invalid Date External Dependency',
                expectedResolutionDate: 'invalid-date'
              },
              {
                id: 'ext-dep-2',
                title: 'Another Invalid Date',
                expectedResolutionDate: '2024/03/15'
              },
              {
                id: 'ext-dep-3',
                title: 'Valid Date',
                expectedResolutionDate: '2024-03-15'
              }
            ]
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(2);
      expect(errors[0]).toContain('invalid date format');
      expect(errors[0]).toContain('ext-dep-1');
      expect(errors[1]).toContain('invalid date format');
      expect(errors[1]).toContain('ext-dep-2');
    });

    it('should handle external dependencies without expectedResolutionDate', () => {
      const tree = {
        name: 'No Date Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            externalDependencies: [
              {
                id: 'ext-dep-1',
                title: 'External Dependency without Date'
              }
            ]
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for valid tree with pros and cons', () => {
      const tree = {
        name: 'Valid Tree with Pros and Cons',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            prosCons: {
              pros: [
                {
                  id: 'pro-1',
                  title: 'Great Performance',
                  description: 'Significantly improves performance',
                  impact: 'high'
                }
              ],
              cons: [
                {
                  id: 'con-1',
                  title: 'High Cost',
                  description: 'Expensive to implement',
                  impact: 'major'
                }
              ]
            }
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate pros/cons IDs', () => {
      const tree = {
        name: 'Duplicate Pros Cons IDs Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            prosCons: {
              pros: [
                {
                  id: 'duplicate-id',
                  title: 'First Pro',
                  impact: 'high'
                }
              ],
              cons: [
                {
                  id: 'duplicate-id',
                  title: 'First Con',
                  impact: 'major'
                }
              ]
            }
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('duplicate pros/cons ID: duplicate-id');
    });

    it('should detect duplicate IDs within pros', () => {
      const tree = {
        name: 'Duplicate Pros IDs Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            prosCons: {
              pros: [
                {
                  id: 'duplicate-pro',
                  title: 'First Pro',
                  impact: 'high'
                },
                {
                  id: 'duplicate-pro',
                  title: 'Second Pro',
                  impact: 'major'
                }
              ]
            }
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('duplicate pros/cons ID: duplicate-pro');
    });

    it('should detect invalid impact levels in pros and cons', () => {
      const tree = {
        name: 'Invalid Impact Levels Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            prosCons: {
              pros: [
                {
                  id: 'pro-invalid-low',
                  title: 'Pro with Invalid Low Impact',
                  impact: 'low' as any
                },
                {
                  id: 'pro-invalid-high',
                  title: 'Pro with Invalid Super Impact',
                  impact: 'super' as any
                },
                {
                  id: 'pro-valid',
                  title: 'Pro with Valid Impact',
                  impact: 'major' as const
                }
              ],
              cons: [
                {
                  id: 'con-invalid-critical',
                  title: 'Con with Invalid Critical Impact',
                  impact: 'critical' as any
                },
                {
                  id: 'con-valid',
                  title: 'Con with Valid Impact',
                  impact: 'minor' as const
                }
              ]
            }
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(3);
      expect(errors[0]).toContain('pro "pro-invalid-low" has invalid impact level');
      expect(errors[1]).toContain('pro "pro-invalid-high" has invalid impact level');
      expect(errors[2]).toContain('con "con-invalid-critical" has invalid impact level');
    });

    it('should handle empty pros and cons', () => {
      const tree = {
        name: 'Empty Pros Cons Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
            prosCons: {
              pros: [],
              cons: []
            }
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });

    it('should handle pros and cons without descriptions', () => {
      const tree = {
        name: 'No Description Pros Cons Tree',
        decisions: {
          'a': { 
            id: 'a', 
            title: 'A', 
            description: 'Decision A', 
            dependencies: [], 
            children: [],
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
            }
          }
        },
        rootDecisions: ['a']
      };

      const errors = validateDecisionTree(tree);
      expect(errors).toHaveLength(0);
    });
  });
}); 