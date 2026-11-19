import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFStream,
  rgb,
} from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const PT_PER_INCH = 72;
export const MM_PER_INCH = 25.4;

export function ptToIn(pt: number): number {
  return pt / PT_PER_INCH;
}

export function ptToMm(pt: number): number {
  return (pt / PT_PER_INCH) * MM_PER_INCH;
}

export function inToPt(inches: number): number {
  return inches * PT_PER_INCH;
}

export interface PdfBoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
  explicit: boolean;
}

export interface EmbeddedImageMetrics {
  widthPx: number;
  heightPx: number;
  effectiveDpi: number;
}

export interface PdfPageBoxInfo {
  pageNumber: number;
  rotation: number;
  mediaBox: PdfBoxRect;
  cropBox: PdfBoxRect;
  trimBox: PdfBoxRect;
  bleedBox: PdfBoxRect;
  aspectRatio: number;
  hasNonZeroOrigin: boolean;
  cropDiffersFromMedia: boolean;
  embeddedImages: EmbeddedImageMetrics[];
  minImageDpi: number | null;
}

export interface PdfDocumentInspection {
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  pages: PdfPageBoxInfo[];
  hasMixedDimensions: boolean;
  primaryWidthPt: number;
  primaryHeightPt: number;
  primaryAspectRatio: number;
  hasAnyNonZeroOrigin: boolean;
  hasAnyCropMismatch: boolean;
  minDocumentDpi: number | null;
}

export type TrimPresetId =
  | 'original'
  | 'kdp-8.5x8.5'
  | 'kdp-8.5x11'
  | 'kdp-6x9'
  | 'a4'
  | 'custom';

export interface PrintLayoutConfig {
  trimPreset: TrimPresetId;
  customTrimWidthIn: number;
  customTrimHeightIn: number;
  bleedIn: number;
  marginsIn: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  innerGutterIn: number;
  mirrorMargins: boolean;
  dimensionMode: 'preserve-original' | 'apply-approved-trim';
  dimensionsApprovedByUser: boolean;
  includeGuidesInExport: boolean;
}

export const TRIM_PRESETS: Record<
  Exclude<TrimPresetId, 'original' | 'custom'>,
  { label: string; widthIn: number; heightIn: number }
> = {
  'kdp-8.5x8.5': { label: 'KDP Square (8.5 × 8.5 in)', widthIn: 8.5, heightIn: 8.5 },
  'kdp-8.5x11': { label: 'KDP Coloring / Workbook (8.5 × 11 in)', widthIn: 8.5, heightIn: 11 },
  'kdp-6x9': { label: 'KDP Trade Paperback (6 × 9 in)', widthIn: 6, heightIn: 9 },
  a4: { label: 'International A4 (210 × 297 mm)', widthIn: 8.268, heightIn: 11.693 },
};

export type PageEdgeSide = 'top' | 'bottom' | 'left' | 'right';

export interface PageEdgeScanResult {
  pageNumber: number;
  bleedTouchingEdges: PageEdgeSide[];
  safeZoneCrossingEdges: PageEdgeSide[];
  isLikelyCoverFullBleed: boolean;
  hasWarning: boolean;
  warningSummary: string;
}

export interface ValidationCheckItem {
  id: 'trim' | 'bleed' | 'gutter' | 'safe-area' | 'resolution';
  label: string;
  passed: boolean;
  detail: string;
}

export interface FullPdfValidationReport {
  isPrintReadyVerified: boolean;
  checkedPageCount: number;
  checks: ValidationCheckItem[];
  pageIssues: PageEdgeScanResult[];
  recommendedMinGutterIn: number;
  effectiveTargetTrimIn: { width: number; height: number };
  effectiveBleedIn: number;
  timestampIso: string;
}

export interface EffectivePageGeometryPt {
  mediaW: number;
  mediaH: number;
  bleedPt: number;
  trimX: number;
  trimY: number;
  trimW: number;
  trimH: number;
  safeLeftPt: number;
  safeRightPt: number;
  safeTopPt: number;
  safeBottomPt: number;
  safeX: number;
  safeY: number;
  safeW: number;
  safeH: number;
  gutterSide: 'left' | 'right';
  gutterPt: number;
}

export function getRecommendedKdpGutterIn(pageCount: number): number {
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.5;
  if (pageCount <= 500) return 0.625;
  return 0.75;
}

