import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function TicketDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/tickets/manage");
      setTickets(response.data || []);
    } catch (err) {
      const message = err.response?.data || "Failed to load ticket data.";
      setError(typeof message === "string" ? message : "Failed to load ticket data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "OPEN").length;
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
    return { open, inProgress, resolved, total: tickets.length };
  }, [tickets]);

  const updateTicket = async (ticketId, payload) => {
    setSavingId(ticketId);
    try {
      const response = await api.patch(`/api/tickets/manage/${ticketId}`, payload);
      const updated = response.data;
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    } catch (err) {
      const message = err.response?.data || "Failed to update ticket.";
      alert(typeof message === "string" ? message : "Failed to update ticket.");
    } finally {
      setSavingId(null);
    }
  };

  const formatStatus = (status) => status?.replaceAll("_", " ") || "UNKNOWN";

  const priorityClass = (priority) => {
    if (priority === "CRITICAL" || priority === "HIGH") return "bg-red-100 text-red-700";
    if (priority === "MEDIUM") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const statusClass = (status) => {
    if (status === "OPEN") return "bg-orange-100 text-orange-700";
    if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
    if (status === "RESOLVED") return "bg-green-100 text-green-700";
    if (status === "CLOSED") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">

      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-5 mb-6">

        <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-sm">
          <p className="text-sm font-semibold text-gray-600 mb-2">OPEN TICKETS</p>
          <h2 className="text-3xl font-bold">{stats.open}</h2>
          <p className="text-gray-500 text-sm">Current open queue</p>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm">
          <p className="text-sm font-semibold text-gray-600 mb-2">IN PROGRESS</p>
          <h2 className="text-3xl font-bold">{stats.inProgress}</h2>
          <p className="text-gray-500 text-sm">— Steady flow</p>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-sm">
          <p className="text-sm font-semibold text-gray-600 mb-2">RESOLVED TODAY</p>
          <h2 className="text-3xl font-bold">{stats.resolved}</h2>
          <p className="text-green-600 text-sm">Resolved from ticket queue</p>
        </div>

        <div className="bg-[#4a1d00] text-white rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold mb-2">SYSTEM STATUS</p>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            Optimal
          </h2>
          <p className="text-xs text-gray-300 mt-2">
            All systems stable. Maintenance at 02:00 AM.
          </p>
        </div>

      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-sm">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Active Tickets</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {stats.total} TOTAL
            </span>
          </div>

          <button
            onClick={fetchTickets}
            className="bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        <div>

          {/* Header Row */}
          <div className="grid grid-cols-6 text-xs text-gray-500 font-semibold px-5 py-3 border-b">
            <div>ID</div>
            <div>ISSUE</div>
            <div>RESOURCE</div>
            <div>PRIORITY</div>
            <div>STATUS</div>
            <div>ASSIGNED TECH</div>
          </div>

          {loading && (
            <div className="px-5 py-4 text-sm text-gray-500">Loading tickets...</div>
          )}

          {error && (
            <div className="px-5 py-4 text-sm text-red-600">{error}</div>
          )}

          {/* Rows */}
          {!loading && !error && tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tickets/${t.id}`)}
              className="grid grid-cols-6 items-center px-5 py-4 border-b hover:bg-gray-50 cursor-pointer"
            >

              {/* ID */}
              <div className="font-semibold text-blue-700">#{t.id}</div>

              {/* Issue */}
              <div>
                <p className="font-semibold text-sm">{t.resource}</p>
                <p className="text-xs text-gray-500">{t.description}</p>
              </div>

              {/* Resource */}
              <div className="text-sm">
                {t.reporterName || t.reporterEmail || "-"}
              </div>

              {/* Priority */}
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${priorityClass(t.priority)}`}>
                  {t.priority}
                </span>
              </div>

              {/* Status */}
              <div onClick={(e) => e.stopPropagation()}>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusClass(t.status)}`}>
                  {formatStatus(t.status)}
                </span>

                <select
                  className="block border rounded px-2 py-1 text-xs mt-2"
                  value={t.status}
                  onChange={(e) => updateTicket(t.id, { status: e.target.value })}
                  disabled={savingId === t.id}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {/* Assigned Tech (Read Only) */}
              <div className="text-sm">
                {t.assignedTechnician || "Unassigned"}
              </div>

            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-5 text-sm text-gray-500">
          <p>Showing {tickets.length} ticket(s)</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-[#4a1d00] text-white rounded">1</button>
          </div>
        </div>

      </div>
    </div>
  );
}