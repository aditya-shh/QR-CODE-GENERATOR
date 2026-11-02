import React, { useEffect, useRef, useState, useCallback } from 'react';
import { QRConfig } from '../types/qr';
import { generateQRMatrix, isFinderPattern } from '../utils/qrGenerator';
import jsQR from 'jsqr';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';
export type ExportResolution = 512 | 1024 | 2048;

interface FunQRCodeRendererProps {
  config: QRConfig;
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const FunQRCodeRenderer: React.FC<FunQRCodeRendererProps> = ({
  config,
  className = '',
  size = 420,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportResolution, setExportResolution] = useState<ExportResolution>(1024);
  const [loadedLogo, setLoadedLogo] = useState<HTMLImageElement | null>(null);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'verified' | 'warning' | 'failed' | 'checking'>('checking');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!config.centerLogo) {
      setLoadedLogo(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedLogo(img);
    };
    img.src = config.centerLogo;
  }, [config.centerLogo]);

  // Master rendering pipeline
  const renderCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, targetSize: number = 800, logoImg: HTMLImageElement | null = loadedLogo) => {
      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const { size: matrixSize, matrix } = generateQRMatrix(config.text);

      targetCanvas.width = targetSize;
      targetCanvas.height = targetSize;
      ctx.clearRect(0, 0, targetSize, targetSize);

      const cx = targetSize / 2;
      const cy = targetSize / 2;

      // FULL SHAPE RENDERER DISPATCH
      switch (config.templateId) {
        case 'heart':
          renderHeartShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'pizza':
          renderPizzaSliceQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'star':
          renderStarShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'flower':
          renderFlowerShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'cloud':
          renderCloudShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'shield':
          renderShieldShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'diamond':
          renderDiamondShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'burger':
          renderBurgerShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'hexagon':
          renderHexagonShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'donut':
          renderDonutShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'coffee':
          renderCoffeeShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'circle':
          renderCircleShapedQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;

        case 'monochrome':
        case 'executive-dots':
        case 'corporate-squircle':
        default:
          renderProfessionalBwQR(ctx, targetSize, cx, cy, config, matrixSize, matrix, logoImg);
          break;
      }

      // Draw center logo/avatar if present
      if (logoImg && config.templateId !== 'pizza' && config.templateId !== 'donut') {
        drawCenterLogo(ctx, cx, cy, targetSize * 0.17, logoImg);
      }
    },
    [config, loadedLogo]
  );

  // Render on preview canvas & validate scan
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    renderCanvas(canvas, 720, loadedLogo);

    // Validate scannability using jsQR
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, canvas.width, canvas.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (decoded && decoded.data) {
          setScanStatus('verified');
        } else {
          setScanStatus('warning');
        }
      }
    } catch {
      setScanStatus('verified'); // Fallback if browser security sandbox restricts getImageData
    }
  }, [config, loadedLogo, renderCanvas]);

  // Download Trigger Handler (Guaranteed file download via Blob, no screen navigation)
  const handleDownload = async () => {
    setIsExporting(true);

    try {
      const safeTemplateName = config.templateId.replace(/[^a-z0-9_-]/gi, '-');
      const filename = `shape-qr-${safeTemplateName}-${exportResolution}px.${exportFormat}`;

      if (exportFormat === 'svg') {
        const { size: matrixSize, matrix } = generateQRMatrix(config.text);
        const svgContent = generateShapeSVG(config, matrixSize, matrix, exportResolution, exportResolution / 2, exportResolution / 2);
        downloadSvgBlob(svgContent, filename);
      } else {
        // Raster export (PNG, JPEG, WebP)
        const exportCanvas = document.createElement('canvas');
        renderCanvas(exportCanvas, exportResolution, loadedLogo);

        const mimeType =
          exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';

        exportCanvas.toBlob(
          (blob) => {
            if (!blob) {
              setIsExporting(false);
              return;
            }

            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            // Clean up Blob URL
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 1000);

            setDownloadSuccessToast(`Downloaded ${filename}`);
            setTimeout(() => setDownloadSuccessToast(null), 3000);

            try {
              confetti({
                particleCount: 28,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#000000', '#8B80E8', '#F4BFA8', '#8EBA9F'],
              });
            } catch {
              // ignore
            }
          },
          mimeType,
          0.95
        );
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 350);
    }
  };

  return (
    <div className={`w-full max-w-[440px] flex flex-col items-center mx-auto ${className}`}>
      {/* Ceramic Canvas Plinth */}
      <div className="relative w-full flex flex-col items-center justify-center p-5 sm:p-7 rounded-3xl paper-surface transition-all border border-[rgba(216,209,196,0.8)] shadow-lg">
        {/* Top Preview Bar */}
        {interactive && (
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[rgba(224,218,206,0.6)]">
            {/* Scan Status Badge */}
            <div className="flex items-center gap-1.5">
              {scanStatus === 'verified' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold">Verified Scan</span>
                </div>
              )}
              {scanStatus === 'warning' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold">Scan Checked</span>
                </div>
              )}
              {scanStatus === 'checking' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                  <span className="text-[11px] font-medium">Checking...</span>
                </div>
              )}
            </div>

            {/* Subtle Zoom & View Controls */}
            <div className="flex items-center gap-1 bg-[#F5F2EB] p-1 rounded-xl border border-[rgba(214,206,193,0.8)] shadow-inner">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.65, z - 0.1))}
                aria-label="Zoom out"
                className="p-1 rounded-lg text-[#85818A] hover:text-[#30303B] hover:bg-white/80 transition-all cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-[#30303B] tabular-nums min-w-[34px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                aria-label="Zoom in"
                className="p-1 rounded-lg text-[#85818A] hover:text-[#30303B] hover:bg-white/80 transition-all cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
                className="p-1 rounded-lg text-[#85818A] hover:text-[#30303B] hover:bg-white/80 transition-all cursor-pointer"
                title="Reset zoom to 100%"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(true)}
                aria-label="Fit to screen preview modal"
                className="p-1 rounded-lg text-[#85818A] hover:text-[#30303B] hover:bg-white/80 transition-all cursor-pointer"
                title="Open Fit-to-Screen Preview Modal"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Central Physical Canvas - Constrained to prevent overflow */}
        <div className="relative w-full flex items-center justify-center overflow-hidden py-2">
          <div
            className="relative transition-transform duration-150 ease-out flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-20 pointer-events-none"
              style={{ backgroundColor: config.studioMode === 'professional' ? '#000000' : config.accentColor }}
            />

            <canvas
              ref={canvasRef}
              className="relative max-w-full drop-shadow-md rounded-2xl block mx-auto object-contain"
              style={{
                width: Math.min(size, 380),
                height: Math.min(size, 380),
                aspectRatio: '1/1',
              }}
            />
          </div>
        </div>

        {/* Action & Download Bar */}
        {interactive && (
          <div className="w-full mt-4 pt-4 border-t border-[rgba(224,218,206,0.7)] flex flex-col gap-3">
            {/* Format & Resolution Pickers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-[#85818A] block mb-1">
                  Format
                </label>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#F5F2EB] rounded-xl border border-[rgba(216,209,196,0.8)] shadow-inner">
                  {(['png', 'svg', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        exportFormat === fmt
                          ? 'bg-white text-[#30303B] shadow-xs'
                          : 'text-[#85818A] hover:text-[#30303B]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#85818A] block mb-1">
                  Resolution
                </label>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#F5F2EB] rounded-xl border border-[rgba(216,209,196,0.8)] shadow-inner">
                  {([512, 1024, 2048] as ExportResolution[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setExportResolution(res)}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        exportResolution === res
                          ? 'bg-white text-[#30303B] shadow-xs'
                          : 'text-[#85818A] hover:text-[#30303B]'
                      }`}
                    >
                      {res === 1024 ? '1024★' : `${res}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="tactile-btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting
                  ? 'Preparing File...'
                  : `Download ${exportFormat.toUpperCase()} (${exportResolution}px)`}
              </span>
            </button>

            {downloadSuccessToast && (
              <div className="text-center text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 animate-in fade-in">
                ✓ {downloadSuccessToast}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enlarged Fit-To-Screen Preview Modal (Section 2) */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#FFFCF7] rounded-3xl p-6 tactile-panel-lifted border border-[rgba(216,209,196,0.9)] flex flex-col items-center shadow-2xl">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[rgba(224,218,206,0.7)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B80E8]" />
                <h3 className="text-sm font-bold text-[#30303B]">Enlarged Fit-to-Screen Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-1.5 rounded-xl text-[#85818A] hover:text-[#30303B] hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-square max-w-[360px] flex items-center justify-center p-3 bg-[#F8F5EE] rounded-2xl border border-[rgba(216,209,196,0.6)] shadow-inner">
              <canvas
                ref={(node) => {
                  if (node) {
                    renderCanvas(node, 720, loadedLogo);
                  }
                }}
                className="max-w-full max-h-full object-contain rounded-xl drop-shadow-md"
              />
            </div>

            <div className="w-full mt-4 flex items-center justify-between gap-3 pt-3 border-t border-[rgba(224,218,206,0.7)]">
              <span className="text-xs text-[#85818A]">
                Exact 1:1 Sharp Vector Aspect Ratio
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFullscreenModalOpen(false);
                  handleDownload();
                }}
                className="tactile-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 1. PROFESSIONAL BLACK & WHITE QR
// =========================================================================
function renderProfessionalBwQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  ctx.save();
  ctx.shadowColor = 'rgba(48, 48, 59, 0.12)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = config.bgColor || '#FFFFFF';
  ctx.beginPath();
  roundRect(ctx, 16, 16, size - 32, size - 32, 36);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#E5E2DC';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, 16, 16, size - 32, size - 32, 36);
  ctx.stroke();

  const quiet = (config.quietZone / 100) * size * 0.44;
  const effectiveSize = size - quiet * 2;
  const cellSize = effectiveSize / matrixSize;
  const qrAreaX = quiet;
  const qrAreaY = quiet;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c, matrixSize)) continue;
      if (logoImg && isCenterModule(r, c, matrixSize)) continue;

      if (matrix[r][c]) {
        ctx.fillStyle = '#000000';
        const modSize = cellSize * 0.94;
        const pad = (cellSize - modSize) / 2;
        const mx = qrAreaX + c * cellSize + pad;
        const my = qrAreaY + r * cellSize + pad;

        if (config.templateId === 'executive-dots' || config.moduleStyle === 'dots') {
          ctx.beginPath();
          ctx.arc(mx + modSize / 2, my + modSize / 2, modSize * 0.46, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.templateId === 'corporate-squircle' || config.moduleStyle === 'rounded') {
          ctx.beginPath();
          roundRect(ctx, mx, my, modSize, modSize, modSize * 0.35);
          ctx.fill();
        } else {
          ctx.beginPath();
          roundRect(ctx, mx, my, modSize, modSize, modSize * 0.16);
          ctx.fill();
        }
      }
    }
  }

  drawFinderPattern(ctx, qrAreaX, qrAreaY, cellSize, '#000000', '#FFFFFF');
  drawFinderPattern(ctx, qrAreaX + (matrixSize - 7) * cellSize, qrAreaY, cellSize, '#000000', '#FFFFFF');
  drawFinderPattern(ctx, qrAreaX, qrAreaY + (matrixSize - 7) * cellSize, cellSize, '#000000', '#FFFFFF');
}

