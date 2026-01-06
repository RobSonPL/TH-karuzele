
import { GoogleGenAI, Type } from "@google/genai";
import { SlideData, GenerationSettings, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateKeySequences = async (topic: string): Promise<string[]> => {
  const prompt = `Zaproponuj trzy kluczowe elementy (sekwencję) dla karuzeli na temat: "${topic}".
  1. Hook (zaczepka, która zatrzyma scrollowanie)
  2. Wartość (główne przesłanie merytoryczne)
  3. CTA (wezwanie do działania)
  Odpowiedz w formacie JSON: ["hook", "wartość", "cta"]. Tylko tablica stringów.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || '["", "", ""]');
  } catch (e) {
    return ["", "", ""];
  }
};

export const generateCarouselContent = async (settings: GenerationSettings): Promise<{ slides: SlideData[], sources: GroundingSource[] }> => {
  const imagesContext = settings.referenceImageUrls.length > 0 
    ? `\n\nInspiracja wizualna (cln.sh links):\n${settings.referenceImageUrls.join('\n')}`
    : '';

  const sequencesContext = settings.keyMessages.some(m => m.trim())
    ? `\n\nStosuj te fazy:\n1. Hook: ${settings.keyMessages[0]}\n2. Kluczowa Informacja: ${settings.keyMessages[1]}\n3. CTA: ${settings.keyMessages[2]}`
    : '';

  let prompt = `Stwórz treść karuzeli (${settings.slideCount} slajdów). 
  Temat: "${settings.topic}". Ton: ${settings.tone}.
  ${sequencesContext}
  ${imagesContext}
  
  Wymagania:
  - Slajd 1: Bardzo silny Hook (nawiąż do sekwencji).
  - Slajdy środkowe: Rozwiń "Wartość" w przystępnych punktach.
  - Ostatni slajd: Silne CTA.
  Zwróć JSON z polami 'title' i 'content'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: (settings.sourceUrl || settings.referenceImageUrls.length > 0) ? [{ googleSearch: {} }] : undefined,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ['title', 'content']
        }
      }
    }
  });

  const sources: GroundingSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    });
  }

  try {
    const slides = JSON.parse(response.text || '[]');
    return { slides, sources };
  } catch (e) {
    throw new Error("Błąd AI.");
  }
};
