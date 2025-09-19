// src/services/ruleScoring.ts
export interface Lead {
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  linkedin_bio: string;
}

export interface Offer {
  name: string;
  value_props: string[];
  ideal_use_cases: string[];
}

export function calculateRuleScore(lead: Lead, offer: Offer): number {
  let ruleScore = 0;
  const decisionMakers = ["Head of Growth", "VP Sales", "CEO", "Founder"];
  const influencers = ["Manager", "Director"];

  if (decisionMakers.includes(lead.role)) ruleScore += 20;
  else if (influencers.includes(lead.role)) ruleScore += 10;

  const icp = offer.ideal_use_cases;
  if (icp.some((i) => i.toLowerCase() === lead.industry.toLowerCase())) ruleScore += 20;
  else ruleScore += 10;

  if (lead.name && lead.role && lead.company && lead.industry && lead.location && lead.linkedin_bio)
    ruleScore += 10;

  return ruleScore;
}