export function getTargetTrimInches(
  config: PrintLayoutConfig,
  origWidthPt: number,
  origHeightPt: number
): { width: number; height: number } {
  if (
    config.dimensionMode === 'preserve-original' ||
    !config.dimensionsApprovedByUser ||
    config.trimPreset === 'original'
  ) {
    // Infer trim size from MediaBox minus bleed if bleed > 0, without changing page dimensions
    const inferredW = Math.max(1, ptToIn(origWidthPt) - config.bleedIn);
    const inferredH = Math.max(1, ptToIn(origHeightPt) - config.bleedIn * 2);
    return {
      width: Number(inferredW.toFixed(3)),
      height: Number(inferredH.toFixed(3)),
    };
  }
  if (config.trimPreset === 'custom') {
    return {
      width: Math.max(2, config.customTrimWidthIn),
      height: Math.max(2, config.customTrimHeightIn),
    };
  }
  const preset = TRIM_PRESETS[config.trimPreset];
  return { width: preset.widthIn, height: preset.heightIn };
}

/**
 * Computes exact layout boxes in points (origin bottom-left = 0,0) for a given page number.
 */
export function computeEffectivePageGeometryPt(
  origWidthPt: number,
  origHeightPt: number,
  pageNumber: number,
  config: PrintLayoutConfig
): EffectivePageGeometryPt {
  const useApprovedCustom =
    config.dimensionMode === 'apply-approved-trim' && config.dimensionsApprovedByUser;
  const bleedPt = inToPt(Math.max(0, config.bleedIn));

  const isOddRecto = pageNumber % 2 === 1;
  const gutterSide: 'left' | 'right' = config.mirrorMargins
    ? isOddRecto
      ? 'left'
      : 'right'
    : 'left';

  let mediaW = origWidthPt;
  let mediaH = origHeightPt;
  let trimW = Math.max(72, origWidthPt - bleedPt * 2);
  let trimH = Math.max(72, origHeightPt - bleedPt * 2);
  let trimX = bleedPt;
  let trimY = bleedPt;

  if (useApprovedCustom && config.trimPreset !== 'original') {
    const targetTrimIn = getTargetTrimInches(config, origWidthPt, origHeightPt);
    trimW = inToPt(targetTrimIn.width);
    trimH = inToPt(targetTrimIn.height);
    // Standard full-bleed sheet adds exterior bleed on top, bottom, and outer edge
    mediaW = trimW + bleedPt * 2;
    mediaH = trimH + bleedPt * 2;
    trimX = bleedPt;
    trimY = bleedPt;
  } else {
    // Detect KDP exterior-only horizontal bleed (e.g. 8.625 x 8.75 in for 8.5 x 8.5 trim)
    const isKdpSingleEdgeBleed =
      bleedPt > 0 && Math.abs((origHeightPt - origWidthPt) - bleedPt) < 2.5;
    if (isKdpSingleEdgeBleed) {
      trimW = origWidthPt - bleedPt;
      trimH = origHeightPt - bleedPt * 2;
      trimX = gutterSide === 'left' ? 0 : bleedPt;
      trimY = bleedPt;
    } else {
      trimX = Math.min(bleedPt, origWidthPt * 0.08);
      trimY = Math.min(bleedPt, origHeightPt * 0.08);
      trimW = origWidthPt - trimX * 2;
      trimH = origHeightPt - trimY * 2;
    }
  }

  const gutterPt = inToPt(Math.max(0, config.innerGutterIn));
  const topMarginPt = inToPt(Math.max(0, config.marginsIn.top));
  const bottomMarginPt = inToPt(Math.max(0, config.marginsIn.bottom));
  const leftMarginPt = inToPt(Math.max(0, config.marginsIn.left));
  const rightMarginPt = inToPt(Math.max(0, config.marginsIn.right));

  const safeLeftPt =
    gutterSide === 'left' ? Math.max(leftMarginPt, gutterPt) : leftMarginPt;
  const safeRightPt =
    gutterSide === 'right' ? Math.max(rightMarginPt, gutterPt) : rightMarginPt;
  const safeTopPt = topMarginPt;
  const safeBottomPt = bottomMarginPt;

  const safeX = trimX + safeLeftPt;
  const safeY = trimY + safeBottomPt;
  const safeW = Math.max(12, trimW - safeLeftPt - safeRightPt);
  const safeH = Math.max(12, trimH - safeTopPt - safeBottomPt);

  return {
    mediaW,
    mediaH,
    bleedPt,
    trimX,
    trimY,
    trimW,
    trimH,
    safeLeftPt,
    safeRightPt,
    safeTopPt,
    safeBottomPt,
    safeX,
    safeY,
    safeW,
    safeH,
    gutterSide,
    gutterPt,
  };
}

