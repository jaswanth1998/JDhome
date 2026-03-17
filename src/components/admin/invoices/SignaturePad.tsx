"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type PointerEvent,
} from "react";
import { Eraser, Undo2, PenLine } from "lucide-react";

type SignaturePadProps = {
  initialDataUrl?: string;
  onChange: (dataUrl: string) => void;
};

export function SignaturePad({ initialDataUrl, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(!!initialDataUrl);
  const strokeHistory = useRef<ImageData[]>([]);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return ctx;
  }, []);

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save current image before resize
    const currentImage = canvas.toDataURL();
    const hadContent =
      hasStrokes || (initialDataUrl && initialDataUrl.length > 0);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = getCtx();
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1a1a2e";

    // Restore image after resize
    if (hadContent) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = currentImage;
    }
  }, [getCtx, hasStrokes, initialDataUrl]);

  // Load initial signature
  useEffect(() => {
    if (!initialDataUrl) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = getCtx();
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const rect = container.getBoundingClientRect();
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHasStrokes(true);
    };
    img.src = initialDataUrl;
  }, [initialDataUrl, getCtx]);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  function getPos(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function saveSnapshot() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    strokeHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (strokeHistory.current.length > 30) strokeHistory.current.shift();
  }

  function handlePointerDown(e: PointerEvent<HTMLCanvasElement>) {
    const ctx = getCtx();
    if (!ctx) return;
    saveSnapshot();
    isDrawing.current = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    setHasStrokes(true);
    emitChange();
  }

  function emitChange() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = getCtx();
    if (!canvas || !container || !ctx) return;
    const rect = container.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    strokeHistory.current = [];
    setHasStrokes(false);
    onChange("");
  }

  function handleUndo() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || strokeHistory.current.length === 0) return;
    const prev = strokeHistory.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    if (strokeHistory.current.length === 0 && !initialDataUrl) {
      setHasStrokes(false);
      onChange("");
    } else {
      emitChange();
    }
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full h-[140px] sm:h-[160px] rounded-lg border-2 border-dashed border-[var(--border-light)] bg-[var(--neutral-lightest-gray)] overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-50">
              <PenLine className="w-5 h-5" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokeHistory.current.length === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--neutral-light-gray)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-3 h-3" />
          Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasStrokes}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Eraser className="w-3 h-3" />
          Clear
        </button>
      </div>
    </div>
  );
}
