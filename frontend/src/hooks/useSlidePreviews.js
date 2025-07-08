import { useEffect, useState } from "react";
import html2canvas from "html2canvas";

// ideal only when slides are already rendered and available.
const useSlideThumbnails = (slides) => {
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    slides.forEach((slide, index) => {
      const slideElement = document.querySelector(`.slide-${index}`);
      if (slideElement) {
        html2canvas(slideElement).then((canvas) => {
          setThumbnails((prev) => ({
            ...prev,
            [index]: canvas.toDataURL("image/png"),
          }));
        });
      }
    });
  }, [slides]);

  // return thumbnails;

  // Return as array for easy mapping
  return slides.map((_, idx) => thumbnails[idx]);
};

export default useSlideThumbnails;