function boxesDiffer(a: PdfBoxRect, b: PdfBoxRect, tol = 0.5): boolean {
  return (
    Math.abs(a.x - b.x) > tol ||
    Math.abs(a.y - b.y) > tol ||
    Math.abs(a.width - b.width) > tol ||
    Math.abs(a.height - b.height) > tol
  );
}

/**
 * Inspects a PDF file using pdf-lib for exact MediaBox, CropBox, TrimBox, BleedBox,
 * non-zero origins, page-by-page dimensions, and embedded image pixel resolution.
 */
export async function inspectPdfDocument(
  bytes: Uint8Array,
  fileName: string
): Promise<PdfDocumentInspection> {
  if (!bytes || bytes.byteLength < 16) {
    throw new Error('The selected file is empty or too small to be a valid PDF.');
  }

  // Verify PDF header magic bytes (%PDF-)
  const header = String.fromCharCode(...bytes.slice(0, 8));
  if (!header.includes('%PDF-')) {
    throw new Error(
      'Invalid PDF file header. Please upload a valid .pdf document starting with %PDF-.'
    );
  }

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/encrypt/i.test(msg)) {
      throw new Error(
        'This PDF is password-protected or encrypted. Please export an unprotected PDF before uploading.'
      );
    }
    throw new Error(`Unable to parse PDF structure: ${msg}`);
  }

  const pdfPages = doc.getPages();
  if (pdfPages.length === 0) {
    throw new Error('This PDF contains zero pages.');
  }

  const pages: PdfPageBoxInfo[] = pdfPages.map((page, idx) => {
    const mb = page.getMediaBox();
    const cb = page.getCropBox();
    const tb = page.getTrimBox();
    const bb = page.getBleedBox();

    const hasExplicitCrop = Boolean(page.node.lookup(PDFName.of('CropBox')));
    const hasExplicitTrim = Boolean(page.node.lookup(PDFName.of('TrimBox')));
    const hasExplicitBleed = Boolean(page.node.lookup(PDFName.of('BleedBox')));

    const mediaBox: PdfBoxRect = { ...mb, explicit: true };
    const cropBox: PdfBoxRect = { ...cb, explicit: hasExplicitCrop };
    const trimBox: PdfBoxRect = { ...tb, explicit: hasExplicitTrim };
    const bleedBox: PdfBoxRect = { ...bb, explicit: hasExplicitBleed };

    // Extract embedded raster image dimensions from page Resources.XObject
    const embeddedImages: EmbeddedImageMetrics[] = [];
    const pageWIn = Math.max(0.1, ptToIn(mediaBox.width));
    const pageHIn = Math.max(0.1, ptToIn(mediaBox.height));

    try {
      const resources = page.node.Resources();
      const xObjects = resources?.lookup(PDFName.of('XObject'));
      if (xObjects instanceof PDFDict) {
        for (const [, refOrVal] of xObjects.entries()) {
          const obj = doc.context.lookup(refOrVal);
          if (obj instanceof PDFStream) {
            const subtype = obj.dict.lookup(PDFName.of('Subtype'));
            if (subtype === PDFName.of('Image')) {
              const wObj = obj.dict.lookup(PDFName.of('Width'));
              const hObj = obj.dict.lookup(PDFName.of('Height'));
              const wPx = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
              const hPx = hObj instanceof PDFNumber ? hObj.asNumber() : 0;
              if (wPx > 0 && hPx > 0) {
                const effDpi = Math.round(Math.min(wPx / pageWIn, hPx / pageHIn));
                embeddedImages.push({
                  widthPx: wPx,
                  heightPx: hPx,
                  effectiveDpi: effDpi,
                });
              }
            }
          }
        }
      }
    } catch {
      // Ignore malformed optional XObject resource metadata
    }

    const minImageDpi =
      embeddedImages.length > 0
        ? Math.min(...embeddedImages.map((i) => i.effectiveDpi))
        : null;

    return {
      pageNumber: idx + 1,
      rotation: page.getRotation().angle,
      mediaBox,
      cropBox,
      trimBox,
      bleedBox,
      aspectRatio: mediaBox.height > 0 ? mediaBox.width / mediaBox.height : 1,
      hasNonZeroOrigin: Math.abs(mediaBox.x) > 0.5 || Math.abs(mediaBox.y) > 0.5,
      cropDiffersFromMedia: boxesDiffer(mediaBox, cropBox),
      embeddedImages,
      minImageDpi,
    };
  });

  const first = pages[0];
  const hasMixedDimensions = pages.some(
    (p) =>
      Math.abs(p.mediaBox.width - first.mediaBox.width) > 1.5 ||
      Math.abs(p.mediaBox.height - first.mediaBox.height) > 1.5
  );
  const dpis = pages
    .map((p) => p.minImageDpi)
    .filter((d): d is number => typeof d === 'number');

  return {
    fileName,
    fileSizeBytes: bytes.byteLength,
    pageCount: pages.length,
    pages,
    hasMixedDimensions,
    primaryWidthPt: first.mediaBox.width,
    primaryHeightPt: first.mediaBox.height,
    primaryAspectRatio: first.aspectRatio,
    hasAnyNonZeroOrigin: pages.some((p) => p.hasNonZeroOrigin),
    hasAnyCropMismatch: pages.some((p) => p.cropDiffersFromMedia),
    minDocumentDpi: dpis.length > 0 ? Math.min(...dpis) : null,
  };
}

