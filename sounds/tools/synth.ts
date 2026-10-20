import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, loadEffects } from "./generate.ts";

export const RATE = 44100;
const TAU = 2 * Math.PI;
type Render = (length: number) => Float64Array;

// Deterministic PRNG so every rebuild yields the same noise.
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

class Biquad {
  private b0 = 0; private b1 = 0; private b2 = 0; private a1 = 0; private a2 = 0;
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  constructor(private kind: "lowpass" | "highpass" | "bandpass", frequency: number, private q = 0.707) { this.tune(frequency); }

  tune(frequency: number): void {
    const w = TAU * Math.min(frequency, RATE * 0.45) / RATE;
    const alpha = Math.sin(w) / (2 * this.q);
    const cos = Math.cos(w);
    const a0 = 1 + alpha;
    if (this.kind === "bandpass") { this.b0 = alpha / a0; this.b1 = 0; this.b2 = -alpha / a0; }
    else if (this.kind === "lowpass") { this.b0 = (1 - cos) / 2 / a0; this.b1 = (1 - cos) / a0; this.b2 = this.b0; }
    else { this.b0 = (1 + cos) / 2 / a0; this.b1 = -(1 + cos) / a0; this.b2 = this.b0; }
    this.a1 = -2 * cos / a0; this.a2 = (1 - alpha) / a0;
  }

