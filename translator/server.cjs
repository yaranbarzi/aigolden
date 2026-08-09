var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
function getAiClient(apiKeyOverride) {
  const key = apiKeyOverride?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API Key is missing. Please enter your Gemini API Key in the field above or configure process.env.GEMINI_API_KEY.");
  }
  return new import_genai.GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/validate-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!keyToTest) {
      return res.status(400).json({ valid: false, error: "No API Key provided." });
    }
    const ai = getAiClient(keyToTest);
    await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "ping",
      config: {
        maxOutputTokens: 1
      }
    });
    return res.json({ valid: true });
  } catch (error) {
    console.error("API Key Validation Error:", error?.message || error);
    return res.status(400).json({
      valid: false,
      error: error?.message || "Invalid API Key."
    });
  }
});
app.post("/api/verify-pro-password", (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.VITE_PRO_PASSWORD || process.env.PRO_PASSWORD || "aigoldenyt";
  if (typeof password === "string" && password.trim() === expectedPassword.trim()) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Incorrect password" });
});
app.post("/api/translate", async (req, res) => {
  try {
    const {
      subtitles,
      sourceLanguage,
      targetLanguage,
      translationStyle,
      glossary,
      apiKey
    } = req.body;
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
    let subtitlesMap = {};
    if (Array.isArray(subtitles)) {
      subtitles.forEach((s) => {
        if (s && s.id !== void 0 && s.text !== void 0) {
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
    const rtlLanguages = ["persian", "farsi", "arabic", "hebrew", "urdu", "fa", "ar", "he", "ur"];
    const isTargetRtl = targetLanguage && rtlLanguages.some(
      (lang) => targetLanguage.toLowerCase().includes(lang)
    );
    const lrmChar = String.fromCharCode(8206);
    const getSystemInstruction = (style, tgtLang, gloss) => {
      let glossaryText = "";
      if (gloss && gloss.length > 0) {
        const entries = gloss.map((e) => `  "${e.source}" MUST become "${e.target}"`).join("\n");
        glossaryText = `

CRITICAL GLOSSARY RULES - OBEY EXACTLY:
${entries}

If a glossary term appears in the source, use EXACTLY the target above. Do NOT translate it differently.`;
      }
      let styleRules = "";
      const selectedStyleLower = (style || "").toLowerCase();
      if (selectedStyleLower.includes("conversational") || selectedStyleLower.includes("casual") || selectedStyleLower.includes("\u0639\u0627\u0645\u06CC\u0646\u0647") || selectedStyleLower.includes("\u0645\u06A9\u0627\u0644\u0645\u0647")) {
        styleRules = `

CINEMATIC CONVERSATIONAL & COLLOQUIAL STYLE RULES (FOR MOVIES & TV SHOWS):
You are translating subtitles for a movie or TV series into natural, modern spoken Persian (\u0644\u062D\u0646 \u0631\u0648\u0627\u0646\u060C \u0639\u0627\u0645\u06CC\u0627\u0646\u0647 \u0648 \u06AF\u0641\u062A\u0627\u0631\u06CC \u0633\u06CC\u0646\u0645\u0627\u06CC\u06CC/\u062F\u0648\u0628\u0644\u0647).
1. SPOKEN VERBS & NATURAL CONTRACTIONS:
   - Use colloquial spoken verbs and contractions instead of stiff written/bookish Persian.
   - Examples:
     * "\u06A9\u0641\u0634\u0627\u062A\u0648 \u062F\u0631\u0622\u0631" / "\u06A9\u0641\u0634\u0627\u062A\u0648 \u062F\u0631\u0627\u0631" (NEVER "\u06A9\u0641\u0634\u200C\u0647\u0627\u06CC\u062A \u0631\u0627 \u062F\u0631\u0622\u0648\u0631")
     * "\u062F\u0627\u0631\u06CC \u0686\u06CC\u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u061F" (NEVER "\u062F\u0627\u0631\u06CC\u062F \u0686\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F\u061F")
     * "\u0645\u06CC\u200C\u062E\u0648\u0627\u0645 \u0628\u0631\u0645" (NEVER "\u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u0645 \u0628\u0631\u0648\u0645")
     * "\u0628\u0647\u0645 \u0628\u06AF\u0648" (NEVER "\u0628\u0647 \u0645\u0646 \u0628\u06AF\u0648")
     * "\u0686\u06CC \u0634\u062F\u0647\u061F" (NEVER "\u0686\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A\u061F")
     * "\u0628\u0647\u0634 \u06AF\u0641\u062A\u0645" (NEVER "\u0628\u0647 \u0627\u0648 \u06AF\u0641\u062A\u0645")
2. CINEMATIC IDIOMS & EXPRESSIVE INTERJECTIONS:
   - Translate expressions naturally according to film context:
     * "Come on" -> "\u06CC\u0627\u0644\u0627", "\u0628\u06CC\u200C\u062E\u06CC\u0627\u0644", "\u0632\u0648\u062F \u0628\u0627\u0634", "\u0627\u062F\u0627\u0645\u0647 \u0628\u062F\u0647", "\u062F\u0633\u062A \u0628\u0631\u062F\u0627\u0631" (NEVER literal religious translation like "\u06CC\u0627 \u0627\u0644\u0644\u0647")
     * "Oh my God" / "My God" -> "\u0648\u0627\u06CC \u062E\u062F\u0627", "\u062E\u062F\u0627\u06CC \u0645\u0646", "\u06CC\u0627 \u062E\u062F\u0627"
     * "What the hell" -> "\u0627\u06CC\u0646 \u062F\u06CC\u06AF\u0647 \u0686\u0647 \u0635\u06CC\u063A\u0647\u200C\u0627\u06CC\u0647\u061F", "\u0686\u06CC \u062F\u0627\u0631\u06CC \u0645\u06CC\u200C\u06AF\u06CC\u061F", "\u0686\u0647 \u0645\u0631\u06AF\u06CC\u062A\u0647\u061F"
     * "Shut up" -> "\u062E\u0641\u0647 \u0634\u0648", "\u062D\u0631\u0641 \u0646\u0632\u0646"
     * "No way" -> "\u0627\u0645\u06A9\u0627\u0646 \u0646\u062F\u0627\u0631\u0647", "\u0639\u0645\u0631\u0627\u064B"
     * "Look" / "Listen" -> "\u0628\u0628\u06CC\u0646", "\u06AF\u0648\u0634 \u06A9\u0646"
3. ACCURATE UNFILTERED TRANSLATION (18+ & SLANG):
   - Translate all profanity, adult expressions, and slang directly and naturally into authentic colloquial Persian without moralizing, softening, or censoring.
   - Preserve the exact tone, intensity, and emotion of the movie dialogue.`;
      }
      let rtlInstruction = "";
      if (isTargetRtl) {
        rtlInstruction = `

CRITICAL FORMATTING RULE (RTL/LTR Mixed Text Alignment Fix):
Since the target language is a Right-to-Left (RTL) language:
- English technical terms, acronyms, or names that must remain in English (including glossary terms that specify keeping them in English, e.g., "MACD" translated/kept as "MACD") MUST remain in Latin characters.
- CRITICAL FORMATTING RULE: If an English technical term or acronym (e.g., ICT, RTM, MACD) remains untranslated inside a Right-to-Left (RTL) Persian sentence, you MUST strictly wrap it by inserting a literal invisible Unicode Left-to-Right Mark character (\\u200E) immediately before and right after that English word. Never use HTML tags like <bdo> or <span>.
- The Unicode LRM character to insert is the actual invisible character (Unicode point 200E). Do NOT write literal escape backslash characters like "\\u200E" or "\\u200e" in the JSON text; instead, output the literal, invisible Unicode LRM character directly in your string (it has been parsed in your system instruction as '${lrmChar}').
- Example: If the target Persian translation is "\u0633\u06CC\u06AF\u0646\u0627\u0644 MACD \u0635\u0627\u062F\u0631 \u0634\u062F", you MUST output "\u0633\u06CC\u06AF\u0646\u0627\u0644 ${lrmChar}MACD${lrmChar} \u0635\u0627\u062F\u0631 \u0634\u062F" where the LRM character (invisible) is placed directly on both sides of the English term "MACD".
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
          ]
        }
      });
    } catch (primaryErr) {
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
          ]
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
    } catch (parseErr) {
      throw new Error(`Failed to parse Gemini API response as JSON. Raw response: ${trimmedResponse.slice(0, 200)}. Error: ${parseErr.message}`);
    }
    console.log("DEBUG BACKEND: translation response received successfully.");
    return res.json({ translations: data });
  } catch (error) {
    console.error("Translation error details:", error);
    res.status(503).json({
      error: error.message || "An unexpected error occurred during translation."
    });
  }
});
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
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
//# sourceMappingURL=server.cjs.map
