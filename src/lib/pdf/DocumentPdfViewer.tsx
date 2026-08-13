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
 */
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { JDDocumentData } from "./types";
import type { DocumentSettings } from "./settings";

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

export function DocumentPdfViewer({
  data,
  settings,
}: {
  data: JDDocumentData;
  /** Override the stored settings — used to preview unsaved edits. */
  settings?: DocumentSettings;
}) {
  return (
    <ViewerFrame>
      <Inner data={data} settings={settings} />
    </ViewerFrame>
  );
}
