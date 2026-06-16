"use client";

import { useState } from "react";

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

// Also fix MLResult in citizen/report


export default function ComplaintPage() {
  const [form, setForm] = useState({
    title: "", description: "", category: "road", department: "pwd",
    name: "", email: "", phone: "", address: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── ML Detection State ──
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [mlResult, setMlResult] = useState<MLResult | null>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState("");
  const [threshold, setThreshold] = useState(0.55);
  const [fullscreenImg, setFullscreenImg] = useState<string>("");

  /** Extract just the filename from a file path and return /uploads/filename */
  const toUploadUrl = (filepath: string | undefined) => {
    if (!filepath) return "";
    const name = filepath.replace(/\\/g, "/").split("/").pop();
    return name ? `/uploads/${name}` : filepath;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          department: form.department,
          location: { address: form.address },
          citizen: { name: form.name, email: form.email, phone: form.phone },
        }),
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  // ── ML Road Damage Detection ──
  const runDetection = async (file: File, thresh: number) => {
    setMlLoading(true);
    setMlError("");
    setMlResult(null);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("threshold", String(thresh));
    try {
      const res = await fetch("/api/detection/image", { method: "POST", body: formData });
      const data: MLResult = await res.json();
      setMlResult(data);
    } catch (err) {
      setMlError("Detection failed. Please try again.");
    } finally {
      setMlLoading(false);
    }
  };

  const handleMLImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setOriginalPreview(URL.createObjectURL(file));
    await runDetection(file, threshold);
  };

  const annotatedImgUrl = toUploadUrl(mlResult?.output_image || mlResult?.annotatedImage);
  const originalImgUrl = toUploadUrl(mlResult?.input_image);

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none";

  if (success) {
    return (
      <section className="max-w-3xl mx-auto py-16 px-4 text-center">
        <i className="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Submitted!</h2>
        <p className="text-gray-500">Your complaint has been registered. You will be notified of updates.</p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">File a Complaint</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        {/* ── Personal Info ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input name="phone" placeholder="Mobile number" value={form.phone} onChange={handleChange} className={inputCls} required />
          </div>
        </div>

        {/* ── Location ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location Address *</label>
          <input name="address" placeholder="Full address of the issue" value={form.address} onChange={handleChange} className={inputCls} required />
        </div>

        {/* ── Category & Department ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
              <option value="road">Road Damage</option>
              <option value="lighting">Lighting</option>
              <option value="water">Water</option>
              <option value="sanitation">Sanitation</option>
              <option value="traffic">Traffic</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select name="department" value={form.department} onChange={handleChange} className={inputCls}>
              <option value="pwd">PWD</option>
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="sanitation">Sanitation</option>
              <option value="traffic">Traffic</option>
              <option value="parks">Parks</option>
            </select>
          </div>
        </div>

        {/* ── Title & Description ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title *</label>
          <input name="title" placeholder="Brief title of the issue" value={form.title} onChange={handleChange} className={inputCls} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" placeholder="Describe the issue in detail..." value={form.description} onChange={handleChange} className={inputCls} rows={4} required />
        </div>

        {/* ── ML Detection: Upload Evidence ── */}
        <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg p-4">
          <label className="block font-semibold text-blue-800 mb-2">
            <i className="fas fa-camera mr-2"></i>
            AI Road Damage Detection
          </label>
          <p className="text-sm text-blue-600 mb-3">
            Upload an image of the road damage — our AI will automatically detect cracks and potholes.
          </p>

          {/* Threshold Slider */}
          <div className="flex items-center gap-3 mb-3 bg-white rounded-lg p-3 border border-blue-200">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              <i className="fas fa-sliders-h mr-1"></i>Sensitivity
            </span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="flex-1 h-2 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-blue-700 w-10 text-right">{threshold.toFixed(2)}</span>
            <button
              type="button"
              onClick={() => { setThreshold(0.55); }}
              className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
            >
              Reset
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={() => runDetection(selectedFile, threshold)}
                disabled={mlLoading}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {mlLoading ? <><i className="fas fa-spinner fa-spin mr-1"></i>Detecting...</> : <><i className="fas fa-search mr-1"></i>Re-detect</>}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-white border border-blue-400 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
              <i className="fas fa-upload mr-2"></i>
              {selectedFile ? selectedFile.name : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleMLImage}
                className="hidden"
              />
            </label>
            {mlLoading && (
              <span className="text-blue-600 text-sm">
                <i className="fas fa-spinner fa-spin mr-1"></i> Analyzing image...
              </span>
            )}
            {mlError && <span className="text-red-600 text-sm">{mlError}</span>}
          </div>

          {/* ── ML Detection Results ── */}
          {mlResult && (
            <div className="mt-4 bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-robot text-blue-700"></i>
                AI Detection Results
                {mlResult.model_name && (
                  <span className="text-xs text-gray-400 font-normal">
                    Model: {mlResult.model_name} | Threshold: {mlResult.threshold ?? 0.4}
                  </span>
                )}
              </h4>

              {/* Uploaded + Annotated Images Side-by-Side */}
              {originalPreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Original Image */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      <i className="fas fa-image mr-1"></i>Uploaded Image
                    </p>
                    <img
                      src={originalPreview}
                      alt="Uploaded road image"
                      className="w-full max-h-64 object-contain border rounded-lg"
                    />
                  </div>
                  {/* Annotated Image */}
                  {annotatedImgUrl && (
                    <div className="relative group">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        <i className="fas fa-robot mr-1"></i>AI Detection
                      </p>
                      <div className="relative">
                        <img
                          src={annotatedImgUrl}
                          alt="AI Detection Result"
                          className="w-full max-h-64 object-contain border rounded-lg border-blue-300"
                        />
                        {/* Eye button - fullscreen preview */}
                        <button
                          type="button"
                          onClick={() => setFullscreenImg(annotatedImgUrl)}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                          title="View fullscreen"
                        >
                          <i className="fas fa-eye text-lg"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Damage Summary Cards */}
              {mlResult.detections && mlResult.detections.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-gray-600">
                    <i className="fas fa-exclamation-triangle text-yellow-500 mr-1"></i>
                    {mlResult.detections.length} damage(s) detected:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {mlResult.detections.map((d, i) => {
                      const colors = ["#00FF00", "#0000FF", "#FF0000", "#FFFF00"];
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-50 border rounded p-2 text-sm"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: colors[d.class_id % colors.length] }}
                          ></span>
                          <span className="font-medium">{d.label}</span>
                          <span className="text-green-700 font-bold ml-auto">
                            {(d.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  <i className="fas fa-check-circle text-green-500 mr-1"></i>
                  No damage detected in this image.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 font-semibold transition"
        >
          {loading ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>Submitting...</>
          ) : (
            "Submit Complaint"
          )}
        </button>
      </form>

      {/* ── Fullscreen Image Modal ── */}
      {fullscreenImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenImg("")}
        >
          <button
            type="button"
            onClick={() => setFullscreenImg("")}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-50"
          >
            <i className="fas fa-times"></i>
          </button>
          <img
            src={fullscreenImg}
            alt="Fullscreen preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
