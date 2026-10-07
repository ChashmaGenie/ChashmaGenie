import { Modal } from "@/components/ui/index.js";

const SAMPLE_ROWS = [
  { eye: "OD (right)", sph: "-2.25", cyl: "-0.75", axis: "90", add: "" },
  { eye: "OS (left)", sph: "-2.00", cyl: "-0.50", axis: "85", add: "" },
];

const TERMS = [
  ["OD / OS", "OD is your right eye. OS is your left eye. Some prescriptions write R and L instead."],
  ["SPH (sphere)", "The main lens power. A minus (-) sign means short-sighted. A plus (+) sign means long-sighted."],
  ["CYL (cylinder)", "Extra power for astigmatism. If this box is empty or says DS or SPH, choose 0.00."],
  ["AXIS", "A number from 1 to 180 that goes with CYL. Skip it when CYL is empty."],
  ["ADD", "Extra reading power, only on prescriptions for progressive or bifocal lenses."],
  ["PD", "The distance between your pupils in millimetres. It is often written at the bottom."],
];

function SamplePrescription() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse text-center text-sm" aria-label="Example prescription">
        <thead>
          <tr className="bg-ink-900 text-cream-100">
            {["", "SPH", "CYL", "AXIS", "ADD"].map((heading) => <th key={heading} scope="col" className="px-2 py-2 font-semibold">{heading}</th>)}
          </tr>
        </thead>
        <tbody>
          {SAMPLE_ROWS.map((row) => (
            <tr key={row.eye} className="border-b border-ink-200 bg-cream-50">
              <th scope="row" className="px-2 py-2 text-start font-semibold">{row.eye}</th>
              <td className="px-2 py-2 tabular">{row.sph}</td>
              <td className="px-2 py-2 tabular">{row.cyl}</td>
              <td className="px-2 py-2 tabular">{row.axis}</td>
              <td className="px-2 py-2 tabular">{row.add || "-"}</td>
            </tr>
          ))}
          <tr className="bg-cream-50">
            <th scope="row" className="px-2 py-2 text-start font-semibold">PD</th>
            <td colSpan={4} className="px-2 py-2 tabular">63 mm</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function RxHelpModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Where do I find this?">
      <div className="flex flex-col gap-4">
        <p>Your prescription comes from your optometrist or eye doctor. It looks like this example (numbers are made up).</p>
        <SamplePrescription />
        <dl className="grid gap-3">
          {TERMS.map(([term, meaning]) => (
            <div key={term}>
              <dt className="font-semibold text-ink-900">{term}</dt>
              <dd className="text-sm text-ink-600">{meaning}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-ink-600">Copy every number exactly, including the + and - signs. If anything is unclear, choose "I will send it later" and share a photo on WhatsApp.</p>
      </div>
    </Modal>
  );
}

const PD_STEPS = [
  "Stand about 20 cm from a mirror and hold a ruler flat against your brow.",
  "Close your right eye and line up the 0 mm mark with the centre of your left pupil.",
  "Open your right eye and close your left. Read the mm mark at the centre of your right pupil.",
  "That number is your PD. Most adults are between 54 and 74 mm. Repeat twice to be sure.",
];

export function PdHelpModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="How to measure your PD">
      <div className="flex flex-col gap-4">
        <p>PD (pupillary distance) is how far apart your pupils are. It is usually written on your prescription. If not, you can measure it at home.</p>
        <ol className="list-decimal space-y-2 ps-5">
          {PD_STEPS.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className="text-sm text-ink-600">Some prescriptions give two numbers, one for each eye (for example 31 and 32). Choose "Two numbers" and enter both. Not sure? Choose "I do not know my PD" and we will help.</p>
      </div>
    </Modal>
  );
}
