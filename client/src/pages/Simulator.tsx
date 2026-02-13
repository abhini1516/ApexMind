import { useBudgetSimulation } from "@/hooks/use-dashboard";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_ALLOCATION = [
  { channel: "Social", amount: 5000 },
  { channel: "Search", amount: 8000 },
  { channel: "Email", amount: 2000 },
  { channel: "Display", amount: 4000 },
];

export default function Simulator() {
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATION);
  const { mutate: runSimulation, data: result, isPending } = useBudgetSimulation();

  const totalBudget = allocations.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSliderChange = (channel: string, value: number) => {
    setAllocations(prev => prev.map(a => 
      a.channel === channel ? { ...a, amount: value } : a
    ));
  };

  const handleSimulate = () => {
    runSimulation({ allocations, totalBudget });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground">Budget Simulator</h1>
        <p className="text-muted-foreground mt-2 text-lg">Predict ROI impact by reallocating your marketing spend</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              Allocations
            </h2>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Budget</p>
              <p className="text-xl font-bold font-mono text-primary">{formatCurrency(totalBudget)}</p>
            </div>
          </div>

          <div className="space-y-6">
            {allocations.map((alloc) => (
              <div key={alloc.channel} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-foreground">{alloc.channel}</label>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                    {formatCurrency(alloc.amount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={alloc.amount}
                  onChange={(e) => handleSliderChange(alloc.channel, Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSimulate}
            disabled={isPending}
            className="w-full py-4 rounded-xl font-semibold text-white bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                Run Simulation
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-secondary dark:from-card dark:to-black rounded-2xl p-8 border border-border shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-widest text-xs mb-6">Projection Results</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">Proj. Revenue</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-emerald-900 dark:text-emerald-300">
                    {formatCurrency(result.totalProjectedRevenue)}
                  </p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">Proj. ROI</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-indigo-900 dark:text-indigo-300">
                    {result.totalProjectedROI.toFixed(2)}x
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Channel Breakdown</p>
                {result.results.map((r: any) => (
                  <div key={r.channel} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-primary rounded-full opacity-50" style={{ height: `${(r.projectedROI / 5) * 20}px` }} />
                      <span className="font-medium">{r.channel}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(r.projectedRevenue)}</p>
                      <p className="text-xs text-muted-foreground">{r.projectedROI.toFixed(1)}x ROI</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-muted/20 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Ready to Simulate</p>
              <p className="text-sm max-w-xs mt-2">Adjust the budget allocations and click "Run Simulation" to see AI-predicted outcomes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
