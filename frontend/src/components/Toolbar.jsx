import { useToolbar } from "../context/ToolbarContext";
const Toolbar = ({ addImageElement, addHeadingElement, selectedElementId, onPresent }) => {
  const {
    isBold,
    isItalic,
    isUnderline,
    isStrikeThrough,
    activeAlign,
    textColor,
    setTextColor,
    textBgColor,
    setTextBgColor,
    bgColor,
    setBgColor,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikeThrough,
    changeAlignment,
    fontSize,
    setFontSize,
    opacity,
    setOpacity,
    fontFamily,
    setFontFamily,
  } = useToolbar();

  return (
    <div className="w-1/5 max-w-full bg-[#2A2A2A] p-4 border-r border-gray-700 border-l">
      {/* Design Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <i className="uil uil-palette text-[#ECEDEB]"></i>
          <h2 className="text-lg font-semibold text-[#ECEDEB]">Design</h2>
        </div>
        <button
          title="preview"
          onClick={onPresent}
          className="text-[#ECEDEB] text-sm flex items-center cursor-pointer border rounded py-0.5 px-2 space-x-1 hover:text-gray-300 active:scale-95 transition-transform duration-100"
        >
          <span>Present</span>
          <i className="uil uil-play"></i>
        </button>
      </div>

      <div className="border-b border-[#D0D4CB] border-opacity-20 mt-5 mb-2"></div>

      {/* Style Section */}
      <div>
        {selectedElementId ? (
          <>
            {/* font style selection */}
            <div className="text-[#ECEDEB] text-sm">
              <label className="block mb-1">Font Family</label>
              <select
                className="w-full p-1 rounded bg-[#1F1F1F] text-[#ECEDEB] border border-gray-600"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
                <option value="cursive">Cursive</option>
              </select>
            </div>
            {/* Font Style Buttons */}
            <div className="mt-4 flex justify-center space-x-2">
              <button
                aria-label="Toggle bold"
                title="Bold"
                onClick={() => toggleBold()}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 cursor active:scale-95 transition ${
                  isBold ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-bold"></i>
              </button>
              <button
                aria-label="Toggle italic"
                title="Italic"
                onClick={() => toggleItalic()}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  isItalic ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-italic"></i>
              </button>
              <button
                aria-label="Toggle underline"
                title="Underline"
                onClick={() => toggleUnderline()}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  isUnderline ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-underline"></i>
              </button>
              <button
                aria-label="Toggle strikethrough"
                title="strikethrough"
                onClick={() => toggleStrikeThrough()}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  isStrikeThrough ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-text-strike-through"></i>
              </button>
            </div>
            {/* Text Alignment */}
            <div className="mt-4 flex justify-center space-x-2">
              <button
                aria-label="Align left"
                title="Align Left"
                onClick={() => changeAlignment("left")}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  activeAlign === "left" ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-align-left"></i>
              </button>
              <button
                aria-label="Align center"
                title="Align Center"
                onClick={() => changeAlignment("center")}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  activeAlign === "center" ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-align-center"></i>
              </button>
              <button
                aria-label="Align right"
                title="Align right"
                onClick={() => changeAlignment("right")}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  activeAlign === "right" ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-align-right"></i>
              </button>
              <button
                aria-label="Justify text"
                title="Justify Text"
                onClick={() => changeAlignment("justify")}
                className={`text-[#ECEDEB] border cursor-pointer rounded p-1 active:scale-95 transition ${
                  activeAlign === "justify" ? "bg-[#f0f0f0] text-black" : ""
                }`}
              >
                <i className="uil uil-align-justify"></i>
              </button>
            </div>
            {/* Font Size and Opacity Dropdowns */}
            <div className="mt-4 px-2 flex space-x-4">
              {/* Font Size */}
              <div className="text-[#ECEDEB] text-sm w-1/2">
                <label className="block mb-1">Font Size</label>
                <input
                  type="text"
                  list="fontSizes"
                  // defaultValue="16"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  placeholder="Value"
                  className="w-full p-1 rounded bg-[#1F1F1F] text-[#ECEDEB] border border-gray-600"
                />
                <datalist id="fontSizes">
                  <option value="10" />
                  <option value="12" />
                  <option value="14" />
                  <option value="16" />
                  <option value="18" />
                  <option value="20" />
                  <option value="24" />
                  <option value="30" />
                  <option value="36" />
                </datalist>
              </div>

              {/* Opacity */}
              <div className="text-[#ECEDEB] text-sm w-1/2">
                <label className="block mb-1">Opacity</label>
                <input
                  type="text"
                  list="opacities"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                  // defaultValue="100"
                  placeholder="Value"
                  className="w-full p-1 rounded bg-[#1F1F1F] text-[#ECEDEB] border border-gray-600"
                />
                <datalist id="opacities">
                  <option value="100" />
                  <option value="75" />
                  <option value="50" />
                  <option value="25" />
                </datalist>
              </div>
            </div>
            {/* Text Color Picker */}
            <div className="w-full mt-4">
              <label className="block mb-1 text-sm text-[#ECEDEB]">
                Text Color
              </label>
              <div className="flex items-center rounded border border-gray-600 bg-[#1F1F1F] overflow-hidden h-8">
                <input
                  aria-label="Pick text color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-full cursor-pointer border-none outline-none appearance-none"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-2 text-sm bg-transparent text-[#ECEDEB] outline-none h-full"
                />
              </div>
            </div>
            {/* Text Background Color Picker */}
            <div className="w-full mt-4">
              <label className="block mb-1 text-sm text-[#ECEDEB]">
                Text Background Color
              </label>
              <div className="flex items-center rounded border border-gray-600 bg-[#1F1F1F] overflow-hidden h-8">
                <input
                  aria-label="Pick text color"
                  type="color"
                  value={textBgColor}
                  onChange={(e) => setTextBgColor(e.target.value)}
                  className="w-12 h-full cursor-pointer border-none outline-none appearance-none"
                />
                <input
                  type="text"
                  value={textBgColor}
                  onChange={(e) => setTextBgColor(e.target.value)}
                  className="flex-1 px-2 text-sm bg-transparent text-[#ECEDEB] outline-none h-full"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Background Color Picker */}
            <div className="w-full mt-4">
              <label className="block mb-1 text-sm text-[#ECEDEB]">
                Background Color
              </label>
              <div className="flex items-center rounded border border-gray-600 bg-[#1F1F1F] overflow-hidden h-8">
                <input
                  aria-label="Pick background color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-full cursor-pointer border-none outline-none appearance-none"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-2 text-sm bg-transparent text-[#ECEDEB] outline-none h-full"
                />
              </div>
            </div>
          </>
        )}

        {/* Add Image and Text */}
        <div className="mt-6 mb-1">
          <label className="block text-sm text-[#ECEDEB]">Add</label>
          <div className="flex justify-center space-x-2">
            {/* Upload Image */}
            <label
              title="Add image"
              className="text-white text-xl cursor-pointer hover:text-gray-300 active:scale-95"
            >
              <i className="uil uil-image-plus"></i>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.readAsDataURL(file); // Start reading process
                    reader.onloadend = () => {
                      const base64Image = reader.result; // Access AFTER loading completes
                      addImageElement(base64Image);
                    };
                  }
                }}
                className="hidden"
              />
            </label>

            {/* Add Text */}
            <button
              onClick={addHeadingElement}
              title="Add Text"
              className="text-white text-xl cursor-pointer hover:text-gray-300 active:scale-95"
            >
              <i className="uil uil-comment-add"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
