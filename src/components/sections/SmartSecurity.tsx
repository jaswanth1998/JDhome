import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Cable,
  HardDrive,
  Rotate3d,
  ScanFace,
  ScanSearch,
  Search,
  Smartphone,
} from "lucide-react";
import { InquiryButton } from "@/components/inquiry";
import { Photo, Reveal, SectionHeading } from "@/components/ui";

const capabilities = [
  {
    icon: ScanFace,
    title: "AI person & vehicle detection",
    body: "Alerts for people and cars, not branches, headlights, or passing animals.",
  },
  {
    icon: ScanSearch,
    title: "Search by description",
    body: "Type what you're looking for and jump to matching snapshots across every camera.",
  },
  {
    icon: Cable,
    title: "Power over Ethernet",
    body: "One cable per camera carries power and video. No outlets, no batteries, no Wi-Fi dropouts.",
  },
  {
    icon: HardDrive,
    title: "Local recording",
    body: "Footage records to an NVR at your property, so your video stays with you.",
  },
  {
    icon: Smartphone,
    title: "Live view on your phone",
    body: "Watch live, play back recordings, and get alerts wherever you are.",
  },
  {
    icon: Rotate3d,
    title: "The right camera for each spot",
    body: "Dome, bullet, turret, PTZ, 360° panoramic, and doorbell cameras.",
  },
];

const exampleResults = [
  { camera: "Side gate", time: "9:42 PM", tag: "Person" },
  { camera: "Driveway", time: "10:15 PM", tag: "Person" },
  { camera: "Backyard", time: "11:03 PM", tag: "Person" },
];

/** Dark feature band for the CCTV / smart camera service. */
export function SmartSecurity() {
  return (
    <section className="section bg-grid-dark text-white">
      <div className="container">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <SectionHeading
              light
              eyebrow="Smart security cameras"
              title="Cameras that tell you what matters"
              subtitle="We install modern AI camera systems for homes, workplaces, and rentals, wired properly and set up so you can find what you need in seconds."
            />

            <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {capabilities.map(({ icon: Icon, title, body }, i) => (
                <Reveal as="li" key={title} delay={i * 0.04} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gold-500">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/65">{body}</span>
                  </span>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <InquiryButton service="security-cameras">Plan my camera system</InquiryButton>
              <Link href="/services/security-camera-installation/" className="btn btn-ghost-light">
                How it works
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Photo with an illustrative smart-search panel */}
          <Reveal className="relative">
            <Photo
              image="smartCamera"
              aspect={4 / 5}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/5] shadow-[var(--shadow-xl)] max-lg:aspect-[4/3]"
            />
            <div className="relative mt-4 rounded-[var(--radius-lg)] border border-white/10 bg-navy-950/85 p-4 shadow-[var(--shadow-xl)] backdrop-blur-md sm:absolute sm:-left-6 sm:bottom-8 sm:mt-0 sm:w-[340px]">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
                  <span className="live-dot" aria-hidden="true" />
                  Smart search
                </span>
                <BellRing className="h-4 w-4 text-white/50" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm text-ink">
                <Search className="h-4 w-4 text-ink-3" aria-hidden="true" />
                person near the side gate after 9 PM
              </div>
              <ul className="mt-3 space-y-1.5">
                {exampleResults.map((r) => (
                  <li
                    key={r.camera}
                    className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-sm text-white/85"
                  >
                    <span>{r.camera}</span>
                    <span className="flex items-center gap-2 text-white/55">
                      {r.time}
                      <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-gold-500">
                        {r.tag}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.6875rem] text-white/45">Illustration of a smart search on supported systems</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default SmartSecurity;
