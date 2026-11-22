"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { commentSchema } from "@/app/schemas/comments";
import { invalidateCommentsCache } from "./actions"; // 👈 Import server action
import { useRouter } from "next/navigation";

interface CommentFormProps {
  pluginId: Id<"plugins">;
  isGuest: boolean;
}

export function CommentForm({ pluginId, isGuest }: CommentFormProps) {
  const addComment = useMutation(api.comments.addComment);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
      
      // 👈 1. Clear the Next.js cache
      await invalidateCommentsCache(pluginId);
      // 👈 2. Refresh the router so the new comment appears instantly for the current user
      router.refresh(); 
      
    } catch (error) {
      toast.add({ type: "error", description: error instanceof ConvexError ? String(error.data) : "Failed to post comment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 mb-6">
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
  );
}