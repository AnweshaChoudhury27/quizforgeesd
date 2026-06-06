export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuestionOptions;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface QuizData {
  quiz_title: string;
  questions: QuizQuestion[];
}

export interface UserAnswer {
  questionId: number;
  selectedOption: "A" | "B" | "C" | "D" | null; // null if skipped
  isCorrect: boolean;
}

export interface QuizProgress {
  currentQuestionIndex: number;
  answers: Record<number, "A" | "B" | "C" | "D" | null>;
  isCompleted: boolean;
}
