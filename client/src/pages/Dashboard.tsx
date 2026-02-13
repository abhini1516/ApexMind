import { useDashboardSummary } from "@/hooks/use-dashboard";
import { KPICard } from "@/components/KPICard";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  PieChart,
  RefreshCw
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">Failed to load dashboard data</h2>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Use dummy data for trend chart if not provided by summary
  const revenueData = data.revenueByChannel.map(channel => ({
    name: channel.channel,
    revenue: channel.revenue,
    spend: channel.spend,
    roi: ((channel.revenue - channel.spend) / channel.spend) * 100
  }));

  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Marketing Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time insights across all campaigns</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          Live Updates Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={formatCurrency(data.totalRevenue)} 
          change={12.5}
          trend="up"
          icon={DollarSign}
        />
        <KPICard 
          title="Total ROI" 
          value={`${data.roi.toFixed(1)}x`} 
          change={-2.4}
          trend="down"
          icon={TrendingUp}
        />
        <KPICard 
          title="Conversion Rate" 
          value={formatPercentage(data.conversionRate)} 
          change={0.8}
          trend="up"
          icon={Target}
        />
        <KPICard 
          title="Budget Utilization" 
          value={formatPercentage(data.budgetUtilization)} 
          change={0}
          trend="neutral"
          icon={PieChart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold">Revenue Distribution</h3>
            <p className="text-sm text-muted-foreground">Revenue vs Spend by Channel</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)' }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="spend" name="Spend" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} barSize={40} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ROI Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold">ROI by Channel</h3>
            <p className="text-sm text-muted-foreground">Return on Investment Percentage</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="roi" name="ROI %" radius={[0, 4, 4, 0]} barSize={32}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
