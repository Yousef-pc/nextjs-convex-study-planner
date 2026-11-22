"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel"; // 👈 Import Doc
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
// 👈 Removed MessageSquare from imports
import { Trash2 } from "lucide-react"; 
import { ConvexError } from "convex/values";
import { toast } from "@/components/ui/toast";
import { invalidateCommentsCache } from "./actions";
import { useRouter } from "next/navigation";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CommentAvatar({ imageId, userId, userName }: { imageId?: string; userId: string; userName: string }) {
  const imageUrl = useQuery(
    api.files.getUrl,
    imageId && !imageId.startsWith("http") ? { storageId: imageId as Id<"_storage"> } : "skip"
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

interface CommentsListProps {
  comments: Doc<"comments">[];
  pluginId: Id<"plugins">;
}

export function CommentsList({ comments, pluginId }: CommentsListProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  
  const deleteComment = useMutation(api.comments.deleteComment);
  const [commentToDelete, setCommentToDelete] = useState<Id<"comments"> | null>(null);
  const router = useRouter();

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    const id = commentToDelete;
    setCommentToDelete(null);
    try {
      await deleteComment({ commentId: id });
      toast.add({ type: "success", description: "Comment deleted." });
      await invalidateCommentsCache(pluginId);
      router.refresh();
    } catch (error) {
      toast.add({ type: "error", description: error instanceof ConvexError ? String(error.data) : "Failed" });
    }
  };

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>;
  }

  return (
    <>
      <div className="space-y-6">
        {comments.map((comment) => {
          const isOwner = currentUserId === comment.userId;
          return (
            <div key={comment._id} className="flex gap-4 group">
              <CommentAvatar imageId={comment.userImage} userId={comment.userId} userName={comment.userName} />
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment._creationTime).toLocaleDateString()}
                    </span>
                    {isOwner && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">You</span>
                    )}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setCommentToDelete(comment._id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <ExpandableText text={comment.text} />
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={commentToDelete !== null} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}