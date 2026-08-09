import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json({ limit: "50mb" }));

// Initializer for Google GenAI client
function getAiClient(apiKeyOverride?: string): GoogleGenAI {
  const key = apiKeyOverride?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API Key is missing. Please enter your Gemini API Key in the field above or configure process.env.GEMINI_API_KEY.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Validate API Key endpoint
app.post("/api/validate-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!keyToTest) {
      return res.status(400).json({ valid: false, error: "No API Key provided." });
    }

    const ai = getAiClient(keyToTest);
    // Simple fast test request
    await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "ping",
      config: {
        maxOutputTokens: 1,
      }
    });

    return res.json({ valid: true });
  } catch (error: any) {
    console.error("API Key Validation Error:", error?.message || error);
    return res.status(400).json({
      valid: false,
      error: error?.message || "Invalid API Key."
    });
  }
});

// Endpoint to verify Pro password securely against environment variable
app.post("/api/verify-pro-password", (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.VITE_PRO_PASSWORD || process.env.PRO_PASSWORD || "aigoldenyt";
  if (typeof password === "string" && password.trim() === expectedPassword.trim()) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Incorrect password" });
});

// Translation endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const {
      subtitles,
      sourceLanguage,
      targetLanguage,
      translationStyle,
      glossary,
      apiKey,
    } = req.body;

    // Check and log glossary status explicitly
    if (!glossary) {
      console.warn("DEBUG BACKEND: Glossary is UNDEFINED in request payload.");
    } else if (!Array.isArray(glossary)) {
      console.warn("DEBUG BACKEND: Glossary is received but is NOT an array.", typeof glossary);
    } else {
      console.log(`DEBUG BACKEND: Glossary loaded successfully with ${glossary.length} entries.`);
      console.log("DEBUG BACKEND: Glossary payload details =", JSON.stringify(glossary));
    }

    if (!subtitles || typeof subtitles !== "object") {
      return res.status(400).json({ error: "Invalid subtitles list format. Must be a JSON object or array." });
    }

    // Convert to flat object representation if it's an array
    let subtitlesMap: Record<string, string> = {};
    if (Array.isArray(subtitles)) {
      subtitles.forEach((s: any) => {
        if (s && s.id !== undefined && s.text !== undefined) {
          subtitlesMap[String(s.id)] = s.text;
        }
      });
    } else {
      subtitlesMap = subtitles;
    }

    const subtitleKeys = Object.keys(subtitlesMap);
    console.log("DEBUG BACKEND: subtitles count =", subtitleKeys.length);

    if (subtitleKeys.length === 0) {
      return res.json({ translations: {} });
    }

    const ai = getAiClient(apiKey);

    // Determine if target language is RTL (Persian, Arabic, Hebrew, or Urdu)
    const rtlLanguages = ["persian", "farsi", "arabic", "hebrew", "urdu", "fa", "ar", "he", "ur"];
    const isTargetRtl = targetLanguage && rtlLanguages.some(lang => 
      targetLanguage.toLowerCase().includes(lang)
    );

    // Evaluate literal Unicode LRM character to insert directly to avoid JSON serialization bugs
    const lrmChar = String.fromCharCode(0x200E);

    // exact helper matching user instruction structure
    const getSystemInstruction = (style: string, tgtLang: string, gloss: any[]) => {
      let glossaryText = "";
      if (gloss && gloss.length > 0) {
        const entries = gloss.map(e => `  "${e.source}" MUST become "${e.target}"`).join("\n");
        glossaryText = `\n\nCRITICAL GLOSSARY RULES - OBEY EXACTLY:\n${entries}\n\nIf a glossary term appears in the source, use EXACTLY the target above. Do NOT translate it differently.`;
      }

      let styleRules = "";
      const selectedStyleLower = (style || "").toLowerCase();
      if (selectedStyleLower.includes("conversational") || selectedStyleLower.includes("casual") || selectedStyleLower.includes("عامینه") || selectedStyleLower.includes("مکالمه")) {
        styleRules = `\n\nCINEMATIC CONVERSATIONAL & COLLOQUIAL STYLE RULES (FOR MOVIES & TV SHOWS):
You are translating subtitles for a movie or TV series into natural, modern spoken Persian (لحن روان، عامیانه و گفتاری سینمایی/دوبله).
1. SPOKEN VERBS & NATURAL CONTRACTIONS:
   - Use colloquial spoken verbs and contractions instead of stiff written/bookish Persian.
   - Examples:
     * "کفشاتو درآر" / "کفشاتو درار" (NEVER "کفش‌هایت را درآور")
     * "داری چیکار می‌کنی؟" (NEVER "دارید چه کار می‌کنید؟")
     * "می‌خوام برم" (NEVER "می‌خواهم بروم")
     * "بهم بگو" (NEVER "به من بگو")
     * "چی شده؟" (NEVER "چه شده است؟")
     * "بهش گفتم" (NEVER "به او گفتم")
2. CINEMATIC IDIOMS & EXPRESSIVE INTERJECTIONS:
   - Translate expressions naturally according to film context:
     * "Come on" -> "یالا", "بی‌خیال", "زود باش", "ادامه بده", "دست بردار" (NEVER literal religious translation like "یا الله")
     * "Oh my God" / "My God" -> "وای خدا", "خدای من", "یا خدا"
     * "What the hell" -> "این دیگه چه صیغه‌ایه؟", "چی داری می‌گی؟", "چه مرگیته؟"
     * "Shut up" -> "خفه شو", "حرف نزن"
     * "No way" -> "امکان نداره", "عمراً"
     * "Look" / "Listen" -> "ببین", "گوش کن"
3. ACCURATE UNFILTERED TRANSLATION (18+ & SLANG):
   - Translate all profanity, adult expressions, and slang directly and naturally into authentic colloquial Persian without moralizing, softening, or censoring.
   - Preserve the exact tone, intensity, and emotion of the movie dialogue.`;
      }

      let rtlInstruction = "";
      if (isTargetRtl) {
        rtlInstruction = `\n\nCRITICAL FORMATTING RULE (RTL/LTR Mixed Text Alignment Fix):
Since the target language is a Right-to-Left (RTL) language:
- English technical terms, acronyms, or names that must remain in English (including glossary terms that specify keeping them in English, e.g., "MACD" translated/kept as "MACD") MUST remain in Latin characters.
- CRITICAL FORMATTING RULE: If an English technical term or acronym (e.g., ICT, RTM, MACD) remains untranslated inside a Right-to-Left (RTL) Persian sentence, you MUST strictly wrap it by inserting a literal invisible Unicode Left-to-Right Mark character (\\u200E) immediately before and right after that English word. Never use HTML tags like <bdo> or <span>.
- The Unicode LRM character to insert is the actual invisible character (Unicode point 200E). Do NOT write literal escape backslash characters like "\\u200E" or "\\u200e" in the JSON text; instead, output the literal, invisible Unicode LRM character directly in your string (it has been parsed in your system instruction as '${lrmChar}').
- Example: If the target Persian translation is "سیگنال MACD صادر شد", you MUST output "سیگنال ${lrmChar}MACD${lrmChar} صادر شد" where the LRM character (invisible) is placed directly on both sides of the English term "MACD".
- Absolutely NEVER output multiple consecutive or duplicate LRM characters.`;
      }

      return `You are an expert movie and TV subtitle translator.
Translate the values of the received JSON object.
Source Language: Auto-Detect
Target Language: ${tgtLang}
Translation Style Selected: ${style || "Conversational/Casual"}${styleRules}${glossaryText}${rtlInstruction}
Return ONLY valid JSON with same keys. No extra text.`;
    };

    const systemInstruction = getSystemInstruction(translationStyle, targetLanguage, glossary);
    console.log("DEBUG BACKEND: Constructed systemInstruction:\n", systemInstruction);

    // Select model from payload or default to gemini-3.5-flash-lite with fallback
    const primaryModel = req.body.model || "gemini-3.5-flash-lite";
    const fallbackModel = primaryModel === "gemini-3.5-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-3.5-flash-lite";

    const jsonPayload = JSON.stringify(subtitlesMap, null, 2);
    const contents = `JSON to translate:
${jsonPayload}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: "application/json",
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ] as any
        }
      });
    } catch (primaryErr: any) {
      console.warn(`Primary model ${primaryModel} failed (${primaryErr.message}). Attempting failover to ${fallbackModel}...`);
      response = await ai.models.generateContent({
        model: fallbackModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: "application/json",
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ] as any
        }
      });
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from the Gemini translation model.");
    }

    const trimmedResponse = responseText.trim();
    if (trimmedResponse.startsWith("<")) {
      throw new Error(`Gemini API returned an HTML error page instead of subtitle translations. Raw preview: ${trimmedResponse.slice(0, 150)}`);
    }

    let data;
    try {
      data = JSON.parse(trimmedResponse);
    } catch (parseErr: any) {
      throw new Error(`Failed to parse Gemini API response as JSON. Raw response: ${trimmedResponse.slice(0, 200)}. Error: ${parseErr.message}`);
    }

    // Log successfully translated items and verify glossary matching
    console.log("DEBUG BACKEND: translation response received successfully.");
    return res.json({ translations: data });

  } catch (error: any) {
    console.error("Translation error details:", error);
    // Propagate error message to frontend
    res.status(503).json({
      error: error.message || "An unexpected error occurred during translation."
    });
  }
});

// Setup Vite or Serve Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
