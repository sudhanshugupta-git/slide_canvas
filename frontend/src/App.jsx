import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import SlideEditor from "./components/SlideEditor";
import Toolbar from "./components/Toolbar";
import { ToolbarProvider } from "./context/ToolbarContext";

// services
import * as slideAPI from "./services/slides";
import PresentationsHome from "./components/PresentationsHome";
import * as elementAPI from "./services/elements";

function PresentationEditorWrapper() {
  const { id } = useParams();
  const presentationId = Number(id);

  const [slides, setSlides] = useState([]);
  const [count, setCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const slideRefs = useRef([]);
  const [presentMode, setPresentMode] = useState(false);

  // Scroll to slide by index
  const scrollToSlide = (index) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch slides for this presentation
  const getSlides = async () => {
    try {
      const data = await slideAPI.getSlides(presentationId);
      setSlides([...data]);
    } catch (err) {
      console.log("something went wrong!", err);
    }
  };

  // Add new slide
  const addNewSlide = async () => {
    const newOrder = (slides[slides.length - 1]?.order ?? -1) + 1;
    // console.log("New slide order:", newOrder);

    const newSlide = {
      id: count + 1,
      elements: [],
      style: { backgroundColor: "#ffffff" },
      order: newOrder,
    };

    await slideAPI.addSlide(presentationId, {
      style: { backgroundColor: "#ffffff" },
      order: newOrder,
    });

    setCount(count + 1);
    setSlides((prev) => [...prev, newSlide]);
  };

  // Update element content
  const updateElement = async (elementId, updatedFields) => {
    // Update backend
    await elementAPI.updateElement(elementId, updatedFields);

    // Update frontend state
    setSlides((prevSlides) =>
      prevSlides.map((slide) => ({
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === elementId ? { ...el, ...updatedFields } : el
        ),
      }))
    );
  };

  // Delete slide
  const handleDeleteSlide = async (slideToDelete) => {
    await slideAPI.deleteSlideByOrder(presentationId, slideToDelete.order);
    getSlides();
  };

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === "Delete" && selectedElementId) {
        try {
          await elementAPI.deleteElement(selectedElementId);
          getSlides();
        } catch (error) {
          console.error("Failed to delete element:", error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, slides]);

  // Add text element
  const addTextElement = async () => {
    const updatedSlides = [...slides];
    const activeSlide = updatedSlides[currentIndex];
    // Call backend to add element
    const newElement = await elementAPI.addElement(activeSlide.id, {
      type: "text",
      content: "New Text",
      style: {},
      order: activeSlide.elements.length,
      position: {},
    });
    activeSlide.elements.push(newElement);
    setSlides(updatedSlides);
  };

  // Add image element
  const addImageElement = async (base64Image) => {
    const updatedSlides = [...slides];
    const activeSlide = updatedSlides[currentIndex];
    console.log(activeSlide);
    // Call backend to add element
    const newElement = await elementAPI.addElement(activeSlide.id, {
      type: "image",
      src: base64Image,
      width: 200,
      height: 150,
      style: { backgroundSize: "cover" },
      order: activeSlide.elements.length,
      position: {},
    });
    activeSlide.elements.push(newElement);
    setSlides(updatedSlides);
  };

  useEffect(() => {
    getSlides();
    // eslint-disable-next-line
  }, [presentationId]);

  return (
    <div className="flex h-screen"> 
      <LeftSidebar
        slides={slides}
        addNewSlide={addNewSlide}
        deleteSlide={handleDeleteSlide}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        scrollToSlide={scrollToSlide}
        presentationId={presentationId}
      />

      <ToolbarProvider>
        <SlideEditor
          slides={slides}
          slideRefs={slideRefs}
          scrollToSlide={scrollToSlide}
          setSlides={setSlides}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          updateElement={updateElement}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          presentMode={presentMode}
          exitPresentMode={() => setPresentMode(false)}
          getSlides={getSlides} // <-- Pass this
          presentationId={presentationId} // <-- Pass this
        />

        <Toolbar
          onPresent={() => setPresentMode(true)}
          addImageElement={addImageElement}
          addHeadingElement={addTextElement}
          selectedElementId={selectedElementId}
        />
      </ToolbarProvider>
    </div>
  );
}

function App() {
  const navigate = useNavigate();

  const handleOpenPresentation = (presentationId) => {
    navigate(`/presentation/${presentationId}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PresentationsHome onOpenPresentation={handleOpenPresentation} />
        }
      />
      <Route path="/presentation/:id" element={<PresentationEditorWrapper />} />
    </Routes>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
