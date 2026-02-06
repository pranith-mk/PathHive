import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hexagon, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; 

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track specific field errors for red borders
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains a letter", met: /[a-zA-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Reset errors

    // 1. Validate Password Match
    if (password !== confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: true }));
        toast({
            title: "Passwords do not match",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    // 2. Validate Strength
    const isPasswordValid = passwordRequirements.every(req => req.met);
    if (!isPasswordValid) {
       setErrors(prev => ({ ...prev, password: true }));
       toast({ title: "Weak Password", description: "Please meet all password requirements.", variant: "destructive" });
       setIsLoading(false);
       return;
    }

    const success = await register(email, password, fullName, username);

    if (success) {
      toast({
        title: "Welcome to PathHive!",
        description: "Your account has been created successfully.",
      });
      // Pass flag to Dashboard
      navigate("/dashboard", { state: { newUser: true } });
    } else {
      toast({
        title: "Registration Failed",
        description: "Username or Email might already be taken.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 text-center px-12 text-white">
          <div className="flex justify-center mb-8">
            <Hexagon className="h-20 w-20 text-orange-500 fill-orange-500/20 animate-bounce duration-3000" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Join PathHive Today</h2>
          <p className="opacity-70 max-w-md mx-auto">
            Start learning from curated paths or create your own to help others.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <Hexagon className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">PathHive</span>
          </Link>

          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-muted-foreground mb-8">Enter your details below to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Username */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(errors.password && "border-red-500 focus-visible:ring-red-500")}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(errors.confirmPassword && "border-red-500 focus-visible:ring-red-500")}
                required
              />
            </div>

            {/* RESTORED: Bullet Point Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors", 
                      req.met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full flex items-center justify-center border transition-all",
                      req.met 
                        ? "bg-green-600 border-green-600 text-white" 
                        : "bg-transparent border-slate-300 dark:border-slate-700"
                    )}>
                      {req.met && <Check className="h-2.5 w-2.5" />}
                    </div>
                    {req.text}
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
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
    </div>
  );
}