import { Cable, Cctv, HardDrive, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/ui";

const stages = [
  {
    icon: Cctv,
    title: "Smart cameras",
    body: "AI cameras placed to cover entrances, driveways, yards, and work areas.",
  },
  {
    icon: Cable,
    title: "PoE cabling",
    body: "One ethernet cable per camera delivers power and video. Tidy and reliable.",
  },
  {
    icon: HardDrive,
    title: "NVR at your property",
    body: "Records every camera locally and indexes snapshots for smart search.",
  },
  {
    icon: Smartphone,
    title: "Your phone",
    body: "Live view, playback, alerts, and search from anywhere with internet.",
  },
];

/** How a wired PoE camera system fits together, left to right. */
export function CameraSystemDiagram() {
  return (
    <section className="section bg-grid-dark text-white">
      <div className="container">
        <SectionHeading
          light
          align="center"
          eyebrow="How your system works"
          title="From camera to phone, wired properly"
          subtitle="Every install follows the same dependable layout. We plan camera positions with you, run the cabling, set up the recorder, and connect the app before we leave."
        />
        <ol className="mt-14 grid gap-4 md:grid-cols-4">
          {stages.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-6">
              <span className="mb-5 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500 text-navy-900">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-white/10">
                  0{i + 1}
                </span>
              </span>
              <h3 className="text-lg text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
              {i < stages.length - 1 && (
                <span
                  className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-navy-900 text-xs text-gold-500 md:flex"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default CameraSystemDiagram;
