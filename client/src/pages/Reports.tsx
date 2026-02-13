import { useGenerateReport } from "@/hooks/use-dashboard";
import { useState } from "react";
import { FileText, Sparkles, Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  const { mutate: generate, data: report, isPending } = useGenerateReport();
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  const toggleFocus = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleGenerate = () => {
    generate({ focusAreas });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Executive Reports</h1>
          <p className="text-muted-foreground mt-1">AI-generated summaries for stakeholders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-primary" />
              Report Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {['ROI', 'Budget', 'Conversion', 'Anomalies', 'Strategy'].map(area => (
                    <button
                      key={area}
                      onClick={() => toggleFocus(area)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        focusAreas.includes(area)
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Date Range</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Last 30 Days
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-accent shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {isPending ? "Generating..." : "Generate with AI"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          {report ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
            >
              <div className="p-8 border-b border-border/50 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Marketing Performance Executive Summary</h2>
                  <p className="text-sm text-muted-foreground mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Executive Summary</h3>
                  <p className="leading-relaxed text-foreground/80">{report.summary}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Key Insights</h3>
                  <ul className="space-y-3">
                    {report.keyInsights.map((insight: string, i: number) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-foreground/80">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-accent/5 rounded-xl p-6 border border-accent/10">
                  <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {report.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 font-medium">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/10 rounded-2xl border-2 border-dashed border-border">
              <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No Report Generated</h3>
              <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">
                Configure your focus areas and click Generate to create a comprehensive AI analysis of your marketing data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
