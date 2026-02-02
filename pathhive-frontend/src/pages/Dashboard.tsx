import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  Clock,
  Star,
  ArrowRight,
  Flame,
  Target,
  Loader2
} from "lucide-react";

// 1. Import Backend Service and Types
import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 2. State for Real Data
  const [enrolledPaths, setEnrolledPaths] = useState<Path[]>([]);
  const [createdPaths, setCreatedPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch Data on Load
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [enrolled, created] = await Promise.all([
          pathService.getMyEnrollments(),
          pathService.getCreatedPaths()
        ]);
        setEnrolledPaths(enrolled);
        setCreatedPaths(created);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // 4. Mock Stats (Backend doesn't calculate these yet)
  const stats = {
    pathsCompleted: 0,
    stepsCompleted: 0, // We can calculate this later if we update the serializer
    hoursLearned: 0,
    currentStreak: 0,
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Helper Component for Cards (replaces generic PathCard to ensure Type safety)
  const DashboardPathCard = ({ path, isEnrolled = false }: { path: Path, isEnrolled?: boolean }) => (
    <div
      key={path.id}
      className="group bg-card rounded-xl border p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/path/${path.id}`)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <Badge variant="secondary" className="capitalize">{path.difficulty}</Badge>
        {/* Placeholder for progress ring if we add it later */}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {path.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {path.description || "No description provided."}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t mt-auto">
        <span className="text-xs text-muted-foreground">
          By {path.creator?.username || "Unknown"}
        </span>
        {isEnrolled ? (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
            Continue <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        ) : (
          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Welcome back, {user?.fullName?.split(' ')[0] || user?.username || 'Learner'}!
              </h1>
              <p className="text-muted-foreground">
                Continue your learning journey
              </p>
            </div>
          </div>
          <Button variant="default" size="lg" className="shadow-lg shadow-primary/20" onClick={() => navigate("/create")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Path
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Paths Enrolled", value: enrolledPaths.length, icon: Target, color: "text-green-500 bg-green-50" },
            { label: "Paths Created", value: createdPaths.length, icon: BookOpen, color: "text-blue-500 bg-blue-50" },
            { label: "Hours Learned", value: stats.hoursLearned, icon: Clock, color: "text-orange-500 bg-orange-50" },
            { label: "Day Streak", value: stats.currentStreak, icon: Flame, color: "text-red-500 bg-red-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 md:p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
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
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="learning">
              <BookOpen className="h-4 w-4 mr-2" />
              My Learning
            </TabsTrigger>
            <TabsTrigger value="created">
              <PlusCircle className="h-4 w-4 mr-2" />
              Created Paths
            </TabsTrigger>
            <TabsTrigger value="bookmarks" disabled>
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

                {/* Enrolled Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledPaths.map((path) => (
                    <DashboardPathCard key={path.id} path={path} isEnrolled={true} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
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
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdPaths.map((path) => (
                    <DashboardPathCard key={path.id} path={path} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                <PlusCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No paths created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your knowledge by creating a learning path
                </p>
                <Button variant="default" onClick={() => navigate("/create")}>
                  Create Your First Path
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks">
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground">Bookmarks coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}