import { useMemo, useEffect, useRef, useState } from "react";
import { useToolbar } from "../context/ToolbarContext";
import { useDebounce, useDebouncedValue } from "../hooks";
import * as slideAPI from "../services/slides";
import * as elementAPI from "../services/elements";
import Moveable from "react-moveable";
import { FaMagic, FaTimes, FaPaperPlane, FaSpinner } from "react-icons/fa";

function normalizeAIData(aiData) {
  // Ensure slide orders start at 0
  const minOrder = Math.min(...aiData.slides.map((s) => Number(s.order)));
  aiData.slides.forEach((s) => {
    s.order = Number(s.order) - minOrder;
  });

  aiData.elements.forEach((el) => {
    el.order = Number(el.order) || 0;
    el.style = el.style || {};
    el.position = el.position || {};
    if (el.type === "image") {
      el.src = el.content;
      el.content = "";
    }
  });
  return aiData;
}

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
  const [aiLoading, setAiLoading] = useState(false);

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

  // --- AI Prompt Handler ---
  const handleAIPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);

    // Improved prompt for heading + description
    const fullPrompt = `
${aiPrompt}

Return only valid JSON with two arrays: "slides" and "elements".
Each slide: order, style (object).

You are generating data for a slide presentation app.

Return only valid JSON with two arrays: "slides" and "elements".

Each slide must have:
- order (number, starting from 0)
- style (object, e.g. { "backgroundColor": "#fff" })

Each element must have:
- slideOrder (number, the order of the slide it belongs to)
- type ("text")
- content (string, for text elements: the text;)
- style (object, e.g. { "fontSize": "36px", "color": "#222", "top": "20px", "left": "40px", "width": "300px", "height": "100px" })
- position (object, e.g. { "x": 40, "y": 20 })
- order (number, order of the element on the slide so that it does not overlap and looks visually appealing)

For each slide, generate:
- a heading (as a text element, large font, e.g. 32-40px)
- a description (as a separate text element, smaller font, 1-2 sentences)
- if relevant, an image element with a placeholder src and style (width, height)

Ensure all elements on a slide have unique positions and do not overlap.

Example:
{
  "slides": [
    { "order": 0, "style": { "backgroundColor": "#fff" } }
  ],
  "elements": [
    {
      "slideOrder": 0,
      "type": "text",
      "content": "Heading Example",
      "src": null,
      "style": { "fontSize": "36px", "color": "#222", "top": "40px", "left": "40px" },
      "position": { "x": 40, "y": 40 },
      "order": 0
    },
    {
      "slideOrder": 0,
      "type": "text",
      "content": "This is a description for the slide.",
      "src": null,
      "style": { "fontSize": "20px", "color": "#444", "top": "100px", "left": "40px" },
      "position": { "x": 40, "y": 100 },
      "order": 1
    }
  ]
}

Return only the JSON, no explanation or markdown.
`;

    try {
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        import.meta.env.VITE_GEMINI_API_KEY;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      });
      const data = await res.json();
      let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json|```/g, "").trim();
      }
      if (!jsonText) throw new Error("No JSON text from Gemini");

      let aiData;
      try {
        aiData = JSON.parse(jsonText);
      } catch (e) {
        console.error("Failed to parse Gemini JSON:", jsonText);
        alert("AI did not return valid JSON. Try again.");
        setAiLoading(false);
        return;
      }
      aiData = normalizeAIData(aiData);
      console.log("Normalized AI data:", aiData);

      // 1. Add slides
      const slideOrderToId = {};
      for (const slide of aiData.slides) {
        const addedSlide = await slideAPI.addSlide(presentationId, {
          style: slide.style,
          order: slide.order,
        });
        slideOrderToId[slide.order] = addedSlide.id;
      }
      console.log("Slides added, mapping:", slideOrderToId);

      // 2. Add elements
      for (const element of aiData.elements) {
        const slideId = slideOrderToId[element.slideOrder ?? element.slideId];
        if (!slideId) {
          console.warn("No slideId for element:", element);
          continue;
        }
        await elementAPI.addElement(slideId, {
          type: element.type,
          content: element.content,
          src: element.src || null,
          width: element.width || null,
          height: element.height || null,
          style: element.style,
          position: element.position,
          order: element.order,
        });
      }
      console.log("Elements added.");

      setAiPrompt("");
      setAiOpen(false);
      setAiLoading(false);
      // Instead of reload, fetch new slides and update UI
      if (getSlides) await getSlides();
    } catch (err) {
      console.error("AI handler error:", err);
      alert("Failed to generate presentation.");
      setAiLoading(false);
    }
  };

  // --- Keyboard navigation ---
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

  // --- Scroll detection for current visible slide ---
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

  // --- Set background color of the current slide ---
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
      updateSlides(arr);

      // Update backend
      await slideAPI.updateSlideByOrder(
        currentSlide.presentation_id,
        currentSlide.order,
        { backgroundColor: bgColor }
      );
    };

    updateBg();
    // eslint-disable-next-line
  }, [bgColor]);

  // --- Update background color when current slide changes ---
  useEffect(() => {
    const currentSlide = slides[currentIndex];
    if (currentSlide?.style?.backgroundColor) {
      setBgColor(currentSlide.style.backgroundColor);
    }
  }, [currentIndex]);

  // --- Apply styles to selected element when selectedElementId changes ---
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

  // --- Apply styles to the selected element when appliedStyles changes ---
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

  // --- Presentation mode navigation ---
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

  // --- Presentation mode UI ---
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
                    // width: `${element.style?.width || 100}px`,
                    // height: `${element.style?.height || 100}px`,
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

  // --- Main Editor UI ---
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
                        objectFit: "contain",
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
              roundable={true}
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

      {/* AI Button and Prompt at the bottom */}
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
                    handleAIPrompt();
                  }
                }}
                disabled={aiLoading}
                rows={1}
                autoFocus
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center transition"
                onClick={handleAIPrompt}
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

      {/* --- Add a loading overlay for better UX --- */}
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