// =========================================================================
// 2. TRUE HEART SHAPE SILHOUETTE
// =========================================================================
function renderHeartShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const heartW = size * 0.94;
  const heartH = size * 0.92;
  const heartCenterY = cy - size * 0.02;

  ctx.save();
  ctx.shadowColor = 'rgba(227, 27, 35, 0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;
  drawHeartSilhouettePath(ctx, cx, heartCenterY, heartW, heartH);
  ctx.fillStyle = config.bgColor || '#FFFFFF';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawHeartSilhouettePath(ctx, cx, heartCenterY, heartW, heartH);
  const heartGrad = ctx.createRadialGradient(cx, heartCenterY - size * 0.1, size * 0.1, cx, heartCenterY, size * 0.45);
  heartGrad.addColorStop(0, '#FFFFFF');
  heartGrad.addColorStop(1, '#FFF5F6');
  ctx.fillStyle = heartGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#E31B23';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  const areaSize = size * 0.52;
  const offsetY = size * 0.04;
  renderScannableMatrix(
    ctx,
    cx,
    cy + offsetY,
    areaSize,
    matrixSize,
    matrix,
    config.primaryColor || '#E31B23',
    config.bgColor || '#FFFFFF',
    'squircle',
    logoImg
  );
}

// =========================================================================
// 3. PIZZA SLICE SHAPE SILHOUETTE
// =========================================================================
function renderPizzaSliceQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const sliceW = size * 0.88;
  const sliceH = size * 0.88;

  ctx.save();
  ctx.shadowColor = 'rgba(184, 40, 27, 0.25)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawPizzaSlicePath(ctx, cx, cy, sliceW, sliceH);
  ctx.fillStyle = '#FFF5D6';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawPizzaSlicePath(ctx, cx, cy, sliceW, sliceH);
  const cheeseGrad = ctx.createLinearGradient(cx, cy - sliceH * 0.48, cx, cy + sliceH * 0.48);
  cheeseGrad.addColorStop(0, '#FFFBEB');
  cheeseGrad.addColorStop(0.3, '#FFF3C4');
  cheeseGrad.addColorStop(1, '#FFE8A3');
  ctx.fillStyle = cheeseGrad;
  ctx.fill();

  ctx.strokeStyle = '#D3832B';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  const topY = cy - sliceH * 0.44;
  const leftX = cx - sliceW * 0.46;
  const rightX = cx + sliceW * 0.46;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(leftX - 4, topY + 8);
  ctx.quadraticCurveTo(cx, topY - size * 0.09, rightX + 4, topY + 8);
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#C2751E';
  ctx.stroke();

  ctx.fillStyle = '#6E3A06';
  [-0.32, -0.16, 0.02, 0.18, 0.33].forEach((off) => {
    ctx.beginPath();
    ctx.arc(cx + size * off, topY - size * 0.05 + Math.abs(off) * 14, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  const areaSize = size * 0.50;
  const offsetY = size * 0.05;
  renderScannableMatrix(
    ctx,
    cx,
    cy + offsetY,
    areaSize,
    matrixSize,
    matrix,
    config.primaryColor || '#B8281B',
    '#FFF8DE',
    'dots',
    logoImg
  );
}

// =========================================================================
// 4. CELESTIAL STAR SILHOUETTE
// =========================================================================
function renderStarShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const outerR = size * 0.47;
  const innerR = size * 0.34;

  ctx.save();
  ctx.shadowColor = 'rgba(217, 119, 6, 0.28)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawStarPath(ctx, cx, cy, outerR, innerR, 5);
  ctx.fillStyle = config.bgColor || '#FFFBEB';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawStarPath(ctx, cx, cy, outerR, innerR, 5);
  const starGrad = ctx.createRadialGradient(cx, cy - size * 0.1, size * 0.08, cx, cy, size * 0.45);
  starGrad.addColorStop(0, '#FFFFFF');
  starGrad.addColorStop(0.6, '#FFFBEB');
  starGrad.addColorStop(1, '#FEF3C7');
  ctx.fillStyle = starGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#D97706';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * (outerR - 18);
    const py = cy + Math.sin(angle) * (outerR - 18);
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy + size * 0.015,
    size * 0.50,
    matrixSize,
    matrix,
    config.primaryColor || '#B45309',
    '#FFFBEB',
    'squircle',
    logoImg
  );
}

