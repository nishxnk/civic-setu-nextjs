"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { citizenAPI } from "@/lib/api-client";
import { config } from "@/config/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  Upload,
  Loader2,
  Search,
  X,
  Eye,
  RotateCcw,
  SlidersHorizontal,
  Bot,
  Image as ImageIcon,
  CheckCircle2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface Detection {
  class_id: number;
  label: string;
  score: number;
  box: number[];
}

interface MLResult {
  detections: Detection[];
  annotatedImage?: string;
  output_image?: string;
  input_image?: string;
  model_name?: string;
  model?: string;
  threshold?: number;
}

const DETECTION_COLORS = ["#00FF00", "#0000FF", "#FF0000", "#FFFF00", "#FFA500", "#8B4513"];

export default function CitizenReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: "road", department: "pwd",
    address: "", phone: "",
  });
  const [loading, setLoading] = useState(false);

  // ML Detection State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [mlResult, setMlResult] = useState<MLResult | null>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState("");
  const [threshold, setThreshold] = useState(0.55);
  const [fullscreenImg, setFullscreenImg] = useState<string>("");

  const toUploadUrl = (filepath: string | undefined) => {
    if (!filepath) return "";
    const name = filepath.replace(/\\/g, "/").split("/").pop();
    return name ? `/uploads/${name}` : filepath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await citizenAPI.createComplaint({
        title: form.title,
        description: form.description + (mlResult?.detections?.length
          ? `\n\n[AI Detection: ${mlResult.detections.map(d => `${d.label} (${(d.score * 100).toFixed(0)}%)`).join(", ")}]`
          : ""),
        category: form.category,
        department: form.department,
        location: { address: form.address },
        phone: form.phone,
      });
      toast.success("Complaint submitted successfully!");
      router.push("/citizen/complaints");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit complaint. Please try again.");
    } finally { setLoading(false); }
  };

  // ML Road Damage Detection
  const runDetection = async (file: File, thresh: number) => {
    setMlLoading(true); setMlError(""); setMlResult(null);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("threshold", String(thresh));
    try {
      const res = await fetch("/api/detection/image", { method: "POST", body: formData });
      const data: MLResult = await res.json();
      setMlResult(data);
    } catch {
      setMlError("Detection failed. Please try again.");
    } finally { setMlLoading(false); }
  };

  const handleMLImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setOriginalPreview(URL.createObjectURL(file));
    await runDetection(file, threshold);
  };

  const annotatedImgUrl = toUploadUrl(mlResult?.output_image || mlResult?.annotatedImage);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Report New Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Category & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v || "road" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.domain.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Department</label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v || "pwd" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.domain.departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Issue Title *</label>
              <Input name="title" placeholder="Brief title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description *</label>
              <Textarea name="description" placeholder="Describe the issue..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required />
            </div>

            {/* Location & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Location Address *</label>
                <Input name="address" placeholder="Full address" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Contact Phone *</label>
                <Input name="phone" placeholder="Mobile number" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Detection Card */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-orange-800">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">AI Road Damage Detection</span>
            </div>
            <p className="text-sm text-orange-600">
              Upload an image of the road damage — our AI will automatically detect cracks and potholes.
            </p>

            {/* Threshold Controls */}
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-orange-200">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Sensitivity</span>
              <input type="range" min="0.1" max="0.9" step="0.05" value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="flex-1 h-2 accent-orange-600 cursor-pointer" />
              <span className="text-xs font-bold text-orange-700 w-10 text-right">{threshold.toFixed(2)}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setThreshold(0.55)}>
                <RotateCcw className="w-3 h-3" />
              </Button>
              {selectedFile && (
                <Button type="button" size="sm" onClick={() => runDetection(selectedFile, threshold)} disabled={mlLoading}>
                  {mlLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
                  {mlLoading ? "Detecting..." : "Re-detect"}
                </Button>
              )}
            </div>

            {/* File Upload */}
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-orange-400 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 transition text-sm font-medium">
                <Upload className="w-4 h-4" />
                {selectedFile ? selectedFile.name : "Choose Image"}
                <input type="file" accept="image/*" onChange={handleMLImage} className="hidden" />
              </label>
              {mlLoading && (
                <span className="text-orange-600 text-sm flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing image...
                </span>
              )}
              {mlError && <span className="text-red-600 text-sm">{mlError}</span>}
            </div>

            {/* Detection Results */}
            {mlResult && (
              <div className="bg-white border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-orange-700" />
                  <span className="font-semibold text-gray-800">AI Detection Results</span>
                  {mlResult.model_name && (
                    <Badge variant="outline" className="text-xs">{mlResult.model_name}</Badge>
                  )}
                </div>

                {originalPreview && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Uploaded Image
                      </p>
                      <img src={originalPreview} alt="Uploaded" className="w-full max-h-64 object-contain border rounded-lg" />
                    </div>
                    {annotatedImgUrl && (
                      <div className="relative group">
                        <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <Bot className="w-3 h-3" /> AI Detection
                        </p>
                        <div className="relative">
                          <img src={annotatedImgUrl} alt="AI Result" className="w-full max-h-64 object-contain border rounded-lg border-orange-300" />
                          <Button type="button" size="icon" variant="secondary"
                            onClick={() => setFullscreenImg(annotatedImgUrl)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                            title="View fullscreen">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mlResult.detections && mlResult.detections.length > 0 ? (
                  <>
                    <p className="text-sm font-medium text-gray-600">
                      {mlResult.detections.length} damage(s) detected:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {mlResult.detections.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 border rounded p-2 text-sm">
                          <span className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: DETECTION_COLORS[d.class_id % DETECTION_COLORS.length] }} />
                          <span className="font-medium">{d.label}</span>
                          <Badge variant="outline" className="ml-auto text-green-700">
                            {(d.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    No damage detected in this image.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4 mr-2" /> Submit Complaint</>
          )}
        </Button>
      </form>

      {/* Fullscreen Dialog */}
      <Dialog open={!!fullscreenImg} onOpenChange={() => setFullscreenImg("")}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95">
          <Button variant="ghost" size="icon" onClick={() => setFullscreenImg("")}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
            <X className="w-6 h-6" />
          </Button>
          {fullscreenImg && (
            <img src={fullscreenImg} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain mx-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
