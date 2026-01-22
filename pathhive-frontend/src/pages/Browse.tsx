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
import { Search, SlidersHorizontal, X, BookOpen, Loader2, User } from "lucide-react";

// Import Service and Types
import { pathService } from "@/lib/pathService";
import { Path } from "@/types/api";

export default function Browse() {
  // 1. State for Real Data
  const [paths, setPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // 3. Fetch Real Data
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

  // 4. Unique Tags from Real Data
  const availableTags = useMemo(() => {
    const allTags = new Set<string>();
    paths.forEach(path => {
      path.tags.forEach(tag => {
        // Backend might send object {id, name} or string "React"
        const tagName = typeof tag === 'string' ? tag : (tag as any).name;
        if(tagName) allTags.add(tagName);
      });
    });
    return Array.from(allTags);
  }, [paths]);

  // 5. Filtering Logic (Adapted for API Data)
  const filteredPaths = useMemo(() => {
    let result = [...paths];

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
      // Backend stores "Beginner" (Title Case), so we match loosely
      result = result.filter((path) => 
        path.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      // Note: "Popular" and "Rating" require backend fields we don't have yet.
      // We can add them back later.
    }

    return result;
  }, [paths, searchQuery, selectedTags, difficulty, sortBy]);

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
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || difficulty !== "all";

  // 6. Loading View
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
          <Link to="/create">
             <Button>+ Create New Path</Button>
          </Link>
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
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-gray-50/50 p-4 rounded-lg border space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    {/* Add Popular/Rating back when backend supports it */}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Dynamic Tags from DB */}
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
              <Link 
                key={path.id} 
                to={`/path/${path.id}`}
                className="group block bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Custom Card UI (Replacing PathCard to ensure compatibility) */}
                <div className="h-32 bg-gradient-to-r from-orange-100 to-orange-50 p-6 flex items-start justify-between">
                   <Badge variant="secondary" className="bg-white/90">
                      {path.difficulty}
                   </Badge>
                </div>
                <div className="p-5">
                   <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                     {path.title}
                   </h3>
                   <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                     {path.description || "No description provided."}
                   </p>
                   
                   <div className="flex items-center gap-2 pt-4 border-t">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                         <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {path.creator?.username || "Anonymous"}
                      </span>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
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