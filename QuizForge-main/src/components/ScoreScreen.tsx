import React, { useState } from "react";
import { QuizData } from "../types";
import { Printer, RotateCcw, Check, X, SkipForward, Award, BookOpen, Flag } from "lucide-react";
import { motion } from "motion/react";

interface ScoreScreenProps {
  quizData: QuizData;
  answers: Record<number, "A" | "B" | "C" | "D" | null>;
  timeTaken: number;
  flaggedQuestionIds: number[];
  onRestart: () => void;
}

export default function ScoreScreen({ quizData, answers, timeTaken, flaggedQuestionIds, onRestart }: ScoreScreenProps) {
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  quizData.questions.forEach((q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) {
      skippedCount++;
    } else if (ans === q.correct_answer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / quizData.questions.length) * 100);

  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}m ${remaining}s`;
  };

  const avgTimePerQuestion = Math.round(timeTaken / quizData.questions.length);

  const getFeedback = () => {
    if (scorePercentage === 100) return { title: "Academic Mastery!", text: `Incredible! A pristine, perfect performance completed in ${formatDuration(timeTaken)}.` };
    if (scorePercentage >= 80) return { title: "Outstanding Retention!", text: `Fantastic work. Set your targets high! You completed the quiz in ${formatDuration(timeTaken)}.` };
    if (scorePercentage >= 50) return { title: "Solid Competency!", text: `Good foundation, completed in ${formatDuration(timeTaken)}. View the insights below to secure the remaining concepts.` };
    return { title: "Adaptive Study Path Required", text: `Completed in ${formatDuration(timeTaken)}. Take this as an opportunity to read detailed explanations to master the vocabulary!` };
  };

  const feedback = getFeedback();

  const handlePrint = () => {
    window.print();
  };

  const filteredQuestions = quizData.questions
    .map((q, originalIdx) => ({ q, originalIdx }))
    .filter(({ q }) => {
      if (filter === "flagged") {
        return flaggedQuestionIds.includes(q.id);
      }
      return true;
    });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-8">
      
      {/* Score Summary Header Card with sleek animations */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-black border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden print-card"
      >
        <div className="hidden print:block text-right text-xs font-mono text-zinc-500 mb-4">
          QuizForge Study Report • {new Date().toLocaleDateString()}
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-emerald-400">
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-emerald-400">Forge Performance Evaluation</span>
            </div>
            <h2 className="text-3xl font-bold font-serif text-white tracking-tight">
              {feedback.title}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
              {feedback.text}
            </p>
          </div>

          {/* Radial score gauge visualizer with Black & Emerald Ring */}
          <div className="relative shrink-0 flex items-center justify-center w-36 h-36 border border-zinc-900 rounded-full bg-zinc-950 shadow-inner">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-zinc-900 fill-transparent"
                strokeWidth="6"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-emerald-500 fill-transparent"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - scorePercentage / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ strokeDasharray: 2 * Math.PI * 52 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-white">{scorePercentage}%</span>
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{correctCount}/{quizData.questions.length} correct</span>
            </div>
          </div>
        </div>

        {/* Quadruple metric statistics with extreme crispness */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-900">
          <div className="bg-zinc-950 p-4 rounded-2xl text-center border border-zinc-900 print-card">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">Correct</span>
            <div className="mt-1 flex items-center justify-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-lg font-mono font-bold text-emerald-400">{correctCount}</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl text-center border border-zinc-900 print-card">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">Incorrect</span>
            <div className="mt-1 flex items-center justify-center space-x-1.5">
              <X className="w-4 h-4 text-rose-400" />
              <span className="text-lg font-mono font-bold text-rose-400">{wrongCount}</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl text-center border border-zinc-900 print-card">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">Skipped</span>
            <div className="mt-1 flex items-center justify-center space-x-1.5">
              <SkipForward className="w-4 h-4 text-zinc-500" />
              <span className="text-lg font-mono font-bold text-zinc-400">{skippedCount}</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl text-center border border-zinc-900 print-card">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">Duration</span>
            <div className="mt-1 flex items-center justify-center space-x-1">
              <span className="text-lg font-mono font-bold text-emerald-400">{formatDuration(timeTaken)}</span>
              <span className="text-[9px] text-zinc-500">({avgTimePerQuestion}s/q)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center font-sans gap-4 no-print">
        <button
          onClick={handlePrint}
          id="btn-print"
          className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-900 text-zinc-100 font-mono text-xs tracking-wider uppercase font-semibold py-3.5 px-6 rounded-2xl transition duration-150 flex items-center justify-center space-x-2 border border-zinc-850 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-zinc-400" />
          <span>Export Study Report</span>
        </button>

        <button
          onClick={onRestart}
          id="btn-restart"
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3.5 px-6 rounded-2xl transition duration-150 flex items-center justify-center space-x-2 ml-auto cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <RotateCcw className="w-4 h-4 text-black" />
          <span>Forge Another Material</span>
        </button>
      </div>      {/* Detailed Review Materials */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-3.5 no-print">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold font-serif text-white">Curated Conceptual Review</h3>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center space-x-1 p-1 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-xs max-w-max self-start sm:self-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer ${
                filter === "all"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All ({quizData.questions.length})
            </button>
            <button
              onClick={() => setFilter("flagged")}
              className={`px-3 py-1.5 rounded-lg transition duration-150 flex items-center space-x-1.5 cursor-pointer ${
                filter === "flagged"
                  ? "bg-amber-950/40 border border-amber-900/50 text-amber-400 font-semibold"
                  : "text-zinc-500 hover:text-amber-400/80"
              }`}
            >
              <Flag className={`w-3 h-3 ${filter === "flagged" ? "fill-amber-400 text-amber-400" : ""}`} />
              <span>Flagged ({flaggedQuestionIds.length})</span>
            </button>
          </div>
        </div>

        {/* Print-only review header */}
        <div className="hidden print:block border-b border-zinc-900 pb-2">
          <h3 className="text-xl font-bold font-serif text-white">Curated Conceptual Review {filter === "flagged" ? "(Flagged Only)" : ""}</h3>
        </div>

        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 text-center space-y-4 shadow-xl">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-amber-500">
                <Flag className="w-5 h-5 text-zinc-650" />
              </div>
              <h4 className="text-base font-serif font-bold text-zinc-300">No Flagged Questions</h4>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
                You didn't flag any questions during this run. While taking a quiz, use the "Flag Question" button to save confusing items for quick review here.
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-350 underline cursor-pointer"
              >
                Show All Questions Instead
              </button>
            </div>
          ) : (
            filteredQuestions.map(({ q, originalIdx }) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct_answer;
              const isSkipped = userAns === undefined || userAns === null;

              return (
                <motion.div 
                  key={q.id} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`border rounded-3xl p-6 md:p-8 space-y-4 print-card ${
                    isSkipped 
                      ? "border-zinc-900 bg-zinc-950/20" 
                      : isCorrect 
                        ? "border-emerald-950/40 bg-zinc-950/40 shadow-[0_0_15px_rgba(16,185,129,0.03)]" 
                        : "border-zinc-900 bg-zinc-950/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                    <span className="text-zinc-500 uppercase tracking-widest font-semibold">QUESTION {originalIdx + 1} OF {quizData.questions.length}</span>
                    <div className="flex items-center space-x-2">
                      {flaggedQuestionIds.includes(q.id) && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-900/50 text-amber-400 text-[10px] font-bold">
                          <Flag className="w-2.5 h-2.5 fill-amber-400 text-amber-450 shrink-0" />
                          <span>FLAGGED</span>
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold border uppercase ${
                        isSkipped 
                          ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" 
                          : isCorrect 
                            ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400" 
                            : "bg-rose-950/30 border-rose-900/50 text-rose-450"
                      }`}>
                        {isSkipped ? "SKIPPED" : isCorrect ? "CORRECT" : "INCORRECT"}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-lg text-white font-serif leading-relaxed">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const isKeyCorrect = q.correct_answer === key;
                      const isKeySelected = userAns === key;

                      return (
                        <div 
                          key={key} 
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border text-sm leading-snug ${
                            isKeyCorrect 
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300 font-medium" 
                              : isKeySelected 
                                ? "bg-rose-950/10 border-rose-500/20 text-rose-300" 
                                : "bg-zinc-950/40 border-zinc-900 text-zinc-500"
                          }`}
                        >
                          <span className={`flex items-center justify-center font-mono text-xs w-6 h-6 rounded-lg shrink-0 ${
                            isKeyCorrect 
                              ? "bg-emerald-550/20 border border-emerald-500/30 text-emerald-300" 
                              : isKeySelected 
                                ? "bg-rose-550/20 border border-rose-500/30 text-rose-350" 
                                : "bg-zinc-900 text-zinc-650"
                          }`}>
                            {key}
                          </span>
                          <span className="pt-0.5">{q.options[key]}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-950/90 p-4.5 rounded-2xl border border-zinc-900 text-xs text-zinc-300">
                    <div className="flex items-center space-x-1.5 text-zinc-400 mb-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Solution Logic Analysis:</span>
                    </div>
                    <p className="leading-relaxed font-sans italic pl-3 border-l border-zinc-800">
                      {q.explanation}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
