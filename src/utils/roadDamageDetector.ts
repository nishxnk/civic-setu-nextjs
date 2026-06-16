/**
 * Pure TypeScript Road Damage Detector — replaces Python + PyTorch + OpenCV
 * Uses: onnxruntime-node + sharp (SVG compositing for annotation)
 */
import * as ort from "onnxruntime-node";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { DetectionBox, DetectionResult } from "@/types/detection";
import { LABELS, COLORS } from "./constants";

const INPUT_SIZE = 640;
// Use fine-tuned model if available, else fallback to base model
const MODEL_PATH_TRAINED = path.join(process.cwd(), "models", "YOLOv8_RDD_Trained.onnx");
const MODEL_PATH_BASE = path.join(process.cwd(), "models", "YOLOv8_Small_RDD.onnx");
const MODEL_PATH = fs.existsSync(MODEL_PATH_TRAINED) ? MODEL_PATH_TRAINED : MODEL_PATH_BASE;

// ── Singleton session ────────────────────────────────

let session: ort.InferenceSession | null = null;

export async function loadModel(): Promise<ort.InferenceSession> {
  if (session) return session;

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(
      `ONNX model not found at: ${MODEL_PATH}\nRun: python python/export_onnx.py (one-time setup)`
    );
  }

  console.log("[Detector] Loading ONNX model...");
  session = await ort.InferenceSession.create(MODEL_PATH, {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
  });
  console.log(
    `[Detector] Model loaded | Inputs: ${session.inputNames.join(", ")} | Outputs: ${session.outputNames.join(", ")}`
  );
  return session;
}

// ── Preprocessing ────────────────────────────────────

interface PreprocessResult {
  tensor: Float32Array;
  origW: number;
  origH: number;
  scale: number;
  padX: number;
  padY: number;
}

function letterbox(imgW: number, imgH: number) {
  const r = INPUT_SIZE / Math.max(imgW, imgH);
  const newW = Math.round(imgW * r);
  const newH = Math.round(imgH * r);
  const padX = Math.floor((INPUT_SIZE - newW) / 2);
  const padY = Math.floor((INPUT_SIZE - newH) / 2);
  return { newW, newH, padX, padY, scale: r };
}

async function preprocess(imagePath: string): Promise<PreprocessResult> {
  const metadata = await sharp(imagePath).metadata();
  const origW = metadata.width!;
  const origH = metadata.height!;
  const { scale, padX, padY } = letterbox(origW, origH);

  const { data } = await sharp(imagePath)
    .resize(INPUT_SIZE, INPUT_SIZE, {
      fit: "contain",
      background: { r: 114, g: 114, b: 114 },
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const area = INPUT_SIZE * INPUT_SIZE;
  const nchw = new Float32Array(3 * area);
  for (let i = 0; i < area; i++) {
    nchw[i] = data[i * 3] / 255.0;
    nchw[area + i] = data[i * 3 + 1] / 255.0;
    nchw[2 * area + i] = data[i * 3 + 2] / 255.0;
  }

  return { tensor: nchw, origW, origH, scale, padX, padY };
}

// ── Post-processing ──────────────────────────────────

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function iouBox(a: number[], b: number[]): number {
  const [ax1, ay1, ax2, ay2] = a;
  const [bx1, by1, bx2, by2] = b;
  const ix1 = Math.max(ax1, bx1);
  const iy1 = Math.max(ay1, by1);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);
  const iArea = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const aArea = (ax2 - ax1) * (ay2 - ay1);
  const bArea = (bx2 - bx1) * (by2 - by1);
  return iArea / (aArea + bArea - iArea + 1e-6);
}

function nms(
  boxes: number[][],
  scores: number[],
  iouThreshold = 0.5
): number[] {
  const order = boxes.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
  const keep = new Set(order);

  for (const i of order) {
    if (!keep.has(i)) continue;
    for (const j of order) {
      if (i === j || !keep.has(j)) continue;
      if (iouBox(boxes[i], boxes[j]) > iouThreshold) {
        keep.delete(j);
      }
    }
  }
  return [...keep].sort((a, b) => scores[b] - scores[a]);
}

/**
 * Merge overlapping boxes of the same class into one tight bounding box.
 * Only merges boxes that actually overlap (same damage area).
 * Keeps boxes tight with minimal expansion.
 */
function mergeNearbyBoxes(detections: {
  class_id: number; label: string; score: number; box: number[];
}[]): typeof detections {
  if (detections.length <= 1) return detections;

  // Group by class_id
  const groups = new Map<number, typeof detections>();
  for (const d of detections) {
    const list = groups.get(d.class_id) || [];
    list.push(d);
    groups.set(d.class_id, list);
  }

  const merged: typeof detections = [];

  for (const [classId, items] of groups) {
    const sorted = [...items].sort((a, b) => b.score - a.score);
    const used = new Set<number>();

    for (let i = 0; i < sorted.length; i++) {
      if (used.has(i)) continue;

      let [mx1, my1, mx2, my2] = sorted[i].box;
      let bestScore = sorted[i].score;
      used.add(i);

      // Merge boxes that SIGNIFICANTLY overlap (same damage region)
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < sorted.length; j++) {
          if (used.has(j)) continue;
          const [bx1, by1, bx2, by2] = sorted[j].box;

          const iu = iouBox([mx1, my1, mx2, my2], [bx1, by1, bx2, by2]);

          // Only merge if boxes share significant overlap (>15%)
          // This ensures only truly connected damage areas merge
          if (iu > 0.15) {
            mx1 = Math.min(mx1, bx1);
            my1 = Math.min(my1, by1);
            mx2 = Math.max(mx2, bx2);
            my2 = Math.max(my2, by2);
            bestScore = Math.max(bestScore, sorted[j].score);
            used.add(j);
            changed = true;
          }
        }
      }

      // Minimal 3% expansion — keeps boxes tight
      const bw = mx2 - mx1;
      const bh = my2 - my1;
      const expandX = Math.round(bw * 0.03);
      const expandY = Math.round(bh * 0.03);

      merged.push({
        class_id: classId,
        label: sorted[i].label,
        score: parseFloat(bestScore.toFixed(4)),
        box: [
          Math.max(0, mx1 - expandX),
          Math.max(0, my1 - expandY),
          Math.max(1, mx2 + expandX),
          Math.max(1, my2 + expandY),
        ],
      });
    }
  }

  return merged;
}

