import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/Card";
import { Section, SectionHeader } from "@/components/ui/Section";
import { StatChip } from "@/components/ui/StatChip";
import { Text } from "@/components/ui/Text";
import { getDashboard } from "@/content/dashboards";
import { findings } from "@/content/findings";
import styles from "./KeyFindings.module.css";

/** 4. Key Findings: the answers before any dashboard, each linked to its evidence. */
export function KeyFindings() {
  return (
    <Section id="findings" tone="surface" labelledBy="findings-title">
      <div className="container">
        <SectionHeader
          headingId="findings-title"
          heading={findings.heading}
          intro={findings.intro}
        />
        <Reveal as="ul" group className={styles.grid} role="list">
          {findings.cards.map((finding) => (
            <li key={finding.text}>
              <Card as="article" className={styles.card}>
                <StatChip stat={finding.stat} />
                <p>
                  <Text>{finding.text}</Text>
                </p>
                {finding.setting && (
                  <p className={styles.setting}>
                    {findings.settingPrefix} <Text>{finding.setting}</Text>
                  </p>
                )}
                <a
                  className={styles.link}
                  href={`#${finding.link.dashboard}`}
                  data-dashboard={finding.link.dashboard}
                >
                  {finding.link.label}
                  <span className="sr-only">: {getDashboard(finding.link.dashboard).name}</span>
                </a>
              </Card>
            </li>
          ))}
        </Reveal>
        <p className={styles.conclusion}>
          <Text>{findings.conclusion}</Text>
        </p>
      </div>
    </Section>
  );
}
