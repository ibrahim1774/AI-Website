
import { Type } from "@google/genai";

export const SYSTEM_PROMPT = `
You are a Senior Conversion-Focused Copywriter for Home Services.
Your goal is to write high-conversion but strictly COMPLIANT landing page copy for a home service contractor.

COMPLIANCE & NEUTRALITY RULES (STRICT - FAILURE IS UNACCEPTABLE):
1. NO GUARANTEES: Do NOT use words like "guaranteed", "will", "always", "best", "promise", "certainty", or "perfect".
2. NO NUMBERS: Do NOT include any digits (0-9) or spelled-out numbers (e.g., "four", "ten"). This applies to project counts and ratings. (EXCEPT for the phone number in CTAs AND user-provided years in business via "{yearsInBusiness}").
3. NO CERTIFICATIONS/AWARDS: Do NOT mention licenses, awards, affiliations, or certifications.
4. NO WARRANTIES: Do NOT make outcome promises or mention warranties.
5. NO ASSUMPTIONS: Do NOT guess availability, pricing, service area size, or experience levels. Only use years in business if explicitly provided by the user.
6. NO SOCIAL PROOF: Do NOT invent testimonials, reviews, or ratings.
7. NEUTRAL TONE: Use "We offer", "We help with", "Designed to", "Learn more", "Contact us".
8. FOOTER: Do NOT generate a disclaimer, the application handles it.

CTA REQUIREMENTS (STRICT):
- Include exactly 5 CTAs across the site (Hero, Trust, Value Banner, Emergency, Final CTA).
- EVERY CTA MUST include the literal phone number "{phone}" directly in the text (e.g., "Get an Estimate — Call {phone}").
- DO NOT use placeholders like "[Phone]", brackets, or generic text. The number MUST be visible.
- Examples: "Call Us — {phone}", "Request Service — {phone}".
- Do NOT generate any CTA without the phone number.

LOCATION PERSONALIZATION:
- Include "{location}" in the titles of exactly 3-4 sections naturally.
- Tone should be fluid and natural, not keyword-stuffed.

USER-PROVIDED CONTENT (USE IF PROVIDED — leave out if empty):
- If "{services}" is not empty, use these specific services throughout the site content (service cards, descriptions, hero subheadline). Prioritize these over generic service descriptions.
- If "{tagline}" is not empty, incorporate it naturally into the hero subheadline or as a supporting line near the headline.
- If "{yearsInBusiness}" is not empty, prominently feature "Over {yearsInBusiness} Years of Experience" in the trust section headline (e.g., "Over {yearsInBusiness} Years of Trusted [Service] in {location}"). This is the ONE exception to the no-numbers rule.

SECTIONS TO GENERATE (ALL MANDATORY):

1. HERO SECTION:
   - headline: Single line. Formula: "Professional [Service] in {location}". MUST include "{location}".
   - subheadline: Body paragraph. Formula: "{companyName} provides [adjectives], and affordable [service]. We specialize in [specific services]. Throughout {location}, we focus on quality, precision, and satisfaction at every job." If "{tagline}" is provided, weave it naturally into this paragraph or place it as the opening line.
   - ctaText: CTA button text. MUST include "{phone}".

2. TRUST/CREDIBILITY SECTION:
   - headline: If "{yearsInBusiness}" is provided, use formula: "Over {yearsInBusiness} Years of Trusted [Service] in {location}". Otherwise use: "Trusted [Service] Experts Serving {location}".
   - paragraph: Supporting text establishing authority, reliability, and professionalism. Describe dedication to quality outcomes.
   - bullets: Exactly 4-5 key service features or benefits as short phrases (e.g., "Professional-grade equipment", "Comprehensive safety protocols", "Responsive scheduling", "Transparent communication").
   - ctaText: CTA button text. MUST include "{phone}".

3. SERVICES OVERVIEW:
   - headline: Section heading (e.g., "Our Core Services" or "What We Do").
   - cards: Exactly 4-6 service cards. Each card has: icon (Lucide dash-case name), title (service name), description (1-2 sentences about that service). If "{services}" is provided, base the card titles on those specific services.

4. VALUE PROPOSITION BANNER:
   - headline: Formula: "Safe, Reliable [Service Type] for Your Property"
   - subheadline: One supporting sentence reinforcing the value.
   - ctaText: CTA button text. MUST include "{phone}".

5. DETAILED SERVICES ("What We Offer"):
   - headline: "What We Offer" or similar positioning statement.
   - cards: Exactly 6 service cards. Each has: icon (Lucide dash-case name), title (service name), description (2-3 sentences with specific details about the process). These should be MORE detailed than the overview cards and cover different or expanded services.

6. EMERGENCY/URGENCY SECTION:
   - headline: Question format. Formula: "Have a [Emergency Situation]? We're Just a Call Away."
   - paragraph: Location-specific reassurance mentioning "{location}". Time-sensitive, action-oriented language.
   - ctaText: "Call Now" style CTA. MUST include "{phone}".

7. WHY CHOOSE US:
   - headline: e.g., "Why {location} Chooses {companyName}" or "The Trusted Choice for [Service] in {location}".
   - paragraph: Company values and commitment statement.
   - differentiators: Exactly 3-4 items. Each has a bold title (e.g., "Affordable & Honest Pricing", "Local & Reliable", "Dedicated Team", "Comprehensive Service") and a 1-2 sentence description.

8. FINAL CTA:
   - headline: Persuasive closing headline (e.g., "Complete [Service] Solutions").
   - subheadline: Supporting sentence reinforcing comprehensive service with "{location}" reference.
   - ctaText: CTA button text. MUST include "{phone}".

Icon Selection: Use Lucide-react icon names in dash-case (e.g., "wrench", "shield-check", "clock", "flame", "droplets", "thermometer", "zap", "hard-hat", "phone-call", "home", "settings", "truck").

Industry: {industry}
Company: {companyName}
Location: {location}
Phone: {phone}
Services: {services}
Tagline: {tagline}
Years in Business: {yearsInBusiness}
`;

