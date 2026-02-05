import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
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
import { Search, SlidersHorizontal, X, BookOpen, Loader2, Star } from "lucide-react"; // Added Star icon

import { PathCard } from "@/components/shared/PathCard";
import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";

export default function Browse() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("all"); // ✨ NEW: Rating State
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const data = await pathService.getAllPaths();
        setPaths(data);
      } catch (err) {
        console.error("Failed to fetch paths", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const availableTags = useMemo(() => {
    const allTags = new Set<string>();
    paths.filter(p => p.is_published).forEach(path => {
      path.tags.forEach(tag => {
        const tagName = typeof tag === 'string' ? tag : (tag as any).name;
        if(tagName) allTags.add(tagName);
      });
    });
    return Array.from(allTags);
  }, [paths]);

  // --- Filtering Logic ---
  const filteredPaths = useMemo(() => {
    let result = paths.filter(path => path.is_published);

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (path) =>
          path.title.toLowerCase().includes(query) ||
          path.description.toLowerCase().includes(query)
      );
    }

    // Tags
    if (selectedTags.length > 0) {
      result = result.filter((path) =>
        selectedTags.some((selectedTag) =>
          path.tags.some((t) => {
             const tName = typeof t === 'string' ? t : (t as any).name;
             return tName.toLowerCase() === selectedTag.toLowerCase();
          })
        )
      );
    }

    // Difficulty
    if (difficulty !== "all") {
      result = result.filter((path) => 
        path.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // ✨ NEW: Rating Filter ✨
    if (minRating !== "all") {
        const min = parseFloat(minRating);
        result = result.filter((path) => (path.average_rating || 0) >= min);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating": // Optional: Add a sort by rating option too
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
    }

    return result;
  }, [paths, searchQuery, selectedTags, difficulty, minRating, sortBy]);

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
    setMinRating("all"); // Clear rating
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || difficulty !== "all" || minRating !== "all";

  if (isLoading) {
    return (
      <MainLayout>
         <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Browse Learning Paths
            </h1>
            <p className="text-muted-foreground">
              Discover curated learning journeys created by the community.
            </p>
          </div>
          <Link to="/create-path">
             <Button>+ Create New Path</Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
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
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="bg-gray-50/50 p-4 rounded-lg border space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                
                {/* Difficulty Select */}
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                {/* ✨ NEW: Rating Select ✨ */}
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-[140px] bg-white">
                     <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Rating" />
                     </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.0">3.0+ Stars</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>

              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground self-center mr-2">Tags:</span>
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Grid */}
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
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No paths found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or create the first path for this topic!
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