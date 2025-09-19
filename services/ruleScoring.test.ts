// src/services/ruleScoring.test.ts
import { calculateRuleScore, Lead, Offer } from "./ruleScoring";

describe("Rule Layer Scoring", () => {
  const offer: Offer = {
    name: "AI Outreach Automation",
    value_props: ["24/7 outreach", "6x more meetings"],
    ideal_use_cases: ["SaaS", "B2B SaaS mid-market"],
  };

  it("should score a decision maker in ICP with complete data", () => {
    const lead: Lead = {
      name: "Ava Patel",
      role: "Head of Growth",
      company: "FlowMetrics",
      industry: "SaaS",
      location: "NY",
      linkedin_bio: "Experienced in B2B SaaS outreach",
    };

    const score = calculateRuleScore(lead, offer);
    expect(score).toBe(50); // 20 + 20 + 10
  });

  it("should score an influencer in adjacent industry with missing data", () => {
    const lead: Lead = {
      name: "John Doe",
      role: "Manager",
      company: "",
      industry: "Software",
      location: "CA",
      linkedin_bio: "",
    };

    const score = calculateRuleScore(lead, offer);
    expect(score).toBe(20); // 10 + 10 + 0
  });

  it("should score zero for irrelevant role and empty fields", () => {
    const lead: Lead = {
      name: "",
      role: "Intern",
      company: "",
      industry: "Healthcare",
      location: "",
      linkedin_bio: "",
    };

    const score = calculateRuleScore(lead, offer);
    expect(score).toBe(10); // 0 + 10 + 0
  });
});
