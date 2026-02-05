import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PathCard } from "@/components/shared/PathCard";
import { Badge } from "@/components/ui/badge";
import { 
  Hexagon, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp,
  BookOpen,
  MessageSquare,
  Zap,
  Loader2 
} from "lucide-react";

import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";

export default function Landing() {
  const navigate = useNavigate();
  
  const [featuredPaths, setFeaturedPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch paths now (Removed getAllTags call)
        const allPaths = await pathService.getAllPaths();

        // 1. Filter Published Paths
        const published = allPaths.filter(p => p.is_published);

        // 2. Sort by Rating (Highest First)
        const topRated = published.sort((a, b) => 
            (b.average_rating || 0) - (a.average_rating || 0)
        );

        // 3. Take Top 3
        setFeaturedPaths(topRated.slice(0, 3));

      } catch (error) {
        console.error("Failed to fetch landing page data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden hexagon-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Your Learning Journey Starts Here
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up">
              Curate, Learn, and{" "}
              <span className="text-gradient">Share</span>{" "}
              Knowledge Paths
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              PathHive helps you follow structured learning journeys created by experts 
              and the community. Stop getting lost in scattered tutorials.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" onClick={() => navigate("/register")}>
                Start Learning Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate("/browse")}>
                Browse Paths
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Learning Paths</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">95%</p>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative hexagons */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <Hexagon className="h-24 w-24 text-primary fill-primary/20" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 animate-float" style={{ animationDelay: "2s" }}>
          <Hexagon className="h-32 w-32 text-accent fill-accent/20" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose PathHive?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop jumping between scattered resources. Follow curated paths designed to take you from beginner to expert.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Structured Learning",
                description: "Step-by-step paths that guide you through topics in the right order, reducing confusion and overwhelm."
              },
              {
                icon: Users,
                title: "Community-Driven",
                description: "Learn from paths created by experts and fellow learners who've walked the same journey."
              },
              {
                icon: Zap,
                title: "AI-Powered Assistance",
                description: "Get instant help with our AI chatbot and summarizer to understand concepts faster."
              },
              {
                icon: BookOpen,
                title: "Multi-Format Resources",
                description: "Access videos, articles, docs, and exercises all in one place, curated for your learning style."
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Visualize your learning journey, track completed steps, and celebrate your achievements."
              },
              {
                icon: MessageSquare,
                title: "Community Interaction",
                description: "Rate paths, leave comments, and learn alongside a supportive community."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Paths Section (Top Rated) */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Top Rated Paths
              </h2>
              <p className="text-muted-foreground">
                Highest rated learning journeys by our community
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/browse")}>
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
             <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPaths.length > 0 ? featuredPaths.map((path) => (
                <PathCard key={path.id} path={path} />
              )) : (
                <div className="col-span-full text-center py-10 bg-card rounded-xl border border-dashed text-muted-foreground">
                   No featured paths available right now. Be the first to create one!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-8 md:p-16 text-center">
            <div className="absolute inset-0 hexagon-pattern opacity-10" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of learners who are mastering new skills with structured paths. 
                Create your free account today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={() => navigate("/register")}
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="xl"
                  className="border border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-foreground transition-all duration-300"
                  onClick={() => navigate("/browse")}
                >
                  Explore Paths
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}