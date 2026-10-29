"use client";

/**
 * Public document view — no login required.
 *
 * Access is granted purely by the `?token=` value, which is an unguessable
 * uuid v4. The page never queries the invoices/estimates collections: it
 * fetches the single `shared/{token}` document (see src/lib/db/shared.ts and
 * firestore.rules), which holds just the fields the document renders — client
 * email/phone are never included.
 */
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Download, FileWarning } from "lucide-react";
import { getSharedDocument, type SharedDocument } from "@/lib/db";
import { DocumentPdfViewer, downloadDocumentPdf } from "@/lib/pdf";
import type { JDDocumentData } from "@/lib/pdf";
import {
  rowToSettings,
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
} from "@/lib/pdf/settings";

export default function ShareContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [doc, setDoc] = useState<JDDocumentData | null>(null);
  const [settings, setSettings] = useState<DocumentSettings>(
    DEFAULT_DOCUMENT_SETTINGS
  );
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("missing");
      return;
    }
    let active = true;

    (async () => {
      // null for an unknown token or when sharing is off; any other failure
      // (offline, misconfigured) is shown the same way.
      let payload: SharedDocument | null = null;
      try {
        payload = await getSharedDocument(token);
      } catch {
        payload = null;
      }

      if (!active) return;

      if (!payload) {
        setState("missing");
        return;
      }

      setDoc({
        kind: payload.kind,
        client: {
          name: payload.client.name,
          email: "", // not part of the shared copy; the document doesn't render it
          phone: null,
          address: payload.client.address,
          client_signature: payload.client.client_signature,
        },
        meta: payload.meta,
        items: [...payload.items].sort((a, b) => a.sort_order - b.sort_order),
      });
      if (payload.settings) {
        setSettings(rowToSettings(payload.settings));
      }
      setState("ok");
    })();

    return () => {
      active = false;
    };
  }, [token]);

  const handleDownload = useCallback(async () => {
    if (!doc) return;
    setDownloading(true);
    try {
      await downloadDocumentPdf(doc, settings);
    } catch {
      alert("Sorry — the document could not be downloaded. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [doc, settings]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--neutral-lightest-gray)]">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Loading document…</p>
      </div>
    );
  }

  if (state === "missing" || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-lightest-gray)] px-4">
        <div className="max-w-md text-center">
          <FileWarning className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Document not available
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            This link is no longer valid. Please contact JD Home Services and
            we&apos;ll send you a new one.
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-4">
            {DEFAULT_DOCUMENT_SETTINGS.companyPhone}
          </p>
        </div>
      </div>
    );
  }

  const label = doc.kind === "estimate" ? "Estimate" : "Invoice";

  return (
    <div className="min-h-screen bg-[var(--neutral-lightest-gray)]">
      <header className="bg-[var(--primary-main)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs tracking-widest uppercase opacity-70">
              JD Home Services &middot; {label}
            </p>
            <h1 className="text-base sm:text-xl font-bold leading-tight break-words">
              {doc.meta.number}
            </h1>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {downloading ? "Preparing…" : "Download PDF"}
            </span>
            <span className="sm:hidden">
              {downloading ? "…" : "Download"}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <DocumentPdfViewer data={doc} settings={settings} />
        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          Trouble viewing this on your phone? Tap Download PDF above.
        </p>
      </main>
    </div>
  );
}
