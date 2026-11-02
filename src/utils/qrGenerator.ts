import QRCode from 'qrcode';

export interface QRModuleData {
  size: number;
  matrix: boolean[][];
  raw: any;
}

/**
 * Generates the raw QR boolean matrix with high error correction (Level H - 30% recovery)
 */
export function generateQRMatrix(text: string): QRModuleData {
  try {
    const qr = QRCode.create(text || 'https://funshapeqr.studio', {
      errorCorrectionLevel: 'H',
    });

    const size = qr.modules.size;
    const matrix: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(qr.modules.get(r, c)));
      }
      matrix.push(row);
    }

    return { size, matrix, raw: qr };
  } catch (err) {
    console.error('Error generating QR matrix:', err);
    const fallbackSize = 21;
    const fallbackMatrix: boolean[][] = Array.from({ length: fallbackSize }, () =>
      Array.from({ length: fallbackSize }, () => Math.random() > 0.5)
    );
    return { size: fallbackSize, matrix: fallbackMatrix, raw: null };
  }
}

/**
 * Checks if a given row/column is within the 3 standard QR finder patterns
 */
export function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-Left (7x7) + 1 module quiet margin
  if (r <= 7 && c <= 7) return true;
  // Top-Right (7x7) + 1 module quiet margin
  if (r <= 7 && c >= size - 8) return true;
  // Bottom-Left (7x7) + 1 module quiet margin
  if (r >= size - 8 && c <= 7) return true;
  return false;
}
