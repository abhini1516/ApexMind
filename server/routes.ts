import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { openai } from "./replit_integrations/audio/client"; // reusing openai client
import { campaigns, dailyMetrics, anomalies, recommendations } from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === DASHBOARD API ===
  app.get(api.dashboard.summary.path, async (req, res) => {
    const summary = await storage.getDashboardSummary();
    const roi = summary.totalSpend > 0 ? ((summary.totalRevenue - summary.totalSpend) / summary.totalSpend) * 100 : 0;
    
    // Mock conversion rate & budget utilization for now (or calculate from DB if we had budget data in metrics)
    const conversionRate = 3.2; // 3.2%
    const budgetUtilization = 78; // 78%

    res.json({
      totalRevenue: summary.totalRevenue,
      totalSpend: summary.totalSpend,
      roi: parseFloat(roi.toFixed(2)),
      conversionRate,
      budgetUtilization,
      revenueByChannel: summary.revenueByChannel,
    });
  });

  // === CAMPAIGNS API ===
  app.get(api.campaigns.list.path, async (req, res) => {
    const list = await storage.getCampaigns();
    res.json(list);
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.get(api.campaigns.health.path, async (req, res) => {
    const campaigns = await storage.getCampaigns();
    const healthData = [];

    for (const c of campaigns) {
      const metrics = await storage.getDailyMetrics(c.id);
      const totalSpend = metrics.reduce((sum, m) => sum + Number(m.spend), 0);
      const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.revenue), 0);
      const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

      let status: 'healthy' | 'attention' | 'critical' = 'healthy';
      if (roi < 100) status = 'critical'; // ROI < 100% (negative profit)
      else if (roi < 200) status = 'attention';

      healthData.push({
        id: c.id,
        name: c.name,
        status,
        roi: parseFloat(roi.toFixed(2)),
        metrics: { spend: totalSpend, revenue: totalRevenue },
      });
    }

    res.json(healthData);
  });

  // === SIMULATION API ===
  app.post(api.simulation.run.path, async (req, res) => {
    try {
      const input = api.simulation.run.input.parse(req.body);
      const results = [];
      let totalProjectedRevenue = 0;
      let totalProjectedSpend = 0;

      for (const alloc of input.allocations) {
        // Simple linear model: Revenue = Spend * Efficiency
        // Efficiency varies by channel (mocked)
        const efficiencyMap: Record<string, number> = {
          'Social': 3.5,
          'Search': 4.2,
          'Email': 5.0,
          'Display': 2.1,
        };
        const efficiency = efficiencyMap[alloc.channel] || 3.0;
        
        const projectedRevenue = alloc.amount * efficiency;
        const projectedROI = ((projectedRevenue - alloc.amount) / alloc.amount) * 100;

        results.push({
          channel: alloc.channel,
          projectedRevenue: parseFloat(projectedRevenue.toFixed(2)),
          projectedROI: parseFloat(projectedROI.toFixed(2)),
          allocation: alloc.amount,
        });

        totalProjectedRevenue += projectedRevenue;
        totalProjectedSpend += alloc.amount;
      }

      const totalProjectedROI = totalProjectedSpend > 0 
        ? ((totalProjectedRevenue - totalProjectedSpend) / totalProjectedSpend) * 100 
        : 0;

      res.json({
        results,
        totalProjectedRevenue: parseFloat(totalProjectedRevenue.toFixed(2)),
        totalProjectedROI: parseFloat(totalProjectedROI.toFixed(2)),
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Simulation failed" });
    }
  });

  // === REPORTS API (OpenAI) ===
  app.post(api.reports.generate.path, async (req, res) => {
    try {
      // Fetch summary data for context
      const summary = await storage.getDashboardSummary();
      const anomalies = await storage.getAnomalies();
      
      const prompt = `
        Analyze the following marketing data and generate an executive summary.
        
        Data:
        - Total Revenue: $${summary.totalRevenue}
        - Total Spend: $${summary.totalSpend}
        - Top Channel: ${summary.revenueByChannel.sort((a,b) => b.revenue - a.revenue)[0]?.channel}
        - Anomalies Detected: ${anomalies.length}
        
        Please provide:
        1. Executive Summary (2-3 sentences)
        2. Key Insights (bullet points)
        3. Strategic Recommendations
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Simple parsing (in a real app, use JSON mode)
      res.json({
        summary: content, // For now just sending the whole text as summary
        keyInsights: [],
        recommendations: []
      });

    } catch (err) {
      console.error("Report generation failed:", err);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // === ANOMALIES & RECOMMENDATIONS ===
  app.get(api.anomalies.list.path, async (req, res) => {
    const list = await storage.getAnomalies();
    res.json(list);
  });

  app.get(api.recommendations.list.path, async (req, res) => {
    const list = await storage.getRecommendations();
    res.json(list);
  });

  // Seed Data on Startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getCampaigns();
  if (existing.length > 0) return;

  console.log("Seeding database...");

  // 1. Create Campaigns
  const campaignData = [
    { name: "Q1 Social Blitz", channel: "Social", budgetAllocated: "50000", startDate: "2025-01-01" },
    { name: "Winter Search Terms", channel: "Search", budgetAllocated: "30000", startDate: "2025-01-01" },
    { name: "Newsletter Retention", channel: "Email", budgetAllocated: "10000", startDate: "2025-01-01" },
    { name: "Retargeting Display", channel: "Display", budgetAllocated: "20000", startDate: "2025-01-01" },
  ];

  const createdCampaigns = [];
  for (const c of campaignData) {
    createdCampaigns.push(await storage.createCampaign(c));
  }

  // 2. Generate Daily Metrics (Last 30 days)
  const today = new Date();
  for (const c of createdCampaigns) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Randomize data
      const baseSpend = Number(c.budgetAllocated) / 90; // approx daily
      const spend = (baseSpend * (0.8 + Math.random() * 0.4)).toFixed(2); // +/- 20%
      const impressions = Math.floor(Number(spend) * (c.channel === 'Display' ? 100 : 20)); 
      const clicks = Math.floor(impressions * (c.channel === 'Search' ? 0.05 : 0.01));
      const conversions = Math.floor(clicks * 0.1);
      const revenue = (conversions * (50 + Math.random() * 50)).toFixed(2);

      await db.insert(dailyMetrics).values({
        campaignId: c.id,
        date: date.toISOString().split('T')[0],
        impressions,
        clicks,
        conversions,
        spend: spend.toString(),
        revenue: revenue.toString(),
      });
    }
  }

  // 3. Create Anomalies & Recommendations
  const campaign = createdCampaigns[0]; // Social
  await storage.createAnomaly({
    campaignId: campaign.id,
    metric: "spend",
    severity: "high",
    description: "Spend spike detected on 2025-02-10 (45% above average)",
    isResolved: false
  });

  await storage.createRecommendation({
    campaignId: campaign.id,
    type: "budget",
    suggestion: "Decrease budget by 15% on weekends for Social Blitz",
    predictedImpact: "+5% ROI",
    status: "pending"
  });

  console.log("Database seeded!");
}
