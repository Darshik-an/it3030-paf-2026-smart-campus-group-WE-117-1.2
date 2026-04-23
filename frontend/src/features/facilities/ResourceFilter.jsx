import React, { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

const typeOptions = [
  { value: "", label: "All Types", color: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200" },
  { value: "LECTURE_HALL", label: "Lecture Hall", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { value: "LAB", label: "Laboratory", color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
  { value: "MEETING_ROOM", label: "Meeting Room", color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100" },
  { value: "EQUIPMENT", label: "Equipment", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
];

const ResourceFilter = ({ onFilter }) => {
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTypeSelect = (val) => {
    setType(val);
    onFilter({ type: val, capacity, location });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ type, capacity, location });
  };

  const handleClear = () => {
    setType("");
    setCapacity("");
    setLocation("");
    onFilter({ type: "", capacity: "", location: "" });
  };

  const hasActiveFilters = type || capacity || location;

  return (
    <div className="space-y-4 mb-8">
      {/* Type Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter by:</span>
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleTypeSelect(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${opt.color} ${
              type === opt.value
                ? "ring-2 ring-offset-1 ring-[#003049] scale-105 shadow-sm"
                : ""
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
            showAdvanced
              ? "bg-[#003049] text-white border-[#003049]"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
        >
          <SlidersHorizontal size={14} />
          Advanced
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Advanced Filters — slide in */}
      {showAdvanced && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 items-end bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Min Capacity
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 50"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#003049]/30 focus:bg-white transition-all"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Block A, Building C"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#003049]/30 focus:bg-white transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#003049] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F77F00] transition-colors shadow-sm"
          >
            <Search size={16} />
            Search
          </button>
        </form>
      )}
    </div>
  );
};

export default ResourceFilter;
