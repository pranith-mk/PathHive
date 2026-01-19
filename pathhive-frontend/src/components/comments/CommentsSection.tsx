import { useState } from "react";
import { Comment, User } from "@/types";
import { CommentItem } from "./CommentItem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { currentUser } from "@/data/mockData";

interface CommentsSectionProps {
  comments: Comment[];
  pathId: string;
  isAuthenticated: boolean;
  onNavigateToLogin: () => void;
}

// Build nested comment tree from flat list
function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create a map of all comments with empty replies
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)!;
      parent.replies = parent.replies || [];
      parent.replies.push(commentWithReplies);
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

export function CommentsSection({
  comments: initialComments,
  pathId,
  isAuthenticated,
  onNavigateToLogin,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      pathId,
      content: newComment.trim(),
      createdAt: new Date(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

  const handleReply = (parentId: string, content: string) => {
    const reply: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      pathId,
      parentId,
      content,
      createdAt: new Date(),
    };

    setComments((prev) => [...prev, reply]);
  };

  const commentTree = buildCommentTree(comments);

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="bg-card rounded-xl border p-5">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-3">Sign in to join the discussion</p>
          <Button onClick={onNavigateToLogin}>Sign In</Button>
        </div>
      )}

      {/* Comments List */}
      {commentTree.length > 0 ? (
        <div className="space-y-4">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              isAuthenticated={isAuthenticated}
              onAuthRequired={onNavigateToLogin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No comments yet</h3>
          <p className="text-muted-foreground">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}
