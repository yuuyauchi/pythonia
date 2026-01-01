import coursesCatalog from '../../assets/courses/courses_catalog.json';
import weatherBotCourse from '../../assets/courses/course_weather_bot.json';
import fileOrganizerCourse from '../../assets/courses/course_file_organizer.json';
import taskManagerCourse from '../../assets/courses/course_task_manager.json';
import excelAnalyzerCourse from '../../assets/courses/course_excel_analyzer.json';
import webScrapingCourse from '../../assets/courses/course_web_scraping.json';
import chatbotCourse from '../../assets/courses/course_chatbot.json';
import pdfGeneratorCourse from '../../assets/courses/course_pdf_generator.json';
import emailAutomationCourse from '../../assets/courses/course_email_automation.json';
import imageProcessorCourse from '../../assets/courses/course_image_processor.json';
import flaskWebappCourse from '../../assets/courses/course_flask_webapp.json';
import mlIntroCourse from '../../assets/courses/course_ml_intro.json';
import apiServerCourse from '../../assets/courses/course_api_server.json';
import dbWebappCourse from '../../assets/courses/course_db_webapp.json';

// Types
export type CourseCategory = 'beginner' | 'intermediate' | 'advanced';
export type ModuleType = 'problem_discovery' | 'planning' | 'implementation' | 'reflection';

export interface CourseModule {
  id: string;
  type: ModuleType;
  contentId: string;
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  difficulty: string;
  duration: string;
  price: number;
  thumbnail: string;
  description: string;
  learningGoals: string[];
  libraries: string[];
  tags: string[];
  modules: CourseModule[];
}

export interface ProblemDiscovery {
  id: string;
  title: string;
  scenario: {
    title: string;
    description: string;
    timeSpent: string;
    painPoints: string[];
  };
  problemAnalysis: {
    question1: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  idealSolution: {
    title: string;
    description: string;
    benefits: string[];
    beforeAfter: {
      before: string;
      after: string;
    };
  };
  technicalFeasibility: {
    title: string;
    answer: string;
    approach: string[];
    libraries: Array<{
      name: string;
      purpose: string;
      reason: string;
    }>;
  };
}

export interface Planning {
  id: string;
  title: string;
  requirements: {
    title: string;
    features: Array<{
      feature: string;
      detail: string;
      priority: string;
    }>;
  };
  technicalChoice: {
    title: string;
    choices: Array<{
      aspect: string;
      options: Array<{
        name: string;
        pros: string[];
        cons: string[];
        selected: boolean;
      }>;
    }>;
  };
  architecture: {
    title: string;
    flow: string[];
    dataFlow: string;
  };
  developmentPlan: {
    title: string;
    steps: Array<{
      step: number;
      title: string;
      estimate: string;
    }>;
    totalEstimate: string;
  };
}

export interface Implementation {
  id: string;
  title: string;
  objective: string;
  explanation: string;
  instructions: Array<{
    step: number;
    title: string;
    description: string;
    code?: string;
    explanation?: string;
  }>;
  starterCode: string;
  solution: string;
  hints: string[];
  keyPoints: string[];
}

export interface Reflection {
  id: string;
  title: string;
  summary: {
    title: string;
    description: string;
    achievements: string[];
  };
  beforeAfter: {
    before: {
      time: string;
      method: string;
      issues: string[];
    };
    after: {
      time: string;
      method: string;
      benefits: string[];
    };
    improvement: string;
  };
  furtherImprovements: {
    title: string;
    ideas: Array<{
      idea: string;
      description: string;
      difficulty: string;
      library: string;
    }>;
  };
  nextChallenge: {
    title: string;
    questions: string[];
    encouragement: string;
  };
}

// Content map
const courseContentMap: Record<string, any> = {
  course_weather_bot: weatherBotCourse,
  course_file_organizer: fileOrganizerCourse,
  course_task_manager: taskManagerCourse,
  course_excel_analyzer: excelAnalyzerCourse,
  course_web_scraping: webScrapingCourse,
  course_chatbot: chatbotCourse,
  course_pdf_generator: pdfGeneratorCourse,
  course_email_automation: emailAutomationCourse,
  course_image_processor: imageProcessorCourse,
  course_flask_webapp: flaskWebappCourse,
  course_ml_intro: mlIntroCourse,
  course_api_server: apiServerCourse,
  course_db_webapp: dbWebappCourse,
};

// Get all courses
export function getCourses(): Course[] {
  return coursesCatalog.courses as Course[];
}

// Check if course has content available
export function hasCourseContent(courseId: string): boolean {
  return courseContentMap[courseId] !== undefined;
}

// Get courses by category
export function getCoursesByCategory(category: CourseCategory): Course[] {
  return getCourses().filter((course) => course.category === category);
}

// Get course by ID
export function getCourse(courseId: string): Course | null {
  const courses = getCourses();
  return courses.find((course) => course.id === courseId) || null;
}

// Get course content
export function getCourseModuleContent(
  courseId: string,
  contentId: string,
  type: ModuleType
): ProblemDiscovery | Planning | Implementation | Reflection | null {
  const courseData = courseContentMap[courseId];
  if (!courseData) return null;

  switch (type) {
    case 'problem_discovery':
      return (
        courseData.problem_discovery?.find(
          (item: ProblemDiscovery) => item.id === contentId
        ) || null
      );
    case 'planning':
      return courseData.planning?.find((item: Planning) => item.id === contentId) || null;
    case 'implementation':
      return (
        courseData.implementation?.find((item: Implementation) => item.id === contentId) || null
      );
    case 'reflection':
      return (
        courseData.reflection?.find((item: Reflection) => item.id === contentId) || null
      );
    default:
      return null;
  }
}

// Get module data
export function getCourseModuleData(courseId: string, moduleId: string) {
  const course = getCourse(courseId);
  if (!course) return null;

  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) return null;

  const content = getCourseModuleContent(courseId, module.contentId, module.type);
  if (!content) return null;

  return {
    module,
    content,
    course,
  };
}
