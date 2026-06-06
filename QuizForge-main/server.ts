import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./api/index.js";

const PORT = 3000;

async function startServer() {
  // Inject Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in DEVELOPMENT mode. Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode. Serving client files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 on port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QuizForge Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start QuizForge server: ", err);
});
