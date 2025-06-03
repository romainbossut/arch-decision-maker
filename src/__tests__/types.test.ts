import type { 
  DecisionPoint, 
  ExternalDependency, 
  ArchitectureDecisionTree,
  ProsConsItem,
  ProsCons
} from '../types/architecture';

describe('TypeScript Interfaces', () => {
  test('ProsConsItem should have correct structure', () => {
    const prosConsItem: ProsConsItem = {
      id: 'test-1',
      title: 'Test Item',
      description: 'Test description',
      impact: 'high'
    };

    expect(prosConsItem.id).toBe('test-1');
    expect(prosConsItem.title).toBe('Test Item');
    expect(prosConsItem.description).toBe('Test description');
    expect(prosConsItem.impact).toBe('high');
  });

  test('ProsCons should structure pros and cons correctly', () => {
    const prosCons: ProsCons = {
      pros: [
        {
          id: 'pro-1',
          title: 'High Performance',
          description: 'Improves system performance',
          impact: 'high'
        },
        {
          id: 'pro-2',
          title: 'Easy Maintenance',
          impact: 'major'
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
    };

    expect(prosCons.pros).toHaveLength(2);
    expect(prosCons.cons).toHaveLength(1);
    expect(prosCons.pros![0].impact).toBe('high');
    expect(prosCons.cons![0].impact).toBe('major');
  });

  test('DecisionPoint should include all required fields', () => {
    const decision: DecisionPoint = {
      id: 'test-decision',
      title: 'Test Decision',
      description: 'A test decision point',
      children: [],
      prosCons: {
        pros: [{
          id: 'pro-1',
          title: 'Benefit',
          impact: 'minor'
        }],
        cons: [{
          id: 'con-1',
          title: 'Drawback',
          impact: 'major'
        }]
      }
    };

    expect(decision.id).toBe('test-decision');
    expect(decision.title).toBe('Test Decision');
    expect(decision.description).toBe('A test decision point');
    expect(decision.children).toEqual([]);
    expect(decision.prosCons?.pros![0].impact).toBe('minor');
    expect(decision.prosCons?.cons![0].impact).toBe('major');
  });

  test('ExternalDependency should have correct structure', () => {
    const dependency: ExternalDependency = {
      id: 'ext-dep-1',
      title: 'External API',
      description: 'Third-party service dependency',
      expectedResolutionDate: '2024-12-31'
    };

    expect(dependency.id).toBe('ext-dep-1');
    expect(dependency.title).toBe('External API');
    expect(dependency.description).toBe('Third-party service dependency');
    expect(dependency.expectedResolutionDate).toBe('2024-12-31');
  });

  test('ArchitectureDecisionTree should have root decisions', () => {
    const tree: ArchitectureDecisionTree = {
      decisions: [
        {
          id: 'root-1',
          title: 'Root Decision',
          description: 'A root level decision',
          children: []
        }
      ]
    };

    expect(tree.decisions).toHaveLength(1);
    expect(tree.decisions[0].id).toBe('root-1');
  });

  test('Impact levels should be strictly typed', () => {
    const validImpacts: Array<'minor' | 'major' | 'high'> = ['minor', 'major', 'high'];
    
    validImpacts.forEach(impact => {
      const item: ProsConsItem = {
        id: `test-${impact}`,
        title: `Test ${impact}`,
        impact
      };
      expect(['minor', 'major', 'high']).toContain(item.impact);
    });
  });
}); 