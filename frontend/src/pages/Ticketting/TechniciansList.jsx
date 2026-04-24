import React, { useState, useEffect, useCallback } from "react";
import TicketingAddTechnician from "./TicketingAddTechnicion";
import api from "../../services/api";

function mapRowFromApi(row) {
  const phone = row.phone != null && String(row.phone).trim() !== "" ? String(row.phone).trim() : "";
  return {
    dbId: row.id,
    id: row.techId,
    name: row.name,
    email: row.email,
    phone,
    category: row.category,
    specialization: row.specialization,
    tickets: Array.isArray(row.activeTickets) ? row.activeTickets : [],
  };
}

function formatApiError(err) {
  const raw = err.response?.data;
  if (typeof raw === "string") return raw;
  if (raw?.error) return typeof raw.error === "string" ? raw.error : JSON.stringify(raw.error);
  return err.message || "Request failed.";
}

export default function TechnicianDashboard() {
  const [showAddTechnician, setShowAddTechnician] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await api.get("/api/helpdesk/technicians");
      const list = Array.isArray(response.data) ? response.data : [];
      setTechnicians(list.map(mapRowFromApi));
    } catch (err) {
      const raw = err.response?.data;
      const message =
        typeof raw === "string"
          ? raw
          : raw?.error || err.message || "Failed to load technicians.";
      setLoadError(message);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const closeForm = () => {
    setShowAddTechnician(false);
    setEditingTechnician(null);
    setActionError("");
  };

  const handleDelete = async (tech) => {
    setActionError("");
    if (
      !window.confirm(
        `Delete technician "${tech.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/api/helpdesk/technicians/${tech.dbId}`);
      await fetchTechnicians();
    } catch (err) {
      setActionError(formatApiError(err));
    }
  };

  const handleEdit = (tech) => {
    setActionError("");
    setShowAddTechnician(false);
    setEditingTechnician({
      dbId: tech.dbId,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      category: tech.category,
      specialization: tech.specialization,
    });
  };

  if (showAddTechnician || editingTechnician) {
    return (
      <TicketingAddTechnician
        editingTechnician={editingTechnician}
        onBack={closeForm}
        onSaved={() => {
          closeForm();
          fetchTechnicians();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Technicians Overview</h1>

        <button
          type="button"
          onClick={() => {
            setActionError("");
            setEditingTechnician(null);
            setShowAddTechnician(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          + Add Technician
        </button>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-2 text-xs text-gray-500 font-semibold px-6 py-3 border-b items-center">
          <div>TECH ID</div>
          <div>TECHNICIAN</div>
          <div>EMAIL</div>
          <div>PHONE</div>
          <div>CATEGORY</div>
          <div>SPECIALIZATION</div>
          <div>ACTIVE TICKETS</div>
          <div className="text-right pr-1">ACTIONS</div>
        </div>

        {loading && (
          <div className="px-6 py-8 text-sm text-gray-500">Loading technicians…</div>
        )}

        {!loading &&
          !loadError &&
          technicians.length === 0 && (
            <div className="px-6 py-8 text-sm text-gray-500">No technicians yet. Add one to get started.</div>
          )}

        {!loading &&
          technicians.map((tech, i) => (
            <div
              key={tech.id || String(tech.dbId) || i}
              className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-2 items-center px-6 py-4 border-b hover:bg-gray-50"
            >
              <div className="text-sm font-semibold text-gray-700 truncate">{tech.id}</div>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                  {tech.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <span className="font-semibold text-sm truncate">{tech.name}</span>
              </div>

              <div className="text-sm text-gray-600 truncate" title={tech.email}>
                {tech.email}
              </div>
              <div className="text-sm text-gray-600 truncate">{tech.phone || "—"}</div>

              <div className="min-w-0">
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full font-semibold truncate max-w-full ${
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

              <div className="text-sm text-gray-700 line-clamp-2 min-w-0">{tech.specialization}</div>

              <div className="flex flex-wrap gap-1 min-w-0">
                {tech.tickets.length === 0 ? (
                  <span className="text-xs text-gray-400">—</span>
                ) : (
                  tech.tickets.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded shrink-0"
                    >
                      {t}
                    </span>
                  ))
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(tech)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tech)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
