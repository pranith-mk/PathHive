import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PathCard } from "@/components/shared/PathCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { pathService, CreatorProfileData } from "@/lib/pathService"; // Import Real Service
import {
  Star,
  Users,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function CreatorDashboard() {
  // 1. Handle both 'id' and 'creatorId' depending on how your Router is named
  const params = useParams();
  const creatorId = params.creatorId || params.id; 
  
  const navigate = useNavigate();

  // 2. State for Real Data
  const [data, setData] = useState<CreatorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 3. Fetch Data from Django Backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!creatorId) return;
      try {
        const result = await pathService.getCreatorProfile(creatorId);
        setData(result);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load creator profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [creatorId]);

  // 4. Loading State
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // 5. Error / Not Found State
  if (error || !data) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Creator not found</h1>
          <p className="text-muted-foreground mb-6">
             We couldn't find the creator with ID: {creatorId}
          </p>
          <Button onClick={() => navigate("/browse")}>Browse Paths</Button>
        </div>
      </MainLayout>
    );
  }

  // 6. Extract Data for UI
  const { profile, stats: apiStats, paths } = data;

  const statsDisplay = [
    {
      label: "Paths Created",
      value: apiStats.total_paths,
      icon: BookOpen,
    },
    {
      label: "Total Learners",
      value: apiStats.total_students.toLocaleString(),
      icon: Users,
    },
    {
      label: "Average Rating",
      value: apiStats.average_rating.toFixed(1),
      icon: Star,
    },
    // Note: Total steps isn't in the API summary yet, so we can calculate it or omit it
    {
      label: "Paths Published",
      value: paths.length,
      icon: TrendingUp,
    },
  ];

  return (
    <MainLayout>
      {/* Header Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container py-8 md:py-12">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              {/* Use the API avatar URL */}
              <AvatarImage src={profile.avatar || undefined} className="object-cover" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-white/70 mb-3">
                @{profile.username}
              </p>
              
              <p className="text-white/80 max-w-2xl">
                {profile.bio || "No bio provided."}
              </p>
             
              <div className="flex items-center gap-2 mt-4 text-sm text-white/60">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {new Date(profile.date_joined).toLocaleDateString("en-US", {
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
          {statsDisplay.map((stat) => (
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
          Learning Paths by {profile.full_name || profile.username}
        </h2>

        {paths.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
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