import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";

const categories = ["Hardware", "Software", "Facility"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function formatApiError(err) {
  const raw = err.response?.data;
  if (typeof raw === "string") return raw;
  if (raw?.error) return typeof raw.error === "string" ? raw.error : JSON.stringify(raw.error);
  if (raw?.message) return raw.message;
  return err.message || "Request failed.";
}

/**
 * Client-side validation aligned with backend rules.
 * @returns {Record<string, string>}
 */
function validateTechnicianFields({ name, email, phone, category, specialization }) {
  const errors = {};
  const n = name.trim();
  if (!n) errors.name = "Full name is required.";
  else if (n.length < 2) errors.name = "Name must be at least 2 characters.";
  else if (n.length > 120) errors.name = "Name must be at most 120 characters.";

  const e = email.trim();
  if (!e) errors.email = "Email is required.";
  else if (e.length > 255) errors.email = "Email is too long.";
  else if (!EMAIL_RE.test(e)) errors.email = "Enter a valid email address.";

  const p = (phone || "").trim();
  if (!p) {
  errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(p)) {
  errors.phone = "Phone number must be exactly 10 digits.";
  }

  if (!category || !categories.includes(category)) errors.category = "Please select a category.";

  const s = (specialization || "").trim();
  if (s.length === 1) errors.specialization = "Enter at least 2 characters or leave specialization empty.";
  else if (s.length > 255) errors.specialization = "Specialization must be at most 255 characters.";

  return errors;
}

function inputClass(hasError, disabled) {
  const base =
    "w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none disabled:opacity-60";
  const ring = hasError
    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
    : "border-gray-200 focus:ring-orange-500 focus:border-orange-500";
  return `${base} ${ring}`;
}

export default function TicketingAddTechnician({ onBack, onSaved, editingTechnician }) {
  const isEdit = Boolean(editingTechnician?.dbId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError("");
    setFieldErrors({});
    if (editingTechnician) {
      setName(editingTechnician.name || "");
      setEmail(editingTechnician.email || "");
      setPhone(editingTechnician.phone != null ? String(editingTechnician.phone) : "");
      setCategory(
        categories.includes(editingTechnician.category) ? editingTechnician.category : "Hardware"
      );
      setSpecialization(editingTechnician.specialization || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setCategory("Hardware");
      setSpecialization("");
    }
  }, [editingTechnician]);

  const title = useMemo(() => (isEdit ? "Edit Technician" : "Add New Technician"), [isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateTechnicianFields({
      name,
      email,
      phone,
      category,
      specialization,
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "",
        category,
        specialization: specialization.trim(),
      };
      if (isEdit) {
        await api.put(`/api/helpdesk/technicians/${editingTechnician.dbId}`, payload);
      } else {
        await api.post("/api/helpdesk/technicians", payload);
      }
      if (typeof onSaved === "function") {
        onSaved();
      } else if (typeof onBack === "function") {
        onBack();
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {typeof onBack === "function" && (
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              ← Back to technicians
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5"
          noValidate
        >
          <p className="text-sm text-gray-500">
            {isEdit
              ? "Update this technician. Changes are saved to the database."
              : "Register a technician in the database. They will appear in the list after you save."}
          </p>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={inputClass(Boolean(fieldErrors.name), submitting)}
              placeholder="e.g. Marcus Thorne"
              autoComplete="name"
              disabled={submitting}
              minLength={2}
              maxLength={120}
              required
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={inputClass(Boolean(fieldErrors.email), submitting)}
              placeholder="name@campus.com"
              autoComplete="email"
              disabled={submitting}
              maxLength={255}
              required
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Phone <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
           <input
                type="tel"
                value={phone}
                onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // keep digits only
                setPhone(value);
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className={inputClass(Boolean(fieldErrors.phone), submitting)}
                placeholder="0771234567"
                autoComplete="tel"
                disabled={submitting}
                maxLength={10}
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setFieldErrors((prev) => ({ ...prev, category: undefined }));
              }}
              className={inputClass(Boolean(fieldErrors.category), submitting)}
              disabled={submitting}
              required
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {fieldErrors.category && <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Specialization{" "}
              <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setFieldErrors((prev) => ({ ...prev, specialization: undefined }));
              }}
              className={inputClass(Boolean(fieldErrors.specialization), submitting)}
              placeholder="e.g. Projectors & AV systems"
              disabled={submitting}
              maxLength={255}
            />
            {fieldErrors.specialization && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.specialization}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving…" : isEdit ? "Update technician" : "Save technician"}
            </button>
            {typeof onBack === "function" && (
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
