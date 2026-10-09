import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to strip markdown JSON fence if present
function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// 1. Analyze Document / Material
app.post('/api/analyze-material', async (req: Request, res: Response) => {
  try {
    const {
      textContent,
      pdfBase64,
      fileName,
      userGoal,
      targetExam,
      subject,
      topic,
    } = req.body;

    const hasDocument = Boolean((pdfBase64 && pdfBase64.length > 50) || (textContent && textContent.trim().length > 20));

    let prompt = `You are EDUMATE, an expert smart education system.
Target Exam / Goal: ${targetExam || userGoal || 'General Academic Mastery'}
Subject: ${subject || 'General'}
Topic: ${topic || 'Comprehensive'}

`;

    if (hasDocument) {
      prompt += `CRITICAL CONSTRAINT: The user has uploaded an educational document (${fileName || 'document'}).
According to strict policy: You MUST ONLY provide information strictly contained within this document.
Do NOT extrapolate, hallucinate, or add facts from external sources that are not supported by the document text.
If a specific topic is asked that is absent in the document, explicitly note that it is not covered in the uploaded material.`;
    } else {
      prompt += `The user has not uploaded any document. Provide authoritative, thorough, and highly structured educational information from broad curriculum standards.`;
    }

    prompt += `
Extract and generate the following in valid JSON:
{
  "summary": "Clear, engaging summary of the material / topic (2-3 paragraphs)",
  "importantTopics": [
    {
      "id": "topic-1",
      "title": "Topic name",
      "importance": "High" | "Medium" | "Core Essential",
      "description": "Why it matters and core takeaways",
      "keyTerms": ["term1", "term2", "term3"]
    }
  ],
  "keyConcepts": [
    {
      "term": "Concept or formula name",
      "definition": "Crisp definition or formula statement",
      "example": "Practical real-world application or exam tip"
    }
  ],
  "flowchart": {
    "title": "Conceptual Flowchart for " + (topic || "Material"),
    "steps": [
      {
        "step": 1,
        "title": "Phase 1: Foundation",
        "description": "Core premise",
        "connections": ["Phase 2: Mechanics"]
      },
      {
        "step": 2,
        "title": "Phase 2: Mechanics",
        "description": "Detailed working principles",
        "connections": ["Phase 3: Applications"]
      },
      {
        "step": 3,
        "title": "Phase 3: Applications",
        "description": "Problem-solving & exam problems",
        "connections": []
      }
    ]
  },
  "recommendedChannels": [
    {
      "channelName": "Name of top educational channel (e.g. Khan Academy, 3Blue1Brown, MIT OCW, CrashCourse, Physics Wallah)",
      "reason": "Why this channel is best for this specific topic",
      "searchQuery": "Exact high-yield YouTube search query"
    }
  ]
}`;

    if (!ai) {
      // Fallback response if API key not yet configured
      return res.json({
        summary: `Welcome to EDUMATE Smart Study for ${topic || subject || 'your course'}. This study unit covers fundamental definitions, principles, and key exam concepts.`,
        importantTopics: [
          {
            id: 'top-1',
            title: topic || 'Core Fundamentals',
            importance: 'High',
            description: 'Foundational framework and principal laws frequently tested in exams.',
            keyTerms: ['Core Principle', 'Primary Law', 'Standard Units', 'Boundary Conditions'],
          },
          {
            id: 'top-2',
            title: 'Problem Solving & Applications',
            importance: 'Core Essential',
            description: 'Algorithmic approaches and formula applications for solving numerical & theoretical problems.',
            keyTerms: ['Derivation', 'Formulas', 'Error Analysis', 'Real-world Model'],
          },
        ],
        keyConcepts: [
          {
            term: `${topic || 'Fundamental'} Theorem`,
            definition: 'State conditions under which the primary relation holds true across all standard test scenarios.',
            example: 'Apply directly in standard problems to deduce target unknowns.',
          },
        ],
        flowchart: {
          title: `Logical Flowchart: ${topic || subject || 'Subject Flow'}`,
          steps: [
            { step: 1, title: 'Prerequisites & Definitions', description: 'Review basic terms and axioms.', connections: ['Core Formulations'] },
            { step: 2, title: 'Core Formulations', description: 'Derive governing relations and test cases.', connections: ['PYQ Applications'] },
            { step: 3, title: 'PYQ Applications', description: 'Practice Previous Year Questions under time limits.', connections: [] },
          ],
        },
        recommendedChannels: [
          { channelName: 'Khan Academy', reason: 'Intuitive visual explanations and step-by-step proofs', searchQuery: `${topic || subject} Khan Academy` },
          { channelName: 'CrashCourse', reason: 'Fast-paced, memorable high-yield video reviews', searchQuery: `${topic || subject} CrashCourse` },
        ],
      });
    }

    let contents: any;
    if (pdfBase64 && pdfBase64.length > 50) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      };
    } else if (textContent) {
      contents = `${prompt}\n\nDOCUMENT TEXT CONTENT:\n${textContent.slice(0, 40000)}`;
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanJson(response.text || '{}');
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing material:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze material' });
  }
});

