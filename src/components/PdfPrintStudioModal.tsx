import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FileUp,
  Layers,
  Maximize,
  Minimize,
  Ruler,
  ShieldAlert,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  computeEffectivePageGeometryPt,
  exportPrintReadyPdf,
  getRecommendedKdpGutterIn,
  getTargetTrimInches,
  inspectPdfDocument,
  MM_PER_INCH,
  openPdfJsDocument,
  ptToIn,
  ptToMm,
  renderPdfPageToCanvas,
  scanRenderedCanvasEdges,
  TRIM_PRESETS,
  validateAllPdfPages,
  type FullPdfValidationReport,
  type PageEdgeScanResult,
  type PdfDocumentInspection,
  type PrintLayoutConfig,
  type TrimPresetId,
} from '../utils/pdfPrintEngine';

interface PdfPrintStudioModalProps {
  open: boolean;
  onClose: () => void;
  initialPdfUrl?: string;
  initialFileName?: string;
  bookTitle?: string;
  sellingPriceDisplay?: string;
}

type ZoomMode = 'fit-page' | 'fit-width' | 'manual';

const DEFAULT_PDF_URL = '/assets/aistudio/THE_STORY_OF_KING_DAVID_8610dd13.pdf';
const DEFAULT_FILE_NAME = 'THE_STORY_OF_KING_DAVID.pdf';

