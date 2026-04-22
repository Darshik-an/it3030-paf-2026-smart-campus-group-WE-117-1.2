import React from "react";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  OUT_OF_SERVICE: "bg-red-100 text-red-800",
};

const ResourceTable = ({ resources, onEdit, onDelete, userRole }) => (
  <div className="overflow-x-auto mt-4">
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr className="bg-[#003049] text-white">
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Type</th>
          <th className="px-4 py-2">Capacity</th>
          <th className="px-4 py-2">Location</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Description</th>
          {userRole === "ADMIN" && <th className="px-4 py-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {resources.map((r) => (
          <tr key={r.id} className="border-b">
            <td className="px-4 py-2 font-semibold">{r.name}</td>
            <td className="px-4 py-2">{r.type.replace("_", " ")}</td>
            <td className="px-4 py-2">{r.capacity}</td>
            <td className="px-4 py-2">{r.location}</td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[r.status]}`}>{r.status.replace("_", " ")}</span>
            </td>
            <td className="px-4 py-2">{r.description}</td>
            {userRole === "ADMIN" && (
              <td className="px-4 py-2 space-x-2">
                <button
                  className="bg-[#FCBF49] text-[#003049] px-2 py-1 rounded hover:bg-[#F77F00]"
                  onClick={() => onEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="bg-[#D62828] text-white px-2 py-1 rounded hover:bg-red-700"
                  onClick={() => onDelete(r.id)}
                >
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ResourceTable;
