import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ReportDialog } from "@/components/reports/ReportDialog";

import { RatingDialog } from "@/components/ratings/RatingDialog"; 
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "@/components/comments/CommentsSection";

import { ReviewsList } from "@/components/ratings/ReviewList";

import {
  Star,
  Users,
  BookOpen,
  Play,
  CheckCircle2,
  Circle,
  ExternalLink,
  Bookmark,
  Share2,
  ArrowLeft,
  FileText,
  Video,
  Code,
  Folder,
  Flag,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";

const resourceTypeIcons: Record<string, any> = {
  video: Video,
  article: FileText,
  documentation: FileText,
  exercise: Code,
  project: Folder,
  file: FileText
};

export default function PathDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [path, setPath] = useState<Path | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // 2. STATE TO TRIGGER REFRESH
  const [refreshReviews, setRefreshReviews] = useState(0);

  // Fetch Data
  useEffect(() => {
    const fetchPath = async () => {
      if (!id) return;
      try {
        const data = await pathService.getPathById(id);
        setPath(data);
        // Sync enrollment status from Backend
        if (data.is_enrolled) {
          setIsEnrolled(true);
        }

        if (data.completed_steps) {
          setCompletedSteps(data.completed_steps);
      }

      } catch (err) {
        console.error("Error fetching path:", err);
        setError("Failed to load path.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPath();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !path) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Path not found</h1>
          <p className="text-muted-foreground mb-6">The path you are looking for does not exist.</p>
          <Button onClick={() => navigate("/browse")}>Browse Paths</Button>
        </div>
      </MainLayout>
    );
  }

  const steps = path.steps || [];
  const progress = steps.length > 0 
    ? (completedSteps.length / steps.length) * 100 
    : 0;

  const toggleStepCompletion = async (stepId: string) => {
    // Optimistic Update
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );

    // Call API in background
    try {
        if (path?.id) {
            await pathService.toggleStep(path.id, stepId);
        }
    } catch (error) {
        console.error("Failed to save progress");
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to enroll in this path.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setIsEnrolling(true);

    try {
      await pathService.enrollInPath(path.id);
      setIsEnrolled(true);
      toast({
        title: "Success!",
        description: `You have successfully enrolled in ${path.title}.`,
      });
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast({
        title: "Error",
        description: "Failed to enroll. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-12 pt-8">
        <div className="container">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/browse")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Paths
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Path Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 capitalize">
                  {path.difficulty}
                </Badge>
                {path.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="border-white/30 text-white">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {path.title}
              </h1>
              <p className="text-white/80 mb-6 text-lg leading-relaxed">
                {path.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                {path.average_rating ? (
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    {path.average_rating} ({path.review_count} reviews)
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    New
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {steps.length} steps
                </span>
                 <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Free
                </span>
              </div>

              {/* Creator */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={undefined} /> 
                    <AvatarFallback className="text-black bg-white">
                        {path.creator?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{path.creator?.username}</p>
                    <p className="text-sm text-white/60">Path Creator</p>
                  </div>
                </div>
                
                {path.creator && (
                  <ReportDialog
                    reportType="user"
                    targetId={String(path.creator.id)}
                    targetName={path.creator.username}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => navigate("/login")}
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white text-slate-900 rounded-xl p-6 shadow-xl border border-slate-200">
                {isEnrolled ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Your Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Button className="w-full mb-3" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white" 
                    size="lg" 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enrolling...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Learning
                        </>
                    )}
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  {/* 3. UPDATED RATING DIALOG */}
                  <RatingDialog
                    pathId={path.id}
                    pathTitle={path.title}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => navigate("/login")}
                    onSuccess={() => setRefreshReviews(prev => prev + 1)} // <--- Refresh Trigger
                    trigger={
                      <Button variant="outline" className="flex-1">
                        <Star className="h-4 w-4" />
                      </Button>
                    }
                  />

                  <ReportDialog
                    reportType="path"
                    targetId={path.id}
                    targetName={path.title}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => navigate("/login")}
                    trigger={
                      <Button variant="outline" className="flex-1">
                        <Flag className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container py-8 max-w-6xl">
        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="comments">
                Comments {path.comments_count !== undefined && `(${path.comments_count})`}
            </TabsTrigger>
            {/* 4. NEW REVIEWS TRIGGER */}
            <TabsTrigger value="reviews">
                Reviews {path.review_count !== undefined && `(${path.review_count})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-4">
            {steps.length > 0 ? (
              steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "bg-card rounded-xl border p-5 transition-all",
                      isCompleted ? "border-green-500/30 bg-green-50/50" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className="mt-0.5 flex-shrink-0"
                        disabled={!isEnrolled}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className={cn(
                              "h-6 w-6 transition-colors",
                              !isEnrolled ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground hover:text-primary"
                          )} />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Step {step.position + 1}
                          </span>
                        </div>
                        <h3 className={cn(
                          "font-display font-semibold text-lg mb-2",
                          isCompleted && "text-muted-foreground line-through"
                        )}>
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {step.description}
                        </p>

                        {/* Resources */}
                        {step.resources && step.resources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((resource) => {
                              const Icon = resourceTypeIcons[resource.resource_type] || FileText;
                              return (
                                <a
                                  key={resource.id}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors border"
                                >
                                  <Icon className="h-3.5 w-3.5 text-primary" />
                                  {resource.title}
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-xl">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No steps yet</h3>
                <p className="text-muted-foreground">
                  This path is still being developed.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            <CommentsSection 
                pathId={path.id} 
                isAuthenticated={isAuthenticated}
                currentUser={user}
                onNavigateToLogin={() => navigate("/login")} 
            />
          </TabsContent>

          {/* 5. NEW REVIEWS TAB CONTENT */}
          <TabsContent value="reviews">
            <ReviewsList 
                pathId={path.id} 
                refreshTrigger={refreshReviews} 
            />
          </TabsContent>

        </Tabs>
      </section>
    </MainLayout>
  );
}