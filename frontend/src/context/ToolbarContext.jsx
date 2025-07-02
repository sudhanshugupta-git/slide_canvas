import { createContext, useContext, useState } from "react";

const ToolbarContext = createContext();

export const ToolbarProvider = ({ children }) => {
  const [activeAlign, setActiveAlign] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikeThrough, setIsStrikeThrough] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [textBgColor, setTextBgColor] = useState("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState("16");
  const [opacity, setOpacity] = useState("100");
  const [fontFamily, setFontFamily] = useState("sans-serif");

  const toggleBold = () => setIsBold((prev) => !prev);
  const toggleItalic = () => setIsItalic((prev) => !prev);
  const toggleUnderline = () => setIsUnderline((prev) => !prev);
  const toggleStrikeThrough = () => setIsStrikeThrough((prev) => !prev);
  const changeAlignment = (align) => setActiveAlign(align);

  
    const setAppliedStyles = (style = {}) => {
    setIsBold(style.fontWeight === "bold");
    setIsItalic(style.fontStyle === "italic");
    setIsUnderline(style.textDecoration?.includes("underline"));
    setIsStrikeThrough(style.textDecoration?.includes("line-through"));
    setActiveAlign(style.textAlign || "");
    setTextColor(style.color || "#000000");
    setTextBgColor(style.backgroundColor || "transparent");
    setFontSize(style.fontSize?.replace("px", "") || "16");
    setOpacity(String(Math.round((style.opacity || 1) * 100)));
    setFontFamily(style.fontFamily || "sans-serif");
  };

  return (
    <ToolbarContext.Provider
      value={{
        activeAlign,
        isBold,
        isItalic,
        isUnderline,
        isStrikeThrough,
        textColor,
        textBgColor,
        bgColor,
        fontSize,
        opacity,
        fontFamily,
        toggleBold,
        toggleItalic,
        toggleUnderline,
        toggleStrikeThrough,
        changeAlignment,
        setTextColor,
        setTextBgColor,
        setBgColor,
        setFontSize,
        setOpacity,
        setFontFamily,
        setAppliedStyles, 
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};

export const useToolbar = () => useContext(ToolbarContext);
