import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";

interface DescriptionRendererProps {
  content: string;
}

type Block = {
  type: "title" | "text" | "code";
  content: string;
};

// 👈 Helper function to strip leading spaces from multi-line strings.
// This ignores lines that are completely empty.
const dedent = (str: string) => {
  const lines = str.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");
  if (nonEmptyLines.length === 0) return str;

  // Find how many spaces the least-indented line has
  const minIndent = Math.min(
    ...nonEmptyLines.map((line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    })
  );

  // Remove that exact amount of spaces from every line
  return lines
    .map((line) => line.slice(minIndent))
    .join("\n")
    .trim();
};

export function DescriptionRenderer({ content }: DescriptionRendererProps) {
  const parseBlocks = (text: string): Block[] => {
    const blocks: Block[] = [];
    let i = 0;

    while (i < text.length) {
      while (i < text.length && /\s/.test(text[i])) i++;
      if (i >= text.length) break;

      // 1. Code Block
      if (text[i] === "{") {
        let braceCount = 1;
        let j = i + 1;
        while (j < text.length && braceCount > 0) {
          if (text[j] === "{") braceCount++;
          if (text[j] === "}") braceCount--;
          j++;
        }
        const rawCode = text.slice(i + 1, j - 1);
        // 👈 Apply the dedent here so the code is always flush left
        const cleanCode = dedent(rawCode);
        blocks.push({ type: "code", content: cleanCode });
        i = j;
        continue;
      }

      // 2. Title Block
      if (text[i] === "*") {
        const j = text.indexOf("*", i + 1);
        if (j !== -1) {
          blocks.push({ type: "title", content: text.slice(i + 1, j).trim() });
          i = j + 1;
          continue;
        }
      }

      // 3. Text Block
      if (text[i] === "[") {
        const j = text.indexOf("]", i + 1);
        if (j !== -1) {
          blocks.push({ type: "text", content: text.slice(i + 1, j).trim() });
          i = j + 1;
          continue;
        }
      }

      // 4. Fallback
      let j = i;
      while (j < text.length && text[j] !== "*" && text[j] !== "[" && text[j] !== "{") {
        j++;
      }
      const rawText = text.slice(i, j).trim();
      if (rawText) {
        blocks.push({ type: "text", content: rawText });
      }
      i = j;
    }

    return blocks;
  };

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4 text-muted-foreground leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === "title") {
          return (
            <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-2">
              {block.content}
            </h3>
          );
        }

        if (block.type === "code") {
          return (
            <CodeBlock key={index}>
              <CodeBlockHeader>
                <CodeBlockTitle>json</CodeBlockTitle>
                <CodeBlockCopyButton value={block.content} />
              </CodeBlockHeader>
              <CodeBlockContent>{block.content}</CodeBlockContent>
            </CodeBlock>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}