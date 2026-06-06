import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadZoneProps {
  onQuizGenerated: (quizData: any) => void;
}

export default function UploadZone({ onQuizGenerated }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "generating" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setErrorMessage("Only PDF files are supported. Please select a text-based PDF.");
      setStatus("error");
      setSelectedFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("PDF file size exceeds 20MB limit. Please upload a smaller study file.");
      setStatus("error");
      setSelectedFile(null);
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
    setStatus("idle");
  };

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [progressMessage, setProgressMessage] = useState("");

  const handleGenerateQuiz = async () => {
    if (!selectedFile) return;

    setStatus("reading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("difficulty", difficulty);
    formData.append("numQuestions", numQuestions.toString());

    try {
      setProgressMessage("Parsing uploaded PDF slides and extracting core vocabulary...");
      
      const textProcessingTimer = setTimeout(() => {
        setStatus("generating");
        setProgressMessage(`Initiating QuizForge Synthesis with Gemini 1.5 Flash (${difficulty.toUpperCase()} level, ${numQuestions} Questions)...`);
      }, 1400);

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      clearTimeout(textProcessingTimer);

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || `Server responded with status ${response.status}`);
      }

      const parsedQuiz = await response.json();
      onQuizGenerated(parsedQuiz);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred during synthesis. Please verify your file and try again.");
      setStatus("error");
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 no-print">
      
      {/* Dropzone with Black/White/Emerald palette */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        id="pdf-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileBrowser}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 group
          ${isDragging 
            ? "border-emerald-500 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
            : "border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-950/60"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-5">
          <div className={`p-4.5 rounded-2xl border transition-all duration-300 group-hover:scale-105
            ${selectedFile 
              ? "bg-emerald-950/30 text-emerald-400 border-emerald-550/40" 
              : "bg-zinc-950 text-zinc-400 border-zinc-850"
            }
          `}>
            {selectedFile ? (
              <FileText className="w-10 h-10 animate-bounce duration-1000" />
            ) : (
              <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-emerald-400" />
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-lg font-medium text-white block font-sans">
              {selectedFile ? selectedFile.name : "Select or Drop Study Material PDF"}
            </span>
            <span className="text-xs text-zinc-500 block font-mono">
              {selectedFile 
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to Swap` 
                : "Supports raw lecture files & textbooks up to 20 MB"
              }
            </span>
          </div>

          {!selectedFile && (
            <div className="inline-flex items-center space-x-1 border border-zinc-800 bg-zinc-950 text-[10px] text-zinc-400 px-3 py-1 rounded-full font-mono">
              <span>Drag files anywhere to begin</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Target Level Configuration Card */}
      <AnimatePresence>
        {status === "idle" && selectedFile && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black border border-zinc-850 rounded-3xl p-6 space-y-6 text-left shadow-xl"
          >
            {/* Rigor selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">Set Learning Rigor Level</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "easy", name: "Recall", desc: "Vocabulary & Direct Facts" },
                  { id: "medium", name: "Intermediate", desc: "Analytical Concepts" },
                  { id: "hard", name: "Mastery", desc: "Rigorous Deep Questions" }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    id={`btn-diff-${lvl.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDifficulty(lvl.id as "easy" | "medium" | "hard");
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                      difficulty === lvl.id
                        ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-semibold"
                        : "border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:border-zinc-800 hover:text-zinc-350"
                    }`}
                  >
                    <span className="text-xs font-bold block">{lvl.name}</span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5 leading-tight">{lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions count selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">Set Total Question Count</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="grid grid-cols-4 gap-2 flex-grow">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      id={`btn-num-q-${num}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNumQuestions(num);
                      }}
                      className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                        numQuestions === num
                          ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-semibold"
                          : "border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:border-zinc-850 hover:text-zinc-350"
                      }`}
                    >
                      <span className="text-sm font-bold block">{num}</span>
                      <span className="text-[8px] text-zinc-500 block leading-none mt-0.5">MCQs</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between border border-zinc-850 bg-zinc-950/40 px-4 py-3 rounded-2xl min-w-[130px]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNumQuestions((prev) => Math.max(3, prev - 1));
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white cursor-pointer select-none font-bold text-sm flex items-center justify-center border border-zinc-800"
                    title="Decrease count"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono font-bold text-white text-center w-8 select-none">
                    {numQuestions}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNumQuestions((prev) => Math.min(30, prev + 1));
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white cursor-pointer select-none font-bold text-sm flex items-center justify-center border border-zinc-800"
                    title="Increase count"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Forge Trigger Button */}
      {status === "idle" && selectedFile && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGenerateQuiz}
          id="btn-generate-quiz"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 px-6 rounded-2xl transition duration-150 shadow-[0_4px_20px_rgba(16,185,129,0.25)] flex items-center justify-center space-x-2.5 cursor-pointer text-base"
        >
          <Sparkles className="w-5 h-5 text-black" />
          <span>Launch QuizForge Synthesizer</span>
        </motion.button>
      )}

      {/* Loading & Processing HUD */}
      {(status === "reading" || status === "generating") && (
        <div className="bg-black border border-zinc-850 rounded-3xl p-8 text-center space-y-6 shadow-xl leading-relaxed">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-500 opacity-20"></div>
              <div className="relative rounded-full p-3 bg-zinc-950 text-emerald-400 border border-zinc-800">
                <Sparkles className="w-6 h-6 animate-spin text-emerald-400 duration-3000" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-400">
              {status === "reading" ? "Document Parsing" : "Gemini AI Synthesizer"}
            </h4>
            <p className="text-base text-white max-w-sm mx-auto leading-normal z-10 block font-medium animate-pulse">
              {progressMessage}
            </p>
          </div>
          {/* Visual sleek progress bar indicator */}
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: "10%" }}
              animate={{ width: status === "reading" ? "45%" : "90%" }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </div>
      )}

      {/* Error state overlay */}
      {status === "error" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black border border-rose-900/40 rounded-3xl p-5 flex items-start space-x-4 shadow-lg text-left"
        >
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300 font-sans">Synthesis Failed</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">{errorMessage}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
