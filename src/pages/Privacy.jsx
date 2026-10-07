import { Seo } from "@/components/layout/Seo.jsx";
import { PolicySection, StaticPage } from "@/components/home/StaticPage.jsx";
import { useHashScroll } from "@/components/home/useHashScroll.js";
import { useSettings } from "@/lib/settings.jsx";

export default function Privacy() {
  const { businessName, businessEmail } = useSettings();
  useHashScroll();
  const contact = businessEmail ? <a href={`mailto:${businessEmail}`}>{businessEmail}</a> : "our contact page";
  return (
    <>
      <Seo title="Privacy policy" description="How ChashmaGenie handles your quote requests, prescription details, contact information and analytics." />
      <StaticPage title="Privacy policy" intro={`How ${businessName} handles the information you share with us. Last updated October 2026.`}>
        <div className="flex flex-col gap-10">
          <PolicySection id="collect" title="What we collect">
            <ul>
              <li>Quote requests: the frames and lenses you choose, how you will use your glasses, and your prescription values if you enter them.</li>
              <li>Contact details: your name, mobile number, city, preferred way to be contacted, optional email and notes.</li>
              <li>Store updates: the email or mobile number you leave to hear when our store opens.</li>
              <li>Where you came from: the campaign or site that brought you here, such as Instagram, so we know which posts help.</li>
            </ul>
            <p>We do not collect payment card details. We do not ask you to create an account.</p>
          </PolicySection>
          <PolicySection id="use" title="How we use it">
            <p>
              Your prescription and contact details are used only to prepare and confirm your quote and to contact you about it. Store
              update contacts are used only to tell you about the store opening. We do not sell or share your information for marketing.
            </p>
          </PolicySection>
          <PolicySection id="retention" title="How long we keep it">
            <p>
              Quote requests, including prescription details, are stored on our server for up to 180 days and then deleted automatically.
              You can ask us to delete your information sooner at any time.
            </p>
          </PolicySection>
          <PolicySection id="sharing" title="Who can see it">
            <p>
              Only the shop owner can view quote requests. Our website is hosted on Cloudflare, which processes data on our behalf to
              serve the site. If you contact us on WhatsApp, WhatsApp&apos;s own privacy terms apply to that conversation.
            </p>
            <p>Your prescription and contact details are never sent to analytics tools or advertising pixels.</p>
          </PolicySection>
          <PolicySection id="analytics" title="Cookies and analytics">
            <ul>
              <li>Your browser storage keeps your saved items, quote basket and the source that brought you here. This stays on your device.</li>
              <li>If enabled, Cloudflare Web Analytics measures page visits without cookies or personal profiles.</li>
              <li>If enabled, a Meta Pixel measures visits from Instagram and Facebook. It loads only after you choose Accept on our cookie notice, and you can decline.</li>
            </ul>
          </PolicySection>
          <PolicySection id="rights" title="Your choices">
            <p>
              To see, correct or delete your information, email {contact}. Include your quote reference if you have one. Quotes are
              estimates for convenience and are not medical advice, an eye examination or a prescription.
            </p>
          </PolicySection>
          <PolicySection id="changes" title="Changes">
            <p>If we change this policy we will update the date at the top of this page.</p>
          </PolicySection>
        </div>
      </StaticPage>
    </>
  );
}