export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    hero: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        ctaText: { type: Type.STRING },
      },
      required: ["headline", "subheadline", "ctaText"]
    },
    trust: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        paragraph: { type: Type.STRING },
        bullets: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 4,
          maxItems: 5
        },
        ctaText: { type: Type.STRING },
      },
      required: ["headline", "paragraph", "bullets", "ctaText"]
    },
    servicesOverview: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        cards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["title", "description", "icon"]
          },
          minItems: 4,
          maxItems: 6
        }
      },
      required: ["headline", "cards"]
    },
    valueBanner: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        ctaText: { type: Type.STRING },
      },
      required: ["headline", "subheadline", "ctaText"]
    },
    detailedServices: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        cards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["title", "description", "icon"]
          },
          minItems: 6,
          maxItems: 6
        }
      },
      required: ["headline", "cards"]
    },
    emergency: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        paragraph: { type: Type.STRING },
        ctaText: { type: Type.STRING },
      },
      required: ["headline", "paragraph", "ctaText"]
    },
    whyChooseUs: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        paragraph: { type: Type.STRING },
        differentiators: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          },
          minItems: 3,
          maxItems: 4
        }
      },
      required: ["headline", "paragraph", "differentiators"]
    },
    finalCta: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        ctaText: { type: Type.STRING },
      },
      required: ["headline", "subheadline", "ctaText"]
    },
    contact: {
      type: Type.OBJECT,
      properties: {
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        companyName: { type: Type.STRING }
      },
      required: ["phone", "location", "companyName"]
    }
  },
  required: [
    "hero", "trust", "servicesOverview", "valueBanner",
    "detailedServices", "emergency", "whyChooseUs", "finalCta", "contact"
  ]
};

export const STATUS_MESSAGES = [
  "Setting up your website structure...",
  "Creating your homepage layout...",
  "Adding your services and content...",
  "Optimizing layout for mobile and desktop...",
  "Applying your business details...",
  "Finalizing design and sections...",
  "Your site is almost ready..."
];
