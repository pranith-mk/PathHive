import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Eye, ArrowLeft, Link, X, Loader2 } from "lucide-react";

// Import Service and Types
import { pathService } from "@/lib/pathService";
import { CreatePathPayload } from "@/types/api";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface Step {
  id: string; // Used for frontend rendering keys only
  title: string;
  description: string;
  resources: Resource[];
}

export default function CreatePath() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [allowComments, setAllowComments] = useState(true);
  
  // Tags State
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Steps State
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", title: "", description: "", resources: [] },
  ]);

  // --- Step Management ---
  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), title: "", description: "", resources: [] }]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof Step, value: any) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // --- Resource Management ---
  const addResource = (stepId: string) => {
    setSteps(steps.map((s) =>
      s.id === stepId
        ? { ...s, resources: [...s.resources, { title: "", url: "", type: "article" }] }
        : s
    ));
  };

  const removeResource = (stepId: string, resourceIndex: number) => {
    setSteps(steps.map((s) =>
      s.id === stepId
        ? { ...s, resources: s.resources.filter((_, i) => i !== resourceIndex) }
        : s
    ));
  };

  const updateResource = (stepId: string, resourceIndex: number, field: string, value: string) => {
    setSteps(steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            resources: s.resources.map((r, i) => i === resourceIndex ? { ...r, [field]: value } : r),
          }
        : s
    ));
  };

  // --- Tag Management ---
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags([...selectedTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // --- API Submission ---
  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the payload for Django
      const payload: CreatePathPayload = {
        title,
        description,
        difficulty, // Ensure this matches Backend (Beginner, etc.)
        tags: selectedTags,
        is_published: publish,
        // Map steps to remove the frontend 'id' and keep pure data
        steps: steps.map(step => ({
          title: step.title,
          description: step.description,
          resources: step.resources.map(res => ({
            title: res.title,
            url: res.url,
            type: res.type
          }))
        }))
      };

      await pathService.createPath(payload);

      toast({
        title: publish ? "Path Published!" : "Draft Saved!",
        description: "Your learning path has been created.",
      });
      
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save path. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Create Learning Path</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="hero" onClick={() => handleSave(true)} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              Publish
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Basic Info */}
          <section className="bg-card rounded-xl border p-6 space-y-5">
            <h2 className="text-lg font-display font-semibold">Basic Information</h2>
            
            <div>
              <Label htmlFor="title">Path Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete React Developer Guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what learners will achieve..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
                <div>
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">Let learners discuss</p>
                </div>
                <Switch checked={allowComments} onCheckedChange={setAllowComments} />
              </div>
            </div>

            {/* Simple Tag Input */}
            <div>
              <Label>Tags (Press Enter to add)</Label>
              <Input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter..."
                className="mt-2"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold">Learning Steps</h2>
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>

            {steps.map((step, index) => (
              <div key={step.id} className="bg-card rounded-xl border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <Input
                    placeholder="Step title"
                    value={step.title}
                    onChange={(e) => updateStep(step.id, "title", e.target.value)}
                    className="flex-1"
                  />
                  {steps.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeStep(step.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Textarea
                  placeholder="Describe this step..."
                  value={step.description}
                  onChange={(e) => updateStep(step.id, "description", e.target.value)}
                  className="min-h-[80px]"
                />

                {/* Resources */}
                <div className="space-y-3 pl-11">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Resources (URL only)</Label>
                    <Button variant="ghost" size="sm" onClick={() => addResource(step.id)}>
                      <Link className="h-3.5 w-3.5 mr-1" /> Add Link
                    </Button>
                  </div>

                  {step.resources.map((resource, rIndex) => (
                    <div key={rIndex} className="flex gap-2 items-start">
                      <Select
                        value={resource.type}
                        onValueChange={(v) => updateResource(step.id, rIndex, "type", v)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="documentation">Docs</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        placeholder="Resource Title"
                        value={resource.title}
                        onChange={(e) => updateResource(step.id, rIndex, "title", e.target.value)}
                        className="flex-1"
                      />
                      
                      <Input
                        placeholder="https://..."
                        value={resource.url}
                        onChange={(e) => updateResource(step.id, rIndex, "url", e.target.value)}
                        className="flex-1"
                      />

                      <Button variant="ghost" size="icon" onClick={() => removeResource(step.id, rIndex)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}