"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import EstimateDetailContent from "./EstimateDetailContent";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
    </div>
  );
}

export default function EstimateViewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EstimateDetailContent />
    </Suspense>
  );
}