  run(x: number): number {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

const smooth = (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * x);
// Raised-cosine attack, hold and release, all in seconds from the start of the event.
const gate = (t: number, attack: number, length: number, release: number) =>
  t < 0 || t > length ? 0 : Math.min(smooth(t / attack), smooth((length - t) / release));
const decay = (t: number, attack: number, tau: number) => t < 0 ? 0 : smooth(t / attack) * Math.exp(-t / tau);
const lerp = (a: number, b: number, x: number) => a + (b - a) * Math.min(1, Math.max(0, x));

// Band-limited harmonic oscillator: harmonics roll off as 1/k^tilt below 9 kHz.
function harmonics(phase: number, f0: number, tilt: number): number {
  let sum = 0;
  for (let k = 1; k * f0 < 9000; k++) sum += Math.sin(k * phase) / k ** tilt;
  return sum;
}

// Damped inharmonic partials: [ratio, gain, decay seconds].
function strike(out: Float64Array, start: number, f0: number, partials: number[][], attack: number): void {
  for (let i = Math.floor(start * RATE); i < out.length; i++) {
    const t = i / RATE - start;
    let sum = 0;
    for (const [ratio, gain, tau] of partials) sum += gain! * Math.sin(TAU * f0 * ratio! * t) * Math.exp(-t / tau!);
    out[i]! += sum * smooth(t / attack);
  }
}

const tampon: Render = length => {
  const out = new Float64Array(length);
  const noise = random(1);
  const click = new Biquad("bandpass", 3400, 2.5);
  const body = new Biquad("lowpass", 420, 0.9);
  const rustle = new Biquad("highpass", 2600, 0.7);
  const rustleTop = new Biquad("lowpass", 7000, 0.7);
  const latch = new Biquad("bandpass", 2400, 3);
  let phase = 0;
  let grain = 0;
  for (let i = 0; i < length; i++) {
    const t = i / RATE;
    const n = noise();
    const hit = t - 0.06;
    out[i]! += 0.55 * click.run(n * decay(t - 0.045, 0.0008, 0.004));
    phase += TAU * lerp(170, 72, hit / 0.09) / RATE;
    out[i]! += 0.9 * Math.tanh(1.6 * Math.sin(phase) * decay(hit, 0.002, 0.075));
    out[i]! += 0.7 * body.run(n * decay(hit, 0.001, 0.03));
    out[i]! += decay(hit, 0.002, 0.06) * (0.18 * Math.sin(TAU * 230 * hit) + 0.1 * Math.sin(TAU * 480 * hit));
    if (i % 90 === 0) grain = Math.abs(noise()) ** 3;
    out[i]! += 0.35 * rustleTop.run(rustle.run(n * grain * gate(t - 0.1, 0.02, 0.26, 0.15)));
    out[i]! += 0.22 * latch.run(n * decay(t - 0.42, 0.0008, 0.005));
  }
  return out;
};

const rire: Render = length => {
  const out = new Float64Array(length);
  const noise = random(2);
  const puff = new Biquad("bandpass", 3000, 0.8);
  const formants = [new Biquad("bandpass", 950, 5), new Biquad("bandpass", 1500, 7), new Biquad("bandpass", 3100, 9)];
  const aspiration = new Biquad("bandpass", 1400, 1.2);
  const syllables: number[][] = [];
  let start = 0.24;
  // [start, length, f0 start, f0 end, gain, second formant]
  for (let k = 0; k < 8; k++) {
    const size = 0.12 - 0.004 * k;
    syllables.push([start, size, 540 - 14 * k, 495 - 14 * k, 1 - 0.035 * k, k % 2 ? 1380 : 1560]);
    start += size + 0.055 + 0.006 * k;
  }
  syllables.push([start + 0.03, 0.46, 470, 330, 0.95, 1450]);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / RATE;
    puff.tune(lerp(3000, 900, t / 0.16));
    let sample = 0.6 * puff.run(noise() * decay(t, 0.006, 0.045));
    const active = syllables.find(([at, size]) => t >= at! && t <= at! + size!);
    if (active) {
      const [at, size, from, to, gain, f2] = active as [number, number, number, number, number, number];
      const x = (t - at) / size;
      const final = size > 0.3;
      const f0 = final ? (x < 0.25 ? lerp(from, from * 1.1, x / 0.25) : lerp(from * 1.1, to, (x - 0.25) / 0.75)) : lerp(from, to, x);
      phase += TAU * f0 * (1 + (final ? 0.02 * Math.sin(TAU * 7 * (t - at)) : 0)) / RATE;
      formants[1]!.tune(f2);
      const env = gate(t - at, 0.012, size, final ? 0.2 : 0.035) * gain;
      const voiced = harmonics(phase, f0, 1.1) * smooth((t - at) / 0.03);
      const breath = aspiration.run(noise()) * (1 - smooth((t - at) / 0.035)) * 3;
      const source = (voiced + breath) * env;
      sample += formants[0]!.run(source) + 0.6 * formants[1]!.run(source) + 0.25 * formants[2]!.run(source);
    } else {
      phase = 0;
      for (const formant of formants) formant.run(0);
    }
    out[i] = sample;
  }
  return out;
};

const montee: Render = length => {
  const out = new Float64Array(length);
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  const tone = new Biquad("lowpass", 5200, 0.7);
  const speaker = new Biquad("highpass", 280, 0.7);
  const phases = notes.map(() => [0, 0]);
  for (let i = 0; i < length; i++) {
    const t = i / RATE;
    let sum = 0;
    notes.forEach((frequency, k) => {
      const at = 0.03 + 0.075 * k;
      const last = k === notes.length - 1;
      const local = t - at;
      if (local < 0) return;
      const env = last ? decay(local, 0.006, 0.38) : gate(local, 0.004, 0.11, 0.05);
      if (!env && local > 0.2) return;
      const bend = 1 - 0.012 * Math.exp(-local / 0.015);
      const p = phases[k]!;
      p[0]! += TAU * frequency * bend / RATE;
      p[1]! += TAU * frequency * bend * 2 / RATE;
      const voice = (q: number) => Math.sin(q) + 0.28 * Math.sin(3 * q) + 0.1 * Math.sin(5 * q);
      sum += env * (voice(p[0]!) + (last ? 0.18 * Math.sin(p[1]!) : 0)) * (0.8 + 0.05 * k);
    });
    out[i] = speaker.run(tone.run(sum));
  }
  return out;
};

const glassBell = [[1, 1, 0.5], [2.76, 0.32, 0.22], [5.4, 0.12, 0.09], [8.93, 0.04, 0.04]];

const brume: Render = length => {
  const out = new Float64Array(length);
  [659.25, 783.99, 987.77].forEach((frequency, k) => strike(out, 0.04 + 0.32 * k, frequency, glassBell.map(([r, g, tau]) => [r!, g!, tau! * 0.8]), 0.004));
  return out;
};

const coin: Render = length => {
  const out = new Float64Array(length);
  const noise = random(5);
  const formants = [new Biquad("bandpass", 720, 4), new Biquad("bandpass", 1250, 6), new Biquad("bandpass", 2600, 8)];
  const thump = new Biquad("lowpass", 260, 0.9);
  const hiss = new Biquad("bandpass", 1600, 1.5);
  const delay = new Float64Array(Math.round(0.007 * RATE));
  let phase = 0;
  let squeak = 0;
  for (let i = 0; i < length; i++) {
    const t = i / RATE;
    const q = t - 0.05;
    const f0 = q < 0.03 ? lerp(560, 640, q / 0.03) : lerp(640, 470, (q - 0.03) / 0.29);
    let sample = 0;
    if (q >= 0 && q <= 0.34) {
      phase += TAU * f0 / RATE;
      squeak += TAU * lerp(2400, 1950, q / 0.34) / RATE;
      const env = gate(q, 0.015, 0.34, 0.07) * (0.85 + 0.15 * smooth(q / 0.12));
      const source = harmonics(phase, f0, 0.8) * env;
      sample = formants[0]!.run(source) + 0.8 * formants[1]!.run(source) + 0.45 * formants[2]!.run(source);
      sample += 0.12 * Math.sin(squeak) * env;
    } else for (const formant of formants) formant.run(0);
    sample += 0.8 * thump.run(noise() * decay(q + 0.005, 0.002, 0.03));
    sample += 0.05 * hiss.run(noise()) * gate(q - 0.33, 0.02, 0.12, 0.09);
    const slot = i % delay.length;
    const echo = delay[slot]!;
    delay[slot] = sample + 0.28 * echo;
    out[i] = sample + 0.3 * echo;
  }
  return out;
};

const ding: Render = length => {
  const out = new Float64Array(length);
  strike(out, 0.02, 1320, [[1, 1, 0.42], [2, 0.08, 0.2], [2.98, 0.16, 0.12], [4.1, 0.05, 0.05]], 0.005);
  return out;
};

const clochette: Render = length => {
  const out = new Float64Array(length);
  const bell = [[0.5, 0.18, 0.75], [1, 1, 0.55], [1.183, 0.42, 0.42], [1.506, 0.3, 0.32], [2, 0.36, 0.26], [2.514, 0.14, 0.16], [2.662, 0.1, 0.13], [3.011, 0.06, 0.09]];
  strike(out, 0.015, 1900, bell, 0.0015);
  strike(out, 0.015, 1903.5, bell.slice(0, 2).map(([ratio, gain, tau]) => [ratio!, gain! * 0.5, tau!]), 0.0015);
  return out;
};

// Every frequency is a multiple of 1/4 Hz, so 4 seconds hold an exact number of periods.
const bourdonnement: Render = length => {
  const out = new Float64Array(length);
  const layers = [[110, 1], [110.5, 0.55], [109.75, 0.55], [220, 0.45], [330, 0.2], [165, 0.25], [440.25, 0.06]];
  for (let i = 0; i < length; i++) {
    const t = i / RATE;
    let sum = 0;
    for (const [frequency, gain] of layers) sum += gain! * Math.sin(TAU * frequency! * t + frequency!);
    out[i] = sum * (0.8 + 0.2 * Math.sin(TAU * 1 * t)) * (0.95 + 0.05 * Math.sin(TAU * 0.25 * t));
  }
  return out;
};

const sifflement: Render = length => {
  const out = new Float64Array(length);
  const noise = random(9);
  const air = new Biquad("bandpass", 1400, 6);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / RATE;
    const x = (t - 0.04) / 1.35;
    if (x < 0 || x > 1) { air.run(0); continue; }
    const f0 = lerp(1650, 1150, x) + 260 * Math.sin(TAU * 2.4 * (t - 0.04));
    phase += TAU * f0 / RATE;
    air.tune(f0);
    const env = gate(x, 0.08, 1, 0.3) * (0.3 + 0.7 * Math.sin(Math.PI * x) ** 2);
    out[i] = env * (Math.sin(phase) + 0.12 * Math.sin(2 * phase) + 0.9 * air.run(noise()));
  }
  return out;
};

