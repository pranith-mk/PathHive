import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { pathService } from "@/lib/pathService";
import { Comment, User } from "@/types/api"; // <--- Import User
import { Loader2, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CommentItem } from "./CommentItem";

interface CommentsSectionProps {
  pathId: string;
  isAuthenticated: boolean;
  currentUser: User | null; // <--- NEW: Need this to check ownership
  onNavigateToLogin: () => void;
}

// Helper to convert flat list to tree
function buildCommentTree(flatComments: Comment[]): Comment[] {
  const commentMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  // 1. Create a map and initialize replies array
  flatComments.forEach((c) => {
    commentMap.set(c.id, { ...c, replies: [] });
  });

  // 2. Link children to parents
  flatComments.forEach((c) => {
    if (c.parent && commentMap.has(c.parent)) {
      const parent = commentMap.get(c.parent);
      parent?.replies?.push(commentMap.get(c.id)!);
    } else {
      // It's a root comment
      rootComments.push(commentMap.get(c.id)!);
    }
  });

  // 3. Sort by newest first
  return rootComments.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function CommentsSection({ 
  pathId, 
  isAuthenticated, 
  currentUser, // <--- Destructure currentUser
  onNavigateToLogin 
}: CommentsSectionProps) {
  
  const [flatComments, setFlatComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await pathService.getComments(pathId);
        setFlatComments(data);
      } catch (error) {
        console.error("Failed to load comments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [pathId]);

  // NEW: Handle Delete
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await pathService.deleteComment(pathId, commentId);
      
      // Update UI: Remove the deleted comment from the flat list
      setFlatComments((prev) => prev.filter((c) => c.id !== commentId));
      
      toast({ title: "Comment deleted" });
    } catch (error) {
      console.error("Delete failed", error);
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  // Handle Adding a Comment (Root or Reply)
  const handleAddComment = async (parentId: number | null, text: string) => {
    if (!isAuthenticated) {
      onNavigateToLogin();
      return;
    }

    if (parentId === null) setIsPosting(true);

    try {
      const createdComment = await pathService.addComment(pathId, text, parentId || undefined);
      
      // Add to flat list (Tree builder handles the rest)
      setFlatComments((prev) => [...prev, createdComment]);
      
      if (parentId === null) {
        setNewComment("");
        toast({ title: "Comment posted!" });
      }
    } catch (error) {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } finally {
      if (parentId === null) setIsPosting(false);
    }
  };

  const rootComments = buildCommentTree(flatComments);

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-4" />;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Root Input Area */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">Log in to join the discussion</p>
            <Button onClick={onNavigateToLogin} variant="outline">Log In</Button>
          </div>
        ) : (
          <div className="flex gap-4">
             <Avatar className="h-10 w-10 border hidden md:block">
                <AvatarImage src={undefined} />
                <AvatarFallback>
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
             </Avatar>
             <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Ask a question or share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => handleAddComment(null, newComment)} disabled={isPosting || !newComment.trim()}>
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Post Comment
                  </Button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Tree Render */}
      <div className="space-y-6">
        {rootComments.length === 0 ? (
           <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No comments yet. Be the first to share!</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={(parentId, text) => handleAddComment(parentId, text)}
              isAuthenticated={isAuthenticated}
              onAuthRequired={onNavigateToLogin}
              // NEW: Pass user ID and delete handler
              currentUserId={currentUser?.id}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}