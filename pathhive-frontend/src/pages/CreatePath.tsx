import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { mockTags } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  Link,
  X,
  Upload,
  File,
  ChevronsUpDown,
} from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: string;
  file?: File;
  fileName?: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
}

export default function CreatePath() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", title: "", description: "", resources: [] },
  ]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const filteredTags = mockTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearchValue.toLowerCase()) &&
      !selectedTags.includes(tag.name)
  );

  const addStep = () => {
    setSteps([
      ...steps,
      { id: Date.now().toString(), title: "", description: "", resources: [] },
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof Step, value: any) => {
    setSteps(
      steps.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addResource = (stepId: string) => {
    setSteps(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, resources: [...s.resources, { title: "", url: "", type: "article" }] }
          : s
      )
    );
  };

  const removeResource = (stepId: string, resourceIndex: number) => {
    setSteps(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, resources: s.resources.filter((_, i) => i !== resourceIndex) }
          : s
      )
    );
  };

  const updateResource = (
    stepId: string,
    resourceIndex: number,
    field: string,
    value: string | File
  ) => {
    setSteps(
      steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              resources: s.resources.map((r, i) =>
                i === resourceIndex ? { ...r, [field]: value } : r
              ),
            }
          : s
      )
    );
  };

  const handleFileUpload = (stepId: string, files: FileList) => {
    const newResources: Resource[] = Array.from(files).map((file) => ({
      title: file.name.split('.')[0],
      url: "",
      type: "file",
      file,
      fileName: file.name,
    }));

    setSteps(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, resources: [...s.resources, ...newResources] }
          : s
      )
    );

    toast({
      title: `${files.length} file${files.length > 1 ? 's' : ''} attached`,
      description: `Added ${files.length} resource${files.length > 1 ? 's' : ''} to this step.`,
    });
  };

  const removeFile = (stepId: string, resourceIndex: number) => {
    setSteps(
      steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              resources: s.resources.map((r, i) =>
                i === resourceIndex
                  ? { ...r, file: undefined, fileName: undefined }
                  : r
              ),
            }
          : s
      )
    );
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagSearchValue("");
    setTagSearchOpen(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSave = (publish: boolean) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your learning path.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: publish ? "Path Published!" : "Draft Saved!",
      description: publish
        ? "Your learning path is now live."
        : "Your progress has been saved.",
    });
    
    navigate("/dashboard");
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
              <p className="text-muted-foreground">Share your knowledge with the community</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="hero" onClick={() => handleSave(true)}>
              <Eye className="h-4 w-4 mr-2" />
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
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
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

            {/* Tags with Autocomplete */}
            <div>
              <Label>Tags</Label>
              <div className="mt-2 space-y-3">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="default" className="gap-1 pr-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Search Input */}
                <Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tagSearchOpen}
                      className="w-full justify-between"
                    >
                      <span className="text-muted-foreground">Search and add tags...</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search tags..."
                        value={tagSearchValue}
                        onValueChange={setTagSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {tagSearchValue && (
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-sm text-left hover:bg-accent"
                              onClick={() => addTag(tagSearchValue)}
                            >
                              Create "{tagSearchValue}"
                            </button>
                          )}
                          {!tagSearchValue && "No tags found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredTags.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => addTag(tag.name)}
                            >
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold">Learning Steps</h2>
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeStep(step.id)}
                    >
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Resources</Label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[`upload-${step.id}`] = el;
                        }}
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleFileUpload(step.id, files);
                          }
                          e.target.value = "";
                        }}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,.mp3,.mp4"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRefs.current[`upload-${step.id}`]?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        Upload Files
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => addResource(step.id)}>
                        <Link className="h-3.5 w-3.5 mr-1" />
                        Add Link
                      </Button>
                    </div>
                  </div>

                  {step.resources.map((resource, rIndex) => (
                    <div key={rIndex} className="bg-secondary/50 rounded-lg p-3 space-y-3">
                      <div className="flex gap-2 items-start">
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
                            <SelectItem value="exercise">Exercise</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Resource title"
                          value={resource.title}
                          onChange={(e) => updateResource(step.id, rIndex, "title", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeResource(step.id, rIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* URL or File Display */}
                      {resource.fileName ? (
                        <div className="flex items-center gap-2 bg-background rounded-md px-3 py-2 border">
                          <File className="h-4 w-4 text-primary" />
                          <span className="text-sm flex-1 truncate">{resource.fileName}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFile(step.id, rIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Input
                          placeholder="URL"
                          value={resource.url}
                          onChange={(e) => updateResource(step.id, rIndex, "url", e.target.value)}
                        />
                      )}
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