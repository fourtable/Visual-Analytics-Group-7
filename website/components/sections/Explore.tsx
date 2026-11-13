import { Chapter } from "@/components/explore/Chapter";
import { ChapterStrip } from "@/components/explore/ChapterStrip";
import { DashboardBlock } from "@/components/explore/DashboardBlock";
import { FunFacts } from "@/components/explore/FunFacts";
import { QuadrantSplitBar } from "@/components/explore/QuadrantSplitBar";
import { Section, SectionHeader } from "@/components/ui/Section";
import { chapters, explore } from "@/content/chapters";
import { getDashboard } from "@/content/dashboards";

/** 5. Explore: five chapters, one per analysis task, each with its dashboards. */
export function Explore() {
  return (
    <Section id="explore" labelledBy="explore-title">
      <div className="container">
        <SectionHeader headingId="explore-title" heading={explore.heading} intro={explore.intro} />
      </div>
      <ChapterStrip
        chapters={chapters.map(({ id, number, short, heading }) => ({
          id,
          number,
          short,
          heading,
        }))}
        label={explore.stripLabel}
        compactTemplate={explore.compact}
      />
      {chapters.map((chapter) => (
        <Chapter
          key={chapter.id}
          chapter={chapter}
          extra={chapter.number === 1 ? <QuadrantSplitBar /> : undefined}
        >
          {chapter.number === 5 ? (
            <FunFacts />
          ) : (
            chapter.dashboards.map((id) => <DashboardBlock key={id} dashboard={getDashboard(id)} />)
          )}
        </Chapter>
      ))}
    </Section>
  );
}
