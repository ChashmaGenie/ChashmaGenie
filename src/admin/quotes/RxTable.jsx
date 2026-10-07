import { AlertTriangle } from "lucide-react";
import { formatPd, rxFlags, rxRows, rxStatusNote } from "./quoteFormat.js";

export function RxTable({ rx }) {
  const note = rxStatusNote(rx);
  if (note) return <p className="rounded-xl bg-cream-200 p-3 text-base">{note}</p>;
  const flags = rxFlags(rx);
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[320px] border-collapse text-center text-base">
          <caption className="sr-only">Prescription</caption>
          <thead>
            <tr className="bg-ink-100 text-sm">
              <th scope="col" className="p-2 text-start"><span className="sr-only">Eye</span></th>
              <th scope="col" className="p-2">SPH</th>
              <th scope="col" className="p-2">CYL</th>
              <th scope="col" className="p-2">AXIS</th>
              <th scope="col" className="p-2">ADD</th>
            </tr>
          </thead>
          <tbody>
            {rxRows(rx).map((row) => (
              <tr key={row.key} className="border-b border-ink-200">
                <th scope="row" className="p-2 text-start font-semibold">{row.label}</th>
                <td className="p-2">{row.sph}</td>
                <td className="p-2">{row.cyl}</td>
                <td className="p-2">{row.axis}</td>
                <td className="p-2">{row.add}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-base"><span className="font-semibold">PD:</span> {formatPd(rx)}</p>
      {flags.length > 0 ? (
        <ul className="space-y-1 rounded-xl bg-warn-100 p-3">
          {flags.map((flag) => (
            <li key={flag} className="flex items-start gap-2 text-sm font-medium text-warn-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {flag}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
