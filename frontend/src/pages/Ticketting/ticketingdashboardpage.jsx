import React, { useEffect, useState } from "react";
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
  const [showForm, setShowForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketError, setTicketError] = useState("");

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-sans">
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
            <div className="min-h-full bg-[#003049] p-7">
              {/* Title Row */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="text-[40px] font-bold text-white">Dashboard Summary</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Real-time operational overview for Building A & B
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl text-base font-semibold flex items-center gap-2 hover:bg-[#D62828]"
                >
                  + Create New Ticket
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#FCBF49] rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 bg-[#F77F00] text-blue-700 rounded-lg flex items-center justify-center mb-3">🎫</div>
                  <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">URGENT</span>
                  <p className="text-sm text-gray-600 mt-2">Active Tickets</p>
                  <p className="text-3xl font-bold">{tickets.length}</p>
                  <p className="text-xs text-gray-700">Live from your submissions</p>
                </div>
                <div className="bg-[#F77F00] rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 bg-[#FCBF49] text-yellow-700 rounded-lg flex items-center justify-center mb-3">⏳</div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs text-yellow-700">⚠ Requires immediate triage</p>
                </div>
                <div className="bg-[#D62828] rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 bg-[#003049] text-green-700 rounded-lg flex items-center justify-center mb-3">✅</div>
                  <p className="text-sm text-gray-600">Resolved this Week</p>
                  <p className="text-3xl font-bold">148</p>
                  <p className="text-xs text-green-700">✓ 98% SLA compliance</p>
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
                    const status = statusStyles[t.status] || { label: t.status, dotColor: "bg-gray-500" };
                    return (
                      <div key={t.id} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-200">
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
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}