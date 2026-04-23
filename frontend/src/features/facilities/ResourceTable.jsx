import React from "react";
import { Edit, Trash2, MapPin, Users, ArrowRight, Wifi, Monitor, FlaskConical, BookOpen, Wrench, CheckCircle2, XCircle } from "lucide-react";

const typeConfig = {
  LECTURE_HALL: {
    label: "Lecture Hall",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
  LAB: {
    label: "Laboratory",
    icon: FlaskConical,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
    badge: "bg-violet-100 text-violet-700",
  },
  MEETING_ROOM: {
    label: "Meeting Room",
    icon: Monitor,
    gradient: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-100",
    badge: "bg-teal-100 text-teal-700",
  },
  EQUIPMENT: {
    label: "Equipment",
    icon: Wrench,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
};

const defaultConfig = {
  label: "Facility",
  icon: Wifi,
  gradient: "from-slate-400 to-slate-500",
  bg: "bg-slate-50",
  text: "text-slate-600",
  border: "border-slate-100",
  badge: "bg-slate-100 text-slate-600",
};

const ResourceTable = ({ resources, onEdit, onDelete, userRole }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {resources.map((r) => {
      const config = typeConfig[r.type] || defaultConfig;
      const Icon = config.icon;
      const isActive = r.status === "ACTIVE";

      return (
        <div
          key={r.id}
          className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          {/* Card Header with gradient */}
          <div className={`bg-gradient-to-br ${config.gradient} p-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="text-white" size={24} />
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-emerald-400/20 text-white border border-emerald-300/40" : "bg-red-400/20 text-white border border-red-300/40"}`}>
                {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {isActive ? "Active" : "Out of Service"}
              </span>
            </div>

            <div className="mt-4 relative z-10">
              <h3 className="text-xl font-bold text-white leading-tight">{r.name}</h3>
              <span className="text-white/70 text-xs font-medium mt-0.5 block">{config.label}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 text-slate-600">
                <div className={`w-8 h-8 ${config.bg} ${config.border} border rounded-lg flex items-center justify-center shrink-0`}>
                  <Users size={14} className={config.text} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Capacity</p>
                  <p className="text-sm font-bold text-slate-700">{r.capacity} persons</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className={`w-8 h-8 ${config.bg} ${config.border} border rounded-lg flex items-center justify-center shrink-0`}>
                  <MapPin size={14} className={config.text} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Location</p>
                  <p className="text-sm font-bold text-slate-700">{r.location}</p>
                </div>
              </div>

              {r.description && (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100 leading-relaxed line-clamp-2 mt-2">
                  {r.description}
                </p>
              )}
            </div>

            {/* Admin Actions */}
            {userRole === "ADMIN" && (
              <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onEdit(r)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                >
                  <Edit size={15} /> Edit
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}

            {/* User view — no action buttons but a nice detail link feel */}
            {userRole !== "ADMIN" && (
              <div className="flex items-center gap-1 text-xs font-semibold mt-5 pt-4 border-t border-slate-100">
                <span className={`${config.badge} px-2.5 py-1 rounded-full`}>{config.label}</span>
                <span className="ml-auto text-slate-400 flex items-center gap-1 group-hover:text-slate-600 transition-colors">
                  View details <ArrowRight size={12} />
                </span>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default ResourceTable;
