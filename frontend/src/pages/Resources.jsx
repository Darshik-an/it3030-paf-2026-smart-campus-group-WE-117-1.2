import React, { useEffect, useState, useContext } from "react";
import ResourceTable from "../features/facilities/ResourceTable";
import ResourceForm from "../features/facilities/ResourceForm";
import ResourceFilter from "../features/facilities/ResourceFilter";
import { useAuth } from "../features/auth/context/AuthContext";
import api from "../services/api";

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
      if (params.type || params.capacity || params.location) {
        res = await api.get("/resources/search", { params });
      } else {
        res = await api.get("/resources");
      }
      setResources(res.data);
    } catch (err) {
      setAlert({ type: "error", message: "Failed to load facilities." });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAdd = () => {
    setEditResource(null);
    setShowForm(true);
  };

  const handleEdit = (resource) => {
    setEditResource(resource);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this facility?")) return;
    try {
      await api.delete(`/resources/${id}`);
      setAlert({ type: "success", message: "Facility deleted." });
      fetchResources(filter);
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editResource) {
        await api.put(`/resources/${editResource.id}`, data);
        setAlert({ type: "success", message: "Facility updated." });
      } else {
        await api.post("/resources", data);
        setAlert({ type: "success", message: "Facility added." });
      }
      setShowForm(false);
      fetchResources(filter);
    } catch {
      setAlert({ type: "error", message: "Save failed." });
    }
  };

  const handleFilter = (params) => {
    setFilter(params);
    fetchResources(params);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#003049]">Facilities</h1>
        {user?.role === "ADMIN" && (
          <button
            className="bg-[#F77F00] text-white px-4 py-2 rounded hover:bg-[#FCBF49]"
            onClick={handleAdd}
          >
            Add Facility
          </button>
        )}
      </div>
      <ResourceFilter onFilter={handleFilter} />
      {alert && (
        <div className={`my-2 p-2 rounded ${alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {alert.message}
        </div>
      )}
      {loading ? (
        <div className="text-center py-10 text-[#003049]">Loading...</div>
      ) : (
        <ResourceTable
          resources={resources}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={user?.role}
        />
      )}
      {showForm && (
        <ResourceForm
          resource={editResource}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
      {!loading && resources.length === 0 && (
        <div className="text-center py-10 text-[#003049]">No facilities found</div>
      )}
    </div>
  );
};

export default Resources;
