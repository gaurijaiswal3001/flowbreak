import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint to explain test results and suggest HTML fixes
app.post('/api/explain', async (req, res) => {
  try {
    const { formHtml, summary, failedTests, passedTests } = req.body;

    if (!formHtml || !summary) {
      return res.status(400).json({ error: 'Missing formHtml or test results in request.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check your environment variables.',
      });
    }

    const prompt = `
You are the witty, senior HTML standards expert in FlowBreak — a playful HTML form testing playground.
The user tested an HTML form using real browser-native validation rules. Here are the results:

FORM HTML MARKUP:
\`\`\`html
${formHtml.slice(0, 4000)}
\`\`\`

TEST SUMMARY:
- Total tests run: ${summary.total}
- Survived (Passed): ${summary.passed}
- Busted (Failed): ${summary.failed}

FAILED TESTS (${failedTests?.length || 0}):
${JSON.stringify(failedTests || [], null, 2)}

PASSED TESTS (${passedTests?.length || 0}):
${JSON.stringify((passedTests || []).slice(0, 10), null, 2)}

INSTRUCTIONS:
1. Explain the failures in crisp, friendly, plain developer language.
2. For each failed issue, explain exactly WHAT failed, WHY the browser behaved that way or accepted invalid data, and provide the exact corrected HTML attribute/tag.
3. Suggest a complete, clean, repaired HTML snippet for the affected fields.
4. Keep the tone playful, encouraging, and developer-centric (like a helpful peer code review).
5. Do NOT invent fake failures that were not in the failed tests list. Focus directly on the actual findings.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description: 'A punchy, playful 2-3 sentence overview of the form test outcome.',
            },
            issues: {
              type: Type.ARRAY,
              description: 'Explanations and fixes for each broken test.',
              items: {
                type: Type.OBJECT,
                properties: {
                  fieldName: { type: Type.STRING, description: 'Field or element name/ID' },
                  testCase: { type: Type.STRING, description: 'Name of the broken test case' },
                  diagnosis: { type: Type.STRING, description: 'Why this failed in simple terms' },
                  fixExplanation: { type: Type.STRING, description: 'How to fix it with standard HTML attributes' },
                  codeFix: { type: Type.STRING, description: 'Exact replacement HTML code snippet for this element' },
                },
                required: ['fieldName', 'testCase', 'diagnosis', 'fixExplanation', 'codeFix'],
              },
            },
            repairedSnippet: {
              type: Type.STRING,
              description: 'A complete, clean, repaired version of the form markup with all fixes applied.',
            },
            proTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 quick bullet tips on HTML5 native validation.',
            },
          },
          required: ['overview', 'issues', 'repairedSnippet', 'proTips'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini.');
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error generating explanation from Gemini:', err);
    console.error('Error stack:', err?.stack);
    
    return res.status(500).json({
      error: err?.message || 'Failed to generate explanation. Please try again.',
    });
  }
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 FlowBreak playground running on http://0.0.0.0:${port}`);
  });
}

startServer();
