import { pgTable, text, serial, integer, boolean, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth Models
export * from "./models/auth";
export * from "./models/chat";

// === CAMPAIGNS ===
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // active, paused, completed
  channel: text("channel").notNull(), // Social, Search, Email, Display
  budgetAllocated: numeric("budget_allocated").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === DAILY METRICS ===
export const dailyMetrics = pgTable("daily_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  date: date("date").notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  spend: numeric("spend").notNull().default("0"),
  revenue: numeric("revenue").notNull().default("0"),
});

// === ANOMALIES ===
export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  date: timestamp("date").defaultNow(),
  metric: text("metric").notNull(), // spend, conversions, roi
  severity: text("severity").notNull(), // low, medium, high
  description: text("description").notNull(),
  isResolved: boolean("is_resolved").default(false),
});

// === RECOMMENDATIONS ===
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  type: text("type").notNull(), // budget, status, strategy
  suggestion: text("suggestion").notNull(),
  predictedImpact: text("predicted_impact"),
  status: text("status").default("pending"), // pending, applied, dismissed
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const campaignsRelations = relations(campaigns, ({ many }) => ({
  metrics: many(dailyMetrics),
  anomalies: many(anomalies),
  recommendations: many(recommendations),
}));

export const dailyMetricsRelations = relations(dailyMetrics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [dailyMetrics.campaignId],
    references: [campaigns.id],
  }),
}));

export const anomaliesRelations = relations(anomalies, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [anomalies.campaignId],
    references: [campaigns.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [recommendations.campaignId],
    references: [campaigns.id],
  }),
}));

// === SCHEMAS ===
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertMetricSchema = createInsertSchema(dailyMetrics).omit({ id: true });
export const insertAnomalySchema = createInsertSchema(anomalies).omit({ id: true, date: true, isResolved: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true, status: true });

// === TYPES ===
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type DailyMetric = typeof dailyMetrics.$inferSelect;
export type Anomaly = typeof anomalies.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;

export type CampaignWithMetrics = Campaign & { metrics: DailyMetric[] };

// Simulator Types
export const budgetSimulationSchema = z.object({
  allocations: z.array(z.object({
    channel: z.string(),
    amount: z.number(),
  })),
  totalBudget: z.number(),
});

export type BudgetSimulationRequest = z.infer<typeof budgetSimulationSchema>;

export type SimulationResult = {
  channel: string;
  projectedRevenue: number;
  projectedROI: number;
  allocation: number;
};
