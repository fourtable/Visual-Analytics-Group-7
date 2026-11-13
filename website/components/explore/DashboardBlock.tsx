import type { Dashboard } from "@/content/dashboards";
import { ui } from "@/content/site";
import { cx } from "@/lib/cx";
import { CaptionBlock } from "./CaptionBlock";
import { TableauEmbed } from "./TableauEmbed";
import styles from "./DashboardBlock.module.css";

/**
 * One dashboard, in the plan's order: h3 with its own anchor, a skip link (visible on
 * keyboard focus), the embed bar and embed (full width), then the caption block.
 * Nothing in a dashboard block animates (Build Plan › Motion › Hands off the dashboards).
 */
export function DashboardBlock({ dashboard }: { dashboard: Dashboard }) {
  const captionId = `${dashboard.id}-caption`;
  return (
    <section id={dashboard.id} aria-labelledby={`${dashboard.id}-title`} className={styles.block}>
      <div className={cx("container", "container-wide")}>
        <h3 id={`${dashboard.id}-title`} className={styles.heading}>
          {dashboard.heading}
        </h3>
        <a className={styles.skip} href={`#${captionId}`}>
          {ui.embed.skip}
        </a>
        <TableauEmbed
          id={dashboard.id}
          name={dashboard.name}
          src={dashboard.src}
          width={dashboard.width}
          height={dashboard.height}
          fallback={dashboard.fallback}
          fallbackAlt={dashboard.fallbackAlt}
          labels={{
            fullScreen: ui.embed.fullScreen,
            exitFullScreen: ui.embed.exitFullScreen,
            openInteractive: ui.embed.openInteractive,
            close: ui.embed.close,
            rotateHint: ui.embed.rotateHint,
            loading: ui.embed.loading,
            error: ui.embed.error,
            tryAgain: ui.embed.tryAgain,
            frameLabel: ui.embed.frameLabel,
          }}
        />
        <CaptionBlock id={captionId} caption={dashboard.caption} />
      </div>
    </section>
  );
}
