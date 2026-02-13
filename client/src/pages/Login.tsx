import { ArrowRight, Zap } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Side - Brand */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/80 to-accent/80 mix-blend-multiply"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">ApexMind</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display font-bold text-5xl leading-tight mb-6">
            Where Analytics Meets Action.
          </h1>
          <p className="text-lg text-primary-foreground/90 leading-relaxed">
            The AI-driven decision intelligence system designed for modern marketing teams. Simulate budgets, detect anomalies, and drive growth in real-time.
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © 2024 ApexMind Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to access your intelligence dashboard.</p>
          </div>

          <div className="space-y-4">
            <a 
              href="/api/login"
              className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-foreground hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Log in with Replit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Secure Enterprise Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
