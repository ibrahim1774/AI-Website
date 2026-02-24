
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from "../constants";
import { GeneratedSiteData, GeneratorInputs } from "../types";

/**
 * Utility to strip markdown code blocks from AI response text
 */
const cleanJsonResponse = (text: string): string => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

export const generateSiteContent = async (inputs: GeneratorInputs): Promise<GeneratedSiteData> => {
  // Always create a new instance right before usage to get the latest environment state
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // 1. Prepare Prompts
    const textPrompt = SYSTEM_PROMPT
      .replace("{industry}", inputs.industry)
      .replace("{companyName}", inputs.companyName)
      .replace("{location}", inputs.location)
      .replace("{phone}", inputs.phone);

    const imagePromptHero = `Wide establishing shot of a professional ${inputs.industry} team working at a residential job site in ${inputs.location}. Professional uniforms, cinematic lighting, 8k resolution. No text, no logos.`;
    const imagePromptTrust = `Action shot of a ${inputs.industry} team actively working on a project. Shows professionalism and teamwork, tools visible, natural lighting, high quality. No text, no logos.`;
    const imagePromptWhyChooseUs = `Professional portrait of a ${inputs.industry} team posing with their equipment and service vehicle. Confident, approachable, well-lit, high quality. No text, no logos.`;

    // 2. Generate Text and Images in Parallel
    const [textResponse, heroImgRes, trustImgRes, whyChooseUsImgRes] = await Promise.all([
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA as any,
        },
      }),
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePromptHero }] },
      }),
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePromptTrust }] },
      }),
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePromptWhyChooseUs }] },
      })
    ]);

    // 3. Process Text Results
    const rawText = textResponse.text || "{}";
    const cleanedText = cleanJsonResponse(rawText);
    const siteData: Partial<GeneratedSiteData> = JSON.parse(cleanedText);

    const extractImage = (response: any) => {
      try {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      } catch (e) {
        console.warn("Failed to extract image, using fallback", e);
      }
      return `https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200`;
    };

    // 4. Combine and Sanitize
    if (!siteData.hero) siteData.hero = {} as any;
    if (!siteData.contact) siteData.contact = {} as any;
    if (!siteData.trust) siteData.trust = {} as any;
    if (!siteData.whyChooseUs) siteData.whyChooseUs = {} as any;

    const hero = siteData.hero!;
    const trust = siteData.trust!;
    const wcu = siteData.whyChooseUs!;
    const contact = siteData.contact!;

    hero.heroImage = extractImage(heroImgRes);
    trust.image = extractImage(trustImgRes);
    wcu.image = extractImage(whyChooseUsImgRes);

    contact.phone = inputs.phone;
    contact.location = inputs.location;
    contact.companyName = inputs.companyName;

    return siteData as GeneratedSiteData;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Propagate a clean error message if it's a model issue
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("Model not found or API key restricted. Please ensure your API key is correctly configured.");
    }
    throw error;
  }
};
