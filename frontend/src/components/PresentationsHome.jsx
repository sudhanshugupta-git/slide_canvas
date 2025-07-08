import React, { useEffect, useState } from "react";
import {
  getAllPresentations,
  createPresentation,
  deletePresentation,
} from "../services/presentations";
import { getFirstSlide } from "../services/slides";
import useSlideThumbnails from "../hooks/useSlidePreviews";

const PresentationsHome = ({ onOpenPresentation }) => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [firstSlides, setFirstSlides] = useState([]);

  useEffect(() => {
    getAllPresentations().then((data) => {
      setPresentations(data);
      setLoading(false);
    });
  }, []);

  // Fetch first slide for each presentation
  useEffect(() => {
    async function fetchFirstSlides() {
      const slides = [];
      for (const p of presentations) {
        const slide = await getFirstSlide(p.id);
        slides.push(slide);
      }
      setFirstSlides(slides);
      console.log("First slides fetched:", slides);
    }
    if (presentations.length > 0) fetchFirstSlides();
  }, [presentations]);

  // Generate thumbnails for first slides
  const thumbnails = useSlideThumbnails(firstSlides);
  console.log("Thumbnails:", thumbnails);

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-[#1F1F1F] text-[#ECEDEB]">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-8 mt-4">
          Slide Canvas🎨
        </h1>

        {/* Create New Presentation */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter new presentation title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            disabled={creating}
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Presentation"}
          </button>
        </div>

        {/* Presentations List */}
        <h2 className="text-2xl font-semibold mb-4">Your Presentations</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No presentations yet. Create your first one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {presentations.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onOpenPresentation(p.id)}
                className="group relative bg-[#2A2A2A] border border-gray-700 rounded-xl p-5 cursor-pointer transition hover:shadow-lg hover:border-blue-600"
              >
                {/* Delete Button */}
                <button
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-10 bg-[#1F1F1F] rounded-full p-1"
                  title="Delete Presentation"
                  onClick={(e) => handleDelete(p.id, e)}
                >
                  <i className="uil uil-trash-alt"></i>
                </button>

                {/* Slide Thumbnail */}
                {thumbnails[idx] ? (
                  <img
                    src={thumbnails[idx]}
                    alt="Slide Preview"
                    className="rounded mb-2 border border-gray-700 w-full h-auto h-32"
                  />

                ) : (
                  <div className="bg-[#333] w-full h-32 mb-2 rounded flex items-center justify-center text-sm text-gray-500">
                    No Preview
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <i className="uil uil-presentation text-blue-400 text-xl"></i>
                  <span className="text-lg font-semibold truncate group-hover:text-blue-400">
                    {p.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-10 text-gray-500 text-xs text-center">
        &copy; {new Date().getFullYear()} Slide Canvas. All rights reserved.
      </footer>

      {/* Hidden container for rendering slides to be captured by html2canvas */}
      <div className="absolute -top-[9999px] left-0 opacity-100 pointer-events-none">
        {firstSlides.map((slide, index) => (
          <div
            key={index}
            className={`thumbnail-slide slide-${index}`}
            style={{
              width: "640px", 
              height: "360px",
              backgroundColor: slide.style?.backgroundColor || "#fff",
              padding: "12px",
              borderRadius: "8px",
              overflow: "hidden",
              fontFamily: "sans-serif",
              fontSize: "14px",
              color: "#000",
            }}
          >
            {slide.elements?.map((el) => {
              if (el.type === "text") {
                return (
                  <div
                    key={el.id}
                    style={{
                      // position: "absolute",
                      ...el.style,
                      pointerEvents: "none",
                      userSelect: "none",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {el.content}
                  </div>
                );
              } else if (el.type === "image") {
                return (
                  <img
                    key={el.id}
                    src={el.src}
                    alt="Slide Element"
                    style={{
                      position: "absolute",
                      ...el.style,
                      objectFit: "contain",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresentationsHome;
