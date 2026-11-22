"use client";

import { Input } from "@/components/ui/input";

interface IndexFilterProps {
  startRange: string;
  endRange: string;
  maxWords: number;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  isRangeInvalid: boolean;
}

export default function IndexFilter({
  startRange,
  endRange,
  maxWords,
  onStartChange,
  onEndChange,
  isRangeInvalid,
}: IndexFilterProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground font-medium">Show:</span>
      <Input
        type="number"
        min={1}
        max={maxWords}
        value={startRange}
        onChange={(e) => onStartChange(e.target.value)}
        placeholder="1"
        className={`w-16 h-8 text-center ${isRangeInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
      />
      <span className="text-muted-foreground">to</span>
      <Input
        type="number"
        min={1}
        max={maxWords}
        value={endRange}
        onChange={(e) => onEndChange(e.target.value)}
        placeholder={maxWords.toString()}
        className={`w-16 h-8 text-center ${isRangeInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
      />
      <span className="text-muted-foreground">of {maxWords}</span>
      
      {isRangeInvalid && (
        <span className="text-red-500 text-xs font-medium ml-2">
          Start must be less than End.
        </span>
      )}
    </div>
  );
}