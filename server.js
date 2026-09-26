import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "10mb" }));
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
function extractArxivId(input) {
  const match = input.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arXiv:)([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i);
  return match ? match[1] : null;
}
async function fetchArxivMetadata(arxivId) {
  try {
    const cleanId = arxivId.replace(/v[0-9]+$/, "");
    const url = `https://export.arxiv.org/api/query?id_list=${cleanId}&max_results=1`;
    const res = await fetch(url, { headers: { "User-Agent": "ScholarAgent/1.0" } });
    if (!res.ok) return null;
    const text = await res.text();
    const titleMatch = text.match(/<title>([^<]+)<\/title>/g);
    const title = titleMatch && titleMatch.length > 1 ? titleMatch[1].replace(/<\/?title>/g, "").replace(/\s+/g, " ").trim() : null;
    const summaryMatch = text.match(/<summary>([\s\S]*?)<\/summary>/);
    const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, " ").trim() : null;
    const authorMatches = [...text.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)];
    const authors = authorMatches.map((m) => m[1]);
    const publishedMatch = text.match(/<published>([^<]+)<\/published>/);
    const published = publishedMatch ? publishedMatch[1].slice(0, 10) : null;
    if (title && summary) {
      return { title, summary, authors, published, arxivId };
    }
  } catch (err) {
    console.warn("Failed to fetch arXiv metadata via API:", err);
  }
  return null;
}
const PRESET_PAPERS = [
  {
    id: "mamba",
    title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
    arxivId: "2312.00752",
    url: "https://arxiv.org/abs/2312.00752",
    year: "2023",
    venue: "ICLR 2024",
    category: "Deep Learning & Architecture",
    authors: ["Albert Gu", "Tri Dao"],
    tag: "Selective SSM"
  },
  {
    id: "transformer",
    title: "Attention Is All You Need",
    arxivId: "1706.03762",
    url: "https://arxiv.org/abs/1706.03762",
    year: "2017",
    venue: "NeurIPS 2017",
    category: "Foundational ML",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "et al."],
    tag: "Self-Attention"
  },
  {
    id: "dpo",
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    arxivId: "2305.18290",
    url: "https://arxiv.org/abs/2305.18290",
    year: "2023",
    venue: "NeurIPS 2023",
    category: "RLHF & Alignment",
    authors: ["Rafael Rafailov", "Archit Sharma", "Eric Mitchell", "Stefano Ermon", "et al."],
    tag: "Alignment"
  },
  {
    id: "lora",
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    arxivId: "2106.09685",
    url: "https://arxiv.org/abs/2106.09685",
    year: "2021",
    venue: "ICLR 2022",
    category: "Parameter-Efficient Fine-Tuning",
    authors: ["Edward J. Hu", "Yelong Shen", "Phillip Wallis", "Zeyuan Allen-Zhu", "et al."],
    tag: "PEFT"
  },
  {
    id: "flashattention",
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    arxivId: "2205.14135",
    url: "https://arxiv.org/abs/2205.14135",
    year: "2022",
    venue: "NeurIPS 2022",
    category: "Systems & Hardware-Aware ML",
    authors: ["Tri Dao", "Daniel Y. Fu", "Stefano Ermon", "Atri Rudra", "Christopher R\xE9"],
    tag: "GPU Kernel / IO-Aware"
  }
];
app.get("/api/presets", (_req, res) => {
  res.json({ presets: PRESET_PAPERS });
});
app.post("/api/analyze-paper", async (req, res) => {
  const startTime = Date.now();
  const { input, targetFocus } = req.body;
  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Please provide a valid paper URL, arXiv ID, or title/abstract." });
  }
  const trimmedInput = input.trim();
  const arxivId = extractArxivId(trimmedInput);
  let arxivMeta = null;
  if (arxivId) {
    arxivMeta = await fetchArxivMetadata(arxivId);
  }
  try {
    const systemPrompt = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis stays well under 25,000 tokens.
- If a paper is too long to ingest entirely, use search context to look up summaries, abstracts, and open-source implementations of the paper's title to gather context efficiently.

When analyzing a research paper, you must execute these steps with extreme precision:

1. CORE CONCEPT EXTRACTION
Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.

2. ARCHITECTURAL FLOWCHART (Mermaid.js)
Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper.
CRITICAL FORMATTING FOR MERMAID:
- Start with "graph TD"
- Do NOT use Markdown code blocks (\`\`\`) inside the Mermaid string itself.
- Ensure node names and labels do not contain illegal characters like unescaped parentheses, quotes, or braces that break Mermaid rendering. Use bracket syntax like: A["Input Data: Tokens [B, L, D]"] --> B["Layer 1: Normalization"]
- Output as a clear text segment labeled [FLOWCHART].

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project. For each idea provide:
- The expected contribution (e.g. "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment").
- The targeted performance metric (e.g. latency reduction, accuracy, trade-off).
- The recommended tech stack (e.g. PyTorch, ONNX Runtime).
Include estimated completion time (in weeks) and a ready-to-use resume bullet point formatted in STAR/impact-driven style.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "paper": {
    "title": string,
    "authors": string[],
    "year": string,
    "arxivId": string or null,
    "venue": string,
    "githubReference": string or null,
    "url": string
  },
  "coreConcept": {
    "problemStatement": string,
    "primaryMethodology": string,
    "mathematicalBreakthroughs": string,
    "fullSummary": string, // Under 300 words total synthesis combining all three aspects in plain, accessible language
    "wordCount": number
  },
  "flowchart": {
    "mermaidCode": string, // Clean Mermaid 'graph TD ...' code WITHOUT markdown backticks, syntactically valid
    "labeledSegment": string, // Text starting with [FLOWCHART]\\n\\ngraph TD...
    "nodesSummary": [
      { "id": string, "name": string, "role": string }
    ]
  },
  "studentOpportunities": [
    {
      "id": 1,
      "title": string,
      "difficulty": "Intermediate" | "Advanced" | "Beginner",
      "expectedContribution": string,
      "targetedPerformanceMetric": string,
      "recommendedTechStack": string[],
      "estimatedWeeks": number,
      "resumeBullet": string,
      "implementationPlan": string[],
      "engineeringTakeaway": string
    }
  ],
  "rawOutput": string // Complete human-readable markdown following the 3 sections exactly, with the [FLOWCHART] label
}`;
    let userPrompt = `Analyze the following computer science research paper:
Input provided by user: "${trimmedInput}"
`;
    if (arxivMeta) {
      userPrompt += `
Pre-extracted arXiv Metadata:
- Title: ${arxivMeta.title}
- Authors: ${arxivMeta.authors.join(", ")}
- Date: ${arxivMeta.published}
- ArXiv ID: ${arxivMeta.arxivId}
- Abstract: ${arxivMeta.summary}
`;
    }
    if (targetFocus) {
      userPrompt += `
Target student career/technical focus: ${targetFocus}
`;
    }
    userPrompt += `
Execute:
1. CORE CONCEPT EXTRACTION (<300 words, plain accessible language)
2. ARCHITECTURAL FLOWCHART (labeled [FLOWCHART], graph TD, syntactically flawless Mermaid)
3. FUTURE WORK & INTERNSHIP OPPORTUNITIES (3 concrete projects with Expected Contribution, Targeted Performance Metric, Recommended Tech Stack, etc.)

Prioritize token efficiency under 25,000 tokens. Output pure JSON matching the specified schema.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    const executionTimeMs = Date.now() - startTime;
    const responseText = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse model output as JSON");
      }
    }
    const promptTokens = response.usageMetadata?.promptTokenCount || Math.round(userPrompt.length / 4);
    const candidateTokens = response.usageMetadata?.candidatesTokenCount || Math.round(responseText.length / 4);
    const totalTokens = response.usageMetadata?.totalTokenCount || promptTokens + candidateTokens;
    const tokenBudget = 25e3;
    const tokenBudgetRemaining = Math.max(0, tokenBudget - totalTokens);
    if (parsedData.flowchart?.mermaidCode) {
      parsedData.flowchart.mermaidCode = parsedData.flowchart.mermaidCode.replace(/```mermaid/gi, "").replace(/```/g, "").trim();
    }
    if (!parsedData.flowchart?.labeledSegment && parsedData.flowchart?.mermaidCode) {
      parsedData.flowchart.labeledSegment = `[FLOWCHART]

${parsedData.flowchart.mermaidCode}`;
    }
    const payload = {
      ...parsedData,
      tokenStats: {
        promptTokens,
        candidateTokens,
        totalTokens,
        tokenBudget,
        tokenBudgetRemaining,
        efficiencyRating: totalTokens < 4e3 ? "Optimal (Ultra-Efficient)" : totalTokens < 12e3 ? "Good" : "Acceptable",
        executionTimeMs
      }
    };
    res.json(payload);
  } catch (err) {
    console.error("Error analyzing paper:", err);
    res.status(500).json({
      error: "Paper analysis failed",
      details: err?.message || "Internal server error while executing research agent"
    });
  }
});
app.get("/api/arxiv-lookup", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Query parameter q is required" });
  const arxivId = extractArxivId(q) || q.trim();
  const meta = await fetchArxivMetadata(arxivId);
  if (!meta) {
    return res.status(404).json({ error: "Could not fetch arXiv paper metadata" });
  }
  res.json({ meta });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Research Agent server running on port ${PORT}`);
  });
}
startServer();
