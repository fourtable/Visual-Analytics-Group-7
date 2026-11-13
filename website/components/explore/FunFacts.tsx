import { Reveal } from "@/components/motion/Reveal";
import { Chevron } from "@/components/ui/Accordion";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatChip } from "@/components/ui/StatChip";
import { Text } from "@/components/ui/Text";
import { funFacts } from "@/content/chapters";
import { getDashboard } from "@/content/dashboards";
import { cx } from "@/lib/cx";
import { DashboardBlock } from "./DashboardBlock";
import styles from "./FunFacts.module.css";

/**
 * Chapter 5: three "Did you know?" cards, then See the chart, which expands the
 * Flags by Quadrant sheet. The embed only starts loading once the panel is open
 * (closed <details> content is never on screen, so the lazy loader waits).
 */
export function FunFacts() {
  return (
    <>
      <div className="container">
        <Reveal as="ul" group className={styles.cards} role="list">
          {funFacts.cards.map((card) => (
            <li key={card.title}>
              <Card as="article">
                <p className={styles.kicker}>{funFacts.kicker}</p>
                <h3 className={styles.title}>
                  <Text>{card.title}</Text>
                </h3>
                <p>
                  <Text>{card.body}</Text>
                </p>
                <StatChip className={styles.stat} stat={card.stat} size="md" />
              </Card>
            </li>
          ))}
        </Reveal>
      </div>
      <details className={styles.chart}>
        <summary className={cx(buttonClass("secondary"), styles.summary)}>
          <span className={styles.closedLabel}>{funFacts.toggle}</span>
          <span className={styles.openLabel}>{funFacts.toggleOpen}</span>
          <Chevron className={styles.chevron} />
        </summary>
        <DashboardBlock dashboard={getDashboard("dash-flags")} />
      </details>
    </>
  );
}
