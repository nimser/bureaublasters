import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { ROOT, loadEffects } from "./generate.ts";
import { RATE, RENDERS, encode, render, synthesised } from "./synth.ts";

const effect = (name: string) => loadEffects(ROOT).find(entry => entry.name === name)!;
const pcm = (wav: Buffer) => Array.from({ length: (wav.length - 44) / 2 }, (_, i) => wav.readInt16LE(44 + i * 2));

// 10 ms RMS frames; an onset is a frame at least 2.2 times louder than 30 ms earlier.
function onsets(samples: Float64Array): number[] {
  const hop = RATE / 100;
  const frames: number[] = [];
  for (let i = 0; i + hop <= samples.length; i += hop) {
    let energy = 0;
    for (let j = i; j < i + hop; j++) energy += samples[j]! ** 2;
    frames.push(Math.sqrt(energy / hop));
  }
  const top = Math.max(...frames);
  const found: number[] = [];
  for (let i = 3; i < frames.length; i++) {
    if (frames[i]! > top * 0.12 && frames[i]! > Math.max(frames[i - 3]!, 1e-6) * 2.2 && (!found.length || i - found.at(-1)! > 6)) found.push(i);
  }
  return found;
}

describe("synthèse des sources", () => {
  test("chaque effet configuré a une recette et un fichier conforme à celle-ci", () => {
    const sources = synthesised(ROOT);
    expect(sources.map(source => source.effect.name).sort()).toEqual(Object.keys(RENDERS).sort());
    for (const { effect: entry, path } of sources) {
      const expected = pcm(encode(render(entry.name, entry.durationSeconds, entry.loop)));
      const actual = pcm(readFileSync(path));
      expect(actual.length).toBe(Math.round(entry.durationSeconds * RATE));
      expect(Math.max(...actual.map((value, i) => Math.abs(value - expected[i]!)))).toBeLessThanOrEqual(1);
    }
  });

  test("le rendu est déterministe", () => {
    for (const name of Object.keys(RENDERS)) expect(encode(render(name, 1))).toEqual(encode(render(name, 1)));
  });

  test("les sons ponctuels commencent et finissent au silence", () => {
    for (const { effect: entry } of synthesised(ROOT).filter(source => !source.effect.loop)) {
      const samples = render(entry.name, entry.durationSeconds);
      expect(Math.abs(samples[0]!)).toBeLessThan(1e-3);
      expect(Math.abs(samples.at(-1)!)).toBe(0);
    }
  });

  test("le jingle du fumigène contient exactement trois notes", () => {
    const entry = effect("jingle-brume");
    expect(onsets(render(entry.name, entry.durationSeconds))).toHaveLength(3);
  });

  test("le bourdonnement se raccorde exactement sur sa durée", () => {
    const entry = effect("bourdonnement-orbe");
    const length = Math.round(entry.durationSeconds * RATE);
    const longer = RENDERS[entry.name]!(length + 64);
    for (let i = 0; i < 64; i++) expect(Math.abs(longer[length + i]! - longer[i]!)).toBeLessThan(1e-9);
  });
});
