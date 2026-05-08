import assuranceData from '@/data/module-assurance.json';
import type { Page } from '@/App';

export type EvidenceLevel = 'strong' | 'moderate' | 'limited';

export interface ModuleAssurance {
  id: Exclude<Page, 'home' | 'assurance' | 'challenges'>;
  title: string;
  category: string;
  evidenceLevel: EvidenceLevel;
  specSections: string[];
  vectorSources: string[];
  testIds: string[];
  limitations: string[];
}

export const ASSURANCE_MODULES = assuranceData as ModuleAssurance[];

export const ASSURANCE_LEVEL_LABELS: Record<EvidenceLevel, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  limited: 'Limited',
};

export function getAssuranceForPage(page: Page): ModuleAssurance | null {
  if (page === 'home' || page === 'assurance' || page === 'challenges') return null;
  return ASSURANCE_MODULES.find(module => module.id === page) ?? null;
}

export function countEvidenceLevels() {
  return ASSURANCE_MODULES.reduce<Record<EvidenceLevel, number>>((counts, module) => {
    counts[module.evidenceLevel] += 1;
    return counts;
  }, { strong: 0, moderate: 0, limited: 0 });
}