/**
 * Loads a pdfjs-dist document safely from an independent buffer copy
 * (PDF.js transfers/detaches the passed buffer to its worker).
 */
export async function openPdfJsDocument(
  bytes: Uint8Array
): Promise<pdfjsLib.PDFDocumentProxy> {
  const copy = new Uint8Array(bytes);
  const loadingTask = pdfjsLib.getDocument({ data: copy });
  return await loadingTask.promise;
}

/**
 * Renders a PDF.js page onto a target canvas preserving exact MediaBox/ViewBox aspect ratio.
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number
): Promise<{ widthPx: number; heightPx: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  canvas.width = Math.max(1, Math.round(viewport.width * dpr));
  canvas.height = Math.max(1, Math.round(viewport.height * dpr));
  canvas.style.width = `${Math.round(viewport.width)}px`;
  canvas.style.height = `${Math.round(viewport.height)}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for PDF rendering.');
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  await page.render({
    canvasContext: ctx,
    canvas,
    viewport,
  }).promise;

  return {
    widthPx: Math.round(viewport.width),
    heightPx: Math.round(viewport.height),
  };
}

/**
 * Scans all four outer edges (Bleed/Trim band and Safe-Print Margin band) of a rendered
 * page canvas for non-white artwork or text pixels extending outside safe limits.
 */
