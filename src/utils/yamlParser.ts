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

  // Third pass: propagate path selection logic
  propagatePathSelection(decisions);

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

function propagatePathSelection(decisions: Record<string, DecisionPoint>) {
  const visited = new Set<string>();
  
  // Helper function to mark a decision and its descendants as rejected
  function markAsRejected(decisionId: string, force: boolean = false) {
    if (visited.has(decisionId) && !force) return;
    visited.add(decisionId);
    
    const decision = decisions[decisionId];
    if (decision) {
      // Force rejection if parent is rejected, otherwise only if undefined
      if (force || decision.selectedPath === undefined) {
        decision.selectedPath = false; // Mark as rejected
      }
    }
    
    // Recursively mark all children as rejected (forced)
    if (decision && decision.children) {
      decision.children.forEach(childId => markAsRejected(childId, true));
    }
  }
  
  // Helper function to mark a decision and its descendants as selected if they're not explicitly set
  function markAsSelected(decisionId: string, force: boolean = false) {
    if (visited.has(decisionId)) return;
    visited.add(decisionId);
    
    const decision = decisions[decisionId];
    if (decision && (decision.selectedPath === undefined || force)) {
      decision.selectedPath = true; // Mark as selected
    }
    
    // Recursively mark children that should be selected
    if (decision.children) {
      decision.children.forEach(childId => {
        const child = decisions[childId];
        if (child) {
          // If the child is explicitly selected or has no explicit setting, mark it as selected
          if (child.selectedPath === true || child.selectedPath === undefined) {
            markAsSelected(childId);
          }
        }
      });
    }
  }
  
  // First pass: Handle explicitly rejected decisions (this should override everything downstream)
  Object.values(decisions).forEach(decision => {
    if (decision.selectedPath === false) {
      visited.clear();
      markAsRejected(decision.id, true); // Force rejection of this decision and all children
    }
  });
  
  // Second pass: Handle explicitly selected decisions
  Object.values(decisions).forEach(decision => {
    if (decision.selectedPath === true) {
      visited.clear();
      markAsSelected(decision.id, true);
    }
  });
  
  // Third pass: Handle sibling conflicts - if one sibling is selected, others should be rejected
  Object.values(decisions).forEach(decision => {
    if (decision.children && decision.children.length > 1) {
      const selectedChildren = decision.children.filter(childId => 
        decisions[childId]?.selectedPath === true
      );
      
      // If at least one child is selected, mark the others as rejected
      if (selectedChildren.length > 0) {
        decision.children.forEach(childId => {
          const child = decisions[childId];
          if (child && child.selectedPath === undefined) {
            visited.clear();
            markAsRejected(childId);
          }
        });
      }
    }
  });
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

    // Validate status
    if (decision.status) {
      const validStatuses = ['proposed', 'accepted', 'rejected', 'deprecated'];
      if (!validStatuses.includes(decision.status)) {
        errors.push(`Decision "${decision.id}" has invalid status. Must be one of: proposed, accepted, rejected, deprecated`);
      }
    }

    // Validate risk level
    if (decision.riskLevel) {
      const validRiskLevels = ['low', 'medium', 'high'];
      if (!validRiskLevels.includes(decision.riskLevel)) {
        errors.push(`Decision "${decision.id}" has invalid risk level. Must be one of: low, medium, high`);
      }
    }

    // Validate date formats
    if (decision.decisionDate && !isValidDate(decision.decisionDate)) {
      errors.push(`Decision "${decision.id}" has invalid decision date format. Use YYYY-MM-DD format.`);
    }
    if (decision.lastReviewed && !isValidDate(decision.lastReviewed)) {
      errors.push(`Decision "${decision.id}" has invalid last reviewed date format. Use YYYY-MM-DD format.`);
    }

    // Validate supersedes references
    if (decision.supersedes) {
      decision.supersedes.forEach((supersededId) => {
        if (!allDecisionIds.includes(supersededId)) {
          errors.push(`Decision "${decision.id}" supersedes unknown decision: ${supersededId}`);
        }
      });
    }

    // Validate supersededBy reference
    if (decision.supersededBy && !allDecisionIds.includes(decision.supersededBy)) {
      errors.push(`Decision "${decision.id}" is superseded by unknown decision: ${decision.supersededBy}`);
    }

    // Validate links
    if (decision.links) {
      const linkIds = new Set<string>();
      decision.links.forEach((link) => {
        if (linkIds.has(link.id)) {
          errors.push(`Decision "${decision.id}" has duplicate link ID: ${link.id}`);
        }
        linkIds.add(link.id);

        // Validate link type
        if (link.type) {
          const validLinkTypes = ['rfc', 'ticket', 'confluence', 'github', 'documentation', 'other'];
          if (!validLinkTypes.includes(link.type)) {
            errors.push(`Decision "${decision.id}" link "${link.id}" has invalid type. Must be one of: ${validLinkTypes.join(', ')}`);
          }
        }
      });
    }

    // Validate implementation tasks
    if (decision.implementationTasks) {
      const taskIds = new Set<string>();
      decision.implementationTasks.forEach((task) => {
        if (taskIds.has(task.id)) {
          errors.push(`Decision "${decision.id}" has duplicate implementation task ID: ${task.id}`);
        }
        taskIds.add(task.id);

        // Validate task status
        if (task.status) {
          const validTaskStatuses = ['todo', 'in-progress', 'done', 'blocked'];
          if (!validTaskStatuses.includes(task.status)) {
            errors.push(`Decision "${decision.id}" task "${task.id}" has invalid status. Must be one of: todo, in-progress, done, blocked`);
          }
        }

        // Validate task due date
        if (task.dueDate && !isValidDate(task.dueDate)) {
          errors.push(`Decision "${decision.id}" task "${task.id}" has invalid due date format. Use YYYY-MM-DD format.`);
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

          // Validate impact level
          const validImpacts = ['minor', 'major', 'high'];
          if (!validImpacts.includes(pro.impact)) {
            errors.push(`Decision "${decision.id}" pro "${pro.id}" has invalid impact level. Must be one of: minor, major, high`);
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

          // Validate impact level
          const validImpacts = ['minor', 'major', 'high'];
          if (!validImpacts.includes(con.impact)) {
            errors.push(`Decision "${decision.id}" con "${con.id}" has invalid impact level. Must be one of: minor, major, high`);
          }
        });
      }
    }
  });

  return errors;
}