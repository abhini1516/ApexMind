import { db } from "./db";
import { 
  campaigns, dailyMetrics, anomalies, recommendations,
  type Campaign, type InsertCampaign,
  type DailyMetric, type Anomaly, type Recommendation
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignStatus(id: number, status: string): Promise<Campaign>;

  getDailyMetrics(campaignId: number): Promise<DailyMetric[]>;
  getAllDailyMetrics(startDate?: Date, endDate?: Date): Promise<DailyMetric[]>;

  getAnomalies(): Promise<(Anomaly & { campaignName: string })[]>;
  createAnomaly(anomaly: any): Promise<Anomaly>;

  getRecommendations(): Promise<(Recommendation & { campaignName: string })[]>;
  createRecommendation(recommendation: any): Promise<Recommendation>;

  getDashboardSummary(): Promise<{
    totalRevenue: number;
    totalSpend: number;
    revenueByChannel: { channel: string; revenue: number; spend: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {

  // ======================
  // Campaigns
  // ======================

  async getCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));

    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values(campaign)
      .returning();

    return newCampaign;
  }

  async updateCampaignStatus(id: number, status: string): Promise<Campaign> {
    const [updated] = await db
      .update(campaigns)
      .set({ status })
      .where(eq(campaigns.id, id))
      .returning();

    return updated;
  }

  // ======================
  // Metrics
  // ======================

  async getDailyMetrics(campaignId: number): Promise<DailyMetric[]> {
    return db
      .select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.campaignId, campaignId))
      .orderBy(desc(dailyMetrics.date));
  }

  async getAllDailyMetrics(startDate?: Date, endDate?: Date): Promise<DailyMetric[]> {
    if (startDate && endDate) {
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      return db
        .select()
        .from(dailyMetrics)
        .where(
          and(
            gte(dailyMetrics.date, start),
            lte(dailyMetrics.date, end)
          )
        );
    }

    return db.select().from(dailyMetrics);
  }

  // ======================
  // Anomalies
  // ======================

  async getAnomalies(): Promise<(Anomaly & { campaignName: string })[]> {
    return db
      .select({
        id: anomalies.id,
        campaignId: anomalies.campaignId,
        date: anomalies.date,
        metric: anomalies.metric,
        severity: anomalies.severity,
        description: anomalies.description,
        isResolved: anomalies.isResolved,
        campaignName: campaigns.name,
      })
      .from(anomalies)
      .innerJoin(campaigns, eq(anomalies.campaignId, campaigns.id))
      .orderBy(desc(anomalies.date));
  }

  async createAnomaly(anomaly: any): Promise<Anomaly> {
    const [newAnomaly] = await db
      .insert(anomalies)
      .values(anomaly)
      .returning();

    return newAnomaly;
  }

  // ======================
  // Recommendations
  // ======================

  async getRecommendations(): Promise<(Recommendation & { campaignName: string })[]> {
    return db
      .select({
        id: recommendations.id,
        campaignId: recommendations.campaignId,
        type: recommendations.type,
        suggestion: recommendations.suggestion,
        predictedImpact: recommendations.predictedImpact,
        status: recommendations.status,
        createdAt: recommendations.createdAt,
        campaignName: campaigns.name,
      })
      .from(recommendations)
      .innerJoin(campaigns, eq(recommendations.campaignId, campaigns.id))
      .orderBy(desc(recommendations.createdAt));
  }

  async createRecommendation(recommendation: any): Promise<Recommendation> {
    const [newRec] = await db
      .insert(recommendations)
      .values(recommendation)
      .returning();

    return newRec;
  }

  // ======================
  // Dashboard Summary
  // ======================

  async getDashboardSummary() {
    const allMetrics = await db
      .select({
        revenue: dailyMetrics.revenue,
        spend: dailyMetrics.spend,
        channel: campaigns.channel,
      })
      .from(dailyMetrics)
      .innerJoin(campaigns, eq(dailyMetrics.campaignId, campaigns.id));

    let totalRevenue = 0;
    let totalSpend = 0;
    const channelMap = new Map<string, { revenue: number; spend: number }>();

    for (const m of allMetrics) {
      const revenue = Number(m.revenue);
      const spend = Number(m.spend);
      const channel = m.channel;

      totalRevenue += revenue;
      totalSpend += spend;

      if (!channelMap.has(channel)) {
        channelMap.set(channel, { revenue: 0, spend: 0 });
      }

      const ch = channelMap.get(channel)!;
      ch.revenue += revenue;
      ch.spend += spend;
    }

    return {
      totalRevenue,
      totalSpend,
      revenueByChannel: Array.from(channelMap.entries()).map(
        ([channel, data]) => ({
          channel,
          revenue: data.revenue,
          spend: data.spend,
        })
      ),
    };
  }
}

export const storage = new DatabaseStorage();
