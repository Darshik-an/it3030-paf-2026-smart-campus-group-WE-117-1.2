import React, { useEffect, useState } from "react";
import TicketingFormPage from "./ticketingformpage";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";

const tickets = [
  { id: "#1234", title: "Projector Failure - Auditorium B", tag: "HARDWARE", tagColor: "bg-blue-100 text-blue-700", time: "2h ago", priority: "HIGH PRIORITY", priorityColor: "bg-red-100 text-red-700", status: "In Progress", dotColor: "bg-blue-500" },
  { id: "#1235", title: "Wi-Fi Connectivity Issues - Library", tag: "SOFTWARE", tagColor: "bg-green-100 text-green-700", time: "4h ago", priority: "MEDIUM", priorityColor: "bg-yellow-100 text-yellow-700", status: "Pending", dotColor: "bg-yellow-500" },
  { id: "#1236", title: "HVAC Temperature Control - Lab 402", tag: "FACILITY", tagColor: "bg-orange-100 text-orange-700", time: "6h ago", priority: "HIGH PRIORITY", priorityColor: "bg-red-100 text-red-700", status: "In Progress", dotColor: "bg-blue-500" },
];

export default function TicketingDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            <TicketingFormPage onBack={() => setShowForm(false)} />
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
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-xs text-gray-700">↗ +4 since yesterday</p>
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
                {tickets.map((t) => (
                  <div key={t.id} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-200">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">🖥</div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-400">{t.id}</span>
                      <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-1 rounded ${t.tagColor}`}>{t.tag}</span>
                        <span className="text-xs text-gray-400">🕐 Submitted {t.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-1 rounded-full ${t.priorityColor}`}>{t.priority}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${t.dotColor}`} />
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}