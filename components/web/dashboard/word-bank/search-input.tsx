"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-9 pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}