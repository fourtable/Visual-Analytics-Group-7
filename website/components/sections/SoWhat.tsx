import { Reveal } from "@/components/motion/Reveal";
import { TextCard } from "@/components/ui/Card";
import { Block, Section, SectionHeader } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { soWhat } from "@/content/soWhat";
import styles from "./SoWhat.module.css";

/** 7. So what? The answer, what it means, and what we'd do next. */
export function SoWhat() {
  return (
    <Section id="so-what" labelledBy="so-what-title">
      <div className="container">
        <SectionHeader headingId="so-what-title" heading={soWhat.heading} />
        <Reveal className={styles.lead}>
          <p className={styles.conclusion}>
            <Text>{soWhat.conclusion}</Text>
          </p>
        </Reveal>
        <Block heading={soWhat.implications.heading}>
          <div className={styles.grid2}>
            {soWhat.implications.cards.map((card) => (
              <TextCard key={card.title} title={card.title} body={card.body} headingLevel={4} />
            ))}
          </div>
        </Block>
        <Block heading={soWhat.futureWork.heading}>
          <ol className={styles.future}>
            {soWhat.futureWork.items.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ol>
        </Block>
      </div>
    </Section>
  );
}
