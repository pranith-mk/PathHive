import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, PenSquare, X } from "lucide-react";
import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface EditPathDialogProps {
  path: Path;
  trigger?: React.ReactNode;
  onSuccess: (updatedPath: Path) => void;
}

export function EditPathDialog({ path, trigger, onSuccess }: EditPathDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    is_published: false,
  });

  // Tag State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Load path data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: path.title,
        description: path.description,
        difficulty: path.difficulty,
        is_published: path.is_published,
      });
      // Extract tag names from the objects
      setTags(path.tags.map(t => t.name)); 
    }
  }, [open, path]);

  // Handle Tag Addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  // Handle Tag Removal
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send standard data + tags_list
      const payload = {
        ...formData,
        tags_list: tags // <--- Backend expects this
      };

      const updated = await pathService.updatePath(path.id, payload as any);
      
      toast({ title: "Path updated successfully" });
      onSuccess(updated);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to update path", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <PenSquare className="h-4 w-4 mr-2" />
            Edit Path
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Path Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Path Title</Label>
            <Input 
              placeholder="e.g. Master React in 30 Days"
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              placeholder="What will students learn?"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              rows={4}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(val) => setFormData({...formData, difficulty: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility Switch */}
            <div className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
               <div className="space-y-0.5">
                  <Label className="text-base">Published</Label>
                  <p className="text-xs text-muted-foreground">Visible to everyone</p>
               </div>
               <Switch 
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
               />
            </div>
          </div>

          {/* Tags Management */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input 
              placeholder="Type a tag and press Enter..." 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}