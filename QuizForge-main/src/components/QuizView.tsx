import React, { useState, useEffect, useRef } from "react";
import { QuizData, QuizQuestion } from "../types";
import { ArrowRight, SkipForward, HelpCircle, Check, X, Timer, Flag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizViewProps {
  quizData: QuizData;
  onQuizFinished: (
    answers: Record<number, "A" | "B" | "C" | "D" | null>,
    timeTaken: number,
    flaggedQuestionIds: number[]
  ) => void;
  onRestart: () => void;
}

export default function QuizView({ quizData, onQuizFinished, onRestart }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<number[]>([]);
  
  // Timer Configuration: 5 Minutes (300 seconds)
  const totalDuration = 300;
  const [timeLeft, setTimeLeft] = useState(totalDuration);

  // References to keep timer execution perfectly stable across changes
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const flaggedQuestionIdsRef = useRef(flaggedQuestionIds);
  flaggedQuestionIdsRef.current = flaggedQuestionIds;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onQuizFinished(answersRef.current, totalDuration, flaggedQuestionIdsRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onQuizFinished]);

  const currentQuestion: QuizQuestion = quizData.questions[currentIndex];
  const totalQuestions = quizData.questions.length;

  const toggleFlagQuestion = () => {
    const qId = currentQuestion.id;
    if (flaggedQuestionIds.includes(qId)) {
      setFlaggedQuestionIds(flaggedQuestionIds.filter((id) => id !== qId));
    } else {
      setFlaggedQuestionIds([...flaggedQuestionIds, qId]);
    }
  };

  const handleSelectOption = (option: "A" | "B" | "C" | "D") => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const updatedAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(updatedAnswers);
  };

  const handleSkipQuestion = () => {
    if (isAnswered) return;
    setSelectedOption(null);
    setIsAnswered(true);

    const updatedAnswers = { ...answers, [currentQuestion.id]: null };
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onQuizFinished(answers, totalDuration - timeLeft, flaggedQuestionIds);
    }
  };

  // Progress variables
  const answeredCount = Object.keys(answers).length;
  // Progress is calculated dynamically based on answered questions
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Black, White & Green Visual Highlights
  const getOptionStyle = (optionKey: "A" | "B" | "C" | "D") => {
    if (!isAnswered) {
      return "border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-100 hover:border-emerald-500 cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]";
    }

    const isCurrentOption = selectedOption === optionKey;
    const isCorrectOption = currentQuestion.correct_answer === optionKey;

    if (isCorrectOption) {
      return "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)]";
    }

    if (isCurrentOption) {
      return "border-rose-500 bg-rose-950/20 text-rose-300 font-medium";
    }

    return "border-zinc-900 bg-zinc-950/40 text-zinc-600 opacity-40";
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 no-print space-y-8">
      
      {/* Header section with Dynamic Timer Dial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase block">
            {quizData.quiz_title}
          </span>
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
            Question {currentIndex + 1} <span className="text-zinc-500 text-lg font-sans font-normal">of {totalQuestions}</span>
          </h2>
        </div>

        <div className="flex items-center space-x-3.5">
          {/* Circular SVG / Linear Ticking Timer Capsule */}
          <div className={`flex items-center space-x-2.5 border rounded-2xl px-4 py-2 font-mono text-sm shadow-inner transition-all duration-300
            ${timeLeft < 45 
              ? "border-rose-500 bg-rose-950/25 text-rose-400 animate-pulse font-bold" 
              : timeLeft < 120 
                ? "border-amber-500 bg-amber-950/15 text-amber-400" 
                : "border-zinc-850 bg-zinc-950 text-emerald-400"
            }
          `}>
            <Timer className={`w-4 h-4 shrink-0 ${timeLeft < 45 ? "animate-spin duration-3000" : ""}`} />
            <span>{formatTime(timeLeft)} remaining</span>
          </div>

          <button
            onClick={onRestart}
            className="text-xs font-mono text-zinc-500 hover:text-white border border-zinc-850 hover:border-zinc-700 rounded-xl px-3.5 py-2 transition hover:bg-zinc-900 cursor-pointer"
          >
            Quit
          </button>
        </div>
      </div>

      {/* STUNNING VISUAL PROGRESS BAR CONTAINER */}
      <div className="space-y-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-zinc-400 font-medium">Exam Progression</span>
          </div>
          <span className="text-emerald-400 font-bold">{Math.round(progressPercentage)}% Covered</span>
        </div>
        
        {/* Dynamic Glowing Progress Track */}
        <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850/80 relative">
          <motion.div
            className="h-full bg-emerald-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: "spring", damping: 15, stiffness: 80 }}
          >
            {/* Gloss shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </motion.div>
        </div>

        {/* Individual indicator dots for completed, active and upcoming */}
        <div className="flex justify-between gap-1 pt-1">
          {quizData.questions.map((q, idx) => {
            const isCompleted = answers[q.id] !== undefined;
            const isActive = idx === currentIndex;
            return (
              <div 
                key={q.id}
                className={`h-1.5 rounded-full flex-grow transition-all duration-300 ${
                  isActive 
                    ? "bg-emerald-400 ring-2 ring-emerald-500/20" 
                    : isCompleted 
                      ? "bg-emerald-600" 
                      : "bg-zinc-800"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Card with sliding AnimatePresence transitions */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-black border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle aesthetic alignment background matrix */}
            <div className="absolute top-0 right-0 p-6 opacity-3 pointer-events-none select-none">
              <HelpCircle className="w-20 h-20 text-white" />
            </div>

            <div className="flex items-center justify-between gap-2 overflow-hidden flex-wrap">
              {/* Micro Category Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] font-mono px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
              </div>

              {/* Flag Question Button */}
              <button
                type="button"
                onClick={toggleFlagQuestion}
                className={`inline-flex items-center space-x-1.5 border px-3 py-1 rounded-full text-[10px] font-mono transition duration-150 cursor-pointer ${
                  flaggedQuestionIds.includes(currentQuestion.id)
                    ? "bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-bounce-subtle"
                    : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}
                title={flaggedQuestionIds.includes(currentQuestion.id) ? "Unflag question" : "Flag question for later review"}
              >
                <Flag className={`w-3 h-3 ${flaggedQuestionIds.includes(currentQuestion.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{flaggedQuestionIds.includes(currentQuestion.id) ? "Flagged for Review" : "Flag Question"}</span>
              </button>
            </div>

            {/* Question Title */}
            <h3 className="text-xl md:text-2xl font-serif text-white leading-relaxed font-semibold">
              {currentQuestion.question}
            </h3>

            {/* Animated Grid Options */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {(["A", "B", "C", "D"] as const).map((key) => (
                <button
                  key={key}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(key)}
                  id={`option-${key}-${currentQuestion.id}`}
                  className={`flex items-start text-left w-full border p-4 sm:p-5 rounded-2xl transition-all duration-200 gap-4 group ${getOptionStyle(key)}`}
                >
                  <span
                    className={`flex items-center justify-center font-mono text-sm font-bold w-8 h-8 rounded-xl shrink-0 border transition-all duration-200
                      ${!isAnswered 
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:border-emerald-400 group-hover:text-emerald-300" 
                        : currentQuestion.correct_answer === key 
                          ? "bg-emerald-950 border-emerald-400 text-emerald-300"
                          : selectedOption === key 
                            ? "bg-rose-950 border-rose-500 text-rose-300"
                            : "bg-zinc-950 border-zinc-900 text-zinc-700"
                      }
                    `}
                  >
                    {key}
                  </span>
                  <span className="text-base leading-snug pt-1">{currentQuestion.options[key]}</span>
                </button>
              ))}
            </div>

            {/* Explanation Block immediately slides down upon choice/skip */}
            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-6 border-t border-zinc-900 mt-4 overflow-hidden"
              >
                <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center space-x-2.5">
                    {selectedOption === null ? (
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-zinc-400">
                        <SkipForward className="w-4 h-4" />
                      </div>
                    ) : selectedOption === currentQuestion.correct_answer ? (
                      <div className="bg-emerald-950 p-1.5 rounded-lg text-emerald-400 border border-emerald-900">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-rose-950 p-1.5 rounded-lg text-rose-400 border border-rose-900">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                      {selectedOption === null 
                        ? "Skipped Item Analysis" 
                        : selectedOption === currentQuestion.correct_answer 
                          ? "Correct Decision Insights" 
                          : `Incorrect Path Selected (${selectedOption})`
                      }
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans pl-1.5">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-1">
        {!isAnswered ? (
          <button
            onClick={handleSkipQuestion}
            id="btn-skip-question"
            className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white font-mono py-3 px-5 transition duration-150 rounded-xl hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 cursor-pointer"
          >
            <SkipForward className="w-4 h-4 text-zinc-500" />
            <span>Skip Item</span>
          </button>
        ) : (
          <div /> // alignment spacing filler
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            id="btn-next-question"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold font-sans py-3.5 px-6 rounded-xl transition duration-150 shadow-[0_0_20px_rgba(16,185,129,0.3)] ml-auto cursor-pointer"
          >
            <span>
              {currentIndex + 1 < totalQuestions ? "Advance Concept" : "Complete Study Session"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
