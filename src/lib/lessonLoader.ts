import {
  Chapter,
  SlideContent,
  QuizFillContent,
  QuizMCQContent,
  CodeReadContent,
  CodeTaskContent
} from '../types/lesson';

type Quiz = QuizFillContent | QuizMCQContent;
type Task = CodeReadContent | CodeTaskContent;

// Import lesson data
const chaptersData = require('../../assets/lessons/chapters.json');
const ch1Slides = require('../../assets/lessons/ch1_slides.json');
const ch1Quizzes = require('../../assets/lessons/ch1_quizzes.json');
const ch1Tasks = require('../../assets/lessons/ch1_tasks.json');
const ch2Slides = require('../../assets/lessons/ch2_slides.json');
const ch2Quizzes = require('../../assets/lessons/ch2_quizzes.json');
const ch2Tasks = require('../../assets/lessons/ch2_tasks.json');
const ch3Slides = require('../../assets/lessons/ch3_slides.json');
const ch3Quizzes = require('../../assets/lessons/ch3_quizzes.json');
const ch3Tasks = require('../../assets/lessons/ch3_tasks.json');
const ch4Slides = require('../../assets/lessons/ch4_slides.json');
const ch4Quizzes = require('../../assets/lessons/ch4_quizzes.json');
const ch4Tasks = require('../../assets/lessons/ch4_tasks.json');
const ch5Slides = require('../../assets/lessons/ch5_slides.json');
const ch5Quizzes = require('../../assets/lessons/ch5_quizzes.json');
const ch5Tasks = require('../../assets/lessons/ch5_tasks.json');
const ch6Slides = require('../../assets/lessons/ch6_slides.json');
const ch6Quizzes = require('../../assets/lessons/ch6_quizzes.json');
const ch6Tasks = require('../../assets/lessons/ch6_tasks.json');
const ch7Slides = require('../../assets/lessons/ch7_slides.json');
const ch7Quizzes = require('../../assets/lessons/ch7_quizzes.json');
const ch7Tasks = require('../../assets/lessons/ch7_tasks.json');
const ch8Slides = require('../../assets/lessons/ch8_slides.json');
const ch8Quizzes = require('../../assets/lessons/ch8_quizzes.json');
const ch8Tasks = require('../../assets/lessons/ch8_tasks.json');
const ch9Slides = require('../../assets/lessons/ch9_slides.json');
const ch9Quizzes = require('../../assets/lessons/ch9_quizzes.json');
const ch9Tasks = require('../../assets/lessons/ch9_tasks.json');

// Combine all content
const allSlides = [
  ...ch1Slides.slides,
  ...ch2Slides.slides,
  ...ch3Slides.slides,
  ...ch4Slides.slides,
  ...ch5Slides.slides,
  ...ch6Slides.slides,
  ...ch7Slides.slides,
  ...ch8Slides.slides,
  ...ch9Slides.slides,
];

const allQuizzes = [
  ...ch1Quizzes.quizzes,
  ...ch2Quizzes.quizzes,
  ...ch3Quizzes.quizzes,
  ...ch4Quizzes.quizzes,
  ...ch5Quizzes.quizzes,
  ...ch6Quizzes.quizzes,
  ...ch7Quizzes.quizzes,
  ...ch8Quizzes.quizzes,
  ...ch9Quizzes.quizzes,
];

const allTasks = [
  ...ch1Tasks.tasks,
  ...ch2Tasks.tasks,
  ...ch3Tasks.tasks,
  ...ch4Tasks.tasks,
  ...ch5Tasks.tasks,
  ...ch6Tasks.tasks,
  ...ch7Tasks.tasks,
  ...ch8Tasks.tasks,
  ...ch9Tasks.tasks,
];

/**
 * Get all chapters
 */
export function getChapters(): Chapter[] {
  return chaptersData.chapters;
}

/**
 * Get a specific chapter by ID
 */
export function getChapterById(chapterId: string): Chapter | undefined {
  return chaptersData.chapters.find((ch: Chapter) => ch.id === chapterId);
}

/**
 * Get slide content by ID
 */
export function getSlideById(slideId: string): SlideContent | undefined {
  return allSlides.find((slide) => slide.id === slideId);
}

/**
 * Get quiz content by ID
 */
export function getQuizById(quizId: string): Quiz | undefined {
  return allQuizzes.find((quiz) => quiz.id === quizId);
}

/**
 * Get task content by ID
 */
export function getTaskById(taskId: string): Task | undefined {
  return allTasks.find((task) => task.id === taskId);
}

/**
 * Get content by ID and type
 */
export function getContentById(contentId: string, type: string): SlideContent | Quiz | Task | undefined {
  switch (type) {
    case 'slide':
      return getSlideById(contentId);
    case 'quiz_mcq':
    case 'quiz_fill':
      return getQuizById(contentId);
    case 'code_read':
    case 'code_task':
      return getTaskById(contentId);
    default:
      return undefined;
  }
}
