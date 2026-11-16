"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { addWordSchema } from "@/app/schemas/word-bank";

export default function AddWordDialog({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const addWord = useMutation(api.words.addWord);

  const form = useForm<z.infer<typeof addWordSchema>>({
    resolver: zodResolver(addWordSchema),
    defaultValues: {
      word: "",
      meaning: "",
      examples: [], // 👈 Start with zero examples
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "examples",
  });

  async function onSubmit(data: z.infer<typeof addWordSchema>) {
    setIsPending(true);
    try {
      // 👈 Filter out any empty example inputs before sending to the backend
      const validExamples = data.examples
        .map((e) => e.text.trim())
        .filter((text) => text !== "");

      await addWord({
        word: data.word,
        meaning: data.meaning,
        examples: validExamples,
      });
      toast.add({ type: "success", description: "Word added successfully!" });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.add({ type: "error", description: "Failed to add word." });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Word</DialogTitle>
          <DialogDescription>Expand your vocabulary by adding a new word.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          {/* 👈 Changed to 4 columns: Word takes 1 (25%), Meaning takes 3 (75%) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Controller
              name="word"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="md:col-span-1 space-y-2">
                  <Label>Word</Label>
                  <Input placeholder="e.g., Ephemeral" {...field} />
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
                  <Input placeholder="e.g., Lasting for a very short time..." {...field} />
                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Examples Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Examples <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "" })}>
                <Plus className="mr-2 size-4" /> Add Example
              </Button>
            </div>
            
            {fields.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <Controller
                      name={`examples.${index}.text`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="flex-1">
                          <Input 
                            placeholder="Type example and press Enter to add another..." 
                            {...field} 
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                append({ text: "" });
                              }
                            }}
                          />
                          {fieldState.error && <p className="text-xs text-red-500">{fieldState.error.message}</p>}
                        </div>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Saving...</> : "Save Word"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}