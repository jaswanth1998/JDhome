"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchUploadedInvoiceBlob } from "@/lib/pdf/uploadedInvoice";

/** Shows a PDF stored in the private invoices bucket. */
export function UploadedPdfViewer({ path }: { path: string }) {
  const { supabase } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchUploadedInvoiceBlob(supabase, path)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [supabase, path]);

  if (failed) {
    return (
      <div className="bg-white rounded-lg border border-[var(--border-light)] p-8 text-center text-sm text-[var(--text-muted)]">
        The uploaded PDF could not be loaded.
      </div>
    );
  }

  if (!url) {
    return (
      <div className="bg-white rounded-lg border border-[var(--border-light)] flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile browsers will not paint a PDF inside an iframe */}
      <div className="sm:hidden bg-white rounded-lg border border-[var(--border-light)] p-6 text-center">
        <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Open PDF
        </a>
      </div>
      <iframe
        src={url}
        title="Uploaded invoice PDF"
        className="hidden sm:block w-full h-[80vh] bg-white rounded-lg border border-[var(--border-light)]"
      />
    </>
  );
}
