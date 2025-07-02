import { useMemo, useEffect, useRef } from "react";
import { useToolbar } from "../context/ToolbarContext";
import { useDebounce, useDebouncedValue } from "../hooks";
import * as slideAPI from "../services/slides";

const Editor = ({
  slides,
  setSlides,
  currentIndex,
  setCurrentIndex,
  updateElementContent,
  selectedElementId,
  setSelectedElementId,
  slideRefs,
  scrollToSlide,
  presentMode,
  exitPresentMode,
}) => {
  const containerRef = useRef(null);
  const lastAppliedElementIdRef = useRef(null);

  const {
    isBold,
    isItalic,
    isUnderline,
    isStrikeThrough,
    activeAlign,
    textColor,
    textBgColor,
    bgColor,
    fontSize,
    opacity,
    fontFamily,
    setAppliedStyles,
    setBgColor,
  } = useToolbar();

  const appliedStyles = useMemo(
    () => ({
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: `${isUnderline ? "underline " : ""}${
        isStrikeThrough ? "line-through" : ""
      }`,
      textAlign: activeAlign || "left",
      color: textColor,
      backgroundColor: textBgColor,
      fontSize: `${fontSize}px`,
      opacity: Number(opacity) / 100,
      fontFamily,
    }),
    [
      isBold,
      isItalic,
      isUnderline,
      isStrikeThrough,
      activeAlign,
      textColor,
      textBgColor,
      fontSize,
      opacity,
      fontFamily,
    ]
  );

  const updateSlides = useDebounce((newSlides) => {
    setSlides(newSlides);
  }, 300);
  const debouncedUpdateContent = useDebounce(updateElementContent, 300);
  const debouncedStyles = useDebouncedValue(appliedStyles, 300);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" && currentIndex < slides.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollToSlide(nextIndex);
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        scrollToSlide(prevIndex);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, slides.length]);

  // Scroll detection for current visible slide
  useEffect(() => {
    const handleScroll = () => {
      const visibleSlide = slideRefs.current.reduce(
        (max, ref, index) => {
          if (!ref) return max;
          const rect = ref.getBoundingClientRect();
          const visibleHeight =
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          return visibleHeight > max.visibleHeight
            ? { index, visibleHeight }
            : max;
        },
        { index: 0, visibleHeight: 0 }
      );

      setCurrentIndex(visibleSlide.index);
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [slides]);

  // setting background color of the current slide
  useEffect(() => {
  const updateBg = async () => {
    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    // Update local state
    const arr = slides.map((slide, idx) =>
      idx === currentIndex
        ? { ...slide, style: { ...slide.style, backgroundColor: bgColor } }
        : slide
    );
    updateSlides(arr); // usedebounce to update slides after a delay
    // setSlides(arr);

    // Update backend (use actual presentationId and slide.order)
    await slideAPI.updateSlideByOrder(
      currentSlide.presentation_id || 1, // Use the real presentation_id
      currentIndex,                
      { backgroundColor: bgColor }
    );
  };

  updateBg();
  // eslint-disable-next-line
}, [bgColor]);

  // Update background color when current slide changes
  useEffect(() => {
    const currentSlide = slides[currentIndex];
    if (currentSlide?.style?.backgroundColor) {
      setBgColor(currentSlide.style.backgroundColor);
    }
  }, [currentIndex]);

  // Apply styles to selected element. when selectedElementId changes and lastAppliedElementIdRef.current is not equal to selectedElementId
  useEffect(() => {
    if (
      !selectedElementId ||
      lastAppliedElementIdRef.current === selectedElementId
    )
      return;

    const selectedSlide = slides.find((slide) =>
      slide.elements?.some((element) => element.id === selectedElementId)
    );

    const selectedElement = selectedSlide?.elements.find(
      (element) => element.id === selectedElementId
    );

    if (selectedElement) {
      setAppliedStyles(selectedElement.style);
      lastAppliedElementIdRef.current = selectedElementId;
    }
  }, [selectedElementId]);

  // Apply styles to the selected element when appliedStyles changes
  useEffect(() => {
    if (!selectedElementId) return;

    const updatedSlides = slides.map((slide) => {
      const updatedElements = slide.elements?.map((element) => {
        if (element.id === selectedElementId) {
          const newStyle = {
            ...element.style,
            // ...appliedStyles,
            ...debouncedStyles,
          };

          // If no change in style, return same element
          if (JSON.stringify(element.style) === JSON.stringify(newStyle)) {
            return element;
          }

          return {
            ...element,
            style: newStyle,
          };
        }
        return element;
      });

      return {
        ...slide,
        elements: updatedElements,
      };
    });

    setSlides(updatedSlides);
  }, [debouncedStyles]);

  useEffect(() => {
    if (!presentMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === "Escape") {
        exitPresentMode(); // Callback to exit presentation mode
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentMode]);

  if (presentMode) {
    const slide = slides[currentIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div
          style={{
            height: "95vh",
            width: "calc(95vh * 16 / 9)",
            backgroundColor: slide.style.backgroundColor,
          }}
          className="relative"
        >
          {slide.elements?.map((element) => {
            if (element.type === "text") {
              return (
                <h1
                  key={element.id}
                  style={{
                    ...element.style,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {element.content}
                </h1>
              );
            } else if (element.type === "image") {
              return (
                <img
                  key={element.id}
                  src={element.src}
                  alt="Slide Element"
                  style={{
                    width: element.width,
                    height: element.height,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory bg-[#242423] scroll-smooth hide-scrollbar"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          data-index={index}
          ref={(el) => (slideRefs.current[index] = el)}
          className="snap-start flex justify-center items-center h-screen p-4"
        >
          <div
            className={`border p-2 bg-white slide slide-${index}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedElementId(null); // Deselect if clicked on slide
              }
            }}
            style={{
              height: "75vh",
              width: `calc(75vh * 16 / 9)`,
              maxWidth: "100%",
              backgroundColor: slide.style.backgroundColor,
            }}
          >
            {slide.elements?.map((element) => {
              if (element.type === "text") {
                return (
                  <h1
                    key={element.id}
                    contentEditable
                    style={{ ...element.style }}
                    onClick={() => setSelectedElementId(element.id)}
                    onInput={(e) => {
                      const updatedContent = e.target.innerText;
                      // updateElementContent(element.id, updatedContent);
                      debouncedUpdateContent(element.id, updatedContent);
                    }}
                  >
                    {/* {console.log("Element Content:", element.style)} */}
                    {element.content}
                  </h1>
                );
              } else if (element.type === "image") {
                return (
                  <img
                    key={element.id}
                    src={element.src}
                    alt="Slide Element"
                    style={{
                      width: element.width,
                      height: element.height,
                    }}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Editor;
