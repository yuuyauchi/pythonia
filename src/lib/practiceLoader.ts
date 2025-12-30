import practiceChaptersData from '../../assets/practice/practice_chapters.json';
import ch1Practice from '../../assets/practice/ch1_practice.json';
import ch2Practice from '../../assets/practice/ch2_practice.json';
import ch3Practice from '../../assets/practice/ch3_practice.json';
import ch4Practice from '../../assets/practice/ch4_practice.json';
import ch5Practice from '../../assets/practice/ch5_practice.json';
import ch6Practice from '../../assets/practice/ch6_practice.json';
import ch7Practice from '../../assets/practice/ch7_practice.json';
import ch8Practice from '../../assets/practice/ch8_practice.json';
import ch9Practice from '../../assets/practice/ch9_practice.json';

// Types
export type PracticeStepType = 'project_intro' | 'guided_step' | 'challenge' | 'free_practice';

export interface PracticeStep {
  id: string;
  type: PracticeStepType;
  contentId: string;
}

export interface PracticeChapter {
  id: string;
  title: string;
  description: string;
  projectTitle: string;
  steps: PracticeStep[];
}

export interface ProjectIntro {
  id: string;
  title: string;
  description: string;
  goals: string[];
  finalOutput: string;
}

export interface GuidedStep {
  id: string;
  title: string;
  instruction: string;
  hints: string[];
  starterCode: string;
  solution: string;
  expectedOutput: string;
  checkType: 'output_contains' | 'line_count' | 'exact_match';
  checkValue: string | number;
}

export interface TestCase {
  description: string;
  checkType: 'output_contains' | 'line_count' | 'exact_match';
  expected: string | number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instruction: string;
  starterCode: string;
  testCases: TestCase[];
  solution: string;
  hints: string[];
}

export interface FreePractice {
  id: string;
  title: string;
  description: string;
  prompt: string;
  starterCode: string;
  exampleSolution: string;
  tips: string[];
}

// Content map
const practiceContentMap: Record<string, any> = {
  ch1: ch1Practice,
  ch2: ch2Practice,
  ch3: ch3Practice,
  ch4: ch4Practice,
  ch5: ch5Practice,
  ch6: ch6Practice,
  ch7: ch7Practice,
  ch8: ch8Practice,
  ch9: ch9Practice,
};

// Get all practice chapters
export function getPracticeChapters(): PracticeChapter[] {
  return practiceChaptersData.chapters as PracticeChapter[];
}

// Get practice chapter by ID
export function getPracticeChapter(chapterId: string): PracticeChapter | null {
  const chapters = getPracticeChapters();
  return chapters.find((ch) => ch.id === chapterId) || null;
}

// Get practice content by type and ID
export function getPracticeContent(
  chapterId: string,
  contentId: string,
  type: PracticeStepType
): ProjectIntro | GuidedStep | Challenge | FreePractice | null {
  const chapterData = practiceContentMap[chapterId];
  if (!chapterData) return null;

  switch (type) {
    case 'project_intro':
      return (
        chapterData.project_intros?.find((item: ProjectIntro) => item.id === contentId) || null
      );
    case 'guided_step':
      return (
        chapterData.guided_steps?.find((item: GuidedStep) => item.id === contentId) || null
      );
    case 'challenge':
      return chapterData.challenges?.find((item: Challenge) => item.id === contentId) || null;
    case 'free_practice':
      return (
        chapterData.free_practices?.find((item: FreePractice) => item.id === contentId) || null
      );
    default:
      return null;
  }
}

// Get step data including content
export function getPracticeStepData(chapterId: string, stepId: string) {
  const chapter = getPracticeChapter(chapterId);
  if (!chapter) return null;

  const step = chapter.steps.find((s) => s.id === stepId);
  if (!step) return null;

  const content = getPracticeContent(chapterId, step.contentId, step.type);
  if (!content) return null;

  return {
    step,
    content,
    chapter,
  };
}
