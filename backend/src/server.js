import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_, res) => res.send("Welcome to Slide Canvas Server!"));
app.use(process.env.URL, apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