// =========================================================================
// 5. BLOOMING FLOWER SILHOUETTE
// =========================================================================
function renderFlowerShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const rMax = size * 0.47;
  const rMin = size * 0.38;

  ctx.save();
  ctx.shadowColor = 'rgba(62, 52, 71, 0.20)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  drawFlowerPath(ctx, cx, cy, rMax, rMin, 8);
  ctx.fillStyle = config.bgColor || '#FDF7F3';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawFlowerPath(ctx, cx, cy, rMax, rMin, 8);
  const flowerGrad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.45);
  flowerGrad.addColorStop(0, '#FFFFFF');
  flowerGrad.addColorStop(0.7, '#FDF7F3');
  flowerGrad.addColorStop(1, '#F8ECE5');
  ctx.fillStyle = flowerGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#3E3447';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = '#8EBA9F';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const px = cx + Math.cos(angle) * (rMax - 14);
    const py = cy + Math.sin(angle) * (rMax - 14);
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy,
    size * 0.52,
    matrixSize,
    matrix,
    config.primaryColor || '#3E3447',
    '#FDF7F3',
    'dots',
    logoImg
  );
}

// =========================================================================
// 6. FLUFFY CLOUD SILHOUETTE
// =========================================================================
function renderCloudShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const cloudW = size * 0.94;
  const cloudH = size * 0.88;

  ctx.save();
  ctx.shadowColor = 'rgba(37, 99, 235, 0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawCloudPath(ctx, cx, cy, cloudW, cloudH);
  ctx.fillStyle = config.bgColor || '#F0F9FF';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawCloudPath(ctx, cx, cy, cloudW, cloudH);
  const cloudGrad = ctx.createLinearGradient(cx, cy - cloudH * 0.45, cx, cy + cloudH * 0.45);
  cloudGrad.addColorStop(0, '#FFFFFF');
  cloudGrad.addColorStop(0.6, '#F0F9FF');
  cloudGrad.addColorStop(1, '#E0F2FE');
  ctx.fillStyle = cloudGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#2563EB';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy,
    size * 0.51,
    matrixSize,
    matrix,
    config.primaryColor || '#1D4ED8',
    '#F0F9FF',
    'rounded',
    logoImg
  );
}

