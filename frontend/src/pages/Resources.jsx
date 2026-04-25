import React, { useEffect, useState } from "react";
import { Plus, Building2, Inbox, BookOpen, FlaskConical, Monitor, Mic, CheckCircle2, XCircle } from "lucide-react";
import ResourceTable from "../features/facilities/ResourceTable";
import ResourceForm from "../features/facilities/ResourceForm";
import ResourceFilter from "../features/facilities/ResourceFilter";
import { useAuth } from "../features/auth/context/AuthContext";
import api from "../services/api";

const typeIcons = {
  LECTURE_HALL: BookOpen,
  LAB: FlaskConical,
  MEETING_ROOM: Monitor,
  AUDITORIUM: Mic,
};

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editResource, setEditResource] = useState(null);
  const [filter, setFilter] = useState({ type: "", capacity: "", location: "" });
  const [alert, setAlert] = useState(null);

  const fetchResources = async (params = {}) => {
    setLoading(true);
    try {
      let res;
      // Build a clean params object — only include non-empty values
      const cleanParams = {};
      if (params.type) cleanParams.type = params.type;
      if (params.capacity) cleanParams.capacity = params.capacity;
      if (params.location && params.location.trim()) cleanParams.location = params.location.trim();

      if (Object.keys(cleanParams).length > 0) {
        res = await api.get("/api/resources/search", { params: cleanParams });
      } else {
        res = await api.get("/api/resources");
      }
      setResources(res.data);
    } catch {
      setAlert({ type: "error", message: "Failed to load facilities." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const handleAdd = () => { setEditResource(null); setShowForm(true); };
  const handleEdit = (r) => { setEditResource(r); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this facility?")) return;
    try {
      await api.delete(`/api/resources/${id}`);
      setAlert({ type: "success", message: "Facility deleted successfully." });
      fetchResources(filter);
    } catch {
      setAlert({ type: "error", message: "Delete failed. Please try again." });
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editResource) {
        await api.put(`/api/resources/${editResource.id}`, data);
        setAlert({ type: "success", message: "Facility updated successfully." });
      } else {
        await api.post("/api/resources", data);
        setAlert({ type: "success", message: "Facility created successfully." });
      }
      setShowForm(false);
      fetchResources(filter);
    } catch {
      setAlert({ type: "error", message: "Save failed. Please check all fields and try again." });
    }
  };

  const handleFilter = (params) => {
    setFilter(params);
    fetchResources(params);
  };

  // Stats
  const activeCount = resources.filter((r) => r.status === "ACTIVE").length;
  const typeCounts = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#003049] via-[#003d5c] to-[#001f30] px-8 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F77F00]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#F77F00]/20 rounded-xl flex items-center justify-center border border-[#F77F00]/30">
                  <Building2 className="text-[#F77F00]" size={20} />
                </div>
                <span className="text-[#F77F00] text-sm font-bold uppercase tracking-widest">Campus Facilities</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                Explore Our Spaces
              </h1>
              <p className="text-blue-200/70 mt-2 font-medium max-w-md">
                Browse, search, and manage all campus facilities — from lecture halls to labs and meeting rooms.
              </p>
            </div>

            {user?.role === "ADMIN" && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-[#F77F00] hover:bg-[#e07000] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#F77F00]/30 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={20} />
                Add Facility
              </button>
            )}
          </div>

          {/* Stats Row */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total</p>
                <p className="text-3xl font-black text-white mt-1">{resources.length}</p>
                <p className="text-white/40 text-xs mt-0.5">facilities</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Active</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-black text-emerald-400">{activeCount}</p>
                  <CheckCircle2 className="text-emerald-400 mt-1" size={18} />
                </div>
                <p className="text-white/40 text-xs mt-0.5">available now</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Inactive</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-black text-rose-400">{resources.length - activeCount}</p>
                  <XCircle className="text-rose-400 mt-1" size={18} />
                </div>
                <p className="text-white/40 text-xs mt-0.5">out of service</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Types</p>
                <p className="text-3xl font-black text-[#FCBF49] mt-1">{Object.keys(typeCounts).length}</p>
                <p className="text-white/40 text-xs mt-0.5">categories</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 -mt-6 pb-12 relative z-10">
        {/* Alert */}
        {alert && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
            alert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}>
            {alert.type === "success" ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <XCircle size={18} className="text-rose-600 shrink-0" />}
            <span className="font-semibold">{alert.message}</span>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <ResourceFilter onFilter={handleFilter} />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#003049]/20 border-t-[#003049] rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-semibold text-lg">Loading facilities...</p>
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">
                Showing <span className="font-bold text-slate-700">{resources.length}</span> {resources.length === 1 ? "facility" : "facilities"}
              </p>
            </div>
            <ResourceTable
              resources={resources}
              onEdit={handleEdit}
              onDelete={handleDelete}
              userRole={user?.role}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
              <Inbox size={36} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No facilities found</h3>
            <p className="text-slate-400 max-w-xs text-center">Try adjusting your filters or clear them to see all facilities.</p>
            {user?.role === "ADMIN" && (
              <button
                onClick={handleAdd}
                className="mt-6 flex items-center gap-2 bg-[#003049] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#F77F00] transition-colors"
              >
                <Plus size={18} /> Add First Facility
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ResourceForm
          resource={editResource}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default Resources;
