import yaml from 'js-yaml';
import type { YamlDecisionTree, ArchitectureDecisionTree, DecisionPoint } from '../types/architecture';

export function parseYamlContent(yamlContent: string): ArchitectureDecisionTree {
  try {
    const parsed = yaml.load(yamlContent) as YamlDecisionTree;
    return transformToDecisionTree(parsed);
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error}`);
  }
}

function transformToDecisionTree(yamlTree: YamlDecisionTree): ArchitectureDecisionTree {
  const decisions: Record<string, DecisionPoint> = {};
  
  // First pass: create all decision points
  yamlTree.decisions.forEach((decision) => {
    decisions[decision.id] = {
      ...decision,
      children: [],
    };
  });

  // Second pass: establish parent-child relationships
  yamlTree.decisions.forEach((decision) => {
    if (decision.dependencies) {
      decision.dependencies.forEach((depId) => {
        if (decisions[depId]) {
          decisions[depId].children?.push(decision.id);
        }
      });
    }
  });

  // Find root decisions (those with no dependencies)
  const rootDecisions = yamlTree.decisions
    .filter((decision) => !decision.dependencies || decision.dependencies.length === 0)
    .map((decision) => decision.id);

  return {
    name: yamlTree.name,
    description: yamlTree.description,
    decisions,
    rootDecisions,
  };
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

export function validateDecisionTree(tree: ArchitectureDecisionTree): string[] {
  const errors: string[] = [];
  const allDecisionIds = Object.keys(tree.decisions);

  // Check for circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = tree.decisions[nodeId];
    if (node.children) {
      for (const childId of node.children) {
        if (hasCycle(childId)) {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check for cycles
  for (const decisionId of allDecisionIds) {
    if (hasCycle(decisionId)) {
      errors.push(`Circular dependency detected involving decision: ${decisionId}`);
      break;
    }
  }

  // Check for invalid dependencies
  Object.values(tree.decisions).forEach((decision) => {
    if (decision.dependencies) {
      decision.dependencies.forEach((depId) => {
        if (!allDecisionIds.includes(depId)) {
          errors.push(`Decision "${decision.id}" references unknown dependency: ${depId}`);
        }
      });
    }

    // Validate external dependencies
    if (decision.externalDependencies) {
      const externalDepIds = new Set<string>();
      
      decision.externalDependencies.forEach((extDep) => {
        // Check for duplicate external dependency IDs within this decision
        if (externalDepIds.has(extDep.id)) {
          errors.push(`Decision "${decision.id}" has duplicate external dependency ID: ${extDep.id}`);
        }
        externalDepIds.add(extDep.id);

        // Validate date format if provided
        if (extDep.expectedResolutionDate && !isValidDate(extDep.expectedResolutionDate)) {
          errors.push(`Decision "${decision.id}" external dependency "${extDep.id}" has invalid date format. Use YYYY-MM-DD format.`);
        }
      });
    }

    // Validate pros and cons
    if (decision.prosCons) {
      const prosConsIds = new Set<string>();

      // Validate pros
      if (decision.prosCons.pros) {
        decision.prosCons.pros.forEach((pro) => {
          // Check for duplicate IDs across pros and cons
          if (prosConsIds.has(pro.id)) {
            errors.push(`Decision "${decision.id}" has duplicate pros/cons ID: ${pro.id}`);
          }
          prosConsIds.add(pro.id);

          // Validate rating range
          if (!Number.isInteger(pro.rating) || pro.rating < 1 || pro.rating > 5) {
            errors.push(`Decision "${decision.id}" pro "${pro.id}" has invalid rating. Rating must be an integer between 1 and 5.`);
          }
        });
      }

      // Validate cons
      if (decision.prosCons.cons) {
        decision.prosCons.cons.forEach((con) => {
          // Check for duplicate IDs across pros and cons
          if (prosConsIds.has(con.id)) {
            errors.push(`Decision "${decision.id}" has duplicate pros/cons ID: ${con.id}`);
          }
          prosConsIds.add(con.id);

          // Validate rating range
          if (!Number.isInteger(con.rating) || con.rating < 1 || con.rating > 5) {
            errors.push(`Decision "${decision.id}" con "${con.id}" has invalid rating. Rating must be an integer between 1 and 5.`);
          }
        });
      }
    }
  });

  return errors;
} 