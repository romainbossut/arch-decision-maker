export interface ExternalDependency {
  id: string;
  title: string;
  description?: string;
  expectedResolutionDate?: string; // ISO date string (YYYY-MM-DD)
  isOverdue?: boolean; // calculated field for display
}

export interface ProsConsItem {
  id: string;
  title: string;
  description?: string;
  impact: 'minor' | 'major' | 'high'; // Replace numeric rating with impact levels
}

export interface ProsCons {
  pros?: ProsConsItem[];
  cons?: ProsConsItem[];
}

export interface DecisionPoint {
  id: string;
  title: string;
  description: string;
  drawIoUrl?: string;
  dependencies?: string[];
  children?: string[];
  position?: {
    x: number;
    y: number;
  };
  externalDependencies?: ExternalDependency[];
  prosCons?: ProsCons;
  
  // Auditable and traceable fields
  status?: 'proposed' | 'accepted' | 'rejected' | 'deprecated';
  owner?: string;
  authors?: string[];
  decisionDate?: string; // ISO date string (YYYY-MM-DD)
  lastReviewed?: string; // ISO date string (YYYY-MM-DD)
  supersedes?: string[]; // IDs of decisions this one supersedes
  supersededBy?: string; // ID of decision that supersedes this one
  tags?: string[]; // e.g. ['security', 'performance', 'cost']
  riskLevel?: 'low' | 'medium' | 'high';
  costEstimate?: string; // e.g. "2-3 weeks", "$50k", "High"
  links?: Link[];
  implementationTasks?: ImplementationTask[];
}

export interface Link {
  id: string;
  title: string;
  url: string;
  type?: 'rfc' | 'ticket' | 'confluence' | 'github' | 'documentation' | 'other';
}

export interface ImplementationTask {
  id: string;
  title: string;
  url?: string;
  status?: 'todo' | 'in-progress' | 'done' | 'blocked';
  assignee?: string;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
}

// Node data types for ReactFlow
export interface DecisionNodeData {
  decision: DecisionPoint;
  isSelected: boolean;
  onSelect: () => void;
  onExpansionChange?: (nodeId: string, isExpanded: boolean) => void;
  isExpanded?: boolean;
  isInheritedRejection?: boolean; // true if rejected due to dependency rejection
}

export interface ExternalDependencyNodeData {
  dependency: ExternalDependency;
  parentDecisionId: string;
  isSelected: boolean;
  onSelect: () => void;
}

export interface ArchitectureDecisionTree {
  name: string;
  description?: string;
  decisions: Record<string, DecisionPoint>;
  rootDecisions: string[];
}

export interface YamlDecisionTree {
  name: string;
  description?: string;
  decisions: YamlDecisionPoint[];
}

export interface YamlDecisionPoint {
  id: string;
  title: string;
  description: string;
  drawIoUrl?: string;
  dependencies?: string[];
  externalDependencies?: ExternalDependency[];
  prosCons?: ProsCons;
  
  // Auditable and traceable fields (same as DecisionPoint)
  status?: 'proposed' | 'accepted' | 'rejected' | 'deprecated';
  owner?: string;
  authors?: string[];
  decisionDate?: string; // ISO date string (YYYY-MM-DD)
  lastReviewed?: string; // ISO date string (YYYY-MM-DD)
  supersedes?: string[]; // IDs of decisions this one supersedes
  supersededBy?: string; // ID of decision that supersedes this one
  tags?: string[]; // e.g. ['security', 'performance', 'cost']
  riskLevel?: 'low' | 'medium' | 'high';
  costEstimate?: string; // e.g. "2-3 weeks", "$50k", "High"
  links?: Link[];
  implementationTasks?: ImplementationTask[];
} 