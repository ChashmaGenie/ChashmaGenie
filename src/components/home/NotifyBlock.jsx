import { useSettings } from "@/lib/settings.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { NotifyForm } from "@/components/social/NotifyForm.jsx";

export function NotifyBlock() {
  const { comingSoonEnabled } = useSettings();
  if (!comingSoonEnabled) return null;
  return (
    <section aria-labelledby="notify-title" className="py-10 md:py-16">
      <Container>
        <div className="grid items-center gap-6 rounded-2xl border border-ink-200 bg-cream-50 p-6 md:grid-cols-2 md:p-10">
          <div>
            <p className="label-caps mb-2 text-teal-600">Our store is on its way</p>
            <h2 id="notify-title" className="text-2xl md:text-4xl">Store opening soon</h2>
            <p className="mt-3 text-ink-600">
              Tell us where to reach you and we will let you know the day the doors open. We will only message you about the store.
            </p>
          </div>
          <NotifyForm id="home-notify-contact" />
        </div>
      </Container>
    </section>
  );
}