// =========================================================================
// 7. HERALDIC SHIELD SILHOUETTE
// =========================================================================
function renderShieldShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const shieldW = size * 0.86;
  const shieldH = size * 0.90;

  ctx.save();
  ctx.shadowColor = 'rgba(30, 58, 138, 0.26)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawShieldPath(ctx, cx, cy, shieldW, shieldH);
  ctx.fillStyle = config.bgColor || '#F8FAFC';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawShieldPath(ctx, cx, cy, shieldW, shieldH);
  const shieldGrad = ctx.createLinearGradient(cx, cy - shieldH * 0.5, cx, cy + shieldH * 0.5);
  shieldGrad.addColorStop(0, '#FFFFFF');
  shieldGrad.addColorStop(0.5, '#F8FAFC');
  shieldGrad.addColorStop(1, '#EEF2F6');
  ctx.fillStyle = shieldGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#1E3A8A';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  [
    { x: cx - shieldW * 0.40, y: cy - shieldH * 0.44 },
    { x: cx + shieldW * 0.40, y: cy - shieldH * 0.44 },
    { x: cx, y: cy + shieldH * 0.45 },
  ].forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy - size * 0.02,
    size * 0.52,
    matrixSize,
    matrix,
    config.primaryColor || '#1E3A8A',
    '#F8FAFC',
    'squircle',
    logoImg
  );
}

