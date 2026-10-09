"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ShareContent from "./ShareContent";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-lightest-gray)]">
      <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShareContent />
    </Suspense>
  );
}