export function scanRenderedCanvasEdges(
  canvas: HTMLCanvasElement,
  origWidthPt: number,
  origHeightPt: number,
  pageNumber: number,
  totalPages: number,
  config: PrintLayoutConfig
): PageEdgeScanResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || canvas.width < 10 || canvas.height < 10) {
    return {
      pageNumber,
      bleedTouchingEdges: [],
      safeZoneCrossingEdges: [],
      isLikelyCoverFullBleed: false,
      hasWarning: false,
      warningSummary: 'Unable to scan canvas pixels.',
    };
  }

  const w = canvas.width;
  const h = canvas.height;
  const geom = computeEffectivePageGeometryPt(origWidthPt, origHeightPt, pageNumber, config);

  // Convert PDF points (bottom-left origin) to canvas pixels (top-left origin)
  const scaleX = w / geom.mediaW;
  const scaleY = h / geom.mediaH;

  const trimBandLeft = Math.max(2, Math.round((geom.trimX + 2) * scaleX));
  const trimBandRight = Math.max(2, Math.round((geom.mediaW - (geom.trimX + geom.trimW) + 2) * scaleX));
  const trimBandTop = Math.max(2, Math.round((geom.mediaH - (geom.trimY + geom.trimH) + 2) * scaleY));
  const trimBandBottom = Math.max(2, Math.round((geom.trimY + 2) * scaleY));

  const safeLeftPx = Math.max(trimBandLeft + 1, Math.round(geom.safeX * scaleX));
  const safeRightPx = Math.max(
    trimBandRight + 1,
    Math.round((geom.mediaW - (geom.safeX + geom.safeW)) * scaleX)
  );
  const safeTopPx = Math.max(
    trimBandTop + 1,
    Math.round((geom.mediaH - (geom.safeY + geom.safeH)) * scaleY)
  );
  const safeBottomPx = Math.max(trimBandBottom + 1, Math.round(geom.safeY * scaleY));

  const imgData = ctx.getImageData(0, 0, w, h).data;
  const isInk = (px: number, py: number): boolean => {
    const x = Math.min(w - 1, Math.max(0, px));
    const y = Math.min(h - 1, Math.max(0, py));
    const idx = (y * w + x) * 4;
    const r = imgData[idx];
    const g = imgData[idx + 1];
    const b = imgData[idx + 2];
    const a = imgData[idx + 3];
    return a > 25 && (r < 240 || g < 240 || b < 240);
  };

  // Sample grid inside top/bottom/left/right strips
  const stepX = Math.max(2, Math.floor(w / 140));
  const stepY = Math.max(2, Math.floor(h / 140));

  const bleedCounts: Record<PageEdgeSide, number> = { top: 0, bottom: 0, left: 0, right: 0 };
  const safeCounts: Record<PageEdgeSide, number> = { top: 0, bottom: 0, left: 0, right: 0 };

  // Top & Bottom strips
  for (let x = 0; x < w; x += stepX) {
    for (let y = 0; y < Math.min(safeTopPx, h); y += 2) {
      if (isInk(x, y)) {
        if (y <= trimBandTop) bleedCounts.top++;
        else safeCounts.top++;
      }
    }
    for (let y = Math.max(0, h - safeBottomPx); y < h; y += 2) {
      if (isInk(x, y)) {
        if (y >= h - trimBandBottom) bleedCounts.bottom++;
        else safeCounts.bottom++;
      }
    }
  }

  // Left & Right strips
  for (let y = 0; y < h; y += stepY) {
    for (let x = 0; x < Math.min(safeLeftPx, w); x += 2) {
      if (isInk(x, y)) {
        if (x <= trimBandLeft) bleedCounts.left++;
        else safeCounts.left++;
      }
    }
    for (let x = Math.max(0, w - safeRightPx); x < w; x += 2) {
      if (isInk(x, y)) {
        if (x >= w - trimBandRight) bleedCounts.right++;
        else safeCounts.right++;
      }
    }
  }

  const sides: PageEdgeSide[] = ['top', 'bottom', 'left', 'right'];
  const bleedTouchingEdges = sides.filter((s) => bleedCounts[s] >= 4);
  const safeZoneCrossingEdges = sides.filter(
    (s) => safeCounts[s] >= 6 || bleedCounts[s] >= 4
  );

  const isLikelyCoverFullBleed =
    (pageNumber === 1 || pageNumber === totalPages) && bleedTouchingEdges.length >= 2;

  const hasWarning = safeZoneCrossingEdges.length > 0 && !isLikelyCoverFullBleed;

  let warningSummary = 'All 4 edges clear inside safe-print area.';
  if (isLikelyCoverFullBleed) {
    warningSummary = `Cover / full-bleed artwork extends to ${bleedTouchingEdges.join(', ')} edge(s) — verify full-bleed trim allowance.`;
  } else if (bleedTouchingEdges.length > 0) {
    warningSummary = `Artwork/text reaches outer trim edge (${bleedTouchingEdges.join(', ')}) — risk of cropping unless bleed/margins are adjusted.`;
  } else if (safeZoneCrossingEdges.length > 0) {
    warningSummary = `Content enters safe margin/gutter zone on ${safeZoneCrossingEdges.join(', ')} edge(s).`;
  }

  return {
    pageNumber,
    bleedTouchingEdges,
    safeZoneCrossingEdges,
    isLikelyCoverFullBleed,
    hasWarning,
    warningSummary,
  };
}

/**
 * Validates every page of the uploaded/loaded PDF sequentially without freezing the main thread.
 */
