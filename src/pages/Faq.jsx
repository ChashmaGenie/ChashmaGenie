import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Seo } from "@/components/layout/Seo.jsx";
import { Accordion, AccordionItem } from "@/components/ui/Accordion.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { faqGroups, faqJsonLd } from "@/components/home/faqContent.js";
import { useHashScroll } from "@/components/home/useHashScroll.js";

function FaqGroup({ group, openByDefault }) {
  return (
    <section id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-24">
      <h2 id={`${group.id}-title`} className="mb-2 text-2xl">{group.title}</h2>
      <Accordion>
        {group.items.map((item, index) => (
          <AccordionItem key={item.question} title={item.question} defaultOpen={openByDefault && index === 0}>
            <div className="prose-lite text-ink-600">
              {item.answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default function Faq() {
  const settings = useSettings();
  const { hash } = useLocation();
  useHashScroll();
  const groups = useMemo(() => faqGroups(settings), [settings]);
  const jsonLd = useMemo(() => faqJsonLd(groups), [groups]);
  return (
    <Container className="py-10 md:py-16">
      <Seo
        title="FAQ"
        description="Answers about prescriptions, pupil distance, lenses, delivery, payment and returns at ChashmaGenie."
        jsonLd={jsonLd}
      />
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl">Frequently asked questions</h1>
        <p className="mt-4 text-lg text-ink-600">Plain answers about prescriptions, lenses, delivery and returns.</p>
        <nav aria-label="FAQ topics" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <li key={group.id}>
                <a href={`#${group.id}`} className="focus-ring inline-flex min-h-[44px] items-center rounded-full border border-ink-300 bg-cream-50 px-4 text-sm font-medium hover:bg-ink-100">
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10 flex flex-col gap-10">
          {groups.map((group) => (
            <FaqGroup key={group.id} group={group} openByDefault={hash === `#${group.id}`} />
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-ink-200 bg-cream-50 p-6">
          <h2 className="text-2xl">Still have a question?</h2>
          <p className="mt-2 text-ink-600">Send us a message and we will help you choose.</p>
          <Button to="/contact" className="mt-4">Contact us</Button>
        </div>
      </div>
    </Container>
  );
}