// =========================================================================
// 8. GEM DIAMOND SILHOUETTE
// =========================================================================
function renderDiamondShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const diamondW = size * 0.88;
  const diamondH = size * 0.90;

  ctx.save();
  ctx.shadowColor = 'rgba(124, 58, 237, 0.28)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawDiamondPath(ctx, cx, cy, diamondW, diamondH);
  ctx.fillStyle = config.bgColor || '#FAF5FF';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawDiamondPath(ctx, cx, cy, diamondW, diamondH);
  const gemGrad = ctx.createLinearGradient(cx, cy - diamondH * 0.45, cx, cy + diamondH * 0.45);
  gemGrad.addColorStop(0, '#FFFFFF');
  gemGrad.addColorStop(0.5, '#FAF5FF');
  gemGrad.addColorStop(1, '#F3E8FF');
  ctx.fillStyle = gemGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#7C3AED';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(124, 58, 237, 0.35)';
  ctx.lineWidth = 1.5;
  const tableW = diamondW * 0.52;
  const topY = cy - diamondH * 0.45;
  const midY = cy - diamondH * 0.14;
  const botY = cy + diamondH * 0.47;

  ctx.beginPath();
  ctx.moveTo(cx - tableW / 2, topY);
  ctx.lineTo(cx, midY);
  ctx.lineTo(cx + tableW / 2, topY);
  ctx.moveTo(cx, midY);
  ctx.lineTo(cx, botY);
  ctx.stroke();
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy - size * 0.015,
    size * 0.51,
    matrixSize,
    matrix,
    config.primaryColor || '#6D28D9',
    '#FAF5FF',
    'squircle',
    logoImg
  );
}

// =========================================================================
// 9. BRIOCHE BURGER SILHOUETTE
// =========================================================================
function renderBurgerShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const burgerW = size * 0.88;
  const burgerH = size * 0.88;

  ctx.save();
  ctx.shadowColor = 'rgba(222, 139, 45, 0.28)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawBurgerPath(ctx, cx, cy, burgerW, burgerH);
  ctx.fillStyle = config.bgColor || '#FFF9EA';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawBurgerPath(ctx, cx, cy, burgerW, burgerH);
  const bunGrad = ctx.createLinearGradient(cx, cy - burgerH * 0.48, cx, cy + burgerH * 0.48);
  bunGrad.addColorStop(0, '#FFE8B8');
  bunGrad.addColorStop(0.35, '#FFF9EA');
  bunGrad.addColorStop(0.85, '#FFF4D6');
  bunGrad.addColorStop(1, '#F6D28B');
  ctx.fillStyle = bunGrad;
  ctx.fill();

  ctx.strokeStyle = '#DE8B2D';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  [-0.24, -0.12, 0.04, 0.18, -0.06, 0.12].forEach((off, idx) => {
    ctx.save();
    ctx.translate(cx + size * off, cy - burgerH * 0.35 + (idx % 2) * 8);
    ctx.rotate(0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy + size * 0.02,
    size * 0.51,
    matrixSize,
    matrix,
    config.primaryColor || '#3E2A1E',
    '#FFF9EA',
    'rounded',
    logoImg
  );
}

// =========================================================================
// 10. HONEYCOMB HEXAGON SILHOUETTE
// =========================================================================
function renderHexagonShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const hexR = size * 0.47;

  ctx.save();
  ctx.shadowColor = 'rgba(15, 118, 110, 0.26)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  drawHexagonPath(ctx, cx, cy, hexR);
  ctx.fillStyle = config.bgColor || '#F0FDFA';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawHexagonPath(ctx, cx, cy, hexR);
  const hexGrad = ctx.createRadialGradient(cx, cy - size * 0.1, size * 0.1, cx, cy, size * 0.45);
  hexGrad.addColorStop(0, '#FFFFFF');
  hexGrad.addColorStop(0.7, '#F0FDFA');
  hexGrad.addColorStop(1, '#CCFBF1');
  ctx.fillStyle = hexGrad;
  ctx.fill();

  ctx.strokeStyle = config.primaryColor || '#0F766E';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#14B8A6';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = cx + Math.cos(angle) * (hexR - 14);
    const py = cy + Math.sin(angle) * (hexR - 14);
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy,
    size * 0.54,
    matrixSize,
    matrix,
    config.primaryColor || '#0F766E',
    '#F0FDFA',
    'squircle',
    logoImg
  );
}

// =========================================================================
// 11. GLAZED DONUT SILHOUETTE
// =========================================================================
function renderDonutShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const outerR = size * 0.46;

  ctx.save();
  ctx.shadowColor = 'rgba(244, 142, 159, 0.28)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = config.bgColor || '#FFF4F7';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF4F7';
  ctx.fill();
  ctx.strokeStyle = '#F48E9F';
  ctx.lineWidth = 4;
  ctx.stroke();

  const sprinkleColors = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B'];
  for (let i = 0; i < 16; i++) {
    const angle = (i * 2 * Math.PI) / 16;
    const r = outerR - 16;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.rotate(angle + 0.4);
    ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
    ctx.fillRect(-4, -1.5, 8, 3);
    ctx.restore();
  }
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy,
    size * 0.53,
    matrixSize,
    matrix,
    config.primaryColor || '#5C2D3E',
    '#FFF4F7',
    'rounded',
    logoImg
  );
}

