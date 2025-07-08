import { useState } from "react";
import * as slideAPI from "../services/slides";
import * as elementAPI from "../services/elements";
import { generateSlidesWithGemini } from "../services/gemini";

//  Utility to normalize AI JSON data
const normalizeAIData = (aiData) => {
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
};

const buildPrompt = (userPrompt) => `
${userPrompt}

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

export const useGemini = ({
  presentationId,
  getSlides,
  setAiOpen,
  setAiPrompt,
}) => {
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIPrompt = async (aiPrompt) => {
    if (!aiPrompt.trim()) {
      setAiPrompt("");
      return;
    }

    setAiLoading(true);
    const fullPrompt = buildPrompt(aiPrompt);

    try {
      const data = await generateSlidesWithGemini(fullPrompt);

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
        return;
      }

      aiData = normalizeAIData(aiData);

      const slideOrderToId = {};
      for (const slide of aiData.slides) {
        const addedSlide = await slideAPI.addSlide(presentationId, {
          style: slide.style,
          order: slide.order,
        });
        slideOrderToId[slide.order] = addedSlide.id;
      }

      for (const element of aiData.elements) {
        const slideId = slideOrderToId[element.slideOrder ?? element.slideId];
        if (!slideId) continue;

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

      setAiPrompt("");
      setAiOpen(false);
      if (getSlides) await getSlides();
    } catch (err) {
      console.error("AI handler error:", err);
      alert("Failed to generate presentation.");
    } finally {
      setAiLoading(false);
    }
  };

  return { aiLoading, handleAIPrompt };
};
