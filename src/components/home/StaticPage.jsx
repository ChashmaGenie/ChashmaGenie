import { Container } from "@/components/ui/Container.jsx";

export function StaticPage({ title, intro, children, width = "max-w-3xl" }) {
  return (
    <Container className="py-10 md:py-16">
      <div className={width}>
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {intro ? <p className="mt-4 text-lg text-ink-600">{intro}</p> : null}
        <div className="prose-lite mt-8">{children}</div>
      </div>
    </Container>
  );
}

export function PolicySection({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="scroll-mt-24">
      <h2 id={id ? `${id}-title` : undefined} className="text-2xl">{title}</h2>
      <div className="prose-lite mt-3">{children}</div>
    </section>
  );
}
