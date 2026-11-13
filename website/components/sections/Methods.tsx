import { Reveal } from "@/components/motion/Reveal";
import { Accordion, AccordionList } from "@/components/ui/Accordion";
import { DataFunnel } from "@/components/ui/DataFunnel";
import { Block, Section, SectionHeader } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { methods } from "@/content/methods";
import styles from "./Methods.module.css";

/** 8. Methods & Limits: how we got the numbers and what they can't tell us. */
export function Methods() {
  const { funnel, how, challenges, limits } = methods;
  return (
    <Section id="methods" tone="surface" labelledBy="methods-title">
      <div className="container">
        <SectionHeader headingId="methods-title" heading={methods.heading} />

        <Reveal>
          <Block heading={funnel.heading}>
            <DataFunnel steps={funnel.steps} tracksLabel={funnel.tracksLabel} note={funnel.note} />
          </Block>
        </Reveal>

        <div className={styles.columns}>
          <Block heading={how.heading}>
            <AccordionList>
              {how.items.map((item) => (
                <Accordion key={item.title} title={item.title}>
                  <p>
                    <Text>{item.body}</Text>
                  </p>
                </Accordion>
              ))}
            </AccordionList>
          </Block>

          <div>
            <Block heading={challenges.heading}>
              <AccordionList>
                {challenges.items.map((item) => (
                  <Accordion key={item.title} title={item.title}>
                    {item.challenge && (
                      <p>
                        <Text>{item.challenge}</Text>
                      </p>
                    )}
                    <p>
                      <span className={styles.label}>{challenges.handledLabel}</span>{" "}
                      <Text>{item.handled}</Text>
                    </p>
                    <p>
                      <span className={styles.label}>{challenges.remainsLabel}</span>{" "}
                      <Text>{item.remains}</Text>
                    </p>
                  </Accordion>
                ))}
              </AccordionList>
            </Block>

            <Block heading={limits.heading}>
              <AccordionList>
                {limits.items.map((item) => (
                  <Accordion key={item.title} title={item.title}>
                    <p>
                      <Text>{item.body}</Text>
                    </p>
                  </Accordion>
                ))}
              </AccordionList>
            </Block>
          </div>
        </div>
      </div>
    </Section>
  );
}
