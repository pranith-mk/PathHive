import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Star,
  Users,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Share2,
  ArrowLeft,
  FileText,
  Video,
  Code,
  Folder,
  Flag,
  Loader2,
  PenSquare,
  Trash2,
  ShieldCheck,
  UserPlus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { pathService } from "@/lib/pathService";
import { Path, Review } from "@/types/api";

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
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Reviews & Ratings State
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await pathService.getPathById(id);
        setPath(data);

        if (data.is_enrolled) setIsJoined(true);
        if (data.completed_steps) setCompletedSteps(data.completed_steps);

        if (isAuthenticated) {
          const myReview = await pathService.getUserReview(id);
          setUserReview(myReview);
        }

      } catch (err) {
        console.error("Error fetching path:", err);
        setError("Failed to load path.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, refreshReviews]);

  // --- ACTIONS ---

  const handleConfirmDelete = async () => {
    if (!path) return;

    try {
      await pathService.deletePathCreator(path.id);
      toast({ title: "Path deleted successfully" });
      navigate("/browse");
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const toggleStepCompletion = async (stepId: string) => {
    // Prevent creator from marking their own steps as "completed" (optional logic, can remove if you want creators to test it)
    if (isOwner) return;

    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );

    try {
      if (path?.id) await pathService.toggleStep(path.id, stepId);
    } catch (error) {
      console.error("Failed to save progress");
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to join this path.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setIsJoining(true);

    try {
      await pathService.enrollInPath(path.id);
      setIsJoined(true);
      toast({ title: "Welcome!", description: `You have successfully joined ${path.title}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to join. Please try again later.", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeavePath = async () => {
    if (!path) return;
    setIsLeaving(true);
    try {
      await pathService.unenrollFromPath(path.id);
      setIsJoined(false);
      setCompletedSteps([]); // Clear progress locally
      toast({ title: "Left Path", description: "You have successfully unenrolled." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to leave path.", variant: "destructive" });
    } finally {
      setIsLeaving(false);
    }
  };

  const handleShare = async () => {
    if (!path) return;

    const shareData = {
      title: path.title,
      text: `Check out this learning path: ${path.title} on PathHive!`,
      url: window.location.href,
    };

    // 1. Try Native Share (Mobile)
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // 2. Fallback: Clipboard Copy (Desktop)
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Path URL has been copied to your clipboard.",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Could not copy link manually.",
          variant: "destructive",
        });
      }
    }
  };

  // --- RENDER HELPERS ---

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
          <Button onClick={() => navigate("/browse")}>Browse Paths</Button>
        </div>
      </MainLayout>
    );
  }

  const steps = path.steps || [];
  const progress = steps.length > 0
    ? (completedSteps.length / steps.length) * 100
    : 0;

  // Check Ownership
  const isOwner = user?.id === path?.creator?.id;

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
                  {path.enrollmentCount || 0} joined
                </span>
              </div>

              {/* Creator Section (UPDATED WITH LINK) */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <Link 
                  to={`/creator/${path.creator?.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                >
                  <Avatar className="h-12 w-12 border-2 border-white/20 group-hover:border-white/40 transition-colors">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-black bg-white">
                      {path.creator?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:underline underline-offset-4">
                      {path.creator?.username}
                    </p>
                    <p className="text-sm text-white/60">Path Creator</p>
                  </div>
                </Link>

                {path.creator && !isOwner && (
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

            {/* Action Card */}
            <div className="lg:col-span-1">
              <div className="bg-white text-slate-900 rounded-xl p-6 shadow-xl border border-slate-200">

                {!isOwner ? (
                  <>
                    {/* Progress Bar (Only show if joined) */}
                    {isJoined && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Your Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* ACTION BUTTONS GRID */}
                    <div className="space-y-3">
                      
                      {isJoined ? (
                        /* --- JOINED STATE UI --- */
                        <>
                          {/* Row 1: Positive Actions (Share & Rate) */}
                          <div className="flex gap-3">
                            {/* Primary: Share (Solid) */}
                            <Button 
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                              onClick={handleShare}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>

                            {/* Secondary: Rate (Outline) */}
                            <RatingDialog
                              pathId={path.id}
                              pathTitle={path.title}
                              isAuthenticated={isAuthenticated}
                              onAuthRequired={() => navigate("/login")}
                              onSuccess={() => setRefreshReviews(prev => prev + 1)}
                              existingReview={userReview}
                              trigger={
                                <Button 
                                  variant="outline" 
                                  className={cn(
                                    "flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800",
                                    userReview && "bg-orange-50 border-orange-300"
                                  )}
                                >
                                  <Star className={cn("h-4 w-4 mr-2", userReview && "fill-orange-500 text-orange-500")} />
                                  {userReview ? "Rated" : "Rate"}
                                </Button>
                              }
                            />
                          </div>

                          {/* Row 2: Maintenance Actions (Subtle Outlines) */}
                          <div className="pt-2 flex flex-col gap-2">
                             {/* Report (Subtle Gray Outline) */}
                             <ReportDialog
                                reportType="path"
                                targetId={path.id}
                                targetName={path.title}
                                isAuthenticated={isAuthenticated}
                                onAuthRequired={() => navigate("/login")}
                                trigger={
                                  <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                    <Flag className="h-4 w-4 mr-2" />
                                    Report this Path
                                  </Button>
                                }
                              />

                              {/* Leave Path (Subtle Red Outline) */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                                    disabled={isLeaving}
                                  >
                                    {isLeaving ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                    ) : (
                                      <LogOut className="h-3 w-3 mr-2" />
                                    )}
                                    Leave Path
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                   <AlertDialogHeader>
                                      <AlertDialogTitle>Leave this path?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Are you sure you want to unenroll from <span className="font-semibold text-foreground">"{path.title}"</span>?
                                          <br /><br />
                                          <span className="text-red-600 font-medium">Warning:</span> Your progress (completed steps) will be permanently lost.
                                      </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleLeavePath} className="bg-red-600 hover:bg-red-700 text-white">
                                          Yes, Leave Path
                                      </AlertDialogAction>
                                   </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </div>
                        </>
                      ) : (
                        /* --- NOT JOINED STATE --- */
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                          size="lg"
                          onClick={handleJoin}
                          disabled={isJoining}
                        >
                          {isJoining ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join Path for Free
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                   /* --- OWNER STATE --- */
                   <div className="mb-4 p-4 bg-slate-50 border rounded-lg flex gap-3 items-center">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">You created this path</p>
                        <p className="text-xs text-muted-foreground">Manage content below</p>
                      </div>
                   </div>
                )}

                {/* --- OWNER CONTROLS (Bottom Buttons) --- */}
                {isOwner && (
                  <div className="flex gap-2 mt-4">
                      <Button
                        variant="secondary"
                        className="flex-1 font-semibold text-primary"
                        onClick={() => navigate(`/path/${path.id}/edit`)}
                      >
                        <PenSquare className="h-4 w-4 mr-2" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Delete Path?</AlertDialogTitle>
                             <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                )}
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

                      {/* Only show the completion circle if Joined or Owner */}
                      {(isJoined || isOwner) && (
                        <button
                          onClick={() => toggleStepCompletion(step.id)}
                          className={cn("mt-0.5 flex-shrink-0", isOwner && "cursor-default")}
                          disabled={!isJoined && !isOwner}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className={cn(
                              "h-6 w-6 transition-colors",
                              (!isJoined && !isOwner) ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground hover:text-primary"
                            )} />
                          )}
                        </button>
                      )}

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