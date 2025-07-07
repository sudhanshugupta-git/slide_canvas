import React from "react";

const SlideView = ({ slide, width = "100%", height = "100%", mode = "edit", onElementClick, selectedElementId }) => {
  if (!slide) return null;
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: slide.style?.backgroundColor || "#fff",
        position: "relative",
        overflow: "hidden",
      }}
      className="relative"
    >
      {slide.elements?.map((element) => {
        const isSelected = selectedElementId === element.id;
        const style = {
          position: "absolute",
          ...element.style,
          border: isSelected && mode === "edit" ? "2px solid #007bff" : undefined,
          pointerEvents: mode === "preview" ? "none" : "auto",
          userSelect: "none",
        };
        return element.type === "text" ? (
          <div
            key={element.id}
            style={style}
            onClick={onElementClick ? () => onElementClick(element.id) : undefined}
            contentEditable={mode === "edit"}
            suppressContentEditableWarning
          >
            {element.content}
          </div>
        ) : element.type === "image" ? (
          <img
            key={element.id}
            src={element.src}
            alt=""
            style={{
              ...style,
              objectFit: "contain",
              width: style.width || "100px",
              height: style.height || "100px",
            }}
            onClick={onElementClick ? () => onElementClick(element.id) : undefined}
          />
        ) : null;
      })}
    </div>
  );
};

export default SlideView;