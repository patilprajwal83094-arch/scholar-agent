export interface PaperMeta {
  title: string;
  authors: string[];
  year: string;
  arxivId?: string | null;
  venue?: string;
  githubReference?: string | null;
  url: string;
  tag?: string;
}

export interface CoreConcept {
  problemStatement: string;
  primaryMethodology: string;
  mathematicalBreakthroughs: string;
  fullSummary: string;
  wordCount: number;
}

export interface NodeSummary {
  id: string;
  name: string;
  role: string;
}

export interface FlowchartData {
  mermaidCode: string;
  labeledSegment: string;
  nodesSummary?: NodeSummary[];
}

export interface StudentOpportunity {
  id: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedContribution: string;
  targetedPerformanceMetric: string;
  recommendedTechStack: string[];
  estimatedWeeks: number;
  resumeBullet: string;
  implementationPlan: string[];
  engineeringTakeaway?: string;
}

export interface TokenStats {
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
  tokenBudget: number;
  tokenBudgetRemaining: number;
  efficiencyRating: string;
  executionTimeMs: number;
}

export interface AnalysisResult {
  paper: PaperMeta;
  coreConcept: CoreConcept;
  flowchart: FlowchartData;
  studentOpportunities: StudentOpportunity[];
  tokenStats: TokenStats;
  rawOutput?: string;
  analyzedAt: string;
}

export interface PresetPaper {
  id: string;
  title: string;
  arxivId: string;
  url: string;
  year: string;
  venue: string;
  category: string;
  authors: string[];
  tag: string;
}
