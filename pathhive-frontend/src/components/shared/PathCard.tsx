import { Link } from "react-router-dom";
import { LearningPath } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathCardProps {
  path: LearningPath;
  className?: string;
}

const difficultyColors = {
  beginner: "bg-success/10 text-success border-success/20",
  intermediate: "bg-info/10 text-info border-info/20",
  advanced: "bg-accent/10 text-accent border-accent/20",
};

export function PathCard({ path, className }: PathCardProps) {
  return (
    <Link to={`/path/${path.id}`}>
      <article 
        className={cn(
          "group relative bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-300",
          "hover:border-primary/30 hover:shadow-elevated hover:-translate-y-1",
          className
        )}
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <Badge 
              variant="outline" 
              className={cn("capitalize text-xs font-medium", difficultyColors[path.difficulty])}
            >
              {path.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium">{path.averageRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {path.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {path.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {path.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs font-normal px-2 py-0.5"
              >
                {tag.name}
              </Badge>
            ))}
            {path.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                +{path.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {path.steps.length} steps
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {path.enrollmentCount.toLocaleString()}
            </span>
          </div>

          {/* Creator */}
          <Link
            to={`/creator/${path.creator?.id}`}
            className="flex items-center gap-2 pt-4 border-t border-border hover:bg-muted/50 -mx-5 px-5 -mb-5 pb-5 rounded-b-xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={path.creator?.avatar} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {path.creator?.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              by <span className="text-foreground font-medium hover:text-primary transition-colors">{path.creator?.fullName}</span>
            </span>
          </Link>
        </div>
      </article>
    </Link>
  );
}
