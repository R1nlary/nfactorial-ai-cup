import { describe, it, expect } from "vitest";
import { detectSlop, cleanSlop, BANNED_PHRASES } from "../anti-slop";

describe("detectSlop", () => {
  it("returns score 0 and empty array for clean text", () => {
    const result = detectSlop("This is a normal sentence about programming.");
    expect(result.score).toBe(0);
    expect(result.found).toEqual([]);
  });

  it("detects a single banned phrase", () => {
    const result = detectSlop("Let's delve into the topic of AI.");
    expect(result.found).toContain("delve");
    expect(result.score).toBe(15);
  });

  it("detects multiple banned phrases", () => {
    const result = detectSlop(
      "Let's delve into this vibrant tapestry of comprehensive innovation."
    );
    expect(result.found).toContain("delve");
    expect(result.found).toContain("vibrant");
    expect(result.found).toContain("tapestry");
    expect(result.found).toContain("comprehensive");
    expect(result.found.length).toBe(4);
    expect(result.score).toBe(60);
  });

  it("caps score at 100", () => {
    const slopText = BANNED_PHRASES.slice(0, 10).join(" ");
    const result = detectSlop(slopText);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("is case-insensitive", () => {
    const result = detectSlop("This is a GAME-CHANGER for the industry.");
    expect(result.found).toContain("game-changer");
  });

  it("detects multi-word phrases", () => {
    const result = detectSlop("It's worth noting that we should navigate the complexities.");
    expect(result.found).toContain("it's worth noting");
    expect(result.found).toContain("navigate the complexities");
  });
});

describe("cleanSlop", () => {
  it("returns clean text unchanged", () => {
    const text = "This is a normal sentence.";
    expect(cleanSlop(text)).toBe(text);
  });

  it("replaces banned phrases with substitutes", () => {
    const result = cleanSlop("We should delve into this topic.");
    expect(result).toContain("explore");
    expect(result).not.toContain("delve");
  });

  it("removes phrases with empty replacements", () => {
    const result = cleanSlop("It's worth noting that AI is useful.");
    expect(result).not.toContain("it's worth noting");
    expect(result).toContain("AI is useful");
  });

  it("handles multiple phrases in one text", () => {
    const result = cleanSlop(
      "This game-changer will revolutionize how we leverage AI."
    );
    expect(result).not.toContain("game-changer");
    expect(result).not.toContain("revolutionize");
    expect(result).not.toContain("leverage");
  });

  it("is case-insensitive when replacing", () => {
    const result = cleanSlop("We need to STREAMLINE this process.");
    expect(result.toLowerCase()).toContain("simplify");
    expect(result.toLowerCase()).not.toContain("streamline");
  });

  it("preserves surrounding text when removing phrases", () => {
    const result = cleanSlop("The robust system works well.");
    expect(result).toContain("solid");
    expect(result).toContain("system works well");
  });
});

describe("BANNED_PHRASES", () => {
  it("has at least 40 phrases", () => {
    expect(BANNED_PHRASES.length).toBeGreaterThanOrEqual(40);
  });

  it("contains common AI slop terms", () => {
    expect(BANNED_PHRASES).toContain("delve");
    expect(BANNED_PHRASES).toContain("game-changer");
    expect(BANNED_PHRASES).toContain("paradigm shift");
  });

  it("has all lowercase entries", () => {
    for (const phrase of BANNED_PHRASES) {
      expect(phrase).toBe(phrase.toLowerCase());
    }
  });
});
