import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Text } from "./Text";
import styles from "./Card.module.css";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "li";
  children: ReactNode;
};

/** White card, 1 px border, 12 px corners, 24 px padding; lifts 2 px on hover. */
export function Card({ as = "div", className, children, ...rest }: Props) {
  const Element = as as "div";
  return (
    <Element className={cx(styles.card, className)} {...rest}>
      {children}
    </Element>
  );
}

/** The common case: a card with an h3 title and one paragraph of content copy. */
export function TextCard({
  title,
  body,
  as,
  headingLevel = 3,
}: {
  title: string;
  body: string;
  as?: Props["as"];
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return (
    <Card as={as}>
      <Heading className={styles.title}>
        <Text>{title}</Text>
      </Heading>
      <p className={styles.body}>
        <Text>{body}</Text>
      </p>
    </Card>
  );
}
