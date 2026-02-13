import { db } from "./db";
import { 
  campaigns, dailyMetrics, anomalies, recommendations,
  type Campaign, type InsertCampaign,
  type DailyMetric, type Anomaly, type Recommendation,
  type CampaignWithMetrics
} from "@shared/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat/storage";

export interface IStorage extends IAuthStorage, IChatStorage {
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignStatus(id: number, status: string): Promise<Campaign>;

  // Metrics
  getDailyMetrics(campaignId: number): Promise<DailyMetric[]>;
  getAllDailyMetrics(startDate?: Date, endDate?: Date): Promise<DailyMetric[]>;
  
  // Anomalies
  getAnomalies(): Promise<(Anomaly & { campaignName: string })[]>;
  createAnomaly(anomaly: any): Promise<Anomaly>;

  // Recommendations
  getRecommendations(): Promise<(Recommendation & { campaignName: string })[]>;
  createRecommendation(recommendation: any): Promise<Recommendation>;
  
  // Dashboard Aggregates
  getDashboardSummary(): Promise<{
    totalRevenue: number;
    totalSpend: number;
    revenueByChannel: { channel: string; revenue: number; spend: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Inherit Auth & Chat
  getUser = authStorage.getUser;
  upsertUser = authStorage.upsertUser;
  getConversation = chatStorage.getConversation;
  getAllConversations = chatStorage.getAllConversations;
  createConversation = chatStorage.createConversation;
  deleteConversation = chatStorage.deleteConversation;
  getMessagesByConversation = chatStorage.getMessagesByConversation;
  createMessage = chatStorage.createMessage;

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaignStatus(id: number, status: string): Promise<Campaign> {
    const [updated] = await db.update(campaigns)
      .set({ status })
      .where(eq(campaigns.id, id))
      .returning();
    return updated;
  }

  // Metrics
  async getDailyMetrics(campaignId: number): Promise<DailyMetric[]> {
    return await db.select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.campaignId, campaignId))
      .orderBy(desc(dailyMetrics.date));
  }

  async getAllDailyMetrics(startDate?: Date, endDate?: Date): Promise<DailyMetric[]> {
    let query = db.select().from(dailyMetrics);
    
    if (startDate && endDate) {
       // @ts-ignore - Date comparison works in SQL
       query.where(and(gte(dailyMetrics.date, startDate), lte(dailyMetrics.date, endDate)));
    }
    
    return await query;
  }

  // Anomalies
  async getAnomalies(): Promise<(Anomaly & { campaignName: string })[]> {
    const result = await db.select({
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
    
    return result;
  }

  async createAnomaly(anomaly: any): Promise<Anomaly> {
    const [newAnomaly] = await db.insert(anomalies).values(anomaly).returning();
    return newAnomaly;
  }

  // Recommendations
  async getRecommendations(): Promise<(Recommendation & { campaignName: string })[]> {
    const result = await db.select({
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

    return result;
  }

  async createRecommendation(recommendation: any): Promise<Recommendation> {
    const [newRec] = await db.insert(recommendations).values(recommendation).returning();
    return newRec;
  }

  // Dashboard Aggregates
  async getDashboardSummary() {
    // This is a simple aggregation. For production, efficient SQL queries are better.
    const allMetrics = await db.select({
      revenue: dailyMetrics.revenue,
      spend: dailyMetrics.spend,
      channel: campaigns.channel,
    })
    .from(dailyMetrics)
    .innerJoin(campaigns, eq(dailyMetrics.campaignId, campaigns.id));

    let totalRevenue = 0;
    let totalSpend = 0;
    const channelMap = new Map<string, { revenue: number, spend: number }>();

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

    const revenueByChannel = Array.from(channelMap.entries()).map(([channel, data]) => ({
      channel,
      revenue: data.revenue,
      spend: data.spend,
    }));

    return {
      totalRevenue,
      totalSpend,
      revenueByChannel,
    };
  }
}

export const storage = new DatabaseStorage();
