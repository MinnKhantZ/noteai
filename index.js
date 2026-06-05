require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment before trying again." },
});

const MAX_CONTENT_LENGTH = 10000;

function validateContent(req, res) {
  const { content } = req.body;
  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Note content is required." });
    return false;
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({ error: `Note content must be under ${MAX_CONTENT_LENGTH} characters.` });
    return false;
  }
  return true;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const PROMPTS = {
  suggestions: (content) =>
    `Rewrite the following note in 3 different ways to improve grammar, clarity, and style. Return only the 3 rewritten versions, each on its own line, no numbering, no extra text, no labels.\n\nNote:\n${content}`,
  summarize: (content) =>
    `Summarize the following note in 2-3 concise sentences. Return only the summary.\n\nNote:\n${content}`,
  "auto-title": (content) =>
    `Generate a short, descriptive title (5 words or fewer) for the following note. Return only the title, nothing else.\n\nNote:\n${content}`,
  continue: (content) =>
    `Continue writing the following note naturally, adding 2-3 sentences that fit the tone and topic. Return only the continuation text, no explanations.\n\nNote:\n${content}`,
  "fix-grammar": (content) =>
    `Fix all grammar, spelling, and punctuation errors in the following note. Return only the corrected text with no explanations.\n\nNote:\n${content}`,
};

app.get("/", (req, res) => {
  res.status(200).end();
});

app.post("/ai", aiLimiter, async (req, res) => {
  const { action } = req.body;
  const validActions = Object.keys(PROMPTS);

  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}.` });
  }

  if (!validateContent(req, res)) return;

  const content = stripHtml(req.body.content);

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: PROMPTS[action](content) }],
    });
    const text = result.choices[0].message.content.trim();

    if (action === "suggestions") {
      let suggestions = text.split("\n").map((s) => s.trim()).filter(Boolean);
      if (suggestions.length < 2) {
        suggestions = text.split(".").map((s) => s.trim()).filter(Boolean);
      }
      return res.json({ action, result: suggestions.slice(0, 3) });
    }

    res.json({ action, result: text });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "AI service is unavailable. Please try again later." });
  }
});

// Legacy endpoint — kept for backward compatibility
app.post("/suggestions", aiLimiter, async (req, res) => {
  if (!validateContent(req, res)) return;
  const content = stripHtml(req.body.content);
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: PROMPTS.suggestions(content) }],
    });
    const suggestions = result.choices[0].message.content.trim()
      .split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    res.json(suggestions);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "AI service is unavailable. Please try again later." });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${listener.address().port}`);
});
