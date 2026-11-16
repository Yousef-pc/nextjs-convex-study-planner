"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordCard from "@/components/web/dashboard/word-bank/word-card";
import AddWordDialog from "@/components/web/dashboard/word-bank/add-word-dialog";

export default function WordBankPlugin() {
  const words = useQuery(api.words.getWords);

  if (words === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Word Bank</h2>
          <p className="text-muted-foreground text-sm">Build your vocabulary.</p>
        </div>
        
        <AddWordDialog>
          <Button>
            <Plus className="mr-2 size-4" /> Add Word
          </Button>
        </AddWordDialog>
      </div>

      <div className="space-y-3">
        {words.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-muted-foreground">No words yet. Add your first word to get started!</p>
          </div>
        ) : (
          words.map((item, index) => (
            <WordCard key={item._id} item={item} index={index} />
          ))
        )}
      </div>
    </div>
  );
}