import { Text } from "@/components/ui/Text";
import { ui } from "@/content/site";
import type { Caption } from "@/content/types";
import { cx } from "@/lib/cx";
import styles from "./CaptionBlock.module.css";

/**
 * Under each dashboard: What this shows / Key insight / Why it matters, with the
 * "Try this" tip under Key insight (under What this shows when there is no insight).
 * Three columns on desktop, stacked on phones. The skip link lands here.
 */
export function CaptionBlock({ id, caption }: { id: string; caption: Caption }) {
  const tip = (
    <p className={styles.tip}>
      <span className={styles.tipLabel}>{ui.caption.tip}</span> <Text>{caption.tip}</Text>
    </p>
  );
  return (
    <div id={id} tabIndex={-1} className={cx(styles.caption, !caption.insight && styles.two)}>
      <div className={styles.part}>
        <h4 className={styles.label}>{ui.caption.shows}</h4>
        <p>
          <Text>{caption.shows}</Text>
        </p>
        {!caption.insight && tip}
      </div>
      {caption.insight && (
        <div className={styles.part}>
          <h4 className={styles.label}>{ui.caption.insight}</h4>
          <p>
            <Text>{caption.insight}</Text>
          </p>
          {tip}
        </div>
      )}
      <div className={styles.part}>
        <h4 className={styles.label}>{ui.caption.why}</h4>
        <p>
          <Text>{caption.why}</Text>
        </p>
      </div>
    </div>
  );
}
