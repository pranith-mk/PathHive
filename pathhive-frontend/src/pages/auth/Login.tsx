import { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hexagon, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Get 'user' and 'isAuthenticated' to check role
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 3. EFFECT: Handle Redirection based on Role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.is_staff || user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard"); 
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="relative">
              <Hexagon className="h-10 w-10 text-primary fill-primary/10" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                P
              </span>
            </div>
            <span className="font-display text-2xl font-bold">PathHive</span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-center mb-2">
            Welcome back
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Log in to continue your learning journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-dark items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 hexagon-pattern opacity-10" />
        <div className="relative z-10 text-center px-12">
          <div className="flex justify-center mb-8">
            <Hexagon className="h-20 w-20 text-primary fill-primary/20 animate-float" />
          </div>
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Continue Your Journey
          </h2>
          <p className="text-primary-foreground/70 max-w-md">
            Pick up right where you left off. Your learning paths and progress are waiting for you.
          </p>
        </div>
      </div>
    </div>
  );
}