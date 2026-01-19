import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RatingDialogProps {
  pathId: string;
  pathTitle: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentRating?: number;
  trigger?: React.ReactNode;
}

export function RatingDialog({
  pathId,
  pathTitle,
  isAuthenticated,
  onAuthRequired,
  currentRating,
  trigger,
}: RatingDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(currentRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const { toast } = useToast();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !isAuthenticated) {
      onAuthRequired();
      return;
    }
    setOpen(isOpen);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star to submit your rating.",
        variant: "destructive",
      });
      return;
    }

    // Mock submission - would connect to backend
    toast({
      title: "Rating submitted!",
      description: `You rated "${pathTitle}" ${rating} star${rating > 1 ? "s" : ""}.`,
    });
    setOpen(false);
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Rate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this learning path</DialogTitle>
          <DialogDescription>
            Share your experience with "{pathTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= displayRating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {displayRating === 0 && "Select a rating"}
              {displayRating === 1 && "Poor"}
              {displayRating === 2 && "Fair"}
              {displayRating === 3 && "Good"}
              {displayRating === 4 && "Very Good"}
              {displayRating === 5 && "Excellent"}
            </span>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Review (optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about this learning path..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
