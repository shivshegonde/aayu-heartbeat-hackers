export interface OcrResult {
  text: string;
  confidence: number;
  extractedFromScan: boolean;
  pageCount: number;
}

/**
 * Extracts raw JPEG image streams directly from a scanned PDF buffer
 * as a low-level fallback if canvas rendering is not available.
 */
export function extractJpegImagesFromPdfBuffer(pdfBuffer: Buffer): Buffer[] {
  const images: Buffer[] = [];
  let startIndex = -1;

  for (let i = 0; i < pdfBuffer.length - 3; i++) {
    // JPEG Start of Image (SOI): 0xFF, 0xD8, 0xFF
    if (pdfBuffer[i] === 0xff && pdfBuffer[i + 1] === 0xd8 && pdfBuffer[i + 2] === 0xff) {
      startIndex = i;
      // Seek to JPEG End of Image (EOI): 0xFF, 0xD9
      for (let j = startIndex + 100; j < pdfBuffer.length - 1; j++) {
        if (pdfBuffer[j] === 0xff && pdfBuffer[j + 1] === 0xd9) {
          const imgLength = j - startIndex + 2;
          if (imgLength > 5000) {
            images.push(Buffer.from(pdfBuffer.subarray(startIndex, j + 2)));
          }
          i = j + 1;
          break;
        }
      }
    }
  }

  return images;
}

/**
 * High-Fidelity PDF Page-to-Image Rendering Engine
 * Uses PDF.js + @napi-rs/canvas to render full physical pages into pristine high-DPI PNGs.
 * This works on all scanned PDF formats (JBIG2, Flate, vector, JPEG) without losing quality.
 */
export async function renderPdfPagesToImages(pdfBuffer: Buffer, maxPages: number = 4): Promise<Buffer[]> {
  try {
    let pdfjsLib: any;
    try {
      pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      pdfjsLib = require('pdfjs-dist');
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createCanvas } = require('@napi-rs/canvas');

    const data = new Uint8Array(pdfBuffer);
    const getDocPromise = pdfjsLib.getDocument ? pdfjsLib.getDocument({ data }).promise : pdfjsLib.default.getDocument({ data }).promise;
    const doc = await getDocPromise;

    const pagesToRender = Math.min(doc.numPages, maxPages);
    console.log(`[GharCare OCR Engine] PDF has ${doc.numPages} pages. Rendering first ${pagesToRender} pages to high-res PNG at 2.0x scale...`);

    const pngBuffers: Buffer[] = [];
    for (let p = 1; p <= pagesToRender; p++) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport }).promise;
      const pngBuf = canvas.toBuffer('image/png');
      pngBuffers.push(pngBuf);
      console.log(`[GharCare OCR Engine] Page ${p} rendered (${pngBuf.length} bytes)`);
    }

    return pngBuffers;
  } catch (err: any) {
    console.warn('[GharCare OCR Engine] Canvas PDF rendering note, trying stream fallback:', err.message);
    return extractJpegImagesFromPdfBuffer(pdfBuffer);
  }
}

/**
 * Performs local Optical Character Recognition (OCR) using Tesseract.js.
 */
export async function performLocalOcr(imageBuffer: Buffer): Promise<OcrResult> {
  try {
    // Dynamically load Tesseract only if invoked, avoiding WASM worker threads at startup
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Tesseract = require('tesseract.js');
    const result = await Tesseract.recognize(imageBuffer, 'eng');
    const text = (result.data.text || '').trim();
    const confidence = result.data.confidence || 0;

    return {
      text,
      confidence,
      extractedFromScan: true,
      pageCount: 1,
    };
  } catch (err: any) {
    console.warn('[GharCare OCR Engine] Tesseract OCR note:', err.message);
    return {
      text: '',
      confidence: 0,
      extractedFromScan: false,
      pageCount: 0,
    };
  }
}

/**
 * Complete Scanned Document Hybrid OCR Pipeline
 * Handles multi-page scanned discharge summaries (like Shivam Singh SGRH summary)
 * and smartphone camera photos.
 */
export async function processScannedDocumentOcr(
  fileBuffer: Buffer,
  mimeType?: string,
  filename?: string
): Promise<OcrResult> {
  const isPdf = mimeType === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf');
  const isImage = (mimeType && mimeType.startsWith('image/')) || /\.(png|jpe?g|webp|bmp|tiff)$/i.test(filename || '');

  if (isImage) {
    return performLocalOcr(fileBuffer);
  }

  if (isPdf) {
    console.log('[GharCare OCR Engine] Scanned PDF detected. Rendering document pages to high-res image buffers...');
    const pageImages = await renderPdfPagesToImages(fileBuffer, 4);

    if (pageImages.length > 0) {
      console.log(`[GharCare OCR Engine] Successfully rendered ${pageImages.length} page(s). Performing full OCR on pages...`);
      let accumulatedText = '';
      let avgConfidence = 0;

      for (let i = 0; i < pageImages.length; i++) {
        const pageResult = await performLocalOcr(pageImages[i]);
        if (pageResult.text.length > 0) {
          accumulatedText += `\n--- SCANNED PAGE ${i + 1} ---\n` + pageResult.text + '\n';
          avgConfidence += pageResult.confidence;
        }
      }

      if (accumulatedText.trim().length > 0) {
        const finalConfidence = Math.round(avgConfidence / pageImages.length);
        console.log(`[GharCare OCR Engine] Multi-page OCR completed! Total characters extracted: ${accumulatedText.length} across ${pageImages.length} pages (Confidence: ${finalConfidence}%)`);

        return {
          text: accumulatedText.trim(),
          confidence: finalConfidence,
          extractedFromScan: true,
          pageCount: pageImages.length,
        };
      }
    }
  }

  return {
    text: '',
    confidence: 0,
    extractedFromScan: false,
    pageCount: 0,
  };
}
