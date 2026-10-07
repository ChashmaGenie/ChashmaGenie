import { Link } from "react-router-dom";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { useSettings } from "@/lib/settings.jsx";
import mascot from "@/components/home/genie-mascot.webp";

const VALUES = [
  { title: "Honest quotes", body: "You see exactly what you asked for. We confirm the frame, lenses and price with you before anything is made." },
  { title: "Made around you", body: "Your prescription, your face, your budget. We help you choose lenses that suit how you actually use your glasses." },
  { title: "Style without the fuss", body: "A carefully chosen range of frames for every face and every day, from reading glasses to weekend sunglasses." },
];

export default function About() {
  const { businessName, tagline } = useSettings();
  return (
    <>
      <Seo title="About us" description={`${businessName} is an online eyewear store in Pakistan. ${tagline}. Our physical store is coming soon.`} />
      <Container className="grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="label-caps text-teal-600">About {businessName}</p>
          <h1 className="text-3xl md:text-5xl">Every good pair starts with a wish.</h1>
          <p className="text-lg text-ink-600">
            Seeing clearly is something most of us wish for without thinking about it. {businessName} grants that wish with frames you
            will love and lenses made for your eyes, and we have started online so you can shop from wherever you are.
          </p>
          <p className="text-ink-600">
            Pick a frame, tell us your prescription, and we send you a quote. We check every detail with you first, so there are no
            surprises. Our physical store is coming soon. Until then, we are only a message away.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button to="/shop">Shop frames</Button>
            <Button to="/quote" variant="secondary">Start a quote</Button>
          </div>
        </div>
        <img
          src={mascot}
          alt="The ChashmaGenie mascot, a friendly genie in gold-framed sunglasses"
          width="560"
          height="819"
          loading="lazy"
          className="mx-auto h-auto w-full max-w-[300px] rounded-[28px] bg-sky-500"
        />
      </Container>
      <section aria-labelledby="values-title" className="bg-cream-200 py-10 md:py-16">
        <Container>
          <h2 id="values-title" className="mb-6 text-2xl md:text-4xl">What we stand for</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {VALUES.map(({ title, body }) => (
              <li key={title} className="rounded-xl border border-ink-200 bg-cream-50 p-5">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-ink-600">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-ink-600">
            Questions? Read the <Link to="/faq" className="font-semibold text-sky-700 underline">FAQ</Link> or{" "}
            <Link to="/contact" className="font-semibold text-sky-700 underline">get in touch</Link>.
          </p>
        </Container>
      </section>
    </>
  );
}
