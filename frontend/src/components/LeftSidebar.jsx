import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import {getAllPresentations, updatePresentation } from "../services/presentations";
import { useNavigate } from "react-router-dom";

const LeftSidebar = ({
  slides,
  addNewSlide,
  deleteSlide,
  currentIndex,
  scrollToSlide,
  presentationId,
}) => {
  const navigate = useNavigate();

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Presentation title state and edit mode
  const [title, setTitle] = useState("Untitled");
  const [isEditing, setIsEditing] = useState(false);

  // Handle title input change
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Update backend when title editing is finished
  const handleBlur = () => {
    setIsEditing(false);
    if (presentationId && title.trim()) {
      updatePresentation(presentationId, { title });
    }
  };

  // Store slide thumbnails for sidebar preview
  const [slideThumbnails, setSlideThumbnails] = useState({});
  useEffect(() => {
    slides.forEach((slide, index) => {
      const slideElement = document.querySelector(`.slide-${index}`);
      if (slideElement) {
        html2canvas(slideElement).then((canvas) => {
          setSlideThumbnails((prev) => ({
            ...prev,
            [index]: canvas.toDataURL("image/png"),
          }));
        });
      }
    });
  }, [slides]);

  useEffect(() => {
  if (!presentationId) return;
  getAllPresentations().then((presentations) => {
    const current = presentations.find((p) => p.id === presentationId);
    if (current) setTitle(current.title);
  });
}, [presentationId]);

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-1/5"
      } bg-[#2A2A2A] p-4 border-r border-gray-700 transition-all duration-300`}
    >
      {/* Sidebar header with title and collapse/expand button */}
      <div className="flex items-center justify-between mb-2">
        {!isCollapsed && (
          <button
            className="flex items-center gap-1 bg-[#23272a] hover:bg-blue-600 text-white px-1 rounded transition shadow border border-gray-700"
            onClick={() => navigate("/")}
          >
            <i className="uil uil-folder-open text-sm"></i>
            <span className="font-medium">Files</span>
          </button>
        )}
        {isCollapsed ? (
          <div className="flex justify-center items-center h-full w-full">
            <i
              className="uil uil-arrow-from-right text-white hover:text-gray-300 cursor-pointer active:scale-95"
              onClick={toggleSidebar}
              title="Expand"
            ></i>
          </div>
        ) : (
          <i
            className="uil uil-left-arrow-from-left text-white hover:text-gray-300 cursor-pointer active:scale-95"
            onClick={toggleSidebar}
            title="Collapse"
          ></i>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleBlur}
              autoFocus
              className="text-sm font-semibold text-white px-1 py-1 rounded"
            />
          ) : (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          <i
            className="uil uil-edit text-lg cursor-pointer p-1 text-white hover:text-gray-300 active:scale-95"
            title="Edit Title"
            onClick={() => setIsEditing(true)}
          ></i>
        </div>
      )}

      {/* New Slide Button */}
      {!isCollapsed && (
        <>
          <div className="mt-2 flex justify-center">
            <button
              className="text-[#ECEDEB] cursor-pointer flex items-center border rounded py-0.5 px-5 gap-2 hover:text-gray-300 active:scale-95 transition-transform duration-100"
              onClick={addNewSlide}
            >
              <span>New Slide</span>
              <i className="uil uil-plus"></i>
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-[#D0D4CB] border-opacity-20 mt-4 mb-3"></div>

          {/* Slide Thumbnails List */}
          <div className="overflow-y-auto max-h-[78vh] pr-1 sidebar-scroll">
            <div className="flex flex-col items-center gap-5 p-4">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`relative border rounded p-2 flex items-center w-40 cursor-pointer transition-all duration-300
                  ${
                    currentIndex === index
                      ? "bg-blue-200 border-blue-500"
                      : "bg-[#343434] border-gray-600 hover:border-blue-500"
                  }`}
                  onClick={() => scrollToSlide(index)}
                >
                  {/* Slide Number */}
                  <span className="text-sm font-medium text-[#222] mr-2">
                    {index + 1}.
                  </span>

                  {/* Delete Slide Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide);
                    }}
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 active:scale-95"
                    title="Delete Slide"
                  >
                    <i className="uil uil-trash-alt"></i>
                  </button>

                  {/* Slide Preview Thumbnail */}
                  {slideThumbnails[index] ? (
                    <img
                      src={slideThumbnails[index]}
                      alt={`Slide ${index + 1}`}
                      className="bg-gray-500 w-36 h-18 rounded mr-1"
                    />
                  ) : (
                    <div className="bg-gray-500 w-36 h-18 rounded mr-1"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeftSidebar;
