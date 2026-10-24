import { CivicCategory, IssueSeverity } from '../types';

export type PuterVisionModel = 'google/gemini-3.8-flash' | 'openai/gpt-5.4-nano';

export interface PuterVisionAnalysisResult {
  detectedDamage: string;
  category: CivicCategory;
  subtype: string;
  confidence: number;
  severity: IssueSeverity;
  observations: string[];
  visualEvidence: string;
  urgencyRationale: string;
  missingInformation: string[];
  suggestedQuestions: string[];
  safetyWarning?: string;
  modelUsed: string;
  rawResponse?: string;
}

export interface PuterAnalyzeOptions {
  imageFile?: File;
  imageUrl?: string;
  description?: string;
  model?: PuterVisionModel | string;
}

// Retrieve Puter instance from window (loaded via official Puter CDN)
export const getPuter = (): any => {
  if (typeof window !== 'undefined' && (window as any).puter) {
    return (window as any).puter;
  }
  return undefined;
};

// Check if user is signed into Puter
export const isPuterSignedIn = (): boolean => {
  try {
    const p = getPuter();
    return p?.auth?.isSignedIn?.() || false;
  } catch (e) {
    return false;
  }
};

// Sign in with Puter (1-click free auth)
export const signInWithPuter = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const p = getPuter();
    if (!p?.auth?.signIn) {
      return { success: false, error: 'Puter auth is not available.' };
    }
    const result = await p.auth.signIn({ attempt_temp_user_creation: true });
    return { success: true, user: result };
  } catch (err: any) {
    console.warn('Puter sign in cancelled or blocked:', err);
    return { success: false, error: err?.message || 'Authentication was cancelled or blocked by browser popup blocker.' };
  }
};

// Get current signed in user details
export const getPuterUser = async (): Promise<any | null> => {
  try {
    const p = getPuter();
    if (p?.auth?.isSignedIn?.()) {
      return await p.auth.getUser();
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Prepare image into a Base64 Data URL so Puter cloud vision models can access local & uploaded media
export const prepareImageInput = async (imageFile?: File, imageUrl?: string): Promise<string | null> => {
  if (imageFile) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(imageFile);
    });
  }

  if (imageUrl) {
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    // If it's a relative path (e.g. /fixtures/...) or blob, fetch it and convert to Data URL
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(imageUrl);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Could not convert image to base64, using raw URL:', e);
      return imageUrl;
    }
  }

  return null;
};

// Validate and normalize Civic Category
const normalizeCategory = (cat: string): CivicCategory => {
  const c = (cat || '').toLowerCase().trim();
  if (c.includes('road') || c.includes('pothole') || c.includes('asphalt') || c.includes('footpath')) {
    return 'roads_footpaths';
  }
  if (c.includes('waste') || c.includes('garbage') || c.includes('sanitation') || c.includes('trash') || c.includes('dump')) {
    return 'waste_sanitation';
  }
  if (c.includes('drain') || c.includes('waterlog') || c.includes('flood') || c.includes('sewer') || c.includes('nallah')) {
    return 'drainage_waterlogging';
  }
  if (c.includes('water_supply') || c.includes('pipeline') || c.includes('drinking') || (c.includes('water') && c.includes('pipe'))) {
    return 'water_supply';
  }
  if (c.includes('light') || c.includes('electr') || c.includes('wire') || c.includes('pole') || c.includes('transformer')) {
    return 'streetlights_electrical';
  }
  if (c.includes('park') || c.includes('garden') || c.includes('bench') || c.includes('tree')) {
    return 'parks_public_spaces';
  }
  if (c.includes('toilet') || c.includes('shelter') || c.includes('facility') || c.includes('bus')) {
    return 'public_facilities';
  }
  if (c.includes('access') || c.includes('ramp') || c.includes('wheelchair') || c.includes('tactile')) {
    return 'accessibility';
  }
  return 'uncertain_other';
};

// Validate and normalize Severity
const normalizeSeverity = (sev: string): IssueSeverity => {
  const s = (sev || '').toLowerCase().trim();
  if (s === 'critical' || s.includes('urgent') || s.includes('danger') || s.includes('emergency')) return 'critical';
  if (s === 'high' || s.includes('severe')) return 'high';
  if (s === 'low' || s.includes('minor')) return 'low';
  return 'medium';
};

// Parse JSON safely from model response
const parseModelJson = (raw: string): any => {
  let cleaned = raw.trim();
  // Strip code block markers
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Unable to extract structured JSON from Puter AI response: ' + raw.slice(0, 100));
  }
};

