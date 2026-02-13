import { useAnomalies, useRecommendations } from "@/hooks/use-dashboard";
import { AlertOctagon, CheckCircle2, XCircle, Zap, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Anomalies() {
  const { data: anomalies, isLoading: loadingAnomalies } = useAnomalies();
  const { data: recommendations, isLoading: loadingRecs } = useRecommendations();

  if (loadingAnomalies || loadingRecs) return <div className="p-8">Loading insights...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Anomalies & Insights</h1>
        <p className="text-muted-foreground mt-1">AI-detected irregularities and strategic recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Anomalies List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-destructive" />
            Detected Anomalies
          </h2>
          <div className="grid gap-4">
            {anomalies?.map((anomaly) => (
              <div key={anomaly.id} className="bg-card p-5 rounded-xl border border-border shadow-sm flex gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  anomaly.severity === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-700'
                }`}>
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{anomaly.campaignName}</span>
                    <span className="text-xs text-muted-foreground">• {format(new Date(anomaly.date!), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border text-muted-foreground">
                      {anomaly.metric}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                       anomaly.severity === 'high' 
                       ? 'bg-red-50 text-red-700 border-red-200' 
                       : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {anomaly.severity} Severity
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!anomalies || anomalies.length === 0) && (
              <div className="p-8 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border">
                <p className="text-muted-foreground">No anomalies detected in the last 24 hours.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Strategic Recommendations
          </h2>
          <div className="grid gap-4">
            {recommendations?.map((rec) => (
              <div key={rec.id} className="bg-gradient-to-br from-card to-accent/5 p-5 rounded-xl border border-border/50 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{rec.campaignName}</h3>
                    <p className="text-xs text-primary font-medium uppercase tracking-wide mt-0.5">{rec.type} Strategy</p>
                  </div>
                  <div className="px-2 py-1 bg-background/50 backdrop-blur rounded text-xs font-medium text-muted-foreground border border-border/50">
                    Impact: {rec.predictedImpact}
                  </div>
                </div>
                
                <p className="text-sm text-foreground/80 mb-4">{rec.suggestion}</p>

                <div className="flex gap-3">
                  <button className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Apply
                  </button>
                  <button className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
             {(!recommendations || recommendations.length === 0) && (
              <div className="p-8 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border">
                <p className="text-muted-foreground">No active recommendations at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
