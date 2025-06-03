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
  selectedPath?: boolean; // true = chosen path (green), false = rejected path (red), undefined = neutral
}

// Node data types for ReactFlow
export interface DecisionNodeData {
  decision: DecisionPoint;
  isSelected: boolean;
  onSelect: () => void;
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
  selectedPath?: boolean;
} 