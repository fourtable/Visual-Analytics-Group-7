import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";
import { explore, type Chapter as ChapterContent } from "@/content/chapters";
import { fill } from "@/lib/text";
import styles from "./Chapter.module.css";

/**
 * A chapter opens with its number, its question as the heading and one intro line,
 * then `intro` extras (e.g. the split bar) and its dashboard blocks (`children`).
 */
export function Chapter({
  chapter,
  extra,
  children,
}: {
  chapter: ChapterContent;
  extra?: ReactNode;
  children: ReactNode;
}) {
  const titleId = `${chapter.id}-title`;
  return (
    <section id={chapter.id} aria-labelledby={titleId} className={styles.chapter}>
      <div className="container">
        <p className={styles.kicker}>{fill(explore.chapterLabel, { n: chapter.number })}</p>
        <h2 id={titleId} className={styles.heading}>
          <Text>{chapter.heading}</Text>
        </h2>
        <p className={styles.intro}>
          <Text>{chapter.intro}</Text>
        </p>
        {extra}
      </div>
      {children}
    </section>
  );
}