export const RENDERS: Record<string, Render> = {
  "tampon-administratif": tampon,
  "rire-requin": rire,
  "montee-niveau": montee,
  "jingle-brume": brume,
  "coin-coin": coin,
  "ding-reunion": ding,
  "clochette-boulangerie": clochette,
  "bourdonnement-orbe": bourdonnement,
  "sifflement-mini-requin": sifflement,
};

export function render(name: string, seconds: number, loop = false): Float64Array {
  const recipe = RENDERS[name];
  if (!recipe) throw new Error(`Recette de synthèse inconnue : ${name}`);
  const samples = recipe(Math.round(seconds * RATE));
  // One-shots end with a 250 ms fade so a cut resonance cannot click.
  const fade = loop ? 0 : Math.round(0.25 * RATE);
  for (let i = 0; i < fade; i++) samples[samples.length - 1 - i]! *= smooth(i / fade);
  const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  if (!Number.isFinite(peak) || peak === 0) throw new Error(`Synthèse vide ou instable : ${name}`);
  return samples.map(value => value * 0.89 / peak);
}

export function encode(samples: Float64Array): Buffer {
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write("RIFF", 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(RATE, 24); wav.writeUInt32LE(RATE * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) => wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), 44 + i * 2));
  return wav;
}

// Synthesised sources, keyed by the file path their effect declares in effects.json.
export function synthesised(root: string) {
  return loadEffects(root).flatMap(effect => effect.source.kind === "file" && effect.name in RENDERS
    ? [{ effect, path: resolve(root, "sounds/sources", effect.source.path) }] : []);
}

if (import.meta.main) {
  const check = process.argv[2] === "--check";
  let stale = 0;
  for (const { effect, path } of synthesised(ROOT)) {
    const wav = encode(render(effect.name, effect.durationSeconds, effect.loop));
    if (check) {
      const same = existsSync(path) && readFileSync(path).equals(wav);
      if (!same) stale++;
      console.log(`${effect.name} : ${same ? "à jour" : "différent de la recette"}`);
    } else {
      writeFileSync(path, wav);
      console.log(`${effect.name} : ${effect.durationSeconds} s → sounds/sources/${effect.source.kind === "file" ? effect.source.path : ""}`);
    }
  }
  if (stale) process.exitCode = 1;
}
