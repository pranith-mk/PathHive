import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PathCard } from "@/components/shared/PathCard";
import { mockLearningPaths, mockTags } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPaths = useMemo(() => {
    let paths = [...mockLearningPaths];

    // Search filter
    if (searchQuery) {
      paths = paths.filter(
        (path) =>
          path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          path.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      paths = paths.filter((path) =>
        selectedTags.some((tag) =>
          path.tags.some((t) => t.name.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    // Difficulty filter
    if (difficulty !== "all") {
      paths = paths.filter((path) => path.difficulty === difficulty);
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        paths.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case "rating":
        paths.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "newest":
        paths.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return paths;
  }, [searchQuery, selectedTags, difficulty, sortBy]);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setDifficulty("all");
    setSortBy("popular");
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || difficulty !== "all";

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Browse Learning Paths
          </h1>
          <p className="text-muted-foreground">
            Discover curated learning journeys created by experts and the community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Row */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-4`}>
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleTag(tag.name)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active:</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => toggleTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPaths.length} {filteredPaths.length === 1 ? "path" : "paths"}
          </p>
        </div>

        {filteredPaths.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No paths found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
