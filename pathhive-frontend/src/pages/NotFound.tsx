import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Hexagon, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background hexagon-pattern">
      <div className="text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Hexagon className="h-24 w-24 text-primary fill-primary/10" />
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary">
              404
            </span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button variant="hero" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
