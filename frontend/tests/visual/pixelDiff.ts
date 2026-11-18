import { PNG } from "pngjs";

/** A pixel differs when the luminance of the per-channel absolute difference exceeds this value (0–255). */
export const DIFF_THRESHOLD = 24;

export interface DiffResult {
  mismatch: number;
  width: number;
  height: number;
  figmaHeight: number;
  appHeight: number;
  diffPng: Buffer;
}

/**
 * Compares a Figma baseline with an app screenshot (both 1440px wide).
 * Missing rows on either side (height mismatch) count as differing pixels.
 * The diff image shows differing pixels in red over a faded Figma frame.
 */
export function diffAgainstFigma(figmaBuf: Buffer, appBuf: Buffer): DiffResult {
  const figma = PNG.sync.read(figmaBuf);
  const app = PNG.sync.read(appBuf);
  if (figma.width !== app.width) {
    throw new Error(`Width mismatch: figma ${figma.width}px vs app ${app.width}px (both must be 1440).`);
  }
  const width = figma.width;
  const height = Math.max(figma.height, app.height);
  const out = new PNG({ width, height });
  let differing = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const inF = y < figma.height;
      const inA = y < app.height;
      const fi = (y * width + x) * 4;
      const fr = inF ? figma.data[fi] : 255, fg = inF ? figma.data[fi + 1] : 0, fb = inF ? figma.data[fi + 2] : 255;
      const ar = inA ? app.data[fi] : 255, ag = inA ? app.data[fi + 1] : 0, ab = inA ? app.data[fi + 2] : 255;
      const lum = 0.299 * Math.abs(fr - ar) + 0.587 * Math.abs(fg - ag) + 0.114 * Math.abs(fb - ab);
      const differs = !inF || !inA || lum > DIFF_THRESHOLD;
      if (differs) {
        differing++;
        out.data[o] = 230; out.data[o + 1] = 0; out.data[o + 2] = 0;
      } else {
        out.data[o] = Math.round(fr * 0.3 + 255 * 0.7);
        out.data[o + 1] = Math.round(fg * 0.3 + 255 * 0.7);
        out.data[o + 2] = Math.round(fb * 0.3 + 255 * 0.7);
      }
      out.data[o + 3] = 255;
    }
  }

  return {
    mismatch: differing / (width * height),
    width,
    height,
    figmaHeight: figma.height,
    appHeight: app.height,
    diffPng: PNG.sync.write(out),
  };
}
