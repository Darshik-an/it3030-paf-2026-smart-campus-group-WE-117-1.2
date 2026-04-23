import React from "react";

const technicians = [
  {
    name: "Marcus Thorne",
    email: "marcus@campus.com",
    phone: "+94 77 123 4567",
    category: "Hardware",
    tickets: ["#TM-8492", "#TM-8480"],
  },
  {
    name: "Sarah Jenkins",
    email: "sarah@campus.com",
    phone: "+94 71 555 7788",
    category: "Software",
    tickets: ["#TM-8491"],
  },
  {
    name: "Brian Taylor",
    email: "brian@campus.com",
    phone: "+94 75 888 2222",
    category: "Facility",
    tickets: ["#TM-8488", "#TM-8475", "#TM-8469"],
  },
];

export default function TechnicianDashboard() {
  return (
    <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Technicians Overview
        </h1>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm">

        {/* Table Header */}
        <div className="grid grid-cols-5 text-xs text-gray-500 font-semibold px-6 py-3 border-b">
          <div>TECHNICIAN</div>
          <div>EMAIL</div>
          <div>PHONE</div>
          <div>CATEGORY</div>
          <div>ACTIVE TICKETS</div>
        </div>

        {/* Rows */}
        {technicians.map((tech, i) => (
          <div
            key={i}
            className="grid grid-cols-5 items-center px-6 py-4 border-b hover:bg-gray-50"
          >

            {/* Name + Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                {tech.name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="font-semibold text-sm">{tech.name}</span>
            </div>

            {/* Email */}
            <div className="text-sm text-gray-600">
              {tech.email}
            </div>

            {/* Phone */}
            <div className="text-sm text-gray-600">
              {tech.phone}
            </div>

            {/* Category */}
            <div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  tech.category === "Hardware"
                    ? "bg-blue-100 text-blue-700"
                    : tech.category === "Software"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {tech.category}
              </span>
            </div>

            {/* Tickets */}
            <div className="flex flex-wrap gap-2">
              {tech.tickets.map((t, idx) => (
                <span
                  key={idx}
                  className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {t}
                </span>
              ))}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}