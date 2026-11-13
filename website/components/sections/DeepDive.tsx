import { Reveal } from "@/components/motion/Reveal";
import { Accordion, AccordionList } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { QuadrantChip } from "@/components/ui/QuadrantChip";
import { Block, Section, SectionHeader } from "@/components/ui/Section";
import { StatChip } from "@/components/ui/StatChip";
import { Text } from "@/components/ui/Text";
import { deepDive } from "@/content/deepDive";
import styles from "./DeepDive.module.css";

/** 6. Deep Dive (site only): song spotlights and patterns that cut across chapters. */
export function DeepDive() {
  const { spotlights, patterns } = deepDive;
  return (
    <Section id="deep-dive" tone="surface" labelledBy="deep-dive-title">
      <div className="container">
        <SectionHeader
          headingId="deep-dive-title"
          heading={deepDive.heading}
          intro={deepDive.intro}
        />

        <Block heading={spotlights.heading}>
          <Reveal as="ul" group className={styles.spotlights} role="list">
            {spotlights.cards.map((card) => (
              <li key={card.title}>
                <Card as="article">
                  <QuadrantChip quadrant={card.quadrant} />
                  <h4 className={styles.title}>{card.title}</h4>
                  <p className={styles.song}>
                    <Text>{card.song}</Text> <span className={styles.by}>{spotlights.byLabel}</span>{" "}
                    <Text>{card.artist}</Text>
                  </p>
                  <div className={styles.stats}>
                    <StatChip
                      size="md"
                      stat={{ value: card.streams, label: spotlights.labels.streams }}
                    />
                    <StatChip
                      size="md"
                      stat={{ value: card.views, label: spotlights.labels.views }}
                    />
                  </div>
                  <dl className={styles.facts}>
                    <div>
                      <dt>{spotlights.labels.year}</dt>
                      <dd>
                        <Text>{card.year}</Text>
                      </dd>
                    </div>
                    <div>
                      <dt>{spotlights.labels.features}</dt>
                      <dd>
                        <Text>{card.features}</Text>
                      </dd>
                    </div>
                  </dl>
                  <p>
                    <Text>{card.insight}</Text>
                  </p>
                  <p className={styles.where}>
                    <Text>{card.where}</Text>
                  </p>
                  <a
                    className={styles.link}
                    href={`#${spotlights.link.dashboard}`}
                    data-dashboard={spotlights.link.dashboard}
                  >
                    {spotlights.link.label}
                    <span className="sr-only">: {card.title}</span>
                  </a>
                </Card>
              </li>
            ))}
          </Reveal>
        </Block>

        <Block heading={patterns.heading}>
          <AccordionList>
            {patterns.items.map((pattern) => (
              <Accordion
                key={pattern.title}
                title={pattern.title}
                meta={`${patterns.drawsOnPrefix} ${pattern.drawsOn}`}
              >
                <p>
                  <Text>{pattern.body}</Text>
                </p>
              </Accordion>
            ))}
          </AccordionList>
        </Block>
      </div>
    </Section>
  );
}
