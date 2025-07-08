import { useMemo, useEffect, useRef, useState } from "react";
import { useToolbar } from "../context/ToolbarContext";
import { useDebounce, useDebouncedValue } from "../hooks";
import * as slideAPI from "../services/slides";
import Moveable from "react-moveable";
import { FaMagic, FaTimes, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useGemini } from "../hooks/useGemini"; 

const Editor = ({
  slides,
  setSlides,
  currentIndex,
  setCurrentIndex,
  updateElement,
  selectedElementId,
  setSelectedElementId,
  slideRefs,
  scrollToSlide,
  presentMode,
  exitPresentMode,
  getSlides,
  presentationId,
}) => {
  const containerRef = useRef(null);
  const lastAppliedElementIdRef = useRef(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const { aiLoading, handleAIPrompt } = useGemini({
    presentationId,
    getSlides,
    setAiOpen,
    setAiPrompt,
  });

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

  const debouncedUpdateContent = useDebounce(updateElement, 300);
  const debouncedStyles = useDebouncedValue(appliedStyles, 300);

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

  useEffect(() => {
    const updateBg = async () => {
      const currentSlide = slides[currentIndex];
      if (!currentSlide) return;

      const arr = slides.map((slide, idx) =>
        idx === currentIndex
          ? { ...slide, style: { ...slide.style, backgroundColor: bgColor } }
          : slide
      );
      updateSlides(arr);

      await slideAPI.updateSlideByOrder(
        presentationId,
        currentSlide.order,
        { backgroundColor: bgColor }
      );
    };

    updateBg();
    // eslint-disable-next-line
  }, [bgColor]);

  useEffect(() => {
    const currentSlide = slides[currentIndex];
    if (currentSlide?.style?.backgroundColor) {
      setBgColor(currentSlide.style.backgroundColor);
    }
  }, [currentIndex]);

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

  useEffect(() => {
    if (!selectedElementId) return;

    const updatedSlides = slides.map((slide) => {
      const updatedElements = slide.elements?.map((element) => {
        if (element.id === selectedElementId) {
          const newStyle = {
            ...element.style,
            ...debouncedStyles,
          };

          if (JSON.stringify(element.style) === JSON.stringify(newStyle)) {
            return element;
          }

          updateElement(element.id, { style: newStyle });

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
        exitPresentMode();
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
            height: "75vh",
            width: "calc(72vh * 16 / 9)",
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
                    position: "absolute",
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
                    position: "absolute",
                    ...element.style,
                    pointerEvents: "none",
                    userSelect: "none",
                    objectFit: "contain",
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
      className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory bg-[#242423] scroll-smooth hide-scrollbar slide-container"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          data-index={index}
          ref={(el) => (slideRefs.current[index] = el)}
          className="snap-start flex justify-center items-center h-screen p-4"
        >
          <div
            className={`relative overflow-hidden border p-2 bg-white slide slide-${index}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedElementId(null);
            }}
            style={{
              height: "75vh",
              width: `calc(75vh * 16 / 9)`,
              minWidth: "100%",
              backgroundColor: slide.style.backgroundColor,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {slide.elements?.map((element) => {
              const wrapperClass = `element-wrapper-${element.id}`;
              const isSelected = selectedElementId === element.id;

              const commonWrapperStyle = {
                position: "absolute",
                ...element.style,
                borderRadius: element.style?.borderRadius || "0px",
                overflow: "hidden",
                pointerEvents: "auto",
              };

              return (
                <div
                  key={element.id}
                  className={wrapperClass}
                  style={commonWrapperStyle}
                  onClick={() => setSelectedElementId(element.id)}
                  contentEditable={element.type === "text"}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (element.type === "text") {
                      const updatedContent = e.target.innerText;
                      debouncedUpdateContent(element.id, {
                        content: updatedContent,
                      });
                    }
                  }}
                >
                  {element.type === "text" ? (
                    element.content
                  ) : element.type === "image" ? (
                    <img
                      src={element.src}
                      alt="Slide Element"
                      style={{
                        width: "100%",
                        height: "100%",
                        // objectFit: "contain",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
            <Moveable
              target={
                selectedElementId
                  ? `.element-wrapper-${selectedElementId}`
                  : null
              }
              draggable
              resizable
              rotatable
              pinchable
              pinchOutside
              keepRatio={false}
              roundable
              isDisplayShadowRoundControls={"horizontal"}
              roundClickable={"control"}
              roundPadding={15}
              onRenderEnd={(e) => {
                const style = window.getComputedStyle(e.target);

                const width = parseFloat(style.width);
                const height = parseFloat(style.height);
                const transform = style.transform;
                const borderRadius = style.borderRadius;

                let translateX = 0,
                  translateY = 0;
                const match = transform.match(/matrix.*\((.+)\)/);
                if (match) {
                  const values = match[1].split(", ");
                  translateX = parseFloat(values[4]);
                  translateY = parseFloat(values[5]);
                }

                updateElement(selectedElementId, {
                  style: {
                    ...slides[currentIndex]?.elements.find(
                      (el) => el.id === selectedElementId
                    )?.style,
                    width,
                    height,
                    transform,
                    borderRadius,
                  },
                  position: {
                    x: translateX,
                    y: translateY,
                  },
                });

                e.target.style.cssText += e.cssText;
              }}
              onDrag={({ target, beforeTranslate }) => {
                target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
              }}
              onRotate={({ target, beforeRotate }) => {
                target.style.transform = `rotate(${beforeRotate}deg)`;
              }}
              onResize={({ target, width, height, drag }) => {
                target.style.width = `${width}px`;
                target.style.height = `${height}px`;
                target.style.transform = drag.transform;
              }}
              onRender={(e) => {
                e.target.style.cssText += e.cssText;
              }}
            />
          </div>
        </div>
      ))}

      {/* AI prompt input */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition duration-200 text-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
            title={aiOpen ? "Close AI" : "Generate with AI"}
            onClick={() => setAiOpen((v) => !v)}
          >
            {aiOpen ? <FaTimes /> : <FaMagic />}
          </button>

          {aiOpen && (
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-1 shadow-sm animate-fade-in gap-2">
              <textarea
                className="bg-transparent outline-none text-sm placeholder-gray-400 w-96 resize-none"
                placeholder="Describe your presentation..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !aiLoading && !e.shiftKey) {
                    e.preventDefault();
                    handleAIPrompt(aiPrompt);
                  }
                }}
                disabled={aiLoading}
                rows={1}
                autoFocus
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center transition"
                onClick={() => handleAIPrompt(aiPrompt)}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaPaperPlane className="text-sm" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI loading overlay */}
      {aiLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default Editor;
