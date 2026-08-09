// functions/api/[[path]].ts

interface Env {
  GEMINI_API_KEY?: string;
  VITE_PRO_PASSWORD?: string;
  PRO_PASSWORD?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // تنظیم هدرهای CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Endpoint: Health Check
    if (path === "/api/health" && request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "ok", time: new Date().toISOString() }),
        { headers: corsHeaders }
      );
    }

    // 2. Endpoint: Validate API Key
    if (path === "/api/validate-key" && request.method === "POST") {
      const body = await request.json() as any;
      const keyToTest = body?.apiKey?.trim() || env.GEMINI_API_KEY;

      if (!keyToTest) {
        return new Response(
          JSON.stringify({ valid: false, error: "No API Key provided." }),
          { status: 400, headers: corsHeaders }
        );
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToTest}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }],
            generationConfig: { maxOutputTokens: 1 },
          }),
        }
      );

      if (geminiRes.ok) {
        return new Response(JSON.stringify({ valid: true }), { headers: corsHeaders });
      } else {
        const errData = await geminiRes.json() as any;
        return new Response(
          JSON.stringify({ valid: false, error: errData?.error?.message || "Invalid API Key" }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // 3. Endpoint: Verify Pro Password
    if (path === "/api/verify-pro-password" && request.method === "POST") {
      const body = await request.json() as any;
      const password = body?.password;
      const expectedPassword = env.VITE_PRO_PASSWORD || env.PRO_PASSWORD;

      if (typeof password === "string" && password.trim() === expectedPassword.trim()) {
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      return new Response(
        JSON.stringify({ success: false, error: "Incorrect password" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 4. Endpoint: Translate
    if (path === "/api/translate" && request.method === "POST") {
      const body = await request.json() as any;
      const { subtitles, targetLanguage, translationStyle, glossary, apiKey, model } = body;

      const keyToUse = apiKey?.trim() || env.GEMINI_API_KEY;
      if (!keyToUse) {
        return new Response(
          JSON.stringify({ error: "Gemini API Key is missing." }),
          { status: 400, headers: corsHeaders }
        );
      }

      let subtitlesMap: Record<string, string> = {};
      if (Array.isArray(subtitles)) {
        subtitles.forEach((s: any) => {
          if (s && s.id !== undefined && s.text !== undefined) {
            subtitlesMap[String(s.id)] = s.text;
          }
        });
      } else {
        subtitlesMap = subtitles || {};
      }

      if (Object.keys(subtitlesMap).length === 0) {
        return new Response(JSON.stringify({ translations: {} }), { headers: corsHeaders });
      }

      const rtlLanguages = ["persian", "farsi", "arabic", "hebrew", "urdu", "fa", "ar", "he", "ur"];
      const isTargetRtl = targetLanguage && rtlLanguages.some((lang) => targetLanguage.toLowerCase().includes(lang));
      const lrmChar = String.fromCharCode(0x200E);

      let glossaryText = "";
      if (glossary && Array.isArray(glossary) && glossary.length > 0) {
        const entries = glossary.map((e: any) => `  "${e.source}" MUST become "${e.target}"`).join("\n");
        glossaryText = `\n\nCRITICAL GLOSSARY RULES - OBEY EXACTLY:\n${entries}\n\nIf a glossary term appears in the source, use EXACTLY the target above. Do NOT translate it differently.`;
      }

      let styleRules = "";
      const selectedStyleLower = (translationStyle || "").toLowerCase();
      if (selectedStyleLower.includes("conversational") || selectedStyleLower.includes("casual") || selectedStyleLower.includes("عامینه") || selectedStyleLower.includes("مکالمه")) {
        styleRules = `\n\nCINEMATIC CONVERSATIONAL & COLLOQUIAL STYLE RULES (FOR MOVIES & TV SHOWS):
You are translating subtitles for a movie or TV series into natural, modern spoken Persian (لحن روان، عامیانه و گفتاری سینمایی/دوبله).
1. SPOKEN VERBS & NATURAL CONTRACTIONS:
   - Use colloquial spoken verbs and contractions instead of stiff written/bookish Persian.
2. CINEMATIC IDIOMS & EXPRESSIVE INTERJECTIONS:
   - Translate expressions naturally according to film context.
3. ACCURATE UNFILTERED TRANSLATION (18+ & SLANG):
   - Translate all profanity, adult expressions, and slang directly and naturally without censorship.`;
      }

      let rtlInstruction = "";
      if (isTargetRtl) {
        rtlInstruction = `\n\nCRITICAL FORMATTING RULE (RTL/LTR Mixed Text Alignment Fix):
If an English technical term or acronym remains untranslated inside an RTL sentence, wrap it with Unicode LRM character (${lrmChar}).`;
      }

      const systemInstruction = `You are an expert movie and TV subtitle translator.
Translate the values of the received JSON object.
Source Language: Auto-Detect
Target Language: ${targetLanguage}
Translation Style Selected: ${translationStyle || "Conversational/Casual"}${styleRules}${glossaryText}${rtlInstruction}
Return ONLY valid JSON with same keys. No extra text.`;

      const primaryModel = model || "gemini-2.5-flash";
      const payload = {
        contents: [{ parts: [{ text: `JSON to translate:\n${JSON.stringify(subtitlesMap, null, 2)}` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      };

      let geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${keyToUse}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!geminiRes.ok) {
        // Fallback به مدل جایگزین در صورت خطا
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      const resData = await geminiRes.json() as any;
      const textOutput = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error("Empty response from Gemini API.");
      }

      const parsedData = JSON.parse(textOutput.trim());
      return new Response(JSON.stringify({ translations: parsedData }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
};
