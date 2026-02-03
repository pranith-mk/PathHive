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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flag, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pathService } from "@/lib/pathService"; // Import Service

// Define types locally or import from your types file if you prefer
type ReportType = 'user' | 'path' | 'comment';

interface ReportDialogProps {
  reportType: ReportType;
  targetId: string | number; // Allow both
  targetName?: string;
  trigger?: React.ReactNode;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

const reportReasons = [
  { value: "spam", label: "Spam", description: "Unwanted promotional content or repetitive posts" },
  { value: "harassment", label: "Harassment", description: "Bullying, threats, or targeted abuse" },
  { value: "inappropriate_content", label: "Inappropriate Content", description: "Adult, violent, or offensive material" },
  { value: "misinformation", label: "Misinformation", description: "False or misleading information" },
  { value: "copyright", label: "Copyright Violation", description: "Unauthorized use of copyrighted material" },
  { value: "other", label: "Other", description: "Other issues not listed above" },
];

const typeLabels: Record<ReportType, string> = {
  path: "Learning Path",
  user: "User",
  comment: "Comment",
};

export function ReportDialog({
  reportType,
  targetId,
  targetName,
  trigger,
  isAuthenticated,
  onAuthRequired,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      onAuthRequired();
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedReason("");
      setDescription("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);

    // Combine category and description for the backend
    const finalReason = `Category: ${selectedReason}\nDetails: ${description}`;

    try {
      // Call Real API
      await pathService.submitReport({
        report_type: reportType,
        target_id: targetId,
        reason: finalReason
      });

      toast({
        title: "Report submitted",
        description: "Thank you. Our admins will review this shortly.",
      });

      setOpen(false);
      setSelectedReason("");
      setDescription("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "Could not send report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report {typeLabels[reportType]}
          </DialogTitle>
          <DialogDescription>
            {targetName
              ? `Report "${targetName}" for violating community guidelines.`
              : `Report this ${typeLabels[reportType].toLowerCase()} for violating community guidelines.`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4 pr-2">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Reason for report</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {reportReasons.map((r) => (
                <div key={r.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <RadioGroupItem value={r.value} id={r.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={r.value} className="font-medium cursor-pointer block">
                      {r.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                </>
            ) : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}