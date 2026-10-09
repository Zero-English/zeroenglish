import { TemplateType, ResolvedTemplateData } from "../types";
import { getSampleDataForType } from "../registry";
import { resolveQuizData } from "./quiz-resolver";
import { resolveContributorData } from "./contributor-resolver";
import { resolveVocabData } from "./vocab-resolver";
import { resolveLeaderboardData } from "./leaderboard-resolver";

export async function resolveTemplateData(
  type: TemplateType | string,
  entityId?: number | string | null,
  useSampleFallback: boolean = false
): Promise<ResolvedTemplateData> {
  const sampleData = getSampleDataForType(type);

  if (useSampleFallback || !entityId) {
    return sampleData;
  }

  const numId = typeof entityId === "string" ? parseInt(entityId, 10) : entityId;

  if (isNaN(numId) || numId <= 0) {
    return sampleData;
  }

  let liveData: ResolvedTemplateData | null = null;

  switch (type) {
    case "QUIZ_POSTER":
      liveData = await resolveQuizData(numId);
      break;
    case "CONTRIBUTOR_CERTIFICATE":
      liveData = await resolveContributorData(numId);
      break;
    case "VOCABULARY_POSTER":
      liveData = await resolveVocabData(numId);
      break;
    case "LEADERBOARD_POSTER":
      liveData = await resolveLeaderboardData(numId);
      break;
    default:
      break;
  }

  if (!liveData) {
    return sampleData;
  }

  // Merge live data with sample data fallback for any missing fields
  return {
    ...sampleData,
    ...liveData,
  };
}

/**
 * Replaces any {{token}} matches in a given text with their resolved values
 */
export function interpolateText(text: string, data: ResolvedTemplateData): string {
  if (!text) return "";
  return text.replace(/\{\{[a-zA-Z0-9_.]+\}\}/g, (match) => {
    return data[match] !== undefined ? data[match] : match;
  });
}
