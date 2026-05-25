/**
 * Ambient type declarations for ml5.js loaded via CDN.
 * Only methods used by A1I (The Observant Shopper) are declared here.
 * Extend if future projects use additional ml5 features.
 */
declare const ml5: {
  /** Object detector using COCO-SSD or other models. */
  objectDetector(
    model: string,
    optionsOrCallback?: Record<string, unknown> | ((error: unknown, result: unknown) => void),
    callback?: (error: unknown, result: unknown) => void
  ): ML5ObjectDetector;

  /** Image classifier (MobileNet, etc.) */
  imageClassifier(
    model: string,
    optionsOrCallback?: Record<string, unknown> | ((error: unknown, result: unknown) => void),
    callback?: (error: unknown, result: unknown) => void
  ): ML5ImageClassifier;

  [key: string]: unknown;
};

/** Detection result returned by objectDetector.detect() */
interface ML5Detection {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  normalized: { x: number; y: number; width: number; height: number };
}

interface ML5ObjectDetector {
  detect(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | p5.Element,
    callback?: (error: unknown, results: ML5Detection[]) => void
  ): void;
}

interface ML5ImageClassifier {
  classify(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    callback?: (error: unknown, results: Array<{ label: string; confidence: number }>) => void
  ): void;
}
