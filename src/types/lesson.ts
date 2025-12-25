export type StepType = 'slide' | 'code_read' | 'quiz_fill' | 'quiz_mcq' | 'code_task';

export interface Step {
  id: string;
  type: StepType;
  contentId: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

// Content type for slides
export interface SlideContent {
  id: string;
  title: string;
  bullets: string[];
}

// Content type for code_read
export interface CodeReadContent {
  id: string;
  description: string;
  code: string;
  expectedOutput?: string;
}

// Content type for quiz_fill
export interface QuizFillContent {
  id: string;
  description: string;
  codeTemplate: string; // Code with ____ placeholders
  blanks: {
    id: string;
    correctAnswer: string;
    hint?: string;
  }[];
  explanation: string;
}

// Content type for quiz_mcq
export interface QuizMCQContent {
  id: string;
  question: string;
  code?: string;
  choices: {
    id: string;
    text: string;
  }[];
  correctChoiceId: string;
  explanation: string;
}

// Content type for code_task
export interface CodeTaskContent {
  id: string;
  description: string;
  initialCode: string;
  testCases: {
    input?: string;
    expectedOutput: string;
    description: string;
  }[];
  hint?: string;
}

// Container types for JSON files
export interface ChaptersData {
  chapters: Chapter[];
}

export interface SlidesData {
  slides: SlideContent[];
}

export interface QuizzesData {
  quizzes: (QuizFillContent | QuizMCQContent)[];
}

export interface TasksData {
  tasks: CodeTaskContent[];
}
