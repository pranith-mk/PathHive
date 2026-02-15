import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
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
import { CreatePathPayload, Path } from "@/types/api";

interface Resource {
  id?: string; // Optional for new resources
  title: string;
  url: string;
  type: string;
}

interface Step {
  id: string; // Frontend key (timestamp) OR Backend ID (UUID/Int)
  title: string;
  description: string;
  resources: Resource[];
  isNew?: boolean; // Flag to track new steps in Edit mode
}

export default function PathEditor() {
  const { id } = useParams<{ id: string }>(); // Check if we are in Edit Mode
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [isPublished, setIsPublished] = useState(false);

  // Tags State
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Steps State
  const [steps, setSteps] = useState<Step[]>([
    { id: Date.now().toString(), title: "", description: "", resources: [], isNew: true },
  ]);

  // Track original IDs to detect deletions (for Edit Mode)
  const originalStepIds = useRef<string[]>([]);

  // --- 1. Load Data (Edit Mode) ---
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await pathService.getPathById(id);

        // Populate Form
        setTitle(data.title);
        setDescription(data.description);
        setDifficulty(data.difficulty); // Ensure casing matches (Backend usually sends Title Case)
        setIsPublished(data.is_published);
        setSelectedTags(data.tags.map(t => t.name));

        // Populate Steps
        if (data.steps) {
          const formattedSteps = data.steps.map((s: any) => ({
            id: s.id, // Keep real ID
            title: s.title,
            description: s.description,
            resources: s.resources.map((r: any) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              type: r.resource_type || "article"
            })),
            isNew: false
          }));
          setSteps(formattedSteps);
          originalStepIds.current = formattedSteps.map(s => s.id);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load path.", variant: "destructive" });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);


  // --- Step Management ---
  const addStep = () => {
    setSteps([...steps, {
      id: Date.now().toString(), // Temp ID
      title: "",
      description: "",
      resources: [],
      isNew: true
    }]);
  };

  const removeStep = async (stepId: string) => {
    if (steps.length <= 1 && !id) return; // Don't delete last step in Create mode

    // UI Update
    setSteps(steps.filter((s) => s.id !== stepId));

    // If Edit Mode & Existing Step -> Call API immediately (safer)
    if (id && !stepId.match(/^\d+$/) && !stepId.includes("now")) { // Crude check for "Is Real ID"
      try {
        await pathService.deleteStep(stepId);
      } catch (e) {
        console.error("Failed to delete step on backend");
      }
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

  // --- SAVE HANDLER (Unified) ---
  const handleSave = async (publishStatus: boolean) => {
    // 1. Validate Path Title
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title.", variant: "destructive" });
      return;
    }

    // 2. ✨ VALIDATION: Check for Empty Step Titles ✨
    // Prevents "Field Required" errors from backend on updates
    const invalidStepIndex = steps.findIndex(step => !step.title.trim());
    if (invalidStepIndex !== -1) {
      toast({
        title: "Step Title Missing",
        description: `Step ${invalidStepIndex + 1} needs a title.`,
        variant: "destructive"
      });
      return; // STOP here
    }

    setIsSaving(true);

    try {
      // 1. Prepare Basic Payload
      const basicPayload = {
        title,
        description,
        difficulty,
        tags_list: selectedTags, // Ensure backend Serializer accepts this!
        is_published: publishStatus,
      };

      if (!id) {
        // === CREATE MODE (Monolithic) ===
        const createPayload: CreatePathPayload = {
          ...basicPayload,
          tags: selectedTags,
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

        await pathService.createPath(createPayload);
        toast({ title: "Path Created!", description: "Your new path is ready." });
        navigate("/dashboard");

      } else {
        // === EDIT MODE (Sync/Diff) ===

        // A. Update Basic Info
        await pathService.updatePath(id, basicPayload as any);

        // B. Sync Steps
        for (const step of steps) {
          const stepPayload = {
            title: step.title,
            description: step.description,
            position: steps.indexOf(step)
          };

          if (step.isNew) {
            // Create New Step
            const newStep = await pathService.createStep(id, stepPayload);

            // Create Resources for new step
            for (const res of step.resources) {
              await pathService.createResource(newStep.id, {
                title: res.title,
                url: res.url,
                resource_type: res.type
              });
            }
          } else {
            // Update Existing Step
            await pathService.updateStep(step.id, stepPayload);

            // Resources Update:
            // For simplicity in Edit Mode: We Create new ones. 
            // (Robust resource diffing requires complex ID tracking)
            const newResources = step.resources.filter(r => !r.id);
            for (const res of newResources) {
              await pathService.createResource(step.id, {
                title: res.title,
                url: res.url,
                resource_type: res.type
              });
            }
          }
        }

        toast({ title: "Changes Saved", description: "Path updated successfully." });
        navigate(`/path/${id}`);
      }

    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
              <h1 className="text-2xl font-display font-bold">
                {id ? "Edit Learning Path" : "Create Learning Path"}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="hero" onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              {isPublished || id ? "Update & Publish" : "Publish"}
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
                  <Label>Published</Label>
                  <p className="text-sm text-muted-foreground">Visible to all users</p>
                </div>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
            </div>

            {/* Tag Input */}
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
                  {(steps.length > 1 || id) && (
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
                          <SelectItem value="doc">Docs</SelectItem>

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