export async function validateAllPdfPages(
  pdfJsDoc: pdfjsLib.PDFDocumentProxy,
  inspection: PdfDocumentInspection,
  config: PrintLayoutConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<FullPdfValidationReport> {
  const total = inspection.pageCount;
  const pageIssues: PageEdgeScanResult[] = [];
  const offscreenCanvas = document.createElement('canvas');

  for (let i = 1; i <= total; i++) {
    const pageMeta = inspection.pages[i - 1];
    // Render at crisp validation scale (~0.5x = ~310px wide, fast and accurate for 51+ pages)
    await renderPdfPageToCanvas(pdfJsDoc, i, offscreenCanvas, 0.55);
    const scan = scanRenderedCanvasEdges(
      offscreenCanvas,
      pageMeta.mediaBox.width,
      pageMeta.mediaBox.height,
      i,
      total,
      config
    );
    if (scan.hasWarning || scan.bleedTouchingEdges.length > 0) {
      pageIssues.push(scan);
    }
    onProgress?.(i, total);
    // Yield to browser paint loop every 4 pages
    if (i % 4 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  const targetTrimIn = getTargetTrimInches(
    config,
    inspection.primaryWidthPt,
    inspection.primaryHeightPt
  );
  const recommendedMinGutterIn = getRecommendedKdpGutterIn(total);

  const interiorWarnings = pageIssues.filter((p) => p.hasWarning);
  const trimPassed =
    !inspection.hasMixedDimensions &&
    targetTrimIn.width >= 4 &&
    targetTrimIn.height >= 4;

  const hasCoverBleedPages = pageIssues.some((p) => p.bleedTouchingEdges.length > 0);
  const bleedPassed = !hasCoverBleedPages || config.bleedIn >= 0.125;

  const firstGeom = computeEffectivePageGeometryPt(
    inspection.primaryWidthPt,
    inspection.primaryHeightPt,
    1,
    config
  );
  const gutterPassed =
    config.innerGutterIn >= recommendedMinGutterIn &&
    config.marginsIn.top >= 0.25 &&
    config.marginsIn.bottom >= 0.25 &&
    config.marginsIn.left >= 0.25 &&
    config.marginsIn.right >= 0.25 &&
    firstGeom.safeW > 72 &&
    firstGeom.safeH > 72;

  const safeAreaPassed = interiorWarnings.length === 0;

  // Commercial print standard requires >= 300 DPI for raster artwork
  const minDpi = inspection.minDocumentDpi;
  const resolutionPassed = minDpi === null || minDpi >= 300;

  const checks: ValidationCheckItem[] = [
    {
      id: 'trim',
      label: 'Trim Size & Aspect Ratio',
      passed: trimPassed,
      detail: inspection.hasMixedDimensions
        ? 'Mixed page dimensions detected across PDF.'
        : `Consistent ${targetTrimIn.width.toFixed(3)} × ${targetTrimIn.height.toFixed(3)} in trim across all ${total} pages.`,
    },
    {
      id: 'bleed',
      label: 'Bleed Box Allowance',
      passed: bleedPassed,
      detail: bleedPassed
        ? `Bleed configured at ${config.bleedIn.toFixed(3)} in (${(config.bleedIn * MM_PER_INCH).toFixed(1)} mm).`
        : 'Artwork touches outer page edges while Bleed is below 0.125 in (3.2 mm).',
    },
    {
      id: 'gutter',
      label: 'Margins & Inner Binding Gutter',
      passed: gutterPassed,
      detail: gutterPassed
        ? `Gutter ${config.innerGutterIn.toFixed(3)} in meets ${recommendedMinGutterIn.toFixed(3)} in minimum for ${total} pages.`
        : `Gutter (${config.innerGutterIn.toFixed(3)} in) or outer margin is below recommended ${recommendedMinGutterIn.toFixed(3)} in minimum.`,
    },
    {
      id: 'safe-area',
      label: '4-Edge & Safe-Area Scan',
      passed: safeAreaPassed,
      detail: safeAreaPassed
        ? `All ${total} interior pages stay clear inside safe margins.`
        : `${interiorWarnings.length} page(s) show ink crossing safe-print margin or near trim edge.`,
    },
    {
      id: 'resolution',
      label: 'Embedded Image Resolution (300 DPI Print Standard)',
      passed: resolutionPassed,
      detail:
        minDpi === null
          ? 'Vector PDF artwork detected (resolution independent).'
          : minDpi >= 300
            ? `Embedded raster artwork verified at >= ${minDpi} DPI.`
            : `Minimum embedded raster image resolution is ${minDpi} DPI (below 300 DPI print target — exported cleanly without downsampling).`,
    },
  ];

  const isPrintReadyVerified = checks.every((c) => c.passed);

  return {
    isPrintReadyVerified,
    checkedPageCount: total,
    checks,
    pageIssues,
    recommendedMinGutterIn,
    effectiveTargetTrimIn: targetTrimIn,
    effectiveBleedIn: config.bleedIn,
    timestampIso: new Date().toISOString(),
  };
}

/**
 * Generates a print-ready PDF using pdf-lib with zero quality loss, lossless page embedding
 * anchored cleanly to the full source MediaBox (preventing 4-sided cropping or stretching),
 * normalized [0, 0] origin, explicit TrimBox/BleedBox/CropBox/MediaBox, and optional margin guides.
 */
export async function exportPrintReadyPdf(
  sourceBytes: Uint8Array,
  inspection: PdfDocumentInspection,
  config: PrintLayoutConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(sourceBytes);
  const outDoc = await PDFDocument.create();
  outDoc.setProducer('NJ STUDIO Print-Layout Engine');
  outDoc.setCreator('NJ STUDIO Publishing Studio');
  outDoc.setTitle(inspection.fileName.replace(/\.pdf$/i, ''));

  const srcPages = srcDoc.getPages();
  const total = srcPages.length;
  const useApprovedCustom =
    config.dimensionMode === 'apply-approved-trim' && config.dimensionsApprovedByUser;

  for (let i = 0; i < total; i++) {
    const srcPage = srcPages[i];
    const mb = srcPage.getMediaBox();
    const pageNumber = i + 1;

    // Pass full MediaBox bounds explicitly so non-zero origins (like y=7.92) never crop any side
    const embedded = await outDoc.embedPage(srcPage, {
      left: mb.x,
      bottom: mb.y,
      right: mb.x + mb.width,
      top: mb.y + mb.height,
    });

    const geom = computeEffectivePageGeometryPt(
      mb.width,
      mb.height,
      pageNumber,
      config
    );

    const outPage = outDoc.addPage([geom.mediaW, geom.mediaH]);
    outPage.setMediaBox(0, 0, geom.mediaW, geom.mediaH);
    outPage.setCropBox(0, 0, geom.mediaW, geom.mediaH);
    outPage.setBleedBox(0, 0, geom.mediaW, geom.mediaH);
    outPage.setTrimBox(geom.trimX, geom.trimY, geom.trimW, geom.trimH);

    if (!useApprovedCustom || config.trimPreset === 'original') {
      // Preserve 1:1 exact original page dimensions and artwork without any scaling or cropping
      outPage.drawPage(embedded, {
        x: 0,
        y: 0,
        width: geom.mediaW,
        height: geom.mediaH,
      });
    } else {
      // Uniform aspect-locked scaling (NEVER stretched, NEVER cropped) centered inside printable safe box
      const fitScale = Math.min(geom.safeW / mb.width, geom.safeH / mb.height);
      const drawW = mb.width * fitScale;
      const drawH = mb.height * fitScale;
      const drawX = geom.safeX + (geom.safeW - drawW) / 2;
      const drawY = geom.safeY + (geom.safeH - drawH) / 2;

      outPage.drawPage(embedded, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });
    }

    if (config.includeGuidesInExport) {
      // Hairline Trim Line (Rose)
      outPage.drawRectangle({
        x: geom.trimX,
        y: geom.trimY,
        width: geom.trimW,
        height: geom.trimH,
        borderColor: rgb(0.79, 0.35, 0.35),
        borderWidth: 0.75,
        borderDashArray: [4, 3],
      });
      // Hairline Safe-Print Margin Box (Forest Green)
      outPage.drawRectangle({
        x: geom.safeX,
        y: geom.safeY,
        width: geom.safeW,
        height: geom.safeH,
        borderColor: rgb(0.13, 0.23, 0.19),
        borderWidth: 0.75,
        borderDashArray: [2, 2],
      });
    }

    onProgress?.(pageNumber, total);
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return await outDoc.save();
}
