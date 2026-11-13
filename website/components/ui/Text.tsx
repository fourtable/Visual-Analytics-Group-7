import { parseInline } from "@/lib/text";
import { Placeholder } from "./Placeholder";

/** Renders a content string: [placeholder], **bold** and *italic* (see content/types.ts). */
export function Text({ children }: { children: string }) {
  return (
    <>
      {parseInline(children).map((token, i) => {
        switch (token.kind) {
          case "placeholder":
            return <Placeholder key={i}>{token.text}</Placeholder>;
          case "strong":
            return <strong key={i}>{token.text}</strong>;
          case "em":
            return <em key={i}>{token.text}</em>;
          default:
            return token.text;
        }
      })}
    </>
  );
}
