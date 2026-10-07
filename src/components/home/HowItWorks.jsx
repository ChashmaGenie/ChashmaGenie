import { ClipboardList, Glasses, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

const STEPS = [
  { title: "Pick a frame", body: "Browse eyeglasses, sunglasses and kids frames. Filter by shape, size, colour or face shape.", Icon: Glasses },
  { title: "Add your prescription", body: "Type in your prescription or send it later. Not sure about lenses? We will suggest the right ones.", Icon: ClipboardList },
  { title: "Get your quote", body: "We check your details and send your quote on WhatsApp or email. You confirm before anything is made.", Icon: MessageCircle },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-24 bg-ink-900 py-10 text-cream-100 on-dark md:py-16">
      <Container>
        <div className="mb-8">
          <p className="label-caps mb-2 text-gold-400">Simple and personal</p>
          <h2 id="how-title" className="text-2xl !text-cream-100 md:text-4xl">How it works</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ title, body, Icon }, index) => (
            <li key={title} className="flex flex-col gap-3 rounded-xl border border-cream-100/20 p-5">
              <span className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-400 text-ink-800">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="label-caps text-gold-400">Step {index + 1}</span>
              </span>
              <h3 className="text-xl font-semibold !text-cream-100">{title}</h3>
              <p className="text-cream-100/85">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Button to="/quote" size="lg">Start a quote</Button>
        </div>
      </Container>
    </section>
  );
}
