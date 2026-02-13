import { useCampaigns, useCampaignHealth } from "@/hooks/use-dashboard";
import { format } from "date-fns";
import { BadgeCheck, AlertCircle, XCircle, Search, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { data: health } = useCampaignHealth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (isLoading) return <div className="p-8">Loading campaigns...</div>;

  const getHealthStatus = (id: number) => {
    return health?.find(h => h.id === id)?.status || 'healthy';
  };

  const filteredCampaigns = campaigns?.filter(c => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900';
      case 'paused': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900';
      case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getHealthBadge = (status: string) => {
    switch(status) {
      case 'healthy': return <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><BadgeCheck className="w-4 h-4" /> Healthy</span>;
      case 'attention': return <span className="flex items-center gap-1.5 text-amber-600 font-medium"><AlertCircle className="w-4 h-4" /> Needs Review</span>;
      case 'critical': return <span className="flex items-center gap-1.5 text-rose-600 font-medium"><XCircle className="w-4 h-4" /> Critical</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage and monitor active marketing initiatives</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="pl-9 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm w-64"
            />
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-1">
            {['all', 'active', 'paused'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize",
                  statusFilter === filter 
                    ? "bg-secondary text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign Name</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredCampaigns?.map((campaign) => (
              <tr key={campaign.id} className="group hover:bg-muted/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-semibold text-foreground">{campaign.name}</div>
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">{campaign.channel}</td>
                <td className="py-4 px-6 font-medium font-mono text-sm">
                  ${Number(campaign.budgetAllocated).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border capitalize", getStatusColor(campaign.status))}>
                    {campaign.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">
                  {format(new Date(campaign.startDate), 'MMM d, yyyy')}
                </td>
                <td className="py-4 px-6 text-sm">
                  {getHealthBadge(getHealthStatus(campaign.id))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
