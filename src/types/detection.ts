export interface DetectionBox {
  class_id: number;
  label: string;
  score: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface DetectionResult {
  detections: DetectionBox[];
  output_image: string;
  input_image: string;
  model_name: string;
  threshold: number;
}
