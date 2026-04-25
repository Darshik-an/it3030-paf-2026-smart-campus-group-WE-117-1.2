import React, { useState } from "react";
import api from "../../services/api";

const categories = [
  { label: "Hardware", icon: "🖥" },
  { label: "Software", icon: "💻" },
  { label: "Facility", icon: "🏢" },
];

export default function TicketingFormPage({ onBack, onTicketCreated }) {
  const [category, setCategory] = useState("Hardware");
  const [resource, setResource] = useState("");
  const [priority, setPriority] = useState("Low - Routine");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      setError("You can upload maximum 3 images.");
      setImages(files.slice(0, 3));
      return;
    }
    setError("");
    setImages(files);
  };

  const handleSubmit = async () => {
    if (!resource.trim() || !description.trim()) {
      setError("Affected resource and issue description are required.");
      return;
    }
    if (images.length > 3) {
      setError("You can upload maximum 3 images.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resource", resource.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description.trim());
      images.forEach((file) => formData.append("images", file));

      const response = await api.post("/api/tickets", formData);

      if (onTicketCreated) {
        onTicketCreated(response.data);
      }
      onBack();
    } catch (err) {
      const raw = err.response?.data;
      const message =
        typeof raw === "string"
          ? raw
          : raw?.message || `Failed to create ticket (${err.response?.status || "unknown error"}).`;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] font-sans px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pl-1">
        <span className="cursor-pointer" onClick={onBack}>
          Dashboard
        </span>
        <span className="text-xs text-gray-400">›</span>
        <span className="text-gray-900 font-semibold">New Ticket</span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-9 max-w-[620px] mx-auto shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Report a Maintenance Issue
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Provide detailed information to help our maintenance team resolve the
          issue faster.
        </p>

        {/* Affected Resource */}
        <div className="mb-7">
          <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
            AFFECTED RESOURCE
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              🖥
            </span>

            <input
              type="text"
              placeholder="e.g. Lab 03 - Projector, Library Wi-Fi..."
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-blue-200 bg-blue-50 rounded-lg text-sm text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Category + Priority */}
        <div className="flex gap-6 mb-7">
          {/* Category */}
          <div className="flex-1">
            <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
              CATEGORY
            </label>

            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setCategory(c.label)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-sm transition ${
                    category === c.label
                      ? "bg-blue-50 border-blue-200 text-blue-800 font-semibold"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="w-[180px]">
            <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
              PRIORITY LEVEL
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full py-3 px-3 border border-blue-200 bg-blue-50 rounded-lg text-sm outline-none"
            >
              <option>Low - Routine</option>
              <option>Medium - Moderate</option>
              <option>High - Urgent</option>
              <option>Critical - Emergency</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mb-7">
          <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
            ISSUE DESCRIPTION
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            className="w-full min-h-[130px] p-3 border border-blue-200 bg-blue-50 rounded-lg text-sm outline-none leading-relaxed"
          />
        </div>

        {/* Attachments */}
        <div className="mb-7">
          <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
            ATTACHMENTS & EVIDENCE
          </label>

          <div className="border-2 border-dashed border-orange-500 bg-orange-50 rounded-xl p-9 text-center">
            <div className="text-3xl mb-2">☁️</div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Drag and drop images here
            </p>
            <p className="text-xs text-gray-400 mb-4">
              JPEG, PNG, or GIF up to 10MB
            </p>
            <label className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer inline-block">
              Browse Files
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {images.length > 0 && (
              <p className="text-xs text-gray-600 mt-3">
                {images.length} image(s) selected
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-7">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
              i
            </div>
            <p className="text-xs text-gray-500 leading-5">
              Tickets are usually assigned within 2 hours.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-sm text-gray-700">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Ticket ➤"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-2 gap-3 max-w-[620px] mx-auto mt-5">
        <div className="bg-white rounded-xl p-4 flex gap-3 shadow-sm">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            ❓
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Need immediate help?
            </p>
            <p className="text-xs text-gray-500 leading-5">
              For emergencies call ext.{" "}
              <span className="font-bold text-gray-900">9110</span>.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 flex gap-3 shadow-sm">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            🕐
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Recent Activity
            </p>
            <p className="text-xs text-gray-500 leading-5">
              You have 2 active tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
