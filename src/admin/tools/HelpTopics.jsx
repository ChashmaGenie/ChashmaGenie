import { Accordion, AccordionItem } from "@/components/ui/Accordion.jsx";

const TOPICS = [
  {
    title: "How do I add a new product?",
    body: (
      <ol className="list-decimal space-y-1 ps-6">
        <li>Open Products and tap Add new product.</li>
        <li>Add photos with Take photo or Choose from gallery.</li>
        <li>Fill in the name, type, price and style details.</li>
        <li>Tap Save. It appears on the shop within about 5 minutes.</li>
      </ol>
    ),
  },
  {
    title: "How do I take good photos?",
    body: (
      <ul className="list-disc space-y-1 ps-6">
        <li>Use a plain white or cream background.</li>
        <li>Stand near a window. Soft daylight works best.</li>
        <li>Show the front first, then the side view.</li>
        <li>Hold the phone steady and wipe the lenses clean.</li>
      </ul>
    ),
  },
  {
    title: "How do quote requests work?",
    body: (
      <p>
        A customer picks a frame, adds their eye numbers and sends a request. It appears in Quotes with a New tag. Tap Reply on WhatsApp to send them a price, then change the status to Contacted, Quoted, Won or Lost so you always know where each customer is.
      </p>
    ),
  },
  {
    title: "How long until changes show on the shop?",
    body: <p>Usually within 5 minutes. Customers who already have the shop open may need to refresh the page.</p>,
  },
  {
    title: "What are sample products?",
    body: <p>Sample products show you how the shop looks. Delete them anytime with Delete sample products on this page. Products you add yourself are never touched.</p>,
  },
  {
    title: "I forgot my password",
    body: (
      <p>
        The admin password is stored as a secret called ADMIN_PASSWORD in your Cloudflare Pages project. Open the project in the Cloudflare dashboard, go to Settings, then Variables and Secrets, and change ADMIN_PASSWORD. After the next deploy the new password works.
      </p>
    ),
  },
];

export function HelpTopics() {
  return (
    <Accordion>
      {TOPICS.map((topic) => (
        <AccordionItem key={topic.title} title={topic.title}>
          <div className="text-base text-ink-800">{topic.body}</div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
