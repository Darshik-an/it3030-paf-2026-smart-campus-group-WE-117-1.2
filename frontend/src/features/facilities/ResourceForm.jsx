import React, { useState } from "react";
import { X, Save, Building, Users, MapPin, AlignLeft, LayoutDashboard, Activity } from "lucide-react";

const typeOptions = [
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB", label: "Lab" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "AUDITORIUM", label: "Auditorium" },
];
const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
];

const ResourceForm = ({ resource, onClose, onSubmit }) => {
  const [form, setForm] = useState(
    resource || {
      name: "",
      type: "LECTURE_HALL",
      capacity: 1,
      location: "",
      status: "ACTIVE",
      description: "",
    }
  );
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedCapacity = Number.parseInt(form.capacity, 10);

    if (!form.name || !form.type || form.capacity === "" || !form.location || !form.status) {
      setError("All fields are required.");
      return;
    }
    if (!Number.isInteger(parsedCapacity)) {
      setError("Capacity must be a whole number.");
      return;
    }
    if (parsedCapacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }
    setError(null);
    onSubmit({
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description?.trim() || "",
      capacity: parsedCapacity,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <form className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onSubmit={handleSubmit}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building className="text-[#F77F00]" size={24} />
            {resource ? "Edit Facility" : "Add New Facility"}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium border border-rose-100 flex items-start gap-2">
              <Activity size={16} className="mt-0.5" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Facility Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="name" value={form.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" placeholder="e.g. Main Auditorium" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
              <div className="relative">
                <LayoutDashboard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select name="type" value={form.type} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none">
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Capacity</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="location" value={form.location} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" placeholder="e.g. Block C" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select name="status" value={form.status} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none">
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[100px] resize-y" placeholder="Add any specific details here..." />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#003049] rounded-lg hover:bg-[#F77F00] transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#003049]">
            <Save size={18} />
            {resource ? "Save Changes" : "Create Facility"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
