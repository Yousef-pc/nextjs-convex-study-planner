"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, ChevronUp, Trash2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EditWordDialog from "./edit-word-dialog";

interface WordCardProps {
  item: {
    _id: Id<"words">;
    word: string;
    meaning: string;
    examples: string[];
  };
  index: number;
}

export default function WordCard({ item, index }: WordCardProps) {
  const updateWord = useMutation(api.words.updateWord);
  const deleteWord = useMutation(api.words.deleteWord);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newExample, setNewExample] = useState("");

  const hasMultipleExamples = item.examples.length > 1;
  // We show the expand button if there's at least 1 example OR if the user wants to add one
  const showExpandArea = item.examples.length > 0 || true; 

  const handleAddExample = async () => {
    if (!newExample.trim()) return;
    const updatedExamples = [...item.examples, newExample.trim()];
    await updateWord({ id: item._id, word: item.word, meaning: item.meaning, examples: updatedExamples });
    setNewExample("");
    setIsExpanded(true);
  };

  const handleRemoveExample = async (exampleToRemove: string) => {
    const updatedExamples = item.examples.filter((e) => e !== exampleToRemove);
    await updateWord({ id: item._id, word: item.word, meaning: item.meaning, examples: updatedExamples });
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out">
        <div className="p-4 flex items-center gap-4">
          
          {/* Row Number */}
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            {index + 1}
          </div>

          {/* Pen Icon on the left side of word/meaning */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
          >
            <Pencil className="size-4" />
          </Button>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <h3 className="text-lg font-semibold md:col-span-1">{item.word}</h3>
            <p className="text-muted-foreground md:col-span-2">{item.meaning}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isExpanded ? (
                <><ChevronUp className="size-4 mr-1" /> Hide</>
              ) : (
                <><ChevronDown className="size-4 mr-1" /> Expand</>
              )}
            </Button>

            {/* Delete Word Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteWord({ id: item._id })}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Area (Examples + Add Example Input) */}
        <div 
          className={`bg-muted/30 px-4 border-t transition-all duration-300 ${
            isExpanded ? "py-4 opacity-100" : "max-h-0 py-0 opacity-0 overflow-hidden border-transparent"
          }`}
        >
          <h4 className="text-sm font-semibold mb-3">Examples:</h4>
          
          {item.examples.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-3">No examples yet.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {item.examples.map((example, i) => (
                <li key={i} className="flex items-start justify-between group/example text-sm text-muted-foreground bg-background/50 p-2 rounded-md">
                  <span>{example}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExample(example)}
                    className="size-6 opacity-0 group-hover/example:opacity-100 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {/* Inline Add Example Input */}
          <div className="flex items-center gap-2 mt-2">
            <Input
              placeholder="Add a new example..."
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExample();
                }
              }}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleAddExample} disabled={!newExample.trim()}>
              <Plus className="size-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <EditWordDialog 
        isOpen={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        wordData={item} 
      />
    </>
  );
}