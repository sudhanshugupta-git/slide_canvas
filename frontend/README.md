# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

`
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
