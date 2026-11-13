import { CountUp } from "@/components/motion/CountUp";
import { GrowBar } from "@/components/motion/GrowBar";
import type { FunnelStep } from "@/content/methods";
import { Text } from "./Text";
import styles from "./DataFunnel.module.css";

/**
 * Four bars in --both, each as long as its track count against the first, with the
 * count and label beside each. Motion row 12: they shrink step by step.
 */
export function DataFunnel({
  steps,
  tracksLabel,
  note,
}: {
  steps: FunnelStep[];
  tracksLabel: string;
  note: string;
}) {
  const first = steps[0]?.count ?? 1;
  return (
    <div>
      <ol className={styles.steps} role="list">
        {steps.map((step, i) => (
          <li key={step.label} className={styles.step}>
            <div className={styles.meta}>
              <p className={styles.label}>{step.label}</p>
              <p className={styles.note}>
                <Text>{step.note}</Text>
              </p>
            </div>
            <GrowBar
              className={styles.bar}
              value={step.count / first}
              mode="shrink"
              delay={i * 150}
              duration={500}
              color="var(--both)"
            />
            <p className={styles.count}>
              <CountUp value={step.display} /> <span className={styles.unit}>{tracksLabel}</span>
            </p>
          </li>
        ))}
      </ol>
      <p className={styles.footnote}>
        <Text>{note}</Text>
      </p>
    </div>
  );
}
