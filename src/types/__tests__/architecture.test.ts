import { describe, it, expect } from 'vitest';
import type { DecisionPoint, ArchitectureDecisionTree, YamlDecisionPoint, YamlDecisionTree, ExternalDependency, ProsConsItem, ProsCons } from '../architecture';

describe('Architecture Types', () => {
  describe('ProsConsItem', () => {
    it('should have all required properties', () => {
      const prosConsItem: ProsConsItem = {
        id: 'pros-cons-1',
        title: 'Pros Cons Item Title',
        rating: 4
      };

      expect(prosConsItem.id).toBe('pros-cons-1');
      expect(prosConsItem.title).toBe('Pros Cons Item Title');
      expect(prosConsItem.rating).toBe(4);
    });

    it('should allow optional description', () => {
      const prosConsItem: ProsConsItem = {
        id: 'pros-cons-1',
        title: 'Pros Cons Item Title',
        description: 'Description of the pros/cons item',
        rating: 3
      };

      expect(prosConsItem.description).toBe('Description of the pros/cons item');
    });
  });

  describe('ProsCons', () => {
    it('should allow empty pros and cons', () => {
      const prosCons: ProsCons = {};

      expect(prosCons.pros).toBeUndefined();
      expect(prosCons.cons).toBeUndefined();
    });

    it('should allow only pros', () => {
      const prosCons: ProsCons = {
        pros: [
          {
            id: 'pro-1',
            title: 'Good Thing',
            rating: 5
          }
        ]
      };

      expect(prosCons.pros).toHaveLength(1);
      expect(prosCons.pros![0].title).toBe('Good Thing');
      expect(prosCons.cons).toBeUndefined();
    });

    it('should allow only cons', () => {
      const prosCons: ProsCons = {
        cons: [
          {
            id: 'con-1',
            title: 'Bad Thing',
            rating: 2
          }
        ]
      };

      expect(prosCons.cons).toHaveLength(1);
      expect(prosCons.cons![0].title).toBe('Bad Thing');
      expect(prosCons.pros).toBeUndefined();
    });

    it('should allow both pros and cons', () => {
      const prosCons: ProsCons = {
        pros: [
          {
            id: 'pro-1',
            title: 'Good Thing',
            description: 'This is good',
            rating: 5
          }
        ],
        cons: [
          {
            id: 'con-1',
            title: 'Bad Thing',
            description: 'This is bad',
            rating: 3
          }
        ]
      };

      expect(prosCons.pros).toHaveLength(1);
      expect(prosCons.cons).toHaveLength(1);
      expect(prosCons.pros![0].description).toBe('This is good');
      expect(prosCons.cons![0].description).toBe('This is bad');
    });
  });

  describe('ExternalDependency', () => {
    it('should have all required properties', () => {
      const externalDep: ExternalDependency = {
        id: 'ext-dep-1',
        title: 'External Dependency Title'
      };

      expect(externalDep.id).toBe('ext-dep-1');
      expect(externalDep.title).toBe('External Dependency Title');
    });

    it('should allow optional properties', () => {
      const externalDep: ExternalDependency = {
        id: 'ext-dep-1',
        title: 'External Dependency Title',
        description: 'Description of the external dependency',
        expectedResolutionDate: '2024-03-15'
      };

      expect(externalDep.description).toBe('Description of the external dependency');
      expect(externalDep.expectedResolutionDate).toBe('2024-03-15');
    });
  });

  describe('DecisionPoint', () => {
    it('should have all required properties', () => {
      const decision: DecisionPoint = {
        id: 'test-id',
        title: 'Test Title',
        description: 'Test description',
        children: []
      };

      expect(decision.id).toBe('test-id');
      expect(decision.title).toBe('Test Title');
      expect(decision.description).toBe('Test description');
      expect(decision.children).toEqual([]);
    });

    it('should allow optional properties including external dependencies and pros/cons', () => {
      const decision: DecisionPoint = {
        id: 'test-id',
        title: 'Test Title',
        description: 'Test description',
        drawIoUrl: 'https://example.com',
        dependencies: ['dep-1'],
        externalDependencies: [
          {
            id: 'ext-dep-1',
            title: 'External Dependency',
            description: 'An external dependency',
            expectedResolutionDate: '2024-03-15'
          }
        ],
        prosCons: {
          pros: [
            {
              id: 'pro-1',
              title: 'Great Performance',
              description: 'Significantly improves performance',
              rating: 5
            }
          ],
          cons: [
            {
              id: 'con-1',
              title: 'High Cost',
              description: 'Expensive to implement',
              rating: 3
            }
          ]
        },
        children: ['child-1'],
        position: { x: 100, y: 200 }
      };

      expect(decision.drawIoUrl).toBe('https://example.com');
      expect(decision.dependencies).toEqual(['dep-1']);
      expect(decision.externalDependencies).toHaveLength(1);
      expect(decision.externalDependencies![0].id).toBe('ext-dep-1');
      expect(decision.prosCons?.pros).toHaveLength(1);
      expect(decision.prosCons?.cons).toHaveLength(1);
      expect(decision.prosCons?.pros![0].rating).toBe(5);
      expect(decision.prosCons?.cons![0].rating).toBe(3);
      expect(decision.children).toEqual(['child-1']);
      expect(decision.position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('ArchitectureDecisionTree', () => {
    it('should have all required properties', () => {
      const tree: ArchitectureDecisionTree = {
        name: 'Test Tree',
        decisions: {
          'decision-1': {
            id: 'decision-1',
            title: 'Decision 1',
            description: 'First decision',
            children: []
          }
        },
        rootDecisions: ['decision-1']
      };

      expect(tree.name).toBe('Test Tree');
      expect(Object.keys(tree.decisions)).toHaveLength(1);
      expect(tree.rootDecisions).toEqual(['decision-1']);
    });

    it('should allow optional description', () => {
      const tree: ArchitectureDecisionTree = {
        name: 'Test Tree',
        description: 'A test tree description',
        decisions: {},
        rootDecisions: []
      };

      expect(tree.description).toBe('A test tree description');
    });
  });

  describe('YamlDecisionPoint', () => {
    it('should have all required properties for YAML format', () => {
      const yamlDecision: YamlDecisionPoint = {
        id: 'yaml-decision',
        title: 'YAML Decision',
        description: 'Decision from YAML'
      };

      expect(yamlDecision.id).toBe('yaml-decision');
      expect(yamlDecision.title).toBe('YAML Decision');
      expect(yamlDecision.description).toBe('Decision from YAML');
    });

    it('should allow optional properties for YAML format including external dependencies and pros/cons', () => {
      const yamlDecision: YamlDecisionPoint = {
        id: 'yaml-decision',
        title: 'YAML Decision',
        description: 'Decision from YAML',
        drawIoUrl: 'https://example.com',
        dependencies: ['yaml-dep-1'],
        externalDependencies: [
          {
            id: 'yaml-ext-dep',
            title: 'YAML External Dependency',
            description: 'External dependency from YAML',
            expectedResolutionDate: '2024-12-25'
          }
        ],
        prosCons: {
          pros: [
            {
              id: 'yaml-pro-1',
              title: 'YAML Pro',
              description: 'A pro from YAML',
              rating: 4
            }
          ],
          cons: [
            {
              id: 'yaml-con-1',
              title: 'YAML Con',
              description: 'A con from YAML',
              rating: 2
            }
          ]
        }
      };

      expect(yamlDecision.drawIoUrl).toBe('https://example.com');
      expect(yamlDecision.dependencies).toEqual(['yaml-dep-1']);
      expect(yamlDecision.externalDependencies).toHaveLength(1);
      expect(yamlDecision.externalDependencies![0].id).toBe('yaml-ext-dep');
      expect(yamlDecision.prosCons?.pros).toHaveLength(1);
      expect(yamlDecision.prosCons?.cons).toHaveLength(1);
      expect(yamlDecision.prosCons?.pros![0].title).toBe('YAML Pro');
      expect(yamlDecision.prosCons?.cons![0].title).toBe('YAML Con');
      expect(yamlDecision.prosCons?.pros![0].rating).toBe(4);
      expect(yamlDecision.prosCons?.cons![0].rating).toBe(2);
    });
  });

  describe('YamlDecisionTree', () => {
    it('should have all required properties for YAML format', () => {
      const yamlTree: YamlDecisionTree = {
        name: 'YAML Tree',
        decisions: [
          {
            id: 'yaml-decision',
            title: 'YAML Decision',
            description: 'Decision from YAML'
          }
        ]
      };

      expect(yamlTree.name).toBe('YAML Tree');
      expect(yamlTree.decisions).toHaveLength(1);
    });
  });
}); 