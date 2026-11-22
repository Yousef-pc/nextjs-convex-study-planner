"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordCard from "@/components/web/dashboard/word-bank/word-card";
import AddWordDialog from "@/components/web/dashboard/word-bank/add-word-dialog";
import SearchInput from "@/components/web/dashboard/word-bank/search-input";
import IndexFilter from "@/components/web/dashboard/word-bank/index-filter"; // 👈 Import the new component
import { smartImportSchemas } from "@/app/schemas/smartImport";
import { toast } from "@/components/ui/toast";
import { ConvexError } from "convex/values";

type WordBankImportData = { word: string; meaning: string; examples: string[] }[];

export default function WordBankPlugin() {
  const words = useQuery(api.words.getWords);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [startRange, setStartRange] = useState<string>("");
  const [endRange, setEndRange] = useState<string>("");

  const importWordBankData = useMutation(api.smartImport.importWordBankData);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // ... (Paste listener remains the same)
    const handlePaste = async (e: ClipboardEvent) => {
      if (isImporting) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const pastedText = e.clipboardData?.getData("text");
      if (!pastedText) return;

      let parsedData: unknown;
      try { parsedData = JSON.parse(pastedText); } catch (error) { return; }

      const schema = smartImportSchemas["word-bank"];
      if (!schema) return;

      const validation = schema.safeParse(parsedData);
      if (!validation.success) {
        toast.add({ type: "error", title: "Validation Failed", description: validation.error.issues[0]?.message || "Invalid data" });
        return;
      }

      e.preventDefault();
      setIsImporting(true);

      try {
        const result = await importWordBankData({ data: validation.data as WordBankImportData });
        toast.add({ type: "success", title: "Import Successful", description: `Added ${result.newWordsCount} words.` });
      } catch (error) {
        toast.add({ type: "error", title: "Import Failed", description: error instanceof ConvexError ? String(error.data) : "Failed" });
      } finally {
        setIsImporting(false);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isImporting, importWordBankData]);

  if (words === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const maxWords = words.length;

  // 👈 The Math (kept here because it determines the data, not the UI)
  let startNum = startRange === "" ? 1 : parseInt(startRange, 10);
  let endNum = endRange === "" ? maxWords : parseInt(endRange, 10);
  if (isNaN(startNum)) startNum = 1;
  if (isNaN(endNum)) endNum = maxWords;
  if (startNum < 1) startNum = 1;
  if (endNum > maxWords) endNum = maxWords;

  const isRangeInvalid = startNum > endNum;

  const filteredWords = words
    .map((word, index) => ({ ...word, originalIndex: index + 1 }))
    .filter((word) => {
      if (isRangeInvalid) return false;
      return word.originalIndex >= startNum && word.originalIndex <= endNum;
    })
    .filter((word) => {
      const query = searchQuery.toLowerCase();
      return (
        word.word.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query)
      );
    });

  const isDbEmpty = words.length === 0;
  const isSearchEmpty = filteredWords.length === 0 && (searchQuery !== "" || startRange !== "" || endRange !== "");

  return (
    <div className="max-w-4xl mx-auto py-4 relative">
      {isImporting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-background p-8 rounded-xl shadow-2xl border">
            <Loader2 className="size-10 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">Importing Words</p>
              <p className="text-sm text-muted-foreground">This will only take a moment...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Word Bank</h2>
            <p className="text-muted-foreground text-sm">Build your vocabulary.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search words or meanings..." 
            />
            <AddWordDialog>
              <Button disabled={isImporting}>
                <Plus className="mr-2 size-4" /> Add Word
              </Button>
            </AddWordDialog>
          </div>
        </div>

        {/* 👈 The Extracted Component */}
        {!isDbEmpty && (
          <IndexFilter 
            startRange={startRange}
            endRange={endRange}
            maxWords={maxWords}
            onStartChange={setStartRange}
            onEndChange={setEndRange}
            isRangeInvalid={isRangeInvalid}
          />
        )}
      </div>

      <div className="space-y-3">
        {isDbEmpty ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-muted-foreground">No words yet. Add your first word to get started!</p>
          </div>
        ) : isSearchEmpty || isRangeInvalid ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
            <Search className="mx-auto size-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No words found</h3>
            <p className="text-muted-foreground">
              {isRangeInvalid ? "Please fix the range inputs above." : `No words match your current filters.`}
            </p>
          </div>
        ) : (
          filteredWords.map((item) => (
            <WordCard 
              key={item._id} 
              item={item} 
              index={item.originalIndex - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}