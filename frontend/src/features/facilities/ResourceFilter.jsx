import React, { useState } from "react";

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB", label: "Lab" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "EQUIPMENT", label: "Equipment" },
];

const ResourceFilter = ({ onFilter }) => {
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ type, capacity, location });
  };

  return (
    <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
      <select
        className="border px-2 py-1 rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        {typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        placeholder="Min Capacity"
        className="border px-2 py-1 rounded"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        className="border px-2 py-1 rounded"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button type="submit" className="bg-[#003049] text-white px-4 py-1 rounded hover:bg-[#F77F00]">Search</button>
    </form>
  );
};

export default ResourceFilter;
