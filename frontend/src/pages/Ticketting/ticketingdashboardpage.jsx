import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketingFormPage from "./ticketingformpage";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";

const categoryStyles = {
  HARDWARE: "bg-blue-100 text-blue-700",
  SOFTWARE: "bg-green-100 text-green-700",
  FACILITY: "bg-orange-100 text-orange-700",
};

const priorityStyles = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-200 text-red-800",
};

const statusStyles = {
  OPEN: { label: "Open", dotColor: "bg-yellow-500" },
  IN_PROGRESS: { label: "In Progress", dotColor: "bg-blue-500" },
  RESOLVED: { label: "Resolved", dotColor: "bg-green-500" },
  CLOSED: { label: "Closed", dotColor: "bg-gray-500" },
  REJECTED: { label: "Rejected", dotColor: "bg-red-500" },
};

function formatRelativeTime(timestamp) {
  if (!timestamp) return "just now";
  const created = new Date(timestamp);
  const diffMs = Date.now() - created.getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TicketingDashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketError, setTicketError] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);
  const [editValues, setEditValues] = useState({
    resource: "",
    category: "HARDWARE",
    priority: "LOW",
    description: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoadingTickets(true);
      setTicketError("");
      try {
        const response = await api.get("/api/tickets");
        setTickets(response.data || []);
      } catch (err) {
        const message = err.response?.data || "Failed to load tickets.";
        setTicketError(typeof message === "string" ? message : "Failed to load tickets.");
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const beginEdit = (ticket) => {
    const statusKey = String(ticket?.status || "").toUpperCase();
    if (statusKey !== "OPEN") {
      alert("You can only edit tickets that are in OPEN status.");
      return;
    }
    setEditingTicket(ticket);
    setEditValues({
      resource: ticket?.resource || "",
      category: String(ticket?.category || "HARDWARE").toUpperCase(),
      priority: String(ticket?.priority || "LOW").toUpperCase(),
      description: ticket?.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingTicket(null);
    setSavingEdit(false);
  };

  const saveEdit = async () => {
    if (!editingTicket) return;
    const statusKey = String(editingTicket?.status || "").toUpperCase();
    if (statusKey !== "OPEN") {
      alert("You can only edit tickets that are in OPEN status.");
      cancelEdit();
      return;
    }

    const payload = {
      resource: editValues.resource?.trim(),
      category: editValues.category,
      priority: editValues.priority,
      description: editValues.description?.trim(),
    };

    if (!payload.resource || !payload.description) {
      alert("Affected resource and issue description are required.");
      return;
    }

    setSavingEdit(true);
    try {
      const response = await api.patch(`/api/tickets/${editingTicket.id}`, payload);
      const updated = response.data;
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTicket(null);
    } catch (err) {
      const message = err.response?.data || "Failed to update ticket.";
      alert(typeof message === "string" ? message : "Failed to update ticket.");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteMyTicket = async (ticket) => {
    const statusKey = String(ticket?.status || "").toUpperCase();
    if (statusKey !== "OPEN") {
      alert("You can only delete tickets that are in OPEN status.");
      return;
    }
    if (!window.confirm(`Delete ticket #${ticket.id}? This action cannot be undone.`)) return;

    setDeletingId(ticket.id);
    try {
      await api.delete(`/api/tickets/${ticket.id}`);
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      if (editingTicket?.id === ticket.id) setEditingTicket(null);
    } catch (err) {
      const message = err.response?.data || "Failed to delete ticket.";
      alert(typeof message === "string" ? message : "Failed to delete ticket.");
    } finally {
      setDeletingId(null);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    (tickets || []).forEach((t) => {
      if (!t?.status) return;
      const key = String(t.status).toUpperCase();
      if (key in counts) counts[key] += 1;
    });
    return counts;
  }, [tickets]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#ffffff] font-sans">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDesktopMenuOpen={isDesktopMenuOpen}
        setIsDesktopMenuOpen={setIsDesktopMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setIsDesktopMenuOpen={setIsDesktopMenuOpen}
        />

        <div className="flex-1 overflow-y-auto">
          {showForm ? (
            <TicketingFormPage
              onBack={() => setShowForm(false)}
              onTicketCreated={handleTicketCreated}
            />
          ) : (
            <div className="min-h-full bg-[#fcfcfc] p-7">
              {/* Title Row */}
              {/* Banner Header */}
            <div
              className="flex items-center justify-between mb-5 rounded-2xl px-8 py-8 gap-6"
              style={{ background: "linear-gradient(135deg, #003049 0%, #1a6b8a 50%, #2980b9 100%)" }}
            >
              <div>
                <span className="inline-block bg-white/15 text-white text-[11px] font-medium tracking-widest uppercase rounded-full px-4 py-1 mb-3">
                  TICKETS DASHBOARD
                </span>
                <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight text-white">
                  Report. Track. Resolve.
                </h1>
                <p className="mt-2 max-w-2xl text-sm md:text-base text-blue-100/90">
                 Raise a ticket and get quick, effective solutions—track progress every step of the way
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D62828")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#F77F00")}
                className="text-white px-6 py-3 rounded-xl text-base font-semibold flex items-center gap-2 flex-shrink-0 transition-colors duration-200"
                style={{ background: "#F77F00" }}
              >
                + Create New Ticket
              </button>
            </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#fffbeb] rounded-xl p-4 border border-[#fde68a]">
                  <div className="w-8 h-8 bg-[#F77F00] text-blue-700 rounded-lg flex items-center justify-center mb-3">🎫</div>
                  <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">OPEN</span>
                  <p className="text-sm text-gray-600 mt-2">Open Tickets</p>
                  <p className="text-3xl font-bold">{statusCounts.OPEN}</p>
                  <p className="text-xs text-gray-700">Waiting for action</p>
                </div>
                <div className="bg-[#ecfdf5] rounded-xl p-4 border border-[#a7f3d0]">
                  <div className="w-8 h-8 bg-[#FCBF49] text-yellow-700 rounded-lg flex items-center justify-center mb-3">⏳</div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold">{statusCounts.IN_PROGRESS}</p>
                  <p className="text-xs text-yellow-700">Being worked on</p>
                </div>
                <div className="bg-[#fff1f2] rounded-xl p-4 border border-[#fdccd2]">
                  <div className="w-8 h-8 bg-[#003049] text-green-700 rounded-lg flex items-center justify-center mb-3">✅</div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold">{statusCounts.RESOLVED}</p>
                  <p className="text-xs text-green-700">Completed tickets</p>
                </div>
              </div>

              {/* Section Header */}
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-white">Recent Tickets</p>
                <span className="text-sm text-blue-400 cursor-pointer">View All Archive →</span>
              </div>

              {/* Tickets */}
              <div className="flex flex-col gap-2">
                {loadingTickets && (
                  <div className="bg-white rounded-xl p-4 text-sm text-gray-600 border border-gray-200">
                    Loading tickets...
                  </div>
                )}

                {!loadingTickets && ticketError && (
                  <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700 border border-red-200">
                    {ticketError}
                  </div>
                )}

                {!loadingTickets && !ticketError && tickets.length === 0 && (
                  <div className="bg-white rounded-xl p-4 text-sm text-gray-600 border border-gray-200">
                    No tickets yet. Create your first ticket.
                  </div>
                )}

                {!loadingTickets &&
                  !ticketError &&
                  tickets.map((t) => {
                    const statusKey = String(t.status || "").toUpperCase();
                    const canEditDelete = statusKey === "OPEN";
                    const status = statusStyles[statusKey] || { label: t.status, dotColor: "bg-gray-500" };
                    return (
                      <div
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") navigate(`/tickets/${t.id}`);
                        }}
                        className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-200 text-left hover:border-gray-400 transition cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">🖥</div>
                        <div className="flex-1">
                          <span className="text-xs text-gray-400">#{t.id}</span>
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.resource}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-1 rounded ${categoryStyles[t.category] || "bg-gray-100 text-gray-700"}`}>
                              {t.category}
                            </span>
                          {!!t.images?.length && (
                            <span className="text-[10px] px-2 py-1 rounded bg-purple-100 text-purple-700">
                              {t.images.length} image{t.images.length > 1 ? "s" : ""}
                            </span>
                          )}
                            <span className="text-xs text-gray-400">🕐 Submitted {formatRelativeTime(t.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] px-2 py-1 rounded-full ${priorityStyles[t.priority] || "bg-gray-100 text-gray-700"}`}>
                            {t.priority}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                            {status.label}
                          </span>
                          {canEditDelete && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  beginEdit(t);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteMyTicket(t);
                                }}
                                disabled={deletingId === t.id}
                              >
                                {deletingId === t.id ? "Deleting…" : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingTicket && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          onClick={cancelEdit}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Edit Ticket #{editingTicket.id}</p>
                <h3 className="text-lg font-bold text-gray-900">Update your ticket</h3>
                <p className="text-xs text-gray-500 mt-1">
                  You can only edit tickets while they are in <span className="font-semibold">OPEN</span> status.
                </p>
              </div>
              <button type="button" className="text-gray-500 hover:text-gray-700" onClick={cancelEdit}>
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
                  AFFECTED RESOURCE
                </label>
                <input
                  value={editValues.resource}
                  onChange={(e) => setEditValues((p) => ({ ...p, resource: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="e.g. Lab 03 - Projector"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
                    CATEGORY
                  </label>
                  <select
                    value={editValues.category}
                    onChange={(e) => setEditValues((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  >
                    <option value="HARDWARE">HARDWARE</option>
                    <option value="SOFTWARE">SOFTWARE</option>
                    <option value="FACILITY">FACILITY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
                    PRIORITY
                  </label>
                  <select
                    value={editValues.priority}
                    onChange={(e) => setEditValues((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-widest text-gray-700 mb-2">
                  ISSUE DESCRIPTION
                </label>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues((p) => ({ ...p, description: e.target.value }))}
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="Describe the issue in detail..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-lg text-sm text-gray-700" onClick={cancelEdit}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-60"
                onClick={saveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}