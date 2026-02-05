import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, BookOpen, Lock, Globe } from "lucide-react"; // Added Icons
import { Path } from "@/types/api";
import { cn } from "@/lib/utils";

interface PathCardProps {
  path: Path;
}

export const PathCard = ({ path }: PathCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-700 hover:bg-green-200";
      case "intermediate": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "advanced": return "bg-orange-100 text-orange-700 hover:bg-orange-200";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className={cn(
        "h-full transition-all hover:shadow-md border rounded-xl overflow-hidden relative group",
        !path.is_published && "border-dashed border-2 border-yellow-400 bg-yellow-50/30" // Visual cue for drafts
    )}>
      <Link to={`/path/${path.id}`} className="absolute inset-0 z-10" />

      <CardContent className="p-5 flex flex-col h-full">
        
        {/* === Header: Status & Difficulty === */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            {/* ✨ DRAFT BADGE LOGIC ✨ */}
            {!path.is_published ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Draft
                </Badge>
            ) : (
                <Badge className={cn("font-normal capitalize", getDifficultyColor(path.difficulty))}>
                    {path.difficulty}
                </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            {path.average_rating ? path.average_rating.toFixed(1) : "New"}
          </div>
        </div>

        {/* === Title & Description === */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {path.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {path.description || "No description provided."}
        </p>

        {/* === Tags === */}
        <div className="flex flex-wrap gap-2 mb-4">
          {path.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs font-normal">
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* === Footer === */}
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {path.steps?.length || 0} steps
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {path.enrollmentCount || 0} joined
            </span>
          </div>
          
          <div className="relative z-20">
            {path.creator ? (
               <Link to={`/creator/${path.creator.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                 <Avatar className="h-6 w-6">
                   <AvatarImage src={(path.creator as any).avatar} />
                   <AvatarFallback className="text-[10px]">
                       {path.creator.username?.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
                 <span className="truncate max-w-[80px] text-xs">
                   {path.creator.username}
                 </span>
               </Link>
            ) : (
                <span className="text-xs">Unknown</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};