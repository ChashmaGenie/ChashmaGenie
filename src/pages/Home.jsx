import { Seo } from "@/components/layout/Seo.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { Hero } from "@/components/home/Hero.jsx";
import { ShopByShape } from "@/components/home/ShopByShape.jsx";
import { ShopByUse } from "@/components/home/ShopByUse.jsx";
import { Bestsellers } from "@/components/home/Bestsellers.jsx";
import { HowItWorks } from "@/components/home/HowItWorks.jsx";
import { FaceShapeFinder } from "@/components/home/FaceShapeFinder.jsx";
import { FollowSection } from "@/components/home/FollowSection.jsx";
import { TrustStrip } from "@/components/home/TrustStrip.jsx";
import { NotifyBlock } from "@/components/home/NotifyBlock.jsx";

export default function Home() {
  const { businessName, tagline } = useSettings();
  return (
    <>
      <Seo
        title={`${businessName} | ${tagline}`}
        rawTitle
        description="Shop eyeglasses, sunglasses and prescription lenses online in Pakistan. Pick your frame, add your prescription and get a quote from ChashmaGenie."
        path="/"
      />
      <Hero />
      <ShopByShape />
      <ShopByUse />
      <Bestsellers />
      <HowItWorks />
      <FaceShapeFinder />
      <FollowSection />
      <TrustStrip />
      <NotifyBlock />
    </>
  );
}
