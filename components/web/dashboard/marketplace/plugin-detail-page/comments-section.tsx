"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { MessageSquare, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { commentSchema } from "@/app/schemas/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // 👈 Import AlertDialog

interface CommentsSectionProps {
  pluginId: Id<"plugins">;
  isGuest: boolean;
}

function CommentAvatar({ imageId, userId, userName }: { imageId?: string; userId: string; userName: string }) {
  const imageUrl = useQuery(
    api.files.getUrl,
    imageId && !imageId.startsWith("http")
      ? { storageId: imageId as Id<"_storage"> }
      : "skip"
  );

  return (
    <Avatar className="size-10 shrink-0 border-gray border-2 shadow-sm">
      <AvatarImage src={imageUrl || `https://avatar.vercel.sh/${userId}`} alt={userName} />
      <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowButton = text.length > 150;

  return (
    <div className="space-y-1">
      <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${!isExpanded && shouldShowButton ? "line-clamp-3" : ""}`}>
        {text}
      </p>
      {shouldShowButton && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-semibold text-primary hover:underline">
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export function CommentsSection({ pluginId, isGuest }: CommentsSectionProps) {
  const comments = useQuery(api.comments.getComments, { pluginId });
  const addComment = useMutation(api.comments.addComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 👈 State to track which comment we want to delete
  const [commentToDelete, setCommentToDelete] = useState<Id<"comments"> | null>(null);

  const handleSubmit = async () => {
    const validation = commentSchema.safeParse({ text });
    if (!validation.success) {
      toast.add({ type: "error", description: validation.error.issues[0].message });
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment({ pluginId, text: validation.data.text });
      setText(""); 
      toast.add({ type: "success", description: "Comment posted!" });
    } catch (error) {
      toast.add({ type: "error", description: error instanceof ConvexError ? String(error.data) : "Failed to post comment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    const id = commentToDelete;
    setCommentToDelete(null); // Close dialog instantly

    try {
      await deleteComment({ commentId: id });
      toast.add({ type: "success", description: "Comment deleted." });
    } catch (error) {
      toast.add({ type: "error", description: error instanceof ConvexError ? String(error.data) : "Failed to delete comment." });
    }
  };

  if (comments === undefined) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="size-5" /> {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Textarea
              placeholder={isGuest ? "Sign in to leave a comment..." : "Share your thoughts..."}
              className="bg-background min-h-[100px]"
              disabled={isGuest || isSubmitting}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <Button onClick={handleSubmit} disabled={isGuest || isSubmitting || !text.trim()}>
                {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" /> Posting...</> : "Comment"}
              </Button>
              <span className={`text-xs ${text.length > 1000 ? "text-red-500" : "text-muted-foreground"}`}>
                {text.length} / 1000
              </span>
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => {
                // 👈 Check if the current user owns the comment
                const isOwner = currentUserId === comment.userId;

                return (
                  <div key={comment._id} className="flex gap-4 group">
                    <CommentAvatar 
                      imageId={comment.userImage} 
                      userId={comment.userId} 
                      userName={comment.userName} 
                    />
                    
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment._creationTime).toLocaleDateString()}
                          </span>
                          {isOwner && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                              You
                            </span>
                          )}
                        </div>
                        
                        {/* 👈 Open Dialog instead of deleting immediately */}
                        {isOwner && (
                          <button
                            onClick={() => setCommentToDelete(comment._id)}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                            title="Delete comment"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                      
                      <ExpandableText text={comment.text} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 👈 The Confirmation Dialog */}
      <AlertDialog 
        open={commentToDelete !== null} 
        onOpenChange={(open) => !open && setCommentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}