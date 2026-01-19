import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { mockLearningPaths, mockUsers } from "@/data/mockData";
import { PathCard } from "@/components/shared/PathCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Users,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function CreatorDashboard() {
  const { creatorId } = useParams();
  const navigate = useNavigate();

  const creator = mockUsers.find((u) => u.id === creatorId);
  const createdPaths = mockLearningPaths.filter(
    (p) => p.creator?.id === creatorId
  );

  if (!creator) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Creator not found</h1>
          <Button onClick={() => navigate("/browse")}>Browse Paths</Button>
        </div>
      </MainLayout>
    );
  }

  // Calculate stats
  const totalEnrollments = createdPaths.reduce(
    (sum, p) => sum + p.enrollmentCount,
    0
  );
  const averageRating =
    createdPaths.length > 0
      ? createdPaths.reduce((sum, p) => sum + p.averageRating, 0) /
        createdPaths.length
      : 0;
  const totalSteps = createdPaths.reduce((sum, p) => sum + p.steps.length, 0);

  const stats = [
    {
      label: "Paths Created",
      value: createdPaths.length,
      icon: BookOpen,
    },
    {
      label: "Total Learners",
      value: totalEnrollments.toLocaleString(),
      icon: Users,
    },
    {
      label: "Average Rating",
      value: averageRating.toFixed(1),
      icon: Star,
    },
    {
      label: "Total Steps",
      value: totalSteps,
      icon: TrendingUp,
    },
  ];

  return (
    <MainLayout>
      {/* Header Section */}
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

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary-foreground/20">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback className="text-2xl">
                {creator.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {creator.fullName}
              </h1>
              <p className="text-primary-foreground/70 mb-3">
                @{creator.username}
              </p>
              {creator.bio && (
                <p className="text-primary-foreground/80 max-w-2xl">
                  {creator.bio}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 text-sm text-primary-foreground/60">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {new Date(creator.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Created Paths Section */}
      <section className="container py-8">
        <h2 className="text-2xl font-display font-bold mb-6">
          Learning Paths by {creator.fullName}
        </h2>

        {createdPaths.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdPaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No paths yet</h3>
            <p className="text-muted-foreground">
              This creator hasn't published any learning paths.
            </p>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