function postprocess(
  output: ort.Tensor,
  origW: number,
  origH: number,
  scale: number,
  padX: number,
  padY: number,
  threshold: number
): DetectionBox[] {
  const data = output.data as Float32Array;
  const dims = output.dims;
  const numPreds = dims[2];
  const numClasses = dims[1] - 4;
  const roadClassLimit = Math.min(numClasses, LABELS.length);

  const boxes: number[][] = [];
  const scores: number[] = [];
  const classIds: number[] = [];

  for (let i = 0; i < numPreds; i++) {
    const cx = data[i];
    const cy = data[1 * numPreds + i];
    const bw = data[2 * numPreds + i];
    const bh = data[3 * numPreds + i];

    const x1 = cx - bw / 2;
    const y1 = cy - bh / 2;
    const x2 = cx + bw / 2;
    const y2 = cy + bh / 2;

    if (x2 <= x1 || y2 <= y1) continue;

    const ox1 = (x1 - padX) / scale;
    const oy1 = (y1 - padY) / scale;
    const ox2 = (x2 - padX) / scale;
    const oy2 = (y2 - padY) / scale;

    let maxScore = 0;
    let bestClass = 0;
    for (let c = 0; c < roadClassLimit; c++) {
      const s = sigmoid(data[(4 + c) * numPreds + i]);
      if (s > maxScore) {
        maxScore = s;
        bestClass = c;
      }
    }

    if (maxScore < threshold) continue;

    const bx1 = Math.max(0, Math.min(origW - 1, Math.round(ox1)));
    const by1 = Math.max(0, Math.min(origH - 1, Math.round(oy1)));
    const bx2 = Math.max(1, Math.min(origW, Math.round(ox2)));
    const by2 = Math.max(1, Math.min(origH, Math.round(oy2)));

    if (bx2 <= bx1 || by2 <= by1) continue;

    boxes.push([bx1, by1, bx2, by2]);
    scores.push(maxScore);
    classIds.push(bestClass);
  }

  const keep = nms(boxes, scores, 0.45); // Moderate NMS — removes duplicate overlapping boxes

  const detections = keep.map((i) => ({
    class_id: classIds[i],
    label: LABELS[classIds[i]] || `Class ${classIds[i]}`,
    score: parseFloat(scores[i].toFixed(4)),
    box: boxes[i] as [number, number, number, number],
  }));

  // Merge nearby same-class boxes into one box per damage area
  return mergeNearbyBoxes(detections) as DetectionBox[];
}

// ── Annotation ────────────────────────────────────────

async function drawBoxes(
  imagePath: string,
  detections: DetectionBox[],
  outputPath: string
): Promise<void> {
  const metadata = await sharp(imagePath).metadata();
  const { width, height } = metadata;

  if (detections.length === 0) {
    await sharp(imagePath).jpeg({ quality: 92 }).toFile(outputPath);
    return;
  }

  const svgElements = detections
    .map((d) => {
      const [x1, y1, x2, y2] = d.box;
      const color = COLORS[d.class_id % COLORS.length];
      const labelY = Math.max(y1 - 5, 16);
      return [
        `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"`,
        `      fill="none" stroke="${color}" stroke-width="2" rx="2"/>`,
        `<rect x="${x1}" y="${labelY - 14}" width="${(d.label.length + 8) * 8}" height="16"`,
        `      fill="${color}" fill-opacity="0.7" rx="2"/>`,
        `<text x="${x1 + 4}" y="${labelY}" fill="#FFFFFF"`,
        `      font-family="Arial,sans-serif" font-size="12" font-weight="bold">`,
        `  ${d.label}: ${(d.score * 100).toFixed(0)}%</text>`,
      ].join("\n");
    })
    .join("\n");

  const svg = [
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
    svgElements,
    `</svg>`,
  ].join("\n");

  await sharp(imagePath)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile(outputPath);
}

// ── Main API ──────────────────────────────────────────

export async function detect(
  imagePath: string,
  threshold = 0.5
): Promise<DetectionResult> {
  const t = parseFloat(String(threshold)) || 0.5;
  console.log(`[Detector] Processing: ${imagePath} (threshold: ${t})`);

  const { tensor, origW, origH, scale, padX, padY } =
    await preprocess(imagePath);

  const model = await loadModel();
  const inputName = model.inputNames[0];
  const feed: Record<string, ort.Tensor> = {
    [inputName]: new ort.Tensor("float32", tensor, [
      1, 3, INPUT_SIZE, INPUT_SIZE,
    ]),
  };
  const results = await model.run(feed);
  const output = results[model.outputNames[0]];

  const detections = postprocess(
    output,
    origW,
    origH,
    scale,
    padX,
    padY,
    t
  );
  console.log(`[Detector] Found ${detections.length} damage(s)`);

  const outputPath = imagePath + "_result.jpg";
  await drawBoxes(imagePath, detections, outputPath);

  return {
    detections,
    output_image: outputPath,
    input_image: imagePath,
    model_name: "YOLOv8_Small_RDD",
    threshold: t,
  };
}
