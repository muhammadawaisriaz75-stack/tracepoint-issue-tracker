const CATEGORIES = ["bug", "feature", "improvement", "docs", "support"];
const PRIORITIES = ["low", "medium", "high"];

export class AiAssistError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.statusCode = statusCode;
  }
}

const SYSTEM_PROMPT = `You triage software issues for an issue tracker.
Return JSON only with this shape:
{"summary":"1-2 sentence recap","priority":"low|medium|high","category":"bug|feature|improvement|docs|support","suggestions":["next step","next step"]}
Rules:
- priority high: production outage, crash, security, data loss, payments, login broken
- priority low: typo, docs, cosmetic, nice-to-have
- category must be one of the enum values
- suggestions: 3 to 5 concrete next actions for the person who will work this issue (reproduce, logs, tests, implementation). No markdown. No numbering prefixes.`;

const clip = (text, max) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
};

const parseModelJson = (raw) => {
  const stripped = String(raw || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new AiAssistError("AI returned an invalid response. Try again.");
  }

  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
        .map((item) => clip(item, 220))
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    summary: clip(parsed.summary, 220) || "Issue needs triage.",
    priority: PRIORITIES.includes(parsed.priority) ? parsed.priority : "medium",
    category: CATEGORIES.includes(parsed.category) ? parsed.category : "bug",
    suggestions,
  };
};

const timedFetch = async (url, options, ms = 45000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AiAssistError("AI request timed out. Try again.", 504);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const chatCompletions = async ({ url, key, model, title, description }) => {
  const response = await timedFetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${description || "(none)"}`,
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || `AI request failed (${response.status})`;
    throw new AiAssistError(detail);
  }

  return parseModelJson(data?.choices?.[0]?.message?.content);
};

const triageWithGemini = async ({ key, model, title, description }) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await timedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nTitle: ${title}\nDescription: ${description || "(none)"}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || `AI request failed (${response.status})`;
    throw new AiAssistError(detail);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "";
  return parseModelJson(text);
};

const resolveProvider = () => {
  if (process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      run: ({ title, description }) =>
        chatCompletions({
          url: "https://api.openai.com/v1/chat/completions",
          key: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          title,
          description,
        }),
    };
  }

  if (process.env.GROQ_API_KEY) {
    return {
      name: "groq",
      run: ({ title, description }) =>
        chatCompletions({
          url: "https://api.groq.com/openai/v1/chat/completions",
          key: process.env.GROQ_API_KEY,
          model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
          title,
          description,
        }),
    };
  }

  if (process.env.GEMINI_API_KEY) {
    return {
      name: "gemini",
      run: ({ title, description }) =>
        triageWithGemini({
          key: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
          title,
          description,
        }),
    };
  }

  return null;
};

export const suggestIssueTriage = async ({ title, description }) => {
  const provider = resolveProvider();

  if (!provider) {
    throw new AiAssistError(
      "AI is not configured. Add GROQ_API_KEY (free at console.groq.com), GEMINI_API_KEY (free at aistudio.google.com/apikey), or OPENAI_API_KEY to backend/.env, then restart the API.",
      503
    );
  }

  const result = await provider.run({ title, description });
  return { ...result, source: provider.name };
};
