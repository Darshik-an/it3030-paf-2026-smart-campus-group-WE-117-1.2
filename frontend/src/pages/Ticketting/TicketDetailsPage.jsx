import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/api/tickets/${id}`);
        setTicket(response.data);
      } catch (err) {
        const message = err.response?.data || "Failed to load ticket details.";
        setError(typeof message === "string" ? message : "Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const relativeCreated = (timestamp) => {
    if (!timestamp) return "just now";
    const created = new Date(timestamp);
    const diffMs = Date.now() - created.getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return <div className="min-h-screen bg-[#eef2f7] p-6">Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#eef2f7] p-6">
        <button onClick={() => navigate("/tickets")} className="mb-4 text-sm text-blue-700">
          ← Back to tickets
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Ticket not found"}
        </div>
      </div>
    );
  }

  const statusLabel = ticket.status?.replace("_", " ") || "OPEN";

  return (
    <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button onClick={() => navigate("/tickets")} className="text-sm text-blue-700 mb-2">
            ← Back to tickets
          </button>
          <p className="text-sm text-gray-500">Tickets &gt; #{ticket.id}</p>
          <h1 className="text-3xl font-bold text-gray-900">
            {ticket.resource}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-orange-900 text-white text-xs px-3 py-1 rounded-full">
            {statusLabel}
          </span>
          <span className="text-sm text-gray-500">Created {relativeCreated(ticket.createdAt)}</span>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-1 space-y-6">

          {/* Execution Path */}
          <div className="bg-blue-100 p-5 rounded-xl">
            <p className="text-xs font-bold text-gray-600 mb-4">EXECUTION PATH</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold">OPEN</p>
                  <p className="text-xs text-gray-500">Jan 24, 09:15 AM</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold">IN PROGRESS</p>
                  <p className="text-xs text-gray-500">Started 22 mins ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-40">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold">RESOLVED</p>
                  <p className="text-xs text-gray-500">Pending completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="p-4">
              <p className="font-semibold text-sm mb-1">{ticket.resource}</p>
              <p className="text-xs text-gray-500 mb-2">
                Category: {ticket.category}
              </p>
              <p className="text-xs text-gray-400">
                Priority: {ticket.priority}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-600 mb-1">ISSUE DESCRIPTION</p>
                <p className="text-xs text-gray-700 leading-5">
                  {ticket.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-blue-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-600 mb-3">
              EVIDENCE & DOCUMENTATION
            </p>

            <div className="flex gap-3">
              {ticket.images?.length ? (
                ticket.images.map((img) => (
                  <img
                    key={img}
                    src={`http://localhost:8080/uploads/tickets/${img}`}
                    alt="evidence"
                    className="w-16 h-16 rounded object-cover border border-gray-200"
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500">No images uploaded for this ticket.</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-2 space-y-6">

          {/* Technician Log */}
          <div className="bg-[#5a2500] text-white p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-300 text-black px-3 py-1 rounded-lg font-bold">
                TM
              </div>
              <div>
                <p className="font-semibold">Technician Log: Marcus Thorne</p>
                <p className="text-xs text-orange-200">
                  Senior AV Specialist
                </p>
              </div>
            </div>

            <div className="bg-[#6b2e00] p-4 rounded-lg text-sm">
              Initial inspection confirms fan blockage. Cleaning protocol
              initiated. Estimated resolution time: 45 mins.
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-blue-100 p-5 rounded-xl space-y-4">

            <p className="text-xs font-bold text-gray-600">
              INTERACTION TIMELINE
            </p>

            {/* User Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center text-xs">
                JS
              </div>
              <div className="bg-white p-3 rounded-lg text-sm max-w-md">
                {ticket.description}
              </div>
            </div>

            {/* Technician */}
            <div className="flex justify-end">
              <div className="bg-[#5a2500] text-white p-3 rounded-lg text-sm max-w-md">
                On my way. Bringing spare fan.
              </div>
            </div>

            {/* User reply */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center text-xs">
                JS
              </div>
              <div className="bg-white p-3 rounded-lg text-sm max-w-md">
                Thank you! Door is unlocked.
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 mt-4">
              <input
                placeholder="Type your update..."
                className="flex-1 p-3 rounded-lg bg-blue-200 outline-none text-sm"
              />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">
                ➤
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}