import { z } from 'zod';
import { 
  insertCampaignSchema, 
  campaigns, 
  anomalies, 
  recommendations, 
  budgetSimulationSchema,
  dailyMetrics
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    summary: {
      method: 'GET' as const,
      path: '/api/dashboard-summary' as const,
      responses: {
        200: z.object({
          totalRevenue: z.number(),
          totalSpend: z.number(),
          roi: z.number(),
          conversionRate: z.number(),
          budgetUtilization: z.number(),
          revenueByChannel: z.array(z.object({
            channel: z.string(),
            revenue: z.number(),
            spend: z.number(),
          })),
        }),
      },
    },
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns' as const,
      responses: {
        200: z.array(z.custom<typeof campaigns.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id' as const,
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    health: {
      method: 'GET' as const,
      path: '/api/campaign-health' as const,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          status: z.enum(['healthy', 'attention', 'critical']),
          roi: z.number(),
          metrics: z.object({
            spend: z.number(),
            revenue: z.number(),
          }),
        })),
      },
    },
  },
  simulation: {
    run: {
      method: 'POST' as const,
      path: '/api/budget-simulate' as const,
      input: budgetSimulationSchema,
      responses: {
        200: z.object({
          results: z.array(z.object({
            channel: z.string(),
            projectedRevenue: z.number(),
            projectedROI: z.number(),
            allocation: z.number(),
          })),
          totalProjectedRevenue: z.number(),
          totalProjectedROI: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  reports: {
    generate: {
      method: 'POST' as const,
      path: '/api/report' as const,
      input: z.object({
        dateRange: z.string().optional(),
        focusAreas: z.array(z.string()).optional(),
      }),
      responses: {
        200: z.object({
          summary: z.string(),
          keyInsights: z.array(z.string()),
          recommendations: z.array(z.string()),
        }),
      },
    },
  },
  anomalies: {
    list: {
      method: 'GET' as const,
      path: '/api/anomalies' as const,
      responses: {
        200: z.array(z.custom<typeof anomalies.$inferSelect & { campaignName: string }>()),
      },
    },
  },
  recommendations: {
    list: {
      method: 'GET' as const,
      path: '/api/recommendations' as const,
      responses: {
        200: z.array(z.custom<typeof recommendations.$inferSelect & { campaignName: string }>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
