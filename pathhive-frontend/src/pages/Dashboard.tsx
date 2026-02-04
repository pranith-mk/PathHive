import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  ArrowRight,
  Loader2,
  Target,
  Layers
} from "lucide-react";

import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";

// 1. IMPORT THE REUSABLE COMPONENT
import { PathCard } from "@/components/shared/PathCard"; 

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State for Real Data
  const [enrolledPaths, setEnrolledPaths] = useState<Path[]>([]);
  const [createdPaths, setCreatedPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
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

  if (authLoading || isLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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

        {/* --- REAL DATA STATS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Stat 1: Joined */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg text-green-600 bg-green-100">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-display font-bold">{enrolledPaths.length}</p>
            <p className="text-sm text-muted-foreground">Paths Joined</p>
          </div>

          {/* Stat 2: Created */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg text-blue-600 bg-blue-100">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-display font-bold">{createdPaths.length}</p>
            <p className="text-sm text-muted-foreground">Paths Created</p>
          </div>
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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledPaths.map((path) => (
                    // 2. USE PATHCARD (Passing isEnrolled in case your card supports it)
                    <PathCard key={path.id} path={path} />
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
                    // 3. USE PATHCARD
                    <PathCard key={path.id} path={path} />
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
        </Tabs>
      </div>
    </MainLayout>
  );
}