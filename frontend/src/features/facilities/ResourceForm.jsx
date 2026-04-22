import React, { useState } from "react";

const typeOptions = [
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB", label: "Lab" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "EQUIPMENT", label: "Equipment" },
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
    if (!form.name || !form.type || !form.capacity || !form.location || !form.status) {
      setError("All fields are required.");
      return;
    }
    if (form.capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }
    setError(null);
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white p-6 rounded shadow w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-[#003049]">{resource ? "Edit Facility" : "Add Facility"}</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Capacity</label>
          <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border px-2 py-1 rounded">
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#F77F00] text-white rounded hover:bg-[#FCBF49]">{resource ? "Update" : "Add"}</button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
