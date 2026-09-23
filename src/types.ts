export type ModuleId = 'sequence' | 'condition' | 'loop' | 'variable' | 'sort' | 'search' | 'sandbox';

export type Direction = 'north' | 'east' | 'south' | 'west';

export interface GridPos {
  x: number;
  y: number;
}

export type ActionType = 
  | 'forward' 
  | 'turn_left' 
  | 'turn_right' 
  | 'collect' 
  | 'use_key'
  | 'plant'
  | 'water'
  | 'jump';

export interface ActionBlock {
  id: string;
  type: ActionType;
  label: string;
  iconName: string;
  description: string;
  color: string;
}

export interface LoopBlock {
  id: string;
  type: 'loop_count' | 'loop_while';
  times: number;
  condition?: 'path_ahead' | 'plant_ahead';
  actions: ActionBlock[];
}

export type ProgramBlock = 
  | { kind: 'action'; block: ActionBlock }
  | { kind: 'loop'; block: LoopBlock }
  | { kind: 'condition'; block: ConditionBlockData };

export interface ConditionBlockData {
  id: string;
  conditionType: 'color_equals' | 'has_key' | 'value_gte';
  expectedValue: string | number | boolean;
  thenActions: ActionBlock[];
  elseActions: ActionBlock[];
}

export interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'water' | 'crystal' | 'exit' | 'start' | 'key' | 'gate' | 'soil' | 'seed' | 'flower';
  gateClosed?: boolean;
}

export interface SequenceLevel {
  id: number;
  title: string;
  subtitle: string;
  conceptTitle: string;
  conceptDescription: string;
  analogy: string;
  gridSize: { width: number; height: number };
  robotStart: { pos: GridPos; dir: Direction };
  cells: GridCell[];
  maxBlocks?: number;
  allowedActions: ActionType[];
  hint: string;
}

export interface ConveyorItem {
  id: string;
  name: string;
  type: 'ruby' | 'sapphire' | 'emerald' | 'rock';
  color: string;
  weight: 'light' | 'heavy';
  destinationTube: 'A' | 'B' | 'C';
}

export interface ConditionLevel {
  id: number;
  title: string;
  subtitle: string;
  conceptTitle: string;
  conceptDescription: string;
  analogy: string;
  sampleItems: ConveyorItem[];
  ruleDescription: string;
  availableSensors: Array<{ id: string; label: string }>;
  availableActions: Array<{ id: string; label: string; tube: 'A' | 'B' }>;
  targetAccuracy: number;
}

export interface UserProgress {
  completedLevels: Record<string, boolean>; // e.g. "sequence-1": true
  completedModules: Record<ModuleId, boolean>;
  totalStars: number;
  soundEnabled: boolean;
}
