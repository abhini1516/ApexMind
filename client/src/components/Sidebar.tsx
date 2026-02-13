import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BarChart3, 
  PieChart, 
  FileText, 
  AlertTriangle,
  Settings,
  LogOut,
  User,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: BarChart3 },
    { href: "/simulator", label: "Budget Simulator", icon: PieChart },
    { href: "/reports", label: "AI Reports", icon: FileText },
    { href: "/anomalies", label: "Anomalies & Insights", icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-background border-r border-border/50 sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight">ApexMind</h1>
            <p className="text-xs text-muted-foreground font-medium">Marketing Intelligence</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.firstName || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "Guest"}</p>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 w-full px-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
