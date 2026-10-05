import { describe, expect, it } from "vitest";
import { JOWLS, NECKS, isJowlGrade, isNeckType, lowerFaceProfile } from "@/lib/lower-face-profile";
import { RESULT_SCHEMA } from "@/lib/prompts/result-schema";

const base = { usedPhoto: true, framingAdequate: true, lowerFaceObscured: false };

describe("lower-face profile", () => {
  it("returns the jowl and neck entries for a readable photo", () => {
    const p = lowerFaceProfile({ ...base, jowlGrade: "moderate", neckType: "mixed" });
    expect(p.jowls?.name).toBe("Moderate jowl formation");
    expect(p.jowls?.fit).toBe("strong");
    expect(p.neck?.name).toBe("Combined laxity and fullness");
  });

  it("hides an area the AI could not read", () => {
    const p = lowerFaceProfile({ ...base, jowlGrade: "mild", neckType: "unclear" });
    expect(p.jowls).not.toBeNull();
    expect(p.neck).toBeNull();
  });

  it("shows nothing for a beard, unreadable photo or no photo", () => {
    for (const r of [
      { ...base, lowerFaceObscured: true },
      { ...base, framingAdequate: false },
      { ...base, usedPhoto: false },
    ]) {
      expect(lowerFaceProfile({ ...r, jowlGrade: "moderate", neckType: "skin_laxity" })).toEqual({ jowls: null, neck: null });
    }
  });

  it("sends advanced jowls and neck bands to the doctor rather than overselling", () => {
    expect(JOWLS.advanced.fit).toBe("review");
    expect(NECKS.banding.fit).toBe("partial");
  });

  it("validates values and requires both fields in Claude's schema", () => {
    expect(isJowlGrade("moderate")).toBe(true);
    expect(isJowlGrade("severe")).toBe(false);
    expect(isNeckType("submental_fullness")).toBe(true);
    expect(isNeckType("turkey")).toBe(false);
    expect(RESULT_SCHEMA.required).toEqual(expect.arrayContaining(["jowlGrade", "neckType"]));
  });
});
