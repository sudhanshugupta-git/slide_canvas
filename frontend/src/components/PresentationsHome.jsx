import React, { useEffect, useState } from "react";
import { getAllPresentations, createPresentation, deletePresentation } from "../services/presentations";

const PresentationsHome = ({ onOpenPresentation }) => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getAllPresentations().then((data) => {
      setPresentations(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const created = await createPresentation(newTitle.trim());
      setPresentations((prev) => [...prev, created]);
      setNewTitle("");
      onOpenPresentation(created.id);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      await deletePresentation(id);
      setPresentations((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2 bg-white">
      <div className="w-full max-w-5xl mx-auto bg-white">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-tight">
          Slide Canvas
        </h1>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter new presentation title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
            disabled={creating}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-60"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Presentation"}
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Presentations</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : presentations.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No presentations yet. Create your first one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {presentations.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-xl shadow hover:shadow-xl border border-gray-200 cursor-pointer transition-all duration-200 flex flex-col justify-between p-5 hover:bg-blue-50 relative"
                onClick={() => onOpenPresentation(p.id)}
              >
                {/* Delete Button */}
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 z-10"
                  title="Delete Presentation"
                  onClick={(e) => handleDelete(p.id, e)}
                >
                  <i className="uil uil-trash-alt"></i>
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <i className="uil uil-presentation text-blue-600 text-2xl"></i>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 truncate">
                      {p.title}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Presentation ID: {p.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Slide Canvas. All rights reserved.
      </footer>
    </div>
  );
};

export default PresentationsHome;