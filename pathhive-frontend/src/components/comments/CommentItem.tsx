import { useState } from "react";
import { Comment } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Send, Loader2, ChevronDown, Minus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number, text: string) => Promise<void>;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  depth?: number;
  // 1. UPDATE THIS LINE: Allow string or number
  currentUserId?: string | number; 
  onDelete?: (commentId: number) => Promise<void>;
}

export function CommentItem({ 
  comment, 
  onReply, 
  isAuthenticated, 
  onAuthRequired, 
  depth = 0,
  currentUserId,
  onDelete 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleSubmitReply = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (replyContent.trim()) {
      setIsSubmitting(true);
      await onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
      setIsSubmitting(false);
      setShowReplies(true);
    }
  };

  const maxDepth = 3; 
  const canNest = depth < maxDepth;
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  const isOwner = currentUserId !== undefined && String(currentUserId) === String(comment.user.id);

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-2 md:ml-6")}> 
      <div className={cn(
        "bg-card rounded-xl border p-4 transition-colors", 
        depth > 0 ? "border-l-4 border-l-primary/20" : "" 
      )}>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 mt-1 border">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.user.username}</span>
                    <span className="text-xs text-muted-foreground">
                        {/* Safe date handling in case created_at is invalid */}
                        {comment.created_at && !isNaN(new Date(comment.created_at).getTime()) 
                           ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                           : 'just now'}
                    </span>
                </div>
                
                {/* Delete Button */}
                {isOwner && onDelete && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={() => onDelete(comment.id)}
                        title="Delete comment"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">
              {comment.text}
            </p>
            
            <div className="flex items-center gap-4">
              {canNest && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-muted-foreground text-xs hover:text-primary p-0 h-auto"
                  onClick={() => isAuthenticated ? setIsReplying(!isReplying) : onAuthRequired()}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-4 pl-11 space-y-2 animate-in fade-in slide-in-from-top-1">
            <Textarea
              placeholder={`Reply to ${comment.user.username}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] resize-none text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle View Replies */}
      {hasReplies && (
        <div className="ml-11">
          {!showReplies ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              onClick={() => setShowReplies(true)}
            >
              <ChevronDown className="h-3 w-3" />
              View {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
            </Button>
          ) : (
             <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-2"
              onClick={() => setShowReplies(false)}
            >
              <Minus className="h-3 w-3" />
              Hide replies
            </Button>
          )}
        </div>
      )}

      {/* Nested Replies */}
      {showReplies && hasReplies && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isAuthenticated={isAuthenticated}
              onAuthRequired={onAuthRequired}
              depth={depth + 1}
              currentUserId={currentUserId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}