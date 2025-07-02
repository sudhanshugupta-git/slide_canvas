import React, { useState, useRef } from "react";
import LeftSidebar from "./components/LeftSidebar";
import Toolbar from "./components/Toolbar";
import SlideEditor from "./components/SlideEditor";
import { ToolbarProvider } from "./context/ToolbarContext";
import * as slideAPI from "./services/slides";

function App() {
  const [slides, setSlides] = useState([]);
  const [count, setCount] = useState(0);    // assign unique id to each slide
  const [currentIndex, setCurrentIndex] = useState(0);   // active slide
  const [selectedElementId, setSelectedElementId] = useState(null);
  const slideRefs = useRef([]);
  const [presentMode, setPresentMode] = useState(false);

  // Scroll to slide by index
  const scrollToSlide = (index) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const addTextElement = () => {
    const updatedSlides = [...slides];
    const activeSlide = updatedSlides[currentIndex];

    activeSlide.elements.push({
      type: "text",
      content: "New Text",
      style: {},
      id: Date.now(),
    });

    setSlides(updatedSlides);
  };


  const addImageElement = (base64Image) => {
    const updatedSlides = [...slides];
    const activeSlide = updatedSlides[currentIndex];
    activeSlide.elements.push({
      type: "image",
      src: base64Image,
      width: 200,
      height: 150,
      style: {
        backgroundSize: "cover",
      },
      id: Date.now(),
    });

    setSlides(updatedSlides);
  };

  const updateElementContent = (id, newContent) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) => ({
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === id ? { content: newContent, ...el } : el
        ),
      }))
    );
  };

  const addNewSlide = async () => {
    const newSlide = {
      id: count + 1,
      elements: [],
      style: {backgroundColor: "#ffffff"},
    };
    await slideAPI.addSlide(1, {
      style: { backgroundColor: "#ffffff" },
      order: slides.length,
    });
    setCount(count + 1);
    setSlides((prev) => [...prev, newSlide]);
  };



  // To delete a slide
  const handleDeleteSlide = async (slideToDelete) => {
    console.log(slideToDelete);
  await slideAPI.deleteSlideByOrder(1, slideToDelete-1); 
  setSlides((prevSlides) =>
    prevSlides.filter((slide) => slide.id !== slideToDelete)
  );
};

  return (
    <div className="flex h-screen">
      <LeftSidebar
        slides={slides}
        addNewSlide={addNewSlide}
        deleteSlide={handleDeleteSlide}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        scrollToSlide={scrollToSlide}
        presentationId={1}
      />

      <ToolbarProvider>
        <SlideEditor
          slides={slides}
          slideRefs={slideRefs}
          scrollToSlide={scrollToSlide}
          setSlides={setSlides}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          updateElementContent={updateElementContent}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          presentMode={presentMode}
          exitPresentMode={() => setPresentMode(false)}
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

export default App;
