import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../features/auth/context/AuthContext";

class TicketDetailsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold mb-1">Ticket page crashed</p>
            <p className="text-sm">{String(this.state.error?.message || this.state.error)}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;
  const [ticket, setTicket] = useState(null);
  const [assignedTech, setAssignedTech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  // Near real-time ticket status updates
  useEffect(() => {
    if (!id) return undefined;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/tickets/${id}`);
        setTicket((prev) => {
          const next = response.data;
          if (!prev) return next;
          if (prev.updatedAt !== next.updatedAt || prev.status !== next.status) return next;
          return prev;
        });
      } catch {
        // ignore polling errors; page already handles initial load errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      setCommentLoading(true);
      setCommentError("");
      try {
        const response = await api.get(`/api/tickets/${id}/comments`);
        setComments(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        const message = err.response?.data || "Failed to load comments.";
        setCommentError(typeof message === "string" ? message : "Failed to load comments.");
        setComments([]);
      } finally {
        setCommentLoading(false);
      }
    };

    if (id) fetchComments();
  }, [id]);

  useEffect(() => {
    const fetchAssignedTechnician = async () => {
      if (!ticket?.assignedTechnician) {
        setAssignedTech(null);
        return;
      }

      try {
        const response = await api.get("/api/helpdesk/technicians");
        const technicians = Array.isArray(response.data) ? response.data : [];
        const assignedKey = ticket.assignedTechnician.trim().toLowerCase();
        const matched = technicians.find((tech) => {
          const nameKey = (tech.name || "").trim().toLowerCase();
          const emailKey = (tech.email || "").trim().toLowerCase();
          const techIdKey = (tech.techId || "").trim().toLowerCase();
          return assignedKey === nameKey || assignedKey === emailKey || assignedKey === techIdKey;
        });
        setAssignedTech(matched || null);
      } catch (e) {
        setAssignedTech(null);
      }
    };

    fetchAssignedTechnician();
  }, [ticket]);

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

  const backPath = user?.role === "STUDENT_SUPPORT" || user?.role === "TECHNICIAN"
    ? "/dashboard"
    : "/tickets";
  const backLabel = user?.role === "STUDENT_SUPPORT" || user?.role === "TECHNICIAN"
    ? "← Back to dashboard"
    : "← Back to tickets";

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#eef2f7] p-6">
        <button onClick={() => navigate(backPath)} className="mb-4 text-sm text-blue-700">
          {backLabel}
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Ticket not found"}
        </div>
      </div>
    );
  }

  const statusLabel = ticket.status?.replace("_", " ") || "OPEN";
  const technicianName = assignedTech?.name || ticket.assignedTechnician || "Not assigned yet";
  const technicianRole = assignedTech?.specialization
    || (ticket.assignedTechnician ? `${ticket.category} Specialist` : "Waiting for technician assignment");
  const technicianInitials = technicianName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "NA";

  const myEmailKey = (user?.email || "").trim().toLowerCase();
  const myNameKey = (user?.name || "").trim().toLowerCase();

  const roleLabel = (role) => {
    if (!role) return "User";
    return String(role).replaceAll("_", " ");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  const statusKey = (ticket.status || "OPEN").toUpperCase();
  const isAtLeastInProgress = statusKey === "IN_PROGRESS" || statusKey === "RESOLVED" || statusKey === "CLOSED";
  const isAtLeastResolved = statusKey === "RESOLVED" || statusKey === "CLOSED";
  const openAtLabel = formatTime(ticket.createdAt) || "—";
  const updatedAgo = relativeCreated(ticket.updatedAt || ticket.createdAt);

  const canPost = Boolean(user && user.email);

  const postComment = async () => {
    const message = newComment.trim();
    if (!message) return;
    setPosting(true);
    setCommentError("");
    try {
      const response = await api.post(`/api/tickets/${id}/comments`, { message });
      setComments((prev) => [...prev, response.data]);
      setNewComment("");
    } catch (err) {
      const message2 = err.response?.data || "Failed to post comment.";
      setCommentError(typeof message2 === "string" ? message2 : "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    setDeletingId(commentId);
    setCommentError("");
    try {
      await api.delete(`/api/tickets/${id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      const message = err.response?.data || "Failed to delete comment.";
      setCommentError(typeof message === "string" ? message : "Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <TicketDetailsErrorBoundary>
      <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button onClick={() => navigate(backPath)} className="text-sm text-blue-700 mb-2">
            {backLabel}
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
                  <p className="text-xs text-gray-500">{openAtLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isAtLeastInProgress ? "bg-orange-500" : "bg-gray-400"}`}></div>
                <div>
                  <p className={`text-sm font-semibold ${isAtLeastInProgress ? "" : "text-gray-400"}`}>IN PROGRESS</p>
                  <p className={`text-xs ${isAtLeastInProgress ? "text-gray-500" : "text-gray-400"}`}>
                    {isAtLeastInProgress ? (statusKey === "IN_PROGRESS" ? `Updated ${updatedAgo}` : "Completed") : "Pending"}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${isAtLeastResolved ? "" : "opacity-40"}`}>
                <div className={`w-4 h-4 rounded-full ${isAtLeastResolved ? "bg-green-500" : "bg-gray-400"}`}></div>
                <div>
                  <p className={`text-sm font-semibold ${isAtLeastResolved ? "" : "text-gray-400"}`}>RESOLVED</p>
                  <p className={`text-xs ${isAtLeastResolved ? "text-gray-500" : "text-gray-400"}`}>
                    {isAtLeastResolved ? (statusKey === "RESOLVED" ? `Updated ${updatedAgo}` : "Completed") : "Pending"}
                  </p>
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
                    className="w-40 h-40 rounded object-cover border border-gray-200"
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
                {technicianInitials}
              </div>
              <div>
                <p className="font-semibold">Technician Log: {technicianName}</p>
                <p className="text-xs text-orange-200">
                  {technicianRole}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-blue-100 p-5 rounded-xl space-y-4">

            <p className="text-xs font-bold text-gray-600">
              INTERACTION TIMELINE
            </p>

            {commentError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {commentError}
              </div>
            )}

            {commentLoading ? (
              <div className="text-sm text-gray-500">Loading comments…</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-gray-500">No comments yet. Be the first to comment.</div>
            ) : (
              comments.map((c) => {
                const authorEmailKey = (c.authorEmail || "").trim().toLowerCase();
                const authorNameKey = (c.authorName || "").trim().toLowerCase();
                const isMine = (myEmailKey && authorEmailKey === myEmailKey)
                  || (myNameKey && authorNameKey === myNameKey);

                const initials = (c.authorName || c.authorEmail || "U")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join("") || "U";

                return (
                  <div key={c.id} className={isMine ? "flex justify-end" : "flex gap-3"}>
                    {!isMine && (
                      <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center text-xs shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className={isMine ? "bg-[#5a2500] text-white p-3 rounded-lg text-sm max-w-md" : "bg-white p-3 rounded-lg text-sm max-w-md"}>
                      <div className={isMine ? "text-[11px] text-orange-200 flex items-center justify-between gap-3 mb-1" : "text-[11px] text-gray-500 flex items-center justify-between gap-3 mb-1"}>
                        <span className="truncate">
                          {(c.authorName || c.authorEmail || "User")} • {roleLabel(c.authorRole)}
                        </span>
                        <span className="shrink-0">{formatTime(c.createdAt)}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{c.message}</div>
                      {isMine && (
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            className="text-[11px] px-2 py-1 rounded bg-black/20 hover:bg-black/30"
                            onClick={() => deleteComment(c.id)}
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Input */}
            <div className="flex items-center gap-2 mt-4">
              <input
                placeholder="Type your update..."
                className="flex-1 p-3 rounded-lg bg-blue-200 outline-none text-sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    postComment();
                  }
                }}
                disabled={!canPost || posting}
              />
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                onClick={postComment}
                disabled={!canPost || posting || !newComment.trim()}
              >
                ➤
              </button>
            </div>

          </div>

        </div>
      </div>
      </div>
    </TicketDetailsErrorBoundary>
  );
}