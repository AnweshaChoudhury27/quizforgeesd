import express from "express";
import multer from "multer";
import { createRequire } from "module";
import { GoogleGenAI, Type } from "@google/genai";

let pdf: any = null;
try {
  const require = createRequire(import.meta.url);
  pdf = require("pdf-parse");
} catch (pdfLoadErr: any) {
  console.warn("Failed to load pdf-parse lazily on server startup (expected in some serverless bundlers):", pdfLoadErr.message || pdfLoadErr);
}

const app = express();

// Lazy loading of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please supply your API key in modern server secrets (Settings > Secrets)."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[Vercel Serverless Link] ${req.method} ${req.url}`);
  next();
});

// Basic Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Multer config for PDF upload (memory storage, max 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported. Sorry!"), false);
    }
  },
});

// API Endpoints
// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: "vercel-serverless", time: new Date().toISOString() });
});

// Quiz Generation Route
app.post("/api/generate-quiz", upload.single("pdf"), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded. Please select a PDF." });
    }

    console.log(`Processing uploaded PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. Text Extraction from PDF Buffer
    let extractedText = "";
    let pdfParseFailed = false;
    let pdfParseErrorMessage = "";

    try {
      if (!pdf) {
        throw new Error("pdf-parse is not initialized or not supported in this serverless runtime.");
      }
      const parsedPdf = await pdf(req.file.buffer);
      extractedText = parsedPdf.text || "";
    } catch (pdfErr: any) {
      console.warn("Local PDF Parse failed, will automatically fallback to Gemini's highly-robust multimodal PDF parsing engine:", pdfErr.message || pdfErr);
      pdfParseFailed = true;
      pdfParseErrorMessage = pdfErr.message || String(pdfErr);
    }

    const trimmedText = extractedText.trim();
    const useNativeGeminiPdf = pdfParseFailed || !trimmedText || trimmedText.length < 20;

    // 2. Setup Gemini AI Client
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      console.error("Gemini initialization error: ", err.message);
      return res.status(550).json({
        error: "Gemini API key is not configured. Go to Secrets (Settings > Secrets) to attach your GEMINI_API_KEY.",
        details: err.message,
      });
    }

    // 3. AI Quiz Generation
    const difficulty = (req.body.difficulty || "medium").toString().toLowerCase();
    const numQuestions = Math.min(Math.max(parseInt(req.body.numQuestions || "10", 10) || 10, 1), 30);
    console.log(`Requested quiz difficulty level: ${difficulty}, count: ${numQuestions}`);

    let contents;
    if (useNativeGeminiPdf) {
      console.log("No text extracted locally or Parse error. Initializing Gemini native PDF parsing via base64 inlineData...");
      const base64Pdf = req.file.buffer.toString("base64");
      contents = [
        {
          inlineData: {
            data: base64Pdf,
            mimeType: "application/pdf",
          },
        },
        {
          text: `Generate an interactive multiple-choice quiz based on the attached study notes PDF document.
The quiz must contain exactly ${numQuestions} multiple-choice questions covering key terms, critical analysis, and standard concepts from this document.
Generate the quiz at the requested difficulty level: ${difficulty.toUpperCase()}.`
        },
      ];
    } else {
      console.log(`Successfully extracted characters locally: ${trimmedText.length}. Sample: ${trimmedText.substring(0, 100)}...`);
      const documentSlice = trimmedText.slice(0, 50000);
      contents = [
        {
          text: `Generate an interactive multiple-choice quiz based on the following study notes text extracted from a PDF.
The quiz must contain exactly ${numQuestions} multiple-choice questions covering key terms, critical analysis, and standard concepts.
Generate the quiz at the requested difficulty level: ${difficulty.toUpperCase()}.

Here is the extracted study text:
---
${documentSlice}
---`
        },
      ];
    }

    console.log("Querying Gemini 3.5-flash to generate structured quiz data...");

    const config = {
      systemInstruction: `You are QuizForge, an expert educational system that helps students learn faster. 
Analyze the provided text and design a custom ${numQuestions}-question MCQ quiz to test their knowledge at the custom difficulty level: ${difficulty.toUpperCase()}.
Adjust the question difficulty appropriately:
- "easy": Focus on simple recall, key terms, definitions, and direct facts.
- "medium": Focus on application of theories, understanding relationships, and moderate analysis.
- "hard": Focus on deep critical thinking, complex scenario analyses, fine distinctions, and rigorous problem-solving.

Guidelines:
- Make each question rigorous, clear, and informative for a learner.
- Provide 4 options (A, B, C, D) for each.
- Specify the correct answer precisely ("A", "B", "C", or "D").
- Write a short, highly educational explanation for each question explaining the concept clearly and why that choice is correct.
- Infer a general title for the overall quiz based on the content (e.g. "Photosynthesis - Hard Mastery").
- Ensure the result conforms EXACTLY to the requested JSON layout.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quiz_title: {
            type: Type.STRING,
            description: "A suitable, neat title for study material content."
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.INTEGER,
                  description: `The sequence ID starting at 1 incremented up to ${numQuestions}.`
                },
                question: {
                  type: Type.STRING,
                  description: "The test question text."
                },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING }
                  },
                  required: ["A", "B", "C", "D"]
                },
                correct_answer: {
                  type: Type.STRING,
                  description: "Strictly 'A', 'B', 'C', or 'D'."
                },
                explanation: {
                  type: Type.STRING,
                  description: "Educational reasoning describing why the correct_answer is right."
                }
              },
              required: ["id", "question", "options", "correct_answer", "explanation"]
            }
          }
        },
        required: ["quiz_title", "questions"]
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config,
      });
    } catch (gemErr: any) {
      console.warn("Generation with gemini-3.5-flash failed. Retrying with gemini-flash-latest...", gemErr.message || gemErr);
      try {
        response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents,
          config,
        });
      } catch (backupErr: any) {
        console.error("Backup model 'gemini-flash-latest' also failed:", backupErr);
        throw backupErr;
      }
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty text response from Gemini model.");
    }

    const cleanJsonStr = responseText.trim();
    let parsedQuizData;
    try {
      parsedQuizData = JSON.parse(cleanJsonStr);
    } catch (jsonErr: any) {
      console.error("JSON parsing error on Gemini output: ", responseText);
      return res.status(502).json({
        error: "Failed to parse generated quiz structure into standard JSON format.",
        details: jsonErr.message,
        rawResponse: responseText,
      });
    }

    console.log(`Successfully generated quiz with title: "${parsedQuizData.quiz_title}"`);
    return res.json(parsedQuizData);

  } catch (error: any) {
    console.error("General error generating quiz: ", error);
    return res.status(500).json({
      error: "An unexpected error occurred during quiz generation. Please try again.",
      details: error.message || error,
    });
  }
});

// API Error handling middleware
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[API Router Error] ${req.method} ${req.url}:`, err);
  res.status(err.status || 500).json({
    error: err.message || "An API server middleware error occurred.",
    details: err.stack || err.toString(),
  });
});

export default app;