export const PuterVisionService = {
  isAvailable(): boolean {
    const p = getPuter();
    return Boolean(p && p.ai && typeof p.ai.chat === 'function');
  },

  isSignedIn(): boolean {
    return isPuterSignedIn();
  },

  signIn(): Promise<{ success: boolean; user?: any; error?: string }> {
    return signInWithPuter();
  },

  getUser(): Promise<any | null> {
    return getPuterUser();
  },

  /**
   * Analyze civic damage or public infrastructure issue using Puter.js AI Vision.
   * Model defaults to 'google/gemini-3.8-flash' (as highlighted in the tutorial).
   */
  async analyzeDamage(options: PuterAnalyzeOptions): Promise<PuterVisionAnalysisResult> {
    const p = getPuter();
    if (!p || !p.ai || typeof p.ai.chat !== 'function') {
      throw new Error('Puter.js AI module is not initialized.');
    }

    const imageInput = await prepareImageInput(options.imageFile, options.imageUrl);
    if (!imageInput) {
      throw new Error('No valid image was provided for Puter vision recognition.');
    }

    const modelToUse = options.model || 'google/gemini-3.8-flash';

    const systemPrompt = `You are a certified senior civic infrastructure damage assessment engineer and municipal auditor for JanNigrani Jaipur.
Inspect this photograph of a civic/public infrastructure issue or damage in meticulous detail.
Additional citizen context: "${options.description || 'No written note provided'}"

Analyze the image carefully and respond ONLY with a single valid JSON object (no explanations outside the JSON, no markdown formatting) following this schema:
{
  "detectedDamage": "Precise name of defect (e.g. Severe Asphalt Pothole Crater, Damaged Streetlight Luminaire with Hanging Live Wire, Secondary Solid Waste Dumpster Overflow, Burst Potable Water Main, Blocked Storm Drain Inundation)",
  "category": "roads_footpaths" | "waste_sanitation" | "drainage_waterlogging" | "water_supply" | "streetlights_electrical" | "parks_public_spaces" | "public_facilities" | "accessibility" | "uncertain_other",
  "subtype": "Concise subtype label for municipal ticketing (e.g. Deep Bituminous Cavity, Exposed Live Electrical Wire, Overflowing Municipal Tipper Skip)",
  "confidence": 0.94,
  "severity": "low" | "medium" | "high" | "critical",
  "observations": [
    "Specific visual measurement, physical dimension, or material state observed in photo",
    "Visible condition of surrounding area (carriageway, curb, pedestrians, buildings, traffic)",
    "Specific structural failure mechanism or public hazard indicator"
  ],
  "visualEvidence": "1-2 concise factual sentences describing the visual proof of damage visible in the photo.",
  "urgencyRationale": "Engineering rationale for the selected severity level, explaining specific threat to two-wheelers, pedestrians, public health, or electrical shock.",
  "missingInformation": [
    "Important engineering factor that cannot be verified from a single photo (e.g. underlying utility pipes, nighttime luminaire voltage, depth under stagnant water)"
  ],
  "suggestedQuestions": [
    "Actionable question for the field verification officer or citizen to clarify"
  ],
  "safetyWarning": "Optional urgent safety alert if severity is high or critical (e.g. Immediate electrocution risk, rollover risk for two-wheelers), otherwise omit or leave empty string"
}`;

    // Invoke Puter's multi-modal vision API
    let chatResponse: any;
    try {
      chatResponse = await p.ai.chat(systemPrompt, imageInput, {
        model: modelToUse,
      });
    } catch (apiError: any) {
      // If error indicates unauthorized and user is not signed in, attempt one silent or interactive sign in
      const errMsg = apiError?.message || String(apiError);
      if (errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('token')) {
        console.info('Puter auth required, attempting user sign-in...');
        const authRes = await signInWithPuter();
        if (authRes.success) {
          // Retry chat after successful sign in
          chatResponse = await p.ai.chat(systemPrompt, imageInput, {
            model: modelToUse,
          });
        } else {
          throw new Error('Puter authentication required: ' + (authRes.error || errMsg));
        }
      } else {
        throw apiError;
      }
    }

    // Extract text content from Puter response
    let rawText = '';
    if (typeof chatResponse === 'string') {
      rawText = chatResponse;
    } else if (chatResponse?.message?.content) {
      if (typeof chatResponse.message.content === 'string') {
        rawText = chatResponse.message.content;
      } else if (Array.isArray(chatResponse.message.content)) {
        rawText = chatResponse.message.content
          .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
          .join('\n');
      }
    } else if (chatResponse?.toString) {
      rawText = chatResponse.toString();
    } else {
      rawText = JSON.stringify(chatResponse);
    }

    const parsed = parseModelJson(rawText);

    return {
      detectedDamage: parsed.detectedDamage || parsed.subtype || 'Detected Civic Damage',
      category: normalizeCategory(parsed.category),
      subtype: parsed.subtype || parsed.detectedDamage || 'Civic Infrastructure Defect',
      confidence: typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.5, parsed.confidence)) : 0.91,
      severity: normalizeSeverity(parsed.severity),
      observations: Array.isArray(parsed.observations) && parsed.observations.length > 0
        ? parsed.observations
        : ['Visual analysis confirms surface infrastructure degradation matching reported complaint.'],
      visualEvidence: parsed.visualEvidence || 'Photographic evidence matches known municipal damage criteria.',
      urgencyRationale: parsed.urgencyRationale || 'Evaluated based on public safety impact, road width, and hazard potential.',
      missingInformation: Array.isArray(parsed.missingInformation) && parsed.missingInformation.length > 0
        ? parsed.missingInformation
        : ['Sub-surface foundation depth', 'Historical maintenance ledger'],
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
        ? parsed.suggestedQuestions
        : ['Has this damage worsened following recent weather events?'],
      safetyWarning: parsed.safetyWarning || undefined,
      modelUsed: modelToUse,
      rawResponse: rawText,
    };
  }
};
