const RETURNS_DEFAULT =
  "Because prescription lenses are made specially for you, we confirm every detail with you before we order them. Return and exchange terms for your order are shared with your quote.";

const DELIVERY_FALLBACK = "Delivery charges and time are confirmed with your quote.";
const COD_FALLBACK = "We confirm the payment options with you when we confirm your quote.";

const nonEmpty = (text, fallback) => (text && text.trim() ? text.trim() : fallback);

const GENERAL = {
  id: "general",
  title: "Ordering",
  items: [
    {
      question: "How does ordering work?",
      answer: [
        "Choose a frame, tell us how you will use your glasses, add your prescription and your contact details, and send us your quote request. We check everything and reply on WhatsApp or email with the final price. You only confirm once you are happy.",
      ],
    },
    {
      question: "Do I pay when I send a quote request?",
      answer: ["No. Sending a quote request is free and does not commit you to anything. Prices are confirmed by us before any order is made."],
    },
    {
      question: "Do you have a physical store?",
      answer: ["Not yet. We are online only for now and our physical store is coming soon. You can leave your email or mobile number on our home page to hear when it opens."],
    },
  ],
};

const prescriptionGroup = {
  id: "prescription",
  title: "Prescription",
  items: [
    {
      question: "Where do I find my prescription?",
      answer: [
        "Your optometrist or eye hospital gives you a prescription slip after an eye test. It lists values for the right eye (OD) and the left eye (OS): SPH (sphere), CYL (cylinder), AXIS and sometimes ADD for reading or progressive lenses.",
        "Enter the numbers exactly as written and check that the plus and minus signs match.",
      ],
    },
    {
      question: "Can I send my prescription later?",
      answer: ["Yes. Choose \"I will send it later\" in the quote form, then share a photo of your prescription with us on WhatsApp or email."],
    },
    {
      question: "Do you test my eyes?",
      answer: [
        "No. We do not diagnose, treat or prescribe, and a quote is not medical advice. Please visit a licensed optometrist or ophthalmologist for an eye test. Eye tests are recommended every one to two years.",
      ],
    },
    {
      question: "My cylinder is written with a plus sign. Is that a problem?",
      answer: ["No. Some prescriptions use plus cylinder. Tick the box in the quote form and we convert it to the standard minus form for you."],
    },
  ],
};

const pdGroup = {
  id: "pd",
  title: "Pupil distance (PD)",
  items: [
    {
      question: "What is PD and why do you need it?",
      answer: ["PD is the distance in millimetres between the centres of your pupils. It tells us where to centre your lenses. Adult values are usually between 54 and 74 mm."],
    },
    {
      question: "How do I measure my PD?",
      answer: [
        "Stand about 20 cm from a mirror and hold a ruler against your brow. Close your right eye and line up the 0 mark with the centre of your left pupil. Then open your right eye, close your left, and read the mark at the centre of your right pupil.",
        "If you are unsure, choose \"I do not know my PD\" and we will help you.",
      ],
    },
  ],
};

const lensGroup = {
  id: "lenses",
  title: "Lenses",
  items: [
    {
      question: "What is the difference between single vision, progressive and bifocal?",
      answer: [
        "Single vision lenses have one power for one distance, such as distance, computer or reading.",
        "Progressive lenses blend several powers in one lens, so you see far, middle and near without a visible line.",
        "Bifocal lenses have a visible line, with the upper part for distance and the lower part for reading.",
      ],
    },
    {
      question: "What does lens index mean?",
      answer: [
        "The index describes how thin a lens can be. A higher index bends light more, so strong prescriptions look slimmer and lighter.",
        "Standard 1.50 suits low powers. 1.59 polycarbonate is thinner and impact resistant. 1.61 and 1.67 suit medium to high powers, and 1.74 is the thinnest for very high powers. Rimless and half-rim frames usually need a thinner index. We will recommend one when we review your prescription.",
      ],
    },
    {
      question: "What are lens coatings?",
      answer: [
        "Anti-scratch and UV400 protection are included with our lens packages. Optional extras include anti-reflective, which reduces glare and reflections, a blue-light filter, a water and oil repellent layer for easier cleaning, and anti-fog.",
        "Blue-light filtering and other coatings are comfort features and are not a treatment for any eye condition.",
      ],
    },
    {
      question: "Can I use my own frame or only buy lenses?",
      answer: ["Yes. In the quote form choose \"my own frame\" or \"lenses only\" and tell us about your frame. We confirm whether it is suitable before we order."],
    },
  ],
};

const deliveryGroup = (settings) => ({
  id: "delivery",
  title: "Delivery",
  items: [
    {
      question: "How long does delivery take and what does it cost?",
      answer: [
        nonEmpty(settings.shippingText, DELIVERY_FALLBACK),
        "Frames with prescription lenses are made to order, so they take longer than ready frames. We tell you the expected time with your quote.",
      ],
    },
  ],
});

const codGroup = (settings) => ({
  id: "cod",
  title: "Payment",
  items: [
    {
      question: "How can I pay?",
      answer: [nonEmpty(settings.codText, COD_FALLBACK)],
    },
  ],
});

const returnsGroup = (settings) => ({
  id: "returns",
  title: "Returns and warranty",
  items: [
    {
      question: "What is your returns and exchange policy?",
      answer: [nonEmpty(settings.returnsText, RETURNS_DEFAULT)],
    },
    ...(settings.warrantyText && settings.warrantyText.trim()
      ? [{ question: "Is there a warranty?", answer: [settings.warrantyText.trim()] }]
      : []),
  ],
});

export const faqGroups = (settings) => [
  GENERAL,
  prescriptionGroup,
  pdGroup,
  lensGroup,
  deliveryGroup(settings),
  codGroup(settings),
  returnsGroup(settings),
];

export const faqJsonLd = (groups) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
    })),
  ),
});
