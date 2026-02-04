import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { pathService } from "@/lib/pathService";
import { Review } from "@/types/api";
import { cn } from "@/lib/utils";

interface ReviewsListProps {
  pathId: string;
  refreshTrigger: number; // We'll use this to force a re-fetch when a new review is added
}

export function ReviewsList({ pathId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await pathService.getReviews(pathId);
        setReviews(data);
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [pathId, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No reviews yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-display font-bold">
        Reviews ({reviews.length})
      </h3>
      
      <div className="grid gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-card rounded-xl border p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={review.user.avatar} />
                <AvatarFallback>{review.user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.user.full_name || review.user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Star Display */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted-foreground/20 text-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}