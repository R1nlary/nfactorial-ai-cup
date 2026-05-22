export const BANNED_PHRASES = [
  "delve",
  "tapestry",
  "vibrant",
  "landscape",
  "comprehensive",
  "game-changer",
  "it's worth noting",
  "in today's fast-paced",
  "at the end of the day",
  "let's unpack",
  "deep dive",
  "revolutionize",
  "paradigm shift",
  "synergy",
  "leverage",
  "cutting-edge",
  "groundbreaking",
  "innovative solution",
  "seamlessly",
  "robust",
  "holistic",
  "pivotal",
  "foster",
  "navigate the complexities",
  "in the realm of",
  "fascinating",
  "remarkable",
  "transformative",
  "empower",
  "unlock",
  "elevate",
  "harness",
  "streamline",
  "spearhead",
  "it goes without saying",
  "in an ever-evolving",
  "shaping the future",
  "at the forefront",
  "bridging the gap",
  "unprecedented",
  "nuanced understanding",
  "thought-provoking",
  "multifaceted",
  "embark on a journey",
  "beacon of",
  "testament to",
];

export function detectSlop(text: string): { score: number; found: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }

  const score = Math.min(100, found.length * 15);
  return { score, found };
}

export function cleanSlop(text: string): string {
  const { found } = detectSlop(text);
  let cleaned = text;

  const replacements: Record<string, string> = {
    delve: "explore",
    tapestry: "mix",
    vibrant: "active",
    landscape: "space",
    comprehensive: "complete",
    "game-changer": "shift",
    "it's worth noting": "",
    "in today's fast-paced": "",
    "at the end of the day": "",
    "let's unpack": "",
    "deep dive": "look at",
    revolutionize: "change",
    "paradigm shift": "shift",
    synergy: "fit",
    leverage: "use",
    "cutting-edge": "new",
    groundbreaking: "important",
    "innovative solution": "new approach",
    seamlessly: "",
    robust: "solid",
    holistic: "complete",
    pivotal: "key",
    foster: "build",
    "navigate the complexities": "work through",
    "in the realm of": "in",
    fascinating: "interesting",
    remarkable: "notable",
    transformative: "big",
    empower: "help",
    unlock: "open",
    elevate: "raise",
    harness: "use",
    streamline: "simplify",
    spearhead: "lead",
  };

  for (const phrase of found) {
    const replacement = replacements[phrase] ?? "";
    if (replacement) {
      cleaned = cleaned.replace(new RegExp(phrase, "gi"), replacement);
    } else {
      cleaned = cleaned.replace(new RegExp(`\\b${phrase}\\b[,]?\\s*`, "gi"), "");
    }
  }

  return cleaned.trim();
}
