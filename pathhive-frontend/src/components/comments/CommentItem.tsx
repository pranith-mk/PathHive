import { useState } from "react";
import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Send, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/reports/ReportDialog";

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  depth?: number;
}

export function CommentItem({ comment, onReply, isAuthenticated, onAuthRequired, depth = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const maxDepth = 3;
  const canNest = depth < maxDepth;

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 pl-4 border-l-2 border-border/50")}>
      <div className="bg-card rounded-xl border p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user?.avatar} />
            <AvatarFallback>{comment.user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{comment.user?.fullName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-muted-foreground mb-3">{comment.content}</p>
            
            <div className="flex items-center gap-1 -ml-2">
              {isAuthenticated && canNest && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
              <ReportDialog
                reportType="comment"
                targetId={comment.id}
                isAuthenticated={isAuthenticated}
                onAuthRequired={onAuthRequired}
                trigger={
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Flag className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="mt-4 pl-13 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isAuthenticated={isAuthenticated}
              onAuthRequired={onAuthRequired}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
