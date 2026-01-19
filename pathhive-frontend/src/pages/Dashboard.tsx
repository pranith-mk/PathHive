import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockLearningPaths } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { PathCard } from "@/components/shared/PathCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  Target,
  Clock,
  Star,
  ArrowRight,
  Flame,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock enrolled paths (in real app, this would come from API)
  const enrolledPaths = mockLearningPaths.slice(0, 2);
  const createdPaths = mockLearningPaths.filter(p => p.creatorId === "1");
  const bookmarkedPaths = mockLearningPaths.slice(3, 5);

  // Mock stats
  const stats = {
    pathsCompleted: 3,
    stepsCompleted: 47,
    hoursLearned: 24,
    currentStreak: 7,
  };

  // Mock progress for enrolled paths
  const pathProgress: Record<string, number> = {
    "p1": 65,
    "p2": 30,
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {user?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Learner'}!
              </h1>
              <p className="text-muted-foreground">
                Continue your learning journey
              </p>
            </div>
          </div>
          <Button variant="hero" onClick={() => navigate("/create")}>
            <PlusCircle className="h-4 w-4" />
            Create New Path
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Paths Completed", value: stats.pathsCompleted, icon: Target, color: "text-success" },
            { label: "Steps Completed", value: stats.stepsCompleted, icon: BookOpen, color: "text-info" },
            { label: "Hours Learned", value: stats.hoursLearned, icon: Clock, color: "text-accent" },
            { label: "Day Streak", value: stats.currentStreak, icon: Flame, color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 md:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="learning" className="space-y-6">
          <TabsList>
            <TabsTrigger value="learning">
              <BookOpen className="h-4 w-4 mr-2" />
              My Learning
            </TabsTrigger>
            <TabsTrigger value="created">
              <PlusCircle className="h-4 w-4 mr-2" />
              Created Paths
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Star className="h-4 w-4 mr-2" />
              Bookmarks
            </TabsTrigger>
          </TabsList>

          {/* My Learning Tab */}
          <TabsContent value="learning">
            {enrolledPaths.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-semibold">Continue Learning</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/browse")}>
                    Browse more
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {enrolledPaths.map((path) => (
                    <div 
                      key={path.id}
                      className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/path/${path.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <ProgressRing 
                          progress={pathProgress[path.id] || 0} 
                          size={56} 
                          strokeWidth={4}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-lg mb-1 truncate">
                            {path.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {path.steps.length} steps • {path.difficulty}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Continue
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-xl">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No enrolled paths yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a path
                </p>
                <Button onClick={() => navigate("/browse")}>
                  Browse Paths
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Created Paths Tab */}
          <TabsContent value="created">
            {createdPaths.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-semibold">Your Created Paths</h2>
                  <Button variant="hero" size="sm" onClick={() => navigate("/create")}>
                    <PlusCircle className="h-4 w-4" />
                    Create New
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdPaths.map((path) => (
                    <PathCard key={path.id} path={path} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-xl">
                <PlusCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No paths created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your knowledge by creating a learning path
                </p>
                <Button variant="hero" onClick={() => navigate("/create")}>
                  Create Your First Path
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {bookmarkedPaths.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedPaths.map((path) => (
                  <PathCard key={path.id} path={path} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-xl">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Save paths you want to explore later
                </p>
                <Button onClick={() => navigate("/browse")}>
                  Browse Paths
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