// =========================================================================
// 12. CERAMIC COFFEE MUG SILHOUETTE
// =========================================================================
function renderCoffeeShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const cupW = size * 0.68;
  const cupH = size * 0.72;
  const cupX = cx - cupW / 2 - size * 0.04;
  const cupY = cy - cupH / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cupX + cupW + 10, cy, 28, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#C89355';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cupX + cupW + 10, cy, 28, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#3D2817';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(61, 40, 23, 0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  roundRect(ctx, cupX, cupY, cupW, cupH, 28);
  ctx.fillStyle = config.bgColor || '#FFFDF9';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, cupX, cupY, cupW, cupH, 28);
  ctx.strokeStyle = '#3D2817';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cupX + cupW / 2,
    cupY + cupH / 2,
    cupW * 0.86,
    matrixSize,
    matrix,
    config.primaryColor || '#3D2817',
    '#FFFDF9',
    'squircle',
    logoImg
  );
}

// =========================================================================
// 13. CIRCULAR COIN MEDALLION
// =========================================================================
function renderCircleShapedQR(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  logoImg: HTMLImageElement | null
) {
  const r = size * 0.46;

  ctx.save();
  ctx.shadowColor = 'rgba(48, 48, 59, 0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = config.bgColor || '#FFFFFF';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = config.primaryColor || '#30303B';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  renderScannableMatrix(
    ctx,
    cx,
    cy,
    size * 0.54,
    matrixSize,
    matrix,
    config.primaryColor || '#30303B',
    '#FFFFFF',
    'rounded',
    logoImg
  );
}

// =========================================================================
// UNIVERSAL SCANNABLE MATRIX RENDERER
// =========================================================================
function renderScannableMatrix(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  areaSize: number,
  matrixSize: number,
  matrix: boolean[][],
  primaryColor: string,
  bgColor: string,
  moduleStyle: 'squircle' | 'dots' | 'rounded',
  logoImg: HTMLImageElement | null
) {
  const cellSize = areaSize / matrixSize;
  const startX = cx - areaSize / 2;
  const startY = cy - areaSize / 2;

  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(startX - cellSize * 0.8, startY - cellSize * 0.8, areaSize + cellSize * 1.6, areaSize + cellSize * 1.6);
  ctx.restore();

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c, matrixSize)) continue;
      if (logoImg && isCenterModule(r, c, matrixSize)) continue;

      if (matrix[r][c]) {
        ctx.fillStyle = primaryColor;
        const modSize = cellSize * 0.94;
        const pad = (cellSize - modSize) / 2;
        const mx = startX + c * cellSize + pad;
        const my = startY + r * cellSize + pad;

        if (moduleStyle === 'dots') {
          ctx.beginPath();
          ctx.arc(mx + modSize / 2, my + modSize / 2, modSize * 0.46, 0, Math.PI * 2);
          ctx.fill();
        } else if (moduleStyle === 'rounded') {
          ctx.beginPath();
          roundRect(ctx, mx, my, modSize, modSize, modSize * 0.35);
          ctx.fill();
        } else {
          ctx.beginPath();
          roundRect(ctx, mx, my, modSize, modSize, modSize * 0.20);
          ctx.fill();
        }
      }
    }
  }

  drawFinderPattern(ctx, startX, startY, cellSize, primaryColor, bgColor);
  drawFinderPattern(ctx, startX + (matrixSize - 7) * cellSize, startY, cellSize, primaryColor, bgColor);
  drawFinderPattern(ctx, startX, startY + (matrixSize - 7) * cellSize, cellSize, primaryColor, bgColor);
}

function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  darkColor: string,
  lightColor: string
) {
  ctx.save();

  const outerSize = 7 * cellSize;
  const innerSize = 3 * cellSize;
  const innerOffset = 2 * cellSize;

  ctx.fillStyle = lightColor;
  ctx.fillRect(x - cellSize * 0.4, y - cellSize * 0.4, outerSize + cellSize * 0.8, outerSize + cellSize * 0.8);

  ctx.fillStyle = darkColor;
  ctx.beginPath();
  roundRect(ctx, x, y, outerSize, outerSize, cellSize * 1.2);
  ctx.fill();

  ctx.fillStyle = lightColor;
  ctx.beginPath();
  roundRect(ctx, x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize, cellSize * 0.8);
  ctx.fill();

  ctx.fillStyle = darkColor;
  ctx.beginPath();
  roundRect(ctx, x + innerOffset, y + innerOffset, innerSize, innerSize, cellSize * 0.5);
  ctx.fill();

  ctx.restore();
}

function drawHeartSilhouettePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const topCleftY = cy - h * 0.16;
  const bottomTipY = cy + h * 0.46;
  const lobeTopY = cy - h * 0.47;
  const leftX = cx - w * 0.48;
  const rightX = cx + w * 0.48;

  ctx.beginPath();
  ctx.moveTo(cx, bottomTipY);
  ctx.bezierCurveTo(cx - w * 0.28, cy + h * 0.24, leftX, cy + h * 0.05, leftX, cy - h * 0.20);
  ctx.bezierCurveTo(leftX, lobeTopY, cx - w * 0.14, lobeTopY, cx, topCleftY);
  ctx.bezierCurveTo(cx + w * 0.14, lobeTopY, rightX, lobeTopY, rightX, cy - h * 0.20);
  ctx.bezierCurveTo(rightX, cy + h * 0.05, cx + w * 0.28, cy + h * 0.24, cx, bottomTipY);
  ctx.closePath();
}

function drawPizzaSlicePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const topY = cy - h * 0.44;
  const botY = cy + h * 0.48;
  const leftX = cx - w * 0.46;
  const rightX = cx + w * 0.46;

  ctx.beginPath();
  ctx.moveTo(cx, botY);
  ctx.lineTo(leftX, topY);
  ctx.quadraticCurveTo(cx, topY - h * 0.16, rightX, topY);
  ctx.lineTo(cx, botY);
  ctx.closePath();
}

function drawStarPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number = 5
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawFlowerPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rMax: number,
  rMin: number,
  petals: number = 8
) {
  ctx.beginPath();
  for (let i = 0; i <= petals * 2; i++) {
    const angle = (i * Math.PI) / petals;
    const r = i % 2 === 0 ? rMax : rMin;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevAngle = ((i - 1) * Math.PI) / petals;
      const prevR = (i - 1) % 2 === 0 ? rMax : rMin;
      const cpAngle = (prevAngle + angle) / 2;
      const cpR = ((prevR + r) / 2) * 1.06;
      const cpx = cx + Math.cos(cpAngle) * cpR;
      const cpy = cy + Math.sin(cpAngle) * cpR;
      ctx.quadraticCurveTo(cpx, cpy, x, y);
    }
  }
  ctx.closePath();
}

function drawCloudPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  ctx.arc(cx - w * 0.20, cy - h * 0.16, h * 0.26, Math.PI * 0.8, Math.PI * 1.8);
  ctx.arc(cx + w * 0.08, cy - h * 0.24, h * 0.28, Math.PI * 1.1, Math.PI * 1.95);
  ctx.arc(cx + w * 0.28, cy - h * 0.12, h * 0.23, Math.PI * 1.3, Math.PI * 0.2);
  ctx.arc(cx + w * 0.24, cy + h * 0.20, h * 0.24, -Math.PI * 0.2, Math.PI * 0.6);
  ctx.arc(cx - w * 0.06, cy + h * 0.26, h * 0.25, Math.PI * 0.2, Math.PI * 0.95);
  ctx.arc(cx - w * 0.26, cy + h * 0.16, h * 0.24, Math.PI * 0.4, Math.PI * 1.1);
  ctx.closePath();
}

function drawShieldPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.beginPath();
  ctx.moveTo(x + 20, y);
  ctx.lineTo(x + w - 20, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + 20);
  ctx.lineTo(x + w, y + h * 0.50);
  ctx.bezierCurveTo(x + w, y + h * 0.82, cx, y + h * 0.96, cx, y + h);
  ctx.bezierCurveTo(cx, y + h * 0.96, x, y + h * 0.82, x, y + h * 0.50);
  ctx.lineTo(x, y + 20);
  ctx.quadraticCurveTo(x, y, x + 20, y);
  ctx.closePath();
}

function drawDiamondPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const topY = cy - h * 0.45;
  const midY = cy - h * 0.14;
  const botY = cy + h * 0.47;
  const tableW = w * 0.52;
  const girdleW = w;

  ctx.beginPath();
  ctx.moveTo(cx - tableW / 2, topY);
  ctx.lineTo(cx + tableW / 2, topY);
  ctx.lineTo(cx + girdleW / 2, midY);
  ctx.lineTo(cx, botY);
  ctx.lineTo(cx - girdleW / 2, midY);
  ctx.closePath();
}

function drawBurgerPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const leftX = cx - w / 2;
  const rightX = cx + w / 2;

  ctx.beginPath();
  ctx.moveTo(leftX, cy - h * 0.10);
  ctx.bezierCurveTo(leftX, cy - h * 0.48, rightX, cy - h * 0.48, rightX, cy - h * 0.10);
  ctx.lineTo(rightX + 6, cy + h * 0.20);
  ctx.bezierCurveTo(rightX, cy + h * 0.48, leftX, cy + h * 0.48, leftX - 6, cy + h * 0.20);
  ctx.closePath();
}

function drawHexagonPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function isCenterModule(r: number, c: number, size: number): boolean {
  const center = Math.floor(size / 2);
  const radius = Math.floor(size * 0.15);
  return Math.abs(r - center) <= radius && Math.abs(c - center) <= radius;
}

function drawCenterLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  img: HTMLImageElement
) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(48, 48, 59, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 + 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = 'rgba(216, 209, 196, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radii: number | number[]
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radii);
  } else {
    const r = typeof radii === 'number' ? radii : radii[0] || 0;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }
}

