"use client";

/**
 * Real PDF preview. Statically imports @react-pdf/renderer, so this module is
 * only ever pulled in through the dynamic wrapper in DocumentPdfViewer.tsx —
 * never into the main bundle, and never during the static export build.
 */
import { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { JDDocument } from "./JDDocument";
import type { JDDocumentData } from "./types";
import {
  DEFAULT_DOCUMENT_SETTINGS,
  getDocumentSettings,
  type DocumentSettings,
} from "./settings";

export default function DocumentPdfViewerInner({
  data,
  settings: override,
}: {
  data: JDDocumentData;
  settings?: DocumentSettings;
}) {
  const [fetched, setFetched] = useState<DocumentSettings>(
    DEFAULT_DOCUMENT_SETTINGS
  );

  useEffect(() => {
    // Skip the fetch entirely when the caller supplies settings (Settings page
    // previews unsaved edits).
    if (override) return;
    let active = true;
    getDocumentSettings().then((s) => {
      if (active) setFetched(s);
    });
    return () => {
      active = false;
    };
  }, [override]);

  const settings = override ?? fetched;

  return (
    <PDFViewer
      // showToolbar keeps the browser's native zoom/download/print controls
      showToolbar
      style={{ width: "100%", height: "100%", border: "none" }}
    >
      <JDDocument data={data} settings={settings} />
    </PDFViewer>
  );
}
