import { useState, useEffect } from "react";
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
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { pathService } from "@/lib/pathService";
import { Review } from "@/types/api";

interface RatingDialogProps {
  pathId: string;
  pathTitle: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  existingReview?: Review | null; // <--- The critical prop
}

export function RatingDialog({
  pathId,
  pathTitle,
  isAuthenticated,
  onAuthRequired,
  trigger,
  onSuccess,
  existingReview,
}: RatingDialogProps) {
  const [open, setOpen] = useState(false);
  
  // State for the form
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !isAuthenticated) {
      onAuthRequired();
      return;
    }
    setOpen(isOpen);
  };

  // Reset/Pre-fill state when the dialog opens or existingReview changes
  useEffect(() => {
    if (open) {
      if (existingReview) {
        setRating(existingReview.rating);
        setReview(existingReview.comment);
      } else {
        setRating(0);
        setReview("");
      }
    }
  }, [open, existingReview]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // --- EDIT MODE (PATCH) ---
        await pathService.updateReview(existingReview.id, rating, review);
        toast({
          title: "Review Updated",
          description: "Your review has been successfully updated.",
        });
      } else {
        // --- CREATE MODE (POST) ---
        await pathService.createReview(pathId, rating, review);
        toast({
          title: "Rating Submitted",
          description: `Thank you for rating "${pathTitle}".`,
        });
      }
      
      setOpen(false);
      if (onSuccess) onSuccess(); // Trigger parent refresh
      
    } catch (error: any) {
      // Handle "Duplicate" error nicely
      if (error.response?.data?.detail) {
         toast({
            title: "Submission Failed",
            description: error.response.data.detail,
            variant: "destructive",
         });
      } else {
         toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
         });
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <DialogTitle>
            {existingReview ? "Edit your review" : "Rate this learning path"}
          </DialogTitle>
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
                  disabled={isSubmitting}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50 disabled:hover:scale-100"
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
              placeholder="Share your thoughts..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : (
                existingReview ? "Update Review" : "Submit Rating"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}