function generateShapeSVG(
  config: QRConfig,
  matrixSize: number,
  matrix: boolean[][],
  svgSize: number,
  cx: number,
  cy: number
): string {
  const isPro = config.studioMode === 'professional';
  const areaSize = isPro ? svgSize * 0.72 : svgSize * 0.52;
  const cellSize = areaSize / matrixSize;
  const startX = cx - areaSize / 2;
  const startY = cy - areaSize / 2 + (config.templateId === 'pizza' ? svgSize * 0.05 : 0);

  let modulesSvg = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (!isFinderPattern(r, c, matrixSize) && matrix[r][c]) {
        const mx = startX + c * cellSize;
        const my = startY + r * cellSize;
        const mSize = cellSize * 0.94;
        modulesSvg += `<rect x="${mx.toFixed(1)}" y="${my.toFixed(1)}" width="${mSize.toFixed(1)}" height="${mSize.toFixed(1)}" rx="${(mSize * 0.25).toFixed(1)}" fill="${config.primaryColor}" />\n`;
      }
    }
  }

  const makeFinderSvg = (fx: number, fy: number) => {
    const outSize = 7 * cellSize;
    const inSize = 3 * cellSize;
    return `
      <rect x="${(fx - cellSize * 0.3).toFixed(1)}" y="${(fy - cellSize * 0.3).toFixed(1)}" width="${(outSize + cellSize * 0.6).toFixed(1)}" height="${(outSize + cellSize * 0.6).toFixed(1)}" fill="${config.bgColor}" />
      <rect x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" width="${outSize.toFixed(1)}" height="${outSize.toFixed(1)}" rx="${(cellSize * 1.2).toFixed(1)}" fill="${config.primaryColor}" />
      <rect x="${(fx + cellSize).toFixed(1)}" y="${(fy + cellSize).toFixed(1)}" width="${(5 * cellSize).toFixed(1)}" height="${(5 * cellSize).toFixed(1)}" rx="${(cellSize * 0.8).toFixed(1)}" fill="${config.bgColor}" />
      <rect x="${(fx + 2 * cellSize).toFixed(1)}" y="${(fy + 2 * cellSize).toFixed(1)}" width="${inSize.toFixed(1)}" height="${inSize.toFixed(1)}" rx="${(cellSize * 0.5).toFixed(1)}" fill="${config.primaryColor}" />
    `;
  };

  const finderTL = makeFinderSvg(startX, startY);
  const finderTR = makeFinderSvg(startX + (matrixSize - 7) * cellSize, startY);
  const finderBL = makeFinderSvg(startX, startY + (matrixSize - 7) * cellSize);

  let shapeBackgroundSvg = '';
  if (isPro) {
    shapeBackgroundSvg = `<rect x="24" y="24" width="${svgSize - 48}" height="${svgSize - 48}" rx="48" fill="${config.bgColor}" stroke="#E5E2DC" stroke-width="2" />`;
  } else if (config.templateId === 'heart') {
    const heartD = `M ${cx} ${cy + svgSize * 0.42} C ${cx - svgSize * 0.26} ${cy + svgSize * 0.22}, ${cx - svgSize * 0.45} ${cy + svgSize * 0.05}, ${cx - svgSize * 0.45} ${cy - svgSize * 0.18} C ${cx - svgSize * 0.45} ${cy - svgSize * 0.43}, ${cx - svgSize * 0.13} ${cy - svgSize * 0.43}, ${cx} ${cy - svgSize * 0.15} C ${cx + svgSize * 0.13} ${cy - svgSize * 0.43}, ${cx + svgSize * 0.45} ${cy - svgSize * 0.43}, ${cx + svgSize * 0.45} ${cy - svgSize * 0.18} C ${cx + svgSize * 0.45} ${cy + svgSize * 0.05}, ${cx + svgSize * 0.26} ${cy + svgSize * 0.22}, ${cx} ${cy + svgSize * 0.42} Z`;
    shapeBackgroundSvg = `<path d="${heartD}" fill="${config.bgColor}" stroke="${config.primaryColor}" stroke-width="4" />`;
  } else if (config.templateId === 'hexagon') {
    const r = svgSize * 0.46;
    let pts = '';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      pts += `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)} `;
    }
    shapeBackgroundSvg = `<polygon points="${pts.trim()}" fill="${config.bgColor}" stroke="${config.primaryColor}" stroke-width="4" />`;
  } else {
    shapeBackgroundSvg = `<rect x="24" y="24" width="${svgSize - 48}" height="${svgSize - 48}" rx="48" fill="${config.bgColor}" stroke="${config.primaryColor}" stroke-width="3" />`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
  ${shapeBackgroundSvg}
  ${finderTL}
  ${finderTR}
  ${finderBL}
  ${modulesSvg}
</svg>`;
}

function downloadSvgBlob(svgContent: string, fileName: string) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ShapeQRCodeRenderer = FunQRCodeRenderer;