export const PdfPrintStudioModal: React.FC<PdfPrintStudioModalProps> = ({
  open,
  onClose,
  initialPdfUrl = DEFAULT_PDF_URL,
  initialFileName = DEFAULT_FILE_NAME,
  bookTitle = 'The Story of King David',
  sellingPriceDisplay = '₹377',
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [inspection, setInspection] = useState<PdfDocumentInspection | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpInput, setPageJumpInput] = useState('1');
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-page');
  const [manualScale, setManualScale] = useState(1.0);
  const [computedScale, setComputedScale] = useState(0.85);
  const [renderedSize, setRenderedSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [renderingPage, setRenderingPage] = useState(false);

  const [showGuides, setShowGuides] = useState(true);
  const [isFullPagePreview, setIsFullPagePreview] = useState(false);
  const [currentEdgeScan, setCurrentEdgeScan] = useState<PageEdgeScanResult | null>(null);

  const [layoutConfig, setLayoutConfig] = useState<PrintLayoutConfig>({
    trimPreset: 'original',
    customTrimWidthIn: 8.5,
    customTrimHeightIn: 8.5,
    bleedIn: 0.125,
    marginsIn: {
      top: 0.375,
      bottom: 0.375,
      left: 0.375,
      right: 0.375,
    },
    innerGutterIn: 0.375,
    mirrorMargins: true,
    dimensionMode: 'preserve-original',
    dimensionsApprovedByUser: false,
    includeGuidesInExport: false,
  });

  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState({ done: 0, total: 0 });
  const [validationReport, setValidationReport] = useState<FullPdfValidationReport | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ done: 0, total: 0 });
  const [exportStatusMsg, setExportStatusMsg] = useState<string | null>(null);

  const loadPdfFromBytes = useCallback(
    async (bytes: Uint8Array, fileName: string) => {
      setLoadingPdf(true);
      setLoadError(null);
      setValidationReport(null);
      setExportStatusMsg(null);
      setCurrentEdgeScan(null);

      try {
        const [meta, docProxy] = await Promise.all([
          inspectPdfDocument(bytes, fileName),
          openPdfJsDocument(bytes),
        ]);

        setSourceBytes(bytes);
        setInspection(meta);
        setPdfJsDoc((prev) => {
          if (prev) {
            prev.cleanup(false).catch(() => {});
          }
          return docProxy;
        });
        setCurrentPage(1);
        setPageJumpInput('1');
        setZoomMode('fit-page');

        // Auto-align default custom trim dims & recommended KDP gutter without modifying original mode
        const wIn = Number(ptToIn(meta.primaryWidthPt).toFixed(3));
        const hIn = Number(ptToIn(meta.primaryHeightPt).toFixed(3));
        const recGutter = getRecommendedKdpGutterIn(meta.pageCount);
        setLayoutConfig((prev) => ({
          ...prev,
          trimPreset: 'original',
          customTrimWidthIn: Number(Math.max(4, wIn - prev.bleedIn).toFixed(3)),
          customTrimHeightIn: Number(Math.max(4, hIn - prev.bleedIn * 2).toFixed(3)),
          innerGutterIn: Math.max(prev.innerGutterIn, recGutter),
          dimensionMode: 'preserve-original',
          dimensionsApprovedByUser: false,
        }));
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to open this PDF file. Please verify the file is a valid unencrypted PDF.';
        setLoadError(msg);
      } finally {
        setLoadingPdf(false);
      }
    },
    []
  );

  const loadPdfFromUrl = useCallback(
    async (url: string, fileName: string) => {
      setLoadingPdf(true);
      setLoadError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch PDF (${res.status} ${res.statusText}).`);
        }
        const buf = await res.arrayBuffer();
        await loadPdfFromBytes(new Uint8Array(buf), fileName);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Unable to fetch the PDF document.';
        setLoadError(msg);
        setLoadingPdf(false);
      }
    },
    [loadPdfFromBytes]
  );

  // Initial load when modal opens
  useEffect(() => {
    if (!open) return;
    if (!sourceBytes && initialPdfUrl) {
      loadPdfFromUrl(initialPdfUrl, initialFileName);
    }
  }, [open, sourceBytes, initialPdfUrl, initialFileName, loadPdfFromUrl]);

  // Cleanup PDF.js proxy on unmount
  useEffect(() => {
    return () => {
      pdfJsDoc?.cleanup(false).catch(() => {});
    };
  }, [pdfJsDoc]);

  // Escape key handling
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullPagePreview) {
          setIsFullPagePreview(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && inspection) {
        setCurrentPage((p) => Math.min(inspection.pageCount, p + 1));
      } else if (e.key === 'ArrowLeft' && inspection) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, isFullPagePreview, inspection, onClose]);

  useEffect(() => {
    setPageJumpInput(String(currentPage));
  }, [currentPage]);

  const activePageMeta = useMemo(() => {
    if (!inspection) return null;
    return inspection.pages[Math.min(Math.max(0, currentPage - 1), inspection.pages.length - 1)];
  }, [inspection, currentPage]);

  const effectiveGeometry = useMemo(() => {
    if (!activePageMeta) return null;
    return computeEffectivePageGeometryPt(
      activePageMeta.mediaBox.width,
      activePageMeta.mediaBox.height,
      currentPage,
      layoutConfig
    );
  }, [activePageMeta, currentPage, layoutConfig]);

  // Compute exact unclipped zoom scale based on viewport size and selected ZoomMode
  const recomputeScale = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || !effectiveGeometry) return;
    const padX = 48;
    const padY = 48;
    const availW = Math.max(220, vp.clientWidth - padX);
    const availH = Math.max(220, vp.clientHeight - padY);

    if (zoomMode === 'manual') {
      setComputedScale(manualScale);
      return;
    }

    const fitWidthScale = availW / effectiveGeometry.mediaW;
    const fitHeightScale = availH / effectiveGeometry.mediaH;
    const next =
      zoomMode === 'fit-width'
        ? Math.max(0.25, Math.min(3.0, fitWidthScale))
        : Math.max(0.25, Math.min(3.0, Math.min(fitWidthScale, fitHeightScale)));
    setComputedScale(next);
  }, [effectiveGeometry, zoomMode, manualScale]);

  useEffect(() => {
    if (!open) return;
    recomputeScale();
    const vp = viewportRef.current;
    if (!vp || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => recomputeScale());
    ro.observe(vp);
    return () => ro.disconnect();
  }, [open, recomputeScale, isFullPagePreview]);

  // Render active page to canvas preserving 100% original aspect ratio & edges
  useEffect(() => {
    if (!open || !pdfJsDoc || !activePageMeta || !effectiveGeometry) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setRenderingPage(true);

    (async () => {
      try {
        const useApprovedCustom =
          layoutConfig.dimensionMode === 'apply-approved-trim' &&
          layoutConfig.dimensionsApprovedByUser &&
          layoutConfig.trimPreset !== 'original';

        if (!useApprovedCustom) {
          // Exact full-page PDF.js viewport render (no clipping, exact aspect ratio)
          const { widthPx, heightPx } = await renderPdfPageToCanvas(
            pdfJsDoc,
            currentPage,
            canvas,
            computedScale
          );
          if (cancelled) return;
          setRenderedSize({ w: widthPx, h: heightPx });
        } else {
          // Render source page onto offscreen canvas at crisp scale, then place aspect-locked inside approved sheet
          const off = document.createElement('canvas');
          const fitScalePt = Math.min(
            effectiveGeometry.safeW / activePageMeta.mediaBox.width,
            effectiveGeometry.safeH / activePageMeta.mediaBox.height
          );
          const renderScale = computedScale * fitScalePt;
          await renderPdfPageToCanvas(pdfJsDoc, currentPage, off, renderScale);
          if (cancelled) return;

          const sheetW = Math.max(1, Math.round(effectiveGeometry.mediaW * computedScale));
          const sheetH = Math.max(1, Math.round(effectiveGeometry.mediaH * computedScale));
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          canvas.width = Math.round(sheetW * dpr);
          canvas.height = Math.round(sheetH * dpr);
          canvas.style.width = `${sheetW}px`;
          canvas.style.height = `${sheetH}px`;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, sheetW, sheetH);

            const drawW = activePageMeta.mediaBox.width * fitScalePt * computedScale;
            const drawH = activePageMeta.mediaBox.height * fitScalePt * computedScale;
            const drawX =
              (effectiveGeometry.safeX +
                (effectiveGeometry.safeW - activePageMeta.mediaBox.width * fitScalePt) / 2) *
              computedScale;
            // Canvas top-down Y vs PDF bottom-up Y
            const pdfTopY =
              effectiveGeometry.safeY +
              effectiveGeometry.safeH -
              (effectiveGeometry.safeH - activePageMeta.mediaBox.height * fitScalePt) / 2;
            const drawY = (effectiveGeometry.mediaH - pdfTopY) * computedScale;

            ctx.drawImage(off, drawX, drawY, drawW, drawH);
          }
          setRenderedSize({ w: sheetW, h: sheetH });
        }

        if (!cancelled && inspection) {
          const scan = scanRenderedCanvasEdges(
            canvas,
            activePageMeta.mediaBox.width,
            activePageMeta.mediaBox.height,
            currentPage,
            inspection.pageCount,
            layoutConfig
          );
          setCurrentEdgeScan(scan);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to render this PDF page.'
          );
        }
      } finally {
        if (!cancelled) setRenderingPage(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    pdfJsDoc,
    activePageMeta,
    effectiveGeometry,
    currentPage,
    computedScale,
    inspection,
    layoutConfig,
  ]);

  if (!open) return null;

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setLoadError(`"${file.name}" is not a PDF file. Please select a .pdf document.`);
      return;
    }
    try {
      const buf = await file.arrayBuffer();
      await loadPdfFromBytes(new Uint8Array(buf), file.name);
    } catch {
      setLoadError(`Could not read "${file.name}". Please try another PDF file.`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelected(file);
  };

  const handleRunValidation = async () => {
    if (!pdfJsDoc || !inspection) return;
    setValidating(true);
    setValidationProgress({ done: 0, total: inspection.pageCount });
    setExportStatusMsg(null);
    try {
      const report = await validateAllPdfPages(
        pdfJsDoc,
        inspection,
        layoutConfig,
        (done, total) => setValidationProgress({ done, total })
      );
      setValidationReport(report);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Validation encountered an error.'
      );
    } finally {
      setValidating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!sourceBytes || !inspection) return;
    setExporting(true);
    setExportProgress({ done: 0, total: inspection.pageCount });
    setExportStatusMsg(null);
    try {
      const outBytes = await exportPrintReadyPdf(
        sourceBytes,
        inspection,
        layoutConfig,
        (done, total) => setExportProgress({ done, total })
      );
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const baseName = inspection.fileName.replace(/\.pdf$/i, '');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}-print-validated.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setExportStatusMsg(
        `Exported ${inspection.pageCount} lossless pages (${
          layoutConfig.dimensionMode === 'apply-approved-trim' &&
          layoutConfig.dimensionsApprovedByUser
            ? 'approved trim & gutter layout'
            : 'original dimensions preserved, normalized [0, 0] MediaBox & TrimBox'
        }).`
      );
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to export print-ready PDF.'
      );
    } finally {
      setExporting(false);
    }
  };

  const handleZoomStep = (factor: number) => {
    const next = Math.max(0.25, Math.min(3.0, Number((computedScale * factor).toFixed(2))));
    setZoomMode('manual');
    setManualScale(next);
  };

  const targetTrimIn = inspection
    ? getTargetTrimInches(layoutConfig, inspection.primaryWidthPt, inspection.primaryHeightPt)
    : { width: 8.5, height: 8.5 };

  // Compute fractional overlay percentages for Trim, Safe-Print Area, and Inner Gutter
  const overlayFractions =
    effectiveGeometry && renderedSize.w > 0 && renderedSize.h > 0
      ? {
          trimLeftPct: (effectiveGeometry.trimX / effectiveGeometry.mediaW) * 100,
          trimRightPct:
            ((effectiveGeometry.mediaW - (effectiveGeometry.trimX + effectiveGeometry.trimW)) /
              effectiveGeometry.mediaW) *
            100,
          trimTopPct:
            ((effectiveGeometry.mediaH - (effectiveGeometry.trimY + effectiveGeometry.trimH)) /
              effectiveGeometry.mediaH) *
            100,
          trimBottomPct: (effectiveGeometry.trimY / effectiveGeometry.mediaH) * 100,

          safeLeftPct: (effectiveGeometry.safeX / effectiveGeometry.mediaW) * 100,
          safeRightPct:
            ((effectiveGeometry.mediaW - (effectiveGeometry.safeX + effectiveGeometry.safeW)) /
              effectiveGeometry.mediaW) *
            100,
          safeTopPct:
            ((effectiveGeometry.mediaH - (effectiveGeometry.safeY + effectiveGeometry.safeH)) /
              effectiveGeometry.mediaH) *
            100,
          safeBottomPct: (effectiveGeometry.safeY / effectiveGeometry.mediaH) * 100,
          gutterPct: (effectiveGeometry.gutterPt / effectiveGeometry.mediaW) * 100,
          gutterSide: effectiveGeometry.gutterSide,
        }
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NJ STUDIO PDF Print-Quality Preview & Export Studio"
      className="fixed inset-0 z-50 bg-[#1B1410]/85 flex items-center justify-center p-2 sm:p-4"
    >
      <div className="relative w-full max-w-[1440px] h-[95vh] bg-[#F8F4EF] border border-[#765A4A]/25 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* TOP STUDIO BAR */}
        <header className="shrink-0 bg-[#EFE8DE] border-b border-[#765A4A]/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#765A4A]">
                <span className="font-semibold text-[#203B30] whitespace-nowrap">
                  NJ STUDIO Print & PDF Inspector
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate font-medium text-[#2C221E] max-w-[220px] sm:max-w-[300px]">
                  {inspection?.fileName || initialFileName}
                </span>
                {bookTitle === 'The Story of King David' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#203B30] tabular-nums whitespace-nowrap">
                      Selling Price {sellingPriceDisplay}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Primary Controls: Upload, King David Quick Load, Zoom, Page Nav, Close */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                handleFileSelected(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>

            <button
              type="button"
              onClick={() => loadPdfFromUrl(DEFAULT_PDF_URL, DEFAULT_FILE_NAME)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#F8F4EF] hover:bg-[#E7C2C0]/50 text-[#203B30] border border-[#765A4A]/25 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>King David PDF</span>
            </button>

            <div className="h-4 w-px bg-[#765A4A]/20 mx-0.5 hidden md:block" />

            {/* Zoom & Fit Controls */}
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-sm bg-[#F8F4EF] border border-[#765A4A]/20">
              <button
                type="button"
                onClick={() => setZoomMode('fit-page')}
                className={`px-2.5 py-1 rounded-xs text-xs font-medium cursor-pointer whitespace-nowrap ${
                  zoomMode === 'fit-page'
                    ? 'bg-[#203B30] text-[#F8F4EF]'
                    : 'text-[#3B2F2A] hover:bg-[#EFE8DE]'
                }`}
              >
                Fit Page
              </button>
              <button
                type="button"
                onClick={() => setZoomMode('fit-width')}
                className={`px-2.5 py-1 rounded-xs text-xs font-medium cursor-pointer whitespace-nowrap ${
                  zoomMode === 'fit-width'
                    ? 'bg-[#203B30] text-[#F8F4EF]'
                    : 'text-[#3B2F2A] hover:bg-[#EFE8DE]'
                }`}
              >
                Fit Width
              </button>
              <button
                type="button"
                onClick={() => handleZoomStep(0.85)}
                aria-label="Zoom out"
                className="p-1.5 rounded-xs text-[#2C221E] hover:bg-[#EFE8DE] cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-medium text-[#203B30] tabular-nums whitespace-nowrap">
                {Math.round(computedScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoomStep(1.18)}
                aria-label="Zoom in"
                className="p-1.5 rounded-xs text-[#2C221E] hover:bg-[#EFE8DE] cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowGuides((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#F8F4EF] hover:bg-[#E7C2C0]/50 text-[#2C221E] border border-[#765A4A]/20 text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showGuides ? 'Guides On' : 'Guides Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullPagePreview((v) => !v)}
              aria-label={isFullPagePreview ? 'Show inspector sidebar' : 'Expand full-page preview'}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#F8F4EF] hover:bg-[#E7C2C0]/50 text-[#2C221E] border border-[#765A4A]/20 text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              {isFullPagePreview ? (
                <>
                  <Minimize className="w-3.5 h-3.5" />
                  <span>Inspector</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5" />
                  <span>Full Preview</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close PDF Studio"
              className="w-8 h-8 rounded-full bg-[#F8F4EF] hover:bg-[#E7C2C0] text-[#2C221E] border border-[#765A4A]/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: UNCLIPPED FULL-PAGE PDF PREVIEW STAGE */}
          <div className="flex-1 min-h-[340px] flex flex-col bg-[#261D18] overflow-hidden relative">
            {/* Page Navigation & Active Dimensions Sub-bar */}
            <div className="shrink-0 bg-[#1F1713] border-b border-[#F8F4EF]/10 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#F8F4EF]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={!inspection || currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#F8F4EF]/10 hover:bg-[#F8F4EF]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inspection) return;
                    const parsed = parseInt(pageJumpInput, 10);
                    if (!Number.isNaN(parsed)) {
                      setCurrentPage(Math.min(inspection.pageCount, Math.max(1, parsed)));
                    }
                  }}
                  className="flex items-center gap-1.5 px-2"
                >
                  <span className="text-[#E7C2C0]">Page</span>
                  <input
                    type="number"
                    min={1}
                    max={inspection?.pageCount || 1}
                    value={pageJumpInput}
                    onChange={(e) => setPageJumpInput(e.target.value)}
                    aria-label="Current page number"
                    className="w-12 px-1.5 py-0.5 rounded-xs bg-[#F8F4EF]/10 border border-[#F8F4EF]/20 text-center text-xs text-[#F8F4EF] tabular-nums focus:outline-none focus:border-[#E7C2C0]"
                  />
                  <span className="text-[#F8F4EF]/75 tabular-nums">
                    of {inspection?.pageCount || 0}
                  </span>
                </form>

                <button
                  type="button"
                  disabled={!inspection || currentPage >= inspection.pageCount}
                  onClick={() =>
                    inspection && setCurrentPage((p) => Math.min(inspection.pageCount, p + 1))
                  }
                  aria-label="Next page"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#F8F4EF]/10 hover:bg-[#F8F4EF]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activePageMeta && effectiveGeometry && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#F8F4EF]/80 tabular-nums">
                  <span>
                    {currentPage % 2 === 1 ? 'Odd · Recto (Right)' : 'Even · Verso (Left)'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    MediaBox: {ptToIn(activePageMeta.mediaBox.width).toFixed(3)} ×{' '}
                    {ptToIn(activePageMeta.mediaBox.height).toFixed(3)} in
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {ptToMm(activePageMeta.mediaBox.width).toFixed(1)} ×{' '}
                    {ptToMm(activePageMeta.mediaBox.height).toFixed(1)} mm
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Aspect {activePageMeta.aspectRatio.toFixed(3)}</span>
                </div>
              )}
            </div>

            {/* Safe-Area Live Warning Strip */}
            {currentEdgeScan && (currentEdgeScan.hasWarning || currentEdgeScan.bleedTouchingEdges.length > 0) && (
              <div
                className={`shrink-0 px-4 py-2 text-xs flex items-center gap-2 border-b ${
                  currentEdgeScan.hasWarning
                    ? 'bg-[#6E2C2C] text-[#F8F4EF] border-[#E7C2C0]/25'
                    : 'bg-[#3C2E26] text-[#F8F4EF] border-[#E7C2C0]/20'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-[#E7C2C0] shrink-0" />
                <span>
                  <strong>Page {currentPage}:</strong> {currentEdgeScan.warningSummary}
                </span>
              </div>
            )}

            {/* Scrollable Unclipped Canvas Stage with Drag & Drop */}
            <div
              ref={viewportRef}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`flex-1 overflow-auto p-6 flex items-center justify-center relative ${
                isDragOver ? 'ring-2 ring-inset ring-[#E7C2C0] bg-[#2D221B]' : ''
              }`}
            >
              {loadError ? (
                <div className="max-w-md bg-[#F8F4EF] text-[#2C221E] p-6 rounded-md border border-[#9E4747]/40 shadow-xl text-center">
                  <ShieldAlert className="w-8 h-8 text-[#9E4747] mx-auto mb-2" />
                  <h3 className="font-serif text-xl font-semibold text-[#203B30]">
                    Unable to Load PDF
                  </h3>
                  <p className="mt-2 text-xs text-[#3B2F2A] leading-relaxed">{loadError}</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-sm bg-[#203B30] text-[#F8F4EF] text-xs font-medium cursor-pointer"
                    >
                      Upload Another PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPdfFromUrl(DEFAULT_PDF_URL, DEFAULT_FILE_NAME)}
                      className="px-4 py-2 rounded-sm bg-[#EFE8DE] text-[#2C221E] text-xs font-medium cursor-pointer"
                    >
                      Reload King David PDF
                    </button>
                  </div>
                </div>
              ) : loadingPdf ? (
                <div className="text-center text-[#F8F4EF]/85 text-sm">
                  Inspecting PDF structure & page boxes…
                </div>
              ) : (
                <div
                  className="relative shrink-0 bg-white shadow-2xl"
                  style={{
                    width: renderedSize.w > 0 ? `${renderedSize.w}px` : 'auto',
                    height: renderedSize.h > 0 ? `${renderedSize.h}px` : 'auto',
                  }}
                >
                  {/* Full Unclipped Page Canvas */}
                  <canvas ref={canvasRef} className="block" />

                  {/* Margin, Bleed, Trim & Gutter Guides Overlay (1:1 aligned to PDF MediaBox) */}
                  {showGuides && overlayFractions && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                    >
                      {/* Outer MediaBox / Bleed Edge Border */}
                      <div className="absolute inset-0 border border-[#38BDF8]/80" />

                      {/* Trim Line (Bleed Inset) */}
                      <div
                        className="absolute border border-dashed border-[#D94848]"
                        style={{
                          left: `${overlayFractions.trimLeftPct}%`,
                          right: `${overlayFractions.trimRightPct}%`,
                          top: `${overlayFractions.trimTopPct}%`,
                          bottom: `${overlayFractions.trimBottomPct}%`,
                        }}
                      />

                      {/* Inner Binding Gutter Zone */}
                      <div
                        className="absolute bg-[#C99595]/18 border-[#765A4A]/50"
                        style={{
                          top: `${overlayFractions.trimTopPct}%`,
                          bottom: `${overlayFractions.trimBottomPct}%`,
                          ...(overlayFractions.gutterSide === 'left'
                            ? {
                                left: `${overlayFractions.trimLeftPct}%`,
                                width: `${overlayFractions.gutterPct}%`,
                                borderRightWidth: '1px',
                                borderRightStyle: 'dotted',
                              }
                            : {
                                right: `${overlayFractions.trimRightPct}%`,
                                width: `${overlayFractions.gutterPct}%`,
                                borderLeftWidth: '1px',
                                borderLeftStyle: 'dotted',
                              }),
                        }}
                      />

                      {/* Safe-Print Area Box */}
                      <div
                        className="absolute border border-dashed border-[#203B30]"
                        style={{
                          left: `${overlayFractions.safeLeftPct}%`,
                          right: `${overlayFractions.safeRightPct}%`,
                          top: `${overlayFractions.safeTopPct}%`,
                          bottom: `${overlayFractions.safeBottomPct}%`,
                        }}
                      />
                    </div>
                  )}

                  {renderingPage && (
                    <div className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded-xs bg-[#1F1713]/80 text-[#F8F4EF] text-[10px]">
                      Rendering…
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Guide Legend Strip */}
            <div className="shrink-0 bg-[#1F1713] border-t border-[#F8F4EF]/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#F8F4EF]/80">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" />
                  MediaBox Edge
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#D94848] inline-block" />
                  Trim Line
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#52A37C] inline-block" />
                  Safe-Print Area
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-[#C99595]/45 inline-block border border-[#C99595]/70" />
                  Inner Gutter ({layoutConfig.mirrorMargins ? 'Mirrored' : 'Left'})
                </span>
              </div>
              <span className="text-[#E7C2C0]">
                Drag & drop any multipage PDF onto the stage to inspect
              </span>
            </div>
          </div>

          {/* RIGHT: PRINT SPECIFICATIONS, BOX INSPECTOR, VALIDATION & EXPORT */}
          {!isFullPagePreview && (
            <aside className="w-full lg:w-[410px] xl:w-[440px] shrink-0 bg-[#F8F4EF] border-t lg:border-t-0 lg:border-l border-[#765A4A]/20 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Product Context & Accurate Price */}
              <div className="pb-4 border-b border-[#765A4A]/15 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium text-[#765A4A]">
                    Print-Layout & Pre-Flight Studio
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[#203B30] leading-tight">
                    {inspection?.fileName === DEFAULT_FILE_NAME ? bookTitle : inspection?.fileName || bookTitle}
                  </h2>
                </div>
                {inspection?.fileName === DEFAULT_FILE_NAME && (
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-[#765A4A]">Selling Price</div>
                    <div className="font-serif text-2xl font-semibold text-[#203B30] tabular-nums">
                      {sellingPriceDisplay}
                    </div>
                  </div>
                )}
              </div>

              {/* 1. PDF PAGE BOXES & ORIGINAL DIMENSIONS */}
              {inspection && activePageMeta && (
                <section className="space-y-2.5 pb-4 border-b border-[#765A4A]/15">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#203B30] flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Detected PDF Boxes (Page {currentPage})</span>
                    </h3>
                    <span className="text-[11px] text-[#765A4A] tabular-nums">
                      {(inspection.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 text-[11px] bg-[#EFE8DE] p-3 rounded-sm border border-[#765A4A]/15 tabular-nums">
                    {(
                      [
                        { name: 'MediaBox', box: activePageMeta.mediaBox },
                        { name: 'CropBox', box: activePageMeta.cropBox },
                        { name: 'TrimBox', box: activePageMeta.trimBox },
                        { name: 'BleedBox', box: activePageMeta.bleedBox },
                      ] as const
                    ).map(({ name, box }) => (
                      <div key={name} className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#203B30]">
                          {name}
                          <span className="ml-1 font-normal text-[#765A4A]">
                            ({box.explicit ? 'explicit' : 'inherited'})
                          </span>
                        </span>
                        <span className="text-[#3B2F2A]">
                          [{box.x.toFixed(1)}, {box.y.toFixed(1)}] · {box.width.toFixed(1)}×
                          {box.height.toFixed(1)} pt ({ptToIn(box.width).toFixed(3)}×
                          {ptToIn(box.height).toFixed(3)} in)
                        </span>
                      </div>
                    ))}
                  </div>

                  {activePageMeta.hasNonZeroOrigin && (
                    <p className="text-[11px] text-[#765A4A] leading-relaxed">
                      Detected non-zero PDF origin (x={activePageMeta.mediaBox.x.toFixed(2)} pt, y=
                      {activePageMeta.mediaBox.y.toFixed(2)} pt). Rendering & export anchor to full
                      MediaBox bounds so all 4 edges stay uncropped.
                    </p>
                  )}

                  {activePageMeta.minImageDpi !== null && (
                    <div className="text-[11px] text-[#3B2F2A] flex items-center justify-between">
                      <span>Embedded Raster Resolution (p.{currentPage})</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          activePageMeta.minImageDpi >= 300 ? 'text-[#203B30]' : 'text-[#8C3B3B]'
                        }`}
                      >
                        {activePageMeta.minImageDpi} DPI
                      </span>
                    </div>
                  )}
                </section>
              )}

              {/* 2. PAGE DIMENSIONS, MARGINS & INNER GUTTER */}
              <section className="space-y-3 pb-4 border-b border-[#765A4A]/15">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#203B30]">
                  Trim Dimensions, Margins & Gutter
                </h3>

                {/* Preserve vs Approved Modify Mode */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-sm bg-[#EFE8DE] border border-[#765A4A]/15">
                  <button
                    type="button"
                    onClick={() =>
                      setLayoutConfig((prev) => ({
                        ...prev,
                        dimensionMode: 'preserve-original',
                      }))
                    }
                    className={`px-2.5 py-1.5 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${
                      layoutConfig.dimensionMode === 'preserve-original'
                        ? 'bg-[#F8F4EF] text-[#203B30] shadow-xs'
                        : 'text-[#765A4A] hover:text-[#2C221E]'
                    }`}
                  >
                    Preserve Original Size
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLayoutConfig((prev) => ({
                        ...prev,
                        dimensionMode: 'apply-approved-trim',
                      }))
                    }
                    className={`px-2.5 py-1.5 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${
                      layoutConfig.dimensionMode === 'apply-approved-trim'
                        ? 'bg-[#F8F4EF] text-[#203B30] shadow-xs'
                        : 'text-[#765A4A] hover:text-[#2C221E]'
                    }`}
                  >
                    Refit to Target Trim
                  </button>
                </div>

                {layoutConfig.dimensionMode === 'apply-approved-trim' && (
                  <div className="p-3 rounded-sm bg-[#EFE8DE] border border-[#765A4A]/20 space-y-2.5">
                    <div>
                      <label
                        htmlFor="trim-preset-select"
                        className="block text-[11px] font-medium text-[#765A4A] mb-1"
                      >
                        Target Trim Size
                      </label>
                      <select
                        id="trim-preset-select"
                        value={layoutConfig.trimPreset}
                        onChange={(e) =>
                          setLayoutConfig((prev) => ({
                            ...prev,
                            trimPreset: e.target.value as TrimPresetId,
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-xs bg-white border border-[#765A4A]/25 text-xs text-[#2C221E]"
                      >
                        <option value="original">Keep Original Dimensions</option>
                        {Object.entries(TRIM_PRESETS).map(([id, info]) => (
                          <option key={id} value={id}>
                            {info.label}
                          </option>
                        ))}
                        <option value="custom">Custom Trim Dimensions (in)</option>
                      </select>
                    </div>

                    {layoutConfig.trimPreset === 'custom' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-[#765A4A] mb-0.5">
                            Trim Width (in)
                          </label>
                          <input
                            type="number"
                            step="0.125"
                            min="3"
                            max="18"
                            value={layoutConfig.customTrimWidthIn}
                            onChange={(e) =>
                              setLayoutConfig((prev) => ({
                                ...prev,
                                customTrimWidthIn: Math.max(3, parseFloat(e.target.value) || 8.5),
                              }))
                            }
                            className="w-full px-2 py-1 rounded-xs bg-white border border-[#765A4A]/25 text-xs tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#765A4A] mb-0.5">
                            Trim Height (in)
                          </label>
                          <input
                            type="number"
                            step="0.125"
                            min="3"
                            max="18"
                            value={layoutConfig.customTrimHeightIn}
                            onChange={(e) =>
                              setLayoutConfig((prev) => ({
                                ...prev,
                                customTrimHeightIn: Math.max(3, parseFloat(e.target.value) || 8.5),
                              }))
                            }
                            className="w-full px-2 py-1 rounded-xs bg-white border border-[#765A4A]/25 text-xs tabular-nums"
                          />
                        </div>
                      </div>
                    )}

                    <label className="flex items-start gap-2 text-[11px] text-[#203B30] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layoutConfig.dimensionsApprovedByUser}
                        onChange={(e) =>
                          setLayoutConfig((prev) => ({
                            ...prev,
                            dimensionsApprovedByUser: e.target.checked,
                          }))
                        }
                        className="mt-0.5 accent-[#203B30]"
                      />
                      <span>
                        I approve modifying original page dimensions to{' '}
                        <strong>
                          {targetTrimIn.width.toFixed(2)} × {targetTrimIn.height.toFixed(2)} in
                        </strong>{' '}
                        (uniformly scaled, never cropped or stretched).
                      </span>
                    </label>
                  </div>
                )}

                {/* Bleed & Margin Inputs */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#765A4A] mb-0.5">
                      Bleed (in)
                    </label>
                    <input
                      type="number"
                      step="0.025"
                      min="0"
                      max="0.5"
                      value={layoutConfig.bleedIn}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          bleedIn: Math.max(0, Math.min(0.5, parseFloat(e.target.value) || 0)),
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-xs bg-white border border-[#765A4A]/25 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#765A4A] mb-0.5">
                      Inner Gutter (in)
                    </label>
                    <input
                      type="number"
                      step="0.025"
                      min="0"
                      max="1.5"
                      value={layoutConfig.innerGutterIn}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          innerGutterIn: Math.max(0, Math.min(1.5, parseFloat(e.target.value) || 0)),
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-xs bg-white border border-[#765A4A]/25 tabular-nums"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[10px] text-[#765A4A] tabular-nums pb-1.5">
                      {(layoutConfig.innerGutterIn * MM_PER_INCH).toFixed(1)} mm gutter
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                    <div key={side}>
                      <label className="block text-[11px] text-[#765A4A] capitalize mb-0.5">
                        {side}
                      </label>
                      <input
                        type="number"
                        step="0.025"
                        min="0"
                        max="2"
                        value={layoutConfig.marginsIn[side]}
                        onChange={(e) =>
                          setLayoutConfig((prev) => ({
                            ...prev,
                            marginsIn: {
                              ...prev.marginsIn,
                              [side]: Math.max(0, Math.min(2, parseFloat(e.target.value) || 0)),
                            },
                          }))
                        }
                        className="w-full px-2 py-1 rounded-xs bg-white border border-[#765A4A]/25 tabular-nums"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-[#3B2F2A]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layoutConfig.mirrorMargins}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          mirrorMargins: e.target.checked,
                        }))
                      }
                      className="accent-[#203B30]"
                    />
                    <span>Mirror binding gutter (odd = left, even = right)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layoutConfig.includeGuidesInExport}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          includeGuidesInExport: e.target.checked,
                        }))
                      }
                      className="accent-[#203B30]"
                    />
                    <span>Draw hairline proof guides inside exported PDF</span>
                  </label>
                </div>
              </section>

              {/* 3. PRINT-READY PRE-FLIGHT VALIDATION */}
              <section className="space-y-3 pb-4 border-b border-[#765A4A]/15">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#203B30]">
                    Pre-Flight Print Validation
                  </h3>
                  <button
                    type="button"
                    disabled={!pdfJsDoc || validating}
                    onClick={handleRunValidation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] disabled:opacity-50 text-[#F8F4EF] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>
                      {validating
                        ? `Validating ${validationProgress.done}/${validationProgress.total}…`
                        : `Validate All ${inspection?.pageCount || ''} Pages`}
                    </span>
                  </button>
                </div>

                {validationReport && (
                  <div className="space-y-2.5">
                    <div
                      className={`p-3 rounded-sm border text-xs flex items-start gap-2 ${
                        validationReport.isPrintReadyVerified
                          ? 'bg-[#203B30]/10 border-[#203B30]/35 text-[#203B30]'
                          : 'bg-[#C99595]/20 border-[#9E4747]/40 text-[#5D2424]'
                      }`}
                    >
                      {validationReport.isPrintReadyVerified ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#203B30]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#8C3B3B]" />
                      )}
                      <div>
                        <div className="font-semibold">
                          {validationReport.isPrintReadyVerified
                            ? 'Print-Ready Verified'
                            : 'Not Yet Print-Ready — Attention Required'}
                        </div>
                        <div className="text-[11px] opacity-85 mt-0.5">
                          Checked {validationReport.checkedPageCount} pages · Trim{' '}
                          {validationReport.effectiveTargetTrimIn.width.toFixed(2)}×
                          {validationReport.effectiveTargetTrimIn.height.toFixed(2)} in
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs">
                      {validationReport.checks.map((chk) => (
                        <li
                          key={chk.id}
                          className="p-2 rounded-xs bg-[#EFE8DE]/75 border border-[#765A4A]/15 flex items-start gap-2"
                        >
                          {chk.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#203B30] shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#9E4747] shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium text-[#203B30]">
                              {chk.label}:{' '}
                              <span className={chk.passed ? 'text-[#203B30]' : 'text-[#8C3B3B]'}>
                                {chk.passed ? 'Pass' : 'Warning'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#765A4A] mt-0.5 leading-snug">
                              {chk.detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {validationReport.pageIssues.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-[#765A4A]">
                          Edge Alerts ({validationReport.pageIssues.length} page
                          {validationReport.pageIssues.length === 1 ? '' : 's'}) — click to inspect:
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {validationReport.pageIssues.map((issue) => (
                            <button
                              key={issue.pageNumber}
                              type="button"
                              onClick={() => setCurrentPage(issue.pageNumber)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xs text-[11px] border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                currentPage === issue.pageNumber
                                  ? 'bg-[#203B30] text-[#F8F4EF] border-[#203B30]'
                                  : 'bg-[#F8F4EF] hover:bg-[#EFE8DE] text-[#2C221E] border-[#765A4A]/20'
                              }`}
                            >
                              <span className="font-semibold shrink-0 tabular-nums">
                                Page {issue.pageNumber}
                              </span>
                              <span className="truncate opacity-85">{issue.warningSummary}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 4. LOSSLESS EXPORT ACTION */}
              <section className="space-y-2.5">
                <button
                  type="button"
                  disabled={!sourceBytes || exporting}
                  onClick={handleExportPdf}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] disabled:opacity-50 text-[#F8F4EF] text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {exporting
                      ? `Exporting Page ${exportProgress.done}/${exportProgress.total}…`
                      : 'Export Print-Validated PDF'}
                  </span>
                </button>

                {exportStatusMsg && (
                  <div className="p-2.5 rounded-xs bg-[#203B30]/10 border border-[#203B30]/25 text-[11px] text-[#203B30] leading-relaxed">
                    {exportStatusMsg}
                  </div>
                )}
              </section>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
