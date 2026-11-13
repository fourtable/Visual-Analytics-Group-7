import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { StoryLinks } from "@/components/layout/StoryLinks";
import { DeepDive } from "@/components/sections/DeepDive";
import { Explore } from "@/components/sections/Explore";
import { Hero } from "@/components/sections/Hero";
import { HowToRead } from "@/components/sections/HowToRead";
import { KeyFindings } from "@/components/sections/KeyFindings";
import { Methods } from "@/components/sections/Methods";
import { Problem } from "@/components/sections/Problem";
import { SoWhat } from "@/components/sections/SoWhat";
import { sections, site, ui } from "@/content/site";

/** The one page: eight sections in the report's order, plus nav and footer. */
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        {ui.skipToContent}
      </a>
      <Nav
        siteName={site.name}
        sections={sections}
        labels={{ navLabel: ui.navLabel, menuOpen: ui.menuOpen, menuClose: ui.menuClose }}
      />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Problem />
        <HowToRead />
        <KeyFindings />
        <Explore />
        <DeepDive />
        <SoWhat />
        <Methods />
      </main>
      <Footer />
      <BackToTop label={ui.backToTop} hideWithin="explore" />
      <StoryLinks />
    </>
  );
}
