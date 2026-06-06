import React, { useState } from "react";
import { QuizData } from "./types";
import UploadZone from "./components/UploadZone";
import QuizView from "./components/QuizView";
import ScoreScreen from "./components/ScoreScreen";
import { BookOpen, Sparkles, FileText, CheckCircle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  React.useEffect(() => {
    document.title = "Quizforge";
  }, []);

  const [appState, setAppState] = useState<"upload" | "quiz" | "score">("upload");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<number[]>([]);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  const handleQuizGenerated = (data: QuizData) => {
    setQuizData(data);
    setUserAnswers({});
    setFlaggedQuestionIds([]);
    setTimeTaken(0);
    setAppState("quiz");
  };

  const handleQuizFinished = (
    answers: Record<number, "A" | "B" | "C" | "D" | null>,
    duration: number,
    flaggedIds: number[]
  ) => {
    setUserAnswers(answers);
    setTimeTaken(duration);
    setFlaggedQuestionIds(flaggedIds);
    setAppState("score");
  };

  const handleRestart = () => {
    setQuizData(null);
    setUserAnswers({});
    setFlaggedQuestionIds([]);
    setAppState("upload");
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500/35 selection:text-emerald-300">
      
      {/* Sleek Minimalist Header */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleRestart}>
            <div className="p-2 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-800">
              <BrainCircuit className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xl font-serif font-black tracking-tight text-white block">
                QuizForge
              </span>
              <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block -mt-1 font-semibold">
                AI Cognitive Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center bg-zinc-90 w/80 border border-zinc-900 text-zinc-400 text-[10px] px-3.5 py-1.5 rounded-full font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-ping"></span>
              Gemini 1.5 Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col justify-center py-10 md:py-16">
        <AnimatePresence mode="wait">
          
          {/* State 1: Upload and Introduction */}
          {appState === "upload" && (
            <motion.div
              key="upload-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Elegant Hero Pitch */}
              <div className="text-center max-w-2xl mx-auto space-y-4 px-4 no-print">
                <div className="inline-flex items-center space-x-2 bg-emerald-950/20 border border-emerald-800/20 text-emerald-400 text-xs px-4 py-1.5 rounded-full font-mono font-medium mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Study Material Synthesizer</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                  Forge study decks into <span className="text-emerald-4o text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-white">instinctual mastery</span>
                </h1>
                
                <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  Transform complex textbooks, lecture slide presentations, or book notes into precise multiple-choice evaluation training.
                </p>
              </div>

              {/* Upload form container */}
              <UploadZone onQuizGenerated={handleQuizGenerated} />

              {/* Bento Grid layout style key points */}
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 px-4 pt-4 no-print">
                <div className="bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 space-y-3 hover:border-zinc-800 transitionduration-150">
                  <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-emerald-400">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide">1. Transcribe</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    Load any book material or presentation slides up to 20MB. Content is analyzed and summarized securely.
                  </p>
                </div>

                <div className="bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 space-y-3 hover:border-zinc-800 transition duration-150">
                  <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide">2. Synthesize</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    Gemini extracts complex conceptual terms and designs 10 adaptive multiple-choice challenges based on the text.
                  </p>
                </div>

                <div className="bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 space-y-3 hover:border-zinc-800 transition duration-150">
                  <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide">3. Review & Perfect</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    Analyze explanations immediately, monitor pace markers, and print or export comprehensive PDF reports instantly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* State 2: Active Interactive Quiz View */}
          {appState === "quiz" && quizData && (
            <motion.div
              key="quiz-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <QuizView
                quizData={quizData}
                onQuizFinished={handleQuizFinished}
                onRestart={handleRestart}
              />
            </motion.div>
          )}

          {/* State 3: Score presentation & deep report review */}
          {appState === "score" && quizData && (
            <motion.div
              key="score-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <ScoreScreen
                quizData={quizData}
                answers={userAnswers}
                timeTaken={timeTaken}
                flaggedQuestionIds={flaggedQuestionIds}
                onRestart={handleRestart}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modern Black/White Aesthetic Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-zinc-605 text-[10px] uppercase font-mono tracking-wider mt-10 no-print">
        <p>© 2026 QuizForge • Crafted in Black, White & Emerald Green</p>
      </footer>
    </div>
  );
}
