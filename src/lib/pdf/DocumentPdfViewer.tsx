"use client";

/**
 * On-screen preview of the invoice / estimate.
 *
 * This renders the SAME document component that produces the emailed PDF, via
 * the same renderer — so the preview and the file the client receives cannot
 * drift apart.
 *
 * @react-pdf/renderer is loaded lazily (ssr: false) because it is browser-only
 * and would otherwise be pulled into the static export build.
 *
 * Below `sm` we do NOT embed the viewer: mobile browsers (iOS Safari in
 * particular) refuse to paint a PDF inside an iframe, which leaves a blank
 * box. Small screens get an "Open PDF" button instead, which hands the file to
 * the OS viewer and actually works.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import type { JDDocumentData } from "./types";
import type { DocumentSettings } from "./settings";
import { buildDocumentPdfBlob } from "./sendDocument";

function ViewerFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--border-light)] rounded-lg shadow-sm overflow-hidden h-[80vh] min-h-[560px]">
      {children}
    </div>
  );
}

function ViewerLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Loader2 className="w-6 h-6 text-[var(--accent-teal)] animate-spin" />
      <p className="text-xs text-[var(--text-muted)]">Rendering PDF…</p>
    </div>
  );
}

const Inner = dynamic(() => import("./DocumentPdfViewerInner"), {
  ssr: false,
  loading: () => <ViewerLoading />,
});

/** Small-screen stand-in: opens the PDF with the device's own viewer. */
function MobilePdfCard({
  data,
  settings,
}: {
  data: JDDocumentData;
  settings?: DocumentSettings;
}) {
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      const blob = await buildDocumentPdfBlob(data, settings);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      // Give the new tab time to claim the blob before revoking it.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Sorry — the document could not be opened. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-lg shadow-sm p-6 text-center">
      <FileText className="w-10 h-10 text-[var(--primary-main)] mx-auto mb-3 opacity-80" />
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {data.kind === "estimate" ? "Estimate" : "Invoice"} {data.meta.number}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
        Tap below to open the PDF.
      </p>
      <button
        onClick={open}
        disabled={busy}
        className="btn btn-primary btn-sm mx-auto disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ExternalLink className="w-4 h-4" />
        )}
        {busy ? "Preparing…" : "Open PDF"}
      </button>
    </div>
  );
}

export function DocumentPdfViewer({
  data,
  settings,
}: {
  data: JDDocumentData;
  /** Override the stored settings — used to preview unsaved edits. */
  settings?: DocumentSettings;
}) {
  return (
    <>
      <div className="hidden sm:block">
        <ViewerFrame>
          <Inner data={data} settings={settings} />
        </ViewerFrame>
      </div>
      <div className="sm:hidden">
        <MobilePdfCard data={data} settings={settings} />
      </div>
    </>
  );
}
