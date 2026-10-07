import { Container } from "@/components/ui/Container.jsx";
import { FollowCards } from "@/components/social/FollowCards.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { socialChannels } from "@/components/social/socialChannels.js";
import { SectionHeading } from "./SectionHeading.jsx";
import { ShopTheLook } from "./ShopTheLook.jsx";

export function FollowSection() {
  const settings = useSettings();
  const hasSocials = socialChannels(settings, "home").length > 0;
  return (
    <section aria-labelledby="follow-title" className="bg-cream-200 py-10 md:py-16">
      <Container>
        <SectionHeading id="follow-title" eyebrow="Join the community" title="Follow ChashmaGenie" />
        {hasSocials ? <FollowCards medium="home" /> : null}
        <ShopTheLook />
      </Container>
    </section>
  );
}
