import prisma from "@/utils/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { ResolvedTemplateData } from "../types";

export async function resolveVocabData(wordId: number): Promise<ResolvedTemplateData | null> {
  try {
    const word = await prisma.word.findUnique({
      where: { id: wordId },
      include: {
        addedByUser: {
          select: { id: true, name: true, user_name: true },
        },
      },
    });

    if (!word) return null;

    const baseUrl = SITE_URL || "https://zeroenglish.org";
    const wordUrl = `${baseUrl}/vocabulary/${encodeURIComponent(word.word.toLowerCase())}`;
    const meaningBn = Array.isArray(word.meaningBn) ? word.meaningBn.join(", ") : (word.meaningBn || "");
    const synonyms = Array.isArray(word.synonyms) ? word.synonyms.join(", ") : (word.synonyms || "");
    const antonyms = Array.isArray(word.antonyms) ? word.antonyms.join(", ") : (word.antonyms || "");
    const partOfSpeech = Array.isArray(word.wordType) ? word.wordType.join(", ") : (word.wordType || "Word");
    const exampleEn = Array.isArray(word.examplesEn) && word.examplesEn.length > 0 ? word.examplesEn[0] : "";
    const exampleBn = Array.isArray(word.examplesBn) && word.examplesBn.length > 0 ? word.examplesBn[0] : "";

    const data: ResolvedTemplateData = {
      "{{vocab.id}}": `${word.id}`,
      "{{vocab.word}}": word.word || "",
      "{{vocab.phonetic}}": `/${word.word.toLowerCase()}/`,
      "{{vocab.partOfSpeech}}": partOfSpeech,
      "{{vocab.meaningBangla}}": meaningBn,
      "{{vocab.definition}}": word.definitionEn || "",
      "{{vocab.exampleSentence}}": exampleEn,
      "{{vocab.exampleBangla}}": exampleBn,
      "{{vocab.synonyms}}": synonyms,
      "{{vocab.antonyms}}": antonyms,
      "{{vocab.level}}": word.level || "INTERMEDIATE",
      "{{vocab.category}}": word.category || "General",
      "{{vocab.url}}": wordUrl,
      "{{site.name}}": SITE_NAME || "Zero English",
      "{{site.url}}": baseUrl,
      "{{site.tagline}}": "Master English Without Fear",
      "{{site.logo}}": `${baseUrl}/assets/logo/logo-full.webp`,
      "{{site.callToAction}}": "Start learning for free at zeroenglish.org",
    };

    return data;
  } catch (err) {
    console.error(`[VocabResolver] Error resolving vocab #${wordId}:`, err);
    return null;
  }
}
