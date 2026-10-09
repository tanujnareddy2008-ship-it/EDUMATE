import {
  MaterialAnalysis,
  QuizQuestion,
  WeeklyTest,
  FlowchartData,
  RecommendedChannel,
} from '../types';

export async function analyzeMaterial(params: {
  textContent?: string;
  pdfBase64?: string;
  fileName?: string;
  userGoal?: string;
  targetExam?: string;
  subject?: string;
  topic?: string;
}): Promise<MaterialAnalysis> {
  const response = await fetch('/api/analyze-material', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze material: ${response.statusText}`);
  }

  return response.json();
}

export async function generateQuiz(params: {
  topic: string;
  subject: string;
  difficulty?: string;
  questionCount?: number;
  isPyq?: boolean;
  targetExam?: string;
  documentText?: string;
  pdfBase64?: string;
  lowKnowledgeTopics?: string[];
}): Promise<QuizQuestion[]> {
  const response = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate quiz: ${response.statusText}`);
  }

  return response.json();
}

export async function generateWeeklyTest(params: {
  targetExam: string;
  subject: string;
  topics?: string[] | string;
}): Promise<WeeklyTest> {
  const response = await fetch('/api/generate-weekly-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate weekly test: ${response.statusText}`);
  }

  return response.json();
}

export async function generateFlowchart(params: {
  topic: string;
  subject: string;
  documentText?: string;
}): Promise<FlowchartData> {
  const response = await fetch('/api/generate-flowchart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate flowchart: ${response.statusText}`);
  }

  return response.json();
}

export async function askDoubt(params: {
  question: string;
  documentText?: string;
  pdfBase64?: string;
  subject?: string;
  topic?: string;
}): Promise<{ answer: string; source: string }> {
  const response = await fetch('/api/ask-doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to answer doubt: ${response.statusText}`);
  }

  return response.json();
}

export async function getLectureRecommendations(params: {
  topic: string;
  subject: string;
  targetExam?: string;
}): Promise<{
  topChannels: RecommendedChannel[];
  videoModules: {
    moduleTitle: string;
    keyConceptsCovered: string[];
    searchQuery: string;
  }[];
}> {
  const response = await fetch('/api/lecture-recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  return response.json();
}
