"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { addWordSchema } from "@/app/schemas/word-bank";

interface EditWordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  wordData: {
    _id: Id<"words">;
    word: string;
    meaning: string;
    examples: string[];
  } | null;
}

export default function EditWordDialog({ isOpen, onOpenChange, wordData }: EditWordDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const updateWord = useMutation(api.words.updateWord);

  const form = useForm<z.infer<typeof addWordSchema>>({
    resolver: zodResolver(addWordSchema),
    values: wordData ? {
      word: wordData.word,
      meaning: wordData.meaning,
      examples: wordData.examples.map(e => ({ text: e })),
    } : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "examples",
  });

  async function onSubmit(data: z.infer<typeof addWordSchema>) {
    if (!wordData) return;
    setIsPending(true);
    try {
      const validExamples = data.examples.map((e) => e.text.trim()).filter((text) => text !== "");
      await updateWord({
        id: wordData._id,
        word: data.word,
        meaning: data.meaning,
        examples: validExamples,
      });
      toast.add({ type: "success", description: "Word updated successfully!" });
      onOpenChange(false);
    } catch (error) {
      toast.add({ type: "error", description: "Failed to update word." });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Controller
              name="word"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-1 space-y-2">
                  <Label>Word</Label>
                  <Input {...field} />
                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                </div>
              )}
            />
            <Controller
              name="meaning"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-3 space-y-2">
                  <Label>Meaning</Label>
                  <Input {...field} />
                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                </div>
              )}
            />
          </div>

         

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}