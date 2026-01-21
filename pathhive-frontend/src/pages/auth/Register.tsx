import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hexagon, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the register action from context
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

    // Optional: Client-side validation before sending to server
    const isPasswordValid = passwordRequirements.every(req => req.met);
    if (!isPasswordValid) {
       toast({
         title: "Weak Password",
         description: "Please ensure your password meets all requirements.",
         variant: "destructive",
       });
       setIsLoading(false);
       return;
    }

    // Call the API via AuthContext
    // Note: The order of arguments must match your AuthContext definition
    const success = await register(email, password, fullName, username);

    if (success) {
      toast({
        title: "Welcome to PathHive!",
        description: "Your account has been created successfully.",
      });
      navigate("/dashboard");
    } else {
      // Explicitly handle the failure case here
      toast({
        title: "Registration Failed",
        description: "Username or Email might already be taken. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-dark items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 hexagon-pattern opacity-10" />
        <div className="relative z-10 text-center px-12">
          <div className="flex justify-center mb-8">
            <Hexagon className="h-20 w-20 text-primary fill-primary/20 animate-float" />
          </div>
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Join PathHive Today
          </h2>
          <p className="text-primary-foreground/70 max-w-md">
            Start learning from curated paths or create your own to help others. Your knowledge journey begins here.
          </p>

          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            {[
              "Access 500+ curated learning paths",
              "Track your progress visually",
              "Create and share your own paths",
              "AI-powered learning assistance"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-primary-foreground/80">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="relative">
              <Hexagon className="h-10 w-10 text-primary fill-primary/10" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                P
              </span>
            </div>
            <span className="font-display text-2xl font-bold">PathHive</span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-center mb-2">
            Create your account
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Start your learning journey today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
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
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-1.5">
                  {passwordRequirements.map((req, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 text-xs ${req.met ? 'text-success' : 'text-muted-foreground'}`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-success' : 'bg-muted'}`}>
                        {req.met && <Check className="h-2 w-2 text-success-foreground" />}
                      </div>
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="default" className="w-full" size="lg" disabled={isLoading}>
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