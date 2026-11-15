import { GrowBar } from "@/components/motion/GrowBar";
import { Reveal } from "@/components/motion/Reveal";
import { Card, TextCard } from "@/components/ui/Card";
import { Block, Section, SectionHeader } from "@/components/ui/Section";
import { StatChip } from "@/components/ui/StatChip";
import { Text } from "@/components/ui/Text";
import { problem } from "@/content/problem";
import styles from "./Problem.module.css";

/** 2. Problem: why the question matters, what's missing today, and what we asked. */
export function Problem() {
  const { background, why, gap, question } = problem;
  return (
    <Section id="problem" tone="surface" labelledBy="problem-title">
      <div className="container">
        <SectionHeader headingId="problem-title" heading={problem.heading} />

        <Block heading={background.heading}>
          <div className={styles.background}>
            <Reveal>
              <p className={styles.lead}>
                <Text>{background.text}</Text>
              </p>
            </Reveal>
            <Reveal as="ul" group className={styles.stats} role="list">
              {background.stats.map((stat, i) => (
                <li key={stat.label}>
                  <Card>
                    <StatChip stat={stat} />
                    {i === background.stats.length - 1 && (
                      <div className={styles.listening}>
                        {background.listening.map((bar) => (
                          <div key={bar.label} className={styles.listeningRow}>
                            <span>{bar.label}</span>
                            <GrowBar className={styles.track} value={bar.value} />
                            <span className={styles.listeningValue}>{bar.display}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </Reveal>
          </div>
        </Block>

        <Block heading={why.heading}>
          <div className={styles.grid2}>
            {why.cards.map((card) => (
              <TextCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                body={card.body}
                headingLevel={4}
              />
            ))}
          </div>
        </Block>

        <Block heading={gap.heading}>
          <div className={styles.grid3}>
            {gap.cards.map((card) => (
              <TextCard key={card.title} title={card.title} body={card.body} headingLevel={4} />
            ))}
          </div>
          <p className={styles.gapLine}>
            <Text>{gap.line}</Text>
          </p>
        </Block>

        <Block heading={question.heading}>
          <div className={styles.question}>
            <p className={styles.questionText}>
              <Text>{question.text}</Text>
            </p>
            <ol className={styles.objectives}>
              {question.objectives.map((objective) => (
                <li key={objective}>
                  <Text>{objective}</Text>
                </li>
              ))}
            </ol>
          </div>
        </Block>
      </div>
    </Section>
  );
}
