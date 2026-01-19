import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { mockLearningPaths, mockComments } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { RatingDialog } from "@/components/ratings/RatingDialog";
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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const resourceTypeIcons = {
  video: Video,
  article: FileText,
  documentation: FileText,
  exercise: Code,
  project: Folder,
};

export default function PathDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const path = mockLearningPaths.find((p) => p.id === id);
  const comments = mockComments.filter((c) => c.pathId === id);

  if (!path) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Path not found</h1>
          <Button onClick={() => navigate("/browse")}>Browse Paths</Button>
        </div>
      </MainLayout>
    );
  }

  const progress = path.steps.length > 0 
    ? (completedSteps.length / path.steps.length) * 100 
    : 0;

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsEnrolled(true);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-dark text-primary-foreground">
        <div className="container py-8 md:py-12">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Path Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary/20 text-primary-foreground capitalize">
                  {path.difficulty}
                </Badge>
                {path.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {path.title}
              </h1>
              <p className="text-primary-foreground/80 mb-6 text-lg">
                {path.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {path.averageRating.toFixed(1)} rating
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {path.enrollmentCount.toLocaleString()} learners
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {path.steps.length} steps
                </span>
              </div>

              {/* Creator */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-foreground/10">
                <Link 
                  to={`/creator/${path.creator?.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-12 w-12 border-2 border-primary-foreground/20">
                    <AvatarImage src={path.creator?.avatar} />
                    <AvatarFallback>{path.creator?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium hover:underline">{path.creator?.fullName}</p>
                    <p className="text-sm text-primary-foreground/60">Path Creator</p>
                  </div>
                </Link>
                {path.creator && (
                  <ReportDialog
                    reportType="user"
                    targetId={path.creator.id}
                    targetName={path.creator.fullName}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => navigate("/login")}
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary-foreground/60 hover:text-destructive hover:bg-destructive/10"
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
              <div className="bg-card text-card-foreground rounded-xl p-6 shadow-elevated">
                {isEnrolled ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Your Progress</span>
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
                  <Button variant="hero" className="w-full mb-3" size="lg" onClick={handleEnroll}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <RatingDialog
                    pathId={path.id}
                    pathTitle={path.title}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => navigate("/login")}
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
      <section className="container py-8">
        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-4">
            {path.steps.length > 0 ? (
              path.steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "bg-card rounded-xl border p-5 transition-all",
                      isCompleted ? "border-success/30 bg-success/5" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className="mt-0.5 flex-shrink-0"
                        disabled={!isEnrolled}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Step {step.position}
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
                        {step.resources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((resource) => {
                              const Icon = resourceTypeIcons[resource.resourceType] || FileText;
                              return (
                                <a
                                  key={resource.id}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  {resource.title}
                                  <ExternalLink className="h-3 w-3" />
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
              comments={comments}
              pathId={path.id}
              isAuthenticated={isAuthenticated}
              onNavigateToLogin={() => navigate("/login")}
            />
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
}
