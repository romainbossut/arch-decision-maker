export interface ExternalDependency {
  id: string;
  title: string;
  description?: string;
  expectedResolutionDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface ProsConsItem {
  id: string;
  title: string;
  description?: string;
  rating: number; // 1-5 scale
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
  externalDependencies?: ExternalDependency[];
  prosCons?: ProsCons;
  children?: string[];
  position?: {
    x: number;
    y: number;
  };
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
} 