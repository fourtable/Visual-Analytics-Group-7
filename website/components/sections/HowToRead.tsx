import { Reveal } from "@/components/motion/Reveal";
import { Card, TextCard } from "@/components/ui/Card";
import { QuadrantChip } from "@/components/ui/QuadrantChip";
import { QuadrantMotif } from "@/components/ui/QuadrantMotif";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { howToRead } from "@/content/howToRead";
import { quadrantOrder } from "@/content/quadrants";
import { hero, ui } from "@/content/site";
import styles from "./HowToRead.module.css";

/** 3. How to read our charts: the terms the dashboards use, defined once. Not in the nav. */
export function HowToRead() {
  const { quadrants, glossary } = howToRead;
  return (
    <Section id="how-to-read" labelledBy="how-to-read-title">
      <div className="container">
        <SectionHeader
          headingId="how-to-read-title"
          heading={howToRead.heading}
          intro={howToRead.intro}
        />
        <div className={styles.layout}>
          <div className={styles.quadrants}>
            <h3 className={styles.subheading}>{quadrants.heading}</h3>
            <Reveal as="ul" group className={styles.quadGrid} role="list">
              {quadrantOrder.map((q) => (
                <li key={q} data-qcard={q}>
                  <Card>
                    <QuadrantChip quadrant={q} />
                    <p>
                      <Text>{quadrants.definitions[q]}</Text>
                    </p>
                  </Card>
                </li>
              ))}
            </Reveal>
            <div className={styles.motifRow}>
              <QuadrantMotif
                variant="compact"
                label={hero.motif.label}
                xAxis={hero.motif.xAxis}
                yAxis={hero.motif.yAxis}
              />
            </div>
            <p className={styles.note}>
              <Text>{quadrants.note}</Text>
            </p>
            <p className={`raw-line ${styles.raw}`}>
              {ui.rawPrefix} <Text>{quadrants.rawNote}</Text>
            </p>
          </div>
          <div>
            <h3 className={styles.subheading}>{glossary.heading}</h3>
            <ul className={styles.glossGrid} role="list">
              {glossary.terms.map((term) => (
                <li key={term.title}>
                  <TextCard title={term.title} body={term.body} headingLevel={4} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
