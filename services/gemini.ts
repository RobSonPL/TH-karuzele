
import { GoogleGenAI, Type } from "@google/genai";
import { SlideData, GenerationSettings, GroundingSource } from "../types";

export const generateKeySequences = async (topic: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Zaproponuj trzy kluczowe elementy (sekwencję) dla karuzeli na temat: "${topic}".
  1. Hook (zaczepka, która zatrzyma scrollowanie)
  2. Wartość (główne przesłanie merytoryczne)
  3. CTA (wezwanie do działania)
  Odpowiedz w formacie JSON: ["hook", "wartość", "cta"]. Tylko tablica stringów.`;

  try {
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
    return JSON.parse(response.text || '["", "", ""]');
  } catch (e: any) {
    if (e.message?.includes("Requested entity was not found")) {
      throw new Error("ENTITY_NOT_FOUND");
    }
    return ["", "", ""];
  }
};

export const convertTextToSlides = async (rawText: string, slideCount: number): Promise<SlideData[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Przekształć poniższy tekst w strukturę ${slideCount} slajdów do karuzeli na social media. 
  Tekst źródłowy: "${rawText}"
  
  Wymagania:
  - Slajd 1: Musi być chwytliwym nagłówkiem (Hook).
  - Slajdy środkowe: Muszą zawierać kluczowe punkty wyciągnięte z tekstu.
  - Ostatni slajd: Musi zawierać podsumowanie i wezwanie do działania (CTA).
  - Język: Polski.
  Zwróć JSON jako tablicę obiektów z polami 'title' i 'content'.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
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
    return JSON.parse(response.text || '[]');
  } catch (e: any) {
    if (e.message?.includes("Requested entity was not found")) {
      throw new Error("ENTITY_NOT_FOUND");
    }
    return [];
  }
};

export const convertFileToSlides = async (base64Data: string, mimeType: string, slideCount: number): Promise<SlideData[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Jesteś ekspertem od social media. Przeanalizuj załączony plik (${mimeType.includes('pdf') ? 'Dokument PDF' : 'Obraz'}) i na jego podstawie stwórz profesjonalną, angażującą strukturę ${slideCount} slajdów do karuzeli.
  
  Wytyczne:
  1. Slajd 1: Hook, który obiecuje rozwiązanie problemu lub ciekawą informację.
  2. Slajdy 2 do ${slideCount - 1}: Konkretne kroki, dane lub fakty wyciągnięte bezpośrednio z dokumentu/obrazu.
  3. Slajd ${slideCount}: Silne CTA (Call to Action) zachęcające do dyskusji lub obserwacji.
  4. Język: Polski.
  
  Zwróć wynik WYŁĄCZNIE jako JSON (tablica obiektów z polami 'title' i 'content').`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: base64Data.split(',')[1] || base64Data,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ],
      config: {
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
    return JSON.parse(response.text || '[]');
  } catch (e: any) {
    if (e.message?.includes("Requested entity was not found")) {
      throw new Error("ENTITY_NOT_FOUND");
    }
    console.error("Błąd parsowania AI przy imporcie pliku:", e);
    return [];
  }
};

export const generateCarouselContent = async (settings: GenerationSettings): Promise<{ slides: SlideData[], sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  try {
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

    const slides = JSON.parse(response.text || '[]');
    return { slides, sources };
  } catch (e: any) {
    if (e.message?.includes("Requested entity was not found")) {
      throw new Error("ENTITY_NOT_FOUND");
    }
    throw new Error("Błąd AI.");
  }
};
