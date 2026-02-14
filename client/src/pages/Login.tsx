import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/80 to-accent/80"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl">
              ApexMind
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display font-bold text-5xl leading-tight mb-6">
            Where Analytics Meets Action.
          </h1>
          <p className="text-lg text-primary-foreground/90">
            AI-driven decision intelligence for modern marketing teams.
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © 2024 ApexMind Inc.
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-display font-bold">
              Welcome Back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={isLoggingIn}
              className="group w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-white bg-foreground hover:bg-foreground/90 transition-all shadow-lg"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