// 2. Generate Quiz (10 questions by default, or 20 for weak-topic / custom)
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      subject,
      difficulty,
      questionCount = 10,
      isPyq = false,
      targetExam,
      documentText,
      pdfBase64,
      lowKnowledgeTopics = [],
    } = req.body;

    const count = Math.min(Math.max(Number(questionCount) || 10, 5), 30);
    const hasDocument = Boolean((pdfBase64 && pdfBase64.length > 50) || (documentText && documentText.trim().length > 20));

    let prompt = `You are EDUMATE Quiz Generator.
Topic: ${topic || 'General Subject'}
Subject: ${subject || 'Science / Academics'}
Target Exam: ${targetExam || 'Standard Exam'}
Difficulty: ${difficulty || 'Moderate'}
Number of Questions: ${count}
${isPyq ? 'Include realistic Previous Year Questions (PYQ) pattern from top exams with year tags.' : ''}
${lowKnowledgeTopics.length > 0 ? `FOCUS SPECIALLY ON THESE WEAK TOPICS: ${lowKnowledgeTopics.join(', ')}` : ''}

`;

    if (hasDocument) {
      prompt += `STRICT DOCUMENT GROUNDING:
All questions and answers MUST be 100% strictly derived from the provided document only.
Do not ask questions on facts not covered in this text!`;
    } else {
      prompt += `Generate high-yield questions adhering to standard academic / competitive syllabus.`;
    }

    prompt += `
Return ONLY a JSON array of ${count} questions in this format:
[
  {
    "id": 1,
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation of why the correct option is right and others are wrong.",
    "topic": "Specific sub-topic tested",
    "isPyq": true,
    "pyqExam": "JEE Main / NEET / UPSC / SAT (Year 2023)",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]`;

    if (!ai) {
      // Fallback questions
      const fallbackList = Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        question: `[Practice Q${i + 1}] Regarding ${topic || 'the subject'}, which principle is essential when analyzing fundamental behavior?`,
        options: [
          'Conservation of energy and standard boundary principles',
          'Arbitrary variance without boundary constraints',
          'Instantaneous dissipation without thermodynamic exchange',
          'Static stagnation under non-zero net external forces',
        ],
        correctIndex: 0,
        explanation: 'Standard foundational laws require equilibrium and conservation constraints to hold under closed systems.',
        topic: topic || 'Core Axioms',
        isPyq: i % 2 === 0,
        pyqExam: `Competitive Exam (${2020 + (i % 4)})`,
        difficulty: i < 3 ? 'Easy' : i < 7 ? 'Medium' : 'Hard',
      }));
      return res.json(fallbackList);
    }

    let contents: any;
    if (pdfBase64 && pdfBase64.length > 50) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      };
    } else if (documentText) {
      contents = `${prompt}\n\nDOCUMENT TEXT CONTENT:\n${documentText.slice(0, 40000)}`;
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanJson(response.text || '[]');
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 3. Generate 2-Hour Competitive Weekly Test with PYQs & Solutions
app.post('/api/generate-weekly-test', async (req: Request, res: Response) => {
  try {
    const { targetExam, subject, topics } = req.body;

    const prompt = `You are the EDUMATE Competitive Exam Board.
Generate a comprehensive 2-Hour Mock Test for: ${targetExam || 'Competitive Exam'}
Subject: ${subject || 'Comprehensive Multi-Subject'}
Topics to cover: ${Array.isArray(topics) ? topics.join(', ') : (topics || 'Major syllabus topics')}

Generate 20 high-value Previous Year Questions (PYQs) and important high-weightage questions representing a realistic 2-hour competitive exam.
Each question should be challenging and authentic.
Format as JSON:
{
  "testTitle": "Weekly 2-Hour All-India / National Mock Test: " + (targetExam || "Competitive Exam"),
  "durationMinutes": 120,
  "totalMarks": 80,
  "instructions": [
    "+4 marks for each correct answer",
    "-1 mark for each incorrect answer (Negative Marking)",
    "0 marks for unattempted questions",
    "Time allowed: 2 Hours (120 Minutes)"
  ],
  "sections": [
    {
      "name": "Section A: Core Concepts & PYQs",
      "questions": [
        {
          "id": 1,
          "question": "In-depth competitive question...",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0,
          "explanation": "Step-by-step rigorous derivation and mathematical / logical proof.",
          "topic": "Topic Name",
          "pyqYear": "2023",
          "pyqExam": "JEE / NEET / UPSC / GATE",
          "commonMistake": "Common trap students fall into and why option B/C was tempting."
        }
      ]
    }
  ]
}`;

    if (!ai) {
      return res.json({
        testTitle: `Weekly 2-Hour Competitive Mock Test: ${targetExam || 'National Competitive Exam'}`,
        durationMinutes: 120,
        totalMarks: 80,
        instructions: [
          '+4 marks for each correct response',
          '-1 mark penalty for incorrect response',
          'Duration: 120 minutes (2 hours)',
        ],
        sections: [
          {
            name: 'Section 1: Conceptual & Analytical PYQs',
            questions: Array.from({ length: 15 }).map((_, i) => ({
              id: i + 1,
              question: `[PYQ ${2021 + (i % 3)}] Consider the standard mathematical / physical system governed by differential equations. Under equilibrium conditions with zero damping, what is the frequency response?`,
              options: [
                'ω0 = √(k/m) with 90° phase lag',
                'ω0 = k/m with zero phase variation',
                'ω0 = m/k with 180° inversion',
                'Indeterminate due to asymptotic divergence',
              ],
              correctIndex: 0,
              explanation: 'In an undamped simple harmonic oscillator, natural resonant frequency is strictly √(k/m).',
              topic: 'Oscillations & Dynamics',
              pyqYear: `${2021 + (i % 3)}`,
              pyqExam: targetExam || 'JEE Advanced / GATE',
              commonMistake: 'Students often forget the square root operator and confuse k/m with m/k.',
            })),
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanJson(response.text || '{}');
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating weekly test:', error);
    res.status(500).json({ error: error.message || 'Failed to generate weekly test' });
  }
});

// 4. Generate Interactive Diagrammatic Flowchart for Revision
app.post('/api/generate-flowchart', async (req: Request, res: Response) => {
  try {
    const { topic, subject, documentText } = req.body;
    let prompt = `Create an interactive, visual flowchart and diagrammatic breakdown for quick visual revision of:
Topic: ${topic || 'Key Concepts'}
Subject: ${subject || 'General'}
${documentText ? 'Ground the diagram STRICTLY in the provided document content.' : ''}

Output JSON format:
{
  "title": "Visual Architecture: " + topic,
  "conceptOverview": "2-line high-retention summary",
  "flowchart": {
    "nodes": [
      {
        "id": "node-1",
        "title": "Starting Principle",
        "subtitle": "Origin axiom",
        "category": "start" | "process" | "decision" | "outcome",
        "details": "What happens here",
        "keyFormulaOrRule": "Formula or key phrase",
        "next": ["node-2"]
      },
      {
        "id": "node-2",
        "title": "Mechanism / Branch",
        "subtitle": "Intermediate analysis",
        "category": "process",
        "details": "Working logic",
        "keyFormulaOrRule": "Rule / Law",
        "next": ["node-3"]
      },
      {
        "id": "node-3",
        "title": "Exam Resolution & Result",
        "subtitle": "Final state",
        "category": "outcome",
        "details": "Exam application tip",
        "keyFormulaOrRule": "Final Equation",
        "next": []
      }
    ]
  },
  "mnemonic": {
    "acronym": "E.D.U.M.A.T.E",
    "expansion": "Easy Deductions Unlock Mastery And Top Efficiency",
    "memoryTrick": "Visual anchor trick to remember this topic easily during exams."
  }
}`;

    if (!ai) {
      return res.json({
        title: `Visual Architecture: ${topic || 'Key Concepts'}`,
        conceptOverview: 'A step-by-step visual roadmap from base axioms to exam-level deductions.',
        flowchart: {
          nodes: [
            {
              id: 'node-1',
              title: '1. Foundation & Definition',
              subtitle: 'Axiomatic Setup',
              category: 'start',
              details: 'Establish coordinates, reference frame, and governing assumptions.',
              keyFormulaOrRule: 'Define Baseline State (t=0)',
              next: ['node-2'],
            },
            {
              id: 'node-2',
              title: '2. Equation Transformation',
              subtitle: 'Core Process',
              category: 'process',
              details: 'Apply conservation laws and isolate primary variables.',
              keyFormulaOrRule: 'Σ F = ma or ΔE = Q - W',
              next: ['node-3', 'node-4'],
            },
            {
              id: 'node-3',
              title: '3A. Standard Case',
              subtitle: 'Zero Losses',
              category: 'process',
              details: 'Solve algebraic relation directly for benchmark answer.',
              keyFormulaOrRule: 'Direct Substitution',
              next: ['node-5'],
            },
            {
              id: 'node-4',
              title: '3B. Boundary Exception',
              subtitle: 'Non-ideal Conditions',
              category: 'decision',
              details: 'Check if friction or saturation effects require correction factors.',
              keyFormulaOrRule: 'Boundary Factor η < 1',
              next: ['node-5'],
            },
            {
              id: 'node-5',
              title: '4. Final Exam Verification',
              subtitle: 'Mastery Outcome',
              category: 'outcome',
              details: 'Sanity check dimensional units and limiting cases (0 and ∞).',
              keyFormulaOrRule: 'Dimensional Consistency Check',
              next: [],
            },
          ],
        },
        mnemonic: {
          acronym: 'F.A.S.T',
          expansion: 'Formula, Assumptions, Substitution, Tolerances',
          memoryTrick: 'Remember FAST whenever you see this topic on the question paper!',
        },
      });
    }

    const contents = documentText ? `${prompt}\n\nDOCUMENT:\n${documentText.slice(0, 30000)}` : prompt;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanJson(response.text || '{}');
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error('Error generating flowchart:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flowchart' });
  }
});

// 5. Ask Doubt (strictly PDF grounded if PDF attached)
app.post('/api/ask-doubt', async (req: Request, res: Response) => {
  try {
    const { question, documentText, pdfBase64, subject, topic } = req.body;
    const hasDocument = Boolean((pdfBase64 && pdfBase64.length > 50) || (documentText && documentText.trim().length > 20));

    let prompt = `You are EDUMATE, an expert pedagogical tutor.
Subject: ${subject || 'General'}
Topic: ${topic || 'General'}
User Question: "${question}"

`;

    if (hasDocument) {
      prompt += `STRICT RULE: The user has uploaded an authoritative document.
You MUST ONLY answer using information strictly present in the uploaded document.
If the document does NOT contain the answer, you must reply:
"Based strictly on your uploaded document, this information is not mentioned or covered in the provided material."
Do not extrapolate outside the text.`;
    } else {
      prompt += `Provide a clear, pedagogical, step-by-step educational explanation with examples and formulas.`;
    }

    if (!ai) {
      return res.json({
        answer: `[EDUMATE Explanation for: "${question}"]\n\nIn ${subject || 'this topic'}, this concept is governed by fundamental principles. To solve related questions, identify the known variables, select the governing equation, and check boundary conditions.\n\nTip: Practice with Previous Year Questions (PYQs) to reinforce this pattern!`,
        source: hasDocument ? 'Uploaded Document' : 'Universal Curriculum Knowledge',
      });
    }

    let contents: any;
    if (pdfBase64 && pdfBase64.length > 50) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      };
    } else if (documentText) {
      contents = `${prompt}\n\nDOCUMENT TEXT:\n${documentText.slice(0, 40000)}`;
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    res.json({
      answer: response.text || 'No response generated.',
      source: hasDocument ? 'Uploaded Document' : 'Universal Curriculum Knowledge',
    });
  } catch (error: any) {
    console.error('Error answering doubt:', error);
    res.status(500).json({ error: error.message || 'Failed to answer doubt' });
  }
});

// 6. YouTube Lecture Recommendations
app.post('/api/lecture-recommendations', async (req: Request, res: Response) => {
  try {
    const { topic, subject, targetExam } = req.body;
    const prompt = `Suggest the top, most-viewed educational YouTube channels and generated study video topics for:
Topic: ${topic || 'Core Subject'}
Subject: ${subject || 'Science / Math / Engineering / Humanities'}
Target Exam: ${targetExam || 'General'}

Provide in JSON format:
{
  "topChannels": [
    {
      "name": "Channel Name (e.g. 3Blue1Brown, Khan Academy, MIT OpenCourseWare, CrashCourse, freeCodeCamp, Physics Wallah, Unacademy, etc.)",
      "subscribersEstimate": "e.g. 6.2M+ subscribers",
      "specialty": "Why it is among the most viewed and respected channels for this field",
      "recommendedPlaylists": "Name of best playlist",
      "directSearchQuery": "Exact YouTube search query"
    }
  ],
  "videoModules": [
    {
      "moduleTitle": "Module 1: Intuition & Visual Foundations",
      "keyConceptsCovered": ["Concept 1", "Concept 2"],
      "searchQuery": "YouTube search query"
    },
    {
      "moduleTitle": "Module 2: Advanced Problem Solving & Exam PYQ Walkthrough",
      "keyConceptsCovered": ["PYQ strategies", "Speed shortcuts"],
      "searchQuery": "YouTube search query"
    }
  ]
}`;

    if (!ai) {
      return res.json({
        topChannels: [
          {
            name: 'Khan Academy',
            subscribersEstimate: '8.4M+ subscribers',
            specialty: 'Clear chalkboard visual lectures with master pedagogy and practice sets.',
            recommendedPlaylists: `${topic || subject} Complete Course`,
            directSearchQuery: `${topic || subject} Khan Academy complete playlist`,
          },
          {
            name: '3Blue1Brown',
            subscribersEstimate: '6.1M+ subscribers',
            specialty: 'The gold standard in animated visual intuition and conceptual elegance.',
            recommendedPlaylists: `Essence of ${subject || 'Mathematics'}`,
            directSearchQuery: `3Blue1Brown ${topic || subject}`,
          },
          {
            name: 'CrashCourse',
            subscribersEstimate: '15.4M+ subscribers',
            specialty: 'High-energy, fast-paced conceptual review with animated diagrams.',
            recommendedPlaylists: `${subject || 'Science'} Crash Course`,
            directSearchQuery: `CrashCourse ${topic || subject}`,
          },
          {
            name: 'MIT OpenCourseWare',
            subscribersEstimate: '5.2M+ subscribers',
            specialty: 'Full university-level lectures by world-renowned professors with lecture notes.',
            recommendedPlaylists: `MIT ${subject || 'Physics'} Lectures`,
            directSearchQuery: `MIT OpenCourseWare ${topic || subject}`,
          },
        ],
        videoModules: [
          {
            moduleTitle: 'Module 1: Visual Intuition & First Principles',
            keyConceptsCovered: ['Historical context', 'First principles derivation'],
            searchQuery: `${topic || subject} visual intuition lecture`,
          },
          {
            moduleTitle: 'Module 2: Competitive Exam PYQ Solved Walkthrough',
            keyConceptsCovered: ['Previous year questions', 'Speed tactics'],
            searchQuery: `${topic || subject} previous year questions solved ${targetExam || ''}`,
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanJson(response.text || '{}');
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error('Error fetching lecture recommendations:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch recommendations' });
  }
});

// Setup Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EDUMATE] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
