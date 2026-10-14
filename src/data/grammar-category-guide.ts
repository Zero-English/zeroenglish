export interface CategoryGuideType {
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  examples: string[];
}

export interface CategorySentenceRole {
  roleEn: string;
  roleBn: string;
  exampleSentence: string;
  targetWord: string;
}

export interface CategoryGuideInfo {
  categoryId: string;
  orderNumber: number;
  parentSectionId: string;
  parentSectionNameEn: string;
  parentSectionNameBn: string;
  headlineEn: string;
  headlineBn: string;
  overviewEn: string;
  overviewBn: string;
  sentenceRoles: CategorySentenceRole[];
  keyTypes: CategoryGuideType[];
  identificationHacks: {
    questionEn: string;
    questionBn: string;
    suffixes?: string[];
    clueEn: string;
    clueBn: string;
  };
  commonTrap: {
    titleEn: string;
    titleBn: string;
    incorrect: string;
    correct: string;
    explanationEn: string;
    explanationBn: string;
  };
}

export const CATEGORY_GUIDES: Record<string, CategoryGuideInfo> = {
  noun: {
    categoryId: "noun",
    orderNumber: 1,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Naming Words: People, Places, Things & Ideas",
    headlineBn: "নামবাচক শব্দ: ব্যক্তি, স্থান, বস্তু ও বিমূর্ত ধারণা",
    overviewEn:
      "A noun is a naming word that identifies a person, animal, place, thing, substance, quality, or abstract idea. In English sentences, nouns serve as the primary actors (subjects), receivers (objects), or prepositional complements.",
    overviewBn:
      "যে শব্দ দ্বারা কোনো ব্যক্তি, প্রাণী, স্থান, বস্তু, পদার্থ, গুণ, সমষ্টি বা বিমূর্ত ধারণার নাম বোঝায়, তাকে Noun বা বিশেষ্য বলে। বাক্যে বিশেষ্য প্রধানত Subject (কর্তা) বা Object (কর্ম) হিসেবে কাজ করে।",
    sentenceRoles: [
      {
        roleEn: "Subject (The Actor)",
        roleBn: "Subject (কর্তা)",
        exampleSentence: "Knowledge empowers individuals.",
        targetWord: "Knowledge",
      },
      {
        roleEn: "Direct Object (The Receiver)",
        roleBn: "Direct Object (সরাসরি কর্ম)",
        exampleSentence: "She reads an insightful book.",
        targetWord: "book",
      },
      {
        roleEn: "Object of Preposition",
        roleBn: "Preposition-এর কর্ম",
        exampleSentence: "They traveled to London.",
        targetWord: "London",
      },
    ],
    keyTypes: [
      {
        nameEn: "Proper Noun",
        nameBn: "নির্দিষ্ট নাম",
        descriptionEn: "Names of specific persons, places, or holidays. Always capitalized.",
        descriptionBn: "নির্দিষ্ট কোনো ব্যক্তি, স্থান, দিন বা সংস্থার নাম (সর্বদা Capital letter)।",
        examples: ["Dhaka", "Shakespeare", "Monday", "Google"],
      },
      {
        nameEn: "Common Noun",
        nameBn: "সাধারণ নাম",
        descriptionEn: "General names for a class of people, places, or objects.",
        descriptionBn: "একই জাতীয় ব্যক্তি, স্থান বা বস্তুর সাধারণ নাম।",
        examples: ["city", "author", "student", "river"],
      },
      {
        nameEn: "Collective Noun",
        nameBn: "সমষ্টিবাচক নাম",
        descriptionEn: "Singular words denoting a group or collection of individuals.",
        descriptionBn: "ব্যক্তি বা বস্তুর অবিভক্ত সমষ্টিবাচক নাম।",
        examples: ["team", "family", "crowd", "committee"],
      },
      {
        nameEn: "Abstract Noun",
        nameBn: "গুণ ও ভাববাচক নাম",
        descriptionEn: "Intangible concepts, feelings, qualities, or states of mind.",
        descriptionBn: "যেগুলো ছোঁয়া যায় না কিন্তু অনুভব করা যায় (গুণ, অনুভূতি, ধারণা)।",
        examples: ["honesty", "bravery", "freedom", "wisdom"],
      },
      {
        nameEn: "Material Noun",
        nameBn: "পদার্থবাচক নাম",
        descriptionEn: "Raw materials or physical substances from which things are made.",
        descriptionBn: "যেসব বস্তু গণনা করা যায় না কিন্তু ওজন বা পরিমাপ করা যায়।",
        examples: ["gold", "water", "cotton", "wood"],
      },
      {
        nameEn: "Countable vs Uncountable",
        nameBn: "গণনাযোগ্য ও অগণনযোগ্য",
        descriptionEn: "Countables have plurals; uncountables do not take 's' or 'a/an'.",
        descriptionBn: "গণনাযোগ্য বিশেষ্যের বহুবচন হয়; অগণনযোগ্য বিশেষ্যে 's' বা 'a/an' বসে না।",
        examples: ["books, apples", "advice, furniture"],
      },
    ],
    identificationHacks: {
      questionEn: "Answers: 'Who?' or 'What?'",
      questionBn: "প্রশ্ন করুন: 'কে?' বা 'কী?'",
      suffixes: ["-tion", "-ment", "-ness", "-ity", "-ance", "-ence", "-ship", "-hood", "-er", "-or"],
      clueEn: "Notice word endings like education, darkness, movement, leadership, visitor.",
      clueBn: "-tion, -ment, -ness, -ity, -ship ইত্যাদি প্রত্যয় যুক্ত শব্দ সাধারণত Noun হয়।",
    },
    commonTrap: {
      titleEn: "Uncountable Noun Pluralization Trap",
      titleBn: "অগণনযোগ্য বিশেষ্যের ভুল বহুবচন",
      incorrect: "He gave me many useful advices and informations.",
      correct: "He gave me much useful advice and information (or pieces of advice).",
      explanationEn: "Words like advice, information, furniture, scenery, luggage, luggage are uncountable and never take 's/es' or 'many'.",
      explanationBn: "Advice, information, furniture ইত্যাদি শব্দ সর্বদা Uncountable; এদের সাথে 's/es' যোগ করা বা পূর্বে 'many' বসানো ব্যাকরণগত ভুল।",
    },
  },

  pronoun: {
    categoryId: "pronoun",
    orderNumber: 2,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Noun Substitutes: Preventing Repetition & Adding Fluidity",
    headlineBn: "বিশেষ্যের বিকল্প: পুনরাবৃত্তি পরিহার ও ভাষাগত সাবলীলতা",
    overviewEn:
      "A pronoun is a word used in place of a noun or noun phrase to avoid tedious repetition. Pronouns refer back to an antecedent and shift their form depending on their grammatical case (Subjective, Objective, Possessive).",
    overviewBn:
      "বিশেষ্যের (Noun) শ্রুতিকটু পুনরাবৃত্তি পরিহার করতে তার পরিবর্তে ব্যবহৃত শব্দকে Pronoun বা সর্বনাম বলে। এটি বাক্যকে সহজ, প্রাঞ্জল ও গতিশীল করে তোলে।",
    sentenceRoles: [
      {
        roleEn: "Subjective Case",
        roleBn: "কর্তা পদ (Subject)",
        exampleSentence: "She solved the problem independently.",
        targetWord: "She",
      },
      {
        roleEn: "Objective Case",
        roleBn: "কর্ম পদ (Object)",
        exampleSentence: "The teacher congratulated him.",
        targetWord: "him",
      },
      {
        roleEn: "Possessive Case",
        roleBn: "স্বত্বাধিকার পদ",
        exampleSentence: "This masterpiece is ours.",
        targetWord: "ours",
      },
    ],
    keyTypes: [
      {
        nameEn: "Personal Pronoun",
        nameBn: "ব্যক্তিবাচক সর্বনাম",
        descriptionEn: "Refers to specific grammatical persons (1st, 2nd, 3rd person).",
        descriptionBn: "নির্দিষ্ট ব্যক্তি বা বস্তুকে সরাসরি নির্দেশ করে।",
        examples: ["I, we", "you", "he, she, it, they"],
      },
      {
        nameEn: "Possessive Pronoun",
        nameBn: "মালিকানাবোধক সর্বনাম",
        descriptionEn: "Demonstrates ownership without being followed by a noun.",
        descriptionBn: "মালিকানা বোঝায় এবং এর পরে কোনো Noun বসে না।",
        examples: ["mine", "yours", "his", "hers", "theirs"],
      },
      {
        nameEn: "Reflexive & Emphatic",
        nameBn: "আত্মবাচক সর্বনাম",
        descriptionEn: "Reflects back to the subject (myself) or adds emphasis.",
        descriptionBn: "কর্তা নিজেই কাজটির ফলাফল গ্রহণ করলে বা জোর প্রদান করতে ব্যবহৃত হয়।",
        examples: ["myself", "yourself", "himself", "themselves"],
      },
      {
        nameEn: "Relative Pronoun",
        nameBn: "সম্পর্কসূচক সর্বনাম",
        descriptionEn: "Connects a dependent clause to its antecedent noun.",
        descriptionBn: "দুটি বাক্যাংশকে যুক্ত করে এবং পূর্ববর্তী Noun-কে নির্দেশ করে।",
        examples: ["who", "whom", "whose", "which", "that"],
      },
      {
        nameEn: "Demonstrative Pronoun",
        nameBn: "নির্দেশক সর্বনাম",
        descriptionEn: "Points specifically to near or distant objects.",
        descriptionBn: "কাছের বা দূরের ব্যক্তি বা বস্তুকে বিশেষভাবে নির্দেশ করে।",
        examples: ["this", "that", "these", "those"],
      },
      {
        nameEn: "Indefinite Pronoun",
        nameBn: "অনির্দিষ্ট সর্বনাম",
        descriptionEn: "Refers to non-specific people, amounts, or things.",
        descriptionBn: "নির্দিষ্ট কাউকে না বুঝিয়ে সাধারণভাবে কোনো ব্যক্তি বা বস্তুকে বোঝায়।",
        examples: ["everyone", "someone", "nobody", "all", "few"],
      },
    ],
    identificationHacks: {
      questionEn: "Ask: 'Which noun is this word replacing?'",
      questionBn: "প্রশ্ন করুন: 'এই শব্দটি পূর্বে উল্লিখিত কোন বিশেষ্যের পরিবর্তে বসেছে?'",
      clueEn: "Pronouns always replace an antecedent. Note changes: I -> me -> mine; they -> them -> theirs.",
      clueBn: "Pronoun-এর নিজস্ব কোনো অর্থ নেই, এটি তার পূর্ববর্তী বিশেষ্যের (Antecedent) ওপর নির্ভর করে।",
    },
    commonTrap: {
      titleEn: "Prepositional Object Pronoun Case Trap",
      titleBn: "Preposition-এর পর Objective Case ভুল",
      incorrect: "This secret is strictly between you and I.",
      correct: "This secret is strictly between you and me.",
      explanationEn: "Any pronoun following a preposition (like between, to, with, for) must always take the objective case ('me', not 'I').",
      explanationBn: "Preposition-এর পর সর্বদা Pronoun-এর Objective Case বসে ('between you and me', 'between you and I' নয়)।",
    },
  },

  adjective: {
    categoryId: "adjective",
    orderNumber: 3,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Descriptive Modifiers: Adding Quality, Quantity & Precision",
    headlineBn: "গুণবাচক শব্দ: দোষ, গুণ, সংখ্যা, পরিমাণ ও রূপ প্রকাশ",
    overviewEn:
      "An adjective is a modifier that describes, qualifies, or quantifies a noun or pronoun. It enriches language by answering questions like 'What kind?', 'Which one?', 'How many?', or 'How much?'.",
    overviewBn:
      "যে শব্দ কোনো Noun বা Pronoun-এর দোষ, গুণ, অবস্থা, সংখ্যা, পরিমাণ বা বৈশিষ্ট্য প্রকাশ করে, তাকে Adjective বা বিশেষণ বলে। এটি বাক্যকে তথ্যবহুল ও জীবন্ত করে তোলে।",
    sentenceRoles: [
      {
        roleEn: "Attributive Position (Before Noun)",
        roleBn: "বিশেষ্যের পূর্বে অবস্থান",
        exampleSentence: "She presented an innovative idea.",
        targetWord: "innovative",
      },
      {
        roleEn: "Predicative Position (After Linking Verb)",
        roleBn: "Linking Verb-এর পরে অবস্থান",
        exampleSentence: "The explanation seems crystal clear.",
        targetWord: "clear",
      },
      {
        roleEn: "Comparative Degree",
        roleBn: "তুলনামূলক রূপ",
        exampleSentence: "This strategy is more effective.",
        targetWord: "effective",
      },
    ],
    keyTypes: [
      {
        nameEn: "Adjective of Quality",
        nameBn: "গুণবাচক বিশেষণ",
        descriptionEn: "Describes nature, character, color, or condition of nouns.",
        descriptionBn: "বিশেষ্যের দোষ, গুণ, রূপ, রং বা অবস্থা প্রকাশ করে।",
        examples: ["brilliant", "honest", "courageous", "fragile"],
      },
      {
        nameEn: "Adjective of Quantity",
        nameBn: "পরিমাণবাচক বিশেষণ",
        descriptionEn: "Indicates non-exact amounts of uncountable nouns.",
        descriptionBn: "অগণনযোগ্য বস্তুর পরিমাণ নির্দেশ করে।",
        examples: ["much", "little", "some", "enough", "whole"],
      },
      {
        nameEn: "Adjective of Number",
        nameBn: "সংখ্যাবাচক বিশেষণ",
        descriptionEn: "Shows precise count or order of countable items.",
        descriptionBn: "গণনাযোগ্য বস্তুর সুনির্দিষ্ট সংখ্যা বা ক্রম নির্দেশ করে।",
        examples: ["five", "several", "first", "double", "many"],
      },
      {
        nameEn: "Demonstrative Adjective",
        nameBn: "নির্দেশক বিশেষণ",
        descriptionEn: "Precedes nouns to point out specific entities.",
        descriptionBn: "কোনো Noun-এর পূর্বে বসে তাকে সুনির্দিষ্ট করে।",
        examples: ["this problem", "that car", "those students"],
      },
      {
        nameEn: "Possessive Adjective",
        nameBn: "স্বত্বাধিকার বিশেষণ",
        descriptionEn: "Precedes nouns to show ownership.",
        descriptionBn: "Noun-এর পূর্বে বসে তার মালিকানা নির্দেশ করে।",
        examples: ["my goal", "our country", "their victory"],
      },
      {
        nameEn: "Degrees of Comparison",
        nameBn: "তুলনার মাত্রা (Degree)",
        descriptionEn: "Positive (tall), Comparative (taller), Superlative (tallest).",
        descriptionBn: "সাধারণ রূপ, দুজনের তুলনা এবং সবার মাঝে তুলনা।",
        examples: ["fast", "faster", "fastest"],
      },
    ],
    identificationHacks: {
      questionEn: "Answers: 'What kind?' 'Which one?' 'How many?'",
      questionBn: "প্রশ্ন করুন: 'কেমন?' 'কোনটি?' 'কতটি?' 'কতটুকু?'",
      suffixes: ["-ful", "-less", "-able", "-ible", "-ive", "-ous", "-al", "-ic", "-ish", "-y"],
      clueEn: "Endings like beautiful, harmless, readable, active, dangerous, logical.",
      clueBn: "-ful, -less, -able, -ive, -ous, -ic ইত্যাদি প্রত্যয় যুক্ত শব্দ সাধারণত Adjective হয়।",
    },
    commonTrap: {
      titleEn: "Double Comparative / Superlative Trap",
      titleBn: "দ্বৈত তুলনার ভুল প্রয়োগ",
      incorrect: "He is more taller than his brother, and this is the most unique idea.",
      correct: "He is taller than his brother, and this is a unique idea.",
      explanationEn: "Never combine 'more' with '-er' or 'most' with '-est'. Also, absolute adjectives like 'unique', 'perfect', 'dead' cannot take comparative degrees.",
      explanationBn: "একসাথে 'more' এবং '-er' ব্যবহার করা ভুল। তাছাড়া 'unique', 'perfect' ইত্যাদি শব্দের পূর্বে 'more/most' বসে না।",
    },
  },

  verb: {
    categoryId: "verb",
    orderNumber: 4,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Action & State Engine: The Heartbeat of the Sentence",
    headlineBn: "কাজ ও অবস্থার মূল ইঞ্জিন: বাক্যের অপরিহার্য চালিকাশক্তি",
    overviewEn:
      "A verb is the indispensable core of every sentence or clause. It expresses an action, a state of being, an occurrence, or possession. In English, a grammatically complete thought cannot exist without a finite verb.",
    overviewBn:
      "Verb হলো বাক্যের প্রাণকেন্দ্র বা মূল চালিকাশক্তি। যে শব্দ দ্বারা কোনো কাজ করা, হওয়া, থাকা, ঘটা বা কোনো অবস্থার প্রকাশ ঘটে, তাকে Verb বা ক্রিয়া বলে। সমাপিকা ক্রিয়া (Finite verb) ছাড়া কোনো পূর্ণ বাক্য গঠিত হতে পারে না।",
    sentenceRoles: [
      {
        roleEn: "Action Predicate",
        roleBn: "কর্ম ক্রিয়া (Action)",
        exampleSentence: "The team developed a robust system.",
        targetWord: "developed",
      },
      {
        roleEn: "Linking State of Being",
        roleBn: "সংযোগকারী অবস্থা (Linking)",
        exampleSentence: "The solution seems extraordinarily brilliant.",
        targetWord: "seems",
      },
      {
        roleEn: "Auxiliary Helping Verb",
        roleBn: "সাহায্যকারী ক্রিয়া (Auxiliary)",
        exampleSentence: "They have completed their mission.",
        targetWord: "have",
      },
    ],
    keyTypes: [
      {
        nameEn: "Action / Dynamic Verbs",
        nameBn: "সক্রিয় ক্রিয়া (Action)",
        descriptionEn: "Expresses physical movement or observable activity.",
        descriptionBn: "সরাসরি কোনো শারীরিক বা ইন্দ্রিয়গ্রাহ্য কাজ প্রকাশ করে।",
        examples: ["write", "construct", "sprint", "discover"],
      },
      {
        nameEn: "Stative & Linking Verbs",
        nameBn: "অবস্থাসূচক ও সংযোগকারী ক্রিয়া",
        descriptionEn: "Expresses states, senses, or links subject to its complement.",
        descriptionBn: "কোনো কাজ না বুঝিয়ে অবস্থা বা অনুভূতি নির্দেশ করে।",
        examples: ["be", "seem", "taste", "feel", "become"],
      },
      {
        nameEn: "Transitive & Intransitive",
        nameBn: "সকর্মক ও অকর্মক ক্রিয়া",
        descriptionEn: "Transitive requires an object; intransitive makes sense alone.",
        descriptionBn: "সকর্মক ক্রিয়ার কর্ম (Object) থাকে; অকর্মক ক্রিয়ার কর্মের প্রয়োজন হয় না।",
        examples: ["read (a book)", "sleep, arrive"],
      },
      {
        nameEn: "Primary Auxiliaries",
        nameBn: "প্রাথমিক সাহায্যকারী ক্রিয়া",
        descriptionEn: "Be, Do, Have verbs used to build tenses, negatives, and questions.",
        descriptionBn: "টেন্স, প্রশ্ন ও নাবোধক বাক্য তৈরিতে ব্যবহৃত হয় (Be, Do, Have)।",
        examples: ["am, is, was", "do, did", "have, had"],
      },
      {
        nameEn: "Modal Auxiliaries",
        nameBn: "ভাবপ্রকাশক সাহায্যকারী ক্রিয়া",
        descriptionEn: "Expresses ability, permission, obligation, possibility, or advice.",
        descriptionBn: "সামর্থ্য, অনুমতি, বাধ্যবাধকতা বা সম্ভাবনা প্রকাশ করে।",
        examples: ["can, could", "may, might", "must, should"],
      },
      {
        nameEn: "Finite vs Non-Finite",
        nameBn: "সমাপিকা বনাম অসমাপিকা ক্রিয়া",
        descriptionEn: "Finite changes with tense and person; Non-finite (infinitives, gerunds) does not.",
        descriptionBn: "Finite verb টেন্স ও পারসন অনুযায়ী পরিবর্তিত হয়; Non-finite verb অপরিবর্তিত থাকে।",
        examples: ["he works", "to learn, learning"],
      },
    ],
    identificationHacks: {
      questionEn: "Answers: 'What is the subject doing or experiencing?'",
      questionBn: "প্রশ্ন করুন: 'কর্তা কী করছে বা কী অবস্থায় আছে?'",
      suffixes: ["-ate", "-en", "-ify", "-ize", "en-"],
      clueEn: "Verbs can change into past tense (-ed) and continuous form (-ing). Suffixes: shorten, activate, simplify, recognize.",
      clueBn: "Verb একমাত্র পদ যার Past Tense ও -ing রূপ হয়। -en, -ate, -ify প্রত্যয় যুক্ত শব্দও সাধারণত Verb হয়।",
    },
    commonTrap: {
      titleEn: "Subject-Verb Agreement with Intervening Phrases",
      titleBn: "মাঝের শব্দাংশজনিত সাবজেক্ট-ভার্ব এগ্রিমেন্ট ভুল",
      incorrect: "The quality of these organic mangoes are exceptional.",
      correct: "The quality of these organic mangoes is exceptional.",
      explanationEn: "The subject is 'quality' (singular), not 'mangoes'. Words between the subject and verb never change the number of the verb.",
      explanationBn: "বাক্যের আসল Subject হলো 'quality' (একবচন), 'mangoes' নয়। তাই Verb অবশ্যই singular ('is') হবে।",
    },
  },

  adverb: {
    categoryId: "adverb",
    orderNumber: 5,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Contextual Modifiers: Manner, Time, Place & Degree",
    headlineBn: "ক্রিয়াবিশেষণ: কাজের ধরন, সময়, স্থান ও তীব্রতার প্রকাশক",
    overviewEn:
      "An adverb is a flexible modifier that qualifies or intensifies a verb, an adjective, another adverb, or even an entire clause. It delivers context by answering 'How?', 'When?', 'Where?', 'Why?', or 'To what degree?'.",
    overviewBn:
      "যে শব্দ কোনো Verb, Adjective বা অন্য কোনো Adverb-এর মাত্রা, সময়, স্থান, ধরন বা কারণ নির্দেশ করে তার অর্থকে বিশেষায়িত করে, তাকে Adverb বা ক্রিয়া বিশেষণ বলে।",
    sentenceRoles: [
      {
        roleEn: "Modifying a Verb (Manner)",
        roleBn: "Verb-কে বিশেষায়িত করা",
        exampleSentence: "She articulated her ideas clearly.",
        targetWord: "clearly",
      },
      {
        roleEn: "Modifying an Adjective (Degree)",
        roleBn: "Adjective-এর মাত্রা বৃদ্ধি",
        exampleSentence: "The problem was incredibly complex.",
        targetWord: "incredibly",
      },
      {
        roleEn: "Modifying Another Adverb",
        roleBn: "অন্য Adverb-কে বিশেষায়িত করা",
        exampleSentence: "He spoke very softly.",
        targetWord: "very",
      },
    ],
    keyTypes: [
      {
        nameEn: "Adverb of Manner",
        nameBn: "পদ্ধতি বা ধরণবাচক Adverb",
        descriptionEn: "Describes how an action is performed. Usually answers 'How?'.",
        descriptionBn: "কোনো কাজ কীভাবে সম্পন্ন হয় তা নির্দেশ করে।",
        examples: ["swiftly", "bravely", "gracefully", "loudly"],
      },
      {
        nameEn: "Adverb of Time",
        nameBn: "সময়বাচক Adverb",
        descriptionEn: "Tells when an action takes place. Answers 'When?'.",
        descriptionBn: "কাজটি কখন সম্পন্ন হয় তা প্রকাশ করে।",
        examples: ["yesterday", "now", "soon", "already", "daily"],
      },
      {
        nameEn: "Adverb of Place",
        nameBn: "স্থানবাচক Adverb",
        descriptionEn: "Indicates where the action happens. Answers 'Where?'.",
        descriptionBn: "কাজটি কোথায় সম্পন্ন হয় তা নির্দেশ করে।",
        examples: ["here", "everywhere", "outside", "underground"],
      },
      {
        nameEn: "Adverb of Degree",
        nameBn: "মাত্রাবাচক Adverb",
        descriptionEn: "Specifies intensity or extent. Answers 'To what extent?'.",
        descriptionBn: "কোনো গুণের বা কাজের তীব্রতা ও মাত্রা বোঝায়।",
        examples: ["very", "extremely", "almost", "quite", "too"],
      },
      {
        nameEn: "Adverb of Frequency",
        nameBn: "পুনরাবৃত্তিবোধক Adverb",
        descriptionEn: "Indicates how often something happens. Answers 'How often?'.",
        descriptionBn: "কাজটি কত ঘন ঘন ঘটে তা প্রকাশ করে।",
        examples: ["always", "often", "rarely", "seldom", "never"],
      },
    ],
    identificationHacks: {
      questionEn: "Answers: 'How?' 'When?' 'Where?' 'To what degree?'",
      questionBn: "প্রশ্ন করুন: 'কীভাবে?' 'কখন?' 'কোথায়?' 'কতটুকু?'",
      suffixes: ["-ly", "-ward", "-wise"],
      clueEn: "Many adverbs end in -ly (patiently, quietly), but look out for irregulars like fast, hard, well, late.",
      clueBn: "অধিকাংশ Adverb-এর শেষে -ly থাকে। তবে fast, hard, well ইত্যাদি -ly ছাড়াও Adverb হয়।",
    },
    commonTrap: {
      titleEn: "Adjective with '-ly' Confusion Trap",
      titleBn: "'-ly' যুক্ত Adjective-কে Adverb মনে করার ভুল",
      incorrect: "He smiled friendly at the new colleague.",
      correct: "He smiled in a friendly manner (or friendly way) at the new colleague.",
      explanationEn: "Words like friendly, lovely, lonely, silly, elderly end in '-ly' but are ADJECTIVES, not adverbs. To use them adverbially, say 'in a friendly manner'.",
      explanationBn: "Friendly, lovely, lonely শব্দগুলো দেখতে Adverb মনে হলেও আসলে Adjective। তাই এদের Adverbial রূপ হিসেবে 'in a friendly manner' লিখতে হয়।",
    },
  },

  preposition: {
    categoryId: "preposition",
    orderNumber: 6,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Relational Connectors: Time, Place, Direction & Context",
    headlineBn: "সম্পর্কসূচক অব্যয়: স্থান, কাল, দিক ও অবস্থানের নির্দেশক",
    overviewEn:
      "A preposition is a relationship-builder placed before a noun or pronoun (its object) to map its position, timing, movement, or conceptual connection to other elements in the sentence.",
    overviewBn:
      "যে শব্দ কোনো Noun বা Pronoun-এর পূর্বে বসে বাক্যের অন্যান্য শব্দের সাথে তার অবস্থান, সময়, দিক বা সম্পর্ক নির্দেশ করে, তাকে Preposition বা পদান্বয়ী অব্যয় বলে।",
    sentenceRoles: [
      {
        roleEn: "Spatial Location",
        roleBn: "স্থান ও অবস্থান",
        exampleSentence: "The documents are inside the cabinet.",
        targetWord: "inside",
      },
      {
        roleEn: "Temporal Point",
        roleBn: "সময় নির্দেশক",
        exampleSentence: "The lecture commences at 10:00 AM.",
        targetWord: "at",
      },
      {
        roleEn: "Directional Movement",
        roleBn: "দিক ও গতি",
        exampleSentence: "She walked across the historic bridge.",
        targetWord: "across",
      },
    ],
    keyTypes: [
      {
        nameEn: "Preposition of Time",
        nameBn: "সময়বাচক Preposition",
        descriptionEn: "At (exact clock time), On (days/dates), In (months/years/seasons).",
        descriptionBn: "সুনির্দিষ্ট সময় (at), দিন/তারিখ (on), এবং মাস/বছর/ঋতু (in)।",
        examples: ["at 5 PM", "on Monday", "in 2026", "during winter"],
      },
      {
        nameEn: "Preposition of Place",
        nameBn: "স্থানবাচক Preposition",
        descriptionEn: "In (enclosed space), On (surface contact), At (specific point).",
        descriptionBn: "কোনো স্থানের ভেতরে (in), তলের ওপর (on), বা সুনির্দিষ্ট বিন্দুতে (at)।",
        examples: ["in the room", "on the table", "at the airport"],
      },
      {
        nameEn: "Preposition of Direction",
        nameBn: "দিক ও গতিবাচক Preposition",
        descriptionEn: "Shows movement into, out of, toward, or across a space.",
        descriptionBn: "কোনো দিকে বা ভেতর দিয়ে গতিশীলতা প্রকাশ করে।",
        examples: ["into the cave", "towards the shore", "through the gate"],
      },
      {
        nameEn: "Compound & Phrasal",
        nameBn: "যৌগিক Preposition",
        descriptionEn: "Multi-word units acting as a single cohesive preposition.",
        descriptionBn: "একাধিক শব্দের সমন্বয়ে গঠিত Preposition।",
        examples: ["in front of", "according to", "in spite of", "because of"],
      },
    ],
    identificationHacks: {
      questionEn: "Look for: 'Preposition + Noun/Pronoun Object'",
      questionBn: "চিহ্নিত করুন: Preposition-এর ঠিক পরেই একটি Noun বা Pronoun থাকে।",
      clueEn: "If a preposition does not have an object, it usually transforms into an adverb (e.g. 'Come in' is adverb; 'Come in the room' is preposition).",
      clueBn: "Preposition-এর পর কোনো Object না থাকলে শব্দটি Adverb হয়ে যায় (যেমন: 'Come in' -> in হলো Adverb)।",
    },
    commonTrap: {
      titleEn: "Between vs. Among Distinction Trap",
      titleBn: "Between ও Among-এর ভুল প্রয়োগ",
      incorrect: "Distribute the prizes between all the participants in the room.",
      correct: "Distribute the prizes among all the participants in the room.",
      explanationEn: "Use 'between' when naming distinct, individual items (often two); use 'among' when referring to three or more collective group members.",
      explanationBn: "দুইজন ব্যক্তি বা নির্দিষ্ট বস্তুর ক্ষেত্রে 'between' এবং দুইয়ের অধিকের সমষ্টিগত দলের ক্ষেত্রে 'among' বসে।",
    },
  },

  conjunction: {
    categoryId: "conjunction",
    orderNumber: 7,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Syntactic Bridges: Uniting Words, Phrases & Clauses",
    headlineBn: "সংযোজক অব্যয়: শব্দ, পদগুচ্ছ ও বাক্যাংশের মধ্যকার সেতুবন্ধন",
    overviewEn:
      "A conjunction is a syntactic bridge that connects words, phrases, or clauses together. Conjunctions establish logical relationships such as addition, contrast, alternative, causality, condition, or concession.",
    overviewBn:
      "যে শব্দ একাধিক শব্দ, পদগুচ্ছ (Phrases) বা বাক্যাংশকে (Clauses) পরস্পর যুক্ত করে এবং তাদের মাঝে সংযোগ, বৈপরীত্য, কারণ বা শর্তমূলক সম্পর্ক স্থাপন করে, তাকে Conjunction বা সংযোজক অব্যয় বলে।",
    sentenceRoles: [
      {
        roleEn: "Connecting Words",
        roleBn: "শব্দ যুক্ত করা",
        exampleSentence: "Simplicity and elegance define this architecture.",
        targetWord: "and",
      },
      {
        roleEn: "Coordinating Clauses (Contrast)",
        roleBn: "সমমর্যাদার ক্লজ যুক্ত করা",
        exampleSentence: "He studied diligently, yet he felt anxious.",
        targetWord: "yet",
      },
      {
        roleEn: "Subordinating Clause (Cause)",
        roleBn: "কারণসূচক সাবর্ডিনেট ক্লজ",
        exampleSentence: "We succeeded because everyone cooperated.",
        targetWord: "because",
      },
    ],
    keyTypes: [
      {
        nameEn: "Coordinating Conjunctions (FANBOYS)",
        nameBn: "কো-অর্ডিনেটিং কনজাংশন",
        descriptionEn: "Joins equal grammatical units: For, And, Nor, But, Or, Yet, So.",
        descriptionBn: "সমান ব্যাকরণগত মর্যাদার ক্লজ বা শব্দকে যুক্ত করে (FANBOYS)।",
        examples: ["and", "but", "or", "yet", "so"],
      },
      {
        nameEn: "Subordinating Conjunctions",
        nameBn: "সাবর্ডিনেটিং কনজাংশন",
        descriptionEn: "Connects a dependent clause to an independent clause.",
        descriptionBn: "প্রধান বাক্যের সাথে অপ্রধান শর্ত বা কারণমূলক বাক্য যুক্ত করে।",
        examples: ["because", "although", "since", "if", "unless", "while"],
      },
      {
        nameEn: "Correlative Conjunctions",
        nameBn: "যুগ্ম বা জোড়াবদ্ধ কনজাংশন",
        descriptionEn: "Paired conjunctions working together to link parallel elements.",
        descriptionBn: "জোড়ায় জোড়ায় ব্যবহৃত হয় এবং সমান্তরাল পদ যুক্ত করে।",
        examples: ["either...or", "neither...nor", "not only...but also", "both...and"],
      },
    ],
    identificationHacks: {
      questionEn: "Look for logical operator signals: + (and), ≠ (but), ? (or), -> (so/because)",
      questionBn: "চিহ্নিত করুন: সংযোগ (+), বৈপরীত্য (≠), বিকল্প (?), নাকি কারণ (->)?",
      clueEn: "Remember the FANBOYS acronym for coordinating conjunctions: For, And, Nor, But, Or, Yet, So.",
      clueBn: "FANBOYS ছন্দটি মনে রাখুন: For, And, Nor, But, Or, Yet, So।",
    },
    commonTrap: {
      titleEn: "Double Connector Redundancy Trap",
      titleBn: "একই বাক্যে দ্বৈত কনজাংশনের বাহুল্য দোষ",
      incorrect: "Although he was exhausted, but he finished the assignment.",
      correct: "Although he was exhausted, he finished the assignment.",
      explanationEn: "Never use 'although/even though' and 'but' in the same sentence. One subordinating conjunction is fully sufficient.",
      explanationBn: "একই বাক্যে 'Although' এবং 'But' একসাথে ব্যবহার করা মারাত্মক ভুল। যেকোনো একটি ব্যবহার করতে হবে।",
    },
  },

  interjection: {
    categoryId: "interjection",
    orderNumber: 8,
    parentSectionId: "parts-of-speech",
    parentSectionNameEn: "Parts of Speech",
    parentSectionNameBn: "পদ প্রকরণ",
    headlineEn: "Emotional Exclamations: Spontaneous Bursts of Feeling",
    headlineBn: "আবেগসূচক অব্যয়: আকস্মিক আনন্দ, বেদনা, বিস্ময় ও উচ্ছ্বাসের প্রকাশ",
    overviewEn:
      "An interjection is an expressive word or short phrase used to convey sudden, spontaneous emotion such as joy, surprise, pain, sorrow, excitement, or hesitation. It stands grammatically independent of the rest of the sentence.",
    overviewBn:
      "যে শব্দ বাক্যের অন্য কোনো পদের সাথে ব্যাকরণগত সম্পর্ক না রেখে কেবল বক্তার আকস্মিক ও প্রবল আবেগ, আনন্দ, বেদনা, বিস্ময়, ভয় বা উচ্ছ্বাস প্রকাশ করে, তাকে Interjection বা আবেগসূচক অব্যয় বলে।",
    sentenceRoles: [
      {
        roleEn: "Strong Emotion (Exclamatory)",
        roleBn: "প্রবল আবেগ বা উল্লাস",
        exampleSentence: "Bravo! You executed the strategy flawlessly.",
        targetWord: "Bravo!",
      },
      {
        roleEn: "Sorrow / Grief",
        roleBn: "দুঃখ বা আক্ষেপ",
        exampleSentence: "Alas! The legendary monument has fallen.",
        targetWord: "Alas!",
      },
      {
        roleEn: "Mild Emotion (Conversational)",
        roleBn: "মৃদু অনুভূতি বা সম্মতি",
        exampleSentence: "Well, that turned out surprisingly well.",
        targetWord: "Well,",
      },
    ],
    keyTypes: [
      {
        nameEn: "Joy & Celebration",
        nameBn: "আনন্দ ও উল্লাস",
        descriptionEn: "Expresses happiness, victory, or excitement.",
        descriptionBn: "জয়, আনন্দ বা উৎসবের উল্লাস প্রকাশ করে।",
        examples: ["Hurrah!", "Yay!", "Bravo!", "Yippee!"],
      },
      {
        nameEn: "Sorrow & Grief",
        nameBn: "দুঃখ ও শোক",
        descriptionEn: "Conveys sadness, regret, or misfortune.",
        descriptionBn: "শোক, কষ্ট বা দুর্ভাগ্য প্রকাশে ব্যবহৃত হয়।",
        examples: ["Alas!", "Oh no!", "Ah!"],
      },
      {
        nameEn: "Surprise & Wonder",
        nameBn: "বিস্ময় ও চমক",
        descriptionEn: "Expresses unexpected amazement or shock.",
        descriptionBn: "আকস্মিক চমক বা বিস্ময় প্রকাশ করে।",
        examples: ["Wow!", "What!", "Good heavens!", "Gosh!"],
      },
      {
        nameEn: "Attention & Greeting",
        nameBn: "মনোযোগ আকর্ষণ ও সম্ভাষণ",
        descriptionEn: "Calls for silence or greets someone spontaneously.",
        descriptionBn: "কাউকে ডাকা, সম্ভাষণ জানানো বা নীরবতা আহ্বান করা।",
        examples: ["Hush!", "Listen!", "Hey!", "Hello!"],
      },
    ],
    identificationHacks: {
      questionEn: "Identified by punctuation: Followed by '!' or ','",
      questionBn: "চেনার উপায়: প্রায়শই বিস্ময়সূচক চিহ্ন (!) বা কমা (,) দ্বারা সমাপ্ত হয়।",
      clueEn: "Interjections have no grammatical ties to the subject or verb and can be removed without breaking sentence structure.",
      clueBn: "বাক্য থেকে Interjection বাদ দিলেও বাক্যের ব্যাকরণগত কাঠামো ভেঙে পড়ে না।",
    },
    commonTrap: {
      titleEn: "Formal Academic Overuse Trap",
      titleBn: "ফরমাল লেখায় অপরিমিত প্রয়োগের ভুল",
      incorrect: "Ouch! The inflation rate increased significantly last quarter.",
      correct: "The inflation rate increased significantly last quarter.",
      explanationEn: "Interjections are designed for dialogue, creative writing, and spoken English. Avoid them in formal essays, reports, and professional exams.",
      explanationBn: "Interjection মূলত কথোপকথন ও সাহিত্যের অলঙ্কার; ফরমাল রিপোর্ট, পরীক্ষার প্রবন্ধ বা একাডেমিক লেখায় এটি ব্যবহার বর্জনীয়।",
    },
  },
};
