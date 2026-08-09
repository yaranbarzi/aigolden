import { GoogleGenAI } from '@google/genai';
import { GlossaryItem } from '../types';

export async function translateTextWithGemini(
  text: string,
  apiKey: string,
  targetLang: string,
  style: string,
  glossary: GlossaryItem[]
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  
  let glossaryPrompt = "";
  if (glossary.length > 0) {
    glossaryPrompt = "\nUse the following strict term translations:\n" + 
      glossary.map(g => `- "${g.source}": "${g.target}"`).join("\n");
  }

  const prompt = `Translate the following subtitle segment into ${targetLang}. 
Style/Tone: ${style}.
Maintain the exact length and context suitable for video subtitles.${glossaryPrompt}

Subtitle text:
"${text}"

Return ONLY the translated string, without quotes or additional commentary.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text?.trim() || text;
}
